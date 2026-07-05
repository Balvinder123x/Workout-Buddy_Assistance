import { motion } from "framer-motion";

/**
 * Animated pose skeleton — the signature visual of the landing page.
 * It echoes the MediaPipe keypoint model at the heart of the product, so a
 * recruiter reads "computer-vision fitness app" in the first glance.
 *
 * Coordinates are a stylized standing figure in a 200x320 viewBox. Joints
 * pulse and connective lines shimmer along the brand gradient.
 */

interface Joint {
  id: string;
  x: number;
  y: number;
}

const joints: Joint[] = [
  { id: "head", x: 100, y: 40 },
  { id: "neck", x: 100, y: 78 },
  { id: "lShoulder", x: 66, y: 90 },
  { id: "rShoulder", x: 134, y: 90 },
  { id: "lElbow", x: 50, y: 140 },
  { id: "rElbow", x: 150, y: 140 },
  { id: "lWrist", x: 42, y: 188 },
  { id: "rWrist", x: 158, y: 188 },
  { id: "pelvis", x: 100, y: 168 },
  { id: "lHip", x: 80, y: 172 },
  { id: "rHip", x: 120, y: 172 },
  { id: "lKnee", x: 74, y: 232 },
  { id: "rKnee", x: 126, y: 232 },
  { id: "lAnkle", x: 70, y: 292 },
  { id: "rAnkle", x: 130, y: 292 },
];

const bones: Array<[string, string]> = [
  ["head", "neck"],
  ["neck", "lShoulder"],
  ["neck", "rShoulder"],
  ["lShoulder", "lElbow"],
  ["rShoulder", "rElbow"],
  ["lElbow", "lWrist"],
  ["rElbow", "rWrist"],
  ["neck", "pelvis"],
  ["pelvis", "lHip"],
  ["pelvis", "rHip"],
  ["lHip", "lKnee"],
  ["rHip", "rKnee"],
  ["lKnee", "lAnkle"],
  ["rKnee", "rAnkle"],
];

const jointMap = Object.fromEntries(joints.map((j) => [j.id, j]));

export function PoseSkeleton() {
  return (
    <motion.svg
      viewBox="0 0 200 320"
      className="h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      role="img"
      aria-label="Animated pose-estimation skeleton"
    >
      <defs>
        <linearGradient id="bone-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {bones.map(([a, b], i) => {
        const from = jointMap[a];
        const to = jointMap[b];
        return (
          <motion.line
            key={`${a}-${b}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="url(#bone-grad)"
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.85 }}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.05 }}
          />
        );
      })}

      {joints.map((j, i) => (
        <motion.circle
          key={j.id}
          cx={j.x}
          cy={j.y}
          r={4}
          fill="#22d3ee"
          filter="url(#glow)"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1] }}
          transition={{
            duration: 0.4,
            delay: 0.3 + i * 0.05,
            repeat: Infinity,
            repeatType: "reverse",
            repeatDelay: 2,
          }}
        />
      ))}
    </motion.svg>
  );
}
