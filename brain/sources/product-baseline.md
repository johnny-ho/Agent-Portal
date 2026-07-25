---
type: source
title: PRODUCT_BASELINE.md（v3.9）
description: 產品基準文件 — 定位、personas、模組規格、UI/UX 決策、AI 原則、OKR、13 節戰略決議
tags: [source, baseline]
updated: 2026-07-11
sources: [PRODUCT_BASELINE.md]
status: current
---

# PRODUCT_BASELINE.md（v3.9, 2026-05-07）

**地位**：本專案唯一的完整產品規格書，1440 行，PO 已確認。所有 entity / concept 頁面的主要來源。

## 結構地圖（查原文時用）

| 章節 | 內容 | 對應 wiki 頁 |
|------|------|-------------|
| §1–3 | 定位 / 痛點 / 願景 | [overview](../overview.md) |
| §5 | 六種 Personas | [personas](../entities/personas.md) |
| §6 | Nav 結構與模組現況表 | 各 [模組頁](../index.md#模組) |
| §7 | 工作站定位、四層治理、Widget 架構 | [widget-governance](../concepts/widget-governance.md) |
| §8 | AI 被動查詢原則、四個 AI 入口、Ask AI 規範 | [ai-chat](../entities/modules/ai-chat.md) |
| §9 | 外部系統整合地圖（唯讀層 / 雙向層 / 知識層 / Agent 層） | [ecp-strategy](../concepts/ecp-strategy.md) |
| §10 | 八條設計原則 | [design-principles](../concepts/design-principles.md) |
| §11–12 | OKR 四組、OQ-1~9 | [open-questions](../open-questions.md) |
| §13.1–13.3 | ECP 下一代、交接切入點、平台引力模型 | [ecp-strategy](../concepts/ecp-strategy.md) |
| §13.4 | 程式碼現況與功能缺口 | [overview](../overview.md) |
| §13.5–13.15 | 各模組設計決議（版本演進） | 各模組頁 + [decisions](../decisions.md) |

## 閱讀注意

- §13 小節編號**非嚴格遞增排列**（13.10 出現在 13.8 / 13.9 之前），grep 章節時勿假設順序
- 版本演進資訊散落在各節的粗體標記（v2.5–v3.9），已彙整至 [decisions](../decisions.md)
