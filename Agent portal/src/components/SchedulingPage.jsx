/* ════════════════════════════════════════
   SCHEDULING PAGE
   AntD 遷移 Phase 4（見 brain/concepts/antd-migration-plan.md）

   2026-08-01 介入機制改寫：
   · 沒有「我來處理」認領步驟 —— 選項直接攤在決策點上，一次點擊完成決定。
   · 沒有「延伸討論」—— 本頁不再有任何 AI 對話出口。
   · 三個選項：確認執行 / 略過此步驟 / 拒絕執行。
   · 全課成員皆可決定；先送出的決定即定案，不可變更、不可撤回。
   · 決策點持續等待直到有人決定（逾時升級後期再補）。
   ════════════════════════════════════════ */

/* ── Run result config ── */
const SCH_RUN_CFG = {
  success:  { label: '完成',    color: '#16A34A', bg: 'rgba(34,197,94,0.1)',    icon: '✓' },
  pending:  { label: '待決定',  color: '#DC2626', bg: 'rgba(239,68,68,0.1)',    icon: '⏸' },
  error:    { label: '執行失敗', color: '#DC2626', bg: 'rgba(239,68,68,0.1)',   icon: '✕' },
  rejected: { label: '已拒絕',  color: '#6B7280', bg: 'rgba(107,114,128,0.1)', icon: '✕' },
};

const SCH_ITEM_STATUS_CFG = {
  ok:      { label: '正常',    color: '#16A34A', bg: 'rgba(34,197,94,0.08)'   },
  pending: { label: '待決定',  color: '#DC2626', bg: 'rgba(239,68,68,0.08)'  },
  error:   { label: '執行失敗', color: '#DC2626', bg: 'rgba(239,68,68,0.08)' },
  idle:    { label: '未觸發',  color: '#6B7280', bg: 'rgba(107,114,128,0.08)' },
};

/* ── Step icon（Timeline 自訂 dot；AntD 預設圓點無法帶狀態字符）── */
const STEP_ICON_CFG = {
  done:     { bg: 'rgba(34,197,94,0.15)',   color: '#16A34A', text: '✓' },
  waiting:  { bg: 'rgba(239,68,68,0.15)',   color: '#DC2626', text: '⏸' },
  error:    { bg: 'rgba(239,68,68,0.15)',   color: '#DC2626', text: '✕' },
  pending:  { bg: 'rgba(158,158,158,0.15)', color: '#6B7280', text: '○' },
  skip:     { bg: 'rgba(158,158,158,0.1)',  color: '#6B7280', text: '—' },
  rejected: { bg: 'rgba(239,68,68,0.15)',   color: '#DC2626', text: '✕' },
};

const SCH_RESULT_TO_ICON = { success: 'done', pending: 'waiting', error: 'error', rejected: 'rejected' };

function SchStepIcon({ status, size}) {
  const sz = size || 20;
  const cfg = STEP_ICON_CFG[status] || STEP_ICON_CFG.pending;
  return (
    <div style={{
      width: sz, height: sz, borderRadius: 999,
      background: cfg.bg, color: cfg.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: sz <= 16 ? 9 : 11, fontWeight: 700, flexShrink: 0,
    }}>{cfg.text}</div>
  );
}

