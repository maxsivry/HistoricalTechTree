export interface TechNode {
    id: string | number;
    title: string
    year: number
    description?: string
    category?: string[]
    era?: string
    century?: string
    dependencies?: string[]
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

  export interface NewDevelopment {
    title: string
    year: number
    yearType: "BCE" | "CE"
    description: string
    category: string[]
    links: { title: string; url: string }[]
    dependencies: string[]
  }