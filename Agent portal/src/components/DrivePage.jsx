/* ════════════════════════════════════════
   DRIVE PAGE — 課的雲端硬碟

   三欄式（guideline 硬性規定）：
     左｜導覽   ：快速存取（虛擬檢視）＋ 課的資料夾樹
     中｜列表   ：麵包屑 + 工具列 + 檔案表格
     右｜詳情   ：預覽、溯源、動作（.html 的「嵌入 KPI」在這裡）

   左欄只放導覽、不放警示（沿用 2026-08-02 決議 22 的規則）。
   「已嵌入 KPI」放在左欄是因為它是一種檢視（看得到哪些東西被嵌出去了），
   不是狀態告警。

   資料與讀取層見 data/drive.js。
   ════════════════════════════════════════ */

const DRIVE_COL_W = { origin: 148, owner: 104, updated: 104, size: 88 };

/* 檔案類型的方形 icon —— 列表與詳情共用同一顆 */
function DriveTypeIcon({ type, size }) {
  var { fz } = useTheme();
  var cfg = DRIVE_TYPE_CFG[type] || DRIVE_TYPE_CFG.md;
  var s = size || 24;
  return (
    <div style={{
      width: s, height: s, borderRadius: 6, flexShrink: 0,
      background: cfg.bg, color: cfg.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: fz(Math.round(s * 0.5)), lineHeight: 1,
    }}>{cfg.icon}</div>
  );
}

function DriveOriginTag({ origin }) {
  var { fz } = useTheme();
  if (!origin) return null;
  var cfg = DRIVE_ORIGIN_CFG[origin.kind] || DRIVE_ORIGIN_CFG.upload;
  return (
    <antd.Tag bordered={false} style={{
      marginInlineEnd: 0, borderRadius: 999,
      color: cfg.color, background: cfg.bg,
      fontSize: fz(10), fontWeight: 600, lineHeight: '18px', paddingInline: 8,
    }}>{cfg.label}</antd.Tag>
  );
}

/* 已嵌入 KPI 的徽章 —— 列表與詳情共用，語彙一致 */
function DriveEmbedTag() {
  var { fz } = useTheme();
  return (
    <antd.Tag bordered={false} style={{
      marginInlineEnd: 0, borderRadius: 999,
      color: '#2563EB', background: 'rgba(37,99,235,0.08)',
      fontSize: fz(10), fontWeight: 600, lineHeight: '18px', paddingInline: 8,
    }}>已嵌入 KPI</antd.Tag>
  );
}

/* ── 左欄的一列（快速存取與資料夾共用同一個形狀＝選中語彙一致） ── */
function DriveNavRow({ icon, label, count, active, indent, onClick }) {
  var { C, fz } = useTheme();
  var [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={function () { setHover(true); }}
      onMouseLeave={function () { setHover(false); }}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 16px', paddingLeft: 16 + (indent || 0) * 16,
        cursor: 'pointer',
        background: active ? C.hoverAccent : hover ? C.hover : 'transparent',
        borderLeft: active ? '3px solid #2563EB' : '3px solid transparent',
      }}
    >
      <span style={{ fontSize: fz(13), color: active ? '#2563EB' : C.textMuted, width: 16, flexShrink: 0 }}>{icon}</span>
      <span style={{
        flex: 1, minWidth: 0, fontSize: fz(13),
        fontWeight: active ? 600 : 400,
        color: active ? '#2563EB' : C.textSub,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>{label}</span>
      {typeof count === 'number' && (
        <span style={{ fontSize: fz(11), color: C.textMuted, flexShrink: 0 }}>{count}</span>
      )}
    </div>
  );
}

/* ── 右欄：沒選東西時的空狀態 ── */
function DriveDetailEmpty() {
  var { C, fz } = useTheme();
  return (
    <div style={{ padding: 24, fontSize: fz(12), color: C.textMuted, lineHeight: 1.8 }}>
      左邊選一個檔案，這裡會顯示它的預覽、是哪一次執行產出的，以及可以對它做什麼。
    </div>
  );
}

/* ════════════════════════════════════════
   右欄詳情
   ════════════════════════════════════════ */
