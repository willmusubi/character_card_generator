import { Textarea } from '../../ui/Textarea';
import { SampleDialogue } from '../../../types/character-card';

interface SampleDialogueFormProps {
  data: SampleDialogue;
  onChange: (data: SampleDialogue) => void;
}

export function SampleDialogueForm({ data, onChange }: SampleDialogueFormProps) {
  const update = (field: keyof SampleDialogue, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 text-sm text-purple-700 mb-4">
        提供对话示例帮助模型理解角色的说话方式和回复风格
      </div>

      <div className="border rounded-lg p-4 space-y-3">
        <h4 className="text-sm font-medium text-gray-700">对话1：日常互动</h4>
        <Textarea
          label="用户消息"
          placeholder="用户消息示例..."
          value={data.dialogue1User}
          onChange={(e) => update('dialogue1User', e.target.value)}
          rows={2}
        />
        <Textarea
          label="角色回复（使用完整输出模块格式）"
          placeholder="角色回复示例，包含场景信息（如需）、正文、状态栏..."
          value={data.dialogue1Response}
          onChange={(e) => update('dialogue1Response', e.target.value)}
          rows={6}
        />
      </div>

      <div className="border rounded-lg p-4 space-y-3">
        <h4 className="text-sm font-medium text-gray-700">对话2：情感场景</h4>
        <Textarea
          label="用户消息"
          placeholder="用户消息示例..."
          value={data.dialogue2User}
          onChange={(e) => update('dialogue2User', e.target.value)}
          rows={2}
        />
        <Textarea
          label="角色回复（使用完整输出模块格式）"
          placeholder="角色回复示例..."
          value={data.dialogue2Response}
          onChange={(e) => update('dialogue2Response', e.target.value)}
          rows={6}
        />
      </div>

      <Textarea
        label="文风说明"
        placeholder="格式：\n- 句式特点：描述\n- 口癖/特色用语：如有\n- 情感表达方式：描述"
        value={data.styleNotes}
        onChange={(e) => update('styleNotes', e.target.value)}
        rows={4}
      />
    </div>
  );
}
