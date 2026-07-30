/* ════════════════════════════════════════
   KNOWLEDGE PAGE — 知識管理

   2026-07-26 重寫。原本這頁是未掛載的死碼（Skill／Prompt／Q&A 三個 tab），
   現改為「知識管理」，承接從 Skill 管理拆出來的知識層。

   為什麼要拆：知識在 Guide／Flow 執行的前後都會被引用，
   它是底料不是第三條路線。拆開之後，Skill 管理頁只剩
   「Guide」與「Flow」兩種真的會執行的東西。

   後續方向（本版不實作，頁面上有標註）：
   Vector 索引 → RAG 檢索 → 使用者自建知識圖譜。
   ════════════════════════════════════════ */

const KD_COL_W = { status: 96, owner: 96, updated: 104, usage: 88, action: 72 };

function KdStatusTag({ status }) {
  var { fz } = useTheme();
  var cfg = KD_STATUS_CFG[status];
  if (!cfg) return null;
  return (
    <antd.Tag style={{
      marginInlineEnd: 0, borderRadius: 999,
      color: cfg.color, background: cfg.bg, borderColor: cfg.border,
      fontSize: fz(11), fontWeight: 600, lineHeight: '18px', paddingInline: 10,
    }}>{cfg.label}</antd.Tag>
  );
}

/* ════════════════════════════════════════
   KnowledgeDocModal — 文件詳情
   ════════════════════════════════════════ */
