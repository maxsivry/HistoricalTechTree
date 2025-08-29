import type { TechNode } from "@/lib/types/tech-tree"
import { getNodePosition, getCenturyForYear, getEraForYear } from "@/utils/tech-tree-utils"
import TechTreeHeaders from "./tech-tree-headers"
import TechTreeNodes from "./tech-tree-nodes"
import { eras } from "@/constants/tech-tree-constants"

interface TechTreeCanvasProps {
  techNodes: TechNode[]
  selectedFilterTags: string[]
  centuryPositions: Record<string, number>
  collapsedCenturies: string[]
  collapsedEras: string[]
  position: { x: number; y: number }
  zoomLevel: number
  onToggleEraCollapse: (eraId: string) => void
  onToggleExpansion: (nodeId: string | number) => void
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
  collapsedEras,
  position,
  zoomLevel,
  onToggleEraCollapse,
  onToggleExpansion,
  onOpenDetails,
  onToggleFilterTag,
  onAddDevelopment,
  onClearFilters,
}: TechTreeCanvasProps) {
  // Era header aligns directly with the node canvas horizontally (no offset).
  // Render connections between nodes
  const renderConnections = () => {
    // Get filtered nodes
    const filteredNodes =
      selectedFilterTags.length > 0
        ? techNodes.filter((node) => selectedFilterTags.every((tag) => (node.category || []).includes(tag)))
        : techNodes

    return filteredNodes
      .flatMap((node) => {
        // Skip nodes in collapsed eras or collapsed centuries
        const nodeCentury = getCenturyForYear(node.year)
        const nodeEra = getEraForYear(node.year)
        if (!nodeCentury || collapsedCenturies.includes(nodeCentury.id) || (nodeEra && collapsedEras.includes(nodeEra.id))) {
          return null
        }

        return (node.dependencies || []).map((depId) => {
          const depNode = techNodes.find((n) => n.id === depId)
          if (!depNode) return null

          // Skip if dependency node is in a collapsed era or century
          const depCentury = getCenturyForYear(depNode.year)
          const depEra = getEraForYear(depNode.year)
          if (!depCentury || collapsedCenturies.includes(depCentury.id) || (depEra && collapsedEras.includes(depEra.id))) {
            return null
          }

          // Only show connections if both nodes are visible in the current filter
          const isDepNodeVisible =
            selectedFilterTags.length === 0 || selectedFilterTags.every((tag) => (depNode.category || []).includes(tag))

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
      {/* Always-visible collapsed era toggles pinned to viewport */}
      <div className="absolute top-2 left-2 z-30 flex gap-2 pointer-events-auto">
        {collapsedEras.map((eraId) => {
          const e = eras.find((er) => er.id === eraId)
          if (!e) return null
          return (
            <button
              key={eraId}
              onClick={() => onToggleEraCollapse(eraId)}
              className="px-2 py-1 text-xs rounded bg-slate-800 text-white/90 hover:bg-slate-700 shadow"
              title={`Expand ${e.name}`}
            >
              ▶ {e.name}
            </button>
          )
        })}
      </div>

      {/* Fixed Era Banner overlay at top of the timeline window */}
      <div
        className="absolute top-0 left-0 right-0 z-20 bg-transparent"
        style={{
          transform: `translate(${position.x}px, 0px) scale(${zoomLevel})`,
          transformOrigin: "0 0",
        }}
      >
        <TechTreeHeaders
          collapsedCenturies={collapsedCenturies}
          collapsedEras={collapsedEras}
          onToggleEraCollapse={onToggleEraCollapse}
          showBandLabels={false}
          showEraBanner={true}
        />
      </div>

      {/* Band Labels removed as per new uniform baseline design */}

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
        {/* Band labels moved to fixed-left overlay above */}

        <TechTreeNodes
          techNodes={techNodes}
          selectedFilterTags={selectedFilterTags}
          centuryPositions={centuryPositions}
          collapsedCenturies={collapsedCenturies}
          collapsedEras={collapsedEras}
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
