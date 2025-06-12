import type { TechNode } from "@/lib/types/tech-tree"
import { getNodePosition, getCenturyForYear } from "@/utils/tech-tree-utils"
import TechTreeHeaders from "./tech-tree-headers"
import TechTreeNodes from "./tech-tree-nodes"

interface TechTreeCanvasProps {
  techNodes: TechNode[]
  selectedFilterTags: string[]
  centuryPositions: Record<string, number>
  collapsedCenturies: string[]
  position: { x: number; y: number }
  zoomLevel: number
  onToggleCenturyCollapse: (centuryId: string) => void
  onToggleExpansion: (nodeId: string) => void
  onOpenDetails: (node: TechNode) => void
  onToggleFilterTag: (tag: string) => void
  onAddDevelopment: () => void
  onClearFilters: () => void
}

export default function TechTreeCanvas({
  techNodes,
  selectedFilterTags,
  centuryPositions,
  collapsedCenturies,
  position,
  zoomLevel,
  onToggleCenturyCollapse,
  onToggleExpansion,
  onOpenDetails,
  onToggleFilterTag,
  onAddDevelopment,
  onClearFilters,
}: TechTreeCanvasProps) {
  // Render connections between nodes
  const renderConnections = () => {
    // Get filtered nodes
    const filteredNodes =
      selectedFilterTags.length > 0
        ? techNodes.filter((node) => selectedFilterTags.every((tag) => node.category.includes(tag)))
        : techNodes

    return filteredNodes
      .flatMap((node) => {
        // Skip nodes in collapsed centuries
        const nodeCentury = getCenturyForYear(node.year)
        if (!nodeCentury || collapsedCenturies.includes(nodeCentury.id)) {
          return null
        }

        return node.dependencies.map((depId) => {
          const depNode = techNodes.find((n) => n.id === depId)
          if (!depNode) return null

          // Skip if dependency node is in a collapsed century
          const depCentury = getCenturyForYear(depNode.year)
          if (!depCentury || collapsedCenturies.includes(depCentury.id)) {
            return null
          }

          // Only show connections if both nodes are visible in the current filter
          const isDepNodeVisible =
            selectedFilterTags.length === 0 || selectedFilterTags.every((tag) => depNode.category.includes(tag))

          if (!isDepNodeVisible) return null

          const sourcePos = getNodePosition(depNode, techNodes, centuryPositions, collapsedCenturies)
          const targetPos = getNodePosition(node, techNodes, centuryPositions, collapsedCenturies)

          // Calculate path for the arrow
          const path = `M${sourcePos.left + 150} ${sourcePos.top + 50} C${sourcePos.left + 300} ${sourcePos.top + 50}, ${targetPos.left} ${targetPos.top + 50}, ${targetPos.left + 30} ${targetPos.top + 50}`

          return (
            <path
              key={`${depId}-${node.id}`}
              d={path}
              stroke="#888"
              strokeWidth="2"
              fill="none"
              markerEnd="url(#arrowhead)"
            />
          )
        })
      })
      .filter(Boolean)
  }

  return (
    <>
      {/* SVG for connections */}
      <svg
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
          transformOrigin: "0 0",
        }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#888" />
          </marker>
        </defs>
        {renderConnections()}
      </svg>

      {/* Era Headers and Content */}
      <div
        className="absolute top-0 left-0"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
          transformOrigin: "0 0",
        }}
      >
        <TechTreeHeaders collapsedCenturies={collapsedCenturies} onToggleCenturyCollapse={onToggleCenturyCollapse} />

        <TechTreeNodes
          techNodes={techNodes}
          selectedFilterTags={selectedFilterTags}
          centuryPositions={centuryPositions}
          collapsedCenturies={collapsedCenturies}
          onToggleExpansion={onToggleExpansion}
          onOpenDetails={onOpenDetails}
          onToggleFilterTag={onToggleFilterTag}
          onAddDevelopment={onAddDevelopment}
          onClearFilters={onClearFilters}
        />
      </div>
    </>
  )
}
