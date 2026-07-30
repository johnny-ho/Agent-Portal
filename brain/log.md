# Log — 操作時間軸（append-only）

> 格式：`## [YYYY-MM-DD] ingest|query|lint|decision | 標題`，可用 `grep "^## \[" log.md | tail -5` 取最近五筆。

## [2026-07-11] decision | 建立 AI 大腦（LLM Wiki 導入）

PO 決議依 Karpathy LLM Wiki 模式為本專案建立 `brain/` 知識庫，用途為產品管理與 PO×AI 協作。Schema 定於 [WIKI.md](WIKI.md)。

## [2026-07-11] ingest | PRODUCT_BASELINE.md v3.9

初次收錄。產出：overview、decisions、open-questions、personas、九個模組頁、三個 concept 頁、sources/product-baseline。

## [2026-07-11] ingest | scrum_teaming.md v1.0

初次收錄。產出：entities/teams、sources/scrum-teaming。標記 ⚠️ 草稿待 PO 確認、未反映 v3.8/v3.9（→ open-questions W-3）。

## [2026-07-11] ingest | backlog-access-permission-gate.md + skill 覆盤

初次收錄。產出：sources 兩頁；發現入口 Gate 與 Setting 權限管理未整合（→ open-questions W-1）；三條開票方法論記入 decisions。

## [2026-07-11] query | 系統架構缺頁 → 建立 architecture 頁

PO 指出 wiki 缺系統架構頁（coverage gap）。讀取 build.py / shell.html / App.jsx 確認事實後新增 [entities/architecture.md](entities/architecture.md)（build pipeline mermaid 圖、技術棧、三點 PM 觀察：bundler 遷移時點、.bak 遺留檔、CDN 與廠內環境矛盾）。index 已更新。

## [2026-07-11] query | 產品樣貌不清 → 建立 sitemap 頁

PO 反映看不清產品樣貌（缺 sitemap 與模組互動視圖）。新增 [entities/sitemap.md](entities/sitemap.md)：mermaid sitemap、四層堆疊模型（Shell→Page→Zone→Widget→Data）、三股互動流（Seed 配置 / Ask AI 匯流 / 任務交班寫入）。index 已更新。

## [2026-07-11] lint | 初始健檢

建庫後首次 lint：連結完整性、index 一致性、frontmatter 檢查。結果見當日回報。

## [2026-07-24] query | 設計理念產品評審（用戶測試前）

PO 請 AI 評審設計理念並給產品建議（prototype 用戶測試視角，不談架構）。產出七點建議回填至 [concepts/product-review-2026-07.md](concepts/product-review-2026-07.md)：楔子外露測試、主動性階梯、埋錯卡片測信任、課長負面清單、優先級通膨、Home 第一眼、OKR 重框。受影響頁面：index.md（新增條目）。三項待 PO 裁決列於該頁末。

## [2026-07-24] decision | AntD 全面遷移 + Notification v1 定案

PO 確認兩項大改動計畫：(1) AntD 全面遷移（8 Phase、維持現有 build pipeline），寫入 [concepts/antd-migration-plan.md](concepts/antd-migration-plan.md)；(2) Notification v1（三類通知、AR=被指派人、Teams 僅設定 UI、歷史 7 天），寫入 [entities/modules/notification.md](entities/modules/notification.md)。受影響頁面：decisions.md（+2 決議）、open-questions.md（+W-5 Teams 整合）、index.md。執行交棒：其他 agent 依上述兩頁動工，通知中心於遷移 Phase 0 後即可實作。

## [2026-07-24] decision | AntD Phase 0 + Notification v1 實作完成

執行遷移計畫：**Phase 0 完成**（shell.html 加 dayjs@1.11.13 + antd@5.22.5 UMD、shared.jsx 新增 AppConfigProvider 橋接 ThemeContext→ConfigProvider token、App.jsx 包 AppConfigProvider）。**通知中心 v1 完成**（新增 notifications.js + NotificationCenter.jsx；App.jsx 提升 per-persona 通知/偏好狀態、header 鈴鐺、deep-link；SettingPage 通知矩陣；SchedulingPage 接 expandRunReq；Nav 紅點收編為未讀 N2 單一真相）。瀏覽器實測三 deep-link 與 light/dark 皆通過。受影響 wiki 頁：antd-migration-plan.md、notification.md、index.md。下一步：Phase 1（SettingPage + KpiWidgetSettingPage 遷移）。

## [2026-07-24] decision | Phase 1 起步：PersonalSettingTab 控件遷移

Phase 1 開工。SettingPage 的 PersonalSettingTab 互動控件已改 AntD：深色模式→Switch（可正常 toggle 全站深色）、介面語言→Select、字型大小→Segmented（膠囊式）。build 通過、light/dark 實測正常。**Phase 1 尚未完成**：SettingPage 其餘 Seed 管理分頁（表格/表單/function tree）與 KpiWidgetSettingPage（736 行）待續，DoD「不再引用 C/fz」未達。詳見 [antd-migration-plan.md](concepts/antd-migration-plan.md) Phase 1 進度註。

## [2026-07-24] decision | AntD Phase 1 完成：SettingPage + KpiWidgetSettingPage

Phase 1 收尾。**KpiWidgetSettingPage.jsx（736 行）**：toggle→Switch、系統膠囊＋方向鈕→Segmented、門檻框→InputNumber、存檔→Button、hover 手刻彈窗→Tooltip、Dashboard wrapper→Modal；並修好原檔硬編淺色（#F0F7FF/#F8FAFF/#111827）造成的 dark mode 破版、清掉違反 hooks 規則的 `useTheme()` 呼叫。**SettingPage 其餘分頁**：PermissionsTab/Bulletin/Application 的清單→Table、KpiReport 的 modal→Modal＋Input/Segmented/Select/Switch、AppManagement 的 function tree 表單控件→Select/Input/Switch/Button、HomeLayout 的 Widget Picker→Modal（getContainer=false）＋各按鈕→Button。全域刪除自製 `Toggle` 與 `kpiRptBtnStyle/kpiRptIconBtnStyle` 死碼。build 通過；瀏覽器逐頁 light/dark 驗收（僅 AppManagementTab 因 isITUser gating 以 Seed persona 無法開頁，build 通過＋沿用他頁已驗證 primitives）。**DoD 校準**：採混合式遷移（AntD 控件 + C/fz 版面骨架），與 PersonalSettingTab 同套路，「不再引用 C/fz」刻意未全達，留待 Phase 8。受影響 wiki 頁：antd-migration-plan.md（Phase 1 標 ✅＋逐頁對應）、index.md。下一步：Phase 2（TaskManagementPage：Table + Drawer）。

## [2026-07-25] decision | AntD Phase 2 完成：TaskManagementPage

**TaskManagementPage.jsx（973 行）全頁遷移**。列表：手刻的 `TaskListRow`/`SubTaskRow` 整組刪除，改 `Table` tree data（`subTasks → children`），展開用 AntD 原生 expand icon；維持成員/日期分組（每組一張 `showHeader={false}` 的 Table ＋ 組標頭，欄寬以 `TM_COL_W` 常數與 sticky 欄位 header 共用對齊）。詳情：`Drawer`（`getContainer={false}` + `mask={false}`）＋ `Descriptions`/`List`/`Alert`。Tabs：`Segmented`，選中主色以**巢狀 ConfigProvider** 侷限本頁，不動 Phase 1 已驗收的篩選型 Segmented。狀態圓點：`Badge` ＋ 全域 `Badge: { dotSize: 10 }` token（符合 guideline 10×10）。派工面板：`Input`/`Select`/`DatePicker`（用 Phase 0 的 dayjs），並補欄位 label 修正 placeholder 代 label 的違規。順帶清掉 `fmtDate`/`groupByDate` 內違反 hooks 規則的 `useTheme()`、把列表硬編淺色改吃 `C` token（dark mode 不再破版）。`styles.css` 新增 `.tm-row-selected` 三條規則補 AntD Table 缺的單選列高亮。瀏覽器實測：展開子任務、開/關 Drawer、派工新增任務、歷史分頁、通知 deep-link（T-003）、light/dark、字級三檔皆通過。**DoD 校準**：同 Phase 1 混合式，版面骨架仍留 `C`/`fz`，留待 Phase 8。受影響 wiki 頁：antd-migration-plan.md、entities/modules/task-management.md、index.md。下一步：Phase 3（SkillManagementPage + SOPManagementPage）。

## [2026-07-25] decision | AntD Phase 3 完成：SkillManagementPage（＋發現 SOPManagementPage.jsx 死碼）

