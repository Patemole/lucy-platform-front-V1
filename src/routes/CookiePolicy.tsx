import React from "react";

const CookiePolicy: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Data Privacy</h1>
      <iframe
        src="/documents/GDPR_Cookie_Policy_v1.0.0-0.pdf"
        width="100%"
        height="600px"
        style={{ border: "none" }}
      />
    </div>
  );
};

export default CookiePolicy;