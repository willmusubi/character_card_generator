import { useState } from 'react';
import { Copy, Check, ChevronRight } from 'lucide-react';
import { CharacterCard, MODULE_METAS } from '../../types/character-card';
import { Tabs } from '../ui/Tabs';
import { Button } from '../ui/Button';
import { useClipboard } from '../../hooks/useClipboard';
import { getModuleOutput } from '../../utils/template-generator';
import { CharacterInfoForm } from './forms/CharacterInfoForm';
import { PersonaForm } from './forms/PersonaForm';
import { AdversityForm } from './forms/AdversityForm';
import { PlotSettingForm } from './forms/PlotSettingForm';
import { OutputSettingForm } from './forms/OutputSettingForm';
import { SampleDialogueForm } from './forms/SampleDialogueForm';
import { MiniTheaterForm } from './forms/MiniTheaterForm';
import { OpeningForm } from './forms/OpeningForm';
import { OpeningExtensionForm } from './forms/OpeningExtensionForm';
import { AdditionalMainCharactersForm } from './forms/AdditionalMainCharactersForm';
import { SupportingCharactersForm } from './forms/SupportingCharactersForm';

interface ModuleEditorProps {
  card: CharacterCard;
  onUpdate: (updates: Partial<CharacterCard>) => void;
}

const tabs = MODULE_METAS.map(m => ({ key: m.key, label: m.label }));

export function ModuleEditor({ card, onUpdate }: ModuleEditorProps) {
  const [activeModule, setActiveModule] = useState('characterInfo');
  const { copy, copied } = useClipboard();

  const currentMeta = MODULE_METAS.find(m => m.key === activeModule);
  const output = getModuleOutput(card, activeModule);

  const handleCopy = () => {
    copy(output);
  };

  const renderForm = () => {
    switch (activeModule) {
      case 'characterInfo':
        return <CharacterInfoForm data={card.characterInfo} onChange={(data) => onUpdate({ characterInfo: data })} />;
      case 'persona':
        return <PersonaForm data={card.persona} onChange={(data) => onUpdate({ persona: data })} />;
      case 'adversityHandling':
        return <AdversityForm data={card.adversityHandling} onChange={(data) => onUpdate({ adversityHandling: data })} />;
      case 'plotSetting':
        return <PlotSettingForm data={card.plotSetting} onChange={(data) => onUpdate({ plotSetting: data })} />;
      case 'outputSetting':
        return <OutputSettingForm data={card.outputSetting} onChange={(data) => onUpdate({ outputSetting: data })} />;
      case 'sampleDialogue':
        return <SampleDialogueForm data={card.sampleDialogue} onChange={(data) => onUpdate({ sampleDialogue: data })} />;
      case 'miniTheater':
        return <MiniTheaterForm data={card.miniTheater} onChange={(data) => onUpdate({ miniTheater: data })} />;
      case 'opening':
        return <OpeningForm data={card.opening} onChange={(data) => onUpdate({ opening: data })} />;
      // 新增模块
      case 'openingExtension':
        return (
          <OpeningExtensionForm
            data={card.openingExtension || { cardSummary: '', relationshipSummary: { characterLabel: '', userLabel: '' } }}
            onChange={(data) => onUpdate({ openingExtension: data })}
          />
        );
      case 'additionalMainCharacters':
        return (
          <AdditionalMainCharactersForm
            data={card.additionalMainCharacters || []}
            onChange={(data) => onUpdate({ additionalMainCharacters: data })}
          />
        );
      case 'supportingCharacters':
        return (
          <SupportingCharactersForm
            data={card.supportingCharacters || []}
            onChange={(data) => onUpdate({ supportingCharacters: data })}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="px-4 pt-4">
        <Tabs tabs={tabs} activeKey={activeModule} onChange={setActiveModule} />
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* 左侧表单 */}
        <div className="w-1/2 p-4 overflow-y-auto border-r border-gray-200">
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900">{currentMeta?.label}</h3>
            <p className="text-sm text-gray-500">
              Mufy 字段：{currentMeta?.mufyField}
              {currentMeta?.wordCount && ` · 建议 ${currentMeta.wordCount}`}
            </p>
          </div>
          {renderForm()}
        </div>

        {/* 右侧预览 */}
        <div className="w-1/2 p-4 overflow-y-auto bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">输出预览</h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
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
