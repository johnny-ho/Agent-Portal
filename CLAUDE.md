# 專案開發規範 (CLAUDE.md)

## 🧠 AI 大腦（brain/ LLM Wiki）
本專案有一個由 AI 維護的知識庫 `brain/`，是 PO 與 AI 協作的共同大腦（產品管理用途）。

1. **Session 開始**：先讀 `brain/index.md` 與 `brain/overview.md` 進入狀況，不必重讀整份 PRODUCT_BASELINE.md。
2. **運作規範**：讀寫 wiki 一律遵守 `brain/WIKI.md`（schema）。Raw sources（根目錄各 .md 文件與 `brain/raw/`）永不修改。
3. **持續維護**：本 session 若產生新決議、新文件、或有價值的分析結果，須 ingest / 回填至 wiki，並更新 `brain/index.md` 與 `brain/log.md`。
4. **PO 喊「lint」**：依 WIKI.md 的 Lint 流程健檢並回報。

## ⚠️ 核心工作規則
1. **路徑守則**：
   - 嚴禁直接修改 Build 輸出成品（根目錄的 `index.html`）。
   - 所有功能改動必須在 `Agent portal/src/` 下的原始碼中進行。
   - 元件放 `Agent portal/src/components/`，資料放 `Agent portal/src/data/`。

2. **Build 指令**：
   - 建置（輸出至根目錄 index.html）：
     `cd "Agent portal" && python3 build.py`
   - 指定輸出路徑：
     `cd "Agent portal" && python3 build.py --output <path>`

3. **操作流程**：
   - 修改原始碼 → 執行 Build 指令 → 驗證 index.html 輸出。
   - 進行任何檔案變動前，先使用 `ls` 與 `grep` 確認當前專案狀態。

4. **環境約束**：
   - UI 實作優先使用 Tailwind CSS。
   - 確保元件組件化，檔案結構需清晰。


## 🎨 UI/UX Design Guideline (實作準則)
> AI 在生成任何 HTML/JSX 或 Tailwind 代碼時，必須嚴格遵守以下規範：

### 1. 色彩與視覺限制
- **主色調**：`color-primary` 為 `#2563EB`。
- **絕對禁止**：禁止使用任何漸層 (`gradient`)、禁止使用 `box-shadow` (除非極輕微 `0 1px 3px`)。
- **背景規範**：頁面底色 `#FFFFFF`，面板底色 `#F5F5F5`。

### 2. 間距與排版 (硬性規定)
- **8px 系統**：所有 `margin` 和 `padding` 必須是 8 的倍數 (如 8, 16, 24, 32)。**禁止出現 5px, 10px 等非規範數值。**
- **字體**：頁面標題 18px/600，內容 14px/400。URL 必須使用 `monospace`。

### 3. 元件實作細節
- **Button**：圓角固定為 `6px`，主要按鈕背景色 `#2563EB`。
- **Tabs**：膠囊式設計（圓角 999px），選中時背景為 `#2563EB`，**禁止使用底線**。
- **Layout**：嚴格執行「三欄式佈局」（導覽 -> 列表 -> 詳情）。

### 4. 程式碼 Don'ts
- 不可使用 `placeholder` 取代 `label`。
- 狀態圓點必須是 `10x10` 的圓形，顏色限於規範內的四色。