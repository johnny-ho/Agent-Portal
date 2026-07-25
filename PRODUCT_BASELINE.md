# Agent Portal — Product Baseline

> **版本**：v3.9
> **更新**：2026-05-07（KPI 報表管理後台設定上線：Setting → Section 管理新增「KPI 報表管理」tab（Seed Only）；支援兩種來源類型（外部 URL / EDA3 Flow）；Group 層與 Report 層各自支援拖曳排序；新增 / 編輯走 Modal；各課 mock 資料獨立（設備 / 製程 / 製造）；詳見 §13.15）
> **前版**：v3.8（2026-05-01：My Tasks 面板重構：Personal Zone 由 Widget 卡片改為全高右側面板；Header 常駐（sticky）；任務列表獨立捲動；面板可往右收合（toggle tab 掛於分隔線左側）；詳見 §13.14）
> **負責人**：PM｜**狀態**：PO 已確認

---

## 1. 平台定位

**Agent Portal** 是面向半導體廠區工程師的入口平台，以「課」為基本組織單位，整合設備（EE）、製程（PE）、製造（MFG）三大職能的資訊流。

**兩層定位**：

**Section Home（課的資訊中心）** — 課的公告、KPI、Must-be-zero 狀態、應用入口、個人任務清單，開啟即看見，不需到處找。

**跨角色協調層** — 跨角色的協調請求（EE 修完設備請 PE 確認、課長指派任務）沒有現有系統承載，Portal 透過整合多系統資訊與跨角色任務流，讓橫向協作有明確的發起與接收地點。

> 一句話：**「讓每位廠區工程師在班中開啟 Portal 的第一眼，就同時掌握課的今日狀態與自己最重要的事；讓跨角色的協調請求有一個明確的發起與接收地點。」**

**邊界聲明**：Portal 是資訊整合中心與工作入口，「解決問題」仍在對應的專業系統（FDC Console、SPC Console、MES 等）執行。AI 僅在使用者主動發問時回答，不主動判斷、不自動排序任務、不代理推送通知，不代理執行任何系統操作。

---

## 2. 背景與痛點

### 用戶研調核心發現（EE 深度訪談，2026-04）

| 痛點 | 訪談原話摘要 |
|------|------------|
| **系統被動** | 「太安靜、太被動。它坐在那裡等我定義 Skill，等我去看報表，等我點確認。」 |
| **缺乏判斷依據** | 「不要只給我結論，要給我邏輯。只要圖一併出來，我一眼就能看出是真的有像還是 AI 在發瘋。」 |
| **誤判成本高** | 「誤判讓我花 2 小時寫報告解釋，我會叫你把這系統撤掉。」 |
| **行政時間佔 40%+** | 報告、開單、跨部門自證清白，是最大的時間殺手。 |
| **資料孤島** | 資料散落在 FDC、MES、ERP 等多個老舊系統，無法快速彙整。 |

> **核心警示：「千萬別把這做成給課長看的監視工具。只要工程師覺得這東西能幫他少寫報告、少被罵、少開單，導入就會成功。」**

課級資訊目前分散在 Confluence 主頁、自建 HTML 首頁、Power BI 頁面、Case Center 等各處，沒有統一的課級 workspace。Portal 目標之一是成為課級資訊的公認歸宿。

---

## 3. 願景

> **讓每一位廠區工程師，在任何班別任何情境下，都能在 30 秒內掌握課的今日狀態與自己的工作重點，並取得正確的知識、判斷依據與行動建議。**

長期目標是打造廠區的「AI 協作層」，讓 Portal 成為廠區所有工程師的工作起點，並透過 agent-to-agent 方式持續擴展能力。

---

## 4. 目標（Goals）

**短期（0–6 個月）**：建立三課課 Workspace + Priority Feed 融合儀表板；完成 Skill 知識庫 AI RAG 整合；提供 AI Chat 作為第一個知識查詢入口，取代 70% 的「問前輩」場景。

**中期（6–18 個月）**：串接廠區核心系統（SPC、FDC、MES、EDX、Case Center、Tool Center、Lot Center）；導入 EE Agent / PE Agent，透過 agent-to-agent 模式呈現主動分析結果；Skill 數位化率達 80%。

**長期（18 個月以上）**：Agent 生態系成熟，Portal 成為多 Agent 統一呈現介面；支援多廠複製；提供廠區知識健康儀表板。

---

## 5. 使用者輪廓（Personas）

**組織前提**：角色嚴格分開（EE / PE / MFG 不兼任）。課（Section）是最基本的組織與責任單位，Portal 所有資料以課為範圍邊界。工程師輪班，異常事件由值班人員移交後反映在個人 Priority Feed。

### Persona A：設備工程師 EE（設備課）
- **核心職責**：設備維修、預防性保養（PM）、FDC 異常處理
- **Portal 使用場景**：開班掃描課況（KPI / Must-be-zero）→ 確認 Priority Feed → 透過 EE Agent 取得根因分析與 Skill → 帶參數跳轉 FDC Console / 維修工單
- **課級關鍵指標**：設備稼動率、MTTR、PM 達成率、FDC 異常台數、Unclose Case 數

### Persona B：製程工程師 PE（製程課）
- **核心職責**：Recipe 管理、SPC 監控、製程變更（DCR）審核、良率分析
- **Portal 使用場景**：確認 SPC OOC 狀態 → 處理 EE 移交的製程影響評估 → 透過 PE Agent 取得良率根因假設 → 帶參數跳轉 SPC Console / MES
- **課級關鍵指標**：良率、SPC OOC 數、SPC 再發 Alarm 數、待審 DCR 數、待更新 Skill 數

### Persona C：製造工程師 MFG（製造課）
- **核心職責**：產能管理、WIP 調度、排程規劃、跨課協調
- **Portal 使用場景**：確認產能狀態與排程衝突 → 處理停機對排程的影響 → AI 生成交班摘要草稿 → 帶參數跳轉 MES / 排程系統
- **課級關鍵指標**：產出達成率、線體稼動率、準時交貨率、WIP 在製批數、Priority Lot 狀態

### Persona D：課長（各課）
- **決議**：課長不設獨立 View，透過「課長角色預設 Widget 集」取得聚合視圖，與工程師共用同一套框架。個人 Priority Feed 在課長預設集中不顯示（可手動加回，非預設）。
- **預設 Widget 集**：課級 KPI 聚合、Must-be-zero 橫幅、成員任務熱度列表、待課長決策事項（含行動按鈕）、課內公告發布

### Persona E：Seed（各課 Portal Admin）
- **角色特性**：本質是一位工程師，額外承擔課的 Portal 配置管理工作，不負責課的維運管理。
- **Setting 後台職責**：權限管理（帳號 / 角色）、Dashboard 編排（Widget 組合與排列）、知識管理（Skill 匯入 / RAG / 簽核流程）
- **注意**：一個 Section 可多位 Seed，避免單點失敗

### Persona F：IT 管理員（v3.2 新增）
- **角色特性**：全平台層級管理員，負責跨課共用的基礎設定，不隸屬任何單一課。
- **Setting 後台職責**：APP 管理（Function Tree 三層結構：大分類 / 子系統 / 功能，控制前台展示）
- **識別**：PersonaPicker 顯示「IT」，accent 色為紫色（#7C3AED），role = `IT Admin`
- **邊界**：IT 管理員不管理課內資料（KPI / 佈告欄 / 知識庫），僅維護平台層功能目錄結構

---

## 6. 產品核心模組

### 左側導覽結構

Portal 採用固定最左側的文字標籤 Nav（64px 寬）。

| 順序 | Nav 項目 | 頁面 | Tab 定位 | 說明 | 狀態 |
|------|----------|------|---------|------|------|
| 1 | **Home** | 工作站首頁 | **當前狀態快速總覽**（紅燈數、今日到期 Task、最新 Schedule）| Section Zone + Personal Zone（Priority Feed）+ AmbientBar | ✅ 已實作 |
| 2 | **KPI** | KPI 報表中心 | **趨勢與歷史深入分析**（圖表、達成率、期間比較） | 書籤清單 + 嵌入報表 / Ask AI 入口 | ✅ 已實作 |
| 3 | **App** | APP Center | **公司內部應用入口**（與外部 SaaS 無關） | 內部 IT 應用目錄 / 個人釘選（最多 20）/ Header 膠囊 toggle 切換新版 / 舊版 iframe | ✅ 已實作（v3.4）|
| 4 | **Task** | 派工管理 | **跨角色任務執行** | 課長派工 / 進度總覽 / 歷史記錄 | ✅ 已實作（v2.5）|
| 5 | **AI** | AI Chat | **使用者主動發問的輔助層**（非預設入口） | 課上下文 AI 對話 / 知識貢獻轉存 / 歷史對話 | ✅ 已實作 |
| 6 | **Schedule** | 排程中心 | **排程管理**（Task 的時間維度，獨立 Tab） | 課級 Skill 定時執行 / Human-in-the-loop / 執行紀錄 | ✅ 已實作（v2.6）|
| — | ~~Handover~~ | ~~交班中心~~ | **隱藏**（功能保留，不掛主 Nav） | 結構化交班流程（Sprint 1 + 2） | ✅ 已實作（隱藏）|
| — | 知識 | Knowledge Base | — | Skill 查詢 / Prompt 模板 / Q&A | 🚧 元件已建立，尚未掛 Nav |
| 底部 | 設定 | Setting 後台 | — | **全角色可見**；Personal 區（個人偏好）+ Section 管理區（僅 Seed）+ IT 管理區（僅 IT Admin）| ✅ 已實作（v3.2）|

> **Nav 順序**（v3.6，2026-04-30 大老闆決議）：**Home → KPI → App → Task → AI → Schedule**。
> 設計原則：「資訊整合優先，管理集中統一，AI 置後作為輔助工具」。
> Home 與 KPI 的切分：Home 看**當前狀態**（一眼），KPI 看**趨勢分析**（深入）。
> App 定義：**公司內部自建或提供的 application**，與外部軟體系統（SaaS）無關。
> Schedule 維持獨立 Tab（不降級為 Task 子頁）。
> Handover 頁面保留原始碼，Nav 隱藏，未來視需求決定是否重新上架。

### 前台模組現況

