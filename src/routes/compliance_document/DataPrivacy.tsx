import React from "react";

const DataPrivacy: React.FC = () => {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Data Privacy</h1>
      <iframe
        //src="/documents/privacy_policy.pdf"
        src="/documents/2025.03.08_Privacy_Policy.pdf"  
        width="100%"
        height="600px"
        style={{ border: "none" }}
      />
    </div>
  );
};

export default DataPrivacy;
