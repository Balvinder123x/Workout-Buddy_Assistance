/**
 * Exercise catalog.
 *
 * Static, typed data describing the exercises the app supports. The five
 * ML-recognized exercises (squat, push-up, curl, shoulder press, lunge) are
 * marked with `mlSupported` so later phases can gate camera tracking to them.
 */

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type MuscleGroup =
  | "Legs"
  | "Chest"
  | "Arms"
  | "Shoulders"
  | "Core"
  | "Back"
  | "Full Body";

export type Equipment = "None" | "Dumbbells" | "Barbell" | "Kettlebell" | "Mat";

export type Category = "Strength" | "Cardio" | "Mobility" | "Core";

export interface Exercise {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  category: Category;
  /** Approximate calories burned per typical set. */
  caloriesPerSet: number;
  /** Suggested seconds per set (work interval). */
  durationSec: number;
  targetReps: number;
  /** True if the pose model can recognize and count this exercise. */
  mlSupported: boolean;
}

export const exercises: Exercise[] = [
  {
    id: "squat",
    name: "Bodyweight Squat",
    description:
      "Hips back, chest up, drive through the heels to parallel. The foundation of lower-body strength.",
    difficulty: "Beginner",
    muscleGroup: "Legs",
    equipment: "None",
    category: "Strength",
    caloriesPerSet: 12,
    durationSec: 45,
    targetReps: 12,
    mlSupported: true,
  },
  {
    id: "pushup",
    name: "Push-up",
    description:
      "Elbows at 45 degrees, body in a straight line, lower until your chest nearly touches the floor.",
    difficulty: "Beginner",
    muscleGroup: "Chest",
    equipment: "None",
    category: "Strength",
    caloriesPerSet: 10,
    durationSec: 40,
    targetReps: 10,
    mlSupported: true,
  },
  {
    id: "curl",
    name: "Dumbbell Curl",
    description:
      "Elbows pinned to your sides, curl with control, and resist on the way down for time under tension.",
    difficulty: "Beginner",
    muscleGroup: "Arms",
    equipment: "Dumbbells",
    category: "Strength",
    caloriesPerSet: 8,
    durationSec: 40,
    targetReps: 12,
    mlSupported: true,
  },
  {
    id: "shoulder-press",
    name: "Shoulder Press",
    description:
      "Press overhead without flaring the ribs, lock out gently, and keep the core braced throughout.",
    difficulty: "Intermediate",
    muscleGroup: "Shoulders",
    equipment: "Dumbbells",
    category: "Strength",
    caloriesPerSet: 11,
    durationSec: 45,
    targetReps: 10,
    mlSupported: true,
  },
  {
    id: "lunge",
    name: "Forward Lunge",
    description:
      "Step forward, drop the back knee toward the floor, and push back to standing. Alternate legs.",
    difficulty: "Intermediate",
    muscleGroup: "Legs",
    equipment: "None",
    category: "Strength",
    caloriesPerSet: 13,
    durationSec: 50,
    targetReps: 12,
    mlSupported: true,
  },
  {
    id: "plank",
    name: "Plank",
    description:
      "Forearms down, hips level, glutes and core tight. Hold the line and breathe steadily.",
    difficulty: "Beginner",
    muscleGroup: "Core",
    equipment: "Mat",
    category: "Core",
    caloriesPerSet: 6,
    durationSec: 60,
    targetReps: 1,
    mlSupported: false,
  },
  {
    id: "burpee",
    name: "Burpee",
    description:
      "Squat, kick back to a plank, return, and jump. A full-body conditioning staple.",
    difficulty: "Advanced",
    muscleGroup: "Full Body",
    equipment: "None",
    category: "Cardio",
    caloriesPerSet: 18,
    durationSec: 40,
    targetReps: 10,
    mlSupported: false,
  },
  {
    id: "mountain-climber",
    name: "Mountain Climber",
    description:
      "Drive knees toward your chest from a plank at a steady, controlled pace. Keep your hips low.",
    difficulty: "Intermediate",
    muscleGroup: "Core",
    equipment: "None",
    category: "Cardio",
    caloriesPerSet: 14,
    durationSec: 40,
    targetReps: 20,
    mlSupported: false,
  },
  {
    id: "glute-bridge",
    name: "Glute Bridge",
    description:
      "Drive through your heels, squeeze at the top, and lower with control. Great posterior-chain work.",
    difficulty: "Beginner",
    muscleGroup: "Legs",
    equipment: "Mat",
    category: "Strength",
    caloriesPerSet: 8,
    durationSec: 40,
    targetReps: 15,
    mlSupported: false,
  },
  {
    id: "bent-over-row",
    name: "Bent-over Row",
    description:
      "Hinge at the hips, flat back, and row to your ribs. Squeeze the shoulder blades together.",
    difficulty: "Intermediate",
    muscleGroup: "Back",
    equipment: "Dumbbells",
    category: "Strength",
    caloriesPerSet: 12,
    durationSec: 45,
    targetReps: 12,
    mlSupported: false,
  },
  {
    id: "kettlebell-swing",
    name: "Kettlebell Swing",
    description:
      "A hip-hinge power move: snap the hips forward to float the bell to chest height. Not an arm lift.",
    difficulty: "Advanced",
    muscleGroup: "Full Body",
    equipment: "Kettlebell",
    category: "Cardio",
    caloriesPerSet: 16,
    durationSec: 45,
    targetReps: 15,
    mlSupported: false,
  },
  {
    id: "cat-cow",
    name: "Cat–Cow",
    description:
      "Flow between spinal flexion and extension with your breath. A gentle mobility reset for the spine.",
    difficulty: "Beginner",
    muscleGroup: "Back",
    equipment: "Mat",
    category: "Mobility",
    caloriesPerSet: 4,
    durationSec: 60,
    targetReps: 10,
    mlSupported: false,
  },
];

export const categories: Category[] = [
  "Strength",
  "Cardio",
  "Mobility",
  "Core",
];
export const difficulties: Difficulty[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
];
export const equipmentTypes: Equipment[] = [
  "None",
  "Dumbbells",
  "Barbell",
  "Kettlebell",
  "Mat",
];
