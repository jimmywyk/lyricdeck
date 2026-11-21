// Type definitions for LyricDeck

export type SectionType =
  | 'Intro'
  | 'Verse'
  | 'Pre-Chorus'
  | 'Chorus'
  | 'Bridge'
  | 'Instrumental'
  | 'Outro'
  | 'Custom';

export interface LyricSection {
  id: string;
  type: SectionType;
  label: string;
  lyrics: string;
  backgroundOverride?: BackgroundSettings;
}

export interface BackgroundSettings {
  type: 'color' | 'gradient' | 'image' | 'video';
  value: string;
  overlayColor?: string;
  overlayOpacity?: number;
  blur?: number;
}

export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  italic: boolean;
  color: string;
  alignment: 'left' | 'center' | 'right';
  verticalPosition: 'top' | 'middle' | 'bottom';
  shadow: boolean;
  outline: boolean;
  lineHeight: number;
  topMargin?: number;
  bottomMargin?: number;
}

export interface PresentationSettings {
  background: BackgroundSettings;
  textStyle: TextStyle;
  showCopyright: boolean;
}

export interface Song {
  id: string;
  songId?: string;
  title: string;
  artist?: string;
  metadata: {
    key?: string;
    tempo?: string;
    copyright?: string;
    tags?: string[];
    notes?: string;
  };
  sections: LyricSection[];
  arrangement: string[];
  presentation: PresentationSettings;
  createdAt: string;
  updatedAt: string;
}

export type ProjectionMode = 'live' | 'blank' | 'black' | 'logo' | 'clear' | 'camera';

export type PipPosition = 'bottom-left' | 'bottom-right';

export interface ProjectionState {
  mode: ProjectionMode;
  currentSongId?: string;
  currentSectionId?: string;
  currentArrangementIndex?: number;
  lyrics?: string;
  lineOffset?: number;
  scrollDuration?: number;
  background: BackgroundSettings;
  textStyle: TextStyle;
  copyright?: string;
  cameraDeviceId?: string;
  pipEnabled?: boolean;
  pipPosition?: PipPosition;
}

export interface AppSettings {
  projectionMonitor?: string;
  defaultBackground: BackgroundSettings;
  defaultTextStyle: TextStyle;
  logoImage?: string;
}
