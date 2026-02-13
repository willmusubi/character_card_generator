/**
 * 单人卡导出工具
 *
 * 从多人卡中导出单个角色的完整数据
 * - 选中的角色作为主角
 * - 其他主角降级为次要角色
 * - 保留全局数据
 */

import {
  MultiCharacterCard,
  MainCharacter,
  SecondaryCharacter,
} from '../types/multi-character-card';
import {
  CharacterCard,
  SupportingCharacter,
  AdditionalMainCharacter,
} from '../types/character-card';

/**
 * 将主角降级为次要角色（精简数据）
 */
export function demoteToSecondary(mainChar: MainCharacter): SecondaryCharacter {
  return {
    id: mainChar.id,
    name: mainChar.characterInfo.name || '',
    identity: mainChar.characterInfo.occupation || mainChar.characterInfo.positioning || '',
    appearance: mainChar.persona.appearance?.substring(0, 100) || '',
    personalityTags: mainChar.persona.personalityTags?.slice(0, 3) || [],
    quote: mainChar.persona.quotes?.[0] || '',
    relationToMain: mainChar.characterInfo.relationshipWithUser || '',
  };
}

/**
 * 将主角转换为旧版 AdditionalMainCharacter 格式
 * 用于保持向后兼容
 */
export function mainCharToAdditional(mainChar: MainCharacter): AdditionalMainCharacter {
  return {
    id: mainChar.id,
    name: mainChar.characterInfo.name || '',
    age: mainChar.characterInfo.age || '',
    height: mainChar.characterInfo.height,
    weight: mainChar.characterInfo.weight,
    zodiac: mainChar.characterInfo.zodiac,
    mbti: mainChar.characterInfo.mbti,
    identity: mainChar.characterInfo.occupation || '',
    race: mainChar.characterInfo.race,
    appearance: mainChar.persona.appearance || '',
    personalityTags: mainChar.persona.personalityTags,
    personalityAnalysis: '',
    lifeStory: mainChar.persona.lifeStory,
    quotes: mainChar.persona.quotes,
    relationToUser: mainChar.characterInfo.relationshipWithUser || '',
  };
}

/**
 * 将 SecondaryCharacter 转换为旧版 SupportingCharacter 格式
 */
export function secondaryToSupporting(secondary: SecondaryCharacter): SupportingCharacter {
  return {
    id: secondary.id,
    name: secondary.name,
    identity: secondary.identity,
    appearance: secondary.appearance,
    quote: secondary.quote,
    relationToMain: secondary.relationToMain,
  };
}

/**
 * 从多人卡导出单人卡
 *
 * @param multiCard 多人卡数据
 * @param targetCharacterId 要导出的角色 ID
 * @param options 导出选项
 * @returns 单人卡数据（旧版 CharacterCard 格式）
 */
