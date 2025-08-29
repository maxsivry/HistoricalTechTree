"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { TechNode } from "@/lib/types/tech-tree"
import { getNodePosition, getCenturyForYear, getEraForYear } from "@/utils/tech-tree-utils"
import TechTreeNode from "./tech-tree-node"

interface TechTreeNodesProps {
  techNodes: TechNode[]
  selectedFilterTags: string[]
  centuryPositions: Record<string, number>
  collapsedCenturies: string[]
  collapsedEras: string[]
  onToggleExpansion: (nodeId: string | number) => void
  onOpenDetails: (node: TechNode) => void
  onToggleFilterTag: (tag: string) => void
  onAddDevelopment: () => void
  onClearFilters: () => void
}

/**
 * Renders a set of historical development nodes (the tech tree), applying tag filters and collapsed-era/century visibility.
 *
 * Filters nodes by `selectedFilterTags` (a node must include all selected tags to remain). Nodes whose era id appears in `collapsedEras` or whose century id appears in `collapsedCenturies` are omitted. Node positions are computed using `centuryPositions` and `collapsedCenturies`. An empty-state UI is present in the code but currently disabled.
 *
 * @param selectedFilterTags - Active tag filters; a node is included only if it contains every tag in this array.
 * @param centuryPositions - Mapping of century identifiers to horizontal positions; used to compute each node's layout position.
 * @param collapsedCenturies - List of century ids that should be hidden (nodes in those centuries are not rendered).
 * @param collapsedEras - List of era ids that should be hidden (nodes in those eras are not rendered).
 * @param onToggleExpansion - Callback invoked with a node id to toggle that node's expanded/collapsed state.
 * @param onOpenDetails - Callback invoked with a node to open its detail view.
 * @param onToggleFilterTag - Callback invoked with a tag to toggle it in the active filters.
 * @param onAddDevelopment - Callback to add a new development (used by the disabled empty-state UI).
 * @param onClearFilters - Callback to clear active filters (used by the disabled empty-state UI).
 * @returns A JSX element containing the rendered TechTreeNode components for nodes that pass filtering and visibility checks.
 */
export default function TechTreeNodes({
  techNodes,
  selectedFilterTags,
  centuryPositions,
  collapsedCenturies,
  collapsedEras,
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
      {/* Empty state message disabled per request */}
      {false && showEmptyState && (
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
        // Skip nodes in collapsed eras
        const era = getEraForYear(node.year)
        if (era && collapsedEras.includes(era.id)) {
          return null
        }
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
