import { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { MultiCharacterEditor } from './components/editor/MultiCharacterEditor';
import { SettingsModal } from './components/settings/SettingsModal';
import { AIGenerateModal } from './components/ai-generate/AIGenerateModal';
import { Toast, useToast } from './components/ui/Toast';
import { useMultiCharacterStore } from './store/useMultiCharacterStore';
import { ThemeType, MultiCharacterCard, MainCharacter } from './types/multi-character-card';
import { FileText, Wand2 } from 'lucide-react';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [showAIGenerate, setShowAIGenerate] = useState(false);

  const {
    cards,
    activeCardId,
    activeCharacterId,
    activeContext,
    createCard,
    deleteCard,
    duplicateCard,
    setActiveCard,
    updateCard,
    updateTheme,
    getActiveCard,
    addMainCharacter,
    removeMainCharacter,
    updateMainCharacter,
    setActiveCharacter,
    setActiveContext,
    setPrimaryCharacter,
  } = useMultiCharacterStore();

  const activeCard = getActiveCard();
  const { toast, showToast, hideToast } = useToast();

  const handleThemeChange = (theme: ThemeType) => {
    if (activeCardId) {
      updateTheme(activeCardId, theme);
    }
  };

  const handleUpdateCard = (updates: Partial<MultiCharacterCard>) => {
    if (activeCardId) {
      updateCard(activeCardId, updates);
    }
  };

  const handleUpdateCharacter = (characterId: string, updates: Partial<MainCharacter>) => {
    if (activeCardId) {
      updateMainCharacter(activeCardId, characterId, updates);
    }
  };

  const handleAddCharacter = () => {
    if (activeCardId) {
      const newCharId = addMainCharacter(activeCardId);
      showToast('已添加新角色', 'success');
      setActiveCharacter(newCharId);
    }
  };

  const handleRemoveCharacter = (characterId: string) => {
    if (activeCardId) {
      if (confirm('确定要删除这个角色吗？')) {
        removeMainCharacter(activeCardId, characterId);
        showToast('已删除角色', 'info');
      }
    }
  };

  const handleSelectCharacter = (characterId: string | null) => {
    setActiveCharacter(characterId);
  };

  const handleSelectGlobal = () => {
    setActiveContext('global');
    setActiveCharacter(null);
  };

  const handleSetPrimary = (characterId: string) => {
    if (activeCardId) {
      setPrimaryCharacter(activeCardId, characterId);
      showToast('已设为焦点角色', 'success');
    }
  };

  const handleCreateCard = () => {
    createCard();
    showToast('已创建新角色卡', 'success');
  };

  const handleDeleteCard = (id: string) => {
    deleteCard(id);
    showToast('已删除角色卡', 'info');
  };

  const handleDuplicateCard = (id: string) => {
    duplicateCard(id);
    showToast('已复制角色卡', 'success');
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleOpenAIGenerate = () => {
    setShowAIGenerate(true);
  };

  const handleAIGenerateComplete = (cardId: string) => {
    setShowAIGenerate(false);
    setActiveCard(cardId);
    showToast('AI 生成完成', 'success');
  };

  return (
    <>
      <MainLayout
        header={
          <Header
            theme={activeCard?.theme || 'modern'}
            onThemeChange={handleThemeChange}
            onOpenSettings={handleOpenSettings}
          />
        }
        sidebar={
          <Sidebar
            cards={cards}
            activeCardId={activeCardId}
            onSelectCard={setActiveCard}
            onCreateCard={handleCreateCard}
            onDeleteCard={handleDeleteCard}
            onDuplicateCard={handleDuplicateCard}
            onAIGenerate={handleOpenAIGenerate}
          />
        }
      >
        {activeCard ? (
          <MultiCharacterEditor
            card={activeCard}
            activeCharacterId={activeCharacterId}
            activeContext={activeContext}
            onUpdateCard={handleUpdateCard}
            onUpdateCharacter={handleUpdateCharacter}
            onAddCharacter={handleAddCharacter}
            onRemoveCharacter={handleRemoveCharacter}
            onSelectCharacter={handleSelectCharacter}
            onSelectGlobal={handleSelectGlobal}
            onSetPrimary={handleSetPrimary}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <FileText className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg">选择或创建一个角色卡开始编辑</p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={handleCreateCard}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                手动创建
              </button>
              <button
                onClick={handleOpenAIGenerate}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                AI 生成
              </button>
            </div>
          </div>
        )}
      </MainLayout>

      {/* 设置弹窗 */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* AI 生成弹窗 */}
      <AIGenerateModal
        isOpen={showAIGenerate}
        onClose={() => setShowAIGenerate(false)}
        onOpen={() => setShowAIGenerate(true)}
        onOpenSettings={handleOpenSettings}
        onComplete={handleAIGenerateComplete}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </>
  );
}

export default App;
