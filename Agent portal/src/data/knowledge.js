/* ════════════════════════════════════════
   KNOWLEDGE — 課上的知識文件

   2026-07-26 PO 決議：知識從 Skill 管理拆出來獨立。
   理由：知識管理是單獨的一件事，在 Skill / Codify 執行前後都會被引用，
   不該被當成與它們平行的第三條路線。
   （此決議推翻 brain/concepts/agent-skill-tiering.md
     「三種類型放同一管理頁」那一條，該頁已回填。）

   後續方向（本版不實作，僅在 UI 標註）：
   Vector 索引 → RAG 檢索 → 使用者自建知識圖譜。
   目前 chunks 為人工切分的靜態內容，僅供原型展示檢索結果長什麼樣。
   ════════════════════════════════════════ */

/* 文件狀態：比 Skill 的五階段簡單，知識不需要 Pilot Run */
const KD_STATUS_CFG = {
  draft:        { label: '草稿',   color: '#6B7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.2)' },
  reviewing:    { label: '審核中', color: '#2563EB', bg: 'rgba(37,99,235,0.08)',   border: 'rgba(37,99,235,0.2)'   },
  published:    { label: '已發布', color: '#22C55E', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)'   },
  needs_update: { label: '待更新', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)'  },
};

const KD_STATUSES = ['draft', 'reviewing', 'published', 'needs_update'];

