"use client";

import React, { useState } from "react";
import FilterBar from "./FilterBar";
import ProductGrid from "./ProductGrid";
import productsData from "../data/products.json";
import type { Product } from "./ProductGrid";

const allProducts = (productsData as { products: Product[] }).products;

export default function HomeClient() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");

  const handleFilterChange = (filters: {
    category: string;
    viewMode: "grid" | "list";
    startDate: string;
    endDate: string;
    timeFrame: string;
    share: string;
  }) => {
    setViewMode(filters.viewMode);
    setActiveTab(filters.category);
  };

  // For now all tabs show the same products (can be filtered by category later)
  const filteredProducts = allProducts;

  return (
    <>
      <FilterBar onFilterChange={handleFilterChange} />
      <ProductGrid products={filteredProducts} viewMode={viewMode} />
    </>
  );
}
