# DatumSpec: Interactive Engineering Prompt Playbook & Modular Builder

DatumSpec is a single-page interactive prompt engineering playbook and deterministic assembly workbench purpose-built for mechanical, product, manufacturing, and process engineers. It enables engineers to select technical goals, configure structured framework blocks (CO-STAR, RISEN, Few-Shot, First-Principles Verification), inject domain-specific constraints (GD&T, FEA/CFD, DFMEA, Six Sigma, ISO/ASME standards), and compile production-ready prompts without relying on external AI calls.

## User Review & Critical Decisions

> [!IMPORTANT]
> Please review the confirmed scope and architectural choices below before we build the application. Click **Proceed** to start implementation or share any adjustments in chat.

- **Confirmed Domain Focus**: Engineering disciplines including **Mechanical Engineering** (CAD, FEA/CFD, tolerance stack-up, material selection), **Product Engineering** (DFM/DFA, PRD-to-spec translation, BOM optimization), **Manufacturing & Quality** (PFMEA, CNC/tooling parameters, root-cause 8D/5-Whys), **Process Engineering** (P&ID review, chemical/thermal mass balance, DOE/Six Sigma), and **Technical Analysis** (failure analysis, trade-off matrices, test protocol design).
- **Confirmed Interaction Pattern**: **Modular Framework Builder** supporting live switching and custom block composition across **CO-STAR** (Context, Objective, Style, Tone, Audience, Response), **RISEN** (Role, Instructions, Steps, End Goal, Narrowing), **Engineering Few-Shot + Chain-of-Thought**, and **First-Principles Verification**.
- **Confirmed Deterministic Engine**: **Zero AI Calls / 100% Rule-Based Assembly**—all prompt compilation, variable interpolation, engineering standard injection, token estimation, and structural completeness checks run deterministically in the browser.

---

## 1. Overview & Core Concept

- **What It Does**: Provides an interactive engineering playbook where selecting an engineering discipline and specific technical goal automatically configures a modular prompt architecture. Engineers can toggle, reorder, and customize framework blocks, click to inject domain-specific constraint modules (such as ASME Y14.5 GD&T rules, boundary condition tables, safety factor thresholds, or 8D report schemas), fill out dynamic parameter variables, compare weak vs. engineered prompts, and export the assembled prompt in Markdown, XML-tagged structure, or JSON payload format.
- **Target Audience / Persona**: Mechanical designers, manufacturing engineers, process engineers, R&D product engineers, and technical leads who want repeatable, rigorous, standards-compliant prompts for technical problem-solving and documentation.
- **Key Value**: Eliminates vague, generic LLM outputs in high-stakes engineering tasks by enforcing explicit boundary conditions, unit systems (SI vs. Imperial), governing standards, step-by-step analytical derivations, and structured verification checklists.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Discipline & Engineering Goal Selection**: Users filter the playbook by engineering discipline (`Mechanical`, `Product & DFM`, `Manufacturing & Quality`, `Process & Chemical`, `Engineering Analysis`) and pick a curated technical blueprint (e.g., *FEA Boundary Condition & Mesh Sensitivity Review*, *DFMEA Severity/Occurrence Matrix Generation*, *Tolerance Stack-Up & GD&T Audit*, *Process Mass & Energy Balance Verification*, *8D Root Cause Failure Investigation*).
2. **Framework & Structural Mode Switching**: Users choose a structural framework (`CO-STAR`, `RISEN`, `Few-Shot Analytical`, or `First-Principles Spec`). Switching frameworks dynamically maps and preserves the user's current context, objective, steps, and constraints into the selected framework's block structure.
3. **Interactive Block & Constraint Assembly**:
   - Toggle individual framework blocks on/off, reorder blocks, or add custom blocks.
   - One-click injection of **Engineering Constraint Modules**: Unit System Enforcement (`SI Metric (mm, MPa, K)` vs. `Imperial (in, psi, °F)`), Governing Standards (`ASME Y14.5`, `ISO 9001 / IATF 16949`, `ASTM Material Specs`, `OSHA / Process Safety`), Analytical Rigor (`Show Symbolic Equations First`, `Explicitly State Assumptions`, `Flag Out-of-Bounds Inputs`, `Sensitivity & Uncertainty Check`), and Output Schema (`Markdown Engineering Table`, `Step-by-Step Derivation`, `JSON Spec`, `LaTeX Math Equations`).
   - Interactive `[Variable]` slots (e.g., `[Material_Grade]`, `[Operating_Temp_Range]`, `[Manufacturing_Process]`, `[Target_Safety_Factor]`) with quick-fill engineering presets and live inline editing.
