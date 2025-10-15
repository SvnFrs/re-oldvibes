"use client";

import { useState, useEffect, useRef } from "react";
import {
  IconMapPin,
  IconChevronDown,
  IconSearch,
  IconX,
} from "@tabler/icons-react";

export interface Province {
  code: number;
  name: string;
  codename: string;
  phone_code: number;
}

interface LocationPickerProps {
  value?: string;
  onChange: (location: string) => void;
  placeholder?: string;
  className?: string;
}

export default function LocationPicker({
  value,
  onChange,
  placeholder = "Select location...",
  className = "",
}: LocationPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch provinces when dropdown opens
  useEffect(() => {
    if (!isOpen || provinces.length > 0) return;

    setLoading(true);
    fetch('https://provinces.open-api.vn/api/?depth=1')
      .then((res) => res.json())
      .then((data) => {
        setProvinces(data);
      })
      .catch((error) => {
        console.error('Failed to fetch provinces:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOpen, provinces.length]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const filteredProvinces = provinces.filter((province) =>
    province.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedProvince = provinces.find((p) => p.name === value);

  const handleSelect = (province: Province) => {
    onChange(province.name);
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = () => {
    onChange("");
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Input Field */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="relative cursor-pointer"
      >
        <div className="relative">
          <IconMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gruvbox-gray" />
          <input
            type="text"
            value={value || ""}
            readOnly
            placeholder={placeholder}
            className="w-full pl-10 pr-20 py-3 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-gray/20 rounded-lg focus:ring-2 focus:ring-gruvbox-yellow/50 focus:border-transparent text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0 cursor-pointer"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {value && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="p-1 hover:bg-gruvbox-gray/20 rounded-full transition-colors"
              >
                <IconX className="w-4 h-4 text-gruvbox-gray" />
              </button>
            )}
            <IconChevronDown
              className={`w-4 h-4 text-gruvbox-gray transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gruvbox-light-bg0 dark:bg-gruvbox-dark-bg0 border border-gruvbox-gray/20 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gruvbox-gray/20">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gruvbox-gray" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search provinces..."
                className="w-full pl-9 pr-3 py-2 bg-gruvbox-light-bg1 dark:bg-gruvbox-dark-bg1 border border-gruvbox-gray/20 rounded-md focus:ring-2 focus:ring-gruvbox-yellow/50 focus:border-transparent text-sm text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0"
                autoFocus
              />
            </div>
          </div>

          {/* List */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-gruvbox-yellow border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-sm text-gruvbox-gray">Loading...</span>
              </div>
            ) : filteredProvinces.length === 0 ? (
              <div className="py-8 text-center text-sm text-gruvbox-gray">
                {search ? "No provinces found" : "No provinces available"}
              </div>
            ) : (
              <div className="py-1">
                {filteredProvinces.map((province) => (
                  <button
                    key={province.code}
                    onClick={() => handleSelect(province)}
                    className={`w-full px-4 py-3 text-left hover:bg-gruvbox-yellow/10 transition-colors ${
                      selectedProvince?.code === province.code
                        ? "bg-gruvbox-yellow/20 text-gruvbox-yellow font-medium"
                        : "text-gruvbox-light-fg0 dark:text-gruvbox-dark-fg0"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{province.name}</span>
                      {selectedProvince?.code === province.code && (
                        <div className="w-2 h-2 bg-gruvbox-yellow rounded-full"></div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

