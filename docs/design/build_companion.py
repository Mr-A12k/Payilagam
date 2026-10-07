"""Clone the selected template and replace only verified text slots."""
import hashlib
import json
import re
from pathlib import Path
from zipfile import ZipFile
from lxml import etree as ET
from inspect_template import REFERENCE, NS

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / 'Payilagam_UI_System_Design.docx'
W = '{' + NS['w'] + '}'

PARAGRAPHS = {
    8: 'Payilagam', 9: 'UI System Design',
    21: '1  Summary',
    22: 'Refresh Payilagam as a neutral, compact learning workspace with emerald actions. Consolidate existing shared UI and preserve theme choice, route behavior, and backend authority.',
    23: 'For frontend and backend reviewers. Current describes the code snapshot of 2 October 2026; intended describes proposed decisions. This companion does not approve a release or replace API contracts.',
    25: '2  Goals and Non Goals',
    27: '3  Current Architecture',
    28: 'React Router composes public, authenticated, and fullscreen routes. AppProviders supplies Redux auth, React Query, and ThemeContext; App adds SocketProvider. CourseDetail and Settings also use direct HTTP calls, so query caching is not universal.',
    29: 'Shared controls live in components/ui; page primitives live in components/workspace and styles/workspace.css. Express mounts domain APIs at /api. Prisma targets PostgreSQL. The refresh changes presentation, not persisted domain ownership.',
    30: '4  Intended UI Architecture',
    33: 'Current flow: route and shell > page/query or HTTP helper > Axios > Express domain API > Prisma/PostgreSQL.',
    35: 'Shared responsibilities',
    39: '5  Interaction Lifecycle',
    40: 'Navigate through the existing shell and preserve public and fullscreen exceptions.',
    41: 'Use route guards for UX; backend authentication and authorization remain decisive.',
    42: 'Read server data through existing hooks/helpers. Query defaults: five-minute stale time, one retry, no focus refetch.',
    43: 'Intended: show explicit loading, empty, error, and ready states without fabricated metrics.',
    44: 'Intended: validate forms, keep dirty values on errors, disable duplicate pending submissions.',
    45: 'Intended: reconcile successful writes with returned data or refetch/invalidation before presenting durable success.',
    46: 'Theme selection currently updates locally first; failed server persistence only warns. Intended: disclose unsaved preference without blocking the workspace.',
    48: '6  Existing API Contracts', 49: 'Representative endpoints',
    52: 'Data boundaries',
    54: 'Frontend API constants omit /api; VITE_API_URL configures the Axios base URL.',
    55: 'HTTP helpers return Axios responses. The catalog reads response.data.data and response.data.pagination; do not assume a universal envelope.',
    56: 'Keep existing course identifiers, role checks, payloads, and pagination semantics.',
    57: 'Backend data is authoritative. Redux currently holds auth; local state holds transient controls and draft forms.',
    58: 'Source map and implementation criteria:',
    59: 'docs/design/UI_DESIGN_CONTRACT.md; FrontEnd/src/api/constants.ts; BackEnd/src/routes/index.js.',
    61: '7  Consistency and Failure States',
    63: 'Intended: reconcile writes explicitly and keep failures distinguishable from empty data. No general idempotency, replay, or automatic mutation-retry guarantee is asserted.',
    65: '8  Accessibility and Security',
    67: 'Intended: visible labels, autocomplete, linked inline errors, visible focus, and announced pending/results. Toasts must not be the only error feedback.',
    68: 'Reuse Radix-based dialogs, selects, and menus. Verify keyboard interaction, Escape, focus return, and popover collision handling.',
    69: 'Preserve desktop collapse and mobile navigation. Test focus containment, restoration, active links, and narrow-screen toolbars.',
    70: 'Axios currently reads a local token for Bearer authorization and clears stored credentials on 401. Do not expose credentials in UI logs or add new client-side secret storage.',
    71: 'Preserve server permission checks for enrollment, editing, and administration. Proposed contrast and keyboard gates require validation; conformance is not yet certified.',
    74: '9  Proposed Acceptance Gates',
    76: '10  Alternatives Considered',
    80: '11  Review Decisions',
    81: 'Confirm emerald action values and contrast for each existing palette.',
    82: 'Agree on query invalidation for direct-call pages and shared lists.',
    83: 'Choose visible feedback for failed theme persistence.',
    84: 'Assign implementation reviewers and rollout ownership.',
    86: '12  Decision and Next Steps',
    87: 'Recommended: consolidate incrementally. Refresh courses and settings on shared foundations, then extend to other workspaces. Keep routes, domain APIs, and saved theme values stable; promote only after the proposed checks pass.',
}

