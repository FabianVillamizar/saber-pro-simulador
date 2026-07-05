# Handoff: Simulador Saber Pro (ICFES) — 4 pantallas

## Overview
App tipo "Anki + simulador de examen" para practicar diariamente para el examen Saber Pro (ICFES, Colombia). 4 pantallas: Dashboard principal, Tarjeta de repaso (flashcard), Simulacro cronometrado, y Resultado del simulacro.

## About the design files
The `.dc.html` files in this bundle are **Claude Design Components** — a proprietary authoring format (`<x-dc>`, `{{ }}` template holes, `<sc-if>`/`<sc-for>` control-flow tags, a `support.js` runtime) used only inside this design tool. **They are not code to paste into a Vite/React/etc. project.** Internally they compile to real React, but the markup itself will not run outside this tool.

Your task is to **recreate these designs in the target codebase's existing environment** (React, Vue, SwiftUI, native, or whatever the app already uses) using its established component patterns, state management, and styling approach. If no environment exists yet, pick the framework that best fits the project and implement there. Treat this README + the HTML as the spec; open the `.dc.html` files in a browser to see them render (they need `support.js`, which is not included — the *rendered visual result and interaction behavior* is what matters, not the markup internals).

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, and copy are final/near-final. Recreate pixel-close using the codebase's existing UI primitives where equivalents exist (buttons, cards, progress bars); introduce new primitives only where the codebase has no equivalent (e.g. the flip-card, the heatmap grid).

## Design system (shared across all 4 screens)

**Typography:** Manrope (Google Font), weights 500/600/700/800. Single font family for everything — headings, body, numerals. Load via `https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap`.

**Single accent color**, tweakable, default `#2563EB` (blue). Alternate curated options used in the prototype's tweak panel: `#0F766E` (teal), `#7C3AED` (violet), `#EA580C` (orange). All accent-derived tints/shades in the UI are generated with CSS `color-mix(in oklch, <accent> X%, <base>)` rather than hardcoded — replicate this approach (or precompute equivalent tokens) so swapping the single accent still looks correct everywhere.

**Two semantic (non-accent) colors, used sparingly for meaning, not decoration:**
- Warning/caution (amber, `oklch(60% 0.16 55)` light / `oklch(72% 0.14 65)` dark) — used only for "error común" callouts and the exam timer's low-time state.
- Self-eval colors on the flashcard's 4 review buttons only (Anki convention): rose (~`oklch(60% 0.16 20)`), amber (~`oklch(60% 0.16 65)`), the main accent (for "Bien"), green (~`oklch(60% 0.16 150)`) — each a *subtle tint* (10-20% mix into surface), never a solid saturated fill.

**Color tokens — light mode:**
- `bg`: `oklch(97.8% 0.004 250)` — page background
- `surface`: `#FFFFFF` — cards
- `surfaceAlt`: `oklch(96% 0.006 250)` — chips, table headers, secondary fills
- `border`: `oklch(91% 0.006 250)`
- `text`: `oklch(23% 0.012 258)`
- `textSub`: `oklch(46% 0.014 258)`
- `textFaint`: `oklch(62% 0.012 258)`

**Color tokens — dark mode:**
- `bg`: `oklch(19% 0.012 258)`
- `surface`: `oklch(24% 0.014 258)`
- `surfaceAlt`: `oklch(27.5% 0.014 258)`
- `border`: `oklch(33% 0.015 258)`
- `text`: `oklch(96% 0.004 258)`
- `textSub`: `oklch(76% 0.01 258)`
- `textFaint`: `oklch(56% 0.012 258)`

Dark mode is a real, functional toggle (not just a spec) present on every screen's header (sun/moon icon button, top-right). It should be implemented as a real app-wide theme toggle in production, persisted (e.g. localStorage), rather than per-screen state.

**Radii:** large cards 20–22px, medium cards/buttons 14–16px, chips/pills 100px (full), small badges 9–11px.

**Shadows:** very soft, used only on hover-lift and the CTA/card ("0 6–12px 18–30px" at ~6–9% black opacity light / ~30–35% dark). No heavy drop shadows.