| 模組 | 頁面 | 功能摘要 | 狀態 |
|------|------|----------|------|
| 工作站首頁 | Dashboard | Section Zone（課佈告欄 + **Operations Monitor** + KPI Summary + 課的應用）+ Personal Zone（Priority Feed）+ AmbientBar | ✅ |
| 課佈告欄 | Dashboard | 公告 / 角色標籤 / 置頂 / 確認已讀 / 已讀計數 | ✅ |
| **Tool Status Widget** | **Dashboard** | **非正常狀態機台列表（Down / PM / Monitoring）/ Claim Memo / Quick Actions（借機 / FOUP Transfer / 查看細節）/ 點擊開 popout 詳情（v3.5）** | **✅** |
| **Case Widget** | **Dashboard** | **高優先案件列表（P1/P2）/ Case Type badge / Tool+Lot ID / ↗ 跳轉 link（v3.5）** | **✅** |
| **Lot Hold Widget** | **Dashboard** | **Hold 批次列表 / Hold Type badge / 點列展開 popout 詳情（v3.5）** | **✅** |
| KPI Summary | Dashboard | Section Zone 可收合 KPI 格子（本班即時），3×2 Grid，狀態燈號；**三課均顯示（v3.7 起，設備課已恢復）** | ✅ |
| 課的應用 | Dashboard | **Seed 配置課級標準應用**（必選標記），固定顯示於 Section Zone，不受個人釘選影響；**三課均顯示（v3.7 起，設備課已恢復）** | ✅（帶參數跳轉尚未實作）|
| **我的釘選** | **Dashboard** | ~~個人 APP Center 釘選的前 6 個應用，即時同步顯示於 Personal Zone 頂部~~ | **❌ 已移除（v2.8 決議：Personal Zone 聚焦 Priority Feed，釘選入口統一在 APP Center）** |
| **APP Center** | **APP** | **全公司 IT 應用目錄 / 個人釘選最多 20 / 12 類物件導向分類 / Grid + List 切換 / 頁內搜尋 / Search App focus 顯示釘選 / ☰ Function Tree 按鈕（搜尋欄左側）** | **✅ 已實作（v3.2）** |
| Priority Feed | Dashboard | P1/P2/P3 卡片 / 忽略功能 / Ask AI 入口 | ✅ |
| AmbientBar | Dashboard | 課上下文快問欄，含快捷提示詞 | ✅ |
| KPI 報表中心 | KPI | 左側書籤清單 + 右側 mock 報表（KPI Cards + 趨勢圖）/ Ask AI 入口 | ✅（mock 資料）|
| AI Chat | AI | 課上下文對話 / 知識貢獻轉存 / 歷史對話 / Ask AI 新對話流程 | ✅ |
| 派工管理 | Tasks | 課長總覽 / 快速派工 / 平面列表 + Drawer / 歷史記錄 7 天 | ✅（v2.5）|
| **排程中心** | **Schedule** | **排程清單 / 執行紀錄（可展開步驟）/ Human-in-the-loop Banner / 延伸討論跳轉 AI Chat** | **✅（v2.6）** |
| 交班中心 | 交班 | 4 階段狀態機 + 歷史記錄 tab（搜尋 / 班別篩選 / 時間線 / 詳情面板）/ Dashboard bulletin 整合 | ✅（Sprint 1 + 2）|
| **Setting 後台** | **Setting** | **7 tabs：權限管理 / 課佈告欄（公告 CRUD）/ KPI Summary（閾值設定）/ **KPI 報表管理**（報表來源設定 + 拖曳排序，v3.9 新增）/ Application（分組管理）/ 知識管理 / 首頁排版（Row-based Widget 管理，v3.7 新增）；僅 Seed 可見** | **✅（v2.9，mock 操作；首頁排版 v3.7；KPI 報表管理 v3.9）**|
| Must-be-zero 橫幅 | Dashboard | 零容忍指標亮燈看板 | 🚧 元件已建立，尚未掛 DashboardPage |
| Knowledge Base | 知識 | Skill 查詢 / Prompt 模板 / Q&A | 🚧 元件已建立，尚未掛 Nav |
| 我的最愛 | Dashboard | 個人捷徑 / 拖曳排序 | 📋 規劃中 |

### 後台模組（Seed 管理）

Setting 後台共七個 tab，僅具備 Seed 角色的使用者可見與操作。

| Tab | 功能摘要 |
|-----|----------|
| 權限管理 | 三角色（Seed / Member / Viewer）/ 純 By User（個人帳號）加入 / 預設規則自動套用 / 角色配置矩陣 / 存取封鎖清單 |
| 課佈告欄 | 公告 CRUD（標題 / 內文 / 對象標籤 / 置頂）/ 草稿與發布狀態切換 / **發布 = 即時顯示於 Home 課佈告欄 Widget** |
| KPI Summary | KPI 啟停與告警閾值設定（黃色警示 / 紅色告警）/ 拖曳排序 / 即時預覽 Widget 效果 |
| **KPI 報表管理（v3.9）** | **KPI 報表中心報表來源設定：Group 分組管理（拖曳排序）/ 報表兩種來源類型（外部 URL / EDA3 Flow）/ 新增 / 編輯走 Modal / 各課資料範圍獨立；Seed 管理，課員唯讀** |
| Application | 課級應用分組管理（自訂群組名稱）/ 每組內可加入 / 移除應用 / 必選標記（推送至成員捷徑，不可移除）/ 群組結構反映 Dashboard 課的應用 Widget 排列 |
| 知識管理 | Skill 匯入 / 知識內容編輯測試 / 簽核流程（Draft → Testing → Approving → PI Run → Production）|
| **首頁排版（v3.7）** | **Row-Based Widget 管理：新增 / 刪除 Widget 列、Widget Picker（依課別過濾 + singleton 約束）、per-widget 右側編輯面板（built-in：前往對應設定 Tab；custom：標題 + 富文字編輯）；跨 Tab 跳轉（onNavigateToTab）** |

---

## 7. UI / UX 架構決策

### 7.1 首頁定位：工作站（Workstation）

**決議**：首頁定位為「工作站」，不是 KPI 儀表板。KPI 指標移出首頁，獨立為左側 Nav 的 KPI 報表中心。首頁核心體驗是「有人幫我把工具和資訊整理好，進來就可以開始工作」。

```
┌──────────────────────────────────────────────────────────────────┐
│  [Icon Nav]  Top Header：課名稱 / 用戶 / 班別資訊 / Search App    │
├──────┬───────────────────────────────────┬───────────────────────┤
│      │                                   │                       │
│ Icon │  Section Zone（Seed 配置）         │  Personal Zone（個人） │
│  Nav │  ┌──────────────────────────────┐ │  ┌─────────────────┐  │
│      │  │ 課佈告欄 Widget               │ │  │ Priority Feed   │  │
│      │  ├──────────────────────────────┤ │  │  (My Tasks)     │  │
│      │  │ Tool Status Widget（全寬）    │ │  │                 │  │
│      │  ├──────────────┬───────────────┤ │  │                 │  │
│      │  │ Case Widget  │ Lot Hold      │ │  │                 │  │
│      │  │  (1/2 寬)    │ Widget(1/2寬) │ │  │                 │  │
│      │  ├──────────────┴───────────────┤ │  │                 │  │
│      │  │ KPI Summary Widget（可收合）  │ │  │                 │  │
│      │  ├──────────────────────────────┤ │  │                 │  │
│      │  │ 課的應用 Widget（課級標準）    │ │  └─────────────────┘  │
│      │  └──────────────────────────────┘ │                       │
├──────┴───────────────────────────────────┴───────────────────────┤
│  AmbientBar：針對本課問 AI 任何問題 + 快捷提示詞                   │
└──────────────────────────────────────────────────────────────────┘
```

> **v3.7 更新**：設備課（equipment）persona 已恢復顯示 KPI Summary 與 Applications widget（v3.5 隱藏，v3.7 修正回歸）。Seed 現可透過「首頁排版」tab 自由調整各課的 widget 組合與列順序。

### 7.2 三層治理模型

| 治理層 | 管理主體 | 管理範疇 |
|--------|----------|----------|
| Platform 層 | 開發團隊 | 頁面骨架、Zone 結構、Widget 類型與 Contract、Nav 項目 |
| **IT 層（v3.2）** | **IT 管理員** | **全平台 Function Tree 結構（大分類 / 子系統 / 功能 / 系統名稱）、功能前台展示開關** |
| Section 層 | Seed | Section Zone Widget 內容與排列、課的應用清單（課級標準）、KPI 書籤、必選標記 |
| Personal 層 | 個人工程師 | APP Center 個人釘選（同步至 Dashboard 我的釘選 Widget）、個人偏好 |

**邊界規則**：Section Zone 由 Seed 決定，個人不可更動。Personal Zone 由個人決定，Seed 僅可透過「必選」標記推送不可移除的捷徑。Priority Feed 由 AI Agent 生成，任何層均不可配置其內容。

**應用入口職責分工（v2.8 確認）**：
- **課的應用 Widget（Section Zone）**：Seed 維護的「課級標準工具清單」，全課成員一致顯示，強調課的集體工具規範。
- **APP Center（Nav 第 2 位）**：全公司應用目錄（百餘個 IT 應用），個人釘選管理（上限 20），是「發現」與「個人化設定」的唯一入口。Search App 搜尋欄 focus 時，預設展示已釘選應用。
- ~~**我的釘選 Widget（Personal Zone）**~~：已移除（v2.8）。Personal Zone 聚焦 Priority Feed，釘選入口統一在 APP Center，避免雙頭管理。

### 7.3 Section Zone Widget 規格

**課佈告欄（`bulletin`）**：每則公告含標題、內文、角色標籤（全員 / EE / PE / MFG）、置頂、發布者署名。工程師可確認已讀，課長 / Seed 可查已讀計數。未讀有視覺高亮（藍底 + 左側藍點）。首頁顯示最新 3 則。

**課的應用（`app-launcher`）**：Seed 後台維護「課級標準應用清單」（新增 / 下架 / 必選標記）。必選應用強制出現在課的應用 Widget 中、不可由個人移除。此 Widget 代表課的集體工具規範，不受個人釘選影響。

~~**我的釘選（`my-pins`）**~~：已移除（v2.8）。釘選管理統一在 APP Center 進行，上限 20 個。Dashboard 不再展示釘選縮影，避免雙頭管理造成困惑。

### 7.4 My Tasks 面板設計原則（v3.8 更新）

> v3.8 起，Personal Zone 由 Widget 卡片形態改為**全高右側面板**，詳細設計決議見 §13.14。

**任務來源**：外部系統帶入（FDC / MES / Case Center）、課長 / Seed 指派、個人自建待辦、跨角色請求（EE 完修 → PE 確認）。

**卡片排序**：P1 / P2 / P3 由任務發起人指定，Portal 不自動重排。P1 永遠置頂。

**卡片必要元素**：優先級標籤 / 來源標示 / 摘要說明 / 系統標籤（monospace）/ Ask AI 按鈕 / 標記完成按鈕。

**穿透力原則**：點擊卡片開啟可編輯詳情 Modal，欄位包含標題、優先級、截止日期、指派對象、說明。

**完成機制**：標記完成後卡片即時顯示刪除線並轉為「已完成」狀態，點擊刷新後才從列表消失（模擬下次進站資料同步行為）。

**新增機制**：可從面板右上角 `+` 新增任務，預設指派給自己，可改派組內其他成員（主管視角使用）。

**收合機制**：面板可往右側收合（toggle tab 常駐於分隔線左側，收合後仍可點擊展開）。

### 7.5 Widget-based 平台架構

**決議**：全平台採用單一 Dashboard 框架，課長透過「課長角色預設 Widget 集」取得聚合視圖，不設獨立 View。

**確認的 Widget 類型**：

| Widget Type | 用途 | 治理層 |
|-------------|------|--------|
| `bulletin` | 課佈告欄 | Seed |
| `kpi-summary` | KPI Summary（本班即時，可收合 3×2 格）| Seed |
| `app-launcher` | 課的應用 | Seed |
| `must-be-zero` | 零容忍指標 | Seed |
| `kpi-grid` | KPI 格子（數值 + 目標 + 趨勢）| Seed |
| `kpi-report` | 嵌入報表視窗 | Seed |
| `priority-feed` | 個人優先任務 | AI 生成 |
| ~~`my-pins`~~ | ~~我的釘選~~（已移除，v2.8）| — |
| `aggregated-kpi` | 課級聚合指標（課長用）| Seed |
| `decision-queue` | 待決策事項（課長用）| Seed |

**Widget Contract 要求**：標準資料格式與 API 規範、最大尺寸定義、載入 timeout ＜1s（廠內 VPN 環境）、帶參數跳轉規範。

### 7.6 KPI 報表中心設計

左側書籤清單（Seed 管理，含分類與來源 tag）+ 右側嵌入容器。Portal 不重做報表本身，提供「在原系統開啟」逃生出口，顯示資料來源與最後更新時間。

---

## 8. AI 功能設計

### 8.1 被動查詢原則

AI 僅在使用者主動發問時運作。不主動分析、不自動排序任務、不主動推送。所有最終動作由工程師確認後自行執行。

**例外：Scheduling**。Scheduling 是唯一允許 AI 主動執行的場景，但受以下約束限制：（1）執行由課員預先設定的 Skill 與排程，非 AI 自主判斷；（2）所有 MCP tool 呼叫均需人工確認才能觸發；（3）執行紀錄對全課公開，任何課員均可查閱與介入。此設計確保主動性受課員集體授權，而非 AI 單邊決策。

