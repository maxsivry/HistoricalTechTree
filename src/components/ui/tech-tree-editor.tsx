"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { TechNode } from "@/lib/types/tech-tree"
import NodeEditor from "./node-editor"
import TechTree from "./tech-tree"
import { supabase } from "@/lib/supabaseClient"; 
import { useTechTreeState } from "@/hooks/use-tech-tree-state"
import TeacherLogin from "./teacher-login";
import { eras } from "@/constants/tech-tree-constants";


interface TechTreeEditorProps {
  initialTechNodes: TechNode[];
}


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
  const {
    techNodes,
    selectedNode,
    dialogOpen,
    setDialogOpen,
    addDialogOpen,
    setAddDialogOpen,
    selectedFilterTags,
    isMounted,
    collapsedCenturies,
    newDevelopment,
    newLink,
    setNewLink,
    toggleCenturyCollapse,
    toggleNodeExpansion,
    openNodeDetails,
    toggleFilterTag,
    clearFilters,
    handleInputChange,
    handleYearTypeChange,
    handleDependencyToggle,
    addLink,
    removeLink,
    handleTagToggle,
    saveDevelopment,
  } = useTechTreeState(initialTechNodes)
  

   // This state is specific to the NodeEditor (teacher's editor)
   const [editorOpen, setEditorOpen] = useState(false)
   const [editingNode, setEditingNode] = useState<TechNode | null>(null)
   const [isTeacher, setIsTeacher] = useState(false);
 
   const handleAddNode = () => {
     setEditingNode(null) // Clear any previously edited node
     setEditorOpen(true)
   }
 
   const handleEditNode = (node: TechNode) => {
     // We only allow editing of persistent nodes
     if (node.id.startsWith("session-")) {
         alert("Session-only nodes cannot be edited persistently. They exist only for your current session.");
         return;
     }
     setEditingNode(node)
     setEditorOpen(true)
   }



  
  // This function is for the TEACHER to save a node to the database
  const handleSaveNodeToDb = async (node: TechNode) => {
    // If the node has a real ID (not a session ID), it's an update.
    if (editingNode) {
      const { error } = await supabase.from("developments").update({ ...node }).eq("id", node.id)
      if (error) console.error("Error updating node:", error)
    } else {
      // Otherwise, it's a new node to be inserted.
      const { error } = await supabase.from("developments").insert([{ ...node }])
      if (error) console.error("Error creating node:", error)
    }
    // The real-time listener will automatically update the UI.
    setEditorOpen(false); // Close the editor dialog
  }

  // This function is for the TEACHER to delete a node from the database
  const handleDeleteNodeFromDb = async (nodeId: string) => {
     if (nodeId.startsWith("session-")) {
        alert("Session-only nodes cannot be deleted from the database.");
        return;
    }
    const { error } = await supabase.from("developments").delete().eq("id", nodeId)
    if (error) console.error("Error deleting node:", error)
    
    // Close any open dialogs for the deleted node
    if (selectedNode?.id === nodeId) {
      setDialogOpen(false);
    }
    // The real-time listener will automatically update the UI for all clients.
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="bg-slate-200 dark:bg-slate-800 p-4 flex justify-between items-center border-b">
      <div className="text-2xl font-bold">Historical Tech Tree</div>
        {isTeacher ? (
          <Button variant="materialFilled" onClick={handleAddNode}>
            <Plus className="mr-2 h-4 w-4" /> Add Development to Database
          </Button>
        ) : (
          <TeacherLogin onLogin={setIsTeacher} />
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {/* Pass all state and handlers down to the TechTree component */}
        <TechTree
          nodes={techNodes}
          onEditNode={handleEditNode}
          onDeleteNode={handleDeleteNodeFromDb}
          // Pass all the state and handlers from the hook
          selectedNode={selectedNode}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          addDialogOpen={addDialogOpen}
          setAddDialogOpen={setAddDialogOpen}
          selectedFilterTags={selectedFilterTags}
          isMounted={isMounted}
          collapsedCenturies={collapsedCenturies}
          newDevelopment={newDevelopment}
          newLink={newLink}
          setNewLink={setNewLink}
          toggleCenturyCollapse={toggleCenturyCollapse}
          toggleNodeExpansion={toggleNodeExpansion}
          openNodeDetails={openNodeDetails}
          toggleFilterTag={toggleFilterTag}
          clearFilters={clearFilters}
          handleInputChange={handleInputChange}
          handleYearTypeChange={handleYearTypeChange}
          handleDependencyToggle={handleDependencyToggle}
          addLink={addLink}
          removeLink={removeLink}
          handleTagToggle={handleTagToggle}
          saveDevelopment={saveDevelopment} // This is the session-save
        />
      </div>

      {/* Node Editor Dialog for the TEACHER */}
      <NodeEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        node={editingNode}
        onSave={handleSaveNodeToDb}
        allNodes={techNodes} // Pass the combined list for dependency selection
        categories={availableCategories}
        eras={eras.map((era) => ({ id: `${era.startYear}-${era.endYear}`, name: era.name }))}
      />
    </div>
  )
}