**Motion:** subtle only. Page sections fade+slide up ~10px on mount (~500ms ease). Hover states lift elements `translateY(-2px)` with a ~150ms transition. No bouncy/playful easing, no confetti, no badges/gamification — deliberately closer to a finance app than a game.

**Icons:** no illustrative/pictogram SVGs. All icons in the prototype are literally built from primitive shapes (circle, rect, line) — sun/moon toggle, calendar chip, warning "!" badge, chevrons, clock. Recreate with an icon library in production (Lucide, Heroicons, etc. — pick whatever the codebase already uses); the primitive-shape versions here are just placeholders for "a simple line icon meaning X".

---

## Screen 1 — Dashboard (`Dashboard.dc.html`)

**Purpose:** Home screen. Shows study streak, resumes the last session, and gives access to the 6 exam modules with progress.

**Layout:** Single column, max-width 1160px centered, `padding: 28-40px` sides.
1. Header row: 32px accent-colored logo mark ("S") + "Saber Pro" wordmark (left) · exam-countdown chip ("127 días para el examen", pill, `surfaceAlt` bg) + dark-mode toggle button (right).
2. Greeting: "Hola, {studentName}" (27px/800) + subcopy (14.5px, `textSub`).
3. Streak card (full width, `surface` bg, 20px radius, 28-32px padding): left block = big streak number (38px/800) + "días seguidos de estudio" label + "Racha más larga: N días" faint sub. Right = GitHub-contributions-style heatmap: 18 columns (weeks) × 7 rows (days), 11×11px cells, 3px gap, rounded 3px, 5 intensity levels from `border` (empty) up to solid accent, each cell has a date tooltip (`title` attr). Legend row below: "Menos" → 5 swatches → "Más".
4. Continue CTA (full width, tinted accent bg via `color-mix` ~7-14%, tinted accent border): left = eyebrow "CONTINÚA DONDE QUEDASTE" (accent, uppercase, 12px/700) + resumed item title (21px/800) + meta ("Pregunta 8 de 15 · ~6 min restantes") + thin progress bar (53% filled). Right = solid accent pill button "Continuar estudiando →" with soft accent-tinted shadow, lifts on hover.
5. "Tus módulos" section: header row with section title + "{avg}% promedio general". Grid `repeat(auto-fit, minmax(320px,1fr))`, gap 14px, 6 cards — one per exam module (Inglés, Razonamiento Cuantitativo, Lectura Crítica, Competencias Ciudadanas, Comunicación Escrita, Pensamiento Científico). Each card: 42px rounded-square 2-letter monogram badge (accent-tinted bg, accent text) · module name (15px/700) + "{done}/{total} tarjetas · {lastStudied}" (12.5px, faint) · a 54px circular ring on the right (CSS `conic-gradient` accent-vs-border track) with a punched-out inner circle showing the percentage (12.5px/800). Card lifts + accent border on hover.

**Sample data used:** streak 47 days (computed from a seeded 18-week activity grid), best streak 62. Module percentages: Inglés 72%, Razonamiento Cuantitativo 45%, Lectura Crítica 88%, Competencias Ciudadanas 60%, Comunicación Escrita 33%, Pensamiento Científico 55% (avg 59%).

**State:** `dark` (bool), `mounted` (bool, drives entrance fade). Heatmap data is generated once from a seeded PRNG so it's stable, not random per render.

**Tweakable props:** `accentColor` (color, 4 curated options), `studentName` (text).

---

## Screen 2 — Tarjeta de repaso (`Tarjeta de Repaso.dc.html`)

**Purpose:** Anki-style spaced-repetition flashcard review.

