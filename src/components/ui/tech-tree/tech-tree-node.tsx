"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronUp, ChevronDown, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TechNode } from "@/types/tech-tree"
import { getEraForYear } from "@/utils/tech-tree-utils"

interface TechTreeNodeProps {
  node: TechNode
  position: { left: number; top: number }
  selectedFilterTags: string[]
  onToggleExpansion: (nodeId: string) => void
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
        node.expanded ? "h-auto" : "h-[100px] overflow-hidden",
        era ? `border-${era.color.replace("bg-", "")}` : "border-gray-400",
      )}
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-sm">
          {node.title} ({node.year < 0 ? `${Math.abs(node.year)} BCE` : `${node.year} CE`})
        </h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onToggleExpansion(node.id)}>
            {node.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onOpenDetails(node)}>
            <Info className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        {node.category.map((cat) => (
          <Badge
            key={cat}
            variant={selectedFilterTags.includes(cat) ? "default" : "secondary"}
            className={`text-xs cursor-pointer ${
              selectedFilterTags.includes(cat) ? "bg-primary hover:bg-primary/90" : ""
            }`}
            onClick={() => onToggleFilterTag(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      {node.expanded && <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">{node.description}</p>}
    </div>
  )
}
