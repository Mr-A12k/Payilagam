# Template execution contract

Reference: `C:/Users/Kabil/.codex/plugins/cache/openai-curated-remote/openai-templates/0.1.1/skills/artifact-template-system-design/assets/reference.docx`.
The selected `artifact-template.json` identifies this retained DOCX. It remains unchanged. Machine-readable SHA-256 and package inventories are recorded by the builder in `qa/package-validation.json` before and after authoring.

## Fidelity

- Clone the ZIP package, patch existing text slots only. Preserve styles, numbering, relationships, table geometry, paragraph/run properties, sections, headers, and recurring elements. No generic design preset.
- One portrait Letter section: 12240 x 15840 twips; top/left/right 1008, bottom 893, header/footer 720. Distinct first-page header/footer enabled. Preserve section XML exactly.
- Cover: two Title paragraphs, status/owner/date strip, metadata table, deliberate whitespace. Supplied preview inspected; later pages cannot be rendered in this runtime.
- Body: twelve numbered design sections, normal paragraphs, Heading 1 and Heading 3, nine tables total. Preserve table grids, fills, borders, cell margins, row rules, list definitions, and all blank spacing paragraphs.
- Title style is 22 pt bold #082a4a; Heading 1 is 13.5 pt bold #082a4a with keep-next/keep-lines and 130 twips after; Heading 3 uses Helvetica Neue and #5b7085. Preserve all direct formatting, including cover overrides, rather than normalizing to these style defaults.
- Full exact property evidence is the retained package plus its per-part inventory; no layout properties are reconstructed. Preserve-only parts must compare byte-for-byte.
- No replacement illustration: use the existing architecture caption slot for a compact textual dependency flow. Preserve any untouched drawing structures.

## Slot map

Stable locators use zero-based direct `w:body/w:p` and `w:body/w:tbl` indices in `word/document.xml`. `build_companion.py` is the exhaustive paragraph and table-cell content map.

- Paragraphs 8 and 9: product and document title.
- Tables 0 and 1: proposed status, unassigned owner, date, author, intended reviewers, related contract, scope.
- Sections 1 through 12: summary, scope, current architecture, intended UI architecture, request lifecycle, existing APIs, consistency, security, acceptance gates, alternatives, open questions, next steps.
- Tables 2 through 8: goals/non-goals; components; API reference (repurposed field matrix); UI consistency cases; proposed validation gates; alternatives; milestones.
- Paragraph 33: replace unused figure placeholder with current text flow.
- Footer 1: replace organization placeholder, retain formatting.
- Footnotes: replace instructional template footnote with a definition of current versus intended; preserve anchors and note structure.
- Every placeholder is rewritten; no invented ownership, SLOs, test results, or release approvals. Text is shorter than source prompts where practical. Tables and paragraphs are not removed.
- All remaining XML/package parts are preserve-only, including styles, numbering, headers, settings, relationships, and metadata. No dynamic reference fields were observed in the text/field inventory.

## Verification limitation

Reference render attempted with the bundled Python and packaged `render_docx.py`. It fails at `_resolve_soffice` with `FileNotFoundError: LibreOffice soffice.exe was not found on PATH`. The dependency bundle contains no soffice executable. No desktop installation or browser is used. Final render must also be attempted; preserve the DOCX on failure as requested. Page count, font substitution, overflow, and visual fidelity remain unverified. Package checks cannot replace page inspection.
