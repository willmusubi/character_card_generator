/**
 * 多人卡架构类型定义
 *
 * 核心概念：
 * - MultiCharacterCard 是顶层容器
 * - 全局数据（世界背景、输出设定、开场等）共享
 * - 每个主角 (MainCharacter) 有独立完整的数据
 * - 次要角色 (SecondaryCharacter) 使用精简数据
 */

// 复用现有类型
import {
  ThemeType,
  CustomTemplates,
  WordCountRange,
  CharacterInfo,
  Persona,
  AdversityHandling,
  PlotSetting,
  OutputSetting,
  SampleDialogue,
  MiniTheater,
  Opening,
  OpeningExtension,
  OutputModules,
  createEmptyOutputModules,
} from './character-card';

// ==================== 关系网类型 ====================

/**
 * 角色间关系
 */
export interface CharacterRelationship {
  characterId1: string;
  characterId2: string;
  labelFrom1To2: string;      // 角色1对角色2的看法（如："暗恋对象"）
  labelFrom2To1: string;      // 角色2对角色1的看法（如："青梅竹马"）
  relationshipType: string;   // 关系类型（如："恋人" | "朋友" | "对手"）
  history?: string;           // 关系历史
  dynamics?: string;          // 当前关系动态
}

/**
 * 与用户的关系
 */
export interface UserRelationship {
  characterId: string;
  labelFromUser: string;      // 用户对角色的看法
  labelToUser: string;        // 角色对用户的看法
  relationshipType: string;   // 关系类型
}

/**
 * 关系网
 */
export interface RelationshipNetwork {
  relationships: CharacterRelationship[];
  userRelationships: UserRelationship[];
}

// ==================== 角色类型 ====================

/**
 * 主角（完整数据）
 * 每个主角独立拥有：角色信息、人设、逆境处理、样例对话、小剧场
 */
export interface MainCharacter {
  id: string;
  createdAt: number;
  updatedAt: number;
  displayOrder: number;       // 显示顺序
  isPrimaryFocus?: boolean;   // 是否为焦点角色（用于开场等）

  // 角色专属模块（完整数据）
  characterInfo: CharacterInfo;
  persona: Persona;
  adversityHandling: AdversityHandling;
  sampleDialogue: SampleDialogue;
  miniTheater: MiniTheater;

  // 角色专属开场（可选，可使用全局开场）
  opening?: Opening;
}

/**
 * 次要角色（精简数据）
 * 用于出场有限的配角
 */
export interface SecondaryCharacter {
  id: string;
  name: string;
  identity: string;           // 身份/职业
  appearance?: string;        // 简要外貌
  personalityTags?: string[]; // 性格标签（2-3个）
  quote: string;              // 个性语/代表台词
  relationToMain: string;     // 与主角的关系标签
}

// ==================== 多人卡类型 ====================

/**
 * 多人卡（顶层容器）
 */
export interface MultiCharacterCard {
  id: string;
  createdAt: number;
  updatedAt: number;

  // 卡片元数据
  cardName: string;                     // 卡片名称（如："蒂法 & 爱丽丝"）
  cardType: 'single' | 'multi';         // 卡片类型

  // 主题设置
  theme: ThemeType;
  customTemplates?: CustomTemplates;

  // ===== 全局共享数据 =====
  plotSetting: PlotSetting;             // 世界背景/情节设定
  outputSetting: OutputSetting;         // 输出设定
  opening: Opening;                     // 全局开场设计
  openingExtension?: OpeningExtension;  // 开场白扩展
  relationshipNetwork: RelationshipNetwork; // 关系网
  outputModules?: OutputModules;        // 输出模块系统（状态栏、记忆、手机等）

  // ===== 角色列表 =====
  mainCharacters: MainCharacter[];      // 主角列表（1-N 个，平级）
  secondaryCharacters: SecondaryCharacter[]; // 次要角色列表

  // ===== 迁移标记 =====
  _legacyMigrated?: boolean;            // 是否从旧数据迁移
}

// ==================== 模块元信息 ====================

/**
 * 角色专属模块
 */
export const CHARACTER_MODULE_KEYS = [
  'characterInfo',
  'persona',
  'adversityHandling',
  'sampleDialogue',
  'miniTheater',
] as const;

