/* ════════════════════════════════════════
   SKILL CREATE FLOW — 對話式建立

   起點不是「選類型」，是 Seed 講他想解決的問題，由 agent 推薦類型。
   要 Seed 先讀三張說明卡再選，是把系統的分類負擔丟給他。

   流程：講需求 → agent 推薦類型 → 適用範圍勾選 → 產出白話說明 → 試跑 → 加入清單（Draft）
   見 brain/concepts/agent-skill-tiering.md「建立流程：對話式，不是填表」
   ════════════════════════════════════════ */

/* 每一關的順序（進度條與「回上一步」用）*/
const SC_STEPS = [
  { key: 'describe',  label: '講需求' },
  { key: 'recommend', label: '確認類型' },
  { key: 'scope',     label: '適用範圍' },
  { key: 'draft',     label: '白話說明' },
  { key: 'tryrun',    label: '試跑' },
];

/* 需求描述的範例（降低第一句話的門檻，不強迫從零打字）*/
const SC_EXAMPLES = [
  '我想每天交班前自動整理一份當班報告，要有機台稼動、異常件數、待辦交接事項。',
  'E-101 這類 CMP 機台跳 ERR-4421 的時候，希望 AI 幫值班的人研判可能原因。',
  '把課上的換件標準文件整理成 AI 查得到的內容。',
];

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

/* ── agent 依需求描述推薦類型（原型用關鍵詞，真實版是 LLM 判讀）── */
function recommendTier(text) {
  var t = text || '';
  var periodic = /每天|每日|每班|定期|固定|排程|自動/.test(t);
  var aggregate = /整理|彙整|報告|日報|統計|報表|摘要/.test(t);
  var judge = /研判|判斷|分析|怎麼辦|原因|異常處理|建議/.test(t);
  var docs  = /文件|規範|標準|手冊|查得到|查詢|知識/.test(t);

  if (periodic && aggregate) {
    return {
      tier: 'sop',
      why: '你描述的是每天固定要做的彙整，每次步驟都一樣、結果可以重現。',
      benefit: '做成 SOP 可以設成排程自動跑，時間到就有產出。',
    };
  }
  if (judge) {
    return {
      tier: 'guided',
      why: '你描述的狀況每次都不太一樣，沒有固定步驟可以照跑，需要 AI 依課上的指引研判。',
      benefit: '做成輔助判斷可以查現場數據當證據，但不會去動任何系統。',
    };
  }
  if (docs) {
    return {
      tier: 'knowledge',
      why: '你描述的是把既有文件變成可以問的內容，不需要執行任何動作。',
      benefit: '做成知識最單純，AI 回答時會引用它，也不必授權任何系統。',
    };
  }
  return {
    tier: 'guided',
    why: '從你的描述看不出固定步驟，比較像是每次要視狀況判斷的事。',
    benefit: '先做成輔助判斷比較安全；之後如果大家的做法收斂了，可以再變成 SOP。',
  };
}

/* ── agent 依類型與需求生出白話說明（原型為 mock，真實版由生成端回傳）── */
function generateDraftContent(tier, scopeTargets) {
  if (tier === 'sop') {
    return {
      plainSteps: [
        { num: 1, label: '取當班機台稼動資料',       source: 'standard', component: '機台稼動彙整', version: 'v1.2' },
        { num: 2, label: '取同時段警報並分級',       source: 'standard', component: '警報分級',     version: 'v2.0' },
        { num: 3, label: '計算稼動率與異常密度',     source: 'custom',   note: '本課自訂：稼動率排除 PM 時數' },
        { num: 4, label: '取未結案 Case 與待辦事項', source: 'standard', component: 'Case 清單彙整', version: 'v1.1' },
        { num: 5, label: '套用交接報告格式',         source: 'standard', component: '交接報告格式', version: 'v1.0' },
      ],
      tools: [
        { name: 'eqp.get_uptime',        label: '取機台稼動資料', system: '設備監控',    mode: 'read' },
        { name: 'fdc.list_alarms',       label: '取當班警報',     system: 'FDC',         mode: 'read' },
        { name: 'case_center.list_open', label: '取未結案 Case',  system: 'Case Center', mode: 'read' },
      ],
      guidance: [],
    };
  }
  if (tier === 'guided') {
    return {
      plainSteps: [],
      tools: [
        { name: 'fdc.get_alarm_detail', label: '查警報明細',   system: 'FDC',      mode: 'read' },
        { name: 'eqp.get_sensor_trend', label: '查感測器趨勢', system: '設備監控', mode: 'read' },
      ],
      guidance: [
        { id: 'c1', label: '判斷指引', content: '先看現場數據的走勢：持續性的偏移與突發跳動要分開看，兩者的處置方向不同。', tokens: 58 },
        { id: 'c2', label: '要一併確認的數據', content: '取異常發生前 2 小時的趨勢、同機台近 7 天的同類事件次數、上次保養日期。', tokens: 52 },
        { id: 'c3', label: '注意事項', content: '本指引產出的是建議，責任仍在執行者；實際處置請由人執行或改走已核准的 SOP。', tokens: 48 },
      ],
    };
  }
  return {
    plainSteps: [],
    tools: [],
    guidance: [
      { id: 'c1', label: '適用情境', content: '由你提供的文件解析而成，涵蓋 ' + scopeTargets + ' 台設備的作業說明。', tokens: 46 },
      { id: 'c2', label: '操作步驟', content: '1. 依文件內容解析出的步驟會列在這裡。2. 解析完成後可在詳情頁逐段確認。', tokens: 52 },
    ],
  };
}

