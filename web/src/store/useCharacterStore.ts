import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CharacterCard, ThemeType, createEmptyCard } from '../types/character-card';

interface CharacterStore {
  cards: CharacterCard[];
  activeCardId: string | null;

  // Actions
  createCard: () => string;
  deleteCard: (id: string) => void;
  duplicateCard: (id: string) => string;
  setActiveCard: (id: string | null) => void;
  updateCard: (id: string, updates: Partial<CharacterCard>) => void;
  updateTheme: (id: string, theme: ThemeType) => void;

  // Getters
  getActiveCard: () => CharacterCard | null;
}

export const useCharacterStore = create<CharacterStore>()(
  persist(
    (set, get) => ({
      cards: [],
      activeCardId: null,

      createCard: () => {
        const newCard = createEmptyCard();
        set(state => ({
          cards: [...state.cards, newCard],
          activeCardId: newCard.id
        }));
        return newCard.id;
      },

      deleteCard: (id) => {
        set(state => {
          const newCards = state.cards.filter(c => c.id !== id);
          return {
            cards: newCards,
            activeCardId: state.activeCardId === id
              ? (newCards[0]?.id ?? null)
              : state.activeCardId
          };
        });
      },

      duplicateCard: (id) => {
        const state = get();
        const card = state.cards.find(c => c.id === id);
        if (!card) return '';

        const newCard: CharacterCard = {
          ...JSON.parse(JSON.stringify(card)),
          id: `card_${Date.now()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        newCard.characterInfo.name = `${card.characterInfo.name} (副本)`;

        set(state => ({
          cards: [...state.cards, newCard],
          activeCardId: newCard.id
        }));
        return newCard.id;
      },

      setActiveCard: (id) => {
        set({ activeCardId: id });
      },

      updateCard: (id, updates) => {
        set(state => ({
          cards: state.cards.map(card =>
            card.id === id
              ? { ...card, ...updates, updatedAt: Date.now() }
              : card
          )
        }));
      },

      updateTheme: (id, theme) => {
        set(state => ({
          cards: state.cards.map(card =>
            card.id === id
              ? { ...card, theme, updatedAt: Date.now() }
              : card
          )
        }));
      },

      getActiveCard: () => {
        const state = get();
        return state.cards.find(c => c.id === state.activeCardId) ?? null;
      }
    }),
    {
      name: 'mufy-character-cards',
      version: 1,
    }
  )
);
