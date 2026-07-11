import * as React from "react";
import { AdminStats, getInitials, getInitialsColor } from "../hooks/useAdminDashboard";

interface AdminRegisteredMembersProps {
  stats: AdminStats | null;
}

export function AdminRegisteredMembers({ stats }: AdminRegisteredMembersProps) {
  return (
    <div className="bg-[#f5f0e0] border border-[#e5e5e5] rounded-2xl p-6 flex flex-col">
      <h3 className="font-display text-lg text-[#0a0a0a] font-bold mb-6 flex items-center gap-2">
        👥 Gokuldham Society Registered Members
      </h3>
      {stats?.allUsers && stats.allUsers.length > 0 ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-6 justify-items-center">
          {stats.allUsers.map((member) => {
            const color = getInitialsColor(member.name);
            return (
              <div 
                key={member.id} 
                className="flex flex-col items-center group cursor-default"
              >
                {/* Circular Avatar Badge */}
                <div className={`w-14 h-14 rounded-full ${color.bg} border-2 flex items-center justify-center shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:shadow-md`}>
                  <span className={`text-sm font-black tracking-wider ${color.text}`}>
                    {getInitials(member.name)}
                  </span>
                </div>
                {/* Member Name */}
                <span className="text-[10px] font-black text-[#0a0a0a] text-center mt-2 leading-tight line-clamp-2 max-w-[76px]">
                  {member.name}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-text text-center py-10">No members registered yet.</p>
      )}
    </div>
  );
}
