---
type: decision
title: 決議時間軸（v2.5 → v3.9）
description: 歷次版本的關鍵產品決議，一頁掌握「為什麼現在長這樣」
tags: [decision, changelog]
updated: 2026-07-26
sources: [PRODUCT_BASELINE.md §13, 版本標頭]
status: current
---

# 決議時間軸

| 版本 | 日期 | 決議 | 影響頁 |
|------|------|------|--------|
| v2.5 | — | Task Management 上線：課長總覽 / 快速派工 / Drawer / 歷史 7 天 | [task-management](entities/modules/task-management.md) |
| v2.6 | — | Scheduling 上線：唯一允許 AI 主動的場景 + HITL 三重約束 | [scheduling](entities/modules/scheduling.md) |
| v2.7 | — | 應用入口三分工確立（課的應用 / 我的釘選 / APP Center） | [app-center](entities/modules/app-center.md) |
| **v2.8** | — | **移除「我的釘選」widget**：Personal Zone 聚焦 Priority Feed，釘選統一 APP Center，避免雙頭管理 | [home-dashboard](entities/modules/home-dashboard.md) |
| v2.9 | — | Setting 後台上線（Seed 五 tabs 起步） | [setting](entities/modules/setting.md) |
| v3.1 | — | Dark Mode（ThemeContext）；Setting 改全角色可見（Personal 區） | [setting](entities/modules/setting.md) |
| v3.2 | — | 新增 IT 管理員 persona + Function Tree 三層結構 + IT APP 管理 tab | [personas](entities/personas.md)、[app-center](entities/modules/app-center.md) |
| v3.4 | — | APP Center header pill toggle 新舊版切換；Function Tree 前台入口 | [app-center](entities/modules/app-center.md) |
| v3.5 | — | Home 新增 Tool Status / Case / Lot Hold 三 widget；設備課暫隱 KPI/Apps | [home-dashboard](entities/modules/home-dashboard.md) |
| **v3.6** | 2026-04-30 | **大老闆決議 Nav 順序：Home → KPI → App → Task → AI → Schedule**。原則：「資訊整合優先，管理集中統一，AI 置後作為輔助工具」；Schedule 不降級為 Task 子頁 | 全部 |
| v3.7 | — | 首頁排版 row-based（homeLayout + HomeLayoutTab）；設備課恢復 KPI/Apps（修正 v3.5） | [home-dashboard](entities/modules/home-dashboard.md)、[setting](entities/modules/setting.md) |
| v3.8 | 2026-05-01 | My Tasks 由 widget 卡片改為**全高右側面板**（sticky header、獨立捲動、可收合） | [home-dashboard](entities/modules/home-dashboard.md) |
| v3.9 | 2026-05-07 | Setting 新增 KPI 報表管理 tab（兩種來源類型、雙層拖曳排序） | [kpi-center](entities/modules/kpi-center.md) |
| — | 2026-07-10 | 權限 Gate backlog 定稿（skill 產出首單）+ 三條開票方法論確立 | [sources](sources/backlog-access-permission-gate.md)、[覆盤](sources/skill-review-story-splitting.md) |
| — | 2026-07-24 | **AntD 全面遷移**（非孤島漸進；維持現有 build pipeline 不含 Vite）；Phase 順序表單重的先、Home/Handover 最後 | [遷移計畫](concepts/antd-migration-plan.md) |
| — | 2026-07-24 | **Notification v1 定案**：N1/N2/N3 三類、AR=被指派人本人（無回向通知）、Teams 逐則推送但僅做設定 UI 不 mock、歷史 7 天 Popover 內 | [notification](entities/modules/notification.md) |

