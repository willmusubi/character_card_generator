/**
 * 多人卡状态管理
 *
 * 支持：
 * - 多个卡片管理
 * - 卡片内多角色管理
 * - 双层选择（activeCardId + activeCharacterId）
 * - 自动从旧版数据迁移
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  MultiCharacterCard,
  MainCharacter,
  SecondaryCharacter,
  RelationshipNetwork,
  ThemeType,
  createEmptyMultiCharacterCard,
  createEmptyMainCharacter,
  createEmptySecondaryCharacter,
} from '../types/multi-character-card';
import { migrateCards, isLegacyCard } from '../utils/card-migration';

interface MultiCharacterStore {
  cards: MultiCharacterCard[];
  activeCardId: string | null;
  activeCharacterId: string | null;  // 当前编辑的角色
  activeContext: 'character' | 'global';  // 当前编辑上下文

  // ===== 卡片 CRUD =====
  createCard: () => string;
  deleteCard: (cardId: string) => void;
  duplicateCard: (cardId: string) => string;
  setActiveCard: (cardId: string | null) => void;
  updateCard: (cardId: string, updates: Partial<MultiCharacterCard>) => void;
  updateTheme: (cardId: string, theme: ThemeType) => void;

  // ===== 主角 CRUD =====
  addMainCharacter: (cardId: string) => string;
  removeMainCharacter: (cardId: string, characterId: string) => void;
  updateMainCharacter: (cardId: string, characterId: string, updates: Partial<MainCharacter>) => void;
  setActiveCharacter: (characterId: string | null) => void;
  setPrimaryCharacter: (cardId: string, characterId: string) => void;
  reorderCharacters: (cardId: string, orderedIds: string[]) => void;

  // ===== 次要角色 CRUD =====
  addSecondaryCharacter: (cardId: string) => string;
  removeSecondaryCharacter: (cardId: string, characterId: string) => void;
  updateSecondaryCharacter: (cardId: string, characterId: string, updates: Partial<SecondaryCharacter>) => void;

  // ===== 关系网 =====
  updateRelationshipNetwork: (cardId: string, network: RelationshipNetwork) => void;

  // ===== 上下文切换 =====
  setActiveContext: (context: 'character' | 'global') => void;

  // ===== Getters =====
  getActiveCard: () => MultiCharacterCard | null;
  getActiveCharacter: () => MainCharacter | null;
}

export const useMultiCharacterStore = create<MultiCharacterStore>()(
  persist(
    (set, get) => ({
      cards: [],
      activeCardId: null,
      activeCharacterId: null,
      activeContext: 'character',

      // ===== 卡片 CRUD =====

      createCard: () => {
        const newCard = createEmptyMultiCharacterCard();
        const firstCharId = newCard.mainCharacters[0]?.id || null;

        set(state => ({
          cards: [...state.cards, newCard],
          activeCardId: newCard.id,
          activeCharacterId: firstCharId,
          activeContext: 'character',
        }));
        return newCard.id;
      },

      deleteCard: (cardId) => {
        set(state => {
          const newCards = state.cards.filter(c => c.id !== cardId);
          const newActiveCardId = state.activeCardId === cardId
            ? (newCards[0]?.id ?? null)
            : state.activeCardId;
          const newActiveCharId = state.activeCardId === cardId
            ? (newCards[0]?.mainCharacters[0]?.id ?? null)
            : state.activeCharacterId;

          return {
            cards: newCards,
            activeCardId: newActiveCardId,
            activeCharacterId: newActiveCharId,
          };
        });
      },

      duplicateCard: (cardId) => {
        const state = get();
        const card = state.cards.find(c => c.id === cardId);
        if (!card) return '';

        // 深拷贝
        const newCard: MultiCharacterCard = JSON.parse(JSON.stringify(card));
        newCard.id = `multicard_${Date.now()}`;
        newCard.createdAt = Date.now();
        newCard.updatedAt = Date.now();
        newCard.cardName = `${card.cardName} (副本)`;

        // 重新生成角色 ID
        newCard.mainCharacters = newCard.mainCharacters.map(char => ({
          ...char,
          id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        }));

        const firstCharId = newCard.mainCharacters[0]?.id || null;

        set(state => ({
          cards: [...state.cards, newCard],
          activeCardId: newCard.id,
          activeCharacterId: firstCharId,
        }));
        return newCard.id;
      },

      setActiveCard: (cardId) => {
        const state = get();
        const card = state.cards.find(c => c.id === cardId);
        const firstCharId = card?.mainCharacters[0]?.id ?? null;

        set({
          activeCardId: cardId,
          activeCharacterId: firstCharId,
          activeContext: 'character',
        });
      },

      updateCard: (cardId, updates) => {
        set(state => ({
          cards: state.cards.map(card =>
            card.id === cardId
              ? { ...card, ...updates, updatedAt: Date.now() }
              : card
          ),
        }));
      },

      updateTheme: (cardId, theme) => {
        set(state => ({
          cards: state.cards.map(card =>
            card.id === cardId
              ? { ...card, theme, updatedAt: Date.now() }
              : card
          ),
        }));
      },

      // ===== 主角 CRUD =====

      addMainCharacter: (cardId) => {
        const newChar = createEmptyMainCharacter();

        set(state => ({
          cards: state.cards.map(card => {
            if (card.id !== cardId) return card;

            const newOrder = card.mainCharacters.length;
            const updatedChar = { ...newChar, displayOrder: newOrder };

            return {
              ...card,
              cardType: 'multi' as const,
              mainCharacters: [...card.mainCharacters, updatedChar],
              updatedAt: Date.now(),
            };
          }),
          activeCharacterId: newChar.id,
          activeContext: 'character',
        }));

        return newChar.id;
      },

      removeMainCharacter: (cardId, characterId) => {
        set(state => {
          const card = state.cards.find(c => c.id === cardId);
          if (!card || card.mainCharacters.length <= 1) {
            // 不能删除最后一个主角
            return state;
          }

          const newMainCharacters = card.mainCharacters
            .filter(c => c.id !== characterId)
            .map((c, i) => ({ ...c, displayOrder: i }));

          // 确保有焦点角色
          if (!newMainCharacters.some(c => c.isPrimaryFocus)) {
            newMainCharacters[0].isPrimaryFocus = true;
          }

          const newActiveCharId = state.activeCharacterId === characterId
            ? newMainCharacters[0]?.id ?? null
            : state.activeCharacterId;

          return {
            cards: state.cards.map(c =>
              c.id === cardId
                ? {
                    ...c,
                    mainCharacters: newMainCharacters,
                    cardType: newMainCharacters.length > 1 ? 'multi' : 'single',
                    updatedAt: Date.now(),
                  }
                : c
            ),
            activeCharacterId: newActiveCharId,
          };
        });
      },

      updateMainCharacter: (cardId, characterId, updates) => {
        set(state => ({
          cards: state.cards.map(card => {
            if (card.id !== cardId) return card;

            // 如果更新了角色名称，同时更新卡片名称
            let cardName = card.cardName;
            if (updates.characterInfo?.name !== undefined) {
              const names = card.mainCharacters.map(c =>
                c.id === characterId
                  ? updates.characterInfo?.name || c.characterInfo.name
                  : c.characterInfo.name
              ).filter(n => n);
              cardName = names.join(' & ') || card.cardName;
            }

            return {
              ...card,
              cardName,
              mainCharacters: card.mainCharacters.map(char =>
                char.id === characterId
                  ? { ...char, ...updates, updatedAt: Date.now() }
                  : char
              ),
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      setActiveCharacter: (characterId) => {
        set({
          activeCharacterId: characterId,
          activeContext: characterId ? 'character' : 'global',
        });
      },

      setPrimaryCharacter: (cardId, characterId) => {
        set(state => ({
          cards: state.cards.map(card => {
            if (card.id !== cardId) return card;
            return {
              ...card,
              mainCharacters: card.mainCharacters.map(char => ({
                ...char,
                isPrimaryFocus: char.id === characterId,
              })),
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      reorderCharacters: (cardId, orderedIds) => {
        set(state => ({
          cards: state.cards.map(card => {
            if (card.id !== cardId) return card;

            const reordered = orderedIds
              .map((id, index) => {
                const char = card.mainCharacters.find(c => c.id === id);
                return char ? { ...char, displayOrder: index } : null;
              })
              .filter((c): c is MainCharacter => c !== null);

            return {
              ...card,
              mainCharacters: reordered,
              updatedAt: Date.now(),
            };
          }),
        }));
      },

      // ===== 次要角色 CRUD =====

      addSecondaryCharacter: (cardId) => {
        const newChar = createEmptySecondaryCharacter();

        set(state => ({
          cards: state.cards.map(card =>
            card.id === cardId
              ? {
                  ...card,
                  secondaryCharacters: [...card.secondaryCharacters, newChar],
                  updatedAt: Date.now(),
                }
              : card
          ),
        }));

        return newChar.id;
      },

      removeSecondaryCharacter: (cardId, characterId) => {
        set(state => ({
          cards: state.cards.map(card =>
            card.id === cardId
              ? {
                  ...card,
                  secondaryCharacters: card.secondaryCharacters.filter(c => c.id !== characterId),
                  updatedAt: Date.now(),
                }
              : card
          ),
        }));
      },

      updateSecondaryCharacter: (cardId, characterId, updates) => {
        set(state => ({
          cards: state.cards.map(card =>
            card.id === cardId
              ? {
                  ...card,
                  secondaryCharacters: card.secondaryCharacters.map(char =>
                    char.id === characterId ? { ...char, ...updates } : char
                  ),
                  updatedAt: Date.now(),
                }
              : card
          ),
        }));
      },

      // ===== 关系网 =====

      updateRelationshipNetwork: (cardId, network) => {
        set(state => ({
          cards: state.cards.map(card =>
            card.id === cardId
              ? { ...card, relationshipNetwork: network, updatedAt: Date.now() }
              : card
          ),
        }));
      },

      // ===== 上下文切换 =====

      setActiveContext: (context) => {
        set({ activeContext: context });
      },

      // ===== Getters =====

      getActiveCard: () => {
        const state = get();
        return state.cards.find(c => c.id === state.activeCardId) ?? null;
      },

      getActiveCharacter: () => {
        const state = get();
        const card = state.cards.find(c => c.id === state.activeCardId);
        if (!card) return null;
        return card.mainCharacters.find(c => c.id === state.activeCharacterId) ?? null;
      },
    }),
    {
      name: 'mufy-multi-character-cards',
      version: 2,
      storage: createJSONStorage(() => localStorage),

      // 数据迁移
      migrate: (persistedState, version) => {
        console.log(`[Store] 迁移数据从版本 ${version} 到版本 2`);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const state = persistedState as any;

        if (version < 2 && state.cards) {
          // 检查是否有旧版卡片需要迁移
          const hasLegacy = state.cards.some((card: unknown) => isLegacyCard(card));

          if (hasLegacy) {
            console.log('[Store] 检测到旧版数据，开始迁移...');
            state.cards = migrateCards(state.cards);
            console.log('[Store] 迁移完成');
          }

          // 确保新字段存在
          if (state.activeCharacterId === undefined) {
            const firstCard = state.cards[0];
            state.activeCharacterId = firstCard?.mainCharacters?.[0]?.id ?? null;
          }
          if (state.activeContext === undefined) {
            state.activeContext = 'character';
          }
        }

        return state as MultiCharacterStore;
      },

      // 合并策略
      merge: (persistedState, currentState) => {
        return {
          ...currentState,
          ...(persistedState as Partial<MultiCharacterStore>),
        };
      },
    }
  )
);

// 同时检查旧版存储并迁移
const OLD_STORAGE_KEY = 'mufy-character-cards';
const oldData = localStorage.getItem(OLD_STORAGE_KEY);
if (oldData) {
  try {
    const parsed = JSON.parse(oldData);
    if (parsed.state?.cards?.length > 0) {
      const hasLegacy = parsed.state.cards.some((card: unknown) => isLegacyCard(card));
      if (hasLegacy) {
        console.log('[Store] 检测到旧版存储，迁移中...');
        const migratedCards = migrateCards(parsed.state.cards);

        // 获取新存储
        const newStorageKey = 'mufy-multi-character-cards';
        const newData = localStorage.getItem(newStorageKey);
        const newParsed = newData ? JSON.parse(newData) : { state: { cards: [] } };

        // 合并迁移的卡片（避免重复）
        const existingIds = new Set(newParsed.state.cards?.map((c: MultiCharacterCard) => c.id) || []);
        const newCards = migratedCards.filter(c => !existingIds.has(c.id));

        if (newCards.length > 0) {
          newParsed.state.cards = [...(newParsed.state.cards || []), ...newCards];
          newParsed.version = 2;
          localStorage.setItem(newStorageKey, JSON.stringify(newParsed));
          console.log(`[Store] 已迁移 ${newCards.length} 个卡片到新存储`);
        }

        // 清理旧存储（可选，保留作为备份）
        // localStorage.removeItem(OLD_STORAGE_KEY);
      }
    }
  } catch (e) {
    console.error('[Store] 旧存储迁移失败:', e);
  }
}
