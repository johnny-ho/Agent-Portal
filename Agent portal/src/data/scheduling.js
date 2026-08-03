/* ════════════════════════════════════════
   SCHEDULING DATA

   2026-08-01 決議（介入機制改寫）：
   1. 取消「我來處理」認領步驟 —— 介入畫面直接把選項攤開，一次點擊完成決定。
   2. 取消「延伸討論」—— 排程頁不再有任何 AI 對話出口。
   3. 選項三個：確認執行 / 略過此步驟 / 拒絕執行（拒絕即終止整次執行）。
   4. 全課成員（Seed + member）皆可決定，不指定人、不需認領。
   5. 先送出的決定即定案，不可變更、不可撤回 —— B 推翻不了 A。
   6. 決策點持續等待直到有人決定（逾時升級與自動終止後期再補）。

   資料模型：
   - run.interventions[] 是唯一的介入稽核序列，取代舊的 handler / steps[].decisionBy。
   - 步驟的最終狀態不寫死在資料裡，而是由 interventions 推導（見 getRunView）。
   ════════════════════════════════════════ */

/* ── 失敗分類 ──
   「一行錯誤訊息」查不出東西：要看得出卡在哪一步、哪個工具、是哪一種失敗、能不能重跑。 */
const SCH_FAILURE_KIND_CFG = {
  timeout:    { label: '連線逾時',   hint: '對方系統沒有在時限內回應，通常是對方維護或負載過高。' },
  permission: { label: '權限不足',   hint: '工具呼叫被拒絕，需要確認該 Codify 的工具授權。' },
  data:       { label: '資料缺漏',   hint: '來源資料不存在或欄位對不上，重跑不會自己好。' },
  unknown:    { label: '未知錯誤',   hint: '未分類的失敗，需要看原始訊息判斷。' },
};

/* ── 執行結果篩選 ──
   「只看異常」要一鍵切得到；「有人介入」是稽核視角，查得到哪幾次是人做的決定。 */
const SCH_RUN_FILTERS = [
  { key: 'all',      label: '全部'     },
  { key: 'error',    label: '執行失敗' },
  { key: 'pending',  label: '待決定'   },
  { key: 'human',    label: '有人介入' },
];

/* ── 介入選項 ──
   拒絕必填原因（流程被中止，沒有理由後面沒人查得出為什麼）；略過選填。 */
const SCH_DECISION_CFG = {
  confirm: {
    key: 'confirm', label: '確認執行', pastLabel: '確認執行',
    color: '#16A34A', bg: 'rgba(34,197,94,0.1)', icon: '✓',
    reasonRequired: false,
    desc: 'AI 會呼叫該步驟的工具，並繼續往下執行。',
  },
  skip: {
    key: 'skip', label: '略過此步驟', pastLabel: '略過此步驟',
    color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: '⏭',
    reasonRequired: false,
    desc: '不呼叫該步驟的工具，直接跳到下一步繼續執行。',
  },
  reject: {
    key: 'reject', label: '拒絕執行', pastLabel: '拒絕執行',
    color: '#DC2626', bg: 'rgba(239,68,68,0.1)', icon: '✕',
    reasonRequired: true,
    desc: '本次執行就此終止，後續步驟都不會執行。',
  },
};

