"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { TechNode } from "@/lib/types/tech-tree"
import { getEraForYear, getCenturyForYear } from "@/utils/tech-tree-utils"

export const useTechTreeState = (initialNodes: TechNode[] = []) => {
  const [techNodes, setTechNodes] = useState<TechNode[]>(initialNodes)
  const [selectedNode, setSelectedNode] = useState<TechNode | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedFilterTags, setSelectedFilterTags] = useState<string[]>([])
  const [isMounted, setIsMounted] = useState(false)
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

  const [newLink, setNewLink] = useState({ title: "", url: "" })

  // Set isMounted to true after component mounts
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Update techNodes when nodes prop changes
  useEffect(() => {
    setTechNodes(initialNodes)
  }, [initialNodes])

  // Toggle century collapse state
  const toggleCenturyCollapse = (centuryId: string) => {
    setCollapsedCenturies((prev) =>
      prev.includes(centuryId) ? prev.filter((id) => id !== centuryId) : [...prev, centuryId],
    )
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

  // Toggle filter tag
  const toggleFilterTag = (tag: string) => {
    setSelectedFilterTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((t) => t !== tag)
      } else {
        return [...prev, tag]
      }
    })
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedFilterTags([])
  }

  // Handle input change for new development
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewDevelopment((prev) => ({
      ...prev,
      [name]: name === "year" ? Math.abs(Number.parseInt(value) || 0) : value,
    }))
  }

  // Handle year type change
  const handleYearTypeChange = (type: "BCE" | "CE") => {
    setNewDevelopment((prev) => ({
      ...prev,
      yearType: type,
    }))
  }

  // Handle dependency selection
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

  // Toggle a tag in the new development form
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

  return {
    // State
    techNodes,
    setTechNodes,
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

    // Actions
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
  }
}