**SkillManagementPage.jsx（914 行）全頁遷移**。清單：手刻 `SkillCard` 卡片列整組刪除，改五欄 `Table`（狀態／名稱＋描述／引入者／引入日期／操作，欄寬 `SK_COL_W`），點列開詳情、操作欄以 `stopPropagation` 隔離、空狀態→`Empty`。階段篩選膠囊→`Segmented`（巢狀 ConfigProvider 侷限主色，同 Phase 2）。詳情彈窗→`Modal`（1000/centered/雙欄 64vh，footer 自訂「刪除 ─ 編輯／推進」）；內部 chunk→`Card`、**執行步驟→`Timeline`**（自訂數字 dot，連接線交給 AntD）、測試記錄與簽核狀態→`List` ＋ `Tag`、Production 生效資訊→`Descriptions`、注意事項→`Alert`、可編輯標籤→`Tag closable` ＋ `Space.Compact`。刪除確認由 `window.confirm` 改 `Popconfirm`（原生視窗不吃主題）。引入彈窗→`Modal` + `Form`（真 label）；工具列搜尋→`Input`、排序→`Select`，補 inline label 修正 placeholder 代 label 的 guideline 違規。順帶移除五個純函式內違反 hooks 規則的 `useTheme()`，硬編淺色改吃 `C` token（dark mode 不再破版）。瀏覽器實測：開/關詳情、編輯模式、Popconfirm 刪除、引入彈窗、階段篩選、light/dark、字級三檔皆通過；console 無新錯誤。

**盤點修正**：Phase 3 原列的 `SOPManagementPage.jsx`（560 行）**是死碼**——不在 `build.py` 的 JS_MODULES、不進 build 產物；線上 Skill 管理頁由 SkillManagementPage.jsx 提供（主元件仍名為 `SOPManagementPage` 以相容 SettingPage）。故未遷移該死檔，改列入 Phase 8 待 PO 確認刪除。受影響 wiki 頁：antd-migration-plan.md（Phase 3 標 ✅＋盤點修正＋Phase 8 補一項）、index.md。下一步：Phase 4（SchedulingPage + KPIPage + KnowledgePage）。

## [2026-07-25] decision | Phase 8 部分收尾：刪除兩個死檔（PO 核准）

PO 核准後刪除 **`Agent portal/src/components/SOPManagementPage.jsx`（560 行 / 30KB）** 與 **`Agent portal/src/data/personas.js.bak`（43KB）**。

刪除前驗證：`SOPManagementPage.jsx` 不在 `build.py` 的 `JS_MODULES` 清單（該清單第 36 行只有 `SkillManagementPage.jsx`），`src/` 內對它零引用——`SettingPage.jsx:886` 呼叫的 `SOPManagementPage` 解析到 `SkillManagementPage.jsx:671` 定義的同名函式（向後相容用）；`build.py:23` 載入的是 `personas.js`，`.bak` 僅被 wiki 文件提及。刪除後執行 `python3 build.py`，產物 `index.html` 與刪除前 **byte-for-byte 相同**（669,088 bytes / 20 個 JS/JSX 模組），行為不變。

受影響 wiki 頁：[antd-migration-plan.md](concepts/antd-migration-plan.md)（Phase 8 該項標 ✅、Phase 3 盤點修正註記結案、頁面順序表註腳更新）、[entities/architecture.md](entities/architecture.md)（觀察 2 標記已清理）、index.md。Phase 8 剩餘：移除 Tailwind CDN、清 styles.css 死碼、CLAUDE.md guideline 改 AntD token 版。下一步仍為 Phase 4（SchedulingPage + KPIPage + KnowledgePage）。

## [2026-07-25] decision | AntD Phase 4 + 5 完成：Scheduling / KPI / Knowledge / Chat / AppCenter

一次做完兩個 Phase（PO 指定），五頁遷移 + 三處全域改動，build 通過（654,698 bytes / 20 模組），瀏覽器 light/dark ＋ 字級三檔實測。

**Phase 4**：`SchedulingPage.jsx` 介入橫幅→`Alert`、步驟→`Timeline`（自訂狀態 dot，手刻 `SchStepRow` 退場）、執行紀錄→`Collapse`（`activeKey` 仍由頁面 state 控制以保通知 deep-link）、左清單→`List`+`Card`、拒絕加 `Popconfirm`；`KPIPage.jsx` 書籤→`List`、搜尋→`Input`、摘要卡→`Card`+`Statistic`、異常摘要→`List`+`Badge`，長條圖與「他系統 chrome」刻意保留自製；`KnowledgePage.jsx` tabs→`Segmented`、三分頁→`List`+`Card`、回饋→`Alert`。

**Phase 5**：`ChatPage.jsx` 對話清單→`List`（刪除加 `Popconfirm`）、Quick prompts→`Card`、Context 徽章→`Alert closable`、輸入列→`Input variant=borderless`+`Button circle`、Skill 抽屜→`Drawer`；`AppCenterPage.jsx` **Function Tree→`Dropdown`+`Tree`**（152 行自製三層樹＋外部點擊 effect 全刪）、分類/檢視切換→`Segmented`、清單檢視→`Table`、卡片與 tile→`Card`、釘選上限提示由 `alert()` 改 `message.warning`。

**三處全域改動**（已回測 Phase 1–3 頁面無異常）：`shared.jsx` 的 `AppConfigProvider` 內加 `antd.App component={false}`（零 DOM，供各頁取用吃主題的 message/modal）；ConfigProvider 加 `autoInsertSpaceInButton: false`（修掉「停 用」「取 消」的插入空白）；`styles.css` 加兩條 `.sch-timeline` 規則（Timeline 末項不留 48px 空白）。

**發現**：`KnowledgePage.jsx` 未掛 Nav、`src/` 內零引用，但**有列在 build.py 的 JS_MODULES**（會進產物，與 Phase 3 的 SOPManagementPage.jsx 死碼不同）。UI 進不去，故以 scratchpad 臨時 harness 掛載元件完成驗收後刪除臨時檔；去向（掛 Nav / 移出 build）列入 Phase 8 待 PO 決定。

驗收過程中修掉兩個自身問題：ChatPage 對話清單用 `Button type="text"` 導致文字居中（改 `justifyContent: flex-start` ＋ 內層 span ellipsis）、Drawer 在 flex row 容器內的定位（外包 `position:absolute` 容器 ＋ 條件渲染）。環境註記：headless 預覽的 CSS 動畫凍結（Segmented thumb／Modal／Popconfirm／Drawer 停第一幀）、面板隱藏時 `getBoundingClientRect()` 全回 0，驗收需交叉用 DOM/state 與截圖確認。

受影響 wiki 頁：[antd-migration-plan.md](concepts/antd-migration-plan.md)（Phase 4/5 標 ✅＋逐頁對應＋全域改動＋Phase 8 補 KnowledgePage 去向）、[entities/modules/scheduling.md](entities/modules/scheduling.md)、[kpi-center.md](entities/modules/kpi-center.md)、[ai-chat.md](entities/modules/ai-chat.md)、[app-center.md](entities/modules/app-center.md)、[knowledge-base.md](entities/modules/knowledge-base.md)、[entities/architecture.md](entities/architecture.md)（AntD 橋接層）、index.md。下一步：Phase 6（HandoverPage + App.jsx nav/header）——注意計畫風險 2：交班為用戶測試主場景，若測試排程確定該頁應凍結。

## [2026-07-25] query | Phase 0–5 驗收（PO 指派）

對照計畫逐項驗證：檔案結構/CDN 釘版/ConfigProvider token/JS_MODULES 順序/死檔刪除 ✅；build 通過（20 模組、655,248 bytes）；瀏覽器實測通知 deep-link（N2→Scheduling 展開、badge 遞減、nav 紅點收編）、Setting 通知矩陣預設值、dark mode Task 頁皆正常；Phase 6/7 頁面確認未動。發現缺口：SettingPage 殘留 1 alert + 5 window.confirm（已記入計畫 Phase 8）。結論：Phase 0–5 符合預期，可放行 Phase 6。受影響頁面：antd-migration-plan.md（Phase 8 +1 項）。

## [2026-07-25] decision | Agent Skill 三層模型 + Tool Gateway 授權機制

PO×AI 討論 codify graph 涵蓋率不足、需補 skill.md 彈性路徑。結論寫入 [concepts/agent-skill-tiering.md](concepts/agent-skill-tiering.md)：(1) 切分軸為**副作用範圍**而非「是否用 LLM」，分知識型／引導型（唯讀工具，新增）／執行型三層，簽核強度 ∝ blast radius；(2) 隔離**不用 sub agent**，做在 Tool Gateway（進場 allowlist + 出場檢查），三層差別濃縮成 `run.allowlist = skill.tools` 一行；(3) `sopManagement[]` 加 `tier`／`tools`／結構化 `scope`（取代自由文字 `scenario`／`productionScope`，PO 決議現在改）；(4) 簽核由 dry run 改**評測集**，PO 決議由課上 Seed 出題、LLM 輔助、驗證與簽核強制，負面案例由系統從 scope 自動生成；(5) 六條風險與體驗設計六原則（含「回收飛輪」：引導型成功後回填 codify graph 草稿）。PO 確認本專案為**個人原型**，治理設計目標為「讓人看得見它擋住了」而非真防護。受影響頁面：index.md、open-questions.md（SCH-OQ-2 標記已有解方）。

