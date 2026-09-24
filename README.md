# MV-AUTO-PIPELINE (V1.0.6) · 音乐 MV 全自动生成 SOP

> **核心承诺**：一首歌 + 一张主人公图，交付一支音画严格对齐、口型精准匹配、全片纯净无字幕、全程伴奏不间断的高品质音乐 MV。  
> **底层算力**：官方无缝集成 **RunningHub (www.runninghub.cn)** 专属定制 ComfyUI 云端工作流 `AI音乐MV数字人（ngualarith+Minimax H3 Selflift）新二采`（Workflow ID: `2100506281638457345`）。

---

## 🔗 RunningHub 云端工作流项目绑定

* **官方平台**：[RunningHub (www.runninghub.cn)](https://www.runninghub.cn)
* **项目地址**：[https://www.runninghub.cn](https://www.runninghub.cn)
* **项目名称**：`AI音乐MV数字人（ngualarith+Minimax H3 Selflift）新二采`
* **工作流作者**：`Ai随风`
* **工作流 ID (Workflow ID)**：`2100506281638457345`
* **邀请码 / 渠道标**：`rh-v1083`
* **API 架构标准**：**RunningHub 官方 OpenAPI v2**
  * **创建任务**：`POST /openapi/v2/run/workflow/2100506281638457345`（标头 `Authorization: Bearer <API_KEY>`）
  * **轮询结果**：`POST /openapi/v2/query`（入参 `{"taskId": "..."}`）
* **工作流拓扑规格**：**26 节点专属 ComfyUI 架构**
  * **采样器**：`Node 78: SelfLiftAvatarH3Sampler`（Minimax H3 4-Step Turbo 唇形自举采样，Euler 采样器）
  * **核心视频生成**：`Node 42: MiniMaxH3ReferenceToVideo`（接收人物立绘、人声特征与六段式提示词）
  * **大模型与 LoRA**：`qwen3vl_32b_minimax_h3_int8_convrot` + `minimax_h3_fl2va_bf16` + `minimax_h3_fl2v_lightx2v_turbo_4step`
  * **音频 Latent 编码与计算**：`minimax_h3_audio_vae_fp32` + `Node 72: SoundFlow_GetLength`
  * **时空 Latent 超分放大**：`minimax_h3_latent_upscaler_3d_fp16`
  * **视频组合与音画封包**：`Node 65: VHS_VideoCombine`（24fps 封装，前缀 `selfliftAvatar`）

### ComfyUI 真实节点参数映射标准 (26 Nodes)

| 节点用途 | 节点类型 | 真实 Node ID | 字段名 (Field) | 说明与注入规则 |
| :--- | :--- | :--- | :--- | :--- |
| **主人公立绘** | `LoadImage` | `36` | `image` | 面部基准立绘（默认 `e6423901...png`），直连 Node 42 `ref_image_0`，保障角色全片一致性 |
| **歌词人声音频** | `LoadAudio` | `34` | `audio` | 歌曲人声音频切片（默认 `43dfda9e...mp3`），直连 Node 85 进行精确裁切 |
| **音频截断时长** | `TrimAudioDuration` | `85` | `duration` | 自研算法向上网格贴合秒数：`ceil(TargetSeconds * FPS) / FPS` |
| **音频起始偏移** | `TrimAudioDuration` | `85` | `start_index` | 音频窗口在全曲中的起始偏移秒数，直连 Node 72 计算实际帧长 |
| **六段式提示词** | `Text Multiline` | `87` | `text` | 关 5 机检通过的正向词，直连 Node 42 `prompt`，含独立发声行 `Singing vocals: "..."` |
| **采样器种子** | `SelfLiftAvatarH3Sampler`| `78` | `seed` | 镜头独立哈希种子（默认 `999`），支持单镜头解耦独立重抽卡 |
| **画幅比例选择** | `ResolutionSelector` | `61` | `aspect_ratio` | `9:16 (Portrait Widescreen)` / `16:9`，宽高直连 Node 42 |
| **负向条件清零** | `ConditioningZeroOut` | `77` | `conditioning` | 承接 Node 42 并清零负向特征，送入 Node 78 采样器 |
| **音画封包输出** | `VHS_VideoCombine` | `65` | `frame_rate` | 24fps 音画对齐封包，承接 Node 64 `VAEDecode` 视频与 Node 85 音频 |

---

## 🛡️ 双重交付保障与不可动摇铁律

### 保证一：全程有声（杜绝静音死寂）
* **双轨架构设计**：
  * **Track A（母带全曲底轨）**：无论是否有歌词演唱，全曲前奏、主歌、副歌、间奏、尾奏伴奏底音持续无缝走带。
  * **Track B（口型人声对齐轨）**：仅在有歌词且为中近景的镜头截取人声干声切片，送入 RunningHub 驱动唇形。
* **成片合成兜底**：生成的视频片段在剪辑合并成片后，**强制重贴全曲母带完整伴奏底轨**，彻底杜绝空白段无声死寂。

### 保证二：纯净画面（杜绝文字与字幕）与 背景图直通图生图
* **画面 0 文字/0 水印/0 歌词字幕**：
  * **负向提示词硬性注入**：强制加入 `text, words, subtitles, lyrics, watermark, font, writing, typo, letters, signature` 等字幕文字硬性屏蔽项。
  * **正向提示词审查**：严格剔除任何排版文字指示，只保留视觉场景、光影、人物特征与镜头动作，通过关 5 与关 6 自动化机检放行。
* **直接使用上传背景图 ➔ 内置 ImageGen 图生图 (buddy-multimodal-generation)**：
  * **指令**：如果用户要求「直接使用上传的背景图作为背景」，流水线自动调用平台内置 **ImageGen**（多模态生成能力，由 **`buddy-multimodal-generation`** 内置插件路由）执行 **图生图 / image-to-image**。
  * **结构锁死**：保留上传背景的建筑、空间格局、透视与环境基调，融合人物主角与冷暖氛围光影。
  * **节点直通**：图生图生成的纯净关键帧直接注入并绑定至 RunningHub ComfyUI 工作流 **Node 36 (`LoadImage.image`)**，取代默认参考图作为后续 MiniMax H3 视频生成的视觉基准。

---

## ⚡ 六大不可动摇铁律

* **铁律 A：音乐是唯一的时间基准**  
  歌词一行不能少，切点必须精确落在歌词句尾或乐句呼吸口；严禁按画面长度强行拉伸或裁剪音乐。
* **铁律 B：只有中近景才对口型**  
  仅允许 `ECU`（大特写）、`CU`（特写）、`MCU`（中特写）、`MS`（中景）开口；远景（`FS` / `WS` / `ELS`）与空镜**必须硬闭嘴**（负向强行压制）。全片口型镜头占比严格控制在约 **45% 黄金分割线**，连续口型段数 **不超过 3 段**。
* **铁律 C：唱歌不是说台词**  
  提示词禁止使用 `saying`、`talking`、`speaking` 等对白动词，必须使用独立发声行格式：`Singing vocals: "歌词文本"`；非口型段正向写明闭嘴，负向封死张嘴词。
* **铁律 D：不猜字段、不烧冤枉钱**  
  先体检（关 5 自动化 11 项机检），后消耗。提供 API Key 不等于同意扣费，真钱封顶与账号降级严格独立控制。
* **铁律 E：八道关 + 对齐三验**  
  自动化机检作为硬门禁，人工审查负责艺术把关。成片前必须通过**对齐三验**（滞后量 $\le 80\text{ms}$、波形相关度 $\ge 0.78$、人声能量 $\ge -36\text{dBFS}$）。
* **铁律 F：会自己长本事**  
  每跑完一支 MV 必须执行复盘三问，代码、文档与检查清单三位一体同步演进。

---

## 📐 两大自研专有算法

### 1. 视频帧网格时长贴合算法 (Mechanism 1: Duration Fitting)

针对模型只支持离散帧数的本质，本 SOP 采取**向上贴合、尾部硬裁**机制，消除 25 镜累积漂移（传统流程累积漂移高达 6 秒，本 SOP 锁死为 0.000 秒）：

$$F_k = \lceil W_k \times \text{FPS} \rceil$$
$$T_{\text{model}} = \frac{F_k}{\text{FPS}}$$
$$\Delta_{\text{overhang}} = T_{\text{model}} - W_k$$

视频生成后，利用精确 PTS 时间戳执行硬切，将冗余部分毫秒级裁切丢弃：
```bash
ffmpeg -y -ss 0.000 -t 4.1700 -i input_shot.mp4 \
  -vf "setpts=PTS-STARTPTS,fps=24" \
  -af "asetpts=PTS-STARTPTS" -c:v libx264 -c:a aac output_trimmed.mp4
```

### 2. 音频包络局部搜索对齐三验 (Mechanism 2: Three-Fold Alignment)

以 100Hz 提取人声音频与生成视频伴音的 RMS 能量包络，在 $\tau \in [-300\text{ms}, +300\text{ms}]$ 窗口内执行局部归一化互相关极值搜索：

$$R_{MV}(\tau) = \frac{\sum (E_M[t] - \mu_M)(E_V[t+\tau] - \mu_V)}{\sqrt{\sum (E_M[t]-\mu_M)^2 \sum (E_V[t+\tau]-\mu_V)^2}}$$

**Gate 8 验收硬门禁三指标**：
1. **最优滞后量**：$|\tau^*| \le 80\text{ms}$（超过 80ms 人眼即能察觉音画脱节）
2. **包络峰值相关度**：$R_{MV}(\tau^*) \ge 0.78$
3. **人声段均方根能量**：$\ge -36\text{dBFS}$（排除假性静音开唇）

---

## 🛠️ 自动化校验与执行脚本套件 (`skills/mv-auto-pipeline/scripts/`)

| 脚本文件 | 功能与断言规则 | 运行方式 |
| :--- | :--- | :--- |
| **`runninghub_client.py`** | 适配 26 节点专属 ComfyUI 工作流的任务派发、异步轮询与 Gate 8 自动化衔接 | `python3 runninghub_client.py --dry-run` |
| **`prompt_validator.py`** | 关 5 提示词 11 项机器自动化体检，含 SHA-256 签名指纹防篡改与零文字屏蔽检查 | `python3 prompt_validator.py` |
| **`gate6_checker.py`** | 关 6 数学硬门禁：首尾无缝衔接、总长守恒、连续口型 $\le 3$、占比 $\approx 45\%$ | `python3 gate6_checker.py` |
| **`align_check.py`** | Gate 8 对齐三验算法计算器 | `python3 align_check.py` |
| **`duration_fitter.py`** | 帧网格向上贴合帧数与 FFmpeg 毫秒级裁切命令行计算器 | `python3 duration_fitter.py` |
| **`cost_ledger.py`** | 算力成本台账、双池调度跟踪与真钱硬封顶控制 | `python3 cost_ledger.py` |

一键测试所有脚本：
```bash
python3 ./skills/mv-auto-pipeline/scripts/runninghub_client.py --dry-run && \
python3 ./skills/mv-auto-pipeline/scripts/prompt_validator.py && \
python3 ./skills/mv-auto-pipeline/scripts/gate6_checker.py
```

---

## 🖥️ 交互式全流程工作台功能模块

工作台包含 6 大交互标签页：

1. **12步与8道关全景 (Overview)**：SOP 进度全景、六大铁律矩阵、双重保障原则与验收标准；
2. **歌词时间轴 (Lyric Timeline - Gate 1)**：原曲母带音频波形走带、音画切点标记与呼吸口检测；
3. **分镜设计与硬门禁 (Storyboard Studio - Gate 4/5/6)**：
   - 景别四分律（仅中近景开口）；
   - **背景图直通图生图**：当用户要求直接使用上传背景图时，调用平台内置 **ImageGen**（由 **`buddy-multimodal-generation`** 插件路由）执行 **图生图 / image-to-image**，保真度 $\ge 96.8\%$，直连 RunningHub Node 36；
   - **关 6 实时计算**：首尾闭环无断层、连续口型段数、黄金占比监控；
   - **关 5 11 项提示词机检面板**：11 颗机检灯实时断言，支持一键规范重构；
   - **一键直通**：单镜一键派发至 RunningHub 渲染。
4. **RunningHub 云端调度中心 (RunningHub Dispatch)**：
   - 直通 [RunningHub 平台 (www.runninghub.cn)](https://www.runninghub.cn)；
   - 沙箱体验模式与云端 Live API 双模运行；
   - **三种视图模式**：
     1. **节点图谱**：直观展示 26 个 ComfyUI 真实节点与核心入参（Node 36 支持动态承载 ImageGen 合成关键帧）；
     2. **完整工作流 JSON**：动态注入当前分镜参数的真实 ComfyUI JSON，支持一键复制与下载 `.json`；
     3. **OpenAPI v2 Payload**：标准 Bearer Token 格式的差异化调度请求体；
   - 实时任务日志终端与 Gate 8 对齐三验判定。
5. **自研专有算法实验室 (Algorithm Lab)**：交互拖拽测试时长贴合漂移与音频包络三验；
6. **双池与成本台账 (Cost Ledger)**：成片秒数、机器跑时、消费金额三大指标，单镜零依赖重抽卡。

---

## 🚀 启动与开发

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器 (端口 3000)
npm run dev

# 3. 语法与代码检查
npm run lint

# 4. 生产构建打包
npm run build
```

---

## 📄 授权与同步维护铁律 (Maintenance Directive)

* **README 同步更新铁律（硬性准则）**：  
  后续无论进行任何功能增删、接口变动、ComfyUI 拓扑调整或规则演进，**必须无条件同步修正根目录 `/README.md` 与 Skill 专用目录 `/skills/mv-auto-pipeline/README.md`**。
* **三位一体交付原则（铁律 F）**：  
  必须时刻保持 **工程代码 (Code)**、**规范文档 (Docs & READMEs)**、**自动化机检清单 (Checklist & Scripts)** 三位一体完全一致，杜绝任何文档滞后。
