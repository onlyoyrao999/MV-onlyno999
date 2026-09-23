# MV-AUTO-PIPELINE Skill 资源包 (V1.0.6)

本目录为 `mv-auto-pipeline` 专用 Skill 规范包，内含全套 SOP 规范文档、自研算法数学原理、自动化机检脚本以及针对 **RunningHub (www.runninghub.cn)** 云端 ComfyUI 工作流的调用实现。

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
│   ├── runninghub_workflow_spec.md        # RunningHub 项目与 ComfyUI 节点参数映射规范
│   └── changelog_and_evolution.md         # V1.0.0 至 V1.0.6 版本演进与踩坑复盘
├── scripts/                               # 自动化执行与门禁校验脚本
│   ├── runninghub_client.py               # RunningHub OpenAPI 任务派发与轮询客户端
│   ├── prompt_validator.py                # 关 5 提示词 11 项机器自动化体检脚本
│   ├── gate6_checker.py                   # 关 6 数学硬门禁（首尾衔接/总长/连续口型/占比）校验脚本
│   ├── align_check.py                     # Gate 8 对齐三验（滞后量/互相关/人声能量）算法脚本
│   ├── duration_fitter.py                 # 视频帧网格时长贴合与 FFmpeg 毫秒级裁切脚本
│   └── cost_ledger.py                     # 双池调度成本台账与真钱硬封顶控制脚本
└── templates/                             # 模板文件
```

## RunningHub 绑定工作流

* **平台**：[RunningHub (www.runninghub.cn)](https://www.runninghub.cn)
* **项目地址**：[https://www.runninghub.cn](https://www.runninghub.cn)
* **工作流 ID**：`2100506281638457345`
* **邀请码**：`rh-v1083`
* **API 标准**：RunningHub OpenAPI v2（`POST /openapi/v2/run/workflow/{id}` 与 `Bearer <API_KEY>`）
* **引擎**：Minimax H3 4-step Turbo 唇形自举采样 + Qwen3-VL 32B 音画联合注意力
* **执行命令**：`python3 scripts/runninghub_client.py --dry-run`