## [2026-07-25] decision | Skill 三層模型定案 + SOP 對話式建立 + 交班中心廢除

PO 補充實際開發中的 SOP 流程（對話式生成 → 試跑 → promote → dry run → 簽核 → 可被 agent 調用或設排程；執行時零 LLM，主場景是資料彙整如當班交接報告），並裁決三項：(1) **HandoverPage 廢除**，交班降級為一個 SOP 的排程產出——Schedule 內檢視（檔案櫃）＋ Home 佈告欄觸達（今天這份），`ShiftHandoverModal` 改為預填後人補判斷；(2) **寫入行為一律強制人工確認**，故不需擔心 agent 生成的 code 偷藏寫入，**把關永遠在 runtime**（收回前一版「移到 authoring time」的說法）；(3) code node **自由式 + sub graph 混用**，成熟行為做成標準元件避免錯用與重複試錯 → 帶出白話說明的標準／自訂標記、簽核只聚焦自訂部分、以及第二個飛輪（自訂 node → 標準元件，對應 widget-governance 的平台引力模型）。詞彙定案為 **知識／輔助判斷／SOP**。

受影響頁面：`concepts/agent-skill-tiering.md`（大改重寫）、`entities/modules/handover.md`（改標 status: stale + 功能去向與刪除注意事項）、`concepts/antd-migration-plan.md`（Phase 6 縮為只剩 App.jsx）、`entities/modules/scheduling.md`（+ SOP 檔案櫃定位與排程暫停行為）、`entities/sitemap.md`（移除 Handover 節點、改寫第三股互動流）、`concepts/ecp-strategy.md`（切入點載體變更）、`open-questions.md`（W-2 解決）、`decisions.md`（+3 決議）、`index.md`。

## [2026-07-25] decision | 三層模型改造 Step 1：HandoverPage 刪除

依 [agent-skill-tiering](concepts/agent-skill-tiering.md) 開發第 1 步，刪 `HandoverPage.jsx`（1,011 行）＋ App.jsx 路由（`nav === 'handover'` header 區塊與頁面路由兩處）、`ICONS.handover`、NAV_BASE 已註解的 handover 項、build.py `JS_MODULES` 一列。build 通過：20 → 19 模組，655,248 → **592,297 bytes（−62,951，−9.6%）**。瀏覽器實測 Home / KPI / App / Task / AI / Schedule / Setting 全數正常渲染、零 runtime error（僅 Babel >500KB 的 deoptimise 提示）。`handoverRecord` / `onHandoverSubmit` / `showHandoverModal` 三者依交代保留未動。

**發現（已回填 [handover](entities/modules/handover.md)）**：`ShiftHandoverModal` 的預期入口「Home header 發起交班按鈕」其實**進不去**——按鈕所在的 `SectionHeader`（`SectionPage.jsx:403`）是死碼，`src/` 內零引用（Home 頂端 header 由 App.jsx 自繪），`setShowHandoverModal(true)` 全專案無人呼叫。此為 `main` 上既有狀態，非本次刪除造成。以強制開啟的 probe build 驗證，**Modal → `handoverRecord` → `BulletinWidget` 置頂公告這條線本身完好**。→ 第 6 步（Home 接線）順路補入口：入口改為佈告欄那則 SOP 產出公告上的「補充交代事項」，`SectionHeader` 死碼可一併清。

**環境註記**：本 session 的沙箱封鎖 unpkg / cdn.tailwindcss.com（CONNECT 403），產物直開會白畫面。瀏覽器實測改用 scratchpad harness：npm 裝同版 react/react-dom/dayjs/antd/@babel/standalone + @tailwindcss/browser，以 Playwright `page.route` 攔截 CDN 請求改餵本地檔（不動 `src/`、不動 shell.html）。

受影響頁面：[entities/modules/handover.md](entities/modules/handover.md)、[concepts/antd-migration-plan.md](concepts/antd-migration-plan.md)、index.md。

## [2026-07-25] decision | 三層模型改造 Step 2：資料層（personas.js）

`sopManagement[]` 依 [agent-skill-tiering](concepts/agent-skill-tiering.md)「資料模型變更」補齊：19 筆全數有 `tier`／`tools`／結構化 `scope`／`hasWrite`／`consumedBy`；SOP 型另有 `plainSteps`（standard/custom 標記）／`dryRun` 三層快照／`genChatId`。**自由文字 `scenario`／`productionScope`／`pirunScope` 全數移除**（原 3 筆），改由結構化 scope 取代。

新增 **`EQUIPMENT_MASTER`**（設備/站點主檔，equipment 16 台、process 8、mfg 6）與 **`matchScopeTargets(personaKey, scope)`**：適用範圍勾選畫面「目前符合 N 台」的計算來源，也是「這個 skill 根本不會進候選池」那段 demo 的資料基礎。

新增 4 筆 mock：`sm-eq-006` ERR-4421 冷卻異常研判（輔助判斷，3 唯讀工具）、`sm-pr-006` CP 值下滑趨勢研判（輔助判斷，跨 persona 證明不限設備課）、`sm-eq-007` 整理當班交接報告（SOP 唯讀、`consumedBy.scheduleId: 'sch-eq-004'`）、`sm-eq-008` SPC 異常日報與開單（SOP 含寫入、綁既有 `sch-eq-001`，供第 5 步「含 N 個需確認步驟」demo）。

**兩個 doc 未定義、實作時補上的欄位**：`evalCases[]`（測試題，`origin: seed|system` + `locked`，系統出的負面題不可刪）與 `traceSample`（一次互動的逐步紀錄，含被拒絕的寫入工具那一行）——原型定位是「讓人看得見治理在運作」，這兩者是唯一能把它顯示出來的資料。

⚠️ **暫時的前向參照**：`sm-eq-007.consumedBy.scheduleId = 'sch-eq-004'` 指向的排程於第 5 步才會加進 `scheduling.js`。

同步改 `SkillManagementPage.jsx` 兩處渲染（左欄適用範圍改結構化條件 + 目前符合 N 台、生效資訊列出符合機台），避免資料改了畫面空白。build 617,475 bytes，瀏覽器實測 Skill 管理清單 8 筆、詳情 Modal 正常、零 error。

## [2026-07-25] decision | 三層模型改造 Step 3–7 完成（原型全線接通）

依 [agent-skill-tiering](concepts/agent-skill-tiering.md) 做完剩下五步，各自獨立 commit、各自 build + 瀏覽器實測：

**Step 3 知識管理頁**：`shared.jsx` 立全站共用的 `SKILL_TIER_CFG`／`SkillTierTag`（每個類型帶一句白話與「能不能排程」）；清單加類型欄與類型膠囊篩選；詳情 Modal 依類型分岔——SOP 走白話步驟（標準元件 vs 本次自訂）＋ dry run 三層，輔助判斷走測試題（系統負面題標 🔒）＋ 處理紀錄（含「已拒絕」那一行），三種類型共用「會碰到哪些系統」區（輔助判斷的寫入區看得到但鎖住並寫明改建 SOP 的替代路徑）。

**Step 4 對話式建立**（`SkillCreateFlow.jsx` 新檔，主要工作量）：講需求 → agent 推薦類型（可改選）→ 適用範圍勾選（底部即時「目前符合 N 台」，實測 16 → 4 → 3 → 1 連動）→ 白話說明＋工具授權（寫入開關會跳出確認講明三項代價）→ 試跑／試問 → promote 成 Draft。

**Step 5 Schedule**：執行紀錄展開先看到「本次產出」（沿用 Skill 頁的產出渲染，兩邊長一樣）再看步驟；新增排程只選得到 Production 的 SOP，其餘列出但鎖住並寫明原因；含寫入者標「本 SOP 含 N 個需確認步驟」。

**Step 6 Home 接線**：SOP 產出 → 佈告欄置頂（標「SOP 產出」）→ 該則公告上的「補充交代事項並送出交班」開啟 ShiftHandoverModal（**順手補上 Step 1 發現的入口缺口**）→ Modal 以產出預填、標籤改「SOP 已算好 · 可編輯」→ 人送出後交班記錄取代那則自動公告。死碼 `SectionHeader` 一併刪除。

**Step 7 Chat**：三態徽章（依核准流程／AI 依指引研判／一般回答）每則 AI 回答都有；研判類附責任聲明與查過的數據，含被拒絕的寫入請求。

**三個超出原文件的實作決定**（已回填 concept 頁）：送簽硬條件寫成擋得住的 disabled + 原因、建立流程的範圍那一關零可打字欄位、新增排程沿用「鎖住不隱藏」。

