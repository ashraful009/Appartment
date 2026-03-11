import React from "react";
import Toggle from "./Toggle";

const ALL_ROLES = [
  { key: "user",     label: "User",     trackOn: "bg-gray-400",    trackOff: "bg-gray-200" },
  { key: "customer", label: "Customer", trackOn: "bg-blue-500",    trackOff: "bg-gray-200" },
  { key: "seller",   label: "Seller",   trackOn: "bg-amber-500",   trackOff: "bg-gray-200" },
  { key: "admin",    label: "Admin",    trackOn: "bg-brand-600",   trackOff: "bg-gray-200" },
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