function DriveDetail({ file, embedded, onToggleEmbed, onGoKpi, onGoNav, onNotice }) {
  var { C, fz } = useTheme();
  if (!file) return <DriveDetailEmpty />;

  var cfg = DRIVE_TYPE_CFG[file.type] || DRIVE_TYPE_CFG.md;
  var canEmbed = isDriveEmbeddable(file);
  var originCfg = file.origin ? (DRIVE_ORIGIN_CFG[file.origin.kind] || DRIVE_ORIGIN_CFG.upload) : null;

  return (
    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }} className="scrollbar-thin">

      {/* 標題區 */}
      <div style={{ padding: 16, borderBottom: '1px solid ' + C.border }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <DriveTypeIcon type={file.type} size={32} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: fz(14), fontWeight: 600, color: C.text, wordBreak: 'break-all', lineHeight: 1.5 }}>
              {file.name}
            </div>
            <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 2 }}>
              {cfg.label} · {file.size || '—'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
          <DriveOriginTag origin={file.origin} />
          {embedded && <DriveEmbedTag />}
        </div>
      </div>

      {/* 預覽 —— html 直接以 iframe 渲染真的那份檔案（與 KPI 頁嵌的是同一份） */}
      <div style={{ padding: 16, borderBottom: '1px solid ' + C.border }}>
        <div style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted, letterSpacing: '0.08em', marginBottom: 8 }}>預覽</div>
        {canEmbed ? (
          <div style={{
            height: 176, border: '1px solid ' + C.border, borderRadius: 6,
            overflow: 'hidden', background: '#FFFFFF', position: 'relative',
          }}>
            <iframe
              title={file.name}
              srcDoc={file.html}
              sandbox=""
              style={{
                border: 'none', width: 576, height: 440,
                transform: 'scale(0.4833)', transformOrigin: 'top left',
                pointerEvents: 'none',
              }}
            />
          </div>
        ) : (
          <div style={{
            height: 88, border: '1px solid ' + C.border, borderRadius: 6,
            background: C.bgPanel, display: 'flex', alignItems: 'center',
            justifyContent: 'center', gap: 8,
            fontSize: fz(12), color: C.textMuted,
          }}>
            <DriveTypeIcon type={file.type} size={24} />
            {cfg.label} 檔案，本版不提供站內預覽
          </div>
        )}
      </div>

      {/* 這份東西哪來的 —— Drive 與其他模組的接縫，AI 產出一定看得到出處 */}
      <div style={{ padding: 16, borderBottom: '1px solid ' + C.border }}>
        <div style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted, letterSpacing: '0.08em', marginBottom: 8 }}>來源</div>
        <antd.Descriptions
          column={1} size="small" colon={false}
          labelStyle={{ fontSize: fz(11), color: C.textMuted, width: 64 }}
          contentStyle={{ fontSize: fz(12), color: C.text }}
          items={[
            { key: 'from',  label: '產出於', children: file.origin ? file.origin.label : '—' },
            { key: 'by',    label: '產出者', children: file.origin ? file.origin.by : (file.owner || '—') },
            { key: 'at',    label: '時間',   children: file.updatedAt || '—' },
            { key: 'where', label: '位置',   children: (
              <span style={{ fontFamily: 'monospace', fontSize: fz(11), wordBreak: 'break-all' }}>
                {'/' + (file.folderPath || '').split(' / ').join('/')}
              </span>
            ) },
          ]}
        />
        {originCfg && originCfg.nav && (
          <antd.Button
            size="small" block style={{ marginTop: 8 }}
            onClick={function () { onGoNav(originCfg.nav); }}
          >
            ↗ 看這次執行紀錄
          </antd.Button>
        )}
      </div>

      {/* 動作 */}
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted, letterSpacing: '0.08em' }}>動作</div>

        {/* ── 功能連結：.html → KPI 報表中心 ──
            嵌入是可逆的開關，取消嵌入不會刪檔（檔案還在 Drive）。 */}
        {canEmbed && !embedded && (
          <antd.Button type="primary" block onClick={function () { onToggleEmbed(file.id); }}>
            嵌入 KPI 報表
          </antd.Button>
        )}
        {canEmbed && embedded && (
          <React.Fragment>
            <antd.Button type="primary" block onClick={function () { onGoKpi(file.id); }}>
              在 KPI 報表中心檢視
            </antd.Button>
            <antd.Button block onClick={function () { onToggleEmbed(file.id); }}>
              取消嵌入
            </antd.Button>
          </React.Fragment>
        )}
        {!canEmbed && (
          <div style={{
            fontSize: fz(11), color: C.textMuted, lineHeight: 1.8,
            padding: 8, background: C.bgPanel, borderRadius: 6, border: '1px solid ' + C.border,
          }}>
            只有 .html 的產出可以嵌進 KPI 報表中心。
          </div>
        )}

        <antd.Button block onClick={function () { onNotice('示意原型：本版不提供實際下載。'); }}>下載</antd.Button>
        <antd.Button block onClick={function () { onNotice('示意原型：分享設定尚未實作。'); }}>分享給課內成員</antd.Button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   DrivePage — Main
   ════════════════════════════════════════ */
