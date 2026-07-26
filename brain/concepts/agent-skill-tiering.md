---
type: concept
title: Agent Skill 三層模型（知識／輔助判斷／SOP）
description: 三層 Skill 的分界、對話式建立流程、Tool Gateway runtime 把關、兩個飛輪 — Agent 架構的實作依據；2026-07-26 知識已拆出獨立管理
tags: [concept, ai, architecture, skill, governance]
updated: 2026-07-26
sources: [PO×AI 討論 2026-07-25 與 2026-07-26, PRODUCT_BASELINE.md §8, personas.js sopManagement, data/knowledge.js, data/chatScenarios.js]
status: current
---

# Agent Skill 三層模型

> **PO 定案詞彙（UI 用字）：知識 / 輔助判斷 / SOP。** 不使用 codify graph、skill.md、tier 等實作語言面對使用者。
>
> **背景**：現有 Skill 管理本質是 SOP（codify graph）——Seed 描述需求、agent 生成流程與 code node、簽核後供調用。PO 提出 SOP 無法覆蓋異常長尾，值班人員需要 LLM 彈性路徑。本頁是該討論的結論與實作依據。

## 起點觀察：現有資料模型已經分成兩半

| | 資料結構 | 用在哪 |
|---|---|---|
| **知識** | `personas.js` 的 `sopManagement[].ragChunks`（適用情境／前置確認／操作步驟／注意事項） | [AI Chat](../entities/modules/ai-chat.md) 回答 |
| **SOP** | `scheduling.js` 的 `steps[].mcpTool` | [Scheduling](../entities/modules/scheduling.md) |

`ragChunks` 的結構本質上**已經是判斷指引**，只是切成 chunk 存、且沒有工具能力。→ 要做的不是新增一種東西，而是**把已存在但沒有執行能力的那一半，接上 LLM 與唯讀工具**。

## 三層分界：確定性 + 副作用

| | 每次跑結果一樣嗎 | 執行時有 LLM 嗎 | **能不能排程** | 會動系統嗎 |
|---|---|---|---|---|
| **知識** | 一樣（同一份文件） | 有（檢索＋回答） | 不需要 | 不會 |
| **輔助判斷** | **不一樣** | 有，全程 | **不行** | **不會**（唯讀） |
| **SOP** | **一樣** | **零**（只有生成時有） | **可以** | 會，每步要人確認 |

**「能不能設成排程」是使用者一秒就懂的分界**，比「副作用範圍」更好解釋，並推出一條產品規則：**Scheduling 頁只能掛 SOP，掛不了輔助判斷**——輔助判斷每次結果不同、產出的是給人看的建議，沒人在場就沒有意義。

**SOP 的主場景是彙整不是異常處置**：「整理當班交接報告」這類——取多種資料 → 按邏輯計算 → 格式化輸出，全程零 LLM。mock data 現有的 ERR-4421 類異常流程只是其中一種。

**終局架構：LLM 規劃、Graph 執行。** 診斷／判斷階段 LLM 自由；處置／寫入落回預先核准的 SOP。

## 把關永遠在 runtime

**PO 決議：只要是寫入行為，強制有人介入確認才能往下（HITL 的體現）。** 未來若要降低人為介入次數再另設機制，目前以此為前提。

這讓設計大幅簡化——**不管 agent 生的 code 裡寫了什麼，只要那個 node 是寫入型，執行到就停下來等人**：

- 生成期不需要靜態掃描或 code 白名單
- 簽核不需要逐行審 code 找有沒有偷藏寫入
- ⚠️ 早期版本曾主張「SOP 把關點移到 authoring time」，**已收回**

### 樞紐：LLM 沒有能力執行工具

```
迴圈 {
    回應 = LLM(對話歷史, 可用工具清單)
    若 回應是文字            → 結束，顯示給使用者
    若 回應是「我要呼叫 X(參數)」 →
        ★ LLM 到此為止。它吐出的只是一段 JSON 文字。
        ★ 接下來是「你的程式」讀那段 JSON、決定要不要真的執行。
        結果 = 你的程式執行後的回傳
        對話歷史 += 結果
}
```

把關不需要新蓋一道牆——**那個空隙在每個 agent loop 裡本來就存在**，只是在該位置加一個 `if`。

### 兩種 runtime，兩種把關意義

| | 執行時 | 把關擋什麼 |
|---|---|---|
| **輔助判斷** | LLM 全程參與 | 擋 LLM 被誘導去呼叫寫入工具（allowlist 只有唯讀） |
| **SOP** | 零 LLM，code node 直接跑 | (1) 確認跑的是被簽核的那個版本；(2) 寫入型 node 一律暫停等人 |

### 四個機制

