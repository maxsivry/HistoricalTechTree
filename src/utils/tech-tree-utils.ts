import type { TechNode } from "@/lib/types/tech-tree"
import { eras, centuries, disciplineBands } from "@/constants/tech-tree-constants"

// Get century for a specific year
export const getCenturyForYear = (year: number) => {
  return centuries.find((century) => year >= century.startYear && year <= century.endYear)
}

// Type guard to check if a node is a session node
export const isSessionNode = (nodeId: string | number): nodeId is string => {
	return typeof nodeId === "string" && nodeId.startsWith("session-");
  };
  

// Get era for a specific year
export const getEraForYear = (year: number) => {
  return eras.find((era) => year >= era.startYear && year <= era.endYear)
}

// Calculate century positions based on which ones are collapsed
export const calculateCenturyPositions = (collapsedCenturies: string[]) => {
  const positions: Record<string, number> = {}
  let currentPosition = 0

  for (const century of centuries) {
    positions[century.id] = currentPosition
    if (!collapsedCenturies.includes(century.id)) {
      currentPosition += 2400 // Each period is 2400px wide
    }
  }

  return positions
}

// Simple version of getNodePosition that doesn't check for overlaps
export const getNodePositionSimple = (
  node: TechNode,
  centuryPositions: Record<string, number>,
  collapsedCenturies: string[],
) => {
  const century = getCenturyForYear(node.year)
  if (!century) return { left: 0, top: 0 }

  // Get the base position for this century
  const centuryBasePosition = centuryPositions[century.id]

  // If the century is collapsed, hide the node
  if (collapsedCenturies.includes(century.id)) {
    return { left: -9999, top: -9999 } // Position off-screen
  }

  // Calculate horizontal position based on year within century
  const centuryWidth = 2400 // Width allocated for each century
  const yearPosition = (node.year - century.startYear) / (century.endYear - century.startYear)
  const left = centuryBasePosition + yearPosition * centuryWidth

  // Determine which discipline band this node belongs to
  let bandPosition = 400 // Default middle position if no match

  // Check if any of the node's categories match our discipline bands
  for (const [, band] of Object.entries(disciplineBands)) {
    for (const category of (node.category || [])) {
      if (band.categories.includes(category)) {
        bandPosition = band.position
        break
      }
    }
  }


  // Use node ID to create a consistent offset
  const idSum = String(node.id)
    .split("")
    .reduce((sum: number, char: string) => sum + char.charCodeAt(0), 0)
  const verticalOffset = (idSum % 5) * 20

  return {
    left,
    top: bandPosition + verticalOffset,
  }
}

// Calculate node position based on year and dependencies, accounting for collapsed centuries
export const getNodePosition = (
  node: TechNode,
  allNodes: TechNode[],
  centuryPositions: Record<string, number>,
  collapsedCenturies: string[],
) => {
  const century = getCenturyForYear(node.year)
  if (!century) return { left: 0, top: 0 }

  // Get the base position for this century
  const centuryBasePosition = centuryPositions[century.id]

  // If the century is collapsed, hide the node
  if (collapsedCenturies.includes(century.id)) {
    return { left: -9999, top: -9999 } // Position off-screen
  }

  // Calculate horizontal position based on year within century
  const centuryWidth = 2400 // Width allocated for each century
  const yearPosition = (node.year - century.startYear) / (century.endYear - century.startYear)
  const left = centuryBasePosition + yearPosition * centuryWidth

  // Global lane packing starting from a single baseline (no band separation)
  const NODE_WIDTH = 300
  const H_MARGIN = 12
  const LANE_OFFSET = 120
  const BASELINE_TOP = 120 // pixels

  // Collect all visible nodes (skip nodes in collapsed centuries)
  const visibleNodes = allNodes.filter((n) => {
    const nCentury = getCenturyForYear(n.year)
    if (!nCentury || collapsedCenturies.includes(nCentury.id)) return false
    return true
  })

  // Precompute left positions for all visible nodes
  const leftById = new Map<string | number, number>()
  for (const n of visibleNodes) {
    const c = getCenturyForYear(n.year)
    if (!c) continue
    const base = centuryPositions[c.id]
    const centuryWidth = 2400
    const yearPos = (n.year - c.startYear) / (c.endYear - c.startYear)
    const lx = base + yearPos * centuryWidth
    leftById.set(n.id, lx)
  }

  // Sort by left, then id for stability
  const sorted = visibleNodes
    .slice()
    .sort((a, b) => {
      const la = leftById.get(a.id) ?? 0
      const lb = leftById.get(b.id) ?? 0
      if (la === lb) return String(a.id).localeCompare(String(b.id))
      return la - lb
    })

  // Greedy lane assignment
  const laneEnds: number[] = [] // endX per lane
  const laneOf = new Map<string | number, number>()
  for (const n of sorted) {
    const l = (leftById.get(n.id) ?? 0)
    let placed = false
    for (let i = 0; i < laneEnds.length; i++) {
      if (l >= laneEnds[i] + H_MARGIN) {
        laneOf.set(n.id, i)
        laneEnds[i] = l + NODE_WIDTH
        placed = true
        break
      }
    }
    if (!placed) {
      laneOf.set(n.id, laneEnds.length)
      laneEnds.push(l + NODE_WIDTH)
    }
  }

  const lane = laneOf.get(node.id) ?? 0

  return {
    left,
    top: BASELINE_TOP + lane * LANE_OFFSET,
  }
}