**修掉一個 main 上既有的 bug**：`renderHomeWidget()` 被當一般函式呼叫卻內含 `useTheme()`，導致該 hook 併入 `DashboardPage` 的序列，persona 切換使 widget 數量改變時噴 React「change in the order of Hooks」warning。已用 worktree 對照 `aa78f5f` 確認為既有問題（非本次造成），該 `useTheme` 未被使用，直接移除。修掉後四 persona × 七頁全走完零 error。

**尚未實作**（列在 concept 頁末）：SOP 卡片「不適用」一鍵轉輔助判斷、飛輪 1 的「要不要變成 SOP？」提示、標準元件版本升級通知、trace 匯出帶進交班或任務。

受影響 wiki 頁：[concepts/agent-skill-tiering.md](concepts/agent-skill-tiering.md)（＋實作補上的欄位、實作狀態、三個實作決定、未實作清單）、[entities/modules/scheduling.md](entities/modules/scheduling.md)、[entities/modules/ai-chat.md](entities/modules/ai-chat.md)、[entities/modules/home-dashboard.md](entities/modules/home-dashboard.md)、[entities/modules/knowledge-base.md](entities/modules/knowledge-base.md)、[entities/architecture.md](entities/architecture.md)、index.md。

## [2026-07-26] decision | 知識拆出獨立、Skill 詳情改全頁、Chat 五情境改版

PO 在 session 開頭提出五點修正，逐項討論確認後一次做完。三個需要 PO 拍板的分岔都先問過（知識落點／詳情形態／情境呈現），PO 皆選推薦方案。

**決議 1｜知識從 Skill 管理拆出**（推翻 [agent-skill-tiering](concepts/agent-skill-tiering.md)「三種類型放同一管理頁」的前半）。PO 的理由：知識在輔助／SOP 執行的前後都會被引用，是底料不是平行路線。落點 = Setting 新 tab「知識管理」（不進 Nav，Section 管理七→八 tabs）。新增 `data/knowledge.js`（4 狀態，不需 Pilot Run），`personas.js` 移除 11 筆 `tier: 'knowledge'`，`SKILL_TIERS` 縮為 `['guided','sop']`，「從 KM 引入」隨知識搬過去。Skill 加 `knowledgeRefs[]`、知識文件加 `usedBy[]` 互相顯示。**飛輪 1 不受影響**——它的兩端是輔助判斷↔SOP，仍在同一份清單。Vector/RAG/知識圖譜依 PO 指示「註記方向就好」，做成頁面上一張可展開說明卡。

**決議 2｜Skill 詳情從 1000px Modal 改全頁**（`SkillDetailPage.jsx` 新檔）。清單降為純進入點、列上只剩刪除。版面依 PO 指定：Title / Scope / Description / Graph（僅 SOP）/ Test case & Dry-run，右上 Ask AI 與 Signoff。**刻意拿掉兩個舊區塊但資訊不流失**：「會碰到哪些系統」收進 Graph 節點標記與 Scope 下一行可展開摘要；「最近一次處理紀錄」併入測試區（它真正的活體展示是 Chat 情境 3）。Signoff 一顆按鈕取代原本散在清單與 Modal 的多顆階段推進鈕，按 stage 變臉；送簽硬條件統一為「兩種類型都要測試案例全過」，SOP 另加 dry run 第二層展開過。

**決議 3｜Graph**（原本完全不存在，SOP 只有直條 Timeline）。以「距 start 最長路徑」分層；`graph.edges` 支援條件分支（sm-eq-004 的 Level-2/Level-3、sm-eq-008 的有/無 OOC）與平行取數（sm-eq-007 三路取數匯流）。實作時修了兩個渲染問題：跨層的邊要在每段連接條畫通過線，否則節點看起來斷掉；同源多邊要把終點岔開，否則兩條線與兩個標籤疊成一條。

**決議 4｜Ask AI 是修 Skill 的 agent 不是聊天框**。硬邊界「只能改當前這一份」寫在面板開頭，並內建一題讓它把邊界講一次。關鍵是**修改回寫到主欄對應區塊**（`−/＋` diff 橫幅 + 採用／捨棄），未處理前不能問下一題——不這樣做它就只是又一個聊天框。

**決議 5｜Chat 版面 + 五情境**（`data/chatScenarios.js` 新檔）。版面：砍頭像、AI 回應無氣泡無框全寬純文字、user 改淡底、間距 16→32、三態徽章降級成一行細字 meta（徽章不能省的論證不變，改的只是視覺重量）。五情境為腳本播放，標題直接就是目標，user 發言以「建議接話」按鈕推進；情境 1／2 的人工介入用由下而上的面板（不是 Modal）；情境 2／5 用行動按鈕收斂成追蹤任務。equipment 五個完整，process／mfg 各兩個。

**驗證**：build 850,155 bytes，瀏覽器實測 equipment 五情境全部走完（含 sheet 選項、失敗分支、建任務）、Skill 清單／詳情／Graph 分支／Ask AI diff 回寫、知識管理清單、Scheduling 新增排程仍只選得到 Production SOP，三 persona 切換無誤，console 零 React error（僅既有的 Babel 500KB note）。

受影響 wiki 頁：[concepts/agent-skill-tiering.md](concepts/agent-skill-tiering.md)（＋「2026-07-26 改版」整段、原「三種類型放同一管理頁」標記為部分推翻）、[entities/modules/knowledge-base.md](entities/modules/knowledge-base.md)（改寫）、[entities/modules/ai-chat.md](entities/modules/ai-chat.md)、[entities/modules/setting.md](entities/modules/setting.md)、[decisions.md](decisions.md)、index.md。

## [2026-07-26] decision | Chat 互動模態收斂成兩種 + 右側執行面板

PO 拿 Claude 的 `AskUserQuestion`（聚焦、有 Skip 與 Type something else）與 Cowork 右側 Progress 面板當對照，提出兩件事，接著逐點確認現有 UI 的意義後一次做完。

**起點的兩個判斷**。決策彈窗「非常寬、有過多留白」，而且只有兩個選項——使用者若有其他意圖不知道從哪下達。右側需要讓值班的人隨時知道 agent 的計畫／完成／正在做／結束了什麼：SOP 可能跑 5–10 分鐘，「不想做帶有不確定性的等待，更不想等到結果才發現與想像中的不同」。

**關鍵發現：我們的計畫不是 AI 生的**。`personas.js` 每份 SOP 早已有 `plainSteps`（含 `io`、`needsConfirm`、`tool`），所以右側面板在執行前就能攤開「總共幾步、哪幾步會動到系統」。Cowork 的 progress 是 agent 自己規劃、跑到一半會變；我們的是核准過的、不會變。這直接回答 PO 的不確定性問題——**不確定性要在開始前消掉，不是在過程中安撫**。`chatScenarios.js` 因此不必寫第二份計畫，狀態用已揭露的 `run.steps.num` 對 `plainSteps` 推導即可；條件分支的名字從 `sop.graph.edges` 的 label 反查（sm-eq-004 的 `{from:2,to:5,label:'Level-2'}`）。

**PO 逐點指出的「這是給誰看的」**。工具識別碼、`計算/會異動` tag、步驟明細被判定為規劃期產物、「很容易在 demo 時候讓人誤會」。我修正了其中一半：identifier 純屬 artifact 該砍，但 `會異動` 與明細不是——它們在**流裡**是噪音（事情做完才說「這步會異動」沒有用），在**面板裡標在還沒跑到的步驟上**才是整個面板存在的理由。PO 同意搬家而非全砍。情境 3 的「這次的工具呼叫紀錄」PO 直言看不懂——它其實是 Tool Gateway 的活體展示（**AI 真的去試了、被擋下來，不是它自己客氣**），但用了「允許清單」這種給 Seed 看的治理語言，降成一行 `🚫 已嘗試變更 SPC 管制界限，被系統擋下`。我另外主動砍掉情境 3 上半的「查了這些現場數據」——證據已經寫在 AI 的文字裡（「依據有三…」），步驟表是同一件事講第二遍；資料改名 `evidence` 只餵面板。

**互動模態四種收斂成兩種**。清點發現當時有四種（HITL 面板／行動按鈕不用-好／建議接話／舊資料的確認提交-略過，最後一個藏在 `MessageList` 裡 PO 截圖沒拍到）。PO 定調「核心兩種：對話式 or 統一的彈窗」。建任務**不能**塞進決策卡——它是非阻塞的附加動作，混進去會稀釋決策卡的份量。三處 `action` 改寫成 user turn，走既有的建議接話，零新元件。

**決策卡**改成對話流裡的卡片而非浮起的彈窗（PO 原話是「統一的彈窗」，此處明確確認過差異）：拿掉遮罩——上面那些已完成步驟與數據正是做決定要看的東西。加數字鍵 1/2/3、「我有其他指示…」（收合成 chip＋游標進輸入框）、「稍後再決定」（收合成 chip）。時限倒數 PO 指示先不做。