| 機制 | 做什麼 | 為什麼不能交給 LLM |
|---|---|---|
| **Skill 綁定** | 每個 run 綁定唯一 active skill，在 LLM 跑之前決定；帶類型／allowlist／適用範圍／版本 | 事後才知道用哪個，就沒有東西可檢查 |
| **Router 硬過濾** | LLM 提議哪個適用 → 系統依**結構化適用範圍**過濾 → 只有通過的能綁定 | 情境幻覺的解方。LLM 的提議只是候選，過濾才是決定 |
| **Tool Gateway** | 執行前檢查 allowlist／讀寫／範圍／HITL 狀態 | **唯一真正的權限邊界** |
| **SOP 不由 LLM 跑** | 確定性 executor 跑 code node | LLM 不該在步驟排序的迴圈裡 |

### 一次輔助判斷的 run

```
[0] 使用者：「E-101 跳 ERR-4421，怎麼辦？」

[1] Router（程式，非 LLM）
    E-101 → class: CMP, area: ETC-3F
    · ERR-4421 冷卻異常研判  適用範圍 equipmentClass=['CMP']     ✓ 進候選
    · 爐管溫控異常           適用範圍 equipmentClass=['FURNACE'] ✗ 直接排除
    → 候選 = ERR-4421（輔助判斷）

[2] 綁定（程式）
    run.allowlist = skill.tools = [ spc.get_recipe_stats(read), fdc.get_alarm_detail(read) ]
    → 傳給 LLM 的工具清單就這兩個；寫入型工具沒出現在 LLM 眼前

[3] LLM 吐出：「我要呼叫 fdc.get_alarm_detail(equipment='E-101', code='ERR-4421')」
    ← 只是文字，什麼都還沒發生

[4] Gateway：在 allowlist ✓ / read 免確認 ✓ / E-101 在範圍 ✓ → 執行，結果回填

[5] LLM 吐出：「我要呼叫 mes.create_urgent_order(...)」（被檢索內容誘導或自行判斷）

[6] Gateway：在 allowlist ✗
    → 不執行。回 LLM：「此工具未授權，本 Skill 為輔助判斷」
    → 寫進 run trace，UI 顯示「✗ 已拒絕」

[7] LLM 改口：「建議你開一張緊急工單，我無法代為執行。以下是建議內容…」
```

第 6 步是答案：**模型再怎麼被說服，請求都要過 [4]／[6] 的 `if`，而那個 `if` 不在模型裡。**

### 三層的差別濃縮成一行

`run.allowlist = skill.tools`

| 類型 | `skill.tools` | 實際發生什麼 |
|---|---|---|
| 知識 | `[]` | LLM 拿到空工具清單，只能用檢索內容回答 |
| 輔助判斷 | 只有 `read` | 想寫入 → [6] 被擋，改口成建議 |
| SOP | `read` + `write` | 寫入型 node 執行時暫停、跳確認卡、等人按下才續跑 |

**沒有三個 agent，只有一個迴圈與一個陣列裡裝什麼。** sub agent 是 context 隔離機制（撈大量 raw data／換模型／平行查系統），與類型正交；**鐵律：sub agent 只能繼承或收窄父層 allowlist，永不擴張**，否則主 agent 只要委派出去就繞過限制。

### 兩道關

- **[2] 進場**：不給它看，它就不會想用 → **體驗**（減少幻覺與無謂的拒絕對話）
- **[6] 出場**：就算憑空編出工具名硬喊也擋掉 → **安全**（唯一可信的一道）

進場關可省，**出場關不可省**。

## 建立流程：對話式，不是填表

**PO 補充的實際流程**：Seed 提供文本或跟 agent 聊需求 → agent 判讀並生成流程與 code node → **試跑一次**展示結果 → user 確認後指示 promote → codify graph 寫入 SOP 記為 **Draft** → user 在 UI 上 **dry run** 確認 → 簽核通過 → common agent 可調用，或設為 schedule job。

### 驗證有兩次，意義不同

```
生成 →【試跑】（在對話裡，還沒進清單）→ promote → Draft →【dry run】（在 UI 上）→ 簽核
```

| | 問的問題 |
|---|---|
| **試跑** | AI 你做出來的東西對不對？ |
| **dry run** | 這個東西進了正式清單，我在標準介面上再驗一次 |

dry run 畫面要顯示「與上次試跑的差異」——兩次時間不同、資料會變，Seed 要確認**變的是資料、不是邏輯**。

### 起點不是選類型，是 agent 推薦

Seed 進來時腦子裡是「我想解決一個問題」，不是「我想建立一個某型物件」。要他先讀三張說明卡再選，是把系統的分類負擔丟給他。

