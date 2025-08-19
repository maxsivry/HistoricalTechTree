"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import type { NewDevelopment, TechNode } from "@/lib/types/tech-tree"
import { availableTags } from "@/constants/tech-tree-constants"

interface AddDevelopmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  nodes: TechNode[]
  newDevelopment: NewDevelopment
  newLink: { title: string; url: string }
  setNewLink: (link: { title: string; url: string }) => void
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleYearTypeChange: (type: "BCE" | "CE") => void
  handleTagToggle: (tag: string) => void
  handleDependencyToggle: (nodeId: string) => void
  addLink: () => void
  removeLink: (index: number) => void
  onSave: () => void
}

export default function AddDevelopmentDialog({
  open,
  onOpenChange,
  nodes,
  newDevelopment,
  newLink,
  setNewLink,
  handleInputChange,
  handleYearTypeChange,
  handleTagToggle,
  handleDependencyToggle,
  addLink,
  removeLink,
  onSave,
}: AddDevelopmentDialogProps) {
  const [depQuery, setDepQuery] = useState("")
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              <input type="text" pattern="[0-9]*" id="year" name="year" value={newDevelopment.year} onChange={handleInputChange} className="border rounded px-3 py-2 w-24" />
              <Button variant={newDevelopment.yearType === "BCE" ? "default" : "outline"} size="sm" className="ml-2" onClick={() => handleYearTypeChange("BCE")}>
                BCE
              </Button>
              <Button variant={newDevelopment.yearType === "CE" ? "default" : "outline"} size="sm" className="ml-2" onClick={() => handleYearTypeChange("CE")}>
                CE
              </Button>
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
            <div className="col-span-3 space-y-2">
              {/* Selected dependencies */}
              {newDevelopment.dependencies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newDevelopment.dependencies.map((id) => {
                    const n = nodes.find((p) => String(p.id) === String(id))
                    if (!n) return null
                    return (
                      <Button key={id} variant="secondary" size="sm" onClick={() => handleDependencyToggle(String(id))}>
                        {n.title} <span className="ml-1">×</span>
                      </Button>
                    )
                  })}
                </div>
              )}

              {/* Search input */}
              <div className="space-y-2">
                <Input
                  placeholder="Search dependencies by title..."
                  value={depQuery}
                  onChange={(e) => setDepQuery(e.target.value)}
                />
                {(() => {
                  const filtered = depQuery
                    ? nodes.filter((n) => n.title.toLowerCase().includes(depQuery.toLowerCase()))
                    : []
                  if (!depQuery) return null
                  return filtered.length > 0 ? (
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {filtered.map((n) => (
                        <Button
                          key={n.id}
                          variant={newDevelopment.dependencies.includes(String(n.id)) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleDependencyToggle(String(n.id))}
                        >
                          {n.title}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No dependency found</p>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={onSave}>Add for Session</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