4. **Live Compiled Output, Contrast View & Export**:
   - The right-hand workbench pane renders the compiled prompt in real time with syntax highlighting for sections, variables, and XML/Markdown delimiters.
   - Users can switch the preview between **Compiled Prompt**, **Weak vs. Engineered Diff View** (highlighting why each playbook block prevents engineering hallucinations), and **Saved Library** (persisted in `localStorage`).
   - One-click copy, download (`.md` / `.json`), or save as a custom reusable playbook recipe.

### Visual Identity & Theme
- **Aesthetic Direction**: *Precision CAD & Technical Specification Workbench*—clean, high-contrast industrial drafting clarity inspired by technical datasheets and modern engineering instrumentation.
- **Color Palette & Mood (60-30-10 Discipline)**:
  - **60% Dominant Neutral Canvas**: Crisp technical drafting surface (`#F8FAFC` light mode default / `#0B0F19` deep slate dark mode toggle) with subtle structural grid hairlines.
  - **30% Structural Surfaces**: Pure white (`#FFFFFF`) or elevated slate (`#111827`) single-elevation panels bounded by `1px solid` hairline borders (`#E2E8F0` / `#1E293B`), with muted slate typography (`#475569` / `#94A3B8`).
  - **10% Accent Budget**: Precision Blueprint Cobalt (`#0284C7`) for primary interactive controls and active framework states, paired with Safety Amber (`#D97706`) for unfilled variable callouts and Nominal Emerald (`#059669`) with explicit text labels for completed specification checks.
- **Typography & Hierarchy (2+1 Font Rule)**:
  - *Display & Section Headings*: `Bricolage Grotesque` (SemiBold 600, tight tracking, `text-wrap: balance`).
  - *Body & UI Controls*: `Plus Jakarta Sans` (Regular 400 / Medium 500) for high scannability across dense technical parameters.
  - *Prompt Compiler, Variables, Units & Metrics*: `IBM Plex Mono` with `tabular-nums` for prompt code output, token/character counters, and engineering units.
- **Component Styling & Layout**:
  - **Top Bar Contract**: Strict single-row, three-zone header separated by `gap-8`:
    1. *Brand Wordmark*: `DatumSpec` (single-line display wordmark, no sub-badges).
    2. *Navigation Links*: `Playbook Library`, `Framework Builder`, `Anatomy & Diff`, `Saved Recipes` (single-line text links).
    3. *Primary Action*: `Copy Compiled Prompt` button.
  - **Two-Zone Split Workbench (1440px Desktop Baseline)**:
    - Above the fold features a streamlined Engineering Domain & Goal Selector strip, followed by the main 12-column interactive split stage: **Left 7 Columns** for the Modular Framework & Constraint Builder, **Right 5 Columns** (sticky viewport height) for the Live Compiled Prompt Inspector, Structural Completeness Checklist, and Format Exporter.
  - **Zero-Pill Metadata**: All blueprint metadata (discipline, framework type, variable count, estimated tokens) rendered as quiet inline text separated by `·` bullets—never wrapped in decorative pill chips.

