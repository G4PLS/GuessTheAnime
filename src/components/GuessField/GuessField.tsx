import {
  useState,
  useEffect,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

interface SearchBarProps {
  suggestions: string[];
  debounceTime?: number; // in milliseconds, default 300
  onChange?: (value: string) => void; // callback when input changes
}

// Custom hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

export default function SearchBar({
  suggestions,
  debounceTime = 300,
  onChange,
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedInput = useDebounce(inputValue, debounceTime);

  // Filter suggestions when debounced input changes
  useEffect(() => {
    if (!debouncedInput) {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      setActiveIndex(-1);
      return;
    }

    const matches = suggestions.filter((s) =>
      s.toLowerCase().includes(debouncedInput.toLowerCase())
    );

    setFilteredSuggestions(matches);
    setShowSuggestions(matches.length > 0);
    setActiveIndex(-1);
  }, [debouncedInput, suggestions]);

  // Handle input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (onChange) onChange(value);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      setActiveIndex((prev) => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === "ArrowUp") {
      setActiveIndex((prev) =>
        prev <= 0 ? filteredSuggestions.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      if (activeIndex >= 0) {
        const selected = filteredSuggestions[activeIndex];
        setInputValue(selected);
        setShowSuggestions(false);
        if (onChange) onChange(selected);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClickSuggestion = (s: string) => {
    setInputValue(s);
    setShowSuggestions(false);
    if (onChange) onChange(s);
  };

  return (
    <div ref={containerRef} className="flex flex-grow relative w-80">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Search..."
        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul
          className="absolute top-full left-0 right-0 bg-gray-500 border border-gray-300 rounded shadow-lg overflow-y-auto z-50 mt-1 max-h-24">
          {filteredSuggestions.map((s, index) => (
            <li
              key={s}
              onClick={() => handleClickSuggestion(s)}
              className={`px-3 py-2 cursor-pointer ${
                index === activeIndex ? "bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
