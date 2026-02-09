import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { CharacterInfo } from '../../../types/character-card';

interface CharacterInfoFormProps {
  data: CharacterInfo;
  onChange: (data: CharacterInfo) => void;
}

export function CharacterInfoForm({ data, onChange }: CharacterInfoFormProps) {
  const update = (field: keyof CharacterInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <Input
        label="角色名称"
        placeholder="例：貂蝉"
        value={data.name}
        onChange={(e) => update('name', e.target.value)}
      />

      <Input
        label="角色性别"
        placeholder="男/女/其他"
        value={data.gender}
        onChange={(e) => update('gender', e.target.value)}
      />

      <Input
        label="角色年龄"
        placeholder="例：18岁 / 青年"
        value={data.age}
        onChange={(e) => update('age', e.target.value)}
      />

      <Input
        label="角色定位（一句话）"
        placeholder="例：温柔体贴的古代美人"
        value={data.positioning}
        onChange={(e) => update('positioning', e.target.value)}
      />

      <Input
        label="与用户的关系"
        placeholder="例：恋人/朋友/同事/陌生人"
        value={data.relationshipWithUser}
        onChange={(e) => update('relationshipWithUser', e.target.value)}
      />

      <Textarea
        label="核心价值"
        placeholder="这个角色能给用户带来什么？例：温暖陪伴、情感支持..."
        value={data.coreValue}
        onChange={(e) => update('coreValue', e.target.value)}
        rows={2}
      />

      <Textarea
        label="使用场景"
        placeholder="例：日常聊天、深夜陪伴、学习辅导..."
        value={data.useCase}
        onChange={(e) => update('useCase', e.target.value)}
        rows={2}
      />
    </div>
  );
}
