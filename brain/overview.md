---
type: synthesis
title: Agent Portal 全局綜述
description: 產品是什麼、為誰而做、現在在哪、往哪走 — 進入本專案的第一頁
tags: [overview, strategy]
updated: 2026-07-11
sources: [PRODUCT_BASELINE.md v3.9, scrum_teaming.md v1.0]
status: current
---

# Agent Portal 全局綜述

## 一句話

面向半導體廠區工程師的課級入口平台：**開班第一眼掌握課的今日狀態與自己最重要的事，跨角色協調有明確的發起與接收地點**。定位為 ECP（15 年歷史全廠入口）的下一代，詳見 [ECP 策略](concepts/ecp-strategy.md)。

## 為誰而做

以「課（Section）」為資料邊界與協作單位，服務 EE / PE / MFG 三種工程師、課長、Seed（課的 Portal Admin）、IT 管理員六種 [personas](entities/personas.md)。核心警示來自用戶研調：**「千萬別把這做成給課長看的監視工具」**——工程師覺得能少寫報告、少被罵、少開單，導入才會成功（baseline §2）。

## 產品形狀（v3.9）

左側 Nav 順序（v3.6 大老闆決議）：**Home → KPI → App → Task → AI → Schedule**，Setting 常駐底部；Handover 已實作但隱藏；Knowledge Base 元件已建未掛 Nav。九大模組現況見 [modules/](index.md#模組)。

- Home 是「工作站」不是儀表板：Section Zone（Seed 配置 widget）+ Personal Zone（My Tasks 全高面板，v3.8）+ AmbientBar，見 [home-dashboard](entities/modules/home-dashboard.md)
- AI 採**被動查詢原則**：只在使用者主動發問時回答；唯一例外是 Scheduling（受 Human-in-the-loop 約束），見 [ai-chat](entities/modules/ai-chat.md)、[scheduling](entities/modules/scheduling.md)
- 治理採四層模型（Platform / IT / Section / Personal），擴張靠 Widget Contract「平台引力模型」，見 [widget-governance](concepts/widget-governance.md)

## 現在在哪

前端 prototype 完成度高（v3.9，13 個元件、6 份 mock 資料，build 成單一 index.html），**但幾乎所有資料為 mock、後端未實作**。主要缺口（baseline §13.4）：Task AI 自動標記（P1）、課長 Persona（P2）、PE/MFG 任務資料（P2）、deep-link 帶參數跳轉（P3）。

## 往哪走

2026 Q2–Q3 由兩個 Scrum 團隊平行推進（見 [teams](entities/teams.md)）：**AI 團隊**負責 LLM 串接 / RAG / MCP tool / Scheduling 後端；**Dashboard 團隊**負責系統整合 / Widget Contract / 真實資料串接。切入點策略是**值班交接**（對老手無侵入、天然驅動跨系統整合、成效可量化）。OKR 評量基準日 2026-10-24。

## 風險與未解

九題平台級 OQ + 各模組專屬 OQ 彙整於 [open-questions](open-questions.md)；歷次版本決議脈絡見 [decisions](decisions.md)。
