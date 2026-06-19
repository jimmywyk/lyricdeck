import type { Translations } from './en';

export const ja: Translations = {
  // App
  app: {
    title: 'LyricDeck 3.0',
    songs: '曲',
    songsPlural: '曲',
  },

  // Tabs
  tabs: {
    editor: '編集',
    arrange: '並び替え',
    present: 'プレゼン',
    settings: '設定',
  },

  // Song Library
  songLibrary: {
    search: '曲を検索...',
    searchPlaceholder: 'タイトル、アーティスト、ID、または歌詞で検索...',
    addSong: '+ 曲を追加',
    noSongs: '曲がありません',
    noResults: '曲が見つかりません',
    duplicate: '複製',
    delete: '削除',
    confirmDelete: 'この曲を削除しますか？',
    key: 'キー',
    bpm: 'BPM',
    songId: 'ID',
    sortBy: '並び替え',
    sortBySongId: '曲ID',
    sortByName: '名前',
  },

  // Editor
  editor: {
    selectSong: 'ライブラリから曲を選択して編集を開始してください',
    songTitle: '曲名',
    songIdPlaceholder: '曲ID',
    artist: 'アーティスト',
    keyPlaceholder: 'キー',
    bpmPlaceholder: 'BPM',
    copyrightPlaceholder: '著作権 / CCLI',
    sectionLabel: 'セクションラベル',
    enterLyrics: '歌詞を入力...',
    addSection: '+ セクションを追加',
    confirmDeleteSection: '「{label}」を削除しますか？',
    preview: 'プレビュー',
    empty: '（空）',
  },

  // Section Types
  sectionTypes: {
    Intro: 'イントロ',
    Verse: 'バース',
    'Pre-Chorus': 'プレコーラス',
    Chorus: 'コーラス',
    Bridge: 'ブリッジ',
    Instrumental: 'インストゥルメンタル',
    Outro: 'アウトロ',
    Custom: 'カスタム',
  },

  // Arrange
  arrange: {
    selectSong: '曲を選択してプレゼン順序を編集してください',
    availableSections: '利用可能なセクション',
    clickToAdd: 'セクションをクリックして並び替えに追加します。セクションは複数回使用できます。',
    arrangement: 'プレゼン順序',
    slides: 'スライド',
    clearAll: 'すべてクリア',
    noArrangement: '並び替えがありません',
    noArrangementHint: '左側のセクションをクリックして並び替えを作成してください',
    empty: '（空）',
  },

  // Present
  present: {
    selectSong: 'プレゼンする曲を選択してください',
    startProjection: '投影開始',
    stopProjection: '投影停止',
    live: 'ライブ',
    off: 'オフ',
    sections: 'セクション',
    current: '現在',
    next: '次へ',
    end: '終了',
    clickToStart: 'セクションをクリックして開始',
    prev: '← 前へ',
    nextBtn: '次へ →',
    blank: '空白',
    black: 'ブラック',
    logo: 'ロゴ',
    clear: 'クリア',
    shortcuts: 'Space/→ 次へ  |  ← 前へ  |  B ブラック  |  C クリア  |  P 投影  |  Esc リセット',
    shiftUp: '上に移動',
    shiftDown: '下に移動',
    scrollSpeed: '速度',
    autoFontSize: '自動フォントサイズ',
  },

  // Settings
  settings: {
    title: 'プレゼン設定',
    description: '「{title}」の視覚的な外観を設定',
    selectSong: '曲を選択してプレゼン外観をカスタマイズしてください',
    background: '背景',
    color: 'カラー：',
    gradientCss: 'グラデーション CSS：',
    gradientPlaceholder: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    chooseImage: '画像を選択...',
    backgroundPreview: '背景プレビュー',
    noBackground: '背景画像が設定されていません',
    overlayOpacity: 'オーバーレイ不透明度：',
    textStyle: 'テキストスタイル',
    fontFamily: 'フォントファミリー',
    fontSize: 'フォントサイズ',
    fontWeight: 'フォントウェイト',
    normal: '標準',
    bold: '太字',
    light: '細字',
    textColor: 'テキストカラー',
    alignment: '整列',
    left: '左揃え',
    center: '中央揃え',
    right: '右揃え',
    verticalPosition: '縦位置',
    top: '上',
    middle: '中央',
    bottom: '下',
    lineHeight: '行の高さ',
    topMargin: '上余白 (px)',
    bottomMargin: '下余白 (px)',
    textShadow: 'テキストシャドウ',
    textOutline: 'テキストアウトライン',
    italic: 'イタリック',
    copyright: '著作権表示',
    showCopyright: 'スライドに著作権情報を表示',
    language: '言語',
    languageLabel: 'インターフェース言語',
  },

  // Background Gallery
  backgroundGallery: {
    title: '画像ライブラリ',
    addImage: '+ 追加',
    empty: '背景画像がありません',
    addFirst: 'クリックして最初の背景画像を追加',
    confirmDelete: 'この画像をライブラリから削除しますか？',
    selectFromLibrary: 'ライブラリから選択',
  },

  // Import / Export
  importExport: {
    title: 'インポート / エクスポート',
    export: 'データをエクスポート',
    exportDescription: 'すべての曲、設定、背景画像をファイルにエクスポートします。',
    import: 'データをインポート',
    importDescription: 'ファイルから曲、設定、背景画像をインポートします。',
    exportSuccess: 'データのエクスポートが完了しました！',
    importSuccess: '{songs} 曲と {backgrounds} 枚の背景画像をインポートしました。',
    importFailed: 'インポートに失敗しました。ファイルが無効または破損している可能性があります。',
    exporting: 'エクスポート中...',
    importing: 'インポート中...',
  },

  // Preparation List
  preparationList: {
    title: 'セットリスト',
    empty: 'キューに曲がありません',
    emptyHint: '曲をダブルクリックしてここに追加',
    clearAll: 'すべてクリア',
    confirmClear: 'セットリスト全体をクリアしますか？',
    addToList: 'セットリストに追加',
    alreadyInList: 'すでにセットリストに追加済み',
    removeFromList: 'リストから削除',
    songCount: '{count} 曲',
  },
};
