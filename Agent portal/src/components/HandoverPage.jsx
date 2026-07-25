/* ════════════════════════════════════════
   HANDOVER PAGE — 班對班交班中心
   ════════════════════════════════════════ */

const HO_NEXT_SHIFT = { '日班': '小夜班', '小夜班': '大夜班', '大夜班': '日班' };

/* ─────────────────────────────────────────
   Sprint 2: 歷史交班記錄 mock data
   ───────────────────────────────────────── */
const HANDOVER_HISTORY = {
  equipment: [
    {
      id: 'hr-eq-001', date: '2026-04-19', from: '日班', to: '小夜班',
      time: '16:02', author: 'Cindy L.',
      headlines: ['E-308 FDC 電流異常持續監控中，已降速 20%', 'E-203 計畫 PM 完成，18:20 恢復正常生產', 'E-101 AVL 切換，首批量測待 PE 確認（小夜 20:00）'],
      stats: { cases: 3, openCases: 2, p1: 1, events: 2 },
      notes: { machines: 'E-308 降速運行，小夜班每 30 分鐘確認 FDC 值一次', cases: '重點關注 C-0419-EE-01' },
    },
    {
      id: 'hr-eq-002', date: '2026-04-19', from: '大夜班', to: '日班',
      time: '08:05', author: 'Tom H.',
      headlines: ['E-308 大夜班 00:30 FDC 值穩定，已恢復正常速度', 'E-101 AVL 切換 PE 確認 OK，製程窗口合格', '全班無新增 Down Machine，稼動率 97.2%'],
      stats: { cases: 1, openCases: 1, p1: 0, events: 0 },
      notes: {},
    },
    {
      id: 'hr-eq-003', date: '2026-04-18', from: '小夜班', to: '大夜班',
      time: '00:03', author: 'Cindy L.',
      headlines: ['E-308 新 FDC Level-1 告警，已開立 Case 追蹤', 'E-105 Seasoning 批次研磨率偏低，已通知 PE', 'PM 排程：E-203 研磨頭明日日班計畫換件'],
      stats: { cases: 2, openCases: 2, p1: 1, events: 2 },
      notes: { machines: 'E-308 請持續監控，感測器疑似老化', pending: 'E-203 PM 備料已確認，明日 16:00 執行' },
    },
    {
      id: 'hr-eq-004', date: '2026-04-18', from: '日班', to: '小夜班',
      time: '16:04', author: 'Amy K.',
      headlines: ['本班無 Down Machine，稼動率 96.8%，KPI 達標', 'E-105 研磨液批號例行更換，製程窗口確認中', 'PM 計畫：E-203 研磨頭明日到期，已備料'],
      stats: { cases: 1, openCases: 1, p1: 0, events: 1 },
      notes: {},
    },
    {
      id: 'hr-eq-005', date: '2026-04-17', from: '大夜班', to: '日班',
      time: '08:01', author: 'Tom H.',
      headlines: ['E-308 感測器更換完成，FDC 值恢復正常（昨日 PM 結果）', '全班稼動率 98.1%，MTTR / PM 達成率均達標', '無未結 P1 事項，本次交班乾淨'],
      stats: { cases: 0, openCases: 0, p1: 0, events: 0 },
      notes: {},
    },
  ],
  process: [
    {
      id: 'hr-pe-001', date: '2026-04-19', from: '日班', to: '小夜班',
      time: '16:05', author: 'Kevin C.',
      headlines: ['HV-03 OOC 事件，L2204~L2206 Hold 中，根因調查進行中', 'L2207 客戶急單 Final Inspection，預計 22:00 出貨確認', 'L2210 DOE Lot 步驟 3 研磨率偏低，待 Process Owner 確認'],
      stats: { cases: 2, openCases: 2, p1: 1, events: 3 },
      notes: { process: 'HV-03 根因疑與 E-101 AVL 切換有關，待 22:00 量測數據確認' },
    },
    {
      id: 'hr-pe-002', date: '2026-04-19', from: '大夜班', to: '日班',
      time: '08:02', author: 'Grace W.',
      headlines: ['E-101 AVL 切換確認根因，小夜班已決策 Revert CMP-SLY-088', 'L2204~L2206 Hold 解除，已安排補跑', 'L2207 客戶急單 22:30 出貨確認，準時交付'],
      stats: { cases: 1, openCases: 0, p1: 0, events: 1 },
      notes: {},
    },
    {
      id: 'hr-pe-003', date: '2026-04-18', from: '小夜班', to: '大夜班',
      time: '00:01', author: 'Kevin C.',
      headlines: ['所有 SPC 管制站點正常，無 OOC 事件', 'DCR-0418-003 審核完成，Recipe HV-01 窗口更新上線', '無 Hold Lot，良率今日 99.1% ▲'],
      stats: { cases: 0, openCases: 0, p1: 0, events: 0 },
      notes: {},
    },
    {
      id: 'hr-pe-004', date: '2026-04-18', from: '日班', to: '小夜班',
      time: '16:06', author: 'Sarah M.',
      headlines: ['良率 KPI 98.9%，SPC OOC 0 件，全線穩定', 'Recipe HV-01 窗口 DCR 待審（DCR-0418-003）', '無特殊 Lot 狀況'],
      stats: { cases: 0, openCases: 0, p1: 0, events: 0 },
      notes: {},
    },
    {
      id: 'hr-pe-005', date: '2026-04-17', from: '大夜班', to: '日班',
      time: '08:03', author: 'Grace W.',
      headlines: ['全班 SPC 正常，無告警', '待審 DCR 3 筆，請日班優先處理 DCR-0417-011（高優先）', '本班乾淨，無遺留事項'],
      stats: { cases: 0, openCases: 0, p1: 0, events: 0 },
      notes: {},
    },
  ],
  mfg: [
    {
      id: 'hr-mfg-001', date: '2026-04-19', from: '日班', to: '小夜班',
      time: '16:03', author: 'Jason L.',
      headlines: ['Line 3 產能落後目標 8%（E-101 停機 2.5h 衝擊）', 'W26-031 客戶急單優先排程，今日交貨必保', 'W26-038 移至明日 Line 1 補排，已通知客戶'],
      stats: { cases: 1, openCases: 1, p1: 1, events: 2 },
      notes: { production: 'W26-031 必須在 00:00 前確認完成，否則啟動加班方案' },
    },
    {
      id: 'hr-mfg-002', date: '2026-04-19', from: '大夜班', to: '日班',
      time: '08:04', author: 'Mike C.',
      headlines: ['W26-031 23:52 完成交付，準時出貨', 'Line 3 大夜班追回落後，日班 WIP 正常', '良率 KPI 0.02% 觸發事件（HV-03 OOC 衍生），製程課已處理'],
      stats: { cases: 0, openCases: 0, p1: 0, events: 1 },
      notes: {},
    },
    {
      id: 'hr-mfg-003', date: '2026-04-18', from: '小夜班', to: '大夜班',
      time: '00:02', author: 'Jason L.',
      headlines: ['全線產能達標（103%），WIP 在製批數正常', '準時交貨率 97.8%，本月最高', '無 Priority Lot 積壓'],
      stats: { cases: 0, openCases: 0, p1: 0, events: 0 },
      notes: {},
    },
    {
      id: 'hr-mfg-004', date: '2026-04-18', from: '日班', to: '小夜班',
      time: '16:07', author: 'Helen T.',
      headlines: ['產出達成率 101%，線體稼動率 91.3% ▲', 'WIP 在製批數 44 批，正常範圍', '無急單，排程順暢'],
      stats: { cases: 0, openCases: 0, p1: 0, events: 0 },
      notes: {},
    },
    {
      id: 'hr-mfg-005', date: '2026-04-17', from: '大夜班', to: '日班',
      time: '08:00', author: 'Mike C.',
      headlines: ['全班順暢，產出達成率 98.5%', 'OTD 96.1%，符合目標 95%', '無未結 Case，本次交班乾淨'],
      stats: { cases: 0, openCases: 0, p1: 0, events: 0 },
      notes: {},
    },
  ],
};

