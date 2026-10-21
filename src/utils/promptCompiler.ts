import {
  CompletenessCheckItem,
  ConstraintModule,
  FrameworkId,
  OutputFormat,
  PromptBlock,
  UnitSystem,
} from '../types/playbook';

export interface CompiledSegment {
  blockId: string;
  code: string;
  title: string;
  xmlTag: string;
  renderedText: string;
}

export interface CompiledPromptResult {
  fullText: string;
  segments: CompiledSegment[];
  detectedVariables: string[];
  unfilledVariables: string[];
  wordCount: number;
  charCount: number;
  estimatedTokens: number;
  completenessChecklist: CompletenessCheckItem[];
  completenessScoreText: string;
}

const UNIT_SYSTEM_CLAUSES: Record<UnitSystem, string> = {
  SI: 'STRICT UNIT CONVENTION: Use consistent SI Metric engineering units throughout (mm, m, N, kN, MPa, GPa, W, kJ, kg/s, bar/Pa, K/°C). Explicitly convert any non-SI input values before substituting into formulas.',
  IMPERIAL:
    'STRICT UNIT CONVENTION: Use consistent US Customary / Imperial engineering units throughout (in, ft, lbf, kip, psi, ksi, BTU/hr, gpm, psig, °F/°R), explicitly applying gravitational conversion constant g_c = 32.174 lbm·ft/(lbf·s²) where required.',
  DUAL: 'STRICT UNIT CONVENTION: Perform all primary derivations in SI Metric units (mm, N, MPa, W, K/°C) and report dual [SI / US Customary Imperial] values in parentheses for all final summary tables and tolerances.',
};

/**
 * Extracts all unique {{variable_key}} tokens from a set of prompt blocks.
 */
export function extractVariablesFromBlocks(blocks: PromptBlock[]): string[] {
  const found = new Set<string>();
  const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;

  for (const block of blocks) {
    if (!block.enabled) continue;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(block.content)) !== null) {
      found.add(match[1]);
    }
  }
  return Array.from(found);
}

/**
 * Replaces {{variable_key}} tokens with user-supplied values or preserves a clear placeholder marker.
 */
export function interpolateVariables(
  rawText: string,
  variableValues: Record<string, string>
): string {
  return rawText.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    const val = variableValues[key]?.trim();
    return val && val.length > 0 ? val : `[UNSPECIFIED: ${key}]`;
  });
}

/**
 * Deterministically compiles the active blocks, variable values, unit system, and constraint modules
 * into Markdown, XML-delimited, or JSON payload format.
 */
