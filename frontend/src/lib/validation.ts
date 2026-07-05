const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | undefined {
  if (!email) return "Email is required";
  if (!EMAIL_RE.test(email)) return "Enter a valid email address";
  return undefined;
}

export function validatePassword(password: string): string | undefined {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  return undefined;
}

export function validateName(name: string): string | undefined {
  if (!name.trim()) return "Name is required";
  return undefined;
}

export function validateConfirm(
  password: string,
  confirm: string,
): string | undefined {
  if (confirm !== password) return "Passwords do not match";
  return undefined;
}
