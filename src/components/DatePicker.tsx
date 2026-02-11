import React, { useState, useRef, useEffect } from "react";

interface DatePickerProps {
    value: Date;
    onChange: (date: Date) => void;
    minDate?: Date;
}

export function DatePicker({ value, onChange, minDate }: DatePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(value);
    const [viewMonth, setViewMonth] = useState(value.getMonth());
    const [viewYear, setViewYear] = useState(value.getFullYear());
    const [hours, setHours] = useState(value.getHours());
    const [minutes, setMinutes] = useState(value.getMinutes());
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const handleDateSelect = (day: number) => {
        const newDate = new Date(viewYear, viewMonth, day, hours, minutes);
        setSelectedDate(newDate);
        onChange(newDate);
    };

    const handleTimeChange = () => {
        const newDate = new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            selectedDate.getDate(),
            hours,
            minutes
        );
        setSelectedDate(newDate);
        onChange(newDate);
    };

    const isDateDisabled = (day: number) => {
        if (!minDate) return false;
        const date = new Date(viewYear, viewMonth, day);
        return date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            day === today.getDate() &&
            viewMonth === today.getMonth() &&
            viewYear === today.getFullYear()
        );
    };

    const isSelected = (day: number) => {
        return (
            day === selectedDate.getDate() &&
            viewMonth === selectedDate.getMonth() &&
            viewYear === selectedDate.getFullYear()
        );
    };

    const prevMonth = () => {
        if (viewMonth === 0) {
            setViewMonth(11);
            setViewYear(viewYear - 1);
        } else {
            setViewMonth(viewMonth - 1);
        }
    };

    const nextMonth = () => {
        if (viewMonth === 11) {
            setViewMonth(0);
            setViewYear(viewYear + 1);
        } else {
            setViewMonth(viewMonth + 1);
        }
    };

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const disabled = isDateDisabled(day);
        const selected = isSelected(day);
        const today = isToday(day);

        days.push(
            <button
                key={day}
                onClick={() => !disabled && handleDateSelect(day)}
                disabled={disabled}
                className={`
          h-10 rounded-lg text-sm font-medium transition-all duration-200
          ${disabled ? "text-gray-600 cursor-not-allowed" : "text-gray-300 hover:bg-shelbypink/20 cursor-pointer"}
          ${selected ? "bg-shelbypink text-white hover:bg-shelbypink" : ""}
          ${today && !selected ? "border border-shelbypink" : ""}
        `}
            >
                {day}
            </button>
        );
    }

    return (
        <div ref={pickerRef} className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-3 py-2 bg-chocodark border border-shelbypink rounded-md text-gray-300 text-left focus:outline-none focus:ring-2 focus:ring-shelbypink transition-all duration-200 hover:border-pink-400 cursor-pointer"
            >
                <div className="flex items-center justify-between">
                    <span>{selectedDate.toLocaleString()}</span>
                    <svg
                        className={`w-5 h-5 text-shelbypink transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-2 p-4 bg-chocodark border border-shelbypink rounded-lg shadow-2xl w-80 animate-fadeIn">
                    {/* Month/Year Navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={prevMonth}
                            className="p-2 hover:bg-shelbypink/20 rounded-lg transition-colors duration-200 cursor-pointer"
                        >
                            <svg className="w-5 h-5 text-shelbypink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <span className="text-gray-200 font-semibold text-lg">
                            {monthNames[viewMonth]} {viewYear}
                        </span>
                        <button
                            type="button"
                            onClick={nextMonth}
                            className="p-2 hover:bg-shelbypink/20 rounded-lg transition-colors duration-200 cursor-pointer"
                        >
                            <svg className="w-5 h-5 text-shelbypink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                            <div key={day} className="h-8 flex items-center justify-center text-xs font-semibold text-shelbypink">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                        {days}
                    </div>

                    {/* Time Picker */}
                    <div className="pt-4 border-t border-gray-700">
                        <label className="block text-sm font-medium text-gray-300 mb-2">Time</label>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    maxLength={2}
                                    value={hours.toString().padStart(2, '0')}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        const num = parseInt(val);
                                        if (val === '' || (!isNaN(num) && num >= 0 && num <= 23)) {
                                            setHours(val === '' ? 0 : num);
                                            setTimeout(handleTimeChange, 0);
                                        }
                                    }}
                                    onBlur={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (isNaN(val) || val < 0) setHours(0);
                                        else if (val > 23) setHours(23);
                                    }}
                                    className="w-full px-3 py-2 bg-chocodark border border-gray-600 rounded-md text-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-shelbypink font-semibold text-lg"
                                    placeholder="00"
                                />
                                <p className="text-xs text-gray-500 text-center mt-1">Hours</p>
                            </div>
                            <div className="flex items-center text-gray-400 text-2xl pb-6">:</div>
                            <div className="flex-1">
                                <input
                                    type="text"
                                    maxLength={2}
                                    value={minutes.toString().padStart(2, '0')}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        const num = parseInt(val);
                                        if (val === '' || (!isNaN(num) && num >= 0 && num <= 59)) {
                                            setMinutes(val === '' ? 0 : num);
                                            setTimeout(handleTimeChange, 0);
                                        }
                                    }}
                                    onBlur={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (isNaN(val) || val < 0) setMinutes(0);
                                        else if (val > 59) setMinutes(59);
                                    }}
                                    className="w-full px-3 py-2 bg-chocodark border border-gray-600 rounded-md text-gray-300 text-center focus:outline-none focus:ring-2 focus:ring-shelbypink font-semibold text-lg"
                                    placeholder="00"
                                />
                                <p className="text-xs text-gray-500 text-center mt-1">Minutes</p>
                            </div>
                        </div>
                    </div>

                    {/* Done Button */}
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="w-full mt-4 px-4 py-2 bg-shelbypink text-white rounded-md hover:bg-pink-600 transition-colors duration-200 font-medium cursor-pointer"
                    >
                        Done
                    </button>
                </div>
            )}
        </div>
    );
}
