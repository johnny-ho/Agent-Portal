---
type: entity
title: 官方網站（對內推廣單頁）
description: 面向值班人員的推廣官網 — 主詞是「課的工作站」而非 AI；website/src 建置、真實截圖 + 手刻對話流
tags: [website, marketing, positioning, communication]
updated: 2026-08-19
sources: [PO×AI 討論 2026-08-19, brain/overview.md, brain/concepts/design-principles.md, brain/concepts/ecp-strategy.md, chatScenarios.js sc-eq-3]
status: current
---

# 官方網站（對內推廣單頁）

**目的**：對公司內部**設備／製程／製造值班人員**溝通 Agent Portal 是什麼，並把人導進 Portal 首頁開始使用。中文優先、中英同頁並陳。正式產品語氣（PO 指示：mock 只是 repo 現況，實際系統已可動，官網當正式產品賣）。

## 定位決策：主詞是「課」，不是 AI

**第一版草案被 PO 退回**，理由是「太限縮在 AI，沒有講出課的 workspace 的概念」。這是本頁最重要的一條紀錄：

| | 退回的第一版 | 現行版本 |
|---|---|---|
| 主標 | 值班的例行工作，讓 Agent 先跑完 | **你的課，有一個自己的工作站** |
| AI 的位置 | 全站招牌，四大特色有三個在講 AI | **六個去處之一**，另在時間軸佔 5 格中的 2 格 |
| 沒講到的 | 課為資料邊界、工作站不是儀表板、Seed 自治 | 三者各佔一段 |

三個支柱來自 [overview](../overview.md) 與 [design-principles](../concepts/design-principles.md)：

1. **課是資料邊界**（原則 1）— 看到的每一筆都是你的課
2. **工作站不是儀表板**（原則 2、[home-dashboard](modules/home-dashboard.md)）— 每張卡片都能點下去做事，「不做給課長欣賞的精美儀表板」
3. **課自己管自己的地盤**（[widget-governance](../concepts/widget-governance.md) 四層治理）— Seed 是課裡的工程師不是 IT，**加東西不用開單等 IT**。這是對 ECP 最有力的差異化，第一版完全沒出現

## 頁面結構（單頁 6 段）

**第二輪 PO 意見（同日）大幅改結構**：拿掉「一個班的一天」時間軸與兩個「放大看」，改成**六大功能各配一個可點擊的真實例子**並往上擺。理由：PO 要的例子是「每個主功能都有對應的一個可見例子」，不是敘事型時間軸。頁面從 9836px 縮到約 5000px。

| 段 | 內容 | 素材 |
|---|---|---|
| Hero | 主標 + 雙 CTA + 三條信任小字 | — |
| **六大功能** | 膠囊 tab 切換 Home／KPI／應用中心／AR 派工／AI 助理／排程與決策，各一張真實截圖 + 三個重點 | Playwright 實拍 ×6 |
| 為什麼是「課」 | 現在 vs 用了之後 四列對照 | 研調痛點 |
| 輕鬆管理自己的工作區 | 種子 Seed／成員 Member／瀏覽者 Viewer 三卡 | PO 指定（比照 FOD） |
| 常見疑問 | 四題（PO 指定） | — |
| CTA | 藍底收尾 | — |

**FAQ 四題（PO 指定）**：① 這跟舊版 ECP 有何不同 ② AI 在哪裡用、可以做什麼 ③ AI 會做到哪些事情 ④ 有問題該找誰。
②③ 語意接近，區分為：②答**入口與用途**（AI 助理頁 + 排程），③答**邊界**（止於查詢與建議，寫入一律停下等人）。**PO 已確認此區分正確（2026-08-19）。**

## 文案原則（PO 退稿兩次的共同原因）

PO 對第一版與第二版的批評都是**語言**：「太饒口、太 AI」「正常人不會這樣說話」。歸納出三條，日後寫任何對外文案照這個走：

