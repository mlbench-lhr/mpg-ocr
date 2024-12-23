export interface Job {
    _id: string;
    selectedDays: string[];
    fromTime: string | null;
    toTime: string | null;
    everyTime: string;
    active: boolean;
  }
  