"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight, ChevronUp, Info } from "lucide-react"
import type { TechNode } from "@/lib/types/tech-tree"
import { disciplineBands, eras } from "@/constants/tech-tree-constants"
import { getEraForYear } from "@/utils/tech-tree-utils"
import { cn } from "@/lib/utils"

interface MobileTechTreeProps {
  techNodes: TechNode[]
  selectedFilterTags: string[]
  collapsedEras: string[]
  onToggleEraCollapse: (eraId: string) => void
  onToggleExpansion: (nodeId: string | number) => void
  onOpenDetails: (node: TechNode) => void
  onToggleFilterTag: (tag: string) => void
}

const badgeColorMap = {
  emerald: {
    border: "border-emerald-600",
    text: "text-emerald-700",
    background: "bg-emerald-100",
  },
  blue: {
    border: "border-blue-600",
    text: "text-blue-700",
    background: "bg-blue-100",
  },
  amber: {
    border: "border-amber-600",
    text: "text-amber-700",
    background: "bg-amber-100",
  },
  purple: {
    border: "border-purple-600",
    text: "text-purple-700",
    background: "bg-purple-100",
  },
} as const

const formatYear = (year: number) => {
  if (year < 0) return `${Math.abs(year)} BCE`
  if (year === 0) return "0"
  return `${year} CE`
}

const findDisciplineColorKey = (category: string) => {
  for (const [, band] of Object.entries(disciplineBands)) {
    if (band.categories.includes(category)) {
      return band.color as keyof typeof badgeColorMap
    }
  }
  return null
}

export default function MobileTechTree({
  techNodes,
  selectedFilterTags,
  collapsedEras,
  onToggleEraCollapse,
  onToggleExpansion,
  onOpenDetails,
  onToggleFilterTag,
}: MobileTechTreeProps) {
  const filteredNodes = useMemo(() => {
    if (selectedFilterTags.length === 0) {
      return [...techNodes].sort((a, b) => a.year - b.year)
    }
    return techNodes
      .filter((node) =>
        selectedFilterTags.every((tag) => (node.category || []).includes(tag)),
      )
      .sort((a, b) => a.year - b.year)
  }, [techNodes, selectedFilterTags])

  const nodesByEra = useMemo(() => {
    const eraGroups = new Map<
      string,
      {
        eraId: string
        name: string
        rangeLabel: string
        colorClass: string
        nodes: TechNode[]
      }
    >()

    for (const era of eras) {
      eraGroups.set(era.id, {
        eraId: era.id,
        name: era.name,
        rangeLabel: `${formatYear(era.startYear)} – ${formatYear(era.endYear)}`,
        colorClass: era.color,
        nodes: [],
      })
    }

    const extraNodes: TechNode[] = []

    for (const node of filteredNodes) {
      const era = getEraForYear(node.year)
      if (!era) {
        extraNodes.push(node)
        continue
      }
      const group = eraGroups.get(era.id)
      if (!group) continue
      group.nodes.push(node)
    }

    for (const group of eraGroups.values()) {
      group.nodes.sort((a, b) => a.year - b.year)
    }

    return {
      groups: Array.from(eraGroups.values()).filter((group) => group.nodes.length > 0),
      extraNodes: extraNodes.sort((a, b) => a.year - b.year),
    }
  }, [filteredNodes])

  if (filteredNodes.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-slate-600 dark:text-slate-300">
        No developments match the selected tags. Try adjusting or clearing your filters.
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      {nodesByEra.groups.map((group) => {
        const isCollapsed = collapsedEras.includes(group.eraId)
        return (
          <section
            key={group.eraId}
            className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800"
          >
            <button
              type="button"
              onClick={() => onToggleEraCollapse(group.eraId)}
              className={cn(
                "flex w-full items-center justify-between gap-2 rounded-t-lg px-4 py-3 text-left text-sm font-semibold text-white",
                group.colorClass,
              )}
            >
              <span>
                <span className="block text-base font-bold">{group.name}</span>
                <span className="text-xs font-normal opacity-80">{group.rangeLabel}</span>
              </span>
              {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>

            {!isCollapsed && (
              <div className="space-y-3 px-4 py-5">
                {group.nodes.map((node) => {
                  const yearLabel = formatYear(node.year)
                  return (
                    <article
                      key={node.id}
                      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{yearLabel}</p>
                          <button
                            type="button"
                            onClick={() => onOpenDetails(node)}
                            className="text-left text-base font-semibold leading-snug text-slate-900 underline-offset-2 hover:underline dark:text-slate-100"
                          >
                            {node.title}
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onToggleExpansion(node.id)}
                            aria-label={node.expanded ? "Collapse description" : "Expand description"}
                          >
                            {node.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => onOpenDetails(node)}
                            aria-label="Open details"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {(node.category || []).map((cat) => {
                          const colorKey = findDisciplineColorKey(cat)
                          const colorClasses = colorKey ? badgeColorMap[colorKey] : null
                          const isSelected = selectedFilterTags.includes(cat)

                          return (
                            <Badge
                              key={cat}
                              variant="outline"
                              className={cn(
                                "text-xs",
                                colorClasses?.border,
                                colorClasses?.text,
                                isSelected && colorClasses?.background,
                              )}
                              onClick={() => onToggleFilterTag(cat)}
                            >
                              {cat}
                            </Badge>
                          )
                        })}
                      </div>

                      {node.expanded && node.description && (
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{node.description}</p>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        )
      })}

      {nodesByEra.extraNodes.length > 0 && (
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">More</h2>
          <div className="mt-3 space-y-3">
            {nodesByEra.extraNodes.map((node) => (
              <article
                key={node.id}
                className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{formatYear(node.year)}</p>
                    <button
                      type="button"
                      onClick={() => onOpenDetails(node)}
                      className="text-left text-base font-semibold leading-snug text-slate-900 underline-offset-2 hover:underline dark:text-slate-100"
                    >
                      {node.title}
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => onOpenDetails(node)}
                    aria-label="Open details"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(node.category || []).map((cat) => {
                    const colorKey = findDisciplineColorKey(cat)
                    const colorClasses = colorKey ? badgeColorMap[colorKey] : null
                    const isSelected = selectedFilterTags.includes(cat)

                    return (
                      <Badge
                        key={cat}
                        variant="outline"
                        className={cn("text-xs", colorClasses?.border, colorClasses?.text, isSelected && colorClasses?.background)}
                        onClick={() => onToggleFilterTag(cat)}
                      >
                        {cat}
                      </Badge>
                    )
                  })}
                </div>

                {node.description && (
                  <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{node.description}</p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
