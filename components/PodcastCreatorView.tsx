import React, { useState } from 'react';
import { generateAudio } from '../services/geminiService';
import { Button } from './common/Button';
import { Loader } from './common/Loader';
import { Card } from './common/Card';

const VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];

const createWavBlob = (base64: string): Blob => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const sampleRate = 24000;
  const numChannels = 1;
  const bitsPerSample = 16;
  const dataSize = bytes.length;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const byteRate = sampleRate * blockAlign;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < dataSize; i++) {
    view.setUint8(44 + i, bytes[i]);
  }
  
  function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  return new Blob([view], { type: 'audio/wav' });
};

const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);


export const PodcastCreatorView: React.FC = () => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState(VOICES[0]);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    setAudioUrl(null);
    try {
      const audioData = await generateAudio(text, voice);
      const blob = createWavBlob(audioData);
      setAudioUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Error generating podcast:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Podcast metnini buraya girin..."
            className="w-full p-2 bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))] border border-[rgb(var(--border))] rounded-md h-48 focus:ring-2 focus:ring-[rgb(var(--ring))] focus:outline-none placeholder:text-[rgb(var(--muted-foreground))]"
            disabled={isLoading}
          />
          <div className="flex items-center gap-4">
            <select value={voice} onChange={(e) => setVoice(e.target.value)} className="p-2 bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))] border border-[rgb(var(--border))] rounded-md focus:ring-2 focus:ring-[rgb(var(--ring))] focus:outline-none">
              {VOICES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
            <Button onClick={handleGenerate} disabled={isLoading || !text.trim()}>
              {isLoading ? 'Oluşturuluyor...' : 'Podcast Oluştur'}
            </Button>
          </div>
        </div>
      </Card>

      {isLoading && <Loader />}
      
      {audioUrl && (
        <Card>
          <h3 className="text-xl font-semibold mb-4">Podcast'iniz Hazır</h3>
          <audio controls src={audioUrl} className="w-full"></audio>
          <a href={audioUrl} download="podcast.wav">
            <Button variant="secondary" className="mt-4 w-full">
                <DownloadIcon className="w-5 h-5"/>
                Podcast'i İndir
            </Button>
          </a>
        </Card>
      )}
    </div>
  );
};