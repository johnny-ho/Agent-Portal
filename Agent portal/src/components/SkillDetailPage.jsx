/* ════════════════════════════════════════
   SKILL DETAIL PAGE — 輔助判斷 / SOP 詳情（全頁）

   2026-07-26 PO 定案的版面：
     Title / Scope / Description / Graph（僅 SOP）/ Test case & Dry-run
     右上：[Ask AI]（修正這一份）與 [Signoff]（送簽核與生效）

   原本的大 Modal 改成全頁，理由是 Graph 與 Ask AI 側欄要同時展開，
   1000px 的 Modal 塞不下這兩者。

   刻意拿掉的東西（資訊沒有不見，換了地方）：
     · 「會碰到哪些系統」大區塊 → SOP 收進 Graph 節點標記，
        輔助判斷收成 Scope 底下一行可展開的摘要
     · 「最近一次處理紀錄」 → Chat 情境 3 就是它的活體展示，
        這裡只在測試區保留一則做為對照
   ════════════════════════════════════════ */

/* ── 送簽的硬條件（回傳擋下的原因，null = 可送）──
   SOP：試跑第二層「每個數字怎麼算的」至少要展開過一次，避免簽核淪為蓋章
   輔助判斷：測試題必須全數通過（含系統自動出的負面題）
   見 brain/concepts/agent-skill-tiering.md 風險 2 與「簽核驗收」 */
