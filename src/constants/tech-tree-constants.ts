import type { Era, Century, DisciplineBands } from "@/lib/types/tech-tree"

// Replace the eras array with just the Classical Age
export const eras: Era[] = [
  { id: "classical", name: "Classical Age", startYear: -800, endYear: -30, color: "bg-purple-700" },
]

// Update the centuries array to include only Classical Age periods
export const centuries: Century[] = [
  // Classical Age periods
  { id: "archaic", name: "Archaic Era (9th-6th centuries)", startYear: -800, endYear: -600 },
  { id: "classical-period", name: "Classical Period (6th-4th centuries)", startYear: -600, endYear: -323 },
  { id: "hellenistic", name: "Hellenistic Period (4th-1st centuries)", startYear: -323, endYear: -30 },
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
