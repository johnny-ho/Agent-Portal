/* ════════════════════════════════════════
   SKILL MARKETPLACE — 跨課流通的資料層

   見 brain/concepts/skill-marketplace.md（決策 A–H）

   定調：Marketplace 流動的是 Skill 的**定義文本**，不是執行權限。
   執行時用的仍是自己課的機台、自己課的 MCP 權限、自己課的簽核人。

   本檔與 personas.js 的 sopManagement 刻意分開 ——
   sopManagement 是「本課有什麼」，本檔是「全廠發布了什麼」，
   兩者的生命週期不同（決策 A：副本不訂閱，發布項不會跟著課內原件走）。
   ════════════════════════════════════════ */

const MP_SECTION_LABEL = {
  equipment: '設備課',
  process:   '製程課',
  mfg:       '製造課',
  it:        'IT',
};

/* ── 課級工具授權（決策 E 的比對基準）──────────────────

   跨課下載最常見的失敗原因是「這個工具我課沒有權限」，
   而那件事在下載前就該被擋下來，不是等到試跑才發現。

   真實系統裡這份會來自 Tool Gateway 的授權表；
   原型階段以課別直接列舉，重疊是正常的
   （製程課也會查 PM 與備料，只是查不到採購的到貨日）。
   ──────────────────────────────────────────────────── */
const MP_TOOL_GRANTS = {
  /* 讀取類工具在廠內是廣授的（跨域對照資料是日常），
     受限的是寫入類與各課的專業系統 ——
     設備課讀得到良率與 MES，但讀不到製程課的 SPC 管制圖工具。 */
  equipment: [
    'cmms.list_due_pm', 'cmms.get_maint_record', 'cmms.get_pm_spec',
    'eqp.get_sensor_trend', 'eqp.compare_fleet', 'eqp.get_uptime',
    'eqp.get_downtime', 'eqp.list_downtime', 'eqp.hold_station', 'eqp.stop_equipment',
    'fdc.list_alarms', 'fdc.get_alarm_detail',
    'inv.get_stock', 'inv.get_eta',
    'spc.get_recipe_stats',
    'yield.get_lot_detail', 'recipe.get_version',
    'mes.get_lot_history', 'mes.get_lot_due', 'mes.list_wip',
    'line.get_throughput',
    'case_center.create_case', 'case_center.list_open',
    'notify.send_to_section', 'notify.send_to_duty',
  ],
  process: [
    'spc.get_trend', 'spc.get_cpk', 'spc.list_ooc', 'spc.get_ooc_detail',
    'spc.query_daily', 'spc.get_recipe_stats',
    'yield.get_lot_detail',
    'mes.get_lot_history', 'mes.get_lot_due', 'mes.hold_lots',
    'recipe.get_version', 'metro.get_measurements',
    'cmms.list_due_pm', 'cmms.get_maint_record', 'inv.get_stock',
    'eqp.get_sensor_trend', 'eqp.get_uptime',
    'case_center.create_case', 'case_center.list_open',
    'notify.send_to_section',
  ],
  mfg: [
    'mes.list_wip', 'mes.get_changeover', 'mes.get_lot_due',
    'mes.export_daily', 'mes.log_downtime', 'mes.hold_lots',
    'line.get_throughput',
    'eqp.get_uptime', 'eqp.get_downtime', 'eqp.list_downtime',
    'cmms.list_due_pm',
    'case_center.create_case', 'case_center.list_open',
    'notify.send_to_section', 'notify.send_to_duty',
  ],
  it: [],
};

/* ════════════════════════════════════════
   發布項

   status: 'pending'（待課長簽准）| 'listed' | 'delisted'
   —— pending 與 delisted 為決策 G／H 的資料位；本階段只用 listed。

   originScope 是**降解析度後**的揭露（決策 E 連帶規則）：
   只給類別、台數與觸發條件。具體機台編號對別課無意義，
   且屬課內識別資訊，只出現在詳情頁並標明僅供參考。
   ════════════════════════════════════════ */
