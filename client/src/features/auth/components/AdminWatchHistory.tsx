import * as React from "react";
import { Film, Play, Clock } from "lucide-react";
import { AdminStats, formatDate, getInitials, getInitialsColor } from "../hooks/useAdminDashboard";

interface AdminWatchHistoryProps {
  stats: AdminStats | null;
}

const formatDuration = (secs: number) => {
  if (!secs) return "0:00";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  
  const sStr = s.toString().padStart(2, "0");
  if (h > 0) {
    const mStr = m.toString().padStart(2, "0");
    return `${h}:${mStr}:${sStr}`;
  }
  return `${m}:${sStr}`;
};

export function AdminWatchHistory({ stats }: AdminWatchHistoryProps) {
  // Group the watch entries by user
  const groupedWatches = React.useMemo(() => {
    if (!stats?.recentWatches) return [];
    
    const groups: { 
      [key: string]: { 
        userName: string; 
        watches: typeof stats.recentWatches;
      } 
    } = {};
    
    stats.recentWatches.forEach((watch) => {
      const userId = watch.user?.id || "anonymous";
      const userName = watch.user?.name || "Anonymous User";
      
      if (!groups[userId]) {
        groups[userId] = {
          userName,
          watches: [],
        };
      }
      groups[userId].watches.push(watch);
    });
    
    return Object.entries(groups).map(([userId, group]) => ({
      userId,
      userName: group.userName,
      watches: group.watches,
    }));
  }, [stats?.recentWatches]);

  return (
    <div className="bg-[#f5f0e0] border border-[#e5e5e5] rounded-2xl p-6 flex flex-col">
      <h3 className="font-display text-lg text-[#0a0a0a] font-bold mb-6 flex items-center gap-2">
        <Film className="h-5 w-5 text-brand-coral" /> 🎬 Gokuldham Streaming Watch History (By Member)
      </h3>
      
      {groupedWatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupedWatches.map((group) => {
            const color = getInitialsColor(group.userName);
            return (
              <div 
                key={group.userId} 
                className="bg-white border border-slate-200/60 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] p-5 flex flex-col transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)] hover:scale-[1.01]"
              >
                {/* Member Header */}
                <div className="flex items-center gap-3 pb-4.5 border-b border-slate-100 mb-4">
                  <div className={`w-10 h-10 rounded-full ${color.bg} border flex items-center justify-center font-black text-xs shrink-0`}>
                    <span className={color.text}>{getInitials(group.userName)}</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-[#0a0a0a] truncate leading-tight">
                      {group.userName}
                    </h4>
                    <p className="text-[9px] text-muted-text font-semibold uppercase tracking-wider mt-0.5">
                      {group.watches.length} {group.watches.length === 1 ? "episode" : "episodes"} watched
                    </p>
                  </div>
                </div>

                {/* Watched Episodes List */}
                <div className="flex flex-col gap-3.5 flex-1 overflow-y-auto max-h-60 pr-1">
                  {group.watches.map((watch) => (
                    <div key={watch.id} className="flex flex-col gap-1 text-xs">
                      {/* Episode Title */}
                      <span className="font-bold text-slate-800 leading-tight">
                        {watch.episode?.title || "Unknown Episode"}
                      </span>
                      
                      {/* Metadata row */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                        {watch.episode?.episodeNumber !== null && watch.episode?.episodeNumber !== undefined && (
                          <span className="bg-brand-cyan/15 text-brand-cyan text-[8px] font-black uppercase px-1.5 py-0.5 rounded border border-brand-cyan/25 shrink-0">
                            Ep #{watch.episode.episodeNumber}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[9px] text-muted-text font-mono shrink-0">
                          <Play className="h-2.5 w-2.5 text-brand-coral shrink-0" />
                          Stopped at {formatDuration(watch.lastPositionSeconds)}
                        </span>
                        <span className="flex items-center gap-1 text-[9px] text-muted-text font-medium ml-auto">
                          <Clock className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                          {formatDate(watch.watchedAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-text text-center py-12">No watch history entries recorded yet.</p>
      )}
    </div>
  );
}
