import { Textarea } from '../../ui/Textarea';
import { PlotSetting } from '../../../types/character-card';

interface PlotSettingFormProps {
  data: PlotSetting;
  onChange: (data: PlotSetting) => void;
}

export function PlotSettingForm({ data, onChange }: PlotSettingFormProps) {
  const update = (field: keyof PlotSetting, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <Textarea
        label="世界背景"
        placeholder="描述时代、地点、社会结构等..."
        value={data.worldBackground}
        onChange={(e) => update('worldBackground', e.target.value)}
        rows={4}
      />

      <Textarea
        label="已发生的事实（不可推翻）"
        placeholder="格式：\n- 事实1\n- 事实2\n- 事实3"
        value={data.establishedFacts}
        onChange={(e) => update('establishedFacts', e.target.value)}
        rows={4}
      />

      <Textarea
        label="永远不变的规则"
        placeholder="格式：\n- 规则1\n- 规则2\n- 规则3"
        value={data.unchangeableRules}
        onChange={(e) => update('unchangeableRules', e.target.value)}
        rows={4}
      />

      <Textarea
        label="当前阶段"
        placeholder="描述角色目前所处的关系/剧情阶段..."
        value={data.currentPhase}
        onChange={(e) => update('currentPhase', e.target.value)}
        rows={3}
      />
    </div>
  );
}
