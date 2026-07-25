# Index — Agent Portal AI 大腦目錄

> 每次 ingest 後必更新。查詢時先讀本頁定位，再深入頁面。運作規範見 [WIKI.md](WIKI.md)。

## 綜述與追蹤

- [overview.md](overview.md) — 產品是什麼、現在在哪、往哪走（進入專案第一頁）
- [decisions.md](decisions.md) — v2.5 → v3.9 決議時間軸 + 2026-07-10 backlog 方法論
- [open-questions.md](open-questions.md) — OQ-1~9、TM/SCH 專屬 OQ、wiki 新發現缺口 W-1~4
- [log.md](log.md) — 操作時間軸（append-only）

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
| [ai-chat](entities/modules/ai-chat.md) | 被動查詢原則 + 四個 Ask AI 入口 + **回答三態徽章**；AntD Phase 5 已遷移 | 5 |
| [scheduling](entities/modules/scheduling.md) | 唯一 AI 主動場景，HITL 三重約束；**只掛 SOP＋展示產出物**；AntD Phase 4 已遷移 | 6 |
| [handover](entities/modules/handover.md) | ❌ **已廢除、`HandoverPage.jsx` 已刪（2026-07-25）**；交班改為 SOP 排程產出，Schedule 檢視＋Home 佈告欄觸達；`ShiftHandoverModal` 入口已改掛佈告欄那則 SOP 產出 | — |
| [knowledge-base](entities/modules/knowledge-base.md) | RAG + 五段簽核（未掛 Nav，7/31 目標）；AntD Phase 4 已遷移 | — |
| [setting](entities/modules/setting.md) | 後台：Personal + Seed 七 tabs + IT 區 | 底部 |
| [notification](entities/modules/notification.md) | 通知中心 v1 已實作（三類通知 + 鈴鐺 + Teams 設定），AntD 試點 | Header |

## Concepts

- [concepts/design-principles.md](concepts/design-principles.md) — 八條設計原則（需求評審檢查表）
- [concepts/agent-skill-tiering.md](concepts/agent-skill-tiering.md) — **Agent Skill 三層模型**（知識／輔助判斷／SOP）+ 對話式建立流程 + Tool Gateway runtime 把關 + sub graph 混用 + 兩個飛輪；**原型 2026-07-25 已實作完成（7 步）**，頁末有實作狀態與未實作清單；SCH-OQ-2 解方
- [concepts/widget-governance.md](concepts/widget-governance.md) — 四層治理 + Widget Contract
- [concepts/ecp-strategy.md](concepts/ecp-strategy.md) — ECP 下一代、交接切入點、平台引力模型
- [concepts/antd-migration-plan.md](concepts/antd-migration-plan.md) — AntD 全面遷移計畫（8 Phase、token 映射、每頁 DoD）；**Phase 0–5 ✅ 完成**（Setting 系列、TaskManagement、SkillManagement、Scheduling、KPI、Knowledge、Chat、AppCenter）＋ Phase 8 死檔清理 ✅，HandoverPage 已刪，下一棒 **Phase 6（僅 App.jsx nav/header）**
- [concepts/product-review-2026-07.md](concepts/product-review-2026-07.md) — 用戶測試前七點產品建議（楔子外露、主動性階梯、測 AI 錯誤…）
