import { Week } from "./notion";

export function getDay(week: Week) {
    switch (week) {
        case "Monday":
            return 1;
        case "Tuesday":
            return 2;
        case "Wednesday":
            return 3;
        case "Thursday":
            return 4;
        case "Friday":
            return 5;
        case "Saturday":
            return 6;
        case "Sunday":
            return 7;
    }
}

export function hourToMinute(hour: string) {
    const str = hour.split(":");
    let res = Number(str[0]) * 60;
    if (str.length === 2) res += Number(str[1]);
    return res;
}