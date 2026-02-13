import { Input } from '../../ui/Input';
import { Textarea } from '../../ui/Textarea';
import { Select } from '../../ui/Select';
import { CharacterInfo } from '../../../types/character-card';

interface CharacterInfoFormProps {
  data: CharacterInfo;
  onChange: (data: CharacterInfo) => void;
}

// 星座选项
const zodiacOptions = [
  { value: '', label: '请选择星座' },
  { value: '白羊座', label: '白羊座 (3.21-4.19)' },
  { value: '金牛座', label: '金牛座 (4.20-5.20)' },
  { value: '双子座', label: '双子座 (5.21-6.21)' },
  { value: '巨蟹座', label: '巨蟹座 (6.22-7.22)' },
  { value: '狮子座', label: '狮子座 (7.23-8.22)' },
  { value: '处女座', label: '处女座 (8.23-9.22)' },
  { value: '天秤座', label: '天秤座 (9.23-10.23)' },
  { value: '天蝎座', label: '天蝎座 (10.24-11.22)' },
  { value: '射手座', label: '射手座 (11.23-12.21)' },
  { value: '摩羯座', label: '摩羯座 (12.22-1.19)' },
  { value: '水瓶座', label: '水瓶座 (1.20-2.18)' },
  { value: '双鱼座', label: '双鱼座 (2.19-3.20)' },
];

// MBTI 选项
const mbtiOptions = [
  { value: '', label: '请选择 MBTI' },
  { value: 'INTJ', label: 'INTJ - 建筑师' },
  { value: 'INTP', label: 'INTP - 逻辑学家' },
  { value: 'ENTJ', label: 'ENTJ - 指挥官' },
  { value: 'ENTP', label: 'ENTP - 辩论家' },
  { value: 'INFJ', label: 'INFJ - 提倡者' },
  { value: 'INFP', label: 'INFP - 调停者' },
  { value: 'ENFJ', label: 'ENFJ - 主人公' },
  { value: 'ENFP', label: 'ENFP - 竞选者' },
  { value: 'ISTJ', label: 'ISTJ - 物流师' },
  { value: 'ISFJ', label: 'ISFJ - 守卫者' },
  { value: 'ESTJ', label: 'ESTJ - 总经理' },
  { value: 'ESFJ', label: 'ESFJ - 执政官' },
  { value: 'ISTP', label: 'ISTP - 鉴赏家' },
  { value: 'ISFP', label: 'ISFP - 探险家' },
  { value: 'ESTP', label: 'ESTP - 企业家' },
  { value: 'ESFP', label: 'ESFP - 表演者' },
];

export function CharacterInfoForm({ data, onChange }: CharacterInfoFormProps) {
  const update = (field: keyof CharacterInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      {/* 基础信息 */}
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-700 mb-4">
        基础档案信息，用于构建角色的基本画像
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="角色名称"
          placeholder="例：貂蝉"
          value={data.name}
          onChange={(e) => update('name', e.target.value)}
        />

        <Input
          label="角色性别"
          placeholder="男/女/其他"
          value={data.gender}
          onChange={(e) => update('gender', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="角色年龄"
          placeholder="例：18岁 / 青年"
          value={data.age}
          onChange={(e) => update('age', e.target.value)}
        />

        <Input
          label="身份/职业"
          placeholder="例：F1赛车手 / 学生"
          value={data.occupation || ''}
          onChange={(e) => update('occupation', e.target.value)}
        />
      </div>

      {/* 详细档案 - 新增字段 */}
      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">详细档案</h4>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="身高"
            placeholder="例：175cm"
            value={data.height || ''}
            onChange={(e) => update('height', e.target.value)}
          />

          <Input
            label="体重"
            placeholder="例：65kg"
            value={data.weight || ''}
            onChange={(e) => update('weight', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <Select
            label="星座"
            options={zodiacOptions}
            value={data.zodiac || ''}
            onChange={(value) => update('zodiac', value)}
          />

          <Select
            label="MBTI"
            options={mbtiOptions}
            value={data.mbti || ''}
            onChange={(value) => update('mbti', value)}
          />
        </div>

        <div className="mt-4">
          <Input
            label="种族"
            placeholder="例：人类 / 精灵 / 吸血鬼"
            value={data.race || ''}
            onChange={(e) => update('race', e.target.value)}
          />
        </div>
      </div>

      {/* 角色定位 */}
      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">角色定位</h4>

        <Input
          label="角色定位（一句话）"
          placeholder="例：温柔体贴的古代美人"
          value={data.positioning}
          onChange={(e) => update('positioning', e.target.value)}
        />

        <div className="mt-4">
          <Input
            label="与用户的关系"
            placeholder="例：恋人/朋友/同事/陌生人"
            value={data.relationshipWithUser}
            onChange={(e) => update('relationshipWithUser', e.target.value)}
          />
        </div>

        <div className="mt-4">
          <Textarea
            label="核心价值"
            placeholder="这个角色能给用户带来什么？例：温暖陪伴、情感支持..."
            value={data.coreValue}
            onChange={(e) => update('coreValue', e.target.value)}
            rows={2}
          />
        </div>

        <div className="mt-4">
          <Textarea
            label="使用场景"
            placeholder="例：日常聊天、深夜陪伴、学习辅导..."
            value={data.useCase}
            onChange={(e) => update('useCase', e.target.value)}
            rows={2}
          />
        </div>
      </div>
    </div>
  );
}
