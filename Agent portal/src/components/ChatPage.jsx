/* ════════════════════════════════════════
   CHAT PAGE

   2026-07-26 第一輪（PO 指定）：
     · 當代 AI 對話版面：沒有頭像、AI 回應不包氣泡、全寬純文字
     · 五種情境的腳本播放（見 data/chatScenarios.js）

   2026-07-26 第二輪（PO 指定）：
     · 互動模態收斂成兩種 —— 對話式（建議接話）＋ 決策卡
     · 決策卡從全寬 overlay 改成對話流裡的卡片，加數字鍵與兩個出口
     · 對話流瘦身，明細移到右側執行面板
     · 步驟逐步播放

   2026-07-26 第三輪（PO 指定，本次）：
     · 決策卡選完會留下「✓ 已選擇：…」，回顧得到當時做了什麼決定
     · 操作按鈕只留在最後一則；對話往下走就收起，改由右側「這次的產出」承接
       （避免「按了會從哪裡執行、要不要帶後面的 context」的歧義）
     · 執行面板改兩層：任務清單 → 展開看步驟，**支援同一則對話跑多份 SOP**
     · 砍掉讀取／判斷／計算／會異動四顆 tag 與工具識別碼
     · 砍掉每則的三態徽章 —— PO：「能執行就表示系統中有核准的 SOP」。
       ⚠️ 代價：「這不是核准流程、責任在你」的告知責任，從 UI 轉移到
       回應文字本身。接真實 LLM 時這是 system prompt 的硬要求，
       見 brain/entities/modules/ai-chat.md 的 F-AI-01 驗收條件。

   2026-07-26 第四輪（PO 指定，本次）：
     · 「這次的產出」只收真的做出來的東西 —— 失敗不是產出
     · 產物名稱本身就是連結，右側 ↗ 表示會另開分頁；不再另外掛一顆按鈕
     · 展開收合的箭頭原本 10px 藏在左邊，改成跟標題同字級、擺在右側
   ════════════════════════════════════════ */

/* 步驟播放速度（毫秒）：一步跑完的體感時間 / 兩個 AI 回合之間的停頓 */
const CHAT_STEP_MS = 700;
const CHAT_TURN_MS = 450;

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
   RunBlock — SOP 執行進度（對話流版）
   只有「狀態圖示 ＋ 步驟 N ＋ 步驟名」。明細一律在右側面板。
   ════════════════════════════════════════ */
const CHAT_RUN_STATUS = {
  ok:      { icon: '✓', color: '#22C55E' },
  pause:   { icon: '⏸', color: '#F59E0B' },
  fail:    { icon: '✗', color: '#EF4444' },
  skip:    { icon: '—', color: '#9E9E9E' },
  running: { icon: '◍', color: '#2563EB' },
};

function RunBlock({ run, visible, inFlightIndex }) {
  var { C, fz } = useTheme();
  if (!run) return null;
  var steps = run.steps || [];
  var count = visible == null ? steps.length : Math.min(visible, steps.length);

  return (
    <div style={{ marginTop: 16, marginBottom: 8, borderLeft: '2px solid ' + C.border, paddingLeft: 16 }}>
      <div style={{ fontSize: fz(11), color: C.textMuted, fontWeight: 600, marginBottom: 8, letterSpacing: '0.04em' }}>{run.title}</div>
      {steps.slice(0, count).map(function(s, i) {
        var isInFlight = i === inFlightIndex;
        var st = isInFlight ? CHAT_RUN_STATUS.running : (CHAT_RUN_STATUS[s.status] || CHAT_RUN_STATUS.ok);
        var isBad = !isInFlight && s.status === 'fail';
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <span
              className={isInFlight ? 'pulse-dot' : ''}
              style={{ fontSize: fz(12), fontWeight: 700, color: st.color, width: 12, flexShrink: 0 }}
            >{st.icon}</span>
            {s.num != null && <span style={{ fontSize: fz(11), color: C.textMuted, flexShrink: 0 }}>步驟 {s.num}</span>}
            <span style={{ fontSize: fz(13), color: isBad ? '#EF4444' : C.textSub, fontWeight: 500 }}>{s.label}</span>
            {isBad && <span style={{ fontSize: fz(12), color: '#EF4444' }}>· 失敗</span>}
          </div>
        );
      })}
    </div>
  );
}

/* ── 被 Tool Gateway 擋下的寫入請求：值班的人只需要知道「AI 真的去試了，被擋下來」 ── */
function BlockedNote({ blocked }) {
  var { fz } = useTheme();
  if (!blocked) return null;
  return (
    <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: fz(12), flexShrink: 0 }}>🚫</span>
      <span style={{ fontSize: fz(12), color: '#EF4444', lineHeight: 1.7 }}>
        已嘗試{blocked.label}，被系統擋下
      </span>
    </div>
  );
}

/* ── 成功 / 失敗的結果卡 ── */
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
   LinkButtons — 操作入口
   2026-07-26 三輪：**只在最後一則顯示**。對話一往下走就收起，
   避免「這顆還能按嗎？按了會帶哪段 context？」的歧義。
   入口不會消失 —— 它永久落在右側面板的「這次的產出」。
   ════════════════════════════════════════ */
function LinkButtons({ links }) {
  if (!links || links.length === 0) return null;
  return (
    <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {links.map(function(l, i) {
        return <antd.Button key={i} size="small">{l.label}</antd.Button>;
      })}
    </div>
  );
}

