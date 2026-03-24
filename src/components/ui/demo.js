"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Calendar } from "@/components/ui/calendar-rac";
import { getLocalTimeZone, today } from "@internationalized/date";
import { useState } from "react";
function Component() {
    const [date, setDate] = useState(today(getLocalTimeZone()));
    return (_jsxs("div", { children: [_jsx(Calendar, { className: "rounded-lg border border-border p-2", value: date, onChange: setDate }), _jsxs("p", { className: "mt-4 text-center text-xs text-muted-foreground", role: "region", "aria-live": "polite", children: ["Calendar -", " ", _jsx("a", { className: "underline hover:text-foreground", href: "https://react-spectrum.adobe.com/react-aria/DateRangePicker.html", target: "_blank", rel: "noopener nofollow", children: "React Aria" })] })] }));
}
export { Component };
