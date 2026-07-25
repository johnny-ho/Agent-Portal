/* ════════════════════════════════════════
   KPI Widget Setting
   - KwiWidgetSettingView  (shared UI)
   - KwiSettingModal       (Dashboard 入口 wrapper)
   ════════════════════════════════════════ */

/* ── IT-defined KPI Catalog (per persona) ── */
var KWS_CATALOG = {
  equipment: [
    { id: 'down-tool', name: 'Down Tool',   system: 'FDC',        unit: '台', desc: '停機設備台數',     defaultDir: 'gt' },
    { id: 'fdc-lv1',  name: 'FDC Level-1', system: 'FDC',        unit: '台', desc: 'Level-1 異常台數', defaultDir: 'gt' },
    { id: 'fdc-lv2',  name: 'FDC Level-2', system: 'FDC',        unit: '台', desc: 'Level-2 異常台數', defaultDir: 'gt' },
    { id: 'unclose',  name: 'Unclose Case', system: 'CaseCenter', unit: '件', desc: '未結案工單數',     defaultDir: 'gt' },
    { id: 'mttr',     name: 'MTTR',         system: 'CMMS',       unit: 'h',  desc: '平均維修時間',     defaultDir: 'gt' },
    { id: 'pm-rate',  name: 'PM 達成率',    system: 'CMMS',       unit: '%',  desc: '預防性保養達成率', defaultDir: 'lt' },
    { id: 'oee',      name: '設備稼動率',   system: 'FDC',        unit: '%',  desc: '機台整體稼動效能', defaultDir: 'lt' },
  ],
  process: [
    { id: 'spc-ooc',     name: 'SPC OOC',    system: 'SPC',        unit: '站', desc: '失控站點數',       defaultDir: 'gt' },
    { id: 'cpk-low',     name: 'CPK < 1.33', system: 'SPC',        unit: '站', desc: 'CPK 偏低站點數',   defaultDir: 'gt' },
    { id: 'yield',       name: '本日良率',   system: 'MES',        unit: '%',  desc: '各站加權良率均值', defaultDir: 'lt' },
    { id: 'unclose',     name: 'Unclose Case',system: 'CaseCenter',unit: '件', desc: '未結案工單數',     defaultDir: 'gt' },
    { id: 'dcr-pending', name: '待審 DCR',   system: 'DCR',        unit: '筆', desc: '待審製程變更數',   defaultDir: 'gt' },
    { id: 'recipe-new',  name: '新 Recipe',  system: 'MES',        unit: '個', desc: '本月新建 Recipe',  defaultDir: 'gt' },
  ],
  mfg: [
    { id: 'output-rate',  name: '產出達成率', system: 'MES', unit: '%', desc: '各線產出 vs 目標',   defaultDir: 'lt' },
    { id: 'line-oee',     name: '線體稼動率', system: 'MES', unit: '%', desc: '各線即時稼動效能',   defaultDir: 'lt' },
    { id: 'downtime',     name: '今日停機',   system: 'FDC', unit: 'h', desc: '今日累計停機時數',   defaultDir: 'gt' },
    { id: 'otd',          name: '準時交貨率', system: 'MES', unit: '%', desc: 'On-Time Delivery 率', defaultDir: 'lt' },
    { id: 'wip-count',    name: 'WIP 批數',   system: 'MES', unit: '批',desc: '在製品批次總數',     defaultDir: 'gt' },
    { id: 'urgent-order', name: '緊急工單',   system: 'MES', unit: '筆',desc: '急單數量',           defaultDir: 'gt' },
  ],
};

