/* ════════════════════════════════════════
   SKILL MANAGEMENT PAGE (v4)

   2026-07-26 改版：
     · 知識拆出去獨立成「知識管理」，本頁只剩「Guide」與「Flow」
     · 清單只是進入點，列上的操作只有刪除；其餘行為進詳情頁再做
     · 詳情從 1000px Modal 改為全頁（SkillDetailPage.jsx），
       因為 Graph 與 Ask AI 側欄要同時展開

   五階段管理流程維持：Draft → Testing → Approving → Pilot Run → Production
   註：主元件函式名稱維持 SOPManagementPage，以相容 SettingPage。
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
const SK_COL_W = { tier: 96, stage: 104, owner: 96, date: 104, action: 72 };

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

/* 回傳詳情頁要列的條件行；空陣列一律顯示為「全部」而非留白 */
function describeScope(scope) {
  var s = scope || {};
  return [
    { label: '機台類別', value: (s.equipmentClass && s.equipmentClass.length) ? s.equipmentClass.join('、') : '全部類別' },
    { label: '指定機台', value: (s.equipmentIds   && s.equipmentIds.length)   ? s.equipmentIds.join('、')   : '該類別全部' },
    { label: '區域',     value: (s.area           && s.area.length)           ? s.area.join('、')           : '全區' },
    { label: '觸發條件', value: describeTrigger(s.trigger) },
  ];
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
   DryRunOutput — 試跑第一層「產出長什麼樣」
   （詳情頁的 Test & Dry-run 區共用）
   ════════════════════════════════════════ */
function DryRunOutput({ output }) {
  var { C, fz } = useTheme();
  if (!output) return null;
  return (
    <div>
      <div style={{ fontSize: fz(14), fontWeight: 600, color: C.text, marginBottom: 8 }}>{output.title}</div>
      <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 16 }}>
        {output.shiftLabel ? output.shiftLabel + ' · ' : ''}{output.generatedAt}
      </div>
      {(output.metrics || []).length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {output.metrics.map(function(m) {
            return (
              <div key={m.label} style={{ flex: '1 1 144px', border: '1px solid ' + C.border, borderRadius: 8, padding: 16, background: C.bg }}>
                <div style={{ fontSize: fz(11), color: C.textMuted, marginBottom: 8 }}>{m.label}</div>
                <div style={{ fontSize: fz(18), fontWeight: 600, color: C.text }}>{m.value}<span style={{ fontSize: fz(12), color: C.textMuted, marginLeft: 4 }}>{m.unit}</span></div>
                {m.note && <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 8 }}>{m.note}</div>}
              </div>
            );
          })}
        </div>
      )}
      {[['本班課況', output.situation], ['待交接事項', output.pending]].map(function(pair) {
        if (!pair[1]) return null;
        return (
          <div key={pair[0]} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{pair[0]}</div>
            <div style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.8, whiteSpace: 'pre-wrap', background: C.bgSub, border: '1px solid ' + C.border, borderRadius: 8, padding: 16 }}>{pair[1]}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════
   Skill 清單欄位（AntD Table columns）
   列上只有刪除；其餘行為進詳情頁再做。
   ════════════════════════════════════════ */
function useSkillColumns({ onDelete }) {
  var { C, fz } = useTheme();

  return [
    {
      title: '類型', dataIndex: 'tier', key: 'tier', width: SK_COL_W.tier,
      render: function(v) { return <SkillTierTag tier={v} />; },
    },
    {
      title: '狀態', dataIndex: 'stage', key: 'stage', width: SK_COL_W.stage,
      render: function(v) { return <StatusTag stage={v} />; },
    },
    {
      title: '名稱', dataIndex: 'title', key: 'title',
      render: function(v, r) {
        var confirmCnt = (r.plainSteps || []).filter(function(s) { return s.needsConfirm; }).length;
        return (
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontWeight: 600, fontSize: fz(14), color: C.text,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{v}</div>
            {r.purpose && (
              <div style={{
                fontSize: fz(12), color: C.textMuted, lineHeight: 1.5, marginTop: 4,
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
              }}>{r.purpose}</div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
              {confirmCnt > 0 && (
                <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(10), fontWeight: 600, color: '#EF4444', background: 'rgba(239,68,68,0.08)' }}>🔒 {confirmCnt} 步需確認</antd.Tag>
              )}
              {r.consumedBy && r.consumedBy.scheduleId && (
                <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(10), color: C.textMuted, background: C.bgPanel }}>已掛排程</antd.Tag>
              )}
              {(r.knowledgeRefs || []).length > 0 && (
                <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(10), color: C.textMuted, background: C.bgPanel }}>引用 {r.knowledgeRefs.length} 份知識</antd.Tag>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: '建立者', dataIndex: 'importedBy', key: 'importedBy', width: SK_COL_W.owner,
      render: function(v) { return <span style={{ fontSize: fz(12), color: C.textSub }}>{v || '—'}</span>; },
    },
    {
      title: '建立日期', dataIndex: 'importedAt', key: 'importedAt', width: SK_COL_W.date,
      render: function(v) { return <span style={{ fontSize: fz(12), color: C.textMuted }}>{v || '—'}</span>; },
    },
    {
      title: '操作', key: 'action', width: SK_COL_W.action, align: 'right',
      render: function(_, r) {
        return (
          <span onClick={function(e) { e.stopPropagation(); }}>
            <antd.Popconfirm
              title="確定刪除此 Skill？"
              description={r.consumedBy && r.consumedBy.scheduleId ? '它目前掛在排程 ' + r.consumedBy.scheduleId + ' 上。' : null}
              okText="刪除"
              okButtonProps={{ danger: true }}
              cancelText="取消"
              onConfirm={function() { onDelete(r.id); }}
            >
              <antd.Button size="small" danger title="刪除">✕</antd.Button>
            </antd.Popconfirm>
          </span>
        );
      },
    },
  ];
}

/* ════════════════════════════════════════
   主頁面（函式名稱維持 SOPManagementPage 以相容 SettingPage）
   ════════════════════════════════════════ */
function SOPManagementPage({ p }) {
  var { C, fz } = useTheme();
  var [filter, setFilter]         = React.useState('all');
  var [tierFilter, setTierFilter] = React.useState('all');
  var [skills, setSkills]         = React.useState(p.knowledge.sopManagement || []);
  var [showCreate, setShowCreate] = React.useState(false);
  var [detailId, setDetailId]     = React.useState(null);
  var [searchQuery, setSearch]    = React.useState('');
  var [sortBy, setSortBy]         = React.useState('newest');

  /* persona 切換時重載 */
  React.useEffect(function() {
    setSkills(p.knowledge.sopManagement || []);
    setDetailId(null);
    setFilter('all');
    setTierFilter('all');
    setSearch('');
  }, [p.key]);

  function advanceStage(id, nextStage) {
    setSkills(function(prev) {
      return prev.map(function(s) {
        if (s.id !== id) return s;
        if (nextStage) return Object.assign({}, s, { stage: nextStage });
        var idx = SKILL_STAGES.indexOf(s.stage);
        return idx < SKILL_STAGES.length - 1 ? Object.assign({}, s, { stage: SKILL_STAGES[idx + 1] }) : s;
      });
    });
  }

  function deleteSkill(id) {
    setSkills(function(prev) { return prev.filter(function(s) { return s.id !== id; }); });
    if (detailId === id) setDetailId(null);
  }

  function saveSkill(updated) {
    setSkills(function(prev) {
      return prev.map(function(s) { return s.id === updated.id ? updated : s; });
    });
  }

  var columns = useSkillColumns({ onDelete: deleteSkill });

  var counts = {};
  SKILL_STAGES.forEach(function(s) { counts[s] = skills.filter(function(x) { return x.stage === s; }).length; });

  var displayed = skills
    .filter(function(s) { return filter === 'all' || s.stage === filter; })
    .filter(function(s) { return tierFilter === 'all' || s.tier === tierFilter; })
    .filter(function(s) {
      if (!searchQuery.trim()) return true;
      var q = searchQuery.toLowerCase();
      return s.title.toLowerCase().indexOf(q) !== -1
          || (s.purpose || '').toLowerCase().indexOf(q) !== -1
          || (s.importedBy || '').toLowerCase().indexOf(q) !== -1;
    })
    .sort(function(a, b) {
      if (sortBy === 'newest') return b.importedAt.localeCompare(a.importedAt);
      if (sortBy === 'oldest') return a.importedAt.localeCompare(b.importedAt);
      if (sortBy === 'name')   return a.title.localeCompare(b.title, 'zh');
      if (sortBy === 'stage')  return SKILL_STAGES.indexOf(a.stage) - SKILL_STAGES.indexOf(b.stage);
      return 0;
    });

  /* 詳情頁：清單只是進入點，其餘行為都在這裡 */
  var detailSkill = detailId ? skills.filter(function(s) { return s.id === detailId; })[0] : null;
  if (detailSkill) {
    return (
      <SkillDetailPage
        key={detailSkill.id}
        skill={detailSkill}
        p={p}
        onBack={function() { setDetailId(null); }}
        onSave={saveSkill}
        onAdvance={function(nextStage) { advanceStage(detailSkill.id, nextStage); }}
      />
    );
  }

  /* 篩選膠囊（Segmented）標籤：文字 + 筆數
     工具列已收成一行、拿掉外部 label，所以「全部類型 / 全部」這幾顆
     的文字本身就要撐起語意，不能再簡寫成「全部」兩字以外的東西。 */
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

  /* Pilot Run 縮成 Pilot：單行工具列每 32px 都要省 */
  var STAGE_SHORT = { pirun: 'Pilot' };

  var stageOptions = [{ value: 'all', label: stageLabel('全部階段', skills.length, filter === 'all') }].concat(
    SKILL_STAGES.map(function(s) {
      return { value: s, label: stageLabel(STAGE_SHORT[s] || SKILL_STAGE_CFG[s].label, counts[s] || 0, filter === s) };
    })
  );

  var tierCounts = {};
  SKILL_TIERS.forEach(function(t) { tierCounts[t] = skills.filter(function(x) { return x.tier === t; }).length; });
  var tierOptions = [{ value: 'all', label: stageLabel('全部類型', skills.length, tierFilter === 'all') }].concat(
    SKILL_TIERS.map(function(t) {
      return { value: t, label: stageLabel(SKILL_TIER_CFG[t].label, tierCounts[t] || 0, tierFilter === t) };
    })
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: C.bg }}>

      {/* Header */}
      <div style={{ padding: '8px 24px', borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: fz(14), color: C.text }}>Skill 管理</div>
          <div style={{ fontSize: fz(12), color: C.textMuted }}>{p.name} · Guide 與 Flow · 同課審批 · 不可跨課使用</div>
        </div>
        <div style={{ flex: 1 }} />
        <antd.Button type="primary" onClick={function() { setShowCreate(true); }}>＋ 建立 Skill</antd.Button>
      </div>

      {/* 工具列：搜尋 / 類型 / 階段 / 排序 收成單一行。
          2026-07-26 PO 定案：原本四個中文 label（搜尋、類型、階段、排序）拿掉 ——
          Segmented 第一顆本來就寫「全部類型 / 全部階段」，排序把 label 收進值裡，
          語意沒有消失，換來列表往上提三條橫線的高度。 */}
      <antd.ConfigProvider theme={{ components: { Segmented: { itemSelectedBg: '#2563EB', itemSelectedColor: '#FFFFFF' } } }}>
        <div style={{ padding: '8px 24px', borderBottom: '1px solid ' + C.border, display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, overflowX: 'auto' }} className="scrollbar-none">
          <antd.Input
            allowClear
            value={searchQuery}
            onChange={function(e) { setSearch(e.target.value); }}
            prefix={<span style={{ color: C.textMuted, fontSize: fz(12) }}>🔍</span>}
            aria-label="搜尋 Skill 名稱、用途或人員"
            placeholder="搜尋名稱、用途、人員…"
            style={{ flex: 1, minWidth: 176 }}
          />
          <antd.Segmented size="small" value={tierFilter} onChange={setTierFilter} options={tierOptions} />
          <antd.Segmented size="small" value={filter} onChange={setFilter} options={stageOptions} />
          <antd.Select
            value={sortBy}
            onChange={setSortBy}
            aria-label="排序方式"
            style={{ width: 152, flexShrink: 0 }}
            options={[
              { value: 'newest', label: '排序：最新建立' },
              { value: 'oldest', label: '排序：最舊優先' },
              { value: 'name',   label: '排序：名稱 A→Z' },
              { value: 'stage',  label: '排序：狀態順序' },
            ]}
          />
        </div>
      </antd.ConfigProvider>

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
                    {searchQuery.trim() ? '沒有符合搜尋條件的 Skill' : '此條件下目前沒有 Skill'}
                  </span>
                }
                style={{ padding: 32 }}
              />
            ),
          }}
          onRow={function(record) {
            return {
              style: { cursor: 'pointer' },
              onClick: function() { setDetailId(record.id); },
            };
          }}
        />
      </div>

      {/* 對話式建立 */}
      {showCreate && (
        <SkillCreateFlow
          p={p}
          onClose={function() { setShowCreate(false); }}
          onCreate={function(skill) {
            setSkills(function(prev) { return [skill].concat(prev); });
            setShowCreate(false);
            setDetailId(skill.id);
          }}
        />
      )}
    </div>
  );
}
