import React from "react";
import { Outlet } from "react-router-dom";
import { usePageTracker } from "@/hooks/usePageTracker";

export const RootLayout: React.FC = () => {
  usePageTracker();
  return <Outlet />;
};

export default RootLayout;
