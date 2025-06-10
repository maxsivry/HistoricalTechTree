export interface TechNode {
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
    expanded?: boolean
  }
  
  export interface Era {
    id: string
    name: string
    startYear: number
    endYear: number
    color: string
  }
  
  export interface Century {
    id: string
    name: string
    startYear: number
    endYear: number
  }
  
  export interface DisciplineBand {
    categories: string[]
    position: number
    color: string
  }
  
  export interface DisciplineBands {
    [key: string]: DisciplineBand
  }