import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Song, LyricSection, ProjectionState, BackgroundSettings, TextStyle, SectionType, AppSettings } from '../types';

const defaultBackground: BackgroundSettings = {
  type: 'color',
  value: '#000000',
};

const defaultTextStyle: TextStyle = {
  fontFamily: 'Arial',
  fontSize: 120,
  fontWeight: 'bold',
  italic: false,
  color: '#FFFFFF',
  alignment: 'center',
  verticalPosition: 'top',
  shadow: true,
  outline: false,
  lineHeight: 1.4,
  topMargin: 80,
  bottomMargin: 80,
};

const defaultProjectionState: ProjectionState = {
  mode: 'black',
  background: defaultBackground,
  textStyle: defaultTextStyle,
};

interface AppStore {
  // Song Library
  songs: Song[];
  selectedSongId: string | null;
  searchQuery: string;

  // UI State
  activeTab: 'editor' | 'arrange' | 'present' | 'settings';
  isProjectionOpen: boolean;

  // Projection
  projectionState: ProjectionState;
  currentArrangementIndex: number;

  // Settings
  settings: AppSettings;

  // Preparation List
  preparationList: string[];

  // Actions - Song Library
  setSongs: (songs: Song[]) => void;
  addSong: (defaultSectionLabel?: string) => void;
  deleteSong: (id: string) => void;
  duplicateSong: (id: string) => void;
  updateSong: (id: string, updates: Partial<Song>) => void;
  selectSong: (id: string | null) => void;
  setSearchQuery: (query: string) => void;

  // Actions - Sections
  addSection: (songId: string, type?: SectionType, localizedTypeName?: string) => void;
  updateSection: (songId: string, sectionId: string, updates: Partial<LyricSection>) => void;
  deleteSection: (songId: string, sectionId: string) => void;
  reorderSections: (songId: string, sections: LyricSection[]) => void;

  // Actions - Arrangement
  setArrangement: (songId: string, arrangement: string[]) => void;
  addToArrangement: (songId: string, sectionId: string) => void;
  removeFromArrangement: (songId: string, index: number) => void;

