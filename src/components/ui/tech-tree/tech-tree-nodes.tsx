"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { TechNode } from "@/lib/types/tech-tree"
import { getNodePosition, getCenturyForYear } from "@/utils/tech-tree-utils"
import TechTreeNode from "./tech-tree-node"

interface TechTreeNodesProps {
  techNodes: TechNode[]
  selectedFilterTags: string[]
  centuryPositions: Record<string, number>
  collapsedCenturies: string[]
  onToggleExpansion: (nodeId: string | number) => void
  onOpenDetails: (node: TechNode) => void
  onToggleFilterTag: (tag: string) => void
  onAddDevelopment: () => void
  onClearFilters: () => void
}

export default function TechTreeNodes({
  techNodes,
  selectedFilterTags,
  centuryPositions,
  collapsedCenturies,
  onToggleExpansion,
  onOpenDetails,
  onToggleFilterTag,
  onAddDevelopment,
  onClearFilters,
}: TechTreeNodesProps) {
  // Filter nodes based on selected tags
  const filteredNodes = techNodes.filter(
    (node) =>
      selectedFilterTags.length === 0 ||
      selectedFilterTags.every((tag) => (node.category || []).includes(tag)),
  )

  // Check if we should show empty state
  const showEmptyState =
    techNodes.length === 0 ||
    (selectedFilterTags.length > 0 &&
      !techNodes.some((node) =>
        selectedFilterTags.every((tag) => (node.category || []).includes(tag)),
      ))

  return (
    <>
      {/* Empty state message */}
      {showEmptyState && (
        <div className="absolute top-[400px] left-[50%] -translate-x-1/2 text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md border-2 border-dashed border-slate-300 dark:border-slate-600">
          <h3 className="text-xl font-bold mb-2">
            {techNodes.length === 0 ? "No Historical Developments yet" : "No matching developments found"}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {techNodes.length === 0
              ? "Start adding historical events, discoveries, and innovations to build your tech tree."
              : "Try adjusting your filters to see more developments."}
          </p>
          {techNodes.length === 0 ? (
            <Button onClick={onAddDevelopment}>
              <Plus className="h-4 w-4 mr-2" /> Add First Development
            </Button>
          ) : (
            <Button onClick={onClearFilters}>Clear Filters</Button>
          )}
        </div>
      )}

      {/* Tech Nodes (Historical Developments) */}
      {filteredNodes.map((node) => {
        const position = getNodePosition(node, techNodes, centuryPositions, collapsedCenturies)

        // Skip rendering nodes in collapsed centuries
        const century = getCenturyForYear(node.year)
        if (!century || collapsedCenturies.includes(century.id)) {
          return null
        }

        return (
          <TechTreeNode
            key={node.id}
            node={node}
            position={position}
            selectedFilterTags={selectedFilterTags}
            onToggleExpansion={onToggleExpansion}
            onOpenDetails={onOpenDetails}
            onToggleFilterTag={onToggleFilterTag}
          />
        )
      })}
    </>
  )
}
