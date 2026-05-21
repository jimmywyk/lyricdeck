import { v4 as uuidv4 } from 'uuid';
import type { Song } from '../types';

const defaultTextStyle = {
  fontFamily: 'Arial',
  fontSize: 64,
  fontWeight: 'bold' as const,
  italic: false,
  color: '#FFFFFF',
  alignment: 'center' as const,
  verticalPosition: 'middle' as const,
  shadow: true,
  outline: false,
  lineHeight: 1.4,
};

function createSong(
  title: string,
  artist: string,
  sections: Array<{ type: string; label: string; lyrics: string }>,
  metadata: Partial<Song['metadata']> = {},
  bgValue = '#1a1a2e'
): Song {
  const sectionObjects = sections.map((s) => ({
    id: uuidv4(),
    type: s.type as any,
    label: s.label,
    lyrics: s.lyrics,
  }));

  return {
    id: uuidv4(),
    title,
    artist,
    metadata: {
      tags: [],
      ...metadata,
    },
    sections: sectionObjects,
    arrangement: sectionObjects.map((s) => s.id),
    presentation: {
      background: { type: 'gradient', value: `linear-gradient(135deg, ${bgValue}, #16213e)` },
      textStyle: { ...defaultTextStyle },
      showCopyright: false,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export const seedSongs: Song[] = [
  createSong(
    'Amazing Grace',
    'John Newton',
    [
      {
        type: 'Verse',
        label: 'Verse 1',
        lyrics: 'Amazing grace, how sweet the sound\nThat saved a wretch like me\nI once was lost, but now am found\nWas blind but now I see',
      },
      {
        type: 'Verse',
        label: 'Verse 2',
        lyrics: "'Twas grace that taught my heart to fear\nAnd grace my fears relieved\nHow precious did that grace appear\nThe hour I first believed",
      },
      {
        type: 'Verse',
        label: 'Verse 3',
        lyrics: "Through many dangers, toils and snares\nI have already come\n'Tis grace hath brought me safe thus far\nAnd grace will lead me home",
      },
      {
        type: 'Verse',
        label: 'Verse 4',
        lyrics: 'When we\'ve been there ten thousand years\nBright shining as the sun\nWe\'ve no less days to sing God\'s praise\nThan when we first begun',
      },
    ],
    { key: 'G', tempo: '72' },
    '#0f0c29'
  ),
  createSong(
    '10,000 Reasons (Bless the Lord)',
    'Matt Redman',
    [
      {
        type: 'Chorus',
        label: 'Chorus',
        lyrics: 'Bless the Lord, O my soul\nO my soul, worship His holy name\nSing like never before\nO my soul, I\'ll worship Your holy name',
      },
      {
        type: 'Verse',
        label: 'Verse 1',
        lyrics: "The sun comes up, it's a new day dawning\nIt's time to sing Your song again\nWhatever may pass and whatever lies before me\nLet me be singing when the evening comes",
      },
      {
        type: 'Verse',
        label: 'Verse 2',
        lyrics: "You're rich in love and You're slow to anger\nYour name is great and Your heart is kind\nFor all Your goodness I will keep on singing\nTen thousand reasons for my heart to find",
      },
      {
        type: 'Verse',
        label: 'Verse 3',
        lyrics: "And on that day when my strength is failing\nThe end draws near and my time has come\nStill my soul will sing Your praise unending\nTen thousand years and then forevermore",
      },
    ],
    { key: 'G', tempo: '73', copyright: 'CCLI #6016351' },
    '#141e30'
  ),
  createSong(
    'How Great Is Our God',
    'Chris Tomlin',
    [
      {
        type: 'Verse',
        label: 'Verse 1',
        lyrics: 'The splendor of the King\nClothed in majesty\nLet all the earth rejoice\nAll the earth rejoice\nHe wraps Himself in light\nAnd darkness tries to hide\nAnd trembles at His voice\nAnd trembles at His voice',
      },
      {
        type: 'Chorus',
        label: 'Chorus',
        lyrics: 'How great is our God\nSing with me\nHow great is our God\nAnd all will see how great\nHow great is our God',
      },
      {
        type: 'Verse',
        label: 'Verse 2',
        lyrics: 'And age to age He stands\nAnd time is in His hands\nBeginning and the End\nBeginning and the End\nThe Godhead three in one\nFather Spirit Son\nThe Lion and the Lamb\nThe Lion and the Lamb',
      },
      {
        type: 'Bridge',
        label: 'Bridge',
        lyrics: 'Name above all names\nWorthy of all praise\nMy heart will sing\nHow great is our God',
      },
    ],
    { key: 'C', tempo: '78', copyright: 'CCLI #4348399' },
    '#000428'
  ),
  createSong(
    'Good Good Father',
    'Chris Tomlin / Pat Barrett',
    [
      {
        type: 'Verse',
        label: 'Verse 1',
        lyrics: "I've heard a thousand stories\nOf what they think You're like\nBut I've heard the tender whisper\nOf love in the dead of night\nAnd You tell me that You're pleased\nAnd that I'm never alone",
      },
      {
        type: 'Chorus',
        label: 'Chorus',
        lyrics: "You're a good good Father\nIt's who You are, it's who You are\nIt's who You are\nAnd I'm loved by You\nIt's who I am, it's who I am\nIt's who I am",
      },
      {
        type: 'Verse',
        label: 'Verse 2',
        lyrics: "I've seen many searching for answers\nFar and wide\nBut I know we're all searching\nFor answers only You provide\n'Cause You know just what we need\nBefore we say a word",
      },
      {
        type: 'Bridge',
        label: 'Bridge',
        lyrics: "You are perfect in all of Your ways\nYou are perfect in all of Your ways\nYou are perfect in all of Your ways to us",
      },
    ],
    { key: 'A', tempo: '68', copyright: 'CCLI #7036612' },
    '#1a1a2e'
  ),
];