const MP_ITEMS = [

  /* ── Codify · 設備課 · 唯讀 · 中量採用 ── */
  {
    id: 'mp-001',
    tier: 'sop',
    title: 'PM 到期清單彙整',
    purpose: '每週一彙整未來 14 天到期的預防性保養項目，含備料齊備狀況。',
    description: '每週要做的排程準備工作，過去要在 CMMS 與備料系統之間手動對照，常常到了保養當天才發現備料沒到。\n\n流程大意：取未來 14 天到期的 PM 項目，接著逐項查備料庫存與到貨狀態，然後依「到期日 × 備料是否齊備」排出優先順序，最後套用清單格式輸出。\n\n備料未齊的項目一律排在最前面，不論到期日 —— 這一條是本課自己加的，因為催料需要提前期，等到期日到了才發現沒料就來不及了。\n\n全程只讀取資料、不異動任何系統。要調整 PM 排程仍須由人在 CMMS 操作。',
    publisher: { section: 'equipment', by: '吳志豪', at: '2026-07-15' },
    currentVersion: 'v1.2',
    status: 'listed',
    tags: ['PM', '保養', '每週'],
    hasWrite: false,
    tools: [
      { name: 'cmms.list_due_pm',      label: '取到期 PM 項目', system: 'CMMS',     mode: 'read' },
      { name: 'inv.get_stock',         label: '查備料庫存',     system: '倉儲系統', mode: 'read' },
      { name: 'cmms.get_maint_record', label: '查保養記錄',     system: 'CMMS',     mode: 'read' },
      { name: 'inv.get_eta',           label: '查採購到貨日',   system: '採購系統', mode: 'read' },
    ],
    plainSteps: [
      { num: 1, label: '取未來 14 天到期 PM', source: 'standard', component: 'PM 到期查詢',   version: 'v1.3', io: 'read',    system: 'CMMS',     tool: 'cmms.list_due_pm' },
      { num: 2, label: '逐項查備料庫存',       source: 'standard', component: '備料庫存查詢', version: 'v1.1', io: 'read',    system: '倉儲系統', tool: 'inv.get_stock' },
      { num: 3, label: '補查未齊項目的到貨日', source: 'standard', component: '到貨日查詢',   version: 'v1.0', io: 'read',    system: '採購系統', tool: 'inv.get_eta' },
      { num: 4, label: '計算優先順序',         source: 'custom',   io: 'compute', note: '本課自訂：備料未齊者不論到期日一律排最前，因為需要提早催料' },
      { num: 5, label: '套用清單格式',         source: 'standard', component: 'PM 清單格式',   version: 'v1.0', io: 'compute' },
    ],
    originScope: { equipmentClass: ['CMP'], area: ['ETC-2F', 'ETC-3F'], targetCount: 3, equipmentIds: ['E-101', 'E-102', 'E-205'], trigger: { type: 'schedule', at: '每週一 08:00' } },
    originAcceptNote: '情境試跑 4／4 行為符合約定（2026-07-29，張文凱）',
    versions: [
      { v: 'v1.2', at: '2026-07-15', by: '吳志豪', changelog: '補上採購到貨日查詢。原本只看庫存量，備料在途的項目會被誤判成未齊，每週都要人工再對一次。' },
      { v: 'v1.1', at: '2026-06-28', by: '吳志豪', changelog: '修正跨月時 14 天視窗算錯 —— 月底執行會漏掉下個月初到期的項目。' },
      { v: 'v1.0', at: '2026-06-10', by: '吳志豪', changelog: '首次發布。取未來 14 天到期的 PM 項目，逐項查備料庫存，依到期日與備料齊備狀況排序後輸出清單。全程唯讀。' },
    ],
    adoption: [
      { section: 'process', at: '2026-06-15', version: 'v1.0', outcome: 'production' },
      { section: 'mfg',     at: '2026-06-20', version: 'v1.0', outcome: 'production' },
      { section: 'process', at: '2026-07-02', version: 'v1.1', outcome: 'production' },
      { section: 'mfg',     at: '2026-07-18', version: 'v1.2', outcome: 'testing' },
      { section: 'process', at: '2026-07-20', version: 'v1.2', outcome: 'dropped' },
    ],
    adoptionExtra: { production: 5, testing: 2, dropped: 1 },   /* 其他廠區課別，原型不逐筆列 */
    reviews: [
      { section: 'process', by: '李佩玲', at: '2026-07-05', version: 'v1.1', text: '備料那步我們的倉儲系統欄位名不一樣，改了一行就通了。其餘直接沿用。' },
      { section: 'mfg',     by: '陳建宏', at: '2026-06-25', version: 'v1.0', text: '「備料未齊排最前」這條我們一開始沒照做，跑兩週之後改回來了 —— 設備課是對的。' },
    ],
    derivedFrom: null,
  },

  /* ── Codify · 製造課 · 含寫入 · 棄用多於生效（決策 D 要抓的就是這種） ── */
  {
    id: 'mp-002',
    tier: 'sop',
    title: '停機通報單自動生成',
    purpose: '線體停機超過通報門檻時，彙整影響範圍並產生通報單送出。',
    description: '線體停機達 30 分鐘就要通報，但通報單要填的東西散在三個系統裡，值班的人一邊處理停機一邊填單，常常填到一半就被叫走。\n\n流程大意：取停機事件與預計時長，判定是否達通報門檻，接著查受影響的 WIP 與待交批號，然後彙整成通報單格式，最後送出通報。\n\n最後一步會實際送出通報，屬於寫入動作，執行時必須有人確認才會往下。',
    publisher: { section: 'mfg', by: '陳建宏', at: '2026-08-05' },
    currentVersion: 'v2.1',
    status: 'listed',
    tags: ['停機', '通報', '異常'],
    hasWrite: true,
    tools: [
      { name: 'eqp.get_downtime',      label: '查停機事件',   system: '設備監控', mode: 'read'  },
      { name: 'mes.list_wip',          label: '查受影響 WIP', system: 'MES',      mode: 'read'  },
      { name: 'mes.get_lot_due',       label: '查待交批號',   system: 'MES',      mode: 'read'  },
      { name: 'case_center.create_case', label: '開立通報單', system: 'CaseCenter', mode: 'write' },
      { name: 'notify.send_to_duty',   label: '通知值班',     system: '通知服務', mode: 'write' },
    ],
    plainSteps: [
      { num: 1, label: '取停機事件與預計時長', source: 'standard', component: '停機事件查詢', version: 'v2.0', io: 'read',  system: '設備監控', tool: 'eqp.get_downtime' },
      { num: 2, label: '判定是否達通報門檻',   source: 'custom',   io: 'decision', note: '本課自訂：30 分鐘。各課門檻不同，下載後要改這一步' },
      { num: 3, label: '查受影響 WIP 與待交批號', source: 'standard', component: 'WIP 影響查詢', version: 'v1.4', io: 'read', system: 'MES', tool: 'mes.list_wip' },
      { num: 4, label: '彙整通報單內容',       source: 'standard', component: '通報單格式',   version: 'v2.1', io: 'compute' },
      { num: 5, label: '送出通報單',           source: 'standard', component: '通報單開立',   version: 'v1.2', io: 'write', system: 'CaseCenter', tool: 'case_center.create_case', needsConfirm: true },
      { num: 6, label: '通知值班人員',         source: 'standard', component: '值班通知',     version: 'v1.0', io: 'write', system: '通知服務', tool: 'notify.send_to_duty', needsConfirm: true },
    ],
    originScope: { equipmentClass: ['LINE'], area: ['MFG-1F'], targetCount: 4, equipmentIds: ['LINE-1', 'LINE-2', 'LINE-3', 'LINE-4'], trigger: { type: 'threshold', metric: '停機時長', op: '>', value: '30 分鐘' } },
    originAcceptNote: '情境試跑 5／5 行為符合約定、Pilot Run 3 次（2026-08-01，陳建宏）',
    versions: [
      { v: 'v2.1', at: '2026-08-05', by: '陳建宏', changelog: '同一天重複執行時改為提示上次結果，不再重複開單。之前一次停機開了三張單。' },
      { v: 'v2.0', at: '2026-07-12', by: '陳建宏', changelog: '通報門檻從寫死 30 分鐘改成可調參數 —— 各課門檻不同，這是被最多課反映的一點。' },
      { v: 'v1.0', at: '2026-05-30', by: '陳建宏', changelog: '首次發布。停機達門檻時彙整影響範圍並開立通報單。' },
    ],
    adoption: [
      { section: 'equipment', at: '2026-06-05', version: 'v1.0', outcome: 'dropped' },
      { section: 'process',   at: '2026-06-08', version: 'v1.0', outcome: 'dropped' },
      { section: 'equipment', at: '2026-07-20', version: 'v2.0', outcome: 'production' },
      { section: 'process',   at: '2026-08-06', version: 'v2.1', outcome: 'testing' },
    ],
    adoptionExtra: { production: 2, testing: 1, dropped: 2 },
    reviews: [
      { section: 'equipment', by: '張文凱', at: '2026-07-28', version: 'v2.0', text: 'v1.0 我們用兩週就停了 —— 門檻寫死 30 分鐘，設備課的機台停 30 分鐘太常見，通報單一天開十幾張沒人看。v2.0 改成可調之後才真的能用。' },
    ],
    derivedFrom: null,
  },

  /* ── Codify · 製程課 · 唯讀 ── */
  {
    id: 'mp-003',
    tier: 'sop',
    title: 'SPC OOC 每日彙整',
    purpose: '每日 07:30 彙整前一日所有 OOC 事件，依站點與嚴重度排序。',
    description: '每天早會前要知道昨天有哪些 SPC 超規，過去是各站自己看自己的，沒有人有全課的視角。\n\n流程大意：取前一日全部 OOC 事件，逐筆查明細與所屬站點，計算連續超規的批次數，再依「連續次數 × 偏離幅度」排序輸出。\n\n連續超規優先於單次大偏離 —— 單次大偏離常常是量測問題，連續才是製程真的在漂。這一條是本課排序邏輯的核心。\n\n全程唯讀。',
    publisher: { section: 'process', by: '黃怡君', at: '2026-07-22' },
    currentVersion: 'v1.1',
    status: 'listed',
    tags: ['SPC', 'OOC', '每日'],
    hasWrite: false,
    tools: [
      { name: 'spc.list_ooc',      label: '取 OOC 清單',  system: 'SPC', mode: 'read' },
      { name: 'spc.get_ooc_detail', label: '查 OOC 明細', system: 'SPC', mode: 'read' },
      { name: 'spc.get_trend',     label: '查管制圖趨勢', system: 'SPC', mode: 'read' },
    ],
    plainSteps: [
      { num: 1, label: '取前一日 OOC 清單',   source: 'standard', component: 'OOC 查詢',   version: 'v1.2', io: 'read', system: 'SPC', tool: 'spc.list_ooc' },
      { num: 2, label: '逐筆查明細與站點',     source: 'standard', component: 'OOC 明細',   version: 'v1.0', io: 'read', system: 'SPC', tool: 'spc.get_ooc_detail' },
      { num: 3, label: '計算連續超規批次數',   source: 'custom',   io: 'compute', note: '本課自訂：連續超規優先於單次大偏離 —— 單次多為量測問題' },
      { num: 4, label: '排序並套用彙整格式',   source: 'standard', component: 'OOC 日報格式', version: 'v1.1', io: 'compute' },
    ],
    originScope: { equipmentClass: ['CMP', 'ETCH'], area: ['ETC-2F', 'ETC-3F'], targetCount: 5, equipmentIds: ['R-501', 'R-512', 'R-520', 'R-533', 'R-540'], trigger: { type: 'schedule', at: '每日 07:30' } },
    originAcceptNote: '情境試跑 4／4 行為符合約定（2026-07-20，黃怡君）',
    versions: [
      { v: 'v1.1', at: '2026-07-22', by: '黃怡君', changelog: '來源回空集合時改為明確標示「昨日無 OOC」，之前會輸出一份空表看不出是真的沒有還是沒查到。' },
      { v: 'v1.0', at: '2026-07-01', by: '黃怡君', changelog: '首次發布。每日彙整前一日 OOC 事件，依連續超規次數與偏離幅度排序。' },
    ],
    adoption: [
      { section: 'mfg', at: '2026-07-25', version: 'v1.1', outcome: 'dropped' },
    ],
    adoptionExtra: { production: 3, testing: 1, dropped: 0 },
    reviews: [],
    derivedFrom: null,
  },

  /* ── Codify · 製造課 · 最高採用（交接報告，戰略切入點） ── */
  {
    id: 'mp-004',
    tier: 'sop',
    title: '當班交接報告',
    purpose: '每班結束前彙整本班產出、異常與待交接事項，產出交接報告。',
    description: '交接一直是口頭加白板，接班的人常常要重問一輪，出事了也追不到當時誰講過什麼。\n\n流程大意：取本班稼動與產出數據，接著取本班停機與異常事件，然後查未結案的待辦與 Priority Lot，最後依交接報告格式彙整輸出。\n\n報告產出後會發到佈告欄，接班的人一進系統就看得到。\n\n全程唯讀，不異動任何系統。',
    publisher: { section: 'mfg', by: '林淑芬', at: '2026-06-02' },
    currentVersion: 'v3.0',
    status: 'listed',
    tags: ['交接', '每班', '報告'],
    hasWrite: false,
    tools: [
      { name: 'eqp.get_uptime',        label: '查稼動率',       system: '設備監控',   mode: 'read' },
      { name: 'line.get_throughput',   label: '查產出',         system: 'MES',        mode: 'read' },
      { name: 'eqp.list_downtime',     label: '查停機事件',     system: '設備監控',   mode: 'read' },
      { name: 'case_center.list_open', label: '查未結案工單',   system: 'CaseCenter', mode: 'read' },
      { name: 'mes.get_lot_due',       label: '查 Priority Lot', system: 'MES',       mode: 'read' },
    ],
    plainSteps: [
      { num: 1, label: '取本班稼動與產出',       source: 'standard', component: '班別產出查詢', version: 'v2.1', io: 'read', system: 'MES',        tool: 'line.get_throughput' },
      { num: 2, label: '取本班停機與異常事件',   source: 'standard', component: '停機清單',     version: 'v1.5', io: 'read', system: '設備監控',   tool: 'eqp.list_downtime' },
      { num: 3, label: '查未結案工單與 Priority Lot', source: 'standard', component: '待辦查詢', version: 'v1.2', io: 'read', system: 'CaseCenter', tool: 'case_center.list_open' },
      { num: 4, label: '計算稼動率（排除 PM 時間）', source: 'custom', io: 'compute', note: '本課自訂：PM 時間不計入分母，否則保養日的稼動率會失真' },
      { num: 5, label: '套用交接報告格式',       source: 'standard', component: '交接報告格式', version: 'v3.0', io: 'compute' },
    ],
    originScope: { equipmentClass: ['LINE'], area: ['MFG-1F', 'MFG-2F'], targetCount: 6, equipmentIds: ['LINE-1', 'LINE-2', 'LINE-3', 'LINE-4', 'LINE-5', 'LINE-6'], trigger: { type: 'schedule', at: '每班結束前 30 分鐘' } },
    originAcceptNote: '情境試跑 4／4 行為符合約定（2026-05-28，林淑芬）',
    versions: [
      { v: 'v3.0', at: '2026-06-02', by: '林淑芬', changelog: '待交接事項改為必列未結案工單與 Priority Lot。之前只有數字沒有待辦，接班的人還是要自己去翻。' },
      { v: 'v2.0', at: '2026-04-18', by: '林淑芬', changelog: '稼動率計算排除 PM 時間 —— 保養日的稼動率原本會掉到 60%，看起來像出事。' },
      { v: 'v1.0', at: '2026-03-05', by: '林淑芬', changelog: '首次發布。每班結束前彙整產出、異常與待交接事項。' },
    ],
    adoption: [
      { section: 'equipment', at: '2026-03-20', version: 'v1.0', outcome: 'production' },
      { section: 'process',   at: '2026-04-25', version: 'v2.0', outcome: 'production' },
      { section: 'equipment', at: '2026-06-10', version: 'v3.0', outcome: 'production' },
    ],
    adoptionExtra: { production: 11, testing: 3, dropped: 1 },
    reviews: [
      { section: 'equipment', by: '吳志豪', at: '2026-06-18', version: 'v3.0', text: '整個課的交接時間從 20 分鐘掉到 5 分鐘。稼動率排除 PM 那一條建議所有課都照做。' },
      { section: 'process',   by: '黃怡君', at: '2026-05-02', version: 'v2.0', text: '製程課沒有線體，我們把第 1 步換成站點產出就能用。步驟結構不用動。' },
    ],
    derivedFrom: null,
  },

  /* ── Skill · 設備課 ── */
  {
    id: 'mp-005',
    tier: 'guided',
    title: '換件後性能異常研判',
    purpose: '換件完成後試磨結果不如預期時，研判是安裝、備料還是機台本身的問題。',
    description: '# 換件後性能異常研判\n\n## 什麼時候用這份\n研磨頭換件完成、試磨片跑完，但研磨率或均勻性不符規格時使用。\n\n## 什麼時候不用這份\n換件過程中就發現異常（鎖不緊、漏水）的，直接回到換件程序處理。\n\n## 可以動用的工具\n- `cmms.get_maint_record(eqp_id)` — 換件記錄：扭矩值、O-ring 安裝確認項\n- `spc.get_recipe_stats(recipe_id)` — 換件後的研磨率與均勻性\n- `eqp.get_sensor_trend(eqp_id, hours)` — 換件前的機台基線，用來比對漂移\n\n全部唯讀。重新拆裝、退料、報修都要人自己執行。\n\n## 研判步驟\n順序不能顛倒：**安裝 → 備料 → 機台**。這個順序是照「發生機率 × 修正成本」排的，先查機率高又好修的。\n\n1. **先確認安裝** — 扭矩值不在規格內，或 O-ring 確認項沒勾 → 就是安裝問題，到此為止\n2. **安裝無誤才看備料** — 同批多台都異常 → 判為備料問題，建議整批攔下\n3. **前兩者都排除才看機台** — 取換件前 7 天基線，看是換件前就在漂還是換件後才變\n\n## 回答一定要包含\n1. 結論落在三層的哪一層，以及**前面幾層是怎麼被排除的**\n2. 每個數字的來源\n3. 建議動作與執行位置\n4. 責任聲明：這是研判建議，不是核准流程\n\n「前面幾層怎麼被排除」是這份最容易漏的一項。只給結論不給排除過程，下一個人得整段重查。\n\n## 注意事項\n本指引產出的是**研判建議**，責任仍在執行者。',
    publisher: { section: 'equipment', by: '吳志豪', at: '2026-08-01' },
    currentVersion: 'v1.0',
    status: 'listed',
    tags: ['換件', 'CMP', '研判'],
    hasWrite: false,
    tools: [
      { name: 'cmms.get_maint_record', label: '查換件記錄',   system: 'CMMS',     mode: 'read' },
      { name: 'eqp.get_sensor_trend',  label: '查感測器趨勢', system: '設備監控', mode: 'read' },
      { name: 'spc.get_recipe_stats',  label: '查配方統計',   system: 'SPC',      mode: 'read' },
    ],
    plainSteps: [],
    originScope: { equipmentClass: ['CMP'], area: ['ETC-3F'], targetCount: 3, equipmentIds: ['E-101', 'E-203', 'E-308'], trigger: { type: 'manual' } },
    originAcceptNote: '驗收 5 條條件全數確認、3 個提問情境各跑 5 次（2026-07-26，吳志豪）',
    versions: [
      { v: 'v1.0', at: '2026-08-01', by: '吳志豪', changelog: '首次發布。換件後性能不如預期時，依「安裝 → 備料 → 機台」的順序逐層排除並說明排除依據。' },
    ],
    adoption: [
      { section: 'process', at: '2026-08-08', version: 'v1.0', outcome: 'testing' },
    ],
    adoptionExtra: { production: 1, testing: 1, dropped: 0 },
    reviews: [],
    derivedFrom: null,
  },

  /* ── Skill · 製程課 · 高採用 ── */
  {
    id: 'mp-006',
    tier: 'guided',
    title: '良率異常根因研判',
    purpose: '單批或連續批良率跌破管制下限時，研判是製程、材料還是量測問題。',
    description: '# 良率異常根因研判\n\n## 什麼時候用這份\n單批良率低於管制下限，或連續 3 批呈下滑趨勢時使用。\n\n## 什麼時候不用這份\n已知是設備停機或人為操作失誤造成的，直接走既有異常處理流程。\n產線層級的產出落後不適用 —— 那要看稼動與排程，不是配方與材料。\n\n## 可以動用的工具\n- `yield.get_lot_detail(lot_id)` — 批號良率明細與量測原始值\n- `mes.get_lot_history(lot_id)` — 批號履歷：走過哪些站、用哪一批原料\n- `recipe.get_version(station)` — 配方版本異動紀錄\n\n全部唯讀。任何製程參數調整都必須走 DCR。\n\n## 研判步驟\n順序是**量測 → 材料 → 製程**。量測問題佔比不低又最好排除，放第一個可以省掉大量無謂的製程排查。\n\n1. **先確認不是量測問題** — 重測後回到規格內 → 量測失準，到此為止。沒有重測值 → 建議先重測，明說在重測之前不下製程結論\n2. **確認不是量測問題後看材料** — 材料造成的良率變化通常有**明確的時間斷點**；良率是緩降而非斷點 → 材料的可能性降低\n3. **材料無異動才看製程** — 配方版本異動、SPC 趨勢、設備參數漂移疊在同一條時間軸上\n\n## 回答一定要包含\n1. 結論落在三層的哪一層，以及前面幾層**憑什麼被排除**\n2. 量測原始值與重測值（若沒重測，要明說這一步還沒做）\n3. 原料批號切換點的時間，與良率變化時間的對應關係\n4. 建議動作：要重測、要攔批、還是要開 DCR\n5. 責任聲明：這是研判建議，不是核准流程\n\n## 停下來不要硬判的情況\n- 只有一批數據 → 說明樣本不足以判斷趨勢\n- 量測與製程數據互相矛盾 → 明說矛盾在哪，不要挑一個順眼的下結論',
    publisher: { section: 'process', by: '黃怡君', at: '2026-07-30' },
    currentVersion: 'v1.3',
    status: 'listed',
    tags: ['良率', '根因', '研判'],
    hasWrite: false,
    tools: [
      { name: 'yield.get_lot_detail', label: '查批號良率明細', system: '良率分析',    mode: 'read' },
      { name: 'mes.get_lot_history',  label: '查批號履歷',     system: 'MES',         mode: 'read' },
      { name: 'recipe.get_version',   label: '查配方版本紀錄', system: 'Recipe 管理', mode: 'read' },
    ],
    plainSteps: [],
    originScope: { equipmentClass: ['CMP', 'ETCH'], area: ['ETC-3F'], targetCount: 4, equipmentIds: ['R-501', 'R-512', 'R-533', 'R-540'], trigger: { type: 'threshold', metric: '良率', op: '<', value: '管制下限' } },
    originAcceptNote: '驗收 5 條條件全數確認、3 個提問情境各跑 5 次（2026-07-28，黃怡君）',
    versions: [
      { v: 'v1.3', at: '2026-07-30', by: '黃怡君', changelog: '把「良率門檻」從指引正文裡的數字改成「管制下限」—— 各課的下限不同，寫死會讓別課套錯。' },
      { v: 'v1.2', at: '2026-07-10', by: '黃怡君', changelog: '補上「量測與製程數據互相矛盾時明說矛盾在哪」這條，之前 AI 會挑一個順眼的下結論。' },
      { v: 'v1.0', at: '2026-06-20', by: '黃怡君', changelog: '首次發布。依「量測 → 材料 → 製程」的順序逐層排除，並要求寫出每一層的排除依據。' },
    ],
    adoption: [
      { section: 'equipment', at: '2026-06-28', version: 'v1.0', outcome: 'production' },
      { section: 'mfg',       at: '2026-07-12', version: 'v1.2', outcome: 'production' },
      { section: 'equipment', at: '2026-08-02', version: 'v1.3', outcome: 'testing' },
    ],
    adoptionExtra: { production: 4, testing: 2, dropped: 1 },
    reviews: [
      { section: 'equipment', by: '張文凱', at: '2026-07-08', version: 'v1.0', text: '「重測之前不下製程結論」這條救了我們好幾次。設備課照用沒改。' },
    ],
    derivedFrom: null,
  },

  /* ── Skill · 設備課 · 衍生自別課（決策 A 的來源鏈） ── */
  {
    id: 'mp-007',
    tier: 'guided',
    title: '機台異音與震動研判',
    purpose: '巡檢聽到異音或震動偏高時，研判該立即停機還是可以觀察到下次 PM。',
    description: '# 機台異音與震動研判\n\n## 什麼時候用這份\n巡檢時聽到異音、或震動感測值高於平常但尚未觸發警報時使用。\n\n## 什麼時候不用這份\n已經觸發震動警報的，直接走 FDC 異常快速反應流程。\n\n## 研判步驟\n\n1. **先看變化形態** — 突然跳高（數小時內跨越基線 1.5 倍以上）→ 傾向軸承損傷或鎖固鬆動，急迫；緩慢爬升 → 傾向正常磨耗，可排入 PM\n2. **比對同型機台** — 同型多台同期間一起升 → 多半是廠務端（電源、氣源、冷卻），要往廠務通報；只有這一台 → 才繼續往單機方向查\n3. **對照上次 PM** — 剛做完 PM 就出現的震動，優先懷疑組裝而不是磨耗\n\n## 停機判定門檻\n判定結果一定要對照下面三段，並在回答裡寫出落在哪一段：\n- 震動值 **> 基線 2 倍**，或伴隨異音明顯改變 → **建議立即停機**\n- 震動值在 **基線 1.3–2 倍**之間且趨勢平緩 → 可觀察至下次 PM，但須加密巡檢\n- 震動值 **< 基線 1.3 倍** → 記錄即可\n\n## 停下來不要硬判的情況\n- 取不到基線（新機、剛換件）→ 說明無基線可比，改以絕對值與同型機台判斷，並標明把握度較低\n- 感測值正常但人耳聽到異音 → 不要因為數據沒事就回「無異常」，據實說明數據與現場觀察不一致\n\n## 注意事項\n本指引產出的是**建議**，停機決定權在當班工程師與課長。',
    publisher: { section: 'equipment', by: '張文凱', at: '2026-08-12' },
    currentVersion: 'v1.1',
    status: 'listed',
    tags: ['異音', '震動', '研判'],
    hasWrite: false,
    tools: [
      { name: 'eqp.get_sensor_trend',  label: '查感測器趨勢', system: '設備監控', mode: 'read' },
      { name: 'eqp.compare_fleet',     label: '比對同型機台', system: '設備監控', mode: 'read' },
      { name: 'cmms.get_maint_record', label: '查保養記錄',   system: 'CMMS',     mode: 'read' },
    ],
    plainSteps: [],
    originScope: { equipmentClass: ['CMP'], area: ['ETC-2F', 'ETC-3F'], targetCount: 4, equipmentIds: ['E-101', 'E-102', 'E-203', 'E-205'], trigger: { type: 'manual' } },
    originAcceptNote: '驗收 5 條條件全數確認、3 個提問情境各跑 5 次（2026-08-08，張文凱）',
    versions: [
      { v: 'v1.1', at: '2026-08-12', by: '張文凱', changelog: '補上「感測值正常但人耳聽到異音」的處理 —— 原版遇到這種會直接回「無異常」，跟現場觀察打架。' },
      { v: 'v1.0', at: '2026-08-06', by: '張文凱', changelog: '衍生自製造課《線體異音研判》v2.0，改為 CMP 機台的震動基線與三段停機門檻。' },
    ],
    adoption: [],
    adoptionExtra: { production: 0, testing: 2, dropped: 0 },
    reviews: [],
    derivedFrom: { section: 'mfg', title: '線體異音研判', version: 'v2.0' },
  },
];

