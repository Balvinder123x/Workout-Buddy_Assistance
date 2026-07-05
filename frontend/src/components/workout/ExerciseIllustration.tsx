import type { MuscleGroup } from "@/data/exercises";

/**
 * A self-contained gradient + glyph illustration used as the exercise-card
 * "image". Avoids hotlinking external photos (which break and carry licensing
 * concerns) while keeping each card visually distinct by muscle group.
 */

const palette: Record<MuscleGroup, [string, string]> = {
  Legs: ["#8b5cf6", "#6366f1"],
  Chest: ["#22d3ee", "#0ea5e9"],
  Arms: ["#fb7185", "#f43f5e"],
  Shoulders: ["#a78bfa", "#8b5cf6"],
  Core: ["#34d399", "#10b981"],
  Back: ["#f59e0b", "#f97316"],
  "Full Body": ["#e879f9", "#c026d3"],
};

export function ExerciseIllustration({
  muscleGroup,
  className = "",
}: {
  muscleGroup: MuscleGroup;
  className?: string;
}) {
  const [from, to] = palette[muscleGroup];
  const gradId = `ex-${muscleGroup.replace(/\s/g, "")}`;

  return (
    <svg
      viewBox="0 0 400 200"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill={`url(#${gradId})`} opacity="0.25" />
      <circle cx="320" cy="40" r="70" fill={from} opacity="0.2" />
      <circle cx="80" cy="180" r="90" fill={to} opacity="0.15" />
      <text
        x="200"
        y="112"
        textAnchor="middle"
        fontFamily="'Space Grotesk', sans-serif"
        fontSize="26"
        fontWeight="700"
        fill="#f5f3ef"
        opacity="0.9"
      >
        {muscleGroup}
      </text>
    </svg>
  );
}
