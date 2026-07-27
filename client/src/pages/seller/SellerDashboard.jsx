import React from "react";
import { Link } from "react-router-dom";
import { Users, FileText, ClipboardList } from "lucide-react";
import TargetProgressBar from "../../components/seller/dashboard/TargetProgressBar";

const SellerDashboard = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Seller Dashboard</h1>
      </div>

      <TargetProgressBar />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Link to="/seller-panel/assigned" className="block group">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">My Leads</p>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors">View Leads</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <ClipboardList size={24} />
            </div>
          </div>
        </Link>

        <Link to="/seller-panel/my-sales" className="block group">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">My Sales</p>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors">View Sales</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <FileText size={24} />
            </div>
          </div>
        </Link>

        <Link to="/seller-panel/my-team" className="block group">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">My Team</p>
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors">View Team</h3>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <Users size={24} />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default SellerDashboard;
