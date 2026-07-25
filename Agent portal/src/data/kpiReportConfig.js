/* ════════════════════════════════════════
   KPI 報表管理 Mock 資料
   結構：per-persona → { flows, groups }
   ════════════════════════════════════════ */

var KPI_REPORT_MOCK = {

  /* ── 設備課 ── */
  equipment: {
    flows: [
      { id: 'ef1', name: 'MTTR 計算流程',  lastUpdatedAt: '2026-05-06 08:00', reportUrl: 'https://mock.eda3/report/ef1' },
      { id: 'ef2', name: 'Case 彙整流程',  lastUpdatedAt: '2026-05-06 06:30', reportUrl: 'https://mock.eda3/report/ef2' },
    ],
    groups: [
      {
        id: 'eg1', name: '設備效能', order: 0,
        reports: [
          { id: 'er1', name: '設備稼動率總表', type: 'url',  url: 'https://fdc.internal/report/oee',   flowId: '',    flowName: '', enabled: true,  order: 0 },
          { id: 'er2', name: 'FDC 異常紀錄',   type: 'url',  url: 'https://fdc.internal/report/alarm', flowId: '',    flowName: '', enabled: true,  order: 1 },
          { id: 'er3', name: 'MTTR 趨勢分析',  type: 'eda3', url: '',                                  flowId: 'ef1', flowName: 'MTTR 計算流程',  enabled: true,  order: 2 },
        ],
      },
      {
        id: 'eg2', name: '維修管理', order: 1,
        reports: [
          { id: 'er4', name: 'Unclose Case 看板', type: 'eda3', url: '', flowId: 'ef2', flowName: 'Case 彙整流程',  enabled: true,  order: 0 },
          { id: 'er5', name: 'PM 達成率報表',     type: 'url',  url: 'https://pbi.internal/report/pm', flowId: '', flowName: '', enabled: true,  order: 1 },
        ],
      },
      {
        id: 'eg3', name: '停機分析', order: 2,
        reports: [
          { id: 'er6', name: '停機小時數分析', type: 'url', url: 'https://pbi.internal/report/downtime', flowId: '', flowName: '', enabled: true, order: 0 },
        ],
      },
    ],
  },

  /* ── 製程課 ── */
  process: {
    flows: [
      { id: 'pf1', name: 'CPK 分析流程', lastUpdatedAt: '2026-05-06 07:00', reportUrl: 'https://mock.eda3/report/pf1' },
      { id: 'pf2', name: 'DCR 彙整流程', lastUpdatedAt: '2026-05-06 05:00', reportUrl: 'https://mock.eda3/report/pf2' },
    ],
    groups: [
      {
        id: 'pg1', name: '製程品質', order: 0,
        reports: [
          { id: 'pr1', name: '良率趨勢圖',   type: 'url',  url: 'https://pbi.internal/report/yield',  flowId: '',    flowName: '', enabled: true,  order: 0 },
          { id: 'pr2', name: 'SPC 管制圖',   type: 'url',  url: 'https://spc.internal/report/chart',  flowId: '',    flowName: '', enabled: true,  order: 1 },
          { id: 'pr3', name: 'CPK 分佈報表', type: 'eda3', url: '',                                   flowId: 'pf1', flowName: 'CPK 分析流程', enabled: true,  order: 2 },
        ],
      },
      {
        id: 'pg2', name: '製程變更', order: 1,
        reports: [
          { id: 'pr4', name: 'DCR 追蹤看板', type: 'eda3', url: '', flowId: 'pf2', flowName: 'DCR 彙整流程', enabled: true, order: 0 },
        ],
      },
      {
        id: 'pg3', name: '配方管理', order: 2,
        reports: [
          { id: 'pr5', name: 'Recipe 清單與狀態', type: 'url', url: 'https://mes.internal/recipe', flowId: '', flowName: '', enabled: true, order: 0 },
        ],
      },
    ],
  },

  /* ── 製造課 ── */
  mfg: {
    flows: [
      { id: 'mf1', name: 'Priority Lot 分析流程', lastUpdatedAt: '2026-05-06 08:30', reportUrl: 'https://mock.eda3/report/mf1' },
    ],
    groups: [
      {
        id: 'mg1', name: '產能追蹤', order: 0,
        reports: [
          { id: 'mr1', name: '產出達成率', type: 'url', url: 'https://pbi.internal/report/output',   flowId: '', flowName: '', enabled: true, order: 0 },
          { id: 'mr2', name: '線體稼動率', type: 'url', url: 'https://pbi.internal/report/line-oee', flowId: '', flowName: '', enabled: true, order: 1 },
        ],
      },
      {
        id: 'mg2', name: 'WIP 管理', order: 1,
        reports: [
          { id: 'mr3', name: 'WIP 在製批數',    type: 'url',  url: 'https://mes.internal/wip', flowId: '',    flowName: '',                    enabled: true, order: 0 },
          { id: 'mr4', name: 'Priority Lot 狀態', type: 'eda3', url: '',                         flowId: 'mf1', flowName: 'Priority Lot 分析流程', enabled: true, order: 1 },
        ],
      },
      {
        id: 'mg3', name: '交期管理', order: 2,
        reports: [
          { id: 'mr5', name: '準時交貨率趨勢', type: 'url', url: 'https://pbi.internal/report/otd', flowId: '', flowName: '', enabled: true, order: 0 },
        ],
      },
    ],
  },
};
