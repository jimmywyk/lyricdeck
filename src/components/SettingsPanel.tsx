import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { useI18n, localeLabels, type Locale } from '../i18n';
import { BackgroundGallery } from './BackgroundGallery';
import type { BackgroundSettings, TextStyle } from '../types';

export function SettingsPanel() {
  const { songs, selectedSongId, updateSong, loadFromDisk, resetState, setSongs, selectSong } = useAppStore();
  const { t, locale, setLocale } = useI18n();
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);
  const song = songs.find((s) => s.id === selectedSongId);

  function handleImportSuccess() {
    setGalleryRefreshKey((k) => k + 1);
    loadFromDisk();
  }

  if (!song) {
    return (
      <div className="h-full overflow-y-auto p-6 max-w-3xl mx-auto space-y-6">
        {/* Language setting is always visible */}
        <LanguageSection t={t} locale={locale} setLocale={setLocale} />
        {/* Import/Export always visible */}
        <ImportExportSection t={t} onImportSuccess={handleImportSuccess} />
        {/* Purge Data always visible */}
        <PurgeDataSection
          t={t}
          onPurgeAll={resetState}
          onPurgeSongs={() => {
            setSongs([]);
            selectSong(null);
          }}
        />
        <div className="flex items-center justify-center h-48 text-surface-400">
          <p>{t.settings.selectSong}</p>
        </div>
      </div>
    );
  }

  const songId = song.id;
  const { presentation } = song;

  function updateBackground(updates: Partial<BackgroundSettings>) {
    updateSong(songId, {
      presentation: {
        ...presentation,
        background: { ...presentation.background, ...updates },
      },
    });
  }

  function updateTextStyle(updates: Partial<TextStyle>) {
    updateSong(songId, {
      presentation: {
        ...presentation,
        textStyle: { ...presentation.textStyle, ...updates },
      },
    });
  }

  async function handleSelectImage() {
    if (window.electronAPI) {
      const imagePath = await window.electronAPI.selectImage();
      if (imagePath) {
        updateBackground({ type: 'image', value: imagePath });
      }
    }
  }

  return (
    <div className="h-full overflow-y-auto p-6 max-w-3xl mx-auto space-y-6">
      <h2 className="text-lg font-bold text-white">{t.settings.title}</h2>
      <p className="text-sm text-surface-400">
        {t.settings.description.replace('{title}', song.title)}
      </p>

      {/* Language */}
      <LanguageSection t={t} locale={locale} setLocale={setLocale} />

      {/* Import / Export */}
      <ImportExportSection t={t} onImportSuccess={handleImportSuccess} />

      {/* Purge Data */}
      <PurgeDataSection
        t={t}
        onPurgeAll={resetState}
        onPurgeSongs={() => {
          setSongs([]);
          selectSong(null);
        }}
      />

      {/* Background Settings */}
      <section className="panel p-4 space-y-4">
        <h3 className="text-sm font-medium text-surface-200">{t.settings.background}</h3>

        <div className="flex gap-2">
          {(['color', 'gradient', 'image'] as const).map((type) => (
            <button
              key={type}
              onClick={() => updateBackground({ type })}
              className={`btn text-xs capitalize ${
                presentation.background.type === type ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {presentation.background.type === 'color' && (
          <div className="flex items-center gap-3">
            <label className="text-sm text-surface-300">{t.settings.color}</label>
            <input
              type="color"
              value={presentation.background.value || '#000000'}
              onChange={(e) => updateBackground({ value: e.target.value })}
              className="w-10 h-10 rounded cursor-pointer border border-surface-600"
            />
            <input
              type="text"
              value={presentation.background.value || '#000000'}
              onChange={(e) => updateBackground({ value: e.target.value })}
              className="input w-32 text-sm"
            />
          </div>
        )}

        {presentation.background.type === 'gradient' && (
          <div className="space-y-2">
            <label className="text-sm text-surface-300">{t.settings.gradientCss}</label>
            <input
              type="text"
              value={presentation.background.value || ''}
              onChange={(e) => updateBackground({ value: e.target.value })}
              className="input text-sm"
              placeholder={t.settings.gradientPlaceholder}
            />
            <div className="flex gap-2 flex-wrap">
              {[
                'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
                'linear-gradient(135deg, #141e30, #243b55)',
                'linear-gradient(135deg, #000428, #004e92)',
                'linear-gradient(135deg, #1a1a2e, #16213e)',
              ].map((preset) => (
                <button
                  key={preset}
                  onClick={() => updateBackground({ value: preset })}
                  className="w-12 h-8 rounded border border-surface-600 cursor-pointer"
                  style={{ background: preset }}
                />
              ))}
            </div>
          </div>
        )}

        {presentation.background.type === 'image' && (
          <div className="space-y-4">
            <button onClick={handleSelectImage} className="btn btn-secondary text-sm">
              {t.settings.chooseImage}
            </button>
            {presentation.background.value ? (
              <div className="space-y-2">
                <div
                  className="w-full h-40 rounded-lg bg-cover bg-center border border-surface-600 relative overflow-hidden"
                  style={{ backgroundImage: `url("${presentation.background.value}")` }}
                >
                  {/* Overlay preview */}
                  {(presentation.background.overlayOpacity || 0) > 0 && (
                    <div
                      className="absolute inset-0"
                      style={{ backgroundColor: `rgba(0,0,0,${presentation.background.overlayOpacity || 0})` }}
                    />
                  )}
                  {/* Sample text preview */}
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <p
                      className="text-center"
                      style={{
                        fontFamily: presentation.textStyle.fontFamily,
                        fontSize: '16px',
                        fontWeight: presentation.textStyle.fontWeight,
                        color: presentation.textStyle.color,
                        textShadow: presentation.textStyle.shadow
                          ? '2px 2px 4px rgba(0,0,0,0.8)'
                          : 'none',
                      }}
                    >
                      {song.sections[0]?.lyrics.split('\n').slice(0, 2).join('\n') || 'Sample lyrics preview'}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-surface-500 truncate">
                  {presentation.background.value?.startsWith('lyricdeck-img://')
                    ? t.backgroundGallery.title
                    : presentation.background.value}
                </p>
              </div>
            ) : (
              <div className="w-full h-32 rounded-lg border-2 border-dashed border-surface-600 flex items-center justify-center">
                <p className="text-sm text-surface-500">{t.settings.noBackground}</p>
              </div>
            )}

            {/* Background Image Library */}
            <BackgroundGallery
              currentValue={presentation.background.value}
              onSelect={(imagePath) => updateBackground({ type: 'image', value: imagePath })}
              refreshKey={galleryRefreshKey}
            />
          </div>
        )}

        {/* Background Preview (for color/gradient) */}
        {presentation.background.type !== 'image' && (
          <div className="space-y-2">
            <h4 className="text-xs text-surface-400">{t.settings.backgroundPreview}</h4>
            <div
              className="w-full h-32 rounded-lg border border-surface-600 relative overflow-hidden"
              style={
                presentation.background.type === 'color'
                  ? { backgroundColor: presentation.background.value || '#000000' }
                  : { background: presentation.background.value || 'linear-gradient(135deg, #1a1a2e, #16213e)' }
              }
            >
              {(presentation.background.overlayOpacity || 0) > 0 && (
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: `rgba(0,0,0,${presentation.background.overlayOpacity || 0})` }}
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center p-4">
                <p
                  className="text-center"
                  style={{
                    fontFamily: presentation.textStyle.fontFamily,
                    fontSize: '14px',
                    fontWeight: presentation.textStyle.fontWeight,
                    color: presentation.textStyle.color,
                    textShadow: presentation.textStyle.shadow
                      ? '2px 2px 4px rgba(0,0,0,0.8)'
                      : 'none',
                  }}
                >
                  {song.sections[0]?.lyrics.split('\n').slice(0, 2).join('\n') || 'Sample lyrics preview'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Overlay */}
        <div className="flex items-center gap-3">
          <label className="text-sm text-surface-300">{t.settings.overlayOpacity}</label>
          <input
            type="range"
            min="0"
            max="100"
            value={(presentation.background.overlayOpacity || 0) * 100}
            onChange={(e) => updateBackground({ overlayOpacity: parseInt(e.target.value) / 100 })}
            className="flex-1"
          />
          <span className="text-xs text-surface-400 w-8">
            {Math.round((presentation.background.overlayOpacity || 0) * 100)}%
          </span>
        </div>
      </section>

      {/* Text Style Settings */}
      <section className="panel p-4 space-y-4">
        <h3 className="text-sm font-medium text-surface-200">{t.settings.textStyle}</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-surface-400 block mb-1">{t.settings.fontFamily}</label>
            <select
              value={presentation.textStyle.fontFamily}
              onChange={(e) => updateTextStyle({ fontFamily: e.target.value })}
              className="input text-sm"
            >
              {['Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Verdana', 'Trebuchet MS', 'Impact', 'Comic Sans MS', '華康超圓體'].map(
                (font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                )
              )}
            </select>
          </div>
          <div>
            <label className="text-xs text-surface-400 block mb-1">{t.settings.fontSize}</label>
            <input
              type="number"
              value={presentation.textStyle.fontSize}
              onChange={(e) => updateTextStyle({ fontSize: parseInt(e.target.value) || 64 })}
              className="input text-sm"
              min={12}
              max={200}
            />
          </div>
          <div>
            <label className="text-xs text-surface-400 block mb-1">{t.settings.fontWeight}</label>
            <select
              value={presentation.textStyle.fontWeight}
              onChange={(e) => updateTextStyle({ fontWeight: e.target.value })}
              className="input text-sm"
            >
              <option value="normal">{t.settings.normal}</option>
              <option value="bold">{t.settings.bold}</option>
              <option value="lighter">{t.settings.light}</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-surface-400 block mb-1">{t.settings.textColor}</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={presentation.textStyle.color}
                onChange={(e) => updateTextStyle({ color: e.target.value })}
                className="w-10 h-9 rounded cursor-pointer border border-surface-600"
              />
              <input
                type="text"
                value={presentation.textStyle.color}
                onChange={(e) => updateTextStyle({ color: e.target.value })}
                className="input text-sm flex-1"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-surface-400 block mb-1">{t.settings.alignment}</label>
            <select
              value={presentation.textStyle.alignment}
              onChange={(e) => updateTextStyle({ alignment: e.target.value as any })}
              className="input text-sm"
            >
              <option value="left">{t.settings.left}</option>
              <option value="center">{t.settings.center}</option>
              <option value="right">{t.settings.right}</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-surface-400 block mb-1">{t.settings.verticalPosition}</label>
            <select
              value={presentation.textStyle.verticalPosition}
              onChange={(e) => updateTextStyle({ verticalPosition: e.target.value as any })}
              className="input text-sm"
            >
              <option value="top">{t.settings.top}</option>
              <option value="middle">{t.settings.middle}</option>
              <option value="bottom">{t.settings.bottom}</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-surface-400 block mb-1">{t.settings.lineHeight}</label>
            <input
              type="number"
              value={presentation.textStyle.lineHeight}
              onChange={(e) => updateTextStyle({ lineHeight: parseFloat(e.target.value) || 1.4 })}
              className="input text-sm"
              min={1}
              max={3}
              step={0.1}
            />
          </div>
          <div>
            <label className="text-xs text-surface-400 block mb-1">{t.settings.topMargin}</label>
            <input
              type="number"
              value={presentation.textStyle.topMargin ?? 80}
              onChange={(e) => updateTextStyle({ topMargin: Math.max(0, parseInt(e.target.value) || 0) })}
              className="input text-sm"
              min={0}
              max={500}
              step={4}
            />
          </div>
          <div>
            <label className="text-xs text-surface-400 block mb-1">{t.settings.bottomMargin}</label>
            <input
              type="number"
              value={presentation.textStyle.bottomMargin ?? 80}
              onChange={(e) => updateTextStyle({ bottomMargin: Math.max(0, parseInt(e.target.value) || 0) })}
              className="input text-sm"
              min={0}
              max={500}
              step={4}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-surface-300 cursor-pointer">
            <input
              type="checkbox"
              checked={presentation.textStyle.shadow}
              onChange={(e) => updateTextStyle({ shadow: e.target.checked })}
              className="rounded"
            />
            {t.settings.textShadow}
          </label>
          <label className="flex items-center gap-2 text-sm text-surface-300 cursor-pointer">
            <input
              type="checkbox"
              checked={presentation.textStyle.outline}
              onChange={(e) => updateTextStyle({ outline: e.target.checked })}
              className="rounded"
            />
            {t.settings.textOutline}
          </label>
          <label className="flex items-center gap-2 text-sm text-surface-300 cursor-pointer">
            <input
              type="checkbox"
              checked={presentation.textStyle.italic}
              onChange={(e) => updateTextStyle({ italic: e.target.checked })}
              className="rounded"
            />
            {t.settings.italic}
          </label>
        </div>
      </section>

      {/* Copyright */}
      <section className="panel p-4 space-y-3">
        <h3 className="text-sm font-medium text-surface-200">{t.settings.copyright}</h3>
        <label className="flex items-center gap-2 text-sm text-surface-300 cursor-pointer">
          <input
            type="checkbox"
            checked={presentation.showCopyright}
            onChange={(e) =>
              updateSong(songId, {
                presentation: { ...presentation, showCopyright: e.target.checked },
              })
            }
            className="rounded"
          />
          {t.settings.showCopyright}
        </label>
      </section>
    </div>
  );
}

function LanguageSection({
  t,
  locale,
  setLocale,
}: {
  t: any;
  locale: Locale;
  setLocale: (locale: Locale) => void;
}) {
  return (
    <section className="panel p-4 space-y-3">
      <h3 className="text-sm font-medium text-surface-200">{t.settings.language}</h3>
      <div>
        <label className="text-xs text-surface-400 block mb-1">{t.settings.languageLabel}</label>
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          className="input text-sm w-48"
        >
          {(Object.entries(localeLabels) as [Locale, string][]).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}

function ImportExportSection({ t, onImportSuccess }: { t: any; onImportSuccess: () => void }) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleExport() {
    if (!window.electronAPI) return;
    setBusy(true);
    setStatus(null);
    try {
      const result = await window.electronAPI.exportData();
      if (result) {
        setStatus(t.importExport.exportSuccess);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleImport() {
    if (!window.electronAPI) return;
    setBusy(true);
    setStatus(null);
    try {
      const result = await window.electronAPI.importData();
      if (result.success) {
        setStatus(
          t.importExport.importSuccess
            .replace('{songs}', String(result.importedSongs || 0))
            .replace('{backgrounds}', String(result.importedBackgrounds || 0))
        );
        onImportSuccess();
      } else if (result.error) {
        setStatus(t.importExport.importFailed);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleImportUpsert() {
    if (!window.electronAPI) return;
    setBusy(true);
    setStatus(null);
    try {
      const result = await window.electronAPI.importDataUpsert();
      if (result.success) {
        setStatus(
          t.importExport.importUpsertSuccess
            .replace('{added}', String(result.importedSongs || 0))
            .replace('{updated}', String(result.updatedSongs || 0))
            .replace('{bgAdded}', String(result.importedBackgrounds || 0))
            .replace('{bgUpdated}', String(result.updatedBackgrounds || 0))
        );
        onImportSuccess();
      } else if (result.error) {
        setStatus(t.importExport.importFailed);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel p-4 space-y-3">
      <h3 className="text-sm font-medium text-surface-200">{t.importExport.title}</h3>
      <div className="space-y-3">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <p className="text-xs text-surface-400">{t.importExport.exportDescription}</p>
          </div>
          <button
            onClick={handleExport}
            disabled={busy}
            className="btn btn-secondary text-sm whitespace-nowrap"
          >
            {busy ? t.importExport.exporting : t.importExport.export}
          </button>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <p className="text-xs text-surface-400">{t.importExport.importDescription}</p>
          </div>
          <button
            onClick={handleImport}
            disabled={busy}
            className="btn btn-secondary text-sm whitespace-nowrap"
          >
            {busy ? t.importExport.importing : t.importExport.import}
          </button>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <p className="text-xs text-surface-400">{t.importExport.importUpsertDescription}</p>
          </div>
          <button
            onClick={handleImportUpsert}
            disabled={busy}
            className="btn btn-secondary text-sm whitespace-nowrap"
          >
            {busy ? t.importExport.importing : t.importExport.importUpsert}
          </button>
        </div>
        {status && (
          <p className="text-xs text-primary-400 mt-2">{status}</p>
        )}
      </div>
    </section>
  );
}

function PurgeDataSection({
  t,
  onPurgeAll,
  onPurgeSongs,
}: {
  t: any;
  onPurgeAll: () => void;
  onPurgeSongs: () => void;
}) {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handlePurgeAll() {
    if (!window.electronAPI) return;
    const confirmed = window.confirm(t.purgeData.confirmPurgeAll);
    if (!confirmed) return;

    setBusy(true);
    setStatus(null);
    try {
      await window.electronAPI.purgeAllData();
      onPurgeAll();
      setStatus(t.purgeData.purgeAllSuccess);
    } finally {
      setBusy(false);
    }
  }

  async function handlePurgeSongs() {
    if (!window.electronAPI) return;
    const confirmed = window.confirm(t.purgeData.confirmPurgeSongs);
    if (!confirmed) return;

    setBusy(true);
    setStatus(null);
    try {
      await window.electronAPI.purgeSongsOnly();
      onPurgeSongs();
      setStatus(t.purgeData.purgeSongsSuccess);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel p-4 space-y-3">
      <h3 className="text-sm font-medium text-surface-200">{t.purgeData.title}</h3>
      <div className="space-y-3">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <p className="text-xs text-surface-400">{t.purgeData.purgeAllDescription}</p>
          </div>
          <button
            onClick={handlePurgeAll}
            disabled={busy}
            className="btn btn-secondary text-sm whitespace-nowrap text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
          >
            {busy ? t.purgeData.purging : t.purgeData.purgeAll}
          </button>
        </div>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <p className="text-xs text-surface-400">{t.purgeData.purgeSongsDescription}</p>
          </div>
          <button
            onClick={handlePurgeSongs}
            disabled={busy}
            className="btn btn-secondary text-sm whitespace-nowrap text-amber-400 border-amber-400 hover:bg-amber-400 hover:text-white"
          >
            {busy ? t.purgeData.purging : t.purgeData.purgeSongs}
          </button>
        </div>
        {status && (
          <p className="text-xs text-primary-400 mt-2">{status}</p>
        )}
      </div>
    </section>
  );
}
