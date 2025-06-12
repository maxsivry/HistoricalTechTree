"use client"

import type React from "react"

import { useState, useRef, useMemo, useEffect } from "react"
import { Plus, Minus, Info, ChevronRight, ChevronDown, ChevronUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
import { cn } from "@/lib/utils"
import type { TechNode, Era, Century, DisciplineBands } from "@/lib/types/tech-tree"

// Replace the eras array with just the Classical Age
const eras: Era[] = [{ id: "classical", name: "Classical Age", startYear: -800, endYear: -30, color: "bg-purple-700" }]

// Update the centuries array to include only Classical Age periods
const centuries: Century[] = [
  // Classical Age periods
  { id: "archaic", name: "Archaic Era (9th-6th centuries)", startYear: -800, endYear: -600 },
  { id: "classical-period", name: "Classical Period (6th-4th centuries)", startYear: -600, endYear: -323 },
  { id: "hellenistic", name: "Hellenistic Period (4th-1st centuries)", startYear: -323, endYear: -30 },
]

// Define discipline bands for vertical organization
const disciplineBands: DisciplineBands = {
  STEM: {
    categories: [
      "Mathematics",
      "Engineering",
      "Urban Planning",
      "Technology",
      "Medicine",
      "Astronomy",
      "Physics",
      "Cosmology",
      "Chemistry",
      "Biology",
      "Hydrology",
      "Evolution",
      "Science",
      "Logic",
      "Geometry",
    ],
    position: 200,
    color: "emerald",
  },
  Humanities: {
    categories: ["Literature", "Philosophy", "Religion", "Drama", "Art", "Music", "Poetry", "Media", "Language"],
    position: 400,
    color: "blue",
  },
  SocialStudies: {
    categories: ["History", "War", "Politics", "Economics", "Society", "Cartography", "Geography"],
    position: 600,
    color: "amber",
  },
  Geography: {
    categories: [
      "Hellas",
      "Athens",
      "Sparta",
      "Asia Minor",
      "Persian Empire",
      "Greek Islands",
      "Egypt",
      "Thebes",
      "Corinth",
      "Minor Poleis",
      "Beyond Hellas",
      "Black Sea",
    ],
    position: 800,
    color: "purple",
  },
}

// Available tags for developments
const availableTags = [
  ...disciplineBands.STEM.categories,
  ...disciplineBands.Humanities.categories,
  ...disciplineBands.SocialStudies.categories,
  ...disciplineBands.Geography.categories,
]

// Get century for a specific year
const getCenturyForYear = (year: number) => {
  return centuries.find((century) => year >= century.startYear && year <= century.endYear)
}

// Get era for a specific year
const getEraForYear = (year: number) => {
  return eras.find((era) => year >= era.startYear && year <= era.endYear)
}

interface TechTreeProps {
  nodes?: TechNode[]
  onEditNode?: (node: TechNode) => void
  onDeleteNode?: (nodeId: string) => void
}

export default function TechTree({ nodes = [], onEditNode, onDeleteNode }: TechTreeProps) {
  const [techNodes, setTechNodes] = useState<TechNode[]>(nodes)
  const [selectedNode, setSelectedNode] = useState<TechNode | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [startDragPosition, setStartDragPosition] = useState({ x: 0, y: 0 })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([])
  const [isMounted, setIsMounted] = useState(false)

  // Track which centuries are collapsed
  const [collapsedCenturies, setCollapsedCenturies] = useState<string[]>([])

  // New development form state
  const [newDevelopment, setNewDevelopment] = useState<{
    title: string
    year: number
    yearType: "BCE" | "CE"
    description: string
    category: string[]
    links: { title: string; url: string }[]
    dependencies: string[]
  }>({
    title: "",
    year: 800,
    yearType: "BCE",
    description: "",
    category: [],
    links: [],
    dependencies: [],
  })

  // Temporary state for adding new links
  const [newLink, setNewLink] = useState({ title: "", url: "" })

  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Update techNodes when nodes prop changes
  useEffect(() => {
    setTechNodes(nodes)
  }, [nodes])

  // Calculate century positions based on which ones are collapsed
  const centuryPositions = useMemo(() => {
    const positions: Record<string, number> = {}
    let currentPosition = 0

    for (const century of centuries) {
      positions[century.id] = currentPosition
      if (!collapsedCenturies.includes(century.id)) {
        currentPosition += 1200 // Each period is 1200px wide
      }
    }

    return positions
  }, [collapsedCenturies])

  // Calculate node position based on year and dependencies, accounting for collapsed centuries
  const getNodePosition = (node: TechNode, allNodes: TechNode[]) => {
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
        const otherPos = getNodePositionSimple(otherNode)

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

  // Add a simple version of getNodePosition that doesn't check for overlaps
  // to avoid infinite recursion when checking positions
  const getNodePositionSimple = (node: TechNode) => {
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
    for (const [,band] of Object.entries(disciplineBands)) {
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

  // Toggle century collapse state
  const toggleCenturyCollapse = (centuryId: string) => {
    setCollapsedCenturies((prev) =>
      prev.includes(centuryId) ? prev.filter((id) => id !== centuryId) : [...prev, centuryId],
    )
  }

  // Handle zoom in/out
  const handleZoom = (direction: "in" | "out") => {
    setZoomLevel((prev) => {
      if (direction === "in" && prev < 2) return prev + 0.1
      if (direction === "out" && prev > 0.5) return prev - 0.1
      return prev
    })
  }

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartDragPosition({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - startDragPosition.x,
      y: e.clientY - startDragPosition.y,
    })
  }

  // Handle mouse up to stop dragging
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Add the handleWheel function here
  const handleWheel = (e: React.WheelEvent) => {
    // Prevent the default scroll behavior
    e.preventDefault()

    // Determine zoom direction based on wheel delta
    const direction = e.deltaY < 0 ? "in" : "out"

    // Calculate new zoom level
    const newZoomLevel = direction === "in" ? Math.min(zoomLevel + 0.1, 2) : Math.max(zoomLevel - 0.1, 0.5)

    // Get mouse position relative to the container
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Calculate the point under the mouse in the original coordinate system
    const pointX = mouseX / zoomLevel - position.x / zoomLevel
    const pointY = mouseY / zoomLevel - position.y / zoomLevel

    // Calculate the new position to keep the point under the mouse
    const newPositionX = -pointX * newZoomLevel + mouseX
    const newPositionY = -pointY * newZoomLevel + mouseY

    // Update zoom level and position
    setZoomLevel(newZoomLevel)
    setPosition({ x: newPositionX, y: newPositionY })
  }

  // Toggle node expansion
  const toggleNodeExpansion = (nodeId: string) => {
    setTechNodes((prev) => prev.map((node) => (node.id === nodeId ? { ...node, expanded: !node.expanded } : node)))
  }

  // Open node details dialog
  const openNodeDetails = (node: TechNode) => {
    setSelectedNode(node)
    setDialogOpen(true)
  }

  // Handle input change for new development
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewDevelopment((prev) => ({
      ...prev,
      [name]: name === "year" ? Math.abs(Number.parseInt(value) || 0) : value,
    }))
  }

  // Add a function to handle year type change
  const handleYearTypeChange = (type: "BCE" | "CE") => {
    setNewDevelopment((prev) => ({
      ...prev,
      yearType: type,
    }))
  }

  // Add a function to handle dependency selection
  const handleDependencyToggle = (nodeId: string) => {
    setNewDevelopment((prev) => {
      if (prev.dependencies.includes(nodeId)) {
        return {
          ...prev,
          dependencies: prev.dependencies.filter((id) => id !== nodeId),
        }
      } else {
        return {
          ...prev,
          dependencies: [...prev.dependencies, nodeId],
        }
      }
    })
  }

  // Add a new link to the development
  const addLink = () => {
    if (newLink.title && newLink.url) {
      setNewDevelopment((prev) => ({
        ...prev,
        links: [...prev.links, { ...newLink }],
      }))
      setNewLink({ title: "", url: "" })
    }
  }

  // Remove a link from the development
  const removeLink = (index: number) => {
    setNewDevelopment((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }))
  }

  // Function to toggle a tag in the new development form
  const handleTagToggle = (tag: string) => {
    setNewDevelopment((prev) => {
      if (prev.category.includes(tag)) {
        return {
          ...prev,
          category: prev.category.filter((t) => t !== tag),
        }
      } else {
        return {
          ...prev,
          category: [...prev.category, tag],
        }
      }
    })
  }

  // Add this after handleTagToggle function
  const toggleFilterTag = (tag: string) => {
    setSelectedFilterTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag)
      } else {
        return [...prev, tag]
      }
    })
  }

  // Add a function to clear all filters
  const clearFilters = () => {
    setSelectedFilterTags([])
  }

  // Save the new development
  const saveDevelopment = () => {
    if (!newDevelopment.title) {
      alert("Please enter a title for the development")
      return
    }

    // Generate a unique ID based on the title
    const id = newDevelopment.title.toLowerCase().replace(/\s+/g, "-")

    // Convert year to negative if BCE
    const year = newDevelopment.yearType === "BCE" ? -Math.abs(newDevelopment.year) : Math.abs(newDevelopment.year)

    // Determine era and century based on year
    const era = getEraForYear(year)
    const century = getCenturyForYear(year)

    const development: TechNode = {
      ...newDevelopment,
      id,
      year,
      era: era?.id || "",
      century: century?.id || "",
      expanded: false,
    }

    // Add the new development to the list
    setTechNodes((prev) => [...prev, development])

    // Reset the form
    setNewDevelopment({
      title: "",
      year: 800,
      yearType: "BCE",
      description: "",
      category: [],
      links: [],
      dependencies: [],
    })

    // Close the dialog
    setAddDialogOpen(false)
  }

  // Modify the renderConnections function to respect filters and collapsed centuries
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

          const sourcePos = getNodePosition(depNode, techNodes)
          const targetPos = getNodePosition(node, techNodes)

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

  // If not mounted yet, return a loading state or nothing
  if (!isMounted) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="animate-pulse text-lg">Loading Tech Tree...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Controls */}
      <div className="bg-slate-200 dark:bg-slate-800 p-4 flex flex-col gap-2 border-b">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold">Historical Tech Tree</div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => handleZoom("out")}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="mx-2 text-sm">{Math.round(zoomLevel * 100)}%</span>
            <Button variant="outline" size="icon" onClick={() => handleZoom("in")}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button onClick={() => setAddDialogOpen(true)} className="ml-4">
              <Plus className="h-4 w-4 mr-2" /> Add Development
            </Button>
          </div>
        </div>

        {/* Tag Legend */}
        <div className="flex flex-wrap gap-2 text-xs items-center">
          <div className="flex items-center">
            <span className="mr-2 font-medium">Filter by Tags:</span>
          </div>
          {selectedFilterTags.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
              Clear filters
            </Button>
          )}
          {Object.entries(disciplineBands).map(([bandName, band]) => (
            <div key={bandName} className="flex flex-wrap gap-1 mr-4">
              <span
                className={`font-medium ${
                  band.color === "emerald"
                    ? "text-emerald-700"
                    : band.color === "blue"
                      ? "text-blue-700"
                      : band.color === "amber"
                        ? "text-amber-700"
                        : "text-purple-700"
                }`}
              >
                {bandName}:
              </span>
              {band.categories.slice(0, 3).map((category) => (
                <Badge
                  key={category}
                  variant={selectedFilterTags.includes(category) ? "default" : "secondary"}
                  className={`text-xs cursor-pointer ${
                    selectedFilterTags.includes(category)
                      ? band.color === "emerald"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : band.color === "blue"
                          ? "bg-blue-600 hover:bg-blue-700"
                          : band.color === "amber"
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "bg-purple-600 hover:bg-purple-700"
                      : "hover:bg-slate-300 dark:hover:bg-slate-700"
                  }`}
                  onClick={() => toggleFilterTag(category)}
                >
                  {category}
                </Badge>
              ))}
              {band.categories.length > 3 && (
                <Badge
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700"
                  onClick={() => {
                    // Show a simple dropdown or modal with all tags
                    // For simplicity, we'll just log for now
                    console.log(`All ${bandName} tags:`, band.categories)
                  }}
                >
                  +{band.categories.length - 3} more
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tech Tree Container */}
      <div
        className="flex-1 relative overflow-hidden cursor-move bg-slate-50 dark:bg-slate-900"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        ref={containerRef}
      >
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

        {/* Era Headers */}
        <div
          className="absolute top-0 left-0"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
            transformOrigin: "0 0",
          }}
        >
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
            <div className="text-xs font-normal mt-1 max-w-[120px] text-purple-600">
              Regions, Cities, Territories...
            </div>
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
                    onClick={() => toggleCenturyCollapse(century.id)}
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
                  onClick={() => toggleCenturyCollapse(century.id)}
                >
                  <div className="flex items-center justify-center">
                    <ChevronDown className="h-5 w-5 mr-2" />
                    {century.name}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Empty state message */}
          {(techNodes.length === 0 ||
            (selectedFilterTags.length > 0 &&
              !techNodes.some((node) => selectedFilterTags.every((tag) => node.category.includes(tag))))) && (
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
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add First Development
                </Button>
              ) : (
                <Button onClick={clearFilters}>Clear Filters</Button>
              )}
            </div>
          )}

          {/* Tech Nodes (Historical Developments) */}
          {techNodes
            .filter(
              (node) =>
                selectedFilterTags.length === 0 || selectedFilterTags.every((tag) => node.category.includes(tag)),
            )
            .map((node) => {
              const position = getNodePosition(node, techNodes)
              const era = getEraForYear(node.year)

              // Skip rendering nodes in collapsed centuries
              const century = getCenturyForYear(node.year)
              if (!century || collapsedCenturies.includes(century.id)) {
                return null
              }

              return (
                <div
                  key={node.id}
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
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => toggleNodeExpansion(node.id)}
                      >
                        {node.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openNodeDetails(node)}>
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
                        onClick={() => toggleFilterTag(cat)}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>

                  {node.expanded && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">{node.description}</p>
                  )}
                </div>
              )
            })}
        </div>
      </div>

      {/* Node Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedNode && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedNode.title}</DialogTitle>
                <DialogDescription>
                  {selectedNode.year < 0 ? `${Math.abs(selectedNode.year)} BCE` : `${selectedNode.year} CE`}
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="connections">Connections</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="flex flex-wrap gap-1 mb-4">
                    {selectedNode.category.map((cat) => (
                      <Badge key={cat}>{cat}</Badge>
                    ))}
                  </div>

                  <p>{selectedNode.description}</p>

                  {selectedNode.people && selectedNode.people.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Key People</h4>
                      <ul className="list-disc pl-5">
                        {selectedNode.people.map((person) => (
                          <li key={person}>{person}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="connections">
                  {selectedNode.dependencies && selectedNode.dependencies.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {selectedNode.dependencies.map((depId) => {
                        const depNode = techNodes.find((node) => node.id === depId)
                        return depNode ? <li key={depId}>{depNode.title}</li> : null
                      })}
                    </ul>
                  ) : (
                    <p>No known connections.</p>
                  )}
                </TabsContent>

                <TabsContent value="resources">
                  {selectedNode.links && selectedNode.links.length > 0 ? (
                    <ul>
                      {selectedNode.links.map((link, index) => (
                        <li key={index} className="mb-2">
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            {link.title || "Link"}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No resources available.</p>
                  )}
                </TabsContent>
              </Tabs>

              {onEditNode && (
                <Button onClick={() => onEditNode(selectedNode)} className="mt-4">
                  Edit Development
                </Button>
              )}

              {onDeleteNode && (
                <Button variant="destructive" onClick={() => onDeleteNode(selectedNode.id)} className="mt-2">
                  Delete Development
                </Button>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Development Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Historical Development</DialogTitle>
            <DialogDescription>Contribute to the knowledge base by adding a new development.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={newDevelopment.title}
                onChange={handleInputChange}
                className="col-span-3 border rounded px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="year" className="text-right">
                Year
              </label>
              <div className="col-span-3 flex items-center">
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={newDevelopment.year}
                  onChange={handleInputChange}
                  className="border rounded px-3 py-2 w-24"
                />
                <Button
                  variant={newDevelopment.yearType === "BCE" ? "default" : "outline"}
                  size="sm"
                  className="ml-2"
                  onClick={() => handleYearTypeChange("BCE")}
                >
                  BCE
                </Button>
                <Button
                  variant={newDevelopment.yearType === "CE" ? "default" : "outline"}
                  size="sm"
                  className="ml-2"
                  onClick={() => handleYearTypeChange("CE")}
                >
                  CE
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="description" className="text-right mt-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={newDevelopment.description}
                onChange={handleInputChange}
                className="col-span-3 border rounded px-3 py-2 h-32"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right mt-2">Tags</label>
              <div className="col-span-3 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {availableTags.map((tag) => (
                  <Button
                    key={tag}
                    variant={newDevelopment.category.includes(tag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right mt-2">Links</label>
              <div className="col-span-3">
                {newDevelopment.links.map((link, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex-1"
                    >
                      {link.title || "Link"}
                    </a>
                    <Button variant="ghost" size="icon" className="ml-2" onClick={() => removeLink(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Title"
                    value={newLink.title}
                    onChange={(e) => setNewLink((prev) => ({ ...prev, title: e.target.value }))}
                    className="border rounded px-3 py-2 w-1/2"
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    value={newLink.url}
                    onChange={(e) => setNewLink((prev) => ({ ...prev, url: e.target.value }))}
                    className="border rounded px-3 py-2 w-1/2"
                  />
                  <Button onClick={addLink}>Add Link</Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <label className="text-right mt-2">Dependencies</label>
              <div className="col-span-3 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {techNodes.map((node) => (
                  <Button
                    key={node.id}
                    variant={newDevelopment.dependencies.includes(node.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDependencyToggle(node.id)}
                  >
                    {node.title}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={saveDevelopment}>
              Add Development
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
