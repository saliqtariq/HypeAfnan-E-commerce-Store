"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";

type TabType = "all" | "new" | "video" | "photos" | "payments" | "dispatched";

interface FilterBarProps {
  onFilterChange?: (filters: {
    category: TabType;
    viewMode: "grid" | "list";
    startDate: string;
    endDate: string;
    timeFrame: string;
    share: string;
  }) => void;
}

const FilterBar = React.memo(function FilterBar({ onFilterChange }: FilterBarProps) {
  const t = useTranslations("filterBar");

  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAllDropdownOpen, setIsAllDropdownOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<string>("");
  const [selectedShare, setSelectedShare] = useState<string>("");

  // Top-level tabs (Video & Photos moved into dropdown)
  const mainTabs: { key: TabType; label: string }[] = [
    { key: "all", label: t("tabs.all") },
    { key: "new", label: t("tabs.new") },
    { key: "payments", label: t("tabs.payments") },
    { key: "dispatched", label: t("tabs.dispatched") },
  ];

  // Dropdown items under "All"
  const allDropdownItems: { key: TabType; label: string; icon: React.ReactNode }[] = [
    {
      key: "video",
      label: t("tabs.video"),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      ),
    },
    {
      key: "photos",
      label: t("tabs.photos"),
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      ),
    },
  ];

  const timeFrameKeys = [
    { key: "today", label: t("drawer.today") },
    { key: "yesterday", label: t("drawer.yesterday") },
    { key: "thisMonth", label: t("drawer.thisMonth") },
    { key: "lastMonth", label: t("drawer.lastMonth") },
    { key: "thisYear", label: t("drawer.thisYear") },
    { key: "lastYear", label: t("drawer.lastYear") },
  ];

  const shareOptions = [
    { key: "neverShared", label: t("drawer.neverShared") },
    { key: "shared", label: t("drawer.shared") },
  ];

  const triggerFilterChange = (overrides = {}) => {
    onFilterChange?.({
      category: activeTab,
      viewMode,
      startDate,
      endDate,
      timeFrame: selectedTimeFrame,
      share: selectedShare,
      ...overrides,
    });
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsAllDropdownOpen(false);
    triggerFilterChange({ category: tab });
  };

  const handleViewModeToggle = () => {
    const nextMode = viewMode === "grid" ? "list" : "grid";
    setViewMode(nextMode);
    triggerFilterChange({ viewMode: nextMode });
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setSelectedTimeFrame("");
    setSelectedShare("");
    triggerFilterChange({ startDate: "", endDate: "", timeFrame: "", share: "" });
  };

  const handleConfirm = () => {
    setIsFilterOpen(false);
    triggerFilterChange();
  };

  const isAllGroupActive = activeTab === "all" || activeTab === "video" || activeTab === "photos";

  return (
    <div className="w-full px-5 sm:px-8 py-4">
      {/* Navigation and Action Icons Bar */}
      <div className="flex items-center justify-between border-b border-[#eaeaea] pb-2">
        {/* Left Tabs */}
        <div className="flex items-center gap-6 sm:gap-8">
          {/* ALL tab with dropdown chevron */}
          <div className="relative">
            <div className="flex items-center gap-1">
              {/* All label */}
              <button
                onClick={() => handleTabChange("all")}
                className={`relative pb-2 text-[16px] sm:text-[17px] text-black transition-colors border-none bg-transparent cursor-pointer ${
                  isAllGroupActive ? "font-semibold" : "font-normal"
                }`}
              >
                {t("tabs.all")}
                {isAllGroupActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.75 bg-[#38c172] rounded-full" />
                )}
              </button>

              {/* Chevron toggle */}
              <button
                onClick={() => setIsAllDropdownOpen((prev) => !prev)}
                className="pb-1 bg-transparent border-none cursor-pointer text-[#6b7280] hover:text-black transition-colors flex items-center"
                aria-label="Show more filters"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transform: isAllDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            {/* Dropdown menu */}
            {isAllDropdownOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsAllDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl shadow-xl border border-[#e5e7eb] overflow-hidden min-w-[140px]">
                  {allDropdownItems.map(({ key, label, icon }) => {
                    const isActive = activeTab === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleTabChange(key)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-[14.5px] text-left transition-colors cursor-pointer border-none ${
                          isActive
                            ? "bg-[#f0fdf4] text-[#16a34a] font-semibold"
                            : "bg-white text-[#374151] hover:bg-[#f9fafb]"
                        }`}
                      >
                        <span className={isActive ? "text-[#16a34a]" : "text-[#6b7280]"}>
                          {icon}
                        </span>
                        {label}
                        {isActive && (
                          <span className="ml-auto">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Remaining top-level tabs: New, Payments, Dispatched */}
          {mainTabs.slice(1).map(({ key, label }) => {
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                className={`relative pb-2 text-[16px] sm:text-[17px] text-black transition-colors border-none bg-transparent cursor-pointer ${
                  isActive ? "font-semibold" : "font-normal"
                }`}
              >
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.75 bg-[#38c172] rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right View & Filter Icons */}
        <div className="flex items-center gap-5 text-[#374151]">
          {/* Grid Layout Icon */}
          <button
            onClick={handleViewModeToggle}
            className="bg-transparent border-none cursor-pointer p-0 text-[#374151] hover:text-black transition-colors"
            aria-label="Toggle View"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 20 20"
              fill="none"
              stroke="#374151"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2.5" y="2.5" width="6.5" height="6.5" rx="1.2" />
              <rect x="11" y="2.5" width="6.5" height="6.5" rx="1.2" />
              <rect x="2.5" y="11" width="6.5" height="6.5" rx="1.2" />
              <rect x="11" y="11" width="6.5" height="6.5" rx="1.2" />
            </svg>
          </button>

          {/* Filter Funnel Icon */}
          <button
            onClick={() => setIsFilterOpen(true)}
            className="bg-transparent border-none cursor-pointer p-0 text-[#374151] hover:text-black transition-colors relative"
            aria-label="Open Filter Modal"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#374151"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            {(selectedTimeFrame || selectedShare || startDate || endDate) && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#38c172] rounded-full border border-white" />
            )}
          </button>
        </div>
      </div>

      {/* Filter Right Slide-Over Drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-1000 flex justify-end bg-black/40 transition-opacity">
          <div className="absolute inset-0" onClick={() => setIsFilterOpen(false)} />
          <div className="relative w-full max-w-105 h-full bg-white shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300 border-l border-[#e5e7eb]">
            {/* Drawer Header */}
            <div>
              <div className="relative flex items-center justify-between p-5 border-b border-[#f3f4f6]">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="bg-transparent border-none cursor-pointer text-[#374151] hover:text-black p-1 transition-colors"
                  aria-label="Close Filter"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                <h3 className="text-[18px] font-semibold text-[#111827] m-0 absolute left-1/2 -translate-x-1/2">
                  {t("drawer.title")}
                </h3>
              </div>

              {/* Drawer Body */}
              <div className="p-6 flex flex-col gap-6 overflow-y-auto">
                {/* Time Frame Section */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-[14px] font-bold text-[#111827] m-0">{t("drawer.timeFrame")}</h4>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder={t("drawer.startDate")}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-full text-[13.5px] text-center text-[#374151] placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#38c172] focus:border-[#38c172]"
                    />
                    <span className="text-[#9ca3af] font-medium">-</span>
                    <input
                      type="text"
                      placeholder={t("drawer.endDate")}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-3 bg-[#f9fafb] border border-[#e5e7eb] rounded-full text-[13.5px] text-center text-[#374151] placeholder-[#9ca3af] focus:outline-none focus:ring-1 focus:ring-[#38c172] focus:border-[#38c172]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2.5 mt-1">
                    {timeFrameKeys.map(({ key, label }) => {
                      const isSelected = selectedTimeFrame === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedTimeFrame(isSelected ? "" : key)}
                          className={`py-3 px-2.5 rounded-full text-[13px] transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-[#38c172] text-white font-medium border border-[#38c172]"
                              : "bg-[#f9fafb] text-[#374151] hover:bg-[#f3f4f6] border border-[#e5e7eb]"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Share Section */}
                <div className="flex flex-col gap-3 pt-4 border-t border-[#f3f4f6]">
                  <h4 className="text-[14px] font-bold text-[#111827] m-0">{t("drawer.share")}</h4>
                  <div className="flex gap-2.5">
                    {shareOptions.map(({ key, label }) => {
                      const isSelected = selectedShare === key;
                      return (
                        <button
                          key={key}
                          onClick={() => setSelectedShare(isSelected ? "" : key)}
                          className={`py-3 px-5 rounded-full text-[13px] transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-[#38c172] text-white font-medium border border-[#38c172]"
                              : "bg-[#f9fafb] text-[#374151] hover:bg-[#f3f4f6] border border-[#e5e7eb]"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-5 bg-white border-t border-[#f3f4f6] grid grid-cols-2 gap-3">
              <button
                onClick={handleReset}
                className="w-full py-3.5 bg-[#f9fafb] text-[#374151] hover:bg-[#f3f4f6] font-medium rounded-xl text-[14.5px] border border-[#e5e7eb] cursor-pointer transition-colors"
              >
                {t("drawer.reset")}
              </button>
              <button
                onClick={handleConfirm}
                className="w-full py-3.5 bg-[#38c172] hover:bg-[#2dce89] text-white font-medium rounded-xl text-[14.5px] border-none cursor-pointer transition-colors"
              >
                {t("drawer.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default FilterBar;