/* ════════════════════════════════════════
   Helpers
   ════════════════════════════════════════ */

function mpSectionName(key) { return MP_SECTION_LABEL[key] || key; }

/* 決策 E：不只揭露工具，還要當場比對本課權限。
   權限落差是跨課最常見的失敗原因，擋在下載前比下載後才發現有價值。 */
function mpToolCheck(personaKey, tools) {
  var grants = MP_TOOL_GRANTS[personaKey] || [];
  var list = tools || [];
  var ok = [], missing = [];
  list.forEach(function(t) {
    (grants.indexOf(t.name) !== -1 ? ok : missing).push(t);
  });
  return { ok: ok, missing: missing, total: list.length };
}

/* 決策 D：三個行為數字，不做五星。
   outcome 由下載課的 stage 推導（本階段以 mock 的 adoption[] 代表），
   不另存評分 —— 維持單一真相。 */
function mpAdoption(item) {
  var extra = item.adoptionExtra || {};
  var acc = { downloads: 0, production: 0, testing: 0, dropped: 0 };
  (item.adoption || []).forEach(function(a) {
    acc.downloads += 1;
    if (acc[a.outcome] !== undefined) acc[a.outcome] += 1;
  });
  ['production', 'testing', 'dropped'].forEach(function(k) {
    var n = extra[k] || 0;
    acc[k] += n;
    acc.downloads += n;
  });
  return acc;
}

