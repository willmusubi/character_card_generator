import { useState } from 'react';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Select } from '../../ui/Select';
import { AdditionalMainCharacter } from '../../../types/character-card';

interface AdditionalMainCharactersFormProps {
  data: AdditionalMainCharacter[];
  onChange: (data: AdditionalMainCharacter[]) => void;
}

// 星座选项
const zodiacOptions = [
  { value: '', label: '请选择星座' },
  { value: '白羊座', label: '白羊座' },
  { value: '金牛座', label: '金牛座' },
  { value: '双子座', label: '双子座' },
  { value: '巨蟹座', label: '巨蟹座' },
  { value: '狮子座', label: '狮子座' },
  { value: '处女座', label: '处女座' },
  { value: '天秤座', label: '天秤座' },
  { value: '天蝎座', label: '天蝎座' },
  { value: '射手座', label: '射手座' },
  { value: '摩羯座', label: '摩羯座' },
  { value: '水瓶座', label: '水瓶座' },
  { value: '双鱼座', label: '双鱼座' },
];

// MBTI 选项
const mbtiOptions = [
  { value: '', label: '请选择 MBTI' },
  { value: 'INTJ', label: 'INTJ' },
  { value: 'INTP', label: 'INTP' },
  { value: 'ENTJ', label: 'ENTJ' },
  { value: 'ENTP', label: 'ENTP' },
  { value: 'INFJ', label: 'INFJ' },
  { value: 'INFP', label: 'INFP' },
  { value: 'ENFJ', label: 'ENFJ' },
  { value: 'ENFP', label: 'ENFP' },
  { value: 'ISTJ', label: 'ISTJ' },
  { value: 'ISFJ', label: 'ISFJ' },
  { value: 'ESTJ', label: 'ESTJ' },
  { value: 'ESFJ', label: 'ESFJ' },
  { value: 'ISTP', label: 'ISTP' },
  { value: 'ISFP', label: 'ISFP' },
  { value: 'ESTP', label: 'ESTP' },
  { value: 'ESFP', label: 'ESFP' },
];

function createEmptyCharacter(): AdditionalMainCharacter {
  return {
    id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: '',
    age: '',
    height: '',
    weight: '',
    zodiac: '',
    mbti: '',
    identity: '',
    race: '',
    appearance: '',
    personalityTags: [],
    personalityAnalysis: '',
    lifeStory: { childhood: '', growth: '', turning: '' },
    quotes: [],
    relationToUser: '',
  };
}

