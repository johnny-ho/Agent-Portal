---
type: entity
title: 交班中心（已廢除）
description: 獨立交班模組於 2026-07-25 決議廢除 — 交班降級為一個 SOP 的排程產出，功能去向見本頁
tags: [module, handover, deprecated]
updated: 2026-07-25
sources: [PO 決議 2026-07-25, PRODUCT_BASELINE.md §13.2, §13.5]
status: stale
---

# 交班中心（❌ 已廢除，2026-07-25）

> **PO 決議（2026-07-25）**：`HandoverPage` 未來不會存在，直接刪除。Schedule 的產物最終在 **Schedule 內檢視**，而非獨立的 handover page。

**這個決定刪的是模組，不是功能。** 交班從「一個模組」降級為「**一個 SOP 的排程產出 + 既有觸點**」——本來就不該為一份報表開一個模組。

## 原設計（保留備查）

班對班（不是人對人）的結構化交班，全頁面設計，三班制（日 08–16 / 小夜 16–00 / 大夜 00–08）。交班內容依課別差異化（機台事件 EE only、製程事件 PE only、產線事件 MFG only；KPI / Case / 交辦三課共通）。**Case Center 五欄格式不可簡化**：問題描述 / 已做檢查 / 檢查結果 / 已做處置 / 後續動作。Sprint 1 四階段狀態機、區塊獨立確認、進度條；Sprint 2 歷史記錄 tab。Nav 自 2026-04-30 大老闆決議起即隱藏。

## 實際盤點：交班有三個觸點，只刪第一個

| # | 位置 | 處置 |
|---|---|---|
| 1 | `HandoverPage.jsx`（62KB / 1,011 行，獨立頁、Nav 隱藏；App.jsx:631、702 兩處路由） | **✅ 已刪除（2026-07-25）** |
| 2 | `ShiftHandoverModal` → 提交後經 `handoverRecord`（App 層 state）進 `BulletinWidget` 成置頂公告 `type:'handover'` | **✅ 已換角色**：以 SOP 產出預填，入口改掛佈告欄公告 |
| 3 | ChatPage 的「準備交班摘要」quick prompt（三 persona 皆有） | 保留 |

⚠️ **刪除時不可連 `handoverRecord` / `onHandoverSubmit` / `showHandoverModal` 一起清**——那是觸點 2 的線，仍在使用。

### ⚠️ 發現（2026-07-25 刪除時實測）：ShiftHandoverModal 目前沒有觸發入口

原以為「Home header 的『發起交班』按鈕開啟 Modal」，實測**該按鈕所在的 `SectionHeader`（`SectionPage.jsx:403`）是死碼**——`src/` 內零引用，Home 頂端那條 header 早已由 `App.jsx` 自繪取代。故 `setShowHandoverModal(true)` **全專案無人呼叫**，Modal 進不去。此為刪除前既有狀態（在 `main` 上已如此），非本次刪除造成。

`ShiftHandoverModal → handoverRecord → BulletinWidget` 這條線本身**驗證完好**：以強制開啟的 probe build 實測，送出後佈告欄立即出現置頂【交班記錄】公告。

→ **已於 2026-07-25 解決**：入口改為**佈告欄那則 SOP 產出公告上的「補充交代事項並送出交班」**，`SectionHeader` 死碼已刪除。

## 新的交班樣貌（2026-07-25 已實作）

```
SOP「整理當班交接報告」（Seed 對話式建立，唯讀、零 LLM）
      ↓ 排程每日 19:30 自動執行
產出 ──┬─→ Schedule 執行紀錄        ＝ 檔案櫃（可回溯所有班次、看有沒有跑失敗）
       └─→ Home 課佈告欄置頂公告     ＝ 今天這份（接班第一眼觸達）
              ↓
        ShiftHandoverModal 開啟時已預填 → 人補判斷與交代事項 → 送出
```

### 為什麼需要兩個出口：檢視 ≠ 觸達

Schedule 在 Nav 第 6 位（最後一個），而交班是「開班第一眼」的事——那是 [overview](../../overview.md) 的核心價值主張。**沒有人接班會先去點 Schedule。**

- **Schedule = 檔案櫃**：回溯所有班次的產出、確認排程有沒有失敗
- **Home 佈告欄 = 今天這份**：第一眼觸達。這條路**已經存在**（`SectionPage.jsx:1066`、`2167–2175`），原本由人填 Modal 產生，改由 SOP 產出填即可，不需新設計

### `ShiftHandoverModal` 換角色

| | 原本 | 之後 |
|---|---|---|
| 開啟時 | 空白表單，人從零填 | **SOP 已產出的資料彙整預填好** |
| 人要做什麼 | 全部自己寫 | 補判斷與交代事項 |

比純自動更好，且正好是 HITL 的體現：**數字機器算，判斷人給**（[design-principles](../../concepts/design-principles.md) 第 4 條）。

## 對其他頁面的影響

- **[antd-migration-plan](../../concepts/antd-migration-plan.md)**：Phase 6 原為 HandoverPage(1,011) + App.jsx(634)，現**只剩 App.jsx**，淨省 1,011 行不必遷移
- **[ecp-strategy](../../concepts/ecp-strategy.md)**：「值班交接是戰略切入點」的定位**不變**，但載體從獨立模組改為 SOP 產出
- **[sitemap](../sitemap.md)**：產品地圖移除 Handover 節點；第三股互動流改寫
- **[open-questions](../../open-questions.md)**：W-2（交班何時恢復主 Nav）→ **已解決：不恢復，廢除**
- **[scheduling](scheduling.md)**：執行紀錄需能展示產出物本身，不只步驟
- **[agent-skill-tiering](../../concepts/agent-skill-tiering.md)**：交接報告是 SOP 型的旗艦範例（唯讀、可排程、零 LLM）
