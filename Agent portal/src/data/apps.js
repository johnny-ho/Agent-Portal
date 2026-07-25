/* ════════════════════════════════════════
   APP CENTER — Application Catalog
   全公司 IT 應用目錄（不含報表）
   ════════════════════════════════════════ */

const APP_CATEGORIES = [
  '全部', '值班管理', '機台參數', '裝機維修', '製程監控',
  '良率分析', '異常處理', '排程產能', '設備保養',
  '文件Skill', '工單管理', '環安衛', '物料備品',
];

const ALL_APPS = [
  { id: 1,  name: 'FDC Console',     icon: '⚡', bg: '#FEF2F2', desc: '設備異常偵測與波形分析，FDC 異常事件查詢與根因追蹤',        system: 'FDC',        cats: ['異常處理', '機台參數']   },
  { id: 2,  name: 'SPC Console',     icon: '📊', bg: '#F0FDF4', desc: '製程統計管制圖，OOC 失控警示即時追蹤與歷史趨勢',            system: 'SPC',        cats: ['製程監控', '良率分析']   },
  { id: 3,  name: 'MES 生產系統',    icon: '🏗️', bg: '#EFF6FF', desc: '工單狀態查詢、WIP 在製批次追蹤與產出數據彙整',              system: 'MES',        cats: ['工單管理', '排程產能']   },
  { id: 4,  name: 'Case Center',     icon: '📋', bg: '#FFF7ED', desc: '異常工單建立與查詢，跨課移交，五格欄位標準格式',            system: 'CaseCenter', cats: ['異常處理', '工單管理']   },
  { id: 5,  name: 'Tool Center',     icon: '🔧', bg: '#F9FAFB', desc: '設備履歷、PM 排程查詢與設備狀態追蹤',                     system: 'ToolCenter', cats: ['裝機維修', '設備保養']   },
  { id: 6,  name: 'Lot Center',      icon: '🔍', bg: '#F5F3FF', desc: '批次製程履歷查詢、在製品狀態與歷程追蹤',                  system: 'LotCenter',  cats: ['製程監控', '良率分析']   },
  { id: 7,  name: 'EDX Portal',      icon: '📘', bg: '#EFF6FF', desc: '訓練課程與認證管理，線上測驗與訓練紀錄查詢',               system: 'EDX',        cats: ['文件Skill']                },
  { id: 8,  name: 'Confluence',      icon: '📄', bg: '#EFF6FF', desc: '課級 Skill 文件庫，支援版本控管與 AI RAG 整合',              system: 'Confluence', cats: ['文件Skill']                },
  { id: 9,  name: 'PM 到期預覽',     icon: '🗓️', bg: '#FFFBEB', desc: '即將到期保養機台清單，PM 任務指派與完成狀態追蹤',          system: 'CMMS',       cats: ['設備保養']               },
  { id: 10, name: '機台歷史參數',    icon: '📈', bg: '#F9FAFB', desc: '設備關鍵參數歷史曲線，支援多機台對比與異常區間標注',       system: 'ToolCenter', cats: ['機台參數']               },
  { id: 11, name: 'DCR 審核系統',    icon: '✏️', bg: '#F9FAFB', desc: '製程變更申請送審、審核流程與歷史紀錄查詢',                system: 'DCR',        cats: ['製程監控', '文件Skill']    },
  { id: 12, name: '工單派發系統',    icon: '📝', bg: '#F9FAFB', desc: '維修工單建立與派發，完成率追蹤與逾期提醒',                system: 'WorkOrder',  cats: ['工單管理']               },
  { id: 13, name: '廢水處理監控',    icon: '🌊', bg: '#F0F9FF', desc: '廢水即時監測看板，pH／流量等參數告警與歷史趨勢',           system: 'EHS',        cats: ['環安衛']                 },
  { id: 14, name: '安全巡檢表',      icon: '🦺', bg: '#F0FDF4', desc: '班次安全巡檢數位記錄，異常回報與月度巡檢完成率統計',       system: 'EHS',        cats: ['環安衛', '值班管理']     },
  { id: 15, name: '裝機驗收系統',    icon: '🔩', bg: '#F9FAFB', desc: '機台裝機 / 改機驗收流程管理，驗收項目與簽核紀錄',         system: 'ToolCenter', cats: ['裝機維修']               },
  { id: 16, name: 'AVL 管理系統',    icon: '📦', bg: '#F9FAFB', desc: '核可供應商與零件清單查詢，備品規格與替代料確認',           system: 'ERP',        cats: ['裝機維修', '物料備品']   },
  { id: 17, name: 'ERP 查詢系統',    icon: '🏭', bg: '#F9FAFB', desc: '備品與物料庫存即時查詢，請採購單與入庫記錄追蹤',          system: 'ERP',        cats: ['工單管理', '物料備品']   },
  { id: 18, name: 'FMEA 知識庫',     icon: '📚', bg: '#F9FAFB', desc: '失效模式與影響分析資料庫，歷史 FMEA 查閱與更新',          system: 'FMEA',       cats: ['文件Skill', '異常處理']    },
  { id: 19, name: '班前確認清單',    icon: '✅', bg: '#F0FDF4', desc: '開班前設備點檢與安全確認數位表單，確認紀錄自動存檔',       system: 'EHS',        cats: ['值班管理', '設備保養']   },
  { id: 20, name: 'Recipe Manager',  icon: '🧪', bg: '#FDF4FF', desc: '配方版本控制與 Qualify 流程管理，Recipe 歷史比較',         system: 'Recipe',     cats: ['製程監控', '文件Skill']    },
  { id: 21, name: 'WIP Tracker',     icon: '🔄', bg: '#F0F9FF', desc: '在製品批次即時狀態，各站點 WIP 分布與移動追蹤',           system: 'WIP',        cats: ['排程產能', '工單管理']   },
  { id: 22, name: '設備監控系統',    icon: '📡', bg: '#F9FAFB', desc: '即時設備狀態看板，機台稼動率與 alarm 即時告警',           system: 'FDC',        cats: ['機台參數', '設備保養']   },
  { id: 23, name: '排程規劃系統',    icon: '📅', bg: '#F0F9FF', desc: '產能 vs 需求規劃，排程版本管理與衝突偵測',                system: 'Scheduler',  cats: ['排程產能']               },
  { id: 24, name: 'CP 值監控',       icon: '🎯', bg: '#F0FDF4', desc: '製程能力指標即時監控，CPK 趨勢分析與站點比較',            system: 'SPC',        cats: ['製程監控', '良率分析']   },
  { id: 25, name: '設備履歷查詢',    icon: '🗂️', bg: '#F9FAFB', desc: '設備歷史事件彙整，維修與 PM 紀錄完整呈現',               system: 'ToolCenter', cats: ['機台參數', '裝機維修']   },
  { id: 26, name: '交班日誌',        icon: '📓', bg: '#FFFBEB', desc: '班別交接記錄管理，AI 協助整理摘要與待辦事項',             system: 'Journal',    cats: ['值班管理']               },
  { id: 27, name: '異常代碼查詢',    icon: '🔎', bg: '#FEF2F2', desc: '廠區異常代碼資料庫，含歷史根因與對應處置建議',            system: 'FDC',        cats: ['異常處理', '文件Skill']    },
  { id: 28, name: '備品申請系統',    icon: '🛒', bg: '#F9FAFB', desc: '備品與耗材申請、審核、出庫全流程管理',                   system: 'ERP',        cats: ['物料備品', '工單管理']   },
];

