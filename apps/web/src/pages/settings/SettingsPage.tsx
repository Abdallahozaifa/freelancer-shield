import React from 'react';
import { Navigate } from 'react-router-dom';

// Settings page redirects to profile since that's where all account settings live
export const SettingsPage: React.FC = () => {
  return <Navigate to="/profile" replace />;
};

export default SettingsPage;

