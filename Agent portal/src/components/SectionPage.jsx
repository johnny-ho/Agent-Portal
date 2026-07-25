/* ════════════════════════════════════════
   DASHBOARD PAGE
   (Section Zone + Personal Zone)
   ════════════════════════════════════════ */

/* ── Static mock data keyed by persona ── */

const BULLETINS = {
  equipment: [
    {
      id: 1, author: '林課長', av: '林', avColor: '#2563EB',
      role: 'all', pinned: true, isRead: false,
      title: '04/21 起強制執行新版換件 Skill v2.3',
      content: '請所有同仁確認閱讀「CMP 研磨頭定期更換 Skill v2.3」，04/21 起正式強制執行，未確認者將記錄在案。',
      time: '今天 09:00', readCount: 2, totalCount: 5,
    },
    {
      id: 2, author: '林課長', av: '林', avColor: '#2563EB',
      role: 'ee', pinned: false, isRead: true,
      title: 'E-203 PM 今日 16:00 進行，請避免關聯作業',
      content: '執行 PM 期間（16:00–18:00）請避免安排 E-203 相關設備確認作業，備料已就位。',
      time: '今天 08:30', readCount: 4, totalCount: 5,
    },
    {
      id: 3, author: '王志明', av: '王', avColor: '#22C55E',
      role: 'ee', pinned: false, isRead: true,
      title: '本週 Unclose Case 清零行動 — 請確認負責工單',
      content: '目前課內 Unclose Case 7 件，本週五前目標清零，請各自確認並優先處理，有阻礙請及時回報。',
      time: '昨天 17:00', readCount: 5, totalCount: 5,
    },
  ],
  process: [
    {
      id: 1, author: '李佳穎', av: '李', avColor: '#22C55E',
      role: 'all', pinned: true, isRead: false,
      title: 'SPC 失控案例演練本週五 14:00 執行',
      content: '本週五 14:00 進行全課 SPC 失控演練，請確認出席，全員強制參加，不可請假。',
      time: '今天 09:30', readCount: 1, totalCount: 5,
    },
    {
      id: 2, author: '李佳穎', av: '李', avColor: '#22C55E',
      role: 'pe', pinned: false, isRead: false,
      title: 'Recipe R-512 re-qualify 計畫說明',
      content: 'R-512 re-qualify 計畫本週啟動，請鄭志明與黃怡君週四前確認測試片備料。',
      time: '今天 08:00', readCount: 2, totalCount: 5,
    },
    {
      id: 3, author: '鄭志明', av: '鄭', avColor: '#7C3AED',
      role: 'pe', pinned: false, isRead: true,
      title: '本月 DCR 審核截止日提醒 — 本週五',
      content: '目前有 3 筆待審 DCR，請 Section Admin 本週五前完成初審，避免影響 Recipe 發布時程。',
      time: '昨天 16:00', readCount: 5, totalCount: 5,
    },
  ],
  mfg: [
    {
      id: 1, author: '吳部長', av: '吳', avColor: '#F59E0B',
      role: 'all', pinned: true, isRead: false,
      title: '客戶稽核下週一 14:00，請備妥生產紀錄',
      content: '下週一 14:00 客戶稽核，請各班組長備妥本月各線生產日報與 WIP 紀錄，詳見稽核準備清單。',
      time: '今天 10:00', readCount: 3, totalCount: 12,
    },
    {
      id: 2, author: '林組長', av: '林', avColor: '#2563EB',
      role: 'mfg', pinned: false, isRead: false,
      title: 'Line 3 產能追趕方案公告',
      content: '因 E-101 停機影響，Line 3 優先跑 W26-031 急單，W26-038 移至明日 Line 1 補排。',
      time: '今天 09:00', readCount: 5, totalCount: 12,
    },
    {
      id: 3, author: '吳部長', av: '吳', avColor: '#F59E0B',
      role: 'mfg', pinned: false, isRead: true,
      title: '本週交班摘要品質要求提醒',
      content: '請各班確認交班摘要包含：停機事件、Priority Lot 狀態、明班注意事項。請在交班前於 Portal 填寫完畢。',
      time: '昨天 18:00', readCount: 12, totalCount: 12,
    },
  ],
};

const APPS_EXTENDED = {
  equipment: [
    { name: '設備監控',   desc: '即時狀態 · 16 台設備',   icon: '📡', system: 'FDC',       category: '設備監控' },
    { name: 'FDC Console', desc: 'FDC 異常事件查詢',       icon: '⚡', system: 'FDC',       category: '設備監控' },
    { name: '維修工單',   desc: '工單管理 · 待結案追蹤',  icon: '🔧', system: 'WorkOrder', category: '維修管理' },
    { name: 'PM 排程',    desc: '預防性保養計畫',          icon: '📅', system: 'CMMS',      category: '維修管理' },
    { name: 'SPC Chart',  desc: '製程管制圖監控',          icon: '📊', system: 'SPC',       category: '品質監控' },
    { name: '設備履歷',   desc: '設備歷史紀錄查詢',        icon: '📋', system: 'ToolCenter',category: '設備監控' },
  ],
  process: [
    { name: 'SPC Console',    desc: '管制圖即時監控',     icon: '📊', system: 'SPC',    category: '品質管理' },
    { name: 'Recipe Manager', desc: '配方版本控制',       icon: '🧪', system: 'Recipe', category: '製程管理' },
    { name: '良率分析',       desc: 'Yield 趨勢報表',     icon: '📈', system: 'MES',    category: '品質管理' },
    { name: 'DCR 系統',       desc: '製程變更申請審核',   icon: '📋', system: 'DCR',    category: '製程管理' },
    { name: 'MES 查詢',       desc: '製程歷程追蹤',       icon: '🔍', system: 'MES',    category: '製程管理' },
    { name: 'CP 值監控',      desc: '製程能力指標',       icon: '🎯', system: 'SPC',    category: '品質管理' },
  ],
  mfg: [
    { name: 'MES 生產系統', desc: '工單管理 · WIP 追蹤', icon: '🏗️', system: 'MES',       category: '生產管理' },
    { name: '產能儀表板',   desc: '即時稼動 · 產出追蹤', icon: '📊', system: 'Dashboard', category: '生產管理' },
    { name: 'WIP Tracker',  desc: '在製品批次狀態',       icon: '🔄', system: 'WIP',       category: '排程管理' },
    { name: '排程規劃',     desc: '產能 vs 需求規劃',     icon: '📅', system: 'Scheduler', category: '排程管理' },
    { name: 'Lot Center',   desc: '批次追蹤 · 製程歷程', icon: '🔍', system: 'LotCenter', category: '生產管理' },
    { name: '交班日誌',     desc: '班別交接記錄管理',     icon: '📝', system: 'Journal',   category: '排程管理' },
  ],
};

/* ── Operations Monitor: Tool / Case / Lot mock data (keyed by persona) ── */
const MOCK_TOOLS = {
  equipment: [
    {
      id: 'TARE03#2', chamber: 'CH-B', status: 'Down',
      claimMemo: 'SPC defect issue, auto down tool — wafer W26-031 OOC at step DEP. EE notified, root cause under investigation.',
      downSince: '08:42', assignee: '陳明志', area: 'ETCH',
    },
    {
      id: 'TARE05#1', chamber: 'CH-A', status: 'Monitoring',
      claimMemo: 'FDC defect issue, auto down tool — recipe R-512 pressure OOC Level-1. Engineer reviewing trace data.',
      downSince: '10:15', assignee: '黃怡君', area: 'ETCH',
    },
    {
      id: 'CVDE02#3', chamber: 'CH-C', status: 'PM',
      claimMemo: 'Preventive maintenance schedule — quarterly RF generator cleaning and matching network calibration.',
      downSince: '09:00', assignee: '王志明', area: 'CVD',
    },
    {
      id: 'ETCH01#4', chamber: 'CH-D', status: 'Down',
      claimMemo: 'Auto down: wafer count exceeded limit (PM threshold hit). Maintenance team scheduled for 14:00.',
      downSince: '11:30', assignee: '林世豪', area: 'ETCH',
    },
    {
      id: 'DIFN08#1', chamber: 'CH-A', status: 'Down',
      claimMemo: 'FDC Level-2 alarm: heater temperature OOC. Auto-interlock triggered. Vendor contact requested.',
      downSince: '07:58', assignee: '蔡宗翰', area: 'DIFF',
    },
    {
      id: 'POLH04#2', chamber: 'CH-B', status: 'Monitoring',
      claimMemo: 'Particle count elevated post-PM — monitoring next 5 wafers before resuming normal production.',
      downSince: '12:05', assignee: '陳明志', area: 'PVD',
    },
  ],
  process: [
    {
      id: 'CVDE02#3', chamber: 'CH-C', status: 'Monitoring',
      claimMemo: 'FDC defect issue — recipe R-512 pressure OOC Level-1. PE reviewing SPC trace and adjusting recipe window.',
      downSince: '10:15', assignee: '黃怡君', area: 'CVD',
    },
  ],
  mfg: [],
};

const MOCK_CASES = {
  equipment: [
    {
      id: 'UC-4381', priority: 'P1', caseType: 'FDC Alarm',
      subject: 'TARE03 auto down — SPC defect OOC at DEP step',
      toolId: 'TARE03#2', lotId: 'LOT-A01',
      link: '#case-4381', createdAt: '今天 08:45',
    },
    {
      id: 'UC-4382', priority: 'P1', caseType: 'Auto Down',
      subject: 'ETCH01#4 wafer count limit exceeded, PM required',
      toolId: 'ETCH01#4', lotId: 'LOT-C07',
      link: '#case-4382', createdAt: '今天 11:32',
    },
    {
      id: 'UC-4383', priority: 'P1', caseType: 'FDC Alarm',
      subject: 'DIFN08#1 heater temp OOC — Level-2 interlock triggered',
      toolId: 'DIFN08#1', lotId: 'LOT-E02',
      link: '#case-4383', createdAt: '今天 08:01',
    },
    {
      id: 'UC-4379', priority: 'P2', caseType: 'SPC Alert',
      subject: 'CVDE02 CPK < 1.33 at oxide deposition step',
      toolId: 'CVDE02#3', lotId: 'LOT-B03',
      link: '#case-4379', createdAt: '今天 07:20',
    },
    {
      id: 'UC-4376', priority: 'P2', caseType: 'SPC Alert',
      subject: 'POLH04 particle count elevated post-PM',
      toolId: 'POLH04#2', lotId: 'LOT-F09',
      link: '#case-4376', createdAt: '今天 12:10',
    },
  ],
  process: [
    {
      id: 'PC-4210', priority: 'P2', caseType: 'SPC Alert',
      subject: 'CVDE02 CPK < 1.33 at oxide deposition step',
      toolId: 'CVDE02#3', lotId: 'LOT-B03',
      link: '#case-4210', createdAt: '今天 07:20',
    },
  ],
  mfg: [],
};

const MOCK_LOTS = {
  equipment: [
    {
      id: 'LOT-A01', holdType: 'MFG Hold',
      holdReason: 'SPC OOC — wafer defect detected at DEP step, pending EE disposition',
      toolId: 'TARE03#2', station: 'DEP Step',
      holdSince: '今天 08:50', engineer: '陳明志', notes: '等待 EE 確認是否 scrap 或繼續監控',
    },
    {
      id: 'LOT-C07', holdType: 'QA Hold',
      holdReason: 'Yield excursion — wafer count check failed at ETCH01 exit',
      toolId: 'ETCH01#4', station: 'ETCH Step',
      holdSince: '今天 11:35', engineer: '品保部門', notes: '等待 QA 抽片確認，預計 14:00 前完成判定',
    },
    {
      id: 'LOT-E02', holdType: 'MFG Hold',
      holdReason: 'FDC Level-2 triggered at DIFN08 — lot held for wafer inspection',
      toolId: 'DIFN08#1', station: 'DIFF Step',
      holdSince: '今天 08:05', engineer: '蔡宗翰', notes: '待 EE 確認 heater 異常原因，預計 13:00 前回報',
    },
  ],
  process: [
    {
      id: 'LOT-B03', holdType: 'Eng Hold',
      holdReason: 'Recipe change impact — R-512 re-qualify lot, observation hold',
      toolId: 'CVDE02#3', station: 'CMP Step',
      holdSince: '昨天 16:00', engineer: '黃怡君', notes: 'Re-qualify 第 2 批次確認中',
    },
  ],
  mfg: [],
};

