---
type: entity
title: KPI 報表中心
description: 趨勢與歷史深入分析 — 書籤清單 + 嵌入報表 + Ask AI；v3.9 新增後台報表管理
tags: [module, kpi]
updated: 2026-07-25
sources: [PRODUCT_BASELINE.md §7.6, §13.15, scrum_teaming.md F-DB-03]
status: current
---

# KPI 報表中心

**定位**：趨勢與歷史深入分析（Nav 第 2 位）。與 [Home](home-dashboard.md) 的切分：Home 看當前狀態（一眼），KPI 看趨勢（深入）。**Portal 不重做報表本身**——左側書籤清單（Seed 管理）+ 右側嵌入容器，提供「在原系統開啟」逃生出口，顯示資料來源與最後更新時間。

## v3.9：KPI 報表管理後台

[Setting](setting.md) 新增「KPI 報表管理」tab（Seed only）：Group 分組 + Report 兩層各自拖曳排序；報表兩種來源類型（**外部 URL / EDA3 Flow**）；新增 / 編輯走 Modal；三課 mock 資料獨立。

## Ask AI

toolbar「✦ Ask AI」帶報表定位（不帶數值）開新對話，schema 見 [ai-chat](ai-chat.md)。

## AntD 遷移

UI 已於 2026-07-25 完成 **AntD 遷移 Phase 4**（見 [antd-migration-plan](../../concepts/antd-migration-plan.md)）：書籤清單改 `List`、搜尋改 `Input`、KPI 摘要卡改 `Card`+`Statistic`、異常摘要改 `List`+`Badge`。長條圖與**嵌入報表的「他系統 chrome」刻意保留自製**——後者在模擬外部報表系統介面，套本產品設計語言會失去「這是他系統畫面」的辨識。

## 缺口

全 mock。F-DB-03：書籤切換接真實嵌入（Power BI / Web Report iframe）、KPI Summary widget 接真實 API、來源與更新時間標注。
