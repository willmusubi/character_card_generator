import { useState } from 'react';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Persona } from '../../../types/character-card';

interface PersonaFormProps {
  data: Persona;
  onChange: (data: Persona) => void;
}

export function PersonaForm({ data, onChange }: PersonaFormProps) {
  const [newTag, setNewTag] = useState('');
  const [newQuote, setNewQuote] = useState('');

  const update = (field: keyof Persona, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const updateExample = (field: keyof Persona['languageExamples'], value: string) => {
    onChange({
      ...data,
      languageExamples: { ...data.languageExamples, [field]: value }
    });
  };

  const updateLifeStory = (field: 'childhood' | 'growth' | 'turning', value: string) => {
    onChange({
      ...data,
      lifeStory: { ...(data.lifeStory || { childhood: '', growth: '', turning: '' }), [field]: value }
    });
  };

  // 性格标签操作
  const addTag = () => {
    if (newTag.trim()) {
      const tags = data.personalityTags || [];
      onChange({ ...data, personalityTags: [...tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    const tags = data.personalityTags || [];
    onChange({ ...data, personalityTags: tags.filter((_, i) => i !== index) });
  };

  // 个性语录操作
  const addQuote = () => {
    if (newQuote.trim()) {
      const quotes = data.quotes || [];
      onChange({ ...data, quotes: [...quotes, newQuote.trim()] });
      setNewQuote('');
    }
  };

  const removeQuote = (index: number) => {
    const quotes = data.quotes || [];
    onChange({ ...data, quotes: quotes.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <Textarea
        label="身份背景"
        placeholder="完整身份背景描述..."
        value={data.identity}
        onChange={(e) => update('identity', e.target.value)}
        rows={2}
      />

      <Textarea
        label="外貌描述"
        placeholder="详细外貌描述：发型、眼睛、肤色、身材等..."
        value={data.appearance}
        onChange={(e) => update('appearance', e.target.value)}
        rows={3}
      />

      <Input
        label="声音特点"
        placeholder="例：清冷、温柔、低沉..."
        value={data.voice}
        onChange={(e) => update('voice', e.target.value)}
      />

      <Input
        label="穿衣习惯"
        placeholder="日常穿着风格..."
        value={data.dressStyle}
        onChange={(e) => update('dressStyle', e.target.value)}
      />

      <Input
        label="饮食偏好"
        placeholder="喜欢/讨厌的食物..."
        value={data.foodPreference}
        onChange={(e) => update('foodPreference', e.target.value)}
      />

      <Input
        label="兴趣爱好"
        placeholder="3-5个具体爱好，用逗号分隔..."
        value={data.hobbies}
        onChange={(e) => update('hobbies', e.target.value)}
      />

      <Textarea
        label="性格特点"
        placeholder="格式：\n- 性格1：说明\n- 性格2：说明\n- 性格3：说明"
        value={data.personalities}
        onChange={(e) => update('personalities', e.target.value)}
        rows={4}
      />

      {/* 新增：性格标签 */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-3">性格标签（快速标记）</h4>
        <div className="flex flex-wrap gap-2 mb-3">
          {(data.personalityTags || []).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-2 text-purple-600 hover:text-purple-900"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="添加性格标签，如：大少爷脾气、傲娇..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 whitespace-nowrap"
          >
            添加
          </button>
        </div>
      </div>

      <Textarea
        label="对用户的情感"
        placeholder="感情定位和态度..."
        value={data.emotionToUser}
        onChange={(e) => update('emotionToUser', e.target.value)}
        rows={2}
      />

      <Textarea
        label="角色简介"
        placeholder="2-3句话的角色简介..."
        value={data.brief}
        onChange={(e) => update('brief', e.target.value)}
        rows={2}
      />

      <Textarea
        label="角色经历"
        placeholder="重要背景故事..."
        value={data.backstory}
        onChange={(e) => update('backstory', e.target.value)}
        rows={3}
      />

      {/* 新增：人生经历分段 */}
      <div className="border rounded-lg p-4 bg-amber-50">
        <h4 className="text-sm font-medium text-gray-700 mb-3">人生经历（分阶段）</h4>
        <div className="space-y-3">
          <Textarea
            label="童年"
            placeholder="童年时期的重要经历..."
            value={data.lifeStory?.childhood || ''}
            onChange={(e) => updateLifeStory('childhood', e.target.value)}
            rows={2}
          />
          <Textarea
            label="成长"
            placeholder="成长过程中的关键事件..."
            value={data.lifeStory?.growth || ''}
            onChange={(e) => updateLifeStory('growth', e.target.value)}
            rows={2}
          />
          <Textarea
            label="关键转折"
            placeholder="人生的重大转折点..."
            value={data.lifeStory?.turning || ''}
            onChange={(e) => updateLifeStory('turning', e.target.value)}
            rows={2}
          />
        </div>
      </div>

      {/* 新增：个性语录 */}
      <div className="border rounded-lg p-4 bg-blue-50">
        <h4 className="text-sm font-medium text-gray-700 mb-3">个性语录</h4>
        <div className="space-y-2 mb-3">
          {(data.quotes || []).map((quote, index) => (
            <div key={index} className="flex items-start gap-2 bg-white p-2 rounded border">
              <span className="text-blue-600 font-medium">"{quote}"</span>
              <button
                type="button"
                onClick={() => removeQuote(index)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                删除
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="添加一条个性语录..."
            value={newQuote}
            onChange={(e) => setNewQuote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addQuote())}
          />
          <button
            type="button"
            onClick={addQuote}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 whitespace-nowrap"
          >
            添加
          </button>
        </div>
      </div>

      {/* 新增：采访内容 */}
      <Textarea
        label="采访内容（可选）"
        placeholder="以采访问答的形式展示角色特点..."
        value={data.interview || ''}
        onChange={(e) => update('interview', e.target.value)}
        rows={4}
      />

      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">扮演风格</h4>

        <Textarea
          label="语言风格"
          placeholder="具体描述语言风格..."
          value={data.languageStyle}
          onChange={(e) => update('languageStyle', e.target.value)}
          rows={2}
          className="mb-3"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="日常台词示例"
            placeholder="「示例台词」"
            value={data.languageExamples.daily}
            onChange={(e) => updateExample('daily', e.target.value)}
          />
          <Input
            label="开心时台词"
            placeholder="「示例台词」"
            value={data.languageExamples.happy}
            onChange={(e) => updateExample('happy', e.target.value)}
          />
          <Input
            label="生气时台词"
            placeholder="「示例台词」"
            value={data.languageExamples.angry}
            onChange={(e) => updateExample('angry', e.target.value)}
          />
          <Input
            label="撒娇时台词"
            placeholder="「示例台词」"
            value={data.languageExamples.flirty}
            onChange={(e) => updateExample('flirty', e.target.value)}
          />
        </div>
      </div>

      <Textarea
        label="对用户的态度"
        placeholder="具体描述..."
        value={data.attitudeToUser}
        onChange={(e) => update('attitudeToUser', e.target.value)}
        rows={2}
      />

      <Textarea
        label="台词要求"
        placeholder="风格要求..."
        value={data.dialogueRequirements}
        onChange={(e) => update('dialogueRequirements', e.target.value)}
        rows={2}
      />

      <Textarea
        label="行为边界（永远不会做的事）"
        placeholder="格式：\n- 边界1\n- 边界2\n- 边界3"
        value={data.boundaries}
        onChange={(e) => update('boundaries', e.target.value)}
        rows={3}
      />
    </div>
  );
}
