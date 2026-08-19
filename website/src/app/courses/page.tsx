import { CoursesFeature } from "@/features/courses/CoursesFeature";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Public Course Catalog | LiveMentorHub",
  description: "Browse live mentorship batches, verified mentor bios, and course syllabi across all grades and entrance exams.",
};

export default function CoursesPage() {
  return <CoursesFeature />;
}
