/* ════════════════════════════════════════
   APP CENTER
   個人應用目錄 · 釘選管理
   AntD 遷移 Phase 5（見 brain/concepts/antd-migration-plan.md）
   ════════════════════════════════════════ */

/* ── Function Tree Dropdown（Dropdown + Tree：展開/收合由 Tree 承接）── */
function FunctionTreeBtn({ functionTree, accentColor }) {
  var [open, setOpen] = React.useState(false);
  var [expandedKeys, setExpandedKeys] = React.useState([]);
  var { C, fz } = useTheme();

  /* 只保留 enabled 的 item，移除空的 sub/cat */
  var visibleTree = (functionTree || []).map(function(cat) {
    var subs = (cat.children || []).map(function(sub) {
      return Object.assign({}, sub, {
        items: (sub.items || []).filter(function(fn) { return fn.enabled; }),
      });
    }).filter(function(sub) { return sub.items.length > 0; });
    return Object.assign({}, cat, { children: subs });
  }).filter(function(cat) { return cat.children.length > 0; });

  /* 初始化：L1 全展開，L2 全收合 */
  React.useEffect(function() {
    setExpandedKeys(visibleTree.map(function(cat) { return cat.id; }));
  }, [functionTree]);

  /* Tree data：L1 分類 / L2 子分類（皆不可選）→ L3 功能（可選，點擊後關閉面板） */
  var treeData = visibleTree.map(function(cat) {
    var total = cat.children.reduce(function(s, sub) { return s + sub.items.length; }, 0);
    return {
      key: cat.id,
      selectable: false,
      title: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: fz(12), fontWeight: 700, color: C.text }}>{cat.label}</span>
          <span style={{ fontSize: fz(10), color: C.textMuted }}>{total}</span>
        </span>
      ),
      children: cat.children.map(function(sub) {
        return {
          key: sub.id,
          selectable: false,
          title: (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: fz(12), fontWeight: 500, color: C.textSub }}>{sub.label}</span>
              <span style={{ fontSize: fz(10), color: C.textMuted }}>{sub.items.length}</span>
            </span>
          ),
          children: sub.items.map(function(fn) {
            return {
              key: fn.id,
              isLeaf: true,
              title: (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: fz(13), color: C.text }}>{fn.label}</span>
                  {fn.system && (
                    <span style={{
                      fontSize: fz(10), color: C.textMuted, background: C.bgPanel,
                      padding: '1px 5px', borderRadius: 3, flexShrink: 0, fontFamily: 'monospace',
                    }}>{fn.system}</span>
                  )}
                </span>
              ),
            };
          }),
        };
      }),
    };
  });

  var panel = (
    <div style={{
      width: 256, maxHeight: 440, background: C.bg,
      border: '1px solid ' + C.border, borderRadius: 8,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    }}>
      <div style={{
        padding: '8px 16px', fontSize: fz(10), fontWeight: 700,
        color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase',
        borderBottom: '1px solid ' + C.border, flexShrink: 0,
      }}>功能目錄</div>
      <div style={{ overflowY: 'auto', flex: 1, padding: 8 }} className="scrollbar-thin">
        {treeData.length === 0 ? (
          <antd.Empty
            image={antd.Empty.PRESENTED_IMAGE_SIMPLE}
            description={<span style={{ fontSize: fz(12), color: C.textMuted }}>尚無可用功能</span>}
          />
        ) : (
          <antd.Tree
            blockNode
            treeData={treeData}
            expandedKeys={expandedKeys}
            onExpand={function(keys) { setExpandedKeys(keys); }}
            onSelect={function() { setOpen(false); }}
          />
        )}
      </div>
    </div>
  );

  return (
    <antd.Dropdown
      open={open}
      onOpenChange={setOpen}
      trigger={['click']}
      placement="bottomLeft"
      dropdownRender={function() { return panel; }}
    >
      <antd.Button
        title="功能目錄"
        style={{
          width: 40, height: 40, flexShrink: 0,
          borderColor: open ? accentColor : C.border,
          color: open ? accentColor : C.textSub,
          backgroundColor: open ? 'rgba(37,99,235,0.06)' : undefined,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="2"   y="3"   width="12" height="1.6" rx="0.8" fill="currentColor"/>
          <rect x="2"   y="7.2" width="12" height="1.6" rx="0.8" fill="currentColor"/>
          <rect x="2"   y="11.4" width="12" height="1.6" rx="0.8" fill="currentColor"/>
        </svg>
      </antd.Button>
    </antd.Dropdown>
  );
}

/* ── Star Icon（釘選狀態圖示，保留自製 svg：專案未載入 AntD icon UMD）── */
function StarIcon({ filled, size = 14, color}) {
  const c = color || (filled ? '#2563EB' : '#D1D5DB');
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? c : 'none'} stroke={c} strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

/* ── 釘選鈕（清單／卡片共用）── */
function PinBtn({ pinned, accentColor, onToggle }) {
  return (
    <antd.Tooltip title={pinned ? '取消釘選' : '釘選至首頁'}>
      <antd.Button
        type="text"
        onClick={e => { e.stopPropagation(); onToggle(); }}
        style={{ width: 28, height: 28, padding: 0, flexShrink: 0 }}
      >
        <StarIcon filled={pinned} color={pinned ? accentColor : '#D1D5DB'} />
      </antd.Button>
    </antd.Tooltip>
  );
}

/* ── App 圖示方塊 ── */
function AppIconBox({ app, size }) {
  var { fz } = useTheme();
  const sz = size || 36;
  return (
    <div style={{
      width: sz, height: sz, borderRadius: 8, flexShrink: 0,
      background: app.bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: fz(Math.round(sz / 2)),
    }}>{app.icon}</div>
  );
}

/* ── App 標籤（系統代號 + 首個分類）── */
function AppTags({ app }) {
  var { fz } = useTheme();
  return (
    <antd.Space size={4} wrap>
      <antd.Tag style={{ marginInlineEnd: 0, fontFamily: 'monospace', fontSize: fz(10) }}>{app.system}</antd.Tag>
      {app.cats.slice(0, 1).map(c => (
        <antd.Tag key={c} style={{ marginInlineEnd: 0, fontSize: fz(10) }}>{c}</antd.Tag>
      ))}
    </antd.Space>
  );
}

/* ── App Grid Card ── */
function AppGridCard({ app, pinned, accentColor, onTogglePin}) {
  var { C, fz } = useTheme();
  return (
    <antd.Card size="small" hoverable styles={{ body: { padding: 16, display: 'flex', flexDirection: 'column', gap: 8 } }}>
      {/* Top: icon + meta */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <AppIconBox app={app} size={36} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: fz(13), fontWeight: 600, color: C.text,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{app.name}</div>
          <div style={{
            fontSize: fz(11), color: C.textMuted, lineHeight: 1.4, marginTop: 2,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>{app.desc}</div>
        </div>
      </div>

      {/* Footer: tags + pin */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <AppTags app={app} />
        <PinBtn pinned={pinned} accentColor={accentColor} onToggle={function() { onTogglePin(app.id); }} />
      </div>
    </antd.Card>
  );
}

/* ── Pinned Strip ── */
function PinnedStrip({ pinnedApps, accentColor, onTogglePin}) {
  var { C, fz } = useTheme();
  if (pinnedApps.length === 0) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <StarIcon filled size={12} color={accentColor} />
        <span style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          已釘選
        </span>
        <span style={{ fontSize: fz(11), color: C.textMuted }}>{pinnedApps.length} / 20</span>
        <span style={{ fontSize: fz(11), color: C.textMuted }}>· 同步顯示於首頁</span>
      </div>

      {/* Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(104px, 1fr))',
        gap: 8,
      }}>
        {pinnedApps.map(app => (
          <PinnedTile key={app.id} app={app} accentColor={accentColor} onUnpin={() => onTogglePin(app.id)} />
        ))}
      </div>

      <antd.Divider style={{ marginBlock: 24 }} />
    </div>
  );
}

function PinnedTile({ app, accentColor, onUnpin}) {
  var { C, fz } = useTheme();
  const [hover, setHover] = React.useState(false);
  return (
    <antd.Card
      size="small" hoverable
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', backgroundColor: hover ? C.hoverAccent : C.bgSub }}
      styles={{ body: { padding: '12px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 } }}
    >
      <AppIconBox app={app} size={40} />
      <div style={{
        fontSize: fz(11), fontWeight: 600, color: C.text,
        textAlign: 'center', lineHeight: 1.3, wordBreak: 'break-word',
      }}>{app.name}</div>
      {hover && (
        <antd.Tooltip title="取消釘選">
          <antd.Button
            size="small" type="text"
            onClick={e => { e.stopPropagation(); onUnpin(); }}
            style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, padding: 0, color: C.textMuted, background: C.bg }}
          >✕</antd.Button>
        </antd.Tooltip>
      )}
    </antd.Card>
  );
}

/* ══════════════════════════════════════════
   AppCenterPage — Main
══════════════════════════════════════════ */
function AppCenterPage({ p, pinnedAppIds, onTogglePin, functionTree, legacyMode}) {
  var { C, fz } = useTheme();
  /* AppConfigProvider 內已包 antd.App（component={false}），此處取得吃 theme
     token 的 message，取代原生 alert（原生對話框不吃 dark mode）。 */
  var app = antd.App.useApp();
  const [search, setSearch]       = React.useState('');
  const [activeCat, setActiveCat] = React.useState('全部');
  const [view, setView]           = React.useState('grid'); // 'grid' | 'list'

  const ac = p.accentColor;

  /* Derived */
  const pinnedApps = ALL_APPS.filter(a => pinnedAppIds.includes(a.id));

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return ALL_APPS.filter(a => {
      const matchQ = !q || a.name.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q) || a.system.toLowerCase().includes(q);
      const matchC = activeCat === '全部' || a.cats.includes(activeCat);
      return matchQ && matchC;
    });
  }, [search, activeCat]);

  const handleTogglePin = (appId) => {
    if (!pinnedAppIds.includes(appId) && pinnedAppIds.length >= 20) {
      app.message.warning('最多只能釘選 20 個應用程式');
      return;
    }
    onTogglePin(appId);
  };

  /* ── Legacy Mode (舊版 iframe 模擬) ── */
  if (legacyMode) {
    return (
      <div style={{ flex: 1, position: 'relative', minHeight: 0, overflow: 'hidden' }}>

        {/* ── 模擬 iframe 區域 ── */}
        <div style={{ position: 'absolute', inset: 0, background: C.bgPanel }}>

          {/* 舊系統的頂部 bar（iframe 內部） */}
          <div style={{
            height: 56, padding: '0 16px',
            display: 'flex', alignItems: 'center',
            background: C.bg, borderBottom: '1px solid ' + C.border,
          }}>
            <FunctionTreeBtn functionTree={functionTree} accentColor={ac} />
          </div>

          {/* 舊系統主體佔位 */}
          <div style={{
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            height: 'calc(100% - 56px)', gap: 8,
          }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="4" width="40" height="40" rx="6" stroke="#D1D5DB" strokeWidth="2"/>
              <path d="M4 14h40" stroke="#D1D5DB" strokeWidth="1.5"/>
              <rect x="10" y="22" width="10" height="8" rx="2" fill="#E5E7EB"/>
              <rect x="26" y="22" width="12" height="8" rx="2" fill="#E5E7EB"/>
              <rect x="10" y="34" width="28" height="5" rx="2" fill="#E5E7EB"/>
            </svg>
            <div style={{ fontSize: fz(13), color: C.textMuted, fontWeight: 500 }}>舊版系統</div>
            <div style={{ fontSize: fz(11), color: C.textMuted, fontFamily: 'monospace' }}>iframe · legacy-system</div>
          </div>
        </div>

      </div>
    );
  }

  /* ── List view → Table（欄寬固定，操作欄以 stopPropagation 隔離）── */
  const listColumns = [
    {
      title: '應用', dataIndex: 'name', width: 240,
      render: function (name, app) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <AppIconBox app={app} size={32} />
            <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>{name}</span>
          </div>
        );
      },
    },
    {
      title: '說明', dataIndex: 'desc', ellipsis: true,
      render: function (desc) { return <span style={{ fontSize: fz(12), color: C.textMuted }}>{desc}</span>; },
    },
    {
      title: '標籤', key: 'tags', width: 200,
      render: function (_, app) { return <AppTags app={app} />; },
    },
    {
      title: '釘選', key: 'pin', width: 64, align: 'center',
      render: function (_, app) {
        return <PinBtn pinned={pinnedAppIds.includes(app.id)} accentColor={ac} onToggle={function () { handleTogglePin(app.id); }} />;
      },
    },
    {
      title: '操作', key: 'action', width: 104, align: 'right',
      render: function () {
        return <antd.Button size="small" type="primary" onClick={function (e) { e.stopPropagation(); }}>開啟 ↗</antd.Button>;
      },
    },
  ];

  const emptyNode = (
    <antd.Empty style={{ padding: 48 }} description={<span style={{ fontSize: fz(13), color: C.textMuted }}>找不到符合的應用程式</span>} />
  );

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: C.bg }}>

      {/* ── Scrollable Body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }} className="scrollbar-thin">

        {/* Search Row */}
        <div style={{ marginBottom: 16 }}>
          <antd.Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
            aria-label="搜尋應用程式"
            prefix={<span style={{ color: C.textMuted, fontSize: fz(13) }}>🔍</span>}
            placeholder="應用名稱、描述或系統"
          />
        </div>

        {/* Category filter → Segmented（篩選型，沿用預設選中樣式） */}
        <div style={{ marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid ' + C.border, overflowX: 'auto' }} className="scrollbar-none">
          <antd.Segmented
            value={activeCat}
            onChange={setActiveCat}
            options={APP_CATEGORIES}
          />
        </div>

        {/* Pinned Strip */}
        <PinnedStrip
          pinnedApps={pinnedApps}
          accentColor={ac}
          onTogglePin={handleTogglePin}
        />

        {/* Toolbar */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 16, gap: 8,
        }}>
          <div style={{ fontSize: fz(13), color: C.textMuted }}>
            {filtered.length} 個應用程式
            {activeCat !== '全部' && <span style={{ color: ac }}> · {activeCat}</span>}
          </div>
          <antd.Segmented
            value={view}
            onChange={setView}
            options={[
              { value: 'grid', label: (
                <antd.Tooltip title="卡片檢視">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle' }}>
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                  </svg>
                </antd.Tooltip>
              ) },
              { value: 'list', label: (
                <antd.Tooltip title="清單檢視">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: 'middle' }}>
                    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
                    <line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                </antd.Tooltip>
              ) },
            ]}
          />
        </div>

        {/* Grid View */}
        {view === 'grid' && (
          filtered.length === 0
            ? emptyNode
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                {filtered.map(app => (
                  <AppGridCard
                    key={app.id}
                    app={app}
                    pinned={pinnedAppIds.includes(app.id)}
                    accentColor={ac}
                    onTogglePin={handleTogglePin}
                  />
                ))}
              </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <antd.Table
            size="small"
            rowKey="id"
            dataSource={filtered}
            columns={listColumns}
            pagination={false}
            locale={{ emptyText: emptyNode }}
          />
        )}

        {/* Bottom padding */}
        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}
