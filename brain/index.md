# Index — Agent Portal AI 大腦目錄

> 每次 ingest 後必更新。查詢時先讀本頁定位，再深入頁面。運作規範見 [WIKI.md](WIKI.md)。

## 綜述與追蹤

- [overview.md](overview.md) — 產品是什麼、現在在哪、往哪走（進入專案第一頁）
- [decisions.md](decisions.md) — v2.5 → v3.9 決議時間軸 + 2026-07-10 backlog 方法論
- [open-questions.md](open-questions.md) — OQ-1~9、TM/SCH 專屬 OQ、wiki 新發現缺口 W-1~4
- [log.md](log.md) — 操作時間軸（append-only）
- [../ai_ux_guideline.md](../ai_ux_guideline.md) — **AI 對話／Agent 執行體驗的團隊實作準則**（根目錄，AI 維護）：§0–6 執行型（Chat 頁），§7 編輯型（Skill 詳情 Ask AI），§8 快速檢查清單。做任何新的 AI 功能前先讀這頁，不必重推導一次

## Sources（原始文件摘要）

- [sources/product-baseline.md](sources/product-baseline.md) — 1440 行產品規格書 v3.9 的結構地圖
- [sources/scrum-teaming.md](sources/scrum-teaming.md) — 兩隊分工 + OKR（⚠️ 草稿待 PO 確認）
- [sources/backlog-access-permission-gate.md](sources/backlog-access-permission-gate.md) — 權限 Gate Feature + 2 Stories
- [sources/skill-review-story-splitting.md](sources/skill-review-story-splitting.md) — 開票方法論三原則（覆盤）

## Entities

- [entities/personas.md](entities/personas.md) — EE / PE / MFG / 課長 / Seed / IT 六角色
- [entities/teams.md](entities/teams.md) — AI 團隊 / Dashboard 團隊分工與跨隊依賴
- [entities/architecture.md](entities/architecture.md) — Prototype 系統架構：Python 拼裝 build、React UMD + Babel CDN
- [entities/sitemap.md](entities/sitemap.md) — 產品地圖：sitemap、四層堆疊、三股跨模組互動流

### 模組

