import type { Translations } from './en';

export const zhTW: Translations = {
  // App
  app: {
    title: '歌詞投影器3.0',
    songs: '首歌曲',
    songsPlural: '首歌曲',
  },

  // Tabs
  tabs: {
    editor: '編輯',
    arrange: '排列',
    present: '放映',
    settings: '設定',
  },

  // Song Library
  songLibrary: {
    search: '搜尋歌曲...',
    searchPlaceholder: '搜尋標題、演唱者、編號或歌詞...',
    addSong: '+ 新增歌曲',
    noSongs: '尚無歌曲',
    noResults: '找不到歌曲',
    duplicate: '複製',
    delete: '刪除',
    confirmDelete: '確定要刪除這首歌曲嗎？',
    key: '調',
    bpm: 'BPM',
    songId: '編號',
    sortBy: '排序',
    sortBySongId: '歌曲編號',
    sortByName: '名稱',
  },

  // Editor
  editor: {
    selectSong: '從歌曲庫中選擇一首歌曲開始編輯',
    songTitle: '歌曲名稱',
    songIdPlaceholder: '歌曲編號',
    artist: '演唱者',
    keyPlaceholder: '調',
    bpmPlaceholder: 'BPM',
    copyrightPlaceholder: '版權 / CCLI',
    sectionLabel: '段落名稱',
    enterLyrics: '輸入歌詞...',
    addSection: '+ 新增段落',
    confirmDeleteSection: '確定要刪除「{label}」嗎？',
    preview: '預覽',
    empty: '（空白）',
  },

  // Section Types
  sectionTypes: {
    Intro: '前奏',
    Verse: '主歌',
    'Pre-Chorus': '導歌',
    Chorus: '副歌',
    Bridge: '橋段',
    Instrumental: '間奏',
    Outro: '尾奏',
    Custom: '自訂',
  },

  // Arrange
  arrange: {
    selectSong: '選擇一首歌曲來編排放映順序',
    availableSections: '可用段落',
    clickToAdd: '點擊段落將其加入排列。段落可重複使用。',
    arrangement: '放映排列',
    slides: '張投影片',
    clearAll: '全部清除',
    noArrangement: '尚未排列',
    noArrangementHint: '點擊左側的段落來建立放映排列',
    empty: '（空白）',
  },

  // Present
  present: {
    selectSong: '選擇一首歌曲進行放映',
    startProjection: '開始投影',
    stopProjection: '停止投影',
    live: '放映中',
    off: '關閉',
    sections: '段落',
    current: '目前',
    next: '下一張',
    end: '結束',
    clickToStart: '點擊段落開始放映',
    prev: '← 上一張',
    nextBtn: '下一張 →',
    blank: '空白',
    black: '黑幕',
    logo: '標誌',
    clear: '清除',
    shortcuts: 'Space/→ 下一張  |  ← 上一張  |  B 黑幕  |  C 清除  |  P 投影  |  Esc 還原',
    shiftUp: '上移',
    shiftDown: '下移',
  },

  // Settings
  settings: {
    title: '放映設定',
    description: '設定「{title}」的視覺外觀',
    selectSong: '選擇一首歌曲來自訂放映外觀',
    background: '背景',
    color: '顏色：',
    gradientCss: '漸層 CSS：',
    gradientPlaceholder: 'linear-gradient(135deg, #1a1a2e, #16213e)',
    chooseImage: '選擇圖片...',
    backgroundPreview: '背景預覽',
    noBackground: '尚未設定背景圖片',
    overlayOpacity: '覆蓋透明度：',
    textStyle: '文字樣式',
    fontFamily: '字型',
    fontSize: '字體大小',
    fontWeight: '字體粗細',
    normal: '一般',
    bold: '粗體',
    light: '細體',
    textColor: '文字顏色',
    alignment: '對齊',
    left: '靠左',
    center: '置中',
    right: '靠右',
    verticalPosition: '垂直位置',
    top: '上方',
    middle: '中間',
    bottom: '下方',
    lineHeight: '行距',
    topMargin: '上邊界 (px)',
    bottomMargin: '下邊界 (px)',
    textShadow: '文字陰影',
    textOutline: '文字外框',
    italic: '斜體',
    copyright: '版權資訊',
    showCopyright: '在投影片上顯示版權資訊',
    language: '語言',
    languageLabel: '介面語言',
  },

  // Background Gallery
  backgroundGallery: {
    title: '圖片庫',
    addImage: '+ 新增',
    empty: '尚無背景圖片',
    addFirst: '點擊新增第一張背景圖片',
    confirmDelete: '確定要從圖片庫中移除這張圖片嗎？',
    selectFromLibrary: '從圖片庫選擇',
  },

  // Import / Export
  importExport: {
    title: '匯入 / 匯出',
    export: '匯出資料',
    exportDescription: '將所有歌曲、設定和背景圖片匯出為檔案。',
    import: '匯入資料',
    importDescription: '從檔案匯入歌曲、設定和背景圖片。',
    exportSuccess: '資料匯出成功！',
    importSuccess: '已匯入 {songs} 首歌曲和 {backgrounds} 張背景圖片。',
    importFailed: '匯入失敗。檔案可能無效或已損壞。',
    exporting: '匯出中...',
    importing: '匯入中...',
  },

  // Preparation List
  preparationList: {
    title: '預備清單',
    empty: '尚無歌曲排列',
    emptyHint: '雙擊歌曲將其加入此處',
    clearAll: '全部清除',
    confirmClear: '確定要清除整個預備清單嗎？',
    addToList: '加入預備清單',
    alreadyInList: '已在預備清單中',
    removeFromList: '從清單中移除',
    songCount: '{count} 首歌曲',
  },
};
