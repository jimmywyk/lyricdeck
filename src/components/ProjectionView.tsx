import { useEffect, useRef, useState } from 'react';
import type { PipPosition, ProjectionState } from '../types';
import { safeBackgroundStyle, sanitizeNumber } from '../utils/sanitize';
import { useI18n } from '../i18n';

export function ProjectionView() {
  const [state, setState] = useState<ProjectionState>({
    mode: 'black',
    background: { type: 'color', value: '#000000' },
    textStyle: {
      fontFamily: 'Arial',
      fontSize: 64,
      fontWeight: 'bold',
      italic: false,
      color: '#FFFFFF',
      alignment: 'center',
      verticalPosition: 'top',
      shadow: true,
      outline: false,
      lineHeight: 1.4,
    },
  });

  useEffect(() => {
    if (window.electronAPI) {
      const cleanup = window.electronAPI.onProjectionState((newState: ProjectionState) => {
        setState(newState);
      });
      return cleanup;
    }
  }, []);

  const getBackgroundStyle = (): React.CSSProperties => {
    return safeBackgroundStyle(state.background);
  };

  const getTextStyle = (): React.CSSProperties => {
    const ts = state.textStyle;
    return {
      fontFamily: ts.fontFamily,
      fontSize: `${ts.fontSize}px`,
      fontWeight: ts.fontWeight,
      fontStyle: ts.italic ? 'italic' : 'normal',
      color: ts.color,
      textAlign: ts.alignment,
      lineHeight: ts.lineHeight,
      textShadow: ts.shadow ? '3px 3px 6px rgba(0,0,0,0.9), 1px 1px 3px rgba(0,0,0,0.7)' : 'none',
      WebkitTextStroke: ts.outline ? '1px rgba(0,0,0,0.5)' : undefined,
    };
  };

  const getVerticalAlignment = (): string => {
    switch (state.textStyle.verticalPosition) {
      case 'top':
        return 'items-start';
      case 'bottom':
        return 'items-end';
      default:
        return 'items-center';
    }
  };

  // Render based on mode
  if (state.mode === 'black') {
    return <div className="w-screen h-screen bg-black" />;
  }

  if (state.mode === 'logo') {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <div className="text-white text-4xl font-bold opacity-50">LyricDeck 3.0</div>
      </div>
    );
  }

  // Visualizer: live camera feed on the projector
  if (state.mode === 'camera') {
    return <CameraView deviceId={state.cameraDeviceId} />;
  }

  const overlayOpacity = state.background.overlayOpacity
    ? sanitizeNumber(state.background.overlayOpacity, 0, 1, 0)
    : 0;
  const overlay = overlayOpacity > 0
    ? `rgba(0,0,0,${overlayOpacity})`
    : undefined;

  return (
    <div className="w-screen h-screen relative overflow-hidden" style={getBackgroundStyle()}>
      {/* Overlay */}
      {overlay && (
        <div className="absolute inset-0" style={{ backgroundColor: overlay }} />
      )}

      {/* Content */}
      {(state.mode === 'live' || state.mode === 'blank') && (
        <div
          className={`absolute inset-x-0 overflow-hidden flex justify-center ${getVerticalAlignment()} px-16`}
          style={{
            top: state.textStyle.topMargin ?? 80,
            bottom: state.textStyle.bottomMargin ?? 80,
          }}
        >
          {state.mode === 'live' && state.lyrics && (
            <p
              className="whitespace-pre-line max-w-[85%]"
              style={{
                ...getTextStyle(),
                transform: state.lineOffset
                  ? `translateY(${-state.lineOffset * state.textStyle.fontSize * state.textStyle.lineHeight}px)`
                  : undefined,
                transition:
                  state.scrollDuration && state.scrollDuration > 0
                    ? `transform ${state.scrollDuration}s linear`
                    : 'none',
              }}
            >
              {state.lyrics}
            </p>
          )}
        </div>
      )}

      {/* Picture-in-Picture: camera feed overlaid in a corner */}
      {state.pipEnabled && (
        <PipOverlay deviceId={state.cameraDeviceId} position={state.pipPosition} />
      )}

      {/* Copyright */}
      {state.mode === 'live' && state.copyright && (
        <div className="absolute bottom-4 left-0 right-0 text-center">
          <p className="text-white/60 text-sm">{state.copyright}</p>
        </div>
      )}
    </div>
  );
}

function useCameraStream(deviceId?: string) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    setError(false);

    async function startCamera() {
      try {
        const constraints: MediaStreamConstraints = {
          video: deviceId ? { deviceId: { exact: deviceId } } : true,
          audio: false,
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } catch {
        setError(true);
      }
    }

    startCamera();

    // Release the camera when the device changes or the view unmounts
    return () => {
      cancelled = true;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [deviceId]);

  return { videoRef, error };
}

function CameraView({ deviceId }: { deviceId?: string }) {
  const { t } = useI18n();
  const { videoRef, error } = useCameraStream(deviceId);

  if (error) {
    return (
      <div className="w-screen h-screen bg-black flex items-center justify-center">
        <p className="text-white/60 text-2xl">{t.present.cameraUnavailable}</p>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className="w-screen h-screen object-contain bg-black"
      autoPlay
      playsInline
      muted
    />
  );
}

// Small camera feed overlaid in a corner (Picture-in-Picture)
function PipOverlay({ deviceId, position }: { deviceId?: string; position?: PipPosition }) {
  const { videoRef, error } = useCameraStream(deviceId);

  // Render nothing if the camera is unavailable — keep the projection clean
  if (error) return null;

  const corner =
    position === 'bottom-left' ? 'bottom-[2vw] left-[2vw]' : 'bottom-[2vw] right-[2vw]';

  return (
    <div
      className={`absolute ${corner} w-[22vw] min-w-[200px] max-w-[520px] aspect-video rounded-xl overflow-hidden border-2 border-white/70 shadow-2xl bg-black z-20`}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />
    </div>
  );
}
