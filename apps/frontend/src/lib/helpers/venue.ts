import type { Venue } from "@rolle/types";
import type { DaysOfTheWeek } from "@rolle/ui";

type VenueIsOpen =
    | {
          status: true;
          nextClose: [number, number] | [string];
      }
    | {
          status: false;
          nextOpen: [number, number] | [DaysOfTheWeek];
      };

function getNextOpenDayOfTheWeek(workingHours: Venue["workingHours"]): DaysOfTheWeek | undefined {
    if (typeof workingHours === "undefined") {
        throw new Error("Working hours must not be undefined.");
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dayOfTheWeek: DaysOfTheWeek | undefined = undefined;
    while (typeof dayOfTheWeek === "undefined") {
        dayOfTheWeek = tomorrow
            .toLocaleDateString("en-US", { weekday: "long" })
            .toLowerCase() as DaysOfTheWeek;

        if (typeof workingHours[dayOfTheWeek] !== "undefined") {
            return dayOfTheWeek;
        }

        tomorrow.setDate(tomorrow.getDate() + 1);
    }
}

export function getVenueStatus(venue: Venue): VenueIsOpen | undefined {
    const todayOfTheWeek = new Date()
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase() as DaysOfTheWeek;

    const todayWorkingHours = venue.workingHours ? venue.workingHours[todayOfTheWeek] : undefined;

    if (typeof todayWorkingHours === "undefined") {
        const anyDayWorkingHours = venue.workingHours
            ? Object.keys(venue.workingHours).length > 0
            : undefined;

        if (typeof anyDayWorkingHours === "undefined") {
            return;
        }

        const nextOpeningDayOfTheWeek = getNextOpenDayOfTheWeek(venue.workingHours)!;

        return { status: false, nextOpen: [nextOpeningDayOfTheWeek] };
    }

    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    for (const workingHour of todayWorkingHours) {
        const [startHourText, startMinuteText] = workingHour.start.split(":");

        if (startHourText === "Aberto 24 horas") {
            return { status: true, nextClose: ["Aberto 24 horas"] };
        }

        const startHour = parseInt(startHourText, 10);
        const startMinute = parseInt(startMinuteText, 10);

        const [endHourText, endMinuteText] = workingHour.end.split(":");
        const endHour = parseInt(endHourText, 10);
        const endMinute = parseInt(endMinuteText, 10);

        if (
            Number.isNaN(startHour) ||
            Number.isNaN(startMinute) ||
            Number.isNaN(endHour) ||
            Number.isNaN(endMinute)
        ) {
            return undefined;
        }

        if (hour > startHour && hour < endHour) {
            return { status: true, nextClose: [endHour, endMinute] };
        } else if (hour === startHour && minute > startMinute) {
            return { status: true, nextClose: [endHour, endMinute] };
        } else if (hour === endHour && minute < endMinute) {
            return { status: true, nextClose: [endHour, endMinute] };
        }
    }

    const tomorrowOfTheWeek = new Date();
    tomorrowOfTheWeek.setDate(tomorrowOfTheWeek.getDate() + 1);
    const tomorrowOfTheWeekText = tomorrowOfTheWeek
        .toLocaleDateString("en-US", { weekday: "long" })
        .toLowerCase() as DaysOfTheWeek;
    const tomorrowWorkingHours = venue.workingHours
        ? venue.workingHours[tomorrowOfTheWeekText]
        : undefined;
    if (typeof tomorrowWorkingHours === "undefined") return;

    const [startHourText, startMinuteText] = tomorrowWorkingHours[0].start.split(":");
    const startHour = parseInt(startHourText, 10);
    const startMinute = parseInt(startMinuteText, 10);
    return { status: false, nextOpen: [startHour, startMinute] };
}
