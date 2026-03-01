import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users2, TrendingUp, Phone } from "lucide-react";

const MyTeam = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data } = await axios.get("/api/seller/my-team", {
          withCredentials: true,
        });
        setTeamMembers(data.team);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load team data.");
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
          Seller Panel
        </p>
        <h1 className="text-3xl font-extrabold text-gray-900">My Team</h1>
        <p className="text-gray-500 text-sm mt-1">
          Sub-sellers you've referred who are now active on the platform.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 animate-pulse"
            >
              <div className="w-9 h-9 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="h-7 bg-gray-200 rounded-xl w-20" />
              <div className="h-7 bg-gray-200 rounded-xl w-20" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && teamMembers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mb-4">
            <Users2 size={32} className="text-brand-500" />
          </div>
          <p className="text-lg font-semibold text-gray-500">
            You have not referred or converted any sellers yet.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Share your referral code or request seller conversions from your
            assigned leads to grow your team.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && teamMembers.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                    Name
                  </th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600">
                    Number
                  </th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">
                    Total Assigned Works
                  </th>
                  <th className="text-left px-5 py-3.5 font-semibold text-gray-600 whitespace-nowrap">
                    Total Customer Convert
                  </th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr
                    key={member._id}
                    className="hover:bg-gray-50/70 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    {/* Name */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {member.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <span className="font-semibold text-gray-800">
                          {member.name}
                        </span>
                      </div>
                    </td>

                    {/* Number / Phone */}
                    <td className="px-5 py-4">
                      {member.phone ? (
                        <a
                          href={`tel:${member.phone}`}
                          className="flex items-center gap-1.5 text-sm text-emerald-600 hover:underline font-medium"
                        >
                          <Phone size={13} />
                          {member.phone}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic text-sm">—</span>
                      )}
                    </td>

                    {/* Total Assigned Works */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                          <Users2 size={14} className="text-amber-500" />
                        </div>
                        <span className="text-lg font-extrabold text-gray-800">
                          {member.totalAssigned}
                        </span>
                      </div>
                    </td>

                    {/* Total Customer Convert */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                          <TrendingUp size={14} className="text-emerald-500" />
                        </div>
                        <span className="text-lg font-extrabold text-emerald-700">
                          {member.totalConverted}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <p className="px-5 py-3 text-xs text-gray-400 border-t border-gray-100">
            {teamMembers.length} sub-seller
            {teamMembers.length !== 1 ? "s" : ""} in your team
          </p>
        </div>
      )}
    </div>
  );
};

export default MyTeam;
