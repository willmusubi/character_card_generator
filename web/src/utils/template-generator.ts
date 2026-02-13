import { CharacterCard } from '../types/character-card';
import { SCENE_INFO_TEMPLATES, MAIN_CONTENT_TEMPLATES, STATUS_BAR_TEMPLATES, SCENE_CARD_TEMPLATES } from '../data/html-templates';
import { THEME_CSS } from '../data/theme-css';

// 获取模板（支持自定义主题）
function getSceneInfoTemplate(card: CharacterCard): string {
  if (card.theme === 'custom' && card.customTemplates?.sceneInfo) {
    return card.customTemplates.sceneInfo;
  }
  return SCENE_INFO_TEMPLATES[card.theme] || SCENE_INFO_TEMPLATES.modern;
}

function getMainContentTemplate(card: CharacterCard): string {
  if (card.theme === 'custom' && card.customTemplates?.mainContent) {
    return card.customTemplates.mainContent;
  }
  return MAIN_CONTENT_TEMPLATES[card.theme] || MAIN_CONTENT_TEMPLATES.modern;
}

function getStatusBarTemplate(card: CharacterCard): string {
  if (card.theme === 'custom' && card.customTemplates?.statusBar) {
    return card.customTemplates.statusBar;
  }
  return STATUS_BAR_TEMPLATES[card.theme] || STATUS_BAR_TEMPLATES.modern;
}

function getSceneCardTemplate(card: CharacterCard): string {
  if (card.theme === 'custom' && card.customTemplates?.sceneCard) {
    return card.customTemplates.sceneCard;
  }
  return SCENE_CARD_TEMPLATES[card.theme] || SCENE_CARD_TEMPLATES.modern;
}

function getThemeCSS(card: CharacterCard): string {
  if (card.theme === 'custom' && card.customTemplates?.themeCSS) {
    return card.customTemplates.themeCSS;
  }
  return THEME_CSS[card.theme] || THEME_CSS.modern;
}

// 生成角色信息模块输出
export function generateCharacterInfoOutput(card: CharacterCard): string {
  const { characterInfo } = card;

  // 基础信息
  let output = `角色名称：${characterInfo.name || '[名字]'}
角色性别：${characterInfo.gender || '[男/女/其他]'}
角色年龄：${characterInfo.age || '[年龄或年龄段]'}`;

  // 新增的详细档案字段
  if (characterInfo.height || characterInfo.weight || characterInfo.zodiac || characterInfo.mbti) {
    output += `\n\n### 详细档案`;
    if (characterInfo.height) output += `\n身高：${characterInfo.height}`;
    if (characterInfo.weight) output += `\n体重：${characterInfo.weight}`;
    if (characterInfo.zodiac) output += `\n星座：${characterInfo.zodiac}`;
    if (characterInfo.mbti) output += `\nMBTI：${characterInfo.mbti}`;
    if (characterInfo.race) output += `\n种族：${characterInfo.race}`;
    if (characterInfo.occupation) output += `\n身份/职业：${characterInfo.occupation}`;
  }

  output += `\n\n角色定位：${characterInfo.positioning || '[一句话定位]'}

与用户的关系：${characterInfo.relationshipWithUser || '[恋人/朋友/同事/陌生人等]'}
核心价值：${characterInfo.coreValue || '[这个角色能给用户带来什么]'}
使用场景：${characterInfo.useCase || '[日常聊天/深夜陪伴/学习辅导等]'}`;

  return output;
}