### 8.2 AI 入口一覽（已實作）

| 入口 | 位置 | 觸發方式 | 功能 |
|------|------|----------|------|
| **AI Chat** | AI 頁 | 主動進入 | 以課為上下文的完整對話介面，含歷史紀錄 |
| **AmbientBar** | Dashboard 底部 | 常駐快問欄 | 輸入問題即時回答，含快捷提示詞，對話個人私有 |
| **Ask AI（Task）** | Dashboard Priority Feed | 點擊卡片「✦ Ask AI」| 帶入 Task context（優先級 / 說明 / 標籤 / 來源）跳轉 AI Chat 開新對話 |
| **Ask AI（KPI）** | KPI 報表中心 toolbar | 點擊「✦ Ask AI」| 帶入報表定位（名稱 / 系統來源 / 更新時間），AI 自行取得即時資料後回答 |

### 8.3 Ask AI 互動規範

**新對話流程**：從任何 Ask AI 入口進入 AI Chat，一律開啟新對話（`activeId = null`），不進入既有歷史對話。主區塊顯示「有什麼可以幫你？」空白起始頁，說明已帶入的 context 來源。

**Context Badge**：Input 上方顯示可折疊的藍色 context badge，預設收起。點擊展開可查看完整 context 內容。右上角 × 可手動清除；送出訊息後自動清除。

**Task context 格式**：包含 Task 標題、優先級、說明、標籤、來源（完整文字，供 AI 直接參考）。

**KPI context 格式**：僅帶報表定位（名稱 / 系統來源 / 更新時間），不帶數值。AI 根據定位資訊自行透過工具取得即時資料，使用者不感知工具調用過程。

### 8.4 未來方向（暫不實作）

EE Agent / PE Agent 等主動分析型 Agent 為未來方向。當條件成熟時，涉及異常判斷的卡片必須附帶判斷依據（歷史波形圖、數據來源說明等），不得僅輸出結論文字。

---

## 9. 外部系統整合地圖

```
Agent Portal
    ├── 數據讀取層（唯讀）
    │   ├── SPC Chart         → 管制圖數據、OOC 失控警示
    │   ├── FDC 系統          → 設備異常事件、警報層級、再發偵測
    │   ├── MES 生產系統      → 工單狀態、WIP 追蹤、產出數據
    │   ├── 設備監控系統      → 稼動率、機台狀態
    │   └── WIP Tracker      → 在製品批次狀態
    │
    ├── 雙向互動層（查詢 + 帶參數跳轉）
    │   ├── Case Center       → 異常工單查詢與跳轉
    │   ├── Tool Center       → 設備履歷、PM 排程跳轉
    │   └── Lot Center        → 批次追蹤、製程歷程跳轉
    │
    ├── 知識來源層
    │   ├── Confluence        → Skill 原始文件匯入
    │   └── EDX               → 訓練教材與認證資料
    │
    └── Agent 協作層（未來）
        ├── EE Agent          → 設備異常分析、維修建議輸出至 Portal
        └── PE Agent          → 製程異常分析、良率根因輸出至 Portal
```

**整合原則**：Portal 不取代現有系統，整合其數據，並透過帶參數跳轉讓工程師從 Portal 無縫進入子系統的對應頁面。

---

## 10. 設計原則

1. **課為重心（Section-Centric）**：課是所有資料範圍的邊界與協作的基本單位。
2. **工程師優先（Engineer-First）**：每張卡片、每個指標都必須是可行動的，不做給課長欣賞的精美儀表板。
3. **證據透明（Evidence-First AI）**：AI 輸出的任何判斷，必須附帶可驗證的依據，讓工程師幾秒內自行判斷準確性。
4. **人執行、AI 建議（Human-in-the-Loop）**：AI 只查詢、只建議，所有行動由工程師確認後自行執行。
5. **穿透力（Deep-Link First）**：從 Portal 到子系統的每個跳轉必須帶入相關參數，不讓工程師重複填入已知資訊。
6. **低摩擦（Zero Admin Burden）**：任何 AI 建議，工程師都可一鍵忽略且不產生行政紀錄或追蹤義務。
7. **知識可信任（Trustworthy Knowledge）**：AI 回答必須標注來源 Skill 版本。
8. **角色分明（Role-Aware）**：不同角色的預設資訊、KPI、任務完全個人化。

---

## 11. 成功指標（OKRs）

### OKR 1：提升班中知識查詢效率
- KR1.1：AI Chat 每班平均使用次數 ≥ 5 次 / 人
- KR1.2：「問前輩才能解決」的場景減少 50%（問卷）
- KR1.3：Skill 查詢平均耗時從 5 分鐘降至 30 秒以內

### OKR 2：Skill 數位化與知識健康度
- KR2.1：全廠 Skill 上 RAG 覆蓋率 ≥ 80%
- KR2.2：Skill 待更新件數 ≤ 3 件 / 課（月均）
- KR2.3：每月新增 Q&A 條目 ≥ 10 筆 / 課

### OKR 3：課 Workspace 導入成效
- KR3.1：工程師開班後 5 分鐘內開啟 Portal 比率 ≥ 70%
- KR3.2：課內公告確認已讀完成率 ≥ 85%
- KR3.3：Priority Feed 卡片有效行動率（點擊行動按鈕而非忽略）≥ 60%

### OKR 4：跨課協調效率
- KR4.1：停機後排程調整決策時間縮短 40%
- KR4.2：跨課協調類 AI Chat 使用率月增長 ≥ 20%

---

## 12. 未解決問題（Open Questions）

| # | 問題 | 重要性 | 狀態 |
|---|------|--------|------|
| OQ-1 | RAG 回答品質標準與測試通過率閾值 | 高 | 待討論 |
| OQ-2 | Skill 簽核流程是否整合現有電子簽核系統（ESS）| 高 | 待確認 |
| OQ-3 | 多廠複製時，各廠 Skill 共享或獨立 | 中 | 未開始 |
| OQ-4 | AI Chat 對話歷史保存期限與資安合規要求 | 高 | 待確認 |
| OQ-5 | 使用者認證是否整合廠區 AD/LDAP | 高 | 未開始 |
| OQ-6 | Must-be-zero 指標定義與更新權限由誰維護 | 高 | 待確認 |
| OQ-7 | Priority Feed 優先級衝突時的顯示排序規則 | 中 | 待討論 |
| OQ-8 | 課內公告發布權限範圍（僅課長 or 含 Seed）| 中 | 待確認 |
| OQ-9 | 值班平台與 Portal 的事件移交是否需正式 API 串接 | 中 | 待討論 |

---

## 13. 戰略決議與程式碼現況

### 13.1 平台定位：ECP 的下一代

公司內部 ECP（15 年歷史全廠入口）以 function tree 方式上架所有 IT 功能，造成大量 silo system，學習成本高，對新人尤為明顯。IT 大老闆任務是開發 ECP 下一代，引入 AI 協作，優先改善值班交接問題。

| | ECP（舊） | Agent Portal（新）|
|---|---|---|
| 組織概念 | 以「功能」為中心 | 以「課」為中心，預設角色視圖 |
| 整合方式 | IT 統一開發 | Widget Contract，各課自行接入 |
| AI 角色 | 無 | 核心能力層（查詢 / 摘要 / 建議）|
| 入口邏輯 | Function tree，工程師主動尋找 | 開啟即看到課況 + Priority Feed |

Agent Portal 具備 ECP 的全廠格局（開放整合、全廠適用），但以「課 Workspace」為第一個殺手級應用，以「值班交接」為最優先切入點。

### 13.2 值班交接作為切入點

1. **對老手無侵入性**：日常工作流程不變，Portal 只在交班時刻幫助整理，阻力最小
2. **天然驅動跨系統整合**：好的交班摘要需涵蓋 FDC / MES / Case Center，需求本身逼著 Portal 串接各域系統，動機是服務工程師
3. **成效可量化**：交班時間縮短、接班遺漏問題減少，可向 IT 大老闆報告

**新人策略**：短期不強制取代 ECP，優先讓 Portal 成為「新人的第一個家」加上「全員的交班工具」，讓老手因交班工具好用而逐漸遷移。

### 13.3 跨部門整合框架

**「平台引力模型」**：

供給側——制定公開的 Widget Contract（資料格式、API 規範、尺寸、timeout 上限），任何部門按規範開發 Widget 即可上架，不需了解 Portal 內部架構。

需求側——當工程師習慣在 Portal 交班摘要看到 FDC 數據，某域系統缺席時，工程師自然向該系統 owner 施壓，壓力來自使用者而非 IT。

**整合順序決議**：先親自整合最重要的幾個系統（FDC、MES、Case Center）讓交班摘要品質足夠驚艷，形成示範效應後，再開放 Widget 規範讓其他部門自行接入。

### 13.4 程式碼現況速覽

> 參考路徑：`Agent portal/src/components/`（元件）、`Agent portal/src/data/`（資料）
> **最後更新**：2026-05-01（v3.8：My Tasks 面板重構，詳見 §13.14）

**已完成**：

| 模組 | 狀態說明 |
|------|---------|
| 三課 Persona 切換（EE / PE / MFG） | ✅ 左側 Nav：Home / **APP** / AI / KPI / Tasks / Schedule / Handover / **Setting**（v3.1：Setting 改為全角色可見） |
| Dashboard 雙欄佈局 | ✅ Section Zone（`homeLayout` row-based 渲染，v3.7）/ Personal Zone（My Tasks 全高面板，v3.8）/ AmbientBar |
| **APP Center** | ✅ Grid / List 切換 / 12 類分類篩選 / 頁內搜尋 / 個人釘選（上限 20）/ PinnedStrip / **Header pill toggle 新舊版切換（v3.4）**；詳見 §13.8 |
| **Search App（Header 右上角）** | ✅ focus 時預設展示已釘選應用；輸入關鍵字後全目錄搜尋，釘選項目排前 |
| KPI 報表中心 | ✅ 左側書籤 + 右側 mock 報表（KPI Cards + 趨勢圖 + 異常摘要） |
| AI Chat | ✅ 含 Prompt 模板 / Q&A / 知識貢獻轉存 |
| Ask AI 串連 | ✅ Priority Feed 卡片 + KPI toolbar；Context Badge 預設收起 |
| 交班中心 Sprint 1 + 2 | ✅ 詳見 §13.5 |
| Task Management | ✅ 成員總覽列 / 快速派工面板（多人多行）/ 平面列表 + Drawer / 歷史 7 天；詳見 §13.6 |
| **Setting 後台** | ✅ **Personal 區（深色模式 toggle / 語言 / 字型）全角色可見** + Section 管理區（5 tabs，僅 Seed）+ **IT 管理區（APP 管理 tab，僅 IT Admin）**；詳見 §13.9 / §13.10 / §13.11 |
| **Dark Mode** | ✅ ThemeContext + Shell（Nav + Header）全套深色；詳見 §13.10 |
| KnowledgePage / SkillManagementPage | 🚧 元件已建立，**未掛載主 Nav** |
| MustBeZeroStrip | 🚧 元件已建立，**未掛載 DashboardPage** |

**功能缺口（依優先順序）**：

| 優先 | 缺口 | 說明 |
|------|------|------|
| P1 | Task AI 自動標記 | 派工後機台 / Chamber / Recipe 自動推斷，目前為 `aiTags: true` placeholder |
| P2 | 課長 Persona | `aggregated-kpi` + `decision-queue` Widget 組合，目前未實作 |
| P2 | 製程課 / 製造課任務資料 | tasks.js 目前僅設備課有完整 mock data |
| P3 | 課的應用帶參數跳轉 | 應用磚塊全為靜態，deep-link 未實現 |
| P3 | 我的最愛 | Personal Zone 暫時僅有 Priority Feed |

**Widget 架構**：目前為 Component 級靜態模擬，尚未建立正式 Widget Contract。

