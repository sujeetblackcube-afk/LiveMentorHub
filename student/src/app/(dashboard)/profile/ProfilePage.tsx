"use client";

import { useState } from "react";
import PageContainer from "@/components/PageContainer";
import {
    Mail,
    Phone,
    LogOut,
    ChevronRight,
    Edit2,
    Shield,
    Settings,
    User,
    MapPin,
    Camera,
} from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
    const [editOpen, setEditOpen] = useState(false);
    const [fullName, setFullName] = useState("Bhola");
    const [email, setEmail] = useState("raam@gmail.com");
    const [phone, setPhone] = useState("+911111111112");
    const [address, setAddress] = useState("");

    return (
        <>
            <PageContainer title="Profile">
                <div className="max-w-2xl space-y-6">
                    {/* Profile header - avatar with camera, name */}
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex flex-col items-center p-8 text-center">
                            <div className="relative shrink-0">
                                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-3xl font-bold text-gray-600">
                                    B
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setEditOpen(true)}
                                    className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-600 text-white shadow hover:bg-gray-700"
                                    aria-label="Edit profile"
                                >
                                    <Camera className="h-4 w-4" />
                                </button>
                            </div>
                            <h2 className="mt-3 text-xl font-bold text-gray-900">Bhola</h2>
                            <p className="text-sm text-gray-500">Class 12 – Science</p>
                        </div>

                        <div className="divide-y divide-gray-100 px-6 pb-6">
                            <div className="flex items-center gap-4 py-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Email</p>
                                    <p className="font-medium text-gray-900">raam@gmail.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 py-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Phone</p>
                                    <p className="font-medium text-gray-900">+91 1111111112</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* App info / Settings */}
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                            <h3 className="font-semibold text-gray-900">App info</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            <button
                                type="button"
                                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
                            >
                                <span className="flex items-center gap-3 text-gray-700">
                                    <Shield className="h-5 w-5 text-gray-500" />
                                    Terms & Condition
                                </span>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </button>
                            <button
                                type="button"
                                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
                            >
                                <span className="flex items-center gap-3 text-gray-700">
                                    <Settings className="h-5 w-5 text-gray-500" />
                                    Preferences
                                </span>
                                <ChevronRight className="h-5 w-5 text-gray-400" />
                            </button>
                        </div>
                    </div>

                    <Link
                        href="/auth/login"
                        className="flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3.5 font-semibold text-white hover:bg-red-600"
                    >
                        <LogOut className="h-5 w-5" />
                        Logout
                    </Link>

                    <p className="text-center text-xs text-gray-400">Version 1.0.0</p>
                </div>
            </PageContainer>

            {/* Edit Profile modal */}
            {editOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
                        <h3 className="border-b border-gray-100 px-6 py-4 text-lg font-bold text-gray-900">
                            Edit Profile
                        </h3>
                        <div className="space-y-3 p-6">
                            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
                                <User className="h-5 w-5 shrink-0 text-gray-400" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Full Name"
                                    className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                                />
                                <span className="text-red-500 font-bold">*</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
                                <Mail className="h-5 w-5 shrink-0 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                    className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                                />
                                <span className="text-red-500 font-bold">*</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
                                <Phone className="h-5 w-5 shrink-0 text-gray-400" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Phone Number"
                                    className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                                />
                                <span className="text-red-500 font-bold">*</span>
                            </div>
                            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
                                <MapPin className="h-5 w-5 shrink-0 text-gray-400" />
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Address"
                                    className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                                />
                                <span className="text-red-500 font-bold">*</span>
                            </div>
                        </div>
                        <div className="flex gap-3 border-t border-gray-100 p-4">
                            <button
                                type="button"
                                onClick={() => setEditOpen(false)}
                                className="flex-1 rounded-xl border-2 border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => setEditOpen(false)}
                                className="flex-1 rounded-xl py-3 text-sm font-semibold text-white"
                                style={{ backgroundColor: "var(--header-bg)" }}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
