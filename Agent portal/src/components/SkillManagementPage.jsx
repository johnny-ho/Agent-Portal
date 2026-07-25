/* ════════════════════════════════════════
   SKILL MANAGEMENT PAGE (v3)
   AntD 遷移 Phase 3（見 brain/concepts/antd-migration-plan.md）
   主場景：Table（Skill 清單）+ Modal（詳情 / 從 KM 引入）。
   五階段管理流程：Draft → Testing → Approving → Pilot Run → Production
   註：主元件函式名稱維持 SOPManagementPage，以相容 SettingPage 知識管理 tab。
   ════════════════════════════════════════ */

const SKILL_STAGES = ['draft', 'testing', 'approving', 'pirun', 'production'];

const SKILL_STAGE_CFG = {
  draft:      { label: 'Draft',      color: '#2563EB', bg: 'rgba(37,99,235,0.08)',  border: 'rgba(37,99,235,0.2)'  },
  testing:    { label: 'Testing',    color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
  approving:  { label: 'Approving',  color: '#2563EB', bg: 'rgba(37,99,235,0.08)',  border: 'rgba(37,99,235,0.2)'  },
  pirun:      { label: 'Pilot Run',  color: '#22C55E', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)'  },
  production: { label: 'Production', color: '#22C55E', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)'  },
};

/* 清單欄寬（Table columns 共用常數）*/
const SK_COL_W = { stage: 104, importer: 112, date: 104, action: 232 };

/* ── 以下為純函式：不得呼叫 hooks（原檔誤呼叫 useTheme 已移除）── */

function getStageActionLabel(stage) {
  switch (stage) {
    case 'draft':     return '確認內容，進入 Testing';
    case 'testing':   return '測試通過，送出審批';
    case 'approving': return '簽核完成，進入 Pilot Run';
    case 'pirun':     return '確認通過，升為 Production';
    default:          return null;
  }
}

function getDescription(skill) {
  var chunks = skill.ragChunks || [];
  if (chunks.length > 0 && chunks[0].content) {
    var c = chunks[0].content.trim();
    return c.length > 120 ? c.slice(0, 120) + '…' : c;
  }
  return skill.sourceKM || '';
}

/* 推導 廠 / 部 / 課 from persona */
function deriveSiteDeptSection(p) {
  var name = p.name || '';
  var site = '—';
  var dept = '—';
  /* 廠：取 name 中非「課」結尾的第一段（如 "ETC"） */
  var parts = name.split(' ');
  if (parts.length > 1 && !/課$/.test(parts[0])) site = parts[0];
  else site = 'ETC';
  /* 部：從課名推算 */
  if (name.indexOf('設備') !== -1)      dept = '設備部';
  else if (name.indexOf('製程') !== -1) dept = '製程部';
  else if (name.indexOf('製造') !== -1) dept = '製造部';
  else if (name.indexOf('品管') !== -1) dept = '品管部';
  else if (name.indexOf('工程') !== -1) dept = '工程部';
  /* 課：直接用 p.name */
  return { site: site, dept: dept, section: name };
}

/* 將所有 chunk 的 numbered content 解析成扁平的單步陣列 */
function parseStepsFromChunks(chunks) {
  var steps = [];
  chunks.forEach(function(chunk) {
    var content = (chunk.content || '').trim();
    /* 只處理有 "1. " 這類格式的 chunk */
    if (!/\d+\.\s/.test(content)) return;
    var parts = content.split(/(?=\d+\.\s)/);
    parts.forEach(function(part) {
      var match = part.trim().match(/^(\d+)\.\s+([\s\S]+)/);
      if (match) {
        steps.push({ num: parseInt(match[1], 10), text: match[2].replace(/。\s*$/, '').trim() });
      }
    });
  });
  steps.sort(function(a, b) { return a.num - b.num; });
  return steps;
}

/* ── 適用範圍：結構化條件的白話描述 ──
   scope 是勾出來的條件，不是一句自由文字，所以可以直接算出「目前符合哪幾台」。*/
const SK_TRIGGER_LABEL = {
  alarm:     '警報觸發',
  schedule:  '排程觸發',
  threshold: '數值門檻',
  manual:    '人工調用',
};

function describeTrigger(trigger) {
  if (!trigger || !trigger.type) return '未設定';
  var base = SK_TRIGGER_LABEL[trigger.type] || trigger.type;
  if (trigger.code)   return base + '（' + trigger.code + '）';
  if (trigger.level)  return base + '（' + trigger.level + '）';
  if (trigger.at)     return base + '（' + trigger.at + '）';
  if (trigger.metric) return base + '（' + trigger.metric + ' ' + (trigger.op || '') + ' ' + (trigger.value || '') + '）';
  return base;
}

/* 回傳左欄要列的條件行；空陣列一律顯示為「全部」而非留白 */
function describeScope(scope) {
  var s = scope || {};
  return [
    { label: '機台類別', value: (s.equipmentClass && s.equipmentClass.length) ? s.equipmentClass.join('、') : '全部類別' },
    { label: '指定機台', value: (s.equipmentIds   && s.equipmentIds.length)   ? s.equipmentIds.join('、')   : '該類別全部' },
    { label: '區域',     value: (s.area           && s.area.length)           ? s.area.join('、')           : '全區' },
    { label: '觸發條件', value: describeTrigger(s.trigger) },
  ];
}

/* 非步驟、非注意事項的 chunk（如「適用情境」「前置確認」） */
function getInfoChunks(chunks) {
  return chunks.filter(function(chunk) {
    var label = chunk.label || '';
    var content = (chunk.content || '').trim();
    return label.indexOf('注意') === -1 && !/\d+\.\s/.test(content);
  });
}

/* ════════════════════════════════════════
   StatusTag — 階段標籤（AntD Tag）
   ════════════════════════════════════════ */
function StatusTag({ stage }) {
  var { fz } = useTheme();
  var cfg = SKILL_STAGE_CFG[stage];
  if (!cfg) return null;
  return (
    <antd.Tag style={{
      marginInlineEnd: 0, borderRadius: 999,
      color: cfg.color, background: cfg.bg, borderColor: cfg.border,
      fontSize: fz(11), fontWeight: 600, lineHeight: '18px', paddingInline: 10,
    }}>{cfg.label}</antd.Tag>
  );
}

/* ════════════════════════════════════════
   InfoRow — 左欄小區塊
   ════════════════════════════════════════ */
function InfoRow({ label, children }) {
  var { C, fz } = useTheme();
  return (
    <div>
      <div style={{ fontSize: fz(11), fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{label}</div>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════
   Modal 左欄 — 基本資訊
   ════════════════════════════════════════ */
function ModalInfoPanel({ skill, p, onTagsChange }) {
  var { C, fz } = useTheme();
  var cfg = SKILL_STAGE_CFG[skill.stage];
  var loc = deriveSiteDeptSection(p);

  /* ── 可編輯標籤 state ── */
  var [tags, setTags]         = React.useState(skill.tags || []);
  var [addInput, setAddInput] = React.useState('');

  function removeTag(t) {
    var next = tags.filter(function(x) { return x !== t; });
    setTags(next);
    onTagsChange && onTagsChange(next);
  }

  function addTag() {
    var val = addInput.trim();
    if (!val || tags.indexOf(val) !== -1) { setAddInput(''); return; }
    var next = tags.concat([val]);
    setTags(next);
    setAddInput('');
    onTagsChange && onTagsChange(next);
  }

  return (
    <div style={{
      width: 272, flexShrink: 0,
      borderRight: '1px solid ' + C.border,
      padding: '24px 24px',
      overflowY: 'auto',
      background: C.bgSub,
      display: 'flex', flexDirection: 'column', gap: 24,
    }} className="scrollbar-thin">

      {/* 狀態 */}
      <InfoRow label="狀態">
        <StatusTag stage={skill.stage} />
      </InfoRow>

      {/* 廠 / 部 / 課 */}
      <InfoRow label="所屬單位">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[['廠', loc.site], ['部', loc.dept], ['課', loc.section]].map(function(item) {
            return (
              <div key={item[0]} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted, width: 16, flexShrink: 0 }}>{item[0]}</span>
                <span style={{ fontSize: fz(13), color: C.text }}>{item[1]}</span>
              </div>
            );
          })}
        </div>
      </InfoRow>

      {/* 引入者 */}
      <InfoRow label="引入者">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: cfg.bg, border: '1px solid ' + cfg.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fz(12), fontWeight: 700, color: cfg.color, flexShrink: 0 }}>
            {(skill.importedBy || '?')[0]}
          </div>
          <div>
            <div style={{ fontSize: fz(14), color: C.text, fontWeight: 500 }}>{skill.importedBy || '—'}</div>
            <div style={{ fontSize: fz(12), color: C.textMuted }}>{skill.importedAt || '—'}</div>
          </div>
        </div>
      </InfoRow>

      {/* 來源 */}
      {skill.sourceKM && (
        <InfoRow label="來源">
          <div style={{ fontSize: fz(12), color: C.textSub, fontFamily: 'monospace', background: C.bgPanel, border: '1px solid ' + C.border, borderRadius: 6, padding: '8px 8px', lineHeight: 1.5, wordBreak: 'break-all' }}>
            {skill.sourceKM}
          </div>
        </InfoRow>
      )}

      {/* 標籤（可編輯：AntD Tag closable + Input） */}
      <InfoRow label="標籤">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          {tags.map(function(t) {
            return (
              <antd.Tag
                key={t}
                closable
                onClose={function(e) { e.preventDefault(); removeTag(t); }}
                style={{ marginInlineEnd: 0, fontSize: fz(11), borderRadius: 4, background: C.bg, color: C.textSub, borderColor: C.border }}
              >{t}</antd.Tag>
            );
          })}
        </div>
        {/* 新增 tag 輸入 */}
        <antd.Space.Compact style={{ width: '100%' }}>
          <antd.Input
            size="small"
            value={addInput}
            onChange={function(e) { setAddInput(e.target.value); }}
            onPressEnter={addTag}
            placeholder="新增標籤…"
          />
          <antd.Button size="small" onClick={addTag}>＋</antd.Button>
        </antd.Space.Compact>
      </InfoRow>

      {/* 適用範圍（結構化條件 + 目前符合幾台）*/}
      <InfoRow label="適用範圍">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {describeScope(skill.scope).map(function(row) {
            return (
              <div key={row.label} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                <span style={{ fontSize: fz(11), color: C.textMuted, width: 56, flexShrink: 0 }}>{row.label}</span>
                <span style={{ fontSize: fz(13), color: C.text, lineHeight: 1.5 }}>{row.value}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 8, fontSize: fz(12), color: '#2563EB', fontWeight: 600 }}>
          目前符合 {matchScopeTargets(p.key, skill.scope).length} 台
        </div>
      </InfoRow>
    </div>
  );
}

/* ════════════════════════════════════════
   Modal 右欄 Section Header
   ════════════════════════════════════════ */
function SkillSectionHeader({ icon, title, badge }) {
  var { C, fz } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      {icon && <span style={{ fontSize: fz(14) }}>{icon}</span>}
      <span style={{ fontSize: fz(13), fontWeight: 700, color: C.text, letterSpacing: '0.01em' }}>{title}</span>
      {badge && (
        <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), background: C.bgPanel, color: C.textMuted }}>{badge}</antd.Tag>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   Modal 右欄 — Skill 執行步驟（ragChunks 解析後攤平）
   ════════════════════════════════════════ */
function OperationStepsSection({ skill }) {
  var { C, fz } = useTheme();
  var chunks     = skill.ragChunks || [];
  var steps      = parseStepsFromChunks(chunks);
  var infoChunks = getInfoChunks(chunks);

  return (
    <div style={{ marginBottom: 32 }}>

      {/* 前置資訊區（適用情境、前置確認等非步驟 chunk）→ Card */}
      {infoChunks.length > 0 && (
        <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {infoChunks.map(function(chunk) {
            return (
              <antd.Card
                key={chunk.id}
                size="small"
                title={<span style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{chunk.label}</span>}
                styles={{ header: { background: C.bgPanel, minHeight: 32 }, body: { padding: 16 } }}
              >
                <div style={{ fontSize: fz(14), color: C.textSub, lineHeight: 1.7 }}>{chunk.content}</div>
              </antd.Card>
            );
          })}
        </div>
      )}

      {/* 執行步驟標題 */}
      <SkillSectionHeader icon="📋" title="Skill 執行步驟" badge={steps.length > 0 ? steps.length + ' 個步驟' : null} />

      {/* 步驟為空時 */}
      {steps.length === 0 && (
        <antd.Empty
          image={antd.Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span style={{ fontSize: fz(13), color: C.textMuted }}>尚無執行步驟內容</span>}
          style={{ padding: 24, background: C.bgPanel, borderRadius: 8, border: '1px solid ' + C.border, margin: 0 }}
        />
      )}

      {/* 攤平後的單步清單 → Timeline（連接線由 AntD 提供） */}
      {steps.length > 0 && (
        <antd.Timeline
          items={steps.map(function(step) {
            return {
              key: step.num,
              dot: (
                <span style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: '#2563EB', color: '#FFFFFF',
                  fontSize: fz(12), fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{step.num}</span>
              ),
              children: (
                <div style={{ fontSize: fz(14), color: C.textSub, lineHeight: 1.7, background: C.bgSub, border: '1px solid ' + C.border, borderRadius: 8, padding: '8px 16px' }}>
                  {step.text}
                </div>
              ),
            };
          })}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   Modal 右欄 — 管理狀態（依 stage 不同）
   ════════════════════════════════════════ */
function ManagementSection({ skill, p, signingSubmitted, setSigningSubmitted }) {
  var { C, fz } = useTheme();
  switch (skill.stage) {

    case 'draft':
      return null; /* Draft 只有操作步驟，不需管理狀態 */

    case 'testing': {
      var testLog   = skill.testLog || [];
      var passCount = testLog.filter(function(l) { return l.result === 'pass'; }).length;
      return (
        <div style={{ marginBottom: 32 }}>
          <SkillSectionHeader icon="🧪" title="測試記錄" badge={passCount + ' / ' + testLog.length + ' 通過'} />
          <antd.List
            bordered
            size="small"
            dataSource={testLog}
            locale={{ emptyText: <span style={{ fontSize: fz(13), color: C.textMuted }}>尚無測試記錄</span> }}
            renderItem={function(log) {
              var isPass = log.result === 'pass';
              return (
                <antd.List.Item style={{ alignItems: 'flex-start', gap: 8 }}>
                  <antd.Tag
                    bordered={false}
                    style={{
                      marginInlineEnd: 0, borderRadius: 999, flexShrink: 0,
                      fontSize: fz(11), fontWeight: 700,
                      color: isPass ? '#22C55E' : '#F97316',
                      background: isPass ? 'rgba(34,197,94,0.08)' : 'rgba(249,115,22,0.08)',
                    }}
                  >{isPass ? 'PASS' : 'FAIL'}</antd.Tag>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: fz(14), color: C.text, marginBottom: 4, fontWeight: 500 }}>「{log.query}」</div>
                    <div style={{ fontSize: fz(12), color: C.textMuted }}>{log.time} · {log.user} — {log.note}</div>
                  </div>
                </antd.List.Item>
              );
            }}
          />
          <antd.Button size="small" type="dashed" style={{ marginTop: 16 }}>＋ 新增測試查詢</antd.Button>
        </div>
      );
    }

    case 'approving': {
      var approvers   = skill.approvers || [];
      var approvedCnt = approvers.filter(function(a) { return a.approved; }).length;
      return (
        <div style={{ marginBottom: 32 }}>
          <SkillSectionHeader icon="✍️" title="簽核狀態" badge={'已通過 ' + approvedCnt + ' / ' + approvers.length} />
          <antd.List
            bordered
            size="small"
            dataSource={approvers}
            style={{ marginBottom: 16 }}
            locale={{ emptyText: <span style={{ fontSize: fz(13), color: C.textMuted }}>尚無簽核人員</span> }}
            renderItem={function(apv) {
              return (
                <antd.List.Item>
                  <antd.List.Item.Meta
                    avatar={<Avatar char={apv.avatar} size={28} color={apv.approved ? '#22C55E' : C.textSub} />}
                    title={<span style={{ fontSize: fz(14), fontWeight: 500, color: C.text }}>{apv.name}</span>}
                    description={<span style={{ fontSize: fz(12), color: C.textMuted }}>{apv.role}</span>}
                  />
                  {apv.approved
                    ? <antd.Space size={8}>
                        <antd.Tag style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), fontWeight: 600, color: '#22C55E', background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.2)' }}>✓ 通過</antd.Tag>
                        <span style={{ fontSize: fz(11), color: C.textMuted }}>{apv.time}</span>
                      </antd.Space>
                    : <antd.Tag style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), fontWeight: 600, color: '#F59E0B', background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.2)' }}>待審核</antd.Tag>
                  }
                </antd.List.Item>
              );
            }}
          />
          {!signingSubmitted
            ? <antd.Button onClick={function() { setSigningSubmitted(true); }}>📤 送出簽核至課內簽核系統</antd.Button>
            : <div style={{ fontSize: fz(12), color: '#22C55E', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: fz(14) }}>✓</span> 已送出簽核
              </div>
          }
        </div>
      );
    }

    case 'pirun': {
      return null;
    }

    case 'production': {
      var targets = matchScopeTargets(p.key, skill.scope);
      var prodItems = [
        { key: 'scope', label: '適用範圍', children: targets.length > 0 ? (targets.length + ' 台：' + targets.map(function(t) { return t.id; }).join('、')) : '無符合的機台' },
      ];
      if (skill.productionDate) prodItems.push({ key: 'date', label: '生效日期', children: skill.productionDate });
      if (skill.approvedBy)     prodItems.push({ key: 'by', label: '核准人', children: skill.approvedBy });
      return (
        <div style={{ marginBottom: 32 }}>
          <SkillSectionHeader icon="✅" title="生效資訊" />
          <antd.Descriptions
            bordered
            size="small"
            column={1}
            items={prodItems}
            labelStyle={{ fontSize: fz(12), color: C.textMuted, width: 96 }}
            contentStyle={{ fontSize: fz(14), color: C.text }}
          />
        </div>
      );
    }

    default: return null;
  }
}

