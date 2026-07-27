# Index — Agent Portal AI 大腦目錄

> 每次 ingest 後必更新。查詢時先讀本頁定位，再深入頁面。運作規範見 [WIKI.md](WIKI.md)。

## 綜述與追蹤

- [overview.md](overview.md) — 產品是什麼、現在在哪、往哪走（進入專案第一頁）
- [decisions.md](decisions.md) — v2.5 → v3.9 決議時間軸 + 2026-07-10 backlog 方法論
- [open-questions.md](open-questions.md) — OQ-1~9、TM/SCH 專屬 OQ、wiki 新發現缺口 W-1~4
- [log.md](log.md) — 操作時間軸（append-only）
- [../ai_ux_guideline.md](../ai_ux_guideline.md) — **AI 對話／Agent 執行體驗的團隊實作準則**（根目錄，AI 維護）：§0–6 執行型（Chat 頁），§7 編輯型（Skill 詳情 Ask AI），§8 快速檢查清單。做任何新的 AI 功能前先讀這頁，不必重推導一次

## Sources（原始文件摘要）

- [sources/product-baseline.md](sources/product-baseline.md) — 1440 行產品規格書 v3.9 的結構地圖
- [sources/scrum-teaming.md](sources/scrum-teaming.md) — 兩隊分工 + OKR（⚠️ 草稿待 PO 確認）
- [sources/backlog-access-permission-gate.md](sources/backlog-access-permission-gate.md) — 權限 Gate Feature + 2 Stories
- [sources/skill-review-story-splitting.md](sources/skill-review-story-splitting.md) — 開票方法論三原則（覆盤）

## Entities

- [entities/personas.md](entities/personas.md) — EE / PE / MFG / 課長 / Seed / IT 六角色
- [entities/teams.md](entities/teams.md) — AI 團隊 / Dashboard 團隊分工與跨隊依賴
- [entities/architecture.md](entities/architecture.md) — Prototype 系統架構：Python 拼裝 build、React UMD + Babel CDN
- [entities/sitemap.md](entities/sitemap.md) — 產品地圖：sitemap、四層堆疊、三股跨模組互動流

### 模組

| 頁面 | 一行摘要 | Nav |
|------|---------|-----|
| [home-dashboard](entities/modules/home-dashboard.md) | 工作站首頁：Section Zone + My Tasks 面板 + AmbientBar；**佈告欄承接 SOP 交接報告產出** | 1 |
| [kpi-center](entities/modules/kpi-center.md) | 趨勢深入分析；v3.9 報表管理後台；AntD Phase 4 已遷移 | 2 |
| [app-center](entities/modules/app-center.md) | 內部應用目錄 + 釘選 + Function Tree（Dropdown+Tree）；AntD Phase 5 已遷移 | 3 |
| [task-management](entities/modules/task-management.md) | 課長派工；P1 缺口 AI 自動標記；AntD Phase 2 已遷移 | 4 |
| [ai-chat](entities/modules/ai-chat.md) | 被動查詢原則 + 四個 Ask AI 入口；**2026-07-26 四輪 + 2026-07-27 第五輪**：當代對話版面＋五情境 → 兩種互動模態＋逐步播放 → 右側面板＋決策留痕＋**三態徽章移除（責任轉到 F-AI-01 ⚠️）** → **左右職責互換：步驟明細全回對話流（含未跑到、分支未走、失敗細節），面板只剩計畫一層，三區改名任務／產出／來源** | 5 |
| [scheduling](entities/modules/scheduling.md) | 唯一 AI 主動場景，HITL 三重約束；**只掛 SOP＋展示產出物**；AntD Phase 4 已遷移 | 6 |
| [handover](entities/modules/handover.md) | ❌ **已廢除、`HandoverPage.jsx` 已刪（2026-07-25）**；交班改為 SOP 排程產出，Schedule 檢視＋Home 佈告欄觸達；`ShiftHandoverModal` 入口已改掛佈告欄那則 SOP 產出 | — |
| [knowledge-base](entities/modules/knowledge-base.md) | **知識管理：2026-07-26 從 Skill 管理拆出獨立**（Setting 新 tab）；Vector/RAG/知識圖譜為後續方向 | — |
| [setting](entities/modules/setting.md) | 後台：Personal + Seed 八 tabs（含新的知識管理）+ IT 區 | 底部 |
| [notification](entities/modules/notification.md) | 通知中心 v1 已實作（三類通知 + 鈴鐺 + Teams 設定），AntD 試點 | Header |

## Concepts

- [concepts/design-principles.md](concepts/design-principles.md) — 八條設計原則（需求評審檢查表）
- [concepts/agent-skill-tiering.md](concepts/agent-skill-tiering.md) — **Agent Skill 三層模型**（知識／輔助判斷／SOP）+ 建立流程 + Tool Gateway runtime 把關 + 兩個飛輪；原型 2026-07-25 實作完成，**三輪改版**：①知識拆出獨立、Skill 詳情改全頁（Graph/Signoff/Ask AI）、Chat 五情境 → ②Skill 管理四項（決議 6–9）：工具列收一行、Ask AI 全程在右側不阻塞、測試補回執行動作與可看的 FAIL、建立改短表單 → ③**2026-07-27~28 決議 10–12：dry run 從一條路變成情境試跑（系統自動出壞資料情境、PASS＝行為符合約定）＋ Graph 節點試打（write 永不真送）＋ SOP 不再有測試案例——SOP 測結果與例外、輔助判斷測意圖，兩邊互不出現；執行期 contract check 與路由層驗收刻意延後 ⚠️**；頁末有實作落點與未實作清單；SCH-OQ-2 解方
- [concepts/widget-governance.md](concepts/widget-governance.md) — 四層治理 + Widget Contract
- [concepts/ecp-strategy.md](concepts/ecp-strategy.md) — ECP 下一代、交接切入點、平台引力模型
- [concepts/antd-migration-plan.md](concepts/antd-migration-plan.md) — AntD 全面遷移計畫（8 Phase、token 映射、每頁 DoD）；**Phase 0–5 ✅ 完成**（Setting 系列、TaskManagement、SkillManagement、Scheduling、KPI、Knowledge、Chat、AppCenter）＋ Phase 8 死檔清理 ✅，HandoverPage 已刪，下一棒 **Phase 6（僅 App.jsx nav/header）**
- [concepts/product-review-2026-07.md](concepts/product-review-2026-07.md) — 用戶測試前七點產品建議（楔子外露、主動性階梯、測 AI 錯誤…）
