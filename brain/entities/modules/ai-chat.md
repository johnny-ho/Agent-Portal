---
type: entity
title: AI Chat 與 Ask AI 體系
description: 被動查詢原則下的四個 AI 入口、五種情境腳本、當代 AI 對話版面、三態徽章
tags: [module, ai]
updated: 2026-07-26
sources: [PRODUCT_BASELINE.md §8, scrum_teaming.md F-AI-01, PO×AI 討論 2026-07-26, data/chatScenarios.js]
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

## 2026-07-26 版面改版：當代 AI 對話

**PO**：「目前 ai 頁面的對話非常不理想，看起來很像 chatting 系統，不是當代的 ai 對話模式，例如不該出現 avatar、ai 的回應不需要氣泡。」

| | 改前 | 改後 |
|---|---|---|
| 頭像 | 雙方都有 | **全砍** |
| AI 回應 | 包在氣泡＋邊框裡 | **無氣泡無框、全寬純文字**（15px／行高 1.85／最大寬 720） |
| User 訊息 | 藍底白字實心塊 | 右對齊淡底圓角 |
| 訊息間距 | 16 | 32（讀起來像文件不像 IM） |
| 三態徽章 | 一顆大 Tag | **降級成回應下方一行細字 meta**（色點＋標籤＋來源，hover 出說明） |
| 工具呼叫 | 包框列表 | 灰色細行不包框；`✗ 已拒絕` 仍用紅字 |

徽章的視覺重量降低，但**它仍然每則都在**——不能省的論證（見下節）沒有改變。

## 五種情境腳本（2026-07-26 已實作）

`data/chatScenarios.js`。**對話標題直接就是該情境的目標**，demo 時不必另外解釋這串在演什麼。使用者的發言以底部「建議接話」按鈕呈現、**點了才推進**，AI 回合自動接上，遇到需要操作的東西才停下來等人。

| # | 標題（equipment） | 演什麼 | 對到哪條設計 |
|---|---|---|---|
| 1 | 執行 SPC 異常開單 SOP（中途需人工確認） | 呼叫 SOP → 寫入步驟停下 → 確認 → 成功開單 | HITL：寫入一律停下等人 |
| 2 | 執行 FDC 快速反應 SOP（API 變更導致失效） | 同上但**開單失敗**，AI 指出是 Case Center API v2→v3 導致標準元件失效並給修復方向 | [agent-skill-tiering](../../concepts/agent-skill-tiering.md) 風險 3「排程型 SOP 靜默失效」 |
| 3 | E-101 跳 ERR-4421 該怎麼處理 | 輔助 Skill 給明確建議 → user 要求改 SPC 管制上限 → **婉拒**並給兩個可點的操作 URL | Tool Gateway `[6]` 出場關的活體展示 |
| 4 | E-405 爐管跳 ERR-7702 該怎麼處理 | 無 Skill／SOP，依知識文件回答；user 問「能不能套用 ERR-4421 的做法」→ 拒絕並說明為何適用範圍只勾 CMP | 情境幻覺的反面教材 |
| 5 | E-502 CVD 跳 ERR-9105 該怎麼處理 | 無 Skill 也無知識 → 委婉說明並建議問資深同事 → **收斂成一張追蹤任務** | close loop：把「問不到」變成可追蹤的缺口 |

情境 1／2 的人工介入用**由下而上升起的面板**（`HitlSheet`，不是 Modal）：它是「流程停在這裡等你」，不是「跳出來打斷你」。面板上列出決策所需的 context（異常筆數、擬開工單內容、時限），兩個選項都寫明後果；選「不做」會回報給該 SOP 的 owner——同一步驟一直被略過，代表流程和實際狀況對不上。

情境 2／5 的收尾用行動按鈕直接建任務（情境 2 建「API 相容性檢修」、情境 5 建「補齊知識」）。

process／mfg persona 各有 2 個情境（SOP＋HITL、輔助問答拒絕執行／無知識建任務），equipment 為完整五個。

## 三態徽章（2026-07-25 已實作，2026-07-26 改為細字 meta）

依 [agent-skill-tiering](../../concepts/agent-skill-tiering.md)「兩種 user，兩種語言」，每則 AI 回答**永遠**帶徽章，不是只有特殊情況才標：**依核准流程**（引用已簽核 Skill，可點進去看）／**AI 依指引研判**（標明依據哪份指引，附「非核准流程 · 這是建議，責任在執行者」，並攤開這次查了哪些數據當證據，含被拒絕的寫入請求）／**一般回答**（沒有引用課上的知識）。判定在 `getAnswerMode(msg)`：情境腳本直接給 `msg.mode`，舊資料沿用 `msg.sop` → approved、`msg.guidedBy` → guided、否則 general。

這是採用率問題不是資訊架構問題——工程師若分不出「照核准流程做」跟「照 AI 建議做」，每次採納都是在賭。

**尚未實作**：SOP 卡片的「不適用」一鍵轉輔助判斷、飛輪 1 的「要不要變成 SOP？」提示。自由輸入未接模型（情境對話以腳本推進，輸入框會明說）。

## 現況與缺口

UI 完整 ✅，**後端全 mock**。F-AI-01 目標：真實 LLM 串接（課上下文 system prompt）、對話後端持久化、**每則回答附 SOP 來源版本標注**（KR1.3 ≥90%）——對應設計原則「知識可信任」，見 [design-principles](../../concepts/design-principles.md)。未來 EE/PE Agent 暫不實作；屆時異常判斷卡片**必須附判斷依據**（波形圖、數據來源），不得只給結論。

相關 OQ：對話歷史保存期限與資安（OQ-4），見 [open-questions](../../open-questions.md)。