/* ── Mock Live Data (simulates API: {KPI, Value, Items, Detail}) ── */
var KWS_LIVE = {
  equipment: {
    'down-tool': { value: 2,    items: ['E101','E102'],                detail: ['Wait PE','Wait MFG'] },
    'fdc-lv1':   { value: 1,    items: ['E308'],                       detail: ['Level-1 電流波動（持續 3h）'] },
    'fdc-lv2':   { value: 0,    items: [],                             detail: [] },
    'unclose':   { value: 7,    items: ['UC-438','UC-440','UC-441','UC-442'], detail: ['E-101 換件追蹤','E-203 壓力異常','E-308 電流波動','E-101 日巡問題'] },
    'mttr':      { value: 2.4,  items: ['E101','E207'],                detail: ['3.2h（最長）','3.5h（逾目標）'] },
    'pm-rate':   { value: 100,  items: [],                             detail: [] },
    'oee':       { value: 92.3, items: ['E308'],                       detail: ['79.8% 拉低均值'] },
  },
  process: {
    'spc-ooc':     { value: 2,    items: ['CMP-3','Etch-1'],           detail: ['Nelson Rule 2','Nelson Rule 6'] },
    'cpk-low':     { value: 1,    items: ['CMP-3'],                    detail: ['CPK=1.21（膜厚均勻性）'] },
    'yield':       { value: 98.7, items: [],                           detail: [] },
    'unclose':     { value: 4,    items: ['PC-021','PC-022'],          detail: ['CMP-3 SPC OOC 未關閉','R-512 良率異常根因'] },
    'dcr-pending': { value: 3,    items: ['DCR-039','DCR-040','DCR-041'], detail: ['R-512 壓力參數調整','CVD 溫度窗口擴大','Etch Rate 優化'] },
    'recipe-new':  { value: 2,    items: ['R-513','R-514'],            detail: ['Qualify 中','Draft 中'] },
  },
  mfg: {
    'output-rate':  { value: 94.8, items: ['Line3'],                   detail: ['89.7%（E-101 停機影響）'] },
    'line-oee':     { value: 87.2, items: ['Line3'],                   detail: ['80.8%（停機 2.5h 影響）'] },
    'downtime':     { value: 2.5,  items: ['E-101'],                   detail: ['冷卻系統壓力異常（已復機）'] },
    'otd':          { value: 96.3, items: [],                          detail: [] },
    'wip-count':    { value: 47,   items: [],                          detail: [] },
    'urgent-order': { value: 2,    items: ['W26-031','W26-035'],       detail: ['交期今日 18:00','交期明日 09:00'] },
  },
};

/* ── Default Seed Configuration (per persona) ── */
var DEFAULT_KWS_CONFIG = {
  equipment: {
    'down-tool': { enabled: true,  order: 1, yellow: null, red: 3,    dir: 'gt' },
    'unclose':   { enabled: true,  order: 2, yellow: 5,   red: 8,    dir: 'gt' },
    'oee':       { enabled: true,  order: 3, yellow: 92,  red: 85,   dir: 'lt' },
    'fdc-lv1':   { enabled: true,  order: 4, yellow: null, red: 2,    dir: 'gt' },
    'mttr':      { enabled: true,  order: 5, yellow: 3,   red: 4,    dir: 'gt' },
    'pm-rate':   { enabled: true,  order: 6, yellow: 95,  red: 90,   dir: 'lt' },
    'fdc-lv2':   { enabled: false, order: 7, yellow: null, red: 1,    dir: 'gt' },
  },
  process: {
    'spc-ooc':     { enabled: true,  order: 1, yellow: null, red: 3,  dir: 'gt' },
    'yield':       { enabled: true,  order: 2, yellow: 98.5, red: 97, dir: 'lt' },
    'unclose':     { enabled: true,  order: 3, yellow: 3,   red: 6,   dir: 'gt' },
    'cpk-low':     { enabled: true,  order: 4, yellow: null, red: 1,  dir: 'gt' },
    'dcr-pending': { enabled: true,  order: 5, yellow: 2,   red: 5,   dir: 'gt' },
    'recipe-new':  { enabled: false, order: 6, yellow: null, red: null,dir: 'gt' },
  },
  mfg: {
    'output-rate':  { enabled: true,  order: 1, yellow: 95, red: 90,  dir: 'lt' },
    'line-oee':     { enabled: true,  order: 2, yellow: 90, red: 85,  dir: 'lt' },
    'downtime':     { enabled: true,  order: 3, yellow: 1,  red: 3,   dir: 'gt' },
    'otd':          { enabled: true,  order: 4, yellow: 95, red: 90,  dir: 'lt' },
    'urgent-order': { enabled: true,  order: 5, yellow: null,red: 1,  dir: 'gt' },
    'wip-count':    { enabled: false, order: 6, yellow: null,red: null,dir: 'gt' },
  },
};

/* ── System Badge Config ── */
var KWS_SYS_CFG = {
  FDC:        { bg: '#EFF6FF', color: '#1D4ED8' },
  CaseCenter: { bg: '#F3F4F6', color: '#374151' },
  CMMS:       { bg: '#FDF4FF', color: '#7E22CE' },
  MES:        { bg: '#F0FDF4', color: '#166534' },
  SPC:        { bg: '#FFF7ED', color: '#C2410C' },
  DCR:        { bg: '#F3F4F6', color: '#6B7280' },
};

