import { ChevronLeft, ChevronRight } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Pagination — Reusable paginator
//
// Props:
//   currentPage  (number)   — the active page (1-indexed)
//   totalPages   (number)   — total number of pages
//   onPageChange (function) — called with the new page number on click
// ─────────────────────────────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Don't render anything when there is only one (or zero) pages
  if (!totalPages || totalPages <= 1) return null;

  // Build a simple 1 … N array
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  // Shared base classes for every page-number button
  const baseBtn =
    "w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1";

  return (
    <nav
      aria-label="Pagination"
      className="flex justify-center items-center gap-2 mt-10 select-none"
    >
      {/* ── Previous button ── */}
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
        className={`
          ${baseBtn}
          ${
            currentPage === 1
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-600"
          }
        `}
      >
        <ChevronLeft size={16} strokeWidth={2.5} />
      </button>

      {/* ── Page number buttons ── */}
      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          aria-label={`Go to page ${page}`}
          aria-current={page === currentPage ? "page" : undefined}
          className={`
            ${baseBtn}
            ${
              page === currentPage
                ? "bg-brand-600 text-white shadow-md shadow-brand-200 scale-105 cursor-default"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
          `}
        >
          {page}
        </button>
      ))}

      {/* ── Next button ── */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
        className={`
          ${baseBtn}
          ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-300 cursor-not-allowed"
              : "bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-600"
          }
        `}
      >
        <ChevronRight size={16} strokeWidth={2.5} />
      </button>
    </nav>
  );
};

export default Pagination;
