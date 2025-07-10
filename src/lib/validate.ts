export interface ValidationErrors {
    title?: string;
    year?: string;
  }
  
  export interface NodeFormData {
    title: string;
    year: number | ""; 
  }
  
  /**
   * Returns a map of `{ fieldName: errorMessage }`.
   * If the object is empty the input is valid.
   */
  export function validateNode(data: NodeFormData): ValidationErrors {
    const errors: ValidationErrors = {};
  
    // ── Title ────────────────────────────────────────────────────────────────────
    if (!data.title || data.title.trim().length === 0) {
      errors.title = "Title is required";
    }
  
    // ── Year ─────────────────────────────────────────────────────────────────────
    if (data.year === "" || data.year === null || data.year === undefined || Number.isNaN(data.year as number)) {
      errors.year = "Year is required";
    } else {
      const yearNum = Number(data.year);
      if (yearNum > -300 || yearNum < -10000) {
        errors.year = "Year must be between −10 000 and −300";
      }
    }
  
    return errors;
  }