export function AdditionalMainCharactersForm({ data, onChange }: AdditionalMainCharactersFormProps) {
  const [expandedId, setExpandedId] = useState<string | null>(data[0]?.id || null);
  const [newTag, setNewTag] = useState('');
  const [newQuote, setNewQuote] = useState('');

  const addCharacter = () => {
    if (data.length >= 3) return;
    const newChar = createEmptyCharacter();
    onChange([...data, newChar]);
    setExpandedId(newChar.id);
  };

  const removeCharacter = (id: string) => {
    onChange(data.filter(char => char.id !== id));
    if (expandedId === id) {
      setExpandedId(data.find(c => c.id !== id)?.id || null);
    }
  };

  const updateCharacter = (id: string, field: keyof AdditionalMainCharacter, value: unknown) => {
    onChange(data.map(char =>
      char.id === id ? { ...char, [field]: value } : char
    ));
  };

  const updateLifeStory = (id: string, field: 'childhood' | 'growth' | 'turning', value: string) => {
    onChange(data.map(char =>
      char.id === id
        ? { ...char, lifeStory: { ...(char.lifeStory || { childhood: '', growth: '', turning: '' }), [field]: value } }
        : char
    ));
  };

  const addTag = (id: string) => {
    if (newTag.trim()) {
      const char = data.find(c => c.id === id);
      if (char) {
        const tags = char.personalityTags || [];
        updateCharacter(id, 'personalityTags', [...tags, newTag.trim()]);
        setNewTag('');
      }
    }
  };

  const removeTag = (id: string, index: number) => {
    const char = data.find(c => c.id === id);
    if (char) {
      const tags = char.personalityTags || [];
      updateCharacter(id, 'personalityTags', tags.filter((_, i) => i !== index));
    }
  };

  const addQuote = (id: string) => {
    if (newQuote.trim()) {
      const char = data.find(c => c.id === id);
      if (char) {
        const quotes = char.quotes || [];
        updateCharacter(id, 'quotes', [...quotes, newQuote.trim()]);
        setNewQuote('');
      }
    }
  };

  const removeQuote = (id: string, index: number) => {
    const char = data.find(c => c.id === id);
    if (char) {
      const quotes = char.quotes || [];
      updateCharacter(id, 'quotes', quotes.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100 text-sm text-indigo-700 mb-4">
        多主角设置，用于多人卡场景。最多可添加 3 个额外主角。
      </div>

      {/* 主角列表 */}
      <div className="space-y-3">
        {data.map((char, index) => (
          <div key={char.id} className="border rounded-lg overflow-hidden">
            {/* 折叠头部 */}
            <div
              className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
              onClick={() => setExpandedId(expandedId === char.id ? null : char.id)}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm">
                  {index + 1}
                </span>
                <span className="font-medium">{char.name || `主角 ${index + 1}`}</span>
                {char.identity && <span className="text-sm text-gray-500">({char.identity})</span>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeCharacter(char.id); }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  删除
                </button>
                <span className="text-gray-400">{expandedId === char.id ? '▼' : '▶'}</span>
              </div>
            </div>

            {/* 展开内容 */}
            {expandedId === char.id && (
              <div className="p-4 space-y-4">
                {/* 基础信息 */}
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="姓名"
                    placeholder="角色名称"
                    value={char.name}
                    onChange={(e) => updateCharacter(char.id, 'name', e.target.value)}
                  />
                  <Input
                    label="年龄"
                    placeholder="如：24岁"
                    value={char.age}
                    onChange={(e) => updateCharacter(char.id, 'age', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="身份/职业"
                    placeholder="如：F1赛车手"
                    value={char.identity}
                    onChange={(e) => updateCharacter(char.id, 'identity', e.target.value)}
                  />
                  <Input
                    label="种族"
                    placeholder="如：人类"
                    value={char.race || ''}
                    onChange={(e) => updateCharacter(char.id, 'race', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <Input
                    label="身高"
                    placeholder="175cm"
                    value={char.height || ''}
                    onChange={(e) => updateCharacter(char.id, 'height', e.target.value)}
                  />
                  <Input
                    label="体重"
                    placeholder="65kg"
                    value={char.weight || ''}
                    onChange={(e) => updateCharacter(char.id, 'weight', e.target.value)}
                  />
                  <Select
                    label="星座"
                    options={zodiacOptions}
                    value={char.zodiac || ''}
                    onChange={(value) => updateCharacter(char.id, 'zodiac', value)}
                  />
                  <Select
                    label="MBTI"
                    options={mbtiOptions}
                    value={char.mbti || ''}
                    onChange={(value) => updateCharacter(char.id, 'mbti', value)}
                  />
                </div>

                <Textarea
                  label="外貌描述"
                  placeholder="详细外貌描述..."
                  value={char.appearance}
                  onChange={(e) => updateCharacter(char.id, 'appearance', e.target.value)}
                  rows={3}
                />

                {/* 性格标签 */}
                <div className="border rounded-lg p-3 bg-purple-50">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">性格标签</h5>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(char.personalityTags || []).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(char.id, tagIndex)}
                          className="ml-1 text-purple-600 hover:text-purple-900"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="添加性格标签..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(char.id))}
                    />
                    <button
                      type="button"
                      onClick={() => addTag(char.id)}
                      className="px-3 py-1 bg-purple-500 text-white text-sm rounded hover:bg-purple-600"
                    >
                      添加
                    </button>
                  </div>
                </div>

                <Textarea
                  label="性格分析"
                  placeholder="详细性格分析..."
                  value={char.personalityAnalysis || ''}
                  onChange={(e) => updateCharacter(char.id, 'personalityAnalysis', e.target.value)}
                  rows={3}
                />

                {/* 人生经历 */}
                <div className="border rounded-lg p-3 bg-amber-50">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">人生经历</h5>
                  <div className="space-y-2">
                    <Textarea
                      label="童年"
                      placeholder="童年经历..."
                      value={char.lifeStory?.childhood || ''}
                      onChange={(e) => updateLifeStory(char.id, 'childhood', e.target.value)}
                      rows={2}
                    />
                    <Textarea
                      label="成长"
                      placeholder="成长经历..."
                      value={char.lifeStory?.growth || ''}
                      onChange={(e) => updateLifeStory(char.id, 'growth', e.target.value)}
                      rows={2}
                    />
                    <Textarea
                      label="关键转折"
                      placeholder="人生转折点..."
                      value={char.lifeStory?.turning || ''}
                      onChange={(e) => updateLifeStory(char.id, 'turning', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>

                {/* 个性语录 */}
                <div className="border rounded-lg p-3 bg-blue-50">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">个性语录</h5>
                  <div className="space-y-1 mb-2">
                    {(char.quotes || []).map((quote, quoteIndex) => (
                      <div key={quoteIndex} className="flex items-center gap-2 bg-white p-2 rounded text-sm">
                        <span className="text-blue-600">"{quote}"</span>
                        <button
                          type="button"
                          onClick={() => removeQuote(char.id, quoteIndex)}
                          className="ml-auto text-red-500 hover:text-red-700 text-xs"
                        >
                          删除
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="添加语录..."
                      value={newQuote}
                      onChange={(e) => setNewQuote(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addQuote(char.id))}
                    />
                    <button
                      type="button"
                      onClick={() => addQuote(char.id)}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                    >
                      添加
                    </button>
                  </div>
                </div>

                <Input
                  label="与用户的关系"
                  placeholder="如：暗恋对象 / 青梅竹马"
                  value={char.relationToUser}
                  onChange={(e) => updateCharacter(char.id, 'relationToUser', e.target.value)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 添加按钮 */}
      {data.length < 3 && (
        <button
          type="button"
          onClick={addCharacter}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-indigo-500 hover:text-indigo-500 transition-colors"
        >
          + 添加主角 ({data.length}/3)
        </button>
      )}

      {data.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          点击上方按钮添加多主角
        </div>
      )}
    </div>
  );
}
