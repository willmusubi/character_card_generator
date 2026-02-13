import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { RangeSlider } from '../../ui/RangeSlider';
import { MiniTheater, WordCountRange } from '../../../types/character-card';

interface MiniTheaterFormProps {
  data: MiniTheater;
  onChange: (data: MiniTheater) => void;
}

export function MiniTheaterForm({ data, onChange }: MiniTheaterFormProps) {
  const update = (field: keyof MiniTheater, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handleRangeChange = (range: WordCountRange) => {
    onChange({ ...data, wordCountRange: range });
  };

  // 获取当前范围值，如果没有则使用默认值
  const currentRange = data.wordCountRange || { min: 200, max: 400 };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-pink-50 rounded-lg border border-pink-100 text-sm text-pink-700 mb-4">
        小剧场是展示角色魅力的短场景集合，系统会自动添加对应主题的 CSS 样式
      </div>

      <RangeSlider
        label="每个场景字数范围"
        min={50}
        max={600}
        step={50}
        value={currentRange}
        onChange={handleRangeChange}
        unit="字"
      />

      {[1, 2, 3].map((num) => (
        <div key={num} className="border rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">场景 {num}</h4>
          <Input
            label="场景标题"
            placeholder="例：月下独酌 / 初次相遇"
            value={data[`scene${num}Title` as keyof MiniTheater] as string}
            onChange={(e) => update(`scene${num}Title` as keyof MiniTheater, e.target.value)}
          />
          <Textarea
            label="对话内容"
            placeholder="角色的台词..."
            value={data[`scene${num}Dialogue` as keyof MiniTheater] as string}
            onChange={(e) => update(`scene${num}Dialogue` as keyof MiniTheater, e.target.value)}
            rows={2}
          />
          <Textarea
            label="动作描写"
            placeholder="角色的动作、神态..."
            value={data[`scene${num}Action` as keyof MiniTheater] as string}
            onChange={(e) => update(`scene${num}Action` as keyof MiniTheater, e.target.value)}
            rows={2}
          />
        </div>
      ))}
    </div>
  );
}
