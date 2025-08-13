"use client"
import { useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { NewDevelopment, TechNode } from "@/lib/types/tech-tree"
import { calculateCenturyPositions } from "@/utils/tech-tree-utils"
import { eras, centuries } from "@/constants/tech-tree-constants"
import { useTechTreeInteractions } from "@/hooks/use-tech-tree-interactions"
import TechTreeControls from "@/components/ui/tech-tree/tech-tree-controls"
import TechTreeCanvas from "@/components/ui/tech-tree/tech-tree-canvas"
import AddDevelopmentDialog from "@/components/ui/tech-tree/add-development-dialog"



// The props interface is now much larger as it receives everything from the parent
interface TechTreeProps {
  nodes: TechNode[]
  onEditNode: (node: TechNode) => void
  onDeleteNode: (nodeId: string) => void
  isTeacher: boolean
  selectedNode: TechNode | null
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
  addDialogOpen: boolean
  setAddDialogOpen: (open: boolean) => void
  selectedFilterTags: string[]
  isMounted: boolean
  collapsedEras: string[]
  newDevelopment: NewDevelopment // You can use a more specific type here
  newLink: { title: string; url: string }
  setNewLink: (link: { title: string; url: string }) => void
  toggleEraCollapse: (eraId: string) => void
  toggleNodeExpansion: (nodeId: string | number) => void
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
  isTeacher,
  selectedNode,
  dialogOpen,
  setDialogOpen,
  addDialogOpen,
  setAddDialogOpen,
  selectedFilterTags,
  isMounted,
  collapsedEras,
  newDevelopment,
  newLink,
  setNewLink,
  toggleEraCollapse,
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


  // Derive collapsed centuries from collapsed eras and compute positions
  const { collapsedCenturies, centuryPositions } = useMemo(() => {
    const collapsedCenturyIds: string[] = []
    for (const era of eras) {
      if (collapsedEras.includes(era.id)) {
        for (const c of centuries) {
          if (c.startYear >= era.startYear && c.endYear <= era.endYear) {
            collapsedCenturyIds.push(c.id)
          }
        }
      }
    }
    return {
      collapsedCenturies: collapsedCenturyIds,
      centuryPositions: calculateCenturyPositions(collapsedCenturyIds),
    }
  }, [collapsedEras])

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
          collapsedEras={collapsedEras}
          position={position}
          zoomLevel={zoomLevel}
          onToggleEraCollapse={toggleEraCollapse}
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
                  <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(selectedNode.category || []).map((cat) => (
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

                <TabsContent value="dependencies">
                  {selectedNode.dependencies && selectedNode.dependencies.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {selectedNode.dependencies.map((depId) => {
                        const depNode = nodes.find((node) => String(node.id) === String(depId))
                        return depNode ? <li key={String(depId)}>{depNode.title}</li> : null
                      })}
                    </ul>
                  ) : (
                    <p>No dependencies.</p>
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

              {isTeacher && (
                <>
                  <Button onClick={() => onEditNode(selectedNode)} className="mt-4">
                    Edit Persistent Development
                  </Button>
                  <Button variant="destructive" onClick={() => onDeleteNode(String(selectedNode.id))} className="mt-2">
                     Delete Development From Database
                  </Button>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Development Dialog */}
      <AddDevelopmentDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        nodes={nodes}
        newDevelopment={newDevelopment}
        newLink={newLink}
        setNewLink={setNewLink}
        handleInputChange={handleInputChange}
        handleYearTypeChange={handleYearTypeChange}
        handleTagToggle={handleTagToggle}
        handleDependencyToggle={handleDependencyToggle}
        addLink={addLink}
        removeLink={removeLink}
        onSave={saveDevelopment}
      />
    </div>
  )
}
