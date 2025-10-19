"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronUp, ChevronDown, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TechNode } from "@/lib/types/tech-tree"
import { getEraForYear } from "@/utils/tech-tree-utils"
import { disciplineBands } from "@/constants/tech-tree-constants"

interface TechTreeNodeProps {
  node: TechNode
  position: { left: number; top: number }
  selectedFilterTags: string[]
  onToggleExpansion: (nodeId: string | number) => void
  onOpenDetails: (node: TechNode) => void
  onToggleFilterTag: (tag: string) => void
}

export default function TechTreeNode({
  node,
  position,
  selectedFilterTags,
  onToggleExpansion,
  onOpenDetails,
  onToggleFilterTag,
}: TechTreeNodeProps) {
  const era = getEraForYear(node.year)

  return (
    <div
      className={cn(
        "absolute border-2 rounded-md p-3 w-[300px] bg-white dark:bg-slate-800 shadow-md transition-all cursor-pointer",
        node.expanded ? "h-auto z-30" : "h-[100px] overflow-hidden z-10",
        era ? `border-${era.color.replace("bg-", "")}` : "border-gray-400",
      )}
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
      }}
      onClick={(e) => {
        e.stopPropagation()
        onOpenDetails(node)
      }}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-sm">
          {node.title} ({node.year < 0 ? `${Math.abs(node.year)} BCE` : `${node.year} CE`})
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(event) => {
              event.stopPropagation()
              onToggleExpansion(node.id)
            }}
          >
            {node.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(event) => {
              event.stopPropagation()
              onOpenDetails(node)
            }}
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {(node.category || []).map((cat) => {
          let color: string | null = null
          for (const [, band] of Object.entries(disciplineBands)) {
            if (band.categories.includes(cat)) {
              color = band.color
              break
            }
          }
          const base = color || "slate"
          const isSelected = selectedFilterTags.includes(cat)
          const borderClass = `border-${base}-600`
          const textClass = `text-${base}-700`
          const bgClass = isSelected ? `bg-${base}-100` : ""

          return (
            <Badge
              key={cat}
              variant="outline"
              className={`text-xs cursor-pointer ${borderClass} ${textClass} ${bgClass}`}
              onClick={(event) => {
                event.stopPropagation()
                onToggleFilterTag(cat)
              }}
              title={isSelected ? "Click to remove filter" : "Click to filter by this tag"}
            >
              {cat}
            </Badge>
          )
        })}
      </div>

      {node.expanded && <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">{node.description}</p>}
    </div>
  )
}