### 13.5 交班中心設計決議（Sprint 1 基準）

**核心概念：班對班，不是人對人**。公司交接的單位是「班」，不是個人。交班頁面標題為「日班 → 小夜班」，採全頁面設計（不用 Modal），有儀式感。班別固定命名：日班（08:00–16:00）/ 小夜班（16:00–00:00）/ 大夜班（00:00–08:00），輪替：日 → 小夜 → 大夜 → 日。

**交班內容範圍（課為單位）**：

| 區塊 | EE | PE | MFG |
|------|----|----|-----|
| KPI 今日表現 | ✅ | ✅ | ✅ |
| 機台事件（AVL/PM/Down Tool）| ✅ | — | — |
| 製程事件（OOC/Hold Lot）| — | ✅ | — |
| 產線事件 | — | — | ✅ |
| Case Center 重點 Case | ✅ | ✅ | ✅ |
| 當班交辦事項（P1/P2）| ✅ | ✅ | ✅ |

**Case Center 五欄格式**（不可簡化）：問題描述 / 已做的檢查 / 檢查結果 / 已做的處置 / 後續動作。對應公司現行 Case Center 五格規範。

**Sprint 1 已完成**：4 階段狀態機、每區塊獨立確認 + 補充說明欄、進度條（n/total）、送出存檔 Banner、「重新發起」功能。

**Sprint 2 已完成**：

歷史記錄 tab 採左右雙欄佈局（與 KPI 報表中心同邏輯）。Header 新增膠囊式 tab 切換器，在「本班交班 日→小夜」與「歷史記錄」之間切換，不離開交班頁面。

左側（312px）：關鍵字搜尋 + 班別 filter chips（全部 / 日班 / 小夜班 / 大夜班）+ 日期分組時間線。每筆記錄卡片顯示班別標籤（色彩區分三班）、時間、發起人、首條摘要；有未結 Case 或 P1 交辦時顯示紅色 / 黃色 stats chip。

右側：詳情面板，含班別標籤、四項統計數字（Case 件數 / 未結 Case / P1 交辦 / 事件數）、完整摘要 bullets、補充說明（以黃色 badge 標示）。無說明時顯示「本次交班無補充說明」。

三課（EE / PE / MFG）各有 5 筆跨 3 天的 mock 記錄，呈現連貫的跨班故事（例如 EE 的 E-308 感測器問題橫跨 4/17–4/19 三個班次）。

**Dashboard bulletin 整合**：`handoverRecord` 提升至 App 層。交班中心全頁流程（Sprint 2）與 Dashboard 快速 Modal（既有）送出後，均呼叫同一個 `onHandoverSubmit` callback，記錄即時出現在 Dashboard 課佈告欄頂部（置頂 + 未讀高亮）。

---

### 13.6 Task Management 設計決議（v2.5）

#### 背景與定位

現行派工透過 Excel 執行，條列式快速有效，但缺乏：可視化的完成度追蹤、歷史查詢、跨成員的統一視圖。Task Management 頁面定位為**課長的派工中心**，不取代 Excel 的操作習慣，而是把條列式派工搬進 Portal 並加上追蹤能力。

入口有兩處：左側 Nav「Tasks」直接進入；Dashboard 右側個人任務區的「查看全部」可帶入個人篩選跳轉（`initialFilter` props）。

#### 頁面結構

```
┌────────────────────────────────────────────────────────────┐
│  Header（56px）：Task Management / 課名                      │
├────────────────────────────────────────────────────────────┤
│  成員摘要列（永遠顯示）：全部成員 | 王志明 | 吳志豪 | 張文凱   │
│  每張卡顯示：任務數 / 逾期數 / 進行中數 / 完成率進度條         │
├────────────────────────────────────────────────────────────┤
│  Tab 列（40px）：進行中 ○ | 歷史紀錄 ○   [狀態篩選] [＋派工]  │
├────────────────────────────────────────────────────────────┤
│  全寬平面任務列表（依成員分組 / 歷史依日期分組）               │
│  ┌──────────────────────────────────────────────┐          │
│  │ ● 王志明  任務標題…  P1  E-308  HV-03   04/20 ›│ ← 點擊  │
│  └──────────────────────────────────────────────┘          │
│                                           ┌──────────────┐ │
│                                           │  Task Drawer │ │
│                                           │  （400px）   │ │
│                                           └──────────────┘ │
└────────────────────────────────────────────────────────────┘
```

**關鍵 UX 決議**：
- **成員摘要列永遠顯示**，Tab 切換不隱藏成員卡，避免版面跳動
- **全寬平面列表 + 右側 Drawer**（Notion side peek 模式），取代左右分欄設計，可擴充至 15+ 人規模
- **Header 固定 56px**，與 KPIPage 一致，右側浮動搜尋列不遮擋頁面標題

#### 快速派工（AssignPanel）

**觸發**：點擊「＋ 派工」展開全寬面板，完全取代列表區域（非 Modal）。

**設計原則**：對齊課長現行 Excel 操作習慣——逐人、逐行、快速輸入。

**互動流程**：
1. 面板展開，顯示課內所有成員（各一個區塊）
2. 每個成員預設一個空白輸入行，可點「＋ 加一筆」對同一成員新增多行
3. 每行僅填：任務描述 + 優先級（P1/P2/P3）+ 截止日
4. **機台 / Chamber / Recipe 不在派工時填寫**，由 AI 事後自動標記（顯示「AI標記中」badge）
5. 確認派工按鈕顯示已填筆數，送出後一次建立所有任務

**AI 自動標記設計意圖**：派工時要求工程師填選設備資訊會增加操作摩擦，且課長通常不清楚每台設備當下 Chamber / Recipe 的確切狀態。設計上由 AI 根據任務描述文字與設備歷史記錄自動推斷並附加 tag，人工填寫僅需任務描述。（目前為 `aiTags: true` placeholder，待 AI 串接後實作。）

#### Task Drawer（右側展開）

點擊任意任務行，從右側滑入固定寬度（400px）的詳情 Drawer：
- 基本資訊格（截止日 / 機台 / Chamber / Recipe / 派工人 / 建立日）
- 可編輯備註欄
- 狀態推進按鈕（未開始 → 進行中 → 已完成，單向推進）
- 同成員的其他任務快覽（最多 4 筆）
- Drawer 浮於列表上方（`position: absolute`），不壓縮列表寬度

#### 資料結構（tasks.js）

```js
{
  id: 'T-001',
  title: '任務描述',
  assignee: '吳志豪',        // 固定課內名單選取
  machine: 'E-101',          // '—' 表示未指定；aiTags:true 時等待自動填入
  chamber: 'CHA',
  recipe: 'CMP-Standard',
  status: 'pending' | 'in_progress' | 'done' | 'overdue',
  priority: 'P1' | 'P2' | 'P3',
  dueDate: 'YYYY-MM-DD',
  createdAt: 'YYYY-MM-DD',
  createdBy: '王志明',
  note: '',
  aiTags: true,              // 選填，表示機台資訊待 AI 自動補充
  completedAt: 'YYYY-MM-DD', // 選填，狀態改為 done 時寫入
}
```

Mock data 涵蓋：進行中任務 7 筆（含各狀態）、歷史紀錄 11 筆（跨 7 天 04/14–04/20）。目前僅設備課（ETC 設備課）有完整資料，製程課與製造課為空白 stub 待後續補充。

#### 未解決問題（Task Management 專屬）

| # | 問題 | 重要性 |
|---|------|--------|
| TM-OQ-1 | AI 自動標記機台 / Chamber / Recipe 的觸發時機與信心閾值 | 高 |
| TM-OQ-2 | 任務與 Case Center 工單的關聯機制（一對一 or 一對多）| 中 |
| TM-OQ-3 | 成員視角（非課長）看 Tasks 時，是否應隱藏他人任務 | 中 |
| TM-OQ-4 | 任務逾期通知機制（Portal 內通知 or 整合廠區通報系統）| 中 |
| TM-OQ-5 | 製程課與製造課的任務欄位是否與設備課完全對齊（MFG 無 Chamber / Recipe 概念）| 低 |

---

### 13.7 Scheduling 設計決議（v2.6）

#### 背景與定位

Scheduling 是 Portal 的課級 AI 自動化排程系統。各課工程師可自行編寫 Skill（含 MCP tool 呼叫邏輯），並設定定時執行條件。Skill 執行過程以「對話」作為執行容器，保有完整的推理上下文。

**核心約束**：MCP tool 僅能在人工確認後才被呼叫。AI 在執行過程中不得自主呼叫 IT 提供的工具，所有寫入/提交/修改動作均需經過課員明確確認，查詢類 tool 由 Skill 作者於 Skill 設計時決定是否需要人工確認。

#### Skill 執行模型

```
課自訂 Skill（邏輯 + MCP tool 宣告）
    ↓ 排程時間到，觸發新對話
    ↓ AI 在對話 context 內逐步推理
    → 遇到需要呼叫 MCP tool 的決策點 → 暫停，等待人工確認
    → 人工確認後 → tool 被呼叫 → 繼續執行
    → 全部完成 → 產出結果，記錄至執行歷史
```

**執行容器**：每次排程觸發即開啟一個新的 AI 對話。MCP tool 為短時查詢/執行型，不存在 tool 長時間等待問題；等待期間為純粹的「對話等待人輸入」狀態，無技術層面 timeout 問題。

#### Human-in-the-loop 設計

**觸發條件**：AI 在 Skill 執行過程中，遇到需呼叫 MCP tool 的決策點時，自動暫停並發出「待確認」訊號。

**決策類型**（v2.6 實作範疇）：確認執行 / 拒絕 / 延伸討論（三選一）。

**認領機制（Claim-first）**：

頁面預設顯示步驟內容與說明，不直接出現 Action 按鈕。課員需先點擊「✋ 我來處理」主動認領，認領後：
1. Server 端寫入鎖定（first-write-wins，同時點擊時第一人獲鎖）
2. 鎖定者見到三個 Action 按鈕
3. 其他課員見到「OOO 處理中」，按鈕 disabled
4. 鎖定者執行任一 Action 後自動解鎖

選擇此方案（Claim-first）理由：避免「只是看一眼卻誤鎖」的副作用，也避免多人同時觸發 MCP tool 的競態風險，符合廠區「接任務前先說我來」的工作文化。

**三種 Action 語意**：

| Action | 結果 |
|--------|------|
| ✓ 確認執行 | MCP tool 被呼叫，Skill 繼續執行下一步 |
| ✕ 拒絕 | Skill 終止，記錄拒絕者與原因，可補填說明文字 |
| 💬 延伸討論 | 此次排程執行記錄為「延伸討論」並結束；介入者跳轉至 AI Chat，以本次執行的完整 context（步驟紀錄 + 決策點說明）開啟新對話，轉為成員與 AI 的直接互動 |

#### 課級共見設計

Scheduling 是**課**的功能，不是個人功能。

- 排程由 Skill 作者（課員）建立，任何課員均可看到排程清單與執行狀態
- 待確認項目以**紅點**標示：Schedule 頁面左側 item 紅框 + Nav icon badge
- 任何課員均可進入認領處理，不限定特定人
- 執行紀錄中清楚顯示「誰在哪個步驟做了什麼決策、何時」，支援多人多決策點場景

#### 頁面結構

```
┌────────────────────────────────────────────────────────────┐
│  Header（56px）：Scheduling / 課名                           │
├──────────────────┬─────────────────────────────────────────┤
│  排程清單（312px） │  右側詳情                                │
│                  │  ┌─────────────────────────────────┐    │
│  ● SPC 異常日報  │  │  ⚠ 當前執行待確認 Banner          │    │
│    每日 07:50    │  │  （步驟清單 + Claim/Action 區）    │    │
│    待確認 🔴     │  └─────────────────────────────────┘    │
│                  │                                         │
│  ● FDC 異常摘要  │  執行紀錄（可展開步驟詳情）               │
│    每日 08:00    │  ├ 今日 07:50 ⏸ 待確認                  │
│    正常          │  ├ 04/20 07:50 ✓ 完成                   │
│                  │  ├ 04/19 07:50 ✓ 兩人決策               │
│  ● PM 到期提醒   │  ├ 04/17 07:50 💬 延伸討論              │
│    每日 07:00    │  └ 04/16 07:50 ✕ 已拒絕                 │
│    正常          │                                         │
└──────────────────┴─────────────────────────────────────────┘
```

