import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, Send, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Markdown } from "@/components/coach/Markdown";
import { type ChatTurn, coachApi } from "@/lib/coachApi";
import { speak } from "@/lib/pose/voice";
import { useSpeechInput } from "@/lib/useSpeechInput";

interface Message extends ChatTurn {
  id: number;
  animate?: boolean;
}

const suggestions = [
  "How is my form?",
  "What should I train next?",
  "Give me some motivation",
  "Suggest a post-workout meal",
];

let messageId = 0;

export function CoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: messageId++,
      role: "assistant",
      content:
        "Hi! I'm your AI coach. I can see your training stats and help with " +
        "form, meals, recovery, and motivation. What's on your mind?",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [voiceOut, setVoiceOut] = useState(false);
  const [geminiEnabled, setGeminiEnabled] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    coachApi
      .status()
      .then((s) => setGeminiEnabled(s.gemini_enabled))
      .catch(() => setGeminiEnabled(false));
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;

      const history: ChatTurn[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      setMessages((prev) => [
        ...prev,
        { id: messageId++, role: "user", content: trimmed },
      ]);
      setInput("");
      setSending(true);

      try {
        const res = await coachApi.chat(trimmed, history);
        setMessages((prev) => [
          ...prev,
          {
            id: messageId++,
            role: "assistant",
            content: res.reply,
            animate: true,
          },
        ]);
        if (voiceOut) speak(res.reply, true);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: messageId++,
            role: "assistant",
            content:
              "I couldn't reach the coach service. Is the backend running?",
          },
        ]);
      } finally {
        setSending(false);
      }
    },
    [messages, sending, voiceOut],
  );

  const handleTranscript = useCallback(
    (text: string) => {
      setInput(text);
      void send(text);
    },
    [send],
  );

  const { listening, supported: micSupported, toggle: toggleMic } =
    useSpeechInput(handleTranscript);

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-motion-gradient">
            <Sparkles className="h-5 w-5 text-ink-950" />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold text-cream">
              AI Coach
            </h1>
            <p className="text-xs text-slate-500">
              {geminiEnabled === null
                ? "…"
                : geminiEnabled
                  ? "Powered by Gemini · grounded in your stats"
                  : "Local mode · add a Gemini key for richer replies"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setVoiceOut((v) => !v)}
          aria-label="Toggle voice output"
          aria-pressed={voiceOut}
          className={`btn-ghost flex items-center gap-2 text-sm ${
            voiceOut ? "text-cyan-400" : ""
          }`}
        >
          {voiceOut ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </button>
      </div>

      <div
        ref={scrollRef}
        className="glass flex-1 space-y-4 overflow-y-auto rounded-2xl p-5"
      >
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                m.role === "user"
                  ? "rounded-tr-sm bg-motion-gradient text-ink-950"
                  : "rounded-tl-sm bg-white/5"
              }`}
            >
              {m.role === "user" ? (
                <p className="text-sm">{m.content}</p>
              ) : (
                <Markdown text={m.content} />
              )}
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {sending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="flex gap-1 rounded-2xl rounded-tl-sm bg-white/5 px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-2 w-2 rounded-full bg-slate-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {messages.length <= 1 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => void send(s)}
              className="glass rounded-full px-3 py-1.5 text-xs text-slate-300 transition hover:text-cream"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="mt-3 flex items-center gap-2"
      >
        {micSupported && (
          <button
            type="button"
            onClick={toggleMic}
            aria-label="Voice input"
            className={`btn-ghost p-3 ${listening ? "text-coral-400" : ""}`}
          >
            {listening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </button>
        )}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your coach…"
          className="flex-1 rounded-xl border border-white/10 bg-ink-900 px-4 py-3 text-sm text-cream outline-none focus:border-violet-500"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="btn-primary p-3 disabled:opacity-50"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
