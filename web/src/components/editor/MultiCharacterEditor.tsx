/**
 * 多人卡编辑器主组件
 *
 * 支持：
 * - 角色切换（多角色模式）
 * - 角色专属模块编辑
 * - 全局模块编辑
 * - 输出预览
 */

import { useState, useMemo } from 'react';
import { Copy, Check, ChevronRight } from 'lucide-react';
import {
  MultiCharacterCard,
  MainCharacter,
  CHARACTER_MODULE_METAS,
  GLOBAL_MODULE_METAS,
} from '../../types/multi-character-card';
import { Tabs } from '../ui/Tabs';
import { Button } from '../ui/Button';
import { useClipboard } from '../../hooks/useClipboard';
import { CharacterTabs } from './CharacterTabs';

// 角色模块表单
import { CharacterInfoForm } from './forms/CharacterInfoForm';
import { PersonaForm } from './forms/PersonaForm';
import { AdversityForm } from './forms/AdversityForm';
import { SampleDialogueForm } from './forms/SampleDialogueForm';
import { MiniTheaterForm } from './forms/MiniTheaterForm';

// 全局模块表单
import { PlotSettingForm } from './forms/PlotSettingForm';
import { OutputSettingForm } from './forms/OutputSettingForm';
import { OpeningForm } from './forms/OpeningForm';
import { OpeningExtensionForm } from './forms/OpeningExtensionForm';
import { SupportingCharactersForm } from './forms/SupportingCharactersForm';
import { RelationshipNetworkForm } from './forms/RelationshipNetworkForm';

// 临时输出生成器（后续会移到独立文件）
import { getModuleOutput } from '../../utils/template-generator';
import { CharacterCard } from '../../types/character-card';

interface MultiCharacterEditorProps {
  card: MultiCharacterCard;
  activeCharacterId: string | null;
  activeContext: 'character' | 'global';
  onUpdateCard: (updates: Partial<MultiCharacterCard>) => void;
  onUpdateCharacter: (characterId: string, updates: Partial<MainCharacter>) => void;
  onAddCharacter: () => void;
  onRemoveCharacter: (characterId: string) => void;
  onSelectCharacter: (characterId: string | null) => void;
  onSelectGlobal: () => void;
  onSetPrimary: (characterId: string) => void;
}

// 角色模块标签
const characterModuleTabs = CHARACTER_MODULE_METAS.map((m) => ({
  key: m.key,
  label: m.label,
}));

// 全局模块标签
const globalModuleTabs = GLOBAL_MODULE_METAS.map((m) => ({
  key: m.key,
  label: m.label,
}));

