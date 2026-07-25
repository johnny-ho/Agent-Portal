/* ════════════════════════════════════════
   NOTIFICATION CENTER — Header 鈴鐺 + Popover 面板
   通知中心 v1（見 brain/entities/modules/notification.md）
   採 AntD Badge / Popover；面板列樣式依 UI guideline（10px 狀態圓點、8px 間距）。
   低摩擦：清除/忽略不留紀錄、不回報已讀狀態。
   ════════════════════════════════════════ */

function NotificationBell({ notifications, prefs, onOpenItem, onMarkAllRead }) {
  const { C, fz } = useTheme();
  const Popover = antd.Popover;
  const Badge = antd.Badge;
  const Empty = antd.Empty;
  const [open, setOpen] = React.useState(false);

  // 只顯示站內開關為開的類型（Personal 層自管）
  const visible = React.useMemo(function () {
    return (notifications || []).filter(function (n) {
      const p = prefs && prefs[n.type];
      return p ? p.inApp : true;
    });
  }, [notifications, prefs]);

  const unreadCount = visible.filter(function (n) { return !n.read; }).length;

  // 未讀置頂，其餘依 ts 由新到舊
  const sorted = React.useMemo(function () {
    return visible.slice().sort(function (a, b) {
      if (!!a.read !== !!b.read) return a.read ? 1 : -1;
      return b.ts - a.ts;
    });
  }, [visible]);

  const handleRowClick = function (n) {
    setOpen(false);
    if (onOpenItem) onOpenItem(n);
  };

  const panel = (
    <div style={{ width: 340, maxHeight: 440, display: 'flex', flexDirection: 'column' }}>
      {/* 面板標題列 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid ' + C.border,
      }}>
        <span style={{ fontSize: fz(14), fontWeight: 600, color: C.text }}>通知</span>
        <button
          onClick={onMarkAllRead}
          disabled={unreadCount === 0}
          style={{
            background: 'none', border: 'none', padding: 0,
            cursor: unreadCount === 0 ? 'default' : 'pointer',
            fontSize: fz(12),
            color: unreadCount === 0 ? C.textMuted : '#2563EB',
            fontWeight: 500,
          }}
        >全部標為已讀</button>
      </div>

      {/* 通知清單（保留 7 天） */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {sorted.length === 0 ? (
          <div style={{ padding: '32px 16px' }}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span style={{ fontSize: fz(12), color: C.textMuted }}>目前沒有通知</span>} />
          </div>
        ) : (
          sorted.map(function (n) {
            const meta = (typeof NOTIF_TYPES !== 'undefined' && NOTIF_TYPES[n.type]) || { dot: '#9E9E9E', short: '' };
            return (
              <div
                key={n.id}
                onClick={function () { handleRowClick(n); }}
                style={{
                  display: 'flex', gap: 8, alignItems: 'flex-start',
                  padding: '12px 16px',
                  borderBottom: '1px solid ' + C.border,
                  cursor: 'pointer',
                  background: n.read ? 'transparent' : C.hoverAccent,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={function (e) { e.currentTarget.style.background = C.hover; }}
                onMouseLeave={function (e) { e.currentTarget.style.background = n.read ? 'transparent' : C.hoverAccent; }}
              >
                {/* 狀態圓點：10×10，四色規範 */}
                <span style={{
                  width: 10, height: 10, borderRadius: 999, background: meta.dot,
                  flexShrink: 0, marginTop: 4,
                  opacity: n.read ? 0.4 : 1,
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: fz(13), fontWeight: n.read ? 400 : 600,
                    color: C.text, lineHeight: 1.35, marginBottom: 2,
                  }}>{n.title}</div>
                  <div style={{
                    fontSize: fz(12), color: C.textSub, lineHeight: 1.4,
                    marginBottom: 4,
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>{n.desc}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: fz(11), color: meta.dot, fontWeight: 500 }}>{meta.short}</span>
                    <span style={{ fontSize: fz(11), color: C.textMuted }}>{n.timeLabel}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="bottomRight"
      content={panel}
      styles={{ body: { padding: 0 } }}
    >
      <button
        aria-label="通知"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 28, height: 28, borderRadius: 6,
          border: '1px solid ' + (open ? '#2563EB' : C.border),
          background: open ? 'rgba(37,99,235,0.08)' : C.headerBg,
          cursor: 'pointer', padding: 0, flexShrink: 0,
          transition: 'background 0.2s, border-color 0.2s',
        }}
      >
        <Badge count={unreadCount} size="small" offset={[2, -2]}>
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M10 2.5c-2.9 0-5 2.1-5 5v2.8L3.7 13c-.3.6.1 1.3.8 1.3h11c.7 0 1.1-.7.8-1.3L15 10.3V7.5c0-2.9-2.1-5-5-5z"
              stroke={open ? '#2563EB' : C.textSub} strokeWidth="1.5" strokeLinejoin="round" fill="none" />
            <path d="M8 16.5a2 2 0 004 0" stroke={open ? '#2563EB' : C.textSub} strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </Badge>
      </button>
    </Popover>
  );
}
