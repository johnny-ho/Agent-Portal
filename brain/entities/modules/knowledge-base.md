---
type: entity
title: 知識管理（Setting 獨立 tab）
description: 課上的知識文件庫 — 2026-07-26 從 Skill 管理拆出獨立；Vector/RAG/知識圖譜為後續方向
tags: [module, knowledge, rag]
updated: 2026-07-26
sources: [PO×AI 討論 2026-07-26, PRODUCT_BASELINE.md §6, scrum_teaming.md F-AI-02]
status: current
---

# 知識管理

**定位**：課上的知識文件庫。它是 Skill（輔助判斷／SOP）的**底料**，不是與它們平行的第三條路線。

**入口**：Setting → Section 管理 →「知識管理」tab（Seed 限定）。**不掛 Nav**，見 [setting](setting.md)。

## 2026-07-26 拆分

**PO**：「知識管理是一個單獨的事情，知識在輔助／SOP 執行前後都可以被應用，我認為不該被視為一條平行的路線。」

此決議推翻 [agent-skill-tiering](../../concepts/agent-skill-tiering.md)「三種類型放同一管理頁」的前半。飛輪 1 的論證不受影響——它的兩端是輔助判斷↔SOP，仍在同一份清單裡。

| | 拆前 | 拆後 |
|---|---|---|
| 存放 | `personas.js` 的 `sopManagement[]`，`tier: 'knowledge'` | `data/knowledge.js` 的 `KNOWLEDGE_DOCS[persona]` |
| 狀態 | 五階段（含 Pilot Run） | 四狀態：草稿／審核中／已發布／待更新 |
| 「從 KM 引入」 | Skill 管理 Header | 移來這裡——它引入的是文件不是流程 |

`KnowledgePage.jsx` 由原本的死碼（Skill／Prompt／Q&A 三分頁、未掛載、無法從 UI 進入）**重寫**為本頁。

## 頁面內容

清單（狀態／文件＋摘要／負責人／更新／被檢索次數／刪除）＋ 詳情 Modal（基本資訊、**被哪些 Skill 引用**、審核狀態、切分後的段落）。

**「被哪些 Skill 引用」是這次拆分的具體證據**：知識文件有 `usedBy[]`，Skill 有 `knowledgeRefs[]`，兩邊互相顯示。沒有被引用的文件也不是孤兒——它仍會被檢索到用於一般問答（[AI Chat](ai-chat.md) 情境 4 演的就是這件事）。

## 後續方向（本版不實作）

頁面上有一張可展開的說明卡標註三步：**Vector 索引 → RAG 語意檢索（回答標出引用來源）→ 課內自建知識圖譜**（把文件、機台、警報碼、Skill 之間的關係連起來，讓「這台機的這個警報，課上有哪些相關知識」變成一次查詢）。

目前段落切分是人工的、檢索是關鍵字比對，只夠讓原型展示「AI 引用了哪一份文件」。三步都不影響現有資料結構，可以之後再接。PO 明示本次「註記方向就好」。

## 上線計畫（F-AI-02，KR2.1 目標 2026-07-31）

- **RAG 管道**：Confluence 匯入 → Chunking → Embedding → 查詢；首批 3 課覆蓋率 ≥60%、查詢準確率 ≥80%（100 題人工測試集）
- 知識的四狀態流程比 Skill 的五段簡單，後端可先落地這一條；Skill 的五段狀態機（KR2.5 2026-08-31）另計

## 關聯

AI 回答必須標注來源（[design-principles](../../concepts/design-principles.md) 第 7 條），是 [AI Chat](ai-chat.md) 可信任的基礎。相關 OQ：RAG 品質閾值（OQ-1）、簽核是否整合 ESS（OQ-2）、多廠知識共享（OQ-3），見 [open-questions](../../open-questions.md)。
