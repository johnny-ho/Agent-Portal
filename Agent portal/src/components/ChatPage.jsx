/* ════════════════════════════════════════
   CHAT PAGE

   2026-07-26 改版（PO 指定）：
     · 版面改成當代 AI 對話：沒有頭像、AI 回應不包氣泡、全寬純文字
     · 加入五種情境的腳本播放（見 data/chatScenarios.js），
       標題直接就是該情境的目標
     · 三態徽章保留但降級為回應下方一行細字 meta，不再是一顆大 Tag

   為什麼徽章不能省：工程師若分不出「照核准流程做」跟「照 AI 建議做」，
   每次採納都是在賭，他們會選擇不賭。這是採用率問題不是資訊架構問題。
   見 brain/concepts/agent-skill-tiering.md「兩種 user，兩種語言」
   ════════════════════════════════════════ */

const CHAT_ANSWER_MODE = {
  approved: {
    label: '依核准流程',
    note: '本回答直接引用課上已簽核的流程，照做即可。',
    color: '#2563EB',
  },
  guided: {
    label: 'AI 依指引研判',
    note: '本課沒有對應的標準流程，這是 AI 依課上的指引研判的建議，責任仍在執行者。',
    color: '#7C3AED',
  },
  general: {
    label: '一般回答',
    note: '沒有引用課上已核准的 Skill，僅為一般性說明或依知識文件的整理。',
    color: '#6B7280',
  },
};

function getAnswerMode(msg) {
  if (msg.mode) return msg.mode;
  if (msg.sop) return 'approved';
  if (msg.guidedBy) return 'guided';
  return 'general';
}

