"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import NodeEditor from "./node-editor"
import TechTree from "./tech-tree"

// Define types for our data structures
interface TechNode {
  id: string
  title: string
  year: number
  description: string
  category: string[]
  era: string
  century: string
  dependencies: string[]
  links?: { title: string; url: string }[]
  people?: string[]
  expanded?: boolean
}

interface Era {
  id: string
  name: string
  startYear: number
  endYear: number
  color: string
}

// Sample data
const eras: Era[] = [
  { id: "prehistoric", name: "Prehistoric", startYear: -10000, endYear: -3000, color: "bg-stone-600" },
  { id: "ancient", name: "Ancient Civilizations", startYear: -3000, endYear: -800, color: "bg-amber-700" },
  { id: "classical", name: "Classical Age", startYear: -800, endYear: 500, color: "bg-purple-700" },
  { id: "medieval", name: "Medieval Period", startYear: 500, endYear: 1400, color: "bg-blue-800" },
  { id: "renaissance", name: "Renaissance", startYear: 1400, endYear: 1700, color: "bg-emerald-700" },
  { id: "industrial", name: "Industrial Age", startYear: 1700, endYear: 1900, color: "bg-orange-700" },
  { id: "modern", name: "Modern Era", startYear: 1900, endYear: 2000, color: "bg-red-700" },
  { id: "information", name: "Information Age", startYear: 2000, endYear: 2100, color: "bg-cyan-700" },
]

// Sample tech nodes with more comprehensive data
const initialTechNodes: TechNode[] = [
  {
    id: "thales",
    title: "Thales of Miletus",
    year: -624,
    description:
      "Greek philosopher and mathematician who is credited as the first Western philosopher and the father of science.",
    category: ["Philosophy", "Mathematics"],
    era: "classical",
    century: "6bce",
    dependencies: [],
    people: ["Thales of Miletus"],
    links: [{ title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Thales_of_Miletus" }],
  },
  {
    id: "pythagoras-theorem",
    title: "Pythagorean Theorem",
    year: -530,
    description:
      "Mathematical theorem stating that in a right triangle, the square of the hypotenuse equals the sum of squares of the other two sides.",
    category: ["Mathematics"],
    era: "classical",
    century: "6bce",
    dependencies: ["thales"],
    people: ["Pythagoras of Samos"],
    links: [{ title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Pythagorean_theorem" }],
  },
  {
    id: "socratic-method",
    title: "Socratic Method",
    year: -470,
    description:
      "Form of inquiry and discussion between individuals, based on asking and answering questions to stimulate critical thinking.",
    category: ["Philosophy"],
    era: "classical",
    century: "5bce",
    dependencies: ["thales"],
    people: ["Socrates"],
    links: [{ title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Socratic_method" }],
  },
  {
    id: "aristotelian-logic",
    title: "Aristotelian Logic",
    year: -350,
    description:
      "System of logic developed by Aristotle, forming the foundation of formal logic and scientific reasoning.",
    category: ["Philosophy", "Logic"],
    era: "classical",
    century: "4bce",
    dependencies: ["socratic-method"],
    people: ["Aristotle"],
    links: [{ title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Aristotelian_logic" }],
  },
  {
    id: "euclidean-geometry",
    title: "Euclidean Geometry",
    year: -300,
    description: "Mathematical system attributed to Euclid, which describes the properties of plane and solid figures.",
    category: ["Mathematics", "Geometry"],
    era: "classical",
    century: "3bce",
    dependencies: ["pythagoras-theorem"],
    people: ["Euclid"],
    links: [{ title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Euclidean_geometry" }],
  },
  {
    id: "archimedes-principle",
    title: "Archimedes' Principle",
    year: -250,
    description:
      "Physical law stating that the upward buoyant force on a submerged object is equal to the weight of the fluid displaced.",
    category: ["Physics", "Engineering"],
    era: "classical",
    century: "3bce",
    dependencies: ["euclidean-geometry"],
    people: ["Archimedes"],
    links: [{ title: "Wikipedia", url: "https://en.wikipedia.org/wiki/Archimedes%27_principle" }],
  },
]

// Available categories
const availableCategories = [
  "Philosophy",
  "Mathematics",
  "Chemistry",
  "Astronomy",
  "Physics",
  "Biology",
  "Engineering",
  "Urban Planning",
  "History",
  "War",
  "Cartography",
  "Geography",
  "Evolution",
  "Cosmology",
  "Hydrology",
  "Logic",
  "Geometry",
]

export default function TechTreeEditor() {
  const [techNodes, setTechNodes] = useState<TechNode[]>(initialTechNodes)
  const [editorOpen, setEditorOpen] = useState(false)
  const [selectedNode, setSelectedNode] = useState<TechNode | null>(null)

  const handleAddNode = () => {
    setSelectedNode(null)
    setEditorOpen(true)
  }

  const handleEditNode = (node: TechNode) => {
    setSelectedNode(node)
    setEditorOpen(true)
  }

  const handleSaveNode = (node: TechNode) => {
    if (selectedNode) {
      // Update existing node
      setTechNodes((prev) => prev.map((n) => (n.id === node.id ? node : n)))
    } else {
      // Add new node
      setTechNodes((prev) => [...prev, node])
    }
  }

  const handleDeleteNode = (nodeId: string) => {
    setTechNodes((prev) => prev.filter((n) => n.id !== nodeId))

    // Also remove this node from any dependencies
    setTechNodes((prev) =>
      prev.map((node) => ({
        ...node,
        dependencies: node.dependencies.filter((dep) => dep !== nodeId),
      })),
    )
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="bg-slate-200 dark:bg-slate-800 p-4 flex justify-between items-center border-b">
        <div className="text-2xl font-bold">Historical Tech Tree Editor</div>
        <Button onClick={handleAddNode}>
          <Plus className="mr-2 h-4 w-4" /> Add Node
        </Button>
      </div>

      {/* Tech Tree Component */}
      <div className="flex-1 overflow-hidden">
        <TechTree nodes={techNodes} onEditNode={handleEditNode} onDeleteNode={handleDeleteNode} />
      </div>

      {/* Node Editor Dialog */}
      <NodeEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        node={selectedNode}
        onSave={handleSaveNode}
        allNodes={techNodes}
        categories={availableCategories}
        eras={eras.map((era) => ({ id: `${era.startYear}-${era.endYear}`, name: era.name }))}
      />
    </div>
  )
}
