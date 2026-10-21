import React, { useState, useMemo, useEffect } from 'react';
import {
  Check,
  Copy,
  Download,
  Bookmark,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Search,
  FileCode,
  FileText,
  Braces,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  BookOpen,
  Clock,
  ArrowRight,
  Scale,
} from 'lucide-react';
import {
  ConstraintCategory,
  EngineeringBlueprint,
  EngineeringDiscipline,
  FrameworkId,
  OutputFormat,
  PromptBlock,
  SavedRecipe,
  UnitSystem,
} from './types/playbook';
import {
  CONSTRAINT_MODULES,
  ENGINEERING_BLUEPRINTS,
  FRAMEWORKS,
  buildBlocksForFramework,
} from './data/engineeringPlaybookData';
import {
  compileEngineeringPrompt,
  extractVariablesFromBlocks,
  interpolateVariables,
} from './utils/promptCompiler';

type ActivePage = 'BUILDER' | 'CATALOG' | 'TECHNICAL_DOCS' | 'SAVED';
type BuilderStageTab = 'PARAMETERS' | 'STANDARDS' | 'BLOCKS' | 'ALL_OPEN';

const DISCIPLINE_TABS: {
  id: EngineeringDiscipline;
  label: string;
  shortLabel: string;
  count: number;
}[] = [
  {
    id: 'ALL',
    label: 'All Disciplines',
    shortLabel: 'All',
    count: ENGINEERING_BLUEPRINTS.length,
  },
  {
    id: 'MECHANICAL',
    label: 'Mechanical Engineering',
    shortLabel: 'Mechanical',
    count: ENGINEERING_BLUEPRINTS.filter((b) => b.discipline === 'MECHANICAL')
      .length,
  },
  {
    id: 'PRODUCT_DFM',
    label: 'Product & DFM',
    shortLabel: 'Product/DFM',
    count: ENGINEERING_BLUEPRINTS.filter((b) => b.discipline === 'PRODUCT_DFM')
      .length,
  },
  {
    id: 'MANUFACTURING',
    label: 'Manufacturing & Quality',
    shortLabel: 'Manufacturing',
    count: ENGINEERING_BLUEPRINTS.filter(
      (b) => b.discipline === 'MANUFACTURING'
    ).length,
  },
  {
    id: 'PROCESS',
    label: 'Process & Chemical',
    shortLabel: 'Process',
    count: ENGINEERING_BLUEPRINTS.filter((b) => b.discipline === 'PROCESS')
      .length,
  },
  {
    id: 'ANALYSIS',
    label: 'Engineering Analysis',
    shortLabel: 'Analysis',
    count: ENGINEERING_BLUEPRINTS.filter((b) => b.discipline === 'ANALYSIS')
      .length,
  },
];

const CONSTRAINT_CATEGORY_LABELS: { id: ConstraintCategory; label: string }[] = [
  { id: 'STANDARDS', label: 'Governing Standards' },
  { id: 'RIGOR', label: 'Analytical & Math Rigor' },
  { id: 'BOUNDARY', label: 'Assumptions & Bounds' },
  { id: 'OUTPUT_SCHEMA', label: 'Deliverable Schema' },
];

const STORAGE_KEY_RECIPES = 'prompt_toolbox_saved_recipes_v1';

