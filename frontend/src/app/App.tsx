import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SkeletonCard } from "@/components/feedback/States";
import { ToastProvider } from "@/components/feedback/Toast";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AuthProvider } from "@/lib/AuthContext";
import { ThemeProvider } from "@/lib/useTheme";
import { DashboardPage } from "@/pages/DashboardPage";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { WorkoutSelectionPage } from "@/pages/WorkoutSelectionPage";
import { WorkoutSummaryPage } from "@/pages/WorkoutSummaryPage";

// Heavy authenticated pages are code-split so they don't weigh down the
// initial bundle. The live workout page pulls in MediaPipe (~450 kB); the
// coach/history/achievements pages pull in Recharts and the markdown renderer.
const LiveWorkoutPage = lazy(() =>
  import("@/pages/LiveWorkoutPage").then((m) => ({ default: m.LiveWorkoutPage })),
);
const HistoryPage = lazy(() =>
  import("@/pages/HistoryPage").then((m) => ({ default: m.HistoryPage })),
);
const AchievementsPage = lazy(() =>
  import("@/pages/AchievementsPage").then((m) => ({
    default: m.AchievementsPage,
  })),
);
const CoachPage = lazy(() =>
  import("@/pages/CoachPage").then((m) => ({ default: m.CoachPage })),
);
const ProfilePage = lazy(() =>
  import("@/pages/ProfilePage").then((m) => ({ default: m.ProfilePage })),
);
const SettingsPage = lazy(() =>
  import("@/pages/SettingsPage").then((m) => ({ default: m.SettingsPage })),
);

function PageFallback() {
  return (
    <div className="space-y-4">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

/** Wrap a lazily-loaded page in a Suspense boundary with a skeleton fallback. */
function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>;
}

const upcoming = [{ path: "/calendar", title: "Calendar", phase: "Phase 8" }];

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/workout" element={<WorkoutSelectionPage />} />
              <Route
                path="/workout/live"
                element={
                  <Lazy>
                    <LiveWorkoutPage />
                  </Lazy>
                }
              />
              <Route
                path="/workout/summary"
                element={<WorkoutSummaryPage />}
              />
              <Route
                path="/progress"
                element={
                  <Lazy>
                    <HistoryPage />
                  </Lazy>
                }
              />
              <Route
                path="/achievements"
                element={
                  <Lazy>
                    <AchievementsPage />
                  </Lazy>
                }
              />
              <Route
                path="/coach"
                element={
                  <Lazy>
                    <CoachPage />
                  </Lazy>
                }
              />
              <Route
                path="/profile"
                element={
                  <Lazy>
                    <ProfilePage />
                  </Lazy>
                }
              />
              <Route
                path="/settings"
                element={
                  <Lazy>
                    <SettingsPage />
                  </Lazy>
                }
              />
              {upcoming.map((u) => (
                <Route
                  key={u.path}
                  path={u.path}
                  element={
                    <PlaceholderPage
                      title={u.title}
                      note={`This section arrives in ${u.phase}.`}
                      embedded
                    />
                  }
                />
              ))}
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
