/* ════════════════════════════════════════
   CHAT SCENARIOS — AI 頁的五種情境體現

   2026-07-26 PO 指定。對話標題直接就是該情境的目標，
   讓 demo 時「這串在演什麼」不需要另外解釋。

   ① SOP 執行 · 人工介入 · 順利完成
   ② SOP 執行 · 人工介入 · API 變更導致 codify 失效
   ③ 輔助問答 · 給明確建議 · 婉拒代為執行並給操作入口
   ④ 單純問答（有知識，無 Skill／SOP）
   ⑤ 單純問答（無知識）→ 收斂成一張追蹤任務

   ── 腳本播放模型 ──
   turns[] 為線性腳本。使用者的發言以底部「建議接話」按鈕呈現，
   點了才推進；AI 回合逐一自動接上（步驟會一步一步跑出來），
   直到遇到決策卡（sheet）或下一句又是使用者發言才停下來等人。

   ── 2026-07-26 第二輪收斂（PO 指定）──
   互動模態只留兩種：**對話式（建議接話）** 與 **決策卡（sheet）**。
   決策卡只給「會異動系統且流程卡住」的時刻；其餘一律用對話推進。
   原本的 action 行動按鈕（不用／好）已全數改寫成 user turn。

   ── 2026-07-27 第五輪（PO 指定）──
   右側面板從「任務→步驟」兩層改成**計畫一層**：步驟明細全部回到對話流，
   面板只回答「這次要做幾件事、做到第幾件」。因此新增 `plan` —
   **Orchestrator 在開跑之前就宣告的計畫**，不是邊跑邊長出來的。
   面板只留最新一份計畫；產出仍累積整段對話。

   turn 形狀：
     { role: 'user', text }
     { role: 'ai',
       mode:  'approved' | 'guided' | 'general',   // 三態徽章
       skill: { id, title, tier },                  // 命中的 Skill／SOP
       plan:  { title, items: [{ key, skillId, title, tier }] },  // 宣告計畫（開跑前）
       knowledge: [{ id, title }],                  // 引用的知識文件
       text,                                        // 主要回應（無氣泡，全寬）
       run:      { title, steps: [...] },           // SOP 執行進度 → 對話流只顯示步驟名
       evidence: { title, steps: [...] },           // 輔助判斷查過的數據 → 只進右側面板
       blocked:  { label, tool, reason },           // 被 Tool Gateway 擋下的寫入請求
       result:   { variant, title, lines: [] },     // 結果卡
       links:    [{ label, url }],                  // 操作入口（只渲染 label 成按鈕）
       sheet:    { ... },                           // 決策卡
     }

   run.steps[].status：ok（完成）/ pause（停下等人）/ fail（失敗）/ skip（略過）
   步驟的 tool / io / detail / reason **不在對話流顯示**，只餵右側執行面板。
   ════════════════════════════════════════ */