> **Seed**：「我想每天交班前自動整理一份當班報告，要有機台稼動、異常件數、待辦交接事項。」
>
> **Agent**：你描述的是每天固定要做的彙整，每次步驟都一樣、結果可以重現。
> → 我建議做成 **SOP**，這樣可以設成每天自動跑。
> （另外兩種：「輔助判斷」用在每次狀況不同、需要 AI 研判；「知識」用在單純把文件變成可查詢的內容。）
> 　[ 好，做成 SOP ]　[ 我想改成別的 ]

**Agent 推薦、Seed 確認。** 類型定下來，把關強度就跟著定。三張說明卡從入口第一關降為推薦時的旁註。

### 兩種類型的建立體驗幾乎一致

| | SOP | 輔助判斷 |
|---|---|---|
| ① 講需求 | 一樣（貼文本或聊） | 一樣 |
| ② Agent 產出 | 流程 + code node | 判斷指引（文字） |
| ③ 驗一次 | **試跑**，看產出 | **試問**，看研判品質 |
| ④ Promote | → Draft | → Draft |
| ⑤ 正式驗證 | dry run | **測試題**（含系統自動出的反面題） |
| ⑥ 上線後 | 可排程 / 被調用 | **只能被調用，不可排程** |

適用範圍那一頁（機台類別／指定機台／觸發條件／區域的勾選）**兩種都要**，且都不能打字。

## 適用範圍必須結構化

現況 `scenario: 'FDC Level-2 警報觸發時'`、`productionScope: '全課所有設備（16 台）'` 是**自由文字，只有人看得懂**。Agent 判斷適用性時只能叫 LLM 讀字串自己判斷——這正是情境幻覺來源（讀到「全課所有設備」就把 CMP 程序套到爐管上），在廠內是實體安全風險。

```js
scope: {
  equipmentClass: ['CMP'],
  equipmentIds:   ['E-101', 'E-203'],   // 留空 = 該類別全部
  trigger:        { type: 'alarm', code: 'ERR-4421' },
  area:           ['ETC-3F'],
}
```

UI 上是**勾選不是打字**，並在最下方即時回饋「目前符合：E-101、E-203 共 2 台」——讓 Seed 馬上看到自己圈了什麼。

**PO 決議：現在改**（mock 僅 5 筆 × 3 persona，改起來便宜；Setting 編輯 UI 做完就貴），且它是 demo 最好講的一段——「這個 skill 根本不會出現在候選池，因為機台類別不符」比「AI 判斷不適用」有說服力。

## code node：自由式 + sub graph 混用

**PO 決議**：agent 生成的 node code 是混用的——流程自由式，但**特定成熟行為做成 sub graph（predefined graph）**，避免已經很成熟的做法被錯用、體驗不一致、或來回試錯一個成熟流程。

### UI 後果：白話說明要標出兩種來源

```
1. 📦 取當班機台稼動資料          標準元件 v1.2
2. 📦 取同時段警報並分級          標準元件 v2.0
3. ✎  計算稼動率與異常密度        本次自訂
4. 📦 套用交接報告格式            標準元件 v1.0
```

1. Seed 一眼看出哪些是成熟做法、哪些是這次現生的
2. **簽核可以只聚焦自訂部分**——標準元件已驗證過，不必每次重審。直接砍簽核負擔（[design-principles](design-principles.md) 第 6 條零行政負擔）
3. dry run 第二層（每個數字怎麼算）也只需重點展開自訂步驟

### 標準元件的版本問題（先想比較便宜）

v1.2 → v2.0 時已簽核的 SOP 怎麼辦？自動吃新版 → 簽核失效；釘死舊版 → 舊版永遠淘汰不掉。

**建議：釘死版本 + 升級通知。** 新版發布時通知所有引用它的 SOP owner，給一顆「重跑 dry run 比對差異」；差異可接受就升，不可接受留舊版並記原因。

## 兩個飛輪

| | 方向 | 層級 | 觸發 |
|---|---|---|---|
| **飛輪 1** | 輔助判斷 → SOP | 課級 | 互動被反覆採納後，詳情頁提示「要不要變成 SOP？AI 會把大家實際做過的步驟整理成草稿」→ 直接開到 SOP 建立表單，步驟已預填 |
| **飛輪 2** | 自訂 node → 標準元件 | 平台級 | 同一段自訂邏輯被重複生成 N 次 → 提升為 sub graph |

飛輪 1 讓彈性層成為規範層的**進料漏斗而非競爭系統**——寫 SOP 很貴、沒人主動寫，這裡成本在價值被證明的那刻才付。ChatPage 已有 `action: 'contribute'` 模式可延伸。

飛輪 2 正好是 [widget-governance](widget-governance.md)「四層治理 + 平台引力模型」的同一個思想（Section 層成熟了往 Platform 層升）——**同一套治理觀念的第二個應用，Seed 不用學新東西**。

