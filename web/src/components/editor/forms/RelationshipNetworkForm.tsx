/**
 * 关系网表单组件
 *
 * 以表格形式编辑角色间关系和与用户的关系
 */

import { Plus, Trash2, Users, User } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Select } from '../../ui/Select';
import {
  RelationshipNetwork,
  CharacterRelationship,
  UserRelationship,
  MainCharacter,
} from '../../../types/multi-character-card';

interface RelationshipNetworkFormProps {
  data: RelationshipNetwork;
  characters: MainCharacter[];
  onChange: (data: RelationshipNetwork) => void;
}

// 预设关系类型
const relationshipTypeOptions = [
  { value: '', label: '请选择关系类型' },
  { value: '恋人', label: '恋人' },
  { value: '暧昧', label: '暧昧' },
  { value: '朋友', label: '朋友' },
  { value: '挚友', label: '挚友' },
  { value: '青梅竹马', label: '青梅竹马' },
  { value: '同学', label: '同学' },
  { value: '同事', label: '同事' },
  { value: '上下级', label: '上下级' },
  { value: '师徒', label: '师徒' },
  { value: '兄弟姐妹', label: '兄弟姐妹' },
  { value: '亲子', label: '亲子' },
  { value: '对手', label: '对手' },
  { value: '仇敌', label: '仇敌' },
  { value: '陌生人', label: '陌生人' },
  { value: '其他', label: '其他' },
];

