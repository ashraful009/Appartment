import React from "react";
import { User } from "lucide-react";

const MentorCard = ({ mentor }) => {
  if (!mentor) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
      <div className="w-12 h-12 rounded-full border-2 border-gray-100 overflow-hidden bg-gray-50 flex-shrink-0">
        {mentor.profilePhoto ? (
          <img src={mentor.profilePhoto} alt={mentor.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <User size={20} />
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">My Mentor</p>
        <p className="text-sm font-bold text-gray-900">{mentor.name}</p>
      </div>
    </div>
  );
};

export default MentorCard;
