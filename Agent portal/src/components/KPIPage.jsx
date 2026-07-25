/* ════════════════════════════════════════
   KPI 報表中心
   Left: Bookmark list  |  Right: Mock report embed
   ════════════════════════════════════════ */

const KPI_BOOKMARKS = {
  equipment: {
    groups: [
      { label: '設備效能', items: [
        { id: 'eq-1', name: '設備稼動率總表',  sub: '各機台即時稼動狀態',       src: 'fdc' },
        { id: 'eq-2', name: 'FDC 異常紀錄',    sub: '近 30 天異常事件彙整',     src: 'fdc' },
        { id: 'eq-3', name: 'MTTR 趨勢分析',   sub: '每月平均維修時間趨勢',     src: 'custom' },
      ]},
      { label: '維修管理', items: [
        { id: 'eq-4', name: 'Unclose Case 看板', sub: '待結案工單即時清單',      src: 'custom' },
        { id: 'eq-5', name: 'PM 達成率報表',    sub: '本月預防性保養達成狀態',  src: 'pbi' },
      ]},
      { label: '停機分析', items: [
        { id: 'eq-6', name: '停機小時數分析',   sub: '每日 / 週 / 月停機時數',  src: 'pbi' },
      ]},
    ],
    demo: {
      title: '設備稼動率總表',
      src: 'fdc',
      updated: '2 分鐘前',
      cards: [
        { label: '設備稼動率',   value: '92.3', unit: '%', delta: '▼ -0.5%',   bad: true,  target: '目標 95%' },
        { label: 'MTTR',         value: '2.4',  unit: 'h', delta: '▼ -0.3h',   bad: false, target: '目標 ≤3h' },
        { label: 'FDC 異常台數', value: '2',    unit: '台', delta: '— 持續中', bad: true,  target: '目標 0' },
        { label: 'Unclose Case', value: '7',    unit: '件', delta: '▲ +2',     bad: true,  target: '目標 ≤5' },
      ],
      bars: [88, 91, 93, 90, 89, 92, 94, 92, 91, 92, 93, 92],
      barLabels: ['4/8','4/9','4/10','4/11','4/12','4/13','4/14','4/15','4/16','4/17','4/18','今'],
      target: 95,
    },
  },

  process: {
    groups: [
      { label: '製程品質', items: [
        { id: 'pr-1', name: '良率趨勢圖',     sub: '每日 / 週良率走勢',                src: 'pbi' },
        { id: 'pr-2', name: 'SPC 管制圖',     sub: '所有站點即時管制圖',              src: 'spc' },
        { id: 'pr-3', name: 'CPK 分佈報表',   sub: '各站 CPK 值分佈',                 src: 'spc' },
      ]},
      { label: '製程變更', items: [
        { id: 'pr-4', name: 'DCR 追蹤看板',   sub: '待審 / 進行中 DCR 清單',         src: 'custom' },
      ]},
      { label: '配方管理', items: [
        { id: 'pr-5', name: 'Recipe 清單與狀態', sub: 'Active / Qualify 中 Recipe', src: 'mes' },
      ]},
    ],
    demo: {
      title: '良率趨勢圖',
      src: 'pbi',
      updated: '5 分鐘前',
      cards: [
        { label: '本日良率',     value: '98.7', unit: '%', delta: '▲ +0.2%', bad: false, target: '目標 98.5%' },
        { label: 'SPC 失控站點', value: '2',    unit: '站', delta: '▲ +1',   bad: true,  target: '目標 0' },
        { label: 'CPK < 1.33',   value: '1',    unit: '站', delta: '— 持續', bad: true,  target: '目標 0' },
        { label: '待審 DCR',     value: '3',    unit: '筆', delta: '▲ +1',   bad: true,  target: '需處理' },
      ],
      bars: [98.2, 98.5, 98.3, 98.7, 98.4, 98.6, 98.8, 98.5, 98.7, 98.9, 98.6, 98.7],
      barLabels: ['4/8','4/9','4/10','4/11','4/12','4/13','4/14','4/15','4/16','4/17','4/18','今'],
      target: 98.5,
    },
  },

  mfg: {
    groups: [
      { label: '產能追蹤', items: [
        { id: 'mfg-1', name: '產出達成率',      sub: '各線每日產出 vs 目標',     src: 'pbi' },
        { id: 'mfg-2', name: '線體稼動率',      sub: '各線即時稼動狀態',         src: 'pbi' },
      ]},
      { label: 'WIP 管理', items: [
        { id: 'mfg-3', name: 'WIP 在製批數',    sub: '各站點 WIP 分布',          src: 'mes' },
        { id: 'mfg-4', name: 'Priority Lot 狀態', sub: '急單批次即時追蹤',      src: 'mes' },
      ]},
      { label: '交期管理', items: [
        { id: 'mfg-5', name: '準時交貨率趨勢',  sub: '每日 OTD 達成率',          src: 'pbi' },
      ]},
    ],
    demo: {
      title: '產出達成率',
      src: 'pbi',
      updated: '3 分鐘前',
      cards: [
        { label: '產出達成率',   value: '94.8', unit: '%', delta: '▼ -5.2%', bad: true,  target: '目標 100%' },
        { label: '線體稼動率',   value: '87.2', unit: '%', delta: '▼ -2.1%', bad: true,  target: '目標 90%' },
        { label: '準時交貨率',   value: '96.3', unit: '%', delta: '▲ +0.5%', bad: false, target: '目標 95%' },
        { label: 'WIP 在製批數', value: '47',   unit: '批', delta: '— 正常',  bad: false, target: '正常範圍' },
      ],
      bars: [97, 98, 95, 92, 96, 94, 93, 95, 97, 95, 96, 94.8],
      barLabels: ['4/8','4/9','4/10','4/11','4/12','4/13','4/14','4/15','4/16','4/17','4/18','今'],
      target: 100,
    },
  },
};

