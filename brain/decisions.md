---
type: decision
title: 決議時間軸（v2.5 → v3.9）
description: 歷次版本的關鍵產品決議，一頁掌握「為什麼現在長這樣」
tags: [decision, changelog]
updated: 2026-07-11
sources: [PRODUCT_BASELINE.md §13, 版本標頭]
status: current
---

# 決議時間軸

| 版本 | 日期 | 決議 | 影響頁 |
|------|------|------|--------|
| v2.5 | — | Task Management 上線：課長總覽 / 快速派工 / Drawer / 歷史 7 天 | [task-management](entities/modules/task-management.md) |
| v2.6 | — | Scheduling 上線：唯一允許 AI 主動的場景 + HITL 三重約束 | [scheduling](entities/modules/scheduling.md) |
| v2.7 | — | 應用入口三分工確立（課的應用 / 我的釘選 / APP Center） | [app-center](entities/modules/app-center.md) |
| **v2.8** | — | **移除「我的釘選」widget**：Personal Zone 聚焦 Priority Feed，釘選統一 APP Center，避免雙頭管理 | [home-dashboard](entities/modules/home-dashboard.md) |
| v2.9 | — | Setting 後台上線（Seed 五 tabs 起步） | [setting](entities/modules/setting.md) |
| v3.1 | — | Dark Mode（ThemeContext）；Setting 改全角色可見（Personal 區） | [setting](entities/modules/setting.md) |
| v3.2 | — | 新增 IT 管理員 persona + Function Tree 三層結構 + IT APP 管理 tab | [personas](entities/personas.md)、[app-center](entities/modules/app-center.md) |
| v3.4 | — | APP Center header pill toggle 新舊版切換；Function Tree 前台入口 | [app-center](entities/modules/app-center.md) |
| v3.5 | — | Home 新增 Tool Status / Case / Lot Hold 三 widget；設備課暫隱 KPI/Apps | [home-dashboard](entities/modules/home-dashboard.md) |
| **v3.6** | 2026-04-30 | **大老闆決議 Nav 順序：Home → KPI → App → Task → AI → Schedule**。原則：「資訊整合優先，管理集中統一，AI 置後作為輔助工具」；Schedule 不降級為 Task 子頁 | 全部 |
| v3.7 | — | 首頁排版 row-based（homeLayout + HomeLayoutTab）；設備課恢復 KPI/Apps（修正 v3.5） | [home-dashboard](entities/modules/home-dashboard.md)、[setting](entities/modules/setting.md) |
| v3.8 | 2026-05-01 | My Tasks 由 widget 卡片改為**全高右側面板**（sticky header、獨立捲動、可收合） | [home-dashboard](entities/modules/home-dashboard.md) |
| v3.9 | 2026-05-07 | Setting 新增 KPI 報表管理 tab（兩種來源類型、雙層拖曳排序） | [kpi-center](entities/modules/kpi-center.md) |
| — | 2026-07-10 | 權限 Gate backlog 定稿（skill 產出首單）+ 三條開票方法論確立 | [sources](sources/backlog-access-permission-gate.md)、[覆盤](sources/skill-review-story-splitting.md) |
| — | 2026-07-24 | **AntD 全面遷移**（非孤島漸進；維持現有 build pipeline 不含 Vite）；Phase 順序表單重的先、Home/Handover 最後 | [遷移計畫](concepts/antd-migration-plan.md) |
| — | 2026-07-24 | **Notification v1 定案**：N1/N2/N3 三類、AR=被指派人本人（無回向通知）、Teams 逐則推送但僅做設定 UI 不 mock、歷史 7 天 Popover 內 | [notification](entities/modules/notification.md) |

**模式觀察**（PM 視角）：決議多次走「先做 → 發現雙頭管理/定位混淆 → 收斂單一入口」路徑（v2.8 釘選、v3.6 Nav）；引用舊版行為時務必先查本表確認未被推翻。
