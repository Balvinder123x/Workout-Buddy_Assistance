import { api } from "@/lib/api";

export interface User {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  remember_me: boolean;
}

export interface RegisterPayload {
  email: string;
  full_name: string;
  password: string;
}

export const authApi = {
  register: (payload: RegisterPayload) =>
    api.post<User>("/auth/register", payload),
  login: (payload: LoginPayload) => api.post<User>("/auth/login", payload),
  logout: () => api.post<{ message: string }>("/auth/logout"),
  me: () => api.get<User>("/auth/me"),
};
