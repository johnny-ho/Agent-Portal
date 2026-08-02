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
   SchScheduleModal — 新增／編輯排程（同一個表單的兩種模式）

   排程只掛得上 Codify。Skill 每次結果都不一樣、產出的是給人看的建議，
   沒人在場就沒有意義；知識根本沒有要執行的東西。
   但不可用的類型不隱藏 —— 看得到、標明原因，Seed 才知道邊界在哪。
   見 brain/concepts/agent-skill-tiering.md「三層分界」

   ⚠️ 編輯模式刻意不讓改「掛哪一份 Codify」：
   排程底下累積的執行紀錄、產出物與 interventions[] 都是「這份 Codify 做了什麼」，
   換掉之後同一個排程的歷史前半段在講 A、後半段在講 B，決議 17 建立的稽核序列就斷了；
   而且「一份 Codify 只掛一個排程」是 getSkillScheduleMap 的單一真相，換掛會同時
   改動 Skill 管理那邊的徽章。要換＝停用本排程後另建，兩邊歷史各自留著。

   建立與編輯共用同一個表單，使用者不必學兩次，也不會演化成兩套各自為政的欄位。
   ════════════════════════════════════════ */
const SCH_CRON_OPTIONS = ['每日 07:00', '每日 07:50', '每日 15:30', '每班結束前 30 分鐘', '每週一 09:00', '每小時整點'];

/* 下次執行是什麼時候 —— 排程改完最常見的困惑是「現在生效還是明天」，直接寫出來。
   回 null 代表這個排法沒有固定時刻（每班結束前 N 分鐘），由呼叫端改寫說明。 */
function getNextRunLabel(cron) {
  var now = new Date();
  var pad = function (n) { return n < 10 ? '0' + n : '' + n; };

  if (/每小時整點/.test(cron)) {
    var nh = now.getHours() + 1;
    return nh >= 24 ? '明日 00:00' : '今日 ' + pad(nh) + ':00';
  }

  var m = /(\d{1,2}):(\d{2})/.exec(cron || '');
  if (!m) return null;

  var hh = parseInt(m[1], 10);
  var mm = parseInt(m[2], 10);
  var passed = (now.getHours() * 60 + now.getMinutes()) >= (hh * 60 + mm);
  var clock = pad(hh) + ':' + pad(mm);

  if (/每週一/.test(cron)) {
    var day = now.getDay();                       /* 0=週日 1=週一 */
    if (day === 1 && !passed) return '今日 ' + clock;
    var wait = (8 - day) % 7 || 7;                /* 到下一個週一還有幾天 */
    return (wait === 1 ? '明日 ' : '下週一 ') + clock;
  }
  return (passed ? '明日 ' : '今日 ') + clock;
}

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

