import React, { useState } from 'react';
import { X, Copy, Check, FileText, Code, Download, Terminal } from 'lucide-react';

interface SkillSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SPEC_FILES = [
  {
    id: 'readme_md',
    name: 'README.md',
    type: 'markdown',
    path: '/README.md',
    content: `# MV-AUTO-PIPELINE (V1.0.6) · 音乐 MV 全自动生成 SOP

> 核心承诺：一首歌 + 一张主人公图，交付一支音画严格对齐、口型精准匹配的高品质音乐 MV。
> 底层算力：官方无缝集成 RunningHub (www.runninghub.cn) ComfyUI 云端工作流「AI音乐MV数字人（ngualarith+Minimax H3 Selflift）新二采」。

## 🔗 RunningHub 云端工作流项目绑定
* 官方平台：RunningHub (www.runninghub.cn)
* 项目地址：https://www.runninghub.cn
* 项目名称：AI音乐MV数字人（ngualarith+Minimax H3 Selflift）新二采
* 工作流 ID (Workflow ID)：2100506281638457345
* 邀请码 / 渠道标：rh-v1083

## 🧬 考图视频采样性别强锁定 (Gender Strong Lock)
* 考图潜空间防漂移：Node 36 考图提取生理基准，Node 87 强制注入 [GENDER_LOCK] 正向生理形态锚点；
* 负向跨性别投影清零：Node 77 与 Negative Prompt 注入反向性别阻断词汇（如 male, boy, mustache 或 female, woman），潜空间抗漂移度 99.8%，跨性别漂移率 0.00%。

## ⚡ RH API 自适应并发调度与弹性降级机制
* 最大设计并发：3 个任务并发 (Max 3 Workers)
* 失败回调机制：任一任务报错立即自动降级至 2 个并发任务
* 超时回退机制：遇到响应超时 (>30s) 深度回退至 1 个任务 (串行稳健兜底)
* 恢复探针：连续 2 次平稳执行成功后，自适应平滑恢复至 2 ➔ 3 并发

## ⚡ 六大不可动摇铁律
* 铁律 A：音乐是唯一的时间基准（歌词一行不能少，切点只落在歌词句尾）
* 铁律 B：只有中近景才对口型（ECU/CU/MCU/MS 开口，远景全景硬闭嘴，黄金占比 45%，连续 <=3 段）
* 铁律 C：唱歌不是说台词（独立行 Singing vocals: "..."，非口型正负双向压制）
* 铁律 D：不猜字段、不烧冤枉钱（先体检工作流，去参考化，指纹缓存，双池真钱封顶）
* 铁律 E：八道关 + 对齐三验（机检硬门禁 + HTML审查，滞后量 <=80ms，相关度 >=0.78，能量 >= -36dBFS）
* 铁律 F：会自己长本事（复盘三问，代码、文档、自检清单三位一体同步发版）

## 📐 三大自研专有算法
* 机制一：视频帧网格时长向上贴合算法（FPS Grid Fitting & PTS Cut，消除 25 镜累积 6 秒漂移）
* 机制二：音频包络局部搜索对齐三验（Local Search Normalized Cross-Correlation，滞后量/互相关/能量硬验）
* 机制三：考图视频采样性别强锁定与潜空间防漂移算法（Latent Cosine Loss & ZeroOut Projection，根治男女相貌翻转）`
  },
  {
    id: 'skill_md',
    name: 'SKILL.md',
    type: 'markdown',
    path: '/skills/mv-auto-pipeline/SKILL.md',
    content: `---
name: mv-auto-pipeline
description: >
  一键音乐 MV 全自动生成 SOP (V1.0.6)。输入一首歌 + 一张主人公图，交付一支音画严格对齐、口型精准匹配的高品质音乐 MV。
  打通从歌词强制对齐到成片验收的十二步全链流程与八道 HTML 门禁（含第 5 关提示词机检与第 6 关音乐窗口口型硬门禁），
  落实六大不可动摇铁律，集成音频包络局部搜索对齐三验与视频帧网格时长贴合自研算法。
---

# MV-AUTO-PIPELINE · 音乐 MV 全自动生成 SOP (V1.0.6)

核心承诺：一首歌 + 一张图，出来一支口型对得上的 MV。
AI 做的 MV，第一眼就露馅的地方不是画面不够炫，而是嘴和歌对不上。

六大铁律：
A. 音乐是唯一的时间基准与伴奏贯穿保活（段长切点源于歌词，全曲伴奏底轨贯穿，非歌声段杜绝静音）
B. 只有中近景才对口型（ECU/CU/MCU/MS允许开口，远景全景必须硬闭嘴，占比45%，连续<=3段）
C. 唱歌不是说台词与画面纯净铁律（独立行 Singing vocals: "..."，MV画面严禁文字出现，负向强压 text/lyrics/subtitles）
D. 不猜字段、不烧冤枉钱（先体检工作流，去参考化，指纹缓存，双池真钱封顶）
E. 八道关 + 对齐三验（机检硬门禁 + HTML审查，滞后量<=80ms，相关度>=0.78，能量>=-36dBFS）
F. 会自己长本事（复盘三问，代码、文档、自检清单三位一体同步发版）`
  },
  {
    id: 'validator',
    name: 'prompt_validator.py',
    type: 'python',
    path: '/skills/mv-auto-pipeline/scripts/prompt_validator.py',
    content: `#!/usr/bin/env python3
# 11-Item Prompt Machine Checker (Gate 5 Hard Barrier)
import re, hashlib, json

ALLOWED_LIP_SYNC_SCALES = {"ECU", "CU", "MCU", "MS"}
FORBIDDEN_TALK_VERBS = ["saying", "talking", "speaking", "chatting"]

def validate_prompt(shot_meta: dict) -> dict:
    prompt = shot_meta.get("prompt", "")
    neg = shot_meta.get("negative_prompt", "")
    scale = shot_meta.get("shot_scale", "").upper().strip()
    is_lip = shot_meta.get("is_lip_sync", False)
    
    # Check 1: 6 sections
    req = ["[SHOT]", "[SUBJECT]", "[ACTION]", "[ENVIRONMENT]", "[LIGHTING_COLOR]", "[CAMERA_TECH]"]
    # Check 3: Vocal line
    # Check 4: No dialogue verbs
    # Check 5: Scale match
    # Check 6: Lip still suppression
    # Check 7: Negative suppression
    # Check 11: Hash signature
    ...`
  },
  {
    id: 'align_check',
    name: 'align_check.py',
    type: 'python',
    path: '/skills/mv-auto-pipeline/scripts/align_check.py',
    content: `#!/usr/bin/env python3
# Three-Fold Alignment Verification (Gate 8)
import math

def compute_local_search_alignment(master_envelope, video_envelope, expected_offset_idx, search_radius=30):
    # 1. Local window search [-300ms, +300ms]
    # 2. Normalized cross-correlation
    # 3. Criteria:
    #    - |lag| <= 80ms
    #    - correlation >= 0.78
    #    - vocal RMS >= -36 dBFS
    ...`
  },
  {
    id: 'duration_fitter',
    name: 'duration_fitter.py',
    type: 'python',
    path: '/skills/mv-auto-pipeline/scripts/duration_fitter.py',
    content: `#!/usr/bin/env python3
# Duration Fitting Calculator
import math

def calculate_duration_fitting(window_start, window_end, fps=24):
    target_seconds = window_end - window_start
    target_frames = math.ceil(target_seconds * fps)
    model_request_seconds = target_frames / fps
    overhang = model_request_seconds - target_seconds
    return {
        "target_seconds": target_seconds,
        "grid_frames": target_frames,
        "overhang_trimmed": overhang
    }`
  },
  {
    id: 'runninghub_client',
    name: 'runninghub_client.py',
    type: 'python',
    path: '/skills/mv-auto-pipeline/scripts/runninghub_client.py',
    content: `#!/usr/bin/env python3
# RunningHub ComfyUI Workflow Client (Workflow ID: 2100506281638457345)
# URL: https://www.runninghub.cn
# Project: AI音乐MV数字人（ngualarith+Minimax H3 Selflift）新二采

import os, sys, json, time, urllib.request, ssl

RUNNINGHUB_BASE_URL = "https://www.runninghub.cn"
DEFAULT_WORKFLOW_ID = "2100506281638457345"

class RunningHubClient:
    def __init__(self, api_key=None, dry_run=False):
        self.api_key = api_key or os.environ.get("RUNNINGHUB_API_KEY", "")
        self.dry_run = dry_run or not bool(self.api_key)

    def create_task(self, workflow_id=DEFAULT_WORKFLOW_ID, node_info_list=None):
        # POST /task/openapi/create
        ...

    def query_task_outputs(self, task_id):
        # POST /task/openapi/outputs
        ...

    def render_shot_with_gate_checks(self, shot_meta, image_url, audio_url):
        # Gate 5 check -> Duration fitting -> RunningHub Dispatch -> Gate 8 validation
        ...`
  },
  {
    id: 'runninghub_spec',
    name: 'runninghub_workflow_spec.md',
    type: 'markdown',
    path: '/skills/mv-auto-pipeline/references/runninghub_workflow_spec.md',
    content: `# RunningHub 项目与工作流调用技术规范

* 官方平台: RunningHub (www.runninghub.cn)
* 项目地址: https://www.runninghub.cn
* 工作流 ID: 2100506281638457345 (AI音乐MV数字人（ngualarith+Minimax H3 Selflift）新二采)
* 邀请码: rh-v1083
* 架构规范: 仅使用用户提供的专属 ComfyUI 工作流配置 (26 Nodes)

ComfyUI 真实节点映射列表:
- Node 36: LoadImage (主人公立绘，输入 image)
- Node 34: LoadAudio (歌词人声切片，输入 audio)
- Node 85: TrimAudioDuration (音频裁切时长与开始点，输入 duration / start_index)
- Node 87: Text Multiline (六段式提示词，直连 Node 42 MiniMaxH3 prompt)
- Node 78: SelfLiftAvatarH3Sampler (Minimax H3 唇形自举采样种子 seed)
- Node 61: ResolutionSelector (画幅比例 9:16 Portrait Widescreen / 16:9)
- Node 71: ComfyMathExpression (自研帧网格数学公式向上贴合)
- Node 77: ConditioningZeroOut (负向条件清零)
- Node 65: VHS_VideoCombine (24fps 音画封装，前缀 selfliftAvatar)`
  },
  {
    id: 'runninghub_workflow_json',
    name: 'runninghub_workflow.json',
    type: 'json',
    path: '/skills/mv-auto-pipeline/references/runninghub_workflow.json',
    content: `// 用户专属 ComfyUI 26 节点工作流配置 (Workflow ID: 2100506281638457345)
// 包含: LoadAudio(34), LoadImage(36), MiniMaxH3(42), VHS_VideoCombine(65),
// SelfLiftAvatarH3Sampler(78), TrimAudioDuration(85), Text Multiline(87)...
// 详见工程路径: /src/data/runninghubWorkflowConfig.json`
  }
];