export function RelationshipNetworkForm({
  data,
  characters,
  onChange,
}: RelationshipNetworkFormProps) {
  // 获取角色名称
  const getCharacterName = (id: string) => {
    const char = characters.find((c) => c.id === id);
    return char?.characterInfo.name || '未命名角色';
  };

  // 角色选项
  const characterOptions = [
    { value: '', label: '请选择角色' },
    ...characters.map((c) => ({
      value: c.id,
      label: c.characterInfo.name || '未命名角色',
    })),
  ];

  // ===== 角色间关系操作 =====

  const addRelationship = () => {
    if (characters.length < 2) return;

    const newRelationship: CharacterRelationship = {
      characterId1: characters[0]?.id || '',
      characterId2: characters[1]?.id || '',
      labelFrom1To2: '',
      labelFrom2To1: '',
      relationshipType: '',
      history: '',
      dynamics: '',
    };

    onChange({
      ...data,
      relationships: [...data.relationships, newRelationship],
    });
  };

  const updateRelationship = (
    index: number,
    updates: Partial<CharacterRelationship>
  ) => {
    const newRelationships = [...data.relationships];
    newRelationships[index] = { ...newRelationships[index], ...updates };
    onChange({ ...data, relationships: newRelationships });
  };

  const removeRelationship = (index: number) => {
    onChange({
      ...data,
      relationships: data.relationships.filter((_, i) => i !== index),
    });
  };

  // ===== 与用户关系操作 =====

  const addUserRelationship = (characterId: string) => {
    // 检查是否已存在
    if (data.userRelationships.some((r) => r.characterId === characterId)) {
      return;
    }

    const newRelationship: UserRelationship = {
      characterId,
      labelFromUser: '',
      labelToUser: '',
      relationshipType: '',
    };

    onChange({
      ...data,
      userRelationships: [...data.userRelationships, newRelationship],
    });
  };

  const updateUserRelationship = (
    characterId: string,
    updates: Partial<UserRelationship>
  ) => {
    const newRelationships = data.userRelationships.map((r) =>
      r.characterId === characterId ? { ...r, ...updates } : r
    );
    onChange({ ...data, userRelationships: newRelationships });
  };

  const removeUserRelationship = (characterId: string) => {
    onChange({
      ...data,
      userRelationships: data.userRelationships.filter(
        (r) => r.characterId !== characterId
      ),
    });
  };

  // 获取未添加用户关系的角色
  const charactersWithoutUserRelation = characters.filter(
    (c) => !data.userRelationships.some((r) => r.characterId === c.id)
  );

  return (
    <div className="space-y-6">
      {/* 说明 */}
      <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-sm text-green-700">
        定义角色之间的关系网络，以及每个角色与用户的关系
      </div>

      {/* ===== 角色间关系 ===== */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4" />
            角色间关系
          </h4>
          {characters.length >= 2 && (
            <button
              onClick={addRelationship}
              className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              <Plus className="w-3 h-3" />
              添加关系
            </button>
          )}
        </div>

        {characters.length < 2 ? (
          <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
            需要至少 2 个角色才能定义角色间关系
          </div>
        ) : data.relationships.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
            暂无角色间关系，点击上方按钮添加
          </div>
        ) : (
          <div className="space-y-4">
            {data.relationships.map((rel, index) => (
              <div
                key={index}
                className="p-4 bg-white border border-gray-200 rounded-lg space-y-3"
              >
                {/* 角色选择 */}
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="角色 A"
                    options={characterOptions}
                    value={rel.characterId1}
                    onChange={(value) =>
                      updateRelationship(index, { characterId1: value })
                    }
                  />
                  <Select
                    label="角色 B"
                    options={characterOptions}
                    value={rel.characterId2}
                    onChange={(value) =>
                      updateRelationship(index, { characterId2: value })
                    }
                  />
                </div>

                {/* 关系类型 */}
                <Select
                  label="关系类型"
                  options={relationshipTypeOptions}
                  value={rel.relationshipType}
                  onChange={(value) =>
                    updateRelationship(index, { relationshipType: value })
                  }
                />

                {/* 双向标签 */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={`${getCharacterName(rel.characterId1)} 对 ${getCharacterName(rel.characterId2)} 的看法`}
                    placeholder="例：暗恋对象、讨厌的家伙"
                    value={rel.labelFrom1To2}
                    onChange={(e) =>
                      updateRelationship(index, { labelFrom1To2: e.target.value })
                    }
                  />
                  <Input
                    label={`${getCharacterName(rel.characterId2)} 对 ${getCharacterName(rel.characterId1)} 的看法`}
                    placeholder="例：青梅竹马、可靠的伙伴"
                    value={rel.labelFrom2To1}
                    onChange={(e) =>
                      updateRelationship(index, { labelFrom2To1: e.target.value })
                    }
                  />
                </div>

                {/* 关系历史和动态 */}
                <Textarea
                  label="关系历史（可选）"
                  placeholder="两人是如何认识的？经历过什么？"
                  value={rel.history || ''}
                  onChange={(e) =>
                    updateRelationship(index, { history: e.target.value })
                  }
                  rows={2}
                />

                <Textarea
                  label="当前关系动态（可选）"
                  placeholder="当前两人的关系状态是怎样的？"
                  value={rel.dynamics || ''}
                  onChange={(e) =>
                    updateRelationship(index, { dynamics: e.target.value })
                  }
                  rows={2}
                />

                {/* 删除按钮 */}
                <div className="flex justify-end">
                  <button
                    onClick={() => removeRelationship(index)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    删除此关系
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== 与用户的关系 ===== */}
      <div className="border-t pt-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <User className="w-4 h-4" />
            与用户的关系
          </h4>
          {charactersWithoutUserRelation.length > 0 && (
            <Select
              options={[
                { value: '', label: '添加角色...' },
                ...charactersWithoutUserRelation.map((c) => ({
                  value: c.id,
                  label: c.characterInfo.name || '未命名角色',
                })),
              ]}
              value=""
              onChange={(value) => value && addUserRelationship(value)}
            />
          )}
        </div>

        {data.userRelationships.length === 0 ? (
          <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
            暂无用户关系设定，从上方下拉菜单中添加角色
          </div>
        ) : (
          <div className="space-y-4">
            {data.userRelationships.map((rel) => (
              <div
                key={rel.characterId}
                className="p-4 bg-white border border-gray-200 rounded-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-gray-900">
                    {getCharacterName(rel.characterId)}
                  </h5>
                  <button
                    onClick={() => removeUserRelationship(rel.characterId)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="移除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Select
                  label="关系类型"
                  options={relationshipTypeOptions}
                  value={rel.relationshipType}
                  onChange={(value) =>
                    updateUserRelationship(rel.characterId, {
                      relationshipType: value,
                    })
                  }
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="用户对角色的看法"
                    placeholder="例：暗恋的人、讨厌的上司"
                    value={rel.labelFromUser}
                    onChange={(e) =>
                      updateUserRelationship(rel.characterId, {
                        labelFromUser: e.target.value,
                      })
                    }
                  />
                  <Input
                    label="角色对用户的看法"
                    placeholder="例：可爱的后辈、无聊的室友"
                    value={rel.labelToUser}
                    onChange={(e) =>
                      updateUserRelationship(rel.characterId, {
                        labelToUser: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
