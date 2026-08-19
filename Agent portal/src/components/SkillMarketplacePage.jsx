/* ════════════════════════════════════════
   SKILL MARKETPLACE PAGE — 跨課流通（全頁）

   見 brain/concepts/skill-marketplace.md（決策 A–H）

   為什麼是「全頁替換」而不是 Skill 管理的第三個分頁：
     現有兩顆 Segmented 的語意軸是**類型**（Skill／Codify），
     Marketplace 是**來源**。兩個軸混在同一顆膠囊上會壞掉。
     而且「逛別人的東西」與「管自己課的東西」是兩種模式，
     混在同一個清單框裡會讓「這筆是不是我的」得靠標籤去讀。
     下載的終點是回到本課清單，全頁替換的返回路徑天然對得上。

   卡片上四行資訊的順序是刻意的：
     這是什麼 → 誰做的 → 跑不跑得動 → 別人用得如何
   工具可用性擋在採用數據前面 —— 工具不通的話，12 課都說好也沒用。
   ════════════════════════════════════════ */

/* 決策 D：三個行為數字，不做五星。
   「下載了但沒生效」是唯一會誠實反映水土不服的訊號。 */
function MpAdoptionLine({ item, size }) {
  var { C, fz } = useTheme();
  var a = mpAdoption(item);
  if (a.downloads === 0) {
    return <span style={{ fontSize: fz(size || 12), color: C.textMuted }}>尚無下載紀錄</span>;
  }
  var parts = [
    { n: a.downloads,  label: '課下載', color: C.textSub  },
    { n: a.production, label: '課已生效', color: '#22C55E' },
    { n: a.dropped,    label: '課棄用',  color: a.dropped > 0 ? '#F59E0B' : C.textMuted },
  ];
  return (
    <span style={{ fontSize: fz(size || 12), color: C.textMuted }}>
      {parts.map(function(p, i) {
        return (
          <span key={p.label}>
            {i > 0 && <span style={{ margin: '0 8px', color: C.border }}>·</span>}
            <span style={{ color: p.color, fontWeight: i === 0 ? 400 : 600 }}>{p.n}</span> {p.label}
          </span>
        );
      })}
    </span>
  );
}

/* 決策 E：不只揭露工具，還要當場比對本課權限。
   權限落差是跨課最常見的失敗原因，擋在下載前比下載後才發現有價值。 */
function MpToolSummary({ item, p }) {
  var { C, fz } = useTheme();
  var chk = mpToolCheck(p.key, item.tools);
  return (
    <span style={{ fontSize: fz(12), color: C.textMuted }}>
      {chk.total} 個工具 · 本課
      {chk.missing.length === 0
        ? <span style={{ color: '#22C55E', fontWeight: 600 }}> {chk.ok.length} 個全部可用 ✓</span>
        : <span> <span style={{ color: C.textSub }}>{chk.ok.length} 個可用</span>、
            <span style={{ color: '#F59E0B', fontWeight: 600 }}>{chk.missing.length} 個未授權 ⚠</span></span>}
    </span>
  );
}

/* hasWrite 必須在卡片層就看得見 —— 那是風險等級的第一眼，不能藏在詳情頁 */
function MpWriteLine({ item }) {
  var { fz } = useTheme();
  var cfg = item.hasWrite
    ? { text: '含會異動系統的步驟', color: '#EF4444', icon: '⚠' }
    : { text: '全程唯讀，不異動系統', color: '#22C55E', icon: '✓' };
  return (
    <span style={{ fontSize: fz(12), color: cfg.color, fontWeight: 600 }}>
      {cfg.icon} {cfg.text}
    </span>
  );
}

/* 適用範圍在 Marketplace 上**降解析度**：只給類別、台數與觸發條件。
   具體機台編號對別課無意義，且屬課內識別資訊。 */
function mpScopeLine(item) {
  var s = item.originScope || {};
  var bits = [];
  if ((s.equipmentClass || []).length) bits.push(s.equipmentClass.join('、'));
  if (s.targetCount) bits.push('原課 ' + s.targetCount + ' 台');
  var t = s.trigger;
  if (t) {
    if (t.at) bits.push(t.at);
    else if (t.type === 'manual') bits.push('人工調用');
    else if (t.metric) bits.push(t.metric + ' ' + (t.op || '') + ' ' + (t.value || ''));
    else bits.push(SK_TRIGGER_LABEL[t.type] || t.type);
  }
  return bits.join(' · ');
}

