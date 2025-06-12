"use client"

import { ChevronRight, ChevronDown } from "lucide-react"
import { eras, centuries } from "@/constants/tech-tree-constants"

interface TechTreeHeadersProps {
  collapsedCenturies: string[]
  onToggleCenturyCollapse: (centuryId: string) => void
}

export default function TechTreeHeaders({ collapsedCenturies, onToggleCenturyCollapse }: TechTreeHeadersProps) {
  return (
    <>
      {/* Discipline Band Labels - Fixed positioning */}
      <div className="absolute -left-32 top-[200px] -translate-y-1/2 font-bold text-lg text-emerald-700 z-10 bg-white dark:bg-slate-800 p-2 rounded shadow">
        STEM
        <div className="text-xs font-normal mt-1 max-w-[120px] text-emerald-600">Math, Physics, Engineering...</div>
      </div>
      <div className="absolute -left-32 top-[400px] -translate-y-1/2 font-bold text-lg text-blue-700 z-10 bg-white dark:bg-slate-800 p-2 rounded shadow">
        Humanities
        <div className="text-xs font-normal mt-1 max-w-[120px] text-blue-600">Philosophy, Literature, Art...</div>
      </div>
      <div className="absolute -left-32 top-[600px] -translate-y-1/2 font-bold text-lg text-amber-700 z-10 bg-white dark:bg-slate-800 p-2 rounded shadow">
        Social Studies
        <div className="text-xs font-normal mt-1 max-w-[120px] text-amber-600">History, Politics, Economics...</div>
      </div>
      <div className="absolute -left-32 top-[800px] -translate-y-1/2 font-bold text-lg text-purple-700 z-10 bg-white dark:bg-slate-800 p-2 rounded shadow">
        Geography
        <div className="text-xs font-normal mt-1 max-w-[120px] text-purple-600">Regions, Cities, Territories...</div>
      </div>

      <div className="flex">
        {eras.map((era) => {
          // Find all periods that belong to this era
          const eraPeriods = centuries.filter(
            (century) => century.startYear >= era.startYear && century.endYear <= era.endYear,
          )

          // Calculate width based on the number of periods this era spans that aren't collapsed
          const visiblePeriods = eraPeriods.filter((period) => !collapsedCenturies.includes(period.id))
          const width = visiblePeriods.length * 1200 // Each period is 1200px wide

          return (
            <div
              key={era.id}
              className={`${era.color} text-white p-4 font-bold text-center`}
              style={{
                width: `${width}px`,
                minWidth: "200px",
              }}
            >
              {era.name} ({era.startYear < 0 ? `${Math.abs(era.startYear)} BCE` : era.startYear} -{" "}
              {era.endYear < 0 ? `${Math.abs(era.endYear)} BCE` : era.endYear})
            </div>
          )
        })}
      </div>

      {/* Century Headers */}
      <div className="flex">
        {centuries.map((century) => {
          // Skip rendering collapsed centuries
          if (collapsedCenturies.includes(century.id)) {
            return (
              <div
                key={century.id}
                className="bg-slate-300 dark:bg-slate-700 p-2 text-center border-r border-slate-400 flex items-center justify-center cursor-pointer"
                style={{ width: "40px" }}
                onClick={() => onToggleCenturyCollapse(century.id)}
              >
                <ChevronRight className="h-5 w-5" />
              </div>
            )
          }

          return (
            <div
              key={century.id}
              className="bg-slate-300 dark:bg-slate-700 p-2 text-center border-r border-slate-400 cursor-pointer relative"
              style={{ width: "1200px" }}
              onClick={() => onToggleCenturyCollapse(century.id)}
            >
              <div className="flex items-center justify-center">
                <ChevronDown className="h-5 w-5 mr-2" />
                {century.name}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
