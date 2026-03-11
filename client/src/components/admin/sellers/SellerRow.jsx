import React, { useState } from "react";
import {
    Mail,
    Phone,
    TrendingUp,
    Clock,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

import Avatar from "../../common/Avatar";
import PendingUserCard from "./PendingUserCard";
import { buildPendingCards } from "../../../utils/helpers";

const SellerRow = ({ sellerData, onAction, onViewProfile }) => {
    const [open, setOpen] = useState(false);

    const { seller, approvedCount, pendingRequests } = sellerData;

    const pendingCards = buildPendingCards(pendingRequests ?? []);
    const hasPending = pendingCards.length > 0;

    const handleClick = () => {
        if (hasPending) {
            setOpen((prev) => !prev);
        } else {
            onViewProfile(sellerData);
        }
    };

    return (
        <div className="group rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">

            {/* Header */}
            <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 cursor-pointer transition-colors group-hover:bg-gray-50"
                onClick={handleClick}
            >
                {/* Seller Info */}
                <div className="flex items-center gap-3 min-w-0">

                    <Avatar name={seller?.name} size="md" />

                    <div className="min-w-0">

                        <p className="font-semibold text-gray-800 text-sm truncate flex items-center gap-2">

                            {seller?.name || "Unknown Seller"}

                            <span className="text-[10px] text-gray-400 group-hover:text-indigo-600 transition-colors">
                                View Profile →
                            </span>

                        </p>

                        {seller?.email && (
                            <a
                                href={`mailto:${seller.email}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 text-xs text-indigo-600 hover:underline mt-0.5"
                            >
                                <Mail size={11} />
                                {seller.email}
                            </a>
                        )}

                        {seller?.phone && (
                            <a
                                href={`tel:${seller.phone}`}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 text-xs text-emerald-600 hover:underline"
                            >
                                <Phone size={11} />
                                {seller.phone}
                            </a>
                        )}

                    </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-3 flex-shrink-0">

                    {/* Converted */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">

                        <TrendingUp size={13} className="text-emerald-600" />

                        <span className="text-xs font-bold text-emerald-700">
                            {approvedCount}
                        </span>

                        <span className="text-xs text-emerald-500">
                            converted
                        </span>

                    </div>

                    {/* Pending */}
                    {hasPending ? (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200">

                            <Clock size={13} className="text-amber-600" />

                            <span className="text-xs font-bold text-amber-700">
                                {pendingCards.length}
                            </span>

                            <span className="text-xs text-amber-500">
                                pending
                            </span>

                        </div>
                    ) : (
                        <div className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-200">
                            <span className="text-xs text-gray-400">
                                No pending
                            </span>
                        </div>
                    )}

                    {/* Toggle Icon */}
                    {hasPending && (
                        <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">

                            {open ? (
                                <ChevronUp size={16} className="text-gray-600" />
                            ) : (
                                <ChevronDown size={16} className="text-gray-600" />
                            )}

                        </div>
                    )}

                </div>
            </div>

            {/* Accordion */}
            {hasPending && (
                <div
                    className={`transition-all duration-300 overflow-hidden ${open ? "max-h-[1000px]" : "max-h-0"
                        }`}
                >

                    <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4 space-y-3">

                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">

                            Pending Approval Requests ({pendingCards.length})

                        </p>

                        {pendingCards.map(({ req, type }) => (
                            <PendingUserCard
                                key={`${req._id}-${type}`}
                                request={req}
                                type={type}
                                sellerId={seller._id}
                                onAction={onAction}
                            />
                        ))}

                    </div>

                </div>
            )}

        </div>
    );
};

export default SellerRow;