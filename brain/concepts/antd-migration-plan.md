---
type: concept
title: Ant Design 全面遷移計畫
description: PO 決議全面遷移 AntD — 分 8 個 Phase、頁面順序、theme token 映射、每頁驗收準則（執行 agent 的作業依據）
tags: [plan, migration, ui, backlog]
updated: 2026-07-25
sources: [PO 決議 2026-07-24、src/ 全站盤點（1,740 處 inline style、className 僅 42 處）]
status: current
---

# Ant Design 全面遷移計畫（PO 已核准）

> **進度（2026-07-25）**：Phase 0–5 ✅ 完成、Phase 8 死檔清理 ✅；**HandoverPage.jsx 已實際刪除**（1,011 行不必遷移，build 產物 655,248 → 592,297 bytes）；**下一棒 Phase 6 僅剩 App.jsx nav/header**。
> **PO 決議（2026-07-24）**：採全面遷移（非孤島漸進）。
> **前提假設**：維持現有 build pipeline（React 18 UMD + Babel Standalone + build.py），**不含 Vite 遷移**——prototype 定位不動架構。
> **現況數據**：13 元件 ~14,000 行；樣式為 ~1,740 處 inline `style={{}}` 掛在自製 ThemeContext（`C` 色彩 + `fz()` 字級 + dark mode）；Tailwind 實際僅 42 處 className。

## Phase 0 — 基礎建設（✅ 已完成 2026-07-24）

> 實作結果：shell.html 已加 `dayjs@1.11.13` → `antd@5.22.5` UMD（釘死版本）；shared.jsx 新增 `AppConfigProvider`（從 ThemeContext 讀 isDark/fontSize，映射 colorPrimary #2563EB / borderRadius 6 / fontSize 12·14·16 / 陰影覆寫極輕 / darkAlgorithm + DARK_COLORS）；App.jsx 以 `<AppConfigProvider>` 包住主體。瀏覽器實測：antd/dayjs 載入成功、ConfigProvider 生效（AntD Switch 呈 #2563EB）、light/dark 皆正常、無破版。通知中心已作為試點完成（見 [notification](../entities/modules/notification.md)）。

1. `shell.html`：加 **dayjs UMD → antd v5 UMD**（順序不可反；CDN URL 釘死版本號，不用浮動 latest）
2. 新增 `AppConfigProvider`（建議放 shared.jsx）：ConfigProvider token 映射 UI guideline：
   - `colorPrimary: #2563EB`、`borderRadius: 6`、`fontSize: 14`、layout 底色 #FFFFFF / 面板 #F5F5F5
   - **陰影 token 覆寫為極輕**（guideline 禁陰影，AntD 預設會洩漏）
   - dark mode：`theme.darkAlgorithm` + 現有 DARK_COLORS 映射
   - 字級三檔：`fz` 縮放改由 ConfigProvider `fontSize` 動態值承接（12 / 14 / 16）
3. **ThemeContext 作為過渡橋**：ConfigProvider 從 ThemeContext 讀 isDark/字級；未遷移頁繼續用 `C`/`fz`，已遷移頁禁用；全站完成後 ThemeContext 縮減為 isDark/toggle
4. 元件對應表（每頁遷移一律遵循）：

| 現況自製 | AntD | 注意 |
|---------|------|------|
| 膠囊 tabs | **Segmented**（非 Tabs） | 圓角 999 客製；guideline 禁底線。真 tabs 需選中背景 #2563EB → 用巢狀 ConfigProvider 覆寫 `itemSelectedBg`，勿改全域（篩選型 Segmented 維持預設）|
| toggle | Switch | — |
| 表格/清單 | Table | Task/Setting/Skill/SOP 四頁主場景 |
| 側欄詳情 | Drawer | TaskManagement |
| 彈窗 | Modal | — |
| 表單 | Form + Input/Select | 禁 placeholder 代 label（guideline） |
| tooltip / 下拉面板 | Tooltip / Dropdown / Popover | header 搜尋用 AutoComplete |
| 狀態圓點 | Badge | 固定 10×10、四色規範。已於 `AppConfigProvider` 設 `Badge: { dotSize: 10 }`（AntD 預設 6），全站沿用 |
| Avatar（emoji 邏輯） | 保留自製 | AntD Avatar 不處理 emoji 判斷 |

