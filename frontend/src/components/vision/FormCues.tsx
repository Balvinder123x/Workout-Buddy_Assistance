import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

import type { FormCue } from "@/lib/pose/formRules";

export function FormCues({ cues }: { cues: FormCue[] }) {
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-xs uppercase tracking-wider text-slate-500">
        Form check
      </p>

      <div className="mt-3 min-h-[3rem]">
        <AnimatePresence mode="popLayout">
          {cues.length === 0 ? (
            <motion.div
              key="good"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-sm text-emerald-300"
            >
              <CheckCircle2 className="h-4 w-4" />
              Form looks good — keep going
            </motion.div>
          ) : (
            <div className="space-y-2">
              {cues.map((cue) => (
                <motion.div
                  key={cue.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  className="flex items-center gap-2 text-sm text-coral-300"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {cue.message}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
