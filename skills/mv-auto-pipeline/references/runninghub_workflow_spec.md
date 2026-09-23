# RunningHub 项目与工作流调用技术规范 (RunningHub OpenAPI v2 Integration)

## 1. 核心项目绑定信息
* **官方平台**：[RunningHub (www.runninghub.cn)](https://www.runninghub.cn)
* **专属项目网址**：[https://www.runninghub.cn/post/2100506281638457345/?inviteCode=rh-v1083](https://www.runninghub.cn/post/2100506281638457345/?inviteCode=rh-v1083)
* **项目名称**：`AI音乐MV数字人（ngualarith+Minimax H3 Selflift）新二采`
* **工作流 ID (Workflow ID)**：`2100506281638457345`
* **邀请码 / 渠道标识**：`rh-v1083`
* **API 架构版本**：`OpenAPI v2` (Bearer Token 认证标准)
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

在通过 RunningHub OpenAPI v2 发起任务时，需将 MV-AUTO-PIPELINE 各分镜参数映射至对应节点字段：

| 节点用途 | 节点类型 (NodeType) | 推荐 NodeId | 字段名 (fieldName) | 取值规格与示例 |
| :--- | :--- | :--- | :--- | :--- |
| **主人公立绘** | `LoadImage` | `14` | `image` | 主人公参考图 URL 或上传的 `fileName` |
| **歌词人声切片** | `LoadAudio` | `18` | `audio` | 按照本分镜 `[Start, End]` 裁切的独立音轨文件 |
| **六段式正向词** | `Text Multiline` | `23` | `text` | 严格经关 5 机检放行的六段式提示词，含 `Singing vocals: "..."` 独立行 |
| **负向抑制词** | `Text Multiline` | `27` | `text` | 非口型段强行抑制张嘴；口型段过滤模糊与破音伪影 |
| **帧网格时长** | `TrimAudioDuration` | `32` | `duration` | 经 `duration_fitter.py` 向上网格对齐后的秒数 `ceil(TargetSeconds * FPS) / FPS` |
| **采样器随机种子**| `SelfLiftAvatarH3Sampler`| `41` | `seed` | 镜头独立 Hash 种子，支持单镜头零依赖重抽卡 |

---

## 4. RunningHub OpenAPI v2 通信协议标准

RunningHub 现行官方标准采用 **OpenAPI v2**，通过 HTTP 请求头中的 `Authorization: Bearer <API_KEY>` 进行身份鉴权。

### 4.1 发起任务 (Run Workflow v2)
* **Method**: `POST`
* **URL**: `https://www.runninghub.cn/openapi/v2/run/workflow/2100506281638457345`
* **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_RUNNINGHUB_API_KEY`
* **Payload 结构**:
```json
{
  "nodeInfoList": [
    {
      "nodeId": "14",
      "fieldName": "image",
      "fieldValue": "https://rh-images.xiaoyaoyou.com/demo/protagonist.png"
    },
    {
      "nodeId": "18",
      "fieldName": "audio",
      "fieldValue": "https://rh-images.xiaoyaoyou.com/audio/shot_02.wav"
    },
    {
      "nodeId": "23",
      "fieldName": "text",
      "fieldValue": "[SHOT] CU, 85mm portrait lens, f/1.8\n[SUBJECT] 22yo female singer\n[ACTION] Singing with emotional intensity\nSinging vocals: \"风吹过熟悉的街道\"\n[ENVIRONMENT] Neon-lit street\n[LIGHTING_COLOR] Cyan and warm amber lighting\n[CAMERA_TECH] Slow gentle push-in, 24fps"
    },
    {
      "nodeId": "27",
      "fieldName": "text",
      "fieldValue": "blurry, low quality, artifacts, distorted mouth"
    },
    {
      "nodeId": "32",
      "fieldName": "duration",
      "fieldValue": 4.2083
    },
    {
      "nodeId": "41",
      "fieldName": "seed",
      "fieldValue": 1083
    }
  ],
  "instanceType": "default",
  "usePersonalQueue": false
}
```

* **成功响应 (Response)**:
```json
{
  "taskId": "2100506281638457345_1790147750",
  "status": "QUEUED"
}
```

### 4.2 轮询结果 (Query Task v2)
* **Method**: `POST`
* **URL**: `https://www.runninghub.cn/openapi/v2/query`
* **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer YOUR_RUNNINGHUB_API_KEY`
* **Payload 结构**:
```json
{
  "taskId": "2100506281638457345_1790147750"
}
```

* **响应结构 (Response)**:
```json
{
  "taskId": "2100506281638457345_1790147750",
  "status": "SUCCESS",
  "errorCode": "",
  "errorMessage": "",
  "results": [
    {
      "url": "https://rh-images.xiaoyaoyou.com/renders/shot_02_h3.mp4",
      "type": "video"
    }
  ],
  "usage": {
    "points": 35,
    "costUsd": 0.35
  }
}
```

* **状态枚举**：
  - `QUEUED`：排队中
  - `RUNNING`：RunningHub GPU 节点正在使用 Minimax H3 推理
  - `SUCCESS`：渲染完成，返回产物视频 URL（直接进入 Gate 8 对齐三验）
  - `FAILED`：报错（自动捕获 `errorMessage`，触发重试或降级）

---

## 5. 铁律落实与自动化衔接

1. **先体检，后消耗（铁律 D）**：
   在向 RunningHub OpenAPI v2 发送任何 HTTP 请求前，`scripts/prompt_validator.py` 必须对分镜提示词执行 11 项断言。如果任一项未通过，严禁发出请求，杜绝烧钱。
2. **帧网格贴合（自研算法一）**：
   调用 `scripts/duration_fitter.py` 计算当前分镜的 `duration`，并作为 `Node 32` 的 `fieldValue` 传入。
3. **对齐三验（自研算法二 / Gate 8）**：
   从 `results[0].url` 下载或读取产物视频后，立刻触发 `scripts/align_check.py`，只有满足滞后量 $\le 80\text{ms}$、互相关度 $\ge 0.78$、人声能量 $\ge -36\text{dBFS}$ 时，镜头才被允许合并进入母带总轨。