function DrivePage({ p, embedIds, onToggleEmbed, onGoKpi, onGoNav }) {
  var { C, fz } = useTheme();
  var app = antd.App.useApp();

  /* view: 'folder'（真的在資料夾裡）｜其餘為虛擬檢視（攤平後篩選） */
  var [view, setView]     = React.useState('agent');
  var [path, setPath]     = React.useState([]);
  var [selId, setSelId]   = React.useState(null);
  var [search, setSearch] = React.useState('');

  var embeds = embedIds || [];
  var allFiles = React.useMemo(function () { return flattenDriveFiles(p.key); }, [p.key]);
  var quota = getDriveQuota(p.key);
  var rootFolders = getDriveRoot(p.key).filter(function (n) { return n.type === 'folder'; });
  var agentFolder = rootFolders.filter(function (n) { return n.name === DRIVE_AGENT_FOLDER; })[0];

  var agentFileCount = allFiles.filter(function (f) {
    return agentFolder && f.folderIds.indexOf(agentFolder.id) >= 0;
  }).length;

  function notice(msg) {
    if (app && app.message) app.message.info(msg);
  }

  /* 進資料夾 */
  function openFolder(folderIds) {
    setView('folder');
    setPath(folderIds);
    setSelId(null);
  }

  /* 本層要顯示的列 —— 資料夾檢視含子資料夾，虛擬檢視只有檔案 */
  var rows = React.useMemo(function () {
    var list;
    if (view === 'folder') {
      list = getDriveChildren(p.key, path);
    } else if (view === 'agent') {
      list = allFiles.filter(function (f) { return agentFolder && f.folderIds.indexOf(agentFolder.id) >= 0; });
    } else if (view === 'embedded') {
      list = allFiles.filter(function (f) { return embeds.indexOf(f.id) >= 0; });
    } else {
      list = allFiles.slice(0, 8);
    }
    var q = search.trim().toLowerCase();
    if (q) list = list.filter(function (n) { return n.name.toLowerCase().indexOf(q) >= 0; });
    return list;
  }, [view, path, p.key, search, allFiles, embeds, agentFolder]);

  var selected = selId ? getDriveFileById(p.key, selId) : null;

  /* 麵包屑：資料夾檢視走真路徑，虛擬檢視顯示這個檢視在看什麼 */
  var VIEW_TITLE = {
    agent:    { title: DRIVE_AGENT_FOLDER, sub: 'AI 產出的 artifact 一律落在這裡，不可改名、不可刪除' },
    embedded: { title: '已嵌入 KPI',        sub: '這些 .html 產出正在 KPI 報表中心展示' },
    recent:   { title: '最近更新',          sub: '課內最近有異動的檔案' },
  };

  function breadcrumbItems() {
    var items = [{ title: (<span style={{ cursor: 'pointer' }} onClick={function () { openFolder([]); }}>{p.name}</span>) }];
    var nodes = getDriveRoot(p.key);
    var acc = [];
    path.forEach(function (fid) {
      var node = nodes.filter(function (n) { return n.id === fid; })[0];
      if (!node) return;
      acc = acc.concat([fid]);
      var here = acc.slice();
      items.push({ title: (<span style={{ cursor: 'pointer' }} onClick={function () { openFolder(here); }}>{node.name}</span>) });
      nodes = node.children || [];
    });
    return items;
  }

  var columns = [
    {
      title: '名稱', dataIndex: 'name', key: 'name', ellipsis: true,
      render: function (name, row) {
        var isFolder = row.type === 'folder';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <DriveTypeIcon type={row.type} size={24} />
            <span
              onClick={function (e) {
                if (!isFolder) return;
                e.stopPropagation();
                openFolder(view === 'folder' ? path.concat([row.id]) : (row.folderIds || []).concat([row.id]));
              }}
              style={{
                fontSize: fz(13),
                color: selId === row.id ? '#2563EB' : C.text,
                fontWeight: (isFolder || selId === row.id) ? 600 : 400,
                cursor: isFolder ? 'pointer' : 'default',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
            >{name}</span>
            {row.system && (
              <antd.Tag bordered={false} style={{
                marginInlineEnd: 0, borderRadius: 999, flexShrink: 0,
                fontSize: fz(10), lineHeight: '18px', paddingInline: 8,
                color: C.textMuted, background: C.bgPanel,
              }}>系統資料夾</antd.Tag>
            )}
            {embeds.indexOf(row.id) >= 0 && <DriveEmbedTag />}
          </div>
        );
      },
    },
    {
      title: '來源', key: 'origin', width: DRIVE_COL_W.origin,
      render: function (_, row) {
        if (row.type === 'folder') return <span style={{ fontSize: fz(12), color: C.textMuted }}>—</span>;
        return <DriveOriginTag origin={row.origin} />;
      },
    },
    {
      title: '擁有者', dataIndex: 'owner', key: 'owner', width: DRIVE_COL_W.owner,
      render: function (v) { return <span style={{ fontSize: fz(12), color: C.textSub }}>{v || '—'}</span>; },
    },
    {
      title: '修改時間', dataIndex: 'updatedAt', key: 'updatedAt', width: DRIVE_COL_W.updated,
      render: function (v) { return <span style={{ fontSize: fz(12), color: C.textMuted }}>{v || '—'}</span>; },
    },
    {
      title: '大小', dataIndex: 'size', key: 'size', width: DRIVE_COL_W.size, align: 'right',
      render: function (v, row) {
        return <span style={{ fontSize: fz(12), color: C.textMuted }}>{row.type === 'folder' ? '—' : (v || '—')}</span>;
      },
    },
  ];

  return (
    <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>

      {/* ════ 左｜導覽 ════ */}
      <div style={{
        width: 240, borderRight: '1px solid ' + C.border, flexShrink: 0,
        display: 'flex', flexDirection: 'column', background: C.bg,
      }}>
        <div style={{ padding: 16, borderBottom: '1px solid ' + C.border, flexShrink: 0 }}>
          <div style={{ fontSize: fz(13), fontWeight: 700, color: C.text }}>課的雲端硬碟</div>
          <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 2 }}>{p.name}</div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }} className="scrollbar-thin">
          <div style={{
            fontSize: fz(10), fontWeight: 700, color: C.textMuted,
            letterSpacing: '0.08em', padding: '8px 16px 4px',
          }}>快速存取</div>
          <DriveNavRow icon="✦" label={DRIVE_AGENT_FOLDER} count={agentFileCount}
            active={view === 'agent'} onClick={function () { setView('agent'); setSelId(null); }} />
          <DriveNavRow icon="◈" label="已嵌入 KPI" count={embeds.length}
            active={view === 'embedded'} onClick={function () { setView('embedded'); setSelId(null); }} />
          <DriveNavRow icon="◷" label="最近更新"
            active={view === 'recent'} onClick={function () { setView('recent'); setSelId(null); }} />

          <div style={{
            fontSize: fz(10), fontWeight: 700, color: C.textMuted,
            letterSpacing: '0.08em', padding: '16px 16px 4px',
          }}>資料夾</div>
          <DriveNavRow icon="▤" label={p.name}
            active={view === 'folder' && path.length === 0}
            onClick={function () { openFolder([]); }} />
          {rootFolders.map(function (f) {
            return (
              <DriveNavRow
                key={f.id} icon="▧" label={f.name} indent={1}
                active={view === 'folder' && path[0] === f.id}
                onClick={function () { openFolder([f.id]); }}
              />
            );
          })}
        </div>

        {/* 容量 —— 硬碟該有的東西，也順便說明「以課為單位」的配額 */}
        <div style={{ padding: 16, borderTop: '1px solid ' + C.border, flexShrink: 0 }}>
          <div style={{ fontSize: fz(11), color: C.textMuted, marginBottom: 8 }}>
            已使用 {quota.usedLabel} / {quota.totalLabel}
          </div>
          <antd.Progress percent={quota.percent} showInfo={false} size="small" strokeColor="#2563EB" />
          <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 8 }}>配額以課為單位計算</div>
        </div>
      </div>

      {/* ════ 中｜列表 ════ */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* 工具列 */}
        <div style={{
          height: 48, flexShrink: 0, padding: '0 16px',
          borderBottom: '1px solid ' + C.border,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {view === 'folder' ? (
            <antd.Breadcrumb items={breadcrumbItems()} style={{ fontSize: fz(13) }} />
          ) : (
            <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>{VIEW_TITLE[view].title}</span>
          )}
          <div style={{ flex: 1 }} />
          <antd.Input
            size="small" value={search} allowClear
            onChange={function (e) { setSearch(e.target.value); }}
            aria-label="搜尋檔案" placeholder="檔案名稱"
            style={{ width: 176 }}
          />
          <antd.Button size="small" onClick={function () { notice('示意原型：本版不提供新增資料夾。'); }}>新增資料夾</antd.Button>
          <antd.Button size="small" type="primary" onClick={function () { notice('示意原型：本版不提供上傳。'); }}>上傳</antd.Button>
        </div>

        {/* 檢視說明：只有虛擬檢視需要一句話講清楚在看什麼 */}
        {view !== 'folder' && (
          <div style={{
            padding: '8px 16px', flexShrink: 0,
            borderBottom: '1px solid ' + C.border, background: C.bgSub,
            fontSize: fz(11), color: C.textMuted,
          }}>{VIEW_TITLE[view].sub}</div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }} className="scrollbar-thin dv-list">
          <antd.Table
            columns={columns}
            dataSource={rows}
            rowKey="id"
            size="small"
            pagination={false}
            locale={{ emptyText: (
              <antd.Empty
                image={antd.Empty.PRESENTED_IMAGE_SIMPLE}
                description={<span style={{ fontSize: fz(12), color: C.textMuted }}>
                  {view === 'embedded' ? '還沒有任何產出被嵌到 KPI 報表中心。' : '這個位置沒有檔案。'}
                </span>}
              />
            ) }}
            rowClassName={function (row) { return selId === row.id ? 'dv-row-selected' : ''; }}
            onRow={function (row) {
              return {
                onClick: function () { if (row.type !== 'folder') setSelId(row.id); },
                style: { cursor: row.type === 'folder' ? 'default' : 'pointer' },
              };
            }}
          />
        </div>
      </div>

      {/* ════ 右｜詳情 ════ */}
      <div style={{
        width: 320, flexShrink: 0, borderLeft: '1px solid ' + C.border,
        background: C.bgPanel, display: 'flex', flexDirection: 'column', minHeight: 0,
      }}>
        <div style={{
          height: 48, flexShrink: 0, padding: '0 16px',
          borderBottom: '1px solid ' + C.border,
          display: 'flex', alignItems: 'center',
        }}>
          <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>詳情</span>
        </div>
        <DriveDetail
          file={selected}
          embedded={!!selected && embeds.indexOf(selected.id) >= 0}
          onToggleEmbed={function (id) {
            var was = embeds.indexOf(id) >= 0;
            onToggleEmbed(id);
            notice(was ? '已從 KPI 報表中心移除。' : '已嵌入 KPI 報表中心，可在 KPI 頁的「AI 產出報表」看到。');
          }}
          onGoKpi={onGoKpi}
          onGoNav={onGoNav}
          onNotice={notice}
        />
      </div>
    </div>
  );
}
