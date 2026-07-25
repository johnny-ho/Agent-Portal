/* ════════════════════════════════════════
   SETTING PAGE（Seed 後台）
   5 tabs：權限管理 / 課佈告欄 / KPI Summary / Application / 知識管理
   ════════════════════════════════════════ */

/* ── Permissions Mock Data（By User only） ── */
var PERM_CONFIG_BY_PERSONA = {
  equipment: {
    seed: {
      users: [
        { name: '王志明', avatar: '王', empId: 'W302488', deptCode: 'EQPM-01', since: '2025-08', online: true,  isDefault: true, note: '課長，系統自動設為 Seed' },
      ],
    },
    member: {
      users: [
        { name: '吳志豪', avatar: '吳', empId: 'W287341', deptCode: 'EQPM-02', since: '2025-08', online: true  },
        { name: '張文凱', avatar: '張', empId: 'W295012', deptCode: 'EQPM-03', since: '2025-10', online: true  },
        { name: '陳宗賢', avatar: '陳', empId: 'W318942', deptCode: 'EQPM-05', since: '2026-01', online: false },
      ],
    },
    viewer: {
      users: [],
    },
  },
  process: {
    seed: {
      users: [
        { name: '蔡明哲', avatar: '蔡', empId: 'W262183', deptCode: 'PROC-04', since: '2025-07', online: true,  isDefault: true, note: '課長，系統自動設為 Seed' },
        { name: '林美玲', avatar: '林', empId: 'L241893', deptCode: 'PROC-01', since: '2025-09', online: true  },
      ],
    },
    member: {
      users: [
        { name: '黃俊傑', avatar: '黃', empId: 'W278654', deptCode: 'PROC-02', since: '2025-09', online: true  },
        { name: '劉靜文', avatar: '劉', empId: 'L319274', deptCode: 'PROC-03', since: '2026-02', online: false },
      ],
    },
    viewer: {
      users: [
        { name: '洪家豪', avatar: '洪', empId: 'W281064', deptCode: 'MFGS-03', since: '2026-03', online: true, note: '製造課課長，有查看權' },
      ],
    },
  },
  mfg: {
    seed: {
      users: [
        { name: '洪家豪', avatar: '洪', empId: 'W281064', deptCode: 'MFGS-03', since: '2025-08', online: true,  isDefault: true, note: '課長，系統自動設為 Seed' },
        { name: '鄭志強', avatar: '鄭', empId: 'W309812', deptCode: 'MFGS-01', since: '2025-11', online: true  },
      ],
    },
    member: {
      users: [
        { name: '許雅婷', avatar: '許', empId: 'L294731', deptCode: 'MFGS-02', since: '2026-01', online: false },
      ],
    },
    viewer: {
      users: [],
    },
  },
};

var ROLE_CFG = {
  seed:   { label: 'Seed',   color: '#2563EB', bg: 'rgba(37,99,235,0.08)',   border: 'rgba(37,99,235,0.2)'   },
  member: { label: 'Member', color: '#374151', bg: '#F5F5F5',                border: '#E0E0E0'               },
  viewer: { label: 'Viewer', color: '#6B7280', bg: 'rgba(158,158,158,0.08)', border: 'rgba(158,158,158,0.25)' },
};

var BLACKLIST_DATA = [
  { name: '前員工 A', account: 'X194823',  reason: '離職撤銷', createdBy: '王志明', since: '2025-12' },
  { name: '外包帳號',  account: 'CONT-029', reason: '合約到期', createdBy: '李建宏', since: '2026-01' },
];

var ROLE_PERM_MATRIX = [
  { feature: '查看成員列表',      seed: true,  member: true,  viewer: true  },
  { feature: '邀請 / 移除成員',  seed: true,  member: false, viewer: false },
  { feature: '變更成員角色',      seed: true,  member: false, viewer: false },
  { feature: '編輯 Dashboard',    seed: true,  member: true,  viewer: false },
  { feature: '存取 KPI 資料',    seed: true,  member: true,  viewer: true  },
  { feature: '管理知識庫',        seed: true,  member: false, viewer: false },
  { feature: '新增 / 編輯 Skill',  seed: true,  member: true,  viewer: false },
  { feature: '查看 Skill',          seed: true,  member: true,  viewer: true  },
  { feature: '發布課內公告',      seed: true,  member: false, viewer: false },
  { feature: '使用 AI Chat',      seed: true,  member: true,  viewer: true  },
  { feature: '建立排程任務',      seed: true,  member: true,  viewer: false },
];

/* ── Bulletin Mock Data ── */
var BULLETIN_DATA_BY_PERSONA = {
  equipment: [
    { id: 'b-001', title: '本週五 E-308 PM 停機公告', content: 'E-308 週五 14:00–18:00 進行季度 PM，請相關人員安排備援計畫，停機期間產能排程已通知 MFG 課。', audience: '全員', pinned: true,  status: 'published', author: '王志明', createdAt: '2026-04-23', publishedAt: '2026-04-23' },
    { id: 'b-002', title: 'FDC Level-2 門檻值調整說明', content: '自 4/25 起 FDC Level-2 門檻值依新 Skill-E-112 調整，請各 EE 確認熟悉新參數設定。', audience: 'EE', pinned: false, status: 'published', author: '王志明', createdAt: '2026-04-22', publishedAt: '2026-04-22' },
    { id: 'b-003', title: '5 月新人 Onboarding 課程安排', content: '5 月份新人教育訓練課程已排定，請各組長於 4/30 前確認出席名單並回覆。', audience: '全員', pinned: false, status: 'draft',     author: '王志明', createdAt: '2026-04-24', publishedAt: null },
  ],
  process: [
    { id: 'b-101', title: 'CMP-3 SPC OOC 處理進度更新', content: 'CMP-3 站點 Nelson Rule 2 OOC 已完成根因分析，臨時製程參數調整已生效，待驗證中。', audience: 'PE', pinned: true,  status: 'published', author: '蔡明哲', createdAt: '2026-04-24', publishedAt: '2026-04-24' },
    { id: 'b-102', title: 'DCR-039 審核提醒',             content: 'R-512 壓力參數調整 DCR 待審，請相關人員於本週五前完成審核確認。', audience: 'PE', pinned: false, status: 'published', author: '蔡明哲', createdAt: '2026-04-22', publishedAt: '2026-04-22' },
    { id: 'b-103', title: '製程課 Q2 目標說明草稿',       content: 'Q2 良率目標說明待課長確認後發布，目前為草稿。', audience: '全員', pinned: false, status: 'draft',     author: '蔡明哲', createdAt: '2026-04-25', publishedAt: null },
  ],
  mfg: [
    { id: 'b-201', title: '產能排程異動通知',             content: 'E-101 停機影響 Line3 今日產出，排程已調整，詳見 MES 最新版排程。', audience: '全員', pinned: true,  status: 'published', author: '洪家豪', createdAt: '2026-04-24', publishedAt: '2026-04-24' },
    { id: 'b-202', title: 'Priority Lot W26-031 催單',    content: 'W26-031 交期今日 18:00，請確認現場進度並即時回報狀態。', audience: 'MFG', pinned: false, status: 'published', author: '洪家豪', createdAt: '2026-04-25', publishedAt: '2026-04-25' },
    { id: 'b-203', title: '5 月排班草稿',                 content: '5 月排班草稿已完成，待最終確認後發布。', audience: '全員', pinned: false, status: 'draft',     author: '鄭志強', createdAt: '2026-04-25', publishedAt: null },
  ],
};

/* ── App Groups Mock Data ── */
var APP_LIBRARY = [
  { id: 'fdc',  label: 'FDC Console',    url: 'fdc.internal'      },
  { id: 'tc',   label: 'Tool Center',    url: 'toolctr.internal'  },
  { id: 'spc',  label: 'SPC Console',    url: 'spc.internal'      },
  { id: 'mes',  label: 'MES 生產系統',   url: 'mes.internal'      },
  { id: 'case', label: 'Case Center',    url: 'case.internal'     },
  { id: 'lot',  label: 'Lot Center',     url: 'lot.internal'      },
  { id: 'wip',  label: 'WIP Tracker',    url: 'wip.internal'      },
  { id: 'dcr',  label: 'DCR System',     url: 'dcr.internal'      },
  { id: 'edx',  label: 'EDX 訓練系統',  url: 'edx.internal'      },
  { id: 'cmms', label: 'CMMS',           url: 'cmms.internal'     },
];

var APP_GROUPS_BY_PERSONA = {
  equipment: [
    { id: 'g-001', name: 'EE 核心工具', apps: [
      { id: 'fdc',  label: 'FDC Console',  url: 'fdc.internal',     required: true  },
      { id: 'tc',   label: 'Tool Center',  url: 'toolctr.internal', required: false },
    ]},
    { id: 'g-002', name: '跨課協作', apps: [
      { id: 'case', label: 'Case Center',  url: 'case.internal',    required: true  },
      { id: 'spc',  label: 'SPC Console',  url: 'spc.internal',     required: false },
    ]},
    { id: 'g-003', name: '生產系統', apps: [
      { id: 'mes',  label: 'MES 生產系統', url: 'mes.internal',     required: false },
    ]},
  ],
  process: [
    { id: 'g-101', name: 'PE 核心工具', apps: [
      { id: 'spc',  label: 'SPC Console',  url: 'spc.internal',    required: true  },
      { id: 'lot',  label: 'Lot Center',   url: 'lot.internal',    required: false },
    ]},
    { id: 'g-102', name: '跨課協作', apps: [
      { id: 'case', label: 'Case Center',  url: 'case.internal',   required: true  },
      { id: 'mes',  label: 'MES 生產系統', url: 'mes.internal',    required: false },
    ]},
  ],
  mfg: [
    { id: 'g-201', name: 'MFG 核心工具', apps: [
      { id: 'mes',  label: 'MES 生產系統', url: 'mes.internal',    required: true  },
      { id: 'lot',  label: 'Lot Center',   url: 'lot.internal',    required: true  },
      { id: 'wip',  label: 'WIP Tracker',  url: 'wip.internal',    required: false },
    ]},
    { id: 'g-202', name: '跨課協作', apps: [
      { id: 'case', label: 'Case Center',  url: 'case.internal',   required: true  },
    ]},
  ],
};

/* ── 共用 Badge ── */
function RoleBadge({ role}) {
  var { C, fz } = useTheme();
  var cfg = ROLE_CFG[role] || ROLE_CFG.member;
  return (
    <span style={{
      fontSize: fz(11), fontWeight: 600, padding: '2px 8px',
      borderRadius: 999, border: '1px solid ' + cfg.border,
      background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap',
    }}>{cfg.label}</span>
  );
}


/* ═══════════════════════════════════
   Tab 1：權限管理（By User Only）
   ═══════════════════════════════════ */
