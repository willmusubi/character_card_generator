import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Select } from '../../ui/Select';
import { OutputSetting } from '../../../types/character-card';

interface OutputSettingFormProps {
  data: OutputSetting;
  onChange: (data: OutputSetting) => void;
}

const perspectiveOptions = [
  { value: '第一人称', label: '第一人称' },
  { value: '第三人称', label: '第三人称' },
];

export function OutputSettingForm({ data, onChange }: OutputSettingFormProps) {
  const update = (field: keyof OutputSetting, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-700 mb-4">
        输出设定定义了角色回复的格式和结构，系统会自动添加对应主题的 HTML 模板
      </div>

      <Input
        label="回复长度"
        placeholder="例：200-400字"
        value={data.replyLength}
        onChange={(e) => update('replyLength', e.target.value)}
      />

      <Textarea
        label="语言风格"
        placeholder="描述语言风格特点..."
        value={data.languageStyle}
        onChange={(e) => update('languageStyle', e.target.value)}
        rows={2}
      />

      <Select
        label="人称视角"
        options={perspectiveOptions}
        value={data.perspective}
        onChange={(value) => update('perspective', value)}
      />

      <Input
        label="动作描写格式"
        placeholder="例：使用 *动作* 格式"
        value={data.actionFormat}
        onChange={(e) => update('actionFormat', e.target.value)}
      />

      <Textarea
        label="模块填写规则（可选）"
        placeholder="自定义各字段的填写规则说明..."
        value={data.moduleRules}
        onChange={(e) => update('moduleRules', e.target.value)}
        rows={6}
      />
    </div>
  );
}
