import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Wand2, Loader2, AlertCircle, Settings, Search, ChevronDown, ChevronUp, Users, CheckCircle } from 'lucide-react';
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
  generateMultiCharacterCardDemo,
  generateCustomStyle,
  detectMultipleCharacters,
} from '../../utils/ai-generator';
import { FloatingProgress, GenerationStatus } from './FloatingProgress';

// 角色卡详细程度选项
type DetailLevel = 'concise' | 'standard' | 'detailed';

// 简化的字数设置
interface WordCountSettings {
  replyLength: WordCountRange;  // 聊天输出字数（发给 Mufy/酒馆）
  detailLevel: DetailLevel;     // 角色卡详细程度
}

interface AIGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;  // 用于从悬浮框展开时重新打开模态框
  onOpenSettings: () => void;  // 打开设置弹框
  onComplete: (cardId: string) => void;
}

type GenerationStep = 'input' | 'generating' | 'success' | 'error';

const themeOptions = [
  { value: 'auto', label: '自动匹配' },
  ...Object.entries(THEME_NAMES).map(([value, label]) => ({ value, label })),
];

export function AIGenerateModal({ isOpen, onClose, onOpen, onOpenSettings, onComplete }: AIGenerateModalProps) {
  const { settings, isConfigured, demoMode, inviteCode } = useSettingsStore();
  const [showInviteCodeInput, setShowInviteCodeInput] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [inviteCodeError, setInviteCodeError] = useState('');
  const [verifyingCode, setVerifyingCode] = useState(false);

  const [prompt, setPrompt] = useState('');
  const [theme, setTheme] = useState<string>('auto');
  const [step, setStep] = useState<GenerationStep>('input');
  const [progress, setProgress] = useState(0);
  const [displayProgress, setDisplayProgress] = useState(0); // 显示用的平滑进度
  const [progressText, setProgressText] = useState('');
  const [error, setError] = useState('');
  const [enableSearch, setEnableSearch] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [detectedCharacters, setDetectedCharacters] = useState<string[]>([]);
  const [wordCountSettings, setWordCountSettings] = useState<WordCountSettings>({
    replyLength: { min: 200, max: 400 },
    detailLevel: 'standard',
  });
  const [isMinimized, setIsMinimized] = useState(false); // 最小化到悬浮框
  const [floatingStatus, setFloatingStatus] = useState<GenerationStatus>('idle');
  const [generatedCardId, setGeneratedCardId] = useState<string | null>(null); // 生成完成的卡片ID
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 检查当前提供商是否支持搜索
  const supportsSearch = PROVIDER_CONFIGS[settings.provider].supportsSearch;

  // 平滑进度动画效果
  useEffect(() => {
    if (step !== 'generating') {
      setDisplayProgress(0);
      return;
    }

    // 清理之前的定时器
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    // 模拟进度增长（当实际进度停滞时）
    progressIntervalRef.current = setInterval(() => {
      setDisplayProgress(prev => {
        // 如果实际进度已经超过显示进度，跳到实际进度
        if (progress > prev) {
          return progress;
        }
        // 否则缓慢增长，但不超过目标进度的90%（留空间给真实进度）
        const targetCap = Math.min(progress + 15, 85); // 最多比实际进度多15%，但不超过85%
        if (prev < targetCap) {
          // 越接近目标，增长越慢
          const increment = Math.max(0.3, (targetCap - prev) * 0.02);
          return Math.min(prev + increment, targetCap);
        }
        return prev;
      });
    }, 200);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [step, progress]);

  // 当实际进度更新时，确保显示进度跟上
  useEffect(() => {
    if (progress > displayProgress) {
      setDisplayProgress(progress);
    }
  }, [progress, displayProgress]);

  // 从悬浮框展开 - 必须在条件返回之前定义
  const handleExpand = useCallback(() => {
    setIsMinimized(false);
    onOpen();
  }, [onOpen]);

  // 关闭悬浮框 - 必须在条件返回之前定义
  const handleDismissFloating = useCallback(() => {
    setFloatingStatus('idle');
    setIsMinimized(false);
    setStep('input');
    setPrompt('');
    setTheme('auto');
    setError('');
    setProgress(0);
    setDisplayProgress(0);
    setDetectedCharacters([]);
  }, []);

  // 最小化到悬浮框 - 必须在条件返回之前定义
  const handleMinimize = useCallback(() => {
    setIsMinimized(true);
    setFloatingStatus('generating');
    onClose();
  }, [onClose]);

  // 如果模态框关闭但有悬浮进度，只渲染悬浮框
  if (!isOpen) {
    if (isMinimized && floatingStatus !== 'idle') {
      return (
        <FloatingProgress
          isVisible={true}
          status={floatingStatus}
          progress={displayProgress}
          progressText={progressText}
          error={error}
          onExpand={handleExpand}
          onDismiss={handleDismissFloating}
        />
      );
    }
    return null;
  }

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

      let result;

      // 根据是否为 Demo 模式选择不同的生成方式
      if (demoMode && inviteCode) {
        // Demo 模式：使用服务端 API Key
        console.log('[AI Generate] 使用 Demo 模式生成');
        result = await generateMultiCharacterCardDemo({
          inviteCode,
          userPrompt: prompt,
          theme: selectedTheme,
          enableSearch,
          wordCountSettings,
          onProgress: handleProgress,
        });
      } else {
        // 正常模式：使用用户配置的 API Key
        result = await generateMultiCharacterCard(
          prompt,
          settings,
          selectedTheme,
          handleProgress,
          enableSearch && supportsSearch,
          wordCountSettings
        );
      }

      // 记录搜索来源（用于调试）
      if (result.searchSources && result.searchSources.length > 0) {
        console.log('[AI Generate] 搜索来源:', result.searchSources);
      }

      // 如果是自定义主题且不是 Demo 模式，生成独特的风格模板
      let customTemplates;
      const primaryChar = result.card.mainCharacters[0];
      if (isCustomTheme && primaryChar && !demoMode) {
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

      // 保存生成的卡片ID并显示成功状态
      setGeneratedCardId(newCard.id);
      setProgress(100);
      setDisplayProgress(100);
      setStep('success');

      // 如果是最小化状态，更新悬浮框状态
      if (isMinimized) {
        setFloatingStatus('success');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请重试');
      setStep('error');
      // 如果是最小化状态，更新悬浮框状态
      if (isMinimized) {
        setFloatingStatus('error');
      }
    }
  };

  const handleRetry = () => {
    setStep('input');
    setError('');
    setProgress(0);
    setDisplayProgress(0);
    setFloatingStatus('idle');
    setIsMinimized(false);
    setGeneratedCardId(null);
  };

  // 查看生成结果
  const handleViewResult = () => {
    if (generatedCardId) {
      onComplete(generatedCardId);
      handleClose();
    }
  };

  const handleClose = () => {
    // 如果正在生成，最小化到悬浮框而不是关闭
    if (step === 'generating') {
      handleMinimize();
      return;
    }
    // 否则完全关闭
    setStep('input');
    setPrompt('');
    setTheme('auto');
    setError('');
    setProgress(0);
    setDisplayProgress(0);
    setDetectedCharacters([]);
    setFloatingStatus('idle');
    setIsMinimized(false);
    onClose();
  };

  // 处理去设置按钮
  const handleGoToSettings = () => {
    handleClose();
    onOpenSettings();
  };

  // 验证邀请码
  const handleVerifyInviteCode = async () => {
    if (!inviteCodeInput.trim()) {
      setInviteCodeError('请输入邀请码');
      return;
    }

    setVerifyingCode(true);
    setInviteCodeError('');

    try {
      const response = await fetch('/api/demo/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: inviteCodeInput.trim() }),
      });

      const data = await response.json();

      if (data.valid) {
        // 保存邀请码到 store
        useSettingsStore.getState().setDemoMode(true, inviteCodeInput.trim());
        setShowInviteCodeInput(false);
        setInviteCodeInput('');
        // 邀请码有效，关闭弹框，用户可以重新点击 AI 生成
      } else {
        setInviteCodeError(data.error || '邀请码无效');
      }
    } catch {
      setInviteCodeError('验证失败，请稍后重试');
    } finally {
      setVerifyingCode(false);
    }
  };

  // 未配置 API 且不在 Demo 模式
  if (!isConfigured() && !demoMode) {
    // 显示邀请码输入框
    if (showInviteCodeInput) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowInviteCodeInput(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-3 text-purple-600 mb-4">
              <Wand2 className="w-6 h-6" />
              <h2 className="text-lg font-semibold">抢先体验</h2>
            </div>
            <p className="text-gray-600 mb-4">
              请输入邀请码以使用抢先体验功能
            </p>
            <input
              type="text"
              value={inviteCodeInput}
              onChange={(e) => {
                setInviteCodeInput(e.target.value);
                setInviteCodeError('');
              }}
              placeholder="请输入邀请码..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleVerifyInviteCode();
              }}
            />
            {inviteCodeError && (
              <p className="text-red-500 text-sm mb-3">{inviteCodeError}</p>
            )}
            <p className="text-xs text-gray-500 mb-4">
              抢先体验使用 Gemini 3.0 Pro 模型
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowInviteCodeInput(false)}>
                取消
              </Button>
              <Button
                onClick={handleVerifyInviteCode}
                disabled={verifyingCode}
                className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600"
              >
                {verifyingCode ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                确认
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // 显示选择界面
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
        <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
          <div className="flex items-center gap-3 text-amber-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-lg font-semibold">需要配置 AI 服务</h2>
          </div>
          <p className="text-gray-600 mb-4">
            请先配置 AI 服务的 API Key，或使用邀请码抢先体验。
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={handleClose}>
              取消
            </Button>
            <Button variant="secondary" onClick={handleGoToSettings} className="gap-2">
              <Settings className="w-4 h-4" />
              去设置
            </Button>
            <Button
              onClick={() => setShowInviteCodeInput(true)}
              className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600"
            >
              <Wand2 className="w-4 h-4" />
              抢先体验
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 处理遮罩层点击 - 生成中时最小化到悬浮框
  const handleBackdropClick = () => {
    handleClose(); // handleClose 会自动判断是最小化还是关闭
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className={`absolute inset-0 bg-black/50 ${step === 'generating' ? 'cursor-not-allowed' : ''}`}
        onClick={handleBackdropClick}
      />

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
            title={step === 'generating' ? '最小化到右下角' : '关闭'}
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
                  <div className="mt-3 space-y-4">
                    {/* 聊天输出设定 - 发给 Mufy/酒馆的指令 */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-medium text-blue-800 mb-3">
                        聊天输出设定
                        <span className="ml-2 text-xs font-normal text-blue-600">发给 Mufy/酒馆的指令</span>
                      </h4>
                      <RangeSlider
                        label="每次回复字数"
                        min={50}
                        max={1000}
                        step={50}
                        value={wordCountSettings.replyLength}
                        onChange={(range) => setWordCountSettings(prev => ({
                          ...prev,
                          replyLength: range
                        }))}
                        unit="字"
                      />
                      <p className="mt-2 text-xs text-blue-600">
                        此设定会写入角色卡，告诉 Mufy/酒馆每次回复要输出多少字
                      </p>
                    </div>

                    {/* 角色卡详细程度 - 控制生成内容 */}
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <h4 className="text-sm font-medium text-amber-800 mb-3">
                        角色卡详细程度
                        <span className="ml-2 text-xs font-normal text-amber-600">控制生成内容的丰富程度</span>
                      </h4>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors">
                          <input
                            type="radio"
                            name="detailLevel"
                            checked={wordCountSettings.detailLevel === 'concise'}
                            onChange={() => setWordCountSettings(prev => ({ ...prev, detailLevel: 'concise' }))}
                            className="w-4 h-4 text-amber-600 border-amber-300 focus:ring-amber-500"
                          />
                          <div>
                            <span className="font-medium text-amber-900">简洁</span>
                            <p className="text-xs text-amber-600">快速生成，内容精炼，适合快速预览</p>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors">
                          <input
                            type="radio"
                            name="detailLevel"
                            checked={wordCountSettings.detailLevel === 'standard'}
                            onChange={() => setWordCountSettings(prev => ({ ...prev, detailLevel: 'standard' }))}
                            className="w-4 h-4 text-amber-600 border-amber-300 focus:ring-amber-500"
                          />
                          <div>
                            <span className="font-medium text-amber-900">标准</span>
                            <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-1.5 py-0.5 rounded">推荐</span>
                            <p className="text-xs text-amber-600">平衡详细度和生成效率</p>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-amber-100 transition-colors">
                          <input
                            type="radio"
                            name="detailLevel"
                            checked={wordCountSettings.detailLevel === 'detailed'}
                            onChange={() => setWordCountSettings(prev => ({ ...prev, detailLevel: 'detailed' }))}
                            className="w-4 h-4 text-amber-600 border-amber-300 focus:ring-amber-500"
                          />
                          <div>
                            <span className="font-medium text-amber-900">详细</span>
                            <p className="text-xs text-amber-600">深度沉浸，内容丰富，适合精品角色</p>
                          </div>
                        </label>
                      </div>
                    </div>
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
            <div className="py-6">
              {/* 动画图标 */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Loader2 className="w-14 h-14 text-blue-600 animate-spin" />
                  <Wand2 className="w-6 h-6 text-purple-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* 主进度文本 */}
              <p className="text-gray-800 font-medium text-center mb-1">
                {progressText || '正在生成角色卡...'}
              </p>

              {/* 阶段提示 */}
              <p className="text-gray-500 text-sm text-center mb-4">
                {displayProgress < 30 && '准备中...'}
                {displayProgress >= 30 && displayProgress < 50 && 'AI 正在构思角色设定...'}
                {displayProgress >= 50 && displayProgress < 70 && 'AI 正在生成人设和对话...'}
                {displayProgress >= 70 && displayProgress < 85 && 'AI 正在完善细节内容...'}
                {displayProgress >= 85 && displayProgress < 95 && '即将完成...'}
                {displayProgress >= 95 && '正在整理结果...'}
              </p>

              {/* 进度条 */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-600 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${displayProgress}%` }}
                />
              </div>

              {/* 百分比显示 */}
              <p className="text-gray-400 text-xs text-center mt-2">
                {Math.round(displayProgress)}%
              </p>

              {/* 提示信息 */}
              <p className="text-gray-400 text-xs text-center mt-3">
                生成过程需要 30-60 秒，请耐心等待
              </p>
            </div>
          )}

          {/* 成功状态 */}
          {step === 'success' && (
            <div className="py-8">
              {/* 成功图标 */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
              </div>

              {/* 成功文本 */}
              <p className="text-gray-800 font-semibold text-lg text-center mb-2">
                生成完成！
              </p>
              <p className="text-gray-500 text-sm text-center">
                角色卡已成功生成，点击下方按钮查看
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
              最小化
            </Button>
          )}

          {step === 'success' && (
            <Button
              onClick={handleViewResult}
              className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <CheckCircle className="w-4 h-4" />
              查看角色卡
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

      {/* 悬浮进度框 - 当最小化且有进度时显示 */}
      <FloatingProgress
        isVisible={isMinimized && floatingStatus !== 'idle'}
        status={floatingStatus}
        progress={displayProgress}
        progressText={progressText}
        error={error}
        onExpand={handleExpand}
        onDismiss={handleDismissFloating}
      />
    </div>
  );
}
