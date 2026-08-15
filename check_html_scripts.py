from pathlib import Path
import re

html = Path('index.html').read_text(encoding='utf-8')
scripts = re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>', html, flags=re.S | re.I)
if not scripts:
    raise SystemExit('Nenhum script inline encontrado')
Path('/tmp/sasaki_inline.js').write_text('\n\n'.join(scripts), encoding='utf-8')
print(f'inline_scripts={len(scripts)} bytes={len("\n".join(scripts))}')