const KPI_SRC_CFG = {
  pbi:    { label: 'PBI',  bg: '#FFF7ED', color: '#C2410C' },
  fdc:    { label: 'FDC',  bg: '#EFF6FF', color: '#1D4ED8' },
  spc:    { label: 'SPC',  bg: '#F0FDF4', color: '#166534' },
  mes:    { label: 'MES',  bg: '#FDF4FF', color: '#7E22CE' },
  custom: { label: '自建', bg: '#F3F4F6', color: '#374151' },
};

/* AntD 遷移 Phase 4：來源標籤改 Tag，色系沿用上表（Tag 以 style 帶入以維持
   原有品牌色，不用 AntD preset color 以免與 guideline 四色偏離）。 */
function KpiSrcTag({ src, size }) {
  var { fz } = useTheme();
  const cfg = KPI_SRC_CFG[src] || KPI_SRC_CFG.custom;
  return (
    <antd.Tag style={{
      marginInlineEnd: 0, background: cfg.bg, color: cfg.color, borderColor: 'transparent',
      fontSize: fz(size || 10), fontWeight: 700, lineHeight: '18px', paddingInline: 6,
    }}>{cfg.label}</antd.Tag>
  );
}

function KPIPage({ p, onAskAI}) {
  var { C, fz } = useTheme();
  const kpiData = KPI_BOOKMARKS[p.key] || KPI_BOOKMARKS.equipment;
  const allItems = kpiData.groups.flatMap(g => g.items);
  const [activeId, setActiveId] = React.useState(allItems[0]?.id);
  const [searchVal, setSearchVal] = React.useState('');
  const demo = kpiData.demo;

  const filteredGroups = searchVal.trim()
    ? [{ label: '搜尋結果', items: allItems.filter(it => it.name.includes(searchVal) || it.sub.includes(searchVal)) }]
    : kpiData.groups;

  const maxBar = Math.max(...demo.bars);
  const minBar = Math.min(...demo.bars);
  const abnormal = (p.mustBeZero || []).filter(m => !m.ok);

  const handleKpiAskAI = () => {
    if (!onAskAI) return;
    const srcLabel = KPI_SRC_CFG[demo.src]?.label || demo.src;
    const ctx = `【報表名稱】${demo.title}\n【系統來源】${srcLabel}\n【更新時間】${demo.updated}`;
    onAskAI({ text: ctx, label: demo.title });
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>

        {/* LEFT — Bookmark list */}
        <div style={{
          width: 240, borderRight: '1px solid ' + C.border,
          display: 'flex', flexDirection: 'column',
          background: C.bg, flexShrink: 0,
        }}>
          {/* Search — 以 inline label 取代 placeholder 代 label（guideline） */}
          <div style={{ padding: 16, borderBottom: '1px solid ' + C.border, flexShrink: 0 }}>
            <div style={{ fontSize: fz(13), fontWeight: 700, color: C.text, marginBottom: 8 }}>書籤清單</div>
            <antd.Input
              size="small"
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              allowClear
              aria-label="搜尋報表"
              prefix={<span style={{ color: C.textMuted, fontSize: fz(12) }}>🔍</span>}
              placeholder="報表名稱"
            />
          </div>

          {/* Groups — 每組一個 List（維持分組資訊架構） */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }} className="scrollbar-thin">
            {filteredGroups.map(grp => (
              <div key={grp.label}>
                <div style={{
                  fontSize: fz(10), fontWeight: 700, color: C.textMuted,
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  padding: '8px 16px 4px',
                }}>{grp.label}</div>
                <antd.List
                  dataSource={grp.items}
                  split={false}
                  locale={{ emptyText: <antd.Empty image={antd.Empty.PRESENTED_IMAGE_SIMPLE} description={<span style={{ fontSize: fz(12), color: C.textMuted }}>沒有符合的報表</span>} /> }}
                  renderItem={item => {
                    const isActive = activeId === item.id;
                    return (
                      <antd.List.Item
                        onClick={() => setActiveId(item.id)}
                        style={{
                          padding: '8px 16px', cursor: 'pointer', borderBlockEnd: 'none',
                          backgroundColor: isActive ? C.hoverAccent : 'transparent',
                          borderLeft: isActive ? '3px solid #2563EB' : '3px solid transparent',
                        }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = C.hover; }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', minWidth: 0 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: fz(13), fontWeight: isActive ? 600 : 400,
                              color: isActive ? '#2563EB' : C.textSub,
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>{item.name}</div>
                            <div style={{ fontSize: fz(10), color: C.textMuted }}>{item.sub}</div>
                          </div>
                          <KpiSrcTag src={item.src} size={9} />
                        </div>
                      </antd.List.Item>
                    );
                  }}
                />
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid ' + C.border, fontSize: fz(11), color: C.textMuted, flexShrink: 0 }}>
            ⚙ Seed 管理書籤與分類
          </div>
        </div>

        {/* RIGHT — Report view */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Report toolbar */}
          <div style={{
            background: C.bg, borderBottom: '1px solid ' + C.border,
            padding: '0 24px', height: 48,
            display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
          }}>
            <span style={{ fontSize: fz(15), fontWeight: 600, color: C.text }}>{demo.title}</span>
            <KpiSrcTag src={demo.src} size={10} />
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: fz(11), color: C.textMuted }}>更新 {demo.updated}</span>
              {onAskAI && (
                <antd.Button size="small" onClick={handleKpiAskAI} style={{ color: '#2563EB', borderColor: 'rgba(37,99,235,0.4)' }}>
                  ✦ Ask AI
                </antd.Button>
              )}
              <antd.Button size="small">↗ 在原系統開啟</antd.Button>
            </div>
          </div>

          {/* Embedded report frame */}
          <div style={{
            flex: 1, overflow: 'hidden', margin: 16, borderRadius: 8,
            border: '1px solid ' + C.border, display: 'flex', flexDirection: 'column', background: C.bg,
          }}>
            {/* Mock system topbar — 刻意保留自製：此處在模擬「外部報表系統」的
                介面（PBI / FDC / SPC 的 iframe chrome），不套用本產品的設計語言，
                否則會看不出是嵌入的他系統畫面。 */}
            <div style={{
              background: C.bgPanel, borderBottom: '1px solid ' + C.border,
              padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
            }}>
              <span style={{ fontSize: fz(12), fontWeight: 700, color: KPI_SRC_CFG[demo.src].color }}>{KPI_SRC_CFG[demo.src].label}</span>
              <span style={{ fontSize: fz(12), color: C.textSub }}>{demo.title}</span>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 0 }}>
                {['概覽', '趨勢', '明細'].map((tab, ti) => (
                  <span key={tab} style={{
                    fontSize: fz(11), padding: '3px 12px', cursor: 'pointer',
                    color: ti === 0 ? '#2563EB' : '#6B7280',
                    borderBottom: ti === 0 ? '2px solid #2563EB' : '2px solid transparent',
                    fontWeight: ti === 0 ? 600 : 400,
                  }}>{tab}</span>
                ))}
              </div>
            </div>

            {/* Report body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: C.bgSub, display: 'flex', flexDirection: 'column', gap: 16 }} className="scrollbar-thin">

              {/* KPI summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {demo.cards.map((card, i) => (
                  <antd.Card key={i} size="small" styles={{ body: { padding: 16 } }}
                    style={{ borderColor: card.bad ? 'rgba(239,68,68,0.25)' : C.border }}>
                    <antd.Statistic
                      title={<span style={{ fontSize: fz(11), color: C.textMuted }}>{card.label}</span>}
                      value={card.value}
                      suffix={<span style={{ fontSize: fz(13), fontWeight: 400, color: C.textMuted }}>{card.unit}</span>}
                      valueStyle={{ fontSize: fz(24), fontWeight: 700, lineHeight: 1, color: card.bad ? '#EF4444' : C.text }}
                    />
                    <div style={{
                      fontSize: fz(12), marginTop: 8,
                      color: card.bad ? '#EF4444'
                           : (card.delta.startsWith('▲') || card.delta.startsWith('▼')) ? '#10B981'
                           : C.textMuted,
                    }}>{card.delta}</div>
                    <div style={{ fontSize: fz(11), color: C.textMuted }}>{card.target}</div>
                  </antd.Card>
                ))}
              </div>

              {/* Chart + Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>

                {/* Bar chart — 長條圖本體保留自製（AntD 無圖表元件） */}
                <antd.Card size="small" styles={{ body: { padding: 16 } }}>
                  <div style={{ fontSize: fz(13), fontWeight: 600, color: C.text, marginBottom: 4 }}>
                    {demo.title} — 近 12 日趨勢
                  </div>
                  <div style={{ fontSize: fz(11), color: C.textMuted, marginBottom: 16 }}>
                    來源：{KPI_SRC_CFG[demo.src].label} · 每日更新
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 88 }}>
                    {demo.bars.map((v, i) => {
                      const range = maxBar - minBar || 1;
                      const h = Math.max(16, ((v - minBar + range * 0.1) / (range * 1.2)) * 80);
                      const isToday = i === demo.bars.length - 1;
                      const isBad = v < demo.target;
                      return (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                          <div
                            title={`${demo.barLabels[i]}: ${v}`}
                            style={{
                              width: '100%', height: h, borderRadius: '3px 3px 0 0', cursor: 'pointer',
                              background: isToday ? '#2563EB' : isBad ? '#FCA5A5' : '#BFDBFE',
                            }}
                          />
                          <div style={{ fontSize: fz(9), color: C.textMuted, whiteSpace: 'nowrap' }}>
                            {demo.barLabels[i]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {[['#BFDBFE','達標'],['#FCA5A5','未達標'],['#2563EB','今日']].map(([bg, label]) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: bg }} />
                        <span style={{ fontSize: fz(11), color: C.textMuted }}>{label}</span>
                      </div>
                    ))}
                    <span style={{ fontSize: fz(11), color: C.textMuted, marginLeft: 8 }}>目標線 {demo.target}</span>
                  </div>
                </antd.Card>

                {/* Status summary */}
                <antd.Card size="small" style={{ height: '100%' }}
                  styles={{ body: { padding: 16, display: 'flex', flexDirection: 'column', gap: 8, height: '100%' } }}>
                  <div style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>異常摘要</div>
                  {abnormal.length > 0 ? (
                    <antd.List
                      dataSource={abnormal}
                      split={false}
                      renderItem={m => (
                        <antd.List.Item style={{ padding: '4px 0', borderBlockEnd: 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                            <antd.Badge color="#EF4444" />
                            <span style={{ fontSize: fz(12), color: C.textSub, flex: 1 }}>{m.label}</span>
                            <span style={{ fontSize: fz(12), fontWeight: 700, color: '#EF4444' }}>{m.value}</span>
                          </div>
                        </antd.List.Item>
                      )}
                    />
                  ) : (
                    <div style={{ fontSize: fz(12), color: '#10B981', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <antd.Badge color="#10B981" />
                      所有指標正常
                    </div>
                  )}
                  <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: '1px solid ' + C.border }}>
                    <div style={{ fontSize: fz(11), color: C.textMuted }}>最後更新</div>
                    <div style={{ fontSize: fz(12), color: C.textSub, fontWeight: 500, marginTop: 2 }}>{demo.updated} 前</div>
                  </div>
                </antd.Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
