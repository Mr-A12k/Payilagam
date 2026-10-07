# Payilagam Color System

Visual direction: neutral learning workspaces with teal actions, clear navigation, and readable text in light and dark modes.

The shared theme covers navigation, page surfaces, forms, dialogs, buttons, notifications, and legacy blue utility colors. The logo uses the same teal family. Amber and coral are reserved for distinct data and status roles; existing text and icons continue to communicate status alongside color.

Research used:

- Nielsen Norman Group, Consistency and Standards: https://www.nngroup.com/articles/consistency-and-standards/
- Nielsen Norman Group, Visual Hierarchy: https://www.nngroup.com/articles/visual-hierarchy-ux-definition/
- W3C, Contrast Minimum: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
- W3C, Use of Color: https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html

These sources informed consistent action colors, restrained surface hierarchy, and contrast checks. This is a research-informed design review, not a user interview or usability study with students.

Checked contrast ratios: light body 11.02:1, light muted 4.83:1, light action 5.59:1; dark body 14.93:1, dark muted 6.87:1, dark action 9.08:1. These checks cover the shared token pairs, not every possible image or legacy color combination.

Verification: TypeScript/Vite production build passed; both modes were inspected in the admin workspace; the 390px mobile workspace had no document-level horizontal overflow.
