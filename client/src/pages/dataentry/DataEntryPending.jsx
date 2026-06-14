import React from "react";
import ConfirmationQueue from "../../components/staff/ConfirmationQueue";

const DataEntryPending = () => (
  <ConfirmationQueue
    basePath="/api/data-entry"
    stageKey="dataEntry"
    title="Pending Confirmations"
    subtitle="Accountant-confirmed payments awaiting your review. After you confirm, they move to Management."
  />
);

export default DataEntryPending;
