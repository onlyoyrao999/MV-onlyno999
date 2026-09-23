import React, { useState } from 'react';
import { computeDurationFit } from '../utils/pipelineValidators';
import { ShieldCheck, Cpu, Sliders, Play, CheckCircle2, XCircle, Activity, BarChart2, Layers } from 'lucide-react';

export const AlgorithmLabTab: React.FC = () => {
  // Mechanism 1 State: Duration Fitting
  const [targetSeconds, setTargetSeconds] = useState<number>(4.25);
  const [fps, setFps] = useState<number>(24);
  const [rawOverhangPerShot, setRawOverhangPerShot] = useState<number>(0.24); // average extra 0.24s without fitting
  const shotCount = 25;

  const fitResult = computeDurationFit(0, targetSeconds, fps);
  const driftWithoutFitting = (rawOverhangPerShot * shotCount).toFixed(2);

  // Mechanism 2 State: Three-Fold Alignment Verification (Gate 8)
  const [simulatedLagMs, setSimulatedLagMs] = useState<number>(18.0);
  const [simulatedCorrelation, setSimulatedCorrelation] = useState<number>(0.89);
  const [simulatedVocalDbfs, setSimulatedVocalDbfs] = useState<number>(-22.5);

  const isLagOk = Math.abs(simulatedLagMs) <= 80.0;
  const isCorrOk = simulatedCorrelation >= 0.78;
  const isEnergyOk = simulatedVocalDbfs >= -36.0;
  const allGate8Passed = isLagOk && isCorrOk && isEnergyOk;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-8">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-mono font-bold text-xs border border-cyan-500/30">
            自研专有机制 · 实验室
          </span>
          <span className="text-xs text-slate-400">解决「音画慢慢漂走」与「盲猜口型对齐」的两大核心发明</span>
        </div>
        <h2 className="text-xl font-extrabold text-white">两个自己发明的核心算法机制</h2>
        <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
          文档核心创新：其一为**「时长贴合」**（请求时长向上对齐帧网格，落盘精准裁切到理论窗口，彻底斩断累积漂移）；
          其二为**「对齐三验」**（音频包络提取 + 局部搜索，运算量从十亿级降至万级，纯标准库秒级出具权威报告）。
        </p>
      </div>

      {/* Mechanism 1: 时长贴合 (Duration Fitting) */}
      <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-6 shadow-lg space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-cyan-400">机制一 (Mechanism 01)</div>
              <h3 className="text-base font-bold text-white">时长贴合算法 (Duration Fitting)</h3>
            </div>
          </div>

          <div className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-mono">
            原理: ceil(W_k × FPS) 向上对齐帧网格 + 精确 PTS 裁切
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                <span>分镜理论窗口时长 (W_k):</span>
                <span className="font-mono text-cyan-400 font-bold">{targetSeconds.toFixed(2)} 秒</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="8.0"
                step="0.05"
                value={targetSeconds}
                onChange={(e) => setTargetSeconds(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                <span>目标电影帧率 (FPS):</span>
                <span className="font-mono text-cyan-400 font-bold">{fps} fps</span>
              </div>
              <div className="flex gap-2">
                {[24, 25, 30, 60].map(f => (
                  <button
                    key={f}
                    onClick={() => setFps(f)}
                    className={`px-3 py-1 rounded text-xs font-mono font-bold border transition ${
                      fps === f
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {f} fps
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
                <span>未经贴合的单镜浮点漂移量 (假设):</span>
                <span className="font-mono text-amber-400 font-bold">+{rawOverhangPerShot.toFixed(2)} 秒/段</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.01"
                value={rawOverhangPerShot}
                onChange={(e) => setRawOverhangPerShot(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Math Output & Drift Comparison */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono">
                <div className="text-slate-400 text-[11px]">请求帧网格 (Frames)</div>
                <div className="text-lg font-bold text-cyan-400 mt-1">{fitResult.gridFrames} 帧</div>
                <div className="text-[10px] text-slate-500 mt-0.5">ceil({targetSeconds} × {fps})</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono">
                <div className="text-slate-400 text-[11px]">模型请求秒数</div>
                <div className="text-lg font-bold text-white mt-1">{fitResult.modelRequestSec}s</div>
                <div className="text-[10px] text-slate-500 mt-0.5">多出 {fitResult.overhangSec}s 精准裁去</div>
              </div>
            </div>

            {/* 25-Shot Cumulative Comparison */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-white">25 个分镜全长累积漂移对比 (Cumulative Drift)</div>
              
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-red-400">常规 AI 流程 (无贴合):</span>
                  <span className="text-red-400 font-bold">+{driftWithoutFitting} 秒 (严重脱节！)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '85%' }} />
                </div>

                <div className="flex justify-between pt-1">
                  <span className="text-emerald-400">MV-Auto-Pipeline (时长贴合):</span>
                  <span className="text-emerald-400 font-bold">0.000 秒 (绝对锁死)</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mechanism 2: 对齐三验 (Three-Fold Alignment Verification) */}
      <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-6 shadow-lg space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-emerald-400">机制二 (Mechanism 02 · GATE 8)</div>
              <h3 className="text-base font-bold text-white">对齐三实验收算法 (Three-Fold Alignment Verification)</h3>
            </div>
          </div>

          <div className={`text-xs px-3 py-1.5 rounded-lg border font-mono font-bold ${
            allGate8Passed
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/50 border-red-500/40 text-red-300'
          }`}>
            {allGate8Passed ? '✓ 关 8 终审合格 · 准予交付' : '✕ 关 8 拦截 · 严禁说「做完了」'}
          </div>
        </div>

        {/* Sliders for Simulation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <div>
            <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
              <span>最优滞后量 (Optimal Lag |τ|):</span>
              <span className={`font-mono font-bold ${isLagOk ? 'text-emerald-400' : 'text-red-400'}`}>
                {simulatedLagMs > 0 ? `+${simulatedLagMs}` : simulatedLagMs} ms
              </span>
            </div>
            <input
              type="range"
              min="-150"
              max="150"
              step="1"
              value={simulatedLagMs}
              onChange={(e) => setSimulatedLagMs(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="text-[10px] text-slate-400 mt-1">硬判据: |τ| ≤ 80ms (小于两帧)</div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
              <span>波形互相关系数 (Correlation r):</span>
              <span className={`font-mono font-bold ${isCorrOk ? 'text-emerald-400' : 'text-red-400'}`}>
                {simulatedCorrelation.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.40"
              max="1.00"
              step="0.01"
              value={simulatedCorrelation}
              onChange={(e) => setSimulatedCorrelation(parseFloat(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
            <div className="text-[10px] text-slate-400 mt-1">硬判据: r ≥ 0.78</div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 font-medium mb-1">
              <span>人声 RMS 有效能量:</span>
              <span className={`font-mono font-bold ${isEnergyOk ? 'text-emerald-400' : 'text-red-400'}`}>
                {simulatedVocalDbfs.toFixed(1)} dBFS
              </span>
            </div>
            <input
              type="range"
              min="-60"
              max="-10"
              step="0.5"
              value={simulatedVocalDbfs}
              onChange={(e) => setSimulatedVocalDbfs(parseFloat(e.target.value))}
              className="w-full accent-indigo-400 cursor-pointer"
            />
            <div className="text-[10px] text-slate-400 mt-1">硬判据: RMS ≥ -36 dBFS (防止静音假阳性)</div>
          </div>
        </div>

        {/* Criteria Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-xl border ${isLagOk ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-red-950/20 border-red-500/30'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200">判据 1: 时间滞后量</span>
              {isLagOk ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
            </div>
            <div className="text-xl font-bold font-mono text-white">{Math.abs(simulatedLagMs)} ms</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {isLagOk ? '在 ±80ms 允许窗口内，肉眼完全感知不到口型音画脱节' : '超出 ±80ms 门限！出现肉眼可辨认的慢半拍或提前闭嘴'}
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isCorrOk ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-red-950/20 border-red-500/30'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200">判据 2: 包络相关度</span>
              {isCorrOk ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
            </div>
            <div className="text-xl font-bold font-mono text-white">{(simulatedCorrelation * 100).toFixed(0)}%</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {isCorrOk ? '音轨短时 RMS 包络与原曲母带起伏高度重合一致' : '低于 78% 阈值！可能存在非人声杂音干扰或嘴唇动作不符'}
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isEnergyOk ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-red-950/20 border-red-500/30'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200">判据 3: 人声能量底</span>
              {isEnergyOk ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
            </div>
            <div className="text-xl font-bold font-mono text-white">{simulatedVocalDbfs.toFixed(1)} dBFS</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {isEnergyOk ? '人声清晰饱满，非空镜/纯背景杂音伪装' : '能量过低！检测为静音或微弱呢喃，口型缺乏发声依据'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
