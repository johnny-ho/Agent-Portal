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
