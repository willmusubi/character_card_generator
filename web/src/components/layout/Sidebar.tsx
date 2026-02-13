import { Plus, Trash2, Copy, User, Users, Wand2 } from 'lucide-react';
import { MultiCharacterCard } from '../../types/multi-character-card';
import { Button } from '../ui/Button';

interface SidebarProps {
  cards: MultiCharacterCard[];
  activeCardId: string | null;
  onSelectCard: (id: string) => void;
  onCreateCard: () => void;
  onDeleteCard: (id: string) => void;
  onDuplicateCard: (id: string) => void;
  onAIGenerate: () => void;
}

export function Sidebar({
  cards,
  activeCardId,
  onSelectCard,
  onCreateCard,
  onDeleteCard,
  onDuplicateCard,
  onAIGenerate,
}: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0">
      <div className="p-4 border-b border-gray-200 space-y-2">
        <Button onClick={onCreateCard} variant="secondary" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          手动创建
        </Button>
        <Button onClick={onAIGenerate} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Wand2 className="w-4 h-4 mr-2" />
          AI 生成
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {cards.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            暂无角色卡
            <br />
            点击上方按钮创建
          </div>
        ) : (
          <div className="space-y-1">
            {cards.map((card) => {
              const isMulti = card.cardType === 'multi' || card.mainCharacters.length > 1;
              const displayName = card.cardName || card.mainCharacters[0]?.characterInfo.name || '未命名角色';
              const subtitle = isMulti
                ? `${card.mainCharacters.length} 位角色`
                : card.mainCharacters[0]?.characterInfo.positioning || '暂无定位';

              return (
                <div
                  key={card.id}
                  onClick={() => onSelectCard(card.id)}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors
                    ${activeCardId === card.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-100 border border-transparent'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
                    ${activeCardId === card.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                    {isMulti ? <Users className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate
                      ${activeCardId === card.id ? 'text-blue-900' : 'text-gray-900'}`}>
                      {displayName}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {subtitle}
                    </div>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateCard(card.id);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="复制"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('确定要删除这个角色卡吗？')) {
                          onDeleteCard(card.id);
                        }
                      }}
                      className="p-1 hover:bg-red-100 rounded"
                      title="删除"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 text-xs text-gray-400 text-center">
        共 {cards.length} 个角色卡
      </div>
    </aside>
  );
}
