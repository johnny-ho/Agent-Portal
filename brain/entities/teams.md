---
type: entity
title: 開發團隊（AI 團隊 / Dashboard 團隊）
description: 兩個平行 Scrum 隊的使命、模組歸屬、Key Features 與跨隊依賴
tags: [team, scrum, okr]
updated: 2026-07-11
sources: [scrum_teaming.md]
status: needs-review
---

# 開發團隊分工（草稿，待 PO 確認）

| | AI 團隊 | Dashboard 團隊 |
|---|---------|---------------|
| 使命 | 讓工程師體驗 AI 協作；排程 + MCP 推自動化 | Portal 成為資訊集散地與課的管理中心 |
| 負責模組 | [AI Chat](modules/ai-chat.md)、Skill 管理、[Scheduling](modules/scheduling.md) 後端、[Knowledge Base](modules/knowledge-base.md)、Ask AI、MCP 整合 | [Home](modules/home-dashboard.md)、[Task](modules/task-management.md)、[KPI](modules/kpi-center.md)、[APP Center](modules/app-center.md)、[交班](modules/handover.md)、[Setting](modules/setting.md)、課長 Persona、系統整合 |
| Key Features | F-AI-01 AI Chat 真實上線 / 02 KB 上線 / 03 Skill 管理 UI / 04 Scheduling 後端 / 05 MCP Tool（FDC、Case Center、MES） | F-DB-01 Priority Feed 真實資料 / 02 Must-be-zero 掛載 / 03 KPI 真實串接 / 04 課長 Persona / 05 Task 補全 / 06 APP Center 後端 / 07 Widget Contract 正式化 |

## 跨隊依賴（PM 協調）

Task AI 標記 API（AI→DB）、Priority Feed AI context（AI→DB，格式先行）、Ask AI context schema（Sprint 1 前對齊）、MCP tool × Scheduling HITL、Widget Contract v1 發布前邀 AI 隊 review。

## 節奏

Sprint 2 週；共同 Review（PO 出席）；週三 30 分跨隊同步；**2026-07-25 OKR 中期檢核**（即將到期）。OKR 細項見 [scrum-teaming 來源頁](../sources/scrum-teaming.md)。
