import React from "react";
export default function Button({ as = "button", className = "", ...props }) {
  const Cmp = as;
  return <Cmp className={`btn ${className}`} {...props} />;
}
