"use client"

import { ChevronDown } from "lucide-react"
import { eras } from "@/constants/tech-tree-constants"
import { getEraPixelWidth, getTimelinePixelOffsetForYear, getTotalTimelineWidth } from "@/utils/tech-tree-utils"

interface TechTreeHeadersProps {
  collapsedCenturies: string[]
  collapsedEras: string[]
  onToggleEraCollapse: (eraId: string) => void
  showEraBanner?: boolean
  showBandLabels?: boolean
  bandLabelsLeft?: number
}

/**
 * Renders optional discipline band labels and an interactive era banner strip for the tech-tree timeline.
 *
 * The component optionally displays three left-aligned discipline band labels (STEM, Humanities, Social Studies)
 * and an era banner container whose width and each banner's position/size are computed from timeline utilities.
 * Each visible era banner shows a chevron, the era name, and a formatted year range (negative years shown as BCE).
 * Clicking an era banner toggles its collapsed state via the provided callback. Eras listed in `collapsedEras`
 * are not rendered; eras with a computed non-positive pixel width are also skipped.
 *
 * @param collapsedCenturies - IDs of centuries currently collapsed; used to compute overall timeline width and era sizes.
 * @param collapsedEras - IDs of eras currently collapsed; any era in this list will not render a banner.
 * @param onToggleEraCollapse - Called with an era's id when that era's banner is clicked.
 * @param showEraBanner - If true (default), render the era banner strip.
 * @param showBandLabels - If true (default), render the three discipline band labels at fixed vertical offsets.
 * @param bandLabelsLeft - Horizontal offset (in pixels) applied to the left position of the band labels (default -128).
 * @returns The component's JSX element.
 */
export default function TechTreeHeaders({ collapsedCenturies, collapsedEras, onToggleEraCollapse, showEraBanner = true, showBandLabels = true, bandLabelsLeft = -128 }: TechTreeHeadersProps) {
  return (
    <>
      {showBandLabels && (
        <>
          {/* Discipline Band Labels */}
          <div className="absolute top-[200px] -translate-y-1/2 font-bold text-lg text-emerald-700 z-10 bg-white dark:bg-slate-800 p-2 rounded shadow" style={{ left: bandLabelsLeft }}>
            STEM
            <div className="text-xs font-normal mt-1 max-w-[120px] text-emerald-600">Math, Physics, Engineering...</div>
          </div>
          <div className="absolute top-[400px] -translate-y-1/2 font-bold text-lg text-blue-700 z-10 bg-white dark:bg-slate-800 p-2 rounded shadow" style={{ left: bandLabelsLeft }}>
            Humanities
            <div className="text-xs font-normal mt-1 max-w-[120px] text-blue-600">Philosophy, Literature, Art...</div>
          </div>
          <div className="absolute top-[600px] -translate-y-1/2 font-bold text-lg text-amber-700 z-10 bg-white dark:bg-slate-800 p-2 rounded shadow" style={{ left: bandLabelsLeft }}>
            Social Studies
            <div className="text-xs font-normal mt-1 max-w-[120px] text-amber-600">History, Politics, Economics...</div>
          </div>
          {/* Removed 'Other' band label per requirements */}
        </>
      )}

      {showEraBanner && (
        <div
          className="relative"
          style={{ width: `${getTotalTimelineWidth(collapsedCenturies)}px` }}
        >
          {eras.map((era) => {
            const isCollapsed = collapsedEras.includes(era.id)
            // When an era is collapsed, do not render its banner stub/carrot.
            if (isCollapsed) return null
            const width = getEraPixelWidth(era, collapsedCenturies, collapsedEras)
            const left = getTimelinePixelOffsetForYear(era.startYear, collapsedCenturies)
            if (width <= 0) return null
            return (
              <div
                key={era.id}
                className={`${era.color} text-white p-4 font-bold text-center cursor-pointer flex items-center justify-center absolute`}
                style={{ left: `${left}px`, width: `${width}px`, minWidth: "0px" }}
                onClick={() => onToggleEraCollapse(era.id)}
                title={`${era.name}`}
              >
                <div className="flex items-center gap-2">
                  <ChevronDown className="h-5 w-5" />
                  <span>
                    {era.name} ({era.startYear < 0 ? `${Math.abs(era.startYear)} BCE` : era.startYear} - {era.endYear < 0 ? `${Math.abs(era.endYear)} BCE` : era.endYear})
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
