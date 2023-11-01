import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

export function getFromNowStr(input: string): string {
  return dayjs(input).fromNow();
}

export function getNow() {
  return toSeconds(roundHour(dayjs()));
}

export function getNowMinus(value: number, unit: dayjs.ManipulateType) {
  return toSeconds(roundHour(dayjs().subtract(value, unit)));
}

export function minus24Hours(seconds: number) {
  const ms = seconds * 1000;
  return toSeconds(roundHour(dayjs(ms).subtract(24, "hours")));
}

export function add24Hours(seconds: number) {
  const ms = seconds * 1000;
  return toSeconds(roundHour(dayjs(ms).add(24, "hours")));
}

function roundHour(dayjs: dayjs.Dayjs) {
  return dayjs.minute(0).second(0).millisecond(0);
}

function toSeconds(input: dayjs.Dayjs): number {
  return Math.round(Number(input.toDate()) / 1000);
}

export function dateToHnSeconds(input: Date): number {
  return toSeconds(roundHour(dayjs(input)));
}

export function secondsToDateString(seconds: number): string {
  const ms = seconds * 1000;
  return formatForDateInput(dayjs(new Date(ms)));
}

export function todayDateString(): string {
  return formatForDateInput(dayjs());
}

function formatForDateInput(input: dayjs.Dayjs): string {
  return input.format("YYYY-MM-DD");
}