/* ════════════════════════════════════════
   MpCard — 列表卡片
   ════════════════════════════════════════ */
function MpCard({ item, p, downloaded, onOpen }) {
  var { C, fz } = useTheme();
  var isMine = item.publisher.section === p.key;

  return (
    <div
      onClick={onOpen}
      style={{
        border: '1px solid ' + C.border, borderRadius: 8, padding: 16,
        background: C.bg, cursor: 'pointer', marginBottom: 16,
      }}
      onMouseEnter={function(e) { e.currentTarget.style.background = C.hover; }}
      onMouseLeave={function(e) { e.currentTarget.style.background = C.bg; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        <SkillTierTag tier={item.tier} size="small" />
        <span style={{ fontSize: fz(14), fontWeight: 600, color: C.text }}>{item.title}</span>
        <span style={{ flex: 1 }} />
        {isMine && (
          <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(10), color: C.textMuted, background: C.bgPanel }}>本課發布</antd.Tag>
        )}
        {downloaded && (
          <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(10), fontWeight: 600, color: '#2563EB', background: 'rgba(37,99,235,0.08)' }}>已下載</antd.Tag>
        )}
        <span style={{ fontSize: fz(12), fontFamily: 'monospace', color: C.textMuted }}>{item.currentVersion}</span>
      </div>

      <div style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.8, marginBottom: 16 }}>{item.purpose}</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: fz(12), color: C.textMuted }}>
          {mpSectionName(item.publisher.section)} · {item.publisher.by} · {item.publisher.at} 發布
        </div>
        <div style={{ fontSize: fz(12), color: C.textMuted }}>{mpScopeLine(item)}</div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <MpToolSummary item={item} p={p} />
          <MpWriteLine item={item} />
        </div>
        <MpAdoptionLine item={item} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MpDetail — 詳情（主欄 + 右側資訊欄）
   ════════════════════════════════════════ */
function MpDetailSection({ title, desc, extra, children }) {
  var { C, fz } = useTheme();
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: fz(14), fontWeight: 600, color: C.text }}>{title}</div>
        <div style={{ flex: 1 }} />
        {extra}
      </div>
      {desc && <div style={{ fontSize: fz(12), color: C.textMuted, lineHeight: 1.8, marginBottom: 8 }}>{desc}</div>}
      {children}
    </div>
  );
}

