import express, { Request, Response } from 'express';
import cors from 'cors';
import seedrandom from 'seedrandom';
import { faker } from '@faker-js/faker';
import { createCanvas } from '@napi-rs/canvas';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Locale mapping
const localeMap: Record<string, string> = {
  'en-US': 'en_US',
  'de': 'de',
  'uk': 'uk'
};

// Music theory constants
const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  pentatonic: [0, 2, 4, 7, 9],
  blues: [0, 3, 5, 6, 7, 10]
};

const CHORD_PROGRESSIONS = [
  [0, 3, 4, 0], // I-IV-V-I
  [0, 5, 3, 4], // I-vi-IV-V
  [0, 4, 5, 3], // I-V-vi-IV
  [0, 3, 0, 4], // I-IV-I-V
];

const GENRES = [
  'Pop', 'Rock', 'Jazz', 'Electronic', 'Hip Hop', 
  'Classical', 'R&B', 'Country', 'Metal', 'Indie',
  'Folk', 'Reggae', 'Blues', 'Punk', 'Ambient'
];

interface MusicRecord {
  index: number;
  songTitle: string;
  artist: string;
  album: string;
  genre: string;
  likes: number;
  albumArtUrl?: string;
  audioUrl?: string;
}

interface GenerateParams {
  userSeed: string;
  page: number;
  pageSize: number;
  locale: string;
  averageLikes: number;
}

// Deterministic generation functions
function generateMusicRecord(
  userSeed: string,
  index: number,
  locale: string,
  averageLikes: number
): MusicRecord {
  // Create deterministic RNG for this specific record
  const baseSeed = `${userSeed}-${index}`;
  const rng = seedrandom(baseSeed);
  
  // Set faker locale
  const fakerLocale = localeMap[locale] || 'en_US';
  faker.locale = fakerLocale as any;
  faker.seed(hashStringToNumber(baseSeed));
  
  // Generate core data (independent of likes parameter)
  const songTitle = generateSongTitle(rng);
  const artist = generateArtist(rng);
  const isSingle = rng() < 0.3;
  const album = isSingle ? 'Single' : generateAlbumName(rng);
  const genreIndex = Math.floor(rng() * GENRES.length);
  const genre = GENRES[genreIndex];
  
  // Generate likes (depends on averageLikes parameter)
  const likesSeed = `${baseSeed}-likes-${averageLikes}`;
  const likesRng = seedrandom(likesSeed);
  const likes = generateLikes(likesRng, averageLikes);
  
  return {
    index,
    songTitle,
    artist,
    album,
    genre,
    likes
  };
}

