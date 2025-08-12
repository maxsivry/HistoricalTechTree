"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { disciplineBands, availableTags } from "@/constants/tech-tree-constants"
import type { TechNode } from "@/lib/types/tech-tree"

export type PersistantNodeFormData = Omit<TechNode, "year"> & { year: string | number }

interface PersistantNodeFormProps {
  formData: PersistantNodeFormData
  yearType: "BCE" | "CE"
  errors: { title?: string; year?: string }
  categories: string[]
  allNodes: TechNode[]
  links: { title: string; url: string }[]
  people: string[]
  newLink: { title: string; url: string }
  newPerson: string
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onYearTypeChange: (type: "BCE" | "CE") => void
  onCategoryChange: (selected: string[]) => void
  onDependenciesChange: (selected: string[]) => void
  onAddLink: () => void
  onRemoveLink: (index: number) => void
  onSetNewLink: (link: { title: string; url: string }) => void
  onAddPerson: () => void
  onRemovePerson: (index: number) => void
  onSetNewPerson: (name: string) => void
  onCancel: () => void
  onSave: () => void
}

export default function PersistantNodeForm({
  formData,
  yearType,
  errors,
  allNodes,
  links,
  people,
  newLink,
  newPerson,
  onInputChange,
  onYearTypeChange,
  onCategoryChange,
  onDependenciesChange,
  onAddLink,
  onRemoveLink,
  onSetNewLink,
  onAddPerson,
  onRemovePerson,
  onSetNewPerson,
  onCancel,
  onSave,
}: PersistantNodeFormProps) {
  return (
    <>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">Title</Label>
          <Input id="title" name="title" value={formData.title} onChange={onInputChange} className="col-span-3" />
          {errors.title && <p className="col-span-4 text-red-500 text-xs text-right">{errors.title}</p>}
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="year" className="text-right">Year</Label>
          <div className="col-span-3 flex items-center gap-2">
            <Input id="year" name="year" type="text" value={formData.year} onChange={onInputChange} className="w-32" />
            <Button variant={yearType === "BCE" ? "default" : "outline"} size="sm" className="ml-2" onClick={() => onYearTypeChange("BCE")}>BCE</Button>
            <Button variant={yearType === "CE" ? "default" : "outline"} size="sm" className="ml-2" onClick={() => onYearTypeChange("CE")}>CE</Button>
          </div>
          {errors.year && <p className="col-span-4 text-red-500 text-xs text-right">{errors.year}</p>}
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">Description</Label>
          <Textarea id="description" name="description" value={formData.description || ''} onChange={onInputChange} className="col-span-3" rows={4} />
        </div>

        <div className="grid grid-cols-4 items-start gap-4">
          <Label className="text-right mt-2">Tags</Label>
          <div className="col-span-3">
            <div className="mb-2">
              <p className="text-sm text-muted-foreground mb-1">Select one or more tags:</p>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {availableTags.map((tag) => {
                  const selected = (formData.category || []).includes(tag)
                  return (
                    <Button
                      key={tag}
                      variant={selected ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const current = new Set(formData.category || [])
                        if (current.has(tag)) {
                          current.delete(tag)
                        } else {
                          current.add(tag)
                        }
                        onCategoryChange(Array.from(current))
                      }}
                    >
                      {tag}
                    </Button>
                  )
                })}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Discipline placement:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {Object.entries(disciplineBands).map(([name, band]) => {
                  const hasCategory = (formData.category || []).some((cat) => band.categories.includes(cat))
                  return (
                    <Badge key={name} variant={hasCategory ? "default" : "outline"} className={hasCategory ? `bg-${band.color}-600 hover:bg-${band.color}-700` : ""}>
                      {name}
                    </Badge>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 items-start gap-4">
          <Label className="text-right mt-2">Dependencies</Label>
          <div className="col-span-3">
            {(() => {
              const rawYear = typeof formData.year === "number" ? formData.year : Number(formData.year || 0)
              const finalYear = isNaN(rawYear) ? Number.NEGATIVE_INFINITY : (yearType === "BCE" ? -Math.abs(rawYear) : Math.abs(rawYear))
              const pastNodes = allNodes
                .filter((n) => n.id !== formData.id && typeof n.year === "number" && n.year < finalYear)
                .sort((a, b) => a.year - b.year)

              if (pastNodes.length === 0) {
                return <p className="text-sm text-muted-foreground">No past events available</p>
              }

              const current = new Set(formData.dependencies || [])

              const toggleDep = (id: string) => {
                if (current.has(id)) {
                  current.delete(id)
                } else {
                  current.add(id)
                }
                onDependenciesChange(Array.from(current))
              }

              return (
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {pastNodes.map((n) => {
                    const id = String(n.id)
                    const selected = current.has(id)
                    return (
                      <Button
                        key={id}
                        variant={selected ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleDep(id)}
                      >
                        {n.title}
                      </Button>
                    )
                  })}
                </div>
              )
            })()}
          </div>
        </div>

        <div className="grid grid-cols-4 items-start gap-4">
          <Label className="text-right pt-2">Links</Label>
          <div className="col-span-3 space-y-2">
            {links.map((link, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-1 text-sm truncate">
                  {link.title}: {link.url}
                </span>
                <Button variant="ghost" size="sm" onClick={() => onRemoveLink(index)}>
                  Remove
                </Button>
              </div>
            ))}

            <div className="flex items-end gap-2">
              <div className="space-y-1 flex-1">
                <Input placeholder="Link title" value={newLink.title} onChange={(e) => onSetNewLink({ ...newLink, title: e.target.value })} />
                <Input placeholder="URL" value={newLink.url} onChange={(e) => onSetNewLink({ ...newLink, url: e.target.value })} />
              </div>
              <Button type="button" onClick={onAddLink}>Add</Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 items-start gap-4">
          <Label className="text-right pt-2">People</Label>
          <div className="col-span-3 space-y-2">
            <div className="flex flex-wrap gap-1">
              {people.map((person, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {person}
                  <button onClick={() => onRemovePerson(index)} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Input placeholder="Add person" value={newPerson} onChange={(e) => onSetNewPerson(e.target.value)} className="flex-1" />
              <Button type="button" onClick={onAddPerson}>Add</Button>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSave}>Save</Button>
      </DialogFooter>
    </>
  )
}
