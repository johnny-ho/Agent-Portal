---
type: concept
title: ECP 下一代戰略
description: 為何存在、怎麼切入（值班交接）、怎麼擴張（平台引力模型）、整合哪些系統
tags: [concept, strategy]
updated: 2026-07-11
sources: [PRODUCT_BASELINE.md §9, §13.1–13.3]
status: current
---

# ECP 下一代戰略

## 為何存在

ECP（15 年歷史全廠入口）以 function tree 上架所有 IT 功能 → 大量 silo system、學習成本高。IT 大老闆任務：開發下一代、引入 AI 協作、優先改善值班交接。Portal 差異：以「課」為中心（vs 功能）、Widget Contract 各課自行接入（vs IT 統一開發）、AI 為核心能力層、開啟即見課況（vs 主動找功能）。

## 切入點：值班交接（三個理由）

1. 對老手**無侵入**——日常流程不變，只在交班時刻幫忙，阻力最小
2. **天然驅動跨系統整合**——好摘要需要 FDC / MES / Case Center，需求逼著整合，動機是服務工程師
3. **成效可量化**——交班時間縮短、遺漏減少，可向大老闆報告

新人策略：不強制取代 ECP；Portal 先成為「新人的第一個家」+「全員的交班工具」。

⚠️ **載體變更（2026-07-25）**：切入點**仍是值班交接**，但不再是獨立模組——交班中心已廢除，改由一個 SOP（「整理當班交接報告」，唯讀、可排程、零 LLM）每日自動產出，在 [Schedule](../entities/modules/scheduling.md) 檢視、Home 課佈告欄觸達，人補判斷後送出。三個切入理由完全不受影響，反而更強：無侵入（人只補判斷不再從零填）、跨系統整合（SOP 本質就是取多系統資料彙整）、可量化（排程執行紀錄天然可統計）。見 [handover](../entities/modules/handover.md)、[agent-skill-tiering](agent-skill-tiering.md)。

## 擴張：平台引力模型

- **供給側**：公開 Widget Contract，任何部門按規範開發即可上架（見 [widget-governance](widget-governance.md)）
- **需求側**：工程師習慣在交班摘要看到 FDC 數據後，缺席系統會被使用者施壓——壓力來自使用者而非 IT
- **順序決議**：先親自整合 FDC / MES / Case Center 做出驚艷示範，再開放規範讓各部門自行接入

## 系統整合地圖（§9）

唯讀層：SPC / FDC / MES / 設備監控 / WIP Tracker。雙向層（查詢+帶參跳轉）：Case Center / Tool Center / Lot Center。知識層：Confluence / EDX。Agent 層（未來）：EE Agent / PE Agent。原則：**不取代現有系統**，整合數據 + deep-link 無縫進入。
