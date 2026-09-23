import React, { useState } from 'react';
import { GATES_DATA, SIX_IRON_RULES_LIST, GateDefinition } from '../data/mockPipelineData';
import { ShieldAlert, ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, ExternalLink, Cpu, Sparkles } from 'lucide-react';

interface PipelineOverviewTabProps {
  onJumpToTab: (tabId: string) => void;
}

export const PipelineOverviewTab: React.FC<PipelineOverviewTabProps> = ({ onJumpToTab }) => {
  const [selectedGate, setSelectedGate] = useState<GateDefinition>(GATES_DATA[4]); // Default to Gate 5 (Prompt hard gate)

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-6 px-4">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950/60 border border-slate-700/80 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SOP 标准作业程序 · 十二步全链打通</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            一键音乐 MV 全自动化生成 <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300">MV-AUTO-PIPELINE</span>
          </h1>
          <p className="mt-3 text-sm text-slate-300 leading-relaxed">
            AI 做 MV 最容易露馅的从来不是画面不够炫，而是<strong className="text-amber-300">「嘴和歌对不上」</strong>、<strong className="text-amber-300">「时间轴没有根」</strong>与<strong className="text-amber-300">「音画慢慢漂走」</strong>。
            本流水线设立八道 HTML 审核关卡，在花算力之前以<span className="text-red-400 font-semibold">【第5关与第6关硬门禁】</span>严守时间与提示词纪律，成片必过自研音频包络对齐三验。
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => onJumpToTab('storyboard')}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
            >
              <span>进入硬门禁分镜审查 (关 5 & 关 6)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onJumpToTab('algorithms')}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <span>体验对齐三验与时长贴合算法</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid Pattern */}
        <div className="absolute right-0 top-0 w-96 h-full opacity-10 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>

      {/* Six Iron Rules Bar */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span>六条不可动摇铁律：它凭什么对得上</span>
            </h2>
            <p className="text-xs text-slate-400">流水线底层代码严格强制执行的铁则，除非用户明确要求修改，否则不可逾越</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SIX_IRON_RULES_LIST.map(rule => (
            <div
              key={rule.code}
              className="bg-slate-800/60 border border-slate-700/70 rounded-xl p-4 hover:border-cyan-500/50 transition-all shadow-sm"
            >
              <div className="flex items-center gap-2.5 mb-2">
                <span className="w-6 h-6 rounded-md bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center border border-cyan-500/30">
                  {rule.code}
                </span>
                <h3 className="text-sm font-semibold text-slate-100">{rule.title}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">{rule.rule}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Eight HTML Gates Pipeline Architecture */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>八道 HTML 审核关卡全链架构 (8 Gates Matrix)</span>
            </h2>
            <p className="text-xs text-slate-400">全部步骤落成可视化 HTML 页面，逐段可看可改。第 5、6 关为前置硬门禁，未全绿一段视频都不会提交。</p>
          </div>
        </div>

        {/* Gates Progress Tracker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
          {GATES_DATA.map((gate) => {
            const isSelected = selectedGate.id === gate.id;
            return (
              <button
                key={gate.id}
                onClick={() => setSelectedGate(gate)}
                className={`p-3 rounded-xl text-left border transition-all relative ${
                  isSelected
                    ? 'bg-cyan-950/50 border-cyan-500 text-white shadow-md shadow-cyan-500/10'
                    : 'bg-slate-800/50 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                {gate.isHardBarrier && (
                  <span className="absolute -top-2 -right-1 px-1.5 py-0.2 rounded bg-red-500 text-white text-[9px] font-bold shadow">
                    硬门禁
                  </span>
                )}
                <div className="text-[10px] text-slate-400 font-mono">STEP {gate.stepIndex}</div>
                <div className="text-xs font-bold mt-1 line-clamp-1">{gate.shortName}</div>
                <div className="text-[10px] text-cyan-400/80 mt-1">{gate.phase}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Gate Deep-Dive Inspector */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold font-mono">
                  GATE {selectedGate.id} · {selectedGate.phase}
                </span>
                {selectedGate.isHardBarrier && (
                  <span className="px-2.5 py-1 rounded-md bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>核心硬门禁 (未过关严禁提交算力)</span>
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mt-2">{selectedGate.name}</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">{selectedGate.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-mono">
                模式: {selectedGate.reviewMode}
              </span>
            </div>
          </div>

          <div className="mt-5">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              核心执行指标与机器自检项 (Machine Checklist)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {selectedGate.keyChecks.map((check, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-700/60 text-xs text-slate-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{check}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
