import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthShell } from "@/components/layout/AuthShell";
import { FormInput } from "@/components/ui/FormInput";
import { useAuth } from "@/lib/AuthContext";
import type { ApiError } from "@/lib/api";
import {
  validateConfirm,
  validateEmail,
  validateName,
  validatePassword,
} from "@/lib/validation";

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    const nameErr = validateName(fullName);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    const confErr = validateConfirm(password, confirm);
    if (nameErr) next.fullName = nameErr;
    if (emailErr) next.email = emailErr;
    if (passErr) next.password = passErr;
    if (confErr) next.confirm = confErr;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    setServerError(undefined);
    try {
      await register({ email, full_name: fullName, password });
      navigate("/dashboard");
    } catch (err) {
      setServerError((err as ApiError).detail ?? "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start training with a coach that watches your form"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-violet-400 hover:text-violet-300">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <FormInput
          label="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          autoComplete="name"
          placeholder="Alex Rivera"
        />
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
          autoComplete="new-password"
          placeholder="At least 8 characters"
        />
        <FormInput
          label="Confirm password"
          isPassword
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
          autoComplete="new-password"
          placeholder="••••••••"
        />

        {serverError && (
          <p className="rounded-lg bg-coral-500/10 px-3 py-2 text-sm text-coral-400">
            {serverError}
          </p>
        )}

        <button type="submit" className="btn-primary mt-2" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}