// 临时：从 MultiCharacterCard 构建 CharacterCard 格式用于输出预览
function buildLegacyCard(
  card: MultiCharacterCard,
  character: MainCharacter | null
): CharacterCard {
  const char = character || card.mainCharacters[0];
  return {
    id: card.id,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
    theme: card.theme,
    customTemplates: card.customTemplates,
    characterInfo: char?.characterInfo || {
      name: '',
      gender: '',
      age: '',
      positioning: '',
      relationshipWithUser: '',
      coreValue: '',
      useCase: '',
    },
    persona: char?.persona || {
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
    },
    adversityHandling: char?.adversityHandling || {
      inappropriateRequest: '',
      insufficientInfo: '',
      emotionalAttack: '',
      beyondCapability: '',
    },
    plotSetting: card.plotSetting,
    outputSetting: card.outputSetting,
    sampleDialogue: char?.sampleDialogue || {
      dialogue1User: '',
      dialogue1Response: '',
      dialogue2User: '',
      dialogue2Response: '',
      styleNotes: '',
    },
    miniTheater: char?.miniTheater || {
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
    opening: card.opening,
    openingExtension: card.openingExtension,
    // 多角色相关
    additionalMainCharacters: card.mainCharacters
      .filter((c) => c.id !== char?.id)
      .map((c) => ({
        id: c.id,
        name: c.characterInfo.name,
        age: c.characterInfo.age,
        height: c.characterInfo.height,
        weight: c.characterInfo.weight,
        zodiac: c.characterInfo.zodiac,
        mbti: c.characterInfo.mbti,
        identity: c.characterInfo.occupation || '',
        race: c.characterInfo.race,
        appearance: c.persona.appearance,
        personalityTags: c.persona.personalityTags,
        personalityAnalysis: '',
        lifeStory: c.persona.lifeStory,
        quotes: c.persona.quotes,
        relationToUser: c.characterInfo.relationshipWithUser,
      })),
    supportingCharacters: card.secondaryCharacters,
  };
}

// 生成关系网输出
function generateRelationshipNetworkOutput(card: MultiCharacterCard): string {
  const { relationshipNetwork, mainCharacters } = card;

  const getCharName = (id: string) => {
    const char = mainCharacters.find((c) => c.id === id);
    return char?.characterInfo.name || '未命名角色';
  };

  let output = '### 关系网\n';

  // 角色间关系
  if (relationshipNetwork.relationships.length > 0) {
    output += '\n**角色间关系**\n';
    relationshipNetwork.relationships.forEach((rel) => {
      const name1 = getCharName(rel.characterId1);
      const name2 = getCharName(rel.characterId2);
      output += `\n${name1} ↔ ${name2}：${rel.relationshipType || '未定义'}`;
      if (rel.labelFrom1To2)
        output += `\n  - ${name1}视角：${rel.labelFrom1To2}`;
      if (rel.labelFrom2To1)
        output += `\n  - ${name2}视角：${rel.labelFrom2To1}`;
      if (rel.history) output += `\n  - 关系历史：${rel.history}`;
      if (rel.dynamics) output += `\n  - 当前动态：${rel.dynamics}`;
    });
  }

  // 与用户关系
  if (relationshipNetwork.userRelationships.length > 0) {
    output += '\n\n**与{{user}}的关系**\n';
    relationshipNetwork.userRelationships.forEach((rel) => {
      const name = getCharName(rel.characterId);
      output += `\n${name}：${rel.relationshipType || '未定义'}`;
      if (rel.labelFromUser)
        output += `\n  - {{user}}视角：${rel.labelFromUser}`;
      if (rel.labelToUser) output += `\n  - ${name}视角：${rel.labelToUser}`;
    });
  }

  if (
    relationshipNetwork.relationships.length === 0 &&
    relationshipNetwork.userRelationships.length === 0
  ) {
    output += '\n暂无关系设定';
  }

  return output;
}

export function MultiCharacterEditor({
  card,
  activeCharacterId,
  activeContext,
  onUpdateCard,
  onUpdateCharacter,
  onAddCharacter,
  onRemoveCharacter,
  onSelectCharacter,
  onSelectGlobal,
  onSetPrimary,
}: MultiCharacterEditorProps) {
  const [activeModule, setActiveModule] = useState<string>('characterInfo');
  const { copy, copied } = useClipboard();

  // 当前激活的角色
  const activeCharacter = useMemo(() => {
    return (
      card.mainCharacters.find((c) => c.id === activeCharacterId) ||
      card.mainCharacters[0] ||
      null
    );
  }, [card.mainCharacters, activeCharacterId]);

  // 是否为多角色模式
  const isMultiMode = card.cardType === 'multi' || card.mainCharacters.length > 1;

  // 当前模块标签
  const currentTabs = activeContext === 'character' ? characterModuleTabs : globalModuleTabs;

  // 确保 activeModule 在当前标签范围内
  const validActiveModule = useMemo(() => {
    const validKeys = currentTabs.map((t) => t.key);
    if (validKeys.includes(activeModule)) return activeModule;
    return currentTabs[0]?.key || 'characterInfo';
  }, [activeModule, currentTabs]);

  // 当前模块元信息
  const currentMeta =
    activeContext === 'character'
      ? CHARACTER_MODULE_METAS.find((m) => m.key === validActiveModule)
      : GLOBAL_MODULE_METAS.find((m) => m.key === validActiveModule);

  // 生成输出预览
  const output = useMemo(() => {
    // 关系网特殊处理
    if (validActiveModule === 'relationshipNetwork') {
      return generateRelationshipNetworkOutput(card);
    }

    // 次要角色特殊处理
    if (validActiveModule === 'secondaryCharacters') {
      const legacyCard = buildLegacyCard(card, activeCharacter);
      return getModuleOutput(legacyCard, 'supportingCharacters');
    }

    // 其他模块使用旧版生成器
    const legacyCard = buildLegacyCard(card, activeCharacter);
    return getModuleOutput(legacyCard, validActiveModule);
  }, [card, activeCharacter, validActiveModule]);

  const handleCopy = () => {
    copy(output);
  };

  // 渲染角色模块表单
  const renderCharacterForm = () => {
    if (!activeCharacter) return <div className="text-gray-500">请先选择角色</div>;

    const updateChar = <K extends keyof MainCharacter>(
      field: K,
      value: MainCharacter[K]
    ) => {
      onUpdateCharacter(activeCharacter.id, { [field]: value });
    };

    switch (validActiveModule) {
      case 'characterInfo':
        return (
          <CharacterInfoForm
            data={activeCharacter.characterInfo}
            onChange={(data) => updateChar('characterInfo', data)}
          />
        );
      case 'persona':
        return (
          <PersonaForm
            data={activeCharacter.persona}
            onChange={(data) => updateChar('persona', data)}
          />
        );
      case 'adversityHandling':
        return (
          <AdversityForm
            data={activeCharacter.adversityHandling}
            onChange={(data) => updateChar('adversityHandling', data)}
          />
        );
      case 'sampleDialogue':
        return (
          <SampleDialogueForm
            data={activeCharacter.sampleDialogue}
            onChange={(data) => updateChar('sampleDialogue', data)}
          />
        );
      case 'miniTheater':
        return (
          <MiniTheaterForm
            data={activeCharacter.miniTheater}
            onChange={(data) => updateChar('miniTheater', data)}
          />
        );
      default:
        return null;
    }
  };

  // 渲染全局模块表单
  const renderGlobalForm = () => {
    switch (validActiveModule) {
      case 'plotSetting':
        return (
          <PlotSettingForm
            data={card.plotSetting}
            onChange={(data) => onUpdateCard({ plotSetting: data })}
          />
        );
      case 'relationshipNetwork':
        return (
          <RelationshipNetworkForm
            data={card.relationshipNetwork}
            characters={card.mainCharacters}
            onChange={(data) => onUpdateCard({ relationshipNetwork: data })}
          />
        );
      case 'outputSetting':
        return (
          <OutputSettingForm
            data={card.outputSetting}
            onChange={(data) => onUpdateCard({ outputSetting: data })}
          />
        );
      case 'opening':
        return (
          <OpeningForm
            data={card.opening}
            onChange={(data) => onUpdateCard({ opening: data })}
          />
        );
      case 'openingExtension':
        return (
          <OpeningExtensionForm
            data={
              card.openingExtension || {
                cardSummary: '',
                relationshipSummary: { characterLabel: '', userLabel: '' },
              }
            }
            onChange={(data) => onUpdateCard({ openingExtension: data })}
          />
        );
      case 'secondaryCharacters':
        return (
          <SupportingCharactersForm
            data={card.secondaryCharacters}
            onChange={(data) => onUpdateCard({ secondaryCharacters: data })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 角色标签栏 */}
      <CharacterTabs
        characters={card.mainCharacters}
        activeCharacterId={activeCharacterId}
        activeContext={activeContext}
        onSelectCharacter={onSelectCharacter}
        onSelectGlobal={onSelectGlobal}
        onAddCharacter={onAddCharacter}
        onRemoveCharacter={onRemoveCharacter}
        onSetPrimary={onSetPrimary}
        isMultiMode={isMultiMode}
      />

      {/* 模块标签栏 */}
      <div className="px-4 pt-4">
        <Tabs
          tabs={currentTabs}
          activeKey={validActiveModule}
          onChange={setActiveModule}
        />
      </div>

      {/* 编辑区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧表单 */}
        <div className="w-1/2 p-4 overflow-y-auto border-r border-gray-200">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {currentMeta?.label}
              {activeContext === 'character' && activeCharacter && (
                <span className="ml-2 text-sm text-gray-500 font-normal">
                  - {activeCharacter.characterInfo.name || '未命名角色'}
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-500">
              Mufy 字段：{currentMeta?.mufyField}
              {currentMeta?.wordCount && ` · 建议 ${currentMeta.wordCount}`}
            </p>
          </div>
          {activeContext === 'character' ? renderCharacterForm() : renderGlobalForm()}
        </div>

        {/* 右侧预览 */}
        <div className="w-1/2 p-4 overflow-y-auto bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">输出预览</h3>
            <Button variant="secondary" size="sm" onClick={handleCopy} className="gap-2">
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              {copied ? '已复制' : '复制内容'}
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
              {output}
            </pre>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-sm text-blue-700">
                复制上方内容，粘贴到 Mufy 的「{currentMeta?.mufyField}」字段
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
