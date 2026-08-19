"use client";

import { useMemo, useState } from "react";
import {
  IconGift,
  IconGrid,
  IconList,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSliders,
  IconSparkle,
  IconX
} from "@/components/icons";
import { WishCard } from "@/components/wish-card";
import { WishComposerModal } from "@/components/wish-composer-modal";
import type { AppRole, OccasionSummary, WishPriority, WishSummary } from "@/lib/types";

export type SortOption = "priority" | "recent";
type StatusFilter = "all" | "active-only" | "active-reserved" | "reserved-only" | "gifted-only";

const DEFAULT_STATUS_FILTER: StatusFilter = "active-reserved";

const priorityOrder: Record<WishPriority, number> = {
  MUST_HAVE: 1,
  WOULD_LOVE: 2,
  LUXURY: 3,
  MAYBE_LATER: 4
};

export function WishExplorer({
  wishes,
  occasions,
  currentRole
}: {
  wishes: WishSummary[];
  occasions: OccasionSummary[];
  currentRole: AppRole;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOccasion, setSelectedOccasion] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(DEFAULT_STATUS_FILTER);
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const canManage = currentRole === "RECIPIENT";

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

      return true;
    }).sort((a, b) => {
      if (sortBy === "priority") {
        return (priorityOrder[a.priority] ?? 5) - (priorityOrder[b.priority] ?? 5);
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
    sortBy
  ]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedOccasion !== "all") count++;
    if (selectedCategory !== "all") count++;
    if (selectedPriority !== "all") count++;
    if (statusFilter !== DEFAULT_STATUS_FILTER) count++;
    return count;
  }, [
    searchQuery,
    selectedOccasion,
    selectedCategory,
    selectedPriority,
    statusFilter
  ]);

  function resetAllFilters() {
    setSearchQuery("");
    setSelectedOccasion("all");
    setSelectedCategory("all");
    setSelectedPriority("all");
    setStatusFilter(DEFAULT_STATUS_FILTER);
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

            {/* Add Wish CTA — réservé à celle qui note ses envies */}
            {canManage ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsComposerOpen(true)}
              >
                <IconPlus size={18} />
                <span>Ajouter</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Filter Chips row */}
        <div className="explorer-filters-row">
          {/* Status Filter */}
          <div className="filter-dropdown-wrap">
            <label htmlFor="filter-status" className="filter-chip-label">
              <IconSliders size={14} /> Statut
            </label>
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="filter-chip-select"
            >
              <option value="active-reserved">En cours</option>
              <option value="active-only">Disponibles</option>
              {currentRole === "GIFTER" ? (
                <option value="reserved-only">Réservées</option>
              ) : null}
              <option value="gifted-only">Déjà offertes</option>
              <option value="all">Toutes</option>
            </select>
          </div>

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
              currentRole={currentRole}
              layout={viewMode}
              occasions={occasions}
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
              ? "Essaie d'élargir tes filtres d'occasion ou de catégorie."
              : canManage
                ? "La liste est encore vide pour le moment. Ajoute la première idée pour démarrer !"
                : "La liste est encore vide pour le moment. Reviens bientôt !"}
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
            {canManage ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() => setIsComposerOpen(true)}
              >
                <IconPlus size={16} /> Ajouter une envie
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* Modal Composer */}
      {canManage ? (
        <WishComposerModal
          occasions={occasions}
          isOpen={isComposerOpen}
          onClose={() => setIsComposerOpen(false)}
        />
      ) : null}
    </div>
  );
}
