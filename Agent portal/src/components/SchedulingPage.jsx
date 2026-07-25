/* ════════════════════════════════════════
   SCHEDULING PAGE
   AntD 遷移 Phase 4（見 brain/concepts/antd-migration-plan.md）
   ════════════════════════════════════════ */

/* ── Run result config ── */
const SCH_RUN_CFG = {
  success:  { label: '完成',    color: '#16A34A', bg: 'rgba(34,197,94,0.1)',    icon: '✓' },
  pending:  { label: '待確認',  color: '#DC2626', bg: 'rgba(239,68,68,0.1)',    icon: '⏸' },
  error:    { label: '執行失敗', color: '#DC2626', bg: 'rgba(239,68,68,0.1)',   icon: '✕' },
  discuss:  { label: '延伸討論', color: '#7C3AED', bg: 'rgba(139,92,246,0.1)',  icon: '💬' },
  rejected: { label: '已拒絕',  color: '#6B7280', bg: 'rgba(107,114,128,0.1)', icon: '✕' },
};

const SCH_ITEM_STATUS_CFG = {
  ok:      { label: '正常',    color: '#16A34A', bg: 'rgba(34,197,94,0.08)'   },
  pending: { label: '待確認',  color: '#DC2626', bg: 'rgba(239,68,68,0.08)'  },
  error:   { label: '執行失敗', color: '#DC2626', bg: 'rgba(239,68,68,0.08)' },
  idle:    { label: '未觸發',  color: '#6B7280', bg: 'rgba(107,114,128,0.08)' },
};

/* ── Step icon（Timeline 自訂 dot；AntD 預設圓點無法帶狀態字符）── */
const STEP_ICON_CFG = {
  done:     { bg: 'rgba(34,197,94,0.15)',   color: '#16A34A', text: '✓' },
  waiting:  { bg: 'rgba(239,68,68,0.15)',   color: '#DC2626', text: '⏸' },
  error:    { bg: 'rgba(239,68,68,0.15)',   color: '#DC2626', text: '✕' },
  pending:  { bg: 'rgba(158,158,158,0.15)', color: '#6B7280', text: '○' },
  skip:     { bg: 'rgba(158,158,158,0.1)',  color: '#6B7280', text: '—' },
  rejected: { bg: 'rgba(239,68,68,0.15)',   color: '#DC2626', text: '✕' },
  discuss:  { bg: 'rgba(139,92,246,0.15)',  color: '#7C3AED', text: '💬' },
};

function SchStepIcon({ status, size}) {
  const sz = size || 20;
  const cfg = STEP_ICON_CFG[status] || STEP_ICON_CFG.pending;
  return (
    <div style={{
      width: sz, height: sz, borderRadius: 999,
      background: cfg.bg, color: cfg.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: sz <= 16 ? 9 : 11, fontWeight: 700, flexShrink: 0,
    }}>{cfg.text}</div>
  );
}

