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

// ==================== 输出模块系统 ====================

/**
 * 角色状态栏（必选模块）
 * 每次对话回复时显示的角色状态信息
 */
export interface CharacterStatus {
  attire: string;                // 当前穿搭描述
  action: string;                // 当前动作
  expression: string;            // 神态表情
  affection: string;             // 好感度（如 "10/100"）
  innerOS: string;               // 内心独白/OS
  relationship: string;          // 与用户的关系状态
  todoList: string[];            // 待办事项（3项）
  randomContent: string;         // 随机内容（梦境/回忆/备忘录，>100字）
}

/**
 * 记忆区（必选模块）
 * 角色的记忆系统
 */
export interface MemoryArea {
  hotSearch: string[];           // 微博热搜（3条相关热搜）
  shortTermMemory: string;       // 短期记忆（最近发生的事）
  longTermMemory: string;        // 长期记忆说明
  danmaku: string[];             // 三次元弹幕/粉丝评论（4条）
}

/**
 * 聊天记录（可选模块 - 手机界面的一部分）
 */
export interface ChatRecord {
  id: string;
  contactName: string;           // 联系人名称
  contactAvatar?: string;        // 联系人头像（可选）
  messages: {
    sender: 'self' | 'other';    // 发送者
    content: string;             // 消息内容
    time?: string;               // 时间
  }[];
}

/**
 * 群聊记录
 */
export interface GroupChat {
  id: string;
  groupName: string;             // 群名
  members: string[];             // 群成员名称列表
  messages: {
    sender: string;              // 发送者名称
    content: string;             // 消息内容
    time?: string;               // 时间
  }[];
}

/**
 * 朋友圈/动态
 */
export interface MomentsPost {
  id: string;
  author: string;                // 发布者
  content: string;               // 内容
  images?: string[];             // 图片描述（可选）
  time: string;                  // 发布时间
  likes: string[];               // 点赞的人
  comments: {
    author: string;
    content: string;
    replyTo?: string;            // 回复某人
  }[];
}

/**
 * 社交媒体内容（可选模块 - 手机界面的一部分）
 */
export interface SocialMedia {
  chatRecords: ChatRecord[];     // 私聊记录（3组）
  groupChats: GroupChat[];       // 群聊（1-2个）
  moments: MomentsPost[];        // 朋友圈动态（3条）
  forumPosts?: {                 // 论坛/校友圈帖子
    title: string;
    content: string;
    comments: string[];
  }[];
  weibo?: {                      // 微博内容
    title: string;
    content: string;
    comments: string[];
  }[];
}

/**
 * 手机浏览记录（可选模块 - 手机界面的一部分）
 */
export interface PhoneBrowsing {
  browsingHistory: {             // 浏览足迹
    platform: string;            // 微博/微信/豆瓣等
    content: string;             // 浏览内容描述
  }[];
  recentlyListening: {           // 最近在听
    songName: string;
    artist: string;
  }[];
  notes: string;                 // 备忘录/记事本内容
  shoppingCart?: string[];       // 购物车内容
}

/**
 * 音乐播放器（可选模块）
 */
export interface MusicPlayer {
  enabled: boolean;              // 是否启用
  currentSong?: {
    name: string;
    artist: string;
    album?: string;
    cover?: string;              // 封面图片URL/描述
  };
  playlist: {
    name: string;
    artist: string;
  }[];
  playlistName: string;          // 播放列表名称（如 "深夜治愈系"）
}

/**
 * 输出模块配置
 * 定义哪些模块显示，以及它们的内容
 */
export interface OutputModules {
  // ===== 必选模块（每次显示）=====
  characterStatus: CharacterStatus;
  memoryArea: MemoryArea;

  // ===== 可选模块（增加游戏性）=====
  enablePhoneInterface: boolean;     // 是否启用手机界面
  enableMusicPlayer: boolean;        // 是否启用音乐播放器

  socialMedia?: SocialMedia;         // 社交媒体内容
  phoneBrowsing?: PhoneBrowsing;     // 手机浏览记录
  musicPlayer?: MusicPlayer;         // 音乐播放器
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
  outputModules?: OutputModules;                          // 输出模块系统
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
  // ===== 输出模块 =====
  { key: 'outputModules', label: '输出模块', mufyField: '输出设定' },
];

/**
 * 创建空的输出模块配置
 */
export function createEmptyOutputModules(): OutputModules {
  return {
    // 必选模块
    characterStatus: {
      attire: '',
      action: '',
      expression: '',
      affection: '50/100',
      innerOS: '',
      relationship: '',
      todoList: [],
      randomContent: '',
    },
    memoryArea: {
      hotSearch: [],
      shortTermMemory: '',
      longTermMemory: '',
      danmaku: [],
    },
    // 可选模块开关
    enablePhoneInterface: false,
    enableMusicPlayer: false,
  };
}

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
    // 输出模块
    outputModules: createEmptyOutputModules(),
  };
}