**Layout:** Max-width 720/600px centered.
1. Top bar: back-chevron icon button · module title + "Repaso de tarjetas" subtitle · thin progress bar (flex-fill) · "{remaining} restantes" · dark toggle.
2. Flip card (max-width 600px, ~340px tall): 3D flip on click/tap (`perspective: 1400px`, inner `transform-style: preserve-3d`, `transition: transform .6s cubic-bezier(.4,.15,.2,1)`, `rotateY(180deg)` when flipped). Both faces `position:absolute; inset:0; backface-visibility:hidden`; the hidden face gets `pointer-events:none` so clicks don't leak through.
   - **Front:** level badge (e.g. "A2"/"B1"/"B2", accent-tinted pill) + type badge ("Gramática"/"Vocabulario", neutral pill) top-left · centered cloze sentence (23px/700) with the blank rendered as a dashed underline segment (~74px min-width) · footer hint "Toca para ver la explicación" with a small circular-arrow icon.
   - **Back** (`rotateY(180deg)` pre-rotated, 30px/32px padding, scrollable if content overflows): level badge + the completed sentence with the answer highlighted in accent · **3 visually distinct sections**, never plain running text:
     1. **Regla** — small uppercase label (faint) + explanatory paragraph (14.5px, `textSub`).
     2. **Ejemplo** — left-accent-border block (3px accent border, accent-tinted bg, right-rounded 12px), uppercase accent label + example text.
     3. **Error común** — warning callout: amber-tinted bg + amber border, 12px radius, warning "!" icon (circle badge) + amber uppercase label + explanation text.
3. Self-eval row below the card: 4 equal-width buttons — **Otra vez** (rose tint, "<10 min"), **Difícil** (amber tint, "1 día"), **Bien** (accent tint, "3 días"), **Fácil** (green tint, "6 días"). Each: 14px radius, subtle tinted bg/border/text (10-20% mix), bold label + small faint interval sub-label. Disabled-looking (35% opacity, no pointer events, slight downward offset) while the card is showing its front; fade to full opacity/enabled when flipped.

**Interaction flow:** Card starts un-flipped. Click anywhere on the card toggles the flip. Clicking any of the 4 eval buttons: flips the card back to front, then (~550ms later, after the flip visually completes) advances to the next card in the session and resets flip state — this is the standard Anki review loop. 5 sample English-exam flashcards are cycled through (grammar: 3rd-person -s, first conditional, future perfect; vocabulary: antonyms, prepositions of place).

**Tweakable props:** `accentColor`, `sessionTotal` (int, default 20 — total cards in the session, drives the progress bar/remaining count).

---

## Screen 3 — Simulacro cronometrado (`Simulacro.dc.html`)

**Purpose:** Timed full-length practice exam, question by question.

**Layout:** Max-width 820/680px centered.
1. Top bar row 1: accent logo mark + "Simulacro completo" title (left) · **countdown timer chip** (pill, clock icon, `mm:ss`, tabular-nums) + dark toggle (right). Timer color/bg/border = accent by default; **switches to the warning (amber) color only when remaining time < 5:00** — never red, never blinking/pulsing (explicit anti-anxiety requirement).
   Row 2: "Pregunta {n} de {total}" label + full-width thin progress bar (accent fill, width = `(n-1)/total`).
2. Body: small uppercase accent eyebrow naming the current module (e.g. "LECTURA CRÍTICA") · **context block** when the question needs one — either a `surfaceAlt` passage card (reading-comprehension text) or a bordered data table (`Razonamiento Cuantitativo` questions, header row `surfaceAlt`, 4 sample rows) — never both. Then the question stem (18.5px/700).
3. **4 selectable options** (A–D), stacked, each a full-width row: circular letter badge + option text. Unselected = neutral border/`surface` bg/`surfaceAlt` badge. Selected = accent border + accent-tinted bg + solid-accent badge (white letter). **No correctness color-coding ever** — selection only shows *which one you picked*, nothing about right/wrong (feedback is deliberately withheld until the end of the exam).
4. "Siguiente pregunta" button, bottom-right, solid accent when an option is selected, disabled-styled (neutral `border`-colored bg, faint text, `not-allowed` cursor) until a selection is made. On the last question the label changes to "Finalizar simulacro" (which would route to the Resultado screen in production).

**Sample content:** 4 rotating sample questions, one per flavor: Lectura Crítica (passage + question), Razonamiento Cuantitativo (quarterly sales table + question), Competencias Ciudadanas (conflict-resolution scenario), Pensamiento Científico (experiment variables). Starts at "Pregunta 12 de 45" per the brief's example.

**Interaction flow:** Real countdown (`setInterval`, -1s/tick) from a starting value. Selecting an option highlights it and enables "Siguiente"; advancing resets selection and increments the question counter (clamped at `total`).

