"use client";

import { useMemo, useState } from "react";
import {
  IconBookmark,
  IconFilter,
  IconGift,
  IconGrid,
  IconList,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSliders,
  IconSparkle,
  IconTag,
  IconX
} from "@/components/icons";
import { WishCard } from "@/components/wish-card";
import { WishComposerModal } from "@/components/wish-composer-modal";
import type { OccasionSummary, WishPriority, WishStatus, WishSummary } from "@/lib/types";

export type BudgetRange = "all" | "under-15k" | "15k-35k" | "35k-75k" | "above-75k";
export type SortOption = "priority" | "price-asc" | "price-desc" | "recent";

const budgetRangeDefs: Array<{ id: BudgetRange; label: string }> = [
  { id: "all", label: "Tous les budgets" },
  { id: "under-15k", label: "< 15 000 FCFA" },
  { id: "15k-35k", label: "15 000 - 35 000 FCFA" },
  { id: "35k-75k", label: "35 000 - 75 000 FCFA" },
  { id: "above-75k", label: "> 75 000 FCFA" }
];

const priorityOrder: Record<WishPriority, number> = {
  MUST_HAVE: 1,
  WOULD_LOVE: 2,
  LUXURY: 3,
  MAYBE_LATER: 4
};

export function WishExplorer({
  wishes,
  occasions,
  demoMode,
  initialOccasionSlug,
  initialStatusFilter = "active-reserved",
  title = "Catalogue des envies",
  description
}: {
  wishes: WishSummary[];
  occasions: OccasionSummary[];
  demoMode: boolean;
  initialOccasionSlug?: string;
  initialStatusFilter?: "all" | "active-only" | "active-reserved" | "reserved-only" | "gifted-only";
  title?: string;
  description?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState<string>(
    initialOccasionSlug ?? "all"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedBudget, setSelectedBudget] = useState<BudgetRange>("all");
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false);

  // Extract unique categories from actual wishes
  const categories = useMemo(() => {
    const set = new Set<string>();
    wishes.forEach((w) => {
      if (w.category) set.add(w.category);
    });
    return Array.from(set).sort();
  }, [wishes]);

  // Filter & Sort Logic
  const filteredWishes = useMemo(() => {
    return wishes.filter((wish) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = wish.title.toLowerCase().includes(query);
        const matchesDesc = (wish.description ?? "").toLowerCase().includes(query);
        const matchesCat = wish.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      // Status Filter
      if (statusFilter === "active-only" && wish.status !== "ACTIVE") return false;
      if (statusFilter === "reserved-only" && wish.status !== "RESERVED") return false;
      if (statusFilter === "gifted-only" && wish.status !== "GIFTED") return false;
      if (statusFilter === "active-reserved" && wish.status === "GIFTED") return false;

      // Occasion Filter
      if (selectedOccasion !== "all") {
        if (wish.occasion?.slug !== selectedOccasion && wish.occasion?.id !== selectedOccasion) {
          return false;
        }
      }

      // Category Filter
      if (selectedCategory !== "all" && wish.category !== selectedCategory) {
        return false;
      }

      // Priority Filter
      if (selectedPriority !== "all" && wish.priority !== selectedPriority) {
        return false;
      }

      // Budget Range Filter
      if (selectedBudget !== "all") {
        const price = wish.priceFcfa ?? 0;
        if (selectedBudget === "under-15k" && (price === 0 || price >= 15000)) return false;
        if (selectedBudget === "15k-35k" && (price < 15000 || price > 35000)) return false;
        if (selectedBudget === "35k-75k" && (price < 35000 || price > 75000)) return false;
        if (selectedBudget === "above-75k" && price <= 75000) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "priority") {
        return (priorityOrder[a.priority] ?? 5) - (priorityOrder[b.priority] ?? 5);
      }
      if (sortBy === "price-asc") {
        return (a.priceFcfa ?? 0) - (b.priceFcfa ?? 0);
      }
      if (sortBy === "price-desc") {
        return (b.priceFcfa ?? 0) - (a.priceFcfa ?? 0);
      }
      if (sortBy === "recent") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
  }, [
    wishes,
    searchQuery,
    statusFilter,
    selectedOccasion,
    selectedCategory,
    selectedPriority,
    selectedBudget,
    sortBy
  ]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedOccasion !== "all") count++;
    if (selectedCategory !== "all") count++;
    if (selectedPriority !== "all") count++;
    if (selectedBudget !== "all") count++;
    if (statusFilter !== initialStatusFilter) count++;
    return count;
  }, [
    searchQuery,
    selectedOccasion,
    selectedCategory,
    selectedPriority,
    selectedBudget,
    statusFilter,
    initialStatusFilter
  ]);

  function resetAllFilters() {
    setSearchQuery("");
    setSelectedOccasion("all");
    setSelectedCategory("all");
    setSelectedPriority("all");
    setSelectedBudget("all");
    setStatusFilter(initialStatusFilter);
    setSortBy("priority");
  }

  return (
    <div className="wish-explorer">
      {/* Explorer Toolbar */}
      <div className="explorer-toolbar shell-panel">
        <div className="explorer-toolbar__top">
          <div className="search-input-wrapper">
            <IconSearch size={18} className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une envie, une marque, un style..."
              className="search-input"
              aria-label="Recherche parmi les envies"
            />
            {searchQuery ? (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchQuery("")}
                aria-label="Effacer la recherche"
              >
                <IconX size={16} />
              </button>
            ) : null}
          </div>

          <div className="explorer-toolbar__actions">
            {/* View Mode Toggle */}
            <div className="view-mode-toggle" role="group" aria-label="Mode d'affichage">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === "grid" ? "is-active" : ""}`}
                onClick={() => setViewMode("grid")}
                title="Affichage en Grille Visuelle"
                aria-pressed={viewMode === "grid"}
              >
                <IconGrid size={18} />
                <span className="hide-mobile">Grille</span>
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === "list" ? "is-active" : ""}`}
                onClick={() => setViewMode("list")}
                title="Affichage en Liste Détaillée"
                aria-pressed={viewMode === "list"}
              >
                <IconList size={18} />
                <span className="hide-mobile">Liste</span>
              </button>
            </div>

            {/* Add Wish CTA */}
            <button
              type="button"
              className="btn-primary"
              onClick={() => setIsComposerOpen(true)}
            >
              <IconPlus size={18} />
              <span>Ajouter</span>
            </button>
          </div>
        </div>

        {/* Filter Chips row */}
        <div className="explorer-filters-row">
          {/* Occasion Filter */}
          <div className="filter-dropdown-wrap">
            <label htmlFor="filter-occ" className="filter-chip-label">
              <IconGift size={14} /> Occasion
            </label>
            <select
              id="filter-occ"
              value={selectedOccasion}
              onChange={(e) => setSelectedOccasion(e.target.value)}
              className="filter-chip-select"
            >
              <option value="all">Toutes les occasions</option>
              {occasions.map((occ) => (
                <option key={occ.id} value={occ.slug}>
                  {occ.name} ({occ.wishCount})
                </option>
              ))}
            </select>
          </div>

          {/* Budget Filter */}
          <div className="filter-dropdown-wrap">
            <label htmlFor="filter-budget" className="filter-chip-label">
              <IconTag size={14} /> Budget FCFA
            </label>
            <select
              id="filter-budget"
              value={selectedBudget}
              onChange={(e) => setSelectedBudget(e.target.value as BudgetRange)}
              className="filter-chip-select"
            >
              {budgetRangeDefs.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="filter-dropdown-wrap">
            <label htmlFor="filter-prio" className="filter-chip-label">
              <IconSparkle size={14} /> Priorité
            </label>
            <select
              id="filter-prio"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="filter-chip-select"
            >
              <option value="all">Toutes les priorités</option>
              <option value="MUST_HAVE">★ Indispensable</option>
              <option value="WOULD_LOVE">♥ Coup de cœur</option>
              <option value="LUXURY">✦ Luxe & Rêve</option>
              <option value="MAYBE_LATER">• Plus tard</option>
            </select>
          </div>

          {/* Category Filter */}
          {categories.length > 0 ? (
            <div className="filter-dropdown-wrap">
              <label htmlFor="filter-cat" className="filter-chip-label">
                Catégorie
              </label>
              <select
                id="filter-cat"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-chip-select"
              >
                <option value="all">Toutes ({categories.length})</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {/* Sort By */}
          <div className="filter-dropdown-wrap ml-auto">
            <label htmlFor="filter-sort" className="filter-chip-label">
              <IconSliders size={14} /> Trier par
            </label>
            <select
              id="filter-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="filter-chip-select"
            >
              <option value="priority">Par priorité</option>
              <option value="price-asc">Budget croissant</option>
              <option value="price-desc">Budget décroissant</option>
              <option value="recent">Plus récentes</option>
            </select>
          </div>
        </div>

        {/* Active Filter Indicators & Count */}
        <div className="explorer-status-bar">
          <span className="results-count">
            <strong>{filteredWishes.length}</strong> {filteredWishes.length > 1 ? "envies trouvées" : "envie trouvée"}
            {wishes.length !== filteredWishes.length ? ` sur un total de ${wishes.length}` : ""}
          </span>

          {activeFiltersCount > 0 ? (
            <button
              type="button"
              className="reset-filters-btn"
              onClick={resetAllFilters}
            >
              <IconRefresh size={14} /> Réinitialiser les filtres ({activeFiltersCount})
            </button>
          ) : null}
        </div>
      </div>

      {/* Grid or List Results */}
      {filteredWishes.length > 0 ? (
        <div className={viewMode === "grid" ? "wish-grid" : "wish-list-stack"}>
          {filteredWishes.map((wish) => (
            <WishCard
              key={wish.id}
              wish={wish}
              demoMode={demoMode}
              layout={viewMode}
            />
          ))}
        </div>
      ) : (
        /* Empty State with Clear Action */
        <div className="explorer-empty-state shell-panel">
          <div className="empty-state-icon-wrap">
            <IconSearch size={32} />
          </div>
          <h3 className="empty-state-title">Aucune envie ne correspond aux critères</h3>
          <p className="empty-state-desc">
            {activeFiltersCount > 0
              ? "Essaie d'élargir tes filtres de budget ou de catégorie pour découvrir d'autres idées."
              : "La liste est encore vide pour le moment. Ajoute la première idée pour démarrer !"}
          </p>
          <div className="empty-state-actions">
            {activeFiltersCount > 0 ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={resetAllFilters}
              >
                <IconRefresh size={16} /> Effacer les filtres
              </button>
            ) : null}
            <button
              type="button"
              className="btn-primary"
              onClick={() => setIsComposerOpen(true)}
            >
              <IconPlus size={16} /> Ajouter une envie
            </button>
          </div>
        </div>
      )}

      {/* Modal Composer */}
      <WishComposerModal
        occasions={occasions}
        demoMode={demoMode}
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
      />
    </div>
  );
}
