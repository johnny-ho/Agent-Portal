---
type: entity
title: Schedule 排程中心
description: 課級 Skill 定時執行 — 唯一允許 AI 主動的場景，受 Human-in-the-loop 三重約束
tags: [module, scheduling, ai]
updated: 2026-07-25
sources: [PRODUCT_BASELINE.md §8.1, §13.7, scrum_teaming.md F-AI-04]
status: current
---

# Schedule 排程中心（v2.6）

**定位**：課級 Skill 定時執行（Nav 第 6 位，獨立 Tab）。是[被動查詢原則](ai-chat.md)的**唯一例外**，主動性受三重約束：(1) 執行的是課員預設的 Skill 與排程，非 AI 自主判斷；(2) 所有 MCP tool 呼叫需人工確認（Human-in-the-loop）；(3) 執行紀錄對全課公開，任何課員可查閱介入。

## 頁面

排程清單 / 執行紀錄（可展開步驟）/ HITL Banner / 延伸討論跳轉 AI Chat。

## 現況與缺口

UI ✅、後端未實作。F-AI-04：cron 觸發、**Claim 鎖定**（first-write-wins，建議 15 分鐘 timeout 自動釋放）、執行歷史持久化、失敗通知。「＋新增」與「編輯排程」為 placeholder，待 F-AI-03 Skill 管理 UI（含 MCP tool 授權選用介面）。

## AntD 遷移

UI 已於 2026-07-25 完成 **AntD 遷移 Phase 4**（見 [antd-migration-plan](../../concepts/antd-migration-plan.md)）：介入橫幅改 `Alert`、步驟清單改 `Timeline`（自訂狀態 dot）、執行紀錄改 `Collapse`、左側排程清單改 `List`+`Card`、「拒絕」加 `Popconfirm`。通知 deep-link 自動展開指定 run、延伸討論帶 context 跳 [AI Chat](ai-chat.md) 等既有互動行為不變。

## 專屬 OQ

SCH-OQ-1 Claim timeout 機制（高）；SCH-OQ-2 Skill 編寫介面與 MCP tool 授權（高）；SCH-OQ-3 執行 context 持久化規格（高）；SCH-OQ-4 延伸討論結果是否回寫執行紀錄；SCH-OQ-5 失敗重試策略；SCH-OQ-6 排程建立/編輯 UI。彙整見 [open-questions](../../open-questions.md)。