/* ════════════════════════════════════════
   SkillDetailModal — 主彈窗（AntD Modal）
   ════════════════════════════════════════ */
function SkillDetailModal({ skill, p, onClose, onAdvance, onDelete, onSave }) {
  var { C, fz } = useTheme();
  var [editMode, setEditMode]                 = React.useState(false);
  var [editTitle, setEditTitle]               = React.useState(skill.title);
  var [editSource, setEditSource]             = React.useState(skill.sourceKM || '');
  var [editTags, setEditTags]                 = React.useState(skill.tags || []);
  var [signingSubmitted, setSigningSubmitted] = React.useState(skill.submittedToSigning || false);
  var actionLabel = getStageActionLabel(skill.stage);

  function handleSave() {
    onSave(Object.assign({}, skill, { title: editTitle.trim(), sourceKM: editSource.trim(), tags: editTags }));
    setEditMode(false);
  }

  var noteChunk = (skill.ragChunks || []).find(function(c) { return (c.label || '').indexOf('注意') !== -1; });
  var noteText = noteChunk ? noteChunk.content : ('此 Skill 僅限 ' + p.name + ' 本課使用，不開放跨課調閱或複製。如需跨課共享，請向課長申請授權。');

  var titleNode = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 24 }}>
      <StatusTag stage={skill.stage} />
      {editMode
        ? <antd.Input
            value={editTitle}
            onChange={function(e) { setEditTitle(e.target.value); }}
            autoFocus
            style={{ flex: 1, fontWeight: 600, fontSize: fz(16) }}
          />
        : <span style={{ flex: 1, fontWeight: 600, fontSize: fz(18), color: C.text }}>{skill.title}</span>
      }
    </div>
  );

  var footerNode = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <antd.Popconfirm
        title="確定刪除此 Skill？"
        okText="刪除"
        okButtonProps={{ danger: true }}
        cancelText="取消"
        onConfirm={onDelete}
      >
        <antd.Button danger>刪除</antd.Button>
      </antd.Popconfirm>
      <div style={{ flex: 1 }} />
      {editMode
        ? <React.Fragment>
            <antd.Button onClick={function() { setEditMode(false); setEditTitle(skill.title); setEditSource(skill.sourceKM || ''); }}>取消</antd.Button>
            <antd.Button type="primary" onClick={handleSave}>儲存</antd.Button>
          </React.Fragment>
        : <React.Fragment>
            <antd.Button onClick={function() { setEditMode(true); }}>✎ 編輯</antd.Button>
            {actionLabel && (
              <antd.Button type="primary" onClick={onAdvance}>▶ {actionLabel}</antd.Button>
            )}
          </React.Fragment>
      }
    </div>
  );

  return (
    <antd.Modal
      open
      centered
      width={1000}
      title={titleNode}
      footer={footerNode}
      onCancel={onClose}
      styles={{
        body: { padding: 0, display: 'flex', height: '64vh', overflow: 'hidden' },
        footer: { marginTop: 0, padding: '16px 24px', borderTop: '1px solid ' + C.border, background: C.bgSub },
        header: { marginBottom: 0, padding: '16px 24px', borderBottom: '1px solid ' + C.border },
        content: { padding: 0, overflow: 'hidden' },
      }}
    >
      {/* 左欄：基本資訊 */}
      <ModalInfoPanel
        skill={editMode ? Object.assign({}, skill, { sourceKM: editSource, tags: editTags }) : Object.assign({}, skill, { tags: editTags })}
        p={p}
        onTagsChange={setEditTags}
      />

      {/* 右欄：操作步驟 + 管理狀態 + 注意事項 */}
      <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '24px 32px' }} className="scrollbar-thin">

        {/* 編輯來源路徑（edit mode） */}
        {editMode && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: fz(12), color: C.textSub, fontWeight: 600, marginBottom: 8 }}>來源路徑</div>
            <antd.Input
              value={editSource}
              onChange={function(e) { setEditSource(e.target.value); }}
              style={{ fontFamily: 'monospace', fontSize: fz(13) }}
            />
          </div>
        )}

        {/* 操作步驟 */}
        <OperationStepsSection skill={skill} />

        {/* 管理狀態 */}
        <ManagementSection
          skill={skill}
          p={p}
          signingSubmitted={signingSubmitted}
          setSigningSubmitted={setSigningSubmitted}
        />

        {/* 注意事項：優先顯示 ragChunks 裡的注意事項，無則顯示通用提醒 */}
        <antd.Alert
          type="warning"
          showIcon
          message={<span style={{ fontSize: fz(13), fontWeight: 600 }}>注意事項</span>}
          description={<span style={{ fontSize: fz(13), lineHeight: 1.6 }}>{noteText}</span>}
        />
      </div>
    </antd.Modal>
  );
}

