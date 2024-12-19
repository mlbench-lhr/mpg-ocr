// src/types.ts
export interface Job {
    _id: string;
    selectedDays: string[];
    fromTime: string | null;  // Allow null here
    toTime: string | null;
    everyTime: string;
    active: boolean;
  }
  