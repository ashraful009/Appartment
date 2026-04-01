import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FileText,
  Building,
  User,
  CheckCircle,
  Clock,
  Settings,
  X,
  Loader2,
  Save,
  FolderOpen
} from "lucide-react";
import UnitProcessForm from "../../components/accountant/UnitProcessForm";

const SoldUnits = () => {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/accountant/units", {
        withCredentials: true,
      });
      setUnits(data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load sold units.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (unit) => {
    setSelectedUnit(unit);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUnit(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FileText className="w-8 h-8 text-indigo-600" />
          Sold Units Processing
        </h1>
        <p className="text-gray-500 text-sm mt-2 max-w-2xl">
          Review units marked as Sold or Booked, finalize their physical specifications, and structure their financial breakdown to mark documents as ready.
        </p>
      </div>

      {/* Grid of Sold Units */}
      {units.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500 border rounded-xl shadow-sm bg-white">
          <FolderOpen className="w-12 h-12 mb-4 text-gray-300" />
          <p>No units are currently pending for processing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {units.map((unit) => (
            <div key={unit._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col transition hover:shadow-md">
              
              {/* Top Row */}
              <div className="flex justify-between items-start">
                <p className="font-bold text-gray-900 border-b pb-1 pr-4">{unit.propertyId?.name || "Unknown Building"}</p>
                {unit.isDocumentReady ? (
                  <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-700 tracking-wide uppercase">
                    Processed
                  </span>
                ) : (
                  <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-semibold bg-yellow-100 text-yellow-700 tracking-wide uppercase">
                    Pending
                  </span>
                )}
              </div>

              {/* Middle */}
              <h3 className="text-2xl font-bold text-brand-600 mt-4 mb-2">Unit {unit.unitName}</h3>

              {/* Bottom */}
              <p className="text-sm text-gray-500 mt-2 mb-4 flex-1">
                Sold by: <span className="font-semibold text-gray-700">{unit.actionBy?.name || "System"}</span>
              </p>

              {/* Action Button */}
              <button
                onClick={() => handleOpenModal(unit)}
                className={`mt-4 w-full py-2.5 font-semibold rounded-lg transition ${
                  unit.isDocumentReady
                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    : "bg-brand-50 text-brand-700 hover:bg-brand-100"
                }`}
              >
                {unit.isDocumentReady ? "Edit Details" : "Process Document"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modular Processing Form */}
      {isModalOpen && selectedUnit && (
        <UnitProcessForm 
          unit={selectedUnit} 
          onClose={handleCloseModal} 
          onSuccess={fetchUnits} 
        />
      )}
    </div>
  );
};

export default SoldUnits;
