import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "@/app/globals.css";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#fafbfe]">
            {/* Glowing Accent Orbs (Scattered & Behind Grid) */}
            <div className="absolute top-0 right-0 z-0 -mt-20 -mr-20 w-[500px] h-[500px] bg-[#d4940a]/15 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-[20%] left-[-10%] z-0 w-[400px] h-[400px] bg-[#0d1f5c]/15 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[20%] z-0 w-[600px] h-[600px] bg-[#0d1f5c]/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute top-[60%] left-[10%] z-0 w-[500px] h-[500px] bg-[#d4940a]/10 blur-[120px] rounded-full pointer-events-none" />

            {/* Background Grid Pattern (Sits on top of the glow) */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#0d1f5c20_1px,transparent_1px),linear-gradient(to_bottom,#0d1f5c20_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-1 w-full mx-auto px-4 py-8 md:px-8 lg:px-12 2xl:px-16">
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
}
