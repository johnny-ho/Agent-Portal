---
type: concept
title: Skill Marketplace（跨課流通）
description: 課級發布 → 跨課下載 → 落地重簽的完整設計；決策 A–F 已由 PO 拍板（2026-08-19），操作流程與資料模型為待實作提案
tags: [concept, skill, governance, marketplace, cross-section]
updated: 2026-08-19
sources: [PO×AI 討論 2026-08-19, personas.js sopManagement, SkillManagementPage.jsx, SkillDetailPage.jsx, agent-skill-tiering.md]
status: needs-review
---

# Skill Marketplace（跨課流通）

> **定調**：Marketplace 不是「讓 Skill 跨課使用」，而是**讓 Skill 的定義文本跨課流動，執行權限仍然鎖死在課內**。
> 執行時用的是自己課的機台、自己課的 MCP 權限、自己課的簽核人。跨課流動的只有「怎麼做這件事」的知識。
>
> ⚠️ 決策 A–F 已拍板；下方的操作流程、資料模型、分階段計畫為**提案，尚未實作**。

## 為什麼現況做不到（六個硬事實）

| # | 事實 | 位置 | 意義 |
|---|---|---|---|
| 1 | `sopManagement[]` 掛在 persona 底下，無全域池 | `personas.js:318` / `1053` | 需要第三個資料層 |
| 2 | `scope` 比對 `EQUIPMENT_MASTER[personaKey]` | `personas.js:13,53` | 設備課 `E-101`／製程課 `R-501`／製造課 `LINE-1`——**命名空間都不同**，跨課後 scope 必然歸零 |
| 3 | `knowledgeRefs` 指向課內 `KNOWLEDGE_DOCS[personaKey]` | `knowledge.js:25` | 跨課後引用必斷 |
| 4 | `tools[]` 已有 `system` / `mode` / `hasWrite` | `personas.js:332` | MCP 揭露是現成資料，不用新增 |
| 5 | `acceptance` / `scenarioRun` 是課內驗收證據 | `SkillDetailPage.jsx:39` | **不可跨課沿用**，沿用即簽核造假 |
| 6 | 五階段 Draft→Testing→Approving→Pirun→Production 已存在 | `SkillManagementPage.jsx:23` | 下載後直接接回，不新增流程 |

第 2、3 點決定了決策 B。

## 決策（2026-08-19 PO 拍板）

| # | 題目 | 定案 | 理由 |
|---|---|---|---|
| **A** | 副本 vs 訂閱 | **副本（fork），不連動更新** | 上游改版自動生效＝別課的人改動我課上已簽核生效的東西，簽核契約當場失效。改成 App Store 模式：提示有新版，拉不拉我決定，拉了必須重走簽核。代價：同一 Skill 在 N 課會分岔，這是課級自治的合理結果 |
| **B** | 下載後起始階段 | **一律 Draft，且不做自動 scope remap** | scope 與 knowledgeRefs 跨課必然失效，沒補完測試跑不動，Draft 是唯一誠實起點。**不讓系統猜對應機台**——猜錯比留白危險（會讓人以為已設好）。同決議 14「系統與 AI 都不介入判斷」 |
| **C** | 發布門檻 | **只有 Production（已生效）能發布** | Marketplace 上若有 Draft，下載者拿到的是沒人驗證過的東西。發布＝「我課上真的在用」，也是採用數據有意義的前提 |
| **D** | 評價形式 | **不做五星，改行為三數字**：`N 課下載 · N 課已推到生效 · N 課下載後棄用` | 廠內樣本太小（可能只有 3 課下載），五星是雜訊；且該問的是行為不是意見。**「下載了但沒生效」是唯一會誠實反映水土不服的訊號**。留言限已生效的課、實名、選填 |
| **E** | MCP 揭露 | **揭露 + 當場比對本課權限** | 光列工具名，人看不出跑不跑得動。權限落差是跨課最常見的失敗原因，擋在下載前比下載後才發現有價值。`hasWrite` 必須在卡片層就看得見 |
| **F** | 發布前檢視 | **要做，且系統只攤開不自動遮蔽** | 現有 description 內含 `規格下限 520`、`LOT-2207`、`E-101` 等課內製程參數與批號。系統標出偵測到的識別碼，由發布者自己決定是否抽換。自動遮蔽會讓內容失去意義，且那又是系統在做判斷 |

### 連帶規則

- **適用範圍降解析度**：Marketplace 只揭露「機台類別 + 原課台數 + 觸發條件」（如 `CMP · 原課 3 台 · 每週一 08:00`），具體機台 ID 對別課無意義且屬課內識別資訊，留在詳情頁「原課生效範圍」並標明僅供參考。
- **原課驗收紀錄可看但不可用**：唯讀呈現，明確標「設備課的紀錄，不計入本課簽核」。
- **副標改寫**：`SkillManagementPage.jsx:339` 的「同課審批 · 不可跨課使用」→「同課審批 · 跨課可下載、下載後重走簽核」。

## 資訊架構

Marketplace 為 **Skill 管理 Header 的入口按鈕 → 全頁替換**（同 `SkillDetailPage` 的作法）。

