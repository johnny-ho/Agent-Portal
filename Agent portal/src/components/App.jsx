/* ════════════════════════════════════════
   NAV & APP ROOT
   ════════════════════════════════════════ */

/* ── Nav SVG Icons ── */
const NavIcons = {
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.9"/>
      <rect x="11" y="2" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5"/>
      <rect x="2" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5"/>
      <rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.7"/>
    </svg>
  ),
  chat: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 4.5A1.5 1.5 0 014.5 3h11A1.5 1.5 0 0117 4.5v8A1.5 1.5 0 0115.5 14H11l-3 3v-3H4.5A1.5 1.5 0 013 12.5v-8z" fill="currentColor" opacity="0.9"/>
      <rect x="6" y="7" width="8" height="1.5" rx="0.75" fill="white" opacity="0.8"/>
      <rect x="6" y="10" width="5" height="1.5" rx="0.75" fill="white" opacity="0.6"/>
    </svg>
  ),
  kpi: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="12" width="3" height="6" rx="1" fill="currentColor" opacity="0.5"/>
      <rect x="7" y="8"  width="3" height="10" rx="1" fill="currentColor" opacity="0.7"/>
      <rect x="12" y="5" width="3" height="13" rx="1" fill="currentColor" opacity="0.9"/>
      <path d="M2 10 L7 7 L12 5 L17 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
    </svg>
  ),
  setting: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  tasks: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" opacity="0.9"/>
      <path d="M7 3v2a1 1 0 001 1h4a1 1 0 001-1V3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="6.5" cy="10" r="1.2" fill="currentColor" opacity="0.7"/>
      <path d="M9 10h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.7"/>
      <circle cx="6.5" cy="14" r="1.2" fill="currentColor" opacity="0.5"/>
      <path d="M9 14h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  scheduling: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.7" opacity="0.9"/>
      <path d="M10 5.5V10l3 2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
    </svg>
  ),
  apps: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="2" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9"/>
      <rect x="12" y="2" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9"/>
      <rect x="2" y="12" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9"/>
      <rect x="12" y="12" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9"/>
    </svg>
  ),
};

const NAV_BASE = [
  { key: 'dashboard',  label: 'Home' },
  { key: 'kpi',        label: 'KPI' },
  { key: 'apps',       label: 'App' },
  { key: 'tasks',      label: 'Task' },
  { key: 'chat',       label: 'AI' },
  { key: 'scheduling', label: 'Schedule' },
];
const NAV_SEED = [
  { key: 'setting',   label: 'Setting' },
];

/* ── NavItem with tooltip ── */
function NavItem({ item, active, accentBg, accentColor, onClick, hasBadge }) {
  const [hover, setHover] = React.useState(false);
  const { C, fz } = useTheme();
  const isActive = active;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: 48, height: 48, borderRadius: 8, border: 'none',
          cursor: 'pointer', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 3,
          background: isActive ? accentBg : hover ? C.hover : 'transparent',
          color: isActive ? accentColor : hover ? C.textSub : C.textMuted,
          transition: 'all 0.15s',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        {NavIcons[item.key]}
        <span style={{
          fontSize: fz(9), fontWeight: isActive ? 700 : 500,
          letterSpacing: '0.03em', lineHeight: 1,
          color: isActive ? accentColor : hover ? C.textSub : C.textMuted,
        }}>{item.label}</span>
        {hasBadge && (
          <div style={{
            position: 'absolute', top: 6, right: 6,
            width: 8, height: 8, borderRadius: 999,
            background: '#EF4444', border: `2px solid ${C.navBg}`,
            flexShrink: 0,
          }} />
        )}
      </button>

      {/* Tooltip */}
      {hover && (
        <div style={{
          position: 'absolute', left: 56, top: '50%',
          transform: 'translateY(-50%)',
          background: '#1F2937', color: '#FFFFFF',
          fontSize: fz(11), fontWeight: 500,
          padding: '4px 8px', borderRadius: 4,
          whiteSpace: 'nowrap', pointerEvents: 'none',
          zIndex: 1000, boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }}>
          {item.label}
          <div style={{
            position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)',
            borderWidth: '4px 4px 4px 0', borderStyle: 'solid',
            borderColor: 'transparent #1F2937 transparent transparent',
          }}/>
        </div>
      )}
    </div>
  );
}

