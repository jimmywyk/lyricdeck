import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useI18n } from '../i18n';
import type { Song } from '../types';

type SortBy = 'songId' | 'name';

export function SongLibrary() {
  const { songs, selectedSongId, searchQuery, setSearchQuery, selectSong, addSong, deleteSong, duplicateSong, addToPreparationList, preparationList } =
    useAppStore();
  const { t } = useI18n();
  const [sortBy, setSortBy] = useState<SortBy>('songId');

  const filteredSongs = songs
    .filter((song) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        song.title.toLowerCase().includes(q) ||
        song.artist?.toLowerCase().includes(q) ||
        song.songId?.toLowerCase().includes(q) ||
        song.sections.some((section) => section.lyrics.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      if (sortBy === 'songId') {
        const aId = a.songId || '';
        const bId = b.songId || '';
        if (aId && bId) return aId.localeCompare(bId, undefined, { numeric: true });
        if (aId) return -1;
        if (bId) return 1;
        return a.title.localeCompare(b.title);
      }
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-surface-700">
        <input
          type="text"
          placeholder={t.songLibrary.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input text-sm"
        />
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-surface-400">{t.songLibrary.sortBy}:</span>
          <button
            onClick={() => setSortBy('songId')}
            className={`text-xs px-2 py-0.5 rounded ${sortBy === 'songId' ? 'bg-primary-600 text-white' : 'bg-surface-700 text-surface-300 hover:bg-surface-600'}`}
          >
            {t.songLibrary.sortBySongId}
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`text-xs px-2 py-0.5 rounded ${sortBy === 'name' ? 'bg-primary-600 text-white' : 'bg-surface-700 text-surface-300 hover:bg-surface-600'}`}
          >
            {t.songLibrary.sortByName}
          </button>
        </div>
      </div>

      {/* Song List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSongs.map((song) => (
          <SongItem
            key={song.id}
            song={song}
            isSelected={song.id === selectedSongId}
            isInPrepList={preparationList.includes(song.id)}
            onSelect={() => selectSong(song.id)}
            onDoubleClick={() => addToPreparationList(song.id)}
            onAddToPrep={() => addToPreparationList(song.id)}
            onDelete={() => deleteSong(song.id)}
            onDuplicate={() => duplicateSong(song.id)}
          />
        ))}
        {filteredSongs.length === 0 && (
          <p className="text-surface-400 text-sm text-center p-4">
            {searchQuery ? t.songLibrary.noResults : t.songLibrary.noSongs}
          </p>
        )}
      </div>

      {/* Add Song Button */}
      <div className="p-3 border-t border-surface-700">
        <button onClick={() => addSong(t.sectionTypes.Verse + ' 1')} className="btn btn-primary w-full text-sm">
          {t.songLibrary.addSong}
        </button>
      </div>
    </div>
  );
}

function SongItem({
  song,
  isSelected,
  isInPrepList,
  onSelect,
  onDoubleClick,
  onAddToPrep,
  onDelete,
  onDuplicate,
}: {
  song: Song;
  isSelected: boolean;
  isInPrepList: boolean;
  onSelect: () => void;
  onDoubleClick: () => void;
  onAddToPrep: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const { t } = useI18n();

  return (
    <div
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      className={`px-3 py-2 cursor-pointer border-l-3 transition-colors group ${
        isSelected
          ? 'bg-primary-600/20 border-l-primary-500'
          : 'border-l-transparent hover:bg-surface-800'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isInPrepList && (
              <span className="w-2 h-2 rounded-full bg-green-400 shrink-0" title={t.preparationList.alreadyInList} />
            )}
            <p className="text-sm font-medium text-white truncate">{song.title}</p>
            {song.songId && (
              <span className="text-xs text-primary-400 bg-primary-600/20 px-1.5 py-0.5 rounded shrink-0">
                {song.songId}
              </span>
            )}
          </div>
          {song.artist && (
            <p className="text-xs text-surface-400 truncate">{song.artist}</p>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!isInPrepList && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToPrep();
              }}
              className="p-1 hover:bg-green-600/30 rounded text-surface-400 hover:text-green-400 text-xs"
              title={t.preparationList.addToList}
            >
              +
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1 hover:bg-surface-600 rounded text-surface-400 text-xs"
            title={t.songLibrary.duplicate}
          >
            ⧉
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(t.songLibrary.confirmDelete)) onDelete();
            }}
            className="p-1 hover:bg-red-600/30 rounded text-surface-400 hover:text-red-400 text-xs"
            title={t.songLibrary.delete}
          >
            ✕
          </button>
        </div>
      </div>
      {(song.metadata.key || song.metadata.tempo) && (
        <div className="flex gap-2 mt-1">
          {song.metadata.key && (
            <span className="text-xs text-surface-500">{t.songLibrary.key}: {song.metadata.key}</span>
          )}
          {song.metadata.tempo && (
            <span className="text-xs text-surface-500">{t.songLibrary.bpm}: {song.metadata.tempo}</span>
          )}
        </div>
      )}
    </div>
  );
}