/* ─────────────────────────────────────────
   Mock handover data (per persona key)
   ───────────────────────────────────────── */
const HANDOVER_DATA = {
  equipment: {
    machineEvents: [
      {
        id: 'me-1', machine: 'E-308', type: 'down', status: 'monitoring',
        summary: 'FDC 電流異常，持續監控中',
        detail: '09:30 觸發 FDC Level-2 告警，電流波動幅度 ±15%，已持續整個白班（約 6h）。目前降速 20% 繼續生產觀察。',
        actions: '• 冷卻水路壓力確認（正常 0.22 MPa）\n• Particle 測試 ×2（Pass，<30 pcs）\n• 降速 20% 繼續生產，每 30 min FDC 值班確認一次',
        nextStep: '小夜班觀察 1h，若穩定可恢復正常速度；若波動幅度 >20% 或 Particle fail，立即停機並升報 Section Manager，預計明日安排感測器更換 PM。',
      },
      {
        id: 'me-2', machine: 'E-203', type: 'pm', status: 'completed',
        summary: '計畫 PM 完成 — 研磨頭換件',
        detail: '16:00–18:20 依排程執行研磨頭換件（含 Seasoning 5 批次），耗時符合計畫（Skill 預估 2h）。',
        actions: '• 換件依 Skill v2.3，上蓋螺絲力矩確認 18 N·m\n• Seasoning 5 批完成，研磨率 553 Å/min（規格 550±50）\n• Particle <20 pcs（合格），已恢復正常生產',
        nextStep: '無後續動作，本 PM 已結案。',
      },
    ],
    avlChanges: [
      {
        id: 'avl-1', machine: 'E-101',
        item: '研磨液', from: 'CMP-SLY-088（L2024-03）', to: 'CMP-SLY-089（L2024-04）',
        reason: '供應商正常批號切換，前批耗盡',
        status: '製程窗口確認中（小夜班 20:00 取得首批量測結果）',
      },
    ],
    cases: [
      {
        id: 'C-0419-EE-01', priority: 'high', status: 'open', machine: 'E-308',
        title: 'E-308 FDC 電流異常持續監控',
        problem: 'E-308 FDC Level-2 告警，電流波動 ±15%，09:30 首次觸發，持續至交班時仍未完全恢復。',
        inspections: '冷卻水路壓力量測（正常）、Particle 測試 ×2、電流歷史趨勢回顧（過去 7 天）、泵浦運作聲音確認',
        results: '冷卻系統壓力正常（0.22 MPa），Particle 合格（<30 pcs）。電流趨勢顯示波動頻率每小時約 3 次，疑為感測器老化初期跡象。',
        actions: '降速 20% 繼續生產，每 30 min FDC 確認，開立 Case 追蹤。',
        nextSteps: '小夜班 1h 後若穩定恢復正常速度；若波動加大立即停機升報。預計明日安排感測器更換 PM，需提前備料。',
      },
      {
        id: 'C-0419-EE-02', priority: 'normal', status: 'closed', machine: 'E-203',
        title: 'E-203 計畫 PM — 研磨頭換件確認',
        problem: 'E-203 研磨頭達換件週期（使用 3200h），依排程 16:00 執行換件。',
        inspections: '換件前 Particle 確認、換件後力矩確認（18 N·m）、Seasoning 批次量測（×5）',
        results: '換件後研磨率 553 Å/min（規格 550±50），Particle <20 pcs，均符合規格。',
        actions: '依 Skill v2.3 完成換件，Seasoning 5 批完成，18:20 恢復正常生產。',
        nextSteps: '無後續動作，本 Case 結案。',
      },
      {
        id: 'C-0412-EE-03', priority: 'normal', status: 'open', machine: 'E-101',
        title: 'E-101 研磨液 AVL 切換 — 製程窗口確認',
        problem: 'CMP-SLY-088 耗盡，切換至 CMP-SLY-089，需確認製程窗口不受影響。',
        inspections: '首批切換後量測 Thickness Uniformity、研磨率、Defect Count',
        results: '首批量測結果預計小夜班 20:00 取得，尚未確認。',
        actions: '已通知 PE 協助確認量測結果，PE 正在等待數據。',
        nextSteps: '小夜班取得首批量測結果後通知 PE 確認。若 OK 繼續；若研磨率異常（>±5%）立即 hold 並聯絡供應商。',
      },
    ],
  },

  process: {
    oocEvents: [
      {
        id: 'ooc-1', recipe: 'HV-03', station: 'CMP Station A',
        lots: ['L2204', 'L2205', 'L2206'], status: 'ongoing',
        detail: '連續 3 批良率 91.2%，低於管制下限 93%。Nelson Rule 1 觸發（>3σ）。06:55 SPC Console 首次告警。',
        action: '已暫停 HV-03 相關 Lot 生產，啟動根因分析。比對 Particle 數據與 Recipe 參數，懷疑與 E-101 研磨液 AVL 切換有關（時間點吻合）。已通知設備課協查。',
      },
    ],
    holdLots: [
      {
        id: 'hl-1', lots: ['L2204', 'L2205', 'L2206'],
        reason: 'Recipe HV-03 OOC，良率 91.2%（下限 93%）',
        impact: 'Quality（良率損失）+ Move（停線等確認）',
        action: '持續 Hold 中，PE 根因分析預計小夜班 22:00 前出初步結論。',
        decision: '重工 / 報廢 / 放行，視根因確認結果決定',
        status: 'on-hold',
      },
    ],
    specialLots: [
      {
        id: 'sl-1', lot: 'L2207', category: '客戶急單',
        desc: 'TSEC-A 客戶指定急單，今日交貨',
        progress: '已完成所有指定製程步驟，Final Inspection 進行中，預計 22:00 前出貨確認。',
        status: '準時',
      },
      {
        id: 'sl-2', lot: 'L2210', category: '實驗 Lot',
        desc: 'Pressure 參數優化 DOE — 低壓組',
        progress: '步驟 3（CMP）量測：研磨率 498 Å/min，略低於下限 500 Å/min。已通知 Process Owner 李佳穎確認是否為 DOE 預期結果。',
        status: '異常待確認',
      },
    ],
    cases: [
      {
        id: 'C-0419-PE-01', priority: 'high', status: 'open', lot: 'L2204~L2206',
        title: 'HV-03 OOC 良率異常 — 根因調查進行中',
        problem: 'Recipe HV-03 連續 3 批良率低於管制下限（91.2% vs 93%），SPC Nelson Rule 1 觸發，06:55 告警。',
        inspections: 'SPC 管制圖趨勢回顧（14 天）、Particle 計數比對、E-101 AVL 切換紀錄確認、上游製程參數比對',
        results: '良率從昨日起開始下滑，時間點與 E-101 研磨液批號切換吻合（相差約 2 批次）。疑似新批號研磨率偏高導致良率損失。',
        actions: '暫停 HV-03 相關生產，Hold L2204~L2206，開立 Case，通知設備課確認 E-101 AVL 切換首批量測結果。',
        nextSteps: '小夜班 22:00 前取得 E-101 首批切換量測數據。若研磨率異常偏高，確認 AVL 為根因，決定是否 Revert 至 CMP-SLY-088 或調整 Recipe 補償。L2204~L2206 Hold 決策待根因確認後 30 分鐘內完成。',
      },
      {
        id: 'C-0419-PE-02', priority: 'normal', status: 'open', lot: 'L2210',
        title: 'L2210 DOE Lot — 步驟 3 研磨率偏低確認',
        problem: 'L2210 Pressure 優化 DOE 低壓組，步驟 3 研磨率 498 Å/min，低於目標下限 500 Å/min。',
        inspections: '三點量測均值確認、Recipe 參數比對（與 DOE 設計一致）、設備狀態確認（E-101 正常）',
        results: '量測均值 498±3 Å/min，設備與 Recipe 均正常。研磨率偏低可能為 DOE 低壓參數設計的預期結果（需 Process Owner 確認）。',
        actions: '已通知 Process Owner 確認，等待回覆。',
        nextSteps: '確認 DOE 設計意圖。若為預期結果則繼續後續步驟；若非預期則調整壓力參數後重跑步驟 3。',
      },
    ],
  },

  mfg: {
    productionEvents: [
      {
        id: 'pe-1', line: 'Line 3', status: 'ongoing',
        summary: '產能落後目標 8%，急單優先排程',
        detail: 'E-101 停機 2.5h（09:30–12:00），導致 Line 3 累計落後目標 8%。W26-031 客戶急單交期今日。',
        actions: '• 優先排程 W26-031，確保今日交貨\n• W26-038（非急單）移至明日 Line 1 補排\n• 通知設備課確認 E-101 復機穩定性',
        nextStep: '大夜班持續追蹤 W26-031 進度，00:00 前確認是否準時完成；若有異常立即通知部長，評估加班方案。',
      },
      {
        id: 'pe-2', line: '全線', status: 'monitoring',
        summary: '良率 KPI 觸發 0 值警報',
        detail: '23:45 系統警報：良率損失 KPI 0.02%（限制 >0 即觸發）。確認為 HV-03 OOC 事件衍生，L2204~L2206 Hold 中。',
        actions: '• 製程課已知悉並處理\n• Hold Lot 狀況持續追蹤',
        nextStep: '等待製程課根因確認結果（預計小夜班 22:00），視情況評估是否需要額外應對。',
      },
    ],
    cases: [
      {
        id: 'C-0419-MFG-01', priority: 'high', status: 'open', line: 'Line 3',
        title: 'Line 3 產能落後 — E-101 停機衝擊',
        problem: 'E-101 停機 2.5h 導致 Line 3 累計落後目標 8%，W26-031 客戶急單交期受威脅（今日交貨）。',
        inspections: '各線 WIP 盤點、可補救產能計算（剩餘 7h）、W26-031 剩餘製程步驟確認（2 站）',
        results: '估計可追回 5–6%，W26-031 有機會準時交付但無緩衝空間。W26-038 今日無法完成，移明日。',
        actions: '優先排程 W26-031，調整 Line 3 機台配置，部長已知悉並同意方案。',
        nextSteps: '大夜班持續追蹤 W26-031 進度，00:00 前確認是否準時完成；若有異常立即通知部長。W26-038 明日 Line 1 補排需提前確認機台可用性。',
      },
    ],
  },
};