/* 成員頭像：emoji / 首字邏輯，依遷移計畫保留自製（AntD Avatar 不處理） */
function SchAvatar({ name, avatar, color, size}) {
  const sz = size || 16;
  return (
    <div style={{
      width: sz, height: sz, borderRadius: 999,
      background: color || '#2563EB', color: '#fff',
      fontSize: Math.round(sz * 0.55), fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>{avatar || (name && name[0]) || '?'}</div>
  );
}

/* ── 介入紀錄一列：誰、何時、在哪一步、做了什麼決定、為什麼 ──
   目標 5 的落點。無論該次執行最後是成功、拒絕還是失敗，這一列都必須留著。 */
function SchInterventionLine({ iv, showTool }) {
  var { C, fz } = useTheme();
  var cfg = SCH_DECISION_CFG[iv.action] || SCH_DECISION_CFG.confirm;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <SchAvatar name={iv.actor.name} avatar={iv.actor.avatar} color={iv.actor.color} size={20} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: fz(12), color: C.textSub }}>
          <span style={{ fontWeight: 600, color: C.text }}>{iv.actor.name}</span>
          {' 於 '}
          <span style={{ fontFamily: 'monospace' }}>{iv.at}</span>
          {' 對 Step ' + iv.stepNum + ' 決定：'}
          <span style={{ color: cfg.color, fontWeight: 600 }}>{cfg.icon + ' ' + cfg.pastLabel}</span>
        </div>
        {iv.reason && (
          <div style={{ fontSize: fz(12), color: C.textMuted, marginTop: 2 }}>理由：{iv.reason}</div>
        )}
        {showTool && iv.toolCall && (
          <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 2, fontFamily: 'monospace' }}>
            {iv.toolCall.tool}({iv.toolCall.params}) → {iv.toolCall.result}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── 單一步驟內容（Timeline item 的 children；圓點由 Timeline 的 dot 提供）── */
function SchStepBody({ s, compact, interventions }) {
  var { C, fz } = useTheme();
  const isSkipped = s.status === 'skip' || s.status === 'pending';
  const iv = (interventions || []).filter(function (i) { return i.stepNum === s.num; })[0];
  return (
    <div>
      <div style={{ fontSize: compact ? fz(12) : fz(13), fontWeight: compact ? 400 : 500, color: isSkipped ? C.textMuted : C.text }}>
        <span style={{ color: C.textMuted, marginRight: 4 }}>Step {s.num} ·</span>
        {s.title}
        {compact && s.result && <span style={{ color: C.textMuted }}> → {s.result}</span>}
      </div>
      {!compact && s.result && (
        <div style={{ fontSize: fz(12), color: s.status === 'waiting' ? '#DC2626' : C.textMuted, marginTop: 2 }}>
          {s.result}
        </div>
      )}
      {/* 節點明細：這一步實際做了什麼。
          試跑畫面本來就看得到工具與資料來源，正式執行沒理由看得比試跑少。 */}
      {(s.tool || s.system || s.rows != null || s.durationLabel) && (
        <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 4, lineHeight: 1.7 }}>
          {s.tool && (
            <span style={{ fontFamily: 'monospace' }}>
              {s.tool}{s.params ? '(' + s.params + ')' : '()'}
            </span>
          )}
          {s.system   && <span>{s.tool ? '　·　' : ''}{s.system}</span>}
          {s.rows != null && <span>　·　{s.rows} 筆</span>}
          {s.durationLabel && <span>　·　{s.durationLabel}</span>}
        </div>
      )}
      {/* 沒有工具、但屬於本課自訂的計算步驟，也要說得出它憑什麼算 */}
      {s.note && !s.tool && (
        <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 4 }}>{s.note}</div>
      )}
      {/* 待決定步驟的細節卡 */}
      {!compact && s.detail && s.status === 'waiting' && (
        <antd.Card size="small" style={{ marginTop: 8 }}
          styles={{ body: { padding: '8px 16px', fontSize: fz(12), color: C.textSub, lineHeight: 1.8 } }}>
          {s.detail.machine && (
            <><strong>機台：</strong>{s.detail.machine}
            {s.detail.recipe ? <span>　｜　<strong>製程：</strong>{s.detail.recipe}</span> : ''}
            {s.detail.priority ? <span>　｜　<strong>優先：</strong>{s.detail.priority}</span> : ''}
            <br/></>
          )}
          {s.detail.desc && <><strong>說明：</strong>{s.detail.desc}<br/></>}
          {s.detail.target && (
            <><strong>目標：</strong>{s.detail.target}
            <br/><strong>問題：</strong>{s.detail.issue}
            <br/><strong>建議動作：</strong>{s.detail.action}<br/></>
          )}
        </antd.Card>
      )}
      {/* 這一步的介入紀錄跟著步驟走，展開就看得到是誰決定的 */}
      {iv && (
        <div style={{ marginTop: 8 }}>
          <SchInterventionLine iv={iv} showTool={!compact} />
        </div>
      )}
    </div>
  );
}

/* ── 步驟清單 → Timeline（連接線由 AntD 提供）── */
function SchStepTimeline({ steps, compact, interventions }) {
  const items = steps.map(function (s) {
    return {
      key: s.num,
      dot: <SchStepIcon status={s.status} size={compact ? 16 : 20} />,
      children: <SchStepBody s={s} compact={compact} interventions={interventions} />,
    };
  });
  return <antd.Timeline className="sch-timeline" items={items} style={{ marginTop: compact ? 8 : 0, marginBottom: 0 }} />;
}

/* ════════════════════════════════════════
   SchDecisionReasonModal — 略過 / 拒絕的理由輸入

   拒絕必填：流程被中止，沒有理由後面沒人查得出為什麼。
   略過選填：流程沒斷，但那一步確實沒做，能寫還是要寫。
   ════════════════════════════════════════ */
function SchDecisionReasonModal({ action, step, onCancel, onSubmit }) {
  var { C, fz } = useTheme();
  var cfg = SCH_DECISION_CFG[action];
  var [reason, setReason] = React.useState('');
  var missing = cfg.reasonRequired && reason.trim() === '';

  return (
    <antd.Modal
      open
      centered
      width={520}
      title={<span style={{ fontSize: fz(16), fontWeight: 600 }}>{cfg.label} — Step {step.num}「{step.title}」</span>}
      onCancel={onCancel}
      okText={cfg.label}
      cancelText="取消"
      okButtonProps={{ danger: action === 'reject', disabled: missing }}
      onOk={function () { if (!missing) onSubmit(reason.trim()); }}
    >
      <div style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.7, marginBottom: 16 }}>
        {cfg.desc}
      </div>
      <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub, marginBottom: 8 }}>
        理由{cfg.reasonRequired ? '（必填）' : '（選填）'}
      </div>
      <antd.Input.TextArea
        rows={3}
        value={reason}
        onChange={function (e) { setReason(e.target.value); }}
        style={{ marginBottom: 16 }}
      />
      <antd.Alert
        type="warning"
        showIcon
        message={<span style={{ fontSize: fz(12), lineHeight: 1.7 }}>
          決定送出後會記下你的名字與時間，且無法變更或撤回。
        </span>}
      />
    </antd.Modal>
  );
}

/* ════════════════════════════════════════
   SchNewScheduleModal — 新增排程

   排程只掛得上 Codify。Skill 每次結果都不一樣、產出的是給人看的建議，
   沒人在場就沒有意義；知識根本沒有要執行的東西。
   但不可用的類型不隱藏 —— 看得到、標明原因，Seed 才知道邊界在哪。
   見 brain/concepts/agent-skill-tiering.md「三層分界」
   ════════════════════════════════════════ */
const SCH_CRON_OPTIONS = ['每日 07:00', '每日 07:50', '每日 15:30', '每班結束前 30 分鐘', '每週一 09:00', '每小時整點'];

/* 一份 Codify 現在能不能掛排程；不能的話回一句話說明為什麼。
   mounts 來自 getSkillScheduleMap()，與 Skill 管理共用同一份對照。 */
