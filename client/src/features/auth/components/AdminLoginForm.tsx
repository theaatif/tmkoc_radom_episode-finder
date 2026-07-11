import * as React from "react";
import { Lock, User as UserIcon, Eye, EyeOff } from "lucide-react";

interface AdminLoginFormProps {
  userIdInput: string;
  setUserIdInput: (val: string) => void;
  passwordInput: string;
  setPasswordInput: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  loginError: string | null;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function AdminLoginForm({
  userIdInput,
  setUserIdInput,
  passwordInput,
  setPasswordInput,
  showPassword,
  setShowPassword,
  loginError,
  loading,
  onSubmit,
}: AdminLoginFormProps) {
  return (
    <div className="max-w-md w-full mx-auto my-12 bg-[#f5f0e0] border border-[#e5e5e5] rounded-3xl p-8 shadow-[inset_1px_1px_3px_rgba(255,255,255,0.9),_0_8px_24px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col items-center mb-6">
        <div className="h-16 w-16 rounded-2xl bg-[#b8a4ed]/30 border border-[#b8a4ed]/50 flex items-center justify-center text-3xl mb-3 shadow-inner">
          🔒
        </div>
        <h2 className="text-xl font-extrabold text-[#0a0a0a] font-display">Bhide's Private Portal</h2>
        <p className="text-xs text-muted-text text-center mt-1">
          "Main Aatmaram Tukaram Bhide, iss society ka Ekmev Secretary!"
        </p>
      </div>
      
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-xs font-bold text-muted-text mb-1.5 uppercase tracking-wider">
            User ID
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              placeholder="Enter admin ID"
              className="w-full bg-[#fffaf0] border border-[#e5e5e5] rounded-xl px-4 py-2.5 pl-10 text-sm text-[#0a0a0a] outline-none focus:border-slate-400 transition-all font-medium"
            />
            <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-muted-text/75" />
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-bold text-muted-text mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-[#fffaf0] border border-[#e5e5e5] rounded-xl px-4 py-2.5 pl-10 pr-10 text-sm text-[#0a0a0a] outline-none focus:border-slate-400 transition-all font-medium"
            />
            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-text/75" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-muted-text/75 hover:text-[#0a0a0a] cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        
        {loginError && (
          <div className="bg-[#ff6b5a]/10 border border-[#ff6b5a]/30 text-brand-coral rounded-xl p-3 text-xs font-bold text-center">
            ⚠️ {loginError}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-[#0a0a0a] text-white hover:bg-zinc-800 py-3 rounded-xl text-sm font-bold shadow-md cursor-pointer transition-transform active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Verifying...
            </span>
          ) : (
            "Open Entry Book"
          )}
        </button>
      </form>
    </div>
  );
}
