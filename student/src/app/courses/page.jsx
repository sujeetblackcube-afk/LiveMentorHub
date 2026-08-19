import { Suspense } from "react";
import CoursesPage from "./CoursesPage";

export default function Page() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading courses...</div>}>
            <CoursesPage />
        </Suspense>
    );
}