/* ── Status dot/text colors ── */
var KWS_STATUS_CFG = {
  ok:    { dot: '#22C55E', text: '#111827' },
  warn:  { dot: '#F59E0B', text: '#F59E0B' },
  alert: { dot: '#EF4444', text: '#EF4444' },
};

/* ── Status Computation ── */
function getKwsStatus(id, cfg, live) {
  if (!cfg || !cfg.enabled) return 'ok';
  var data = (live || {})[id];
  if (!data) return 'ok';
  var v = parseFloat(data.value);
  var hasRed    = cfg.red    !== null && cfg.red    !== undefined && cfg.red    !== '' && !isNaN(parseFloat(cfg.red));
  var hasYellow = cfg.yellow !== null && cfg.yellow !== undefined && cfg.yellow !== '' && !isNaN(parseFloat(cfg.yellow));
  if (cfg.dir === 'lt') {
    if (hasRed    && v <= parseFloat(cfg.red))    return 'alert';
    if (hasYellow && v <= parseFloat(cfg.yellow)) return 'warn';
    return 'ok';
  }
  if (hasRed    && v > parseFloat(cfg.red))    return 'alert';
  if (hasYellow && v > parseFloat(cfg.yellow)) return 'warn';
  return 'ok';
}

/* ════════════════════════════════════════
   Sub-components
   ════════════════════════════════════════ */

function KwsSysBadge({ system}) {
  var { C, fz } = useTheme();
  var sc = KWS_SYS_CFG[system] || { bg: '#F3F4F6', color: C.textSub };
  return (
    <span style={{
      fontSize: fz(9), fontWeight: 700, padding: '2px 5px', borderRadius: 4,
      background: sc.bg, color: sc.color, flexShrink: 0, fontFamily: 'monospace',
    }}>{system}</span>
  );
}

function KwsStatusDot({ status, size}) {
  var s = size || 10;
  var bg = (KWS_STATUS_CFG[status] || KWS_STATUS_CFG.ok).dot;
  return <div style={{ width: s, height: s, borderRadius: '50%', background: bg, flexShrink: 0 }} />;
}

/* Toggle → AntD Switch（Phase 1 遷移；size=small 對齊原 32×18 尺寸） */
function KwiToggle({ checked, onChange}) {
  return <antd.Switch size="small" checked={checked} onChange={onChange} />;
}

/* ── Threshold Input (optional: empty = no alert) ── AntD InputNumber（Phase 1 遷移） */
function KwsThresholdInput({ level, value, onChange, unit, dir}) {
  var { C, fz } = useTheme();
  var isRed = level === 'red';
  var dotColor = isRed ? '#EF4444' : '#F59E0B';
  var label    = isRed ? '紅色告警' : '黃色警示';
  var op       = dir === 'lt' ? '<' : '>';
  var hasVal   = value !== null && value !== undefined && value !== '';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
      <span style={{ fontSize: fz(12), color: C.textMuted, minWidth: 52 }}>{label}</span>
      <span style={{ fontSize: fz(12), color: C.textMuted }}>Value {op}</span>
      <antd.InputNumber
        size="small"
        value={hasVal ? value : null}
        placeholder="不設定"
        addonAfter={unit}
        controls={false}
        onChange={function(v){ onChange(v === null || v === undefined ? null : v); }}
        style={{ width: 116 }}
      />
      {!hasVal && (
        <span style={{ fontSize: fz(11), color: C.textMuted, fontStyle: 'italic' }}>不告警</span>
      )}
    </div>
  );
}