## Phase 1–7 — 頁面遷移順序（每頁獨立 commit + build + 驗收）

> **Phase 1 ✅ 完成（2026-07-24）**：SettingPage + KpiWidgetSettingPage 的互動控件／表格／表單／彈窗全數改 AntD，build 通過、瀏覽器逐頁 light/dark 實測。
>
> 已遷移清單（元件對應）：
> - **KpiWidgetSettingPage.jsx（736 行）**：自製 toggle→`Switch`、系統膠囊篩選＋方向鈕→`Segmented`、門檻數字框→`InputNumber`、存檔鈕→`Button`、hover 手刻彈窗→`Tooltip`、Dashboard 入口 wrapper→`Modal`。順帶修好原檔硬編淺色（`#F0F7FF`/`#F8FAFF`/`#111827` 等）造成的 dark mode 破版：改用 `C.hoverAccent`/`C.bgSub`/`C.text`，並移除 `getKwsStatus`/`KwsStatusDot` 內未使用且違反 hooks 規則的 `useTheme()` 呼叫。
> - **PersonalSettingTab**（上一棒已做）：Switch／Select／Segmented。
> - **PermissionsTab**：成員清單（三角色）→ per-role `Table`（欄：Avatar／User No／姓名／加入時間／狀態／操作）、邀請 input→`Input`、新增/送出/取消/移除→`Button`（danger）；Avatar emoji 邏輯保留自製。移除死碼 `hoveredRow`/`TH`。
> - **BulletinSettingTab**：公告清單→`Table`、標題 input→`Input`、內文→`Input.TextArea`、置頂 toggle→`Switch`、儲存/發布/下架/刪除→`Button`。
> - **ApplicationSettingTab**：每群組 app 清單→`Table`（必選欄用 `Switch`）、群組名/新增群組 input→`Input`、重命名/刪除/加入應用（dashed）/儲存→`Button`。
> - **KpiReportSettingTab**：`KpiReportModal` 整個改 `Modal`＋`Input`/`Segmented`（來源類型）/`Select`（EDA3 Flow）/`Switch`（啟用）；群組/報表 CRUD 按鈕與列上 ✎/✕ 圖示鈕→`Button`。移除死碼 `kpiRptBtnStyle`/`kpiRptIconBtnStyle`。拖曳排序列結構保留自製。
> - **AppManagementTab**（IT function tree）：三種新增表單的 select→`Select`、input→`Input`、按鈕/工具列→`Button`、L3 功能 toggle→`Switch`、`DeleteBtn`→AntD icon `Button`。三層樹的展開列結構保留自製。（此頁受 `isITUser` gating，本 session 以 Seed persona 無法開頁瀏覽器驗收，僅 build 通過＋沿用他頁已驗證的 primitives。）
> - **HomeLayoutTab**：Widget Picker 彈窗→`Modal`（`getContainer={false}` 限縮於本分頁）、新增列/列工具列（↑↓/＋Widget/×）→`Button`、自訂連結標題 input→`Input`、B/連結工具列與儲存/取消→`Button`。widget chip 的 hover 圖示鈕（靠 DOM querySelector 操作）與 `IsolatedEditor`（contentEditable）保留自製。
> - **KpiSummarySettingTab** = 直接包 `KwiWidgetSettingView`，隨 KpiWidgetSettingPage 一併完成。
>
> **全域死碼清除**：SettingPage 自製 `Toggle` 元件已刪除（全數改 `Switch`）。
>
> **DoD 校準（誠實記錄）**：本頁採「混合式」遷移——與已完成的 PersonalSettingTab 同一套路：互動元件（表格/表單/彈窗/開關/按鈕）改 AntD，但版面骨架文字/容器仍用 `C`/`fz` 以維持字級三檔與 guideline 配色、並讓 dark mode 連動。因此 **DoD「該頁不再引用 C/fz」仍未 100% 達成**（layout scaffolding 尚保留 C/fz），與本計畫原註記一致；此為刻意取捨，非遺漏。若要全清 C/fz 需再一輪把所有承載文字的自製 span/div 轉 Typography，屬 Phase 8 收尾範圍。

