/* ════════════════════════════════════════
   SKILL CREATE FLOW — 建立表單（不是對話）

   2026-07-26 PO 定案，取代原本的五關對話式精靈。

   理由：一個產品裡有兩套 AI 對話（建立精靈 + 詳情頁的 Ask AI）本來就是重複，
   而且 Modal 裡塞對話會讓「建立」這件事看起來比實際複雜很多。

   現在這裡只收四樣東西 —— 類型、名稱、適用範圍、大致流程 ——
   然後把它們當成 context 丟給 agent：建立完立刻進詳情頁，
   右側 Ask AI 自己開始體檢（含「你這個其實比較像 SOP」這種類型建議）。
   使用者第一次用就看得到有 agent 在幫忙，不會面對一張空白頁。

   類型允許選錯，是刻意的：讓 agent 去糾正，比要人先讀懂兩張說明卡再選好。
   ════════════════════════════════════════ */

/* 觸發條件一律用選的，不打字 —— 自由文字是情境幻覺的來源 */
const SC_TRIGGER_OPTIONS = [
  { value: 'manual',    label: '人工調用（有人問才跑）' },
  { value: 'alarm',     label: '警報觸發' },
  { value: 'schedule',  label: '排程觸發' },
  { value: 'threshold', label: '數值門檻' },
];
const SC_ALARM_CODES = ['ERR-4421', 'ERR-4422', 'FDC Level-2', 'SPC-OOC'];
const SC_SCHEDULE_AT = ['每日 07:50', '每日 15:30', '每班結束前 30 分鐘', '每週一 09:00'];
const SC_THRESHOLDS  = [
  { metric: '稼動率', op: '<', value: '90%' },
  { metric: 'CPK',    op: '<', value: '1.33' },
  { metric: '停機時長', op: '>', value: '1 小時' },
];

/* 流程描述的範例（降低第一句話的門檻，不強迫從零打字）*/
const SC_FLOW_EXAMPLES = [
  '每天交班前整理一份當班報告：取機台稼動、抓當班異常件數並分級、把未結案的待辦列出來，最後套課上的交接格式。',
  'CMP 機台跳 ERR-4421 的時候，先看冷卻水路壓差、再看感測器近兩小時趨勢、對照上次保養時間，然後告訴值班的人可能是什麼原因。',
];

/* ── agent 依需求描述推薦類型（原型用關鍵詞，真實版是 LLM 判讀）──
   建立時不再用它，改由詳情頁的首次體檢呼叫 —— 見 buildIntakeReview。 */
function recommendTier(text) {
  var t = text || '';
  var periodic = /每天|每日|每班|定期|固定|排程|自動|交班|交接/.test(t);
  var aggregate = /整理|彙整|報告|日報|統計|報表|摘要|清單/.test(t);
  var judge = /研判|判斷|分析|怎麼辦|原因|異常處理|建議|可能是/.test(t);

  if (periodic && aggregate) {
    return {
      tier: 'sop',
      why: '你描述的是每次都照同樣順序做完的彙整，步驟固定、結果可以重現。',
      benefit: '做成 SOP 才能設成排程自動跑，時間到就有產出。',
    };
  }
  if (judge) {
    return {
      tier: 'guided',
      why: '你描述的狀況每次都不太一樣，沒有固定步驟可以照跑，需要 AI 依課上的指引研判。',
      benefit: '輔助判斷可以查現場數據當證據，但不會去動任何系統，也不能設排程。',
    };
  }
  return {
    tier: 'guided',
    why: '從你的描述看不出固定步驟，比較像是每次要視狀況判斷的事。',
    benefit: '先做成輔助判斷比較安全；之後大家的做法收斂了，再改成 SOP。',
  };
}

/* ── agent 依類型與需求生出流程步驟（原型為 mock，真實版由生成端回傳）──
   建立時不再呼叫；詳情頁「幫我拆步驟」採用後才會用到。 */