function KnowledgeDocModal({ doc, p, onClose, onDelete }) {
  var { C, fz } = useTheme();

  function section(title, badge, children) {
    return (
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: fz(13), fontWeight: 700, color: C.text }}>{title}</span>
          {badge && (
            <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), background: C.bgPanel, color: C.textMuted }}>{badge}</antd.Tag>
          )}
        </div>
        {children}
      </div>
    );
  }

  return (
    <antd.Modal
      open
      centered
      width={840}
      onCancel={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 24 }}>
          <KdStatusTag status={doc.status} />
          <span style={{ flex: 1, fontWeight: 600, fontSize: fz(18), color: C.text }}>{doc.title}</span>
        </div>
      }
      footer={
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <antd.Popconfirm
            title="確定刪除此知識文件？"
            description={(doc.usedBy || []).length > 0 ? '有 ' + doc.usedBy.length + ' 個 Skill 正在引用它。' : null}
            okText="刪除" okButtonProps={{ danger: true }} cancelText="取消"
            onConfirm={onDelete}
          >
            <antd.Button danger>刪除</antd.Button>
          </antd.Popconfirm>
          <div style={{ flex: 1 }} />
          <antd.Button onClick={onClose}>關閉</antd.Button>
        </div>
      }
      styles={{
        body: { padding: '24px 32px', maxHeight: '64vh', overflowY: 'auto' },
        header: { marginBottom: 0, padding: '16px 24px', borderBottom: '1px solid ' + C.border },
        footer: { marginTop: 0, padding: '16px 24px', borderTop: '1px solid ' + C.border, background: C.bgSub },
        content: { padding: 0, overflow: 'hidden' },
      }}
    >
      {/* 摘要 */}
      <div style={{ fontSize: fz(14), color: C.textSub, lineHeight: 1.8, marginBottom: 24 }}>{doc.summary}</div>

      {/* 待更新的回饋 */}
      {doc.feedback && (
        <antd.Alert type="warning" showIcon style={{ marginBottom: 24 }}
          message={<span style={{ fontSize: fz(13), fontWeight: 600 }}>課內回饋</span>}
          description={<span style={{ fontSize: fz(13), lineHeight: 1.6 }}>{doc.feedback}</span>}
        />
      )}

      {/* 基本資訊 */}
      {section('基本資訊', null,
        <antd.Descriptions
          bordered size="small" column={2}
          labelStyle={{ fontSize: fz(12), color: C.textMuted, width: 88 }}
          contentStyle={{ fontSize: fz(13), color: C.text }}
          items={[
            { key: 'src',   label: '來源',   span: 2, children: <span style={{ fontFamily: 'monospace', fontSize: fz(12), wordBreak: 'break-all' }}>{doc.source}</span> },
            { key: 'owner', label: '負責人', children: doc.owner },
            { key: 'by',    label: '引入者', children: (doc.importedBy || '—') + ' · ' + (doc.importedAt || '—') },
            { key: 'upd',   label: '更新於', children: doc.updatedAt || '—' },
            { key: 'usage', label: '被檢索', children: (doc.usage || 0) + ' 次' },
            { key: 'tags',  label: '標籤',   span: 2, children: (
              <antd.Space size={4} wrap>
                {(doc.tags || []).map(function(t) { return <antd.Tag key={t} style={{ marginInlineEnd: 0 }}>{t}</antd.Tag>; })}
              </antd.Space>
            ) },
          ]}
        />
      )}

      {/* 被哪些 Skill 引用 —— 這一區是「知識不是平行路線」的具體證據 */}
      {section('被哪些 Skill 引用', (doc.usedBy || []).length + ' 個',
        (doc.usedBy || []).length === 0
          ? <div style={{ fontSize: fz(13), color: C.textMuted, padding: 16, background: C.bgPanel, border: '1px solid ' + C.border, borderRadius: 8, lineHeight: 1.7 }}>
              目前沒有 Skill 引用這份文件。<br />
              它仍然會被 AI 檢索到並用於一般問答，只是沒有被綁進任何 Guide 或 Flow。
            </div>
          : <div style={{ border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden' }}>
              {doc.usedBy.map(function(u, i) {
                return (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderTop: i > 0 ? '1px solid ' + C.border : 'none' }}>
                    <SkillTierTag tier={u.tier} />
                    <span style={{ fontSize: fz(13), color: C.text, fontWeight: 500, flex: 1, minWidth: 0 }}>{u.title}</span>
                    <span style={{ fontSize: fz(11), color: C.textMuted, fontFamily: 'monospace' }}>{u.id}</span>
                  </div>
                );
              })}
            </div>
      )}

      {/* 審核者 */}
      {(doc.reviewers || []).length > 0 && section('審核狀態',
        doc.reviewers.filter(function(r) { return r.approved; }).length + ' / ' + doc.reviewers.length + ' 已通過',
        <antd.List
          bordered size="small" dataSource={doc.reviewers}
          renderItem={function(r) {
            return (
              <antd.List.Item>
                <antd.List.Item.Meta
                  avatar={<Avatar char={r.avatar} size={28} color={r.approved ? '#22C55E' : C.textSub} />}
                  title={<span style={{ fontSize: fz(14), fontWeight: 500, color: C.text }}>{r.name}</span>}
                  description={<span style={{ fontSize: fz(12), color: C.textMuted }}>{r.role}</span>}
                />
                {r.approved
                  ? <antd.Space size={8}>
                      <antd.Tag style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), fontWeight: 600, color: '#22C55E', background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.2)' }}>✓ 通過</antd.Tag>
                      <span style={{ fontSize: fz(11), color: C.textMuted }}>{r.time}</span>
                    </antd.Space>
                  : <antd.Tag style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(11), fontWeight: 600, color: '#F59E0B', background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.2)' }}>待審核</antd.Tag>
                }
              </antd.List.Item>
            );
          }}
        />
      )}

      {/* 內容（切分後的段落） */}
      {section('文件內容', (doc.chunks || []).length + ' 段',
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(doc.chunks || []).map(function(c) {
            return (
              <antd.Card
                key={c.id} size="small"
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</span>
                    <div style={{ flex: 1 }} />
                    <span style={{ fontSize: fz(11), color: C.textMuted, fontFamily: 'monospace' }}>{c.tokens} tokens</span>
                  </div>
                }
                styles={{ header: { background: C.bgPanel, minHeight: 32 }, body: { padding: 16 } }}
              >
                <div style={{ fontSize: fz(14), color: C.textSub, lineHeight: 1.8 }}>{c.content}</div>
              </antd.Card>
            );
          })}
        </div>
      )}
    </antd.Modal>
  );
}

/* ════════════════════════════════════════
   KnowledgeImportModal — 從 KM 引入
   （原本掛在 Skill 管理，2026-07-26 隨知識一起搬過來：
     它引入的是文件，不是流程）
   ════════════════════════════════════════ */
