import {
  CanonicalPromptSpec,
  ConstraintModule,
  EngineeringBlueprint,
  FrameworkId,
  PromptBlock,
} from '../types/playbook';

export interface FrameworkMeta {
  id: FrameworkId;
  name: string;
  tagline: string;
  bestFor: string;
  blockCodes: string[];
  description: string;
}

export const FRAMEWORKS: FrameworkMeta[] = [
  {
    id: 'CO-STAR',
    name: 'CO-STAR Architecture',
    tagline: 'Context · Objective · Style · Tone · Audience · Response',
    bestFor: 'Design reviews, cross-functional specs, DFM reports, and stakeholder trade-off matrices',
    blockCodes: ['C', 'O', 'S', 'T', 'A', 'R'],
    description:
      'Separates physical boundary conditions (Context) and quantifiable deliverables (Objective) from technical communication constraints (Style, Tone, Audience) and output tables (Response).',
  },
  {
    id: 'RISEN',
    name: 'RISEN Protocol',
    tagline: 'Role · Instructions · Steps · End Goal · Narrowing',
    bestFor: 'SOP generation, 8D root-cause investigations, CNC process planning, and test protocols',
    blockCodes: ['R', 'I', 'S', 'E', 'N'],
    description:
      'Enforces a strict procedural sequence (Steps) and explicit negative/boundary guardrails (Narrowing) so multi-stage manufacturing or process workflows never skip critical verification checks.',
  },
  {
    id: 'FEW_SHOT',
    name: 'Few-Shot Analytical',
    tagline: 'Domain Role · Task & Bounds · Calibrated Example · Verification Method',
    bestFor: 'GD&T callout audits, BOM cost-down classification, PFMEA scoring, and tolerance stack-ups',
    blockCodes: ['SYS', 'TASK', 'EX', 'COT', 'OUT'],
    description:
      'Anchors deterministic formatting and engineering judgment by providing a concrete input-reasoning-output calibration example before executing the target calculation.',
  },
  {
    id: 'FIRST_PRINCIPLES',
    name: 'First-Principles Spec',
    tagline: 'Control Volume · Governing Equations · Assumptions · Stepwise Derivation · Sensitivity',
    bestFor: 'FEA/CFD boundary audits, thermal/mass balances, fatigue life, and failure mechanics',
    blockCodes: ['AXIOM', 'BOUND', 'DERIVE', 'CHECK', 'SCHEMA'],
    description:
      'Requires explicit conservation laws, free-body or control-volume definitions, symbolic equations prior to numerical substitution, and dimensional homogeneity checks.',
  },
];

export const CONSTRAINT_MODULES: ConstraintModule[] = [
  // STANDARDS
  {
    id: 'std-asme-y145',
    label: 'ASME Y14.5 GD&T Compliance',
    category: 'STANDARDS',
    shortCode: 'ASME Y14.5-2018',
    description: 'Enforces datum precedence, material condition modifiers (MMC/LMC/RFS), and feature control frame syntax.',
    injectedClause:
      'Strictly adhere to ASME Y14.5-2018 Geometric Dimensioning and Tolerancing conventions. Explicitly state primary, secondary, and tertiary datum reference frames (A|B|C) and justify any MMC (Ⓜ) or LMC (Ⓛ) bonus tolerance assumptions.',
    recommendedFor: ['MECHANICAL', 'PRODUCT_DFM', 'MANUFACTURING'],
  },
  {
    id: 'std-iso-gps',
    label: 'ISO 2768 / ISO 8015 General Tolerances',
    category: 'STANDARDS',
    shortCode: 'ISO 2768-mK',
    description: 'Applies ISO Geometrical Product Specifications and general machining tolerance classes.',
    injectedClause:
      'Reference ISO 8015 fundamental tolerancing principles and ISO 2768-mK general linear/angular tolerance classes for any non-critical features without explicit GD&T callouts.',
    recommendedFor: ['MECHANICAL', 'PRODUCT_DFM', 'MANUFACTURING'],
  },
  {
    id: 'std-aiag-vda-fmea',
    label: 'AIAG & VDA FMEA 7-Step Handbook',
    category: 'STANDARDS',
    shortCode: 'AIAG-VDA FMEA',
    description: 'Uses Action Priority (AP: High/Medium/Low) instead of legacy RPN multiplication.',
    injectedClause:
      'Score Severity (S), Occurrence (O), and Detection (D) on the 1–10 AIAG-VDA scale and evaluate Action Priority (AP = High, Medium, Low) rather than relying solely on raw RPN multiplication, prioritizing High-Severity (S ≥ 9) failure modes first.',
    recommendedFor: ['PRODUCT_DFM', 'MANUFACTURING', 'PROCESS'],
  },
  {
    id: 'std-astm-mat',
    label: 'ASTM / AMS Material Temper & Spec Verification',
    category: 'STANDARDS',
    shortCode: 'ASTM / AMS',
    description: 'Requires explicit heat-treat temper, grain direction, and room-vs-elevated temperature derating.',
    injectedClause:
      'Cite applicable ASTM/AMS material designations including exact heat-treatment/temper state. Distinguish between room-temperature nominal properties and temperature-derated allowables (Sy, Su, E) at the specified operating envelope.',
    recommendedFor: ['MECHANICAL', 'PRODUCT_DFM', 'ANALYSIS'],
  },
  {
    id: 'std-asme-bpvc',
    label: 'ASME BPVC / Process Safety & Relief Sizing',
    category: 'STANDARDS',
    shortCode: 'ASME Sec VIII / API 520',
    description: 'Enforces pressure vessel design margins, relief sizing, and HAZOP containment rules.',
    injectedClause:
      'Evaluate containment and pressure boundaries against ASME Boiler and Pressure Vessel Code (Section VIII) and API 520/521 relief sizing guidelines, accounting for maximum allowable working pressure (MAWP) and Fouling/Corrosion allowances.',
    recommendedFor: ['PROCESS', 'MECHANICAL', 'ANALYSIS'],
  },

  // ANALYTICAL RIGOR
  {
    id: 'rigor-symbolic-first',
    label: 'Symbolic Equations Before Numerical Substitution',
    category: 'RIGOR',
    shortCode: 'Symbolic → Numeric',
    description: 'Prevents arithmetic hallucinations by requiring closed-form formulas prior to plugging in numbers.',
    injectedClause:
      'Write out every governing equation in symbolic variable form first, define each variable with its exact units, and only then substitute numerical values step by step.',
    recommendedFor: ['MECHANICAL', 'PROCESS', 'ANALYSIS'],
  },
  {
    id: 'rigor-dimensional-check',
    label: 'Dimensional Homogeneity & Unit Conversion Audit',
    category: 'RIGOR',
    shortCode: 'Unit Audit',
    description: 'Audits every equation term to verify left-hand and right-hand units match.',
    injectedClause:
      'Perform an explicit dimensional analysis check [M, L, T, Θ] on each intermediate calculation and verify unit consistency across all pressure, stress, flow, and thermal terms before reporting final figures.',
    recommendedFor: ['MECHANICAL', 'PROCESS', 'ANALYSIS'],
  },
  {
    id: 'rigor-worst-case-rss',
    label: 'Dual Worst-Case & RSS Statistical Comparison',
    category: 'RIGOR',
    shortCode: 'Worst-Case + RSS (3σ)',
    description: 'Computes both linear worst-case and Root-Sum-Square (Cpk = 1.33) stack-ups.',
    injectedClause:
      'Calculate both Arithmetic Worst-Case limits and Statistical Root-Sum-Square (RSS at ±3σ / Cpk = 1.33) distributions, and explicitly quantify the assembly interference risk under each method.',
    recommendedFor: ['MECHANICAL', 'PRODUCT_DFM', 'MANUFACTURING'],
  },
  {
    id: 'rigor-sensitivity',
    label: 'Parameter Sensitivity & Margin Perturbation (±15%)',
    category: 'RIGOR',
    shortCode: '±15% Sensitivity',
    description: 'Tests how the conclusion shifts if the dominant load, friction, or fouling factor varies by ±15%.',
    injectedClause:
      'Include a sensitivity perturbation analysis showing how the primary safety factor or process yield changes if the most uncertain boundary input varies by ±15%.',
    recommendedFor: ['MECHANICAL', 'PROCESS', 'ANALYSIS'],
  },

  // BOUNDARY & ASSUMPTION GUARDS
  {
    id: 'bound-explicit-assumptions',
    label: 'Explicit Engineering Assumptions Log',
    category: 'BOUNDARY',
    shortCode: 'Assumptions Table',
    description: 'Mandates a dedicated list of simplifying assumptions (steady-state, isotropic, adiabatic, etc.).',
    injectedClause:
      'List all simplifying physical assumptions (e.g., isotropic linear elasticity, steady-state incompressible flow, negligible radiation heat loss, rigid fixture support) and state the exact condition under which each assumption breaks down.',
    recommendedFor: ['MECHANICAL', 'PRODUCT_DFM', 'MANUFACTURING', 'PROCESS', 'ANALYSIS'],
  },
  {
    id: 'bound-missing-data-guard',
    label: 'Missing Input & Out-of-Bounds Stop Guard',
    category: 'BOUNDARY',
    shortCode: 'No Hallucinated Constants',
    description: 'Forbids inventing missing geometry or material constants silently; flags bounded ranges instead.',
    injectedClause:
      'Do NOT silently invent missing geometry, boundary loads, or proprietary material constants. If a required parameter is unspecified, explicitly flag it as [ASSUMED RANGE: min–max] with an industry-standard justification.',
    recommendedFor: ['MECHANICAL', 'PRODUCT_DFM', 'MANUFACTURING', 'PROCESS', 'ANALYSIS'],
  },

  // OUTPUT SCHEMA
  {
    id: 'schema-tradeoff-matrix',
    label: 'Weighted Pugh / Engineering Decision Matrix',
    category: 'OUTPUT_SCHEMA',
    shortCode: 'Weighted Pugh Matrix',
    description: 'Structures comparisons into a weighted quantitative engineering trade-off table.',
    injectedClause:
      'Present candidate solutions in a structured Markdown Pugh Decision Matrix with explicit criteria weights (1–5), raw engineering metrics, normalized scores, and a weighted total.',
    recommendedFor: ['PRODUCT_DFM', 'MECHANICAL', 'MANUFACTURING', 'ANALYSIS'],
  },
  {
    id: 'schema-verification-gate',
    label: 'Sign-Off Verification & Test Gate Checklist',
    category: 'OUTPUT_SCHEMA',
    shortCode: 'DVT/PVT Gate Checklist',
    description: 'Appends an actionable bench/lab validation checklist with pass/fail acceptance criteria.',
    injectedClause:
      'Conclude with a concrete Verification & Validation (V&V) checklist specifying inspection metrology method, sample size, test fixture setup, and quantitative Pass/Fail acceptance thresholds.',
    recommendedFor: ['PRODUCT_DFM', 'MANUFACTURING', 'PROCESS', 'ANALYSIS'],
  },
];