function PermissionsTab({ p}) {
  var { C, fz } = useTheme();
  var config = PERM_CONFIG_BY_PERSONA[p.key] || PERM_CONFIG_BY_PERSONA.equipment;
  var [subTab, setSubTab]   = React.useState('members');
  var [roleOpen, setRoleOpen] = React.useState({ seed: true, member: true, viewer: false });
  var [inviteRole, setInviteRole]   = React.useState(null);
  var [inviteEmail, setInviteEmail] = React.useState('');

  var SUB_TABS = [
    { key: 'members',   label: '成員管理' },
  ];

  var ROLES = [
    { key: 'seed',   label: 'Seed',   desc: '完整管理與配置權限',   accentColor: '#2563EB' },
    { key: 'member', label: 'Member', desc: '可存取並編輯課內資料', accentColor: '#374151' },
    { key: 'viewer', label: 'Viewer', desc: '僅限查看，不可編輯',   accentColor: '#9E9E9E' },
  ];

  var stats = {
    seedCount:   config.seed.users.length,
    memberCount: config.member.users.length,
    viewerCount: config.viewer.users.length,
  };

  function DefaultBadge() {
    return (
      <span style={{
        fontSize: fz(10), fontWeight: 700, padding: '1px 6px', borderRadius: 999,
        background: 'rgba(37,99,235,0.08)', color: '#2563EB',
        border: '1px solid rgba(37,99,235,0.2)', marginLeft: 6, whiteSpace: 'nowrap',
      }}>預設</span>
    );
  }

  /* ── By User 區塊（唯一成員加入方式）── AntD Table（Phase 1 遷移） */
  function UserBlock({ roleKey, users }) {
    var cfg = ROLE_CFG[roleKey];
    var isInviteOpen = inviteRole === roleKey;
    var color = cfg.color;

    var columns = [
      { title: '', dataIndex: 'avatar', width: 44,
        render: function(_, u){ return <Avatar char={u.avatar} size={22} color={color} />; } },
      { title: 'User No', dataIndex: 'empId', width: 160,
        render: function(_, u){ return (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: fz(12), color: C.textSub, fontFamily: 'monospace' }}>{u.deptCode} | {u.empId}</span>
            {u.isDefault && <DefaultBadge />}
          </span>
        ); } },
      { title: '姓名', dataIndex: 'name',
        render: function(_, u){ return (
          <span style={{ fontSize: fz(13), fontWeight: 500, color: C.text }}>
            {u.name}
            {u.note && <span style={{ fontSize: fz(11), color: C.textMuted, fontWeight: 400, marginLeft: 8 }}>{u.note}</span>}
          </span>
        ); } },
      { title: '加入時間', dataIndex: 'since', width: 120,
        render: function(v){ return <span style={{ fontSize: fz(12), color: C.textMuted, fontFamily: 'monospace' }}>{v}</span>; } },
      { title: '狀態', dataIndex: 'online', width: 84,
        render: function(v){ return (
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: v ? '#22C55E' : C.border, flexShrink: 0 }} />
            <span style={{ fontSize: fz(11), color: v ? '#22C55E' : C.textMuted }}>{v ? '在線' : '離線'}</span>
          </span>
        ); } },
      { title: '操作', dataIndex: 'op', width: 88,
        render: function(_, u){ return u.isDefault
          ? <span style={{ fontSize: fz(11), color: C.textMuted }}>系統預設</span>
          : <antd.Button size="small" danger>移除</antd.Button>; } },
    ];

    return (
      <div>
        {/* block header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: C.bgSub, borderBottom: '1px solid ' + C.border }}>
          <span style={{ fontSize: fz(13), color: C.textSub }}>{users.length} 位成員</span>
          <antd.Button size="small" onClick={function(){ setInviteRole(isInviteOpen ? null : roleKey); }}
            style={{ marginLeft: 'auto', color: color, borderColor: color }}>＋ 新增成員</antd.Button>
        </div>

        {/* invite input row */}
        {isInviteOpen && (
          <div style={{
            padding: '10px 16px', borderBottom: '1px solid ' + C.border,
            display: 'flex', gap: 8, alignItems: 'center', background: 'rgba(37,99,235,0.03)',
          }}>
            <antd.Input placeholder="輸入員工帳號或 Email…"
              value={inviteEmail} onChange={function(e){ setInviteEmail(e.target.value); }}
              style={{ flex: 1 }} />
            <antd.Button type="primary" onClick={function(){ setInviteRole(null); setInviteEmail(''); }}>送出</antd.Button>
            <antd.Button onClick={function(){ setInviteRole(null); setInviteEmail(''); }}>取消</antd.Button>
          </div>
        )}

        {users.length > 0 && (
          <antd.Table columns={columns} dataSource={users} rowKey="name" pagination={false} size="small" />
        )}

        {users.length === 0 && !isInviteOpen && (
          <div style={{ padding: '16px', fontSize: fz(13), color: C.textMuted }}>尚未個別指定任何人員</div>
        )}
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* sub-tab */}
      <div style={{ padding: '16px 24px 0', borderBottom: '1px solid ' + C.border, flexShrink: 0, background: C.bg }}>
        <div style={{ display: 'inline-flex', gap: 4, background: C.bgPanel, borderRadius: 999, padding: 3 }}>
          {SUB_TABS.map(function(t) {
            var active = subTab === t.key;
            return (
              <button key={t.key} onClick={function(){ setSubTab(t.key); }} style={{
                padding: '5px 16px', borderRadius: 999, border: 'none', cursor: 'pointer',
                fontSize: fz(13), fontWeight: active ? 600 : 400,
                background: active ? '#2563EB' : 'transparent',
                color: active ? '#FFFFFF' : C.textSub,
                transition: 'all 0.15s',
              }}>{t.label}</button>
            );
          })}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

        {/* ══ 成員管理 ══ */}
        {subTab === 'members' && (
          <div>
            {/* Section info bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px',
              background: C.bgPanel, border: '1px solid ' + C.border, borderRadius: 8, marginBottom: 16,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: p.accentBg,
                border: '1px solid ' + p.accentBorder, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: fz(18),
              }}>{p.icon}</div>
              <div>
                <div style={{ fontSize: fz(14), fontWeight: 600, color: C.text }}>{p.name}</div>
                <div style={{ fontSize: fz(12), color: C.textMuted, marginTop: 2 }}>{p.dept}</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 24 }}>
                {[
                  { v: stats.seedCount,   label: 'Seed',   color: '#2563EB' },
                  { v: stats.memberCount, label: 'Member', color: C.textSub },
                  { v: stats.viewerCount, label: 'Viewer', color: C.textMuted },
                ].map(function(s) {
                  return (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: fz(18), fontWeight: 700, color: s.color }}>{s.v}</div>
                      <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 2 }}>{s.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 三個角色區塊 */}
            {ROLES.map(function(role) {
              var roleData = config[role.key];
              var cfg = ROLE_CFG[role.key];
              var isOpen = roleOpen[role.key];

              return (
                <div key={role.key} style={{ border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                  {/* 角色大標題列 */}
                  <div
                    onClick={function(){ setRoleOpen(function(s){ var n = Object.assign({}, s); n[role.key] = !s[role.key]; return n; }); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                      background: isOpen ? cfg.bg : C.bgSub,
                      borderBottom: isOpen ? '1px solid ' + C.border : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: fz(12), color: C.textMuted }}>{isOpen ? '▼' : '▶'}</span>
                    <RoleBadge role={role.key} />
                    <span style={{ fontSize: fz(13), color: C.textMuted }}>{role.desc}</span>
                    <span style={{ marginLeft: 'auto', fontSize: fz(11), color: C.textMuted }}>
                      {roleData.users.length > 0 ? roleData.users.length + ' 人' : '尚未設定'}
                    </span>
                  </div>

                  {isOpen && <UserBlock roleKey={role.key} users={roleData.users} />}
                </div>
              );
            })}

            <div style={{ padding: '12px 16px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, fontSize: fz(13), color: '#92400E' }}>
              ⚠ 一個 Section 可設多位 Seed，避免單點失敗。課長帳號預設自動設為 Seed，不可刪除。
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   Tab 2：課佈告欄（公告 CRUD）
   ═══════════════════════════════════ */
var AUDIENCE_OPTIONS = ['全員', 'EE', 'PE', 'MFG'];

var AUDIENCE_CFG = {
  '全員': { bg: 'rgba(37,99,235,0.08)',  color: '#2563EB', border: 'rgba(37,99,235,0.2)'  },
  'EE':   { bg: 'rgba(34,197,94,0.08)',  color: '#16A34A', border: 'rgba(34,197,94,0.2)'  },
  'PE':   { bg: 'rgba(245,158,11,0.08)', color: '#D97706', border: 'rgba(245,158,11,0.2)' },
  'MFG':  { bg: 'rgba(139,92,246,0.08)', color: '#7C3AED', border: 'rgba(139,92,246,0.2)' },
};

var EMPTY_FORM = { title: '', content: '', audience: '全員', pinned: false };

function BulletinSettingTab({ p}) {
  var { C, fz } = useTheme();
  var initData = (BULLETIN_DATA_BY_PERSONA[p.key] || []).slice();
  var [bulletins, setBulletins] = React.useState(initData);
  var [mode, setMode]           = React.useState(null);   // null | 'new' | string(id)
  var [form, setForm]           = React.useState(EMPTY_FORM);
  var [nextId, setNextId]       = React.useState(900);

  /* 打開新增表單 */
  function openNew() {
    setForm(EMPTY_FORM);
    setMode('new');
  }

  /* 打開編輯表單 */
  function openEdit(b) {
    setForm({ title: b.title, content: b.content, audience: b.audience, pinned: b.pinned });
    setMode(b.id);
  }

  /* 關閉表單 */
  function closeForm() {
    setMode(null);
    setForm(EMPTY_FORM);
  }

  /* 儲存草稿 */
  function saveDraft() {
    if (!form.title.trim()) return;
    if (mode === 'new') {
      var newId = 'b-' + nextId;
      setBulletins(function(prev) {
        return [{ id: newId, ...form, status: 'draft', author: '王志明', createdAt: '2026-04-25', publishedAt: null }, ...prev];
      });
      setNextId(function(n){ return n + 1; });
    } else {
      setBulletins(function(prev) {
        return prev.map(function(b) {
          return b.id === mode ? Object.assign({}, b, form) : b;
        });
      });
    }
    closeForm();
  }

  /* 儲存並發布 */
  function saveAndPublish() {
    if (!form.title.trim()) return;
    if (mode === 'new') {
      var newId = 'b-' + nextId;
      setBulletins(function(prev) {
        return [{ id: newId, ...form, status: 'published', author: '王志明', createdAt: '2026-04-25', publishedAt: '2026-04-25' }, ...prev];
      });
      setNextId(function(n){ return n + 1; });
    } else {
      setBulletins(function(prev) {
        return prev.map(function(b) {
          return b.id === mode ? Object.assign({}, b, form, { status: 'published', publishedAt: b.publishedAt || '2026-04-25' }) : b;
        });
      });
    }
    closeForm();
  }

  /* 切換發布/下架 */
  function togglePublish(id) {
    setBulletins(function(prev) {
      return prev.map(function(b) {
        if (b.id !== id) return b;
        var newStatus = b.status === 'published' ? 'draft' : 'published';
        return Object.assign({}, b, {
          status: newStatus,
          publishedAt: newStatus === 'published' ? '2026-04-25' : null,
        });
      });
    });
  }

  /* 刪除 */
  function deleteBulletin(id) {
    setBulletins(function(prev){ return prev.filter(function(b){ return b.id !== id; }); });
    if (mode === id) closeForm();
  }

  var publishedCount = bulletins.filter(function(b){ return b.status === 'published'; }).length;
  var draftCount     = bulletins.filter(function(b){ return b.status === 'draft'; }).length;

  function AudienceBadge({ audience }) {
    var ac = AUDIENCE_CFG[audience] || AUDIENCE_CFG['全員'];
    return (
      <span style={{
        fontSize: fz(11), fontWeight: 600, padding: '2px 8px', borderRadius: 999,
        background: ac.bg, color: ac.color, border: '1px solid ' + ac.border, whiteSpace: 'nowrap',
      }}>{audience}</span>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        padding: '16px 24px', borderBottom: '1px solid ' + C.border, flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 16, background: C.bg,
      }}>
        <div style={{ fontSize: fz(14), fontWeight: 600, color: C.text }}>公告管理</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <span style={{ fontSize: fz(13), color: '#22C55E', fontWeight: 600 }}>{publishedCount} 已發布</span>
          <span style={{ fontSize: fz(13), color: C.textMuted }}>{draftCount} 草稿</span>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <antd.Button type="primary" onClick={openNew}>＋ 新增公告</antd.Button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

        {/* 編輯 / 新增表單 */}
        {mode !== null && (
          <div style={{
            border: '1px solid #2563EB', borderRadius: 8, padding: 24,
            marginBottom: 24, background: 'rgba(37,99,235,0.02)',
          }}>
            <div style={{ fontSize: fz(14), fontWeight: 600, color: C.text, marginBottom: 16 }}>
              {mode === 'new' ? '新增公告' : '編輯公告'}
            </div>

            {/* 標題 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub, marginBottom: 6 }}>標題</div>
              <antd.Input
                placeholder="輸入公告標題…"
                value={form.title}
                onChange={function(e){ setForm(function(f){ return Object.assign({}, f, { title: e.target.value }); }); }}
              />
            </div>

            {/* 置頂 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub, marginBottom: 6 }}>置頂</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <antd.Switch
                  checked={form.pinned}
                  onChange={function(){ setForm(function(f){ return Object.assign({}, f, { pinned: !f.pinned }); }); }}
                />
                <span style={{ fontSize: fz(13), color: form.pinned ? C.accentBlue : C.textMuted }}>
                  {form.pinned ? '置頂顯示' : '不置頂'}
                </span>
              </div>
            </div>

            {/* 內文 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub, marginBottom: 6 }}>內文</div>
              <antd.Input.TextArea
                placeholder="輸入公告內文…"
                value={form.content}
                onChange={function(e){ setForm(function(f){ return Object.assign({}, f, { content: e.target.value }); }); }}
                rows={4}
                style={{ lineHeight: 1.6 }}
              />
            </div>

            {/* 操作按鈕 */}
            <div style={{ display: 'flex', gap: 8 }}>
              <antd.Button type="primary" onClick={saveAndPublish}>儲存並發布</antd.Button>
              <antd.Button onClick={saveDraft}>儲存草稿</antd.Button>
              <antd.Button type="text" onClick={closeForm}>取消</antd.Button>
            </div>
          </div>
        )}

        {/* 公告列表 */}
        {bulletins.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', fontSize: fz(13), color: C.textMuted }}>
            尚無公告，點擊右上角「＋ 新增公告」開始建立
          </div>
        ) : (
          <antd.Table
            rowKey="id"
            dataSource={bulletins}
            pagination={false}
            size="small"
            columns={[
              { title: '', dataIndex: 'pinned', width: 32,
                render: function(v){ return <span style={{ fontSize: fz(12), color: v ? '#2563EB' : 'transparent' }}>📌</span>; } },
              { title: '標題', dataIndex: 'title',
                render: function(_, b){ return (
                  <div>
                    <div style={{ fontSize: fz(13), fontWeight: 500, color: C.text }}>{b.title}</div>
                    <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 2 }}>{b.createdAt}</div>
                  </div>
                ); } },
              { title: '置頂', dataIndex: 'pin', width: 72,
                render: function(_, b){ return <span style={{ fontSize: fz(12), color: b.pinned ? C.accentBlue : C.textMuted }}>{b.pinned ? '是' : '—'}</span>; } },
              { title: '狀態', dataIndex: 'status', width: 96,
                render: function(v){ return (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: v === 'published' ? '#22C55E' : C.borderStrong, flexShrink: 0 }} />
                    <span style={{ fontSize: fz(12), color: v === 'published' ? '#16A34A' : C.textMuted }}>{v === 'published' ? '已發布' : '草稿'}</span>
                  </span>
                ); } },
              { title: '作者', dataIndex: 'author', width: 80,
                render: function(v){ return <span style={{ fontSize: fz(12), color: C.textSub }}>{v}</span>; } },
              { title: '操作', dataIndex: 'op', width: 168,
                render: function(_, b){ return (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <antd.Button size="small" onClick={function(){ openEdit(b); }}>編輯</antd.Button>
                    <antd.Button size="small" type={b.status === 'published' ? 'default' : 'primary'} onClick={function(){ togglePublish(b.id); }}>{b.status === 'published' ? '下架' : '發布'}</antd.Button>
                    <antd.Button size="small" danger onClick={function(){ deleteBulletin(b.id); }}>刪除</antd.Button>
                  </div>
                ); } },
            ]}
          />
        )}

        <div style={{ marginTop: 12, fontSize: fz(12), color: C.textMuted }}>
          ✦ 狀態為「已發布」的公告即時顯示於 Home 課佈告欄 Widget，草稿僅 Seed 可見。
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   Tab 3：KPI Summary
   ═══════════════════════════════════ */
function KpiSummarySettingTab({ p, kpiConfig, onKpiConfigChange}) {
  var { C, fz } = useTheme();
  if (!kpiConfig) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontSize: fz(13) }}>
        KPI 設定尚未載入
      </div>
    );
  }
  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <KwiWidgetSettingView
        p={p}
        config={kpiConfig}
        onChange={onKpiConfigChange}
        onSaved={function(){}}
      />
    </div>
  );
}

