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
      currentPosition += 1200 // Each period is 1200px wide
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
  const centuryWidth = 1200 // Width allocated for each century
  const yearPosition = (node.year - century.startYear) / (century.endYear - century.startYear)
  const left = centuryBasePosition + yearPosition * centuryWidth

  // Determine which discipline band this node belongs to
  let bandPosition = 400 // Default middle position if no match

  // Check if any of the node's categories match our discipline bands
  for (const [, band] of Object.entries(disciplineBands)) {
    for (const category of node.category) {
      if (band.categories.includes(category)) {
        bandPosition = band.position
        break
      }
    }
  }


  // Use node ID to create a consistent offset
  const idSum = node.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)
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
  const centuryWidth = 1200 // Width allocated for each century
  const yearPosition = (node.year - century.startYear) / (century.endYear - century.startYear)
  const left = centuryBasePosition + yearPosition * centuryWidth

  // Determine which discipline band this node belongs to
  let bandPosition = 400 // Default middle position if no match
  let bandName = "Humanities" // Default band

  // Check if any of the node's categories match our discipline bands
  let matchFound = false
  for (const [name, band] of Object.entries(disciplineBands)) {
    for (const category of node.category) {
      if (band.categories.includes(category)) {
        bandPosition = band.position
        bandName = name
        matchFound = true
        break
      }
    }
    if (matchFound) break
  }

  // Find all nodes in the same year range and same band to avoid overlaps
  const yearRange = 20 // Consider nodes within 20 years as potentially overlapping
  const nodesInSameTimeAndBand = allNodes.filter(
    (otherNode) =>
      otherNode.id !== node.id &&
      Math.abs(otherNode.year - node.year) <= yearRange &&
      otherNode.category.some((cat) =>
        disciplineBands[bandName as keyof typeof disciplineBands].categories.includes(cat),
      ),
  )

  // Calculate vertical offset based on node's specific tags within the band
  let tagOffset = 0
  if (node.category.length > 0) {
    // Get the first matching category for this band
    const bandCategories = disciplineBands[bandName as keyof typeof disciplineBands].categories
    const matchingCategories = node.category.filter((cat) => bandCategories.includes(cat))

    if (matchingCategories.length > 0) {
      // Use the index of the category within the band's categories to create an offset
      const categoryIndex = bandCategories.indexOf(matchingCategories[0])
      tagOffset = (categoryIndex % 5) * 15 // Spread nodes with different tags
    }
  }

  // Add variation to prevent overlaps with nearby nodes
  let verticalOffset = tagOffset

  // Check for overlaps and adjust position if needed
  let attempts = 0
  const maxAttempts = 10
  const nodeWidth = 300
  const nodeHeight = 100

  while (attempts < maxAttempts) {
    const currentPosition = bandPosition + verticalOffset

    // Check if this position overlaps with any existing node
    const overlaps = nodesInSameTimeAndBand.some((otherNode) => {
      const otherPos = getNodePositionSimple(otherNode, centuryPositions, collapsedCenturies)

      // Check for horizontal overlap (within 280px)
      const horizontalOverlap = Math.abs(left - otherPos.left) < nodeWidth - 20

      // Check for vertical overlap (within 90px)
      const verticalOverlap = Math.abs(currentPosition - otherPos.top) < nodeHeight - 10

      return horizontalOverlap && verticalOverlap
    })

    if (!overlaps) {
      break // Position is good, no overlaps
    }

    // Adjust vertical position to avoid overlap
    verticalOffset += 40 // Move down by 40px
    attempts++
  }

  return {
    left,
    top: bandPosition + verticalOffset,
  }
}
