/* ════════════════════════════════════════
   SKILL DETAIL PAGE — Skill / Codify 詳情（全頁）

   2026-07-26 PO 定案的版面：
     Title / Scope / Description / Graph（僅 Codify）/ 驗收 & Dry-run
     右上：[Ask AI]（修正這一份）與 [Signoff]（送簽核與生效）

   原本的大 Modal 改成全頁，理由是 Graph 與 Ask AI 側欄要同時展開，
   1000px 的 Modal 塞不下這兩者。

   刻意拿掉的東西（資訊沒有不見，換了地方）：
     · 「會碰到哪些系統」大區塊 → Codify 收進 Graph 節點標記，
        Skill 收成 Scope 底下一行可展開的摘要
     · 「最近一次處理紀錄」 → Chat 情境 3 就是它的活體展示，
        這裡只在測試區保留一則做為對照
   ════════════════════════════════════════ */

/* ── 送簽的硬條件（回傳擋下的原因，null = 可送）──

   2026-07-28 PO 定案：**兩種類型的驗收方法完全不同，不共用同一套題目。**
     · Codify＝codify graph，每個節點都是程式碼。它沒有「意圖」可測 ——
       圖裡沒有的工具它根本呼叫不到，範圍是勾出來的結構化條件。
       要測的是**結果與例外**：情境試跑。
     · Skill＝同一份指引換個問法就走不同路，沒有固定步驟可以試跑。
       要測的是**意圖**：驗收條件（含系統自動補的、不可刪的那幾條）。

   2026-07-29 PO 定案：Skill 的「測試案例」改為「驗收」。
   原因有二 ——
     (1) 「測試案例」跟 codify graph 的 test 混淆，兩者驗的東西根本不同；
     (2) 更根本的：Skill 每次結果都不一樣，「跑一次 PASS」在邏輯上就不成立。
   改成每個提問情境跑 5 次、由人看內容確認驗收條件是否成立。
   判定權因此從系統移到人身上（誠實 —— 本來也沒有東西能自動判斷 LLM 的回答對不對），
   代價是「簽核變蓋章」的風險升高。2026-07-29 PO 再定案：
   **系統與 AI 都不介入判斷**，連初判都不要 —— 那等於把責任壓在 AI 身上。
   這一區只做一件事：把每一次實際做了什麼、最後回了什麼攤開，人自己看完再勾。
   唯一保留的硬約束是「改了 Description 就作廢先前的紀錄」（契約失效，同 Codify 的白話說明）。

   見 brain/concepts/agent-skill-tiering.md 決議 12、13 與「簽核驗收」 */
function getSignoffGate(skill, calcOpened) {
  if (skill.stage === 'approving' || skill.stage === 'pirun' || skill.stage === 'production') return null;

  if (skill.tier === 'sop') {
    var scs = buildDataScenarios(skill);
    if (scs.length === 0) return '還沒有流程步驟，無法試跑也無法送簽';
    var res = (skill.scenarioRun && skill.scenarioRun.results) || {};
    /* 沒跑過就沒有結果可言 —— 這是「執行情境試跑」按鈕存在的理由 */
    var notRun = scs.filter(function(sc) {
      if (res[sc.id]) return false;
      return !(sc.kind === 'normal' && skill.dryRun);   /* 正常資料那條原本就跑過 */
    });
    if (notRun.length > 0) return '還有 ' + notRun.length + ' 個情境沒跑過，請先按「執行情境試跑」';
    var bad = scs.filter(function(sc) { return res[sc.id] === 'fail'; });
    if (bad.length > 0) {
      return '情境「' + bad[0].label + '」的行為不符合約定，要先修流程才能送簽'
        + (bad.length > 1 ? '（共 ' + bad.length + ' 個未通過）' : '');
    }
    if (skill.dryRun && !calcOpened) {
      return '請先展開「正常資料」情境裡的「每個數字怎麼算的」，確認過再送簽';
    }
    return null;
  }

  var acc    = skill.acceptance || {};
  var crits  = acc.criteria || [];
  var probes = acc.probes || [];
  if (crits.length === 0)  return '尚未建立驗收條件，無法送簽';
  if (probes.length === 0) return '尚未建立提問情境，沒有東西可以跑，無法送簽';
  if (!skill.acceptRun)    return '還沒有執行過驗收，請先按「執行驗收」';
  if (acceptStale(skill))  return '指引（Description）在上次驗收之後改過，先前的結果已作廢 —— 請重新執行驗收';
  var fresh = acceptUnrunCrits(skill);
  if (fresh.length > 0) {
    return '有 ' + fresh.length + ' 條驗收條件是上次執行之後才加的，還沒跑過，請重新執行驗收';
  }
  var checks  = skill.acceptChecks || {};
  var unknown = crits.filter(function(c) { return !checks[c.id]; });
  if (unknown.length > 0) {
    return '還有 ' + unknown.length + ' 條驗收條件沒有確認（例如「' + unknown[0].text + '」）'
      + ' —— 看過下面那幾次的紀錄再決定要不要勾';
  }
  return null;
}

/* ── 驗收的計算 ──────────────────────────────

   同一個提問跑 5 次：測的是**穩定性**，不是覆蓋率。
   覆蓋率靠情境數量去撐（一個情境 = 一種問法）。

   2026-07-29 PO 定案：**系統與 AI 都不介入判斷**。
   之前這裡有「系統依條件對每次回答做的初判」（圓點與 X/Y），已整個移除 ——
   那本質上就是判斷，只是包了一層，而且等於把責任壓在 AI 身上。
   現在這裡只做一件事：把每一次**實際做了什麼、最後回了什麼**攤開來，人自己看。

   probe.vary[i] 記的是第 i+1 次跟典型的差別，不是「對或錯」：
     drop   少做了哪幾步        add    多做了哪幾步
     answer 這一次的回答（沒寫就沿用典型的） */

const ACCEPT_RUNS = 5;

function acceptProbes(skill)  { return (skill.acceptance || {}).probes   || []; }
function acceptCrits(skill)   { return (skill.acceptance || {}).criteria || []; }

/* 指引改過就作廢 —— 「勾完再改指引」不能繞過驗收，
   跟 Codify 那邊「code 改了白話說明沒改＝契約失效」是同一個道理 */
function acceptStale(skill) {
  if (!skill.acceptRun) return false;
  return (skill.acceptRun.descRev || 0) !== (skill.descRev || 0);
}

/* 上次執行之後才加進來的條件：沒跑過就沒有紀錄可看 */
function acceptUnrunCrits(skill) {
  if (!skill.acceptRun) return [];
  var ran = skill.acceptRun.critIds || [];
  return acceptCrits(skill).filter(function(c) { return ran.indexOf(c.id) < 0; });
}

/* 剛建立的 Skill 還沒有人寫過情境內容 —— 依它授權的工具生一組看得懂的紀錄，
   不然按下「執行驗收」會得到 5 次空白 */
function synthSteps(skill, probe) {
  var reads = (skill.tools || []).filter(function(t) { return t.mode === 'read'; }).slice(0, 2);
  var head  = [{ kind: 'match', text: probe.kind === 'outscope'
    ? '不符合本 Skill 的適用範圍'
    : '符合本 Skill 的適用範圍' }];
  if (probe.kind === 'outscope') return head;
  var steps = head.concat(reads.map(function(t) {
    return { kind: 'tool', tool: t.name, label: t.label, allowed: true, result: '（原型：尚未接上真實系統）' };
  }));
  if (probe.kind === 'writereq') {
    steps.push({ kind: 'tool', tool: 'mes.create_case', label: '開立工單', allowed: false,
      reason: '類型為「Skill」，不可異動系統', result: '已拒絕 → 改為建議' });
  }
  return steps;
}

function synthAnswer(skill, probe) {
  if (probe.kind === 'outscope') {
    return '這個對象不在本指引的適用範圍，我沒有套用這裡的判斷順序，也沒有去查任何數據。\n（原型：尚未接上真實模型。）';
  }
  if (probe.kind === 'writereq') {
    return '這個動作我不能代為執行 —— 本 Skill 只有唯讀工具，我只能把要送出的內容整理好給你。\n（原型：尚未接上真實模型。）';
  }
  return '（原型：尚未接上真實模型，這裡會是依《' + skill.title + '》產出的研判內容。）';
}

/* 把一個情境展開成 5 次紀錄。每一次就是「做了哪些事」＋「最後回了什麼」，
   沒有任何評分欄位 —— 這一區刻意不產出任何判斷。 */
function buildProbeRuns(skill, probe) {
  var base       = (probe.steps && probe.steps.length) ? probe.steps : synthSteps(skill, probe);
  var baseAnswer = probe.answer || synthAnswer(skill, probe);
  var out = [];
  for (var i = 0; i < ACCEPT_RUNS; i++) {
    var v     = (probe.vary || [])[i] || {};
    var drop  = v.drop || [];
    var steps = base.filter(function(s, k) { return drop.indexOf(k) < 0; }).concat(v.add || []);
    out.push({ id: probe.id + '-' + (i + 1), idx: i + 1, steps: steps, answer: v.answer || baseAnswer });
  }
  return out;
}

/* 收起來時那一行：把發生過的事按順序列出來，就這樣。
   不是摘要也不是評語 —— 使用者掃一眼看到「第 2 次少了一步」，
   那個判斷是他自己下的，不是系統告訴他的。 */
function runOutline(run) {
  var names = run.steps.map(function(s) {
    if (s.kind === 'match') return '比對範圍';
    return (s.allowed ? '' : '✗ ') + s.label;
  });
  return names.concat(['回答']).join('　→　');
}

/* 右上那顆按鈕：一顆會看狀態的按鈕，取代原本散在各處的階段推進鈕 */
function getSignoffAction(stage) {
  switch (stage) {
    case 'draft':      return { label: '送出簽核', next: 'approving', enabled: true  };
    case 'testing':    return { label: '送出簽核', next: 'approving', enabled: true  };
    case 'approving':  return { label: '簽核中',   next: null,        enabled: false };
    case 'pirun':      return { label: '確認生效', next: 'production', enabled: true };
    case 'production': return { label: '已生效',   next: null,        enabled: false };
    default:           return { label: '送出簽核', next: 'approving', enabled: true  };
  }
}

/* ════════════════════════════════════════
   SectionBlock — 詳情頁的區塊外框

   refreshing / flash：Ask AI 套用變更後，這一區會先變灰（更新中），
   換完內容再閃一次藍框。左側平常不會被 AI 動到，所以「它剛剛變了」
   必須看得出來，不然使用者不知道自己按的那顆按鈕做了什麼。
   ════════════════════════════════════════ */
function SdSection({ id, title, desc, badge, extra, refreshing, flash, contentKey, children }) {
  var { C, fz } = useTheme();
  return (
    <div id={id} style={{ marginBottom: 32 }} className={flash ? 'sd-flash' : undefined}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: desc ? 4 : 16 }}>
        <span style={{ fontSize: fz(14), fontWeight: 700, color: C.text, letterSpacing: '0.01em' }}>{title}</span>
        {badge && (
          <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), background: C.bgPanel, color: C.textMuted }}>{badge}</antd.Tag>
        )}
        {refreshing && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="spin" style={{ width: 12, height: 12, border: '2px solid ' + C.border, borderTopColor: '#2563EB', borderRadius: '50%' }} />
            <span style={{ fontSize: fz(11), color: '#2563EB', fontWeight: 600 }}>更新中…</span>
          </span>
        )}
        <div style={{ flex: 1 }} />
        {extra}
      </div>
      {desc && <div style={{ fontSize: fz(12), color: C.textMuted, lineHeight: 1.6, marginBottom: 16 }}>{desc}</div>}
      <div
        key={contentKey}
        className={contentKey ? 'fade-in' : undefined}
        style={refreshing ? { opacity: 0.3, pointerEvents: 'none', transition: 'opacity 0.2s' } : { transition: 'opacity 0.2s' }}
      >{children}</div>
    </div>
  );
}

/* ════════════════════════════════════════
   SkillGraph — Codify 的流程圖（僅 Codify 有）

   節點直接標出讀 / 寫 / 計算與「需人工確認」，
   所以不需要另開一個「會碰到哪些系統」的大區塊。
   ════════════════════════════════════════ */
function buildGraphLevels(steps, edges) {
  /* 以「距離 start 的最長路徑」分層，確保箭頭一律往下 */
  var byNum = {};
  steps.forEach(function(s) { byNum[s.num] = s; });

  var incoming = {};
  steps.forEach(function(s) { incoming[s.num] = []; });
  edges.forEach(function(e) {
    if (e.to !== 'end' && e.to !== 'start' && incoming[e.to]) incoming[e.to].push(e.from);
  });

  var level = {};
  var guard = 0;
  function levelOf(num) {
    if (level[num] != null) return level[num];
    var parents = incoming[num] || [];
    var lv = 0;
    parents.forEach(function(pn) {
      if (pn === 'start') return;
      if (guard++ > 500) return;
      lv = Math.max(lv, levelOf(pn) + 1);
    });
    level[num] = lv;
    return lv;
  }
  steps.forEach(function(s) { levelOf(s.num); });

  var maxLv = 0;
  steps.forEach(function(s) { maxLv = Math.max(maxLv, level[s.num]); });

  var rows = [];
  for (var i = 0; i <= maxLv; i++) {
    rows.push(steps.filter(function(s) { return level[s.num] === i; }).sort(function(a, b) { return a.num - b.num; }));
  }
  return { rows: rows, level: level };
}

/* 連接線。跨層的邊（例如「無 OOC 直接結束」）會在每一段連接條上
   畫出通過線，不然節點會看起來斷掉。 */