const SCHEDULING_DATA = {

  /* ── ETC 設備課 ── */
  equipment: [
    {
      id: 'sch-eq-001',
      name: 'SPC 異常日報',
      skill: 'spc-daily-report',
      skillId: 'sm-eq-008',      /* 對應 personas.js 的 Codify（含寫入）*/
      hasWrite: true,
      confirmSteps: 2,           /* 執行到這幾步會暫停等人決定 */
      cronLabel: '每日 07:50',
      createdBy: '陳育民',
      lastChange: { by: '陳育民', at: '04/18 09:12', summary: '執行時間 每日 07:00 → 每日 07:50' },
      status: 'pending',
      lastRun: '今日 07:50',
      runs: [
        {
          id: 'run-eq-001-1',
          dateLabel: '今日 07:50',
          startedAt: '今日 07:50:03',
          finishedAt: null,
          trigger: 'schedule',
          triggeredBy: null,
          result: 'pending',
          duration: '暫停中',
          waitingSince: '今日 07:52',
          totalSteps: 4,
          doneSteps: 2,
          interventions: [],
          steps: [
            { num: 1, title: '查詢今日 SPC 資料', status: 'done', result: '共取得 12 筆資料',
              tool: 'spc.query_daily', params: 'date=today, area=ETC-2F/ETC-3F', system: 'SPC', rows: 12, durationLabel: '4s' },
            { num: 2, title: '篩選 OOC 異常項目', status: 'done', result: 'E-308 × 3 筆、E-201 × 1 筆',
              durationLabel: '1s', note: '本課自訂：連續 3 點同側也納入' },
            {
              num: 3, title: '開立異常工單', status: 'waiting', result: '等待人工決定',
              needsConfirm: true,
              mcpTool: 'case_center.create_case',
              mcpParams: 'eqp_id=E-308, recipe=CMP-Standard, priority=P2',
              system: 'Case Center',
              detail: { machine: 'E-308', recipe: 'CMP-Standard', priority: 'P2', desc: '今日 07:00–07:50 發生 3 次 Standard Deviation 超標，建議 EE 確認 Chamber A 氣體流量是否異常' },
              onConfirm: '已開立工單 #CS-20260421-018（E-308）',
              onSkip: '人工略過，未開立工單',
            },
            {
              num: 4, title: '發送通知給值班 EE', status: 'pending', result: '待執行',
              needsConfirm: true,
              mcpTool: 'notify.send_to_duty',
              mcpParams: 'to=值班 EE（吳志豪）, ref=本次 SPC 異常日報',
              system: '通知中心',
              detail: { desc: '將本次 SPC 異常摘要與已開立的工單編號一併推送給值班 EE。' },
              onConfirm: '已送出通知給值班 EE 吳志豪',
              onSkip: '人工略過，未發送通知',
            },
          ],
        },
        {
          id: 'run-eq-001-2',
          dateLabel: '04/20 07:50',
          startedAt: '04/20 07:50:02',
          finishedAt: '04/20 07:51:14',
          trigger: 'schedule',
          triggeredBy: null,
          result: 'success',
          duration: '1m 12s',
          totalSteps: 4,
          doneSteps: 4,
          interventions: [],
          steps: [
            { num: 1, title: '查詢今日 SPC 資料', status: 'done', result: '共取得 9 筆資料',
              tool: 'spc.query_daily', params: 'date=2026-04-20, area=ETC-2F/ETC-3F', system: 'SPC', rows: 9, durationLabel: '5s' },
            { num: 2, title: '篩選 OOC 異常項目', status: 'done', result: '無異常', durationLabel: '1s' },
            { num: 3, title: '開立異常工單', status: 'skip', result: '跳過（無符合條件，未觸及確認點）' },
            { num: 4, title: '發送通知給值班 EE', status: 'done', result: '已送出「今日 SPC 正常，無異常開單」',
              tool: 'notify.send_to_duty', params: 'to=值班 EE', system: '通知中心', durationLabel: '2s' },
          ],
        },
        {
          id: 'run-eq-001-3',
          dateLabel: '04/19 07:50',
          startedAt: '04/19 07:50:04',
          finishedAt: '04/19 07:58:35',
          trigger: 'schedule',
          triggeredBy: null,
          result: 'success',
          duration: '8m 31s（含等待）',
          totalSteps: 4,
          doneSteps: 4,
          /* 兩個決策點由不同人決定 —— 誰在何時介入必須留得住 */
          interventions: [
            { id: 'iv-eq-001-3-a', action: 'confirm', stepNum: 3, at: '04/19 08:04',
              actor: { name: '吳志豪', avatar: '吳', color: '#2563EB' }, reason: '',
              toolCall: { tool: 'case_center.create_case', params: 'eqp_id=E-308, priority=P2', result: '已開立 #CS-20260419-006' } },
            { id: 'iv-eq-001-3-b', action: 'confirm', stepNum: 4, at: '04/19 08:09',
              actor: { name: '張文凱', avatar: '張', color: '#16A34A' }, reason: '',
              toolCall: { tool: 'notify.send_to_duty', params: 'to=值班 EE', result: '已送出' } },
          ],
          steps: [
            { num: 1, title: '查詢今日 SPC 資料', status: 'done', result: '共取得 14 筆資料',
              tool: 'spc.query_daily', params: 'date=2026-04-19', system: 'SPC', rows: 14, durationLabel: '6s' },
            { num: 2, title: '篩選 OOC 異常項目', status: 'done', result: 'E-308 × 2', durationLabel: '1s' },
            { num: 3, title: '開立異常工單', status: 'done', result: '已開立',
              needsConfirm: true, mcpTool: 'case_center.create_case', system: 'Case Center',
              onConfirm: '已開立工單 #CS-20260419-006（E-308）', onSkip: '人工略過，未開立工單' },
            { num: 4, title: '發送通知給值班 EE', status: 'done', result: '已送出',
              needsConfirm: true, mcpTool: 'notify.send_to_duty', system: '通知中心',
              onConfirm: '已送出通知給值班 EE 吳志豪', onSkip: '人工略過，未發送通知' },
          ],
        },
        {
          id: 'run-eq-001-4',
          dateLabel: '04/17 07:50',
          startedAt: '04/17 07:50:01',
          finishedAt: '04/17 08:12:44',
          trigger: 'schedule',
          triggeredBy: null,
          result: 'success',
          duration: '22m 43s（含等待）',
          totalSteps: 4,
          doneSteps: 4,
          /* 略過的示範：流程沒被中止，但那一步確實沒做，且記得住是誰決定的 */
          interventions: [
            { id: 'iv-eq-001-4-a', action: 'skip', stepNum: 3, at: '04/17 08:12',
              actor: { name: '陳育民', avatar: '陳', color: '#7C3AED' },
              reason: '同一批 E-201 昨日已開過工單 #CS-20260416-021，不重複開單',
              toolCall: null },
            { id: 'iv-eq-001-4-b', action: 'confirm', stepNum: 4, at: '04/17 08:12',
              actor: { name: '陳育民', avatar: '陳', color: '#7C3AED' }, reason: '',
              toolCall: { tool: 'notify.send_to_duty', params: 'to=值班 EE', result: '已送出' } },
          ],
          steps: [
            { num: 1, title: '查詢今日 SPC 資料', status: 'done', result: '共取得 11 筆資料',
              tool: 'spc.query_daily', params: 'date=2026-04-17', system: 'SPC', rows: 11, durationLabel: '5s' },
            { num: 2, title: '篩選 OOC 異常項目', status: 'done', result: 'E-201 × 5', durationLabel: '1s' },
            { num: 3, title: '開立異常工單', status: 'skip', result: '人工略過，未開立工單',
              needsConfirm: true, mcpTool: 'case_center.create_case', system: 'Case Center',
              onConfirm: '已開立工單（E-201）', onSkip: '人工略過，未開立工單' },
            { num: 4, title: '發送通知給值班 EE', status: 'done', result: '已送出（含略過說明）',
              needsConfirm: true, mcpTool: 'notify.send_to_duty', system: '通知中心',
              onConfirm: '已送出通知給值班 EE 吳志豪', onSkip: '人工略過，未發送通知' },
          ],
        },
        {
          id: 'run-eq-001-5',
          dateLabel: '04/16 07:50',
          startedAt: '04/16 07:50:03',
          finishedAt: '04/16 09:11:52',
          trigger: 'schedule',
          triggeredBy: null,
          result: 'rejected',
          duration: '1h 21m（含等待）',
          totalSteps: 4,
          doneSteps: 2,
          interventions: [
            { id: 'iv-eq-001-5-a', action: 'reject', stepNum: 3, at: '04/16 09:11',
              actor: { name: '陳育民', avatar: '陳', color: '#2563EB' },
              reason: 'SPC 資料來源當日有誤（量測機重校中），改由人工處理',
              toolCall: null },
          ],
          steps: [
            { num: 1, title: '查詢今日 SPC 資料', status: 'done', result: '共取得 8 筆資料',
              tool: 'spc.query_daily', params: 'date=2026-04-16', system: 'SPC', rows: 8, durationLabel: '4s' },
            { num: 2, title: '篩選 OOC 異常項目', status: 'done', result: 'E-308 × 1', durationLabel: '1s' },
            { num: 3, title: '開立異常工單', status: 'rejected', result: '拒絕執行，排程終止',
              needsConfirm: true, mcpTool: 'case_center.create_case', system: 'Case Center',
              onConfirm: '已開立工單（E-308）', onSkip: '人工略過，未開立工單' },
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
      lastChange: { by: '王志明', at: '04/09 16:40', summary: '建立排程' },
      status: 'ok',
      lastRun: '今日 15:30',
      runs: [
        {
          id: 'run-eq-004-1',
          dateLabel: '今日 15:30',
          startedAt: '今日 15:30:02',
          finishedAt: '今日 15:30:40',
          trigger: 'schedule',
          triggeredBy: null,
          result: 'success',
          duration: '38s',
          totalSteps: 5,
          doneSteps: 5,
          interventions: [],
          steps: [
            { num: 1, title: '取當班機台稼動資料',       status: 'done', result: '16 台，總運轉 340.8 h',
              tool: 'eqp.get_uptime', params: 'shift=day, section=ETC', system: '設備監控', rows: 16, durationLabel: '9s' },
            { num: 2, title: '取同時段警報並分級',       status: 'done', result: '原始 27 筆 → 分級去重後 5 件',
              tool: 'fdc.list_alarms', params: 'from=08:00, to=16:00', system: 'FDC', rows: 27, durationLabel: '11s' },
            { num: 3, title: '計算稼動率與異常密度',     status: 'done', result: '稼動率 94.2%、異常密度 0.63 件/台/班', durationLabel: '2s' },
            { num: 4, title: '取未結案 Case 與待辦事項', status: 'done', result: '7 件（逾期 1 件）',
              tool: 'case_center.list_open', params: 'section=ETC', system: 'Case Center', rows: 7, durationLabel: '8s' },
            { num: 5, title: '套用交接報告格式',         status: 'done', result: '已產出，同步送至課佈告欄', durationLabel: '6s' },
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
          startedAt: '今日 07:30:01',
          finishedAt: '今日 07:30:36',
          trigger: 'schedule',
          triggeredBy: null,
          result: 'success',
          duration: '35s',
          totalSteps: 5,
          doneSteps: 5,
          interventions: [],
          steps: [
            { num: 1, title: '取當班機台稼動資料',       status: 'done', result: '16 台，總運轉 352.1 h',
              tool: 'eqp.get_uptime', params: 'shift=night, section=ETC', system: '設備監控', rows: 16, durationLabel: '8s' },
            { num: 2, title: '取同時段警報並分級',       status: 'done', result: '原始 14 筆 → 分級去重後 2 件',
              tool: 'fdc.list_alarms', params: 'from=00:00, to=08:00', system: 'FDC', rows: 14, durationLabel: '9s' },
            { num: 3, title: '計算稼動率與異常密度',     status: 'done', result: '稼動率 96.1%、異常密度 0.25 件/台/班', durationLabel: '2s' },
            { num: 4, title: '取未結案 Case 與待辦事項', status: 'done', result: '6 件',
              tool: 'case_center.list_open', params: 'section=ETC', system: 'Case Center', rows: 6, durationLabel: '7s' },
            { num: 5, title: '套用交接報告格式',         status: 'done', result: '已產出，同步送至課佈告欄', durationLabel: '5s' },
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
          startedAt: '昨日 23:30:02',
          finishedAt: '昨日 23:30:14',
          trigger: 'schedule',
          triggeredBy: null,
          result: 'error',
          duration: '12s',
          totalSteps: 5,
          doneSteps: 1,
          interventions: [],
          failure: {
            stepNum: 1,
            tool: 'eqp.get_uptime',
            kind: 'timeout',
            message: 'eqp.get_uptime timeout after 30s（設備監控系統維護中）',
            retryable: true,
          },
          /* 重跑產生的是「新的一筆」，不覆蓋原本這筆失敗紀錄 */
          retry: {
            duration: '41s',
            steps: [
              { num: 1, title: '取當班機台稼動資料',       status: 'done', result: '16 台，總運轉 328.4 h',
                tool: 'eqp.get_uptime', params: 'shift=swing, section=ETC', system: '設備監控', rows: 16, durationLabel: '12s' },
              { num: 2, title: '取同時段警報並分級',       status: 'done', result: '原始 19 筆 → 分級去重後 3 件',
                tool: 'fdc.list_alarms', params: 'from=16:00, to=00:00', system: 'FDC', rows: 19, durationLabel: '10s' },
              { num: 3, title: '計算稼動率與異常密度',     status: 'done', result: '稼動率 92.8%、異常密度 0.38 件/台/班', durationLabel: '2s' },
              { num: 4, title: '取未結案 Case 與待辦事項', status: 'done', result: '7 件（逾期 1 件）',
                tool: 'case_center.list_open', params: 'section=ETC', system: 'Case Center', rows: 7, durationLabel: '9s' },
              { num: 5, title: '套用交接報告格式',         status: 'done', result: '已產出（補跑，未再送佈告欄）', durationLabel: '6s' },
            ],
            output: {
              title: 'ETC 設備課 · 小夜班交接報告（補跑）',
              shiftLabel: '小夜班 16:00 – 00:00',
              generatedAt: '補跑產出',
              metrics: [
                { label: '機台稼動率', value: '92.8', unit: '%',  note: '目標 95%，未達標' },
                { label: '本班異常',   value: '3',    unit: '件', note: 'P2 ×3' },
                { label: '未結案 Case', value: '7',   unit: '件', note: '逾期 1 件' },
              ],
              situation: '【補跑說明】原班次因設備監控系統維護未能產出，本份為事後補跑，資料區間與原班次相同。\n【KPI 未達標】設備稼動率 92.8%（目標 95%）。\n【本班異常】E-308 FDC 異常延續至大夜班。',
              pending: '• 本份為補跑，交接當下並未產出，請確認小夜班是否已用口頭交接補上。\n• E-308 FDC 異常延續中。',
            },
          },
          steps: [
            { num: 1, title: '取當班機台稼動資料',       status: 'error', result: '設備監控系統無回應',
              tool: 'eqp.get_uptime', params: 'shift=swing, section=ETC', system: '設備監控', durationLabel: '30s' },
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
      hasWrite: true,
      confirmSteps: 1,
      cronLabel: '每日 08:00',
      createdBy: '王志明',
      lastChange: { by: '王志明', at: '03/30 11:05', summary: '建立排程' },
      status: 'pending',
      lastRun: '今日 15:12',
      runs: [
        /* 第二個待決定 —— 收件匣要成立，「一類底下有多件」必須是真的看得到的狀態：
           第一件展開成可決定的卡片、其餘收合成一行（設計檔 4a）。
           只有一件的話那個版型永遠測不到，也看不出「最久已等待」在比什麼。 */
        {
          id: 'run-eq-002-0',
          dateLabel: '今日 15:10',
          startedAt: '今日 15:10:04',
          finishedAt: null,
          trigger: 'schedule',
          triggeredBy: null,
          result: 'pending',
          duration: '暫停中',
          waitingSince: '今日 15:12',
          totalSteps: 3,
          doneSteps: 2,
          interventions: [],
          steps: [
            { num: 1, title: '查詢今日 FDC 異常事件', status: 'done', result: '共 3 筆 Level-2 異常',
              tool: 'fdc.list_alarms', params: 'date=today, level=2', system: 'FDC', rows: 3, durationLabel: '11s' },
            { num: 2, title: '彙整異常摘要', status: 'done', result: 'E-308 × 2、E-201 × 1', durationLabel: '3s' },
            {
              num: 3, title: '發佈至 Dashboard 公告欄', status: 'waiting', result: '等待人工決定',
              needsConfirm: true,
              mcpTool: 'dashboard.publish_notice', system: 'Dashboard 公告欄',
              mcpParams: 'board=ETC-設備課, level=2, items=3',
              onConfirm: '已發佈至課公告欄',
              onSkip: '人工略過，本次未發佈',
              detail: {
                desc: '將今日 3 筆 Level-2 異常摘要發佈到課公告欄，全課看得到。',
                target: 'ETC 設備課公告欄',
                issue: 'E-308 連續兩班出現同型異常，摘要內含跨班說明',
                action: '確認內容無誤後發佈；若異常仍在處理中可先略過，等結案再發',
              },
            },
          ],
        },
        {
          id: 'run-eq-002-1',
          dateLabel: '今日 08:00',
          startedAt: '今日 08:00:03',
          finishedAt: '今日 08:01:08',
          trigger: 'schedule',
          triggeredBy: null,
          result: 'success',
          duration: '1m 05s',
          totalSteps: 3,
          doneSteps: 3,
          interventions: [],
          steps: [
            { num: 1, title: '查詢今日 FDC 異常事件', status: 'done', result: '共 5 筆 Level-2 異常',
              tool: 'fdc.list_alarms', params: 'date=today, level=2', system: 'FDC', rows: 5, durationLabel: '12s' },
            { num: 2, title: '彙整異常摘要', status: 'done', result: 'E-308 × 3、E-201 × 2', durationLabel: '3s' },
            { num: 3, title: '發佈至 Dashboard 公告欄', status: 'done', result: '已發佈（08:01）', durationLabel: '4s' },
          ],
        },
        {
          id: 'run-eq-002-2',
          dateLabel: '04/20 08:00',
          startedAt: '04/20 08:00:02',
          finishedAt: '04/20 08:01:00',
          trigger: 'schedule',
          triggeredBy: null,
          result: 'success',
          duration: '58s',
          totalSteps: 3,
          doneSteps: 3,
          interventions: [],
          steps: [
            { num: 1, title: '查詢今日 FDC 異常事件', status: 'done', result: '共 2 筆 Level-1 異常',
              tool: 'fdc.list_alarms', params: 'date=2026-04-20, level=1', system: 'FDC', rows: 2, durationLabel: '11s' },
            { num: 2, title: '彙整異常摘要', status: 'done', result: 'E-101 × 2', durationLabel: '2s' },
            { num: 3, title: '發佈至 Dashboard 公告欄', status: 'done', result: '已發佈（08:01）', durationLabel: '4s' },
          ],
        },
      ],
    },
    {
      id: 'sch-eq-003',
      name: 'PM 到期提醒',
      skill: 'pm-reminder',
      hasWrite: false,
      confirmSteps: 0,
      cronLabel: '每日 07:00',
      createdBy: '吳志豪',
      /* 停用＝不再自動觸發，但排程還在、歷史還在，那份 Codify 仍算「已掛排程」
         （不會回到可新增清單，要放回去只能刪除排程 —— 見 brain 決議 19 的前置決策）。
         留一個已停用的 mock，停用態才有得看：灰點灰字、下次執行「—」、只剩歷史。 */
      enabled: false,
      disabledBy: '吳志豪',
      disabledAt: '今日 15:20',
      lastChange: { by: '吳志豪', at: '今日 15:20', summary: '停用排程' },
      status: 'ok',
      lastRun: '今日 07:01',
      runs: [
        {
          id: 'run-eq-003-1',
          dateLabel: '今日 07:00',
          startedAt: '今日 07:00:02',
          finishedAt: '今日 07:00:34',
          trigger: 'schedule',
          triggeredBy: null,
          result: 'success',
          duration: '32s',
          totalSteps: 2,
          doneSteps: 2,
          interventions: [],
          steps: [
            { num: 1, title: '查詢本週 PM 排程', status: 'done', result: 'E-203 今日 16:00、E-101 明日 09:00',
              tool: 'cmms.list_pm', params: 'range=this_week, section=ETC', system: 'CMMS', rows: 2, durationLabel: '9s' },
            { num: 2, title: '推送提醒至 Priority Feed', status: 'done', result: '已推送 2 筆提醒', durationLabel: '3s' },
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
      hasWrite: false,
      confirmSteps: 0,
      cronLabel: '每日 08:00',
      createdBy: '鄭志明',
      lastChange: { by: '鄭志明', at: '04/02 10:30', summary: '建立排程' },
      status: 'ok',
      lastRun: '今日 08:02',
      runs: [
        {
          id: 'run-pr-001-1',
          dateLabel: '今日 08:00',
          startedAt: '今日 08:00:04',
          finishedAt: '今日 08:01:26',
          trigger: 'schedule',
          triggeredBy: null,
          result: 'success',
          duration: '1m 22s',
          totalSteps: 3,
          doneSteps: 3,
          interventions: [],
          steps: [
            { num: 1, title: '查詢今日 SPC OOC 資料', status: 'done', result: '2 站失控（HV-03、LV-01）',
              tool: 'spc.query_daily', params: 'date=today, type=ooc', system: 'SPC', rows: 2, durationLabel: '14s' },
            { num: 2, title: '生成異常摘要', status: 'done', result: '已彙整根因分析建議', durationLabel: '6s' },
            { num: 3, title: '推送至值班 PE Priority Feed', status: 'done', result: '已推送', durationLabel: '3s' },
          ],
        },
        {
          id: 'run-pr-001-2',
          dateLabel: '04/20 08:00',
          startedAt: '04/20 08:00:03',
          finishedAt: '04/20 08:00:51',
          trigger: 'schedule',
          triggeredBy: null,
          result: 'success',
          duration: '48s',
          totalSteps: 3,
          doneSteps: 3,
          interventions: [],
          steps: [
            { num: 1, title: '查詢今日 SPC OOC 資料', status: 'done', result: '無失控',
              tool: 'spc.query_daily', params: 'date=2026-04-20, type=ooc', system: 'SPC', rows: 0, durationLabel: '12s' },
            { num: 2, title: '生成異常摘要', status: 'done', result: '正常（略過推送）', durationLabel: '2s' },
            { num: 3, title: '推送至值班 PE Priority Feed', status: 'skip', result: '跳過（無異常）' },
          ],
        },
      ],
    },
    {
      id: 'sch-pr-002',
      name: 'Recipe 品質週報',
      skill: 'recipe-quality-weekly',
      hasWrite: false,
      confirmSteps: 0,
      cronLabel: '每週一 09:00',
      createdBy: '李佳穎',
      lastChange: { by: '李佳穎', at: '04/13 14:55', summary: '執行時間 每日 07:00 → 每週一 09:00' },
      status: 'error',
      lastRun: '04/14 09:00',
      runs: [
        {
          id: 'run-pr-002-1',
          dateLabel: '04/14 09:00',
          startedAt: '04/14 09:00:02',
          finishedAt: '04/14 09:02:07',
          trigger: 'schedule',
          triggeredBy: null,
          result: 'error',
          duration: '2m 05s',
          totalSteps: 4,
          doneSteps: 1,
          interventions: [],
          failure: {
            stepNum: 2,
            tool: 'spc_system.get_recipe_stats',
            kind: 'timeout',
            message: 'spc_system.get_recipe_stats 連線逾時（timeout 30s）',
            retryable: true,
          },
          retry: {
            duration: '3m 02s',
            steps: [
              { num: 1, title: '查詢 Active Recipe 清單', status: 'done', result: '共 12 個 Active Recipe',
                tool: 'spc_system.list_recipes', params: 'status=active', system: 'SPC', rows: 12, durationLabel: '16s' },
              { num: 2, title: '取得各 Recipe 本週 SPC 數據', status: 'done', result: '所有 Recipe 數據取得完成',
                tool: 'spc_system.get_recipe_stats', params: 'recipe_ids=12 筆, range=this_week', system: 'SPC', rows: 12, durationLabel: '2m 04s' },
              { num: 3, title: '生成品質週報', status: 'done', result: '週報草稿已生成（補跑）', durationLabel: '35s' },
              { num: 4, title: '發送週報至 Section Admin', status: 'done', result: '已發送至 李佳穎', durationLabel: '5s' },
            ],
          },
          steps: [
            { num: 1, title: '查詢 Active Recipe 清單', status: 'done', result: '共 12 個 Active Recipe',
              tool: 'spc_system.list_recipes', params: 'status=active', system: 'SPC', rows: 12, durationLabel: '18s' },
            { num: 2, title: '取得各 Recipe 本週 SPC 數據', status: 'error', result: 'MCP tool 連線逾時',
              tool: 'spc_system.get_recipe_stats', params: 'recipe_ids=12 筆, range=this_week', system: 'SPC', durationLabel: '30s' },
            { num: 3, title: '生成品質週報', status: 'skip', result: '未執行' },
            { num: 4, title: '發送週報至 Section Admin', status: 'skip', result: '未執行' },
          ],
        },
        {
          id: 'run-pr-002-2',
          dateLabel: '04/07 09:00',
          startedAt: '04/07 09:00:03',
          finishedAt: '04/07 09:03:17',
          trigger: 'schedule',
          triggeredBy: null,
          result: 'success',
          duration: '3m 14s',
          totalSteps: 4,
          doneSteps: 4,
          interventions: [],
          steps: [
            { num: 1, title: '查詢 Active Recipe 清單', status: 'done', result: '共 12 個 Active Recipe',
              tool: 'spc_system.list_recipes', params: 'status=active', system: 'SPC', rows: 12, durationLabel: '17s' },
            { num: 2, title: '取得各 Recipe 本週 SPC 數據', status: 'done', result: '所有 Recipe 數據取得完成',
              tool: 'spc_system.get_recipe_stats', params: 'recipe_ids=12 筆, range=this_week', system: 'SPC', rows: 12, durationLabel: '2m 08s' },
            { num: 3, title: '生成品質週報', status: 'done', result: '週報草稿已生成', durationLabel: '32s' },
            { num: 4, title: '發送週報至 Section Admin', status: 'done', result: '已發送至 李佳穎', durationLabel: '5s' },
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
      hasWrite: true,
      confirmSteps: 1,
      cronLabel: '每小時整點',
      createdBy: '陳建宏',
      lastChange: { by: '陳建宏', at: '03/25 09:00', summary: '建立排程' },
      status: 'pending',
      lastRun: '今日 11:00',
      runs: [
        {
          id: 'run-mf-001-1',
          dateLabel: '今日 11:00',
          startedAt: '今日 11:00:02',
          finishedAt: null,
          trigger: 'schedule',
          triggeredBy: null,
          result: 'pending',
          duration: '暫停中',
          waitingSince: '今日 11:00',
          totalSteps: 3,
          doneSteps: 2,
          interventions: [],
          steps: [
            { num: 1, title: '查詢各 Line 即時產出數據', status: 'done', result: 'Line 1: 正常、Line 2: 正常、Line 3: 落後 8%',
              tool: 'mes.get_line_output', params: 'lines=1,2,3', system: 'MES', rows: 3, durationLabel: '11s' },
            { num: 2, title: '評估落後程度與風險', status: 'done', result: 'Line 3 落後超過 5% 閾值，觸發預警條件', durationLabel: '2s' },
            {
              num: 3, title: '建立緊急應變工單', status: 'waiting', result: '等待人工決定',
              needsConfirm: true,
              mcpTool: 'mes.create_urgent_order',
              mcpParams: 'line=Line 3, priority=P1, notify=班組長',
              system: 'MES',
              detail: { target: 'Line 3', issue: '產出落後 8%（閾值 5%）', action: '建立 P1 緊急工單並通知班組長' },
              onConfirm: '已建立 P1 緊急工單 #WO-20260421-033，並通知班組長',
              onSkip: '人工略過，未建立工單',
            },
          ],
        },
        {
          id: 'run-mf-001-2',
          dateLabel: '今日 10:00',
          startedAt: '今日 10:00:01',
          finishedAt: '今日 10:00:23',
          trigger: 'schedule',
          triggeredBy: null,
          result: 'success',
          duration: '22s',
          totalSteps: 3,
          doneSteps: 3,
          interventions: [],
          steps: [
            { num: 1, title: '查詢各 Line 即時產出數據', status: 'done', result: '三線均正常',
              tool: 'mes.get_line_output', params: 'lines=1,2,3', system: 'MES', rows: 3, durationLabel: '10s' },
            { num: 2, title: '評估落後程度與風險', status: 'done', result: '未達預警閾值（5%）', durationLabel: '2s' },
            { num: 3, title: '建立緊急應變工單', status: 'skip', result: '跳過（未觸發預警，未觸及確認點）' },
          ],
        },
        {
          id: 'run-mf-001-3',
          dateLabel: '今日 09:00',
          startedAt: '今日 09:00:02',
          finishedAt: '今日 09:00:33',
          trigger: 'schedule',
          triggeredBy: null,
          result: 'success',
          duration: '31s',
          totalSteps: 3,
          doneSteps: 3,
          interventions: [],
          steps: [
            { num: 1, title: '查詢各 Line 即時產出數據', status: 'done', result: '三線均正常',
              tool: 'mes.get_line_output', params: 'lines=1,2,3', system: 'MES', rows: 3, durationLabel: '12s' },
            { num: 2, title: '評估落後程度', status: 'done', result: '未達預警閾值', durationLabel: '2s' },
            { num: 3, title: '建立緊急應變工單', status: 'skip', result: '跳過（未觸發預警）' },
          ],
        },
      ],
    },
    {
      id: 'sch-mf-002',
      name: '生產日報自動彙整',
      skill: 'daily-report-gen',
      hasWrite: false,
      confirmSteps: 0,
      cronLabel: '每日 07:30',
      createdBy: '林組長',
      lastChange: { by: '林組長', at: '04/11 17:22', summary: '建立排程' },
      status: 'ok',
      lastRun: '今日 07:31',
      runs: [
        {
          id: 'run-mf-002-1',
          dateLabel: '今日 07:30',
          startedAt: '今日 07:30:02',
          finishedAt: '今日 07:32:12',
          trigger: 'schedule',
          triggeredBy: null,
          result: 'success',
          duration: '2m 10s',
          totalSteps: 4,
          doneSteps: 4,
          interventions: [],
          steps: [
            { num: 1, title: '取得昨日各線產出數據', status: 'done', result: 'Line 1: 98%、Line 2: 102%、Line 3: 87%',
              tool: 'mes.get_line_output', params: 'date=yesterday, lines=1,2,3', system: 'MES', rows: 3, durationLabel: '24s' },
            { num: 2, title: '彙整停機事件紀錄', status: 'done', result: 'E-101 停機 2.5h（Line 3）',
              tool: 'mes.list_downtime', params: 'date=yesterday', system: 'MES', rows: 1, durationLabel: '18s' },
            { num: 3, title: '生成日報草稿', status: 'done', result: '草稿已生成（含風險預告）', durationLabel: '1m 22s' },
            { num: 4, title: '推送至陳建宏 Priority Feed', status: 'done', result: '已推送（07:31）', durationLabel: '4s' },
          ],
        },
        {
          id: 'run-mf-002-2',
          dateLabel: '04/20 07:30',
          startedAt: '04/20 07:30:01',
          finishedAt: '04/20 07:31:56',
          trigger: 'schedule',
          triggeredBy: null,
          result: 'success',
          duration: '1m 55s',
          totalSteps: 4,
          doneSteps: 4,
          interventions: [],
          steps: [
            { num: 1, title: '取得昨日各線產出數據', status: 'done', result: '三線均達標',
              tool: 'mes.get_line_output', params: 'date=2026-04-19, lines=1,2,3', system: 'MES', rows: 3, durationLabel: '22s' },
            { num: 2, title: '彙整停機事件紀錄', status: 'done', result: '無停機事件',
              tool: 'mes.list_downtime', params: 'date=2026-04-19', system: 'MES', rows: 0, durationLabel: '15s' },
            { num: 3, title: '生成日報草稿', status: 'done', result: '草稿已生成', durationLabel: '1m 14s' },
            { num: 4, title: '推送至陳建宏 Priority Feed', status: 'done', result: '已推送', durationLabel: '4s' },
          ],
        },
      ],
    },
  ],
};

/* ════════════════════════════════════════
   執行檢視推導 —— 步驟最終狀態由介入紀錄推出，不寫死在資料裡

   規則（與 2026-08-01 決議一致）：
   · 一個步驟只要有介入紀錄，就依該決定定案，不再是決策點。
   · 拒絕 → 該步驟終止，其後所有步驟一律不執行。
   · 略過 → 該步驟不呼叫工具，流程繼續往下走。
   · 尚未被決定的第一個需確認步驟＝當前決策點；它之後的步驟一律待執行。
   ════════════════════════════════════════ */

function schInterventionFor(ivs, stepNum) {
  for (var i = 0; i < ivs.length; i++) {
    if (ivs[i].stepNum === stepNum) return ivs[i];
  }
  return null;
}

/* run 的完整檢視：steps 已套用介入結果，activeStep 是當前待決定的步驟（沒有就是 null）*/
function getRunView(run, sessionIvs) {
  var ivs = (run.interventions || []).concat(sessionIvs || []);
  var halted = false;   /* 已被拒絕，後面都不執行 */
  var awaiting = null;  /* 已出現當前決策點，後面都待執行 */

  var steps = (run.steps || []).map(function (s) {
    if (halted) {
      return Object.assign({}, s, { status: 'skip', result: '未執行（已拒絕，排程終止）' });
    }
    var iv = schInterventionFor(ivs, s.num);
    if (iv) {
      if (iv.action === 'reject') {
        halted = true;
        return Object.assign({}, s, { status: 'rejected', result: '拒絕執行，排程終止' });
      }
      if (iv.action === 'skip') {
        return Object.assign({}, s, { status: 'skip', result: s.onSkip || '人工略過' });
      }
      return Object.assign({}, s, { status: 'done', result: s.onConfirm || s.result });
    }
    if (awaiting) {
      return Object.assign({}, s, { status: 'pending', result: '待執行' });
    }
    /* 尚未決定的需確認步驟 → 這是當前決策點 */
    if (s.status === 'waiting' || (s.needsConfirm && s.status === 'pending')) {
      awaiting = s;
      return Object.assign({}, s, { status: 'waiting', result: '等待人工決定' });
    }
    return s;
  });

  var activeStep = awaiting
    ? steps.filter(function (s) { return s.num === awaiting.num; })[0] || null
    : null;
  var hasError = steps.some(function (s) { return s.status === 'error'; });

  var result;
  if (halted)          result = 'rejected';
  else if (hasError)   result = 'error';
  else if (activeStep) result = 'pending';
  else                 result = 'success';

  var doneSteps = steps.filter(function (s) { return s.status === 'done'; }).length;

  return {
    steps: steps,
    activeStep: activeStep,
    interventions: ivs,
    result: result,
    doneSteps: doneSteps,
    totalSteps: steps.length,
    hasSkip: ivs.some(function (i) { return i.action === 'skip'; }),
  };
}

/* ════════════════════════════════════════
   跨排程彙整 —— 目標 2、3 的落點

   「昨晚全課跑了什麼」不該要一個一個點排程才看得到。
   時間戳從 startedAt 推導，不在 20 筆 mock 上各補一個 ts 欄位。
   ════════════════════════════════════════ */

const SCH_TODAY = { y: 2026, m: 4, d: 21 };   /* mock 的「今日」*/

function schPad(n) { return n < 10 ? '0' + n : '' + n; }

/* '今日 07:50:03' / '昨日 23:30:02' / '04/20 07:50:02' → 20260421075003 */
function getRunTs(run) {
  var s = run.startedAt || run.dateLabel || '';
  var t = s.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
  var hh = t ? schPad(+t[1]) : '00';
  var mm = t ? t[2] : '00';
  var ss = t && t[3] ? t[3] : '00';

  var y = SCH_TODAY.y, m = SCH_TODAY.m, d = SCH_TODAY.d;
  var md = s.match(/^(\d{2})\/(\d{2})/);
  if (md) {
    m = +md[1]; d = +md[2];
  } else if (s.indexOf('昨日') === 0) {
    var prev = new Date(Date.UTC(SCH_TODAY.y, SCH_TODAY.m - 1, SCH_TODAY.d - 1));
    y = prev.getUTCFullYear(); m = prev.getUTCMonth() + 1; d = prev.getUTCDate();
  }
  return +('' + y + schPad(m) + schPad(d) + hh + mm + ss);
}

/* 取某課的排程清單，並把本 session 產生的重跑併進各自的 runs（最新在前）*/
function getScheduleItems(personaKey, extraRunsByScheduleId) {
  var list = (SCHEDULING_DATA && SCHEDULING_DATA[personaKey]) || [];
  var extra = extraRunsByScheduleId || {};
  return list.map(function (item) {
    var add = extra[item.id];
    if (!add || !add.length) return item;
    var runs = add.concat(item.runs || []).slice().sort(function (a, b) { return getRunTs(b) - getRunTs(a); });
    return Object.assign({}, item, { runs: runs });
  });
}

/* 全課所有執行，依時間倒序攤平；每筆帶著它所屬的排程與推導後的檢視 */
function getAllRuns(items, sessionIvsByRun) {
  var out = [];
  (items || []).forEach(function (item) {
    (item.runs || []).forEach(function (run) {
      out.push({
        item: item,
        run: run,
        view: getRunView(run, (sessionIvsByRun || {})[run.id]),
        ts: getRunTs(run),
      });
    });
  });
  return out.sort(function (a, b) { return b.ts - a.ts; });
}

function matchRunFilter(entry, filterKey) {
  if (filterKey === 'error')   return entry.view.result === 'error';
  if (filterKey === 'pending') return entry.view.result === 'pending';
  if (filterKey === 'human')   return entry.view.interventions.length > 0;
  return true;
}

/* 由失敗紀錄產生一筆「重跑」執行 —— 新增一筆，不覆蓋原本那筆失敗 */
function buildRetryRun(run, actorName, atLabel) {
  var tpl = run.retry || {};
  return {
    id: run.id + '-retry-' + Date.now(),
    dateLabel: atLabel,
    startedAt: atLabel,
    finishedAt: atLabel,
    trigger: 'retry',
    triggeredBy: actorName,
    retryOf: run.id,
    result: 'success',
    duration: tpl.duration || '—',
    totalSteps: (tpl.steps || run.steps || []).length,
    doneSteps: (tpl.steps || []).length,
    interventions: [],
    steps: tpl.steps || (run.steps || []).map(function (s) {
      return Object.assign({}, s, { status: 'done' });
    }),
    output: tpl.output || null,
  };
}

/* ── 本次實際走過的路徑 ──
   目標 6 的「哪個分支沒走」。分成三種沒走：
   · 分支未成立（條件不符，引擎根本沒到那個節點）
   · 人工略過（人到了、決定不做 —— 這算走過，只是沒執行工具）
   · 已拒絕後不執行（流程被中止）
   注意：`skip` 這個狀態同時涵蓋前兩者，得靠有沒有介入紀錄才分得出來。 */
function getRunPath(view) {
  var taken = [];
  var notTaken = [];
  (view.steps || []).forEach(function (s) {
    var iv = null;
    (view.interventions || []).forEach(function (i) { if (i.stepNum === s.num) iv = i; });

    if (s.status === 'done' || s.status === 'error' || s.status === 'rejected' || s.status === 'waiting') {
      taken.push(s.num);
      return;
    }
    if (s.status === 'skip' && iv && iv.action === 'skip') {
      taken.push(s.num);                       /* 人到了，只是決定不執行 */
      notTaken.push({ num: s.num, title: s.title, why: '人工略過', byHuman: true });
      return;
    }
    notTaken.push({
      num: s.num, title: s.title, byHuman: false,
      why: s.status === 'pending' ? '尚未執行到' : (s.result || '分支未成立'),
    });
  });
  return { taken: taken, notTaken: notTaken };
}

/* ════════════════════════════════════════
   決策收件匣 —— 頁面的主詞是「事」，不是「排程」

   左欄上半是「等人的事」，依類型分組、只給件數；是哪一個排程、卡在哪一步
   全部留到右欄講（在 312px 裡兩件事就會撐爆，件數多時更明顯）。
   兩類事的動作語彙不同，所以不是同一個清單的兩個篩選，是兩類：
   · 待人工決定：AI 停在那裡等人，決定了才會往下走
   · 失敗待確認：執行已中止，沒有等待中的 AI 步驟，只需要有人看過並收掉
   ════════════════════════════════════════ */
const SCH_QUEUE_CFG = {
  decision: {
    key: 'decision', label: '待人工決定', dot: '#D97706',
    desc: '排程會一直停在該步驟直到有人決定',
  },
  failure: {
    key: 'failure', label: '失敗待確認', dot: '#DC2626',
    desc: '執行已中止，確認後這筆會留在紀錄但不再提醒',
  },
};

/* mock 的「現在」。等待時間是本頁最重要的催辦訊號（誰等最久先處理），
   而 mock 的時間全是字串標籤，沒有真的 timestamp，所以這裡釘一個現在時刻，
   讓「已等待 7h 42m」算得出來、也不會每次重整就跳動。 */
const SCH_NOW = { hh: 15, mm: 34 };

/* '今日 07:52' → 已等待幾分鐘；跨日的（昨日／MM/DD）用 getRunTs 的日期推算 */
function getWaitedMinutes(sinceLabel) {
  if (!sinceLabel) return 0;
  var t = /(\d{1,2}):(\d{2})/.exec(sinceLabel);
  if (!t) return 0;
  var mins = (SCH_NOW.hh * 60 + SCH_NOW.mm) - (+t[1] * 60 + +t[2]);
  /* 跨日等待要看得出來是「昨天就卡住了」。日期差用 Date 算，
     不能直接減 YYYYMMDD（跨月會變成 71 天）。 */
  var today = Date.UTC(SCH_TODAY.y, SCH_TODAY.m - 1, SCH_TODAY.d);
  var day = today;
  var md = /^(\d{2})\/(\d{2})/.exec(sinceLabel);
  if (md) day = Date.UTC(SCH_TODAY.y, +md[1] - 1, +md[2]);
  else if (sinceLabel.indexOf('昨日') === 0) day = today - 86400000;
  mins += Math.round((today - day) / 60000);
  return mins > 0 ? mins : 0;
}

function getWaitedLabel(sinceLabel) {
  var m = getWaitedMinutes(sinceLabel);
  if (m < 60) return m + 'm';
  return Math.floor(m / 60) + 'h ' + schPad(m % 60) + 'm';
}

/* 待人工決定佇列：等最久的排在最前面（催辦的順序就是等待時間的順序）*/
function getDecisionQueue(items, sessionIvsByRun) {
  return getPendingDecisions(items, sessionIvsByRun)
    .map(function (d) {
      var since = d.run.waitingSince || d.run.startedAt;
      return Object.assign({}, d, { since: since, waitedMin: getWaitedMinutes(since), waited: getWaitedLabel(since) });
    })
    .sort(function (a, b) { return b.waitedMin - a.waitedMin; });
}

/* 失敗待確認佇列 ──
   「確認過了」是本 session 的狀態（acks: { [runId]: {by, at} }），與介入紀錄分開：
   它不是對 AI 的決定，是人看過了、不用再提醒我。時間倒序，最新的失敗在最前面。 */
function getFailureQueue(items, sessionIvsByRun, acks) {
  var out = [];
  (items || []).forEach(function (item) {
    (item.runs || []).forEach(function (run) {
      var view = getRunView(run, (sessionIvsByRun || {})[run.id]);
      if (view.result !== 'error') return;
      if ((acks || {})[run.id]) return;
      /* 已經補跑過的失敗：那一筆失敗仍留著，但要講得出「後來補跑完成了」*/
      var retry = null;
      (item.runs || []).forEach(function (r) { if (r.retryOf === run.id) retry = r; });
      out.push({ item: item, run: run, view: view, retry: retry, ts: getRunTs(run) });
    });
  });
  return out.sort(function (a, b) { return b.ts - a.ts; });
}

/* '1m 21s' / '58s' / '暫停中' → 秒；算不出來的回 null，不要污染平均。
   ⚠️「（含等待）」那幾筆一律不算：那是人隔了多久才來按，不是這支排程跑多久，
   混進平均會得出「平均 10m 49s」這種看不出機器快慢的數字。 */
function schDurationSec(label) {
  if (!label) return null;
  if (label.indexOf('含等待') >= 0 || label.indexOf('暫停') >= 0) return null;
  var m = /(?:(\d+)m\s*)?(\d+)s/.exec(label);
  if (!m) return null;
  return (+(m[1] || 0)) * 60 + (+m[2]);
}

/* 單一排程近 N 次的體檢：完成／待決定／失敗各幾次、平均花多久。
   右欄該排程 header 用它回答「這支穩不穩」，不必一筆一筆點開看。 */
function getScheduleStats(item, sessionIvsByRun, n) {
  var take = n || 7;
  var runs = (item.runs || []).slice()
    .sort(function (a, b) { return getRunTs(b) - getRunTs(a); })
    .slice(0, take);
  var acc = { total: runs.length, success: 0, pending: 0, error: 0, rejected: 0, avgLabel: null };
  var secs = [];
  runs.forEach(function (r) {
    var res = getRunView(r, (sessionIvsByRun || {})[r.id]).result;
    acc[res] = (acc[res] || 0) + 1;
    var s = schDurationSec(r.duration);
    if (s != null) secs.push(s);
  });
  if (secs.length) {
    var avg = Math.round(secs.reduce(function (a, b) { return a + b; }, 0) / secs.length);
    acc.avgLabel = avg >= 60 ? Math.floor(avg / 60) + 'm ' + schPad(avg % 60) + 's' : avg + 's';
  }
  return acc;
}

/* 停用的排程仍可「手動執行一次」——停用只停掉自動觸發，不是把東西鎖死。
   拿最近一次成功的執行當樣板，與 buildRetryRun 同一套作法（mock 沒有引擎）。 */
function buildManualRun(item, actorName, atLabel) {
  var runs = (item.runs || []).slice().sort(function (a, b) { return getRunTs(b) - getRunTs(a); });
  var tpl = null;
  runs.forEach(function (r) { if (!tpl && r.result === 'success') tpl = r; });
  var steps = (tpl && tpl.steps) || (runs[0] && runs[0].steps) || [];
  return {
    id: item.id + '-manual-' + Date.now(),
    dateLabel: atLabel,
    startedAt: atLabel,
    finishedAt: atLabel,
    trigger: 'manual',
    triggeredBy: actorName,
    result: 'success',
    duration: (tpl && tpl.duration) || '—',
    totalSteps: steps.length,
    doneSteps: steps.length,
    interventions: [],
    steps: steps.map(function (s) { return Object.assign({}, s, { status: 'done' }); }),
    output: (tpl && tpl.output) || null,
  };
}

/* 停用是可逆開關，不是刪除 —— 沒有 enabled 欄位的排程一律視為啟用中 */
function isScheduleEnabled(item) { return !item || item.enabled !== false; }

/* ── 排程設定的變更層 ──
   基準排程來自 SCHEDULING_DATA（唯讀），本 session 的編輯以 patch 疊上去；
   新建的排程也走同一條路徑，建立與編輯才不會各有一套規則。
   patch 形如 { [itemId]: { name, cronLabel, lastChange } }。 */
function applyScheduleEdits(items, itemEdits) {
  var edits = itemEdits || {};
  return (items || []).map(function (item) {
    return edits[item.id] ? Object.assign({}, item, edits[item.id]) : item;
  });
}

/* ── Codify → 它掛在哪個排程 ──
   Schedule 的「不能重複掛」與 Skill 管理的「已掛排程」共用這一份，
   兩邊才不會講不一樣的話。含本 session 新建的排程與改過的名稱／時間 ——
   排程改名之後 Skill 管理那邊的徽章要跟著改，不然兩頁又會講不一樣的話。 */
function getSkillScheduleMap(personaKey, extraItems, itemEdits) {
  var list = applyScheduleEdits(
    (extraItems || []).concat((SCHEDULING_DATA && SCHEDULING_DATA[personaKey]) || []),
    itemEdits
  );
  var map = {};
  list.forEach(function (item) {
    if (item.skillId && !map[item.skillId]) {
      map[item.skillId] = { scheduleId: item.id, scheduleName: item.name, cronLabel: item.cronLabel };
    }
  });
  return map;
}

/* 全課待決定清單 —— Nav 紅點與待決定匯總共用同一份真相 */
function getPendingDecisions(items, sessionIvsByRun) {
  var out = [];
  (items || []).forEach(function (item) {
    (item.runs || []).forEach(function (run) {
      var view = getRunView(run, (sessionIvsByRun || {})[run.id]);
      if (view.activeStep) out.push({ item: item, run: run, step: view.activeStep });
    });
  });
  return out;
}

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
