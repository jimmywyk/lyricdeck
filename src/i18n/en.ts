export const en = {
  // App
  app: {
    title: 'LyricDeck 3.0',
    songs: 'song',
    songsPlural: 'songs',
  },

  // Tabs
  tabs: {
    editor: 'Editor',
    arrange: 'Arrange',
    present: 'Present',
    settings: 'Settings',
  },

  // Song Library
  songLibrary: {
    search: 'Search songs...',
    searchPlaceholder: 'Search title, artist, ID, or lyrics...',
    addSong: '+ Add Song',
    noSongs: 'No songs yet',
    noResults: 'No songs found',
    duplicate: 'Duplicate',
    delete: 'Delete',
    confirmDelete: 'Delete this song?',
    key: 'Key',
    bpm: 'BPM',
    songId: 'ID',
    sortBy: 'Sort',
    sortBySongId: 'Song ID',
    sortByName: 'Name',
  },

  // Editor
  editor: {
    selectSong: 'Select a song from the library to start editing',
    songTitle: 'Song Title',
    songIdPlaceholder: 'Song ID',
    artist: 'Artist',
    keyPlaceholder: 'Key',
    bpmPlaceholder: 'BPM',
    copyrightPlaceholder: 'Copyright / CCLI',
    sectionLabel: 'Section label',
    enterLyrics: 'Enter lyrics...',
    addSection: '+ Add Section',
    confirmDeleteSection: 'Delete "{label}"?',
    preview: 'Preview',
    empty: '(empty)',
  },

  // Section Types
  sectionTypes: {
    Intro: 'Intro',
    Verse: 'Verse',
    'Pre-Chorus': 'Pre-Chorus',
    Chorus: 'Chorus',
    Bridge: 'Bridge',
    Instrumental: 'Instrumental',
    Outro: 'Outro',
    Custom: 'Custom',
  },

  // Arrange
  arrange: {
    selectSong: 'Select a song to arrange its presentation',
    availableSections: 'Available Sections',
    clickToAdd: 'Click a section to add it to the arrangement. Sections can be used multiple times.',
    arrangement: 'Presentation Arrangement',
    slides: 'slides',
    clearAll: 'Clear All',
    noArrangement: 'No arrangement yet',
    noArrangementHint: 'Click sections on the left to build your arrangement',
    empty: '(empty)',
  },

  // Present
  present: {
    selectSong: 'Select a song to present',
    startProjection: 'Start Projection',
    stopProjection: 'Stop Projection',
    live: 'LIVE',
    off: 'OFF',
    sections: 'Sections',
    current: 'Current',
    next: 'Next',
    end: 'End',
    clickToStart: 'Click a section to start',
    prev: '← Prev',
    nextBtn: 'Next →',
    blank: 'Blank',
    black: 'Black',
    logo: 'Logo',
    clear: 'Clear',
    shortcuts: 'Space/→ Next  |  ← Prev  |  B Black  |  C Clear  |  P Projection  |  Esc Reset',
    shiftUp: 'Shift Up',
    shiftDown: 'Shift Down',
    scrollSpeed: 'Speed',
    autoFontSize: 'Auto Font Size',
  },

  // Settings
  settings: {
    title: 'Presentation Settings',
    description: 'Configure the visual appearance for "{title}"',
    selectSong: 'Select a song to customize its presentation',
    background: 'Background',
    color: 'Color:',
    gradientCss: 'Gradient CSS:',
    gradientPlaceholder: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    chooseImage: 'Choose Image...',
    backgroundPreview: 'Background Preview',
    noBackground: 'No background image set',
    overlayOpacity: 'Overlay Opacity:',
    textStyle: 'Text Style',
    fontFamily: 'Font Family',
    fontSize: 'Font Size',
    fontWeight: 'Font Weight',
    normal: 'Normal',
    bold: 'Bold',
    light: 'Light',
    textColor: 'Text Color',
    alignment: 'Alignment',
    left: 'Left',
    center: 'Center',
    right: 'Right',
    verticalPosition: 'Vertical Position',
    top: 'Top',
    middle: 'Middle',
    bottom: 'Bottom',
    lineHeight: 'Line Height',
    topMargin: 'Top Margin (px)',
    bottomMargin: 'Bottom Margin (px)',
    textShadow: 'Text Shadow',
    textOutline: 'Text Outline',
    italic: 'Italic',
    copyright: 'Copyright Display',
    showCopyright: 'Show copyright info on slides',
    language: 'Language',
    languageLabel: 'Interface Language',
  },

  // Background Gallery
  backgroundGallery: {
    title: 'Image Library',
    addImage: '+ Add',
    empty: 'No background images yet',
    addFirst: 'Click to add your first background image',
    confirmDelete: 'Remove this image from the library?',
    selectFromLibrary: 'Select from library',
  },

  // Import / Export
  importExport: {
    title: 'Import / Export',
    export: 'Export Data',
    exportDescription: 'Export all songs, settings, and background images to a file.',
    import: 'Import Data',
    importDescription: 'Import songs, settings, and background images from a file.',
    exportSuccess: 'Data exported successfully!',
    importSuccess: 'Imported {songs} songs and {backgrounds} background images.',
    importFailed: 'Import failed. The file may be invalid or corrupted.',
    exporting: 'Exporting...',
    importing: 'Importing...',
  },

  // Preparation List
  preparationList: {
    title: 'Preparation List',
    empty: 'No songs queued',
    emptyHint: 'Double-click a song to add it here',
    clearAll: 'Clear All',
    confirmClear: 'Clear the entire preparation list?',
    addToList: 'Add to preparation list',
    alreadyInList: 'Already in preparation list',
    removeFromList: 'Remove from list',
    songCount: '{count} songs',
  },
};

export type Translations = typeof en;