| 頁面 | 一行摘要 | Nav |
|------|---------|-----|
| [home-dashboard](entities/modules/home-dashboard.md) | 工作站首頁：Section Zone + My Tasks 面板 + AmbientBar；**佈告欄承接 SOP 交接報告產出** | 1 |
| [kpi-center](entities/modules/kpi-center.md) | 趨勢深入分析；v3.9 報表管理後台；AntD Phase 4 已遷移 | 2 |
| [app-center](entities/modules/app-center.md) | 內部應用目錄 + 釘選 + Function Tree（Dropdown+Tree）；AntD Phase 5 已遷移 | 3 |
| [task-management](entities/modules/task-management.md) | 課長派工；P1 缺口 AI 自動標記；AntD Phase 2 已遷移 | 4 |
| [ai-chat](entities/modules/ai-chat.md) | 被動查詢原則 + 四個 Ask AI 入口；**2026-07-26 四輪 + 2026-07-27 第五輪**：當代對話版面＋五情境 → 兩種互動模態＋逐步播放 → 右側面板＋決策留痕＋**三態徽章移除（責任轉到 F-AI-01 ⚠️）** → **左右職責互換：步驟明細全回對話流（含未跑到、分支未走、失敗細節），面板只剩計畫一層，三區改名任務／產出／來源** | 5 |
| [scheduling](entities/modules/scheduling.md) | 唯一 AI 主動場景，HITL 三重約束；只掛 Codify＋展示產出物；**2026-08-01 決議 17 介入機制改寫**：取消認領與延伸討論（本頁不再有 AI 對話出口）→ 選項直接攤開（確認／略過／拒絕）、全課皆可決定、**先送出者定案不可撤回**、拒絕必填理由、`interventions[]` 成為唯一稽核序列（舊 UI 按下確認後介入痕跡反而消失）、Nav 紅點改綁實際未決定的決策點。**A~E 五階段全數完成**：A 資料層／B 介入層／C 執行總覽與異常（N4 失敗通知、只看異常、重跑）／D 可加入的 Codify（已掛的鎖住、搜尋、步驟預覽、Codify 詳情「設為定期執行」入口、`getSkillScheduleMap` 成為兩邊的單一真相）／E 節點明細與實走路徑（Graph 視角刻意不做，理由見模組頁）。**2026-08-01 決議 18 資訊層級收斂**：同一件「有東西卡住」原有 7 個表面在講 → 刪左欄橫幅（留 Nav 紅點／鈴鐺／卡片紅點／總覽置頂）、**總覽升為進入預設主畫面**、**左欄瘦身成只有排程清單**、回總覽走右欄麵包屑。**實測封鎖已解除**（npm registry 在 proxy noProxy 名單內，可 vendor 依賴後用 Playwright 實跑，`shell.html` 不動）。**2026-08-01 決議 19 編輯排程**：左欄搜尋評估後判定**現在不做**（每課只有 2–4 個排程、門檻設 10–12 筆），改補最大的操作落差 → **建立與編輯合一**（`SchScheduleModal` 一個表單兩種模式）、可改名稱與時間、**掛的 Codify 不可改**（換掉會斷決議 17 的稽核序列，要換＝停用後另建）、**變更留痕 `lastChange`**（誰最後一次改了什麼，PO 指定；全課皆可編輯故更需要）、**下次執行時間**寫出來、資料層加變更層 `applyScheduleEdits()` 且 `getSkillScheduleMap` 一併吃它（改名後 Skill 管理徽章跟著改）。**2026-08-01 決議 20 新增排程只列選得到的**：實測設備課 0 可選 / 7 鎖 → **推翻「不可用的類型不隱藏」**（目的未被推翻：一行規則說明同樣講得出邊界，七列鎖頭是同一句話講七遍）。已掛排程與 Skill 型直接隱藏，尚未生效改一句常駐說明「尚未生效的 Codify 無法設定排程。」（PO 定稿，講規則不講筆數）；連帶**全掛滿時＋新增停用**、**Modal 搜尋框移除**；⚠️ 用字校正：**「生效」才是產品標準用字，「上線」只是排程頁的例外**，已改齊。**2026-08-01 決議 21**：0 份可選的理由由常駐副標改為 **hover／點擊 Tooltip**（`目前沒有可設定排程的 Codify`）——常駐那句涵蓋不了「完全沒有 Codify」與「有但都沒生效」兩種狀況，且穩定狀態被反覆提醒＝溝通疲勞；停用的 Button 需包 `span` 才觸發 Tooltip，手機無 hover 故 trigger 補 click。**2026-08-02 決議 22 總覽的進入點**：PO 試用後指出進入點不直覺（左欄第一張卡與右欄總覽置頂待決定同名，誤讀成詳情）→ 診斷出根因是**決議 18 之後左欄沒有任何項目是選中的**，三欄式「右欄有內容就有一個選中的左欄項目」的契約斷了；查同類系統確認沒有人做「右欄預設是一個清單裡選不到的總覽」。PO 要求回填但不要回到決議 18 之前那版 → 判定**決議 18 現象描述對、歸因錯**（混亂不是因為有三種高度，是三種高度沒被畫出來）。立規則：**左欄只放導覽、導覽只有兩類、警示不進左欄；形態不同 + 選中語彙相同**。落地：總覽變回左欄置頂一列（不帶數字紅點）、統一選中語彙、留白＋分組小標取代分隔線、**待決定卡片的紅框粉底收掉**（邊框底色只表示選中，不兼差表示狀態）、總覽 header 副標升成 20px 統計列、置頂 Alert 改「全課有 N 件…」＋排程名改膠囊。警示橫幅不補回。實測 20 項全過。**2026-08-03 決議 23 決策收件匣（來源 Claude Design IA 方向 B）**：頁面主詞從「排程」換成「**事**」→ 左欄＝工作佇列（`待處理／全部紀錄` 膠囊、兩張分類卡只給類型＋件數、下半是排程健康監看清單），右欄＝決策台（header 只講還有幾件／最久等多久，第一件展開成可直接決定的卡片），**設定全走 480px 抽屜**（管理→編輯／新增就地換檢視）。新增**失敗待確認**第二類佇列（動作語彙不同：標記已確認／立即重跑／看完整錯誤）與**改參數**第四種介入（`paramsBefore/After` 進稽核序列）；**「停用」終於做出來**（可逆開關、停用仍可手動執行一次、不釋放 Codify）。⚠️ **拒絕執行失去 UI 入口**（設計檔只有三顆按鈕，下一棒要 PO 拍板）；⚠️ 口述說「需人工確認步驟」要做成開關、設計檔 4d 畫的卻是唯讀不可關 —— **依設計檔**，HITL 三重約束未被動到。7 個狀態 + 20 項互動實測全過。仍未做：拒絕入口、結果異常偵測、定期自動重跑 dry run、決策等待逾時、刪除排程 | 6 |
| [drive](entities/modules/drive.md) | **2026-08-31 新增**：課的雲端硬碟。每課預設系統資料夾 `Agent_Artifacts`（不可改名／刪除）承接 AI 產出的 artifact，帶 `origin` 溯源可跳回產它的排程／對話；**功能連結：`.html` 產出可加進 KPI 報表清單**（判定集中在 `isDriveEmbeddable()`、清單放 App.jsx 兩頁共用、iframe 帶 `sandbox=""`）；**決議 25：加入／移除的開關在 KPI 頁不在 Drive**（KPI 本來就是管理書籤清單的地方），Drive 只做狀態與指路。三欄式：左導覽（快速存取＋資料夾樹＋容量）／中列表（麵包屑＋表格）／右詳情（預覽＋溯源＋動作）。示意原型，上傳／下載／分享／權限刻意不做 | 7 |
| [handover](entities/modules/handover.md) | ❌ **已廢除、`HandoverPage.jsx` 已刪（2026-07-25）**；交班改為 SOP 排程產出，Schedule 檢視＋Home 佈告欄觸達；`ShiftHandoverModal` 入口已改掛佈告欄那則 SOP 產出 | — |
| [knowledge-base](entities/modules/knowledge-base.md) | **知識管理：2026-07-26 從 Skill 管理拆出獨立**（Setting 新 tab）；Vector/RAG/知識圖譜為後續方向 | — |
| [setting](entities/modules/setting.md) | 後台：Personal + Seed 八 tabs（含新的知識管理）+ IT 區 | 底部 |
| [notification](entities/modules/notification.md) | 通知中心 v1 已實作（**四類通知**：N1 完成／N2 需人工決定／N3 P1 指派／**N4 執行失敗（2026-08-01 補上）** + 鈴鐺 + Teams 設定），AntD 試點 | Header |