**兩個 PO 決定**：逐步播放（不然「正在做什麼」只存在一瞬間，面板就沒意義）；面板預設關、SOP 執行時自動開、可 toggle、關過之後同一則對話不再自動開。

**驗證**：build 868,748 bytes。瀏覽器實測 equipment 情境 1（4/4 走完、產出區出現工單與入口）、情境 2（分支步驟 3/4 正確標「本次不走（Level-2）」）、情境 3（無證據步驟表、一行擋下註記、兩顆按鈕無 URL、面板列出三筆查過的數據與被擋請求）、情境 5（改成建議接話建任務）；數字鍵 3 → chip + input focus、自由輸入誠實回覆、Enter 送出（改用 `onKeyDown` 自處理，支援 Shift+Enter 換行）。console 零 React error。開發中修掉一處自己造成的重複：`collectUsed` 原本連 `run.steps` 一起收，導致面板「這次用到的」把「執行計畫」整份再列一次。

受影響 wiki 頁：[entities/modules/ai-chat.md](entities/modules/ai-chat.md)（＋「第二輪」整段、原 HitlSheet／行動按鈕敘述已被取代）、index.md。

## [2026-07-26] decision | 決策留痕、多任務執行面板、三態徽章從 UI 移除

PO 對第二輪的成果提出四組修正。三處我提出反對意見並改了他的判斷，PO 三處都同意。

**決策卡留痕**。原本選完卡片就消失，只看得到 AI 接著做事，回顧不到當時做了什麼決定。改成原位置留下 `✓ 已選擇：確認開立工單`，再接 AI 的執行結果。

**操作按鈕只留在最後一則**。PO 的顧慮是歧義：「使用者已經往下執行新的動作後，前面的按鈕還保留著——這時可以按嗎？按了會從哪裡執行？該帶著按鈕之後的 context 嗎？」我同意但**反對單純刪除**：「開啟 Case 單」是這次執行的產出入口，刪掉工單就再也找不到。解法接上 PO 自己在面板那節寫的「上面執行的任務的產出一律放在產出區」——對話流只在最後一則顯示，往下走就永久落在右側產出區。歧義消失、入口不流失。

**面板改兩層、支援多任務**。原本 `buildRunPlan` 只找最後一個 SOP，同一則對話跑兩份會被蓋掉。改成 `buildRunSegments`，以 `skill.id` 變化切段。因為當時沒有任何情境跑兩份 SOP，另外在情境 1 尾巴補了 `sm-eq-007`（整理當班交接報告，純唯讀不會停）——它跟任務 1 正好對比出「停過一次要人確認 vs 一路跑完」。面板同時砍掉四顆 io tag、工具識別碼、SOP 適用範圍攤開與步驟明細；**明細只留失敗原因與分支未走的說明**（我提的第三處反對：全砍會讓「執行了什麼」退化成「跑到第幾步」，PO 同意）。「這次用到的」只給標題 + `›`，點開 `SkillPeekModal`。

**「需人工確認」的兩種時態**。PO 嫌原本的「會停下來等你確認」太口語，指定改「等待確認中..」。但那句話同時用在兩種狀態上，時態不同不能共用：已經停在那裡的用 `等待確認中…`（＋去決定按鈕），還沒跑到但跑到會停的用 `需人工確認`。

**三態徽章從 UI 移除 ⚠️ 這是本次唯一有代價的決定**。PO 的論證「user 會預期『我能執行就表示系統中有核准的 SOP』」對 `依核准流程` 成立，但對另外兩態不成立——`AI 依指引研判` 與 `一般回答` 講的是相反的事（這不是核准流程、責任在你），那是免責告知不是多餘的確認。查過腳本後確認可以全砍：情境 3/4/5 的 AI 文字本來就都明說了。**但這等於把告知責任從 UI 轉移到模型的輸出規範**，真實 LLM 不保證每次都講，因此在 [ai-chat](entities/modules/ai-chat.md) 的 F-AI-01 加了一條驗收條件：非核准流程的回答必須在文字中聲明責任歸屬。[agent-skill-tiering](concepts/agent-skill-tiering.md) 的「兩種 user，兩種語言」論證本身沒有被推翻，只是換了承擔者。

**驗證**：build 873,250 bytes。情境 1 走完兩份 SOP —— 面板出現兩個任務（4/4 已完成、5/5 已完成）、決策 echo 在正確位置、任務 1 的「開啟 Case 單」從對話流收起但兩顆入口都在產出區；情境 2 的分支標「本次不走（Level-2）」、步驟 5「等待確認中…」＋去決定、失敗後三層分工正確（流裡 `✗ 失敗` / ResultCard 人話 / 面板 HTTP 400）、計時 5/6 · 00:07 正常走；情境 3 無 SOP 時面板只有產出與用到的；SkillPeekModal 正確顯示適用範圍與步驟（含「需人工確認」標記）。console 零 React error。

**環境備註**：這次瀏覽器自動化的合成滑鼠點擊在 preview pane 失效（ref 與座標都不觸發，但 `element.click()` 正常），驗證改用程式化點擊驅動。非產品問題。

受影響 wiki 頁：[entities/modules/ai-chat.md](entities/modules/ai-chat.md)（＋「第三輪」整段、舊的三態徽章章節改寫成「靠什麼守住」、F-AI-01 新增驗收條件）、index.md。

## [2026-07-26] fix | 產出區只收真實產物、產物改超連結、展開收合箭頭放大

第三輪面板上線後 PO 的三點回饋，都照做。

**產出區的定義收緊**。原本把失敗的結果卡也塞進「這次的產出」，畫面上出現 `✗ 工單未開立 —— 這份 SOP 的第 5 步已經失效`，PO：「產物應該是真實發生才有，如果沒有就不產生。」失敗的位置本來就有兩處（執行任務的步驟紅字、對話流的結果卡），放進產出清單只會讓人困惑。順帶修掉一個第三輪留下的蒐集邏輯錯誤：入口原本跨則扁平收集，害「手動開單／回報失效」這種「你自己去做」的入口混進產出；改成跟著它自己那則訊息的產物走，沒有成功產物的訊息其 links 不進產出區。

**產物改成超連結**。`✓ 工單 #CS-20260726-014 已開立` 本身可點、右側 `↗` 表示另開分頁，取代原本額外掛的一顆「開啟 Case 單」按鈕（PO：「開啟任務按鈕有點多餘」）。

**展開收合箭頭**原本 10px `▾/▸` 藏在標題左側，PO 完全沒發現那是可互動的。對齊 Cowork 的 `Progress ⌄`：區塊標題箭頭跟標題同字級、緊跟標題右側（標題從 11px 提到 13px）；任務列箭頭同字級、靠最右。

**驗證**：build 874,965 bytes。情境 1 兩個任務的產出各自成為帶 `↗` 的連結、無多餘按鈕；情境 2 產出只剩 `✓ 任務 #T-2026-0726-03 已建立`，失敗與「手動開單／回報失效」都不在產出區，但失敗仍在步驟 5 的紅字與對話流結果卡裡；三個區塊與任務列的箭頭皆清楚可見。console 零 React error。

受影響 wiki 頁：[entities/modules/ai-chat.md](entities/modules/ai-chat.md)（＋「第四輪」整段）。

## [2026-07-26] decision | Skill 管理四項：工具列收一行、Ask AI 全程在右側、測試要能跑、建立改表單

PO 拿四張截圖逐點指定。四點的共同性質：前一輪把「有 AI 在幫忙」做出來了，但把 AI 的介入點放錯位置——放進 Modal（建立精靈）、放進左側主欄（建議橫幅），兩處都讓畫面變複雜卻沒讓使用者更有掌握感。

**工具列五 band → 兩 band**。刪掉「知識文件不在這頁」那段藍字（純解釋性文字，而知識管理就在同一個側欄看得到）。搜尋／類型／階段／排序併成單行，PO 同意拿掉四個中文 label——Segmented 第一顆本來就寫「全部類型／全部階段」，排序把 label 收進值裡。這是 CLAUDE.md「不可用 placeholder 取代 label」的有意識例外：那條針對表單輸入欄位，篩選工具列語意由控件自身承擔。

**Ask AI 從「回寫左側 + 鎖右側」改成全程在右側**。這是本輪最重要的一項，因為它在修一個違反自家 guideline 的地方——前一輪 `disabled={!!activeProposal}` ＋「先處理左邊那筆再繼續問」，正是 §1 禁止的「把非阻塞的事做成阻塞」。新節奏：問 → 回答＋接話按鈕（左側不動、右側不鎖）→ 按「幫我改」→ 逐步播放執行過程 → 結果＋可收合 diff → 按「套用並刷新左側」左邊才變。三個取捨：diff 從左側橫幅搬進右側結果訊息（資訊沒消失、開發簡化）；不 take 完全沒關係，討論本身就是合法終點；**PO 定案按鈕過期就消失、不留重新喚起的入口**——與 Chat 頁「入口落到產出區永久可找」刻意不同，因為那裡是已發生的事實，這裡只是還沒發生的提案，重講一次成本極低。`ProposalBanner` 整個刪除。