/* ═══════════════════════════════════
   Tab 4：Application 管理（分組）
   ═══════════════════════════════════ */
function ApplicationSettingTab({ p}) {
  var { C, fz } = useTheme();
  var initGroups = (APP_GROUPS_BY_PERSONA[p.key] || []).map(function(g) {
    return Object.assign({}, g, { apps: g.apps.slice() });
  });

  var [groups, setGroups]             = React.useState(initGroups);
  var [editingGroupId, setEditingGroupId]   = React.useState(null);
  var [editingGroupName, setEditingGroupName] = React.useState('');
  var [showAddGroup, setShowAddGroup]   = React.useState(false);
  var [newGroupName, setNewGroupName]   = React.useState('');
  var [addingToGroup, setAddingToGroup] = React.useState(null); // group id
  var [nextGid, setNextGid]             = React.useState(500);
  var [saved, setSaved]                 = React.useState(false);

  /* 取得所有已使用的 app id（跨群組） */
  function usedAppIds() {
    var ids = [];
    groups.forEach(function(g) {
      g.apps.forEach(function(a){ ids.push(a.id); });
    });
    return ids;
  }

  /* 新增群組 */
  function addGroup() {
    if (!newGroupName.trim()) return;
    var id = 'g-' + nextGid;
    setGroups(function(prev){ return prev.concat([{ id: id, name: newGroupName.trim(), apps: [] }]); });
    setNextGid(function(n){ return n + 1; });
    setNewGroupName('');
    setShowAddGroup(false);
  }

  /* 刪除群組 */
  function deleteGroup(gid) {
    setGroups(function(prev){ return prev.filter(function(g){ return g.id !== gid; }); });
  }

  /* 確認改群組名 */
  function confirmRenameGroup(gid) {
    if (!editingGroupName.trim()) { setEditingGroupId(null); return; }
    setGroups(function(prev){
      return prev.map(function(g){ return g.id === gid ? Object.assign({}, g, { name: editingGroupName.trim() }) : g; });
    });
    setEditingGroupId(null);
  }

  /* 切換必選 */
  function toggleRequired(gid, appId) {
    setGroups(function(prev){
      return prev.map(function(g){
        if (g.id !== gid) return g;
        return Object.assign({}, g, {
          apps: g.apps.map(function(a){
            return a.id === appId ? Object.assign({}, a, { required: !a.required }) : a;
          }),
        });
      });
    });
    setSaved(false);
  }

  /* 從群組移除 app */
  function removeApp(gid, appId) {
    setGroups(function(prev){
      return prev.map(function(g){
        if (g.id !== gid) return g;
        return Object.assign({}, g, { apps: g.apps.filter(function(a){ return a.id !== appId; }) });
      });
    });
    setSaved(false);
  }

  /* 加入 app 至群組 */
  function addAppToGroup(gid, libApp) {
    setGroups(function(prev){
      return prev.map(function(g){
        if (g.id !== gid) return g;
        return Object.assign({}, g, { apps: g.apps.concat([{ id: libApp.id, label: libApp.label, url: libApp.url, required: false }]) });
      });
    });
    setAddingToGroup(null);
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(function(){ setSaved(false); }, 2000);
  }

  var used = usedAppIds();
  var totalRequired = groups.reduce(function(acc, g){
    return acc + g.apps.filter(function(a){ return a.required; }).length;
  }, 0);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        padding: '16px 24px', borderBottom: '1px solid ' + C.border, flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 16, background: C.bg,
      }}>
        <div style={{ fontSize: fz(14), fontWeight: 600, color: C.text }}>應用群組管理</div>
        <span style={{ fontSize: fz(13), color: C.textMuted }}>{groups.length} 個群組 · {totalRequired} 個必選</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          {saved && <span style={{ fontSize: fz(12), color: '#22C55E', fontWeight: 600 }}>✓ 已儲存</span>}
          <antd.Button onClick={function(){ setShowAddGroup(true); setNewGroupName(''); }}>＋ 新增群組</antd.Button>
          <antd.Button type="primary" onClick={handleSave}>儲存配置</antd.Button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

        {/* 新增群組表單 */}
        {showAddGroup && (
          <div style={{
            display: 'flex', gap: 8, alignItems: 'center', padding: 16,
            border: '1px solid #2563EB', borderRadius: 8, marginBottom: 16,
            background: 'rgba(37,99,235,0.02)',
          }}>
            <antd.Input
              placeholder="輸入群組名稱，例如：EE 核心工具"
              value={newGroupName}
              onChange={function(e){ setNewGroupName(e.target.value); }}
              onPressEnter={addGroup}
              autoFocus
              style={{ flex: 1 }}
            />
            <antd.Button type="primary" onClick={addGroup}>建立</antd.Button>
            <antd.Button onClick={function(){ setShowAddGroup(false); }}>取消</antd.Button>
          </div>
        )}

        {/* 群組列表 */}
        {groups.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 0', fontSize: fz(13), color: C.textMuted }}>
            尚無應用群組，點擊「＋ 新增群組」開始配置
          </div>
        )}

        {groups.map(function(group) {
          var availableToAdd = APP_LIBRARY.filter(function(lib) {
            return used.indexOf(lib.id) === -1 || !group.apps.find(function(a){ return a.id === lib.id; });
          }).filter(function(lib){
            return !group.apps.find(function(a){ return a.id === lib.id; });
          });
          var isAddingHere = addingToGroup === group.id;

          return (
            <div key={group.id} style={{ border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>

              {/* Group header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: C.bgPanel, borderBottom: group.apps.length > 0 ? '1px solid ' + C.border : 'none' }}>
                {editingGroupId === group.id ? (
                  <antd.Input
                    autoFocus
                    size="small"
                    value={editingGroupName}
                    onChange={function(e){ setEditingGroupName(e.target.value); }}
                    onBlur={function(){ confirmRenameGroup(group.id); }}
                    onPressEnter={function(){ confirmRenameGroup(group.id); }}
                    onKeyDown={function(e){ if (e.key === 'Escape') setEditingGroupId(null); }}
                    style={{ fontWeight: 600, minWidth: 160, maxWidth: 240 }}
                  />
                ) : (
                  <span style={{ fontSize: fz(14), fontWeight: 600, color: C.text }}>{group.name}</span>
                )}
                <span style={{ fontSize: fz(12), color: C.textMuted }}>{group.apps.length} 個應用</span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                  <antd.Button size="small" onClick={function(){ setEditingGroupId(group.id); setEditingGroupName(group.name); }}>重命名</antd.Button>
                  <antd.Button size="small" danger onClick={function(){ deleteGroup(group.id); }}>刪除群組</antd.Button>
                </div>
              </div>

              {/* App list in group → AntD Table */}
              {group.apps.length > 0 && (
                <antd.Table
                  rowKey="id"
                  dataSource={group.apps}
                  pagination={false}
                  size="small"
                  columns={[
                    { title: '應用名稱', dataIndex: 'label',
                      render: function(v){ return <span style={{ fontSize: fz(13), fontWeight: 500, color: C.text }}>{v}</span>; } },
                    { title: 'URL', dataIndex: 'url', width: 180,
                      render: function(v){ return <span style={{ fontSize: fz(12), color: C.textMuted, fontFamily: 'monospace' }}>{v}</span>; } },
                    { title: '必選', dataIndex: 'required', width: 72,
                      render: function(v, app){ return <antd.Switch size="small" checked={v} onChange={function(){ toggleRequired(group.id, app.id); }} />; } },
                    { title: '操作', dataIndex: 'op', width: 80,
                      render: function(_, app){ return <antd.Button size="small" danger onClick={function(){ removeApp(group.id, app.id); }}>移除</antd.Button>; } },
                  ]}
                />
              )}

              {/* Add app to group */}
              {isAddingHere ? (
                <div style={{ padding: 16, background: 'rgba(37,99,235,0.02)', borderTop: group.apps.length > 0 ? '1px solid ' + C.border : 'none' }}>
                  <div style={{ fontSize: fz(12), color: C.textSub, fontWeight: 600, marginBottom: 8 }}>選擇要加入的應用</div>
                  {availableToAdd.length === 0 ? (
                    <div style={{ fontSize: fz(13), color: C.textMuted }}>所有可用應用已加入，或可至 APP Library 新增更多</div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {availableToAdd.map(function(lib) {
                        return (
                          <antd.Button key={lib.id} size="small" onClick={function(){ addAppToGroup(group.id, lib); }}
                            style={{ color: '#2563EB', borderColor: '#2563EB' }}
                          >{lib.label}</antd.Button>
                        );
                      })}
                    </div>
                  )}
                  <div style={{ marginTop: 8 }}>
                    <antd.Button size="small" type="text" onClick={function(){ setAddingToGroup(null); }}>取消</antd.Button>
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '10px 16px',
                  borderTop: group.apps.length > 0 ? '1px solid ' + C.border : 'none',
                  background: C.bgSub,
                }}>
                  <antd.Button size="small" type="dashed" onClick={function(){ setAddingToGroup(group.id); }}>＋ 加入應用</antd.Button>
                </div>
              )}
            </div>
          );
        })}

        <div style={{ marginTop: 8, fontSize: fz(12), color: C.textMuted }}>
          ✦ 標記為「必選」的應用將推送至課內所有成員的捷徑，且無法被個人移除。群組結構反映於 Home Dashboard 課的應用 Widget 排列方式。
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════
   Tab 5：知識管理
   ═══════════════════════════════════ */
function KnowledgeTab({ p }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <SOPManagementPage p={p} />  {/* SOPManagementPage 已重構為 SkillManagementPage，函式名稱向後相容 */}
    </div>
  );
}

/* ═══════════════════════════════════
   Personal Tab：個人偏好設定
   ═══════════════════════════════════ */
