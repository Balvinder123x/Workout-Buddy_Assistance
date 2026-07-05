import { Camera, Loader2, VideoOff } from "lucide-react";
import { type RefObject } from "react";

import type { CameraStatus } from "@/lib/pose/usePoseCamera";

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  status: CameraStatus;
  error: string | null;
  onStart: () => void;
}

export function CameraView({
  videoRef,
  canvasRef,
  status,
  error,
  onStart,
}: CameraViewProps) {
  const showOverlay = status === "idle" || status === "loading" || status === "error";

  return (
    <div className="glass relative aspect-video w-full overflow-hidden rounded-2xl bg-ink-950">
      {/* Video is mirrored so the movement reads naturally, like a mirror. */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full -scale-x-100 object-cover"
      />

      {status === "running" && (
        <span className="absolute left-4 top-4 z-10 flex items-center gap-2 text-xs text-coral-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-coral-400" />
          Live · on-device
        </span>
      )}

      {showOverlay && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-ink-950/80 px-6 text-center">
          {status === "loading" ? (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
              <p className="mt-3 text-sm text-slate-300">
                Loading pose model…
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Runs entirely in your browser
              </p>
            </>
          ) : status === "error" ? (
            <>
              <VideoOff className="h-10 w-10 text-coral-400" />
              <p className="mt-3 text-sm text-coral-300">
                {error ?? "Camera unavailable"}
              </p>
              <button onClick={onStart} className="btn-ghost mt-4 text-sm">
                Try again
              </button>
            </>
          ) : (
            <>
              <Camera className="h-10 w-10 text-slate-500" />
              <p className="mt-3 text-sm text-slate-300">
                Camera off. Start when you&apos;re ready.
              </p>
              <p className="mt-1 max-w-xs text-xs text-slate-500">
                Video never leaves your device — pose estimation runs locally.
              </p>
              <button onClick={onStart} className="btn-primary mt-4 text-sm">
                Enable camera
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
