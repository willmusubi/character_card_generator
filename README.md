# Mufy 角色卡生成器

一站式 Mufy 角色卡创建工具，包含 Web 应用和 Claude Skills 两大部分。

## 项目概览

```
mufy-character-card-generator/
├── web/                           # Web 应用（React + TypeScript）
│   ├── src/
│   │   ├── components/            # UI 组件
│   │   ├── store/                 # Zustand 状态管理
│   │   ├── types/                 # TypeScript 类型定义
│   │   ├── utils/                 # 工具函数（AI 生成、模板等）
│   │   └── data/                  # AI 提示词
│   └── server.js                  # API 代理服务器
├── skills/                        # Claude Skills
│   ├── character-card/            # 角色卡生成器 Skill
│   ├── style-generator/           # CSS 美化生成器 Skill
│   └── immersive-ui/              # 前端 UI 模块生成器 Skill
├── tools/                         # 辅助工具脚本
├── templates/                     # 提示词模板
└── demos/                         # 演示文件
```

---

## Web 应用

### 功能特性

- **多人卡架构**：支持多个平级主角，每个角色有独立完整的数据
- **AI 一键生成**：输入角色描述，自动生成所有模块内容
- **多 AI 提供商**：支持 OpenAI、Claude、Gemini、Deepseek、Qwen
- **搜索增强**：自动搜索已知 IP 角色的官方资料
- **主题系统**：古风水墨、赛博朋克、现代简约、暖系可爱
- **实时预览**：编辑时实时预览输出格式
- **本地存储**：数据自动保存到浏览器 localStorage

### 快速开始

```bash
# 1. 进入 web 目录
cd web

# 2. 安装依赖
npm install

# 3. 启动开发服务器（前端 + API 代理）
npm run start

# 或分别启动：
npm run dev      # 前端 (http://localhost:5173)
npm run server   # API 代理 (http://localhost:3001)
```

### AI 服务配置

打开应用后，点击右上角齿轮图标配置 AI 服务：

