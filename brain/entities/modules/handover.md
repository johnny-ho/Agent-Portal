---
type: entity
title: 交班中心（隱藏）
description: 班對班的結構化交班流程 — 戰略切入點功能，已完成 Sprint 1+2 但不掛主 Nav
tags: [module, handover]
updated: 2026-07-11
sources: [PRODUCT_BASELINE.md §13.2, §13.5, scrum_teaming.md O3]
status: current
---

# 交班中心（Sprint 1 + 2，Nav 隱藏）

**戰略地位**：整個 Portal 的切入點功能（[ecp-strategy](../../concepts/ecp-strategy.md)）——對老手無侵入、天然驅動跨系統整合、成效可量化。⚠️ 弔詭之處：戰略上最重要，Nav 上卻隱藏（功能保留），值得在 roadmap 討論時追問定位。

## 核心設計

- **班對班，不是人對人**：交接單位是班；全頁面設計（不用 Modal），標題如「日班 → 小夜班」。三班制：日（08–16）/ 小夜（16–00）/ 大夜（00–08）
- 交班內容依課別差異化（機台事件 EE only、製程事件 PE only、產線事件 MFG only；KPI / Case / 交辦三課共通）
- **Case Center 五欄格式不可簡化**：問題描述 / 已做檢查 / 檢查結果 / 已做處置 / 後續動作
- Sprint 1：4 階段狀態機、區塊獨立確認、進度條、重新發起。Sprint 2：歷史記錄 tab（雙欄、搜尋、班別 filter、時間線）
- Dashboard 整合：`handoverRecord` 提升至 App 層，送出後即時置頂於課佈告欄

## 缺口

歷史持久化為 mock（KR3.1 目標 2026-07-31 前完成，**時程緊迫**）；bulletin 整合後端同期。