/* ─────────────────────────────────────────
   Helper: StatusBadge
   ───────────────────────────────────────── */
const HO_STATUS_CFG = {
  monitoring:  { label: '監控中',   bg: '#FEF3C7', color: '#92400E' },
  completed:   { label: '已完成',   bg: '#F0FDF4', color: '#166534' },
  ongoing:     { label: '處理中',   bg: '#FEE2E2', color: '#B91C1C' },
  'on-hold':   { label: 'On Hold', bg: '#FEF3C7', color: '#92400E' },
  open:        { label: '追蹤中',   bg: '#EFF6FF', color: '#1D4ED8' },
  closed:      { label: '已結案',   bg: '#F0FDF4', color: '#166534' },
  '準時':      { label: '準時',     bg: '#F0FDF4', color: '#166534' },
  '異常待確認': { label: '異常待確認', bg: '#FEE2E2', color: '#B91C1C' },
};
function StatusBadge({ status}) {
  var { C, fz } = useTheme();
  const cfg = HO_STATUS_CFG[status] || { label: status, bg: '#F3F4F6', color: C.textMuted };
  return (
    <span style={{ fontSize: fz(10), fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: cfg.bg, color: cfg.color, flexShrink: 0 }}>{cfg.label}</span>
  );
}

/* ─────────────────────────────────────────
   SectionCard wrapper
   ───────────────────────────────────────── */
