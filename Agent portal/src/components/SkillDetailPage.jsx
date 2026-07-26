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
  var cases  = skill.evalCases || [];
  var passed = cases.filter(function(c) { return c.result === 'pass'; }).length;
  if (cases.length === 0) return '尚未建立測試案例，無法送簽';
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
   ════════════════════════════════════════ */
function SdSection({ id, title, desc, badge, extra, children }) {
  var { C, fz } = useTheme();
  return (
    <div id={id} style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: desc ? 4 : 16 }}>
        <span style={{ fontSize: fz(14), fontWeight: 700, color: C.text, letterSpacing: '0.01em' }}>{title}</span>
        {badge && (
          <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), background: C.bgPanel, color: C.textMuted }}>{badge}</antd.Tag>
        )}
        <div style={{ flex: 1 }} />
        {extra}
      </div>
      {desc && <div style={{ fontSize: fz(12), color: C.textMuted, lineHeight: 1.6, marginBottom: 16 }}>{desc}</div>}
      {children}
    </div>
  );
}

/* ════════════════════════════════════════
   AI 建議變更的橫幅 — 落在對應區塊上方
   Ask AI 不是又一個聊天框，它改的東西要回寫到主欄才有意義
   ════════════════════════════════════════ */
function ProposalBanner({ proposal, onAccept, onReject }) {
  var { C, fz } = useTheme();
  if (!proposal) return null;
  return (
    <div style={{
      marginBottom: 16, borderRadius: 8, overflow: 'hidden',
      border: '1px solid rgba(124,58,237,0.35)', background: 'rgba(124,58,237,0.05)',
    }}>
      <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: fz(11), fontWeight: 700, color: '#7C3AED', letterSpacing: '0.04em' }}>✦ AI 建議變更</span>
        <span style={{ fontSize: fz(13), color: C.text, fontWeight: 500, flex: 1, minWidth: 0 }}>{proposal.title}</span>
        <antd.Space size={8}>
          <antd.Button size="small" onClick={onReject}>捨棄</antd.Button>
          <antd.Button size="small" type="primary" onClick={onAccept}>採用</antd.Button>
        </antd.Space>
      </div>
      {proposal.summary && (
        <div style={{ padding: '0 16px 8px', fontSize: fz(12), color: C.textSub, lineHeight: 1.7 }}>{proposal.summary}</div>
      )}
      {(proposal.before || proposal.after) && (
        <div style={{ borderTop: '1px solid rgba(124,58,237,0.2)' }}>
          {proposal.before && (
            <div style={{ padding: '8px 16px', fontSize: fz(12), color: C.textMuted, lineHeight: 1.7, background: 'rgba(239,68,68,0.05)', whiteSpace: 'pre-wrap' }}>
              <span style={{ fontWeight: 700, marginRight: 8 }}>−</span>{proposal.before}
            </div>
          )}
          {proposal.after && (
            <div style={{ padding: '8px 16px', fontSize: fz(12), color: C.textSub, lineHeight: 1.7, background: 'rgba(34,197,94,0.06)', whiteSpace: 'pre-wrap' }}>
              <span style={{ fontWeight: 700, marginRight: 8 }}>＋</span>{proposal.after}
            </div>
          )}
        </div>
      )}
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
function ScopeBlock({ skill, p }) {
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
   ════════════════════════════════════════ */
function TestBlock({ skill, onOpenCalc }) {
  var { C, fz } = useTheme();
  var cases   = skill.evalCases || [];
  var passCnt = cases.filter(function(c) { return c.result === 'pass'; }).length;
  var allPass = cases.length > 0 && passCnt === cases.length;
  var dr = skill.dryRun;

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>測試案例</span>
        <antd.Tag bordered={false} style={{
          marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), fontWeight: 600,
          color: allPass ? '#22C55E' : '#F97316',
          background: allPass ? 'rgba(34,197,94,0.08)' : 'rgba(249,115,22,0.08)',
        }}>{passCnt} / {cases.length} 通過</antd.Tag>
        <div style={{ flex: 1 }} />
        <antd.Button size="small" type="dashed">＋ 新增測試案例</antd.Button>
      </div>
      <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 16, lineHeight: 1.6 }}>
        標了 🔒 的是系統依適用範圍與類型自動出的負面題，不可刪除 —— 人會寫「該做什麼」，不會想到寫「不該做什麼」，而不該做的才是會出事的。
      </div>
      <antd.List
        bordered size="small" dataSource={cases}
        locale={{ emptyText: <span style={{ fontSize: fz(13), color: C.textMuted }}>尚無測試案例</span> }}
        renderItem={function(c) {
          var isPass = c.result === 'pass';
          return (
            <antd.List.Item style={{ alignItems: 'flex-start', gap: 8 }}>
              <antd.Tag bordered={false} style={{
                marginInlineEnd: 0, borderRadius: 999, flexShrink: 0, fontSize: fz(11), fontWeight: 700,
                color: isPass ? '#22C55E' : '#F97316',
                background: isPass ? 'rgba(34,197,94,0.08)' : 'rgba(249,115,22,0.08)',
              }}>{isPass ? 'PASS' : 'FAIL'}</antd.Tag>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: fz(14), color: C.text, fontWeight: 500, marginBottom: 4 }}>「{c.input}」</div>
                <div style={{ fontSize: fz(12), color: C.textSub, lineHeight: 1.6 }}>預期：{c.expect}</div>
              </div>
              {c.origin === 'system'
                ? <antd.Tooltip title="系統依適用範圍與類型自動出題，不可刪除">
                    <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, flexShrink: 0, fontSize: fz(11), color: C.textMuted, background: C.bgPanel }}>🔒 系統出題</antd.Tag>
                  </antd.Tooltip>
                : <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, flexShrink: 0, fontSize: fz(11), color: C.textMuted, background: C.bgPanel }}>課內出題</antd.Tag>
              }
            </antd.List.Item>
          );
        }}
      />

      {/* Dry run（僅 SOP 有） */}
      {dr && (
        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>試跑結果</span>
            <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), background: C.bgPanel, color: C.textMuted }}>{dr.ranAt}</antd.Tag>
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
   AskAiPanel — 修正這一份 Skill 的 agent

   刻意的邊界：只能改當前這一份，不可跨 Skill／SOP。
   它給的修改會回寫到主欄對應區塊，等你採用或捨棄 ——
   不然它就只是又一個聊天框。
   ════════════════════════════════════════ */
