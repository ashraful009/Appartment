import React from "react";
import Toggle from "./Toggle";

const ALL_ROLES = [
  { key: "user",       label: "User",       colorClass: "bg-gray-100 text-gray-700 border-gray-200" },
  { key: "customer",   label: "Customer",   colorClass: "bg-blue-50 text-blue-700 border-blue-200" },
  { key: "seller",     label: "Seller",     colorClass: "bg-amber-50 text-amber-700 border-amber-200" },
  { key: "admin",      label: "Admin",      colorClass: "bg-brand-50 text-brand-700 border-brand-200" },
  { key: "Director",   label: "Director",   colorClass: "bg-purple-50 text-purple-700 border-purple-200" },
  { key: "GM",         label: "GM",         colorClass: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { key: "AGM",        label: "AGM",        colorClass: "bg-teal-50 text-teal-700 border-teal-200" },
  { key: "Accountant", label: "Accountant", colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
];

/**
 * RoleToggles — row of 4 role toggles for a single user.
 * Props: user, isSelf, savingToggle (map), onToggle(user, roleKey)
 */
const RoleToggles = ({ user, isSelf, savingToggle, onToggle }) => {
  const roles = user.roles || ["user"];
  return (
    <div className="flex items-start gap-3 flex-wrap">
      {ALL_ROLES.map(({ key, label, trackOn, trackOff }) => {
        const isOn      = roles.includes(key);
        const isLoading = !!savingToggle[`${user._id}-${key}`];
        const isDisabled = key === "user" || (isSelf && key === "admin");
        return (
          <Toggle
            key={key}
            isOn={isOn}
            isLoading={isLoading}
            isDisabled={isDisabled}
            trackOn={trackOn}
            trackOff={trackOff}
            label={label}
            onClick={() => onToggle(user, key)}
          />
        );
      })}
    </div>
  );
};

export { ALL_ROLES };
export default RoleToggles;