/* 本課在這一份上的下載紀錄（最新一筆）。有紀錄就不該再點下載。 */
function mpMyDownload(item, personaKey) {
  var mine = (item.adoption || []).filter(function(a) { return a.section === personaKey; });
  return mine.length ? mine[mine.length - 1] : null;
}

function mpListed(personaKey) {
  return MP_ITEMS.filter(function(it) { return it.status === 'listed'; });
}

/* 決策 B：下載一律落 Draft，且**不做自動 scope remap**。
   scope 標 unset、knowledgeRefs 清空、驗收紀錄不跟著跨課 ——
   系統猜錯比留白危險，猜出來的東西會讓人以為已經設好了。 */
function mpToSkill(item, personaKey, userName, today) {
  var ver = item.currentVersion;
  return {
    id: 'sm-mp-' + item.id + '-' + Date.now(),
    title: item.title,
    purpose: item.purpose,
    description: item.description,
    sourceKM: 'Marketplace · ' + mpSectionName(item.publisher.section),
    importedAt: today,
    importedBy: userName,
    stage: 'draft',
    tags: (item.tags || []).slice(),
    tier: item.tier,
    tools: (item.tools || []).map(function(t) { return Object.assign({}, t); }),
    hasWrite: !!item.hasWrite,
    plainSteps: (item.plainSteps || []).map(function(s) { return Object.assign({}, s); }),
    graph: (item.plainSteps || []).length
      ? { edges: buildLinearEdges(item.plainSteps) }
      : null,
    /* unset 是「尚未設定」的旗標，不是「全部」——
       空陣列在 matchScopeTargets 裡代表「該類別全部」，語意剛好相反。 */
    scope: { equipmentClass: [], equipmentIds: [], area: [], trigger: null, unset: true },
    knowledgeRefs: [],
    consumedBy: { calledByAgent: false, scheduleId: null },
    acceptance: { criteria: [], probes: [] },
    origin: {
      marketplaceId: item.id,
      version: ver,
      fromSection: mpSectionName(item.publisher.section),
      fromSectionKey: item.publisher.section,
      at: today,
      originAcceptNote: item.originAcceptNote || null,
      originScope: item.originScope || null,
      delisted: null,
    },
  };
}

