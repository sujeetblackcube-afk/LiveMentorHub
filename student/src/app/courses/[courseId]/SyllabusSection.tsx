"use client";

import { useState, useEffect } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { getSyllabus } from '@/lib/syllabusApi';
import { motion } from 'framer-motion';

function SectionHeading({ title, icon: Icon }: { title: string, icon?: any }) {
    return (
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            {Icon && <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center"><Icon size={20} className="text-[#0d1f5c]" /></div>}
            <h2 className="text-2xl font-bold text-[#0d1f5c] tracking-tight">{title}</h2>
        </div>
    );
}

interface SyllabusData {
  courseCode: string;
  courseName: string;
  syllabusUrl: string;
  syllabusPoints: string[];
}

interface SyllabusSectionProps {
  courseId: string;
}

export function SyllabusSection({ courseId }: SyllabusSectionProps) {
  const [data, setData] = useState<SyllabusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const syllabus = await getSyllabus(courseId);
        setData(syllabus);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load syllabus');
      } finally {
        setLoading(false);
      }
    }
    if (courseId) fetchData();
  }, [courseId]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white p-8 lg:p-10 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-center h-64"
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#0d1f5c]" />
          <p className="text-sm text-gray-500">Loading syllabus...</p>
        </div>
      </motion.div>
    );
  }

  if (error || !data) {
    return null; // or error UI
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 lg:p-10 rounded-[2rem] border border-gray-100 shadow-sm"
    >
      
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-[#0d1f5c]/5 to-[#d4940a]/5 p-6 rounded-xl border border-[#0d1f5c]/10">
          <Button 
            asChild 
            size="lg"
            className="w-full bg-[#0d1f5c] hover:bg-[#d4940a] text-white shadow-lg"
          >
            <a href={data.syllabusUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Syllabus PDF
            </a>
          </Button>
        </div>
        {data.syllabusPoints.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-[#0d1f5c] mb-4 flex items-center gap-2">
              Key Points covered in this course
            </h4>
            <ul className="space-y-2">
              {data.syllabusPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 bg-gray-50/50 hover:bg-gray-50 rounded-lg transition-colors group">
                  <div className="mt-1 h-5 w-5 flex items-center justify-center bg-[#d4940a]/20 text-[#d4940a] rounded-sm flex-shrink-0 font-bold text-xs">
                    ✅
                  </div>
                  <span className="text-gray-700 leading-relaxed group-hover:text-[#0d1f5c]">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.section>
  );
}