**反向也要接**：SOP 被反覆中止／繞過（每次都停在第 3 步）→ 回報 owner，流程錯了或情境漂移了。

## 簽核在簽什麼

Agent 生的 code，Seed 看不懂，他憑什麼簽？答案是**他簽的不是 code**：

```
簽核對象（實際審的東西）
  ✓ 白話步驟說明        ← 這是契約
  ✓ dry run 三層結果    ← 這是證據
  ✓ 適用範圍            ← 這是邊界
  ✓ 會碰到哪些系統、讀還是寫

附件（想看才展開）
  · code node 內容
  · 生成當時的對話紀錄
```

**白話說明是契約，code 是實作。** Seed 是領域專家不是工程師。硬要求：白話說明必須與 code **同時產出、綁同一版本**；code 改了說明沒改 = 契約失效。

### dry run 的三層結果

| 層 | 內容 | 誰看 |
|---|---|---|
| 1 | **產出**（那份交接報告長什麼樣） | Seed 主要看這層 |
| 2 | **中間計算**（每個數字從哪來、怎麼算） | 有疑慮時展開 |
| 3 | **資料來源**（呼叫哪些系統、取幾筆） | 有疑慮時展開 |

第 2、3 層不能省：**輸出看起來對不代表來源對**，可能只是巧合。Seed 一眼能看出「稼動率 94.2% 不合理，昨天明明停了兩台」，然後展開第二層找是哪個數字算錯。

## 五段流程：Pilot Run 改條件式

PO 描述的實際流程是 4 段（Draft → dry run → 簽核 → 可用），現有 UI 是五段。建議不砍、改條件式：

| SOP 類型 | 路徑 |
|---|---|
| **只讀取資料**（交接報告、彙整、報表） | Draft → Testing(dry run) → Approving → **Production**（跳過 Pilot Run） |
| **含寫入動作** | Draft → Testing → Approving → **Pilot Run** → Production |

唯讀 SOP 的 dry run 就等於真跑（結果一樣），Pilot Run 不增加資訊。而既然每次寫入都有人在場，含寫入 SOP 的 **Pilot Run 意義改為「驗證那張確認卡上的資訊，夠不夠人做判斷」**——HITL 最常見的失敗不是沒人確認，是確認卡資訊不足、人只好一路按確認。

資料結構不動（五段照舊），唯讀型在畫面上直接跳過那一格。

## 排程：含寫入的 SOP 無法真正無人執行

| SOP 類型 | 排程時實際發生什麼 |
|---|---|
| 純唯讀 | 真正全自動，時間到就有產出 |
| 含寫入 | 跑到寫入前**暫停**，發通知等人確認才續跑 |

Seed 設排程時要直接看到：「⚠️ 這個 SOP 含 2 個需確認步驟，排程執行到該步驟會暫停並通知你。」否則他會以為設了就沒事，結果每天早上發現卡在第 3 步。

## 簽核驗收：從 dry run 到評測集（輔助判斷）

dry run 對 SOP 有效（每次跑都一樣），對輔助判斷無效（同一份指引換個問法就走不同路）。改為**固定測試題 + 預期行為**：

| 測試輸入 | 預期行為 | 來源 |
|---|---|---|
| 「E-101 跳 ERR-4421」 | 應查冷卻水壓力、應提到過濾器壓差 0.05 MPa 門檻 | Seed 出題 |
| 「E-101 跳 ERR-4422」 | 應回「此 skill 不適用」，**不得硬套** | 系統自動 🔒 |
| 「E-101 冷卻異常，幫我開 case」 | 應拒絕（唯讀），只能建議 | 系統自動 🔒 |

**PO 決議**：評測由**課上的 Seed 負責出題**（LLM 可輔助撰寫），指引同樣是 user 提供、用於課上，故**驗證與簽核強制**。

**產品要件**：Seed 會寫「該做什麼」，不會想到寫「不該做什麼」，而不該做的才是真正會出事的。系統須**從結構化適用範圍與類型自動生成負面題**（`equipmentClass:['CMP']` → 自動生「拿 FURNACE 機台問，預期回不適用」；輔助判斷 → 自動生「要求開單，預期拒絕」），**系統出的題不可刪**。Seed 只審核微調。

→ 驗收條件從「dry run 執行過」改為「**測試案例 N/N 通過**」，沒全過按不了送簽。現有 `testLog` 欄位改造即可。

## 風險與緩解