function buildAiSuggestions(skill) {
  var list = [];

  /* 1. 適用範圍太寬 */
  var sc = skill.scope || {};
  if (!sc.equipmentIds || sc.equipmentIds.length === 0) {
    list.push({
      key: 'scope',
      prompt: '這份的適用範圍會不會太寬？',
      reply: '「指定機台」目前留空，代表' + ((sc.equipmentClass && sc.equipmentClass.length) ? sc.equipmentClass.join('、') + ' 類別下的全部機台' : '全部機台') + '都會命中。\n\n範圍越寬，命中不該命中的情境的機會就越高 —— 這在廠內不是體驗問題而是安全問題。如果實際上只有幾台會用到，建議明確勾出來。\n\n我可以幫你把範圍收窄到目前實際有在跑的那幾台。',
      proposal: {
        target: 'scope',
        title: '把「指定機台」從留空收窄為明確清單',
        summary: '留空等於該類別全部；明確列出之後，不在清單上的機台會直接被擋在候選池外，連問都不會問到這一份。',
        before: '指定機台：（留空 = 該類別全部）',
        after:  '指定機台：依課上實際使用紀錄勾選',
      },
    });
  }

  /* 2. 描述可讀性 */
  list.push({
    key: 'desc',
    prompt: '描述寫得夠讓新人看懂嗎？',
    reply: skill.tier === 'sop'
      ? '以 SOP 來說算清楚，但少了一句「不用這份的時候是什麼狀況」。\n\n新人最常犯的錯不是照著做錯，是在不該用的時候拿來用。建議在開頭補一段排除條件。'
      : '結構是對的（什麼時候用 → 判斷順序 → 要確認的數據 → 注意事項），但「判斷順序」那幾條可以更明確地說明為什麼是這個順序。\n\n順序背後的理由講清楚，人才知道遇到例外時可以怎麼調整；只給順序，遇到不符的狀況就只能卡住。',
    proposal: {
      target: 'description',
      title: '在開頭補一段「什麼時候不用這份」',
      summary: '把排除條件寫在最前面，避免被套用在不該用的情境。',
      before: null,
      after: '## 什麼時候不用這份\n（AI 依適用範圍與類型草擬，採用後可再編輯）',
    },
  });

  /* 3. 測試案例 */
  var cases = skill.evalCases || [];
  var seedCnt = cases.filter(function(c) { return c.origin === 'seed'; }).length;
  if (seedCnt < 3) {
    list.push({
      key: 'eval',
      prompt: '幫我想幾題該補的測試案例',
      reply: '目前課內出題只有 ' + seedCnt + ' 題，偏少。\n\n系統已經幫你出了負面題（範圍外、要求執行寫入），那些是通則；真正需要你出的是**課上特有的邊界狀況** —— 那些只有做過的人才知道的、容易踩到的例外。\n\n我從這份的內容推了兩題，你看看合不合理。',
      proposal: {
        target: 'evalCases',
        title: '新增 2 題課內邊界測試案例',
        summary: '推自這份的判斷順序與注意事項，採用後可再編輯預期行為。',
        before: null,
        after: skill.tier === 'sop'
          ? '· 「來源資料有缺漏時」 → 預期：明確標示缺漏，不可用預設值補齊後照常產出\n· 「同一天重複執行」 → 預期：應提示已執行過並顯示上次結果，不重複寫入'
          : '· 「數據互相矛盾時」 → 預期：應明說矛盾在哪，不可挑一個順眼的下結論\n· 「數據不足以判斷時」 → 預期：應回「資料不足」，不得硬給研判',
      },
    });
  }

  /* 4. 邊界（永遠有） */
  list.push({
    key: 'scopecheck',
    prompt: '你可以順便幫我改別的 SOP 嗎？',
    reply: '不行。我這次被綁定的只有這一份「' + skill.title + '」，改不到其他 Skill 或 SOP。\n\n這是刻意的：每一份的簽核與責任歸屬都是獨立的，如果一個對話可以連帶改動好幾份，簽核就失去意義了。\n\n要改別份，請到 Skill 管理開啟那一份，在它的頁面上按 Ask AI。',
    proposal: null,
  });

  return list;
}