#### 程式碼現況

| 項目 | 說明 |
|------|------|
| `src/data/scheduling.js` | 三課 mock data（設備課 3 項、製程課 2 項、製造課 2 項），涵蓋成功、失敗、待確認、延伸討論、已拒絕等全部狀態 |
| `src/components/SchedulingPage.jsx` | 主頁面元件，含左側清單、Intervention Banner、Claim 鎖定流程、執行歷史可展開步驟、延伸討論跳轉 AI Chat |
| `App.jsx` | Nav 加入 scheduling（Tasks 後）、時鐘 SVG icon、badge 邏輯、SchedulingPage render |

#### 未解決問題（Scheduling 專屬）

| # | 問題 | 重要性 |
|---|------|--------|
| SCH-OQ-1 | Claim 鎖定的 timeout 時間與自動釋放機制（建議 15 分鐘無操作自動釋放）| 高 |
| SCH-OQ-2 | Skill 的編寫介面與 MCP tool 授權管理（IT 如何發布 tool，課員如何選用）| 高 |
| SCH-OQ-3 | 排程執行的對話 context 持久化儲存規格（session 層 or Portal 後端另存）| 高 |
| SCH-OQ-4 | 「延伸討論」後，AI Chat 的對話結果是否能回寫至 Scheduling 執行紀錄 | 中 |
| SCH-OQ-5 | 排程失敗（MCP tool 錯誤）的通知機制與重試策略 | 中 |
| SCH-OQ-6 | 排程建立與編輯的 UI（目前「＋ 新增」與「編輯排程」按鈕為 placeholder）| 中 |

---

### 13.10 Dark Mode 設計決議（v3.1）

#### 架構選型

Dark mode 採用 React Context（`ThemeContext`）+ JavaScript theme token 物件方案，而非純 CSS Custom Properties。原因：原型所有元件使用 inline styles，CSS 無法覆蓋 inline style；Context 方案可精確控制每個色彩 token。

**ThemeContext** 定義於 `shared.jsx`（最先載入），所有元件均可透過 `useTheme()` hook 取得：
- `isDark`：布林值，目前是否為深色模式
- `C`：當前 theme 的色彩 token 物件（`LIGHT_COLORS` 或 `DARK_COLORS`）
- `toggle`：切換 dark / light 的 callback

#### Token 設計

| Token | Light | Dark |
|-------|-------|------|
| `bg` | `#FFFFFF` | `#0F172A` |
| `bgPanel` | `#F5F5F5` | `#1E293B` |
| `bgSub` | `#FAFAFA` | `#162032` |
| `border` | `#E0E0E0` | `#334155` |
| `text` | `#222222` | `#F1F5F9` |
| `textSub` | `#374151` | `#CBD5E1` |
| `textMuted` | `#9E9E9E` | `#64748B` |
| `accentBlue` | `#2563EB` | `#3B82F6` |

#### 已套用範圍（v3.1）

| 元件 | 狀態 |
|------|------|
| App shell（左側 Nav、頂部 Header 列）| ✅ 全套 |
| Setting 頁面（左側 nav、右側容器）| ✅ 全套 |
| Personal 設定 tab | ✅ 全套 |
| Body CSS base（`.card`、`.nav-btn` 等 CSS class 元件）| ✅ CSS 覆蓋 |
| 其他頁面（Dashboard、KPI、Chat 等）| 🚧 部分（後續版本逐步補齊）|

#### Body class 同步

`App.jsx` 在 `isDark` 狀態變更時同步執行 `document.body.classList.toggle('dark-mode', isDark)`，確保 CSS 類別方案（`.card` 等）同步切換。

#### Setting 可見性變更

**決議（v3.1）**：Setting 圖示改為全角色（非僅 Seed）可見，原因是 Personal 設定（深色模式）為個人化功能，不應限制為 Seed 專屬。Setting 左側 nav 以分組區分：

```
Setting 後台（左側 200px nav）
  ─── Personal（所有用戶）
  │  └── 個人偏好（深色模式、語言、字型大小）
  ─── Section 管理（僅 Seed 可見）
  │  ├── 權限管理
  │  ├── 課佈告欄
  │  ├── KPI Summary
  │  ├── Application
  │  └── 知識管理
  ─── IT 管理（僅 IT Admin 可見）[IT Only badge]
  │  └── APP 管理（Function Tree 三層 CRUD）
```

---

### 13.9 Setting 後台設計決議（v2.9）

#### Setting 整體架構

Setting 後台採左側 tab nav + 右側內容區佈局，僅具備 Seed 角色的使用者可進入。共五個 tab，無 icon 標示：

```
Setting 後台（左側 200px nav）
  ├── 權限管理      → 成員管理 / 角色配置 / 存取限制
  ├── 課佈告欄      → 公告 CRUD（發布 = Home 可見）
  ├── KPI Summary   → KPI 啟停與告警閾值設定
  ├── KPI 報表管理  → 報表來源設定（URL / EDA3）/ 分組拖曳排序（v3.9 新增）
  ├── Application   → 應用分組管理
  ├── 知識管理      → Skill 匯入 / RAG / 簽核流程
  └── 首頁排版      → Row-Based Widget 管理（v3.7 新增）
```

#### 1. 權限管理

**三角色定義**：

| 角色 | 說明 | 取得方式 |
|------|------|----------|
| **Seed** | 完整管理與配置權限，可邀請成員、變更角色、配置各 Tab 設定 | 手動指派；課長預設自動成為 Seed |
| **Member** | 可存取並編輯課內資料（Dashboard / KPI / AI Chat / Skill 編輯 / 排程建立）| By User 個別加入；本課組織成員預設為 Member |
| **Viewer** | 唯讀權限，僅限查看，不可編輯任何資料 | By User 個別加入 |

**加入方式：純 By User（個人帳號）**

**決議（v2.9）**：移除 By Group（以組織為單位加入）的設定選項。成員加入統一以個人帳號指定（By User），避免組織架構異動自動影響課內權限邊界。課長帳號系統自動預設為 Seed，不可移除。

**預設規則**：
1. 課長帳號自動加入 **Seed** 角色，標示「預設」badge，不可刪除
2. 其餘成員由 Seed 以個人帳號逐一邀請，可設定角色（Member / Viewer）

**權限矩陣**：

| 功能 | Seed | Member | Viewer |
|------|------|--------|--------|
| 查看成員列表 | ✓ | ✓ | ✓ |
| 邀請 / 移除成員 | ✓ | — | — |
| 變更成員角色 | ✓ | — | — |
| 編輯 Dashboard | ✓ | ✓ | — |
| 存取 KPI 資料 | ✓ | ✓ | ✓ |
| 管理知識庫 | ✓ | — | — |
| 新增 / 編輯 Skill | ✓ | ✓ | — |
| 查看 Skill | ✓ | ✓ | ✓ |
| 發布課內公告 | ✓ | — | — |
| 使用 AI Chat | ✓ | ✓ | ✓ |
| 建立排程任務 | ✓ | ✓ | — |

**UI 結構（成員管理 sub-tab）**：

```
成員管理 tab
  ├── Section 資訊列（課名 / Seed 數 / Member 數 / Viewer 數）
  ├── [Seed]   可展開 ─── By User 人員列表 + 新增成員
  ├── [Member] 可展開 ─── By User 人員列表 + 新增成員
  └── [Viewer] 可展開 ─── By User 人員列表 + 新增成員
角色配置 tab → 功能 × 角色 權限矩陣（唯讀）
存取限制 tab → 封鎖帳號列表
```

#### 2. 課佈告欄

Seed 在此 tab 管理課內所有公告，提供完整 CRUD 操作。

**公告欄位**：標題、內文、對象標籤（全員 / EE / PE / MFG）、置頂開關、作者（自動填入 Seed 帳號）。

**狀態機**：草稿（Draft）↔ 已發布（Published）。**發布 = 即時顯示於 Home 課佈告欄 Widget**，下架退回草稿後即從 Home 消失。草稿僅 Seed 在 Setting 內可見。

**操作**：新增（表單展開於列表上方）/ 編輯 / 發布 / 下架 / 刪除。儲存時可選「儲存草稿」或「儲存並發布」。

#### 3. KPI Summary

直接呈現 `KwiWidgetSettingView`（原 Dashboard 編排的 KPI 子頁），Seed 可：
- 啟停各 KPI 項目
- 設定黃色警示與紅色告警閾值
- 拖曳調整顯示順序
- 右側即時預覽 Widget 在 Home 的呈現效果

#### 4. Application 管理

取代舊版平面應用清單，改為**分組管理**設計：

**設計決議**：Seed 可自由建立命名群組（如「EE 核心工具」、「跨課協作」），將課級應用分配至不同群組。群組結構直接反映於 Home Dashboard 課的應用 Widget 的排列方式。

**操作**：
- 新增群組（自訂名稱）/ 重命名 / 刪除群組
- 每個群組內：加入應用（從 APP Library 選取）/ 移除應用 / 設定必選標記
- 必選應用推送至課內所有成員的捷徑，不可被個人移除

**必選標記邊界**：必選是課的集體規範，個人無法在 APP Center 取消釘選必選應用。

#### 5. 知識管理

沿用現有 `SkillManagementPage` 元件，暫無改動。Skill 簽核流程：Draft → Testing → Approving → PI Run → Production。

---

### 13.8 APP Center 設計決議（v3.4 更新）

#### 背景與定位

Portal 的長期目標是取代 ECP（公司內部 15 年歷史全廠入口），其核心功能之一是成為全廠 IT 應用的統一入口。APP Center 是這個定位的直接實現：一個以個人需求為核心的應用目錄，取代 ECP 的 function tree 設計。

**三個應用相關功能的職責分工（v2.7 最終決議）**：

| 功能 | 位置 | 管理主體 | 定位 |
|------|------|----------|------|
| 課的應用 Widget | Dashboard Section Zone | Seed | 課級標準工具清單，全課成員一致，強調集體規範 |
| ~~我的釘選 Widget~~ | ~~Dashboard Personal Zone~~ | — | **已移除（v2.8）**。Personal Zone 聚焦 Priority Feed |
| APP Center | Nav 第 2 位 | 個人 | 全公司應用目錄，個人釘選管理（上限 20），唯一設定入口 |

> **設計原則**：釘選動作只在 APP Center 發生。Dashboard 我的釘選 Widget 已於 v2.8 移除，避免雙頭管理造成認知負擔。釘選的應用可透過 Header 右上角 Search App 快速存取（focus 時預設展示）。

#### 功能規格

**應用目錄**：包含全公司 IT 提供的應用程式（百餘個），不含報表（報表屬 KPI 頁範疇）。每個應用卡片顯示：名稱、功能說明、物件分類標籤。

**個人釘選**：
- 上限 20 個，超過提示無法繼續釘選
- ~~釘選後同步至 Dashboard 個人區（顯示前 6 個）~~（已移除，v2.8）
- Header 右上角 Search App 搜尋欄 focus 時，預設展示已釘選應用（最多 8 筆）；輸入關鍵字後切換為全目錄搜尋，釘選應用排序優先
- 釘選的應用在搜尋結果中優先顯示

**分類體系（物件 / 目的導向，共 12 類）**：值班管理、機台參數、裝機維修、製程監控、良率分析、異常處理、排程產能、設備保養、文件Skill、工單管理、環安衛、物料備品。刻意不以角色（EE / PE / MFG）分類，因同一應用可能跨角色使用。

