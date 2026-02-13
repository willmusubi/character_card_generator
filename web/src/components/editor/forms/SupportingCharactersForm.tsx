import { useState } from 'react';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { SupportingCharacter } from '../../../types/character-card';

interface SupportingCharactersFormProps {
  data: SupportingCharacter[];
  onChange: (data: SupportingCharacter[]) => void;
}

function createEmptySupportingCharacter(): SupportingCharacter {
  return {
    id: `support_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: '',
    identity: '',
    appearance: '',
    quote: '',
    relationToMain: '',
  };
}

export function SupportingCharactersForm({ data, onChange }: SupportingCharactersFormProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addCharacter = () => {
    const newChar = createEmptySupportingCharacter();
    onChange([...data, newChar]);
    setEditingId(newChar.id);
  };

  const removeCharacter = (id: string) => {
    onChange(data.filter(char => char.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const updateCharacter = (id: string, field: keyof SupportingCharacter, value: string) => {
    onChange(data.map(char =>
      char.id === id ? { ...char, [field]: value } : char
    ));
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-teal-50 rounded-lg border border-teal-100 text-sm text-teal-700 mb-4">
        副角色设置，适合出场有限的配角。只需填写必要的精简信息。
      </div>

      {/* 副角色列表 */}
      <div className="space-y-3">
        {data.map((char, index) => (
          <div key={char.id} className="border rounded-lg overflow-hidden">
            {/* 卡片头部 */}
            <div
              className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
              onClick={() => setEditingId(editingId === char.id ? null : char.id)}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center text-xs">
                  {index + 1}
                </span>
                <div>
                  <span className="font-medium">{char.name || `副角色 ${index + 1}`}</span>
                  {char.identity && (
                    <span className="ml-2 text-sm text-gray-500">/ {char.identity}</span>
                  )}
                </div>
                {char.relationToMain && (
                  <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full">
                    {char.relationToMain}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeCharacter(char.id); }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  删除
                </button>
                <span className="text-gray-400">{editingId === char.id ? '▼' : '▶'}</span>
              </div>
            </div>

            {/* 编辑区域 */}
            {editingId === char.id && (
              <div className="p-4 space-y-3 bg-white">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="姓名"
                    placeholder="副角色名称"
                    value={char.name}
                    onChange={(e) => updateCharacter(char.id, 'name', e.target.value)}
                  />
                  <Input
                    label="身份"
                    placeholder="如：经纪人 / 损友"
                    value={char.identity}
                    onChange={(e) => updateCharacter(char.id, 'identity', e.target.value)}
                  />
                </div>

                <Input
                  label="与主角的关系"
                  placeholder="如：唯一能制住他的人 / 一起打架打出来的交情"
                  value={char.relationToMain}
                  onChange={(e) => updateCharacter(char.id, 'relationToMain', e.target.value)}
                />

                <Textarea
                  label="简要外貌"
                  placeholder="简短描述外貌特征..."
                  value={char.appearance || ''}
                  onChange={(e) => updateCharacter(char.id, 'appearance', e.target.value)}
                  rows={2}
                />

                <Input
                  label="个性语"
                  placeholder="一句代表性的台词，如：「我是来帮你收拾烂摊子的，不是来陪你疯的。」"
                  value={char.quote}
                  onChange={(e) => updateCharacter(char.id, 'quote', e.target.value)}
                />
              </div>
            )}

            {/* 折叠时的预览 */}
            {editingId !== char.id && char.quote && (
              <div className="px-4 py-2 border-t bg-gray-50 text-sm text-gray-600 italic">
                "{char.quote}"
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 添加按钮 */}
      <button
        type="button"
        onClick={addCharacter}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-teal-500 hover:text-teal-500 transition-colors"
      >
        + 添加副角色
      </button>

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          点击上方按钮添加副角色
        </div>
      )}

      {/* 快速添加预设副角色 */}
      {data.length === 0 && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-2">快速添加常见副角色类型</h4>
          <div className="flex flex-wrap gap-2">
            {['经纪人', '损友', '助理', '同事', '家人', '对手'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  const newChar = createEmptySupportingCharacter();
                  newChar.identity = type;
                  onChange([...data, newChar]);
                  setEditingId(newChar.id);
                }}
                className="px-3 py-1 text-sm bg-white border rounded-full hover:bg-teal-50 hover:border-teal-300"
              >
                + {type}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
