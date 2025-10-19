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
import { ChevronDown, X } from "lucide-react"
import { disciplineBands } from "@/constants/tech-tree-constants"

interface TechTreeControlsProps {
  zoomLevel: number
  selectedFilterTags: string[]
  onZoomLevelChange: (value: number) => void
  onToggleFilterTag: (tag: string) => void
  onClearFilters: () => void
}

export default function TechTreeControls({
  zoomLevel,
  selectedFilterTags,
  onZoomLevelChange,
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

  const zoomPercent = Math.round(zoomLevel * 100)

  return (
    <div className="bg-slate-200 dark:bg-slate-800 p-4 flex flex-col gap-4 border-b">
      <div className="space-y-3">
        <div className="grid grid-cols-1 gap-4 md:w-fit md:[grid-template-columns:auto_auto] md:items-start md:justify-items-start">
          <div className="flex flex-col">
            <div className="flex flex-wrap">
              <span className="text-md font-semibold text-gray-900">Filter Tree by Tags:</span>
              <Badge
                variant="secondary"
                className={`${selectedFilterTags.length === 0 ? "invisible" : ""}`}
              >
                {selectedFilterTags.length} selected
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearFilters}
                className={`text-gray-600 bg-transparent ${selectedFilterTags.length === 0 ? "invisible pointer-events-none" : "hover:text-gray-900"}`}
              >
                Clear filters
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
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
                          onSelect={(event) => event.preventDefault()}
                          className="flex cursor-pointer items-center gap-2 rounded-md border border-transparent px-2 py-1.5 text-sm transition-colors data-[highlighted]:border-slate-300 data-[highlighted]:bg-slate-100 data-[state=checked]:border-slate-400 data-[state=checked]:bg-slate-100 dark:data-[highlighted]:border-slate-600 dark:data-[highlighted]:bg-slate-800 dark:data-[state=checked]:border-slate-500 dark:data-[state=checked]:bg-slate-800"
                        >
                          {category}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-md font-semibold text-gray-900">Zoom Control:</span>
            <div className="flex items-center gap-3 h-10 rounded-md shadow-sm">
              <input
                type="range"
                min={50}
                max={200}
                step={1}
                value={zoomPercent}
                onChange={(event) => onZoomLevelChange(Number(event.target.value) / 100)}
                className="h-1.5 w-40 cursor-pointer accent-blue-600"
                aria-label="Zoom level"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 w-12 text-right">{zoomPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-end min-h-6 overflow-x-auto whitespace-nowrap">
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
  )
}
