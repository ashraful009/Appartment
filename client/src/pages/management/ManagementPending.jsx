import React from "react";
import ConfirmationQueue from "../../components/staff/ConfirmationQueue";

const ManagementPending = () => (
  <ConfirmationQueue
    basePath="/api/management"
    stageKey="management"
    title="Final Confirmations"
    subtitle="Data-entry-confirmed payments awaiting final approval. Confirming updates the user's payment status."
  />
);

export default ManagementPending;
