"""Package the editable rebuild without dependencies, backups or earlier UI artifacts."""
import hashlib
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

root = Path(__file__).resolve().parent.parent
output = root.parent / 'THARA_REBUILD_DELIVERY_2026-11-15.zip'
root_files = ['README.md', 'PRODUCT.md', 'DESIGN.md', 'LICENSE', 'package.json', 'package-lock.json',
              'tsconfig.json', 'vite.config.ts', 'index.html', '.env.example', '.gitignore', 'ai-usage.json']
files = [root / name for name in root_files]
for folder in ('src', 'public', 'scripts', 'dist'):
    files.extend(file for file in (root / folder).rglob('*') if file.is_file())
files.extend(file for file in (root / 'docs').iterdir() if file.is_file())
files.extend(file for file in (root / 'delivery').iterdir()
             if file.is_file() and (file.suffix == '.md' or file.name.startswith('THARA_Rebuild_EN.')))
files.extend(file for file in (root / 'docs/evidence/rebuild').rglob('*') if file.is_file())
files.extend(root / '.build-slides' / name for name in ('build-rebuild-deck.mjs', 'export-rebuild-pdf.py'))
files = sorted(set(file for file in files if file.is_file()))
manifest = {'project': 'THARA', 'revision': '2026-11-15 vegetable crop/water-turn rebuild',
            'public_demo': 'https://mutasem-mk4.github.io/thara-demo/',
            'source': 'https://github.com/Mutasem-mk4/thara-demo/tree/main/source',
            'excluded': 'node_modules, archives, earlier decks, supplied research reports and full competition-guide copies',
            'authoring_note': 'The app uses npm. Slide authoring needs the bundled Codex Artifact Tool; final editable PPTX/PDF are included.',
            'files': {str(file.relative_to(root)).replace('\\', '/'): hashlib.sha256(file.read_bytes()).hexdigest() for file in files}}
with ZipFile(output, 'w', ZIP_DEFLATED) as archive:
    for file in files:
        archive.write(file, 'thara/' + str(file.relative_to(root)).replace('\\', '/'))
    archive.writestr('DELIVERY_MANIFEST.json', json.dumps(manifest, indent=2, ensure_ascii=False))
with ZipFile(output) as archive:
    assert archive.testzip() is None
print(json.dumps({'file': str(output), 'bytes': output.stat().st_size,
                  'sha256': hashlib.sha256(output.read_bytes()).hexdigest(), 'files': len(files)}))