- ❌ 不做成第三個分頁：現有兩顆 Segmented 的語意軸是**類型**（Skill／Codify），Marketplace 是**來源**，兩軸混在一顆膠囊上會壞掉
- ❌ 不開 Nav 入口：違反 [agent-skill-tiering](agent-skill-tiering.md) 既有決議
- ✅ 逛別人的東西 vs 管自己課的東西是兩種模式；下載終點是回到本課清單，全頁替換的返回路徑天然對得上

Header 變成兩顆按鈕並排：`＋ 建立 Skill` ／ `Skill Marketplace`。

## 五條使用者流程

| 流程 | 主角 | 起點 → 終點 |
|---|---|---|
| **A 發布** | 設備課 Seed | 課內清單 Production 那列 → 發布前檢視三步 → Marketplace 上架 v1.0 |
| **B 逛與下載** | 製程課 Seed | Marketplace 列表 → 詳情（工具可用性／版本歷史／採用數據） → 下載確認 |
| **C 落地重簽** | 製程課 Seed | 本課清單新增 Draft（標「來自設備課」） → 補適用範圍與知識引用 → 走既有五階段 |
| **D 版本更新** | 下載課 Seed | 詳情頁「有新版本」提示 → 看 changelog → 決定是否更新（更新＝退回 Draft 重簽） |
| **E 採用回寫** | 系統 | 下載課 stage 變動時自動回寫 `adoption.outcome`，無使用者操作 |

## 資料模型草案

新增 `data/skillMarketplace.js`，與課內 `sopManagement` 分開：

```js
{
  id: 'mp-001',
  skillSnapshot: { /* 發布當下的 title/purpose/description/tools/plainSteps/tags/tier */ },
  publisher: { section: 'equipment', sectionName: '設備課', by: '吳志豪', at: '2026-08-10' },
  currentVersion: 'v1.2',
  versions: [{ v, at, by, changelog /* 必填 */, snapshot }],
  originScope: { equipmentClass, areaCount, targetCount, trigger },   // 降解析度後的揭露
  adoption: { downloads: [{ section, at, version, outcome: 'production'|'testing'|'dropped' }] },
  reviews: [{ section, by, at, text, version }],                      // 限 outcome=production 的課
  derivedFrom: null,                                                  // 衍生鏈，單層
  status: 'listed' | 'delisted',
}
```

課內 skill 新增兩欄：

```js
origin:    { marketplaceId, version, fromSection, at } | null,   // 我從哪來
published: { marketplaceId, version } | null,                    // 我發布成什麼
```

三個衍生設計：

1. **決策 D 的三個數字從 `adoption.outcome` 推導**，而 outcome 由下載課的 `stage` 算出、不另存——維持單一真相（同 `getSkillScheduleMap` 的作法）。
2. **`origin` 必須存 version**，才做得出「你下載的是 v1.1，目前最新 v1.2」。
3. **`derivedFrom`**：下載後改良再發布回去必然發生，v1 做單層來源標記（「衍生自 設備課《PM 到期清單彙整》v1.1」），避免原創爭議，也讓知識擴散路徑看得見。

## 分階段落地

| Phase | 內容 |
|---|---|
| **1｜看得到** | Marketplace 全頁（列表＋詳情＋版本歷史＋工具可用性檢查），資料先 mock |
| **2｜拿得到** | 發布流程（含發布前檢視）＋ 下載落地成 Draft ＋「待重設」清單 ＋ 接回既有五階段 |
| **3｜活得久** | 版本更新提示、採用結果回寫、衍生鏈、下架 |

Phase 1 可獨立驗證「揭露的資訊夠不夠人做下載決定」——整件事風險最高的一格，先做出來給人看。

## 與既有脈絡的接點

- **飛輪 2**（[agent-skill-tiering](agent-skill-tiering.md)「自訂 node → 標準元件，平台級」）與本題是同一思想的兩個尺度。被 N 課採用且採用率穩定的 Skill，天然是升成平台級標準件的候選——**Marketplace 的採用數據正好是那道升級門檻的判準**。與 [widget-governance](widget-governance.md) 的「平台引力模型」同源，Seed 不用學新東西。
- **OQ-3「多廠複製時 Skill 共享或獨立」** 與本題同源但不同層（跨廠 vs 跨課）。決策 A（副本不訂閱）若成立，OQ-3 大機率沿用同一答案。

## 未解問題

| # | 問題 | 傾向 |
|---|---|---|
| MP-OQ-1 | 誰有權發布？Seed 還是需課長會簽 | v1 為 Seed（Skill 管理本就是他的地盤）＋ 發布留痕 |
| MP-OQ-2 | `scope` 缺「貨／產品」維度（PO 第 4.1 點提及），現有只有 class / ids / area / trigger | 獨立評估，不混在 Marketplace 做 |
| MP-OQ-3 | 上游下架後，已下載的副本要不要標示「上游已下架」 | 副本不受影響，但傾向標示 |
| MP-OQ-4 | 跨課下載後，本課要不要能看到原課的驗收紀錄 | 可看但唯讀，明確標「不計入本課簽核」 |
