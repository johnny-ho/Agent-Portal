/* ════════════════════════════════════════
   SHARED COMPONENTS
   ════════════════════════════════════════ */

/* ── Theme System ── */
var LIGHT_COLORS = {
  bg:            '#FFFFFF',
  bgPanel:       '#F5F5F5',
  bgSub:         '#FAFAFA',
  border:        '#E0E0E0',
  borderStrong:  '#D1D5DB',
  text:          '#222222',
  textSub:       '#374151',
  textMuted:     '#9E9E9E',
  hover:         '#F0F0F0',
  hoverAccent:   '#F0F6FF',
  inputBg:       '#FFFFFF',
  navBg:         '#FFFFFF',
  headerBg:      '#FFFFFF',
  cardBg:        '#F5F5F5',
  accentBlue:    '#2563EB',
};

/* ── Gemini-inspired dark palette ──
   bg        : #131314  (near-black, neutral — Gemini main canvas)
   bgPanel   : #1E1E20  (surface layer — sidebar / panels)
   bgSub     : #28292A  (surface variant — cards / inputs)
   border    : #3C3F41  (subtle divider)
   borderStrong: #57595B (stronger divider)
   text      : #E3E3E3  (primary text — slightly off-white, easier on eyes)
   textSub   : #C4C7C5  (secondary text)
   textMuted : #8E918F  (muted / placeholder)
   hover     : #2B2D2F  (hover state on rows/buttons)
   hoverAccent:#1A2B42  (blue-tinted hover for accent elements)
   inputBg   : #28292A  (form inputs)
   navBg     : #1C1B1F  (left sidebar — slightly warmer black)
   headerBg  : #1E1E20  (top bar)
   cardBg    : #28292A  (card backgrounds)
   accentBlue: #8AB4F8  (Google Material dark-mode blue)
*/
var DARK_COLORS = {
  bg:            '#131314',
  bgPanel:       '#1E1E20',
  bgSub:         '#28292A',
  border:        '#3C3F41',
  borderStrong:  '#57595B',
  text:          '#E3E3E3',
  textSub:       '#C4C7C5',
  textMuted:     '#8E918F',
  hover:         '#2B2D2F',
  hoverAccent:   '#1A2B42',
  inputBg:       '#28292A',
  navBg:         '#1C1B1F',
  headerBg:      '#1E1E20',
  cardBg:        '#28292A',
  accentBlue:    '#8AB4F8',
};

var ThemeContext = React.createContext({ isDark: false, C: LIGHT_COLORS, toggle: function(){}, fontSize: 'normal', setFontSize: function(){}, fz: function(n){ return n; } });
function useTheme() { return React.useContext(ThemeContext); }

/* ── AntD 遷移橋接：AppConfigProvider ──
   AntD 全面遷移 Phase 0（見 brain/concepts/antd-migration-plan.md）。
   從 ThemeContext 讀 isDark / fontSize，映射成 AntD ConfigProvider theme token。
   未遷移頁沿用 C / fz；已遷移頁改用 AntD 元件，一律吃這裡的 token。 */
var FONT_SIZE_TOKEN = { small: 12, normal: 14, large: 16 };

function AppConfigProvider({ children }) {
  var ctx = useTheme();
  var isDark = ctx.isDark;
  var C = ctx.C;
  var baseFontSize = FONT_SIZE_TOKEN[ctx.fontSize] || 14;

  // AntD 全域載入前的保護（理論上 shell.html 已先載入 antd UMD）
  if (typeof antd === 'undefined' || !antd.ConfigProvider) {
    return children;
  }
  var ConfigProvider = antd.ConfigProvider;
  var algorithm = isDark ? antd.theme.darkAlgorithm : antd.theme.defaultAlgorithm;

  var theme = {
    algorithm: algorithm,
    token: {
      // UI guideline 核心
      colorPrimary: '#2563EB',
      borderRadius: 6,
      fontSize: baseFontSize,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      // 版面底色：light = 頁 #FFFFFF / 面板 #F5F5F5；dark = 沿用 Gemini palette
      colorBgBase: C.bg,
      colorBgLayout: isDark ? C.bg : '#FFFFFF',
      colorBgContainer: isDark ? C.bgSub : '#FFFFFF',
      colorBgElevated: isDark ? C.bgPanel : '#FFFFFF',
      colorBorder: C.border,
      colorBorderSecondary: C.border,
      colorText: C.text,
      colorTextSecondary: C.textSub,
      colorTextTertiary: C.textMuted,
      colorTextQuaternary: C.textMuted,
      // 陰影：guideline 禁陰影，AntD 預設會洩漏 → 覆寫為極輕
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      boxShadowSecondary: '0 1px 3px rgba(0,0,0,0.08)',
      boxShadowTertiary: '0 1px 3px rgba(0,0,0,0.06)',
      wireframe: false,
    },
    components: {
      // 膠囊 tabs → Segmented（圓角 999 客製，見遷移計畫元件對應表）
      Segmented: { borderRadius: 999, borderRadiusSM: 999 },
      Button: { borderRadius: 6, primaryShadow: 'none', defaultShadow: 'none', dangerShadow: 'none' },
      Card: { boxShadowTertiary: '0 1px 3px rgba(0,0,0,0.06)' },
      // 狀態圓點：guideline 規定 10×10（AntD Badge status dot 預設 6）
      Badge: { dotSize: 10 },
    },
  };

  /* antd.App（component={false} → 不產生任何 DOM 節點，零版面風險）：
     讓已遷移頁可用 antd.App.useApp() 取得吃 theme token 的 message / modal /
     notification，取代原生 alert / confirm（原生對話框不吃 dark mode）。 */
  var inner = antd.App
    ? React.createElement(antd.App, { component: false }, children)
    : children;

  /* autoInsertSpaceInButton: AntD 預設會在「兩個中文字」的按鈕文案中插入空白
     （停用 → 停 用），與本專案原本的文案排版不符，全域關閉。 */
  return React.createElement(ConfigProvider, { theme: theme, autoInsertSpaceInButton: false }, inner);
}