| — | 2026-07-25 | **Agent Skill 三層模型定案**：知識／輔助判斷／SOP（UI 用字）。分界為確定性＋副作用（「能不能排程」是使用者可懂的分界）；隔離做在 **Tool Gateway 而非 sub agent**；**寫入行為一律強制人工確認**（HITL），故把關永遠在 runtime；適用範圍改結構化欄位；輔助判斷簽核改**評測集**（Seed 出題、負面題系統自動生成） | [agent-skill-tiering](concepts/agent-skill-tiering.md) |
| — | 2026-07-25 | **SOP 建立採對話式**：Seed 貼文本或聊需求 → agent 生流程與 code node → 試跑 → promote 進 Draft → UI 上 dry run → 簽核。code node **自由式 + sub graph 混用**（成熟行為做成標準元件，避免錯用與重複試錯）；簽核對象是**白話說明＋dry run 三層結果**，非 code；Pilot Run 改條件式（唯讀 SOP 跳過） | [agent-skill-tiering](concepts/agent-skill-tiering.md) |
| — | 2026-07-25 | **交班中心廢除**：`HandoverPage` 直接刪除，交班降級為一個 SOP 的排程產出——Schedule 內檢視（檔案櫃）＋ Home 佈告欄觸達（今天這份），`ShiftHandoverModal` 改為預填後人補判斷。ECP 切入點定位不變、載體改變 | [handover](entities/modules/handover.md)、[ecp-strategy](concepts/ecp-strategy.md) |
| — | 2026-07-26 | **知識拆出 Skill 管理**，落於 Setting 獨立 tab（不進 Nav）。理由：知識在輔助／SOP 執行的前後都會被引用，是底料不是平行路線。**部分推翻**「三種類型放同一管理頁」——飛輪 1 的兩端（輔助判斷↔SOP）仍同清單，故論證不受影響。Vector/RAG/知識圖譜僅註記方向不實作 | [knowledge-base](entities/modules/knowledge-base.md)、[agent-skill-tiering](concepts/agent-skill-tiering.md) |
| — | 2026-07-26 | **Skill 詳情從 Modal 改全頁**：Title/Scope/Description/**Graph**（僅 SOP）/Test case & Dry-run，右上 **Ask AI**（只能改當前這一份，修改以 diff 回寫主欄）與 **Signoff**（一顆會看 stage 的按鈕，取代散落各處的階段推進鈕）。清單降為純進入點、列上只剩刪除 | [agent-skill-tiering](concepts/agent-skill-tiering.md)、[setting](entities/modules/setting.md) |
| — | 2026-07-26 | **AI 頁改成當代 AI 對話**：砍頭像、AI 回應無氣泡無框全寬純文字、三態徽章降級為一行細字 meta（徽章不能省的論證不變，只降視覺重量）。新增**五種情境腳本**（SOP+HITL 成功／API 變更導致失效／輔助問答婉拒執行並給操作入口／依知識回答／無知識收斂成追蹤任務），標題直接就是情境目標 | [ai-chat](entities/modules/ai-chat.md) |
| — | 2026-07-27~29 | **Skill 驗收方法兩層分開**（決議 10–14，完整脈絡見概念頁）：SOP 改**情境試跑**（壞資料情境系統自動生、PASS＝行為符合約定而非有輸出）＋ Graph **節點試打**（write 永不真送）；**SOP 不再有測試案例**（codify graph 沒有「意圖」可測）；輔助判斷的測試案例改為**驗收**（AC × 提問情境、同一提問跑 5 次、人看內容判定）；**系統與 AI 都不介入判斷**——圓點與比例全移除，改成把每次「做了什麼＋最終回答」攤開給人看 | [agent-skill-tiering](concepts/agent-skill-tiering.md) |
| — | 2026-07-30 | **Skill 類型改名：`SOP → Flow`、`輔助判斷 → Guide`**。理由不只是「SOP 在廠內泛用」，而是**在本產品內部就撞名**——知識管理裡放的正是廠內慣稱的 SOP 文件（`data/knowledge.js` 15 篇中「程序」×5、「指引」×5），且與 Skill 管理裡的同名項目互相引用。同一理由淘汰了對稱度最高的「流程／指引」（指引撞 5 篇）、「核准流程」（Draft 還沒核准，名字內含階段）與「自動流程」（含寫入的會停下等人，名字說謊）。**容器名「Skill 管理」不改**（「技能管理」在廠內是員工技能矩陣，撞更兇），**code key `guided`／`sop` 不改**。行為零改動，只換顯示字 | [agent-skill-tiering](concepts/agent-skill-tiering.md) |

| — | 2026-07-31 | **類型再改名 `Guide → Skill`、`Flow → Codify`，並升成 Skill 管理的兩個分頁**。決議 15 用「撞名面」挑字，這輪補上第二個標準「**先驗認知**」——`Skill` 是 Agentic AI 的通用詞使用者本來就懂，`Codify` 不是，所以**進入預設站 Skill、讓使用者自己去點 Codify**，而不是塞說明。分頁取代原本工具列上的類型 Segmented（語意從「可篩的一份清單」變成「兩件不同的事」），「全部類型」消失，換來每個分頁掛一句小標題；Skill 那句尾巴的「升級 Codify」是飛輪 1 第一次在 UI 上以一句話出現。**已知代價：容器「Skill 管理」與類型「Skill」父子同名**，PO 接受，要修的方向是動容器名。code key `guided`／`sop` 仍不改 | [agent-skill-tiering](concepts/agent-skill-tiering.md)、[setting](entities/modules/setting.md) |

| — | 2026-08-01 | **Schedule 介入機制改寫（決議 17）**：取消「✋ 我來處理」認領步驟與「💬 延伸討論」——**這一段未來不引入 AI 對話**，選項直接攤在決策點上，一次點擊完成決定。選項改為**確認執行／略過此步驟／拒絕執行**（拒絕即終止），**全課成員皆可決定**，**先送出者定案、不可變更撤回**（B 推翻不了 A），拒絕必填理由。`run.interventions[]` 成為唯一稽核序列，取代 `handler`／`decisionBy`——舊 UI 在按下確認後介入者那一列反而消失，是**目標「記錄誰在何時介入」的直接破口**。Nav 紅點改綁實際未決定的決策點（原本綁未讀 N2，通知一讀紅點就沒了但事情還卡著）。逾時依 PO 指示**先做持續等待** | [scheduling](entities/modules/scheduling.md)、[notification](entities/modules/notification.md) |

| — | 2026-08-01 | **Schedule 執行總覽與異常（Phase C）**：跨排程總覽走**左欄虛擬項目**而非右欄 Tabs——總覽是跨排程的，塞進「某一個排程的詳情」裡語意不對，三欄式佈局也保住了。篩選膠囊四項：全部／執行失敗／待決定／**有人介入**（稽核視角）。**補上 N4 執行失敗通知**（站內＋Teams 皆開，跟 N2 同級）——原本 N1 只涵蓋完成、N2 只涵蓋待決定，**排程半夜掛掉沒有任何人會知道**。失敗改結構化（分類／卡在第幾步／工具／原始訊息），`retryable` 者可重跑，**重跑是新增一筆、原本那筆失敗永遠保留** | [scheduling](entities/modules/scheduling.md)、[notification](entities/modules/notification.md) |

| — | 2026-08-01 | **Schedule 可加入的 Codify 與節點明細（Phase D+E）**：`getSkillScheduleMap()` 成為 Codify↔排程的**單一真相**，Schedule 的「不能重複掛」與 Skill 管理的徽章／刪除警語／生效資訊全部改讀它，**不再讀 `skill.consumedBy`**——舊版 `blockReason()` 只看 tier/stage，已掛排程的 Codify 仍可再選一次，會建出重複排程。補上 Codify 詳情的「**設為定期執行**」入口（2026-07-25 起列為未實作）。節點明細補齊工具／參數／來源／筆數／耗時——**試跑本來就看得到，正式執行沒理由看得比試跑少**。**Graph 視角刻意不做**：唯一有 `graph.edges` 的 Codify 分層後是線性的，畫出來與 Timeline 一樣，改用實走路徑摘要涵蓋全部八個排程 | [scheduling](entities/modules/scheduling.md)、[agent-skill-tiering](concepts/agent-skill-tiering.md) |

| — | 2026-08-01 | **Schedule 資訊層級收斂（決議 18）**：PO 在手機上看實機截圖後指出「有東西卡住」被重複溝通到疲勞——清點後同一件事有 **7 個表面**在講。立的分界是**通知（推播）／狀態（現況）／頁內提示（定位）三者不同層，但同一畫面裡講兩次就是重複**：刪掉左欄「本課有 N 件待人工決定」橫幅，留 Nav 紅點、通知鈴鐺、排程卡片紅點、總覽置頂區塊。同時**執行總覽從左欄虛擬項目升為進入預設主畫面**（原本預設落在第一個排程＝一進門就鑽細節），**左欄瘦身成只有排程清單**（單一職責＝切換單一排程），回總覽改走**右欄麵包屑**（「我現在在哪」屬於詳情欄層級，不塞在清單上方）。⚠️ 決議 17 的左欄虛擬項目作法在此被推翻，但**理由未被推翻**（總覽不該塞進單一排程的 Tabs），三欄式佈局仍成立。取捨：看 A 排程時不會被主動告知 B 卡住，依據是排程卡住為分鐘～小時級 | [scheduling](entities/modules/scheduling.md) |

| — | 2026-08-01 | **Schedule 編輯排程（決議 19）**：起點是 PO 問「左側清單搜尋」，評估後判定**現在不做**——每課只有 2–4 個排程一屏看得完，且決議 18 才把左欄瘦成單一職責，門檻設在 10–12 筆（屆時比對範圍要含 **Codify 名稱與建立者**）。改補本頁最大的操作落差：**建立與編輯合一**（一個表單兩種模式，不必學兩次也不會演化成兩套欄位），可改**名稱與執行時間**，**掛的 Codify 不可改**——換掉之後同一個排程的執行紀錄／產出物／`interventions[]` 前後講不同的事，**決議 17 建立的稽核序列會斷**，且會同時改動 Skill 管理的徽章（要換＝停用後另建）。PO 定案**全課皆可編輯**，因此**每次變更留痕 `lastChange`**（誰最後一次改了什麼）——判準是排程改的是「沒人在場時 AI 幾點會動作」，比一般設定變更重份量，延續決議 17「痕跡不能因為事情做完就消失」。另補**下次執行時間**（改完最常見的困惑是「現在生效還是明天」）。資料層加變更層 `applyScheduleEdits()`，`getSkillScheduleMap()` 一併吃它，排程改名後 Skill 管理徽章跟著改 | [scheduling](entities/modules/scheduling.md) |

| — | 2026-08-01 | **Schedule 新增排程只列選得到的（決議 20）**：PO 指出「已新增過的、不能新增的都不該出現，畫面多很多明知不可點的項目」。實測證實設備課是 **0 可選 / 7 鎖**、製程 1/4、製造 1/3。**推翻** [agent-skill-tiering](concepts/agent-skill-tiering.md)「不可用的類型不隱藏，Seed 才知道邊界在哪」——**但目的未被推翻**：一行規則說明同樣講得出邊界，七列鎖頭是把同一句話講七遍（決議 18 的溝通疲勞同一模式），且邊界教育真正的家是 Skill 管理的兩個分頁。三種鎖住性質不同故處置不同：**已掛排程**（事情已完成、左欄本來就列著）與 **Skill 型**（類型邊界不是狀態、永遠不變）直接隱藏；**尚未生效**隱藏列但保留一句常駐說明——它是 Codify、將來會能排程、有明確下一步，無聲消失會讓人分不清「找錯地方」還是「還不能設」。文案由 PO 定稿「尚未生效的 Codify 無法設定排程。」，講規則不講筆數故常駐。⚠️ 查證後**校正用字**：「生效」才是產品標準（SkillDetail／ChatPage 皆是），「上線」只是排程頁的例外，已一併改齊。連帶：全掛滿時**＋新增停用**、**Modal 搜尋框移除**（1–3 列清單放搜尋框＝同一個多餘） | [scheduling](entities/modules/scheduling.md)、[agent-skill-tiering](concepts/agent-skill-tiering.md) |

| — | 2026-08-01 | **Schedule 0 份可選的理由改 Tooltip（決議 21）**：PO 推翻前一輪的常駐副標——**「完全沒有 Codify 的課看到『都掛上排程了』會十分困惑」**（清點後更嚴重：0 份可選有**三種**來源，全掛滿／完全沒有 Codify／有但都沒生效，寫死的那句只有第一種對），且**只有 3–5 份 Codify 且都設定好的人每次進來都被提醒一次很煩躁**（決議 18 溝通疲勞同一條分界）。新作法：置灰照舊，理由改 **hover／點擊才出現的 Tooltip**，文案由 PO 定 `目前沒有可設定排程的 Codify`——**三種狀況下都成立**故不做狀態分支。判準：**「為什麼不能按」屬於主動發問時才需要的資訊，不是常駐狀態**。⚠️ 兩個會讓設計失效的實作點已補：停用的 Button 不發滑鼠事件（Tooltip 要包 `span`）、**手機沒有 hover**（`trigger` 補 `click`）。`>0` 份那行入口保留（是「有事可做」的入口，性質不同） | [scheduling](entities/modules/scheduling.md) |

| — | 2026-08-02 | **Schedule 總覽的進入點（決議 22）**：PO 試用後指出進入點不直覺——左欄第一張卡與右欄總覽置頂待決定同名，誤以為右欄是那張卡的詳情。診斷出三個共犯：**決議 18 把預設落點改成總覽後左欄沒有任何項目是選中的**（三欄式的隱含契約是「右欄有內容就有一個選中的左欄項目」，契約一斷眼睛自動抓最近的卡片）、內容重名、兩個 header 幾乎同構。查同類系統（工作排程器／GitHub Actions／Dagster／Airflow／Fiori）確認**沒有人做「左欄是清單、右欄預設是一個清單裡選不到的總覽」**。PO 要求回填但**不要回到決議 18 之前那一版**（「問題在 UIUX 設計，不在產品結構」）——**決議 18 現象描述對、歸因錯**：混亂的來源不是「有三種高度」，是三種高度沒有被畫出來（同一欄兩套選中語彙、可點方塊同形不同義、視覺重量倒置、層級只靠一條線）。本輪立的規則：**左欄只放導覽，導覽只有兩類（一個總覽 + N 個排程），警示不進左欄；形態不同負責「這不是第 0 個排程」，選中語彙相同負責「這兩者是同一組選項」**。連帶把待決定卡片的紅框粉底收掉（**邊框與底色只表示選中，不兼差表示狀態**，只留紅點與標籤），總覽 header 副標升成 20px 統計列，置頂 Alert 改「全課有 N 件…」＋排程名改膠囊標籤。⚠️ 決議 17→18 的左欄虛擬項目在此**部分復原**（只復原導覽入口，警示橫幅不補回，決議 18 刪它是對的） | [scheduling](entities/modules/scheduling.md) |

| — | 2026-08-03 | **Schedule 改成「決策收件匣」（決議 23，來源：Claude Design IA 方向 B）**：把頁面的**主詞從「排程」換成「事」**。左欄＝工作佇列（`待處理／全部紀錄` 膠囊二選一，預設待處理；待處理項只給**類型＋件數**——待人工決定／失敗待確認，是哪一支排程、卡在哪一步全部移到右欄），分隔線以下是**排程健康**監看清單（一列只有點＋名稱＋時間兩層，右上「管理」開抽屜）。右欄＝決策台：header 只講「還有幾件、最久等多久」（**總覽的價值是催辦不是統計**），決策卡把「AI 要做什麼／參數／依據」攤平在同一屏、動作列直接可按。**新增兩個東西**：①「**失敗待確認**」成為第二類佇列與第二種動作語彙（標記已確認／立即重跑／看完整錯誤，**沒有「同意並繼續」**——失敗沒有等待中的 AI 步驟）；②「**改參數**」成為第四種介入，改前改後寫進 `interventions[]`（人改寫了 AI 要送出去的東西而不留痕＝決議 17 的稽核序列斷掉）。設定類動作全部走 **480px 右抽屜**（排程管理→編輯／新增就地換檢視，不疊第二層浮層），理由是改設定的人多半從佇列過來，換頁會抽走上下文。**「停用」終於做出來**（決議 19 掛的缺口）：可逆開關、停用仍可手動執行一次、Codify 不回到可新增清單。⚠️ **代價**：決策卡的動作列照設計檔只有三顆，**「拒絕執行（終止整次執行）」失去 UI 入口**（資料層與歷史紀錄仍渲染得出來）。⚠️ **設計檔自己擋掉的一項**：PO 口述版本說「哪些步驟要人工確認」做成開關（關掉＝AI 直接做），但 4d 畫的是**唯讀＋「不可關閉；由 Codify 的 Skill 定義」**——依設計檔實作，HITL 三重約束未被動到。決議 22 的左欄結構（總覽列＋排程卡）被本輪取代，但**它立的規則被沿用**：選中語彙一套（白底藍框）、邊框底色只表示選中不兼差表示狀態、警示不進左欄 | [scheduling](entities/modules/scheduling.md) |

| — | 2026-08-31 | **新增 Drive（決議 24）**：PO 要一個「定位跟 Google Drive 差不多、以課為單位」的頁面，兩個指定內容：每課預設資料夾 `Agent_Artifacts` 承接 AI 產出的 artifact；`.html` 的 artifact 可嵌進 KPI 頁展示。**Nav 掛在第 7 位**（Schedule 之後）——前六項是 v3.6 大老闆決議，新頁往後接不動它。三個判斷：①**`Agent_Artifacts` 是系統資料夾**（不可改名／刪除），因為它是產品契約不是使用者的資料夾——AI 落地路徑會被改掉的話，Drive 與排程／對話的接縫就不成立；②**「能不能嵌」只看副檔名**，判定集中在 `isDriveEmbeddable()` 一個函式，Drive 與 KPI 兩頁問同一個，不各自判斷（同決議 19 `getSkillScheduleMap` 成為單一真相的模式）；③~~**嵌入的開關放在 Drive 不放在 KPI**~~ ⚠️ **已被決議 25 推翻**（PO：「嵌入開關我要設置在 kpi，不要在 drive」）；嵌入狀態提到 `App.jsx` 那一半仍成立，兩頁不會講不一樣的話。Drive 因此成為**「依檔案找產出」的入口**，補上排程頁「依執行找產出」找不到東西的那一面。⚠️ 示意原型：上傳／下載／分享／刪除改名／版本／權限刻意不做，按鈕留著但按下去是一句 message（讓形狀講得完整，不假裝功能存在）。⚠️ 未解：**加入 KPI 等於改變全課看得到的畫面，該不該只有 Seed 能做**；`Agent_Artifacts` 每跑一次排程長一份的保留策略；Drive／Schedule 執行紀錄／Home 佈告欄三個落點誰是唯一真相 | [drive](entities/modules/drive.md)、[kpi-center](entities/modules/kpi-center.md)、[sitemap](entities/sitemap.md) |

| — | 2026-08-31 | **嵌入開關搬到 KPI（決議 25）**：PO 推翻決議 24 的第三項——「嵌入開關我要設置在 kpi，不要在 drive」。**PO 是對的，而且理由比我原本那條強**：KPI 報表中心本來就是**管理書籤清單**的地方（頁尾那句「⚙ Seed 管理書籤與分類」立在那裡很久了），從 Drive 加一份 AI 產出，與加一個外部報表書籤是**同一件事**；我原本的歸因（「決定要不要給全課看的地方該是看得到它怎麼產出的地方」）講的是**判斷所需的資訊**，但那份資訊 Modal 裡列得出來（來源／時間／大小／路徑），而清單的家只有一個。落地：①KPI 左欄 header 常駐「**＋ AI 產出**」入口——**不掛在「AI 產出報表」那一組上**，那組沒東西時整組不出現，入口跟著消失就變成找不到的功能；②一份**勾選清單同時做新增與移除**（管理清單的心智模型，不是對每個檔案下指令），**按下確定才生效**，故 App 的 handler 從逐筆 `toggle` 改成整份 `set`——逐筆 toggle 的話 Modal 的「取消」取消不掉；③選中的 AI 產出在報表 toolbar 補一顆「**從清單移除**」（常用動作不必每次開 Modal），Popconfirm 講明「檔案仍留在 Drive」且**不用 danger 色**——移除的是清單項不是檔案。Drive 端只剩**狀態與指路**：已加入者顯示狀態句＋「在 KPI 報表中心檢視」，未加入的 .html 講一句「加入與移除在 KPI 報表中心的『＋ AI 產出』」＋「前往 KPI 報表中心」（**留路徑，不做成隱藏功能**）；非 .html 整個區塊不出現（原本那句「只有 .html 才能嵌」是在替一顆不存在的按鈕解釋）。用字一併對齊清單語彙：徽章「已嵌入 KPI」→「**在 KPI 清單**」、左欄檢視「已嵌入 KPI」→「**已在 KPI 報表清單**」 | [drive](entities/modules/drive.md)、[kpi-center](entities/modules/kpi-center.md) |

**模式觀察**（PM 視角）：決議多次走「先做 → 發現雙頭管理/定位混淆 → 收斂單一入口」路徑（v2.8 釘選、v3.6 Nav）；引用舊版行為時務必先查本表確認未被推翻。
