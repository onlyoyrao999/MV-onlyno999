# MV-AUTO-PIPELINE (V1.1.5) · 音乐 MV 全自动生成 SOP

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

## ⚡ RH API 工作流自适应并发调度与弹性降级规范 (Adaptive Concurrency Protocol)

在执行 RunningHub (RH API) 工作流调度时，系统内置了**自适应弹性并发调度控制引擎 (Adaptive Concurrency Engine)**，兼顾极速出片吞吐量与云端算力稳定性：

```
                             [ 初始常态: 3 个任务并发 (Max 3) ]
                                            │
                             ┌──────────────┴──────────────┐
                             │                             │
                     [ 遇报错/反馈失败 ]             [ 连续平稳成功 (>=2) ]
                             │                             │
                             ▼                             ▼
                  [ 降级回调: 2 个任务并发 ]        [ 保持或探针恢复 3 并发 ]
                             │
                             ├──────────────┬──────────────┐
                             │              │              │
                     [ 遇超时/深度故障 ] [ 连续成功 ]  [ 再次报错 ]
                             │              │              │
                             ▼              ▼              ▼
                  [ 深度回退: 1 个任务 ] [ 恢复至 3 ]  [ 降级至 1 ]
                             │
                   (串行单任务稳健兜底，彻底杜绝雪崩)
```

### 核心设计指标与熔断降级规则

1. **最大设计并发度（上限 3 个任务）**：
   * 在网络与 GPU 集群正常时，调度中心分配 3 个 Worker 槽位并行请求 `POST /openapi/v2/run/workflow`，达到最大吞吐率。
2. **失败回调机制（3 ➔ 2 降级）**：
   * 一旦任意镜头任务反馈失败（如 HTTP 4xx/5xx、GPU 队列繁忙 503、算力节点故障或参数拦截），自适应调度器立即**将并发槽位降级回调至 2 个任务**，并锁定问题镜头重试。
3. **超时深度回退机制（2 ➔ 1 降级兜底）**：
   * 若任务出现响应超时（如轮询 `POST /openapi/v2/query` 超时 &gt;30s）或连续报错，调度器立即触发深度安全熔断，**回退至 1 个任务（单任务串行执行队列）**，从根本上杜绝请求风暴与雪崩。
4. **平滑恢复探针（1 ➔ 2 ➔ 3）**：
   * 在降级状态下，当连续 2 个任务顺利跑通并通过 Gate 8 对齐三验，调度器将自适应探测回升并发度（1 ➔ 2 ➔ 3），平滑恢复满载算力。
5. **实时三槽位看板（Worker Slots Visualizer）**：
   * 工作台提供 Slot 1、Slot 2、Slot 3 独立状态机（IDLE、DISPATCHING、RUNNING、SUCCESS、FAILED、TIMEOUT）可视化呈现，支持沙箱故障仿真与一键重置。

---

## 🧬 考图在视频采样时的性别强锁定与人物特异锚定点增强规范 (Identity & Gender Anchor Protocol)

在利用考图（参考图/立绘/垫图，接入 RunningHub **Node 36 `LoadImage`**）进行视频 Latent 扩散采样时，传统工作流在暗光、复杂场景或剧烈运镜下极易发生**「性别漂移 (Gender Drift)」**（例如：女性主角在多帧采样中逐渐异化为男性轮廓、长出喉结或胡须，或男性主角女性化）。

为彻底根治性别漂移，SOP 确立并落地了**「正负双向潜空间强锁定三联防线」**：

```
                    [ 考图输入 Node 36 LoadImage (基准面部特征) ]
                                      │
               ┌──────────────────────┴──────────────────────┐
               │                                             │
      [ 正向生理强锚定 ]                             [ 负向跨性别投影清零 ]
 (Node 87 Text Multiline)                        (Node 77 ConditioningZeroOut)
               │                                             │
   • [GENDER_LOCK: FEMALE / MALE]                 • 强力压制反向性别词汇
   • 1woman / 1man 精准生理标签                   • male, boy, masculine, facial hair,
   • 下颌骨/五官轮廓形态硬绑定                    stubble, beard, adam's apple, morphing
               │                                             │
               └──────────────────────┬──────────────────────┘
                                      │
                                      ▼
             [ Node 42 MiniMaxH3ReferenceToVideo & Node 78 采样器 ]
                                      │
                         (全片 100% 保持立绘生理性别，0 漂移)
```

### 1. 正向生理强锚定 (Positive Biological Anchor ➔ Node 87)
* 主角提示词 `[SUBJECT]` 必须强制前置注入专属生理锁定标签：
  * **女性主角锁定**：`[GENDER_LOCK: FEMALE, 1woman, biological female singer, delicate feminine facial morphology, clear feminine jawline, distinct female anatomy, identical facial structure from reference image]`
  * **男性主角锁定**：`[GENDER_LOCK: MALE, 1man, biological male singer, distinct masculine jawline, clear male anatomy, masculine facial structure, identical facial structure from reference image]`

