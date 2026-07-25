---
type: entity
title: Personas（六種角色）
description: EE / PE / MFG / 課長 / Seed / IT 管理員 — 職責、Portal 場景、關鍵指標與治理邊界
tags: [persona, roles]
updated: 2026-07-11
sources: [PRODUCT_BASELINE.md §5, §7.2]
status: current
---

# Personas

**組織前提**：角色嚴格分開（不兼任）；課（Section）是資料範圍邊界；工程師輪班，異常經交接反映在 Priority Feed。

| Persona | 核心職責 | 課級關鍵指標 | Portal 重點 |
|---------|---------|-------------|------------|
| **EE 設備工程師** | 設備維修、PM、FDC 異常 | 稼動率、MTTR、PM 達成率、FDC 異常台數、Unclose Case | 開班掃課況 → Priority Feed → EE Agent 根因 → 帶參跳 FDC Console |
| **PE 製程工程師** | Recipe、SPC 監控、DCR 審核、良率 | 良率、SPC OOC、再發 Alarm、待審 DCR、待更新 Skill | SPC OOC → EE 移交的製程評估 → 帶參跳 SPC Console / MES |
| **MFG 製造工程師** | 產能、WIP 調度、排程、跨課協調 | 產出達成率、線體稼動率、準時交貨、WIP、Priority Lot | 排程衝突 → 停機影響 → AI 交班摘要 → 跳 MES |
| **課長** | 課的決策 | — | **不設獨立 View**：用「課長角色預設 Widget 集」（聚合 KPI、任務熱度、待決策事項）；Priority Feed 預設不顯示。⚠️ 尚未實作（P2 缺口） |
| **Seed** | 課的 Portal 配置管理（本質是工程師） | — | [Setting 後台](modules/setting.md) 七 tabs；一課可多位 Seed 避免單點失敗 |
| **IT 管理員**（v3.2） | 平台層 Function Tree 維護 | — | 僅管功能目錄結構，不碰課內資料；accent 紫 #7C3AED |

治理邊界（誰能改什麼）見 [widget-governance](../concepts/widget-governance.md)。用戶研調痛點（系統被動、缺判斷依據、誤判成本高、行政 40%+、資料孤島）見 [overview](../overview.md)。
