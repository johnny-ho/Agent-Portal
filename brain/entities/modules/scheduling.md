---
type: entity
title: Schedule 排程中心
description: 課級 Skill 定時執行 — 唯一允許 AI 主動的場景，受 Human-in-the-loop 三重約束
tags: [module, scheduling, ai]
updated: 2026-08-01
sources: [PRODUCT_BASELINE.md §8.1, §13.7, scrum_teaming.md F-AI-04]
status: current
---

# Schedule 排程中心（v2.6）

**定位**：課級 Skill 定時執行（Nav 第 6 位，獨立 Tab）。是[被動查詢原則](ai-chat.md)的**唯一例外**，主動性受三重約束：(1) 執行的是課員預設的 Skill 與排程，非 AI 自主判斷；(2) 所有 MCP tool 呼叫需人工確認（Human-in-the-loop）；(3) 執行紀錄對全課公開，任何課員可查閱介入。

## 頁面（2026-08-01 決議 18 起）

**執行總覽是本頁主畫面**（進入預設落點）：全課執行時間軸＋置頂待決定＋篩選膠囊。
左欄：**只有排程清單**（含近 7 次失敗數），單一職責＝切換單一排程。
右欄選單一排程 → 麵包屑（`排程中心 ／ XX`）＋決策點面板＋該排程的執行紀錄（產出物／實走路徑／節點明細／介入紀錄）。
**本頁沒有任何 AI 對話出口**（2026-08-01 決議 17）。

## 現況與缺口

UI ✅、後端未實作。F-AI-04 待做：cron 觸發、執行歷史持久化、**決定的併發控制**（前端已是 first-write-wins，需後端落實；~~Claim 鎖定~~ 已不需要，認領機制取消）、通知實際送達。「編輯排程」與「停用」仍為 placeholder（「＋新增」已可用）。

## AntD 遷移

UI 已於 2026-07-25 完成 **AntD 遷移 Phase 4**（見 [antd-migration-plan](../../concepts/antd-migration-plan.md)）：介入橫幅改 `Alert`、步驟清單改 `Timeline`（自訂狀態 dot）、執行紀錄改 `Collapse`、左側排程清單改 `List`+`Card`、「拒絕」加 `Popconfirm`。通知 deep-link 自動展開指定 run、延伸討論帶 context 跳 [AI Chat](ai-chat.md) 等既有互動行為不變。

## 2026-07-25 決議帶來的擴充

依 [agent-skill-tiering](../../concepts/agent-skill-tiering.md)，Schedule 的定位擴大為 **SOP 產出的檔案櫃**：

- **只能掛 SOP**，掛不了輔助判斷（後者每次結果不同、產出是給人看的建議，無人在場即無意義）。新增排程時可選清單只從 **Production 狀態的 SOP 型** 記錄撈
- **執行紀錄要能展示產出物本身**（那份交接報告長什麼樣），不只步驟 —— [Handover 已廢除](handover.md)，其產物改在此檢視
- **含寫入的 SOP 無法真正無人執行**：跑到寫入型 node 會暫停、發通知等人確認才續跑（HITL 前提）。Seed 設排程時須看到「⚠️ 本 SOP 含 N 個需確認步驟，執行到該步驟會暫停並通知你」
- **排程型 SOP 會靜默失效**（資料來源改欄位／系統改 API → 持續產出看似正常但錯誤的報告）→ 需結果異常偵測（與前 N 次比較）＋ 定期自動重跑 dry run
- 知識管理頁的 SOP 詳情提供「設為定期執行」入口，跳轉本頁並預填時間

### 實作狀態（2026-07-25 已完成）

前四項已落地：`SchNewScheduleModal`（只選得到 Production 的 SOP；知識與輔助判斷仍列出但鎖住並寫明原因）、執行紀錄展開先顯示「本次產出」再顯示步驟（沿用知識管理頁的產出渲染，兩邊長一樣）、右上依 `confirmSteps` 顯示需確認步驟數或「可完全自動執行」。資料面 `scheduling.js` 新增 `sch-eq-004`「當班交接報告」（綁 `sm-eq-007`，含一筆設備監控 timeout 的失敗紀錄）與 `getLatestHandoverReport()`。**尚未實作**：結果異常偵測、定期自動重跑 dry run、SOP 詳情的「設為定期執行」入口。

## 2026-08-01 決議：介入機制改寫（決議 17）