> **Phase 2 ✅ 完成（2026-07-25）**：TaskManagementPage 全頁改 AntD，build 通過、light/dark ＋ 字級三檔瀏覽器實測。
>
> 已遷移清單（元件對應）：
> - **任務列表 → `Table`（tree data）**：原本手刻的 `TaskListRow` / `SubTaskRow` 兩個列元件整組刪除，改為 `subTasks → children` 的樹狀 dataSource，展開/收合改用 AntD 原生 expand icon（原自製 ▸/▾ 按鈕移除），`expandedRowKeys` 仍由頁面 state 控制以維持 deep-link 自動展開。維持「進行中按成員分組、歷史按日期分組」的資訊架構：**每組一張 `Table`（`showHeader={false}`）＋組標頭列**，欄寬由 `TM_COL_W` 常數與上方 sticky 欄位 header 共用以確保對齊。
> - **右側詳情 → `Drawer`**（`getContainer={false}` + `mask={false}`，限縮於主體區、不遮列表）；內部 基本資訊→`Descriptions`、子任務清單與同成員任務→`List`、完成提示→`Alert`。
> - **膠囊 tabs（進行中/歷史紀錄）→ `Segmented`**：以**巢狀 `ConfigProvider`** 把 `itemSelectedBg: #2563EB` 侷限在本頁，避免動到 Phase 1 已驗收頁面的 Segmented 外觀（guideline 要求 tabs 選中為主色，但 Phase 1 的 Segmented 是篩選器不是 tabs）。
> - **狀態圓點 → `Badge`**：`AppConfigProvider` 加 `Badge: { dotSize: 10 }` component token，讓 AntD status dot 符合 guideline 的 10×10（預設 6）。NotificationCenter 用的是 `count` badge，不受影響。
> - **派工面板**：input→`Input`、優先級→`Select`、截止日→`DatePicker`（吃 Phase 0 已載入的 dayjs UMD，值仍以 `YYYY-MM-DD` 字串存放）、各按鈕→`Button`；並補上「任務描述／優先級／截止日」欄位 label，修正原本以 placeholder 代 label 的 guideline 違規。
> - **其餘**：狀態/優先級/機台/Chamber/Recipe/AI標記中 badges→`Tag`、狀態篩選→`Select`、成員摘要卡進度條→`Progress`、空狀態→`Empty`。成員 Avatar（首字邏輯）依計畫保留自製。
>
> **順帶修正**：`fmtDate` / `groupByDate` 兩個純函式內違反 hooks 規則的 `useTheme()` 呼叫已移除（與 Phase 1 KpiWidgetSettingPage 同一類問題）；列表原本硬編的 `#FFFFFF`/`#FAFAFA`/`#F0F0F0`/`#1F2937` 等淺色改吃 `C` token，dark mode 不再破版；Drawer 內層面板在 dark 時改用 `C.bgSub`（`colorBgElevated` 已等於 `C.bgPanel`，同色會沒層次）。
>
> **新增全域 CSS**：`styles.css` 加三條 `.tm-list .tm-row-selected` 規則（選取列底色 + 首格 `inset` 左藍邊）。AntD Table 沒有「單選列高亮」內建語意，rowClassName + CSS 是最小侵入解。
>
> **DoD 校準**：同 Phase 1 混合式——互動元件全 AntD，版面骨架（組標頭、欄位 header、Drawer 內區塊標題）仍用 `C`/`fz` 承接字級三檔與 guideline 配色，「該頁不再引用 C/fz」未 100% 達成，留待 Phase 8。

