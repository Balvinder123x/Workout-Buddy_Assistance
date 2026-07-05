interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  description?: string;
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium text-cream">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-motion-gradient" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-cream transition ${
            checked ? "left-[1.375rem]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
