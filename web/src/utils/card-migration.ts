/**
 * 角色卡数据迁移工具
 *
 * 用于将旧版单角色卡 (CharacterCard) 迁移到新版多人卡 (MultiCharacterCard)
 */

import { CharacterCard } from '../types/character-card';
import {
  MultiCharacterCard,
  MainCharacter,
  SecondaryCharacter,
  RelationshipNetwork,
  createEmptyMainCharacter,
} from '../types/multi-character-card';

/**
 * 检测是否为旧版角色卡格式
 */
export function isLegacyCard(data: unknown): data is CharacterCard {
  if (!data || typeof data !== 'object') return false;

  // 旧版卡有 characterInfo 但没有 mainCharacters
  return (
    'characterInfo' in data &&
    'persona' in data &&
    !('mainCharacters' in data)
  );
}

/**
 * 检测是否为新版多人卡格式
 */
export function isMultiCharacterCard(data: unknown): data is MultiCharacterCard {
  if (!data || typeof data !== 'object') return false;

  return (
    'mainCharacters' in data &&
    'cardType' in data &&
    Array.isArray((data as MultiCharacterCard).mainCharacters)
  );
}

/**
 * 将旧版单角色卡迁移到新版多人卡格式
 */
export function migrateToMultiCharacterCard(legacy: CharacterCard): MultiCharacterCard {
  // 创建主角（从旧版数据）
  const mainCharacter: MainCharacter = {
    id: `char_${legacy.id}_main`,
    createdAt: legacy.createdAt,
    updatedAt: legacy.updatedAt,
    displayOrder: 0,
    isPrimaryFocus: true,
    characterInfo: legacy.characterInfo,
    persona: legacy.persona,
    adversityHandling: legacy.adversityHandling,
    sampleDialogue: legacy.sampleDialogue,
    miniTheater: legacy.miniTheater,
    // 角色专属开场（使用全局开场）
    opening: undefined,
  };

  // 迁移额外主角（如果有）
  const additionalMains: MainCharacter[] = (legacy.additionalMainCharacters || []).map(
    (char, index) => {
      const newChar = createEmptyMainCharacter();
      return {
        ...newChar,
        id: char.id,
        createdAt: legacy.createdAt,
        updatedAt: legacy.updatedAt,
        displayOrder: index + 1,
        isPrimaryFocus: false,
        characterInfo: {
          ...newChar.characterInfo,
          name: char.name,
          age: char.age,
          positioning: char.identity,
          relationshipWithUser: char.relationToUser,
          height: char.height,
          weight: char.weight,
          zodiac: char.zodiac,
          mbti: char.mbti,
          race: char.race,
          occupation: char.identity,
        },
        persona: {
          ...newChar.persona,
          identity: char.identity,
          appearance: char.appearance,
          personalityTags: char.personalityTags,
          personalityAnalysis: char.personalityAnalysis,
          quotes: char.quotes,
          lifeStory: char.lifeStory,
        },
      };
    }
  );

  // 迁移副角色
  const secondaryCharacters: SecondaryCharacter[] = (legacy.supportingCharacters || []).map(
    char => ({
      id: char.id,
      name: char.name,
      identity: char.identity,
      appearance: char.appearance,
      quote: char.quote,
      relationToMain: char.relationToMain,
    })
  );

  // 构建关系网
  const allMainCharacters = [mainCharacter, ...additionalMains];
  const relationshipNetwork: RelationshipNetwork = {
    relationships: [],
    userRelationships: allMainCharacters.map(char => ({
      characterId: char.id,
      labelFromUser: '',
      labelToUser: char.characterInfo.relationshipWithUser,
      relationshipType: char.characterInfo.relationshipWithUser,
    })),
  };

  // 确定卡片类型
  const cardType = additionalMains.length > 0 ? 'multi' : 'single';

  // 生成卡片名称
  const cardName = allMainCharacters
    .map(c => c.characterInfo.name)
    .filter(n => n)
    .join(' & ') || '未命名角色卡';

  return {
    id: legacy.id,
    createdAt: legacy.createdAt,
    updatedAt: legacy.updatedAt,
    cardName,
    cardType,
    theme: legacy.theme,
    customTemplates: legacy.customTemplates,
    plotSetting: legacy.plotSetting,
    outputSetting: legacy.outputSetting,
    opening: legacy.opening,
    openingExtension: legacy.openingExtension,
    relationshipNetwork,
    mainCharacters: allMainCharacters,
    secondaryCharacters,
    _legacyMigrated: true,
  };
}

/**
 * 迁移卡片数组
 */
export function migrateCards(cards: unknown[]): MultiCharacterCard[] {
  return cards.map(card => {
    if (isMultiCharacterCard(card)) {
      return card;
    }
    if (isLegacyCard(card)) {
      return migrateToMultiCharacterCard(card);
    }
    // 无法识别的格式，尝试作为旧版处理
    console.warn('[Migration] 无法识别的卡片格式，尝试迁移:', card);
    return migrateToMultiCharacterCard(card as CharacterCard);
  });
}

/**
 * 检查存储版本并迁移
 */
export function checkAndMigrateStorage(storageKey: string): void {
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;

    const data = JSON.parse(stored);

    // 检查是否需要迁移
    if (data.state?.cards) {
      const cards = data.state.cards;
      const needsMigration = cards.some((card: unknown) => isLegacyCard(card));

      if (needsMigration) {
        console.log('[Migration] 检测到旧版数据，开始迁移...');
        data.state.cards = migrateCards(cards);
        data.version = 2; // 更新版本号
        localStorage.setItem(storageKey, JSON.stringify(data));
        console.log('[Migration] 迁移完成');
      }
    }
  } catch (error) {
    console.error('[Migration] 迁移失败:', error);
  }
}