export const ENGINEERING_BLUEPRINTS: EngineeringBlueprint[] = [
  // 1. MECHANICAL: FEA Boundary Condition & Stress Audit
  {
    id: 'mech-fea-audit',
    title: 'FEA Structural Boundary Condition & Mesh Convergence Review',
    discipline: 'MECHANICAL',
    disciplineLabel: 'Mechanical Engineering',
    shortSummary: 'Audit finite element constraints, load paths, singularities, and safety factors before design release.',
    engineeringGoal: 'Formulate a rigorous FEA setup and stress verification protocol for a load-bearing component.',
    recommendedFramework: 'FIRST_PRINCIPLES',
    defaultUnitSystem: 'SI',
    defaultConstraints: ['std-astm-mat', 'rigor-symbolic-first', 'bound-explicit-assumptions', 'rigor-sensitivity'],
    variables: [
      {
        key: 'component_name',
        label: 'Component / Assembly Geometry',
        placeholder: 'e.g., CNC-machined gearbox mounting bracket',
        defaultValue: 'CNC-machined aerospace actuator mounting bracket with 4x M8 bolted bosses',
        presets: [
          'CNC-machined aerospace actuator mounting bracket with 4x M8 bolted bosses',
          'Die-cast aluminum EV battery tray cross-member under crash deceleration',
          '316L stainless steel cantilevered sensor probe under vortex shedding',
        ],
      },
      {
        key: 'material_grade',
        label: 'Material & Temper Designation',
        placeholder: 'e.g., 7075-T6 Aluminum',
        defaultValue: 'Aluminum 7075-T7351 (Sy = 435 MPa, Su = 505 MPa, E = 71.7 GPa)',
        presets: [
          'Aluminum 7075-T7351 (Sy = 435 MPa, Su = 505 MPa, E = 71.7 GPa)',
          'Ti-6Al-4V Grade 5 Annealed (Sy = 880 MPa, Su = 950 MPa)',
          'AISI 4140 Quenched & Tempered Steel (Sy = 655 MPa)',
          'PEEK 30% Carbon Fiber Reinforced (Sy = 220 MPa at 23°C)',
        ],
      },
      {
        key: 'loading_envelope',
        label: 'Primary Load Case & Environment',
        placeholder: 'e.g., 14.5 kN off-axis thrust at 120°C',
        defaultValue: '18.5 kN dynamic axial thrust + 240 N·m torsional moment at -40°C to +115°C',
        presets: [
          '18.5 kN dynamic axial thrust + 240 N·m torsional moment at -40°C to +115°C',
          '45G shock pulse (11 ms half-sine) + 50 kPa internal differential pressure',
          'Fully reversed cyclic bending (±6.2 kN at 35 Hz for 10^7 cycles)',
        ],
      },
      {
        key: 'target_safety_factor',
        label: 'Minimum Safety Factor Criteria',
        placeholder: 'e.g., FS_yield >= 1.5, FS_ultimate >= 2.0',
        defaultValue: 'Yield FS ≥ 1.60 (von Mises), Ultimate FS ≥ 2.00, Bolt Slip Margin ≥ 1.25',
        presets: [
          'Yield FS ≥ 1.60 (von Mises), Ultimate FS ≥ 2.00, Bolt Slip Margin ≥ 1.25',
          'ASME Sec VIII Div 2 Elastic-Plastic Margin ≥ 2.4',
          'Infinite Fatigue Life Goodman Safety Factor ≥ 1.50',
        ],
      },
    ],
    canonical: {
      roleAndDomain:
        'Act as a Principal Structural & Finite Element Analysis (FEA) Mechanical Engineer specializing in non-linear contact, bolted joint mechanics, and analytical hand-calculation verification.',
      systemContext:
        'We are evaluating a {{component_name}} fabricated from {{material_grade}} subjected to {{loading_envelope}}. Target acceptance criteria are {{target_safety_factor}}.',
      primaryObjective:
        'Develop a complete analytical pre-check and FEA boundary condition specification that prevents over-constrained stiffness errors, distinguishes artificial stress singularities from true geometric stress concentrations (Kt), and verifies structural margins.',
      analyticalSteps: [
        '1. Free-Body Equilibrium & Load Path Hand-Check: Establish static equilibrium (∑F = 0, ∑M = 0) and derive closed-form nominal bending, shear, and bearing stress estimates at the critical cross-section before referencing FEA.',
        '2. Boundary Condition & Contact Definition: Specify exact degree-of-freedom (DOF) restraints, bolt preload representation (beam vs. solid pretension elements + friction coefficient μ), and compliant interface modeling to avoid artificial infinite stiffness.',
        '3. Mesh Strategy & Singularity Separation: Define local h-refinement zones around fillets/holes (minimum 3–4 quadratic tetrahedral/hexahedral elements through thickness) and provide criteria to separate sharp re-entrant corner numerical singularities from physical peak stresses.',
        '4. Failure Theory & Margin Evaluation: Compute Margins of Safety (MS = [Allowable / (Design_Load × FS)] - 1) using von Mises equivalent stress for ductile yield, principal stress for brittle fracture, and fastener axial/shear interaction equations.',
      ],
      technicalStyleAndTone:
        'Rigorous, quantitative structural engineering specification style. Use exact mechanical terminology (Saint-Venant principle, preload relaxation, stress triaxiality, element Jacobian quality).',
      targetAudience:
        'Senior Mechanical Design Engineers, Stress Analysts, and Chief Engineer sign-off review board.',
      narrowingAndBounds:
        'Do not treat fixed-support (all 6 DOF locked) boundary conditions on mounting faces as physically realistic if bolted interfaces can separate or slip. Explicitly flag thermal expansion mismatch (Δα·ΔT) across mating materials.',
      responseSchema:
        'Provide: (1) Analytical Hand-Calculation Baseline (symbolic + numeric), (2) FEA Boundary Condition & Contact Table, (3) Mesh Convergence & Singularity Audit Protocol, and (4) Margin of Safety Summary Table.',
      fewShotExample: {
        sampleInput: 'Cantilevered clevis lug (7075-T6, thickness t = 12 mm, hole diameter D = 16 mm, edge distance e = 24 mm) under 20 kN pin load.',
        sampleReasoning: 'Check net-section tension σ_net = P / [(W - D)·t], shear tear-out τ = P / (2·e·t), and bearing stress σ_br = P / (D·t) before setting up pin compression-only contact in FEA.',
        sampleOutput: 'σ_br = 20,000 N / (16 mm × 12 mm) = 104.2 MPa | Yield FS = 435 / 104.2 = 4.17 (PASS). FEA Pin Contact: Cosine load distribution or frictionless cylindrical pin with radial clearance Δr = 0.05 mm.',
      },
      firstPrinciplesAxioms:
        'Governing Physics: Cauchy momentum equilibrium (∇·σ + f = 0), Hooke’s generalized thermo-elasticity, von Mises distortion energy criterion (σ_vm = √[½((σ1-σ2)² + (σ2-σ3)² + (σ3-σ1)²)]), and Saint-Venant’s decay distance for local boundary perturbations.',
    },
    weakPromptBaseline:
      'How should I run an FEA stress analysis on my {{component_name}} made of {{material_grade}} under {{loading_envelope}} to make sure it has a safety factor of {{target_safety_factor}}?',
    failureModesPrevented: [
      {
        aspect: 'Over-Constrained Boundary Conditions',
        weakFailureMode: 'Generic prompt tells user to "fix the mounting holes", artificially stiffening the flange and under-predicting bending stress by 30–50%.',
        engineeredFix: 'Mandates bolt pretension elements, frictional contact separation, and DOF audit.',
      },
      {
        aspect: 'Mesh Singularities vs. Real Peak Stress',
        weakFailureMode: 'LLM suggests refining mesh endlessly without explaining stress divergence at sharp 90° steps or rigid spider (RBE2) nodes.',
        engineeredFix: 'Distinguishes RBE2 (rigid) vs. RBE3 (load-distributing) connectors and requires nominal hand-calculation anchoring.',
      },
      {
        aspect: 'Temperature & Temper Derating',
        weakFailureMode: 'Uses textbook room-temperature yield strength regardless of thermal envelope or thickness effects.',
        engineeredFix: 'Enforces exact temper allowables and thermal expansion mismatch Δα·ΔT evaluation.',
      },
    ],
  },

  // 2. MECHANICAL: Tolerance Stack-Up & GD&T Audit
  {
    id: 'mech-gdt-stackup',
    title: '1D/2D Tolerance Stack-Up & ASME Y14.5 GD&T Loop Analysis',
    discipline: 'MECHANICAL',
    disciplineLabel: 'Mechanical Engineering',
    shortSummary: 'Build a vector loop tolerance chain comparing Worst-Case and Statistical RSS (3σ) assembly clearances.',
    engineeringGoal: 'Calculate critical assembly gap/interference limits and optimize datum schemes to avoid over-tightened machining tolerances.',
    recommendedFramework: 'FEW_SHOT',
    defaultUnitSystem: 'SI',
    defaultConstraints: ['std-asme-y145', 'rigor-worst-case-rss', 'bound-explicit-assumptions', 'schema-tradeoff-matrix'],
    variables: [
      {
        key: 'assembly_interface',
        label: 'Critical Gap / Interface Under Study',
        placeholder: 'e.g., Axial air-gap between rotor magnet and stator housing',
        defaultValue: 'Axial clearance gap between high-speed impeller shroud and stationary pump volute wear ring',
        presets: [
          'Axial clearance gap between high-speed impeller shroud and stationary pump volute wear ring',
          'Radial concentricity alignment between optical lens barrel and CMOS sensor active plane',
          'Snap-fit latch engagement overlap in a 4-part injection-molded medical injector',
        ],
      },
      {
        key: 'contributing_features',
        label: 'Chain Dimensions & Part Loop',
        placeholder: 'e.g., Shaft shoulder (45.0 ±0.1), Bearing width (12.0 +0/-0.08)...',
        defaultValue: 'Housing depth (62.50 ±0.12 mm), Gasket compressed thickness (1.50 ±0.15 mm), Bearing outer ring (14.00 +0.00/-0.08 mm), Shaft shoulder step (45.20 ±0.10 mm), Impeller hub (2.40 ±0.06 mm)',
        presets: [
          'Housing depth (62.50 ±0.12 mm), Gasket compressed thickness (1.50 ±0.15 mm), Bearing outer ring (14.00 +0.00/-0.08 mm), Shaft shoulder step (45.20 ±0.10 mm), Impeller hub (2.40 ±0.06 mm)',
          'PCB thickness (1.60 ±0.16 mm), Standoff height (8.00 ±0.08 mm), Elastomer pad (1.20 ±0.20 mm), Enclosure boss (9.10 ±0.10 mm)',
        ],
      },
      {
        key: 'functional_limits',
        label: 'Allowable Gap / Interference Window',
        placeholder: 'e.g., Min gap 0.15 mm (no rub), Max gap 0.85 mm (efficiency)',
        defaultValue: 'Minimum Gap ≥ 0.15 mm (prevent mechanical rub at 85°C), Maximum Gap ≤ 0.75 mm (prevent hydrodynamic recirculation loss)',
        presets: [
          'Minimum Gap ≥ 0.15 mm (prevent mechanical rub at 85°C), Maximum Gap ≤ 0.75 mm (prevent hydrodynamic recirculation loss)',
          'Zero-interference clearance ≥ 0.05 mm at Worst-Case MMC condition',
          'Press-fit radial interference between 0.018 mm and 0.045 mm across ±3σ',
        ],
      },
    ],
    canonical: {
      roleAndDomain:
        'Act as a Principal Dimensional Management & ASME Y14.5-2018 GD&T Specialist.',
      systemContext:
        'We are analyzing the tolerance loop for: {{assembly_interface}}. The contributing dimensional chain consists of: {{contributing_features}}. The functional engineering acceptance window is: {{functional_limits}}.',
      primaryObjective:
        'Construct a signed vector tolerance loop table, convert asymmetric/unilateral tolerances to symmetric mean-shift equivalents, compute both Worst-Case and Statistical RSS (3σ / Cpk = 1.33) gap extremes, and recommend GD&T datum or tolerance reallocations if limits are violated.',
      analyticalSteps: [
        '1. Vector Loop Definition: Define positive (+1) and negative (-1) loop directions from the start surface to the closing gap, and convert any unilateral/bilateral unequal tolerances into Mean Nominal ± Symmetric Half-Tolerance.',
        '2. Geometric & Bonus Tolerance Incorporation: Account for position, profile, runout, and datum shift contributions (including MMC/LMC bonus where applicable).',
        '3. Dual Stack-Up Computation: Calculate Nominal Mean Gap, Worst-Case Min/Max Gap (∑|t_i|), and RSS Statistical Min/Max Gap (√∑(t_i²)) alongside percent contribution (t_i² / ∑t_i²) of each feature.',
        '4. Tolerance Reallocation & Datum Optimization: For the top 2 variance drivers, propose direct datum alignment (eliminating intermediate steps) or Cpk-aware tolerance adjustments.',
      ],
      technicalStyleAndTone:
        'Exact dimensional metrology format using signed tabular columns and explicit +/- vector signs.',
      targetAudience:
        'Mechanical Design, Tooling & Metrology, and Quality Inspection Engineers.',
      narrowingAndBounds:
        'Never add asymmetric tolerances directly without first shifting nominal dimensions to their midpoint. State whether thermal growth ΔL = α·L·ΔT is included or excluded.',
      responseSchema:
        'Output: (1) Signed Vector Loop Table (Part, Feature, Direction ±1, Mean Dim, ±Tol, Variance Contribution %), (2) Worst-Case vs. RSS Summary against {{functional_limits}}, and (3) GD&T Datum Optimization Recommendations.',
      fewShotExample: {
        sampleInput: 'Groove width 10.00 +0.10/-0.00 mm (+1), Snap ring thickness 9.80 +0.00/-0.06 mm (-1).',
        sampleReasoning: 'Convert to symmetric: Groove = 10.05 ±0.05 mm (+1); Ring = 9.77 ±0.03 mm (-1). Mean Gap = 10.05 - 9.77 = 0.28 mm.',
        sampleOutput: 'WC Tol = ±(0.05 + 0.03) = ±0.08 mm → Gap [0.20, 0.36] mm. RSS Tol = ±√(0.05² + 0.03²) = ±0.058 mm → Gap [0.222, 0.338] mm.',
      },
      firstPrinciplesAxioms:
        'Linear propagation of error: For gap G = ∑(s_i · X_i) where s_i ∈ {-1, +1}, μ_G = ∑(s_i · μ_i), T_WC = ∑ T_i, and σ_G = √∑(s_i² · σ_i²) under statistically independent normal manufacturing distributions.',
    },
    weakPromptBaseline:
      'Calculate the tolerance stack up for {{assembly_interface}} with dimensions {{contributing_features}} and check if it meets {{functional_limits}}.',
    failureModesPrevented: [
      {
        aspect: 'Unilateral Tolerance Mean Shift Error',
        weakFailureMode: 'LLMs routinely sum +0.00/-0.08 directly as ±0.08 without shifting the nominal mean by -0.04 mm, corrupting the entire stack result.',
        engineeredFix: 'Mandates midpoint normalization (Mean ± Symmetric Half-Tol) in Step 1 with a concrete calibrated example.',
      },
      {
        aspect: 'Variance Pareto Identification',
        weakFailureMode: 'Recommends tightening all part tolerances equally, driving up CNC machining cost unnecessarily.',
        engineeredFix: 'Computes variance contribution percentage (t_i² / ∑t_i²) so only the dominant variance driver is adjusted.',
      },
    ],
  },

  // 3. MECHANICAL: Thermal & Fluid Heat Exchanger / Enclosure Cooling
  {
    id: 'mech-thermal-cooling',
    title: 'Thermal Resistance Network & Electronics / Mechanical Heat Dissipation',
    discipline: 'MECHANICAL',
    disciplineLabel: 'Mechanical Engineering',
    shortSummary: 'Model conduction, convection (Nu/Re/Pr), and radiation pathways to verify junction/surface temperatures.',
    engineeringGoal: 'Size heatsinks, cold plates, or natural/forced convection cooling paths from first principles.',
    recommendedFramework: 'FIRST_PRINCIPLES',
    defaultUnitSystem: 'SI',
    defaultConstraints: ['rigor-symbolic-first', 'rigor-dimensional-check', 'bound-explicit-assumptions', 'rigor-sensitivity'],
    variables: [
      {
        key: 'heat_source_spec',
        label: 'Heat Source & Thermal Load (Q)',
        placeholder: 'e.g., 180W SiC inverter module (footprint 65x45 mm)',
        defaultValue: '240 W total continuous thermal dissipation across 3x SiC MOSFET modules (footprint 50 mm × 40 mm each)',
        presets: [
          '240 W total continuous thermal dissipation across 3x SiC MOSFET modules (footprint 50 mm × 40 mm each)',
          '85 W sealed IP67 die-cast outdoor industrial edge compute enclosure with solar load',
          '4.2 kW hydraulic oil manifold heat rejection during continuous duty cycle',
        ],
      },
      {
        key: 'ambient_boundary',
        label: 'Ambient Fluid & Operating Conditions',
        placeholder: 'e.g., Forced air at 45°C, 3.5 m/s velocity, 2000m altitude',
        defaultValue: 'Forced air cooling at T_amb = 50°C, inlet velocity V = 4.0 m/s, altitude = 1,500 m (ρ ≈ 1.00 kg/m³)',
        presets: [
          'Forced air cooling at T_amb = 50°C, inlet velocity V = 4.0 m/s, altitude = 1,500 m (ρ ≈ 1.00 kg/m³)',
          'Natural buoyancy convection in still air at T_amb = 45°C inside cabinet',
          '50/50 Water-Ethylene Glycol liquid cold plate at 2.5 L/min, T_inlet = 35°C',
        ],
      },
      {
        key: 'max_temp_limit',
        label: 'Maximum Allowable Temperature & TIM Spec',
        placeholder: 'e.g., T_case <= 95°C, TIM k = 4.5 W/m·K at 0.15 mm BLT',
        defaultValue: 'Max Baseplate Temperature T_case ≤ 90°C; Thermal Interface Material (TIM) k = 5.0 W/(m·K) at 0.12 mm bond-line thickness',
        presets: [
          'Max Baseplate Temperature T_case ≤ 90°C; Thermal Interface Material (TIM) k = 5.0 W/(m·K) at 0.12 mm bond-line thickness',
          'Max Junction T_j ≤ 125°C with R_th(j-c) = 0.25 K/W and 10°C design margin',
        ],
      },
    ],
    canonical: {
      roleAndDomain:
        'Act as a Lead Thermal & Thermo-Fluids Mechanical Engineer specializing in heat transfer, dimensionless Nusselt correlations, and thermal resistance networks.',
      systemContext:
        'We need to cool: {{heat_source_spec}} operating under {{ambient_boundary}}. Thermal stack and temperature limits: {{max_temp_limit}}.',
      primaryObjective:
        'Construct a 1D/quasi-2D thermal resistance network (R_total = R_jc + R_tim + R_spreading + R_conv/rad), compute Reynolds/Prandtl/Nusselt numbers for the flow regime, and verify whether the maximum allowable temperature is satisfied.',
      analyticalSteps: [
        '1. Thermal Budget & Required R_th: Calculate maximum allowable total thermal resistance R_th,max = (T_max - T_amb) / Q_total and allocate budgets across interface, spreading, and sink-to-ambient stages.',
        '2. Conduction & Spreading Resistance: Compute TIM resistance R_tim = BLT / (k_tim · A_source) and 3D spreading resistance in the baseplate using Lee/Song dimensionless spreading parameters.',
        '3. Fluid Regime & Convection Coefficient (h): Evaluate air/fluid density (accounting for altitude/temperature), compute Re (laminar vs. turbulent transition), select the appropriate empirical Nusselt correlation (Nu), and derive h = Nu·k_fluid / L_c and fin efficiency η_f.',
        '4. Total Temperature Rise & Design Margin: Sum ΔT across every node and provide corrective geometry levers (fin pitch, pin-fin staggered array, heat pipe integration) if margin < 10°C.',
      ],
      technicalStyleAndTone:
        'Analytical heat-transfer rigor with explicit dimensionless numbers (Re, Pr, Gr, Ra, Nu, Bi) and unit verification.',
      targetAudience:
        'Thermal Packaging Engineers, Mechanical Systems Architects, and Power Electronics Leads.',
      narrowingAndBounds:
        'Do not assume textbook sea-level air density if altitude or elevated ambient temperature is specified. Account for fin boundary-layer pinching if fin spacing is under 2.5 mm.',
      responseSchema:
        'Deliver: (1) Nodal Thermal Resistance Network Table (Node, Mechanism, Formula, R_i [K/W], ΔT_i [°C]), (2) Dimensionless Flow & Fin Efficiency Derivation, and (3) Thermal Margin Verdict & Geometry Optimization.',
      fewShotExample: {
        sampleInput: 'Q = 100 W over A = 0.002 m², TIM BLT = 0.15 mm, k = 3.0 W/(m·K).',
        sampleReasoning: 'R_tim = L / (k·A) = 0.00015 m / (3.0 W/(m·K) × 0.002 m²) = 0.025 K/W.',
        sampleOutput: 'ΔT_tim = Q × R_tim = 100 W × 0.025 K/W = 2.50 °C.',
      },
      firstPrinciplesAxioms:
        'Conservation of Thermal Energy (Q_in = Q_cond + Q_conv + Q_rad), Fourier’s Law (q" = -k∇T), Newton’s Law of Cooling (Q = η_o·h·A_total·(T_s - T_∞)), and Stefan-Boltzmann radiation.',
    },
    weakPromptBaseline:
      'Calculate if my heatsink can cool {{heat_source_spec}} in {{ambient_boundary}} while keeping temperatures below {{max_temp_limit}}.',
    failureModesPrevented: [
      {
        aspect: 'Spreading Resistance Omission',
        weakFailureMode: 'Treats a small heat source on a large baseplate as 1D uniform conduction, under-estimating peak chip temperature by 8–18°C.',
        engineeredFix: 'Explicitly separates 1D TIM resistance from 3D baseplate spreading resistance and fin efficiency η_f.',
      },
      {
        aspect: 'Altitude Derating of Air Density',
        weakFailureMode: 'Uses standard 20°C sea-level air properties, over-predicting mass flow rate at elevated temperature and altitude.',
        engineeredFix: 'Enforces density correction for altitude and film temperature T_film = (T_s + T_amb)/2.',
      },
    ],
  },

  // 4. PRODUCT & DFM: Injection Molding & Die Casting DFM Audit
  {
    id: 'prod-dfm-molding',
    title: 'Design for Manufacturability (DFM) — Injection Molding & Casting Review',
    discipline: 'PRODUCT_DFM',
    disciplineLabel: 'Product & DFM Engineering',
    shortSummary: 'Audit nominal wall thickness, draft angles, rib-to-wall ratios, undercuts, and gate/parting line strategy.',
    engineeringGoal: 'Identify tooling risks, sink marks, warp, and side-action cost drivers before cutting steel mold tooling.',
    recommendedFramework: 'CO-STAR',
    defaultUnitSystem: 'SI',
    defaultConstraints: ['std-iso-gps', 'bound-explicit-assumptions', 'schema-tradeoff-matrix', 'schema-verification-gate'],
    variables: [
      {
        key: 'part_description',
        label: 'Part Geometry & Envelope',
        placeholder: 'e.g., Handheld rugged scanner housing (180x85x42 mm)',
        defaultValue: 'IP66 rugged industrial sensor housing (165 mm × 95 mm × 48 mm) with internal PCB bosses and perimeter elastomer seal groove',
        presets: [
          'IP66 rugged industrial sensor housing (165 mm × 95 mm × 48 mm) with internal PCB bosses and perimeter elastomer seal groove',
          'High-voltage automotive connector shroud with 12x cantilevered locking lances',
          'High-pressure aluminum die-cast (HPDC) motor end-bell with integrated cooling fins',
        ],
      },
      {
        key: 'resin_or_alloy',
        label: 'Polymer Resin / Casting Alloy',
        placeholder: 'e.g., PC/ABS (Bayblend FR3010) or ADC12 Aluminum',
        defaultValue: 'Glass-filled Polycarbonate/PBT blend (20% GF, mold shrinkage 0.35%–0.55%, textured VDI 27 exterior)',
        presets: [
          'Glass-filled Polycarbonate/PBT blend (20% GF, mold shrinkage 0.35%–0.55%, textured VDI 27 exterior)',
          'Unfilled Medical Grade Polypropylene (semi-crystalline, high shrinkage 1.5%–2.2%)',
          'A380 / ADC12 High-Pressure Die Cast Aluminum Alloy',
        ],
      },
      {
        key: 'wall_and_features',
        label: 'Current Wall Thickness & Feature Details',
        placeholder: 'e.g., 2.5 mm nominal wall, 4x M3 bosses (6.5 mm OD), 0.5° draft',
        defaultValue: '2.5 mm nominal wall, local thickening to 4.8 mm at mounting ears, 6x screw bosses (OD 6.2 mm, ID 2.6 mm), current exterior draft 0.5°',
        presets: [
          '2.5 mm nominal wall, local thickening to 4.8 mm at mounting ears, 6x screw bosses (OD 6.2 mm, ID 2.6 mm), current exterior draft 0.5°',
          '1.8 mm wall with 1.5 mm thick stiffening ribs and side port holes perpendicular to pull direction',
        ],
      },
    ],
    canonical: {
      roleAndDomain:
        'Act as a Principal DFM/DFA Product Design Engineer and Master Mold/Tooling Architect.',
      systemContext:
        'We are preparing {{part_description}} for production tooling using {{resin_or_alloy}}. Current CAD geometry parameters: {{wall_and_features}}.',
      primaryObjective:
        'Execute a feature-by-feature Design for Manufacturability (DFM) audit covering wall uniformity, coring, rib/boss sink-mark ratios, texture-adjusted draft angles, parting line / lifters / sliders, and anisotropic warp risks.',
      analyticalSteps: [
        '1. Wall Thickness & Coring Audit: Evaluate nominal wall vs. thick transitions (flagging any region >1.15× nominal wall) and prescribe coring-out strategies to prevent voids, sink marks, and cycle-time penalties.',
        '2. Draft Angle vs. Surface Texture Calculation: Compare current draft angles against VDI 3400 / SPI texture depth rules (adding +1.0° to 1.5° minimum draft per 0.025 mm of texture depth).',
        '3. Rib & Screw Boss Geometry Ratios: Audit rib root thickness (target 50%–60% of nominal wall), boss wall thickness, base fillet radii (0.25×–0.40× wall), and gusset support to eliminate cosmetic witness sinks.',
        '4. Tooling Action, Gate & Knit-Line Strategy: Identify undercuts requiring sliders/lifters, recommend shut-off angles (≥3°–5° for pass-through coring) to eliminate side-actions where possible, and place gates to keep weld/knit lines away from high-stress bosses.',
      ],
      technicalStyleAndTone:
        'Actionable, production-tooling DFM review style with quantitative geometric design rules (ratios, degrees, millimeters).',
      targetAudience:
        'Product Design Engineers, Tooling Vendors, and New Product Introduction (NPI) Leads.',
      narrowingAndBounds:
        'Do not give generic advice like "add draft". Specify exact minimum draft angles in degrees for core vs. cavity and textured walls, and exact millimeter dimensions for cored bosses and ribs.',
      responseSchema:
        'Provide: (1) Critical Tooling Red-Flag Table (Feature, Current CAD Spec, Defect Mechanism, Recommended CAD Revision), (2) Gate, Ejector & Parting Line Plan, and (3) First-Article Inspection (FAI) Critical-to-Quality (CTQ) Dimension List.',
      fewShotExample: {
        sampleInput: 'Nominal wall T = 2.5 mm, VDI 27 texture (Ra ≈ 2.2 μm), current draft = 0.5°, boss OD = 6.2 mm / ID = 2.6 mm.',
        sampleReasoning: 'Boss wall = (6.2 - 2.6)/2 = 1.8 mm (72% of 2.5 mm wall → high sink risk; target ≤ 60% = 1.5 mm). VDI 27 requires ≥ 2.0°–2.5° draft to prevent drag marks.',
        sampleOutput: '1. Reduce boss OD from 6.2 mm to 5.6 mm (1.5 mm wall = 0.60T) + add 4x 1.25 mm gussets. 2. Increase exterior draft from 0.5° to 2.5° minimum on VDI 27 surfaces.',
      },
      firstPrinciplesAxioms:
        'Volumetric thermal contraction during polymer solidification (ΔV = V_0 · α_v · ΔT + ΔV_crystallization) governs local sink and differential warpage; Fourier cooling time scales with the square of maximum section thickness (t_cool ∝ s_max²).',
    },
    weakPromptBaseline:
      'Review my injection molded part ({{part_description}} made of {{resin_or_alloy}} with {{wall_and_features}}) for DFM issues.',
    failureModesPrevented: [
      {
        aspect: 'Texture-Adjusted Draft Angle Calculation',
        weakFailureMode: 'Approves 0.5° or 1.0° draft without realizing VDI/SPI surface texture locks the part into the cavity, causing scrape/drag defects.',
        engineeredFix: 'Computes exact draft angle requirements tied to VDI/SPI texture depth and glass-fill abrasiveness.',
      },
      {
        aspect: 'Cycle Time & Sink Mark Physics',
        weakFailureMode: 'Misses that a 4.8 mm thick ear on a 2.5 mm part quadruples local cooling time (t ∝ s²) and guarantees internal voids.',
        engineeredFix: 'Calculates exact rib/boss wall ratios (0.5–0.6T) and prescribes uniform coring geometry.',
      },
    ],
  },

  // 5. PRODUCT & DFM: DFMEA (Design Failure Mode and Effects Analysis)
  {
    id: 'prod-dfmea-matrix',
    title: 'Design FMEA (DFMEA) — Function, Failure Cascade & Action Priority',
    discipline: 'PRODUCT_DFM',
    disciplineLabel: 'Product & DFM Engineering',
    shortSummary: 'Generate AIAG-VDA compliant DFMEA rows linking Parameter Diagrams (P-Diagram) to Prevention & Detection controls.',
    engineeringGoal: 'Systematically uncover latent hardware failure modes, noise factors, and design verification gaps.',
    recommendedFramework: 'RISEN',
    defaultUnitSystem: 'SI',
    defaultConstraints: ['std-aiag-vda-fmea', 'bound-explicit-assumptions', 'schema-verification-gate'],
    variables: [
      {
        key: 'subsystem_under_analysis',
        label: 'Subsystem / Assembly Scope',
        placeholder: 'e.g., Planetary gearhead & rotary shaft seal assembly',
        defaultValue: 'Brushless DC (BLDC) surgical handpiece planetary gearhead and autoclave dynamic shaft seal subsystem',
        presets: [
          'Brushless DC (BLDC) surgical handpiece planetary gearhead and autoclave dynamic shaft seal subsystem',
          'High-pressure hydrogen pressure regulator diaphragm and poppet valve seat',
          'Automated guided vehicle (AGV) spring-applied electromagnetic safety brake',
        ],
      },
      {
        key: 'primary_functions',
        label: 'Required Quantified Engineering Functions',
        placeholder: 'e.g., Transmit 4.5 N·m torque at 12,000 RPM while surviving 500 steam sterilization cycles',
        defaultValue: 'Transmit 3.2 N·m continuous torque at 15,000 RPM with <62 dBA acoustic noise while maintaining hermetic seal across 500× steam autoclave cycles (134°C, 3 bar)',
        presets: [
          'Transmit 3.2 N·m continuous torque at 15,000 RPM with <62 dBA acoustic noise while maintaining hermetic seal across 500× steam autoclave cycles (134°C, 3 bar)',
          'Regulate outlet pressure to 8.5 ±0.2 bar from 350 bar supply across -40°C to +85°C with zero external leakage',
        ],
      },
      {
        key: 'noise_factors',
        label: 'P-Diagram Noise Factors (Environment, Wear, Manufacturing)',
        placeholder: 'e.g., Steam thermal cycling, alkaline wash chemicals, shaft runout',
        defaultValue: 'Thermal shock (20°C to 134°C), caustic enzymatic detergent pH 10.5, shaft radial runout up to 0.04 mm, grease washout/oxidation',
        presets: [
          'Thermal shock (20°C to 134°C), caustic enzymatic detergent pH 10.5, shaft radial runout up to 0.04 mm, grease washout/oxidation',
          'Particulate contamination (>15 μm), harmonic vibration (10–2000 Hz), piece-to-piece spring stiffness variation (±8%)',
        ],
      },
    ],
    canonical: {
      roleAndDomain:
        'Act as a Principal Reliability & Quality Systems Engineer certified in the AIAG & VDA FMEA 7-Step methodology and Hardware Reliability Physics (Physics of Failure).',
      systemContext:
        'Subsystem under DFMEA evaluation: {{subsystem_under_analysis}}. Quantified primary engineering functions: {{primary_functions}}. P-Diagram noise factors: {{noise_factors}}.',
      primaryObjective:
        'Construct a rigorous AIAG-VDA Design FMEA (DFMEA) covering Parameter Diagram (P-Diagram) boundary mapping, physics-of-failure causal chains (Failure Effect ← Failure Mode ← Failure Cause), Prevention vs. Detection separation, and Action Priority (AP) mitigation plans.',
      analyticalSteps: [
        '1. Function & Failure Net Mapping: Decompose {{primary_functions}} into measurable functional requirements and derive the 4 canonical failure mode archetypes (Loss of Function, Degraded/Partial Function, Intermittent Function, Unintended Function).',
        '2. Physics-of-Failure Causal Chain: For each failure mode, trace the exact physical/mechanistic root cause (e.g., PTFE lip creep relaxation, Hertzian contact spalling, galvanic fretting) triggered by {{noise_factors}}.',
        '3. Prevention (PC) vs. Detection (DC) Control Audit: Strictly separate Prevention Controls (tolerancing, material selection, derating calculations done during design) from Detection Controls (FEA, DVT life testing, burst testing).',
        '4. S-O-D Scoring & Action Priority (AP): Score Severity (1–10), Occurrence (1–10), and Detection (1–10), classify Action Priority (High / Medium / Low), and prescribe concrete CAD/specification changes that reduce Occurrence (O) or improve Detection (D).',
      ],
      technicalStyleAndTone:
        'Precise reliability engineering syntax: Failure Modes must be physical/measurable deviations from function, and Failure Causes must be specific design deficiencies or physical degradation mechanisms (never vague labels like "part fails" or "operator error").',
      targetAudience:
        'Systems Engineering, Reliability & Test (DVT/PVT), and Regulatory/Quality Compliance Auditors.',
      narrowingAndBounds:
        'Do not confuse Prevention Controls with Detection Controls (a test is NEVER a prevention control). Do not propose reducing Severity (S) unless the fundamental system architecture or physical hazard is eliminated.',
      responseSchema:
        'Render: (1) P-Diagram Summary (Inputs, Control Factors, Noise Factors, Error States), (2) Complete AIAG-VDA DFMEA Markdown Table (Item/Function, Failure Mode, Effect, S, Physical Cause, Prevention Control, O, Detection Control, D, AP, Recommended Design Action), and (3) Top 3 DVT Accelerated Life Test Protocols.',
      fewShotExample: {
        sampleInput: 'Function: Maintain radial rotary shaft seal at 3 bar steam pressure.',
        sampleReasoning: 'Mode: Seal leakage > 0.5 sccm. Effect: Moisture ingress shorts stator winding (S=8). Cause: Compression set of FKM elastomer lip after 200 cycles at 134°C due to excessive interference.',
        sampleOutput: 'PC: Glass-filled PTFE spring-energized lip seal spec + groove gland fill calculation (75% max). O=3. DC: 500-cycle autoclave thermal-pressure endurance bench test per ISO 17665. D=2. AP=Low.',
      },
      firstPrinciplesAxioms:
        'AIAG-VDA Chain of Failure: System Level Effect (Severity S) ← Focus Element Failure Mode ← Component Design Parameter / Physics of Failure Cause (Occurrence O).',
    },
    weakPromptBaseline:
      'Create a DFMEA table for {{subsystem_under_analysis}} with functions {{primary_functions}}.',
    failureModesPrevented: [
      {
        aspect: 'Conflating Prevention vs. Detection Controls',
        weakFailureMode: 'Lists "Run FEA" or "Prototype Testing" under Prevention Controls, invalidating Occurrence (O) ratings during quality audits.',
        engineeredFix: 'Enforces strict separation: Design rules/calculations = Prevention; Simulations/Tests = Detection.',
      },
      {
        aspect: 'Vague Non-Physical Failure Causes',
        weakFailureMode: 'Writes generic causes like "Material failure" or "Bad manufacturing" in a Design FMEA.',
        engineeredFix: 'Requires specific design parameter deficiencies and physical degradation mechanisms tied to P-Diagram noise factors.',
      },
    ],
  },

  // 6. PRODUCT & DFM: Material Selection & Trade-Off Matrix (Ashby Methodology)
  {
    id: 'prod-ashby-material',
    title: 'Ashby Performance Index Material Selection & Trade-Off Matrix',
    discipline: 'PRODUCT_DFM',
    disciplineLabel: 'Product & DFM Engineering',
    shortSummary: 'Derive Ashby material performance indices (e.g., E^(1/2)/ρ, σ_y/ρ) and evaluate cost, corrosion, and manufacturability.',
    engineeringGoal: 'Select the optimal engineering material family and grade using objective functional constraints and performance indices.',
    recommendedFramework: 'CO-STAR',
    defaultUnitSystem: 'SI',
    defaultConstraints: ['std-astm-mat', 'rigor-symbolic-first', 'schema-tradeoff-matrix'],
    variables: [
      {
        key: 'structural_element',
        label: 'Component Function & Loading Geometry',
        placeholder: 'e.g., Light-weight precision metrological bridge beam in bending',
        defaultValue: 'High-speed robotic pick-and-place cantilever arm (length L = 650 mm, free variables: cross-sectional wall thickness) loaded in cyclic bending',
        presets: [
          'High-speed robotic pick-and-place cantilever arm (length L = 650 mm, free variables: cross-sectional wall thickness) loaded in cyclic bending',
          'Cryogenic liquid nitrogen valve body requiring low thermal conductivity and high fracture toughness at 77 K',
          'Subsea ROV pressure housing cylinder resisting external hydrostatic buckling at 3,000 m depth',
        ],
      },
      {
        key: 'hard_screening_constraints',
        label: 'Non-Negotiable Screening Constraints',
        placeholder: 'e.g., Max deflection <= 0.08 mm, K_IC >= 20 MPa·m^0.5, RoHS',
        defaultValue: 'Tip deflection δ ≤ 0.12 mm under 80 N payload, Fracture Toughness K_IC ≥ 18 MPa·√m, Operating temp -10°C to +70°C, CNC machinable or pultruded/molded',
        presets: [
          'Tip deflection δ ≤ 0.12 mm under 80 N payload, Fracture Toughness K_IC ≥ 18 MPa·√m, Operating temp -10°C to +70°C, CNC machinable or pultruded/molded',
          'Zero galvanic corrosion in 3.5% NaCl seawater, Yield strength ≥ 500 MPa, Weldable without post-weld solution annealing',
        ],
      },
      {
        key: 'optimization_objective',
        label: 'Primary Optimization Objective',
        placeholder: 'e.g., Minimize mass while maximizing natural frequency f_1',
        defaultValue: 'Minimize structural mass (m) and rotational inertia while maximizing first natural bending frequency (f_1) at a target production volume of 2,500 units/year',
        presets: [
          'Minimize structural mass (m) and rotational inertia while maximizing first natural bending frequency (f_1) at a target production volume of 2,500 units/year',
          'Minimize total landed part cost ($/part) for a stiffness-limited flat plate in bending at 100,000 units/year',
        ],
      },
    ],
    canonical: {
      roleAndDomain:
        'Act as a Principal Materials & Mechanical Systems Engineer trained in Prof. Mike Ashby’s Rational Material Selection methodology.',
      systemContext:
        'We are selecting candidate materials for: {{structural_element}}. Hard screening constraints: {{hard_screening_constraints}}. Objective function: {{optimization_objective}}.',
      primaryObjective:
        'Translate the design requirements into Function, Constraints, Objective, and Free Variables; derive the governing Ashby Material Performance Index (M); screen and rank 5 distinct candidate material grades with exact property ranges; and evaluate secondary manufacturing and environmental risks.',
      analyticalSteps: [
        '1. Ashby Problem Translation: Explicitly state Function, Geometric Constraints, Functional Constraints ({{hard_screening_constraints}}), Objective ({{optimization_objective}}), and the Free Geometric Variable.',
        '2. Performance Index (M) Derivation: Combine the objective equation (e.g., mass m = A·L·ρ) with the constraint equation (e.g., beam bending stiffness S = C·E·I / L³) to eliminate the free variable and isolate the pure material index M (e.g., M_1 = E^(1/2)/ρ or M_2 = σ_f^(2/3)/ρ).',
        '3. Quantitative Candidate Ranking: Evaluate 5 specific, standard-designated engineering grades (spanning metals, composites, or technical polymers/ceramics) showing E, σ_y, ρ, K_IC, thermal expansion α, relative cost, and calculated M index.',
        '4. Manufacturing & Joining Down-Selection: Analyze machinability/forming route, fastener/adhesive joining compatibility, galvanic corrosion pairing, and supply chain lead time.',
      ],
      technicalStyleAndTone:
        'Quantitative materials science rigor using explicit property units (GPa, MPa, Mg/m³, MPa·√m, 10⁻⁶/K) and symbolic index derivations.',
      targetAudience:
        'Chief Mechanical Engineer, Materials & Process (M&P) Group, and Supply Chain Sourcing.',
      narrowingAndBounds:
        'Never compare vague material classes like "Steel vs. Aluminum vs. Plastic". Always specify exact grades and conditions (e.g., 6061-T6 vs. 7075-T6 vs. Ti-6Al-4V vs. Toray T700 Quasi-Isotropic CFRP).',
      responseSchema:
        'Deliver: (1) Ashby Translation & Symbolic Index (M) Derivation, (2) 5-Candidate Quantitative Property & M-Index Table, (3) Weighted Pugh Trade-Off Matrix, and (4) Final Primary + Backup Material Specification.',
      fewShotExample: {
        sampleInput: 'Light tie-rod in uniaxial tension (Length L specified, cross-sectional area A free, stiffness K = A·E/L constrained).',
        sampleReasoning: 'Mass m = A·L·ρ. Substitute A = K·L/E → m = K·L²·(ρ/E). To minimize m, maximize M = E / ρ.',
        sampleOutput: 'Ashby Stiffness-Limited Tie Index: M = E / ρ [GPa / (Mg/m³)]. Aluminum 6061-T6: 69 / 2.70 = 25.6; CFRP Unidirectional: 140 / 1.55 = 90.3.',
      },
      firstPrinciplesAxioms:
        'Performance P = f_1(Geometric Parameters F) · f_2(Functional Requirements G) · f_3(Material Properties M). Separability allows ranking materials by f_3(M) independent of scale.',
    },
    weakPromptBaseline:
      'What is the best material to use for {{structural_element}} given {{hard_screening_constraints}} and {{optimization_objective}}?',
    failureModesPrevented: [
      {
        aspect: 'Using E/ρ Instead of E^(1/2)/ρ or E^(1/3)/ρ for Bending',
        weakFailureMode: 'LLMs casually compare specific modulus (E/ρ) for beams or plates in bending, missing the exponent dictated by section moment of inertia I.',
        engineeredFix: 'Forces symbolic elimination of the free cross-sectional variable to derive the exact exponent for the loading mode.',
      },
    ],
  },

  // 7. MANUFACTURING & QUALITY: 8D / 5-Why Root Cause Failure Investigation
  {
    id: 'mfg-8d-root-cause',
    title: '8D Corrective Action & Physics-Guided 5-Why Root Cause Investigation',
    discipline: 'MANUFACTURING',
    disciplineLabel: 'Manufacturing & Quality',
    shortSummary: 'Structure an IATF 16949 / ISO 9001 8D investigation with Is/Is-Not boundary matrix, Occurrence vs. Escape paths, and Poka-Yoke.',
    engineeringGoal: 'Isolate verifiable physical and systemic root causes of a production or field defect and define permanent corrective actions.',
    recommendedFramework: 'RISEN',
    defaultUnitSystem: 'SI',
    defaultConstraints: ['std-aiag-vda-fmea', 'bound-missing-data-guard', 'schema-verification-gate'],
    variables: [
      {
        key: 'defect_symptom',
        label: 'Observed Defect / Field Failure Symptom',
        placeholder: 'e.g., Circumferential cracking on laser-welded sensor diaphragm at 4.2% reject rate',
        defaultValue: 'Intermittent helium leak (>1×10⁻⁶ mbar·L/s) at the perimeter fiber-laser weld seam of a 304L stainless steel pressure transducer housing (3.8% EOL reject rate on Shift 2)',
        presets: [
          'Intermittent helium leak (>1×10⁻⁶ mbar·L/s) at the perimeter fiber-laser weld seam of a 304L stainless steel pressure transducer housing (3.8% EOL reject rate on Shift 2)',
          'Premature thread galling and torque spike during automated M6 stainless fastener rundown on assembly station #4',
          'Delamination of conformal coating over QFN solder joints after 48-hour 85°C/85% RH damp heat screening',
        ],
      },
      {
        key: 'process_observations',
        label: 'Known Process Data & Shop-Floor Clues',
        placeholder: 'e.g., Started after Lot #402 raw stock change; micro-section shows solidification pores',
        defaultValue: 'Started after switching upstream stamping vendor degreasing solvent; metallographic cross-section at 200× reveals root keyhole porosity and sulfur/hydrocarbon inclusions at weld start/stop overlap',
        presets: [
          'Started after switching upstream stamping vendor degreasing solvent; metallographic cross-section at 200× reveals root keyhole porosity and sulfur/hydrocarbon inclusions at weld start/stop overlap',
          'Occurs only on cavities 3 and 7 of the 8-cavity hot-runner mold when ambient shop humidity exceeds 65%',
        ],
      },
      {
        key: 'containment_scope',
        label: 'Production Volume & Suspect Inventory Scope',
        placeholder: 'e.g., 14,500 units in WIP + 2 customer shipments in transit',
        defaultValue: '8,400 units in WIP warehouse, 1,200 units per day active line rate, 3 lots currently at Tier-1 customer dock',
        presets: [
          '8,400 units in WIP warehouse, 1,200 units per day active line rate, 3 lots currently at Tier-1 customer dock',
          'Safety-critical medical device lot recall assessment (Lot #26-08A through #26-11C)',
        ],
      },
    ],
    canonical: {
      roleAndDomain:
        'Act as a Master Black Belt Quality Engineer and Manufacturing Process Metallurgist leading an IATF 16949 / ISO 9001 8-Disciplines (8D) Root Cause Investigation.',
      systemContext:
        'Problem Statement: {{defect_symptom}}. Known shop-floor and lab observations: {{process_observations}}. Suspect inventory and line exposure: {{containment_scope}}.',
      primaryObjective:
        'Develop a complete D1–D8 engineering investigation playbook including a Kepner-Tregoe Is / Is-Not boundary table, an Ishikawa (6M) hypothesis matrix with empirical verification tests, dual 5-Why chains (Occurrence vs. Escape), and hardware Poka-Yoke Permanent Corrective Actions (PCA).',
      analyticalSteps: [
        '1. D2 Problem Definition & Kepner-Tregoe Is / Is-Not Table: Bound the exact object, defect, location on part, timing, and lot trend (What, Where, When, Extent — Is vs. Is Not) to rule out ungrounded theories.',
        '2. D3 Interim Containment Action (ICA): Define immediate 100% screening/sorting protocol for {{containment_scope}}, including gage repeatability (MSA/GR&R) validation of the sorting method.',
        '3. D4 Physics-Guided Root Cause & Dual 5-Why: Construct separate 5-Why chains for (a) Technical Occurrence Root Cause (why the physical defect mechanism formed) and (b) Detection/Escape Root Cause (why upstream process controls failed to catch it), plus a verification test plan to reproduce the defect on/off at will ("Turn the problem on and off").',
        '4. D5–D7 Permanent Corrective Action (PCA) & Systemic Prevention: Specify hardware/parameter Poka-Yoke controls (not "retrain operator"), update Control Plan / PFMEA, and list read-across (Yokoten) lines.',
      ],
      technicalStyleAndTone:
        'Empirical, evidence-driven manufacturing quality engineering style. Never accept human error or "operator training" as a terminal root cause.',
      targetAudience:
        'Plant Quality Director, Customer SQE (Supplier Quality Engineer), and Manufacturing Process Engineering Team.',
      narrowingAndBounds:
        'Strictly prohibit listing "Retrain operator" or "Update SOP awareness" as the primary D5 Permanent Corrective Action. Every root cause hypothesis must have a falsifiable physical or statistical verification test.',
      responseSchema:
        'Output: (1) D2 Kepner-Tregoe Is / Is-Not Matrix, (2) D3 Containment & Lot Disposition Plan, (3) D4 Dual 5-Why Chains (Occurrence + Escape) & "Turn On/Off" Verification Experiment, and (4) D5–D7 Poka-Yoke PCA & Control Plan Update Table.',
      fewShotExample: {
        sampleInput: 'Why 1: Weld seam leaked helium → Why 2: Keyhole porosity at overlap.',
        sampleReasoning: 'Trace physical mechanism: Hydrocarbon residue vaporizes during laser ramp-down, gets trapped as keyhole collapses faster than gas escapes.',
        sampleOutput: 'Why 3: Laser power ramp-down slope is 15 ms (too steep) while residual stamping oil film > 2 mg/m² volatilizes. Verification Test: Clean 30 parts via plasma vs. baseline solvent and compare X-ray pore count (p < 0.01).',
      },
      firstPrinciplesAxioms:
        'True Root Cause Reversibility Axiom: A factor X is verified as the physical root cause if and only if introducing X reliably induces the defect and removing X eliminates the defect under controlled process conditions.',
    },
    weakPromptBaseline:
      'Write an 8D report and 5 Whys for {{defect_symptom}} given {{process_observations}}.',
    failureModesPrevented: [
      {
        aspect: 'Stopping at "Operator Error" or "Retrain Staff"',
        weakFailureMode: 'Standard LLM 8D outputs routinely blame operator attentiveness and suggest retraining, which fails every automotive/medical SQE audit.',
        engineeredFix: 'Explicitly bans operator retraining as a primary PCA and mandates hardware/parameter Poka-Yoke + "Turn Problem On/Off" empirical proof.',
      },
      {
        aspect: 'Missing the Escape Root Cause Chain',
        weakFailureMode: 'Only asks why the part broke, ignoring why the in-line station or incoming QC failed to detect the shift.',
        engineeredFix: 'Enforces Dual 5-Why chains: Occurrence Pathway + Escape/Detection Pathway.',
      },
    ],
  },

  // 8. MANUFACTURING & QUALITY: CNC Machining Strategy, Feeds/Speeds & Fixture Design
  {
    id: 'mfg-cnc-machining',
    title: 'CNC Process Plan, Workholding Datum Strategy & Chatter/Deflection Control',
    discipline: 'MANUFACTURING',
    disciplineLabel: 'Manufacturing & Quality',
    shortSummary: 'Design multi-op CNC setup sequences, 3-2-1 kinematic workholding, cutting parameters, and thin-wall distortion mitigation.',
    engineeringGoal: 'Establish a repeatable CNC manufacturing routing and tooling strategy that holds tight tolerances without part distortion.',
    recommendedFramework: 'RISEN',
    defaultUnitSystem: 'SI',
    defaultConstraints: ['std-asme-y145', 'std-iso-gps', 'bound-explicit-assumptions', 'schema-verification-gate'],
    variables: [
      {
        key: 'workpiece_spec',
        label: 'Workpiece Geometry & Raw Stock',
        placeholder: 'e.g., Thin-walled monolithic aerospace rib from 50mm 7050-T7451 plate (88% material removal)',
        defaultValue: 'Monolithic optical instrument chassis (220 × 140 × 38 mm) machined from wrought 6061-T651 bar stock with 1.5 mm thin internal pocket walls and 85% material removal rate',
        presets: [
          'Monolithic optical instrument chassis (220 × 140 × 38 mm) machined from wrought 6061-T651 bar stock with 1.5 mm thin internal pocket walls and 85% material removal rate',
          'Inconel 718 turbine seal ring (OD 180 mm, wall 2.2 mm) turned and 5-axis milled',
          '17-4 PH H900 stainless steel hydraulic manifold block with intersecting deep cross-drilled ports',
        ],
      },
      {
        key: 'ctq_tolerances',
        label: 'Critical-to-Quality (CTQ)GD&T Callouts',
        placeholder: 'e.g., Flatness 0.015 mm on Datum A, Bore H7 (+0.021/-0.000), True Position 0.025 mm',
        defaultValue: 'Datum A mounting face flatness 0.012 mm; 2× Ø22H6 bearing bores coaxial within ⌖ Ø0.018 mm|A|B|C; surface finish Ra ≤ 0.8 μm on sealing lands',
        presets: [
          'Datum A mounting face flatness 0.012 mm; 2× Ø22H6 bearing bores coaxial within ⌖ Ø0.018 mm|A|B|C; surface finish Ra ≤ 0.8 μm on sealing lands',
          'Profile of a surface 0.025 mm across thin 1.5 mm floor webs',
        ],
      },
      {
        key: 'machine_capability',
        label: 'Available Machine Tool & Spindle Envelope',
        placeholder: 'e.g., 4-axis horizontal machining center, 15,000 RPM HSK-A63, 70 bar TSC',
        defaultValue: '5-Axis Vertical Machining Center (18,000 RPM HSK-A63 spindle, 40 bar through-spindle coolant, Renishaw spindle probe)',
        presets: [
          '5-Axis Vertical Machining Center (18,000 RPM HSK-A63 spindle, 40 bar through-spindle coolant, Renishaw spindle probe)',
          '3-Axis CNC Mill (10,000 RPM CAT40) + Twin-Spindle Live-Tooling CNC Lathe',
        ],
      },
    ],
    canonical: {
      roleAndDomain:
        'Act as a Principal CNC Manufacturing Engineer & Precision Fixture Designer specializing in high-efficiency milling (HEM), residual stress distortion control, and on-machine probing.',
      systemContext:
        'We are developing the CNC manufacturing process plan for: {{workpiece_spec}}. Critical GD&T features to hold: {{ctq_tolerances}}. Machine resource: {{machine_capability}}.',
      primaryObjective:
        'Create a step-by-step Op-by-Op CNC routing (Op 10, Op 20, Stress Relief/Semi-Finish, Finish), specify 3-2-1 kinematic workholding that avoids clamping distortion, define tool geometry and cutting parameters (Vc, fz, ap, ae), and specify in-process metrology.',
      analyticalSteps: [
        '1. Datum Strategy & Residual Stress Management: Sequence roughing vs. semi-finishing operations symmetrically around the neutral axis to balance bulk residual stress release before finish-machining Datum A.',
        '2. 3-2-1 Workholding & Clamping Force Control: Design fixture locators and clamping points directly over solid support pads (never across unsupported thin pockets), specifying torque-limited clamps or vacuum/dovetail workholding to prevent spring-back after unclamping.',
        '3. Tool Selection & Cutting Parameter Table: For roughing, semi-finishing, and CTQ bore/face finishing, specify cutter diameter, flute count, helix/coating, L/D stickout ratio (target ≤ 3:1 or dampened bar), surface speed (Vc), chip load (fz), radial/axial engagement (ae/ap), and thin-wall step-down strategy ("waterline/tree-step" support).',
        '4. In-Process Probing & CMM Inspection Plan: Define closed-loop spindle probing offsets prior to finishing {{ctq_tolerances}} and specify CMM stylus/alignment verification.',
      ],
      technicalStyleAndTone:
        'Shop-floor ready CNC process engineering specification with explicit machining formulas (RPM = 1000·Vc / (π·D), Vf = RPM·z·fz, tool deflection δ ∝ F·L³/(3·E·I)).',
      targetAudience:
        'CAM Programmers, Fixture Designers, CNC Setup Machinists, and Quality Metrology Engineers.',
      narrowingAndBounds:
        'Never finish-machine a tight flatness or bore feature in the same clamping state used for heavy roughing. Account for tool cantilever deflection (L³) and thermal spindle growth.',
      responseSchema:
        'Provide: (1) Op-by-Op Routing & Datum Transfer Table, (2) Workholding & Thin-Wall Distortion Control Protocol, (3) Cutting Tool & Speeds/Feeds Parameter Schedule, and (4) In-Process Probing & CMM Verification Gate.',
      fewShotExample: {
        sampleInput: 'Finish 1.5 mm tall × 30 mm deep thin wall in 6061-T6 using Ø10 mm 3-flute carbide endmill.',
        sampleReasoning: 'Machining full 30 mm depth first strips wall stiffness. Use stepped waterline semi-finishing (5 mm axial steps, alternating sides, radial stock 0.25 mm → 0.00 mm) so the uncut lower stock supports the cut zone.',
        sampleOutput: 'Tool: Ø10 mm 3FL 45° helix ZrN carbide, L/D = 3.2. Vc = 450 m/min (14,320 RPM), fz = 0.045 mm/tooth, ae = 0.20 mm, ap = 4.5 mm stepped watermark pass.',
      },
      firstPrinciplesAxioms:
        'Cantilever tool and thin-wall deflection follow Euler-Bernoulli stiffness δ = F_r · L³ / (3·E·I); clamping distortion elastic spring-back Δx = F_clamp / k_part transfers directly into out-of-flatness upon fixture release.',
    },
    weakPromptBaseline:
      'Give me a CNC machining plan and feeds and speeds to make {{workpiece_spec}} with tolerances {{ctq_tolerances}} on a {{machine_capability}}.',
    failureModesPrevented: [
      {
        aspect: 'Clamping Spring-Back & Residual Stress Bowing',
        weakFailureMode: 'Roughs and finishes the part in a single vise clamping setup, resulting in a banana-shaped part the moment vise jaws open.',
        engineeredFix: 'Enforces symmetric roughing, clamping pressure relaxation/re-torque before finishing, and stepped thin-wall support.',
      },
    ],
  },

  // 9. MANUFACTURING & QUALITY: Process Capability (Cp/Cpk) & Gage R&R Study Plan
  {
    id: 'mfg-spc-cpk-grr',
    title: 'MSA Gage R&R & Statistical Process Control (Cp/Cpk) Validation Protocol',
    discipline: 'MANUFACTURING',
    disciplineLabel: 'Manufacturing & Quality',
    shortSummary: 'Design an AIAG MSA 4th Ed. Gage R&R study and short/long-term process capability (Cp, Cpk, Pp, Ppk) qualification plan.',
    engineeringGoal: 'Prove measurement system adequacy (%GRR < 10%) and statistical process capability (Cpk ≥ 1.33 / 1.67) for PPAP / IQ-OQ-PQ sign-off.',
    recommendedFramework: 'CO-STAR',
    defaultUnitSystem: 'SI',
    defaultConstraints: ['std-asme-y145', 'rigor-symbolic-first', 'schema-verification-gate'],
    variables: [
      {
        key: 'ctq_feature_spec',
        label: 'CTQ Feature & Tolerance Specification',
        placeholder: 'e.g., Fuel injector nozzle orifice diameter Ø0.180 ±0.004 mm',
        defaultValue: 'Precision hydraulic spool valve land diameter Ø12.000 ±0.008 mm (Total Tolerance Band T = 0.016 mm, Cylindricity 0.003 mm)',
        presets: [
          'Precision hydraulic spool valve land diameter Ø12.000 ±0.008 mm (Total Tolerance Band T = 0.016 mm, Cylindricity 0.003 mm)',
          'Laser-trimmed thick-film shunt resistor value 10.00 ±0.05 mΩ',
          'Ultrasonic weld collapse depth 0.65 ±0.06 mm on medical catheter hub',
        ],
      },
      {
        key: 'metrology_instrument',
        label: 'Proposed Measurement Instrument & Resolution',
        placeholder: 'e.g., Air gage (0.0001 mm resolution) vs. handheld micrometer (0.001 mm)',
        defaultValue: 'Optical shadowgraph / laser micrometer with 0.0002 mm (0.2 μm) digital resolution and automated V-block staging fixture',
        presets: [
          'Optical shadowgraph / laser micrometer with 0.0002 mm (0.2 μm) digital resolution and automated V-block staging fixture',
          'Tactile bridge CMM with Ø1.5 mm ruby stylus (MPE_E = 1.8 + L/300 μm)',
        ],
      },
      {
        key: 'qualification_target',
        label: 'Target Capability & PPAP / Validation Gate',
        placeholder: 'e.g., %GRR <= 10%, ndc >= 5, Cpk >= 1.67 across 300-piece run',
        defaultValue: 'AIAG PPAP Level 3: %GRR (Tolerance) ≤ 10%, Number of Distinct Categories (ndc) ≥ 5, Short-term Cpk ≥ 1.67, Long-term Ppk ≥ 1.33 across 125-sample (25 subgroups × 5) run',
        presets: [
          'AIAG PPAP Level 3: %GRR (Tolerance) ≤ 10%, Number of Distinct Categories (ndc) ≥ 5, Short-term Cpk ≥ 1.67, Long-term Ppk ≥ 1.33 across 125-sample (25 subgroups × 5) run',
          'Medical ISO 13485 OQ/PQ validation at 95% confidence / 99% reliability tolerance intervals',
        ],
      },
    ],
    canonical: {
      roleAndDomain:
        'Act as a Principal Metrology & Statistical Quality Control (SQC) Engineer specializing in AIAG MSA (4th Edition) and SPC (2nd Edition).',
      systemContext:
        'We are qualifying the measurement system and production process for: {{ctq_feature_spec}} measured via {{metrology_instrument}}. Target acceptance gate: {{qualification_target}}.',
      primaryObjective:
        'Design a complete Measurement System Analysis (Bias, Linearity, 10×3×3 Crossed ANOVA Gage R&R) and Process Capability qualification protocol, including exact statistical formulas, normality/independence checks, and diagnostic actions if %GRR or Cpk fails.',
      analyticalSteps: [
        '1. 10-to-1 Resolution & Calibration Pre-Check: Audit instrument discrimination ratio against the total tolerance band T (requiring resolution ≤ T/10, ideally ≤ T/20) and define master ring/block bias verification.',
        '2. Crossed ANOVA Gage R&R Experimental Design: Specify part selection strategy (10 parts spanning the actual process variation range, 3 operators, 3 randomized blind trials = 90 readings) and decompose total variance into Repeatability (EV), Reproducibility (AV + Operator×Part interaction), and Part-to-Part (PV).',
        '3. SPC Subgroup Sampling & Normality Verification: Define rational subgrouping (25 subgroups of n = 5 consecutive pieces across tool wear/shift changes), Anderson-Darling normality test (p > 0.05), X-bar & R control chart stability rules, and within-subgroup (σ_within = R̄/d2) vs. overall (σ_overall) standard deviation.',
        '4. Diagnostic Decision Tree: Provide exact mathematical and physical troubleshooting steps if EV > AV (fixture/instrument clamping issue), AV > EV (operator procedure/staging issue), or Cp >> Cpk (mean centering offset vs. excessive spread).',
      ],
      technicalStyleAndTone:
        'Rigorous statistical metrology specification with exact AIAG formulas and variance decomposition.',
      targetAudience:
        'Quality Engineering, Metrology Lab Technicians, and Customer PPAP Sign-Off Reviewers.',
      narrowingAndBounds:
        'Never compute Cpk before verifying two prerequisites: (1) Gage R&R is acceptable, and (2) the process is in statistical control on X-bar/R charts and follows a known distribution.',
      responseSchema:
        'Deliver: (1) Resolution & Gage R&R ANOVA Protocol Table, (2) Statistical Equations & Acceptance Matrix (%EV, %AV, %GRR, ndc, Cp, Cpk, Pp, Ppk), and (3) Failure Diagnostic & Centering Action Playbook.',
      fewShotExample: {
        sampleInput: 'Tolerance T = 0.016 mm (±0.008 mm), USL = 12.008, LSL = 11.992, Mean μ = 12.002 mm, σ_within = 0.0012 mm.',
        sampleReasoning: 'Cp = (USL - LSL)/(6·σ) = 0.016 / 0.0072 = 2.22. CPU = (12.008 - 12.002)/(3·0.0012) = 1.67. CPL = (12.002 - 11.992)/(3·0.0012) = 2.78. Cpk = min(CPU, CPL) = 1.67.',
        sampleOutput: 'Cp = 2.22, Cpk = 1.67 (Passes ≥1.67 gate, though tool wear offset of +0.002 mm from nominal 12.000 mm consumes 25% of upper margin; adjust CNC wear offset by -0.002 mm).',
      },
      firstPrinciplesAxioms:
        'Observed Variance Additivity: σ²_observed = σ²_true_process + σ²_measurement_system, where σ²_measurement = σ²_repeatability(equipment) + σ²_reproducibility(appraiser).',
    },
    weakPromptBaseline:
      'How do I run a Gage R&R and Cpk study for {{ctq_feature_spec}} using {{metrology_instrument}} to meet {{qualification_target}}?',
    failureModesPrevented: [
      {
        aspect: 'Computing Cpk on an Unstable or Uncalibrated Process',
        weakFailureMode: 'Plugs 30 random measurements into a standard deviation formula without checking Gage R&R variance inflation or X-bar/R time-series stability.',
        engineeredFix: 'Enforces the strict sequence: Resolution (10:1) → ANOVA Gage R&R → Control Chart Stability → Normality → Within vs. Overall Capability (Cpk vs. Ppk).',
      },
    ],
  },

  // 10. PROCESS ENGINEERING: Mass & Energy Balance + Heat/Reaction Process Audit
  {
    id: 'proc-mass-energy-balance',
    title: 'Process Mass & Energy Balance, Control Volume & Pinch/Thermal Audit',
    discipline: 'PROCESS',
    disciplineLabel: 'Process & Chemical Engineering',
    shortSummary: 'Formulate steady/transient species mass balances, enthalpy budgets, recycle purge ratios, and pump/HX sizing.',
    engineeringGoal: 'Verify conservation of mass and energy across unit operations and identify process bottlenecks or thermodynamic violations.',
    recommendedFramework: 'FIRST_PRINCIPLES',
    defaultUnitSystem: 'SI',
    defaultConstraints: ['std-asme-bpvc', 'rigor-symbolic-first', 'rigor-dimensional-check', 'bound-explicit-assumptions'],
    variables: [
      {
        key: 'unit_operation',
        label: 'Unit Operation / Process Flowsheet Scope',
        placeholder: 'e.g., Continuous jacketed CSTR reactor + downstream shell-and-tube condenser',
        defaultValue: 'Continuous solvent recovery distillation column overhead condenser and reflux drum handling 4,500 kg/hr of Acetone-Water vapor mixture (82 wt% Acetone)',
        presets: [
          'Continuous solvent recovery distillation column overhead condenser and reflux drum handling 4,500 kg/hr of Acetone-Water vapor mixture (82 wt% Acetone)',
          'Exothermic jacketed CSTR polymerization reactor (V = 8.0 m³, ΔH_rxn = -145 kJ/mol) with chilled glycol cooling loop',
          'Rotary drum industrial drying kiln removing moisture from 28 wt% wet filter cake down to 1.5 wt% residual moisture',
        ],
      },
      {
        key: 'stream_conditions',
        label: 'Inlet / Outlet Stream Pressures, Temps & Compositions',
        placeholder: 'e.g., Vapor in at 68°C, 1.2 bar(a); Cooling water in at 24°C, out at 36°C',
        defaultValue: 'Vapor overhead enters at T_in = 64°C, P = 1.15 bar(a) saturated; subcooled condensate exits at 42°C; Plant cooling tower water enters at 26°C and is environmentally capped at T_cw,out ≤ 38°C',
        presets: [
          'Vapor overhead enters at T_in = 64°C, P = 1.15 bar(a) saturated; subcooled condensate exits at 42°C; Plant cooling tower water enters at 26°C and is environmentally capped at T_cw,out ≤ 38°C',
          'Feed slurry at 25°C, 2,200 kg/hr; hot air counter-current flow at 185°C, 12% RH',
        ],
      },
      {
        key: 'design_constraints',
        label: 'Fouling, Pressure Drop & Safety Margin Constraints',
        placeholder: 'e.g., ΔP_tube <= 0.5 bar, Fouling R_f = 0.00035 m²·K/W, 15% overdesign',
        defaultValue: 'Max shell-side ΔP ≤ 0.15 bar, tube-side fouling resistance R_f = 0.00035 m²·K/W, minimum temperature approach ΔT_min ≥ 10°C, 20% heat-transfer area design margin',
        presets: [
          'Max shell-side ΔP ≤ 0.15 bar, tube-side fouling resistance R_f = 0.00035 m²·K/W, minimum temperature approach ΔT_min ≥ 10°C, 20% heat-transfer area design margin',
          'Runaway adiabatic temperature rise (ΔT_ad) check + emergency relief valve sizing per API 520',
        ],
      },
    ],
    canonical: {
      roleAndDomain:
        'Act as a Principal Chemical & Process Systems Engineer specializing in thermodynamic mass/energy balances, unit operations design, and process heat integration.',
      systemContext:
        'Unit operation under study: {{unit_operation}}. Stream thermodynamic boundary conditions: {{stream_conditions}}. Process design constraints: {{design_constraints}}.',
      primaryObjective:
        'Construct a closed-boundary Control Volume (CV) mass and enthalpy balance, separate latent phase-change duty from sensible heat duty, verify Second-Law temperature cross/approach constraints (LMTD & Ft correction), and size the required utility flow rate and heat-transfer area.',
      analyticalSteps: [
        '1. Control Volume & Degrees-of-Freedom Analysis: Define system boundaries, list all species and stream variables, verify Degrees of Freedom (DOF = N_unknowns - N_independent_equations = 0), and establish overall and component mass closure (∑ṁ_in = ∑ṁ_out).',
        '2. Thermodynamic Enthalpy Budget: Separate total thermal duty Q_total into latent heat of vaporization/condensation (ṁ·ΔH_vap), heat of reaction (ξ·ΔH_rxn), and sensible heat (ṁ·Cp·ΔT), explicitly stating reference states.',
        '3. Driving Force & Fouling-Derated Sizing: Compute Log-Mean Temperature Difference (LMTD), check for temperature cross (Ft factor ≥ 0.80), incorporate tube/shell fouling resistance R_f into overall U_dirty vs. U_clean, and solve A_req = Q_total / (U_dirty · Ft · LMTD).',
        '4. Utility Flow & Hydraulic / Safety Verification: Calculate required cooling/heating utility mass flow rate ṁ_u, check velocity limits (preventing erosion > 3 m/s or sedimentation < 1 m/s in tubes), and flag abnormal operation / relief scenarios.',
      ],
      technicalStyleAndTone:
        'Rigorous chemical process engineering specification format with stream tables, explicit enthalpy reference states, and SI/process unit clarity.',
      targetAudience:
        'Process Design Engineers, Plant Operations Leads, and Front-End Engineering Design (FEED) Reviewers.',
      narrowingAndBounds:
        'Never use arithmetic mean temperature difference when terminal ΔT1/ΔT2 exceeds 1.5; always compute logarithmic mean (LMTD). Explicitly include fouling resistance R_f so clean-tube calculations do not undersize equipment in service.',
      responseSchema:
        'Deliver: (1) Stream Mass & Component Balance Table (Stream ID, Mass Flow [kg/hr], Mass Fraction, T [°C], P [bar], Phase), (2) Latent + Sensible Duty & LMTD Derivation, (3) Clean vs. Fouled Equipment Sizing Summary, and (4) Operational Bottleneck & Relief Audit.',
      fewShotExample: {
        sampleInput: 'Condense 1,000 kg/hr saturated steam at 100°C (ΔH_vap = 2,257 kJ/kg) using cooling water from 25°C to 35°C (Cp = 4.184 kJ/kg·K).',
        sampleReasoning: 'Q = 1,000 kg/hr × 2,257 kJ/kg = 2.257×10⁶ kJ/hr = 626.9 kW. ṁ_cw = Q / (Cp·ΔT) = 626.9 kW / (4.184 × 10) = 14.98 kg/s (53,940 kg/hr).',
        sampleOutput: 'Q_cond = 626.9 kW | LMTD = [(100-25) - (100-35)] / ln(75/65) = 69.88 °C | Required Cooling Water = 53.94 m³/hr.',
      },
      firstPrinciplesAxioms:
        'Conservation of Mass (∂M/∂t = ∑ṁ_in - ∑ṁ_out + R_gen = 0 at steady state); First Law Open-System Energy Balance (Q̇ - Ẇ_s = ∑ṁ_out(h + v²/2 + gz)_out - ∑ṁ_in(h + v²/2 + gz)_in); Second Law (ΔT_approach > 0 everywhere).',
    },
    weakPromptBaseline:
      'Calculate the mass and energy balance and heat exchanger size for {{unit_operation}} with {{stream_conditions}}.',
    failureModesPrevented: [
      {
        aspect: 'Omitting Latent vs. Sensible Duty Split',
        weakFailureMode: 'Applies Q = m·Cp·ΔT across a phase-change stream, under-calculating condenser thermal duty by an order of magnitude.',
        engineeredFix: 'Enforces phase-state tracking and explicit separation of latent enthalpy (ΔH_vap) from sensible subcooling/superheating.',
      },
      {
        aspect: 'Clean vs. Service Fouled U-Value',
        weakFailureMode: 'Sizes heat transfer area using textbook clean overall heat transfer coefficients, causing the unit to fail capacity within months of plant startup.',
        engineeredFix: 'Requires explicit 1/U_dirty = 1/U_clean + R_f fouling derating and Ft correction checks.',
      },
    ],
  },

  // 11. PROCESS ENGINEERING: P&ID / HAZOP Deviation & Interlock Safety Review
  {
    id: 'proc-hazop-pid',
    title: 'P&ID Control Loop & HAZOP Guideword Deviation Safety Review',
    discipline: 'PROCESS',
    disciplineLabel: 'Process & Chemical Engineering',
    shortSummary: 'Audit Piping & Instrumentation Nodes using IEC 61882 HAZOP guidewords (No/More/Less/Reverse Flow, High Pressure/Temp) and SIS interlocks.',
    engineeringGoal: 'Identify single-point control loop failures, overpressure scenarios, and Independent Protection Layers (IPLs).',
    recommendedFramework: 'RISEN',
    defaultUnitSystem: 'SI',
    defaultConstraints: ['std-asme-bpvc', 'bound-explicit-assumptions', 'schema-verification-gate'],
    variables: [
      {
        key: 'pid_node_description',
        label: 'P&ID Study Node & Equipment Boundaries',
        placeholder: 'e.g., Node 3: High-pressure nitrogen feed line into exothermic hydrotreater reactor',
        defaultValue: 'Node 2: Pressurized anhydrous ammonia liquid transfer pump (P-201A/B), flow control valve (FCV-204), and shell-side vaporizer heat exchanger (E-202)',
        presets: [
          'Node 2: Pressurized anhydrous ammonia liquid transfer pump (P-201A/B), flow control valve (FCV-204), and shell-side vaporizer heat exchanger (E-202)',
          'Node 5: Lithium-ion cathode NMP solvent recovery vacuum condenser and nitrogen blanket control loop',
          'Node 1: High-pressure steam letdown station (42 bar to 6 bar) with PRV, desuperheater spray valve, and downstream safety relief valve',
        ],
      },
      {
        key: 'design_intent_envelope',
        label: 'Normal Operating Envelope & Vessel MAWP',
        placeholder: 'e.g., Flow 15 m³/hr at 18 bar, 45°C; Vessel MAWP = 25 bar(g)',
        defaultValue: 'Design intent: Transfer 3,200 kg/hr liquid NH3 at 14.5 bar(g) and 25°C, vaporizing to superheated gas at 55°C; Vaporizer E-202 MAWP = 22.0 bar(g), Design Temp = -40°C to +120°C',
        presets: [
          'Design intent: Transfer 3,200 kg/hr liquid NH3 at 14.5 bar(g) and 25°C, vaporizing to superheated gas at 55°C; Vaporizer E-202 MAWP = 22.0 bar(g), Design Temp = -40°C to +120°C',
          'Maintain reactor headspace oxygen < 0.5 vol% O2 at +25 mbar(g) nitrogen blanket pressure',
        ],
      },
      {
        key: 'existing_instrumentation',
        label: 'Current P&ID Sensors, Valves & Relief Devices',
        placeholder: 'e.g., FT-204 tied to FCV-204 (air-to-open), PI-205 local gauge, PSV-202 set at 22 bar',
        defaultValue: 'Coriolis flow transmitter FT-204 controlling FCV-204 (Fail-Closed); Steam supply control valve TCV-202 driven by outlet TT-202; mechanical spring PSV-202 on shell set at 22.0 bar(g)',
        presets: [
          'Coriolis flow transmitter FT-204 controlling FCV-204 (Fail-Closed); Steam supply control valve TCV-202 driven by outlet TT-202; mechanical spring PSV-202 on shell set at 22.0 bar(g)',
          'Dual paramagnetic O2 analyzers (voting 1oo2) tripping emergency N2 purge solenoid valve XV-501',
        ],
      },
    ],
    canonical: {
      roleAndDomain:
        'Act as a Principal Process Safety & Functional Safety Engineer (TÜV FS Eng / IEC 61511 / IEC 61882 HAZOP Facilitator).',
      systemContext:
        'P&ID Node under review: {{pid_node_description}}. Design intent and mechanical design limits: {{design_intent_envelope}}. Existing instrumentation and safeguards: {{existing_instrumentation}}.',
      primaryObjective:
        'Conduct a structured HAZOP (Hazard and Operability) and P&ID safeguard audit across key process deviations, strictly separating Basic Process Control System (BPCS) loops from Independent Protection Layers (IPLs / SIS interlocks / mechanical relief), and verify fail-safe valve positions.',
      analyticalSteps: [
        '1. Guideword × Parameter Deviation Matrix: Systematically evaluate High Pressure, Blocked Outlet / Dead-Heading, Loss of Cooling/Heating, Reverse Flow, Tube Rupture (High-to-Low pressure interface), and Instrument/Air Failure.',
        '2. Common-Cause & Independence Audit (BPCS vs. IPL): Verify that a safeguard credited for mitigating a failure is NOT part of the same Basic Process Control System (BPCS) sensor/controller/final-element loop that initiated the deviation.',
        '3. Valve Fail-State & Blocked-In Thermal Expansion Check: Audit air-failure states (Fail-Open FO, Fail-Closed FC, Fail-Last FL) for every control/isolation valve and check for liquid lock / thermal expansion relief (TSV) on blocked-in cold liquid segments.',
        '4. Actionable P&ID Redline Recommendations: Prescribe concrete P&ID additions (e.g., independent high-pressure trip PAH/PAHH → XV shutoff, check valve placement, double block and bleed, relief valve discharge routing).',
      ],
      technicalStyleAndTone:
        'Formal IEC 61882 / LOPA process safety engineering syntax with explicit tag references and cause-consequence-safeguard precision.',
      targetAudience:
        'Process Safety Management (PSM) Review Board, Instrumentation & Controls (I&C) Engineers, and Lead Process Engineers.',
      narrowingAndBounds:
        'Never credit an operator responding to an alarm as an Independent Protection Layer (IPL) if the time-to-consequence is shorter than 10–15 minutes or if the alarm uses the same failed transmitter that caused the control loop runaway.',
      responseSchema:
        'Output: (1) Structured HAZOP Worksheet Table (Deviation, Initiating Cause, Unmitigated Consequence & MAWP Check, Credited Independent Safeguards, Risk Gap, P&ID Redline Action), (2) Valve Fail-Safe & Interlock Logic Audit, and (3) Relief & Containment Summary.',
      fewShotExample: {
        sampleInput: 'Deviation: MORE PRESSURE in E-202 shell. Cause: TT-202 fails low → TCV-202 drives steam fully open while outlet block valve is closed.',
        sampleReasoning: 'High-temperature alarm TAH-202 on TT-202 is NOT independent because TT-202 is the initiating cause! Independent protection requires separate PT-203 high-pressure trip or PSV-202 sized for full steam input.',
        sampleOutput: 'Consequence: NH3 vapor pressure exceeds 22.0 bar(g) MAWP within 90 s. Credited IPL: PSV-202 (set 22.0 bar(g), sized for blocked-in fire + full TCV-202 runaway). Action: Add independent SIL-2 pressure transmitter PT-203B tripping steam isolation valve XV-202 (Fail-Closed).',
      },
      firstPrinciplesAxioms:
        'LOPA Independence Axiom: The probability of failure on demand (PFD) of a protection layer can only multiply initiating event frequency if the sensor, logic solver, and final element share zero common-mode components with the initiating cause.',
    },
    weakPromptBaseline:
      'Do a HAZOP safety review on {{pid_node_description}} with {{existing_instrumentation}} operating at {{design_intent_envelope}}.',
    failureModesPrevented: [
      {
        aspect: 'Double-Counting Failed Transmitters as Safeguard Alarms',
        weakFailureMode: 'Credits a High Alarm on transmitter TT-202 as a safeguard when the initiating event was TT-202 failing or drifting.',
        engineeredFix: 'Enforces strict BPCS vs. Independent Protection Layer (IPL) common-cause separation per IEC 61511.',
      },
    ],
  },

  // 12. PROCESS ENGINEERING: Design of Experiments (DOE) & Process Window Optimization
  {
    id: 'proc-doe-optimization',
    title: 'Design of Experiments (DOE) — Factorial / Response Surface Process Optimization',
    discipline: 'PROCESS',
    disciplineLabel: 'Process & Chemical Engineering',
    shortSummary: 'Structure a Fractional/Full Factorial or Central Composite DOE with center points, blocking, and interaction modeling.',
    engineeringGoal: 'Map main effects, two-factor interactions (A×B), and quadratic curvature to lock in a robust manufacturing/process window.',
    recommendedFramework: 'CO-STAR',
    defaultUnitSystem: 'SI',
    defaultConstraints: ['rigor-symbolic-first', 'bound-explicit-assumptions', 'schema-verification-gate'],
    variables: [
      {
        key: 'process_and_responses',
        label: 'Target Process & Measurable Output Responses (Y)',
        placeholder: 'e.g., Ultrasonic wire bonding: Maximize pull force Y1 >= 12 gf, Minimize pad cratering Y2',
        defaultValue: 'Laser powder bed fusion (LPBF) additive manufacturing of 316L: Maximize relative part density Y1 (≥ 99.8%) and Minimize surface roughness Y2 (Ra ≤ 6.5 μm)',
        presets: [
          'Laser powder bed fusion (LPBF) additive manufacturing of 316L: Maximize relative part density Y1 (≥ 99.8%) and Minimize surface roughness Y2 (Ra ≤ 6.5 μm)',
          'Pharmaceutical tablet rotary compression: Target dissolution rate Y1 (85% in 15 min) and friability Y2 (< 0.4%)',
          'Automated reflow soldering profile: Minimize void percentage in BGA thermal pad (< 8%) and tombstoning rate',
        ],
      },
      {
        key: 'controllable_factors',
        label: 'Controllable Input Factors (X) & Low/High Ranges',
        placeholder: 'e.g., Laser Power (180–260 W), Scan Speed (600–1100 mm/s), Hatch Spacing (0.08–0.14 mm)',
        defaultValue: '4 Continuous Factors: X1 Laser Power (160–240 W), X2 Scan Speed (700–1,100 mm/s), X3 Hatch Spacing (0.08–0.12 mm), X4 Layer Thickness (0.03–0.05 mm)',
        presets: [
          '4 Continuous Factors: X1 Laser Power (160–240 W), X2 Scan Speed (700–1,100 mm/s), X3 Hatch Spacing (0.08–0.12 mm), X4 Layer Thickness (0.03–0.05 mm)',
          '3 Continuous + 1 Categorical Factor: Temperature (140–180°C), Pressure (2.0–4.5 bar), Dwell Time (1.5–3.5 s), Tool Coating (TiN vs. DLC)',
        ],
      },
      {
        key: 'experimental_budget',
        label: 'Run Budget, Batching & Nuisance Variables',
        placeholder: 'e.g., Max 24 total runs across 2 build plates; powder lot humidity varies',
        defaultValue: 'Maximum 22–28 total experimental runs across 2 separate build plates (blocking variable: build plate position / argon gas cross-flow)',
        presets: [
          'Maximum 22–28 total experimental runs across 2 separate build plates (blocking variable: build plate position / argon gas cross-flow)',
          'Screening phase budget of 12 runs followed by 6 axial augmentation runs if curvature is significant',
        ],
      },
    ],
    canonical: {
      roleAndDomain:
        'Act as a Principal Industrial Statistician & Process Development Engineer specializing in Montgomery Design of Experiments (DOE) and Response Surface Methodology (RSM).',
      systemContext:
        'Process & target responses: {{process_and_responses}}. Controllable factors and factor spaces: {{controllable_factors}}. Experimental budget and nuisance constraints: {{experimental_budget}}.',
      primaryObjective:
        'Design an orthogonal, statistically powered DOE matrix (specifying Resolution, aliasing structure, center-point replicates for pure error/curvature check, and block assignment), provide the coded (-1, 0, +1) and uncoded run table, and define the regression/ANOVA analysis protocol.',
      analyticalSteps: [
        '1. Design Selection & Aliasing Audit: Select the optimal design architecture (e.g., 2⁴ Full Factorial vs. 2⁴⁻¹ Resolution IV vs. Central Composite / Box-Behnken RSM) that fits {{experimental_budget}} without confounding main effects with two-factor interactions (2FIs).',
        '2. Center Points, Blocking & Randomization: Allocate 3–5 center points (0, 0, ..., 0) to estimate pure experimental error and test for quadratic curvature (p_curvature < 0.05), and assign orthogonal block generators to isolate {{experimental_budget}} nuisance effects.',
        '3. Coded & Engineering Run Matrix: Generate the explicit experimental run sheet showing StdOrder, Randomized RunOrder, Block, Coded levels (-1, 0, +1), and actual engineering units.',
        '4. Regression Model, Residual Diagnostics & Desirability Optimization: Specify the polynomial model equation Y = β0 + ∑βi·Xi + ∑∑βij·Xi·Xj, ANOVA lack-of-fit check, residual normality/homoscedasticity plots, and Derringer-Suich multi-response desirability window.',
      ],
      technicalStyleAndTone:
        'Rigorous industrial DOE syntax with explicit generator words (e.g., I = ABCD), resolution classes (III, IV, V), and coded variable math.',
      targetAudience:
        'Process Development Engineers, R&D Scientists, and Six Sigma Black Belts.',
      narrowingAndBounds:
        'Never recommend One-Factor-At-A-Time (OFAT) testing when two-factor interactions (e.g., Laser Power × Scan Speed volumetric energy density) govern the physics. Always code variables to [-1, +1] before evaluating effect magnitudes.',
      responseSchema:
        'Deliver: (1) Design Architecture & Aliasing / Resolution Justification, (2) Complete Coded & Uncoded DOE Run Matrix Table, (3) ANOVA Curvature & Interaction Equation Framework, and (4) Confirmation Run Protocol.',
      fewShotExample: {
        sampleInput: 'Factor X1: Laser Power [160 W to 240 W]. Convert 200 W and 240 W to coded units.',
        sampleReasoning: 'Center X0 = (160 + 240)/2 = 200 W; Half-step ΔX = (240 - 160)/2 = 40 W. Coded x1 = (X1 - 200)/40.',
        sampleOutput: 'At 200 W → x1 = 0 (Center Point). At 240 W → x1 = +1 (High Level).',
      },
      firstPrinciplesAxioms:
        'Orthogonality & Variance Minimization: In an orthogonal coded design matrix X where (XᵀX) is diagonal, parameter estimates β̂ = (XᵀX)⁻¹Xᵀy are uncorrelated and achieve minimum variance across the experimental hypercube.',
    },
    weakPromptBaseline:
      'Create a DOE test plan for {{process_and_responses}} testing {{controllable_factors}} within {{experimental_budget}}.',
    failureModesPrevented: [
      {
        aspect: 'Confounding Interactions & Skipping Center Points',
        weakFailureMode: 'Outputs an un-randomized list of trials without center-point replicates, making it impossible to detect non-linear curvature or separate pure noise from factor effects.',
        engineeredFix: 'Mandates explicit Resolution/aliasing disclosure, center-point replicates for curvature ANOVA, and orthogonal blocking.',
      },
    ],
  },

  // 13. ENGINEERING ANALYSIS: First-Principles Root-Cause & Failure Mechanics Analysis
  {
    id: 'ana-fracture-fatigue',
    title: 'Fracture Mechanics, Fatigue Life (S-N / ε-N / Paris Law) & Failure Analysis',
    discipline: 'ANALYSIS',
    disciplineLabel: 'Engineering Analysis',
    shortSummary: 'Evaluate cyclic fatigue damage (Miner’s rule, Goodman/Gerber), stress intensity factor ΔK, and crack growth life.',
    engineeringGoal: 'Quantify fatigue initiation life or damage-tolerant crack propagation cycles under spectrum loading.',
    recommendedFramework: 'FIRST_PRINCIPLES',
    defaultUnitSystem: 'SI',
    defaultConstraints: ['std-astm-mat', 'rigor-symbolic-first', 'rigor-dimensional-check', 'rigor-sensitivity'],
    variables: [
      {
        key: 'component_and_notch',
        label: 'Component Geometry, Notch Kt & Initial Flaw Size',
        placeholder: 'e.g., Stepped transmission shaft with R=1.5 mm fillet (Kt = 2.1), NDT flaw a_0 = 0.5 mm',
        defaultValue: 'Pressurized titanium actuator cylinder with radial cross-bore (elastic stress concentration Kt = 2.65, notch radius r = 1.2 mm, minimum NDT detectable surface flaw a_0 = 0.40 mm)',
        presets: [
          'Pressurized titanium actuator cylinder with radial cross-bore (elastic stress concentration Kt = 2.65, notch radius r = 1.2 mm, minimum NDT detectable surface flaw a_0 = 0.40 mm)',
          'Welded structural crane boom box-girder butt joint (IIW FAT class 80, toe radius 0.5 mm)',
          'Rotating 4340 steel wind-turbine pitch bearing bolt under combined preload mean stress and cyclic bending',
        ],
      },
      {
        key: 'cyclic_load_spectrum',
        label: 'Cyclic Stress / Load Spectrum (σ_max, σ_min, R-ratio, Frequency)',
        placeholder: 'e.g., Nominal hoop stress cycles from 40 MPa to 280 MPa at 2 Hz (300,000 target cycles)',
        defaultValue: 'Nominal far-field stress cycles between σ_min = 35 MPa and σ_max = 265 MPa (R = 0.132) at 4 Hz; required service life = 500,000 cycles',
        presets: [
          'Nominal far-field stress cycles between σ_min = 35 MPa and σ_max = 265 MPa (R = 0.132) at 4 Hz; required service life = 500,000 cycles',
          'Two-block spectrum: Block A (Δσ = 320 MPa, R = -1, n1 = 2×10⁴ cycles) + Block B (Δσ = 160 MPa, R = 0.1, n2 = 2×10⁶ cycles)',
        ],
      },
      {
        key: 'material_fatigue_props',
        label: 'Material Fracture & Fatigue Constants',
        placeholder: 'e.g., Su = 950 MPa, Sy = 880 MPa, K_IC = 65 MPa·m^0.5, Paris C and m',
        defaultValue: 'Ti-6Al-4V: Su = 950 MPa, Sy = 880 MPa, K_IC = 65 MPa·√m, threshold ΔK_th = 4.2 MPa·√m, Paris Law C = 1.5×10⁻¹¹ (m/cycle)/(MPa·√m)^m, m = 3.4',
        presets: [
          'Ti-6Al-4V: Su = 950 MPa, Sy = 880 MPa, K_IC = 65 MPa·√m, threshold ΔK_th = 4.2 MPa·√m, Paris Law C = 1.5×10⁻¹¹ (m/cycle)/(MPa·√m)^m, m = 3.4',
          'AISI 4340 Steel: Su = 1,100 MPa, Sy = 980 MPa, K_IC = 85 MPa·√m, Ra = 1.6 μm machined surface',
        ],
      },
    ],
    canonical: {
      roleAndDomain:
        'Act as a Principal Fatigue & Fracture Mechanics Analyst specializing in High-Cycle/Low-Cycle Fatigue (HCF/LCF), Neuber elastoplastic notch correction, and Linear Elastic Fracture Mechanics (LEFM).',
      systemContext:
        'Component and flaw geometry: {{component_and_notch}}. Cyclic loading spectrum: {{cyclic_load_spectrum}}. Material fracture/fatigue properties: {{material_fatigue_props}}.',
      primaryObjective:
        'Perform a dual fatigue life and damage-tolerance assessment: (1) S-N / Goodman mean-stress initiation check incorporating Marin surface/size/reliability knockdown factors and notch sensitivity q → Kf, and (2) LEFM Paris Law crack propagation integration from initial NDT flaw a_0 to critical fracture crack length a_c.',
      analyticalSteps: [
        '1. Notch Sensitivity & Local Alternating/Mean Stress: Convert elastic Kt to fatigue notch factor Kf = 1 + q(Kt - 1) using Neuber/Peterson notch sensitivity q, and compute local alternating stress σ_a and mean stress σ_m (checking for local yielding σ_max > Sy via Neuber’s rule σ·ε = Kt²·S·e).',
        '2. Marin Knockdown & Mean Stress Goodman/Walker Diagram: Calculate corrected endurance limit Se = ka·kb·kc·kd·ke·Se’, evaluate Goodman safety factor (1/n_f = σ_a/Se + σ_m/Su), and compute initiation life N_i.',
        '3. LEFM Critical Crack Size & Threshold Check: Compute stress intensity range ΔK = Y·Δσ·√(π·a), verify whether ΔK(a_0) > ΔK_th, and solve for critical fast-fracture crack depth a_c = (1/π)·[K_IC / (Y·σ_max)]².',
        '4. Paris-Erdogan Crack Growth Integration & NDT Inspection Interval: Integrate da/dN = C(ΔK)^m from a_0 to a_c in closed form, and specify the recurring Non-Destructive Testing (NDT) inspection interval (N_inspect ≤ N_p / 3).',
      ],
      technicalStyleAndTone:
        'Exact fracture mechanics and fatigue analysis notation with closed-form integration steps and explicit unit tracking (MPa·√m vs. m/cycle).',
      targetAudience:
        'Structural Integrity Leads, Damage Tolerance Certifiers, and Failure Analysis Metallurgists.',
      narrowingAndBounds:
        'Never apply nominal stress directly into Goodman equations without Kf notch concentration or Marin surface/reliability factors. Explicitly verify small-scale yielding validity (plastic zone r_p << a) before using LEFM.',
      responseSchema:
        'Provide: (1) Local Notch Stress & Marin Endurance Table, (2) Goodman Mean-Stress Margin & Initiation Life, (3) LEFM Critical Flaw Size (a_c) & Paris Law Propagation Life (N_p) Derivation, and (4) NDT Inspection & Shot-Peening/Cold-Expansion Mitigation Plan.',
      fewShotExample: {
        sampleInput: 'Y = 1.12, σ_max = 300 MPa, K_IC = 65 MPa·√m, a_0 = 0.5 mm.',
        sampleReasoning: 'Critical crack length a_c = (1/π)·(K_IC / (Y·σ_max))² = (1/3.1416)·(65 / (1.12 × 300))² = 0.01192 m = 11.92 mm.',
        sampleOutput: 'Initial K_max(a_0) = 1.12 × 300 × √(π × 0.0005) = 13.31 MPa·√m (< K_IC). Critical crack depth a_c = 11.92 mm.',
      },
      firstPrinciplesAxioms:
        'Irwin Stress Intensity K = Y·σ·√(π·a); Paris-Erdogan Subcritical Crack Growth da/dN = C(ΔK)^m; Palmgren-Miner Linear Cumulative Damage D = ∑(n_i / N_fi) ≥ 1.0.',
    },
    weakPromptBaseline:
      'Calculate the fatigue life and crack growth for {{component_and_notch}} under {{cyclic_load_spectrum}} made of {{material_fatigue_props}}.',
    failureModesPrevented: [
      {
        aspect: 'Paris Law Exponent Unit Mismatch',
        weakFailureMode: 'Integrates da/dN = C(ΔK)^m using crack length a in millimeters while C is given in meters/cycle, producing a life error of 10³ to 10⁶.',
        engineeredFix: 'Enforces strict SI conversion (a in meters, ΔK in MPa·√m) and closed-form symbolic integration before plugging in numbers.',
      },
    ],
  },

  // 14. ENGINEERING ANALYSIS: System Trade-Off & Architecture Decision Matrix
  {
    id: 'ana-tradeoff-pugh',
    title: 'Engineering Architecture Trade-Off & Weighted Kepner-Tregoe / Pugh Matrix',
    discipline: 'ANALYSIS',
    disciplineLabel: 'Engineering Analysis',
    shortSummary: 'Compare competing mechanical/mechatronic architectures across quantified physics, cost, reliability, and risk criteria.',
    engineeringGoal: 'Drive an objective, defensible architecture down-selection for Preliminary Design Review (PDR).',
    recommendedFramework: 'CO-STAR',
    defaultUnitSystem: 'SI',
    defaultConstraints: ['bound-explicit-assumptions', 'rigor-sensitivity', 'schema-tradeoff-matrix'],
    variables: [
      {
        key: 'design_problem',
        label: 'System Function & Architecture Decision',
        placeholder: 'e.g., Linear actuation mechanism for a 15 kN precision press stage',
        defaultValue: 'Precision Z-axis vertical actuation stage for a semiconductor wafer inspection gantry (25 kg payload, 150 mm stroke, ±1.5 μm bidirectional repeatability, 24/7 cleanroom duty)',
        presets: [
          'Precision Z-axis vertical actuation stage for a semiconductor wafer inspection gantry (25 kg payload, 150 mm stroke, ±1.5 μm bidirectional repeatability, 24/7 cleanroom duty)',
          'Thermal management architecture for a 150 kW heavy-duty fuel cell pack (Liquid-to-Air Radiator vs. Phase-Change Immersion vs. Two-Phase Refrigerant Loop)',
          'Position sensing architecture for a harsh subsea valve actuator (LVDT vs. Magnetostrictive vs. Optical Absolute Encoder)',
        ],
      },
      {
        key: 'candidate_concepts',
        label: 'Competing Engineering Concepts to Compare',
        placeholder: 'e.g., Concept A: Ground Ballscrew + Servo; Concept B: Ironless Linear Motor...',
        defaultValue: 'Concept A: Preloaded C3 Ground Ballscrew + Rotary Servo + Pneumatic Counterbalance; Concept B: Direct-Drive Ironless Linear Motor + Magnetic Gravity Compensator + Linear Optical Scale; Concept C: Roller Screw + Harmonic Drive',
        presets: [
          'Concept A: Preloaded C3 Ground Ballscrew + Rotary Servo + Pneumatic Counterbalance; Concept B: Direct-Drive Ironless Linear Motor + Magnetic Gravity Compensator + Linear Optical Scale; Concept C: Roller Screw + Harmonic Drive',
          'Concept A: Extruded Brazed Aluminum Cold Plate; Concept B: Friction-Stir Welded Copper Micro-Channel Plate; Concept C: Embedded Sintered Heat-Pipe Base',
        ],
      },
      {
        key: 'must_and_want_criteria',
        label: 'Must-Have Pass/Fail Gates & Weighted Want Criteria',
        placeholder: 'e.g., Must: ISO Class 4 cleanroom, Power-off brake; Wants: Stiffness, BOM cost, MTBF',
        defaultValue: 'MUST Gates: ISO Class 4 particulate compliance, failsafe vertical drop arrest on power loss (< 0.5 mm drop). WEIGHTED WANTS: Bidirectional Repeatability (wt 5), Moving Mass/Thermal Dissipation (wt 4), BOM Cost at 500/yr (wt 3), L10 Life > 25,000 hrs (wt 4)',
        presets: [
          'MUST Gates: ISO Class 4 particulate compliance, failsafe vertical drop arrest on power loss (< 0.5 mm drop). WEIGHTED WANTS: Bidirectional Repeatability (wt 5), Moving Mass/Thermal Dissipation (wt 4), BOM Cost at 500/yr (wt 3), L10 Life > 25,000 hrs (wt 4)',
          'MUST Gates: IP68 300 bar pressure rating, MTBF > 50,000 hrs; WEIGHTED WANTS: Accuracy, Drift over Temp, Unit Cost, Serviceability',
        ],
      },
    ],
    canonical: {
      roleAndDomain:
        'Act as a Chief Systems Architect & Principal Mechatronics Engineer facilitating a formal Preliminary Design Review (PDR) Architecture Trade Study.',
      systemContext:
        'Engineering architecture problem: {{design_problem}}. Competing candidate concepts: {{candidate_concepts}}. Mandatory screening gates and weighted evaluation criteria: {{must_and_want_criteria}}.',
      primaryObjective:
        'Execute a two-stage Kepner-Tregoe / Weighted Pugh Trade Study: (1) Screen all concepts against binary MUST gates, (2) Quantify physical engineering metrics (Abbe error, thermal coil dissipation I²R, contact wear, backlash, BOM cost) for each criterion before assigning 1–10 scores, and (3) Perform a weight-perturbation sensitivity check to verify whether the winning concept flips.',
      analyticalSteps: [
        '1. Binary MUST-Gate Screening: Evaluate each candidate against non-negotiable pass/fail constraints (including failure modes under loss of power/air) and specify required design modifications for any conditional pass.',
        '2. Quantitative Engineering Parameter Estimation: Before scoring any concept on a 1–10 scale, estimate the actual underlying engineering figures of merit (e.g., μm hysteresis, Watts of motor heat near optics, L10 fatigue hours, estimated BOM $).',
        '3. Weighted Decision Matrix Computation: Construct the scored matrix (Weight W_i × Score S_ij) with explicit scoring rubrics so ratings are anchored to physical numbers rather than subjective opinion.',
        '4. Weight Sensitivity & Risk Mitigation Plan: Test whether shifting Cost vs. Precision weights by ±25% changes the winner, and define the top 3 technical risks to retire in prototype bench testing.',
      ],
      technicalStyleAndTone:
        'Objective, quantitative systems engineering trade-study style anchored in physical figures of merit.',
      targetAudience:
        'VP of Engineering, Chief Architect, and Cross-Functional PDR Review Committee.',
      narrowingAndBounds:
        'Do not assign arbitrary 1–10 scores without first stating the physical engineering metric (in μm, Watts, Newtons, hours, or $) that justifies the score differential.',
      responseSchema:
        'Deliver: (1) MUST-Gate Screening Table, (2) Quantitative Engineering Metric Comparison Table, (3) Weighted Kepner-Tregoe / Pugh Scoring Matrix, and (4) Weight-Sensitivity & Prototype Risk-Retirement Plan.',
      fewShotExample: {
        sampleInput: 'Criterion: Thermal Dissipation at Moving Carriage (Weight = 4). Compare Ballscrew (rotary servo at base) vs. Ironless Linear Motor (coil on carriage).',
        sampleReasoning: 'Ballscrew keeps motor I²R heat at stationary base (~2 W frictional heat at nut); Linear motor dissipates ~18–35 W directly in the moving coil unless water-cooled.',
        sampleOutput: 'Concept A (Ballscrew): ~2 W local nut friction → Score 9/10 (Weighted 36). Concept B (Linear Motor): ~25 W moving coil I²R near wafer stage → Score 5/10 (Weighted 20).',
      },
      firstPrinciplesAxioms:
        'Multi-Attribute Utility Theory: Total Architecture Utility U_j = (∏ Gate_k) × ∑(w_i · u_i(x_ij)), where u_i maps measurable physical performance parameter x_ij into a normalized utility scale.',
    },
    weakPromptBaseline:
      'Compare {{candidate_concepts}} for {{design_problem}} using a Pugh matrix based on {{must_and_want_criteria}}.',
    failureModesPrevented: [
      {
        aspect: 'Subjective Unanchored 1–10 Numbers',
        weakFailureMode: 'Fills a table with arbitrary 7s, 8s, and 9s without any underlying physics or engineering parameter estimates.',
        engineeredFix: 'Forces a dedicated Quantitative Engineering Metric step (μm, W, N, hrs, $) prior to assigning matrix scores.',
      },
    ],
  },

  // 15. ENGINEERING ANALYSIS: DVT / PVT Test Protocol & Accelerated Life Testing
  {
    id: 'ana-dvt-test-protocol',
    title: 'DVT / HALT Test Protocol & Arrhenius / Coffin-Manson Accelerated Life Plan',
    discipline: 'ANALYSIS',
    disciplineLabel: 'Engineering Analysis',
    shortSummary: 'Calculate Acceleration Factors (AF), zero-failure Weibull sample sizes (Success Run Theorem), and step-stress test procedures.',
    engineeringGoal: 'Design a statistically valid verification test plan that proves 5–10 year service reliability in compressed lab time.',
    recommendedFramework: 'RISEN',
    defaultUnitSystem: 'SI',
    defaultConstraints: ['rigor-symbolic-first', 'rigor-dimensional-check', 'bound-explicit-assumptions', 'schema-verification-gate'],
    variables: [
      {
        key: 'dut_description',
        label: 'Device Under Test (DUT) & Target Service Life',
        placeholder: 'e.g., Automotive under-hood pressure sensor; 10-year / 5,000-hour operational life',
        defaultValue: 'Outdoor solar micro-inverter sealed aluminum enclosure & potting assembly; required 10-year field service life (equivalent to 3,650 thermal diurnal cycles and 40,000 energized operating hours)',
        presets: [
          'Outdoor solar micro-inverter sealed aluminum enclosure & potting assembly; required 10-year field service life (equivalent to 3,650 thermal diurnal cycles and 40,000 energized operating hours)',
          'Implantable/wearable medical peristaltic infusion pump mechanism; 3-year life at 95% confidence / 99% reliability (R99C95)',
          'Industrial pneumatic solenoid valve manifold; B10 life of 10,000,000 actuation cycles',
        ],
      },
      {
        key: 'stress_mechanisms',
        label: 'Field vs. Accelerated Lab Stress Levels',
        placeholder: 'e.g., Field ΔT = 30°C vs. Chamber ΔT = 125°C (-40°C to +85°C); T_use = 45°C vs. T_test = 105°C',
        defaultValue: 'Thermal cycling: Field ΔT_use = 35 K vs. Chamber ΔT_test = 145 K (-40°C to +105°C, Coffin-Manson exponent n = 2.5); High-temp aging: T_use = 45°C (318.15 K) vs. T_test = 105°C (378.15 K) with activation energy Ea = 0.70 eV',
        presets: [
          'Thermal cycling: Field ΔT_use = 35 K vs. Chamber ΔT_test = 145 K (-40°C to +105°C, Coffin-Manson exponent n = 2.5); High-temp aging: T_use = 45°C (318.15 K) vs. T_test = 105°C (378.15 K) with activation energy Ea = 0.70 eV',
          'Peck Damp Heat (85°C / 85% RH vs. 30°C / 60% RH field) + Random Vibration per MIL-STD-810H',
        ],
      },
      {
        key: 'reliability_confidence',
        label: 'Target Reliability (R), Confidence (C) & Weibull Shape (β)',
        placeholder: 'e.g., R = 95% at C = 90% confidence (R95C90), Weibull beta = 2.0',
        defaultValue: 'R = 95% reliability at C = 90% confidence level (R95C90) with zero allowable failures (c = 0), assuming Weibull wear-out shape parameter β = 2.2',
        presets: [
          'R = 95% reliability at C = 90% confidence level (R95C90) with zero allowable failures (c = 0), assuming Weibull wear-out shape parameter β = 2.2',
          'R = 99% reliability at C = 95% confidence (R99C95), zero failures (c = 0)',
        ],
      },
    ],
    canonical: {
      roleAndDomain:
        'Act as a Principal Reliability & Verification Test Engineer specializing in Accelerated Life Testing (ALT), Weibull Success-Run statistics (Bayes-Weibull bogey testing), and HALT/DVT test protocols.',
      systemContext:
        'Device Under Test and field life requirement: {{dut_description}}. Stress acceleration parameters: {{stress_mechanisms}}. Statistical demonstration target: {{reliability_confidence}}.',
      primaryObjective:
        'Derive the exact physical Acceleration Factors (Arrhenius thermal aging AF_T and Coffin-Manson thermal cycling AF_TC), compute the required zero-failure sample size (n) or extended test duration ratio using the Parametric Binomial / Weibull Success-Run equation, and write an executable step-by-step lab test protocol.',
      analyticalSteps: [
        '1. Physical Acceleration Factor (AF) Derivation: Write out the symbolic Arrhenius equation AF_T = exp[(Ea / k_B)·(1/T_use - 1/T_test)] (using Boltzmann constant k_B = 8.617×10⁻⁵ eV/K and absolute Kelvin temperatures) and Coffin-Manson equation AF_TC = (ΔT_test / ΔT_use)^n, then compute required lab test hours and cycles.',
        '2. Statistical Sample Size & Weibull Bogey Trade-Off: Apply the zero-failure Success-Run theorem n = ln(1 - C) / [ln(R) · (t_test / t_mission)^β] to present a trade-off table between sample size (e.g., n = 12, 22, 45 units) and required test duration.',
        '3. Over-Stress Physics Validity Guard: Audit whether the accelerated stress levels ({{stress_mechanisms}}) risk triggering non-representative failure modes (e.g., polymer glass transition Tg exceedance, solder melting phase change, condensation freezing).',
        '4. Step-by-Step DVT Execution & Pass/Fail Metrology: Define pre-test baseline functional characterization, intermediate readout intervals (25%, 50%, 75%, 100% life), fixture mounting, and quantitative parametric drift limits.',
      ],
      technicalStyleAndTone:
        'Exact reliability physics and statistical test engineering notation with Kelvin temperature conversions and Boltzmann constant precision.',
      targetAudience:
        'DVT/PVT Reliability Lab Engineers, Quality Sign-Off Managers, and Hardware Program Leads.',
      narrowingAndBounds:
        'Never plug Celsius temperatures (°C) directly into the Arrhenius 1/T term; always convert to absolute Kelvin (K = °C + 273.15). State explicitly what happens if 1 unit fails during a zero-failure (c=0) test.',
      responseSchema:
        'Output: (1) Symbolic & Numerical Acceleration Factor (AF) Derivations, (2) Sample Size (n) vs. Test Duration Trade-Off Matrix for {{reliability_confidence}}, (3) Physics-of-Failure Overstress Validity Check, and (4) Step-by-Step Lab Execution & Pass/Fail Readout Schedule.',
      fewShotExample: {
        sampleInput: 'R = 0.90, C = 0.90, c = 0 failures, test duration = 1.0 life equivalent (t_ratio = 1).',
        sampleReasoning: 'Success Run Theorem: n = ln(1 - C) / ln(R) = ln(0.10) / ln(0.90) = -2.3026 / -0.10536 = 21.85 → 22 units.',
        sampleOutput: 'For 1.0× equivalent life test at R90C90 (c=0): Required Sample Size n = 22 units. With Weibull β = 2.0 and n = 12 units, extend test duration by (22/12)^(1/2) = 1.35× life.',
      },
      firstPrinciplesAxioms:
        'Arrhenius Rate Law r ∝ exp(-Ea / (k_B·T)); Coffin-Manson Low-Cycle Thermal Fatigue N_f ∝ (ΔT)^(-n); Weibull Reliability R(t) = exp(-(t/η)^β) and Binomial Zero-Failure Confidence 1 - C = [R(t_test)]^n.',
    },
    weakPromptBaseline:
      'Write a DVT accelerated life test plan for {{dut_description}} using {{stress_mechanisms}} to prove {{reliability_confidence}}.',
    failureModesPrevented: [
      {
        aspect: 'Celsius vs. Kelvin Error in Arrhenius Equation',
        weakFailureMode: 'Substitutes 1/45 - 1/105 in °C instead of 1/318.15 - 1/378.15 in Kelvin, producing wildly wrong acceleration factors.',
        engineeredFix: 'Enforces explicit Kelvin conversion (K = °C + 273.15) and Boltzmann constant k_B = 8.617×10⁻⁵ eV/K verification.',
      },
      {
        aspect: 'Arbitrary Sample Sizes Without R/C Math',
        weakFailureMode: 'Suggests "test 5 or 10 samples" without connecting sample count to target Reliability (R), Confidence (C), and Weibull β.',
        engineeredFix: 'Applies the exact Parametric Weibull Success-Run equation n = ln(1-C) / [ln(R)·(t_ratio)^β].',
      },
    ],
  },
];

