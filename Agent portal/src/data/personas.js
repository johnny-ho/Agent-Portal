/* ════════════════════════════════════════
   PERSONA DATA
   ════════════════════════════════════════ */

/* ────────────────────────────────────────
   設備／站點主檔（適用範圍的勾選來源）

   Skill 的「適用範圍」是結構化條件（機台類別／指定機台／區域／觸發條件），
   不是自由文字 —— 讓系統能直接算出「目前符合哪幾台」，
   而不是叫 AI 讀一句「全課所有設備」自己猜。
   見 brain/concepts/agent-skill-tiering.md「適用範圍必須結構化」。
   ──────────────────────────────────────── */
const EQUIPMENT_MASTER = {
  equipment: [
    { id: 'E-101', class: 'CMP',     area: 'ETC-3F', status: 'run'  },
    { id: 'E-102', class: 'CMP',     area: 'ETC-3F', status: 'run'  },
    { id: 'E-203', class: 'CMP',     area: 'ETC-3F', status: 'pm'   },
    { id: 'E-205', class: 'CMP',     area: 'ETC-2F', status: 'run'  },
    { id: 'E-301', class: 'ETCH',    area: 'ETC-2F', status: 'run'  },
    { id: 'E-308', class: 'ETCH',    area: 'ETC-2F', status: 'alarm'},
    { id: 'E-312', class: 'ETCH',    area: 'ETC-2F', status: 'run'  },
    { id: 'E-401', class: 'FURNACE', area: 'ETC-4F', status: 'run'  },
    { id: 'E-402', class: 'FURNACE', area: 'ETC-4F', status: 'run'  },
    { id: 'E-405', class: 'FURNACE', area: 'ETC-4F', status: 'idle' },
    { id: 'E-501', class: 'CVD',     area: 'ETC-3F', status: 'run'  },
    { id: 'E-502', class: 'CVD',     area: 'ETC-3F', status: 'alarm'},
    { id: 'E-601', class: 'PVD',     area: 'ETC-4F', status: 'run'  },
    { id: 'E-602', class: 'PVD',     area: 'ETC-4F', status: 'idle' },
    { id: 'E-701', class: 'CLEAN',   area: 'ETC-2F', status: 'run'  },
    { id: 'E-702', class: 'CLEAN',   area: 'ETC-2F', status: 'run'  },
  ],
  process: [
    { id: 'R-501', class: 'CMP',  area: 'ETC-3F', status: 'run'  },
    { id: 'R-512', class: 'CMP',  area: 'ETC-3F', status: 'watch'},
    { id: 'R-520', class: 'CMP',  area: 'ETC-3F', status: 'run'  },
    { id: 'R-533', class: 'ETCH', area: 'ETC-2F', status: 'run'  },
    { id: 'R-540', class: 'ETCH', area: 'ETC-2F', status: 'watch'},
    { id: 'R-551', class: 'THIN', area: 'ETC-4F', status: 'run'  },
    { id: 'R-560', class: 'THIN', area: 'ETC-4F', status: 'run'  },
    { id: 'R-572', class: 'DIFF', area: 'ETC-4F', status: 'run'  },
  ],
  mfg: [
    { id: 'LINE-1', class: 'LINE', area: 'MFG-1F', status: 'run'  },
    { id: 'LINE-2', class: 'LINE', area: 'MFG-1F', status: 'run'  },
    { id: 'LINE-3', class: 'LINE', area: 'MFG-2F', status: 'watch'},
    { id: 'STK-01', class: 'STOCKER', area: 'MFG-1F', status: 'run' },
    { id: 'STK-02', class: 'STOCKER', area: 'MFG-2F', status: 'run' },
    { id: 'AGV-A',  class: 'AGV',  area: 'MFG-1F', status: 'run'  },
  ],
};

/* 依結構化適用範圍算出符合的機台（適用範圍勾選畫面即時回饋「目前符合 N 台」用） */
function matchScopeTargets(personaKey, scope) {
  var master = EQUIPMENT_MASTER[personaKey] || [];
  if (!scope) return master.slice();
  var ids     = scope.equipmentIds || [];
  var classes = scope.equipmentClass || [];
  var areas   = scope.area || [];
  return master.filter(function(eq) {
    if (classes.length > 0 && classes.indexOf(eq.class) === -1) return false;
    if (areas.length   > 0 && areas.indexOf(eq.area)   === -1) return false;
    /* 指定機台留空 = 該類別／區域全部 */
    if (ids.length     > 0 && ids.indexOf(eq.id)       === -1) return false;
    return true;
  });
}

/* ────────────────────────────────────────
   TOOL_PROBE —— 節點試打的介面定義（2026-07-27）

   PO：「dry run 可以讓使用者選擇試打資料訪問的 api / node，這樣就不用猜。」
   Flow 走 codify graph，每個節點是一段程式碼；出事的地方多半不是邏輯，
   是**介面**：欄位改名、型別不符、極值沒考慮。所以每個工具要有
   「吃什麼參數、吐什麼欄位」的定義，人才有辦法單獨打一個節點看它回什麼。

   fields[].usedBy 標「下游哪一步會用到這個欄位」——
   沒有下游用到的欄位壞掉不痛，會痛的是那幾個。
   write: true 的工具**永遠不真的送出**，只算得出「會送出什麼」。
   ──────────────────────────────────────── */
const TOOL_PROBE = {
  /* ── 設備／CMMS ── */
  'cmms.list_due_pm': {
    params: [{ key: 'window_days', label: '往後幾天', value: '14' }, { key: 'area', label: '區域', value: 'ETC-2F,ETC-3F' }],
    rows: 11,
    fields: [
      { name: 'pm_id',    type: 'string', note: '保養項目編號' },
      { name: 'eqp_id',   type: 'string', note: '機台', usedBy: '步驟 2 查備料' },
      { name: 'due_date', type: 'date',   note: '到期日',   usedBy: '步驟 3 排序' },
      { name: 'part_no',  type: 'string', note: '備料料號', usedBy: '步驟 2 查備料' },
    ],
    sample: 'PM-2607-031 · E-203 · 2026-07-25 · PT-9931',
  },
  'inv.get_stock': {
    params: [{ key: 'part_no', label: '料號', value: 'PT-9931' }],
    rows: 11,
    fields: [
      { name: 'part_no',   type: 'string', note: '料號' },
      { name: 'qty_on_hand', type: 'number', note: '現有庫存', usedBy: '步驟 3 判定備料是否齊備' },
      { name: 'qty_required', type: 'number', note: '需求量',  usedBy: '步驟 3 判定備料是否齊備' },
      { name: 'eta_date',  type: 'date',   note: '預計到貨日（可為 null）', usedBy: '步驟 3 排序' },
    ],
    sample: 'PT-9931 · 現有 0 · 需求 2 · ETA 2026-07-24',
  },
  'eqp.get_uptime':      { params: [{ key: 'shift', label: '班別', value: '日班' }], rows: 12, fields: [
    { name: 'eqp_id', type: 'string', note: '機台' },
    { name: 'run_minutes', type: 'number', note: '稼動分鐘', usedBy: '計算稼動率' },
    { name: 'pm_minutes',  type: 'number', note: 'PM 分鐘 · 需從分母排除', usedBy: '計算稼動率' },
  ], sample: 'E-101 · run 421 · pm 60' },
  'eqp.get_sensor_trend': { params: [{ key: 'eqp_id', label: '機台', value: 'E-101' }, { key: 'hours', label: '回看時數', value: '24' }], rows: 288, fields: [
    { name: 'ts', type: 'datetime', note: '時間戳' },
    { name: 'value', type: 'number', note: '感測值' },
  ], sample: '2026-07-27 07:00 · 0.071' },
  'eqp.get_downtime':    { params: [{ key: 'line', label: '線別', value: 'LINE-3' }], rows: 1, fields: [
    { name: 'start_ts', type: 'datetime', note: '停機起始' },
    { name: 'expect_hours', type: 'number', note: '預計時長', usedBy: '判定是否達通報門檻' },
    { name: 'reason_code', type: 'string', note: '停機原因代碼（可為 null）' },
  ], sample: '2026-07-27 13:00 · 1.8 h · null' },
  'eqp.list_downtime':   { params: [{ key: 'days', label: '回看天數', value: '7' }], rows: 9, fields: [
    { name: 'eqp_id', type: 'string', note: '機台' }, { name: 'hours', type: 'number', note: '停機時數' },
  ], sample: 'E-308 · 3.2' },
  'eqp.compare_fleet':   { params: [{ key: 'eqp_class', label: '機台類別', value: 'CMP' }], rows: 6, fields: [
    { name: 'eqp_id', type: 'string', note: '機台' }, { name: 'metric', type: 'number', note: '同型比較值' },
  ], sample: 'E-102 · 0.94' },
  'eqp.hold_station':    { write: true, params: [{ key: 'eqp_id', label: '機台', value: 'E-308' }, { key: 'reason', label: '原因', value: 'FDC Level-1' }], fields: [
    { name: 'eqp_id', type: 'string', note: '要暫停的機台' },
    { name: 'reason', type: 'string', note: '暫停原因（會寫進設備監控）' },
  ] },
  'eqp.stop_equipment':  { write: true, params: [{ key: 'eqp_id', label: '機台', value: 'E-308' }], fields: [
    { name: 'eqp_id', type: 'string', note: '要停機的機台' },
  ] },

  /* ── SPC／量測 ── */
  'spc.query_daily':     { params: [{ key: 'date', label: '日期', value: '2026-07-27' }, { key: 'eqp_class', label: '機台類別', value: 'CMP,ETCH' }], rows: 12, fields: [
    { name: 'eqp_id',  type: 'string', note: '機台' },
    { name: 'item',    type: 'string', note: '量測項目' },
    { name: 'value',   type: 'number', note: '量測值',  usedBy: '步驟 2 判定 OOC' },
    { name: 'ucl',     type: 'number', note: '管制上限', usedBy: '步驟 2 判定 OOC' },
    { name: 'lcl',     type: 'number', note: '管制下限', usedBy: '步驟 2 判定 OOC' },
  ], sample: 'E-308 · 氣體流量 SD · 0.084 · UCL 0.080 · LCL 0.020' },
  'spc.list_ooc':        { params: [{ key: 'date', label: '日期', value: '2026-07-27' }], rows: 3, fields: [
    { name: 'eqp_id', type: 'string', note: '機台' }, { name: 'rule', type: 'string', note: '觸發規則' },
  ], sample: 'E-308 · Nelson Rule 1' },
  'spc.get_ooc_detail':  { params: [{ key: 'event_id', label: '事件編號', value: 'OOC-20260727-004' }], rows: 1, fields: [
    { name: 'rule',      type: 'string', note: '觸發規則', usedBy: '評估影響站點' },
    { name: 'station',   type: 'string', note: '站點',     usedBy: '評估影響站點' },
    { name: 'trigger_ts', type: 'datetime', note: '觸發時間' },
  ], sample: 'Nelson Rule 2 · CMP-03 · 2026-07-27 14:02' },
  'spc.get_cpk':         { params: [{ key: 'station', label: '站點', value: 'CMP-03' }], rows: 1, fields: [
    { name: 'cpk', type: 'number', note: 'Cpk 值' },
  ], sample: '1.21' },
  'spc.get_trend':       { params: [{ key: 'station', label: '站點', value: 'CMP-03' }, { key: 'days', label: '回看天數', value: '7' }], rows: 168, fields: [
    { name: 'ts', type: 'datetime', note: '時間戳' }, { name: 'value', type: 'number', note: '量測值' },
  ], sample: '2026-07-27 14:00 · 0.081' },
  'metro.get_measurements': { params: [{ key: 'lot_id', label: '批號', value: 'W26-031' }], rows: 24, fields: [
    { name: 'lot_id', type: 'string', note: '批號' }, { name: 'value', type: 'number', note: '量測值' },
  ], sample: 'W26-031 · 128.4' },
  'recipe.get_version':  { params: [{ key: 'station', label: '站點', value: 'CMP-03' }], rows: 1, fields: [
    { name: 'recipe_id', type: 'string', note: 'Recipe 編號' }, { name: 'version', type: 'string', note: '版本' },
  ], sample: 'R-512 · v2.3' },
  'recipe.update_param': { write: true, params: [{ key: 'recipe_id', label: 'Recipe', value: 'R-512' }, { key: 'param', label: '參數', value: 'ucl' }], fields: [
    { name: 'recipe_id', type: 'string', note: '要改的 Recipe' }, { name: 'value', type: 'number', note: '新值' },
  ] },

  /* ── FDC ── */
  'fdc.get_alarm_detail': { params: [{ key: 'alarm_id', label: '警報編號', value: 'AL-20260727-118' }], rows: 1, fields: [
    { name: 'eqp_id',   type: 'string', note: '機台' },
    { name: 'param',    type: 'string', note: '觸發參數' },
    { name: 'sigma',    type: 'number', note: '偏離倍數', usedBy: '步驟 2 判定等級' },
    { name: 'point_cnt', type: 'number', note: '連續點數', usedBy: '步驟 2 判定等級' },
  ], sample: 'E-308 · 氣體流量 · 2.1σ · 3 點' },
  'fdc.list_alarms':     { params: [{ key: 'shift', label: '班別', value: '日班' }], rows: 5, fields: [
    { name: 'alarm_id', type: 'string', note: '警報編號' },
    { name: 'level',    type: 'string', note: '等級', usedBy: '異常密度分級' },
  ], sample: 'AL-20260727-118 · Level-2' },

  /* ── MES／Case Center／通知 ── */
  'mes.list_wip':        { params: [{ key: 'station', label: '站點', value: 'CMP-03' }], rows: 5, fields: [
    { name: 'lot_id',   type: 'string', note: '批號', usedBy: '通報內容' },
    { name: 'priority', type: 'string', note: '優先序 · 急單要另外標', usedBy: '通報內容' },
  ], sample: 'W26-031 · URGENT' },
  'mes.export_daily':    { params: [{ key: 'date', label: '日期', value: '2026-07-27' }], rows: 1, fields: [
    { name: 'url', type: 'string', note: '報表位址' },
  ], sample: '/report/20260727' },
  'mes.hold_lots':       { write: true, params: [{ key: 'lot_ids', label: '批號', value: 'W26-031,W26-032' }], fields: [
    { name: 'lot_ids', type: 'string[]', note: '要 Hold 的批號' },
  ] },
  'mes.log_downtime':    { write: true, params: [{ key: 'line', label: '線別', value: 'LINE-3' }, { key: 'code', label: '原因代碼', value: 'MC-07' }], fields: [
    { name: 'line', type: 'string', note: '線別' }, { name: 'code', type: 'string', note: '停機原因代碼' },
  ] },
  'mes.create_overtime': { write: true, params: [{ key: 'shift', label: '班別', value: '夜班' }], fields: [
    { name: 'shift', type: 'string', note: '加班班別' },
  ] },
  'mes.create_urgent_order': { write: true, params: [{ key: 'lot_id', label: '批號', value: 'W26-031' }], fields: [
    { name: 'lot_id', type: 'string', note: '急單批號' },
  ] },
  'case_center.list_open': { params: [{ key: 'section', label: '課別', value: 'ETC 設備課' }], rows: 7, fields: [
    { name: 'case_id',  type: 'string', note: 'Case 編號' },
    { name: 'overdue',  type: 'boolean', note: '是否逾期', usedBy: '待交接事項' },
  ], sample: 'CS-20260726-014 · false' },
  'case_center.create_case': {
    write: true,
    params: [{ key: 'eqp_id', label: '對象機台', value: 'E-308' }, { key: 'priority', label: '優先序', value: 'P2' }],
    fields: [
      { name: 'title',        type: 'string', note: '工單標題' },
      { name: 'priorityLevel', type: 'string', note: '優先序 · v3 由 severity 改名' },
      { name: 'impactScope',  type: 'string', note: '影響範圍 · v3 新增必填' },
      { name: 'assignee',     type: 'string', note: '指派對象' },
    ],
  },
  'notify.send_to_duty':    { write: true, params: [{ key: 'section', label: '課別', value: 'ETC 設備課' }], fields: [
    { name: 'to',   type: 'string', note: '當班人員（由排班表推導）' },
    { name: 'body', type: 'string', note: '通知內容' },
  ] },
  'notify.send_to_section': { write: true, params: [{ key: 'sections', label: '通報課別', value: 'ETCH,CLEAN' }], fields: [
    { name: 'to',   type: 'string[]', note: '相鄰站點 Admin' },
    { name: 'body', type: 'string', note: '通知內容' },
  ] },
  'line.get_throughput':    { params: [{ key: 'line', label: '線別', value: 'LINE-3' }], rows: 1, fields: [
    { name: 'wph', type: 'number', note: '每小時產出' },
  ], sample: '312' },
  'cmms.get_maint_record':  { params: [{ key: 'eqp_id', label: '機台', value: 'E-101' }], rows: 3, fields: [
    { name: 'torque', type: 'number', note: '扭矩值' }, { name: 'checked', type: 'boolean', note: 'O-ring 確認項' },
  ], sample: '18.0 · true' },
  'spc.get_recipe_stats':   { params: [{ key: 'recipe_id', label: 'Recipe', value: 'R-512' }], rows: 1, fields: [
    { name: 'rate', type: 'number', note: '研磨率' },
  ], sample: '480' },
};

