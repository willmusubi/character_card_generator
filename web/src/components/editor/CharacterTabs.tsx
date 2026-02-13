/**
 * 角色标签组件
 *
 * 用于在多角色模式下切换角色和全局设定
 */

import { Plus, User, Globe, Star, Trash2, GripVertical } from 'lucide-react';
import { MainCharacter } from '../../types/multi-character-card';

interface CharacterTabsProps {
  characters: MainCharacter[];
  activeCharacterId: string | null;
  activeContext: 'character' | 'global';
  onSelectCharacter: (characterId: string | null) => void;
  onSelectGlobal: () => void;
  onAddCharacter: () => void;
  onRemoveCharacter?: (characterId: string) => void;
  onSetPrimary?: (characterId: string) => void;
  isMultiMode: boolean;
}

export function CharacterTabs({
  characters,
  activeCharacterId,
  activeContext,
  onSelectCharacter,
  onSelectGlobal,
  onAddCharacter,
  onRemoveCharacter,
  onSetPrimary,
  isMultiMode,
}: CharacterTabsProps) {
  // 单角色模式下不显示角色标签栏
  if (!isMultiMode && characters.length <= 1) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
      {/* 角色标签 */}
      <div className="flex items-center gap-1 flex-1 overflow-x-auto">
        {characters.map((char) => {
          const isActive = activeContext === 'character' && activeCharacterId === char.id;
          const displayName = char.characterInfo.name || '未命名角色';

          return (
            <div
              key={char.id}
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all
                ${isActive
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              onClick={() => onSelectCharacter(char.id)}
            >
              {/* 拖拽手柄 - 仅多角色模式显示 */}
              {isMultiMode && characters.length > 1 && (
                <GripVertical className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}

              {/* 用户图标 */}
              <User className="w-4 h-4" />

              {/* 角色名 */}
              <span className="text-sm font-medium whitespace-nowrap max-w-[100px] truncate">
                {displayName}
              </span>

              {/* 焦点角色标记 */}
              {char.isPrimaryFocus && (
                <span title="焦点角色">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                </span>
              )}

              {/* 设为焦点按钮 */}
              {isMultiMode && !char.isPrimaryFocus && onSetPrimary && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetPrimary(char.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-blue-200 rounded"
                  title="设为焦点角色"
                >
                  <Star className="w-3 h-3 text-gray-400 hover:text-yellow-500" />
                </button>
              )}

              {/* 删除按钮 - 仅多角色模式且非唯一角色时显示 */}
              {isMultiMode && characters.length > 1 && onRemoveCharacter && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveCharacter(char.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-100 rounded"
                  title="删除角色"
                >
                  <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
                </button>
              )}
            </div>
          );
        })}

        {/* 添加角色按钮 */}
        <button
          onClick={onAddCharacter}
          className="flex items-center gap-1 px-3 py-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-dashed border-gray-300 hover:border-blue-400 transition-all"
          title="添加角色"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">添加角色</span>
        </button>
      </div>

      {/* 分隔线 */}
      <div className="h-6 w-px bg-gray-300 mx-2" />

      {/* 全局设定按钮 */}
      <button
        onClick={onSelectGlobal}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all
          ${activeContext === 'global'
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">全局设定</span>
      </button>
    </div>
  );
}
