"""Read retained OOXML without changing the reference."""
import hashlib
import json
from pathlib import Path
from zipfile import ZipFile
from lxml import etree as ET

REFERENCE = Path('C:/Users/Kabil/.codex/plugins/cache/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-system-design/assets/reference.docx')
NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

if __name__ == '__main__':
    with ZipFile(REFERENCE) as archive:
        for name in archive.namelist():
            data = archive.read(name)
            print(name, len(data), hashlib.sha256(data).hexdigest())
            if name.startswith('word/') and name.endswith('.xml') and 'styles' not in name and 'numbering' not in name:
                root = ET.fromstring(data)
                print('TEXT', root.xpath('//w:t/text() | //w:instrText/text()', namespaces=NS))
        root = ET.fromstring(archive.read('word/document.xml'))
        print('SECTIONS', [ET.tostring(s).decode() for s in root.findall('.//w:sectPr', NS)])
        styles = ET.fromstring(archive.read('word/styles.xml'))
        for style in styles.findall('w:style', NS):
            if style.get('{%s}styleId' % NS['w']) in ['normal', 'Normal', 'Title', 'Heading1', 'Heading3']:
                print('STYLE', ET.tostring(style).decode())
