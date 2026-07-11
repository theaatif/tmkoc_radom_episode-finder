import * as React from "react";
import { Clock, Monitor } from "lucide-react";
import { AdminStats, formatDate, parseUserAgent } from "../hooks/useAdminDashboard";

interface AdminEntryLogsProps {
  stats: AdminStats | null;
}

export function AdminEntryLogs({ stats }: AdminEntryLogsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left 1 Column: Most Frequent Visitors List */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="bg-[#f5f0e0] border border-[#e5e5e5] rounded-2xl p-6 flex flex-col">
          <h3 className="font-display text-lg text-[#0a0a0a] font-bold mb-4 flex items-center gap-2">
            <span>🏆</span> Frequent Visitors
          </h3>
          {stats?.frequentVisitors && stats.frequentVisitors.length > 0 ? (
            <div className="flex flex-col gap-3.5">
              {stats.frequentVisitors.map((visitor, idx) => (
                <div 
                  key={visitor.userId}
                  className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 shadow-[0_2px_6px_rgba(0,0,0,0.02)] transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={visitor.user.avatarUrl || "/api/placeholder/40/40"} 
                        alt={visitor.user.name} 
                        className="h-10 w-10 rounded-full object-cover border border-slate-200/50 bg-[#fffaf0]"
                      />
                      <span className="absolute -bottom-1 -right-1 bg-[#ffb084] text-[#0a0a0a] text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border border-white">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-[#0a0a0a] truncate leading-normal">
                        {visitor.user.name}
                      </h4>
                      <p className="text-[10px] text-muted-text truncate leading-tight">
                        {visitor.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end shrink-0 pl-2">
                    <span className="bg-[#b8a4ed]/30 text-[#0a0a0a] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#b8a4ed]/45">
                      {visitor.visitCount} visits
                    </span>
                    <span className="text-[8px] text-muted-text mt-1">
                      Last: {new Date(visitor.lastVisitedAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-text text-center py-8">No records available</p>
          )}
        </div>
      </div>

      {/* Right 2 Columns: Detailed Chronological Entry Log */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="bg-[#f5f0e0] border border-[#e5e5e5] rounded-2xl p-6 flex flex-col overflow-hidden">
          <h3 className="font-display text-lg text-[#0a0a0a] font-bold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-brand-cyan" /> Bhide's Chronological Register Log
          </h3>
          {stats?.recentVisits && stats.recentVisits.length > 0 ? (
            <div className="overflow-x-auto -mx-6">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-[#e5e5e5] bg-[#ebe6d6]/40">
                    <th className="text-[10px] font-black uppercase tracking-wider text-muted-text py-3 px-6">Visitor</th>
                    <th className="text-[10px] font-black uppercase tracking-wider text-muted-text py-3 px-6">Timestamp</th>
                    <th className="text-[10px] font-black uppercase tracking-wider text-muted-text py-3 px-6">IP Address</th>
                    <th className="text-[10px] font-black uppercase tracking-wider text-muted-text py-3 px-6">Device / Browser</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentVisits.map((visit) => (
                    <tr 
                      key={visit.id} 
                      className="border-b border-[#e5e5e5]/50 bg-transparent hover:bg-white/40 transition-colors"
                    >
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {visit.user ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={visit.user.avatarUrl || "/api/placeholder/24/24"}
                                alt={visit.user.name}
                                className="h-6 w-6 rounded-full object-cover border border-slate-200/50 bg-[#fffaf0]"
                              />
                              <div className="truncate">
                                <p className="text-xs font-bold text-[#0a0a0a] leading-normal truncate">
                                  {visit.user.name}
                                </p>
                                <p className="text-[9px] text-muted-text leading-tight truncate">
                                  {visit.user.email}
                                </p>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] text-[#0a0a0a]">
                                👽
                              </div>
                              <p className="text-xs font-bold text-muted-text">Anonymous User</p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-xs text-[#0a0a0a] font-medium">
                        {formatDate(visit.visitedAt)}
                      </td>
                      <td className="py-3.5 px-6 text-xs text-muted-text font-mono">
                        {visit.ip === "::1" || visit.ip === "127.0.0.1" ? "Localhost (Loopback)" : visit.ip}
                      </td>
                      <td className="py-3.5 px-6 text-xs text-muted-text font-medium truncate max-w-[150px]">
                        <div className="flex items-center gap-1.5">
                          <Monitor className="h-3 w-3 text-brand-cyan shrink-0" />
                          <span className="truncate">{parseUserAgent(visit.userAgent)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-muted-text text-center py-10">No recent entries found in the register.</p>
          )}
        </div>
      </div>
    </div>
  );
}
