import React from "react";
import { cn } from "../../lib/utils";
export const Input = React.forwardRef(function Input({ className="", ...props }, ref){
  return <input ref={ref} className={cn("input", className)} {...props} />;
});
