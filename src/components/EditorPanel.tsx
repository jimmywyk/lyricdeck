import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useI18n } from '../i18n';
import type { SectionType } from '../types';

const SECTION_TYPES: SectionType[] = [
  'Intro',
  'Verse',
  'Pre-Chorus',
  'Chorus',
  'Bridge',
  'Instrumental',
  'Outro',
  'Custom',
];

export function EditorPanel() {
  const { songs, selectedSongId, updateSong, addSection, updateSection, deleteSection } = useAppStore();
  const { t } = useI18n();
  const song = songs.find((s) => s.id === selectedSongId);

  if (!song) {
    return (
      <div className="flex items-center justify-center h-full text-surface-400">
        <p>{t.editor.selectSong}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Song Metadata */}
        <div className="p-4 border-b border-surface-700 space-y-3">
          <div className="flex gap-3">
            <input
              type="text"
              value={song.title}
              onChange={(e) => updateSong(song.id, { title: e.target.value })}
              className="input text-lg font-bold flex-1"
              placeholder={t.editor.songTitle}
            />
            <input
              type="text"
              value={song.songId || ''}
              onChange={(e) => updateSong(song.id, { songId: e.target.value })}
              className="input w-32"
              placeholder={t.editor.songIdPlaceholder}
            />
            <input
              type="text"
              value={song.artist || ''}
              onChange={(e) => updateSong(song.id, { artist: e.target.value })}
              className="input w-48"
              placeholder={t.editor.artist}
            />
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={song.metadata.key || ''}
              onChange={(e) =>
                updateSong(song.id, { metadata: { ...song.metadata, key: e.target.value } })
              }
              className="input w-20"
              placeholder={t.editor.keyPlaceholder}
            />
            <input
              type="text"
              value={song.metadata.tempo || ''}
              onChange={(e) =>
                updateSong(song.id, { metadata: { ...song.metadata, tempo: e.target.value } })
              }
              className="input w-24"
              placeholder={t.editor.bpmPlaceholder}
            />
            <input
              type="text"
              value={song.metadata.copyright || ''}
              onChange={(e) =>
                updateSong(song.id, { metadata: { ...song.metadata, copyright: e.target.value } })
              }
              className="input flex-1"
              placeholder={t.editor.copyrightPlaceholder}
            />
          </div>
        </div>

        {/* Sections */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {song.sections.map((section) => (
            <SectionEditor
              key={section.id}
              section={section}
              songId={song.id}
              onUpdate={(updates) => updateSection(song.id, section.id, updates)}
              onDelete={() => {
                if (confirm(t.editor.confirmDeleteSection.replace('{label}', section.label))) {
                  deleteSection(song.id, section.id);
                }
              }}
            />
          ))}

          {/* Add Section Button */}
          <AddSectionButton onAdd={(type) => addSection(song.id, type)} />
        </div>
      </div>

      {/* Right Preview Panel */}
      <div className="w-80 border-l border-surface-700 p-4 overflow-y-auto">
        <h3 className="text-sm font-medium text-surface-300 mb-3">{t.editor.preview}</h3>
        <SlidePreview song={song} />
      </div>
    </div>
  );
}

function SectionEditor({
  section,
  songId,
  onUpdate,
  onDelete,
}: {
  section: any;
  songId: string;
  onUpdate: (updates: any) => void;
  onDelete: () => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useI18n();

  return (
    <div className="panel p-3 space-y-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-surface-400 hover:text-white w-5"
        >
          {isCollapsed ? '▶' : '▼'}
        </button>
        <select
          value={section.type}
          onChange={(e) => onUpdate({ type: e.target.value })}
          className="input w-32 text-xs py-1"
        >
          {SECTION_TYPES.map((type) => (
            <option key={type} value={type}>
              {t.sectionTypes[type]}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={section.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="input flex-1 text-sm py-1"
          placeholder={t.editor.sectionLabel}
        />
        <button onClick={onDelete} className="btn-ghost p-1 text-red-400 hover:text-red-300 text-sm">
          ✕
        </button>
      </div>
      {!isCollapsed && (
        <textarea
          value={section.lyrics}
          onChange={(e) => onUpdate({ lyrics: e.target.value })}
          className="input min-h-[100px] resize-y text-sm font-mono"
          placeholder={t.editor.enterLyrics}
          rows={4}
        />
      )}
    </div>
  );
}

function AddSectionButton({ onAdd }: { onAdd: (type: SectionType) => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const { t } = useI18n();

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="btn btn-secondary w-full text-sm"
      >
        {t.editor.addSection}
      </button>
      {showMenu && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface-800 border border-surface-600 rounded-lg shadow-xl z-10 py-1">
          {SECTION_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => {
                onAdd(type);
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-1.5 text-sm text-surface-200 hover:bg-surface-700"
            >
              {t.sectionTypes[type]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SlidePreview({ song }: { song: any }) {
  const { t } = useI18n();
  const { presentation } = song;
  const bgStyle = getBackgroundStyle(presentation.background);

  return (
    <div className="space-y-3">
      {song.sections.map((section: any) => (
        <div
          key={section.id}
          className="aspect-video rounded-lg overflow-hidden relative border border-surface-600"
          style={bgStyle}
        >
          <div className="absolute inset-0 flex items-center justify-center p-3">
            <p
              className="text-center leading-tight"
              style={{
                fontFamily: presentation.textStyle.fontFamily,
                fontSize: `${Math.max(8, presentation.textStyle.fontSize / 8)}px`,
                fontWeight: presentation.textStyle.fontWeight,
                color: presentation.textStyle.color,
                textShadow: presentation.textStyle.shadow
                  ? '1px 1px 2px rgba(0,0,0,0.8)'
                  : 'none',
              }}
            >
              {section.lyrics.split('\n').slice(0, 4).join('\n') || t.editor.empty}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
            <p className="text-xs text-surface-300 truncate">{section.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function getBackgroundStyle(bg: any): React.CSSProperties {
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
