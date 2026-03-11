import React from "react";

/**
 * Avatar component.
 *
 * Props:
 *  - src   {string}  Optional image URL. If provided, renders an <img>.
 *  - alt   {string}  Alt text / fallback name for the initial.
 *  - size  {string}  "sm" | "md" | "lg" | "xl"  (default: "md")
 */
const sizeMap = {
  sm: { wrapper: "w-7 h-7  text-xs",  img: "w-7 h-7"  },
  md: { wrapper: "w-9 h-9  text-sm",  img: "w-9 h-9"  },
  lg: { wrapper: "w-16 h-16 text-xl", img: "w-16 h-16" },
  xl: { wrapper: "w-24 h-24 text-4xl",img: "w-24 h-24" },
};

const Avatar = ({ src, alt = "", size = "md" }) => {
  const sz = sizeMap[size] ?? sizeMap.md;
  const initial = alt?.[0]?.toUpperCase() ?? "?";

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sz.img} rounded-full object-cover flex-shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${sz.wrapper} rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center flex-shrink-0`}
    >
      {initial}
    </div>
  );
};

export default Avatar;
