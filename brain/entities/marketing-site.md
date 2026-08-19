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

## 頁面結構（單頁 8 段）

| 段 | 內容 | 素材來源 |
|---|---|---|
| Hero | 主標 + 雙 CTA + 三條信任小字（範圍／可行動／Seed） | — |
| 打開長這樣 | **Home 真實截圖**，標記 1/2/3 對應 Section Zone／My Tasks／AmbientBar | Playwright 實拍 |
| 為什麼是「課」 | 現在 vs 用了之後 四列對照；收在「不是儀表板」 | 研調三大痛點、原則 2/5/6 |
| 六個去處 | Home·KPI·App·Task·AI·Schedule + App Center 截圖 | [sitemap](sitemap.md) |
| 一個班的一天 | EE／PE／MFG 膠囊 tab，各一條 5 格時間軸 | [personas](personas.md)、scheduling.js |
| 09:20 放大看 | **手刻對話流**：ERR-4421 研判 + 證據面板 + 被 Tool Gateway 擋下的寫入 | `chatScenarios.js` `sc-eq-3` |
| 14:00 放大看 | **Schedule 決策收件匣真實截圖** + 三張說明卡 | Playwright 實拍 |
| 課自己管 / FAQ / CTA | 四層治理三卡、四題疑問、藍底收尾 | 四層治理、原則 4/5/6 |

**FAQ 四題**刻意正面回應最大阻力：是不是監視工具／AI 會不會自己改系統／要學多久／會不會取代 FDC·MES。第一題直接呼應研調警訊「千萬別把這做成給課長看的監視工具」。

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

⚠️ **截圖含示範資料**（機台號 E-101/E-308、人名 張文凱/陳育民等）。已向 PO 提示，若為真實同事姓名需替換為通用名 —— **尚未確認**。

## 未決 / 後續

- 上線網址未定：目前 CTA 走同 repo 相對路徑；若要掛內部正式網域需改 `00-header.html`、`01-hero.html`、`08-cta.html`、`09-footer.html` 四處
- 產品改版後截圖會過期，需重跑上述流程
- 尚無成效追蹤（點擊 CTA 進站的轉換）
