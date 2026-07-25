---
type: concept
title: 八條設計原則
description: 課為重心、工程師優先、證據透明、HITL、穿透力、低摩擦、知識可信任、角色分明
tags: [concept, principles]
updated: 2026-07-11
sources: [PRODUCT_BASELINE.md §10]
status: current
---

# 八條設計原則（評審任何需求的檢查表）

1. **課為重心**：課是資料邊界與協作單位
2. **工程師優先**：每張卡片、每個指標必須可行動；「不做給課長欣賞的精美儀表板」
3. **證據透明（Evidence-First AI）**：AI 判斷必附可驗證依據，工程師幾秒內自行判斷準確性
4. **人執行、AI 建議（Human-in-the-Loop）**：AI 只查詢、只建議
5. **穿透力（Deep-Link First）**：跳轉子系統必帶參數，不重複填已知資訊
6. **低摩擦（Zero Admin Burden）**：AI 建議可一鍵忽略，不產生行政紀錄或追蹤義務
7. **知識可信任**：AI 回答標注來源 Skill 版本 → 落地於 [knowledge-base](../entities/modules/knowledge-base.md) 與 [ai-chat](../entities/modules/ai-chat.md)
8. **角色分明**：預設資訊 / KPI / 任務依 [persona](../entities/personas.md) 完全個人化

根源是用戶研調三大警訊（見 [overview](../overview.md)）：系統太被動、缺判斷依據會被撤掉、誤判成本極高（2 小時寫報告自證）。**PM 用法**：新需求進來先過這八條，違反第 2、3、4 條的需求要特別警惕。
