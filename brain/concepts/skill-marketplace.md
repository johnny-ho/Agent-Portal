---
type: concept
title: Skill Marketplace（跨課流通）
description: 課級發布 → 跨課下載 → 落地重簽的完整設計；決策 A–H 已由 PO 拍板（2026-08-19），七條使用者流程、操作計畫與資料模型為待實作提案
tags: [concept, skill, governance, marketplace, cross-section]
updated: 2026-08-19
sources: [PO×AI 討論 2026-08-19, personas.js sopManagement, SkillManagementPage.jsx, SkillDetailPage.jsx, agent-skill-tiering.md]
status: needs-review
---

# Skill Marketplace（跨課流通）

> **定調**：Marketplace 不是「讓 Skill 跨課使用」，而是**讓 Skill 的定義文本跨課流動，執行權限仍然鎖死在課內**。
> 執行時用的是自己課的機台、自己課的 MCP 權限、自己課的簽核人。跨課流動的只有「怎麼做這件事」的知識。
>
> ⚠️ 決策 A–H 已拍板；下方的七條流程、資料模型、分階段計畫為**提案，尚未實作**。

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
| **G** | 上游刪除 vs 下架 | **刪除時詢問是否一併下架；下架原因必填；下游課標注、確認續用、決定留痕** | 下架 ≠ 資料消失——下游要判斷續不續用就得看得到內容，故保留唯讀封存頁。**原因必填是這格最關鍵的設計**：「我們不用了」與「這流程有問題」差很多，沒有它，下游收到的只是「上游沒了」這種無法據以判斷的訊號，確認機制會退化成純儀式。決定不代為停用或刪除（同決議 19：掛排程的 Codify 不可被系統改動），只指路 |
| **H** | 發布權限 | **Seed 送出 + 課長簽准**（下架不需簽） | 與課內生效簽核是兩件事：課內簽的是「能不能在本課用」（Production 時已完成），**課長簽的是曝光**——能不能給別課看。故課長那一屏突出的是「會外流哪些課內資訊」，不是流程細節。下架是收回曝光、風險方向相反，Seed 可直接做但通知課長 |

### 連帶規則

- **適用範圍降解析度**：Marketplace 只揭露「機台類別 + 原課台數 + 觸發條件」（如 `CMP · 原課 3 台 · 每週一 08:00`），具體機台 ID 對別課無意義且屬課內識別資訊，留在詳情頁「原課生效範圍」並標明僅供參考。
- **原課驗收紀錄可看但不可用**：唯讀呈現，明確標「設備課的紀錄，不計入本課簽核」。
- **副標改寫**：`SkillManagementPage.jsx:339` 的「同課審批 · 不可跨課使用」→「同課審批 · 跨課可下載、下載後重走簽核」。
- **刪除互動升級**：已發布的 Skill，清單列的 `Popconfirm` 要換成 Modal（要填的東西超過一句話）；未發布的維持 `Popconfirm` 不動。
- **下架不刪資料**：不再出現在列表、不可再下載，但已下載過的課從來源徽章仍可讀到唯讀封存頁——要人做決定，就不能把做決定的材料收走。

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
| **F 課長簽准** | 課長 | 收到發布申請 → 只看「會外流哪些課內資訊」與別人看到的卡片 → 簽准上架／退回（必填理由，退回到抽屜第二步）。新版本重簽但**只看 diff** |
| **G 下架連動** | 上游 Seed → 下游 Seed | 刪除 Modal 選「一併下架」＋必填原因 → 下游課收 N5 通知、清單列與詳情頁標注 → 下游 Seed 決定續用／不再使用 → **決定永久留痕**，「不再使用」只表態不代為停用 |

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

`status` 新增 `pending`（待課長簽准）：`pending | listed | delisted`；發布項另掛 `approval: { by, at, decision: 'approved'|'returned', reason }`。

課內 skill 新增兩欄：

```js
origin: {
  marketplaceId, version, fromSection, at,                       // 我從哪來
  delisted: {                                                    // 上游下架後才有（決策 G）
    at, by, reason,                                              // 上游給的下架原因（必填）
    decision: 'keep' | 'stop', decidedBy, decidedAt,             // 本課的決定，永久留痕
  } | null,
} | null,
published: { marketplaceId, version } | null,                    // 我發布成什麼
```

下架的決定同時回寫 `adoption.downloads[].postDelist`，讓下架的人看得到「7 課裡有 5 課選擇繼續用」——對他判斷「是不是刪太早」有意義。

**留痕的形態**：決定完之後詳情頁收合成一行常駐標記（`上游已下架（日期）· 本課決定繼續使用 · 黃怡君`），**永久保留**。半年後排程出事有人追問「上游都下架了怎麼還在跑」，答案有名字有時間有理由——與決議 17 的 `interventions[]` 同一種東西：不會因為狀態變了就消失的稽核序列。

三個衍生設計：

