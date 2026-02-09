import { Sparkles, Settings } from 'lucide-react';
import { Select } from '../ui/Select';
import { ThemeType, THEME_NAMES } from '../../types/character-card';

interface HeaderProps {
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  onOpenSettings: () => void;
}

const themeOptions = Object.entries(THEME_NAMES).map(([value, label]) => ({
  value,
  label,
}));

export function Header({ theme, onThemeChange, onOpenSettings }: HeaderProps) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2">
        <Sparkles className="w-6 h-6 text-blue-600" />
        <h1 className="text-lg font-semibold text-gray-900">Mufy 角色卡生成器</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">主题风格</span>
          <Select
            value={theme}
            options={themeOptions}
            onChange={(value) => onThemeChange(value as ThemeType)}
            className="w-32"
          />
        </div>

        <button
          onClick={onOpenSettings}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="AI 服务设置"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </header>
  );
}
