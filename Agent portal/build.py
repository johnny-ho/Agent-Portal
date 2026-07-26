#!/usr/bin/env python3
"""
build.py — Agent Portal builder
用途：將 src/ 下的模組化原始碼合併，產生單一可瀏覽的 HTML 檔案。

使用方式：
    python3 build.py                  # 輸出至 ../index.html
    python3 build.py --output <path>  # 指定輸出路徑
"""

import os
import sys

# ── 路徑設定 ──────────────────────────────────────────────────────────────
BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
SRC_DIR     = os.path.join(BASE_DIR, 'src')
SHELL_FILE  = os.path.join(SRC_DIR, 'shell.html')
STYLES_FILE = os.path.join(SRC_DIR, 'styles.css')
OUTPUT_FILE = os.path.join(os.path.dirname(BASE_DIR), 'index.html')

# ── JS/JSX 模組載入順序（順序很重要！下層依賴上層）────────────────────────
JS_MODULES = [
    os.path.join(SRC_DIR, 'data',       'personas.js'),
    os.path.join(SRC_DIR, 'data',       'tasks.js'),
    os.path.join(SRC_DIR, 'data',       'scheduling.js'),
    os.path.join(SRC_DIR, 'data',       'apps.js'),
    os.path.join(SRC_DIR, 'data',       'kpiReportConfig.js'),
    os.path.join(SRC_DIR, 'data',       'notifications.js'),
    os.path.join(SRC_DIR, 'components', 'shared.jsx'),
    os.path.join(SRC_DIR, 'components', 'NotificationCenter.jsx'),
    os.path.join(SRC_DIR, 'components', 'KpiWidgetSettingPage.jsx'),
    os.path.join(SRC_DIR, 'components', 'SectionPage.jsx'),
    os.path.join(SRC_DIR, 'components', 'KPIPage.jsx'),
    os.path.join(SRC_DIR, 'components', 'KnowledgePage.jsx'),
    os.path.join(SRC_DIR, 'components', 'ChatPage.jsx'),
    os.path.join(SRC_DIR, 'components', 'SkillCreateFlow.jsx'),
    os.path.join(SRC_DIR, 'components', 'SkillManagementPage.jsx'),
    os.path.join(SRC_DIR, 'components', 'SettingPage.jsx'),
    os.path.join(SRC_DIR, 'components', 'TaskManagementPage.jsx'),
    os.path.join(SRC_DIR, 'components', 'SchedulingPage.jsx'),
    os.path.join(SRC_DIR, 'components', 'AppCenterPage.jsx'),
    os.path.join(SRC_DIR, 'components', 'App.jsx'),
]

# ── 解析命令列參數 ──────────────────────────────────────────────────────────
if '--output' in sys.argv:
    idx = sys.argv.index('--output')
    if idx + 1 < len(sys.argv):
        OUTPUT_FILE = sys.argv[idx + 1]

# ── 讀取各模組內容 ──────────────────────────────────────────────────────────
def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

shell   = read_file(SHELL_FILE)
styles  = read_file(STYLES_FILE)
js_parts = []
for mod in JS_MODULES:
    name = os.path.relpath(mod, SRC_DIR)
    js_parts.append(f'/* ── {name} ── */')
    js_parts.append(read_file(mod))
js_combined = '\n\n'.join(js_parts)

# ── 組合輸出 HTML ───────────────────────────────────────────────────────────
style_block  = f'<style>\n{styles}</style>'
script_block = f'<script type="text/babel">\nconst {{ useState }} = React;\n\n{js_combined}\n</script>'

output = shell \
    .replace('{{STYLES}}',  style_block) \
    .replace('{{SCRIPT}}',  script_block)

# ── 寫出檔案 ────────────────────────────────────────────────────────────────
with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    f.write(output)

print(f'✅ Build 成功 → {OUTPUT_FILE}')
print(f'   模組數：{len(JS_MODULES)} 個 JS/JSX + styles.css + shell.html')
print(f'   輸出大小：{os.path.getsize(OUTPUT_FILE):,} bytes')