/* ── 試跑結果（原型 mock）── */
function generateTryRun(tier, targets) {
  if (tier === 'sop') {
    return {
      kind: 'output',
      title: '當班交接報告（試跑）',
      generatedAt: '剛剛',
      metrics: [
        { label: '機台稼動率', value: '94.2', unit: '%',  note: '涵蓋 ' + targets.length + ' 台' },
        { label: '本班異常',   value: '5',    unit: '件', note: 'P1 ×2 / P2 ×3' },
        { label: '待交接事項', value: '4',    unit: '項', note: '' },
      ],
      body: '【KPI 未達標】設備稼動率 94.2%（目標 95%）、Unclose Case 7 件（目標 ≤5）。\n【本班異常】E-308 FDC 異常持續監控中（已 3 小時）。\n【待交接】E-203 預防性保養今日 16:00 開始，備料已確認。',
    };
  }
  if (tier === 'guided') {
    return {
      kind: 'judge',
      question: targets.length > 0 ? (targets[0].id + ' 出現異常，怎麼處理？') : '設備出現異常，怎麼處理？',
      toolRuns: [
        { tool: 'fdc.get_alarm_detail', label: '查警報明細',   mode: 'read',  allowed: true,  result: '取得警報明細 1 筆' },
        { tool: 'eqp.get_sensor_trend', label: '查感測器趨勢', mode: 'read',  allowed: true,  result: '近 2 小時數值緩降，非跳動' },
        { tool: 'mes.create_urgent_order', label: '開立緊急工單', mode: 'write', allowed: false, reason: '本 Skill 類型為「輔助判斷」，不可異動系統', result: '已拒絕 → 改為建議' },
      ],
      answer: '研判為持續性偏移而非突發異常。建議先執行對應的疏通／校正程序，30 分鐘內未改善再開緊急工單。我無法代為開單，內容已擬好可直接複製。',
    };
  }
  return {
    kind: 'knowledge',
    title: '檢索測試',
    body: '以「這份文件講什麼」試問，AI 從解析出的 2 段內容中命中 2 段並完成回答，未使用任何系統工具。',
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

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

/* ════════════════════════════════════════
   SkillCreateFlow — 對話式建立主元件（AntD Modal）
   ════════════════════════════════════════ */
function SkillCreateFlow({ p, onClose, onCreate }) {
  var { C, fz } = useTheme();

  var [step, setStep]         = React.useState('describe');
  var [thinking, setThinking] = React.useState(false);
  var [desc, setDesc]         = React.useState('');
  var [rec, setRec]           = React.useState(null);     /* agent 的推薦 */
  var [tier, setTier]         = React.useState(null);     /* 定案的類型 */
  var [scope, setScope]       = React.useState({ equipmentClass: [], equipmentIds: [], area: [], trigger: { type: 'manual' } });
  var [draft, setDraft]       = React.useState(null);
  var [tryRun, setTryRun]     = React.useState(null);
  var [title, setTitle]       = React.useState('');

  var targets   = matchScopeTargets(p.key, scope);
  var threadRef = React.useRef(null);

  /* agent 回一段就捲到底，不然使用者會停在對話中間 */
  React.useEffect(function() {
    var el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [step, thinking]);

  /* agent「想一下」的節奏；原型用 timeout 模擬 */
  function think(ms, fn) {
    setThinking(true);
    setTimeout(function() { setThinking(false); fn(); }, ms || 900);
  }

  function submitDesc(text) {
    setDesc(text);
    think(1100, function() {
      setRec(recommendTier(text));
      setStep('recommend');
    });
  }

  function acceptTier(t) {
    setTier(t);
    setTitle(suggestTitle(desc, t));
    setStep('scope');
  }

  function confirmScope() {
    think(1000, function() {
      setDraft(generateDraftContent(tier, targets.length));
      setStep('draft');
    });
  }

  function runTry() {
    think(1200, function() {
      setTryRun(generateTryRun(tier, targets));
      setStep('tryrun');
    });
  }

  function promote() {
    var hasWrite = (draft.tools || []).some(function(t) { return t.mode === 'write'; });
    onCreate({
      id: 'sm-new-' + Date.now(),
      title: title.trim() || '未命名 Skill',
      sourceKM: '對話式建立 · 未從 KM 引入',
      importedAt: '2026-07-25',
      importedBy: p.user.name,
      stage: 'draft',
      tags: ['對話建立'],
      tier: tier,
      tools: draft.tools || [],
      hasWrite: hasWrite,
      scope: scope,
      consumedBy: { calledByAgent: true, scheduleId: null },
      genChatId: 'gen-chat-' + Date.now(),
      ragChunks: draft.guidance || [],
      plainSteps: draft.plainSteps || [],
      evalCases: tier === 'guided' ? buildAutoEvalCases(p, scope) : undefined,
      dryRun: undefined,   /* dry run 是 promote 之後在正式介面上再驗一次的事 */
    });
  }

  /* ── 對話泡泡 ── */
  function Bubble({ role, children }) {
    var isAgent = role === 'agent';
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: isAgent ? 'row' : 'row-reverse' }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6, flexShrink: 0,
          background: isAgent ? 'rgba(37,99,235,0.08)' : C.bgPanel,
          border: '1px solid ' + (isAgent ? 'rgba(37,99,235,0.2)' : C.border),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: fz(12), fontWeight: 700, color: isAgent ? '#2563EB' : C.textSub,
        }}>{isAgent ? 'AI' : (p.user.avatar || '我')}</div>
        <div style={{
          flex: 1, minWidth: 0, maxWidth: 720,
          background: isAgent ? C.bgSub : 'rgba(37,99,235,0.08)',
          border: '1px solid ' + (isAgent ? C.border : 'rgba(37,99,235,0.2)'),
          borderRadius: 8, padding: 16,
        }}>{children}</div>
      </div>
    );
  }

  var tierCfg = tier ? SKILL_TIER_CFG[tier] : null;
  var stepIdx = SC_STEPS.findIndex(function(s) { return s.key === step; });

  return (
    <antd.Modal
      open
      centered
      width={880}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 24 }}>
          <span style={{ fontSize: fz(16), fontWeight: 600, color: C.text }}>建立新的 Skill</span>
          <span style={{ fontSize: fz(12), color: C.textMuted }}>跟 AI 說你想解決什麼，它會建議做成哪一種</span>
        </div>
      }
      onCancel={onClose}
      footer={null}
      styles={{
        body: { padding: 0, height: '68vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
        header: { marginBottom: 0, padding: '16px 24px', borderBottom: '1px solid ' + C.border },
        content: { padding: 0, overflow: 'hidden' },
      }}
    >
      {/* 進度：五關 */}
      <div style={{ padding: '8px 24px', borderBottom: '1px solid ' + C.border, flexShrink: 0 }}>
        <antd.Steps
          size="small"
          current={stepIdx < 0 ? 0 : stepIdx}
          items={SC_STEPS.map(function(s) { return { title: <span style={{ fontSize: fz(12) }}>{s.label}</span> }; })}
        />
      </div>

      {/* 對話串 */}
      <div ref={threadRef} style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }} className="scrollbar-thin">

        {/* 1 講需求 */}
        <Bubble role="agent">
          <div style={{ fontSize: fz(14), color: C.text, lineHeight: 1.7 }}>
            你想解決什麼問題？直接講就好，或是把課上現成的文件貼進來。
          </div>
        </Bubble>

        {step === 'describe' && (
          <Bubble role="agent">
            <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 8 }}>不知道怎麼開頭的話，這幾個是常見的：</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SC_EXAMPLES.map(function(ex) {
                return (
                  <antd.Button key={ex} size="small" style={{ textAlign: 'left', height: 'auto', padding: '8px 16px', whiteSpace: 'normal' }}
                    onClick={function() { submitDesc(ex); }}
                  >{ex}</antd.Button>
                );
              })}
            </div>
          </Bubble>
        )}

        {desc && <Bubble role="user"><div style={{ fontSize: fz(14), color: C.text, lineHeight: 1.7 }}>{desc}</div></Bubble>}

        {/* 2 agent 推薦類型 */}
        {rec && (
          <Bubble role="agent">
            <div style={{ fontSize: fz(14), color: C.text, lineHeight: 1.7, marginBottom: 8 }}>{rec.why}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: fz(14), color: C.text }}>我建議做成</span>
              <SkillTierTag tier={rec.tier} />
            </div>
            <div style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.7, marginBottom: 16 }}>{rec.benefit}</div>

            {step === 'recommend' && (
              <React.Fragment>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <antd.Button type="primary" onClick={function() { acceptTier(rec.tier); }}>
                    好，做成{SKILL_TIER_CFG[rec.tier].label}
                  </antd.Button>
                </div>
                <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 8 }}>想改成別的：</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {SKILL_TIERS.filter(function(t) { return t !== rec.tier; }).map(function(t) {
                    return (
                      <antd.Tooltip key={t} title={SKILL_TIER_CFG[t].detail}>
                        <antd.Button size="small" onClick={function() { acceptTier(t); }}>
                          {SKILL_TIER_CFG[t].label} — {SKILL_TIER_CFG[t].oneLiner}
                        </antd.Button>
                      </antd.Tooltip>
                    );
                  })}
                </div>
              </React.Fragment>
            )}
            {step !== 'recommend' && tier && (
              <div style={{ fontSize: fz(13), color: '#2563EB', fontWeight: 600 }}>
                ✓ 已定為「{tierCfg.label}」{tier !== rec.tier ? '（你改過）' : ''}
              </div>
            )}
          </Bubble>
        )}

        {/* 3 適用範圍 */}
        {tier && (
          <Bubble role="agent">
            <div style={{ fontSize: fz(14), color: C.text, lineHeight: 1.7, marginBottom: 8 }}>
              這個 Skill 適用在哪些機台？勾出來就好 —— 沒被圈到的機台，AI 連考慮都不會考慮它。
            </div>
            <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 16 }}>
              這裡不能打字，是刻意的：自由文字只有人看得懂，系統無法拿它過濾。
            </div>

            {step === 'scope'
              ? <ScopePicker p={p} scope={scope} onChange={setScope} />
              : <div style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.8 }}>
                  {describeScope(scope).map(function(r) { return r.label + '：' + r.value; }).join('　·　')}
                </div>
            }

            <div style={{ marginTop: 16 }}>
              <ScopeMatchBar p={p} scope={scope} />
            </div>

            {step === 'scope' && (
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <antd.Button type="primary" disabled={targets.length === 0} onClick={confirmScope}>
                  範圍就這樣，繼續
                </antd.Button>
                {targets.length === 0 && (
                  <span style={{ fontSize: fz(12), color: '#EF4444' }}>至少要有一台符合才能繼續</span>
                )}
              </div>
            )}
          </Bubble>
        )}

        {/* 4 白話說明 + 會碰到哪些系統 */}
        {draft && (
          <Bubble role="agent">
            <div style={{ fontSize: fz(14), color: C.text, lineHeight: 1.7, marginBottom: 16 }}>
              {tier === 'sop'
                ? '我把它拆成這幾步。標準元件是課上已經驗證過的做法，簽核時你只需要重點看「本次自訂」那幾步。'
                : tier === 'guided'
                  ? '我把判斷指引整理成這樣。它不是固定步驟，是給 AI 研判時依循的原則。'
                  : '我把文件解析成這幾段可查詢的內容。'}
            </div>

            {/* 名稱（這裡可以打字，因為它只是名字，不參與過濾）*/}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub, marginBottom: 8 }}>名稱</div>
              <antd.Input value={title} onChange={function(e) { setTitle(e.target.value); }} />
            </div>

            {(draft.plainSteps || []).length > 0 && (
              <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {draft.plainSteps.map(function(s) {
                  var isCustom = s.source === 'custom';
                  return (
                    <div key={s.num} style={{ display: 'flex', alignItems: 'baseline', gap: 8, padding: '8px 16px', background: C.bg, border: '1px solid ' + C.border, borderRadius: 8 }}>
                      <span style={{ fontSize: fz(12), fontWeight: 700, color: C.textMuted, width: 16 }}>{s.num}</span>
                      <span style={{ fontSize: fz(13), color: C.text, flex: 1, minWidth: 0 }}>{s.label}</span>
                      <antd.Tag bordered={false} style={{
                        marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), fontWeight: 600,
                        color: isCustom ? '#F59E0B' : '#2563EB',
                        background: isCustom ? 'rgba(245,158,11,0.08)' : 'rgba(37,99,235,0.08)',
                      }}>{isCustom ? '✎ 本次自訂' : '📦 標準元件 ' + s.version}</antd.Tag>
                    </div>
                  );
                })}
              </div>
            )}

            {(draft.guidance || []).length > 0 && (
              <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {draft.guidance.map(function(g) {
                  return (
                    <div key={g.id} style={{ padding: '8px 16px', background: C.bg, border: '1px solid ' + C.border, borderRadius: 8 }}>
                      <div style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted, marginBottom: 4 }}>{g.label}</div>
                      <div style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.7 }}>{g.content}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 會碰到哪些系統 */}
            <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub, marginBottom: 8 }}>會碰到哪些系統</div>
            {(draft.tools || []).length === 0
              ? <div style={{ fontSize: fz(13), color: C.textMuted, marginBottom: 16 }}>不會連到任何系統，只用課上的文件內容回答。</div>
              : <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {draft.tools.map(function(t) {
                    return (
                      <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: C.bg, border: '1px solid ' + C.border, borderRadius: 8 }}>
                        <span style={{ fontSize: fz(13), color: C.text, width: 128, flexShrink: 0 }}>{t.label}</span>
                        <span style={{ fontSize: fz(12), color: C.textMuted, fontFamily: 'monospace', flex: 1, minWidth: 0 }}>{t.name}</span>
                        <antd.Tag bordered={false} style={{
                          marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), fontWeight: 600,
                          color: t.mode === 'read' ? '#22C55E' : '#EF4444',
                          background: t.mode === 'read' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                        }}>{t.mode === 'read' ? '唯讀' : '會異動系統'}</antd.Tag>
                      </div>
                    );
                  })}
                </div>
            }

            {/* 寫入能力要有摩擦：勾了就講清楚代價，且只有 SOP 能勾 */}
            {tier === 'sop' && (
              <WriteToggle
                draft={draft}
                onEnable={function(tool) { setDraft(Object.assign({}, draft, { tools: (draft.tools || []).concat([tool]) })); }}
                onDisable={function() { setDraft(Object.assign({}, draft, { tools: (draft.tools || []).filter(function(t) { return t.mode !== 'write'; }) })); }}
              />
            )}
            {tier === 'guided' && (
              <div style={{ padding: '8px 16px', background: C.bgPanel, border: '1px solid ' + C.border, borderRadius: 8, fontSize: fz(12), color: C.textMuted, lineHeight: 1.7 }}>
                🔒 「輔助判斷」不能加入會異動系統的動作。需要 AI 代為執行，請改建一個 SOP。
              </div>
            )}

            {step === 'draft' && (
              <div style={{ marginTop: 16 }}>
                <antd.Button type="primary" onClick={runTry}>
                  {tier === 'sop' ? '先試跑一次看看' : tier === 'guided' ? '先試問一次看看' : '先試查一次看看'}
                </antd.Button>
              </div>
            )}
          </Bubble>
        )}

        {/* 5 試跑 */}
        {tryRun && (
          <Bubble role="agent">
            <div style={{ fontSize: fz(14), color: C.text, lineHeight: 1.7, marginBottom: 16 }}>
              這是剛剛實際跑出來的結果。確認沒問題我就把它加進清單，之後你可以在正式介面上再驗一次。
            </div>
            <TryRunResult result={tryRun} />
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <antd.Button type="primary" onClick={promote}>結果沒問題，加進清單</antd.Button>
              <antd.Button onClick={function() { setTryRun(null); setStep('draft'); }}>不太對，回去改</antd.Button>
              <span style={{ fontSize: fz(12), color: C.textMuted }}>加進清單後會是 Draft，還要經過確認與簽核才會生效。</span>
            </div>
          </Bubble>
        )}

        {thinking && (
          <Bubble role="agent">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="spin" style={{ width: 16, height: 16, border: '2px solid ' + C.border, borderTopColor: '#2563EB', borderRadius: '50%' }} />
              <span style={{ fontSize: fz(13), color: C.textMuted }}>AI 正在處理…</span>
            </div>
          </Bubble>
        )}
      </div>

      {/* 輸入列：只有第一關要打字 */}
      {step === 'describe' && (
        <div style={{ padding: 16, borderTop: '1px solid ' + C.border, flexShrink: 0, display: 'flex', gap: 8 }}>
          <antd.Input.TextArea
            value={desc}
            onChange={function(e) { setDesc(e.target.value); }}
            autoSize={{ minRows: 2, maxRows: 4 }}
            onPressEnter={function(e) { e.preventDefault(); if (desc.trim()) submitDesc(desc.trim()); }}
          />
          <antd.Button type="primary" disabled={!desc.trim()} onClick={function() { submitDesc(desc.trim()); }}>送出</antd.Button>
        </div>
      )}
    </antd.Modal>
  );
}

