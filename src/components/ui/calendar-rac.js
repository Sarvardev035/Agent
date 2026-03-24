"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from "@/lib/utils";
import { getLocalTimeZone, today } from "@internationalized/date";
import { Button, CalendarCell as CalendarCellRac, CalendarGridBody as CalendarGridBodyRac, CalendarGridHeader as CalendarGridHeaderRac, CalendarGrid as CalendarGridRac, CalendarHeaderCell as CalendarHeaderCellRac, Calendar as CalendarRac, Heading as HeadingRac, RangeCalendar as RangeCalendarRac, composeRenderProps, } from "react-aria-components";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
const CalendarHeader = () => (_jsxs("header", { className: "flex w-full items-center gap-1 pb-1", children: [_jsx(Button, { slot: "previous", className: "flex size-9 items-center justify-center rounded-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:bg-accent hover:text-foreground focus:outline-none data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-ring/70", children: _jsx(ChevronLeftIcon, { width: 16, height: 16 }) }), _jsx(HeadingRac, { className: "grow text-center text-sm font-medium" }), _jsx(Button, { slot: "next", className: "flex size-9 items-center justify-center rounded-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:bg-accent hover:text-foreground focus:outline-none data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-ring/70", children: _jsx(ChevronRightIcon, { width: 16, height: 16 }) })] }));
const CalendarGridComponent = ({ isRange = false }) => {
    const now = today(getLocalTimeZone());
    return (_jsxs(CalendarGridRac, { children: [_jsx(CalendarGridHeaderRac, { children: (day) => (_jsx(CalendarHeaderCellRac, { className: "size-9 rounded-lg p-0 text-xs font-medium text-muted-foreground/80", children: day })) }), _jsx(CalendarGridBodyRac, { className: "[&_td]:px-0", children: (date) => (_jsx(CalendarCellRac, { date: date, className: cn("relative flex size-9 items-center justify-center whitespace-nowrap rounded-lg border border-transparent p-0 text-sm font-normal text-foreground outline-offset-2 duration-150 [transition-property:color,background-color,border-radius,box-shadow] focus:outline-none data-[disabled]:pointer-events-none data-[unavailable]:pointer-events-none data-[focus-visible]:z-10 data-[hovered]:bg-accent data-[selected]:bg-primary data-[hovered]:text-foreground data-[selected]:text-primary-foreground data-[unavailable]:line-through data-[disabled]:opacity-30 data-[unavailable]:opacity-30 data-[focus-visible]:outline data-[focus-visible]:outline-2 data-[focus-visible]:outline-ring/70", 
                    // Range-specific styles
                    isRange &&
                        "data-[selected]:rounded-none data-[selection-end]:rounded-e-lg data-[selection-start]:rounded-s-lg data-[invalid]:bg-red-100 data-[selected]:bg-accent data-[selected]:text-foreground data-[invalid]:data-[selection-end]:[&:not([data-hover])]:bg-destructive data-[invalid]:data-[selection-start]:[&:not([data-hover])]:bg-destructive data-[selection-end]:[&:not([data-hover])]:bg-primary data-[selection-start]:[&:not([data-hover])]:bg-primary data-[invalid]:data-[selection-end]:[&:not([data-hover])]:text-destructive-foreground data-[invalid]:data-[selection-start]:[&:not([data-hover])]:text-destructive-foreground data-[selection-end]:[&:not([data-hover])]:text-primary-foreground data-[selection-start]:[&:not([data-hover])]:text-primary-foreground", 
                    // Today indicator styles
                    date.compare(now) === 0 &&
                        cn("after:pointer-events-none after:absolute after:bottom-1 after:start-1/2 after:z-10 after:size-[3px] after:-translate-x-1/2 after:rounded-full after:bg-primary", isRange
                            ? "data-[selection-end]:[&:not([data-hover])]:after:bg-background data-[selection-start]:[&:not([data-hover])]:after:bg-background"
                            : "data-[selected]:after:bg-background")) })) })] }));
};
const Calendar = ({ className, ...props }) => {
    return (_jsxs(CalendarRac, { ...props, className: composeRenderProps(className, (className) => cn("w-fit", className)), children: [_jsx(CalendarHeader, {}), _jsx(CalendarGridComponent, {})] }));
};
const RangeCalendar = ({ className, ...props }) => {
    return (_jsxs(RangeCalendarRac, { ...props, className: composeRenderProps(className, (className) => cn("w-fit", className)), children: [_jsx(CalendarHeader, {}), _jsx(CalendarGridComponent, { isRange: true })] }));
};
export { Calendar, RangeCalendar };