**視圖切換**：Grid（預設，適合瀏覽發現）/ List（適合目標查找）。

**頁內搜尋**：即時篩選名稱與描述，與分類 chips 聯動。

#### 新舊切換機制（v3.4 更新）

**背景**：使用者反映新版（搜尋 / 分類 / 卡片）與舊版（ECP Function Tree）同頁顯示混亂，且兩者內容並不完全相同（估計約 60% 重疊，40% 差異：部分舊版小功能已在新版整合為更大的應用入口）。

**設計決策**：以「新版為主，舊版為逃生出口」原則，採 **iframe 嵌入 + Header Toggle** 方案，而非 Tab 並排（Tab 暗示兩者地位相等，不利後續退役舊版）。

| 狀態 | 呈現 |
|------|------|
| 新版（預設） | 搜尋列、分類 chips、已釘選區塊、App 卡片 Grid/List；**Header「應用程式」標題右側膠囊 toggle（新版 ⟷ 舊版），文字標籤隨狀態 accent 色高亮** |
| 舊版 iframe | 整個內容區被 iframe 覆蓋；**左上角**保留 FunctionTreeBtn（☰，點擊展開 Function Tree）；切換回新版只需再撥 Header toggle，無額外浮動按鈕 |

**v3.4 變更說明（相對於 v3.3）**：

| 項目 | v3.3 | v3.4 |
|------|------|------|
| `legacyMode` state 位置 | `AppCenterPage` 內部 | 上提至 `App.jsx` |
| 切換入口 | 搜尋列右側「舊版 ↗」ghost 按鈕 | Header Bar 標題右側 pill toggle |
| 回新版方式 | 舊版 iframe 右上角浮動「← 回新版」按鈕（`position: absolute`） | 撥回 Header toggle，無浮動按鈕 |
| 視覺層次 | 三層可能（Nav + iframe bar + 浮動按鈕）| 兩層（Nav + iframe bar），更簡潔 |

**Toggle 規格**：
- 位置：Header Bar，`{nav === 'apps'}` 時，標題文字「應用程式」右側，spacer 之前
- 樣式：36×20 膠囊，滑動圓點；`legacyMode = false` 時灰底、「新版」accent 色高亮；`legacyMode = true` 時 accentColor 底色、「舊版」accent 色高亮
- 動畫：`background` 與 `left` 各 0.2s transition

**切換邏輯（v3.4）**：
- `legacyMode` state 定義於 `App.jsx`，以 prop 傳入 `AppCenterPage`
- `AppCenterPage` 根據 `legacyMode` prop 決定渲染新版 UI 或舊版 iframe 佔位區
- `AppCenterPage` 不再持有切換 state，只負責按 prop 渲染

**退役策略**：未來要下架舊版時，只需移除 Header toggle 元件及 `AppCenterPage` 的 legacy branch，不影響新版任何佈局結構。

#### 明確排除範圍（v2.7）

- **報表不進 APP Center**：Power BI、Excel、Web Report 等報表類資源屬 KPI 頁範疇，APP Center 僅收錄功能性應用程式，避免混淆「工具」與「報表」。
- **Seed 的課級應用管理仍在 Setting 後台**：APP Center 個人釘選不影響 Seed 配置，兩個治理層完全獨立。

#### 未解決問題（APP Center 專屬）

| # | 問題 | 重要性 |
|---|------|--------|
| APP-OQ-1 | APP Center 應用清單由誰維護（IT 統一 vs. 各系統 owner 自行申請上架）| 高 |
| APP-OQ-2 | ~~釘選上限 12 的 UX 處理~~ → 上限已調整為 20，超限提示已實作 | 已處理 |
| APP-OQ-3 | Search App focus 釘選預覽已實作；全站 ⌘K 快捷鍵尚未實作 | 中 |
| APP-OQ-4 | 應用帶參數跳轉規範：各 IT 系統是否支援 deep-link，需逐一確認 | 高 |
| APP-OQ-5 | 三課（EE / PE / MFG）是否看到同一份應用目錄，或依角色過濾預設分類 | 中 |

---

### 13.11 Function Tree 與 IT APP 管理設計決議（v3.2）

#### 背景

舊版 ECP 以 function tree 方式呈現全廠 IT 功能，Portal 需在不複製 ECP 架構的前提下，提供一套由 IT 統一管理、前台工程師可快速瀏覽的功能導覽機制。

#### Function Tree 結構（三層）

```
第一層：大分類（例：設備管理）
  第二層：子系統（例：保養系統）
    第三層：功能項目（例：工單管理）+ 系統名稱 tag（例：ePMM）
```

資料層定義於 `src/data/apps.js` 的 `DEFAULT_FUNCTION_TREE`，狀態提升至 `App.jsx`，供前台（AppCenterPage）與後台（SettingPage IT APP管理）共用同一份資料源。

#### 前台 — Function Tree 入口（v3.4 更新）

> **v3.4 變更**：切換入口從搜尋列「舊版 ↗」ghost 按鈕改為 Header Bar pill toggle。詳見 §13.8 新舊切換機制。

**v3.4 後的前台入口路徑**：
1. 使用者在 APP Center 的 Header Bar，撥動「應用程式」標題右側的 **新版 ⟷ 舊版** toggle 至「舊版」
2. 頁面切換為 iframe 模式（整個內容區）
3. iframe 左上角出現 FunctionTreeBtn（☰），點擊展開浮動 Dropdown

**Function Tree Dropdown 規格（不變）**：
- **互動**：點擊展開浮動 Dropdown，點外部關閉
- **展開預設**：L1 大分類預設展開，L2 子系統預設收合，L3 功能項目顯示於 L2 展開後
- **篩選**：Dropdown 只顯示 `enabled: true` 的功能；空子系統與空大分類自動隱藏
- **系統名稱**：L3 功能項目右側顯示 monospace 灰底 tag（例：`ePMM`）

**v3.2 決策記錄（已變更）**：v3.2 時 FunctionTreeBtn 位於搜尋欄左側，因使用者反映與新版功能同頁造成混亂，於 v3.3 調整為透過 iframe 切換進入。

#### IT 後台 — APP 管理（Setting 第三區）

Setting 側欄新增第三區「IT 管理」，旁附紫底 `IT Only` badge，僅 `role === 'IT Admin'` 的使用者可見。

**APP 管理 tab 功能**：

| 操作 | 說明 |
|------|------|
| 新增大分類 | 輸入名稱，建立 L1 節點 |
| 新增子系統 | 選擇所屬大分類 + 輸入名稱，建立 L2 節點 |
| 新增功能 | 選擇大分類（L1）→ 選擇子系統（L2，cascading）→ 輸入功能名稱 + 系統名稱（選填），建立 L3 節點，預設 `enabled: true` |
| 啟用 / 隱藏 Toggle | 每個 L3 功能獨立控制，關閉後從前台 Dropdown 消失 |
| 刪除功能 | L3 單筆刪除，需 `confirm` 確認 |
| 刪除子系統 | 含子功能數量提示，需 `confirm` 確認 |
| 刪除大分類 | 含子系統數 + 總功能數提示，需 `confirm` 確認 |

**統計列**：Tab 頂部顯示大分類數 / 子系統數 / 功能總數 / 前台展示數，讓 IT 管理員即時掌握全局。

#### 程式碼現況

| 檔案 | 說明 |
|------|------|
| `src/data/apps.js` | `DEFAULT_FUNCTION_TREE`：5 大分類、14 子系統、35 功能；結構 `{ id, label, order, children: [{ id, label, order, items: [{ id, label, system, enabled, order }] }] }` |
| `src/components/AppCenterPage.jsx` | `FunctionTreeBtn` 元件（含 Chevron、3 層渲染、visibleTree 過濾）；接收 `legacyMode` **prop**（v3.4，不再持有 state）；legacy branch 渲染 iframe 佔位區 + FunctionTreeBtn；搜尋列與 iframe 均無切換按鈕 |
| `src/components/SettingPage.jsx` | `AppManagementTab` 元件（統計 / 三層 CRUD / cascading select） |
| `src/components/App.jsx` | `functionTree` state + `legacyMode` state（v3.4 新增，驅動 Header toggle 與 AppCenterPage）+ `isIT()` 判斷 + props 傳遞至 AppCenterPage / SettingPage |
| `src/data/personas.js` | `it` persona（role: 'IT Admin', accentColor: '#7C3AED'）|

#### 待處理問題（v3.2 新增）

| # | 問題 | 重要性 |
|---|------|--------|
| IT-OQ-1 | Function Tree 功能項目點選後的行為：純展示 / 導航至 APP Center 對應應用 / 直接跳轉系統？ | 高 |
| IT-OQ-2 | Function Tree 資料是否需持久化儲存（目前為 in-memory state，重整後回到預設）| 高 |
| IT-OQ-3 | L3 功能項目是否需支援排序（目前只能新增刪除，無拖曳排序）| 中 |
| IT-OQ-4 | IT 管理員與 Seed 的邊界：Seed 是否有部分功能目錄的修改權？ | 中 |
| IT-OQ-5 | Function Tree 是否應依 Persona（EE / PE / MFG）過濾不同功能子集 | 低 |

---

### §13.12 Home Operations Monitor（v3.5）

**背景與動機**

廠區工程師（設備、製程）在班中最常見的緊急資訊——機台異常、高優先案件、Lot Hold——分散在 FDC Console、Case Center、MES 等系統，需要逐一切換才能掌握全局。v3.5 在 Section Home 新增 Operations Monitor 區塊，讓工程師進站後「第一眼」即可掌握當下最需要關注的事，不必等通知、不必跨系統巡邏。

---

#### 13.12.1 版面配置

```
┌──────────────────────────────────────┐
│  Bulletin / Announcement             │  ← 原有
├──────────────────────────────────────┤
│  Tool Status Widget  （全寬）        │  ← 新增 v3.5
├─────────────────────┬────────────────┤
│  Case Widget (1/2)  │ Lot Hold (1/2) │  ← 新增 v3.5
├──────────────────────────────────────┤
│  KPI Summary        （非設備課）     │
├──────────────────────────────────────┤
│  App Launcher       （非設備課）     │
└──────────────────────────────────────┘
```

- Tool Status 最重要，獨佔全寬，高度隨資料列數自適應。
- Case 與 Lot Hold 並排各佔 1/2 寬，允許高度不等（設備課 Case=5 / Lot=3）。
- 設備課（equipment persona）：移除 KPI Summary 與 App Launcher，讓 Operations Monitor 佔主要視野。
- 製程課（process persona）：三個 Widget 均顯示少量資料，KPI/App 保留。
- 製造課（mfg persona）：三個 Widget 均為 All Clear 狀態，KPI/App 保留。

---

#### 13.12.2 Widget 規格

##### Tool Status Widget

| 欄位 | 說明 |
|------|------|
| Tool ID | 機台代號，例如 `TARE03#2` |
| Chamber | 腔體識別，例如 `CH-B` |
| Status | `Down` / `Monitoring` / `PM`，正常 Run 不顯示 |
| Claim Memo | 系統自動標注的 down 理由，例如 `SPC defect issue, auto down tool — wafer W26-031 OOC at step DEP...` |
| Down Since | 異常開始時間 |
| Assignee | 負責工程師 |
| Quick Actions | 借機 / FOUP Transfer / 查看細節（點擊觸發對應操作或 popout） |

Status 色彩對應：

| Status | 背景色 | 邊框色 | 文字色 |
|--------|--------|--------|--------|
| Down | `rgba(239,68,68,0.08)` | `#EF4444` | `#B91C1C` |
| Monitoring | `rgba(245,158,11,0.08)` | `#F59E0B` | `#92400E` |
| PM | `rgba(107,114,128,0.08)` | `#9CA3AF` | `#374151` |

