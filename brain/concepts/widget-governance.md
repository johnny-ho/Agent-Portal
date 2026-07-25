---
type: concept
title: Widget 架構與四層治理
description: Platform / IT / Section / Personal 四層誰管什麼；Widget Contract 是規模化的關鍵未完成項
tags: [concept, architecture, governance]
updated: 2026-07-11
sources: [PRODUCT_BASELINE.md §7.2, §7.5, scrum_teaming.md F-DB-07]
status: current
---

# Widget 架構與四層治理

## 四層治理模型

| 層 | 管理主體 | 範疇 |
|----|---------|------|
| Platform | 開發團隊 | 頁面骨架、Zone 結構、Widget 類型與 Contract、Nav |
| IT（v3.2） | IT 管理員 | 全平台 Function Tree、功能展示開關 |
| Section | Seed | Section Zone 內容排列、課的應用、KPI 書籤、必選標記 |
| Personal | 工程師 | APP Center 釘選、個人偏好 |

**邊界**：Section Zone 個人不可動；Personal Zone Seed 只能透過「必選」推送；**Priority Feed 由 AI 生成，任何層都不可配置**。

## Widget 類型（確認清單）

Seed 層：`bulletin`、`kpi-summary`、`app-launcher`、`must-be-zero`、`kpi-grid`、`kpi-report`、`aggregated-kpi`（課長）、`decision-queue`（課長）；AI 層：`priority-feed`；已移除：`my-pins`（v2.8）。

## Widget Contract（規模化命脈，未完成）

現況是 Component 級靜態模擬。Contract 要求：標準資料格式與 API 規範、最大尺寸、**載入 timeout <1s（廠內 VPN）**、帶參跳轉規範。F-DB-07 時程：v1 規格 2026-07-31、首批 3 個 widget 重構 2026-08-31。Contract 是「平台引力模型」的供給側基礎，見 [ecp-strategy](ecp-strategy.md)。
