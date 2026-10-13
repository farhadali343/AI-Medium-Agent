"use client";

import React, { useState } from "react";
import { X, LogIn, UserPlus, LogOut, User as UserIcon, Mail, Lock, Feather, Folder as FolderIcon, Bookmark } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const {
    user,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInAsGuest,
    signOut,
    savedArticles,
    folders,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password, name);
      } else {
        await signInWithEmail(email, password);
      }
      onClose();
    } catch (err: unknown) {
      console.error("Auth error:", err);
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      setError(msg.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: unknown) {
      console.error("Google auth error:", err);
      const msg = err instanceof Error ? err.message : "Google sign-in failed.";
      setError(msg.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInAsGuest();
      onClose();
    } catch (err: unknown) {
      console.error("Guest auth error:", err);
      const msg = err instanceof Error ? err.message : "Guest sign-in failed.";
      setError(msg.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const favoritesCount = savedArticles.filter((a) => a.isFavorite).length;

  return (
    <div className="fixed inset-0 z-50 bg-[#20252D]/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E6E9ED] rounded-xl w-full max-w-md shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E6E9ED] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EAF2ED] border border-[#C8DCD1] flex items-center justify-center text-[#426B5A]">
              <UserIcon className="w-4 h-4 text-[#426B5A]" />
            </div>
            <h3 className="font-semibold text-[#20252D] text-base">
              {user ? "Writer Profile & Cloud Account" : mode === "signin" ? "Sign In to Account" : "Create Writer Account"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#687180] hover:text-[#20252D] hover:bg-[#F0F3F5] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile View if logged in */}
        {user ? (
          <div className="p-6 space-y-5 bg-white">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-[#EAF2ED] border border-[#C8DCD1] flex items-center justify-center text-[#426B5A] text-lg font-bold">
                {user.displayName ? user.displayName[0].toUpperCase() : user.email ? user.email[0].toUpperCase() : "W"}
              </div>
              <div className="space-y-0.5">
                <div className="font-semibold text-[#20252D] text-base">
                  {user.displayName || (user.isAnonymous ? "Guest Writer" : "Writer")}
                </div>
                <div className="text-xs text-[#687180] font-mono">
                  {user.email || "Guest Session"}
                </div>
                {user.isAnonymous && (
                  <span className="text-[11px] text-[#B47D18]">
                    Anonymous session · Data saved locally & cloud
                  </span>
                )}
              </div>
            </div>

            {/* Account Metrics Grid */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 bg-[#FAFBFC] border border-[#E6E9ED] rounded-xl text-center">
                <div className="text-xs text-[#687180]">Articles</div>
                <div className="text-base font-bold text-[#20252D] font-mono mt-0.5">
                  {savedArticles.length}
                </div>
              </div>

              <div className="p-3 bg-[#FAFBFC] border border-[#E6E9ED] rounded-xl text-center">
                <div className="text-xs text-[#687180]">Favorites</div>
                <div className="text-base font-bold text-[#B47D18] font-mono mt-0.5">
                  {favoritesCount}
                </div>
              </div>

              <div className="p-3 bg-[#FAFBFC] border border-[#E6E9ED] rounded-xl text-center">
                <div className="text-xs text-[#687180]">Folders</div>
                <div className="text-base font-bold text-[#426B5A] font-mono mt-0.5">
                  {folders.length}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E6E9ED] flex justify-between items-center">
              <span className="text-xs text-[#687180]">
                Firestore Cloud Storage Active
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FDF2F2] hover:bg-[#FCE8E8] text-[#C53929] text-xs font-medium rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Sign Up Form */
          <div className="p-6 space-y-4 bg-white">
            <div className="flex bg-[#F0F3F5] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  mode === "signin"
                    ? "bg-white text-[#20252D] shadow-xs"
                    : "text-[#687180] hover:text-[#20252D]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                  mode === "signup"
                    ? "bg-white text-[#20252D] shadow-xs"
                    : "text-[#687180] hover:text-[#20252D]"
                }`}
              >
                Sign Up
              </button>
            </div>

            {error && (
              <div className="p-3 bg-[#FDF2F2] border border-[#F5C2C2] rounded-xl text-xs text-[#C53929]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-medium text-[#20252D] mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex River"
                    className="w-full px-3 py-2 bg-[#FAFBFC] border border-[#E6E9ED] rounded-lg text-xs text-[#20252D] outline-none focus:border-[#426B5A]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#20252D] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  required
                  className="w-full px-3 py-2 bg-[#FAFBFC] border border-[#E6E9ED] rounded-lg text-xs text-[#20252D] outline-none focus:border-[#426B5A]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#20252D] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-3 py-2 bg-[#FAFBFC] border border-[#E6E9ED] rounded-lg text-xs text-[#20252D] outline-none focus:border-[#426B5A]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#426B5A] hover:bg-[#345545] text-white font-medium text-xs rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Processing..." : mode === "signin" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="relative my-3 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E6E9ED]"></div>
              </div>
              <span className="relative px-3 bg-white text-[11px] text-[#89919E]">
                or instant access
              </span>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full py-2 px-3 bg-white hover:bg-[#F7F8FA] border border-[#E6E9ED] hover:border-[#D1D6DE] text-[#20252D] rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={handleGuest}
                disabled={loading}
                className="w-full py-2 px-3 bg-[#F0F3F5] hover:bg-[#E6E9ED] text-[#20252D] rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Continue as Guest (Instant 1-Click)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
