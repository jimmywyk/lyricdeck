import { useEffect, useState } from 'react';
import type { ProjectionState } from '../types';

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
    const bg = state.background;
    switch (bg.type) {
      case 'color':
        return { backgroundColor: bg.value || '#000000' };
      case 'gradient':
        return { background: bg.value || 'linear-gradient(135deg, #1a1a2e, #16213e)' };
      case 'image':
        return {
          backgroundImage: `url("${bg.value}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: bg.blur ? `blur(${bg.blur}px)` : undefined,
        };
      default:
        return { backgroundColor: '#000000' };
    }
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

  const overlay = state.background.overlayOpacity
    ? `rgba(0,0,0,${state.background.overlayOpacity})`
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
              className="whitespace-pre-line max-w-[85%] transition-transform duration-200"
              style={{
                ...getTextStyle(),
                transform: state.lineOffset
                  ? `translateY(${-state.lineOffset * state.textStyle.fontSize * state.textStyle.lineHeight}px)`
                  : undefined,
              }}
            >
              {state.lyrics}
            </p>
          )}
        </div>
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
