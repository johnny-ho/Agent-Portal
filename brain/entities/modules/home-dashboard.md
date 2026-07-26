---
type: entity
title: Home（工作站首頁）
description: Section Zone（Seed 配置 widgets）+ Personal Zone（My Tasks 全高面板）+ AmbientBar
tags: [module, dashboard]
updated: 2026-07-11
sources: [PRODUCT_BASELINE.md §6, §7.1, §7.4, §13.12–13.14]
status: current
---

# Home — 工作站首頁

**定位**：「工作站」不是 KPI 儀表板——KPI 深入分析移到 [KPI 報表中心](kpi-center.md)；Home 看**當前狀態**（一眼）。核心體驗：「有人幫我把工具和資訊整理好，進來就可以開始工作」。

## 佈局

- **Section Zone**（Seed 配置，`homeLayout` row-based 渲染，v3.7）：課佈告欄 → Tool Status（全寬）→ Case + Lot Hold（各 1/2）→ KPI Summary（可收合 3×2）→ 課的應用
- **Personal Zone**（v3.8）：My Tasks **全高右側面板**（原 widget 卡片改制）；sticky header、獨立捲動、可往右收合。任務 P1/P2/P3 由發起人指定、不自動重排、P1 置頂
- **AmbientBar**：底部常駐課上下文快問欄（AI 入口之一）

## 交班觸點（2026-07-25 改）

[Handover 模組已廢除](handover.md)，交班改由 SOP 排程產出驅動，Home 是「今天這份」的觸達點：`BulletinWidget` 取 `getLatestHandoverReport()` 組成置頂公告（標「SOP 產出」），公告上的「補充交代事項並送出交班」是 `ShiftHandoverModal` 的入口（此入口為本次新增——原本的 `SectionHeader` 發起交班按鈕是死碼，已刪）。Modal 以產出預填、標籤為「SOP 已算好 · 可編輯」，人補判斷送出後，交班記錄取代那則自動公告。**數字機器算，判斷人給。**

## 現況與缺口

已實作 ✅（v3.9 mock）。缺口：Must-be-zero 橫幅元件已建**未掛載**（F-DB-02）、Priority Feed 為 mock 卡片（F-DB-01）、課的應用 deep-link 未實作（P3）。「我的釘選」widget 已於 v2.8 **移除**——釘選統一在 [APP Center](app-center.md)，見 [decisions](../../decisions.md)。

治理規則（Section Zone 由 Seed、Personal Zone 由個人、Priority Feed 由 AI 且任何層不可配置）見 [widget-governance](../../concepts/widget-governance.md)。