1. **決策 D 的三個數字從 `adoption.outcome` 推導**，而 outcome 由下載課的 `stage` 算出、不另存——維持單一真相（同 `getSkillScheduleMap` 的作法）。
2. **`origin` 必須存 version**，才做得出「你下載的是 v1.1，目前最新 v1.2」。
3. **`derivedFrom`**：下載後改良再發布回去必然發生，v1 做單層來源標記（「衍生自 設備課《PM 到期清單彙整》v1.1」），避免原創爭議，也讓知識擴散路徑看得見。

## 分階段落地

| Phase | 內容 |
|---|---|
| **1｜看得到** ✅ **2026-08-19 已實作** | Marketplace 全頁（列表＋詳情＋版本歷史＋工具可用性檢查），資料先 mock |
| **2｜拿得到** ◐ **下載落地已實作，發布流程未做** | ✅ 下載確認 ＋ 落地成 Draft ＋ 待設定清單 ＋ 接回既有五階段／❌ 發布流程（A）與課長簽准（H） |
| **3｜活得久** ❌ 未做 | 版本更新提示（D）、採用結果回寫（E）、衍生鏈、下架（G） |

### 實作落點（2026-08-19）

新增 `data/skillMarketplace.js`、`components/SkillMarketplacePage.jsx`；
改動 `SkillManagementPage.jsx`、`SkillDetailPage.jsx`、`personas.js`、`build.py`。

三個實作期判斷：

1. **`scope.unset` 必須是旗標，不能用空陣列** —— 空陣列在 `matchScopeTargets` 裡代表「該類別全部」，與「尚未設定」語意**剛好相反**。沿用會讓下載回來的東西看起來範圍已經設好了。
2. **gate 不必新增機制** —— `getSignoffGate` 加一條 unset 判斷即可。跨課只是多了一個到不了送簽的理由，不是新的閘門。
3. **「建立於」改「下載於」** —— 下載來的內容是別課寫的，本課只是把它帶進來。

⚠️ **`MP_TOOL_GRANTS` 的設計約束**（實測抓到）：課級授權表若開太窄，卡片會出現「N 課已生效，但本課 0 個工具可用」這種自相矛盾的畫面。原則是**讀取類廣授、受限的是寫入類與各課專業系統**。維護這份 mock 時的不變量：**「在目前版本上已生效」的課，工具授權必須全數對得上**（舊版生效的課當時沒有新工具，不算矛盾）。

Phase 1 可獨立驗證「揭露的資訊夠不夠人做下載決定」——整件事風險最高的一格，先做出來給人看。

## 與既有脈絡的接點

- **飛輪 2**（[agent-skill-tiering](agent-skill-tiering.md)「自訂 node → 標準元件，平台級」）與本題是同一思想的兩個尺度。被 N 課採用且採用率穩定的 Skill，天然是升成平台級標準件的候選——**Marketplace 的採用數據正好是那道升級門檻的判準**。與 [widget-governance](widget-governance.md) 的「平台引力模型」同源，Seed 不用學新東西。
- **OQ-3「多廠複製時 Skill 共享或獨立」** 與本題同源但不同層（跨廠 vs 跨課）。決策 A（副本不訂閱）若成立，OQ-3 大機率沿用同一答案。

## 未解問題

| # | 問題 | 傾向 |
|---|---|---|
| ~~MP-OQ-1~~ | ~~誰有權發布~~ | **✅ 2026-08-19 結案 → 決策 H**：Seed 送出 + 課長簽准 |
| MP-OQ-2 | `scope` 缺「貨／產品」維度（PO 第 4.1 點提及），現有只有 class / ids / area / trigger | 獨立評估，不混在 Marketplace 做 |
| ~~MP-OQ-3~~ | ~~上游下架後副本要不要標示~~ | **✅ 2026-08-19 結案 → 決策 G**：標注＋確認續用＋留痕 |
| MP-OQ-4 | 跨課下載後，本課要不要能看到原課的驗收紀錄 | 可看但唯讀，明確標「不計入本課簽核」 |
| ~~MP-OQ-5~~ | ~~通知類型要擴充 N5／N6~~ | **✅ 2026-08-19 PO 定案：先不做，之後補**。⚠️ **已知代價見下方「暫時降級」** |
| ~~MP-OQ-6~~ | ~~課長 persona 尚未實作~~ | **✅ 2026-08-19 PO 定案：不拉進本輪**。Phase 2 只做 Seed 端＋mock「模擬課長簽准」把流程接通；課長視角（H-2／H-3 已完成設計）等 baseline §13.4 的 P2 課長 persona 一起做，做出來才會跟其他頁面一致 |

## 暫時降級（MP-OQ-5 延後的代價）

沒有 **N5 上游下架待確認**，下架的訊息只剩兩個表面：清單列徽章與詳情頁置頂——**人要自己走進 Skill 管理才看得到**。

這對決策 G 是實質降級：上游把一份「流程有問題」的 Codify 下架了，下游課可能好幾週都不知道，而那份東西正掛在排程上每週在跑。**留痕機制仍然完整（決定了就記得住），但觸達機制缺一塊。**

N6 的缺口暫時不痛——課長 persona 本來就不做，沒有人需要被通知。

→ 補 N5 的優先度應高於補 N6。Phase 3 排入時先做 N5。
