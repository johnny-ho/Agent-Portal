/* ════════════════════════════════════════
   CHAT PAGE
   AntD 遷移 Phase 5（見 brain/concepts/antd-migration-plan.md）
   ════════════════════════════════════════ */

/* ── Quick Prompts (新對話建議 prompt) ── */
var QUICK_PROMPTS = {
  equipment: [
    { icon: '🔧', label: '查換件 Skill',     text: '幫我查 E-101 換件 Skill 最新版本，並摘要關鍵步驟。' },
    { icon: '📋', label: '準備交班摘要',   text: '幫我根據本班課況準備交班摘要，包含 KPI 未達標、Unclose Case 與遺留事項。' },
    { icon: '⚡', label: '分析 FDC 異常',  text: '目前有 FDC 異常，請幫我整理可能根因與處理 Skill 步驟。' },
    { icon: '📊', label: '解讀 SPC 數據',  text: '幫我解讀 SPC 失控規則，說明 Nelson Rule 2 的判定條件與處置方式。' },
  ],
  process: [
    { icon: '📈', label: '分析良率異常',   text: '請幫我分析良率異常可能的根因，並列出需要確認的製程參數。' },
    { icon: '📋', label: '準備交班摘要',   text: '幫我根據本班課況準備交班摘要，包含 KPI 未達標與遺留待追蹤事項。' },
    { icon: '🧪', label: '查 Recipe Skill',  text: '幫我查詢 Recipe 變更的標準流程與 DCR 申請步驟。' },
    { icon: '📊', label: '解讀 SPC 失控',  text: '目前有 SPC 失控站點，請幫我整理處置流程與通報對象。' },
  ],
  mfg: [
    { icon: '🏗️', label: '查排程調整方案', text: '因停機影響產能，請幫我整理排程調整優先順序的考量因素。' },
    { icon: '📋', label: '準備交班摘要',   text: '幫我根據本班課況準備交班摘要，包含產能達成狀況與遺留工單。' },
    { icon: '🔄', label: '查 WIP 狀態',    text: '幫我整理目前在製品優先順序與交期風險評估。' },
    { icon: '📝', label: '起草協調說明',   text: '請幫我起草一份跨課協調說明，說明目前停機影響與需要支援的項目。' },
  ],
};