function GraphConnector({ rows, level, edges, band }) {
  var { C, fz } = useTheme();

  /* 同一列的節點等寬平均分佈，所以中心點可以直接用比例算出來 */
  function centerPct(num) {
    var lv = level[num];
    if (lv == null) return 50;
    var row = rows[lv] || [];
    var idx = -1;
    row.forEach(function(s, i) { if (s.num === num) idx = i; });
    if (idx < 0) return 50;
    return ((idx + 0.5) / row.length) * 100;
  }

  var lines = [];

  if (band === 'start') {
    /* 開始 → 第一列所有沒有上游步驟的節點 */
    (rows[0] || []).forEach(function(s) {
      lines.push({ x1: 50, x2: centerPct(s.num) });
    });
  } else if (band === 'end') {
    /* 最後一列（與所有指向 end 的節點）→ 結束 */
    var toEnd = {};
    edges.forEach(function(e) { if (e.to === 'end' && e.from !== 'start') toEnd[e.from] = e.label || null; });
    var lastLv = rows.length - 1;
    (rows[lastLv] || []).forEach(function(s) { if (!(s.num in toEnd)) toEnd[s.num] = null; });
    Object.keys(toEnd).forEach(function(k) {
      var num = Number(k);
      /* 標籤只在邊離開起點的那一段顯示一次，跨層的邊在中段已經標過了 */
      var showLabel = level[num] === lastLv;
      lines.push({ x1: centerPct(num), x2: 50, label: showLabel ? toEnd[k] : null });
    });
  } else {
    /* band = i 代表第 i 列與第 i+1 列之間。
       只要邊的起點在第 i 列或更上面、終點在第 i+1 列或更下面，就要在這一段畫線。 */
    edges.forEach(function(e) {
      if (e.from === 'start' || e.to === 'start') return;
      var lf = e.to === 'end' ? Infinity : level[e.to];
      var ls = level[e.from];
      if (ls == null || lf == null) return;
      if (ls <= band && lf >= band + 1) {
        lines.push({
          x1: centerPct(e.from),
          x2: e.to === 'end' ? centerPct(e.from) : centerPct(e.to),
          /* 標籤只在邊真正離開起點的那一段顯示一次 */
          label: ls === band ? e.label : null,
        });
      }
    });
  }

  if (lines.length === 0) {
    return <div style={{ height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 1, height: '100%', background: C.borderStrong }} />
    </div>;
  }

  /* 同一個節點分岔出多條線時把終點岔開，否則兩條線與兩個標籤會重疊成一條 */
  var bySource = {};
  lines.forEach(function(l) {
    var k = String(l.x1);
    bySource[k] = (bySource[k] || []).concat([l]);
  });
  Object.keys(bySource).forEach(function(k) {
    var group = bySource[k];
    if (group.length < 2) return;
    group.forEach(function(l, i) {
      l.x2 = l.x2 + (i - (group.length - 1) / 2) * 22;
    });
  });

  return (
    <div style={{ position: 'relative', height: 32 }}>
      <svg width="100%" height="32" viewBox="0 0 100 32" preserveAspectRatio="none" style={{ display: 'block' }}>
        {lines.map(function(l, i) {
          return (
            <line key={i}
              x1={l.x1} y1="0" x2={l.x2} y2="32"
              stroke={C.borderStrong} strokeWidth="1" vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      {lines.filter(function(l) { return l.label; }).map(function(l, i) {
        return (
          <span key={i} style={{
            position: 'absolute', top: 6, left: ((l.x1 + l.x2) / 2) + '%', transform: 'translateX(-50%)',
            fontSize: fz(10), fontWeight: 600, color: '#F59E0B',
            background: C.bgSub, padding: '0 4px', whiteSpace: 'nowrap',
          }}>{l.label}</span>
        );
      })}
    </div>
  );
}

function GraphTerminal({ label }) {
  var { C, fz } = useTheme();
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <span style={{
        fontSize: fz(11), fontWeight: 600, color: C.textMuted,
        border: '1px solid ' + C.border, borderRadius: 999,
        padding: '4px 16px', background: C.bgSub,
      }}>{label}</span>
    </div>
  );
}

function GraphNode({ step, onProbe }) {
  var { C, fz } = useTheme();
  var isCustom = step.source === 'custom';
  var io = step.io || 'compute';
  var ioCfg = SKILL_IO_CFG[io] || SKILL_IO_CFG.compute;
  return (
    <div style={{
      flex: 1, minWidth: 0,
      border: '1px solid ' + (step.needsConfirm ? 'rgba(239,68,68,0.35)' : C.border),
      borderLeft: '3px solid ' + (isCustom ? '#F59E0B' : '#2563EB'),
      borderRadius: 8, background: C.bg, padding: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{
          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
          background: isCustom ? '#F59E0B' : '#2563EB', color: '#FFFFFF',
          fontSize: fz(11), fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{step.num}</span>
        <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text, flex: 1, minWidth: 0 }}>{step.label}</span>
        {/* 選節點時人看的是流程圖，不是下拉選單 —— 入口就放在節點上 */}
        {onProbe && (
          <antd.Button size="small" type="text" onClick={onProbe}
            style={{ fontSize: fz(11), color: '#2563EB', flexShrink: 0, padding: '0 4px', height: 20 }}>▷ 試打</antd.Button>
        )}
        <span style={{ fontSize: fz(11), fontWeight: 700, color: ioCfg.color, flexShrink: 0 }}>{ioCfg.icon}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: step.note || step.tool ? 8 : 0 }}>
        <SkillIoTag io={io} />
        {isCustom
          ? <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(10), fontWeight: 600, color: '#F59E0B', background: 'rgba(245,158,11,0.08)' }}>✎ 本次自訂</antd.Tag>
          : <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(10), fontWeight: 600, color: '#2563EB', background: 'rgba(37,99,235,0.08)' }}>📦 {step.component} {step.version}</antd.Tag>
        }
        {step.needsConfirm && (
          <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(10), fontWeight: 700, color: '#EF4444', background: 'rgba(239,68,68,0.08)' }}>🔒 需人工確認</antd.Tag>
        )}
      </div>
      {step.tool && (
        <div style={{ fontSize: fz(11), color: C.textMuted, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {step.system} · {step.tool}
        </div>
      )}
      {step.note && (
        <div style={{ fontSize: fz(12), color: C.textMuted, lineHeight: 1.6, marginTop: 4 }}>{step.note}</div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   ProbeModal — 單一節點試打（2026-07-27 PO 指定）

   「讓使用者選擇試打資料訪問的 api / node，這樣就不用猜。」
   整份跑只告訴你「壞了」，不會告訴你哪一段的介面對不上；
   單獨打一個節點才看得到它到底吃什麼、吐什麼。

   三種節點三種輸入 —— 對節點來說「輸入」根本不是同一件事：
     read    → API 參數（可改）
     compute → **上游那一步的輸出**（可直接編輯，極值問題住在這裡）
     write   → 參數照給，但**永遠不真的送出**，只算得出會送出什麼

   試打不是簽核條件。它是探索工具，不進 getSignoffGate ——
   否則使用者會被逼著把每個節點都點一遍，又變成蓋章。
   ════════════════════════════════════════ */
function ProbeModal({ skill, step, onClose, onSaveScenario }) {
  var { C, fz } = useTheme();
  var spec = (step.tool && TOOL_PROBE[step.tool]) || null;
  var isWrite = step.io === 'write';
  var isCompute = !step.tool;

  /* 上游那一步的輸出：compute 節點的「輸入」就是它 */
  var upstream = null;
  if (isCompute) {
    var prev = (skill.plainSteps || []).filter(function(s) { return s.num < step.num && s.tool; }).pop();
    var pspec = prev && TOOL_PROBE[prev.tool];
    upstream = pspec ? { step: prev, text: pspec.sample || '' } : null;
  }

  var [params, setParams] = React.useState(function() {
    var o = {};
    ((spec && spec.params) || []).forEach(function(p) { o[p.key] = p.value; });
    return o;
  });
  var [feed, setFeed]   = React.useState(upstream ? upstream.text : '');
  var [busy, setBusy]   = React.useState(false);
  var [out, setOut]     = React.useState(null);
  var [expect, setExpect] = React.useState('');
  var [saved, setSaved]   = React.useState(false);

  function fire() {
    setBusy(true); setOut(null);
    setTimeout(function() {
      setBusy(false);
      setOut({ at: new Date().toLocaleTimeString('zh-TW', { hour12: false }) });
    }, 800);
  }

  /* 算出來的東西：Codify 的試跑資料裡若有這一步的算法就照它講，講得比通則準 */
  var calc = ((skill.dryRun && skill.dryRun.calculations) || []).filter(function(c) { return c.stepNum === step.num; })[0];

  var fields = (spec && spec.fields) || [];

  return (
    <antd.Modal
      open centered width={640} onCancel={onClose} footer={null}
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: fz(16), fontWeight: 600 }}>試打 · 步驟 {step.num} {step.label}</span>
          <SkillIoTag io={step.io || 'compute'} />
        </span>
      }
    >
      {step.tool && (
        <div style={{ fontSize: fz(12), color: C.textMuted, fontFamily: 'monospace', marginBottom: 16 }}>
          {step.system} · {step.tool}
        </div>
      )}

      {isWrite && (
        <antd.Alert type="warning" showIcon style={{ marginBottom: 16 }}
          message={<span style={{ fontSize: fz(12), fontWeight: 600 }}>這一步不會真的送出</span>}
          description={<span style={{ fontSize: fz(12), lineHeight: 1.6 }}>寫入節點的試打只算得出「會送出什麼」。一個「試」的按鈕真的開了工單，整套人工確認就沒有意義了。</span>}
        />
      )}

      {/* ── 輸入 ── */}
      <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub, marginBottom: 8 }}>
        {isCompute ? '上游資料（可直接改成你想試的值）' : '參數（可自己改）'}
      </div>

      {isCompute ? (
        <React.Fragment>
          {upstream && (
            <div style={{ fontSize: fz(11), color: C.textMuted, marginBottom: 4 }}>
              來自步驟 {upstream.step.num}「{upstream.step.label}」
            </div>
          )}
          <antd.Input.TextArea value={feed} onChange={function(e) { setFeed(e.target.value); }}
            autoSize={{ minRows: 3, maxRows: 6 }} style={{ fontFamily: 'monospace', fontSize: fz(12) }} />
          <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 8, lineHeight: 1.7 }}>
            自動出的情境是通則。真正會出事的那組值只有做過的人知道 —— 把它打進來試。
          </div>
        </React.Fragment>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {((spec && spec.params) || []).map(function(p) {
            return (
              <div key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: fz(12), color: C.textSub, width: 96, flexShrink: 0 }}>{p.label}</span>
                <antd.Input size="small" value={params[p.key]}
                  onChange={function(e) { var v = e.target.value; setParams(function(prev) { var n = Object.assign({}, prev); n[p.key] = v; return n; }); }}
                  style={{ fontFamily: 'monospace', fontSize: fz(12) }} />
              </div>
            );
          })}
          {(!spec || (spec.params || []).length === 0) && (
            <div style={{ fontSize: fz(12), color: C.textMuted }}>這個工具不吃參數。</div>
          )}
        </div>
      )}

      <antd.Button type="primary" size="small" loading={busy} onClick={fire} style={{ marginTop: 16 }}>
        {isWrite ? '看會送出什麼' : '試打這一步'}
      </antd.Button>

      {/* ── 回傳 ── */}
      {out && (
        <div style={{ marginTop: 16, border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ padding: '8px 16px', background: C.bgSub, fontSize: fz(12), fontWeight: 600, color: C.text }}>
            {isWrite ? '會送出的欄位' : (isCompute ? '算出來的結果' : '回傳 ' + (spec ? spec.rows : 0) + ' 筆')}
            <span style={{ fontWeight: 400, color: C.textMuted, marginLeft: 8 }}>{out.at}</span>
          </div>

          {isCompute ? (
            <div style={{ padding: '8px 16px' }}>
              <div style={{ fontSize: fz(12), color: C.textSub, lineHeight: 1.7 }}>
                算法：{calc ? calc.how : (step.note || '本節點的自訂邏輯')}
              </div>
              <div style={{ fontSize: fz(12), color: C.text, lineHeight: 1.7, marginTop: 4, fontFamily: 'monospace' }}>
                {feed.trim() === '' ? '（輸入是空的 —— 這個節點對空輸入怎麼反應，正是該測的）' : '依上述輸入完成計算'}
              </div>
            </div>
          ) : (
            <React.Fragment>
              {fields.map(function(f, i) {
                return (
                  <div key={f.name} style={{
                    padding: '8px 16px', borderTop: i > 0 ? '1px solid ' + C.border : 'none',
                    display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap',
                  }}>
                    <span style={{ fontSize: fz(12), fontFamily: 'monospace', color: C.text, fontWeight: 600 }}>{f.name}</span>
                    <span style={{ fontSize: fz(11), color: C.textMuted, fontFamily: 'monospace' }}>{f.type}</span>
                    <span style={{ fontSize: fz(12), color: C.textSub, flex: 1, minWidth: 0 }}>{f.note}</span>
                    {/* 沒有下游用到的欄位壞掉不痛，會痛的是這幾個 */}
                    {f.usedBy && (
                      <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(10), color: '#2563EB', background: 'rgba(37,99,235,0.08)' }}>
                        {f.usedBy}
                      </antd.Tag>
                    )}
                  </div>
                );
              })}
              {spec && spec.sample && !isWrite && (
                <div style={{ padding: '8px 16px', borderTop: '1px solid ' + C.border, fontSize: fz(12), color: C.textMuted, fontFamily: 'monospace' }}>
                  第 1 筆：{spec.sample}
                </div>
              )}
              {fields.length === 0 && (
                <div style={{ padding: '8px 16px', fontSize: fz(12), color: C.textMuted }}>這個工具還沒登錄欄位定義。</div>
              )}
            </React.Fragment>
          )}
        </div>
      )}

      {/* ── 打出問題就地存成情境 ──
           我原本反對讓人自己加壞資料情境，因為那要人用文字描述「怎麼壞」，太技術。
           但如果是**打出來**的，輸入就在手上，只要補一句「這種時候應該怎麼樣」就成一題。 */}
      {out && !saved && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid ' + C.border }}>
          <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub, marginBottom: 8 }}>
            這種時候應該怎麼樣？（填了就能存成一個情境）
          </div>
          <antd.Input.TextArea value={expect} onChange={function(e) { setExpect(e.target.value); }}
            autoSize={{ minRows: 2, maxRows: 3 }} placeholder="" />
          <antd.Button size="small" type="dashed" disabled={!expect.trim()} style={{ marginTop: 8 }}
            onClick={function() {
              onSaveScenario({
                id: 'sc-user-' + Date.now(),
                kind: 'user', origin: 'seed',
                label: '試打 · 步驟 ' + step.num + ' ' + step.label,
                inject: { stepNum: step.num, tool: step.tool || null, how: isCompute ? ('上游資料：' + feed) : Object.keys(params).map(function(k) { return k + '=' + params[k]; }).join(' · ') },
                expect: expect.trim(),
              });
              setSaved(true);
            }}>
            存成一個情境
          </antd.Button>
        </div>
      )}
      {saved && (
        <div style={{ marginTop: 16, fontSize: fz(12), color: '#22C55E', fontWeight: 600 }}>
          ✓ 已加進情境清單（待執行）。回到下面按一次「執行情境試跑」。
        </div>
      )}
    </antd.Modal>
  );
}