/* 各 Persona 預設釘選的應用 ID（最多 12 個）*/
const DEFAULT_PINNED = {
  equipment: [1, 4, 5, 9, 22, 12],
  process:   [2, 6, 11, 20, 24, 3],
  mfg:       [3, 21, 23, 4, 14, 17],
};

/* ════════════════════════════════════════
   FUNCTION TREE — IT 管理的功能目錄（三層）
   第一層：大分類  第二層：子系統  第三層：功能(含系統名)
   ════════════════════════════════════════ */
const DEFAULT_FUNCTION_TREE = [
  {
    id: 'cat-equip', label: '設備管理', order: 1,
    children: [
      {
        id: 'sub-maint', label: '保養系統', order: 1,
        items: [
          { id: 'fn-001', label: '工單管理',      system: 'ePMM',       enabled: true,  order: 1 },
          { id: 'fn-002', label: 'PM 排程查詢',   system: 'ePMM',       enabled: true,  order: 2 },
          { id: 'fn-003', label: '保養到期預覽',  system: 'CMMS',       enabled: true,  order: 3 },
          { id: 'fn-004', label: '逾期 PM 清單',  system: 'CMMS',       enabled: false, order: 4 },
        ],
      },
      {
        id: 'sub-monitor', label: '設備監控', order: 2,
        items: [
          { id: 'fn-005', label: '即時設備狀態',  system: 'FDC Console',  enabled: true,  order: 1 },
          { id: 'fn-006', label: '機台歷史參數',  system: 'Tool Center',  enabled: true,  order: 2 },
          { id: 'fn-007', label: '稼動率看板',    system: 'FDC Console',  enabled: true,  order: 3 },
          { id: 'fn-008', label: '異常偵測告警',  system: 'FDC Console',  enabled: false, order: 4 },
        ],
      },
      {
        id: 'sub-install', label: '裝機驗收', order: 3,
        items: [
          { id: 'fn-009', label: '驗收流程管理',  system: 'Tool Center',  enabled: true,  order: 1 },
          { id: 'fn-010', label: '設備履歷查詢',  system: 'Tool Center',  enabled: true,  order: 2 },
          { id: 'fn-011', label: 'AVL 零件查詢',  system: 'ERP',          enabled: true,  order: 3 },
        ],
      },
    ],
  },
  {
    id: 'cat-proc', label: '製程品質', order: 2,
    children: [
      {
        id: 'sub-spc', label: 'SPC 管制', order: 1,
        items: [
          { id: 'fn-012', label: '管制圖查詢',    system: 'SPC Console',  enabled: true,  order: 1 },
          { id: 'fn-013', label: 'OOC 失控事件',  system: 'SPC Console',  enabled: true,  order: 2 },
          { id: 'fn-014', label: 'CP 值趨勢分析', system: 'SPC Console',  enabled: true,  order: 3 },
        ],
      },
      {
        id: 'sub-fdc', label: 'FDC 異常', order: 2,
        items: [
          { id: 'fn-015', label: '異常事件查詢',  system: 'FDC Console',  enabled: true,  order: 1 },
          { id: 'fn-016', label: '根因追蹤',      system: 'FDC Console',  enabled: true,  order: 2 },
          { id: 'fn-017', label: '波形分析',      system: 'FDC Console',  enabled: false, order: 3 },
        ],
      },
      {
        id: 'sub-dcr', label: '製程變更', order: 3,
        items: [
          { id: 'fn-018', label: 'DCR 申請送審',     system: 'DCR',           enabled: true,  order: 1 },
          { id: 'fn-019', label: 'Recipe 版本管理',  system: 'Recipe Manager', enabled: true,  order: 2 },
          { id: 'fn-020', label: 'Lot 批次製程履歷', system: 'Lot Center',     enabled: true,  order: 3 },
        ],
      },
    ],
  },
  {
    id: 'cat-prod', label: '生產管理', order: 3,
    children: [
      {
        id: 'sub-order', label: '工單管理', order: 1,
        items: [
          { id: 'fn-021', label: '工單查詢',      system: 'MES',        enabled: true,  order: 1 },
          { id: 'fn-022', label: '工單派發',      system: 'WorkOrder',  enabled: true,  order: 2 },
          { id: 'fn-023', label: '逾期提醒',      system: 'WorkOrder',  enabled: false, order: 3 },
          { id: 'fn-024', label: 'Case Center',   system: 'CaseCenter', enabled: true,  order: 4 },
        ],
      },
      {
        id: 'sub-wip', label: 'WIP 追蹤', order: 2,
        items: [
          { id: 'fn-025', label: '批次狀態查詢',  system: 'Lot Center',   enabled: true,  order: 1 },
          { id: 'fn-026', label: 'WIP 分布看板',  system: 'WIP Tracker',  enabled: true,  order: 2 },
          { id: 'fn-027', label: '排程規劃',      system: 'Scheduler',    enabled: true,  order: 3 },
        ],
      },
    ],
  },
  {
    id: 'cat-doc', label: '文件知識', order: 4,
    children: [
      {
        id: 'sub-skill', label: 'Skill 管理', order: 1,
        items: [
          { id: 'fn-028', label: 'Skill 文件查詢', system: 'Confluence',  enabled: true,  order: 1 },
          { id: 'fn-029', label: 'FMEA 知識庫',    system: 'FMEA',        enabled: true,  order: 2 },
          { id: 'fn-030', label: '異常代碼查詢',   system: 'FDC Console', enabled: true,  order: 3 },
        ],
      },
      {
        id: 'sub-training', label: '訓練認證', order: 2,
        items: [
          { id: 'fn-031', label: '訓練課程管理',  system: 'EDX Portal',  enabled: true,  order: 1 },
          { id: 'fn-032', label: '認證紀錄查詢',  system: 'EDX Portal',  enabled: true,  order: 2 },
        ],
      },
    ],
  },
  {
    id: 'cat-ehs', label: '環安衛', order: 5,
    children: [
      {
        id: 'sub-safety', label: '安全管理', order: 1,
        items: [
          { id: 'fn-033', label: '安全巡檢',      system: 'EHS',  enabled: true,  order: 1 },
          { id: 'fn-034', label: '班前確認清單',  system: 'EHS',  enabled: true,  order: 2 },
          { id: 'fn-035', label: '廢水處理監控',  system: 'EHS',  enabled: true,  order: 3 },
        ],
      },
    ],
  },
];
