/* ════════════════════════════════════════
   SCHEDULING DATA
   ════════════════════════════════════════ */

const SCHEDULING_DATA = {

  /* ── ETC 設備課 ── */
  equipment: [
    {
      id: 'sch-eq-001',
      name: 'SPC 異常日報',
      skill: 'spc-daily-report',
      skillId: 'sm-eq-008',      /* 對應 personas.js 的 Codify（含寫入）*/
      hasWrite: true,
      confirmSteps: 2,           /* 執行到這幾步會暫停等人確認 */
      cronLabel: '每日 07:50',
      createdBy: '陳育民',
      status: 'pending',
      lastRun: '今日 07:50',
      runs: [
        {
          id: 'run-eq-001-1',
          dateLabel: '今日 07:50',
          result: 'pending',
          duration: '47s（暫停中）',
          totalSteps: 4,
          doneSteps: 2,
          handler: { name: '王志明', avatar: '王', color: '#2563EB' },
          steps: [
            { num: 1, title: '查詢今日 SPC 資料', status: 'done', result: '共取得 12 筆資料' },
            { num: 2, title: '篩選 OOC 異常項目', status: 'done', result: 'E-308 × 3 筆、E-201 × 1 筆' },
            {
              num: 3, title: '開立異常工單', status: 'waiting', result: '等待確認',
              mcpTool: 'case_center.create_case',
              detail: { machine: 'E-308', recipe: 'CMP-Standard', priority: 'P2', desc: '今日 07:00–07:50 發生 3 次 Standard Deviation 超標，建議 EE 確認 Chamber A 氣體流量是否異常' },
            },
            { num: 4, title: '發送通知給值班 EE', status: 'pending', result: '待執行' },
          ],
        },
        {
          id: 'run-eq-001-2',
          dateLabel: '04/20 07:50',
          result: 'success',
          duration: '1m 12s',
          totalSteps: 4,
          doneSteps: 4,
          steps: [
            { num: 1, title: '查詢今日 SPC 資料', status: 'done', result: '共取得 9 筆資料' },
            { num: 2, title: '篩選 OOC 異常項目', status: 'done', result: '無異常' },
            { num: 3, title: '開立異常工單', status: 'done', result: '跳過（無符合條件）' },
            { num: 4, title: '發送通知給值班 EE', status: 'done', result: '已送出「今日 SPC 正常，無異常開單」' },
          ],
        },
        {
          id: 'run-eq-001-3',
          dateLabel: '04/19 07:50',
          result: 'success',
          duration: '8m 31s（含等待）',
          totalSteps: 4,
          doneSteps: 4,
          steps: [
            { num: 1, title: '查詢今日 SPC 資料', status: 'done', result: '共取得 14 筆資料' },
            { num: 2, title: '篩選 OOC 項目', status: 'done', result: 'E-308 × 2',
              decisionBy: { name: '吳志豪', avatar: '吳', color: '#2563EB', action: '確認執行', time: '08:04' } },
            { num: 3, title: '開立工單 E-308 × 1', status: 'done', result: '已開立',
              decisionBy: { name: '張文凱', avatar: '張', color: '#16A34A', action: '確認執行', time: '08:09' } },
            { num: 4, title: '發送通知給值班 EE', status: 'done', result: '已送出' },
          ],
        },
        {
          id: 'run-eq-001-4',
          dateLabel: '04/17 07:50',
          result: 'discuss',
          duration: '2m 18s（含等待）',
          totalSteps: 4,
          doneSteps: 1,
          handler: { name: '陳育民', avatar: '陳', color: '#7C3AED', action: '延伸討論', time: '08:12' },
          steps: [
            { num: 1, title: '查詢今日 SPC 資料', status: 'done', result: '共取得 11 筆資料' },
            { num: 2, title: '篩選 OOC 項目', status: 'discuss', result: 'E-201 × 5（異常高，決策點）',
              decisionBy: { name: '陳育民', avatar: '陳', color: '#7C3AED', action: '延伸討論', time: '08:12' } },
            { num: 3, title: '開立異常工單', status: 'skip', result: '未執行（由 AI Chat 延伸處理）' },
            { num: 4, title: '發送通知給值班 EE', status: 'skip', result: '未執行' },
          ],
        },
        {
          id: 'run-eq-001-5',
          dateLabel: '04/16 07:50',
          result: 'rejected',
          duration: '5m 21s（含等待）',
          totalSteps: 4,
          doneSteps: 2,
          handler: { name: '陳育民', avatar: '陳', color: '#2563EB', action: '拒絕執行', time: '09:11', note: '資料有誤，改手動處理' },
          steps: [
            { num: 1, title: '查詢今日 SPC 資料', status: 'done', result: '共取得 8 筆資料' },
            { num: 2, title: '篩選 OOC 項目', status: 'done', result: 'E-308 × 1' },
            { num: 3, title: '開立異常工單', status: 'rejected', result: '拒絕執行，排程終止',
              decisionBy: { name: '陳育民', avatar: '陳', color: '#2563EB', action: '拒絕執行', time: '09:11', note: '資料有誤，改手動處理' } },
            { num: 4, title: '發送通知給值班 EE', status: 'skip', result: '未執行' },
          ],
        },
      ],
    },
    /* ── 交接報告：交班已不是一個模組，而是這個唯讀 Codify 的排程產出 ──
       執行紀錄要看得到「產出物本身」，不能只有步驟；
       同一份產出同時送到 Home 課佈告欄（今天這份）與這裡（檔案櫃）。
       見 brain/entities/modules/handover.md */
    {
      id: 'sch-eq-004',
      name: '當班交接報告',
      skill: 'shift-handover-report',
      skillId: 'sm-eq-007',
      hasWrite: false,
      confirmSteps: 0,
      producesHandover: true,
      cronLabel: '每日 15:30 / 23:30 / 07:30',
      createdBy: '王志明',
      status: 'ok',
      lastRun: '今日 15:30',
      runs: [
        {
          id: 'run-eq-004-1',
          dateLabel: '今日 15:30',
          result: 'success',
          duration: '38s',
          totalSteps: 5,
          doneSteps: 5,
          steps: [
            { num: 1, title: '取當班機台稼動資料',       status: 'done', result: '16 台，總運轉 340.8 h' },
            { num: 2, title: '取同時段警報並分級',       status: 'done', result: '原始 27 筆 → 分級去重後 5 件' },
            { num: 3, title: '計算稼動率與異常密度',     status: 'done', result: '稼動率 94.2%、異常密度 0.63 件/台/班' },
            { num: 4, title: '取未結案 Case 與待辦事項', status: 'done', result: '7 件（逾期 1 件）' },
            { num: 5, title: '套用交接報告格式',         status: 'done', result: '已產出，同步送至課佈告欄' },
          ],
          output: {
            title: 'ETC 設備課 · 日班交接報告',
            shiftLabel: '日班 08:00 – 16:00',
            generatedAt: '今日 15:30',
            metrics: [
              { label: '機台稼動率', value: '94.2', unit: '%',  note: '目標 95%，未達標' },
              { label: '本班異常',   value: '5',    unit: '件', note: 'P1 ×2 / P2 ×3' },
              { label: '未結案 Case', value: '7',   unit: '件', note: '逾期 1 件' },
            ],
            situation: '【KPI 未達標】設備稼動率 94.2%（目標 95%）、Unclose Case 7 件（目標 ≤5）。\n【本班異常】E-308 FDC 異常持續監控中（已 3 小時）、E-502 CVD 溫控警報已排除。\n【Must-be-zero】Critical Escape 1 件尚未歸零。',
            pending: '• E-308 FDC 異常持續監控中，小夜班請每小時確認電流波動是否收斂。\n• Critical Escape（1）尚未歸零，小夜班請持續追蹤。\n• E-203 預防性保養今日 16:00 開始，備料已確認，需完成工前確認。\n• Unclose Case #UC-442 逾期 5 天，影響課 KPI，請優先處理。',
          },
        },
        {
          id: 'run-eq-004-2',
          dateLabel: '今日 07:30',
          result: 'success',
          duration: '35s',
          totalSteps: 5,
          doneSteps: 5,
          steps: [
            { num: 1, title: '取當班機台稼動資料',       status: 'done', result: '16 台，總運轉 352.1 h' },
            { num: 2, title: '取同時段警報並分級',       status: 'done', result: '原始 14 筆 → 分級去重後 2 件' },
            { num: 3, title: '計算稼動率與異常密度',     status: 'done', result: '稼動率 96.1%、異常密度 0.25 件/台/班' },
            { num: 4, title: '取未結案 Case 與待辦事項', status: 'done', result: '6 件' },
            { num: 5, title: '套用交接報告格式',         status: 'done', result: '已產出，同步送至課佈告欄' },
          ],
          output: {
            title: 'ETC 設備課 · 大夜班交接報告',
            shiftLabel: '大夜班 00:00 – 08:00',
            generatedAt: '今日 07:30',
            metrics: [
              { label: '機台稼動率', value: '96.1', unit: '%',  note: '達標' },
              { label: '本班異常',   value: '2',    unit: '件', note: 'P2 ×2' },
              { label: '未結案 Case', value: '6',   unit: '件', note: '' },
            ],
            situation: '【KPI】各項達標，設備稼動率 96.1%。\n【本班異常】E-308 於 03:12 跳 ERR-4421，已依研判建議執行冷卻水路疏通，05:40 恢復正常。',
            pending: '• E-308 恢復後需觀察一個班次，日班請確認水壓是否維持在 0.15 MPa 以上。\n• Unclose Case #UC-442 仍未結案。',
          },
        },
        {
          id: 'run-eq-004-3',
          dateLabel: '昨日 23:30',
          result: 'error',
          duration: '12s',
          totalSteps: 5,
          doneSteps: 1,
          errorMsg: 'eqp.get_uptime timeout（設備監控系統維護中）',
          steps: [
            { num: 1, title: '取當班機台稼動資料',       status: 'error', result: '設備監控系統無回應' },
            { num: 2, title: '取同時段警報並分級',       status: 'skip',  result: '未執行' },
            { num: 3, title: '計算稼動率與異常密度',     status: 'skip',  result: '未執行' },
            { num: 4, title: '取未結案 Case 與待辦事項', status: 'skip',  result: '未執行' },
            { num: 5, title: '套用交接報告格式',         status: 'skip',  result: '未執行' },
          ],
        },
      ],
    },
    {
      id: 'sch-eq-002',
      name: 'FDC 異常摘要',
      skill: 'fdc-daily-summary',
      cronLabel: '每日 08:00',
      createdBy: '王志明',
      status: 'ok',
      lastRun: '今日 08:01',
      runs: [
        {
          id: 'run-eq-002-1',
          dateLabel: '今日 08:00',
          result: 'success',
          duration: '1m 05s',
          totalSteps: 3,
          doneSteps: 3,
          steps: [
            { num: 1, title: '查詢今日 FDC 異常事件', status: 'done', result: '共 5 筆 Level-2 異常' },
            { num: 2, title: '彙整異常摘要', status: 'done', result: 'E-308 × 3、E-201 × 2' },
            { num: 3, title: '發佈至 Dashboard 公告欄', status: 'done', result: '已發佈（08:01）' },
          ],
        },
        {
          id: 'run-eq-002-2',
          dateLabel: '04/20 08:00',
          result: 'success',
          duration: '58s',
          totalSteps: 3,
          doneSteps: 3,
          steps: [
            { num: 1, title: '查詢今日 FDC 異常事件', status: 'done', result: '共 2 筆 Level-1 異常' },
            { num: 2, title: '彙整異常摘要', status: 'done', result: 'E-101 × 2' },
            { num: 3, title: '發佈至 Dashboard 公告欄', status: 'done', result: '已發佈（08:01）' },
          ],
        },
      ],
    },
    {
      id: 'sch-eq-003',
      name: 'PM 到期提醒',
      skill: 'pm-reminder',
      cronLabel: '每日 07:00',
      createdBy: '吳志豪',
      status: 'ok',
      lastRun: '今日 07:01',
      runs: [
        {
          id: 'run-eq-003-1',
          dateLabel: '今日 07:00',
          result: 'success',
          duration: '32s',
          totalSteps: 2,
          doneSteps: 2,
          steps: [
            { num: 1, title: '查詢本週 PM 排程', status: 'done', result: 'E-203 今日 16:00、E-101 明日 09:00' },
            { num: 2, title: '推送提醒至 Priority Feed', status: 'done', result: '已推送 2 筆提醒' },
          ],
        },
      ],
    },
  ],

  /* ── ETC 製程課 ── */
  process: [
    {
      id: 'sch-pr-001',
      name: 'OOC 異常日報',
      skill: 'ooc-daily-report',
      cronLabel: '每日 08:00',
      createdBy: '鄭志明',
      status: 'ok',
      lastRun: '今日 08:02',
      runs: [
        {
          id: 'run-pr-001-1',
          dateLabel: '今日 08:00',
          result: 'success',
          duration: '1m 22s',
          totalSteps: 3,
          doneSteps: 3,
          steps: [
            { num: 1, title: '查詢今日 SPC OOC 資料', status: 'done', result: '2 站失控（HV-03、LV-01）' },
            { num: 2, title: '生成異常摘要', status: 'done', result: '已彙整根因分析建議' },
            { num: 3, title: '推送至值班 PE Priority Feed', status: 'done', result: '已推送' },
          ],
        },
        {
          id: 'run-pr-001-2',
          dateLabel: '04/20 08:00',
          result: 'success',
          duration: '48s',
          totalSteps: 3,
          doneSteps: 3,
          steps: [
            { num: 1, title: '查詢今日 SPC OOC 資料', status: 'done', result: '無失控' },
            { num: 2, title: '生成異常摘要', status: 'done', result: '正常（略過推送）' },
            { num: 3, title: '推送至值班 PE Priority Feed', status: 'done', result: '跳過' },
          ],
        },
      ],
    },
    {
      id: 'sch-pr-002',
      name: 'Recipe 品質週報',
      skill: 'recipe-quality-weekly',
      cronLabel: '每週一 09:00',
      createdBy: '李佳穎',
      status: 'error',
      lastRun: '04/14 09:00',
      runs: [
        {
          id: 'run-pr-002-1',
          dateLabel: '04/14 09:00',
          result: 'error',
          duration: '2m 05s',
          totalSteps: 4,
          doneSteps: 1,
          errorMsg: 'MCP 錯誤：spc_system.get_recipe_stats 連線逾時（timeout 30s）',
          steps: [
            { num: 1, title: '查詢 Active Recipe 清單', status: 'done', result: '共 12 個 Active Recipe' },
            { num: 2, title: '取得各 Recipe 本週 SPC 數據', status: 'error', result: 'MCP tool 連線逾時（spc_system.get_recipe_stats）' },
            { num: 3, title: '生成品質週報', status: 'skip', result: '未執行' },
            { num: 4, title: '發送週報至 Section Admin', status: 'skip', result: '未執行' },
          ],
        },
        {
          id: 'run-pr-002-2',
          dateLabel: '04/07 09:00',
          result: 'success',
          duration: '3m 14s',
          totalSteps: 4,
          doneSteps: 4,
          steps: [
            { num: 1, title: '查詢 Active Recipe 清單', status: 'done', result: '共 12 個 Active Recipe' },
            { num: 2, title: '取得各 Recipe 本週 SPC 數據', status: 'done', result: '所有 Recipe 數據取得完成' },
            { num: 3, title: '生成品質週報', status: 'done', result: '週報草稿已生成' },
            { num: 4, title: '發送週報至 Section Admin', status: 'done', result: '已發送至 李佳穎' },
          ],
        },
      ],
    },
  ],

  /* ── 製造課 ── */
  mfg: [
    {
      id: 'sch-mf-001',
      name: '產能落後預警',
      skill: 'capacity-alert',
      cronLabel: '每小時整點',
      createdBy: '陳建宏',
      status: 'pending',
      lastRun: '今日 11:00',
      runs: [
        {
          id: 'run-mf-001-1',
          dateLabel: '今日 11:00',
          result: 'pending',
          duration: '28s（暫停中）',
          totalSteps: 3,
          doneSteps: 2,
          handler: null,
          steps: [
            { num: 1, title: '查詢各 Line 即時產出數據', status: 'done', result: 'Line 1: 正常、Line 2: 正常、Line 3: 落後 8%' },
            { num: 2, title: '評估落後程度與風險', status: 'done', result: 'Line 3 落後超過 5% 閾值，觸發預警條件' },
            {
              num: 3, title: '建立緊急應變工單', status: 'waiting', result: '等待確認',
              mcpTool: 'mes.create_urgent_order',
              detail: { target: 'Line 3', issue: '產出落後 8%（閾值 5%）', action: '建立 P1 緊急工單並通知班組長' },
            },
          ],
        },
        {
          id: 'run-mf-001-2',
          dateLabel: '今日 10:00',
          result: 'success',
          duration: '22s',
          totalSteps: 3,
          doneSteps: 3,
          steps: [
            { num: 1, title: '查詢各 Line 即時產出數據', status: 'done', result: '三線均正常' },
            { num: 2, title: '評估落後程度與風險', status: 'done', result: '未達預警閾值（5%）' },
            { num: 3, title: '建立緊急應變工單', status: 'done', result: '跳過（無需處理）' },
          ],
        },
        {
          id: 'run-mf-001-3',
          dateLabel: '今日 09:00',
          result: 'success',
          duration: '31s',
          totalSteps: 3,
          doneSteps: 3,
          steps: [
            { num: 1, title: '查詢各 Line 即時產出數據', status: 'done', result: '三線均正常' },
            { num: 2, title: '評估落後程度', status: 'done', result: '未達預警閾值' },
            { num: 3, title: '建立緊急應變工單', status: 'done', result: '跳過' },
          ],
        },
      ],
    },
    {
      id: 'sch-mf-002',
      name: '生產日報自動彙整',
      skill: 'daily-report-gen',
      cronLabel: '每日 07:30',
      createdBy: '林組長',
      status: 'ok',
      lastRun: '今日 07:31',
      runs: [
        {
          id: 'run-mf-002-1',
          dateLabel: '今日 07:30',
          result: 'success',
          duration: '2m 10s',
          totalSteps: 4,
          doneSteps: 4,
          steps: [
            { num: 1, title: '取得昨日各線產出數據', status: 'done', result: 'Line 1: 98%、Line 2: 102%、Line 3: 87%' },
            { num: 2, title: '彙整停機事件紀錄', status: 'done', result: 'E-101 停機 2.5h（Line 3）' },
            { num: 3, title: '生成日報草稿', status: 'done', result: '草稿已生成（含風險預告）' },
            { num: 4, title: '推送至陳建宏 Priority Feed', status: 'done', result: '已推送（07:31）' },
          ],
        },
        {
          id: 'run-mf-002-2',
          dateLabel: '04/20 07:30',
          result: 'success',
          duration: '1m 55s',
          totalSteps: 4,
          doneSteps: 4,
          steps: [
            { num: 1, title: '取得昨日各線產出數據', status: 'done', result: '三線均達標' },
            { num: 2, title: '彙整停機事件紀錄', status: 'done', result: '無停機事件' },
            { num: 3, title: '生成日報草稿', status: 'done', result: '草稿已生成' },
            { num: 4, title: '推送至陳建宏 Priority Feed', status: 'done', result: '已推送' },
          ],
        },
      ],
    },
  ],
};

/* 取某課最近一次成功產出的交接報告（Home 課佈告欄與交班 Modal 預填共用同一份）*/
function getLatestHandoverReport(personaKey) {
  var list = (SCHEDULING_DATA && SCHEDULING_DATA[personaKey]) || [];
  var report = null;
  list.forEach(function(item) {
    if (!item.producesHandover) return;
    (item.runs || []).forEach(function(run) {
      if (run.result !== 'success' || !run.output) return;
      if (!report) report = { scheduleId: item.id, scheduleName: item.name, runId: run.id, dateLabel: run.dateLabel, output: run.output };
    });
  });
  return report;
}