const CHAT_SCENARIOS = {

  /* ══════════════ ETC 設備課 ══════════════ */
  equipment: [

    /* ── 情境 1：SOP 執行 · 人工介入 · 順利完成 ── */
    {
      id: 'sc-eq-1',
      title: '一句話要跑兩份 SOP（中途需人工確認）',
      goal: 'Orchestrator 開跑前宣告 2 項計畫 → 第 1 項寫入步驟停下 → 確認開單 → 自動接第 2 項',
      time: '今天 07:52',
      turns: [
        { role: 'user', text: '幫我跑一次今天的 SPC 異常日報與開單，跑完把當班交接報告也一起整理好。' },
        {
          role: 'ai',
          mode: 'approved',
          skill: { id: 'sm-eq-008', title: 'SPC 異常日報與開單', tier: 'sop' },
          /* 計畫在第一步開跑之前就宣告 —— 面板的價值來自「不用做帶不確定性的等待」，
             邊跑邊冒出新項目就沒有這個價值了。文字不重複列計畫（右側已經有）。 */
          plan: {
            title: '跑 SPC 異常日報與開單，並整理當班交接報告',
            items: [
              { key: 'p1', skillId: 'sm-eq-008', title: 'SPC 異常日報與開單', tier: 'sop' },
              { key: 'p2', skillId: 'sm-eq-007', title: '整理當班交接報告',   tier: 'sop' },
            ],
          },
          text: '這件事要跑兩份已核准的 SOP，計畫列在右側面板了。已比對適用範圍（CMP／ETCH、ETC-2F 與 3F），先執行第 1 份。',
          run: {
            title: 'SOP 執行中',
            steps: [
              { num: 1, label: '查詢今日 SPC 資料', tool: 'spc.query_daily', io: 'read', status: 'ok', detail: '取得 07:00–07:50 量測資料 12 筆' },
              { num: 2, label: '篩選 OOC 異常項目', io: 'compute', status: 'ok', detail: '超出管制線 2 筆 + 連續 3 點同側 1 筆 = 3 筆（本課自訂條件）' },
              { num: 3, label: '開立異常工單', tool: 'case_center.create_case', io: 'write', status: 'pause', detail: '這一步會異動系統，停下來等你確認' },
            ],
          },
        },
        {
          role: 'ai',
          mode: 'approved',
          skill: { id: 'sm-eq-008', title: 'SPC 異常日報與開單', tier: 'sop' },
          text: '工單內容已依 3 筆異常擬好，需要你確認要不要開單。',
          sheet: {
            title: '需要你決定下一步',
            desc: '「開立異常工單」會異動 Case Center。不論這份 SOP 是手動執行還是排程執行，跑到這一步都會停下來等人。',
            context: [
              { label: '異常筆數', value: '3 筆（E-308 ×3）' },
              { label: '擬開工單', value: '1 張 · P2 · 指派值班 EE' },
              { label: '工單摘要', value: 'E-308 Chamber A 氣體流量 Standard Deviation 超標，建議確認流量計校正狀態' },
            ],
            options: [
              {
                key: 'create',
                label: '確認開立工單',
                desc: '依上述內容開 1 張工單並通知值班 EE',
                primary: true,
                outcome: {
                  role: 'ai',
                  mode: 'approved',
                  skill: { id: 'sm-eq-008', title: 'SPC 異常日報與開單', tier: 'sop' },
                  text: '已完成。工單與通知都送出了，本次執行的完整紀錄可以匯出帶進交班。',
                  run: {
                    title: 'SOP 執行完成',
                    steps: [
                      { num: 3, label: '開立異常工單', tool: 'case_center.create_case', io: 'write', status: 'ok', detail: '已開立 #CS-20260726-014' },
                      { num: 4, label: '發送通知給值班 EE', tool: 'notify.send_to_duty', io: 'write', status: 'ok', detail: '已通知 張文凱（當班 EE）' },
                    ],
                  },
                  result: {
                    variant: 'success',
                    title: '工單 #CS-20260726-014 已開立',
                    lines: [
                      '對象：E-308 · Chamber A 氣體流量',
                      '優先序：P2 · 指派：張文凱',
                      '來源：SPC 異常日報與開單（已核准 SOP）',
                    ],
                  },
                  links: [
                    { label: '開啟 Case 單', url: '/app/case-center/case/CS-20260726-014' },
                  ],
                },
              },
              {
                key: 'skip',
                label: '這次不開單',
                desc: '僅保留異常紀錄，不開工單也不通知',
                outcome: {
                  role: 'ai',
                  mode: 'approved',
                  skill: { id: 'sm-eq-008', title: 'SPC 異常日報與開單', tier: 'sop' },
                  text: '好，這次不開單。3 筆異常已記錄在今日 SPC 日報中，步驟 3、4 標記為「人工略過」。\n\n略過原因會回報給這份 SOP 的 owner（陳育民）。如果同一個步驟一直被略過，通常代表流程和實際狀況對不上，值得回頭改。',
                  run: {
                    title: 'SOP 執行結束（部分略過）',
                    steps: [
                      { num: 3, label: '開立異常工單', tool: 'case_center.create_case', io: 'write', status: 'skip', detail: '人工略過' },
                      { num: 4, label: '發送通知給值班 EE', tool: 'notify.send_to_duty', io: 'write', status: 'skip', detail: '人工略過' },
                    ],
                  },
                },
              },
            ],
          },
        },

        /* ── 計畫的第 2 項：不需要使用者再開口，決策卡結束後自動接上 ──
           sm-eq-007 是純唯讀、不會停下來的 SOP，正好對比出
           「第 1 項停過一次要人確認、第 2 項一路跑完」。 */
        {
          role: 'ai',
          mode: 'approved',
          skill: { id: 'sm-eq-007', title: '整理當班交接報告', tier: 'sop' },
          text: '接著跑計畫的第 2 項。這份全程只讀資料、不動任何系統，中途不會停下來問你。',
          run: {
            title: 'SOP 執行中',
            steps: [
              { num: 1, label: '取當班機台稼動資料', tool: 'eqp.get_uptime', io: 'read', status: 'ok', detail: '12 台機台 · 08:00–15:30' },
              { num: 2, label: '取同時段警報並分級', tool: 'fdc.list_alarms', io: 'read', status: 'ok', detail: '警報 5 件（Level-2 ×1）' },
              { num: 3, label: '計算稼動率與異常密度', io: 'compute', status: 'ok', detail: '稼動率 94.2%（已排除 PM 時數）、異常密度 2.7 件／8h' },
              { num: 4, label: '取未結案 Case 與待交接事項', tool: 'case_center.list_open', io: 'read', status: 'ok', detail: '未結案 7 件，其中 1 件逾期' },
              { num: 5, label: '套用交接報告格式', io: 'compute', status: 'ok', detail: '已套用課內格式' },
            ],
          },
          result: {
            variant: 'success',
            title: 'ETC 設備課 · 日班交接報告已產出',
            lines: [
              '稼動率 94.2%（目標 95%，未達標）',
              '本班異常 5 件 · 未結案 Case 7 件',
              '今早開的 #CS-20260726-014 已列入待交接事項',
            ],
          },
          links: [
            { label: '開啟交接報告', url: '/app/handover/report/20260726-day' },
          ],
        },
      ],
    },

    /* ── 情境 2：SOP 執行 · 人工介入 · API 變更導致 codify 失效 ── */
    {
      id: 'sc-eq-2',
      title: '執行 FDC 快速反應 SOP（API 變更導致失效）',
      goal: '呼叫 SOP → 人工確認 → 開單失敗 → AI 指出根因與修復方向',
      time: '今天 10:38',
      turns: [
        { role: 'user', text: 'E-308 剛跳 FDC 警報，幫我跑 FDC 異常快速反應流程。' },
        {
          role: 'ai',
          mode: 'approved',
          skill: { id: 'sm-eq-004', title: 'FDC 異常快速反應流程', tier: 'sop' },
          /* 單一 SOP 的計畫也照樣宣告 —— 面板永遠是同一個位置回答同一個問題 */
          plan: {
            title: '跑 FDC 異常快速反應流程',
            items: [
              { key: 'p1', skillId: 'sm-eq-004', title: 'FDC 異常快速反應流程', tier: 'sop' },
            ],
          },
          text: 'E-308 屬 CMP、位於 ETC-3F，符合這份 SOP 的適用範圍，開始執行。',
          run: {
            title: 'SOP 執行中',
            steps: [
              { num: 1, label: '取警報明細與觸發參數', tool: 'fdc.get_alarm_detail', io: 'read', status: 'ok', detail: 'Chamber A 氣體流量，連續 3 點超 2σ，10:36 觸發' },
              { num: 2, label: '判定警報等級', io: 'compute', status: 'ok', detail: '判定為 Level-2（本課自訂條件）→ 不走隔離分支，直接進通報' },
              { num: 5, label: '開立異常單並通報', tool: 'case_center.create_case', io: 'write', status: 'pause', detail: '這一步會異動系統，停下來等你確認' },
            ],
          },
        },
        {
          role: 'ai',
          mode: 'approved',
          skill: { id: 'sm-eq-004', title: 'FDC 異常快速反應流程', tier: 'sop' },
          text: 'Level-2 需要在 10 分鐘內完成通報，目前已過 2 分鐘。',
          sheet: {
            title: '需要你決定下一步',
            desc: '「開立異常單並通報」會異動 Case Center 與通知中心。',
            context: [
              { label: '警報等級', value: 'Level-2（連續 3 點超 2σ）' },
              { label: '通報時限', value: '10 分鐘內 · 已過 2 分鐘' },
              { label: '擬開工單', value: '1 張 · P1 · 通報 林課長（Section Admin）' },
            ],
            options: [
              {
                key: 'create',
                label: '確認開單並通報',
                desc: '開立 P1 異常單並通知 Section Admin',
                primary: true,
                outcome: {
                  role: 'ai',
                  mode: 'approved',
                  skill: { id: 'sm-eq-004', title: 'FDC 異常快速反應流程', tier: 'sop' },
                  text: '開單失敗了，這不是你的操作問題。',
                  run: {
                    title: 'SOP 執行中斷',
                    steps: [
                      { num: 5, label: '開立異常單並通報', tool: 'case_center.create_case', io: 'write', status: 'fail', detail: 'HTTP 400 · unknown field "severity"', reason: 'Case Center API 已於 07/24 升級至 v3，欄位 severity 改名為 priorityLevel，且新增必填欄位 impactScope' },
                    ],
                  },
                  result: {
                    variant: 'error',
                    title: '工單未開立 —— 這份 SOP 的第 5 步已經失效',
                    lines: [
                      '標準元件「異常單開立 v2.1」是照 Case Center API v2 codify 的',
                      'Case Center 於 2026-07-24 升級到 v3，欄位定義改了',
                      '這一步從那天起就會失敗，不是這次才壞的',
                    ],
                  },
                },
              },
              {
                key: 'skip',
                label: '先不開單，我手動處理',
                desc: '略過寫入步驟，只保留執行紀錄',
                outcome: {
                  role: 'ai',
                  mode: 'approved',
                  skill: { id: 'sm-eq-004', title: 'FDC 異常快速反應流程', tier: 'sop' },
                  text: '好，步驟 5 標記為人工略過。提醒你 Level-2 的 10 分鐘通報時限仍然要算，記得手動通知林課長。',
                  run: {
                    title: 'SOP 執行結束（部分略過）',
                    steps: [
                      { num: 5, label: '開立異常單並通報', tool: 'case_center.create_case', io: 'write', status: 'skip', detail: '人工略過' },
                    ],
                  },
                },
              },
            ],
          },
        },
        { role: 'user', text: '那我現在該怎麼辦？警報還在跑。' },
        {
          role: 'ai',
          mode: 'approved',
          skill: { id: 'sm-eq-004', title: 'FDC 異常快速反應流程', tier: 'sop' },
          text: '分兩件事處理，先顧眼前的警報，再修 SOP。\n\n**現在（10 分鐘時限內）**\n手動開單並通報。工單內容我已經照 SOP 該產生的內容擬好，你在 Case Center 貼上即可 —— 這樣不會因為 SOP 壞掉而超過通報時限。\n\n**接下來（今天內）**\n這份 SOP 的第 5 步用的是平台標準元件「異常單開立 v2.1」，需要平台端出 v3.0 對應新 API。你可以做兩件事：\n\n1. 回報這個失效給 SOP owner（張文凱）與平台，讓標準元件升版\n2. 在升版完成前，把這份 SOP 從「已生效」降回 Testing，避免其他人跑到同一個坑\n\n另外提醒：這份 SOP 沒有掛排程，所以只有人手動跑才會發現。**已掛排程的 SOP 出現同樣問題會安靜地壞掉**，值得順手檢查一下課上其他有開單動作的排程。\n\n要不要我把「標準元件升版 ＋ 盤點其他排程 SOP」列成一張追蹤任務？',
          links: [
            { label: '手動開單', url: '/app/case-center/create?prefill=fdc-e308-20260726' },
            { label: '回報失效', url: '/app/skill/sm-eq-004/report-issue' },
          ],
        },
        { role: 'user', text: '好，幫我建一張追蹤任務。' },
        {
          role: 'ai',
          mode: 'general',
          text: '已建立任務 **#T-2026-0726-03「Case Center API v3 相容性檢修」**，指派給張文凱、副本給林課長，到期日設在後天。\n\n任務內容含三項：標準元件「異常單開立」升版至 v3.0、盤點課上其他引用該元件的 SOP、升版後重跑一次 dry run 比對差異。',
          result: {
            variant: 'success',
            title: '任務 #T-2026-0726-03 已建立',
            lines: ['指派：張文凱 · 副本：林課長', '到期：2026-07-28', '來源：本次 SOP 執行失敗紀錄'],
          },
          links: [
            { label: '開啟任務', url: '/app/tasks/T-2026-0726-03' },
          ],
        },
      ],
    },

    /* ── 情境 3：輔助問答 · 給建議但婉拒代為執行 ── */
    {
      id: 'sc-eq-3',
      title: 'E-101 跳 ERR-4421 該怎麼處理',
      goal: '輔助 Skill 給明確建議 → 要求代為執行 → 婉拒並給操作入口',
      time: '今天 03:12',
      turns: [
        { role: 'user', text: 'E-101 跳 ERR-4421，怎麼辦？' },
        {
          role: 'ai',
          mode: 'guided',
          skill: { id: 'sm-eq-006', title: 'ERR-4421 冷卻異常研判', tier: 'guided' },
          knowledge: [{ id: 'kd-eq-003', title: 'ERR-4421 冷卻系統異常排除 v2' }],
          text: '這個狀況本課沒有標準流程，我依《ERR-4421 冷卻異常研判》幫你查了現場數據。\n\n**研判：冷卻水路阻塞**\n\n依據有三：過濾器壓差 0.07 MPa，超過 0.05 的判斷門檻；水壓是緩降不是跳動，形態符合阻塞而非感測器老化；同機台近 7 天沒有其他同碼警報，不像感測器問題。\n\n**建議處置**\n1. 先執行冷卻水路疏通程序（清洗過濾器）\n2. 疏通後觀察 30 分鐘，水壓應回到 0.18 MPa 以上\n3. 若 30 分鐘內未回升，再開緊急工單請廠務支援\n\n這是依指引研判的建議，不是已核准的流程，最後判斷仍在你身上。',
          /* 證據已寫進上面的文字（「依據有三…」），對話流不再重複列一次步驟表；
             這份明細只餵右側面板的「這次用到的」。 */
          evidence: {
            title: '查過的現場數據',
            steps: [
              { label: '比對適用範圍', io: 'match', status: 'ok', detail: 'E-101 屬 CMP、位於 ETC-3F、警報碼 ERR-4421 —— 符合' },
              { label: '查警報明細', tool: 'fdc.get_alarm_detail', io: 'read', status: 'ok', detail: '冷卻水壓 0.11 MPa（門檻 0.15）、過濾器壓差 0.07 MPa' },
              { label: '查感測器趨勢', tool: 'eqp.get_sensor_trend', io: 'read', status: 'ok', detail: '近 2 小時水壓由 0.19 緩降至 0.11，非跳動' },
            ],
          },
        },
        { role: 'user', text: '了解。那你順便幫我把 E-101 的 SPC 管制上限放寬一點，不然等一下又會跳。' },
        {
          role: 'ai',
          mode: 'guided',
          skill: { id: 'sm-eq-006', title: 'ERR-4421 冷卻異常研判', tier: 'guided' },
          text: '這個我不能幫你做，原因有兩個。\n\n**第一，權限上做不到。**\n我現在綁的是「ERR-4421 冷卻異常研判」，它是輔助判斷型，只拿得到唯讀工具。我剛才確實試著呼叫了變更管制界限的工具，被擋下來了 —— 下面那一行就是。\n\n**第二，就算做得到也不該這樣做。**\n管制界限是用來反映製程實際能力的，水壓異常時放寬上限等於把警報關掉，異常還在。而且管制界限變更屬於製程參數異動，要走 DCR 程序，由製程課核准。\n\n**你要自己做的話，路徑是這樣：**\n\n1. 到 SPC Console 的管制界限設定頁（下面有直接連結，已帶好 E-101 與 CMP-Standard 配方）\n2. 填寫變更原因與影響評估，送出 DCR 申請\n3. 製程課 Section Admin 初審 → 課長核准 → 生效\n\n照目前的狀況，我建議先做冷卻水路疏通，**不要動管制界限** —— 界限沒問題，是水壓有問題。',
          blocked: {
            label: '變更 SPC 管制界限',
            tool: 'spc.update_control_limit',
            reason: '本 Skill 類型為「輔助判斷」，允許清單內只有唯讀工具',
          },
          links: [
            { label: '開啟 SPC Console', url: '/app/spc-console/limits?station=E-101&recipe=CMP-Standard' },
            { label: '開 DCR 申請', url: '/app/dcr/create?type=spc-limit&station=E-101' },
          ],
        },
      ],
    },

    /* ── 情境 4：單純問答（有知識、無 Skill／SOP） ── */
    {
      id: 'sc-eq-4',
      title: 'E-405 爐管跳 ERR-7702 該怎麼處理',
      goal: '無對應 Skill／SOP，依課上知識回答，只建議不執行',
      time: '昨天 21:05',
      turns: [
        { role: 'user', text: 'E-405 爐管跳 ERR-7702，這個要怎麼處理？' },
        {
          role: 'ai',
          mode: 'general',
          knowledge: [
            { id: 'kd-eq-006', title: 'FDC 警報分級對照表' },
            { id: 'kd-eq-004', title: '設備日常巡檢標準程序 v2.5' },
          ],
          text: '先說清楚這次的狀況：**本課沒有 ERR-7702 的標準流程，也沒有對應的研判指引。** 我只能依課上現有的知識文件給你一般性的說明，不是可以照做的核准流程。\n\n我查到兩份相關的文件：\n\n**依《FDC 警報分級對照表》**\nERR-77xx 屬爐管溫控類警報。若是連續 3 點超 2σ 觸發，等級為 Level-2，要求 10 分鐘內完成初步確認與通報 Section Admin；若是單點超 3σ 或連續 5 點同側，等級為 Level-3，須立即停機隔離。\n\n**依《設備日常巡檢標準程序 v2.5》**\n爐管溫度一致性的判定值是 ±2°C 以內，超出即應通報，不可自行解除警報。\n\n**我能給的建議到這裡為止**\n先確認這次是哪一種觸發形態（決定 Level-2 還 Level-3），再依對應時限通報。至於 ERR-7702 這個代碼本身的根因與排除步驟，課上的知識庫沒有收錄。',
        },
        { role: 'user', text: '那 E-101 的 ERR-4421 排除方式可以套用嗎？都是溫控相關的吧。' },
        {
          role: 'ai',
          mode: 'general',
          text: '不建議套用，而且這兩件事其實不同。\n\nERR-4421 是 **CMP 機台的冷卻水路壓力異常**，判斷依據是水壓形態與過濾器壓差；ERR-7702 是 **爐管的溫控異常**，兩者的物理機制、量測對象、處置手段都不一樣。名稱上都沾到「溫度」，但把 CMP 的判斷套到爐管上，在廠內是實體安全風險。\n\n這也是為什麼《ERR-4421 冷卻異常研判》那份 Skill 的適用範圍只勾了 CMP 三台機。你剛才如果直接問它 E-405，它會回「不在適用範圍」，不會硬套 —— 這是刻意設計的。\n\n**比較實際的做法**：問問課上處理過爐管的人，或看看設備原廠的 ERR-77xx 手冊。這個代碼在本課的知識庫是空的。',
        },
      ],
    },

    /* ── 情境 5：單純問答（無知識）→ 收斂成一張追蹤任務 ── */
    {
      id: 'sc-eq-5',
      title: 'E-502 CVD 跳 ERR-9105 該怎麼處理',
      goal: '無 Skill、無知識 → 委婉說明現況 → 收斂成追蹤任務',
      time: '昨天 02:40',
      turns: [
        { role: 'user', text: 'E-502 跳 ERR-9105，怎麼處理？' },
        {
          role: 'ai',
          mode: 'general',
          text: '我查了課上所有的 Skill、SOP 與知識文件，**ERR-9105 完全沒有紀錄**。\n\n我也不打算靠猜的給你一個聽起來合理的答案 —— 半夜三點照著一個猜出來的步驟去動 CVD 機台，風險不對等。\n\n**現在可以做的**\n\n1. 問課上處理過 CVD 的資深同事。依課內的活動紀錄，陳育民與張文凱過去半年碰過 E-502 的異常最多。\n2. 若無人可問且警報持續，依《FDC 警報分級對照表》的通報原則升報 Section Admin，由課長決定是否停機。\n3. 查設備原廠手冊的 ERR-91xx 章節。\n\n**另外想跟你確認一件事**\n\n這次問不到不只是這一次的問題 —— 下一個值班的人半夜遇到一樣的狀況，還是會問不到。要不要我把這件事列成一張任務，追蹤到有人把 ERR-9105 的處理方式補進知識庫為止？',
        },
        { role: 'user', text: '好，幫我建一張追蹤任務。' },
        {
          role: 'ai',
          mode: 'general',
          text: '已建立。任務內容我照這次的對話填好了，包含你問的原始問題與當下的機台狀態，補知識的人不用再回頭問你一次。\n\n知識補進來之後，如果 ERR-9105 的處理每次都長得一樣，可以直接從那份知識建一份 SOP；如果每次要看現場數據判斷，就建成輔助判斷。到時候系統會提示。',
          result: {
            variant: 'success',
            title: '任務 #T-2026-0725-11 已建立',
            lines: [
              '標題：補齊 E-502 ERR-9105 處理知識',
              '指派：陳育民 · 副本：林課長',
              '到期：2026-08-01',
              '附件：本次對話紀錄、E-502 當下警報明細',
            ],
          },
          links: [
            { label: '開啟任務', url: '/app/tasks/T-2026-0725-11' },
          ],
        },
      ],
    },
  ],

  /* ══════════════ ETC 製程課 ══════════════ */
  process: [
    {
      id: 'sc-pr-1',
      title: '執行跨站通報 SOP（中途需人工確認）',
      goal: '呼叫 SOP → 執行到 Hold 批號停下 → 確認 → 完成通報',
      time: '今天 14:05',
      turns: [
        { role: 'user', text: 'CMP-03 剛跳 SPC 失控，幫我跑跨站通報流程。' },
        {
          role: 'ai',
          mode: 'approved',
          skill: { id: 'sm-pr-004', title: '製程異常跨站通報', tier: 'sop' },
          plan: {
            title: '跑製程異常跨站通報',
            items: [
              { key: 'p1', skillId: 'sm-pr-004', title: '製程異常跨站通報', tier: 'sop' },
            ],
          },
          text: 'CMP-03 屬 CMP、位於 ETC-3F、觸發碼 SPC-OOC，符合適用範圍，開始執行。',
          run: {
            title: 'SOP 執行中',
            steps: [
              { num: 1, label: '取失控事件與規則', tool: 'spc.get_ooc_detail', io: 'read', status: 'ok', detail: 'Nelson Rule 2（連續 9 點同側），14:02 觸發' },
              { num: 2, label: '評估上下游影響站點', io: 'compute', status: 'ok', detail: '上游 ETCH-02、下游 CLEAN-01（本課自訂：各推一站）' },
              { num: 3, label: '取受影響批號清單', tool: 'mes.list_wip', io: 'read', status: 'ok', detail: '5 批在製品落在影響範圍內' },
              { num: 4, label: '標記批號 Hold', tool: 'mes.hold_lots', io: 'write', status: 'pause', detail: '這一步會異動 MES，停下來等你確認' },
            ],
          },
        },
        {
          role: 'ai',
          mode: 'approved',
          skill: { id: 'sm-pr-004', title: '製程異常跨站通報', tier: 'sop' },
          text: 'Hold 會直接影響產線，批號清單列在下面請先核對。',
          sheet: {
            title: '需要你決定下一步',
            desc: '「標記批號 Hold」會異動 MES 並直接影響產線排程。跨站通報的時限是 15 分鐘，目前已過 3 分鐘。',
            context: [
              { label: '失控站點', value: 'CMP-03 · Nelson Rule 2' },
              { label: '影響站點', value: '上游 ETCH-02、下游 CLEAN-01' },
              { label: '待 Hold 批號', value: 'L2311、L2312、L2315、L2318、L2320（5 批）' },
            ],
            options: [
              {
                key: 'hold',
                label: '確認 Hold 這 5 批並通報',
                desc: '標記 Hold 後通知相鄰站點 Section Admin',
                primary: true,
                outcome: {
                  role: 'ai',
                  mode: 'approved',
                  skill: { id: 'sm-pr-004', title: '製程異常跨站通報', tier: 'sop' },
                  text: '已完成，用時 4 分 12 秒，在 15 分鐘時限內。',
                  run: {
                    title: 'SOP 執行完成',
                    steps: [
                      { num: 4, label: '標記批號 Hold', tool: 'mes.hold_lots', io: 'write', status: 'ok', detail: '5 批已標記 Hold' },
                      { num: 5, label: '通知相鄰站點 Admin', tool: 'notify.send_to_section', io: 'write', status: 'ok', detail: '已通知 ETCH-02、CLEAN-01 的 Section Admin' },
                    ],
                  },
                  result: {
                    variant: 'success',
                    title: '跨站通報完成',
                    lines: ['Hold 批號：L2311、L2312、L2315、L2318、L2320', '通報對象：ETCH-02、CLEAN-01', '用時：4 分 12 秒（時限 15 分）'],
                  },
                },
              },
              {
                key: 'partial',
                label: '批號清單不對，我要調整',
                desc: '中止本次執行，改為人工處理',
                outcome: {
                  role: 'ai',
                  mode: 'approved',
                  skill: { id: 'sm-pr-004', title: '製程異常跨站通報', tier: 'sop' },
                  text: '已中止，沒有任何批號被 Hold。\n\n這次的「影響範圍」是用本課自訂的「上下游各推一站」算出來的。如果實際影響範圍常常跟這個規則對不上，值得回去改第 2 步的自訂邏輯 —— 我把這次的中止原因回報給 owner（鄭志明）了。\n\n15 分鐘時限還在跑，記得手動完成 Hold 與通報。',
                  run: {
                    title: 'SOP 執行中止',
                    steps: [
                      { num: 4, label: '標記批號 Hold', tool: 'mes.hold_lots', io: 'write', status: 'skip', detail: '人工中止' },
                    ],
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      id: 'sc-pr-2',
      title: 'R-512 CP 值一直掉該怎麼辦',
      goal: '輔助 Skill 給研判 → 要求代為改參數 → 婉拒並給 DCR 入口',
      time: '昨天 16:40',
      turns: [
        { role: 'user', text: 'R-512 的 CP 值從 1.82 一路掉到 1.41，這是怎麼回事？' },
        {
          role: 'ai',
          mode: 'guided',
          skill: { id: 'sm-pr-006', title: 'CP 值下滑趨勢研判', tier: 'guided' },
          knowledge: [{ id: 'kd-pr-002', title: 'SPC 失控快速處置指引 v2' }],
          text: '這個狀況本課沒有標準流程，我依《CP 值下滑趨勢研判》幫你看了三條時間軸。\n\n**研判：與 03/28 的配方版本異動高度相關**\n\n下滑的起點落在 03/28，正好是 R-512 從 v4.1 升到 v4.2、壓力上限由 4.0 調到 4.2 torr 的那一天。同期間原料批號沒有切換，可以排除材料變異。\n\n**建議**\n1. 先做 Process Window Study，驗證壓力確實是主因\n2. 若確認，走 DCR 把壓力上限回調至 4.0 torr\n3. 回調後觀察 2 週，確認 CP 值回升\n\n這是依指引研判的建議，責任仍在執行者。',
          evidence: {
            title: '查過的現場數據',
            steps: [
              { label: '比對適用範圍', io: 'match', status: 'ok', detail: 'R-512 屬 CMP、位於 ETC-3F、CPK 1.41 < 1.5 —— 符合' },
              { label: '查 SPC 趨勢', tool: 'spc.get_trend', io: 'read', status: 'ok', detail: '近 30 天連續 9 點同側（Nelson Rule 2）' },
              { label: '查配方版本紀錄', tool: 'recipe.get_version', io: 'read', status: 'ok', detail: 'v4.1 → v4.2（03/28 壓力上限 4.0 → 4.2 torr）' },
              { label: '查批號履歷', tool: 'mes.get_lot_history', io: 'read', status: 'ok', detail: '同期間無原料批號切換' },
            ],
          },
        },
        { role: 'user', text: '那你直接幫我把壓力上限調回 4.0 吧，反正是調回去而已。' },
        {
          role: 'ai',
          mode: 'guided',
          skill: { id: 'sm-pr-006', title: 'CP 值下滑趨勢研判', tier: 'guided' },
          text: '我不能幫你改。剛才確實試了，被擋下來了 —— 下面那一行就是。\n\n這份 Skill 是輔助判斷型，允許清單裡只有唯讀工具。而且「調回去」在管制上跟「調過去」是同一件事：兩者都是製程參數變更，都要走 DCR，都要影響評估與回滾計畫。\n\n**你要自己做的話**\n\n1. 開一張 DCR（下面連結已帶好 R-512 與壓力參數）\n2. 影響評估這欄可以直接用我剛才的研判內容，我把時間軸整理好了\n3. 送 Section Admin 初審 → 課長核准 → 生效\n\n**不過我還是建議先做 Process Window Study。** 現在的證據是時間吻合，不是因果確立。直接回調有機會做對，但如果真正原因是別的，你會白繞一圈，而且下次還會再發生。',
          blocked: {
            label: '調整配方參數',
            tool: 'recipe.update_param',
            reason: '本 Skill 類型為「輔助判斷」，允許清單內只有唯讀工具',
          },
          links: [
            { label: '開 DCR 申請', url: '/app/dcr/create?recipe=R-512&param=pressure_upper' },
            { label: '排 Process Window Study', url: '/app/recipe/R-512/pws/create' },
          ],
        },
      ],
    },
  ],

  /* ══════════════ 製造課 ══════════════ */
  mfg: [
    {
      id: 'sc-mf-1',
      title: '執行停機通報 SOP（中途需人工確認）',
      goal: '呼叫 SOP → 執行到登錄 MES 停下 → 確認 → 完成通報',
      time: '今天 14:22',
      turns: [
        { role: 'user', text: 'LINE-3 停機快兩小時了，幫我跑停機跨班通報。' },
        {
          role: 'ai',
          mode: 'approved',
          skill: { id: 'sm-mfg-004', title: '停機跨班通報與記錄', tier: 'sop' },
          plan: {
            title: '跑停機跨班通報與記錄',
            items: [
              { key: 'p1', skillId: 'sm-mfg-004', title: '停機跨班通報與記錄', tier: 'sop' },
            ],
          },
          text: 'LINE-3 停機 1.8 小時，超過 1 小時門檻，符合適用範圍，開始執行。',
          run: {
            title: 'SOP 執行中',
            steps: [
              { num: 1, label: '取停機事件與預計時長', tool: 'eqp.get_downtime', io: 'read', status: 'ok', detail: '13:00 起傳送帶異常，預計 1.8 h，仍在進行' },
              { num: 2, label: '取受影響批號清單', tool: 'mes.list_wip', io: 'read', status: 'ok', detail: '4 批受影響，含急單 W26-031' },
              { num: 3, label: '計算當班產能影響', io: 'compute', status: 'ok', detail: '影響 6.2%，剩餘時數可追回 3%' },
              { num: 4, label: '登錄停機原因代碼', tool: 'mes.log_downtime', io: 'write', status: 'pause', detail: '這一步會異動 MES，停下來等你確認' },
            ],
          },
        },
        {
          role: 'ai',
          mode: 'approved',
          skill: { id: 'sm-mfg-004', title: '停機跨班通報與記錄', tier: 'sop' },
          text: '停機原因代碼我依現象選了 MC-03（傳送帶機構異常），請確認是否正確。',
          sheet: {
            title: '需要你決定下一步',
            desc: '「登錄停機原因代碼」會寫進 MES，之後的停機統計與 OEE 都吃這筆資料，代碼選錯會一路錯下去。',
            context: [
              { label: '停機設備', value: 'LINE-3 · 13:00 起 · 1.8 小時' },
              { label: '建議代碼', value: 'MC-03 傳送帶機構異常' },
              { label: '受影響批號', value: 'W26-031（急單）、W26-033、W26-035、W26-038' },
              { label: '產能影響', value: '6.2%（剩餘時數可追回 3%）' },
            ],
            options: [
              {
                key: 'log',
                label: '代碼正確，確認登錄並通報',
                desc: '登錄 MC-03 並通知接班班組',
                primary: true,
                outcome: {
                  role: 'ai',
                  mode: 'approved',
                  skill: { id: 'sm-mfg-004', title: '停機跨班通報與記錄', tier: 'sop' },
                  text: '已完成。通報單也一併帶進今晚的交班記錄了。',
                  run: {
                    title: 'SOP 執行完成',
                    steps: [
                      { num: 4, label: '登錄停機原因代碼', tool: 'mes.log_downtime', io: 'write', status: 'ok', detail: 'MC-03 已登錄，事件編號 DT-20260726-07' },
                      { num: 5, label: '通報接班班組', tool: 'notify.send_to_duty', io: 'write', status: 'ok', detail: '已通知小夜班組長與設備課' },
                    ],
                  },
                  result: {
                    variant: 'success',
                    title: '停機通報完成 · DT-20260726-07',
                    lines: ['代碼：MC-03 傳送帶機構異常', '通報：小夜班組長、設備課', '已帶入今晚交班記錄'],
                  },
                },
              },
              {
                key: 'change',
                label: '代碼不對，我要改',
                desc: '中止本次執行，改由人工登錄',
                outcome: {
                  role: 'ai',
                  mode: 'approved',
                  skill: { id: 'sm-mfg-004', title: '停機跨班通報與記錄', tier: 'sop' },
                  text: '已中止，MES 沒有寫入任何資料。\n\n代碼判斷是第 1 步的標準元件依停機現象自動對照的。如果常常對不上，代表對照表需要更新 —— 我把這次的中止回報給 owner（林組長）了。\n\n記得手動登錄，停機超過 2 小時要升報組長。',
                  run: {
                    title: 'SOP 執行中止',
                    steps: [
                      { num: 4, label: '登錄停機原因代碼', tool: 'mes.log_downtime', io: 'write', status: 'skip', detail: '人工中止' },
                    ],
                  },
                },
              },
            ],
          },
        },
      ],
    },
    {
      id: 'sc-mf-2',
      title: 'W26-042 這批該不該插隊',
      goal: '無 Skill、無知識 → 委婉說明 → 收斂成追蹤任務',
      time: '昨天 22:15',
      turns: [
        { role: 'user', text: '客戶臨時要求 W26-042 提前出，這批該不該插隊插到 LINE-1 最前面？' },
        {
          role: 'ai',
          mode: 'general',
          text: '我查了課上的 Skill、SOP 與知識文件，**沒有找到「客戶臨時要求」這類插隊情境的決策依據**。\n\n課上有一份《排程優先序決策研判》，但它目前還在簽核中（尚未生效），而且它處理的是三線內部資源競爭，不涵蓋客戶端臨時變更 —— 那牽涉到業務承諾與違約條款，不是排程規則能決定的。\n\n這件事我不適合替你判斷。**建議直接問組長或部長**，因為要衡量的是客戶關係與其他訂單的交期風險，那些資訊不在系統裡。\n\n**另外**\n\n這種狀況應該不是第一次。要不要我列成一張任務，請課上有經驗的人把「客戶臨時變更的處理原則」寫成知識？下次有人半夜遇到，至少有東西可以參考。',
        },
        { role: 'user', text: '好，幫我建一張追蹤任務。' },
        {
          role: 'ai',
          mode: 'general',
          text: '已建立。我把這次的具體情境附在任務裡，寫知識的人可以直接拿它當例子。\n\n如果之後累積出穩定的判斷原則，可以升級成一份輔助判斷 Skill —— 這種每次狀況都不一樣、需要看現場數據研判的，正好是輔助判斷的場景。',
          result: {
            variant: 'success',
            title: '任務 #T-2026-0725-08 已建立',
            lines: [
              '標題：補齊客戶臨時變更的排程處理原則',
              '指派：林組長 · 副本：吳部長',
              '到期：2026-08-05',
              '附件：W26-042 本次情境與對話紀錄',
            ],
          },
          links: [
            { label: '開啟任務', url: '/app/tasks/T-2026-0725-08' },
          ],
        },
      ],
    },
  ],
};

function getChatScenarios(personaKey) {
  return CHAT_SCENARIOS[personaKey] || [];
}