/* ════════════════════════════════════════
   SkillImportModal — 從 KM 引入（AntD Modal + Form）
   ════════════════════════════════════════ */
function SkillImportModal({ p, onClose, onImport }) {
  var { C, fz } = useTheme();
  var [title, setTitle]   = React.useState('');
  var [source, setSource] = React.useState('Confluence · ' + p.name + ' / ');
  var canSubmit = title.trim().length > 0;

  return (
    <antd.Modal
      open
      centered
      width={480}
      title={<span style={{ fontSize: fz(16), fontWeight: 600 }}>從 KM 系統引入 Skill</span>}
      onCancel={onClose}
      okText="引入並開始 AI 解析"
      cancelText="取消"
      okButtonProps={{ disabled: !canSubmit }}
      onOk={function() { if (canSubmit) onImport(title.trim(), source.trim()); }}
    >
      <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 24 }}>
        引入後由 AI 自動解析為知識內容，進入 Draft 階段等待確認。
      </div>
      <antd.Form layout="vertical" requiredMark={false}>
        <antd.Form.Item label={<span style={{ fontSize: fz(12), color: C.textSub }}>Skill 名稱</span>} style={{ marginBottom: 16 }}>
          <antd.Input
            value={title}
            onChange={function(e) { setTitle(e.target.value); }}
            placeholder="例：E-101 換件標準程序 v3.1"
          />
        </antd.Form.Item>
        <antd.Form.Item label={<span style={{ fontSize: fz(12), color: C.textSub }}>來源（Confluence 頁面路徑）</span>} style={{ marginBottom: 0 }}>
          <antd.Input
            value={source}
            onChange={function(e) { setSource(e.target.value); }}
            style={{ fontFamily: 'monospace', fontSize: fz(13) }}
          />
        </antd.Form.Item>
      </antd.Form>
    </antd.Modal>
  );
}

