import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { OpeningExtension } from '../../../types/character-card';

interface OpeningExtensionFormProps {
  data: OpeningExtension;
  onChange: (data: OpeningExtension) => void;
}

export function OpeningExtensionForm({ data, onChange }: OpeningExtensionFormProps) {
  const update = (field: keyof OpeningExtension, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const updateRelationship = (field: 'characterLabel' | 'userLabel', value: string) => {
    onChange({
      ...data,
      relationshipSummary: {
        ...data.relationshipSummary,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-pink-50 rounded-lg border border-pink-100 text-sm text-pink-700 mb-4">
        开场白扩展内容，用于增强用户对角色的第一印象
      </div>

      {/* 角色卡总结语 */}
      <Textarea
        label="角色卡总结语"
        placeholder="一句有趣的话概括角色特点，如：「你很享受你的私人空间吗？太好了我也很享受你的私人空间！」"
        value={data.cardSummary}
        onChange={(e) => update('cardSummary', e.target.value)}
        rows={2}
      />

      {/* 关系总结 */}
      <div className="border rounded-lg p-4 bg-purple-50">
        <h4 className="text-sm font-medium text-gray-700 mb-3">角色与用户的关系总结</h4>
        <p className="text-xs text-gray-500 mb-3">
          用简短有趣的标签描述角色和用户的关系定位
        </p>

        <div className="space-y-3">
          <Input
            label="角色标签"
            placeholder="如：假装被你催眠的芝麻馅汤圆他"
            value={data.relationshipSummary.characterLabel}
            onChange={(e) => updateRelationship('characterLabel', e.target.value)}
          />

          <Input
            label="用户标签"
            placeholder="如：被暗恋不自知的你"
            value={data.relationshipSummary.userLabel}
            onChange={(e) => updateRelationship('userLabel', e.target.value)}
          />
        </div>

        {/* 预览 */}
        {(data.relationshipSummary.characterLabel || data.relationshipSummary.userLabel) && (
          <div className="mt-4 p-3 bg-white rounded border">
            <p className="text-xs text-gray-500 mb-2">预览效果：</p>
            <div className="text-center">
              {data.relationshipSummary.characterLabel && (
                <p className="text-purple-700 font-medium">{data.relationshipSummary.characterLabel}</p>
              )}
              {data.relationshipSummary.characterLabel && data.relationshipSummary.userLabel && (
                <p className="text-gray-400 my-1">×</p>
              )}
              {data.relationshipSummary.userLabel && (
                <p className="text-pink-700 font-medium">{data.relationshipSummary.userLabel}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 世界背景详情 */}
      <div className="border rounded-lg p-4 bg-amber-50">
        <h4 className="text-sm font-medium text-gray-700 mb-2">世界背景详情（可选）</h4>
        <p className="text-xs text-gray-500 mb-3">
          适用于多人卡、架空世界、古代剧本等需要详细世界观介绍的场景
        </p>

        <Textarea
          placeholder="详细介绍世界观设定：社会结构、势力分布、特殊规则等..."
          value={data.worldBackgroundDetail || ''}
          onChange={(e) => update('worldBackgroundDetail', e.target.value)}
          rows={6}
        />
      </div>
    </div>
  );
}