function getSignoffGate(skill, calcOpened) {
  if (skill.stage === 'approving' || skill.stage === 'pirun' || skill.stage === 'production') return null;
  var cases   = skill.evalCases || [];
  var passed  = cases.filter(function(c) { return c.result === 'pass'; }).length;
  var pending = cases.filter(function(c) { return c.result === 'pending' || !c.result; }).length;
  if (cases.length === 0) return '尚未建立測試案例，無法送簽';
  /* 沒跑過就沒有結果可言 —— 這是「執行測試」按鈕存在的理由 */
  if (pending > 0) return '還有 ' + pending + ' 題測試案例沒有執行，請先按「執行測試」';
  if (passed < cases.length) return '測試案例需全數通過才能送簽（目前 ' + passed + ' / ' + cases.length + '）';
  if (skill.tier === 'sop' && skill.dryRun && !calcOpened) {
    return '請先展開試跑結果的「每個數字怎麼算的」，確認過再送簽';
  }
  return null;
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
   SkillGraph — SOP 的流程圖（僅 SOP 有）

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

function GraphNode({ step }) {
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

function SkillGraph({ skill }) {
  var { C, fz } = useTheme();
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
                {row.map(function(s) { return <GraphNode key={s.num} step={s} />; })}
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
          輔助判斷的「不能寫入」要看得到，才知道邊界在哪。 */}
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
                🔒 「輔助判斷」不能異動系統，寫入類工具無法加入。<br />
                需要 AI 代為執行動作，請改建一個 <span style={{ fontWeight: 600, color: C.textSub }}>SOP</span>：SOP 的每個異動步驟都會停下來等人確認。
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
   Description 區 — Skill 是 skill.md 風格文本，SOP 是流程敘述
   簽核簽的是這一段（白話說明＝契約），不是 code
   ════════════════════════════════════════ */
function DescriptionBlock({ skill, p }) {
  var { C, fz } = useTheme();
  var refs = (skill.knowledgeRefs || []).map(function(id) { return findKnowledgeDoc(p.key, id); }).filter(Boolean);

  /* 極輕量 markdown：# 標題、**粗體**、其餘為段落。不引外部套件。 */
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
    var parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <div key={i} style={{ fontSize: fz(14), color: C.textSub, lineHeight: 1.9, marginBottom: 4 }}>
        {parts.map(function(seg, j) {
          if (/^\*\*[^*]+\*\*$/.test(seg)) {
            return <span key={j} style={{ fontWeight: 700, color: C.text }}>{seg.slice(2, -2)}</span>;
          }
          return <React.Fragment key={j}>{seg}</React.Fragment>;
        })}
      </div>
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
   Test case & Dry-run 區

   2026-07-26 PO 定案：原本 PASS 是資料裡寫死的，看不出誰跑的、什麼時候跑的，
   而送簽的硬條件卻建立在一個從未發生過的動作上。現在補回兩個動作：
     · 執行測試（逐題播放，跑完才有結果）
     · 重新試跑（僅 SOP）
   新增的案例一律是「待執行」，逼使用者真的按一次。
   ════════════════════════════════════════ */

/* 原型的判定：資料裡標了 mockResult 就照它，其餘一律 pass。
   AI 補的第二題故意設成 fail —— 沒有失敗可看，這個按鈕就只是動畫。 */
function evalCaseOutcome(c) {
  if (c.mockResult) return c.mockResult;
  return c.result === 'fail' ? 'fail' : 'pass';
}

/* 新增測試案例：這是明確的表單任務，不是對話，所以用 Modal 是對的。 */
function AddEvalCaseModal({ skill, onCancel, onAdd }) {
  var { C, fz } = useTheme();
  var [input, setInput]   = React.useState('');
  var [expect, setExpect] = React.useState('');
  var [drafting, setDraft] = React.useState(false);

  /* 人會寫「該做什麼」，不會想到寫「不該做什麼」—— 這顆就是補那一塊 */
  function askAi() {
    setDraft(true);
    setTimeout(function() {
      var pool = skill.tier === 'sop'
        ? [
            { i: '來源系統其中一個查不到資料', e: '應明確標示缺漏並停止產出，不可用預設值補齊後照常輸出' },
            { i: '同一天重複執行第二次',       e: '應提示已執行過並顯示上次結果，不重複寫入' },
          ]
        : [
            { i: '兩個數據互相矛盾時',   e: '應明說矛盾在哪，不可挑一個順眼的下結論' },
            { i: '資料不足以判斷時',     e: '應回「資料不足」並說明還缺什麼，不得硬給研判' },
          ];
      var pick = pool[(skill.evalCases || []).length % pool.length];
      setInput(pick.i);
      setExpect(pick.e);
      setDraft(false);
    }, 900);
  }

  return (
    <antd.Modal
      open centered width={560} title={<span style={{ fontSize: fz(16), fontWeight: 600 }}>新增測試案例</span>}
      onCancel={onCancel}
      okText="加入" cancelText="取消"
      okButtonProps={{ disabled: !input.trim() || !expect.trim() }}
      onOk={function() { onAdd(input.trim(), expect.trim()); }}
    >
      <div style={{ fontSize: fz(12), color: C.textMuted, lineHeight: 1.7, marginBottom: 16 }}>
        加進來的案例是「待執行」，要按一次「執行測試」才會有結果。
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub, marginBottom: 8 }}>使用者會怎麼問</div>
        <antd.Input.TextArea value={input} onChange={function(e) { setInput(e.target.value); }} autoSize={{ minRows: 2, maxRows: 4 }} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub, marginBottom: 8 }}>AI 應該怎麼回</div>
        <antd.Input.TextArea value={expect} onChange={function(e) { setExpect(e.target.value); }} autoSize={{ minRows: 2, maxRows: 4 }} />
      </div>

      <antd.Button size="small" loading={drafting} onClick={askAi}
        style={{ color: '#7C3AED', borderColor: 'rgba(124,58,237,0.4)' }}>
        ✦ 讓 AI 依這份內容幫我想一題
      </antd.Button>
    </antd.Modal>
  );
}