空狀態：單行置中灰字 `All tools are running well`（`fontSize: 12, color: #9CA3AF`）。

##### Case Widget

| 欄位 | 說明 |
|------|------|
| Priority | P1（紅）/ P2（橙），僅高優先顯示 |
| Subject | Case 標題 |
| Case Type | 例如 `FDC alarm`、`SPC OOC` |
| Tool ID | 關聯機台 |
| Lot ID | 關聯批號 |
| Case Link | 點擊跳轉至 Case Center |

空狀態：單行置中灰字 `No active high priority cases`。

##### Lot Hold Widget

| 欄位 | 說明 |
|------|------|
| Lot ID | 批號 |
| Hold Type | `MFG Hold` / `QA Hold` |
| Tool | 停留機台 |
| Station | 站點名稱 |

點擊任一列展開 Popout 顯示詳情。空狀態：單行置中灰字 `No lots on hold`。

---

#### 13.12.3 密度設計系統（Compact 規範）

所有 Widget header 與 row 統一以下規格（v3.5 起全站一致）：

| 層級 | padding | fontSize | fontWeight |
|------|---------|----------|------------|
| Widget Header | `8px 16px` | 13 | 600 |
| 資料列 / Item | `6px 16px` | 12–13 | 400 |
| Widget 間 gap | `8px` | — | — |

移除 Tool 欄位標頭列（Column Header Row），改以資料本身呈現語意，進一步壓縮視覺高度。

---

#### 13.12.4 Persona 行為矩陣

| Widget | 設備課 (equipment) | 製程課 (process) | 製造課 (mfg) |
|--------|--------------------|-----------------|-------------|
| Tool Status | 6 筆（Down×3、Monitoring×2、PM×1） | 1 筆（Monitoring） | All Clear |
| Case | 5 筆（P1×3、P2×2） | 1 筆（P1） | All Clear |
| Lot Hold | 3 筆（MFG×2、QA×1） | 1 筆 | All Clear |
| KPI Summary | **顯示（v3.7 恢復）** | 顯示 | 顯示 |
| App Launcher | **顯示（v3.7 恢復）** | 顯示 | 顯示 |

---

#### 13.12.5 程式碼現況

| 項目 | 說明 |
|------|------|
| 檔案 | `src/components/SectionPage.jsx` |
| Mock 資料 | `MOCK_TOOLS` / `MOCK_CASES` / `MOCK_LOTS`，以 `p.key`（equipment / process / mfg）為鍵取值 |
| 狀態色設定 | `TOOL_STATUS_CFG` 物件，per-status 定義 bg / border / dot / textColor |
| Grid 排版 | Tool 列：`gridTemplateColumns: '130px 64px 88px 1fr auto'` |
| Persona 條件渲染 | `{p.key !== 'equipment' && <KpiSummaryWidget ... />}` |
| Popout | `ToolDetailModal` / `LotDetailModal`，使用 `useState` 控制開關 |
| Build | `python3 build.py`，輸出至根目錄 `index.html` |

---

#### 13.12.6 待決事項

| # | 問題 | 優先級 |
|---|------|--------|
| OM-OQ-1 | Tool Quick Actions（借機 / FOUP Transfer）是否需串接真實系統 API？ | 高 |
| OM-OQ-2 | Case / Lot 資料更新頻率：polling 間隔？WebSocket？ | 高 |
| OM-OQ-3 | Tool Status 是否需支援依 Area（ETCH / CMP / CVD 等）過濾？ | 中 |
| OM-OQ-4 | Case 的 Case Link 跳轉：同頁 iframe 還是新分頁開啟？ | 中 |
| OM-OQ-5 | Lot Hold popout 是否需要「解 Hold」快速操作入口？ | 低 |

---

### §13.13 Home Layout 架構重構（v3.7）

#### 背景與動機

v3.5 引入 Operations Monitor 三個新 Widget（Tool / Case / Lot）後，Home 的 Widget 管理出現雙軌問題：built-in Widget（announcement / tool / case / lot / kpi / app）以 `builtinVisByPersona` boolean flags 控制顯示，custom Widget（自訂連結）則以 `linkWidgetsByPersona` 陣列管理，兩套 state 分離、Setting 後台亦無法統一編輯。v3.7 將兩套合一，重構為以「列」為基本單位的統一 Row-Based Layout 系統。

---

#### 13.13.1 資料模型（homeLayout）

```js
// 每個 persona 的 homeLayout 是一個列陣列
homeLayout: [
  { rowId: 'r-e-1', widgets: [{ slotId: 's-e-1', type: 'announcement' }] },
  { rowId: 'r-e-2', widgets: [{ slotId: 's-e-2', type: 'tool' }] },
  { rowId: 'r-e-3', widgets: [
    { slotId: 's-e-3a', type: 'case' },
    { slotId: 's-e-3b', type: 'lot' }
  ]},
  { rowId: 'r-e-4', widgets: [{ slotId: 's-e-4', type: 'kpi' }] },
  { rowId: 'r-e-5', widgets: [{ slotId: 's-e-5', type: 'app' }] },
  { rowId: 'r-e-6', widgets: [{ slotId: 's-e-6', type: 'custom', title: '...', html: '...' }] },
]
```

- **row**：對應一橫列，`widgets` 陣列內的 slot 並排顯示
- **slot**：每個 widget 佔位，`type` 決定渲染哪種 Widget；`custom` type 額外帶 `title` + `html` 欄位
- **built-in 與 custom 同格**：不再分兩套 state，全部統一於 `homeLayout` 陣列

#### 13.13.2 Widget 類型定義（HOME_WIDGET_TYPES）

取代舊版 `HOME_BUILTIN_DEFS`，統一管理所有可用 Widget 類型：

| type | label | singleton | settingTab | personas |
|------|-------|-----------|------------|---------|
| `announcement` | Announcement | ✓ | `bulletin` | 三課 |
| `tool` | 設備狀態監控 | ✓ | — | equipment only |
| `case` | Case Monitor | ✓ | — | 三課 |
| `lot` | Lot Hold | ✓ | — | 三課 |
| `kpi` | KPI Summary | ✓ | `kpi` | 三課 |
| `app` | 應用程式捷徑 | ✓ | `application` | 三課 |
| `custom` | 自訂連結 | ✗（可多個）| — | 三課 |

**singleton 約束**：Widget Picker 中已被使用的 singleton 類型顯示為 disabled，不可重複新增。

**personas 過濾**：Widget Picker 依當前課（`p.key`）過濾，只顯示符合課別的 Widget 類型。

#### 13.13.3 DEFAULT_HOME_LAYOUT（per-persona 預設值）

定義於 `SectionPage.jsx`，三課各有獨立的預設列結構：

| persona | 預設列順序 |
|---------|-----------|
| equipment | announcement → tool → [case + lot] → kpi → app → custom(×3) |
| process | announcement → [case + lot] → kpi → app → custom(×2) |
| mfg | announcement → [case + lot] → kpi → app → custom(×2) |

#### 13.13.4 渲染架構（renderHomeWidget）

`SectionPage.jsx` 的 `DashboardPage` 元件透過 `renderHomeWidget(slot, rp)` 分發渲染：

```js
function renderHomeWidget(slot, rp) {
  switch (slot.type) {
    case 'announcement': return <AnnouncementWidget ... />;
    case 'tool':         return <ToolStatusWidget ... />;
    case 'case':         return <CaseWidget ... />;
    case 'lot':          return <LotHoldWidget ... />;
    case 'kpi':          return <KpiSummaryWidget ... />;
    case 'app':          return <AppLauncherWidget ... />;
    case 'custom':       return <CustomWidget slot={slot} ... />;
    default:             return null;
  }
}
```

每列依 `row.widgets` 長度自動決定排版：1 個 widget 全寬、2 個以上各佔等比寬（Grid）。

#### 13.13.5 Setting 後台：HomeLayoutTab 改寫

**新 Props**：`{ p, homeLayout, onHomeLayoutChange, onNavigateToTab }`

移除舊版 `linkWidgets` / `builtinVisibility` props，全部統一由 `homeLayout` 驅動。

**左側面板（排版列表）**：
- 每列顯示列內 Widget chip（badge 式標籤），可點擊開啟右側編輯面板
- 每列帶「↑ / ↓ 移列」與「刪除列」按鈕
- 列底部「＋ 新增 Widget」按鈕觸發 Widget Picker Modal

**Widget Picker Modal**：
- 顯示符合當前課別的 Widget 類型卡片
- 已使用的 singleton 類型顯示 disabled（灰底 + "已使用"字樣）
- 選取後，新增 slot 至目標列；若新增 `custom` 類型，自動開啟右側編輯面板

**右側編輯面板（麵包屑式）**：

```
排版 / [Widget Label]       ← 麵包屑標題
─────────────────────────
built-in widget：
  └── 說明文字（desc）
  └── 「前往設定 →」按鈕（若有 settingTab，點擊透過 onNavigateToTab 跳轉）

custom widget：
  └── 標題輸入欄（localTitle）
  └── IsolatedEditor（contentEditable 富文字）
  └── 儲存 / 取消 Footer
```

**onNavigateToTab**：HomeLayoutTab 呼叫此 callback 可切換 SettingPage 的 activeTab，實現跨 Tab 導航（例如從「首頁排版」的 KPI Widget 編輯卡片直接跳轉至「KPI Summary」設定 Tab）。

#### 13.13.6 App.jsx 狀態整合

| 移除 | 新增 |
|------|------|
| `linkWidgetsByPersona` state | `homeLayoutByPersona` state |
| `builtinVisByPersona` state | — |
| `handleBuiltinVisChange` callback | `handleHomeLayoutChange` callback |
| `onLinkWidgetsChange` prop pass-through | `onHomeLayoutChange` prop pass-through |
| `onBuiltinVisibilityChange` prop pass-through | — |

`homeLayoutByPersona` 初始值取自 `DEFAULT_HOME_LAYOUT`（定義於 `SectionPage.jsx`），若未定義則退化為 `{ equipment: [], process: [], mfg: [] }`。

#### 13.13.7 Bug Fix：Custom Widget 編輯器 contentEditable 清空問題

**問題根因**：React 在 `onHomeLayoutChange` 觸發 App.jsx 狀態更新後，`HomeLayoutTab` 重新渲染，React 依 VDOM 規則（JSX 無 children）清空 contentEditable div 的 DOM innerHTML，導致編輯中的文字消失。雖然返回首頁後內容仍存在（已儲存至 state），但編輯器視覺體驗異常。

**三層修復方案**：

1. **`IsolatedEditor`（`React.memo(() => true)`）**：將 contentEditable div 包裝成永遠不因 parent re-render 重新渲染的子元件，React 無法對其 DOM 執行 reconcile 清空。
2. **`requestAnimationFrame` 保護**：`saveEdit` 函式在儲存後以 RAF 檢查 innerHTML 是否被清空，若清空則立即還原。
3. **`key={activeSlot.slotId}`**：切換不同 custom widget 時強制 remount `IsolatedEditor`，確保新 widget 的內容由 `useEffect` 正確載入，而非殘留上一個 widget 的 DOM 內容。

**`savedOk` 儲存回饋**：儲存後按鈕 1.5 秒變綠（`#16A34A`）並顯示「✓ 已儲存」，明確通知使用者儲存成功。

#### 13.13.8 程式碼現況

| 檔案 | 變動摘要 |
|------|---------|
| `SectionPage.jsx` | 新增 `DEFAULT_HOME_LAYOUT`（三課預設）、`renderHomeWidget()` dispatch、`DashboardPage` 改以 `homeLayout` prop 驅動渲染；移除 `linkWidgets` / `builtinVisibility` 消費邏輯 |
| `SettingPage.jsx` | `HOME_WIDGET_TYPES` 取代 `HOME_BUILTIN_DEFS`；`IsolatedEditor` 元件；`HomeLayoutTab` 全面改寫（widget picker、麵包屑右側面板、`onNavigateToTab`）；`SettingPage` 函式簽名更新 |
| `App.jsx` | 移除 `linkWidgetsByPersona` + `builtinVisByPersona`；新增 `homeLayoutByPersona` + `handleHomeLayoutChange`；更新至 `DashboardPage` + `SettingPage` 的 props |

