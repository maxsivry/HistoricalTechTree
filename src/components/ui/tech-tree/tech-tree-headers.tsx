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