/* ── Preview Cell (in Widget preview panel) ── */
function KwsPreviewCell({ kpi, cfg, live, isLastCol, isLastRow}) {
  var { C, fz } = useTheme();
  var [hover, setHover] = React.useState(false);
  var data   = (live || {})[kpi.id] || { value: '—', items: [], detail: [] };
  var status = getKwsStatus(kpi.id, cfg, live);
  var sc = KWS_STATUS_CFG[status] || KWS_STATUS_CFG.ok;
  var hasItems = data.items && data.items.length > 0;

  /* 明細 tooltip 內容（Phase 1：手刻定位彈窗 → AntD Tooltip） */
  var tipContent = hasItems ? (
    <div style={{ minWidth: 180 }}>
      <div style={{ fontSize: fz(11), fontWeight: 700, marginBottom: 6 }}>
        {kpi.name} — {data.value}{kpi.unit}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {data.items.map(function(item, i) {
          return (
            <div key={i} style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: fz(11), fontWeight: 600, color: '#93C5FD', flexShrink: 0, minWidth: 60 }}>{item}</span>
              <span style={{ fontSize: fz(11), color: '#D1D5DB', lineHeight: 1.4 }}>{(data.detail || [])[i]}</span>
            </div>
          );
        })}
      </div>
    </div>
  ) : null;

  var cell = (
    <div
      onMouseEnter={function(){ setHover(true); }}
      onMouseLeave={function(){ setHover(false); }}
      style={{
        padding: '12px 16px', cursor: 'default',
        display: 'flex', flexDirection: 'column', gap: 4,
        background: hover ? C.hover : 'transparent', transition: 'background 0.1s',
        borderRight: !isLastCol ? '1px solid ' + C.border : 'none',
        borderBottom: !isLastRow ? '1px solid ' + C.border : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: sc.dot }} />
        <span style={{ fontSize: fz(11), color: C.textMuted, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {kpi.name}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{ fontSize: fz(22), fontWeight: 700, lineHeight: 1, color: status === 'ok' ? C.text : sc.text }}>{data.value}</span>
        <span style={{ fontSize: fz(12), color: C.textMuted }}>{kpi.unit}</span>
      </div>
      <div style={{ fontSize: fz(10), color: C.textMuted }}>
        {hasItems ? data.items.length + ' 個明細 · 移入查看' : '全數正常'}
      </div>
    </div>
  );

  return tipContent
    ? <antd.Tooltip title={tipContent} placement="top" overlayStyle={{ maxWidth: 280 }}>{cell}</antd.Tooltip>
    : cell;
}