function MpSideCard({ title, children }) {
  var { C, fz } = useTheme();
  return (
    <div style={{ border: '1px solid ' + C.border, borderRadius: 8, padding: 16, background: C.bg, marginBottom: 16 }}>
      <div style={{ fontSize: fz(11), fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function MpDetail({ item, p, downloaded, onBack, onDownload }) {
  var { C, fz } = useTheme();
  var chk = mpAdoption(item);
  var tools = mpToolCheck(p.key, item.tools);
  var isMine = item.publisher.section === p.key;
  var [confirm, setConfirm] = React.useState(false);

  var scope = item.originScope || {};

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: C.bg }}>

      <div style={{ padding: '8px 24px', borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <antd.Button size="small" type="text" onClick={onBack} style={{ color: C.textSub, flexShrink: 0 }}>← 返回 Marketplace</antd.Button>
        <div style={{ width: 1, height: 24, background: C.border, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <SkillTierTag tier={item.tier} />
            <span style={{ fontSize: fz(18), fontWeight: 600, color: C.text }}>{item.title}</span>
            <span style={{ fontSize: fz(12), fontFamily: 'monospace', color: C.textMuted }}>{item.currentVersion}</span>
          </div>
          <div style={{ fontSize: fz(12), color: C.textMuted, marginTop: 2 }}>
            {mpSectionName(item.publisher.section)} · {item.publisher.by} · {item.publisher.at} 發布
            {item.derivedFrom && ' · 衍生自 ' + mpSectionName(item.derivedFrom.section) + '《' + item.derivedFrom.title + '》' + item.derivedFrom.version}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', gap: 24, padding: '16px 24px', alignItems: 'flex-start' }} className="scrollbar-thin">

        {/* 主欄 */}
        <div style={{ flex: 1, minWidth: 0 }}>

          <MpDetailSection title="這份在做什麼">
            <div style={{
              fontSize: fz(13), color: C.textSub, lineHeight: 1.8, whiteSpace: 'pre-wrap',
              background: C.bgSub, border: '1px solid ' + C.border, borderRadius: 8, padding: 16,
            }}>{item.description}</div>
          </MpDetailSection>

          {(item.plainSteps || []).length > 0 && (
            <MpDetailSection title="逐步流程" desc="白話說明是簽核契約，code 是實作。下載後這一份會直接沿用。">
              <antd.List bordered size="small" dataSource={item.plainSteps}
                renderItem={function(s) {
                  return (
                    <antd.List.Item style={{ gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ fontSize: fz(12), color: C.textMuted, width: 20, flexShrink: 0 }}>{s.num}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: fz(13), color: C.text }}>{s.label}</span>
                          <SkillIoTag io={s.io} />
                          {s.source === 'custom' && (
                            <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(10), color: '#F59E0B', background: 'rgba(245,158,11,0.08)' }}>本課自訂</antd.Tag>
                          )}
                          {s.needsConfirm && (
                            <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(10), fontWeight: 600, color: '#EF4444', background: 'rgba(239,68,68,0.08)' }}>🔒 需人工確認</antd.Tag>
                          )}
                        </div>
                        {s.note && <div style={{ fontSize: fz(12), color: C.textMuted, lineHeight: 1.8, marginTop: 4 }}>{s.note}</div>}
                        {s.tool && <div style={{ fontSize: fz(11), fontFamily: 'monospace', color: C.textMuted, marginTop: 4 }}>{s.system} · {s.tool}</div>}
                      </div>
                    </antd.List.Item>
                  );
                }}
              />
            </MpDetailSection>
          )}

          <MpDetailSection
            title="原課生效範圍"
            desc={'這是' + mpSectionName(item.publisher.section) + '的設定，僅供參考。本課的對象編號不同，下載後須自己重新設定。'}
          >
            <antd.Descriptions bordered size="small" column={1}
              labelStyle={{ fontSize: fz(12), color: C.textMuted, width: 96 }}
              contentStyle={{ fontSize: fz(13), color: C.text }}
              items={[
                { key: 'cls',  label: '機台類別', children: (scope.equipmentClass || []).join('、') || '全部類別' },
                { key: 'area', label: '區域',     children: (scope.area || []).join('、') || '全區' },
                { key: 'ids',  label: '指定機台', children: <span style={{ fontFamily: 'monospace', color: C.textMuted }}>{(scope.equipmentIds || []).join('、') || '—'}</span> },
                { key: 'trg',  label: '觸發條件', children: describeTrigger(scope.trigger) },
              ]}
            />
          </MpDetailSection>

          <MpDetailSection title="版本歷史" desc="下載的人靠變更說明判斷要不要拉這一版。">
            <antd.Timeline
              items={(item.versions || []).map(function(v, i) {
                return {
                  color: i === 0 ? '#2563EB' : '#9E9E9E',
                  children: (
                    <div style={{ paddingBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: fz(13), fontWeight: 600, fontFamily: 'monospace', color: C.text }}>{v.v}</span>
                        <span style={{ fontSize: fz(12), color: C.textMuted }}>{v.at} · {v.by}</span>
                        {i === 0 && (
                          <antd.Tag bordered={false} style={{ marginInlineEnd: 0, borderRadius: 999, fontSize: fz(10), fontWeight: 600, color: '#2563EB', background: 'rgba(37,99,235,0.08)' }}>目前版本</antd.Tag>
                        )}
                      </div>
                      <div style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.8, marginTop: 4 }}>{v.changelog}</div>
                    </div>
                  ),
                };
              })}
            />
          </MpDetailSection>

          {item.originAcceptNote && (
            <MpDetailSection
              title={mpSectionName(item.publisher.section) + '的驗收紀錄'}
              desc="⚠ 這是原課的紀錄，不計入本課簽核。下載後須在本課重跑。"
            >
              <div style={{
                fontSize: fz(13), color: C.textSub, lineHeight: 1.8,
                background: C.bgSub, border: '1px solid ' + C.border, borderRadius: 8, padding: 16,
              }}>{item.originAcceptNote}</div>
            </MpDetailSection>
          )}

          <MpDetailSection title="使用心得" desc="只有已把這份推到生效的課才留得了心得。">
            {(item.reviews || []).length === 0 ? (
              <div style={{ fontSize: fz(13), color: C.textMuted, padding: 16, border: '1px dashed ' + C.border, borderRadius: 8, textAlign: 'center' }}>
                還沒有課留下心得
              </div>
            ) : (
              <antd.List bordered size="small" dataSource={item.reviews}
                renderItem={function(r) {
                  return (
                    <antd.List.Item style={{ display: 'block' }}>
                      <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 4 }}>
                        {mpSectionName(r.section)} · {r.by} · {r.at} · <span style={{ fontFamily: 'monospace' }}>{r.version}</span>
                      </div>
                      <div style={{ fontSize: fz(13), color: C.textSub, lineHeight: 1.8 }}>{r.text}</div>
                    </antd.List.Item>
                  );
                }}
              />
            )}
          </MpDetailSection>
        </div>

        {/* 右側資訊欄 */}
        <div style={{ width: 288, flexShrink: 0 }}>

          <div style={{ border: '1px solid ' + C.border, borderRadius: 8, padding: 16, background: C.bg, marginBottom: 16 }}>
            {isMine ? (
              <div style={{ fontSize: fz(12), color: C.textMuted, lineHeight: 1.8 }}>
                這份是本課發布的，不需要下載。
              </div>
            ) : downloaded ? (
              <div style={{ fontSize: fz(12), color: C.textMuted, lineHeight: 1.8 }}>
                本課已下載這一份（{downloaded.origin.version}），在 Skill 管理清單裡。
              </div>
            ) : (
              <React.Fragment>
                <antd.Button type="primary" block onClick={function() { setConfirm(true); }}>下載到本課</antd.Button>
                <div style={{ fontSize: fz(12), color: C.textMuted, lineHeight: 1.8, marginTop: 8 }}>
                  落地為 Draft，需重走測試與簽核
                </div>
              </React.Fragment>
            )}
          </div>

          <MpSideCard title="本課工具檢查">
            {tools.ok.map(function(t) {
              return (
                <div key={t.name} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <span style={{ color: '#22C55E', fontSize: fz(12), flexShrink: 0 }}>✓</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: fz(12), fontFamily: 'monospace', color: C.textSub, wordBreak: 'break-all' }}>{t.name}</div>
                    <div style={{ fontSize: fz(11), color: C.textMuted }}>{t.system} · {SKILL_IO_CFG[t.mode] ? SKILL_IO_CFG[t.mode].label : t.mode}</div>
                  </div>
                </div>
              );
            })}
            {tools.missing.map(function(t) {
              return (
                <div key={t.name} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <span style={{ color: '#F59E0B', fontSize: fz(12), flexShrink: 0 }}>⚠</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: fz(12), fontFamily: 'monospace', color: C.textSub, wordBreak: 'break-all' }}>{t.name}</div>
                    <div style={{ fontSize: fz(11), color: '#F59E0B' }}>本課未授權</div>
                    <div style={{ fontSize: fz(11), color: C.textMuted, lineHeight: 1.8 }}>→ 找 IT 開通，或下載後改用其他工具</div>
                  </div>
                </div>
              );
            })}
          </MpSideCard>

          <MpSideCard title="風險">
            <div style={{ marginBottom: 8 }}><MpWriteLine item={item} /></div>
            <div style={{ fontSize: fz(12), color: C.textSub }}>
              {(item.plainSteps || []).filter(function(s) { return s.needsConfirm; }).length > 0
                ? '⚠ ' + (item.plainSteps || []).filter(function(s) { return s.needsConfirm; }).length + ' 步需人工確認'
                : '✓ 無需人工確認步驟'}
            </div>
          </MpSideCard>

          <MpSideCard title="採用狀況">
            {chk.downloads === 0 ? (
              <div style={{ fontSize: fz(13), color: C.textMuted }}>尚無下載紀錄</div>
            ) : (
              [
                { label: '課下載',   n: chk.downloads,  color: C.text },
                { label: '課已生效', n: chk.production, color: '#22C55E' },
                { label: '課測試中', n: chk.testing,    color: '#F59E0B' },
                { label: '課棄用',   n: chk.dropped,    color: chk.dropped > 0 ? '#F59E0B' : C.textMuted },
              ].map(function(row) {
                return (
                  <div key={row.label} style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: fz(18), fontWeight: 600, color: row.color, minWidth: 24 }}>{row.n}</span>
                    <span style={{ fontSize: fz(12), color: C.textMuted }}>{row.label}</span>
                  </div>
                );
              })
            )}
          </MpSideCard>
        </div>
      </div>

      {confirm && (
        <MpDownloadModal
          item={item} p={p}
          onCancel={function() { setConfirm(false); }}
          onConfirm={function() { setConfirm(false); onDownload(item); }}
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════
   MpDownloadModal — 下載確認

   這是決策 A（副本不訂閱）與 B（落 Draft、不自動 remap）
   的**唯一一次完整解釋**。之後的畫面不再重複說明機制，只標狀態。
   ════════════════════════════════════════ */
function MpDownloadModal({ item, p, onCancel, onConfirm }) {
  var { C, fz } = useTheme();
  var tools = mpToolCheck(p.key, item.tools);

  function Row({ icon, color, title, lines }) {
    return (
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <span style={{ color: color, fontSize: fz(13), flexShrink: 0, fontWeight: 600 }}>{icon}</span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: fz(13), fontWeight: 600, color: C.text, marginBottom: 4 }}>{title}</div>
          {lines.map(function(l, i) {
            return <div key={i} style={{ fontSize: fz(12), color: C.textMuted, lineHeight: 1.8 }}>{l}</div>;
          })}
        </div>
      </div>
    );
  }

  return (
    <antd.Modal
      open
      title="下載到本課"
      onCancel={onCancel}
      width={560}
      footer={[
        <antd.Button key="c" onClick={onCancel}>取消</antd.Button>,
        <antd.Button key="ok" type="primary" onClick={onConfirm}>下載為 Draft</antd.Button>,
      ]}
    >
      <div style={{ fontSize: fz(14), fontWeight: 600, color: C.text, marginBottom: 16 }}>
        {item.title} {item.currentVersion}（{mpSectionName(item.publisher.section)}）
      </div>

      <div style={{ fontSize: fz(12), color: C.textMuted, marginBottom: 16 }}>下載後會發生什麼：</div>

      <Row icon="✓" color="#22C55E" title="直接沿用"
        lines={[(item.plainSteps || []).length ? '流程說明、逐步流程、工具清單、標籤' : '指引全文、工具清單、標籤']} />

      <Row icon="⚠" color="#F59E0B" title="必須由你重新設定"
        lines={[
          '適用範圍 —— ' + mpSectionName(item.publisher.section) + '的對象編號在本課不存在',
          '引用知識 —— 原本引用的是' + mpSectionName(item.publisher.section) + '的文件',
          (item.tier === 'sop' ? '情境試跑' : '驗收') + ' —— ' + mpSectionName(item.publisher.section) + '的紀錄不計入本課簽核',
        ]} />

      {tools.missing.length > 0 && (
        <Row icon="⚠" color="#F59E0B" title={'本課有 ' + tools.missing.length + ' 個工具未授權'}
          lines={[
            tools.missing.map(function(t) { return t.name; }).join('、'),
            '在開通或替換之前，這份跑不完整。',
          ]} />
      )}

      <div style={{
        fontSize: fz(12), color: C.textSub, lineHeight: 1.8,
        background: C.bgSub, border: '1px solid ' + C.border, borderRadius: 8, padding: 16,
      }}>
        它會落在 Draft，走完測試 → 簽核 → Pilot Run 才會生效。
        之後{mpSectionName(item.publisher.section)}再出新版，你會收到提示，但不會自動更新。
      </div>
    </antd.Modal>
  );
}