function PersonalSettingTab({ notifPrefs, onNotifPrefChange }) {
  var themeCtx = useTheme();
  var fz = themeCtx.fz || function(n){ return n; };
  var C = themeCtx.C;
  var isDark = themeCtx.isDark;
  var toggle = themeCtx.toggle;
  var fontSize = themeCtx.fontSize || 'normal';
  var setFontSize = themeCtx.setFontSize || function(){};

  /* 通知偏好：站內 / 同步 Teams（逐則），見 brain/entities/modules/notification.md */
  var prefs = notifPrefs || (typeof DEFAULT_NOTIF_PREFS !== 'undefined' ? DEFAULT_NOTIF_PREFS : { N1:{}, N2:{}, N3:{} });
  var handlePref = onNotifPrefChange || function(){};
  var Switch = (typeof antd !== 'undefined' && antd.Switch) ? antd.Switch : null;
  var Segmented = (typeof antd !== 'undefined' && antd.Segmented) ? antd.Segmented : null;
  var Select = (typeof antd !== 'undefined' && antd.Select) ? antd.Select : null;
  var NOTIF_TYPE_LIST = ['N1', 'N2', 'N3'];

  /* ── 語言選擇（未來用）── */
  var [lang, setLang] = React.useState('zh-TW');

  function SectionTitle({ children }) {
    return (
      <div style={{
        fontSize: fz(11), fontWeight: 700, color: C.textMuted,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        marginBottom: 8, marginTop: 24,
      }}>{children}</div>
    );
  }

  function SettingRow({ label, desc, children }) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: '1px solid ' + C.border,
        background: C.bg,
        gap: 16,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: fz(14), fontWeight: 500, color: C.text }}>{label}</div>
          {desc && <div style={{ fontSize: fz(12), color: C.textMuted, marginTop: 2 }}>{desc}</div>}
        </div>
        <div style={{ flexShrink: 0 }}>{children}</div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>

      {/* ── 外觀 ── */}
      <SectionTitle>外觀</SectionTitle>
      <div style={{ border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden' }}>
        <SettingRow
          label="深色模式"
          desc="將介面切換為深色背景，在低光源環境中更舒適"
        >
          {/* Dark mode Toggle → AntD Switch（Phase 1 遷移） */}
          {Switch ? (
            <Switch
              checked={isDark}
              onChange={toggle}
              checkedChildren="🌙"
              unCheckedChildren="☀️"
              aria-label={isDark ? '關閉深色模式' : '開啟深色模式'}
            />
          ) : null}
        </SettingRow>

        {/* 主題預覽卡 */}
        <div style={{
          padding: '16px',
          background: C.bgPanel,
          borderTop: '1px solid ' + C.border,
          display: 'flex', gap: 12, alignItems: 'center',
        }}>
          <div style={{ fontSize: fz(12), color: C.textMuted, flex: 1 }}>
            目前模式：<span style={{ fontWeight: 600, color: isDark ? '#8AB4F8' : '#2563EB' }}>
              {isDark ? '🌙 深色' : '☀️ 淺色'}
            </span>
          </div>
          {/* Mini preview */}
          <div style={{ display: 'flex', gap: 8 }}>
            {/* Light preview */}
            <div
              onClick={isDark ? toggle : undefined}
              style={{
                width: 64, height: 40, borderRadius: 6, overflow: 'hidden',
                border: !isDark ? '2px solid #2563EB' : '2px solid ' + C.border,
                cursor: isDark ? 'pointer' : 'default',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ height: 10, background: C.bg, borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', gap: 3, padding: '0 4px' }}>
                <div style={{ width: 16, height: 5, borderRadius: 2, background: '#2563EB' }} />
              </div>
              <div style={{ height: 30, background: C.bgPanel, padding: 4, display: 'flex', gap: 3 }}>
                <div style={{ width: 8, background: C.bg, borderRadius: 2 }} />
                <div style={{ flex: 1, background: C.bg, borderRadius: 2 }} />
              </div>
            </div>
            {/* Dark preview */}
            <div
              onClick={!isDark ? toggle : undefined}
              style={{
                width: 64, height: 40, borderRadius: 6, overflow: 'hidden',
                border: isDark ? '2px solid #8AB4F8' : '2px solid #3C3F41',
                cursor: !isDark ? 'pointer' : 'default',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{ height: 10, background: '#1C1B1F', borderBottom: '1px solid #3C3F41', display: 'flex', alignItems: 'center', gap: 3, padding: '0 4px' }}>
                <div style={{ width: 16, height: 5, borderRadius: 2, background: '#8AB4F8' }} />
              </div>
              <div style={{ height: 30, background: '#1E1E20', padding: 4, display: 'flex', gap: 3 }}>
                <div style={{ width: 8, background: '#131314', borderRadius: 2 }} />
                <div style={{ flex: 1, background: '#28292A', borderRadius: 2 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 語言（placeholder） ── */}
      <SectionTitle>語言</SectionTitle>
      <div style={{ border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden' }}>
        <SettingRow label="介面語言" desc="Portal 顯示語言">
          {/* → AntD Select（Phase 1 遷移） */}
          {Select ? (
            <Select
              value={lang}
              onChange={function(v){ setLang(v); }}
              style={{ width: 140 }}
              options={[
                { value: 'zh-TW', label: '繁體中文' },
                { value: 'en', label: 'English' },
              ]}
            />
          ) : null}
        </SettingRow>
      </div>

      {/* ── 字型大小 ── */}
      <SectionTitle>顯示</SectionTitle>
      <div style={{ border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden' }}>
        <SettingRow label="字型大小" desc="調整介面整體文字大小，立即生效">
          {/* → AntD Segmented（Phase 1 遷移；膠囊式非底線，圓角客製於 AppConfigProvider） */}
          {Segmented ? (
            <Segmented
              value={fontSize || 'normal'}
              onChange={function(v){ setFontSize(v); }}
              options={[
                { label: '小', value: 'small' },
                { label: '標準', value: 'normal' },
                { label: '大', value: 'large' },
              ]}
            />
          ) : null}
        </SettingRow>
      </div>

      {/* ── 通知 ── */}
      <SectionTitle>通知</SectionTitle>
      <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 8, lineHeight: 1.5 }}>
        選擇每類通知的接收管道。站內通知顯示於右上角鈴鐺；Teams 為逐則同步推送。
      </div>
      <div style={{ border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden' }}>
        {/* 欄位標題 */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '10px 16px', background: C.bgPanel,
          borderBottom: '1px solid ' + C.border,
        }}>
          <div style={{ flex: 1 }} />
          <div style={{ width: 64, textAlign: 'center', fontSize: fz(11), fontWeight: 600, color: C.textMuted }}>站內</div>
          <div style={{ width: 64, textAlign: 'center', fontSize: fz(11), fontWeight: 600, color: C.textMuted }}>Teams</div>
        </div>
        {NOTIF_TYPE_LIST.map(function(type, idx) {
          var meta = (typeof NOTIF_TYPES !== 'undefined' && NOTIF_TYPES[type]) || { label: type, dot: '#9E9E9E' };
          var pref = prefs[type] || { inApp: true, teams: false };
          return (
            <div key={type} style={{
              display: 'flex', alignItems: 'center',
              padding: '14px 16px', gap: 16,
              borderBottom: idx < NOTIF_TYPE_LIST.length - 1 ? '1px solid ' + C.border : 'none',
              background: C.bg,
            }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 999, background: meta.dot, flexShrink: 0 }} />
                <span style={{ fontSize: fz(14), fontWeight: 500, color: C.text }}>{meta.label}</span>
              </div>
              <div style={{ width: 64, display: 'flex', justifyContent: 'center' }}>
                {Switch ? (
                  <Switch size="small" checked={!!pref.inApp}
                    onChange={function(v){ handlePref(type, 'inApp', v); }} />
                ) : null}
              </div>
              <div style={{ width: 64, display: 'flex', justifyContent: 'center' }}>
                {Switch ? (
                  <Switch size="small" checked={!!pref.teams}
                    onChange={function(v){ handlePref(type, 'teams', v); }} />
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 8, lineHeight: 1.5 }}>
        Teams 推送為規劃中功能，此處設定會保存，實際整合待後端接線。
      </div>
    </div>
  );
}

/* ── IsolatedEditor: prevent React from clearing contentEditable on parent re-render ── */
var IsolatedEditor = React.memo(
  function IsolatedEditorInner(props) {
    return React.createElement('div', {
      ref: props.editorRef,
      contentEditable: true,
      suppressContentEditableWarning: true,
      style: props.style,
      onFocus: props.onFocus,
      onBlur: props.onBlur,
    });
  },
  function() { return true; } /* always "equal" → never re-render from parent */
);

/* ═══════════════════════════════════
   Home 排版 Setting Tab
   ═══════════════════════════════════ */
function HomeLayoutTab({ p, homeLayout, onHomeLayoutChange, onNavigateToTab, jumpSlot, onJumpSlotConsumed, kpiConfig, onKpiConfigChange, jumpWidgetType, onJumpWidgetTypeConsumed }) {
  var { C, fz } = useTheme();
  var [activeSlot, setActiveSlot] = React.useState(null);   /* { rowId, slotId } */
  var [picker, setPicker]         = React.useState(null);   /* null | { targetRowId: string|null } */
  var [pickerType, setPickerType] = React.useState(null);
  var [localTitle, setLocalTitle] = React.useState('');
  var [savedOk, setSavedOk]       = React.useState(false);
  var editorRef   = React.useRef(null);
  var savedSelRef = React.useRef(null);

  /* 當從 Home 自訂 Widget 編輯按鈕進入時，自動展開對應 widget 的設定面板 */
  React.useEffect(function() {
    if (jumpSlot && jumpSlot.rowId && jumpSlot.slotId) {
      setActiveSlot({ rowId: jumpSlot.rowId, slotId: jumpSlot.slotId });
      if (onJumpSlotConsumed) onJumpSlotConsumed();
    }
  }, [jumpSlot]);

  /* 當從 Home 點 announcement/kpi/app widget 編輯按鈕跳轉，自動 select 對應 widget */
  React.useEffect(function() {
    if (!jumpWidgetType) return;
    var found = null;
    (homeLayout || []).forEach(function(row) {
      row.widgets.forEach(function(s) {
        if (s.type === jumpWidgetType && !found) found = { rowId: row.rowId, slotId: s.slotId };
      });
    });
    if (found) setActiveSlot(found);
    if (onJumpWidgetTypeConsumed) onJumpWidgetTypeConsumed();
  }, [jumpWidgetType]);

  /* Count how many times each type is used */
  var usedTypes = React.useMemo(function() {
    var t = {};
    (homeLayout || []).forEach(function(row) {
      row.widgets.forEach(function(s) { t[s.type] = (t[s.type] || 0) + 1; });
    });
    return t;
  }, [homeLayout]);

  var customCount = usedTypes['custom'] || 0;

  /* Resolve active slot data */
  var activeRow  = activeSlot && (homeLayout || []).find(function(r) { return r.rowId === activeSlot.rowId; });
  var activeData = activeRow  && activeRow.widgets.find(function(s) { return s.slotId === activeSlot.slotId; });
  var activeTypeDef = activeData && HOME_WIDGET_TYPES.find(function(wt) { return wt.type === activeData.type; });

  /* Sync local editor state when active slot changes */
  React.useEffect(function() {
    if (!activeData || activeData.type !== 'custom') return;
    setLocalTitle(activeData.title || '');
    if (editorRef.current) editorRef.current.innerHTML = activeData.html || '';
  }, [activeSlot && activeSlot.slotId]);

  /* ── Layout mutators ── */
  function updateLayout(fn) { onHomeLayoutChange(fn(homeLayout || [])); }

  function deleteWidget(rowId, slotId) {
    updateLayout(function(layout) {
      return layout.map(function(row) {
        if (row.rowId !== rowId) return row;
        return Object.assign({}, row, { widgets: row.widgets.filter(function(s) { return s.slotId !== slotId; }) });
      }).filter(function(row) { return row.widgets.length > 0; });
    });
    if (activeSlot && activeSlot.slotId === slotId) setActiveSlot(null);
  }

  function deleteRow(rowId) {
    updateLayout(function(layout) { return layout.filter(function(r) { return r.rowId !== rowId; }); });
    if (activeSlot && activeSlot.rowId === rowId) setActiveSlot(null);
  }

  function moveRow(rowId, dir) {
    updateLayout(function(layout) {
      var arr = layout.slice();
      var idx = arr.findIndex(function(r) { return r.rowId === rowId; });
      if (idx < 0) return arr;
      var ti = idx + dir;
      if (ti < 0 || ti >= arr.length) return arr;
      var tmp = arr[idx]; arr[idx] = arr[ti]; arr[ti] = tmp;
      return arr;
    });
  }

  function openPicker(targetRowId) {
    setPickerType(null);
    setPicker({ targetRowId: targetRowId === undefined ? null : targetRowId });
  }

  function confirmPicker() {
    if (!pickerType) return;
    if (pickerType === 'custom' && customCount >= 12) { alert('已達自訂 Widget 上限 12 個'); return; }
    var newSlotId = 's-' + Date.now();
    var newSlot = { slotId: newSlotId, type: pickerType };
    if (pickerType === 'custom') { newSlot.title = '新 Widget'; newSlot.html = ''; }

    var newRowId = null;
    if (!picker.targetRowId) {
      newRowId = 'r-' + Date.now();
      var newRow = { rowId: newRowId, widgets: [newSlot] };
      updateLayout(function(layout) { return layout.concat([newRow]); });
    } else {
      newRowId = picker.targetRowId;
      updateLayout(function(layout) {
        return layout.map(function(row) {
          if (row.rowId !== picker.targetRowId) return row;
          return Object.assign({}, row, { widgets: row.widgets.concat([newSlot]) });
        });
      });
    }
    setPicker(null);
    setPickerType(null);
    /* Auto-open right panel for custom widgets */
    if (pickerType === 'custom') setActiveSlot({ rowId: newRowId, slotId: newSlotId });
  }

  /* ── Rich text editor helpers ── */
  function toolBold() { document.execCommand('bold', false, null); editorRef.current && editorRef.current.focus(); }

  function toolLink() {
    var sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedSelRef.current = sel.getRangeAt(0).cloneRange();
    var url = prompt('請輸入連結 URL：', 'https://');
    if (!url) return;
    var sel2 = window.getSelection();
    if (sel2 && savedSelRef.current) { sel2.removeAllRanges(); sel2.addRange(savedSelRef.current); }
    var range = savedSelRef.current;
    if (!range) return;
    var a = document.createElement('a');
    a.href = url; a.target = '_blank';
    if (range.toString()) {
      try { range.surroundContents(a); } catch(e) { a.textContent = range.toString(); range.deleteContents(); range.insertNode(a); }
    } else {
      a.textContent = url; range.insertNode(a);
    }
    editorRef.current && editorRef.current.focus();
    savedSelRef.current = null;
  }

  function saveEdit() {
    if (!activeData || activeData.type !== 'custom' || !editorRef.current) return;
    var html  = editorRef.current.innerHTML;
    var title = localTitle;
    updateLayout(function(layout) {
      return layout.map(function(row) {
        if (row.rowId !== activeSlot.rowId) return row;
        return Object.assign({}, row, {
          widgets: row.widgets.map(function(s) {
            return s.slotId !== activeSlot.slotId ? s : Object.assign({}, s, { title: title, html: html });
          }),
        });
      });
    });
    /* After React reconciles the parent re-render, ensure editor still shows saved content */
    var savedHtml = html;
    window.requestAnimationFrame(function() {
      if (editorRef.current && editorRef.current.innerHTML !== savedHtml) {
        editorRef.current.innerHTML = savedHtml;
      }
    });
    setSavedOk(true);
    setTimeout(function() { setSavedOk(false); }, 1500);
  }

  function rowSizeLabel(count) { return count === 1 ? 'Full' : count === 2 ? 'Half' : 'Third'; }

  var layout = homeLayout || [];
  /* 點擊任何 widget chip → 進入全寬編輯視圖，所有類型統一 */
  var showFullSettings = !!activeData;

  /* Widget 圖示 */
  var WIDGET_ICON = { announcement: '📢', kpi: '📊', app: '⚡', tool: '🔧', case: '📋', lot: '🏷️', custom: '✏️' };

  function chipLabel(slot) {
    var def = HOME_WIDGET_TYPES.find(function(wt) { return wt.type === slot.type; });
    return slot.type === 'custom' ? (slot.title || '自訂連結') : (def ? def.label : slot.type);
  }
  function chipDesc(slot) {
    var def = HOME_WIDGET_TYPES.find(function(wt) { return wt.type === slot.type; });
    if (slot.type === 'custom') return slot.html ? '已設定內容' : '尚未設定內容';
    return def ? def.desc : '';
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>

      {/* ── Widget Picker Modal ── AntD Modal（getContainer=false：限縮於本分頁） */}
      {picker && (
        <antd.Modal
          open={true}
          title="選擇 Widget 種類"
          width={380}
          getContainer={false}
          onCancel={function() { setPicker(null); setPickerType(null); }}
          onOk={confirmPicker}
          okText="確認新增"
          cancelText="取消"
          okButtonProps={{ disabled: !pickerType }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '8px 0' }}>
            {HOME_WIDGET_TYPES
              .filter(function(wt) { return wt.personas.indexOf(p.key) !== -1; })
              .map(function(wt) {
                var disabled = wt.singleton && (usedTypes[wt.type] || 0) > 0;
                var selected = pickerType === wt.type;
                return (
                  <button key={wt.type}
                    disabled={disabled}
                    onClick={function() { if (!disabled) setPickerType(wt.type); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', borderRadius: 8, textAlign: 'left',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      border: selected ? '1.5px solid #2563EB' : '1px solid ' + C.border,
                      background: selected ? 'rgba(37,99,235,0.06)' : C.bgSub,
                      opacity: disabled ? 0.4 : 1,
                    }}
                  >
                    <span style={{ fontSize: fz(20), flexShrink: 0, lineHeight: 1 }}>{WIDGET_ICON[wt.type] || '▣'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: fz(13), fontWeight: 600, color: selected ? '#2563EB' : C.text }}>{wt.label}</div>
                      <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 2 }}>{wt.desc}{disabled ? '（已添加）' : ''}</div>
                    </div>
                    {selected && (
                      <div style={{ width: 16, height: 16, borderRadius: 999, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <div style={{ width: 6, height: 6, borderRadius: 999, background: C.bg }} />
                      </div>
                    )}
                  </button>
                );
              })}
          </div>
        </antd.Modal>
      )}

      {/* ══════════════════════════════════════════
          全寬設定視圖（所有 widget 類型統一走這裡）
         ══════════════════════════════════════════ */}
      {showFullSettings && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* ── 返回列 ── */}
          <div style={{ height: 48, padding: '0 24px', borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, background: C.bgSub }}>
            <button
              onClick={function() { setActiveSlot(null); }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: C.textMuted, fontSize: fz(12), padding: '4px 8px', borderRadius: 6, transition: 'all 0.15s' }}
              onMouseEnter={function(e) { e.currentTarget.style.background = C.hover; e.currentTarget.style.color = C.text; }}
              onMouseLeave={function(e) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = C.textMuted; }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              首頁排版
            </button>
            <span style={{ color: C.textMuted, fontSize: fz(13) }}>/</span>
            <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text }}>
              {activeData.type === 'custom' ? (activeData.title || '自訂連結') : (activeTypeDef ? activeTypeDef.label : activeData.type)}
            </span>
          </div>

          {/* ── 自訂連結編輯器（全寬） ── */}
          {activeData.type === 'custom' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px' }} className="scrollbar-thin">
              <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <label style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted, display: 'block', marginBottom: 8, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Widget 標題</label>
                  <antd.Input
                    value={localTitle}
                    onChange={function(e) { setLocalTitle(e.target.value); }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted, display: 'block', marginBottom: 8, letterSpacing: '0.07em', textTransform: 'uppercase' }}>內容</label>
                  <div style={{ display: 'flex', gap: 4, padding: '6px 8px', background: C.bgSub, border: '1px solid ' + C.border, borderBottom: 'none', borderRadius: '6px 6px 0 0' }}>
                    <antd.Button size="small" onMouseDown={function(e) { e.preventDefault(); toolBold(); }} style={{ fontWeight: 700 }}>B</antd.Button>
                    <antd.Button size="small" onMouseDown={function(e) { e.preventDefault(); toolLink(); }} style={{ color: '#2563EB' }}>🔗 連結</antd.Button>
                  </div>
                  <IsolatedEditor
                    key={activeSlot ? activeSlot.slotId : 'no-slot'}
                    editorRef={editorRef}
                    style={{ border: '1px solid ' + C.border, borderRadius: '0 0 6px 6px', padding: '12px', minHeight: 240, fontSize: fz(14), color: C.text, lineHeight: 1.9, outline: 'none', background: C.bg, overflowY: 'auto' }}
                    onFocus={function(e) { e.currentTarget.style.borderColor = '#2563EB'; }}
                    onBlur={function(e) { e.currentTarget.style.borderColor = C.border; }}
                  />
                  <div style={{ fontSize: fz(11), color: C.textMuted, marginTop: 6 }}>換行：Enter｜選取文字後點「🔗 連結」插入超連結</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <antd.Button type="primary" onClick={saveEdit}
                    style={savedOk ? { background: '#16A34A', borderColor: '#16A34A' } : undefined}>
                    {savedOk ? '✓ 已儲存' : '儲存'}
                  </antd.Button>
                  <antd.Button onClick={function() { setActiveSlot(null); }}>取消</antd.Button>
                </div>
              </div>
            </div>
          )}

          {/* ── 各 Widget 設定（inline，與原本 tab 內容共用元件） ── */}
          {activeData.type === 'announcement' && <BulletinSettingTab p={p} />}
          {activeData.type === 'kpi'          && <KpiSummarySettingTab p={p} kpiConfig={kpiConfig} onKpiConfigChange={onKpiConfigChange} />}
          {activeData.type === 'app'          && <ApplicationSettingTab p={p} />}

          {/* ── 無設定項的 widget 類型（tool / case / lot）── */}
          {!['custom','announcement','kpi','app'].includes(activeData.type) && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: C.textMuted }}>
              <span style={{ fontSize: fz(40), lineHeight: 1 }}>{WIDGET_ICON[activeData.type] || '▣'}</span>
              <div style={{ fontSize: fz(14), fontWeight: 600, color: C.text }}>{activeTypeDef ? activeTypeDef.label : activeData.type}</div>
              <div style={{ fontSize: fz(13), color: C.textMuted }}>此 Widget 的資料由系統自動帶入，無需額外設定。</div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════
          排版編輯器（未選中任何 widget 時顯示）
         ══════════════════════════════════════════ */}
      {!showFullSettings && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }} className="scrollbar-thin">

          {/* 頁首 */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: fz(15), fontWeight: 700, color: C.text, marginBottom: 4 }}>首頁排版</div>
              <div style={{ fontSize: fz(12), color: C.textMuted, lineHeight: 1.6 }}>管理課員工 Home 頁面的 Widget 排列。每列最多 3 個，自訂連結 {customCount} / 12 個。</div>
            </div>
            <antd.Button type="primary" onClick={function() { openPicker(); }} style={{ flexShrink: 0 }}>＋ 新增列</antd.Button>
          </div>

          {/* 空狀態 */}
          {layout.length === 0 && (
            <div style={{ border: '2px dashed ' + C.border, borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: fz(36), marginBottom: 12 }}>⊞</div>
              <div style={{ fontSize: fz(14), fontWeight: 600, color: C.text, marginBottom: 8 }}>尚無 Widget</div>
              <div style={{ fontSize: fz(13), color: C.textMuted, marginBottom: 24 }}>點擊「新增列」建立首頁版面</div>
              <antd.Button onClick={function(){ openPicker(); }} style={{ color: '#2563EB', borderColor: '#2563EB' }}>＋ 新增列</antd.Button>
            </div>
          )}

          {/* 列清單 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {layout.map(function(row, ri) {
              var cnt = row.widgets.length;
              return (
                <div key={row.rowId} style={{ border: '1px solid ' + C.border, borderRadius: 10, background: C.bgSub, overflow: 'hidden' }}>

                  {/* 列標頭 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: C.bg, borderBottom: '1px solid ' + C.border }}>
                    <span style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{rowSizeLabel(cnt)}</span>
                    <span style={{ fontSize: fz(11), color: C.textMuted, background: C.bgSub, padding: '1px 7px', borderRadius: 999, border: '1px solid ' + C.border }}>{cnt}/3</span>
                    <div style={{ flex: 1 }} />
                    <antd.Button size="small" disabled={ri === 0} onClick={function() { moveRow(row.rowId, -1); }}>↑</antd.Button>
                    <antd.Button size="small" disabled={ri === layout.length - 1} onClick={function() { moveRow(row.rowId, 1); }}>↓</antd.Button>
                    {cnt < 3 && (
                      <antd.Button size="small" onClick={function() { openPicker(row.rowId); }} style={{ color: '#2563EB', borderColor: '#2563EB' }}>＋ Widget</antd.Button>
                    )}
                    <antd.Button size="small" danger onClick={function() { if (window.confirm('確認刪除整列？')) deleteRow(row.rowId); }}>×</antd.Button>
                  </div>

                  {/* Widget chips */}
                  <div style={{ display: 'flex', gap: 12, padding: '12px 16px' }}>
                    {row.widgets.map(function(slot) {
                      var label = chipLabel(slot);
                      var desc  = chipDesc(slot);
                      var icon  = WIDGET_ICON[slot.type] || '▣';
                      return (
                        <div key={slot.slotId}
                          style={{ flex: 1, minWidth: 0, position: 'relative' }}
                          onMouseEnter={function(e) {
                            var body = e.currentTarget.querySelector('.chip-body');
                            var btns = e.currentTarget.querySelectorAll('.chip-btn');
                            if (body) body.style.borderColor = '#2563EB';
                            btns.forEach(function(b) { b.style.opacity = '1'; });
                          }}
                          onMouseLeave={function(e) {
                            var body = e.currentTarget.querySelector('.chip-body');
                            var btns = e.currentTarget.querySelectorAll('.chip-btn');
                            if (body) body.style.borderColor = C.border;
                            btns.forEach(function(b) { b.style.opacity = '0'; });
                          }}
                        >
                          {/* Chip 主體：點擊 = 進入編輯 */}
                          <div
                            className="chip-body"
                            onClick={function() { setActiveSlot({ rowId: row.rowId, slotId: slot.slotId }); }}
                            style={{ background: C.bg, border: '1px solid ' + C.border, borderRadius: 8, cursor: 'pointer', transition: 'border-color 0.15s' }}
                          >
                            <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: fz(18), flexShrink: 0, lineHeight: 1 }}>{icon}</span>
                              <span style={{ fontSize: fz(13), fontWeight: 600, color: C.text, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
                            </div>
                            <div style={{ padding: '0 12px 10px', fontSize: fz(11), color: C.textMuted }}>{desc}</div>
                          </div>

                          {/* Hover 按鈕：✎ 編輯 + × 刪除 */}
                          <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 4 }}>
                            <button
                              className="chip-btn"
                              onClick={function(e) { e.stopPropagation(); setActiveSlot({ rowId: row.rowId, slotId: slot.slotId }); }}
                              title="編輯"
                              style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid ' + C.border, background: C.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s' }}
                            >
                              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                                <path d="M7.5 1L10 3.5 3.5 10H1V7.5L7.5 1z" stroke="#2563EB" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button
                              className="chip-btn"
                              onClick={function(e) { e.stopPropagation(); if (window.confirm('確認刪除此 Widget？')) deleteWidget(row.rowId, slot.slotId); }}
                              title="刪除"
                              style={{ width: 24, height: 24, borderRadius: 5, border: '1px solid #FECACA', background: C.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.15s' }}
                            >
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M2 2l6 6M8 2L2 8" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════
   WIP 佔位頁面
   ═══════════════════════════════════ */
function WIPSettingTab({ title }) {
  var { C, fz } = useTheme();
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 48, color: C.textMuted }}>
      <span style={{ fontSize: fz(48), lineHeight: 1 }}>🚧</span>
      <div style={{ fontSize: fz(16), fontWeight: 600, color: C.text }}>{title}</div>
      <div style={{ fontSize: fz(14), color: C.textMuted }}>待補</div>
    </div>
  );
}

