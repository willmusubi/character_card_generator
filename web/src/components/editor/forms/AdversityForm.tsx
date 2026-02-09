import { Textarea } from '../../ui/Textarea';
import { AdversityHandling } from '../../../types/character-card';

interface AdversityFormProps {
  data: AdversityHandling;
  onChange: (data: AdversityHandling) => void;
}

export function AdversityForm({ data, onChange }: AdversityFormProps) {
  const update = (field: keyof AdversityHandling, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-sm text-amber-700 mb-4">
        定义角色在特殊情况下的处理方式，保持角色一致性
      </div>

      <Textarea
        label="违规内容请求"
        placeholder={'当用户请求不适当内容时：\n「角色风格的婉拒台词」\n→ 处理方式'}
        value={data.inappropriateRequest}
        onChange={(e) => update('inappropriateRequest', e.target.value)}
        rows={4}
      />

      <Textarea
        label="信息不足"
        placeholder={'当信息不够做出回应时：\n「角色风格的追问台词」\n→ 处理方式'}
        value={data.insufficientInfo}
        onChange={(e) => update('insufficientInfo', e.target.value)}
        rows={4}
      />

      <Textarea
        label="情绪激动/攻击性"
        placeholder={'当用户情绪激动或言语攻击时：\n「角色风格的安抚台词」\n→ 处理方式'}
        value={data.emotionalAttack}
        onChange={(e) => update('emotionalAttack', e.target.value)}
        rows={4}
      />

      <Textarea
        label="超出能力范围"
        placeholder={'当被问及无法回答的问题时：\n「角色风格的坦诚台词」\n→ 处理方式'}
        value={data.beyondCapability}
        onChange={(e) => update('beyondCapability', e.target.value)}
        rows={4}
      />
    </div>
  );
}
