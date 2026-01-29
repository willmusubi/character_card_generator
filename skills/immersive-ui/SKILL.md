---
name: immersive-dialogue-ui
description: 沉浸式对话体验的前端输出模块框架生成器。当用户需要为角色扮演、互动小说、AI伴侣等场景创建美化的对话界面模块时使用。支持：(1) 生成单个或组合模块（时间地点、人物状态、记忆、群聊、公众讨论、旁白、好感度、选项分支等）；(2) 根据用户需求定制模块；(3) 应用主题美化（赛博朋克、古风、现代等）；(4) 与frontend-design skill协作实现高级美化。输出为可渲染的React JSX或HTML组件。
---

# 沉浸式对话UI模块生成器

生成用于角色扮演/互动叙事场景的美化前端输出模块。

## 工作流程

1. **需求分析** - 确认用户需要哪些模块、主题风格
2. **模块选择** - 从模块目录选择或自定义
3. **主题应用** - 选择预设主题或自定义
4. **代码生成** - 输出可渲染的React/HTML
5. **美化增强** - 如需高级美化，参考frontend-design skill

## 模块目录

### 固定核心模块

| 模块ID | 名称 | 用途 |
|--------|------|------|
| `scene-header` | 时间地点模块 | 显示当前场景的时间、地点、天气 |
| `character-status` | 人物状态模块 | 角色衣着、动作、表情、内心OS |
| `memory-log` | 记忆模块 | 有序记忆条目，支持压缩 |

### 对话类模块

| 模块ID | 名称 | 用途 |
|--------|------|------|
| `chat-bubble` | 单人对话气泡 | 基础对话显示 |
| `group-chat` | 群聊模块 | 微信风格多人群聊 |
| `private-message` | 私信模块 | 手机短信风格 |

### 叙事类模块

| 模块ID | 名称 | 用途 |
|--------|------|------|
| `narrator` | 旁白模块 | 第三人称场景叙述 |
| `inner-monologue` | 内心独白 | 角色深层意识流 |
| `public-reaction` | 公众讨论模块 | NPC们对事件的反应 |
| `atmosphere` | 气氛渲染模块 | 环境、天气、BGM提示 |

### 游戏化模块

| 模块ID | 名称 | 用途 |
|--------|------|------|
| `affection-bar` | 好感度模块 | 关系进度条/等级 |
| `choice-branch` | 选项分支模块 | 可点击剧情选项 |
| `item-popup` | 物品获取模块 | 物品/成就弹窗 |
| `quest-tracker` | 任务追踪模块 | 当前任务/目标 |

### 信息类模块

| 模块ID | 名称 | 用途 |
|--------|------|------|
| `character-card` | 角色档案卡 | 悬浮角色详情 |
| `lore-tooltip` | 世界观词条 | 可展开的设定百科 |
| `notification` | 通知推送模块 | 系统通知、角色提醒 |
| `social-feed` | 朋友圈模块 | 角色动态/朋友圈 |

## 主题系统

### 预设主题

- `cyberpunk` - 霓虹紫蓝、故障艺术、科技感
- `ancient-chinese` - 水墨、米白底、毛笔字体风格
- `modern-minimal` - 黑白灰、大留白、无衬线字体
- `cozy-warm` - 暖色调、圆角、温馨感
- `dark-gothic` - 深色、哥特字体、神秘感
- `pastel-cute` - 粉彩、可爱、圆润

### 自定义主题变量

```css
:root {
  /* 颜色 */
  --primary: #xxx;
  --secondary: #xxx;
  --background: #xxx;
  --text: #xxx;
  --accent: #xxx;
  
  /* 字体 */
  --font-display: 'xxx';
  --font-body: 'xxx';
  
  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  
  /* 动画 */
  --transition-fast: 0.15s;
  --transition-normal: 0.3s;
}
```

## 生成规范

### React JSX 输出

- 使用函数式组件 + Hooks
- 使用Tailwind CSS核心类
- CSS变量控制主题
- 支持Motion库动画（如可用）
- 单文件输出（样式内联或CSS-in-JS）

### HTML 输出

- 纯HTML/CSS/JS单文件
- CSS动画优先
- 响应式设计
- 无外部依赖

## 与 frontend-design 协作

当用户需要高级美化时：

1. 先用本skill生成模块骨架和基础样式
2. 读取 `/mnt/skills/public/frontend-design/SKILL.md`
3. 应用frontend-design的美学原则进行增强
4. 重点关注：字体选择、色彩对比、动效、空间构图

## 使用示例

**用户请求**: "帮我生成一个人物状态模块，赛博朋克风格"

**执行步骤**:
1. 选择 `character-status` 模块
2. 应用 `cyberpunk` 主题
3. 生成React组件，包含：
   - 角色头像框（霓虹边框动画）
   - 状态条目（衣着、动作、心情）
   - 内心OS区域（打字机效果）
4. 输出可渲染的JSX代码

## 详细规格

- 模块详细结构和数据格式：见 [references/module-catalog.md](references/module-catalog.md)
- 主题系统完整说明：见 [references/theme-system.md](references/theme-system.md)
- 高级集成指南：见 [references/integration-guide.md](references/integration-guide.md)
