---
type: entity
title: Task 派工管理
description: 課長派工 / 平面列表 + Drawer / 歷史 7 天；PE/MFG 資料與 AI 自動標記為主要缺口
tags: [module, task]
updated: 2026-07-25
sources: [PRODUCT_BASELINE.md §13.6, scrum_teaming.md F-DB-05, src/components/TaskManagementPage.jsx]
status: current
---

# Task 派工管理（v2.5）

**定位**：跨角色任務執行（Nav 第 4 位）。課長總覽 / 快速派工（AssignPanel，多人多行）/ 平面列表 + 右側 Drawer / 歷史記錄 7 天。資料在 `src/data/tasks.js`。

與 [Home](home-dashboard.md) My Tasks 面板的關係：Task 頁是管理視角（派工、總覽），My Tasks 是個人執行視角（Priority Feed）。與 [Schedule](scheduling.md) 的關係：Schedule 是「Task 的時間維度」，維持獨立 Tab 不降級（v3.6 決議）。

## 實作現況

UI 已於 2026-07-25 完成 **AntD 遷移 Phase 2**（見 [antd-migration-plan](../../concepts/antd-migration-plan.md)）：列表改 `Table` 樹狀資料（主任務 → 子任務，原自製展開鈕退場）、詳情改 `Drawer`、派工面板改 `Input`/`Select`/`DatePicker`。分組（進行中按成員、歷史按日期）與所有既有互動（deep-link 開單、成員篩選、狀態篩選、子任務完成、新增子任務）行為不變。

## 缺口（優先序最高的模組）

- **P1**：AI 自動標記——派工後機台 / Chamber / Recipe 自動推斷，目前 `aiTags: true` placeholder。依賴 AI 團隊提供推斷 API（跨隊依賴，見 [teams](../teams.md)）
- **P2**：PE / MFG 課任務資料補全（MFG 無 Chamber/Recipe 欄位差異要處理）

## 專屬 OQ

TM-OQ-1 AI 標記觸發時機與信心閾值（高）；TM-OQ-2 與 Case Center 工單關聯（一對一 or 一對多）；TM-OQ-3 成員視角是否隱藏他人任務；TM-OQ-4 逾期通知機制；TM-OQ-5 三課欄位對齊。彙整見 [open-questions](../../open-questions.md)。
