"use client";

import React, { useState } from "react";
import Image from "next/image";
import categoriesData from "../data/categories.json";

interface Tag {
  tagId: number;
  tagName: string;
  tagImage: string;
  cdnImage?: string;
  itemCount: number;
}

interface CategoryGroup {
  groupId: number;
  groupName: string;
  order: number;
  tags: Tag[];
}

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale: string;
  onSelectCategory: (groupName: string, tagId?: number, tagName?: string) => void;
}

const groups = categoriesData as CategoryGroup[];

export default function CategoryModal({ isOpen, onClose, locale, onSelectCategory }: CategoryModalProps) {
  const [selectedGroupIdx, setSelectedGroupIdx] = useState(0);

  if (!isOpen) return null;

  const currentGroup = groups[selectedGroupIdx] || groups[0];

  return (
    <div className="fixed inset-0 z-999 flex flex-col bg-white overflow-hidden">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#eaeaea] bg-white shrink-0 h-13.5">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-[15px] font-medium text-gray-700 hover:text-gray-900 bg-transparent border-none cursor-pointer p-0"
        >
          <span className="text-[20px] leading-none">✕</span>
          <span>Close</span>
        </button>

        <span className="text-[17px] font-semibold text-gray-900">Categories</span>

        <button
          onClick={() => {
            onSelectCategory("all");
            onClose();
          }}
          className="text-[14px] text-[#38c172] font-medium bg-transparent border-none cursor-pointer"
        >
          MultiSelect
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-27.5 sm:w-37.5 bg-[#f5f5f7] overflow-y-auto shrink-0 border-r border-[#e5e7eb]">
          {groups.map((group, idx) => {
            const isSelected = idx === selectedGroupIdx;
            return (
              <button
                key={group.groupId}
                onClick={() => setSelectedGroupIdx(idx)}
                className={`w-full text-left px-3 sm:px-4 py-3.5 text-[13px] sm:text-[14px] leading-tight cursor-pointer transition-colors border-none block relative ${
                  isSelected
                    ? "bg-white text-[#38c172] font-semibold"
                    : "bg-transparent text-gray-600 hover:bg-[#eaeaea] font-medium"
                }`}
              >
                {isSelected && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#38c172]" />
                )}
                {group.groupName}
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
            <h2 className="text-[16px] font-bold text-gray-900 m-0">{currentGroup.groupName}</h2>
            <button
              onClick={() => {
                onSelectCategory(currentGroup.groupName);
                onClose();
              }}
              className="flex items-center gap-1 text-[13px] text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
            >
              <span>All {currentGroup.groupName}</span>
              <span>›</span>
            </button>
          </div>

          {/* Grid of Sub-categories */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4">
            {currentGroup.tags.map((tag) => (
              <div
                key={tag.tagId}
                onClick={() => {
                  onSelectCategory(currentGroup.groupName, tag.tagId, tag.tagName);
                  onClose();
                }}
                className="flex flex-col items-center cursor-pointer group transition-transform duration-150 active:scale-95"
              >
                <div className="w-21 h-21 sm:w-25 sm:h-25 rounded-lg bg-[#f8f9fa] border border-gray-100 flex items-center justify-center overflow-hidden mb-2 relative group-hover:border-[#38c172] transition-colors">
                  {tag.tagImage ? (
                    <Image
                      src={tag.tagImage}
                      alt={tag.tagName}
                      width={100}
                      height={100}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-[10px]">
                      {tag.tagName.substring(0, 3)}
                    </div>
                  )}
                </div>
                <span className="text-[12px] sm:text-[13px] text-gray-800 text-center font-normal line-clamp-2 leading-tight group-hover:text-[#38c172] transition-colors">
                  {tag.tagName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