export type CharacterModuleKey = typeof CHARACTER_MODULE_KEYS[number];

/**
 * 全局模块
 */
export const GLOBAL_MODULE_KEYS = [
  'plotSetting',
  'outputSetting',
  'outputModules',
  'opening',
  'openingExtension',
  'relationshipNetwork',
  'secondaryCharacters',
] as const;

export type GlobalModuleKey = typeof GLOBAL_MODULE_KEYS[number];

/**
 * 角色模块元信息
 */
export const CHARACTER_MODULE_METAS = [
  { key: 'characterInfo', label: '角色信息', mufyField: '角色简介', wordCount: '100-200字' },
  { key: 'persona', label: '人设', mufyField: '人设', wordCount: '400-600字' },
  { key: 'adversityHandling', label: '逆境处理', mufyField: '逆境处理', wordCount: '150-250字' },
  { key: 'sampleDialogue', label: '样例对话', mufyField: '样例对话', wordCount: '300-500字' },
  { key: 'miniTheater', label: '小剧场', mufyField: '小剧场' },
];

/**
 * 全局模块元信息
 */
export const GLOBAL_MODULE_METAS = [
  { key: 'plotSetting', label: '世界背景', mufyField: '情节设定', wordCount: '200-400字' },
  { key: 'relationshipNetwork', label: '关系网', mufyField: '关系设定' },
  { key: 'outputSetting', label: '输出设定', mufyField: '输出设定' },
  { key: 'outputModules', label: '输出模块', mufyField: '输出设定' },
  { key: 'opening', label: '开场设计', mufyField: '开场白', wordCount: '300-500字' },
  { key: 'openingExtension', label: '开场白扩展', mufyField: '开场白', wordCount: '50-150字' },
  { key: 'secondaryCharacters', label: '次要角色', mufyField: '副角色', wordCount: '每人50-100字' },
];

// ==================== 工厂函数 ====================

/**
 * 创建空的主角
 */
export function createEmptyMainCharacter(): MainCharacter {
  return {
    id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    displayOrder: 0,
    isPrimaryFocus: false,
    characterInfo: {
      name: '',
      gender: '',
      age: '',
      positioning: '',
      relationshipWithUser: '',
      coreValue: '',
      useCase: '',
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
  };
}

/**
 * 创建空的次要角色
 */
export function createEmptySecondaryCharacter(): SecondaryCharacter {
  return {
    id: `secondary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: '',
    identity: '',
    appearance: '',
    personalityTags: [],
    quote: '',
    relationToMain: '',
  };
}

/**
 * 创建空的关系网
 */
export function createEmptyRelationshipNetwork(): RelationshipNetwork {
  return {
    relationships: [],
    userRelationships: [],
  };
}

/**
 * 创建空的多人卡
 */
export function createEmptyMultiCharacterCard(): MultiCharacterCard {
  const firstCharacter = createEmptyMainCharacter();
  firstCharacter.isPrimaryFocus = true;
  firstCharacter.displayOrder = 0;

  return {
    id: `multicard_${Date.now()}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    cardName: '',
    cardType: 'single',
    theme: 'modern',
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
    openingExtension: {
      cardSummary: '',
      relationshipSummary: { characterLabel: '', userLabel: '' },
      worldBackgroundDetail: '',
    },
    relationshipNetwork: createEmptyRelationshipNetwork(),
    outputModules: createEmptyOutputModules(),
    mainCharacters: [firstCharacter],
    secondaryCharacters: [],
  };
}

// ==================== 类型守卫 ====================

/**
 * 判断是否为多人卡
 */
export function isMultiCharacterCard(card: MultiCharacterCard): boolean {
  return card.cardType === 'multi' || card.mainCharacters.length > 1;
}

/**
 * 获取焦点角色
 */
export function getPrimaryCharacter(card: MultiCharacterCard): MainCharacter | undefined {
  return card.mainCharacters.find(c => c.isPrimaryFocus) || card.mainCharacters[0];
}

// 重新导出常用类型
export type {
  ThemeType,
  CustomTemplates,
  WordCountRange,
  CharacterInfo,
  Persona,
  AdversityHandling,
  PlotSetting,
  OutputSetting,
  SampleDialogue,
  MiniTheater,
  Opening,
  OpeningExtension,
  OutputModules,
};

export { createEmptyOutputModules };