function buildLinearEdges(steps) {
  var edges = [{ from: 'start', to: steps[0].num }];
  for (var i = 0; i < steps.length - 1; i++) {
    edges.push({ from: steps[i].num, to: steps[i + 1].num });
  }
  edges.push({ from: steps[steps.length - 1].num, to: 'end' });
  return edges;
}

/* 下載後必須由本課重新設定的三項（決策 B）。
   補完就消失 —— 這是進度不是狀態。 */
function mpPendingSetup(skill) {
  if (!skill || !skill.origin) return [];
  var out = [];
  if (!skill.scope || skill.scope.unset) {
    out.push({ key: 'scope', label: '適用範圍', note: '尚未設定', target: 'sd-scope' });
  }
  if ((skill.knowledgeRefs || []).length === 0) {
    out.push({ key: 'knowledge', label: '引用知識', note: '原引用的是' + skill.origin.fromSection + '的文件，已失效', target: 'sd-desc' });
  }
  if (skill.tier === 'sop') {
    if (!skill.scenarioRun) out.push({ key: 'test', label: '情境試跑', note: '尚未在本課跑過', target: 'sd-test' });
  } else {
    if (!skill.acceptRun) out.push({ key: 'test', label: '驗收', note: '尚未在本課跑過', target: 'sd-test' });
  }
  return out;
}