> **Phase 3 ✅ 完成（2026-07-25）**：SkillManagementPage 全頁改 AntD，build 通過、light/dark ＋ 字級三檔瀏覽器實測。
>
> **⚠️ 盤點修正**：本 Phase 原列「SkillManagementPage + SOPManagementPage（914 + 560 行）」，實際盤點發現 **`SOPManagementPage.jsx`（560 行）是死碼**——不在 `build.py` 的 `JS_MODULES` 清單內、不會進 build 產物；產品上的 Skill 管理頁由 `SkillManagementPage.jsx` 提供（該檔的主元件仍叫 `SOPManagementPage`，供 `SettingPage` 知識管理 tab 向後相容呼叫）。**故本 Phase 只遷移實際上線的 SkillManagementPage，未動死檔**；`SOPManagementPage.jsx` 併入 Phase 8 與 `personas.js.bak` 同批刪除 —— **PO 已核准，2026-07-25 兩檔皆已刪除，build 產物不變**（見 Phase 8）。
>
> 已遷移清單（元件對應）：
> - **Skill 清單 → `Table`**：原本手刻的 `SkillCard` 卡片列整個刪除，改為五欄 Table（狀態／Skill 名稱＋描述／引入者／引入日期／操作），欄寬由 `SK_COL_W` 常數控制；點列開詳情 Modal，操作欄按鈕以 `stopPropagation` 隔離。空狀態→`Empty`（維持「沒有符合搜尋條件」/「此階段沒有 Skill」兩種文案）。
> - **階段篩選膠囊 → `Segmented`**（含筆數 chip），選中背景 `#2563EB` 以**巢狀 ConfigProvider** 侷限本頁，同 Phase 2 作法。
> - **詳情彈窗 → `Modal`**（width 1000、centered、body 高 64vh 雙欄；footer 自訂為「刪除 ─ 編輯／推進」一列）。內部：階段標籤→`Tag`、可編輯標籤→`Tag closable` ＋ `Input`/`Button`（`Space.Compact`）、前置資訊 chunk→`Card`、**執行步驟→`Timeline`**（自訂數字 dot，連接線改由 AntD 提供，取代手刻圓圈＋線）、測試記錄與簽核狀態→`List`（`List.Item.Meta` ＋ PASS/FAIL、通過/待審核 `Tag`）、Production 生效資訊→`Descriptions`、注意事項→`Alert type="warning"`。
> - **刪除確認 → `Popconfirm`**（清單列與 Modal footer 各一），取代原本的 `window.confirm`（原生對話框不吃 dark mode／主題）。
> - **引入彈窗 → `Modal` + `Form`（layout vertical）**：欄位改為真 label（`Skill 名稱`／`來源（Confluence 頁面路徑）`），OK 鈕在標題為空時 disabled。
> - **工具列**：搜尋→`Input`（allowClear ＋ 前綴圖示）、排序→`Select`；兩者都補上「搜尋」「排序」inline label，修正原本以 placeholder 代 label 的 guideline 違規。
>
> **順帶修正**：`getStageActionLabel` / `getDescription` / `deriveSiteDeptSection` / `parseStepsFromChunks` / `getInfoChunks` 五個純函式內違反 hooks 規則的 `useTheme()` 呼叫已移除（與 Phase 1、2 同類問題）；原檔硬編淺色（`#333333`/`#444444`/`#666666`/`#F0F0F0`/`#E8E8E8`/`#92400E` 等）改吃 `C` token，dark mode 不再破版。
>
> **環境註記**：本環境（headless 預覽瀏覽器）CSS 動畫時鐘會凍結，Segmented 的滑動 thumb 與 Modal zoom 動畫有時停在第一幀；已對照 Phase 2 已驗收的 TaskManagementPage 確認同樣現象，**非本次遷移造成**（篩選/開窗的實際 state 與 DOM 均正確）。
>
> **DoD 校準**：同 Phase 1、2 混合式——互動元件全 AntD，版面骨架（左欄小標題、區塊標題、工具列 label）仍用 `C`/`fz` 承接字級三檔與 guideline 配色，「該頁不再引用 C/fz」未 100% 達成，留待 Phase 8。

