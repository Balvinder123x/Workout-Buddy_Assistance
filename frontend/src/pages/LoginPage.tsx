import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthShell } from "@/components/layout/AuthShell";
import { FormInput } from "@/components/ui/FormInput";
import { useAuth } from "@/lib/AuthContext";
import type { ApiError } from "@/lib/api";
import { validateEmail, validatePassword } from "@/lib/validation";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    if (emailErr) next.email = emailErr;
    if (passErr) next.password = passErr;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    setServerError(undefined);
    try {
      await login({ email, password, remember_me: remember });
      navigate("/dashboard");
    } catch (err) {
      setServerError((err as ApiError).detail ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to keep your streak alive"
      onFillDemo={(demoEmail, demoPassword) => {
        setEmail(demoEmail);
        setPassword(demoPassword);
      }}
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="text-violet-400 hover:text-violet-300">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <FormInput
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          autoComplete="email"
          placeholder="you@example.com"
        />
        <FormInput
          label="Password"
          isPassword
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="current-password"
          placeholder="••••••••"
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-slate-400">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-ink-900 accent-violet-500"
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="text-violet-400 hover:text-violet-300"
          >
            Forgot password?
          </Link>
        </div>

        {serverError && (
          <p className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-400">
            {serverError}
          </p>
        )}

        <button type="submit" className="btn-primary mt-2" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthShell>
  );
}