export default function App() {
  // Navigation Page State (Separates Fast Builder from Deep Technical Explanations & Catalog)
  const [activePage, setActivePage] = useState<ActivePage>('BUILDER');

  // Builder Sub-Stage Tab for Rapid Time-to-Prompt
  const [builderStage, setBuilderStage] =
    useState<BuilderStageTab>('PARAMETERS');

  // Expanded Block IDs in the modular block editor
  const [expandedBlockIds, setExpandedBlockIds] = useState<string[]>([
    'costar-c',
    'costar-o',
    'risen-r',
    'risen-i',
    'fs-sys',
    'fs-task',
    'fp-axiom',
    'fp-bound',
  ]);

  // 1. Selected Blueprint & Filter State
  const [selectedDiscipline, setSelectedDiscipline] =
    useState<EngineeringDiscipline>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBlueprintId, setActiveBlueprintId] = useState<string>(
    ENGINEERING_BLUEPRINTS[0].id
  );

  const activeBlueprint = useMemo(
    () =>
      ENGINEERING_BLUEPRINTS.find((b) => b.id === activeBlueprintId) ||
      ENGINEERING_BLUEPRINTS[0],
    [activeBlueprintId]
  );

  // 2. Modular Assembly State
  const [activeFramework, setActiveFramework] = useState<FrameworkId>(
    ENGINEERING_BLUEPRINTS[0].recommendedFramework
  );
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(
    ENGINEERING_BLUEPRINTS[0].defaultUnitSystem
  );
  const [activeConstraints, setActiveConstraints] = useState<string[]>(
    ENGINEERING_BLUEPRINTS[0].defaultConstraints
  );
  const [blocks, setBlocks] = useState<PromptBlock[]>(() =>
    buildBlocksForFramework(
      ENGINEERING_BLUEPRINTS[0].canonical,
      ENGINEERING_BLUEPRINTS[0].recommendedFramework
    )
  );
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {};
      for (const v of ENGINEERING_BLUEPRINTS[0].variables) {
        initial[v.key] = v.defaultValue;
      }
      return initial;
    }
  );

  // 3. Inspector & Export State
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('MARKDOWN');
  const [inspectorTab, setInspectorTab] = useState<'COMPILED' | 'CHECKLIST'>(
    'COMPILED'
  );
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [copiedState, setCopiedState] = useState<string | null>(null);
  const [activeConstraintTab, setActiveConstraintTab] =
    useState<ConstraintCategory>('STANDARDS');

  // 4. Custom Block Creation State
  const [showAddBlockForm, setShowAddBlockForm] = useState(false);
  const [newBlockCode, setNewBlockCode] = useState('SPEC');
  const [newBlockTitle, setNewBlockTitle] = useState('');
  const [newBlockContent, setNewBlockContent] = useState('');

  // 5. Saved Recipes State (localStorage)
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_RECIPES);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore localStorage read errors
    }
    return [];
  });
  const [recipeNameInput, setRecipeNameInput] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECIPES, JSON.stringify(savedRecipes));
    } catch {
      // ignore storage quota errors
    }
  }, [savedRecipes]);

  // Filtered Blueprints
  const filteredBlueprints = useMemo(() => {
    return ENGINEERING_BLUEPRINTS.filter((bp) => {
      const matchesDiscipline =
        selectedDiscipline === 'ALL' || bp.discipline === selectedDiscipline;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesDiscipline;
      return (
        matchesDiscipline &&
        (bp.title.toLowerCase().includes(q) ||
          bp.shortSummary.toLowerCase().includes(q) ||
          bp.engineeringGoal.toLowerCase().includes(q) ||
          bp.disciplineLabel.toLowerCase().includes(q))
      );
    });
  }, [selectedDiscipline, searchQuery]);

  // Select a blueprint and load its defaults
  const handleSelectBlueprint = (
    bp: EngineeringBlueprint,
    jumpToBuilder = false
  ) => {
    setActiveBlueprintId(bp.id);
    setActiveFramework(bp.recommendedFramework);
    setUnitSystem(bp.defaultUnitSystem);
    setActiveConstraints([...bp.defaultConstraints]);
    const newBlocks = buildBlocksForFramework(
      bp.canonical,
      bp.recommendedFramework
    );
    setBlocks(newBlocks);
    if (newBlocks.length > 0) {
      setExpandedBlockIds([newBlocks[0].id, newBlocks[1]?.id].filter(Boolean));
    }
    const nextVars: Record<string, string> = {};
    for (const v of bp.variables) {
      nextVars[v.key] = v.defaultValue;
    }
    setVariableValues(nextVars);
    if (jumpToBuilder) {
      setActivePage('BUILDER');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Switch Framework while preserving current canonical/custom edits
  const handleSwitchFramework = (nextFramework: FrameworkId) => {
    setActiveFramework(nextFramework);
    setBlocks((prevBlocks) => {
      const updated = buildBlocksForFramework(
        activeBlueprint.canonical,
        nextFramework,
        prevBlocks
      );
      setExpandedBlockIds([updated[0]?.id, updated[1]?.id].filter(Boolean));
      return updated;
    });
  };

  // Reset current blueprint to factory defaults
  const handleResetBlueprint = () => {
    handleSelectBlueprint(activeBlueprint, false);
  };

  // Detect all variables (both predefined in blueprint + custom {{var}} typed by user)
  const detectedVarKeys = useMemo(
    () => extractVariablesFromBlocks(blocks),
    [blocks]
  );

  const allVariableSlots = useMemo(() => {
    const map = new Map<
      string,
      {
        key: string;
        label: string;
        placeholder: string;
        presets: string[];
        isCustom: boolean;
      }
    >();

    for (const v of activeBlueprint.variables) {
      map.set(v.key, {
        key: v.key,
        label: v.label,
        placeholder: v.placeholder,
        presets: v.presets,
        isCustom: false,
      });
    }

    for (const detectedKey of detectedVarKeys) {
      if (!map.has(detectedKey)) {
        map.set(detectedKey, {
          key: detectedKey,
          label: detectedKey
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase()),
          placeholder: `Enter engineering value for {{${detectedKey}}}...`,
          presets: [],
          isCustom: true,
        });
      }
    }

    return Array.from(map.values());
  }, [activeBlueprint, detectedVarKeys]);

  // Compile prompt in real time
  const compiled = useMemo(
    () =>
      compileEngineeringPrompt({
        blueprintTitle: activeBlueprint.title,
        disciplineLabel: activeBlueprint.disciplineLabel,
        framework: activeFramework,
        blocks,
        variableValues,
        unitSystem,
        activeConstraintIds: activeConstraints,
        allConstraints: CONSTRAINT_MODULES,
        outputFormat,
      }),
    [
      activeBlueprint,
      activeFramework,
      blocks,
      variableValues,
      unitSystem,
      activeConstraints,
      outputFormat,
    ]
  );

  const interpolatedWeakPrompt = useMemo(
    () =>
      interpolateVariables(activeBlueprint.weakPromptBaseline, variableValues),
    [activeBlueprint.weakPromptBaseline, variableValues]
  );

  const filledVarCount = useMemo(() => {
    return allVariableSlots.filter(
      (s) => variableValues[s.key] && variableValues[s.key].trim().length > 0
    ).length;
  }, [allVariableSlots, variableValues]);

  // Handlers for Blocks
  const handleToggleBlock = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, enabled: !b.enabled } : b))
    );
  };

  const handleToggleExpandBlock = (blockId: string) => {
    setExpandedBlockIds((prev) =>
      prev.includes(blockId)
        ? prev.filter((id) => id !== blockId)
        : [...prev, blockId]
    );
  };

  const handleUpdateBlockContent = (blockId: string, content: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, content } : b))
    );
  };

  const handleMoveBlock = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    setBlocks((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleDeleteCustomBlock = (blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  };

  const handleAddCustomBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockTitle.trim() || !newBlockContent.trim()) return;
    const cleanCode = (newBlockCode.trim() || 'SPEC')
      .toUpperCase()
      .slice(0, 6);
    const xmlSlug = newBlockTitle
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');

    const customBlock: PromptBlock = {
      id: `custom-${Date.now()}`,
      code: cleanCode,
      title: newBlockTitle.trim(),
      subtitle: 'User-defined custom engineering specification block',
      xmlTag: xmlSlug || 'custom_specification',
      enabled: true,
      content: newBlockContent.trim(),
      sourceSlot: 'CUSTOM',
    };

    setBlocks((prev) => [...prev, customBlock]);
    setExpandedBlockIds((prev) => [...prev, customBlock.id]);
    setNewBlockTitle('');
    setNewBlockContent('');
    setShowAddBlockForm(false);
  };

  // Constraint Toggle Handler
  const handleToggleConstraint = (constraintId: string) => {
    setActiveConstraints((prev) =>
      prev.includes(constraintId)
        ? prev.filter((id) => id !== constraintId)
        : [...prev, constraintId]
    );
  };

  // Copy & Download Actions
  const handleCopyPrompt = (textToCopy = compiled.fullText, label = 'main') => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedState(label);
    setTimeout(() => {
      setCopiedState(null);
    }, 1800);
  };

  const handleDownloadPrompt = () => {
    const ext =
      outputFormat === 'JSON' ? 'json' : outputFormat === 'XML' ? 'xml' : 'md';
    const mime =
      outputFormat === 'JSON' ? 'application/json' : 'text/plain;charset=utf-8';
    const blob = new Blob([compiled.fullText], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const slug = activeBlueprint.id.replace(/[^a-z0-9-]/gi, '-');
    a.href = url;
    a.download = `prompt-toolbox-${slug}-${activeFramework.toLowerCase()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Save & Load Custom Recipes
  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName =
      recipeNameInput.trim() ||
      `${activeBlueprint.title} (${activeFramework})`;
    const recipe: SavedRecipe = {
      id: `recipe-${Date.now()}`,
      name: finalName,
      disciplineLabel: activeBlueprint.disciplineLabel,
      framework: activeFramework,
      unitSystem,
      outputFormat,
      createdAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      blocks: blocks.map((b) => ({ ...b })),
      variableValues: { ...variableValues },
      activeConstraints: [...activeConstraints],
      sourceBlueprintId: activeBlueprint.id,
    };
    setSavedRecipes((prev) => [recipe, ...prev]);
    setRecipeNameInput('');
    setShowSaveModal(false);
    setCopiedState('saved');
    setTimeout(() => setCopiedState(null), 1800);
  };

  const handleLoadRecipe = (recipe: SavedRecipe) => {
    setActiveBlueprintId(recipe.sourceBlueprintId);
    setActiveFramework(recipe.framework);
    setUnitSystem(recipe.unitSystem);
    setOutputFormat(recipe.outputFormat);
    setBlocks(recipe.blocks.map((b) => ({ ...b })));
    setVariableValues({ ...recipe.variableValues });
    setActiveConstraints([...recipe.activeConstraints]);
    setActivePage('BUILDER');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteRecipe = (recipeId: string) => {
    setSavedRecipes((prev) => prev.filter((r) => r.id !== recipeId));
  };

  const currentFrameworkMeta = useMemo(
    () => FRAMEWORKS.find((f) => f.id === activeFramework) || FRAMEWORKS[0],
    [activeFramework]
  );

  const passedRubricCount = useMemo(
    () => compiled.completenessChecklist.filter((c) => c.passed).length,
    [compiled.completenessChecklist]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 drafting-grid">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-300 px-6 py-3.5">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <button
            type="button"
            onClick={() => setActivePage('BUILDER')}
            className="text-2xl font-extrabold tracking-tight text-slate-950 font-display whitespace-nowrap shrink-0 cursor-pointer"
          >
            Prompt-Toolbox
          </button>

          {/* Zone 2: 4 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-[15px] font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setActivePage('BUILDER')}
              className={`hover:text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activePage === 'BUILDER'
                  ? 'text-slate-950 font-bold underline underline-offset-8 decoration-2 decoration-sky-600'
                  : ''
              }`}
            >
              Express Builder
            </button>
            <button
              type="button"
              onClick={() => setActivePage('CATALOG')}
              className={`hover:text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activePage === 'CATALOG'
                  ? 'text-slate-950 font-bold underline underline-offset-8 decoration-2 decoration-sky-600'
                  : ''
              }`}
            >
              Blueprint Catalog
            </button>
            <button
              type="button"
              onClick={() => setActivePage('TECHNICAL_DOCS')}
              className={`hover:text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activePage === 'TECHNICAL_DOCS'
                  ? 'text-slate-950 font-bold underline underline-offset-8 decoration-2 decoration-sky-600'
                  : ''
              }`}
            >
              Technical Reference
            </button>
            <button
              type="button"
              onClick={() => setActivePage('SAVED')}
              className={`hover:text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activePage === 'SAVED'
                  ? 'text-slate-950 font-bold underline underline-offset-8 decoration-2 decoration-sky-600'
                  : ''
              }`}
            >
              Saved Library
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => handleCopyPrompt(compiled.fullText, 'header')}
              className="px-4 py-2.5 text-sm font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
            >
              {copiedState === 'header' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Compiled Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE VIEW SWITCHER */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center gap-1.5 overflow-x-auto">
        {(
          [
            { id: 'BUILDER', label: 'Express Builder' },
            { id: 'CATALOG', label: 'Blueprints (15)' },
            { id: 'TECHNICAL_DOCS', label: 'Technical Reference' },
            { id: 'SAVED', label: `Saved (${savedRecipes.length})` },
          ] as { id: ActivePage; label: string }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActivePage(tab.id)}
            className={`px-3.5 py-1.5 text-sm font-semibold rounded-md whitespace-nowrap shrink-0 ${
              activePage === tab.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN CONTAINER (1440px Desktop Baseline with Clear Visual Hierarchy) */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-7">
        {/* =====================================================================
            PAGE 1: EXPRESS BUILDER (CLEAR 3-TIER VISUAL HIERARCHY & LEGIBILITY)
           ===================================================================== */}
        {activePage === 'BUILDER' && (
          <div className="space-y-6">
            {/* TIER 1: GOAL & BLUEPRINT SELECTION HEADER BANNER */}
            <div className="bg-white border border-slate-300 rounded-xl p-6 shadow-2xs space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <div className="text-xs font-bold tracking-wide text-sky-700">
                    Active Engineering Goal & Blueprint
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 font-display leading-tight">
                    {activeBlueprint.title}
                  </h1>
                  <p className="text-base text-slate-700">
                    {activeBlueprint.engineeringGoal}
                  </p>
                </div>

                {/* Right: Status & Quick Actions */}
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActivePage('TECHNICAL_DOCS')}
                    className="px-3.5 py-2 text-sm font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-sky-700" />
                    <span>Read Full Technical Explanation</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetBlueprint}
                    className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Defaults</span>
                  </button>
                </div>
              </div>

              {/* Fast Switcher Row: Discipline + Blueprint Dropdown + Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-3 space-y-1.5">
                  <label
                    htmlFor="quick-discipline-select"
                    className="block text-sm font-bold text-slate-900"
                  >
                    Engineering Discipline
                  </label>
                  <select
                    id="quick-discipline-select"
                    value={selectedDiscipline}
                    onChange={(e) => {
                      const nextDisc = e.target.value as EngineeringDiscipline;
                      setSelectedDiscipline(nextDisc);
                      const matching =
                        nextDisc === 'ALL'
                          ? ENGINEERING_BLUEPRINTS
                          : ENGINEERING_BLUEPRINTS.filter(
                              (b) => b.discipline === nextDisc
                            );
                      if (
                        matching.length > 0 &&
                        !matching.some((b) => b.id === activeBlueprintId)
                      ) {
                        handleSelectBlueprint(matching[0], false);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-600 cursor-pointer"
                  >
                    {DISCIPLINE_TABS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.label} ({d.count})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-6 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="quick-blueprint-select"
                      className="block text-sm font-bold text-slate-900"
                    >
                      Select Engineering Blueprint Template
                    </label>
                    <button
                      type="button"
                      onClick={() => setActivePage('CATALOG')}
                      className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 whitespace-nowrap cursor-pointer"
                    >
                      <span>Browse All 15 Blueprints</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <select
                    id="quick-blueprint-select"
                    value={activeBlueprint.id}
                    onChange={(e) => {
                      const found = ENGINEERING_BLUEPRINTS.find(
                        (b) => b.id === e.target.value
                      );
                      if (found) handleSelectBlueprint(found, false);
                    }}
                    className="w-full px-3.5 py-2.5 text-sm font-semibold bg-white border border-slate-300 rounded-lg text-slate-950 focus:outline-none focus:border-sky-600 cursor-pointer truncate"
                  >
                    {(selectedDiscipline === 'ALL'
                      ? ENGINEERING_BLUEPRINTS
                      : ENGINEERING_BLUEPRINTS.filter(
                          (b) => b.discipline === selectedDiscipline
                        )
                    ).map((bp) => (
                      <option key={bp.id} value={bp.id}>
                        [{bp.disciplineLabel}] {bp.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-3 p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-sm font-mono tabular-nums text-slate-800">
                  <div>
                    <div className="text-xs font-sans font-semibold text-slate-500">
                      Readiness Status
                    </div>
                    <div className="font-bold text-slate-950">
                      {filledVarCount}/{allVariableSlots.length} Params ·{' '}
                      <span
                        className={
                          passedRubricCount === 6
                            ? 'text-emerald-700'
                            : 'text-amber-700'
                        }
                      >
                        {passedRubricCount}/6 Spec
                      </span>
                    </div>
                  </div>
                  <Clock className="w-5 h-5 text-sky-600 shrink-0" />
                </div>
              </div>
            </div>

            {/* TWO-ZONE SPLIT WORKBENCH: LEFT 7 COLS (RAPID BUILDER) | RIGHT 5 COLS (LIVE COMPILER) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
              {/* LEFT 7 COLUMNS: PROMPT FRAMEWORK EXPLANATION + STEPPED BUILDER */}
              <div className="lg:col-span-7 space-y-6">
                {/* ALWAYS-VISIBLE PROMPT FRAMEWORK SELECTOR & EXPLANATION */}
                <div className="bg-white border border-slate-300 rounded-xl p-6 space-y-5 shadow-2xs">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <h2 className="text-xl font-bold text-slate-950 font-display">
                        Prompt Framework Architecture & Explanation
                      </h2>
                      <p className="text-sm text-slate-600 mt-0.5">
                        Choose a structural framework below. Switching frameworks automatically remaps your parameters and blocks.
                      </p>
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-600">
                      Recommended: {activeBlueprint.recommendedFramework}
                    </span>
                  </div>

                  {/* 4 Framework Selector Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {FRAMEWORKS.map((fw) => {
                      const isSelected = activeFramework === fw.id;
                      return (
                        <button
                          key={fw.id}
                          type="button"
                          onClick={() => handleSwitchFramework(fw.id)}
                          className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-sky-50 border-sky-600 ring-1 ring-sky-600 text-slate-950'
                              : 'bg-slate-50/80 border-slate-300 text-slate-800 hover:bg-white hover:border-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-sm font-bold font-mono text-slate-950 whitespace-nowrap">
                              {fw.id}
                            </span>
                            {isSelected && (
                              <span className="text-xs font-bold text-sky-700">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5 text-xs text-slate-600 font-mono truncate">
                            {fw.blockCodes.join(' → ')}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* High-Contrast Framework Explanation Callout */}
                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-300 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-950">
                        {currentFrameworkMeta.name}{' '}
                        <span className="font-mono text-sm font-semibold text-sky-700 ml-1">
                          ({currentFrameworkMeta.tagline})
                        </span>
                      </h3>
                      <span className="font-mono text-xs font-semibold text-slate-700">
                        Block Flow: {currentFrameworkMeta.blockCodes.join(' → ')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed">
                      {currentFrameworkMeta.description}
                    </p>
                    <div className="text-sm text-slate-700 pt-1 border-t border-slate-200">
                      <strong className="font-bold text-slate-900">
                        Best suited for:
                      </strong>{' '}
                      {currentFrameworkMeta.bestFor}
                    </div>
                  </div>
                </div>

                {/* RAPID WORKFLOW STAGE NAVIGATION BAR */}
                <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-2xs">
                  <div className="border-b border-slate-300 bg-slate-100 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div
                      role="tablist"
                      aria-label="Prompt Assembly Steps"
                      className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/90 rounded-lg"
                    >
                      <button
                        type="button"
                        role="tab"
                        aria-selected={builderStage === 'PARAMETERS'}
                        onClick={() => setBuilderStage('PARAMETERS')}
                        className={`px-3.5 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          builderStage === 'PARAMETERS'
                            ? 'bg-white text-slate-950 shadow-2xs'
                            : 'text-slate-700 hover:text-slate-950'
                        }`}
                      >
                        01. Parameters{' '}
                        <span className="font-mono tabular-nums text-sky-700 ml-1">
                          ({filledVarCount}/{allVariableSlots.length})
                        </span>
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={builderStage === 'STANDARDS'}
                        onClick={() => setBuilderStage('STANDARDS')}
                        className={`px-3.5 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          builderStage === 'STANDARDS'
                            ? 'bg-white text-slate-950 shadow-2xs'
                            : 'text-slate-700 hover:text-slate-950'
                        }`}
                      >
                        02. Standards & Units{' '}
                        <span className="font-mono tabular-nums text-sky-700 ml-1">
                          ({activeConstraints.length} · {unitSystem})
                        </span>
                      </button>
                      <button
                        type="button"
                        role="tab"
                        aria-selected={builderStage === 'BLOCKS'}
                        onClick={() => setBuilderStage('BLOCKS')}
                        className={`px-3.5 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          builderStage === 'BLOCKS'
                            ? 'bg-white text-slate-950 shadow-2xs'
                            : 'text-slate-700 hover:text-slate-950'
                        }`}
                      >
                        03. Modular Blocks{' '}
                        <span className="font-mono tabular-nums text-sky-700 ml-1">
                          ({blocks.filter((b) => b.enabled).length}/
                          {blocks.length})
                        </span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setBuilderStage((prev) =>
                          prev === 'ALL_OPEN' ? 'PARAMETERS' : 'ALL_OPEN'
                        )
                      }
                      className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-white border border-slate-300 rounded-md whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {builderStage === 'ALL_OPEN'
                        ? 'Use Step-by-Step View'
                        : 'Expand All 3 Steps'}
                    </button>
                  </div>

                  <div className="p-6 space-y-8">
                    {/* STAGE 1: BOUNDARY PARAMETERS & VARIABLES */}
                    {(builderStage === 'PARAMETERS' ||
                      builderStage === 'ALL_OPEN') && (
                      <div className="space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                          <div>
                            <h3 className="text-xl font-bold text-slate-950 font-display">
                              01. Engineering Boundary Parameters
                            </h3>
                            <p className="text-sm text-slate-600 mt-0.5">
                              Fill in your part geometry, loads, or process conditions. Values inject directly into{' '}
                              <code className="font-mono font-semibold text-sky-700">
                                {'{{variable}}'}
                              </code>{' '}
                              placeholders.
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const next: Record<string, string> = {};
                                for (const v of activeBlueprint.variables) {
                                  next[v.key] = v.defaultValue;
                                }
                                setVariableValues((prev) => ({
                                  ...prev,
                                  ...next,
                                }));
                              }}
                              className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              Restore Sample Values
                            </button>
                            <button
                              type="button"
                              onClick={() => setVariableValues({})}
                              className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              Clear All
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {allVariableSlots.map((slot, index) => {
                            const currentValue =
                              variableValues[slot.key] ?? '';
                            const isUnfilled = !currentValue.trim();
                            return (
                              <div
                                key={slot.key}
                                className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-3"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <label
                                    htmlFor={`var-${slot.key}`}
                                    className="text-base font-bold text-slate-950 flex items-center gap-2"
                                  >
                                    <span className="font-mono text-sm text-slate-500">
                                      1.{index + 1}
                                    </span>
                                    <span>{slot.label}</span>
                                    <span
                                      aria-hidden="true"
                                      className="text-slate-300"
                                    >
                                      ·
                                    </span>
                                    <code className="font-mono text-xs font-semibold text-sky-700">
                                      {`{{${slot.key}}}`}
                                    </code>
                                  </label>

                                  <div className="flex items-center gap-2.5">
                                    {slot.presets.length > 0 && (
                                      <select
                                        aria-label={`Quick preset for ${slot.label}`}
                                        value={
                                          slot.presets.includes(currentValue)
                                            ? currentValue
                                            : ''
                                        }
                                        onChange={(e) => {
                                          if (e.target.value) {
                                            setVariableValues((prev) => ({
                                              ...prev,
                                              [slot.key]: e.target.value,
                                            }));
                                          }
                                        }}
                                        className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded-md text-slate-800 max-w-[240px] truncate cursor-pointer"
                                      >
                                        <option value="">
                                          Load sample preset ({slot.presets.length})...
                                        </option>
                                        {slot.presets.map((preset, idx) => (
                                          <option key={idx} value={preset}>
                                            {preset}
                                          </option>
                                        ))}
                                      </select>
                                    )}
                                    {isUnfilled ? (
                                      <span className="text-xs font-bold text-amber-700 flex items-center gap-1 whitespace-nowrap">
                                        <AlertTriangle className="w-3.5 h-3.5" />
                                        <span>Missing</span>
                                      </span>
                                    ) : (
                                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 whitespace-nowrap">
                                        <Check className="w-3.5 h-3.5" />
                                        <span>Specified</span>
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <input
                                  id={`var-${slot.key}`}
                                  type="text"
                                  value={currentValue}
                                  onChange={(e) =>
                                    setVariableValues((prev) => ({
                                      ...prev,
                                      [slot.key]: e.target.value,
                                    }))
                                  }
                                  placeholder={slot.placeholder}
                                  className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-slate-300 rounded-lg text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-sky-600"
                                />
                              </div>
                            );
                          })}
                        </div>

                        {builderStage === 'PARAMETERS' && (
                          <div className="pt-3 flex items-center justify-between border-t border-slate-200">
                            <span className="text-sm text-slate-600">
                              Prompt is live on the right. Configure units & ASME/ISO standards next:
                            </span>
                            <button
                              type="button"
                              onClick={() => setBuilderStage('STANDARDS')}
                              className="px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
                            >
                              <span>Next: 02. Standards & Units</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* STAGE 2: STANDARDS, UNIT SYSTEM & RIGOR INJECTORS */}
                    {(builderStage === 'STANDARDS' ||
                      builderStage === 'ALL_OPEN') && (
                      <div
                        className={`space-y-5 ${
                          builderStage === 'ALL_OPEN'
                            ? 'pt-8 border-t border-slate-300'
                            : ''
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
                          <div>
                            <h3 className="text-xl font-bold text-slate-950 font-display">
                              02. Unit System & Engineering Standard Injectors
                            </h3>
                            <p className="text-sm text-slate-600 mt-0.5">
                              Enforce unit consistency and governing engineering codes with one click.
                            </p>
                          </div>

                          {/* Unit System Selector */}
                          <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg">
                            {(
                              [
                                { id: 'SI', label: 'SI Metric (mm, MPa)' },
                                { id: 'IMPERIAL', label: 'Imperial (in, psi)' },
                                { id: 'DUAL', label: 'Dual SI + Imp' },
                              ] as { id: UnitSystem; label: string }[]
                            ).map((u) => (
                              <button
                                key={u.id}
                                type="button"
                                onClick={() => setUnitSystem(u.id)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                  unitSystem === u.id
                                    ? 'bg-white text-slate-950 shadow-2xs'
                                    : 'text-slate-700 hover:text-slate-950'
                                }`}
                              >
                                {u.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Category Tabs for Constraint Modules */}
                        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-lg">
                          {CONSTRAINT_CATEGORY_LABELS.map((cat) => {
                            const activeInCat = CONSTRAINT_MODULES.filter(
                              (c) =>
                                c.category === cat.id &&
                                activeConstraints.includes(c.id)
                            ).length;
                            const isTab = activeConstraintTab === cat.id;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => setActiveConstraintTab(cat.id)}
                                className={`px-3.5 py-2 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                  isTab
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-700 hover:text-slate-950'
                                }`}
                              >
                                {cat.label}{' '}
                                <span
                                  className={`font-mono tabular-nums ml-1 ${
                                    isTab ? 'text-sky-300' : 'text-sky-700'
                                  }`}
                                >
                                  ({activeInCat})
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Constraint Module Cards in Selected Category */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {CONSTRAINT_MODULES.filter(
                            (c) => c.category === activeConstraintTab
                          ).map((constraint) => {
                            const isChecked = activeConstraints.includes(
                              constraint.id
                            );
                            return (
                              <button
                                key={constraint.id}
                                type="button"
                                onClick={() =>
                                  handleToggleConstraint(constraint.id)
                                }
                                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                                  isChecked
                                    ? 'bg-sky-50/70 border-sky-600 ring-1 ring-sky-600'
                                    : 'bg-slate-50 border-slate-300 hover:bg-white hover:border-slate-400'
                                }`}
                              >
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs font-mono font-bold text-sky-800">
                                      {constraint.shortCode}
                                    </span>
                                    <span
                                      className={`text-xs font-bold ${
                                        isChecked
                                          ? 'text-emerald-700'
                                          : 'text-slate-500'
                                      }`}
                                    >
                                      {isChecked ? '✓ Injected' : '+ Inject'}
                                    </span>
                                  </div>
                                  <div className="text-sm font-bold text-slate-950">
                                    {constraint.label}
                                  </div>
                                  <p className="text-xs text-slate-700 leading-relaxed">
                                    {constraint.description}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        {builderStage === 'STANDARDS' && (
                          <div className="pt-3 flex items-center justify-between border-t border-slate-200">
                            <button
                              type="button"
                              onClick={() => setBuilderStage('PARAMETERS')}
                              className="text-sm font-semibold text-slate-700 hover:text-slate-950 cursor-pointer"
                            >
                              ← Back to 01. Parameters
                            </button>
                            <button
                              type="button"
                              onClick={() => setBuilderStage('BLOCKS')}
                              className="px-4 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer"
                            >
                              <span>Next: 03. Modular Blocks</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* STAGE 3: MODULAR FRAMEWORK BLOCKS COMPOSER */}
                    {(builderStage === 'BLOCKS' ||
                      builderStage === 'ALL_OPEN') && (
                      <div
                        className={`space-y-5 ${
                          builderStage === 'ALL_OPEN'
                            ? 'pt-8 border-t border-slate-300'
                            : ''
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                          <div>
                            <h3 className="text-xl font-bold text-slate-950 font-display">
                              03. Modular Prompt Blocks ({activeFramework})
                            </h3>
                            <p className="text-sm text-slate-600 mt-0.5">
                              Click any block header to expand and edit its instructions, reorder blocks, or add custom sections.
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (expandedBlockIds.length === blocks.length) {
                                  setExpandedBlockIds([]);
                                } else {
                                  setExpandedBlockIds(blocks.map((b) => b.id));
                                }
                              }}
                              className="px-3 py-1.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              {expandedBlockIds.length === blocks.length
                                ? 'Collapse All Blocks'
                                : 'Expand All Blocks'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowAddBlockForm((v) => !v)}
                              className="px-3.5 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Custom Block</span>
                            </button>
                          </div>
                        </div>

                        {/* Add Custom Block Form */}
                        {showAddBlockForm && (
                          <form
                            onSubmit={handleAddCustomBlock}
                            className="p-5 rounded-xl bg-slate-50 border border-slate-300 space-y-4"
                          >
                            <div className="text-sm font-bold text-slate-950">
                              Create Custom Engineering Specification Block
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                              <div>
                                <label className="block text-xs font-bold text-slate-800 mb-1">
                                  Block Code (e.g., BOM)
                                </label>
                                <input
                                  type="text"
                                  maxLength={6}
                                  value={newBlockCode}
                                  onChange={(e) =>
                                    setNewBlockCode(e.target.value)
                                  }
                                  className="w-full px-3 py-2 text-sm font-mono bg-white border border-slate-300 rounded-md"
                                  required
                                />
                              </div>
                              <div className="sm:col-span-3">
                                <label className="block text-xs font-bold text-slate-800 mb-1">
                                  Block Heading Title
                                </label>
                                <input
                                  type="text"
                                  value={newBlockTitle}
                                  onChange={(e) =>
                                    setNewBlockTitle(e.target.value)
                                  }
                                  placeholder="e.g., Supplier Metrology & First Article Inspection Requirements"
                                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md"
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-800 mb-1">
                                Block Directive Content (Tip: use{' '}
                                {'{{custom_variable}}'} to create a new input field automatically)
                              </label>
                              <textarea
                                rows={3}
                                value={newBlockContent}
                                onChange={(e) =>
                                  setNewBlockContent(e.target.value)
                                }
                                placeholder="Specify custom inspection criteria, fixture datum targets, or legacy part constraints..."
                                className="w-full p-3 text-sm font-mono bg-white border border-slate-300 rounded-md"
                                required
                              />
                            </div>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setShowAddBlockForm(false)}
                                className="px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="px-4 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-md cursor-pointer"
                              >
                                Append Block to Prompt
                              </button>
                            </div>
                          </form>
                        )}

                        {/* Modular Block Accordion List */}
                        <div className="space-y-3">
                          {blocks.map((block, index) => {
                            const isExpanded = expandedBlockIds.includes(
                              block.id
                            );
                            return (
                              <div
                                key={block.id}
                                onMouseEnter={() => setHoveredBlockId(block.id)}
                                onMouseLeave={() => setHoveredBlockId(null)}
                                className={`rounded-xl border transition-colors ${
                                  block.enabled
                                    ? hoveredBlockId === block.id
                                      ? 'bg-slate-50 border-sky-600'
                                      : 'bg-slate-50/70 border-slate-300'
                                    : 'bg-slate-100 border-slate-200 opacity-60'
                                }`}
                              >
                                <div className="p-3.5 flex flex-wrap items-center justify-between gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleToggleExpandBlock(block.id)
                                    }
                                    className="flex items-center gap-3 text-left flex-1 min-w-0 cursor-pointer"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="w-4 h-4 text-slate-600 shrink-0" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                                    )}
                                    <span className="font-mono text-xs font-bold text-sky-800 bg-sky-100/80 border border-sky-300 px-2.5 py-0.5 rounded shrink-0">
                                      {block.code}
                                    </span>
                                    <div className="min-w-0">
                                      <h4 className="text-base font-bold text-slate-950 truncate">
                                        {block.title}
                                      </h4>
                                      <p className="text-xs text-slate-600 truncate">
                                        {block.subtitle}
                                      </p>
                                    </div>
                                  </button>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleMoveBlock(index, -1)}
                                      disabled={index === 0}
                                      title="Move block up"
                                      className="p-1.5 text-slate-600 hover:text-slate-950 disabled:opacity-30 cursor-pointer"
                                    >
                                      <ArrowUp className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleMoveBlock(index, 1)}
                                      disabled={index === blocks.length - 1}
                                      title="Move block down"
                                      className="p-1.5 text-slate-600 hover:text-slate-950 disabled:opacity-30 cursor-pointer"
                                    >
                                      <ArrowDown className="w-4 h-4" />
                                    </button>

                                    {block.sourceSlot === 'CUSTOM' && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteCustomBlock(block.id)
                                        }
                                        title="Remove custom block"
                                        className="p-1.5 text-rose-600 hover:text-rose-800 cursor-pointer"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    )}

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleToggleBlock(block.id)
                                      }
                                      className={`ml-1 px-3 py-1 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                        block.enabled
                                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                          : 'bg-slate-200 text-slate-700'
                                      }`}
                                    >
                                      {block.enabled ? 'Enabled' : 'Muted'}
                                    </button>
                                  </div>
                                </div>

                                {block.enabled && isExpanded && (
                                  <div className="px-4 pb-4 pt-1">
                                    <textarea
                                      rows={Math.min(
                                        8,
                                        Math.max(
                                          3,
                                          block.content.split('\n').length + 1
                                        )
                                      )}
                                      value={block.content}
                                      onChange={(e) =>
                                        handleUpdateBlockContent(
                                          block.id,
                                          e.target.value
                                        )
                                      }
                                      className="w-full p-3 text-sm font-mono leading-relaxed bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-sky-600"
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT 5 COLUMNS: LIVE PROMPT COMPILER & SPEC INSPECTOR (Sticky, High Legibility) */}
              <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
                <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-xl overflow-hidden shadow-md">
                  {/* Compiler Top Controls */}
                  <div className="p-5 border-b border-slate-800 space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-mono font-semibold text-sky-400">
                          LIVE DETERMINISTIC COMPILER
                        </div>
                        <h2 className="text-lg font-bold text-white font-display">
                          Compiled Engineering Prompt
                        </h2>
                      </div>

                      {/* Tabular Metrics */}
                      <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-300">
                        <span>{compiled.wordCount} words</span>
                        <span aria-hidden="true" className="text-slate-600">
                          ·
                        </span>
                        <span>~{compiled.estimatedTokens} tokens</span>
                      </div>
                    </div>

                    {/* View Mode & Output Format Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      {/* View Mode Switcher */}
                      <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg">
                        <button
                          type="button"
                          onClick={() => setInspectorTab('COMPILED')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            inspectorTab === 'COMPILED'
                              ? 'bg-sky-600 text-white'
                              : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          Compiled Output
                        </button>
                        <button
                          type="button"
                          onClick={() => setInspectorTab('CHECKLIST')}
                          className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            inspectorTab === 'CHECKLIST'
                              ? 'bg-sky-600 text-white'
                              : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          Spec Rubric ({passedRubricCount}/6)
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivePage('TECHNICAL_DOCS')}
                          className="px-2.5 py-1.5 text-xs font-bold text-sky-300 hover:text-white rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Full Explanation ↗
                        </button>
                      </div>

                      {/* Format Switcher */}
                      {inspectorTab === 'COMPILED' && (
                        <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg">
                          {(
                            [
                              { id: 'MARKDOWN', label: 'MD', icon: FileText },
                              { id: 'XML', label: 'XML', icon: FileCode },
                              { id: 'JSON', label: 'JSON', icon: Braces },
                            ] as const
                          ).map((fmt) => {
                            const Icon = fmt.icon;
                            return (
                              <button
                                key={fmt.id}
                                type="button"
                                onClick={() => setOutputFormat(fmt.id)}
                                className={`px-2.5 py-1 text-xs font-mono rounded transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer ${
                                  outputFormat === fmt.id
                                    ? 'bg-slate-700 text-sky-300 font-bold'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{fmt.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Compiler Viewport Body (Upgraded to 13.5px–14px high-contrast monospace) */}
                  <div className="p-5 max-h-[540px] overflow-y-auto font-mono text-[13.5px] leading-relaxed">
                    {inspectorTab === 'COMPILED' && (
                      <div className="space-y-4">
                        {outputFormat === 'JSON' ? (
                          <pre className="whitespace-pre-wrap break-words text-slate-100">
                            {compiled.fullText}
                          </pre>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-slate-300 border-b border-slate-800 pb-3">
                              <div className="text-sky-300 font-bold text-sm">
                                {outputFormat === 'MARKDOWN'
                                  ? `# ENGINEERING SPECIFICATION PROMPT: ${activeBlueprint.title.toUpperCase()}`
                                  : `<engineering_prompt blueprint="${activeBlueprint.title}" framework="${activeFramework}" units="${unitSystem}">`}
                              </div>
                              <div className="text-xs text-slate-400 mt-1">
                                Discipline: {activeBlueprint.disciplineLabel} ·
                                Framework: {activeFramework} · Units:{' '}
                                {unitSystem}
                              </div>
                            </div>

                            {compiled.segments.map((seg) => {
                              const isHovered = hoveredBlockId === seg.blockId;
                              return (
                                <div
                                  key={seg.blockId}
                                  className={`p-3.5 rounded-lg border transition-colors ${
                                    isHovered
                                      ? 'bg-sky-950/70 border-sky-400'
                                      : 'bg-slate-950/70 border-slate-800'
                                  }`}
                                >
                                  <div className="text-sky-300 font-bold text-sm mb-1.5">
                                    {outputFormat === 'MARKDOWN'
                                      ? `## [${seg.code}] ${seg.title}`
                                      : `<${seg.xmlTag} code="${seg.code}">`}
                                  </div>
                                  <div className="whitespace-pre-wrap break-words text-slate-100">
                                    {seg.renderedText}
                                  </div>
                                  {outputFormat === 'XML' && (
                                    <div className="text-sky-300 font-bold mt-1.5">
                                      {`</${seg.xmlTag}>`}
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            {outputFormat === 'XML' && (
                              <div className="text-sky-300 font-bold">
                                {`</engineering_prompt>`}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {inspectorTab === 'CHECKLIST' && (
                      <div className="space-y-3.5 font-sans">
                        <div className="flex items-center justify-between text-sm text-slate-200 border-b border-slate-800 pb-2.5">
                          <span className="font-semibold">
                            6-Point Engineering Spec Rubric
                          </span>
                          <span className="font-mono font-bold text-sky-400">
                            {compiled.completenessScoreText}
                          </span>
                        </div>
                        {compiled.completenessChecklist.map((item) => (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-start gap-3"
                          >
                            {item.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            )}
                            <div className="space-y-1">
                              <div className="text-sm font-bold text-white">
                                {item.label}{' '}
                                <span
                                  className={`ml-1 font-mono text-xs ${
                                    item.passed
                                      ? 'text-emerald-400'
                                      : 'text-amber-400'
                                  }`}
                                >
                                  [{item.passed ? 'PASS' : 'NEEDS ATTENTION'}]
                                </span>
                              </div>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {item.detail}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Bar Footer */}
                  <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyPrompt(compiled.fullText, 'panel')
                        }
                        className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
                      >
                        {copiedState === 'panel' ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Copied Compiled Spec</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy Compiled Prompt</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadPrompt}
                        className="px-3.5 py-2.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setRecipeNameInput(
                            `${activeBlueprint.title} (${activeFramework})`
                          );
                          setShowSaveModal((v) => !v);
                        }}
                        className="px-3.5 py-2.5 text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Bookmark className="w-4 h-4" />
                        <span>
                          {copiedState === 'saved' ? 'Saved!' : 'Save Recipe'}
                        </span>
                      </button>
                    </div>

                    {/* Inline Save Recipe Form */}
                    {showSaveModal && (
                      <form
                        onSubmit={handleSaveRecipe}
                        className="pt-2 border-t border-slate-800 flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={recipeNameInput}
                          onChange={(e) => setRecipeNameInput(e.target.value)}
                          placeholder="Custom recipe title..."
                          className="flex-1 px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:border-sky-500"
                          required
                        />
                        <button
                          type="submit"
                          className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md whitespace-nowrap cursor-pointer"
                        >
                          Confirm Save
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            PAGE 2: BLUEPRINT CATALOG (FULL 15-BLUEPRINT BROWSER & GOAL PICKER)
           ===================================================================== */}
        {activePage === 'CATALOG' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-300 pb-6">
              <div className="space-y-2 max-w-3xl">
                <div className="text-xs font-bold text-sky-700 flex items-center gap-2">
                  <span>15 Curated Engineering Blueprints</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    Mechanical · Product/DFM · Manufacturing · Process · Analysis
                  </span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-950 font-display">
                  Engineering Goal Blueprint Catalog
                </h1>
                <p className="text-base text-slate-700 leading-relaxed">
                  Select any domain blueprint to load its pre-configured variables, ASME/ISO standards, and canonical equations directly into the Express Builder.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="relative min-w-[280px]">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search FEA, GD&T, DFMEA, HAZOP, DOE..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-950 placeholder:text-slate-400 focus:outline-none focus:border-sky-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setActivePage('BUILDER')}
                  className="px-4 py-2.5 text-sm font-bold text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg whitespace-nowrap cursor-pointer"
                >
                  Back to Express Builder
                </button>
              </div>
            </div>

            {/* Discipline Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-200/80 rounded-lg">
                {DISCIPLINE_TABS.map((tab) => {
                  const isActive = selectedDiscipline === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedDiscipline(tab.id)}
                      className={`px-3.5 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-white text-slate-950 shadow-2xs'
                          : 'text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      {tab.label}{' '}
                      <span className="font-mono tabular-nums text-slate-500 ml-1">
                        ({tab.count})
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="text-sm text-slate-600 font-mono tabular-nums">
                Showing {filteredBlueprints.length} of{' '}
                {ENGINEERING_BLUEPRINTS.length} engineering blueprints
              </div>
            </div>

            {/* Full Blueprint Cards with Clear Hierarchy */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBlueprints.map((bp) => {
                const isSelected = bp.id === activeBlueprint.id;
                return (
                  <div
                    key={bp.id}
                    className={`p-6 rounded-xl border bg-white flex flex-col justify-between gap-5 transition-all ${
                      isSelected
                        ? 'border-sky-600 ring-1 ring-sky-600'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <span className="font-bold text-sky-800">
                          {bp.disciplineLabel}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono font-semibold">
                          {bp.recommendedFramework}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {bp.variables.length} vars
                        </span>
                      </div>

                      <h2 className="text-lg font-bold text-slate-950 font-display leading-snug">
                        {bp.title}
                      </h2>

                      <p className="text-sm text-slate-700 leading-relaxed">
                        {bp.shortSummary}
                      </p>

                      <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                        <div>
                          <strong className="font-bold text-slate-900">
                            Goal:
                          </strong>{' '}
                          {bp.engineeringGoal}
                        </div>
                        <div className="font-mono text-slate-700 truncate">
                          Variables:{' '}
                          {bp.variables.map((v) => `{{${v.key}}}`).join(', ')}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectBlueprint(bp, false);
                          setActivePage('TECHNICAL_DOCS');
                        }}
                        className="px-3 py-2 text-xs font-bold text-slate-800 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Full Explanation
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectBlueprint(bp, true)}
                        className="px-4 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Load in Express Builder</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =====================================================================
            PAGE 3: TECHNICAL REFERENCE, ANATOMY & WEAK VS. ENGINEERED DIFF
            (Preserves 100% of all technical descriptions with clear hierarchy)
           ===================================================================== */}
        {activePage === 'TECHNICAL_DOCS' && (
          <div className="space-y-8">
            {/* Top Header & Blueprint Switcher */}
            <div className="bg-white border border-slate-300 rounded-xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-3xl">
                <div className="text-xs font-bold text-sky-700 flex items-center gap-2">
                  <span>
                    Complete Technical Reference & Failure-Mode Documentation
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{activeBlueprint.disciplineLabel}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 font-display">
                  {activeBlueprint.title}
                </h1>
                <p className="text-base text-slate-700">
                  {activeBlueprint.engineeringGoal}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <select
                  aria-label="Inspect Blueprint Technical Documentation"
                  value={activeBlueprint.id}
                  onChange={(e) => {
                    const found = ENGINEERING_BLUEPRINTS.find(
                      (b) => b.id === e.target.value
                    );
                    if (found) handleSelectBlueprint(found, false);
                  }}
                  className="px-3.5 py-2.5 text-sm font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-950 max-w-xs truncate cursor-pointer"
                >
                  {ENGINEERING_BLUEPRINTS.map((bp) => (
                    <option key={bp.id} value={bp.id}>
                      {bp.title}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setActivePage('BUILDER')}
                  className="px-4 py-2.5 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                >
                  <span>Open in Express Builder</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* PART A: COMPLETE PROMPT FRAMEWORK ARCHITECTURE GUIDE */}
            <section className="bg-white border border-slate-300 rounded-xl p-6 space-y-5">
              <div className="border-b border-slate-200 pb-4">
                <div className="text-xs font-bold text-sky-700">
                  Prompt Engineering Methodologies for Physical & Industrial Systems
                </div>
                <h2 className="text-2xl font-bold text-slate-950 font-display mt-0.5">
                  01. Modular Prompt Framework Explanations
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {FRAMEWORKS.map((fw) => {
                  const isCurrent = fw.id === activeFramework;
                  return (
                    <div
                      key={fw.id}
                      className={`p-5 rounded-xl border space-y-3 ${
                        isCurrent
                          ? 'bg-sky-50/50 border-sky-600 ring-1 ring-sky-600'
                          : 'bg-slate-50 border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-base font-bold font-mono text-slate-950">
                          {fw.name} ({fw.id})
                        </span>
                        <span className="text-xs font-mono font-bold text-sky-700">
                          {fw.blockCodes.join(' → ')}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-slate-800">
                        {fw.tagline}
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {fw.description}
                      </p>
                      <div className="pt-2.5 border-t border-slate-200 flex items-center justify-between gap-2 text-xs">
                        <span className="text-slate-700">
                          <strong className="font-bold text-slate-950">
                            Best for:
                          </strong>{' '}
                          {fw.bestFor}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            handleSwitchFramework(fw.id);
                            setActivePage('BUILDER');
                          }}
                          className="font-bold text-sky-700 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Use {fw.id} →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* PART B: FIRST-PRINCIPLES AXIOMS, CANONICAL STEPS & FEW-SHOT CALIBRATION */}
            <section className="bg-white border border-slate-300 rounded-xl p-6 space-y-6">
              <div className="border-b border-slate-200 pb-4">
                <div className="text-xs font-bold text-sky-700">
                  Deep Domain Specification for {activeBlueprint.title}
                </div>
                <h2 className="text-2xl font-bold text-slate-950 font-display mt-0.5">
                  02. Governing Physics Axioms, Analytical Steps & Few-Shot Calibration
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-4">
                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
                    <h3 className="text-base font-bold text-slate-950">
                      Specialist Persona & Authority Anchor
                    </h3>
                    <p className="text-sm text-slate-800 leading-relaxed">
                      {activeBlueprint.canonical.roleAndDomain}
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
                    <h3 className="text-base font-bold text-slate-950">
                      First-Principles Governing Equations & Conservation Laws
                    </h3>
                    <p className="text-sm font-mono text-slate-900 leading-relaxed">
                      {activeBlueprint.canonical.firstPrinciplesAxioms}
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-300 space-y-2.5">
                    <h3 className="text-base font-bold text-slate-950">
                      Canonical 4-Stage Analytical Derivation Sequence
                    </h3>
                    <div className="space-y-2.5">
                      {activeBlueprint.canonical.analyticalSteps.map(
                        (step, idx) => (
                          <p
                            key={idx}
                            className="text-sm text-slate-800 leading-relaxed"
                          >
                            {step}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="p-5 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 space-y-3.5">
                    <div className="text-xs font-bold text-sky-400 font-mono">
                      FEW-SHOT CALIBRATION BENCHMARK
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-300">
                        Sample Reference Input:
                      </div>
                      <p className="text-sm font-mono text-slate-100 leading-relaxed">
                        {activeBlueprint.canonical.fewShotExample.sampleInput}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-300">
                        Required Intermediate Engineering Reasoning:
                      </div>
                      <p className="text-sm font-mono text-slate-100 leading-relaxed">
                        {
                          activeBlueprint.canonical.fewShotExample
                            .sampleReasoning
                        }
                      </p>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-300">
                        Calibrated Target Output:
                      </div>
                      <p className="text-sm font-mono text-emerald-300 leading-relaxed">
                        {activeBlueprint.canonical.fewShotExample.sampleOutput}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
                    <h3 className="text-base font-bold text-slate-950">
                      Negative Constraints & Boundary Guardrails
                    </h3>
                    <p className="text-sm text-slate-800 leading-relaxed">
                      {activeBlueprint.canonical.narrowingAndBounds}
                    </p>
                  </div>

                  <div className="p-5 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
                    <h3 className="text-base font-bold text-slate-950">
                      Required Deliverable & Table Schema
                    </h3>
                    <p className="text-sm text-slate-800 leading-relaxed">
                      {activeBlueprint.canonical.responseSchema}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* PART C: SIDE-BY-SIDE WEAK PROMPT VS. ENGINEERED PLAYBOOK DIFF */}
            <section className="bg-white border border-slate-300 rounded-xl p-6 space-y-5">
              <div className="border-b border-slate-200 pb-4">
                <div className="text-xs font-bold text-sky-700">
                  Failure Mode Prevention Analysis
                </div>
                <h2 className="text-2xl font-bold text-slate-950 font-display mt-0.5">
                  03. Weak Ad-Hoc Prompt vs. Prompt-Toolbox Diff
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-5 p-5 rounded-xl bg-slate-50 border border-slate-300 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-rose-700">
                      Naive 1-Line Prompt
                    </span>
                    <span className="font-mono text-xs text-slate-600">
                      High Hallucination & Unit Error Risk
                    </span>
                  </div>
                  <p className="p-4 rounded-lg bg-white border border-slate-300 font-mono text-sm text-slate-800 leading-relaxed">
                    "{interpolatedWeakPrompt}"
                  </p>
                </div>

                <div className="lg:col-span-7 space-y-3.5">
                  {activeBlueprint.failureModesPrevented.map((fm, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-2"
                    >
                      <div className="text-base font-bold text-slate-950">
                        Failure Mode {i + 1}: {fm.aspect}
                      </div>
                      <p className="text-sm text-rose-900 leading-relaxed">
                        <strong className="font-bold">
                          Why Naive Prompt Fails:
                        </strong>{' '}
                        {fm.weakFailureMode}
                      </p>
                      <p className="text-sm text-emerald-900 leading-relaxed">
                        <strong className="font-bold">
                          How Prompt-Toolbox Prevents It:
                        </strong>{' '}
                        {fm.engineeredFix}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* PART D: COMPLETE ENCYCLOPEDIA OF ENGINEERING CONSTRAINT INJECTORS */}
            <section className="bg-white border border-slate-300 rounded-xl p-6 space-y-5">
              <div className="border-b border-slate-200 pb-4">
                <div className="text-xs font-bold text-sky-700">
                  Full Clause Reference (All 13 Standards & Rigor Modules)
                </div>
                <h2 className="text-2xl font-bold text-slate-950 font-display mt-0.5">
                  04. Engineering Standards & Rigor Clause Encyclopedia
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CONSTRAINT_MODULES.map((mod) => {
                  const isActive = activeConstraints.includes(mod.id);
                  return (
                    <div
                      key={mod.id}
                      className="p-5 rounded-xl bg-slate-50 border border-slate-300 space-y-2.5 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono font-bold text-sky-800">
                            {mod.shortCode} · {mod.category}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleConstraint(mod.id)}
                            className={`px-3 py-1 text-xs font-bold rounded cursor-pointer ${
                              isActive
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {isActive
                              ? '✓ Active in Builder'
                              : '+ Enable in Builder'}
                          </button>
                        </div>
                        <h3 className="text-base font-bold text-slate-950">
                          {mod.label}
                        </h3>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {mod.description}
                        </p>
                        <div className="p-3 rounded-lg bg-white border border-slate-300 font-mono text-xs text-slate-800 leading-relaxed">
                          "{mod.injectedClause}"
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* =====================================================================
            PAGE 4: SAVED LIBRARY (LOCALSTORAGE CUSTOM RECIPES)
           ===================================================================== */}
        {activePage === 'SAVED' && (
          <div className="bg-white border border-slate-300 rounded-xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="text-xs font-bold text-sky-700 flex items-center gap-2">
                  <span>Personal Engineering Playbook Library</span>
                  <span aria-hidden="true">·</span>
                  <span>Browser LocalStorage Persistence</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-950 font-display">
                  Saved Custom Prompt Recipes ({savedRecipes.length})
                </h1>
              </div>

              <button
                type="button"
                onClick={() => setActivePage('BUILDER')}
                className="px-4 py-2.5 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors cursor-pointer"
              >
                Return to Express Builder
              </button>
            </div>

            {savedRecipes.length === 0 ? (
              <div className="p-10 rounded-xl bg-slate-50 border border-slate-300 text-center space-y-3">
                <FolderOpen className="w-7 h-7 text-slate-500 mx-auto" />
                <div className="text-base font-bold text-slate-900">
                  No Saved Custom Recipes Yet
                </div>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Configure any blueprint's variables, framework blocks, or ASME/ISO constraint injectors in the Express Builder and click "Save Recipe" to store reusable templates here.
                </p>
                <button
                  type="button"
                  onClick={() => setActivePage('BUILDER')}
                  className="px-4 py-2 text-sm font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors cursor-pointer"
                >
                  Build Your First Recipe
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="p-5 rounded-xl bg-slate-50 border border-slate-300 flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="text-xs text-slate-600 flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">
                          {recipe.disciplineLabel}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{recipe.framework}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{recipe.unitSystem}</span>
                        <span aria-hidden="true">·</span>
                        <span>{recipe.createdAt}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-950">
                        {recipe.name}
                      </h3>
                      <p className="text-xs text-slate-700 font-mono">
                        {recipe.blocks.filter((b) => b.enabled).length} blocks ·{' '}
                        {recipe.activeConstraints.length} constraint modules
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleLoadRecipe(recipe)}
                        className="px-3.5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors cursor-pointer"
                      >
                        Load into Express Builder
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRecipe(recipe.id)}
                        className="px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* FOOTER WITH FORMAL LEGAL DISCLAIMER & ATTRIBUTION */}
      <footer className="border-t border-slate-300 bg-white px-6 py-8 mt-12">
        <div className="max-w-[1440px] mx-auto space-y-6">
          {/* Navigation & Brand Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600 border-b border-slate-200 pb-5">
            <div className="font-bold text-slate-950 font-display text-base">
              Prompt-Toolbox — Engineering Prompt Playbook & Modular Builder
            </div>
            <div className="flex items-center gap-5 font-medium">
              <button
                type="button"
                onClick={() => setActivePage('BUILDER')}
                className="hover:text-slate-950 cursor-pointer"
              >
                Express Builder
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setActivePage('CATALOG')}
                className="hover:text-slate-950 cursor-pointer"
              >
                Blueprint Catalog
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setActivePage('TECHNICAL_DOCS')}
                className="hover:text-slate-950 cursor-pointer"
              >
                Technical Reference
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setActivePage('SAVED')}
                className="hover:text-slate-950 cursor-pointer"
              >
                Saved Library
              </button>
            </div>
          </div>

          {/* Formal Legal Disclaimer & Attribution Box */}
          <div className="p-5 rounded-lg bg-slate-50 border border-slate-300 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-slate-700 uppercase">
                <Scale className="w-4 h-4 text-slate-700" />
                <span>
                  Legal Notice, Engineering Verification Disclaimer & Attribution
                </span>
              </div>
              <div className="text-xs font-mono font-semibold text-slate-800">
                Created by Prashant Fawade with Gemini from Google.
              </div>
            </div>

            <p className="font-legal text-xs sm:text-[13px] text-slate-700 leading-relaxed italic">
              <strong>Disclaimer:</strong> This website (<strong>Prompt-Toolbox</strong>) is built and managed with AI—always check, validate, and independently verify all assembled prompts, boundary parameters, governing equations, unit conversions, and downstream outputs before using them in any design, manufacturing, process, or safety-critical engineering workflow. Neither the creator nor the platform assumes liability for engineering decisions, tolerances, or specifications derived from this tool.{' '}
              <span className="not-italic font-semibold text-slate-900">
                Created by Prashant Fawade with Gemini from Google.
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
