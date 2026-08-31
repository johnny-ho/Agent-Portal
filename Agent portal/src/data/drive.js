/* ════════════════════════════════════════
   DRIVE — 課級雲端硬碟

   定位：以「課（Section）」為邊界的檔案空間，形狀比照 Google Drive
   （資料夾樹 + 檔案列表 + 詳情），但它不是通用網路硬碟：
   它存在的理由是「AI 產出的東西要有一個落地的地方」。

   兩條硬規則：
   1. 每個課都預設有一個系統資料夾 `Agent_Artifacts`，不可改名、不可刪除。
      Agent Portal 的 AI（Chat 呼叫 Codify、排程自動執行）產生的 artifact
      一律落在這裡，並帶著「哪一次執行產出的」溯源資訊。
   2. `.html` 的 artifact 可以被嵌進 KPI 報表中心展示 —— 這是 Drive 存在的
      第一個功能連結，也是「AI 產出 → 課的日常看板」這條路徑的最後一哩。
      嵌入狀態是跨頁狀態，放在 App.jsx（同 schedMounts 的作法），
      不放在任何一頁裡面，否則兩頁會講不一樣的話。

   本版為示意原型：檔案內容是 mock，html artifact 直接內嵌字串，
   由 KPI 頁以 iframe srcDoc 渲染（不落地成真檔案）。
   ════════════════════════════════════════ */

/* 系統資料夾名稱 —— 只有這一個字串是產品契約，各處引用它不要自己打字 */
const DRIVE_AGENT_FOLDER = 'Agent_Artifacts';

