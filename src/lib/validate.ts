
export const validateTitle = (title: string): string | null => {
  if (!title) {
    return "Title is required.";
  }
  return null;
};

export const validateYear = (year: number): string | null => {
  if (year < -20000 || year > 2100) {
    return "Year must be between -10,000 and -300.";
  }
  return null;
};