/* ── App Search Box ── */
function AppSearchBox({ onNavigate, pinnedAppIds}) {
  var { C, fz } = useTheme();
  const [query, setQuery] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const inputRef = React.useRef(null);

  // Search ALL_APPS catalog (full IT app list), pinned items ranked first
  // When focused with empty query, show pinned items as default suggestions
  const results = React.useMemo(() => {
    if (!query.trim()) {
      // Default: show pinned items when focused
      return (ALL_APPS || [])
        .filter(a => (pinnedAppIds || []).includes(a.id))
        .slice(0, 8)
        .map(a => ({
          ...a,
          category: (a.cats || []).join(', '),
          personaLabel: '★ 已釘選',
        }));
    }
    const q = query.toLowerCase();
    const matched = (ALL_APPS || []).filter(a =>
      a.name.toLowerCase().includes(q) ||
      a.desc.toLowerCase().includes(q) ||
      a.system.toLowerCase().includes(q) ||
      (a.cats || []).some(c => c.toLowerCase().includes(q))
    );
    const pinned = matched.filter(a => (pinnedAppIds || []).includes(a.id));
    const rest = matched.filter(a => !(pinnedAppIds || []).includes(a.id));
    return [...pinned, ...rest].slice(0, 8).map(a => ({
      ...a,
      category: (a.cats || []).join(', '),
      personaLabel: (pinnedAppIds || []).includes(a.id) ? '★ 已釘選' : a.system,
    }));
  }, [query, pinnedAppIds]);

  const showDropdown = focused && results.length > 0;

  return (
    <div style={{ position: 'relative' }} onMouseDown={e => e.stopPropagation()}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        height: 28, padding: '0 10px',
        border: `1px solid ${focused ? '#2563EB' : '#E0E0E0'}`,
        borderRadius: 6, background: C.bg,
        transition: 'border-color 0.15s',
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="5" cy="5" r="3.5" stroke="#9E9E9E" strokeWidth="1.3"/>
          <path d="M8 8l2 2" stroke="#9E9E9E" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search Apps"
          style={{
            border: 'none', outline: 'none', background: 'none',
            fontSize: fz(12), color: C.textSub, width: 140,
          }}
        />
        {query && (
          <button onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, padding: 0, lineHeight: 1, fontSize: fz(14) }}>×</button>
        )}
      </div>

      {showDropdown && (
        <div style={{
          position: 'absolute', top: 34, right: 0,
          background: C.bg, border: '1px solid ' + C.border,
          borderRadius: 8, zIndex: 1000, width: 280,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}>
          {results.length === 0 ? (
            <div style={{ padding: '12px 16px', fontSize: fz(12), color: C.textMuted, textAlign: 'center' }}>
              找不到符合的 Application
            </div>
          ) : (
            <>
              <div style={{ padding: '6px 12px 4px', fontSize: fz(10), fontWeight: 700, color: C.textMuted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                {query.trim() ? `${results.length} 個結果` : '★ 我的釘選'}
              </div>
              {results.map((app, i) => (
                <div key={i}
                  onMouseDown={() => { setQuery(''); onNavigate && onNavigate(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 12px', cursor: 'pointer',
                    borderTop: i === 0 ? 'none' : '1px solid #F3F4F6',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: fz(18), width: 28, textAlign: 'center', flexShrink: 0 }}>{app.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>{app.name}</div>
                    <div style={{ fontSize: fz(11), color: C.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.desc}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: fz(10), color: C.textMuted, background: C.bgPanel, padding: '1px 5px', borderRadius: 3 }}>{app.system}</span>
                    <span style={{ fontSize: fz(10), color: app.personaLabel === '★ 已釘選' ? '#2563EB' : '#9CA3AF' }}>{app.personaLabel}</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function PersonaPicker({ persona, onSelect, onClose}) {
  var { C, fz } = useTheme();
  return (
    <div style={{
      position: 'absolute', top: 36, right: 0,
      background: C.bg, border: '1px solid ' + C.border,
      borderRadius: 8, padding: 8, zIndex: 999,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)', minWidth: 200,
    }}>
      <div style={{ fontSize: fz(10), fontWeight: 700, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 8px 8px' }}>課別切換</div>
      {Object.values(PERSONAS).map(pr => (
        <button key={pr.key}
          onClick={() => { onSelect(pr.key); onClose(); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '8px', borderRadius: 6, border: 'none',
            cursor: 'pointer', textAlign: 'left',
            background: persona === pr.key ? pr.accentBg : 'transparent',
            color: persona === pr.key ? pr.accentColor : '#374151',
            fontWeight: persona === pr.key ? 600 : 400,
            fontSize: fz(13),
          }}
          onMouseEnter={e => { if (persona !== pr.key) e.currentTarget.style.background = '#F5F5F5'; }}
          onMouseLeave={e => { if (persona !== pr.key) e.currentTarget.style.background = 'transparent'; }}
        >
          <span>{pr.code || pr.name}</span>
          {persona === pr.key && <span style={{ marginLeft: 'auto', fontSize: fz(11), color: pr.accentColor }}>●</span>}
        </button>
      ))}
    </div>
  );
}

function App() {
  const [persona, setPersona] = React.useState('equipment');
  const [nav, setNav] = React.useState('dashboard');
  const isSeed = p => PERSONAS[p] && PERSONAS[p].user && PERSONAS[p].user.role === 'Section Admin';
  const isIT   = p => PERSONAS[p] && PERSONAS[p].user && PERSONAS[p].user.role === 'IT Admin';
  const [showPicker, setShowPicker] = React.useState(false);
  const [functionTree, setFunctionTree] = React.useState(
    typeof DEFAULT_FUNCTION_TREE !== 'undefined' ? DEFAULT_FUNCTION_TREE : []
  );

  /* ── Dark Mode ── */
  const [isDark, setIsDark] = React.useState(false);
  const toggleDark = React.useCallback(function() {
    setIsDark(function(v) { return !v; });
  }, []);
  const C = isDark ? DARK_COLORS : LIGHT_COLORS;

  /* Sync dark mode class on body */
  React.useEffect(function() {
    document.body.classList.toggle('dark-mode', isDark);
  }, [isDark]);

  /* ── Font Size ── */
  const [fontSize, setFontSize] = React.useState('normal');
  const fzScales = { small: 0.875, normal: 1, large: 1.125 };
  const fzScale = fzScales[fontSize] || 1;
  const fz = React.useCallback(function(n) { return Math.round(n * fzScale); }, [fzScale]);
  React.useEffect(function() {
    /* only set CSS var for any remaining CSS-level text; layout untouched */
    document.documentElement.style.setProperty('--fz-scale', String(fzScale));
  }, [fzScale]);
  const [aiDraft, setAiDraft] = React.useState({ text: '', label: '' });
  const [handoverRecord, setHandoverRecord] = React.useState(null);
  const [showHandoverModal, setShowHandoverModal] = React.useState(false);
  const [taskFilter, setTaskFilter] = React.useState('');
  const [taskOpenId, setTaskOpenId] = React.useState(null);
  const [pinnedByPersona, setPinnedByPersona] = React.useState(DEFAULT_PINNED || { equipment: [], process: [], mfg: [] });
  const [legacyMode, setLegacyMode] = React.useState(false);

  /* ── 通知中心（Personal 層，per-persona 獨立；見 brain/entities/modules/notification.md）── */
  const [notifByPersona, setNotifByPersona] = React.useState(function () {
    const init = {};
    const src = typeof NOTIFICATIONS_BY_PERSONA !== 'undefined' ? NOTIFICATIONS_BY_PERSONA : {};
    Object.keys(src).forEach(function (k) {
      init[k] = (src[k] || []).map(function (n) { return Object.assign({}, n); });
    });
    return init;
  });
  const [notifPrefsByPersona, setNotifPrefsByPersona] = React.useState(function () {
    const base = typeof DEFAULT_NOTIF_PREFS !== 'undefined' ? DEFAULT_NOTIF_PREFS : { N1: {}, N2: {}, N3: {} };
    const init = {};
    Object.keys(PERSONAS || {}).forEach(function (k) {
      init[k] = {
        N1: Object.assign({}, base.N1),
        N2: Object.assign({}, base.N2),
        N3: Object.assign({}, base.N3),
      };
    });
    return init;
  });
  /* scheduling deep-link 請求：{ runId, nonce }，nonce 每次點擊遞增以重觸發 effect */
  const [expandRunReq, setExpandRunReq] = React.useState({ runId: null, nonce: 0 });

  /* ── 排程的人工介入決定：{ [runId]: [intervention, ...] } ──
     放在 App 而不是 SchedulingPage，因為 Nav 紅點也要用同一份真相。
     先送出者定案：同一個決策點只收第一筆，之後的一律不受理（B 推翻不了 A）。 */
  const [schedDecisions, setSchedDecisions] = React.useState({});
  const decideSchedulingStep = React.useCallback(function (runId, iv) {
    var existing = schedDecisions[runId] || [];
    var taken = existing.some(function (x) { return x.stepNum === iv.stepNum; });
    if (taken) return false;                    /* 已經有人決定過，本次不成立 */
    setSchedDecisions(function (prev) {
      var cur = prev[runId] || [];
      if (cur.some(function (x) { return x.stepNum === iv.stepNum; })) return prev;
      return Object.assign({}, prev, { [runId]: cur.concat([iv]) });
    });
    return true;
  }, [schedDecisions]);

  /* ── Home Layout（Seed 可設定，per-persona 獨立） ── */
  const [homeLayoutByPersona, setHomeLayoutByPersona] = React.useState(
    typeof DEFAULT_HOME_LAYOUT !== 'undefined' ? DEFAULT_HOME_LAYOUT : { equipment: [], process: [], mfg: [] }
  );
  const handleHomeLayoutChange = React.useCallback(function(newLayout) {
    setHomeLayoutByPersona(function(prev) {
      return Object.assign({}, prev, { [persona]: newLayout });
    });
  }, [persona]);

  /* ── KPI Widget Config（Seed 可設定，per-persona 獨立） ── */
  const [kpiWidgetConfig, setKpiWidgetConfig] = React.useState(
    typeof DEFAULT_KWS_CONFIG !== 'undefined' ? DEFAULT_KWS_CONFIG : {}
  );
  const handleKpiConfigChange = React.useCallback(function(newConfig) {
    setKpiWidgetConfig(function(prev) {
      return Object.assign({}, prev, { [persona]: newConfig });
    });
  }, [persona]);

  /* ── Home Widget 編輯 → 導航到對應 Setting tab
     使用單一 settingJump 物件，避免多個 nonce 同時 > 0 導致最後一個 effect 覆蓋前者。
     { tab: string, nonce: number } — nonce 每次點擊遞增，tab 記錄目標分頁。
  ── */
  const [settingJump, setSettingJump] = React.useState({ tab: null, nonce: 0 });

  const handleOpenKpiSetting = React.useCallback(function() {
    setSettingJump(function(prev) { return { tab: 'home', nonce: prev.nonce + 1, widgetType: 'kpi' }; });
    setNav('setting');
  }, []);

  const handleOpenBulletinSetting = React.useCallback(function() {
    setSettingJump(function(prev) { return { tab: 'home', nonce: prev.nonce + 1, widgetType: 'announcement' }; });
    setNav('setting');
  }, []);

  const handleOpenAppSetting = React.useCallback(function() {
    setSettingJump(function(prev) { return { tab: 'home', nonce: prev.nonce + 1, widgetType: 'app' }; });
    setNav('setting');
  }, []);

  /* slotInfo: { rowId, slotId } — 供 HomeLayoutTab 自動展開對應設定面板 */
  const handleOpenLinkWidgetSetting = React.useCallback(function(slotInfo) {
    setSettingJump(function(prev) { return { tab: 'home', nonce: prev.nonce + 1, slotInfo: slotInfo || null }; });
    setNav('setting');
  }, []);

  const p = PERSONAS[persona];

  const pinnedAppIds = pinnedByPersona[persona] || [];

  const handleTogglePin = React.useCallback((appId) => {
    setPinnedByPersona(prev => {
      const current = prev[persona] || [];
      if (current.includes(appId)) {
        return { ...prev, [persona]: current.filter(id => id !== appId) };
      }
      if (current.length >= 20) {
        alert('最多釘選 20 個應用，請先移除不需要的應用再新增。');
        return prev;
      }
      return { ...prev, [persona]: [...current, appId] };
    });
  }, [persona]);

  /* ── 通知：當前 persona 的清單與偏好 ── */
  const currentNotifs = notifByPersona[persona] || [];
  const currentNotifPrefs = notifPrefsByPersona[persona] || (typeof DEFAULT_NOTIF_PREFS !== 'undefined' ? DEFAULT_NOTIF_PREFS : {});

  const markNotifRead = React.useCallback(function (id) {
    setNotifByPersona(function (prev) {
      const list = (prev[persona] || []).map(function (n) {
        return n.id === id ? Object.assign({}, n, { read: true }) : n;
      });
      return Object.assign({}, prev, { [persona]: list });
    });
  }, [persona]);

  const handleMarkAllNotifRead = React.useCallback(function () {
    setNotifByPersona(function (prev) {
      const list = (prev[persona] || []).map(function (n) { return Object.assign({}, n, { read: true }); });
      return Object.assign({}, prev, { [persona]: list });
    });
  }, [persona]);

  const handleOpenNotification = React.useCallback(function (n) {
    markNotifRead(n.id);
    const link = n.link || {};
    if (link.nav === 'tasks') {
      setTaskFilter('');
      setTaskOpenId(link.taskOpenId || null);
      setNav('tasks');
    } else if (link.nav === 'scheduling') {
      if (link.expandRunId) {
        setExpandRunReq(function (prev) { return { runId: link.expandRunId, nonce: prev.nonce + 1 }; });
      }
      setNav('scheduling');
    }
  }, [markNotifRead]);

  const handleNotifPrefChange = React.useCallback(function (type, channel, value) {
    setNotifPrefsByPersona(function (prev) {
      const base = typeof DEFAULT_NOTIF_PREFS !== 'undefined' ? DEFAULT_NOTIF_PREFS : {};
      const cur = prev[persona] || base;
      const updatedType = Object.assign({}, cur[type], { [channel]: value });
      const updated = Object.assign({}, cur, { [type]: updatedType });
      return Object.assign({}, prev, { [persona]: updated });
    });
  }, [persona]);

  /* Scheduling nav 紅點：綁「實際還有未決定的決策點」，不綁通知已讀狀態。
     通知讀過不代表事情處理了 —— 紅點要跟著排程本身的狀態走。 */
  const schedulingHasPending = React.useMemo(function () {
    return getPendingDecisions(persona, schedDecisions).length > 0;
  }, [persona, schedDecisions]);

  const handleAskAI = React.useCallback(({ text, label }) => {
    setAiDraft({ text, label });
    setNav('chat');
  }, []);

  const clearAiDraft = React.useCallback(() => {
    setAiDraft({ text: '', label: '' });
  }, []);

  const handleHandoverSubmit = React.useCallback((record) => {
    setHandoverRecord(record);
  }, []);

  const themeCtxValue = React.useMemo(function() {
    return { isDark: isDark, C: C, toggle: toggleDark, fontSize: fontSize, setFontSize: setFontSize, fz: fz };
  }, [isDark, C, toggleDark, fontSize, setFontSize, fz]);

  return (
    <ThemeContext.Provider value={themeCtxValue}>
    <AppConfigProvider>
    <div style={{ width: '100vw', height: '100vh', display: 'flex', background: C.bg, transition: 'background 0.2s, color 0.2s' }}
      onClick={() => { if (showPicker) setShowPicker(false); }}
    >
      {/* Left nav — 64px */}
      <div style={{
        width: 64, borderRight: `1px solid ${C.border}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '16px 0 16px', gap: 4, flexShrink: 0,
        background: C.navBg, position: 'relative',
        transition: 'background 0.2s, border-color 0.2s',
      }}>
        {/* Logo */}
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: C.accentBlue,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16, flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="6" r="3" fill="white" opacity="0.95"/>
            <path d="M3 16c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="white" strokeWidth="1.8" strokeLinecap="round" opacity="0.85"/>
          </svg>
        </div>

        {/* Nav items */}
        {NAV_BASE.map(item => (
          <NavItem
            key={item.key}
            item={item}
            active={nav === item.key}
            accentBg={p.accentBg}
            accentColor={p.accentColor}
            onClick={() => setNav(item.key)}
            hasBadge={item.key === 'scheduling' && schedulingHasPending}
          />
        ))}

        <div style={{ flex: 1 }} />

        {/* Setting — 固定在底部（所有用戶可見，Seed 可管理課設定，一般用戶有 Personal） */}
        {NAV_SEED.map(item => (
          <NavItem
            key={item.key}
            item={item}
            active={nav === item.key}
            accentBg={p.accentBg}
            accentColor={p.accentColor}
            onClick={() => setNav(item.key)}
          />
        ))}
      </div>

      {/* Content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, overflow: 'hidden', position: 'relative', background: C.bg, transition: 'background 0.2s' }}
        onClick={() => { if (showPicker) setShowPicker(false); }}
      >
        {/* ── Unified Header Bar (40px, all pages) ── */}
        <div style={{
          height: 40, flexShrink: 0,
          display: 'flex', alignItems: 'center',
          borderBottom: `1px solid ${C.border}`,
          background: C.headerBg,
          paddingLeft: 16, paddingRight: 16,
          gap: 12, zIndex: 200,
          transition: 'background 0.2s, border-color 0.2s',
        }}>
          {/* Left: page-specific content */}
          {nav === 'dashboard' && (
            <>
              <div>
                <div style={{ fontWeight: 600, fontSize: fz(14), color: C.text, lineHeight: 1.2 }}>{p.name}</div>
                <div style={{ color: C.textMuted, fontSize: fz(11) }}>{p.dept} · {p.currentShift || ''} {p.shiftLabel}</div>
              </div>
              <div style={{ width: 1, height: 20, background: C.border }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex' }}>
                  {p.members.filter(m => m.online).slice(0, 3).map((m, i) => (
                    <div key={i} style={{ marginLeft: i > 0 ? -4 : 0, zIndex: 10 - i }}>
                      <Avatar char={m.avatar} size={20} color={i === 0 ? p.accentColor : '#666666'} />
                    </div>
                  ))}
                </div>
                <span style={{ color: C.textMuted, fontSize: fz(11) }}>{p.onlineCount} 人在線</span>
              </div>
            </>
          )}
          {nav === 'apps' && (
            <>
              <div>
                <div style={{ fontWeight: 600, fontSize: fz(14), color: C.text, lineHeight: 1.2 }}>應用程式</div>
                <div style={{ color: C.textMuted, fontSize: fz(11) }}>{p.name} · 個人釘選管理</div>
              </div>
              {/* ── 新版 / 舊版 Toggle ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8 }}>
                <span style={{
                  fontSize: fz(11), fontWeight: legacyMode ? 400 : 600,
                  color: legacyMode ? C.textMuted : p.accentColor,
                  transition: 'color 0.15s',
                }}>新版</span>
                <button
                  onClick={() => setLegacyMode(function(v) { return !v; })}
                  style={{
                    width: 36, height: 20, borderRadius: 999,
                    background: legacyMode ? p.accentColor : '#D1D5DB',
                    border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
                    position: 'relative', transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    width: 16, height: 16, borderRadius: 999,
                    background: C.bg,
                    position: 'absolute', top: 2,
                    left: legacyMode ? 18 : 2,
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                  }} />
                </button>
                <span style={{
                  fontSize: fz(11), fontWeight: legacyMode ? 600 : 400,
                  color: legacyMode ? p.accentColor : C.textMuted,
                  transition: 'color 0.15s',
                }}>舊版</span>
              </div>
            </>
          )}
          {nav === 'kpi' && (
            <div>
              <div style={{ fontWeight: 600, fontSize: fz(14), color: C.text, lineHeight: 1.2 }}>KPI 報表中心</div>
              <div style={{ color: C.textMuted, fontSize: fz(11) }}>{p.name} · Seed 管理書籤清單</div>
            </div>
          )}
          {nav === 'chat' && (
            <div>
              <div style={{ fontWeight: 600, fontSize: fz(14), color: C.text, lineHeight: 1.2 }}>AI 助理</div>
              <div style={{ color: C.textMuted, fontSize: fz(11) }}>{p.name}</div>
            </div>
          )}
          {nav === 'tasks' && (
            <div>
              <div style={{ fontWeight: 600, fontSize: fz(14), color: C.text, lineHeight: 1.2 }}>任務管理</div>
              <div style={{ color: C.textMuted, fontSize: fz(11) }}>{p.name}</div>
            </div>
          )}
          {nav === 'scheduling' && (
            <div>
              <div style={{ fontWeight: 600, fontSize: fz(14), color: C.text, lineHeight: 1.2 }}>Scheduling</div>
              <div style={{ color: C.textMuted, fontSize: fz(11) }}>{p.name}</div>
            </div>
          )}
          {nav === 'setting' && (
            <div>
              <div style={{ fontWeight: 600, fontSize: fz(14), color: C.text, lineHeight: 1.2 }}>設定</div>
              <div style={{ color: C.textMuted, fontSize: fz(11) }}>{p.name}</div>
            </div>
          )}

          {/* Spacer pushes right controls to the end */}
          <div style={{ flex: 1 }} />

          {/* Right: Search + Persona Picker (always visible) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <AppSearchBox onNavigate={() => setNav('apps')} pinnedAppIds={pinnedAppIds} />
            <NotificationBell
              notifications={currentNotifs}
              prefs={currentNotifPrefs}
              onOpenItem={handleOpenNotification}
              onMarkAllRead={handleMarkAllNotifRead}
            />
            <div style={{ position: 'relative' }}>
              {showPicker && (
                <PersonaPicker
                  persona={persona}
                  onSelect={key => { setPersona(key); setNav('dashboard'); }}
                  onClose={() => setShowPicker(false)}
                />
              )}
              <button
                onClick={() => setShowPicker(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '4px 10px', borderRadius: 6,
                  border: `1px solid ${showPicker ? p.accentBorder : C.border}`,
                  background: showPicker ? p.accentBg : C.headerBg,
                  cursor: 'pointer', fontSize: fz(12),
                  color: showPicker ? p.accentColor : C.textSub,
                  fontWeight: 600, height: 28,
                  transition: 'background 0.2s, border-color 0.2s',
                }}
              >
                <span>{p.code || p.name}</span>
                <span style={{ fontSize: fz(9), color: C.textMuted, marginLeft: 2 }}>▾</span>
              </button>
            </div>
          </div>
        </div>

        {nav === 'dashboard'  && <DashboardPage p={p} onAskAI={handleAskAI} handoverRecord={handoverRecord} onHandoverSubmit={handleHandoverSubmit} onGoTasks={(member, taskId) => { setTaskFilter(member || ''); setTaskOpenId(taskId || null); setNav('tasks'); }} pinnedAppIds={pinnedAppIds} onGoAppCenter={() => setNav('apps')} kpiConfig={kpiWidgetConfig[persona]} onKpiConfigChange={handleKpiConfigChange} onOpenKpiSetting={handleOpenKpiSetting} onOpenBulletinSetting={handleOpenBulletinSetting} onOpenAppSetting={handleOpenAppSetting} onOpenLinkWidgetSetting={handleOpenLinkWidgetSetting} showHandoverModal={showHandoverModal} setShowHandoverModal={setShowHandoverModal} homeLayout={homeLayoutByPersona[persona] || []} />}
        {nav === 'apps'       && <AppCenterPage p={p} pinnedAppIds={pinnedAppIds} onTogglePin={handleTogglePin} functionTree={functionTree} legacyMode={legacyMode} />}
        {nav === 'kpi'        && <KPIPage p={p} onAskAI={handleAskAI} />}
        {nav === 'chat'       && <ChatPage p={p} aiDraft={aiDraft} clearAiDraft={clearAiDraft} />}
        {nav === 'setting'    && <SettingPage p={p} kpiConfig={kpiWidgetConfig[persona]} onKpiConfigChange={handleKpiConfigChange} settingJump={settingJump} isSeedUser={isSeed(persona)} isITUser={isIT(persona)} functionTree={functionTree} onFunctionTreeChange={setFunctionTree} homeLayout={homeLayoutByPersona[persona] || []} onHomeLayoutChange={handleHomeLayoutChange} notifPrefs={currentNotifPrefs} onNotifPrefChange={handleNotifPrefChange} />}
        {nav === 'tasks'      && <TaskManagementPage p={p} initialFilter={taskFilter} initialOpenId={taskOpenId} />}
        {/* key={persona} 讓切課時重置頁內狀態：新增的排程不會殘留到別的課，選取項目也會歸位 */}
        {nav === 'scheduling' && (
          <SchedulingPage
            key={persona}
            p={p}
            expandRunReq={expandRunReq}
            decisions={schedDecisions}
            onDecide={decideSchedulingStep}
          />
        )}
      </div>
    </div>
    </AppConfigProvider>
    </ThemeContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