/* 依需求描述與類型給個預設名稱（可改）*/
function suggestTitle(desc, tier) {
  var t = desc || '';
  if (/交班|交接/.test(t)) return '整理當班交接報告';
  if (/ERR-4421|冷卻/.test(t)) return 'ERR-4421 冷卻異常研判';
  if (/換件/.test(t)) return '換件標準作業內容';
  return SKILL_TIER_CFG[tier].label + '（未命名）';
}

/* 依適用範圍與類型自動生成負面測試題 —— Seed 不會想到寫「不該做什麼」，
   而不該做的才是真正會出事的。系統出的題不可刪。 */
function buildAutoEvalCases(p, scope) {
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

/* ── 寫入能力開關：摩擦是設計出來的 ── */
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

/* ── 試跑結果的三種樣子 ── */
function TryRunResult({ result }) {
  var { C, fz } = useTheme();

  if (result.kind === 'output') {
    return (
      <div style={{ border: '1px solid ' + C.border, borderRadius: 8, padding: 16, background: C.bg }}>
        <div style={{ fontSize: fz(14), fontWeight: 600, color: C.text, marginBottom: 8 }}>{result.title}</div>
        <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 16 }}>{result.generatedAt}</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {result.metrics.map(function(m) {
            return (
              <div key={m.label} style={{ flex: '1 1 128px', border: '1px solid ' + C.border, borderRadius: 8, padding: 16 }}>
                <div style={{ fontSize: fz(11), color: C.textMuted, marginBottom: 8 }}>{m.label}</div>
                <div style={{ fontSize: fz(18), fontWeight: 600, color: C.text }}>{m.value}<span style={{ fontSize: fz(12), color: C.textMuted, marginLeft: 4 }}>{m.unit}</span></div>
                {m.note && <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 8 }}>{m.note}</div>}
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.8, whiteSpace: 'pre-wrap', background: C.bgSub, border: '1px solid ' + C.border, borderRadius: 8, padding: 16 }}>{result.body}</div>
      </div>
    );
  }

  if (result.kind === 'judge') {
    return (
      <div style={{ border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: 16, borderBottom: '1px solid ' + C.border, fontSize: fz(13), color: C.text, fontWeight: 500, background: C.bgSub }}>
          試問：「{result.question}」
        </div>
        {result.toolRuns.map(function(t, i) {
          return (
            <div key={i} style={{ padding: '8px 16px', borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', background: t.allowed ? 'transparent' : 'rgba(239,68,68,0.04)' }}>
              <span style={{ fontSize: fz(14), fontWeight: 700, color: t.allowed ? '#22C55E' : '#EF4444', width: 16 }}>{t.allowed ? '✓' : '✗'}</span>
              <span style={{ fontSize: fz(13), color: C.text }}>{t.label}</span>
              <span style={{ fontSize: fz(12), color: C.textMuted, fontFamily: 'monospace' }}>{t.tool}</span>
              <antd.Tag bordered={false} style={{
                marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), fontWeight: 600,
                color: t.mode === 'read' ? '#22C55E' : '#EF4444',
                background: t.mode === 'read' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
              }}>{t.mode === 'read' ? '唯讀' : '會異動系統'}</antd.Tag>
              <span style={{ fontSize: fz(12), color: t.allowed ? C.textSub : '#EF4444', flex: 1, minWidth: 0 }}>{t.result}</span>
            </div>
          );
        })}
        <div style={{ padding: 16, fontSize: fz(13), color: C.textSub, lineHeight: 1.8 }}>{result.answer}</div>
      </div>
    );
  }

  return (
    <div style={{ border: '1px solid ' + C.border, borderRadius: 8, padding: 16, background: C.bg }}>
      <div style={{ fontSize: fz(14), fontWeight: 600, color: C.text, marginBottom: 8 }}>{result.title}</div>
      <div style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.8 }}>{result.body}</div>
    </div>
  );
}
