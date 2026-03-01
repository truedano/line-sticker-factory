import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Droplets, Leaf, ChevronDown } from 'lucide-react';

const themes = [
    { id: 'default', name: '預設 (Default)', icon: <Sun className="w-4 h-4" /> },
    { id: 'dark', name: '暗黑 (Dark)', icon: <Moon className="w-4 h-4" /> },
    { id: 'ocean', name: '海洋 (Ocean)', icon: <Droplets className="w-4 h-4" /> },
    { id: 'matcha', name: '抹茶 (Matcha)', icon: <Leaf className="w-4 h-4" /> }
];

const ThemeSelector = () => {
    // Try to use ThemeContext, but handle safely if it's missing or not properly provided
    let contextValue;
    try {
        contextValue = useTheme();
    } catch (e) {
        contextValue = { theme: 'default', setTheme: () => { } };
    }

    // Safely destructure
    const { theme = 'default', setTheme = () => { } } = contextValue || {};

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeThemeData = themes.find(t => t.id === theme) || themes[0];

    return (
        <div className="relative z-50" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-all text-slate-300 shadow-sm"
                title="切換主題"
            >
                <div className="text-line">{activeThemeData.icon}</div>
                <span className="text-sm font-medium hidden sm:inline-block">{activeThemeData.name}</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden animate-fade-in origin-top-right">
                    <div className="p-2 flex flex-col gap-1">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setTheme(t.id);
                                    setIsOpen(false);
                                }}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all outline-none ${theme === t.id
                                        ? 'bg-line/20 text-line font-bold'
                                        : 'text-slate-300 hover:bg-slate-700/60'
                                    }`}
                            >
                                <div className={`${theme === t.id ? 'text-line shadow-[0_0_10px_rgba(6,199,85,0.4)]' : 'text-slate-400'}`}>
                                    {t.icon}
                                </div>
                                {t.name}
                                {theme === t.id && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-line shadow-[0_0_5px_#06C755]"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeSelector;