function ChatPage({ p, aiDraft, clearAiDraft}) {
  var { C, fz } = useTheme();
  const hasDraft = !!(aiDraft && aiDraft.text);
  const [chats, setChats] = React.useState(p.chats.map(function(c) { return Object.assign({}, c); }));
  const [activeId, setActiveId] = React.useState(hasDraft ? null : (chats[0] && chats[0].id));
  const [inputVal, setInputVal] = React.useState('');
  const [contextExpanded, setContextExpanded] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [renamingId, setRenamingId] = React.useState(null);
  const [renameVal, setRenameVal] = React.useState('');
  const [hoveredChatId, setHoveredChatId] = React.useState(null);
  /* Skill 右側抽屜 */
  const [sopDrawer, setSopDrawer] = React.useState(null); // { title, content }

  const activeChat = chats.find(function(c) { return c.id === activeId; });
  const isNewChat = activeId === null;

  /* 過濾 chats（search） */
  const filteredChats = React.useMemo(function() {
    if (!searchQuery.trim()) return chats;
    const q = searchQuery.toLowerCase();
    return chats.filter(function(c) { return c.title.toLowerCase().includes(q); });
  }, [chats, searchQuery]);

  const groups = [
    { label: '今天', items: filteredChats.filter(function(c) { return c.time.startsWith('今天'); }) },
    { label: '昨天', items: filteredChats.filter(function(c) { return c.time.startsWith('昨天'); }) },
    { label: '更早', items: filteredChats.filter(function(c) { return !c.time.startsWith('今天') && !c.time.startsWith('昨天'); }) },
  ].filter(function(g) { return g.items.length > 0; });

  /* ── rename ── */
  function startRename(chatId, currentTitle, e) {
    e.stopPropagation();
    setRenamingId(chatId);
    setRenameVal(currentTitle);
  }
  function commitRename(chatId) {
    if (renameVal.trim()) {
      setChats(function(prev) {
        return prev.map(function(c) { return c.id === chatId ? Object.assign({}, c, { title: renameVal.trim() }) : c; });
      });
    }
    setRenamingId(null);
  }

  /* ── delete ── */
  function deleteChat(chatId) {
    setChats(function(prev) { return prev.filter(function(c) { return c.id !== chatId; }); });
    if (activeId === chatId) setActiveId(null);
  }

  /* ── Skill mock content lookup ── */
  var SKILL_CONTENT = {
    'CMP 研磨頭定期更換 Skill v2.3': '【目的】確保 CMP 研磨頭定期更換，維持設備效能與製程穩定性。\n\n【適用範圍】E-101、E-203、E-308 等 CMP 設備。\n\n【步驟】\n1. 確認設備停機，掛上「維修中」安全標示\n2. 準備更換備料（研磨頭型號：CMH-2023A）\n3. 依序拆卸舊研磨頭（注意靜電防護）\n4. 清潔研磨座，確認無異物\n5. 安裝新研磨頭，扭矩值 15 N·m\n6. 進行 Break-in 程序（3 個晶圓 Dummy Run）\n7. 確認 FDC 參數回到正常範圍\n8. 填寫換件記錄並更新 CMMS\n\n【注意事項】\n• 換件後前 2 片晶圓需加強量測\n• 異常請即時回報課長',
    'E-308 FDC Level-2 異常處理 Skill': '【目的】規範 E-308 FDC Level-2 異常的標準處理流程。\n\n【判定條件】\n• Level-2：連續 3 點超出 2σ 管制線\n\n【處理步驟】\n1. 立即停止相關製程，通知當班 EE\n2. 確認 FDC 參數趨勢（參考 FDC Console）\n3. 執行 Interlock Check（冷卻水、氣體流量、壓力）\n4. 若無法即時排除，升報課長\n5. 填寫 FDC 異常記錄表（格式 FDC-FORM-001）\n\n【恢復條件】\n連續 5 點回到 1σ 以內方可恢復生產',
  };

  function openSopDrawer(sopTitle) {
    setSopDrawer({
      title: sopTitle,
      content: SKILL_CONTENT[sopTitle] || '此 Skill 內容尚未載入，請至知識管理查閱完整文件。',
    });
  }

  const quickPrompts = QUICK_PROMPTS[p.key] || QUICK_PROMPTS.equipment;

  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0, background: C.bg, position: 'relative' }}>
      {/* Sidebar */}
      <div style={{ width: 224, borderRight: '1px solid ' + C.border, display: 'flex', flexDirection: 'column', flexShrink: 0, background: C.bgPanel }}>
        {/* New chat button */}
        <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid ' + C.border }}>
          <antd.Button
            type="primary" block
            onClick={function() { setActiveId(null); if (clearAiDraft) clearAiDraft(); }}
          >+ 新對話</antd.Button>
        </div>

        {/* Search box */}
        <div style={{ padding: '8px 8px 0' }}>
          <antd.Input
            size="small"
            value={searchQuery}
            onChange={function(e) { setSearchQuery(e.target.value); }}
            allowClear
            aria-label="搜尋對話"
            prefix={<span style={{ color: C.textMuted, fontSize: fz(12) }}>🔍</span>}
            placeholder="對話標題"
          />
        </div>

        {/* Chat list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }} className="scrollbar-thin">
          {groups.length === 0 && (
            <antd.Empty
              image={antd.Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ marginBlock: 16 }}
              description={<span style={{ fontSize: fz(12), color: C.textMuted }}>{searchQuery ? '找不到符合的對話' : '尚無對話記錄'}</span>}
            />
          )}
          {groups.map(function(g) {
            return (
              <div key={g.label}>
                <div style={{ fontSize: fz(11), fontWeight: 500, color: C.textMuted, padding: '8px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{g.label}</div>
                <antd.List
                  dataSource={g.items}
                  split={false}
                  renderItem={function(chat) {
                    var isActive = activeId === chat.id;
                    var isHovered = hoveredChatId === chat.id;
                    var isRenaming = renamingId === chat.id;
                    return (
                      <antd.List.Item
                        style={{ padding: 0, borderBlockEnd: 'none', display: 'block', position: 'relative' }}
                        onMouseEnter={function() { setHoveredChatId(chat.id); }}
                        onMouseLeave={function() { setHoveredChatId(null); }}
                      >
                        {isRenaming ? (
                          <antd.Input
                            size="small"
                            autoFocus
                            value={renameVal}
                            onChange={function(e) { setRenameVal(e.target.value); }}
                            onBlur={function() { commitRename(chat.id); }}
                            onPressEnter={function() { commitRename(chat.id); }}
                            onKeyDown={function(e) { if (e.key === 'Escape') setRenamingId(null); }}
                          />
                        ) : (
                          <antd.Button
                            type="text" block
                            onClick={function() { setActiveId(chat.id); }}
                            style={{
                              justifyContent: 'flex-start', height: 'auto', padding: '8px',
                              backgroundColor: isActive ? C.bg : undefined,
                              border: '1px solid ' + (isActive ? C.border : 'transparent'),
                              fontSize: fz(12), fontWeight: isActive ? 600 : 400,
                              color: isActive ? C.text : C.textSub,
                              paddingRight: isHovered ? 48 : 8,
                            }}
                          >
                            <span style={{ display: 'block', width: '100%', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {chat.title}
                            </span>
                          </antd.Button>
                        )}
                        {/* Hover actions: rename + delete */}
                        {isHovered && !isRenaming && (
                          <div style={{ position: 'absolute', right: 4, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 4 }}>
                            <antd.Tooltip title="重命名">
                              <antd.Button
                                size="small" type="text"
                                onClick={function(e) { startRename(chat.id, chat.title, e); }}
                                style={{ color: C.textMuted, background: C.bg }}
                              >✎</antd.Button>
                            </antd.Tooltip>
                            <antd.Popconfirm
                              title="刪除此對話？" okText="刪除" cancelText="取消"
                              okButtonProps={{ danger: true }}
                              onConfirm={function() { deleteChat(chat.id); }}
                            >
                              <antd.Tooltip title="刪除">
                                <antd.Button
                                  size="small" type="text" danger
                                  onClick={function(e) { e.stopPropagation(); }}
                                  style={{ background: C.bg }}
                                >✕</antd.Button>
                              </antd.Tooltip>
                            </antd.Popconfirm>
                          </div>
                        )}
                      </antd.List.Item>
                    );
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: C.bg }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: fz(14), color: C.text }}>
              {isNewChat ? '新對話' : activeChat && activeChat.title}
            </div>
            <div style={{ fontSize: fz(12), color: C.textMuted }}>
              {isNewChat ? (hasDraft ? ('已帶入 context：' + aiDraft.label) : '輸入問題開始對話') : (activeChat ? (activeChat.time + ' · 個人對話') : '')}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }} className="scrollbar-thin">
          {isNewChat ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: '0 24px' }}>
              <div style={{ width: 40, height: 40, borderRadius: 8, background: p.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fz(18), color: '#FFFFFF' }}>✦</div>
              <div style={{ fontSize: fz(14), fontWeight: 600, color: C.text }}>有什麼可以幫你？</div>
              <div style={{ fontSize: fz(12), color: C.textMuted }}>
                {hasDraft ? ('已帶入「' + aiDraft.label + '」作為參考，直接輸入問題即可') : '輸入問題，AI 將根據課別知識庫回覆'}
              </div>
              {/* Quick prompts */}
              {!hasDraft && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxWidth: 480, width: '100%', marginTop: 8 }}>
                  {quickPrompts.map(function(qp, i) {
                    return (
                      <antd.Card
                        key={i} size="small" hoverable
                        onClick={function() { setInputVal(qp.text); }}
                        styles={{ body: { padding: 16, display: 'flex', alignItems: 'flex-start', gap: 8 } }}
                      >
                        <span style={{ fontSize: fz(16), flexShrink: 0 }}>{qp.icon}</span>
                        <span style={{ fontSize: fz(12), fontWeight: 500, color: C.textSub, lineHeight: 1.4 }}>{qp.label}</span>
                      </antd.Card>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeChat && activeChat.messages && activeChat.messages.length > 0 ? (
            <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {activeChat.messages.map(function(msg, i) {
                const isUser = msg.role === 'user';
                return (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: isUser ? 'row-reverse' : 'row' }}>
                    <div style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, background: isUser ? '#2563EB' : p.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600, fontSize: fz(12) }}>
                      {isUser ? p.user.avatar : '✦'}
                    </div>
                    <div style={{ maxWidth: '80%' }}>
                      {/* 對話泡泡保留自製：AntD v5 無 bubble 元件，且左右不對稱圓角為本頁客製視覺 */}
                      <div style={{ padding: '8px 16px', borderRadius: isUser ? '12px 4px 12px 12px' : '4px 12px 12px 12px', background: isUser ? '#2563EB' : C.bgSub, border: isUser ? 'none' : '1px solid ' + C.border, fontSize: fz(14), lineHeight: 1.65, color: isUser ? '#FFFFFF' : C.text, whiteSpace: 'pre-line' }}>
                        {msg.text}
                      </div>
                      {msg.sop && (
                        <antd.Tooltip title="點擊查看 Skill 內容">
                          <antd.Tag
                            color="blue"
                            onClick={function() { openSopDrawer(msg.sop); }}
                            style={{ marginTop: 8, marginInlineEnd: 0, cursor: 'pointer', fontSize: fz(12) }}
                          >📄 {msg.sop} →</antd.Tag>
                        </antd.Tooltip>
                      )}
                      {msg.action === 'contribute' && (
                        <antd.Space size={8} style={{ marginTop: 8 }}>
                          <antd.Button size="small" type="primary" style={{ background: '#22C55E' }}>確認提交</antd.Button>
                          <antd.Button size="small">略過</antd.Button>
                        </antd.Space>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <antd.Empty description={<span style={{ fontSize: fz(14), color: C.textMuted }}>選擇一則對話查看內容</span>} />
            </div>
          )}
        </div>
        <div style={{ padding: '8px 16px 16px', borderTop: '1px solid ' + C.border }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            {/* Context Badge → Alert（closable = 移除 context） */}
            {hasDraft && (
              <antd.Alert
                type="info"
                closable
                onClose={function() { clearAiDraft && clearAiDraft(); }}
                style={{ marginBottom: 8 }}
                message={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                    onClick={function() { setContextExpanded(function(v) { return !v; }); }}>
                    <span style={{ fontSize: fz(11), color: '#2563EB', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>✦ Context 已載入</span>
                    <span style={{ fontSize: fz(12), color: C.textSub, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{aiDraft.label}</span>
                    <span style={{ fontSize: fz(10), color: C.textMuted }}>{contextExpanded ? '▲' : '▼'}</span>
                  </div>
                }
                description={contextExpanded ? (
                  <div style={{
                    fontSize: fz(12), color: C.textSub, lineHeight: 1.7,
                    fontFamily: 'monospace', whiteSpace: 'pre-wrap',
                    maxHeight: 120, overflowY: 'auto',
                  }} className="scrollbar-thin">{aiDraft.text}</div>
                ) : null}
              />
            )}
            {/* Input row */}
            <div style={{ background: C.bgPanel, border: '1px solid ' + C.border, borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
              <antd.Input
                variant="borderless"
                value={inputVal}
                onChange={function(e) { setInputVal(e.target.value); }}
                onPressEnter={function() { if (inputVal && clearAiDraft) clearAiDraft(); setInputVal(''); }}
                aria-label="輸入訊息"
                placeholder={hasDraft ? '輸入你的問題，AI 將一併參考上方 context…' : '繼續對話…'}
                style={{ flex: 1, padding: 0, fontSize: fz(14) }}
              />
              <antd.Button
                type="primary" shape="circle" disabled={!inputVal}
                onClick={function() { if (inputVal && clearAiDraft) clearAiDraft(); setInputVal(''); }}
              >↑</antd.Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Skill 右側抽屜 → Drawer（限縮於本頁主體）──
          比照 TaskManagementPage：getContainer={false} + rootStyle 絕對定位，
          並採條件渲染，關閉時不留空節點。 */}
      {sopDrawer && (
      <div style={{ position: 'absolute', inset: 0 }}>
      <antd.Drawer
        open
        onClose={function() { setSopDrawer(null); }}
        getContainer={false}
        width={360}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: fz(16) }}>📄</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: fz(13), fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {sopDrawer.title}
              </div>
              <div style={{ fontSize: fz(11), color: C.textMuted, fontWeight: 400 }}>Skill 文件</div>
            </div>
          </div>
        }
        footer={<antd.Button block>前往完整知識管理頁面 →</antd.Button>}
        styles={{ body: { padding: 16 } }}
      >
        <pre style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.8, whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>
          {sopDrawer.content}
        </pre>
      </antd.Drawer>
      </div>
      )}
    </div>
  );
}