function TestBlock({ skill, p, onSave, onOpenCalc }) {
  var { C, fz } = useTheme();
  var cases   = skill.evalCases || [];
  var passCnt = cases.filter(function(c) { return c.result === 'pass'; }).length;
  var pendCnt = cases.filter(function(c) { return c.result === 'pending' || !c.result; }).length;
  var allPass = cases.length > 0 && passCnt === cases.length;
  var dr = skill.dryRun;

  var [live, setLive]       = React.useState(null);   /* 執行中的即時結果，跑完就交還給 skill */
  var [running, setRunning] = React.useState(false);
  var [dryRunning, setDry]  = React.useState(false);
  var [addOpen, setAddOpen] = React.useState(false);
  var [openFail, setOpenFail] = React.useState({});

  /* 逐題播放：瞬間跑完的話，「正在測」這個狀態根本不存在（guideline §6） */
  function runTests() {
    if (running || cases.length === 0) return;
    setRunning(true);
    setLive({});
    var acc = {};
    var timers = [];
    cases.forEach(function(c, i) {
      timers.push(setTimeout(function() {
        setLive(function(prev) { var n = Object.assign({}, prev); n[c.id] = 'running'; return n; });
      }, i * 620));
      timers.push(setTimeout(function() {
        acc[c.id] = evalCaseOutcome(c);
        setLive(function(prev) { var n = Object.assign({}, prev); n[c.id] = acc[c.id]; return n; });
      }, i * 620 + 460));
    });
    setTimeout(function() {
      setRunning(false);
      setLive(null);
      onSave(Object.assign({}, skill, {
        evalCases: cases.map(function(c) { return Object.assign({}, c, { result: acc[c.id] || c.result }); }),
        evalRun: { at: '剛剛', by: p.user.name },
      }));
    }, cases.length * 620 + 560);
  }

  function rerunDry() {
    setDry(true);
    setTimeout(function() {
      setDry(false);
      onSave(Object.assign({}, skill, { dryRun: Object.assign({}, dr, { ranAt: '剛剛' }) }));
    }, 1500);
  }

  function addCase(input, expect) {
    setAddOpen(false);
    onSave(Object.assign({}, skill, {
      evalCases: cases.concat([{
        id: 'ev-seed-' + Date.now(), input: input, expect: expect,
        origin: 'seed', locked: false, result: 'pending',
      }]),
    }));
  }

  function removeCase(id) {
    onSave(Object.assign({}, skill, {
      evalCases: cases.filter(function(c) { return c.id !== id; }),
    }));
  }

  /* 執行紀錄。舊資料沒有 evalRun，就退回建立當時的人與日期 ——
     重點是畫面上不能出現「沒人跑過卻顯示 PASS」。 */
  var lastRun = skill.evalRun || (cases.length > 0 && pendCnt === 0
    ? { at: skill.importedAt, by: skill.importedBy }
    : null);

  function statusOf(c) { return (live && live[c.id]) || c.result || 'pending'; }

  var dryRunItems = dr ? [
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
  ] : [];

  return (
    <div>
      {/* 測試案例 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>測試案例</span>
        {pendCnt > 0
          ? <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), fontWeight: 600, color: '#F97316', background: 'rgba(249,115,22,0.08)' }}>
              {pendCnt} 題待執行{cases.length > pendCnt ? '（共 ' + cases.length + ' 題）' : ''}
            </antd.Tag>
          : <antd.Tag bordered={false} style={{
              marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), fontWeight: 600,
              color: allPass ? '#22C55E' : '#F97316',
              background: allPass ? 'rgba(34,197,94,0.08)' : 'rgba(249,115,22,0.08)',
            }}>{passCnt} / {cases.length} 通過</antd.Tag>
        }
        <div style={{ flex: 1 }} />
        <antd.Button size="small" type="dashed" disabled={running} onClick={function() { setAddOpen(true); }}>＋ 新增測試案例</antd.Button>
        <antd.Button size="small" type="primary" loading={running} disabled={cases.length === 0} onClick={runTests}>
          {running ? '執行中…' : (lastRun ? '重新執行' : '執行測試')}
        </antd.Button>
      </div>
      <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 8, lineHeight: 1.6 }}>
        標了 🔒 的是系統依適用範圍與類型自動出的負面題，不可刪除 —— 人會寫「該做什麼」，不會想到寫「不該做什麼」，而不該做的才是會出事的。
      </div>
      <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 16 }}>
        {lastRun && !running
          ? '上次執行：' + lastRun.at + ' · ' + lastRun.by
          : (running ? '執行中，一題一題跑。' : '尚未執行過，畫面上不會有結果。')}
      </div>
      <antd.List
        bordered size="small" dataSource={cases}
        locale={{ emptyText: <span style={{ fontSize: fz(13), color: C.textMuted }}>尚無測試案例</span> }}
        renderItem={function(c) {
          var st = statusOf(c);
          var cfg = st === 'pass'    ? { label: 'PASS',  color: '#22C55E', bg: 'rgba(34,197,94,0.08)' }
                  : st === 'fail'    ? { label: 'FAIL',  color: '#EF4444', bg: 'rgba(239,68,68,0.08)' }
                  : st === 'running' ? { label: '執行中', color: '#2563EB', bg: 'rgba(37,99,235,0.08)' }
                  :                    { label: '待執行', color: '#6B7280', bg: 'rgba(107,114,128,0.08)' };
          var showFail = st === 'fail' && !!openFail[c.id];
          return (
            <antd.List.Item style={{ alignItems: 'flex-start', gap: 8, background: st === 'fail' ? 'rgba(239,68,68,0.04)' : 'transparent' }}>
              <antd.Tag bordered={false} style={{
                marginInlineEnd: 0, borderRadius: 999, flexShrink: 0, width: 56, textAlign: 'center',
                fontSize: fz(11), fontWeight: 700, color: cfg.color, background: cfg.bg,
              }}>{cfg.label}</antd.Tag>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: fz(14), color: C.text, fontWeight: 500, marginBottom: 4 }}>「{c.input}」</div>
                <div style={{ fontSize: fz(12), color: C.textSub, lineHeight: 1.6 }}>預期：{c.expect}</div>
                {st === 'fail' && (
                  <div style={{ marginTop: 4 }}>
                    <span
                      onClick={function() { setOpenFail(function(prev) { var n = Object.assign({}, prev); n[c.id] = !prev[c.id]; return n; }); }}
                      style={{ fontSize: fz(12), color: '#EF4444', fontWeight: 600, cursor: 'pointer' }}
                    >{showFail ? '收合為什麼沒過 ⌃' : '看為什麼沒過 ⌄'}</span>
                    {showFail && (
                      <div style={{ marginTop: 8, border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, overflow: 'hidden' }}>
                        <div style={{ padding: '8px 16px', fontSize: fz(12), color: C.textSub, lineHeight: 1.7 }}>
                          <span style={{ color: C.textMuted, marginRight: 8 }}>AI 實際回了</span>{c.mockActual || '（未紀錄）'}
                        </div>
                        <div style={{ padding: '8px 16px', borderTop: '1px solid rgba(239,68,68,0.2)', fontSize: fz(12), color: '#EF4444', lineHeight: 1.7 }}>
                          {c.mockReason || '回覆內容不符合預期行為。'}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {c.origin === 'system'
                ? <antd.Tooltip title="系統依適用範圍與類型自動出題，不可刪除">
                    <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, flexShrink: 0, fontSize: fz(11), color: C.textMuted, background: C.bgPanel }}>🔒 系統出題</antd.Tag>
                  </antd.Tooltip>
                : <antd.Space size={8} style={{ flexShrink: 0 }}>
                    <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), color: C.textMuted, background: C.bgPanel }}>課內出題</antd.Tag>
                    <antd.Popconfirm title="刪除這題測試案例？" okText="刪除" okButtonProps={{ danger: true }} cancelText="取消"
                      onConfirm={function() { removeCase(c.id); }}>
                      <antd.Button size="small" type="text" disabled={running} style={{ color: C.textMuted }}>✕</antd.Button>
                    </antd.Popconfirm>
                  </antd.Space>
              }
            </antd.List.Item>
          );
        }}
      />

      {addOpen && (
        <AddEvalCaseModal skill={skill} onCancel={function() { setAddOpen(false); }} onAdd={addCase} />
      )}

      {/* Dry run（僅 SOP 有） */}
      {dr && (
        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>試跑結果</span>
            <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), background: C.bgPanel, color: C.textMuted }}>{dryRunning ? '執行中…' : dr.ranAt}</antd.Tag>
            <div style={{ flex: 1 }} />
            <antd.Button size="small" loading={dryRunning} onClick={rerunDry}>重新試跑</antd.Button>
          </div>
          <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 16, lineHeight: 1.6 }}>
            輸出看起來對，不代表來源對。第 2、3 層不能只是擺著 —— 送簽前至少要展開過第 2 層一次。
          </div>
          {dr.diffNote && (
            <antd.Alert type="info" showIcon style={{ marginBottom: 16 }}
              message={<span style={{ fontSize: fz(12), fontWeight: 600 }}>與{dr.comparedWith}比對</span>}
              description={<span style={{ fontSize: fz(12), lineHeight: 1.6 }}>{dr.diffNote}</span>}
            />
          )}
          <antd.Collapse
            defaultActiveKey={['output']}
            items={dryRunItems}
            size="small"
            onChange={function(keys) {
              if (keys.indexOf('calc') !== -1 && onOpenCalc) onOpenCalc();
            }}
          />
        </div>
      )}

      {/* 輔助判斷：一次實際互動的紀錄（治理要看得見） */}
      {skill.tier === 'guided' && skill.traceSample && (
        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>最近一次實際互動</span>
            <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), background: C.bgPanel, color: C.textMuted }}>{skill.traceSample.askedAt}</antd.Tag>
          </div>
          <div style={{ fontSize: fz(14), color: C.text, fontWeight: 500, marginBottom: 8, background: C.bgSub, border: '1px solid ' + C.border, borderRadius: 8, padding: '8px 16px' }}>
            {skill.traceSample.askedBy}：「{skill.traceSample.question}」
          </div>
          <div style={{ border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden' }}>
            {skill.traceSample.steps.map(function(s, i) {
              var isDenied = s.kind === 'tool' && !s.allowed;
              return (
                <div key={i} style={{
                  padding: '8px 16px', borderTop: i > 0 ? '1px solid ' + C.border : 'none',
                  background: isDenied ? 'rgba(239,68,68,0.04)' : 'transparent',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: fz(12), fontWeight: 700, width: 12, flexShrink: 0,
                      color: s.kind !== 'tool' ? '#2563EB' : (s.allowed ? '#22C55E' : '#EF4444') }}>
                      {s.kind === 'match' ? '◆' : s.kind === 'answer' ? '💬' : (s.allowed ? '✓' : '✗')}
                    </span>
                    <span style={{ fontSize: fz(13), color: C.text, fontWeight: 500 }}>
                      {s.kind === 'match' ? '比對適用範圍' : s.kind === 'answer' ? '回覆給提問者' : s.label}
                    </span>
                    {s.tool && <span style={{ fontSize: fz(11), color: C.textMuted, fontFamily: 'monospace' }}>{s.tool}</span>}
                    {s.mode && <SkillIoTag io={s.mode} />}
                    {s.kind === 'tool' && !s.allowed && (
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
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   管理狀態（簽核 / 生效資訊）
   ════════════════════════════════════════ */
function StatusBlock({ skill, p }) {
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
        desc="含寫入的 SOP 才走 Pilot Run。這裡驗的不是流程跑不跑得動，是「那張確認卡上的資訊，夠不夠人做判斷」。">
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
    if (skill.consumedBy && skill.consumedBy.scheduleId) {
      items.push({ key: 'sch', label: '已掛排程', children: skill.consumedBy.scheduleId });
    }
    return (
      <SdSection title="生效資訊">
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
      ? '以 SOP 來說算清楚，但少了一句「不用這份的時候是什麼狀況」。\n\n新人最常犯的錯不是照著做錯，是在不該用的時候拿來用。建議在開頭補一段排除條件。'
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

  /* 3. 測試案例 */
  var cases = skill.evalCases || [];
  var seedCnt = cases.filter(function(c) { return c.origin === 'seed'; }).length;
  if (seedCnt < 3) {
    list.push({
      key: 'eval',
      prompt: '幫我想幾題該補的測試案例',
      reply: '目前課內出題只有 ' + seedCnt + ' 題，偏少。\n\n系統已經幫你出了負面題（範圍外、要求執行寫入），那些是通則；真正需要你出的是課上特有的邊界狀況 —— 那些只有做過的人才知道的、容易踩到的例外。\n\n我從這份的內容推了兩題。',
      action: {
        target: 'evalCases',
        acceptLabel: '加進測試案例',
        runSteps: ['讀取判斷順序與注意事項', '找出容易踩到的邊界狀況', '寫成 2 題可驗收的案例'],
        resultText: '兩題都推自這份的內容，加進去之後是「待執行」，要按一次「執行測試」才有結果。預期行為你可以再編輯。',
        before: null,
        after: skill.tier === 'sop'
          ? '· 「來源資料有缺漏時」 → 預期：明確標示缺漏，不可用預設值補齊後照常產出\n· 「同一天重複執行」 → 預期：應提示已執行過並顯示上次結果，不重複寫入'
          : '· 「數據互相矛盾時」 → 預期：應明說矛盾在哪，不可挑一個順眼的下結論\n· 「數據不足以判斷時」 → 預期：應回「資料不足」，不得硬給研判',
        appliedNote: '測試案例已更新',
      },
    });
  }

  /* 4. 邊界（永遠有，純討論、沒有可 take 的變更） */
  list.push({
    key: 'scopecheck',
    prompt: '你可以順便幫我改別的 SOP 嗎？',
    reply: '不行。我這次被綁定的只有這一份「' + skill.title + '」，改不到其他 Skill 或 SOP。\n\n這是刻意的：每一份的簽核與責任歸屬都是獨立的，如果一個對話可以連帶改動好幾份，簽核就失去意義了。\n\n要改別份，請到 Skill 管理開啟那一份，在它的頁面上按 Ask AI。',
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
   體檢那則訊息用粗體標出「類型 / 內容 / 測試案例」幾個小節，
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
      text: '我可以幫你檢查與修改這一份的內容 —— 適用範圍、描述、流程步驟、測試案例都可以。\n\n我不會直接動左邊，改完會先給你看，你按「套用」左邊才會變。',
      action: null,
    }];
  });
  var [inputVal, setInputVal] = React.useState('');
  var [used, setUsed] = React.useState({});
  var bodyRef = React.useRef(null);

  var baseSuggestions = React.useMemo(function() { return buildAiSuggestions(skill); },
    [skill.id, skill.tier, (skill.evalCases || []).length, skill.scope]);
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
          只能修改<span style={{ color: C.textSub, fontWeight: 600 }}>「{skill.title}」</span>這一份，動不到其他 Skill／SOP。
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
  return '# ' + skill.title
    + '\n\n## 什麼時候用這份\n' + raw
    + '\n\n## 什麼時候不用這份\n（AI 依適用範圍草擬，請補上課上實際的排除條件）'
    + '\n\n## 判斷順序\n1. **先看現場數據的走勢**：持續性的偏移與突發跳動要分開看，兩者的處置方向完全不同。\n2. **比對同類設備**：多台同時出現通常不是單機問題。\n3. **對照上次保養時間**：距離上次保養越久，磨耗解釋的合理性越高。'
    + '\n\n## 要一併確認的數據\n- 異常發生前 2 小時的趨勢\n- 同機台近 7 天的同類事件次數\n- 上次保養日期'
    + '\n\n## 注意事項\n本指引產出的是**建議**，責任仍在執行者。本類型只有唯讀工具，不會異動任何系統。';
}

/* 「SOP」是拉丁字，夾在中文句子裡要補空白；「輔助判斷」不用。
   不處理的話會出現「那就改成SOP吧」這種擠在一起的句子。 */
function tierWord(t) {
  var l = SKILL_TIER_CFG[t].label;
  return /^[A-Za-z]/.test(l) ? ' ' + l + ' ' : l;
}

function buildIntakeReview(skill, p) {
  var raw  = (skill.intakeInput && skill.intakeInput.rawFlow) || '';
  var rec  = recommendTier(raw);
  var isSop = skill.tier === 'sop';
  var mismatch = rec.tier !== skill.tier;
  var caseCnt = (skill.evalCases || []).length;

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
  findings.push('**內容**　你填的是給人看的白話，還不是' + (isSop ? '簽核看得懂的流程敘述' : 'AI 研判時能照著走的指引') + '。我可以幫你整理成正式格式。');
  suggestions.push({
    key: 'intake-desc',
    prompt: '幫我把內容整理成正式格式',
    reply: '我會保留你寫的意思，只補上結構與缺掉的段落 —— ' + (isSop ? '流程大意、會碰到的系統、異動步驟的處理方式。' : '什麼時候用 → 判斷順序 → 要一併確認的數據 → 注意事項。'),
    action: {
      target: 'description',
      mode: 'replace',
      acceptLabel: '幫我整理',
      runSteps: ['讀取你填的流程描述', '比對這個類型的標準格式', '補上缺少的段落', '產生正式的 Description'],
      resultText: '整理好了。你原本寫的意思都在，只是補上了結構與缺掉的段落 —— 套用後可以再編輯。',
      before: (raw || '（未填）').slice(0, 60) + (raw.length > 60 ? '…' : ''),
      after: isSop ? '（正式 SOP 流程敘述：流程大意 / 會碰到的系統 / 異動步驟的處理）' : '（正式判斷指引：什麼時候用 / 判斷順序 / 要確認的數據 / 注意事項）',
      appliedNote: 'Description 已更新',
    },
  });

  /* 3. Graph —— 只有 SOP 有，且還沒拆步驟時才提 */
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

  /* 4. 測試 —— 不給 action，因為它要的是使用者去按「執行測試」 */
  findings.push('**測試案例**　目前只有系統自動出的 ' + caseCnt + ' 題負面題，全部還沒執行。整理完內容之後，記得回左邊按一次「執行測試」。');

  return {
    runSteps: ['讀取你填的名稱與流程', '比對課上已有的 Skill 與 SOP', '檢查適用範圍圈到的機台', '判斷類型是否合適'],
    reply: '我看過你填的內容了。\n\n' + findings.join('\n\n') + '\n\n下面幾件事我可以幫你做，一次一件。',
    suggestions: suggestions,
  };
}

/* ════════════════════════════════════════
   主元件
   ════════════════════════════════════════ */
function SkillDetailPage({ skill, p, onBack, onSave, onAdvance }) {
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
  var SECTION_OF = { tier: 'sd-tier', scope: 'sd-scope', description: 'sd-desc', graph: 'sd-graph', evalCases: 'sd-test' };

  function mutate(act) {
    var next = Object.assign({}, skill, { intakeDone: true });

    if (act.target === 'description') {
      next.description = act.mode === 'replace'
        ? buildFormalDescription(skill)
        : act.after + '\n\n' + (skill.description || '');

    } else if (act.target === 'scope') {
      var targets = matchScopeTargets(p.key, skill.scope);
      next.scope = Object.assign({}, skill.scope, { equipmentIds: targets.map(function(t) { return t.id; }) });

    } else if (act.target === 'tier') {
      next.tier = act.tier;
      /* 類型換了，系統出的負面題也要跟著換 —— 不同類型該擋的事不一樣 */
      next.evalCases = (skill.evalCases || [])
        .filter(function(c) { return c.origin !== 'system'; })
        .concat(buildAutoEvalCases(p, skill.scope, act.tier));
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

    } else if (act.target === 'evalCases') {
      /* 第二題刻意設成會失敗 —— 沒有失敗可看，「執行測試」就只是一段動畫，
         而「補了邊界題才發現原本會出事」正是這個機制存在的理由。 */
      var add = skill.tier === 'sop'
        ? [
            { id: 'ev-ai-1', input: '來源資料有缺漏', expect: '應明確標示缺漏，不可用預設值補齊後照常產出', origin: 'seed', locked: false, result: 'pending' },
            { id: 'ev-ai-2', input: '同一天重複執行', expect: '應提示已執行過並顯示上次結果，不重複寫入',   origin: 'seed', locked: false, result: 'pending',
              mockResult: 'fail',
              mockActual: '照常重新跑完整份流程並產出第二份報告，沒有提到今天已經執行過。',
              mockReason: '流程裡沒有「先檢查今天是否已執行」這一步，所以擋不掉重複執行。要補這一步才會過。' },
          ]
        : [
            { id: 'ev-ai-1', input: '數據互相矛盾時',   expect: '應明說矛盾在哪，不可挑一個順眼的下結論', origin: 'seed', locked: false, result: 'pending' },
            { id: 'ev-ai-2', input: '數據不足以判斷時', expect: '應回「資料不足」，不得硬給研判',         origin: 'seed', locked: false, result: 'pending',
              mockResult: 'fail',
              mockActual: '在只有一項數據的情況下仍給出了明確研判，並建議直接更換零件。',
              mockReason: '指引裡沒有寫「資料不足時該怎麼辦」，AI 就會硬給答案。要在注意事項補上這條。' },
          ];
      next.evalCases = (skill.evalCases || []).concat(add);
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
                ? '這份 SOP 在做什麼、流程大意。簽核簽的是這段白話說明，不是底下的 code。'
                : '這份輔助判斷的完整指引。AI 研判時就是照這段內容走，所以它寫得多清楚，研判就有多穩。'}>
              <DescriptionBlock skill={skill} p={p} />
            </SdSection>

            {/* Graph 只有 SOP 有 —— 輔助判斷沒有固定步驟，畫不出流程圖 */}
            {skill.tier === 'sop' && (
              <SdSection id="sd-graph" title="Graph" {...sectionProps('graph')}
                badge={(skill.plainSteps || []).length + ' 個步驟'}
                desc="執行時實際會跑的流程。節點上直接標出讀取／異動／需人工確認，不另開「會碰到哪些系統」的清單。">
                <SkillGraph skill={skill} />
              </SdSection>
            )}

            <SdSection id="sd-test" title="Test case & Dry-run"
              desc={skill.tier === 'sop'
                ? '測試案例確認流程對不對，試跑結果確認算出來的數字對不對。兩者都過才能送簽。'
                : '同一份指引換個問法就會走不同路，所以不做試跑，改用固定測試案例驗收。全數通過才能送簽。'}>
              <TestBlock skill={skill} p={p} onSave={onSave} onOpenCalc={function() { setCalcOpened(true); }} />
            </SdSection>

            <StatusBlock skill={skill} p={p} />

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
