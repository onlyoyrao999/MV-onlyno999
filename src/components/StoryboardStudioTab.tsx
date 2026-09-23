import React, { useState } from 'react';
import { StoryboardShot } from '../data/mockPipelineData';
import { validateGate5Prompt, validateGate6, Gate5Validation, Gate6Validation } from '../utils/pipelineValidators';
import {
  ShieldAlert, ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Film, Sparkles,
  Sliders, RefreshCw, Wand2, Hash, Eye, EyeOff, Cpu
} from 'lucide-react';

interface StoryboardStudioTabProps {
  storyboard: StoryboardShot[];
  onUpdateStoryboard: (updated: StoryboardShot[]) => void;
  hasProtagonist: boolean;
  masterDuration: number;
  onJumpToRunningHub?: (shotId: string) => void;
}

export const StoryboardStudioTab: React.FC<StoryboardStudioTabProps> = ({
  storyboard,
  onUpdateStoryboard,
  hasProtagonist,
  masterDuration,
  onJumpToRunningHub
}) => {
  const [selectedShotId, setSelectedShotId] = useState<string>(storyboard[1]?.id || storyboard[0]?.id);

  // Compute Gate 6 Validation for full storyboard
  const gate6Result: Gate6Validation = validateGate6(storyboard, masterDuration);

  // Get active shot
  const activeShot = storyboard.find(s => s.id === selectedShotId) || storyboard[0];
  const gate5Result: Gate5Validation = validateGate5Prompt(activeShot, hasProtagonist);

  const handleUpdateActiveShot = (fields: Partial<StoryboardShot>) => {
    const updated = storyboard.map(s => {
      if (s.id === activeShot.id) {
        return {
          ...s,
          ...fields,
          // Recompute duration if start or end changed
          duration: fields.start !== undefined || fields.end !== undefined
            ? (fields.end ?? s.end) - (fields.start ?? s.start)
            : s.duration,
          // Generate updated fingerprint on prompt modification
          fingerprint: fields.prompt !== undefined ? 'sig_' + Math.random().toString(36).substring(2, 10) : s.fingerprint
        };
      }
      return s;
    });
    onUpdateStoryboard(updated);
  };

  // Auto-Fix Prompt to achieve full compliance with 11 rules
  const handleAutoFixPrompt = () => {
    const scale = activeShot.shotScale;
    const isLip = activeShot.isLipSync;
    const lyrics = activeShot.lyricsSnippet || "夜色漫延";

    let compliantPrompt = '';
    let compliantNeg = '';

    if (isLip) {
      compliantPrompt = `[SHOT]
Shot scale: ${scale === 'CU' ? 'Close-Up' : scale === 'MCU' ? 'Medium Close-Up' : scale === 'MS' ? 'Medium Shot' : 'Close-Up'}. Camera motion: Slow subtle push-in tracking shot toward singer.

[SUBJECT]
A young female vocalist, delicate features, thoughtful expressive dark eyes, wearing a vintage knitted scarf.

[ACTION]
Standing near window with nostalgic emotion.
Singing vocals: "${lyrics}"

[ENVIRONMENT]
A warmly lit cozy retro cafe overlooking a midnight rain-streaked neon street.

[LIGHTING_COLOR]
Cinematic split amber interior key light and cool cyan window reflections.

[CAMERA_TECH]
8k, photorealistic film look, shallow depth of field, 24fps motion blur.`;
      compliantNeg = "text, words, subtitles, lyrics, watermark, captions, logo, typography, letters, signature, username, font, burned-in text, talking, dialogue, cartoon, 3d render, distorted face, lowres";
    } else {
      compliantPrompt = `[SHOT]
Shot scale: ${scale}. Camera motion: Slow atmospheric pan.

[SUBJECT]
Silhouetted character or urban environment.

[ACTION]
Atmospheric ambient scene. Mouth naturally closed, lips completely still, not moving along with vocals, no singing or talking.

[ENVIRONMENT]
Misty neon city boulevard at midnight under soft raindrops.

[LIGHTING_COLOR]
Deep cyan and emerald nocturnal palette, rich contrast.

[CAMERA_TECH]
Cinematic 8k, anamorphic lens flare, natural film grain.`;
      compliantNeg = "text, words, subtitles, lyrics, watermark, captions, logo, typography, letters, signature, username, font, burned-in text, singing, mouth open, lip-sync, talking, speaking, vocalizing, open lips, cartoon, 3d CGI";
    }

    handleUpdateActiveShot({
      prompt: compliantPrompt,
      negativePrompt: compliantNeg
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-6">
      {/* Gate 6 Hard Barrier Banner */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg ${
        gate6Result.passed
          ? 'bg-slate-900/90 border-emerald-500/40 text-emerald-300'
          : 'bg-slate-900/90 border-red-500/50 text-red-300'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg mt-0.5 ${gate6Result.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {gate6Result.passed ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                GATE 6 硬门禁
              </span>
              <h2 className="text-sm font-bold text-white">音乐窗口与口型核对</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${gate6Result.passed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'}`}>
                {gate6Result.passed ? '✓ 机器硬校验全量通过' : `✕ 拦截 ${gate6Result.errors.length} 项违规`}
              </span>
            </div>

            {gate6Result.errors.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs text-red-300 list-disc list-inside">
                {gate6Result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-300 mt-1">
                分镜时间轴首尾闭环无断层，总长严格等于原曲母带 ({gate6Result.stats.totalDuration}s)，景别与口型策略符合生理节奏与铁律 B。
              </p>
            )}
          </div>
        </div>

        {/* Gate 6 Stats Badges */}
        <div className="flex items-center gap-3 font-mono text-xs text-slate-300 self-end md:self-center">
          <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
            <span className="text-slate-400">口型占比: </span>
            <span className={`font-bold ${gate6Result.stats.lipSyncRatioPct <= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {gate6Result.stats.lipSyncRatioPct}% (基准45%)
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">
            <span className="text-slate-400">最大连续口型: </span>
            <span className={`font-bold ${gate6Result.stats.maxConsecutiveLipSync <= 3 ? 'text-emerald-400' : 'text-red-400'}`}>
              {gate6Result.stats.maxConsecutiveLipSync} 段 (上限3)
            </span>
          </div>
        </div>
      </div>

      {/* Main Studio Grid: Left Storyboard List, Right Shot Inspector & Gate 5 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Storyboard Shots Carousel / List (4 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Film className="w-4 h-4 text-cyan-400" />
              <span>逐段分镜列表 ({storyboard.length} 镜头)</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">点击镜头即时审改</span>
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {storyboard.map((shot, idx) => {
              const isSelected = shot.id === activeShot.id;
              const shotCheck = validateGate5Prompt(shot, hasProtagonist);

              return (
                <div
                  key={shot.id}
                  onClick={() => setSelectedShotId(shot.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-slate-800/95 border-cyan-500 shadow-md shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                      : 'bg-slate-800/50 border-slate-700/80 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                        #{shot.index.toString().padStart(2, '0')}
                      </span>
                      <span className="font-mono text-xs text-slate-300">
                        [{shot.start.toFixed(1)}s - {shot.end.toFixed(1)}s]
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-slate-900 text-slate-300 border border-slate-700">
                        {shot.shotScale}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {shot.isLipSync ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          对口型
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-slate-700 text-slate-400">
                          不对口型
                        </span>
                      )}

                      <span className={`w-2 h-2 rounded-full ${shotCheck.allPassed ? 'bg-emerald-400' : 'bg-red-400'}`} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-1 font-medium">
                    {shot.lyricsSnippet || '(器乐过渡段)'}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-700/50 text-[11px] text-slate-400">
                    <span className="truncate max-w-[200px]">{shot.cameraMotion}</span>
                    <span className="font-mono text-[10px] text-slate-500">#{shot.fingerprint}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Shot Inspector & Gate 5 Prompt Checker (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Active Shot Controls */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 pb-3 mb-4">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold">镜头 #{activeShot.index.toString().padStart(2, '0')} 详细设定</span>
                <h4 className="text-sm font-bold text-white mt-0.5">{activeShot.lyricsSnippet || '器乐段'}</h4>
              </div>

              <div className="flex items-center gap-2">
                {onJumpToRunningHub && (
                  <button
                    onClick={() => onJumpToRunningHub(activeShot.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition"
                    title="在 RunningHub 调度中心渲染本镜头 (Minimax H3 工作流)"
                  >
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    <span>RunningHub 渲染</span>
                  </button>
                )}

                <button
                  onClick={handleAutoFixPrompt}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition"
                  title="自动根据铁律与六段式规范重构本镜提示词"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>一键合规重构</span>
                </button>
              </div>
            </div>

            {/* Scale and Lip-Sync Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">景别选型 (Shot Scale)</label>
                <select
                  value={activeShot.shotScale}
                  onChange={(e) => handleUpdateActiveShot({ shotScale: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="ECU">ECU 大特写 (允许口型)</option>
                  <option value="CU">CU 特写 (允许口型)</option>
                  <option value="MCU">MCU 近景 (允许口型)</option>
                  <option value="MS">MS 中景 (允许口型)</option>
                  <option value="MLS">MLS 中远景 (禁口型)</option>
                  <option value="FS">FS 全景 (禁口型)</option>
                  <option value="ELS">ELS 大远景 (禁口型)</option>
                  <option value="Scenery">Scenery 空镜 (禁口型)</option>
                  <option value="Back-View">Back-View 背影 (禁口型)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">口型策略 (Lip-Sync)</label>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleUpdateActiveShot({ isLipSync: !activeShot.isLipSync })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                      activeShot.isLipSync
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-700/60 text-slate-400 border border-slate-600'
                    }`}
                  >
                    {activeShot.isLipSync ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{activeShot.isLipSync ? '对口型 (Singing)' : '不对口型 (Mouth Still)'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">窗口时长 (W_k)</label>
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-mono text-sm font-bold text-white bg-slate-900 px-3 py-1 rounded border border-slate-700">
                    {activeShot.duration.toFixed(2)} 秒
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    [{activeShot.start.toFixed(1)}s ~ {activeShot.end.toFixed(1)}s]
                  </span>
                </div>
              </div>
            </div>

            {/* Prompt Editor */}
            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 text-xs font-semibold mb-1">
                  六段式正向提示词 (Positive Prompt - 必须具备 [SHOT] 至 [CAMERA_TECH])
                </label>
                <textarea
                  rows={8}
                  value={activeShot.prompt}
                  onChange={(e) => handleUpdateActiveShot({ prompt: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 text-xs font-semibold">
                    负向提示词 (Negative Prompt - 画面防文字/水印必填；非口型段强行闭嘴)
                  </label>
                  <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                    <span>🚫 画面严禁文字</span>
                    <span className="text-slate-500">|</span>
                    <span>🎵 伴奏底轨贯穿</span>
                  </span>
                </div>
                <input
                  type="text"
                  value={activeShot.negativePrompt}
                  onChange={(e) => handleUpdateActiveShot({ negativePrompt: e.target.value })}
                  placeholder="text, words, subtitles, lyrics, captions, watermark, logo, typography..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  铁律保障：已硬性屏蔽文字/字幕/歌词水印，杜绝模型在画面中渲染乱码；成片字幕统一由后期 SRT 挂载。
                </p>
              </div>
            </div>
          </div>

          {/* Gate 5: 11 Machine Check Rules Card */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold border border-red-500/30">
                  GATE 5 硬门禁机检
                </span>
                <h4 className="text-xs font-bold text-white">11 项机检指标清单</h4>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                  gate5Result.allPassed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}>
                  {gate5Result.allPassed ? '✓ 11项全绿放行' : `✕ ${gate5Result.results.filter(r => !r.passed).length} 项不通过`}
                </span>
              </div>
            </div>

            {/* 11 Checks List Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {gate5Result.results.map((check) => (
                <div
                  key={check.id}
                  className={`p-2 rounded-lg border flex items-start gap-2 ${
                    check.passed
                      ? 'bg-slate-900/40 border-slate-700/60 text-slate-300'
                      : 'bg-red-950/30 border-red-500/40 text-red-300'
                  }`}
                >
                  {check.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold text-[11px]">{check.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{check.message}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Fingerprint Info */}
            <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-cyan-400" />
                <span>提示词 SHA-256 指纹: #{gate5Result.fingerprint}</span>
              </span>
              <span>修改任意字符自动触发门禁重审</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
