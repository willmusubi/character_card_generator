import { useState } from 'react';
import { X, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useSettingsStore } from '../../store/useSettingsStore';
import { AIProvider, PROVIDER_CONFIGS } from '../../types/settings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings, setProvider } = useSettingsStore();
  const [showApiKey, setShowApiKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const providerOptions = Object.entries(PROVIDER_CONFIGS).map(([key, config]) => ({
    value: key,
    label: config.label,
  }));

  const currentConfig = PROVIDER_CONFIGS[settings.provider];

  const modelOptions = currentConfig.models.map((model) => ({
    value: model,
    label: model,
  }));

  const handleTestConnection = async () => {
    if (!settings.apiKey) {
      setTestStatus('error');
      return;
    }

    setTestStatus('testing');

    // 简单的连接测试 - 实际实现会根据不同 provider 调用 API
    try {
      // 模拟测试延迟
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setTestStatus('success');
      setTimeout(() => setTestStatus('idle'), 3000);
    } catch {
      setTestStatus('error');
      setTimeout(() => setTestStatus('idle'), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">AI 服务设置</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 表单内容 */}
        <div className="px-6 py-4 space-y-4">
          {/* 服务商选择 */}
          <Select
            label="AI 服务商"
            options={providerOptions}
            value={settings.provider}
            onChange={(value) => setProvider(value as AIProvider)}
          />

          {/* API Key */}
          <div className="relative">
            <Input
              label="API Key"
              type={showApiKey ? 'text' : 'password'}
              placeholder="输入你的 API Key"
              value={settings.apiKey}
              onChange={(e) => updateSettings({ apiKey: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* 模型选择 */}
          <Select
            label="模型"
            options={modelOptions}
            value={settings.model}
            onChange={(value) => updateSettings({ model: value })}
          />

          {/* 自定义端点 */}
          <Input
            label="API 端点（可选）"
            placeholder={currentConfig.defaultBaseUrl}
            value={settings.baseUrl}
            onChange={(e) => updateSettings({ baseUrl: e.target.value })}
          />

          {/* 搜索功能开关 */}
          {currentConfig.supportsSearch && (
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium text-gray-700">启用网络搜索</div>
                <div className="text-xs text-gray-500">生成时参考网络信息</div>
              </div>
              <button
                onClick={() => updateSettings({ enableSearch: !settings.enableSearch })}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  settings.enableSearch ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.enableSearch ? 'translate-x-5' : ''
                  }`}
                />
              </button>
            </div>
          )}

          {/* 提示信息 */}
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p>
              {currentConfig.supportsSearch
                ? `${currentConfig.label} 支持网络搜索功能，可获取更丰富的角色信息。`
                : `${currentConfig.label} 将依赖模型自身的知识库生成内容。`}
            </p>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTestConnection}
            disabled={testStatus === 'testing' || !settings.apiKey}
            className="gap-2"
          >
            {testStatus === 'testing' && (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            )}
            {testStatus === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
            {testStatus === 'error' && <AlertCircle className="w-4 h-4 text-red-600" />}
            {testStatus === 'idle' && '测试连接'}
            {testStatus === 'testing' && '测试中...'}
            {testStatus === 'success' && '连接成功'}
            {testStatus === 'error' && '连接失败'}
          </Button>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              取消
            </Button>
            <Button onClick={onClose}>保存</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