**Tweakable props:** `accentColor`, `totalQuestions` (int, default 45), `remainingSeconds` (range 0-3000, default 1104 = 18:24 — dial below 300 to preview the warning state).

---

## Screen 4 — Resultado del simulacro (`Resultado.dc.html`)

**Purpose:** Post-exam summary and next steps.

**Layout:** Max-width 760/800px centered.
1. Header: accent logo + "Resultado del simulacro" title (left), dark toggle (right).
2. **Score hero card** (`surface`, 22px radius, centered content): "PUNTAJE GLOBAL ESTIMADO" eyebrow · huge score number (72px/800) with "/500" suffix (faint, smaller) — **animates counting up from 0 on mount** (~1.1s, cubic ease-out via `requestAnimationFrame`) · accent-tinted pill showing the official performance level label (e.g. "Desempeño Alto") · faint sub-line "Clasificación oficial ICFES · Nivel {tier} de 4". Level thresholds: ≥400 Superior (4), ≥300 Alto (3), ≥200 Medio (2), else Bajo (1).
3. **Breakdown card**: "Desglose por competencia" + one row per module (all 6), each a label/percentage line above a thin accent progress bar, sorted best → worst.
4. **"Tu error más frecuente" callout** (amber-tinted, same treatment as the flashcard's warning block): warning icon + uppercase label, then a **bolded pattern description** (not just a stat) — e.g. "Confundes información explícita con inferencias del autor" — followed by 2-3 sentences of context naming which modules it showed up in and how often.
5. **Recommendations** ("Qué estudiar a continuación"): **max 3** rows, each: numbered accent-tinted badge (1/2/3) · concrete skill title + "{module} · {N} tarjetas" meta · solid accent "Practicar" button (would deep-link into the Tarjeta de Repaso screen filtered to that skill).
6. Secondary, lower-emphasis button, centered: "Ver detalle de cada pregunta" (outlined, neutral, accent border/text on hover) — would route to a per-question review list (not built in this batch).

**Sample data:** score 342/500 → "Desempeño Alto" / Nivel 3. Same 6 module percentages as the Dashboard. 3 recommendations target the two weakest areas (Razonamiento Cuantitativo, Comunicación Escrita).

**Tweakable props:** `accentColor`, `finalScore` (range 0-500, default 342 — changing it live-updates the level label/tier and replays the count-up).

---

## State & data model summary (for production)

- **Theme**: `dark: boolean`, app-wide, persisted.
- **Accent color**: single app-wide token; all tints derived via color-mix (or precomputed design tokens if the codebase's CSS pipeline can't do runtime `color-mix`).
- **Streak/heatmap**: array of `{date, activityLevel: 0-4}` per day, `currentStreak`/`bestStreak` derived (consecutive non-zero days from today backwards / longest run overall).
- **Modules**: 6 fixed entries `{id, name, monogram, cardsDone, cardsTotal, lastStudiedLabel, pctMastery}`.
- **Flashcard session**: ordered queue of cards `{level, type, before, blank/answer, after, rule, example, mistake}`; self-eval grade (`again/hard/good/easy`) should feed a real spaced-repetition scheduler (SM-2 or similar) in production — the prototype just cycles the sample deck.
- **Simulacro session**: `{questionIndex, totalQuestions, secondsRemaining, answers: {questionId: selectedOption}}`; no correctness/feedback state exposed to the UI until submission.
- **Resultado**: computed from a finished simulacro session — `estimatedScore`, `performanceLevel`, per-module `%correct`, most-frequent-mistake-pattern (needs categorized error tagging per question, not just a raw wrong/right count), and a ranked list of recommended study topics.

## Assets
No external image assets — all marks (logo, icons) are inline vector primitives (circle/rect/line) as described above. No third-party fonts besides Google Fonts "Manrope".

## Files in this bundle
- `Dashboard.dc.html`
- `Tarjeta de Repaso.dc.html`
- `Simulacro.dc.html`
- `Resultado.dc.html`

Open any of them directly in a browser to see the live, interactive prototype (dark-mode toggle, flip animation, timer, count-up, hover states all work).