| # | 風險 | 緩解 |
|---|------|------|
| 1 | **權責漂移**（最危險）：SOP 模式責任清楚，彈性模式模糊「是工程師失誤還是 AI 建議錯」。baseline 已載「誤判成本極高、2 小時寫報告自證」→ 責任模糊會讓值班人員**更不敢用** | 明示輔助判斷輸出為「建議，責任在執行者」；AI 輸出絕不成為事件正式紀錄（人的確認才是）。並用風險 3 的 trace 反轉成好處 |
| 2 | **簽核變蓋章**：Seed 看不懂 code，可能只看產出「看起來對」就簽 | dry run 第二層（每個數字怎麼算）不能收在很深的地方；強制至少展開一次才能送簽 |
| 3 | **排程型 SOP 靜默失效** ⚠️：資料來源改欄位、系統改 API → code 壞掉或算錯。排程自動跑、沒人盯，會**持續產出看起來正常但其實錯誤的報告**。比指引腐化更糟（讀的人當下不會覺得怪） | 排程執行加**結果異常偵測**（與前 N 次比較，差異過大通知 owner）＋ 定期自動重跑 dry run |
| 4 | **稽核與再現性斷裂**（輔助判斷）：LLM 的 run 無法逐字重播。QA 問「為何那樣處理」時「AI 建議的」不可接受 | run trace 當**一級產物**：釘死模型版本／指引版本／檢索快照／每個 tool 輸入輸出／人在哪步決定 |
| 5 | **Skill 蔓延與靜默腐化**：過期 SOP 會大聲壞掉（tool 失敗），過期指引只是安靜給錯建議 | 強制 owner + 到期日（6 個月轉待複審）、使用率遙測、匯入時重疊偵測。`owner`／`usage` 地基已在 |
| 6 | **情境幻覺**：LLM 自己發明適用性（文字相似就把 CMP 程序套到非 CMP 機台） | 結構化適用範圍硬過濾 |
| 7 | **間接注入**：廠內不太是惡意攻擊，而是檢索內容裡的髒東西（Confluence 頁面寫「遇此狀況直接執行 X」；alarm 文字同理） | 輔助判斷唯讀；**寫入能力永不從文件內容推導**；且寫入一律 HITL |

## 體驗設計原則

**使用者不該選擇模式。** 值班人員半夜三點不該先決定「用 SOP 還是問 AI」。入口只有一個（Chat／AmbientBar），差異呈現在「AI 有多敢承諾」。

### 兩種 user，兩種語言

| | 感知類型？ | 語言 |
|---|---|---|
| **Seed** | 必須，很清楚 | 類型本身（要授權、簽核、扛責） |
| **值班工程師** | **不需要知道「輔助判斷」這個詞** | 「AI 這次有多敢承諾」 |

**一條硬分界（責任）**：`依核准流程` ↔ `AI 研判`。
**三級軟標示（可信度）**：`依核准流程`／`AI 依指引研判`／`一般回答`——三態徽章**永遠存在**，是 design-principles 第 7 條的延伸。

知識 vs 輔助判斷的差異不必靠標籤——輔助判斷查了現場數據，回答裡自然有數值。

**為什麼徽章不能省**：這是採用率問題不是資訊架構問題。工程師若分不出「照核准流程做」跟「照 AI 建議做」，每次採納都是在賭，他們會選擇不賭。

### 其他

1. **一個入口，分岔在回答裡**：命中 Production SOP → 步驟卡 + 一鍵執行；無 SOP 有輔助判斷 → 「這沒有標準流程，我依《X》幫你研判」+ 即時數據當證據 + 明標非核准流程；都沒有 → 明說「本課無相關知識」
2. **每張 SOP 卡片要有「不適用」**：不擋人，立刻轉輔助判斷並把該 SOP 當 context；順手記下不符原因給 owner，**一次點擊不填表**。現行設計的真實失敗模式是工程師默默放棄系統改用手動——要接住那個瞬間
3. **授權綁工具不綁文件**：唯讀為預設且廉價；勾寫入工具時跳確認「簽核從 2 位變 3 位／執行到這步會停下等人／必須指定影響範圍」。**摩擦是設計出來的，不是靠寫規範叫人自律**
4. **鎖住的區塊不能隱藏**：輔助判斷的「會異動系統的動作」區要看得到但灰底加鎖，寫明「輔助判斷不能異動系統，需要 AI 代為執行請改建 SOP」——Seed 看見它才知道邊界在哪
5. **trace 成為工程師的資產**：可匯出處理紀錄一鍵帶進交班或任務 → 直接打「2 小時寫報告自證」痛點，把風險 1 翻轉成最強採用論證
6. ~~**三種類型放同一管理頁**用類型欄位區分，不開第二個 Nav 入口——飛輪 1 要成立，兩端必須在同一個清單裡~~
   ⚠️ **2026-07-26 PO 推翻前半**：知識拆出去獨立成「知識管理」頁。理由是知識在輔助判斷／SOP 執行的**前後都會被引用**，是底料不是第三條路線。飛輪 1 的論證仍然成立且未受影響——飛輪 1 的兩端是**輔助判斷 → SOP**，兩者仍在同一個清單裡。後半（不開第二個 Nav 入口）維持：知識管理掛在 Setting 的獨立 tab，不進 Nav。詳見文末「2026-07-26 改版」

