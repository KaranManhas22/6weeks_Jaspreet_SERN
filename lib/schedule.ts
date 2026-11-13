export interface DaySchedule {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface SpecialDateOverride {
  date: string;
  reason: string;
  isClosed: boolean;
  open?: string;
  close?: string;
}

export interface CanteenSchedule {
  weekly: DaySchedule[];
  specialDates: SpecialDateOverride[];
  note?: string;
}

export const DEFAULT_WEEKLY_SCHEDULE: DaySchedule[] = [
  { day: "Monday", open: "08:00", close: "21:00", isClosed: false },
  { day: "Tuesday", open: "08:00", close: "21:00", isClosed: false },
  { day: "Wednesday", open: "08:00", close: "21:00", isClosed: false },
  { day: "Thursday", open: "08:00", close: "21:00", isClosed: false },
  { day: "Friday", open: "08:00", close: "21:00", isClosed: false },
  { day: "Saturday", open: "09:00", close: "19:00", isClosed: false },
  { day: "Sunday", open: "10:00", close: "16:00", isClosed: true },
];

export function getCanteenScheduleStatus(
  rawSchedule?: any,
  targetDate: Date = new Date()
): {
  isOpen: boolean;
  reason: string;
  todayHours?: { open: string; close: string; isClosed: boolean };
  dayName: string;
  nextOpenNotice?: string;
} {
  const weekly: DaySchedule[] = (rawSchedule && Array.isArray(rawSchedule.weekly) && rawSchedule.weekly.length > 0)
    ? rawSchedule.weekly
    : DEFAULT_WEEKLY_SCHEDULE;

  const specialDates: SpecialDateOverride[] = (rawSchedule && Array.isArray(rawSchedule.specialDates))
    ? rawSchedule.specialDates
    : [];

  const dateStr = targetDate.toLocaleDateString("en-CA"); // "YYYY-MM-DD"
  const timeStr = targetDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); // "HH:mm"
  const dayName = new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(targetDate);

  // 1. Advance Special Date Check
  const specialMatch = specialDates.find((sd) => sd.date === dateStr);
  if (specialMatch) {
    if (specialMatch.isClosed) {
      return {
        isOpen: false,
        reason: specialMatch.reason || `Closed for Holiday / Event`,
        todayHours: { open: "00:00", close: "00:00", isClosed: true },
        dayName,
      };
    }

    const openTime = specialMatch.open || "08:00";
    const closeTime = specialMatch.close || "21:00";

    if (timeStr < openTime || timeStr > closeTime) {
      return {
        isOpen: false,
        reason: `Special Hours (${openTime} - ${closeTime})`,
        todayHours: { open: openTime, close: closeTime, isClosed: false },
        dayName,
      };
    }

    return {
      isOpen: true,
      reason: `Open today (${openTime} - ${closeTime})`,
      todayHours: { open: openTime, close: closeTime, isClosed: false },
      dayName,
    };
  }

  // 2. Regular Weekly Schedule
  const daySchedule = weekly.find((d) => d.day.toLowerCase() === dayName.toLowerCase()) || {
    day: dayName,
    open: "08:00",
    close: "21:00",
    isClosed: false,
  };

  if (daySchedule.isClosed) {
    return {
      isOpen: false,
      reason: `Closed on ${dayName}s (Weekly Off)`,
      todayHours: daySchedule,
      dayName,
    };
  }

  if (timeStr < daySchedule.open) {
    return {
      isOpen: false,
      reason: `Opens at ${daySchedule.open} today`,
      todayHours: daySchedule,
      dayName,
    };
  }

  if (timeStr > daySchedule.close) {
    return {
      isOpen: false,
      reason: `Closed for the day (Closes at ${daySchedule.close})`,
      todayHours: daySchedule,
      dayName,
    };
  }

  return {
    isOpen: true,
    reason: `Open today until ${daySchedule.close}`,
    todayHours: daySchedule,
    dayName,
  };
}