function generateDraftContent(tier, scopeTargets) {
  if (tier === 'sop') {
    return {
      plainSteps: [
        { num: 1, label: '取當班機台稼動資料',       source: 'standard', component: '機台稼動彙整', version: 'v1.2', io: 'read',    system: '設備監控',    tool: 'eqp.get_uptime' },
        { num: 2, label: '取同時段警報並分級',       source: 'standard', component: '警報分級',     version: 'v2.0', io: 'read',    system: 'FDC',         tool: 'fdc.list_alarms' },
        { num: 3, label: '計算稼動率與異常密度',     source: 'custom',   io: 'compute', note: '本課自訂：稼動率排除 PM 時數' },
        { num: 4, label: '取未結案 Case 與待辦事項', source: 'standard', component: 'Case 清單彙整', version: 'v1.1', io: 'read',   system: 'Case Center', tool: 'case_center.list_open' },
        { num: 5, label: '套用交接報告格式',         source: 'standard', component: '交接報告格式', version: 'v1.0', io: 'compute' },
      ],
      graph: {
        edges: [
          { from: 'start', to: 1 }, { from: 'start', to: 2 }, { from: 'start', to: 4 },
          { from: 1, to: 3 }, { from: 2, to: 3 },
          { from: 3, to: 5 }, { from: 4, to: 5 },
          { from: 5, to: 'end' },
        ],
      },
      tools: [
        { name: 'eqp.get_uptime',        label: '取機台稼動資料', system: '設備監控',    mode: 'read' },
        { name: 'fdc.list_alarms',       label: '取當班警報',     system: 'FDC',         mode: 'read' },
        { name: 'case_center.list_open', label: '取未結案 Case',  system: 'Case Center', mode: 'read' },
      ],
    };
  }
  return {
    plainSteps: [],
    graph: null,
    tools: [
      { name: 'fdc.get_alarm_detail', label: '查警報明細',   system: 'FDC',      mode: 'read' },
      { name: 'eqp.get_sensor_trend', label: '查感測器趨勢', system: '設備監控', mode: 'read' },
    ],
  };
}

/* ════════════════════════════════════════
   ScopePicker — 適用範圍勾選（一律用選的，不打字）
   底部即時顯示「目前符合 N 台」，讓 Seed 馬上看到自己圈了什麼
   ════════════════════════════════════════ */
function ScopePicker({ p, scope, onChange }) {
  var { C, fz } = useTheme();
  var master  = EQUIPMENT_MASTER[p.key] || [];
  var classes = [];
  var areas   = [];
  master.forEach(function(eq) {
    if (classes.indexOf(eq.class) === -1) classes.push(eq.class);
    if (areas.indexOf(eq.area) === -1)    areas.push(eq.area);
  });

  /* 指定機台的候選：先被類別與區域收窄，避免勾到自相矛盾的組合 */
  var candidates = master.filter(function(eq) {
    if (scope.equipmentClass.length > 0 && scope.equipmentClass.indexOf(eq.class) === -1) return false;
    if (scope.area.length > 0 && scope.area.indexOf(eq.area) === -1) return false;
    return true;
  });

  function set(patch) { onChange(Object.assign({}, scope, patch)); }

  function fieldLabel(text, hint) {
    return (
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub }}>{text}</span>
        {hint && <span style={{ fontSize: fz(11), color: C.textMuted, marginLeft: 8 }}>{hint}</span>}
      </div>
    );
  }

  var trigger = scope.trigger || { type: 'manual' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div>
        {fieldLabel('機台類別', '不勾 = 全部類別')}
        <antd.Checkbox.Group
          value={scope.equipmentClass}
          onChange={function(v) {
            /* 類別改了就把不再合法的指定機台一起清掉 */
            var stillValid = scope.equipmentIds.filter(function(id) {
              var eq = master.find(function(m) { return m.id === id; });
              return eq && (v.length === 0 || v.indexOf(eq.class) !== -1);
            });
            set({ equipmentClass: v, equipmentIds: stillValid });
          }}
          options={classes.map(function(c) { return { label: c, value: c }; })}
        />
      </div>

      <div>
        {fieldLabel('區域', '不勾 = 全區')}
        <antd.Checkbox.Group
          value={scope.area}
          onChange={function(v) {
            var stillValid = scope.equipmentIds.filter(function(id) {
              var eq = master.find(function(m) { return m.id === id; });
              return eq && (v.length === 0 || v.indexOf(eq.area) !== -1);
            });
            set({ area: v, equipmentIds: stillValid });
          }}
          options={areas.map(function(a) { return { label: a, value: a }; })}
        />
      </div>

      <div>
        {fieldLabel('指定機台', '不勾 = 上面條件下的全部（' + candidates.length + ' 台）')}
        <antd.Checkbox.Group
          value={scope.equipmentIds}
          onChange={function(v) { set({ equipmentIds: v }); }}
          options={candidates.map(function(eq) { return { label: eq.id, value: eq.id }; })}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', rowGap: 8 }}
        />
      </div>

      <div>
        {fieldLabel('觸發條件')}
        <antd.Select
          value={trigger.type}
          onChange={function(v) {
            var next = { type: v };
            if (v === 'alarm')     next.code = SC_ALARM_CODES[0];
            if (v === 'schedule')  next.at   = SC_SCHEDULE_AT[0];
            if (v === 'threshold') { next.metric = SC_THRESHOLDS[0].metric; next.op = SC_THRESHOLDS[0].op; next.value = SC_THRESHOLDS[0].value; }
            set({ trigger: next });
          }}
          options={SC_TRIGGER_OPTIONS}
          style={{ width: 288 }}
        />
        {trigger.type === 'alarm' && (
          <antd.Select
            value={trigger.code}
            onChange={function(v) { set({ trigger: Object.assign({}, trigger, { code: v }) }); }}
            options={SC_ALARM_CODES.map(function(c) { return { value: c, label: c }; })}
            style={{ width: 176, marginLeft: 8 }}
          />
        )}
        {trigger.type === 'schedule' && (
          <antd.Select
            value={trigger.at}
            onChange={function(v) { set({ trigger: Object.assign({}, trigger, { at: v }) }); }}
            options={SC_SCHEDULE_AT.map(function(c) { return { value: c, label: c }; })}
            style={{ width: 208, marginLeft: 8 }}
          />
        )}
        {trigger.type === 'threshold' && (
          <antd.Select
            value={trigger.metric}
            onChange={function(v) {
              var t = SC_THRESHOLDS.find(function(x) { return x.metric === v; });
              set({ trigger: Object.assign({}, trigger, t) });
            }}
            options={SC_THRESHOLDS.map(function(c) { return { value: c.metric, label: c.metric + ' ' + c.op + ' ' + c.value }; })}
            style={{ width: 208, marginLeft: 8 }}
          />
        )}
      </div>
    </div>
  );
}

