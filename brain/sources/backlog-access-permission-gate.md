---
type: source
title: backlog-access-permission-gate.md
description: 權限 Gate 的 Ticket Tree — 1 Feature + 2 Stories，進入 Portal 時的二元權限檢查與無權限蓋板
tags: [source, backlog, permission]
updated: 2026-07-11
sources: [backlog-access-permission-gate.md]
status: current
---

# Ticket Tree：Portal Access Permission Gate

**地位**：第一份以 azure-backlog-ticket-writer skill 產出的正式 backlog（2026-07-10 前後），可直接貼入 Azure DevOps。

## 內容摘要

- **Feature**：進 Portal 時呼叫後端 API 做「有 / 無」二元權限判斷；無權限顯示全畫面蓋板 + 引導至申請 SOP（https://kms.com）
- **Story 1**（role: system administrator）：權限檢查 + 放行 / 阻擋，含 URL 繞過防護、3 秒逾時、載入狀態
- **Story 2**（role: user without portal access）：蓋板引導體驗（依賴 S1，但可獨立驗收）
- Out of scope：登入機制、角色分級、管理端設定介面、API 規格（前後端同隊自行定）

## 脈絡

- 撰寫過程中的方法論教訓（role-benefit 錯位、切分邏輯）記錄在 [skill 覆盤](skill-review-story-splitting.md)
- 與 baseline 的關聯：權限管理原本只在 Setting 後台（Seed 三角色管理，§13.9）；本 Feature 是**平台入口層**的新需求，baseline 尚未收錄 → 已列入 [open-questions](../open-questions.md) 的追蹤事項
