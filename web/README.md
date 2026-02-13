# Mufy 角色卡生成器 - Web 应用

基于 React + TypeScript 的 Mufy 角色卡可视化编辑器，支持多角色、AI 生成、实时预览。

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（前端 + API 代理）
npm run start

# 或分别启动
npm run dev      # 前端 http://localhost:5173
npm run server   # API 代理 http://localhost:3001
```

## 功能特性

### 多人卡架构

支持创建包含多个平级主角的角色卡：

- **单人卡**：1 个主角，传统模式
- **多人卡**：2+ 个主角，每人独立完整数据
- **次要角色**：配角使用精简数据

```
输入「最终幻想的蒂法和爱丽丝」
    ↓
生成多人卡
├── 蒂法（完整数据：角色信息、人设、逆境处理、样例对话、小剧场）
├── 爱丽丝（完整数据：同上）
└── 全局数据（世界背景、输出设定、开场、关系网）
```

### AI 一键生成

1. 点击「AI 生成」按钮
2. 输入角色描述（支持多角色）
3. 选择主题风格（或自动匹配）
4. 可选：启用搜索增强（推荐用于已知 IP 角色）
5. 等待生成完成

### 支持的 AI 提供商

| 提供商 | 搜索增强 | 推荐模型 |
|-------|---------|---------|
| OpenAI | Tool Calling | gpt-4.1, gpt-4o |
| Claude | Tool Calling | claude-sonnet-4-5 |
| Gemini | Google Search | gemini-2.5-pro |
| Deepseek | Tool Calling | deepseek-chat |
| Qwen | Tool Calling | qwen-max |

### 主题系统

| 主题 | 适用场景 |
|------|---------|
| 古风水墨 | 古装、仙侠、武侠 |
| 赛博朋克 | 科幻、未来、AI |
| 现代简约 | 都市、职场、校园 |
| 暖系可爱 | 治愈、温馨、恋爱 |
| 自定义 | AI 根据角色生成独特风格 |

## 项目结构

```
src/
├── components/
│   ├── editor/                    # 编辑器核心
│   │   ├── MultiCharacterEditor.tsx  # 主编辑器
│   │   ├── CharacterTabs.tsx         # 角色标签切换
│   │   ├── ModuleTabs.tsx            # 模块标签
│   │   ├── OutputPreview.tsx         # 输出预览
│   │   └── forms/                    # 各模块表单
│   │       ├── CharacterInfoForm.tsx
│   │       ├── PersonaForm.tsx
│   │       ├── AdversityHandlingForm.tsx
│   │       ├── PlotSettingForm.tsx
│   │       ├── OutputSettingForm.tsx
│   │       ├── SampleDialogueForm.tsx
│   │       ├── MiniTheaterForm.tsx
│   │       ├── OpeningForm.tsx
│   │       ├── OpeningExtensionForm.tsx
│   │       ├── SecondaryCharactersForm.tsx
│   │       └── RelationshipNetworkForm.tsx
│   ├── ai-generate/
│   │   └── AIGenerateModal.tsx       # AI 生成弹窗
│   ├── settings/
│   │   └── SettingsModal.tsx         # 设置弹窗
│   ├── sidebar/
│   │   └── Sidebar.tsx               # 侧边栏（卡片列表）
│   └── ui/                           # 通用 UI 组件
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Textarea.tsx
│       ├── Select.tsx
│       └── RangeSlider.tsx
├── store/
│   ├── useMultiCharacterStore.ts     # 多人卡状态
│   └── useSettingsStore.ts           # 设置状态
├── types/
│   ├── multi-character-card.ts       # 多人卡类型
│   ├── character-card.ts             # 单人卡类型
│   └── settings.ts                   # 设置类型
├── utils/
│   ├── ai-generator.ts               # AI 生成核心逻辑
│   ├── template-generator.ts         # 模板输出生成
│   ├── card-migration.ts             # 旧数据迁移
│   └── export-single-card.ts         # 单人卡导出
└── data/
    └── ai-prompts.ts                 # AI 提示词
```

## 数据类型

### MultiCharacterCard（多人卡）

```typescript
interface MultiCharacterCard {
  id: string;
  cardName: string;              // 如 "蒂法 & 爱丽丝"
  cardType: 'single' | 'multi';
  theme: ThemeType;

  // 全局数据
  plotSetting: PlotSetting;
  outputSetting: OutputSetting;
  opening: Opening;
  openingExtension?: OpeningExtension;
  relationshipNetwork: RelationshipNetwork;

  // 角色
  mainCharacters: MainCharacter[];
  secondaryCharacters: SecondaryCharacter[];
}
```

### MainCharacter（主角）

```typescript
interface MainCharacter {
  id: string;
  displayOrder: number;
  isPrimaryFocus?: boolean;

  characterInfo: CharacterInfo;   // 基本信息
  persona: Persona;               // 人设
  adversityHandling: AdversityHandling;
  sampleDialogue: SampleDialogue;
  miniTheater: MiniTheater;
  opening?: Opening;              // 可选角色专属开场
}
```

### SecondaryCharacter（次要角色）

```typescript
interface SecondaryCharacter {
  id: string;
  name: string;
  identity: string;
  appearance?: string;
  personalityTags?: string[];
  quote: string;
  relationToMain: string;
}
```

## 状态管理

使用 Zustand 进行状态管理，数据自动持久化到 localStorage。

```typescript
const store = useMultiCharacterStore();

// 卡片操作
store.createCard();
store.deleteCard(cardId);
store.setActiveCard(cardId);

// 角色操作
store.addMainCharacter(cardId);
store.updateMainCharacter(cardId, characterId, updates);
store.setActiveCharacter(characterId);

// 获取当前数据
const card = store.getActiveCard();
const character = store.getActiveCharacter();
```

## API 代理

`server.js` 提供 API 代理功能，解决浏览器 CORS 限制：

```javascript
// 代理路由
/api/openai/*   → https://api.openai.com/v1/*
/api/anthropic/* → https://api.anthropic.com/*
/api/gemini/*   → https://generativelanguage.googleapis.com/*
/api/deepseek/* → https://api.deepseek.com/*
/api/qwen/*     → https://dashscope.aliyuncs.com/*
```

### 代理配置

支持通过环境变量配置 HTTP 代理：

```bash
export HTTP_PROXY=http://127.0.0.1:7890
npm run server
```

## 数据迁移

从旧版单人卡自动迁移到新版多人卡格式：

```typescript
import { migrateToMultiCharacterCard } from './utils/card-migration';

// 自动检测并迁移
if (isLegacyCard(data)) {
  const newCard = migrateToMultiCharacterCard(data);
}
```

## 导出功能

从多人卡导出单人卡（其他主角降级为次要角色）：

```typescript
import { exportSingleCard } from './utils/export-single-card';

const singleCard = exportSingleCard(multiCard, targetCharacterId, {
  includeOtherMainsAsSecondary: true,
  preserveRelationships: true,
});
```

## 构建

```bash
npm run build    # 构建生产版本
npm run preview  # 预览生产版本
```

## 技术栈

- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **TailwindCSS** - 样式
- **Zustand** - 状态管理
- **Lucide React** - 图标
- **Express** - API 代理服务器
