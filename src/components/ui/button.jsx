import React from "react";
import { cn } from "../../lib/utils";
export function Button({ className="", ...props }) {
  return <button className={cn("btn", className)} {...props} />;
}
