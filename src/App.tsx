import { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { useI18n } from './i18n';
import { SongLibrary } from './components/SongLibrary';
import { EditorPanel } from './components/EditorPanel';
import { ArrangePanel } from './components/ArrangePanel';
import { PresentPanel } from './components/PresentPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { ProjectionView } from './components/ProjectionView';
import { seedSongs } from './utils/seedData';

function App() {
  const { activeTab, setActiveTab, loadFromDisk, songs, setSongs } = useAppStore();
  const { t } = useI18n();

  // Check if we're in the projection window
  const isProjectionWindow = window.location.hash === '#/projection';

  useEffect(() => {
    if (!isProjectionWindow) {
      loadFromDisk().then(() => {
        // Load seed data if no songs exist
        const currentSongs = useAppStore.getState().songs;
        if (currentSongs.length === 0) {
          setSongs(seedSongs);
          if (window.electronAPI) {
            window.electronAPI.saveSongs(seedSongs);
          }
        }
      });
    }
  }, []);

  // Listen for projection window close
  useEffect(() => {
    if (!isProjectionWindow && window.electronAPI) {
      const cleanup = window.electronAPI.onProjectionWindowClosed(() => {
        useAppStore.getState().setIsProjectionOpen(false);
      });
      return cleanup;
    }
  }, [isProjectionWindow]);

  if (isProjectionWindow) {
    return <ProjectionView />;
  }

  const tabs = [
    { id: 'editor' as const, label: t.tabs.editor },
    { id: 'arrange' as const, label: t.tabs.arrange },
    { id: 'present' as const, label: t.tabs.present },
    { id: 'settings' as const, label: t.tabs.settings },
  ];

  return (
    <div className="h-screen flex flex-col bg-surface-950">
      {/* Header / Tab Bar */}
      <header className="flex items-center justify-between px-4 py-2 bg-surface-900 border-b border-surface-700">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-white mr-4">{t.app.title}</h1>
          <nav className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white'
                    : 'text-surface-300 hover:bg-surface-700 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="text-xs text-surface-400">
          {songs.length} {songs.length !== 1 ? t.app.songsPlural : t.app.songs}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel - Song Library */}
        <aside className="w-72 border-r border-surface-700 flex flex-col">
          <SongLibrary />
        </aside>

        {/* Center Panel */}
        <section className="flex-1 overflow-hidden">
          {activeTab === 'editor' && <EditorPanel />}
          {activeTab === 'arrange' && <ArrangePanel />}
          {activeTab === 'present' && <PresentPanel />}
          {activeTab === 'settings' && <SettingsPanel />}
        </section>
      </main>
    </div>
  );
}

export default App;