### Interactive Feedback & Motion
- Instant (`150ms`) compositor-only transitions when toggling constraint injectors, switching frameworks, or filling variable slots.
- Interactive highlight linking: hovering or focusing a framework block on the left highlights its corresponding compiled segment in the live prompt preview on the right.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Cross-Framework State Mapping vs. Isolated Templates**
  - *Chosen Approach*: Unified underlying engineering prompt state that dynamically maps into `CO-STAR`, `RISEN`, `Few-Shot Analytical`, or `First-Principles Verification` structures on the fly.
  - *Why*: Engineers can experiment with how the exact same technical problem looks in CO-STAR versus RISEN or XML-delimited format without losing their entered variables, constraints, or custom instructions.
  - *Alternatives Considered*: Static text templates per framework (rejected because switching frameworks would wipe user customizations).
- **Decision 2: Deterministic Structural Completeness Rubric vs. AI Scoring**
  - *Chosen Approach*: Rule-based Engineering Specification Checklist that inspects the assembled prompt for 6 concrete engineering criteria (Persona/Domain Defined, Unit System Specified, Boundary Conditions/Assumptions Included, Governing Standards Linked, Analytical Verification Step Present, Output Format Constrained).
  - *Why*: Completely transparent, instant, zero-latency, and aligns with the requirement for clever deterministic prompt assembly without AI calls.
- **Decision 3: Local Persistence & Export Portability**
  - *Chosen Approach*: `localStorage` persistence for custom user-saved recipes and current workspace state, plus instant export to Raw Text, Markdown, XML-Structured System Prompt, and JSON message array.
  - *Why*: Allows engineers to build a personal library of domain prompts and immediately paste or integrate them into any workflow.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```text
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         TOP BAR (3-Zone Strict Contract)                         │
│  [DatumSpec]          [Playbook · Builder · Anatomy · Saved]     [Copy Prompt]   │
└────────────────────────────────────────┬─────────────────────────────────────────┘
                                         │
┌────────────────────────────────────────▼─────────────────────────────────────────┐
│                    ENGINEERING DOMAIN & GOAL BLUEPRINT SELECTOR                  │
│  [All · Mechanical · Product/DFM · Manufacturing · Process · Analysis] + Search  │
│  ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐            │
│  │ FEA Mesh & Stress  │ │ DFMEA Risk Matrix  │ │ GD&T Tolerance     │ ... (12+)  │
│  └─────────┬──────────┘ └─────────┬──────────┘ └─────────┬──────────┘            │
└────────────┼──────────────────────┼──────────────────────┼───────────────────────┘
             └──────────────────────┼──────────────────────┘
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         CENTRAL PROMPT ASSEMBLY STORE                            │
│  • activeBlueprintId       • activeFramework ('CO-STAR' | 'RISEN' | 'FEW_SHOT'   │
│  • blocks[] (enabled,        | 'FIRST_PRINCIPLES')                               │
│    order, content)         • variableValues Map<varName, value>                  │
│  • activeConstraints[]     • outputDelimiter ('MARKDOWN' | 'XML' | 'JSON')       │
│  • unitSystem ('SI'|'IMP') • savedCustomRecipes[] (localStorage sync)            │
└───────────────────┬──────────────────────────────────────────┬───────────────────┘
                    │                                          │
┌───────────────────▼────────────────────┐ ┌───────────────────▼───────────────────┐
│   LEFT STAGE: MODULAR BUILDER (7 Col)  │ │  RIGHT STAGE: LIVE COMPILER (5 Col)   │
│                                        │ │                                       │
│ ┌────────────────────────────────────┐ │ │ ┌───────────────────────────────────┐ │
│ │ 1. Framework Architecture Switcher │ │ │ │ View Mode: [Compiled | Diff View] │ │
│ │    [CO-STAR] [RISEN] [Few-Shot]    │ │ │ │ Format: [Markdown | XML | JSON]   │ │
│ └────────────────────────────────────┘ │ │ └───────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │ │ ┌───────────────────────────────────┐ │
│ │ 2. Dynamic Parameter Variables     │ │ │ │ Live Assembled Prompt Output      │ │
│ │    [Material] [Load_Case] [Std]    │ │ │ │ • Real-time variable interpolation│ │
│ │    + Quick-Fill Domain Presets     │ │ │ │ • Hover-linked block highlighting │ │
│ └────────────────────────────────────┘ │ │ │ • Token & character tabular stats │ │
│ ┌────────────────────────────────────┐ │ │ └───────────────────────────────────┘ │
│ │ 3. Engineering Constraint Injectors│ │ │ ┌───────────────────────────────────┐ │
│ │    • Unit System (SI / Imperial)   │ │ │ │ Engineering Spec Completeness     │ │
│ │    • Standards (ASME, ISO, ASTM)   │ │ │ │ • 6-Point Deterministic Checklist │ │
│ │    • Rigor & Assumption Guards     │ │ │ │ • Missing Variable Warnings       │ │
│ └────────────────────────────────────┘ │ │ └───────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │ │ ┌───────────────────────────────────┐ │
│ │ 4. Modular Framework Blocks        │ │ │ │ Actions: Copy · Download · Save   │ │
│ │    • Reorder (Up/Down), Toggle     │ │ │ └───────────────────────────────────┘ │
│ │    • Edit Block Content & Examples │ │ │                                       │
│ └────────────────────────────────────┘ │ │                                       │
└────────────────────────────────────────┘ └───────────────────────────────────────┘
```

