import React from 'react';
import { Link } from 'react-router-dom';

const AccessDenied = () => {
  return (
    <div>
      <h1>Access Denied</h1>
      <p>You do not have access to this page.</p>
      <Link to="/auth/sign-in">Go to Sign In</Link>
    </div>
  );
};

export default AccessDenied;
