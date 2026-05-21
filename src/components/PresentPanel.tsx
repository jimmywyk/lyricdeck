import { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { useI18n } from '../i18n';
import { PreparationList } from './PreparationList';

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
        case 'Escape':
          e.preventDefault();
          if (projectionState.mode !== 'live') {
            setProjectionMode('live');
          }
          break;
      }
    },
    [song, projectionState.mode, nextSlide, prevSlide, setProjectionMode, isProjectionOpen, selectedDisplay]
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
      <div className="p-3 border-b border-surface-700 flex items-center gap-3">
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
        {/* Section Buttons */}
        <div className="w-64 border-r border-surface-700 p-3 overflow-y-auto">
          <h3 className="text-xs font-medium text-surface-400 mb-2 uppercase tracking-wide">
            {t.present.sections}
          </h3>
          <div className="space-y-1">
            {arrangement.map((sectionId, index) => {
              const section = song.sections.find((s) => s.id === sectionId);
              if (!section) return null;
              const isActive = index === currentArrangementIndex;
              return (
                <button
                  key={`${sectionId}-${index}`}
                  onClick={() => goToSlide(index)}
                  className={`section-btn w-full text-left ${
                    isActive ? 'section-btn-active' : 'section-btn-inactive'
                  }`}
                >
                  <span className="text-xs opacity-60 mr-2">{index + 1}</span>
                  {section.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Current and Next Preview */}
          <div className="flex-1 flex gap-4">
            {/* Current Slide */}
            <div className="flex-1 flex flex-col">
              <h4 className="text-xs font-medium text-surface-400 mb-2 uppercase">{t.present.current}</h4>
              <div
                className="flex-1 rounded-lg border-2 border-primary-500 overflow-hidden relative"
                style={getPreviewBgStyle(song.presentation.background)}
              >
                {projectionState.mode === 'black' && (
                  <div className="absolute inset-0 bg-black" />
                )}
                {projectionState.mode === 'live' && currentSection && (
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <p
                      className="text-center whitespace-pre-line"
                      style={{
                        fontFamily: song.presentation.textStyle.fontFamily,
                        fontSize: '18px',
                        fontWeight: song.presentation.textStyle.fontWeight,
                        color: song.presentation.textStyle.color,
                        textShadow: song.presentation.textStyle.shadow
                          ? '2px 2px 4px rgba(0,0,0,0.8)'
                          : 'none',
                      }}
                    >
                      {currentSection.lyrics}
                    </p>
                  </div>
                )}
                {projectionState.mode === 'clear' && (
                  <div className="absolute inset-0" />
                )}
                {!currentSection && projectionState.mode === 'live' && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-surface-500 text-sm">{t.present.clickToStart}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Next Slide */}
            <div className="w-48 flex flex-col">
              <h4 className="text-xs font-medium text-surface-400 mb-2 uppercase">{t.present.next}</h4>
              <div
                className="flex-1 rounded-lg border border-surface-600 overflow-hidden relative opacity-70"
                style={getPreviewBgStyle(song.presentation.background)}
              >
                {nextSection && (
                  <div className="absolute inset-0 flex items-center justify-center p-3">
                    <p
                      className="text-center whitespace-pre-line text-xs"
                      style={{
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
          <div className="mt-4 flex items-center gap-2 justify-center">
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
          </div>

          {/* Line Shift Buttons */}
          <div className="mt-3 flex items-center gap-2 justify-center">
            <div className="flex items-center gap-1">
              <span className="text-xs text-surface-400 mr-1">{t.present.shiftUp}:</span>
              <button onClick={() => shiftLines(1)} className="btn btn-secondary text-xs px-2 py-1">
                Up 1
              </button>
              <button onClick={() => shiftLines(2)} className="btn btn-secondary text-xs px-2 py-1">
                Up 2
              </button>
              <button onClick={() => shiftLines(3)} className="btn btn-secondary text-xs px-2 py-1">
                Up 3
              </button>
              <button onClick={() => shiftLines(4)} className="btn btn-secondary text-xs px-2 py-1">
                Up 4
              </button>
            </div>
            <div className="w-px h-6 bg-surface-700 mx-1" />
            <div className="flex items-center gap-1">
              <span className="text-xs text-surface-400 mr-1">{t.present.shiftDown}:</span>
              <button onClick={() => shiftLines(-1)} className="btn btn-secondary text-xs px-2 py-1">
                Down 1
              </button>
              <button onClick={() => shiftLines(-2)} className="btn btn-secondary text-xs px-2 py-1">
                Down 2
              </button>
              <button onClick={() => shiftLines(-3)} className="btn btn-secondary text-xs px-2 py-1">
                Down 3
              </button>
              <button onClick={() => shiftLines(-4)} className="btn btn-secondary text-xs px-2 py-1">
                Down 4
              </button>
            </div>
          </div>

          {/* Keyboard shortcut hints */}
          <div className="mt-3 text-center">
            <p className="text-xs text-surface-500">
              {t.present.shortcuts}
            </p>
          </div>
        </div>

        {/* Preparation List */}
        <PreparationList mode="present" />
      </div>
    </div>
  );
}

function getPreviewBgStyle(bg: any): React.CSSProperties {
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
      };
    default:
      return { backgroundColor: '#000000' };
  }
}
