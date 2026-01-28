import { X } from 'lucide-react';

export interface Changelog {
  id: string;
  version: string | null;
  title: string;
  content: string;
  createdAt: string;
}

interface ChangelogModalProps {
  changelog: Changelog;
  onClose: () => void;
  onMarkRead?: () => void;
  showAllButton?: boolean;
  onViewAll?: () => void;
}

export function ChangelogModal({ changelog, onClose, onMarkRead, showAllButton, onViewAll }: ChangelogModalProps) {
  const handleClose = () => {
    onMarkRead?.();
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-zinc-900 border border-white/10 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              {changelog.version && (
                <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-xs font-bold rounded">
                  v{changelog.version}
                </span>
              )}
              <span className="text-white/40 text-sm">{formatDate(changelog.createdAt)}</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">{changelog.title}</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[50vh]">
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="text-white/70 whitespace-pre-wrap">{changelog.content}</div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-white/10">
          {showAllButton && onViewAll && (
            <button
              onClick={() => {
                onMarkRead?.();
                onViewAll();
              }}
              className="px-4 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-lg font-medium text-sm transition-colors"
            >
              View All Updates
            </button>
          )}
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium text-sm transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
