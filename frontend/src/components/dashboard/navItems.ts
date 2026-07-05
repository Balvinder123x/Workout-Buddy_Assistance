import {
  Award,
  Calendar,
  Dumbbell,
  LayoutDashboard,
  type LucideIcon,
  MessageSquare,
  Settings,
  TrendingUp,
  User,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Start Workout", to: "/workout", icon: Dumbbell },
  { label: "History", to: "/progress", icon: TrendingUp },
  { label: "Achievements", to: "/achievements", icon: Award },
  { label: "Calendar", to: "/calendar", icon: Calendar },
  { label: "AI Coach", to: "/coach", icon: MessageSquare },
  { label: "Profile", to: "/profile", icon: User },
  { label: "Settings", to: "/settings", icon: Settings },
];
