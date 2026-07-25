---
type: source
title: scrum_teaming.md（v1.0）
description: 兩隊分工文件 — AI 團隊 / Dashboard 團隊的模組切分、Key Features、OKR、依賴管理
tags: [source, team, okr]
updated: 2026-07-11
sources: [scrum_teaming.md]
status: needs-review
---

# scrum_teaming.md（v1.0, 2026-04-25）

**地位**：後續開發的分工與 OKR 規劃。⚠️ **狀態為「草稿，待 PO 確認」**——引用其 OKR 數字時需註明尚未定案。

## 核心內容

- 以「功能屬性」切分兩個平行 Scrum 團隊：**AI 團隊**（LLM / RAG / MCP / Scheduling 後端）與 **Dashboard 團隊**（系統整合 / Widget Contract / 資料串接），詳見 [teams](../entities/teams.md)
- 各隊 5–7 個 Key Features（F-AI-01~05、F-DB-01~07）與四組 OKR，時間範圍 2026 Q2–Q3，評量基準日 2026-10-24
- §5 依賴管理表：Task AI 標記 API、Priority Feed context、Ask AI context schema、MCP×Scheduling、Widget Contract review — 均由 PM 協調
- Sprint 節奏：2 週 / 共同 Review / 週三跨隊同步 / 2026-07-25 OKR 中期檢核

## 與 baseline 的對應

Key Features 大致對應 baseline §13.4 的功能缺口表；OKR 是 baseline §11 OKR 的團隊級展開（數字更細）。**注意**：本文件寫於 v3.7 之前（2026-04-25），未反映 v3.8 My Tasks 面板與 v3.9 KPI 報表管理的變更。
