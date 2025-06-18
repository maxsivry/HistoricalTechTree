"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { TechNode, Era } from "@/lib/types/tech-tree"
import NodeEditor from "./node-editor"
import TechTree from "./tech-tree"
import { supabase } from "@/lib/supabaseClient"; 

interface TechTreeEditorProps {
  initialTechNodes: TechNode[];
}


// Define types for our data structures
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

export default function TechTreeEditor({ initialTechNodes }: TechTreeEditorProps) {
  const [techNodes] = useState<TechNode[]>(initialTechNodes)
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

  
  const handleSaveNode = async (node: TechNode) => {
    // Remove the client-side state update for now.
    // We will handle this with real-time updates in the next phase.
    if (selectedNode) {
      // UPDATE existing node
      const { error } = await supabase
        .from('developments')
        .update({ ...node }) // pass the whole node object
        .eq('id', node.id)
        .select()

      if (error) {
        console.error('Error updating node:', error)
        // Here you should show an error to the user
      }
    } else {
      // CREATE new node
      const { error } = await supabase
        .from('developments')
        .insert([
          { ...node } // pass the whole node object
        ])
        .select()

      if (error) {
        console.error('Error creating node:', error)
        // Here you should show an error to the user
      }
    }
  }


  const handleDeleteNode = async (nodeId: string) => {
    // We also need to update dependencies in other nodes. This is a bit more complex.
    // For now, let's just delete the node.
    const { error } = await supabase
      .from('developments')
      .delete()
      .eq('id', nodeId)

    if (error) {
      console.error('Error deleting node:', error)
      // Show an error
    }

    // We also need to find any nodes that depend on this one and remove the dependency.
    // This is best handled with a database function (an "edge function" in Supabase)
    // for transactional safety, but for now, we can try to do it from the client.
    // (This part is advanced, can be a next step).
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
