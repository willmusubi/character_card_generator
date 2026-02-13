import { useState } from 'react';
import { X, Wand2, Loader2, AlertCircle, Settings, Search, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { RangeSlider } from '../ui/RangeSlider';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useMultiCharacterStore } from '../../store/useMultiCharacterStore';
import { ThemeType, THEME_NAMES, WordCountRange } from '../../types/character-card';
import { MultiCharacterCard } from '../../types/multi-character-card';
import { PROVIDER_CONFIGS } from '../../types/settings';
import {
  generateMultiCharacterCard,
  generateCustomStyle,
  detectMultipleCharacters,
} from '../../utils/ai-generator';

// 字数范围参数
interface WordCountSettings {
  replyLength: WordCountRange;
  opening: WordCountRange;
  miniTheater: WordCountRange;
}

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (cardId: string) => void;
}

type GenerationStep = 'input' | 'generating' | 'error';

const themeOptions = [
  { value: 'auto', label: '自动匹配' },
  ...Object.entries(THEME_NAMES).map(([value, label]) => ({ value, label })),
];

export function AIGenerateModal({ isOpen, onClose, onComplete }: AIGenerateModalProps) {
  const { settings, isConfigured } = useSettingsStore();

  const [prompt, setPrompt] = useState('');
  const [theme, setTheme] = useState<string>('auto');
  const [step, setStep] = useState<GenerationStep>('input');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [error, setError] = useState('');
  const [enableSearch, setEnableSearch] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [detectedCharacters, setDetectedCharacters] = useState<string[]>([]);
  const [wordCountSettings, setWordCountSettings] = useState<WordCountSettings>({
    replyLength: { min: 200, max: 400 },
    opening: { min: 300, max: 500 },
    miniTheater: { min: 200, max: 400 },
  });

  // 检查当前提供商是否支持搜索
  const supportsSearch = PROVIDER_CONFIGS[settings.provider].supportsSearch;

  if (!isOpen) return null;

  const handleProgress = (text: string, value: number) => {
    setProgressText(text);
    setProgress(value);
  };

  const detectTheme = (text: string): ThemeType => {
    const keywords: Record<Exclude<ThemeType, 'custom'>, string[]> = {
      ancient: ['古', '仙', '侠', '三国', '宫廷', '武侠', '历史', '朝', '君', '皇'],
      cyberpunk: ['科幻', '未来', 'AI', '机械', '赛博', '太空', '机器人', '虚拟'],
      modern: ['现代', '都市', '职场', '校园', '日常', '公司', '大学'],
      cozy: ['治愈', '温馨', '可爱', '萌', '日系', '恋爱', '甜', '暖'],
    };

    for (const [t, kws] of Object.entries(keywords)) {
      if (kws.some(kw => text.includes(kw))) {
        return t as ThemeType;
      }
    }
    return 'modern';
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setStep('generating');
    setError('');

    try {
      // 确定主题
      const isCustomTheme = theme === 'custom';
      const selectedTheme: ThemeType = isCustomTheme
        ? 'custom'
        : (theme === 'auto' ? detectTheme(prompt) : theme as ThemeType);

      // 使用新的多角色生成函数
      const result = await generateMultiCharacterCard(
        prompt,
        settings,
        selectedTheme,
        handleProgress,
        enableSearch && supportsSearch,
        wordCountSettings
      );

      // 记录搜索来源（用于调试）
      if (result.searchSources && result.searchSources.length > 0) {
        console.log('[AI Generate] 搜索来源:', result.searchSources);
      }

      // 如果是自定义主题，生成独特的风格模板
      let customTemplates;
      const primaryChar = result.card.mainCharacters[0];
      if (isCustomTheme && primaryChar) {
        handleProgress('正在生成专属风格...', 85);
        customTemplates = await generateCustomStyle(
          {
            name: primaryChar.characterInfo.name || '角色',
            positioning: primaryChar.characterInfo.positioning || '',
            worldBackground: result.card.plotSetting?.worldBackground,
            personality: primaryChar.persona?.personalities,
          },
          settings
        );
        console.log('[AI Generate] 生成的自定义风格:', customTemplates.styleName);
      }

      // 直接添加生成的卡片到 store
      const newCard: MultiCharacterCard = {
        ...result.card,
        customTemplates,
      };

      useMultiCharacterStore.setState((state) => ({
        cards: [...state.cards, newCard],
        activeCardId: newCard.id,
        activeCharacterId: newCard.mainCharacters[0]?.id || null,
        activeContext: 'character',
      }));

      onComplete(newCard.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
      setStep('error');
    }
  };

  const handleRetry = () => {
    setStep('input');
    setError('');
    setProgress(0);
  };

  const handleClose = () => {
    setStep('input');
    setPrompt('');
    setTheme('auto');
    setError('');
    setProgress(0);
    setDetectedCharacters([]);
    onClose();
  };

  // 未配置 API
  if (!isConfigured()) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
          <div className="flex items-center gap-3 text-amber-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-lg font-semibold">需要配置 AI 服务</h2>
          </div>
          <p className="text-gray-600 mb-4">
            请先在设置中配置 AI 服务的 API Key，才能使用 AI 生成功能。
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={handleClose}>
              取消
            </Button>
            <Button onClick={handleClose} className="gap-2">
              <Settings className="w-4 h-4" />
              去设置
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI 生成角色卡</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="px-6 py-4">
          {/* 输入阶段 */}
          {step === 'input' && (
            <>
              <Textarea
                label="请描述你想创建的角色"
                placeholder="例如：一个温柔善良的古代才女，擅长诗词歌赋，性格温婉但内心坚强...&#10;&#10;你也可以输入多个角色，如：最终幻想的蒂法和爱丽丝"
                value={prompt}
                onChange={(e) => {
                  const value = e.target.value;
                  setPrompt(value);
                  // 检测多角色
                  const detected = detectMultipleCharacters(value);
                  setDetectedCharacters(detected);
                }}
                rows={6}
                className="mb-4"
              />

              {/* 多角色检测提示 */}
              {detectedCharacters.length >= 2 && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      检测到 {detectedCharacters.length} 个角色
                    </p>
                    <p className="text-xs text-blue-600">
                      {detectedCharacters.join('、')} - 将生成多人卡，每个角色独立拥有完整数据
                    </p>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <Select
                  label="主题风格"
                  options={themeOptions}
                  value={theme}
                  onChange={setTheme}
                />
              </div>

              {/* 搜索增强选项（仅支持搜索的提供商） */}
              {supportsSearch && (
                <label className="flex items-center gap-2 mb-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableSearch}
                    onChange={(e) => setEnableSearch(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Search className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">
                    搜索增强
                    <span className="text-gray-500">（推荐用于已知 IP 角色）</span>
                  </span>
                </label>
              )}

              {/* 高级设置：字数范围 */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  高级设置：字数范围
                </button>

                {showAdvanced && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg space-y-4">
                    <RangeSlider
                      label="回复长度"
                      min={50}
                      max={1000}
                      step={50}
                      value={wordCountSettings.replyLength}
                      onChange={(range) => setWordCountSettings(prev => ({ ...prev, replyLength: range }))}
                      unit="字"
                    />
                    <RangeSlider
                      label="开场设计字数"
                      min={100}
                      max={800}
                      step={50}
                      value={wordCountSettings.opening}
                      onChange={(range) => setWordCountSettings(prev => ({ ...prev, opening: range }))}
                      unit="字"
                    />
                    <RangeSlider
                      label="小剧场每场景字数"
                      min={50}
                      max={600}
                      step={50}
                      value={wordCountSettings.miniTheater}
                      onChange={(range) => setWordCountSettings(prev => ({ ...prev, miniTheater: range }))}
                      unit="字"
                    />
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-500 mb-4">
                一次性生成所有模块，适合快速创建
                {enableSearch && supportsSearch && (
                  <span className="block mt-1 text-blue-600">
                    已启用搜索：将自动搜索角色的官方资料，避免编造信息
                  </span>
                )}
              </p>
            </>
          )}

          {/* 生成中 */}
          {step === 'generating' && (
            <div className="py-8 text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 mb-2">{progressText || '正在生成...'}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* 错误状态 */}
          {step === 'error' && (
            <div className="py-4">
              <div className="flex items-center gap-2 text-red-600 mb-4">
                <AlertCircle className="w-6 h-6" />
                <span className="font-medium">生成失败</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50">
          {step === 'input' && (
            <>
              <Button variant="secondary" onClick={handleClose}>
                取消
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim()}
                className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Wand2 className="w-4 h-4" />
                开始生成
              </Button>
            </>
          )}

          {step === 'generating' && (
            <Button variant="secondary" onClick={handleClose}>
              取消
            </Button>
          )}

          {step === 'error' && (
            <>
              <Button variant="secondary" onClick={handleClose}>
                取消
              </Button>
              <Button onClick={handleRetry}>
                重试
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