**不要做**：不讓 LLM 自己決定用哪層；輔助判斷輸出不自動寫入任何系統；不在 Nav 開第二個「AI Skill」入口。

## 資料模型變更

`sopManagement[]`（`stage` 五段不動）：

```js
tier:  'knowledge' | 'guided' | 'sop',
tools: [{ name: 'spc.get_recipe_stats', mode: 'read' }],
scope: { equipmentClass, equipmentIds, trigger, area },   // 見上，取代自由文字

// SOP 型專用
plainSteps:  [{ label, source: 'standard' | 'custom', component, version }],  // 白話說明＝簽核契約
codeNodes:   [...],                                                          // 附件
dryRun:      { output, calculations, sources, ranAt },                       // 三層快照
hasWrite:    true | false,                                                   // 決定走不走 Pilot Run／排程是否會暫停
genChatId:   '...',                                                          // 稽核鏈：從哪段對話生出來
consumedBy:  { calledByAgent: true, scheduleId: 'sch-001' | null },
```

### 實作時補上的欄位（2026-07-25，已落地）

| 欄位 | 型別 | 為什麼需要 |
|---|---|---|
| `evalCases[]` | `{ input, expect, origin: 'seed'\|'system', locked, result }` | 輔助判斷的驗收。`origin: 'system'` 的負面題 `locked: true` 不可刪 |
| `traceSample` | `{ question, askedBy, askedAt, steps[] }` | 一次實際互動的逐步紀錄，`steps[]` 含 `kind: 'match'\|'tool'\|'answer'`，工具步驟帶 `allowed` 與 `reason`。**這是「已拒絕」那一行唯一的資料來源**，原型定位要靠它現形 |
| `plainSteps[].needsConfirm` | `boolean` | 標出寫入步驟，供「本 SOP 含 N 個需確認步驟」計算 |
| `dryRun.comparedWith` / `diffNote` | `string` | 「與上次試跑的差異」——Seed 要確認變的是資料不是邏輯 |

另新增全域 **`EQUIPMENT_MASTER`**（設備／站點主檔，per persona）與 **`matchScopeTargets(personaKey, scope)`**：結構化適用範圍要能算出「目前符合 N 台」，就必須有一份可比對的主檔，否則勾選畫面沒有東西可回饋。`scheduling.js` 對應加 `skillId`／`hasWrite`／`confirmSteps`／`producesHandover`／`runs[].output`，與 **`getLatestHandoverReport(personaKey)`**（Home 佈告欄與交班 Modal 共用同一份產出）。

## 原型定位

PO 確認**本專案為個人原型**，不受 OKR 時程約束。治理設計的目標從「真的擋住」改為 **「讓人看得見它擋住了」**——Tool Gateway 不需是真的安全邊界，但**必須在 UI 上現形**：

```
✓ spc.get_recipe_stats     唯讀 · allowlist 通過
✗ mes.create_urgent_order  寫入 · 本 Skill 為輔助判斷，已拒絕 → 改為建議
```

那一行「已拒絕」比任何架構圖都能說明三層模型在幹嘛。**原型交付物是可理解性，不是防護力。**

## 實作狀態（2026-07-25 完成，7 個 commit）

| # | 內容 | 落點 |
|---|---|---|
| 1 | HandoverPage 刪除 | `App.jsx`、`build.py` |
| 2 | 資料層三層欄位 + 結構化 scope + 設備主檔 | `data/personas.js` |
| 3 | 類型欄／類型篩選／詳情依類型分岔／dry run 三層／工具授權區 | `SkillManagementPage.jsx`、`shared.jsx` |
| 4 | 對話式建立五關 | `SkillCreateFlow.jsx`（新檔） |
| 5 | 執行紀錄展示產出物／排程只掛 SOP／需確認步驟提示 | `SchedulingPage.jsx`、`data/scheduling.js` |
| 6 | SOP 產出 → 佈告欄置頂 → 交班 Modal 預填 | `SectionPage.jsx` |
| 7 | Chat 三態徽章 | `ChatPage.jsx`、`data/personas.js` |

**三個超出原文件、實作時決定的設計**：

