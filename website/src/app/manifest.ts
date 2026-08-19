import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LiveMentorHub — Unified Live Mentorship & Coaching Platform",
    short_name: "LiveMentorHub",
    description: "Real stories from learners and families who use LiveMentorHub to ask more, understand better and make steady progress.",
    start_url: "/",
    display: "standalone",
    background_color: "#06152D",
    theme_color: "#06152D",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
