import React from "react";


const WelcomeHeader = ({ userName }) => {
  const firstName = userName?.split(" ")[0] ?? "there";

  return (
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">
          Customer Dashboard
        </h1>
      </div>
  );
};

export default WelcomeHeader;