function KnowledgeImportModal({ p, onClose, onImport }) {
  var { C, fz } = useTheme();
  var [title, setTitle]     = React.useState('');
  var [source, setSource]   = React.useState('Confluence · ' + p.name + ' / ');
  var [summary, setSummary] = React.useState('');
  var canSubmit = title.trim().length > 0;

  return (
    <antd.Modal
      open centered width={520}
      title={<span style={{ fontSize: fz(16), fontWeight: 600 }}>從 KM 系統引入知識</span>}
      onCancel={onClose}
      okText="引入並開始 AI 解析"
      cancelText="取消"
      okButtonProps={{ disabled: !canSubmit }}
      onOk={function() { if (canSubmit) onImport(title.trim(), source.trim(), summary.trim()); }}
    >
      <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 24, lineHeight: 1.7 }}>
        引入後由 AI 自動切分為可檢索的段落，進入草稿狀態等待課內審核。<br />
        審核通過的文件，AI 回答時才會引用。
      </div>
      <antd.Form layout="vertical" requiredMark={false}>
        <antd.Form.Item label={<span style={{ fontSize: fz(12), color: C.textSub }}>文件名稱</span>} style={{ marginBottom: 16 }}>
          <antd.Input value={title} onChange={function(e) { setTitle(e.target.value); }} placeholder="例：E-101 換件標準程序 v3.1" />
        </antd.Form.Item>
        <antd.Form.Item label={<span style={{ fontSize: fz(12), color: C.textSub }}>來源（Confluence 頁面路徑）</span>} style={{ marginBottom: 16 }}>
          <antd.Input value={source} onChange={function(e) { setSource(e.target.value); }} style={{ fontFamily: 'monospace', fontSize: fz(13) }} />
        </antd.Form.Item>
        <antd.Form.Item label={<span style={{ fontSize: fz(12), color: C.textSub }}>一句話摘要</span>} style={{ marginBottom: 0 }}>
          <antd.Input value={summary} onChange={function(e) { setSummary(e.target.value); }} placeholder="讓課上其他人一眼知道這份在講什麼" />
        </antd.Form.Item>
      </antd.Form>
    </antd.Modal>
  );
}

/* ════════════════════════════════════════
   主頁面
   ════════════════════════════════════════ */