TABLES = {
    0: [['STATUS\nProposed', '', 'OWNER\nTo assign', '', 'LAST UPDATED\n2 October 2026']],
    1: [['Authors', 'Codex'], ['Reviewers', 'Frontend and backend reviewers'], ['Related docs', 'UI_DESIGN_CONTRACT.md'], ['Scope', 'Current architecture and intended full UI refresh']],
    2: [['Goals', 'Non goals'], ['Compact neutral workspace', 'New marketing landing page'], ['Emerald actions and accessible controls', 'Forced palette replacement'], ['Shared shell and responsive navigation', 'Router or state-library migration'], ['Server-backed courses and settings', 'Invented data or API redesign']],
    3: [['Component', 'Responsibility', 'State source', 'Intended behavior'],
        ['Shell', 'SidebarLayout and public/fullscreen exceptions', 'Router and auth', 'Preserve role-aware navigation'],
        ['Shared UI', 'ui controls; workspace page/header/states', 'Props and tokens', 'Accessible consistent states'],
        ['ThemeContext', 'Seven palettes; light fallback in code', 'Profile + local preference', 'Preserve graphite/dark/light and other palettes'],
        ['Courses', 'Catalog, detail, enrollment, builder', 'Express APIs', 'Real data; clear retry and missing-value states'],
        ['Settings', 'Profile/avatar, security, mentor flows, appearance', 'Profile APIs and draft form state', 'Keep input and disclose save failures']],
    4: [['Operation', 'Method', 'API path', 'UI boundary'],
        ['Catalog', 'GET', '/courses/published', 'Server filters and pagination'],
        ['Detail', 'GET', '/courses/:id', 'Retain identifier semantics'],
        ['Enrollment', 'POST', '/enrollments/:courseId/enroll', 'Confirm server result'],
        ['Profile/theme', 'PUT', '/auth/profile', 'Reconcile saved values'],
        ['Password', 'PUT', '/auth/change-password', 'Protect credential input'],
        ['Avatar upload', 'POST', '/auth/profile/avatar', 'Multipart validation'],
        ['Avatar delete', 'DELETE', '/auth/profile/avatar', 'Confirm destructive action']],
    5: [['Scenario', 'Intended response', 'Reason'],
        ['Repeated submit', 'Disable pending action', 'Reduce duplicate writes; not an idempotency guarantee'],
        ['API failure', 'Keep inputs; explain retry', 'Avoid false success'],
        ['Timeout', 'Reconcile before write retry', 'Outcome may be uncertain'],
        ['Theme save fails', 'Keep local selection; report unsaved state', 'Local preference is not confirmed persistence']],
    6: [['Check', 'Proposed criterion', 'Reviewer', 'Gate'],
        ['Navigation', 'Guest/student/mentor/admin and denied links', 'To assign', 'Required'],
        ['Responsive UI', '360/768/1440 px; 200% zoom; no clipping', 'To assign', 'Required'],
        ['Themes', 'Light/dark/graphite; other palette smoke checks', 'To assign', 'Required'],
        ['Accessibility', 'Keyboard flow; 4.5:1 text and 3:1 control/focus contrast targets', 'To assign', 'Required'],
        ['Data integrity', 'Real API success/failure and reload checks', 'To assign', 'Required'],
        ['Validation status: source inspection only. No application build, tests, browser checks, or accessibility audit ran for this document.']],
    7: [['Alternative', 'Benefit', 'Why not selected'],
        ['Page-local styling', 'Fast isolated edits', 'Drifts across themes and states'],
        ['Replace state stack', 'Uniform new approach', 'Unneeded migration risk'],
        ['Force emerald palette', 'Single appearance', 'Breaks saved theme expectations'],
        ['Local demo domain data', 'Easy visual previews', 'Not backend truth']],
    8: [['Milestone', 'Intended deliverable', 'Exit criteria'],
        ['M1', 'Shared tokens, shell, controls', 'Theme and navigation review'],
        ['M2', 'Courses and settings', 'Real API and failure-state checks'],
        ['M3', 'Remaining workspace pages', 'Responsive and keyboard review'],
        ['M4', 'Rollout decision', 'Build/tests reviewed; UI rollback ready']],
}