| 提供商 | 获取 API Key | 支持模型 |
|-------|-------------|---------|
| OpenAI | [platform.openai.com](https://platform.openai.com/api-keys) | gpt-4.1, gpt-4o, o3, o4-mini |
| Claude | [console.anthropic.com](https://console.anthropic.com/) | claude-opus-4-5, claude-sonnet-4-5 |
| Gemini | [aistudio.google.com](https://aistudio.google.com/apikey) | gemini-3-pro, gemini-2.5-pro |
| Deepseek | [platform.deepseek.com](https://platform.deepseek.com/) | deepseek-chat, deepseek-reasoner |
| Qwen | [dashscope.console.aliyun.com](https://dashscope.console.aliyun.com/) | qwen-max, qwen3-235b-a22b |

### 多人卡架构

```
MultiCharacterCard（多人卡）
├── 全局共享数据
│   ├── plotSetting（世界背景/情节设定）
│   ├── outputSetting（输出设定）
│   ├── opening（开场设计）
│   └── relationshipNetwork（关系网）
│
├── mainCharacters[]（主角列表，1-N 个）
│   └── MainCharacter
│       ├── characterInfo（角色信息）
│       ├── persona（人设）
│       ├── adversityHandling（逆境处理）
│       ├── sampleDialogue（样例对话）
│       └── miniTheater（小剧场）
│
└── secondaryCharacters[]（次要角色，精简数据）
```

#### 使用场景

**单角色**：输入「一个温柔的古代才女」→ 生成单人卡

**多角色**：输入「最终幻想的蒂法和爱丽丝」→ 生成多人卡，每人独立数据

**导出单人卡**：从多人卡中选择一个角色导出，其他角色自动降级为次要角色

### 技术栈

- **前端**：React 18 + TypeScript + Vite + TailwindCSS
- **状态管理**：Zustand（带 persist 中间件）
- **图标**：Lucide React
- **API 代理**：Express + http-proxy-middleware

---

## Claude Skills

用于 Claude 对话的专用技能，可直接在 Claude 中使用。

### 1. character-card（角色卡一站式生成器）

**触发场景**：用户需要创建 Mufy 角色卡

**功能**：
- 生成完整 8 模块角色卡
- 内置 4 种主题美化
- 输出可直接复制到 Mufy

**文件**：
- `skills/character-card/SKILL.md` - 主指令
- `skills/character-card/references/module-templates.md` - 模块模板
- `skills/character-card/references/themes.md` - 主题 CSS

### 2. style-generator（CSS 美化生成器）

**触发场景**：需要美化角色卡视觉样式

**功能**：根据自然语言描述生成 CSS 代码

**文件**：`skills/style-generator/SKILL.md`

### 3. immersive-ui（前端 UI 模块生成器）

**触发场景**：需要生成可渲染的前端输出模块

**功能**：
- 生成 15+ 种模块（时间地点、人物状态、记忆等）
- 支持 6 种预设主题
- 输出 React JSX 或纯 HTML

**文件**：
- `skills/immersive-ui/SKILL.md` - 主指令
- `skills/immersive-ui/references/` - 模块规格、主题系统

### Skills 协作流程

```
                    用户需求
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│character-card│ │style-generator│ │immersive-ui│
│  角色卡内容  │ │   CSS 样式   │ │  前端模块   │
└──────┬──────┘ └──────┬──────┘ └──────┬──────┘
       │               │               │
       └───────────────┼───────────────┘
                       ▼
                 Mufy 角色卡
```

---

## 主题系统

| 主题 | 适用角色 | 配色 |
|------|---------|------|
| 古风水墨 | 古装、仙侠、武侠、宫廷 | 棕褐 + 米黄 + 宣纸白 |
| 赛博朋克 | 科幻、未来、AI、机械 | 霓虹青 + 霓虹紫 + 深空黑 |
| 现代简约 | 都市、职场、校园、日常 | 黑白灰 + 苹果蓝 |
| 暖系可爱 | 治愈、温馨、萌系、恋爱 | 樱花粉 + 奶白 |

主题自动匹配规则：
- 含「古」「仙」「侠」「三国」→ 古风水墨
- 含「科幻」「未来」「AI」「赛博」→ 赛博朋克
- 含「现代」「都市」「职场」「校园」→ 现代简约
- 含「治愈」「温馨」「可爱」「萌」→ 暖系可爱

---

## 辅助工具

### tools/generate_avatar.py

使用 Google API 根据角色外貌描述生成头像。

```bash
cd tools
pip install -r requirements.txt
export GOOGLE_API_KEY='your-api-key'
python generate_avatar.py
```

---

## 开发

### 构建生产版本

```bash
cd web
npm run build
```

### 目录说明

```
web/src/
├── components/
│   ├── editor/           # 编辑器组件
│   │   ├── forms/        # 各模块表单
│   │   └── ...
│   ├── ai-generate/      # AI 生成相关
│   └── ui/               # 通用 UI 组件
├── store/
│   ├── useMultiCharacterStore.ts  # 多人卡状态管理
│   └── useSettingsStore.ts        # 设置状态管理
├── types/
│   ├── multi-character-card.ts    # 多人卡类型定义
│   ├── character-card.ts          # 单人卡类型定义
│   └── settings.ts                # 设置类型定义
├── utils/
│   ├── ai-generator.ts            # AI 生成逻辑
│   ├── template-generator.ts      # 模板生成器
│   ├── card-migration.ts          # 数据迁移工具
│   └── export-single-card.ts      # 单人卡导出
└── data/
    └── ai-prompts.ts              # AI 提示词
```

---

## 注意事项

- 所有生成内容需遵守 Mufy 平台合规规则
- CSS 样式仅能粘贴到「小剧场」输入框
- API Key 保存在浏览器本地，不会上传服务器
