"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus } from "lucide-react"
import { disciplineBands } from "@/constants/tech-tree-constants"

interface TechTreeControlsProps {
  zoomLevel: number
  selectedFilterTags: string[]
  onZoom: (direction: "in" | "out") => void
  onAddDevelopment: () => void
  onToggleFilterTag: (tag: string) => void
  onClearFilters: () => void
}

export default function TechTreeControls({
  zoomLevel,
  selectedFilterTags,
  onZoom,
  onAddDevelopment,
  onToggleFilterTag,
  onClearFilters,
}: TechTreeControlsProps) {
  return (
    <div className="bg-slate-200 dark:bg-slate-800 p-4 flex flex-col gap-2 border-b">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => onZoom("out")}>
            <Minus className="h-4 w-4" />
          </Button>
          <span className="mx-2 text-sm">{Math.round(zoomLevel * 100)}%</span>
          <Button variant="outline" size="icon" onClick={() => onZoom("in")}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div>
          <Button variant="materialFilled" onClick={onAddDevelopment} className="ml-4">
            <Plus className="h-4 w-4 mr-2" /> Add Development
          </Button>
        </div>
      </div>

      {/* Tag Legend */}
      <div className="flex flex-wrap gap-2 text-xs items-center">
        <div className="flex items-center">
          <span className="mr-2 font-medium">Filter by Tags:</span>
        </div>
        {selectedFilterTags.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-6 px-2 text-xs">
            Clear filters
          </Button>
        )}
        {Object.entries(disciplineBands).map(([bandName, band]) => (
          <div key={bandName} className="flex flex-wrap gap-1 mr-4">
            <span
              className={`font-medium ${
                band.color === "emerald"
                  ? "text-emerald-700"
                  : band.color === "blue"
                    ? "text-blue-700"
                    : band.color === "amber"
                      ? "text-amber-700"
                      : "text-purple-700"
              }`}
            >
              {bandName}:
            </span>
            {band.categories.slice(0, 3).map((category) => (
              <Badge
                key={category}
                variant={selectedFilterTags.includes(category) ? "default" : "secondary"}
                className={`text-xs cursor-pointer ${
                  selectedFilterTags.includes(category)
                    ? band.color === "emerald"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : band.color === "blue"
                        ? "bg-blue-600 hover:bg-blue-700"
                        : band.color === "amber"
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "bg-purple-600 hover:bg-purple-700"
                    : "hover:bg-slate-300 dark:hover:bg-slate-700"
                }`}
                onClick={() => onToggleFilterTag(category)}
              >
                {category}
              </Badge>
            ))}
            {band.categories.length > 3 && (
              <Badge
                variant="secondary"
                className="text-xs cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700"
                onClick={() => {
                  // Show a simple dropdown or modal with all tags
                  // For simplicity, we'll just log for now
                  console.log(`All ${bandName} tags:`, band.categories)
                }}
              >
                +{band.categories.length - 3} more
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
