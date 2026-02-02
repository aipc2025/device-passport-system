import { RefreshCw } from 'lucide-react';
import { useServiceWorker } from '../../hooks/usePWA';

export function UpdatePrompt() {
  const { updateAvailable, updateServiceWorker } = useServiceWorker();

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-blue-600 text-white rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1">新版本可用</h3>
            <p className="text-sm text-blue-100 mb-3">
              点击更新以获取最新功能和修复
            </p>
            <button
              onClick={updateServiceWorker}
              className="w-full px-4 py-2 bg-white text-blue-600 text-sm font-medium rounded-md hover:bg-blue-50 transition-colors"
            >
              立即更新
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
