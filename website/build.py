#!/usr/bin/env python3
"""
build.py — Agent Portal 官網 builder
用途：將 src/ 下的分段原始碼合併，產生單一可瀏覽的 HTML 檔案。

使用方式：
    python3 build.py                  # 輸出至 ./index.html
    python3 build.py --output <path>  # 指定輸出路徑

注意：輸出的 index.html 為 build 成品，請勿直接修改；所有改動請回到 src/。
"""

import os
import shutil
import sys

BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
SRC_DIR     = os.path.join(BASE_DIR, 'src')
SHELL_FILE  = os.path.join(SRC_DIR, 'shell.html')
STYLES_FILE = os.path.join(SRC_DIR, 'styles.css')
SECTION_DIR = os.path.join(SRC_DIR, 'sections')
ASSET_DIR   = os.path.join(SRC_DIR, 'assets')
OUTPUT_FILE = os.path.join(BASE_DIR, 'index.html')

# ── 段落載入順序（順序即頁面由上而下的順序）────────────────────────────────
SECTIONS = [
    '00-header.html',    # 置頂導覽列
    '01-hero.html',      # 你的課，有一個自己的工作站
    '02-workspace.html', # 打開長這樣（Home 截圖）
    '03-section.html',   # 為什麼是「課」
    '04-places.html',    # 六個去處
    '05-shift.html',     # 一個班的一天（EE / PE / MFG）
    '06-yours.html',     # 這個地盤，你們自己管
    '07-faq.html',       # 常見疑問
    '08-cta.html',       # 收尾 CTA
    '09-footer.html',    # 頁尾
]

if '--output' in sys.argv:
    idx = sys.argv.index('--output')
    if idx + 1 < len(sys.argv):
        OUTPUT_FILE = sys.argv[idx + 1]


def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()


shell  = read_file(SHELL_FILE)
styles = read_file(STYLES_FILE)

parts = []
for name in SECTIONS:
    path = os.path.join(SECTION_DIR, name)
    if not os.path.exists(path):
        print(f'  ✗ 缺少段落：{name}')
        sys.exit(1)
    parts.append(f'<!-- ── {name} ── -->\n' + read_file(path))
    print(f'  ✓ {name}')

content = '\n\n'.join(parts)
html = shell.replace('{{STYLES}}', f'<style>\n{styles}\n</style>').replace('{{CONTENT}}', content)

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    f.write(html)

# ── 複製 assets 到輸出檔旁邊（HTML 以 assets/… 相對路徑引用）──────────────
asset_out = os.path.join(os.path.dirname(os.path.abspath(OUTPUT_FILE)), 'assets')
if os.path.isdir(ASSET_DIR):
    if os.path.isdir(asset_out) and os.path.abspath(asset_out) != os.path.abspath(ASSET_DIR):
        shutil.rmtree(asset_out)
    if os.path.abspath(asset_out) != os.path.abspath(ASSET_DIR):
        shutil.copytree(ASSET_DIR, asset_out)
    print(f'  ✓ assets/ ({len(os.listdir(asset_out))} 個檔案)')

print(f'\n輸出：{OUTPUT_FILE}  ({len(html) / 1024:.1f} KB)')
