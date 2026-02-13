// 主题类型
export type ThemeType = 'ancient' | 'cyberpunk' | 'modern' | 'cozy' | 'custom';

// 字数范围类型
export interface WordCountRange {
  min: number;
  max: number;
}

// 主题名称映射
export const THEME_NAMES: Record<ThemeType, string> = {
  ancient: '古风水墨',
  cyberpunk: '赛博朋克',
  modern: '现代简约',
  cozy: '暖系可爱',
  custom: 'AI 智能生成'
};

// 自定义模板（用于 AI 生成的风格）
export interface CustomTemplates {
  styleName: string;         // AI 生成的风格名称（如：暗夜玫瑰、冰雪童话）
  styleDescription: string;  // 风格描述
  themeCSS: string;          // 完整的 CSS 样式代码（使用 .scene-card 等类名）
  sceneInfo: string;         // 场景信息 HTML 模板
  mainContent: string;       // 正文内容 HTML 模板
  statusBar: string;         // 角色状态栏 HTML 模板
  sceneCard: string;         // 小剧场场景卡片 HTML 模板
  colorScheme: {             // 配色方案（用于预览和调试）
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
}

// 模块1: 角色信息
export interface CharacterInfo {
  name: string;
  gender: string;
  age: string;
  positioning: string;
  relationshipWithUser: string;
  coreValue: string;
  useCase: string;
  // ===== 新增字段 =====
  height?: string;               // 身高
  weight?: string;               // 体重
  zodiac?: string;               // 星座
  mbti?: string;                 // MBTI
  race?: string;                 // 种族
  occupation?: string;           // 身份/职业
}

// 模块2: 人设
export interface Persona {
  identity: string;
  appearance: string;
  voice: string;
  dressStyle: string;
  foodPreference: string;
  hobbies: string;
  personalities: string;
  emotionToUser: string;
  brief: string;
  backstory: string;
  languageStyle: string;
  languageExamples: {
    daily: string;
    happy: string;
    angry: string;
    flirty: string;
  };
  attitudeToUser: string;
  dialogueRequirements: string;
  boundaries: string;
  // ===== 新增字段 =====
  personalityTags?: string[];    // 性格标签（如["大少爷脾气", "多动症儿童"]）
  lifeStory?: {
    childhood: string;           // 童年
    growth: string;              // 成长
    turning: string;             // 关键转折
  };
  quotes?: string[];             // 个性语录数组
  interview?: string;            // 采访内容
}

// 模块3: 逆境处理
export interface AdversityHandling {
  inappropriateRequest: string;
  insufficientInfo: string;
  emotionalAttack: string;
  beyondCapability: string;
}

// 模块4: 情节设定
export interface PlotSetting {
  worldBackground: string;
  establishedFacts: string;
  unchangeableRules: string;
  currentPhase: string;
}

// 模块5: 输出设定
export interface OutputSetting {
  replyLength: string;              // 保持向后兼容
  replyLengthRange?: WordCountRange; // 新增：结构化的字数范围
  languageStyle: string;
  perspective: string;
  actionFormat: string;
  moduleRules: string;
}

// 模块6: 样例对话
export interface SampleDialogue {
  dialogue1User: string;
  dialogue1Response: string;
  dialogue2User: string;
  dialogue2Response: string;
  styleNotes: string;
}

// 模块7: 小剧场
export interface MiniTheater {
  wordCountRange?: WordCountRange;  // 字数范围设置
  scene1Title: string;
  scene1Dialogue: string;
  scene1Action: string;
  scene2Title: string;
  scene2Dialogue: string;
  scene2Action: string;
  scene3Title: string;
  scene3Dialogue: string;
  scene3Action: string;
}

// 模块8: 开场设计
export interface Opening {
  wordCountRange?: WordCountRange;  // 字数范围设置
  time: string;
  location: string;
  atmosphere: string;
  sceneDescription: string;
  firstDialogue: string;
  attire: string;
  action: string;
  expression: string;
  innerThought: string;
}

// ===== 新增模块 =====

// 模块9: 开场白扩展
export interface OpeningExtension {
  cardSummary: string;           // 角色卡总结语
  relationshipSummary: {
    characterLabel: string;      // 角色标签（如"假装被你催眠的芝麻馅汤圆他"）
    userLabel: string;           // 用户标签（如"被暗恋不自知的你"）
  };
  worldBackgroundDetail?: string; // 世界背景详情（可选，多人卡/架空世界用）
}

// 模块10: 额外主角（用于多人卡）
export interface AdditionalMainCharacter {
  id: string;
  name: string;
  age: string;
  height?: string;
  weight?: string;
  zodiac?: string;
  mbti?: string;
  identity: string;
  race?: string;
  appearance: string;
  personalityTags?: string[];
  personalityAnalysis?: string;
  lifeStory?: {
    childhood: string;
    growth: string;
    turning: string;
  };
  quotes?: string[];
  relationToUser: string;
}

// 模块11: 副角色（精简版）
export interface SupportingCharacter {
  id: string;
  name: string;
  identity: string;              // 身份
  appearance?: string;           // 简要外貌
  quote: string;                 // 个性语
  relationToMain: string;        // 与主角关系标签
}

// 完整角色卡
export interface CharacterCard {
  id: string;
  createdAt: number;
  updatedAt: number;
  theme: ThemeType;
  customTemplates?: CustomTemplates; // AI 生成的自定义模板（仅 theme='custom' 时使用）
  characterInfo: CharacterInfo;
  persona: Persona;
  adversityHandling: AdversityHandling;
  plotSetting: PlotSetting;
  outputSetting: OutputSetting;
  sampleDialogue: SampleDialogue;
  miniTheater: MiniTheater;
  opening: Opening;
  // ===== 新增模块 =====
  openingExtension?: OpeningExtension;
  additionalMainCharacters?: AdditionalMainCharacter[];  // 最多3个
  supportingCharacters?: SupportingCharacter[];          // 数量不限
}

// 模块元信息
export interface ModuleMeta {
  key: string;
  label: string;
  mufyField: string;
  wordCount?: string;
}

export const MODULE_METAS: ModuleMeta[] = [
  { key: 'characterInfo', label: '角色信息', mufyField: '角色简介', wordCount: '100-200字' },
  { key: 'persona', label: '人设', mufyField: '人设', wordCount: '400-600字' },
  { key: 'adversityHandling', label: '逆境处理', mufyField: '逆境处理', wordCount: '150-250字' },
  { key: 'plotSetting', label: '情节设定', mufyField: '情节设定', wordCount: '200-400字' },
  { key: 'outputSetting', label: '输出设定', mufyField: '输出设定' },
  { key: 'sampleDialogue', label: '样例对话', mufyField: '样例对话', wordCount: '300-500字' },
  { key: 'miniTheater', label: '小剧场', mufyField: '小剧场' },
  { key: 'opening', label: '开场设计', mufyField: '开场白', wordCount: '300-500字' },
  // ===== 新增模块 =====
  { key: 'openingExtension', label: '开场白扩展', mufyField: '开场白', wordCount: '50-150字' },
  { key: 'additionalMainCharacters', label: '多主角', mufyField: '主人物简介', wordCount: '每人200-400字' },
  { key: 'supportingCharacters', label: '副角色', mufyField: '副角色', wordCount: '每人50-100字' },
];

// 创建空角色卡
export function createEmptyCard(): CharacterCard {
  return {
    id: `card_${Date.now()}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    theme: 'modern',
    characterInfo: {
      name: '',
      gender: '',
      age: '',
      positioning: '',
      relationshipWithUser: '',
      coreValue: '',
      useCase: '',
      // 新增字段
      height: '',
      weight: '',
      zodiac: '',
      mbti: '',
      race: '',
      occupation: '',
    },
    persona: {
      identity: '',
      appearance: '',
      voice: '',
      dressStyle: '',
      foodPreference: '',
      hobbies: '',
      personalities: '',
      emotionToUser: '',
      brief: '',
      backstory: '',
      languageStyle: '',
      languageExamples: { daily: '', happy: '', angry: '', flirty: '' },
      attitudeToUser: '',
      dialogueRequirements: '',
      boundaries: '',
      // 新增字段
      personalityTags: [],
      lifeStory: { childhood: '', growth: '', turning: '' },
      quotes: [],
      interview: '',
    },
    adversityHandling: {
      inappropriateRequest: '',
      insufficientInfo: '',
      emotionalAttack: '',
      beyondCapability: '',
    },
    plotSetting: {
      worldBackground: '',
      establishedFacts: '',
      unchangeableRules: '',
      currentPhase: '',
    },
    outputSetting: {
      replyLength: '200-400字',
      replyLengthRange: { min: 200, max: 400 },
      languageStyle: '',
      perspective: '第一人称',
      actionFormat: '使用 *动作* 格式',
      moduleRules: '',
    },
    sampleDialogue: {
      dialogue1User: '',
      dialogue1Response: '',
      dialogue2User: '',
      dialogue2Response: '',
      styleNotes: '',
    },
    miniTheater: {
      wordCountRange: { min: 200, max: 400 },
      scene1Title: '',
      scene1Dialogue: '',
      scene1Action: '',
      scene2Title: '',
      scene2Dialogue: '',
      scene2Action: '',
      scene3Title: '',
      scene3Dialogue: '',
      scene3Action: '',
    },
    opening: {
      wordCountRange: { min: 300, max: 500 },
      time: '',
      location: '',
      atmosphere: '',
      sceneDescription: '',
      firstDialogue: '',
      attire: '',
      action: '',
      expression: '',
      innerThought: '',
    },
    // 新增模块
    openingExtension: {
      cardSummary: '',
      relationshipSummary: { characterLabel: '', userLabel: '' },
      worldBackgroundDetail: '',
    },
    additionalMainCharacters: [],
    supportingCharacters: [],
  };
}
