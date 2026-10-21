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
  Sliders,
  FileCode,
  FileText,
  Braces,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Layers,
  Compass,
  FolderOpen,
  GitCompare,
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

const DISCIPLINE_TABS: { id: EngineeringDiscipline; label: string; count: number }[] = [
  { id: 'ALL', label: 'All Disciplines', count: ENGINEERING_BLUEPRINTS.length },
  {
    id: 'MECHANICAL',
    label: 'Mechanical',
    count: ENGINEERING_BLUEPRINTS.filter((b) => b.discipline === 'MECHANICAL').length,
  },
  {
    id: 'PRODUCT_DFM',
    label: 'Product & DFM',
    count: ENGINEERING_BLUEPRINTS.filter((b) => b.discipline === 'PRODUCT_DFM').length,
  },
  {
    id: 'MANUFACTURING',
    label: 'Manufacturing & Quality',
    count: ENGINEERING_BLUEPRINTS.filter((b) => b.discipline === 'MANUFACTURING').length,
  },
  {
    id: 'PROCESS',
    label: 'Process & Chemical',
    count: ENGINEERING_BLUEPRINTS.filter((b) => b.discipline === 'PROCESS').length,
  },
  {
    id: 'ANALYSIS',
    label: 'Engineering Analysis',
    count: ENGINEERING_BLUEPRINTS.filter((b) => b.discipline === 'ANALYSIS').length,
  },
];

const CONSTRAINT_CATEGORY_LABELS: { id: ConstraintCategory; label: string }[] = [
  { id: 'STANDARDS', label: 'Governing Standards' },
  { id: 'RIGOR', label: 'Analytical & Math Rigor' },
  { id: 'BOUNDARY', label: 'Assumptions & Bounds' },
  { id: 'OUTPUT_SCHEMA', label: 'Deliverable Schema' },
];

const STORAGE_KEY_RECIPES = 'datumspec_saved_recipes_v1';