function SchScheduleModal({ p, mounts, presetSkillId, editItem, pendingCount, onClose, onSubmit }) {
  var { C, fz } = useTheme();
  var all = ((p.knowledge || {}).sopManagement) || [];
  var isEdit = !!editItem;

  var [picked, setPicked]   = React.useState(isEdit ? editItem.skillId : (presetSkillId || null));
  var [cron, setCron]       = React.useState(isEdit ? editItem.cronLabel : SCH_CRON_OPTIONS[2]);
  var [name, setName]       = React.useState(isEdit ? editItem.name : '');
  var [renamed, setRenamed] = React.useState(false);   /* 自己動過名稱之後就不再被 Codify 標題蓋掉 */

  /* 清單只列真的選得到的：Production 且尚未掛上排程的 Codify。
     2026-08-01 決議 20 推翻「不可用的也列出來、標明原因」——實測三個課是
     設備 0 可選 / 7 鎖、製程 1/4、製造 1/3，打開幾乎整片是明知不可點的鎖頭。
     三種鎖住的性質不同，處置也不同：
       · 已掛排程 → 隱藏。事情已經完成，左欄排程清單本來就列著它（同畫面講兩次）
       · Skill 型 → 隱藏。這是類型邊界不是狀態，永遠不會變；該教的地方是 Skill 管理的分頁
       · 尚未生效 → 隱藏列，改用清單下方一句常駐規則說明，解釋「為什麼我的那份沒出現」 */
  var options = all.filter(function(s) { return !schBlockReason(s, mounts); })
    .map(function(s) { return { skill: s }; });

  /* 編輯模式的 Codify 是既定的，不能套 schBlockReason —— 它已經掛在「自己」身上 */
  var pickedSkill = isEdit
    ? all.find(function(s) { return s.id === editItem.skillId; }) || null
    : (picked ? all.find(function(s) { return s.id === picked; }) : null);
  if (!isEdit && pickedSkill && schBlockReason(pickedSkill, mounts)) pickedSkill = null;

  var pickedSteps  = pickedSkill ? (pickedSkill.plainSteps || []) : [];
  var confirmSteps = pickedSkill
    ? pickedSteps.filter(function(st) { return st.needsConfirm; }).length
    : (isEdit ? (editItem.confirmSteps || 0) : 0);
  var showConfirmAlert = !!pickedSkill || (isEdit && typeof editItem.confirmSteps === 'number');

  /* 新增時名稱預設沿用 Codify 標題；使用者改過就不再覆蓋 */
  React.useEffect(function() {
    if (isEdit || renamed) return;
    setName(pickedSkill ? pickedSkill.title : '');
  }, [picked]);

  /* 舊排程的時間寫法不見得在選項裡（例如一天跑三次），保留它、不要被下拉洗掉 */
  var cronChoices = SCH_CRON_OPTIONS.slice();
  if (isEdit && cronChoices.indexOf(editItem.cronLabel) < 0) cronChoices.unshift(editItem.cronLabel);

  var trimmed = name.trim();
  var changes = [];
  if (isEdit) {
    if (trimmed && trimmed !== editItem.name) changes.push('名稱 ' + editItem.name + ' → ' + trimmed);
    if (cron !== editItem.cronLabel) changes.push('執行時間 ' + editItem.cronLabel + ' → ' + cron);
  }
  var canSubmit = isEdit ? (!!trimmed && changes.length > 0) : (!!pickedSkill && !!trimmed);
  var nextRun = getNextRunLabel(cron);

  return (
    <antd.Modal
      open
      centered
      width={640}
      title={<span style={{ fontSize: fz(16), fontWeight: 600 }}>{isEdit ? '編輯排程' : '新增排程'}</span>}
      /* 內容比一屏高時讓內文自己捲，按鈕不能被推出畫面外 */
      styles={{ body: { maxHeight: 'calc(100vh - 232px)', overflowY: 'auto' } }}
      onCancel={onClose}
      okText={isEdit ? '儲存變更' : '建立排程'}
      cancelText="取消"
      okButtonProps={{ disabled: !canSubmit }}
      onOk={function() {
        if (!canSubmit) return;
        onSubmit({
          skill: pickedSkill,
          name: trimmed,
          cron: cron,
          summary: isEdit ? changes.join('、') : '建立排程',
        });
      }}
    >
      <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 16 }}>
        {isEdit
          ? '可以改名稱與執行時間。掛的是哪一份 Codify 不能改 —— 底下的執行紀錄都是它累積的。'
          : '排程只掛得上 Codify —— 每次步驟都一樣、結果可重現，沒人看著也不會出事。'}
      </div>

      {isEdit ? (
        /* 唯讀的 Codify：看得到是哪一份、也看得到為什麼不能換 */
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub, marginBottom: 8 }}>執行的 Codify</div>
          <div style={{ border: '1px solid ' + C.border, borderRadius: 8, padding: 16, background: C.bgPanel }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SkillTierTag tier="sop" />
              <span style={{ fontSize: fz(13), color: C.text, fontWeight: 500, flex: 1, minWidth: 0 }}>
                {pickedSkill ? pickedSkill.title : editItem.skill}
              </span>
              <span style={{ fontSize: fz(12) }}>🔒</span>
            </div>
            <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 8, lineHeight: 1.7 }}>
              不能換掉。這個排程底下的執行紀錄、產出物與介入紀錄都是這份 Codify 累積的，換掉之後同一份歷史會前後講不同的事。
              要改成別份，請停用本排程後另外新增，兩邊的歷史才各自留得住。
            </div>
          </div>
        </div>
      ) : (
      <React.Fragment>
      <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub, marginBottom: 8 }}>
        選一個 Codify
      </div>
      <div style={{ maxHeight: 288, overflowY: 'auto', border: '1px solid ' + C.border, borderRadius: 8 }} className="scrollbar-thin">
        {options.length === 0 && (
          <div style={{ padding: 16, fontSize: fz(13), color: C.textMuted }}>
            本課目前沒有可加入排程的 Codify。
          </div>
        )}
        {options.map(function(o) {
          var active = picked === o.skill.id;
          return (
            <div
              key={o.skill.id}
              onClick={function() { setPicked(o.skill.id); }}
              style={{
                padding: '8px 16px', borderBottom: '1px solid ' + C.border,
                cursor: 'pointer',
                background: active ? 'rgba(37,99,235,0.08)' : 'transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <SkillTierTag tier={o.skill.tier} />
                <span style={{ fontSize: fz(13), color: C.text, fontWeight: 500, flex: 1, minWidth: 0 }}>{o.skill.title}</span>
                <StatusTag stage={o.skill.stage} />
              </div>
            </div>
          );
        })}
      </div>
      {/* 常駐的規則說明，取代整排鎖頭。
          講的是規則不是筆數 —— 它要回答的是「我剛寫好的那份為什麼沒出現在這裡」。 */}
      <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 8, marginBottom: 16 }}>
        尚未生效的 Codify 無法設定排程。
      </div>
      </React.Fragment>
      )}

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

      {/* 名稱可改：課上習慣叫「早班 SPC 日報」，不必被 Codify 標題綁死 */}
      <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub, marginBottom: 8 }}>排程名稱</div>
      <antd.Input
        value={name}
        disabled={!isEdit && !pickedSkill}
        onChange={function(e) { setRenamed(true); setName(e.target.value); }}
      />
      <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 8, marginBottom: 16 }}>
        {isEdit ? '改名不影響既有的執行紀錄。' : '預設沿用 Codify 的名稱，可以改成課上習慣的叫法。'}
      </div>

      <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub, marginBottom: 8 }}>執行時間</div>
      <antd.Select value={cron} onChange={setCron} style={{ width: '100%' }}
        options={cronChoices.map(function(c) { return { value: c, label: c }; })}
      />
      {/* 改完最常見的問題是「這是現在生效還是明天」，直接寫出來 */}
      <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 8, marginBottom: 16 }}>
        {nextRun
          ? (isEdit ? '儲存後，下次執行：' : '建立後，下次執行：') + nextRun
          : '依班別結束時間觸發，沒有固定時刻。'}
      </div>

      {/* 設排程時就要知道會不會卡住，不然每天早上才發現停在第 3 步。
          「目前正卡著 N 次」併進同一則講完 —— 兩者都在講「這個排程會停下來等人」，
          分成兩個警示框就是同一畫面講兩次（決議 18 的分界標準）。 */}
      {showConfirmAlert && (
        confirmSteps > 0
          ? <antd.Alert
              type="warning"
              showIcon
              message={<span style={{ fontSize: fz(13), fontWeight: 600 }}>本 Codify 含 {confirmSteps} 個需確認步驟</span>}
              description={
                <span style={{ fontSize: fz(12), lineHeight: 1.7 }}>
                  排程執行到那幾步會暫停並通知，任何課員都可以決定，決定後才會繼續。不是設好就完全不用管。
                  {isEdit && pendingCount > 0 && (
                    <React.Fragment>
                      <br />
                      目前有 {pendingCount} 次執行正卡在決策點：改時間只影響之後的執行，那一次仍在等人決定，不會因此繼續、也不會被取消。
                    </React.Fragment>
                  )}
                </span>
              }
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

function SchedulingPage({ p, expandRunReq, decisions, onDecide, extraRuns, onRetry, extraItems, itemEdits, onCreateSchedule, onUpdateSchedule, newScheduleReq, onNewScheduleHandled }) {
  var { C, fz } = useTheme();
  const baseItems = getScheduleItems(p.key, extraRuns);
  /* 本 session 的設定變更疊在基準資料上；新建的排程走同一條路徑 */
  const items = applyScheduleEdits((extraItems || []).concat(baseItems), itemEdits);
  const ivsByRun = decisions || {};

  /* Codify → 已掛在哪個排程；與 Skill 管理共用同一份對照（含改過的名稱與時間）*/
  const mounts = getSkillScheduleMap(p.key, extraItems, itemEdits);
  const schedulableCount = countSchedulableSkills(p, mounts);

  const [showNew, setShowNew]       = React.useState(false);
  const [editingId, setEditingId]   = React.useState(null);
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
  /* 從 items 反查而不是把整個 item 存進 state —— 存進去的話存的是舊快照，
     改完之後 Modal 還拿著改之前的值 */
  const editingItem  = editingId ? items.find(i => i.id === editingId) || null : null;

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
        {/* 總覽的 header 與「單一排程詳情」的 header 原本幾乎同構（白底 + 15px 標題 +
            下面一整排執行紀錄），差別只有「詳情多了麵包屑」—— 靠某個東西不存在來辨識，
            辨識度本來就低，也是誤讀成詳情的一部分。這裡把原本 12px 灰色副標那三個數字
            升成一排統計，用字級差異把兩個 header 分開。
            ⚠️ 資訊沒有增加、只是換了視覺權重，所以不觸犯決議 18 的溝通疲勞；
            「待決定」刻意不放進來 —— 那是下方 Alert 的職責，放這裡就是同一畫面講兩次。 */}
        <div style={{ padding: '16px 24px', background: C.bg, borderBottom: '1px solid ' + C.border, flexShrink: 0 }}>
          <div style={{ fontSize: fz(15), fontWeight: 600, color: C.text }}>執行總覽</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 32, marginTop: 8 }}>
            {[
              { n: items.length,     label: '個排程' },
              { n: allRuns.length,   label: '次執行' },
              { n: errorRuns.length, label: '次失敗', danger: errorRuns.length > 0 },
            ].map(function (s) {
              return (
                <div key={s.label}>
                  <div style={{ fontSize: fz(20), fontWeight: 600, lineHeight: 1.2, color: s.danger ? '#DC2626' : C.text }}>{s.n}</div>
                  <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 2 }}>{s.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 待人工決定：跨排程集中在這裡，點一下直接跳過去 */}
          {pendingDecisions.length > 0 && (
            <antd.Alert
              type="error"
              /* 「全課」二字是刻意的：只有一件待決定時，這塊與「單一排程詳情」的決策點面板
                 長得幾乎一樣，講明它是跨排程的匯總才不會被讀成某一個排程的東西。
                 排程名改用膠囊標籤而不是句首藍字連結 —— 它回答的是「這是哪一個排程的事」，
                 不是這一頁的標題；改成整列可點，點擊區反而比原本的一段文字大。 */
              message={<span style={{ fontSize: fz(13), fontWeight: 600 }}>全課有 {pendingDecisions.length} 件待人工決定</span>}
              description={
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {pendingDecisions.map(function (d) {
                    return (
                      <div
                        key={d.run.id}
                        onClick={function () { setSelectedId(d.item.id); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                          fontSize: fz(12), color: C.textSub, cursor: 'pointer',
                        }}
                      >
                        <antd.Tag style={{ marginInlineEnd: 0, borderRadius: 999, background: C.bg, color: C.textSub, borderColor: C.border }}>
                          {d.item.name}
                        </antd.Tag>
                        <span>Step {d.step.num}「{d.step.title}」</span>
                        <span style={{ color: C.textMuted }}>
                          自 <span style={{ fontFamily: 'monospace' }}>{d.run.waitingSince || d.run.startedAt}</span> 起等待中
                        </span>
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
          {/* 左欄只放「去哪裡」，不放「出了什麼事」。
              導覽只有兩類：一個總覽 + N 個排程；警示（橫幅）不進左欄。

              決議 18 把「執行總覽」入口連同警示橫幅一起刪掉，右欄主畫面因此失去左欄來源
              —— 三欄式的隱含契約是「右欄有內容就有一個選中的左欄項目」，契約一斷，
              使用者會自動把最靠近的第一張卡片讀成右欄的來源。這裡只把「導覽入口」補回來，
              「警示橫幅」不補（那一半決議 18 是對的）。

              當時那版難用的原因不在「有兩種層級」，在於層級沒有被畫出來：
              ① 總覽用「左藍邊條」、排程用「整張卡變藍框」，同一欄兩套選中語彙，
                 認不出彼此是同一組互斥選項 → 本版統一成「藍框 + 淡藍底」一套；
              ② 總覽那列自己帶著「N 次執行 · M 次失敗」紅字，於是它不是導覽是第二條警示
                 → 本版不帶任何數字，統計全部移到右欄總覽的 header；
              ③ 層級差異只靠一條分隔線，跟卡片間距一樣重
                 → 本版改用留白（24px）+ 分組小標題，用分組的語言而不是警示的語言。
              形態不同（扁列 vs 卡片）負責「這不是第 0 個排程」，
              選中語彙相同負責「這兩者是同一組選項」。 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            {/* 執行總覽：純導覽，不帶數字、不帶紅點 */}
            <div
              onClick={function () { setSelectedId(SCH_ALL); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                border: '1px solid ' + (isOverview ? '#2563EB' : 'transparent'),
                background: isOverview ? 'rgba(37,99,235,0.04)' : 'transparent',
              }}
            >
              <span style={{ fontSize: fz(13), color: isOverview ? '#2563EB' : C.textMuted }}>▤</span>
              <span style={{ fontSize: fz(13), fontWeight: 600, color: isOverview ? '#2563EB' : C.text }}>執行總覽</span>
            </div>

            {/* 分組小標：層級差異靠留白與小標，不靠顏色 */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginTop: 24, marginBottom: 8,
            }}>
              <span style={{ fontSize: fz(11), fontWeight: 600, color: C.textMuted, letterSpacing: '0.06em' }}>排程清單</span>
              {/* 沒東西可加時停用，理由改成 hover／點擊才出現的 Tooltip。
                  不做常駐副標的兩個理由：
                  ① 一句常駐的話得同時涵蓋「完全沒有 Codify」「有但都沒生效」「都掛上排程了」
                     三種狀況，寫死任何一種，另外兩種就是錯的；
                  ② 穩定狀態本來就是「都設定完了」，每次進來被提醒一次是溝通疲勞。
                  ⚠️ 停用的 Button 不發滑鼠事件，Tooltip 必須包一層才觸發得到；
                  ⚠️ trigger 補上 click，手機沒有 hover，否則這個解釋在手機上等於不存在。 */}
              {schedulableCount === 0 ? (
                <antd.Tooltip title="目前沒有可設定排程的 Codify" trigger={['hover', 'focus', 'click']}>
                  <span style={{ display: 'inline-block', cursor: 'not-allowed' }}>
                    <antd.Button type="primary" size="small" disabled style={{ pointerEvents: 'none' }}>
                      ＋ 新增
                    </antd.Button>
                  </span>
                </antd.Tooltip>
              ) : (
                <antd.Button
                  type="primary" size="small"
                  onClick={function() { setPreset(null); setShowNew(true); }}
                >＋ 新增</antd.Button>
              )}
            </div>
            {/* 還有東西可以加時才講 —— 這句是「有事可做」的入口，點得下去，
                與上面那個停用理由性質不同，不因為它改 hover 就一起收掉 */}
            {schedulableCount > 0 && (
              <div
                onClick={function() { setPreset(null); setShowNew(true); }}
                style={{ fontSize: fz(11), marginBottom: 8, color: '#2563EB', cursor: 'pointer' }}
              >
                還有 {schedulableCount} 份 Codify 可加入排程
              </div>
            )}
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
                    {/* 邊框與底色這個視覺通道只表示「選中」，不兼差表示狀態。
                        待決定原本額外吃掉紅框＋粉底，於是未被選中的卡片比真正選中的那一項還搶眼，
                        眼睛會先落在它身上 —— 這正是「右欄總覽被讀成第一張卡片的詳情」的推力之一。
                        狀態改由紅點與「待決定」標籤表達（兩者都還在，已經夠了）。 */}
                    <antd.Card
                      size="small" hoverable
                      onClick={() => setSelectedId(item.id)}
                      style={{
                        width: '100%',
                        borderColor: isActive ? '#2563EB' : C.border,
                        backgroundColor: isActive ? 'rgba(37,99,235,0.04)' : undefined,
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
                  {getNextRunLabel(selectedItem.cronLabel) && (
                    <React.Fragment>　·　下次執行：{getNextRunLabel(selectedItem.cronLabel)}</React.Fragment>
                  )}
                </div>
                {/* 排程改的是「沒人在場時 AI 幾點會動作」，比一般設定變更重份量 ——
                    誰最後一次動過它、動了什麼，要留得住（延續決議 17 的稽核精神）。 */}
                {selectedItem.lastChange && (
                  <div style={{ fontSize: fz(12), color: C.textMuted, marginTop: 2 }}>
                    最後變更：{selectedItem.lastChange.by}　·　{selectedItem.lastChange.at}　·　{selectedItem.lastChange.summary}
                  </div>
                )}
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
                <antd.Button size="small" onClick={function() { setEditingId(selectedItem.id); }}>編輯排程</antd.Button>
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

      {/* 新增／編輯排程：同一個表單的兩種模式。
          新增只列得出真的選得到的 Codify；編輯不讓換 Codify（理由見 SchScheduleModal 的註解）。 */}
      {(showNew || editingItem) && (
        <SchScheduleModal
          p={p}
          mounts={mounts}
          presetSkillId={presetSkillId}
          editItem={editingItem}
          pendingCount={editingItem ? pendingDecisions.filter(function(d) { return d.item.id === editingItem.id; }).length : 0}
          onClose={function() { setShowNew(false); setPreset(null); setEditingId(null); }}
          onSubmit={function(out) {
            var stamp = { by: p.user.name, at: nowLabel(), summary: out.summary };

            if (editingItem) {
              onUpdateSchedule(editingItem.id, { name: out.name, cronLabel: out.cron, lastChange: stamp });
              setEditingId(null);
              return;
            }

            var skill = out.skill;
            var confirmSteps = (skill.plainSteps || []).filter(function(st) { return st.needsConfirm; }).length;
            var newItem = {
              id: 'sch-new-' + Date.now(),
              name: out.name,
              skill: skill.id,
              skillId: skill.id,
              hasWrite: !!skill.hasWrite,
              confirmSteps: confirmSteps,
              cronLabel: out.cron,
              createdBy: p.user.name,
              lastChange: stamp,
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
