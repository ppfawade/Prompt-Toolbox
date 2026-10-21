<div align="center">

# Prompt-Toolbox

**Interactive Single-Page Engineering Prompt Playbook & Deterministic Modular Framework Builder**

[![React](https://img.shields.io/badge/React-19.0-0284C7?style=flat-square&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Apache_2.0-059669?style=flat-square)](https://opensource.org/licenses/Apache-2.0)

*Assemble rigorous, standards-compliant engineering prompts in seconds using CO-STAR, RISEN, Few-Shot Analytical, and First-Principles frameworks.*

[Explore Express Builder](#usage--workflow) · [15 Engineering Blueprints](#engineering-blueprint-catalog) · [Technical Reference](#prompt-engineering-frameworks) · [Disclaimer & Attribution](#legal-disclaimer--attribution)

</div>

---

## Table of Contents

- [About The Project](#about-the-project)
- [Key Features](#key-features)
- [Prompt Engineering Frameworks](#prompt-engineering-frameworks)
- [Engineering Blueprint Catalog](#engineering-blueprint-catalog)
- [Engineering Standards & Rigor Modules](#engineering-standards--rigor-modules)
- [Tech Stack & Architecture](#tech-stack--architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running Locally](#running-locally)
- [Usage & Workflow](#usage--workflow)
- [Contributing](#contributing)
- [License](#license)
- [Legal Disclaimer & Attribution](#legal-disclaimer--attribution)

---

## About The Project

Generic, one-line prompts often fail in technical and industrial engineering workflows—producing unit mismatches, unstated boundary assumptions, conflated prevention/detection controls, or textbook equations that ignore temperature derating and manufacturing tolerances.

**Prompt-Toolbox** solves this by providing a deterministic, rule-based prompt assembly workbench purpose-built for:
- **Mechanical Engineering** (FEA, GD&T Tolerance Stack-Ups, Thermal Networks)
- **Product & DFM Engineering** (Injection Molding/Casting DFM, AIAG-VDA DFMEA, Ashby Material Selection)
- **Manufacturing & Quality** (8D / 5-Why Root Cause, CNC Process Planning, MSA Gage R&R & SPC Cp/Cpk)
- **Process & Chemical Engineering** (Mass & Energy Balances, P&ID / HAZOP Reviews, Factorial/RSM DOE)
- **Engineering Analysis** (Fracture Mechanics & Fatigue Life, Kepner-Tregoe / Pugh Trade Studies, DVT Accelerated Life Testing)

All prompt compilation, variable interpolation, standard injection, and 6-point specification rubric checks run **100% deterministically in the browser** with zero external AI calls.

---

## Key Features

- **Express Builder (Rapid Time-to-Prompt Cockpit)**: Switch across all 15 engineering blueprints from a top command bar, populate boundary parameters via one-click presets, and copy the compiled specification in under 15 seconds.
- **Cross-Framework Live Remapping**: Switch seamlessly between **CO-STAR**, **RISEN**, **Few-Shot Analytical**, and **First-Principles Spec** without losing entered parameter values or custom blocks.
- **Dynamic `{{Variable}}` Auto-Detection**: Typing `{{custom_parameter}}` inside any prompt block automatically spawns a new interactive input field in the Boundary Parameters deck.
- **One-Click Engineering Standard Injectors**: Deterministically weave authoritative clauses (`ASME Y14.5-2018`, `ISO 2768-mK`, `AIAG-VDA FMEA`, `ASTM/AMS`, `ASME Sec VIII / API 520`) and unit conventions (`SI Metric`, `Imperial`, or `Dual`) into your prompt.
- **6-Point Deterministic Spec Rubric**: Automatically audits the assembled prompt for specialist persona, populated variables, governing standards, stepwise derivations, assumption bounds, and output table schemas.
- **Dedicated Technical Reference & Diff View**: Inspect full governing physics axioms, 4-stage analytical sequences, Few-Shot calibration examples, and side-by-side **Weak vs. Engineered Prompt** failure analyses.
- **Multi-Format Export & Local Library**: Copy or download compiled prompts as **Markdown (`.md`)**, **XML-Delimited (`.xml`)**, or **JSON Payload (`.json`)**, and save custom team recipes to `localStorage`.

---

## Prompt Engineering Frameworks

| Framework | Block Sequence | Core Engineering Strength | Best Suited For |
| :--- | :--- | :--- | :--- |
| **CO-STAR** | `C → O → S → T → A → R` | Separates physical boundary conditions (*Context*) and quantifiable deliverables (*Objective*) from communication rigor (*Style, Tone, Audience*) and structured tables (*Response*). | Design reviews, DFM reports, cross-functional specs, and stakeholder trade-off matrices |
| **RISEN** | `R → I → S → E → N` | Enforces a strict procedural sequence (*Steps*) and explicit negative guardrails (*Narrowing*) so multi-stage workflows never skip verification gates. | SOP generation, 8D root-cause investigations, CNC routing, and DVT test protocols |
| **Few-Shot Analytical** | `SYS → TASK → EX → COT → OUT` | Anchors deterministic formatting and engineering judgment by providing a concrete `Input → Derivation → Output` calibration benchmark prior to solving the target task. | GD&T callout audits, tolerance stack-ups, BOM classification, and PFMEA scoring |
| **First-Principles Spec** | `AXIOM → BOUND → DERIVE → CHECK → SCHEMA` | Requires explicit conservation laws, control-volume definitions, symbolic equations prior to numerical substitution, and dimensional homogeneity checks. | FEA/CFD boundary audits, thermal/mass balances, fatigue life, and fracture mechanics |

---

## Engineering Blueprint Catalog

| # | Discipline | Blueprint Title | Default Framework | Key Standards & Physics |
| :--- | :--- | :--- | :--- | :--- |
| **01** | Mechanical | **FEA Structural Boundary Condition & Mesh Convergence Review** | `FIRST_PRINCIPLES` | Cauchy equilibrium, von Mises, Saint-Venant, RBE2 vs. RBE3 |
| **02** | Mechanical | **1D/2D Tolerance Stack-Up & ASME Y14.5 GD&T Loop Analysis** | `FEW_SHOT` | ASME Y14.5-2018, Worst-Case vs. RSS ($\pm 3\sigma$), Mean-Shift |
| **03** | Mechanical | **Thermal Resistance Network & Heat Dissipation** | `FIRST_PRINCIPLES` | Fourier conduction, $Re/Pr/Nu$ convection, 3D spreading resistance |
| **04** | Product & DFM | **Design for Manufacturability (DFM) — Injection Molding & Casting** | `CO-STAR` | VDI 3400 draft rules, rib-to-wall ratios ($0.5\text{–}0.6T$), coring |
| **05** | Product & DFM | **Design FMEA (DFMEA) — Function, Failure Cascade & Action Priority** | `RISEN` | AIAG-VDA 7-Step FMEA, P-Diagram, Prevention vs. Detection |
| **06** | Product & DFM | **Ashby Performance Index Material Selection & Trade-Off Matrix** | `CO-STAR` | Ashby indices ($E^{1/2}/\rho$, $\sigma_y/\rho$), ASTM/AMS tempers |
| **07** | Manufacturing | **8D Corrective Action & Physics-Guided 5-Why Investigation** | `RISEN` | IATF 16949 / ISO 9001, Kepner-Tregoe Is/Is-Not, Poka-Yoke |
| **08** | Manufacturing | **CNC Process Plan, Workholding Datum Strategy & Deflection Control** | `RISEN` | 3-2-1 kinematic locating, cantilever deflection $\delta \propto L^3$, CMM |
| **09** | Manufacturing | **MSA Gage R&R & Statistical Process Control (Cp/Cpk) Protocol** | `CO-STAR` | AIAG MSA 4th Ed. ANOVA Gage R&R, 10:1 resolution, $C_p/C_{pk}$ |
| **10** | Process | **Process Mass & Energy Balance, Control Volume & Pinch Audit** | `FIRST_PRINCIPLES` | Species mass closure, latent vs. sensible duty, LMTD & fouling $R_f$ |
| **11** | Process | **P&ID Control Loop & HAZOP Guideword Deviation Safety Review** | `RISEN` | IEC 61882 HAZOP, IEC 61511 BPCS vs. IPL independence, API 520 |
| **12** | Process | **Design of Experiments (DOE) — Factorial / Response Surface** | `CO-STAR` | Montgomery DOE, Resolution & aliasing, center-point curvature |
| **13** | Analysis | **Fracture Mechanics, Fatigue Life (Goodman / Paris Law) & Failure** | `FIRST_PRINCIPLES` | Marin knockdowns, Neuber notch $K_f$, LEFM $\Delta K$, Paris Law |
| **14** | Analysis | **Engineering Architecture Trade-Off & Weighted Pugh Matrix** | `CO-STAR` | Binary MUST gates, physical figures of merit, weight sensitivity |
| **15** | Analysis | **DVT / HALT Test Protocol & Arrhenius / Coffin-Manson Life Plan** | `RISEN` | Arrhenius $AF_T$ (Kelvin), Coffin-Manson $AF_{TC}$, Weibull Success-Run |

---

## Engineering Standards & Rigor Modules

**Prompt-Toolbox** includes 13 toggleable constraint modules across four categories:
1. **Governing Standards**: `ASME Y14.5-2018`, `ISO 2768-mK / ISO 8015`, `AIAG-VDA FMEA`, `ASTM / AMS Material Specs`, `ASME BPVC Sec VIII / API 520`.
2. **Analytical & Math Rigor**: Symbolic Equations Before Numerical Substitution, Dimensional Homogeneity $[M, L, T, \Theta]$ Audit, Dual Worst-Case + RSS ($3\sigma$) Comparison, and $\pm 15\%$ Parameter Sensitivity Perturbation.
3. **Assumptions & Bounds**: Explicit Engineering Assumptions Log and Missing Input / Out-of-Bounds Stop Guard.
4. **Deliverable Schema**: Weighted Pugh Decision Matrix and Sign-Off Verification & Validation (DVT/PVT) Gate Checklist.

---

## Tech Stack & Architecture

```text
prompt-toolbox/
├── index.html                        # Entry HTML & typography imports (Bricolage, Plus Jakarta, IBM Plex Mono, Lora)
├── metadata.json                     # Application metadata
├── package.json                      # Dependencies & scripts
├── src/
│   ├── main.tsx                      # React DOM root
│   ├── index.css                     # Tailwind CSS v4 setup, custom font tokens & drafting grid
│   ├── App.tsx                       # Express Builder, Blueprint Catalog, Technical Reference & Saved Library UI
│   ├── types/
│   │   └── playbook.ts               # TypeScript interfaces for blueprints, blocks, constraints & recipes
│   ├── data/
│   │   └── engineeringPlaybookData.ts # 15 engineering blueprints, 13 constraint modules & cross-framework mapper
│   └── utils/
│       └── promptCompiler.ts         # Deterministic Markdown/XML/JSON compiler & 6-point spec rubric
└── README.md                         # Project documentation
```

---

## Getting Started

### Prerequisites

- **Node.js** `>= 18.0.0`
- **npm** `>= 9.0.0`

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd prompt-toolbox

# Install dependencies
npm install
```

### Running Locally

```bash
# Start the Vite development server on port 3000
npm run dev

# Type-check and build for production
npm run build

# Preview production build
npm run preview
```

---

## Usage & Workflow

1. **Select Discipline & Goal**: Use the top command bar in **Express Builder** (or browse the **Blueprint Catalog** tab) to select one of the 15 engineering templates.
2. **Choose a Prompt Framework**: Click **CO-STAR**, **RISEN**, **Few-Shot**, or **First-Principles** to structure your prompt blocks.
3. **Populate Boundary Parameters (`01. Parameters`)**: Pick from realistic domain presets or enter your exact component dimensions, material grades, loads, and operating temperatures.
4. **Inject Standards & Units (`02. Standards & Units`)**: Select `SI Metric`, `Imperial`, or `Dual` units and toggle applicable ASME, ISO, ASTM, or AIAG-VDA rules.
5. **Customize Modular Blocks (`03. Modular Blocks`)**: Expand any block to refine its instructions, reorder blocks, or append custom blocks.
6. **Export or Save**: Copy the compiled prompt in **Markdown**, **XML**, or **JSON** format, or save it to your browser's **Saved Library**.

---

## Contributing

Contributions to expand the engineering blueprint catalog or add domain-specific standard modules are welcome:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/new-engineering-blueprint`).
3. Add your blueprint definition in `src/data/engineeringPlaybookData.ts`.
4. Commit your changes (`git commit -m 'Add CFD turbulence modeling blueprint'`) and open a Pull Request.

---

## License

Distributed under the **Apache-2.0 License**.

---

## Legal Disclaimer & Attribution

> **IMPORTANT LEGAL & ENGINEERING VERIFICATION DISCLAIMER**
>
> This website and application (**Prompt-Toolbox**) is built and managed with AI—**always check, validate, and independently verify** all assembled prompts, boundary parameters, governing equations, unit conversions, material allowables, and downstream AI outputs before using them in any design, manufacturing, process, or safety-critical engineering workflow.
>
> Prompt-Toolbox is an educational and productivity aid for structuring technical prompts; it does not replace certified professional engineering judgment, physical testing, calibrated metrology, or statutory code compliance reviews. Neither the creator nor the platform assumes any liability or responsibility for errors, omissions, or engineering decisions derived from the use of this tool.
>
> **Created by Prashant Fawade with Gemini from Google.**
