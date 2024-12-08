// src/types.ts
export interface Job {
    _id: string;
    selectedDays: string[];
    fromTime: string;
    toTime: string;
    everyTime: string;
    active: boolean;
  }
  