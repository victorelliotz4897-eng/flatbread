const hostRotation = ["Aaron Silvers", "Jack Dweck", "Jack Sasson", "Victor Zeitoune"];

export const LANDING_GAME_KEY = "flatbread-landing-game-v4";

export const hostOrder = hostRotation;
export const currentHostStart = new Date(2026, 1, 1); // February 2026 (Aaron starts this month)
export const currentHost = hostRotation[0];
export const flatbreadStart = new Date(2020, 9, 1); // October 2020
export const flatbreadMilestoneAsOf = new Date(2026, 1, 1); // February 2026

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

export function getMonthNameAndYear(value) {
  const monthIndex = value.getMonth();
  return `${MONTH_NAMES[monthIndex]} ${value.getFullYear()}`;
}

export function getFlatbreadMonthCount(asOf = new Date()) {
  const start = new Date(flatbreadStart.getFullYear(), flatbreadStart.getMonth(), 1);
  const end = new Date(asOf.getFullYear(), asOf.getMonth(), 1);
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
}

export function hostForMonth(baseDate = new Date()) {
  const monthDiff =
    (baseDate.getFullYear() - currentHostStart.getFullYear()) * 12 +
    (baseDate.getMonth() - currentHostStart.getMonth());
  const index = ((monthDiff % hostRotation.length) + hostRotation.length) % hostRotation.length;
  return hostRotation[index];
}

export function nextHostForMonth(baseDate = new Date()) {
  const monthDiff =
    (baseDate.getFullYear() - currentHostStart.getFullYear()) * 12 +
    (baseDate.getMonth() - currentHostStart.getMonth()) +
    1;
  const index = ((monthDiff % hostRotation.length) + hostRotation.length) % hostRotation.length;
  return hostRotation[index];
}
