"use client";

import React, { useState } from "react";
import Image from "next/image";
import { createClient } from "../lib/supabase/client";
import { useAppContext } from "../context/AppContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
}

export default function AuthModal({ isOpen, onClose, locale }: AuthModalProps) {
  const { showToast } = useAppContext();
  const [view, setView] = useState<"options" | "email_signin" | "email_signup" | "verify_email">("options");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const supabase = createClient();

  const handleOAuth = async (provider: "google" | "facebook") => {
    setLoading(true);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/${locale}`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || `${provider} Sign-In failed.`);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (view === "email_signup") {
        // Password validation rules
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;
        if (!passwordRegex.test(password)) {
          throw new Error(
            "Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character."
          );
        }

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { 
              full_name: fullName,
              gender: gender,
              date_of_birth: dateOfBirth
            },
            emailRedirectTo: `${window.location.origin}/${locale}`,
          },
        });
        if (error) throw error;
        // Show the verify email screen — don't close the modal yet
        setView("verify_email");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        showToast("Sign in successful!");
        onClose();
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setErrorMsg(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setView("options");
    setErrorMsg("");
    setSuccessMsg("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop overlay */}
      <div className="absolute inset-0" onClick={handleClose} />

      {/* Modal Box matching Szwego/Topokay reference */}
      <div className="relative w-full max-w-[400px] max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl z-10 p-5 sm:p-6 animate-in zoom-in-95 duration-200 border border-gray-100 scrollbar-none">
        {/* Close Button Top-Left */}
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-700 bg-transparent border-none cursor-pointer p-1 transition-colors"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Top Logo & Title */}
        <div className="flex flex-col items-center text-center mt-1 mb-4">
          <Image
            src="/images/hypeafnancircularlogopic.png"
            alt="HypeAfnan Logo"
            width={56}
            height={56}
            className="w-14 h-14 object-contain mb-2"
            priority
          />
          <h2 className="text-lg font-bold text-gray-900 m-0">HypeAfnan</h2>
        </div>

        {/* Error / Success Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl text-center">
            {successMsg}
          </div>
        )}

        {/* VERIFY EMAIL VIEW */}
        {view === "verify_email" && (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#38c172" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 m-0">Verify your email</h3>
              <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
                We sent a confirmation link to<br />
                <span className="font-semibold text-gray-700">{email}</span>
              </p>
              <p className="text-xs text-gray-400 mt-3">Click the link in the email to activate your account. Check your spam folder if you don&apos;t see it.</p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-full h-11 bg-[#38c172] hover:bg-[#20b858] text-white font-medium text-sm rounded-xl transition-colors cursor-pointer"
            >
              Got it!
            </button>
          </div>
        )}

        {/* OPTIONS VIEW (Matching Topokay exact layout) */}
        {view === "options" && (
          <div className="flex flex-col gap-3.5">
            {/* Google Sign In */}
            <button
              onClick={() => handleOAuth("google")}
              disabled={loading}
              type="button"
              className="w-full h-[52px] px-5 flex items-center justify-start gap-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl text-[15px] font-medium text-gray-700 transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" className="shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>


            {/* Email Sign In Option */}
            <button
              onClick={() => setView("email_signin")}
              type="button"
              className="w-full h-[52px] px-5 flex items-center justify-start gap-4 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl text-[15px] font-medium text-gray-700 transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#38c172" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <span>Sign in with Email</span>
            </button>
          </div>
        )}

        {/* EMAIL SIGN IN / SIGN UP FORM */}
        {(view === "email_signin" || view === "email_signup") && (
          <form onSubmit={handleEmailAuth} className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => setView("options")}
              className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 bg-transparent border-none cursor-pointer self-start p-0 mb-0.5"
            >
              ← Back to all options
            </button>

            {view === "email_signup" && (
              <>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:border-[#38c172] transition-colors"
                />
                
                <select
                  required
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:border-[#38c172] transition-colors text-gray-700"
                >
                  <option value="" disabled>Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-gray-400 pl-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:border-[#38c172] transition-colors text-gray-700"
                  />
                </div>
              </>
            )}

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:border-[#38c172] transition-colors"
            />

            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (Min 8 chars, A-Z, a-z, 0-9, !@#)"
                className="w-full pl-3.5 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm outline-none focus:bg-white focus:border-[#38c172] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer p-1 flex items-center justify-center"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {view === "email_signup" && (
              <p className="text-[11px] text-gray-400 m-0 leading-tight">
                Must include 8+ chars, uppercase, lowercase, number & special char.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#38c172] hover:bg-[#20b858] text-white font-medium text-sm rounded-xl transition-colors cursor-pointer shadow-sm mt-1"
            >
              {loading ? "Processing..." : view === "email_signup" ? "Create Account" : "Sign In"}
            </button>

            <p className="text-center text-xs text-gray-500 mt-2">
              {view === "email_signin" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setView("email_signup")}
                    className="text-[#38c172] font-semibold underline bg-transparent border-none cursor-pointer p-0"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setView("email_signin")}
                    className="text-[#38c172] font-semibold underline bg-transparent border-none cursor-pointer p-0"
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