/* ── KPI Summary detail data ── */
const KPI_DETAILS = {
  equipment: [
    {
      label: 'Unclose Case', value: '7', unit: '件', status: 'warn',
      details: [
        { name: 'UC-438', desc: 'E-101 換件後異常追蹤' },
        { name: 'UC-440', desc: 'E-203 壓力異常未結案' },
        { name: 'UC-441', desc: 'E-308 電流波動跟進' },
        { name: 'UC-442', desc: 'E-101 日巡問題待確認' },
        { name: 'UC-443', desc: 'E-205 冷卻水路堵塞' },
        { name: 'UC-444', desc: 'E-308 FDC Level-1 跟進' },
        { name: 'UC-445', desc: 'E-207 震動異常排查' },
      ],
    },
    {
      label: '設備稼動率', value: '92.3', unit: '%', status: 'warn',
      details: [
        { name: 'E-101', desc: '88.5% ⚠️ 換件停機影響' },
        { name: 'E-203', desc: '91.2% ⚠️ 壓力異常維修中' },
        { name: 'E-308', desc: '79.8% ⚠️ FDC 持續異常' },
        { name: 'E-205', desc: '96.1% ✓' },
        { name: 'E-207', desc: '94.5% ✓' },
        { name: 'E-301', desc: '98.2% ✓' },
      ],
    },
    {
      label: 'FDC 異常台數', value: '2', unit: '台', status: 'warn',
      details: [
        { name: 'E-203', desc: 'Level-2 壓力異常（持續 4h）' },
        { name: 'E-308', desc: 'Level-1 電流波動（持續 3h）' },
      ],
    },
    {
      label: 'MTTR', value: '2.4', unit: 'h', status: 'ok',
      details: [
        { name: 'E-101', desc: '3.2h（最長）' },
        { name: 'E-207', desc: '3.5h（逾目標）' },
        { name: 'E-203', desc: '2.1h' },
        { name: 'E-301', desc: '2.0h' },
        { name: 'E-308', desc: '1.8h' },
        { name: 'E-205', desc: '1.5h（最短）' },
      ],
    },
    {
      label: 'PM 本月達成', value: '100', unit: '%', status: 'ok',
      details: [
        { name: 'E-101', desc: '✓ 已完成' },
        { name: 'E-203', desc: '✓ 已完成' },
        { name: 'E-205', desc: '✓ 已完成' },
        { name: 'E-207', desc: '✓ 已完成' },
        { name: 'E-301', desc: '✓ 已完成' },
        { name: 'E-308', desc: '✓ 已完成' },
      ],
    },
    {
      label: '待更新 Skill', value: '3', unit: '份', status: 'info',
      details: [
        { name: 'E-101 日常巡檢程序', desc: 'v1.8 → 步驟 3 壓力值需修正' },
        { name: 'CMP 研磨頭預熱啟動', desc: 'v1.1 → 85°C 標準未明確記載' },
        { name: '冷卻水路疏通程序', desc: 'v1.0 → 流量標準有誤' },
      ],
    },
  ],
  process: [
    {
      label: 'Unclose Case', value: '4', unit: '件', status: 'ok',
      details: [
        { name: 'PC-021', desc: 'CMP-3 SPC OOC 未正式關閉' },
        { name: 'PC-022', desc: 'R-512 良率異常根因跟進' },
        { name: 'PC-023', desc: 'Etch-1 CPK 偏低觀察中' },
        { name: 'PC-024', desc: 'DCR-2026-040 審核逾期' },
      ],
    },
    {
      label: '本日良率', value: '98.7', unit: '%', status: 'ok',
      details: [
        { name: 'CMP-1', desc: '99.2% ✓' },
        { name: 'CMP-2', desc: '98.5% ✓' },
        { name: 'CMP-3', desc: '97.8% ⚠️ 略低' },
        { name: 'CVD-1', desc: '99.1% ✓' },
        { name: 'Etch-1', desc: '98.9% ✓' },
        { name: 'PVD-1', desc: '98.6% ✓' },
      ],
    },
    {
      label: 'SPC 失控站點', value: '2', unit: '站', status: 'warn',
      details: [
        { name: 'CMP-3', desc: 'Nelson Rule 2（連續 9 點偏下）' },
        { name: 'Etch-1', desc: 'Nelson Rule 6（交替偏移 >1σ）' },
      ],
    },
    {
      label: 'CPK < 1.33', value: '1', unit: '站', status: 'warn',
      details: [
        { name: 'CMP-3', desc: 'CPK = 1.21（膜厚均勻性，管制下限 1.33）' },
      ],
    },
    {
      label: '待審 DCR', value: '3', unit: '筆', status: 'info',
      details: [
        { name: 'DCR-2026-039', desc: 'R-512 壓力參數調整（待初審）' },
        { name: 'DCR-2026-040', desc: 'CVD 溫度窗口擴大（逾期）' },
        { name: 'DCR-2026-041', desc: 'Etch Rate 優化（黃怡君提交）' },
      ],
    },
    {
      label: '本月新 Recipe', value: '2', unit: '個', status: 'ok',
      details: [
        { name: 'R-513', desc: 'Qualify 中（第 2 批次驗證）' },
        { name: 'R-514', desc: 'Draft 中（參數設定尚未提交）' },
      ],
    },
  ],
  mfg: [
    {
      label: '產出達成率', value: '94.8', unit: '%', status: 'warn',
      details: [
        { name: 'Line 1', desc: '98.2% ✓' },
        { name: 'Line 2', desc: '96.5% ✓' },
        { name: 'Line 3', desc: '89.7% ⚠️ E-101 停機影響' },
      ],
    },
    {
      label: '線體稼動率', value: '87.2', unit: '%', status: 'warn',
      details: [
        { name: 'Line 1', desc: '92.3% ✓' },
        { name: 'Line 2', desc: '88.6% ✓' },
        { name: 'Line 3', desc: '80.8% ⚠️ 停機 2.5h 影響' },
      ],
    },
    {
      label: '今日停機時數', value: '2.5', unit: 'h', status: 'warn',
      details: [
        { name: 'E-101', desc: '2.5h ⚠️ 冷卻系統壓力異常（已復機）' },
        { name: 'E-203', desc: '0h ✓ 正常運行' },
        { name: 'E-308', desc: '0h ✓ 正常運行' },
      ],
    },
    {
      label: '準時交貨率', value: '96.3', unit: '%', status: 'ok',
      details: [
        { name: 'W26-028', desc: '✓ 準時交貨' },
        { name: 'W26-029', desc: '✓ 準時交貨' },
        { name: 'W26-030', desc: '✓ 準時交貨' },
        { name: 'W26-031', desc: '⚠️ delay 風險（交期今日）' },
        { name: 'W26-032', desc: '✓ 準時交貨' },
        { name: 'W26-033', desc: '✓ 準時交貨' },
      ],
    },
    {
      label: 'WIP 在製批數', value: '47', unit: '批', status: 'ok',
      details: [
        { name: 'Line 1', desc: '16 批（正常）' },
        { name: 'Line 2', desc: '15 批（正常）' },
        { name: 'Line 3', desc: '16 批（略積壓）' },
      ],
    },
    {
      label: '緊急工單', value: '2', unit: '筆', status: 'warn',
      details: [
        { name: 'W26-031', desc: '交期今日 18:00，客戶急單' },
        { name: 'W26-035', desc: '交期明日 09:00，P2 優先處理' },
      ],
    },
  ],
};

const ROLE_TAG_CFG = {
  all: { label: '全員', bg: '#F3F4F6', color: '#374151' },
  ee:  { label: 'EE',   bg: '#EFF6FF', color: '#1D4ED8' },
  pe:  { label: 'PE',   bg: '#F0FDF4', color: '#166534' },
  mfg: { label: 'MFG',  bg: '#FEF3C7', color: '#92400E' },
};


