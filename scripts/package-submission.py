from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

base = Path(__file__).resolve().parents[1]
out = base.parent / 'Assignment 4 Portfolio Submission.zip'
excluded = {'node_modules', '.git', '.history', 'dist', '.mongo-data', 'assignment4-report-render'}
with ZipFile(out, 'w', ZIP_DEFLATED) as archive:
    for path in base.rglob('*'):
        if not path.is_file():
            continue
        relative = path.relative_to(base)
        if any(part in excluded for part in relative.parts):
            continue
        if path.name in {'.env', 'yarn.lock'} or path.suffix == '.log':
            continue
        if 'cypress' in relative.parts and any(part in {'videos', 'screenshots'} for part in relative.parts):
            continue
        archive.write(path, 'Solution/' + relative.as_posix())

with ZipFile(out) as archive:
    names = archive.namelist()
    assert 'Solution/server.js' in names
    assert 'Solution/package-lock.json' in names
    assert 'Solution/render.yaml' in names
    assert 'Solution/E2E_TESTING.md' in names
    assert 'Solution/Assignment 4 Submission Report.docx' in names
    assert not any('/node_modules/' in name or name.endswith('/.env') or '/.mongo-data/' in name for name in names)
    print(f'{out}\n{len(names)} files; {out.stat().st_size:,} bytes')