/* ── Preview Widget (right panel) ── */
function KwsPreviewWidget({ p, config}) {
  var { C, fz } = useTheme();
  var catalog = KWS_CATALOG[p.key] || [];
  var live    = KWS_LIVE[p.key] || {};
  var COLS = 3;

  var enabledKpis = catalog
    .filter(function(k) { return config[k.id] && config[k.id].enabled; })
    .sort(function(a, b) {
      return ((config[a.id] || {}).order || 99) - ((config[b.id] || {}).order || 99);
    });

  var rows = Math.ceil(enabledKpis.length / COLS);
  var warnCount = enabledKpis.filter(function(k) {
    return getKwsStatus(k.id, config[k.id], live) !== 'ok';
  }).length;
  var okCount = enabledKpis.length - warnCount;

  return (
    <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 8, overflow: 'visible' }}>
      {/* Widget header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
        borderBottom: '1px solid ' + C.border,
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 5l4 4 4-4" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontSize: fz(14), fontWeight: 600, color: C.text }}>KPI Summary</span>
        <span style={{ fontSize: fz(9), fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: C.hover, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>本班即時</span>
        {warnCount > 0 && (
          <span style={{ fontSize: fz(11), fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>
            {warnCount} 項待關注
          </span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: fz(11), color: C.textMuted }}>{okCount}/{enabledKpis.length} 達標</span>
      </div>

      {enabledKpis.length === 0 ? (
        <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: fz(12), color: C.textMuted }}>
          尚未啟用任何 KPI，請在左側目錄中開啟
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(' + COLS + ', 1fr)' }}>
          {enabledKpis.map(function(kpi, i) {
            var col = i % COLS;
            var row = Math.floor(i / COLS);
            return (
              <KwsPreviewCell
                key={kpi.id}
                kpi={kpi}
                cfg={config[kpi.id]}
                live={live}
                isLastCol={col === COLS - 1 || i === enabledKpis.length - 1}
                isLastRow={row === rows - 1}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   KwiWidgetSettingView — 主設定 UI
   ════════════════════════════════════════ */
function KwiWidgetSettingView({ p, config, onChange, onSaved}) {
  var { C, fz } = useTheme();
  var catalog = KWS_CATALOG[p.key] || [];
  var live    = KWS_LIVE[p.key] || {};

  var [sysFilter, setSysFilter] = React.useState('全部');
  var [dragId, setDragId]       = React.useState(null);
  var [dragOverId, setDragOverId] = React.useState(null);
  var [saved, setSaved]         = React.useState(false);

  var systems = ['全部'].concat(
    catalog.reduce(function(acc, k) {
      if (acc.indexOf(k.system) === -1) acc.push(k.system);
      return acc;
    }, [])
  );

  var sortedCatalog = catalog.slice().sort(function(a, b) {
    return ((config[a.id] || {}).order || 99) - ((config[b.id] || {}).order || 99);
  });

  var displayCatalog = sysFilter === '全部'
    ? sortedCatalog
    : sortedCatalog.filter(function(k) { return k.system === sysFilter; });

  var enabledCount = sortedCatalog.filter(function(k) { return config[k.id] && config[k.id].enabled; }).length;
  var filterActive = sysFilter !== '全部';

  /* ── Config helpers ── */
  function updateKpi(id, patch) {
    var cur = config[id] || { enabled: false, order: 99, yellow: null, red: null, dir: 'gt' };
    onChange(Object.assign({}, config, { [id]: Object.assign({}, cur, patch) }));
  }

  function toggleEnabled(kpi) {
    var cur = config[kpi.id] || { enabled: false, order: 99, yellow: null, red: null, dir: kpi.defaultDir };
    onChange(Object.assign({}, config, { [kpi.id]: Object.assign({}, cur, { enabled: !cur.enabled }) }));
  }

  /* ── Drag & Drop (disabled when filter active) ── */
  function handleDragStart(e, id) {
    if (filterActive) return;
    setDragId(id);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e, id) {
    e.preventDefault();
    if (filterActive || !dragId) return;
    setDragOverId(id);
  }

  function handleDrop(e, targetId) {
    e.preventDefault();
    if (!dragId || dragId === targetId || filterActive) {
      setDragId(null); setDragOverId(null);
      return;
    }
    var fromIdx = sortedCatalog.findIndex(function(k) { return k.id === dragId; });
    var toIdx   = sortedCatalog.findIndex(function(k) { return k.id === targetId; });
    var newOrder = sortedCatalog.slice();
    var moved = newOrder.splice(fromIdx, 1)[0];
    newOrder.splice(toIdx, 0, moved);
    var newConfig = Object.assign({}, config);
    newOrder.forEach(function(k, i) {
      newConfig[k.id] = Object.assign({}, newConfig[k.id] || {}, { order: i + 1 });
    });
    onChange(newConfig);
    setDragId(null); setDragOverId(null);
  }

  function handleDragEnd() {
    setDragId(null); setDragOverId(null);
  }

  /* ── Save ── */
  function handleSave() {
    setSaved(true);
    setTimeout(function() { setSaved(false); }, 2000);
    if (onSaved) onSaved();
  }

  /* ── Validation ── */
  function isInvalid(cfg) {
    if (!cfg || !cfg.enabled) return false;
    var hasR = cfg.red    !== null && cfg.red    !== undefined && cfg.red    !== '';
    var hasY = cfg.yellow !== null && cfg.yellow !== undefined && cfg.yellow !== '';
    if (!hasR || !hasY) return false;
    if (cfg.dir === 'gt') return parseFloat(cfg.yellow) > parseFloat(cfg.red);
    return parseFloat(cfg.yellow) < parseFloat(cfg.red);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>

      {/* ── Toolbar ── */}
      <div style={{
        padding: '0 24px', minHeight: 56, flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 16,
        borderBottom: '1px solid ' + C.border, background: C.bg,
      }}>
        <div>
          <div style={{ fontSize: fz(18), fontWeight: 600, color: C.text }}>KPI Summary Widget 設定</div>
          <div style={{ fontSize: fz(12), color: C.textMuted }}>{p.name} · Seed 配置</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {saved && <span style={{ fontSize: fz(12), color: '#22C55E', fontWeight: 600 }}>✓ 設定已儲存</span>}
          <antd.Button type="primary" onClick={handleSave}>儲存設定</antd.Button>
        </div>
      </div>

      {/* ── Body: two-column ── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>

        {/* LEFT: Catalog list */}
        <div style={{ flex: 3, minWidth: 0, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }} className="scrollbar-thin">

          {/* Catalog header */}
          <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 8, padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: fz(14), fontWeight: 600, color: C.text }}>KPI 目錄</div>
                <div style={{ fontSize: fz(12), color: C.textMuted, marginTop: 2 }}>IT 定義可用 KPI，Seed 選擇啟用並設定告警條件。拖曳調整排序。</div>
              </div>
              <span style={{ fontSize: fz(12), fontWeight: 600, color: '#2563EB', background: '#EFF6FF', padding: '3px 10px', borderRadius: 999 }}>
                {enabledCount} 個已啟用
              </span>
            </div>
            {/* System filter → AntD Segmented（膠囊 tabs 對應） */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <antd.Segmented
                size="small"
                value={sysFilter}
                onChange={setSysFilter}
                options={systems}
              />
              {filterActive && (
                <span style={{ fontSize: fz(11), color: C.textMuted, marginLeft: 4 }}>
                  · 篩選中，切至「全部」才能調整排序
                </span>
              )}
            </div>
          </div>

          {/* KPI rows */}
          {displayCatalog.map(function(kpi) {
            var cfg = config[kpi.id] || { enabled: false, order: 99, yellow: null, red: null, dir: kpi.defaultDir };
            var status = cfg.enabled ? getKwsStatus(kpi.id, cfg, live) : null;
            var isDragging = dragId === kpi.id;
            var isDragOver = dragOverId === kpi.id;
            var data = live[kpi.id];

            return (
              <div key={kpi.id}
                draggable={!filterActive}
                onDragStart={function(e){ handleDragStart(e, kpi.id); }}
                onDragOver={function(e){ handleDragOver(e, kpi.id); }}
                onDrop={function(e){ handleDrop(e, kpi.id); }}
                onDragEnd={handleDragEnd}
                style={{
                  borderRadius: 6,
                  border: isDragOver
                    ? '2px solid #2563EB'
                    : cfg.enabled ? '1px solid rgba(37,99,235,0.3)' : '1px solid ' + C.border,
                  background: isDragging ? 'rgba(37,99,235,0.04)' : cfg.enabled ? C.hoverAccent : C.bg,
                  opacity: isDragging ? 0.5 : 1,
                  cursor: filterActive ? 'default' : 'grab',
                  transition: 'border-color 0.1s, background 0.1s',
                  overflow: 'hidden',
                }}
              >
                {/* Row header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
                  {/* Drag handle */}
                  <div style={{ color: filterActive ? '#D1D5DB' : '#9CA3AF', fontSize: fz(14), cursor: filterActive ? 'default' : 'grab', flexShrink: 0, lineHeight: 1, userSelect: 'none' }}>⠿</div>

                  {/* Status dot */}
                  {status
                    ? <div style={{ width: 10, height: 10, borderRadius: '50%', background: (KWS_STATUS_CFG[status] || KWS_STATUS_CFG.ok).dot, flexShrink: 0 }} />
                    : <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E5E7EB', flexShrink: 0 }} />
                  }

                  {/* KPI info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: fz(13), fontWeight: cfg.enabled ? 600 : 400, color: cfg.enabled ? C.text : C.textMuted }}>
                        {kpi.name}
                      </span>
                      <KwsSysBadge system={kpi.system} />
                      {(cfg.dir || kpi.defaultDir) === 'lt' && (
                        <span style={{ fontSize: fz(9), color: C.textMuted, background: '#F3F4F6', padding: '1px 5px', borderRadius: 3 }}>↓ 低值告警</span>
                      )}
                    </div>
                    <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 1 }}>{kpi.desc} · {kpi.unit}</div>
                  </div>

                  {/* Live value preview */}
                  {cfg.enabled && data && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: fz(16), fontWeight: 700, lineHeight: 1, color: status === 'ok' ? C.text : (KWS_STATUS_CFG[status] || KWS_STATUS_CFG.ok).text }}>
                        {data.value}
                      </div>
                      <div style={{ fontSize: fz(10), color: C.textMuted }}>{kpi.unit}</div>
                    </div>
                  )}

                  {/* Toggle */}
                  <KwiToggle checked={cfg.enabled} onChange={function(){ toggleEnabled(kpi); }} />
                </div>

                {/* Expanded threshold config */}
                {cfg.enabled && (
                  <div style={{
                    padding: '12px 12px 12px 48px',
                    borderTop: '1px solid rgba(37,99,235,0.12)',
                    background: C.bgSub,
                    display: 'flex', flexDirection: 'column', gap: 8,
                  }}>
                    {/* Direction toggle → AntD Segmented */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: fz(11), color: C.textMuted, minWidth: 52 }}>告警方向</span>
                      <antd.Segmented
                        size="small"
                        value={cfg.dir || kpi.defaultDir}
                        onChange={function(val){ updateKpi(kpi.id, { dir: val }); }}
                        options={[
                          { label: '↑ 高值告警', value: 'gt' },
                          { label: '↓ 低值告警', value: 'lt' },
                        ]}
                      />
                    </div>
                    {/* Thresholds */}
                    <KwsThresholdInput level="yellow" value={cfg.yellow} unit={kpi.unit} dir={cfg.dir || kpi.defaultDir}
                      onChange={function(v){ updateKpi(kpi.id, { yellow: v }); }} />
                    <KwsThresholdInput level="red" value={cfg.red} unit={kpi.unit} dir={cfg.dir || kpi.defaultDir}
                      onChange={function(v){ updateKpi(kpi.id, { red: v }); }} />
                    {/* Validation */}
                    {isInvalid(cfg) && (
                      <div style={{ fontSize: fz(11), color: '#EF4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>⚠</span>
                        <span>{(cfg.dir || kpi.defaultDir) === 'gt' ? '黃色閾值不應大於紅色閾值' : '黃色閾值不應小於紅色閾值'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT: Preview + Info */}
        <div style={{ flex: 2, minWidth: 380, borderLeft: '1px solid ' + C.border, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }} className="scrollbar-thin">

          {/* Preview */}
          <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: fz(13), fontWeight: 600, color: C.text, marginBottom: 4 }}>Widget 即時預覽</div>
            <div style={{ fontSize: fz(11), color: C.textMuted, marginBottom: 16 }}>Hover 格子可查看明細 · Mock 資料</div>
            <KwsPreviewWidget p={p} config={config} />
          </div>

          {/* Legend */}
          <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: fz(12), fontWeight: 600, color: C.text, marginBottom: 10 }}>狀態燈號</div>
            {[
              { status: 'ok',    label: '正常',    desc: '未超過任一閾值（或未設定）' },
              { status: 'warn',  label: '黃色警示', desc: '超過黃色閾值' },
              { status: 'alert', label: '紅色告警', desc: '超過紅色閾值，需立即關注' },
            ].map(function(item) {
              return (
                <div key={item.status} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <KwsStatusDot status={item.status} size={10} />
                  <span style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub, minWidth: 60 }}>{item.label}</span>
                  <span style={{ fontSize: fz(12), color: C.textMuted }}>{item.desc}</span>
                </div>
              );
            })}
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #F3F4F6', fontSize: fz(11), color: C.textMuted, lineHeight: 1.6 }}>
              ↑ 高值告警：Value 超過閾值觸發<br />
              ↓ 低值告警：Value 低於閾值觸發<br />
              閾值空白 = 該級別不觸發
            </div>
          </div>

          {/* Data contract */}
          <div style={{ background: '#1F2937', borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: fz(12), fontWeight: 600, color: '#E5E7EB', marginBottom: 8 }}>系統資料格式（IT 定義）</div>
            <pre style={{ fontSize: fz(11), color: '#93C5FD', lineHeight: 1.7, margin: 0, whiteSpace: 'pre', fontFamily: 'monospace' }}>
{'{'}
{'  "KPI":    "Down Tool",'}
{'  "Value":  2,'}
{'  "Items":  ["E101", "E102"],'}
{'  "Detail": ["Wait PE", "Wait MFG"]'}
{'}'}
            </pre>
            <div style={{ marginTop: 8, fontSize: fz(11), color: C.textMuted }}>Items[i] → Detail[i] 對應 hover 明細</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   KwiSettingModal — Dashboard 入口 wrapper
   ════════════════════════════════════════ */
function KwiSettingModal({ p, config, onChange, onClose}) {
  var { fz } = useTheme();
  return (
    <antd.Modal
      open={true}
      onCancel={onClose}
      footer={null}
      width="92vw"
      style={{ maxWidth: 1100, top: 24, paddingBottom: 0 }}
      styles={{ body: { height: '82vh', padding: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' } }}
      title={
        <span>
          <span style={{ fontSize: fz(13), fontWeight: 600 }}>⚙ KPI Widget 設定</span>
          <span style={{ fontSize: fz(12), color: '#9E9E9E', marginLeft: 8 }}>— 從 Dashboard 開啟</span>
        </span>
      }
    >
      <KwiWidgetSettingView p={p} config={config} onChange={onChange} onSaved={onClose} />
    </antd.Modal>
  );
}