PO 指出兩件事：**未來這一段不打算引入 AI 對話**，而且**「舉手認領」根本不該存在**——該做的是把選項直接攤在介入畫面上，誰點了就記下誰、什麼時候點的。

**新的介入模型**：

| 項目 | 舊 | 新 |
|---|---|---|
| 認領 | 先按「✋ 我來處理」搶鎖，才看得到選項 | **取消**。選項直接攤開，一次點擊完成決定 |
| 選項 | 確認執行 / 拒絕 / 💬 延伸討論 | **確認執行 / 略過此步驟 / 拒絕執行**（拒絕即終止整次執行） |
| AI 出口 | 介入可跳 AI Chat；產出物有「針對這份問 AI」 | **全部移除**，本頁不再有任何 AI 對話出口 |
| 誰能決定 | 搶到鎖的人 | **全課成員（Seed + member）皆可**，不需認領、不指定人 |
| 併發 | 畫面上的暫時鎖，重整即失效，不寫進紀錄 | **先送出者定案（first-write-wins）**。後送出者不受理，畫面轉為已成立的結果 —— **B 推翻不了 A** |
| 可否反悔 | 未定義 | **決定不可變更、不可撤回**。要改只能重跑或另做補救動作 |
| 逾時 | SCH-OQ-1 Claim timeout（建議 15 分鐘） | **不做**。決策點持續等待直到有人決定；升級通知與自動終止後期再補 |
| 理由 | 無輸入 | **拒絕必填**、略過選填 |

**資料模型**：`run.interventions[]` 成為唯一的介入稽核序列，取代舊的 `run.handler` 與 `steps[].decisionBy`（兩者語意重疊、且舊 UI 在決定完成後反而不顯示）。每筆記 `{ actor, action, stepNum, at, reason, toolCall }`，`toolCall` 記下「因為誰的確認，AI 呼叫了哪個 tool、帶什麼參數、回什麼」。**步驟的最終狀態不寫死在資料裡**，改由 `getRunView(run, sessionIvs)` 從介入紀錄推導（拒絕 → 其後全部不執行；略過 → 流程繼續；未決定的第一個需確認步驟＝當前決策點）。`getPendingDecisions(items, decisions)` 是 Nav 紅點與左欄待決定匯總的單一真相。

### 實作狀態（2026-08-01 完成，Phase A + B）

- **Phase A 資料層**：`run` 補 `startedAt / finishedAt / trigger / triggeredBy / failure{stepNum,tool,kind,message,retryable} / interventions[]`；`step` 補 `tool / params / system / rows / durationLabel / mcpParams / needsConfirm / onConfirm / onSkip`；歷史 run 的 `handler`／`decisionBy` 全數遷移成 `interventions`。新增 `SCH_DECISION_CFG`、`getRunView()`、`getPendingDecisions()`。
- **Phase B 介入層**：決策點面板攤開三個選項（確認單擊、略過／拒絕走理由 Modal）、`SchInterventionLine` 讓介入痕跡**固定顯示且不再因為決定完成而消失**（舊 UI 的破口）、左欄「本課有 N 件待人工決定」匯總、**Nav 紅點改綁實際未決定的決策點**（原本綁未讀 N2 通知，通知一讀紅點就沒了但事情還卡著）。
- 順手修掉兩個 bug：在 A 課新增的排程會殘留到 B 課；切課後右欄掉回空白（`SchedulingPage` 加 `key={persona}`）。
- **Phase C 執行總覽與異常（2026-08-01 同日完成）**：
  - **左欄新增「執行總覽」入口**（不做右欄 Tabs——總覽是跨排程的，塞進「某一個排程的詳情」裡語意不對；走左欄虛擬項目 `SCH_ALL`，三欄式佈局不變）。右欄顯示全課所有執行、時間倒序，並置頂跨排程的待決定清單。
  - **篩選膠囊**（圓角 999px、選中底 `#2563EB`、無底線）：全部／執行失敗／待決定／**有人介入**。最後一項是稽核視角，一鍵查得到哪幾次是人做的決定。
  - **N4 執行失敗通知**（站內＋Teams 皆開，跟著 N2 走——排程失敗多半發生在無人的班次，只放站內等於沒人看到）。`NOTIF_TYPE_LIST` 與 App 的偏好初始化改為從 `DEFAULT_NOTIF_PREFS` 推導，之後再加類型不必回頭改三個地方。
  - **結構化失敗**：`SCH_FAILURE_KIND_CFG`（逾時／權限／資料缺／未知）＋卡在第幾步＋工具＋原始訊息，取代原本一行 `errorMsg`。
  - **重跑**：`retryable` 的失敗給「↻ 重跑」，`buildRetryRun()` **新增一筆** `trigger:'retry'` 的執行並記下觸發者與 `retryOf`，**原本那筆失敗永遠保留**。重跑結果由資料層的 `retry` 樣板定義（交接報告補跑帶產出物、Recipe 週報補跑）。
  - **左欄近 7 次失敗數**：不穩定的排程自己浮出來。
  - 時間排序用 `getRunTs()` 從 `startedAt` 推導（`今日`／`昨日`／`MM/DD` 三種寫法），不在 20 筆 mock 上各補一個 `ts` 欄位。`SCH_TODAY` 定義 mock 的今日為 2026-04-21。
