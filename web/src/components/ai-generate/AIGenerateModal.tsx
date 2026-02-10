import { useState } from 'react';
import { X, Wand2, Loader2, AlertCircle, Settings, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useCharacterStore } from '../../store/useCharacterStore';
import { ThemeType, THEME_NAMES, CharacterCard } from '../../types/character-card';
import { PROVIDER_CONFIGS } from '../../types/settings';
import { generateAllModules, generateBasicModules, generateRemainingModules, generateCustomStyle } from '../../utils/ai-generator';

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (cardId: string) => void;
}

type GenerationMode = 'all' | 'step';
type GenerationStep = 'input' | 'generating' | 'basic-done' | 'error';

const themeOptions = [
  { value: 'auto', label: '自动匹配' },
  ...Object.entries(THEME_NAMES).map(([value, label]) => ({ value, label })),
];

export function AIGenerateModal({ isOpen, onClose, onComplete }: AIGenerateModalProps) {
  const { settings, isConfigured } = useSettingsStore();
  const { createCard, updateCard } = useCharacterStore();

  const [prompt, setPrompt] = useState('');
  const [theme, setTheme] = useState<string>('auto');
  const [mode, setMode] = useState<GenerationMode>('all');
  const [step, setStep] = useState<GenerationStep>('input');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [error, setError] = useState('');
  const [currentCardId, setCurrentCardId] = useState<string | null>(null);
  const [partialCard, setPartialCard] = useState<Partial<CharacterCard> | null>(null);
  const [enableSearch, setEnableSearch] = useState(true);

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

  const handleGenerateAll = async () => {
    if (!prompt.trim()) return;

    setStep('generating');
    setError('');

    try {
      // 确定主题
      const isCustomTheme = theme === 'custom';
      const selectedTheme: ThemeType = isCustomTheme
        ? 'custom'
        : (theme === 'auto' ? detectTheme(prompt) : theme as ThemeType);

      const result = await generateAllModules(
        prompt,
        settings,
        selectedTheme,
        handleProgress,
        enableSearch && supportsSearch
      );

      // 记录搜索来源（用于调试）
      if (result.searchSources && result.searchSources.length > 0) {
        console.log('[AI Generate] 搜索来源:', result.searchSources);
      }

      // 如果是自定义主题，生成独特的风格模板
      let customTemplates;
      if (isCustomTheme && result.card.characterInfo) {
        handleProgress('正在生成专属风格...', 85);
        customTemplates = await generateCustomStyle(
          {
            name: result.card.characterInfo.name || '角色',
            positioning: result.card.characterInfo.positioning || '',
            worldBackground: result.card.plotSetting?.worldBackground,
            personality: result.card.persona?.personalities,
          },
          settings
        );
        console.log('[AI Generate] 生成的自定义风格:', customTemplates.styleName);
      }

      // 创建新卡片并填充数据
      const newCardId = createCard();
      updateCard(newCardId, {
        ...result.card,
        customTemplates,
      });

      onComplete(newCardId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
      setStep('error');
    }
  };

  const handleGenerateBasic = async () => {
    if (!prompt.trim()) return;

    setStep('generating');
    setError('');

    try {
      const selectedTheme = theme === 'auto' ? detectTheme(prompt) : theme as ThemeType;

      setProgressText('正在生成基础信息...');
      setProgress(30);

      const cardData = await generateBasicModules(prompt, settings, selectedTheme);

      // 创建新卡片
      const newCardId = createCard();
      updateCard(newCardId, cardData);

      setCurrentCardId(newCardId);
      setPartialCard(cardData);
      setStep('basic-done');
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
      setStep('error');
    }
  };

  const handleContinueGeneration = async () => {
    if (!currentCardId || !partialCard) return;

    setStep('generating');
    setError('');

    try {
      setProgressText('正在生成剩余模块...');
      setProgress(50);

      const remainingData = await generateRemainingModules(
        prompt,
        partialCard,
        ['adversityHandling', 'plotSetting', 'outputSetting', 'sampleDialogue', 'miniTheater', 'opening'],
        settings
      );

      updateCard(currentCardId, remainingData);

      onComplete(currentCardId);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
      setStep('error');
    }
  };

  const handleStartGenerate = () => {
    if (mode === 'all') {
      handleGenerateAll();
    } else {
      handleGenerateBasic();
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
    setCurrentCardId(null);
    setPartialCard(null);
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
                placeholder="例如：一个温柔善良的古代才女，擅长诗词歌赋，性格温婉但内心坚强...&#10;&#10;你也可以直接粘贴角色的资料或设定。"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="mb-4"
              />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <Select
                  label="主题风格"
                  options={themeOptions}
                  value={theme}
                  onChange={setTheme}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    生成方式
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMode('all')}
                      className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${
                        mode === 'all'
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      一键生成
                    </button>
                    <button
                      onClick={() => setMode('step')}
                      className={`flex-1 py-2 px-3 text-sm rounded-lg border transition-colors ${
                        mode === 'step'
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      分步生成
                    </button>
                  </div>
                </div>
              </div>

              {/* 搜索增强选项（仅 Gemini 支持） */}
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

              <p className="text-xs text-gray-500 mb-4">
                {mode === 'all'
                  ? '一次性生成所有 8 个模块，适合快速创建'
                  : '先生成基础信息，可编辑后再继续生成其他模块'}
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

          {/* 基础模块完成 */}
          {step === 'basic-done' && (
            <div className="py-4">
              <div className="flex items-center gap-2 text-green-600 mb-4">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="font-medium">基础信息已生成</span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>角色名称：</strong>
                  {partialCard?.characterInfo?.name || '未命名'}
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  <strong>定位：</strong>
                  {partialCard?.characterInfo?.positioning || '暂无'}
                </p>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                你可以先查看并编辑基础信息，然后继续生成剩余模块。
              </p>
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
                onClick={handleStartGenerate}
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

          {step === 'basic-done' && (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  if (currentCardId) {
                    onComplete(currentCardId);
                  }
                }}
              >
                先编辑基础信息
              </Button>
              <Button onClick={handleContinueGeneration} className="gap-2">
                <Wand2 className="w-4 h-4" />
                继续生成
              </Button>
            </>
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