function AskAiPanel({ skill, onClose, onProposal, activeProposal }) {
  var { C, fz } = useTheme();
  var [messages, setMessages] = React.useState([
    {
      role: 'ai',
      text: '我可以幫你檢查與修改這一份的內容 —— 適用範圍、描述、流程步驟、測試案例都可以。\n\n改動會標在左邊對應的區塊上，你按「採用」才會生效。',
    },
  ]);
  var [inputVal, setInputVal] = React.useState('');
  var suggestions = React.useMemo(function() { return buildAiSuggestions(skill); }, [skill.id, (skill.evalCases || []).length, skill.scope]);
  var [used, setUsed] = React.useState({});
  var bodyRef = React.useRef(null);

  React.useEffect(function() {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages.length]);

  function ask(s) {
    setUsed(function(prev) { var n = Object.assign({}, prev); n[s.key] = true; return n; });
    setMessages(function(prev) {
      return prev.concat([{ role: 'user', text: s.prompt }, { role: 'ai', text: s.reply, hasProposal: !!s.proposal }]);
    });
    if (s.proposal) onProposal(Object.assign({ id: s.key }, s.proposal));
  }

  function sendFree() {
    var v = inputVal.trim();
    if (!v) return;
    setInputVal('');
    setMessages(function(prev) {
      return prev.concat([
        { role: 'user', text: v },
        { role: 'ai', text: '這是原型，自由輸入還沒接上模型。你可以用下面的建議問題看完整的修改流程 —— 那幾題會真的產生可採用的變更。' },
      ]);
    });
  }

  var remaining = suggestions.filter(function(s) { return !used[s.key]; });

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
        {messages.map(function(m, i) {
          if (m.role === 'user') {
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <div style={{
                  maxWidth: '86%', padding: '8px 16px', borderRadius: 8,
                  background: C.bgSub, border: '1px solid ' + C.border,
                  fontSize: fz(13), color: C.text, lineHeight: 1.7, whiteSpace: 'pre-line',
                }}>{m.text}</div>
              </div>
            );
          }
          return (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.8, whiteSpace: 'pre-line' }}>{m.text}</div>
              {m.hasProposal && (
                <div style={{ marginTop: 8, fontSize: fz(11), color: '#7C3AED', fontWeight: 600 }}>
                  ← 建議的變更已標在左邊，請採用或捨棄
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 建議問題 */}
      {remaining.length > 0 && (
        <div style={{ padding: '8px 16px', borderTop: '1px solid ' + C.border, display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          {remaining.slice(0, 3).map(function(s) {
            return (
              <antd.Button key={s.key} size="small" block
                onClick={function() { ask(s); }}
                disabled={!!activeProposal}
                style={{ textAlign: 'left', height: 'auto', padding: '8px 8px', whiteSpace: 'normal', fontSize: fz(12), color: C.textSub }}
              >{s.prompt}</antd.Button>
            );
          })}
          {activeProposal && (
            <div style={{ fontSize: fz(11), color: C.textMuted, lineHeight: 1.6 }}>
              先處理左邊那筆建議變更（採用或捨棄），再繼續問下一題。
            </div>
          )}
        </div>
      )}

      {/* 輸入 */}
      <div style={{ padding: '8px 16px 16px', borderTop: '1px solid ' + C.border, flexShrink: 0 }}>
        <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px' }}>
          <antd.Input
            variant="borderless" value={inputVal}
            onChange={function(e) { setInputVal(e.target.value); }}
            onPressEnter={sendFree}
            aria-label="向 AI 描述你想改的地方"
            placeholder="描述你想改的地方…"
            style={{ flex: 1, padding: 0, fontSize: fz(13) }}
          />
          <antd.Button type="primary" shape="circle" size="small" disabled={!inputVal.trim()} onClick={sendFree}>↑</antd.Button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   主元件
   ════════════════════════════════════════ */
function SkillDetailPage({ skill, p, onBack, onSave, onAdvance }) {
  var { C, fz } = useTheme();
  var [calcOpened, setCalcOpened] = React.useState(false);
  var [askOpen, setAskOpen]       = React.useState(false);
  var [proposal, setProposal]     = React.useState(null);
  var [toast, setToast]           = React.useState(null);

  var gate   = getSignoffGate(skill, calcOpened);
  var action = getSignoffAction(skill.stage);
  var tierCfg = SKILL_TIER_CFG[skill.tier] || SKILL_TIER_CFG.guided;

  function acceptProposal() {
    var next = Object.assign({}, skill);
    if (proposal.target === 'description') {
      next.description = proposal.after + '\n\n' + (skill.description || '');
    } else if (proposal.target === 'scope') {
      var targets = matchScopeTargets(p.key, skill.scope);
      next.scope = Object.assign({}, skill.scope, { equipmentIds: targets.map(function(t) { return t.id; }) });
    } else if (proposal.target === 'evalCases') {
      var add = skill.tier === 'sop'
        ? [
            { id: 'ev-ai-1', input: '來源資料有缺漏', expect: '應明確標示缺漏，不可用預設值補齊後照常產出', origin: 'seed', locked: false, result: 'pending' },
            { id: 'ev-ai-2', input: '同一天重複執行', expect: '應提示已執行過並顯示上次結果，不重複寫入',   origin: 'seed', locked: false, result: 'pending' },
          ]
        : [
            { id: 'ev-ai-1', input: '數據互相矛盾時',   expect: '應明說矛盾在哪，不可挑一個順眼的下結論', origin: 'seed', locked: false, result: 'pending' },
            { id: 'ev-ai-2', input: '數據不足以判斷時', expect: '應回「資料不足」，不得硬給研判',         origin: 'seed', locked: false, result: 'pending' },
          ];
      next.evalCases = (skill.evalCases || []).concat(add);
    }
    onSave(next);
    setProposal(null);
    setToast('已採用 AI 的建議變更');
  }

  React.useEffect(function() {
    if (!toast) return;
    var t = setTimeout(function() { setToast(null); }, 2400);
    return function() { clearTimeout(t); };
  }, [toast]);

  function bannerFor(target) {
    if (!proposal || proposal.target !== target) return null;
    return <ProposalBanner proposal={proposal} onAccept={acceptProposal} onReject={function() { setProposal(null); }} />;
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
            <div style={{
              marginBottom: 32, padding: 16, borderRadius: 8,
              background: tierCfg.bg, border: '1px solid ' + tierCfg.border,
            }}>
              <div style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.7 }}>{tierCfg.detail}</div>
            </div>

            <SdSection id="sd-scope" title="Scope" desc="用途與適用範圍。範圍是勾出來的結構化條件，不是自由文字 —— 所以系統算得出「目前符合幾台」，也擋得掉不該命中的機台。">
              {bannerFor('scope')}
              <ScopeBlock skill={skill} p={p} />
            </SdSection>

            <SdSection id="sd-desc" title="Description"
              desc={skill.tier === 'sop'
                ? '這份 SOP 在做什麼、流程大意。簽核簽的是這段白話說明，不是底下的 code。'
                : '這份輔助判斷的完整指引。AI 研判時就是照這段內容走，所以它寫得多清楚，研判就有多穩。'}>
              {bannerFor('description')}
              <DescriptionBlock skill={skill} p={p} />
            </SdSection>

            {/* Graph 只有 SOP 有 —— 輔助判斷沒有固定步驟，畫不出流程圖 */}
            {skill.tier === 'sop' && (
              <SdSection id="sd-graph" title="Graph"
                badge={(skill.plainSteps || []).length + ' 個步驟'}
                desc="執行時實際會跑的流程。節點上直接標出讀取／異動／需人工確認，不另開「會碰到哪些系統」的清單。">
                <SkillGraph skill={skill} />
              </SdSection>
            )}

            <SdSection id="sd-test" title="Test case & Dry-run"
              desc={skill.tier === 'sop'
                ? '測試案例確認流程對不對，試跑結果確認算出來的數字對不對。兩者都過才能送簽。'
                : '同一份指引換個問法就會走不同路，所以不做試跑，改用固定測試案例驗收。全數通過才能送簽。'}>
              {bannerFor('evalCases')}
              <TestBlock skill={skill} onOpenCalc={function() { setCalcOpened(true); }} />
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
            activeProposal={proposal}
            onProposal={setProposal}
            onClose={function() { setAskOpen(false); setProposal(null); }}
          />
        )}
      </div>
    </div>
  );
}
