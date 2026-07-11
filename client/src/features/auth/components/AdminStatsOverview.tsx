import * as React from "react";
import { Activity, TrendingUp, Users } from "lucide-react";
import { AdminStats } from "../hooks/useAdminDashboard";

interface AdminStatsOverviewProps {
  stats: AdminStats | null;
}

export function AdminStatsOverview({ stats }: AdminStatsOverviewProps) {
  const totalVisits = stats?.recentVisits.length || 0;
  const uniqueUsersCount = stats?.allUsers.length || 0;
  const topVisitor = stats?.frequentVisitors[0];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Card 1: Lavender (Total Logs) */}
      <div className="bg-[#b8a4ed] text-[#0a0a0a] rounded-2xl p-6 border border-[#a38ee0] shadow-sm flex flex-col justify-between h-40 transition-all hover:scale-[1.01]">
        <div className="flex justify-between items-start">
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#0a0a0a]/70">
            Total Recorded Visits
          </span>
          <div className="p-2 bg-white/20 rounded-xl">
            <Activity className="h-5 w-5 text-[#0a0a0a]" />
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight font-display mb-1">{totalVisits}</h2>
          <p className="text-xs text-[#0a0a0a]/80 font-medium">Unique logins and session restores</p>
        </div>
      </div>

      {/* Card 2: Teal (Unique Gokuldham Members) */}
      <div className="bg-[#1a3a3a] text-white rounded-2xl p-6 border border-[#122828] shadow-sm flex flex-col justify-between h-40 transition-all hover:scale-[1.01]">
        <div className="flex justify-between items-start">
          <span className="text-[11px] font-bold tracking-wider uppercase text-white/70">
            Unique Society Members
          </span>
          <div className="p-2 bg-white/10 rounded-xl">
            <Users className="h-5 w-5 text-white" />
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-extrabold tracking-tight font-display mb-1">{uniqueUsersCount}</h2>
          <p className="text-xs text-white/85 font-medium">Distinct users registered in society</p>
        </div>
      </div>

      {/* Card 3: Pink (Most Active Resident) */}
      <div className="bg-[#ff4d8b] text-white rounded-2xl p-6 border border-[#e03d76] shadow-sm flex flex-col justify-between h-40 transition-all hover:scale-[1.01] sm:col-span-2 lg:col-span-1">
        <div className="flex justify-between items-start">
          <span className="text-[11px] font-bold tracking-wider uppercase text-white/70">
            Most Active Resident
          </span>
          <div className="p-2 bg-white/15 rounded-xl">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
        </div>
        <div>
          {topVisitor ? (
            <>
              <div className="flex items-center gap-2.5 mb-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={topVisitor.user.avatarUrl || "/api/placeholder/32/32"}
                  alt={topVisitor.user.name}
                  className="h-8 w-8 rounded-full border border-white/20 object-cover bg-white"
                />
                <div className="truncate">
                  <h3 className="text-lg font-bold leading-tight truncate">{topVisitor.user.name}</h3>
                  <p className="text-[10px] text-white/80 leading-none truncate">{topVisitor.user.email}</p>
                </div>
              </div>
              <p className="text-xs text-white/85 font-medium">
                Visited <span className="font-bold text-white underline">{topVisitor.visitCount} times</span>
              </p>
            </>
          ) : (
            <p className="text-xs text-white/80 font-medium">No visits recorded yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
