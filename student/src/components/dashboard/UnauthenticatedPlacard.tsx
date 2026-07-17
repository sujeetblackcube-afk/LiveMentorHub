import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface UnauthenticatedPlacardProps {
    icon: LucideIcon;
    sectionName: string;
}

export function UnauthenticatedPlacard({ icon: Icon, sectionName }: UnauthenticatedPlacardProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-500 min-h-[400px]">
            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Icon className="h-10 w-10 text-gray-400" strokeWidth={1.5} />
            </div>
            
            <h3 className="text-2xl font-extrabold text-[#0d1f5c] mb-3">
                Please Register First
            </h3>
            
            <p className="text-[15px] text-gray-500 font-medium max-w-md mb-8 leading-relaxed">
                You need to create an account to access {sectionName.toLowerCase()}. Sign up for free to get started!
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link 
                    href="/auth/login"
                    className="px-8 py-3 rounded-xl border-2 border-gray-200 text-[#0d1f5c] font-black text-sm hover:border-[#0d1f5c] hover:bg-gray-50 transition-all w-full sm:w-auto"
                >
                    Log In
                </Link>
                <Link 
                    href="/auth/signup"
                    className="px-8 py-3 rounded-xl bg-[#5244e1] hover:bg-[#4336c9] text-white font-black text-sm shadow-lg shadow-indigo-200 transition-all w-full sm:w-auto"
                >
                    Sign Up Free
                </Link>
            </div>
        </div>
    );
}
