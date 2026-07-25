# WIKI.md — Agent Portal AI 大腦運作規範（Schema）

> 本檔是 `brain/` 知識庫的憲法。任何 AI（或人）對 wiki 的讀寫都必須遵守本檔。
> 概念來源：Karpathy「LLM Wiki」模式 — LLM 持續建立並維護一個結構化、互連的 markdown 知識庫，知識編譯一次、持續保鮮，而非每次查詢重新推導。

## 1. 目的

這個 wiki 是 **PO（Johnny）與 AI 協作的共同大腦**，用途是產品管理：

- 讓 AI 在任何新 session 不必重讀 1400 行 baseline，讀 `index.md` + 相關頁面即可進入狀況
- 累積跨文件的綜合判斷：決議脈絡、矛盾標記、未解問題的演進
- 讓討論產出（分析、比較、backlog、覆盤）回填成頁面，不消失在對話紀錄裡

## 2. 三層架構

| 層 | 位置 | 規則 |
|----|------|------|
| **Raw Sources** | 專案根目錄的 `PRODUCT_BASELINE.md`、`scrum_teaming.md`、backlog 與覆盤文件；未來新素材放 `brain/raw/` | **不可修改**（immutable）。wiki 只讀取、引用 |
| **Wiki** | `brain/` 下所有頁面 | AI 全權維護；PO 閱讀、下指令、問問題 |
| **Schema** | 本檔（`brain/WIKI.md`） | 定義結構與工作流；與 PO 共同演進 |

## 3. 目錄結構與頁面類型

```
brain/
├── WIKI.md              ← 本檔（schema）
├── index.md             ← 內容目錄：所有頁面 + 一行摘要（每次 ingest 必更新）
├── log.md               ← 時間軸：append-only 操作紀錄
├── overview.md          ← 全局綜述（synthesis）：產品是什麼、現在在哪、往哪走
├── decisions.md         ← 決議時間軸（v2.5 → v3.9 各版決議一頁掌握）
├── open-questions.md    ← 未解問題總表（OQ / TM-OQ / SCH-OQ 彙整）
├── sources/             ← type: source — 每份 raw source 一頁摘要
├── entities/            ← type: entity — personas、teams
│   └── modules/         ←   產品九大模組，每模組一頁
├── concepts/            ← type: concept — 跨模組的設計思想與策略
└── raw/                 ← 未來新素材收件匣（會議記錄、訪談、截圖…）
```

## 4. 頁面格式（frontmatter 必填）

```markdown
---
type: source | entity | concept | decision | synthesis
title: 頁面標題
description: 一行摘要（index.md 直接引用這行）
tags: [module, ai, backlog, ...]
updated: YYYY-MM-DD
sources: [PRODUCT_BASELINE.md §8, scrum_teaming.md §3]
status: current | needs-review | stale
---
```

- **連結**：使用相對路徑 markdown 連結，如 `[AI Chat](entities/modules/ai-chat.md)`。每頁至少 1 個入鏈與 1 個出鏈，避免孤兒頁
- **引用**：關鍵主張須標注來源（檔名 + 章節），讓 PO 幾秒內可回查
- **語言**：繁體中文；標題與檔名用 kebab-case 英文
- **精簡原則**：頁面壓到最少。多來源談同一主題時「合併」而非「累加」；新資訊取代舊敘述，不並列

## 5. 工作流（Operations）

### Ingest（收錄新素材）
1. PO 提供新素材（放入 `brain/raw/` 或直接貼在對話）
2. AI 讀取 → 與 PO 確認重點 → 在 `sources/` 建摘要頁
3. 更新所有受影響的 entity / concept / decision 頁（一份素材可能觸及 5–15 頁）
4. 新資訊與既有頁面矛盾時：更新頁面並在該處標注 `⚠️ 供需矛盾/已被取代`，重大者記入 `decisions.md`
5. 更新 `index.md`，`log.md` 追加一筆

### Query（查詢與分析）
1. 先讀 `index.md` 定位相關頁，再深入頁面（不足時才回查 raw source）
2. 回答附頁面引用
3. **有價值的答案回填成頁面**（分析、比較表、backlog 草稿），這是 wiki 增值的主要途徑

### Lint（健檢，PO 喊「lint」時執行）
依序檢查：frontmatter 完整性 → 失效連結 → 孤兒頁 → index 與實際檔案一致 → 過期頁（被新決議取代但未更新）→ 缺頁（被多處提及但沒有自己頁面的概念）。產出報告，**不擅自刪檔**，刪除一律先報 PO 核准。

### Log 格式（可被 grep 解析）
```
## [YYYY-MM-DD] ingest|query|lint|decision | 標題
一到三行說明；列出受影響頁面。
```

## 6. 硬規則

1. **Raw sources 永不修改**（含根目錄四份文件與 `brain/raw/` 內容）
2. **PO 優先制**：PO 說「不要修改文件」時，凍結所有寫入
3. **不確定不猜**：素材間矛盾且無法判定時，標記並問 PO，不自行仲裁
4. **每次寫入必留痕**：任何頁面異動都要反映在 `log.md`
5. 刪頁、併頁需 PO 核准；新增與更新不需
