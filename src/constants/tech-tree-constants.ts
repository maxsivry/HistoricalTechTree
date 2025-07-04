import type { Era, Century, DisciplineBands } from "@/lib/types/tech-tree"

export const eras: Era[] = [
    { id: "prehistoric", name: "Prehistoric", startYear: -10000, endYear: -3000, color: "bg-stone-600" },
    { id: "ancient", name: "Ancient Civilizations", startYear: -3000, endYear: -800, color: "bg-amber-700" },
    { id: "classical", name: "Classical Age", startYear: -800, endYear: 500, color: "bg-purple-700" },
    { id: "medieval", name: "Medieval Period", startYear: 500, endYear: 1400, color: "bg-blue-800" },
    { id: "renaissance", name: "Renaissance", startYear: 1400, endYear: 1700, color: "bg-emerald-700" },
    { id: "industrial", name: "Industrial Age", startYear: 1700, endYear: 1900, color: "bg-orange-700" },
    { id: "modern", name: "Modern Era", startYear: 1900, endYear: 2000, color: "bg-red-700" },
    { id: "information", name: "Information Age", startYear: 2000, endYear: 2100, color: "bg-cyan-700" },
  ]
  
  export const centuries: Century[] = [
    // BCE
    { id: "early-antiquity", name: "Early Antiquity", startYear: -3000, endYear: -800 },
    { id: "classical-antiquity", name: "Classical Antiquity", startYear: -800, endYear: 500 },
    // CE
    { id: "middle-ages", name: "Middle Ages", startYear: 500, endYear: 1400 },
    { id: "early-modern", name: "Early Modern", startYear: 1400, endYear: 1700 },
    { id: "industrial-era", name: "Industrial Era", startYear: 1700, endYear: 1900 },
    { id: "20th-century", name: "20th Century", startYear: 1900, endYear: 2000 },
    { id: "21st-century", name: "21st Century", startYear: 2000, endYear: 2100 },
  ]

// Define discipline bands for vertical organization
export const disciplineBands: DisciplineBands = {
  STEM: {
    categories: [
      "Mathematics",
      "Engineering",
      "Urban Planning",
      "Technology",
      "Medicine",
      "Astronomy",
      "Physics",
      "Cosmology",
      "Chemistry",
      "Biology",
      "Hydrology",
      "Evolution",
      "Science",
      "Logic",
      "Geometry",
    ],
    position: 200,
    color: "emerald",
  },
  Humanities: {
    categories: ["Literature", "Philosophy", "Religion", "Drama", "Art", "Music", "Poetry", "Media", "Language"],
    position: 400,
    color: "blue",
  },
  "Social Studies": {
    categories: ["History", "War", "Politics", "Economics", "Society", "Cartography", "Geography"],
    position: 600,
    color: "amber",
  },
  Geography: {
    categories: [
      "Hellas",
      "Athens",
      "Sparta",
      "Asia Minor",
      "Persian Empire",
      "Greek Islands",
      "Egypt",
      "Thebes",
      "Corinth",
      "Minor Poleis",
      "Beyond Hellas",
      "Black Sea",
    ],
    position: 800,
    color: "purple",
  },
}

// Available tags for developments
export const availableTags = [
  ...disciplineBands.STEM.categories,
  ...disciplineBands.Humanities.categories,
  ...disciplineBands["Social Studies"].categories,
  ...disciplineBands.Geography.categories,
]
