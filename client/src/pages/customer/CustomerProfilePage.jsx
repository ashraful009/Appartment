import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import CustomerProfileForm from "../../components/customer/profile/CustomerProfileForm";
import AssignedAgentCard from "../../components/customer/profile/AssignedAgentCard";

// ── Skeleton loaders ─────────────────────────────────────────────────────────
const FormSkeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-3 w-28 bg-gray-200 rounded mb-4" />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className={i === 4 ? "sm:col-span-2" : ""}>
          <div className="h-3 w-20 bg-gray-200 rounded mb-2" />
          <div className="h-10 w-full bg-gray-100 rounded-xl" />
        </div>
      ))}
    </div>
    <div className="flex justify-end">
      <div className="h-10 w-32 bg-gray-200 rounded-xl" />
    </div>
  </div>
);

const AgentSkeleton = () => (
  <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-md animate-pulse">
    <div className="h-20 bg-gray-200" />
    <div className="px-6 pt-2 pb-6 space-y-4">
      <div className="w-20 h-20 -mt-10 rounded-full bg-gray-300 border-4 border-white" />
      <div className="h-5 w-36 bg-gray-200 rounded" />
      <div className="h-3 w-full bg-gray-100 rounded" />
      <div className="h-3 w-2/3 bg-gray-100 rounded" />
      <div className="flex gap-2 mt-4">
        <div className="h-8 w-16 bg-gray-200 rounded-xl" />
        <div className="h-8 w-16 bg-gray-200 rounded-xl" />
      </div>
    </div>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────
const CustomerProfilePage = () => {
  const [user,          setUser]          = useState(null);
  const [assignedAgent, setAssignedAgent] = useState(null);
  const [loading,       setLoading]       = useState(true);

  // ── Fetch profile on mount ──────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get("/api/users/profile", {
          withCredentials: true,
        });
        setUser(data.user);
        setAssignedAgent(data.user?.currentAssignedSeller ?? null);
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Failed to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ── Save changes ────────────────────────────────────────────────────────
  const handleUpdate = async (formData) => {
    try {
      const { data } = await axios.put("/api/users/profile", formData, {
        withCredentials: true,
      });
      setUser(data.user);
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to save changes. Try again."
      );
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">

      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-1">
          Customer Panel
        </p>
        <h1 className="text-3xl font-extrabold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1.5">
          Manage your personal information and view your assigned property agent.
        </p>
      </div>

      {/* ── Two-column layout ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left: profile form (2/3 width) ─────────────────────────── */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 border-b border-gray-100 pb-3">
            My Profile Settings
          </p>
          {loading ? (
            <FormSkeleton />
          ) : (
            <CustomerProfileForm userData={user} onUpdate={handleUpdate} />
          )}
        </div>

        {/* ── Right: assigned agent (1/3 width) ──────────────────────── */}
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">
            My Property Expert
          </p>
          {loading ? (
            <AgentSkeleton />
          ) : (
            <AssignedAgentCard agent={assignedAgent} />
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerProfilePage;
