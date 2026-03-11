import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2, Send } from "lucide-react";

const BroadcastCard = ({ memberCount }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleBroadcast = async () => {
    if (!message.trim()) { toast.error("Please enter a message."); return; }
    setSending(true);
    try {
      const { data } = await axios.post("/api/seller/broadcast", { message }, { withCredentials: true });
      toast.success(data.message || "Broadcast sent!");
      setMessage("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send broadcast.");
    } finally { setSending(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex-1 min-w-0">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Team Broadcast</p>
      <p className="text-sm text-gray-500 mb-4">Send a message to all {memberCount} sub-seller(s).</p>
      <textarea
        rows={3}
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Type your message here…"
        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none mb-3"
      />
      <button
        onClick={handleBroadcast}
        disabled={sending || !message.trim()}
        className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors"
      >
        {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        {sending ? "Sending…" : "Send to All"}
      </button>
    </div>
  );
};

export default BroadcastCard;