// 生成人设模块输出
export function generatePersonaOutput(card: CharacterCard): string {
  const { persona, characterInfo } = card;
  const name = characterInfo.name || '{{char}}';

  let output = `### ${name}设定

**身份**：${persona.identity || '[完整身份背景]'}

**外貌**：${persona.appearance || '[详细外貌描述]'}

**音色**：${persona.voice || '[声音特点描述]'}

**穿衣习惯**：${persona.dressStyle || '[日常穿着风格]'}

**饮食偏好**：${persona.foodPreference || '[喜欢/讨厌的食物]'}

**兴趣爱好**：${persona.hobbies || '[3-5个具体爱好]'}

**性格**：
${persona.personalities || '- [性格1]：[说明]\n- [性格2]：[说明]\n- [性格3]：[说明]'}`;

  // 新增：性格标签
  if (persona.personalityTags && persona.personalityTags.length > 0) {
    output += `\n\n**性格标签**：${persona.personalityTags.join('、')}`;
  }

  output += `

**对{{user}}的情感**：${persona.emotionToUser || '[感情定位和态度]'}

**简介**：${persona.brief || '[2-3句话的角色简介]'}

**角色经历**：${persona.backstory || '[重要背景故事]'}`;

  // 新增：人生经历
  if (persona.lifeStory && (persona.lifeStory.childhood || persona.lifeStory.growth || persona.lifeStory.turning)) {
    output += `\n\n### 人生经历`;
    if (persona.lifeStory.childhood) output += `\n**童年**：${persona.lifeStory.childhood}`;
    if (persona.lifeStory.growth) output += `\n**成长**：${persona.lifeStory.growth}`;
    if (persona.lifeStory.turning) output += `\n**关键转折**：${persona.lifeStory.turning}`;
  }

  // 新增：个性语录
  if (persona.quotes && persona.quotes.length > 0) {
    output += `\n\n### 个性语录`;
    persona.quotes.forEach((quote, i) => {
      output += `\n${i + 1}. 「${quote}」`;
    });
  }

  // 新增：采访内容
  if (persona.interview) {
    output += `\n\n### 采访内容\n${persona.interview}`;
  }

  output += `

### 扮演风格

**语言风格**：${persona.languageStyle || '[具体描述]'}
- 日常：「${persona.languageExamples.daily || '示例台词'}」
- 开心时：「${persona.languageExamples.happy || '示例台词'}」
- 生气时：「${persona.languageExamples.angry || '示例台词'}」
- 撒娇时：「${persona.languageExamples.flirty || '示例台词'}」

**对{{user}}的态度**：${persona.attitudeToUser || '[具体描述]'}

**台词要求**：${persona.dialogueRequirements || '[风格要求]'}

### 行为边界

**永远不会做的事**：
${persona.boundaries || '- [边界1]\n- [边界2]\n- [边界3]'}`;

  return output;
}

// 生成逆境处理模块输出
export function generateAdversityOutput(card: CharacterCard): string {
  const { adversityHandling } = card;

  return `**[违规内容请求]**
当{{user}}请求不适当内容时：
${adversityHandling.inappropriateRequest || '「[角色风格的婉拒台词]」\n→ [处理方式]'}

**[信息不足]**
当信息不够做出回应时：
${adversityHandling.insufficientInfo || '「[角色风格的追问台词]」\n→ [处理方式]'}

**[情绪激动/攻击性]**
当{{user}}情绪激动或言语攻击时：
${adversityHandling.emotionalAttack || '「[角色风格的安抚台词]」\n→ [处理方式]'}

**[超出能力范围]**
当被问及无法回答的问题时：
${adversityHandling.beyondCapability || '「[角色风格的坦诚台词]」\n→ [处理方式]'}`;
}

// 生成情节设定模块输出
export function generatePlotSettingOutput(card: CharacterCard): string {
  const { plotSetting } = card;

  return `**[世界背景]**
${plotSetting.worldBackground || '[描述时代、地点、社会结构等]'}

**[已发生的事实]**（不可推翻）
${plotSetting.establishedFacts || '- [事实1]\n- [事实2]\n- [事实3]'}

**[永远不变的规则]**
${plotSetting.unchangeableRules || '- [规则1]\n- [规则2]\n- [规则3]'}

**[当前阶段]**
${plotSetting.currentPhase || '[描述角色目前所处的关系/剧情阶段]'}`;
}

// 生成输出设定模块输出
export function generateOutputSettingOutput(card: CharacterCard): string {
  const { outputSetting } = card;

  // 获取自定义风格信息（如果有）
  const styleInfo = card.theme === 'custom' && card.customTemplates
    ? `\n\n> 本角色使用 AI 智能生成的「${card.customTemplates.styleName}」风格\n> ${card.customTemplates.styleDescription}`
    : '';

  // 获取回复长度（优先使用结构化的范围值）
  const replyLength = outputSetting.replyLengthRange
    ? `${outputSetting.replyLengthRange.min}-${outputSetting.replyLengthRange.max}字`
    : outputSetting.replyLength || '200-400字';

  return `### 回复结构

每次回复按以下顺序输出：
1. 场景信息（仅场景变化时显示）
2. 正文内容（对话与叙述）
3. 角色状态栏（每次必须，放在最后）

### 格式规范

- 回复长度：${replyLength}
- 语言风格：${outputSetting.languageStyle || '[风格描述]'}
- 人称视角：${outputSetting.perspective || '第一人称'}
- 动作描写：${outputSetting.actionFormat || '使用 *动作* 格式'}${styleInfo}

### 输出模块模板

**场景信息**（场景变化时显示）：
${getSceneInfoTemplate(card)}

**正文内容**：
${getMainContentTemplate(card)}

**角色状态栏**（每次回复最后必须输出）：
${getStatusBarTemplate(card)}

### 模块填写规则

${outputSetting.moduleRules || `| 字段 | 说明 | 示例 |
|------|------|------|
| 时辰/时间 | 当前时间 | 戌时 / 深夜23:00 |
| 地点 | 具体场景 | 王允府·后花园 |
| 氛围 | 环境描述 | 月朗星稀 |
| 衣着 | 当前穿着 | 月白广袖长裙 |
| 动作 | 当前动作 | 倚窗望月 |
| 神态 | 表情状态 | 若有所思 |
| 内心 | 内心独白 | 他为何会在此... |`}`;
}

