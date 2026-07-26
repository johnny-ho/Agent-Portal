---
type: entity
title: Setting 後台
description: Personal 區（全角色）+ Section 管理八 tabs（Seed，2026-07-26 加知識管理）+ IT 管理區（IT Admin）
tags: [module, setting, governance]
updated: 2026-07-26
sources: [PRODUCT_BASELINE.md §6, §13.9–13.11, §13.13]
status: current
---

# Setting 後台（v2.9 起，v3.1 全角色可見）

**結構**：Personal 區（深色模式 / 語言 / 字型，全角色）＋ Section 管理區（僅 Seed）＋ IT 管理區（僅 IT Admin，APP 管理 tab）。是四層治理模型的操作介面，見 [widget-governance](../../concepts/widget-governance.md)。

## Section 管理八 tabs（Seed）

| Tab | 功能 |
|-----|------|
| 權限管理 | Seed / Member / Viewer 三角色、純 By User 加入、預設規則、封鎖清單 |
| 課佈告欄 | 公告 CRUD、草稿/發布、發布即時上 Home |
| KPI Summary | KPI 啟停、黃/紅閾值、拖曳排序、即時預覽 |
| KPI 報表管理（v3.9） | 報表來源設定，見 [kpi-center](kpi-center.md) |
| Application | 課級應用分組、必選標記，反映 Home 課的應用 widget |
| Skill 管理 | 輔助判斷與 SOP 的清單、詳情（Scope／Description／Graph／Test & Dry-run）、Signoff、Ask AI，見 [agent-skill-tiering](../../concepts/agent-skill-tiering.md) |
| 知識管理（2026-07-26 新增） | 課上知識文件的引入、審核與被引用關係，見 [knowledge-base](knowledge-base.md) |
| 首頁排版（v3.7） | Row-based widget 管理（Picker 依課過濾 + singleton 約束、per-widget 編輯面板、跨 tab 跳轉） |

## 現況與注意

UI 完整、操作全 mock（F-DB 相關後端未實作）。**新需求**：[權限 Gate backlog](../../sources/backlog-access-permission-gate.md) 在 Setting 權限管理之外新增了**平台入口層**的二元權限檢查——兩者關係（入口 gate vs 課內角色）尚未在 baseline 明文整合。