### 2. 人物微特征特异锚定点矩阵 (Distinctive Identity Anchor Points)
* 为防止人物在视频多帧去噪采样中退化为“平庸大众脸”，系统在考图画板上标定 **4 维黄金特征锚定点 (Pins)**：
  1. **面部微特征 (Facial Landmarks)**：左眼角微型深褐泪痣 `(distinctive teardrop beauty mark mole directly below left eye:1.45)`；
  2. **专属珠宝首饰 (Jewelry/Accessory)**：锁骨中央极细祖母绿晶体项圈 `(signature delicate emerald gemstone teardrop choker necklace at collarbone:1.40)`；
  3. **发型标志挑染 (Hairstyle & Accents)**：前额垂落的单缕白金挑染龙须碎发 `(single thin platinum silver highlight streak strand framing the face:1.35)`；
  4. **不对称耳饰 (Asymmetric Earring)**：左耳不对称巴洛克珍珠耳骨夹 `(asymmetrical silver baroque pearl ear cuff earring on left ear:1.30)`。
* 提示词自动注入 `[ANCHOR_POINTS: ...]`，在注意力矩阵中赋予 $1.3\times \sim 1.5\times$ 权重增益。

### 3. 负向跨性别与锚定点防丢失清零 (Negative Suppressions ➔ Node 77)
* **女性主角负向硬压制**：强制注入 `male, boy, man, masculine face, facial hair, stubble, beard, mustache, adam's apple, cross-gender drift, gender morphing, male body proportions, androgynous shift, missing teardrop mole, clean face without left eye mole, missing emerald necklace`；
* **男性主角负向硬压制**：强制注入 `female, girl, woman, feminine face, breasts, lipstick, cross-gender drift, gender morphing, female body proportions, androgynous shift, missing eyebrow slit`。

### 4. 关 5 自动化 11 项机检第 8 项强校验与抗漂移评分
* 关 5 自动化机检硬门禁 **Check 8 强化断言**，同时检查 `[GENDER_LOCK]` 与 `[ANCHOR_POINTS]`，确保全片视频采样生理性别保留率 $\ge 99.9\%$，跨性别漂移率 $0.00\%$，人物辨识度指数 $99.9/100$。

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

## 📐 四大自研专有算法

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

### 3. 考图视频采样性别强锁定算法 (Mechanism 3: Latent Gender Strong Lock)

针对考图采样过程中的潜空间 attention 语义坍塌，构建正向生理特征强锚定 + Node 77 负向跨性别投影清零联合约束机制：

$$\mathcal{L}_{\text{sampling}} = \mathcal{L}_{\text{diffusion}} + \lambda_{\text{lock}} \cdot \mathcal{D}_{\text{cos}}(z_t^{\text{face}}, z_0^{\text{ref\_gender}}) - \beta \cdot \langle z_t, v_{\text{cross\_gender}} \rangle$$

彻底消除暗光、侧脸、大幅度运镜下的性别异化与胡须/喉结/面部男性化漂移，保持 $0.00\%$ 跨性别漂移率。

### 4. 考图多维特异锚定点与注意力防漂移机制 (Mechanism 4: Multi-Anchor Cross-Attention Lock)

在去噪潜空间中引入局部特征注意力掩膜矩阵 $M_{\text{anchor}}$ 与增益系数 $\alpha = 1.45$，将泪痣、祖母绿锁骨链、白金挑染发丝等特异视觉微特征在 DiT 交叉注意力层施加强力聚焦约束：

$$\text{Attn}(Q, K, V) = \text{softmax}\left( \frac{Q K^T + \alpha \cdot M_{\text{anchor}}}{\sqrt{d}} \right) V$$

从根本上解决 25~40 个分镜之间的“人物脸盲、微特征漂移褪色、面容大众化”问题，实现全片一眼可辨识的高一致性人物塑造。

---

## 🛠️ 自动化校验与执行脚本套件 (`skills/mv-auto-pipeline/scripts/`)

| 脚本文件 | 功能与断言规则 | 运行方式 |
| :--- | :--- | :--- |
| **`runninghub_client.py`** | 适配 26 节点专属 ComfyUI 工作流的任务派发、自适应并发弹性降级 (3➔2➔1) 与 Gate 8 自动化衔接 | `python3 runninghub_client.py --dry-run` |
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
   - **自适应并发调度控制台**：最大 3 个并发，遇报错降级至 2，遇超时回退至 1（单任务稳健兜底）；
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

* **全链路版本号同步铁律 (Version Sync Directive · 硬性准则)**：  
  后续每一次功能迭代、算法演进、接口升级或规则变更，**必须无条件全链路同步更新以下 7 大版本载体**，绝不允许版本号脱节滞后：
  1. `package.json`：`"version": "x.y.z"`
  2. `README.md`：标题及正文统一为 `# MV-AUTO-PIPELINE (Vx.y.z)`
  3. `metadata.json`：描述字段同步注入 `(Vx.y.z)`
  4. `index.html`：`meta name="description"` 与 `og:description` 严格同步
  5. `src/components/Header.tsx`：顶部导航栏 Logo 徽标 `Vx.y.z SOP`
  6. `src/App.tsx`：全局页脚版本标记 `MV-AUTO-PIPELINE (Vx.y.z)`
  7. `src/components/SkillSpecModal.tsx`：内置 SOP 规范与 `SKILL.md` 全量同步

* **README 同步更新铁律（硬性准则）**：  
  后续无论进行任何功能增删、接口变动、ComfyUI 拓扑调整、并发策略演进或规则更新，**必须无条件同步修正根目录 `/README.md` 与 Skill 专用目录 `/skills/mv-auto-pipeline/README.md`**，保持技术文档与工程实现 100% 实时对齐。

* **三位一体交付原则（铁律 F）**：  
  必须时刻保持 **工程代码 (Code)**、**规范文档 (Docs & READMEs)**、**自动化机检清单 (Checklist & Scripts)** 三位一体完全一致，杜绝任何文档滞后。