/* ── 極輕量 markdown：**粗體** 與段落。不引外部套件 ── */
function ChatText({ text }) {
  var { C, fz } = useTheme();
  var lines = (text || '').split('\n');
  return (
    <div style={{ fontSize: fz(15), color: C.text, lineHeight: 1.85 }}>
      {lines.map(function(line, i) {
        if (line.trim() === '') return <div key={i} style={{ height: 12 }} />;
        var parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <div key={i} style={{ marginBottom: 2 }}>
            {parts.map(function(seg, j) {
              if (/^\*\*[^*]+\*\*$/.test(seg)) {
                return <span key={j} style={{ fontWeight: 700 }}>{seg.slice(2, -2)}</span>;
              }
              return <React.Fragment key={j}>{seg}</React.Fragment>;
            })}
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════
   AnswerMeta — 回應下方的一行細字
   （原本是大 Tag，現在降級成 meta，不打斷閱讀）
   ════════════════════════════════════════ */
function AnswerMeta({ msg, onOpenSkill }) {
  var { C, fz } = useTheme();
  var mode = getAnswerMode(msg);
  var cfg  = CHAT_ANSWER_MODE[mode];
  var skill = msg.skill || (msg.sop ? { title: msg.sop } : null) || (msg.guidedBy ? { title: msg.guidedBy } : null);
  var knowledge = msg.knowledge || [];

  return (
    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <antd.Tooltip title={cfg.note}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'default' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
          <span style={{ fontSize: fz(11), color: cfg.color, fontWeight: 600 }}>{cfg.label}</span>
        </span>
      </antd.Tooltip>

      {skill && (
        <React.Fragment>
          <span style={{ fontSize: fz(11), color: C.textMuted }}>·</span>
          <span
            onClick={function() { onOpenSkill && onOpenSkill(skill); }}
            style={{ fontSize: fz(11), color: C.textMuted, cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: 3 }}
          >{skill.title}</span>
        </React.Fragment>
      )}

      {knowledge.map(function(k) {
        return (
          <React.Fragment key={k.id}>
            <span style={{ fontSize: fz(11), color: C.textMuted }}>·</span>
            <span style={{ fontSize: fz(11), color: C.textMuted }}>依《{k.title}》</span>
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════
   RunBlock — 執行過程 / 工具呼叫
   細行、灰字、不包框；「已拒絕」那一行用紅字，是全場最該被看見的一行
   ════════════════════════════════════════ */
const CHAT_RUN_STATUS = {
  ok:    { icon: '✓', color: '#22C55E' },
  pause: { icon: '⏸', color: '#F59E0B' },
  fail:  { icon: '✗', color: '#EF4444' },
  skip:  { icon: '—', color: '#9E9E9E' },
};

function RunBlock({ run }) {
  var { C, fz } = useTheme();
  if (!run) return null;
  return (
    <div style={{ marginTop: 16, marginBottom: 8, borderLeft: '2px solid ' + C.border, paddingLeft: 16 }}>
      <div style={{ fontSize: fz(11), color: C.textMuted, fontWeight: 600, marginBottom: 8, letterSpacing: '0.04em' }}>{run.title}</div>
      {(run.steps || []).map(function(s, i) {
        var st = CHAT_RUN_STATUS[s.status] || CHAT_RUN_STATUS.ok;
        var isBad = s.status === 'fail';
        return (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: fz(12), fontWeight: 700, color: st.color, width: 12, flexShrink: 0 }}>{st.icon}</span>
              {s.num != null && <span style={{ fontSize: fz(11), color: C.textMuted }}>步驟 {s.num}</span>}
              <span style={{ fontSize: fz(13), color: isBad ? '#EF4444' : C.textSub, fontWeight: 500 }}>{s.label}</span>
              {s.tool && <span style={{ fontSize: fz(11), color: C.textMuted, fontFamily: 'monospace' }}>{s.tool}</span>}
              {s.io && <SkillIoTag io={s.io} />}
            </div>
            {s.detail && (
              <div style={{ fontSize: fz(12), color: isBad ? '#EF4444' : C.textMuted, lineHeight: 1.7, paddingLeft: 20 }}>{s.detail}</div>
            )}
            {s.reason && (
              <div style={{ fontSize: fz(12), color: '#EF4444', lineHeight: 1.7, paddingLeft: 20 }}>原因：{s.reason}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════
   ResultCard — 成功 / 失敗的結果卡
   ════════════════════════════════════════ */
function ResultCard({ result }) {
  var { C, fz } = useTheme();
  if (!result) return null;
  var isErr = result.variant === 'error';
  var color = isErr ? '#EF4444' : '#22C55E';
  return (
    <div style={{
      marginTop: 16, borderRadius: 8, overflow: 'hidden',
      border: '1px solid ' + (isErr ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'),
      background: isErr ? 'rgba(239,68,68,0.04)' : 'rgba(34,197,94,0.04)',
    }}>
      <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: fz(13), fontWeight: 700, color: color }}>{isErr ? '✗' : '✓'}</span>
        <span style={{ fontSize: fz(14), fontWeight: 600, color: C.text }}>{result.title}</span>
      </div>
      {(result.lines || []).length > 0 && (
        <div style={{ padding: '0 16px 16px 32px' }}>
          {result.lines.map(function(l, i) {
            return <div key={i} style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.8 }}>{l}</div>;
          })}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   LinkList — 操作入口
   AI 不能代為執行時，至少要把人直接送到能做那件事的畫面
   ════════════════════════════════════════ */
function LinkList({ links }) {
  var { C, fz } = useTheme();
  if (!links || links.length === 0) return null;
  return (
    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {links.map(function(l, i) {
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', border: '1px solid ' + C.border, borderRadius: 8,
            background: C.bg, cursor: 'pointer',
          }}>
            <span style={{ fontSize: fz(12), color: '#2563EB', flexShrink: 0 }}>↗</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: fz(13), color: '#2563EB', fontWeight: 500 }}>{l.label}</div>
              {l.note && <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 2 }}>{l.note}</div>}
              <div style={{ fontSize: fz(11), color: C.textMuted, fontFamily: 'monospace', marginTop: 2, wordBreak: 'break-all' }}>{l.url}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════
   HitlSheet — 由下而上的選單
   人工介入的決策點。刻意不是 Modal：它是「流程停在這裡等你」，
   不是「跳出來打斷你」。
   ════════════════════════════════════════ */
function HitlSheet({ sheet, onPick, onDismiss }) {
  var { C, fz } = useTheme();
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onDismiss} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.32)' }} />
      <div style={{
        position: 'relative',
        background: C.bg, borderTop: '1px solid ' + C.border,
        borderTopLeftRadius: 16, borderTopRightRadius: 16,
        padding: '16px 24px 24px', maxHeight: '72%', overflowY: 'auto',
      }} className="scrollbar-thin">
        {/* 抓握條 */}
        <div style={{ width: 40, height: 4, borderRadius: 999, background: C.borderStrong, margin: '0 auto 16px' }} />

        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: fz(11), fontWeight: 700, color: '#F59E0B', letterSpacing: '0.04em' }}>⏸ 流程已暫停</span>
          </div>
          <div style={{ fontSize: fz(16), fontWeight: 600, color: C.text, marginBottom: 8 }}>{sheet.title}</div>
          <div style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.8, marginBottom: 16 }}>{sheet.desc}</div>

          {(sheet.context || []).length > 0 && (
            <div style={{ border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
              {sheet.context.map(function(c, i) {
                return (
                  <div key={i} style={{ display: 'flex', gap: 16, padding: '8px 16px', borderTop: i > 0 ? '1px solid ' + C.border : 'none', background: C.bgSub }}>
                    <span style={{ fontSize: fz(12), color: C.textMuted, width: 80, flexShrink: 0 }}>{c.label}</span>
                    <span style={{ fontSize: fz(13), color: C.text, lineHeight: 1.6 }}>{c.value}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sheet.options.map(function(o) {
              return (
                <button
                  key={o.key}
                  onClick={function() { onPick(o); }}
                  style={{
                    textAlign: 'left', cursor: 'pointer', width: '100%',
                    padding: '16px 16px', borderRadius: 8,
                    border: '1px solid ' + (o.primary ? '#2563EB' : C.border),
                    background: o.primary ? '#2563EB' : C.bg,
                    color: o.primary ? '#FFFFFF' : C.text,
                  }}
                >
                  <div style={{ fontSize: fz(14), fontWeight: 600, marginBottom: 4 }}>{o.label}</div>
                  <div style={{ fontSize: fz(12), lineHeight: 1.6, color: o.primary ? 'rgba(255,255,255,0.85)' : C.textMuted }}>{o.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Quick Prompts (新對話建議 prompt) ── */
var QUICK_PROMPTS = {
  equipment: [
    { icon: '🔧', label: '查換件 Skill',     text: '幫我查 E-101 換件 Skill 最新版本，並摘要關鍵步驟。' },
    { icon: '📋', label: '準備交班摘要',   text: '幫我根據本班課況準備交班摘要，包含 KPI 未達標、Unclose Case 與遺留事項。' },
    { icon: '⚡', label: '分析 FDC 異常',  text: '目前有 FDC 異常，請幫我整理可能根因與處理 Skill 步驟。' },
    { icon: '📊', label: '解讀 SPC 數據',  text: '幫我解讀 SPC 失控規則，說明 Nelson Rule 2 的判定條件與處置方式。' },
  ],
  process: [
    { icon: '📈', label: '分析良率異常',   text: '請幫我分析良率異常可能的根因，並列出需要確認的製程參數。' },
    { icon: '📋', label: '準備交班摘要',   text: '幫我根據本班課況準備交班摘要，包含 KPI 未達標與遺留待追蹤事項。' },
    { icon: '🧪', label: '查 Recipe Skill',  text: '幫我查詢 Recipe 變更的標準流程與 DCR 申請步驟。' },
    { icon: '📊', label: '解讀 SPC 失控',  text: '目前有 SPC 失控站點，請幫我整理處置流程與通報對象。' },
  ],
  mfg: [
    { icon: '🏗️', label: '查排程調整方案', text: '因停機影響產能，請幫我整理排程調整優先順序的考量因素。' },
    { icon: '📋', label: '準備交班摘要',   text: '幫我根據本班課況準備交班摘要，包含產能達成狀況與遺留工單。' },
    { icon: '🔄', label: '查 WIP 狀態',    text: '幫我整理目前在製品優先順序與交期風險評估。' },
    { icon: '📝', label: '起草協調說明',   text: '請幫我起草一份跨課協調說明，說明目前停機影響與需要支援的項目。' },
  ],
};

/* ════════════════════════════════════════
   MessageList — 訊息渲染
   AI：全寬純文字、無氣泡無框、無頭像
   User：右對齊淡底，不用藍底白字實心塊
   ════════════════════════════════════════ */
function MessageList({ messages, onOpenSkill, onAction, actionUsed }) {
  var { C, fz } = useTheme();
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
      {messages.map(function(msg, i) {
        if (msg.role === 'user') {
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'flex-end', marginTop: i === 0 ? 0 : 32, marginBottom: 8 }}>
              <div style={{
                maxWidth: '82%', padding: '12px 16px', borderRadius: 12,
                background: C.bgSub, border: '1px solid ' + C.border,
                fontSize: fz(15), color: C.text, lineHeight: 1.75, whiteSpace: 'pre-line',
              }}>{msg.text}</div>
            </div>
          );
        }
        return (
          <div key={i} style={{ marginTop: i === 0 ? 0 : 24, marginBottom: 8 }}>
            <ChatText text={msg.text} />
            <RunBlock run={msg.run} />
            <ResultCard result={msg.result} />
            <LinkList links={msg.links} />
            <AnswerMeta msg={msg} onOpenSkill={onOpenSkill} />

            {/* 行動按鈕（例如：把這件事列成任務） */}
            {msg.action && !actionUsed[i] && (
              <div style={{ marginTop: 16, padding: '8px 16px', border: '1px dashed ' + C.borderStrong, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: fz(13), color: C.text, fontWeight: 500 }}>{msg.action.label}</div>
                  {msg.action.desc && <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 2 }}>{msg.action.desc}</div>}
                </div>
                <antd.Space size={8}>
                  <antd.Button size="small" onClick={function() { onAction(i, null); }}>不用</antd.Button>
                  <antd.Button size="small" type="primary" onClick={function() { onAction(i, msg.action.outcome); }}>好</antd.Button>
                </antd.Space>
              </div>
            )}

            {/* 舊資料的貢獻知識動作 */}
            {msg.action == null && msg.actionLegacy === 'contribute' && (
              <antd.Space size={8} style={{ marginTop: 16 }}>
                <antd.Button size="small" type="primary">確認提交</antd.Button>
                <antd.Button size="small">略過</antd.Button>
              </antd.Space>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════
   主頁面
   ════════════════════════════════════════ */
function ChatPage({ p, aiDraft, clearAiDraft }) {
  var { C, fz } = useTheme();
  const hasDraft = !!(aiDraft && aiDraft.text);

  /* ── 對話來源：五個情境腳本 + 歷史對話 ── */
  function buildChats(persona) {
    var scenarios = getChatScenarios(persona.key).map(function(sc) {
      return {
        id: sc.id, title: sc.title, time: sc.time, goal: sc.goal,
        scenario: true, turns: sc.turns,
        messages: [], cursor: 0,
      };
    });
    var history = (persona.chats || []).map(function(c) {
      return {
        id: 'h-' + c.id, title: c.title, time: c.time,
        scenario: false,
        messages: (c.messages || []).map(function(m) {
          return Object.assign({}, m, { actionLegacy: m.action });
        }),
      };
    });
    return scenarios.concat(history);
  }

  const [chats, setChats]       = React.useState(function() { return buildChats(p); });
  const [activeId, setActiveId] = React.useState(hasDraft ? null : (getChatScenarios(p.key)[0] || {}).id || null);
  const [inputVal, setInputVal] = React.useState('');
  const [contextExpanded, setContextExpanded] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [hoveredChatId, setHoveredChatId] = React.useState(null);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [actionUsed, setActionUsed] = React.useState({});
  const [skillDrawer, setSkillDrawer] = React.useState(null);
  const scrollRef = React.useRef(null);

  /* persona 切換時重建 */
  React.useEffect(function() {
    var next = buildChats(p);
    setChats(next);
    setActiveId((next[0] || {}).id || null);
    setActionUsed({});
    setSheetOpen(false);
  }, [p.key]);

  const activeChat = chats.filter(function(c) { return c.id === activeId; })[0];
  const isNewChat = activeId === null;

  /* 捲到底 */
  React.useEffect(function() {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeChat && activeChat.messages.length, activeId]);

  /* ── 腳本播放 ──
     使用者按下「建議接話」→ 揭露那句 user turn，接著自動揭露後續 AI 回合，
     直到遇到需要操作的東西（sheet / action）或下一句又是使用者發言為止。 */
  function advanceScript(chatId) {
    setChats(function(prev) {
      return prev.map(function(c) {
        if (c.id !== chatId || !c.scenario) return c;
        var msgs = c.messages.slice();
        var cur  = c.cursor;
        var turns = c.turns;
        if (cur >= turns.length) return c;

        /* 第一句一定是 user */
        msgs.push(turns[cur]);
        cur += 1;

        /* 接著把連續的 AI 回合放出來，遇到需要操作的就停 */
        while (cur < turns.length && turns[cur].role === 'ai') {
          var t = turns[cur];
          msgs.push(t);
          cur += 1;
          if (t.sheet || t.action) break;
        }
        return Object.assign({}, c, { messages: msgs, cursor: cur });
      });
    });
  }

  /* 由下而上的選單：選完把 outcome 接上去，再繼續往下播 */
  function pickSheetOption(option) {
    setSheetOpen(false);
    setChats(function(prev) {
      return prev.map(function(c) {
        if (c.id !== activeId) return c;
        var msgs = c.messages.slice();
        /* 把已回答的 sheet 標記掉，避免重複開啟 */
        for (var k = msgs.length - 1; k >= 0; k--) {
          if (msgs[k].sheet) { msgs[k] = Object.assign({}, msgs[k], { sheet: null, sheetAnswered: option.label }); break; }
        }
        if (option.outcome) msgs.push(option.outcome);
        var cur = c.cursor;
        while (cur < c.turns.length && c.turns[cur].role === 'ai') {
          var t = c.turns[cur];
          msgs.push(t);
          cur += 1;
          if (t.sheet || t.action) break;
        }
        return Object.assign({}, c, { messages: msgs, cursor: cur });
      });
    });
  }

  /* 行動按鈕（建立任務等） */
  function handleAction(msgIndex, outcome) {
    setActionUsed(function(prev) { var n = Object.assign({}, prev); n[msgIndex] = true; return n; });
    if (!outcome) return;
    setChats(function(prev) {
      return prev.map(function(c) {
        if (c.id !== activeId) return c;
        return Object.assign({}, c, { messages: c.messages.concat([outcome]) });
      });
    });
  }

  function deleteChat(chatId) {
    setChats(function(prev) { return prev.filter(function(c) { return c.id !== chatId; }); });
    if (activeId === chatId) setActiveId(null);
  }

  function resetScenario(chatId) {
    setChats(function(prev) {
      return prev.map(function(c) {
        return c.id === chatId && c.scenario ? Object.assign({}, c, { messages: [], cursor: 0 }) : c;
      });
    });
    setActionUsed({});
    setSheetOpen(false);
  }

  /* 待處理的 sheet（腳本停在需要人工介入的那一刻） */
  var pendingSheet = null;
  if (activeChat && activeChat.messages.length > 0) {
    var last = activeChat.messages[activeChat.messages.length - 1];
    if (last.sheet) pendingSheet = last.sheet;
  }
  /* 需要人工介入時自動把選單升起來 */
  React.useEffect(function() {
    if (pendingSheet) setSheetOpen(true);
  }, [pendingSheet]);

  /* 下一句建議接話 */
  var nextTurn = null;
  if (activeChat && activeChat.scenario && activeChat.cursor < activeChat.turns.length) {
    var nt = activeChat.turns[activeChat.cursor];
    if (nt.role === 'user') nextTurn = nt;
  }

  /* ── 側欄分組 ── */
  const filteredChats = chats.filter(function(c) {
    if (!searchQuery.trim()) return true;
    return c.title.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1;
  });
  const groups = [
    { label: '情境展示', items: filteredChats.filter(function(c) { return c.scenario; }) },
    { label: '歷史對話', items: filteredChats.filter(function(c) { return !c.scenario; }) },
  ].filter(function(g) { return g.items.length > 0; });

  /* ── Skill 抽屜（點回應下方的來源） ── */
  function openSkillDrawer(skill) {
    var all = (p.knowledge && p.knowledge.sopManagement) || [];
    var found = all.filter(function(s) { return s.id === skill.id || s.title === skill.title; })[0];
    setSkillDrawer(found || { title: skill.title, missing: true });
  }

  const quickPrompts = QUICK_PROMPTS[p.key] || QUICK_PROMPTS.equipment;

  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0, background: C.bg, position: 'relative' }}>

      {/* ══ 側欄 ══ */}
      <div style={{ width: 240, borderRight: '1px solid ' + C.border, display: 'flex', flexDirection: 'column', flexShrink: 0, background: C.bgPanel }}>
        <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid ' + C.border }}>
          <antd.Button type="primary" block onClick={function() { setActiveId(null); if (clearAiDraft) clearAiDraft(); }}>+ 新對話</antd.Button>
        </div>
        <div style={{ padding: '8px 8px 0' }}>
          <antd.Input
            size="small" value={searchQuery}
            onChange={function(e) { setSearchQuery(e.target.value); }}
            allowClear aria-label="搜尋對話"
            prefix={<span style={{ color: C.textMuted, fontSize: fz(12) }}>🔍</span>}
            placeholder="對話標題"
          />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }} className="scrollbar-thin">
          {groups.length === 0 && (
            <antd.Empty image={antd.Empty.PRESENTED_IMAGE_SIMPLE} style={{ marginBlock: 16 }}
              description={<span style={{ fontSize: fz(12), color: C.textMuted }}>{searchQuery ? '找不到符合的對話' : '尚無對話記錄'}</span>} />
          )}
          {groups.map(function(g) {
            return (
              <div key={g.label}>
                <div style={{ fontSize: fz(11), fontWeight: 500, color: C.textMuted, padding: '8px 4px 4px', letterSpacing: '0.06em' }}>{g.label}</div>
                {g.items.map(function(chat) {
                  var isActive = activeId === chat.id;
                  var isHovered = hoveredChatId === chat.id;
                  var started = chat.scenario && chat.messages.length > 0;
                  return (
                    <div key={chat.id} style={{ position: 'relative', marginBottom: 4 }}
                      onMouseEnter={function() { setHoveredChatId(chat.id); }}
                      onMouseLeave={function() { setHoveredChatId(null); }}
                    >
                      <button
                        onClick={function() { setActiveId(chat.id); setActionUsed({}); }}
                        style={{
                          width: '100%', textAlign: 'left', cursor: 'pointer',
                          padding: '8px 8px', borderRadius: 6,
                          background: isActive ? C.bg : 'transparent',
                          border: '1px solid ' + (isActive ? C.border : 'transparent'),
                          paddingRight: isHovered ? 32 : 8,
                        }}
                      >
                        <div style={{
                          fontSize: fz(12), fontWeight: isActive ? 600 : 400,
                          color: isActive ? C.text : C.textSub, lineHeight: 1.5,
                        }}>{chat.title}</div>
                        {chat.scenario && (
                          <div style={{ fontSize: fz(10), color: C.textMuted, marginTop: 2 }}>
                            {started ? '進行中 · 點右側可重播' : '未開始'}
                          </div>
                        )}
                      </button>
                      {isHovered && (
                        <div style={{ position: 'absolute', right: 4, top: 6 }}>
                          {chat.scenario
                            ? <antd.Tooltip title="重播這個情境">
                                <antd.Button size="small" type="text" style={{ color: C.textMuted, background: C.bg }}
                                  onClick={function(e) { e.stopPropagation(); resetScenario(chat.id); }}>↺</antd.Button>
                              </antd.Tooltip>
                            : <antd.Popconfirm title="刪除此對話？" okText="刪除" cancelText="取消" okButtonProps={{ danger: true }}
                                onConfirm={function() { deleteChat(chat.id); }}>
                                <antd.Button size="small" type="text" danger style={{ background: C.bg }}
                                  onClick={function(e) { e.stopPropagation(); }}>✕</antd.Button>
                              </antd.Popconfirm>
                          }
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ 主區 ══ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: C.bg, position: 'relative' }}>

        {/* 標題列：情境對話的標題就是它要演的目標 */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: fz(14), color: C.text }}>
              {isNewChat ? '新對話' : (activeChat ? activeChat.title : '')}
            </div>
            <div style={{ fontSize: fz(12), color: C.textMuted }}>
              {isNewChat
                ? (hasDraft ? ('已帶入 context：' + aiDraft.label) : '輸入問題開始對話')
                : (activeChat ? (activeChat.goal || (activeChat.time + ' · 個人對話')) : '')}
            </div>
          </div>
          {activeChat && activeChat.scenario && activeChat.messages.length > 0 && (
            <antd.Button size="small" onClick={function() { resetScenario(activeChat.id); }}>↺ 重播</antd.Button>
          )}
        </div>

        {/* 訊息區 */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '32px 0' }} className="scrollbar-thin">
          {isNewChat ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: '0 24px' }}>
              <div style={{ fontSize: fz(24), color: C.textSub }}>✦</div>
              <div style={{ fontSize: fz(18), fontWeight: 600, color: C.text }}>有什麼可以幫你？</div>
              <div style={{ fontSize: fz(13), color: C.textMuted, textAlign: 'center', maxWidth: 480, lineHeight: 1.7 }}>
                {hasDraft
                  ? ('已帶入「' + aiDraft.label + '」作為參考，直接輸入問題即可')
                  : '左側「情境展示」有五段可以直接點著走的對話，示範 AI 在不同狀況下能做什麼、不能做什麼'}
              </div>
              {!hasDraft && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxWidth: 480, width: '100%', marginTop: 8 }}>
                  {quickPrompts.map(function(qp, i) {
                    return (
                      <antd.Card key={i} size="small" hoverable
                        onClick={function() { setInputVal(qp.text); }}
                        styles={{ body: { padding: 16, display: 'flex', alignItems: 'flex-start', gap: 8 } }}
                      >
                        <span style={{ fontSize: fz(16), flexShrink: 0 }}>{qp.icon}</span>
                        <span style={{ fontSize: fz(12), fontWeight: 500, color: C.textSub, lineHeight: 1.4 }}>{qp.label}</span>
                      </antd.Card>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeChat && activeChat.messages.length > 0 ? (
            <MessageList
              messages={activeChat.messages}
              onOpenSkill={openSkillDrawer}
              onAction={handleAction}
              actionUsed={actionUsed}
            />
          ) : activeChat && activeChat.scenario ? (
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
              <div style={{ fontSize: fz(16), fontWeight: 600, color: C.text, marginBottom: 8 }}>{activeChat.title}</div>
              <div style={{ fontSize: fz(13), color: C.textMuted, lineHeight: 1.8, marginBottom: 24 }}>{activeChat.goal}</div>
              <div style={{ fontSize: fz(12), color: C.textMuted }}>點下方的建議接話開始</div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <antd.Empty description={<span style={{ fontSize: fz(14), color: C.textMuted }}>選擇一則對話查看內容</span>} />
            </div>
          )}
        </div>

        {/* 底部：context / 建議接話 / 輸入 */}
        <div style={{ padding: '8px 24px 24px', flexShrink: 0 }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>

            {hasDraft && (
              <antd.Alert
                type="info" closable
                onClose={function() { clearAiDraft && clearAiDraft(); }}
                style={{ marginBottom: 8 }}
                message={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                    onClick={function() { setContextExpanded(function(v) { return !v; }); }}>
                    <span style={{ fontSize: fz(11), color: '#2563EB', fontWeight: 700, letterSpacing: '0.04em' }}>✦ CONTEXT 已載入</span>
                    <span style={{ fontSize: fz(12), color: C.textSub, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{aiDraft.label}</span>
                    <span style={{ fontSize: fz(10), color: C.textMuted }}>{contextExpanded ? '▲' : '▼'}</span>
                  </div>
                }
                description={contextExpanded ? (
                  <div style={{ fontSize: fz(12), color: C.textSub, lineHeight: 1.7, fontFamily: 'monospace', whiteSpace: 'pre-wrap', maxHeight: 120, overflowY: 'auto' }} className="scrollbar-thin">{aiDraft.text}</div>
                ) : null}
              />
            )}

            {/* 建議接話：腳本的下一句由使用者按了才推進 */}
            {nextTurn && !pendingSheet && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: fz(11), color: C.textMuted, marginBottom: 4 }}>建議接話</div>
                <button
                  onClick={function() { advanceScript(activeChat.id); }}
                  style={{
                    width: '100%', textAlign: 'left', cursor: 'pointer',
                    padding: '12px 16px', borderRadius: 12,
                    border: '1px solid ' + C.borderStrong, background: C.bgSub,
                    fontSize: fz(14), color: C.textSub, lineHeight: 1.7,
                  }}
                >{nextTurn.text}</button>
              </div>
            )}

            {/* 流程停下等人時，把入口留著 */}
            {pendingSheet && !sheetOpen && (
              <div style={{ marginBottom: 8 }}>
                <antd.Button block type="primary" onClick={function() { setSheetOpen(true); }}>
                  ⏸ 流程等你決定 — 開啟選單
                </antd.Button>
              </div>
            )}

            {/* 輸入列 */}
            <div style={{ background: C.bg, border: '1px solid ' + C.borderStrong, borderRadius: 12, display: 'flex', alignItems: 'flex-end', gap: 8, padding: '8px 8px 8px 16px' }}>
              <antd.Input.TextArea
                variant="borderless"
                value={inputVal}
                autoSize={{ minRows: 1, maxRows: 6 }}
                onChange={function(e) { setInputVal(e.target.value); }}
                onPressEnter={function(e) { e.preventDefault(); setInputVal(''); if (clearAiDraft) clearAiDraft(); }}
                aria-label="輸入訊息"
                placeholder={activeChat && activeChat.scenario ? '這是情境展示，請用上方的建議接話推進…' : '輸入訊息…'}
                style={{ flex: 1, padding: 0, fontSize: fz(15), resize: 'none' }}
              />
              <antd.Button type="primary" shape="circle" disabled={!inputVal.trim()}
                onClick={function() { setInputVal(''); if (clearAiDraft) clearAiDraft(); }}>↑</antd.Button>
            </div>
            <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 8, textAlign: 'center' }}>
              AI 的回答可能有誤，涉及設備動作前請自行確認。
            </div>
          </div>
        </div>

        {/* 由下而上的選單 */}
        {pendingSheet && sheetOpen && (
          <HitlSheet sheet={pendingSheet} onPick={pickSheetOption} onDismiss={function() { setSheetOpen(false); }} />
        )}
      </div>

      {/* ══ Skill 抽屜：點回應下方的來源會開 ══ */}
      {skillDrawer && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <antd.Drawer
            open onClose={function() { setSkillDrawer(null); }}
            getContainer={false} width={400}
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {skillDrawer.tier && <SkillTierTag tier={skillDrawer.tier} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: fz(13), fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{skillDrawer.title}</div>
                  <div style={{ fontSize: fz(11), color: C.textMuted, fontWeight: 400 }}>
                    {skillDrawer.missing ? '此內容不在本課的 Skill 清單' : (skillDrawer.stage === 'production' ? '已生效' : '尚未生效')}
                  </div>
                </div>
              </div>
            }
            styles={{ body: { padding: 16 } }}
          >
            {skillDrawer.missing ? (
              <div style={{ fontSize: fz(13), color: C.textMuted, lineHeight: 1.8 }}>
                這次回答引用的內容不在本課的 Skill 清單裡，可能來自知識文件或一般說明。
              </div>
            ) : (
              <React.Fragment>
                <div style={{ fontSize: fz(14), color: C.text, lineHeight: 1.8, marginBottom: 16 }}>{skillDrawer.purpose}</div>
                <div style={{ border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                  {describeScope(skillDrawer.scope).map(function(row, i) {
                    return (
                      <div key={row.label} style={{ display: 'flex', gap: 8, padding: '8px 16px', borderTop: i > 0 ? '1px solid ' + C.border : 'none' }}>
                        <span style={{ fontSize: fz(11), color: C.textMuted, width: 64, flexShrink: 0 }}>{row.label}</span>
                        <span style={{ fontSize: fz(12), color: C.text, lineHeight: 1.6 }}>{row.value}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.9, whiteSpace: 'pre-line' }}>
                  {(skillDrawer.description || '').replace(/\*\*/g, '').replace(/^#+\s/gm, '')}
                </div>
              </React.Fragment>
            )}
          </antd.Drawer>
        </div>
      )}
    </div>
  );
}
