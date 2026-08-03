/* ════════════════════════════════════════
   SCHEDULING PAGE — 決策收件匣（IA 方向 B）

   頁面的主詞是「事」，不是「排程」。一條規則貫穿全頁：
   **左欄選什麼，右欄只出現什麼。**

   左欄 ＝ 工作佇列
   · 待處理／全部紀錄：唯一的模式切換（膠囊二選一），預設停在待處理 ——
     班次交接時第一眼就是待辦，不是統計。
   · 待處理項只給「類型＋件數」：是哪一個排程、卡在哪一步全部留到右欄。
     312px 放不下兩件事，件數多的時候更放不下。
   · 排程健康（分隔線以下）不是導覽主體，是監看清單：一列只有點＋名稱＋時間兩層，
     回答「今天都跑了嗎」。點一列＝把右欄的範圍換成那個排程。

   右欄 ＝ 決策台
   · header 只講「還有幾件、最久等多久」—— 總覽的價值是催辦不是統計。
   · 決策卡把「AI 要做什麼／參數／依據」攤平在同一屏，動作列直接可按，
     不必先進詳情再回來。
   · 設定類動作走右側抽屜（排程管理／編輯／新增），不換頁、不奪走佇列上下文。

   沿用的既有決議：
   · 決議 17：沒有認領、沒有 AI 對話出口；先送出者定案，決定不可撤回；
     interventions[] 是唯一稽核序列。
   · 決議 19：建立與編輯共用一個表單；掛的 Codify 不可改；變更留痕 lastChange。
   · 決議 20／21：新增只列選得到的 Codify；沒得選時停用入口並用 Tooltip 說明。
   ⚠️ 本版把「拒絕執行（終止整次執行）」的入口從決策卡移除（設計檔的動作列是
      同意並繼續／改參數／略過此步）。資料層與歷史紀錄的 reject 仍然渲染得出來。
   ════════════════════════════════════════ */

/* ── Run result config ── */
const SCH_RUN_CFG = {
  success:  { label: '完成',    color: '#16A34A', bg: 'rgba(34,197,94,0.1)',    icon: '✓' },
  pending:  { label: '待決定',  color: '#D97706', bg: 'rgba(217,119,6,0.1)',    icon: '⏸' },
  error:    { label: '執行失敗', color: '#DC2626', bg: 'rgba(239,68,68,0.1)',   icon: '✕' },
  rejected: { label: '已拒絕',  color: '#6B7280', bg: 'rgba(107,114,128,0.1)', icon: '✕' },
};

/* 狀態圓點：10x10 圓形，四色而已 —— 綠＝正常、琥珀＝等人、紅＝失敗、灰＝停用/不適用 */
const SCH_DOT = {
  success: '#16A34A', pending: '#D97706', error: '#DC2626',
  rejected: '#9CA3AF', idle: '#9CA3AF', disabled: '#9CA3AF',
};

function SchDot({ tone, size }) {
  const sz = size || 10;
  return (
    <span style={{
      width: sz, height: sz, borderRadius: 999, flexShrink: 0,
      background: SCH_DOT[tone] || SCH_DOT.idle, display: 'inline-block',
    }} />
  );
}

/* ── Step icon（Timeline 自訂 dot；AntD 預設圓點無法帶狀態字符）── */
const STEP_ICON_CFG = {
  done:     { bg: 'rgba(34,197,94,0.15)',   color: '#16A34A', text: '✓' },
  waiting:  { bg: 'rgba(217,119,6,0.15)',   color: '#D97706', text: '⏸' },
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
   無論該次執行最後是成功、拒絕還是失敗，這一列都必須留著（決議 17）。 */
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
          {iv.paramsAfter && <span style={{ color: '#D97706', fontWeight: 600 }}>（已改參數）</span>}
        </div>
        {/* 改過參數就要看得出改了什麼 —— 「因為誰的確認，AI 帶什麼參數呼叫了哪個 tool」
            是決議 17 稽核序列的核心，參數被人動過而沒留痕就等於序列斷了 */}
        {iv.paramsAfter && (
          <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 2, fontFamily: 'monospace' }}>
            參數：{iv.paramsBefore || '（原本為空）'} → {iv.paramsAfter}
          </div>
        )}
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
        <div style={{ fontSize: fz(12), color: s.status === 'waiting' ? '#D97706' : C.textMuted, marginTop: 2 }}>
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
   SchDecisionReasonModal — 略過的理由輸入（選填）

   流程沒斷，但那一步確實沒做，能寫還是要寫。
   （拒絕執行的必填理由邏輯留在 SCH_DECISION_CFG，本版沒有拒絕的入口。）
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
   SchParamsModal — 改參數後確認

   「同意」與「同意但我改了參數」不是同一件事：後者是人改寫了 AI 要送出去的東西，
   稽核序列必須記得住改前與改後（見 SchInterventionLine 的參數列）。
   工具本身不能換 —— 換工具等於換一個步驟，那不是介入是改流程。
   ════════════════════════════════════════ */
function SchParamsModal({ step, onCancel, onSubmit }) {
  var { C, fz } = useTheme();
  var before = step.mcpParams || '';
  var [params, setParams] = React.useState(before);
  var [reason, setReason] = React.useState('');
  var changed = params.trim() !== before.trim();

  return (
    <antd.Modal
      open
      centered
      width={560}
      title={<span style={{ fontSize: fz(16), fontWeight: 600 }}>改參數並繼續 — Step {step.num}「{step.title}」</span>}
      onCancel={onCancel}
      okText="改參數並繼續"
      cancelText="取消"
      okButtonProps={{ disabled: !changed || params.trim() === '' }}
      onOk={function () { if (changed) onSubmit(params.trim(), reason.trim()); }}
    >
      <div style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.7, marginBottom: 16 }}>
        AI 會用你改過的參數呼叫這個工具，然後繼續往下執行。
      </div>
      <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub, marginBottom: 8 }}>工具（不可更換）</div>
      <div style={{
        border: '1px solid ' + C.border, borderRadius: 6, padding: '8px 16px', marginBottom: 16,
        fontFamily: 'monospace', fontSize: fz(13), color: C.textMuted, background: C.bgPanel,
      }}>{step.mcpTool || 'unknown.tool'}</div>

      <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub, marginBottom: 8 }}>參數</div>
      <antd.Input.TextArea
        rows={3}
        value={params}
        onChange={function (e) { setParams(e.target.value); }}
        style={{ fontFamily: 'monospace', marginBottom: 8 }}
      />
      <div style={{ fontSize: fz(11), color: C.textMuted, marginBottom: 16, fontFamily: 'monospace' }}>
        原本：{before || '（空）'}
      </div>

      <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub, marginBottom: 8 }}>為什麼改（選填）</div>
      <antd.Input.TextArea
        rows={2}
        value={reason}
        onChange={function (e) { setReason(e.target.value); }}
        style={{ marginBottom: 16 }}
      />
      <antd.Alert
        type="warning"
        showIcon
        message={<span style={{ fontSize: fz(12), lineHeight: 1.7 }}>
          會記下你的名字、時間與改前改後的參數，且無法變更或撤回。
        </span>}
      />
    </antd.Modal>
  );
}

/* ════════════════════════════════════════
   排程設定（抽屜）用的小工具
   ════════════════════════════════════════ */

/* 頻率選項。「每班結束前 N 分鐘」沒有固定時刻，選它就沒有時間欄位。 */
const SCH_FREQ_OPTIONS = ['每日', '每週一', '每小時整點', '每班結束前 30 分鐘'];

/* 'cronLabel' → { freq, time }；解析不出來的（例如一天跑三次）回 null，
   由呼叫端改成唯讀顯示 —— 不能因為表單不認得就把它洗成單一時刻。 */
function schParseCron(label) {
  if (!label) return null;
  if (/^每小時整點$/.test(label)) return { freq: '每小時整點', time: '' };
  if (/^每班結束前/.test(label)) return { freq: '每班結束前 30 分鐘', time: '' };
  var m = /^(每日|每週一)\s+(\d{1,2}:\d{2})$/.exec(label);
  if (!m) return null;
  return { freq: m[1], time: m[2] };
}