- **Phase D 可加入的 Codify（2026-08-01 同日完成）**：
  - **已掛排程的 Codify 在選單中鎖住**並寫明「已掛在排程『XX』（時間）」＋「去看那個排程」連結。這是評估時抓到的真 bug——舊版 `blockReason()` 只看 tier/stage，`sm-eq-008` 已掛 `sch-eq-001` 仍可再選一次，會建出重複排程。
  - **`getSkillScheduleMap()` 成為 Codify↔排程的單一真相**（含本 session 新建的排程）。Schedule 的「不能重複掛」與 Skill 管理的「已掛排程」徽章、刪除警語、詳情「生效資訊」全部改讀這一份，**不再讀 `skill.consumedBy`**——兩邊才不會講不一樣的話。
  - 左欄「＋新增」下方常駐「還有 N 份 Codify 可加入排程」（可點，全掛滿時改顯示「都掛上了」），不必打開 Modal 才知道。
  - Modal 加**搜尋**（名稱／用途／標籤）與**選中後的步驟預覽**（步驟號、名稱、工具、哪幾步標「需人工決定」），不必跳回 Skill 管理。
  - **Codify 詳情「設為定期執行」入口**（brain 自 2026-07-25 起列為未實作）：`onScheduleSkill` → App 設 `newScheduleReq` → 跳排程頁並預開 Modal 且預選那份 Codify；**用完即清**（`onNewScheduleHandled`），否則之後每次回排程頁都會再彈一次。
  - 新建的排程從 `SchedulingPage` local state 提升到 App（`schedExtraItems`，per-persona），Skill 端才看得到剛掛上的排程。
- **Phase E 節點與最終結果（2026-08-01 同日完成）**：
  - **節點明細**：每一步顯示 `tool(params)`／來源系統／資料筆數／耗時；自訂計算步驟顯示它憑什麼算。理由是**試跑畫面本來就看得到工具與資料來源，正式執行沒理由看得比試跑少**。
  - **本次實走路徑**：`getRunPath()` 產出「Step 1 → 2 → 4」＋逐條列出沒走的節點與原因。三種「沒走」分得開：**分支未成立**（引擎沒到）／**人工略過**（人到了、決定不做，算走過但標記出來）／**已拒絕後不執行**。`skip` 這個狀態同時涵蓋前兩者，得靠有沒有介入紀錄才分得出來。
  - ⚠️ **Graph 視角沒有做，改成路徑摘要**。原因：`sm-eq-008` 是唯一有 `graph.edges` 的 Codify，用 `buildGraphLevels()` 分層後是**線性的**（分支是 `2→end`），畫出來與 Timeline 一模一樣；為單一個案做一套 run 版 graph renderer 不划算。路徑摘要用同樣的成本涵蓋全部八個排程。要做 graph 的前提是先有真正會分岔的 Codify 資料。
- **仍未做**：結果異常偵測（與前 N 次比較）、定期自動重跑 dry run、決策等待逾時（SCH-OQ-7，PO 指示先做持續等待）。

## 2026-08-01 決議 18：資訊層級收斂（總覽升為主畫面）

PO 在手機上看實機截圖後指出兩件事：

**① 同一件「有東西卡住」被講太多次**。清點後實際有 7 個表面：Nav 紅點、左欄橫幅、排程卡片紅點＋待決定標籤、總覽置頂區塊、待決定膠囊、通知鈴鐺 N2、決策點面板。PO 判斷是**溝通疲勞**，左欄那一份不需要。