def replace_text(paragraph, value):
    nodes = paragraph.findall('.//w:t', NS)
    if not nodes:
        if not value:
            return
        run = ET.SubElement(paragraph, W + 'r')
        nodes = [ET.SubElement(run, W + 't')]
    nodes[0].text = value
    nodes[0].set('{http://www.w3.org/XML/1998/namespace}space', 'preserve')
    for node in nodes[1:]:
        node.text = ''


def xml_bytes(root):
    return ET.tostring(root, xml_declaration=True, encoding='UTF-8', standalone=True)


def build():
    original_hash = hashlib.sha256(REFERENCE.read_bytes()).hexdigest()
    assert (ROOT / 'artifact.md').exists()
    with ZipFile(REFERENCE) as source:
        parts = {name: source.read(name) for name in source.namelist()}
        root = ET.fromstring(parts['word/document.xml'])
        body = root.find('w:body', NS)
        paragraphs = body.findall('w:p', NS)
        for index, value in PARAGRAPHS.items():
            replace_text(paragraphs[index], value)
        tables = body.findall('w:tbl', NS)
        for index, rows in TABLES.items():
            actual_rows = tables[index].findall('w:tr', NS)
            assert len(rows) == len(actual_rows)
            for row, values in zip(actual_rows, rows):
                cells = row.findall('w:tc', NS)
                assert len(cells) == len(values)
                for cell, value in zip(cells, values):
                    ps = cell.findall('w:p', NS)
                    lines = value.split('\n')
                    for i, p in enumerate(ps):
                        replace_text(p, lines[i] if i < len(lines) else '')
                    assert len(lines) <= len(ps)
        changed = {'word/document.xml': xml_bytes(root)}
        for name, value in [('word/footer1.xml', 'Payilagam | UI System Design'), ('word/footnotes.xml', ' Current means inspected code; intended means a proposed refresh decision.')]:
            part = ET.fromstring(parts[name])
            for p in part.findall('.//w:p', NS):
                if p.findall('.//w:t', NS):
                    replace_text(p, value)
            changed[name] = xml_bytes(part)
        with ZipFile(OUTPUT, 'w') as destination:
            for entry in source.infolist():
                destination.writestr(entry, changed.get(entry.filename, parts[entry.filename]))
    with ZipFile(OUTPUT) as final:
        assert final.testzip() is None
        assert final.namelist() == list(parts)
        preserve = [n for n in parts if n not in changed]
        assert all(parts[n] == final.read(n) for n in preserve)
        after_root = ET.fromstring(final.read('word/document.xml'))
        original_root = ET.fromstring(parts['word/document.xml'])
        # Remove text values to compare all layout, relationships, and anchors.
        for tree in (original_root, after_root):
            for node in tree.findall('.//w:t', NS):
                node.text = ''
                node.attrib.pop('{http://www.w3.org/XML/1998/namespace}space', None)
        assert ET.tostring(original_root) == ET.tostring(after_root)
        texts = []
        for n in changed:
            texts += ET.fromstring(final.read(n)).xpath('//w:t/text()', namespaces=NS)
        assert not re.search(r'\[[^\]]+\]|field_name_\d', ' '.join(texts))
        report = {
            'reference': str(REFERENCE), 'reference_sha256': original_hash,
            'output': str(OUTPUT), 'output_sha256': hashlib.sha256(OUTPUT.read_bytes()).hexdigest(),
            'changed_parts': list(changed), 'preserve_only_parts_unchanged': len(preserve),
            'document_layout_xml_unchanged': True, 'unfilled_placeholders': 0,
            'sections': len(root.findall('.//w:sectPr', NS)), 'tables': len(tables),
            'render_status': 'blocked: FileNotFoundError: LibreOffice soffice.exe was not found on PATH',
            'visual_inspection': 'Template cover preview only; final pages not rendered',
            'application_tests': 'Not run; documentation-only task',
            'parts': [{
                'path': n, 'size': len(data), 'reference_sha256': hashlib.sha256(data).hexdigest(),
                'output_sha256': hashlib.sha256(final.read(n)).hexdigest(),
                'policy': 'text editable' if n in changed else 'preserve only',
            } for n, data in parts.items()],
        }
    assert hashlib.sha256(REFERENCE.read_bytes()).hexdigest() == original_hash
    (ROOT / 'qa').mkdir(exist_ok=True)
    (ROOT / 'qa' / 'package-validation.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
    print(json.dumps({k: v for k, v in report.items() if k != 'parts'}, indent=2))


if __name__ == '__main__':
    build()