#### 13.13.9 待決事項

| # | 問題 | 優先級 |
|---|------|--------|
| HL-OQ-1 | 列的排序目前僅有「↑ / ↓ 單步移動」，是否需要改為拖曳排序（dnd）？ | 中 |
| HL-OQ-2 | 同一列內的 widget 寬比（1:1 並排 vs. 自訂比例）是否需要支援設定？ | 中 |
| HL-OQ-3 | `homeLayout` 目前為 in-memory state，重整後回到 DEFAULT；正式版需持久化至後端 | 高 |
| HL-OQ-4 | Custom Widget 的 `html` 欄位是否需要 XSS sanitize 或白名單過濾？ | 高 |
| HL-OQ-5 | 設備課 KPI Summary / App Launcher 恢復後，v3.5 的 mock 資料是否已補全？ | 中 |

---

### §13.14 My Tasks 面板重構（v3.8）

#### 13.14.1 背景與動機

v3.7 以前，Personal Zone 的 My Tasks 以 **Widget 卡片**形態存在於右側 Panel 的 `overflowY: auto` 捲動容器內，導致兩個問題：

1. 卡片多時，標題列（刷新 / 新增按鈕）會隨捲動消失，操作入口無法常駐。
2. Widget 外框（border / borderRadius）與左側 Section Zone 的卡片視覺層級相同，缺乏「個人專屬工作區」的空間感。

#### 13.14.2 設計決議

| 項目 | 舊設計（v3.7） | 新設計（v3.8） |
|------|--------------|--------------|
| 形態 | Widget 卡片（有外框） | 全高面板（無框，與右側邊界齊平） |
| Header | 隨列表一起捲動 | 常駐（`flexShrink: 0`），永不被遮蓋 |
| 任務列表 | 整個右側容器捲動 | 面板內部獨立捲動（`flex: 1, overflowY: auto`） |
| 收合 | 不支援 | 支援：往右滑入收合，toggle tab 常駐於分隔線 |

#### 13.14.3 收合機制

- `rightOpen` state（預設 `true`）控制右側面板寬度：`296px` ↔ `0`，CSS `transition: width 0.25s ease`。
- Toggle tab：`position: absolute` 掛於分隔線（1px div）左側，`transform: translate(-100%, -50%)` 使其凸出至主內容區。
  - 展開時顯示 `›`（點擊 → 收合）；收合時顯示 `‹`（點擊 → 展開）。
  - Tab 尺寸：`14×48px`，`borderRadius: 6px 0 0 6px`（左圓右直貼線）。
  - 收合後 tab 仍可見，確保使用者能找回入口。

#### 13.14.4 元件結構

```
DashboardPage
├── LEFT — Section Zone (flex: 1, overflowY: auto)
├── Divider (1px, position: relative)
│   └── Toggle Tab (position: absolute, 凸出左側)
└── RIGHT — My Tasks Panel (width: 296|0, overflow: hidden, transition)
    └── PersonalPriorityFeed
        ├── Header (flexShrink: 0) — 標題 / 筆數 / ↻ / +
        └── Scrollable Body (flex: 1, overflowY: auto)
            ├── Empty State（無任務時）
            └── Task Cards（可點擊 → 編輯 Modal）
```

#### 13.14.5 My Tasks 功能規格（v3.8 完整版）

| 功能 | 規格 |
|------|------|
| 卡片按鈕 | 僅保留 **Ask AI** + **標記完成**，移除其他操作按鈕 |
| 標記完成 | 即時顯示刪除線 + badge 轉為「已完成」；點刷新後才消失 |
| 刷新按鈕 | 0.7s 旋轉動畫；動畫結束後已完成項目淡出（移入 dismissed set） |
| 新增按鈕 | `+` 灰色輪廓按鈕（與刷新同階層）；開啟新增 Modal |
| 新增 Modal | 欄位：標題（必填）、優先級（P1/P2/P3）、截止日期、指派給（預設自己） |
| 詳情 Modal | 點擊任意卡片開啟；所有欄位可編輯；Footer：標記完成 + 儲存變更 |
| 空畫面 | 純文字三行設計（無 icon）：「今日任務全數完成 / 休息一下，或點 + 新增下一個目標 / — 做得不錯 —」 |

#### 13.14.6 程式碼異動

| 檔案 | 變動摘要 |
|------|---------|
| `SectionPage.jsx` | `PersonalPriorityFeed`：移除 Widget 卡片外框，改為 `display: flex, flexDirection: column, height: 100%`；Header 加 `flexShrink: 0`；任務列表包裹 `flex: 1, overflowY: auto` 捲動容器 |
| `SectionPage.jsx` | `DashboardPage`：新增 `rightOpen` state；右側容器改為 `overflow: hidden, transition: width 0.25s`；分隔線加 toggle tab（position absolute，凸出左側） |

---

### §13.15 KPI 報表管理後台設定（v3.9）

#### 13.15.1 背景與動機

KPI 報表中心（左側 Nav → KPI）原本的書籤與分組為 hard-coded mock 資料，缺乏後台管理入口。Seed 無法新增 / 調整報表來源或分組排序。v3.9 新增「KPI 報表管理」Setting tab，讓 Seed 可直接在 Portal 內設定各課的 KPI 報表來源與展示結構。

EDA3 整合背景：EDA3 是與 Agent Portal 高度整合的數據打包系統，使用者可在 EDA3 建立資料來源與自動化處理流程（Flow），並將結果輸出為 HTML report。KPI 報表管理選擇 EDA3 來源時，Portal 每次展示前會呼叫 EDA3 API 取得最新報表 URL，確保內容永遠是最新版本。

#### 13.15.2 設計決議

| 項目 | 決議 |
|------|------|
| 入口 | Setting 左側 nav → Section 管理群組 → **KPI 報表管理**（緊接「KPI Summary」之後） |
| 權限 | Seed 可新增 / 編輯 / 刪除 / 排序；一般課員此 tab 唯讀（不顯示操作控制項） |
| 資料範圍 | 各課資料互相獨立（以 `p.key` 為鍵：equipment / process / mfg） |
| 版面 | 單頁整合（不再分中間列表 + 右側表單），新增 / 編輯走 Modal |
| EDA3 API | v3.9 使用 mock 資料模擬；正式版呼叫 `GET /eda3/flows?output_type=url` 取得 Flow 清單，`GET /eda3/flows/{flow_id}/report-url` 取得最新報表 URL |

#### 13.15.3 來源類型

| 類型 | 說明 | 設定欄位 |
|------|------|----------|
| **外部 URL** | 使用者貼上 `https://` 開頭的連結，以 iframe 嵌入展示（適合 Power BI、FDC Console 等外部系統） | URL 輸入框（monospace，格式驗證） |
| **EDA3 Flow** | 從 EDA3 系統選擇具備「URL 輸出」能力的 Flow；Portal 每次開啟時呼叫 EDA3 API 取得最新報表 URL | Flow 下拉選單（Mock：per-persona 獨立清單） |

#### 13.15.4 UI 結構

```
KPI 報表管理（單頁）
  ├── Header：標題 + 說明文字 + [+ 新增群組]（Seed Only）
  │
  ├── Group 區塊（可拖曳換序）
  │   ├── Group Header：⠿ 拖曳把手 | 群組名稱 | n 份報表 | [編輯名稱] [+ 新增報表] [刪除群組*]
  │   └── Report 列（可在群組內拖曳換序）
  │       └── ⠿ | 狀態圓點(10×10) | 報表名稱 | 類型 badge | 設定值預覽 | [✎] [✕]（Seed Only）
  │
  └── Empty State（無群組時的說明文字）

* 刪除群組：僅在群組內無報表時顯示

Modal（新增/編輯群組 or 新增/編輯報表）
  ├── 群組模式：群組名稱輸入框
  └── 報表模式：報表名稱 / 來源類型（膠囊 Tab: 外部URL | EDA3 Flow）
               / URL 輸入框 or EDA3 Flow 下拉 / 啟用開關
```

#### 13.15.5 類型 Badge 規格

| 類型 | 背景色 | 邊框色 | 文字色 |
|------|--------|--------|--------|
| EDA3 | `rgba(37,99,235,0.1)` | `rgba(37,99,235,0.2)` | `#2563EB` |
| URL | `C.bgPanel`（面板底色）| `C.border` | `#6B7280` |

狀態圓點：啟用 `#22C55E` / 停用 `#9CA3AF`，尺寸固定 `10×10px` 圓形。

#### 13.15.6 Mock 資料結構

```js
KPI_REPORT_MOCK[personaKey] = {
  flows: [
    { id, name, lastUpdatedAt, reportUrl }  // EDA3 Flow 清單（具 URL 輸出者）
  ],
  groups: [
    {
      id, name, order,
      reports: [
        { id, name, type,        // 'url' | 'eda3'
          url,                   // type='url' 時使用
          flowId, flowName,      // type='eda3' 時使用
          enabled, order }
      ]
    }
  ]
}
```

各課 mock 資料摘要：

| 課別 | Groups | Reports | EDA3 Flows |
|------|--------|---------|------------|
| 設備課 | 設備效能 / 維修管理 / 停機分析 | 6 份（3 URL + 3 EDA3） | MTTR 計算流程 / Case 彙整流程 |
| 製程課 | 製程品質 / 製程變更 / 配方管理 | 5 份（3 URL + 2 EDA3） | CPK 分析流程 / DCR 彙整流程 |
| 製造課 | 產能追蹤 / WIP 管理 / 交期管理 | 5 份（4 URL + 1 EDA3） | Priority Lot 分析流程 |

#### 13.15.7 拖曳排序規格

- 實作方式：HTML5 Drag API（`draggable`、`onDragStart`、`onDragOver`、`onDrop`）
- Group 層：各 Group 區塊可上下拖曳互換位置；`order` 依新序列重新賦值
- Report 層：同 Group 內 Report 列可上下拖曳換序；Phase 1 不支援跨 Group 移動
- 拖曳把手：`⠿` 字元，cursor: grab，僅 Seed 顯示

#### 13.15.8 程式碼異動

| 檔案 | 變動摘要 |
|------|---------|
| `src/data/kpiReportConfig.js`（新增）| KPI_REPORT_MOCK：設備 / 製程 / 製造三課各自的 groups、reports、EDA3 flows mock 資料 |
| `src/components/SettingPage.jsx` | MGMT_TABS 新增 `{ key: 'kpi-report', label: 'KPI 報表管理' }`；seedOnlyTabs 加入 `'kpi-report'`；Right content 區新增 kpi-report 渲染；新增 `KpiReportModal`、`KpiReportSettingTab`、`kpiRptBtnStyle`、`kpiRptIconBtnStyle` 共四個 function |
| `build.py` | JS_MODULES 新增 `src/data/kpiReportConfig.js`（置於 apps.js 之後） |

#### 13.15.9 待決事項

| # | 問題 | 優先級 |
|---|------|--------|
| KR-OQ-1 | EDA3 API 正式串接：`GET /eda3/flows` 與 `GET /eda3/flows/{id}/report-url` 規格確認 | 高 |
| KR-OQ-2 | KPI 報表頁前台是否需同步改為依此設定資料渲染（目前前台仍為 KPI_BOOKMARKS hard-code）| 高 |
| KR-OQ-3 | EDA3 類型報表最後更新時間顯示位置與格式（卡片？toolbar？） | 中 |
| KR-OQ-4 | 「前往 EDA3 設定」快捷按鈕實作（URL 或深度連結設計）| 中 |
| KR-OQ-5 | Report 跨 Group 拖曳移動（Phase 2）| 低 |
