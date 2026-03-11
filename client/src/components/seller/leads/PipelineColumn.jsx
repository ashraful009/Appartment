import React, { useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const PIPELINE_STAGES = ["New", "Contacted", "Site Visited", "Negotiation", "Closed Won", "Closed Lost"];
const PRIORITIES = ["Hot", "Warm", "Cold"];

const STAGE_COLORS = {
  "New": "bg-gray-100 text-gray-600",
  "Contacted": "bg-blue-100 text-blue-700",
  "Site Visited": "bg-purple-100 text-purple-700",
  "Negotiation": "bg-amber-100 text-amber-700",
  "Closed Won": "bg-emerald-100 text-emerald-700",
  "Closed Lost": "bg-red-100 text-red-500",
};

const PRIORITY_COLORS = {
  "Hot": "bg-red-100 text-red-600",
  "Warm": "bg-amber-100 text-amber-600",
  "Cold": "bg-blue-100 text-blue-600",
};

const PipelineColumn = ({ req, onUpdate }) => {
  const [stage, setStage] = useState(req.pipelineStage || "New");
  const [priority, setPriority] = useState(req.priority || "Warm");
  const [prefs, setPrefs] = useState({
    budget: req.clientPreferences?.budget || "",
    location: req.clientPreferences?.location || "",
  });
  const [saving, setSaving] = useState(false);

  const save = useCallback(
    async (overrides = {}) => {
      setSaving(true);
      try {
        const payload = {
          pipelineStage: overrides.stage ?? stage,
          priority: overrides.priority ?? priority,
          clientPreferences: overrides.prefs ?? prefs,
        };
        const { data } = await axios.put(`/api/requests/${req._id}/pipeline`, payload, { withCredentials: true });
        onUpdate(req._id, data.request);
        toast.success("Pipeline updated.");
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to update.");
      } finally { setSaving(false); }
    },
    [req._id, stage, priority, prefs, onUpdate]
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Pipeline Stage</label>
        <select
          value={stage}
          onChange={(e) => { setStage(e.target.value); save({ stage: e.target.value }); }}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
        >
          {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${STAGE_COLORS[stage]}`}>
          {stage}
        </span>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Priority</label>
        <select
          value={priority}
          onChange={(e) => { setPriority(e.target.value); save({ priority: e.target.value }); }}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
        >
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[priority]}`}>
          {priority}
        </span>
      </div>

      <div className="pt-1 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-500 mb-2">Client Preferences</p>
        <div className="space-y-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Budget</label>
            <input
              type="text"
              value={prefs.budget}
              onChange={e => setPrefs(p => ({ ...p, budget: e.target.value }))}
              onBlur={() => save({ prefs })}
              placeholder="e.g. $50,000–80,000"
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Preferred Location</label>
            <input
              type="text"
              value={prefs.location}
              onChange={e => setPrefs(p => ({ ...p, location: e.target.value }))}
              onBlur={() => save({ prefs })}
              placeholder="e.g. Downtown, Block C"
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>
        {saving && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-2">
            <Loader2 size={10} className="animate-spin" /> Saving…
          </p>
        )}
      </div>
    </div>
  );
};

export default PipelineColumn;