function schBlockReason(s, mounts) {
  if (s.tier !== 'sop') {
    return { text: SKILL_TIER_CFG[s.tier].label + ' 不能設排程：每次結果不一樣，需要有人在場看' };
  }
  if (s.stage !== 'production') {
    return { text: '尚未上線（目前在 ' + SKILL_STAGE_CFG[s.stage].label + '），簽核通過才能排程' };
  }
  var m = (mounts || {})[s.id];
  if (m) {
    return { text: '已掛在排程「' + m.scheduleName + '」（' + m.cronLabel + '）', jumpTo: m.scheduleId };
  }
  return null;
}

/* 本課還有幾份 Codify 可以加入排程 —— 讓人不必打開 Modal 才知道 */
function countSchedulableSkills(p, mounts) {
  return (((p.knowledge || {}).sopManagement) || [])
    .filter(function (s) { return !schBlockReason(s, mounts); }).length;
}

function SchNewScheduleModal({ p, mounts, presetSkillId, onClose, onCreate, onJumpSchedule }) {
  var { C, fz } = useTheme();
  var all = ((p.knowledge || {}).sopManagement) || [];

  var [query, setQuery]   = React.useState('');
  var [picked, setPicked] = React.useState(presetSkillId || null);
  var [cron, setCron]     = React.useState(SCH_CRON_OPTIONS[2]);

  /* 可掛：Production 且尚未掛上排程的 Codify。
     其餘全部列出來但不能選，並寫明為什麼 —— 看得到邊界，Seed 才知道界線在哪 */
  var options = all.map(function(s) { return { skill: s, block: schBlockReason(s, mounts) }; })
    .filter(function(o) {
      if (!query.trim()) return true;
      var q = query.trim().toLowerCase();
      return (o.skill.title || '').toLowerCase().indexOf(q) >= 0
          || (o.skill.purpose || '').toLowerCase().indexOf(q) >= 0
          || (o.skill.tags || []).some(function(t) { return t.toLowerCase().indexOf(q) >= 0; });
    })
    .sort(function(a, b) { return (a.block ? 1 : 0) - (b.block ? 1 : 0); });

  var available = all.filter(function(s) { return !schBlockReason(s, mounts); }).length;
  var pickedSkill = picked ? all.find(function(s) { return s.id === picked; }) : null;
  if (pickedSkill && schBlockReason(pickedSkill, mounts)) pickedSkill = null;
  var pickedSteps  = pickedSkill ? (pickedSkill.plainSteps || []) : [];
  var confirmSteps = pickedSteps.filter(function(st) { return st.needsConfirm; }).length;

  return (
    <antd.Modal
      open
      centered
      width={640}
      title={<span style={{ fontSize: fz(16), fontWeight: 600 }}>新增排程</span>}
      onCancel={onClose}
      okText="建立排程"
      cancelText="取消"
      okButtonProps={{ disabled: !pickedSkill }}
      onOk={function() { if (pickedSkill) onCreate(pickedSkill, cron); }}
    >
      <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 16 }}>
        排程只掛得上已上線、且還沒被掛走的 Codify —— 每次步驟都一樣、結果可重現，沒人看著也不會出事。
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub }}>
          選一個 Codify（可加入 {available} 份）
        </span>
        <div style={{ flex: 1 }} />
        <antd.Input
          allowClear
          size="small"
          placeholder="搜尋名稱、用途或標籤"
          value={query}
          onChange={function(e) { setQuery(e.target.value); }}
          style={{ width: 224 }}
        />
      </div>
      <div style={{ maxHeight: 288, overflowY: 'auto', border: '1px solid ' + C.border, borderRadius: 8, marginBottom: 16 }} className="scrollbar-thin">
        {options.length === 0 && (
          <div style={{ padding: 16, fontSize: fz(13), color: C.textMuted }}>
            {query.trim() ? '沒有符合「' + query.trim() + '」的項目。' : '本課目前沒有任何 Skill。'}
          </div>
        )}
        {options.map(function(o) {
          var disabled = !!o.block;
          var active   = picked === o.skill.id;
          return (
            <div
              key={o.skill.id}
              onClick={function() { if (!disabled) setPicked(o.skill.id); }}
              style={{
                padding: '8px 16px', borderBottom: '1px solid ' + C.border,
                cursor: disabled ? 'not-allowed' : 'pointer',
                background: active ? 'rgba(37,99,235,0.08)' : 'transparent',
                opacity: disabled ? 0.6 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SkillTierTag tier={o.skill.tier} />
                <span style={{ fontSize: fz(13), color: C.text, fontWeight: 500, flex: 1, minWidth: 0 }}>{o.skill.title}</span>
                {disabled
                  ? <span style={{ fontSize: fz(12) }}>🔒</span>
                  : <StatusTag stage={o.skill.stage} />
                }
              </div>
              {o.block && (
                <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 4 }}>
                  {o.block.text}
                  {o.block.jumpTo && onJumpSchedule && (
                    <a
                      onClick={function(e) { e.stopPropagation(); onJumpSchedule(o.block.jumpTo); }}
                      style={{ marginLeft: 8 }}
                    >去看那個排程</a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 選了之後直接看得到它會做哪幾步，不必跳回 Skill 管理 */}
      {pickedSkill && pickedSteps.length > 0 && (
        <div style={{ marginBottom: 16, border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '8px 16px', background: C.bgPanel, fontSize: fz(12), fontWeight: 600, color: C.textSub }}>
            這份 Codify 會做這 {pickedSteps.length} 步
          </div>
          <div style={{ padding: '8px 16px', background: C.bg }}>
            {pickedSteps.map(function(st) {
              return (
                <div key={st.num} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '4px 0' }}>
                  <span style={{ fontSize: fz(12), color: C.textMuted, fontFamily: 'monospace', flexShrink: 0 }}>{st.num}</span>
                  <span style={{ fontSize: fz(12), color: C.text, flex: 1, minWidth: 0 }}>
                    {st.label}
                    {st.tool && <span style={{ color: C.textMuted, fontFamily: 'monospace' }}>　{st.tool}</span>}
                  </span>
                  {st.needsConfirm && (
                    <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(10), fontWeight: 600, color: '#EF4444', background: 'rgba(239,68,68,0.08)' }}>需人工決定</antd.Tag>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub, marginBottom: 8 }}>執行時間</div>
      <antd.Select value={cron} onChange={setCron} style={{ width: '100%', marginBottom: 16 }}
        options={SCH_CRON_OPTIONS.map(function(c) { return { value: c, label: c }; })}
      />

      {/* 設排程時就要知道會不會卡住，不然每天早上才發現停在第 3 步 */}
      {pickedSkill && (
        confirmSteps > 0
          ? <antd.Alert
              type="warning"
              showIcon
              message={<span style={{ fontSize: fz(13), fontWeight: 600 }}>本 Codify 含 {confirmSteps} 個需確認步驟</span>}
              description={<span style={{ fontSize: fz(12), lineHeight: 1.7 }}>排程執行到那幾步會暫停並通知，任何課員都可以決定，決定後才會繼續。不是設好就完全不用管。</span>}
            />
          : <antd.Alert
              type="success"
              showIcon
              message={<span style={{ fontSize: fz(13), fontWeight: 600 }}>本 Codify 只讀取資料，可以完全自動執行</span>}
              description={<span style={{ fontSize: fz(12), lineHeight: 1.7 }}>不會異動任何系統，時間到就有產出。</span>}
            />
      )}
    </antd.Modal>
  );
}

/* ════════════════════════════════════════
   SCHEDULING PAGE MAIN
   ════════════════════════════════════════ */
const SCH_ALL = '__all__';   /* 左欄「執行總覽」的虛擬選取 id */

function SchedulingPage({ p, expandRunReq, decisions, onDecide, extraRuns, onRetry, extraItems, onCreateSchedule, newScheduleReq, onNewScheduleHandled }) {
  var { C, fz } = useTheme();
  const baseItems = getScheduleItems(p.key, extraRuns);
  const items = (extraItems || []).concat(baseItems);
  const ivsByRun = decisions || {};

  /* Codify → 已掛在哪個排程；與 Skill 管理共用同一份對照 */
  const mounts = getSkillScheduleMap(p.key, extraItems);
  const schedulableCount = countSchedulableSkills(p, mounts);

  const [showNew, setShowNew]       = React.useState(false);
  const [presetSkillId, setPreset]  = React.useState(null);
  /* 預設停在執行總覽 —— 進門先看「全課昨晚跑了什麼」，
     而不是一進來就鑽進第一個排程的細節 */
  const [selectedId, setSelectedId] = React.useState(SCH_ALL);
  const [runFilter, setRunFilter]   = React.useState('all');
  const [reasonModal, setReasonModal] = React.useState(null);   // { action, run, step }
  const [conflict, setConflict]     = React.useState(null);     // 決定被搶先時的提示
  const [expandedRuns, setExpandedRuns] = React.useState(() => {
    const init = new Set();
    if (items[0]?.runs[0]) init.add(items[0].runs[0].id);
    return init;
  });

  /* ── 通知 deep-link：展開指定執行紀錄（見 notification 模組）──
     依 runId 找到所屬排程，切換選取並展開該筆 run；nonce 變動即重觸發。 */
  React.useEffect(function () {
    const runId = expandRunReq && expandRunReq.runId;
    if (!runId) return;
    const owner = items.find(function (it) {
      return (it.runs || []).some(function (r) { return r.id === runId; });
    });
    if (!owner) return;
    setSelectedId(owner.id);
    setExpandedRuns(function (prev) { const n = new Set(prev); n.add(runId); return n; });
  }, [expandRunReq && expandRunReq.nonce]);

  /* ── Codify 詳情「設為定期執行」deep-link：開新增 Modal 並預選那份 Codify ── */
  React.useEffect(function () {
    const skillId = newScheduleReq && newScheduleReq.skillId;
    if (!skillId || !newScheduleReq.nonce) return;
    setPreset(skillId);
    setShowNew(true);
    /* 用完就清掉，不然之後每次回到排程頁都會再彈一次 */
    if (onNewScheduleHandled) onNewScheduleHandled();
  }, [newScheduleReq && newScheduleReq.nonce]);

  const isOverview   = selectedId === SCH_ALL;
  const selectedItem = isOverview ? null : items.find(i => i.id === selectedId);

  /* 全課待決定：Nav 紅點與左欄匯總共用同一份真相 */
  const pendingDecisions = getPendingDecisions(items, ivsByRun);

  /* 全課所有執行（時間倒序），總覽與左欄健康度共用 */
  const allRuns   = getAllRuns(items, ivsByRun);
  const errorRuns = allRuns.filter(e => e.view.result === 'error');

  /* 目前選中排程的決策點（一次只會有一個活著的決策點）*/
  const activeDecision = pendingDecisions.filter(function (d) {
    return selectedItem && d.item.id === selectedItem.id;
  })[0] || null;

  /* 別的排程還卡著幾件 —— 本排程自己的決策點就在畫面下方，不重複計入 */
  const othersPending = pendingDecisions.filter(function (d) {
    return !selectedItem || d.item.id !== selectedItem.id;
  }).length;

  /* ── 送出決定 ──
     先送出者定案：onDecide 回 false 代表這個決策點已經被別人決定了，
     本次點擊不成立，畫面轉為對方的結果 —— B 推翻不了 A。 */
  const nowLabel = () => {
    const d = new Date();
    const pad = n => (n < 10 ? '0' + n : '' + n);
    return '今日 ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  };

  const submitDecision = (run, step, action, reason) => {
    const iv = {
      id: 'iv-' + run.id + '-' + step.num,
      action: action,
      stepNum: step.num,
      at: nowLabel(),
      actor: { name: p.user.name, avatar: p.user.avatar, color: '#2563EB' },
      reason: reason || '',
      toolCall: (action === 'confirm' && step.mcpTool)
        ? { tool: step.mcpTool, params: step.mcpParams || '', result: step.onConfirm || '已執行' }
        : null,
    };
    const accepted = onDecide(run.id, iv);
    setReasonModal(null);
    if (!accepted) {
      setConflict({ runId: run.id, stepNum: step.num });
    } else {
      setConflict(null);
      setExpandedRuns(prev => { const n = new Set(prev); n.add(run.id); return n; });
    }
  };

  /* ── 決策點面板 ──
     沒有認領、沒有 AI 對話出口，選項直接攤開，任何課員都能按。 */
  const renderDecisionPanel = () => {
    if (!activeDecision) return null;
    const run  = activeDecision.run;
    const step = activeDecision.step;
    const view = getRunView(run, ivsByRun[run.id]);

    return (
      <div>
        <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
          ⚠ 當前執行待人工決定
        </div>
        <antd.Alert
          type="error"
          message={
            <span style={{ fontSize: fz(13), fontWeight: 600 }}>
              AI 執行至 Step {step.num}「{step.title}」，需要人工決定才能繼續
            </span>
          }
          description={
            <div>
              {/* 要決定什麼：AI 準備呼叫哪個工具、帶什麼參數 */}
              <div style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.6, marginBottom: 8 }}>
                AI 準備呼叫{' '}
                <antd.Typography.Text code style={{ fontSize: fz(12) }}>
                  {step.mcpTool || 'unknown.tool'}
                </antd.Typography.Text>
                {step.system ? '（' + step.system + '）' : ''}
              </div>
              {step.mcpParams && (
                <div style={{ fontSize: fz(12), color: C.textMuted, fontFamily: 'monospace', marginBottom: 16 }}>
                  參數：{step.mcpParams}
                </div>
              )}

              {/* 等待狀態：持續等待，不會自動終止 */}
              <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 16 }}>
                自 <span style={{ fontFamily: 'monospace' }}>{run.waitingSince || run.startedAt}</span> 起等待中，尚無人決定。排程會一直停在這裡直到有人決定。
              </div>

              {/* Steps */}
              <div style={{ marginBottom: 16 }}>
                <SchStepTimeline steps={view.steps} compact={false} interventions={view.interventions} />
              </div>

              {/* 決定被搶先 */}
              {conflict && conflict.runId === run.id && (
                <antd.Alert
                  type="info" showIcon style={{ marginBottom: 16 }}
                  message={<span style={{ fontSize: fz(12), lineHeight: 1.7 }}>
                    這個決策點已經有人先決定了，你這次的操作沒有生效。上方顯示的是已成立的結果。
                  </span>}
                />
              )}

              {/* 選項：直接攤開，一次點擊完成 */}
              <antd.Space size={8} wrap>
                <antd.Button type="primary" onClick={() => submitDecision(run, step, 'confirm', '')}>
                  ✓ 確認執行
                </antd.Button>
                <antd.Button onClick={() => setReasonModal({ action: 'skip', run: run, step: step })}>
                  ⏭ 略過此步驟
                </antd.Button>
                <antd.Button danger onClick={() => setReasonModal({ action: 'reject', run: run, step: step })}>
                  ✕ 拒絕執行
                </antd.Button>
              </antd.Space>

              <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 8, lineHeight: 1.7 }}>
                本課任何成員都可以決定，不需要先認領。<strong>先送出的決定即定案，會記下決定者與時間，且無法變更或撤回。</strong>
              </div>
            </div>
          }
        />
      </div>
    );
  };

  /* ── 重跑：新增一筆執行，不覆蓋原本那筆失敗 ── */
  const handleRetry = (item, run) => {
    const newRun = buildRetryRun(run, p.user.name, nowLabel());
    onRetry(item.id, newRun);
    setSelectedId(item.id);
    setExpandedRuns(prev => { const n = new Set(prev); n.add(newRun.id); return n; });
  };

  /* ── 執行紀錄 → Collapse（摘要列＝panel header，步驟＝panel body）──
     entries 來自單一排程或全課總覽，兩邊共用同一組列。 */
  const renderRunPanels = (entries, showScheduleName) => {
    return entries.map(function (entry) {
      const item = entry.item;
      const run  = entry.run;
      const view = entry.view;
      const cfg  = SCH_RUN_CFG[view.result] || SCH_RUN_CFG.success;
      const failKind = run.failure ? (SCH_FAILURE_KIND_CFG[run.failure.kind] || SCH_FAILURE_KIND_CFG.unknown) : null;

      /* 完成但中間有人略過，要在摘要就看得出來 */
      const resultLabel = view.result === 'success' && view.hasSkip
        ? '完成（含人工略過）'
        : cfg.label;

      return {
        key: run.id,
        style: {
          background: C.bg, borderRadius: 6, marginBottom: 8,
          border: '1px solid ' + (view.result === 'pending' ? '#FCA5A5' : C.border),
        },
        label: (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <SchStepIcon status={SCH_RESULT_TO_ICON[view.result] || 'done'} size={24} />
            <div style={{ flex: 1 }}>
              {showScheduleName && (
                <div style={{ fontSize: fz(12), fontWeight: 600, color: '#2563EB', marginBottom: 2 }}>{item.name}</div>
              )}
              <div style={{ fontSize: fz(13), fontWeight: 500, color: C.text, marginBottom: 2 }}>
                {run.dateLabel} — {resultLabel}（{view.doneSteps}/{view.totalSteps} 步驟）
              </div>
              <div style={{ fontSize: fz(11), color: C.textMuted }}>
                {run.trigger === 'manual' ? '人工觸發' : run.trigger === 'retry' ? '失敗重跑' : '排程自動觸發'}
                {run.triggeredBy ? '（' + run.triggeredBy + '）' : ''}
                　·　執行時長：{run.duration}
              </div>

              {/* 介入紀錄：無論最後結果為何都固定顯示，不會因為決定完就消失 */}
              {view.interventions.length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {view.interventions.map(function (iv) {
                    return <SchInterventionLine key={iv.id} iv={iv} showTool={false} />;
                  })}
                </div>
              )}

              {/* 失敗資訊：一行錯誤訊息查不出東西，要看得出卡在哪、哪個工具、哪一種失敗 */}
              {run.failure && (
                <div style={{ marginTop: 8, background: 'rgba(239,68,68,0.05)', padding: 8, borderRadius: 4 }}>
                  <div style={{ fontSize: fz(12), color: '#DC2626', fontWeight: 600, marginBottom: 2 }}>
                    {failKind.label}　·　卡在 Step {run.failure.stepNum}
                  </div>
                  <div style={{ fontSize: fz(11), color: C.textMuted, marginBottom: 2 }}>{failKind.hint}</div>
                  <div style={{ fontSize: fz(11), color: '#DC2626', fontFamily: 'monospace' }}>{run.failure.message}</div>
                </div>
              )}
              {/* 重跑的來歷要看得出來 */}
              {run.retryOf && (
                <div style={{ marginTop: 8, fontSize: fz(11), color: C.textMuted }}>
                  這是失敗後的補跑，原本那筆失敗紀錄仍保留在清單中。
                </div>
              )}
            </div>
          </div>
        ),
        extra: (
          <antd.Space size={8}>
            {run.failure && run.failure.retryable && (
              <antd.Button
                size="small"
                onClick={function (e) { e.stopPropagation(); handleRetry(item, run); }}
              >↻ 重跑</antd.Button>
            )}
            <antd.Tag style={{ marginInlineEnd: 0, borderRadius: 999, background: cfg.bg, color: cfg.color, borderColor: 'transparent' }}>
              {cfg.label}
            </antd.Tag>
          </antd.Space>
        ),
        children: (
          <div>
            {/* 產出物本身 —— 執行紀錄的重點是「跑出了什麼」，不只是「跑了哪幾步」。
                這裡是檔案櫃：可回溯所有班次；今天那份同時在 Home 課佈告欄。 */}
            {run.output && (
              <div style={{ marginBottom: 16, border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ padding: '8px 16px', background: C.bgPanel }}>
                  <span style={{ fontSize: fz(12), fontWeight: 700, color: C.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>本次產出</span>
                </div>
                <div style={{ padding: 16, background: C.bg }}>
                  <DryRunOutput output={run.output} />
                </div>
              </div>
            )}
            {/* 本次實走路徑：哪幾步真的跑了、哪幾步沒走、為什麼沒走 */}
            {(function () {
              const path = getRunPath(view);
              if (!path.taken.length && !path.notTaken.length) return null;
              return (
                <div style={{ marginBottom: 8, padding: '8px 16px', background: C.bgPanel, borderRadius: 6 }}>
                  <div style={{ fontSize: fz(12), color: C.textSub }}>
                    <span style={{ fontWeight: 600 }}>本次路徑：</span>
                    <span style={{ fontFamily: 'monospace' }}>
                      {path.taken.length ? path.taken.map(n => 'Step ' + n).join(' → ') : '無'}
                    </span>
                  </div>
                  {path.notTaken.map(function (n) {
                    return (
                      <div key={n.num} style={{ fontSize: fz(11), color: C.textMuted, marginTop: 4 }}>
                        {n.byHuman ? '⏭' : '—'} Step {n.num}「{n.title}」未執行：{n.why}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
            <SchStepTimeline steps={view.steps} compact={true} interventions={view.interventions} />
          </div>
        ),
      };
    });
  };

  /* ── 篩選膠囊（規範：圓角 999px、選中底 #2563EB、禁底線）── */
  const renderFilterPills = () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {SCH_RUN_FILTERS.map(function (f) {
        const active = runFilter === f.key;
        const count = f.key === 'all' ? allRuns.length : allRuns.filter(e => matchRunFilter(e, f.key)).length;
        return (
          <div
            key={f.key}
            onClick={function () { setRunFilter(f.key); }}
            style={{
              padding: '4px 16px', borderRadius: 999, cursor: 'pointer',
              fontSize: fz(12), fontWeight: active ? 600 : 400,
              background: active ? '#2563EB' : 'transparent',
              color: active ? '#fff' : C.textSub,
              border: '1px solid ' + (active ? '#2563EB' : C.border),
            }}
          >{f.label}（{count}）</div>
        );
      })}
    </div>
  );

  /* ── 全課執行總覽 ──
     目標 2、3 的落點：跨排程、時間倒序，「只看異常」一鍵切得到。 */
  const renderOverview = () => {
    const filtered = allRuns.filter(e => matchRunFilter(e, runFilter));
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bgPanel }}>
        <div style={{ padding: '16px 24px', background: C.bg, borderBottom: '1px solid ' + C.border, flexShrink: 0 }}>
          <div style={{ fontSize: fz(15), fontWeight: 600, color: C.text }}>執行總覽</div>
          <div style={{ fontSize: fz(12), color: C.textMuted, marginTop: 2 }}>
            本課 {items.length} 個排程　·　{allRuns.length} 次執行　·
            <span style={{ color: errorRuns.length > 0 ? '#DC2626' : C.textMuted }}>{errorRuns.length} 次失敗</span>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 待人工決定：跨排程集中在這裡，點一下直接跳過去 */}
          {pendingDecisions.length > 0 && (
            <antd.Alert
              type="error"
              message={<span style={{ fontSize: fz(13), fontWeight: 600 }}>有 {pendingDecisions.length} 件待人工決定</span>}
              description={
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pendingDecisions.map(function (d) {
                    return (
                      <div key={d.run.id} style={{ fontSize: fz(12), color: C.textSub }}>
                        <a onClick={function () { setSelectedId(d.item.id); }} style={{ fontWeight: 600 }}>{d.item.name}</a>
                        {'　Step ' + d.step.num + '「' + d.step.title + '」·　自 '}
                        <span style={{ fontFamily: 'monospace' }}>{d.run.waitingSince || d.run.startedAt}</span>
                        {' 起等待中'}
                      </div>
                    );
                  })}
                </div>
              }
            />
          )}

          {renderFilterPills()}

          {filtered.length === 0 ? (
            <antd.Empty style={{ padding: 24 }} description={<span style={{ fontSize: fz(13), color: C.textMuted }}>此條件下沒有執行紀錄</span>} />
          ) : (
            <antd.Collapse
              bordered={false}
              activeKey={Array.from(expandedRuns)}
              onChange={function (keys) { setExpandedRuns(new Set(keys)); }}
              items={renderRunPanels(filtered, true)}
              style={{ background: 'transparent' }}
            />
          )}
        </div>
      </div>
    );
  };

  /* ── Main render ── */
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left Panel ── */}
        <div style={{
          width: 312, flexShrink: 0,
          background: C.bg, borderRight: '1px solid ' + C.border,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {/* 左欄只做一件事：切換單一排程。
              跨排程的警示與入口都在總覽（右欄主頁），不在這裡重複講一次 ——
              原本的「本課有 N 件待人工決定」橫幅與「執行總覽」入口已移除。 */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid ' + C.border }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: fz(13), fontWeight: 600, color: C.textSub }}>排程清單</span>
              <antd.Button type="primary" size="small" onClick={function() { setPreset(null); setShowNew(true); }}>＋ 新增</antd.Button>
            </div>
            {/* 不必打開 Modal 才知道還有東西可以加 */}
            <div
              onClick={function() { if (schedulableCount > 0) { setPreset(null); setShowNew(true); } }}
              style={{
                fontSize: fz(11), marginTop: 8,
                color: schedulableCount > 0 ? '#2563EB' : C.textMuted,
                cursor: schedulableCount > 0 ? 'pointer' : 'default',
              }}
            >
              {schedulableCount > 0
                ? '還有 ' + schedulableCount + ' 份 Codify 可加入排程'
                : '本課已上線的 Codify 都掛上排程了'}
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            <antd.List
              dataSource={items}
              split={false}
              locale={{ emptyText: <antd.Empty style={{ padding: 24 }} description={<span style={{ fontSize: fz(13), color: C.textMuted }}>尚無排程項目</span>} /> }}
              renderItem={function (item) {
                const isActive = selectedId === item.id;
                const isPending = pendingDecisions.some(function (d) { return d.item.id === item.id; });
                const effectiveStatus = isPending ? 'pending' : item.status;
                const statusCfg = SCH_ITEM_STATUS_CFG[effectiveStatus] || SCH_ITEM_STATUS_CFG.ok;
                return (
                  <antd.List.Item style={{ padding: '0 0 8px', borderBlockEnd: 'none' }}>
                    <antd.Card
                      size="small" hoverable
                      onClick={() => setSelectedId(item.id)}
                      style={{
                        width: '100%',
                        borderColor: isActive ? '#2563EB' : isPending ? '#FCA5A5' : C.border,
                        backgroundColor: isActive ? 'rgba(37,99,235,0.04)' : isPending ? 'rgba(239,68,68,0.04)' : undefined,
                      }}
                      styles={{ body: { padding: 12 } }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text, flex: 1 }}>{item.name}</span>
                        {isPending && <antd.Badge color="#EF4444" />}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: fz(11), color: C.textMuted, fontFamily: 'monospace' }}>{item.cronLabel}</span>
                        <antd.Tag style={{ marginInlineEnd: 0, borderRadius: 999, background: statusCfg.bg, color: statusCfg.color, borderColor: 'transparent' }}>
                          {statusCfg.label}
                        </antd.Tag>
                      </div>
                      <div style={{ fontSize: fz(11), color: C.textMuted }}>上次執行：{item.lastRun}</div>
                      {/* 近 N 次的失敗數：不穩定的排程自己浮出來，不必點進去才知道 */}
                      {(function () {
                        const h = getRecentHealth(item, ivsByRun, 7);
                        if (!h.total) return null;
                        return (
                          <div style={{ fontSize: fz(11), color: h.failed > 0 ? '#DC2626' : C.textMuted, marginTop: 2 }}>
                            近 {h.total} 次：{h.failed > 0 ? h.failed + ' 次失敗' : '全部正常'}
                          </div>
                        );
                      })()}
                    </antd.Card>
                  </antd.List.Item>
                );
              }}
            />
          </div>
        </div>

        {/* ── Right Panel ── */}
        {isOverview ? renderOverview() : selectedItem ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bgPanel }}>

            {/* Right Header */}
            <div style={{
              padding: '16px 24px', background: C.bg, borderBottom: '1px solid ' + C.border,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
            }}>
              <div>
                {/* 回總覽的路。左欄不再有總覽入口，「我現在在哪」屬於詳情欄的層級。
                    帶上「其他排程還有 N 件待決定」——補回左欄橫幅拿掉後失去的那一點觸達，
                    但只算別的排程（本排程的決策點就在下面，不必再講一次），且不另開警示區塊。 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <antd.Breadcrumb
                    items={[
                      { title: <a onClick={function () { setSelectedId(SCH_ALL); }}>排程中心</a> },
                      { title: <span style={{ color: C.textSub }}>{selectedItem.name}</span> },
                    ]}
                    style={{ fontSize: fz(12) }}
                  />
                  {othersPending > 0 && (
                    <a
                      onClick={function () { setSelectedId(SCH_ALL); }}
                      style={{ fontSize: fz(12), color: '#DC2626' }}
                    >其他排程還有 {othersPending} 件待決定</a>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: fz(15), fontWeight: 600, color: C.text }}>{selectedItem.name}</span>
                  <SkillTierTag tier="sop" />
                </div>
                <div style={{ fontSize: fz(12), color: C.textMuted, marginTop: 2 }}>
                  {selectedItem.cronLabel} 執行　·　Skill：
                  <span style={{ fontFamily: 'monospace' }}>{selectedItem.skill}</span>
                  　·　建立者：{selectedItem.createdBy}
                </div>
                {/* 含寫入的排程不是設好就沒事，講在前面（僅對已標註類型的排程顯示）*/}
                {typeof selectedItem.confirmSteps === 'number' && (
                  <div style={{ fontSize: fz(12), color: selectedItem.confirmSteps > 0 ? '#F59E0B' : '#22C55E', marginTop: 4, fontWeight: 600 }}>
                    {selectedItem.confirmSteps > 0
                      ? '⚠️ 本 Codify 含 ' + selectedItem.confirmSteps + ' 個需確認步驟，執行到會暫停並通知，任何課員都可以決定'
                      : '只讀取資料，時間到就有產出，不會異動任何系統'}
                  </div>
                )}
              </div>
              <antd.Space size={8}>
                <antd.Button size="small">編輯排程</antd.Button>
                <antd.Button size="small" danger>停用</antd.Button>
              </antd.Space>
            </div>

            {/* Right Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* 決策點 */}
              {renderDecisionPanel()}

              {/* Divider (only when panel is shown) */}
              {activeDecision && <antd.Divider style={{ margin: 0 }} />}

              {/* Execution History */}
              <div>
                <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                  執行紀錄
                </div>
                {(selectedItem.runs || []).length === 0 ? (
                  <antd.Empty
                    style={{ padding: 24 }}
                    description={<span style={{ fontSize: fz(13), color: C.textMuted }}>
                      尚未執行過，下次執行時間：{selectedItem.cronLabel}
                    </span>}
                  />
                ) : (
                  <antd.Collapse
                    bordered={false}
                    activeKey={Array.from(expandedRuns)}
                    onChange={function (keys) { setExpandedRuns(new Set(keys)); }}
                    items={renderRunPanels(
                      (selectedItem.runs || []).map(function (run) {
                        return { item: selectedItem, run: run, view: getRunView(run, ivsByRun[run.id]) };
                      }),
                      false
                    )}
                    style={{ background: 'transparent' }}
                  />
                )}
              </div>

            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <antd.Empty description={<span style={{ fontSize: fz(13), color: C.textMuted }}>選擇左側排程項目查看詳情</span>} />
          </div>
        )}

      </div>

      {/* 略過 / 拒絕的理由輸入 */}
      {reasonModal && (
        <SchDecisionReasonModal
          action={reasonModal.action}
          step={reasonModal.step}
          onCancel={function () { setReasonModal(null); }}
          onSubmit={function (reason) {
            submitDecision(reasonModal.run, reasonModal.step, reasonModal.action, reason);
          }}
        />
      )}

      {/* 新增排程：只選得到已上線的 Codify */}
      {showNew && (
        <SchNewScheduleModal
          p={p}
          mounts={mounts}
          presetSkillId={presetSkillId}
          onClose={function() { setShowNew(false); setPreset(null); }}
          onJumpSchedule={function(scheduleId) { setShowNew(false); setPreset(null); setSelectedId(scheduleId); }}
          onCreate={function(skill, cron) {
            var confirmSteps = (skill.plainSteps || []).filter(function(st) { return st.needsConfirm; }).length;
            var newItem = {
              id: 'sch-new-' + Date.now(),
              name: skill.title,
              skill: skill.id,
              skillId: skill.id,
              hasWrite: !!skill.hasWrite,
              confirmSteps: confirmSteps,
              cronLabel: cron,
              createdBy: p.user.name,
              status: 'ok',
              lastRun: '尚未執行',
              runs: [],
            };
            onCreateSchedule(newItem);
            setSelectedId(newItem.id);
            setShowNew(false);
            setPreset(null);
          }}
        />
      )}
    </div>
  );
}
