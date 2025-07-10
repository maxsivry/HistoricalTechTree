
"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { MultiSelect } from "@/components/ui/multi-select"
import { Badge } from "@/components/ui/badge"
import { disciplineBands } from "@/constants/tech-tree-constants";




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
}

interface NodeEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  node?: TechNode | null
  onSave: (node: TechNode) => void
  allNodes: TechNode[]
  categories: string[]
  eras: { id: string; name: string }[]
}


export default function NodeEditor({ open, onOpenChange, node, onSave, allNodes, categories, eras }: NodeEditorProps) {
  const isNewNode = !node?.id

  const [formData, setFormData] = useState<TechNode>(
    node || {
      id: "",
      title: "",
      year: 0,
      description: "",
      category: [],
      era: "",
      century: "",
      dependencies: [],
      links: [],
      people: [],
    },
  )

  const [links, setLinks] = useState<{ title: string; url: string }[]>(node?.links || [])

  const [people, setPeople] = useState<string[]>(node?.people || [])

  const [newLink, setNewLink] = useState({ title: "", url: "" })
  const [newPerson, setNewPerson] = useState("")


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "year" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleCategoryChange = (selected: string[]) => {
    setFormData((prev) => ({
      ...prev,
      category: selected,
    }))
  }

  const handleDependenciesChange = (selected: string[]) => {
    setFormData((prev) => ({
      ...prev,
      dependencies: selected,
    }))
  }

  const addLink = () => {
    if (newLink.title && newLink.url) {
      setLinks((prev) => [...prev, { ...newLink }])
      setNewLink({ title: "", url: "" })
    }
  }

  const removeLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index))
  }

  const addPerson = () => {
    if (newPerson) {
      setPeople((prev) => [...prev, newPerson])
      setNewPerson("")
    }
  }

  const removePerson = (index: number) => {
    setPeople((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    // Generate ID from title if new node
    const nodeToSave = {
      ...formData,
      id: formData.id || formData.title.toLowerCase().replace(/\s+/g, "-"),
      links,
      people,
    }

    // Determine century based on year
    const century = getCenturyFromYear(nodeToSave.year)
    nodeToSave.century = century

    // Determine era based on year
    const era = getEraFromYear(nodeToSave.year)
    if (era) {
      nodeToSave.era = era.id
    }

    onSave(nodeToSave)
    onOpenChange(false)
  }

  // Helper function to determine century from year
  const getCenturyFromYear = (year: number): string => {
    const absYear = Math.abs(year)
    const centuryNum = Math.ceil(absYear / 100)

    if (year < 0) {
      return `${centuryNum}bce`
    } else {
      return `${centuryNum}ce`
    }
  }

  // Helper function to determine era from year
  const getEraFromYear = (year: number) => {
    return eras.find((era) => {
      const startYear = Number.parseInt(era.id.split("-")[0])
      const endYear = Number.parseInt(era.id.split("-")[1])
      return year >= startYear && year <= endYear
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNewNode ? "Add New Development" : "Edit Development"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input id="title" name="title" value={formData.title} onChange={handleInputChange} className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="year" className="text-right">
              Year
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                id="year"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleInputChange}
                className="w-32"
              />
              <span>{formData.year < 0 ? "BCE" : "CE"}</span>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="col-span-3"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Categories</Label>
            <div className="col-span-3">
              <div className="mb-2">
                <p className="text-sm text-muted-foreground mb-1">Select discipline categories:</p>
                <MultiSelect
                  options={categories.map((cat) => ({ label: cat, value: cat }))}
                  selected={formData.category}
                  onChange={handleCategoryChange}
                  placeholder="Select categories..."
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Discipline placement:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {Object.entries(disciplineBands).map(([name, band]) => {
                    const hasCategory = formData.category.some((cat) => band.categories.includes(cat))
                    return (
                      <Badge
                        key={name}
                        variant={hasCategory ? "default" : "outline"}
                        className={hasCategory ? `bg-${band.color}-600 hover:bg-${band.color}-700` : ""}
                      >
                        {name}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Dependencies</Label>
            <div className="col-span-3">
              <MultiSelect
                options={allNodes.filter((n) => n.id !== formData.id).map((n) => ({ label: n.title, value: n.id }))}
                selected={formData.dependencies}
                onChange={handleDependenciesChange}
                placeholder="Select dependencies..."
              />
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
                  <Button variant="ghost" size="sm" onClick={() => removeLink(index)}>
                    Remove
                  </Button>
                </div>
              ))}

              <div className="flex items-end gap-2">
                <div className="space-y-1 flex-1">
                  <Input
                    placeholder="Link title"
                    value={newLink.title}
                    onChange={(e) => setNewLink((prev) => ({ ...prev, title: e.target.value }))}
                  />
                  <Input
                    placeholder="URL"
                    value={newLink.url}
                    onChange={(e) => setNewLink((prev) => ({ ...prev, url: e.target.value }))}
                  />
                </div>
                <Button type="button" onClick={addLink}>
                  Add
                </Button>
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
                    <button onClick={() => removePerson(index)} className="ml-1 hover:text-destructive">
                      ×
                    </button>
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add person"
                  value={newPerson}
                  onChange={(e) => setNewPerson(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" onClick={addPerson}>
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}