"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const CLASSES = [
    "Class 6-8",
    "Class 9",
    "Class 10",
    "Class 11",
    "Class 12",
    "Dropper / JEE / NEET",
];

export function ClassSelector() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState("Class 11");

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border",
                    isOpen
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                )}
            >
                <span>{selectedClass}</span>
                <ChevronDown
                    className={cn(
                        "h-4 w-4 text-gray-500 transition-transform duration-200",
                        isOpen && "rotate-180 text-indigo-600"
                    )}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 origin-top-left"
                        >
                            <div className="space-y-1">
                                {CLASSES.map((cls) => (
                                    <button
                                        key={cls}
                                        onClick={() => {
                                            setSelectedClass(cls);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors",
                                            selectedClass === cls
                                                ? "bg-indigo-50 text-indigo-700 font-medium"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                    >
                                        {cls}
                                        {selectedClass === cls && (
                                            <Check className="h-4 w-4 text-indigo-600" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
