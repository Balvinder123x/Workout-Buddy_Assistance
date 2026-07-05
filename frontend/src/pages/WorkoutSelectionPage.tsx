import { motion } from "framer-motion";
import { Heart, SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { EmptyState } from "@/components/feedback/States";
import { DemoModal } from "@/components/workout/DemoModal";
import { ExerciseCard } from "@/components/workout/ExerciseCard";
import { FilterBar, type Filters } from "@/components/workout/FilterBar";
import { type Exercise, exercises } from "@/data/exercises";
import { useFavorites } from "@/lib/useFavorites";

const initialFilters: Filters = {
  search: "",
  category: "All",
  difficulty: "All",
  equipment: "All",
};

export function WorkoutSelectionPage() {
  const navigate = useNavigate();
  const { isFavorite, toggle } = useFavorites();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [demo, setDemo] = useState<Exercise | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const filtered = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return exercises.filter((ex) => {
      if (q && !ex.name.toLowerCase().includes(q)) return false;
      if (filters.category !== "All" && ex.category !== filters.category)
        return false;
      if (filters.difficulty !== "All" && ex.difficulty !== filters.difficulty)
        return false;
      if (filters.equipment !== "All" && ex.equipment !== filters.equipment)
        return false;
      if (favoritesOnly && !isFavorite(ex.id)) return false;
      return true;
    });
  }, [filters, favoritesOnly, isFavorite]);

  const start = (exercise: Exercise) => {
    navigate(`/workout/live?exercise=${exercise.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-display text-2xl font-bold text-cream sm:text-3xl">
            Choose your workout
          </h1>
          <p className="mt-1 text-slate-400">
            Pick an exercise to start. AI-tracked moves count reps and check
            your form.
          </p>
        </motion.div>

        <button
          onClick={() => setFavoritesOnly((v) => !v)}
          aria-pressed={favoritesOnly}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition ${
            favoritesOnly
              ? "bg-motion-gradient text-ink-950"
              : "glass text-slate-300 hover:text-cream"
          }`}
        >
          <Heart
            className={`h-4 w-4 ${favoritesOnly ? "fill-ink-950" : ""}`}
          />
          Favorites
        </button>
      </div>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No exercises match"
          message="Try clearing your filters or searching for something else."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((ex, i) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              isFavorite={isFavorite(ex.id)}
              onToggleFavorite={toggle}
              onStart={start}
              onViewDemo={setDemo}
              delay={i * 0.03}
            />
          ))}
        </div>
      )}

      <DemoModal exercise={demo} onClose={() => setDemo(null)} onStart={start} />
    </div>
  );
}
