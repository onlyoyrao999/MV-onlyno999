# MV-AUTO-PIPELINE Skill 资源包 (V1.0.6)

本目录为 `mv-auto-pipeline` 专用 Skill 规范包，内含全套 SOP 规范文档、自研算法数学原理、自动化机检脚本以及针对 **RunningHub (www.runninghub.cn)** 云端 ComfyUI 工作流（ID: `2100506281638457345`）的完整调用实现。

## 目录结构

```
skills/mv-auto-pipeline/
├── README.md                              # 本说明文档
├── SKILL.md                               # Skill 主定义文件（遵循 AI Studio Skill 规范）
├── references/                            # 理论规范与技术文档
│   ├── six_iron_rules.md                  # 六大不可动摇铁律详解
│   ├── sop_12_steps_8_gates.md            # 十二步全链流程与八道 HTML 审核关
│   ├── prompt_engineering_rules.md        # 六段式提示词结构与 11 项机检规则表
│   ├── alignment_math_and_algorithms.md   # 自研时长贴合与对齐三验数学底座
│   ├── runninghub_workflow_spec.md        # RunningHub 项目与 ComfyUI 26 节点参数映射规范
│   ├── runninghub_workflow.json           # 用户专属 26 节点 ComfyUI 完整配置 JSON
│   └── changelog_and_evolution.md         # V1.0.0 至 V1.0.6 版本演进与踩坑复盘
├── scripts/                               # 自动化执行与门禁校验脚本
│   ├── runninghub_client.py               # RunningHub OpenAPI 任务派发与轮询客户端（适配 26 节点）
│   ├── prompt_validator.py                # 关 5 提示词 11 项机器自动化体检脚本（含画面零文字检查）
│   ├── gate6_checker.py                   # 关 6 数学硬门禁（首尾衔接/总长/连续口型/占比）校验脚本
│   ├── align_check.py                     # Gate 8 对齐三验（滞后量/互相关/人声能量）算法脚本
│   ├── duration_fitter.py                 # 视频帧网格时长贴合与 FFmpeg 毫秒级裁切脚本
│   └── cost_ledger.py                     # 双池调度成本台账与真钱硬封顶控制脚本
└── templates/                             # 模板文件
```

## RunningHub 绑定工作流与 26 节点映射

* **平台**：[RunningHub (www.runninghub.cn)](https://www.runninghub.cn)
* **项目地址**：[https://www.runninghub.cn](https://www.runninghub.cn)
* **工作流名称**：`AI音乐MV数字人（ngualarith+Minimax H3 Selflift）新二采`
* **工作流作者**：`Ai随风`
* **工作流 ID**：`2100506281638457345`
* **邀请码**：`rh-v1083`
* **API 标准**：RunningHub OpenAPI v2（`POST /openapi/v2/run/workflow/2100506281638457345` 与 `Bearer <API_KEY>`）
* **引擎**：Minimax H3 4-step Turbo 唇形自举采样 (`SelfLiftAvatarH3Sampler`) + Qwen3-VL 32B 音画联合注意力
* **执行命令**：`python3 scripts/runninghub_client.py --dry-run`

### 真实节点映射参数表

| 用途 | 节点类型 | Node ID | 字段 | 注入内容 |
| :--- | :--- | :--- | :--- | :--- |
| 主角立绘 | `LoadImage` | **36** | `image` | 面部基准立绘（直连 Node 42 `ref_image_0`） |
| 人声音频 | `LoadAudio` | **34** | `audio` | 歌曲人声音频切片文件 |
| 时长裁切 | `TrimAudioDuration` | **85** | `duration` | 自研帧网格时长向上贴合秒数 |
| 起始偏移 | `TrimAudioDuration` | **85** | `start_index` | 音频窗口在全曲中的起始秒数 |
| 六段式词 | `Text Multiline` | **87** | `text` | 关 5 机检通过提示词（直连 Node 42 `prompt`） |
| 采样种子 | `SelfLiftAvatarH3Sampler` | **78** | `seed` | 独立哈希采样种子（默认 999） |
| 画幅比例 | `ResolutionSelector` | **61** | `aspect_ratio` | 9:16 (Portrait Widescreen) 或 16:9 |
| 视频封包 | `VHS_VideoCombine` | **65** | `frame_rate` | 24fps 音画封装，前缀 `selfliftAvatar` |

## 双重交付保障

1. **全程有声（杜绝静音死寂）**：全片采用双轨音频架构（Track A 伴奏母带底轨 + Track B 人声干声对齐轨），前奏/间奏/尾奏伴奏不间断，剪辑成片强制重贴全曲母带底轨。
2. **纯净画面（杜绝文字字幕）**：负向提示词硬性注入字幕与文字屏蔽项（`text, words, subtitles, lyrics, watermark...`），正向提示词剔除排版指令并通过关 5 / 关 6 自动化机检。
