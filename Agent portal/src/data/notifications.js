/* ════════════════════════════════════════
   NOTIFICATIONS MOCK DATA
   通知中心 v1（見 brain/entities/modules/notification.md）
   四類通知：N1 Schedule 完成 / N2 Schedule 需人工決定(HITL) / N3 被指派 P1
             / N4 Schedule 執行失敗（2026-08-01 新增 —— 半夜排程掛掉原本沒有任何人會知道）
   原則：低摩擦、不回報已讀給派工者/課長、Personal 層自管。
   ════════════════════════════════════════ */

/* ── 通知類型 meta：label / 顏色 / 圖示（狀態圓點限規範四色）── */
const NOTIF_TYPES = {
  N1: { key: 'N1', label: 'Schedule 完成',     short: '完成',   dot: '#22C55E', icon: '✓' },
  N2: { key: 'N2', label: 'Schedule 需人工決定', short: '需決定', dot: '#F59E0B', icon: '⏸' },
  N3: { key: 'N3', label: '被指派 P1 任務',     short: 'P1 指派', dot: '#EF4444', icon: '❗' },
  N4: { key: 'N4', label: 'Schedule 執行失敗',  short: '執行失敗', dot: '#EF4444', icon: '✕' },
};

/* ── 站內 / Teams 逐則推送預設（PO 已確認）──
   N1 站內開、Teams 關；N2 / N3 / N4 站內 + Teams 皆開。
   N4 跟著 N2 走：排程失敗多半發生在無人的班次，只放站內等於沒人看到。 */
const DEFAULT_NOTIF_PREFS = {
  N1: { inApp: true,  teams: false },
  N2: { inApp: true,  teams: true  },
  N3: { inApp: true,  teams: true  },
  N4: { inApp: true,  teams: true  },
};

/* ── per-persona 通知清單（保留 7 天；ts 越大越新，未讀置頂由 UI 處理）──
   link：N3 → tasks + taskOpenId；N1/N2 → scheduling + expandRunId（自動展開該筆執行紀錄）。
   deep-link 目標 id 均對應真實 mock 資料（tasks.js / scheduling.js）。 */
const NOTIFICATIONS_BY_PERSONA = {
  equipment: [
    {
      id: 'ntf-eq-1', type: 'N2', read: false, ts: 20260724075000,
      title: 'SPC 異常日報 等待人工決定',
      desc: 'Step 3「開立異常工單」等待決定（E-308 × 3 筆 OOC）。本課任何成員都可以決定。',
      timeLabel: '今日 07:50',
      link: { nav: 'scheduling', expandRunId: 'run-eq-001-1' },
    },
    {
      id: 'ntf-eq-2', type: 'N3', read: false, ts: 20260724073000,
      title: '你被指派 P1 任務：E-308 FDC 異常監控',
      desc: '電流波動追蹤，due 今日。指派人：林課長。',
      timeLabel: '今日 07:30',
      link: { nav: 'tasks', taskOpenId: 'T-003' },
    },
    {
      id: 'ntf-eq-5', type: 'N4', read: false, ts: 20260724073200,
      title: '當班交接報告 執行失敗',
      desc: 'Step 1「取當班機台稼動資料」連線逾時（設備監控系統維護中），小夜班交接報告未產出。可重跑。',
      timeLabel: '昨日 23:30',
      link: { nav: 'scheduling', expandRunId: 'run-eq-004-3' },
    },
    {
      id: 'ntf-eq-3', type: 'N1', read: true, ts: 20260724070500,
      title: 'FDC 異常摘要 已完成',
      desc: '今日 07:05 執行完成，無異常需開單。',
      timeLabel: '今日 07:05',
      link: { nav: 'scheduling', expandRunId: 'run-eq-002-1' },
    },
    {
      id: 'ntf-eq-4', type: 'N1', read: true, ts: 20260723080000,
      title: 'PM 到期提醒 已完成',
      desc: '昨日 08:00 執行完成，本月 PM 排程已同步。',
      timeLabel: '昨日 08:00',
      link: { nav: 'scheduling', expandRunId: 'run-eq-003-1' },
    },
  ],

  process: [
    {
      id: 'ntf-pr-1', type: 'N1', read: false, ts: 20260724075000,
      title: 'OOC 異常日報 已完成',
      desc: '今日 07:50 執行完成，本日無 OOC 站點。',
      timeLabel: '今日 07:50',
      link: { nav: 'scheduling', expandRunId: 'run-pr-001-1' },
    },
    {
      id: 'ntf-pr-3', type: 'N4', read: false, ts: 20260721090200,
      title: 'Recipe 品質週報 執行失敗',
      desc: 'Step 2「取得各 Recipe 本週 SPC 數據」連線逾時，本週週報未產出。可重跑。',
      timeLabel: '04/14 09:02',
      link: { nav: 'scheduling', expandRunId: 'run-pr-002-1' },
    },
    {
      id: 'ntf-pr-2', type: 'N1', read: true, ts: 20260721090000,
      title: 'Recipe 品質週報 已完成',
      desc: '本週 Recipe 品質彙整完成，2 個新 Recipe qualify 中。',
      timeLabel: '3 天前',
      link: { nav: 'scheduling', expandRunId: 'run-pr-002-2' },
    },
  ],

  mfg: [
    {
      id: 'ntf-mf-1', type: 'N2', read: false, ts: 20260724081000,
      title: '產能落後預警 等待人工決定',
      desc: 'Line 3 產出落後 8%，Step 3「建立緊急應變工單」等待決定。本課任何成員都可以決定。',
      timeLabel: '今日 08:10',
      link: { nav: 'scheduling', expandRunId: 'run-mf-001-1' },
    },
    {
      id: 'ntf-mf-2', type: 'N1', read: true, ts: 20260723180000,
      title: '生產日報自動彙整 已完成',
      desc: '昨日 18:00 生產日報彙整完成並發送。',
      timeLabel: '昨日 18:00',
      link: { nav: 'scheduling', expandRunId: 'run-mf-002-1' },
    },
  ],

  it: [],
};
