import { API_BASE } from './api';

export const getSyllabus = async (courseCode: string) => {
  const response = await fetch(`${API_BASE}/api/syllabus/${courseCode}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('cp_token') || '' : ''}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch syllabus');
  const json = await response.json();
  if (!json.success) throw new Error(json.message || 'Syllabus fetch failed');
  return json.data;
};