export function compileEngineeringPrompt(params: {
  blueprintTitle: string;
  disciplineLabel: string;
  framework: FrameworkId;
  blocks: PromptBlock[];
  variableValues: Record<string, string>;
  unitSystem: UnitSystem;
  activeConstraintIds: string[];
  allConstraints: ConstraintModule[];
  outputFormat: OutputFormat;
}): CompiledPromptResult {
  const {
    blueprintTitle,
    disciplineLabel,
    framework,
    blocks,
    variableValues,
    unitSystem,
    activeConstraintIds,
    allConstraints,
    outputFormat,
  } = params;

  const enabledBlocks = blocks.filter((b) => b.enabled);
  const detectedVariables = extractVariablesFromBlocks(blocks);
  const unfilledVariables = detectedVariables.filter(
    (key) => !variableValues[key] || variableValues[key].trim().length === 0
  );

  const selectedConstraints = allConstraints.filter((c) =>
    activeConstraintIds.includes(c.id)
  );

  const segments: CompiledSegment[] = enabledBlocks.map((block) => ({
    blockId: block.id,
    code: block.code,
    title: block.title,
    xmlTag: block.xmlTag,
    renderedText: interpolateVariables(block.content, variableValues),
  }));

  const unitClause = UNIT_SYSTEM_CLAUSES[unitSystem];

  if (selectedConstraints.length > 0 || unitClause) {
    const constraintLines = [
      `- ${unitClause}`,
      ...selectedConstraints.map((c) => `- [${c.shortCode}] ${c.injectedClause}`),
    ].join('\n');

    segments.push({
      blockId: '__constraints__',
      code: 'STD',
      title: 'Engineering Standards, Units & Rigor Constraints',
      xmlTag: 'engineering_constraints',
      renderedText: constraintLines,
    });
  }

  let fullText = '';

  if (outputFormat === 'MARKDOWN') {
    const header = `# ENGINEERING SPECIFICATION PROMPT: ${blueprintTitle.toUpperCase()}\nDiscipline: ${disciplineLabel} · Framework: ${framework} · Unit System: ${unitSystem}\n`;
    const body = segments
      .map(
        (seg) =>
          `## [${seg.code}] ${seg.title}\n${seg.renderedText}`
      )
      .join('\n\n');
    fullText = `${header}\n${body}`;
  } else if (outputFormat === 'XML') {
    const body = segments
      .map(
        (seg) =>
          `<${seg.xmlTag} code="${seg.code}" title="${seg.title}">\n${seg.renderedText}\n</${seg.xmlTag}>`
      )
      .join('\n\n');
    fullText = `<engineering_prompt blueprint="${blueprintTitle}" discipline="${disciplineLabel}" framework="${framework}" units="${unitSystem}">\n\n${body}\n\n</engineering_prompt>`;
  } else {
    // JSON Payload
    const systemSegment = segments[0];
    const userSegments = segments.slice(1);
    const payload = {
      metadata: {
        blueprint: blueprintTitle,
        discipline: disciplineLabel,
        framework,
        unitSystem,
        appliedConstraints: selectedConstraints.map((c) => c.shortCode),
      },
      messages: [
        {
          role: 'system',
          content: systemSegment ? systemSegment.renderedText : '',
        },
        {
          role: 'user',
          content: userSegments
            .map((s) => `### [${s.code}] ${s.title}\n${s.renderedText}`)
            .join('\n\n'),
        },
      ],
    };
    fullText = JSON.stringify(payload, null, 2);
  }

  const charCount = fullText.length;
  const wordCount = fullText
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  // Rule-of-thumb technical token estimation (~3.8 chars per token for dense technical/numeric text)
  const estimatedTokens = Math.max(1, Math.round(charCount / 3.8));

  // Deterministic 6-Point Engineering Specification Completeness Rubric
  const lowerFull = fullText.toLowerCase();

  const hasRoleOrPersona =
    enabledBlocks.some(
      (b) =>
        b.sourceSlot === 'roleAndDomain' ||
        b.sourceSlot === 'systemContext' ||
        b.sourceSlot === 'firstPrinciplesAxioms'
    ) && /(engineer|specialist|analyst|architect|metallurgist)/i.test(fullText);

  const hasAllVariablesFilled = unfilledVariables.length === 0;

  const hasStandardsOrRigor = selectedConstraints.length >= 2;

  const hasStepwiseMethod =
    enabledBlocks.some((b) => b.sourceSlot === 'analyticalSteps') ||
    /(\b1\.|\bstep 1)/i.test(lowerFull);

  const hasBoundaryOrAssumptions =
    enabledBlocks.some((b) => b.sourceSlot === 'narrowingAndBounds') ||
    activeConstraintIds.includes('bound-explicit-assumptions') ||
    activeConstraintIds.includes('bound-missing-data-guard');

  const hasStructuredSchema =
    enabledBlocks.some((b) => b.sourceSlot === 'responseSchema') ||
    /(table|matrix|deliver|provide|output)/i.test(lowerFull);

  const completenessChecklist: CompletenessCheckItem[] = [
    {
      id: 'chk-role',
      label: 'Specialist Engineering Persona & Domain Anchored',
      passed: hasRoleOrPersona,
      detail: hasRoleOrPersona
        ? 'Domain authority and governing physical scope are explicitly defined.'
        : 'Enable the Role/Context block to anchor specialist engineering vocabulary.',
    },
    {
      id: 'chk-vars',
      label: 'All Dynamic Parameter Variables Populated',
      passed: hasAllVariablesFilled,
      detail: hasAllVariablesFilled
        ? `All ${detectedVariables.length} engineering parameter slots contain explicit values.`
        : `${unfilledVariables.length} variable slot(s) unfilled: ${unfilledVariables.map((v) => `{{${v}}}`).join(', ')}.`,
    },
    {
      id: 'chk-std',
      label: 'Governing Standards & Analytical Rigor Modules Active',
      passed: hasStandardsOrRigor,
      detail: hasStandardsOrRigor
        ? `${selectedConstraints.length} constraint module(s) and ${unitSystem} unit rules enforced.`
        : 'Select at least 2 Engineering Constraint Injectors (e.g., ASME/ISO, Symbolic Equations).',
    },
    {
      id: 'chk-steps',
      label: 'Step-by-Step Analytical Derivation Sequence',
      passed: hasStepwiseMethod,
      detail: hasStepwiseMethod
        ? 'Ordered calculation and verification sequence is active.'
        : 'Enable the Steps/Objective block to prevent single-pass arithmetic leaps.',
    },
    {
      id: 'chk-bounds',
      label: 'Boundary Assumptions & Hallucination Guardrails',
      passed: hasBoundaryOrAssumptions,
      detail: hasBoundaryOrAssumptions
        ? 'Negative constraints and assumption boundaries are active.'
        : 'Enable the Narrowing/Tone block or toggle "Explicit Engineering Assumptions Log".',
    },
    {
      id: 'chk-schema',
      label: 'Deterministic Deliverable & Table Schema Specified',
      passed: hasStructuredSchema,
      detail: hasStructuredSchema
        ? 'Output format constrains tables, units, and sign-off criteria.'
        : 'Enable the Response Schema block to enforce structured engineering tables.',
    },
  ];

  const passedCount = completenessChecklist.filter((c) => c.passed).length;
  const completenessScoreText = `${passedCount} / ${completenessChecklist.length} Spec Criteria Met`;

  return {
    fullText,
    segments,
    detectedVariables,
    unfilledVariables,
    wordCount,
    charCount,
    estimatedTokens,
    completenessChecklist,
    completenessScoreText,
  };
}