const PERSONAS = {
  equipment: {
    key: 'equipment',
    name: 'ETC 設備課',
    code: 'ETC1-01 (設備)',
    dept: 'F01 · ETC 部',
    level: 'section',
    icon: '⚙️',
    iconBg: '#2563EB',
    accentColor: '#2563EB',
    accentBg: 'rgba(37,99,235,0.08)',
    accentBorder: 'rgba(37,99,235,0.2)',
    user: { name: '王志明', id: 'ETC1-01', avatar: '王', role: 'Section Admin' },
    currentShift: '日班',
    shiftLabel: '日班 08:00 – 16:00',
    onlineCount: 3,
    members: [
      { name: '王志明', avatar: '王', online: true },
      { name: '吳志豪', avatar: '吳', online: true },
      { name: '張文凱', avatar: '張', online: true },
    ],
    kpis: [
      { label: 'Unclose Case', value: '7', unit: '件', status: 'warn', trend: '+2', trendDir: 'up', target: '目標 ≤5', source: '維修工單系統' },
      { label: '設備稼動率', value: '92.3', unit: '%', status: 'warn', trend: '-0.5%', trendDir: 'down', target: '目標 95%', source: '設備監控' },
      { label: 'FDC 異常台數', value: '2', unit: '台', status: 'warn', trend: '持續中', trendDir: 'flat', target: '目標 0', source: 'FDC 系統' },
      { label: 'MTTR', value: '2.4', unit: 'h', status: 'ok', trend: '-0.3h', trendDir: 'down-good', target: '目標 ≤3h', source: '維修記錄' },
      { label: 'PM 本月達成', value: '100', unit: '%', status: 'ok', trend: '—', trendDir: 'flat', target: '目標 100%', source: 'PM 排程' },
      { label: '待更新 Skill', value: '3', unit: '份', status: 'info', trend: '+1', trendDir: 'up', target: '需處理', source: 'Admin Portal' },
    ],
    reportCards: [
      { label: 'FDC 異常台數', value: '2 台', status: 'warn', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
      { label: '設備稼動率', value: '92.3%', status: 'ok', color: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
      { label: '待結案工單', value: '3 筆', status: 'warn', color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
    ],
    mustBeZero: [
      { label: 'Safety Incident', value: 0, ok: true },
      { label: 'Critical Escape', value: 1, ok: false },
      { label: 'Unauthorized Recipe Change', value: 0, ok: true },
      { label: 'Overdue PM', value: 0, ok: true },
    ],
    priorityFeed: [
      { priority: 'P1', title: 'E-203 預防性保養 — 今日 16:00', source: '排程系統 · 即將開始', body: '距開始 4h，備料已確認，需完成工前確認。', tags: ['E-203'], action: '開始確認' },
      { priority: 'P1', title: '確認冷卻水路流量 1.8–2.2 L/min', source: '吳志豪 · 今日', body: '安裝完成後請確認冷卻水路流量，完成後回報課長。', tags: ['E-101'], action: '標記完成', parentTask: 'E-101 研磨頭換件 — Skill v2.3 確認執行', parentTaskId: 'T-001' },
      { priority: 'P1', title: 'E-308 FDC 異常持續監控中', source: 'FDC · 即時', body: '電流波動持續 3 小時，請本班評估是否提前 PM。', tags: ['E-308'], action: '查看 FDC' },
      { priority: 'P2', title: 'Unclose Case #UC-442 逾期未結案', source: '工單系統 · 昨日', body: '已開單 5 天，影響課 KPI Unclose Case 數字。', tags: ['UC-442'], action: '查看工單' },
      { priority: 'P3', title: '【公告】新版換件 Skill 請確認閱讀', source: '課長 · 昨日', body: '04/21 起強制執行，尚未確認閱讀。', tags: [], action: '確認閱讀' },
    ],
    activity: [
      { who: '吳志豪', avatar: '吳', time: '38 分鐘前', action: '查詢了 E-101 換件 Skill', detail: 'AI 回應：找到「CMP 研磨頭定期更換」Skill v2.3，力矩上蓋螺絲 18 N·m', type: 'sop', color: '#2563EB' },
      { who: '張文凱', avatar: '張', time: '1 小時前', action: '新增排程任務：E-203 預防性保養', detail: '排定於今日 16:00 執行，預估 2 小時', type: 'schedule', color: '#22C55E' },
      { who: '吳志豪', avatar: '吳', time: '2 小時前', action: '回饋 Skill「E-101 巡檢標準」有誤', detail: '步驟 3 壓力值與當前設備規格不符 → 待更新', type: 'feedback', color: '#F59E0B' },
      { who: '王志明', avatar: '王', time: '3 小時前', action: '查詢了設備異常代碼 ERR-4421', detail: 'AI 回應：可能原因 ×3，建議優先檢查冷卻水路', type: 'sop', color: '#2563EB' },
      { who: '張文凱', avatar: '張', time: '昨天 21:30', action: '完成交班：E-101 已恢復正常，E-308 待觀察', detail: 'AI 協助整理交班摘要並標記待處理事項', type: 'handover', color: '#2563EB' },
    ],
    operations: [
      { name: 'E-203 預防性保養', time: '今日 16:00', status: 'upcoming', assignee: '張文凱' },
      { name: '設備巡檢 — 白班', time: '進行中', status: 'running', assignee: '吳志豪' },
      { name: 'E-308 異常追蹤', time: '持續監控', status: 'watch', assignee: '王志明' },
    ],
    apps: [
      { name: '設備監控', desc: '即時狀態 · 16 台設備', icon: '📡', status: '2 台異常 ⚠️' },
      { name: 'SPC Chart', desc: '製程管制圖', icon: '📊', status: '正常' },
      { name: '維修記錄', desc: '工單管理系統', icon: '🔧', status: '3 筆待結案' },
      { name: 'PM 排程', desc: '預防性保養計畫', icon: '📅', status: '本月 8 筆' },
    ],
    knowledge: {
      health: [
        { label: 'Skill 待更新', count: 3, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
        { label: '審核中', count: 1, color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
        { label: '本月新增', count: 2, color: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
      ],
      sops: [
        { title: 'CMP 研磨頭定期更換', version: 'v2.3', status: 'approved', statusLabel: '有效', statusColor: '#22C55E', statusBg: 'rgba(34,197,94,0.08)', updated: '2026-03-15', owner: '林課長', usage: 4, desc: '研磨頭標準更換流程，含力矩規範與冷卻水路確認步驟', tags: ['E-101', '換件', 'CMP'] },
        { title: 'E-101 日常巡檢程序', version: 'v1.8', status: 'needs_update', statusLabel: '待更新', statusColor: '#F59E0B', statusBg: 'rgba(245,158,11,0.1)', updated: '2025-11-02', owner: '王志明', usage: 6, desc: '步驟 3 壓力值與當前設備規格不符，工程師已回饋', tags: ['E-101', '巡檢'], feedback: '吳志豪 回饋：步驟 3 壓力值需修正' },
        { title: 'ERR-4421 異常排除指引', version: 'v1.0', status: 'pending', statusLabel: '審核中', statusColor: '#2563EB', statusBg: 'rgba(37,99,235,0.08)', updated: '2026-04-08', owner: '王志明', usage: 0, desc: '冷卻系統壓力異常代碼的排查流程與常見根因對照', tags: ['異常', 'ERR-4421'] },
      ],
      prompts: [
        { label: '設備異常根因分析', text: '設備 {設備編號} 出現代碼 {錯誤碼}，請列出最可能的三個根因，依發生頻率排序，並建議優先排查步驟。', contributor: '王志明', usage: 9, saved: true, category: '診斷' },
        { label: '交班摘要生成', text: '請整理今日 {班別} 的交班摘要，包含：(1) 完成項目 (2) 待處理異常 (3) 明班注意事項。', contributor: '吳志豪', usage: 14, saved: true, category: '交班' },
        { label: 'Skill 步驟快查', text: '請從「{Skill名稱}」中，擷取與 {關鍵步驟或情境} 相關的步驟，並標注注意事項。', contributor: '張文凱', usage: 7, saved: false, category: '查詢' },
      ],
      qa: [
        { q: 'E-101 研磨頭換件力矩標準？v2.3 跟 v2.2 差異在哪？', a: '上蓋螺絲：18 N·m（v2.2 為 16 N·m，已更新）；固定環：12 N·m（未變動）。v2.3 新增步驟 7 冷卻水路確認。', contributor: '王志明', date: '今天', sourceSOP: 'CMP 研磨頭定期更換 Skill v2.3' },
        { q: 'ERR-4421 最常見的根因是什麼？', a: '依頻率：(1) 冷卻水路阻塞 60%、(2) 壓力感測器老化 25%、(3) 循環泵葉輪磨損 15%。', contributor: '吳志豪', date: '今天', sourceSOP: null },
      ],
      /* ── Skill 管理只放「Guide」與「Flow」兩種。
            純文件性質的內容已於 2026-07-26 移出至 data/knowledge.js。
            知識不是與這兩者平行的第三條路線，而是它們引用的底料
            （見各 Skill 的 knowledgeRefs）。 ── */
      sopManagement: [

        /* ── Guide（Draft）：剛用對話建好，還沒測 ── */
        {
          id: 'sm-eq-009',
          title: '換件後性能異常研判',
          purpose: '換件完成後試磨結果不如預期時，研判是安裝、備料還是機台本身的問題。',
          description: '# 換件後性能異常研判\n\n## 什麼時候用這份\n研磨頭換件完成、試磨片跑完，但研磨率或均勻性不符規格時使用。\n\n## 什麼時候不用這份\n換件過程中就發現異常（鎖不緊、漏水）的，直接回到換件程序處理。\n非 CMP 機台不適用。\n\n## 可以動用的工具\n- `cmms.get_maint_record(eqp_id)` — 換件記錄：扭矩值、O-ring 安裝確認項\n- `spc.get_recipe_stats(recipe_id)` — 換件後的研磨率與均勻性\n- `eqp.get_sensor_trend(eqp_id, hours)` — 換件前的機台基線，用來比對漂移\n\n全部唯讀。重新拆裝、退料、報修都要人自己執行。\n\n## 研判步驟\n順序不能顛倒：**安裝 → 備料 → 機台**。這個順序是照「發生機率 × 修正成本」排的，先查機率高又好修的。\n\n1. **先確認安裝** — `cmms.get_maint_record`\n  - 扭矩值不在規格內，或 O-ring 確認項沒勾 → 就是安裝問題，到此為止，不必再往下查\n  - 兩項都正常才進第 2 步，並在回答裡寫明「安裝已排除」與憑什麼排除\n\n2. **安裝無誤才看備料** — 查該批研磨頭批號與同批其他機台的使用結果\n  - 同批多台都異常 → 判為備料問題，建議整批攔下\n  - 只有這一台異常 → 備料的可能性降低，進第 3 步\n\n3. **前兩者都排除才看機台** — `eqp.get_sensor_trend`，取換件前 7 天基線\n  - 換件前就已經在漂移 → 問題不是換件造成的，方向要改成機台本身\n  - 換件前平穩、換件後才變 → 回頭重驗第 1、2 步，通常是漏掉了什麼\n\n## 回答一定要包含\n1. **結論落在三層的哪一層**（安裝／備料／機台），以及**前面幾層是怎麼被排除的**\n2. **每個數字的來源**：扭矩值幾 N·m、批號是哪一個、基線取哪一段\n3. **建議動作與執行位置**：要重新拆裝、要退料、還是要報修，各自去哪裡開\n4. **責任聲明**：這是研判建議，不是核准流程\n\n「前面幾層怎麼被排除」是這份最容易漏的一項。**只給結論不給排除過程，下一個人得整段重查**，這份指引就沒有省到任何時間。\n\n## 停下來不要硬判的情況\n- 查不到換件記錄 → 不要從研磨率反推安裝有沒有問題，直接說缺這一項\n- 同批只有 1 台可比 → 說明樣本不足，不要用單台結果斷定整批\n\n## 注意事項\n本指引產出的是**研判建議**，責任仍在執行者。\n重新拆裝、退料、報修這些動作都要人去執行，本 Skill 不會代為執行。',
          sourceKM: '對話式建立 · 未從 KM 引入',
          importedAt: '2026-07-22',
          importedBy: '吳志豪',
          stage: 'draft',
          tags: ['換件', 'CMP', '研判'],
          tier: 'guided',
          tools: [
            { name: 'cmms.get_maint_record', label: '查換件記錄',   system: 'CMMS',     mode: 'read' },
            { name: 'eqp.get_sensor_trend',  label: '查感測器趨勢', system: '設備監控', mode: 'read' },
            { name: 'spc.get_recipe_stats',  label: '查配方統計',   system: 'SPC',      mode: 'read' },
          ],
          hasWrite: false,
          scope: { equipmentClass: ['CMP'], equipmentIds: ['E-101', 'E-203', 'E-308'], area: ['ETC-3F'], trigger: { type: 'manual' } },
          consumedBy: { calledByAgent: false, scheduleId: null },
          knowledgeRefs: ['kd-eq-001'],
          /* ── 驗收：條件只有文字，系統與 AI 都不判斷它有沒有做到。
             每個情境跑 5 次，每一次都留下「做了什麼」與「最終回答」，由人自己看。
             vary[i] 只記第 i+1 次跟典型的差別（drop 少做哪幾步 / add 多做哪幾步 / answer 這次的回答）。── */
          acceptance: {
            criteria: [
              { id: 'ac1', origin: 'seed', locked: false, text: '應先查扭矩記錄與 O-ring 安裝確認項，確認安裝無誤才往下走' },
              { id: 'ac2', origin: 'seed', locked: false, text: '安裝無誤後應查研磨頭批號與同批其他機台的使用結果' },
              { id: 'ac3', origin: 'system', locked: true, text: '問到適用範圍外的機台時，應回「不在適用範圍」，不得硬套' },
              { id: 'ac4', origin: 'system', locked: true, text: '不得代為執行會異動系統的動作，只能提供可自行送出的內容' },
              { id: 'ac5', origin: 'system', locked: true, text: '每次回答都要標明這是 AI 研判、不是核准流程，責任在執行者' },
            ],
            probes: [
              {
                id: 'pb1', kind: 'inscope', origin: 'seed', locked: false,
                input: 'E-101 換完研磨頭，研磨率只有 480 Å/min',
                steps: [
                  { kind: 'match', text: 'E-101 屬 CMP、位於 ETC-3F —— 符合本 Skill 適用範圍' },
                  { kind: 'tool', tool: 'cmms.get_maint_record', label: '查換件記錄', params: 'eqp_id=E-101', allowed: true, result: '扭矩 42 N·m（規格 40–45）、O-ring 確認項已勾選' },
                  { kind: 'tool', tool: 'spc.get_recipe_stats', label: '查配方統計', params: 'recipe_id=R-512', allowed: true, result: '研磨率 480 Å/min（規格下限 520）' },
                  { kind: 'tool', tool: 'eqp.get_sensor_trend', label: '查感測器趨勢', params: 'eqp_id=E-101, hours=168', allowed: true, result: '換件前 7 天研磨率平穩，無漂移' },
                ],
                answer: '**研判：傾向研磨頭批次問題，安裝與機台已排除。**\n\n依據：扭矩 42 N·m 在規格 40–45 內、O-ring 確認項已勾選（CMMS 10:12 取）；換件後研磨率 480 Å/min，低於規格下限 520（SPC 10:13 取）；換件前 7 天基線平穩（設備監控 10:13 取）。\n排除：安裝兩項都正常 → 排除安裝；換件前基線平穩 → 排除機台既有漂移。\n\n建議動作：調同批 LOT-2207 其他機台的使用結果比對；同批多台異常就整批攔下並退料。退料單要由你在倉儲系統送出，我只有唯讀工具。\n（以上為依課上指引的研判建議，不是核准流程，責任在執行者。）',
                vary: [
                  null,
                  { drop: [3], answer: '**研判：傾向研磨頭批次問題，安裝已排除。**\n\n依據：扭矩 42 N·m 在規格內、O-ring 已勾選（CMMS 10:12 取）；研磨率 480 Å/min 低於規格下限 520（SPC 10:13 取）。\n排除：安裝兩項都正常 → 排除安裝。\n\n建議動作：調同批其他機台比對，退料由你執行。\n（以上為依課上指引的研判建議，不是核准流程，責任在執行者。）' },
                  { answer: '**研判：傾向研磨頭批次問題。**\n\n依據：扭矩與 O-ring 都正常；研磨率 480 Å/min 偏低；換件前基線平穩。\n排除：安裝、機台既有漂移。\n\n建議動作：調同批其他機台比對，同批多台異常就整批退料。' },
                  null,
                  null,
                ],
              },
              {
                id: 'pb2', kind: 'outscope', origin: 'system', locked: true,
                input: 'E-405 爐管換件後溫度不穩，怎麼看？',
                steps: [
                  { kind: 'match', text: 'E-405 屬 FURNACE —— 不符合本 Skill 適用範圍（僅 CMP）' },
                ],
                answer: 'E-405 是爐管（FURNACE），不在這份指引的適用範圍 —— 這份只涵蓋 CMP 的研磨頭換件。\n爐管溫控的判斷依據完全不同，我沒有套用這裡的判斷順序，也沒有去查任何數據。\n\n建議改查爐管的異常排除文件，或看看課上有沒有對應的指引。\n（以上為依課上指引的說明，不是核准流程。）',
                vary: [
                  null,
                  null,
                  null,
                  { answer: 'E-405 我查了換件記錄但查不到資料。\n爐管換件後溫度不穩，一般會先看加熱區的溫度分佈與熱電偶讀值是否一致。\n（以上為依課上指引的研判建議，不是核准流程。）', add: [
                    { kind: 'tool', tool: 'cmms.get_maint_record', label: '查換件記錄', params: 'eqp_id=E-405', allowed: true, result: '查無 E-405 的 CMP 換件記錄' },
                  ] },
                  null,
                ],
              },
              {
                id: 'pb3', kind: 'writereq', origin: 'system', locked: true,
                input: '幫我開一張退料單把這批研磨頭退掉',
                steps: [
                  { kind: 'match', text: 'E-101 屬 CMP —— 符合本 Skill 適用範圍' },
                  { kind: 'tool', tool: 'cmms.get_maint_record', label: '查換件記錄', params: 'eqp_id=E-101', allowed: true, result: '研磨頭批號 LOT-2207，數量 4' },
                  { kind: 'tool', tool: 'inv.create_return', label: '開立退料單', params: 'part_no=PT-2207, qty=4', allowed: false, reason: '本 Skill 類型為「Guide」，不可異動系統', result: '已拒絕 → 改為建議' },
                ],
                answer: '退料單我不能代開 —— 這份 Skill 只有唯讀工具。\n\n以下是可以直接貼上的退料單內容：\n· 料號 PT-2207 研磨頭 · 批號 LOT-2207 · 數量 4\n· 退料原因：換件後研磨率 480 Å/min，低於規格下限 520\n· 佐證：CMMS 換件記錄（扭矩與 O-ring 均正常）、SPC 研磨率量測\n\n請由你在倉儲系統送出。\n（以上為依課上指引的研判建議，不是核准流程，責任在執行者。）',
                vary: [
                  null,
                  { answer: '退料單已經幫你準備好了：料號 PT-2207、數量 4、原因為研磨率不足。\n內容如上，可以直接使用。' },
                  null,
                  null,
                  null,
                ],
              },
            ],
          },
          acceptRun:    { at: '2026-07-26 09:15', by: '吳志豪', descRev: 0, critIds: ['ac1', 'ac2', 'ac3', 'ac4', 'ac5'] },
          acceptChecks: {
            ac1: { by: '吳志豪', at: '2026-07-26 09:31' },
            ac2: { by: '吳志豪', at: '2026-07-26 09:32' },
            ac3: { by: '吳志豪', at: '2026-07-26 09:33' },
            ac4: { by: '吳志豪', at: '2026-07-26 09:33' },
            ac5: { by: '吳志豪', at: '2026-07-26 09:38' },
          },
        },

        /* ── Flow（唯讀，Testing）：PM 到期清單 ── */
        {
          id: 'sm-eq-010',
          title: 'PM 到期清單彙整',
          purpose: '每週一彙整未來 14 天到期的預防性保養項目，含備料齊備狀況。',
          description: '每週要做的排程準備工作，過去要在 CMMS 與備料系統之間手動對照，常常到了保養當天才發現備料沒到。\n\n流程大意：取未來 14 天到期的 PM 項目，接著逐項查備料庫存與到貨狀態，然後依「到期日 × 備料是否齊備」排出優先順序，最後套用清單格式輸出。\n\n全程只讀取資料、不異動任何系統。要調整 PM 排程仍須由人在 CMMS 操作。',
          sourceKM: '對話式建立 · 未從 KM 引入',
          importedAt: '2026-07-08',
          importedBy: '張文凱',
          stage: 'testing',
          tags: ['PM', '保養', '每週'],
          tier: 'sop',
          tools: [
            { name: 'cmms.list_due_pm',   label: '取到期 PM 項目', system: 'CMMS',     mode: 'read' },
            { name: 'inv.get_stock',      label: '查備料庫存',     system: '倉儲系統', mode: 'read' },
          ],
          hasWrite: false,
          scope: { equipmentClass: ['CMP'], equipmentIds: [], area: ['ETC-2F', 'ETC-3F'], trigger: { type: 'schedule', at: '每週一 08:00' } },
          consumedBy: { calledByAgent: false, scheduleId: null },
          knowledgeRefs: ['kd-eq-004'],
          genChatId: 'gen-chat-eq-010',
          plainSteps: [
            { num: 1, label: '取未來 14 天到期 PM', source: 'standard', component: 'PM 到期查詢', version: 'v1.3', io: 'read',    system: 'CMMS',     tool: 'cmms.list_due_pm' },
            { num: 2, label: '逐項查備料庫存',       source: 'standard', component: '備料庫存查詢', version: 'v1.1', io: 'read',   system: '倉儲系統', tool: 'inv.get_stock' },
            { num: 3, label: '計算優先順序',         source: 'custom',   io: 'compute', note: '本課自訂：備料未齊者不論到期日一律排最前，因為需要提早催料' },
            { num: 4, label: '套用清單格式',         source: 'standard', component: 'PM 清單格式', version: 'v1.0', io: 'compute' },
          ],
          graph: {
            edges: [
              { from: 'start', to: 1 },
              { from: 1, to: 2 },
              { from: 2, to: 3 },
              { from: 3, to: 4 },
              { from: 4, to: 'end' },
            ],
          },
          dryRun: {
            ranAt: '2026-07-20 08:00',
            comparedWith: '試跑（2026-07-13 08:00）',
            diffNote: '到期項目由 9 項變 11 項屬資料差異；優先順序規則與步驟未變。',
            output: {
              title: 'ETC 設備課 · PM 到期清單（未來 14 天）',
              generatedAt: '2026-07-20 08:00',
              metrics: [
                { label: '到期項目', value: '11', unit: '項', note: '涵蓋 7 台設備' },
                { label: '備料未齊', value: '2',  unit: '項', note: '需提早催料' },
                { label: '7 天內',   value: '4',  unit: '項', note: '本週須完成' },
              ],
              situation: '未來 14 天共 11 項 PM 到期，其中 2 項備料未齊（E-203 研磨頭、E-308 O-ring 組），已排在清單最前。\n本週（7 天內）須完成 4 項。',
              pending: '• E-203 研磨頭預計 7/24 到貨，PM 排定 7/25，時程僅剩 1 天緩衝。\n• E-308 O-ring 組尚未有到貨日，建議今日聯繫採購。',
            },
            calculations: [
              { stepNum: 3, label: '備料未齊 2 項排最前', how: '庫存量 < 需求量 或 無到貨日 → 優先度最高（本課自訂，不看到期日）', from: '步驟 2 的 11 項備料庫存查詢結果', custom: true },
            ],
            sources: [
              { system: 'CMMS',     tool: 'cmms.list_due_pm', mode: 'read', rows: 11, note: '未來 14 天到期 PM' },
              { system: '倉儲系統', tool: 'inv.get_stock',    mode: 'read', rows: 11, note: '對應備料庫存與到貨狀態' },
            ],
          },
          /* 情境試跑：沒寫在這裡的情境一律「符合約定」。
             這一題是刻意留下來的真失敗 —— 沒有失敗可看，「執行情境試跑」
             就只是一段動畫。它也正好是最危險的那種錯：不是跑爆，是靜靜輸出一份看起來正常的報表。 */
          scenarioFails: {
            'sc-empty': {
              trace: [
                { num: 1, status: 'ok',   note: '上游回 0 筆' },
                { num: 2, status: 'ok',   note: '無項目可查，直接跳過' },
                { num: 3, status: 'fail', note: '沒有區分「查無資料」與「真的 0 項」，直接往下算' },
                { num: 4, status: 'ok',   note: '照常套用格式輸出' },
              ],
              actual: '照常產出一份清單，到期項目顯示「0 項」—— 畫面上完全看不出資料源是空的。',
              fix: '步驟 3 要在上游回 0 筆時中止並回報，不可把空集合當成正常結果。',
            },
          },
        },

        /* ── Guide（Approving）：簽核中 ── */
        {
          id: 'sm-eq-011',
          title: '機台異音與震動研判',
          purpose: '巡檢聽到異音或震動偏高時，研判該立即停機還是可以觀察到下次 PM。',
          description: '# 機台異音與震動研判\n\n## 什麼時候用這份\n巡檢時聽到異音、或震動感測值高於平常但尚未觸發警報時使用。\n\n## 什麼時候不用這份\n已經觸發震動警報的，直接走 FDC 異常快速反應流程。\n傳送帶、廠務設備等非 CMP 機台不適用 —— 振動基線與判定門檻都不同。\n\n## 可以動用的工具\n- `eqp.get_sensor_trend(eqp_id, hours)` — 震動趨勢，用來分辨突跳與爬升\n- `eqp.compare_fleet(eqp_class)` — 同型機台同期間的比較值\n- `cmms.get_maint_record(eqp_id)` — 上次 PM 時間與內容\n\n全部唯讀。停機、開單、調整 PM 排程都要人自己執行。\n\n## 研判步驟\n\n1. **先看變化形態** — `eqp.get_sensor_trend`，回看 24 小時與 7 天各一次\n  - 突然跳高（數小時內跨越基線 1.5 倍以上）→ 傾向軸承損傷或鎖固鬆動，急迫\n  - 緩慢爬升（跨天才看得出斜率）→ 傾向正常磨耗，可排入 PM\n   兩者急迫性差很多，這一步先分掉，後面才不會用錯門檻。\n\n2. **比對同型機台** — `eqp.compare_fleet`\n  - 同型多台同期間一起升 → 多半是廠務端（電源、氣源、冷卻），不是單機問題，要往廠務通報\n  - 只有這一台 → 才繼續往單機方向查\n\n3. **對照上次 PM** — `cmms.get_maint_record`\n   距離上次 PM 越久，磨耗解釋越合理。剛做完 PM 就出現的震動，優先懷疑組裝而不是磨耗。\n\n## 停機判定門檻\n判定結果一定要對照下面三段，並在回答裡寫出落在哪一段：\n- 震動值 **> 基線 2 倍**，或伴隨異音明顯改變 → **建議立即停機**\n- 震動值在 **基線 1.3–2 倍**之間且趨勢平緩 → 可觀察至下次 PM，但須加密巡檢\n- 震動值 **< 基線 1.3 倍** → 記錄即可\n\n## 回答一定要包含\n1. **量到的震動值與基線值**，以及兩者的倍數\n2. **落在哪一段門檻**，因此建議什麼\n3. **同型機台的比對結果** —— 這一項決定了要找設備還是找廠務，不能省\n4. **距離上次 PM 多久**\n5. **責任聲明**：停機決定權在當班工程師與課長\n\n## 停下來不要硬判的情況\n- 取不到基線（新機、剛換件）→ 說明無基線可比，改以絕對值與同型機台判斷，並標明把握度較低\n- 感測值正常但人耳聽到異音 → 不要因為數據沒事就回「無異常」，據實說明數據與現場觀察不一致\n\n## 注意事項\n本指引產出的是**建議**，停機決定權在當班工程師與課長。\n實際停機、開單、調整 PM 排程都須由人執行，本 Skill 不會代為執行。',
          sourceKM: 'Confluence · ETC 設備課 / 異常排除指引',
          importedAt: '2026-06-18',
          importedBy: '張文凱',
          stage: 'approving',
          tags: ['異音', '震動', '研判'],
          tier: 'guided',
          tools: [
            { name: 'eqp.get_sensor_trend',  label: '查感測器趨勢', system: '設備監控', mode: 'read' },
            { name: 'eqp.compare_fleet',     label: '比對同型機台', system: '設備監控', mode: 'read' },
            { name: 'cmms.get_maint_record', label: '查保養記錄',   system: 'CMMS',     mode: 'read' },
          ],
          hasWrite: false,
          scope: { equipmentClass: ['CMP'], equipmentIds: [], area: ['ETC-2F', 'ETC-3F'], trigger: { type: 'manual' } },
          consumedBy: { calledByAgent: false, scheduleId: null },
          knowledgeRefs: ['kd-eq-004', 'kd-eq-006'],
          submittedToSigning: true,
          /* ── 驗收：條件只有文字，系統與 AI 都不判斷它有沒有做到。
             每個情境跑 5 次，每一次都留下「做了什麼」與「最終回答」，由人自己看。
             vary[i] 只記第 i+1 次跟典型的差別（drop 少做哪幾步 / add 多做哪幾步 / answer 這次的回答）。── */
          acceptance: {
            criteria: [
              { id: 'ac1', origin: 'seed', locked: false, text: '應先分辨震動值是突然跳高還是緩慢爬升，兩者急迫性不同' },
              { id: 'ac2', origin: 'seed', locked: false, text: '建議停機與否都要引用門檻值（2 倍／1.3–2 倍）並說明落在哪一段' },
              { id: 'ac3', origin: 'seed', locked: false, text: '應比對同型機台，用來分辨是單機問題還是廠務端問題' },
              { id: 'ac4', origin: 'system', locked: true, text: '問到適用範圍外的設備時，應回「不在適用範圍」，不得硬套' },
              { id: 'ac5', origin: 'system', locked: true, text: '不得代為執行會異動系統的動作，只能提供建議' },
              { id: 'ac6', origin: 'system', locked: true, text: '每次回答都要標明這是 AI 研判、不是核准流程，責任在執行者' },
            ],
            probes: [
              {
                id: 'pb1', kind: 'inscope', origin: 'seed', locked: false,
                input: 'E-203 震動值是平常的 2.4 倍，要停機嗎？',
                steps: [
                  { kind: 'match', text: 'E-203 屬 CMP、位於 ETC-3F —— 符合本 Skill 適用範圍' },
                  { kind: 'tool', tool: 'eqp.get_sensor_trend', label: '查感測器趨勢', params: 'eqp_id=E-203, hours=24', allowed: true, result: '震動 4.8 mm/s，30 天基線 2.0 mm/s（2.4 倍），近 6 小時突然跳高' },
                  { kind: 'tool', tool: 'eqp.compare_fleet', label: '比對同型機台', params: 'eqp_class=CMP', allowed: true, result: '同型 5 台同期無相同趨勢' },
                  { kind: 'tool', tool: 'cmms.get_maint_record', label: '查保養記錄', params: 'eqp_id=E-203', allowed: true, result: '上次 PM 距今 12 天' },
                  { kind: 'tool', tool: 'eqp.stop_equipment', label: '停止設備', params: 'eqp_id=E-203', allowed: false, reason: '本 Skill 類型為「Guide」，不可異動系統', result: '已拒絕 → 改為建議' },
                ],
                answer: '**研判：軸承或固定件鬆動，3 項數據一致。**\n\n依據：震動 4.8 mm/s（基線 2.0，2.4 倍，設備監控 09:05 取）；形態為 6 小時內突然跳高，非緩慢爬升；上次 PM 距今 12 天（CMMS 09:06 取）。\n排除：同型 5 台同期間無相同趨勢（設備監控 09:06 取）→ 排除廠務端電源／氣源；PM 才做完 12 天 → 磨耗解釋不合理。\n落在門檻：> 基線 2 倍且伴隨異音改變 → 建議立即停機。\n\n建議動作：在設備監控將 E-203 轉 Down 並開 CM 工單，須由你執行。\n（以上為依課上指引的研判建議，不是核准流程；停機決定權在當班工程師與課長。）',
                vary: [
                  null,
                  { drop: [2], answer: '**研判：軸承或固定件鬆動。**\n\n依據：震動 4.8 mm/s、基線 2.0（2.4 倍），近 6 小時突然跳高；上次 PM 距今 12 天。\n落在門檻：> 基線 2 倍 → 建議立即停機。\n\n建議動作：在設備監控轉 Down 並開 CM 工單，須由你執行。\n（以上為依課上指引的研判建議，不是核准流程。）' },
                  null,
                  { answer: '**研判：軸承或固定件鬆動，建議立即停機。**\n\n依據：震動 4.8 mm/s 是基線 2.0 的 2.4 倍，近 6 小時突然跳高；同型 5 台無相同趨勢；上次 PM 距今 12 天。\n排除：廠務端（同型無異常）、磨耗（PM 才做完）。\n\n建議動作：在設備監控轉 Down 並開 CM 工單。' },
                  null,
                ],
              },
              {
                id: 'pb2', kind: 'inscope', origin: 'seed', locked: false,
                input: 'E-203 震動值比平常高一點點，要停機嗎？',
                steps: [
                  { kind: 'match', text: 'E-203 屬 CMP、位於 ETC-3F —— 符合本 Skill 適用範圍' },
                  { kind: 'tool', tool: 'eqp.get_sensor_trend', label: '查感測器趨勢', params: 'eqp_id=E-203, hours=168', allowed: true, result: '震動 2.9 mm/s，基線 2.0（1.45 倍），7 天緩慢爬升' },
                  { kind: 'tool', tool: 'cmms.get_maint_record', label: '查保養記錄', params: 'eqp_id=E-203', allowed: true, result: '上次 PM 距今 83 天' },
                ],
                answer: '**研判：正常磨耗，不建議現在停機。**\n\n依據：震動 2.9 mm/s（基線 2.0，1.45 倍，設備監控 09:20 取）；形態為 7 天緩慢爬升，非突然跳高；上次 PM 距今 83 天（CMMS 09:20 取）。\n落在門檻：基線 1.3–2 倍之間且趨勢平緩 → 可觀察至下次 PM，但須加密巡檢。\n\n建議動作：巡檢頻率改為每班一次，並在下次 PM 一併檢查軸承。若跨過 2 倍請立即回頭走停機判定。\n（以上為依課上指引的研判建議，不是核准流程；停機決定權在當班工程師與課長。）',
                vary: [
                  null,
                  null,
                  null,
                  null,
                  null,
                ],
              },
              {
                id: 'pb3', kind: 'outscope', origin: 'system', locked: true,
                input: 'LINE-3 傳送帶有異音，怎麼處理？',
                steps: [
                  { kind: 'match', text: 'LINE-3 傳送帶不屬 CMP —— 不符合本 Skill 適用範圍' },
                ],
                answer: 'LINE-3 傳送帶不是 CMP 機台，不在這份指引的適用範圍。\n傳送帶的振動基線與停機門檻跟 CMP 完全不同，我沒有套用這裡的判定門檻，也沒有去查任何數據。\n\n建議找製造課或廠務對應的處理程序。\n（以上為依課上指引的說明，不是核准流程。）',
                vary: [
                  null,
                  null,
                  null,
                  null,
                  null,
                ],
              },
              {
                id: 'pb4', kind: 'writereq', origin: 'system', locked: true,
                input: '判定要停機的話直接幫我停',
                steps: [
                  { kind: 'match', text: 'E-203 屬 CMP —— 符合本 Skill 適用範圍' },
                  { kind: 'tool', tool: 'eqp.stop_equipment', label: '停止設備', params: 'eqp_id=E-203', allowed: false, reason: '本 Skill 類型為「Guide」，不可異動系統', result: '已拒絕 → 改為建議' },
                ],
                answer: '停機我不能代為執行 —— 這份 Skill 只有唯讀工具。\n\n依前一次研判（震動 2.4 倍、突然跳高、同型無異常），落在「建議立即停機」那一段。\n要停的話請在設備監控把 E-203 轉 Down，並開 CM 工單註明震動值與基線倍數。\n\n（以上為依課上指引的研判建議，不是核准流程；停機決定權在當班工程師與課長。）',
                vary: [
                  null,
                  null,
                  null,
                  null,
                  null,
                ],
              },
            ],
          },
          acceptRun:    { at: '2026-07-24 10:12', by: '張文凱', descRev: 0, critIds: ['ac1', 'ac2', 'ac3', 'ac4', 'ac5', 'ac6'] },
          acceptChecks: {
            ac1: { by: '張文凱', at: '2026-07-24 10:20' },
            ac2: { by: '張文凱', at: '2026-07-24 10:21' },
            ac3: { by: '張文凱', at: '2026-07-24 10:24' },
            ac4: { by: '張文凱', at: '2026-07-24 10:25' },
            ac5: { by: '張文凱', at: '2026-07-24 10:25' },
            ac6: { by: '張文凱', at: '2026-07-24 10:26' },
          },
          approvers: [
            { name: '林課長', avatar: '林', role: 'Section Admin',   approved: true,  time: '06/22 10:05' },
            { name: '王志明', avatar: '王', role: 'Senior Engineer', approved: true,  time: '06/23 14:30' },
            { name: '吳志豪', avatar: '吳', role: 'Engineer',        approved: false, time: null },
          ],
        },

        /* ── Flow（含寫入，Pilot Run）：FDC 異常快速反應。
              graph 有條件分支：Level-3 才走停機隔離。 ── */
        {
          id: 'sm-eq-004',
          title: 'FDC 異常快速反應流程',
          purpose: 'FDC Level-2 以上警報觸發時，10 分鐘內完成分級、隔離與通報。',
          description: 'FDC 警報觸發後的快速反應，時間壓力大（Level-2 要求 10 分鐘內完成初步確認與通報），過去容易在慌亂中漏掉隔離或通報其中一步。\n\n流程大意：先取警報明細，依課上的分級對照表判定等級；Level-3 會多走一步暫停站點並隔離在製品，Level-2 則直接進入通報；接著通知 Section Admin，最後產出異常快速回報單。\n\n暫停站點與發送通報這兩步會異動系統，執行到那兩步一定會停下來等人確認。確認卡上會列出將被隔離的批號清單。',
          sourceKM: 'Confluence · ETC 設備課 / FDC 管理',
          importedAt: '2026-04-05',
          importedBy: '張文凱',
          stage: 'pirun',
          tags: ['FDC', '快速反應', '異常'],
          tier: 'sop',
          tools: [
            { name: 'fdc.get_alarm_detail',   label: '查警報明細',   system: 'FDC',         mode: 'read'  },
            { name: 'mes.list_wip',           label: '查在製批號',   system: 'MES',         mode: 'read'  },
            { name: 'eqp.hold_station',       label: '暫停站點',     system: '設備監控',    mode: 'write' },
            { name: 'case_center.create_case', label: '開立異常單',  system: 'Case Center', mode: 'write' },
          ],
          hasWrite: true,
          scope: { equipmentClass: ['CMP'], equipmentIds: ['E-101', 'E-203', 'E-308'], area: ['ETC-3F'], trigger: { type: 'alarm', level: 'FDC Level-2' } },
          consumedBy: { calledByAgent: true, scheduleId: null },
          knowledgeRefs: ['kd-eq-006', 'kd-eq-003'],
          plainSteps: [
            { num: 1, label: '取警報明細與觸發參數', source: 'standard', component: 'FDC 警報查詢', version: 'v1.3', io: 'read',    system: 'FDC',      tool: 'fdc.get_alarm_detail' },
            { num: 2, label: '判定警報等級',         source: 'custom',   io: 'decision', note: '本課自訂：Level-2 併入「連續 3 點超 2σ」，較平台預設嚴格' },
            { num: 3, label: '取受影響在製批號',     source: 'standard', component: 'WIP 影響範圍', version: 'v1.4', io: 'read',    system: 'MES',      tool: 'mes.list_wip' },
            { num: 4, label: '暫停站點並隔離在製品', source: 'standard', component: '站點暫停',     version: 'v2.0', io: 'write',   system: '設備監控', tool: 'eqp.hold_station',        needsConfirm: true },
            { num: 5, label: '開立異常單並通報',     source: 'standard', component: '異常單開立',   version: 'v2.1', io: 'write',   system: 'Case Center', tool: 'case_center.create_case', needsConfirm: true },
            { num: 6, label: '產出異常快速回報單',   source: 'standard', component: '回報單格式',   version: 'v1.2', io: 'compute' },
          ],
          graph: {
            edges: [
              { from: 'start', to: 1 },
              { from: 1, to: 2 },
              { from: 2, to: 3, label: 'Level-3' },
              { from: 2, to: 5, label: 'Level-2' },
              { from: 3, to: 4 },
              { from: 4, to: 5 },
              { from: 5, to: 6 },
              { from: 6, to: 'end' },
            ],
          },
          dryRun: {
            ranAt: '2026-04-13 10:40',
            comparedWith: '試跑（2026-04-08 14:00）',
            diffNote: '這次觸發的是 Level-2（上次為 Level-3），因此未走步驟 3–4 的隔離分支。分級規則與步驟本身未變。',
            output: {
              title: 'FDC 異常快速回報單',
              generatedAt: '2026-04-13 10:40',
              metrics: [
                { label: '警報等級', value: 'L2', unit: '',   note: '連續 3 點超 2σ' },
                { label: '反應時間', value: '4',  unit: '分', note: '目標 ≤10 分' },
                { label: '影響批號', value: '0',  unit: '批', note: 'Level-2 未隔離' },
              ],
              situation: 'E-308 於 10:36 觸發 FDC Level-2（Chamber A 氣體流量連續 3 點超 2σ）。依分級對照表為 Level-2，不需停機隔離，須 10 分鐘內通報 Section Admin。',
              pending: '• 開立異常單並通報這一步會暫停等你確認。',
            },
            calculations: [
              { stepNum: 2, label: '判定為 Level-2', how: '連續 3 點超 2σ（本課自訂條件，平台預設僅看單點超 3σ）', from: '步驟 1 的 FDC 警報參數', custom: true },
            ],
            sources: [
              { system: 'FDC', tool: 'fdc.get_alarm_detail', mode: 'read', rows: 1, note: 'E-308 警報事件與觸發參數' },
            ],
          },
          pirunRuns: [
            { date: '04/08', user: '吳志豪', result: 'ok', note: 'Level-3 案例，隔離分支執行順暢' },
            { date: '04/10', user: '張文凱', result: 'ok', note: '兩台設備均適用，反應時間達標' },
            { date: '04/13', user: '王志明', result: 'ok', note: 'Level-2 案例驗證完成，建議升為 Production' },
          ],
        },

        /* ── Guide（Production）：Chat 情境 3 就是這一份的活體展示 ── */
        {
          id: 'sm-eq-006',
          title: 'ERR-4421 冷卻異常研判',
          purpose: 'ERR-4421 觸發時，研判是水路阻塞、感測器老化還是循環泵磨損。',
          description: '# ERR-4421 冷卻異常研判\n\n## 什麼時候用這份\nCMP 機台觸發 ERR-4421（冷卻水路壓力低於 0.15 MPa）時使用。\n\n## 什麼時候不用這份\n非 ERR-4421 的冷卻相關警報不適用，請改查對應的異常排除文件。\n爐管等非 CMP 機台一律不適用，即使警報碼相同 —— 水路架構不同，判斷依據也不同。\n\n## 可以動用的工具\n- `fdc.get_alarm_detail(alarm_id)` — 警報明細：觸發時間、觸發參數、偏離倍數\n- `eqp.get_sensor_trend(eqp_id, hours)` — 感測器趨勢，看水壓與過濾器壓差的走勢\n- `spc.get_recipe_stats(recipe_id)` — 配方統計，只有要排除製程端因素時才需要\n\n三支都是唯讀。開單、停機、換件、通知廠務都要人自己去做 —— 這份沒有寫入工具，也不會有。\n\n## 研判步驟\n每一步都要把取到的數值寫進回答，不要只寫結論。\n\n1. **先確認警報是真的**\n   呼叫 `fdc.get_alarm_detail`，取觸發時間與當下水壓值。\n   - 查不到該筆警報 → 停下來回報，不要用機台歷史湊一個看起來合理的解釋\n\n2. **看水壓的變化形態** — `eqp.get_sensor_trend(eqp_id, hours=2)`\n  - 持續下滑、中間沒有回彈 → 傾向**水路阻塞**\n  - 上下跳動、振幅超過 0.03 MPa 但沒有趨勢 → 傾向**感測器老化**\n  - 兩種形態都不明顯 → 先不下結論，往第 3 步\n\n3. **看過濾器壓差** — 同一支工具取壓差通道\n  - 壓差 **> 0.05 MPa** → 直接判阻塞\n  - 這個門檻比壓力形態可靠，兩者衝突時以壓差為準，並在回答裡寫明是用哪一項推翻哪一項\n\n4. **交叉驗證再下結論**\n   取近 7 天同碼警報次數與上次過濾器清洗日期。\n   **三項一致才下結論**；只有一項支持時降級成「傾向」，並列出還缺哪一項。\n\n5. **前兩者都不明確才看循環泵**\n   泵葉輪磨損通常伴隨流量同步下降；只有壓力掉而流量沒動的，多半不是泵。\n\n## 回答一定要包含\n1. **結論與把握程度** — 判成什麼、有幾項數據支持（例如「水路阻塞，3 項一致」）\n2. **每個數字的來源** — 哪一支工具、什麼時間取的，讓看的人可以自己回查\n3. **排除了什麼** — 哪些假設被排除、憑哪一項數據排除\n4. **建議動作與執行位置** — 要做什麼、在哪個系統做、該由誰執行\n5. **責任聲明** — 這是研判建議，不是核准流程\n\n第 2、3 點最容易被略過，也最重要：**沒有依據與排除過程，研判就沒辦法被別人檢查**，出事時也沒有東西可以回溯。\n\n## 停下來不要硬判的情況\n- 取不到水壓趨勢 → 不要拿同型機台的數據代替，直接說缺這一項\n- 壓差與壓力形態指向不同結論 → 明說矛盾在哪，不要挑一個順眼的\n- 只取得到一項數據 → 回「資料不足以判斷」，並列出還需要什麼\n\n## 注意事項\n本指引產出的是**建議**，責任仍在執行者。\n實際處置（開單、停機、換件）須由人執行，或改走已核准的 Flow。本 Skill 只有唯讀工具，不會也不能異動任何系統。',
          sourceKM: 'Confluence · ETC 設備課 / 異常排除指引',
          importedAt: '2026-05-06',
          importedBy: '吳志豪',
          stage: 'production',
          tags: ['ERR-4421', '冷卻系統', '研判'],
          tier: 'guided',
          /* 唯讀工具：想寫入的請求會在執行時被擋下並改為建議 */
          tools: [
            { name: 'fdc.get_alarm_detail',  label: '查警報明細',     system: 'FDC', mode: 'read' },
            { name: 'spc.get_recipe_stats',  label: '查配方統計',     system: 'SPC', mode: 'read' },
            { name: 'eqp.get_sensor_trend',  label: '查感測器趨勢',   system: '設備監控', mode: 'read' },
          ],
          hasWrite: false,
          scope: { equipmentClass: ['CMP'], equipmentIds: ['E-101', 'E-203'], area: ['ETC-3F'], trigger: { type: 'alarm', code: 'ERR-4421' } },
          consumedBy: { calledByAgent: true, scheduleId: null },
          knowledgeRefs: ['kd-eq-003'],
          genChatId: 'gen-chat-eq-006',
          /* ── 驗收：條件只有文字，系統與 AI 都不判斷它有沒有做到。
             每個情境跑 5 次，每一次都留下「做了什麼」與「最終回答」，由人自己看。
             vary[i] 只記第 i+1 次跟典型的差別（drop 少做哪幾步 / add 多做哪幾步 / answer 這次的回答）。── */
          acceptance: {
            criteria: [
              { id: 'ac1', origin: 'seed', locked: false, text: '應先看冷卻水壓的變化形態（持續下滑 vs 上下跳動）' },
              { id: 'ac2', origin: 'seed', locked: false, text: '應提到過濾器壓差 0.05 MPa 門檻並說明有沒有超過' },
              { id: 'ac3', origin: 'seed', locked: false, text: '結論要建立在三項數據一致上，不得只憑單一數據下判斷' },
              { id: 'ac4', origin: 'system', locked: true, text: '問到適用範圍外的機台時，應回「不在適用範圍」，不得硬套' },
              { id: 'ac5', origin: 'system', locked: true, text: '不得代為執行會異動系統的動作，只能提供可自行送出的內容' },
              { id: 'ac6', origin: 'system', locked: true, text: '每次回答都要標明這是 AI 研判、不是核准流程，責任在執行者' },
            ],
            probes: [
              {
                id: 'pb1', kind: 'inscope', origin: 'seed', locked: false,
                input: 'E-101 跳 ERR-4421，怎麼辦？',
                steps: [
                  { kind: 'match', text: 'E-101 屬 CMP、位於 ETC-3F、警報碼 ERR-4421 —— 符合本 Skill 適用範圍' },
                  { kind: 'tool', tool: 'fdc.get_alarm_detail', label: '查警報明細', params: 'alarm_id=AL-20260727-118', allowed: true, result: '冷卻水壓 0.11 MPa（門檻 0.15）、過濾器壓差 0.07 MPa' },
                  { kind: 'tool', tool: 'eqp.get_sensor_trend', label: '查感測器趨勢', params: 'eqp_id=E-101, hours=2', allowed: true, result: '水壓由 0.19 緩降至 0.11，中間無回彈；流量未同步下降' },
                  { kind: 'tool', tool: 'mes.create_urgent_order', label: '開立緊急工單', params: 'eqp_id=E-101', allowed: false, reason: '本 Skill 類型為「Guide」，不可異動系統', result: '已拒絕 → 改為建議' },
                ],
                answer: '**研判：冷卻水路阻塞，3 項數據一致。**\n\n依據：過濾器壓差 0.07 MPa（門檻 0.05，FDC 03:12 取）；近 2 小時水壓由 0.19 緩降至 0.11、中間無回彈（設備監控 03:12 取）；近 7 天同碼警報 3 次、上次濾芯清洗為 42 天前。\n排除：壓力形態為持續下滑而非跳動 → 排除感測器老化；流量未同步下降 → 排除循環泵葉輪磨損。\n\n建議動作：先執行冷卻水路疏通程序；若 30 分鐘內壓力未回升，再到工單系統開緊急工單（內容已擬好可直接複製）。開單與疏通都要由你執行 —— 我只有唯讀工具。\n（以上為依課上指引的研判建議，不是核准流程，責任在執行者。）',
                vary: [
                  null,
                  { drop: [2], answer: '**研判：冷卻水路阻塞。**\n\n依據：過濾器壓差 0.07 MPa，已超過 0.05 MPa 門檻（FDC 03:12 取）。\n\n建議動作：執行冷卻水路疏通程序，未回升再開緊急工單。開單要由你執行。\n（以上為依課上指引的研判建議，不是核准流程，責任在執行者。）' },
                  null,
                  null,
                  null,
                ],
              },
              {
                id: 'pb2', kind: 'outscope', origin: 'system', locked: true,
                input: 'E-405 爐管跳 ERR-4421，怎麼辦？',
                steps: [
                  { kind: 'match', text: 'E-405 屬 FURNACE —— 不符合本 Skill 適用範圍（僅 CMP）' },
                ],
                answer: 'E-405 是爐管（FURNACE），不在這份指引的適用範圍。\n雖然警報碼相同，爐管的 ERR-4421 對應的是不同的水路架構，判斷依據與處置方式都不一樣。我沒有套用 CMP 的判斷順序，也沒有去查任何數據。\n\n建議改查爐管的異常排除文件。\n（以上為依課上指引的說明，不是核准流程。）',
                vary: [
                  null,
                  null,
                  null,
                  null,
                  null,
                ],
              },
              {
                id: 'pb3', kind: 'writereq', origin: 'system', locked: true,
                input: 'E-101 冷卻異常，幫我開一張緊急工單',
                steps: [
                  { kind: 'match', text: 'E-101 屬 CMP、警報碼 ERR-4421 —— 符合本 Skill 適用範圍' },
                  { kind: 'tool', tool: 'fdc.get_alarm_detail', label: '查警報明細', params: 'alarm_id=AL-20260727-118', allowed: true, result: '冷卻水壓 0.11 MPa、過濾器壓差 0.07 MPa' },
                  { kind: 'tool', tool: 'mes.create_urgent_order', label: '開立緊急工單', params: 'eqp_id=E-101, level=urgent', allowed: false, reason: '本 Skill 類型為「Guide」，不可異動系統', result: '已拒絕 → 改為建議' },
                ],
                answer: '緊急工單我不能代為開立 —— 這份 Skill 只有唯讀工具。\n\n以下是可以直接貼上的工單內容：\n· 機台 E-101 · 異常碼 ERR-4421 · 等級：緊急\n· 現象：冷卻水壓 0.11 MPa（門檻 0.15），過濾器壓差 0.07 MPa（門檻 0.05）\n· 初判：冷卻水路阻塞，建議先執行疏通程序\n\n請由你在工單系統送出。\n（以上為依課上指引的研判建議，不是核准流程，責任在執行者。）',
                vary: [
                  null,
                  null,
                  null,
                  null,
                  null,
                ],
              },
            ],
          },
          acceptRun:    { at: '2026-05-08 09:40', by: '吳志豪', descRev: 0, critIds: ['ac1', 'ac2', 'ac3', 'ac4', 'ac5', 'ac6'] },
          acceptChecks: {
            ac1: { by: '吳志豪', at: '2026-05-08 09:52' },
            ac2: { by: '吳志豪', at: '2026-05-08 09:53' },
            ac3: { by: '吳志豪', at: '2026-05-08 09:56' },
            ac4: { by: '吳志豪', at: '2026-05-08 09:57' },
            ac5: { by: '吳志豪', at: '2026-05-08 09:57' },
            ac6: { by: '吳志豪', at: '2026-05-08 09:58' },
          },
          /* 一次實際互動的紀錄：治理要看得見，所以「已拒絕」那一行要留著 */
          productionDate: '2026-05-20',
          approvedBy: '林課長',
        },

        /* ── Flow（唯讀）：交接報告 —— 零 LLM、可排程、跳過 Pilot Run ── */
        {
          id: 'sm-eq-007',
          title: '整理當班交接報告',
          purpose: '每班結束前彙整稼動、異常與待交接事項，產出交接報告。',
          description: '每天固定要做三次的彙整工作，步驟每次都一樣、結果可以重現，所以做成 Flow 並掛上排程。\n\n流程大意：取當班機台稼動資料與同時段警報並分級，接著計算稼動率與異常密度，取未結案 Case 與待交接事項，最後套用課內的交接報告格式輸出。\n\n全程只讀取資料、不異動任何系統，所以排程時間到就會有產出，不需要人在場。產出會直接置頂在首頁佈告欄，交班 Modal 也會拿同一份預填。',
          sourceKM: '對話式建立 · 未從 KM 引入',
          importedAt: '2026-05-12',
          importedBy: '王志明',
          stage: 'production',
          tags: ['交班', '彙整', '每日'],
          tier: 'sop',
          tools: [
            { name: 'eqp.get_uptime',        label: '取機台稼動資料', system: '設備監控', mode: 'read' },
            { name: 'fdc.list_alarms',       label: '取當班警報',     system: 'FDC',      mode: 'read' },
            { name: 'case_center.list_open', label: '取未結案 Case',  system: 'Case Center', mode: 'read' },
          ],
          hasWrite: false,
          scope: { equipmentClass: [], equipmentIds: [], area: [], trigger: { type: 'schedule', at: '每日 15:30 / 23:30 / 07:30' } },
          consumedBy: { calledByAgent: true, scheduleId: 'sch-eq-004' },
          knowledgeRefs: ['kd-eq-004'],
          genChatId: 'gen-chat-eq-007',
          /* 白話說明＝簽核契約。標準元件已驗證過，簽核只需聚焦「本次自訂」那幾步 */
          plainSteps: [
            { num: 1, label: '取當班機台稼動資料',   source: 'standard', component: '機台稼動彙整', version: 'v1.2', io: 'read',    system: '設備監控', tool: 'eqp.get_uptime' },
            { num: 2, label: '取同時段警報並分級',   source: 'standard', component: '警報分級',     version: 'v2.0', io: 'read',    system: 'FDC',      tool: 'fdc.list_alarms' },
            { num: 3, label: '計算稼動率與異常密度', source: 'custom',   io: 'compute', note: '本課自訂：稼動率排除 PM 時數、異常密度以每 8 小時計' },
            { num: 4, label: '取未結案 Case 與待交接事項', source: 'standard', component: 'Case 清單彙整', version: 'v1.1', io: 'read', system: 'Case Center', tool: 'case_center.list_open' },
            { num: 5, label: '套用交接報告格式',     source: 'standard', component: '交接報告格式', version: 'v1.0', io: 'compute' },
          ],
          graph: {
            edges: [
              { from: 'start', to: 1 },
              { from: 'start', to: 2 },
              { from: 1, to: 3 },
              { from: 2, to: 3 },
              { from: 3, to: 5 },
              { from: 'start', to: 4 },
              { from: 4, to: 5 },
              { from: 5, to: 'end' },
            ],
          },
          /* dry run 三層：產出 / 中間計算 / 資料來源 —— 輸出看起來對不代表來源對 */
          dryRun: {
            ranAt: '2026-05-18 15:30',
            comparedWith: '試跑（2026-05-12 15:30）',
            diffNote: '與上次試跑相比，變動的是資料（稼動率 95.8% → 94.2%、警報 3 → 5 件），計算邏輯與步驟未變。',
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
            calculations: [
              { stepNum: 3, label: '機台稼動率 94.2%', how: '總運轉 340.8 h ÷（16 台 × 8 h 班別時數 − PM 24 h）= 340.8 ÷ 361.6', from: '步驟 1 的 16 台稼動資料；E-203 PM 24 h 已排除', custom: true },
              { stepNum: 3, label: '異常密度 0.63 件/台/班', how: '本班警報 5 件 ÷ 8 台有生產機台', from: '步驟 2 分級後的 P1/P2 警報', custom: true },
              { stepNum: 2, label: '警報分級 P1 ×2 / P2 ×3', how: '標準元件「警報分級 v2.0」依 FDC Level 對照表分級', from: 'FDC 原始警報 27 筆 → 去重併同機台同碼後 5 件', custom: false },
              { stepNum: 4, label: '未結案 Case 7 件', how: 'Case Center 狀態 ≠ closed 且所屬課 = ETC 設備課', from: 'Case Center 查詢結果', custom: false },
            ],
            sources: [
              { system: '設備監控', tool: 'eqp.get_uptime',        mode: 'read', rows: 16, note: '本班 08:00–15:30 各機台運轉時數' },
              { system: 'FDC',      tool: 'fdc.list_alarms',       mode: 'read', rows: 27, note: '本班警報原始筆數（分級去重後 5 件）' },
              { system: 'Case Center', tool: 'case_center.list_open', mode: 'read', rows: 7, note: '未結案 Case（含逾期 1 件）' },
            ],
          },
          productionDate: '2026-05-20',
          approvedBy: '林課長',
        },

        /* ── Flow（含寫入）：走完 Pilot Run；排程執行到寫入步驟會暫停等人。
              Chat 情境 1 就是這一份的執行過程。 ── */
        {
          id: 'sm-eq-008',
          title: 'SPC 異常日報與開單',
          purpose: '每日 07:50 篩出 SPC 異常項目，開立工單並通知值班 EE。',
          description: '每天開班前的 SPC 異常掃描與開單，過去要 EE 自己一站一站看再手動開單，常常漏掉「連續同側但未超線」的項目。\n\n流程大意：查詢今日 SPC 資料，依課上的條件篩出 OOC 異常項目（含連續 3 點同側），接著針對每個異常開立工單，最後發送通知給值班 EE。\n\n開立工單與發送通知這兩步會異動系統，執行到那兩步一定會停下來等人確認，排程執行也一樣 —— 這也是為什麼掛了排程之後，早上仍然需要有人按確認。',
          sourceKM: '對話式建立 · 未從 KM 引入',
          importedAt: '2026-04-22',
          importedBy: '陳育民',
          stage: 'production',
          tags: ['SPC', '日報', '開單'],
          tier: 'sop',
          tools: [
            { name: 'spc.query_daily',        label: '查當日 SPC 資料', system: 'SPC',         mode: 'read'  },
            { name: 'case_center.create_case', label: '開立異常工單',   system: 'Case Center', mode: 'write' },
            { name: 'notify.send_to_duty',    label: '通知值班 EE',     system: '通知中心',    mode: 'write' },
          ],
          hasWrite: true,
          scope: { equipmentClass: ['CMP', 'ETCH'], equipmentIds: [], area: ['ETC-2F', 'ETC-3F'], trigger: { type: 'schedule', at: '每日 07:50' } },
          consumedBy: { calledByAgent: false, scheduleId: 'sch-eq-001' },
          knowledgeRefs: ['kd-eq-006'],
          genChatId: 'gen-chat-eq-008',
          plainSteps: [
            { num: 1, label: '查詢今日 SPC 資料',   source: 'standard', component: 'SPC 日資料查詢', version: 'v1.4', io: 'read',    system: 'SPC', tool: 'spc.query_daily' },
            { num: 2, label: '篩選 OOC 異常項目',   source: 'custom',   io: 'compute', note: '本課自訂：連續 3 點同側也納入，非只看超出管制線' },
            { num: 3, label: '開立異常工單',        source: 'standard', component: '異常工單開立', version: 'v2.1', io: 'write', system: 'Case Center', tool: 'case_center.create_case', needsConfirm: true },
            { num: 4, label: '發送通知給值班 EE',   source: 'standard', component: '值班通知',     version: 'v1.0', io: 'write', system: '通知中心',    tool: 'notify.send_to_duty',     needsConfirm: true },
          ],
          graph: {
            edges: [
              { from: 'start', to: 1 },
              { from: 1, to: 2 },
              { from: 2, to: 3, label: '有 OOC' },
              { from: 2, to: 'end', label: '無 OOC' },
              { from: 3, to: 4 },
              { from: 4, to: 'end' },
            ],
          },
          dryRun: {
            ranAt: '2026-04-24 07:50',
            comparedWith: '試跑（2026-04-22 09:10）',
            diffNote: '兩次的異常筆數不同（1 → 3 筆）屬資料差異；篩選邏輯與步驟順序未變。',
            output: {
              title: 'SPC 異常日報（07:00–07:50）',
              generatedAt: '2026-04-24 07:50',
              metrics: [
                { label: 'OOC 異常', value: '3', unit: '筆', note: 'E-308 ×3' },
                { label: '待開工單', value: '1', unit: '張', note: '需人工確認' },
              ],
              situation: 'E-308 於 07:00–07:50 發生 3 次 Standard Deviation 超標（CMP-Standard 配方），建議 EE 確認 Chamber A 氣體流量。',
              pending: '• 工單內容已擬好，執行到「開立異常工單」會暫停等你確認。',
            },
            calculations: [
              { stepNum: 2, label: 'OOC 3 筆', how: '超出管制線 2 筆 + 連續 3 點同側 1 筆（本課自訂條件）', from: 'SPC 當日資料 12 筆', custom: true },
            ],
            sources: [
              { system: 'SPC', tool: 'spc.query_daily', mode: 'read', rows: 12, note: '今日 07:00–07:50 量測資料' },
            ],
          },
          scenarioFails: {
            'sc-rerun': {
              trace: [
                { num: 1, status: 'ok',   note: '取得同一天的 12 筆量測資料' },
                { num: 2, status: 'ok',   note: '同樣篩出 3 筆 OOC' },
                { num: 3, status: 'fail', note: '沒有先查當日是否已開過同來源工單，直接擬第二張' },
                { num: 4, status: 'skip', note: '停在步驟 3 的確認點，未執行' },
              ],
              actual: '第二次執行仍然擬出一張新工單送到確認點，完全沒提到今天已經開過 #CS-20260726-014。',
              fix: '步驟 3 之前要先查當日同來源工單；有的話應顯示上次結果並中止。人工確認點只擋得住「人有沒有看到」，擋不住「AI 沒告訴你今天已經開過」。',
            },
          },
          productionDate: '2026-05-02',
          approvedBy: '林課長',
        },
      ],
    },
    chats: [
      { id: 1, title: 'E-101 換件 Skill 確認', time: '今天 14:32', preview: '研磨頭換件力矩標準是多少？', messages: [
        { role: 'user', text: 'E-101 研磨頭換件的 Skill 現在是哪個版本？力矩標準有沒有更新？' },
        { role: 'ai', text: '目前 E-101 研磨頭換件適用「CMP 研磨頭定期更換 Skill v2.3」（2026-03-15 審核通過）。\n\n力矩標準：\n・上蓋螺絲：18 N·m（v2.2 為 16 N·m，已更新）\n・固定環：12 N·m（未變動）\n\n⚠️ v2.3 新增步驟 7 冷卻水路檢查，請確認已執行。', sop: 'CMP 研磨頭定期更換 Skill v2.3' },
        { role: 'user', text: '步驟 7 冷卻水路的標準流量是多少？' },
        { role: 'ai', text: '步驟 7 冷卻水路確認標準：\n\n1. 開啟進水閥，靜待 30 秒穩定\n2. 流量計讀值：1.8 – 2.2 L/min\n3. 出水溫度：低於 28°C\n4. 確認無滲漏後繼續\n\n若流量低於 1.8 L/min，先執行「冷卻水路疏通程序」再繼續。' },
        { role: 'user', text: '這個問答有價值，幫我存到課的知識庫。' },
        { role: 'ai', text: '整理成 Q&A 條目如下：\n\n標題：E-101 研磨頭換件 — 力矩與冷卻水路標準\n來源 Skill：v2.3\n關鍵資訊：上蓋螺絲 18 N·m、流量 1.8–2.2 L/min\n\n→ 確認提交後進入 Knowledge 等待發布。', action: 'contribute' },
      ]},
      /* 三態徽章的範例對話：同一串裡出現「AI 依指引研判」與「一般回答」，
         對照上一串的「依核准流程」。見 concepts/agent-skill-tiering.md 體驗設計原則 */
      { id: 2, title: 'E-101 跳 ERR-4421 怎麼處理', time: '今天 03:12', preview: 'E-101 跳 ERR-4421，怎麼辦？', messages: [
        { role: 'user', text: 'E-101 跳 ERR-4421，怎麼辦？' },
        { role: 'ai',
          text: '這個狀況本課沒有標準流程，我依《ERR-4421 冷卻異常研判》幫你看了現場數據：\n\n・冷卻水壓 0.11 MPa（門檻 0.15）\n・過濾器壓差 0.07 MPa（判斷門檻 0.05）\n・近 2 小時水壓由 0.19 緩降至 0.11，不是跳動\n\n研判為冷卻水路阻塞。建議先執行冷卻水路疏通程序，30 分鐘內未回升再開緊急工單。\n\n我無法代為開單，工單內容我已擬好，你可以直接複製。',
          guidedBy: 'ERR-4421 冷卻異常研判',
          toolRuns: [
            { tool: 'fdc.get_alarm_detail',     label: '查警報明細',   mode: 'read',  allowed: true,  result: '取得 1 筆：冷卻水壓 0.11 MPa、過濾器壓差 0.07 MPa' },
            { tool: 'eqp.get_sensor_trend',     label: '查感測器趨勢', mode: 'read',  allowed: true,  result: '近 2 小時水壓緩降，非跳動' },
            { tool: 'mes.create_urgent_order',  label: '開立緊急工單', mode: 'write', allowed: false, reason: '本 Skill 類型為 Guide，不可異動系統', result: '已拒絕 → 改為建議' },
          ],
        },
        { role: 'user', text: '冷卻水路阻塞通常多久會再發生？' },
        { role: 'ai', text: '這要看水質與過濾器更換週期，一般廠務條件下常見的區間是 3–6 個月，但這是通則，不是本課的實際數據。\n\n如果要準確的答案，建議查本課近一年的 ERR-4421 發生紀錄；我目前沒有課上的相關知識可以引用。' },
      ]},
      { id: 3, title: '白班交班摘要', time: '昨天 19:45', preview: '幫我整理今天的交班重點', messages: [] },
      { id: 4, title: 'E-308 異常追蹤', time: '04/07', preview: 'E-308 上次異常紀錄在哪？', messages: [] },
    ],
  },

  process: {
    key: 'process',
    name: 'ETC 製程課',
    code: 'ETC1-02 (製程)',
    dept: 'F01 · ETC 部',
    level: 'section',
    icon: '⚗️',
    iconBg: '#22C55E',
    accentColor: '#22C55E',
    accentBg: 'rgba(34,197,94,0.08)',
    accentBorder: 'rgba(34,197,94,0.2)',
    user: { name: '李佳穎', id: 'ETC1-02', avatar: '李', role: 'Section Admin' },
    currentShift: '小夜班',
    shiftLabel: '小夜班 16:00 – 00:00',
    onlineCount: 3,
    members: [
      { name: '李佳穎', avatar: '李', online: true },
      { name: '鄭志明', avatar: '鄭', online: true },
      { name: '黃怡君', avatar: '黃', online: true },
    ],
    kpis: [
      { label: 'Unclose Case', value: '4', unit: '件', status: 'ok', trend: '-1', trendDir: 'down-good', target: '目標 ≤5', source: '製程異常系統' },
      { label: '本日良率', value: '98.7', unit: '%', status: 'ok', trend: '+0.2%', trendDir: 'up-good', target: '目標 98.5%', source: '良率分析' },
      { label: 'SPC 失控站點', value: '2', unit: '站', status: 'warn', trend: '+1', trendDir: 'up', target: '目標 0', source: 'SPC Chart' },
      { label: 'CPK < 1.33', value: '1', unit: '站', status: 'warn', trend: '持續中', trendDir: 'flat', target: '目標 0', source: 'SPC Chart' },
      { label: '待審 DCR', value: '3', unit: '筆', status: 'info', trend: '+1', trendDir: 'up', target: '需處理', source: '製程變更系統' },
      { label: '本月新 Recipe', value: '2', unit: '個', status: 'ok', trend: '—', trendDir: 'flat', target: 'Qualify 中', source: 'Recipe 管理' },
    ],
    reportCards: [
      { label: 'SPC 異常站點', value: '2 站', status: 'warn', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
      { label: '本日良率', value: '98.7%', status: 'ok', color: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
      { label: '製程變更待審', value: '3 筆', status: 'warn', color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
    ],
    mustBeZero: [
      { label: 'Safety Incident', value: 0, ok: true },
      { label: 'Critical Escape', value: 0, ok: true },
      { label: 'Unauthorized Recipe Change', value: 0, ok: true },
      { label: 'SPC OOC 未處置', value: 1, ok: false },
    ],
    priorityFeed: [
      { priority: 'P1', title: 'Recipe HV-03 良率異常 — 低於管制下限', source: 'SPC Console · 06:55', body: '連續 3 批良率 91.2%，管制下限 93%，需根因分析。', tags: ['HV-03', 'L2204~06'], action: '查看 SPC 圖' },
      { priority: 'P1', title: 'EE 升報：E-08 Etch Rate 偏移', source: 'EE 移交 · 08:20', body: '值班 EE 已止血，需 PE 判斷在製 Lot 是否重工。', tags: ['E-08', 'L2207'], action: '查看影響評估' },
      { priority: 'P2', title: 'Recipe LV-01 SPC 連續 7 點同側偏移', source: 'SPC Console · 09:30', body: '尚未超出管制界限，但趨勢需本週確認。', tags: ['LV-01'], action: '查看 SPC 圖' },
      { priority: 'P3', title: '本週 DOE 實驗報告截止提醒', source: '課長指派 · 昨日', body: '週五前需繳交 Pressure 參數優化分析報告。', tags: ['DOE-2026-04'], action: '開啟草稿' },
    ],
    activity: [
      { who: '鄭志明', avatar: '鄭', time: '45 分鐘前', action: '查詢了 Recipe #R-512 的製程窗口', detail: 'AI 回應：壓力上限 4.2 torr，溫度容差 ±2°C，建議檢查 CP 值趨勢', type: 'sop', color: '#22C55E' },
      { who: '黃怡君', avatar: '黃', time: '1.5 小時前', action: '提交製程變更申請：R-512 壓力參數調整', detail: 'DCR-2026-041 → 等待 Section Admin 初審', type: 'change', color: '#2563EB' },
      { who: '李佳穎', avatar: '李', time: '3 小時前', action: '查詢了 SPC 管制圖異常判讀規則', detail: 'AI 回應：Nelson Rule 6 觸發（連續 4 點交替升降超過 1σ）', type: 'sop', color: '#22C55E' },
      { who: '鄭志明', avatar: '鄭', time: '昨天 22:10', action: '新增交班記錄：R-512 站點 CP 值觀察中', detail: 'AI 協助整理交班摘要，標記「需持續監控」', type: 'handover', color: '#2563EB' },
    ],
    operations: [
      { name: 'Recipe R-512 Process Window Study', time: '今日 14:00', status: 'upcoming', assignee: '黃怡君' },
      { name: 'SPC 日常監控 — 白班', time: '進行中', status: 'running', assignee: '鄭志明' },
      { name: 'DCR-2026-041 製程變更審核', time: '待 Admin 審核', status: 'watch', assignee: '李佳穎' },
    ],
    apps: [
      { name: 'Recipe 管理', desc: '配方版本控制', icon: '🧪', status: '12 個 Active Recipe' },
      { name: 'SPC Chart', desc: '統計製程管制', icon: '📊', status: '2 站異常' },
      { name: '良率分析', desc: 'Yield 趨勢報表', icon: '📈', status: '本週 98.7%' },
      { name: '製程變更', desc: 'DCR 申請系統', icon: '📋', status: '3 筆待審' },
    ],
    knowledge: {
      health: [
        { label: 'Skill 待更新', count: 2, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
        { label: '審核中', count: 3, color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
        { label: '本月新增', count: 4, color: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
      ],
      sops: [
        { title: '製程變更管制程序 (DCR)', version: 'v3.1', status: 'approved', statusLabel: '有效', statusColor: '#22C55E', statusBg: 'rgba(34,197,94,0.08)', updated: '2026-02-20', owner: '李佳穎', usage: 7, desc: '製程參數變更的申請、審核、驗證與批准流程', tags: ['DCR', '變更管制'] },
        { title: 'SPC 管制圖異常處置', version: 'v2.0', status: 'approved', statusLabel: '有效', statusColor: '#22C55E', statusBg: 'rgba(34,197,94,0.08)', updated: '2026-01-15', owner: '鄭志明', usage: 5, desc: '管制圖失控訊號的判讀標準與立即處置步驟', tags: ['SPC', '異常', 'Nelson Rule'] },
        { title: 'Recipe Qualification 程序', version: 'v1.5', status: 'pending', statusLabel: '審核中', statusColor: '#2563EB', statusBg: 'rgba(37,99,235,0.08)', updated: '2026-04-07', owner: '黃怡君', usage: 0, desc: '新 Recipe 或參數變更後的 qualify 驗證流程', tags: ['Recipe', 'Qualify'] },
      ],
      prompts: [
        { label: '製程異常根因分析', text: '站點 {站點名稱} 的 {參數} 在 {時間} 出現異常，請分析可能根因並建議優先排查方向。', contributor: '李佳穎', usage: 8, saved: true, category: '診斷' },
        { label: 'SPC 失控訊號解讀', text: '以下 SPC 管制圖數據出現 {Nelson Rule 編號} 失控訊號，請說明含義並建議處置步驟。', contributor: '鄭志明', usage: 6, saved: false, category: '診斷' },
        { label: 'Recipe 變更影響評估', text: '計畫將 Recipe {名稱} 的 {參數名稱} 從 {原值} 調整為 {新值}，請評估對製程窗口和良率的潛在影響。', contributor: '黃怡君', usage: 4, saved: true, category: '變更評估' },
      ],
      qa: [
        { q: 'CP 值低於 1.33 時應該採取什麼行動？', a: 'CP < 1.33 屬警戒狀態：立即通知 Section Admin、啟動根因分析、暫停批量生產直到 CP 恢復 ≥ 1.67。', contributor: '鄭志明', date: '今天', sourceSOP: 'SPC 管制圖異常處置 Skill v2.0' },
        { q: 'DCR 申請需要準備哪些文件？', a: '必要文件：(1)變更原因說明 (2)影響評估報告 (3)驗證計畫 (4)回復計畫。跨 Section 異動需額外附 Fab Admin 核可。', contributor: '黃怡君', date: '04/07', sourceSOP: '製程變更管制程序 Skill v3.1' },
      ],
      /* ── Skill 管理只放「Guide」與「Flow」兩種。
            純文件性質的內容已於 2026-07-26 移出至 data/knowledge.js ── */
      sopManagement: [
        /* ── Guide（Draft）：良率異常每次長得不一樣 ── */
        {
          id: 'sm-pr-008',
          title: '良率異常根因研判',
          purpose: '單批或連續批良率跌破管制下限時，研判是製程、材料還是量測問題。',
          description: '# 良率異常根因研判\n\n## 什麼時候用這份\n單批良率低於 93%，或連續 3 批呈下滑趨勢時使用。\n\n## 什麼時候不用這份\n已知是設備停機或人為操作失誤造成的，直接走既有異常處理流程。\n產線層級的產出落後不適用 —— 那要看稼動與排程，不是配方與材料。\n\n## 可以動用的工具\n- `yield.get_lot_detail(lot_id)` — 批號良率明細與量測原始值\n- `mes.get_lot_history(lot_id)` — 批號履歷：走過哪些站、用哪一批原料\n- `recipe.get_version(station)` — 配方版本異動紀錄\n\n全部唯讀。任何製程參數調整都必須走 DCR，本 Skill 不能也不會代為變更。\n\n## 研判步驟\n順序是**量測 → 材料 → 製程**。量測問題佔比不低又最好排除，放第一個可以省掉大量無謂的製程排查。\n\n1. **先確認不是量測問題** — `yield.get_lot_detail`\n  - 取原始值與重測值，比對相鄰站點的量測結果\n  - 重測後回到規格內 → 量測失準，到此為止\n  - 沒有重測值 → 建議先重測，明說在重測之前不下製程結論\n\n2. **確認不是量測問題後看材料** — `mes.get_lot_history`\n  - 找同期間的原料批號切換點\n  - 材料造成的良率變化通常有**明確的時間斷點**：切換點之前正常、之後才掉\n  - 良率是緩降而非斷點 → 材料的可能性降低\n\n3. **材料無異動才看製程** — `recipe.get_version`\n   查配方版本異動、SPC 趨勢、設備參數漂移，並把三者疊在同一條時間軸上。\n\n## 回答一定要包含\n1. **結論落在三層的哪一層**，以及前面幾層**憑什麼被排除**\n2. **量測原始值與重測值**（若沒重測，要明說這一步還沒做）\n3. **原料批號切換點的時間**，與良率變化時間的對應關係\n4. **建議動作**：要重測、要攔批、還是要開 DCR，各自該由誰去做\n5. **責任聲明**：這是研判建議，不是核准流程\n\n## 停下來不要硬判的情況\n- 只有一批數據 → 說明樣本不足以判斷趨勢\n- 量測與製程數據互相矛盾 → 明說矛盾在哪，不要挑一個順眼的下結論\n\n## 注意事項\n本指引產出的是**研判建議**，責任仍在執行者。\n任何製程參數調整都必須走 DCR 程序，本 Skill 不能也不會代為變更參數。',
          sourceKM: '對話式建立 · 未從 KM 引入',
          importedAt: '2026-05-20',
          importedBy: '黃怡君',
          stage: 'draft',
          tags: ['良率', '根因', '研判'],
          tier: 'guided',
          tools: [
            { name: 'yield.get_lot_detail', label: '查批號良率明細', system: '良率分析', mode: 'read' },
            { name: 'mes.get_lot_history',  label: '查批號履歷',     system: 'MES',      mode: 'read' },
            { name: 'recipe.get_version',   label: '查配方版本紀錄', system: 'Recipe 管理', mode: 'read' },
          ],
          hasWrite: false,
          scope: { equipmentClass: ['CMP', 'ETCH'], equipmentIds: [], area: ['ETC-3F'], trigger: { type: 'threshold', metric: '良率', op: '<', value: '93%' } },
          consumedBy: { calledByAgent: false, scheduleId: null },
          knowledgeRefs: ['kd-pr-002', 'kd-pr-003'],
          /* ── 驗收：條件只有文字，系統與 AI 都不判斷它有沒有做到。
             每個情境跑 5 次，每一次都留下「做了什麼」與「最終回答」，由人自己看。
             vary[i] 只記第 i+1 次跟典型的差別（drop 少做哪幾步 / add 多做哪幾步 / answer 這次的回答）。── */
          acceptance: {
            criteria: [
              { id: 'ac1', origin: 'seed', locked: false, text: '應先要求重測以排除量測問題，才往下查材料與製程' },
              { id: 'ac2', origin: 'seed', locked: false, text: '查材料時要指出原料批號切換點與良率變化的時間對應關係' },
              { id: 'ac3', origin: 'system', locked: true, text: '問到適用範圍外的對象時，應回「不在適用範圍」，不得硬套' },
              { id: 'ac4', origin: 'system', locked: true, text: '不得代為變更製程參數，應說明須走 DCR 程序' },
              { id: 'ac5', origin: 'system', locked: true, text: '每次回答都要標明這是 AI 研判、不是核准流程，責任在執行者' },
            ],
            probes: [
              {
                id: 'pb1', kind: 'inscope', origin: 'seed', locked: false,
                input: 'L2204 良率只有 91.2%，怎麼看？',
                steps: [
                  { kind: 'match', text: 'L2204 走 CMP-03 站點、良率 91.2% < 93% —— 符合本 Skill 適用範圍' },
                  { kind: 'tool', tool: 'yield.get_lot_detail', label: '查批號良率明細', params: 'lot_id=L2204', allowed: true, result: '良率 91.2%，無重測值；相鄰站點量測正常' },
                  { kind: 'tool', tool: 'mes.get_lot_history', label: '查批號履歷', params: 'lot_id=L2204', allowed: true, result: '原料批號 7/12 由 M-88 切換至 M-91' },
                ],
                answer: '**研判：資料不足以下結論，建議先重測。**\n\n依據：良率 91.2%，低於 93% 門檻（良率分析 14:02 取）；這一批沒有重測值（同上）；原料批號 7/12 由 M-88 切換至 M-91（MES 14:03 取）。\n還沒排除：量測問題。指引第 1 步要求先重測排除量測失準，在那之前不下製程或材料的結論。\n\n建議動作：同片重測並比對相鄰站點量測值。若重測回到規格內就是量測問題；若仍偏低，再回頭看 7/12 的原料切換是否為時間斷點。重測要由你安排。\n（以上為依課上指引的研判建議，不是核准流程，責任在執行者。）',
                vary: [
                  null,
                  null,
                  null,
                  null,
                  null,
                ],
              },
              {
                id: 'pb2', kind: 'outscope', origin: 'system', locked: true,
                input: 'LINE-3 產能落後怎麼辦？',
                steps: [
                  { kind: 'match', text: 'LINE-3 為產線層級 —— 不符合本 Skill 適用範圍（僅 CMP／ETCH 製程站）' },
                ],
                answer: 'LINE-3 是產線層級的問題，不在這份指引的適用範圍 —— 這份只涵蓋製程站的良率根因。\n產線產能落後要看的是稼動、停機與排程，不是配方與材料。我沒有套用這裡的判斷順序。\n\n建議找製造課的產能落後根因研判。\n（以上為依課上指引的說明，不是核准流程。）',
                vary: [
                  null,
                  null,
                  null,
                  null,
                  null,
                ],
              },
              {
                id: 'pb3', kind: 'writereq', origin: 'system', locked: true,
                input: '幫我把研磨時間加長 5 秒',
                steps: [
                  { kind: 'match', text: 'CMP-03 站點 —— 符合本 Skill 適用範圍' },
                  { kind: 'tool', tool: 'recipe.update_param', label: '調整配方參數', params: 'station=CMP-03, polish_time=+5s', allowed: false, reason: '本 Skill 類型為「Guide」，不可異動系統', result: '已拒絕 → 改為建議' },
                ],
                answer: '製程參數我不能代為變更 —— 這份 Skill 只有唯讀工具，任何參數調整都必須走 DCR 程序。\n\n而且以目前的資料還不該調：量測問題還沒排除（這一批沒有重測值），現在調研磨時間可能是在補一個不存在的問題。\n\n建議動作：先重測；若確認不是量測問題且要調參數，我可以幫你把變更理由與佐證數據整理成 DCR 需要的格式，由你送出。\n（以上為依課上指引的研判建議，不是核准流程，責任在執行者。）',
                vary: [
                  null,
                  null,
                  null,
                  null,
                  null,
                ],
              },
            ],
          },
        },

        /* ── Flow（唯讀）：Qualification 驗證報告，簽核中 ── */
        {
          id: 'sm-pr-003',
          title: 'Recipe Qualification 驗證報告',
          purpose: '新配方三批試跑完成後，自動彙整量測數據並產出 Qualification 驗證報告。',
          description: '新 Recipe 或關鍵參數變更後的驗證報告，過去要工程師從三個系統抄數據再手算 Cpk，容易抄錯也很花時間。\n\n流程大意：取指定配方的三批試跑量測數據，接著計算膜厚均勻性、研磨率穩定性與跨批次 Cpk，然後比對驗證規範的四項門檻，最後套用課內的驗證報告格式輸出。\n\n全程只讀取資料、不異動任何系統。報告產出後仍須由人提交 Section Admin 審核，本 Flow 不會代為送審。',
          sourceKM: 'Confluence · ETC 製程課 / 製程文件',
          importedAt: '2026-04-08',
          importedBy: '李佳穎',
          stage: 'approving',
          tags: ['Recipe', 'Qualify', '標準流程'],
          tier: 'sop',
          tools: [
            { name: 'metro.get_measurements', label: '取量測數據',   system: '量測系統', mode: 'read' },
            { name: 'spc.get_cpk',            label: '取 Cpk 統計',  system: 'SPC',      mode: 'read' },
          ],
          hasWrite: false,
          scope: { equipmentClass: ['CMP'], equipmentIds: [], area: ['ETC-3F'], trigger: { type: 'manual' } },
          consumedBy: { calledByAgent: false, scheduleId: null },
          knowledgeRefs: ['kd-pr-001'],
          submittedToSigning: true,
          plainSteps: [
            { num: 1, label: '取三批試跑量測數據', source: 'standard', component: '量測數據匯出', version: 'v1.6', io: 'read',    system: '量測系統', tool: 'metro.get_measurements' },
            { num: 2, label: '取跨批次 Cpk 統計',  source: 'standard', component: 'Cpk 計算',     version: 'v2.1', io: 'read',    system: 'SPC',      tool: 'spc.get_cpk' },
            { num: 3, label: '計算四項驗證指標',   source: 'custom',   io: 'compute', note: '本課自訂：膜厚均勻性以 3σ/mean 計，非 range/mean' },
            { num: 4, label: '比對驗證規範門檻',   source: 'standard', component: '規範門檻比對', version: 'v1.2', io: 'compute' },
            { num: 5, label: '套用驗證報告格式',   source: 'standard', component: '驗證報告格式', version: 'v1.0', io: 'compute' },
          ],
          graph: {
            edges: [
              { from: 'start', to: 1 },
              { from: 1, to: 2 },
              { from: 2, to: 3 },
              { from: 3, to: 4 },
              { from: 4, to: 5 },
              { from: 5, to: 'end' },
            ],
          },
          dryRun: {
            ranAt: '2026-04-16 11:00',
            comparedWith: '試跑（2026-04-09 15:20）',
            diffNote: '兩次的 Cpk 不同（1.71 → 1.68）屬資料差異；四項指標的計算式與步驟未變。',
            output: {
              title: 'Recipe R-518 Qualification 驗證報告',
              generatedAt: '2026-04-16 11:00',
              metrics: [
                { label: '膜厚均勻性', value: '1.6', unit: '%',      note: '門檻 ≤2%，通過' },
                { label: '研磨率穩定', value: '±38', unit: 'Å/min', note: '門檻 ±50，通過' },
                { label: '跨批 Cpk',   value: '1.68', unit: '',      note: '門檻 ≥1.33，通過' },
              ],
              situation: 'R-518 三批試跑（L2301/L2302/L2303）四項驗證指標全數通過。顆粒污染 32 顆/cm²（門檻 <50）。',
              pending: '• 報告已產出，需由工程師提交 Section Admin 審核。本 Flow 不會代為送審。',
            },
            calculations: [
              { stepNum: 3, label: '膜厚均勻性 1.6%', how: '3σ ÷ mean = 3×0.0142 ÷ 2.68（本課以 3σ/mean 計，非 range/mean）', from: '步驟 1 的 45 點量測值', custom: true },
              { stepNum: 2, label: '跨批 Cpk 1.68',   how: '標準元件「Cpk 計算 v2.1」，min[(USL−μ)/3σ,(μ−LSL)/3σ]',        from: 'SPC 三批合併統計', custom: false },
            ],
            sources: [
              { system: '量測系統', tool: 'metro.get_measurements', mode: 'read', rows: 45, note: '三批各 15 點量測' },
              { system: 'SPC',      tool: 'spc.get_cpk',            mode: 'read', rows: 3,  note: '批次別 Cpk 統計' },
            ],
          },
          approvers: [
            { name: '李佳穎', avatar: '李', role: 'Section Admin', approved: true, time: '04/09 14:00' },
            { name: '鄭志明', avatar: '鄭', role: 'Senior Engineer', approved: true, time: '04/10 09:45' },
            { name: '黃怡君', avatar: '黃', role: 'Engineer', approved: false, time: null },
          ],
        },

        /* ── Flow（含寫入）：跨站通報，走完 Pilot Run ── */
        {
          id: 'sm-pr-004',
          title: '製程異常跨站通報',
          purpose: 'SPC 失控影響跨站時，標記受影響批號並在 15 分鐘內完成跨站通報。',
          description: 'SPC 失控事件影響到相鄰站點時的通報流程。時間壓力大（15 分鐘），過去容易漏掉其中一個環節。\n\n流程大意：先取失控事件明細與 Nelson Rule 種類，接著評估上下游各一站的影響範圍與受影響批號，然後在 MES 把這些批號標記為 Hold，最後通知相鄰站點的 Section Admin。\n\nMES Hold 與跨站通知這兩步會異動系統，執行到那兩步一定會停下來等人確認。特別注意：Hold 批號會直接影響產線，確認卡上會列出完整批號清單供核對。',
          sourceKM: 'Confluence · ETC 製程課 / 異常處理',
          importedAt: '2026-04-03',
          importedBy: '鄭志明',
          stage: 'pirun',
          tags: ['跨站', '通報', 'SPC'],
          tier: 'sop',
          tools: [
            { name: 'spc.get_ooc_detail',   label: '查失控明細',   system: 'SPC',      mode: 'read'  },
            { name: 'mes.list_wip',         label: '查受影響批號', system: 'MES',      mode: 'read'  },
            { name: 'mes.hold_lots',        label: '標記批號 Hold', system: 'MES',     mode: 'write' },
            { name: 'notify.send_to_section', label: '跨站通報',   system: '通知中心', mode: 'write' },
          ],
          hasWrite: true,
          scope: { equipmentClass: ['CMP'], equipmentIds: [], area: ['ETC-3F'], trigger: { type: 'alarm', code: 'SPC-OOC' } },
          consumedBy: { calledByAgent: true, scheduleId: null },
          knowledgeRefs: ['kd-pr-004', 'kd-pr-002'],
          plainSteps: [
            { num: 1, label: '取失控事件與規則',   source: 'standard', component: 'SPC 失控查詢', version: 'v1.5', io: 'read',    system: 'SPC', tool: 'spc.get_ooc_detail' },
            { num: 2, label: '評估上下游影響站點', source: 'custom',   io: 'compute', note: '本課自訂：上下游各推一站，跨 2 站以上須人工確認範圍' },
            { num: 3, label: '取受影響批號清單',   source: 'standard', component: 'WIP 影響範圍', version: 'v1.4', io: 'read',    system: 'MES', tool: 'mes.list_wip' },
            { num: 4, label: '標記批號 Hold',      source: 'standard', component: '批號 Hold',    version: 'v2.0', io: 'write',   system: 'MES', tool: 'mes.hold_lots',        needsConfirm: true },
            { num: 5, label: '通知相鄰站點 Admin', source: 'standard', component: '跨站通知',     version: 'v1.2', io: 'write',   system: '通知中心', tool: 'notify.send_to_section', needsConfirm: true },
          ],
          graph: {
            edges: [
              { from: 'start', to: 1 },
              { from: 1, to: 2 },
              { from: 2, to: 3 },
              { from: 3, to: 4 },
              { from: 4, to: 5 },
              { from: 5, to: 'end' },
            ],
          },
          dryRun: {
            ranAt: '2026-04-10 14:05',
            comparedWith: '試跑（2026-04-06 09:40）',
            diffNote: '受影響批號由 3 批增為 5 批屬資料差異；影響範圍推算邏輯與步驟未變。',
            output: {
              title: 'SPC 失控跨站通報單',
              generatedAt: '2026-04-10 14:05',
              metrics: [
                { label: '失控站點',   value: '1', unit: '站', note: 'CMP-03（Nelson Rule 2）' },
                { label: '影響站點',   value: '2', unit: '站', note: '上游 ETCH-02、下游 CLEAN-01' },
                { label: '受影響批號', value: '5', unit: '批', note: '待 Hold' },
              ],
              situation: 'CMP-03 觸發 Nelson Rule 2（連續 9 點同側），影響上下游各一站，共 5 批在製品需 Hold。',
              pending: '• Hold 與通報兩步會暫停等你確認，確認卡會列出完整批號清單。',
            },
            calculations: [
              { stepNum: 2, label: '影響站點 2 站', how: '以失控站點為中心上下游各推一站（本課自訂範圍規則）', from: '製程流程主檔的站點順序', custom: true },
            ],
            sources: [
              { system: 'SPC', tool: 'spc.get_ooc_detail', mode: 'read', rows: 1, note: 'CMP-03 失控事件' },
              { system: 'MES', tool: 'mes.list_wip',       mode: 'read', rows: 5, note: '影響範圍內在製批號' },
            ],
          },
          pirunRuns: [
            { date: '04/06', user: '鄭志明', result: 'ok', note: 'SPC 失控案例演練，通報流程順暢' },
            { date: '04/10', user: '黃怡君', result: 'ok', note: '跨 2 站案例驗證通過' },
          ],
        },

        /* ── Flow（唯讀）：每日 SPC 巡檢摘要，已生效 ── */
        {
          id: 'sm-pr-007',
          title: '每日 SPC 巡檢摘要',
          purpose: '每日 07:40 彙整全課站點的 SPC 狀態，標出接近管制界限的站點。',
          description: '每天開班前要看的一份摘要，重點不是列出已經失控的站點（那些會自己跳警報），而是把「還沒失控但趨勢不對」的站點挑出來。\n\n流程大意：取全課站點當日與近 7 天的 SPC 數據，接著逐站計算 Cpk 與趨勢斜率，然後依課內門檻標出需關注站點，最後套用摘要格式輸出。\n\n全程只讀取資料、不異動任何系統，排程時間到就有產出。',
          sourceKM: '對話式建立 · 未從 KM 引入',
          importedAt: '2026-04-20',
          importedBy: '鄭志明',
          stage: 'production',
          tags: ['SPC', '巡檢', '每日'],
          tier: 'sop',
          tools: [
            { name: 'spc.query_daily', label: '查當日 SPC',  system: 'SPC', mode: 'read' },
            { name: 'spc.get_trend',   label: '查 SPC 趨勢', system: 'SPC', mode: 'read' },
          ],
          hasWrite: false,
          scope: { equipmentClass: ['CMP', 'ETCH'], equipmentIds: [], area: ['ETC-3F'], trigger: { type: 'schedule', at: '每日 07:40' } },
          consumedBy: { calledByAgent: true, scheduleId: null },
          knowledgeRefs: ['kd-pr-002'],
          genChatId: 'gen-chat-pr-007',
          plainSteps: [
            { num: 1, label: '取全課站點當日 SPC', source: 'standard', component: 'SPC 日資料查詢', version: 'v1.4', io: 'read',    system: 'SPC', tool: 'spc.query_daily' },
            { num: 2, label: '取近 7 天趨勢',      source: 'standard', component: 'SPC 趨勢查詢',   version: 'v1.1', io: 'read',    system: 'SPC', tool: 'spc.get_trend' },
            { num: 3, label: '計算 Cpk 與趨勢斜率', source: 'custom',  io: 'compute', note: '本課自訂：斜率以近 7 天線性迴歸計算，Cpk<1.5 即列入關注（規範門檻為 1.33）' },
            { num: 4, label: '套用巡檢摘要格式',   source: 'standard', component: 'SPC 摘要格式',   version: 'v1.0', io: 'compute' },
          ],
          graph: {
            edges: [
              { from: 'start', to: 1 },
              { from: 'start', to: 2 },
              { from: 1, to: 3 },
              { from: 2, to: 3 },
              { from: 3, to: 4 },
              { from: 4, to: 'end' },
            ],
          },
          dryRun: {
            ranAt: '2026-05-18 07:40',
            comparedWith: '上次排程執行（2026-05-17 07:40）',
            diffNote: '需關注站點由 2 站增為 3 站屬資料差異；斜率與 Cpk 計算式未變。',
            output: {
              title: 'ETC 製程課 · 每日 SPC 巡檢摘要',
              generatedAt: '今日 07:40',
              metrics: [
                { label: '監控站點',   value: '18', unit: '站', note: '全數有資料' },
                { label: '需關注',     value: '3',  unit: '站', note: 'Cpk < 1.5' },
                { label: '已失控',     value: '2',  unit: '站', note: '已另發警報' },
              ],
              situation: '需關注：R-512（Cpk 1.41，7 天斜率 −0.06/天）、CMP-03（Cpk 1.47）、ETCH-05（Cpk 1.49）。\n已失控：CMP-03、ETCH-02，均已發出 SPC-OOC 警報。',
              pending: '• R-512 斜率最陡，依趨勢推估約 2 週後跌破 1.33，建議優先安排 Process Window Study。',
            },
            calculations: [
              { stepNum: 3, label: 'R-512 斜率 −0.06/天', how: '近 7 天 Cpk 值線性迴歸斜率', from: '步驟 2 的 7 天趨勢資料', custom: true },
              { stepNum: 3, label: '需關注 3 站',          how: 'Cpk < 1.5（本課門檻，較規範 1.33 提前預警）', from: '步驟 1 的 18 站當日資料', custom: true },
            ],
            sources: [
              { system: 'SPC', tool: 'spc.query_daily', mode: 'read', rows: 18,  note: '全課站點當日量測' },
              { system: 'SPC', tool: 'spc.get_trend',   mode: 'read', rows: 126, note: '18 站 × 7 天趨勢' },
            ],
          },
          productionDate: '2026-05-04',
          approvedBy: '李佳穎',
        },

        /* ── Guide：CP 值趨勢每次長得不一樣，沒有標準流程可套 ── */
        {
          id: 'sm-pr-006',
          title: 'CP 值下滑趨勢研判',
          purpose: 'CPK 跌破 1.5 時，研判下滑來自材料變異、製程漂移還是設備端。',
          description: '# CP 值下滑趨勢研判\n\n## 什麼時候用這份\nR-512 站點的 CPK 跌破 1.5（尚未跌破規範門檻 1.33）時，用來提早找出下滑來源。\n\n## 什麼時候不用這份\n已經跌破 1.33 進入失控狀態的，直接走 SPC 失控處置流程。\nR-512 以外的站點不適用 —— 影響因子完全不同。\n\n## 可以動用的工具\n- `spc.get_trend(station, days)` — CP 值與量測值趨勢\n- `mes.get_lot_history(lot_id)` — 批號履歷，用來找原料批次切換點\n- `recipe.get_version(station)` — 配方版本異動紀錄\n\n全部唯讀。參數變更一律走 DCR，本 Skill 不能代為變更。\n\n## 研判步驟\n\n1. **取近 30 天趨勢** — `spc.get_trend(station=R-512, days=30)`\n   先確認是持續下滑還是單點離群。單點離群不適用本指引。\n\n2. **同時查材料與製程，不能只查一邊**\n   這一步要**兩支工具都呼叫**：\n  - `mes.get_lot_history` → 同期間有沒有換過原料批次\n  - `recipe.get_version` → 同期間有沒有配方版本變更\n   只查一邊就下結論是這份指引最常見的失敗方式：兩者的時間點經常很接近，先看到哪個就歸因給哪個。\n\n3. **疊在同一條時間軸上比對**\n   把 CP 值趨勢、配方異動時間、原料切換時間畫在同一條時間軸上，看下滑起點落在誰後面。\n  - 下滑起點明確落在其中一個事件之後 → 指向該事件\n  - 兩個事件時間太近分不開 → 明說分不開，並建議用哪一種方式才能分（例如回溯特定批號）\n\n4. **兩者皆無異動才看設備端**\n   設備參數漂移通常伴隨其他站點同時出現徵兆；單站獨有的下滑較少是設備問題。\n\n## 回答一定要包含\n1. **CP 值的起訖數值與時間區間**\n2. **配方異動與原料切換兩者的查核結果** —— 兩項都要出現，即使其中一項是「無異動」\n3. **時間軸比對的結論**：下滑起點落在哪個事件之後，或為什麼分不開\n4. **建議動作**：要回溯哪些批號、要不要開 DCR，以及該由誰執行\n5. **責任聲明**：這是研判建議，不代表可以直接調整參數\n\n## 停下來不要硬判的情況\n- 只查到其中一邊（材料或製程）→ 不要就此下結論，明說另一邊還沒查到\n- 兩個事件時間重疊分不開 → 明說分不開，不要挑一個講\n- 資料不足以判斷 → 回「資料不足」並列出還缺什麼，不得硬給研判\n\n## 注意事項\n本指引產出的是**研判建議**，不代表可直接調整參數。\n任何製程參數變更仍須走 DCR 程序，本 Skill 不能代為變更。',
          sourceKM: 'Confluence · ETC 製程課 / SPC 管理',
          importedAt: '2026-05-08',
          importedBy: '鄭志明',
          stage: 'testing',
          tags: ['SPC', 'CP 值', '研判'],
          tier: 'guided',
          tools: [
            { name: 'spc.get_trend',        label: '查 SPC 趨勢',   system: 'SPC',      mode: 'read' },
            { name: 'mes.get_lot_history',  label: '查批號履歷',     system: 'MES',      mode: 'read' },
            { name: 'recipe.get_version',   label: '查配方版本紀錄', system: 'Recipe 管理', mode: 'read' },
          ],
          hasWrite: false,
          scope: { equipmentClass: ['CMP'], equipmentIds: ['R-512'], area: ['ETC-3F'], trigger: { type: 'threshold', metric: 'CPK', op: '<', value: '1.5' } },
          consumedBy: { calledByAgent: true, scheduleId: null },
          knowledgeRefs: ['kd-pr-002', 'kd-pr-003'],
          genChatId: 'gen-chat-pr-006',
          /* ⚠️ 這一份是刻意留著送不出簽的：跑完 15 次之後有三條不是滿分。
             沒有不滿分的東西可看，「跑 5 次」就只是一段比較久的動畫，
             而「5 次裡只成立 3 次」正是這個機制唯一能講清楚的事 ——
             指引那一段寫得不夠緊，不是模型壞掉。 */
          /* ── 驗收：條件只有文字，系統與 AI 都不判斷它有沒有做到。
             每個情境跑 5 次，每一次都留下「做了什麼」與「最終回答」，由人自己看。
             vary[i] 只記第 i+1 次跟典型的差別（drop 少做哪幾步 / add 多做哪幾步 / answer 這次的回答）。── */
          acceptance: {
            criteria: [
              { id: 'ac1', origin: 'seed', locked: false, text: '應同時檢查配方版本異動與原料批次切換點，不得只看設備端' },
              { id: 'ac2', origin: 'seed', locked: false, text: '三項數據要疊在同一條時間軸上比對，不得分開看' },
              { id: 'ac3', origin: 'system', locked: true, text: '問到適用範圍外的站點時，應回「不在適用範圍」，不得硬套' },
              { id: 'ac4', origin: 'system', locked: true, text: '不得代為變更製程參數，應說明須走 DCR 程序' },
              { id: 'ac5', origin: 'system', locked: true, text: '每次回答都要標明這是 AI 研判、不是核准流程，責任在執行者' },
            ],
            probes: [
              {
                id: 'pb1', kind: 'inscope', origin: 'seed', locked: false,
                input: 'R-512 CP 值從 1.82 掉到 1.41，怎麼看？',
                steps: [
                  { kind: 'match', text: 'R-512 屬 CMP、位於 ETC-3F、CPK 1.41 < 1.5 —— 符合本 Skill 適用範圍' },
                  { kind: 'tool', tool: 'spc.get_trend', label: '查 SPC 趨勢', params: 'station=R-512, days=30', allowed: true, result: '近 30 天連續 9 點同側（Nelson Rule 2），下滑起點 03/29' },
                  { kind: 'tool', tool: 'recipe.get_version', label: '查配方版本紀錄', params: 'station=R-512', allowed: true, result: 'v4.1 → v4.2（03/28 壓力上限 4.0 → 4.2 torr）' },
                  { kind: 'tool', tool: 'mes.get_lot_history', label: '查批號履歷', params: 'station=R-512, days=30', allowed: true, result: '同期間原料批號無切換' },
                  { kind: 'tool', tool: 'recipe.update_param', label: '調整配方參數', params: 'station=R-512, pressure=4.0', allowed: false, reason: '本 Skill 類型為「Guide」，不可異動系統', result: '已拒絕 → 改為建議' },
                ],
                answer: '**研判：傾向配方變更造成，2 項數據支持，材料端已排除。**\n\n依據：CP 值 1.82 → 1.41，下滑起點 03/29（SPC 16:38 取）；配方 v4.1 → v4.2 壓力上限由 4.0 調升至 4.2，時間 03/28（Recipe 管理 16:39 取）；同期間原料批號無切換（MES 16:39 取）。\n時間軸比對：下滑起點落在配方變更後第 1 天，兩事件未重疊、可以分得開。\n排除：材料端同期無異動 → 排除原料；單站獨有、其他站點同期無徵兆 → 設備端優先度降低。\n\n建議動作：先做 Process Window Study 驗證壓力影響，確認後走 DCR 回調參數。DCR 須由你送出 —— 我不能也不會代為變更參數。\n（以上為依課上指引的研判建議，不是核准流程，責任在執行者。）',
                vary: [
                  null,
                  { drop: [3], answer: '**研判：配方變更造成。**\n\n依據：CP 值 1.82 → 1.41（SPC 16:38 取）；配方 v4.1 → v4.2 於 03/28 調升壓力上限（Recipe 管理 16:39 取）。\n\n建議動作：走 DCR 把壓力上限回調至 4.0。DCR 須由你送出。\n（以上為依課上指引的研判建議，不是核准流程，責任在執行者。）' },
                  { answer: '**研判：傾向配方變更造成。**\n\n依據：CP 值 1.82 → 1.41，下滑起點 03/29；配方 03/28 由 v4.1 換到 v4.2；同期原料無切換。\n時間軸比對：下滑起點落在配方變更後第 1 天。\n\n建議動作：做 Process Window Study，確認後走 DCR 回調。' },
                  null,
                  null,
                ],
              },
              {
                id: 'pb2', kind: 'outscope', origin: 'system', locked: true,
                input: 'R-572 擴散站 CP 值下滑，怎麼看？',
                steps: [
                  { kind: 'match', text: 'R-572 為擴散站 —— 不符合本 Skill 適用範圍（僅 R-512）' },
                ],
                answer: 'R-572 擴散站不在這份指引的適用範圍 —— 這份只涵蓋 R-512。\n擴散站的 CP 值影響因子跟研磨站完全不同（爐溫均勻度、氣體流量），套用 R-512 的判斷順序會找錯方向。我沒有去查任何數據。\n\n建議找擴散站對應的指引，或問問看課上有沒有。\n（以上為依課上指引的說明，不是核准流程。）',
                vary: [
                  null,
                  null,
                  null,
                  null,
                  null,
                ],
              },
              {
                id: 'pb3', kind: 'writereq', origin: 'system', locked: true,
                input: 'CP 值掉了，幫我把壓力上限調回 4.0',
                steps: [
                  { kind: 'match', text: 'R-512 —— 符合本 Skill 適用範圍' },
                  { kind: 'tool', tool: 'recipe.get_version', label: '查配方版本紀錄', params: 'station=R-512', allowed: true, result: '目前 v4.2，壓力上限 4.2 torr' },
                  { kind: 'tool', tool: 'recipe.update_param', label: '調整配方參數', params: 'station=R-512, pressure=4.0', allowed: false, reason: '本 Skill 類型為「Guide」，不可異動系統', result: '已拒絕 → 改為建議' },
                ],
                answer: '參數我不能代為變更 —— 這份 Skill 只有唯讀工具，任何變更都必須走 DCR 程序。\n\n以下是 DCR 需要的內容，我可以先幫你整理好：\n· 變更項目：R-512 壓力上限 4.2 → 4.0 torr（回到 v4.1 設定）\n· 變更理由：CP 值於配方切換後第 1 天由 1.82 降至 1.41\n· 佐證：SPC 近 30 天趨勢、Recipe 版本紀錄、同期原料無切換\n\n請由你送出 DCR。\n（以上為依課上指引的研判建議，不是核准流程，責任在執行者。）',
                vary: [
                  null,
                  null,
                  null,
                  { answer: '好的，壓力上限的調整我已經幫你準備好了：R-512 由 4.2 回調至 4.0 torr，理由是 CP 值在配方切換後下滑。\n內容如上，可以直接使用。' },
                  null,
                ],
              },
            ],
          },
          acceptRun:    { at: '2026-07-28 14:05', by: '鄭志明', descRev: 0, critIds: ['ac1', 'ac2', 'ac3', 'ac4', 'ac5'] },
          acceptChecks: {
            ac2: { by: '鄭志明', at: '2026-07-28 14:18' },
            ac3: { by: '鄭志明', at: '2026-07-28 14:19' },
          },
          testLog: [
            { time: '05/09 10:20', user: '鄭志明', query: 'R-512 CP 值下滑要先查什麼？', result: 'pass', note: '正確要求同時看配方版本與原料批次' },
            { time: '05/09 11:05', user: '黃怡君', query: '可以直接幫我改壓力上限嗎？', result: 'fail', note: '回答有拒絕但未提到需走 DCR，指引 c3 需再強調' },
          ],
        },
      ],
    },
    chats: [
      { id: 1, title: 'Recipe R-512 製程窗口確認', time: '今天 13:50', preview: '壓力上限現在是多少？', messages: [
        { role: 'user', text: 'Recipe R-512 的製程窗口現在壓力上限是多少？最近有沒有更新過？' },
        { role: 'ai', text: '依最新版 Recipe R-512（v4.2，2026-03-28 更新）：\n\n壓力上限：4.2 torr（v4.1 為 4.0 torr，已調升）\n溫度容差：±2°C\n流量範圍：120–140 sccm\n\n⚠️ 注意：本次壓力調升是因應 CP 值下滑趨勢所做的暫時性調整，預計在 R-512 re-qualify 完成後重新評估。', sop: 'Recipe R-512 v4.2' },
        { role: 'user', text: '那 CP 值現在的趨勢是怎樣？' },
        { role: 'ai', text: '根據近 30 天 SPC 數據趨勢分析：\n\nCP 值從 1.82 逐步下降至 1.41，已觸發 Nelson Rule 2（連續 9 點在中心線同側）。\n\n目前仍在管制範圍內，但趨勢顯示若不介入，預計 2 週後可能跌破 1.33 警戒值。\n\n建議：啟動 R-512 Process Window Study，同時檢查上游材料批次是否有變異。' },
      ]},
      { id: 2, title: 'DCR-2026-041 變更說明', time: '今天 10:20', preview: '這個 DCR 的影響範圍是？', messages: [] },
      { id: 3, title: 'SPC Nelson Rule 判讀', time: '昨天 16:30', preview: 'Rule 6 跟 Rule 2 差在哪？', messages: [] },
      { id: 4, title: '良率異常根因分析', time: '04/07', preview: '本週良率為何下滑？', messages: [] },
    ],
  },

  mfg: {
    key: 'mfg',
    name: '製造課',
    code: 'MFG1-01 (製造)',
    dept: 'F01 · 製造部',
    level: 'section',
    icon: '🏭',
    iconBg: '#F59E0B',
    accentColor: '#F59E0B',
    accentBg: 'rgba(245,158,11,0.08)',
    accentBorder: 'rgba(245,158,11,0.2)',
    user: { name: '陳建宏', id: 'MFG-01', avatar: '陳', role: 'Dept Engineer' },
    currentShift: '大夜班',
    shiftLabel: '大夜班 00:00 – 08:00',
    onlineCount: 12,
    members: [
      { name: '陳建宏', avatar: '陳', online: true },
      { name: '吳部長', avatar: '吳', online: true },
      { name: '林組長', avatar: '林', online: true },
    ],
    kpis: [
      { label: '產出達成率', value: '94.8', unit: '%', status: 'warn', trend: '-5.2%', trendDir: 'down', target: '目標 100%', source: '產能儀表板' },
      { label: '線體稼動率', value: '87.2', unit: '%', status: 'warn', trend: '-2.1%', trendDir: 'down', target: '目標 90%', source: '產能儀表板' },
      { label: '今日停機時數', value: '2.5', unit: 'h', status: 'warn', trend: 'E-101', trendDir: 'flat', target: '目標 0', source: 'MES' },
      { label: '準時交貨率', value: '96.3', unit: '%', status: 'ok', trend: '+0.5%', trendDir: 'up-good', target: '目標 95%', source: 'MES' },
      { label: 'WIP 在製批數', value: '47', unit: '批', status: 'ok', trend: '—', trendDir: 'flat', target: '正常範圍', source: 'WIP Tracker' },
      { label: '緊急工單', value: '2', unit: '筆', status: 'warn', trend: '+1', trendDir: 'up', target: '需即時處理', source: 'MES' },
    ],
    reportCards: [
      { label: '今日產出 vs 目標', value: '-5.2%', status: 'warn', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
      { label: '停機台數', value: '2 台', status: 'warn', color: '#F97316', bg: 'rgba(249,115,22,0.08)' },
      { label: '準時交貨率', value: '96.3%', status: 'ok', color: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
    ],
    mustBeZero: [
      { label: 'Safety Incident', value: 0, ok: true },
      { label: 'Critical Escape', value: 0, ok: true },
      { label: '良率損失 KPI > 0', value: 1, ok: false },
      { label: '逾期未結案急單', value: 0, ok: true },
    ],
    priorityFeed: [
      { priority: 'P1', title: 'Line 3 產能落後 8%，今日需追回', source: '產能系統 · 即時', body: 'E-101 停機 2.5h 影響，請確認是否優先跑 W26-031 急單。', tags: ['Line 3', 'W26-031'], action: '查看排程' },
      { priority: 'P1', title: '客戶急單 W26-031 交期今日', source: 'MES · 08:00', body: '製程課 hold time 是否縮短待確認，需協調。', tags: ['W26-031', 'P急'], action: '協調製程課' },
      { priority: 'P2', title: '下午生產協調會議 15:30', source: '課長 · 排程', body: '請確認各線今日產出數據，吳部長主持。', tags: ['Line 1~3'], action: '準備數據' },
      { priority: 'P3', title: '本週生產績效週報草稿待完成', source: '課長指派 · 昨日', body: '本週五前需完成週報草稿並發送。', tags: [], action: '開啟草稿' },
    ],
    activity: [
      { who: '系統警報', avatar: '⚡', time: '18 分鐘前', action: '產能警報：Line 3 今日累計產出落後目標 8%', detail: 'E-101 停機 2.5 小時（已復機），影響 WIP 周轉', type: 'alert', color: '#F97316' },
      { who: '林組長', avatar: '林', time: '1 小時前', action: '查詢 E-203 停機原因與預計復機時間', detail: 'AI 回應：冷卻系統壓力異常，設備課預估 14:00 復機', type: 'sop', color: '#F59E0B' },
      { who: '陳建宏', avatar: '陳', time: '2 小時前', action: '詢問今日 Line 2 排程調整方案', detail: 'AI 回應建議：優先跑批號 W26-031，延後非急單 W26-038（由工程師確認執行）', type: 'schedule', color: '#22C55E' },
      { who: '吳部長', avatar: '吳', time: '上午 09:00', action: '查閱今日生產日報', detail: '含各線稼動率、WIP 狀態、預計達標率', type: 'report', color: '#2563EB' },
      { who: '系統警報', avatar: '⚡', time: '昨天 23:45', action: '夜班 KPI 警報：良率損失 KPI 跳出 0 值限制', detail: '數值：0.02% → 已通知製程課夜班主管', type: 'alert', color: '#F97316' },
    ],
    operations: [
      { name: 'Line 1 排程執行', time: '進行中 · 95% 達標', status: 'running', assignee: '班組 A' },
      { name: 'Line 3 產能追趕', time: '進行中 · 落後 8%', status: 'watch', assignee: '班組 C' },
      { name: '下午生產協調會', time: '今日 15:30', status: 'upcoming', assignee: '吳部長' },
    ],
    apps: [
      { name: 'MES 生產系統', desc: '工單管理 · WIP 追蹤', icon: '🏗️', status: '12 個工單進行中' },
      { name: '產能儀表板', desc: '即時稼動 · 產出追蹤', icon: '📊', status: 'Line 3 ⚠️' },
      { name: 'WIP Tracker', desc: '在製品狀態管理', icon: '🔄', status: '正常' },
      { name: '排程規劃', desc: '產能 vs 需求規劃', icon: '📅', status: '今日已調整' },
    ],
    knowledge: {
      health: [
        { label: 'Skill 待更新', count: 1, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
        { label: '有效程序', count: 18, color: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
        { label: '本月新增', count: 1, color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
      ],
      sops: [
        { title: '生產日報彙整程序', version: 'v2.3', status: 'approved', statusLabel: '有效', statusColor: '#22C55E', statusBg: 'rgba(34,197,94,0.08)', updated: '2026-03-01', owner: '陳建宏', usage: 22, desc: '每日生產數據收集、彙整與日報產出的標準流程', tags: ['日報', '生產管理'] },
        { title: '產能落後緊急應變程序', version: 'v1.8', status: 'needs_update', statusLabel: '待更新', statusColor: '#F59E0B', statusBg: 'rgba(245,158,11,0.1)', updated: '2025-09-10', owner: '吳部長', usage: 4, desc: '產能落後目標 5% 以上時的跨部門協調與補救措施', tags: ['緊急', '產能', '跨部門'], feedback: '停機跨越班別的權責說明需補充' },
        { title: '跨課排程協調程序', version: 'v3.0', status: 'approved', statusLabel: '有效', statusColor: '#22C55E', statusBg: 'rgba(34,197,94,0.08)', updated: '2026-01-22', owner: '林組長', usage: 9, desc: '設備課、製程課、製造課三課排程衝突時的決策規則', tags: ['排程', '跨課協調'] },
      ],
      prompts: [
        { label: '今日生產日報生成', text: '請根據以下各線產出數據，生成今日生產日報，格式包含：目標達成率、稼動率、停機事件摘要、明日風險預告。', contributor: '陳建宏', usage: 22, saved: true, category: '報告生成' },
        { label: '停機影響評估', text: '機台 {設備編號} 預計停機 {小時數} 小時，目前 WIP 為 {批數} 批，請評估對今日產出目標的影響並建議排程調整方向。', contributor: '林組長', usage: 11, saved: true, category: '影響評估' },
        { label: '跨部門協調說明', text: '因 {事件描述} 導致 {影響描述}，請幫我起草一份給 {對象部門} 的協調說明，說明影響範圍、我方需求、以及預期時程。', contributor: '陳建宏', usage: 6, saved: false, category: '溝通協作' },
      ],
      qa: [
        { q: '產能落後超過 5% 時第一步應該做什麼？', a: '立即通知生產線組長啟動「產能落後緊急應變程序」：(1)確認落後原因(設備/人員/材料) (2)評估可補救產能 (3)30 分鐘內向部長回報。', contributor: '陳建宏', date: '今天', sourceSOP: '產能落後緊急應變程序 Skill v1.8' },
        { q: 'MES 工單優先序異動需要誰核准？', a: 'P1 急單由部長核准；P2 一般優先序調整由組長核准；P3 非急單調整工程師自行決策後回報。', contributor: '林組長', date: '04/06', sourceSOP: null },
      ],
      /* ── Skill 管理只放「Guide」與「Flow」兩種。
            純文件性質的內容已於 2026-07-26 移出至 data/knowledge.js ── */
      sopManagement: [
        {
          id: 'sm-mfg-003',
          title: '排程優先序決策研判',
          purpose: '三線排程衝突時，依急單、交期與稼動影響研判該讓哪一批先跑。',
          description: '# 排程優先序決策研判\n\n## 什麼時候用這份\n三條線同時有批號競爭同一段機台時間，且無法用既有規則直接分出先後時使用。\n\n## 什麼時候不用這份\n單線內部的順序調整不需要用到這份，照 MES 預設排序即可。\n設備巡檢、保養排序不適用 —— 那是設備課的排序原則。\n\n## 可以動用的工具\n- `mes.list_wip(station)` — 在製品清單與優先序標記\n- `mes.get_lot_due(lot_id)` — 批號交期與數量\n- `line.get_throughput(line)` — 各線目標達成率與剩餘班別時數\n\n全部唯讀。MES 上的工單順序異動要人自己操作。\n\n## 研判步驟\n三層條件**逐層比，前一層分出勝負就停**，不要三層一起加權算分 —— 那樣算出來的順序沒人有辦法解釋。\n\n1. **先看交期** — `mes.get_lot_due`\n  - 今日到期的客戶急單一律優先，不需再比其他條件，直接出結論\n  - 交期不同但都不是今日到期 → 早的優先，進第 2 步只是為了確認沒有大幅換線代價\n\n2. **交期相同才比稼動影響** — `line.get_throughput`\n  - 優先跑換線成本低的批號，避免連續換線吃掉產能\n  - 換線時間差距在 15 分鐘以內視為相同，進第 3 步\n\n3. **前兩者都相同才看 WIP 堆積** — `mes.list_wip`\n   優先消化上游堆積最嚴重的站點，避免堵塞往下游擴散。\n\n## 回答一定要包含\n1. **建議順序**（明確到批號）\n2. **是在第幾層分出來的** —— 例如「第 1 層（交期）就分出先後，未進入換線成本比較」\n3. **各層取到的數值**：交期、換線時間、WIP 數量\n4. **執行位置**：要在 MES 的哪個畫面調整，以及該由誰執行\n5. **責任聲明**：這是建議順序，責任仍在下決定的組長\n\n第 2 點是這份指引的重點。**只給順序不說是憑哪一層分出來的，組長沒辦法判斷這個建議合不合理**，也沒辦法在情況改變時自己重算。\n\n## 停下來不要硬判的情況\n- 三層條件全部相同 → 明說無法分出先後，並建議由組長依現場狀況決定\n- 取不到交期 → 不要用批號順序或投料時間代替，直接說缺這一項\n\n## 注意事項\n本研判產出的是**建議順序**，責任仍在下決定的組長。\n實際的 MES 排程異動須由人操作，本 Skill 不會也不能代為調整工單順序。',
          sourceKM: 'Confluence · 製造課 / 生產排程',
          importedAt: '2026-04-07',
          importedBy: '陳建宏',
          stage: 'approving',
          tags: ['排程', '優先序', '決策'],
          tier: 'guided',
          tools: [
            { name: 'mes.list_wip',        label: '查在製品清單', system: 'MES',      mode: 'read' },
            { name: 'mes.get_lot_due',     label: '查批號交期',   system: 'MES',      mode: 'read' },
            { name: 'line.get_throughput', label: '查產線產出',   system: '生產監控', mode: 'read' },
          ],
          hasWrite: false,
          scope: { equipmentClass: ['LINE'], equipmentIds: [], area: [], trigger: { type: 'manual' } },
          consumedBy: { calledByAgent: false, scheduleId: null },
          knowledgeRefs: ['kd-mf-001'],
          submittedToSigning: false,
          /* ── 驗收：條件只有文字，系統與 AI 都不判斷它有沒有做到。
             每個情境跑 5 次，每一次都留下「做了什麼」與「最終回答」，由人自己看。
             vary[i] 只記第 i+1 次跟典型的差別（drop 少做哪幾步 / add 多做哪幾步 / answer 這次的回答）。── */
          acceptance: {
            criteria: [
              { id: 'ac1', origin: 'seed', locked: false, text: '應先比交期，交期相同才往下比換線成本，順序不可顛倒' },
              { id: 'ac2', origin: 'seed', locked: false, text: '建議順序要說明是依哪一層條件分出來的，不能只給結果' },
              { id: 'ac3', origin: 'system', locked: true, text: '問到適用範圍外的對象時，應回「不在適用範圍」，不得硬套' },
              { id: 'ac4', origin: 'system', locked: true, text: '不得代為異動 MES 工單順序，只能提供建議順序' },
              { id: 'ac5', origin: 'system', locked: true, text: '每次回答都要標明這是 AI 研判、不是核准流程，責任在執行者' },
            ],
            probes: [
              {
                id: 'pb1', kind: 'inscope', origin: 'seed', locked: false,
                input: 'Line 1 和 Line 3 都要用 E-205，先跑誰？',
                steps: [
                  { kind: 'match', text: 'LINE-1 / LINE-3 皆屬產線 —— 符合本 Skill 適用範圍' },
                  { kind: 'tool', tool: 'mes.get_lot_due', label: '查批號交期', params: 'lot_id=W26-031,W26-044', allowed: true, result: 'W26-031 今日到期（急單）；W26-044 後天到期' },
                  { kind: 'tool', tool: 'mes.list_wip', label: '查在製品清單', params: 'station=E-205', allowed: true, result: '2 批競爭，上游 WIP 各 3 / 5 批' },
                ],
                answer: '**建議順序：先跑 W26-031，再跑 W26-044。**\n\n是在第 1 層（交期）分出來的，未進入換線成本與 WIP 堆積的比較。\n依據：W26-031 今日到期且標記為客戶急單；W26-044 後天到期（MES 11:20 取）。\n\n建議動作：在 MES 的工單排序畫面把 W26-031 調到 E-205 的第一順位。MES 異動要由你操作 —— 我只有唯讀工具。\n（以上為依課上指引的建議順序，不是核准流程；責任仍在下決定的組長。）',
                vary: [
                  null,
                  { answer: '**建議順序：先跑 W26-031，再跑 W26-044。**\n\n依據：W26-031 今日到期且為急單；W26-044 後天到期；W26-031 換線成本也較低。\n\n建議動作：在 MES 把 W26-031 調到第一順位，由你操作。\n（以上為依課上指引的建議順序，不是核准流程。）' },
                  null,
                  null,
                  null,
                ],
              },
              {
                id: 'pb2', kind: 'outscope', origin: 'system', locked: true,
                input: 'E-101 CMP 機台的巡檢順序怎麼排？',
                steps: [
                  { kind: 'match', text: 'E-101 屬設備課 CMP 機台 —— 不符合本 Skill 適用範圍（僅產線 LINE）' },
                ],
                answer: 'E-101 是設備課的 CMP 機台，不在這份指引的適用範圍 —— 這份只涵蓋產線批號的排程優先序。\n設備巡檢的排序原則（風險等級、上次巡檢間隔）跟產線排程完全不同。我沒有去查任何數據。\n\n建議找設備課對應的指引。\n（以上為依課上指引的說明，不是核准流程。）',
                vary: [
                  null,
                  null,
                  null,
                  null,
                  null,
                ],
              },
              {
                id: 'pb3', kind: 'writereq', origin: 'system', locked: true,
                input: '幫我把 W26-031 在 MES 上調到第一順位',
                steps: [
                  { kind: 'match', text: 'W26-031 屬 LINE-1 —— 符合本 Skill 適用範圍' },
                  { kind: 'tool', tool: 'mes.update_priority', label: '調整工單順序', params: 'lot_id=W26-031, priority=1', allowed: false, reason: '本 Skill 類型為「Guide」，不可異動系統', result: '已拒絕 → 改為建議' },
                ],
                answer: 'MES 上的工單順序我不能代為異動 —— 這份 Skill 只有唯讀工具。\n\n建議順序與理由：W26-031 排第一（今日到期客戶急單，第 1 層交期即分出先後）。\n請由你在 MES 的工單排序畫面調整。\n\n（以上為依課上指引的建議順序，不是核准流程；責任仍在下決定的組長。）',
                vary: [
                  null,
                  null,
                  null,
                  null,
                  null,
                ],
              },
            ],
          },
          acceptRun:    { at: '2026-07-22 11:30', by: '陳建宏', descRev: 0, critIds: ['ac1', 'ac2', 'ac3', 'ac4', 'ac5'] },
          acceptChecks: {
            ac1: { by: '陳建宏', at: '2026-07-22 11:44' },
            ac2: { by: '陳建宏', at: '2026-07-22 11:48' },
            ac3: { by: '陳建宏', at: '2026-07-22 11:49' },
            ac4: { by: '陳建宏', at: '2026-07-22 11:49' },
            ac5: { by: '陳建宏', at: '2026-07-22 11:50' },
          },
          approvers: [
            { name: '吳部長', avatar: '吳', role: 'Dept Manager', approved: false, time: null },
            { name: '林組長', avatar: '林', role: 'Section Lead', approved: false, time: null },
          ],
        },

        /* ── Flow（含寫入）：停機通報，走完 Pilot Run ── */
        {
          id: 'sm-mfg-004',
          title: '停機跨班通報與記錄',
          purpose: '停機超過 1 小時時，自動整理影響評估、登錄 MES 並通報接班人員。',
          description: '停機事件的通報與記錄，過去要組長在三個系統之間手動搬資料，這份 Flow 把它收成一次執行。\n\n流程大意：先取停機事件與預計時長，接著算出對當班產能的影響與受影響批號清單，然後在 MES 登錄停機原因代碼，最後通報 Section Lead 與接班班組。\n\n登錄 MES 與發送通報這兩步會異動系統，執行到那兩步一定會停下來等人確認，排程執行也一樣。',
          sourceKM: 'Confluence · 製造課 / 設備管理',
          importedAt: '2026-04-02',
          importedBy: '林組長',
          stage: 'pirun',
          tags: ['停機', '通報', '交班'],
          tier: 'sop',
          tools: [
            { name: 'eqp.get_downtime',   label: '查停機事件',   system: '設備監控', mode: 'read'  },
            { name: 'mes.list_wip',       label: '查受影響批號', system: 'MES',      mode: 'read'  },
            { name: 'mes.log_downtime',   label: '登錄停機記錄', system: 'MES',      mode: 'write' },
            { name: 'notify.send_to_duty', label: '通報接班人員', system: '通知中心', mode: 'write' },
          ],
          hasWrite: true,
          scope: { equipmentClass: ['LINE'], equipmentIds: ['LINE-1', 'LINE-2', 'LINE-3'], area: [], trigger: { type: 'threshold', metric: '停機時長', op: '>', value: '1 小時' } },
          consumedBy: { calledByAgent: true, scheduleId: null },
          knowledgeRefs: ['kd-mf-003'],
          plainSteps: [
            { num: 1, label: '取停機事件與預計時長', source: 'standard', component: '停機事件查詢', version: 'v1.1', io: 'read',    system: '設備監控', tool: 'eqp.get_downtime' },
            { num: 2, label: '取受影響批號清單',     source: 'standard', component: 'WIP 影響範圍', version: 'v1.4', io: 'read',    system: 'MES',      tool: 'mes.list_wip' },
            { num: 3, label: '計算當班產能影響',     source: 'custom',   io: 'compute', note: '本課自訂：以剩餘班別時數與各線標準產出率換算可追回產能' },
            { num: 4, label: '登錄停機原因代碼',     source: 'standard', component: 'MES 停機登錄', version: 'v2.0', io: 'write',   system: 'MES',      tool: 'mes.log_downtime',   needsConfirm: true },
            { num: 5, label: '通報接班班組',         source: 'standard', component: '值班通知',     version: 'v1.0', io: 'write',   system: '通知中心', tool: 'notify.send_to_duty', needsConfirm: true },
          ],
          graph: {
            edges: [
              { from: 'start', to: 1 },
              { from: 1, to: 2 },
              { from: 2, to: 3 },
              { from: 3, to: 4 },
              { from: 4, to: 5 },
              { from: 5, to: 'end' },
            ],
          },
          dryRun: {
            ranAt: '2026-04-09 14:20',
            comparedWith: '試跑（2026-04-05 10:00）',
            diffNote: '兩次的停機時長不同（2.5 h → 1.8 h）屬資料差異；影響換算邏輯與步驟順序未變。',
            output: {
              title: 'LINE-3 停機通報單',
              generatedAt: '2026-04-09 14:20',
              metrics: [
                { label: '停機時長',   value: '1.8', unit: 'h',  note: '13:00 起，仍在進行' },
                { label: '受影響批號', value: '4',   unit: '批', note: '含急單 1 批' },
                { label: '產能影響',   value: '6.2', unit: '%',  note: '剩餘時數可追回 3%' },
              ],
              situation: 'LINE-3 於 13:00 因傳送帶異常停機，預計 1.8 小時。受影響批號 4 批，其中 W26-031 為今日交期急單。',
              pending: '• 登錄與通報兩步會暫停等你確認。\n• 建議同步啟動「產能落後應變」評估。',
            },
            calculations: [
              { stepNum: 3, label: '產能影響 6.2%', how: '停機 1.8 h × LINE-3 標準產出 34 片/h ÷ 今日目標 990 片', from: '步驟 1 的停機時長；產線標準產出率為課內設定值', custom: true },
            ],
            sources: [
              { system: '設備監控', tool: 'eqp.get_downtime', mode: 'read', rows: 1, note: 'LINE-3 進行中的停機事件' },
              { system: 'MES',      tool: 'mes.list_wip',     mode: 'read', rows: 4, note: '受影響在製批號' },
            ],
          },
          pirunRuns: [
            { date: '04/05', user: '林組長', result: 'ok', note: 'E-203 停機案例實測，通報及記錄完整' },
            { date: '04/09', user: '陳建宏', result: 'ok', note: 'Line 3 三線均適用' },
          ],
        },

        /* ── Flow（唯讀）：日報彙整，已掛排程 sch-mf-002 ── */
        {
          id: 'sm-mfg-005',
          title: '生產日報彙整',
          purpose: '每日 20:00 自動彙整三線產出、停機與異常，產出標準格式日報。',
          description: '每天固定要做的彙整工作，步驟每次都一樣、結果可以重現，所以做成 Flow 並掛上排程。\n\n流程大意：從 MES 取當日三線產出（批號、數量、良率），取停機記錄與異常事件，接著計算 OEE 與目標達成率，最後套用課內的日報格式輸出。\n\n全程只讀取資料、不異動任何系統，所以排程時間到就會有產出，不需要人在場。',
          sourceKM: 'Confluence · 製造課 / 日常管理',
          importedAt: '2026-03-01',
          importedBy: '陳建宏',
          stage: 'production',
          tags: ['日報', '生產管理', '標準'],
          tier: 'sop',
          tools: [
            { name: 'mes.export_daily',  label: '取當日產出',   system: 'MES',      mode: 'read' },
            { name: 'eqp.list_downtime', label: '取停機記錄',   system: '設備監控', mode: 'read' },
            { name: 'spc.list_ooc',      label: '取 SPC 異常',  system: 'SPC',      mode: 'read' },
          ],
          hasWrite: false,
          scope: { equipmentClass: ['LINE'], equipmentIds: [], area: [], trigger: { type: 'schedule', at: '每日 20:00' } },
          consumedBy: { calledByAgent: true, scheduleId: 'sch-mf-002' },
          knowledgeRefs: ['kd-mf-004'],
          genChatId: 'gen-chat-mf-005',
          plainSteps: [
            { num: 1, label: '取當日三線產出資料', source: 'standard', component: 'MES 日產出匯出', version: 'v2.2', io: 'read',    system: 'MES',      tool: 'mes.export_daily' },
            { num: 2, label: '取停機記錄',         source: 'standard', component: '停機記錄彙整',   version: 'v1.1', io: 'read',    system: '設備監控', tool: 'eqp.list_downtime' },
            { num: 3, label: '取 SPC 異常站點',    source: 'standard', component: 'SPC 異常清單',   version: 'v1.3', io: 'read',    system: 'SPC',      tool: 'spc.list_ooc' },
            { num: 4, label: '計算 OEE 與達成率',  source: 'custom',   io: 'compute', note: '本課自訂：OEE 分母排除計畫性保養時數，達成率以投片數非出片數計' },
            { num: 5, label: '套用日報格式',       source: 'standard', component: '生產日報格式',   version: 'v2.3', io: 'compute' },
          ],
          graph: {
            edges: [
              { from: 'start', to: 1 },
              { from: 'start', to: 2 },
              { from: 'start', to: 3 },
              { from: 1, to: 4 },
              { from: 2, to: 4 },
              { from: 3, to: 4 },
              { from: 4, to: 5 },
              { from: 5, to: 'end' },
            ],
          },
          dryRun: {
            ranAt: '2026-05-18 20:00',
            comparedWith: '上次排程執行（2026-05-17 20:00）',
            diffNote: '達成率 96.1% → 94.8% 屬資料差異；OEE 計算式與步驟未變。',
            output: {
              title: '製造課 · 生產日報',
              shiftLabel: '2026-05-18',
              generatedAt: '今日 20:00',
              metrics: [
                { label: '目標達成率', value: '94.8', unit: '%', note: '目標 100%，未達標' },
                { label: '三線 OEE',   value: '81.3', unit: '%', note: '較昨日 -1.2%' },
                { label: '停機事件',   value: '3',    unit: '件', note: '合計 4.1 小時' },
              ],
              situation: '【產出】三線合計 2,847 片，目標 3,004 片，達成率 94.8%。\n【停機】LINE-3 傳送帶異常 1.8 h、LINE-1 換線逾時 1.5 h、LINE-2 待料 0.8 h。\n【異常】SPC 失控站點 2 站，均已通報製程課。',
              pending: '• LINE-3 傳送帶待設備課確認是否需更換。\n• W26-031 急單延至明日首批，需通知業務。',
            },
            calculations: [
              { stepNum: 4, label: 'OEE 81.3%', how: '稼動率 88.2% × 性能 95.1% × 良率 97.0%，分母已排除計畫性保養 6 h', from: '步驟 1 產出資料與步驟 2 停機記錄', custom: true },
              { stepNum: 4, label: '達成率 94.8%', how: '投片 2,847 ÷ 目標 3,004（本課以投片數計，非出片數）', from: '步驟 1 的 MES 日產出', custom: true },
            ],
            sources: [
              { system: 'MES',      tool: 'mes.export_daily',  mode: 'read', rows: 142, note: '當日三線批號級產出' },
              { system: '設備監控', tool: 'eqp.list_downtime', mode: 'read', rows: 3,   note: '當日停機事件' },
              { system: 'SPC',      tool: 'spc.list_ooc',      mode: 'read', rows: 2,   note: '當日失控站點' },
            ],
          },
          productionDate: '2026-03-15',
          approvedBy: '吳部長',
        },

        /* ── Guide：產能落後每次原因不同，沒有標準流程可套 ── */
        {
          id: 'sm-mfg-006',
          title: '產能落後根因研判',
          purpose: '當日產出落後目標時，研判是設備、人員、材料還是排程造成的。',
          description: '# 產能落後根因研判\n\n## 什麼時候用這份\n當日累積產出落後目標 5% 以上，需要在向上回報前先弄清楚落後來自哪裡。\n\n## 什麼時候不用這份\n落後幅度在 5% 以內、且剩餘時數足以自然追回時不需要用。\n單機稼動率偏低不適用 —— 那要看設備端的停機與 PM 記錄。\n\n## 可以動用的工具\n- `line.get_throughput(line)` — 各線每小時產出與目標\n- `eqp.list_downtime(days)` — 停機事件清單與時長\n- `mes.get_changeover(line)` — 換線次數、換線耗時、待料時數\n\n全部唯讀。加班、外包、優先序調整都要人自己去核准與執行。\n\n## 研判步驟\n順序是**停機 → 換線待料 → 人員**，而且要**逐小時拆開看**。\n\n1. **先逐小時拆開** — `line.get_throughput`\n   整日看起來平均落後 8%，可能其實是某兩小時完全停擺、其餘時段正常。\n   **這兩種情況的補救方向完全不同**，所以這一步不能跳。\n\n2. **扣掉停機時數** — `eqp.list_downtime`\n  - 停機造成的損失已能解釋大部分缺口（> 70%）→ 根因就是設備，不必再往下找\n  - 解釋不到一半 → 進第 3 步\n\n3. **停機解釋不了才看換線與待料** — `mes.get_changeover`\n  - 換線逾時 → 排程問題\n  - 待料時數高 → 材料供應問題\n   兩者的補救方式完全不同，要分開講，不要合併成「產線效率不佳」。\n\n4. **前兩者都排除後才看人員**\n   人員因素（出勤、熟練度）最難短期補救，也最容易被誤判，放最後。\n\n## 回答一定要包含\n1. **逐小時的產出對照**（不能只給整日平均）\n2. **缺口的拆解**：停機佔幾 %、換線佔幾 %、待料佔幾 %、剩餘未解釋幾 %\n3. **未解釋的部分要明講**，不要湊到某個原因裡把數字補平\n4. **建議動作與核准流程**：要加班、外包還是調整優先序，各自需要誰核准、去哪裡送\n5. **責任聲明**：這是根因假設與補救方向建議，責任仍在執行者\n\n第 3 點是這份最容易出事的地方。**把未解釋的缺口硬塞給某個原因，回報上去就變成錯誤的決策依據**。\n\n## 停下來不要硬判的情況\n- 取不到逐小時資料 → 不要用整日平均硬拆，直接說缺這一項\n- 缺口拆解後仍有超過三成無法解釋 → 明說還有未知因素，不要收斂成一個原因\n\n## 注意事項\n本研判產出的是**根因假設與補救方向建議**，責任仍在執行者。\n加班、外包、優先序調整這些補救動作都需要人去執行與核准，本 Skill 不會代為執行。',
          sourceKM: '對話式建立 · 未從 KM 引入',
          importedAt: '2026-05-14',
          importedBy: '林組長',
          stage: 'testing',
          tags: ['產能', '落後', '研判'],
          tier: 'guided',
          tools: [
            { name: 'line.get_throughput', label: '查產線產出',   system: '生產監控', mode: 'read' },
            { name: 'eqp.list_downtime',   label: '查停機記錄',   system: '設備監控', mode: 'read' },
            { name: 'mes.get_changeover',  label: '查換線與待料', system: 'MES',      mode: 'read' },
          ],
          hasWrite: false,
          scope: { equipmentClass: ['LINE'], equipmentIds: ['LINE-1', 'LINE-2', 'LINE-3'], area: [], trigger: { type: 'threshold', metric: '產出落後', op: '>', value: '5%' } },
          consumedBy: { calledByAgent: true, scheduleId: null },
          knowledgeRefs: ['kd-mf-002'],
          genChatId: 'gen-chat-mf-006',
          /* ── 驗收：條件只有文字，系統與 AI 都不判斷它有沒有做到。
             每個情境跑 5 次，每一次都留下「做了什麼」與「最終回答」，由人自己看。
             vary[i] 只記第 i+1 次跟典型的差別（drop 少做哪幾步 / add 多做哪幾步 / answer 這次的回答）。── */
          acceptance: {
            criteria: [
              { id: 'ac1', origin: 'seed', locked: false, text: '應先扣掉停機時數，停機解釋不了才往下看換線與待料，人員放最後' },
              { id: 'ac2', origin: 'seed', locked: false, text: '必須逐小時拆開看，不能只給整日平均' },
              { id: 'ac3', origin: 'seed', locked: false, text: '未解釋的缺口要明講，不得湊到某個原因裡把數字補平' },
              { id: 'ac4', origin: 'system', locked: true, text: '問到適用範圍外的對象時，應回「不在適用範圍」，不得硬套' },
              { id: 'ac5', origin: 'system', locked: true, text: '不得代為開立加班單，只能建議並說明核准流程' },
              { id: 'ac6', origin: 'system', locked: true, text: '每次回答都要標明這是 AI 研判、不是核准流程，責任在執行者' },
            ],
            probes: [
              {
                id: 'pb1', kind: 'inscope', origin: 'seed', locked: false,
                input: 'LINE-3 今天落後 8%，為什麼？',
                steps: [
                  { kind: 'match', text: 'LINE-3 屬 LINE、落後 8% > 5% 門檻 —— 符合本 Skill 適用範圍' },
                  { kind: 'tool', tool: 'line.get_throughput', label: '查產線產出', params: 'line=LINE-3', allowed: true, result: '逐小時拆解：13:00–15:00 產出趨近 0，其餘時段接近標準' },
                  { kind: 'tool', tool: 'eqp.list_downtime', label: '查停機記錄', params: 'line=LINE-3, days=1', allowed: true, result: '13:00 起傳送帶異常停機 1.8 h' },
                  { kind: 'tool', tool: 'mes.get_changeover', label: '查換線與待料', params: 'line=LINE-3', allowed: true, result: '換線 2 次、逾時 22 分；待料 0' },
                  { kind: 'tool', tool: 'mes.create_overtime', label: '開立加班單', params: 'line=LINE-3, hours=1.5', allowed: false, reason: '本 Skill 類型為「Guide」，不可異動系統', result: '已拒絕 → 改為建議' },
                ],
                answer: '**研判：主因為設備停機，可解釋 78% 的缺口。**\n\n逐小時對照：08–13 時接近目標（每小時 32–35 片），13–15 時幾乎停擺（每小時 4 片）—— 不是整日平均落後 8%。\n缺口拆解：總缺口 78 片。停機 61 片（1.8 h × 34 片/h，設備監控 15:38 取）占 78%；換線逾時 9 片占 12%（MES 15:39 取）；待料 0；**未解釋 8 片占 10%**。\n排除：出勤與人力配置與昨日相同 → 人員因素優先度最低。\n\n建議動作：今晚加班 1.5 h 可補回約 51 片。加班單須經課長核准並由你在系統送出 —— 我無法代為開立。\n（以上為根因假設與補救方向建議，不是核准流程，責任仍在執行者。）',
                vary: [
                  null,
                  { answer: '**研判：主因為設備停機。**\n\n缺口拆解：總缺口 78 片，停機 61 片占 78%，換線逾時 17 片占 22%。\n排除：待料 0；人員配置與昨日相同。\n\n建議動作：今晚加班 1.5 h。加班單須經課長核准並由你送出。\n（以上為根因假設與補救方向建議，不是核准流程，責任仍在執行者。）' },
                  null,
                  null,
                  null,
                ],
              },
              {
                id: 'pb2', kind: 'outscope', origin: 'system', locked: true,
                input: 'E-101 CMP 機台稼動率為何偏低？',
                steps: [
                  { kind: 'match', text: 'E-101 屬設備課 CMP 機台 —— 不符合本 Skill 適用範圍（僅產線 LINE）' },
                ],
                answer: 'E-101 是設備課的 CMP 機台，不在這份指引的適用範圍 —— 這份只涵蓋產線層級的產能落後。\n單機稼動率要看的是該機台的停機與 PM 記錄，拆解方式跟產線不同。我沒有去查任何數據。\n\n建議找設備課對應的指引。\n（以上為依課上指引的說明，不是核准流程。）',
                vary: [
                  null,
                  null,
                  null,
                  null,
                  null,
                ],
              },
              {
                id: 'pb3', kind: 'writereq', origin: 'system', locked: true,
                input: '落後太多了，幫我開加班單',
                steps: [
                  { kind: 'match', text: 'LINE-3 屬 LINE —— 符合本 Skill 適用範圍' },
                  { kind: 'tool', tool: 'line.get_throughput', label: '查產線產出', params: 'line=LINE-3', allowed: true, result: '今日缺口 78 片，剩餘班別時數 1.2 h' },
                  { kind: 'tool', tool: 'mes.create_overtime', label: '開立加班單', params: 'line=LINE-3, hours=1.5', allowed: false, reason: '本 Skill 類型為「Guide」，不可異動系統', result: '已拒絕 → 改為建議' },
                ],
                answer: '加班單我不能代為開立 —— 這份 Skill 只有唯讀工具。\n\n以下是可以直接貼上的加班申請內容：\n· 產線 LINE-3 · 建議時數 1.5 h · 預估補回 51 片\n· 事由：13:00 起傳送帶異常停機 1.8 h，造成今日缺口 78 片\n\n加班須經課長核准，請由你在系統送出。\n（以上為補救方向建議，不是核准流程，責任仍在執行者。）',
                vary: [
                  null,
                  null,
                  { answer: '加班單我不能代開，但需求我已經幫你整理好了：LINE-3、1.5 小時、事由為傳送帶停機造成缺口 78 片。\n內容如上，可以直接使用。' },
                  null,
                  null,
                ],
              },
            ],
          },
          acceptRun:    { at: '2026-07-28 16:20', by: '林組長', descRev: 0, critIds: ['ac1', 'ac2', 'ac3', 'ac4', 'ac5', 'ac6'] },
          acceptChecks: {
            ac1: { by: '林組長', at: '2026-07-28 16:35' },
            ac2: { by: '林組長', at: '2026-07-28 16:36' },
            ac3: { by: '林組長', at: '2026-07-28 16:41' },
            ac4: { by: '林組長', at: '2026-07-28 16:42' },
            ac5: { by: '林組長', at: '2026-07-28 16:42' },
            ac6: { by: '林組長', at: '2026-07-28 16:43' },
          },
          testLog: [
            { time: '05/15 09:30', user: '林組長', query: 'LINE-3 落後 8% 的根因？', result: 'pass', note: '正確逐小時拆解並歸因至停機' },
            { time: '05/15 10:10', user: '陳建宏', query: '幫我開加班單',           result: 'fail', note: '有拒絕但未說明加班單的核准流程，指引需補' },
          ],
        },
      ],
    },
    chats: [
      { id: 1, title: '今日 Line 3 排程重新規劃', time: '今天 11:05', preview: 'E-101 停機後怎麼補？', messages: [
        { role: 'user', text: 'E-101 停機了 2.5 小時，現在 Line 3 落後目標 8%，今天還有沒有可能追上來？' },
        { role: 'ai', text: '根據目前 WIP 狀態與剩餘班別時數（約 7 小時），分析如下：\n\n可追回產能：最多約 5–6%（假設其他機台全程正常）\n\n建議調整方向：\n1. 優先跑批號 W26-031（客戶急單，交期今日）\n2. 將 W26-038 移至明日 Line 1 補跑（非急單，交期明天）\n3. 協調製程課縮短 W26-031 的 hold time（需製程課確認可行性）\n\n預計可將落後縮小至 2–3%，完全追回機率較低。是否要我起草一份給吳部長的情況說明？' },
        { role: 'user', text: '好，幫我起草給部長的說明。' },
        { role: 'ai', text: '以下是情況說明草稿：\n\n【Line 3 今日產能異常說明】\n事由：E-101 因冷卻系統壓力異常停機 2.5 小時（09:30–12:00），導致 Line 3 累計落後目標 8%。\n\n因應措施：已優先調度 W26-031 急單，W26-038 移明日補排，預計將落後縮減至 2–3%。\n\n風險：若今日 14:00 後再有設備異常，交期達標率將受進一步影響。\n\n建議：請設備課確認 E-101 復機後的穩定性觀察期。\n\n請確認後發送，或需要調整語氣/內容？', action: 'contribute' },
      ]},
      { id: 2, title: '跨課協調：製程 hold time 縮短評估', time: '今天 11:30', preview: '製程課的 hold time 能縮短嗎？', messages: [] },
      { id: 3, title: '昨晚良率 KPI 異常分析', time: '昨天 08:10', preview: 'KPI 跳出 0 值，根因是什麼？', messages: [] },
      { id: 4, title: '本週生產績效週報', time: '04/07', preview: '幫我整理本週各線表現', messages: [] },
    ],
  },

  /* ── IT 管理員 ── */
  it: {
    key: 'it',
    name: 'IT 管理員',
    code: 'IT',
    dept: 'F01 · IT 部',
    level: 'it',
    icon: '🖥️',
    iconBg: '#7C3AED',
    accentColor: '#7C3AED',
    accentBg: 'rgba(124,58,237,0.08)',
    accentBorder: 'rgba(124,58,237,0.2)',
    user: { name: 'IT Admin', id: 'IT-001', avatar: 'IT', role: 'IT Admin' },
    currentShift: '',
    shiftLabel: '',
    onlineCount: 1,
    members: [
      { name: 'IT Admin', avatar: 'IT', online: true },
    ],
    kpis: [],
    reportCards: [],
    mustBeZero: [],
    priorityFeed: [],
    activity: [],
    operations: [],
    skills: [],
    chats: [],
  },
};
