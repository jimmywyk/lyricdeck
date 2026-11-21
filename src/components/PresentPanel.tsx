import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { useI18n } from '../i18n';
import { PreparationList } from './PreparationList';
import { safeBackgroundStyle } from '../utils/sanitize';
import type { PipPosition } from '../types';

function calculateOptimalFontSize(
  lyrics: string,
  fontFamily: string,
  fontWeight: string,
  availableWidth: number,
  maxFontSize: number
): number {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return maxFontSize;

  const lines = lyrics.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length === 0) return maxFontSize;

  const longestLine = lines.reduce((a, b) => (a.length > b.length ? a : b), '');

  let low = 10;
  let high = maxFontSize;

  while (low < high) {
    const mid = Math.ceil((low + high + 1) / 2);
    ctx.font = `${fontWeight} ${mid}px "${fontFamily}"`;
    const width = ctx.measureText(longestLine).width;
    if (width <= availableWidth) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  return low;
}

export function PresentPanel() {
  const {
    songs,
    selectedSongId,
    projectionState,
    currentArrangementIndex,
    isProjectionOpen,
    goToSlide,
    nextSlide,
    prevSlide,
    setProjectionMode,
    setIsProjectionOpen,
    shiftLines,
  } = useAppStore();
  const { t } = useI18n();

  const song = songs.find((s) => s.id === selectedSongId);
  const [displays, setDisplays] = useState<any[]>([]);
  const [selectedDisplay, setSelectedDisplay] = useState<string>('');
  const [scrollSpeed, setScrollSpeed] = useState<number>(0);
  const [autoFontSize, setAutoFontSize] = useState<boolean>(true);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');

  // Picture-in-Picture state (kept in projectionState so the projector stays in sync)
  const pipEnabled = projectionState.pipEnabled ?? false;
  const pipPosition = projectionState.pipPosition ?? 'bottom-right';

  // Enumerate camera devices (labels require a prior permission grant,
  // so request a stream once to unlock them, then stop it immediately)
  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    async function loadCameras() {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      } catch {
        return; // no camera or permission denied
      }
      if (cancelled) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cams = devices.filter((d) => d.kind === 'videoinput');
      setCameras(cams);
      if (cams.length > 0) setSelectedCamera(cams[0].deviceId);
      stream.getTracks().forEach((track) => track.stop());
    }

    loadCameras();

    return () => {
      cancelled = true;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  function toggleVisualizer() {
    if (projectionState.mode === 'camera') {
      setProjectionMode('live');
    } else {
      useAppStore.getState().setProjectionState({ mode: 'camera', cameraDeviceId: selectedCamera || undefined });
    }
  }

  function handleCameraChange(deviceId: string) {
    setSelectedCamera(deviceId);
    // Update the live feed without re-entering the mode (visualizer or PiP)
    if (projectionState.mode === 'camera' || (projectionState.pipEnabled ?? false)) {
      useAppStore.getState().setProjectionState({ cameraDeviceId: deviceId });
    }
  }

  function togglePip() {
    const current = useAppStore.getState().projectionState;
    const next = !(current.pipEnabled ?? false);
    useAppStore.getState().setProjectionState({
      pipEnabled: next,
      pipPosition: current.pipPosition ?? 'bottom-right',
      cameraDeviceId: next ? selectedCamera || undefined : current.cameraDeviceId,
    });
  }

  function setPipCorner(position: PipPosition) {
    useAppStore.getState().setProjectionState({ pipPosition: position });
  }

  // Compute uniform auto font size across ALL sections of the song
  const { setAutoFontSizeValue } = useAppStore();
  useEffect(() => {
    if (!autoFontSize || !song) {
      setAutoFontSizeValue(null);
      return;
    }

    const ts = song.presentation.textStyle;
    const targetDisplay = displays.find((d) => d.id === selectedDisplay);
    const projectorWidth = targetDisplay?.bounds?.width || 1920;
    const availableWidth = projectorWidth * 0.85 - 128;
    const maxFontSize = ts.fontSize;

    // Find optimal size for the longest line across ALL sections in the arrangement
    const arrangement =
      song.arrangement.length > 0 ? song.arrangement : song.sections.map((s) => s.id);
    const allLyrics = arrangement
      .map((id) => song.sections.find((s) => s.id === id)?.lyrics || '')
      .join('\n');

    const optimalSize = calculateOptimalFontSize(
      allLyrics,
      ts.fontFamily,
      ts.fontWeight,
      availableWidth,
      maxFontSize
    );

    setAutoFontSizeValue(optimalSize);
  }, [autoFontSize, selectedSongId, selectedDisplay, displays, song]);

  // Load displays
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getDisplays().then((d) => {
        setDisplays(d);
        const secondary = d.find((x: any) => !x.isPrimary);
        if (secondary) setSelectedDisplay(secondary.id);
        else if (d.length > 0) setSelectedDisplay(d[0].id);
      });
    }
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!song) return;
      // Don't trigger if typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;

      switch (e.key) {
        case ' ':
        case 'ArrowRight':
          e.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevSlide();
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          setProjectionMode(projectionState.mode === 'black' ? 'live' : 'black');
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          setProjectionMode(projectionState.mode === 'clear' ? 'live' : 'clear');
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          toggleProjection();
          break;
        case 'v':
        case 'V':
          e.preventDefault();
          toggleVisualizer();
          break;
        case 'i':
        case 'I':
          e.preventDefault();
          togglePip();
          break;
        case 'Escape':
          e.preventDefault();
          if (projectionState.mode !== 'live') {
            setProjectionMode('live');
          }
          break;
      }
    },
    [song, projectionState.mode, projectionState.pipEnabled, nextSlide, prevSlide, setProjectionMode, isProjectionOpen, selectedDisplay, selectedCamera]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!song) {
    return (
      <div className="flex h-full">
        <div className="flex items-center justify-center flex-1 text-surface-400">
          <p>{t.present.selectSong}</p>
        </div>
        <PreparationList mode="present" />
      </div>
    );
  }

  const arrangement =
    song.arrangement.length > 0 ? song.arrangement : song.sections.map((s) => s.id);

  const currentSection = arrangement[currentArrangementIndex]
    ? song.sections.find((s) => s.id === arrangement[currentArrangementIndex])
    : null;

  const nextSectionId = arrangement[currentArrangementIndex + 1];
  const nextSection = nextSectionId
    ? song.sections.find((s) => s.id === nextSectionId)
    : null;

  async function handleOpenProjection() {
    if (window.electronAPI) {
      await window.electronAPI.openProjection(selectedDisplay);
      setIsProjectionOpen(true);
    }
  }

  async function handleCloseProjection() {
    if (window.electronAPI) {
      await window.electronAPI.closeProjection();
      setIsProjectionOpen(false);
    }
  }

  async function toggleProjection() {
    if (isProjectionOpen) {
      await handleCloseProjection();
    } else {
      await handleOpenProjection();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Projection Controls Bar */}
      <div className="p-3 border-b border-surface-700 flex items-center gap-3 flex-wrap">
        <select
          value={selectedDisplay}
          onChange={(e) => setSelectedDisplay(e.target.value)}
          className="input w-48 text-sm py-1.5"
        >
          {displays.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
        {!isProjectionOpen ? (
          <button onClick={handleOpenProjection} className="btn btn-primary text-sm">
            {t.present.startProjection}
          </button>
        ) : (
          <button onClick={handleCloseProjection} className="btn btn-danger text-sm">
            {t.present.stopProjection}
          </button>
        )}
        <div className="w-px h-8 bg-surface-700 mx-1" />
        <select
          value={selectedCamera}
          onChange={(e) => handleCameraChange(e.target.value)}
          className="input w-44 text-xs py-1.5"
          aria-label={t.present.camera}
        >
          {cameras.length === 0 ? (
            <option value="">{t.present.noCamera}</option>
          ) : (
            cameras.map((cam, i) => (
              <option key={cam.deviceId} value={cam.deviceId}>
                {cam.label || `${t.present.camera} ${i + 1}`}
              </option>
            ))
          )}
        </select>
        <button
          onClick={toggleVisualizer}
          className={`btn text-sm ${projectionState.mode === 'camera' ? 'btn-primary' : 'btn-secondary'}`}
        >
          {t.present.visualizer}
        </button>
        <button
          onClick={togglePip}
          disabled={projectionState.mode === 'camera'}
          className={`btn text-sm ${pipEnabled ? 'btn-primary' : 'btn-secondary'} disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {t.present.pip}
        </button>
        {pipEnabled && projectionState.mode !== 'camera' && (
          <select
            value={pipPosition}
            onChange={(e) => setPipCorner(e.target.value as PipPosition)}
            className="input w-36 text-xs py-1.5"
            aria-label={t.present.pipPosition}
          >
            <option value="bottom-left">{t.present.pipLeft}</option>
            <option value="bottom-right">{t.present.pipRight}</option>
          </select>
        )}
        <div className="flex-1" />
        <span
          className={`text-xs px-2 py-1 rounded ${
            isProjectionOpen ? 'bg-green-600/20 text-green-400' : 'bg-surface-700 text-surface-400'
          }`}
        >
          {isProjectionOpen ? t.present.live : t.present.off}
        </span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main column: sections grid + bottom previews + controls */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Section Grid (enlarged area) */}
          <div className="flex-1 overflow-y-auto p-3">
            <h3 className="text-xs font-medium text-surface-400 mb-2 uppercase tracking-wide">
              {t.present.sections}
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {arrangement.map((sectionId, index) => {
                const section = song.sections.find((s) => s.id === sectionId);
                if (!section) return null;
                const isActive = index === currentArrangementIndex;
                const allLines = section.lyrics.split('\n');
                const hint =
                  allLines.slice(0, 4).join('\n') + (allLines.length > 4 ? ' ...' : '');
                return (
                  <button
                    key={`${sectionId}-${index}`}
                    onClick={() => goToSlide(index)}
                    className={`text-left p-2 rounded-lg border transition-colors ${
                      isActive
                        ? 'bg-primary-600/20 border-primary-500'
                        : 'bg-surface-800 border-surface-700 hover:bg-surface-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-surface-400">{index + 1}</span>
                      <span className="text-sm font-medium text-white truncate">
                        {section.label}
                      </span>
                    </div>
                    <pre className="text-xs text-surface-300 whitespace-pre-wrap font-sans leading-snug min-h-[3.5rem] overflow-hidden">
                      {hint || t.editor.empty}
                    </pre>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom: previews + controls */}
          <div className="border-t border-surface-700 p-3 space-y-3">
            {/* Current and Next Preview (smaller, side-by-side) */}
            <div className="flex gap-3 h-28">
              {/* Current Slide */}
              <div className="flex-1 flex flex-col min-w-0">
                <h4 className="text-xs font-medium text-surface-400 mb-1 uppercase">
                  {t.present.current}
                </h4>
                <div
                  className="flex-1 rounded-lg border-2 border-primary-500 overflow-hidden relative"
                  style={getPreviewBgStyle(song.presentation.background)}
                >
                  {projectionState.mode === 'black' && (
                    <div className="absolute inset-0 bg-black" />
                  )}
                  {projectionState.mode === 'live' && currentSection && (
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                      <p
                        className="text-center whitespace-pre-line"
                        style={{
                          fontFamily: song.presentation.textStyle.fontFamily,
                          fontSize: '12px',
                          fontWeight: song.presentation.textStyle.fontWeight,
                          color: song.presentation.textStyle.color,
                          textShadow: song.presentation.textStyle.shadow
                            ? '1px 1px 2px rgba(0,0,0,0.8)'
                            : 'none',
                        }}
                      >
                        {currentSection.lyrics.split('\n').slice(0, 4).join('\n')}
                      </p>
                    </div>
                  )}
                  {projectionState.mode === 'clear' && <div className="absolute inset-0" />}
                  {!currentSection && projectionState.mode === 'live' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-surface-500 text-xs">{t.present.clickToStart}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Slide */}
              <div className="w-40 flex flex-col">
                <h4 className="text-xs font-medium text-surface-400 mb-1 uppercase">
                  {t.present.next}
                </h4>
                <div
                  className="flex-1 rounded-lg border border-surface-600 overflow-hidden relative opacity-70"
                  style={getPreviewBgStyle(song.presentation.background)}
                >
                  {nextSection && (
                    <div className="absolute inset-0 flex items-center justify-center p-2">
                      <p
                        className="text-center whitespace-pre-line"
                        style={{
                          fontSize: '10px',
                          color: song.presentation.textStyle.color,
                          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                        }}
                      >
                        {nextSection.lyrics.split('\n').slice(0, 3).join('\n')}
                      </p>
                    </div>
                  )}
                  {!nextSection && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <p className="text-surface-500 text-xs">{t.present.end}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-2 justify-center flex-wrap">
              <button onClick={prevSlide} className="btn btn-secondary text-sm px-6">
                {t.present.prev}
              </button>
              <button onClick={nextSlide} className="btn btn-primary text-sm px-8">
                {t.present.nextBtn}
              </button>
              <div className="w-px h-8 bg-surface-700 mx-2" />
              <button
                onClick={() => setProjectionMode('blank')}
                className={`btn text-sm ${projectionState.mode === 'blank' ? 'btn-primary' : 'btn-secondary'}`}
              >
                {t.present.blank}
              </button>
              <button
                onClick={() => setProjectionMode('black')}
                className={`btn text-sm ${projectionState.mode === 'black' ? 'btn-primary' : 'btn-secondary'}`}
              >
                {t.present.black}
              </button>
              <button
                onClick={() => setProjectionMode('logo')}
                className={`btn text-sm ${projectionState.mode === 'logo' ? 'btn-primary' : 'btn-secondary'}`}
              >
                {t.present.logo}
              </button>
              <button
                onClick={() => setProjectionMode('clear')}
                className={`btn text-sm ${projectionState.mode === 'clear' ? 'btn-primary' : 'btn-secondary'}`}
              >
                {t.present.clear}
              </button>
              <div className="w-px h-8 bg-surface-700 mx-2" />
              <label className="flex items-center gap-1.5 text-xs text-surface-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoFontSize}
                  onChange={(e) => setAutoFontSize(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-surface-500 accent-primary-500"
                />
                {t.present.autoFontSize}
              </label>
            </div>

            {/* Line Shift Buttons */}
            <div className="flex items-center gap-2 justify-center flex-wrap">
              <div className="flex items-center gap-1">
                <span className="text-xs text-surface-400 mr-1">{t.present.scrollSpeed}:</span>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={scrollSpeed}
                  onChange={(e) => setScrollSpeed(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="input w-16 text-xs py-1 px-2"
                />
                <span className="text-xs text-surface-400">s</span>
              </div>
              <div className="w-px h-6 bg-surface-700 mx-1" />
              <div className="flex items-center gap-1">
                <span className="text-xs text-surface-400 mr-1">{t.present.shiftUp}:</span>
                <button onClick={() => shiftLines(1, scrollSpeed)} className="btn btn-secondary text-xs px-2 py-1">
                  ↑ 1
                </button>
                <button onClick={() => shiftLines(2, scrollSpeed)} className="btn btn-secondary text-xs px-2 py-1">
                  ↑ 2
                </button>
                <button onClick={() => shiftLines(3, scrollSpeed)} className="btn btn-secondary text-xs px-2 py-1">
                  ↑ 3
                </button>
                <button onClick={() => shiftLines(4, scrollSpeed)} className="btn btn-secondary text-xs px-2 py-1">
                  ↑ 4
                </button>
              </div>
              <div className="w-px h-6 bg-surface-700 mx-1" />
              <div className="flex items-center gap-1">
                <span className="text-xs text-surface-400 mr-1">{t.present.shiftDown}:</span>
                <button onClick={() => shiftLines(-1, scrollSpeed)} className="btn btn-secondary text-xs px-2 py-1">
                  ↓ 1
                </button>
                <button onClick={() => shiftLines(-2, scrollSpeed)} className="btn btn-secondary text-xs px-2 py-1">
                  ↓ 2
                </button>
                <button onClick={() => shiftLines(-3, scrollSpeed)} className="btn btn-secondary text-xs px-2 py-1">
                  ↓ 3
                </button>
                <button onClick={() => shiftLines(-4, scrollSpeed)} className="btn btn-secondary text-xs px-2 py-1">
                  ↓ 4
                </button>
              </div>
            </div>

            {/* Keyboard shortcut hints */}
            <div className="text-center">
              <p className="text-xs text-surface-500">{t.present.shortcuts}</p>
            </div>
          </div>
        </div>

        {/* Preparation List */}
        <PreparationList mode="present" />
      </div>
    </div>
  );
}

function getPreviewBgStyle(bg: any): React.CSSProperties {
  return safeBackgroundStyle(bg);
}
