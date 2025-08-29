"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Minus, ChevronDown, X } from "lucide-react"
import { disciplineBands } from "@/constants/tech-tree-constants"

interface TechTreeControlsProps {
  zoomLevel: number
  selectedFilterTags: string[]
  onZoom: (direction: "in" | "out") => void
  onAddDevelopment: () => void
  onToggleFilterTag: (tag: string) => void
  onClearFilters: () => void
}

/**
 * Controls UI for the tech tree: zoom controls, "Add Development" action, and tag-based filters.
 *
 * Renders zoom in/out buttons with the current zoom percentage, an "Add Development" button, a
 * per-band dropdown list of tag checkboxes, and an "Active" area showing selected tags as removable
 * colored badges. Interactions call the corresponding callbacks passed via props.
 *
 * @param zoomLevel - Current zoom level (0–1), displayed as a rounded percentage.
 * @param selectedFilterTags - List of currently selected tag strings shown in the active badges and used to set checkbox states.
 * @param onZoom - Called with "in" or "out" when the zoom buttons are pressed.
 * @param onAddDevelopment - Called when the Add Development button is clicked.
 * @param onToggleFilterTag - Called with a tag string to toggle that tag's selection (used by checkboxes and active badges).
 * @param onClearFilters - Called to clear all selected filter tags.
 */
export default function TechTreeControls({
  zoomLevel,
  selectedFilterTags,
  onZoom,
  onAddDevelopment,
  onToggleFilterTag,
  onClearFilters,
}: TechTreeControlsProps) {
  const getSelectedCount = (bandName: string) => {
    const band = disciplineBands[bandName as keyof typeof disciplineBands]
    return band.categories.filter((category) => selectedFilterTags.includes(category)).length
  }

  const getColorClasses = (color: string, selected = false) => {
    const colorMap = {
      emerald: {
        text: "text-emerald-700",
        bg: selected ? "bg-emerald-600 hover:bg-emerald-700" : "hover:bg-slate-300 dark:hover:bg-slate-700",
      },
      blue: {
        text: "text-blue-700",
        bg: selected ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-slate-300 dark:hover:bg-slate-700",
      },
      amber: {
        text: "text-amber-700",
        bg: selected ? "bg-amber-600 hover:bg-amber-700" : "hover:bg-slate-300 dark:hover:bg-slate-700",
      },
      purple: {
        text: "text-purple-700",
        bg: selected ? "bg-purple-600 hover:bg-purple-700" : "hover:bg-slate-300 dark:hover:bg-slate-700",
      },
    } as const
    return colorMap[(color as keyof typeof colorMap) || "purple"]
  }

  return (
    <div className="bg-slate-200 dark:bg-slate-800 p-4 flex flex-col gap-4 border-b">
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

      <div className="mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-md font-semibold pb-2 text-gray-900">Filter Tree by Tags:</span>
                <Badge
                  variant="secondary"
                  className={`ml-2 ${selectedFilterTags.length === 0 ? "invisible" : ""}`}
                >
                  {selectedFilterTags.length} selected
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className={`text-gray-600 bg-transparent ${selectedFilterTags.length === 0 ? "invisible pointer-events-none" : "hover:text-gray-900"}`}
              >
                Clear filters
              </Button>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-wrap gap-3 flex-1">
                {Object.entries(disciplineBands).map(([bandName, band]) => {
                  const selectedCount = getSelectedCount(bandName)
                  const colorClasses = getColorClasses(band.color)

                  return (
                    <DropdownMenu key={bandName}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="h-10 px-4 justify-between min-w-[120px] bg-transparent">
                          <span className="flex items-center gap-2">
                            <span className={colorClasses.text}>{bandName}</span>
                            {selectedCount > 0 && (
                              <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                                {selectedCount}
                              </Badge>
                            )}
                          </span>
                          <ChevronDown className="h-4 w-4 ml-2" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="start">
                        <DropdownMenuLabel className={colorClasses.text}>{bandName}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {band.categories.map((category) => (
                          <DropdownMenuCheckboxItem
                            key={category}
                            checked={selectedFilterTags.includes(category)}
                            onCheckedChange={() => onToggleFilterTag(category)}
                          >
                            {category}
                          </DropdownMenuCheckboxItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )
                })}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 max-w-[40%] justify-end min-h-6 overflow-x-auto whitespace-nowrap">
                <span className={`text-sm font-medium text-gray-700 ${selectedFilterTags.length === 0 ? "invisible" : ""}`}>
                  Active:
                </span>
                <div className="flex gap-2 justify-end">
                  {selectedFilterTags.map((tag) => {
                    const bandEntry = Object.entries(disciplineBands).find(([, band]) => band.categories.includes(tag))
                    const bandColor = bandEntry ? bandEntry[1].color : "purple"
                    const colorClasses = getColorClasses(bandColor, true)

                    return (
                      <Badge
                        key={tag}
                        variant={selectedFilterTags.includes(tag) ? "default" : "secondary"}
                        className={`text-xs cursor-pointer ${colorClasses.bg}`}
                        onClick={() => onToggleFilterTag(tag)}
                      >
                        {tag}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    )
                  })}
                </div>
              </div>
            </div>
      </div>
    </div>
  )
}