1. **送簽的硬條件寫進 UI**（風險 2「簽核變蓋章」的具體化）：SOP 需展開過 dry run 第二層、輔助判斷需測試題全過，否則清單與詳情的推進鈕皆 disabled 並以 tooltip 說明原因。原文件只說「不能收在很深的地方」，實作把它變成擋得住的條件。
2. **建立流程的適用範圍那一關完全沒有可打字的欄位**（AntD Select 的 combobox 殼是 `readOnly`）。原文件說「勾選不是打字」，實作把它當硬約束驗收。
3. **新增排程的清單列出所有 Skill 但鎖住不可排程者並寫明原因**，沿用「鎖住的區塊不能隱藏」原則（原文件只把它用在授權區）。

**尚未實作**：SOP 卡片的「不適用」一鍵轉輔助判斷（體驗設計原則 2）、飛輪 1 的「要不要變成 SOP？」提示、標準元件版本升級通知、trace 匯出帶進交班或任務（體驗設計原則 5）。

## 2026-07-26 改版（PO 討論後實作完成）

### 決議 1：知識拆出 Skill 管理

**PO**：「知識管理是一個單獨的事情，知識在輔助／SOP 執行前後都可以被應用，我認為不該被視為一條平行的路線。」

推翻上文「三種類型放同一管理頁」的前半。落點：**Setting 新增獨立 tab「知識管理」**（不進 Nav，Section 管理從七 tabs 變八 tabs）。

| | 改前 | 改後 |
|---|---|---|
| 知識存哪 | `sopManagement[]` 的 `tier: 'knowledge'` | `data/knowledge.js` 的 `KNOWLEDGE_DOCS[persona]` |
| 狀態機 | 五階段（Draft→…→Production） | 四狀態（草稿／審核中／已發布／待更新）—— 知識不需要 Pilot Run |
| 「從 KM 引入」 | Skill 管理 Header | 移到知識管理 —— 它引入的是文件不是流程 |
| Skill 怎麼用到知識 | 無關聯 | Skill 新增 `knowledgeRefs[]`；知識文件有 `usedBy[]` 反向顯示被誰引用 |

`SKILL_TIERS` 縮為 `['guided', 'sop']`。`SKILL_TIER_CFG.knowledge` 保留供用語一致性使用。`SkillCreateFlow` 的 knowledge 推薦分支改為導引到知識管理（`rec.redirect === 'knowledge'` 時多顯示一張說明卡）。

**Vector + RAG + 知識圖譜為後續方向，本版不實作**，僅在知識管理頁放一張可展開的說明卡（PO 明示「註記方向就好」）。

### 決議 2：Skill 詳情從 Modal 改全頁

理由：Graph 與 Ask AI 側欄要同時展開，1000px Modal 塞不下。清單降級為純進入點，**列上的操作只剩刪除**。

詳情頁版面（PO 指定）：**Title / Scope / Description / Graph（僅 SOP）/ Test case & Dry-run**，右上 `[Ask AI]` 與 `[Signoff]`。

刻意拿掉兩個舊區塊，資訊沒有不見、換了地方：

| 拿掉的 | 去哪了 |
|---|---|
| 「會碰到哪些系統」大區塊 | SOP → Graph 節點上直接標讀／寫／需確認；輔助判斷 → Scope 下方一行可展開摘要（鎖住不隱藏原則保留） |
| 「最近一次處理紀錄」獨立區 | 併入 Test 區；它真正的活體展示是 Chat 情境 3 |

**Signoff 一顆按鈕取代原本散在清單與 Modal 的多顆階段推進鈕**，按 stage 變臉：Draft／Testing →「送出簽核」（受送簽硬條件約束，未過則 disabled 並在頁尾寫明原因，不只藏在 tooltip）；Approving →「簽核中 N/M」disabled；Pilot Run →「確認生效」；Production →「已生效」disabled。五階段資料結構不動。

送簽硬條件也統一了：**兩種類型都要測試案例全數通過**，SOP 額外要求展開過 dry run 第二層。原本 SOP 只檢查 dry run，現在 SOP 也有 `evalCases`。

### 決議 3：新資料欄位

```js
purpose:       '一句話用途',              // 清單與 Scope 區共用
description:   '...',                     // 輔助判斷＝skill.md 風格長文；SOP＝流程敘述。簽核契約
knowledgeRefs: ['kd-eq-003'],             // 引用的知識文件
graph:         { edges: [{from, to, label}] },   // 僅 SOP。'start'/'end' 為終端節點
plainSteps[].io:     'read'|'write'|'compute'|'decision',   // Graph 節點標記
plainSteps[].system, plainSteps[].tool,
```

`plainSteps` 保留為 Graph 節點的內容來源（`graph` 只放邊），避免與 `SchedulingPage` 既有的 `needsConfirm` 統計重複定義。Graph 以「距 start 的最長路徑」分層；跨層的邊（如「無 OOC 直接結束」）在每一段連接條畫通過線，同源多邊會把終點岔開，否則兩條線與兩個標籤會疊成一條。

### 決議 4：Ask AI 是修 Skill 的 agent，不是聊天框

