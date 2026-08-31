---
type: entity
title: Drive（課的雲端硬碟）
description: 以課為邊界的檔案空間；每課預設系統資料夾 Agent_Artifacts 承接 AI 產出，.html 產出可嵌進 KPI 報表中心
tags: [module, drive, artifact, kpi]
updated: 2026-08-31
sources: [PO×AI 討論 2026-08-31]
status: current
---

# Drive — 課的雲端硬碟

**定位**：形狀比照 Google Drive（資料夾樹 + 檔案列表 + 詳情），但它不是通用網路硬碟。它存在的理由只有一句：**AI 產出的東西要有一個落地的地方**，而且落地之後要能被課的日常畫面用到。

**Nav**：第 7 項，掛在 Schedule 之後。前六項順序是 v3.6 大老闆決議，不動它，新頁往後接（見 [sitemap](../sitemap.md)）。

## 兩條產品契約

### 1. 每課預設一個 `Agent_Artifacts`

系統資料夾，`system: true` → **不可改名、不可刪除**，UI 上不給那兩個動作。Agent Portal 的 AI 產出的 artifact 一律落在這裡：Chat 呼叫 Codify 產的、排程自動執行產的，都帶著「哪一次執行產出的」溯源資訊進來。

這是 Drive 與 [scheduling](scheduling.md)、[ai-chat](ai-chat.md) 的接縫。排程頁的執行紀錄一直有「產出物本身」那一段（決議 17 之後的重點之一），但那份產出過去只活在那一次執行紀錄裡 —— 找它得先記得是哪個排程哪一天跑的。`Agent_Artifacts` 是同一份東西的另一個入口：**依檔案找，不是依執行找**。

`origin` 欄位是這條契約的具體形狀：`{ kind: schedule | chat | upload, label, by, at }`。詳情頁的「看這次執行紀錄」按鈕就是靠 `kind` 決定往哪一頁跳。

### 2. `.html` 產出可以嵌進 KPI 報表中心

判定條件只有一條 —— 是不是 `.html`，集中在 `isDriveEmbeddable()`，Drive 與 KPI 兩頁問同一個函式，不各自判斷副檔名。

- **設定嵌入**在 Drive 詳情（右欄「動作」）：`嵌入 KPI 報表` / `取消嵌入`，**可逆**，取消嵌入不刪檔。
- **顯示嵌入**在 [kpi-center](kpi-center.md)：書籤清單置頂多一組「AI 產出報表」，來源標籤 `AI`（紫，與 PBI/FDC/SPC/MES/自建五個外部來源區隔）。點它右欄用 `iframe srcDoc` 渲染那份 html 本身。
- **嵌入狀態放在 `App.jsx`**（`driveEmbedIds`，per-persona），不放在任何一頁 —— 兩頁要看到同一份真相。同 `schedMounts` 的作法（決議 19）。

為什麼 KPI 頁的 AI 產出框長得跟旁邊的外部報表框不一樣：外部報表要看得出是「別人系統的畫面」（那個 mock topbar 是刻意的），AI 產出是本平台自己的東西，只需要一條說明它從哪來、可以回到 Drive 的溯源列。

`iframe` 帶 `sandbox=""` —— 不給 script、不給同源，AI 產出物不能反過來動 portal。

## 版面

三欄式（guideline 硬性規定）：

| 欄 | 內容 |
|---|---|
| 左 240px｜導覽 | 快速存取（`Agent_Artifacts` / 已嵌入 KPI / 最近更新）＋ 課的資料夾樹；底部容量條 |
| 中 flex｜列表 | 麵包屑或檢視名 + 工具列（搜尋／新增資料夾／上傳）+ 檔案表格（名稱・來源・擁有者・修改時間・大小） |
| 右 320px｜詳情 | 預覽（html 直接 iframe）、來源溯源、動作 |

左欄只放導覽、不放警示（沿用 [scheduling](scheduling.md) 決議 22 的規則）。「已嵌入 KPI」放左欄是因為它是**一種檢視**（看得到哪些東西被嵌出去了），不是狀態告警。

選中語彙與 Task 管理同一套：`dv-row-selected` → 底色 `rgba(37,99,235,0.08)` + 左緣 3px `#2563EB`，檔名轉藍加粗。

## 實作落點

| 檔案 | 內容 |
|---|---|
| `src/data/drive.js` | `DRIVE_DATA`（三課）、`DRIVE_TYPE_CFG` / `DRIVE_ORIGIN_CFG`、`DEFAULT_DRIVE_EMBEDS`、讀取層 `getDriveRoot / getDriveChildren / flattenDriveFiles / getDriveFileById / isDriveEmbeddable` |
| `src/components/DrivePage.jsx` | 三欄頁面 + `DriveDetail` |
| `src/components/KPIPage.jsx` | `KpiEmbedView`、`agent` 來源標籤、`AI 產出報表` 分組 |
| `src/components/App.jsx` | Nav 項與 icon、`driveEmbedIds` 狀態、`kpiJump`、`handleGoDrive` |
| `src/styles.css` | `.dv-list .dv-row-selected` 選取列 |

## 本版刻意不做（示意原型）

上傳、新增資料夾、下載、分享、刪除／改名、版本歷史、權限（誰看得到哪個資料夾）、跨課分享、搜尋 scope 只在當前檢視。按鈕留著但按下去是一句 message，讓形狀講得完整，不假裝功能存在。

## 未解

- **權限**：課是資料邊界，但課內要不要再分（Seed 才能刪？產出物誰都能嵌？）未定 —— 嵌入 KPI 等於改變全課看得到的畫面，這件事該不該只有 Seed 能做，要 PO 拍板。
- **落地策略**：AI 每跑一次排程就產一份檔，`Agent_Artifacts` 會無限長。要不要按日期分層、要不要保留期限、同名產出是覆蓋還是新版本，未定。
- **與 Home 佈告欄的關係**：交接報告目前同時進 Schedule 執行紀錄與 Home 佈告欄（見 [handover](handover.md)），現在多了 Drive 這個第三個落點。三者是同一份東西的三個入口，還是 Drive 該成為唯一真相、另外兩邊只是引用，未定。
- **配額**：左欄寫「配額以課為單位計算」，實際數字與超額行為未定。