/* ════════════════════════════════════════
   Skill 清單欄位（AntD Table columns）
   ════════════════════════════════════════ */
function useSkillColumns({ onOpen, onDelete, onAdvance }) {
  var { C, fz } = useTheme();

  return [
    {
      title: '狀態', dataIndex: 'stage', key: 'stage', width: SK_COL_W.stage,
      render: function(v) { return <StatusTag stage={v} />; },
    },
    {
      title: 'Skill 名稱', dataIndex: 'title', key: 'title',
      render: function(v, r) {
        var description = getDescription(r);
        return (
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontWeight: 600, fontSize: fz(14), color: C.text,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{v}</div>
            {description && (
              <div style={{
                fontSize: fz(12), color: C.textMuted, lineHeight: 1.5, marginTop: 4,
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
              }}>{description}</div>
            )}
          </div>
        );
      },
    },
    {
      title: '引入者', dataIndex: 'importedBy', key: 'importedBy', width: SK_COL_W.importer,
      render: function(v) { return <span style={{ fontSize: fz(12), color: C.textSub }}>{v || '—'}</span>; },
    },
    {
      title: '引入日期', dataIndex: 'importedAt', key: 'importedAt', width: SK_COL_W.date,
      render: function(v) { return <span style={{ fontSize: fz(12), color: C.textMuted }}>{v || '—'}</span>; },
    },
    {
      title: '操作', key: 'action', width: SK_COL_W.action, align: 'right',
      render: function(_, r) {
        var actionLabel = getStageActionLabel(r.stage);
        var cfg = SKILL_STAGE_CFG[r.stage];
        return (
          <antd.Space size={8} onClick={function(e) { e.stopPropagation(); }}>
            <antd.Popconfirm
              title="確定刪除此 Skill？"
              okText="刪除"
              okButtonProps={{ danger: true }}
              cancelText="取消"
              onConfirm={function() { onDelete(r.id); }}
            >
              <antd.Button size="small" danger title="刪除">✕</antd.Button>
            </antd.Popconfirm>
            <antd.Button size="small" title="編輯" onClick={function() { onOpen(r); }}>✎</antd.Button>
            {actionLabel && (
              <antd.Button size="small" type="primary" onClick={function() { onAdvance(r.id); }}>▶ {cfg.label}</antd.Button>
            )}
          </antd.Space>
        );
      },
    },
  ];
}