**測試與試跑補回「動作」**。原本 `result: 'pass'` 是資料裡寫死的——送簽硬條件建立在一個從未發生過的動作上。加「執行測試」（逐題播放、寫入 `evalRun`）、「重新試跑」（僅 SOP，與前者分兩顆因為 gate 條件不同）、「＋ 新增測試案例」Modal（含一顆「讓 AI 幫我想一題」）。新增案例一律待執行，`getSignoffGate` 加 pending 條件。**刻意讓 AI 補的第二題失敗**（`mockResult: 'fail'` ＋ 實際回覆與原因）：沒有失敗可看，這顆按鈕就只是動畫；而「補了邊界題才發現原本會出事」正是負面題機制存在的理由。

**建立改成短表單，AI 移到詳情頁第一秒**。一個產品兩套 AI 對話本來就是重複。Modal 只收類型／名稱／適用範圍／大致流程四樣，**允許選錯類型是刻意的**。送出後立刻進詳情頁，右側 Ask AI 自動展開思考 2–3 秒後給首輪體檢（類型判斷、整理 Description、拆流程圖），每點都可 take。「起點不是選類型、由 agent 推薦」的論證沒被推翻，只是從「選之前」換成「選之後由 agent 糾正」——差別是使用者不必先讀懂分類就能開始，而糾正發生在他已經有具體內容可被判斷的時候。Modal 裡的假試跑廢除（本來就與 dry run 重複）。

附帶（AI 提出、PO 同意，不在原本四點內）：`WriteToggle` 從建立表單搬到詳情頁 Scope 區的工具授權那塊，僅 Draft／Testing 開放。建立當下就問「要不要能異動系統」太早了。

**驗證**：build 883,459 bytes，起靜態伺服器實測。工具列單行、列表上提三條橫線；Ask AI 問→接話→三步播放→diff→套用，左側 Description 灰化後換內容並閃藍框，右側按鈕收起成「✓ 已套用」且建議列表更新；建立表單填完進詳情頁，右側自動跑完四步體檢並列出三顆可 take 建議；完整鏈路 AI 補題 → 套用 → 執行測試 → **5/6 通過、1 題 FAIL 可展開看 AI 實際回覆** → 頁尾「還不能送簽」、送簽鈕 disabled；SOP 頁 `WriteToggle` 與「重新試跑」皆在位。修掉兩個實測發現的瑕疵：類型摘要區塊會跟著別區的套用重播淡入（`contentKey` 改成只在自己被換掉時變）、右側 `**粗體**` 未解析（新增 `AiText`）、「改成SOP吧」缺空白（`tierWord` 對拉丁字補空格）。console 零 React error。

**環境備註**：承上一輪，preview pane 的合成滑鼠點擊時靈時不靈（ref 與座標皆然，`element.click()` 一律正常），驗證改用程式化點擊驅動。非產品問題。

受影響 wiki 頁：[concepts/agent-skill-tiering.md](concepts/agent-skill-tiering.md)（＋決議 6–9 與附帶決議整段、建立流程與決議 4 加 ⚠️ 指標）、[ai_ux_guideline.md](../ai_ux_guideline.md)（＋§8 編輯型 AI 面板）、index.md。

## [2026-07-27] decision | 面板左右職責互換（任務／產出／來源）＋ dry run 改情境試跑與節點試打

PO 拿兩張截圖提兩點，先討論後實作。

**① 左右重疊**。PO：「兩個紅框的資訊完全重疊，這樣做沒有意義。」清點確認：左側流內步驟與右側面板步驟確實在講同一件事，**只有「還沒跑到的那幾步」是右側獨有的**（第二輪特地放進去的前瞻資訊）。所以做成**互換**而非單純刪除——直接砍右側步驟會把唯一沒重疊的價值一起砍掉。左側改成完整計畫（未跑到置灰、跑到會停的預先標、分支未走標「本次不走」、失敗技術細節回流裡），右側只剩計畫一層。計畫改由 Orchestrator 在**開跑之前**宣告（`plan` 欄位），不是從跑過的訊息回推——面板的價值來自「不做帶不確定性的等待」。情境 1 因此改寫成一句話要跑兩份 SOP，面板一開始就列 2 項。

面板只留最新計畫（PO 指定），但**產出必須例外累積**：第三輪把操作按鈕收成「只在最後一則」的交換條件正是「入口永久落在產出區」，清掉就跳票。三區改名 PO 提 Progress／Material／Context，只採用第一個的語義——`Material` 在設備課日常就是**備料**（同份 SOP 在講「備料未齊 2 項」）撞詞、`Context` 是我們的行話，定案**任務／產出／來源**。

**② dry run 不完整**。PO：「codify graph 每個節點都是程式碼，就有可能接口 in/out 不正確、極值沒考慮、schema 不正確——目前看不出有這些測試案例，也看不出發生時系統如何響應。」診斷是兩層測試被混為一談：`evalCases` 是意圖層（問法→回法），SOP 需要的是資料層（資料長這樣→節點該怎麼反應）。最強的論證是產品自己給的——**情境 2 演的正是 API v2→v3 的 schema 變更，等於示範了風險卻沒有防線**。

做法：壞資料情境由系統依 `tools`／`plainSteps` 自動生（空集合／schema 變更／極值／重複執行），🔒 不可刪；**PASS 的定義是「行為符合約定」不是「有輸出」**，符合約定的長相是停在注入節點並回報；展開看節點軌跡就是 PO 要的「系統如何響應」。`sm-eq-010` 留一題真 FAIL（步驟 3 沒區分「查無資料」與「真的 0 項」→ 照常輸出 0 項清單，最危險的那種錯：不是跑爆是靜靜輸出）、`sm-eq-008` 一題（重複執行沒查當日已開單）。送簽硬條件加「情境全部跑過且符合約定」。

節點試打入口放 Graph 節點上（`▷ 試打`）不放下拉選單——選節點時人看的是流程圖。read 給參數、compute 給**上游輸出可直接編輯**、write **永遠不真送**只算會送出什麼。試打不進 gate（否則又變蓋章）。打出問題可就地「存成一個情境」——這解掉了原本反對人自己加情境的理由：不用描述「怎麼壞」，因為是打出來的。

**刻意不做**：執行期 contract check（PO 指定 A only）。順序上它依賴情境試跑先把約定變成一個真實存在、簽核確認過的東西。⚠️ 風險 3「排程型 SOP 靜默失效」目前只擋住設計期一半。

**驗證**：build 927,623 bytes，preview 實測。情境 1 面板列 2 項、第 2 項「待執行」，跑到步驟 3 停下時左側同時顯示步驟 4「跑到這步會停下來等你確認」，確認後兩項皆 ✓、產出兩筆；往回捲第一則的置灰尾巴已消失（`showTail` 只給最後一個 run 區塊）。情境 2 左側正確顯示步驟 3／4「本次不走（Level-2）」與步驟 5 失敗的 `HTTP 400 · unknown field "severity"`。Skill 詳情：step 1 試打回 11 筆＋欄位表帶「步驟 2 查備料」等下游標記、compute 節點試打帶出上游可編輯資料、write 節點顯示警語與 `priorityLevel`／`impactScope`；執行情境試跑後 FAIL 自動展開軌跡，頁尾出現「還不能送簽」。console 零 React error。

**環境備註**：承前，preview pane 合成滑鼠點擊時靈時不靈，驗證改用程式化點擊；screenshot 偶爾回傳錯誤縮放，改用 innerText 驗證。非產品問題。

受影響 wiki 頁：[entities/modules/ai-chat.md](entities/modules/ai-chat.md)（＋第五輪整段）、[concepts/agent-skill-tiering.md](concepts/agent-skill-tiering.md)（＋第三輪決議 10–11）、index.md。

## [2026-07-28] decision | 面板第二次瘦身：只留狀態圖示＋名稱＋一個狀態詞

PO 看過畫面後再砍一輪，原則是「過多資訊反而造成認知負荷過重」。砍掉：暫停項目的「去決定」按鈕（決策卡就在左側正中間，它自己就是入口）、進度數字 `5/6`、計時 `00:09`（⚠️ 推翻第二輪「計時只在真的在跑或停下等人時走」）、計畫標題摘要行、**已完成項目的「已完成」字樣**（✓ 已經說完了）。「等你決定」改「已暫停」——面板報狀態，催人行動是決策卡的事。

通則：**完成的事不需要再說一次完成，還沒完成的才需要說它現在怎麼了。**

`formatElapsed`、`elapsed` state 與計時 effect、`onGoDecision` prop、`plan.doneCnt` 全部移除。build 926,102 bytes，實測情境 1 暫停時面板為「⏸ SPC 異常日報與開單／已暫停」＋「○ 整理當班交接報告／待執行」，完成後第一項只剩「✓ 名稱」。