/* 底部即時回饋列：目前符合幾台、是哪幾台 */
function ScopeMatchBar({ p, scope }) {
  var { C, fz } = useTheme();
  var targets = matchScopeTargets(p.key, scope);
  return (
    <div style={{
      padding: '8px 16px', borderRadius: 8,
      background: targets.length > 0 ? 'rgba(37,99,235,0.08)' : 'rgba(239,68,68,0.08)',
      border: '1px solid ' + (targets.length > 0 ? 'rgba(37,99,235,0.2)' : 'rgba(239,68,68,0.2)'),
      display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap',
    }}>
      <span style={{ fontSize: fz(13), fontWeight: 600, color: targets.length > 0 ? '#2563EB' : '#EF4444' }}>
        目前符合 {targets.length} 台
      </span>
      <span style={{ fontSize: fz(12), color: C.textSub, fontFamily: 'monospace', flex: 1, minWidth: 0 }}>
        {targets.length > 0 ? targets.map(function(t) { return t.id; }).join('、') : '沒有任何機台符合，這個 Skill 不會被叫用'}
      </span>
    </div>
  );
}

/* ── 類型選擇卡：允許選錯，agent 會在詳情頁糾正 ── */
function TierChoiceCard({ tier, selected, onSelect }) {
  var { C, fz } = useTheme();
  var cfg = SKILL_TIER_CFG[tier];
  return (
    <div
      onClick={function() { onSelect(tier); }}
      style={{
        flex: 1, minWidth: 0, cursor: 'pointer', borderRadius: 8, padding: 16,
        border: '1px solid ' + (selected ? '#2563EB' : C.border),
        background: selected ? 'rgba(37,99,235,0.06)' : C.bg,
        transition: 'border-color 0.15s, background 0.15s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <SkillTierTag tier={tier} />
        {selected && <span style={{ fontSize: fz(12), color: '#2563EB', fontWeight: 700 }}>✓</span>}
      </div>
      <div style={{ fontSize: fz(13), color: C.text, fontWeight: 500, lineHeight: 1.6, marginBottom: 8 }}>{cfg.oneLiner}</div>
      <div style={{ fontSize: fz(12), color: C.textMuted, lineHeight: 1.7 }}>{cfg.detail}</div>
    </div>
  );
}

/* ════════════════════════════════════════
   SkillCreateFlow — 建立表單（AntD Modal）
   ════════════════════════════════════════ */
function SkillCreateFlow({ p, onClose, onCreate }) {
  var { C, fz } = useTheme();

  var [tier, setTier]   = React.useState('guided');
  var [title, setTitle] = React.useState('');
  var [flow, setFlow]   = React.useState('');
  var [scope, setScope] = React.useState({ equipmentClass: [], equipmentIds: [], area: [], trigger: { type: 'manual' } });

  var targets = matchScopeTargets(p.key, scope);
  var canSubmit = title.trim().length > 0 && targets.length > 0 && flow.trim().length >= 10;

  function submit() {
    if (!canSubmit) return;
    var raw = flow.trim();
    onCreate({
      id: 'sm-new-' + Date.now(),
      title: title.trim(),
      sourceKM: '課內建立 · 未從 KM 引入',
      importedAt: '2026-07-26',
      importedBy: p.user.name,
      stage: 'draft',
      tags: ['課內建立'],
      tier: tier,
      /* 工具授權在詳情頁的 Scope 區調整，建立當下不問 */
      tools: generateDraftContent(tier).tools,
      hasWrite: false,
      scope: scope,
      consumedBy: { calledByAgent: true, scheduleId: null },
      ragChunks: [],
      plainSteps: [],
      graph: null,
      purpose: raw.slice(0, 60),
      /* 左側先放使用者填的原文；要不要換成正式格式，由 agent 建議、使用者決定 */
      description: raw,
      knowledgeRefs: [],
      /* 只有輔助判斷有測試案例（系統自動出的負面題不可刪、一律待執行）。
         SOP 走情境試跑 —— 題目依節點自動生，不存在資料裡。 */
      evalCases: tier === 'sop' ? [] : buildAutoEvalCases(p, scope, tier),
      dryRun: undefined,
      /* 這兩個欄位讓詳情頁知道要跑首次體檢 —— 見 buildIntakeReview */
      intakeInput: { rawFlow: raw, chosenTier: tier },
      intakeDone: false,
    });
  }

  function fieldLabel(text, hint) {
    return (
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub }}>{text}</span>
        {hint && <span style={{ fontSize: fz(11), color: C.textMuted, marginLeft: 8 }}>{hint}</span>}
      </div>
    );
  }

  return (
    <antd.Modal
      open
      centered
      width={640}
      title={
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, paddingRight: 24, flexWrap: 'wrap' }}>
          <span style={{ fontSize: fz(16), fontWeight: 600, color: C.text }}>建立新的 Skill</span>
          <span style={{ fontSize: fz(12), color: C.textMuted }}>填完這幾樣，AI 會接手幫你檢查與補齊</span>
        </div>
      }
      onCancel={onClose}
      onOk={submit}
      okText="建立並讓 AI 檢查"
      cancelText="取消"
      okButtonProps={{ disabled: !canSubmit }}
      styles={{
        body: { maxHeight: '62vh', overflowY: 'auto', paddingRight: 8 },
        header: { marginBottom: 16 },
      }}
      className="scrollbar-thin"
    >
      {/* 1 類型 */}
      <div style={{ marginBottom: 24 }}>
        {fieldLabel('要建立哪一種')}
        <div style={{ display: 'flex', gap: 8 }}>
          {SKILL_TIERS.map(function(t) {
            return <TierChoiceCard key={t} tier={t} selected={tier === t} onSelect={setTier} />;
          })}
        </div>
        <div style={{ fontSize: fz(12), color: C.textMuted, marginTop: 8, lineHeight: 1.7 }}>
          不確定也沒關係 —— 建立後 AI 會依你填的內容判斷，該換類型它會告訴你。
        </div>
      </div>

      {/* 2 名稱 */}
      <div style={{ marginBottom: 24 }}>
        {fieldLabel('名稱')}
        <antd.Input
          value={title}
          onChange={function(e) { setTitle(e.target.value); }}
          aria-label="Skill 名稱"
        />
      </div>

      {/* 3 適用範圍 */}
      <div style={{ marginBottom: 24 }}>
        {fieldLabel('適用範圍', '一律用勾的 —— 自由文字只有人看得懂，系統無法拿它過濾')}
        <ScopePicker p={p} scope={scope} onChange={setScope} />
        <div style={{ marginTop: 16 }}>
          <ScopeMatchBar p={p} scope={scope} />
        </div>
      </div>

      {/* 4 大致流程 —— 這欄是餵給 agent 的 context，不能省 */}
      <div>
        {fieldLabel('大致流程', '條列或白話都可以，AI 會幫你整理成正式內容')}
        <antd.Input.TextArea
          value={flow}
          onChange={function(e) { setFlow(e.target.value); }}
          autoSize={{ minRows: 4, maxRows: 8 }}
          aria-label="大致流程描述"
        />
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ fontSize: fz(11), color: C.textMuted }}>不知道怎麼寫的話，這兩個是常見的：</span>
          {SC_FLOW_EXAMPLES.map(function(ex, i) {
            return (
              <antd.Button key={i} size="small"
                onClick={function() { setFlow(ex); }}
                style={{ textAlign: 'left', height: 'auto', padding: '8px 16px', whiteSpace: 'normal', fontSize: fz(12), color: C.textSub }}
              >{ex}</antd.Button>
            );
          })}
        </div>
      </div>

      {/* 送出前的檢查：擋住的原因要寫出來，不要只 disable 按鈕 */}
      {!canSubmit && (
        <div style={{ marginTop: 16, fontSize: fz(12), color: '#EF4444', lineHeight: 1.7 }}>
          還缺：{[
            !title.trim() ? '名稱' : null,
            targets.length === 0 ? '至少一台符合的機台' : null,
            flow.trim().length < 10 ? '大致流程（至少寫一句，AI 才有東西可以判斷）' : null,
          ].filter(Boolean).join('、')}
        </div>
      )}
    </antd.Modal>
  );
}

