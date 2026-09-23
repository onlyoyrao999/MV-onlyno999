import React from 'react';
import { Sparkles, ShieldCheck, Film, DollarSign, Clock, Users, UserX, BookOpen, Cpu, ExternalLink } from 'lucide-react';

interface HeaderProps {
  hasProtagonist: boolean;
  onToggleProtagonist: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenSpecModal: () => void;
  totalCost: number;
  totalDuration: number;
  gate6Passed: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  hasProtagonist,
  onToggleProtagonist,
  activeTab,
  onSelectTab,
  onOpenSpecModal,
  totalCost,
  totalDuration,
  gate6Passed
}) => {
  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wider text-slate-100 font-mono">MV-AUTO-PIPELINE</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-semibold border border-cyan-500/30">V1.0.6 SOP</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">一首歌 + 一张图 出来一支口型对得上的 MV</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="hidden md:flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>时长: {totalDuration.toFixed(1)}s</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>成本: ${totalCost.toFixed(2)} / $25.00</span>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs ${gate6Passed ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-amber-950/40 border-amber-500/30 text-amber-300'}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{gate6Passed ? '硬门禁: 全部放行' : '硬门禁: 待修正'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onToggleProtagonist}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                hasProtagonist
                  ? 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                  : 'bg-purple-950/40 text-purple-300 border-purple-500/40 hover:bg-purple-900/40'
              }`}
              title={hasProtagonist ? "当前为【有主角模式】（需人物图）" : "当前为【无主角模式】（空镜/道具/背影承载）"}
            >
              {hasProtagonist ? <Users className="w-3.5 h-3.5 text-cyan-400" /> : <UserX className="w-3.5 h-3.5 text-purple-400" />}
              <span className="hidden sm:inline">{hasProtagonist ? '有主角模式' : '无主角氛围模式'}</span>
            </button>

            <a
              href="https://www.runninghub.cn"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/30 transition-all"
              title="打开 RunningHub 平台 (www.runninghub.cn)"
            >
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>RunningHub 工作流</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>

            <button
              onClick={onOpenSpecModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-sm transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Skill 规范 & 脚本</span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/80 text-xs">
          {[
            { id: 'overview', label: '12步与8道关全景', icon: Sparkles },
            { id: 'timeline', label: '歌词时间轴 (关 1)', icon: Clock },
            { id: 'storyboard', label: '分镜设计与硬门禁 (关 4/5/6)', icon: Film, badge: '硬门禁' },
            { id: 'runninghub', label: 'RunningHub 云端调度', icon: Cpu, badge: 'Minimax H3' },
            { id: 'algorithms', label: '时长贴合与对齐三验', icon: ShieldCheck },
            { id: 'ledger', label: '双池与成本台账', icon: DollarSign },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
