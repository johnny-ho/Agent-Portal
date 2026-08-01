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

**模式觀察**（PM 視角）：決議多次走「先做 → 發現雙頭管理/定位混淆 → 收斂單一入口」路徑（v2.8 釘選、v3.6 Nav）；引用舊版行為時務必先查本表確認未被推翻。
