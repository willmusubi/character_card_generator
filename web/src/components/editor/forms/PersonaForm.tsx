import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Persona } from '../../../types/character-card';

interface PersonaFormProps {
  data: Persona;
  onChange: (data: Persona) => void;
}

export function PersonaForm({ data, onChange }: PersonaFormProps) {
  const update = (field: keyof Persona, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const updateExample = (field: keyof Persona['languageExamples'], value: string) => {
    onChange({
      ...data,
      languageExamples: { ...data.languageExamples, [field]: value }
    });
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
