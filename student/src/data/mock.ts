import { Book, PlayCircle, Calendar, FileText, HelpCircle, BarChart2 } from "lucide-react";
import { Course } from "@/components/CourseCard";

export const COURSES: Course[] = [
    {
        id: "1",
        title: "Complete Web Development Bootcamp 2024",
        thumbnail: "/thumbnails/webdev.jpg",
        instructor: "Angela Yu",
        price: 499,
        originalPrice: 3999,
        rating: 4.8,
        students: 12500,
        duration: "60h",
        isLive: true,
        level: "Intermediate",
        daysLeft: 12,
        description: "Become a full-stack web developer with just one course. HTML, CSS, Javascript, Node, React, MongoDB, Web3 and DApps. This course is designed to take you from a complete beginner to a job-ready developer.",
        curriculum: [
            {
                title: "Introduction to Web Development",
                duration: "1h 20m",
                lessons: [
                    "How the Internet Works",
                    "Setting up your environment",
                    "Introduction to HTML5"
                ]
            },
            {
                title: "CSS3 and Styling",
                duration: "4h 30m",
                lessons: [
                    "CSS Selectors and Rules",
                    "Box Model",
                    "Flexbox and Grid",
                    "Responsive Design"
                ]
            },
            {
                title: "Javascript ES6+",
                duration: "10h 15m",
                lessons: [
                    "Variables and Data Types",
                    "Functions and Scope",
                    "DOM Manipulation",
                    "Async/Await and Promises"
                ]
            }
        ],
        reviews: [
            { user: "Sarah Jenkins", rating: 5, comment: "Absolutely the best course I've taken. Angela explains everything so clearly!" },
            { user: "Mike Chen", rating: 4.5, comment: "Great content, but the backend section felt a bit rushed. Overall amazing value." }
        ],
        features: ["Access to 50+ projects", "Certificate of completion", "Q&A Support", "Discord Community Access"]
    },
    {
        id: "2",
        title: "Data Structures & Algorithms in Java",
        thumbnail: "/thumbnails/dsa.jpg",
        instructor: "Kunal Kushwaha",
        price: 999,
        originalPrice: 4999,
        rating: 4.9,
        students: 8500,
        duration: "45h",
        level: "Beginner",
        daysLeft: 7,
        description: "Master Data Structures and Algorithms with Java. Ace your coding interviews at top tech companies like Google, Amazon, Facebook, and Microsoft.",
        curriculum: [
            {
                title: "Java Fundamentals",
                duration: "5h 00m",
                lessons: ["Java Syntax", "Loops and Conditionals", "Functions", "Arrays"]
            },
            {
                title: "Linear Data Structures",
                duration: "12h 30m",
                lessons: ["ArrayList", "LinkedList", "Stacks and Queues"]
            }
        ],
        reviews: [],
        features: ["Live Weekly Calls", "100+ Leetcode Problems", "Resume Review"]
    },
    {
        id: "3",
        title: "Master UI/UX Design with Figma",
        thumbnail: "/thumbnails/uiux.jpg",
        instructor: "Abhinav Chhikara",
        price: 299,
        originalPrice: 1999,
        rating: 4.7,
        students: 5400,
        duration: "20h",
        level: "Intermediate",
        daysLeft: 5,
        description: "Learn to design beautiful user interfaces and user experiences using Figma. Create wireframes, prototypes, and high-fidelity mockups.",
        curriculum: [
            {
                title: "Design Principles",
                duration: "2h 15m",
                lessons: ["Typography", "Color Theory", "Spacing and Layout", "Visual Hierarchy"]
            },
            {
                title: "Figma Mastery",
                duration: "8h 00m",
                lessons: ["Auto Layout", "Components and Variants", "Prototyping", "Plugins"]
            }
        ],
        reviews: [],
        features: ["Figma Files Included", "Portfolio Building", "Freelancing Guide"]
    },
];

export const QUICK_ACCESS = [
    { name: "Live Classes", icon: PlayCircle, color: "bg-blue-100 text-[#3a90f8]", href: "/live" },
    { name: "Assignments", icon: FileText, color: "bg-orange-100 text-orange-600", href: "/assignments" },
    { name: "Doubt Solving", icon: HelpCircle, color: "bg-cyan-100 text-cyan-600", href: "/doubt" },
    { name: "Progress", icon: BarChart2, color: "bg-green-100 text-green-600", href: "/progress" },
    { name: "Schedule", icon: Calendar, color: "bg-red-100 text-red-600", href: "/live" },
    { name: "Study Material", icon: Book, color: "bg-indigo-100 text-indigo-600", href: "/courses" },
];
