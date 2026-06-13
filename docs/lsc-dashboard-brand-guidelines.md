# LSC Dashboard Brand Guidelines

This is the source of truth for the Lucky Services Centre admin and technician dashboards.

## Brand Personality

Lucky Services dashboards should feel operational, trustworthy, compact, and calm. The UI is for dispatch work, technician field updates, customer follow-up, and money/status checks. It should not feel like a marketing page or a copied competitor panel.

## Color Tokens

| Token | Hex | Usage |
| --- | --- | --- |
| Ink | `#000D32` | Primary text, active nav, primary buttons, strong headers |
| Navy | `#12234D` | Brand panels, elevated headers, important dark surfaces |
| Cyan | `#2EA9D6` | Accent icons, secondary CTAs, selected details |
| Surface | `#F7F9FB` | Dashboard background and quiet panels |
| Surface Low | `#F2F4F6` | Input backgrounds, subtle grouped rows |
| Border | `#D8DADC` | Card and section borders |
| Border Strong | `#C5C6D0` | Inputs and active outlines |
| Body Text | `#191C1E` | Main readable body content |
| Muted Text | `#45464F` | Secondary labels, helper copy, metadata |
| Subtle Text | `#757680` | Icons, placeholders, low-priority labels |
| Error | `#BA1A1A` | Cancelled, issue, failed, critical |
| Warning | `#D97706` | Pending, delayed, needs admin/technician action |
| Success | `#059669` | Completed, verified, successful |

## Typography

Use `Work Sans` first for dashboard surfaces, then fall back to Inter/system UI. Keep text compact and readable.

- Page title: 28-30px, 600-700
- Section title: 18-20px, 600
- Card title: 16-18px, 600
- Body: 14-15px, 500
- Metadata/badges: 10-12px, uppercase only when it helps scanning

## Shape And Spacing

- Admin cards: `8px` radius.
- Technician cards: `8px` radius, even on the mobile PWA, to match admin.
- Buttons and inputs: `4px-8px` radius.
- Spacing follows a 4px/8px rhythm.
- Use subtle borders and low shadows. Avoid soft oversized rounded cards.

## Panel Rules

Admin panel:
- Desktop/tablet-first operations command center.
- Fixed sidebar on desktop.
- Tables, dispatch lanes, and workload panels are allowed.
- Cyan is accent only; primary actions use Ink/Navy.

Technician panel:
- Always phone-frame PWA layout.
- Same typography, color, card, and status language as admin.
- Use clear mobile cards, call/map actions, and status buttons.
- Never show competitor-style order IDs. Keep `LSC-...`.

## Status Rules

- Pending/assigned/delayed: amber.
- Accepted/on-the-way/in-progress: navy/cyan info.
- Completed: green.
- Cancelled/issues: red.

## Do Not Use

- `UQ-` order IDs.
- Bright cyan as the main active background.
- Large pill/card radius as the default.
- Mixed font families between admin and technician.