1. **不要抽象框架句**。被點名的反例：「課是排班、交接、協調的實際單位。所以 Portal 把『課』當成資料邊界⋯」→ 應寫「課上所需的管理工具都幫你準備到位了，KPI Report、AR 派工、常用工具」。**先講使用者拿到什麼，不要先解釋設計理念。**
2. **不要內部實作詞**。反例：「右側**全高面板**，只放你自己的事」——「全高面板」對使用者毫無意義。改「右側任務清單，重點關注自己的任務，不受雜訊打擾」。同理避免 Section Zone、資料邊界、AmbientBar、Widget Contract。
3. **具名優於泛稱**。講「KPI 報表、AR 派工、機台狀態、常用系統入口」，不要講「課上的各種工具」。

**用語採公司既有詞彙**：「**AR 派工**」——「Task = AR」是公司獨特用法，PO 定案（2026-08-19），已記入 [task-management](modules/task-management.md)；「**FOD**」為權限比照對象。程式碼維持 Task 命名，**面向使用者的文案一律用 AR**。

## 實作

```
website/
├── build.py          # 比照 Agent portal/build.py；另會把 src/assets 複製到輸出檔旁
├── src/
│   ├── shell.html    # {{STYLES}} {{CONTENT}} + 膠囊 tab 的 30 行 inline JS
│   ├── styles.css    # 設計 token，無框架
│   ├── sections/     # 00-header … 09-footer，一段一檔，順序由 build.py 的 SECTIONS 決定
│   └── assets/       # 三張截圖
└── index.html        # build 產出，勿手改
```

- 建置：`cd website && python3 build.py`（可 `--output`）
- **不用 Tailwind**：靜態單頁效益低，且可少一個外部 CDN 依賴（本環境 `cdn.tailwindcss.com` 與 `unpkg.com` 皆被擋）。與產品端「UI 優先 Tailwind」不同，屬刻意分歧
- 嚴守 CLAUDE.md UI Guideline：`#2563EB`、8px 系統（實測全站 margin/padding 皆 8 倍數）、圓角 6px、膠囊 tab 無底線、狀態圓點 10×10 四色、**零漸層零 box-shadow**
- CTA 一律指向 `../index.html`（Portal build 產出）

## 截圖產製流程（可重複）

本環境 CDN 被擋，Portal 的 `index.html` 無法直接開。做法（**`Agent portal/src/shell.html` 全程不動**，只改副本）：

1. 複製 `index.html` 到暫存 → 從 npm 取 react / react-dom / dayjs / antd@5.22.5 / @babel/standalone 的 UMD 檔
2. Tailwind Play CDN 無 npm 對應 → 用 `tailwindcss@3` CLI 掃描該 HTML 產生靜態 CSS（實測僅 6.5KB，因產品用 1805 處 inline style、僅 48 個 className）
3. Playwright 以 `executablePath: /opt/pw-browsers/chromium-1194/chrome-linux/chrome` 啟動（預裝版本與 npm 的 playwright 不合，勿 `playwright install`）
4. 截圖前 `mouse.move` 移開游標，否則左側 Nav 的 tooltip 會入鏡
5. Pillow 縮到寬 2000 + 256 色量化：1.27MB → 448KB

⚠️ **快問欄（AmbientBar）未實作**：`SectionPage.jsx` 的 mock 有這個元件，但 PO 明確指出實際系統沒做。官網已**從 Home 截圖底部裁掉**（裁到 916px），不只是不標註 —— 留在圖上等於承諾一個不存在的功能。日後重拍務必沿用此裁切。

**Seed／Member／Viewer 三角色**已依 PO 指示同步進 [widget-governance](../concepts/widget-governance.md)（2026-08-19）。⚠️ Viewer 為新增角色，UI 與資料層尚未實作，落地細節見該頁。

⚠️ **截圖含示範資料**（機台號 E-101/E-308、人名 張文凱/陳育民等）。已向 PO 提示，若為真實同事姓名需替換為通用名 —— **尚未確認**。

## 未決 / 後續

- 上線網址未定：目前 CTA 走同 repo 相對路徑；若要掛內部正式網域需改 `00-header.html`、`01-hero.html`、`08-cta.html`、`09-footer.html` 四處
- 產品改版後截圖會過期，需重跑上述流程
- 尚無成效追蹤（點擊 CTA 進站的轉換）