function KnowledgePage({ p }) {
  var { C, fz } = useTheme();
  var [docs, setDocs]           = React.useState(function() { return getKnowledgeDocs(p.key); });
  var [statusFilter, setStatus] = React.useState('all');
  var [searchQuery, setSearch]  = React.useState('');
  var [sortBy, setSortBy]       = React.useState('updated');
  var [selected, setSelected]   = React.useState(null);
  var [showImport, setImport]   = React.useState(false);
  var [roadmapOpen, setRoadmap] = React.useState(false);

  /* persona 切換時重載 */
  React.useEffect(function() {
    setDocs(getKnowledgeDocs(p.key));
    setSelected(null);
    setStatus('all');
    setSearch('');
  }, [p.key]);

  function deleteDoc(id) {
    setDocs(function(prev) { return prev.filter(function(d) { return d.id !== id; }); });
    setSelected(null);
  }

  function handleImport(title, source, summary) {
    var doc = {
      id: 'kd-new-' + Date.now(),
      title: title,
      summary: summary || 'AI 正在解析文件內容…',
      source: source,
      sourceType: 'confluence',
      owner: p.user.name,
      importedBy: p.user.name,
      importedAt: '2026-07-26',
      updatedAt: '2026-07-26',
      status: 'draft',
      tags: ['新引入'],
      usage: 0,
      usedBy: [],
      chunks: [{ id: 'c1', label: 'AI 解析中', content: '正在將頁面內容切分為可檢索的段落，請稍候…', tokens: 0 }],
    };
    setDocs(function(prev) { return [doc].concat(prev); });
    setImport(false);
    setSelected(doc);
  }

  var counts = {};
  KD_STATUSES.forEach(function(s) { counts[s] = docs.filter(function(d) { return d.status === s; }).length; });

  var displayed = docs
    .filter(function(d) { return statusFilter === 'all' || d.status === statusFilter; })
    .filter(function(d) {
      if (!searchQuery.trim()) return true;
      var q = searchQuery.toLowerCase();
      return d.title.toLowerCase().indexOf(q) !== -1
          || (d.summary || '').toLowerCase().indexOf(q) !== -1
          || (d.tags || []).join(' ').toLowerCase().indexOf(q) !== -1;
    })
    .sort(function(a, b) {
      if (sortBy === 'updated') return (b.updatedAt || '').localeCompare(a.updatedAt || '');
      if (sortBy === 'usage')   return (b.usage || 0) - (a.usage || 0);
      if (sortBy === 'name')    return a.title.localeCompare(b.title, 'zh');
      return 0;
    });

  function filterLabel(text, count, active) {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: active ? '#FFFFFF' : C.textMuted, fontWeight: active ? 600 : 400 }}>
        {text}
        <span style={{
          fontSize: fz(10), padding: '0 8px', borderRadius: 999,
          background: active ? 'rgba(255,255,255,0.25)' : C.hover,
          color: active ? '#FFFFFF' : C.textMuted,
        }}>{count}</span>
      </span>
    );
  }

  var statusOptions = [{ value: 'all', label: filterLabel('全部', docs.length, statusFilter === 'all') }].concat(
    KD_STATUSES.map(function(s) {
      return { value: s, label: filterLabel(KD_STATUS_CFG[s].label, counts[s] || 0, statusFilter === s) };
    })
  );

  var columns = [
    {
      title: '狀態', dataIndex: 'status', key: 'status', width: KD_COL_W.status,
      render: function(v) { return <KdStatusTag status={v} />; },
    },
    {
      title: '知識文件', dataIndex: 'title', key: 'title',
      render: function(v, r) {
        return (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: fz(14), color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</div>
            <div style={{ fontSize: fz(12), color: C.textMuted, lineHeight: 1.5, marginTop: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{r.summary}</div>
            {(r.usedBy || []).length > 0 && (
              <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: fz(11), color: C.textMuted }}>被引用：</span>
                {r.usedBy.map(function(u) {
                  return <antd.Tag key={u.id} bordered={false} style={{ marginInlineEnd: 0, fontSize: fz(10), borderRadius: 999, background: C.bgPanel, color: C.textSub }}>{u.title}</antd.Tag>;
                })}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: '負責人', dataIndex: 'owner', key: 'owner', width: KD_COL_W.owner,
      render: function(v) { return <span style={{ fontSize: fz(12), color: C.textSub }}>{v || '—'}</span>; },
    },
    {
      title: '更新', dataIndex: 'updatedAt', key: 'updatedAt', width: KD_COL_W.updated,
      render: function(v) { return <span style={{ fontSize: fz(12), color: C.textMuted }}>{v || '—'}</span>; },
    },
    {
      title: '被檢索', dataIndex: 'usage', key: 'usage', width: KD_COL_W.usage, align: 'right',
      render: function(v) { return <span style={{ fontSize: fz(12), color: C.textMuted }}>{v || 0} 次</span>; },
    },
    {
      title: '操作', key: 'action', width: KD_COL_W.action, align: 'right',
      render: function(_, r) {
        return (
          <span onClick={function(e) { e.stopPropagation(); }}>
            <antd.Popconfirm
              title="確定刪除此知識文件？"
              description={(r.usedBy || []).length > 0 ? '有 ' + r.usedBy.length + ' 個 Skill 正在引用它。' : null}
              okText="刪除" okButtonProps={{ danger: true }} cancelText="取消"
              onConfirm={function() { deleteDoc(r.id); }}
            >
              <antd.Button size="small" danger title="刪除">✕</antd.Button>
            </antd.Popconfirm>
          </span>
        );
      },
    },
  ];

  var toolLabel = { fontSize: fz(11), color: C.textMuted, flexShrink: 0 };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: C.bg }}>

      {/* Header */}
      <div style={{ padding: '8px 24px', borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: fz(14), color: C.text }}>知識管理</div>
          <div style={{ fontSize: fz(12), color: C.textMuted }}>{p.name} · AI 回答與 Skill 研判都引用這裡的內容</div>
        </div>
        <div style={{ flex: 1 }} />
        <antd.Button type="primary" onClick={function() { setImport(true); }}>＋ 從 KM 引入</antd.Button>
      </div>

      {/* 後續方向：Vector + RAG + 知識圖譜（本版不實作，但要講得出來） */}
      <div style={{ padding: '8px 24px', borderBottom: '1px solid ' + C.border, flexShrink: 0 }}>
        <div
          onClick={function() { setRoadmap(function(v) { return !v; }); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
            padding: '8px 16px', borderRadius: 6,
            background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.2)',
          }}
        >
          <span style={{ fontSize: fz(12) }}>🧭</span>
          <span style={{ fontSize: fz(12), fontWeight: 600, color: '#2563EB' }}>後續方向</span>
          <span style={{ fontSize: fz(12), color: C.textSub, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Vector 索引 → RAG 檢索 → 課內自建知識圖譜（本版未實作）
          </span>
          <span style={{ fontSize: fz(10), color: C.textMuted }}>{roadmapOpen ? '▲' : '▼'}</span>
        </div>
        {roadmapOpen && (
          <div style={{ marginTop: 8, padding: '16px 16px', border: '1px solid ' + C.border, borderRadius: 6, background: C.bgSub, fontSize: fz(13), color: C.textSub, lineHeight: 1.8 }}>
            目前的段落切分是人工的，檢索也是關鍵字比對，只夠讓原型展示「AI 引用了哪一份文件」。<br /><br />
            <span style={{ fontWeight: 600, color: C.text }}>規劃中的三步：</span><br />
            <span style={{ fontFamily: 'monospace', fontSize: fz(12) }}>1.</span> 文件進來時自動切分並建 Vector 索引，取代目前的人工分段<br />
            <span style={{ fontFamily: 'monospace', fontSize: fz(12) }}>2.</span> 問答時以語意檢索取回相關段落（RAG），並在回答中標出引用來源<br />
            <span style={{ fontFamily: 'monospace', fontSize: fz(12) }}>3.</span> 讓課上自己把文件、機台、警報碼、Skill 之間的關係連成知識圖譜，讓「這台機的這個警報，課上有哪些相關知識」變成一次查詢<br /><br />
            這三步都不影響現在的資料結構，可以之後再接。
          </div>
        )}
      </div>

      {/* 搜尋 + 排序 */}
      <div style={{ padding: '8px 24px', borderBottom: '1px solid ' + C.border, display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <span style={toolLabel}>搜尋</span>
        <antd.Input
          allowClear value={searchQuery}
          onChange={function(e) { setSearch(e.target.value); }}
          prefix={<span style={{ color: C.textMuted, fontSize: fz(12) }}>🔍</span>}
          placeholder="標題、摘要、標籤…"
          style={{ flex: 1 }}
        />
        <span style={{ ...toolLabel, marginLeft: 8 }}>排序</span>
        <antd.Select
          value={sortBy} onChange={setSortBy} style={{ width: 128, flexShrink: 0 }}
          options={[
            { value: 'updated', label: '最近更新' },
            { value: 'usage',   label: '被檢索最多' },
            { value: 'name',    label: '名稱 A→Z' },
          ]}
        />
      </div>

      {/* 狀態篩選 */}
      <antd.ConfigProvider theme={{ components: { Segmented: { itemSelectedBg: '#2563EB', itemSelectedColor: '#FFFFFF' } } }}>
        <div style={{ padding: '8px 24px', borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, overflowX: 'auto' }} className="scrollbar-none">
          <span style={toolLabel}>狀態</span>
          <antd.Segmented size="small" value={statusFilter} onChange={setStatus} options={statusOptions} />
        </div>
      </antd.ConfigProvider>

      {/* 清單 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 16px' }} className="scrollbar-thin">
        <antd.Table
          columns={columns}
          dataSource={displayed}
          rowKey="id"
          size="small"
          tableLayout="fixed"
          pagination={false}
          locale={{
            emptyText: (
              <antd.Empty
                image={antd.Empty.PRESENTED_IMAGE_SIMPLE}
                description={<span style={{ fontSize: fz(13), color: C.textMuted }}>{searchQuery.trim() ? '沒有符合搜尋條件的知識文件' : '此狀態目前沒有知識文件'}</span>}
                style={{ padding: 32 }}
              />
            ),
          }}
          onRow={function(record) {
            return { style: { cursor: 'pointer' }, onClick: function() { setSelected(record); } };
          }}
        />
      </div>

      {selected && (
        <KnowledgeDocModal
          key={selected.id}
          doc={selected}
          p={p}
          onClose={function() { setSelected(null); }}
          onDelete={function() { deleteDoc(selected.id); }}
        />
      )}

      {showImport && (
        <KnowledgeImportModal p={p} onClose={function() { setImport(false); }} onImport={handleImport} />
      )}
    </div>
  );
}
