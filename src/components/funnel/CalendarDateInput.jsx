import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format } from "date-fns";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function parseValue(val) {
  if (!val) return null;
  const d = new Date(val + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function toInputValue(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function CalendarDateInput({ value, onChange, required, placeholder = "Select your wedding date", className = "" }) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseValue(value);
  const today = new Date();
  const [viewYear, setViewYear] = useState(selectedDate ? selectedDate.getFullYear() : today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate ? selectedDate.getMonth() : today.getMonth());
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const gridCells = [];
  for (let i = 0; i < firstDay; i++) gridCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) gridCells.push(new Date(viewYear, viewMonth, d));

  const handleSelect = (date) => {
    onChange(toInputValue(date));
    setOpen(false);
  };

  const isSameDay = (a, b) => a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const displayText = selectedDate ? format(selectedDate, "d MMMM yyyy") : "";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-3 bg-white/5 border border-white/10 text-white rounded-xl h-12 px-4 cursor-pointer hover:border-amber-500/50 transition-colors"
      >
        <Calendar className="w-4 h-4 text-white/30 flex-shrink-0" />
        <span className={displayText ? "text-white" : "text-white/20"}>
          {displayText || placeholder}
        </span>
        {required && !displayText && <span className="text-amber-400 ml-auto">*</span>}
      </div>

      {open && (
        <div className="absolute z-50 mt-2 left-0 right-auto bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl p-4 w-72">
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-white font-medium text-sm">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-white/30 text-xs font-medium">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {gridCells.map((date, i) => {
              if (!date) return <div key={i} />;
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, today);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(date)}
                  className={`w-9 h-9 rounded-lg text-sm flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-amber-500 text-black font-semibold"
                      : isToday
                      ? "bg-white/10 text-white border border-amber-500/40"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}