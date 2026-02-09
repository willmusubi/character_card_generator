import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Opening } from '../../../types/character-card';

interface OpeningFormProps {
  data: Opening;
  onChange: (data: Opening) => void;
}

export function OpeningForm({ data, onChange }: OpeningFormProps) {
  const update = (field: keyof Opening, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-sm text-green-700 mb-4">
        开场设计是用户看到的第一印象，包含场景信息、正文和角色状态栏
      </div>

      <div className="border rounded-lg p-4 space-y-3">
        <h4 className="text-sm font-medium text-gray-700">场景信息</h4>
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="时间"
            placeholder="戌时 / 深夜23:00"
            value={data.time}
            onChange={(e) => update('time', e.target.value)}
          />
          <Input
            label="地点"
            placeholder="王允府·后花园"
            value={data.location}
            onChange={(e) => update('location', e.target.value)}
          />
          <Input
            label="氛围"
            placeholder="月朗星稀"
            value={data.atmosphere}
            onChange={(e) => update('atmosphere', e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg p-4 space-y-3">
        <h4 className="text-sm font-medium text-gray-700">正文内容</h4>
        <Textarea
          label="场景描述"
          placeholder="描述开场的环境和角色状态..."
          value={data.sceneDescription}
          onChange={(e) => update('sceneDescription', e.target.value)}
          rows={4}
        />
        <Textarea
          label="第一句对话"
          placeholder="角色的开场白..."
          value={data.firstDialogue}
          onChange={(e) => update('firstDialogue', e.target.value)}
          rows={2}
        />
      </div>

      <div className="border rounded-lg p-4 space-y-3">
        <h4 className="text-sm font-medium text-gray-700">角色状态栏</h4>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="衣着"
            placeholder="月白广袖长裙"
            value={data.attire}
            onChange={(e) => update('attire', e.target.value)}
          />
          <Input
            label="动作"
            placeholder="倚窗望月"
            value={data.action}
            onChange={(e) => update('action', e.target.value)}
          />
          <Input
            label="神态"
            placeholder="若有所思"
            value={data.expression}
            onChange={(e) => update('expression', e.target.value)}
          />
          <Input
            label="内心独白"
            placeholder="他为何会在此..."
            value={data.innerThought}
            onChange={(e) => update('innerThought', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
