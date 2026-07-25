/* ════════════════════════════════════════
   KNOWLEDGE PAGE
   AntD 遷移 Phase 4（見 brain/concepts/antd-migration-plan.md）
   ════════════════════════════════════════ */

function KnowledgePage({ p, onSOPManage}) {
  var { C, fz } = useTheme();
  const [tab, setTab] = React.useState('sop');
  const tabs = [
    { k: 'sop', l: 'Skill', n: p.knowledge.sops.length },
    { k: 'prompt', l: 'Prompt 模板', n: p.knowledge.prompts.length },
    { k: 'qa', l: 'Q&A 條目', n: p.knowledge.qa.length },
  ];

  /* 膠囊 tabs → Segmented；選中背景 #2563EB（guideline 要求真 tabs 用主色），
     以巢狀 ConfigProvider 侷限本頁，不動其他頁的篩選型 Segmented。 */
  const segOptions = tabs.map(function (t) {
    const isActive = tab === t.k;
    return {
      value: t.k,
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          {t.l}
          <span style={{
            fontSize: fz(11), padding: '0 8px', borderRadius: 999, lineHeight: '16px',
            /* 用 backgroundColor（非 background shorthand）：切換分頁重繪時
               與 AntD 內部設定的 backgroundColor 混用會觸發 React 警告 */
            backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : C.hover,
            color: isActive ? '#FFFFFF' : C.textMuted,
          }}>{t.n}</span>
        </span>
      ),
    };
  });

  /* ── Skill 卡片 ── */
  function renderSop(sop, i) {
    return (
      <antd.List.Item key={i} style={{ padding: '0 0 8px', borderBlockEnd: 'none' }}>
        <antd.Card size="small" style={{ width: '100%' }} styles={{ body: { padding: 16 } }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <antd.Space size={8} wrap style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 500, fontSize: fz(14), color: C.text }}>{sop.title}</span>
                <antd.Tag style={{ marginInlineEnd: 0, borderRadius: 999, color: sop.statusColor, background: sop.statusBg, borderColor: 'transparent' }}>
                  {sop.statusLabel}
                </antd.Tag>
                <span style={{ fontSize: fz(12), color: C.textMuted }}>{sop.version}</span>
              </antd.Space>
              {sop.feedback && (
                <antd.Alert type="warning" showIcon message={sop.feedback} style={{ marginBottom: 8, padding: '4px 8px' }} />
              )}
              <div style={{ fontSize: fz(14), color: C.textSub, marginBottom: 8 }}>{sop.desc}</div>
              <antd.Space size={8} wrap>
                <antd.Space size={4} wrap>
                  {sop.tags.map(function (t) { return <antd.Tag key={t} style={{ marginInlineEnd: 0 }}>{t}</antd.Tag>; })}
                </antd.Space>
                <span style={{ fontSize: fz(12), color: C.textMuted }}>更新 {sop.updated}</span>
                <span style={{ fontSize: fz(12), color: C.textMuted }}>負責 {sop.owner}</span>
                <span style={{ fontSize: fz(12), color: C.textMuted }}>查詢 {sop.usage} 次</span>
              </antd.Space>
            </div>
            <antd.Space size={8} align="start" style={{ flexShrink: 0 }}>
              <antd.Button size="small" style={{ color: p.accentColor, borderColor: p.accentBorder, background: p.accentBg }}>✦ AI 問這份</antd.Button>
              <antd.Button size="small">查看</antd.Button>
            </antd.Space>
          </div>
        </antd.Card>
      </antd.List.Item>
    );
  }

  /* ── Prompt 卡片 ── */
  function renderPrompt(pr, i) {
    return (
      <antd.List.Item key={i} style={{ padding: '0 0 8px', borderBlockEnd: 'none' }}>
        <antd.Card size="small" style={{ width: '100%' }} styles={{ body: { padding: 16 } }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <antd.Space size={8} wrap style={{ marginBottom: 8 }}>
                <span style={{ fontWeight: 500, fontSize: fz(14), color: C.text }}>{pr.label}</span>
                {pr.saved && (
                  <antd.Tag color="warning" style={{ marginInlineEnd: 0, borderRadius: 999 }}>★ 已加入捷徑</antd.Tag>
                )}
                <antd.Tag style={{ marginInlineEnd: 0 }}>{pr.category}</antd.Tag>
              </antd.Space>
              {/* Prompt 原文：guideline 要求以 monospace 呈現 */}
              <div style={{
                fontSize: fz(13), color: C.textSub, background: C.bgSub,
                border: '1px solid ' + C.border, borderRadius: 4,
                padding: 8, marginBottom: 8, fontFamily: 'monospace', lineHeight: 1.6,
              }}>{pr.text}</div>
              <div style={{ fontSize: fz(12), color: C.textMuted }}>貢獻 {pr.contributor} · 已使用 {pr.usage} 次</div>
            </div>
            <antd.Space size={8} align="start" style={{ flexShrink: 0 }}>
              <antd.Button size="small" style={{ color: p.accentColor, borderColor: p.accentBorder, background: p.accentBg }}>使用</antd.Button>
              <antd.Tooltip title={pr.saved ? '已加入捷徑' : '加入捷徑'}>
                <antd.Button size="small" style={pr.saved ? { color: '#F59E0B' } : undefined}>{pr.saved ? '★' : '☆'}</antd.Button>
              </antd.Tooltip>
            </antd.Space>
          </div>
        </antd.Card>
      </antd.List.Item>
    );
  }

  /* ── Q&A 卡片 ── */
  function renderQa(qa, i) {
    return (
      <antd.List.Item key={i} style={{ padding: '0 0 8px', borderBlockEnd: 'none' }}>
        <antd.Card size="small" style={{ width: '100%' }} styles={{ body: { padding: 16 } }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                <antd.Tag color="blue" style={{ marginInlineEnd: 0, flexShrink: 0 }}>Q</antd.Tag>
                <span style={{ fontSize: fz(14), fontWeight: 500, color: C.text }}>{qa.q}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                <antd.Tag color="success" style={{ marginInlineEnd: 0, flexShrink: 0 }}>A</antd.Tag>
                <span style={{ fontSize: fz(14), color: C.textSub, lineHeight: 1.6 }}>{qa.a}</span>
              </div>
              <antd.Space size={8} wrap>
                <span style={{ fontSize: fz(12), color: C.textMuted }}>貢獻 {qa.contributor} · {qa.date}</span>
                {qa.sourceSOP && <antd.Tag color="blue" style={{ marginInlineEnd: 0 }}>📄 {qa.sourceSOP}</antd.Tag>}
              </antd.Space>
            </div>
            <antd.Button size="small" style={{ flexShrink: 0, alignSelf: 'flex-start', color: p.accentColor, borderColor: p.accentBorder, background: p.accentBg }}>
              ✦ 追問
            </antd.Button>
          </div>
        </antd.Card>
      </antd.List.Item>
    );
  }

  const listCfg = {
    sop:    { data: p.knowledge.sops,    render: renderSop,    empty: '尚無 Skill' },
    prompt: { data: p.knowledge.prompts, render: renderPrompt, empty: '尚無 Prompt 模板' },
    qa:     { data: p.knowledge.qa,      render: renderQa,     empty: '尚無 Q&A 條目' },
  }[tab];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: C.bg }}>
      <div style={{ padding: '16px 24px 0', borderBottom: '1px solid ' + C.border }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: fz(18), color: C.text }}>{p.name} · 知識庫</div>
            <div style={{ fontSize: fz(12), color: C.textMuted }}>個人對話貢獻 + 審核通過內容</div>
          </div>
          <div style={{ flex: 1 }} />
          <antd.Button type="primary" onClick={onSOPManage}>+ 貢獻知識</antd.Button>
        </div>
        <div style={{ paddingBottom: 16 }}>
          <antd.ConfigProvider theme={{ components: { Segmented: { itemSelectedBg: '#2563EB', itemSelectedColor: '#FFFFFF' } } }}>
            <antd.Segmented value={tab} onChange={setTab} options={segOptions} />
          </antd.ConfigProvider>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }} className="scrollbar-thin">
        <antd.List
          dataSource={listCfg.data}
          split={false}
          renderItem={listCfg.render}
          locale={{ emptyText: <antd.Empty description={<span style={{ fontSize: fz(13), color: C.textMuted }}>{listCfg.empty}</span>} /> }}
        />
      </div>
    </div>
  );
}
