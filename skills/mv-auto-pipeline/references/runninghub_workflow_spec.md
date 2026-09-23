# RunningHub 项目与工作流调用技术规范 (RunningHub Workflow Integration)

## 1. 核心项目绑定信息
* **官方平台**：[RunningHub (www.runninghub.cn)](https://www.runninghub.cn)
* **专属项目网址**：[https://www.runninghub.cn/post/2100506281638457345/?inviteCode=rh-v1083](https://www.runninghub.cn/post/2100506281638457345/?inviteCode=rh-v1083)
* **项目名称**：`AI音乐MV数字人（ngualarith+Minimax H3 Selflift）新二采`
* **工作流 ID (Workflow ID)**：`2100506281638457345`
* **邀请码 / 渠道标识**：`rh-v1083`
* **作者**：`Ai随风`
* **分类标签**：文生视频 / 视频生视频 / 图生视频 / 音乐数字人

---

## 2. 底层 ComfyUI 模型与算力栈

本工作流采用顶级 Minimax H3 唇形自举采样技术（Selflift Avatar H3 Sampler）与多模态音视频 Latent 对齐：

| 关键模型文件 | 作用与规格 |
| :--- | :--- |
| `minimax_h3_audio_vae_fp32.safetensors` | 音频特征 Latent 编码器，提取人声音频音素与共振峰特征 |
| `minimax_h3_fl2v_lightx2v_turbo_4step_v0.1_comfy.safetensors` | 4 步极速 Turbo 扩散视频主干网络，兼顾电影级画质与毫秒级生成效率 |
| `minimax_h3_fl2va_bf16.safetensors` | 音画联合注意力 cross-modal 投影层 |
| `minimax_h3_latent_upscaler_3d_fp16.safetensors` | 时空三维 Latent 超分辨率放大器，避免面部与唇齿边缘抖动撕裂 |
| `minimax_h3_video_vae_fp16.safetensors` | 视频流编码解码器 |
| `qwen3vl_32b_minimax_h3_int8_convrot.safetensors` | 视觉语言大模型 (Qwen3-VL 32B)，提供高精度肢体动作与镜头景别控制 |

---

## 3. 核心节点映射与调用规范 (Node Info Mappings)

在通过 OpenAPI `POST /task/openapi/create` 发起任务时，需将 MV-AUTO-PIPELINE 各分镜参数映射至对应节点字段：

| 节点用途 | 节点类型 (NodeType) | 推荐 NodeId | 字段名 (fieldName) | 取值规格与示例 |
| :--- | :--- | :--- | :--- | :--- |
| **主人公立绘** | `LoadImage` | `14` | `image` | 主人公参考图 URL 或通过 `/task/openapi/upload` 上传的 `fileName` |
| **歌词人声切片** | `LoadAudio` | `18` | `audio` | 按照本分镜 `[Start, End]` 裁切的独立音轨文件 |
| **六段式正向词** | `Text Multiline` | `23` | `text` | 严格经关 5 机检放行的六段式提示词，含 `Singing vocals: "..."` 独立行 |
| **负向抑制词** | `Text Multiline` | `27` | `text` | 非口型段强行抑制张嘴；口型段过滤模糊与破音伪影 |
| **帧网格时长** | `TrimAudioDuration` | `32` | `duration` | 经 `duration_fitter.py` 向上网格对齐后的秒数 `ceil(TargetSeconds * FPS) / FPS` |
| **采样器随机种子**| `SelfLiftAvatarH3Sampler`| `41` | `seed` | 镜头独立 Hash 种子，支持单镜头零依赖重抽卡 |

---

## 4. OpenAPI 通信协议

### 4.1 发起任务 (Task Create)
* **Method**: `POST`
* **URL**: `https://www.runninghub.cn/task/openapi/create`
* **Headers**: `Content-Type: application/json`
* **Payload 结构**:
```json
{
  "apiKey": "YOUR_RUNNINGHUB_API_KEY",
  "workflowId": "2100506281638457345",
  "nodeInfoList": [
    {
      "nodeId": "14",
      "fieldName": "image",
      "fieldValue": "protagonist_01.png"
    },
    {
      "nodeId": "18",
      "fieldName": "audio",
      "fieldValue": "vocal_clip_02.wav"
    },
    {
      "nodeId": "23",
      "fieldName": "text",
      "fieldValue": "[SHOT] CU, 85mm lens\n[SUBJECT] 22yo female\n[ACTION] Singing\nSinging vocals: \"风吹过熟悉的街道\"\n[ENVIRONMENT] Neon street\n[LIGHTING_COLOR] Cyan\n[CAMERA_TECH] Slow push-in"
    },
    {
      "nodeId": "32",
      "fieldName": "duration",
      "fieldValue": 4.2083
    }
  ]
}
```

### 4.2 轮询结果 (Task Outputs)
* **Method**: `POST`
* **URL**: `https://www.runninghub.cn/task/openapi/outputs`
* **Payload 结构**:
```json
{
  "apiKey": "YOUR_RUNNINGHUB_API_KEY",
  "taskId": "task_2100506281638457345_xxxxxx"
}
```
* **状态枚举**：
  - `QUEUED`：排队中
  - `RUNNING`：RunningHub GPU 节点正在使用 Minimax H3 推理
  - `SUCCESS`：渲染完成，返回产物视频 URL（进入 Gate 8 对齐三验）
  - `FAILED`：报错（自动触发重试或降级至备用节点）

---

## 5. 铁律落实与自动化衔接

1. **先体检，后消耗（铁律 D）**：
   在向 RunningHub 提交请求前，必须先在本地运行 `prompt_validator.py`。11 项提示词机检若有一项未通过，严禁提交到 RunningHub，杜绝烧废点数。
2. **时长网格贴合（机制一）**：
   请求的 `duration` 字段必须由 `duration_fitter.py` 计算出向上网格帧数，严禁随意填写浮点数导致帧撕裂。
3. **逐镜对齐三验（Gate 8）**：
   RunningHub 视频生成落盘后，通过 `align_check.py` 执行局部时移搜索，确保滞后量 $\le 80\text{ms}$、波形相关度 $\ge 0.78$、能量 $\ge -36\text{dBFS}$。
4. **单镜解耦重抽**：
   若某镜未能通过人工审美或 Gate 8 验证，仅需传入新的 `seed` 针对该单一镜头重新调用 RunningHub，不影响其余片段。
