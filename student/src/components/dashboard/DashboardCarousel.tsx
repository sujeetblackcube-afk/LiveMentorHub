"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import axios from "axios";
import { HOME_PATHS, API_AUTH_BASE } from "@/lib/api";
import { useAuth } from "@/store/useAuth";

interface Banner {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  cta?: string;
}

// Get country synchronously from localStorage
const getInitialCountry = (): string | undefined => {
  if (typeof window === "undefined") return undefined;

  let countryValue = localStorage.getItem("country") || undefined;

  if (!countryValue) {
    try {
      const authData = localStorage.getItem("auth-storage");
      if (authData) {
        const parsed = JSON.parse(authData);
        countryValue = parsed.state?.user?.country;
      }
    } catch (e) {
      // Silent fail
    }
  }
  return countryValue;
};

export function DashboardCarousel() {
  const [current, setCurrent] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<string | undefined>(() => getInitialCountry());
  const { user } = useAuth();

  // Update country from useAuth when it becomes available
  useEffect(() => {
    if (user?.country) {
      setCountry(user.country);
    }
  }, [user]);

  useEffect(() => {
    fetchBanners();
  }, [country]);

  useEffect(() => {
    if (!banners.length) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [banners]);

  const fetchBanners = async () => {
    try {
      setLoading(true);

      const studentId = user?.studentId || "demo";
      const url = `${API_AUTH_BASE}${HOME_PATHS.homeData(studentId, undefined, country)}`;
      // console.log("[DashboardCarousel] fetching homeData", { studentId, country, url });

      const res = await axios.get(url);
      // console.log("[DashboardCarousel] response", res?.data);

      if (res.data?.success) {
        setBanners(res.data.data.banners || []);
      }
    } catch (error: any) {
      console.error(
        "Banner Fetch Error:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const next = () =>
    setCurrent((prev) => (prev + 1) % banners.length);

  const prev = () =>
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  if (loading) {
    return (
      <div className="w-full h-56 md:h-72 lg:h-[400px] rounded-2xl bg-gray-200 animate-pulse border border-gray-100" />
    );
  }

  if (!banners.length) return null;

  return (
    <div className="relative w-full h-56 md:h-72 lg:h-[400px] rounded-2xl overflow-hidden group shadow-sm bg-[#0d1f5c]">
      {banners.map((item, index) => {
        const imageUrl = item.image.startsWith("http")
          ? item.image
          : `${API_AUTH_BASE}/${item.image.replace(/^\/+/, "")}`;

        return (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-700 ${index === current ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
          >
            {/* Image fully covers the banner area */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${imageUrl})` }}
            />

            {/* Elegant gradient overlay so text pops while the image shines through */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f5c]/95 via-[#0d1f5c]/60 to-transparent flex items-end">
              <div className="w-full px-8 md:px-12 pb-10 md:pb-12 pt-16">
                <div className="space-y-3 max-w-2xl">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight drop-shadow-md">
                    {item.title}
                  </h2>
                  <p className="text-sm md:text-base text-gray-200 font-medium line-clamp-2 drop-shadow">
                    {item.subtitle}
                  </p>
                  {item.cta && (
                    <div className="pt-2">
                      <Button className="bg-[#d4940a] hover:bg-[#e8a020] text-white rounded-lg px-7 py-5 text-sm font-bold shadow-md">
                        {item.cta}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 backdrop-blur text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all z-30"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 backdrop-blur text-white hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-all z-30"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Clean Indicator Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-30 bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md">
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${idx === current
                ? "w-4 bg-white"
                : "w-1.5 bg-white/40 hover:bg-white/60"
              }`}
          />
        ))}
      </div>
    </div>
  );
}