function schComposeCron(freq, time) {
  if (freq === '每小時整點' || freq === '每班結束前 30 分鐘') return freq;
  return freq + ' ' + time;
}

/* 給人看的 cron 表達式 —— 排程頁最容易吵的是「我以為它是每天」，寫出來最省事 */
function schCronExpr(freq, time) {
  var m = /^(\d{1,2}):(\d{2})$/.exec(time || '');
  if (freq === '每小時整點') return '0 * * * *';
  if (!m) return null;
  var hh = +m[1], mm = +m[2];
  if (freq === '每日')   return mm + ' ' + hh + ' * * *';
  if (freq === '每週一') return mm + ' ' + hh + ' * * 1';
  return null;
}

/* 左欄「排程健康」那一列右邊的短標籤：一列只放兩層資訊，時間要短 */
function schCronShort(item) {
  if (!isScheduleEnabled(item)) return '已停用';
  var times = (item.cronLabel || '').match(/\d{1,2}:\d{2}/g) || [];
  if (times.length > 1) return '×' + times.length + ' /日';
  if (times.length === 1) return /每週一/.test(item.cronLabel) ? '週一 ' + times[0] : times[0];
  return item.cronLabel || '—';
}

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
   mounts 來自 getSkillScheduleMap()，與 Skill 管理共用同一份對照。
   ⚠️ 停用的排程仍算「已掛」——要放回可選清單只能刪除排程（決議 19 前置決策）。 */
function schBlockReason(s, mounts) {
  if (s.tier !== 'sop') {
    return { text: SKILL_TIER_CFG[s.tier].label + ' 不能設排程：每次結果不一樣，需要有人在場看' };
  }
  if (s.stage !== 'production') {
    return { text: '尚未生效（目前在 ' + SKILL_STAGE_CFG[s.stage].label + '），簽核通過才能排程' };
  }
  var m = (mounts || {})[s.id];
  if (m) {
    return { text: '已掛在排程「' + m.scheduleName + '」（' + m.cronLabel + '）', jumpTo: m.scheduleId };
  }
  return null;
}

/* 本課還有幾份 Codify 可以加入排程 —— 讓人不必打開抽屜才知道 */
function countSchedulableSkills(p, mounts) {
  return (((p.knowledge || {}).sopManagement) || [])
    .filter(function (s) { return !schBlockReason(s, mounts); }).length;
}

/* ════════════════════════════════════════
   SchScheduleDrawer — 排程管理／編輯／新增（480px 右抽屜，三個檢視共用一個殼）

   為什麼是抽屜不是換頁：改設定的人通常是從佇列過來的（「這支老是卡住，把時間改掉」），
   換頁會把佇列上下文整個抽走；抽屜關掉就回到原本那件事。
   為什麼編輯不再彈第二層 Modal：抽屜上疊 Modal 是兩層浮層，返回路徑會變成兩顆叉。
   改成抽屜內就地換檢視，左上一個「‹ 排程管理」回得去。

   可改的只有「這個課怎麼跑它」——名稱、執行時間、暫停時通知對象、啟用。
   ⚠️ 掛的是哪一份 Codify 不可改（決議 19）；
   ⚠️ 哪些步驟要人工確認也不可改：那是 Codify 的 Skill 定義的，
      在排程層關掉等於課級自行解除 HITL 約束，這裡只唯讀顯示。
   ════════════════════════════════════════ */
