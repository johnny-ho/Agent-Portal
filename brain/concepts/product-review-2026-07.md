---
type: synthesis
title: 產品設計理念評審（2026-07）
description: 用戶測試 prototype 前的七點產品建議 — 楔子外露、主動性階梯、測 AI 錯誤、課長負面清單、優先級通膨、Home 第一眼、OKR 重框
tags: [review, strategy, user-testing]
updated: 2026-07-24
sources: [brain wiki 全站 query（overview / design-principles / ecp-strategy / modules / open-questions）]
status: current
---

# 產品設計理念評審（2026-07，用戶測試前）

> AI 對設計理念的產品面評審。前提：本階段是給用戶測試的 prototype，不談系統架構。
> 整體評價：八條[設計原則](design-principles.md)有根（每條可追溯用戶研調警訊）；[值班交接楔子](ecp-strategy.md)策略成立。以下為七點建議。

## 1. 楔子藏在 Nav 外，測試會測不到（呼應 W-2）

[交班中心](../entities/modules/handover.md)是戰略切入點卻 Nav 隱藏。建議：把交班設為用戶測試**主場景**，讓測試結果決定 Nav 定位；並立即量測現行交接基準值（耗時、遺漏），否則 10/24 OKR 評量日「成效可量化」沒有分母。

## 2. 「被動查詢」與「系統太被動」痛點的張力

研調第一痛點是系統太被動，AI 最高原則卻是被動查詢；且 Priority Feed 已是 AI 主動生成（原則實質已破例）。真正原則是**控制誤判成本**（證據透明 + 一鍵忽略）。建議改用**主動性階梯**：主動整理資訊（已做）→ 主動提示異常 → 主動建議行動 → 主動執行（[Scheduling](../entities/modules/scheduling.md) HITL）。用測試定位各 [persona](../entities/personas.md) 的舒適邊界落在哪一格。

## 3. 刻意測「AI 錯的時候」

「工程師幾秒內自行判斷準確性」是可實測宣稱。建議在 mock 裡埋一張**錯誤的 Priority Feed 卡片**（附證據），觀察：能否透過證據發現？忽略後信任是否還在？另測 KR1.3 的來源標注**是否真的有人點開**——沒人看就只是合規裝飾。

## 4. 課長「看不到什麼」應為明文承諾

課長 view 排 P2 是對的，但「不做監視工具」需要**負面清單**（不提供個人回應時間統計、不提供已讀、Priority Feed 不給課長）。測試時直接問工程師「你覺得課長看得到你什麼」，認知落差即導入風險。

## 5. My Tasks 優先級通膨風險

P1/P2/P3 發起人指定、不重排、P1 置頂 → 自然演化為人人發 P1。測試時觀察發起行為；產品上考慮接收方 triage 權或 P1 配額，不違反 HITL。相關：[home-dashboard](../entities/modules/home-dashboard.md)。

## 6. Home「工作站」主張要驗證第一眼

Section Zone（課級、個人不可動）佔版面上半，「我的」只有右側面板。測試盯第一眼視線與前 30 秒點擊；若受測者直奔 My Tasks，「開班第一眼掌握課況」需重想（如課級資訊按職掌過濾）。**Must-be-zero 橫幅已建未掛載（F-DB-02），建議測試前掛上**。

## 7. OKR 中期檢核（2026-07-25）建議重框（呼應 W-4）

多個 KR 目標日 7/31 而現況全 mock。建議將 prototype 階段 KR 重框為**驗證型指標**（交接基準值已量測、證據查核成功率、主動性邊界已定位），比「後端未完成」更有力。

## 待 PO 裁決

- 是否採納主動性階梯取代二元被動原則（影響 [design-principles](design-principles.md) 第 4 條表述）
- 課長負面清單是否入 baseline
- 測試腳本是否包含「埋錯卡片」情境
