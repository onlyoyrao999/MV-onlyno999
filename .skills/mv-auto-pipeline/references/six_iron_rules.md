# 六大不可动摇铁律技术实现细则

## 铁律 A：音乐是唯一的时间基准 (Music As Single Source of Truth)
- **基准锚点**：视频镜头时长不得脱离音频独自设计。必须先导入母带音频，获取精确总毫秒数与采样率。
- **歌词全覆盖**：所有歌词行（包括 Intro 念白、和声、重复副歌、尾声）必须逐字逐行建立 LRC/JSON 时间戳。
- **强制间奏切点**：前奏、间奏、Solo、尾奏作为独立 Instrument 占位段保留，镜头切点只允许吸附在乐句终点或鼓点强拍上。

## 铁律 B：只有中近景才对口型 (Restricted Lip-Sync Shot Scales)
- **允许对口型**：
  - `ECU (Extreme Close-Up)`: 大特写（面部核心）
  - `CU (Close-Up)`: 特写（头肩）
  - `MCU (Medium Close-Up)`: 近景（胸部以上）
  - `MS (Medium Shot)`: 中景（半身）
- **严禁对口型**：
  - `MLS (Medium Long Shot)`: 中远景
  - `FS / LS (Full Shot / Long Shot)`: 全景 / 远景
  - `ELS (Extreme Long Shot)`: 大远景
  - `Scenery / Empty (空镜)`
  - `Back-View (背影)`
  - `Crowd / Montage (群像/蒙太奇)`
- **生理节奏控制**：
  - 口型镜头占总时长黄金区间：`40% ~ 50%`。
  - 连续口型镜头数：`<= 3`。超过 3 个镜头必须强制插入非口型镜头以防视觉僵硬。

## 铁律 C：唱歌不是说台词 (Singing Is Not Dialogue)
- 模型如果遇到 "character says..." 会倾向于生成日常说话、嘴部微张微合的动作。
- 必须使用标准歌唱标记独立成行：`Singing vocals: "xxx"`。
- 不对口型镜头必须强行正向注入：
  `"mouth naturally closed, lips completely still, not moving along with vocals"`
  并配合 Negative Prompt 强行压制口型伪影。

## 铁律 D：不猜字段、不烧冤枉钱 (Defensive Execution)
- 远程 API / ComfyUI 工作流提交前，动态请求 `/object_info` 校验 Node ID 与 Input Name。
- 提取音频 SHA-256 和角色图 SHA-256，全剧集生命周期仅上传一次，避免重传开销。
- 区分试产模式与量产模式，首镜验证通过前禁止派发全量批处理。

## 铁律 E：八道关 + 对齐三验 (Two-Tier Gates)
- 所有步骤均生成独立 HTML 面板便于人工审查。
- 关 5 与 关 6 作为硬门禁阻断非法请求。
- 验收指标包含：时长守恒校验、包络局部互相关判定、人声有效能量。

## 铁律 F：自演进闭环 (Self-Evolution Loop)
- 复盘三问记录在案。
- 代码修复、规则文档、自动化测试三位一体更新。
- 具备自动快照和回滚防线。
