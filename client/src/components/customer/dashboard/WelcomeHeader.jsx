import React from "react";

/**
 * WelcomeHeader — Personalized greeting at the top of the Customer Dashboard.
 * Props: userName (string)
 */
const WelcomeHeader = ({ userName }) => {
  const firstName = userName?.split(" ")[0] ?? "there";

  return (
    <div className="mb-8">
      <p className="text-xs font-bold uppercase tracking-widest text-brand-500 mb-1">
        Customer Dashboard
      </p>
      <h1 className="text-3xl font-extrabold text-gray-900">
        Welcome back,{" "}
        <span className="text-brand-600">{firstName}</span>.
      </h1>
      <p className="text-gray-500 text-sm mt-1.5 max-w-md">
        Here is your property journey — track your requests, saved listings, and
        upcoming appointments all in one place.
      </p>
    </div>
  );
};

export default WelcomeHeader;