> **Phase 4 ✅ 完成（2026-07-25）**：SchedulingPage + KPIPage + KnowledgePage 三頁改 AntD，build 通過、light/dark ＋ 字級三檔瀏覽器實測。
>
> - **SchedulingPage.jsx（502 行）**：介入橫幅→`Alert type="error"`（HITL 決策點，dark mode 由 AntD 承接，原本硬編 `#FFF1F1`/`#FCA5A5` 已移除）；MCP tool 名稱→`Typography.Text code`；**步驟清單→`Timeline`**（自訂 dot 保留 `SchStepIcon` 的狀態字符，連接線交給 AntD，手刻的 `SchStepRow` 列背景整組刪除，改 `SchStepBody`）；**執行紀錄→`Collapse`**（摘要列＝panel header、狀態 chip→`extra` 的 `Tag`、展開步驟＝panel body），`activeKey` 仍由 `expandedRuns` state 控制以維持通知 deep-link 自動展開，原本自製的 `toggleExpand` 已刪；左側排程清單→`List` + `Card`（hoverable，選取/待確認邊框以 style 帶）；待確認紅點→`Badge`；「拒絕」加上 `Popconfirm`（不可逆決策，比照 Phase 3 的 window.confirm 改造）；編輯/停用/新增/我來處理/確認執行/延伸討論→`Button`（停用為 danger）；空狀態→`Empty`。決策者列抽成 `SchActorLine` 共用，`SchStepIcon`/`SchAvatar` 內未使用的 `useTheme()` 已清（同 Phase 1–3 類型）。
> - **KPIPage.jsx（361 行）**：書籤清單→每組一個 `List`（維持分組資訊架構，選取態沿用左藍邊＋`C.hoverAccent`）；搜尋→`Input`（allowClear ＋ 前綴圖示 ＋ aria-label，placeholder 改為「報表名稱」不再代 label）；來源標籤（PBI/FDC/SPC/MES/自建）抽成 `KpiSrcTag`→`Tag`（**刻意保留原品牌色**而非 AntD preset）；KPI 摘要卡→`Card` + `Statistic`（value/suffix/valueStyle，異常紅字邏輯不變）；趨勢卡與異常摘要卡→`Card`，異常清單→`List` + `Badge`；Ask AI / 在原系統開啟→`Button`。**長條圖本體保留自製**（AntD 無圖表元件）。**嵌入報表的「他系統 chrome」（FDC/PBI 標題列 + 概覽/趨勢/明細 底線 tabs）刻意保留自製**：該區在模擬外部報表系統的 iframe 介面，若套本產品設計語言會看不出是他系統畫面；僅把硬編 `#F3F4F6` 改吃 `C.bgPanel` 讓 dark mode 不破版。
> - **KnowledgePage.jsx（126 行）**：膠囊 tabs→`Segmented`（含筆數 chip，選中主色以巢狀 ConfigProvider 侷限本頁，同 Phase 2/3）；三個分頁清單→`List` + `Card`；狀態/版本/標籤/分類/Q/A/來源 Skill→`Tag`；Skill 回饋提示→`Alert type="warning"`；貢獻知識/AI 問這份/查看/使用/追問/★→`Button`（★ 加 `Tooltip`）；空狀態→`Empty`。Prompt 原文區塊保留自製 monospace 區塊（guideline 要求）。
>   **⚠️ 驗收方式註記**：本頁**未掛 Nav、`src/` 內零引用**（`grep KnowledgePage` 僅本檔），但**有列在 `build.py` 的 JS_MODULES**（與 Phase 3 的 SOPManagementPage.jsx 死碼不同，它會進產物）。因無法從 UI 進入，本次以 scratchpad 臨時 harness（複製 build 產物 + 掛載 `<KnowledgePage p={PERSONAS.equipment}>` ＋ dark/字級切換鈕）完成 light/dark ＋ 字級三檔驗收，驗收後即刪除臨時檔，repo 未留痕。