/**
 * Deterministically maps a blueprint's CanonicalPromptSpec into the selected framework's modular blocks.
 * If existingBlocks are provided, any custom blocks added by the user are preserved.
 */
export function buildBlocksForFramework(
  canonical: CanonicalPromptSpec,
  framework: FrameworkId,
  existingBlocks?: PromptBlock[]
): PromptBlock[] {
  const customBlocks = (existingBlocks || []).filter((b) => b.sourceSlot === 'CUSTOM');

  const stepsJoined = canonical.analyticalSteps.join('\n');
  const fewShotFormatted = `Sample Input:\n${canonical.fewShotExample.sampleInput}\n\nEngineering Derivation:\n${canonical.fewShotExample.sampleReasoning}\n\nCalibrated Output:\n${canonical.fewShotExample.sampleOutput}`;

  let coreBlocks: PromptBlock[] = [];

  if (framework === 'CO-STAR') {
    coreBlocks = [
      {
        id: 'costar-c',
        code: 'C',
        title: 'Context & System Boundary',
        subtitle: 'Engineering persona, physical geometry, materials, and operating boundary conditions',
        xmlTag: 'engineering_context',
        enabled: true,
        content: `${canonical.roleAndDomain}\n\n${canonical.systemContext}`,
        sourceSlot: 'systemContext',
      },
      {
        id: 'costar-o',
        code: 'O',
        title: 'Objective & Analytical Steps',
        subtitle: 'Quantifiable engineering deliverable and required methodological workflow',
        xmlTag: 'engineering_objective',
        enabled: true,
        content: `${canonical.primaryObjective}\n\nExecute the following analytical steps:\n${stepsJoined}`,
        sourceSlot: 'primaryObjective',
      },
      {
        id: 'costar-s',
        code: 'S',
        title: 'Style & Governing Rigor',
        subtitle: 'Technical communication style, mathematical notation, and physical axioms',
        xmlTag: 'technical_style',
        enabled: true,
        content: `${canonical.technicalStyleAndTone}\n\n${canonical.firstPrinciplesAxioms}`,
        sourceSlot: 'technicalStyleAndTone',
      },
      {
        id: 'costar-t',
        code: 'T',
        title: 'Tone & Assumption Guardrails',
        subtitle: 'Negative constraints, failure mode prevention, and out-of-bounds handling',
        xmlTag: 'boundary_guardrails',
        enabled: true,
        content: canonical.narrowingAndBounds,
        sourceSlot: 'narrowingAndBounds',
      },
      {
        id: 'costar-a',
        code: 'A',
        title: 'Audience & Sign-Off Level',
        subtitle: 'Target engineering review board and domain depth expectation',
        xmlTag: 'target_audience',
        enabled: true,
        content: `Target Audience: ${canonical.targetAudience}. Write for peer-level engineering design review sign-off without introductory textbook filler.`,
        sourceSlot: 'targetAudience',
      },
      {
        id: 'costar-r',
        code: 'R',
        title: 'Response Schema & Deliverables',
        subtitle: 'Required tables, derivations, and verification sign-off structure',
        xmlTag: 'response_schema',
        enabled: true,
        content: canonical.responseSchema,
        sourceSlot: 'responseSchema',
      },
    ];
  } else if (framework === 'RISEN') {
    coreBlocks = [
      {
        id: 'risen-r',
        code: 'R',
        title: 'Role & Engineering Authority',
        subtitle: 'Specialist domain persona and governing engineering discipline',
        xmlTag: 'engineering_role',
        enabled: true,
        content: canonical.roleAndDomain,
        sourceSlot: 'roleAndDomain',
      },
      {
        id: 'risen-i',
        code: 'I',
        title: 'Instructions & Problem Envelope',
        subtitle: 'System boundary conditions, inputs, and core technical directive',
        xmlTag: 'problem_instructions',
        enabled: true,
        content: `${canonical.systemContext}\n\nPrimary Directive: ${canonical.primaryObjective}`,
        sourceSlot: 'systemContext',
      },
      {
        id: 'risen-s',
        code: 'S',
        title: 'Steps & Procedural Sequence',
        subtitle: 'Ordered analytical and verification stages that must be executed in sequence',
        xmlTag: 'execution_steps',
        enabled: true,
        content: stepsJoined,
        sourceSlot: 'analyticalSteps',
      },
      {
        id: 'risen-e',
        code: 'E',
        title: 'End Goal & Deliverable Schema',
        subtitle: 'Definition of done, target review audience, and structured output tables',
        xmlTag: 'end_goal_schema',
        enabled: true,
        content: `${canonical.responseSchema}\n\nReview Standard: ${canonical.targetAudience}`,
        sourceSlot: 'responseSchema',
      },
      {
        id: 'risen-n',
        code: 'N',
        title: 'Narrowing & Negative Constraints',
        subtitle: 'Strict boundary restrictions, prohibited shortcuts, and physical invariants',
        xmlTag: 'narrowing_constraints',
        enabled: true,
        content: `${canonical.narrowingAndBounds}\n\n${canonical.firstPrinciplesAxioms}`,
        sourceSlot: 'narrowingAndBounds',
      },
    ];
  } else if (framework === 'FEW_SHOT') {
    coreBlocks = [
      {
        id: 'fs-sys',
        code: 'SYS',
        title: 'Domain Role & Physical Axioms',
        subtitle: 'Specialist persona and governing engineering equations',
        xmlTag: 'system_role',
        enabled: true,
        content: `${canonical.roleAndDomain}\n\n${canonical.firstPrinciplesAxioms}`,
        sourceSlot: 'roleAndDomain',
      },
      {
        id: 'fs-task',
        code: 'TASK',
        title: 'Target Engineering Problem & Bounds',
        subtitle: 'Specific geometry, materials, process streams, and boundary conditions',
        xmlTag: 'engineering_task',
        enabled: true,
        content: `${canonical.systemContext}\n\nObjective: ${canonical.primaryObjective}\n\nGuardrails: ${canonical.narrowingAndBounds}`,
        sourceSlot: 'systemContext',
      },
      {
        id: 'fs-ex',
        code: 'EX',
        title: 'Few-Shot Calibration Benchmark',
        subtitle: 'Reference input → reasoning → output example anchoring analytical rigor',
        xmlTag: 'calibration_example',
        enabled: true,
        content: fewShotFormatted,
        sourceSlot: 'fewShotExample',
      },
      {
        id: 'fs-cot',
        code: 'COT',
        title: 'Step-by-Step Analytical Chain',
        subtitle: 'Required derivation sequence for the target problem',
        xmlTag: 'analytical_chain',
        enabled: true,
        content: stepsJoined,
        sourceSlot: 'analyticalSteps',
      },
      {
        id: 'fs-out',
        code: 'OUT',
        title: 'Output Specification & Tables',
        subtitle: 'Final engineering report structure',
        xmlTag: 'output_format',
        enabled: true,
        content: canonical.responseSchema,
        sourceSlot: 'responseSchema',
      },
    ];
  } else {
    // FIRST_PRINCIPLES
    coreBlocks = [
      {
        id: 'fp-axiom',
        code: 'AXIOM',
        title: 'Governing Physics & Conservation Laws',
        subtitle: 'Fundamental equations, constitutive relations, and specialist role',
        xmlTag: 'governing_physics',
        enabled: true,
        content: `${canonical.roleAndDomain}\n\n${canonical.firstPrinciplesAxioms}`,
        sourceSlot: 'firstPrinciplesAxioms',
      },
      {
        id: 'fp-bound',
        code: 'BOUND',
        title: 'Control Volume, Boundary Conditions & Inputs',
        subtitle: 'System envelope, loads, material allowables, and explicit assumptions',
        xmlTag: 'boundary_conditions',
        enabled: true,
        content: `${canonical.systemContext}\n\nBoundary Guardrails: ${canonical.narrowingAndBounds}`,
        sourceSlot: 'systemContext',
      },
      {
        id: 'fp-derive',
        code: 'DERIVE',
        title: 'Stepwise Analytical Derivation Protocol',
        subtitle: 'Symbolic-to-numeric calculation sequence',
        xmlTag: 'derivation_steps',
        enabled: true,
        content: `${canonical.primaryObjective}\n\n${stepsJoined}`,
        sourceSlot: 'analyticalSteps',
      },
      {
        id: 'fp-check',
        code: 'CHECK',
        title: 'Reference Calibration & Sanity Check',
        subtitle: 'Order-of-magnitude benchmark and dimensional verification',
        xmlTag: 'verification_benchmark',
        enabled: true,
        content: fewShotFormatted,
        sourceSlot: 'fewShotExample',
      },
      {
        id: 'fp-schema',
        code: 'SCHEMA',
        title: 'Engineering Deliverable & Sign-Off Schema',
        subtitle: 'Required engineering tables and verification criteria',
        xmlTag: 'deliverable_schema',
        enabled: true,
        content: canonical.responseSchema,
        sourceSlot: 'responseSchema',
      },
    ];
  }

  return [...coreBlocks, ...customBlocks];
}