/* 成員頭像：emoji / 首字邏輯，依遷移計畫保留自製（AntD Avatar 不處理） */
function SchAvatar({ name, avatar, color, size}) {
  const sz = size || 16;
  return (
    <div style={{
      width: sz, height: sz, borderRadius: 999,
      background: color || '#2563EB', color: '#fff',
      fontSize: Math.round(sz * 0.55), fontWeight: 700,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>{avatar || (name && name[0]) || '?'}</div>
  );
}

/* ── 決策者一列（步驟內 / 執行紀錄摘要共用）── */
function SchActorLine({ actor, text }) {
  var { C, fz } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <SchAvatar name={actor.name} avatar={actor.avatar} color={actor.color} size={16} />
      <span style={{ fontSize: fz(11), color: C.textMuted }}>{text}</span>
    </div>
  );
}

/* ── 單一步驟內容（Timeline item 的 children；圓點由 Timeline 的 dot 提供）── */
function SchStepBody({ s, compact}) {
  var { C, fz } = useTheme();
  const isSkipped = s.status === 'skip' || s.status === 'pending';
  return (
    <div>
      <div style={{ fontSize: compact ? fz(12) : fz(13), fontWeight: compact ? 400 : 500, color: isSkipped ? C.textMuted : C.text }}>
        <span style={{ color: C.textMuted, marginRight: 4 }}>Step {s.num} ·</span>
        {s.title}
        {compact && s.result && <span style={{ color: C.textMuted }}> → {s.result}</span>}
      </div>
      {!compact && s.result && (
        <div style={{ fontSize: fz(12), color: s.status === 'waiting' ? '#DC2626' : C.textMuted, marginTop: 2 }}>
          {s.result}
        </div>
      )}
      {/* 待確認步驟的細節卡 */}
      {!compact && s.detail && s.status === 'waiting' && (
        <antd.Card size="small" style={{ marginTop: 8 }}
          styles={{ body: { padding: '8px 16px', fontSize: fz(12), color: C.textSub, lineHeight: 1.8 } }}>
          {s.detail.machine && (
            <><strong>機台：</strong>{s.detail.machine}
            {s.detail.recipe ? <span>　｜　<strong>製程：</strong>{s.detail.recipe}</span> : ''}
            {s.detail.priority ? <span>　｜　<strong>優先：</strong>{s.detail.priority}</span> : ''}
            <br/></>
          )}
          {s.detail.desc && <><strong>說明：</strong>{s.detail.desc}<br/></>}
          {s.detail.target && (
            <><strong>目標：</strong>{s.detail.target}
            <br/><strong>問題：</strong>{s.detail.issue}
            <br/><strong>建議動作：</strong>{s.detail.action}<br/></>
          )}
        </antd.Card>
      )}
      {/* 決策者 */}
      {s.decisionBy && (
        <div style={{ marginTop: 4 }}>
          <SchActorLine actor={s.decisionBy} text={
            s.decisionBy.name + ' ' + s.decisionBy.action + ' · ' + s.decisionBy.time +
            (s.decisionBy.note ? '　·　「' + s.decisionBy.note + '」' : '')
          } />
        </div>
      )}
    </div>
  );
}

/* ── 步驟清單 → Timeline（連接線由 AntD 提供，取代原本手刻的列背景）── */
function SchStepTimeline({ steps, compact }) {
  const items = steps.map(function (s) {
    return {
      key: s.num,
      dot: <SchStepIcon status={s.status} size={compact ? 16 : 20} />,
      children: <SchStepBody s={s} compact={compact} />,
    };
  });
  return <antd.Timeline className="sch-timeline" items={items} style={{ marginTop: compact ? 8 : 0, marginBottom: 0 }} />;
}

/* ════════════════════════════════════════
   SCHEDULING PAGE MAIN
   ════════════════════════════════════════ */
function SchedulingPage({ p, onAskAI, expandRunReq}) {
  var { C, fz } = useTheme();
  const items = (SCHEDULING_DATA && SCHEDULING_DATA[p.key]) || [];

  const [selectedId, setSelectedId] = React.useState(items[0]?.id || null);
  const [lockedRun, setLockedRun]   = React.useState(null);       // { runId, byUser }
  const [expandedRuns, setExpandedRuns] = React.useState(() => {
    const init = new Set();
    // auto-expand the first pending run
    if (items[0]?.runs[0]) init.add(items[0].runs[0].id);
    return init;
  });
  const [resolvedRuns, setResolvedRuns] = React.useState(new Set());

  /* ── 通知 deep-link：展開指定執行紀錄（見 notification 模組）──
     依 runId 找到所屬排程，切換選取並展開該筆 run；nonce 變動即重觸發。 */
  React.useEffect(function () {
    const runId = expandRunReq && expandRunReq.runId;
    if (!runId) return;
    const owner = items.find(function (it) {
      return (it.runs || []).some(function (r) { return r.id === runId; });
    });
    if (!owner) return;
    setSelectedId(owner.id);
    setExpandedRuns(function (prev) { const n = new Set(prev); n.add(runId); return n; });
  }, [expandRunReq && expandRunReq.nonce]);

  const selectedItem  = items.find(i => i.id === selectedId);

  // Find the active pending run for the selected item
  const pendingRun = selectedItem?.runs.find(
    r => r.result === 'pending' && !resolvedRuns.has(r.id)
  );

  /* ── Handlers ── */
  const handleClaim = (runId) => {
    setLockedRun({ runId, byUser: p.user.name });
    setExpandedRuns(prev => { const n = new Set(prev); n.add(runId); return n; });
  };

  const handleConfirm = (run) => {
    setResolvedRuns(prev => { const n = new Set(prev); n.add(run.id); return n; });
    setLockedRun(null);
  };

  const handleReject = (run) => {
    setResolvedRuns(prev => { const n = new Set(prev); n.add(run.id); return n; });
    setLockedRun(null);
  };

  const handleDiscuss = (item, run) => {
    const stepLines = run.steps.map(s => {
      const icon = { done: '✓', waiting: '⏸', error: '✕', pending: '○', skip: '—', rejected: '✕', discuss: '💬' }[s.status] || '○';
      let line = `Step ${s.num} ${icon}  ${s.title}\n         → ${s.result}`;
      if (s.detail) {
        const d = s.detail;
        if (d.machine) line += `\n         → 機台：${d.machine}${d.recipe ? ` | 製程：${d.recipe}` : ''}${d.priority ? ` | ${d.priority}` : ''}`;
        if (d.desc) line += `\n         → 說明：${d.desc}`;
        if (d.target) line += `\n         → 目標：${d.target}，問題：${d.issue}，建議動作：${d.action}`;
      }
      return line;
    }).join('\n\n');

    const ctx = `【Scheduling 執行紀錄】排程：${item.name}　Skill：${item.skill}　執行時間：${run.dateLabel}\n\n` +
      `步驟紀錄：\n${stepLines}\n\n---\n以上是此次排程執行的完整紀錄，請根據上述內容協助分析或決策。`;

    setResolvedRuns(prev => { const n = new Set(prev); n.add(run.id); return n; });
    setLockedRun(null);
    if (onAskAI) onAskAI({ text: ctx, label: `Scheduling：${item.name}` });
  };

  /* ── Intervention Banner → Alert（HITL 三重約束的介入點）── */
  const renderBanner = () => {
    if (!pendingRun) return null;
    const isMyLock    = lockedRun?.runId === pendingRun.id && lockedRun?.byUser === p.user.name;
    const isOtherLock = lockedRun?.runId === pendingRun.id && lockedRun?.byUser !== p.user.name;
    const waitingStep = pendingRun.steps.find(s => s.status === 'waiting');

    return (
      <div>
        <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
          ⚠ 當前執行待確認
        </div>
        <antd.Alert
          type="error"
          message={
            <span style={{ fontSize: fz(13), fontWeight: 600 }}>
              AI 執行至步驟 {waitingStep ? waitingStep.num : '?'}，需要人工確認才能繼續
            </span>
          }
          description={
            <div>
              {/* MCP call hint */}
              <div style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.6, marginBottom: 16 }}>
                AI 準備呼叫{' '}
                <antd.Typography.Text code style={{ fontSize: fz(12) }}>
                  {waitingStep?.mcpTool || 'unknown.tool'}
                </antd.Typography.Text>
                ，請確認是否執行。
              </div>

              {/* Steps */}
              <div style={{ marginBottom: 8 }}>
                <SchStepTimeline steps={pendingRun.steps} compact={false} />
              </div>

              {/* Action area */}
              {!isMyLock && !isOtherLock && (
                <antd.Space size={8} wrap>
                  <antd.Button type="primary" onClick={() => handleClaim(pendingRun.id)}>✋ 我來處理</antd.Button>
                  <span style={{ fontSize: fz(12), color: C.textMuted }}>點擊後由你接手此次執行的決策</span>
                </antd.Space>
              )}

              {isMyLock && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <antd.Badge status="success" />
                    <span style={{ fontSize: fz(12), color: C.textMuted }}>你正在處理此決策，其他成員已暫時無法接手</span>
                  </div>
                  <antd.Space size={8} wrap>
                    <antd.Button type="primary" onClick={() => handleConfirm(pendingRun)}>✓ 確認執行</antd.Button>
                    <antd.Popconfirm
                      title="拒絕此次執行？"
                      description="AI 將停止在當前步驟，不會呼叫後續工具。"
                      okText="拒絕" cancelText="取消" okButtonProps={{ danger: true }}
                      onConfirm={() => handleReject(pendingRun)}
                    >
                      <antd.Button danger>✕ 拒絕</antd.Button>
                    </antd.Popconfirm>
                    <antd.Button
                      onClick={() => handleDiscuss(selectedItem, pendingRun)}
                      style={{ color: '#7C3AED', borderColor: '#C4B5FD' }}
                    >💬 延伸討論</antd.Button>
                    <span style={{ fontSize: fz(11), color: C.textMuted }}>→ 跳轉 AI Chat，以此次執行為 context 開啟新對話</span>
                  </antd.Space>
                </div>
              )}

              {isOtherLock && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <antd.Badge status="success" />
                  <span style={{ fontSize: fz(12), color: C.textMuted }}>{lockedRun.byUser} 正在處理此決策</span>
                </div>
              )}
            </div>
          }
        />
      </div>
    );
  };

  /* ── 執行紀錄 → Collapse（摘要列＝panel header，步驟＝panel body）── */
  const renderRunPanels = () => {
    return (selectedItem.runs || []).map(function (run) {
      const isResolved  = resolvedRuns.has(run.id);
      const displayResult = (isResolved && run.result === 'pending') ? 'success' : run.result;
      const cfg = SCH_RUN_CFG[displayResult] || SCH_RUN_CFG.success;

      // Collect decision actors from steps
      const stepActors = (run.steps || []).filter(s => s.decisionBy).map(s => ({
        ...s.decisionBy, stepNum: s.num,
      }));

      return {
        key: run.id,
        style: {
          background: C.bg, borderRadius: 6, marginBottom: 8,
          border: '1px solid ' + (displayResult === 'pending' && !isResolved ? '#FCA5A5' : C.border),
        },
        label: (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <SchStepIcon status={{ success: 'done', pending: 'waiting', error: 'error', discuss: 'discuss', rejected: 'rejected' }[displayResult] || 'done'} size={24} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: fz(13), fontWeight: 500, color: C.text, marginBottom: 2 }}>
                {run.dateLabel} — {
                  isResolved && run.result === 'pending'
                    ? '完成（人工確認）'
                    : `${cfg.label}（${run.doneSteps}/${run.totalSteps} 步驟）`
                }
              </div>
              <div style={{ fontSize: fz(11), color: C.textMuted }}>
                排程自動觸發 · 執行時長：{run.duration}
              </div>

              {/* Handler actor (top-level: pending/discuss/rejected) */}
              {run.handler && run.result !== 'success' && !isResolved && (
                <div style={{ marginTop: 8 }}>
                  <SchActorLine actor={run.handler} text={
                    run.handler.name +
                    (run.result === 'pending' ? ' 介入處理中'
                      : run.result === 'discuss' ? ' 選擇延伸討論 · ' + run.handler.time
                      : ' ' + run.handler.action + ' · ' + run.handler.time) +
                    (run.handler.note ? '　·　「' + run.handler.note + '」' : '')
                  } />
                </div>
              )}

              {/* Step-level actors (multiple decision points) */}
              {stepActors.length > 0 && run.result === 'success' && (
                <antd.Space size={16} wrap style={{ marginTop: 8 }}>
                  {stepActors.map((a, i) => (
                    <SchActorLine key={i} actor={a} text={a.name + ' ' + a.action + ' Step ' + a.stepNum + ' · ' + a.time} />
                  ))}
                </antd.Space>
              )}

              {/* Error message */}
              {run.errorMsg && (
                <div style={{ marginTop: 8, fontSize: fz(11), color: '#DC2626', fontFamily: 'monospace', background: 'rgba(239,68,68,0.05)', padding: '4px 8px', borderRadius: 4 }}>
                  {run.errorMsg}
                </div>
              )}
            </div>
          </div>
        ),
        extra: (
          <antd.Tag style={{ marginInlineEnd: 0, borderRadius: 999, background: cfg.bg, color: cfg.color, borderColor: 'transparent' }}>
            {isResolved && run.result === 'pending' ? '完成' : cfg.label}
          </antd.Tag>
        ),
        children: run.steps ? <SchStepTimeline steps={run.steps} compact={true} /> : null,
      };
    });
  };

  /* ── Main render ── */
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Left Panel ── */}
        <div style={{
          width: 312, flexShrink: 0,
          background: C.bg, borderRight: '1px solid ' + C.border,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: fz(13), fontWeight: 600, color: C.textSub }}>排程清單</span>
            <antd.Button type="primary" size="small">＋ 新增</antd.Button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
            <antd.List
              dataSource={items}
              split={false}
              locale={{ emptyText: <antd.Empty style={{ padding: 24 }} description={<span style={{ fontSize: fz(13), color: C.textMuted }}>尚無排程項目</span>} /> }}
              renderItem={function (item) {
                const isActive = selectedId === item.id;
                const isPending = item.runs.some(r => r.result === 'pending' && !resolvedRuns.has(r.id));
                const effectiveStatus = isPending ? 'pending' : item.status;
                const statusCfg = SCH_ITEM_STATUS_CFG[effectiveStatus] || SCH_ITEM_STATUS_CFG.ok;
                return (
                  <antd.List.Item style={{ padding: '0 0 8px', borderBlockEnd: 'none' }}>
                    <antd.Card
                      size="small" hoverable
                      onClick={() => setSelectedId(item.id)}
                      style={{
                        width: '100%',
                        borderColor: isActive ? '#2563EB' : isPending ? '#FCA5A5' : C.border,
                        backgroundColor: isActive ? 'rgba(37,99,235,0.04)' : isPending ? 'rgba(239,68,68,0.04)' : undefined,
                      }}
                      styles={{ body: { padding: 12 } }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text, flex: 1 }}>{item.name}</span>
                        {isPending && <antd.Badge color="#EF4444" />}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: fz(11), color: C.textMuted, fontFamily: 'monospace' }}>{item.cronLabel}</span>
                        <antd.Tag style={{ marginInlineEnd: 0, borderRadius: 999, background: statusCfg.bg, color: statusCfg.color, borderColor: 'transparent' }}>
                          {statusCfg.label}
                        </antd.Tag>
                      </div>
                      <div style={{ fontSize: fz(11), color: C.textMuted }}>上次執行：{item.lastRun}</div>
                    </antd.Card>
                  </antd.List.Item>
                );
              }}
            />
          </div>
        </div>

        {/* ── Right Panel ── */}
        {selectedItem ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bgPanel }}>

            {/* Right Header */}
            <div style={{
              padding: '16px 24px', background: C.bg, borderBottom: '1px solid ' + C.border,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: fz(15), fontWeight: 600, color: C.text }}>{selectedItem.name}</div>
                <div style={{ fontSize: fz(12), color: C.textMuted, marginTop: 2 }}>
                  {selectedItem.cronLabel} 執行　·　Skill：
                  <span style={{ fontFamily: 'monospace' }}>{selectedItem.skill}</span>
                  　·　建立者：{selectedItem.createdBy}
                </div>
              </div>
              <antd.Space size={8}>
                <antd.Button size="small">編輯排程</antd.Button>
                <antd.Button size="small" danger>停用</antd.Button>
              </antd.Space>
            </div>

            {/* Right Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Intervention Banner */}
              {renderBanner()}

              {/* Divider (only when banner is shown) */}
              {pendingRun && <antd.Divider style={{ margin: 0 }} />}

              {/* Execution History */}
              <div>
                <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                  執行紀錄
                </div>
                <antd.Collapse
                  bordered={false}
                  activeKey={Array.from(expandedRuns)}
                  onChange={function (keys) { setExpandedRuns(new Set(keys)); }}
                  items={renderRunPanels()}
                  style={{ background: 'transparent' }}
                />
              </div>

            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <antd.Empty description={<span style={{ fontSize: fz(13), color: C.textMuted }}>選擇左側排程項目查看詳情</span>} />
          </div>
        )}

      </div>
    </div>
  );
}