## Concepts

- [concepts/design-principles.md](concepts/design-principles.md) — 八條設計原則（需求評審檢查表）
- [concepts/agent-skill-tiering.md](concepts/agent-skill-tiering.md) — **Agent Skill 三層模型**（知識／**Skill**／**Codify**）+ 建立流程 + Tool Gateway runtime 把關 + 兩個飛輪；原型 2026-07-25 實作完成，**三輪改版**：①知識拆出獨立、Skill 詳情改全頁（Graph/Signoff/Ask AI）、Chat 五情境 → ②Skill 管理四項（決議 6–9）：工具列收一行、Ask AI 全程在右側不阻塞、測試補回執行動作與可看的 FAIL、建立改短表單 → ③**2026-07-27~28 決議 10–12：dry run 從一條路變成情境試跑（系統自動出壞資料情境、PASS＝行為符合約定）＋ Graph 節點試打（write 永不真送）＋ SOP 不再有測試案例——SOP 測結果與例外、輔助判斷測意圖，兩邊互不出現 → ④**2026-07-29 決議 13：輔助判斷的「測試案例」改為「驗收」——AC（整份共用、可帶前提）× 提問情境，同一提問跑 5 次，PASS 由人看內容判定；改 Description 即作廢重驗** → ⑤**決議 14：系統與 AI 都不介入判斷——圓點與比例全數移除，改成把每一次「做了什麼（工具呼叫與被拒絕的那一步）＋最終回答」攤開，人自己看完再勾** → ⑥**2026-07-30 決議 15：類型改名 `SOP → Flow`、`輔助判斷 → Guide`**——「SOP」在廠內泛用，且與知識管理裡那些「XX指引／XX程序」文件互相引用時同名不同物 → ⑦**2026-07-31 決議 16：再改名 `Guide → Skill`、`Flow → Codify`，並升成 Skill 管理裡的兩個分頁（進入預設 Skill）**——挑字標準從「撞名面」補上「先驗認知」：Skill 是 Agentic AI 通用詞使用者本來就懂，Codify 不是，所以讓 Skill 當入口、Codify 由使用者自己去點；每個分頁掛一句小標題，Skill 那句的「升級 Codify」是飛輪 1 第一次在 UI 上現身。⚠️ 已知代價：容器「Skill 管理」與類型「Skill」父子同名。容器名與 code key `guided`／`sop` 兩輪皆不變。⚠️ 該頁舊段落一律沿用當時用字（頁首有兩輪對照表）；執行期 contract check 與路由層驗收刻意延後 ⚠️；頁末有實作落點與未實作清單；SCH-OQ-2 解方
- [concepts/widget-governance.md](concepts/widget-governance.md) — 四層治理 + Widget Contract
- [concepts/ecp-strategy.md](concepts/ecp-strategy.md) — ECP 下一代、交接切入點、平台引力模型
- [concepts/antd-migration-plan.md](concepts/antd-migration-plan.md) — AntD 全面遷移計畫（8 Phase、token 映射、每頁 DoD）；**Phase 0–5 ✅ 完成**（Setting 系列、TaskManagement、SkillManagement、Scheduling、KPI、Knowledge、Chat、AppCenter）＋ Phase 8 死檔清理 ✅，HandoverPage 已刪，下一棒 **Phase 6（僅 App.jsx nav/header）**
- [concepts/product-review-2026-07.md](concepts/product-review-2026-07.md) — 用戶測試前七點產品建議（楔子外露、主動性階梯、測 AI 錯誤…）
