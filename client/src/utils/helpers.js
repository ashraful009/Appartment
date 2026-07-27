

export const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};



export const conversionRatio = (approved, total) => {
  if (!total || total === 0) return "0%";
  return `${Math.round((approved / total) * 100)}%`;
};



export const getRequestTypes = (request) => {
  const types = [];
  if (request.conversionStatus       === "pending_approval") types.push("customer");
  if (request.sellerConversionStatus === "pending_approval") types.push("seller");
  return types;
};


export const buildPendingCards = (pendingRequests = []) => {
  const cards = [];
  pendingRequests.forEach((req) => {
    getRequestTypes(req).forEach((type) => cards.push({ req, type }));
  });
  return cards;
};
