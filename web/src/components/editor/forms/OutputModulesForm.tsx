import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { OutputModules, createEmptyOutputModules } from '../../../types/character-card';

interface OutputModulesFormProps {
  data: OutputModules | undefined;
  onChange: (data: OutputModules) => void;
}

export function OutputModulesForm({ data, onChange }: OutputModulesFormProps) {
  const modules = data || createEmptyOutputModules();

  const updateCharacterStatus = (field: keyof OutputModules['characterStatus'], value: string | string[]) => {
    onChange({
      ...modules,
      characterStatus: {
        ...modules.characterStatus,
        [field]: value,
      },
    });
  };

  const updateMemoryArea = (field: keyof OutputModules['memoryArea'], value: string | string[]) => {
    onChange({
      ...modules,
      memoryArea: {
        ...modules.memoryArea,
        [field]: value,
      },
    });
  };

  const updateTodoList = (index: number, value: string) => {
    const newList = [...modules.characterStatus.todoList];
    newList[index] = value;
    updateCharacterStatus('todoList', newList);
  };

  const updateHotSearch = (index: number, value: string) => {
    const newList = [...modules.memoryArea.hotSearch];
    newList[index] = value;
    updateMemoryArea('hotSearch', newList);
  };

  const updateDanmaku = (index: number, value: string) => {
    const newList = [...modules.memoryArea.danmaku];
    newList[index] = value;
    updateMemoryArea('danmaku', newList);
  };

  return (
    <div className="space-y-4">
      {/* 角色状态栏 */}
      <div className="border rounded-lg p-4 bg-blue-50">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          角色状态栏
          <span className="ml-2 text-xs text-blue-600">每次回复必须输出</span>
        </h4>
        <div className="space-y-3">
          <Input
            label="当前穿搭"
            placeholder="描述角色当前的穿着打扮..."
            value={modules.characterStatus.attire}
            onChange={(e) => updateCharacterStatus('attire', e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="当前动作"
              placeholder="正在做什么..."
              value={modules.characterStatus.action}
              onChange={(e) => updateCharacterStatus('action', e.target.value)}
            />
            <Input
              label="神态表情"
              placeholder="表情描写..."
              value={modules.characterStatus.expression}
              onChange={(e) => updateCharacterStatus('expression', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="好感度"
              placeholder="如：50/100"
              value={modules.characterStatus.affection}
              onChange={(e) => updateCharacterStatus('affection', e.target.value)}
            />
            <Input
              label="与用户关系"
              placeholder="当前关系状态..."
              value={modules.characterStatus.relationship}
              onChange={(e) => updateCharacterStatus('relationship', e.target.value)}
            />
          </div>
          <Textarea
            label="内心独白 (OS)"
            placeholder="角色此刻在想什么..."
            value={modules.characterStatus.innerOS}
            onChange={(e) => updateCharacterStatus('innerOS', e.target.value)}
            rows={2}
          />
        </div>
      </div>

      {/* 待办事项 */}
      <div className="border rounded-lg p-4 bg-amber-50">
        <h4 className="text-sm font-medium text-gray-700 mb-3">待办事项（3项）</h4>
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Input
              key={i}
              placeholder={`待办 ${i + 1}...`}
              value={modules.characterStatus.todoList[i] || ''}
              onChange={(e) => updateTodoList(i, e.target.value)}
            />
          ))}
        </div>
      </div>

      {/* 随机内容 */}
      <Textarea
        label="随机内容（梦境/回忆/备忘录）"
        placeholder="增加角色深度的内容，建议 >100 字..."
        value={modules.characterStatus.randomContent}
        onChange={(e) => updateCharacterStatus('randomContent', e.target.value)}
        rows={4}
      />

      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">记忆区</h4>
      </div>

      {/* 微博热搜 */}
      <div className="border rounded-lg p-4 bg-green-50">
        <h4 className="text-sm font-medium text-gray-700 mb-3">微博热搜（3条）</h4>
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Input
              key={i}
              placeholder={`热搜 ${i + 1}...`}
              value={modules.memoryArea.hotSearch[i] || ''}
              onChange={(e) => updateHotSearch(i, e.target.value)}
            />
          ))}
        </div>
      </div>

      {/* 记忆 */}
      <Textarea
        label="短期记忆"
        placeholder="最近发生的重要事件..."
        value={modules.memoryArea.shortTermMemory}
        onChange={(e) => updateMemoryArea('shortTermMemory', e.target.value)}
        rows={3}
      />

      <Textarea
        label="长期记忆"
        placeholder="角色的重要记忆/执念..."
        value={modules.memoryArea.longTermMemory}
        onChange={(e) => updateMemoryArea('longTermMemory', e.target.value)}
        rows={3}
      />

      {/* 弹幕/粉丝评论 */}
      <div className="border rounded-lg p-4 bg-purple-50">
        <h4 className="text-sm font-medium text-gray-700 mb-3">弹幕/粉丝评论（4条）</h4>
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Input
              key={i}
              placeholder={`弹幕 ${i + 1}...`}
              value={modules.memoryArea.danmaku[i] || ''}
              onChange={(e) => updateDanmaku(i, e.target.value)}
            />
          ))}
        </div>
      </div>

      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">可选模块</h4>
      </div>

      {/* 可选模块开关 */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={modules.enablePhoneInterface}
              onChange={(e) => onChange({ ...modules, enablePhoneInterface: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-700">手机界面</span>
              <p className="text-xs text-gray-500">聊天记录、朋友圈、浏览足迹等</p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={modules.enableMusicPlayer}
              onChange={(e) => onChange({ ...modules, enableMusicPlayer: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-700">音乐播放器</span>
              <p className="text-xs text-gray-500">角色的播放列表，用户可点击播放</p>
            </div>
          </label>
        </div>

        {(modules.enablePhoneInterface || modules.enableMusicPlayer) && (
          <p className="mt-3 text-xs text-gray-500">
            已启用的模块内容将在 AI 生成时自动创建
          </p>
        )}
      </div>
    </div>
  );
}
