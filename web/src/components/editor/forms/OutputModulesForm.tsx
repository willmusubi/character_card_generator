import { useState } from 'react';
import { ChevronDown, ChevronUp, Smartphone, Music, MessageCircle, Brain } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { OutputModules, createEmptyOutputModules } from '../../../types/character-card';

interface OutputModulesFormProps {
  data: OutputModules | undefined;
  onChange: (data: OutputModules) => void;
}

export function OutputModulesForm({ data, onChange }: OutputModulesFormProps) {
  const modules = data || createEmptyOutputModules();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    characterStatus: true,
    memoryArea: true,
    optional: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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
      <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 text-sm text-purple-700 mb-4">
        输出模块定义了角色卡的前端显示界面，包括状态栏、记忆区等必选模块，以及手机界面、音乐播放器等可选模块
      </div>

      {/* 角色状态栏（必选） */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('characterStatus')}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-blue-600" />
            <span className="font-medium">角色状态栏</span>
            <span className="text-xs text-gray-500 bg-blue-100 px-2 py-0.5 rounded">必选</span>
          </div>
          {expandedSections.characterStatus ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {expandedSections.characterStatus && (
          <div className="p-4 space-y-4">
            <Input
              label="当前穿搭"
              placeholder="描述角色当前的穿着打扮..."
              value={modules.characterStatus.attire}
              onChange={(e) => updateCharacterStatus('attire', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
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
            <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">待办事项（3项）</label>
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
            <Textarea
              label="随机内容（梦境/回忆/备忘录）"
              placeholder="增加角色深度的内容，>100字..."
              value={modules.characterStatus.randomContent}
              onChange={(e) => updateCharacterStatus('randomContent', e.target.value)}
              rows={4}
            />
          </div>
        )}
      </div>

      {/* 记忆区（必选） */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('memoryArea')}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-green-600" />
            <span className="font-medium">记忆区</span>
            <span className="text-xs text-gray-500 bg-green-100 px-2 py-0.5 rounded">必选</span>
          </div>
          {expandedSections.memoryArea ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {expandedSections.memoryArea && (
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">微博热搜（3条）</label>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">弹幕/粉丝评论（4条）</label>
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
          </div>
        )}
      </div>

      {/* 可选模块 */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('optional')}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium">可选模块</span>
            <span className="text-xs text-gray-500">增加游戏性</span>
          </div>
          {expandedSections.optional ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {expandedSections.optional && (
          <div className="p-4 space-y-4">
            {/* 手机界面开关 */}
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={modules.enablePhoneInterface}
                onChange={(e) => onChange({ ...modules, enablePhoneInterface: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <Smartphone className="w-5 h-5 text-gray-600" />
              <div>
                <span className="font-medium">手机界面</span>
                <p className="text-xs text-gray-500">聊天记录、朋友圈、浏览足迹等</p>
              </div>
            </label>

            {/* 音乐播放器开关 */}
            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
              <input
                type="checkbox"
                checked={modules.enableMusicPlayer}
                onChange={(e) => onChange({ ...modules, enableMusicPlayer: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <Music className="w-5 h-5 text-gray-600" />
              <div>
                <span className="font-medium">音乐播放器</span>
                <p className="text-xs text-gray-500">角色的播放列表，用户可点击播放</p>
              </div>
            </label>

            {modules.enablePhoneInterface && (
              <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                手机界面内容（聊天记录、朋友圈等）将在生成时自动创建，或可在「社交媒体」标签页手动编辑
              </div>
            )}

            {modules.enableMusicPlayer && (
              <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                音乐播放器内容将在生成时自动创建，或可在「音乐播放器」标签页手动编辑
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
