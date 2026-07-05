import { Search, X } from "lucide-react";

import type { Category, Difficulty, Equipment } from "@/data/exercises";
import {
  categories,
  difficulties,
  equipmentTypes,
} from "@/data/exercises";

export interface Filters {
  search: string;
  category: Category | "All";
  difficulty: Difficulty | "All";
  equipment: Equipment | "All";
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  resultCount: number;
}

function Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: T[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-400">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-white/10 bg-ink-900 px-3 py-2 text-sm text-cream outline-none focus:border-violet-500"
      >
        <option value="All">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function FilterBar({ filters, onChange, resultCount }: FilterBarProps) {
  const hasFilters =
    filters.search !== "" ||
    filters.category !== "All" ||
    filters.difficulty !== "All" ||
    filters.equipment !== "All";

  const reset = () =>
    onChange({
      search: "",
      category: "All",
      difficulty: "All",
      equipment: "All",
    });

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <label className="flex flex-1 flex-col gap-1 text-xs text-slate-400">
          Search
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="search"
              value={filters.search}
              onChange={(e) =>
                onChange({ ...filters, search: e.target.value })
              }
              placeholder="Search exercises…"
              className="w-full rounded-lg border border-white/10 bg-ink-900 py-2 pl-9 pr-3 text-sm text-cream outline-none focus:border-violet-500"
            />
          </div>
        </label>

        <Select
          label="Category"
          value={filters.category}
          options={categories}
          onChange={(v) =>
            onChange({ ...filters, category: v as Category | "All" })
          }
        />
        <Select
          label="Difficulty"
          value={filters.difficulty}
          options={difficulties}
          onChange={(v) =>
            onChange({ ...filters, difficulty: v as Difficulty | "All" })
          }
        />
        <Select
          label="Equipment"
          value={filters.equipment}
          options={equipmentTypes}
          onChange={(v) =>
            onChange({ ...filters, equipment: v as Equipment | "All" })
          }
        />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>
          {resultCount} exercise{resultCount === 1 ? "" : "s"}
        </span>
        {hasFilters && (
          <button
            onClick={reset}
            className="flex items-center gap-1 text-slate-400 transition hover:text-cream"
          >
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
