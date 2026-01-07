# LifeLab — Features & Future Development

LifeLab is a personal self-observation system.
It prioritizes truth, reflection, and long-term clarity over motivation, gamification, or performance.

This document defines:
- What LifeLab **does today**
- What LifeLab **explicitly avoids**
- What LifeLab **may include in the future**
- The philosophy that governs all additions

Nothing outside this document should be added without intent.

---

## Core Design Principles (Non-Negotiable)

- Manual entry only
- Insight > motivation
- Observation > optimization
- No shame mechanics
- No dopamine loops
- Deterministic rendering
- Local = deployed parity
- Human-readable data

---

## CURRENT FEATURES (Implemented or In Scope)

### 1. Data & Tracking

#### Daily Records
- One record per day
- Missing days allowed
- No forced completion

Each day may include:
- Multiple life domains (numeric, normalized 0–1)
- Optional short notes
- Optional contextual metadata

#### Monthly Structure
- Data grouped by month
- Stored as static JSON
- Human-editable via GitHub

#### Domain System
- Domains are configurable
- Domains are additive (no schema breakage)
- All domains treated equally by default

---

### 2. Storage & Architecture

- GitHub Pages as storage layer
- Static JSON files
- Read-only from browser
- Versioned via Git commits
- No backend
- No database
- No user accounts

---

### 3. Core Metrics & Math

#### Daily Score
- Calculated as average of available domain values
- Missing domains do not penalize the score
- Missing days are neutral, not failures

#### Aggregations
- Monthly averages
- Rolling averages
- Yearly roll-ups (derived, never stored)

---

### 4. Home Page (Insight Surface)

The home page exists to answer:
> “How are things going, really?”

#### Sections (Top → Bottom)
1. Monthly trend line graph (SVG)
2. Yearly heatmap matrix
3. Textual insights
4. Navigation

No raw data tables on the home page.

---

### 5. Visualizations

#### Monthly Line Graph
- SVG-based
- Accurate axis math
- Shows trend, not achievement
- Neutral styling
- No animation

#### Yearly Heatmap
- GitHub-style grid
- Neutral grayscale palette
- Emphasizes consistency, not streaks
- Missing days fade, do not stand out

---

### 6. Insights & Analytics

- Pattern detection
- Variance analysis
- Domain correlations
- Consistency vs intensity insights

Insights are:
- Observational
- Non-judgmental
- Non-prescriptive
- Short and factual

No advice, no coaching language.

---

### 7. Notebook Page (Raw Truth)

- One row per day
- Domains as columns
- Notes visible inline
- Read-only UI
- Optimized for long-term reading

This page is intentionally boring.

---

### 8. Navigation & Interaction

- Month switching
- Year switching
- Domain toggles
- No page reloads
- Zero animation
- Immediate feedback

---

### 9. Styling & UX

- System fonts only
- No gradients
- No gamification visuals
- High contrast
- Print-friendly
- Calm, neutral tone

---

## EXPLICITLY EXCLUDED FEATURES

These will NOT be added:

- Gamification
- Goals
- Streak counters (traditional)
- Rewards or badges
- Notifications or reminders
- Social comparison
- Leaderboards
- AI coaching or therapy
- Moral framing of behavior

If any of these appear, the system is considered compromised.

---

## FUTURE DEVELOPMENT (Intentional, Optional)

These features may be added **only after** the core system is stable.

---

### Phase 12 — Win Ledger (Acknowledgement Without Pressure)

#### Purpose
Reinforce identity without punishment.

#### Design
- One optional “win” per day
- Free-text acknowledgement
- No streaks
- No resets
- No penalties

#### Display
- Total wins accumulated
- Wins per month/year

#### Rules
- Wins never expire
- Missing days are allowed
- No “lost” days exist

---

### Phase 13 — Reflection Journal (Long-Form Thinking)

#### Purpose
Provide a structured place for thinking, not venting.

#### Structure
- Separate from daily logs
- Prompt-based (optional)
- Free-text entries

Example prompts:
- What did I notice this week?
- What feels unclear right now?
- What pattern am I seeing?
- What am I avoiding?

#### Rules
- Never scored
- Never analyzed emotionally
- Never gamified

---

### Phase 14 — Compulsion Awareness Module (Porn Use)

#### Purpose
Understand patterns without shame.

#### Phase 1: Awareness
Optional daily fields:
- Urge intensity (0–3)
- Context tags (bored, late-night, alone, stressed)

No abstinence tracking.

#### Phase 2: Replacement
Optional note:
- “What did I do instead?”

#### Phase 3: Insight
- Frequency trends
- Intensity trends
- Context correlations

#### Rules
- No “days clean”
- No failure counters
- No moral language
- Progress measured by awareness, not purity

---

## LONG-TERM EXTENSIONS (Only If Needed)

- Year-over-year comparison
- Domain weighting experiments
- CSV / PDF export
- Print-friendly yearly report
- Markdown-based reflection archives

All extensions must:
- Preserve existing data
- Avoid rewrites
- Maintain manual control

---

## FINAL NOTE

LifeLab is not a productivity tool.

It is a mirror.

If it ever:
- pressures you to log
- makes you feel guilty
- rewards performance over honesty

Then the system has failed its purpose.

Truth comes first.
```

---

### What I recommend next

Commit this file **now**, before adding more code.

It will:

* stop future scope creep
* protect you from overengineering
* keep the project psychologically safe

If you want, next I can:

* audit your current repo against this document
* help you tag completed vs pending features
* or convert this into GitHub issues cleanly

Just tell me.
