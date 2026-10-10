import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ErrorLandingLayout from "@/components/ErrorLandingLayout";
import { ERROR_PAGES_DATA } from "@/config/errorPagesData";

export const NotFound: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    console.warn("404 Error: Non-existent route accessed:", location.pathname);
  }, [location.pathname]);

  return (
    <ErrorLandingLayout
      errorCode="404"
      errorConfig={ERROR_PAGES_DATA["404"]}
      requestedUrl={location.pathname}
    />
  );
};

export default NotFound;