/* 檔案類型：icon 用文字符號（沿用本專案不引外部 icon set 的作法） */
const DRIVE_TYPE_CFG = {
  folder: { label: '資料夾', icon: '▧', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  html:   { label: 'HTML',   icon: '◈', color: '#2563EB', bg: 'rgba(37,99,235,0.08)'   },
  xlsx:   { label: 'Excel',  icon: '▤', color: '#16A34A', bg: 'rgba(22,163,74,0.08)'   },
  csv:    { label: 'CSV',    icon: '▤', color: '#16A34A', bg: 'rgba(22,163,74,0.08)'   },
  pdf:    { label: 'PDF',    icon: '▣', color: '#EF4444', bg: 'rgba(239,68,68,0.08)'   },
  md:     { label: 'Markdown', icon: '▥', color: '#6B7280', bg: 'rgba(107,114,128,0.08)' },
  pptx:   { label: 'PPT',    icon: '▦', color: '#C2410C', bg: 'rgba(194,65,12,0.08)'   },
  png:    { label: '圖片',   icon: '▨', color: '#7C3AED', bg: 'rgba(124,58,237,0.08)'  },
};

/* 產出來源：決定詳情頁「這份東西哪來的」那一段要往哪一頁跳 */
const DRIVE_ORIGIN_CFG = {
  schedule: { label: '排程產出', color: '#2563EB', bg: 'rgba(37,99,235,0.08)',   nav: 'scheduling' },
  chat:     { label: 'AI 對話產出', color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', nav: 'chat' },
  upload:   { label: '人工上傳', color: '#6B7280', bg: 'rgba(107,114,128,0.08)', nav: null },
};

/* ── 兩份示意用的 HTML artifact ──
   刻意寫成「AI 產得出來、也真的能嵌進 KPI 頁」的樣子：
   單檔、無外部依賴、無 script。用色與間距照 UI guideline 走。 */
const DRIVE_HTML_UPTIME = [
  '<!DOCTYPE html><html lang="zh-TW"><head><meta charset="utf-8">',
  '<style>',
  'body{margin:0;padding:24px;font-family:-apple-system,"Segoe UI",Roboto,sans-serif;background:#FFFFFF;color:#222222}',
  'h1{font-size:18px;font-weight:600;margin:0 0 8px}',
  '.sub{font-size:12px;color:#9E9E9E;margin-bottom:24px}',
  '.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px}',
  '.card{background:#F5F5F5;border:1px solid #E0E0E0;border-radius:6px;padding:16px}',
  '.k{font-size:12px;color:#9E9E9E;margin-bottom:8px}',
  '.v{font-size:24px;font-weight:700;line-height:1}',
  '.u{font-size:13px;font-weight:400;color:#9E9E9E;margin-left:4px}',
  '.bad{color:#EF4444}',
  'table{width:100%;border-collapse:collapse;font-size:13px}',
  'th{text-align:left;font-size:12px;color:#9E9E9E;font-weight:600;padding:8px;border-bottom:1px solid #E0E0E0}',
  'td{padding:8px;border-bottom:1px solid #E0E0E0}',
  '.dot{display:inline-block;width:10px;height:10px;border-radius:999px;margin-right:8px;vertical-align:-1px}',
  '.mono{font-family:monospace}',
  '</style></head><body>',
  '<h1>ETC 設備課 · 週稼動率彙整</h1>',
  '<div class="sub">由 Codify「設備稼動率週報」於 今日 06:00 產出 · 資料來源 FDC / 設備監控</div>',
  '<div class="cards">',
  '<div class="card"><div class="k">平均稼動率</div><div class="v bad">92.3<span class="u">%</span></div></div>',
  '<div class="card"><div class="k">低於目標機台</div><div class="v bad">3<span class="u">台</span></div></div>',
  '<div class="card"><div class="k">本週停機時數</div><div class="v">18.6<span class="u">h</span></div></div>',
  '</div>',
  '<table><thead><tr><th>機台</th><th>稼動率</th><th>停機時數</th><th>主要停機原因</th></tr></thead><tbody>',
  '<tr><td class="mono">E-308</td><td><span class="dot" style="background:#EF4444"></span>86.4%</td><td>7.2 h</td><td>FDC 電流異常</td></tr>',
  '<tr><td class="mono">E-502</td><td><span class="dot" style="background:#F59E0B"></span>90.1%</td><td>4.8 h</td><td>溫控警報</td></tr>',
  '<tr><td class="mono">E-203</td><td><span class="dot" style="background:#F59E0B"></span>91.7%</td><td>3.1 h</td><td>預防性保養</td></tr>',
  '<tr><td class="mono">E-117</td><td><span class="dot" style="background:#22C55E"></span>96.8%</td><td>1.5 h</td><td>換片等待</td></tr>',
  '<tr><td class="mono">E-441</td><td><span class="dot" style="background:#22C55E"></span>97.2%</td><td>2.0 h</td><td>換片等待</td></tr>',
  '</tbody></table>',
  '</body></html>',
].join('\n');

const DRIVE_HTML_CASE = [
  '<!DOCTYPE html><html lang="zh-TW"><head><meta charset="utf-8">',
  '<style>',
  'body{margin:0;padding:24px;font-family:-apple-system,"Segoe UI",Roboto,sans-serif;background:#FFFFFF;color:#222222}',
  'h1{font-size:18px;font-weight:600;margin:0 0 8px}',
  '.sub{font-size:12px;color:#9E9E9E;margin-bottom:24px}',
  '.row{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #E0E0E0}',
  '.bar{height:16px;border-radius:2px;background:#2563EB}',
  '.name{width:120px;font-size:13px}',
  '.n{font-size:13px;color:#9E9E9E;width:48px;text-align:right}',
  '.note{margin-top:24px;padding:16px;background:#F5F5F5;border:1px solid #E0E0E0;border-radius:6px;font-size:13px;line-height:1.8}',
  '</style></head><body>',
  '<h1>Unclose Case 逾期分佈</h1>',
  '<div class="sub">由 Codify「Unclose Case 每日盤點」於 今日 08:00 產出 · 資料來源 Case Center</div>',
  '<div class="row"><div class="name">逾期 &gt; 7 天</div><div class="bar" style="width:96px"></div><div class="n">2 件</div></div>',
  '<div class="row"><div class="name">逾期 3–7 天</div><div class="bar" style="width:48px"></div><div class="n">1 件</div></div>',
  '<div class="row"><div class="name">逾期 1–2 天</div><div class="bar" style="width:144px"></div><div class="n">3 件</div></div>',
  '<div class="row"><div class="name">未逾期</div><div class="bar" style="width:48px"></div><div class="n">1 件</div></div>',
  '<div class="note">共 7 件未結案，其中 <b>2 件逾期超過 7 天</b>（#UC-442、#UC-451），已超出課 KPI 目標值 ≤5 件。建議優先指派。</div>',
  '</body></html>',
].join('\n');

const DRIVE_HTML_YIELD = [
  '<!DOCTYPE html><html lang="zh-TW"><head><meta charset="utf-8">',
  '<style>',
  'body{margin:0;padding:24px;font-family:-apple-system,"Segoe UI",Roboto,sans-serif;background:#FFFFFF;color:#222222}',
  'h1{font-size:18px;font-weight:600;margin:0 0 8px}',
  '.sub{font-size:12px;color:#9E9E9E;margin-bottom:24px}',
  '.chart{display:flex;align-items:flex-end;gap:8px;height:160px;padding:16px;background:#F5F5F5;border:1px solid #E0E0E0;border-radius:6px}',
  '.col{flex:1;display:flex;flex-direction:column;align-items:center;gap:8px}',
  '.b{width:100%;border-radius:2px 2px 0 0;background:#2563EB}',
  '.l{font-size:12px;color:#9E9E9E}',
  '</style></head><body>',
  '<h1>ETC 製程課 · 站點良率比較</h1>',
  '<div class="sub">由 AI 對話產出 於 今日 11:20 · 資料來源 SPC</div>',
  '<div class="chart">',
  '<div class="col"><div class="b" style="height:112px"></div><div class="l">CVD</div></div>',
  '<div class="col"><div class="b" style="height:96px;background:#FCA5A5"></div><div class="l">ETCH</div></div>',
  '<div class="col"><div class="b" style="height:120px"></div><div class="l">PHOTO</div></div>',
  '<div class="col"><div class="b" style="height:104px"></div><div class="l">CMP</div></div>',
  '<div class="col"><div class="b" style="height:88px;background:#FCA5A5"></div><div class="l">IMP</div></div>',
  '</div>',
  '</body></html>',
].join('\n');

/* ── 三個課各自的硬碟 ──
   root 是一個陣列（同一層的節點），資料夾以 children 遞迴。
   系統資料夾 system:true → 不可改名、不可刪除，UI 上不給那兩個動作。 */
const DRIVE_DATA = {

  /* ════════ ETC 設備課 ════════ */
  equipment: {
    quota: { usedLabel: '12.4 GB', totalLabel: '100 GB', percent: 12 },
    root: [
      {
        id: 'dv-eq-agent', name: DRIVE_AGENT_FOLDER, type: 'folder', system: true,
        updatedAt: '今日 15:30', owner: 'Agent Portal',
        children: [
          {
            id: 'dv-eq-a1', name: '設備稼動率週報.html', type: 'html', size: '248 KB',
            owner: 'AI 產出', updatedAt: '今日 06:00',
            origin: { kind: 'schedule', label: '排程：設備稼動率週報', by: 'Codify · 每週一 06:00', at: '今日 06:00' },
            html: DRIVE_HTML_UPTIME,
          },
          {
            id: 'dv-eq-a2', name: 'Unclose_Case_逾期分佈.html', type: 'html', size: '96 KB',
            owner: 'AI 產出', updatedAt: '今日 08:00',
            origin: { kind: 'schedule', label: '排程：Unclose Case 每日盤點', by: 'Codify · 每日 08:00', at: '今日 08:00' },
            html: DRIVE_HTML_CASE,
          },
          {
            id: 'dv-eq-a3', name: '當班交接報告_0418日班.md', type: 'md', size: '18 KB',
            owner: 'AI 產出', updatedAt: '今日 15:30',
            origin: { kind: 'schedule', label: '排程：當班交接報告', by: 'Codify · 每日 15:30 / 23:30 / 07:30', at: '今日 15:30' },
          },
          {
            id: 'dv-eq-a4', name: 'FDC異常明細_0418.csv', type: 'csv', size: '412 KB',
            owner: 'AI 產出', updatedAt: '今日 08:00',
            origin: { kind: 'schedule', label: '排程：Unclose Case 每日盤點', by: 'Codify · 每日 08:00', at: '今日 08:00' },
          },
          {
            id: 'dv-eq-a5', name: 'E-308_電流波動分析.png', type: 'png', size: '1.2 MB',
            owner: 'AI 產出', updatedAt: '今日 10:42',
            origin: { kind: 'chat', label: 'AI 對話：E-308 異常怎麼看', by: '王志明 發問', at: '今日 10:42' },
          },
        ],
      },
      {
        id: 'dv-eq-doc', name: '課共用文件', type: 'folder',
        updatedAt: '04/16 14:20', owner: '王志明',
        children: [
          {
            id: 'dv-eq-d1', name: 'ETC設備課_年度保養計畫.xlsx', type: 'xlsx', size: '1.8 MB',
            owner: '王志明', updatedAt: '04/16 14:20',
            origin: { kind: 'upload', label: '人工上傳', by: '王志明', at: '04/16 14:20' },
          },
          {
            id: 'dv-eq-d2', name: '機台異常處理SOP_v4.pdf', type: 'pdf', size: '3.4 MB',
            owner: '陳建宏', updatedAt: '04/11 09:05',
            origin: { kind: 'upload', label: '人工上傳', by: '陳建宏', at: '04/11 09:05' },
          },
          {
            id: 'dv-eq-sub', name: '教育訓練', type: 'folder',
            updatedAt: '03/28 16:00', owner: '陳建宏',
            children: [
              {
                id: 'dv-eq-d3', name: '新人上線訓練_2026Q1.pptx', type: 'pptx', size: '8.6 MB',
                owner: '陳建宏', updatedAt: '03/28 16:00',
                origin: { kind: 'upload', label: '人工上傳', by: '陳建宏', at: '03/28 16:00' },
              },
            ],
          },
        ],
      },
      {
        id: 'dv-eq-hand', name: '交接紀錄', type: 'folder',
        updatedAt: '今日 15:30', owner: 'Agent Portal',
        children: [
          {
            id: 'dv-eq-h1', name: '2026-04_交接彙整.xlsx', type: 'xlsx', size: '640 KB',
            owner: '王志明', updatedAt: '04/18 07:35',
            origin: { kind: 'upload', label: '人工上傳', by: '王志明', at: '04/18 07:35' },
          },
        ],
      },
    ],
  },

  /* ════════ ETC 製程課 ════════ */
  process: {
    quota: { usedLabel: '8.1 GB', totalLabel: '100 GB', percent: 8 },
    root: [
      {
        id: 'dv-pr-agent', name: DRIVE_AGENT_FOLDER, type: 'folder', system: true,
        updatedAt: '今日 11:20', owner: 'Agent Portal',
        children: [
          {
            id: 'dv-pr-a1', name: '站點良率比較.html', type: 'html', size: '132 KB',
            owner: 'AI 產出', updatedAt: '今日 11:20',
            origin: { kind: 'chat', label: 'AI 對話：這週哪一站良率掉最多', by: '林佳蓉 發問', at: '今日 11:20' },
            html: DRIVE_HTML_YIELD,
          },
          {
            id: 'dv-pr-a2', name: 'SPC失控站點清單_0418.csv', type: 'csv', size: '86 KB',
            owner: 'AI 產出', updatedAt: '今日 07:00',
            origin: { kind: 'schedule', label: '排程：SPC 每日巡檢', by: 'Codify · 每日 07:00', at: '今日 07:00' },
          },
          {
            id: 'dv-pr-a3', name: 'DCR待審摘要_0418.md', type: 'md', size: '12 KB',
            owner: 'AI 產出', updatedAt: '今日 07:00',
            origin: { kind: 'schedule', label: '排程：SPC 每日巡檢', by: 'Codify · 每日 07:00', at: '今日 07:00' },
          },
        ],
      },
      {
        id: 'dv-pr-doc', name: '課共用文件', type: 'folder',
        updatedAt: '04/14 10:00', owner: '林佳蓉',
        children: [
          {
            id: 'dv-pr-d1', name: 'Recipe變更管制辦法_v2.pdf', type: 'pdf', size: '2.1 MB',
            owner: '林佳蓉', updatedAt: '04/14 10:00',
            origin: { kind: 'upload', label: '人工上傳', by: '林佳蓉', at: '04/14 10:00' },
          },
        ],
      },
    ],
  },

  /* ════════ 製造課 ════════ */
  mfg: {
    quota: { usedLabel: '5.6 GB', totalLabel: '100 GB', percent: 6 },
    root: [
      {
        id: 'dv-mf-agent', name: DRIVE_AGENT_FOLDER, type: 'folder', system: true,
        updatedAt: '今日 09:15', owner: 'Agent Portal',
        children: [
          {
            id: 'dv-mf-a1', name: 'WIP分佈快照_0418.csv', type: 'csv', size: '204 KB',
            owner: 'AI 產出', updatedAt: '今日 09:15',
            origin: { kind: 'schedule', label: '排程：WIP 每日快照', by: 'Codify · 每日 09:15', at: '今日 09:15' },
          },
          {
            id: 'dv-mf-a2', name: '急單批次追蹤_0418.md', type: 'md', size: '9 KB',
            owner: 'AI 產出', updatedAt: '今日 09:15',
            origin: { kind: 'schedule', label: '排程：WIP 每日快照', by: 'Codify · 每日 09:15', at: '今日 09:15' },
          },
        ],
      },
      {
        id: 'dv-mf-doc', name: '課共用文件', type: 'folder',
        updatedAt: '04/09 13:30', owner: '張美玲',
        children: [
          {
            id: 'dv-mf-d1', name: '線體排班表_2026Q2.xlsx', type: 'xlsx', size: '520 KB',
            owner: '張美玲', updatedAt: '04/09 13:30',
            origin: { kind: 'upload', label: '人工上傳', by: '張美玲', at: '04/09 13:30' },
          },
        ],
      },
    ],
  },
};

/* 開站就已經嵌在 KPI 的 artifact —— 讓「嵌入」不是只有空狀態可看，
   進 KPI 頁第一眼就看得到 Drive 的產出已經在報表清單裡。 */
const DEFAULT_DRIVE_EMBEDS = {
  equipment: ['dv-eq-a1'],
  process:   [],
  mfg:       [],
};

/* ── 讀取層 ─────────────────────────────────────────────── */

function getDriveRoot(personaKey) {
  var d = DRIVE_DATA[personaKey] || DRIVE_DATA.equipment;
  return d.root;
}

function getDriveQuota(personaKey) {
  var d = DRIVE_DATA[personaKey] || DRIVE_DATA.equipment;
  return d.quota;
}

/* 依 path（folder id 陣列）走進去，回傳該層的節點清單 */
function getDriveChildren(personaKey, path) {
  var nodes = getDriveRoot(personaKey);
  for (var i = 0; i < (path || []).length; i++) {
    var next = nodes.filter(function (n) { return n.id === path[i]; })[0];
    if (!next || !next.children) return nodes;
    nodes = next.children;
  }
  return nodes;
}

/* 攤平成單層檔案清單（不含資料夾），供「AI 產出」「最近更新」這類虛擬檢視用 */
function flattenDriveFiles(personaKey) {
  var out = [];
  (function walk(nodes, trail) {
    nodes.forEach(function (n) {
      if (n.type === 'folder') {
        walk(n.children || [], trail.concat([n]));
      } else {
        out.push(Object.assign({}, n, {
          folderPath: trail.map(function (f) { return f.name; }).join(' / '),
          folderIds: trail.map(function (f) { return f.id; }),
        }));
      }
    });
  })(getDriveRoot(personaKey), []);
  return out;
}

function getDriveFileById(personaKey, id) {
  return flattenDriveFiles(personaKey).filter(function (f) { return f.id === id; })[0] || null;
}

/* 可嵌入 KPI 的條件只有一條：是 .html。
   邏輯集中在這裡，Drive 與 KPI 兩頁都問同一個函式，不各自判斷副檔名。 */
function isDriveEmbeddable(file) {
  return !!file && file.type === 'html' && !!file.html;
}