/* ════════════════════════════════════════
   主頁面（函式名稱維持 SOPManagementPage 以相容 SettingPage）
   ════════════════════════════════════════ */
function SOPManagementPage({ p, onBack }) {
  var { C, fz } = useTheme();
  var [filter, setFilter]           = React.useState('all');
  var [skills, setSkills]           = React.useState(p.knowledge.sopManagement || []);
  var [showImport, setShowImport]   = React.useState(false);
  var [selectedSkill, setSelected]  = React.useState(null);
  var [searchQuery, setSearch]      = React.useState('');
  var [sortBy, setSortBy]           = React.useState('newest');

  function advanceStage(id) {
    setSkills(function(prev) {
      return prev.map(function(s) {
        if (s.id !== id) return s;
        var idx = SKILL_STAGES.indexOf(s.stage);
        return idx < SKILL_STAGES.length - 1 ? Object.assign({}, s, { stage: SKILL_STAGES[idx + 1] }) : s;
      });
    });
    setSelected(null);
  }

  function deleteSkill(id) {
    setSkills(function(prev) { return prev.filter(function(s) { return s.id !== id; }); });
    setSelected(null);
  }

  function saveSkill(updated) {
    setSkills(function(prev) {
      return prev.map(function(s) { return s.id === updated.id ? updated : s; });
    });
    setSelected(updated);
  }

  function handleImport(title, source) {
    var newSkill = {
      id: 'sk-new-' + Date.now(),
      title: title,
      sourceKM: source,
      importedAt: '2026-04-28',
      importedBy: p.user.name,
      stage: 'draft',
      tags: ['新引入'],
      ragChunks: [
        { id: 'c1', label: 'AI 解析中', content: '正在將 Confluence 頁面內容轉換為知識內容，請稍候…' },
      ],
    };
    setSkills(function(prev) { return [newSkill].concat(prev); });
    setShowImport(false);
    setSelected(newSkill);
  }

  var columns = useSkillColumns({
    onOpen: function(skill) { setSelected(skill); },
    onDelete: deleteSkill,
    onAdvance: advanceStage,
  });

  var counts = {};
  SKILL_STAGES.forEach(function(s) { counts[s] = skills.filter(function(x) { return x.stage === s; }).length; });

  var displayed = skills
    .filter(function(s) { return filter === 'all' || s.stage === filter; })
    .filter(function(s) {
      if (!searchQuery.trim()) return true;
      var q = searchQuery.toLowerCase();
      return s.title.toLowerCase().indexOf(q) !== -1 ||
             (s.importedBy || '').toLowerCase().indexOf(q) !== -1;
    })
    .sort(function(a, b) {
      if (sortBy === 'newest') return b.importedAt.localeCompare(a.importedAt);
      if (sortBy === 'oldest') return a.importedAt.localeCompare(b.importedAt);
      if (sortBy === 'name')   return a.title.localeCompare(b.title, 'zh');
      if (sortBy === 'stage')  return SKILL_STAGES.indexOf(a.stage) - SKILL_STAGES.indexOf(b.stage);
      return 0;
    });

  /* 階段膠囊（Segmented）標籤：文字 + 筆數 */
  function stageLabel(text, count, active) {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: active ? '#FFFFFF' : C.textMuted, fontWeight: active ? 600 : 400 }}>
        {text}
        <span style={{
          fontSize: fz(10), padding: '0 8px', borderRadius: 999,
          background: active ? 'rgba(255,255,255,0.25)' : C.hover,
          color: active ? '#FFFFFF' : C.textMuted,
        }}>{count}</span>
      </span>
    );
  }

  var stageOptions = [{ value: 'all', label: stageLabel('全部', skills.length, filter === 'all') }].concat(
    SKILL_STAGES.map(function(s) {
      return { value: s, label: stageLabel(SKILL_STAGE_CFG[s].label, counts[s] || 0, filter === s) };
    })
  );

  var toolLabel = { fontSize: fz(11), color: C.textMuted, flexShrink: 0 };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: C.bg }}>

      {/* Header */}
      <div style={{ padding: '8px 24px', borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: fz(14), color: C.text }}>Skill 管理</div>
          <div style={{ fontSize: fz(12), color: C.textMuted }}>{p.name} · 同課審批 · 不可跨課使用</div>
        </div>
        <div style={{ flex: 1 }} />
        <antd.Button type="primary" onClick={function() { setShowImport(true); }}>＋ 從 KM 引入 Skill</antd.Button>
      </div>

      {/* Search + Sort（欄位一律有 label，不以 placeholder 代替）*/}
      <div style={{ padding: '8px 24px', borderBottom: '1px solid ' + C.border, display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <span style={toolLabel}>搜尋</span>
        <antd.Input
          allowClear
          value={searchQuery}
          onChange={function(e) { setSearch(e.target.value); }}
          prefix={<span style={{ color: C.textMuted, fontSize: fz(12) }}>🔍</span>}
          placeholder="標題、人員…"
          style={{ flex: 1 }}
        />
        <span style={{ ...toolLabel, marginLeft: 8 }}>排序</span>
        <antd.Select
          value={sortBy}
          onChange={setSortBy}
          style={{ width: 128, flexShrink: 0 }}
          options={[
            { value: 'newest', label: '最新引入' },
            { value: 'oldest', label: '最舊優先' },
            { value: 'name',   label: '名稱 A→Z' },
            { value: 'stage',  label: '狀態順序' },
          ]}
        />
      </div>

      {/* Stage filter → Segmented（選中背景 #2563EB 依 guideline，以巢狀 ConfigProvider 侷限於本頁）*/}
      <div style={{ padding: '8px 24px', borderBottom: '1px solid ' + C.border, display: 'flex', flexShrink: 0, overflowX: 'auto' }} className="scrollbar-none">
        <antd.ConfigProvider theme={{ components: { Segmented: { itemSelectedBg: '#2563EB', itemSelectedColor: '#FFFFFF' } } }}>
          <antd.Segmented
            size="small"
            value={filter}
            onChange={setFilter}
            options={stageOptions}
          />
        </antd.ConfigProvider>
      </div>

      {/* Skill List → Table */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 16px' }} className="scrollbar-thin">
        <antd.Table
          columns={columns}
          dataSource={displayed}
          rowKey="id"
          size="small"
          tableLayout="fixed"
          pagination={false}
          locale={{
            emptyText: (
              <antd.Empty
                image={antd.Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span style={{ fontSize: fz(13), color: C.textMuted }}>
                    {searchQuery.trim() ? '沒有符合搜尋條件的 Skill' : '此階段目前沒有 Skill'}
                  </span>
                }
                style={{ padding: 32 }}
              />
            ),
          }}
          onRow={function(record) {
            return {
              style: { cursor: 'pointer' },
              onClick: function() { setSelected(record); },
            };
          }}
        />
      </div>

      {/* Detail Modal */}
      {selectedSkill && (
        <SkillDetailModal
          key={selectedSkill.id}
          skill={selectedSkill}
          p={p}
          onClose={function() { setSelected(null); }}
          onAdvance={function() { advanceStage(selectedSkill.id); }}
          onDelete={function() { deleteSkill(selectedSkill.id); }}
          onSave={saveSkill}
        />
      )}

      {/* Import Modal */}
      {showImport && (
        <SkillImportModal
          p={p}
          onClose={function() { setShowImport(false); }}
          onImport={handleImport}
        />
      )}
    </div>
  );
}