> **Phase 5 ✅ 完成（2026-07-25）**：ChatPage + AppCenterPage 改 AntD，build 通過、light/dark ＋ 字級三檔瀏覽器實測。
>
> - **ChatPage.jsx（400 行）**：新對話→`Button block`；搜尋→`Input`（allowClear ＋ 前綴圖示，取代手刻 svg ＋ 清除鈕）；對話清單→`List` + `Button type="text"`（左對齊靠 `justifyContent: flex-start` ＋ 內層 span 做 ellipsis）；hover 動作→`Button type="text"` ＋ `Tooltip`，**刪除加 `Popconfirm`**（原本點了直接刪，無確認）；重命名→`Input`（`onPressEnter` 提交、Esc 取消）；Quick prompts→`Card hoverable`；Skill 引用 chip→`Tag` ＋ `Tooltip`；貢獻確認鈕→`Button`；**Context 徽章→`Alert type="info" closable`**（closable = 移除 context，展開/收合仍為自製 ▲▼ 切換 description）；輸入列→`Input variant="borderless"` ＋ `Button shape="circle"`（空字串時 disabled）；**Skill 抽屜→`Drawer`**（`getContainer={false}` + `rootStyle={{position:'absolute'}}`，比照 Phase 2；因本頁根容器是 flex row，Drawer 外再包一層 `position:absolute; inset:0` 的 div 並採條件渲染）。空狀態→`Empty`。**對話泡泡保留自製**（AntD v5 無 bubble 元件，左右不對稱圓角為本頁客製視覺），僅把硬編 `#F5F5F5`/`#222222` 改吃 `C` token。
> - **AppCenterPage.jsx（662 行）**：**功能目錄→`Dropdown` + `Tree`**（原本 152 行的自製三層樹＋Chevron svg＋點擊外部關閉 effect 全部刪除；L1 預設展開、L2 收合由 `expandedKeys` 承接，L3 選取後關閉面板）；分類篩選→`Segmented`（篩選型，沿用預設選中樣式，`CatChip` 元件刪除）；卡片/清單檢視切換→`Segmented`（icon options ＋ `Tooltip`，`ViewBtn` 刪除）；搜尋→`Input`（allowClear ＋ 前綴圖示）；卡片檢視→`Card hoverable`；**清單檢視→`Table`**（應用／說明／標籤／釘選／操作五欄，`AppListRow` 刪除，並補上欄位 header）；釘選鈕抽成 `PinBtn`→`Button type="text"` ＋ `Tooltip`；已釘選 tile→`Card hoverable`；系統代號與分類→`Tag`（`AppTags`）；分隔線→`Divider`；**釘選上限提示由 `alert()` 改 `antd.App.useApp().message.warning`**（原生 alert 不吃 dark mode／主題）。`StarIcon` 保留自製 svg（專案未載入 AntD icon UMD）。
>
> **本 Phase 的三處全域改動（影響所有已遷移頁，皆已回測 Phase 1–3 頁面無異常）**：
> 1. `shared.jsx` 的 `AppConfigProvider` 內把 children 包一層 **`antd.App component={false}`**（不產生任何 DOM 節點 → 零版面風險），讓任何已遷移頁可用 `antd.App.useApp()` 取得吃 theme token 的 `message`/`modal`/`notification`，取代原生 alert/confirm。
> 2. ConfigProvider 加 **`autoInsertSpaceInButton: false`**：AntD 預設會在「兩個中文字」按鈕插入空白（停用 → 停 用），與原文案排版不符，全域關閉（同時修正 Phase 1–3 已遷移頁的「取 消」「查 看」）。
> 3. `styles.css` 新增兩條 `.sch-timeline` 規則：AntD Timeline 末項預設保留 48px 空白，步驟清單不需要。
>
> **環境註記（同 Phase 3）**：本 headless 預覽瀏覽器的 CSS 動畫時鐘會凍結，導致 Segmented thumb、Modal/Popconfirm zoom、Drawer slide 停在第一幀（DOM 與 state 皆正確，實機不受影響）；本次驗收改以「程式化觸發 + 讀 DOM/state + 手動清除動畫 class 後截圖」交叉確認。另：預覽面板被隱藏時 `getBoundingClientRect()` 全回 0，量測需在面板可見時進行。
>
> **DoD 校準**：五頁皆同 Phase 1–3 的混合式——互動元件全 AntD，版面骨架（左欄標題、組標頭、工具列 label、頁首）仍用 `C`/`fz` 承接字級三檔與 guideline 配色，「該頁不再引用 C/fz」未 100% 達成，留待 Phase 8。

依「表單/表格密度高 → AntD 效益大」排序，客製視覺重的最後：

