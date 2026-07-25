---
type: entity
title: AI Chat 與 Ask AI 體系
description: 被動查詢原則下的四個 AI 入口、Context Badge 機制、context schema
tags: [module, ai]
updated: 2026-07-25
sources: [PRODUCT_BASELINE.md §8, scrum_teaming.md F-AI-01]
status: current
---

# AI Chat 與 Ask AI 體系

**最高原則：被動查詢**。AI 僅在使用者主動發問時運作——不主動分析、不自動排序、不推播；所有行動由工程師確認後自行執行。唯一例外是 [Scheduling](scheduling.md)（受集體授權 + HITL 約束）。

## 四個入口

| 入口 | 位置 | Context |
|------|------|---------|
| AI Chat | AI 頁（Nav 第 5 位） | 課上下文 + 歷史對話 |
| AmbientBar | Dashboard 底部常駐 | 課上下文，對話個人私有 |
| Ask AI（Task） | Priority Feed 卡片 | Task 標題/優先級/說明/標籤/來源（完整文字） |
| Ask AI（KPI） | KPI toolbar | 僅報表定位（名稱/來源/更新時間），**不帶數值**——AI 自行用工具取即時資料 |

**互動規範**：任何 Ask AI 入口一律開**新對話**（`activeId = null`）；Input 上方藍色 Context Badge 預設收起、可展開、送出後自動清除。

## AntD 遷移

ChatPage UI 已於 2026-07-25 完成 **AntD 遷移 Phase 5**（見 [antd-migration-plan](../../concepts/antd-migration-plan.md)）：對話清單改 `List`（刪除加 `Popconfirm`）、Quick prompts 改 `Card`、**Context Badge 改 `Alert closable`**（關閉＝移除 context）、Skill 抽屜改 `Drawer`。對話泡泡保留自製（AntD 無 bubble 元件）。四個 Ask AI 入口帶 context 的行為不變。

## 現況與缺口

UI 完整 ✅，**後端全 mock**。F-AI-01 目標：真實 LLM 串接（課上下文 system prompt）、對話後端持久化、**每則回答附 SOP 來源版本標注**（KR1.3 ≥90%）——對應設計原則「知識可信任」，見 [design-principles](../../concepts/design-principles.md)。未來 EE/PE Agent 暫不實作；屆時異常判斷卡片**必須附判斷依據**（波形圖、數據來源），不得只給結論。

相關 OQ：對話歷史保存期限與資安（OQ-4），見 [open-questions](../../open-questions.md)。
