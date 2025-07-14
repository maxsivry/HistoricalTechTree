
export const validateTitle = (title: string): string | null => {
  if (!title) {
    return "Title is required.";
  }
  return null;
};

export const validateYear = (year: number): string | null => {
  if (year < -10000 || year > -300) {
    return "Year must be between -10,000 and -300.";
  }
  return null;
};
