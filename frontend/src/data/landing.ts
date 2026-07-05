import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Brain,
  Camera,
  LineChart,
  Sparkles,
  Trophy,
} from "lucide-react";

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const features: Feature[] = [
  {
    icon: Camera,
    title: "Real-time form tracking",
    description:
      "Your webcam becomes a coach. On-device pose estimation reads 33 body points and follows every rep as you move.",
  },
  {
    icon: Brain,
    title: "Exercise recognition",
    description:
      "A trained model tells squats from push-ups from curls using your body's geometry — no manual selection needed.",
  },
  {
    icon: Activity,
    title: "Form feedback",
    description:
      "Joint-angle analysis flags a rounded back or a shallow squat the moment it happens, with a plain-language cue.",
  },
  {
    icon: LineChart,
    title: "Progress analytics",
    description:
      "Trends for volume, streaks, and quality scores, so you can see the work compounding week over week.",
  },
  {
    icon: Sparkles,
    title: "AI coach",
    description:
      "Ask about form, recovery, or what to train next and get a specific answer grounded in your own history.",
  },
  {
    icon: Trophy,
    title: "Streaks & achievements",
    description:
      "Earn badges and keep streaks alive. Small wins that make showing up tomorrow a little easier.",
  },
];

export interface Stat {
  value: string;
  label: string;
}

export const stats: Stat[] = [
  { value: "33", label: "Body points tracked" },
  { value: "5", label: "Exercises recognized" },
  { value: "30 fps", label: "On-device analysis" },
  { value: "0", label: "Wearables required" },
];

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      "The form feedback caught my shallow squats immediately. It's like having a coach who never looks away.",
    name: "Priya N.",
    role: "Marathon runner",
  },
  {
    quote:
      "I stopped guessing whether my push-ups counted. The rep counter and quality score keep me honest.",
    name: "Marcus L.",
    role: "Home-gym lifter",
  },
  {
    quote:
      "The AI coach actually references my past workouts. Advice feels specific instead of generic.",
    name: "Sana K.",
    role: "Beginner",
  },
];

export interface PricingTier {
  name: string;
  price: string;
  cadence: string;
  features: string[];
  highlighted: boolean;
}

export const pricingTiers: PricingTier[] = [
  {
    name: "Starter",
    price: "Free",
    cadence: "forever",
    features: [
      "Real-time pose tracking",
      "Exercise recognition",
      "Basic form feedback",
      "7-day history",
    ],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$9",
    cadence: "per month",
    features: [
      "Everything in Starter",
      "Full analytics & trends",
      "AI coach with history",
      "Unlimited history",
      "Achievements & streaks",
    ],
    highlighted: true,
  },
  {
    name: "Team",
    price: "$29",
    cadence: "per month",
    features: [
      "Everything in Pro",
      "Up to 5 members",
      "Shared leaderboard",
      "Priority support",
    ],
    highlighted: false,
  },
];

export interface FaqItem {
  question: string;
  answer: string;
}

export const faqs: FaqItem[] = [
  {
    question: "Do I need any special equipment?",
    answer:
      "Just a webcam or phone camera. All pose tracking runs on your device — no wearables, no extra sensors.",
  },
  {
    question: "Does my video leave my computer?",
    answer:
      "No. Pose estimation runs locally in your browser. Only anonymized workout metrics are ever stored.",
  },
  {
    question: "Which exercises are supported?",
    answer:
      "Squats, push-ups, dumbbell curls, shoulder presses, and lunges today, with more on the way.",
  },
  {
    question: "How accurate is the form feedback?",
    answer:
      "Feedback uses joint-angle geometry, so it's transparent and explainable — every cue maps to a measurable angle.",
  },
];
