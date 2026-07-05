import { api } from "@/lib/api";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatResponse {
  reply: string;
  source: "gemini" | "local";
}

export const coachApi = {
  status: () => api.get<{ gemini_enabled: boolean }>("/coach/status"),
  chat: (message: string, history: ChatTurn[]) =>
    api.post<ChatResponse>("/coach/chat", { message, history }),
};
