"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { createClient } from "../lib/supabase/client";
import { useAppContext } from "../context/AppContext";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUserUpdate: (updatedUser: any) => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  onUserUpdate,
}: ProfileModalProps) {
  const { showToast } = useAppContext();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || user.email?.split("@")[0] || "");
      setAvatarUrl(user.user_metadata?.avatar_url || "");
    }
  }, [user]);

  if (!isOpen || !user) return null;

  // Helper to compress avatar image to crisp 400x400 JPEG (~80-120KB)
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 400; // Standard 400x400 avatar dimensions
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Compression failed"));
          },
          "image/jpeg",
          0.82 // 82% quality = super sharp & ~80KB-120KB size
        );
      };
      img.onerror = (err) => reject(err);
    });
  };

  // Handle Avatar Image Selection, Compression & Upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File size check (Max 5MB raw upload limit)
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image is too large! Please choose a file under 5MB.");
      return;
    }

    try {
      // Auto-compress image to ~100KB
      const compressedBlob = await compressImage(file);
      const compressedFile = new File([compressedBlob], `avatar-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      // Immediate local preview
      const previewUrl = URL.createObjectURL(compressedBlob);
      setAvatarUrl(previewUrl);

      // Upload to Supabase Storage 'avatars' bucket
      const filePath = `${user.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, compressedFile, { upsert: true });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          setAvatarUrl(publicUrlData.publicUrl);
        }
      } else {
        console.warn("Storage upload notice:", uploadError.message);
      }
    } catch (err: any) {
      console.error("Avatar error:", err);
      showToast("Failed to process image");
    }
  };

  // Save Profile Changes (Name & Avatar)
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          full_name: name,
          avatar_url: avatarUrl,
        },
      });

      if (error) throw error;

      onUserUpdate(data.user);
      showToast("Profile updated successfully!");
      setIsEditingName(false);
      onClose();
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Handle Password Reset Request
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      showToast("Password must be at least 8 characters");
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      showToast("Password changed successfully!");
      setShowPasswordChange(false);
      setNewPassword("");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Profile Card Container (Matching exact reference screenshot) */}
      <div className="relative w-full max-w-[500px] bg-white rounded-3xl shadow-2xl z-10 p-6 sm:p-10 animate-in zoom-in-95 duration-200 border border-gray-100 flex flex-col items-center">
        {/* Close Button Top-Right */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 bg-transparent border-none cursor-pointer p-1 transition-colors"
          aria-label="Close"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* 1. Large Avatar Badge with Camera Icon */}
        <div className="relative mb-8 mt-2">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-28 h-28 rounded-full bg-[#f3f4f6] flex items-center justify-center overflow-hidden cursor-pointer border-2 border-gray-100 shadow-inner group"
          >
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt="Profile Avatar"
                width={112}
                height={112}
                className="w-full h-full object-cover"
              />
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="#9ca3af">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
          </div>

          {/* Camera Badge Icon at Bottom Right (Matching screenshot) */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 w-8 h-8 bg-black hover:bg-gray-800 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md border-2 border-white transition-transform active:scale-95"
            title="Change Avatar"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* 2. Name Row Card (Matching screenshot) */}
        <div className="w-full bg-[#f9fafb] border border-gray-200/80 rounded-2xl p-4 flex items-center justify-between mb-8 transition-colors focus-within:bg-white focus-within:border-[#38c172]">
          <span className="text-sm font-medium text-gray-500">Name</span>

          <div className="flex items-center gap-2">
            {isEditingName ? (
              <input
                type="text"
                value={name}
                autoFocus
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingName(false)}
                onBlur={() => setIsEditingName(false)}
                className="text-right text-sm font-semibold text-gray-900 bg-white border border-[#38c172] rounded-lg px-2 py-1 outline-none"
              />
            ) : (
              <span
                onClick={() => setIsEditingName(true)}
                className="text-sm font-semibold text-gray-900 cursor-pointer hover:text-[#38c172] transition-colors"
              >
                {name || "Set Name"}
              </span>
            )}

            {/* Edit Pencil Icon (Matching screenshot) */}
            <button
              type="button"
              onClick={() => setIsEditingName(!isEditingName)}
              className="text-gray-400 hover:text-gray-700 bg-transparent border-none cursor-pointer p-0.5"
              title="Edit Name"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          </div>
        </div>

        {/* 3. Save Button (Matching screenshot) */}
        <button
          type="button"
          onClick={handleSaveProfile}
          disabled={loading}
          className="w-[140px] h-[42px] bg-[#d1fae5] hover:bg-[#a7f3d0] active:bg-[#6ee7b7] text-[#065f46] font-semibold text-sm rounded-xl transition-all cursor-pointer border-none shadow-2xs mb-4 flex items-center justify-center"
        >
          {loading ? "Saving..." : "Save"}
        </button>

        {/* 4. Change Password Link (Matching screenshot) */}
        {!showPasswordChange ? (
          <button
            type="button"
            onClick={() => setShowPasswordChange(true)}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline bg-transparent border-none cursor-pointer p-0"
          >
            Change password
          </button>
        ) : (
          <form
            onSubmit={handleChangePassword}
            className="w-full mt-2 flex flex-col items-center gap-2.5 animate-in fade-in duration-200"
          >
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password (min 8 chars)"
              className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={passwordLoading}
                className="px-4 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 cursor-pointer border-none"
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
              <button
                type="button"
                onClick={() => setShowPasswordChange(false)}
                className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-200 cursor-pointer border-none"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