function generateSongTitle(rng: () => number): string {
  const templates = [
    () => faker.word.adjective() + ' ' + faker.word.noun(),
    () => faker.word.verb() + ' ' + faker.word.adverb(),
    () => faker.word.noun() + ' in the ' + faker.word.noun(),
    () => 'The ' + faker.word.adjective() + ' ' + faker.word.noun(),
    () => faker.word.noun() + ' of ' + faker.word.noun(),
  ];
  
  const template = templates[Math.floor(rng() * templates.length)];
  const title = template();
  
  // Capitalize first letter of each word
  return title.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function generateArtist(rng: () => number): string {
  const isBand = rng() < 0.4;
  
  if (isBand) {
    const templates = [
      () => 'The ' + faker.word.adjective() + ' ' + faker.word.noun() + 's',
      () => faker.word.noun() + ' ' + faker.word.noun(),
      () => faker.word.adjective() + ' ' + faker.animal.type(),
    ];
    const template = templates[Math.floor(rng() * templates.length)];
    const name = template();
    return name.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  } else {
    return faker.person.fullName();
  }
}

function generateAlbumName(rng: () => number): string {
  const templates = [
    () => faker.word.adjective() + ' ' + faker.word.noun(),
    () => 'The ' + faker.word.noun() + ' Chronicles',
    () => faker.word.noun() + ' Sessions',
    () => faker.color.human() + ' ' + faker.word.noun(),
  ];
  
  const template = templates[Math.floor(rng() * templates.length)];
  const name = template();
  return name.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function generateLikes(rng: () => number, averageLikes: number): number {
  // Probabilistic likes based on average
  // Use exponential distribution for realistic like counts
  const lambda = 1 / (averageLikes + 0.1);
  const exponentialRandom = -Math.log(1 - rng()) / lambda;
  return Math.floor(exponentialRandom);
}

function hashStringToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// // Album art generation
// function generateAlbumArt(record: MusicRecord, seed: string): string {
//   const canvas = createCanvas(400, 400);
//   const ctx = canvas.getContext('2d');
  
//   const rng = seedrandom(seed);
  
//   // Generate background
//   const hue = Math.floor(rng() * 360);
//   const saturation = 60 + Math.floor(rng() * 40);
//   const lightness = 40 + Math.floor(rng() * 30);
  
//   const gradient = ctx.createLinearGradient(0, 0, 400, 400);
//   gradient.addColorStop(0, `hsl(${hue}, ${saturation}%, ${lightness}%)`);
//   gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, ${saturation}%, ${lightness - 20}%)`);
  
//   ctx.fillStyle = gradient;
//   ctx.fillRect(0, 0, 400, 400);
  
//   // Add geometric shapes
//   const shapeCount = 3 + Math.floor(rng() * 5);
//   for (let i = 0; i < shapeCount; i++) {
//     const shapeType = Math.floor(rng() * 3);
//     const x = rng() * 400;
//     const y = rng() * 400;
//     const size = 30 + rng() * 100;
    
//     const shapeHue = (hue + Math.floor(rng() * 180)) % 360;
//     ctx.fillStyle = `hsla(${shapeHue}, ${saturation}%, ${lightness + 20}%, 0.3)`;
    
//     if (shapeType === 0) {
//       // Circle
//       ctx.beginPath();
//       ctx.arc(x, y, size / 2, 0, Math.PI * 2);
//       ctx.fill();
//     } else if (shapeType === 1) {
//       // Rectangle
//       ctx.fillRect(x - size / 2, y - size / 2, size, size);
//     } else {
//       // Triangle
//       ctx.beginPath();
//       ctx.moveTo(x, y - size / 2);
//       ctx.lineTo(x - size / 2, y + size / 2);
//       ctx.lineTo(x + size / 2, y + size / 2);
//       ctx.closePath();
//       ctx.fill();
//     }
//   }
  
//   // Add text overlay
//   ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
//   ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
//   ctx.lineWidth = 3;
  
//   // Song title
//   ctx.font = 'bold 28px Arial';
//   ctx.textAlign = 'center';
//   ctx.strokeText(record.songTitle, 200, 320);
//   ctx.fillText(record.songTitle, 200, 320);
  
//   // Artist
//   ctx.font = '20px Arial';
//   ctx.strokeText(record.artist, 200, 355);
//   ctx.fillText(record.artist, 200, 355);
  
//   // Convert to base64
//   return canvas.toDataURL('image/png');
// }

// // Audio generation
// function generateAudio(seed: string): string {
//   const rng = seedrandom(seed);
  
//   // Select musical parameters
//   const scaleNames = Object.keys(SCALES) as Array<keyof typeof SCALES>;
//   const scaleName = scaleNames[Math.floor(rng() * scaleNames.length)];
//   const scale = SCALES[scaleName];
//   const rootNote = 48 + Math.floor(rng() * 24); // C3 to B4
//   const tempo = 100 + Math.floor(rng() * 60); // 100-160 BPM
//   const progression = CHORD_PROGRESSIONS[Math.floor(rng() * CHORD_PROGRESSIONS.length)];
  
//   // Generate simple melody
//   const sampleRate = 44100;
//   const duration = 12; // 12 seconds
//   const samples = new Float32Array(sampleRate * duration);
  
//   const beatDuration = 60 / tempo;
//   const chordDuration = beatDuration * 4;
//   const noteDuration = beatDuration / 2;
  
//   for (let i = 0; i < samples.length; i++) {
//     const time = i / sampleRate;
//     const chordIndex = Math.floor(time / chordDuration) % progression.length;
//     const chordRoot = rootNote + progression[chordIndex] * 2;
    
//     // Create chord (3 notes)
//     let sample = 0;
//     for (let j = 0; j < 3; j++) {
//       const noteIndex = scale[Math.floor((progression[chordIndex] + j * 2) % scale.length)];
//       const freq = 440 * Math.pow(2, (chordRoot + noteIndex - 69) / 12);
//       const envelope = Math.exp(-3 * (time % chordDuration));
//       sample += Math.sin(2 * Math.PI * freq * time) * envelope * 0.15;
//     }
    
//     // Add melody
//     const melodyBeat = Math.floor(time / noteDuration);
//     const melodyNoteIndex = scale[Math.floor((melodyBeat * rng()) % scale.length)];
//     const melodyNote = rootNote + 12 + melodyNoteIndex;
//     const melodyFreq = 440 * Math.pow(2, (melodyNote - 69) / 12);
//     const melodyEnvelope = Math.exp(-5 * (time % noteDuration));
//     sample += Math.sin(2 * Math.PI * melodyFreq * time) * melodyEnvelope * 0.2;
    
//     samples[i] = sample * 0.3; // Master volume
//   }
  
//   // Convert to WAV format
//   const wavData = createWavFile(samples, sampleRate);
//   return `data:audio/wav;base64,${wavData.toString('base64')}`;
// }

function generateAlbumArt(record: MusicRecord, seed: string): string {
  const canvas = createCanvas(600, 600);
  const ctx = canvas.getContext('2d');
  const rng = seedrandom(seed);

  // Background — nice radial gradient
  const centerX = 300, centerY = 300;
  const radius = 420 + rng() * 80;
  const hue = Math.floor(rng() * 360);
  const sat = 65 + rng() * 25;
  const light = 35 + rng() * 30;

  const grad = ctx.createRadialGradient(centerX, centerY, 40, centerX, centerY, radius);
  grad.addColorStop(0, `hsl(${hue}, ${sat}%, ${light + 25}%)`);
  grad.addColorStop(0.4, `hsl(${(hue + 30) % 360}, ${sat - 10}%, ${light + 5}%)`);
  grad.addColorStop(1, `hsl(${(hue + 90) % 360}, ${sat - 20}%, ${light - 25}%)`);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 600, 600);

  // Soft glow orb
  const orbGrad = ctx.createRadialGradient(300, 300, 0, 300, 300, 220);
  orbGrad.addColorStop(0, `hsla(${hue}, 90%, 88%, 0.9)`);
  orbGrad.addColorStop(0.6, `hsla(${hue}, 80%, 65%, 0.4)`);
  orbGrad.addColorStop(1, `hsla(${hue}, 70%, 30%, 0)`);
  ctx.fillStyle = orbGrad;
  ctx.beginPath();
  ctx.arc(300, 300, 220, 0, Math.PI * 2);
  ctx.fill();

  // Floating geometric accents
  ctx.globalAlpha = 0.25;
  for (let i = 0; i < 5; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = 120 + rng() * 140;
    const x = 300 + Math.cos(angle) * dist;
    const y = 300 + Math.sin(angle) * dist;
    const sz = 40 + rng() * 90;

    ctx.fillStyle = `hsla(${(hue + 180 + i*40) % 360}, 85%, 75%, 0.7)`;
    ctx.beginPath();
    ctx.arc(x, y, sz / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Title + Artist — nice shadow + sizing
  ctx.shadowColor = 'rgba(0,0,0,0.7)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 6;

  // Song title
  ctx.font = 'bold 48px Arial, Helvetica, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(record.songTitle, 300, 440);

  // Artist
  ctx.font = '300 32px Arial, Helvetica, sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fillText(record.artist, 300, 510);

  // Genre tag
  ctx.font = 'italic 22px Georgia, serif';
  ctx.fillStyle = `hsl(${(hue + 200) % 360}, 90%, 85%)`;
  ctx.fillText(record.genre.toUpperCase(), 300, 560);

  ctx.shadowBlur = 0; // reset

  return canvas.toDataURL('image/png');
}

function generateAudio(seed: string): string {
  const rng = seedrandom(seed);

  // Musical choices
  const scaleNames = Object.keys(SCALES) as Array<keyof typeof SCALES>;
  const scaleName = scaleNames[Math.floor(rng() * scaleNames.length)];
  const scale = SCALES[scaleName];
  const root = 48 + Math.floor(rng() * 20); // ~C3–G4 range
  const tempo = 78 + Math.floor(rng() * 55); // 78–132 BPM — calmer range
  const progression = CHORD_PROGRESSIONS[Math.floor(rng() * CHORD_PROGRESSIONS.length)];

  const sampleRate = 44100;
  const duration = 14; // longer loop feels more like a track
  const totalSamples = sampleRate * duration;

  const samples = new Float32Array(totalSamples);

  const beatDur = 60 / tempo;
  const chordDur = beatDur * 4;     // whole bar chords
  const arpDur = beatDur / 3;       // arpeggio feel

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;

    const chordPos = Math.floor(t / chordDur) % progression.length;
    const chordShift = progression[chordPos];

    let mix = 0;

    // Chord — richer voicing (root, 3rd, 5th + octave)
    const chordNotes = [0, 2, 4, 7]; // offsets in scale degrees
    for (const deg of chordNotes) {
      const note = scale[(chordShift + deg) % scale.length];
      const freq = 440 * Math.pow(2, (root + note - 69) / 12);
      const phase = t * freq * 2 * Math.PI;

      // Basic saw + triangle mix for warmth
      let wave = Math.sin(phase) * 0.55 + (phase % (Math.PI * 2) < Math.PI ? 1 : -1) * 0.2;

      const age = (t % chordDur) / chordDur;
      const env = Math.pow(1 - age, 3.2) * (age < 0.08 ? age / 0.08 : 1); // fast attack, long release

      mix += wave * env * 0.18;
    }

    // Arpeggio / melody line — higher register
    const arpStep = Math.floor(t / arpDur);
    const noteIdx = scale[(arpStep * 3 + Math.floor(arpStep / 4)) % scale.length]; // evolving pattern
    const melodyNote = root + 12 + noteIdx + (arpStep % 3 === 1 ? 12 : 0); // occasional octave jump
    const mFreq = 440 * Math.pow(2, (melodyNote - 69) / 12);
    const mPhase = t * mFreq * 2 * Math.PI;

    const mAge = (t % arpDur) / arpDur;
    const mEnv = Math.pow(1 - mAge, 4.5) * 1.4;

    mix += Math.sin(mPhase) * mEnv * 0.25;

    // Very subtle "reverb tail" — delayed copy
    const delaySamples = Math.floor(sampleRate * 0.18);
    if (i >= delaySamples) {
      mix += samples[i - delaySamples] * 0.22;
    }

    samples[i] = mix * 0.65; // master gain
  }

  // Hard clip + normalize
  let max = 0;
  for (let i = 0; i < samples.length; i++) {
    const v = samples[i];
    if (Math.abs(v) > max) max = Math.abs(v);
  }
  if (max > 0.01) {
    const norm = 0.92 / max;
    for (let i = 0; i < samples.length; i++) {
      samples[i] *= norm;
    }
  }

  const wavBuffer = createWavFile(samples, sampleRate);
  return `data:audio/wav;base64,${wavBuffer.toString('base64')}`;
}

function createWavFile(samples: Float32Array, sampleRate: number): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = samples.length * bitsPerSample / 8;
  
  const buffer = Buffer.alloc(44 + dataSize);
  
  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  // Write samples
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    const intSample = Math.floor(sample * 32767);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }
  
  return buffer;
}