function SchScheduleDrawer({
  p, items, mounts, view, editItem, presetSkillId, toneOf,
  onChangeView, onClose, onCreate, onUpdate, onToggleEnabled,
}) {
  var { C, fz } = useTheme();
  var all = ((p.knowledge || {}).sopManagement) || [];
  var options = all.filter(function (s) { return !schBlockReason(s, mounts); });
  var schedulableCount = options.length;

  var isEdit = view === 'edit' && !!editItem;
  var isNew  = view === 'new';

  /* ── 表單 state（每次切換檢視重新初始化）── */
  var initCron = isEdit ? schParseCron(editItem.cronLabel) : { freq: '每日', time: '08:00' };
  var [picked, setPicked] = React.useState(isNew ? (presetSkillId || null) : null);
  var [name, setName]     = React.useState(isEdit ? editItem.name : '');
  var [renamed, setRenamed] = React.useState(false);
  var [freq, setFreq]     = React.useState(initCron ? initCron.freq : '每日');
  var [time, setTime]     = React.useState(initCron ? initCron.time : '08:00');
  var [enabled, setEnabled] = React.useState(isEdit ? isScheduleEnabled(editItem) : true);
  var [notify, setNotify] = React.useState(
    (isEdit && editItem.notifyTo) || (p.name + ' · 全體課員')
  );

  /* 切到別的檢視／別的排程時，表單要跟著換 —— 不然會拿著上一個排程的值 */
  React.useEffect(function () {
    if (isEdit) {
      var c = schParseCron(editItem.cronLabel);
      setName(editItem.name);
      setRenamed(false);
      setFreq(c ? c.freq : '');
      setTime(c ? c.time : '');
      setEnabled(isScheduleEnabled(editItem));
      setNotify(editItem.notifyTo || (p.name + ' · 全體課員'));
    } else if (isNew) {
      setPicked(presetSkillId || null);
      setName('');
      setRenamed(false);
      setFreq('每日');
      setTime('08:00');
      setEnabled(true);
      setNotify(p.name + ' · 全體課員');
    }
  }, [view, editItem && editItem.id, presetSkillId]);

  var pickedSkill = isNew && picked ? all.find(function (s) { return s.id === picked; }) : null;
  if (pickedSkill && schBlockReason(pickedSkill, mounts)) pickedSkill = null;

  /* 新增時名稱預設沿用 Codify 標題；使用者改過就不再覆蓋 */
  React.useEffect(function () {
    if (!isNew || renamed) return;
    setName(pickedSkill ? pickedSkill.title : '');
  }, [picked]);

  /* 這支排程會在哪幾步停下來等人 —— 由 Skill 定義，兩個檢視都只是唯讀顯示 */
  var confirmStepList = (function () {
    var skill = pickedSkill || (isEdit ? all.find(function (s) { return s.id === editItem.skillId; }) : null);
    if (!skill) return null;
    var steps = skill.plainSteps || [];
    return { total: steps.length, list: steps.filter(function (st) { return st.needsConfirm; }) };
  })();

  /* 舊排程的時間寫法不見得解析得出來（例如一天跑三次），保留它、不要被表單洗掉 */
  var cronParsed = isEdit ? schParseCron(editItem.cronLabel) : { freq: freq, time: time };
  var cronEditable = isEdit ? !!cronParsed : true;
  var noTime = freq === '每小時整點' || freq === '每班結束前 30 分鐘';
  var timeValid = noTime || /^\d{1,2}:\d{2}$/.test(time);
  var composed = cronEditable ? schComposeCron(freq, time) : (isEdit ? editItem.cronLabel : '');
  var nextRun = getNextRunLabel(composed);
  var cronExpr = cronEditable ? schCronExpr(freq, time) : null;

  var trimmed = name.trim();
  var changes = [];
  if (isEdit) {
    if (trimmed && trimmed !== editItem.name) changes.push('名稱 ' + editItem.name + ' → ' + trimmed);
    if (cronEditable && composed !== editItem.cronLabel) changes.push('執行時間 ' + editItem.cronLabel + ' → ' + composed);
    if (notify !== (editItem.notifyTo || (p.name + ' · 全體課員'))) changes.push('通知對象 → ' + notify);
    if (enabled !== isScheduleEnabled(editItem)) changes.push(enabled ? '重新啟用' : '停用排程');
  }
  var canSave   = isEdit && !!trimmed && timeValid && changes.length > 0;
  var canCreate = isNew && !!pickedSkill && !!trimmed && timeValid;

  /* ── 共用欄位標題 ── */
  var Label = function (props) { return (
    <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub, marginBottom: 8 }}>{props.children}</div>
    ); };
  var Hint = function (props) { return (
    <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 8, lineHeight: 1.7 }}>{props.children}</div>
    ); };

  /* ── 檢視 1：排程管理清單 ──
     只回答「這個排程被設定成什麼樣」，不放執行紀錄（那是右欄的事）。 */
  var renderList = function () { return (
    <div style={{ padding: '16px 24px' }}>
      {items.map(function (item, idx) {
        var on = isScheduleEnabled(item);
        var next = on ? getNextRunLabel(item.cronLabel) : null;
        return (
          <div key={item.id} style={{
            padding: '16px 0',
            borderBottom: idx === items.length - 1 ? 'none' : '1px solid ' + C.border,
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* 圓點與左欄「排程健康」同一份判斷，兩邊不會對同一支排程講不一樣的話 */}
              <SchDot tone={toneOf ? toneOf(item) : (on ? 'success' : 'disabled')} />
              <span style={{ fontSize: fz(14), fontWeight: 600, color: on ? C.text : C.textMuted, flex: 1, minWidth: 0 }}>
                {item.name}{on ? '' : '（已停用）'}
              </span>
              <antd.Switch
                size="small"
                checked={on}
                onChange={function () { onToggleEnabled(item); }}
              />
              <a style={{ fontSize: fz(14) }} onClick={function () { onChangeView('edit', item.id); }}>編輯</a>
            </div>
            <span style={{ fontSize: fz(12), color: C.textSub, fontFamily: 'monospace' }}>
              {item.cronLabel} · {item.skill}
            </span>
            <span style={{ fontSize: fz(12), color: C.textMuted }}>
              {item.createdBy}
              {on
                ? (next ? ' · 下次執行 ' : ' · ') + (next || '依班別觸發')
                : ' · 停用於 ' + (item.disabledAt || '—')}
              {typeof item.confirmSteps === 'number' && on && (
                item.confirmSteps > 0 ? ' · 含 ' + item.confirmSteps + ' 個需確認步驟' : ' · 無需確認步驟'
              )}
            </span>
          </div>
        );
      })}
      {items.length === 0 && (
        <antd.Empty style={{ padding: 24 }} description={<span style={{ fontSize: fz(13), color: C.textMuted }}>本課還沒有排程</span>} />
      )}
    </div>
    ); };

  /* ── 檢視 2／3：編輯與新增（同一組欄位，差別只在第一欄要不要選 Codify）── */
  var renderForm = function () { return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {isNew && (
        <div>
          <Label>要排程哪一支 Codify</Label>
          <antd.Select
            value={picked || undefined}
            onChange={function (v) { setPicked(v); }}
            style={{ width: '100%' }}
            placeholder="選一支 Codify"
            options={options.map(function (s) {
              return { value: s.id, label: s.title + '　' + s.id };
            })}
          />
          {/* 講的是規則不是筆數 —— 它要回答的是「我剛寫好的那份為什麼沒出現在這裡」（決議 20）*/}
          <Hint>尚未生效的 Codify 無法設定排程。</Hint>
        </div>
      )}

      {isEdit && (
        <div>
          <Label>執行的 Codify（不可更換）</Label>
          <div style={{ border: '1px solid ' + C.border, borderRadius: 6, padding: '8px 16px', background: C.bgPanel }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SkillTierTag tier="sop" />
              <span style={{ fontSize: fz(14), color: C.text, flex: 1, minWidth: 0 }}>{editItem.skill}</span>
              <span style={{ fontSize: fz(12) }}>🔒</span>
            </div>
          </div>
          <Hint>
            這個排程底下的執行紀錄、產出物與介入紀錄都是這份 Codify 累積的，換掉之後同一份歷史會前後講不同的事。
            要換成別份，請停用本排程後另外新增。
          </Hint>
        </div>
      )}

      <div>
        <Label>排程名稱</Label>
        <antd.Input
          value={name}
          disabled={isNew && !pickedSkill}
          onChange={function (e) { setRenamed(true); setName(e.target.value); }}
        />
        <Hint>{isNew ? '預設沿用 Codify 名稱，可自行改成課內叫法' : '改名不影響既有的執行紀錄'}</Hint>
      </div>

      <div>
        <Label>執行時間</Label>
        {cronEditable ? (
          <React.Fragment>
            <div style={{ display: 'flex', gap: 8 }}>
              <antd.Select
                value={freq}
                onChange={setFreq}
                style={{ flex: 1 }}
                options={SCH_FREQ_OPTIONS.map(function (f) { return { value: f, label: f }; })}
              />
              {!noTime && (
                <antd.Input
                  value={time}
                  status={timeValid ? '' : 'error'}
                  onChange={function (e) { setTime(e.target.value); }}
                  style={{ flex: 1, fontFamily: 'monospace' }}
                  placeholder="07:50"
                />
              )}
            </div>
            <Hint>
              {timeValid
                ? (cronExpr
                    ? (isEdit ? '目前 ' : '將產生 ') + cronExpr + ' · 改動只影響下一次執行'
                    : '依班別結束時間觸發，沒有固定時刻')
                : '時間格式請填 HH:MM'}
            </Hint>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <div style={{
              border: '1px solid ' + C.border, borderRadius: 6, padding: '8px 16px',
              fontSize: fz(14), color: C.textMuted, background: C.bgPanel, fontFamily: 'monospace',
            }}>{editItem.cronLabel}</div>
            <Hint>這個排法一天跑多次，表單改不了；要改請先停用後另建。</Hint>
          </React.Fragment>
        )}
      </div>

      {confirmStepList && (
        <div>
          <Label>需人工確認的步驟（唯讀）</Label>
          {confirmStepList.list.length === 0 ? (
            <div style={{
              border: '1px solid ' + C.border, borderRadius: 6, padding: 16,
              fontSize: fz(14), color: C.textMuted,
            }}>沒有需要人工確認的步驟，時間到就有產出。</div>
          ) : (
            <div style={{ border: '1px solid ' + C.border, borderRadius: 6 }}>
              {confirmStepList.list.map(function (st, i) {
                return (
                  <div key={st.num} style={{
                    padding: 16, display: 'flex', alignItems: 'center', gap: 8,
                    borderBottom: i === confirmStepList.list.length - 1 ? 'none' : '1px solid ' + C.border,
                  }}>
                    <SchDot tone="pending" />
                    <span style={{ fontSize: fz(14), color: C.text, flex: 1, minWidth: 0 }}>
                      Step {st.num} · {st.label}
                    </span>
                    <span style={{ fontSize: fz(12), color: C.textMuted, fontFamily: 'monospace' }}>必須人工確認</span>
                  </div>
                );
              })}
            </div>
          )}
          {/* 這一段刻意不是開關：關掉＝課級自行解除 Human-in-the-loop，
              而 HITL 是排程能存在的前提（見 brain/entities/modules/scheduling.md）*/}
          <Hint>
            這些步驟一律暫停等人決定，不可關閉；由 Codify 的 Skill 定義，共 {confirmStepList.total} 步驟其中 {confirmStepList.list.length} 步需人工確認。
          </Hint>
        </div>
      )}

      <div>
        <Label>暫停時通知</Label>
        <antd.Select
          value={notify}
          onChange={setNotify}
          style={{ width: '100%' }}
          options={[
            { value: p.name + ' · 全體課員', label: p.name + ' · 全體課員' },
            { value: p.name + ' · 課長', label: p.name + ' · 課長' },
            { value: '建立者本人', label: '建立者本人' },
          ]}
        />
        <Hint>任何課員都可決定；等待逾 2h 再通知課長。</Hint>
      </div>

      {isEdit && (
        <div style={{ borderTop: '1px solid ' + C.border, paddingTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: fz(14), fontWeight: 600, color: C.text, flex: 1 }}>啟用此排程</span>
            <antd.Switch checked={enabled} onChange={setEnabled} />
          </div>
          <Hint>
            停用＝不再自動觸發，排程與歷史都留著，那份 Codify 仍算已掛排程。
            {' '}Skill <span style={{ fontFamily: 'monospace' }}>{editItem.skill}</span> 的步驟邏輯由 Codify 定義。
          </Hint>
        </div>
      )}
    </div>
    ); };

  /* ── 底部固定列 ── */
  var footer = null;
  if (view === 'list') {
    footer = (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* 沒東西可加時停用，理由改成 hover／點擊才出現的 Tooltip（決議 21）。
            ⚠️ 停用的 Button 不發滑鼠事件，Tooltip 要包一層才觸發得到；
            ⚠️ 手機沒有 hover，trigger 補上 click。 */}
        {schedulableCount === 0 ? (
          <antd.Tooltip title="目前沒有可設定排程的 Codify" trigger={['hover', 'focus', 'click']}>
            <span style={{ display: 'inline-block', cursor: 'not-allowed' }}>
              <antd.Button type="primary" disabled style={{ pointerEvents: 'none' }}>＋ 新增排程</antd.Button>
            </span>
          </antd.Tooltip>
        ) : (
          <antd.Button type="primary" onClick={function () { onChangeView('new'); }}>＋ 新增排程</antd.Button>
        )}
        <span style={{ fontSize: fz(12), color: C.textMuted }}>停用中的排程不會再自動執行</span>
      </div>
    );
  } else if (isEdit) {
    footer = (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <antd.Button
          type="primary"
          disabled={!canSave}
          onClick={function () {
            onUpdate(editItem.id, {
              name: trimmed,
              cronLabel: cronEditable ? composed : editItem.cronLabel,
              notifyTo: notify,
              enabled: enabled,
              summary: changes.join('、'),
            });
          }}
        >儲存變更</antd.Button>
        <antd.Button onClick={function () { onChangeView('list'); }}>取消</antd.Button>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: fz(12), color: C.textMuted }}>
          下次執行 <span style={{ fontFamily: 'monospace' }}>{enabled ? (nextRun || '依班別觸發') : '—'}</span>
        </span>
      </div>
    );
  } else {
    footer = (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <antd.Button
          type="primary"
          disabled={!canCreate}
          onClick={function () {
            onCreate({ skill: pickedSkill, name: trimmed, cron: composed, notifyTo: notify });
          }}
        >建立並啟用</antd.Button>
        <antd.Button onClick={function () { onChangeView('list'); }}>取消</antd.Button>
        <span style={{ flex: 1 }} />
        {canCreate && (
          <span style={{ fontSize: fz(12), color: C.textMuted }}>
            第一次執行 <span style={{ fontFamily: 'monospace' }}>{nextRun || '依班別觸發'}</span>
          </span>
        )}
      </div>
    );
  }

  var title = view === 'list'
    ? (
      <div>
        <div style={{ fontSize: fz(18), fontWeight: 600, color: C.text }}>排程管理</div>
        <div style={{ fontSize: fz(14), color: C.textMuted, marginTop: 8 }}>{p.name} · {items.length} 個排程</div>
      </div>
    )
    : (
      <div>
        {/* 抽屜內就地換檢視，不疊第二層浮層 —— 返回只有一條路 */}
        <a style={{ fontSize: fz(14) }} onClick={function () { onChangeView('list'); }}>‹ 排程管理</a>
        <div style={{ fontSize: fz(18), fontWeight: 600, color: C.text, marginTop: 8 }}>
          {isEdit ? '編輯：' + editItem.name : '新增排程'}
        </div>
      </div>
    );

  return (
    <antd.Drawer
      open
      width={480}
      placement="right"
      title={title}
      onClose={onClose}
      footer={footer}
      /* 關閉鈕擺右上：AntD 預設放標題左側，會跟「‹ 排程管理」這條返回路徑擠在一起，
         兩個看起來都像「回上一步」的東西並排，等於沒有一條清楚的返回路徑 */
      closable={false}
      extra={<a onClick={onClose} style={{ fontSize: fz(18), color: C.textMuted }}>✕</a>}
      styles={{ body: { padding: 0 } }}
    >
      {view === 'list' ? renderList() : renderForm()}
    </antd.Drawer>
  );
}