### Data Model & State
- **Engineering Blueprints (`EngineeringBlueprint`)**: 15 deeply researched engineering templates spanning all 5 requested sub-disciplines (Mechanical, Product, Manufacturing, Process, Analysis). Each blueprint includes domain metadata, default variable definitions with realistic engineering presets, recommended constraint modules, a weak "naive prompt" baseline (for the side-by-side comparison mode), and canonical block content mapped across all supported frameworks.
- **Modular Blocks (`PromptBlock`)**: Represents a single structural section (e.g., *Context / System Boundary*, *Objective / Engineering Deliverable*, *Governing Equations & Standards*, *Step-by-Step Analytical Method*, *Few-Shot Input/Output Calibration*, *Failure & Assumption Verification*). Each block supports enabling/disabling, reordering, content editing, and custom block creation.
- **Engineering Constraint Injectors (`ConstraintModule`)**: Categorized toggles covering *Units & Conventions*, *Industry Standards*, *Mathematical & Analytical Rigor*, and *Output Formatting*. When toggled on, they deterministically weave concise, authoritative constraint clauses into the compiled prompt.
- **Dynamic Variables (`VariableSlot`)**: Auto-detected from `{{variable_name}}` tokens inside any active block, paired with quick-select engineering chips (e.g. clicking `Ti-6Al-4V (Grade 5)` or `6061-T6 Aluminum` for `{{material_grade}}`) as well as custom text input.

### Interactive Component & State Mapping
- **Discipline Filter & Search Bar**: Filters the 15 engineering blueprints by category (`Mechanical`, `Product`, `Manufacturing`, `Process`, `Analysis`) or keyword search; clicking any blueprint loads its blocks, variables, and constraints into the builder with a confirmation guard if the user has unsaved edits.
- **Framework Switcher (`CO-STAR` / `RISEN` / `Few-Shot` / `First-Principles`)**: Re-organizes the active prompt blocks to match the chosen framework's methodology while preserving user-edited text and variable values.
- **Variable Quick-Fill & Auto-Detection**: Typing `{{custom_param}}` in any block editor immediately spawns a new interactive variable input card in the Variable Deck; filling a variable updates the live compiled output in real time and clears any "Unfilled Variable" amber indicator.
- **Block Reordering & Customization**: Up/Down move buttons, enable/disable switches, reset-to-default buttons, and an "Add Custom Specification Block" form.
- **Weak vs. Engineered Anatomy Inspector**: Toggles the right-hand preview between the live compiled prompt and an annotated side-by-side comparison showing a naive 1-line engineering prompt vs. the structured playbook prompt, highlighting specific failure modes prevented (e.g., unit mismatch, unstated boundary conditions, hallucinated safety factors).
- **Saved Playbook Recipes Drawer/Section**: Persists custom-assembled prompts to `localStorage` so users can save, reload, duplicate, or delete their own company-specific engineering prompt templates.
