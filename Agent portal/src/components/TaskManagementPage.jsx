/* ════════════════════════════════════════
   TASK MANAGEMENT PAGE  v3
   AntD 遷移 Phase 2（見 brain/concepts/antd-migration-plan.md）
   Table（tree data：主任務 → 子任務）+ Drawer 為本頁主場景。
   ════════════════════════════════════════ */

const TASK_STATUS_CFG = {
  pending:     { label: '未開始', color: '#6B7280', bg: 'rgba(158,158,158,0.1)' },
  in_progress: { label: '進行中', color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
  done:        { label: '已完成', color: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
  overdue:     { label: '逾期',   color: '#F97316', bg: 'rgba(249,115,22,0.08)' },
};

const PRIORITY_CFG = {
  P1: { color: '#EF4444', bg: 'rgba(239,68,68,0.08)' },
  P2: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  P3: { color: '#6B7280', bg: 'rgba(158,158,158,0.08)' },
};

/* 列表欄寬（Table columns 與上方欄位 header 共用，確保對齊）*/
const TM_COL_W = { status: 80, assignee: 128, tags: 280, due: 72, arrow: 24 };

function fmtDate(d) {
  if (!d) return '—';
  const p = d.split('-');
  return `${p[1]}/${p[2]}`;
}

function groupByDate(tasks) {
  const groups = {};
  tasks.forEach(t => {
    const key = t.completedAt || t.dueDate;
    if (!groups[key]) groups[key] = [];
    groups[key].push(t);
  });
  return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
}

/* ── 狀態圓點 → AntD Badge（dotSize token 已設 10，符合 guideline 10×10）── */
function TStatusDot({ status }) {
  const cfg = TASK_STATUS_CFG[status] || TASK_STATUS_CFG.pending;
  return <antd.Badge color={cfg.color} />;
}

/* ── 通用小標籤（AntD Tag，關掉預設右外距以配合 flex gap）── */
function TagChip({ color, bg, radius = 4, mono, bold, size, children }) {
  const { fz } = useTheme();
  return (
    <antd.Tag
      bordered={false}
      style={{
        marginInlineEnd: 0, background: bg, color: color,
        borderRadius: radius, fontSize: fz(size || 11),
        fontWeight: bold ? 600 : 400, lineHeight: '18px',
        fontFamily: mono ? 'monospace' : undefined,
        paddingInline: 8,
      }}
    >{children}</antd.Tag>
  );
}

/* ── Status + Priority badges ── */
function TStatusBadge({ status }) {
  const cfg = TASK_STATUS_CFG[status] || TASK_STATUS_CFG.pending;
  return <TagChip color={cfg.color} bg={cfg.bg} radius={999} bold>{cfg.label}</TagChip>;
}
function TPriorityBadge({ priority }) {
  const cfg = PRIORITY_CFG[priority] || PRIORITY_CFG.P3;
  return <TagChip color={cfg.color} bg={cfg.bg} radius={4} bold size={10}>{priority}</TagChip>;
}

/* ── 成員 Avatar（emoji/首字邏輯為自製，依遷移計畫保留）── */
function MemberAvatar({ name, size = 28, active }) {
  const { C } = useTheme();
  return (
    <div style={{
      width: size, height: size, borderRadius: 9999, flexShrink: 0,
      background: active ? '#2563EB' : C.hover,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.43, fontWeight: 600,
      color: active ? '#FFFFFF' : C.textSub,
    }}>
      {name ? name[0] : '—'}
    </div>
  );
}

/* ════════════════════════════════════════
   成員摘要卡（頂部）
   ════════════════════════════════════════ */
function MemberSummaryStrip({ members, activeTasks, selectedMember, onSelect }) {
  const { C, fz } = useTheme();
  return (
    <div style={{
      display: 'flex', gap: 8, overflowX: 'auto', padding: '8px 16px',
      alignItems: 'stretch',
      borderBottom: '1px solid ' + C.border, background: C.bg, flexShrink: 0,
    }}>
      {/* 全部 */}
      <antd.Button
        size="small"
        type={selectedMember === '' ? 'primary' : 'default'}
        onClick={() => onSelect('')}
        style={{ flex: '0 0 auto', alignSelf: 'center' }}
      >全部成員</antd.Button>

      {members.map(m => {
        const mTasks = activeTasks.filter(t => t.assignee === m);
        const done = mTasks.filter(t => t.status === 'done').length;
        const overdue = mTasks.filter(t => t.status === 'overdue').length;
        const pct = mTasks.length > 0 ? Math.round(done / mTasks.length * 100) : 0;
        const sel = selectedMember === m;
        return (
          <div key={m} onClick={() => onSelect(sel ? '' : m)} style={{
            flex: '0 0 auto', padding: 8, borderRadius: 6,
            border: '1px solid ' + (sel ? '#2563EB' : C.border),
            background: sel ? C.hoverAccent : C.bg,
            cursor: 'pointer', textAlign: 'left', minWidth: 112,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <MemberAvatar name={m} size={20} active={sel} />
              <span style={{ fontSize: fz(12), fontWeight: 600, color: C.textSub }}>{m}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: fz(11), color: C.textMuted }}>{mTasks.length} 件</span>
              {overdue > 0 && <span style={{ fontSize: fz(11), color: '#F97316', fontWeight: 600 }}>逾期 {overdue}</span>}
            </div>
            <antd.Progress
              percent={pct}
              showInfo={false}
              strokeWidth={2}
              strokeColor={overdue > 0 ? '#F97316' : '#22C55E'}
              trailColor={C.border}
              style={{ marginTop: 8, marginBottom: 0, lineHeight: 1 }}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════
   派工面板（全寬，每人多行輸入）
   ════════════════════════════════════════ */
function AssignPanel({ members, onSubmit, onCancel }) {
  const { C, fz } = useTheme();
  const today = '2026-04-20';

  // 每個成員有一個 rows 陣列
  const initRows = () => {
    const map = {};
    members.forEach(m => { map[m] = [{ id: Date.now() + Math.random(), text: '', dueDate: today, priority: 'P2' }]; });
    return map;
  };
  const [rows, setRows] = React.useState(initRows);

  function addRow(member) {
    setRows(prev => ({
      ...prev,
      [member]: [...prev[member], { id: Date.now() + Math.random(), text: '', dueDate: today, priority: 'P2' }],
    }));
  }
  function removeRow(member, id) {
    setRows(prev => ({
      ...prev,
      [member]: prev[member].filter(r => r.id !== id),
    }));
  }
  function updateRow(member, id, field, val) {
    setRows(prev => ({
      ...prev,
      [member]: prev[member].map(r => r.id === id ? { ...r, [field]: val } : r),
    }));
  }

  function handleSubmit() {
    const newTasks = [];
    members.forEach(m => {
      rows[m].forEach(r => {
        if (!r.text.trim()) return;
        newTasks.push({
          id: 'T-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
          title: r.text.trim(),
          assignee: m,
          machine: '—', chamber: '—', recipe: '—',
          status: 'pending',
          priority: r.priority,
          dueDate: r.dueDate,
          createdAt: today,
          createdBy: '王志明',
          note: '',
          aiTags: true, // 標記等待 AI 自動加 tag
        });
      });
    });
    if (newTasks.length === 0) { onCancel(); return; }
    onSubmit(newTasks);
  }

  const totalFilled = members.reduce((acc, m) => acc + rows[m].filter(r => r.text.trim()).length, 0);
  const labelStyle = { fontSize: fz(11), color: C.textMuted, fontWeight: 600 };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bgSub }}>
      {/* 派工面板 header */}
      <div style={{
        padding: '8px 24px', borderBottom: '1px solid ' + C.border,
        background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div>
          <span style={{ fontSize: fz(14), fontWeight: 600, color: C.textSub }}>快速派工</span>
          <span style={{ fontSize: fz(12), color: C.textMuted, marginLeft: 8 }}>為課內成員分配任務，機台 / Chamber / Recipe 由 AI 自動標記</span>
        </div>
        <antd.Space size={8}>
          <antd.Button onClick={onCancel}>取消</antd.Button>
          <antd.Button type="primary" disabled={totalFilled === 0} onClick={handleSubmit}>
            確認派工 {totalFilled > 0 ? `(${totalFilled}筆)` : ''}
          </antd.Button>
        </antd.Space>
      </div>

      {/* 成員輸入區 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {members.map(m => (
          <div key={m} style={{
            background: C.bg, border: '1px solid ' + C.border, borderRadius: 8, overflow: 'hidden',
          }}>
            {/* 成員標頭 */}
            <div style={{
              padding: '8px 16px', background: C.bgPanel,
              display: 'flex', alignItems: 'center', gap: 8,
              borderBottom: '1px solid ' + C.border,
            }}>
              <MemberAvatar name={m} size={24} />
              <span style={{ fontSize: fz(13), fontWeight: 600, color: C.textSub }}>{m}</span>
              <span style={{ fontSize: fz(11), color: C.textMuted }}>
                {rows[m].filter(r => r.text.trim()).length > 0
                  ? `已填 ${rows[m].filter(r => r.text.trim()).length} 筆`
                  : '尚未填寫'}
              </span>
            </div>
            {/* 欄位 label（guideline：不得以 placeholder 取代 label）*/}
            <div style={{ padding: '8px 16px 0', display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ width: 16, flexShrink: 0 }} />
              <span style={{ ...labelStyle, flex: 1 }}>任務描述</span>
              <span style={{ ...labelStyle, width: 72, flexShrink: 0 }}>優先級</span>
              <span style={{ ...labelStyle, width: 128, flexShrink: 0 }}>截止日</span>
              <span style={{ width: 24, flexShrink: 0 }} />
            </div>
            {/* 任務輸入列 */}
            <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rows[m].map((row, idx) => (
                <div key={row.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: fz(11), color: C.textMuted, width: 16, flexShrink: 0, textAlign: 'right' }}>{idx + 1}.</span>
                  <antd.Input
                    size="small"
                    value={row.text}
                    onChange={e => updateRow(m, row.id, 'text', e.target.value)}
                    style={{ flex: 1, minWidth: 0 }}
                  />
                  <antd.Select
                    size="small"
                    value={row.priority}
                    onChange={v => updateRow(m, row.id, 'priority', v)}
                    style={{ width: 72, flexShrink: 0 }}
                    options={[{ value: 'P1', label: 'P1' }, { value: 'P2', label: 'P2' }, { value: 'P3', label: 'P3' }]}
                  />
                  <antd.DatePicker
                    size="small"
                    allowClear={false}
                    value={row.dueDate ? dayjs(row.dueDate) : null}
                    onChange={d => updateRow(m, row.id, 'dueDate', d ? d.format('YYYY-MM-DD') : '')}
                    style={{ width: 128, flexShrink: 0 }}
                  />
                  <span style={{ width: 24, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                    {rows[m].length > 1 && (
                      <antd.Button size="small" type="text" onClick={() => removeRow(m, row.id)}>✕</antd.Button>
                    )}
                  </span>
                </div>
              ))}
              <antd.Button
                type="link" size="small"
                onClick={() => addRow(m)}
                style={{ alignSelf: 'flex-start', paddingInline: 0, marginLeft: 24 }}
              >＋ 加一筆</antd.Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   任務列表 — AntD Table（tree data：subTasks → children）
   ════════════════════════════════════════ */
function useTaskColumns() {
  const { C, fz } = useTheme();

  return [
    {
      title: '', dataIndex: 'status', key: 'status', width: TM_COL_W.status,
      render: function (v) { return <TStatusDot status={v} />; },
    },
    {
      title: '負責人', dataIndex: 'assignee', key: 'assignee', width: TM_COL_W.assignee,
      render: function (v, r) {
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <MemberAvatar name={v} size={r._isSubTask ? 20 : 24} />
            <span style={{
              fontSize: fz(12), fontWeight: 500, color: C.textMuted,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{v}</span>
          </span>
        );
      },
    },
    {
      title: '任務描述', dataIndex: 'title', key: 'title',
      render: function (v, r) {
        const isDone = r.status === 'done';
        const hasSubs = !r._isSubTask && r.children && r.children.length > 0;
        const doneCount = hasSubs ? r.children.filter(s => s.status === 'done').length : 0;
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{
              fontSize: fz(r._isSubTask ? 12 : 13),
              color: isDone ? C.textMuted : C.text,
              fontWeight: isDone || r._isSubTask ? 400 : 500,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              textDecoration: isDone ? 'line-through' : 'none',
            }}>{v}</span>
            {hasSubs && (
              <TagChip
                radius={999} bold
                color={doneCount === r.children.length ? '#15803D' : '#2563EB'}
                bg={doneCount === r.children.length ? 'rgba(34,197,94,0.1)' : 'rgba(37,99,235,0.08)'}
              >{doneCount}/{r.children.length} 子任務</TagChip>
            )}
          </span>
        );
      },
    },
    {
      title: '標籤', dataIndex: 'tags', key: 'tags', width: TM_COL_W.tags, align: 'right',
      render: function (_, r) {
        if (r._isSubTask) return null;
        return (
          <span style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'flex-end', flexWrap: 'nowrap', overflow: 'hidden' }}>
            <TPriorityBadge priority={r.priority} />
            {r.machine && r.machine !== '—' && <TagChip color={C.textMuted} bg={C.bgPanel}>{r.machine}</TagChip>}
            {r.chamber && r.chamber !== '—' && <TagChip color={C.textMuted} bg={C.bgPanel}>{r.chamber}</TagChip>}
            {r.recipe && r.recipe !== '—' && <TagChip color={C.textMuted} bg={C.bgPanel} mono>{r.recipe}</TagChip>}
            {r.aiTags && <TagChip color={C.textMuted} bg={C.bgPanel} size={10}>AI標記中</TagChip>}
          </span>
        );
      },
    },
    {
      title: '截止', dataIndex: 'dueDate', key: 'dueDate', width: TM_COL_W.due, align: 'right',
      render: function (v, r) {
        const done = r.status === 'done';
        return (
          <span style={{
            fontSize: fz(11),
            color: r.status === 'overdue' ? '#F97316' : done ? '#22C55E' : C.textMuted,
          }}>{done && r._isSubTask ? '完成' : fmtDate(v)}</span>
        );
      },
    },
    {
      title: '', dataIndex: 'arrow', key: 'arrow', width: TM_COL_W.arrow, align: 'right',
      render: function () { return <span style={{ fontSize: fz(11), color: C.borderStrong }}>›</span>; },
    },
  ];
}

/* 列表欄位 header（與 Table columns 共用欄寬，維持對齊）*/
function TaskColumnHeader() {
  const { C, fz } = useTheme();
  const cell = { fontSize: fz(10), color: C.textMuted, padding: '0 8px' };
  return (
    <div style={{
      display: 'flex', alignItems: 'center', height: 24,
      borderBottom: '1px solid ' + C.border,
      background: C.bgSub, position: 'sticky', top: 0, zIndex: 10,
    }}>
      <span style={{ ...cell, width: TM_COL_W.status, flexShrink: 0 }} />
      <span style={{ ...cell, width: TM_COL_W.assignee, flexShrink: 0 }}>負責人</span>
      <span style={{ ...cell, flex: 1, minWidth: 0 }}>任務描述</span>
      <span style={{ ...cell, width: TM_COL_W.tags, flexShrink: 0, textAlign: 'right' }}>標籤</span>
      <span style={{ ...cell, width: TM_COL_W.due, flexShrink: 0, textAlign: 'right' }}>截止</span>
      <span style={{ ...cell, width: TM_COL_W.arrow, flexShrink: 0 }} />
    </div>
  );
}

/* 分組標頭（成員 / 日期）*/
function TaskGroupHeader({ label, count }) {
  const { C, fz } = useTheme();
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '8px 16px', fontSize: fz(11), fontWeight: 600, color: C.textMuted,
      background: C.bgSub, borderBottom: '1px solid ' + C.border,
    }}>
      <span>{label}</span>
      {count != null && <span style={{ fontWeight: 400 }}>{count} 件</span>}
    </div>
  );
}

function TaskGroupTable({ tasks, columns, expandedIds, onToggleExpand, selectedId, selectedSubTaskId, onSelectTask, onSelectSubTask }) {
  const dataSource = tasks.map(function (t) {
    const row = Object.assign({}, t, { key: t.id, _isSubTask: false });
    if (t.subTasks && t.subTasks.length > 0) {
      row.children = t.subTasks.map(function (st) {
        return Object.assign({}, st, {
          key: st.id, _isSubTask: true, _parentId: t.id, _parentTitle: t.title,
        });
      });
    }
    return row;
  });

  return (
    <antd.Table
      columns={columns}
      dataSource={dataSource}
      rowKey="key"
      size="small"
      tableLayout="fixed"
      pagination={false}
      showHeader={false}
      expandable={{
        indentSize: 16,
        expandedRowKeys: Array.from(expandedIds),
        onExpand: function (exp, record) { onToggleExpand(record.key); },
      }}
      rowClassName={function (record) {
        const sel = record._isSubTask
          ? selectedSubTaskId === record.key
          : (selectedId === record.key && !selectedSubTaskId);
        return sel ? 'tm-row-selected' : '';
      }}
      onRow={function (record) {
        return {
          style: { cursor: 'pointer' },
          onClick: function () {
            if (record._isSubTask) onSelectSubTask(record._parentId, record.key);
            else onSelectTask(record.key);
          },
        };
      }}
    />
  );
}

/* ════════════════════════════════════════
   右側 Drawer（AntD Drawer，限縮於主體區域）
   ════════════════════════════════════════ */
function TaskDrawer({ task, allTasks, onStatusChange, onSubTaskStatusChange, onAddSubTask, onClose }) {
  const { C, fz, isDark } = useTheme();
  // Drawer 內層面板：dark 時 colorBgElevated 已等於 C.bgPanel，需再高一階才看得出層次
  const panelBg = isDark ? C.bgSub : C.bgPanel;
  const [note, setNote] = React.useState(task.note || '');
  const [saved, setSaved] = React.useState(false);
  const [addingSubTask, setAddingSubTask] = React.useState(false);
  const [newSubTitle, setNewSubTitle] = React.useState('');
  const [newSubAssignee, setNewSubAssignee] = React.useState('');

  const hasSubs = task.subTasks && task.subTasks.length > 0;
  const doneCount = hasSubs ? task.subTasks.filter(s => s.status === 'done').length : 0;

  // 同成員的其他任務
  const siblingTasks = allTasks.filter(t => t.assignee === task.assignee && t.id !== task.id && !t.subTasks);

  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 1500); }

  function handleAddSubTask() {
    if (!newSubTitle.trim()) return;
    onAddSubTask && onAddSubTask(task.id, {
      id: 'ST-' + task.id + '-' + Date.now(),
      title: newSubTitle.trim(),
      assignee: newSubAssignee || task.assignee,
      status: 'pending',
      dueDate: task.dueDate,
    });
    setNewSubTitle('');
    setNewSubAssignee('');
    setAddingSubTask(false);
  }

  const nextStatus = { pending: 'in_progress', in_progress: 'done', overdue: 'in_progress' };
  const actionLabel = { pending: '開始執行', in_progress: '標記完成', overdue: '重新執行' };
  const sectionLabel = { fontSize: fz(11), fontWeight: 600, color: C.textSub, marginBottom: 8, display: 'block' };

  const infoItems = [
    { key: 'due', label: '截止日期', children: fmtDate(task.dueDate) },
    { key: 'machine', label: '機台', children: task.machine || '—' },
    { key: 'chamber', label: 'Chamber', children: task.chamber || '—' },
    { key: 'recipe', label: 'Recipe', children: <span style={{ fontFamily: 'monospace' }}>{task.recipe || '—'}</span> },
    { key: 'createdBy', label: '派工人', children: task.createdBy || '—' },
    { key: 'createdAt', label: '建立日', children: fmtDate(task.createdAt) },
  ];
  if (task.completedAt) infoItems.push({ key: 'completedAt', label: '完成日', children: task.completedAt });

  const drawerTitle = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
      <MemberAvatar name={task.assignee} size={28} />
      <div style={{ flex: 1, minWidth: 0 }}>
        {task._isSubTask && (
          <div style={{ marginBottom: 4 }}>
            <TagChip color="#2563EB" bg="rgba(37,99,235,0.08)" size={10}>↳ {task._parentTitle}</TagChip>
          </div>
        )}
        <div style={{ fontSize: fz(11), color: C.textMuted, fontWeight: 400 }}>{task.assignee}</div>
        <div style={{ fontSize: fz(13), fontWeight: 600, color: C.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {task.title}
        </div>
      </div>
    </div>
  );

  return (
    <antd.Drawer
      open
      onClose={onClose}
      placement="right"
      width={400}
      mask={false}
      getContainer={false}
      rootStyle={{ position: 'absolute' }}
      title={drawerTitle}
      styles={{ header: { padding: '8px 16px' }, body: { padding: 16 } }}
    >
      {/* 狀態 + 優先級 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <TStatusBadge status={task.status} />
        <TPriorityBadge priority={task.priority} />
      </div>

      {/* 基本資訊 */}
      <div style={{ background: panelBg, borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <antd.Descriptions
          column={1}
          size="small"
          colon={false}
          items={infoItems}
          labelStyle={{ fontSize: fz(11), color: C.textMuted, width: 72 }}
          contentStyle={{ fontSize: fz(12), color: C.textSub, fontWeight: 500 }}
        />
      </div>

      {/* 子任務區塊（子任務本身不顯示此區塊）*/}
      {!task._isSubTask && (
        <div style={{ marginBottom: 16 }}>
          <span style={sectionLabel}>子任務{hasSubs ? ` ${doneCount} / ${task.subTasks.length} 完成` : ''}</span>
          <div style={{ background: panelBg, borderRadius: 8, padding: '0 8px' }}>
            <antd.List
              size="small"
              dataSource={task.subTasks || []}
              locale={{ emptyText: <span style={{ fontSize: fz(12), color: C.textMuted }}>尚無子任務</span> }}
              renderItem={function (st) {
                return (
                  <antd.List.Item
                    style={{ paddingInline: 8 }}
                    actions={st.status !== 'done' ? [
                      <antd.Button key="done" size="small" onClick={function () { onSubTaskStatusChange && onSubTaskStatusChange(task.id, st.id, 'done'); }}>完成</antd.Button>,
                    ] : null}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                      <TStatusDot status={st.status} />
                      <MemberAvatar name={st.assignee} size={18} />
                      <span style={{
                        flex: 1, fontSize: fz(12),
                        color: st.status === 'done' ? C.textMuted : C.textSub,
                        textDecoration: st.status === 'done' ? 'line-through' : 'none',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{st.title}</span>
                    </span>
                  </antd.List.Item>
                );
              }}
            />
            {/* 新增子任務 */}
            {addingSubTask ? (
              <div style={{ padding: '8px 8px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div>
                  <span style={{ fontSize: fz(11), color: C.textMuted, display: 'block', marginBottom: 8 }}>子任務描述</span>
                  <antd.Input
                    autoFocus size="small"
                    value={newSubTitle}
                    onChange={e => setNewSubTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddSubTask(); if (e.key === 'Escape') setAddingSubTask(false); }}
                  />
                </div>
                <div>
                  <span style={{ fontSize: fz(11), color: C.textMuted, display: 'block', marginBottom: 8 }}>負責人（預設：{task.assignee}）</span>
                  <antd.Input
                    size="small"
                    value={newSubAssignee}
                    onChange={e => setNewSubAssignee(e.target.value)}
                  />
                </div>
                <antd.Space size={8}>
                  <antd.Button size="small" type="primary" onClick={handleAddSubTask}>新增</antd.Button>
                  <antd.Button size="small" onClick={() => { setAddingSubTask(false); setNewSubTitle(''); setNewSubAssignee(''); }}>取消</antd.Button>
                </antd.Space>
              </div>
            ) : (
              <antd.Button type="link" size="small" onClick={() => setAddingSubTask(true)} style={{ paddingInline: 8, margin: '8px 0' }}>
                ＋ 新增子任務
              </antd.Button>
            )}
          </div>
        </div>
      )}

      {/* 備註 */}
      <div style={{ marginBottom: 16 }}>
        <span style={sectionLabel}>備註</span>
        <antd.Input.TextArea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <antd.Button size="small" onClick={handleSave} style={saved ? { color: '#22C55E', borderColor: '#22C55E' } : undefined}>
            {saved ? '✓ 已儲存' : '儲存'}
          </antd.Button>
        </div>
      </div>

      {/* 狀態操作 */}
      {task.status !== 'done' && nextStatus[task.status] && (
        <antd.Button
          type="primary" block
          onClick={() => onStatusChange(task.id, nextStatus[task.status])}
          style={Object.assign(
            { marginBottom: 16 },
            nextStatus[task.status] === 'done' ? { background: '#22C55E', borderColor: '#22C55E' } : null
          )}
        >{actionLabel[task.status]}</antd.Button>
      )}
      {task.status === 'done' && (
        <antd.Alert type="success" showIcon message="任務已完成" style={{ marginBottom: 16 }} />
      )}

      {/* 同成員其他任務 */}
      {siblingTasks.length > 0 && (
        <div>
          <span style={sectionLabel}>{task.assignee} 的其他任務</span>
          <antd.List
            size="small"
            dataSource={siblingTasks.slice(0, 4)}
            renderItem={function (t) {
              return (
                <antd.List.Item style={{ paddingInline: 0 }}>
                  <span style={{ display: 'flex', gap: 8, alignItems: 'center', minWidth: 0, flex: 1 }}>
                    <TStatusDot status={t.status} />
                    <span style={{ flex: 1, fontSize: fz(12), color: C.textSub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</span>
                    <span style={{ fontSize: fz(11), color: C.textMuted, flexShrink: 0 }}>{fmtDate(t.dueDate)}</span>
                  </span>
                </antd.List.Item>
              );
            }}
          />
        </div>
      )}
    </antd.Drawer>
  );
}

/* ════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════ */
function TaskManagementPage({ p, initialFilter, initialOpenId }) {
  const { C, fz } = useTheme();
  const taskData = TASKS_BY_PERSONA[p.key] || { members: [], machines: [], chambers: [], recipes: [], active: [], history: [] };
  const columns = useTaskColumns();

  const [tab, setTab] = React.useState('active');
  const [selectedMember, setSelectedMember] = React.useState(initialFilter || '');
  const [filterStatus, setFilterStatus] = React.useState('');
  const [selectedId, setSelectedId] = React.useState(null);
  const [selectedSubTaskId, setSelectedSubTaskId] = React.useState(null);
  const [showAssign, setShowAssign] = React.useState(false);
  const [activeTasks, setActiveTasks] = React.useState(taskData.active);
  const [expandedIds, setExpandedIds] = React.useState(new Set());

  React.useEffect(() => { if (initialFilter) setSelectedMember(initialFilter); }, [initialFilter]);

  React.useEffect(() => {
    if (initialOpenId) {
      setSelectedId(initialOpenId);
      setSelectedSubTaskId(null);
      setExpandedIds(prev => { const n = new Set(prev); n.add(initialOpenId); return n; });
    }
  }, [initialOpenId]);

  /* 篩選 */
  const srcTasks = tab === 'active' ? activeTasks : taskData.history;
  const filtered = srcTasks.filter(t => {
    if (selectedMember && t.assignee !== selectedMember) return false;
    if (filterStatus && t.status !== filterStatus) return false;
    return true;
  });

  const selectedTask = [...activeTasks, ...taskData.history].find(t => t.id === selectedId);
  const liveSelectedTask = activeTasks.find(t => t.id === selectedId) || selectedTask;

  /* 派工送出 */
  function handleAssignSubmit(newTasks) {
    setActiveTasks(prev => [...newTasks, ...prev]);
    setShowAssign(false);
  }

  /* 展開/收合主任務 */
  function toggleExpand(id) {
    setExpandedIds(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  /* 主任務狀態更新 */
  function handleStatusChange(id, newStatus) {
    setActiveTasks(prev => prev.map(t =>
      t.id === id ? { ...t, status: newStatus, completedAt: newStatus === 'done' ? '2026-04-20' : undefined } : t
    ));
  }

  /* 子任務狀態更新 */
  function handleSubTaskStatusChange(parentId, subTaskId, newStatus) {
    setActiveTasks(prev => prev.map(t => {
      if (t.id !== parentId || !t.subTasks) return t;
      const updatedSubs = t.subTasks.map(s => s.id === subTaskId ? { ...s, status: newStatus } : s);
      const allDone = updatedSubs.every(s => s.status === 'done');
      return { ...t, subTasks: updatedSubs, status: allDone ? 'done' : t.status === 'done' ? 'in_progress' : t.status };
    }));
  }

  /* 新增子任務 */
  function handleAddSubTask(parentId, newSub) {
    setActiveTasks(prev => prev.map(t =>
      t.id === parentId
        ? { ...t, subTasks: [...(t.subTasks || []), newSub], status: t.status === 'pending' ? 'in_progress' : t.status }
        : t
    ));
  }

  /* 列選取 */
  function selectTask(id) { setSelectedId(id); setSelectedSubTaskId(null); setShowAssign(false); }
  function selectSubTask(parentId, subId) { setSelectedId(parentId); setSelectedSubTaskId(subId); setShowAssign(false); }

  const groupTableProps = {
    columns: columns,
    expandedIds: expandedIds,
    onToggleExpand: toggleExpand,
    selectedId: selectedId,
    selectedSubTaskId: selectedSubTaskId,
    onSelectTask: selectTask,
    onSelectSubTask: selectSubTask,
  };

  /* 列表按成員分組（history 按日期分組）*/
  let listContent;
  if (tab === 'history') {
    const grouped = groupByDate(filtered);
    listContent = grouped.length === 0
      ? <antd.Empty style={{ padding: 48 }} description={<span style={{ fontSize: fz(13), color: C.textMuted }}>無符合條件的歷史紀錄</span>} />
      : grouped.map(([date, tasks]) => (
          <div key={date}>
            <TaskGroupHeader label={date} count={tasks.length} />
            <TaskGroupTable tasks={tasks} {...groupTableProps} />
          </div>
        ));
  } else {
    /* 進行中：依成員分組 */
    const membersToShow = selectedMember ? [selectedMember] : taskData.members;
    const rows = [];
    membersToShow.forEach(m => {
      const mTasks = filtered.filter(t => t.assignee === m);
      if (mTasks.length === 0) return;
      rows.push(
        <div key={m}>
          <TaskGroupHeader label={m} count={mTasks.length} />
          <TaskGroupTable tasks={mTasks} {...groupTableProps} />
        </div>
      );
    });
    listContent = rows.length > 0 ? rows : (
      <antd.Empty style={{ padding: 48 }} description={<span style={{ fontSize: fz(13), color: C.textMuted }}>無符合條件的任務</span>} />
    );
  }

  /* 膠囊 tabs → Segmented（選中背景 #2563EB 依 guideline，以巢狀 ConfigProvider 侷限於本頁）*/
  function tabLabel(text, count, active) {
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

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: C.bg }}>

      {/* ── 成員摘要列（永遠顯示）── */}
      <MemberSummaryStrip
        members={taskData.members}
        activeTasks={activeTasks}
        selectedMember={selectedMember}
        onSelect={setSelectedMember}
      />

      {/* ── Tab + 工具列 ── */}
      <div style={{
        padding: '0 16px', height: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid ' + C.border, background: C.bg, flexShrink: 0,
      }}>
        <antd.ConfigProvider theme={{ components: { Segmented: { itemSelectedBg: '#2563EB', itemSelectedColor: '#FFFFFF' } } }}>
          <antd.Segmented
            size="small"
            value={tab}
            onChange={v => { setTab(v); setSelectedId(null); setSelectedSubTaskId(null); setShowAssign(false); }}
            options={[
              { value: 'active', label: tabLabel('進行中', activeTasks.length, tab === 'active') },
              { value: 'history', label: tabLabel('歷史紀錄', taskData.history.length, tab === 'history') },
            ]}
          />
        </antd.ConfigProvider>

        {/* 右側工具 */}
        <antd.Space size={8}>
          {/* 狀態篩選 */}
          <antd.Select
            size="small"
            value={filterStatus}
            onChange={setFilterStatus}
            style={{ width: 112 }}
            options={[{ value: '', label: '全部狀態' }].concat(
              Object.keys(TASK_STATUS_CFG).map(k => ({ value: k, label: TASK_STATUS_CFG[k].label }))
            )}
          />
          {(filterStatus || selectedMember) && (
            <antd.Button size="small" type="link" onClick={() => { setFilterStatus(''); setSelectedMember(''); }}>清除</antd.Button>
          )}
          {/* 派工按鈕（只在進行中顯示）*/}
          {tab === 'active' && (
            <antd.Button
              size="small" type="primary"
              onClick={() => { setShowAssign(v => !v); setSelectedId(null); setSelectedSubTaskId(null); }}
            >＋ 派工</antd.Button>
          )}
        </antd.Space>
      </div>

      {/* ── 主體 ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        {showAssign ? (
          <AssignPanel
            members={taskData.members}
            onSubmit={handleAssignSubmit}
            onCancel={() => setShowAssign(false)}
          />
        ) : (
          <div className="tm-list" style={{ flex: 1, overflow: 'auto', padding: '0 8px' }}>
            <TaskColumnHeader />
            {listContent}
          </div>
        )}

        {/* Drawer */}
        {selectedId && liveSelectedTask && !showAssign && (
          <TaskDrawer
            key={selectedId + (selectedSubTaskId || '')}
            task={selectedSubTaskId
              ? { ...liveSelectedTask.subTasks.find(s => s.id === selectedSubTaskId), _isSubTask: true, _parentTitle: liveSelectedTask.title }
              : liveSelectedTask
            }
            allTasks={activeTasks}
            onStatusChange={selectedSubTaskId
              ? (id, ns) => handleSubTaskStatusChange(selectedId, selectedSubTaskId, ns)
              : handleStatusChange
            }
            onSubTaskStatusChange={handleSubTaskStatusChange}
            onAddSubTask={handleAddSubTask}
            onClose={() => { setSelectedId(null); setSelectedSubTaskId(null); }}
          />
        )}
      </div>
    </div>
  );
}