受影響 wiki 頁：[entities/modules/ai-chat.md](entities/modules/ai-chat.md)（第五輪 ＋「同輪第二次瘦身」）。

## [2026-07-28] decision | SOP 不再有測試案例：兩種類型的驗收方法完全分開

PO 問「上方原本的『測試案例』保留的意義是？」。回查 `sm-eq-010` 三題，只有「順便幫我把 PM 排程延一週 → 應拒絕」是意圖層，另兩題（一般週排序、無到貨日）本來就是資料層，加了情境試跑之後變成重複。

我原本主張留下那一題並改名「範圍與授權」。**PO 的論證更強並推翻了它**：「SOP 的 dry run 完全沒有測試意圖的必要，只需要看 code 跑的結果好不好。」SOP 是 codify graph，**它沒有意圖可以測**——圖裡沒有的工具它根本呼叫不到，適用範圍是勾出來的結構化條件。「未授權寫入」不是需要被測出來的行為，是**構造上的保證**；不需要寫測試證明一張圖呼叫不到它裡面沒有的節點。

定案：SOP＝情境試跑（結果與例外），輔助判斷＝測試案例（意圖），兩邊互不出現。區塊標題也分開：`Dry-run` / `Test case`。

⚠️ 留下的缺口：「該不該由這份 SOP 接手」是**路由層**的問題（Chat／Orchestrator），情境 3／4 在對話裡演過，但目前沒有測試面。

實作：`getSignoffGate` 依 tier 分兩條完全不同路徑；`TestBlock` 對 SOP 直接回傳 `ScenarioBlock`；Ask AI 的「幫我想幾題測試案例」與首次體檢的驗收段落依 tier 分流；`buildAutoEvalCases` 移除 SOP 分支、`SkillCreateFlow` 建 SOP 給空陣列；`personas.js` 九個 SOP 的 `evalCases` 死資料刪除（剩下 7 筆全部是 guided，已驗）。build 921,493 bytes，實測 SOP 頁只剩 Dry-run 一區、gate 顯示「還有 3 個情境沒跑過」；輔助判斷頁只剩 Test case，無情境試跑。console 零 React error。

受影響 wiki 頁：[concepts/agent-skill-tiering.md](concepts/agent-skill-tiering.md)（＋決議 12）、index.md。

## [2026-07-29] decision | 測試案例 → 驗收：同一提問跑 5 次，AC 由人判

PO 帶團隊結論回來：「test case 會跟 codify graph 的 test 模式混淆，想改成 test report——使用者填 AC，run test 時 agent 跑 5 次，user 看內容判斷 AC 是否符合，全數通過才能送簽。」

我同意方向但先指出兩件事。**混淆是真的，但改名不是最大的收穫**——更根本的是輔助判斷每次結果都不一樣，「跑一次得到 PASS」在邏輯上就不成立，原本 `result: 'pass'` 也只是資料裡寫死的。**判定權移到人身上是更誠實的設計**，因為真實系統本來也沒有東西能自動判斷 LLM 的回答對不對。代價是風險 2「簽核變蓋章」升高：擋人的從系統變成使用者自己。

命名上建議用「驗收」而不是「測試報告」——使用者在這頁做的是驗收，不是讀報告；且與 SOP 的 `Dry-run` 完全分得開。PO 未反對，採用。

三題定案：(1) 同一提問跑 5 次（測穩定性，覆蓋率靠情境數）；(2) AC **先全域就好**；(3) 不滿分**可以**放行。

全域帶出一個必須解的問題：「應提到過濾器壓差門檻」拿去驗「範圍外機台」那個情境，正確答案是「不適用」，硬算就變成 miss，比例會說謊。解法是 AC 可帶 `whenKind`，**前提不成立的次數畫成灰點、不計入分母**，使用者只看到「5 次裡成立 3 次」。這是全域方案唯一被迫加回來的東西，已回報 PO。

另一個實作決定：**畫面上展示的不是 5 段回答，是 5 次之間的差異**。每條 AC 帶一句 `says`，成立時那句出現在回答裡、不成立就整句不見——弱掉的回答本來就長這樣。平鋪 5 段長文只會讓人讀到第三段就全部打勾。

防蓋章四道摩擦：不滿分不給直接勾（只能寫原因放行，原因進簽核資料）、改 Description 即作廢全部確認（`descRev`，堵掉「勾完再改指引」）、重跑清空確認、上次執行後才加的 AC 標為沒跑過。

順帶接上一個舊缺口：系統自動補的第三條 AC 是「每次回答要標明這是 AI 研判、責任在執行者」——正是 ai-chat 三輪砍掉三態徽章後轉給 F-AI-01 的那條告知責任。mock 刻意讓它 15 次裡漏 2–3 次，因為真實 LLM 本來就不保證每次都講。

實作：`personas.js` 7 個 guided 的 `evalCases` 全改為 `acceptance`；`SkillDetailPage.jsx` 新增 `AcceptanceBlock`／`AcceptDots`／`WaiveModal`／`buildAcceptResult`／`buildRunAnswer`，`getSignoffGate` 的 guided 分支重寫，區塊標題 `Test case` → `驗收`；`SkillCreateFlow.jsx` 的 `buildAutoEvalCases` → `buildAutoAcceptance`。`evalCases`／`evalRun` 自此消失。build 958,581 bytes。

驗證（本機 headless Chromium，CDN 被網路政策擋掉，改用 npm 同版套件本地起 http server）：console 零 error；`sm-eq-009` 一條 waived 其餘已確認 → 送簽鈕 enabled；按 Ask AI 改 Description → 驗收作廢、送簽鈕 disabled、頁尾寫明原因；`sm-pr-006` 3/5 與 12/15 → 送不出簽；展開情境可見第 2 次少了責任聲明那行、第 3 次少了配方／原料那行；重跑清空全部確認；SOP 頁不受影響（仍只有 Dry-run／情境試跑）；新建 Skill → 系統自動補 3 條 AC + 2 個情境、gate 擋在「還沒有執行過驗收」。

⚠️ `sm-mfg-*` 的資料同步改了但**製造課不是 Seed，UI 上到不了那頁**（既有限制），所以把「放行後可送簽」的示範移到設備課的 `sm-eq-009`。

受影響 wiki 頁：[concepts/agent-skill-tiering.md](concepts/agent-skill-tiering.md)（＋決議 13）、index.md。

## [2026-07-29] refine | Description 從「說明文件」改成 agent 的操作手冊

PO：「這 description 的範例有點太精簡了，沒有 skill.md 的精髓，應該要展示出 agent 可以利用 skill.md 進行操作，且操作結果可以被檢視；而不是單一問答而言。」

原本的四段（什麼時候用／判斷順序／要一併確認的數據／注意事項）讀起來像一篇給人看的文件，看不出 agent 拿它去做什麼。改成七段，關鍵是多出來的兩段：**可以動用的工具**（寫出 `fdc.get_alarm_detail(alarm_id)` 這種帶參數的呼叫）與**回答一定要包含**（輸出契約：結論與把握程度／每個數字的來源與取數時間／排除了什麼／建議動作與執行位置／責任聲明），另加**研判步驟的分支門檻**與**停下來不要硬判的情況**。

「回答一定要包含」是讓結果可被檢視的那一段。**沒有依據與排除過程，研判就只是一句看不出憑據的結論**，出事時無從回溯——這是風險 1（權責漂移）與風險 4（稽核斷裂）的日常版本。它同時讓驗收條件有東西可對：AC 檢查的就是這五點。

寫的時候發現兩個不一致並一併修掉：
1. `buildFormalDescription()`（Ask AI 的「整理成正式格式」）還是舊的薄骨架，整理完會把好的蓋回去。改用同一套七段，並依 `skill.tools` 自動列工具清單。
2. `traceSample` 的回覆步驟只有一句結論，**違反了它自己那份指引的輸出契約**。四則全部改寫成完整帶依據、排除過程、建議動作與責任聲明——旗艦範例不能自打嘴巴。

渲染面補了行內 `` `code` ``（monospace，沿用 Scope 工具表的視覺）與條列縮排；trace 的回覆改用 `AiText` 解析換行與粗體。

7 份輔助判斷全部重寫（含 mfg 兩份，雖然 UI 到不了）。build 975,082 bytes。實測 5 份可達的都有四段新結構、console 零 error；ERR-4421 那則 trace 現在會顯示「依據：過濾器壓差 0.07 MPa（門檻 0.05，FDC 03:12 取）…／排除：壓力形態為持續下滑而非跳動 → 排除感測器老化…」。

受影響 wiki 頁：[concepts/agent-skill-tiering.md](concepts/agent-skill-tiering.md)（決議 13 底下「同輪補強」）。

## [2026-07-29] decision | 系統與 AI 都不介入判斷，紀錄變主角