/* ═══════════════════════════════════
   SETTING PAGE ROOT
   ═══════════════════════════════════ */
var HOME_WIDGET_TYPES = [
  { type: 'announcement', label: 'Announcement',  desc: '課佈告欄公告',                singleton: true,  settingTab: 'bulletin',    personas: ['equipment', 'process', 'mfg'] },
  { type: 'tool',         label: '設備狀態監控',  desc: 'Tool Down / PM / Monitoring', singleton: true,  settingTab: null,          personas: ['equipment'] },
  { type: 'case',         label: 'Case Monitor',  desc: 'Unclose Case 追蹤',           singleton: true,  settingTab: null,          personas: ['equipment', 'process', 'mfg'] },
  { type: 'lot',          label: 'Lot Hold',       desc: '批次異常掌握',                singleton: true,  settingTab: null,          personas: ['equipment', 'process', 'mfg'] },
  { type: 'kpi',          label: 'KPI Summary',   desc: 'KPI 數據卡片',                singleton: true,  settingTab: 'kpi',         personas: ['equipment', 'process', 'mfg'] },
  { type: 'app',          label: '應用程式捷徑',  desc: '釘選 App 快速啟動',           singleton: true,  settingTab: 'application', personas: ['equipment', 'process', 'mfg'] },
  { type: 'custom',       label: '自訂連結',       desc: '自訂標題與超連結文字內容',    singleton: false, settingTab: null,          personas: ['equipment', 'process', 'mfg'] },
];

