export type EngineeringDiscipline =
  | 'ALL'
  | 'MECHANICAL'
  | 'PRODUCT_DFM'
  | 'MANUFACTURING'
  | 'PROCESS'
  | 'ANALYSIS';

export type FrameworkId =
  | 'CO-STAR'
  | 'RISEN'
  | 'FEW_SHOT'
  | 'FIRST_PRINCIPLES';

export type OutputFormat = 'MARKDOWN' | 'XML' | 'JSON';

export type UnitSystem = 'SI' | 'IMPERIAL' | 'DUAL';

export interface VariableDefinition {
  key: string;
  label: string;
  placeholder: string;
  defaultValue: string;
  unitHint?: string;
  presets: string[];
}

export interface CanonicalPromptSpec {
  roleAndDomain: string;
  systemContext: string;
  primaryObjective: string;
  analyticalSteps: string[];
  technicalStyleAndTone: string;
  targetAudience: string;
  narrowingAndBounds: string;
  responseSchema: string;
  fewShotExample: {
    sampleInput: string;
    sampleReasoning: string;
    sampleOutput: string;
  };
  firstPrinciplesAxioms: string;
}

export interface PromptBlock {
  id: string;
  code: string; // e.g., 'C', 'O', 'S', 'T', 'A', 'R' or 'R', 'I', 'S', 'E', 'N'
  title: string;
  subtitle: string;
  xmlTag: string;
  enabled: boolean;
  content: string;
  sourceSlot: keyof CanonicalPromptSpec | 'CUSTOM';
}

export type ConstraintCategory =
  | 'STANDARDS'
  | 'RIGOR'
  | 'BOUNDARY'
  | 'OUTPUT_SCHEMA';

export interface ConstraintModule {
  id: string;
  label: string;
  category: ConstraintCategory;
  shortCode: string;
  description: string;
  injectedClause: string;
  recommendedFor: EngineeringDiscipline[];
}

export interface WeakVsEngineeredNote {
  aspect: string;
  weakFailureMode: string;
  engineeredFix: string;
}

export interface EngineeringBlueprint {
  id: string;
  title: string;
  discipline: Exclude<EngineeringDiscipline, 'ALL'>;
  disciplineLabel: string;
  shortSummary: string;
  engineeringGoal: string;
  recommendedFramework: FrameworkId;
  defaultUnitSystem: UnitSystem;
  defaultConstraints: string[];
  variables: VariableDefinition[];
  canonical: CanonicalPromptSpec;
  weakPromptBaseline: string;
  failureModesPrevented: WeakVsEngineeredNote[];
}

export interface SavedRecipe {
  id: string;
  name: string;
  disciplineLabel: string;
  framework: FrameworkId;
  unitSystem: UnitSystem;
  outputFormat: OutputFormat;
  createdAt: string;
  blocks: PromptBlock[];
  variableValues: Record<string, string>;
  activeConstraints: string[];
  sourceBlueprintId: string;
}

export interface CompletenessCheckItem {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
  fixActionLabel?: string;
}
