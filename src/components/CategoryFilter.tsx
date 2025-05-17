import { useState } from "react";
import { CATEGORIES } from "@/contexts/ListingsContext";
import { Button } from "@/components/ui/button";

type CategoryFilterProps = {
  onSelectCategory: (category: string) => void;
  selectedCategory: string;
};

const CategoryFilter = ({
  onSelectCategory,
  selectedCategory,
}: CategoryFilterProps) => {
  return (
    <div className="overflow-x-auto py-4">
      <div className="flex space-x-2 min-w-max">
        <Button
          variant={selectedCategory === "All" ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectCategory("All")}
          className="rounded-full"
        >
          All
        </Button>

        {CATEGORIES.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectCategory(category)}
            className="rounded-full"
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
