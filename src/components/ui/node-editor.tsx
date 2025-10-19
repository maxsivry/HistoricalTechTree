
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { validateTitle, validateYear } from "@/lib/validate";
import type { TechNode } from "@/lib/types/tech-tree";
import PersistantNodeForm from "@/components/ui/persistant-node-form"

interface NodeEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  node?: TechNode | null
  onSave: (node: TechNode) => Promise<void> | void
  onDelete?: (id: string | number) => void
  allNodes: TechNode[]
  categories: string[]
  eras: { id: string; name: string }[]
  isSaving: boolean
}

type NodeFormData = Omit<TechNode, "year"> & { year: string | number }

export default function NodeEditor({
  open,
  onOpenChange,
  node,
  onSave,
  allNodes,
  categories,
  eras,
  isSaving,
}: NodeEditorProps) {
  const isNewNode = !node?.id

  const [formData, setFormData] = useState<NodeFormData>(
    node || {
      id: "",
      title: "",
      year: "",
      description: "",
      category: [],
      era: "",
      century: "",
      dependencies: [],
      links: [],
      people: [],
    },
  )
  const [yearType, setYearType] = useState<"BCE" | "CE">("CE")

  const [links, setLinks] = useState<{ title: string; url: string }[]>(node?.links || [])

  const [people, setPeople] = useState<string[]>(node?.people || [])

  const [newLink, setNewLink] = useState({ title: "", url: "" })
  const [newPerson, setNewPerson] = useState("")
  const [errors, setErrors] = useState<{ title?: string; year?: string }>({});

  // Prefill form when opening editor or when selected node changes
  useEffect(() => {
    if (!open) return;
    if (node) {
      const y = typeof node.year === "number" ? node.year : Number(node.year)
      const isBce = !isNaN(y) && y < 0
      setYearType(isBce ? "BCE" : "CE")
      setFormData({
        ...node,
        year: isNaN(y) ? "" : Math.abs(y),
      })
      setLinks(node.links || [])
      setPeople(node.people || [])
      setNewLink({ title: "", url: "" })
      setNewPerson("")
      setErrors({})
    } else {
      // Reset for creating a new node
      setYearType("CE")
      setFormData({
        id: "",
        title: "",
        year: "",
        description: "",
        category: [],
        era: "",
        century: "",
        dependencies: [],
        links: [],
        people: [],
      })
      setLinks([])
      setPeople([])
      setNewLink({ title: "", url: "" })
      setNewPerson("")
      setErrors({})
    }
  }, [open, node])


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "year" ? value : value,
    }))
  }

  const handleCategoryChange = (selected: string[]) => {
    setFormData((prev) => ({
      ...prev,
      category: selected,
    }))
  }

  const handleYearTypeChange = (type: "BCE" | "CE") => {
    setYearType(type);
  };

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

  const handleSave = async () => {
    const titleError = validateTitle(formData.title);

    const yearAsNumber = Number(formData.year);
    const finalYear = yearType === "BCE" ? -Math.abs(yearAsNumber) : Math.abs(yearAsNumber);

    let yearError: string | null = null;
    if (formData.year === "") {
      yearError = "Year is required.";
    } else if (isNaN(yearAsNumber)) {
      yearError = "Year must be a number.";
    } else {
      yearError = validateYear(finalYear);
    }

    const newErrors: { title?: string; year?: string } = {};
    if (titleError) {
      newErrors.title = titleError;
    }
    if (yearError) {
      newErrors.year = yearError;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    // Generate ID from title if new node
    const nodeToSave: TechNode = {
      ...formData,
      id: formData.id || formData.title.toLowerCase().replace(/\s+/g, "-"),
      links,
      people,
      year: finalYear,
    }

    // Determine century based on year
    const century = getCenturyFromYear(nodeToSave.year)
    nodeToSave.century = century

    // Determine era based on year
    const era = getEraFromYear(nodeToSave.year)
    if (era) {
      nodeToSave.era = era.id
    }

    await onSave(nodeToSave)
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

        <PersistantNodeForm
          formData={formData}
          yearType={yearType}
          errors={errors}
          categories={categories}
          allNodes={allNodes}
          links={links}
          people={people}
          newLink={newLink}
          newPerson={newPerson}
          onInputChange={handleInputChange}
          onYearTypeChange={handleYearTypeChange}
          onCategoryChange={handleCategoryChange}
          onDependenciesChange={handleDependenciesChange}
          onAddLink={addLink}
          onRemoveLink={removeLink}
          onSetNewLink={setNewLink}
          onAddPerson={addPerson}
          onRemovePerson={removePerson}
          onSetNewPerson={setNewPerson}
          onCancel={() => onOpenChange(false)}
          onSave={handleSave}
          isSaving={isSaving}
        />

      </DialogContent>
    </Dialog>
  )
}
