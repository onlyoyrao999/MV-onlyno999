import React, { useState, useEffect } from 'react';
import { DEMO_LYRICS, LyricLine } from '../data/mockPipelineData';
import { Play, Pause, RotateCcw, Check, Edit3, Volume2, ShieldCheck, AlertTriangle } from 'lucide-react';

export const LyricTimelineTab: React.FC = () => {
  const [lyrics, setLyrics] = useState<LyricLine[]>(DEMO_LYRICS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0.0);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);

  // Playback timer simulation
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= 32.0) {
            setIsPlaying(false);
            return 0.0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const activeLine = lyrics.find(l => currentTime >= l.start && currentTime < l.end);

  const handleUpdateText = (id: string, newText: string) => {
    setLyrics(prev => prev.map(l => l.id === id ? { ...l, text: newText, confidence: 1.0 } : l));
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs border border-cyan-500/30">
              GATE 1 审查台
            </span>
            <h2 className="text-base font-bold text-white">歌词提取与强制对齐 (ASR + 官方歌词纠偏)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            整条链的时间基准在此诞生。ASR 只负责提供毫秒时间戳，文本用官方歌词进行词级 Levenshtein 校正。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shadow-md shadow-cyan-500/20"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isPlaying ? '暂停模拟' : '播放对齐试听'}</span>
          </button>
          <button
            onClick={() => { setIsPlaying(false); setCurrentTime(0.0); }}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition"
            title="重置播放头"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Audio Waveform & Playhead */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <Volume2 className="w-4 h-4" />
            <span>原曲母带时间轴: {currentTime.toFixed(2)}s / 32.00s</span>
          </div>
          <span className="text-slate-500">采样率 44.1kHz · 16bit · 无损 WAV 基准</span>
        </div>

        {/* Waveform Bar Track */}
        <div className="relative h-20 bg-slate-950/80 rounded-lg overflow-hidden border border-slate-800 flex items-center px-2">
          {/* Simulated Waveform Bars */}
          <div className="w-full h-full flex items-center justify-between gap-1 opacity-70">
            {Array.from({ length: 70 }).map((_, i) => {
              const heightPct = Math.max(15, Math.sin(i * 0.25) * 45 + Math.cos(i * 0.4) * 35 + 20);
              const barTime = (i / 70) * 32.0;
              const isPast = currentTime >= barTime;
              return (
                <div
                  key={i}
                  style={{ height: `${heightPct}%` }}
                  className={`w-1 rounded-full transition-colors ${
                    isPast ? 'bg-cyan-400' : 'bg-slate-700'
                  }`}
                />
              );
            })}
          </div>

          {/* Scrub cursor line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
            style={{ left: `${(currentTime / 32.0) * 100}%` }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1 -mt-0.5" />
          </div>
        </div>

        {/* Currently Active Lyric Line Highlight */}
        <div className="mt-3 p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
              当前切片: {activeLine ? `${activeLine.start.toFixed(1)}s - ${activeLine.end.toFixed(1)}s` : '0.0s'}
            </span>
            <span className="text-sm font-semibold text-white">
              {activeLine ? activeLine.text : '等待播放或切入下一段...'}
            </span>
          </div>
          {activeLine?.isInstrumental ? (
            <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              器乐间奏 · 锚定分镜切点
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>对齐置信度: {activeLine ? `${(activeLine.confidence * 100).toFixed(0)}%` : '100%'}</span>
            </span>
          )}
        </div>
      </div>

      {/* Lyrics Timestamp Editor & Verification Table */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">逐行歌词与时间轴基准 (LRC + JSON 导出轨)</h3>
            <p className="text-xs text-slate-400 mt-0.5">铁律 A 要求：歌词一行不能少，切点强制吸附行尾，间奏必须显式成行保留</p>
          </div>
          <span className="text-xs font-mono text-slate-400">共 {lyrics.length} 行切片</span>
        </div>

        <div className="divide-y divide-slate-700/60">
          {lyrics.map((line) => {
            const isActive = activeLine?.id === line.id;
            return (
              <div
                key={line.id}
                className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isActive ? 'bg-cyan-950/40 border-l-4 border-l-cyan-500' : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono px-2 py-1 rounded bg-slate-900 text-slate-300 border border-slate-700">
                    [{line.start.toFixed(2)}s - {line.end.toFixed(2)}s]
                  </span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {line.type}
                  </span>
                  <input
                    type="text"
                    value={line.text}
                    onChange={(e) => handleUpdateText(line.id, e.target.value)}
                    className="bg-transparent border-b border-transparent hover:border-slate-600 focus:border-cyan-500 focus:outline-none text-xs text-slate-100 font-medium px-1 py-0.5 max-w-md w-full sm:w-80"
                  />
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-400">置信度:</span>
                    <span className={`font-mono font-semibold ${line.confidence >= 0.95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {(line.confidence * 100).toFixed(0)}%
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setCurrentTime(line.start);
                      setIsPlaying(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition"
                    title="定位并试听"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
