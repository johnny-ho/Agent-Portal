---
type: entity
title: Knowledge Base（未掛 Nav）
description: Skill 查詢 / Prompt 模板 / Q&A — 元件已建立，RAG 管道與簽核流程為 AI 團隊 O2 重點
tags: [module, knowledge, rag]
updated: 2026-07-25
sources: [PRODUCT_BASELINE.md §6, scrum_teaming.md F-AI-02]
status: current
---

# Knowledge Base（🚧 元件已建立，未掛 Nav）

**定位**：Skill 查詢 / Prompt 模板 / Q&A。`KnowledgePage.jsx` 與 `SkillManagementPage.jsx` 已存在但未掛主 Nav（Skill 管理實際入口在 Seed 後台「知識管理」tab）。

**前端現況（2026-07-25）**：`SkillManagementPage.jsx` 已完成 AntD 遷移（Phase 3：清單 Table、詳情 Modal、步驟 Timeline、刪除 Popconfirm），見 [antd-migration-plan](../../concepts/antd-migration-plan.md)。同名死檔 `SOPManagementPage.jsx` 不在 build 內，待 Phase 8 刪除。

## 上線計畫（F-AI-02，KR2.1 目標 2026-07-31 掛 Nav 上線，時程緊迫）

- **RAG 管道**：Confluence 匯入 → Chunking → Embedding → 查詢；首批 3 課覆蓋率 ≥60%，查詢準確率 ≥80%（100 題人工測試集）
- **簽核流程五段狀態機**：Draft → Testing → Approving → PI Run → Production（後端，KR2.5 2026-08-31）
- Seed 後台「知識管理」tab 負責 Skill 匯入 / 編輯測試 / 簽核，見 [setting](setting.md)

## AntD 遷移

`KnowledgePage.jsx` 已於 2026-07-25 完成 **AntD 遷移 Phase 4**（tabs→`Segmented`、三分頁清單→`List`+`Card`、標籤→`Tag`、Skill 回饋→`Alert`）。⚠️ 因本頁**未掛 Nav 且 `src/` 內零引用**，無法從 UI 進入，驗收改用臨時 harness 掛載元件完成；但它**有列在 `build.py` 的 JS_MODULES**（會進產物）。去向待 PO 決定：掛 Nav 或先移出 build，見 [antd-migration-plan](../../concepts/antd-migration-plan.md) Phase 8。

## 關聯

AI 回答必須標注來源 Skill 版本（[design-principles](../../concepts/design-principles.md) 第 7 條），是 [AI Chat](ai-chat.md) 可信任的基礎。相關 OQ：RAG 品質閾值（OQ-1）、簽核是否整合 ESS（OQ-2）、多廠 Skill 共享（OQ-3），見 [open-questions](../../open-questions.md)。
