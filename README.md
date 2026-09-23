# MV-AUTO-PIPELINE (V1.0.6) · 音乐 MV 全自动生成 SOP

> **核心承诺**：一首歌 + 一张主人公图，交付一支音画严格对齐、口型精准匹配的高品质音乐 MV。  
> **底层算力**：官方无缝集成 **RunningHub (www.runninghub.cn)** ComfyUI 云端工作流 `AI音乐MV数字人（ngualarith+Minimax H3 Selflift）新二采`。

---

## 🔗 RunningHub 云端工作流项目绑定

* **官方平台**：[RunningHub (www.runninghub.cn)](https://www.runninghub.cn)
* **专属项目网址**：[https://www.runninghub.cn/post/2100506281638457345/?inviteCode=rh-v1083](https://www.runninghub.cn/post/2100506281638457345/?inviteCode=rh-v1083)
* **项目名称**：`AI音乐MV数字人（ngualarith+Minimax H3 Selflift）新二采`
* **工作流 ID (Workflow ID)**：`2100506281638457345`
* **邀请码 / 渠道标**：`rh-v1083`
* **API 架构标准**：**RunningHub 官方 OpenAPI v2**
  * **创建任务**：`POST /openapi/v2/run/workflow/{workflowId}`（标头 `Authorization: Bearer <API_KEY>`）
  * **轮询结果**：`POST /openapi/v2/query`（入参 `{"taskId": "..."}`）
* **工作流节点与引擎栈**：
  * **采样器**：`SelfLiftAvatarH3Sampler`（Minimax H3 Turbo 4-Step 唇形自举采样）
  * **音画多模态大模型**：`qwen3vl_32b_minimax_h3_int8_convrot` + `minimax_h3_fl2va_bf16`
  * **音频 Latent 编码器**：`minimax_h3_audio_vae_fp32`
  * **时空 Latent 超分放大**：`minimax_h3_latent_upscaler_3d_fp16`

### ComfyUI 节点参数映射标准 (OpenAPI)

| 节点用途 | 节点类型 | Node ID | 字段名 (Field) | 说明与注入规则 |
| :--- | :--- | :--- | :--- | :--- |
| **主人公立绘** | `LoadImage` | `14` | `image` | 面部基准立绘，保障角色全片一致性 |
| **歌词人声音频** | `LoadAudio` | `18` | `audio` | 按照歌词时间轴截取的人声音轨切片 |
| **六段式提示词** | `Text Multiline` | `23` | `text` | 关 5 机检通过的正向词，含独立发声行 `Singing vocals: "..."` |
| **负向抑制词** | `Text Multiline` | `27` | `text` | 非口型段强行抑制张嘴；口型段过滤画质伪影 |
| **帧网格时长** | `TrimAudioDuration` | `32` | `duration` | 自研算法向上网格贴合秒数：`ceil(TargetSeconds * FPS) / FPS` |
| **采样器种子** | `SelfLiftAvatarH3Sampler`| `41` | `seed` | 镜头独立哈希种子，单镜解耦可单独重抽卡 |

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
| **`runninghub_client.py`** | RunningHub ComfyUI 工作流任务派发、异步轮询与 Gate 8 自动化衔接 | `python3 runninghub_client.py --dry-run` |
| **`prompt_validator.py`** | 关 5 提示词 11 项机器自动化体检，含 SHA-256 签名指纹防篡改 | `python3 prompt_validator.py` |
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

1. **12步与8道关全景 (Overview)**：SOP 进度全景、六大铁律矩阵与验收标准；
2. **歌词时间轴 (Lyric Timeline - Gate 1)**：原曲母带音频波形走带、音画切点标记与呼吸口检测；
3. **分镜设计与硬门禁 (Storyboard Studio - Gate 4/5/6)**：
   - 景别四分律（仅中近景开口）；
   - **关 6 实时计算**：首尾闭环无断层、连续口型段数、黄金占比监控；
   - **关 5 11 项提示词机检面板**：11 颗机检灯实时断言，支持一键规范重构；
   - **一键直通**：单镜一键派发至 RunningHub 渲染。
4. **RunningHub 云端调度中心 (RunningHub Dispatch)**：
   - 直通 [www.runninghub.cn 工作流 2100506281638457345](https://www.runninghub.cn/post/2100506281638457345/?inviteCode=rh-v1083)；
   - 沙箱体验模式与云端 Live API 双模运行；
   - ComfyUI 节点参数可视化映射与一键复制 Payload；
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

## 📄 授权与贡献规范

遵循 AI Studio Skill 规范与 SOP 铁律 F：每次修改必须保持**代码 (Code)、规范文档 (Docs)、机检清单 (Checklist)** 三位一体同步发版。