const KNOWLEDGE_DOCS = {

  /* ════════ ETC 設備課 ════════ */
  equipment: [
    {
      id: 'kd-eq-001',
      title: 'E-101 換件流程更新版 v3.0',
      summary: 'CMP 研磨頭定期換件的完整作業說明，含備料、力矩規範與冷卻水路確認。',
      source: 'Confluence · ETC 設備課 / 設備作業 Skill',
      sourceType: 'confluence',
      owner: '王志明',
      importedBy: '王志明',
      importedAt: '2026-04-14',
      updatedAt: '2026-04-14',
      status: 'draft',
      tags: ['E-101', '換件', 'CMP'],
      usage: 0,
      usedBy: [],
      chunks: [
        { id: 'c1', label: '適用情境', content: '適用於 E-101 系列 CMP 設備研磨頭定期換件作業，週期依 PM 排程或磨耗達閾值觸發。', tokens: 52 },
        { id: 'c2', label: '前置確認', content: '備料確認：研磨頭 ×1、O-ring ×2 (型號 OR-22A)、力矩扳手 (0–30 N·m)、冷卻水路清潔套件。操作者需持有「CMP 換件」資格認證。', tokens: 78 },
        { id: 'c3', label: '操作步驟 1–4', content: '1. 停機前準備：確認設備進入 Idle 狀態，關閉進漿閥並排空殘漿（等待 ≥5 min）。2. 拆除舊研磨頭：以力矩扳手依序鬆開上蓋螺絲（對角順序，18 N·m）。3. 安裝新研磨頭：確認 O-ring 完整置入溝槽後鎖緊（18 N·m）。4. 冷卻水路確認：開啟進水閥，流量 1.8–2.2 L/min，溫度 <28°C。', tokens: 142 },
        { id: 'c4', label: '操作步驟 5–7', content: '5. 試運轉：以空跑模式執行 5 分鐘，確認無異常震動或滲漏。6. 性能確認：進行試磨片確認研磨率符合規格（550±50 Å/min）。7. 記錄歸檔：填寫換件記錄表，更新設備履歷。', tokens: 98 },
        { id: 'c5', label: '注意事項', content: '嚴禁在設備運轉中進行換件。若冷卻水流量低於 1.8 L/min，須先執行「冷卻水路疏通程序」。力矩值務必使用校驗合格之扳手。', tokens: 65 },
      ],
    },
    {
      id: 'kd-eq-002',
      title: 'CMP 研磨頭預熱啟動程序',
      summary: '冷機停機 4 小時以上後的預熱啟動說明，含目標溫度與穩定判定。',
      source: 'Confluence · ETC 設備課 / 開機作業',
      sourceType: 'confluence',
      owner: '吳志豪',
      importedBy: '吳志豪',
      importedAt: '2026-04-12',
      updatedAt: '2026-04-13',
      status: 'reviewing',
      tags: ['預熱', 'CMP', '開機'],
      usage: 3,
      usedBy: [],
      reviewers: [
        { name: '林課長', avatar: '林', role: 'Section Admin', approved: true,  time: '04/13 11:20' },
        { name: '王志明', avatar: '王', role: 'Senior Engineer', approved: false, time: null },
      ],
      chunks: [
        { id: 'c1', label: '適用情境', content: '適用於 CMP 設備冷機狀態（停機超過 4 小時）後的預熱啟動，確保研磨頭達到操作溫度後才開始生產。', tokens: 60 },
        { id: 'c2', label: '預熱步驟', content: '1. 啟動設備控制器，選擇「預熱模式」。2. 設定目標溫度 85°C。3. 等待溫度穩定（±5°C 內持續 10 分鐘視為穩定）。4. 執行試磨確認溫度均勻性。', tokens: 88 },
      ],
    },
    {
      id: 'kd-eq-003',
      title: 'ERR-4421 冷卻系統異常排除 v2',
      summary: '冷卻水路壓力異常代碼的定義、常見根因與排查順序。',
      source: 'Confluence · ETC 設備課 / 異常排除指引',
      sourceType: 'confluence',
      owner: '王志明',
      importedBy: '王志明',
      importedAt: '2026-04-10',
      updatedAt: '2026-05-06',
      status: 'published',
      tags: ['ERR-4421', '冷卻系統', '異常排除'],
      usage: 41,
      /* 這一份被 Skill 引用 —— 知識不是平行路線，是被引用的底料 */
      usedBy: [
        { id: 'sm-eq-006', title: 'ERR-4421 冷卻異常研判', tier: 'guided' },
      ],
      chunks: [
        { id: 'c1', label: '異常代碼定義', content: 'ERR-4421 代表冷卻水路壓力異常（低於 0.15 MPa 觸發）。可能根因：水路阻塞、感測器老化、循環泵葉輪磨損。', tokens: 55 },
        { id: 'c2', label: '排查步驟', content: '1. 確認冷卻水主閥開啟狀態。2. 檢查過濾器是否阻塞（壓差 >0.05 MPa 需清洗）。3. 執行壓力感測器自校正。4. 若仍異常聯繫設備製造商。', tokens: 92 },
        { id: 'c3', label: '根因統計', content: '依本課近一年 17 次紀錄：冷卻水路阻塞 60%、壓力感測器老化 25%、循環泵葉輪磨損 15%。阻塞案例平均間隔 4.2 個月。', tokens: 68 },
      ],
    },
    {
      id: 'kd-eq-004',
      title: '設備日常巡檢標準程序 v2.5',
      summary: '白班與夜班開班前的設備狀態確認項目與判定值。',
      source: 'Confluence · ETC 設備課 / 日常作業',
      sourceType: 'confluence',
      owner: '王志明',
      importedBy: '王志明',
      importedAt: '2026-03-20',
      updatedAt: '2026-04-01',
      status: 'published',
      tags: ['巡檢', '日常', '標準'],
      usage: 88,
      usedBy: [],
      chunks: [
        { id: 'c1', label: '適用情境', content: '每日白班（08:00）及夜班（20:00）開始前，由當班工程師執行設備狀態確認，確保所有設備進入正常運轉狀態。', tokens: 50 },
        { id: 'c2', label: '前置確認', content: '巡檢前需確認：巡檢表已列印（或 MES 系統開啟）、安全防護裝備已佩戴、緊急聯絡清單已確認。', tokens: 45 },
        { id: 'c3', label: '巡檢步驟', content: '1. 確認設備運轉狀態（Idle / Running / Alarm）並記錄於巡檢表。2. 目視檢查異常指示燈與異音，有疑慮立即回報。3. 確認冷卻水壓力（0.20–0.30 MPa）。4. 確認真空度（<10 mTorr）。5. 確認爐管溫度一致性（±2°C 以內）。6. 完成巡檢表簽名並上傳系統。', tokens: 128 },
        { id: 'c4', label: '注意事項', content: '發現 Alarm 狀態設備須立即通報 Section Admin，不可自行解除警報。巡檢表需於班次結束前完成上傳，遲交視為未執行。', tokens: 55 },
      ],
    },
    {
      id: 'kd-eq-005',
      title: 'E-101 日常巡檢程序 v1.8',
      summary: 'E-101 專屬巡檢細項。⚠️ 步驟 3 壓力值與現行設備規格不符，已有工程師回饋。',
      source: 'Confluence · ETC 設備課 / 日常作業',
      sourceType: 'confluence',
      owner: '王志明',
      importedBy: '吳志豪',
      importedAt: '2025-11-02',
      updatedAt: '2025-11-02',
      status: 'needs_update',
      tags: ['E-101', '巡檢'],
      usage: 12,
      usedBy: [],
      feedback: '吳志豪 回饋：步驟 3 壓力值需修正（文件寫 0.15–0.25 MPa，現行規格為 0.20–0.30 MPa）',
      chunks: [
        { id: 'c1', label: '巡檢細項', content: '1. 確認 E-101 主機台電源與 UPS 狀態。2. 確認研磨液供給壓力。3. 確認冷卻水壓力 0.15–0.25 MPa。4. 確認排氣風量。', tokens: 72 },
      ],
    },
    {
      id: 'kd-eq-006',
      title: 'FDC 警報分級對照表',
      summary: 'FDC Level-1 / Level-2 / Level-3 的判定條件與對應反應時限。',
      source: 'Confluence · ETC 設備課 / FDC 管理',
      sourceType: 'confluence',
      owner: '張文凱',
      importedBy: '張文凱',
      importedAt: '2026-04-05',
      updatedAt: '2026-04-05',
      status: 'published',
      tags: ['FDC', '分級', '警報'],
      usage: 64,
      usedBy: [
        { id: 'sm-eq-004', title: 'FDC 異常快速反應流程', tier: 'sop' },
      ],
      chunks: [
        { id: 'c1', label: '分級定義', content: 'Level-1：單點超出 1σ，記錄即可。Level-2：連續 3 點超出 2σ，需 10 分鐘內完成初步確認與通報。Level-3：超出 3σ 或連續 5 點同側，需立即停機隔離。', tokens: 88 },
        { id: 'c2', label: '反應時限', content: 'Level-1 當班內回顧；Level-2 10 分鐘內通報 Section Admin；Level-3 立即停機並 5 分鐘內升報課長。逾時未處置列入 Must-be-zero 指標。', tokens: 74 },
      ],
    },
  ],

  /* ════════ ETC 製程課 ════════ */
  process: [
    {
      id: 'kd-pr-001',
      title: '新製程配方驗證規範 v2.0',
      summary: '新 Recipe 或關鍵參數變更後的 Qualification 必測項目與流程。',
      source: 'Confluence · ETC 製程課 / 配方管理',
      sourceType: 'confluence',
      owner: '黃怡君',
      importedBy: '黃怡君',
      importedAt: '2026-04-14',
      updatedAt: '2026-04-14',
      status: 'draft',
      tags: ['Recipe', 'Qualify', '驗證'],
      usage: 0,
      usedBy: [],
      chunks: [
        { id: 'c1', label: '適用情境', content: '適用於所有新 Recipe 建立或現有 Recipe 關鍵參數變更後的驗證作業，需完成 Qualification 流程方可量產。', tokens: 58 },
        { id: 'c2', label: '驗證項目', content: '必測項目：(1) 膜厚均勻性 ≤2% (2) 研磨率穩定性 ±50 Å/min (3) 顆粒污染 <50 顆/cm² (4) 跨批次重現性 (n≥5)。', tokens: 85 },
        { id: 'c3', label: '流程步驟', content: '1. 建立驗證計畫（含測試片數量、量測站點）。2. 執行 3 批次試跑，收集量測數據。3. 統計分析（計算 Cpk）。4. 提交驗證報告至 Section Admin 審核。5. 核准後正式 Release。', tokens: 112 },
      ],
    },
    {
      id: 'kd-pr-002',
      title: 'SPC 失控快速處置指引 v2',
      summary: 'Nelson Rule 各規則的失控定義與立即處置步驟。',
      source: 'Confluence · ETC 製程課 / SPC 管理',
      sourceType: 'confluence',
      owner: '鄭志明',
      importedBy: '鄭志明',
      importedAt: '2026-04-11',
      updatedAt: '2026-04-13',
      status: 'published',
      tags: ['SPC', '失控', '異常處置'],
      usage: 57,
      usedBy: [
        { id: 'sm-pr-006', title: 'CP 值下滑趨勢研判', tier: 'guided' },
      ],
      chunks: [
        { id: 'c1', label: '失控定義', content: 'Nelson Rule 任一觸發即為失控：Rule 1（超出 3σ）、Rule 2（9 點同側）、Rule 6（4 點超 1σ 交替）等。', tokens: 62 },
        { id: 'c2', label: '處置步驟', content: '1. 立即暫停相關站點生產。2. 通知 Section Admin（15 分鐘內）。3. 啟動根因分析（魚骨圖 or 5-Why）。4. 採取矯正行動並記錄。5. 恢復生產前需 Admin 確認。', tokens: 95 },
      ],
    },
    {
      id: 'kd-pr-003',
      title: '製程變更管制程序 (DCR) v3.1',
      summary: '製程參數變更的申請、審核、驗證與批准流程，含跨課影響評估要求。',
      source: 'Confluence · ETC 製程課 / 管理文件',
      sourceType: 'confluence',
      owner: '李佳穎',
      importedBy: '李佳穎',
      importedAt: '2026-03-15',
      updatedAt: '2026-04-01',
      status: 'published',
      tags: ['DCR', '變更管制', '標準'],
      usage: 73,
      usedBy: [
        { id: 'sm-pr-006', title: 'CP 值下滑趨勢研判', tier: 'guided' },
      ],
      chunks: [
        { id: 'c1', label: '適用情境', content: '適用於所有製程參數變更申請，包含 Recipe 調整、設備參數修改、原物料規格變更等，變更生效前須完成本程序。', tokens: 56 },
        { id: 'c2', label: 'DCR 申請步驟', content: '1. 填寫 DCR 申請表（變更原因、影響評估、回滾計畫）。2. 提交 Section Admin 初審（2 工作天內）。3. 進行變更影響驗證（試跑 n≥3 批次）。4. 提交驗證報告至課長審核。5. 課長核准後正式生效並更新 Recipe 版本。6. 通報相關課別（設備課、製造課）知悉。', tokens: 132 },
        { id: 'c3', label: '注意事項', content: '未經核准不得擅自變更製程參數，違者依廠規處理。跨課別影響之變更需額外提交跨課評估報告。', tokens: 48 },
      ],
    },
    {
      id: 'kd-pr-004',
      title: '製程異常跨站通報指引',
      summary: 'SPC 失控影響跨越相鄰站點時的 15 分鐘通報要求與雙管道規定。',
      source: 'Confluence · ETC 製程課 / 異常處理',
      sourceType: 'confluence',
      owner: '鄭志明',
      importedBy: '鄭志明',
      importedAt: '2026-04-03',
      updatedAt: '2026-04-10',
      status: 'reviewing',
      tags: ['跨站', '通報', 'SPC'],
      usage: 8,
      usedBy: [],
      reviewers: [
        { name: '李佳穎', avatar: '李', role: 'Section Admin', approved: true,  time: '04/10 09:20' },
        { name: '黃怡君', avatar: '黃', role: 'Engineer',      approved: false, time: null },
      ],
      chunks: [
        { id: 'c1', label: '適用情境', content: 'SPC 失控事件影響範圍跨越相鄰製程站點，需在 15 分鐘內完成跨站通報，避免異常品繼續流動。', tokens: 50 },
        { id: 'c2', label: '通報步驟', content: '1. 確認 SPC 失控規則（Nelson Rule 種類與觸發批號）。2. 評估影響站點範圍（上下游各一站）。3. 通知相鄰站點 Section Admin（15 分鐘內）。4. 在 MES 中標記受影響批號（Hold 狀態）。5. 填寫跨站通報表並提交至製程課知識庫。6. 追蹤相鄰站點的確認回覆（30 分鐘內需完成）。', tokens: 128 },
        { id: 'c3', label: '注意事項', content: '跨站通報必須同時以書面（系統）與口頭（電話）雙管道進行。若相鄰課別 30 分鐘內無回覆，需升報課長處理。', tokens: 52 },
      ],
    },
  ],

  /* ════════ 製造課 ════════ */
  mfg: [
    {
      id: 'kd-mf-001',
      title: '跨班緊急協調指引 v2',
      summary: '跨越班別邊界的緊急事件啟動條件與協調步驟。',
      source: 'Confluence · 製造課 / 班別管理',
      sourceType: 'confluence',
      owner: '陳建宏',
      importedBy: '陳建宏',
      importedAt: '2026-04-14',
      updatedAt: '2026-04-14',
      status: 'draft',
      tags: ['跨班', '緊急', '協調'],
      usage: 0,
      usedBy: [],
      chunks: [
        { id: 'c1', label: '適用情境', content: '適用於跨越班別邊界的緊急事件（設備大故障、重大品質異常、人員緊急狀況），需接班班組立即介入協作。', tokens: 62 },
        { id: 'c2', label: '啟動條件', content: '任一下列條件成立即啟動：(1) 停機時間預計超過 2 小時跨班 (2) WIP 損失 >3 批 (3) 客戶急單面臨 delay (4) 人員需要跨班支援。', tokens: 88 },
        { id: 'c3', label: '協調步驟', content: '1. 值班組長通知下一班接班人員（提前 2 小時）。2. 製造課主管召集跨班協調會（15 分鐘內）。3. 確認資源調配（設備、人員、材料）。4. 更新 MES 排程並通知相關課別。5. 記錄協調決議於交班日誌。', tokens: 118 },
      ],
    },
    {
      id: 'kd-mf-002',
      title: '產能落後緊急應變程序 v1.9',
      summary: '當日產出落後目標 5% 以上時的根因確認、補救方案與回報時限。',
      source: 'Confluence · 製造課 / 產能管理',
      sourceType: 'confluence',
      owner: '林組長',
      importedBy: '林組長',
      importedAt: '2026-04-10',
      updatedAt: '2026-04-12',
      status: 'needs_update',
      tags: ['產能', '緊急應變', '落後'],
      usage: 19,
      usedBy: [],
      feedback: '吳部長 回饋：外包方案的審批流程尚未納入，需補充。',
      chunks: [
        { id: 'c1', label: '觸發條件', content: '當日累積產出落後目標 5% 以上，且剩餘班別時數不足自然追回時啟動。', tokens: 48 },
        { id: 'c2', label: '應變步驟', content: '1. 確認落後根因（設備/人員/材料/排程）。2. 評估可補救方案（加班/外包/優先序調整）。3. 30 分鐘內向部長彙報並確認方案。4. 執行調整並每小時追蹤進度。', tokens: 95 },
      ],
    },
    {
      id: 'kd-mf-003',
      title: '停機跨班通報及記錄指引',
      summary: '停機超過 1 小時的通報時限、MES 登錄要求與交班雙重交接規定。',
      source: 'Confluence · 製造課 / 設備管理',
      sourceType: 'confluence',
      owner: '林組長',
      importedBy: '林組長',
      importedAt: '2026-04-02',
      updatedAt: '2026-04-09',
      status: 'published',
      tags: ['停機', '通報', '交班'],
      usage: 34,
      usedBy: [
        { id: 'sm-mfg-004', title: '停機跨班通報與記錄', tier: 'sop' },
      ],
      chunks: [
        { id: 'c1', label: '適用情境', content: '設備停機時間預計或已超過 1 小時，需啟動跨班通報機制，確保接班人員掌握停機狀態與影響評估。', tokens: 50 },
        { id: 'c2', label: '通報步驟', content: '1. 確認停機設備與預計停機時長，評估對當班產能的影響。2. 立即通報 Section Lead（5 分鐘內）。3. 在 MES 系統登錄停機原因代碼與開始時間。4. 通知設備課工程師到場確認。5. 停機超過 2 小時需升報組長，由組長決定是否啟動緊急應變。6. 交班時需口頭＋書面（MES）雙重交接停機狀態。', tokens: 135 },
        { id: 'c3', label: '注意事項', content: '停機期間禁止自行排程繞過該設備，需由 Section Lead 統一調度。交班記錄需包含停機期間所有已排程但未執行的批號清單。', tokens: 55 },
      ],
    },
    {
      id: 'kd-mf-004',
      title: '生產日報彙整指引 v2.3',
      summary: '三線當日產出、停機、異常數據的收集項目與日報格式規範。',
      source: 'Confluence · 製造課 / 日常管理',
      sourceType: 'confluence',
      owner: '陳建宏',
      importedBy: '陳建宏',
      importedAt: '2026-03-01',
      updatedAt: '2026-03-15',
      status: 'published',
      tags: ['日報', '生產管理', '標準'],
      usage: 96,
      usedBy: [
        { id: 'sm-mfg-005', title: '生產日報彙整', tier: 'sop' },
      ],
      chunks: [
        { id: 'c1', label: '適用情境', content: '每日 20:00 前由夜班組長執行日報彙整，收集三線當日產出、停機、異常數據並產出標準日報格式。', tokens: 48 },
        { id: 'c2', label: '彙整步驟', content: '1. 從 MES 系統匯出當日各線產出數據（批號、數量、良率）。2. 確認停機記錄完整性（停機原因代碼、時長）。3. 標記未達標站點並填寫異常說明。4. 計算當日 OEE 與目標達成率。5. 完成日報表並附上 SPC 截圖（如有異常）。6. 上傳至系統並抄送課長、組長、設備課。', tokens: 130 },
        { id: 'c3', label: '注意事項', content: '日報須於 20:00 前完成上傳，超時需說明原因。良率低於管制下限 93% 需同步通報製程課，不可僅在日報中記錄。', tokens: 55 },
      ],
    },
  ],
};

function getKnowledgeDocs(personaKey) {
  return KNOWLEDGE_DOCS[personaKey] || [];
}

/* Skill／Codify 詳情頁的「引用知識」用：由 id 取回標題與狀態 */
function findKnowledgeDoc(personaKey, docId) {
  return getKnowledgeDocs(personaKey).filter(function(d) { return d.id === docId; })[0] || null;
}