function SkillGraph({ skill, onSaveScenario }) {
  var { C, fz } = useTheme();
  var [probeStep, setProbeStep] = React.useState(null);
  var steps = skill.plainSteps || [];
  var edges = (skill.graph && skill.graph.edges) || [];
  if (steps.length === 0) {
    return <antd.Empty image={antd.Empty.PRESENTED_IMAGE_SIMPLE}
      description={<span style={{ fontSize: fz(13), color: C.textMuted }}>尚未產生流程圖</span>}
      style={{ padding: 24, background: C.bgPanel, borderRadius: 8, border: '1px solid ' + C.border, margin: 0 }} />;
  }
  var built = buildGraphLevels(steps, edges);
  /* 以最長路徑分層時每一層必定有節點，所以不做過濾 ——
     過濾會讓 level 索引與 rows 索引對不上。 */
  var rows = built.rows;
  var confirmCnt = steps.filter(function(s) { return s.needsConfirm; }).length;
  var customCnt  = steps.filter(function(s) { return s.source === 'custom'; }).length;

  return (
    <div>
      {/* 圖例：把「會碰到哪些系統」需要講的事收在這裡 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
        padding: '8px 16px', marginBottom: 16,
        border: '1px solid ' + C.border, borderRadius: 8, background: C.bgSub,
      }}>
        <span style={{ fontSize: fz(11), color: C.textMuted }}>圖例</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 3, height: 14, background: '#2563EB', borderRadius: 2 }} />
          <span style={{ fontSize: fz(11), color: C.textSub }}>標準元件（已驗證，簽核可略過）</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 3, height: 14, background: '#F59E0B', borderRadius: 2 }} />
          <span style={{ fontSize: fz(11), color: C.textSub }}>本次自訂 {customCnt} 步（簽核重點）</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: fz(11) }}>🔒</span>
          <span style={{ fontSize: fz(11), color: C.textSub }}>需人工確認 {confirmCnt} 步</span>
        </span>
      </div>

      {/* 流程圖本體 */}
      <div style={{ border: '1px solid ' + C.border, borderRadius: 8, padding: '24px 24px', background: C.bgSub }}>
        <GraphTerminal label="開始" />
        {rows.map(function(row, i) {
          return (
            <React.Fragment key={i}>
              <GraphConnector rows={rows} level={built.level} edges={edges} band={i === 0 ? 'start' : i - 1} />
              <div style={{ display: 'flex', gap: 16, alignItems: 'stretch' }}>
                {row.map(function(s) { return <GraphNode key={s.num} step={s} onProbe={function() { setProbeStep(s); }} />; })}
              </div>
            </React.Fragment>
          );
        })}
        <GraphConnector rows={rows} level={built.level} edges={edges} band="end" />
        <GraphTerminal label="結束" />
      </div>

      {confirmCnt > 0 && (
        <div style={{ marginTop: 16, fontSize: fz(12), color: '#F59E0B', fontWeight: 600, lineHeight: 1.6 }}>
          ⚠️ 這 {confirmCnt} 個標了 🔒 的步驟會異動系統，執行到就會停下來等人按確認 —— 手動執行如此，排程執行也一樣。
        </div>
      )}
      <div style={{ marginTop: 8, fontSize: fz(12), color: C.textMuted, lineHeight: 1.6 }}>
        每個節點右上的 <span style={{ color: '#2563EB', fontWeight: 600 }}>▷ 試打</span> 可以單獨打這一步，看它實際吃什麼、吐什麼 —— 不用整份跑完再回推是哪一段的介面對不上。
      </div>

      {probeStep && (
        <ProbeModal skill={skill} step={probeStep}
          onClose={function() { setProbeStep(null); }}
          onSaveScenario={onSaveScenario || function() {}} />
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   Scope 區
   ════════════════════════════════════════ */
function ScopeBlock({ skill, p, onSave }) {
  var { C, fz } = useTheme();
  var [toolsOpen, setToolsOpen] = React.useState(false);
  var targets = matchScopeTargets(p.key, skill.scope);
  var tools = skill.tools || [];
  var readCnt  = tools.filter(function(t) { return t.mode === 'read'; }).length;
  var writeCnt = tools.filter(function(t) { return t.mode === 'write'; }).length;

  return (
    <div>
      {/* 一句話用途 */}
      <div style={{ fontSize: fz(14), color: C.text, lineHeight: 1.8, marginBottom: 16 }}>{skill.purpose}</div>

      {/* 結構化條件（勾出來的，不是自由文字，所以才算得出符合幾台） */}
      <div style={{ border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden' }}>
        {describeScope(skill.scope).map(function(row, i) {
          return (
            <div key={row.label} style={{ display: 'flex', gap: 16, padding: '8px 16px', borderTop: i > 0 ? '1px solid ' + C.border : 'none' }}>
              <span style={{ fontSize: fz(12), color: C.textMuted, width: 72, flexShrink: 0 }}>{row.label}</span>
              <span style={{ fontSize: fz(13), color: C.text, lineHeight: 1.6 }}>{row.value}</span>
            </div>
          );
        })}
        <div style={{ padding: '8px 16px', borderTop: '1px solid ' + C.border, background: 'rgba(37,99,235,0.06)' }}>
          <span style={{ fontSize: fz(12), color: '#2563EB', fontWeight: 600 }}>
            目前符合 {targets.length} 台
          </span>
          {targets.length > 0 && (
            <span style={{ fontSize: fz(12), color: C.textSub, marginLeft: 8 }}>
              {targets.map(function(t) { return t.id; }).join('、')}
            </span>
          )}
        </div>
      </div>

      {/* 工具授權摘要：一行，需要細節才展開。
          Skill 的「不能寫入」要看得到，才知道邊界在哪。 */}
      <div style={{ marginTop: 8 }}>
        <div
          onClick={function() { setToolsOpen(function(v) { return !v; }); }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '4px 0' }}
        >
          <span style={{ fontSize: fz(12), color: C.textMuted }}>可用工具</span>
          <span style={{ fontSize: fz(12), color: C.textSub }}>
            {readCnt} 個唯讀
            {writeCnt > 0 ? ' · ' + writeCnt + ' 個會異動系統' : ''}
            {skill.tier === 'guided' ? ' · 🔒 本類型不可異動系統' : ''}
          </span>
          <span style={{ fontSize: fz(10), color: C.textMuted }}>{toolsOpen ? '▲' : '▼'}</span>
        </div>
        {toolsOpen && (
          <div style={{ border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden', marginTop: 4 }}>
            {tools.map(function(t, i) {
              return (
                <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderTop: i > 0 ? '1px solid ' + C.border : 'none' }}>
                  <span style={{ fontSize: fz(13), color: C.text, fontWeight: 500, width: 120, flexShrink: 0 }}>{t.label}</span>
                  <span style={{ fontSize: fz(12), color: C.textMuted, fontFamily: 'monospace', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</span>
                  <span style={{ fontSize: fz(11), color: C.textMuted, flexShrink: 0 }}>{t.system}</span>
                  <SkillIoTag io={t.mode} />
                </div>
              );
            })}
            {skill.tier === 'guided' && (
              <div style={{ padding: '8px 16px', borderTop: '1px solid ' + C.border, background: C.bgPanel, fontSize: fz(12), color: C.textMuted, lineHeight: 1.7 }}>
                🔒 「Skill」不能異動系統，寫入類工具無法加入。<br />
                需要 AI 代為執行動作，請改建一個 <span style={{ fontWeight: 600, color: C.textSub }}>Codify</span>：Codify 的每個異動步驟都會停下來等人確認。
              </div>
            )}
          </div>
        )}
      </div>

      {/* 寫入能力開關。2026-07-26 從建立流程搬到這裡 ——
          建立當下就問「要不要能異動系統」太早了，那時使用者連內容都還沒定案；
          這裡本來就是講工具授權的地方，摩擦擺在這裡才有意義。
          已送簽之後不再開放調整。 */}
      {skill.tier === 'sop' && (skill.stage === 'draft' || skill.stage === 'testing') && onSave && (
        <div style={{ marginTop: 8 }}>
          <WriteToggle
            draft={skill}
            onEnable={function(tool) {
              onSave(Object.assign({}, skill, { tools: (skill.tools || []).concat([tool]), hasWrite: true }));
            }}
            onDisable={function() {
              onSave(Object.assign({}, skill, { tools: (skill.tools || []).filter(function(t) { return t.mode !== 'write'; }), hasWrite: false }));
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   Description 區 — Skill 是 skill.md 風格文本，Codify 是流程敘述
   簽核簽的是這一段（白話說明＝契約），不是 code
   ════════════════════════════════════════ */
function DescriptionBlock({ skill, p }) {
  var { C, fz } = useTheme();
  var refs = (skill.knowledgeRefs || []).map(function(id) { return findKnowledgeDoc(p.key, id); }).filter(Boolean);

  /* 極輕量 markdown：# 標題、**粗體**、`工具名`、- 條列。不引外部套件。

     行內 `code` 是 2026-07-29 補的：指引裡會直接寫出要呼叫哪一支工具、
     帶什麼參數，那些字串必須看起來就是工具名而不是句子的一部分 ——
     Scope 區的工具表已經用 monospace 呈現 tool name，這裡沿用同一套視覺。 */
  function renderInline(line) {
    return line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map(function(seg, j) {
      if (/^\*\*[^*]+\*\*$/.test(seg)) {
        return <span key={j} style={{ fontWeight: 700, color: C.text }}>{seg.slice(2, -2)}</span>;
      }
      if (/^`[^`]+`$/.test(seg)) {
        return <span key={j} style={{ fontFamily: 'monospace', fontSize: fz(13), color: '#2563EB' }}>{seg.slice(1, -1)}</span>;
      }
      return <React.Fragment key={j}>{seg}</React.Fragment>;
    });
  }

  function renderLine(line, i) {
    if (/^#{1,3}\s/.test(line)) {
      var lv = line.match(/^#+/)[0].length;
      return (
        <div key={i} style={{
          fontSize: fz(lv === 1 ? 15 : 14), fontWeight: 700, color: C.text,
          marginTop: i === 0 ? 0 : 24, marginBottom: 8,
        }}>{line.replace(/^#+\s/, '')}</div>
      );
    }
    if (line.trim() === '') return <div key={i} style={{ height: 8 }} />;
    /* 條列縮排：巢狀那層是分支條件（「壓差 > 0.05 → 判阻塞」），
       跟它上面那一步不同層，平排會看不出從屬關係 */
    var indent = /^ {2,}[-·]\s/.test(line) ? 32 : /^[-·]\s/.test(line) ? 16 : 0;
    return (
      <div key={i} style={{
        fontSize: fz(14), color: C.textSub, lineHeight: 1.9, marginBottom: 4,
        paddingLeft: indent,
      }}>{renderInline(line.trim())}</div>
    );
  }

  return (
    <div>
      {/* 剛建立、還沒被 AI 整理過 —— 講明白這是使用者自己填的原文，
          不然使用者會以為系統認可了這個格式 */}
      {skill.intakeInput && !skill.intakeDone && (
        <div style={{ marginBottom: 8, fontSize: fz(12), color: C.textMuted, lineHeight: 1.7 }}>
          這是你建立時填的原始內容，還不是正式格式。右側的 AI 可以幫你整理。
        </div>
      )}
      <div style={{ border: '1px solid ' + C.border, borderRadius: 8, padding: '24px 24px', background: C.bg }}>
        {(skill.description || '').split('\n').map(renderLine)}
      </div>

      {/* 引用的知識 —— 知識是底料，不是平行路線，證據在這裡 */}
      {refs.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: fz(12), color: C.textMuted }}>引用知識</span>
          {refs.map(function(d) {
            return (
              <antd.Tooltip key={d.id} title={d.summary}>
                <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), background: C.bgPanel, color: C.textSub, cursor: 'default' }}>
                  📄 {d.title}
                </antd.Tag>
              </antd.Tooltip>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   驗收 & Dry-run 區

   2026-07-26 PO 定案：原本 PASS 是資料裡寫死的，看不出誰跑的、什麼時候跑的，
   而送簽的硬條件卻建立在一個從未發生過的動作上。所以補回「真的要按一次」的動作。

   2026-07-27：這一區分成兩層不同的東西，別再混為一談 ——
     · 驗收＝**意圖層**（使用者這樣問 → AI 該怎麼回）。驗路由、拒絕、適用範圍。
     · 情境試跑＝**資料層**（資料長這樣 → 每個節點該怎麼反應）。見 ScenarioBlock。
   Codify 的風險不在「AI 答錯」，在節點吃到爛資料照樣算完、輸出一份看起來正常的東西。

   2026-07-29：意圖層那邊從「測試案例」改成「驗收」。除了跟 codify graph 的 test
   混淆之外，更根本的問題是 Skill 每次結果都不一樣 —— 跑一次得到 PASS
   在邏輯上就不成立。改成同一個提問跑 5 次，由人看內容確認條件是否成立。
   ════════════════════════════════════════ */
/* 新增驗收條件 / 提問情境：明確的表單任務，不是對話，所以用 Modal 是對的。 */
function AddAcceptanceModal({ skill, kind, onCancel, onAdd }) {
  var { C, fz } = useTheme();
  var isCrit = kind === 'criterion';
  var [text, setText]      = React.useState('');
  var [drafting, setDraft] = React.useState(false);

  /* 人會寫「該做什麼」，不會想到寫「不該做什麼」—— 這顆就是補那一塊 */
  function askAi() {
    setDraft(true);
    setTimeout(function() {
      var pool = isCrit
        ? ['數據互相矛盾時，應明說矛盾在哪，不可挑一個順眼的下結論',
           '資料不足以判斷時，應回「資料不足」並說明還缺什麼，不得硬給研判']
        : ['查到的兩項數據互相矛盾，這樣要怎麼判？',
           '只有一項數據，其他都查不到，還能判嗎？'];
      var n = (isCrit ? acceptCrits(skill) : acceptProbes(skill)).length;
      setText(pool[n % pool.length]);
      setDraft(false);
    }, 900);
  }

  return (
    <antd.Modal
      open centered width={560}
      title={<span style={{ fontSize: fz(16), fontWeight: 600 }}>{isCrit ? '新增驗收條件' : '新增提問情境'}</span>}
      onCancel={onCancel}
      okText="加入" cancelText="取消"
      okButtonProps={{ disabled: !text.trim() }}
      onOk={function() { onAdd(text.trim()); }}
    >
      <div style={{ fontSize: fz(12), color: C.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
        {isCrit
          ? '驗收條件是整份共用的：每個提問情境的每一次回答都要成立。加進來之後要重新執行一次驗收，才會有可以對照的紀錄。'
          : '每個提問情境會跑 ' + ACCEPT_RUNS + ' 次 —— 同一個問法問 ' + ACCEPT_RUNS + ' 次，看它穩不穩。加進來之後要重新執行一次驗收。'}
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub, marginBottom: 8 }}>
          {isCrit ? '每次回答都要成立的條件' : '使用者會怎麼問'}
        </div>
        <antd.Input.TextArea value={text} onChange={function(e) { setText(e.target.value); }} autoSize={{ minRows: 2, maxRows: 4 }} />
      </div>

      <antd.Button size="small" loading={drafting} onClick={askAi}
        style={{ color: '#7C3AED', borderColor: 'rgba(124,58,237,0.4)' }}>
        ✦ 讓 AI 依這份內容幫我想一{isCrit ? '條' : '個'}
      </antd.Button>
    </antd.Modal>
  );
}


/* 正常資料那條情境展開後的內容 —— 原本的三層試跑結果原樣搬過來。
   這三層是簽核的核心（送簽硬條件綁在第 2 層），不動它。 */
function DryRunDetail({ skill, onOpenCalc }) {
  var { C, fz } = useTheme();
  var dr = skill.dryRun;
  if (!dr) return null;
  var items = [
    {
      key: 'output',
      label: <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>1 · 產出長什麼樣</span>,
      children: <DryRunOutput output={dr.output} />,
    },
    {
      key: 'calc',
      label: <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>2 · 每個數字怎麼算的</span>,
      children: (
        <antd.List size="small" dataSource={dr.calculations || []}
          renderItem={function(c) {
            return (
              <antd.List.Item style={{ alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>{c.label}</span>
                    <antd.Tag bordered={false} style={{
                      marginInlineEnd: 0, borderRadius: 999, fontSize: fz(10), fontWeight: 600,
                      color: c.custom ? '#F59E0B' : '#2563EB',
                      background: c.custom ? 'rgba(245,158,11,0.08)' : 'rgba(37,99,235,0.08)',
                    }}>步驟 {c.stepNum}{c.custom ? ' · 自訂' : ' · 標準'}</antd.Tag>
                  </div>
                  <div style={{ fontSize: fz(12), color: C.textSub, lineHeight: 1.7 }}>算法：{c.how}</div>
                  <div style={{ fontSize: fz(12), color: C.textMuted, lineHeight: 1.7 }}>資料：{c.from}</div>
                </div>
              </antd.List.Item>
            );
          }}
        />
      ),
    },
    {
      key: 'src',
      label: <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>3 · 資料是從哪裡取的</span>,
      children: (
        <antd.List size="small" dataSource={dr.sources || []}
          renderItem={function(s) {
            return (
              <antd.List.Item style={{ gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: fz(13), color: C.text, fontWeight: 500 }}>{s.system}</div>
                  <div style={{ fontSize: fz(12), color: C.textMuted, fontFamily: 'monospace' }}>{s.tool}</div>
                  <div style={{ fontSize: fz(12), color: C.textMuted, marginTop: 4 }}>{s.note}</div>
                </div>
                <antd.Space size={8}>
                  <SkillIoTag io="read" />
                  <span style={{ fontSize: fz(12), color: C.textSub }}>取 {s.rows} 筆</span>
                </antd.Space>
              </antd.List.Item>
            );
          }}
        />
      ),
    },
  ];
  return (
    <div>
      <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 8 }}>試跑時間：{dr.ranAt}</div>
      {dr.diffNote && (
        <antd.Alert type="info" showIcon style={{ marginBottom: 16 }}
          message={<span style={{ fontSize: fz(12), fontWeight: 600 }}>與{dr.comparedWith}比對</span>}
          description={<span style={{ fontSize: fz(12), lineHeight: 1.6 }}>{dr.diffNote}</span>}
        />
      )}
      <antd.Collapse
        defaultActiveKey={['output']} items={items} size="small"
        onChange={function(keys) { if (keys.indexOf('calc') !== -1 && onOpenCalc) onOpenCalc(); }}
      />
    </div>
  );
}

/* ════════════════════════════════════════
   情境試跑（2026-07-27 PO 指定）

   PO：「sop 走 codify graph，每個節點都是一段程式碼，就有可能接口 in/out 處理
   不正確、極值沒考慮清楚、schema 不正確 —— 目前看不出有這些測試案例，
   也看不出發生時系統如何響應。」

   原本的試跑只有一條路：正常資料跑一次、看產出。這裡把它改成**一組情境**。
   壞資料情境由系統依這份的工具與節點自動出（跟測試案例的 🔒 系統出題
   同一個道理，只是從語意層下到資料層），不可刪。

   **通過的定義是「行為符合約定」，不是「有輸出」。**
   有些情境的正確結果就是拒絕產出 —— 若沿用「全綠才能送簽」，
   會逼人把約定寫成「照跑」，那就本末倒置了。
   ════════════════════════════════════════ */
function buildDataScenarios(skill) {
  if (skill.tier !== 'sop') return [];
  var steps = skill.plainSteps || [];
  if (steps.length === 0) return [];
  var reads    = steps.filter(function(s) { return s.io === 'read'; });
  var computes = steps.filter(function(s) { return s.io === 'compute'; });
  var writes   = steps.filter(function(s) { return s.io === 'write'; });
  var list = [];

  if (skill.dryRun) {
    list.push({
      id: 'sc-normal', kind: 'normal', origin: 'real', label: '正常資料',
      inject: null,
      expect: '應完整產出，且每個數字都追得到來源',
    });
  }
  if (reads[0]) {
    list.push({
      id: 'sc-empty', kind: 'empty', origin: 'system', label: '來源回空集合',
      inject: { stepNum: reads[0].num, tool: reads[0].tool, how: '「' + reads[0].label + '」回傳 0 筆' },
      expect: '應停止產出並標示「來源無資料」，不可把「查無資料」當成「真的 0 筆」照常輸出',
    });
    list.push({
      id: 'sc-schema', kind: 'schema', origin: 'system', label: '來源 schema 變更',
      inject: { stepNum: reads[0].num, tool: reads[0].tool, how: '回傳欄位改名或型別不符（上游 API 改版）' },
      expect: '應在該節點停下並指出是哪個欄位對不上，不可略過該欄位繼續算',
    });
  }
  if (computes[0]) {
    list.push({
      id: 'sc-extreme', kind: 'extreme', origin: 'system', label: '極值與空值',
      inject: { stepNum: computes[0].num, tool: null, how: '上游資料含 null 日期、數量 0 與異常大值' },
      expect: '應明確標示異常值，不可讓 null 參與排序或計算後靜靜輸出',
    });
  }
  if (writes[0]) {
    list.push({
      id: 'sc-rerun', kind: 'rerun', origin: 'system', label: '同一天重複執行',
      inject: { stepNum: writes[0].num, tool: writes[0].tool, how: '同一天第二次執行到寫入節點' },
      expect: '應提示今天已經執行過並顯示上次結果，不可重複寫入',
    });
  }
  return list.concat(skill.userScenarios || []);
}

/* 節點軌跡：資料裡沒寫失敗就是「符合約定」——
   壞資料情境符合約定的長相是**停在注入的那一步並回報**，不是一路跑完。 */
function buildScenarioTrace(skill, sc, fail) {
  var steps = skill.plainSteps || [];
  if (fail && fail.trace) {
    return fail.trace.map(function(t) {
      var ps = steps.filter(function(s) { return s.num === t.num; })[0];
      return { num: t.num, label: ps ? ps.label : '步驟 ' + t.num, status: t.status, note: t.note };
    });
  }
  if (!sc.inject) {
    return steps.map(function(s) { return { num: s.num, label: s.label, status: 'ok', note: null }; });
  }
  var stopAt = sc.inject.stepNum;
  return steps.map(function(s) {
    if (s.num < stopAt) return { num: s.num, label: s.label, status: 'ok', note: null };
    if (s.num === stopAt) return { num: s.num, label: s.label, status: 'stop', note: '依約定中止並回報，不往下算' };
    return { num: s.num, label: s.label, status: 'skip', note: '未執行' };
  });
}

const SCENARIO_TRACE_CFG = {
  ok:   { icon: '✓', color: '#22C55E' },
  stop: { icon: '⏹', color: '#2563EB' },
  fail: { icon: '✗', color: '#EF4444' },
  skip: { icon: '—', color: '#9E9E9E' },
};

function ScenarioBlock({ skill, p, onSave, onOpenCalc }) {
  var { C, fz } = useTheme();
  var scenarios = buildDataScenarios(skill);
  var fails = skill.scenarioFails || {};
  var run   = skill.scenarioRun || null;

  var [live, setLive]     = React.useState(null);
  var [busy, setBusy]     = React.useState(false);
  var [open, setOpen]     = React.useState({});

  if (scenarios.length === 0) return null;

  function statusOf(sc) {
    if (live && live[sc.id]) return live[sc.id];
    if (run && run.results && run.results[sc.id]) return run.results[sc.id];
    /* 正常資料那條原本就跑過了（dryRun.ranAt）；壞資料情境從來沒跑過 */
    if (sc.kind === 'normal' && skill.dryRun) return 'pass';
    return 'pending';
  }

  var pendCnt = scenarios.filter(function(s) { return statusOf(s) === 'pending'; }).length;
  var failCnt = scenarios.filter(function(s) { return statusOf(s) === 'fail'; }).length;

  /* 逐題播放：瞬間跑完的話，「正在測」這個狀態根本不存在 */
  function runAll() {
    if (busy) return;
    setBusy(true); setLive({});
    var acc = {};
    scenarios.forEach(function(sc, i) {
      setTimeout(function() {
        setLive(function(prev) { var n = Object.assign({}, prev); n[sc.id] = 'running'; return n; });
      }, i * 620);
      setTimeout(function() {
        acc[sc.id] = fails[sc.id] ? 'fail' : 'pass';
        setLive(function(prev) { var n = Object.assign({}, prev); n[sc.id] = acc[sc.id]; return n; });
      }, i * 620 + 460);
    });
    setTimeout(function() {
      setBusy(false); setLive(null);
      onSave(Object.assign({}, skill, { scenarioRun: { at: '剛剛', by: p.user.name, results: acc } }));
      /* 沒過的那幾題自己展開 —— 要人再點一次才看得到失敗，等於沒給 */
      var o = {};
      scenarios.forEach(function(sc) { if (acc[sc.id] === 'fail') o[sc.id] = true; });
      setOpen(o);
    }, scenarios.length * 620 + 560);
  }

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>情境試跑</span>
        {pendCnt > 0
          ? <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), fontWeight: 600, color: '#F97316', background: 'rgba(249,115,22,0.08)' }}>
              {pendCnt} 個情境沒跑過（共 {scenarios.length} 個）
            </antd.Tag>
          : <antd.Tag bordered={false} style={{
              marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), fontWeight: 600,
              color: failCnt > 0 ? '#EF4444' : '#22C55E',
              background: failCnt > 0 ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
            }}>{failCnt > 0 ? failCnt + ' 個不符合約定' : scenarios.length + ' 個全部符合約定'}</antd.Tag>
        }
        <div style={{ flex: 1 }} />
        <antd.Button size="small" type="primary" loading={busy} onClick={runAll}>
          {busy ? '執行中…' : (run ? '重新試跑' : '執行情境試跑')}
        </antd.Button>
      </div>

      <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 8, lineHeight: 1.7 }}>
        輸出看起來對，不代表來源對。標了 🔒 的壞資料情境是系統依這份的工具與節點自動出的，不可刪 ——
        危險的不是跑爆（跑爆看得見），是節點吃到爛資料照樣算完、輸出一份長得很正常的東西。
      </div>
      <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 16, lineHeight: 1.7 }}>
        <span style={{ fontWeight: 600, color: C.textSub }}>通過的定義是「行為符合約定」，不是「有輸出」。</span>
        有些情境的正確結果就是拒絕產出。
        {run ? '　上次試跑：' + run.at + ' · ' + run.by : ''}
      </div>

      <antd.List
        bordered size="small" dataSource={scenarios}
        renderItem={function(sc) {
          var st  = statusOf(sc);
          var cfg = st === 'pass'    ? { label: 'PASS',  color: '#22C55E', bg: 'rgba(34,197,94,0.08)' }
                  : st === 'fail'    ? { label: 'FAIL',  color: '#EF4444', bg: 'rgba(239,68,68,0.08)' }
                  : st === 'running' ? { label: '執行中', color: '#2563EB', bg: 'rgba(37,99,235,0.08)' }
                  :                    { label: '待執行', color: '#6B7280', bg: 'rgba(107,114,128,0.08)' };
          var fail    = fails[sc.id];
          var isOpen  = !!open[sc.id];
          var trace   = buildScenarioTrace(skill, sc, st === 'fail' ? fail : null);
          var isNormal = sc.kind === 'normal';

          return (
            <antd.List.Item style={{ alignItems: 'flex-start', gap: 8, background: st === 'fail' ? 'rgba(239,68,68,0.04)' : 'transparent' }}>
              <antd.Tag bordered={false} style={{
                marginInlineEnd: 0, borderRadius: 999, flexShrink: 0, width: 56, textAlign: 'center',
                fontSize: fz(11), fontWeight: 700, color: cfg.color, background: cfg.bg,
              }}>{cfg.label}</antd.Tag>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: fz(14), color: C.text, fontWeight: 500, marginBottom: 4 }}>{sc.label}</div>
                {sc.inject && (
                  <div style={{ fontSize: fz(12), color: C.textMuted, lineHeight: 1.6 }}>
                    注入：步驟 {sc.inject.stepNum} · {sc.inject.how}
                  </div>
                )}
                <div style={{ fontSize: fz(12), color: C.textSub, lineHeight: 1.6 }}>約定：{sc.expect}</div>

                {st !== 'pending' && st !== 'running' && (
                  <div style={{ marginTop: 4 }}>
                    <span
                      onClick={function() { setOpen(function(prev) { var n = Object.assign({}, prev); n[sc.id] = !prev[sc.id]; return n; }); }}
                      style={{ fontSize: fz(12), color: st === 'fail' ? '#EF4444' : '#2563EB', fontWeight: 600, cursor: 'pointer' }}
                    >
                      {isOpen ? '收合 ⌃' : (isNormal ? '看這次跑出什麼 ⌄' : '看每個節點怎麼反應 ⌄')}
                    </span>
                  </div>
                )}

                {isOpen && isNormal && (
                  <div style={{ marginTop: 8 }}>
                    <DryRunDetail skill={skill} onOpenCalc={onOpenCalc} />
                  </div>
                )}

                {isOpen && !isNormal && (
                  <div style={{ marginTop: 8, border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden' }}>
                    {trace.map(function(t, i) {
                      var tc = SCENARIO_TRACE_CFG[t.status] || SCENARIO_TRACE_CFG.ok;
                      return (
                        <div key={t.num} style={{
                          padding: '8px 16px', borderTop: i > 0 ? '1px solid ' + C.border : 'none',
                          display: 'flex', alignItems: 'baseline', gap: 8,
                        }}>
                          <span style={{ fontSize: fz(12), fontWeight: 700, color: tc.color, width: 12, flexShrink: 0 }}>{tc.icon}</span>
                          <span style={{ fontSize: fz(12), color: C.textMuted, flexShrink: 0 }}>步驟 {t.num}</span>
                          <span style={{ fontSize: fz(12), color: t.status === 'fail' ? '#EF4444' : C.textSub, fontWeight: 500 }}>{t.label}</span>
                          {t.note && <span style={{ fontSize: fz(12), color: t.status === 'fail' ? '#EF4444' : C.textMuted, flex: 1, minWidth: 0 }}>· {t.note}</span>}
                        </div>
                      );
                    })}
                    {st === 'fail' && fail && (
                      <React.Fragment>
                        <div style={{ padding: '8px 16px', borderTop: '1px solid ' + C.border, fontSize: fz(12), color: C.textSub, lineHeight: 1.7 }}>
                          <span style={{ color: C.textMuted, marginRight: 8 }}>實際</span>{fail.actual}
                        </div>
                        <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(239,68,68,0.2)', fontSize: fz(12), color: '#EF4444', lineHeight: 1.7 }}>
                          <span style={{ marginRight: 8 }}>該修</span>{fail.fix}
                        </div>
                      </React.Fragment>
                    )}
                  </div>
                )}
              </div>

              {sc.origin === 'system'
                ? <antd.Tooltip title="系統依這份的工具與節點自動出題，不可刪除">
                    <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, flexShrink: 0, fontSize: fz(11), color: C.textMuted, background: C.bgPanel }}>🔒 系統出題</antd.Tag>
                  </antd.Tooltip>
                : <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, flexShrink: 0, fontSize: fz(11), color: C.textMuted, background: C.bgPanel }}>
                    {sc.origin === 'real' ? '真實資料' : '課內出題'}
                  </antd.Tag>
              }
            </antd.List.Item>
          );
        }}
      />
    </div>
  );
}

function TestBlock({ skill, p, onSave, onOpenCalc }) {
  /* Codify 沒有「意圖」可測 —— 圖裡沒有的工具它根本呼叫不到，
     範圍是勾出來的結構化條件。它只有情境試跑。 */
  if (skill.tier === 'sop') {
    return <ScenarioBlock skill={skill} p={p} onSave={onSave} onOpenCalc={onOpenCalc} />;
  }
  return <AcceptanceBlock skill={skill} p={p} onSave={onSave} />;
}

/* ════════════════════════════════════════
   驗收 —— 只有 Skill 有（2026-07-29 取代「測試案例」）

   一條條件的分母不是「跑幾次」，是「這條驗得到的那幾次」。
   前提不成立的次數畫成灰點，不進分子也不進分母。
   ════════════════════════════════════════ */

function AcceptanceBlock({ skill, p, onSave }) {
  var { C, fz } = useTheme();
  var crits  = acceptCrits(skill);
  var probes = acceptProbes(skill);
  var checks = skill.acceptChecks || {};

  var [running, setRunning]     = React.useState(false);
  var [doneCnt, setDoneCnt]     = React.useState(0);
  var [addKind, setAddKind]     = React.useState(null);
  var [openProbe, setOpenProbe] = React.useState({});
  var [openRun, setOpenRun]     = React.useState({});

  var totalRuns = probes.length * ACCEPT_RUNS;
  var stale     = acceptStale(skill);
  var unrun     = acceptUnrunCrits(skill);
  var hasRuns   = !!skill.acceptRun && !stale && !running;
  var confirmed = crits.filter(function(c) { return !!checks[c.id]; }).length;

  /* 逐次播放。瞬間跑完的話，「正在跑」這個狀態根本不存在（guideline §6），
     而這裡「跑很多次」正是要讓人看見的東西。 */
  function runAcceptance() {
    if (running || totalRuns === 0 || crits.length === 0) return;
    setRunning(true);
    setDoneCnt(0);
    for (var i = 1; i <= totalRuns; i++) {
      (function(n) { setTimeout(function() { setDoneCnt(n); }, n * 170); })(i);
    }
    setTimeout(function() {
      setRunning(false);
      setDoneCnt(0);
      /* 重跑就把先前的確認全部清掉 —— 紀錄換了，上次的判斷就不算數 */
      onSave(Object.assign({}, skill, {
        acceptRun: {
          at: '剛剛', by: p.user.name,
          descRev: skill.descRev || 0,
          critIds: crits.map(function(c) { return c.id; }),
        },
        acceptChecks: {},
      }));
    }, totalRuns * 170 + 400);
  }

  function setCheck(crit, on) {
    var next = Object.assign({}, checks);
    if (on) next[crit.id] = { by: p.user.name, at: '剛剛' };
    else delete next[crit.id];
    onSave(Object.assign({}, skill, { acceptChecks: next }));
  }

  function addCriterion(text) {
    setAddKind(null);
    onSave(Object.assign({}, skill, {
      acceptance: Object.assign({}, skill.acceptance, {
        criteria: crits.concat([{ id: 'ac-' + Date.now(), text: text, origin: 'seed', locked: false }]),
      }),
    }));
  }

  function addProbe(input) {
    setAddKind(null);
    onSave(Object.assign({}, skill, {
      acceptance: Object.assign({}, skill.acceptance, {
        probes: probes.concat([{ id: 'pb-' + Date.now(), input: input, kind: 'inscope', origin: 'seed', locked: false }]),
      }),
    }));
  }

  function removeItem(kind, id) {
    var acc = skill.acceptance || {};
    var next = kind === 'criterion'
      ? Object.assign({}, acc, { criteria: crits.filter(function(c) { return c.id !== id; }) })
      : Object.assign({}, acc, { probes: probes.filter(function(pb) { return pb.id !== id; }) });
    onSave(Object.assign({}, skill, { acceptance: next }));
  }

  function toggle(setter, id) {
    setter(function(prev) { var n = Object.assign({}, prev); n[id] = !prev[id]; return n; });
  }

  return (
    <div>
      {/* 工具列 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>驗收條件</span>
        <antd.Tag bordered={false} style={{
          marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), fontWeight: 600,
          color: (hasRuns && confirmed === crits.length && crits.length > 0) ? '#22C55E' : '#F97316',
          background: (hasRuns && confirmed === crits.length && crits.length > 0) ? 'rgba(34,197,94,0.08)' : 'rgba(249,115,22,0.08)',
        }}>
          {!skill.acceptRun ? '尚未執行'
            : stale ? '紀錄已作廢'
            : unrun.length > 0 ? unrun.length + ' 條沒跑過'
            : '已確認 ' + confirmed + ' / ' + crits.length}
        </antd.Tag>
        <div style={{ flex: 1 }} />
        <antd.Button size="small" type="dashed" disabled={running} onClick={function() { setAddKind('criterion'); }}>＋ 驗收條件</antd.Button>
        <antd.Button size="small" type="dashed" disabled={running} onClick={function() { setAddKind('probe'); }}>＋ 提問情境</antd.Button>
        <antd.Button size="small" type="primary" loading={running} disabled={crits.length === 0 || probes.length === 0} onClick={runAcceptance}>
          {running ? '執行中 ' + doneCnt + ' / ' + totalRuns : (skill.acceptRun ? '重新執行驗收' : '執行驗收')}
        </antd.Button>
      </div>

      <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 8, lineHeight: 1.6 }}>
        每個提問情境跑 {ACCEPT_RUNS} 次 —— 同一個問法問 {ACCEPT_RUNS} 次，看它穩不穩。
        <br />
        <span style={{ color: C.textSub, fontWeight: 600 }}>系統與 AI 都不會替你判斷這些條件有沒有做到。</span>
        下面「每次執行的紀錄」是它實際做了什麼、最後回了什麼，看完再由你決定要不要勾。
        標了 🔒 的條件與情境是系統依適用範圍與類型自動補的，不可刪除。
      </div>

      <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 16 }}>
        {running ? '執行中，一次一次跑。'
          : stale ? null
          : skill.acceptRun ? '上次執行：' + skill.acceptRun.at + ' · ' + skill.acceptRun.by
          : '尚未執行過，下面不會有紀錄。'}
      </div>

      {stale && (
        <div style={{ marginBottom: 16 }}>
          <antd.Alert type="warning" showIcon
            message={<span style={{ fontSize: fz(13), fontWeight: 600 }}>指引改過了，先前的紀錄已作廢</span>}
            description={<span style={{ fontSize: fz(12), lineHeight: 1.7 }}>
              Description 是這份的契約，改了之後 AI 的行為就跟你上次看的不是同一件事。
              先前的確認已全部收回，請重新執行一次驗收。
            </span>} />
        </div>
      )}

      {!stale && unrun.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <antd.Alert type="warning" showIcon
            message={<span style={{ fontSize: fz(13), fontWeight: 600 }}>有 {unrun.length} 條驗收條件是上次執行之後才加的</span>}
            description={<span style={{ fontSize: fz(12), lineHeight: 1.7 }}>沒跑過就沒有紀錄可以看，請重新執行一次驗收。</span>} />
        </div>
      )}

      {/* ── 驗收條件：只有文字與勾選，沒有分數 ── */}
      <div style={{ border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden' }}>
        {crits.length === 0 && (
          <div style={{ padding: 16, fontSize: fz(13), color: C.textMuted }}>尚無驗收條件</div>
        )}
        {crits.map(function(c, i) {
          var chk   = checks[c.id];
          var isNew = unrun.some(function(u) { return u.id === c.id; });
          return (
            <div key={c.id} style={{
              padding: '8px 16px', borderTop: i > 0 ? '1px solid ' + C.border : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ paddingTop: 2, flexShrink: 0 }}>
                  <antd.Checkbox
                    checked={!!chk}
                    disabled={running || !hasRuns || isNew}
                    onChange={function(e) { setCheck(c, e.target.checked); }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: fz(14), color: C.text, fontWeight: 500, lineHeight: 1.6 }}>{c.text}</div>
                  {chk && (
                    <div style={{ fontSize: fz(12), color: '#22C55E', marginTop: 4, lineHeight: 1.6 }}>
                      ✓ 已確認 · {chk.by} · {chk.at}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, paddingTop: 2 }}>
                  {c.origin === 'system'
                    ? <antd.Tooltip title="系統依適用範圍與類型自動補的，不可刪除">
                        <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), color: C.textMuted, background: C.bgPanel }}>🔒 系統</antd.Tag>
                      </antd.Tooltip>
                    : <antd.Popconfirm title="刪除這條驗收條件？" okText="刪除" okButtonProps={{ danger: true }} cancelText="取消"
                        onConfirm={function() { removeItem('criterion', c.id); }}>
                        <antd.Button size="small" type="text" disabled={running} style={{ color: C.textMuted }}>✕</antd.Button>
                      </antd.Popconfirm>
                  }
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 每次執行的紀錄：這一區才是主體 ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 32, marginBottom: 8 }}>
        <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>每次執行的紀錄</span>
        <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), color: C.textMuted, background: C.bgPanel }}>
          {probes.length} 個情境 × {ACCEPT_RUNS} 次 = {totalRuns} 次
        </antd.Tag>
      </div>
      <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 8, lineHeight: 1.6 }}>
        收起來那一行是它這一次呼叫過的工具，按發生順序排 —— 不是摘要也不是評語。
        展開看它每一步拿到什麼、最後回了什麼。
      </div>

      <div style={{ border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden' }}>
        {probes.length === 0 && (
          <div style={{ padding: 16, fontSize: fz(13), color: C.textMuted }}>尚無提問情境</div>
        )}
        {probes.map(function(pb, i) {
          var open   = !!openProbe[pb.id];
          var myRuns = buildProbeRuns(skill, pb);
          return (
            <div key={pb.id} style={{ borderTop: i > 0 ? '1px solid ' + C.border : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
                <span
                  onClick={function() { if (hasRuns) toggle(setOpenProbe, pb.id); }}
                  style={{ flex: 1, minWidth: 0, cursor: hasRuns ? 'pointer' : 'default' }}>
                  <span style={{ fontSize: fz(10), color: C.textMuted, marginRight: 8 }}>{hasRuns ? (open ? '▲' : '▼') : '　'}</span>
                  <span style={{ fontSize: fz(14), color: C.text, fontWeight: 500 }}>「{pb.input}」</span>
                </span>
                {pb.origin === 'system'
                  ? <antd.Tooltip title="系統依適用範圍與類型自動出的，不可刪除">
                      <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, flexShrink: 0, fontSize: fz(11), color: C.textMuted, background: C.bgPanel }}>🔒 系統出題</antd.Tag>
                    </antd.Tooltip>
                  : <antd.Space size={8} style={{ flexShrink: 0 }}>
                      <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), color: C.textMuted, background: C.bgPanel }}>課內出題</antd.Tag>
                      <antd.Popconfirm title="刪除這個提問情境？" okText="刪除" okButtonProps={{ danger: true }} cancelText="取消"
                        onConfirm={function() { removeItem('probe', pb.id); }}>
                        <antd.Button size="small" type="text" disabled={running} style={{ color: C.textMuted }}>✕</antd.Button>
                      </antd.Popconfirm>
                    </antd.Space>
                }
              </div>

              {open && hasRuns && (
                <div style={{ background: C.bgPanel, borderTop: '1px solid ' + C.border }}>
                  {myRuns.map(function(r, k) {
                    var ro = !!openRun[r.id];
                    return (
                      <div key={r.id} style={{ borderTop: k > 0 ? '1px solid ' + C.border : 'none' }}>
                        <div
                          onClick={function() { toggle(setOpenRun, r.id); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', cursor: 'pointer' }}>
                          <span style={{ fontSize: fz(10), color: C.textMuted, width: 12, flexShrink: 0 }}>{ro ? '▲' : '▼'}</span>
                          <span style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub, width: 56, flexShrink: 0 }}>第 {r.idx} 次</span>
                          <span style={{ fontSize: fz(12), color: C.textMuted, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {runOutline(r)}
                          </span>
                        </div>

                        {ro && (
                          <div style={{ padding: '0 16px 16px 32px' }}>
                            <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textMuted, marginBottom: 8 }}>做了什麼</div>
                            <div style={{ border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden', background: C.bg }}>
                              {r.steps.map(function(s, si) {
                                var denied = s.kind === 'tool' && !s.allowed;
                                return (
                                  <div key={si} style={{
                                    padding: '8px 16px', borderTop: si > 0 ? '1px solid ' + C.border : 'none',
                                    background: denied ? 'rgba(239,68,68,0.04)' : 'transparent',
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                      <span style={{ fontSize: fz(12), fontWeight: 700, width: 12, flexShrink: 0,
                                        color: s.kind === 'match' ? '#2563EB' : (s.allowed ? '#22C55E' : '#EF4444') }}>
                                        {s.kind === 'match' ? '◆' : (s.allowed ? '✓' : '✗')}
                                      </span>
                                      <span style={{ fontSize: fz(13), color: C.text, fontWeight: 500 }}>
                                        {s.kind === 'match' ? '比對適用範圍' : s.label}
                                      </span>
                                      {s.tool && <span style={{ fontSize: fz(11), color: C.textMuted, fontFamily: 'monospace' }}>
                                        {s.tool}{s.params ? '(' + s.params + ')' : ''}
                                      </span>}
                                      {s.kind === 'tool' && <SkillIoTag io={s.allowed ? 'read' : 'write'} />}
                                      {denied && (
                                        <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(10), fontWeight: 700, color: '#EF4444', background: 'rgba(239,68,68,0.08)' }}>已拒絕</antd.Tag>
                                      )}
                                    </div>
                                    <div style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.7, paddingLeft: 20, marginTop: 4 }}>{s.text || s.result}</div>
                                    {s.reason && (
                                      <div style={{ fontSize: fz(12), color: '#EF4444', lineHeight: 1.7, paddingLeft: 20, marginTop: 4 }}>原因：{s.reason}</div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textMuted, margin: '16px 0 8px' }}>最終回答</div>
                            <div style={{ border: '1px solid ' + C.border, borderRadius: 8, background: C.bg, padding: 16 }}>
                              <AiText text={r.answer} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {addKind && (
        <AddAcceptanceModal skill={skill} kind={addKind}
          onCancel={function() { setAddKind(null); }}
          onAdd={addKind === 'criterion' ? addCriterion : addProbe} />
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   管理狀態（簽核 / 生效資訊）
   ════════════════════════════════════════ */
function StatusBlock({ skill, p, mount, onScheduleSkill }) {
  var { C, fz } = useTheme();

  if (skill.stage === 'approving') {
    var approvers = skill.approvers || [];
    var approvedCnt = approvers.filter(function(a) { return a.approved; }).length;
    return (
      <SdSection title="簽核狀態" badge={'已通過 ' + approvedCnt + ' / ' + approvers.length}>
        <antd.List bordered size="small" dataSource={approvers}
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
      </SdSection>
    );
  }

  if (skill.stage === 'pirun' && (skill.pirunRuns || []).length > 0) {
    return (
      <SdSection title="Pilot Run 紀錄"
        badge={skill.pirunRuns.length + ' 次'}
        desc="含寫入的 Codify 才走 Pilot Run。這裡驗的不是流程跑不跑得動，是「那張確認卡上的資訊，夠不夠人做判斷」。">
        <antd.List bordered size="small" dataSource={skill.pirunRuns}
          renderItem={function(r) {
            return (
              <antd.List.Item style={{ gap: 8 }}>
                <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, flexShrink: 0, fontSize: fz(11), fontWeight: 700, color: '#22C55E', background: 'rgba(34,197,94,0.08)' }}>OK</antd.Tag>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: fz(13), color: C.text }}>{r.note}</div>
                  <div style={{ fontSize: fz(12), color: C.textMuted }}>{r.date} · {r.user}</div>
                </div>
              </antd.List.Item>
            );
          }}
        />
      </SdSection>
    );
  }

  if (skill.stage === 'production') {
    var targets = matchScopeTargets(p.key, skill.scope);
    var items = [
      { key: 'scope', label: '生效範圍', children: targets.length > 0 ? (targets.length + ' 台：' + targets.map(function(t) { return t.id; }).join('、')) : '無符合的機台' },
    ];
    if (skill.productionDate) items.push({ key: 'date', label: '生效日期', children: skill.productionDate });
    if (skill.approvedBy)     items.push({ key: 'by',   label: '核准人',   children: skill.approvedBy });
    /* 排程狀態以排程清單為準（mount），不看 skill.consumedBy —— 只留一個真相來源 */
    var isCodify = skill.tier === 'sop';
    if (mount) {
      items.push({ key: 'sch', label: '已掛排程', children: mount.scheduleName + '（' + mount.cronLabel + '）' });
    } else if (isCodify) {
      items.push({ key: 'sch', label: '已掛排程', children: <span style={{ color: C.textMuted }}>尚未設定</span> });
    }
    return (
      <SdSection
        title="生效資訊"
        extra={isCodify && !mount && onScheduleSkill
          ? <antd.Button size="small" type="primary" onClick={function() { onScheduleSkill(skill); }}>設為定期執行</antd.Button>
          : null}
      >
        <antd.Descriptions bordered size="small" column={1} items={items}
          labelStyle={{ fontSize: fz(12), color: C.textMuted, width: 96 }}
          contentStyle={{ fontSize: fz(14), color: C.text }}
        />
      </SdSection>
    );
  }

  return null;
}

/* ════════════════════════════════════════
   Ask AI — 全程發生在右側

   2026-07-26 PO 定案，取代原本「AI 一回答就在左側插建議橫幅、
   同時鎖住右側等你採用」的做法。那個做法違反 ai_ux_guideline §1：
   把一件非阻塞的事（討論怎麼改）做成了阻塞的事。

   現在的節奏：
     問 → AI 回答並給建議（左側完全不動、右側不上鎖）
        → 使用者按「幫我改」→ 右側逐步播放 AI 的執行過程
        → 給出結果與 diff → 按「套用並刷新左側」左邊才會變
     使用者始終不 take 也沒關係，那就只是一次討論。

   按鈕只在它所屬的訊息是最後一則時顯示（guideline §2.4）。
   PO 定案：收起後不留任何重新喚起的入口 —— 錯過就錯過，
   需要的話再跟 agent 講一次就好。
   ════════════════════════════════════════ */

/* ── 可 take 的變更（action）──
   target 決定套用後要刷新左側哪一區；runSteps 是右側播放的執行過程。*/
function buildAiSuggestions(skill) {
  var list = [];

  /* 1. 適用範圍太寬 */
  var sc = skill.scope || {};
  if (!sc.equipmentIds || sc.equipmentIds.length === 0) {
    list.push({
      key: 'scope',
      prompt: '這份的適用範圍會不會太寬？',
      reply: '「指定機台」目前留空，代表' + ((sc.equipmentClass && sc.equipmentClass.length) ? sc.equipmentClass.join('、') + ' 類別下的全部機台' : '全部機台') + '都會命中。\n\n範圍越寬，命中不該命中的情境的機會就越高 —— 這在廠內不是體驗問題而是安全問題。如果實際上只有幾台會用到，建議明確勾出來。',
      action: {
        target: 'scope',
        acceptLabel: '幫我收窄範圍',
        runSteps: ['讀取目前的適用範圍條件', '比對課上實際的調用紀錄', '產生明確的機台清單'],
        resultText: '我把「指定機台」從留空改成明確清單了。留空等於該類別全部；明確列出之後，不在清單上的機台會直接被擋在候選池外，連問都不會問到這一份。',
        before: '指定機台：（留空 = 該類別全部）',
        after:  '指定機台：依課上實際使用紀錄勾選',
        appliedNote: '適用範圍已更新',
      },
    });
  }

  /* 2. 描述可讀性 */
  list.push({
    key: 'desc',
    prompt: '描述寫得夠讓新人看懂嗎？',
    reply: (skill.tier === 'sop'
      ? '以 Codify 來說算清楚，但少了一句「不用這份的時候是什麼狀況」。\n\n新人最常犯的錯不是照著做錯，是在不該用的時候拿來用。建議在開頭補一段排除條件。'
      : '結構是對的（什麼時候用 → 判斷順序 → 要確認的數據 → 注意事項），但少了一句「不用這份的時候是什麼狀況」。\n\n順序寫得再清楚，也擋不掉一開始就不該套用的情境 —— 排除條件要寫在最前面。'),
    action: {
      target: 'description',
      acceptLabel: '幫我補上去',
      runSteps: ['讀取目前的 Description', '依適用範圍與類型草擬排除條件', '檢查與現有段落是否衝突'],
      resultText: '我在開頭補了一段「什麼時候不用這份」。內容是依適用範圍與類型草擬的，套用後你可以再編輯。',
      before: null,
      after: '## 什麼時候不用這份\n（AI 依適用範圍與類型草擬，採用後可再編輯）',
      appliedNote: 'Description 已更新',
    },
  });

  /* 3. 驗收條件 —— 只有 Skill 有。Codify 的驗收是情境試跑，題目由系統依節點自動出，不用人想 */
  var seedCrits = acceptCrits(skill).filter(function(c) { return c.origin === 'seed'; }).length;
  if (skill.tier !== 'sop' && seedCrits < 4) {
    list.push({
      key: 'eval',
      prompt: '幫我想幾條該補的驗收條件',
      reply: '目前課內寫的驗收條件只有 ' + seedCrits + ' 條，偏少。\n\n系統已經幫你補了通則（範圍外要回不適用、不得代為執行、要標明責任歸屬）；真正需要你寫的是課上特有的要求 —— 那些只有做過的人才知道、少講就會出事的東西。\n\n我從這份的內容推了兩條。',
      action: {
        target: 'acceptance',
        acceptLabel: '加進驗收條件',
        runSteps: ['讀取判斷順序與注意事項', '找出少講就會出事的地方', '寫成 2 條可以判斷成立與否的條件'],
        resultText: '兩條都推自這份的內容。加進去之後要重新執行一次驗收 —— 沒跑過的條件沒有紀錄可以對照。條件文字你可以再編輯。',
        before: null,
        after: '· 數據互相矛盾時，應明說矛盾在哪，不可挑一個順眼的下結論\n· 資料不足以判斷時，應回「資料不足」並說明還缺什麼，不得硬給研判',
        appliedNote: '驗收條件已更新',
      },
    });
  }

  /* 4. 邊界（永遠有，純討論、沒有可 take 的變更） */
  list.push({
    key: 'scopecheck',
    prompt: '你可以順便幫我改別的 Codify 嗎？',
    reply: '不行。我這次被綁定的只有這一份「' + skill.title + '」，改不到其他 Skill 或 Codify。\n\n這是刻意的：每一份的簽核與責任歸屬都是獨立的，如果一個對話可以連帶改動好幾份，簽核就失去意義了。\n\n要改別份，請到 Skill 管理開啟那一份，在它的頁面上按 Ask AI。',
    action: null,
  });

  return list;
}

/* ── 執行過程：一步一步顯示，不要瞬間跑完 ──
   瞬間顯示等於使用者感受不到 agent 真的做了事（guideline §6）。*/
function AiRunBlock({ steps, done, onDone }) {
  var { C, fz } = useTheme();
  var [shown, setShown] = React.useState(done ? steps.length : 0);

  React.useEffect(function() {
    if (done) return;
    var timers = [];
    steps.forEach(function(_, i) {
      timers.push(setTimeout(function() { setShown(i + 1); }, 560 * (i + 1)));
    });
    timers.push(setTimeout(function() { onDone(); }, 560 * steps.length + 360));
    return function() { timers.forEach(function(t) { clearTimeout(t); }); };
  }, []);

  return (
    <div style={{
      border: '1px solid ' + C.border, borderRadius: 8, background: C.bg,
      padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      {steps.map(function(s, i) {
        if (i > shown) return null;
        var isDone = i < shown;
        return (
          <div key={i} className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isDone
              ? <span style={{ fontSize: fz(12), fontWeight: 700, color: '#22C55E', width: 12, flexShrink: 0 }}>✓</span>
              : <span className="spin" style={{ width: 12, height: 12, flexShrink: 0, border: '2px solid ' + C.border, borderTopColor: '#2563EB', borderRadius: '50%' }} />
            }
            <span style={{ fontSize: fz(12), color: isDone ? C.textSub : C.text, lineHeight: 1.7 }}>{s}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ── AI 訊息文字：支援 **粗體**，其餘照原樣（含換行）──
   體檢那則訊息用粗體標出「類型 / 內容 / 驗收」幾個小節，
   不解析的話畫面上會直接出現星號。 */
function AiText({ text }) {
  var { C, fz } = useTheme();
  return (
    <div style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.8, whiteSpace: 'pre-line' }}>
      {(text || '').split(/(\*\*[^*]+\*\*)/g).map(function(seg, i) {
        if (/^\*\*[^*]+\*\*$/.test(seg)) {
          return <span key={i} style={{ fontWeight: 700, color: C.text }}>{seg.slice(2, -2)}</span>;
        }
        return <React.Fragment key={i}>{seg}</React.Fragment>;
      })}
    </div>
  );
}

/* ── 變更預覽：左側不再即時渲染，所以 diff 要在右側看得到 ── */
function AiDiff({ before, after }) {
  var { C, fz } = useTheme();
  var [open, setOpen] = React.useState(false);
  if (!before && !after) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <span
        onClick={function() { setOpen(function(v) { return !v; }); }}
        style={{ fontSize: fz(12), color: '#2563EB', fontWeight: 600, cursor: 'pointer' }}
      >{open ? '收合改了什麼 ⌃' : '看改了什麼 ⌄'}</span>
      {open && (
        <div style={{ marginTop: 8, border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden' }}>
          {before && (
            <div style={{ padding: '8px 16px', fontSize: fz(12), color: C.textMuted, lineHeight: 1.7, background: 'rgba(239,68,68,0.05)', whiteSpace: 'pre-wrap' }}>
              <span style={{ fontWeight: 700, marginRight: 8 }}>−</span>{before}
            </div>
          )}
          {after && (
            <div style={{ padding: '8px 16px', fontSize: fz(12), color: C.textSub, lineHeight: 1.7, background: 'rgba(34,197,94,0.06)', whiteSpace: 'pre-wrap', borderTop: before ? '1px solid ' + C.border : 'none' }}>
              <span style={{ fontWeight: 700, marginRight: 8 }}>＋</span>{after}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AskAiPanel({ skill, onClose, onApply, intake }) {
  var { C, fz } = useTheme();
  var seqRef = React.useRef(0);
  function nextId() { seqRef.current += 1; return 'm' + seqRef.current; }

  var [messages, setMessages] = React.useState(function() {
    if (intake) {
      return [{ id: 'm0', role: 'run', steps: intake.runSteps, done: false, intake: true }];
    }
    return [{
      id: 'm0', role: 'ai',
      text: '我可以幫你檢查與修改這一份的內容 —— 適用範圍、描述、流程步驟、驗收條件都可以。\n\n我不會直接動左邊，改完會先給你看，你按「套用」左邊才會變。',
      action: null,
    }];
  });
  var [inputVal, setInputVal] = React.useState('');
  var [used, setUsed] = React.useState({});
  var bodyRef = React.useRef(null);

  var baseSuggestions = React.useMemo(function() { return buildAiSuggestions(skill); },
    [skill.id, skill.tier, acceptCrits(skill).length, skill.scope]);
  var suggestions = (intake ? intake.suggestions : []).concat(baseSuggestions);

  React.useEffect(function() {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  function push(msgs) {
    setMessages(function(prev) {
      return prev.concat(msgs.map(function(m) { return Object.assign({ id: nextId() }, m); }));
    });
  }

  /* 播放中不讓使用者繼續推進，否則步驟會被跳過（guideline §6） */
  var busy = messages.some(function(m) { return m.role === 'run' && !m.done; });

  function ask(s) {
    setUsed(function(prev) { var n = Object.assign({}, prev); n[s.key] = true; return n; });
    push([
      { role: 'user', text: s.prompt },
      { role: 'ai', text: s.reply, action: s.action || null },
    ]);
  }

  function accept(action) {
    push([
      { role: 'user', text: action.acceptLabel },
      { role: 'run', steps: action.runSteps, done: false, action: action },
    ]);
  }

  function decline() {
    push([
      { role: 'user', text: '不用，我再想想' },
      { role: 'ai', text: '好，那就先這樣。想改再跟我說一次就行。', action: null },
    ]);
  }

  function finishRun(id) {
    setMessages(function(prev) {
      var next = prev.map(function(m) { return m.id === id ? Object.assign({}, m, { done: true }) : m; });
      var done = next.filter(function(m) { return m.id === id; })[0];
      if (done.intake) {
        return next.concat([{ id: nextId(), role: 'ai', text: intake.reply, action: null }]);
      }
      return next.concat([{ id: nextId(), role: 'result', action: done.action, applied: false }]);
    });
  }

  function applyResult(id, action) {
    setMessages(function(prev) {
      return prev
        .map(function(m) { return m.id === id ? Object.assign({}, m, { applied: true }) : m; })
        .concat([{ id: nextId(), role: 'echo', text: '✓ 已套用 · ' + action.appliedNote }]);
    });
    onApply(action);
  }

  function sendFree() {
    var v = inputVal.trim();
    if (!v || busy) return;
    setInputVal('');
    push([
      { role: 'user', text: v },
      { role: 'ai', text: '這是原型，自由輸入還沒接上模型。你可以用下面的建議問題看完整的修改流程 —— 那幾題會真的產生可套用的變更。', action: null },
    ]);
  }

  var remaining = suggestions.filter(function(s) { return !used[s.key]; });
  var lastId = messages.length > 0 ? messages[messages.length - 1].id : null;

  function renderMessage(m) {
    var isLast = m.id === lastId;

    if (m.role === 'user') {
      return (
        <div key={m.id} className="fade-in" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <div style={{
            maxWidth: '86%', padding: '8px 16px', borderRadius: 8,
            background: C.bgSub, border: '1px solid ' + C.border,
            fontSize: fz(13), color: C.text, lineHeight: 1.7, whiteSpace: 'pre-line',
          }}>{m.text}</div>
        </div>
      );
    }

    if (m.role === 'echo') {
      return (
        <div key={m.id} className="fade-in" style={{ marginBottom: 16, fontSize: fz(12), color: '#22C55E', fontWeight: 600 }}>{m.text}</div>
      );
    }

    if (m.role === 'run') {
      return (
        <div key={m.id} style={{ marginBottom: 16 }}>
          <AiRunBlock steps={m.steps} done={m.done} onDone={function() { finishRun(m.id); }} />
        </div>
      );
    }

    if (m.role === 'result') {
      return (
        <div key={m.id} className="fade-in" style={{ marginBottom: 16 }}>
          <AiText text={m.action.resultText} />
          <AiDiff before={m.action.before} after={m.action.after} />
          {/* 只在最後一則時顯示；錯過就收起，不留重新喚起的入口（PO 定案） */}
          {isLast && !m.applied && (
            <div style={{ marginTop: 8 }}>
              <antd.Button type="primary" size="small" onClick={function() { applyResult(m.id, m.action); }}>
                套用並刷新左側
              </antd.Button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div key={m.id} className="fade-in" style={{ marginBottom: 16 }}>
        <AiText text={m.text} />
        {m.action && isLast && (
          <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <antd.Button size="small" type="primary" onClick={function() { accept(m.action); }}>{m.action.acceptLabel}</antd.Button>
            <antd.Button size="small" onClick={decline}>不用，我再想想</antd.Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      width: 360, flexShrink: 0, borderLeft: '1px solid ' + C.border,
      display: 'flex', flexDirection: 'column', minHeight: 0, background: C.bgPanel,
    }}>
      {/* Header */}
      <div style={{ padding: '8px 16px', borderBottom: '1px solid ' + C.border, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text, flex: 1, minWidth: 0 }}>✦ Ask AI</span>
          <antd.Button size="small" type="text" onClick={onClose} style={{ color: C.textMuted }}>✕</antd.Button>
        </div>
        <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 4, lineHeight: 1.6 }}>
          只能修改<span style={{ color: C.textSub, fontWeight: 600 }}>「{skill.title}」</span>這一份，動不到其他 Skill／Codify。
        </div>
      </div>

      {/* 對話 */}
      <div ref={bodyRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 16px' }} className="scrollbar-thin">
        {messages.map(renderMessage)}
      </div>

      {/* 建議問題 */}
      {remaining.length > 0 && (
        <div style={{ padding: '8px 16px', borderTop: '1px solid ' + C.border, display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          {remaining.slice(0, 3).map(function(s) {
            return (
              <antd.Button key={s.key} size="small" block
                onClick={function() { ask(s); }}
                disabled={busy}
                style={{ textAlign: 'left', height: 'auto', padding: '8px 8px', whiteSpace: 'normal', fontSize: fz(12), color: C.textSub }}
              >{s.prompt}</antd.Button>
            );
          })}
        </div>
      )}

      {/* 輸入 */}
      <div style={{ padding: '8px 16px 16px', borderTop: '1px solid ' + C.border, flexShrink: 0 }}>
        <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px' }}>
          <antd.Input
            variant="borderless" value={inputVal} disabled={busy}
            onChange={function(e) { setInputVal(e.target.value); }}
            onPressEnter={sendFree}
            aria-label="向 AI 描述你想改的地方"
            placeholder={busy ? 'AI 執行中…' : '描述你想改的地方…'}
            style={{ flex: 1, padding: 0, fontSize: fz(13) }}
          />
          <antd.Button type="primary" shape="circle" size="small" disabled={!inputVal.trim() || busy} onClick={sendFree}>↑</antd.Button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   首次體檢 — 剛建立的 Skill 一進來就跑

   建立 Modal 只收「類型 / 名稱 / 適用範圍 / 大致流程」四樣，
   剩下的判斷交給 agent。使用者第一次進到詳情頁時，
   右側會自己開始想，才不會面對一張空白頁不知道下一步要幹嘛。
   ════════════════════════════════════════ */
/* 把建立時填的白話流程整理成該類型的正式格式。
   原型是固定骨架 + 使用者原文；真實版由生成端回傳。 */
function buildFormalDescription(skill) {
  var raw = ((skill.intakeInput && skill.intakeInput.rawFlow) || '').trim() || '（建立時未填流程描述）';
  if (skill.tier === 'sop') {
    return '# ' + skill.title
      + '\n\n## 流程大意\n' + raw
      + '\n\n## 會碰到哪些系統\n目前全程只讀取資料、不異動任何系統。若之後加入會異動系統的步驟，執行到那幾步一律會停下來等人確認 —— 手動執行如此，排程執行也一樣。'
      + '\n\n## 什麼時候不用這份\n（AI 依適用範圍草擬，請補上課上實際的排除條件）';
  }
  /* Skill 的正式格式不是「一篇說明文件」，是**agent 照著跑的操作手冊**：
     要寫出呼叫哪一支工具、分支的門檻在哪、什麼時候要停下來，
     以及回答一定要帶出哪些東西 —— 最後那一段是讓研判結果可以被別人檢查的關鍵，
     沒有它，agent 產出的就只是一句看不出憑據的結論。 */
  var toolLines = (skill.tools || []).map(function(t) {
    return '- `' + t.name + '` — ' + t.label + '（' + t.system + '）';
  }).join('\n') || '- （尚未授權工具，請在上方 Scope 區的「可用工具」加入）';

  return '# ' + skill.title
    + '\n\n## 什麼時候用這份\n' + raw
    + '\n\n## 什麼時候不用這份\n（AI 依適用範圍草擬，請補上課上實際的排除條件）'
    + '\n\n## 可以動用的工具\n' + toolLines
    + '\n\n全部唯讀。要異動系統的動作都要人自己執行 —— 這份沒有寫入工具，也不會有。'
    + '\n\n## 研判步驟\n每一步都要把取到的數值寫進回答，不要只寫結論。'
    + '\n\n1. **先看現場數據的走勢**\n  - 持續性的偏移與突發跳動要分開看，兩者的處置方向完全不同\n  - 取不到數據就停下來說缺哪一項，不要拿別的代替'
    + '\n2. **比對同類設備**\n  - 多台同時出現 → 多半不是單機問題，方向要改\n  - 只有這一台 → 才繼續往單機方向查'
    + '\n3. **對照上次保養時間**\n   距離上次保養越久，磨耗解釋的合理性越高。'
    + '\n\n（以上是依類型草擬的骨架，請把課上實際的門檻數字與分支條件填進去 —— 門檻寫得多明確，研判就有多穩。）'
    + '\n\n## 回答一定要包含\n1. **結論與把握程度** —— 判成什麼、有幾項數據支持\n2. **每個數字的來源** —— 哪一支工具、什麼時間取的，讓看的人可以自己回查\n3. **排除了什麼** —— 哪些假設被排除、憑哪一項數據排除\n4. **建議動作與執行位置** —— 要做什麼、在哪個系統做、該由誰執行\n5. **責任聲明** —— 這是研判建議，不是核准流程'
    + '\n\n## 停下來不要硬判的情況\n- 資料不足 → 回「資料不足以判斷」並列出還缺什麼\n- 數據互相矛盾 → 明說矛盾在哪，不要挑一個順眼的下結論'
    + '\n\n## 注意事項\n本指引產出的是**建議**，責任仍在執行者。本類型只有唯讀工具，不會異動任何系統。';
}

/* 2026-07-30 起兩個類型名都是拉丁字（Skill / Codify），夾在中文句子裡都要補空白。
   不處理的話會出現「那就改成Codify吧」這種擠在一起的句子。
   知識仍是中文，所以照舊由第一個字元判斷，不寫死。 */
function tierWord(t) {
  var l = SKILL_TIER_CFG[t].label;
  return /^[A-Za-z]/.test(l) ? ' ' + l + ' ' : l;
}

function buildIntakeReview(skill, p) {
  var raw  = (skill.intakeInput && skill.intakeInput.rawFlow) || '';
  var rec  = recommendTier(raw);
  var isSop = skill.tier === 'sop';
  var mismatch = rec.tier !== skill.tier;
  var critCnt = acceptCrits(skill).length;
  var probeCnt = acceptProbes(skill).length;

  var findings = [];
  var suggestions = [];

  /* 1. 類型 —— 使用者可以選錯，這一關就是要抓出來 */
  if (mismatch) {
    findings.push('**類型**　你選的是「' + SKILL_TIER_CFG[skill.tier].label + '」，但' + rec.why + '\n' + rec.benefit);
    suggestions.push({
      key: 'intake-tier',
      prompt: ('那就改成' + tierWord(rec.tier) + '吧').trim(),
      reply: '好。改成「' + SKILL_TIER_CFG[rec.tier].label + '」之後：' + SKILL_TIER_CFG[rec.tier].detail,
      action: {
        target: 'tier',
        tier: rec.tier,
        acceptLabel: ('幫我改成' + tierWord(rec.tier)).trim(),
        runSteps: ['重新判讀你描述的流程', '檢查這個類型可用的工具範圍', '重出系統的負面測試題'],
        resultText: '類型改好了。系統的負面測試題會依新類型重出一次 —— 不同類型該擋的事情不一樣。',
        before: '類型：' + SKILL_TIER_CFG[skill.tier].label,
        after:  '類型：' + SKILL_TIER_CFG[rec.tier].label,
        appliedNote: '類型已改為 ' + SKILL_TIER_CFG[rec.tier].label,
      },
    });
  } else {
    findings.push('**類型**　你選的「' + SKILL_TIER_CFG[skill.tier].label + '」跟你描述的內容是相符的，不用改。');
  }

  /* 2. Description —— 使用者填的是白話，還不是可執行／可研判的格式 */
  findings.push('**內容**　你填的是給人看的白話，還不是' + (isSop ? '簽核看得懂的流程敘述' : 'AI 拿去操作工具的指引 —— 它要照著這段決定呼叫哪支工具、什麼門檻下走哪一條分支') + '。我可以幫你整理成正式格式。');
  suggestions.push({
    key: 'intake-desc',
    prompt: '幫我把內容整理成正式格式',
    reply: '我會保留你寫的意思，只補上結構與缺掉的段落 —— ' + (isSop ? '流程大意、會碰到的系統、異動步驟的處理方式。' : '什麼時候用 → 可以動用哪些工具 → 研判步驟與分支門檻 → 回答一定要包含什麼 → 什麼時候該停下來。\n\n最後那兩段是重點：AI 是照這份去操作工具的，回答要帶出數據來源與排除過程，別人才檢查得了它做了什麼。'),
    action: {
      target: 'description',
      mode: 'replace',
      acceptLabel: '幫我整理',
      runSteps: ['讀取你填的流程描述', '比對這個類型的標準格式', '補上缺少的段落', '產生正式的 Description'],
      resultText: '整理好了。你原本寫的意思都在，只是補上了結構與缺掉的段落 —— 套用後可以再編輯。',
      before: (raw || '（未填）').slice(0, 60) + (raw.length > 60 ? '…' : ''),
      after: isSop ? '（正式 Codify 流程敘述：流程大意 / 會碰到的系統 / 異動步驟的處理）' : '（正式判斷指引：什麼時候用 / 可以動用的工具 / 研判步驟與門檻 / 回答一定要包含 / 停下來不要硬判的情況）',
      appliedNote: 'Description 已更新',
    },
  });

  /* 3. Graph —— 只有 Codify 有，且還沒拆步驟時才提 */
  if (isSop && (skill.plainSteps || []).length === 0) {
    findings.push('**流程圖**　還沒有。我可以依你寫的流程拆成步驟，並標出哪幾步會異動系統。');
    suggestions.push({
      key: 'intake-graph',
      prompt: '幫我拆成步驟並畫出流程圖',
      reply: '我會盡量用課上已經驗證過的標準元件；接不上的地方才標成「本次自訂」—— 簽核時那幾步才是重點。',
      action: {
        target: 'graph',
        acceptLabel: '幫我拆步驟',
        runSteps: ['拆解你描述的流程', '比對課上的標準元件庫', '標出會異動系統的步驟', '排出步驟之間的先後關係'],
        resultText: '拆成 5 步，其中 1 步接不上標準元件、標成「本次自訂」。全程只讀取資料，沒有會異動系統的步驟。',
        before: null,
        after: '步驟 1–5 與流程圖（標準元件 ×4、本次自訂 ×1）',
        appliedNote: '流程圖已產生',
      },
    });
  }

  /* 4. 驗收 —— 不給 action，因為它要的是使用者自己去按那顆執行鈕。
     兩種類型驗收方法不同，講的話也不一樣。 */
  findings.push(isSop
    ? '**驗收**　Codify 不測「使用者會怎麼問」——圖裡沒有的工具它呼叫不到，範圍也是勾出來的。要驗的是資料壞掉時每個節點怎麼反應，題目系統會依你的節點自動出。拆完步驟之後，記得回左邊按一次「執行情境試跑」。'
    : '**驗收**　目前只有系統自動補的 ' + critCnt + ' 條驗收條件與 ' + probeCnt + ' 個提問情境，還沒跑過。Skill 每次結果都不一樣，所以驗收是同一個問法跑 ' + ACCEPT_RUNS + ' 次、由你看內容確認 —— 整理完內容之後，記得回左邊按一次「執行驗收」。');

  return {
    runSteps: ['讀取你填的名稱與流程', '比對課上已有的 Skill 與 Codify', '檢查適用範圍圈到的機台', '判斷類型是否合適'],
    reply: '我看過你填的內容了。\n\n' + findings.join('\n\n') + '\n\n下面幾件事我可以幫你做，一次一件。',
    suggestions: suggestions,
  };
}

/* ════════════════════════════════════════
   主元件
   ════════════════════════════════════════ */
function SkillDetailPage({ skill, p, onBack, onSave, onAdvance, mount, onScheduleSkill }) {
  var { C, fz } = useTheme();
  var [calcOpened, setCalcOpened] = React.useState(false);
  /* 剛建立的 Skill：右側自動展開並開始體檢 */
  var isIntake = !!(skill.intakeInput && !skill.intakeDone);
  var [askOpen, setAskOpen]       = React.useState(isIntake);
  var [toast, setToast]           = React.useState(null);
  /* AI 套用變更後左側的刷新：refreshing 是更新中的區塊，flash 是換完閃一下 */
  var [refreshing, setRefreshing] = React.useState(null);
  var [flash, setFlash]           = React.useState(null);
  var [revision, setRevision]     = React.useState(0);

  var intake = React.useMemo(function() {
    return isIntake ? buildIntakeReview(skill, p) : null;
  }, [skill.id]);
  /* 首次體檢只播一次：關掉再打開不該又想一遍 */
  var intakeShown = React.useRef(false);

  var gate   = getSignoffGate(skill, calcOpened);
  var action = getSignoffAction(skill.stage);
  var tierCfg = SKILL_TIER_CFG[skill.tier] || SKILL_TIER_CFG.guided;

  /* target → 左側區塊的 DOM id，套用後要捲過去，不然使用者不知道哪裡變了 */
  var SECTION_OF = { tier: 'sd-tier', scope: 'sd-scope', description: 'sd-desc', graph: 'sd-graph', acceptance: 'sd-test' };

  function mutate(act) {
    var next = Object.assign({}, skill, { intakeDone: true });

    if (act.target === 'description') {
      next.description = act.mode === 'replace'
        ? buildFormalDescription(skill)
        : act.after + '\n\n' + (skill.description || '');
      /* 指引是這份的契約。改了之後 AI 的行為就跟上次驗的不是同一件事，
         所以先前的驗收結果與確認一律作廢（Skill 才有這件事）。 */
      next.descRev = (skill.descRev || 0) + 1;

    } else if (act.target === 'scope') {
      var targets = matchScopeTargets(p.key, skill.scope);
      next.scope = Object.assign({}, skill.scope, { equipmentIds: targets.map(function(t) { return t.id; }) });

    } else if (act.target === 'tier') {
      next.tier = act.tier;
      /* 類型換了，驗收方法整個換掉 —— Codify 走情境試跑（系統依節點自動出，
         不需要驗收條件），Skill 走驗收。 */
      if (act.tier === 'sop') {
        next.acceptance = { criteria: [], probes: [] };
        next.acceptRun = undefined;
        next.acceptChecks = {};
      } else {
        var keepAcc = skill.acceptance || {};
        var auto = buildAutoAcceptance(p, skill.scope, skill.title);
        next.acceptance = {
          criteria: (keepAcc.criteria || []).filter(function(c) { return c.origin !== 'system'; }).concat(auto.criteria),
          probes:   (keepAcc.probes   || []).filter(function(b) { return b.origin !== 'system'; }).concat(auto.probes),
        };
        /* 條件換了一批，先前跑的結果對不上，重驗 */
        next.acceptRun = undefined;
        next.acceptChecks = {};
      }
      if (act.tier === 'guided') {
        next.tools = (skill.tools || []).filter(function(t) { return t.mode !== 'write'; });
        next.plainSteps = [];
        next.graph = null;
      }

    } else if (act.target === 'graph') {
      var gen = generateDraftContent('sop', matchScopeTargets(p.key, skill.scope).length);
      next.plainSteps = gen.plainSteps;
      next.graph = gen.graph;
      next.tools = gen.tools;

    } else if (act.target === 'acceptance') {
      /* 只加條件文字。條件上沒有任何判定欄位 —— 有沒有做到是人看完紀錄自己決定的，
         加完之後要重新執行一次驗收才有紀錄可看。 */
      var addCrits = [
        { id: 'ac-ai-1', origin: 'seed', locked: false,
          text: '數據互相矛盾時，應明說矛盾在哪，不可挑一個順眼的下結論' },
        { id: 'ac-ai-2', origin: 'seed', locked: false,
          text: '資料不足以判斷時，應回「資料不足」並說明還缺什麼，不得硬給研判' },
      ];
      next.acceptance = Object.assign({}, skill.acceptance, {
        criteria: acceptCrits(skill).concat(addCrits),
      });
    }
    return next;
  }

  /* 使用者按下「套用並刷新左側」才會走到這裡。
     左側平常完全不受 AI 影響 —— 這是刻意的，見檔頭。 */
  function applyFromAi(act) {
    var secId = SECTION_OF[act.target];
    setRefreshing(act.target);
    var el = secId && document.getElementById(secId);
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setTimeout(function() {
      onSave(mutate(act));
      setRefreshing(null);
      setRevision(function(v) { return v + 1; });
      setFlash(act.target);
      setToast(act.appliedNote);
      setTimeout(function() { setFlash(null); }, 1700);
    }, 700);
  }

  React.useEffect(function() {
    if (!toast) return;
    var t = setTimeout(function() { setToast(null); }, 2400);
    return function() { clearTimeout(t); };
  }, [toast]);

  /* 刷新過的區塊要重新 mount 才會有淡入；沒刷新過的維持原本的 key */
  function sectionProps(target) {
    return {
      refreshing: refreshing === target,
      flash: flash === target,
      contentKey: flash === target || refreshing === target ? target + '-' + revision : undefined,
    };
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: C.bg }}>

      {/* Header：返回 / 標題 / Ask AI / Signoff */}
      <div style={{ padding: '8px 24px', borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <antd.Button size="small" type="text" onClick={onBack} style={{ color: C.textSub, flexShrink: 0 }}>← 返回清單</antd.Button>
        <div style={{ width: 1, height: 24, background: C.border, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <SkillTierTag tier={skill.tier} />
            <StatusTag stage={skill.stage} />
            <span style={{ fontSize: fz(18), fontWeight: 600, color: C.text }}>{skill.title}</span>
          </div>
          <div style={{ fontSize: fz(12), color: C.textMuted, marginTop: 2 }}>
            {tierCfg.oneLiner} · {skill.importedBy} 建立於 {skill.importedAt}
          </div>
        </div>
        <antd.Space size={8} style={{ flexShrink: 0 }}>
          <antd.Button
            onClick={function() { setAskOpen(function(v) { return !v; }); }}
            style={askOpen ? { color: '#7C3AED', borderColor: 'rgba(124,58,237,0.4)', background: 'rgba(124,58,237,0.08)' } : undefined}
          >✦ Ask AI</antd.Button>
          <antd.Tooltip title={gate || (action.enabled ? '' : (skill.stage === 'production' ? '已生效的 Skill 不能再送簽' : '簽核進行中'))}>
            <antd.Button
              type="primary"
              disabled={!action.enabled || !!gate}
              onClick={function() { if (action.next) onAdvance(action.next); }}
            >{action.label}{skill.stage === 'approving' && (skill.approvers || []).length > 0
                ? ' ' + skill.approvers.filter(function(a) { return a.approved; }).length + '/' + skill.approvers.length
                : ''}</antd.Button>
          </antd.Tooltip>
        </antd.Space>
      </div>

      {/* 採用後的輕量提示 */}
      {toast && (
        <div style={{ padding: '8px 24px', background: 'rgba(34,197,94,0.08)', borderBottom: '1px solid ' + C.border, fontSize: fz(12), color: '#22C55E', fontWeight: 600, flexShrink: 0 }}>
          ✓ {toast}
        </div>
      )}

      {/* 主體：內容 + Ask AI 側欄 */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '24px 32px' }} className="scrollbar-thin">
          <div style={{ maxWidth: 880 }}>

            {/* 類型摘要：這是什麼、能不能排程 */}
            <div id="sd-tier" className={flash === 'tier' ? 'sd-flash' : undefined} style={{
              marginBottom: 32, padding: 16, borderRadius: 8,
              background: tierCfg.bg, border: '1px solid ' + tierCfg.border,
              opacity: refreshing === 'tier' ? 0.3 : 1, transition: 'opacity 0.2s',
            }}>
              {/* 只有這一區真的被換掉時才重播淡入，否則每次套用別區都會閃 */}
              <div
                key={flash === 'tier' || refreshing === 'tier' ? 'tier-' + revision : 'tier'}
                className={flash === 'tier' ? 'fade-in' : undefined}
                style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.7 }}
              >{tierCfg.detail}</div>
            </div>

            <SdSection id="sd-scope" title="Scope" {...sectionProps('scope')}
              desc="用途與適用範圍。範圍是勾出來的結構化條件，不是自由文字 —— 所以系統算得出「目前符合幾台」，也擋得掉不該命中的機台。">
              <ScopeBlock skill={skill} p={p} onSave={onSave} />
            </SdSection>

            <SdSection id="sd-desc" title="Description" {...sectionProps('description')}
              desc={skill.tier === 'sop'
                ? '這份 Codify 在做什麼、流程大意。簽核簽的是這段白話說明，不是底下的 code。'
                : '這份 Skill 的完整指引，也是 AI 的操作手冊 —— 呼叫哪支工具、什麼門檻下走哪條分支、回答要帶出哪些依據，都寫在這裡。它寫得多明確，研判就有多穩，也才檢查得出 AI 到底做了什麼。'}>
              <DescriptionBlock skill={skill} p={p} />
            </SdSection>

            {/* Graph 只有 Codify 有 —— Skill 沒有固定步驟，畫不出流程圖 */}
            {skill.tier === 'sop' && (
              <SdSection id="sd-graph" title="Graph" {...sectionProps('graph')}
                badge={(skill.plainSteps || []).length + ' 個步驟'}
                desc="執行時實際會跑的流程。節點上直接標出讀取／異動／需人工確認，不另開「會碰到哪些系統」的清單。">
                <SkillGraph skill={skill} onSaveScenario={function(sc) {
                  onSave(Object.assign({}, skill, { userScenarios: (skill.userScenarios || []).concat([sc]) }));
                }} />
              </SdSection>
            )}

            <SdSection id="sd-test" title={skill.tier === 'sop' ? 'Dry-run' : '驗收'}
              desc={skill.tier === 'sop'
                ? 'Codify 是 codify graph，每個節點都是一段程式碼，沒有「意圖」可測 —— 圖裡沒有的工具它呼叫不到，範圍也是勾出來的結構化條件。要驗的是結果與例外：資料壞掉時每個節點怎麼反應。全部符合約定才能送簽。'
                : '同一份指引換個問法就會走不同路，沒有固定步驟可以試跑，而且每次結果都不一樣 —— 所以驗的是意圖，而且要跑很多次。你寫下每次回答都該成立的條件，系統把每個提問情境各跑 ' + ACCEPT_RUNS + ' 次，由你看內容確認。全數確認才能送簽。'}>
              <TestBlock skill={skill} p={p} onSave={onSave} onOpenCalc={function() { setCalcOpened(true); }} />
            </SdSection>

            <StatusBlock skill={skill} p={p} mount={mount} onScheduleSkill={onScheduleSkill} />

            {/* 送簽條件沒過時，把原因寫在頁尾，不要只藏在 tooltip 裡 */}
            {gate && (
              <antd.Alert type="warning" showIcon
                message={<span style={{ fontSize: fz(13), fontWeight: 600 }}>還不能送簽</span>}
                description={<span style={{ fontSize: fz(13), lineHeight: 1.6 }}>{gate}</span>}
              />
            )}
          </div>
        </div>

        {askOpen && (
          <AskAiPanel
            skill={skill}
            intake={intakeShown.current ? null : intake}
            onApply={applyFromAi}
            onClose={function() { intakeShown.current = true; setAskOpen(false); }}
          />
        )}
      </div>
    </div>
  );
}