export function exportSingleCard(
  multiCard: MultiCharacterCard,
  targetCharacterId: string,
  options: {
    includeOtherMainsAsSecondary?: boolean; // 是否将其他主角作为次要角色包含
    includeOtherMainsAsFull?: boolean; // 是否将其他主角作为完整 additionalMainCharacters
    preserveRelationships?: boolean; // 是否保留关系数据
  } = {}
): CharacterCard {
  const {
    includeOtherMainsAsSecondary = true,
    includeOtherMainsAsFull = false,
    preserveRelationships = true,
  } = options;

  // 查找目标角色
  const targetChar = multiCard.mainCharacters.find((c) => c.id === targetCharacterId);
  if (!targetChar) {
    throw new Error(`Character not found: ${targetCharacterId}`);
  }

  // 其他主角
  const otherMains = multiCard.mainCharacters.filter((c) => c.id !== targetCharacterId);

  // 构建次要角色列表
  let supportingCharacters: SupportingCharacter[] = [
    ...multiCard.secondaryCharacters.map(secondaryToSupporting),
  ];

  // 如果选择将其他主角降级为次要角色
  if (includeOtherMainsAsSecondary && !includeOtherMainsAsFull) {
    const demotedChars = otherMains.map(demoteToSecondary).map(secondaryToSupporting);
    supportingCharacters = [...demotedChars, ...supportingCharacters];
  }

  // 如果选择保留其他主角为完整数据
  let additionalMainCharacters: AdditionalMainCharacter[] = [];
  if (includeOtherMainsAsFull) {
    additionalMainCharacters = otherMains.map(mainCharToAdditional);
  }

  // 构建单人卡
  const singleCard: CharacterCard = {
    id: `single_${multiCard.id}_${targetCharacterId}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    theme: multiCard.theme,
    customTemplates: multiCard.customTemplates,

    // 主角数据
    characterInfo: { ...targetChar.characterInfo },
    persona: { ...targetChar.persona },
    adversityHandling: { ...targetChar.adversityHandling },
    sampleDialogue: { ...targetChar.sampleDialogue },
    miniTheater: { ...targetChar.miniTheater },

    // 全局数据
    plotSetting: { ...multiCard.plotSetting },
    outputSetting: { ...multiCard.outputSetting },
    opening: targetChar.opening || { ...multiCard.opening },
    openingExtension: multiCard.openingExtension
      ? { ...multiCard.openingExtension }
      : undefined,

    // 角色列表
    additionalMainCharacters:
      additionalMainCharacters.length > 0 ? additionalMainCharacters : undefined,
    supportingCharacters:
      supportingCharacters.length > 0 ? supportingCharacters : undefined,
  };

  // 如果保留关系数据，添加到开场白扩展中
  if (preserveRelationships && multiCard.relationshipNetwork) {
    const targetUserRel = multiCard.relationshipNetwork.userRelationships.find(
      (r) => r.characterId === targetCharacterId
    );

    if (targetUserRel && singleCard.openingExtension) {
      singleCard.openingExtension.relationshipSummary = {
        characterLabel: targetUserRel.labelToUser || '',
        userLabel: targetUserRel.labelFromUser || '',
      };
    }
  }

  return singleCard;
}

/**
 * 从多人卡创建新的单角色多人卡
 * 保持 MultiCharacterCard 格式，但只包含一个主角
 */
export function extractSingleCharacterCard(
  multiCard: MultiCharacterCard,
  targetCharacterId: string,
  options: {
    includeOtherMainsAsSecondary?: boolean;
  } = {}
): MultiCharacterCard {
  const { includeOtherMainsAsSecondary = true } = options;

  const targetChar = multiCard.mainCharacters.find((c) => c.id === targetCharacterId);
  if (!targetChar) {
    throw new Error(`Character not found: ${targetCharacterId}`);
  }

  const otherMains = multiCard.mainCharacters.filter((c) => c.id !== targetCharacterId);

  // 构建次要角色列表
  let secondaryCharacters: SecondaryCharacter[] = [...multiCard.secondaryCharacters];

  if (includeOtherMainsAsSecondary) {
    const demotedChars = otherMains.map(demoteToSecondary);
    secondaryCharacters = [...demotedChars, ...secondaryCharacters];
  }

  // 更新关系网（移除不存在的角色关系）
  const updatedRelationships = multiCard.relationshipNetwork.relationships.filter(
    (rel) =>
      rel.characterId1 === targetCharacterId || rel.characterId2 === targetCharacterId
  );

  const updatedUserRelationships = multiCard.relationshipNetwork.userRelationships.filter(
    (rel) => rel.characterId === targetCharacterId
  );

  // 创建新的主角（设为焦点）
  const newMainChar: MainCharacter = {
    ...targetChar,
    isPrimaryFocus: true,
    displayOrder: 0,
  };

  return {
    id: `extracted_${multiCard.id}_${Date.now()}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    cardName: targetChar.characterInfo.name || '单人卡',
    cardType: 'single',
    theme: multiCard.theme,
    customTemplates: multiCard.customTemplates,
    plotSetting: { ...multiCard.plotSetting },
    outputSetting: { ...multiCard.outputSetting },
    opening: targetChar.opening || { ...multiCard.opening },
    openingExtension: multiCard.openingExtension
      ? { ...multiCard.openingExtension }
      : undefined,
    relationshipNetwork: {
      relationships: updatedRelationships,
      userRelationships: updatedUserRelationships,
    },
    mainCharacters: [newMainChar],
    secondaryCharacters,
  };
}

/**
 * 导出所有角色为独立单人卡
 */
export function exportAllAsSingleCards(
  multiCard: MultiCharacterCard
): Map<string, CharacterCard> {
  const result = new Map<string, CharacterCard>();

  multiCard.mainCharacters.forEach((char) => {
    result.set(char.id, exportSingleCard(multiCard, char.id));
  });

  return result;
}

/**
 * 生成导出预览信息
 */
export function getExportPreview(
  multiCard: MultiCharacterCard,
  targetCharacterId: string
): {
  targetName: string;
  demotedCharacters: string[];
  preservedSecondary: string[];
} {
  const targetChar = multiCard.mainCharacters.find((c) => c.id === targetCharacterId);
  const otherMains = multiCard.mainCharacters.filter((c) => c.id !== targetCharacterId);

  return {
    targetName: targetChar?.characterInfo.name || '未命名角色',
    demotedCharacters: otherMains.map(
      (c) => c.characterInfo.name || '未命名角色'
    ),
    preservedSecondary: multiCard.secondaryCharacters.map((c) => c.name || '未命名'),
  };
}