// API Endpoints
app.get('/api/records', (req: Request, res: Response) => {
  const {
    userSeed = 'default',
    page = '0',
    pageSize = '20',
    locale = 'en-US',
    averageLikes = '5.0'
  } = req.query;
  
  const pageNum = parseInt(page as string);
  const pageSizeNum = parseInt(pageSize as string);
  const averageLikesNum = parseFloat(averageLikes as string);
  
  const records: MusicRecord[] = [];
  const startIndex = pageNum * pageSizeNum;
  
  for (let i = 0; i < pageSizeNum; i++) {
    const recordIndex = startIndex + i;
    const record = generateMusicRecord(
      userSeed as string,
      recordIndex,
      locale as string,
      averageLikesNum
    );
    records.push(record);
  }
  
  res.json({ records });
});

app.get('/api/album-art/:index', (req: Request, res: Response) => {
  const { index } = req.params;
  const {
    userSeed = 'default',
    locale = 'en-US',
    averageLikes = '5.0'
  } = req.query;
  
  const recordIndex = parseInt(index);
  const averageLikesNum = parseFloat(averageLikes as string);
  
  const record = generateMusicRecord(
    userSeed as string,
    recordIndex,
    locale as string,
    averageLikesNum
  );
  
  const seed = `${userSeed}-${recordIndex}`;
  const albumArt = generateAlbumArt(record, seed);
  
  res.json({ albumArt });
});

app.get('/api/audio/:index', (req: Request, res: Response) => {
  const { index } = req.params;
  const { userSeed = 'default' } = req.query;
  
  const seed = `${userSeed}-${index}-audio`;
  const audio = generateAudio(seed);
  
  res.json({ audio });
});

app.listen(PORT, () => {
  console.log(`🎵 Music Store Server running on http://localhost:${PORT}`);
});