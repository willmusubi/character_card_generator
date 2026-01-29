# Mufy 沉浸式对话体验工具集

一套用于 Mufy 平台及类似沉浸式对话产品的 Claude Skills 工具集。

## 目录结构

```
mufy-character-card-generator/
├── skills/                        # Claude Skills
│   ├── character-card/            # 角色卡生成器
│   ├── style-generator/           # CSS美化生成器
│   └── immersive-ui/              # 前端UI模块生成器
├── tools/                         # 辅助工具脚本
├── templates/                     # 提示词模板
└── demos/                         # 演示文件
```

## Skills 概览

### 1. character-card（角色卡一站式生成器）
**触发场景**: 用户需要创建 Mufy 角色卡

**功能**:
- 生成完整8模块角色卡（角色信息、人设、逆境处理、情节设定、输出设定、样例对话、小剧场、开场设计）
- 支持多种角色类型（情感陪伴、专家顾问、沉浸叙事、日常闲聊）
- **内置4种主题美化**（古风水墨、赛博朋克、现代简约、暖系可爱）
- **输出设定包含完整的美化输出模块模板（内联样式）**
- **小剧场包含完整的CSS美化代码**
- 主题自动匹配或用户指定
- 输出可直接复制粘贴到 Mufy 各字段

**工作流程**:
```
需求收集 → 风格确定 → 内容生成 → 格式化输出
```

**输出结构**:
- 每个模块以分隔线标注对应的Mufy字段名
- 输出模块顺序：场景信息 → 正文 → 状态栏（在最后）
- 可选模块：记忆、好感度、群聊等

**文件**:
- `skills/character-card/SKILL.md` - 主指令
- `skills/character-card/references/module-templates.md` - 8大模块模板 + 输出模块HTML模板
- `skills/character-card/references/themes.md` - 4种主题完整CSS代码

---

### 2. style-generator（CSS美化生成器）
**触发场景**: 用户需要美化角色卡的视觉样式

**功能**:
- 根据自然语言描述生成纯 CSS 代码
- 支持美化：顶部栏、对话气泡、按钮、折叠栏、简介卡、背景等
- 输出代码粘贴到「小剧场」输入框即可生效

**文件**:
- `skills/style-generator/SKILL.md` - 主指令

---

### 3. immersive-ui（前端UI模块生成器）
**触发场景**: 用户需要生成可渲染的前端输出模块

**功能**:
- 生成15+种模块（时间地点、人物状态、记忆、群聊、好感度、选项分支等）
- 支持6种预设主题（赛博朋克、古风水墨、现代简约等）
- 输出 React JSX 或纯 HTML 代码

**文件**:
- `skills/immersive-ui/SKILL.md` - 主指令
- `skills/immersive-ui/references/module-catalog.md` - 模块详细规格
- `skills/immersive-ui/references/theme-system.md` - 主题系统说明
- `skills/immersive-ui/references/integration-guide.md` - 集成指南
- `skills/immersive-ui/assets/themes/` - 预设主题 CSS
- `skills/immersive-ui/assets/templates/react-base.jsx` - React 模板

---

## Skills 协作关系

```
┌─────────────────────────────────────────────────────────────┐
│                     用户需求                                 │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  character-card │ │ style-generator │ │  immersive-ui   │
│   角色卡内容     │ │   CSS 样式      │ │   前端模块      │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         │                   ▼                   │
         │          ┌─────────────────┐          │
         └─────────►│   Mufy 角色卡    │◄─────────┘
                    │  (最终输出)      │
                    └─────────────────┘
```

### 典型工作流

**流程 A: 一站式角色卡创建（推荐）**
```
1. 用户提供角色需求（名称、背景、风格等）
2. character-card 一次性生成：
   - 8大模块内容
   - 输出设定中的美化HTML模板（内联样式）
   - 小剧场中的CSS美化代码
3. 用户按字段直接复制粘贴到 Mufy
```

**流程 B: 纯内容创建（无美化）**
```
1. character-card 生成角色卡内容（不含美化）
2. 用户复制到 Mufy
```

**流程 C: 单独生成CSS美化**
```
1. style-generator 根据描述生成 CSS 代码
2. 用户将 CSS 粘贴到「小剧场」
```

**流程 D: 高级定制（开发用途）**
```
1. immersive-ui 生成 React/HTML 前端模块
2. 集成到自定义产品中
```

---

## 辅助工具

### tools/generate_avatar.py
使用 Google Nano Banana API 根据角色外貌描述生成头像。

**使用方法**:
```bash
cd tools
pip install -r requirements.txt
export GOOGLE_API_KEY='your-api-key'
python generate_avatar.py
```

---

## 模板文件

### templates/roleplay-system.md
完整的角色扮演创作系统提示词，包含：
- 文学创作标准（Show Don't Tell）
- 用户交互原则
- 输出格式规范
- 女性向创作规范

---

## 演示文件

### demos/immersive-ui-demo.jsx
沉浸式UI模块的 React 演示组件，展示：
- 场景头部模块
- 角色状态模块
- 好感度进度条
- 选项分支
- 三种主题切换（赛博朋克、古风、现代简约）

---

## 使用建议

1. **创建Mufy角色卡**: 直接使用 `character-card` skill（已内置美化）
2. **单独修改CSS样式**: 使用 `style-generator` 生成自定义CSS
3. **开发前端产品**: 使用 `immersive-ui` 生成React/HTML模块
4. **生成角色头像**: 运行 `generate_avatar.py` 脚本

## 主题系统

character-card 支持4种预设主题，可自动匹配或手动指定：

| 主题 | 适用角色 | 配色 |
|------|---------|------|
| 古风水墨 | 古装、仙侠、武侠、宫廷 | 棕褐 + 米黄 + 宣纸白 |
| 赛博朋克 | 科幻、未来、AI、机械 | 霓虹青 + 霓虹紫 + 深空黑 |
| 现代简约 | 都市、职场、校园、日常 | 黑白灰 + 苹果蓝 |
| 暖系可爱 | 治愈、温馨、萌系、恋爱 | 樱花粉 + 奶白 |

### 主题自动匹配规则

根据角色类型关键词自动选择：
- 含「古」「仙」「侠」「三国」→ 古风水墨
- 含「科幻」「未来」「AI」「赛博」→ 赛博朋克
- 含「现代」「都市」「职场」「校园」→ 现代简约
- 含「治愈」「温馨」「可爱」「萌」→ 暖系可爱

## 注意事项

- 所有 Skills 生成的内容需遵守 Mufy 平台合规规则
- CSS 样式仅能粘贴到「小剧场」输入框
- 前端模块需根据实际平台能力调整
