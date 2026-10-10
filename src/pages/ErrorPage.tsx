import React from "react";
import { useParams, useSearchParams, useLocation } from "react-router-dom";
import ErrorLandingLayout from "@/components/ErrorLandingLayout";
import { ERROR_PAGES_DATA } from "@/config/errorPagesData";
import { ErrorStatusCode } from "@/types/error";

interface Props {
  fixedCode?: ErrorStatusCode;
}

export const ErrorPage: React.FC<Props> = ({ fixedCode }) => {
  const { code: paramCode } = useParams<{ code?: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const queryCode = searchParams.get("code");
  const rawCode = (fixedCode || paramCode || queryCode || "404").toLowerCase();

  // Normalize code alias (e.g. "not-found" -> "404", "server-error" -> "500", etc.)
  const normalizedMap: Record<string, ErrorStatusCode> = {
    "400": "400",
    "bad-request": "400",
    "401": "401",
    "unauthorized": "401",
    "403": "403",
    "forbidden": "403",
    "access-denied": "403",
    "404": "404",
    "not-found": "404",
    "408": "408",
    "timeout": "408",
    "410": "410",
    "gone": "410",
    "retired": "410",
    "429": "429",
    "rate-limit": "429",
    "throttled": "429",
    "500": "500",
    "server-error": "500",
    "internal-error": "500",
    "502": "502",
    "bad-gateway": "502",
    "503": "503",
    "service-unavailable": "503",
    "maintenance": "maintenance",
    "504": "504",
    "gateway-timeout": "504",
    "offline": "offline",
    "no-connection": "offline",
    "session-expired": "session-expired",
    "419": "session-expired"
  };

  const resolvedCode: ErrorStatusCode = normalizedMap[rawCode] || (rawCode in ERROR_PAGES_DATA ? (rawCode as ErrorStatusCode) : "404");
  const errorConfig = ERROR_PAGES_DATA[resolvedCode] || ERROR_PAGES_DATA["404"];

  const fromUrl = searchParams.get("from") || location.state?.from || location.pathname;

  return (
    <ErrorLandingLayout
      errorCode={resolvedCode}
      errorConfig={errorConfig}
      requestedUrl={fromUrl}
    />
  );
};

export default ErrorPage;