分界標準（本次立的）：**通知是推播、狀態是現況、頁內提示是定位**——三者不同層，但「同一個畫面裡講兩次」就是重複。
- 留：Nav 紅點（人在別頁時唯一觸達）、通知鈴鐺（平台層推播）、排程卡片紅點（清單項目的狀態，不講就不知道是哪一個）、總覽置頂區塊（主頁的行動區）
- 刪：**左欄「本課有 N 件待人工決定」橫幅**——與總覽置頂區塊在同一畫面講一模一樣的話

**② 左欄把三種高度疊在一起**（跨排程警示 → 跨排程頁面 → 單一排程），體感混亂；且原本**預設落點是第一個排程**，等於一進門就鑽進細節。

**新結構**：

| 項目 | 舊 | 新 |
|---|---|---|
| 進入預設 | 第一個排程的詳情 | **執行總覽**（`SCH_ALL`） |
| 左欄組成 | 待決定橫幅＋執行總覽入口＋排程清單 | **只有排程清單**（單一職責） |
| 回總覽 | 左欄再點一次「執行總覽」 | **右欄麵包屑** `排程中心 ／ XX`——「我現在在哪」屬於詳情欄的層級，不該塞在清單上方 |
| 詳情頁的跨排程觸達 | 左欄橫幅 | 麵包屑旁一行 `其他排程還有 N 件待決定`（**只算別的排程**，本排程的決策點就在下方不重複；不另開警示區塊） |

⚠️ **接受的取捨**：人正在看 A 排程細節時，不會被主動告知 B 排程剛卡住（Nav 紅點在本頁看不到）。判斷依據是**排程卡住是分鐘～小時級的事，不是秒級**。麵包屑那行計數是補救，不是第二個警示。

**未違反三欄式佈局**：導覽→列表→詳情三欄都在，只是詳情欄的預設內容從「第一個排程」換成「總覽」。

### 實作狀態（2026-08-01 完成）

`SchedulingPage.jsx`：`selectedId` 初值改 `SCH_ALL`；移除左欄橫幅與總覽入口區塊；右欄 header 加 `antd.Breadcrumb` 與 `othersPending`。**本輪有瀏覽器實測**（見下）。

⚠️ A~E 五階段當時**無法做瀏覽器實測**——`shell.html` 依賴 unpkg CDN，proxy 擋住外連（`CONNECT tunnel failed 403`）。改以 Babel 本地編譯＋**91 項行為驗證**全數通過。

✅ **2026-08-01 已解封（實測方法，之後照做）**：unpkg 與 cdn.tailwindcss.com 仍被擋，但 **`registry.npmjs.org` 在 proxy 的 noProxy 名單內**，可直接 `npm install` 同版本依賴（react 18 / react-dom 18 / dayjs 1.11.13 / antd 5.22.5 / @babel/standalone / @tailwindcss/browser）vendor 到本地，build 到暫存目錄後改寫 script src 即可用 Playwright 實跑。**`src/shell.html` 不要改**（repo 保持 CDN 版）。Chromium 用 `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`，npm 裝到的 playwright 版本對不上內建 build，須指定 `executablePath`。

**實測已補驗**：三顆決策按鈕與篩選膠囊的視覺與間距 ✅、節點明細有出資料 ✅、左欄健康度 ✅、「都掛滿了」副標 ✅、決議 18 的八項行為 ✅。**仍待補驗**：理由 Modal 的必填禁用、重跑按鈕在 Collapse header 的 `stopPropagation`、「設為定期執行」跳轉後 Modal 是否正確預選。

⚠️ **實測抓到的新缺口**：① `shell.html` 寫死 `<html data-theme="dark">`，但 App 自身 theme state 蓋過去，實際跑出來是淺色——該行是死屬性。② 本課 Codify 全掛滿時，「＋新增」仍打得開，進去是「可加入 0 份」＋一整排鎖頭、建立鈕灰的，**開了等於白開**（建議全掛滿時停用該鈕，理由寫在旁邊那行字上）。

## 專屬 OQ

~~SCH-OQ-1 Claim timeout 機制~~ **作廢**（2026-08-01：不再有認領鎖）→ 改為新題 **SCH-OQ-7 決策等待逾時策略**（升級通知門檻、是否自動終止）；SCH-OQ-2 Skill 編寫介面與 MCP tool 授權（高）；SCH-OQ-3 執行 context 持久化規格（高）；~~SCH-OQ-4 延伸討論結果是否回寫執行紀錄~~ **作廢**（延伸討論已移除）；SCH-OQ-5 失敗重試策略；SCH-OQ-6 排程建立/編輯 UI。彙整見 [open-questions](../../open-questions.md)。
