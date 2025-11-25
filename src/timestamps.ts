export interface DayBoundaries {
  beginning: number;
  end: number;
}

export interface TodayTomorrowBoundaries {
  today: DayBoundaries;
  tomorrow: DayBoundaries;
}

export const getDayBoundaries = (date: Date): DayBoundaries => {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const beginning = Math.floor(utcDate.getTime() / 1000);
  const end = Math.floor(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999) / 1000);
  return { beginning, end };
};

export const getTodayTomorrowBoundaries = (): TodayTomorrowBoundaries => {
  const now = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    today: getDayBoundaries(now),
    tomorrow: getDayBoundaries(tomorrow),
  };
};
