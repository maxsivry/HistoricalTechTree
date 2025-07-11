"use client"
import { useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { NewDevelopment, TechNode } from "@/lib/types/tech-tree"
import { availableTags } from "@/constants/tech-tree-constants"
import { calculateCenturyPositions } from "@/utils/tech-tree-utils"
import { useTechTreeInteractions } from "@/hooks/use-tech-tree-interactions"
import TechTreeControls from "@/components/ui/tech-tree/tech-tree-controls"
import TechTreeCanvas from "@/components/ui/tech-tree/tech-tree-canvas"



// The props interface is now much larger as it receives everything from the parent
interface TechTreeProps {
  nodes: TechNode[]
  onEditNode: (node: TechNode) => void
  onDeleteNode: (nodeId: string) => void
  selectedNode: TechNode | null
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  addDialogOpen: boolean
  setAddDialogOpen: (open: boolean) => void
  selectedFilterTags: string[]
  isMounted: boolean
  collapsedCenturies: string[]
  newDevelopment: NewDevelopment // You can use a more specific type here
  newLink: { title: string; url: string }
  setNewLink: (link: { title: string; url: string }) => void
  toggleCenturyCollapse: (centuryId: string) => void
  toggleNodeExpansion: (nodeId: string) => void
  openNodeDetails: (node: TechNode) => void
  toggleFilterTag: (tag: string) => void
  clearFilters: () => void
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleYearTypeChange: (type: "BCE" | "CE") => void
  handleDependencyToggle: (nodeId: string) => void
  addLink: () => void
  removeLink: (index: number) => void
  handleTagToggle: (tag: string) => void
  saveDevelopment: () => void // Session save
}

export default function TechTree({
  // Destructure all the new props
  nodes,
  onEditNode,
  onDeleteNode,
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
}: TechTreeProps) {
  
  const {
    zoomLevel,
    position,
    containerRef,
    handleZoom,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
  } = useTechTreeInteractions()


  // Calculate century positions based on which ones are collapsed
  const centuryPositions = useMemo(() => {
    return calculateCenturyPositions(collapsedCenturies)
  }, [collapsedCenturies])

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
      <TechTreeControls
        zoomLevel={zoomLevel}
        selectedFilterTags={selectedFilterTags}
        onZoom={handleZoom}
        onAddDevelopment={() => setAddDialogOpen(true)}
        onToggleFilterTag={toggleFilterTag}
        onClearFilters={clearFilters}
      />

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
        <TechTreeCanvas
          techNodes={nodes}
          selectedFilterTags={selectedFilterTags}
          centuryPositions={centuryPositions}
          collapsedCenturies={collapsedCenturies}
          position={position}
          zoomLevel={zoomLevel}
          onToggleCenturyCollapse={toggleCenturyCollapse}
          onToggleExpansion={toggleNodeExpansion}
          onOpenDetails={openNodeDetails}
          onToggleFilterTag={toggleFilterTag}
          onAddDevelopment={() => setAddDialogOpen(true)}
          onClearFilters={clearFilters}
        />
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
                        const depNode = nodes.find((node) => node.id === depId)
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

              <Button onClick={() => onEditNode(selectedNode)} className="mt-4">
                Edit Persistent Development
              </Button>
              <Button variant="destructive" onClick={() => onDeleteNode(selectedNode.id)} className="mt-2">
                Delete Persistent Development
              </Button>
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
                <label htmlFor="title" className="text-right">Title</label>
                <input id="title" name="title" value={newDevelopment.title} onChange={handleInputChange} className="col-span-3 border rounded px-3 py-2" />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="year" className="text-right">Year</label>
                <div className="col-span-3 flex items-center">
                    <input type="number" id="year" name="year" value={newDevelopment.year} onChange={handleInputChange} className="border rounded px-3 py-2 w-24" />
                    <Button variant={newDevelopment.yearType === "BCE" ? "default" : "outline"} size="sm" className="ml-2" onClick={() => handleYearTypeChange("BCE")}>BCE</Button>
                    <Button variant={newDevelopment.yearType === "CE" ? "default" : "outline"} size="sm" className="ml-2" onClick={() => handleYearTypeChange("CE")}>CE</Button>
                </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
                <label htmlFor="description" className="text-right mt-2">Description</label>
                <textarea id="description" name="description" value={newDevelopment.description} onChange={handleInputChange} className="col-span-3 border rounded px-3 py-2 h-32" />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
                <label className="text-right mt-2">Tags</label>
                <div className="col-span-3 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {availableTags.map((tag) => (
                    <Button key={tag} variant={newDevelopment.category.includes(tag) ? "default" : "outline"} size="sm" onClick={() => handleTagToggle(tag)}>
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
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex-1 truncate">
                      {link.title || link.url}
                    </a>
                    <Button variant="ghost" size="icon" className="ml-2 h-6 w-6" onClick={() => removeLink(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Link Title"
                    value={newLink.title}
                    onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                    className="border rounded px-3 py-2 w-1/2"
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    className="border rounded px-3 py-2 w-1/2"
                  />
                  <Button onClick={addLink}>Add</Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
                <label className="text-right mt-2">Dependencies</label>
                <div className="col-span-3 flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {nodes.map((node) => (
                        <Button key={node.id} variant={newDevelopment.dependencies.includes(node.id) ? "default" : "outline"} size="sm" onClick={() => handleDependencyToggle(node.id)}>
                            {node.title}
                        </Button>
                    ))}
                </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button type="submit" onClick={saveDevelopment}>Add for Session</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}