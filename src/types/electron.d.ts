export {};

declare global {
  interface Window {
    electronAPI: {
      getDisplays: () => Promise<Array<{
        id: string;
        label: string;
        bounds: { x: number; y: number; width: number; height: number };
        isPrimary: boolean;
      }>>;
      openProjection: (displayId?: string) => Promise<boolean>;
      closeProjection: () => Promise<boolean>;
      isProjectionOpen: () => Promise<boolean>;
      updateProjection: (state: any) => void;
      onProjectionState: (callback: (state: any) => void) => () => void;
      onProjectionWindowClosed: (callback: () => void) => () => void;
      loadSongs: () => Promise<any[]>;
      saveSongs: (songs: any[]) => Promise<boolean>;
      loadSettings: () => Promise<any>;
      saveSettings: (settings: any) => Promise<boolean>;
      loadPreparationList: () => Promise<string[]>;
      savePreparationList: (list: string[]) => Promise<boolean>;
      selectImage: () => Promise<string | null>;
      addBackgroundImage: () => Promise<string[]>;
      listBackgroundImages: () => Promise<string[]>;
      deleteBackgroundImage: (imagePath: string) => Promise<boolean>;
      exportData: () => Promise<boolean>;
      importData: () => Promise<{ success: boolean; importedSongs?: number; importedBackgrounds?: number; error?: string }>;
    };
  }
}