/* ── MustBeZeroStrip ── */
function MustBeZeroStrip({ items}) {
  var { C, fz } = useTheme();
  if (!items || items.length === 0) return null;
  const hasIssue = items.some(i => !i.ok);
  return (
    <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid #F3F4F6', background: C.bgSub }}>
        <span style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Must Be Zero</span>
        <span style={{ marginLeft: 'auto', fontSize: fz(11), fontWeight: 700, color: hasIssue ? '#EF4444' : '#22C55E' }}>
          {hasIssue ? '⚠ 有異常' : '✓ 全部達標'}
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {items.map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', cursor: item.ok ? 'default' : 'pointer',
            borderRight: i < items.length - 1 ? '1px solid #F3F4F6' : 'none',
            background: item.ok ? 'transparent' : 'rgba(239,68,68,0.04)',
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.ok ? '#22C55E' : '#EF4444', flexShrink: 0 }} />
            <span style={{ fontSize: fz(13), color: C.textSub }}>{item.label}</span>
            <span style={{ fontSize: fz(13), fontWeight: 700, color: item.ok ? '#22C55E' : '#EF4444', marginLeft: 4 }}>
              {item.ok ? '0 ✓' : item.value}
            </span>
            {!item.ok && <span style={{ fontSize: fz(11), color: '#2563EB', fontWeight: 600, marginLeft: 4 }}>查看 →</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── KpiSummaryWidget ── */
const STATUS_DOT = {
  ok:   { dot: '#22C55E', text: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
  warn: { dot: '#F59E0B', text: '#EF4444', bg: 'rgba(239,68,68,0.06)' },
  info: { dot: '#2563EB', text: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
};

function KpiCard({ item, accentColor}) {
  var { C, fz } = useTheme();
  const [show, setShow] = React.useState(false);
  const [pos, setPos] = React.useState({ top: 0, left: 0 });
  const ref = React.useRef(null);
  const cfg = STATUS_DOT[item.status] || STATUS_DOT.ok;

  const handleEnter = () => {
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: r.left });
    }
    setShow(true);
  };

  return (
    <>
      <div
        ref={ref}
        onMouseEnter={handleEnter}
        onMouseLeave={() => setShow(false)}
        style={{
          padding: '12px 16px', cursor: 'default',
          display: 'flex', flexDirection: 'column', gap: 4,
          transition: 'background 0.1s',
          background: show ? '#F9FAFB' : 'transparent',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
          <span style={{ fontSize: fz(11), color: C.textMuted, fontWeight: 500, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.label}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: fz(22), fontWeight: 700, color: cfg.text, lineHeight: 1 }}>{item.value}</span>
          <span style={{ fontSize: fz(12), color: C.textMuted }}>{item.unit}</span>
        </div>
        <div style={{ fontSize: fz(10), color: C.textMuted }}>
          {item.details.length} 個明細 · 移入查看
        </div>
      </div>

      {/* Portal-style tooltip rendered via fixed position */}
      {show && item.details.length > 0 && (
        <div
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          style={{
            position: 'fixed', top: pos.top, left: pos.left,
            zIndex: 2000, background: '#1F2937',
            borderRadius: 6, padding: '10px 12px',
            minWidth: 220, maxWidth: 280,
            boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
          }}
        >
          <div style={{ fontSize: fz(11), fontWeight: 700, color: '#E5E7EB', marginBottom: 6, letterSpacing: '0.04em' }}>
            {item.label} — {item.value}{item.unit}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {item.details.map((d, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ fontSize: fz(11), fontWeight: 600, color: '#93C5FD', flexShrink: 0, minWidth: 80 }}>{d.name}</span>
                <span style={{ fontSize: fz(11), color: '#D1D5DB', lineHeight: 1.4 }}>{d.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/* ── Chevron icon ── */
function Chevron({ open}) {
  var { C, fz } = useTheme();
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', flexShrink: 0 }}>
      <path d="M3 5l4 4 4-4" stroke="#9E9E9E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function KpiSummaryWidget({ p, kpiConfig, onEdit}) {
  var { C, fz } = useTheme();
  /* Determine whether to use KWS dynamic config or static KPI_DETAILS */
  var useKws = !!(kpiConfig && typeof KWS_CATALOG !== 'undefined' && KWS_CATALOG[p.key]);
  var catalog    = useKws ? (KWS_CATALOG[p.key] || []) : [];
  var live       = useKws ? (KWS_LIVE[p.key] || {}) : {};
  var staticItems = useKws ? [] : (KPI_DETAILS[p.key] || []);

  var enabledKpis = useKws
    ? catalog
        .filter(function(k) { return kpiConfig[k.id] && kpiConfig[k.id].enabled; })
        .sort(function(a, b) {
          return ((kpiConfig[a.id] || {}).order || 99) - ((kpiConfig[b.id] || {}).order || 99);
        })
    : [];

  var totalCount = useKws ? enabledKpis.length : staticItems.length;
  var warnCount  = useKws
    ? enabledKpis.filter(function(k) { return getKwsStatus(k.id, kpiConfig[k.id], live) !== 'ok'; }).length
    : staticItems.filter(function(k) { return k.status === 'warn'; }).length;
  var okCount = totalCount - warnCount;

  const [open, setOpen] = React.useState(true);

  if (!useKws && staticItems.length === 0) return null;

  var COLS = 3;
  var rows = Math.ceil(totalCount / COLS);

  return (
    <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 8, overflow: 'visible', flexShrink: 0 }}>
      {/* Header */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderBottom: open ? '1px solid ' + C.border : 'none', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Chevron open={open} />
        <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>KPI Summary</span>
        <span style={{ fontSize: fz(9), fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: '#F3F4F6', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>本班即時</span>
        {warnCount > 0 && (
          <span style={{ fontSize: fz(11), fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>
            {warnCount} 項待關注
          </span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: fz(11), color: C.textMuted }}>{okCount}/{totalCount} 達標</span>
        {/* Edit button — only shown when onEdit prop provided */}
        {onEdit && (
          <button
            onClick={function(e) { e.stopPropagation(); onEdit(); }}
            title="設定 KPI Widget"
            style={{
              marginLeft: 8, background: 'none', border: '1px solid ' + C.border,
              borderRadius: 6, cursor: 'pointer', color: C.textMuted,
              padding: '3px 8px', fontSize: fz(12), lineHeight: 1,
              display: 'flex', alignItems: 'center', gap: 4,
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={function(e) {
              e.currentTarget.style.borderColor = '#2563EB';
              e.currentTarget.style.color = '#2563EB';
            }}
            onMouseLeave={function(e) {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.color = '#9CA3AF';
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
              <path d="M8.5 1.5a1.414 1.414 0 0 1 2 2L4 10 1 11l1-3 6.5-6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            設定
          </button>
        )}
      </div>

      {/* Grid — KWS dynamic or static KPI_DETAILS */}
      {open && useKws && (
        <div>
          {enabledKpis.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: fz(12), color: C.textMuted }}>
              尚未啟用任何 KPI
              {onEdit && (
                <span
                  onClick={onEdit}
                  style={{ marginLeft: 8, color: '#2563EB', cursor: 'pointer', fontWeight: 600 }}
                >前往設定 →</span>
              )}
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
                    cfg={kpiConfig[kpi.id]}
                    live={live}
                    isLastCol={col === COLS - 1 || i === enabledKpis.length - 1}
                    isLastRow={row === rows - 1}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {open && !useKws && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {staticItems.map(function(item, i) {
            var isLastRow = Math.floor(i / 3) === Math.ceil(staticItems.length / 3) - 1;
            var isLastCol = i % 3 === 2;
            return (
              <div key={i} style={{
                borderRight: !isLastCol ? '1px solid #F3F4F6' : 'none',
                borderBottom: !isLastRow ? '1px solid #F3F4F6' : 'none',
              }}>
                <KpiCard item={item} accentColor={p.accentColor} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   OPERATIONS MONITOR WIDGETS
   Tool Status / Case / Lot Hold
   ════════════════════════════════════════ */

/* ── Tool Status Config ── */
const TOOL_STATUS_CFG = {
  Down:       { bg: 'rgba(239,68,68,0.08)',   border: '#EF4444', dot: '#EF4444',  label: 'Down',       textColor: '#B91C1C' },
  Monitoring: { bg: 'rgba(245,158,11,0.08)',  border: '#F59E0B', dot: '#F59E0B',  label: 'Monitoring', textColor: '#92400E' },
  PM:         { bg: 'rgba(107,114,128,0.08)', border: '#9CA3AF', dot: '#6B7280',  label: 'PM',         textColor: '#374151' },
};

/* ── Generic Detail Popout Modal ── */
function DetailModal({ onClose, children}) {
  var { C, fz } = useTheme();
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div
        style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 8, width: 520, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/* ── Tool Detail Modal Content ── */
function ToolDetailModal({ tool, onClose}) {
  var { C, fz } = useTheme();
  const cfg = TOOL_STATUS_CFG[tool.status] || TOOL_STATUS_CFG.PM;
  return (
    <DetailModal onClose={onClose}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'flex-start', gap: 12, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: 'monospace', fontSize: fz(16), fontWeight: 700, color: C.text }}>{tool.id}</span>
            <span style={{ fontSize: fz(11), fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: cfg.bg, color: cfg.textColor, border: `1px solid ${cfg.border}` }}>{cfg.label}</span>
          </div>
          <div style={{ fontSize: fz(12), color: C.textMuted }}>{tool.area} · {tool.chamber} · Down since {tool.downSince}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: fz(20), color: C.textMuted, padding: '0 4px', lineHeight: 1, flexShrink: 0 }}>×</button>
      </div>
      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Claim Memo */}
        <div>
          <div style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Claim Memo</div>
          <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, padding: '12px', fontSize: fz(13), color: C.textSub, lineHeight: 1.6 }}>
            {tool.claimMemo}
          </div>
        </div>
        {/* Info Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Tool ID',   value: tool.id,       mono: true },
            { label: 'Chamber',   value: tool.chamber,  mono: false },
            { label: 'Area',      value: tool.area,     mono: false },
            { label: 'Down Since',value: tool.downSince,mono: false },
            { label: 'Assignee',  value: tool.assignee, mono: false },
            { label: 'Status',    value: tool.status,   mono: false },
          ].map((row, i) => (
            <div key={i} style={{ background: '#F9FAFB', borderRadius: 6, padding: '10px 12px' }}>
              <div style={{ fontSize: fz(10), fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{row.label}</div>
              <div style={{ fontSize: fz(13), fontWeight: 600, color: C.text, fontFamily: row.mono ? 'monospace' : 'inherit' }}>{row.value}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Footer actions */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid ' + C.border, display: 'flex', gap: 8, flexShrink: 0 }}>
        <button onClick={onClose} style={{ flex: 1, padding: '8px', borderRadius: 6, border: '1px solid #2563EB', background: 'transparent', color: '#2563EB', fontSize: fz(13), fontWeight: 600, cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.06)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >借機</button>
        <button onClick={onClose} style={{ flex: 1, padding: '8px', borderRadius: 6, border: '1px solid #2563EB', background: 'transparent', color: '#2563EB', fontSize: fz(13), fontWeight: 600, cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.06)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >FOUP Transfer</button>
        <button onClick={onClose} style={{ flex: 1, padding: '8px', borderRadius: 6, border: 'none', background: '#2563EB', color: '#FFFFFF', fontSize: fz(13), fontWeight: 600, cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
          onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
        >關閉</button>
      </div>
    </DetailModal>
  );
}

/* ── Lot Detail Modal Content ── */
function LotDetailModal({ lot, onClose}) {
  var { C, fz } = useTheme();
  const holdBg   = { 'MFG Hold': 'rgba(239,68,68,0.08)',  'QA Hold': 'rgba(245,158,11,0.08)',  'Eng Hold': 'rgba(37,99,235,0.08)' };
  const holdText = { 'MFG Hold': '#B91C1C',               'QA Hold': '#92400E',               'Eng Hold': '#1D4ED8' };
  const holdBorder={ 'MFG Hold': '#EF4444',               'QA Hold': '#F59E0B',               'Eng Hold': '#2563EB' };
  return (
    <DetailModal onClose={onClose}>
      <div style={{ padding: '16px', borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'flex-start', gap: 12, flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: 'monospace', fontSize: fz(16), fontWeight: 700, color: C.text }}>{lot.id}</span>
            <span style={{ fontSize: fz(11), fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: holdBg[lot.holdType] || '#F3F4F6', color: holdText[lot.holdType] || '#374151', border: `1px solid ${holdBorder[lot.holdType] || '#E0E0E0'}` }}>{lot.holdType}</span>
          </div>
          <div style={{ fontSize: fz(12), color: C.textMuted }}>{lot.toolId} · {lot.station} · Hold since {lot.holdSince}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: fz(20), color: C.textMuted, padding: '0 4px', lineHeight: 1, flexShrink: 0 }}>×</button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <div style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Hold Reason</div>
          <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, padding: '12px', fontSize: fz(13), color: C.textSub, lineHeight: 1.6 }}>{lot.holdReason}</div>
        </div>
        {lot.notes && (
          <div>
            <div style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>備註</div>
            <div style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, padding: '12px', fontSize: fz(13), color: C.textSub, lineHeight: 1.6 }}>{lot.notes}</div>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Lot ID',      value: lot.id,        mono: true },
            { label: 'Tool',        value: lot.toolId,    mono: true },
            { label: 'Station',     value: lot.station,   mono: false },
            { label: 'Hold Since',  value: lot.holdSince, mono: false },
            { label: 'Hold Type',   value: lot.holdType,  mono: false },
            { label: 'Engineer',    value: lot.engineer,  mono: false },
          ].map((row, i) => (
            <div key={i} style={{ background: '#F9FAFB', borderRadius: 6, padding: '10px 12px' }}>
              <div style={{ fontSize: fz(10), fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{row.label}</div>
              <div style={{ fontSize: fz(13), fontWeight: 600, color: C.text, fontFamily: row.mono ? 'monospace' : 'inherit' }}>{row.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 16px', borderTop: '1px solid ' + C.border, display: 'flex', justifyContent: 'flex-end', gap: 8, flexShrink: 0 }}>
        <button onClick={onClose} style={{ padding: '8px 24px', borderRadius: 6, border: 'none', background: '#2563EB', color: '#FFFFFF', fontSize: fz(13), fontWeight: 600, cursor: 'pointer' }}
          onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
          onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
        >關閉</button>
      </div>
    </DetailModal>
  );
}

/* ── ToolStatusWidget ── */
function ToolStatusWidget({ p}) {
  var { C, fz } = useTheme();
  const tools = (MOCK_TOOLS[p.key] || []);
  const [selectedTool, setSelectedTool] = React.useState(null);
  const [open, setOpen] = React.useState(true);

  const downCount = tools.filter(t => t.status === 'Down').length;
  const monCount  = tools.filter(t => t.status === 'Monitoring').length;

  return (
    <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
      {selectedTool && <ToolDetailModal tool={selectedTool} onClose={() => setSelectedTool(null)} />}

      {/* Header — compact 8px */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderBottom: open ? '1px solid ' + C.border : 'none', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Chevron open={open} />
        <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>Tool Status</span>
        <span style={{ fontSize: fz(9), fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: '#F3F4F6', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>live</span>
        {downCount > 0 && (
          <span style={{ fontSize: fz(11), fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(239,68,68,0.08)', color: '#B91C1C' }}>{downCount} Down</span>
        )}
        {monCount > 0 && (
          <span style={{ fontSize: fz(11), fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(245,158,11,0.08)', color: '#92400E' }}>{monCount} Monitoring</span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: fz(11), color: C.textMuted }}>{tools.length > 0 ? `${tools.length} 台異常` : '全數正常'}</span>
      </div>

      {open && tools.length === 0 && (
        <div style={{ padding: '12px 16px', textAlign: 'center' }}>
          <span style={{ fontSize: fz(12), color: C.textMuted }}>All tools are running well</span>
        </div>
      )}

      {open && tools.length > 0 && (
        <div>
          {tools.map((tool, i) => {
            const cfg = TOOL_STATUS_CFG[tool.status] || TOOL_STATUS_CFG.PM;
            const truncMemo = tool.claimMemo.length > 80 ? tool.claimMemo.slice(0, 80) + '…' : tool.claimMemo;
            return (
              <div key={tool.id}
                style={{
                  display: 'grid', gridTemplateColumns: '130px 64px 88px 1fr auto',
                  gap: 0, padding: '6px 16px', alignItems: 'center',
                  borderBottom: i < tools.length - 1 ? '1px solid #F3F4F6' : 'none',
                  borderLeft: `3px solid ${cfg.border}`,
                  background: cfg.bg,
                }}
              >
                <span style={{ fontFamily: 'monospace', fontSize: fz(12), fontWeight: 700, color: C.text }}>{tool.id}</span>
                <span style={{ fontFamily: 'monospace', fontSize: fz(11), color: C.textMuted }}>{tool.chamber}</span>
                <span style={{ fontSize: fz(10), fontWeight: 700, padding: '1px 7px', borderRadius: 999, background: cfg.bg, color: cfg.textColor, border: `1px solid ${cfg.border}`, display: 'inline-block', width: 'fit-content' }}>{cfg.label}</span>
                <span style={{ fontSize: fz(11), color: C.textMuted, lineHeight: 1.4, paddingRight: 12 }} title={tool.claimMemo}>{truncMemo}</span>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button
                    onClick={() => alert('借機功能：請選擇目標機台進行轉移')}
                    style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid ' + C.borderStrong, background: C.bg, color: C.textSub, fontSize: fz(11), fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = C.textSub; }}
                  >借機</button>
                  <button
                    onClick={() => alert('FOUP Transfer：請選擇目標 Port')}
                    style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid ' + C.borderStrong, background: C.bg, color: C.textSub, fontSize: fz(11), fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = C.textSub; }}
                  >FOUP Transfer</button>
                  <button
                    onClick={() => setSelectedTool(tool)}
                    style={{ padding: '3px 8px', borderRadius: 6, border: 'none', background: '#2563EB', color: '#FFFFFF', fontSize: fz(11), fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
                    onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}
                  >查看細節</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── CaseWidget ── */
function CaseWidget({ p}) {
  var { C, fz } = useTheme();
  const cases = (MOCK_CASES[p.key] || []);
  const [open, setOpen] = React.useState(true);
  const p1Count = cases.filter(c => c.priority === 'P1').length;

  const priBg    = { P1: 'rgba(239,68,68,0.1)',  P2: 'rgba(245,158,11,0.1)' };
  const priColor = { P1: '#B91C1C',               P2: '#92400E' };
  const typeBg   = { 'FDC Alarm': '#EFF6FF', 'SPC Alert': '#F0FDF4', 'Auto Down': '#FEF2F2' };
  const typeColor= { 'FDC Alarm': '#1D4ED8', 'SPC Alert': '#166534', 'Auto Down': '#B91C1C' };

  return (
    <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Header — compact 8px */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderBottom: open ? '1px solid ' + C.border : 'none', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Chevron open={open} />
        <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>Case</span>
        {p1Count > 0 && (
          <span style={{ fontSize: fz(11), fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(239,68,68,0.08)', color: '#B91C1C' }}>P1 ×{p1Count}</span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: fz(11), color: C.textMuted }}>{cases.length} 筆</span>
      </div>

      {open && cases.length === 0 && (
        <div style={{ padding: '12px 16px', textAlign: 'center' }}>
          <span style={{ fontSize: fz(12), color: C.textMuted }}>No active high priority cases</span>
        </div>
      )}

      {open && cases.map((c, i) => (
        <div key={c.id}
          style={{
            padding: '6px 16px',
            borderBottom: i < cases.length - 1 ? '1px solid #F3F4F6' : 'none',
            borderLeft: c.priority === 'P1' ? '3px solid #EF4444' : '3px solid #F59E0B',
          }}
        >
          {/* Row 1: badges + time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
            <span style={{ fontSize: fz(10), fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: typeBg[c.caseType] || '#F3F4F6', color: typeColor[c.caseType] || '#374151' }}>{c.caseType}</span>
            <span style={{ fontSize: fz(10), fontWeight: 700, padding: '1px 5px', borderRadius: 999, background: priBg[c.priority] || '#F3F4F6', color: priColor[c.priority] || '#374151' }}>{c.priority}</span>
            <span style={{ marginLeft: 'auto', fontSize: fz(10), color: C.textMuted }}>{c.createdAt}</span>
          </div>
          {/* Row 2: Subject */}
          <div style={{ fontSize: fz(11), fontWeight: 600, color: C.text, marginBottom: 3, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.subject}>{c.subject}</div>
          {/* Row 3: Tool/Lot + Link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'monospace', fontSize: fz(10), background: C.bgPanel, padding: '1px 5px', borderRadius: 3, color: C.textSub }}>{c.toolId}</span>
            <span style={{ fontFamily: 'monospace', fontSize: fz(10), background: C.bgPanel, padding: '1px 5px', borderRadius: 3, color: C.textSub }}>{c.lotId}</span>
            <a href={c.link} target="_blank" rel="noopener noreferrer"
              style={{ marginLeft: 'auto', fontSize: fz(11), fontWeight: 600, color: '#2563EB', textDecoration: 'none' }}
              onClick={e => e.stopPropagation()}
            >↗ {c.id}</a>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── LotHoldWidget ── */
function LotHoldWidget({ p}) {
  var { C, fz } = useTheme();
  const lots = (MOCK_LOTS[p.key] || []);
  const [open, setOpen] = React.useState(true);
  const [selectedLot, setSelectedLot] = React.useState(null);

  const holdBg    = { 'MFG Hold': 'rgba(239,68,68,0.08)',  'QA Hold': 'rgba(245,158,11,0.08)',  'Eng Hold': 'rgba(37,99,235,0.08)' };
  const holdBorder= { 'MFG Hold': '#EF4444',               'QA Hold': '#F59E0B',               'Eng Hold': '#2563EB' };
  const holdText  = { 'MFG Hold': '#B91C1C',               'QA Hold': '#92400E',               'Eng Hold': '#1D4ED8' };

  return (
    <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
      {selectedLot && <LotDetailModal lot={selectedLot} onClose={() => setSelectedLot(null)} />}

      {/* Header — compact 8px */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderBottom: open ? '1px solid ' + C.border : 'none', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Chevron open={open} />
        <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>Lot Hold</span>
        {lots.length > 0 && (
          <span style={{ fontSize: fz(11), fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(239,68,68,0.08)', color: '#B91C1C' }}>{lots.length} Hold</span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: fz(11), color: C.textMuted }}>{lots.length > 0 ? `${lots.length} 批` : '無 Hold'}</span>
      </div>

      {open && lots.length === 0 && (
        <div style={{ padding: '12px 16px', textAlign: 'center' }}>
          <span style={{ fontSize: fz(12), color: C.textMuted }}>No lots on hold</span>
        </div>
      )}

      {open && lots.map((lot, i) => (
        <div key={lot.id}
          onClick={() => setSelectedLot(lot)}
          style={{
            padding: '6px 16px',
            borderBottom: i < lots.length - 1 ? '1px solid #F3F4F6' : 'none',
            borderLeft: `3px solid ${holdBorder[lot.holdType] || '#E0E0E0'}`,
            background: holdBg[lot.holdType] || 'transparent',
            cursor: 'pointer', transition: 'filter 0.1s',
          }}
          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.97)'}
          onMouseLeave={e => e.currentTarget.style.filter = 'none'}
        >
          {/* Row 1: Lot ID + Hold Type + time */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ fontFamily: 'monospace', fontSize: fz(12), fontWeight: 700, color: C.text }}>{lot.id}</span>
            <span style={{ fontSize: fz(10), fontWeight: 700, padding: '1px 5px', borderRadius: 999, background: holdBg[lot.holdType] || '#F3F4F6', color: holdText[lot.holdType] || '#374151', border: `1px solid ${holdBorder[lot.holdType] || '#E0E0E0'}` }}>{lot.holdType}</span>
            <span style={{ marginLeft: 'auto', fontSize: fz(10), color: C.textMuted }}>{lot.holdSince}</span>
          </div>
          {/* Row 2: Reason (truncated) */}
          <div style={{ fontSize: fz(11), color: C.textMuted, marginBottom: 3, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={lot.holdReason}>{lot.holdReason}</div>
          {/* Row 3: Tool + Station + link */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'monospace', fontSize: fz(10), background: C.bgPanel, padding: '1px 5px', borderRadius: 3, color: C.textSub }}>{lot.toolId}</span>
            <span style={{ fontSize: fz(10), color: C.textMuted }}>·</span>
            <span style={{ fontSize: fz(10), color: C.textMuted }}>{lot.station}</span>
            <span style={{ marginLeft: 'auto', fontSize: fz(10), color: '#2563EB', fontWeight: 600 }}>詳情 →</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── SOP 產出的交接報告 → 佈告欄置頂公告 ──
   交班不是一個模組，是一個唯讀 SOP 的排程產出。Schedule 是檔案櫃（可回溯），
   這裡是「今天這份」——接班第一眼會看到的地方。
   見 brain/entities/modules/handover.md */
function buildReportBulletin(p, report) {
  if (!report) return null;
  var o = report.output || {};
  var metrics = (o.metrics || []).map(function(m) { return m.label + ' ' + m.value + m.unit; }).join('　·　');
  return {
    id: 'sop-report-' + report.runId,
    author: '排程產出 · ' + report.scheduleName,
    av: '⚙', avColor: '#2563EB',
    role: 'all', pinned: true, isRead: false, type: 'handover',
    fromSOP: true,
    title: o.title || '當班交接報告',
    content: (o.shiftLabel ? o.shiftLabel + '　' : '') + metrics + '\n' + (o.situation || ''),
    time: o.generatedAt || report.dateLabel,
    readCount: 0, totalCount: p.members ? p.members.length : 5,
  };
}

/* ── BulletinWidget ── */
function BulletinWidget({ p, handoverRecord, onEdit, onOpenHandover}) {
  var { C, fz } = useTheme();
  const baseBulletins = BULLETINS[p.key] || [];
  /* 人送出交班後，那份取代 SOP 產出的自動公告（同一件事的最終版本）*/
  const reportBulletin = handoverRecord ? null : buildReportBulletin(p, getLatestHandoverReport(p.key));
  const bulletins = handoverRecord
    ? [handoverRecord].concat(baseBulletins)
    : (reportBulletin ? [reportBulletin].concat(baseBulletins) : baseBulletins);
  const [readIds, setReadIds] = React.useState(new Set());
  const [open, setOpen] = React.useState(true);

  const markRead = (id, e) => {
    e.stopPropagation();
    setReadIds(prev => new Set([...prev, id]));
  };

  const unreadCount = bulletins.filter(b => !b.isRead && !readIds.has(b.id)).length;

  return (
    <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
      {/* Header */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderBottom: open ? '1px solid ' + C.border : 'none', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Chevron open={open} />
        <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>Announcement</span>
        <span style={{ fontSize: fz(9), fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: '#F3F4F6', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>bulletin</span>
        {unreadCount > 0 && (
          <span style={{ fontSize: fz(11), fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#EFF6FF', color: '#2563EB' }}>{unreadCount} 則未讀</span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: fz(11), color: C.textMuted }}>{bulletins.length} 則公告</span>
        {onEdit && (
          <button
            onClick={function(e) { e.stopPropagation(); onEdit(); }}
            title="管理公告"
            style={{
              marginLeft: 8, background: 'none', border: '1px solid ' + C.border,
              borderRadius: 6, cursor: 'pointer', color: C.textMuted,
              padding: '3px 8px', fontSize: fz(12), lineHeight: 1,
              display: 'flex', alignItems: 'center', gap: 4,
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={function(e) { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }}
            onMouseLeave={function(e) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = '#9CA3AF'; }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8.5 1.5a1.414 1.414 0 0 1 2 2L4 10 1 11l1-3 6.5-6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            編輯
          </button>
        )}
      </div>

      {/* Bulletin items */}
      {open && <div>
      {bulletins.map((b, i) => {
        const isRead = b.isRead || readIds.has(b.id);
        const rt = b.fromSOP
          ? { label: 'SOP 產出', bg: '#EFF6FF', color: '#2563EB' }
          : b.type === 'handover'
            ? { label: '交班記錄', bg: '#FEF3C7', color: '#92400E' }
            : (ROLE_TAG_CFG[b.role] || ROLE_TAG_CFG.all);
        return (
          <div key={b.id}
            style={{
              display: 'flex', gap: 12, padding: '8px 16px',
              borderBottom: i < bulletins.length - 1 ? '1px solid #F3F4F6' : 'none',
              background: isRead ? 'transparent' : '#F0F7FF',
              cursor: 'pointer', transition: 'background 0.1s', position: 'relative',
            }}
            onMouseEnter={e => { if (isRead) e.currentTarget.style.background = '#F9FAFB'; }}
            onMouseLeave={e => { e.currentTarget.style.background = isRead ? 'transparent' : '#F0F7FF'; }}
          >
            {!isRead && (
              <div style={{ position: 'absolute', top: 16, left: 6, width: 6, height: 6, borderRadius: '50%', background: '#2563EB' }} />
            )}
            <Avatar char={b.av} size={28} color={b.avColor} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: fz(12), fontWeight: 600, color: C.text }}>{b.author}</span>
                <span style={{ fontSize: fz(9), fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: rt.bg, color: rt.color }}>{rt.label}</span>
                {b.pinned && (
                  <span style={{ fontSize: fz(9), fontWeight: 700, color: '#DC2626', background: '#FEE2E2', padding: '2px 6px', borderRadius: 999 }}>置頂</span>
                )}
                <span style={{ fontSize: fz(11), color: C.textMuted, marginLeft: 'auto' }}>{b.time}</span>
              </div>
              <div style={{ fontSize: fz(13), fontWeight: 600, color: C.text, marginBottom: 4 }}>{b.title}</div>
              <div style={{ fontSize: fz(12), color: C.textMuted, lineHeight: 1.4, marginBottom: 8, whiteSpace: 'pre-wrap' }}>{b.content}</div>
              {/* 數字機器算，判斷人給：SOP 產出後由人補交代事項再送出 */}
              {b.fromSOP && onOpenHandover && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <button onClick={function(e) { e.stopPropagation(); onOpenHandover(); }}
                    style={{ fontSize: fz(11), fontWeight: 600, padding: '3px 10px', borderRadius: 6, border: 'none', background: '#2563EB', color: '#FFFFFF', cursor: 'pointer' }}>
                    補充交代事項並送出交班
                  </button>
                  <span style={{ fontSize: fz(11), color: C.textMuted }}>數字已由 SOP 算好，你只需要補上判斷</span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {!isRead ? (
                  <button onClick={e => markRead(b.id, e)}
                    style={{ fontSize: fz(11), fontWeight: 600, padding: '3px 10px', borderRadius: 6, border: '1px solid #2563EB', color: '#2563EB', background: 'transparent', cursor: 'pointer' }}>
                    確認已讀
                  </button>
                ) : (
                  <span style={{ fontSize: fz(11), color: '#10B981', fontWeight: 600 }}>✓ 已讀</span>
                )}
                <span style={{ fontSize: fz(11), color: C.textMuted, marginLeft: 'auto' }}>{b.readCount}/{b.totalCount} 已讀</span>
              </div>
            </div>
          </div>
        );
      })}

      </div>}{/* end bulletin list */}

      {/* Footer */}
      {open && <div style={{ padding: '10px 16px', textAlign: 'center', fontSize: fz(12), color: '#2563EB', cursor: 'pointer', fontWeight: 600, borderTop: '1px solid ' + C.border }}
        onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        查看所有公告
      </div>}
    </div>
  );
}

/* ── AppLauncherWidget ── */
function AppLauncherWidget({ p, onEdit}) {
  var { C, fz } = useTheme();
  const apps = APPS_EXTENDED[p.key] || [];
  const categories = ['全部', ...Array.from(new Set(apps.map(a => a.category)))];
  const [activeTab, setActiveTab] = React.useState('全部');
  const [open, setOpen] = React.useState(true);
  const filtered = activeTab === '全部' ? apps : apps.filter(a => a.category === activeTab);
  const numCols = 3;
  const lastRowStart = Math.floor((filtered.length - 1) / numCols) * numCols;

  return (
    <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
      {/* Header */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderBottom: open ? '1px solid ' + C.border : 'none', cursor: 'pointer' }}
        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <Chevron open={open} />
        <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>Applications</span>
        <span style={{ fontSize: fz(9), fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: '#F3F4F6', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>app-launcher</span>
        <span style={{ marginLeft: 'auto', fontSize: fz(11), color: '#7C3AED' }}>⚙ Seed 配置</span>
        {onEdit && (
          <button
            onClick={function(e) { e.stopPropagation(); onEdit(); }}
            title="管理應用程式"
            style={{
              marginLeft: 8, background: 'none', border: '1px solid ' + C.border,
              borderRadius: 6, cursor: 'pointer', color: C.textMuted,
              padding: '3px 8px', fontSize: fz(12), lineHeight: 1,
              display: 'flex', alignItems: 'center', gap: 4,
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={function(e) { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }}
            onMouseLeave={function(e) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = '#9CA3AF'; }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8.5 1.5a1.414 1.414 0 0 1 2 2L4 10 1 11l1-3 6.5-6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            編輯
          </button>
        )}
      </div>

      {/* Category tabs */}
      {open && <div style={{ display: 'flex', gap: 8, padding: '8px 16px', borderBottom: '1px solid ' + C.border, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveTab(cat)}
            style={{
              fontSize: fz(12), fontWeight: 600, padding: '5px 14px', borderRadius: 999,
              border: 'none', cursor: 'pointer',
              background: activeTab === cat ? '#2563EB' : 'transparent',
              color: activeTab === cat ? '#FFFFFF' : '#6B7280',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (activeTab !== cat) e.currentTarget.style.background = '#F3F4F6'; }}
            onMouseLeave={e => { if (activeTab !== cat) e.currentTarget.style.background = 'transparent'; }}
          >{cat}</button>
        ))}
      </div>}

      {/* App grid */}
      {open && <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {filtered.map((app, i) => (
          <div key={i}
            style={{
              padding: '10px 12px', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', gap: 3,
              borderRight: i % numCols < numCols - 1 ? '1px solid ' + C.border : 'none',
              borderBottom: i < lastRowStart ? '1px solid ' + C.border : 'none',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ fontSize: fz(22), marginBottom: 2 }}>{app.icon}</div>
            <div style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>{app.name}</div>
            <div style={{ fontSize: fz(11), color: C.textMuted, lineHeight: 1.3 }}>{app.desc}</div>
            <span style={{
              fontFamily: 'monospace', fontSize: fz(10), color: C.textMuted,
              background: C.bgPanel, padding: '2px 6px', borderRadius: 4,
              display: 'inline-block', marginTop: 4, alignSelf: 'flex-start',
            }}>{app.system}</span>
          </div>
        ))}
      </div>
      </div>}{/* end app grid */}
    </div>
  );
}

/* ── PersonalPriorityFeed ── */
function PersonalPriorityFeed({ p, onAskAI, onGoParentTask}) {
  const [parentTaskModal, setParentTaskModal] = React.useState(null); // { task, subTasks }
  var { C, fz } = useTheme();
  const borderColor = { P1: '#EF4444', P2: '#F59E0B', P3: '#9E9E9E' };
  const badgeBg    = { P1: 'rgba(239,68,68,0.1)', P2: 'rgba(245,158,11,0.1)', P3: '#F3F4F6' };
  const badgeColor = { P1: '#B91C1C', P2: '#92400E', P3: '#6B7280' };
  const prColor    = { P1: '#EF4444', P2: '#F59E0B', P3: '#9E9E9E' };
  const prBg       = { P1: 'rgba(239,68,68,0.08)', P2: 'rgba(245,158,11,0.08)', P3: 'rgba(158,158,158,0.08)' };

  // 全部 items 統一用 state 管理，支援編輯
  const [items, setItems]               = React.useState(() => [...(p.priorityFeed || [])]);
  const [completed, setCompleted]       = React.useState(new Set()); // idx → completed
  const [dismissed, setDismissed]       = React.useState(new Set()); // idx → hidden after refresh
  const [spinning, setSpinning]         = React.useState(false);
  const [selectedIdx, setSelectedIdx]   = React.useState(null);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [addForm, setAddForm]           = React.useState({ title: '', priority: 'P3', dueDate: '', assignee: p.name || '' });
  // 編輯 modal 表單
  const [editForm, setEditForm]         = React.useState(null);
  const [editSaved, setEditSaved]       = React.useState(false);
  const [detailEditMode, setDetailEditMode] = React.useState(false);

  function openParentTaskModal(parentTaskId) {
    const taskData = (typeof TASKS_BY_PERSONA !== 'undefined') ? TASKS_BY_PERSONA[p.key] : null;
    if (!taskData) return;
    const allTasks = [...(taskData.active || []), ...(taskData.history || [])];
    const found = allTasks.find(t => t.id === parentTaskId);
    if (found) setParentTaskModal(found);
  }

  const visibleItems = items
    .map((item, idx) => ({ item, idx, isDone: completed.has(idx) }))
    .filter(({ idx }) => !dismissed.has(idx));
  const activeCount = visibleItems.filter(v => !v.isDone).length;

  /* ── 刷新：completed → dismissed，清空 completed ── */
  function handleRefresh() {
    if (spinning) return;
    setSpinning(true);
    setTimeout(() => {
      setDismissed(prev => { const n = new Set(prev); completed.forEach(i => n.add(i)); return n; });
      setCompleted(new Set());
      setSpinning(false);
    }, 700);
  }

  function handleMarkComplete(idx, e) {
    if (e) e.stopPropagation();
    setCompleted(prev => { const n = new Set(prev); n.add(idx); return n; });
  }

  /* ── 打開 detail modal：初始化 editForm ── */
  function openDetail(idx) {
    setSelectedIdx(idx);
    const it = items[idx];
    setEditForm({
      title:    it.title    || '',
      body:     it.body     || '',
      priority: it.priority || 'P3',
      dueDate:  it.dueDate  || '',
      assignee: it.assignee || p.name || '',
    });
    setEditSaved(false);
    setDetailEditMode(false);
  }

  /* ── 儲存編輯 ── */
  function handleEditSave() {
    if (!editForm.title.trim()) return;
    setItems(prev => prev.map((it, i) => i === selectedIdx ? {
      ...it,
      title:    editForm.title.trim(),
      body:     editForm.body,
      priority: editForm.priority,
      dueDate:  editForm.dueDate,
      assignee: editForm.assignee,
      source:   it.source || `由 ${editForm.assignee} 建立`,
    } : it));
    setEditSaved(true);
    setTimeout(() => setEditSaved(false), 1800);
  }

  /* ── 新增 task ── */
  function handleAddSubmit() {
    if (!addForm.title.trim()) return;
    setItems(prev => [{
      title:    addForm.title.trim(),
      priority: addForm.priority,
      body:     addForm.body || '',
      source:   `由 ${addForm.assignee} 建立`,
      tags:     [],
      assignee: addForm.assignee,
      dueDate:  addForm.dueDate,
    }, ...prev]);
    setAddForm({ title: '', priority: 'P3', dueDate: '', body: '', assignee: p.name || '' });
    setShowAddModal(false);
  }

  const selectedItem = selectedIdx !== null ? items[selectedIdx] : null;
  const isSelectedDone = completed.has(selectedIdx);

  /* ── shared icon button style ── */
  const iconBtnStyle = {
    width: 24, height: 24, borderRadius: 6, border: '1px solid ' + C.border,
    background: C.bg, color: C.textMuted, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: fz(13), transition: 'color 0.15s, border-color 0.15s', flexShrink: 0,
  };
  const iconHover = e => { e.currentTarget.style.color = C.textSub; e.currentTarget.style.borderColor = C.border; };
  const iconLeave = e => { e.currentTarget.style.color = C.textMuted; e.currentTarget.style.borderColor = C.border; };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, background: C.bg }}>
      {/* Header — always visible, never scrolls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderBottom: '1px solid ' + C.border, flexShrink: 0, background: C.bg }}>
        <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>My Tasks</span>
        <span style={{ fontSize: fz(11), color: C.textMuted }}>{activeCount} 筆</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          <button onClick={handleRefresh} title="刷新" style={iconBtnStyle} onMouseEnter={iconHover} onMouseLeave={iconLeave}>
            <span style={{ display: 'inline-block', transform: spinning ? 'rotate(360deg)' : 'rotate(0deg)', transition: spinning ? 'transform 0.7s linear' : 'none', lineHeight: 1 }}>↻</span>
          </button>
          <button onClick={() => { setAddForm({ title: '', priority: 'P3', dueDate: '', body: '', assignee: p.name || '' }); setShowAddModal(true); }} title="新增任務" style={{ ...iconBtnStyle, fontSize: fz(16) }} onMouseEnter={iconHover} onMouseLeave={iconLeave}>+</button>
        </div>
      </div>

      {/* Scrollable task list */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }} className="scrollbar-thin">

      {/* Empty state */}
      {visibleItems.length === 0 && (
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: fz(13), fontWeight: 600, color: C.textSub, marginBottom: 6 }}>今日任務全數完成</div>
          <div style={{ fontSize: fz(12), color: C.textMuted, lineHeight: 1.6 }}>
            休息一下，或點 + 新增下一個目標
          </div>
          <div style={{ marginTop: 16, fontSize: fz(11), color: '#D1D5DB', letterSpacing: '0.05em' }}>— 做得不錯 —</div>
        </div>
      )}

      {/* Cards */}
      {visibleItems.map(({ item, idx, isDone }) => (
        <div key={idx}
          onClick={() => openDetail(idx)}
          style={{
            padding: '8px 12px', borderBottom: '1px solid #F3F4F6',
            cursor: 'pointer', transition: 'background 0.1s',
            borderLeft: `3px solid ${isDone ? '#9E9E9E' : (borderColor[item.priority] || '#9E9E9E')}`,
            opacity: isDone ? 0.6 : 1,
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span style={{ fontSize: fz(10), fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: isDone ? 'rgba(34,197,94,0.08)' : badgeBg[item.priority], color: isDone ? '#16A34A' : badgeColor[item.priority] }}>
              {isDone ? '已完成' : item.priority}
            </span>
            <span style={{ fontSize: fz(10), color: C.textMuted, marginLeft: 'auto' }}>{item.source}</span>
          </div>
          <div style={{ fontSize: fz(13), fontWeight: 600, marginBottom: 4, color: isDone ? C.textMuted : C.text, textDecoration: isDone ? 'line-through' : 'none' }}>{item.title}</div>
          {item.parentTask && (
            <div style={{ marginBottom: 4 }}>
              <span
                onClick={e => { e.stopPropagation(); openParentTaskModal(item.parentTaskId); }}
                style={{
                  fontSize: fz(11), color: '#185FA5',
                  background: 'rgba(37,99,235,0.08)',
                  borderRadius: 4, padding: '1px 7px',
                  display: 'inline-flex', alignItems: 'center', gap: 3,
                  cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.16)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,99,235,0.08)'}
              >↳ {item.parentTask}</span>
            </div>
          )}
          <div style={{ fontSize: fz(12), color: C.textMuted, lineHeight: 1.4, marginBottom: 8, textDecoration: isDone ? 'line-through' : 'none' }}>{item.body}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {item.tags && item.tags.map((t, ti) => (
              <span key={ti} style={{ fontFamily: 'monospace', fontSize: fz(10), background: C.bgPanel, padding: '2px 6px', borderRadius: 4, color: C.textSub }}>{t}</span>
            ))}
            {!isDone && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
                {onAskAI && (
                  <button
                    onClick={e => { e.stopPropagation(); onAskAI({ text: [`【Task】${item.title}`, `【優先級】${item.priority}`, `【說明】${item.body}`, item.tags?.length ? `【標籤】${item.tags.join('、')}` : null, item.source ? `【來源】${item.source}` : null].filter(Boolean).join('\n'), label: item.title }); }}
                    style={{ background: 'transparent', color: '#2563EB', border: '1px solid rgba(37,99,235,0.4)', borderRadius: 6, padding: '4px 10px', fontSize: fz(11), fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >✦ Ask AI</button>
                )}
                <button
                  onClick={e => handleMarkComplete(idx, e)}
                  style={{ background: 'transparent', color: C.textMuted, border: '1px solid ' + C.border, borderRadius: 6, padding: '4px 10px', fontSize: fz(11), fontWeight: 600, cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSub; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = '#6B7280'; }}
                >標記完成</button>
              </div>
            )}
          </div>
        </div>
      ))}

      </div>{/* end scrollable task list */}

      {/* ── Task Detail Modal（可編輯）── */}
      {selectedItem && editForm && (
        <div onClick={() => { setSelectedIdx(null); setDetailEditMode(false); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.28)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.bg, borderRadius: 8, width: 400, maxWidth: '90vw', maxHeight: '84vh', display: 'flex', flexDirection: 'column', border: '1px solid ' + C.border }}>

            {/* ── Header ── */}
            <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid ' + C.border, flexShrink: 0 }}>
              {/* Parent task context (subtle breadcrumb) */}
              {selectedItem.parentTask && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: fz(10), color: C.textMuted }}>↳ 子任務，屬於：</span>
                  <span
                    onClick={() => { setSelectedIdx(null); setDetailEditMode(false); openParentTaskModal(selectedItem.parentTaskId); }}
                    style={{ fontSize: fz(11), color: '#2563EB', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                    onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                  >{selectedItem.parentTask}</span>
                </div>
              )}
              {/* Title + action buttons row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ fontSize: fz(15), fontWeight: 600, color: C.text, lineHeight: 1.4, flex: 1 }}>{selectedItem.title}</div>
                {!detailEditMode && (
                  <button
                    onClick={() => setDetailEditMode(true)}
                    style={{ flexShrink: 0, padding: '3px 10px', borderRadius: 6, border: '1px solid ' + C.border, background: C.bg, color: C.textMuted, fontSize: fz(11), cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >編輯</button>
                )}
                <button
                  onClick={() => { setSelectedIdx(null); setDetailEditMode(false); }}
                  style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: C.bgPanel, color: C.textMuted, cursor: 'pointer', fontSize: fz(14), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >✕</button>
              </div>
              {/* Status + Priority chips */}
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <span style={{ fontSize: fz(11), fontWeight: 500, padding: '2px 8px', borderRadius: 999, background: isSelectedDone ? 'rgba(34,197,94,0.08)' : 'rgba(37,99,235,0.08)', color: isSelectedDone ? '#16A34A' : '#2563EB' }}>
                  {isSelectedDone ? '已完成' : '進行中'}
                </span>
                {editForm.priority && (
                  <span style={{ fontSize: fz(11), fontWeight: 700, padding: '2px 8px', borderRadius: 999, color: prColor[editForm.priority], background: prBg[editForm.priority] }}>{editForm.priority}</span>
                )}
              </div>
            </div>

            {/* ── Body ── */}
            <div style={{ flex: 1, overflow: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {!detailEditMode ? (
                /* VIEW MODE */
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: fz(11), color: C.textMuted, width: 56, flexShrink: 0 }}>負責人</span>
                      <span style={{ fontSize: fz(13), color: C.text, fontWeight: 500 }}>
                        {selectedItem.parentTask
                          ? (selectedItem.source ? selectedItem.source.split('·')[0].trim() : '—')
                          : (editForm.assignee || '—')}
                      </span>
                    </div>
                    {editForm.dueDate && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: fz(11), color: C.textMuted, width: 56, flexShrink: 0 }}>截止日期</span>
                        <span style={{ fontSize: fz(13), color: C.text }}>{editForm.dueDate}</span>
                      </div>
                    )}
                    {selectedItem.source && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: fz(11), color: C.textMuted, width: 56, flexShrink: 0 }}>來源</span>
                        <span style={{ fontSize: fz(11), color: C.textMuted }}>{selectedItem.source}</span>
                      </div>
                    )}
                    {selectedItem.tags && selectedItem.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: fz(11), color: C.textMuted, width: 56, flexShrink: 0 }}>標籤</span>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {selectedItem.tags.map((t, ti) => (
                            <span key={ti} style={{ fontFamily: 'monospace', fontSize: fz(10), background: C.bgPanel, padding: '2px 6px', borderRadius: 4, color: C.textSub }}>{t}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div style={{ borderTop: '1px solid ' + C.border }} />
                  <div>
                    <label style={{ fontSize: fz(11), fontWeight: 600, color: C.textSub, display: 'block', marginBottom: 4 }}>備注</label>
                    <textarea
                      value={editForm.body}
                      onChange={e => setEditForm(f => ({ ...f, body: e.target.value }))}
                      rows={4}
                      placeholder="輸入備注或留言…"
                      style={{ width: '100%', boxSizing: 'border-box', fontSize: fz(13), color: C.textSub, lineHeight: 1.6, border: '1px solid ' + C.border, borderRadius: 6, padding: '8px 10px', resize: 'vertical', outline: 'none', fontFamily: 'inherit', background: C.bg }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                      <button
                        onClick={handleEditSave}
                        disabled={!editForm.title.trim()}
                        style={{ padding: '4px 14px', borderRadius: 6, border: 'none', background: editSaved ? '#22C55E' : '#2563EB', color: '#FFFFFF', fontSize: fz(11), fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                      >{editSaved ? '✓ 已儲存' : '儲存備注'}</button>
                    </div>
                  </div>
                </>
              ) : (
                /* EDIT MODE */
                <>
                  <div>
                    <label style={{ fontSize: fz(11), fontWeight: 600, color: C.textSub, display: 'block', marginBottom: 4 }}>標題</label>
                    <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} style={{ width: '100%', boxSizing: 'border-box', fontSize: fz(13), color: C.textSub, border: '1px solid ' + C.border, borderRadius: 6, padding: '6px 10px', outline: 'none', fontFamily: 'inherit' }} />
                  </div>
                  {!selectedItem.parentTask && (
                    <div>
                      <label style={{ fontSize: fz(11), fontWeight: 600, color: C.textSub, display: 'block', marginBottom: 4 }}>優先級</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {['P1', 'P2', 'P3'].map(pr => {
                          const active = editForm.priority === pr;
                          return (
                            <button key={pr} onClick={() => setEditForm(f => ({ ...f, priority: pr }))} style={{ flex: 1, padding: '5px 0', borderRadius: 6, fontSize: fz(12), fontWeight: 700, cursor: 'pointer', border: `1px solid ${active ? prColor[pr] : '#E0E0E0'}`, background: active ? prBg[pr] : '#FFFFFF', color: active ? prColor[pr] : C.textMuted }}>{pr}</button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: fz(11), fontWeight: 600, color: C.textSub, display: 'block', marginBottom: 4 }}>截止日期</label>
                    <input type="date" value={editForm.dueDate} onChange={e => setEditForm(f => ({ ...f, dueDate: e.target.value }))} style={{ width: '100%', boxSizing: 'border-box', fontSize: fz(13), color: C.textSub, border: '1px solid ' + C.border, borderRadius: 6, padding: '6px 10px', outline: 'none', fontFamily: 'inherit' }} />
                  </div>
                  {!selectedItem.parentTask && (
                    <div>
                      <label style={{ fontSize: fz(11), fontWeight: 600, color: C.textSub, display: 'block', marginBottom: 4 }}>指派給</label>
                      <select value={editForm.assignee} onChange={e => setEditForm(f => ({ ...f, assignee: e.target.value }))} style={{ width: '100%', boxSizing: 'border-box', fontSize: fz(13), color: C.textSub, border: '1px solid ' + C.border, borderRadius: 6, padding: '6px 10px', outline: 'none', fontFamily: 'inherit', background: C.bg }}>
                        {(p.members && p.members.length > 0 ? p.members : [{ name: p.name }]).map(m => (
                          <option key={m.name} value={m.name}>{m.name}{m.name === p.name ? '（我）' : ''}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label style={{ fontSize: fz(11), fontWeight: 600, color: C.textSub, display: 'block', marginBottom: 4 }}>說明</label>
                    <textarea value={editForm.body} onChange={e => setEditForm(f => ({ ...f, body: e.target.value }))} rows={3} placeholder="輸入說明或執行備註…" style={{ width: '100%', boxSizing: 'border-box', fontSize: fz(12), color: C.textSub, lineHeight: 1.6, border: '1px solid ' + C.border, borderRadius: 6, padding: '8px 10px', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }} />
                  </div>
                </>
              )}
            </div>

            {/* ── Footer ── */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid ' + C.border, display: 'flex', gap: 8, flexShrink: 0 }}>
              {!detailEditMode ? (
                !isSelectedDone ? (
                  <button
                    onClick={() => { handleMarkComplete(selectedIdx); setSelectedIdx(null); }}
                    style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: 'none', background: '#2563EB', color: '#FFFFFF', fontSize: fz(12), fontWeight: 600, cursor: 'pointer' }}
                  >✓ 標記完成</button>
                ) : (
                  <div style={{ flex: 1, padding: '7px 0', borderRadius: 6, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: fz(12), fontWeight: 600, color: '#16A34A' }}>✓ 已完成</span>
                  </div>
                )
              ) : (
                <>
                  <button onClick={() => { setDetailEditMode(false); setEditSaved(false); }} style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: '1px solid ' + C.border, background: C.bg, color: C.textMuted, fontSize: fz(12), cursor: 'pointer' }}>取消</button>
                  <button
                    onClick={() => { handleEditSave(); setDetailEditMode(false); }}
                    disabled={!editForm.title.trim()}
                    style={{ flex: 1, padding: '7px 0', borderRadius: 6, border: 'none', background: editSaved ? '#22C55E' : (editForm.title.trim() ? '#2563EB' : '#E0E0E0'), color: editForm.title.trim() ? '#FFFFFF' : C.textMuted, fontSize: fz(12), fontWeight: 600, cursor: editForm.title.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}
                  >{editSaved ? '✓ 已儲存' : '儲存變更'}</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Parent Task Modal ── */}
      {parentTaskModal && (
        <div
          onClick={() => setParentTaskModal(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.32)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            background: '#FFFFFF', borderRadius: 8, width: 480, maxWidth: '92vw', maxHeight: '80vh',
            border: '1px solid #E0E0E0', display: 'flex', flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #E0E0E0', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: fz(11), color: '#9E9E9E', marginBottom: 4 }}>主任務</div>
                <div style={{ fontSize: fz(14), fontWeight: 600, color: '#1A1A1A', lineHeight: 1.4 }}>{parentTaskModal.title}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                  {/* Status badge */}
                  <span style={{
                    fontSize: fz(11), fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                    color: { pending: '#9E9E9E', in_progress: '#2563EB', done: '#22C55E', overdue: '#F97316' }[parentTaskModal.status] || '#9E9E9E',
                    background: { pending: 'rgba(158,158,158,0.1)', in_progress: 'rgba(37,99,235,0.08)', done: 'rgba(34,197,94,0.08)', overdue: 'rgba(249,115,22,0.08)' }[parentTaskModal.status] || 'rgba(158,158,158,0.1)',
                  }}>
                    {{ pending: '未開始', in_progress: '進行中', done: '已完成', overdue: '逾期' }[parentTaskModal.status] || parentTaskModal.status}
                  </span>
                  {/* Priority badge */}
                  {parentTaskModal.priority && (
                    <span style={{
                      fontSize: fz(11), fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                      color: { P1: '#EF4444', P2: '#F59E0B', P3: '#9E9E9E' }[parentTaskModal.priority],
                      background: { P1: 'rgba(239,68,68,0.08)', P2: 'rgba(245,158,11,0.08)', P3: 'rgba(158,158,158,0.08)' }[parentTaskModal.priority],
                    }}>{parentTaskModal.priority}</span>
                  )}
                  {/* Assignee */}
                  <span style={{ fontSize: fz(11), color: '#9E9E9E' }}>負責人：{parentTaskModal.assignee}</span>
                </div>
              </div>
              <button
                onClick={() => setParentTaskModal(null)}
                style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: '#F5F5F5', color: '#9E9E9E', cursor: 'pointer', fontSize: fz(14), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >✕</button>
            </div>

            {/* Sub-task list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
              {parentTaskModal.subTasks && parentTaskModal.subTasks.length > 0 ? (
                <>
                  {/* Progress summary */}
                  {(() => {
                    const total = parentTaskModal.subTasks.length;
                    const done  = parentTaskModal.subTasks.filter(s => s.status === 'done').length;
                    return (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: fz(12), color: '#9E9E9E' }}>子任務進度</span>
                        <span style={{ fontSize: fz(12), fontWeight: 600, color: done === total ? '#22C55E' : '#2563EB' }}>{done}/{total} 完成</span>
                        {/* Progress bar */}
                        <div style={{ flex: 1, height: 4, background: '#F0F0F0', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${Math.round((done/total)*100)}%`, background: done === total ? '#22C55E' : '#2563EB', borderRadius: 2 }} />
                        </div>
                      </div>
                    );
                  })()}
                  {/* Sub-task rows */}
                  {parentTaskModal.subTasks.map(sub => {
                    const stColor = { pending: '#9E9E9E', in_progress: '#2563EB', done: '#22C55E', overdue: '#F97316' }[sub.status] || '#9E9E9E';
                    const stLabel = { pending: '未開始', in_progress: '進行中', done: '已完成', overdue: '逾期' }[sub.status] || sub.status;
                    return (
                      <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #F5F5F5' }}>
                        {/* Status dot */}
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: stColor, flexShrink: 0 }} />
                        {/* Title */}
                        <span style={{ flex: 1, fontSize: fz(13), color: sub.status === 'done' ? '#9E9E9E' : '#1A1A1A', textDecoration: sub.status === 'done' ? 'line-through' : 'none' }}>{sub.title}</span>
                        {/* Assignee */}
                        <span style={{ fontSize: fz(11), color: '#9E9E9E', flexShrink: 0 }}>{sub.assignee}</span>
                        {/* Status label */}
                        <span style={{ fontSize: fz(11), fontWeight: 600, color: stColor, flexShrink: 0 }}>{stLabel}</span>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#9E9E9E', fontSize: fz(13), padding: '24px 0' }}>此任務沒有子任務</div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                onClick={() => setParentTaskModal(null)}
                style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #E0E0E0', background: '#FFFFFF', color: '#666666', fontSize: fz(12), cursor: 'pointer' }}
              >關閉</button>
              {typeof onGoParentTask === 'function' && (
                <button
                  onClick={() => { const id = parentTaskModal.id; setParentTaskModal(null); onGoParentTask('', id); }}
                  style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: '#2563EB', color: '#FFFFFF', fontSize: fz(12), fontWeight: 600, cursor: 'pointer' }}
                >前往任務管理 →</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Add Task Modal ── */}
      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.28)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div onClick={e => e.stopPropagation()} style={{
            background: C.bg, borderRadius: 8, width: 360, maxWidth: '90vw', border: '1px solid ' + C.border,
          }}>
            {/* Header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text, flex: 1 }}>新增任務</span>
              <button onClick={() => setShowAddModal(false)} style={{ width: 24, height: 24, borderRadius: 6, border: 'none', background: C.bgPanel, color: C.textMuted, cursor: 'pointer', fontSize: fz(14), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            {/* Form */}
            <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Title */}
              <div>
                <label style={{ fontSize: fz(11), fontWeight: 600, color: C.textSub, display: 'block', marginBottom: 4 }}>任務標題 <span style={{ color: '#EF4444' }}>*</span></label>
                <input
                  value={addForm.title}
                  onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="輸入任務標題…"
                  autoFocus
                  style={{ width: '100%', boxSizing: 'border-box', fontSize: fz(13), color: C.textSub, border: '1px solid ' + C.border, borderRadius: 6, padding: '6px 10px', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
              {/* Priority */}
              <div>
                <label style={{ fontSize: fz(11), fontWeight: 600, color: C.textSub, display: 'block', marginBottom: 4 }}>優先級</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['P1', 'P2', 'P3'].map(pr => {
                    const prColor = { P1: '#EF4444', P2: '#F59E0B', P3: '#9E9E9E' }[pr];
                    const prBg    = { P1: 'rgba(239,68,68,0.08)', P2: 'rgba(245,158,11,0.08)', P3: 'rgba(158,158,158,0.08)' }[pr];
                    const active  = addForm.priority === pr;
                    return (
                      <button key={pr} onClick={() => setAddForm(f => ({ ...f, priority: pr }))} style={{
                        flex: 1, padding: '5px 0', borderRadius: 6, fontSize: fz(12), fontWeight: 700, cursor: 'pointer',
                        border: `1px solid ${active ? prColor : '#E0E0E0'}`,
                        background: active ? prBg : '#FFFFFF',
                        color: active ? prColor : C.textMuted,
                      }}>{pr}</button>
                    );
                  })}
                </div>
              </div>
              {/* Due Date */}
              <div>
                <label style={{ fontSize: fz(11), fontWeight: 600, color: C.textSub, display: 'block', marginBottom: 4 }}>截止日期</label>
                <input
                  type="date"
                  value={addForm.dueDate}
                  onChange={e => setAddForm(f => ({ ...f, dueDate: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', fontSize: fz(13), color: C.textSub, border: '1px solid ' + C.border, borderRadius: 6, padding: '6px 10px', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
              {/* Assignee */}
              <div>
                <label style={{ fontSize: fz(11), fontWeight: 600, color: C.textSub, display: 'block', marginBottom: 4 }}>指派給</label>
                <select
                  value={addForm.assignee}
                  onChange={e => setAddForm(f => ({ ...f, assignee: e.target.value }))}
                  style={{ width: '100%', boxSizing: 'border-box', fontSize: fz(13), color: C.textSub, border: '1px solid ' + C.border, borderRadius: 6, padding: '6px 10px', outline: 'none', fontFamily: 'inherit', background: C.bg }}
                >
                  {(p.members && p.members.length > 0 ? p.members : [{ name: p.name }]).map(m => (
                    <option key={m.name} value={m.name}>{m.name}{m.name === p.name ? '（我）' : ''}</option>
                  ))}
                </select>
              </div>
              {/* Buttons */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button onClick={() => setShowAddModal(false)} style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid ' + C.border, background: C.bg, color: C.textSub, fontSize: fz(12), cursor: 'pointer' }}>取消</button>
                <button
                  onClick={handleAddSubmit}
                  disabled={!addForm.title.trim()}
                  style={{
                    padding: '6px 16px', borderRadius: 6, border: 'none',
                    background: addForm.title.trim() ? '#2563EB' : '#E0E0E0',
                    color: addForm.title.trim() ? '#FFFFFF' : C.textMuted,
                    fontSize: fz(12), fontWeight: 600, cursor: addForm.title.trim() ? 'pointer' : 'not-allowed',
                  }}
                >建立任務</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── AmbientBar ── */
function AmbientBar({ p}) {
  var { C, fz } = useTheme();
  const [val, setVal] = React.useState('');
  const sug = p.key === 'mfg'
    ? ['今日產能落後多少？', '幫我起草協調說明', '排程要怎麼調整？']
    : p.key === 'process'
    ? ['Recipe 窗口確認', '幫我準備交班摘要', '查 SPC 異常判讀']
    : ['E-101 今天狀況？', '幫我準備交班摘要', '查詢換件 Skill'];
  return (
    <div style={{ padding: '8px 16px 12px', borderTop: '1px solid ' + C.border, background: C.bg, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.bgPanel, border: '1px solid ' + C.border, borderRadius: 8, padding: '8px 12px' }}>
        <div style={{ width: 24, height: 24, borderRadius: 4, background: p.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fz(11), flexShrink: 0, color: '#FFFFFF' }}>✦</div>
        <input value={val} onChange={e => setVal(e.target.value)}
          placeholder={`針對 ${p.name}，問 AI 任何問題…`}
          style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: C.text, fontSize: fz(14) }} />
        <div style={{ display: 'flex', gap: 4 }}>
          {sug.map((s, i) => (
            <button key={i} onClick={() => setVal(s)}
              style={{ background: C.bg, border: '1px solid ' + C.border, color: '#666666', borderRadius: 999, padding: '4px 8px', fontSize: fz(12), cursor: 'pointer', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.color = p.accentColor; e.currentTarget.style.borderColor = p.accentBorder; e.currentTarget.style.background = p.accentBg; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#666666'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = '#FFFFFF'; }}
            >{s}</button>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 4, fontSize: fz(12), color: C.textMuted, textAlign: 'center' }}>
        AI 已載入 {p.name} 上下文 · 對話內容為個人私有
      </div>
    </div>
  );
}

/* ── ShiftHandoverModal ── */
const NEXT_SHIFT = { '日班': '小夜班', '小夜班': '大夜班', '大夜班': '日班' };

function ShiftHandoverModal({ p, onClose, onSubmit}) {
  var { C, fz } = useTheme();
  const currentShift = p.currentShift || '日班';
  const nextShift    = NEXT_SHIFT[currentShift] || '下一班';

  const [loading, setLoading]       = React.useState(true);
  const [situation, setSituation]   = React.useState('');   // 區塊一：本班課況
  const [pending, setPending]       = React.useState('');   // 區塊二：遺留待追蹤
  const [notes, setNotes]           = React.useState('');   // 區塊三：下一班注意事項

  /* SOP 已經算好的那份（Schedule 產出＝佈告欄那則）；有的話直接預填，
     人只要補判斷與交代事項 —— 數字機器算，判斷人給。 */
  const sopReport = getLatestHandoverReport(p.key);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (sopReport && sopReport.output) {
        setSituation(sopReport.output.situation || '');
        setPending(sopReport.output.pending || '');
        setLoading(false);
        return;
      }

      // ── 區塊一：本班課況（KPI warn + Must-be-zero）── 沒有 SOP 產出時的退路
      const warnKpis  = (p.kpis || []).filter(k => k.status === 'warn');
      const alertMbz  = (p.mustBeZero || []).filter(m => !m.ok);
      let sitLines = [];
      if (warnKpis.length > 0) {
        sitLines.push('【KPI 未達標】' + warnKpis.map(k => `${k.label} ${k.value}${k.unit}（${k.target}）`).join('、') + '。');
      } else {
        sitLines.push('本班各項 KPI 皆達標。');
      }
      if (alertMbz.length > 0) {
        sitLines.push('【Must-be-zero 異常】' + alertMbz.map(m => m.label).join('、') + ' 目前有異常。');
      } else {
        sitLines.push('Must-be-zero 全數歸零，無異常。');
      }
      setSituation(sitLines.join('\n'));

      // ── 區塊二：遺留待追蹤事項 ──
      const p1Items  = (p.priorityFeed || []).filter(t => t.priority === 'P1');
      const mbzItems = (p.mustBeZero  || []).filter(m => !m.ok);
      let pendLines = [];
      mbzItems.forEach(m => pendLines.push(`• ${m.label}（${m.value}）尚未歸零，${nextShift}請持續追蹤。`));
      p1Items.forEach(t  => pendLines.push(`• ${t.title}（${t.source}）本班尚未結案。`));
      setPending(pendLines.length > 0 ? pendLines.join('\n') : '本班無遺留待追蹤事項。');

      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => onSubmit({ currentShift, nextShift, situation, pending, notes });

  const SectionLabel = ({ children, badge }) => (
    <div style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {children}
      {badge && <span style={{ fontSize: fz(10), fontWeight: 600, padding: '1px 6px', borderRadius: 999, background: '#EFF6FF', color: '#2563EB', textTransform: 'none', letterSpacing: 0 }}>{badge}</span>}
    </div>
  );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div className="fade-in" style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 8, width: 576, maxHeight: '84vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '16px', borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: fz(14), fontWeight: 600, color: C.text }}>班對班交班摘要</div>
            <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 2 }}>
              {currentShift} → {nextShift} · {p.name}
              {sopReport && <span style={{ color: '#2563EB' }}>　·　已由 SOP「{sopReport.scheduleName}」預填（{sopReport.dateLabel}）</span>}
            </div>
          </div>
          {loading && <span style={{ fontSize: fz(11), color: C.textMuted, marginLeft: 8 }}>{sopReport ? '正在載入 SOP 產出…' : 'AI 正在彙整本班課況…'}</span>}
          <button onClick={onClose}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: fz(18), color: C.textMuted, padding: '0 4px', lineHeight: 1 }}>×</button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }} className="scrollbar-thin">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', gap: 16 }}>
              <div className="spin" style={{ width: 32, height: 32, border: '3px solid ' + C.border, borderTopColor: '#2563EB', borderRadius: '50%' }} />
              <span style={{ fontSize: fz(13), color: C.textMuted }}>{sopReport ? "正在載入 SOP 已產出的 " + currentShift + " 課況…" : "AI 正在彙整 " + currentShift + " 課況…"}</span>
            </div>
          ) : (
            <>
              {/* 區塊一：本班課況 */}
              <div>
                <SectionLabel badge={sopReport ? "SOP 已算好 · 可編輯" : "AI 生成 · 可編輯"}>本班課況</SectionLabel>
                <textarea value={situation} onChange={e => setSituation(e.target.value)}
                  style={{ width: '100%', minHeight: 88, padding: 10, border: '1px solid ' + C.border, borderRadius: 6, fontSize: fz(13), color: C.textSub, lineHeight: 1.6, resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              {/* 區塊二：遺留待追蹤事項 */}
              <div>
                <SectionLabel badge={sopReport ? "SOP 已算好 · 可編輯" : "AI 生成 · 可編輯"}>遺留待追蹤事項</SectionLabel>
                <textarea value={pending} onChange={e => setPending(e.target.value)}
                  style={{ width: '100%', minHeight: 104, padding: 10, border: '1px solid ' + C.border, borderRadius: 6, fontSize: fz(13), color: C.textSub, lineHeight: 1.6, resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
              </div>

              {/* 區塊三：下一班注意事項（動態標籤） */}
              <div>
                <SectionLabel>{nextShift}注意事項（選填）</SectionLabel>
                <textarea value={notes} onChange={e => { if (e.target.value.length <= 500) setNotes(e.target.value); }}
                  placeholder={`請輸入交代給${nextShift}的特殊注意事項…`}
                  style={{ width: '100%', minHeight: 72, padding: 10, border: '1px solid ' + C.border, borderRadius: 6, fontSize: fz(13), color: C.textSub, lineHeight: 1.6, resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }} />
                <div style={{ fontSize: fz(11), color: C.textMuted, textAlign: 'right', marginTop: 4 }}>{notes.length} / 500</div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid ' + C.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: fz(11), color: C.textMuted }}>送出後將發布至課佈告欄，供{nextShift}全員確認。</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onClose}
              style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid ' + C.border, background: C.bg, color: C.textSub, fontSize: fz(13), fontWeight: 600, cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
              onMouseLeave={e => e.currentTarget.style.background = '#FFFFFF'}
            >取消</button>
            <button onClick={handleSubmit} disabled={loading}
              style={{ padding: '6px 16px', borderRadius: 6, border: 'none', background: loading ? '#D1D5DB' : '#2563EB', color: '#FFFFFF', fontSize: fz(13), fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1D4ED8'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#2563EB'; }}
            >✓ 確認送出</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── MyPinsWidget (Personal Zone — 首頁釘選應用) ── */
function MyPinsWidget({ pinnedAppIds, onGoAppCenter, p}) {
  var { C, fz } = useTheme();
  const ac = p.accentColor;
  const pins = (ALL_APPS || []).filter(a => (pinnedAppIds || []).includes(a.id)).slice(0, 6);

  return (
    <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 8, padding: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>我的釘選</span>
        <button
          onClick={() => onGoAppCenter && onGoAppCenter()}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: fz(11), color: ac, fontWeight: 500, padding: 0 }}
        >
          管理 →
        </button>
      </div>

      {pins.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '16px 0', fontSize: fz(12), color: C.textMuted }}>
          尚未釘選任何應用
          <br />
          <button
            onClick={() => onGoAppCenter && onGoAppCenter()}
            style={{ marginTop: 8, background: 'none', border: `1px solid ${ac}`, borderRadius: 6, color: ac, fontSize: fz(11), fontWeight: 500, padding: '4px 12px', cursor: 'pointer' }}
          >
            前往 APP 頁面釘選
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {pins.map(app => (
            <button
              key={app.id}
              title={app.desc}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '8px 4px', borderRadius: 8, border: '1px solid ' + C.border,
                background: app.bg || '#F9FAFB', cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = ac; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; }}
            >
              <span style={{ fontSize: fz(20) }}>{app.icon}</span>
              <span style={{ fontSize: fz(10), fontWeight: 500, color: C.textSub, textAlign: 'center', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', display: 'block', paddingInline: 2 }}>{app.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── DEFAULT Home Layout (per persona — auto-converted from previous layout) ── */
var DEFAULT_HOME_LAYOUT = {
  equipment: [
    { rowId: 'r-e-1', widgets: [{ slotId: 's-e-1', type: 'announcement' }] },
    { rowId: 'r-e-2', widgets: [{ slotId: 's-e-2', type: 'tool' }] },
    { rowId: 'r-e-3', widgets: [
      { slotId: 's-e-3', type: 'case' },
      { slotId: 's-e-4', type: 'lot' },
    ]},
    { rowId: 'r-e-5', widgets: [{ slotId: 's-e-5', type: 'kpi' }] },
    { rowId: 'r-e-6', widgets: [{ slotId: 's-e-6', type: 'app' }] },
    { rowId: 'r-e-4', widgets: [
      { slotId: 'lw-e-001', type: 'custom', title: '核心生產系統 (CIM)', html: '• <a href="#" target="_blank">MES 系統首頁</a><br>• <a href="#" target="_blank">EAP 機台監控</a><br>• <a href="#" target="_blank">WIP Performance</a><br>• <a href="#" target="_blank">RMS 配方管理</a><br>• <a href="#" target="_blank">MCS 搬送系統</a>' },
      { slotId: 'lw-e-002', type: 'custom', title: '設備維修資源', html: '• <a href="#" target="_blank">CMMS 工單系統</a><br>• <a href="#" target="_blank">PM 計畫表</a><br>• <a href="#" target="_blank">設備履歷查詢</a><br>• <a href="#" target="_blank">廠商聯絡窗口</a>' },
      { slotId: 'lw-e-003', type: 'custom', title: '天條 & 注意事項', html: '• <strong>停機超過 2h 須主動通報課長</strong><br>• <strong>換件後必須執行 Skill v2.3 確認</strong><br>• FDC Level-2 觸發立即回報 EE<br>• 每日交班前必填 Portal 交班記錄' },
    ]},
  ],
  process: [
    { rowId: 'r-p-1', widgets: [{ slotId: 's-p-1', type: 'announcement' }] },
    { rowId: 'r-p-2', widgets: [
      { slotId: 's-p-2', type: 'case' },
      { slotId: 's-p-3', type: 'lot' },
    ]},
    { rowId: 'r-p-3', widgets: [{ slotId: 's-p-4', type: 'kpi' }] },
    { rowId: 'r-p-4', widgets: [{ slotId: 's-p-5', type: 'app' }] },
    { rowId: 'r-p-5', widgets: [
      { slotId: 'lw-p-001', type: 'custom', title: '製程分析工具', html: '• <a href="#" target="_blank">SPC Console</a><br>• <a href="#" target="_blank">FDC 感測器數據</a><br>• <a href="#" target="_blank">EDA 工程分析</a><br>• <a href="#" target="_blank">Recipe Manager</a>' },
      { slotId: 'lw-p-002', type: 'custom', title: '良率與品質系統', html: '• <a href="#" target="_blank">YMS 良率管理</a><br>• <a href="#" target="_blank">WAT 數據系統</a><br>• <a href="#" target="_blank">Defect Gallery</a><br>• <a href="#" target="_blank">DCR 系統</a>' },
    ]},
  ],
  mfg: [
    { rowId: 'r-m-1', widgets: [{ slotId: 's-m-1', type: 'announcement' }] },
    { rowId: 'r-m-2', widgets: [{ slotId: 's-m-2', type: 'kpi' }] },
    { rowId: 'r-m-3', widgets: [{ slotId: 's-m-3', type: 'app' }] },
    { rowId: 'r-m-4', widgets: [
      { slotId: 'lw-m-001', type: 'custom', title: '生產管理系統', html: '• <a href="#" target="_blank">MES 生產系統</a><br>• <a href="#" target="_blank">產能儀表板</a><br>• <a href="#" target="_blank">Lot Center</a>' },
      { slotId: 'lw-m-002', type: 'custom', title: '排程與計畫', html: '• <a href="#" target="_blank">排程規劃系統</a><br>• <a href="#" target="_blank">WIP Tracker</a><br>• <a href="#" target="_blank">Critical Bottleneck</a>' },
      { slotId: 'lw-m-003', type: 'custom', title: '天條 & 注意事項', html: '• <strong>每日交班前必填 Portal 交班記錄</strong><br>• <strong>Priority Lot 交班前確認狀態</strong><br>• 停機超過 2h 須主動通報課長<br>• <a href="#" target="_blank">緊急應變手冊</a>' },
    ]},
  ],
};

/* ── LinkWidgetCard (custom type renderer) ── */
function LinkWidgetCard({ widget, onEdit }) {
  var { C, fz } = useTheme();
  var [open, setOpen] = React.useState(true);
  return (
    <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
      {/* Header — click to collapse/expand */}
      <div
        onClick={function() { setOpen(function(v) { return !v; }); }}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderBottom: open ? '1px solid ' + C.border : 'none', cursor: 'pointer' }}
        onMouseEnter={function(e) { e.currentTarget.style.background = '#FAFAFA'; }}
        onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent'; }}
      >
        <Chevron open={open} />
        <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>{widget.title}</span>
        <span style={{ fontSize: fz(9), fontWeight: 700, padding: '2px 6px', borderRadius: 999, background: '#F3F4F6', color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>自訂連結</span>
        {onEdit && (
          <button
            onClick={function(e) { e.stopPropagation(); onEdit(); }}
            title="編輯 Widget"
            style={{
              marginLeft: 8, background: 'none', border: '1px solid ' + C.border,
              borderRadius: 6, cursor: 'pointer', color: C.textMuted,
              padding: '3px 8px', fontSize: fz(12), lineHeight: 1,
              display: 'flex', alignItems: 'center', gap: 4,
              transition: 'border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={function(e) { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }}
            onMouseLeave={function(e) { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = '#9CA3AF'; }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
              <path d="M8.5 1.5a1.414 1.414 0 0 1 2 2L4 10 1 11l1-3 6.5-6.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            編輯
          </button>
        )}
      </div>
      {open && (
        <div className="lw-content" style={{ padding: '8px 16px 12px', fontSize: fz(13), color: C.textSub, lineHeight: 2 }}
          dangerouslySetInnerHTML={{ __html: widget.html || '' }} />
      )}
    </div>
  );
}

/* ── renderHomeWidget: dispatch by slot.type ── */
/* rowId 是為了讓 custom widget 的 onEdit 能帶出精確的 { rowId, slotId }，供 HomeLayoutTab 自動展開對應設定面板 */
/* 注意：本函式是被當一般函式呼叫（非 <Component />），所以裡面不能有 hook——
   否則 useTheme 會算進 DashboardPage 的 hook 序列，widget 數量一變就噴
   「change in the order of Hooks」。原本的 useTheme 未被使用，已移除。 */
function renderHomeWidget(slot, rp, rowId) {
  switch (slot.type) {
    case 'announcement': return <BulletinWidget p={rp.p} handoverRecord={rp.handoverRecord} onEdit={rp.onOpenBulletinSetting} onOpenHandover={rp.onOpenHandover} />;
    case 'tool':         return <ToolStatusWidget p={rp.p} />;
    case 'case':         return <CaseWidget p={rp.p} />;
    case 'lot':          return <LotHoldWidget p={rp.p} />;
    case 'kpi':          return <KpiSummaryWidget p={rp.p} kpiConfig={rp.kpiConfig} onEdit={rp.kpiConfig && rp.onOpenKpiSetting ? rp.onOpenKpiSetting : undefined} />;
    case 'app':          return <AppLauncherWidget p={rp.p} onEdit={rp.onOpenAppSetting} />;
    case 'custom':       return <LinkWidgetCard widget={slot} onEdit={function() { rp.onOpenLinkWidgetSetting({ rowId: rowId, slotId: slot.slotId }); }} />;
    default:             return null;
  }
}

/* ── DashboardPage ── */
function DashboardPage({ p, onAskAI, handoverRecord, onHandoverSubmit, pinnedAppIds, onGoAppCenter, kpiConfig, onKpiConfigChange, onOpenKpiSetting, onOpenBulletinSetting, onOpenAppSetting, onOpenLinkWidgetSetting, showHandoverModal, setShowHandoverModal, homeLayout, onGoTasks}) {
  var { C, fz } = useTheme();
  const handleModalSubmit = ({ currentShift, nextShift, situation, pending, notes }) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    let content = `【本班課況】\n${situation}`;
    content += `\n\n【遺留待追蹤事項】\n${pending}`;
    if (notes.trim()) content += `\n\n【${nextShift}注意事項】\n${notes.trim()}`;
    if (onHandoverSubmit) onHandoverSubmit({
      id: 'handover-' + Date.now(),
      author: p.user.name, av: p.user.avatar, avColor: p.accentColor,
      role: 'all', pinned: true, isRead: false, type: 'handover',
      title: `[交班記錄] ${currentShift} → ${nextShift}，今天 ${timeStr}`,
      content, time: `今天 ${timeStr}`,
      readCount: 1, totalCount: p.members ? p.members.length : 5,
    });
    if (setShowHandoverModal) setShowHandoverModal(false);
  };

  var rp = {
    p, handoverRecord, kpiConfig,
    onOpenBulletinSetting, onOpenKpiSetting, onOpenAppSetting, onOpenLinkWidgetSetting,
    /* 佈告欄那則 SOP 產出上的「補充交代事項」＝交班 Modal 的入口 */
    onOpenHandover: function() { if (setShowHandoverModal) setShowHandoverModal(true); },
  };
  const [rightOpen, setRightOpen] = React.useState(true);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {showHandoverModal && (
        <ShiftHandoverModal p={p} onClose={() => setShowHandoverModal && setShowHandoverModal(false)} onSubmit={handleModalSubmit} />
      )}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        {/* LEFT — Dynamic Layout */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }} className="scrollbar-thin">
          {(homeLayout || []).map(function(row) {
            return (
              <div key={row.rowId} style={{ display: 'flex', gap: 8 }}>
                {row.widgets.map(function(slot) {
                  return (
                    <div key={slot.slotId} style={{ flex: 1, minWidth: 0 }}>
                      {renderHomeWidget(slot, rp, row.rowId)}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        {/* Divider + collapse toggle tab */}
        <div style={{ position: 'relative', width: 1, background: C.border, flexShrink: 0 }}>
          <button
            onClick={() => setRightOpen(o => !o)}
            title={rightOpen ? '收合任務面板' : '展開任務面板'}
            style={{
              position: 'absolute', top: '50%', left: 0,
              transform: 'translate(-100%, -50%)',
              width: 14, height: 48, padding: 0,
              borderRadius: '6px 0 0 6px',
              border: '1px solid ' + C.border, borderRight: 'none',
              background: C.bg, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: C.textMuted, fontSize: fz(10), zIndex: 10,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F5'; e.currentTarget.style.color = C.textSub; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = C.textMuted; }}
          >{rightOpen ? '›' : '‹'}</button>
        </div>
        {/* RIGHT — My Tasks Panel (collapsible) */}
        <div style={{
          width: rightOpen ? 296 : 0,
          flexShrink: 0,
          overflow: 'hidden',
          transition: 'width 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <PersonalPriorityFeed p={p} onAskAI={onAskAI} onGoParentTask={onGoTasks} />
        </div>
      </div>
      <AmbientBar p={p} />
    </div>
  );
}

/* backward-compat alias */
function SectionPageView({ p }) {
  return <DashboardPage p={p} pinnedAppIds={[]} onGoAppCenter={() => {}} />;
}
