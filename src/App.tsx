import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { PipelineOverviewTab } from './components/PipelineOverviewTab';
import { LyricTimelineTab } from './components/LyricTimelineTab';
import { StoryboardStudioTab } from './components/StoryboardStudioTab';
import { RunningHubDispatchTab } from './components/RunningHubDispatchTab';
import { AlgorithmLabTab } from './components/AlgorithmLabTab';
import { CostLedgerTab } from './components/CostLedgerTab';
import { SkillSpecModal } from './components/SkillSpecModal';
import { DEMO_STORYBOARD, StoryboardShot } from './data/mockPipelineData';
import { validateGate6 } from './utils/pipelineValidators';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [hasProtagonist, setHasProtagonist] = useState<boolean>(true);
  const [storyboard, setStoryboard] = useState<StoryboardShot[]>(DEMO_STORYBOARD);
  const [isSpecModalOpen, setIsSpecModalOpen] = useState<boolean>(false);

  const masterDuration = 32.0;

  // Compute metrics
  const gate6Result = useMemo(() => {
    return validateGate6(storyboard, masterDuration);
  }, [storyboard, masterDuration]);

  const totalCost = useMemo(() => {
    return storyboard.reduce((sum, s) => sum + s.costUsd, 0);
  }, [storyboard]);

  const totalDuration = useMemo(() => {
    return storyboard.reduce((sum, s) => sum + s.duration, 0);
  }, [storyboard]);

  const handleToggleProtagonist = () => {
    setHasProtagonist(prev => !prev);
  };

  const handleRerollShot = (shotId: string) => {
    setStoryboard(prev => prev.map(s => {
      if (s.id === shotId) {
        return {
          ...s,
          costUsd: s.costUsd + 0.35,
          pool: 'priority_paid',
          fingerprint: 'reroll_' + Math.random().toString(36).substring(2, 8),
          lagMs: Math.round((Math.random() * 30 - 15) * 10) / 10,
          correlation: Math.round((0.85 + Math.random() * 0.1) * 100) / 100
        };
      }
      return s;
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation & Status Bar */}
      <Header
        hasProtagonist={hasProtagonist}
        onToggleProtagonist={handleToggleProtagonist}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSpecModal={() => setIsSpecModalOpen(true)}
        totalCost={totalCost}
        totalDuration={totalDuration}
        gate6Passed={gate6Result.passed}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'overview' && (
          <PipelineOverviewTab onJumpToTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'timeline' && (
          <LyricTimelineTab />
        )}

        {activeTab === 'storyboard' && (
          <StoryboardStudioTab
            storyboard={storyboard}
            onUpdateStoryboard={setStoryboard}
            hasProtagonist={hasProtagonist}
            masterDuration={masterDuration}
            onJumpToRunningHub={(_shotId) => setActiveTab('runninghub')}
          />
        )}

        {activeTab === 'runninghub' && (
          <RunningHubDispatchTab
            storyboard={storyboard}
            onUpdateStoryboard={setStoryboard}
          />
        )}

        {activeTab === 'algorithms' && (
          <AlgorithmLabTab />
        )}

        {activeTab === 'ledger' && (
          <CostLedgerTab
            storyboard={storyboard}
            onRerollShot={handleRerollShot}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>MV-AUTO-PIPELINE (V1.0.6) · 一键音乐 MV 全自动生成 SOP</span>
          <div className="flex items-center gap-4 text-slate-400">
            <span>十二步全链</span>
            <span>·</span>
            <span>八道 HTML 审核关</span>
            <span>·</span>
            <span className="text-cyan-400 font-semibold">自研对齐三验 & 时长贴合</span>
          </div>
        </div>
      </footer>

      {/* Skill Specifications and Code Modal */}
      <SkillSpecModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
      />
    </div>
  );
}

export default App;
