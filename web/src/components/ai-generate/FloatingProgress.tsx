import { Loader2, CheckCircle, XCircle, X, Maximize2 } from 'lucide-react';

export type GenerationStatus = 'idle' | 'generating' | 'success' | 'error';

interface FloatingProgressProps {
  isVisible: boolean;
  status: GenerationStatus;
  progress: number;
  progressText: string;
  error?: string;
  onExpand: () => void;
  onDismiss: () => void;
}

export function FloatingProgress({
  isVisible,
  status,
  progress,
  progressText,
  error,
  onExpand,
  onDismiss,
}: FloatingProgressProps) {
  if (!isVisible || status === 'idle') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-72">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {status === 'generating' && (
              <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-4 h-4 text-green-600" />
            )}
            {status === 'error' && (
              <XCircle className="w-4 h-4 text-red-600" />
            )}
            <span className="text-sm font-medium text-gray-700">
              {status === 'generating' && 'AI 生成中...'}
              {status === 'success' && '生成完成'}
              {status === 'error' && '生成失败'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {status === 'generating' && (
              <button
                onClick={onExpand}
                className="p-1 hover:bg-white/50 rounded transition-colors"
                title="展开详情"
              >
                <Maximize2 className="w-3.5 h-3.5 text-gray-500" />
              </button>
            )}
            {status !== 'generating' && (
              <button
                onClick={onDismiss}
                className="p-1 hover:bg-white/50 rounded transition-colors"
                title="关闭"
              >
                <X className="w-3.5 h-3.5 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* 内容区 */}
        <div className="px-3 py-2">
          {status === 'generating' && (
            <>
              <p className="text-xs text-gray-600 mb-2 truncate">
                {progressText || '正在生成角色卡...'}
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-8">{Math.round(progress)}%</span>
              </div>
            </>
          )}

          {status === 'success' && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-700">角色卡已生成完成</p>
              <button
                onClick={onExpand}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                查看
              </button>
            </div>
          )}

          {status === 'error' && (
            <div>
              <p className="text-xs text-red-600 line-clamp-2">{error || '生成失败'}</p>
              <button
                onClick={onExpand}
                className="mt-1 text-xs text-blue-600 hover:text-blue-700"
              >
                重试
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