/* ════════════════════════════════════════
   SCHEDULING PAGE MAIN
   ════════════════════════════════════════ */
const SCH_Q_DECISION = 'q-decision';   /* 左欄佇列：待人工決定 */
const SCH_Q_FAILURE  = 'q-failure';    /* 左欄佇列：失敗待確認 */
const SCH_ALL        = '__all__';      /* 「全部紀錄」模式的右欄 */

function SchedulingPage({
  p, expandRunReq, decisions, onDecide, extraRuns, onRetry, extraItems, itemEdits,
  onCreateSchedule, onUpdateSchedule, newScheduleReq, onNewScheduleHandled, acks, onAck,
}) {
  var { C, fz } = useTheme();
  const baseItems = getScheduleItems(p.key, extraRuns);
  /* 本 session 的設定變更疊在基準資料上；新建的排程走同一條路徑 */
  const items = applyScheduleEdits((extraItems || []).concat(baseItems), itemEdits);
  const ivsByRun = decisions || {};
  const ackMap   = acks || {};

  /* Codify → 已掛在哪個排程；與 Skill 管理共用同一份對照（含改過的名稱與時間）*/
  const mounts = getSkillScheduleMap(p.key, extraItems, itemEdits);
  const schedulableCount = countSchedulableSkills(p, mounts);

  /* ── 兩個佇列 ── */
  const decisionQueue = getDecisionQueue(items, ivsByRun);
  const failureQueue  = getFailureQueue(items, ivsByRun, ackMap);
  const pendingTotal  = decisionQueue.length + failureQueue.length;

  /* ── 左欄選取 ──
     一次只有一個選中：兩張分類卡、N 個排程、或「全部紀錄」。 */
  const [mode, setMode] = React.useState('pending');       /* pending | all */
  const [sel, setSel]   = React.useState(SCH_Q_DECISION);
  const [drawer, setDrawer] = React.useState(null);        /* { view, itemId, presetSkillId } */
  const [expandedQ, setExpandedQ] = React.useState(null);  /* 佇列中展開的那一件 runId */
  const [expandedRuns, setExpandedRuns] = React.useState(new Set());
  const [runFilter, setRunFilter] = React.useState('all');
  const [reasonModal, setReasonModal] = React.useState(null);   /* { action, run, step } */
  const [paramsModal, setParamsModal] = React.useState(null);   /* { run, step } */
  const [showRawError, setShowRawError] = React.useState(null); /* runId */
  const [conflict, setConflict] = React.useState(null);

  /* 進門停在有事的那一類：兩類都空的時候仍停在「待人工決定」，
     右欄給空狀態 —— 空的收件匣本身就是答案，不需要換一個地方顯示。 */
  React.useEffect(function () {
    if (mode !== 'pending') return;
    if (sel === SCH_Q_DECISION && decisionQueue.length === 0 && failureQueue.length > 0) {
      setSel(SCH_Q_FAILURE);
    }
  }, []);

  /* 佇列內容變了（有人決定完、或確認掉一筆失敗）就把展開位移到第一件 */
  const activeQueue = sel === SCH_Q_FAILURE ? failureQueue : decisionQueue;
  const firstQueueId = activeQueue.length ? activeQueue[0].run.id : null;
  const expandedQueueId = expandedQ && activeQueue.some(function (e) { return e.run.id === expandedQ; })
    ? expandedQ
    : firstQueueId;

  /* ── 通知 deep-link：展開指定執行紀錄（見 notification 模組）── */
  React.useEffect(function () {
    const runId = expandRunReq && expandRunReq.runId;
    if (!runId) return;
    const owner = items.find(function (it) {
      return (it.runs || []).some(function (r) { return r.id === runId; });
    });
    if (!owner) return;
    setMode('pending');
    setSel(owner.id);
    setExpandedRuns(function (prev) { const n = new Set(prev); n.add(runId); return n; });
  }, [expandRunReq && expandRunReq.nonce]);

  /* ── Codify 詳情「設為定期執行」deep-link：開抽屜的新增檢視並預選那份 Codify ── */
  React.useEffect(function () {
    const skillId = newScheduleReq && newScheduleReq.skillId;
    if (!skillId || !newScheduleReq.nonce) return;
    setDrawer({ view: 'new', itemId: null, presetSkillId: skillId });
    /* 用完就清掉，不然之後每次回到排程頁都會再彈一次 */
    if (onNewScheduleHandled) onNewScheduleHandled();
  }, [newScheduleReq && newScheduleReq.nonce]);

  const selectedItem = items.find(function (i) { return i.id === sel; }) || null;
  const drawerItem = drawer && drawer.itemId ? items.find(function (i) { return i.id === drawer.itemId; }) || null : null;

  const allRuns   = getAllRuns(items, ivsByRun);
  const errorRuns = allRuns.filter(function (e) { return e.view.result === 'error'; });

  const nowLabel = function () {
    const d = new Date();
    const pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    return '今日 ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  };

  /* ── 送出決定 ──
     先送出者定案：onDecide 回 false 代表這個決策點已經被別人決定了，
     本次點擊不成立，畫面轉為已成立的結果 —— B 推翻不了 A。 */
  const submitDecision = function (run, step, action, reason, newParams) {
    const params = newParams != null ? newParams : (step.mcpParams || '');
    const iv = {
      id: 'iv-' + run.id + '-' + step.num,
      action: action,
      stepNum: step.num,
      at: nowLabel(),
      actor: { name: p.user.name, avatar: p.user.avatar, color: '#2563EB' },
      reason: reason || '',
      paramsBefore: newParams != null ? (step.mcpParams || '') : null,
      paramsAfter: newParams != null ? newParams : null,
      toolCall: (action === 'confirm' && step.mcpTool)
        ? { tool: step.mcpTool, params: params, result: step.onConfirm || '已執行' }
        : null,
    };
    const accepted = onDecide(run.id, iv);
    setReasonModal(null);
    setParamsModal(null);
    if (!accepted) {
      setConflict({ runId: run.id, stepNum: step.num });
    } else {
      setConflict(null);
    }
  };

  /* ── 重跑：新增一筆執行，不覆蓋原本那筆失敗 ── */
  const handleRetry = function (item, run) {
    const newRun = buildRetryRun(run, p.user.name, nowLabel());
    onRetry(item.id, newRun);
    setMode('pending');
    setSel(item.id);
    setExpandedRuns(function (prev) { const n = new Set(prev); n.add(newRun.id); return n; });
  };

  /* ── 手動執行一次（停用中的排程仍可跑）── */
  const handleManualRun = function (item) {
    const newRun = buildManualRun(item, p.user.name, nowLabel());
    onRetry(item.id, newRun);
    setExpandedRuns(function (prev) { const n = new Set(prev); n.add(newRun.id); return n; });
  };

  const toggleEnabled = function (item) {
    const next = !isScheduleEnabled(item);
    onUpdateSchedule(item.id, {
      enabled: next,
      disabledBy: next ? null : p.user.name,
      disabledAt: next ? null : nowLabel(),
      lastChange: { by: p.user.name, at: nowLabel(), summary: next ? '重新啟用' : '停用排程' },
    });
  };

  /* ════════ 左欄 ════════ */

  /* 一支排程現在是什麼顏色 —— 左欄健康清單與管理抽屜共用這一份判斷 */
  const itemTone = function (item) {
    if (!isScheduleEnabled(item)) return 'disabled';
    if (failureQueue.some(function (f) { return f.item.id === item.id; })) return 'error';
    if (decisionQueue.some(function (d) { return d.item.id === item.id; })) return 'pending';
    return 'success';
  };

  const renderQueueCard = function (cfgKey, count) {
    const cfg = SCH_QUEUE_CFG[cfgKey];
    const key = cfgKey === 'decision' ? SCH_Q_DECISION : SCH_Q_FAILURE;
    const active = sel === key;
    return (
      <div
        key={key}
        onClick={function () { setSel(key); setExpandedQ(null); }}
        style={{
          background: C.bg, borderRadius: 6, padding: 16, cursor: 'pointer',
          border: '1px solid ' + (active ? '#2563EB' : C.border),
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        <SchDot tone={cfgKey === 'decision' ? 'pending' : 'error'} />
        <span style={{ fontSize: fz(14), fontWeight: 600, color: C.text, flex: 1 }}>{cfg.label}</span>
        {/* 只給件數 —— 是哪個排程、卡在哪一步全部留到右欄講 */}
        <span style={{ fontSize: fz(12), fontFamily: 'monospace', color: active ? '#2563EB' : C.textMuted }}>
          {count} 件
        </span>
      </div>
    );
  };

  const renderLeft = function () { return (
    <div style={{
      width: 312, flexShrink: 0, background: C.bgPanel,
      borderRight: '1px solid ' + C.border,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      <div style={{ flex: 1, overflowY: 'auto' }} className="scrollbar-thin">
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 唯一的模式切換。預設停在待處理 —— 班次交接時第一眼要是待辦不是統計 */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { key: 'pending', label: '待處理（' + pendingTotal + '）' },
              { key: 'all',     label: '全部紀錄' },
            ].map(function (m) {
              const on = mode === m.key;
              return (
                <div
                  key={m.key}
                  onClick={function () {
                    setMode(m.key);
                    setSel(m.key === 'all' ? SCH_ALL : (decisionQueue.length || !failureQueue.length ? SCH_Q_DECISION : SCH_Q_FAILURE));
                  }}
                  style={{
                    padding: '8px 16px', borderRadius: 999, cursor: 'pointer', fontSize: fz(14),
                    background: on ? '#2563EB' : C.bg,
                    color: on ? '#fff' : C.textSub,
                    border: '1px solid ' + (on ? '#2563EB' : C.border),
                    whiteSpace: 'nowrap',
                  }}
                >{m.label}</div>
              );
            })}
          </div>

          {/* 分類卡只在待處理模式出現：它們是「待處理」這個模式的內容，
              全部紀錄模式的範圍是整個右欄，左欄上半沒有可選的東西 */}
          {mode === 'pending' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {renderQueueCard('decision', decisionQueue.length)}
              {renderQueueCard('failure', failureQueue.length)}
            </div>
          )}
        </div>

        <div style={{ height: 1, background: C.border }} />

        {/* 排程健康：不是導覽主體，是監看清單 —— 一列只有點＋名稱＋時間 */}
        <div style={{
          padding: '24px 16px 8px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub }}>排程健康 · {items.length}</span>
          <a
            onClick={function () { setDrawer({ view: 'list', itemId: null, presetSkillId: null }); }}
            style={{
              fontSize: fz(12), fontWeight: 600,
              border: '1px solid ' + (drawer ? '#2563EB' : 'transparent'),
              borderRadius: 6, padding: drawer ? '4px 12px' : 0,
            }}
          >管理</a>
        </div>
        <div style={{ padding: '0 16px 16px 16px' }}>
          {items.map(function (item, idx) {
            const on = isScheduleEnabled(item);
            const active = sel === item.id;
            const tone = itemTone(item);
            return (
              <div
                key={item.id}
                onClick={function () { setSel(item.id); setRunFilter('all'); }}
                style={{
                  padding: '16px 8px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  /* 選中語彙與分類卡同一套：白底＋藍框＋圓角，兩者是同一組互斥選項 */
                  background: active ? C.bg : 'transparent',
                  border: '1px solid ' + (active ? '#2563EB' : 'transparent'),
                  borderRadius: active ? 6 : 0,
                  borderBottom: active
                    ? '1px solid #2563EB'
                    : (idx === items.length - 1 ? '1px solid transparent' : '1px solid ' + C.border),
                  marginTop: active ? 8 : 0,
                }}
              >
                <SchDot tone={tone} />
                <span style={{
                  fontSize: fz(14), flex: 1, minWidth: 0,
                  fontWeight: active ? 600 : 400,
                  color: !on ? C.textMuted : (active ? C.text : C.textSub),
                }}>{item.name}</span>
                <span style={{
                  fontSize: fz(12), fontFamily: 'monospace',
                  color: active ? '#2563EB' : C.textMuted,
                }}>{schCronShort(item)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    ); };

  /* ════════ 右欄：決策台 ════════ */

  const renderHeader = function (dotTone, title, sub, extra) { return (
    <div style={{
      background: C.bg, borderBottom: '1px solid ' + C.border, padding: '24px 32px',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexShrink: 0,
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SchDot tone={dotTone} />
          {title}
        </div>
        {sub}
      </div>
      {extra}
    </div>
    ); };

  /* 決策卡：把「AI 要做什麼／參數／依據」攤平在同一屏，動作列直接可按 */
  const renderDecisionCard = function (d) {
    const run = d.run, step = d.step, item = d.item;
    const longWait = d.waitedMin >= 60;
    return (
      <div key={run.id} style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 6, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          onClick={function () { setExpandedQ(null); }}
          style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
        >
          <SchDot tone="pending" />
          <span style={{ fontSize: fz(14), fontWeight: 600, color: C.text }}>
            {item.name} · Step {step.num}「{step.title}」
          </span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: fz(12), fontFamily: 'monospace', color: longWait ? '#D97706' : C.textMuted }}>
            已等待 {d.waited}
          </span>
          <span style={{ fontSize: fz(14), color: C.textMuted }}>˅</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row', gap: 32, flexWrap: 'wrap', borderTop: '1px solid ' + C.border, paddingTop: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: fz(12), color: C.textSub }}>AI 準備呼叫</span>
            <span style={{ fontSize: fz(14), fontFamily: 'monospace', color: C.text }}>{step.mcpTool || 'unknown.tool'}</span>
          </div>
          {step.mcpParams && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: fz(12), color: C.textSub }}>參數</span>
              <span style={{ fontSize: fz(14), fontFamily: 'monospace', color: C.text }}>{step.mcpParams}</span>
            </div>
          )}
          {step.detail && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, minWidth: 240 }}>
              <span style={{ fontSize: fz(12), color: C.textSub }}>依據</span>
              <span style={{ fontSize: fz(14), color: C.textSub, lineHeight: 1.7 }}>
                {step.detail.desc || step.detail.issue || step.detail.target}
              </span>
            </div>
          )}
        </div>

        {conflict && conflict.runId === run.id && (
          <antd.Alert
            type="info" showIcon
            message={<span style={{ fontSize: fz(12), lineHeight: 1.7 }}>
              這個決策點已經有人先決定了，你這次的操作沒有生效。
            </span>}
          />
        )}

        {/* 動作列：一次點擊完成決定，不必先認領也不必進詳情 */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', borderTop: '1px solid ' + C.border, paddingTop: 16, flexWrap: 'wrap' }}>
          <antd.Button type="primary" onClick={function () { submitDecision(run, step, 'confirm', ''); }}>同意並繼續</antd.Button>
          <antd.Button onClick={function () { setParamsModal({ run: run, step: step }); }}>改參數</antd.Button>
          <antd.Button onClick={function () { setReasonModal({ action: 'skip', run: run, step: step }); }}>略過此步</antd.Button>
          <span style={{ flex: 1 }} />
          <a
            style={{ fontSize: fz(14) }}
            onClick={function () {
              setMode('pending');
              setSel(item.id);
              setExpandedRuns(function (prev) { const n = new Set(prev); n.add(run.id); return n; });
            }}
          >看本次執行過程 ›</a>
        </div>

        <div style={{ fontSize: fz(11), color: C.textMuted, lineHeight: 1.7 }}>
          本課任何成員都可以決定，不需要先認領。<strong>先送出的決定即定案，會記下決定者與時間，且無法變更或撤回。</strong>
        </div>
      </div>
    );
  };

  const renderDecisionRow = function (d) {
    const run = d.run, step = d.step, item = d.item;
    return (
      <div
        key={run.id}
        onClick={function () { setExpandedQ(run.id); }}
        style={{
          background: C.bg, border: '1px solid ' + C.border, borderRadius: 6, padding: 24,
          display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
        }}
      >
        <SchDot tone="pending" />
        <span style={{ fontSize: fz(14), fontWeight: 600, color: C.text }}>
          {item.name} · Step {step.num}「{step.title}」
        </span>
        <span style={{ fontSize: fz(14), color: C.textSub, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {(step.detail && (step.detail.desc || step.detail.issue)) || step.mcpTool || ''}
        </span>
        <span style={{ fontSize: fz(12), fontFamily: 'monospace', color: C.textMuted, whiteSpace: 'nowrap' }}>已等待 {d.waited}</span>
        <span style={{ fontSize: fz(14), color: C.textMuted }}>›</span>
      </div>
    );
  };

  const renderDecisionQueue = function () {
    const longest = decisionQueue.length ? decisionQueue[0].waited : null;
    return (
      <React.Fragment>
        {renderHeader(
          'pending',
          <span style={{ fontSize: fz(18), fontWeight: 600, color: C.text }}>待人工決定 · {decisionQueue.length} 件</span>,
          <span style={{ fontSize: fz(14), color: C.textSub }}>
            {SCH_QUEUE_CFG.decision.desc}
            {longest && <React.Fragment> · <span style={{ fontFamily: 'monospace' }}>最久已等待 {longest}</span></React.Fragment>}
            {' · 任何課員都可決定'}
          </span>
        )}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {decisionQueue.length === 0 ? (
            <antd.Empty style={{ padding: 24 }} description={<span style={{ fontSize: fz(13), color: C.textMuted }}>沒有等人決定的事</span>} />
          ) : decisionQueue.map(function (d) {
            return d.run.id === expandedQueueId ? renderDecisionCard(d) : renderDecisionRow(d);
          })}
        </div>
      </React.Fragment>
    );
  };

  /* 失敗待確認：沒有等待中的 AI 步驟，所以沒有「同意並繼續」，
     動作語彙是重跑／看錯誤／把它收掉。 */
  const renderFailureCard = function (f) {
    const run = f.run, item = f.item;
    const failure = run.failure || {};
    const kind = SCH_FAILURE_KIND_CFG[failure.kind] || SCH_FAILURE_KIND_CFG.unknown;
    const step = (run.steps || []).filter(function (s) { return s.num === failure.stepNum; })[0];
    const raw = showRawError === run.id;
    return (
      <div key={run.id} style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 6, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div onClick={function () { setExpandedQ(null); }} style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}>
          <SchDot tone="error" />
          <span style={{ fontSize: fz(14), fontWeight: 600, color: C.text }}>
            {item.name}{step ? ' · Step ' + step.num + '「' + step.title + '」' : ''}
          </span>
          <span style={{ flex: 1 }} />
          <span style={{ fontSize: fz(12), fontFamily: 'monospace', color: C.textMuted }}>
            {run.dateLabel} · 失敗於 {run.duration}
          </span>
          <span style={{ fontSize: fz(14), color: C.textMuted }}>˅</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid ' + C.border, paddingTop: 16 }}>
          <span style={{ fontSize: fz(14), color: C.textSub }}>
            {kind.label}：{kind.hint}執行中止在第 {failure.stepNum} 步（共 {f.view.totalSteps} 步）。
          </span>
          <span style={{ fontSize: fz(12), fontFamily: 'monospace', color: C.textMuted }}>{failure.message}</span>
          {/* 補跑過就要講 —— 否則人會重跑第二次 */}
          {f.retry && (
            <span style={{ fontSize: fz(14), color: C.textSub }}>
              已於 <span style={{ fontFamily: 'monospace' }}>{f.retry.dateLabel}</span> 補跑並完成，本筆僅需人工確認。
            </span>
          )}
          {raw && (
            <div style={{ marginTop: 8, padding: 16, background: C.bgPanel, borderRadius: 6 }}>
              <SchStepTimeline steps={f.view.steps} compact={true} interventions={f.view.interventions} />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', borderTop: '1px solid ' + C.border, paddingTop: 16, flexWrap: 'wrap' }}>
          <antd.Button
            type="primary"
            onClick={function () { onAck(run.id, { by: p.user.name, at: nowLabel() }); }}
          >標記已確認</antd.Button>
          {failure.retryable && (
            <antd.Button onClick={function () { handleRetry(item, run); }}>立即重跑</antd.Button>
          )}
          <antd.Button onClick={function () { setShowRawError(raw ? null : run.id); }}>
            {raw ? '收合錯誤細節' : '看完整錯誤'}
          </antd.Button>
          <span style={{ flex: 1 }} />
          {f.retry && (
            <a
              style={{ fontSize: fz(14) }}
              onClick={function () {
                setSel(item.id);
                setExpandedRuns(function (prev) { const n = new Set(prev); n.add(f.retry.id); return n; });
              }}
            >看 {f.retry.dateLabel} 的重試紀錄 ›</a>
          )}
        </div>
      </div>
    );
  };

  const renderFailureRow = function (f) {
    const run = f.run, item = f.item;
    return (
      <div
        key={run.id}
        onClick={function () { setExpandedQ(run.id); }}
        style={{
          background: C.bg, border: '1px solid ' + C.border, borderRadius: 6, padding: 24,
          display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
        }}
      >
        <SchDot tone="error" />
        <span style={{ fontSize: fz(14), fontWeight: 600, color: C.text }}>{item.name}</span>
        <span style={{ fontSize: fz(14), color: C.textSub, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {(SCH_FAILURE_KIND_CFG[(run.failure || {}).kind] || SCH_FAILURE_KIND_CFG.unknown).label}
        </span>
        <span style={{ fontSize: fz(12), fontFamily: 'monospace', color: C.textMuted, whiteSpace: 'nowrap' }}>{run.dateLabel}</span>
        <span style={{ fontSize: fz(14), color: C.textMuted }}>›</span>
      </div>
    );
  };

  const renderFailureQueue = function () { return (
    <React.Fragment>
      {renderHeader(
        'error',
        <span style={{ fontSize: fz(18), fontWeight: 600, color: C.text }}>失敗待確認 · {failureQueue.length} 件</span>,
        <span style={{ fontSize: fz(14), color: C.textSub }}>{SCH_QUEUE_CFG.failure.desc}</span>
      )}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {failureQueue.length === 0 ? (
          <antd.Empty style={{ padding: 24 }} description={<span style={{ fontSize: fz(13), color: C.textMuted }}>沒有待確認的失敗</span>} />
        ) : failureQueue.map(function (f) {
          return f.run.id === expandedQueueId ? renderFailureCard(f) : renderFailureRow(f);
        })}
      </div>
    </React.Fragment>
    ); };

  /* ── 執行紀錄的一列（時間／狀態／摘要／時長）與展開的內容 ── */
  const renderRunRows = function (entries, showScheduleName) {
    if (!entries.length) {
      return <antd.Empty style={{ padding: 24 }} description={<span style={{ fontSize: fz(13), color: C.textMuted }}>此條件下沒有執行紀錄</span>} />;
    }
    return (
      <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 6 }}>
        {entries.map(function (entry, idx) {
          const item = entry.item, run = entry.run, view = entry.view;
          const cfg = SCH_RUN_CFG[view.result] || SCH_RUN_CFG.success;
          const open = expandedRuns.has(run.id);
          const resultLabel = view.result === 'success' && view.hasSkip ? '完成（含人工略過）' : cfg.label;
          /* 摘要那一句要講「這次跟平常有什麼不一樣」：有人介入講人，失敗講卡在哪 */
          const note = view.result === 'pending'
            ? '停在 Step ' + (view.activeStep ? view.activeStep.num : '?')
            : run.failure
              ? '卡在 Step ' + run.failure.stepNum + '（' + (SCH_FAILURE_KIND_CFG[run.failure.kind] || SCH_FAILURE_KIND_CFG.unknown).label + '）'
              : view.interventions.length
                /* 一列只講得下一句話：第一筆介入寫全，其餘用件數帶過（點開就看得到全部）*/
                ? (function () {
                    const iv = view.interventions[0];
                    const clock = (iv.at || '').replace(/^(今日|昨日|\d{2}\/\d{2})\s*/, '');
                    const more = view.interventions.length - 1;
                    return iv.actor.name + '於 ' + clock + ' '
                      + (SCH_DECISION_CFG[iv.action] || SCH_DECISION_CFG.confirm).pastLabel
                      + (more > 0 ? '（另有 ' + more + ' 次介入）' : '');
                  })()
                : run.trigger === 'manual' ? '人工觸發' : run.trigger === 'retry' ? '失敗補跑' : '排程自動觸發';

          return (
            <div key={run.id} style={{ borderTop: idx === 0 ? 'none' : '1px solid ' + C.border }}>
              <div
                onClick={function () {
                  setExpandedRuns(function (prev) {
                    const n = new Set(prev);
                    if (n.has(run.id)) n.delete(run.id); else n.add(run.id);
                    return n;
                  });
                }}
                style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
              >
                <span style={{ fontSize: fz(12), fontFamily: 'monospace', color: C.textMuted, width: 96, flexShrink: 0 }}>
                  {run.dateLabel}
                </span>
                <SchDot tone={view.result} />
                <span style={{ fontSize: fz(14), color: C.textSub, flex: 1, minWidth: 0 }}>
                  {showScheduleName && <span style={{ color: C.text, fontWeight: 600 }}>{item.name} · </span>}
                  {resultLabel}（{view.doneSteps}/{view.totalSteps} 步驟）· {note}
                </span>
                {run.failure && run.failure.retryable && (
                  <antd.Button size="small" onClick={function (e) { e.stopPropagation(); handleRetry(item, run); }}>↻ 重跑</antd.Button>
                )}
                {/* mock 的 duration 是靜態字串：一旦人把決策點決定完，這一筆就不再「暫停中」了，
                    但欄位還寫著暫停中 —— 已經跑完的執行不該在時長欄位講它還停著 */}
                <span style={{ fontSize: fz(12), fontFamily: 'monospace', color: C.textMuted, whiteSpace: 'nowrap' }}>
                  {view.result !== 'pending' && /暫停/.test(run.duration || '') ? '—' : run.duration}
                </span>
                <span style={{ fontSize: fz(14), color: C.textMuted }}>{open ? '˅' : '›'}</span>
              </div>

              {open && (
                <div style={{ padding: '0 16px 16px 16px' }}>
                  {/* 產出物本身 —— 執行紀錄的重點是「跑出了什麼」，不只是「跑了哪幾步」 */}
                  {run.output && (
                    <div style={{ marginBottom: 16, border: '1px solid ' + C.border, borderRadius: 6, overflow: 'hidden' }}>
                      <div style={{ padding: '8px 16px', background: C.bgPanel }}>
                        <span style={{ fontSize: fz(12), fontWeight: 700, color: C.textMuted, letterSpacing: '0.06em' }}>本次產出</span>
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
                            {path.taken.length ? path.taken.map(function (n) { return 'Step ' + n; }).join(' → ') : '無'}
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
                  {run.retryOf && (
                    <div style={{ fontSize: fz(11), color: C.textMuted, marginBottom: 8 }}>
                      這是失敗後的補跑，原本那筆失敗紀錄仍保留在清單中。
                    </div>
                  )}
                  <SchStepTimeline steps={view.steps} compact={true} interventions={view.interventions} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderFilterPills = function (entries) { return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {SCH_RUN_FILTERS.map(function (f) {
        const active = runFilter === f.key;
        const count = f.key === 'all' ? entries.length : entries.filter(function (e) { return matchRunFilter(e, f.key); }).length;
        return (
          <div
            key={f.key}
            onClick={function () { setRunFilter(f.key); }}
            style={{
              padding: '8px 16px', borderRadius: 999, cursor: 'pointer',
              fontSize: fz(14), fontWeight: active ? 600 : 400,
              background: active ? '#2563EB' : C.bg,
              color: active ? '#fff' : (count === 0 ? C.textMuted : C.textSub),
              border: '1px solid ' + (active ? '#2563EB' : C.border),
              whiteSpace: 'nowrap',
            }}
          >{f.label}（{count}）</div>
        );
      })}
    </div>
    ); };

  /* ── 單一排程：把右欄的範圍換成它（設定摘要 + 它自己的紀錄）──
     不在這裡重複一套決策 UI：決定只在待處理做，這裡只給一條指路。 */
  const renderSchedule = function (item) {
    const on = isScheduleEnabled(item);
    const stats = getScheduleStats(item, ivsByRun, 7);
    const entries = getAllRuns([item], ivsByRun);
    const filtered = entries.filter(function (e) { return matchRunFilter(e, runFilter); });
    const mine = decisionQueue.filter(function (d) { return d.item.id === item.id; });
    const next = on ? getNextRunLabel(item.cronLabel) : null;

    return (
      <React.Fragment>
        {renderHeader(
          !on ? 'disabled' : mine.length ? 'pending' : 'success',
          <React.Fragment>
            <span style={{ fontSize: fz(18), fontWeight: 600, color: on ? C.text : C.textSub }}>{item.name}</span>
            {!on && (
              <antd.Tag style={{ marginInlineEnd: 0, borderRadius: 999, background: 'transparent', color: C.textSub, borderColor: C.border }}>
                已停用
              </antd.Tag>
            )}
          </React.Fragment>,
          <React.Fragment>
            <span style={{ fontSize: fz(14), color: on ? C.textSub : C.textMuted }}>
              <span style={{ fontFamily: 'monospace' }}>{item.cronLabel}</span>
              {' · Skill '}<span style={{ fontFamily: 'monospace' }}>{item.skill}</span>
              {' · 建立者 '}{item.createdBy}
              {' · 下次執行 '}<span style={{ fontFamily: 'monospace' }}>{on ? (next || '依班別觸發') : '—'}</span>
            </span>
            <span style={{ fontSize: fz(14), color: C.textMuted }}>
              {on ? '近 ' : '停用前近 '}{stats.total} 次：{stats.success} 次完成
              {stats.pending ? ' · ' + stats.pending + ' 次待決定' : ''}
              {stats.error ? ' · ' + stats.error + ' 次失敗' : ''}
              {stats.rejected ? ' · ' + stats.rejected + ' 次已拒絕' : ''}
              {stats.avgLabel ? ' · 平均 ' : ''}
              {stats.avgLabel && <span style={{ fontFamily: 'monospace' }}>{stats.avgLabel}</span>}
            </span>
            {/* 排程改的是「沒人在場時 AI 幾點會動作」，比一般設定變更重份量 ——
                誰最後一次動過它、動了什麼，要留得住（決議 19）。 */}
            {item.lastChange && (
              <span style={{ fontSize: fz(12), color: C.textMuted }}>
                最後變更：{item.lastChange.by} · {item.lastChange.at} · {item.lastChange.summary}
              </span>
            )}
          </React.Fragment>,
          <antd.Space size={8}>
            <antd.Button onClick={function () { setDrawer({ view: 'edit', itemId: item.id, presetSkillId: null }); }}>編輯排程</antd.Button>
            <antd.Button type={on ? 'default' : 'primary'} onClick={function () { toggleEnabled(item); }}>
              {on ? '停用' : '啟用'}
            </antd.Button>
          </antd.Space>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {!on && (
            <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 6, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <SchDot tone="disabled" />
              <span style={{ fontSize: fz(14), color: C.textSub, flex: 1 }}>
                此排程已停用，不會再自動執行
                {item.disabledBy ? ' · ' + item.disabledBy + '於 ' : ''}
                {item.disabledAt && <span style={{ fontFamily: 'monospace' }}>{item.disabledAt}</span>}
                {item.disabledBy ? ' 停用' : ''}
              </span>
              <antd.Button onClick={function () { handleManualRun(item); }}>手動執行一次</antd.Button>
            </div>
          )}

          {on && mine.length > 0 && (
            <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 6, padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
              <SchDot tone="pending" />
              <span style={{ fontSize: fz(14), color: C.textSub, flex: 1 }}>
                這支排程有 {mine.length} 件待人工決定，停在 Step {mine[0].step.num}「{mine[0].step.title}」
              </span>
              <a
                style={{ fontSize: fz(14), whiteSpace: 'nowrap' }}
                onClick={function () { setMode('pending'); setSel(SCH_Q_DECISION); setExpandedQ(mine[0].run.id); }}
              >到待處理決定 ›</a>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {renderFilterPills(entries)}
            <span style={{ flex: 1 }} />
            <span style={{ fontSize: fz(12), fontFamily: 'monospace', color: C.textMuted }}>
              {on ? '時間倒序 · 近 ' + entries.length + ' 次' : '歷史紀錄 · 停用前'}
            </span>
          </div>

          {renderRunRows(filtered, false)}
        </div>
      </React.Fragment>
    );
  };

  /* ── 全部紀錄：跨排程、時間倒序 ──
     「正常的事安靜」的另一面 —— 要查的時候查得到，不必先知道是哪一支排程。 */
  const renderAllRecords = function () {
    const filtered = allRuns.filter(function (e) { return matchRunFilter(e, runFilter); });
    return (
      <React.Fragment>
        {renderHeader(
          errorRuns.length ? 'error' : 'success',
          <span style={{ fontSize: fz(18), fontWeight: 600, color: C.text }}>全部紀錄</span>,
          <span style={{ fontSize: fz(14), color: C.textSub }}>
            {p.name} · {items.length} 個排程 · {allRuns.length} 次執行
            {errorRuns.length > 0 && <span style={{ color: '#DC2626' }}> · {errorRuns.length} 次失敗</span>}
          </span>
        )}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {renderFilterPills(allRuns)}
          {renderRunRows(filtered, true)}
        </div>
      </React.Fragment>
    );
  };

  /* ── Main render ── */
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {renderLeft()}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bgPanel }}>
          {mode === 'all' || sel === SCH_ALL
            ? renderAllRecords()
            : selectedItem
              ? renderSchedule(selectedItem)
              : sel === SCH_Q_FAILURE
                ? renderFailureQueue()
                : renderDecisionQueue()}
        </div>
      </div>

      {/* 略過的理由輸入 */}
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

      {/* 改參數後確認 */}
      {paramsModal && (
        <SchParamsModal
          step={paramsModal.step}
          onCancel={function () { setParamsModal(null); }}
          onSubmit={function (params, reason) {
            submitDecision(paramsModal.run, paramsModal.step, 'confirm', reason, params);
          }}
        />
      )}

      {/* 設定類動作走抽屜：不換頁、不奪走佇列上下文 */}
      {drawer && (
        <SchScheduleDrawer
          p={p}
          items={items}
          mounts={mounts}
          view={drawer.view}
          editItem={drawerItem}
          presetSkillId={drawer.presetSkillId}
          toneOf={itemTone}
          onChangeView={function (view, itemId) {
            setDrawer({ view: view, itemId: itemId || null, presetSkillId: null });
          }}
          onClose={function () { setDrawer(null); }}
          onToggleEnabled={toggleEnabled}
          onUpdate={function (itemId, out) {
            onUpdateSchedule(itemId, {
              name: out.name,
              cronLabel: out.cronLabel,
              notifyTo: out.notifyTo,
              enabled: out.enabled,
              disabledBy: out.enabled ? null : p.user.name,
              disabledAt: out.enabled ? null : nowLabel(),
              lastChange: { by: p.user.name, at: nowLabel(), summary: out.summary },
            });
            setDrawer({ view: 'list', itemId: null, presetSkillId: null });
          }}
          onCreate={function (out) {
            var skill = out.skill;
            var confirmSteps = (skill.plainSteps || []).filter(function (st) { return st.needsConfirm; }).length;
            var newItem = {
              id: 'sch-new-' + Date.now(),
              name: out.name,
              skill: skill.id,
              skillId: skill.id,
              hasWrite: !!skill.hasWrite,
              confirmSteps: confirmSteps,
              cronLabel: out.cron,
              notifyTo: out.notifyTo,
              createdBy: p.user.name,
              enabled: true,
              lastChange: { by: p.user.name, at: nowLabel(), summary: '建立排程' },
              status: 'ok',
              lastRun: '尚未執行',
              runs: [],
            };
            onCreateSchedule(newItem);
            setDrawer(null);
            setMode('pending');
            setSel(newItem.id);
          }}
        />
      )}
    </div>
  );
}