| Phase | 頁面 | 行數 | 理由 |
|-------|------|------|------|
| 1 ✅ | SettingPage + KpiWidgetSettingPage | 2,808 + 736 | 表單最密，效益最大（**已完成 2026-07-24**） |
| 2 ✅ | TaskManagementPage | 973 | Table + Drawer 經典場景（**已完成 2026-07-25**） |
| 3 ✅ | SkillManagementPage | 914 | 表格/表單重（**已完成 2026-07-25**；SOPManagementPage.jsx 560 行為死碼，未遷移，已於 Phase 8 刪除） |
| 4 ✅ | SchedulingPage + KPIPage + KnowledgePage | 502 + 361 + 126 | 中等（**已完成 2026-07-25**；KnowledgePage 未掛 Nav，以臨時 harness 驗收） |
| 5 ✅ | ChatPage + AppCenterPage | 400 + 662 | 中等（**已完成 2026-07-25**；含三處全域改動：antd.App、autoInsertSpaceInButton、.sch-timeline） |
| 6 | ~~HandoverPage~~ → **只剩 App.jsx（nav/header）** | ~~1,011~~ + 634 | **PO 決議 2026-07-25 廢除 HandoverPage**，該檔 **2026-07-25 已刪除**（含 App.jsx 路由/圖示/註解 nav 項與 build.py JS_MODULES）；見 [handover](../entities/modules/handover.md) |
| 7 | SectionPage（Home widgets） | 2,242 | 客製視覺最重、**最後動**（降低用戶測試干擾） |

## 每頁驗收準則（DoD）

- `python3 build.py` 通過；light/dark 兩模式無破版；字級三檔正常
- 8px 間距系統、guideline 色彩不變；無 AntD 預設陰影/漸層洩漏
- 互動接線不斷：deep-link、settingJump、handoverRecord、Ask AI context 等 App.jsx 傳入的 props 行為與遷移前一致
- 該頁不再引用 `C`/`fz`

## Phase 8 — 收尾

- ~~清 `personas.js.bak`（43KB 遺留備份）、**刪死檔 `SOPManagementPage.jsx`（560 行）**~~ ✅ **已完成（2026-07-25，PO 核准）**：兩檔皆已刪除；刪除前確認 `SOPManagementPage.jsx` 不在 `build.py` 的 `JS_MODULES`、`src/` 內零引用（`SettingPage.jsx:886` 呼叫的 `SOPManagementPage` 解析到 `SkillManagementPage.jsx:671` 的同名函式），`build.py` 載入的是 `personas.js` 而非 `.bak`。刪除後重新 build，產物 **byte-for-byte 相同**（669,088 bytes / 20 模組）。
- 移除 Tailwind CDN（先把 42 處 className 換掉）、清 styles.css 死碼（Phase 5 後 `@keyframes slideInRight` 是否還有人用需一併確認）
- **補遷 SettingPage 殘留原生對話框**（PO 驗收 2026-07-25 發現）：1 處 `alert`（HomeLayoutTab 自訂 Widget 上限）＋ 5 處 `window.confirm`（刪列/刪 Widget/AppManagementTab 刪功能×3）→ 改 `Popconfirm` / `antd.App` message，比照 Phase 3/5 模式（原生對話框不吃 dark mode/theme；Phase 1 完成於該模式確立前，未回頭補）
- **待 PO 決定：`KnowledgePage.jsx` 的去向** — 已遷移 AntD、且在 `build.py` 的 JS_MODULES 內（會進產物約 9KB），但未掛 Nav、`src/` 內零引用，使用者進不去。兩條路：掛上 Nav（見 [knowledge-base](../entities/modules/knowledge-base.md) 的 7/31 目標）或先移出 JS_MODULES 減肥
- **CLAUDE.md UI guideline 改寫為 AntD token 版**（CLAUDE.md 變更需 PO 核准後才動）

## 風險與緩解

1. 首載變慢（antd.min.js ~1MB+ 疊加 Babel 即時編譯）— prototype 可接受，demo 前實測；離線/內網環境 CDN 疑慮照舊（見 [architecture](../entities/architecture.md)）
2. 用戶測試期間視覺變動 — 順序已把 Handover/Home 排最後；若測試排程確定，該兩頁凍結至測試結束
3. 正式化若走 Vite，UMD 接入方式需改 import——屬預期內小重工，不影響元件層代碼

## 與通知功能的順序

[通知中心](../entities/modules/notification.md)直接以 AntD 實作，**Phase 0 完成後即可動工**（不等全站遷移），兼作遷移試點。
