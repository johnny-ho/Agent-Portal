---
type: entity
title: Schedule 排程中心
description: 課級 Skill 定時執行 — 唯一允許 AI 主動的場景，受 Human-in-the-loop 三重約束
tags: [module, scheduling, ai]
updated: 2026-07-25
sources: [PRODUCT_BASELINE.md §8.1, §13.7, scrum_teaming.md F-AI-04]
status: current
---

# Schedule 排程中心（v2.6）

**定位**：課級 Skill 定時執行（Nav 第 6 位，獨立 Tab）。是[被動查詢原則](ai-chat.md)的**唯一例外**，主動性受三重約束：(1) 執行的是課員預設的 Skill 與排程，非 AI 自主判斷；(2) 所有 MCP tool 呼叫需人工確認（Human-in-the-loop）；(3) 執行紀錄對全課公開，任何課員可查閱介入。

## 頁面

排程清單 / 執行紀錄（可展開步驟）/ HITL Banner / 延伸討論跳轉 AI Chat。

## 現況與缺口

UI ✅、後端未實作。F-AI-04：cron 觸發、**Claim 鎖定**（first-write-wins，建議 15 分鐘 timeout 自動釋放）、執行歷史持久化、失敗通知。「＋新增」與「編輯排程」為 placeholder，待 F-AI-03 Skill 管理 UI（含 MCP tool 授權選用介面）。

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

**資料模型**：`run.interventions[]` 成為唯一的介入稽核序列，取代舊的 `run.handler` 與 `steps[].decisionBy`（兩者語意重疊、且舊 UI 在決定完成後反而不顯示）。每筆記 `{ actor, action, stepNum, at, reason, toolCall }`，`toolCall` 記下「因為誰的確認，AI 呼叫了哪個 tool、帶什麼參數、回什麼」。**步驟的最終狀態不寫死在資料裡**，改由 `getRunView(run, sessionIvs)` 從介入紀錄推導（拒絕 → 其後全部不執行；略過 → 流程繼續；未決定的第一個需確認步驟＝當前決策點）。`getPendingDecisions(personaKey, decisions)` 是 Nav 紅點與左欄待決定匯總的單一真相。

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
- **未做（留給後續 Phase）**：D 可加入的 Codify 可發現性（已掛排程不排除、無搜尋、無反向入口）；E 節點明細呈現與 Graph 實走路徑（`tool`／`params`／`durationLabel`／`rows` 欄位已進資料層，畫面尚未用上）。另仍未做：結果異常偵測（與前 N 次比較）、定期自動重跑 dry run。

⚠️ 本輪**無法做瀏覽器實測**——`shell.html` 依賴 unpkg CDN，本 session 網路政策擋住外連。改以 Babel 本地編譯（等價於瀏覽器內 `@babel/standalone`）＋ 對 `getRunView`／`getPendingDecisions` 的 23 項行為驗證通過。

## 專屬 OQ

~~SCH-OQ-1 Claim timeout 機制~~ **作廢**（2026-08-01：不再有認領鎖）→ 改為新題 **SCH-OQ-7 決策等待逾時策略**（升級通知門檻、是否自動終止）；SCH-OQ-2 Skill 編寫介面與 MCP tool 授權（高）；SCH-OQ-3 執行 context 持久化規格（高）；~~SCH-OQ-4 延伸討論結果是否回寫執行紀錄~~ **作廢**（延伸討論已移除）；SCH-OQ-5 失敗重試策略；SCH-OQ-6 排程建立/編輯 UI。彙整見 [open-questions](../../open-questions.md)。