// 生成样例对话模块输出
export function generateSampleDialogueOutput(card: CharacterCard): string {
  const { sampleDialogue } = card;

  return `**[对话1：日常互动]**
用户：${sampleDialogue.dialogue1User || '[用户消息示例]'}
角色：
${sampleDialogue.dialogue1Response || '[使用完整输出模块格式的回复]'}

**[对话2：情感场景]**
用户：${sampleDialogue.dialogue2User || '[用户消息示例]'}
角色：
${sampleDialogue.dialogue2Response || '[使用完整输出模块格式的回复]'}

---
**文风说明**：
${sampleDialogue.styleNotes || '- 句式特点：[描述]\n- 口癖/特色用语：[如有]\n- 情感表达方式：[描述]'}`;
}

// 生成小剧场模块输出
export function generateMiniTheaterOutput(card: CharacterCard): string {
  const { miniTheater } = card;

  const sceneTemplate = getSceneCardTemplate(card);

  const scenes = [
    { title: miniTheater.scene1Title, dialogue: miniTheater.scene1Dialogue, action: miniTheater.scene1Action },
    { title: miniTheater.scene2Title, dialogue: miniTheater.scene2Dialogue, action: miniTheater.scene2Action },
    { title: miniTheater.scene3Title, dialogue: miniTheater.scene3Dialogue, action: miniTheater.scene3Action },
  ].filter(s => s.title || s.dialogue);

  const sceneCards = scenes.map(scene => {
    return sceneTemplate
      .replace('[场景图标]', '◆')
      .replace('[场景标题]', scene.title || '[场景标题]')
      .replace('[对话内容]', scene.dialogue || '[对话内容]')
      .replace('[动作描写]', scene.action || '[动作描写]');
  }).join('\n\n');

  return `<style>
${getThemeCSS(card)}
</style>

<!-- 小剧场场景 -->
${sceneCards || getSceneCardTemplate(card)}`;
}

// 生成开场设计模块输出
export function generateOpeningOutput(card: CharacterCard): string {
  const { opening, characterInfo } = card;
  const name = characterInfo.name || '[角色名]';

  const sceneInfo = getSceneInfoTemplate(card)
    .replace('[时辰]', opening.time || '[时辰]')
    .replace('[时间]', opening.time || '[时间]')
    .replace('[地点]', opening.location || '[地点]')
    .replace('[氛围]', opening.atmosphere || '[氛围]');

  const mainContent = getMainContentTemplate(card)
    .replace('[正文内容，包含对话与 *动作描写*]',
      `${opening.sceneDescription || '[场景描述]'}\n\n${opening.firstDialogue || '「[第一句对话]」'}`)
    .replace('[正文内容]',
      `${opening.sceneDescription || '[场景描述]'}\n\n${opening.firstDialogue || '"[第一句对话]"'}`);

  const statusBar = getStatusBarTemplate(card)
    .replace(/\[角色名\]/g, name)
    .replace('[衣着描述]', opening.attire || '[衣着描述]')
    .replace('[动作描述]', opening.action || '[动作描述]')
    .replace('[神态描述]', opening.expression || '[神态描述]')
    .replace('[内心独白]', opening.innerThought || '[内心独白]');

  return `${sceneInfo}

${mainContent}

${statusBar}`;
}

// 生成开场白扩展模块输出
export function generateOpeningExtensionOutput(card: CharacterCard): string {
  const { openingExtension, characterInfo } = card;
  if (!openingExtension) return '';

  const name = characterInfo.name || '{{char}}';
  let output = `### ${name}开场白扩展`;

  // 角色卡总结语
  if (openingExtension.cardSummary) {
    output += `\n\n**角色卡总结语**：\n「${openingExtension.cardSummary}」`;
  }

  // 关系总结
  if (openingExtension.relationshipSummary.characterLabel || openingExtension.relationshipSummary.userLabel) {
    output += `\n\n**角色与用户的关系**：`;
    if (openingExtension.relationshipSummary.characterLabel) {
      output += `\n${name}：${openingExtension.relationshipSummary.characterLabel}`;
    }
    if (openingExtension.relationshipSummary.userLabel) {
      output += `\n{{user}}：${openingExtension.relationshipSummary.userLabel}`;
    }
  }

  // 世界背景详情
  if (openingExtension.worldBackgroundDetail) {
    output += `\n\n**世界背景详情**：\n${openingExtension.worldBackgroundDetail}`;
  }

  return output || '暂无开场白扩展内容';
}

