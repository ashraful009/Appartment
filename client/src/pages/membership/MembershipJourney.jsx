import React from 'react';
import InvestmentPanel from '../../components/investment/InvestmentPanel';

// Universal entry point for any logged-in user to start / view their investment
// journey, regardless of role. Role-specific panels (/member, /investor) render
// the same InvestmentPanel.
const MembershipJourney = () => <InvestmentPanel title="Membership & Investment" />;

export default MembershipJourney;