  // Actions - Projection
  setProjectionState: (state: Partial<ProjectionState>) => void;
  goToSlide: (index: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  setProjectionMode: (mode: ProjectionState['mode']) => void;
  setIsProjectionOpen: (open: boolean) => void;
  shiftLines: (offset: number, durationSec?: number) => void;

  // Actions - UI
  setActiveTab: (tab: AppStore['activeTab']) => void;

  // Actions - Settings
  setSettings: (settings: Partial<AppSettings>) => void;

  // Actions - Preparation List
  addToPreparationList: (songId: string) => void;
  removeFromPreparationList: (songId: string) => void;
  reorderPreparationList: (list: string[]) => void;
  clearPreparationList: () => void;
  selectFromPreparationList: (songId: string) => void;

  // Actions - Persistence
  loadFromDisk: () => Promise<void>;
  saveToDisk: () => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Initial state
  songs: [],
  selectedSongId: null,
  searchQuery: '',
  activeTab: 'editor',
  isProjectionOpen: false,
  projectionState: defaultProjectionState,
  currentArrangementIndex: -1,
  settings: {
    defaultBackground,
    defaultTextStyle,
  },
  preparationList: [],

  // Song Library actions
  setSongs: (songs) => set({ songs }),

  addSong: (defaultSectionLabel) => {
    const newSong: Song = {
      id: uuidv4(),
      title: 'New Song',
      artist: '',
      metadata: { tags: [] },
      sections: [
        {
          id: uuidv4(),
          type: 'Verse',
          label: defaultSectionLabel || 'Verse 1',
          lyrics: '',
        },
      ],
      arrangement: [],
      presentation: {
        background: { ...defaultBackground },
        textStyle: { ...defaultTextStyle },
        showCopyright: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const songs = [...get().songs, newSong];
    set({ songs, selectedSongId: newSong.id });
    get().saveToDisk();
  },

  deleteSong: (id) => {
    const songs = get().songs.filter((s) => s.id !== id);
    const selectedSongId = get().selectedSongId === id ? null : get().selectedSongId;
    set({ songs, selectedSongId });
    get().saveToDisk();
  },

  duplicateSong: (id) => {
    const song = get().songs.find((s) => s.id === id);
    if (!song) return;
    const duplicate: Song = {
      ...JSON.parse(JSON.stringify(song)),
      id: uuidv4(),
      title: `${song.title} (Copy)`,
      sections: song.sections.map((s) => ({ ...s, id: uuidv4() })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    // Update arrangement to reference new section IDs
    const sectionIdMap = new Map<string, string>();
    song.sections.forEach((s, i) => {
      sectionIdMap.set(s.id, duplicate.sections[i].id);
    });
    duplicate.arrangement = song.arrangement.map((id) => sectionIdMap.get(id) || id);

    const songs = [...get().songs, duplicate];
    set({ songs, selectedSongId: duplicate.id });
    get().saveToDisk();
  },

  updateSong: (id, updates) => {
    const songs = get().songs.map((s) =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    );
    set({ songs });
    get().saveToDisk();
  },

  selectSong: (id) => set({ selectedSongId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Section actions
  addSection: (songId, type = 'Verse', localizedTypeName) => {
    const song = get().songs.find((s) => s.id === songId);
    if (!song) return;
    const displayName = localizedTypeName || type;
    const existingSameType = song.sections.filter((s) => s.type === type).length;
    const label = existingSameType > 0 ? `${displayName} ${existingSameType + 1}` : displayName;
    const newSection: LyricSection = {
      id: uuidv4(),
      type,
      label,
      lyrics: '',
    };
    const updatedSections = [...song.sections, newSection];
    get().updateSong(songId, { sections: updatedSections });
  },

  updateSection: (songId, sectionId, updates) => {
    const song = get().songs.find((s) => s.id === songId);
    if (!song) return;
    const sections = song.sections.map((s) =>
      s.id === sectionId ? { ...s, ...updates } : s
    );
    get().updateSong(songId, { sections });
  },

  deleteSection: (songId, sectionId) => {
    const song = get().songs.find((s) => s.id === songId);
    if (!song) return;
    const sections = song.sections.filter((s) => s.id !== sectionId);
    const arrangement = song.arrangement.filter((id) => id !== sectionId);
    get().updateSong(songId, { sections, arrangement });
  },

  reorderSections: (songId, sections) => {
    get().updateSong(songId, { sections });
  },

  // Arrangement actions
  setArrangement: (songId, arrangement) => {
    get().updateSong(songId, { arrangement });
  },

  addToArrangement: (songId, sectionId) => {
    const song = get().songs.find((s) => s.id === songId);
    if (!song) return;
    const arrangement = [...song.arrangement, sectionId];
    get().updateSong(songId, { arrangement });
  },

  removeFromArrangement: (songId, index) => {
    const song = get().songs.find((s) => s.id === songId);
    if (!song) return;
    const arrangement = song.arrangement.filter((_, i) => i !== index);
    get().updateSong(songId, { arrangement });
  },

  // Projection actions
  setProjectionState: (state) => {
    const newState = { ...get().projectionState, ...state };
    set({ projectionState: newState });
    // Send to projection window
    if (window.electronAPI) {
      window.electronAPI.updateProjection(newState);
    }
  },

  goToSlide: (index) => {
    const song = get().songs.find((s) => s.id === get().selectedSongId);
    if (!song) return;
    const arrangement = song.arrangement.length > 0 ? song.arrangement : song.sections.map((s) => s.id);
    if (index < 0 || index >= arrangement.length) return;

    const sectionId = arrangement[index];
    const section = song.sections.find((s) => s.id === sectionId);
    if (!section) return;

    const background = section.backgroundOverride || song.presentation.background;
    set({ currentArrangementIndex: index });
    get().setProjectionState({
      mode: 'live',
      currentSongId: song.id,
      currentSectionId: sectionId,
      currentArrangementIndex: index,
      lyrics: section.lyrics,
      lineOffset: 0,
      background,
      textStyle: song.presentation.textStyle,
      copyright: song.presentation.showCopyright ? song.metadata.copyright : undefined,
    });
  },

  nextSlide: () => {
    const song = get().songs.find((s) => s.id === get().selectedSongId);
    if (!song) return;
    const arrangement = song.arrangement.length > 0 ? song.arrangement : song.sections.map((s) => s.id);
    const nextIndex = get().currentArrangementIndex + 1;
    if (nextIndex < arrangement.length) {
      get().goToSlide(nextIndex);
    }
  },

  prevSlide: () => {
    const prevIndex = get().currentArrangementIndex - 1;
    if (prevIndex >= 0) {
      get().goToSlide(prevIndex);
    }
  },

  setProjectionMode: (mode) => {
    get().setProjectionState({ mode });
  },

  setIsProjectionOpen: (open) => set({ isProjectionOpen: open }),

  shiftLines: (offset, durationSec) => {
    const current = get().projectionState.lineOffset || 0;
    get().setProjectionState({
      lineOffset: current + offset,
      scrollDuration: durationSec ?? 0,
    });
  },

  // UI actions
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Settings actions
  setSettings: (settings) => {
    const newSettings = { ...get().settings, ...settings };
    set({ settings: newSettings });
    if (window.electronAPI) {
      window.electronAPI.saveSettings(newSettings);
    }
  },

  // Preparation List actions
  addToPreparationList: (songId) => {
    const list = get().preparationList;
    if (list.includes(songId)) return;
    const newList = [...list, songId];
    set({ preparationList: newList });
    if (window.electronAPI) {
      window.electronAPI.savePreparationList(newList);
    }
  },

  removeFromPreparationList: (songId) => {
    const newList = get().preparationList.filter((id) => id !== songId);
    set({ preparationList: newList });
    if (window.electronAPI) {
      window.electronAPI.savePreparationList(newList);
    }
  },

  reorderPreparationList: (list) => {
    set({ preparationList: list });
    if (window.electronAPI) {
      window.electronAPI.savePreparationList(list);
    }
  },

  clearPreparationList: () => {
    set({ preparationList: [] });
    if (window.electronAPI) {
      window.electronAPI.savePreparationList([]);
    }
  },

  selectFromPreparationList: (songId) => {
    set({ selectedSongId: songId, currentArrangementIndex: -1 });
    // Show only the song's background in blank mode (no lyrics yet)
    const song = get().songs.find((s) => s.id === songId);
    if (song) {
      get().setProjectionState({
        mode: 'blank',
        currentSongId: song.id,
        currentSectionId: undefined,
        currentArrangementIndex: undefined,
        lyrics: undefined,
        lineOffset: 0,
        background: song.presentation.background,
        textStyle: song.presentation.textStyle,
        copyright: undefined,
      });
    }
  },

  // Persistence actions
  loadFromDisk: async () => {
    if (window.electronAPI) {
      const songs = await window.electronAPI.loadSongs();
      const settings = await window.electronAPI.loadSettings();
      const preparationList = await window.electronAPI.loadPreparationList();
      if (songs && songs.length > 0) {
        set({ songs });
      }
      if (settings) {
        set({ settings });
      }
      if (preparationList && preparationList.length > 0) {
        set({ preparationList });
      }
    }
  },

  saveToDisk: async () => {
    if (window.electronAPI) {
      await window.electronAPI.saveSongs(get().songs);
    }
  },
}));