function SectionCard({ sectionId, title, badge, confirmed, onConfirm, note, onNoteChange, children}) {
  var { C, fz } = useTheme();
  return (
    <div style={{ background: C.bg, border: `1px solid ${confirmed ? '#22C55E' : '#E0E0E0'}`, borderRadius: 8, transition: 'border-color 0.2s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid #F3F4F6', background: confirmed ? 'rgba(34,197,94,0.04)' : '#FAFAFA', borderRadius: '8px 8px 0 0' }}>
        <span style={{ fontSize: fz(13), fontWeight: 700, color: C.text }}>{title}</span>
        {badge && <span style={{ fontSize: fz(10), fontWeight: 600, padding: '2px 6px', borderRadius: 999, background: '#EFF6FF', color: '#2563EB' }}>{badge}</span>}
        <button onClick={() => onConfirm(sectionId)} style={{
          marginLeft: 'auto', padding: '4px 12px', borderRadius: 6, fontSize: fz(12), fontWeight: 600, cursor: 'pointer',
          border: `1px solid ${confirmed ? '#22C55E' : '#D1D5DB'}`,
          background: confirmed ? 'rgba(34,197,94,0.08)' : 'transparent',
          color: confirmed ? '#166534' : '#6B7280',
        }}>
          {confirmed ? '✓ 已確認' : '標記已確認'}
        </button>
      </div>
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', maxHeight: '60vh' }}>
        {children}
        <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: 12 }}>
          <div style={{ fontSize: fz(10), fontWeight: 700, color: C.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>補充說明 / 討論記錄（選填）</div>
          <textarea value={note || ''} onChange={e => onNoteChange(sectionId, e.target.value)}
            placeholder="新增本區塊的補充說明或討論記錄…"
            style={{ width: '100%', minHeight: 48, padding: 8, border: '1px solid ' + C.border, borderRadius: 6, fontSize: fz(12), color: C.textSub, lineHeight: 1.5, resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: C.bgSub }} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Section: KPI 今日表現
   ───────────────────────────────────────── */
function KPISection({ p}) {
  var { C, fz } = useTheme();
  const statusColor = { ok: '#22C55E', warn: '#F59E0B', info: '#2563EB' };
  const statusBg    = { ok: 'rgba(34,197,94,0.08)', warn: 'rgba(245,158,11,0.08)', info: 'rgba(37,99,235,0.08)' };
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
      {(p.kpis || []).map((k, i) => (
        <div key={i} style={{ padding: '12px', borderRadius: 6, border: '1px solid ' + C.border, background: statusBg[k.status] || '#FAFAFA' }}>
          <div style={{ fontSize: fz(11), color: C.textMuted, marginBottom: 4 }}>{k.label}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
            <span style={{ fontSize: fz(22), fontWeight: 700, color: statusColor[k.status] || '#111827' }}>{k.value}</span>
            <span style={{ fontSize: fz(12), color: C.textMuted }}>{k.unit}</span>
          </div>
          <div style={{ fontSize: fz(11), color: C.textMuted }}>{k.target}</div>
          {k.trend && k.trend !== '—' && (
            <div style={{ fontSize: fz(10), color: statusColor[k.status] || '#6B7280', marginTop: 2, fontWeight: 600 }}>{k.trend}</div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   Section: 機台事件 (EE)
   ───────────────────────────────────────── */
function MachineEventsSection({ data}) {
  var { C, fz } = useTheme();
  const typeLabel = { down: 'Down/異常', pm: '計畫 PM', avl: 'AVL 變更' };
  const typeBg    = { down: '#FEE2E2', pm: '#F0FDF4', avl: '#EFF6FF' };
  const typeColor = { down: '#B91C1C', pm: '#166534', avl: '#1D4ED8' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 機台事件 */}
      {(data.machineEvents || []).map(ev => (
        <div key={ev.id} style={{ border: '1px solid ' + C.border, borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: C.bgSub, borderBottom: '1px solid #F3F4F6' }}>
            <span style={{ fontFamily: 'monospace', fontSize: fz(12), fontWeight: 700, color: C.textSub }}>{ev.machine}</span>
            <span style={{ fontSize: fz(10), fontWeight: 700, padding: '1px 6px', borderRadius: 999, background: typeBg[ev.type], color: typeColor[ev.type] }}>{typeLabel[ev.type]}</span>
            <StatusBadge status={ev.status} />
            <span style={{ fontSize: fz(12), fontWeight: 600, color: C.text, marginLeft: 4 }}>{ev.summary}</span>
          </div>
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <div style={{ fontSize: fz(10), fontWeight: 700, color: C.textMuted, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>狀況說明</div>
              <div style={{ fontSize: fz(12), color: C.textSub, lineHeight: 1.5 }}>{ev.detail}</div>
            </div>
            <div>
              <div style={{ fontSize: fz(10), fontWeight: 700, color: C.textMuted, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>本班處置</div>
              <div style={{ fontSize: fz(12), color: C.textSub, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{ev.actions}</div>
            </div>
            <div style={{ padding: '8px 10px', borderRadius: 6, background: '#FEF3C7', border: '1px solid rgba(245,158,11,0.2)' }}>
              <div style={{ fontSize: fz(10), fontWeight: 700, color: '#92400E', marginBottom: 2 }}>交接下一班</div>
              <div style={{ fontSize: fz(12), color: C.textSub, lineHeight: 1.5 }}>{ev.nextStep}</div>
            </div>
          </div>
        </div>
      ))}
      {/* AVL 變更 */}
      {(data.avlChanges || []).length > 0 && (
        <div>
          <div style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AVL 變更</div>
          {data.avlChanges.map(avl => (
            <div key={avl.id} style={{ padding: '10px 12px', border: '1px solid ' + C.border, borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'monospace', fontSize: fz(12), fontWeight: 700, color: C.textSub }}>{avl.machine}</span>
                <span style={{ fontSize: fz(12), color: C.text, fontWeight: 600 }}>{avl.item} 批號切換</span>
              </div>
              <div style={{ fontSize: fz(12), color: C.textMuted }}>{avl.from} → <span style={{ fontWeight: 600, color: '#2563EB' }}>{avl.to}</span></div>
              <div style={{ fontSize: fz(11), color: C.textMuted }}>原因：{avl.reason}</div>
              <div style={{ fontSize: fz(11), color: '#F59E0B', fontWeight: 600 }}>狀態：{avl.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Section: 製程事件 (PE)
   ───────────────────────────────────────── */
function ProcessEventsSection({ data}) {
  var { C, fz } = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* PA OOC */}
      {(data.oocEvents || []).length > 0 && (
        <div>
          <div style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>PA OOC 事件</div>
          {data.oocEvents.map(ev => (
            <div key={ev.id} style={{ border: '1px solid #FCA5A5', borderRadius: 6, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#FEF2F2', borderBottom: '1px solid #FCA5A5' }}>
                <span style={{ fontFamily: 'monospace', fontSize: fz(12), fontWeight: 700, color: C.textSub }}>{ev.recipe}</span>
                <span style={{ fontSize: fz(11), color: C.textMuted }}>{ev.station}</span>
                <StatusBadge status={ev.status} />
                <div style={{ marginLeft: 8, display: 'flex', gap: 4 }}>
                  {ev.lots.map(l => <span key={l} style={{ fontFamily: 'monospace', fontSize: fz(10), background: '#FEE2E2', color: '#B91C1C', padding: '1px 5px', borderRadius: 4 }}>{l}</span>)}
                </div>
              </div>
              <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: fz(12), color: C.textSub, lineHeight: 1.5 }}>{ev.detail}</div>
                <div style={{ padding: '6px 10px', borderRadius: 6, background: '#FEF3C7', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <div style={{ fontSize: fz(10), fontWeight: 700, color: '#92400E', marginBottom: 2 }}>已採取行動</div>
                  <div style={{ fontSize: fz(12), color: C.textSub, lineHeight: 1.5 }}>{ev.action}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Hold Lots */}
      {(data.holdLots || []).length > 0 && (
        <div>
          <div style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Hold Lot 狀況</div>
          {data.holdLots.map(hl => (
            <div key={hl.id} style={{ padding: '10px 12px', border: '1px solid ' + C.border, borderRadius: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {hl.lots.map(l => <span key={l} style={{ fontFamily: 'monospace', fontSize: fz(11), fontWeight: 700, background: '#FEF3C7', color: '#92400E', padding: '2px 6px', borderRadius: 4 }}>{l}</span>)}
                <StatusBadge status={hl.status} />
              </div>
              <div style={{ fontSize: fz(12), color: C.textSub }}>原因：{hl.reason}</div>
              <div style={{ fontSize: fz(12), color: C.textSub }}>影響：<span style={{ color: '#B91C1C', fontWeight: 600 }}>{hl.impact}</span></div>
              <div style={{ fontSize: fz(12), color: C.textMuted }}>當前行動：{hl.action}</div>
              <div style={{ fontSize: fz(11), fontWeight: 600, color: '#F59E0B' }}>決策待定：{hl.decision}</div>
            </div>
          ))}
        </div>
      )}
      {/* Special Lots */}
      {(data.specialLots || []).length > 0 && (
        <div>
          <div style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>特殊 Lot 進度</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.specialLots.map(sl => (
              <div key={sl.id} style={{ padding: '10px 12px', border: '1px solid ' + C.border, borderRadius: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: fz(12), fontWeight: 700, color: '#2563EB' }}>{sl.lot}</span>
                  <span style={{ fontSize: fz(10), fontWeight: 700, padding: '1px 6px', borderRadius: 999, background: '#EFF6FF', color: '#1D4ED8' }}>{sl.category}</span>
                  <StatusBadge status={sl.status} />
                </div>
                <div style={{ fontSize: fz(11), color: C.textMuted, marginBottom: 4 }}>{sl.desc}</div>
                <div style={{ fontSize: fz(12), color: C.textSub, lineHeight: 1.5 }}>{sl.progress}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Section: 產線事件 (MFG)
   ───────────────────────────────────────── */
function ProductionEventsSection({ data}) {
  var { C, fz } = useTheme();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(data.productionEvents || []).map(ev => (
        <div key={ev.id} style={{ border: '1px solid ' + C.border, borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: C.bgSub, borderBottom: '1px solid #F3F4F6' }}>
            <span style={{ fontFamily: 'monospace', fontSize: fz(12), fontWeight: 700, color: C.textSub }}>{ev.line}</span>
            <StatusBadge status={ev.status} />
            <span style={{ fontSize: fz(12), fontWeight: 600, color: C.text }}>{ev.summary}</span>
          </div>
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: fz(12), color: C.textSub, lineHeight: 1.5 }}>{ev.detail}</div>
            <div>
              <div style={{ fontSize: fz(10), fontWeight: 700, color: C.textMuted, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>本班處置</div>
              <div style={{ fontSize: fz(12), color: C.textSub, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{ev.actions}</div>
            </div>
            <div style={{ padding: '8px 10px', borderRadius: 6, background: '#FEF3C7', border: '1px solid rgba(245,158,11,0.2)' }}>
              <div style={{ fontSize: fz(10), fontWeight: 700, color: '#92400E', marginBottom: 2 }}>交接下一班</div>
              <div style={{ fontSize: fz(12), color: C.textSub, lineHeight: 1.5 }}>{ev.nextStep}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   Section: Case Center 重點 Case（所有課）
   ───────────────────────────────────────── */
function CasesSection({ cases}) {
  var { C, fz } = useTheme();
  const [expanded, setExpanded] = React.useState(
    () => Object.fromEntries((cases || []).map(c => [c.id, true]))
  );
  const toggle = id => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const CASE_FIELDS = [
    { key: 'problem',    label: '問題描述' },
    { key: 'inspections',label: '已做的檢查' },
    { key: 'results',    label: '檢查結果' },
    { key: 'actions',    label: '已做的處置' },
    { key: 'nextSteps',  label: '後續動作' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {cases.map(c => (
        <div key={c.id} style={{ border: `1px solid ${c.priority === 'high' ? '#FCA5A5' : '#E0E0E0'}`, borderRadius: 6, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: c.priority === 'high' ? '#FEF2F2' : '#FAFAFA', cursor: 'pointer' }}
            onClick={() => toggle(c.id)}>
            <span style={{ fontFamily: 'monospace', fontSize: fz(11), color: C.textMuted }}>{c.id}</span>
            {c.machine && <span style={{ fontFamily: 'monospace', fontSize: fz(11), fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '1px 5px', borderRadius: 4 }}>{c.machine}</span>}
            {c.lot && <span style={{ fontFamily: 'monospace', fontSize: fz(11), fontWeight: 700, color: '#7C3AED', background: '#F5F3FF', padding: '1px 5px', borderRadius: 4 }}>{c.lot}</span>}
            {c.line && <span style={{ fontFamily: 'monospace', fontSize: fz(11), fontWeight: 700, color: '#F59E0B', background: '#FEF3C7', padding: '1px 5px', borderRadius: 4 }}>{c.line}</span>}
            {c.priority === 'high' && <span style={{ fontSize: fz(10), fontWeight: 700, color: '#B91C1C', background: '#FEE2E2', padding: '1px 5px', borderRadius: 999 }}>重點</span>}
            <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text, flex: 1 }}>{c.title}</span>
            <StatusBadge status={c.status} />
            <span style={{ fontSize: fz(12), color: C.textMuted, marginLeft: 4 }}>{expanded[c.id] ? '▲' : '▼'}</span>
          </div>
          {expanded[c.id] && (
            <div style={{ borderTop: '1px solid #F3F4F6' }}>
              {CASE_FIELDS.map((f, fi) => (
                <div key={f.key} style={{ display: 'flex', borderBottom: fi < CASE_FIELDS.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <div style={{ width: 104, flexShrink: 0, padding: '10px 12px', background: C.bgSub, borderRight: '1px solid #F3F4F6' }}>
                    <div style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted }}>{f.label}</div>
                  </div>
                  <div style={{ flex: 1, padding: '10px 12px', fontSize: fz(12), color: C.textSub, lineHeight: 1.6 }}>{c[f.key]}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   Section: 當班交辦事項
   ───────────────────────────────────────── */
function PendingSection({ p}) {
  var { C, fz } = useTheme();
  const items = (p.priorityFeed || []).filter(t => t.priority === 'P1' || t.priority === 'P2');
  const borderColor = { P1: '#EF4444', P2: '#F59E0B' };
  const badgeBg     = { P1: 'rgba(239,68,68,0.1)', P2: 'rgba(245,158,11,0.1)' };
  const badgeColor  = { P1: '#B91C1C', P2: '#92400E' };
  if (items.length === 0) return <div style={{ fontSize: fz(13), color: C.textMuted, padding: '8px 0' }}>本班無未結交辦事項。</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{ padding: '10px 12px', border: '1px solid ' + C.border, borderLeft: `3px solid ${borderColor[item.priority]}`, borderRadius: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: fz(10), fontWeight: 700, padding: '1px 6px', borderRadius: 999, background: badgeBg[item.priority], color: badgeColor[item.priority] }}>{item.priority}</span>
            <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>{item.title}</span>
          </div>
          <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 4 }}>{item.body}</div>
          <div style={{ fontSize: fz(11), color: C.textMuted }}>{item.source}</div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   Sprint 2: 歷史記錄元件
   ───────────────────────────────────────── */

/* 單筆記錄的右側詳情面板 */
function HandoverRecordDetail({ record}) {
  var { C, fz } = useTheme();
  const shiftColor = { '日班': '#2563EB', '小夜班': '#7C3AED', '大夜班': '#0F766E' };
  const shiftBg    = { '日班': '#EFF6FF', '小夜班': '#F5F3FF', '大夜班': '#F0FDFA' };

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Detail header */}
      <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: fz(13), fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: shiftBg[record.from] || '#F3F4F6', color: shiftColor[record.from] || '#374151' }}>{record.from}</span>
          <span style={{ fontSize: fz(16), color: C.textMuted }}>→</span>
          <span style={{ fontSize: fz(13), fontWeight: 700, padding: '3px 10px', borderRadius: 6, background: shiftBg[record.to] || '#F3F4F6', color: shiftColor[record.to] || '#374151' }}>{record.to}</span>
          <span style={{ fontSize: fz(12), color: C.textMuted, marginLeft: 8 }}>{record.date} {record.time} · {record.author} 發起</span>
          <span style={{ marginLeft: 'auto', fontSize: fz(10), fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: '#F0FDF4', color: '#166534' }}>已存檔</span>
        </div>
        {/* Stats row */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {[
            { label: 'Case 件數',    val: record.stats.cases,     bad: record.stats.cases > 0 },
            { label: '未結 Case',    val: record.stats.openCases, bad: record.stats.openCases > 0 },
            { label: 'P1 交辦',      val: record.stats.p1,        bad: record.stats.p1 > 0 },
            { label: '設備/製程事件', val: record.stats.events,    bad: record.stats.events > 0 },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 64 }}>
              <span style={{ fontSize: fz(10), color: C.textMuted }}>{s.label}</span>
              <span style={{ fontSize: fz(20), fontWeight: 700, color: s.bad && s.val > 0 ? '#EF4444' : '#111827' }}>{s.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Headlines */}
      <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 8, padding: 16 }}>
        <div style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>本班摘要</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {record.headlines.map((h, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563EB', flexShrink: 0, marginTop: 6 }} />
              <span style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.6 }}>{h}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notes (if any) */}
      {Object.keys(record.notes || {}).length > 0 && (
        <div style={{ background: '#FFFBEB', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: fz(11), fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>交班補充說明</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(record.notes).map(([section, note]) => {
              const sectionLabel = { kpi: 'KPI 表現', machines: '機台事件', process: '製程事件', production: '產線事件', cases: 'Case Center', pending: '交辦事項' };
              return (
                <div key={section}>
                  <div style={{ fontSize: fz(11), fontWeight: 600, color: C.textMuted, marginBottom: 4 }}>{sectionLabel[section] || section}</div>
                  <div style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.6 }}>{note}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {Object.keys(record.notes || {}).length === 0 && (
        <div style={{ fontSize: fz(12), color: C.textMuted, textAlign: 'center', padding: '8px 0' }}>本次交班無補充說明。</div>
      )}
    </div>
  );
}

/* 歷史記錄頁 */
function HandoverHistoryView({ p}) {
  var { C, fz } = useTheme();
  const records  = HANDOVER_HISTORY[p.key] || [];
  const [search, setSearch]       = React.useState('');
  const [shiftF, setShiftF]       = React.useState('全部');
  const [selectedId, setSelectedId] = React.useState(records[0]?.id || null);

  const SHIFTS = ['全部', '日班', '小夜班', '大夜班'];
  const shiftColor = { '日班': '#2563EB', '小夜班': '#7C3AED', '大夜班': '#0F766E' };
  const shiftBg    = { '日班': '#EFF6FF', '小夜班': '#F5F3FF', '大夜班': '#F0FDFA' };

  const filtered = records.filter(r => {
    const matchShift = shiftF === '全部' || r.from === shiftF;
    const q = search.trim();
    const matchSearch = !q || r.headlines.some(h => h.includes(q)) || r.author.includes(q) || r.from.includes(q) || r.to.includes(q);
    return matchShift && matchSearch;
  });

  // Group by date label
  const TODAY = '2026-04-19', YESTERDAY = '2026-04-18';
  const dateLabel = d => d === TODAY ? '今天' : d === YESTERDAY ? '昨天' : d;
  const grouped = [];
  const seenDates = {};
  filtered.forEach(r => {
    const lbl = dateLabel(r.date);
    if (!seenDates[lbl]) { seenDates[lbl] = true; grouped.push({ label: lbl, items: [] }); }
    grouped[grouped.length - 1].items.push(r);
  });

  const selected = records.find(r => r.id === selectedId);

  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>

      {/* ── Left: search + filter + timeline ── */}
      <div style={{ width: 312, borderRight: '1px solid ' + C.border, display: 'flex', flexDirection: 'column', flexShrink: 0, background: C.bgSub }}>
        {/* Search */}
        <div style={{ padding: 16, borderBottom: '1px solid ' + C.border, display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="搜尋關鍵字、發起人…"
            style={{ width: '100%', padding: '6px 10px', borderRadius: 6, border: '1px solid ' + C.border, fontSize: fz(12), outline: 'none', color: C.textSub, background: C.bg, boxSizing: 'border-box' }}
          />
          {/* Shift filter chips */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {SHIFTS.map(s => {
              const active = shiftF === s;
              return (
                <button key={s} onClick={() => setShiftF(s)}
                  style={{
                    padding: '3px 10px', borderRadius: 999, fontSize: fz(11), fontWeight: active ? 700 : 400, cursor: 'pointer',
                    border: active ? 'none' : '1px solid ' + C.border,
                    background: active ? (shiftColor[s] || '#2563EB') : '#FFFFFF',
                    color: active ? '#FFFFFF' : '#6B7280',
                  }}
                >{s}</button>
              );
            })}
          </div>
          <div style={{ fontSize: fz(11), color: C.textMuted }}>共 {filtered.length} 筆記錄</div>
        </div>

        {/* Timeline */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }} className="scrollbar-thin">
          {grouped.length === 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: C.textMuted, fontSize: fz(13) }}>無符合條件的記錄</div>
          )}
          {grouped.map(g => (
            <div key={g.label}>
              <div style={{ fontSize: fz(10), fontWeight: 700, color: C.textMuted, padding: '8px 16px 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{g.label}</div>
              {g.items.map(r => {
                const isActive = selectedId === r.id;
                return (
                  <div key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    style={{
                      padding: '10px 16px', cursor: 'pointer',
                      background: isActive ? '#FFFFFF' : 'transparent',
                      borderLeft: isActive ? '3px solid #2563EB' : '3px solid transparent',
                      borderBottom: '1px solid #F3F4F6',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#F3F4F6'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {/* Shift + time row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: fz(11), fontWeight: 700, padding: '1px 7px', borderRadius: 999, background: shiftBg[r.from], color: shiftColor[r.from] }}>{r.from}</span>
                      <span style={{ fontSize: fz(10), color: '#D1D5DB' }}>→</span>
                      <span style={{ fontSize: fz(11), fontWeight: 600, color: shiftColor[r.to] || '#374151' }}>{r.to}</span>
                      <span style={{ marginLeft: 'auto', fontSize: fz(11), color: C.textMuted }}>{r.time}</span>
                    </div>
                    {/* Author */}
                    <div style={{ fontSize: fz(11), color: C.textMuted, marginBottom: 6 }}>{r.author}</div>
                    {/* First headline */}
                    <div style={{ fontSize: fz(12), color: C.textSub, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {r.headlines[0]}
                    </div>
                    {/* Stats chips */}
                    {(r.stats.openCases > 0 || r.stats.p1 > 0) && (
                      <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                        {r.stats.openCases > 0 && <span style={{ fontSize: fz(10), padding: '1px 6px', borderRadius: 999, background: '#FEE2E2', color: '#B91C1C', fontWeight: 700 }}>未結 {r.stats.openCases} Case</span>}
                        {r.stats.p1 > 0 && <span style={{ fontSize: fz(10), padding: '1px 6px', borderRadius: 999, background: 'rgba(245,158,11,0.15)', color: '#92400E', fontWeight: 700 }}>P1 ×{r.stats.p1}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: detail ── */}
      <div style={{ flex: 1, overflowY: 'auto', background: C.bg }} className="scrollbar-thin">
        {selected
          ? <HandoverRecordDetail record={selected} />
          : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: C.textMuted, fontSize: fz(14) }}>
              選擇左側記錄查看詳情
            </div>
          )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   HandoverPage
   ───────────────────────────────────────── */
function HandoverPage({ p, onHandoverSubmit}) {
  var { C, fz } = useTheme();
  const currentShift = p.currentShift || '日班';
  const nextShift    = HO_NEXT_SHIFT[currentShift] || '下一班';
  const data         = HANDOVER_DATA[p.key] || {};
  const [tab, setTab] = React.useState('current'); // 'current' | 'history'

  // sections config per persona
  const SECTIONS = React.useMemo(() => {
    const base = [
      { id: 'kpi',     title: 'KPI 今日表現',         badge: 'AI 彙整' },
    ];
    if (p.key === 'equipment') {
      base.push({ id: 'machines', title: '機台事件（AVL / PM / Down Tool）', badge: 'AI 彙整' });
    } else if (p.key === 'process') {
      base.push({ id: 'process',  title: '製程事件（OOC / Hold Lot / 特殊 Lot）', badge: 'AI 彙整' });
    } else if (p.key === 'mfg') {
      base.push({ id: 'production', title: '產線事件', badge: 'AI 彙整' });
    }
    base.push({ id: 'cases',   title: 'Case Center 重點 Case',     badge: 'AI 彙整' });
    base.push({ id: 'pending', title: '當班交辦事項',               badge: 'AI 彙整' });
    return base;
  }, [p.key]);

  const [status,    setStatus]    = React.useState('idle');   // idle | generating | ready | submitted
  const [confirmed, setConfirmed] = React.useState({});
  const [notes,     setNotes]     = React.useState({});
  const [submittedAt, setSubmittedAt] = React.useState(null);

  const confirmedCount = SECTIONS.filter(s => confirmed[s.id]).length;
  const allConfirmed   = confirmedCount === SECTIONS.length;

  const handleConfirm = id => setConfirmed(prev => ({ ...prev, [id]: !prev[id] }));
  const handleNote    = (id, val) => setNotes(prev => ({ ...prev, [id]: val }));

  const handleGenerate = () => {
    setStatus('generating');
    setConfirmed({});
    setNotes({});
    setTimeout(() => setStatus('ready'), 1500);
  };

  const handleSubmit = () => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
    setSubmittedAt(timeStr);
    setStatus('submitted');
    if (onHandoverSubmit) {
      const headlines = (HANDOVER_DATA[p.key]?.machineEvents || HANDOVER_DATA[p.key]?.oocEvents || HANDOVER_DATA[p.key]?.productionEvents || [])
        .map(ev => ev.summary || ev.detail?.slice(0, 40) || '').filter(Boolean).slice(0, 2);
      onHandoverSubmit({
        id: 'handover-' + Date.now(),
        author: p.user.name, av: p.user.avatar, avColor: p.accentColor,
        role: 'all', pinned: true, isRead: false, type: 'handover',
        title: `[交班記錄] ${currentShift} → ${nextShift}，今天 ${timeStr}`,
        content: `本班 ${p.name} 交班記錄已完成確認。\n摘要：${headlines.join('；') || '本班課況正常，無異常事項。'}`,
        time: `今天 ${timeStr}`,
        readCount: 1,
        totalCount: p.members ? p.members.length : 5,
      });
    }
  };

  const now = new Date();
  const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2,'0')}-${now.getDate().toString().padStart(2,'0')}`;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Tab Bar */}
      <div style={{ padding: '0 24px', borderBottom: '1px solid ' + C.border, background: C.bg, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 16, height: 40 }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, background: '#F3F4F6', borderRadius: 999, padding: 3 }}>
          {[['current', `本班交班 ${currentShift} → ${nextShift}`], ['history', '歷史記錄']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              style={{
                padding: '4px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
                fontSize: fz(12), fontWeight: tab === key ? 700 : 400,
                background: tab === key ? '#2563EB' : 'transparent',
                color: tab === key ? '#FFFFFF' : '#6B7280',
                transition: 'all 0.15s',
              }}>{label}</button>
          ))}
        </div>
        {status === 'ready' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 16 }}>
              <div style={{ height: 6, width: 120, background: '#F3F4F6', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${(confirmedCount / SECTIONS.length) * 100}%`, background: '#22C55E', borderRadius: 999, transition: 'width 0.3s' }} />
              </div>
              <span style={{ fontSize: fz(12), color: C.textMuted, fontWeight: 600 }}>{confirmedCount} / {SECTIONS.length} 區塊已確認</span>
            </div>
            <button onClick={handleSubmit} disabled={!allConfirmed}
              style={{ marginLeft: 'auto', padding: '6px 20px', borderRadius: 6, border: 'none', background: allConfirmed ? '#2563EB' : '#D1D5DB', color: '#FFFFFF', fontSize: fz(13), fontWeight: 600, cursor: allConfirmed ? 'pointer' : 'not-allowed' }}
              onMouseEnter={e => { if (allConfirmed) e.currentTarget.style.background = '#1D4ED8'; }}
              onMouseLeave={e => { if (allConfirmed) e.currentTarget.style.background = '#2563EB'; }}>
              ✓ 送出交班記錄
            </button>
          </>
        )}
        {status === 'submitted' && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '4px 16px', borderRadius: 6, background: 'rgba(34,197,94,0.08)', border: '1px solid #22C55E' }}>
            <span style={{ fontSize: fz(12), fontWeight: 700, color: '#166534' }}>✓ 交班記錄已送出 · {submittedAt}</span>
          </div>
        )}
      </div>

      {/* Content */}
      {tab === 'history' && <HandoverHistoryView p={p} />}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: tab === 'current' ? 'flex' : 'none', flexDirection: 'column', gap: 16 }} className="scrollbar-thin">

        {/* Idle state */}
        {status === 'idle' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 8, padding: '40px 48px', textAlign: 'center', maxWidth: 480 }}>
              <div style={{ fontSize: fz(32), marginBottom: 16 }}>📋</div>
              <div style={{ fontSize: fz(16), fontWeight: 700, color: C.text, marginBottom: 8 }}>準備 {currentShift} → {nextShift} 交班報告</div>
              <div style={{ fontSize: fz(13), color: C.textMuted, lineHeight: 1.6, marginBottom: 24 }}>
                AI 將自動彙整本班的 KPI 表現、機台/製程事件、Case Center 重點 Case 與未結交辦事項，產生可供本班與下一班共同確認的交班底稿。
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', fontSize: fz(12), color: C.textMuted, marginBottom: 24 }}>
                <span>📊 KPI 彙整</span>
                {p.key === 'equipment' && <span>🖥️ 機台事件</span>}
                {p.key === 'process'   && <span>⚗️ 製程事件</span>}
                {p.key === 'mfg'       && <span>🏭 產線事件</span>}
                <span>📋 Case Center</span>
                <span>📌 交辦事項</span>
              </div>
              <button onClick={handleGenerate}
                style={{ padding: '10px 32px', borderRadius: 6, border: 'none', background: '#2563EB', color: '#FFFFFF', fontSize: fz(14), fontWeight: 600, cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#1D4ED8'}
                onMouseLeave={e => e.currentTarget.style.background = '#2563EB'}>
                開始準備交班報告
              </button>
            </div>
          </div>
        )}

        {/* Generating */}
        {status === 'generating' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div className="spin" style={{ width: 40, height: 40, border: '4px solid ' + C.border, borderTopColor: '#2563EB', borderRadius: '50%' }} />
            <div style={{ fontSize: fz(14), fontWeight: 600, color: C.text }}>AI 正在彙整本班課況…</div>
            <div style={{ fontSize: fz(12), color: C.textMuted }}>正在讀取 KPI · 機台事件 · Case Center · 交辦事項</div>
          </div>
        )}

        {/* Report ready */}
        {(status === 'ready' || status === 'submitted') && (
          <>
            {status === 'submitted' && (
              <div className="fade-in" style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(34,197,94,0.06)', border: '1px solid #22C55E', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: fz(13), fontWeight: 600, color: '#166534' }}>✓ 交班記錄已存檔</span>
                <span style={{ fontSize: fz(12), color: C.textMuted }}>· {currentShift} → {nextShift} · {dateStr} {submittedAt} · 由 {p.user.name} 發起</span>
                <button onClick={() => { setStatus('idle'); setConfirmed({}); setNotes({}); }}
                  style={{ marginLeft: 'auto', fontSize: fz(11), color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>重新發起</button>
              </div>
            )}

            {/* KPI section */}
            <SectionCard sectionId="kpi" title="KPI 今日表現" badge="AI 彙整"
              confirmed={!!confirmed['kpi']} onConfirm={handleConfirm}
              note={notes['kpi']} onNoteChange={handleNote}>
              <KPISection p={p} />
            </SectionCard>

            {/* EE: 機台事件 */}
            {p.key === 'equipment' && (
              <SectionCard sectionId="machines" title="機台事件（AVL / PM / Down Tool）" badge="AI 彙整"
                confirmed={!!confirmed['machines']} onConfirm={handleConfirm}
                note={notes['machines']} onNoteChange={handleNote}>
                <MachineEventsSection data={data} />
              </SectionCard>
            )}

            {/* PE: 製程事件 */}
            {p.key === 'process' && (
              <SectionCard sectionId="process" title="製程事件（OOC / Hold Lot / 特殊 Lot）" badge="AI 彙整"
                confirmed={!!confirmed['process']} onConfirm={handleConfirm}
                note={notes['process']} onNoteChange={handleNote}>
                <ProcessEventsSection data={data} />
              </SectionCard>
            )}

            {/* MFG: 產線事件 */}
            {p.key === 'mfg' && (
              <SectionCard sectionId="production" title="產線事件" badge="AI 彙整"
                confirmed={!!confirmed['production']} onConfirm={handleConfirm}
                note={notes['production']} onNoteChange={handleNote}>
                <ProductionEventsSection data={data} />
              </SectionCard>
            )}

            {/* Cases: all roles */}
            <SectionCard sectionId="cases" title="Case Center 重點 Case" badge="AI 彙整"
              confirmed={!!confirmed['cases']} onConfirm={handleConfirm}
              note={notes['cases']} onNoteChange={handleNote}>
              <CasesSection cases={data.cases || []} />
            </SectionCard>

            {/* Pending: all roles */}
            <SectionCard sectionId="pending" title="當班交辦事項"
              confirmed={!!confirmed['pending']} onConfirm={handleConfirm}
              note={notes['pending']} onNoteChange={handleNote}>
              <PendingSection p={p} />
            </SectionCard>

            {/* Footer submit reminder */}
            {status === 'ready' && !allConfirmed && (
              <div style={{ padding: '12px 16px', borderRadius: 8, background: '#F9FAFB', border: '1px solid ' + C.border, fontSize: fz(12), color: C.textMuted, textAlign: 'center' }}>
                請確認全部 {SECTIONS.length} 個區塊後，即可送出交班記錄。目前已確認 {confirmedCount} / {SECTIONS.length}。
              </div>
            )}
            {status === 'ready' && allConfirmed && (
              <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(37,99,235,0.04)', border: '1px solid #2563EB', fontSize: fz(12), color: '#2563EB', fontWeight: 600, textAlign: 'center' }}>
                全部區塊已確認，請點擊右上角「送出交班記錄」完成交班。
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
