import { useState, useEffect } from 'react';
import { FileText, Loader2, ArrowLeft } from 'lucide-react';
import { api } from '../api/client';
import type { Changelog } from './ChangelogModal';

interface ChangelogWithReadStatus extends Changelog {
  isRead: boolean;
  readAt: string | null;
}

interface ChangelogListProps {
  onBack: () => void;
}

export function ChangelogList({ onBack }: ChangelogListProps) {
  const [changelogs, setChangelogs] = useState<ChangelogWithReadStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChangelog, setSelectedChangelog] = useState<ChangelogWithReadStatus | null>(null);

  useEffect(() => {
    api.getChangelogs()
      .then(({ changelogs: data }) => setChangelogs(data))
      .catch((err) => console.error('Failed to fetch changelogs:', err))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-10 h-10 text-violet-400 animate-spin" />
        <p className="mt-4 text-white/50 font-medium">Loading changelogs...</p>
      </div>
    );
  }

  if (selectedChangelog) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setSelectedChangelog(null)}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all updates
        </button>

        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/[0.06]">
            <div className="flex items-center gap-3 mb-2">
              {selectedChangelog.version && (
                <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-xs font-bold rounded">
                  v{selectedChangelog.version}
                </span>
              )}
              <span className="text-white/40 text-sm">{formatDate(selectedChangelog.createdAt)}</span>
            </div>
            <h2 className="text-2xl font-bold text-white">{selectedChangelog.title}</h2>
          </div>
          <div className="p-6">
            <div className="text-white/70 whitespace-pre-wrap leading-relaxed">
              {selectedChangelog.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">What's New</h2>
            <p className="text-sm text-white/40">All updates and changes</p>
          </div>
        </div>
      </div>

      {changelogs.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white/20" />
          </div>
          <p className="text-white/40 font-medium">No updates yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {changelogs.map((changelog) => (
            <button
              key={changelog.id}
              onClick={() => setSelectedChangelog(changelog)}
              className="w-full text-left p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                {changelog.version && (
                  <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-xs font-bold rounded">
                    v{changelog.version}
                  </span>
                )}
                {!changelog.isRead && (
                  <span className="px-2 py-0.5 bg-violet-500 text-white text-xs font-bold rounded">
                    NEW
                  </span>
                )}
                <span className="text-white/40 text-sm">{formatDate(changelog.createdAt)}</span>
              </div>
              <h3 className="text-white font-semibold">{changelog.title}</h3>
              <p className="text-white/50 text-sm mt-1 line-clamp-2">{changelog.content}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