// 生成多主角模块输出
export function generateAdditionalMainCharactersOutput(card: CharacterCard): string {
  const { additionalMainCharacters } = card;
  if (!additionalMainCharacters || additionalMainCharacters.length === 0) {
    return '暂无额外主角设定';
  }

  let output = `### 多主角设定\n\n共 ${additionalMainCharacters.length} 位主角`;

  additionalMainCharacters.forEach((char, index) => {
    output += `\n\n---\n\n#### 主角 ${index + 1}：${char.name || '[未命名]'}`;

    // 基础信息
    output += `\n\n**基础信息**`;
    if (char.age) output += `\n- 年龄：${char.age}`;
    if (char.identity) output += `\n- 身份/职业：${char.identity}`;
    if (char.race) output += `\n- 种族：${char.race}`;
    if (char.height) output += `\n- 身高：${char.height}`;
    if (char.weight) output += `\n- 体重：${char.weight}`;
    if (char.zodiac) output += `\n- 星座：${char.zodiac}`;
    if (char.mbti) output += `\n- MBTI：${char.mbti}`;

    // 外貌
    if (char.appearance) {
      output += `\n\n**外貌**：${char.appearance}`;
    }

    // 性格
    if (char.personalityTags && char.personalityTags.length > 0) {
      output += `\n\n**性格标签**：${char.personalityTags.join('、')}`;
    }
    if (char.personalityAnalysis) {
      output += `\n\n**性格分析**：${char.personalityAnalysis}`;
    }

    // 人生经历
    if (char.lifeStory && (char.lifeStory.childhood || char.lifeStory.growth || char.lifeStory.turning)) {
      output += `\n\n**人生经历**`;
      if (char.lifeStory.childhood) output += `\n- 童年：${char.lifeStory.childhood}`;
      if (char.lifeStory.growth) output += `\n- 成长：${char.lifeStory.growth}`;
      if (char.lifeStory.turning) output += `\n- 关键转折：${char.lifeStory.turning}`;
    }

    // 个性语录
    if (char.quotes && char.quotes.length > 0) {
      output += `\n\n**个性语录**`;
      char.quotes.forEach((quote, i) => {
        output += `\n${i + 1}. 「${quote}」`;
      });
    }

    // 与用户关系
    if (char.relationToUser) {
      output += `\n\n**与{{user}}的关系**：${char.relationToUser}`;
    }
  });

  return output;
}

// 生成副角色模块输出
export function generateSupportingCharactersOutput(card: CharacterCard): string {
  const { supportingCharacters } = card;
  if (!supportingCharacters || supportingCharacters.length === 0) {
    return '暂无副角色设定';
  }

  let output = `### 副角色设定\n\n共 ${supportingCharacters.length} 位副角色`;

  supportingCharacters.forEach((char, index) => {
    output += `\n\n**${index + 1}. ${char.name || '[未命名]'}**`;
    if (char.identity) output += ` - ${char.identity}`;
    if (char.relationToMain) output += `\n关系标签：${char.relationToMain}`;
    if (char.appearance) output += `\n外貌：${char.appearance}`;
    if (char.quote) output += `\n个性语：「${char.quote}」`;
  });

  return output;
}

// 获取模块输出
export function getModuleOutput(card: CharacterCard, moduleKey: string): string {
  switch (moduleKey) {
    case 'characterInfo':
      return generateCharacterInfoOutput(card);
    case 'persona':
      return generatePersonaOutput(card);
    case 'adversityHandling':
      return generateAdversityOutput(card);
    case 'plotSetting':
      return generatePlotSettingOutput(card);
    case 'outputSetting':
      return generateOutputSettingOutput(card);
    case 'sampleDialogue':
      return generateSampleDialogueOutput(card);
    case 'miniTheater':
      return generateMiniTheaterOutput(card);
    case 'opening':
      return generateOpeningOutput(card);
    case 'openingExtension':
      return generateOpeningExtensionOutput(card);
    case 'additionalMainCharacters':
      return generateAdditionalMainCharactersOutput(card);
    case 'supportingCharacters':
      return generateSupportingCharactersOutput(card);
    default:
      return '';
  }
}

// 获取所有模块输出（用于批量复制）
export function getAllModulesOutput(card: CharacterCard): Record<string, string> {
  return {
    characterInfo: generateCharacterInfoOutput(card),
    persona: generatePersonaOutput(card),
    adversityHandling: generateAdversityOutput(card),
    plotSetting: generatePlotSettingOutput(card),
    outputSetting: generateOutputSettingOutput(card),
    sampleDialogue: generateSampleDialogueOutput(card),
    miniTheater: generateMiniTheaterOutput(card),
    opening: generateOpeningOutput(card),
    openingExtension: generateOpeningExtensionOutput(card),
    additionalMainCharacters: generateAdditionalMainCharactersOutput(card),
    supportingCharacters: generateSupportingCharactersOutput(card),
  };
}
