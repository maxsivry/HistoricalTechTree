import type { Era, Century, DisciplineBands } from "@/lib/types/tech-tree"

export const eras: Era[] = [
    { id: "prehistoric", name: "Prehistoric", startYear: -10000, endYear: -3000, color: "bg-stone-600" },
    { id: "ancient", name: "Ancient Civilizations", startYear: -3000, endYear: -800, color: "bg-amber-700" },
    { id: "classical", name: "Archaic Age", startYear: -800, endYear: -500, color: "bg-purple-700" },
    { id: "medieval", name: "Classical Age", startYear: -500, endYear: -300, color: "bg-blue-800" },
  ]
  
  
export const centuries: Century[] = [
    // BCE
    { id: "prehistory-segment", name: "Prehistory", startYear: -10000, endYear: -3000 },
    { id: "early-antiquity", name: "Early Antiquity", startYear: -3000, endYear: -800 },
    { id: "classical-antiquity", name: "Classical Antiquity", startYear: -800, endYear: 500 },
    // CE
    { id: "middle-ages", name: "Middle Ages", startYear: 500, endYear: 1400 },
    { id: "early-modern", name: "Early Modern", startYear: 1400, endYear: 1700 },
    { id: "industrial-era", name: "Industrial Era", startYear: 1700, endYear: 1900 },
    { id: "20th-century", name: "20th Century", startYear: 1900, endYear: 2000 },
    { id: "21st-century", name: "21st Century", startYear: 2000, endYear: 2100 },
  ]

//to add a category, add the name of the category in double quotes inside of the comma separated list ["A", "B", "C"] under the corresponding discipline
export const disciplineBands: DisciplineBands = {
  STEM: {
    categories: ["Mathematics", "Engineering", "Technology", "Medicine", "Astronomy", "Physics", "Chemistry", "Biology", "Agriculture" ],
    position: 200,
    color: "emerald",
  },
  Humanities: {
    categories: ["Literature", "Art", "Religion", "Philosophy", "Media", "Music" ],
    position: 400,
    color: "blue",
  },
  "Social Studies": {
    categories: ["History", "Warfare", "Politics", "Economics & Trade", "Geography", "Law & Justice", "Demography"],
    position: 600,
    color: "amber",
  },

}

// Available tags for developments
export const availableTags = [
  ...disciplineBands.STEM.categories,
  ...disciplineBands.Humanities.categories,
  ...disciplineBands["Social Studies"].categories,
]
