import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const COUNTRY_CODES = [
  { code: "+1", flag: "🇺🇸", name: "United States" },
  { code: "+1", flag: "🇨🇦", name: "Canada" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+353", flag: "🇮🇪", name: "Ireland" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+34", flag: "🇪🇸", name: "Spain" },
  { code: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "+31", flag: "🇳🇱", name: "Netherlands" },
  { code: "+32", flag: "🇧🇪", name: "Belgium" },
  { code: "+351", flag: "🇵🇹", name: "Portugal" },
  { code: "+41", flag: "🇨🇭", name: "Switzerland" },
  { code: "+43", flag: "🇦🇹", name: "Austria" },
  { code: "+46", flag: "🇸🇪", name: "Sweden" },
  { code: "+47", flag: "🇳🇴", name: "Norway" },
  { code: "+45", flag: "🇩🇰", name: "Denmark" },
  { code: "+358", flag: "🇫🇮", name: "Finland" },
  { code: "+48", flag: "🇵🇱", name: "Poland" },
  { code: "+30", flag: "🇬🇷", name: "Greece" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+64", flag: "🇳🇿", name: "New Zealand" },
  { code: "+971", flag: "🇦🇪", name: "UAE" },
  { code: "+972", flag: "🇮🇱", name: "Israel" },
  { code: "+91", flag: "🇮🇳", name: "India" },
];

export default function InternationalPhoneInput({ value, onChange, placeholder, className, required, name, autoComplete }) {
  const [selected, setSelected] = useState(null);
  const [number, setNumber] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Parse incoming value into code + number
  useEffect(() => {
    if (!value) {
      setNumber("");
      return;
    }
    const matched = COUNTRY_CODES.find(c => value.startsWith(c.code));
    if (matched) {
      setSelected(matched);
      setNumber(value.slice(matched.code.length).trim());
    } else {
      setNumber(value);
    }
  }, []);

  useEffect(() => {
    if (!selected) return;
    const full = `${selected.code} ${number}`.trim();
    if (full !== (value || "")) onChange(full);
  }, [selected, number]);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className={`flex ${className || ""}`}>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="h-12 px-3 flex items-center gap-1.5 bg-white/5 border border-white/10 border-r-0 rounded-l-xl text-white text-sm hover:bg-white/10 transition-colors whitespace-nowrap"
        >
          <span className="text-base leading-none">{selected?.flag || "🌐"}</span>
          <span className="text-white/70">{selected?.code || "+"}</span>
          <ChevronDown className="w-3.5 h-3.5 text-white/40" />
        </button>
        {open && (
          <div className="absolute z-50 mt-1 max-h-60 overflow-y-auto bg-stone-800 border border-white/10 rounded-xl shadow-2xl w-48">
            {COUNTRY_CODES.map((c, i) => (
              <button
                key={`${c.code}-${c.name}-${i}`}
                type="button"
                onClick={() => { setSelected(c); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-white/10 transition-colors text-left"
              >
                <span className="text-base">{c.flag}</span>
                <span className="text-white/70 text-xs">{c.code}</span>
                <span className="text-white/60 text-xs truncate">{c.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <input
        type="tel"
        name={name}
        autoComplete={autoComplete || "tel"}
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        required={required}
        placeholder={placeholder || "XXX XXX XXXX"}
        className="flex-1 h-12 px-3 bg-white/5 border border-white/10 rounded-r-xl text-white placeholder:text-white/20 focus:border-amber-500/50 focus:outline-none min-w-0"
      />
    </div>
  );
}