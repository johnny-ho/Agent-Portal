---
type: entity
title: KPI 報表中心
description: 趨勢與歷史深入分析 — 書籤清單 + 嵌入報表 + Ask AI；v3.9 新增後台報表管理；2026-08-31 起承接 Drive 的 .html AI 產出
tags: [module, kpi]
updated: 2026-08-31
sources: [PRODUCT_BASELINE.md §7.6, §13.15, scrum_teaming.md F-DB-03, PO×AI 討論 2026-08-31]
status: current
---

# KPI 報表中心

**定位**：趨勢與歷史深入分析（Nav 第 2 位）。與 [Home](home-dashboard.md) 的切分：Home 看當前狀態（一眼），KPI 看趨勢（深入）。**Portal 不重做報表本身**——左側書籤清單（Seed 管理）+ 右側嵌入容器，提供「在原系統開啟」逃生出口，顯示資料來源與最後更新時間。

## 2026-08-31：承接 Drive 的 AI 產出報表

書籤清單**置頂多一組「AI 產出報表」**，來源標籤 `AI`（紫），內容是 [Drive](drive.md) 裡被嵌入的 `.html` artifact。它走與其他書籤同一條路（點左邊、右邊換內容），差別只在右欄渲染的是那份 html 本身（`iframe srcDoc`，帶 `sandbox=""`），不是外部系統的模擬畫面。

這一組沒有東西時整組不出現 —— 空的分組會讓人以為功能壞了。

**兩個框刻意長得不一樣**：外部報表框保留 mock 的系統 topbar（要看得出是「別人系統的畫面」，這是本頁「Portal 不重做報表本身」原則的視覺表現）；AI 產出框沒有那層 chrome，只有一條溯源列（來自哪個資料夾、哪一次執行產的）與「在 Drive 開啟」。

**加入與移除的開關在本頁**（決議 25）：左欄 header 常駐一顆「**＋ AI 產出**」，開一個 Modal 列出這課 Drive 裡所有 `.html` 產出，勾選清單同時做新增與移除，按確定才生效。選中的 AI 產出另可在報表 toolbar「從清單移除」（常用動作不必每次開 Modal）。

三個實作上的判斷：
- 入口**不掛在「AI 產出報表」那一組上** —— 那組沒東西時整組不出現，入口跟著消失就變成找不到的功能。
- **一份勾選清單、按確定才生效**，是「管理一份清單」的心智模型，不是「對每個檔案下指令」；因此 `App.jsx` 的 handler 是整份 `set` 而不是逐筆 `toggle`（逐筆的話 Modal 的「取消」取消不掉）。
- 「從清單移除」**不用 danger 色**，Popconfirm 講明「檔案仍留在 Drive」—— 移除的是清單項，不是檔案。

清單本身存在 `App.jsx`（`driveEmbedIds`，per-persona），Drive 那邊據它顯示「在 KPI 清單」的狀態，兩頁共用同一份真相。

⚠️ 首版曾把開關做在 Drive 的檔案詳情，2026-08-31 **決議 25 推翻**：本頁本來就是管理書籤清單的地方（見頁尾「⚙ Seed 管理書籤與分類」），加一份 AI 產出與加一個外部報表書籤是同一件事。

## v3.9：KPI 報表管理後台

[Setting](setting.md) 新增「KPI 報表管理」tab（Seed only）：Group 分組 + Report 兩層各自拖曳排序；報表兩種來源類型（**外部 URL / EDA3 Flow**）；新增 / 編輯走 Modal；三課 mock 資料獨立。

## Ask AI

toolbar「✦ Ask AI」帶報表定位（不帶數值）開新對話，schema 見 [ai-chat](ai-chat.md)。

## AntD 遷移

UI 已於 2026-07-25 完成 **AntD 遷移 Phase 4**（見 [antd-migration-plan](../../concepts/antd-migration-plan.md)）：書籤清單改 `List`、搜尋改 `Input`、KPI 摘要卡改 `Card`+`Statistic`、異常摘要改 `List`+`Badge`。長條圖與**嵌入報表的「他系統 chrome」刻意保留自製**——後者在模擬外部報表系統介面，套本產品設計語言會失去「這是他系統畫面」的辨識。

## 缺口

全 mock。F-DB-03：書籤切換接真實嵌入（Power BI / Web Report iframe）、KPI Summary widget 接真實 API、來源與更新時間標注。
