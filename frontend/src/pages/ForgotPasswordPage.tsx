import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";

import { AuthShell } from "@/components/layout/AuthShell";
import { FormInput } from "@/components/ui/FormInput";
import { validateEmail } from "@/lib/validation";

/**
 * Local demo: there is no email service in this portfolio project, so this
 * confirms the flow visually rather than sending a real reset link. Stated
 * plainly on screen so the behavior is honest.
 */
export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    setError(emailErr);
    if (emailErr) return;
    setSubmitted(true);
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll walk you through getting back in"
      footer={
        <Link to="/login" className="text-violet-400 hover:text-violet-300">
          Back to login
        </Link>
      }
    >
      {submitted ? (
        <div className="rounded-xl bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300">
          If an account exists for {email}, a reset link would be sent. This is
          a local demo, so no email is actually delivered.
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <FormInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
            autoComplete="email"
            placeholder="you@example.com"
          />
          <button type="submit" className="btn-primary mt-2">
            Send reset link
          </button>
        </form>
      )}
    </AuthShell>
  );
}
