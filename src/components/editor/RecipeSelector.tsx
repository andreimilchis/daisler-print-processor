"use client";

import { useState, useEffect } from "react";
import { useEditor } from "@/lib/editor-context";
import { DEFAULT_RECIPES, getCustomRecipes, saveCustomRecipe, deleteCustomRecipe, Recipe } from "@/lib/recipes";

export default function RecipeSelector() {
  const { params, updateParams } = useEditor();
  const [customRecipes, setCustomRecipes] = useState<Recipe[]>([]);
  const [showSave, setShowSave] = useState(false);
  const [saveName, setSaveName] = useState("");

  useEffect(() => {
    setCustomRecipes(getCustomRecipes());
  }, []);

  const allRecipes = [...DEFAULT_RECIPES, ...customRecipes];

  const selectRecipe = (recipe: Recipe) => {
    updateParams({
      ...recipe.params,
      presetId: recipe.id,
      cutContourEnabled: recipe.cutContour?.enabled || false,
      cutContourType: recipe.cutContour?.type || "rectangle",
      cutContourOffsetMm: recipe.cutContour?.offsetMm || 2,
      removeBg: recipe.removeBg || false,
    });
  };

  const handleSaveRecipe = () => {
    if (!saveName.trim()) return;
    const id = `custom-${Date.now()}`;
    const recipe: Recipe = {
      id,
      name: saveName.trim(),
      icon: "⭐",
      description: `${params.targetWidthMm}×${params.targetHeightMm}mm, ${params.dpi} DPI`,
      params: {
        targetWidthMm: params.targetWidthMm,
        targetHeightMm: params.targetHeightMm,
        dpi: params.dpi,
        bleedMm: params.bleedMm,
        enableAiFill: params.enableAiFill,
        aiOverlapPercent: params.aiOverlapPercent,
        enableAiUpscaling: params.enableAiUpscaling,
        aiUpscaleScale: params.aiUpscaleScale,
      },
      cutContour: params.cutContourEnabled ? {
        enabled: true,
        type: params.cutContourType || "rectangle",
        offsetMm: params.cutContourOffsetMm || 2,
      } : undefined,
      removeBg: params.removeBg,
      isCustom: true,
    };
    saveCustomRecipe(recipe);
    setCustomRecipes(getCustomRecipes());
    setShowSave(false);
    setSaveName("");
  };

  const handleDeleteRecipe = (id: string) => {
    deleteCustomRecipe(id);
    setCustomRecipes(getCustomRecipes());
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-muted uppercase tracking-wide">
          Rețete
        </label>
        <button
          onClick={() => setShowSave(!showSave)}
          className="text-xs text-primary hover:text-primary-dark cursor-pointer"
        >
          {showSave ? "Anulează" : "Salvează rețetă"}
        </button>
      </div>

      {showSave && (
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Numele rețetei"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSaveRecipe()}
            className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm"
          />
          <button
            onClick={handleSaveRecipe}
            disabled={!saveName.trim()}
            className="px-3 py-1.5 bg-primary text-white text-sm rounded-lg cursor-pointer disabled:opacity-50"
          >
            Salvează
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        {allRecipes.map((recipe) => (
          <div
            key={recipe.id}
            onClick={() => selectRecipe(recipe)}
            className={`
              p-2.5 rounded-xl text-left text-sm transition-all cursor-pointer relative group
              ${params.presetId === recipe.id
                ? "bg-primary/15 border-2 border-primary"
                : "bg-background border-2 border-transparent hover:border-primary/30"
              }
            `}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-base">{recipe.icon}</span>
              <span className="font-medium text-xs">{recipe.name}</span>
            </div>
            <p className="text-[10px] text-muted mt-0.5 leading-tight">{recipe.description}</p>

            {/* Badges */}
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {recipe.cutContour?.enabled && (
                <span className="text-[9px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">Cut</span>
              )}
              {recipe.removeBg && (
                <span className="text-[9px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded-full">No BG</span>
              )}
              {recipe.params.enableAiUpscaling && (
                <span className="text-[9px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">AI</span>
              )}
            </div>

            {/* Delete custom */}
            {recipe.isCustom && (
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteRecipe(recipe.id); }}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs items-center justify-center hidden group-hover:flex cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
