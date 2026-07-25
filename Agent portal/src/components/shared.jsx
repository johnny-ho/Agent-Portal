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
