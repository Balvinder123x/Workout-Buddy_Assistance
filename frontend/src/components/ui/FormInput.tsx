import { Eye, EyeOff } from "lucide-react";
import { type InputHTMLAttributes, useState } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export function FormInput({
  label,
  error,
  isPassword,
  id,
  ...rest
}: FormInputProps) {
  const [show, setShow] = useState(false);
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  const type = isPassword ? (show ? "text" : "password") : rest.type;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          {...rest}
          type={type}
          className={`w-full rounded-xl border bg-ink-900/80 px-4 py-2.5 text-cream outline-none transition placeholder:text-slate-500 focus:ring-2 ${
            error
              ? "border-coral-500 focus:ring-coral-500/30"
              : "border-white/10 focus:border-violet-500 focus:ring-violet-500/30"
          }`}
          aria-invalid={Boolean(error)}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-cream"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {error && <p className="text-sm text-coral-400">{error}</p>}
    </div>
  );
}