function Avatar({ char, color = '#2563EB', size = 28 }) {
  const { C } = useTheme();
  const isEmoji = typeof char === 'string' && char.length <= 2 && /\p{Emoji}/u.test(char);
  return (
    <div style={{
      width: size, height: size, borderRadius: 6, flexShrink: 0,
      background: isEmoji ? '#F5F5F5' : color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: isEmoji ? '#222222' : 'white', fontWeight: 600, fontSize: isEmoji ? size * 0.55 : size * 0.42,
      border: isEmoji ? '1px solid ' + C.border : 'none'
    }}>{char}</div>
  );
}

const STATUS_CFG = {
  running: { label: '進行中', color: '#22C55E', bg: 'rgba(34,197,94,0.08)' },
  upcoming: { label: '即將開始', color: '#2563EB', bg: 'rgba(37,99,235,0.08)' },
  watch: { label: '需關注', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
};

/* ════════════════════════════════════════
   Skill 三層模型 — 全站共用詞彙
   知識 / 輔助判斷 / SOP。分界是「能不能設成排程」，
   使用者一秒就懂，比講副作用範圍好解釋。
   見 brain/concepts/agent-skill-tiering.md
   ════════════════════════════════════════ */
const SKILL_TIER_CFG = {
  knowledge: {
    label: '知識',
    short: '知',
    color: '#6B7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.2)',
    oneLiner: '把課上的文件變成 AI 查得到的內容',
    detail: '執行時只做檢索與回答，不碰任何系統，也不需要設排程。',
    schedulable: false,
  },
  guided: {
    label: '輔助判斷',
    short: '判',
    color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)',
    oneLiner: '每次狀況不同，AI 依課上的指引研判並給建議',
    detail: '可以查現場數據當證據，但不能異動任何系統；每次結果不一樣，所以不能設成排程。',
    schedulable: false,
  },
  sop: {
    label: 'SOP',
    short: 'SOP',
    color: '#2563EB', bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.2)',
    oneLiner: '每次步驟都一樣、結果可重現的固定流程',
    detail: '執行時完全照核准過的步驟跑，可以設成排程自動執行；會異動系統的步驟一律停下來等人確認。',
    schedulable: true,
  },
};

/* Skill 管理清單只有這兩種。
   2026-07-26 PO 決議：知識從 Skill 管理拆出去獨立成一頁，
   因為它在輔助判斷／SOP 執行前後都會被引用，不是與它們平行的第三條路線。
   SKILL_TIER_CFG.knowledge 保留，僅供舊資料與知識頁的用語一致性使用。 */
const SKILL_TIERS = ['guided', 'sop'];

/* ── 步驟的讀寫性質：Graph 節點與工具列都吃這一份 ── */
const SKILL_IO_CFG = {
  read:     { label: '讀取',   color: '#22C55E', bg: 'rgba(34,197,94,0.08)',   icon: '↓' },
  write:    { label: '會異動', color: '#EF4444', bg: 'rgba(239,68,68,0.08)',   icon: '↑' },
  compute:  { label: '計算',   color: '#6B7280', bg: 'rgba(107,114,128,0.08)', icon: '=' },
  decision: { label: '判斷',   color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  icon: '◆' },
  match:    { label: '比對',   color: '#2563EB', bg: 'rgba(37,99,235,0.08)',   icon: '◆' },
};

function SkillIoTag({ io }) {
  var { fz } = useTheme();
  var cfg = SKILL_IO_CFG[io];
  if (!cfg) return null;
  return (
    <antd.Tag bordered={false} style={{
      marginInlineEnd: 0, borderRadius: 999, flexShrink: 0,
      color: cfg.color, background: cfg.bg,
      fontSize: fz(10), fontWeight: 600, lineHeight: '16px', paddingInline: 8,
    }}>{cfg.label}</antd.Tag>
  );
}

/* 類型徽章（清單欄位、詳情、Chat 都共用同一顆）*/
function SkillTierTag({ tier, size }) {
  var { fz } = useTheme();
  var cfg = SKILL_TIER_CFG[tier];
  if (!cfg) return null;
  return (
    <antd.Tag style={{
      marginInlineEnd: 0, borderRadius: 999,
      color: cfg.color, background: cfg.bg, borderColor: cfg.border,
      fontSize: fz(size === 'small' ? 10 : 11), fontWeight: 600,
      lineHeight: size === 'small' ? '16px' : '18px', paddingInline: 8,
    }}>{cfg.label}</antd.Tag>
  );
}
