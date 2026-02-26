import { MapPin, Calendar, User } from 'lucide-react';

const statusStyle = {
  Lost: 'bg-red-100 text-red-700',
  Found: 'bg-green-100 text-green-700',
  Resolved: 'bg-yellow-100 text-yellow-700',
};

export default function ItemCard({ item }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-800 text-lg">{item.title}</h3>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${statusStyle[item.status] || 'bg-gray-100 text-gray-700'}`}>
            {item.status}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
        <div className="space-y-1 text-sm text-gray-500">
          <p className="flex items-center gap-1">
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{item.category}</span>
          </p>
          <p className="flex items-center gap-1">
            <MapPin size={14} /> {item.location}
          </p>
          <p className="flex items-center gap-1">
            <User size={14} /> {item.reportedBy?.name || 'Unknown'}
          </p>
          <p className="flex items-center gap-1">
            <Calendar size={14} /> {new Date(item.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