export default function App() {
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
  const [variableValues, setVariableValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const v of ENGINEERING_BLUEPRINTS[0].variables) {
      initial[v.key] = v.defaultValue;
    }
    return initial;
  });

  // 3. Inspector & Export State
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('MARKDOWN');
  const [inspectorTab, setInspectorTab] = useState<
    'COMPILED' | 'DIFF' | 'CHECKLIST'
  >('COMPILED');
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
  const handleSelectBlueprint = (bp: EngineeringBlueprint) => {
    setActiveBlueprintId(bp.id);
    setActiveFramework(bp.recommendedFramework);
    setUnitSystem(bp.defaultUnitSystem);
    setActiveConstraints([...bp.defaultConstraints]);
    setBlocks(buildBlocksForFramework(bp.canonical, bp.recommendedFramework));
    const nextVars: Record<string, string> = {};
    for (const v of bp.variables) {
      nextVars[v.key] = v.defaultValue;
    }
    setVariableValues(nextVars);
  };

  // Switch Framework while preserving current canonical/custom edits
  const handleSwitchFramework = (nextFramework: FrameworkId) => {
    setActiveFramework(nextFramework);
    setBlocks((prevBlocks) =>
      buildBlocksForFramework(activeBlueprint.canonical, nextFramework, prevBlocks)
    );
  };

  // Reset current blueprint to factory defaults
  const handleResetBlueprint = () => {
    handleSelectBlueprint(activeBlueprint);
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
    () => interpolateVariables(activeBlueprint.weakPromptBaseline, variableValues),
    [activeBlueprint.weakPromptBaseline, variableValues]
  );

  // Handlers for Blocks
  const handleToggleBlock = (blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, enabled: !b.enabled } : b))
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
    const cleanCode = (newBlockCode.trim() || 'SPEC').toUpperCase().slice(0, 6);
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
    a.download = `datumspec-${slug}-${activeFramework.toLowerCase()}.${ext}`;
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteRecipe = (recipeId: string) => {
    setSavedRecipes((prev) => prev.filter((r) => r.id !== recipeId));
  };

  const currentFrameworkMeta = useMemo(
    () => FRAMEWORKS.find((f) => f.id === activeFramework) || FRAMEWORKS[0],
    [activeFramework]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 drafting-grid">
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-3.5">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <a
            href="#top"
            className="text-xl font-bold tracking-tight text-slate-900 font-display whitespace-nowrap shrink-0"
          >
            DatumSpec
          </a>

          {/* Zone 2: 4 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <a
              href="#playbook-library"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Playbook Library
            </a>
            <a
              href="#framework-builder"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Framework Builder
            </a>
            <a
              href="#anatomy-diff"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Anatomy & Diff
            </a>
            <a
              href="#saved-recipes"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Saved Recipes
            </a>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => handleCopyPrompt(compiled.fullText, 'header')}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copiedState === 'header' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Compiled Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN WORKSPACE CONTAINER (1440px Baseline) */}
      <main id="top" className="flex-1 max-w-[1440px] w-full mx-auto px-6 py-8 space-y-12">
        {/* SECTION 1: HERO & ENGINEERING GOAL BLUEPRINT SELECTOR */}
        <section id="playbook-library" className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-6">
            <div className="space-y-2 max-w-3xl">
              <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
                <span>Deterministic Prompt Engineering Playbook</span>
                <span aria-hidden="true">·</span>
                <span>Mechanical, Product, Manufacturing, Process & Analysis</span>
                <span aria-hidden="true">·</span>
                <span>Zero External AI Calls</span>
              </div>
              <h1
                className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-display"
                style={{ textWrap: 'balance' }}
              >
                Assemble Standards-Compliant Engineering Prompts by Goal
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                Select an engineering blueprint below, switch between modular prompt architectures (CO-STAR, RISEN, Few-Shot, First-Principles), inject ASME/ISO/AIAG constraint modules, and interpolate exact physical boundary parameters.
              </p>
            </div>

            {/* Search & Quick Stats */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <div className="relative min-w-[280px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search FEA, GD&T, DFMEA, HAZOP, DOE..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Discipline Filter Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div
              role="tablist"
              aria-label="Engineering Discipline Filter"
              className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/75 rounded-lg"
            >
              {DISCIPLINE_TABS.map((tab) => {
                const isActive = selectedDiscipline === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setSelectedDiscipline(tab.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}{' '}
                    <span className="font-mono tabular-nums text-slate-400 ml-1">
                      ({tab.count})
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-slate-500 font-mono tabular-nums">
              Showing {filteredBlueprints.length} of {ENGINEERING_BLUEPRINTS.length} engineering blueprints
            </div>
          </div>

          {/* Blueprint Grid (Single-Elevation Cards, Zero Pill Sandwiches) */}
          {filteredBlueprints.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
              <p className="text-sm font-medium text-slate-700">
                No engineering blueprints match "{searchQuery}" in this discipline.
              </p>
              <button
                onClick={() => {
                  setSelectedDiscipline('ALL');
                  setSearchQuery('');
                }}
                className="px-4 py-2 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors cursor-pointer"
              >
                Reset Discipline & Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredBlueprints.map((bp) => {
                const isSelected = bp.id === activeBlueprint.id;
                return (
                  <button
                    key={bp.id}
                    onClick={() => handleSelectBlueprint(bp)}
                    className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-white border-sky-600 ring-1 ring-sky-600'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1.5">
                      {/* Quiet unboxed metadata line */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="font-medium text-slate-700">
                          {bp.disciplineLabel}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{bp.recommendedFramework}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono tabular-nums">
                          {bp.variables.length} vars
                        </span>
                      </div>

                      <h2 className="text-sm font-semibold text-slate-900 leading-snug">
                        {bp.title}
                      </h2>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {bp.shortSummary}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span
                        className={
                          isSelected
                            ? 'font-semibold text-sky-700'
                            : 'font-medium text-slate-500'
                        }
                      >
                        {isSelected ? 'Active in Workbench' : 'Load Blueprint'}
                      </span>
                      <ChevronRight
                        className={`w-3.5 h-3.5 ${
                          isSelected ? 'text-sky-600' : 'text-slate-400'
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION 2: TWO-ZONE MODULAR FRAMEWORK BUILDER & LIVE COMPILER */}
        <section
          id="framework-builder"
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* LEFT 7 COLUMNS: INTERACTIVE MODULAR WORKBENCH */}
          <div className="lg:col-span-7 space-y-6">
            {/* Active Blueprint Banner & Reset */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>Active Engineering Specification</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeBlueprint.disciplineLabel}</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 font-display">
                    {activeBlueprint.title}
                  </h2>
                </div>
                <button
                  onClick={handleResetBlueprint}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-800">Engineering Goal:</span>{' '}
                {activeBlueprint.engineeringGoal}
              </p>
            </div>

            {/* STEP 1: FRAMEWORK ARCHITECTURE SWITCHER */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    01. Prompt Architecture Framework
                  </h3>
                  <p className="text-xs text-slate-500">
                    Switch structural methodology on the fly—your variables and custom blocks stay mapped.
                  </p>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  Recommended: {activeBlueprint.recommendedFramework}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {FRAMEWORKS.map((fw) => {
                  const isSelected = activeFramework === fw.id;
                  return (
                    <button
                      key={fw.id}
                      onClick={() => handleSwitchFramework(fw.id)}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-50/70 border-sky-600 text-slate-900'
                          : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold font-mono text-slate-900 whitespace-nowrap">
                          {fw.id}
                        </span>
                        {isSelected && (
                          <span className="text-[11px] font-semibold text-sky-700">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500 font-mono truncate">
                        {fw.blockCodes.join(' → ')}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="font-medium text-slate-800">
                  {currentFrameworkMeta.name}:{' '}
                  <span className="font-normal text-slate-600">
                    {currentFrameworkMeta.tagline}
                  </span>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  {currentFrameworkMeta.description}
                </p>
              </div>
            </div>

            {/* STEP 2: DYNAMIC PARAMETER VARIABLES & QUICK-FILL PRESETS */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    02. Engineering Boundary Parameters & Variables
                  </h3>
                  <p className="text-xs text-slate-500">
                    Values automatically interpolate into{' '}
                    <code className="font-mono text-slate-700">{'{{variable}}'}</code>{' '}
                    tokens across all active blocks.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const next: Record<string, string> = {};
                      for (const v of activeBlueprint.variables) {
                        next[v.key] = v.defaultValue;
                      }
                      setVariableValues((prev) => ({ ...prev, ...next }));
                    }}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Restore Sample Values
                  </button>
                  <button
                    onClick={() => setVariableValues({})}
                    className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {allVariableSlots.map((slot) => {
                  const currentValue = variableValues[slot.key] ?? '';
                  const isUnfilled = !currentValue.trim();
                  return (
                    <div
                      key={slot.key}
                      className="p-3.5 rounded-lg bg-slate-50/80 border border-slate-200/90 space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label
                          htmlFor={`var-${slot.key}`}
                          className="text-xs font-semibold text-slate-800 flex items-center gap-2"
                        >
                          <span>{slot.label}</span>
                          <span aria-hidden="true" className="text-slate-300">
                            ·
                          </span>
                          <code className="font-mono text-[11px] text-sky-700">
                            {`{{${slot.key}}}`}
                          </code>
                        </label>
                        {isUnfilled ? (
                          <span className="text-[11px] font-medium text-amber-700 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Unspecified Parameter</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Specified</span>
                          </span>
                        )}
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
                        className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-600"
                      />

                      {slot.presets.length > 0 && (
                        <div className="space-y-1 pt-0.5">
                          <div className="text-[11px] text-slate-500">
                            Quick-fill domain presets:
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {slot.presets.map((preset, idx) => {
                              const isCurrent = currentValue === preset;
                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() =>
                                    setVariableValues((prev) => ({
                                      ...prev,
                                      [slot.key]: preset,
                                    }))
                                  }
                                  className={`px-2 py-1 text-[11px] rounded border text-left transition-colors max-w-full truncate cursor-pointer ${
                                    isCurrent
                                      ? 'bg-sky-50 border-sky-600 text-sky-900 font-medium'
                                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'
                                  }`}
                                  title={preset}
                                >
                                  {preset}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 3: ENGINEERING STANDARDS, UNITS & RIGOR INJECTORS */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    03. Standards, Unit System & Rigor Injectors
                  </h3>
                  <p className="text-xs text-slate-500">
                    Deterministically append authoritative engineering guardrails to prevent unit or formula errors.
                  </p>
                </div>

                {/* Unit System Selector */}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
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
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        unitSystem === u.id
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Tabs for Constraint Modules */}
              <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
                {CONSTRAINT_CATEGORY_LABELS.map((cat) => {
                  const activeInCat = CONSTRAINT_MODULES.filter(
                    (c) =>
                      c.category === cat.id && activeConstraints.includes(c.id)
                  ).length;
                  const isTab = activeConstraintTab === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveConstraintTab(cat.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        isTab
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {cat.label}{' '}
                      <span className="font-mono tabular-nums text-sky-700 ml-1">
                        ({activeInCat})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Constraint Module Cards in Selected Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CONSTRAINT_MODULES.filter(
                  (c) => c.category === activeConstraintTab
                ).map((constraint) => {
                  const isChecked = activeConstraints.includes(constraint.id);
                  return (
                    <button
                      key={constraint.id}
                      type="button"
                      onClick={() => handleToggleConstraint(constraint.id)}
                      className={`p-3.5 rounded-lg border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                        isChecked
                          ? 'bg-sky-50/50 border-sky-600'
                          : 'bg-slate-50/60 border-slate-200 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono font-semibold text-slate-800">
                            {constraint.shortCode}
                          </span>
                          <span
                            className={`text-[11px] font-semibold ${
                              isChecked ? 'text-sky-700' : 'text-slate-400'
                            }`}
                          >
                            {isChecked ? '✓ Injected' : '+ Inject'}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-900">
                          {constraint.label}
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          {constraint.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 4: MODULAR FRAMEWORK BLOCKS COMPOSER */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display">
                    04. Modular Prompt Blocks ({activeFramework})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Toggle, reorder, or customize individual framework blocks. Hover a block to highlight it in the live compiler.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddBlockForm((v) => !v)}
                  className="px-3 py-1.5 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Custom Block</span>
                </button>
              </div>

              {/* Add Custom Block Form */}
              {showAddBlockForm && (
                <form
                  onSubmit={handleAddCustomBlock}
                  className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3"
                >
                  <div className="text-xs font-semibold text-slate-800">
                    Create Custom Engineering Specification Block
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Block Code (e.g., BOM)
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        value={newBlockCode}
                        onChange={(e) => setNewBlockCode(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-200 rounded-md"
                        required
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-medium text-slate-600 mb-1">
                        Block Heading Title
                      </label>
                      <input
                        type="text"
                        value={newBlockTitle}
                        onChange={(e) => setNewBlockTitle(e.target.value)}
                        placeholder="e.g., Supplier Metrology & First Article Inspection Requirements"
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">
                      Block Directive Content (Tip: use {'{{custom_variable}}'} to spawn a dynamic input slot)
                    </label>
                    <textarea
                      rows={3}
                      value={newBlockContent}
                      onChange={(e) => setNewBlockContent(e.target.value)}
                      placeholder="Specify custom inspection criteria, fixture datum targets, or legacy part constraints..."
                      className="w-full p-2.5 text-xs font-mono bg-white border border-slate-200 rounded-md"
                      required
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddBlockForm(false)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-md cursor-pointer"
                    >
                      Append Block to Prompt
                    </button>
                  </div>
                </form>
              )}

              {/* Modular Block List */}
              <div className="space-y-3">
                {blocks.map((block, index) => {
                  return (
                    <div
                      key={block.id}
                      onMouseEnter={() => setHoveredBlockId(block.id)}
                      onMouseLeave={() => setHoveredBlockId(null)}
                      className={`p-4 rounded-lg border transition-colors ${
                        block.enabled
                          ? hoveredBlockId === block.id
                            ? 'bg-slate-50/90 border-sky-500'
                            : 'bg-slate-50/50 border-slate-200'
                          : 'bg-slate-100/50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                            {block.code}
                          </span>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">
                              {block.title}
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              {block.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleMoveBlock(index, -1)}
                            disabled={index === 0}
                            title="Move block up"
                            className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveBlock(index, 1)}
                            disabled={index === blocks.length - 1}
                            title="Move block down"
                            className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {block.sourceSlot === 'CUSTOM' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomBlock(block.id)}
                              title="Remove custom block"
                              className="p-1 text-rose-600 hover:text-rose-700 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleToggleBlock(block.id)}
                            className={`ml-1 px-2.5 py-1 text-[11px] font-semibold rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                              block.enabled
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {block.enabled ? 'Enabled' : 'Muted'}
                          </button>
                        </div>
                      </div>

                      {block.enabled && (
                        <textarea
                          rows={Math.min(
                            8,
                            Math.max(3, block.content.split('\n').length + 1)
                          )}
                          value={block.content}
                          onChange={(e) =>
                            handleUpdateBlockContent(block.id, e.target.value)
                          }
                          className="w-full p-3 text-xs font-mono leading-relaxed bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:border-sky-600"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT 5 COLUMNS: LIVE PROMPT COMPILER & SPEC INSPECTOR (Sticky) */}
          <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-5">
            <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              {/* Compiler Top Controls */}
              <div className="p-4 border-b border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-mono text-slate-400">
                      LIVE DETERMINISTIC COMPILER
                    </div>
                    <h3 className="text-sm font-bold text-white font-display">
                      Assembled Engineering Specification
                    </h3>
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
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        inspectorTab === 'COMPILED'
                          ? 'bg-sky-600 text-white'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Compiled
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectorTab('DIFF')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        inspectorTab === 'DIFF'
                          ? 'bg-sky-600 text-white'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Weak vs. Engineered
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectorTab('CHECKLIST')}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        inspectorTab === 'CHECKLIST'
                          ? 'bg-sky-600 text-white'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Spec Rubric ({compiled.completenessChecklist.filter((c) => c.passed).length}/6)
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
                            className={`px-2 py-1 text-xs font-mono rounded transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer ${
                              outputFormat === fmt.id
                                ? 'bg-slate-700 text-sky-400 font-semibold'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <Icon className="w-3 h-3" />
                            <span>{fmt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Compiler Viewport Body */}
              <div className="p-4 max-h-[540px] overflow-y-auto font-mono text-xs leading-relaxed">
                {inspectorTab === 'COMPILED' && (
                  <div className="space-y-3">
                    {outputFormat === 'JSON' ? (
                      <pre className="whitespace-pre-wrap break-words text-slate-200">
                        {compiled.fullText}
                      </pre>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-slate-400 border-b border-slate-800 pb-2">
                          <div className="text-sky-400 font-semibold">
                            {outputFormat === 'MARKDOWN'
                              ? `# ENGINEERING SPECIFICATION PROMPT: ${activeBlueprint.title.toUpperCase()}`
                              : `<engineering_prompt blueprint="${activeBlueprint.title}" framework="${activeFramework}" units="${unitSystem}">`}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Discipline: {activeBlueprint.disciplineLabel} · Framework: {activeFramework} · Units: {unitSystem}
                          </div>
                        </div>

                        {compiled.segments.map((seg) => {
                          const isHovered = hoveredBlockId === seg.blockId;
                          return (
                            <div
                              key={seg.blockId}
                              className={`p-2.5 rounded-lg border transition-colors ${
                                isHovered
                                  ? 'bg-sky-950/60 border-sky-500'
                                  : 'bg-slate-950/50 border-slate-800/80'
                              }`}
                            >
                              <div className="text-sky-400 font-semibold mb-1">
                                {outputFormat === 'MARKDOWN'
                                  ? `## [${seg.code}] ${seg.title}`
                                  : `<${seg.xmlTag} code="${seg.code}">`}
                              </div>
                              <div className="whitespace-pre-wrap break-words text-slate-200">
                                {seg.renderedText}
                              </div>
                              {outputFormat === 'XML' && (
                                <div className="text-sky-400 font-semibold mt-1">
                                  {`</${seg.xmlTag}>`}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {outputFormat === 'XML' && (
                          <div className="text-sky-400 font-semibold">
                            {`</engineering_prompt>`}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {inspectorTab === 'DIFF' && (
                  <div className="space-y-4 font-sans">
                    <div className="p-3.5 rounded-lg bg-rose-950/40 border border-rose-800/60 space-y-1.5">
                      <div className="text-xs font-semibold text-rose-300 flex items-center justify-between">
                        <span>Naive Unstructured Prompt (High Hallucination Risk)</span>
                        <span className="font-mono tabular-nums">
                          {interpolatedWeakPrompt.split(/\s+/).length} words
                        </span>
                      </div>
                      <p className="text-xs font-mono text-rose-100/90 leading-relaxed">
                        "{interpolatedWeakPrompt}"
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      <div className="text-xs font-semibold text-slate-300">
                        Engineering Failure Modes Prevented by Active Playbook:
                      </div>
                      {activeBlueprint.failureModesPrevented.map((note, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1.5"
                        >
                          <div className="text-xs font-semibold text-sky-400">
                            {idx + 1}. {note.aspect}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            <span className="font-semibold text-rose-400">
                              Naive Failure:
                            </span>{' '}
                            {note.weakFailureMode}
                          </div>
                          <div className="text-[11px] text-slate-200">
                            <span className="font-semibold text-emerald-400">
                              DatumSpec Guardrail:
                            </span>{' '}
                            {note.engineeredFix}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {inspectorTab === 'CHECKLIST' && (
                  <div className="space-y-3 font-sans">
                    <div className="flex items-center justify-between text-xs text-slate-300 border-b border-slate-800 pb-2">
                      <span>Deterministic Engineering Spec Rubric</span>
                      <span className="font-mono font-semibold text-sky-400">
                        {compiled.completenessScoreText}
                      </span>
                    </div>
                    {compiled.completenessChecklist.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5"
                      >
                        {item.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-0.5">
                          <div className="text-xs font-semibold text-white">
                            {item.label}{' '}
                            <span
                              className={`ml-1 font-mono text-[11px] ${
                                item.passed ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              [{item.passed ? 'PASS' : 'NEEDS ATTENTION'}]
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
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
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopyPrompt(compiled.fullText, 'panel')}
                    className="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
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
                    className="px-3.5 py-2.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
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
                    className="px-3.5 py-2.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
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
                      className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-md text-white focus:outline-none focus:border-sky-500"
                      required
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md whitespace-nowrap cursor-pointer"
                    >
                      Confirm Save
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: ANATOMY & SIDE-BY-SIDE WEAK VS. ENGINEERED PROMPT DIFF */}
        <section
          id="anatomy-diff"
          className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
                <span>Engineering Prompt Anatomy</span>
                <span aria-hidden="true">·</span>
                <span>Why Generic Prompts Fail Technical Reviews</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                Weak Prompt vs. Engineered Playbook Comparison
              </h2>
            </div>
            <div className="text-xs text-slate-500">
              Currently inspecting:{' '}
              <span className="font-semibold text-slate-800">
                {activeBlueprint.title}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Naive Prompt Column */}
            <div className="lg:col-span-5 p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-rose-700">
                    Unconstrained Ad-Hoc Prompt
                  </span>
                  <span className="font-mono text-slate-500">
                    Missing units, standards & bounds
                  </span>
                </div>
                <p className="p-3.5 rounded-lg bg-white border border-slate-200 font-mono text-xs text-slate-700 leading-relaxed">
                  "{interpolatedWeakPrompt}"
                </p>

                <div className="space-y-2 pt-2">
                  <div className="text-xs font-semibold text-slate-800">
                    Documented Failure Modes on This Task:
                  </div>
                  {activeBlueprint.failureModesPrevented.map((fm, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-white border border-slate-200 space-y-1"
                    >
                      <div className="text-xs font-semibold text-slate-900">
                        {fm.aspect}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {fm.weakFailureMode}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-xs text-slate-500 pt-2 border-t border-slate-200">
                Result: Requires 4–6 rounds of manual follow-up corrections to fix unit mismatches and unstated assumptions.
              </div>
            </div>

            {/* Engineered Playbook Mechanisms Column */}
            <div className="lg:col-span-7 p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-sky-700">
                    DatumSpec Engineered Architecture ({activeFramework})
                  </span>
                  <span className="font-mono text-slate-600 tabular-nums">
                    {blocks.filter((b) => b.enabled).length} active blocks ·{' '}
                    {activeConstraints.length} standards injected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeBlueprint.failureModesPrevented.map((fm, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1.5"
                    >
                      <div className="text-xs font-semibold text-emerald-700">
                        ✓ Guardrail {i + 1}: {fm.aspect}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {fm.engineeredFix}
                      </p>
                    </div>
                  ))}

                  <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1.5">
                    <div className="text-xs font-semibold text-sky-700">
                      ✓ First-Principles Axiom Anchor
                    </div>
                    <p className="text-xs text-slate-600 font-mono leading-relaxed">
                      {activeBlueprint.canonical.firstPrinciplesAxioms}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-1.5">
                    <div className="text-xs font-semibold text-sky-700">
                      ✓ Few-Shot Calibration Benchmark
                    </div>
                    <p className="text-xs text-slate-600 font-mono leading-relaxed">
                      {activeBlueprint.canonical.fewShotExample.sampleOutput}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-slate-600">
                  Zero-shot deterministic compilation ready for technical design reviews.
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyPrompt(compiled.fullText, 'diff')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  {copiedState === 'diff'
                    ? 'Copied Engineered Spec!'
                    : 'Copy Engineered Prompt'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: SAVED PLAYBOOK RECIPES (LOCALSTORAGE LIBRARY) */}
        <section
          id="saved-recipes"
          className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="text-xs font-medium text-slate-500 flex items-center gap-2">
                <span>Personal Engineering Playbook Library</span>
                <span aria-hidden="true">·</span>
                <span>Browser LocalStorage Persistence</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                Saved Custom Prompt Recipes ({savedRecipes.length})
              </h2>
            </div>

            <button
              type="button"
              onClick={() => {
                setRecipeNameInput(
                  `${activeBlueprint.title} (${activeFramework})`
                );
                setShowSaveModal(true);
                window.scrollTo({ top: 350, behavior: 'smooth' });
              }}
              className="px-3.5 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Save Current Workbench State</span>
            </button>
          </div>

          {savedRecipes.length === 0 ? (
            <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <FolderOpen className="w-6 h-6 text-slate-400 mx-auto" />
              <div className="text-sm font-semibold text-slate-800">
                No Saved Custom Recipes Yet
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Customize any blueprint's blocks, variables, or ASME/ISO constraint injectors in the builder above and click "Save Recipe" to store reusable templates for your team.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <span>{recipe.disciplineLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{recipe.framework}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{recipe.unitSystem}</span>
                      <span aria-hidden="true">·</span>
                      <span>{recipe.createdAt}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {recipe.name}
                    </h3>
                    <p className="text-xs text-slate-600 font-mono">
                      {recipe.blocks.filter((b) => b.enabled).length} blocks ·{' '}
                      {recipe.activeConstraints.length} constraint modules
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleLoadRecipe(recipe)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-md transition-colors cursor-pointer"
                    >
                      Load into Workbench
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRecipe(recipe.id)}
                      className="px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* QUIET FOOTER */}
      <footer className="border-t border-slate-200 bg-white px-6 py-6 mt-12">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            DatumSpec — Deterministic Engineering Prompt Playbook & Modular Builder
          </div>
          <div className="flex items-center gap-4">
            <a href="#playbook-library" className="hover:text-slate-900">
              Blueprints
            </a>
            <span aria-hidden="true">·</span>
            <a href="#framework-builder" className="hover:text-slate-900">
              Workbench
            </a>
            <span aria-hidden="true">·</span>
            <a href="#anatomy-diff" className="hover:text-slate-900">
              Anatomy
            </a>
            <span aria-hidden="true">·</span>
            <a href="#saved-recipes" className="hover:text-slate-900">
              Saved Library
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
