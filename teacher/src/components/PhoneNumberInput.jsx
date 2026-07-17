import React, { useState, useRef, useEffect } from "react";
import { getCountries, getCountryCallingCode } from "libphonenumber-js";
import { Phone, ChevronDown } from "lucide-react";
import { theme } from "../theme";

// Populate ALL_COUNTRIES dynamic listing using Intl display names and flagcdn flags
const ALL_COUNTRIES = getCountries().map((code) => {
  try {
    const name = new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code;
    const codePoints = code.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0));
    const flag = String.fromCodePoint(...codePoints);
    const dialCode = `+${getCountryCallingCode(code)}`;
    return { code, name, flag, dialCode };
  } catch (e) {
    const dialCode = `+${getCountryCallingCode(code)}`;
    return { code, name: code, flag: "", dialCode };
  }
}).sort((a, b) => a.name.localeCompare(b.name));

const normalizeDigits = (value) => value.replace(/\D+/g, "");
const TOTAL_DIGITS = 12;

const getAllowedMobileDigits = (code) => {
  const countryDigits = (code || "").replace(/\D/g, "").length;
  const allowed = TOTAL_DIGITS - countryDigits;
  return allowed > 0 ? allowed : 10;
};

const validateMobile = (code, value, fieldLabel) => {
  const allowed = getAllowedMobileDigits(code);
  if (!value.trim() || value.trim().length !== allowed) {
    return `Please enter a valid ${allowed}-digit ${fieldLabel} number.`;
  }
  return "";
};

/**
 * PhoneNumberInput renders a flag-dropdown country code selector and phone input
 * styled exactly like the student signup page.
 *
 * Props:
 * - value: E.164 full number (e.g., "+919876543210")
 * - onChange: callback that sends the full E.164 number
 */
const PhoneNumberInput = ({ value, onChange }) => {
  // Parse country code and number from value
  const [mobileCode, setMobileCode] = useState("+91");
  const [mobileNumber, setMobileNumber] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  // Initialize from parent value if present
  useEffect(() => {
    if (value && value.startsWith("+")) {
      // Find matching dialCode (longest match first to handle prefixes like +1268 vs +1)
      const sortedDialCodes = ALL_COUNTRIES
        .map(c => c.dialCode)
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort((a, b) => b.length - a.length);

      const matchedDialCode = sortedDialCodes.find(dc => value.startsWith(dc));
      if (matchedDialCode) {
        setMobileCode(matchedDialCode);
        setMobileNumber(value.slice(matchedDialCode.length));
      } else {
        setMobileNumber(value);
      }
    } else {
      setMobileNumber(value || "");
    }
  }, [value]);

  // Sync back to parent when either code or number changes
  const handlePhoneChange = (code, num) => {
    const digits = normalizeDigits(num);
    const maxDigits = getAllowedMobileDigits(code);
    const finalNumber = digits.slice(0, maxDigits);
    setMobileNumber(finalNumber);
    onChange(`${code}${finalNumber}`);
  };

  const selectedCountry = ALL_COUNTRIES.find(c => c.dialCode === mobileCode);

  const filteredCountries = ALL_COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.dialCode.includes(search)
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allowedLength = getAllowedMobileDigits(mobileCode);

  return (
    <div className="relative" ref={dropdownRef}>
      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
      <div className={`flex items-center w-full border-2 rounded-xl transition-all ${
        showDropdown
          ? "bg-white border-[#d4940a] ring-4 ring-[#d4940a]/10"
          : "bg-gray-50 border-gray-200 focus-within:bg-white focus-within:border-[#d4940a] focus-within:ring-4 focus-within:ring-[#d4940a]/10"
      }`}>
        {/* Country code selector button */}
        <div className="relative w-24 flex-shrink-0">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full py-3 pl-10 pr-2 text-sm font-medium text-gray-500 outline-none cursor-pointer flex items-center justify-between bg-transparent border-0"
          >
            <span className="flex items-center gap-1.5">
              {selectedCountry ? (
                <img
                  src={`https://flagcdn.com/w20/${selectedCountry.code.toLowerCase()}.png`}
                  alt={selectedCountry.name}
                  className="w-5 h-auto object-contain rounded-sm"
                />
              ) : (
                <span className="text-base">🏳️</span>
              )}
              <span>{mobileCode}</span>
            </span>
            <ChevronDown className="h-3 w-3 text-gray-400" />
          </button>

          {showDropdown && (
            <div className="absolute z-50 mt-1 left-0 w-72 bg-white border-2 border-gray-200 rounded-xl shadow-lg p-2 space-y-2">
              <input
                type="text"
                placeholder="Search country/code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#d4940a]"
                autoFocus
              />
              <div className="max-h-60 overflow-y-auto divide-y divide-gray-50 scrollbar-thin">
                {filteredCountries.map((c, i) => (
                  <button
                    key={`${c.code}-${i}`}
                    type="button"
                    onClick={() => {
                      setMobileCode(c.dialCode);
                      setShowDropdown(false);
                      setSearch("");
                      handlePhoneChange(c.dialCode, mobileNumber);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2.5 transition-colors cursor-pointer bg-transparent border-0"
                  >
                    <img
                      src={`https://flagcdn.com/w20/${c.code.toLowerCase()}.png`}
                      alt={c.name}
                      className="w-5 h-auto object-contain rounded-sm"
                    />
                    <span className="flex-1 text-gray-800 font-medium truncate">{c.name}</span>
                    <span className="text-xs text-gray-500 font-semibold">{c.dialCode}</span>
                  </button>
                ))}
                {filteredCountries.length === 0 && (
                  <div className="px-3 py-2 text-sm text-gray-500 text-center">
                    No matches
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-[1px] bg-gray-200" />

        {/* Mobile Number Input */}
        <input
          required
          type="tel"
          placeholder={`${allowedLength}-digit mobile number`}
          value={mobileNumber}
          onChange={(e) => handlePhoneChange(mobileCode, e.target.value)}
          maxLength={allowedLength}
          className="flex-1 py-3 pl-4 pr-4 rounded-r-xl outline-none text-sm text-gray-900 placeholder:text-gray-400 bg-transparent border-0 focus:ring-0"
        />
      </div>
    </div>
  );
};

export default PhoneNumberInput;
export { validateMobile, ALL_COUNTRIES };