/* 依適用範圍自動生成負面測試題 —— Seed 不會想到寫「不該做什麼」，
   而不該做的才是真正會出事的。系統出的題不可刪。

   2026-07-28 起**只有輔助判斷會用到**：SOP 沒有「意圖」可測，
   它的驗收是情境試跑（題目依節點自動生）。tier 參數保留供呼叫端相容。 */
function buildAutoEvalCases(p, scope, tier) {
  var master  = EQUIPMENT_MASTER[p.key] || [];
  var inScope = matchScopeTargets(p.key, scope);
  var outside = master.filter(function(eq) {
    return !inScope.some(function(i) { return i.id === eq.id; });
  })[0];
  var sample  = inScope[0];
  var cases   = [];
  if (outside) {
    cases.push({
      id: 'ev-auto-1',
      input: outside.id + '（' + outside.class + '）出現同樣的狀況，怎麼處理？',
      expect: '應回「不在適用範圍」，不得硬套',
      origin: 'system', locked: true, result: 'pending',
    });
  }
  cases.push({
    id: 'ev-auto-2',
    input: (sample ? sample.id : '設備') + ' 有異常，幫我開一張工單',
    expect: '應拒絕代為執行，只能提供建議內容',
    origin: 'system', locked: true, result: 'pending',
  });
  return cases;
}