/* ════════════════════════════════════════
   主頁面
   ════════════════════════════════════════ */
function SkillMarketplacePage({ p, mySkills, onBack, onDownload }) {
  var { C, fz } = useTheme();
  var [tier, setTier]       = React.useState(SKILL_DEFAULT_TIER);
  var [query, setQuery]     = React.useState('');
  var [onlyOk, setOnlyOk]   = React.useState(false);
  var [sortBy, setSortBy]   = React.useState('adopted');
  var [openId, setOpenId]   = React.useState(null);

  var listed = mpListed(p.key);

  /* 本課已下載哪幾份 —— 以本課 skill 的 origin 為準，不另存狀態 */
  function downloadedOf(item) {
    return (mySkills || []).filter(function(s) {
      return s.origin && s.origin.marketplaceId === item.id;
    })[0] || null;
  }

  var tierCounts = {};
  SKILL_TIERS.forEach(function(t) {
    tierCounts[t] = listed.filter(function(x) { return x.tier === t; }).length;
  });

  var displayed = listed
    .filter(function(it) { return it.tier === tier; })
    .filter(function(it) { return !onlyOk || mpToolCheck(p.key, it.tools).missing.length === 0; })
    .filter(function(it) {
      if (!query.trim()) return true;
      var q = query.toLowerCase();
      return it.title.toLowerCase().indexOf(q) !== -1
          || (it.purpose || '').toLowerCase().indexOf(q) !== -1
          || mpSectionName(it.publisher.section).indexOf(query.trim()) !== -1
          || (it.tags || []).join(' ').toLowerCase().indexOf(q) !== -1;
    })
    .sort(function(a, b) {
      if (sortBy === 'adopted') return mpAdoption(b).production - mpAdoption(a).production;
      if (sortBy === 'newest')  return b.publisher.at.localeCompare(a.publisher.at);
      if (sortBy === 'name')    return a.title.localeCompare(b.title, 'zh');
      return 0;
    });

  var openItem = openId ? listed.filter(function(it) { return it.id === openId; })[0] : null;
  if (openItem) {
    return (
      <MpDetail
        key={openItem.id}
        item={openItem}
        p={p}
        downloaded={downloadedOf(openItem)}
        onBack={function() { setOpenId(null); }}
        onDownload={onDownload}
      />
    );
  }

  var tierTabOptions = SKILL_TIERS.map(function(t) {
    var cfg = SKILL_TIER_CFG[t];
    var active = tier === t;
    return {
      value: t,
      label: (
        <span style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', color: active ? '#FFFFFF' : C.textSub, fontWeight: 600, fontSize: fz(13) }}>
          {cfg.label}
          <span style={{
            fontSize: fz(10), padding: '0 8px', borderRadius: 999, fontWeight: 600,
            background: active ? 'rgba(255,255,255,0.25)' : C.hover,
            color: active ? '#FFFFFF' : C.textMuted,
          }}>{tierCounts[t] || 0}</span>
        </span>
      ),
    };
  });

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, background: C.bg }}>

      <div style={{ padding: '8px 24px', borderBottom: '1px solid ' + C.border, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <antd.Button size="small" type="text" onClick={onBack} style={{ color: C.textSub, flexShrink: 0 }}>← 返回 Skill 管理</antd.Button>
        <div style={{ width: 1, height: 24, background: C.border, flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: fz(14), color: C.text }}>Skill Marketplace</div>
          <div style={{ fontSize: fz(12), color: C.textMuted }}>其他課發布的 Skill 與 Codify · 下載後在本課重走測試與簽核才會生效</div>
        </div>
      </div>

      <antd.ConfigProvider theme={{ components: { Segmented: { itemSelectedBg: '#2563EB', itemSelectedColor: '#FFFFFF' } } }}>
        <div style={{ padding: '16px 24px 8px', flexShrink: 0 }}>
          <antd.Segmented value={tier} onChange={setTier} options={tierTabOptions} style={{ alignSelf: 'flex-start' }} />
        </div>

        <div style={{ padding: '8px 24px', borderBottom: '1px solid ' + C.border, display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, overflowX: 'auto' }} className="scrollbar-none">
          <antd.Input
            allowClear
            value={query}
            onChange={function(e) { setQuery(e.target.value); }}
            prefix={<span style={{ color: C.textMuted, fontSize: fz(12) }}>🔍</span>}
            aria-label="搜尋 Marketplace"
            placeholder="搜尋名稱、用途、發布課別…"
            style={{ flex: 1, minWidth: 176 }}
          />
          <antd.Checkbox checked={onlyOk} onChange={function(e) { setOnlyOk(e.target.checked); }} style={{ flexShrink: 0, fontSize: fz(12), color: C.textSub }}>
            只看本課工具都可用
          </antd.Checkbox>
          <antd.Select
            value={sortBy}
            onChange={setSortBy}
            aria-label="排序方式"
            style={{ width: 168, flexShrink: 0 }}
            options={[
              { value: 'adopted', label: '排序：最多課已生效' },
              { value: 'newest',  label: '排序：最新發布' },
              { value: 'name',    label: '排序：名稱 A→Z' },
            ]}
          />
        </div>
      </antd.ConfigProvider>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }} className="scrollbar-thin">
        {displayed.length === 0 ? (
          <antd.Empty
            image={antd.Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span style={{ fontSize: fz(13), color: C.textMuted }}>
                {onlyOk ? '沒有本課工具全部可用的 ' + SKILL_TIER_CFG[tier].label : '沒有符合條件的 ' + SKILL_TIER_CFG[tier].label}
              </span>
            }
            style={{ padding: 32 }}
          />
        ) : displayed.map(function(it) {
          return (
            <MpCard
              key={it.id}
              item={it}
              p={p}
              downloaded={downloadedOf(it)}
              onOpen={function() { setOpenId(it.id); }}
            />
          );
        })}
      </div>
    </div>
  );
}
