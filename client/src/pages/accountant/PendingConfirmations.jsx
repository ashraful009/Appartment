import React from "react";
import ConfirmationQueue from "../../components/staff/ConfirmationQueue";

const PendingConfirmations = () => (
  <ConfirmationQueue
    basePath="/api/accountant"
    stageKey="accountant"
    title="Pending Confirmations"
    subtitle="Confirm user-submitted payments. After you confirm, they move to the Data Entry Officer."
  />
);

export default PendingConfirmations;