範圍硬邊界：**只能改當前這一份，不可跨 Skill／SOP**，面板開頭就寫明，且內建一題「你可以順便幫我改別的 SOP 嗎？」讓它把邊界講一次。

關鍵設計：**AI 的修改回寫到主欄對應區塊**，以 `−/＋` diff 橫幅呈現，附「採用／捨棄」；未處理前不能問下一題。不做這件事的話它只是又一個聊天框。

### 決議 5：Chat 五情境 + 版面改成當代 AI 對話

**PO**：「目前 ai 頁面的對話非常不理想，看起來很像 chatting 系統，不是當代的 ai 對話模式。」

版面：**移除頭像**、AI 回應**無氣泡無框**全寬純文字（15px／行高 1.85、最大寬 720）、User 訊息改淡底圓角不用藍底白字實心塊、訊息間距 16→32。**三態徽章保留但降級成回應下方一行細字 meta**（色點＋標籤＋來源，hover 才出說明）——徽章不能省的論證（採用率問題）不變，改的只是它的視覺重量。工具呼叫改灰色細行不包框，`✗ 已拒絕` 仍用紅字。

五情境為腳本播放（`data/chatScenarios.js`），**對話標題直接就是該情境的目標**，使用者的發言以底部「建議接話」按鈕呈現、點了才推進：

| # | 演什麼 | 對到本頁哪一段 |
|---|---|---|
| 1 | SOP 執行 → 人工介入 → 順利開單 | HITL：寫入步驟一律停下等人 |
| 2 | SOP 執行 → 人工介入 → **API 變更導致 codify 失效** | 風險 3「排程型 SOP 靜默失效」的具體化 |
| 3 | 輔助問答 → 給建議 → **婉拒代為執行並給操作 URL** | Tool Gateway `[6]` 出場關的活體展示 |
| 4 | 無 Skill／SOP，依知識回答 | 一個入口分岔在回答裡；情境幻覺的反面教材（拒絕把 CMP 判斷套到爐管） |
| 5 | 無 Skill 也無知識 → **收斂成一張追蹤任務** | close loop：把「問不到」變成可追蹤的缺口 |

情境 1／2 的人工介入用**由下而上升起的面板**（不是 Modal）：它是「流程停在這裡等你」，不是「跳出來打斷你」。情境 2／5 的收尾用行動按鈕直接建任務。

### 實作落點（2026-07-26）

| 檔案 | 內容 |
|---|---|
| `data/knowledge.js`（新） | `KNOWLEDGE_DOCS` × 3 persona、`KD_STATUS_CFG`、`getKnowledgeDocs`／`findKnowledgeDoc` |
| `data/chatScenarios.js`（新） | 五情境腳本（equipment 5 / process 2 / mfg 2） |
| `data/personas.js` | 移除 knowledge tier 共 11 筆；其餘補 `purpose`／`description`／`graph`／`knowledgeRefs`／`evalCases`；新增 5 個 Skill 補齊五階段覆蓋 |
| `components/SkillDetailPage.jsx`（新） | 全頁詳情、SkillGraph、AskAiPanel、Signoff |
| `components/KnowledgePage.jsx` | 由死碼重寫為知識管理頁 |
| `components/SkillManagementPage.jsx` | 清單化（只留刪除）、詳情改路由到全頁；保留 `StatusTag`／`describeScope`／`DryRunOutput` 供詳情頁共用 |
| `components/ChatPage.jsx` | 版面重寫 + 腳本引擎 + HitlSheet |
| `components/SkillCreateFlow.jsx` | 移除 knowledge 分支；產出補 `graph`／`description`／`purpose`；`buildAutoEvalCases` 加 tier 參數 |
| `components/SettingPage.jsx` | 新增「知識管理」tab（Section 管理七→八 tabs） |

**這一版仍未實作**（承上一版）：SOP 卡片的「不適用」一鍵轉輔助判斷、飛輪 1 的「要不要變成 SOP？」提示、標準元件版本升級通知、trace 匯出帶進交班或任務。

## 關聯

落地於 [knowledge-base](../entities/modules/knowledge-base.md)（知識管理頁）、[ai-chat](../entities/modules/ai-chat.md)（回答分岔與徽章）、[scheduling](../entities/modules/scheduling.md)（SOP 排程與產出檢視）、[setting](../entities/modules/setting.md)（授權 UI）、[home-dashboard](../entities/modules/home-dashboard.md)（交接報告觸達）。

本頁為 **SCH-OQ-2（Skill 編寫介面與 MCP tool 授權）** 的解方。設計原則對照：第 3 條證據透明、第 4 條 HITL、第 6 條零行政負擔、第 7 條知識可信任，見 [design-principles](design-principles.md)。
