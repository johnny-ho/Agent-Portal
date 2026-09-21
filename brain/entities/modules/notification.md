---
type: entity
title: Notification 通知中心（v1 已實作）
description: 四類通知（Schedule 完成 / 需人工決定 / 被指派 P1 / 執行失敗）+ Header 鈴鐺 + Setting→Personal→Notification 獨立設定頁（以課為範圍）；Teams 僅設定 UI 不 mock
tags: [module, notification, backlog]
updated: 2026-09-21
sources: [PO 決議 2026-07-24、實作 2026-07-24、PO 決議 2026-09-21 設定頁搬家]
status: current
---

# Notification 通知中心（v1 已實作）

> **實作完成（2026-07-24）**：以 AntD Badge/Popover/List/Switch 實作，緊接 [AntD 遷移 Phase 0](../../concepts/antd-migration-plan.md) 後動工並兼作遷移試點。
> 新增 `src/data/notifications.js`（NOTIFICATIONS_BY_PERSONA / NOTIF_TYPES / DEFAULT_NOTIF_PREFS）、`src/components/NotificationCenter.jsx`（NotificationBell）。
> App.jsx：per-persona 通知清單 + 偏好狀態提升、header 鈴鐺、deep-link（`expandRunReq` → SchedulingPage）；SettingPage Personal tab 通知矩陣；SchedulingPage 接 `expandRunReq` effect。
> Nav 紅點已收編為單一真相：站內開啟的未讀 N2。三個 deep-link（N2→scheduling 展開 run、N3→tasks 開單、標已讀/badge 遞減）皆瀏覽器實測通過，light/dark 皆正常。
> ⚠️ **2026-08-01 更正**：Schedule 的 Nav 紅點**改綁「實際還有未決定的決策點」**（`getPendingDecisions`），不再綁未讀 N2 —— 通知讀過不代表事情處理了，兩者是不同的東西。其他 deep-link 行為不變。N2 文案由「需人工介入／需介入」改為「需人工決定／需決定」，並寫明任何課員都可以決定（見 [scheduling](scheduling.md) 決議 17）。**執行失敗仍無對應通知類型**（N1/N2/N3 都不涵蓋），列在 Schedule Phase C 待補。

> ⚠️ **2026-09-21 設定入口搬家（決議 24）**：通知設定從「個人偏好」頁的一個區塊**升為 Setting → Personal 分類下的獨立項目「Notification」**（排序在個人偏好與 Quick Prompt 之間），並補上**適用範圍提示列**。
> 資料層本來就是 per-persona（`notifPrefsByPersona`），切課本來就會換一組設定 —— 但 UI 上一個字都沒提，使用者會把它讀成全域個人設定，切課後發現開關變了會當成 bug。這次補的是**看得見的範圍宣告**，不是新行為。
> 文案定調：「**以下是你個人在本課的通知設定。切換右上角課別後，看到的是該課各自的設定。**」——「你個人」三個字不能省，否則會被讀成 Seed 在替全課配置，與 Personal 層治理原則（Seed／課長不可代管他人通知）衝突。
> 呈現用**平述不用警示**（依決議 18／22 資訊層級收斂：穩定狀態被反覆警示＝溝通疲勞）。刻意不做跨課對照表——一列出「你在另外兩課設了什麼」就變成跨課管理介面，超出 Personal 層定位。
> 順手修掉一個既有缺陷：非 Seed／非 IT 用戶原本只要 activeTab 不是 `personal` 就會被彈回（連 Quick Prompt 都待不住），改為 Personal 分類白名單 `['personal','notification','quickprompt']`。

**定位**：系統主動提示層——「被動查詢原則」的第二個例外（第一個是 [Scheduling](scheduling.md)）。只告知 + deep-link，不代做判斷。原則約束：

- **低摩擦**：清除/忽略不留紀錄；**不回報已讀狀態給派工者或課長**（連結「不做監視工具」警訊，見 [product-review](../../concepts/product-review-2026-07.md) 第 4 點負面清單）
- **Personal 層**：個人自行開關；Seed 與課長不可代管、不可查閱他人通知（見 [widget-governance](../../concepts/widget-governance.md)）

## 通知類型與預設（PO 已確認）

| # | 類型 | 觸發來源 | 站內預設 | Teams 預設 |
|---|------|---------|---------|-----------|
| N1 | Schedule job 完成 | `SCHEDULING_DATA` runs `result: done` | ✅ | ❌ |
| N2 | Schedule job 需人工決定（HITL） | runs `result: pending` | ✅ | ✅ |
| N3 | 我（AR=被指派人本人）被指派 P1 任務 | `tasks.js` 指派人=我 且 P1 | ✅ | ✅ |
| **N4** | **Schedule job 執行失敗**（2026-08-01 新增） | runs `result: error` | ✅ | ✅ |

> **N4 為什麼 Teams 也要開**：排程失敗多半發生在無人的班次（`run-eq-004-3` 就是昨日 23:30 掛的），只放站內等於沒人看到。這一類原本完全沒有通知——N1 只涵蓋完成、N2 只涵蓋待決定，兩筆 error run 在 `notifications.js` 一則都沒有，是「異常容易被查看」這個目標最大的洞。
> 實作上 `SettingPage` 的 `NOTIF_TYPE_LIST` 與 `App.jsx` 的偏好初始化都改為從 `DEFAULT_NOTIF_PREFS` 推導，之後再新增類型不必回頭改三個地方。

**明確不做（v1）**：~~失敗通知~~ **已於 2026-08-01 補上（N4）**；發起人的回向通知（如「P1 已完成」）；Teams 推送的任何 mock 行為——**Teams 只在設定 UI 呈現逐則推送開關並持久化狀態**，真實整合列 W-5（見 [open-questions](../../open-questions.md)）。

## UI 與互動

1. **入口**：統一 Header（40px）右側、搜尋框旁鈴鐺 + 未讀數 Badge；點開 Popover 面板（未讀置頂、全部標為已讀、逐則點擊 → deep-link + 標已讀）
2. **歷史**：Popover 內保留 **7 天**（與 Task 歷史一致），不做獨立通知頁
3. **Deep-link**：N3 → `setNav('tasks')` + `taskOpenId`（App.jsx 既有）；N1/N2 → `setNav('scheduling')` + 新增 `expandRunId` prop 展開該筆執行紀錄
4. **收編既有紅點**：Nav 上 `schedulingHasPending` 紅點邏輯併入通知系統，單一未讀真相來源
5. **設定**：SettingPage → Personal → **Notification**（2026-09-21 起為獨立項目）：頁首「適用範圍」列（課名膠囊 + 一句範圍說明）+ 4 類型 × 2 通道（站內 / 同步 Teams〔逐則〕）開關矩陣。原本掛在「個人偏好」頁底的通知區塊已整塊移出，該頁只剩外觀／語言／顯示
6. **實作採 AntD**（Badge / Popover / List / Switch / Segmented），依賴 [AntD 遷移計畫](../../concepts/antd-migration-plan.md) Phase 0

## 改動檔案（執行 agent 範圍）

- 新增：`src/data/notifications.js`（mock）、`src/components/NotificationCenter.jsx`
- 修改：`App.jsx`（通知清單 + 偏好 per-persona 狀態提升、header 鈴鐺、deep-link 接線）、`SettingPage.jsx`（通知設定區塊 → 2026-09-21 改為獨立 `NotificationSettingTab`，吃 `p` 拿課名）、`SchedulingPage.jsx`（`expandRunId`）、`build.py`（`JS_MODULES` 加檔，順序在 App.jsx 之前）
- 規模：小～中（1–2 天等級）
