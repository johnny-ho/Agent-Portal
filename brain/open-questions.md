---
type: synthesis
title: 未解問題總表
description: 平台級 OQ-1~9 + Task / Scheduling 模組專屬 OQ + wiki 追蹤中的新缺口
tags: [open-questions, risk]
updated: 2026-07-11
sources: [PRODUCT_BASELINE.md §12, §13.6, §13.7]
status: current
---

# 未解問題總表

## 平台級（baseline §12）

| # | 問題 | 重要性 | 狀態 |
|---|------|--------|------|
| OQ-1 | RAG 回答品質標準與測試通過率閾值 | 高 | 待討論 |
| OQ-2 | Skill 簽核是否整合現有電子簽核系統（ESS） | 高 | 待確認 |
| OQ-3 | 多廠複製時 Skill 共享或獨立 | 中 | 未開始 |
| OQ-4 | AI 對話歷史保存期限與資安合規 | 高 | 待確認 |
| OQ-5 | 認證是否整合廠區 AD/LDAP | 高 | 未開始 |
| OQ-6 | Must-be-zero 指標定義與更新權限 | 高 | 待確認 |
| OQ-7 | Priority Feed 優先級衝突排序規則 | 中 | 待討論 |
| OQ-8 | 課內公告發布權限（僅課長 or 含 Seed） | 中 | 待確認 |
| OQ-9 | 值班平台事件移交是否需正式 API | 中 | 待討論 |

## 模組專屬

- **Task**（TM-OQ-1~5）：AI 標記閾值（高）、Case 關聯、成員視角、逾期通知、三課欄位 → [task-management](entities/modules/task-management.md)
- **Scheduling**（SCH-OQ-1~6）：Claim timeout（高）、~~Skill 編寫與 tool 授權（高）~~ **✅ 已有解方待實作** → [agent-skill-tiering](concepts/agent-skill-tiering.md)、context 持久化（高）、延伸討論回寫、失敗重試、建立/編輯 UI → [scheduling](entities/modules/scheduling.md)

## Wiki 追蹤中的新缺口（ingest 時發現，baseline 尚未收錄）

| # | 問題 | 來源 |
|---|------|------|
| W-1 | **入口權限 Gate 與 Setting 課內權限管理的關係未整合**：二元 gate（有/無）與三角色（Seed/Member/Viewer）如何銜接？OQ-5（AD/LDAP）也相關 | [權限 Gate backlog](sources/backlog-access-permission-gate.md) |
| W-2 | 交班中心戰略上是切入點、Nav 上卻隱藏 — 何時恢復主 Nav？ | [handover](entities/modules/handover.md) |
| W-3 | scrum_teaming 仍為草稿且未反映 v3.8/v3.9 — 需 PO 確認 + 更新 | [scrum-teaming](sources/scrum-teaming.md) |
| W-4 | 2026-07-25 OKR 中期檢核在即，多個 KR 目標日為 2026-07-31（KB 掛 Nav、交班持久化、Widget Contract v1、Must-be-zero）— 現況全 mock，達成風險高 | [teams](entities/teams.md) |
| W-5 | Teams 通知真實整合機制未定（Incoming Webhook vs Graph API、租戶授權、逐則推送頻率上限）— v1 僅做設定 UI | [notification](entities/modules/notification.md) |
