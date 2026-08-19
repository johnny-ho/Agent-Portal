---
type: concept
title: Widget 架構、四層治理與使用者角色
description: Platform / IT / Section / Personal 四層誰管什麼；使用者權限比照 FOD 三角色（Seed / Member / Viewer）；Widget Contract 是規模化的關鍵未完成項
tags: [concept, architecture, governance, permission]
updated: 2026-08-19
sources: [PRODUCT_BASELINE.md §7.2, §7.5, scrum_teaming.md F-DB-07, PO 指示 2026-08-19]
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

## 使用者角色：比照 FOD 三角色（PO 定案 2026-08-19）

**權限模型沿用 FOD**，使用者不需重新設定一套：

| 角色 | 能做什麼 | 對應治理層 |
|------|---------|-----------|
| **種子 Seed** | 調整課的工作區：首頁放什麼、課用哪些應用、KPI 書籤、知識文件與排程流程 | Section |
| **成員 Member** | 日常值班使用：處理自己的任務、決定排程停下來的步驟、個人釘選、問 AI | Personal |
| **瀏覽者 Viewer** | 唯讀檢視課況與報表，不做異動；適合跨課支援或需了解進度者 | （新增） |

**與四層治理的關係**：四層講的是「**什麼設定歸哪一層管**」，三角色講的是「**哪個人有哪一層的權限**」，兩者互補不衝突。Seed ↔ Section 層、Member ↔ Personal 層。

⚠️ **Viewer 是本次新增的角色**，四層治理原本只有 Seed 與工程師兩種人，無唯讀角色。UI 與資料層**尚未實作**，目前僅出現在[官網](../entities/marketing-site.md)文案。落地時要決定：Viewer 看不看得到 Priority Feed、能不能看 My Tasks（他人的任務）、跨課支援者如何被授予。

**沿用 FOD 的產品意義**：導入阻力最低 —— 課上原本的角色設定直接帶過來，不用重建，這是官網的主要賣點之一。

## Widget 類型（確認清單）

Seed 層：`bulletin`、`kpi-summary`、`app-launcher`、`must-be-zero`、`kpi-grid`、`kpi-report`、`aggregated-kpi`（課長）、`decision-queue`（課長）；AI 層：`priority-feed`；已移除：`my-pins`（v2.8）。

## Widget Contract（規模化命脈，未完成）

現況是 Component 級靜態模擬。Contract 要求：標準資料格式與 API 規範、最大尺寸、**載入 timeout <1s（廠內 VPN）**、帶參跳轉規範。F-DB-07 時程：v1 規格 2026-07-31、首批 3 個 widget 重構 2026-08-31。Contract 是「平台引力模型」的供給側基礎，見 [ecp-strategy](ecp-strategy.md)。
