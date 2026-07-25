---
type: entity
title: APP Center 與 Function Tree
description: 全公司內部應用目錄 + 個人釘選（上限 20）+ IT 維護的三層 Function Tree
tags: [module, app-center, it-admin]
updated: 2026-07-25
sources: [PRODUCT_BASELINE.md §13.8, §13.11, scrum_teaming.md F-DB-06]
status: current
---

# APP Center（v3.4）與 Function Tree（v3.2）

**定位**：公司**內部** IT 應用目錄（與外部 SaaS 無關，Nav 第 3 位），是取代 ECP function tree 的直接實現。個人釘選唯一入口（上限 20）。

## 應用入口職責分工（v2.7/v2.8 決議，容易混淆）

| 功能 | 管理者 | 定位 |
|------|--------|------|
| 課的應用 Widget（Home Section Zone） | Seed | 課級標準工具，全課一致，必選標記不可移除 |
| APP Center | 個人 | 全公司目錄 + 釘選管理 |
| ~~我的釘選 Widget~~ | — | **v2.8 移除**，避免雙頭管理 |

## 功能

Grid/List 切換、12 類分類、頁內搜尋、PinnedStrip、Header pill toggle 新舊版切換（v3.4）、☰ Function Tree 按鈕。Header「Search App」focus 時預設展示已釘選。

**Function Tree**（IT 管理員維護，v3.2）：大分類 → 子系統 → 功能項目 + 系統名稱 tag（例：ePMM）。資料 `src/data/apps.js` `DEFAULT_FUNCTION_TREE`，狀態提升至 App.jsx，前後台共用。

## AntD 遷移

UI 已於 2026-07-25 完成 **AntD 遷移 Phase 5**（見 [antd-migration-plan](../../concepts/antd-migration-plan.md)）：**Function Tree 改 `Dropdown` + `Tree`**（自製三層樹與點擊外部關閉邏輯退場，L1 展開／L2 收合行為不變）、分類篩選與檢視切換改 `Segmented`、清單檢視改 `Table`、卡片與釘選 tile 改 `Card`、釘選上限提示由原生 `alert()` 改吃主題的 `message.warning`。

## 缺口

F-DB-06：應用清單後端管理（IT 上下架流程）、deep-link 帶參數（需逐系統確認規格）、⌘K 全站搜尋。