var MGMT_TABS = [
  { key: 'permissions',  label: '權限管理' },
  { key: 'home',         label: '首頁設定' },
  { key: 'kpi-report',   label: 'KPI 報表管理' },
  { key: 'knowledge',    label: 'Skill 管理' },
  { key: 'qna',          label: 'Q&A 管理' },
];

/* ════════════════════════════════════════
   IT 後台 — APP 管理 Tab
   ════════════════════════════════════════ */
function AppManagementTab({ functionTree, onFunctionTreeChange }) {
  var { C, fz } = useTheme();

  /* ── UI state ── */
  var [panel, setPanel]           = React.useState(null);   /* 'fn' | 'sub' | 'cat' */
  var [expanded, setExpanded]     = React.useState({});     /* cat + sub ids */
  var [newFnLabel, setNewFnLabel] = React.useState('');
  var [newFnSys,   setNewFnSys]   = React.useState('');
  var [newFnCat,   setNewFnCat]   = React.useState('');
  var [newFnSub,   setNewFnSub]   = React.useState('');
  var [newSubLabel, setNewSubLabel] = React.useState('');
  var [newSubCat,   setNewSubCat]   = React.useState('');
  var [newCatLabel, setNewCatLabel] = React.useState('');

  /* 初始化：全展開 */
  React.useEffect(function() {
    var init = {};
    (functionTree || []).forEach(function(c) {
      init[c.id] = true;
      (c.children || []).forEach(function(s) { init[s.id] = true; });
    });
    setExpanded(init);
  }, []);

  function toggleExpand(id) {
    setExpanded(function(prev) {
      var n = Object.assign({}, prev); n[id] = !n[id]; return n;
    });
  }

  /* ── 關閉表單 ── */
  function closePanel() {
    setPanel(null);
    setNewFnLabel(''); setNewFnSys(''); setNewFnCat(''); setNewFnSub('');
    setNewSubLabel(''); setNewSubCat('');
    setNewCatLabel('');
  }

  /* ── CRUD helpers ── */
  function toggleFn(catId, subId, fnId) {
    onFunctionTreeChange((functionTree || []).map(function(cat) {
      if (cat.id !== catId) return cat;
      return Object.assign({}, cat, { children: (cat.children || []).map(function(sub) {
        if (sub.id !== subId) return sub;
        return Object.assign({}, sub, { items: sub.items.map(function(fn) {
          return fn.id === fnId ? Object.assign({}, fn, { enabled: !fn.enabled }) : fn;
        })});
      })});
    }));
  }

  function deleteFn(catId, subId, fnId) {
    if (!window.confirm('確認刪除此功能？')) return;
    onFunctionTreeChange((functionTree || []).map(function(cat) {
      if (cat.id !== catId) return cat;
      return Object.assign({}, cat, { children: (cat.children || []).map(function(sub) {
        if (sub.id !== subId) return sub;
        return Object.assign({}, sub, { items: sub.items.filter(function(fn) { return fn.id !== fnId; }) });
      })});
    }));
  }

  function deleteSub(catId, subId) {
    var cat = (functionTree || []).find(function(c) { return c.id === catId; });
    var sub = cat && (cat.children || []).find(function(s) { return s.id === subId; });
    if (!sub) return;
    var msg = sub.items && sub.items.length > 0
      ? '此子系統下有 ' + sub.items.length + ' 個功能，確認刪除？'
      : '確認刪除此子系統？';
    if (!window.confirm(msg)) return;
    onFunctionTreeChange((functionTree || []).map(function(cat) {
      if (cat.id !== catId) return cat;
      return Object.assign({}, cat, { children: (cat.children || []).filter(function(s) { return s.id !== subId; }) });
    }));
  }

  function deleteCat(catId) {
    var cat = (functionTree || []).find(function(c) { return c.id === catId; });
    if (!cat) return;
    var total = (cat.children || []).reduce(function(s, sub) { return s + (sub.items || []).length; }, 0);
    var msg = total > 0
      ? '此分類下共有 ' + (cat.children||[]).length + ' 個子系統、' + total + ' 個功能，確認全部刪除？'
      : '確認刪除此分類？';
    if (!window.confirm(msg)) return;
    onFunctionTreeChange((functionTree || []).filter(function(c) { return c.id !== catId; }));
  }

  function addFn() {
    if (!newFnLabel.trim() || !newFnCat || !newFnSub) return;
    var newId = 'fn-' + Date.now();
    onFunctionTreeChange((functionTree || []).map(function(cat) {
      if (cat.id !== newFnCat) return cat;
      return Object.assign({}, cat, { children: (cat.children || []).map(function(sub) {
        if (sub.id !== newFnSub) return sub;
        var maxOrder = (sub.items || []).reduce(function(m, i) { return Math.max(m, i.order||0); }, 0);
        return Object.assign({}, sub, {
          items: (sub.items || []).concat([{
            id: newId, label: newFnLabel.trim(),
            system: newFnSys.trim() || '', enabled: true, order: maxOrder + 1,
          }]),
        });
      })});
    }));
    closePanel();
  }

  function addSub() {
    if (!newSubLabel.trim() || !newSubCat) return;
    var newId = 'sub-' + Date.now();
    onFunctionTreeChange((functionTree || []).map(function(cat) {
      if (cat.id !== newSubCat) return cat;
      var maxOrder = (cat.children || []).reduce(function(m, s) { return Math.max(m, s.order||0); }, 0);
      return Object.assign({}, cat, {
        children: (cat.children || []).concat([{
          id: newId, label: newSubLabel.trim(), order: maxOrder + 1, items: [],
        }]),
      });
    }));
    setExpanded(function(prev) { var n = Object.assign({}, prev); n[newId] = true; return n; });
    closePanel();
  }

  function addCat() {
    if (!newCatLabel.trim()) return;
    var newId = 'cat-' + Date.now();
    var maxOrder = (functionTree || []).reduce(function(m, c) { return Math.max(m, c.order||0); }, 0);
    onFunctionTreeChange((functionTree || []).concat([{
      id: newId, label: newCatLabel.trim(), order: maxOrder + 1, children: [],
    }]));
    setExpanded(function(prev) { var n = Object.assign({}, prev); n[newId] = true; return n; });
    closePanel();
  }

  /* ── Subcat options filtered by selected cat ── */
  var subOptions = React.useMemo(function() {
    if (!newFnCat) return [];
    var cat = (functionTree || []).find(function(c) { return c.id === newFnCat; });
    return cat ? (cat.children || []) : [];
  }, [newFnCat, functionTree]);

  /* ── Stats ── */
  var totalCat = (functionTree || []).length;
  var totalSub = (functionTree || []).reduce(function(s, c) { return s + (c.children||[]).length; }, 0);
  var totalFn  = (functionTree || []).reduce(function(s, c) {
    return s + (c.children||[]).reduce(function(ss, sub) { return ss + (sub.items||[]).length; }, 0);
  }, 0);
  var enabledFn = (functionTree || []).reduce(function(s, c) {
    return s + (c.children||[]).reduce(function(ss, sub) {
      return ss + (sub.items||[]).filter(function(f) { return f.enabled; }).length;
    }, 0);
  }, 0);

  /* ── Delete icon ── */
  function TrashIcon() {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
        <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
      </svg>
    );
  }

  function DeleteBtn(props) {
    return (
      <antd.Button type="text" size="small" danger onClick={props.onClick}
        title={props.title || '刪除'} icon={<TrashIcon />} style={{ flexShrink: 0 }} />
    );
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }} className="scrollbar-thin">

      {/* ── Header & Stats ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: fz(18), fontWeight: 600, color: C.text }}>APP 管理</div>
          <div style={{ fontSize: fz(13), color: C.textMuted, marginTop: 4 }}>
            管理功能目錄的三層結構：大分類 › 子系統 › 功能
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24, flexShrink: 0 }}>
          {[
            { label: '大分類', value: totalCat },
            { label: '子系統', value: totalSub },
            { label: '功能總數', value: totalFn },
            { label: '前台展示', value: enabledFn },
          ].map(function(s) {
            return (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: fz(20), fontWeight: 700, color: '#2563EB' }}>{s.value}</div>
                <div style={{ fontSize: fz(11), color: C.textMuted }}>{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[
          { key: 'fn',  label: '+ 新增功能' },
          { key: 'sub', label: '+ 新增子系統' },
          { key: 'cat', label: '+ 新增大分類' },
        ].map(function(btn) {
          var isActive = panel === btn.key;
          return (
            <antd.Button key={btn.key}
              type={isActive ? 'primary' : 'default'}
              onClick={function() { panel === btn.key ? closePanel() : (closePanel(), setPanel(btn.key)); }}
            >{btn.label}</antd.Button>
          );
        })}
      </div>

      {/* ── Add Function Form ── */}
      {panel === 'fn' && (
        <div style={{
          background: C.bgSub, border: '1px solid ' + C.border,
          borderRadius: 8, padding: 16, marginBottom: 16,
        }}>
          <div style={{ fontSize: fz(13), fontWeight: 600, color: C.text, marginBottom: 12 }}>新增功能</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {/* 大分類 */}
            <div style={{ flex: '1 1 160px' }}>
              <div style={{ fontSize: fz(11), color: C.textMuted, marginBottom: 4 }}>大分類</div>
              <antd.Select style={{ width: '100%' }} value={newFnCat || undefined} placeholder="請選擇"
                onChange={function(v) { setNewFnCat(v); setNewFnSub(''); }}
                options={(functionTree||[]).map(function(c) { return { value: c.id, label: c.label }; })} />
            </div>
            {/* 子系統 */}
            <div style={{ flex: '1 1 160px' }}>
              <div style={{ fontSize: fz(11), color: C.textMuted, marginBottom: 4 }}>子系統</div>
              <antd.Select style={{ width: '100%' }} value={newFnSub || undefined} placeholder="請選擇" disabled={!newFnCat}
                onChange={function(v) { setNewFnSub(v); }}
                options={subOptions.map(function(s) { return { value: s.id, label: s.label }; })} />
            </div>
            {/* 功能名稱 */}
            <div style={{ flex: '1 1 160px' }}>
              <div style={{ fontSize: fz(11), color: C.textMuted, marginBottom: 4 }}>功能名稱</div>
              <antd.Input value={newFnLabel} onChange={function(e) { setNewFnLabel(e.target.value); }} placeholder="例：工單查詢" />
            </div>
            {/* 系統名稱 */}
            <div style={{ flex: '1 1 120px' }}>
              <div style={{ fontSize: fz(11), color: C.textMuted, marginBottom: 4 }}>系統名稱（選填）</div>
              <antd.Input value={newFnSys} onChange={function(e) { setNewFnSys(e.target.value); }} placeholder="例：ePMM" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <antd.Button type="primary" onClick={addFn} disabled={!newFnLabel.trim() || !newFnCat || !newFnSub}>確認新增</antd.Button>
            <antd.Button onClick={closePanel}>取消</antd.Button>
          </div>
        </div>
      )}

      {/* ── Add Subcategory Form ── */}
      {panel === 'sub' && (
        <div style={{
          background: C.bgSub, border: '1px solid ' + C.border,
          borderRadius: 8, padding: 16, marginBottom: 16,
        }}>
          <div style={{ fontSize: fz(13), fontWeight: 600, color: C.text, marginBottom: 12 }}>新增子系統</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 160px' }}>
              <div style={{ fontSize: fz(11), color: C.textMuted, marginBottom: 4 }}>所屬大分類</div>
              <antd.Select style={{ width: '100%' }} value={newSubCat || undefined} placeholder="請選擇"
                onChange={function(v) { setNewSubCat(v); }}
                options={(functionTree||[]).map(function(c) { return { value: c.id, label: c.label }; })} />
            </div>
            <div style={{ flex: '1 1 160px' }}>
              <div style={{ fontSize: fz(11), color: C.textMuted, marginBottom: 4 }}>子系統名稱</div>
              <antd.Input value={newSubLabel} onChange={function(e) { setNewSubLabel(e.target.value); }} placeholder="例：保養系統" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <antd.Button type="primary" onClick={addSub} disabled={!newSubLabel.trim() || !newSubCat}>確認新增</antd.Button>
            <antd.Button onClick={closePanel}>取消</antd.Button>
          </div>
        </div>
      )}

      {/* ── Add Category Form ── */}
      {panel === 'cat' && (
        <div style={{
          background: C.bgSub, border: '1px solid ' + C.border,
          borderRadius: 8, padding: 16, marginBottom: 16,
        }}>
          <div style={{ fontSize: fz(13), fontWeight: 600, color: C.text, marginBottom: 12 }}>新增大分類</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: fz(11), color: C.textMuted, marginBottom: 4 }}>分類名稱</div>
              <antd.Input value={newCatLabel} onChange={function(e) { setNewCatLabel(e.target.value); }}
                onPressEnter={addCat} placeholder="例：人員管理" />
            </div>
            <antd.Button type="primary" onClick={addCat} disabled={!newCatLabel.trim()} style={{ flexShrink: 0 }}>確認新增</antd.Button>
            <antd.Button onClick={closePanel} style={{ flexShrink: 0 }}>取消</antd.Button>
          </div>
        </div>
      )}

      {/* ── Three-level Tree ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(functionTree||[]).length === 0 && (
          <div style={{ textAlign: 'center', padding: 48, color: C.textMuted, fontSize: fz(13) }}>
            尚無分類，請先新增大分類
          </div>
        )}

        {(functionTree||[]).map(function(cat) {
          var catExp = expanded[cat.id] !== false;
          var catSubCount = (cat.children||[]).length;
          var catFnCount  = (cat.children||[]).reduce(function(s, sub) { return s + (sub.items||[]).length; }, 0);
          var catOnCount  = (cat.children||[]).reduce(function(s, sub) {
            return s + (sub.items||[]).filter(function(f) { return f.enabled; }).length;
          }, 0);
          return (
            <div key={cat.id} style={{ border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden' }}>

              {/* ── L1 Category header ── */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 16px', background: C.bgSub,
                borderBottom: catExp ? '1px solid ' + C.border : 'none',
              }}>
                <button onClick={function() { toggleExpand(cat.id); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                    style={{ transition: 'transform 0.15s', transform: catExp ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                    <path d="M3 2l4 3-4 3" stroke={C.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <span style={{ fontSize: fz(13), fontWeight: 700, color: C.text, flex: 1 }}>{cat.label}</span>
                <span style={{
                  fontSize: fz(11), color: C.textMuted, background: C.bg,
                  padding: '2px 8px', borderRadius: 999, border: '1px solid ' + C.border,
                }}>
                  {catSubCount} 子系統 · {catFnCount} 功能 · {catOnCount} 展示
                </span>
                <DeleteBtn onClick={function() { deleteCat(cat.id); }} title="刪除大分類" />
              </div>

              {catExp && (
                <div>
                  {(cat.children||[]).length === 0 && (
                    <div style={{ padding: '12px 16px 12px 32px', fontSize: fz(12), color: C.textMuted }}>
                      此分類尚無子系統
                    </div>
                  )}

                  {(cat.children||[]).map(function(sub) {
                    var subExp = expanded[sub.id] !== false;
                    var subOnCount = (sub.items||[]).filter(function(f) { return f.enabled; }).length;
                    return (
                      <div key={sub.id}>

                        {/* ── L2 Subcategory header ── */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '8px 16px 8px 32px',
                          background: C.bg,
                          borderBottom: '1px solid ' + C.border,
                        }}>
                          <button onClick={function() { toggleExpand(sub.id); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
                            <svg width="9" height="9" viewBox="0 0 9 9" fill="none"
                              style={{ transition: 'transform 0.15s', transform: subExp ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                              <path d="M2.5 1.5l4 3-4 3" stroke={C.textMuted} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <span style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub, flex: 1 }}>{sub.label}</span>
                          <span style={{
                            fontSize: fz(11), color: C.textMuted,
                            background: C.bgSub, padding: '1px 6px',
                            borderRadius: 999, border: '1px solid ' + C.border,
                          }}>
                            {(sub.items||[]).length} 功能 · {subOnCount} 展示
                          </span>
                          <DeleteBtn onClick={function() { deleteSub(cat.id, sub.id); }} title="刪除子系統" />
                        </div>

                        {/* ── L3 Function rows ── */}
                        {subExp && (
                          <div>
                            {(sub.items||[]).length === 0 && (
                              <div style={{ padding: '10px 16px 10px 56px', fontSize: fz(12), color: C.textMuted }}>
                                此子系統尚無功能
                              </div>
                            )}
                            {(sub.items||[]).map(function(fn) {
                              return (
                                <div key={fn.id} style={{
                                  display: 'flex', alignItems: 'center', gap: 10,
                                  padding: '9px 16px 9px 56px',
                                  borderBottom: '1px solid ' + C.border,
                                  background: C.bg, transition: 'background 0.1s',
                                }}
                                  onMouseEnter={function(e) { e.currentTarget.style.background = C.hover; }}
                                  onMouseLeave={function(e) { e.currentTarget.style.background = C.bg; }}
                                >
                                  <span style={{ flex: 1, fontSize: fz(13), color: fn.enabled ? C.text : C.textMuted }}>
                                    {fn.label}
                                  </span>
                                  {fn.system && (
                                    <span style={{
                                      fontSize: fz(10), color: C.textMuted, fontFamily: 'monospace',
                                      background: C.bgPanel, padding: '1px 6px',
                                      borderRadius: 3, flexShrink: 0,
                                    }}>{fn.system}</span>
                                  )}
                                  <span style={{
                                    fontSize: fz(11), padding: '2px 8px', borderRadius: 999, fontWeight: 500,
                                    background: fn.enabled ? 'rgba(34,197,94,0.1)' : 'rgba(156,163,175,0.15)',
                                    color: fn.enabled ? '#16A34A' : C.textMuted, flexShrink: 0,
                                  }}>{fn.enabled ? '展示中' : '已隱藏'}</span>
                                  {/* Toggle switch → AntD Switch */}
                                  <antd.Switch size="small" checked={fn.enabled}
                                    onChange={function() { toggleFn(cat.id, sub.id, fn.id); }}
                                    style={{ flexShrink: 0 }} />
                                  <DeleteBtn onClick={function() { deleteFn(cat.id, sub.id, fn.id); }} />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ height: 32 }} />
    </div>
  );
}

/* ════════════════════════════════════════
   KPI 報表管理 Setting Tab
   ════════════════════════════════════════ */

/* ── Modal 元件 ── AntD Modal + Form controls（Phase 1 遷移） */
function KpiReportModal({ modal, setModal, flows, onSaveGroup, onSaveReport, onClose }) {
  var { C, fz } = useTheme();
  var isGroupMode  = modal.mode === 'add-group'  || modal.mode === 'edit-group';
  var isReportMode = modal.mode === 'add-report' || modal.mode === 'edit-report';
  var title = { 'add-group': '新增群組', 'edit-group': '編輯群組', 'add-report': '新增報表', 'edit-report': '編輯報表' }[modal.mode];
  var labelStyle = { fontSize: fz(12), fontWeight: 600, color: C.textSub, display: 'block', marginBottom: 8 };
  var urlInvalid = modal.url && !modal.url.startsWith('https://');

  return (
    <antd.Modal
      open={true}
      title={title}
      width={480}
      onCancel={onClose}
      onOk={isGroupMode ? onSaveGroup : onSaveReport}
      okText="儲存"
      cancelText="取消"
    >
      {/* ── Group 模式 ── */}
      {isGroupMode && (
        <div>
          <label style={labelStyle}>群組名稱</label>
          <antd.Input
            value={modal.name || ''}
            onChange={function(e) { setModal(function(prev) { return Object.assign({}, prev, { name: e.target.value }); }); }}
            placeholder="例：設備效能"
          />
        </div>
      )}

      {/* ── Report 模式 ── */}
      {isReportMode && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* 報表名稱 */}
          <div>
            <label style={labelStyle}>報表名稱</label>
            <antd.Input
              value={modal.name || ''}
              onChange={function(e) { setModal(function(prev) { return Object.assign({}, prev, { name: e.target.value }); }); }}
              placeholder="例：FDC 日常巡檢"
            />
          </div>

          {/* 來源類型 → AntD Segmented */}
          <div>
            <label style={labelStyle}>來源類型</label>
            <antd.Segmented
              value={modal.type}
              onChange={function(v) { setModal(function(prev) { return Object.assign({}, prev, { type: v }); }); }}
              options={[{ label: '外部 URL', value: 'url' }, { label: 'EDA3 Flow', value: 'eda3' }]}
            />
          </div>

          {/* URL 輸入框 */}
          {modal.type === 'url' && (
            <div>
              <label style={labelStyle}>報表 URL</label>
              <antd.Input
                value={modal.url || ''}
                onChange={function(e) { setModal(function(prev) { return Object.assign({}, prev, { url: e.target.value }); }); }}
                placeholder="https://..."
                status={urlInvalid ? 'error' : ''}
                style={{ fontFamily: 'monospace' }}
              />
              {urlInvalid && (
                <div style={{ fontSize: fz(11), color: '#EF4444', marginTop: 4 }}>URL 必須以 https:// 開頭</div>
              )}
            </div>
          )}

          {/* EDA3 Flow 下拉 → AntD Select */}
          {modal.type === 'eda3' && (
            <div>
              <label style={labelStyle}>EDA3 Flow</label>
              {flows.length === 0 ? (
                <div style={{ fontSize: fz(13), color: C.textMuted, padding: '8px 12px', borderRadius: 6, border: '1px solid ' + C.border, background: C.bgPanel }}>
                  目前無可用的 EDA3 Flow
                </div>
              ) : (
                <antd.Select
                  style={{ width: '100%' }}
                  value={modal.flowId || undefined}
                  placeholder="請選擇 Flow"
                  onChange={function(v) {
                    var flow = flows.find(function(f) { return f.id === v; });
                    setModal(function(prev) { return Object.assign({}, prev, { flowId: flow ? flow.id : '', flowName: flow ? flow.name : '' }); });
                  }}
                  options={flows.map(function(f) { return { value: f.id, label: f.name + '（最後更新：' + f.lastUpdatedAt + '）' }; })}
                />
              )}
            </div>
          )}

          {/* 啟用狀態 → AntD Switch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <label style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub }}>啟用狀態</label>
            <antd.Switch
              checked={!!modal.enabled}
              onChange={function() { setModal(function(prev) { return Object.assign({}, prev, { enabled: !prev.enabled }); }); }}
            />
            <span style={{ fontSize: fz(12), color: C.textMuted }}>{modal.enabled ? '啟用中' : '已停用'}</span>
          </div>
        </div>
      )}
    </antd.Modal>
  );
}

/* ── 主元件 ── */
function KpiReportSettingTab({ p, isSeedUser }) {
  var { C, fz } = useTheme();
  var personaKey = (p && p.key) || 'equipment';
  var mockData   = (KPI_REPORT_MOCK && KPI_REPORT_MOCK[personaKey]) || { flows: [], groups: [] };

  var [groups, setGroups] = React.useState(
    JSON.parse(JSON.stringify(mockData.groups))
  );
  var [modal, setModal] = React.useState(null);
  var dragInfo = React.useRef({});

  /* ── Modal helpers ── */
  function openAddGroup() {
    setModal({ mode: 'add-group', name: '' });
  }
  function openEditGroup(group) {
    setModal({ mode: 'edit-group', groupId: group.id, name: group.name });
  }
  function openAddReport(groupId) {
    setModal({ mode: 'add-report', groupId: groupId, name: '', type: 'url', url: '', flowId: '', flowName: '', enabled: true });
  }
  function openEditReport(groupId, report) {
    setModal(Object.assign({ mode: 'edit-report', groupId: groupId }, report));
  }
  function closeModal() { setModal(null); }

  /* ── CRUD ── */
  function saveGroup() {
    if (!(modal.name || '').trim()) return;
    if (modal.mode === 'add-group') {
      var ng = { id: 'g_' + Date.now(), name: modal.name.trim(), order: groups.length, reports: [] };
      setGroups(function(prev) { return prev.concat([ng]); });
    } else {
      setGroups(function(prev) {
        return prev.map(function(g) { return g.id === modal.groupId ? Object.assign({}, g, { name: modal.name.trim() }) : g; });
      });
    }
    closeModal();
  }

  function saveReport() {
    if (!(modal.name || '').trim()) return;
    var data = {
      name: modal.name.trim(), type: modal.type,
      url: modal.type === 'url' ? (modal.url || '') : '',
      flowId: modal.type === 'eda3' ? (modal.flowId || '') : '',
      flowName: modal.type === 'eda3' ? (modal.flowName || '') : '',
      enabled: !!modal.enabled,
    };
    if (modal.mode === 'add-report') {
      setGroups(function(prev) {
        return prev.map(function(g) {
          if (g.id !== modal.groupId) return g;
          var nr = Object.assign({ id: 'r_' + Date.now(), order: g.reports.length }, data);
          return Object.assign({}, g, { reports: g.reports.concat([nr]) });
        });
      });
    } else {
      setGroups(function(prev) {
        return prev.map(function(g) {
          if (g.id !== modal.groupId) return g;
          return Object.assign({}, g, {
            reports: g.reports.map(function(r) { return r.id === modal.id ? Object.assign({}, r, data) : r; }),
          });
        });
      });
    }
    closeModal();
  }

  function deleteReport(groupId, reportId) {
    setGroups(function(prev) {
      return prev.map(function(g) {
        return g.id === groupId ? Object.assign({}, g, { reports: g.reports.filter(function(r) { return r.id !== reportId; }) }) : g;
      });
    });
  }

  function deleteGroup(groupId) {
    setGroups(function(prev) { return prev.filter(function(g) { return g.id !== groupId; }); });
  }

  /* ── Drag: Groups ── */
  function onGroupDragStart(e, groupId) {
    dragInfo.current = { type: 'group', id: groupId };
    e.dataTransfer.effectAllowed = 'move';
  }
  function onGroupDragOver(e, groupId) {
    e.preventDefault();
    dragInfo.current.overId = groupId;
  }
  function onGroupDrop(e, targetId) {
    e.preventDefault();
    if (dragInfo.current.type !== 'group' || dragInfo.current.id === targetId) { dragInfo.current = {}; return; }
    var fromId = dragInfo.current.id;
    setGroups(function(prev) {
      var arr = prev.slice();
      var fi = arr.findIndex(function(g) { return g.id === fromId; });
      var ti = arr.findIndex(function(g) { return g.id === targetId; });
      var rem = arr.splice(fi, 1)[0];
      arr.splice(ti, 0, rem);
      return arr.map(function(g, i) { return Object.assign({}, g, { order: i }); });
    });
    dragInfo.current = {};
  }

  /* ── Drag: Reports ── */
  function onReportDragStart(e, groupId, reportId) {
    e.stopPropagation();
    dragInfo.current = { type: 'report', groupId: groupId, id: reportId };
    e.dataTransfer.effectAllowed = 'move';
  }
  function onReportDragOver(e, reportId) {
    e.preventDefault();
    e.stopPropagation();
    dragInfo.current.overReportId = reportId;
  }
  function onReportDrop(e, groupId, targetReportId) {
    e.preventDefault();
    e.stopPropagation();
    if (dragInfo.current.type !== 'report' || dragInfo.current.groupId !== groupId || dragInfo.current.id === targetReportId) { dragInfo.current = {}; return; }
    var fromId = dragInfo.current.id;
    setGroups(function(prev) {
      return prev.map(function(g) {
        if (g.id !== groupId) return g;
        var arr = g.reports.slice();
        var fi = arr.findIndex(function(r) { return r.id === fromId; });
        var ti = arr.findIndex(function(r) { return r.id === targetReportId; });
        var rem = arr.splice(fi, 1)[0];
        arr.splice(ti, 0, rem);
        return Object.assign({}, g, { reports: arr.map(function(r, i) { return Object.assign({}, r, { order: i }); }) });
      });
    });
    dragInfo.current = {};
  }

  var flows     = mockData.flows || [];
  var canEdit   = isSeedUser;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 24 }} className="scrollbar-thin">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: fz(18), fontWeight: 600, color: C.text }}>KPI 報表管理</div>
          <div style={{ fontSize: fz(12), color: C.textMuted, marginTop: 4 }}>設定各分群的 KPI 報表來源與排序，變更即時反映至 KPI 報表頁</div>
        </div>
        {canEdit && (
          <antd.Button type="primary" onClick={openAddGroup}>+ 新增群組</antd.Button>
        )}
      </div>

      {/* Empty state */}
      {groups.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: C.textMuted, fontSize: fz(14) }}>
          尚無群組，點擊「新增群組」開始設定
        </div>
      )}

      {/* Group list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {groups.map(function(group) {
          return (
            <div key={group.id}
              draggable={canEdit}
              onDragStart={canEdit ? function(e) { onGroupDragStart(e, group.id); } : undefined}
              onDragOver={canEdit ? function(e) { onGroupDragOver(e, group.id); } : undefined}
              onDrop={canEdit ? function(e) { onGroupDrop(e, group.id); } : undefined}
              style={{ borderRadius: 8, border: '1px solid ' + C.border, overflow: 'hidden' }}
            >
              {/* Group header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 16px', background: C.bgPanel,
                borderBottom: group.reports.length > 0 ? '1px solid ' + C.border : 'none',
              }}>
                {canEdit && (
                  <span style={{ color: C.textMuted, cursor: 'grab', fontSize: fz(16), userSelect: 'none', flexShrink: 0 }} title="拖曳調整順序">⠿</span>
                )}
                <span style={{ fontSize: fz(14), fontWeight: 600, color: C.text, flex: 1 }}>{group.name}</span>
                <span style={{ fontSize: fz(12), color: C.textMuted, marginRight: 8 }}>{group.reports.length} 份報表</span>
                {canEdit && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <antd.Button size="small" onClick={function() { openEditGroup(group); }}>編輯名稱</antd.Button>
                    <antd.Button size="small" type="primary" onClick={function() { openAddReport(group.id); }}>+ 新增報表</antd.Button>
                    {group.reports.length === 0 && (
                      <antd.Button size="small" danger onClick={function() { deleteGroup(group.id); }}>刪除群組</antd.Button>
                    )}
                  </div>
                )}
              </div>

              {/* Report rows */}
              {group.reports.map(function(report, idx) {
                var isLast = idx === group.reports.length - 1;
                return (
                  <div key={report.id}
                    draggable={canEdit}
                    onDragStart={canEdit ? function(e) { onReportDragStart(e, group.id, report.id); } : undefined}
                    onDragOver={canEdit ? function(e) { onReportDragOver(e, report.id); } : undefined}
                    onDrop={canEdit ? function(e) { onReportDrop(e, group.id, report.id); } : undefined}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 16px', background: C.bg,
                      borderBottom: isLast ? 'none' : '1px solid ' + C.border,
                    }}
                  >
                    {/* 拖曳把手 */}
                    {canEdit && (
                      <span style={{ color: C.textMuted, cursor: 'grab', fontSize: fz(14), userSelect: 'none', flexShrink: 0 }}>⠿</span>
                    )}
                    {/* 狀態圓點 10×10 */}
                    <div style={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, background: report.enabled ? '#22C55E' : '#9CA3AF' }} />
                    {/* 報表名稱 */}
                    <span style={{ flex: 1, fontSize: fz(14), color: C.text, fontWeight: 400 }}>{report.name}</span>
                    {/* 類型 badge */}
                    <span style={{
                      fontSize: fz(11), fontWeight: 700, padding: '2px 10px', borderRadius: 999, flexShrink: 0,
                      background: report.type === 'eda3' ? 'rgba(37,99,235,0.1)' : C.bgPanel,
                      color: report.type === 'eda3' ? '#2563EB' : '#6B7280',
                      border: '1px solid ' + (report.type === 'eda3' ? 'rgba(37,99,235,0.2)' : C.border),
                    }}>{report.type === 'eda3' ? 'EDA3' : 'URL'}</span>
                    {/* 設定值預覽 */}
                    <span style={{
                      fontSize: fz(11), color: C.textMuted, fontFamily: 'monospace',
                      maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0,
                    }}>
                      {report.type === 'eda3' ? report.flowName : report.url}
                    </span>
                    {/* 操作按鈕 (Seed only) */}
                    {canEdit && (
                      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                        <antd.Button size="small" onClick={function() { openEditReport(group.id, report); }} title="編輯">✎</antd.Button>
                        <antd.Button size="small" danger onClick={function() { deleteReport(group.id, report.id); }} title="刪除">✕</antd.Button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Empty row */}
              {group.reports.length === 0 && (
                <div style={{ padding: '16px 24px', fontSize: fz(12), color: C.textMuted, background: C.bg }}>
                  尚無報表，點擊「新增報表」開始設定
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modal && (
        <KpiReportModal
          modal={modal}
          setModal={setModal}
          flows={flows}
          onSaveGroup={saveGroup}
          onSaveReport={saveReport}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

function SettingPage({ p, kpiConfig, onKpiConfigChange, settingJump, isSeedUser, isITUser, functionTree, onFunctionTreeChange, homeLayout, onHomeLayoutChange, notifPrefs, onNotifPrefChange }) {
  var { C, fz } = useTheme();
  var [activeTab, setActiveTab] = React.useState('personal');
  /* jumpSlot: { rowId, slotId } | null — 告知 HomeLayoutTab 自動展開哪個 widget 的設定面板 */
  var [jumpSlot, setJumpSlot] = React.useState(null);
  var [jumpWidgetType, setJumpWidgetType] = React.useState(null);

  /* 當 Home 點 Widget 編輯按鈕導航過來時，切至對應 Setting tab（限 Seed）。
     使用單一 settingJump.nonce 作為 dep，確保每次點擊只有一個目標 tab 生效，
     避免多個獨立 effect 同時觸發互相覆蓋的問題。 */
  React.useEffect(function() {
    if (settingJump && settingJump.nonce > 0 && settingJump.tab && isSeedUser) {
      setActiveTab(settingJump.tab);
      /* home tab + slotInfo → 自訂連結 widget 跳轉 */
      if (settingJump.tab === 'home' && settingJump.slotInfo) {
        setJumpSlot(settingJump.slotInfo);
        setJumpWidgetType(null);
      /* home tab + widgetType → announcement/kpi/app widget 全寬設定跳轉 */
      } else if (settingJump.tab === 'home' && settingJump.widgetType) {
        setJumpSlot(null);
        setJumpWidgetType(settingJump.widgetType);
      } else {
        setJumpSlot(null);
        setJumpWidgetType(null);
      }
    }
  }, [settingJump && settingJump.nonce]);

  /* 若非 Seed 且 activeTab 是 Seed 管理類 tab，重置到 personal */
  React.useEffect(function() {
    if (!isSeedUser && !isITUser && activeTab !== 'personal') setActiveTab('personal');
    if (!isSeedUser && isSeedOnlyTabs.includes(activeTab)) setActiveTab('personal');
    if (!isITUser && activeTab === 'app-management') setActiveTab('personal');
  }, [isSeedUser, isITUser]);

  var seedOnlyTabs = ['permissions', 'home', 'kpi-report', 'knowledge', 'qna'];
  var isSeedOnlyTabs = seedOnlyTabs;

  function NavBtn({ tabKey, label, sub }) {
    var isActive = activeTab === tabKey;
    return (
      <button
        onClick={function(){ setActiveTab(tabKey); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          width: '100%', textAlign: 'left',
          padding: sub ? '8px 16px 8px 28px' : '10px 16px',
          border: 'none', cursor: 'pointer',
          fontSize: sub ? 12 : 13,
          fontWeight: isActive ? 600 : 400,
          background: isActive ? 'rgba(37,99,235,0.08)' : 'transparent',
          color: isActive ? '#2563EB' : (sub ? C.textMuted : C.textSub),
          borderLeft: isActive ? '3px solid #2563EB' : '3px solid transparent',
          transition: 'all 0.1s',
        }}
        onMouseEnter={function(e){ if (!isActive) e.currentTarget.style.background = C.hover; }}
        onMouseLeave={function(e){ if (!isActive) e.currentTarget.style.background = 'transparent'; }}
      >
        {sub && <span style={{ color: C.textMuted, fontSize: fz(10), flexShrink: 0 }}>└</span>}
        {label}
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: C.bg, transition: 'background 0.2s' }}>

      {/* ── Left sidebar ── */}
      <div style={{
        width: 200, borderRight: '1px solid ' + C.border, flexShrink: 0,
        display: 'flex', flexDirection: 'column', padding: '16px 0',
        background: C.bgSub, transition: 'background 0.2s, border-color 0.2s',
      }}>

        {/* ── Personal 區塊（所有用戶可見）── */}
        <div style={{ padding: '4px 16px 8px', fontSize: fz(10), fontWeight: 700, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Personal
        </div>
        <NavBtn tabKey="personal" label="個人偏好" />
        <NavBtn tabKey="quickprompt" label="Quick Prompt" />

        {/* ── Section 管理區塊（僅 Seed 可見）── */}
        {isSeedUser && (
          <>
            <div style={{ margin: '12px 0 8px', height: 1, background: C.border }} />
            <div style={{ padding: '4px 16px 8px', fontSize: fz(10), fontWeight: 700, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Section 管理
            </div>
            {MGMT_TABS.map(function(tab) {
              return <NavBtn key={tab.key} tabKey={tab.key} label={tab.label} sub={tab.sub || false} />;
            })}
          </>
        )}

        {/* ── IT 管理區塊（僅 IT Admin 可見）── */}
        {isITUser && (
          <>
            <div style={{ margin: '12px 0 8px', height: 1, background: C.border }} />
            <div style={{ padding: '4px 16px 8px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: fz(10), fontWeight: 700, color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                IT 管理
              </span>
              <span style={{
                fontSize: fz(9), fontWeight: 700, padding: '1px 5px',
                borderRadius: 3, background: '#7C3AED', color: '#FFFFFF',
                letterSpacing: '0.04em', textTransform: 'uppercase',
              }}>IT Only</span>
            </div>
            <NavBtn tabKey="app-management" label="APP 管理" />
          </>
        )}
      </div>

      {/* ── Right content ── */}
      <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', background: C.bg }}>
        {activeTab === 'personal'       && <PersonalSettingTab notifPrefs={notifPrefs} onNotifPrefChange={onNotifPrefChange} />}
        {activeTab === 'quickprompt'    && <WIPSettingTab title="Quick Prompt" />}
        {activeTab === 'permissions'    && <PermissionsTab p={p} />}
        {activeTab === 'kpi-report'     && <KpiReportSettingTab p={p} isSeedUser={isSeedUser} />}
        {activeTab === 'home'           && <HomeLayoutTab p={p} homeLayout={homeLayout} onHomeLayoutChange={onHomeLayoutChange} onNavigateToTab={setActiveTab} jumpSlot={jumpSlot} onJumpSlotConsumed={function() { setJumpSlot(null); }} kpiConfig={kpiConfig} onKpiConfigChange={onKpiConfigChange} jumpWidgetType={jumpWidgetType} onJumpWidgetTypeConsumed={function() { setJumpWidgetType(null); }} />}
        {activeTab === 'knowledge'      && <KnowledgeTab p={p} />}
        {activeTab === 'qna'            && <WIPSettingTab title="Q&A 管理" />}
        {activeTab === 'app-management' && (
          <AppManagementTab functionTree={functionTree} onFunctionTreeChange={onFunctionTreeChange} />
        )}
      </div>
    </div>
  );
}
