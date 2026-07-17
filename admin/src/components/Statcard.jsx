import React from 'react';


export default function StatCard({ title, value, change, positive, onClick }) {
return (
<div className={`bg-white p-6 rounded-xl shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`} onClick={onClick}>
<h4 className="text-gray-500 text-sm">{title}</h4>
<div className="flex items-center justify-between mt-2">
<span className="text-2xl font-bold">{value}</span>
<span className={`text-sm ${positive ? 'text-green-500' : 'text-red-500'}`}>
{change}
</span>
</div>
</div>
);
}