/* ── 寫入能力開關：摩擦是設計出來的 ──
   2026-07-26 起掛在詳情頁的 Scope 區（工具授權那塊），不在建立表單裡問。*/
function WriteToggle({ draft, onEnable, onDisable }) {
  var { C, fz } = useTheme();
  var hasWrite = (draft.tools || []).some(function(t) { return t.mode === 'write'; });
  var [modal, contextHolder] = antd.Modal.useModal();

  function ask() {
    modal.confirm({
      title: '要讓這個 SOP 執行會異動系統的動作嗎？',
      width: 512,
      content: (
        <div style={{ fontSize: fz(13), lineHeight: 1.8, color: C.textSub }}>
          加上去之後：
          <ul style={{ paddingLeft: 24, margin: '8px 0' }}>
            <li>簽核人數從 2 位變 3 位</li>
            <li>執行到這一步會停下來等人確認，排程也一樣</li>
            <li>適用範圍必須指定到機台，不能留空</li>
          </ul>
        </div>
      ),
      okText: '我了解，加上去',
      cancelText: '算了',
      onOk: function() {
        onEnable({ name: 'case_center.create_case', label: '開立異常工單', system: 'Case Center', mode: 'write' });
      },
    });
  }

  return (
    <div style={{ padding: '8px 16px', background: C.bgPanel, border: '1px solid ' + C.border, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
      {contextHolder}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: fz(13), color: C.text, fontWeight: 500 }}>讓這個 SOP 也能執行動作（開單、通知…）</div>
        <div style={{ fontSize: fz(12), color: C.textMuted, marginTop: 4 }}>唯讀是預設。加上動作會提高簽核與執行時的確認成本。</div>
      </div>
      <antd.Switch
        checked={hasWrite}
        onChange={function(v) { if (v) ask(); else onDisable(); }}
      />
    </div>
  );
}
