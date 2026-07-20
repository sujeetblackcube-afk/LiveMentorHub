import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0a1540] text-white/60">
      {/* Subtle divider */}
      <div className="h-px bg-white/5" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Col 1 — Logo + Tagline */}
          <div>
            <Link href="/" className="flex items-center gap-4 mb-6 group text-xl font-bold text-white">
              <div className="bg-white rounded-xl w-12 h-10 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm transition-transform duration-300">
                <img
                  src="/logo.png"
                  alt="Live Mentor Hub"
                  className="h-12 w-auto scale-[1.5] transform group-hover:scale-[1.6] transition-transform duration-300"
                />
              </div>
              <span className="leading-none">Live Mentor Hub</span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              India's most trusted education platform, empowering students with
              quality education at affordable prices.
            </p>
          </div>

          {/* Col 2 — Quick Access (Centered) */}
          <div className="md:flex md:justify-center">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider mb-5" style={{ color: '#e8a020' }}>Quick Access</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/" className="hover:text-white transition-colors text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Home Page
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Student Dashboard
                  </Link>
                </li>
                <li>
                  <a href="/teacher" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Teacher Panel
                  </a>
                </li>
                {/* <li>
                  <a href="/admin" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    Admin Panel
                  </a>
                </li> */}
              </ul>
            </div>
          </div>

          {/* Col 3 — Get in Touch */}
          <div className="md:flex md:justify-end">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider mb-5" style={{ color: '#e8a020' }}>Get in Touch</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-[#d4940a] shrink-0 mt-0.5" />
                  <span className="text-sm text-white/40 leading-relaxed max-w-[200px]">
                    Nehru Place, New Delhi - 110019
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-[#d4940a] shrink-0" />
                  <span className="text-sm text-white/40">+91 9217751344</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-[#d4940a] shrink-0" />
                  <span className="text-sm text-white/40">support@livementorhub.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
      </div>
      <div className="bg-[#060e2e] border-t border-white/5 pt-6 pb-6 mt-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 font-medium border-t-0 pt-0">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              © {new Date().getFullYear()} Live Mentor Hub Education. All rights reserved.
            </p>
            
            <div className="flex flex-wrap gap-4 sm:gap-6">
            <Link
              href="https://blackcube.ae/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors text-sm"
            >
              Design & Developed by BlackCube Solution LLC
            </Link>
            
          </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
