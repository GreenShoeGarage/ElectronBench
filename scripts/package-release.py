#!/usr/bin/env python3
"""Package the static editor, companion, source, examples, and verification."""
import hashlib
import json
from pathlib import Path
import sys
import zipfile

root = Path(__file__).resolve().parents[1]
web = root / 'dist' if (root / 'dist/core.js').exists() else root
version = json.loads((root / 'package.json').read_text())['version']
destination = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else root / f'ELECTRONBENCH-v{version}.zip'
destination.parent.mkdir(parents=True, exist_ok=True)
files = {}
for path in web.iterdir():
    if path.is_file() and path.suffix in {'.html', '.css', '.js', '.svg', '.webmanifest'}:
        files[path.name] = path.read_bytes()
for folder in ['companion', 'tests', 'scripts', 'examples', 'verification']:
    for path in sorted((root / folder).rglob('*')):
        if path.is_file() and '__pycache__' not in path.parts:
            files[str(path.relative_to(root))] = path.read_bytes()
for name in ['README.md', 'UI-REVIEW.md', 'NETWORKING.md', 'ROADMAP.md', 'CHANGELOG.md', 'ACCEPTANCE.md', 'TEST-REPORT.md', 'LICENSE', 'package.json', 'start-companion.sh', 'start-companion.cmd', '.gitignore']:
    files[name] = (root / name).read_bytes()
assert not any(Path(name).name == 'electronbench_secrets.h' for name in files), 'Do not package filled credentials.'
files['SHA256SUMS.txt'] = ''.join(f'{hashlib.sha256(data).hexdigest()}  {name}\n' for name, data in sorted(files.items())).encode()
with zipfile.ZipFile(destination, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for name, data in sorted(files.items()):
        info = zipfile.ZipInfo(name)
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = (0o100755 if name.endswith('.sh') else 0o100644) << 16
        archive.writestr(info, data)
with zipfile.ZipFile(destination) as archive:
    assert archive.testzip() is None
    assert archive.read('index.html') == (web / 'index.html').read_bytes()
print(json.dumps({'file': str(destination), 'version': version, 'files': len(files), 'bytes': destination.stat().st_size, 'sha256': hashlib.sha256(destination.read_bytes()).hexdigest()}))