/* ── 決策卡選完留下的痕跡：回顧時要看得出當時做了什麼決定 ── */
function DecisionEcho({ label }) {
  var { C, fz } = useTheme();
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '8px 16px', borderRadius: 8,
        border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.06)',
      }}>
        <span style={{ fontSize: fz(12), fontWeight: 700, color: '#22C55E' }}>✓</span>
        <span style={{ fontSize: fz(13), color: C.text }}>已選擇：{label}</span>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   DecisionCard — 決策卡（唯一的「彈窗型」互動）
   只給「會異動系統且流程卡住」的時刻出現，所以它有份量。
   不遮罩：上面那些已完成的步驟與查到的數據，正是做決定要看的東西。

   兩個出口（對到 Claude 的 Type something else / Skip）：
     · 我有其他指示… → 收合成 chip，游標進輸入框
     · 稍後再決定     → 收合成 chip，不動輸入框
   ════════════════════════════════════════ */
function DecisionCard({ sheet, stepNum, onPick, onOther, onDefer }) {
  var { C, fz } = useTheme();
  var options = (sheet.options || []).concat([
    { key: '__other', label: '我有其他指示…', desc: '用下方輸入框告訴我要怎麼做', other: true },
  ]);

  /* 數字鍵：半夜三點、時限在跑，手不必離開鍵盤 */
  React.useEffect(function() {
    function onKey(e) {
      var tag = (e.target && e.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      var idx = parseInt(e.key, 10) - 1;
      if (isNaN(idx) || idx < 0 || idx >= options.length) return;
      e.preventDefault();
      var o = options[idx];
      if (o.other) onOther(); else onPick(o);
    }
    window.addEventListener('keydown', onKey);
    return function() { window.removeEventListener('keydown', onKey); };
  }, [sheet, options.length]);

  return (
    <div className="fade-in" style={{
      marginTop: 16, borderRadius: 8,
      border: '1px solid ' + C.border, borderLeft: '3px solid #F59E0B',
      background: C.bg, padding: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: fz(11), fontWeight: 700, color: '#F59E0B', letterSpacing: '0.04em' }}>
          ⏸ 流程已暫停{stepNum != null ? ' · 步驟 ' + stepNum : ''}
        </span>
        <div style={{ flex: 1 }} />
        <antd.Button size="small" type="text" style={{ color: C.textMuted, fontSize: fz(12) }} onClick={onDefer}>
          稍後再決定
        </antd.Button>
      </div>

      <div style={{ fontSize: fz(16), fontWeight: 600, color: C.text, marginBottom: 8 }}>{sheet.title}</div>
      <div style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.75, marginBottom: 16 }}>{sheet.desc}</div>

      {(sheet.context || []).length > 0 && (
        <div style={{ border: '1px solid ' + C.border, borderRadius: 8, padding: '8px 16px', marginBottom: 16, background: C.bgSub }}>
          {sheet.context.map(function(c, i) {
            return (
              <div key={i} style={{ display: 'flex', gap: 16, padding: '4px 0' }}>
                <span style={{ fontSize: fz(12), color: C.textMuted, width: 72, flexShrink: 0 }}>{c.label}</span>
                <span style={{ fontSize: fz(12), color: C.text, lineHeight: 1.6 }}>{c.value}</span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {options.map(function(o, i) {
          var isPrimary = !!o.primary;
          return (
            <button
              key={o.key}
              onClick={function() { if (o.other) onOther(); else onPick(o); }}
              style={{
                textAlign: 'left', cursor: 'pointer', width: '100%',
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '8px 16px', borderRadius: 8, minHeight: 56,
                border: '1px solid ' + (isPrimary ? '#2563EB' : C.border),
                background: isPrimary ? '#2563EB' : C.bg,
                color: isPrimary ? '#FFFFFF' : C.text,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: fz(14), fontWeight: 600, marginBottom: 2 }}>{o.label}</div>
                <div style={{ fontSize: fz(12), lineHeight: 1.6, color: isPrimary ? 'rgba(255,255,255,0.85)' : C.textMuted }}>{o.desc}</div>
              </div>
              <span style={{
                flexShrink: 0, width: 24, height: 24, borderRadius: 6,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: fz(11), fontWeight: 600,
                border: '1px solid ' + (isPrimary ? 'rgba(255,255,255,0.4)' : C.border),
                color: isPrimary ? 'rgba(255,255,255,0.85)' : C.textMuted,
              }}>{i + 1}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── 決策卡收合後留在輸入框上方的 chip：流程沒有消失，只是先讓路 ── */
function PendingChip({ stepNum, label, onExpand }) {
  var { C, fz } = useTheme();
  return (
    <div
      onClick={onExpand}
      style={{
        marginBottom: 8, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 16px', borderRadius: 8,
        border: '1px solid rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.06)',
      }}
    >
      <span style={{ fontSize: fz(12), color: '#F59E0B', fontWeight: 700 }}>⏸</span>
      <span style={{ fontSize: fz(12), color: C.text, flex: 1, minWidth: 0 }}>
        {stepNum != null ? '步驟 ' + stepNum + ' ' : ''}等待確認中{label ? ' · ' + label : ''}
      </span>
      <span style={{ fontSize: fz(11), color: '#F59E0B', fontWeight: 600 }}>展開</span>
    </div>
  );
}

/* ════════════════════════════════════════
   執行面板的資料推導

   計畫來源＝那份已核准 SOP 的 plainSteps（personas.js）。
   這是我們跟一般 agent 最大的差別：計畫不是 AI 邊跑邊生的，
   執行前就知道總共幾步、哪幾步需要人確認。

   2026-07-26 三輪：改成**多段**。同一則對話可能連續呼叫好幾份 SOP，
   以 skill.id 變化切段，每段是右側面板第一層的一個「任務」。
   ════════════════════════════════════════ */
const CHAT_PLAN_STATUS = {
  todo:    { icon: '○', color: '#9E9E9E' },
  running: { icon: '◍', color: '#2563EB' },
  ok:      { icon: '✓', color: '#22C55E' },
  pause:   { icon: '⏸', color: '#F59E0B' },
  fail:    { icon: '✗', color: '#EF4444' },
  skip:    { icon: '—', color: '#9E9E9E' },
  branch:  { icon: '⤳', color: '#9E9E9E' },
};

const CHAT_SEG_STATUS = {
  running: { label: '執行中',   color: '#2563EB', icon: '◍' },
  pause:   { label: '等你決定', color: '#F59E0B', icon: '⏸' },
  fail:    { label: '失敗',     color: '#EF4444', icon: '✗' },
  done:    { label: '已完成',   color: '#22C55E', icon: '✓' },
};

/* 條件分支的名字：從 SOP 的 graph 找那條「跳過中間步驟」且兩端都跑過的邊 */
function findBranchLabel(graph, byNum) {
  if (!graph || !graph.edges) return null;
  var hit = graph.edges.filter(function(e) {
    return typeof e.from === 'number' && typeof e.to === 'number'
      && e.to > e.from + 1 && e.label && byNum[e.from] && byNum[e.to];
  })[0];
  return hit ? hit.label : null;
}

function buildRunSegments(chat, sopList, stepShown, playing) {
  if (!chat) return [];
  var msgs = chat.messages || [];
  var raw = [];
  var cur = null;

  msgs.forEach(function(m, idx) {
    /* 換了一份 SOP＝開一段新任務 */
    if (m.skill && m.skill.tier === 'sop') {
      if (!cur || cur.skillId !== m.skill.id) {
        var sop = (sopList || []).filter(function(s) { return s.id === m.skill.id; })[0];
        cur = (sop && sop.plainSteps)
          ? { skillId: m.skill.id, sop: sop, exec: {}, maxNum: 0, inFlight: null }
          : null;
        if (cur) raw.push(cur);
      }
    }
    if (!cur) return;

    var steps = (m.run && m.run.steps) || [];
    var isLast = idx === msgs.length - 1;
    var limit = (isLast && playing) ? Math.min(stepShown, steps.length) : steps.length;
    for (var i = 0; i < limit; i++) {
      var s = steps[i];
      if (s.num == null) continue;
      cur.exec[s.num] = s;
      if (s.num > cur.maxNum) cur.maxNum = s.num;
    }
    /* 正在跑的那一步 */
    if (isLast && playing && stepShown < steps.length && steps[stepShown].num != null) {
      cur.inFlight = steps[stepShown].num;
      if (cur.inFlight > cur.maxNum) cur.maxNum = cur.inFlight;
    }
  });

  return raw.map(function(seg, i) {
    var branchLabel = findBranchLabel(seg.sop.graph, seg.exec);
    var steps = seg.sop.plainSteps.map(function(ps) {
      var hit = seg.exec[ps.num];
      var status;
      if (ps.num === seg.inFlight) status = 'running';
      else if (hit) status = hit.status || 'ok';
      else if (ps.num < seg.maxNum) status = 'branch';
      else status = 'todo';
      return Object.assign({}, ps, {
        status: status,
        /* 明細一律不顯示，只有失敗要看得見原因 */
        failDetail: status === 'fail' && hit ? hit.detail : null,
        failReason: status === 'fail' && hit ? hit.reason : null,
        branchLabel: status === 'branch' ? branchLabel : null,
      });
    });

    var segStatus = 'running';
    if (steps.filter(function(s) { return s.status === 'fail'; })[0]) segStatus = 'fail';
    else if (steps.filter(function(s) { return s.status === 'pause'; })[0]) segStatus = 'pause';
    else if (seg.inFlight != null) segStatus = 'running';
    else if (!steps.filter(function(s) { return s.status === 'todo'; })[0]) segStatus = 'done';

    return {
      key: seg.skillId + '#' + i,
      sop: seg.sop,
      steps: steps,
      at: seg.maxNum,
      total: steps.length,
      status: segStatus,
      pauseStep: steps.filter(function(s) { return s.status === 'pause'; })[0] || null,
    };
  });
}

/* 這次的產出
   **只收真的做出來的東西**。失敗不是產出（「工單未開立」放在這裡只會讓人困惑），
   它的位置在「執行任務」那一步的紅字與對話流的結果卡。
   入口跟著它自己那則訊息的產物走，不跨則收集 —— 這樣「手動開單／回報失效」
   這種「你自己去做」的入口就不會混進產出清單。 */
function collectOutputs(messages) {
  var items = [];
  messages.forEach(function(m) {
    if (!m.result || m.result.variant === 'error') return;
    items.push({ title: m.result.title, links: m.links || [] });
  });
  return items;
}

/* 這次用到的：只給 Skill／SOP 標題與知識文件，詳情點進去看 */
function collectUsed(messages) {
  var skills = [], knowledge = [], blocked = [];
  messages.forEach(function(m) {
    if (m.skill && !skills.filter(function(x) { return x.id === m.skill.id; })[0]) skills.push(m.skill);
    (m.knowledge || []).forEach(function(k) {
      if (!knowledge.filter(function(x) { return x.id === k.id; })[0]) knowledge.push(k);
    });
    if (m.blocked) blocked.push(m.blocked);
  });
  return { skills: skills, knowledge: knowledge, blocked: blocked };
}

function formatElapsed(sec) {
  var m = Math.floor(sec / 60), s = sec % 60;
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}

/* ════════════════════════════════════════
   SkillPeekModal — 從面板點 Skill／SOP 進來看詳情
   只給「有人想看」的場景，不做 Graph / Signoff / Ask AI，
   那些在 Setting 的 Skill 管理全頁裡。
   ════════════════════════════════════════ */
function SkillPeekModal({ skill, sopList, onClose }) {
  var { C, fz } = useTheme();
  var full = (sopList || []).filter(function(s) { return s.id === skill.id; })[0];

  return (
    <antd.Modal
      open onCancel={onClose} footer={null} width={640}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SkillTierTag tier={skill.tier || (full && full.tier)} />
          <span style={{ fontSize: fz(14), fontWeight: 600, color: C.text }}>{skill.title}</span>
          {full && (
            <span style={{ fontSize: fz(11), color: C.textMuted, fontWeight: 400 }}>
              {full.stage === 'production' ? '已生效' : (full.stage === 'pirun' ? 'Pilot Run' : '尚未生效')}
            </span>
          )}
        </div>
      }
    >
      {!full ? (
        <div style={{ fontSize: fz(13), color: C.textMuted, lineHeight: 1.8 }}>
          這次引用的內容不在本課的 Skill 清單裡，可能來自知識文件或一般說明。
        </div>
      ) : (
        <React.Fragment>
          <div style={{ fontSize: fz(14), color: C.text, lineHeight: 1.8, marginBottom: 16 }}>{full.purpose}</div>

          <div style={{ border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
            {describeScope(full.scope).map(function(row, i) {
              return (
                <div key={row.label} style={{ display: 'flex', gap: 16, padding: '8px 16px', borderTop: i > 0 ? '1px solid ' + C.border : 'none' }}>
                  <span style={{ fontSize: fz(12), color: C.textMuted, width: 72, flexShrink: 0 }}>{row.label}</span>
                  <span style={{ fontSize: fz(13), color: C.text, lineHeight: 1.6 }}>{row.value}</span>
                </div>
              );
            })}
          </div>

          {(full.plainSteps || []).length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: fz(11), fontWeight: 600, color: C.textMuted, letterSpacing: '0.06em', marginBottom: 8 }}>步驟</div>
              {full.plainSteps.map(function(s) {
                return (
                  <div key={s.num} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: fz(12), color: C.textMuted, width: 16, flexShrink: 0 }}>{s.num}.</span>
                    <span style={{ fontSize: fz(13), color: C.text, lineHeight: 1.6 }}>{s.label}</span>
                    {s.needsConfirm && <span style={{ fontSize: fz(11), color: '#F59E0B', flexShrink: 0 }}>需人工確認</span>}
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.9, whiteSpace: 'pre-line' }}>
            {(full.description || '').replace(/\*\*/g, '').replace(/^#+\s/gm, '')}
          </div>
        </React.Fragment>
      )}
    </antd.Modal>
  );
}

/* ── 面板的可收合區塊 ──
   2026-07-26 四輪：箭頭原本是 10px 擺在標題左邊，PO 反映「完全沒發現他是
   一個可以展開收合的功能」。改成跟標題同一個字級、緊跟在標題右側（對齊
   Cowork 的 `Progress ⌄` 寫法），標題也從 11px 細字提到 13px。 ── */
function PanelGroup({ title, defaultOpen, children }) {
  var { C, fz } = useTheme();
  var [open, setOpen] = React.useState(defaultOpen !== false);
  return (
    <div style={{ borderTop: '1px solid ' + C.border }}>
      <button
        onClick={function() { setOpen(function(v) { return !v; }); }}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          padding: '12px 16px', background: 'transparent', border: 'none', textAlign: 'left',
        }}
      >
        <span style={{ fontSize: fz(13), fontWeight: 600, color: C.textSub }}>{title}</span>
        <span style={{ fontSize: fz(13), color: C.textMuted, lineHeight: 1 }}>{open ? '⌃' : '⌄'}</span>
        <span style={{ flex: 1 }} />
      </button>
      {open && <div style={{ padding: '0 16px 16px' }}>{children}</div>}
    </div>
  );
}

/* ── 產出項：產物名稱本身就是連結，右側外開 icon 表示會另開分頁 ── */
function OutputLink({ label, onOpen }) {
  var { C, fz } = useTheme();
  return (
    <button
      onClick={onOpen}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
        padding: '4px 0', background: 'transparent', border: 'none', textAlign: 'left',
      }}
    >
      <span style={{ fontSize: fz(12), fontWeight: 700, color: '#22C55E', width: 12, flexShrink: 0 }}>✓</span>
      <span style={{ flex: 1, minWidth: 0, fontSize: fz(12), color: '#2563EB', lineHeight: 1.6, textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: 3 }}>{label}</span>
      <span style={{ fontSize: fz(12), color: '#2563EB', flexShrink: 0 }}>↗</span>
    </button>
  );
}

/* ════════════════════════════════════════
   RunPanel — 右側執行面板
   第一層：這則對話跑過的每一份 SOP（任務）
   第二層：展開看步驟
   使用者只在意兩件事 —— 執行了什麼、執行到哪。
   ════════════════════════════════════════ */
function RunPanel({ segments, outputs, used, elapsed, onClose, onGoDecision, onPeekSkill }) {
  var { C, fz } = useTheme();
  var [expanded, setExpanded] = React.useState({});
  var hasAnything = segments.length > 0 || outputs.length > 0
    || used.skills.length > 0 || used.knowledge.length > 0 || used.blocked.length > 0;

  function isOpen(seg, i) {
    if (expanded[seg.key] !== undefined) return expanded[seg.key];
    return i === segments.length - 1;   /* 預設只展開最後一段 */
  }

  return (
    <div style={{
      width: 320, flexShrink: 0, borderLeft: '1px solid ' + C.border,
      background: C.bgPanel, display: 'flex', flexDirection: 'column', minHeight: 0,
    }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div style={{ fontSize: fz(13), fontWeight: 600, color: C.text, flex: 1 }}>執行面板</div>
        <antd.Button size="small" type="text" style={{ color: C.textMuted }} onClick={onClose} aria-label="關閉執行面板">✕</antd.Button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }} className="scrollbar-thin">
        {!hasAnything && (
          <div style={{ padding: 16, fontSize: fz(12), color: C.textMuted, lineHeight: 1.8 }}>
            這則對話還沒有執行紀錄。呼叫 SOP 時，這裡會列出完整的執行計畫。
          </div>
        )}

        {/* ── 第一層：任務清單 ── */}
        {segments.length > 0 && (
          <PanelGroup title="執行任務">
            {segments.map(function(seg, i) {
              var open = isOpen(seg, i);
              var st = CHAT_SEG_STATUS[seg.status];
              var live = seg.status === 'running' || seg.status === 'pause';
              return (
                <div key={seg.key} style={{ marginBottom: 8 }}>
                  <button
                    onClick={function() {
                      setExpanded(function(prev) {
                        var n = Object.assign({}, prev); n[seg.key] = !open; return n;
                      });
                    }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer',
                      padding: '8px 8px', borderRadius: 6, textAlign: 'left',
                      background: open ? C.bg : 'transparent',
                      border: '1px solid ' + (open ? C.border : 'transparent'),
                    }}
                  >
                    <span
                      className={seg.status === 'running' ? 'pulse-dot' : ''}
                      style={{ fontSize: fz(12), fontWeight: 700, color: st.color, width: 12, flexShrink: 0, lineHeight: 1.6 }}
                    >{st.icon}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: fz(12), fontWeight: 600, color: C.text, lineHeight: 1.6 }}>{seg.sop.title}</span>
                      <span style={{ display: 'block', fontSize: fz(11), color: st.color, marginTop: 2 }}>
                        {st.label} · {seg.at}/{seg.total}
                        {live ? ' · ' + formatElapsed(elapsed) : ''}
                      </span>
                    </span>
                    <span style={{ fontSize: fz(12), color: C.textMuted, flexShrink: 0, lineHeight: 1.6 }}>{open ? '⌃' : '⌄'}</span>
                  </button>

                  {/* ── 第二層：步驟 ── */}
                  {open && (
                    <div style={{ paddingLeft: 24, paddingTop: 8 }}>
                      {seg.steps.map(function(s) {
                        var ss = CHAT_PLAN_STATUS[s.status] || CHAT_PLAN_STATUS.todo;
                        var dim = s.status === 'todo' || s.status === 'branch' || s.status === 'skip';
                        return (
                          <div key={s.num} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <span
                              className={s.status === 'running' ? 'pulse-dot' : ''}
                              style={{ fontSize: fz(12), fontWeight: 700, color: ss.color, width: 12, flexShrink: 0, lineHeight: 1.6 }}
                            >{ss.icon}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: fz(12), color: dim ? C.textMuted : C.text, lineHeight: 1.6 }}>
                                {s.num}. {s.label}
                              </div>

                              {/* 已經停在這裡等人 */}
                              {s.status === 'pause' && (
                                <React.Fragment>
                                  <div style={{ fontSize: fz(11), color: '#F59E0B', marginTop: 2 }}>等待確認中…</div>
                                  <antd.Button size="small" type="primary" style={{ marginTop: 8 }} onClick={onGoDecision}>去決定</antd.Button>
                                </React.Fragment>
                              )}
                              {/* 還沒跑到，但跑到時會停 —— 不確定性要在開始前消掉 */}
                              {s.status === 'todo' && s.needsConfirm && (
                                <div style={{ fontSize: fz(11), color: '#F59E0B', marginTop: 2 }}>需人工確認</div>
                              )}
                              {s.status === 'branch' && (
                                <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 2 }}>
                                  本次不走{s.branchLabel ? '（' + s.branchLabel + '）' : ''}
                                </div>
                              )}
                              {s.failDetail && (
                                <div style={{ fontSize: fz(11), color: '#EF4444', lineHeight: 1.7, marginTop: 2 }}>{s.failDetail}</div>
                              )}
                              {s.failReason && (
                                <div style={{ fontSize: fz(11), color: '#EF4444', lineHeight: 1.7, marginTop: 2 }}>{s.failReason}</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </PanelGroup>
        )}

        {/* ── 這次的產出：產物名稱本身就是連結，右側 ↗ 表示另開分頁 ── */}
        {outputs.length > 0 && (
          <PanelGroup title="這次的產出">
            {outputs.map(function(o, i) {
              var main = o.links[0];
              return (
                <React.Fragment key={i}>
                  {main
                    ? <OutputLink label={o.title} onOpen={function() {}} />
                    : (
                      <div style={{ display: 'flex', gap: 8, padding: '4px 0' }}>
                        <span style={{ fontSize: fz(12), fontWeight: 700, color: '#22C55E', width: 12, flexShrink: 0 }}>✓</span>
                        <span style={{ fontSize: fz(12), color: C.text, lineHeight: 1.6 }}>{o.title}</span>
                      </div>
                    )}
                  {/* 同一個產物若有第二個入口，各自一行 */}
                  {o.links.slice(1).map(function(l, j) {
                    return <OutputLink key={j} label={l.label} onOpen={function() {}} />;
                  })}
                </React.Fragment>
              );
            })}
          </PanelGroup>
        )}

        {/* ── 這次用到的：只給標題，詳情點進去 ── */}
        {(used.skills.length > 0 || used.knowledge.length > 0 || used.blocked.length > 0) && (
          <PanelGroup title="這次用到的" defaultOpen={false}>
            {used.skills.map(function(s) {
              return (
                <button
                  key={s.id}
                  onClick={function() { onPeekSkill(s); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                    padding: '8px 8px', marginBottom: 4, borderRadius: 6, textAlign: 'left',
                    background: 'transparent', border: '1px solid ' + C.border,
                  }}
                >
                  <SkillTierTag tier={s.tier} size="small" />
                  <span style={{ flex: 1, minWidth: 0, fontSize: fz(12), color: C.text, lineHeight: 1.5 }}>{s.title}</span>
                  <span style={{ fontSize: fz(12), color: C.textMuted, flexShrink: 0 }}>›</span>
                </button>
              );
            })}

            {used.knowledge.map(function(k) {
              return (
                <div key={k.id} style={{ fontSize: fz(12), color: C.textSub, lineHeight: 1.9, padding: '0 8px' }}>《{k.title}》</div>
              );
            })}

            {used.blocked.map(function(b, i) {
              return (
                <div key={i} style={{ fontSize: fz(12), color: '#EF4444', lineHeight: 1.9, padding: '0 8px' }}>
                  🚫 {b.label} · 已擋下
                </div>
              );
            })}
          </PanelGroup>
        )}
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
   AI：全寬純文字、無氣泡無框、無頭像、無徽章
   User：右對齊淡底
   ════════════════════════════════════════ */
function MessageList({ messages, stepShown, playing }) {
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
        var isLast = i === messages.length - 1;
        var live = isLast && playing;
        var total = (msg.run && msg.run.steps && msg.run.steps.length) || 0;
        return (
          <div key={i} style={{ marginTop: i === 0 ? 0 : 24, marginBottom: 8 }}>
            <ChatText text={msg.text} />
            <RunBlock
              run={msg.run}
              visible={live ? Math.min(stepShown + 1, total) : total}
              inFlightIndex={live && stepShown < total ? stepShown : -1}
            />
            <BlockedNote blocked={msg.blocked} />
            <ResultCard result={msg.result} />
            {/* 操作入口只留在最後一則，往下走就交給右側面板 */}
            {isLast && <LinkButtons links={msg.links} />}
            {msg.sheetAnswered && <DecisionEcho label={msg.sheetAnswered} />}
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

  /* ── 對話來源：情境腳本 + 歷史對話 ── */
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
        messages: (c.messages || []).slice(),
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
  const scrollRef = React.useRef(null);
  const inputRef  = React.useRef(null);

  /* ── 逐步播放 ──
     playing：腳本正在自己往下跑
     stepShown：最後一則訊息裡「已經跑完」的步驟數（第 stepShown 步正在跑） */
  const [playing, setPlaying]     = React.useState(false);
  const [stepShown, setStepShown] = React.useState(999);

  /* ── 決策卡與執行面板 ── */
  const [sheetCollapsed, setSheetCollapsed] = React.useState(false);
  const [panelOpen, setPanelOpen]           = React.useState(false);
  const [panelDismissed, setPanelDismissed] = React.useState({});
  const [elapsed, setElapsed]               = React.useState(0);
  const [peekSkill, setPeekSkill]           = React.useState(null);

  const activeChat = chats.filter(function(c) { return c.id === activeId; })[0];
  const isNewChat = activeId === null;

  /* persona 切換時重建 */
  React.useEffect(function() {
    var next = buildChats(p);
    setChats(next);
    setActiveId((next[0] || {}).id || null);
    setPlaying(false);
    setStepShown(999);
    setSheetCollapsed(false);
    setPanelOpen(false);
    setPanelDismissed({});
    setElapsed(0);
    setPeekSkill(null);
  }, [p.key]);

  /* ── 待決策的卡：掃全部訊息（使用者可能在暫停時先問了別的）── */
  var pendingSheet = null;
  if (activeChat) {
    for (var si = activeChat.messages.length - 1; si >= 0; si--) {
      if (activeChat.messages[si].sheet) { pendingSheet = activeChat.messages[si].sheet; break; }
    }
  }

  /* ── 執行面板資料 ── */
  const sopList  = (p.knowledge && p.knowledge.sopManagement) || [];
  const segments = activeChat ? buildRunSegments(activeChat, sopList, stepShown, playing) : [];
  const outputs  = collectOutputs((activeChat && activeChat.messages) || []);
  const used     = collectUsed((activeChat && activeChat.messages) || []);
  const pauseSeg = segments.filter(function(s) { return s.pauseStep; })[0] || null;
  const pauseStepNum   = pauseSeg ? pauseSeg.pauseStep.num : null;
  const pauseStepLabel = pauseSeg ? pauseSeg.pauseStep.label : null;
  const hasPlan = segments.length > 0;

  /* 偵測到 SOP 執行就自動把面板打開；使用者關過之後，同一則對話不再自動開 */
  React.useEffect(function() {
    if (hasPlan && activeId && !panelDismissed[activeId]) setPanelOpen(true);
  }, [hasPlan, activeId]);

  function closePanel() {
    setPanelOpen(false);
    if (activeId) setPanelDismissed(function(prev) {
      var n = Object.assign({}, prev); n[activeId] = true; return n;
    });
  }
  function togglePanel() {
    if (panelOpen) closePanel();
    else {
      setPanelOpen(true);
      if (activeId) setPanelDismissed(function(prev) {
        var n = Object.assign({}, prev); delete n[activeId]; return n;
      });
    }
  }

  /* 計時：只在真的在跑、或流程停下等人的時候走
     —— 這兩個時刻才是「分秒必爭」的時刻 */
  React.useEffect(function() {
    if (!hasPlan || (!playing && !pendingSheet)) return;
    var t = setInterval(function() { setElapsed(function(v) { return v + 1; }); }, 1000);
    return function() { clearInterval(t); };
  }, [hasPlan, playing, !!pendingSheet]);

  /* 捲到底：逐步播放時每一步都要跟上 */
  React.useEffect(function() {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeChat && activeChat.messages.length, activeId, stepShown]);

  /* 新的決策卡出現時預設展開 */
  React.useEffect(function() {
    if (pendingSheet) setSheetCollapsed(false);
  }, [pendingSheet]);

  /* ── 腳本推進：一次只揭露一個 turn ── */
  function pushTurn(chatId) {
    setChats(function(prev) {
      return prev.map(function(c) {
        if (c.id !== chatId || !c.scenario || c.cursor >= c.turns.length) return c;
        return Object.assign({}, c, {
          messages: c.messages.concat([c.turns[c.cursor]]),
          cursor: c.cursor + 1,
        });
      });
    });
    setStepShown(0);
  }

  /* ── 播放器：步驟一步一步跑完，再接下一個 AI 回合，遇到決策卡或輪到使用者就停 ── */
  React.useEffect(function() {
    if (!playing) return;
    if (!activeChat || !activeChat.scenario) { setPlaying(false); return; }
    var msgs = activeChat.messages;
    var last = msgs[msgs.length - 1];

    /* 1. 這一則還有步驟沒跑完 */
    if (last && last.run && last.run.steps && stepShown < last.run.steps.length) {
      var t1 = setTimeout(function() { setStepShown(function(s) { return s + 1; }); }, CHAT_STEP_MS);
      return function() { clearTimeout(t1); };
    }
    /* 2. 流程停在決策卡 */
    if (last && last.sheet) { setPlaying(false); return; }
    /* 3. 下一個回合；輪到使用者就停下來等他按建議接話 */
    var nt = activeChat.turns[activeChat.cursor];
    if (!nt || nt.role === 'user') { setPlaying(false); return; }
    var t2 = setTimeout(function() { pushTurn(activeChat.id); }, CHAT_TURN_MS);
    return function() { clearTimeout(t2); };
  }, [playing, stepShown, activeId, activeChat && activeChat.messages.length, activeChat && activeChat.cursor]);

  /* 建議接話：揭露那句使用者發言，然後交給播放器 */
  function advanceScript() {
    if (!activeChat) return;
    pushTurn(activeChat.id);
    setPlaying(true);
  }

  /* 決策卡：把選擇留在畫面上（DecisionEcho），再接 AI 的執行結果 */
  function pickSheetOption(option) {
    setChats(function(prev) {
      return prev.map(function(c) {
        if (c.id !== activeId) return c;
        var msgs = c.messages.slice();
        for (var k = msgs.length - 1; k >= 0; k--) {
          if (msgs[k].sheet) { msgs[k] = Object.assign({}, msgs[k], { sheet: null, sheetAnswered: option.label }); break; }
        }
        if (option.outcome) msgs.push(option.outcome);
        return Object.assign({}, c, { messages: msgs });
      });
    });
    setStepShown(0);
    setSheetCollapsed(false);
    setPlaying(true);
  }

  /* 出口一：我有其他指示 → 收起卡片，游標進輸入框 */
  function deferToInput() {
    setSheetCollapsed(true);
    setTimeout(function() { if (inputRef.current) inputRef.current.focus(); }, 0);
  }
  /* 出口二：稍後再決定 → 只收起卡片 */
  function deferSheet() { setSheetCollapsed(true); }

  /* 自由輸入：情境展示尚未接模型，誠實說明而不是靜靜吃掉 */
  function sendFreeText() {
    var t = inputVal.trim();
    if (!t) return;
    setInputVal('');
    if (clearAiDraft) clearAiDraft();
    if (!activeChat) return;
    setChats(function(prev) {
      return prev.map(function(c) {
        if (c.id !== activeId) return c;
        return Object.assign({}, c, {
          messages: c.messages.concat([
            { role: 'user', text: t },
            { role: 'ai', text: '這是情境展示，自由輸入還沒接上模型。請用下方的建議接話推進；如果流程正停在決策點，點上方的卡片繼續。' },
          ]),
        });
      });
    });
    setStepShown(999);
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
    setPlaying(false);
    setStepShown(999);
    setSheetCollapsed(false);
    setElapsed(0);
    setPanelOpen(false);
    setPanelDismissed(function(prev) { var n = Object.assign({}, prev); delete n[chatId]; return n; });
  }

  function selectChat(chatId) {
    setActiveId(chatId);
    setPlaying(false);
    setStepShown(999);
    setSheetCollapsed(false);
    setElapsed(0);
  }

  /* 下一句建議接話（播放中不給點，避免連按跳過步驟） */
  var nextTurn = null;
  if (activeChat && activeChat.scenario && activeChat.cursor < activeChat.turns.length) {
    var nt0 = activeChat.turns[activeChat.cursor];
    if (nt0.role === 'user') nextTurn = nt0;
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

  const quickPrompts = QUICK_PROMPTS[p.key] || QUICK_PROMPTS.equipment;

  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0, background: C.bg, position: 'relative' }}>

      {/* ══ 側欄 ══ */}
      <div style={{ width: 240, borderRight: '1px solid ' + C.border, display: 'flex', flexDirection: 'column', flexShrink: 0, background: C.bgPanel }}>
        <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid ' + C.border }}>
          <antd.Button type="primary" block onClick={function() { selectChat(null); if (clearAiDraft) clearAiDraft(); }}>+ 新對話</antd.Button>
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
                        onClick={function() { selectChat(chat.id); }}
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
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: C.bg }}>

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
          {activeChat && (
            <antd.Button size="small" type={panelOpen ? 'primary' : 'default'} onClick={togglePanel}>▤ 執行面板</antd.Button>
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
                  : '左側「情境展示」有幾段可以直接點著走的對話，示範 AI 在不同狀況下能做什麼、不能做什麼'}
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
            <React.Fragment>
              <MessageList messages={activeChat.messages} stepShown={stepShown} playing={playing} />
              {pendingSheet && !sheetCollapsed && (
                <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px' }}>
                  <DecisionCard
                    sheet={pendingSheet}
                    stepNum={pauseStepNum}
                    onPick={pickSheetOption}
                    onOther={deferToInput}
                    onDefer={deferSheet}
                  />
                </div>
              )}
            </React.Fragment>
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

            {/* 決策卡收起時，流程沒有消失，chip 一直留在這裡 */}
            {pendingSheet && sheetCollapsed && (
              <PendingChip
                stepNum={pauseStepNum}
                label={pauseStepLabel}
                onExpand={function() { setSheetCollapsed(false); }}
              />
            )}

            {/* 建議接話：腳本的下一句由使用者按了才推進 */}
            {nextTurn && !pendingSheet && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: fz(11), color: C.textMuted, marginBottom: 4 }}>建議接話</div>
                <button
                  disabled={playing}
                  onClick={advanceScript}
                  style={{
                    width: '100%', textAlign: 'left', cursor: playing ? 'default' : 'pointer',
                    padding: '12px 16px', borderRadius: 12,
                    border: '1px solid ' + C.borderStrong, background: C.bgSub,
                    fontSize: fz(14), color: playing ? C.textMuted : C.textSub, lineHeight: 1.7,
                    opacity: playing ? 0.6 : 1,
                  }}
                >{nextTurn.text}</button>
              </div>
            )}

            {/* 輸入列 */}
            <div style={{ background: C.bg, border: '1px solid ' + C.borderStrong, borderRadius: 12, display: 'flex', alignItems: 'flex-end', gap: 8, padding: '8px 8px 8px 16px' }}>
              <antd.Input.TextArea
                ref={inputRef}
                variant="borderless"
                value={inputVal}
                autoSize={{ minRows: 1, maxRows: 6 }}
                onChange={function(e) { setInputVal(e.target.value); }}
                onKeyDown={function(e) {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendFreeText(); }
                }}
                aria-label="輸入訊息"
                placeholder={
                  pendingSheet && sheetCollapsed ? '告訴我你想怎麼做（例如：只開 P3、先不要通知）…'
                    : (activeChat && activeChat.scenario ? '這是情境展示，請用上方的建議接話推進…' : '輸入訊息…')
                }
                style={{ flex: 1, padding: 0, fontSize: fz(15), resize: 'none' }}
              />
              <antd.Button type="primary" shape="circle" disabled={!inputVal.trim()} onClick={sendFreeText}>↑</antd.Button>
            </div>
            <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 8, textAlign: 'center' }}>
              AI 的回答可能有誤，涉及設備動作前請自行確認。
            </div>
          </div>
        </div>
      </div>

      {/* ══ 右側執行面板 ══ */}
      {panelOpen && activeChat && (
        <RunPanel
          segments={segments}
          outputs={outputs}
          used={used}
          elapsed={elapsed}
          onClose={closePanel}
          onGoDecision={function() { setSheetCollapsed(false); if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }}
          onPeekSkill={function(s) { setPeekSkill(s); }}
        />
      )}

      {/* ══ Skill／SOP 詳情 popout ══ */}
      {peekSkill && (
        <SkillPeekModal skill={peekSkill} sopList={sopList} onClose={function() { setPeekSkill(null); }} />
      )}
    </div>
  );
}