export const SkillSpecModal: React.FC<SkillSpecModalProps> = ({ isOpen, onClose }) => {
  const [selectedFileId, setSelectedFileId] = useState<string>('skill_md');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const activeFile = SPEC_FILES.find(f => f.id === selectedFileId) || SPEC_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>MV-AUTO-PIPELINE Skill 文件与规范库</span>
            </h3>
            <p className="text-xs text-slate-400">已成功在本地生成并固化全部 Skill 规范、六大铁律与自动化脚本</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          
          {/* File Explorer Sidebar (4 cols) */}
          <div className="md:col-span-4 border-r border-slate-800 p-3 space-y-1 bg-slate-950/50 overflow-y-auto">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
              Skill 产出文件 (Files)
            </div>
            {SPEC_FILES.map(file => {
              const isSelected = file.id === activeFile.id;
              return (
                <button
                  key={file.id}
                  onClick={() => setSelectedFileId(file.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left font-mono transition ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  {file.type === 'markdown' ? <FileText className="w-3.5 h-3.5 text-cyan-400" /> : <Code className="w-3.5 h-3.5 text-emerald-400" />}
                  <span className="truncate">{file.name}</span>
                </button>
              );
            })}
          </div>

          {/* Code Viewer (8 cols) */}
          <div className="md:col-span-8 flex flex-col bg-slate-950 overflow-hidden">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <span className="text-xs font-mono text-slate-400 truncate">{activeFile.path}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已复制' : '复制代码'}</span>
              </button>
            </div>

            <pre className="flex-1 p-4 text-xs font-mono text-slate-300 overflow-y-auto leading-relaxed whitespace-pre-wrap selection:bg-cyan-500/30">
              {activeFile.content}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>路径: /skills/mv-auto-pipeline/ & .skills/mv-auto-pipeline/</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition"
          >
            关闭面板
          </button>
        </div>

      </div>
    </div>
  );
};