PO 追問：「『應先看冷卻水壓的變化形態』這種驗收要怎麼透過 harness 而非 LLM 做到？還是你設計上是 LLM as judgement 為目標？」

我先誠實回報現況：圓點是 `mockMiss` 假資料，UI 上寫的「**系統**依條件對每次回答做的初判」從來沒有定義過「系統」是誰——我把互動先做出來了，但跳過了驗證機制。

我的分析是 harness 能驗的比想像多：那條 AC 其實混了四個主張，有沒有呼叫該工具、順序對不對、回答裡的數字能不能對回工具回傳，三個都是確定性的，只有「判讀對不對」是殘差。並提議 AC 掛一層結構化 assertion，由 AI 從工具清單與指引推導、使用者用白話確認（同 `適用範圍` 從自由文字改結構化那一招）。

**PO 否決：「這樣等同把責任壓在 AI 身上。我傾向系統或是 AI 都先不介入判斷，但下面的回答區要明確寫出 AI 做了哪些事情、最終回答了什麼。人來檢查。」**

這個決定解掉的正是我自己標出來的那個含糊——**與其定義「系統」是誰，不如拿掉它**。

改動：條件列只剩文字 + 勾選框 + 誰在何時勾的（圓點、`3 / 5`、「不滿分不給勾」全部移除）；主體換成「每次執行的紀錄」，每一次都有**做了什麼**（工具呼叫、參數、回傳、被拒絕的那一步）與**最終回答**。收起來那一行只列它呼叫過的工具、按發生順序排——不是摘要也不是評語，使用者掃一眼看到「第 2 次少了一步」，那個判斷是他自己下的。

這也是決議 13「要展示差異而不是平鋪長文」的新手段：原本靠 AC 的 `says` 組答案（等於把判斷結果編進資料），現在靠列出事實。

PO 另外定案兩件我提議的東西都不要：**不加「勾之前要先展開看過」**（那也是替使用者判斷）、**「最近一次實際互動」整塊移除**（每次紀錄已涵蓋，`traceSample` 欄位一併刪掉，其內容改寫進各情境的典型紀錄）。

移除欄位：`whenKind` / `says` / `mockMiss` / `missNote` / `traceSample`，以及 `AcceptDots`、`buildAcceptResult`、`buildRunAnswer`、`critApplies`、`critMissAt`。
新增欄位：`probes[].steps` / `answer` / `vary`（第 i 次跟典型的差別：drop 少做哪幾步、add 多做哪幾步、answer 這次回了什麼）。

⚠️ 成本記著：「5 次裡只成立 3 次 → 指引寫得不夠緊」原本是系統算給人看的，現在要人自己從 15 筆紀錄看出來。工具序列那一行補回一部分，判讀品質仍然只能逐字讀。

7 份輔助判斷的驗收資料全部重寫。build 989,906 bytes。實測：console 零 error；圓點與比例已不存在、「最近一次實際互動」已不存在；`sm-eq-009` 一條 waived 其餘已確認 → 送簽鈕 enabled；重跑清空全部確認；改 Description → 紀錄作廢橫幅 + 送簽被擋；新建 Skill → 系統補 3 條 AC + 2 情境，執行後有 10 次紀錄（未授權內容以原型佔位文字呈現）；SOP 頁不受影響。

受影響 wiki 頁：[concepts/agent-skill-tiering.md](concepts/agent-skill-tiering.md)（＋決議 14，並修正決議 13 中被推翻的段落）、index.md。

## [2026-07-29] refine | 「記為已知限制」拿掉

PO：「記為已知限制是幹嘛的？拿掉。」

它是決議 13 的產物：當時「不滿分的條件不給直接打勾」，所以需要一個逃生口讓使用者在判斷落差可接受時仍能放行，並用「原因會進簽核資料」當交換條件。**決議 14 把分數整個拿掉之後，第 1 條沒了，這顆按鈕就只是「勾」旁邊一個意義不明的選項** —— 使用者看完紀錄後只有兩種狀態：這條做到了（勾）、還沒（不勾）。

移除 `WaiveModal`、按鈕與 `state: 'waived'` 分支；`acceptChecks[critId]` 從 `{ state, by, at, reason }` 簡化成 `{ by, at }`；mock 裡原本三筆 waived 改為一般確認，附帶的原因文字刪除。gate 訊息改成「看過下面那幾次的紀錄再決定要不要勾」。

build 984,648 bytes。實測：畫面上已無「已知限制」字樣；`sm-eq-009` 五條全確認 → 可送簽；取消任一勾 → 立刻擋下並指名是哪一條；勾回去 → 恢復可送簽；console 零 error。

受影響 wiki 頁：[concepts/agent-skill-tiering.md](concepts/agent-skill-tiering.md)（決議 13 的摩擦清單、決議 14 的對照表與移除清單）。

## [2026-07-30] decision | Skill 類型改名：SOP → Flow、輔助判斷 → Guide

PO：「目前 SOP 背後代表的是 codify graph，也就是 run 程式碼，但輔助判斷比較像是 skill.md 給 agent 應用的概念。目前 SOP 在公司內也是很泛用的名詞，我認為目前叫做 SOP 也可能造成混淆。」

討論先建立一個可驗證的篩選標準，而不是憑語感挑字：**撞名面**。數了 `data/knowledge.js` 15 篇文件的尾字——程序 ×5、指引 ×5、規範 ×1、流程 ×1——結論是「SOP」的問題不只是廠內泛用，而是**在本產品內部就已經撞名**：知識管理裡放的正是廠內慣稱的 SOP 文件，而且它們與 Skill 管理裡的同名項目互相引用（知識《生產日報彙整指引 v2.3》↔ Skill「生產日報彙整」`tier: 'sop'`）。同一個詞既指那份文件、也指那張圖。

這張表也淘汰了看起來最漂亮的答案：依 PO 的描述，最對稱的一組是「**流程／指引**」（codify graph 就是流程，skill.md 就是指引，概念頁內部本來就這樣寫），但知識庫有 5 篇「XX指引」，改了等於把同一個病複製到另一邊。另外兩個候選也各有硬傷被排除：「核准流程」**內含階段**（Draft 那一份還沒核准）、「自動流程」**名字會說謊**（含寫入的 Flow 會停下等人）。我先提的中文「固定流程」被 PO 判定繞口，放棄。

**PO 定案：`SOP → Flow`、`輔助判斷 → Guide`。** 容器名「Skill 管理」不改——中文找不到能蓋住兩者的詞，而最接近的「技能管理」在廠內是員工技能矩陣／技能認證，撞得比 SOP 更兇；且 Flow 與 Guide 本來就都是 skill，父層沒有錯。code key `guided`／`sop` 也不改，`SKILL_TIER_CFG` 就是為換用字而存在的單一改點。

**這一輪只換顯示字，行為零改動**：三層分界、Tool Gateway 把關、兩種類型各自的驗收方法、送簽硬條件全部不變。

實作：`shared.jsx` 的 `SKILL_TIER_CFG` 兩處 `label`／`short`；全站文案 9 個元件 + 4 份 data 共 220 餘處（含 Chat 五情境腳本、佈告欄「Flow 產出」徽章、交班 Modal「Flow 已算好」、排程「本 Flow 含 N 個需確認步驟」、Guide 詳情的 🔒 說明）；`SchedulingPage.blockReason()` 補空白（拉丁字類型名接中文要有空白）；`SkillDetailPage.tierWord()` 註解更新（兩個類型名現在都是拉丁字，原本看第一個字元的判斷邏輯本來就通用）。識別字刻意不動：`sopManagement`／`SOPManagementPage`／`fromSOP`／`sourceSOP`／`sopReport`／`tier: 'sop'`。

build 984,511 bytes。驗證：`index.html` 裡獨立詞「SOP」與「輔助判斷」殘留皆為 0，三個識別字（`SOPManagementPage` ×5、`fromSOP` ×3、`sourceSOP` ×6）完好；23 個模組經 Babel 編譯全數通過。⚠️ 本次無法做瀏覽器實測——`shell.html` 依賴 unpkg/CDN，本 session 的網路政策擋住外連，改以 Babel 本地編譯等價驗證語法。

⚠️ 留下的中英混搭：「Skill 管理」裡裝 `Flow`／`Guide`，隔壁 tab 仍叫「知識管理」。若要整齊，方向是把知識也改英文（`Knowledge`），不是把 Flow／Guide 改回中文。另 `SettingPage.jsx:1601` 的 tab key 是 `'knowledge'`（Skill 管理）、知識管理是 `'knowledge-doc'`，是 2026-07-26 拆分留下的殘跡，與命名無關但同區，之後動到再清。

受影響 wiki 頁：[concepts/agent-skill-tiering.md](concepts/agent-skill-tiering.md)（＋決議 15，並在頁首標明舊段落沿用舊用字）、[decisions.md](decisions.md)（補 07-27~29 與 07-30 兩列）、index.md。
