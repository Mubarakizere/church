import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { apiUrls } from "@/config/api";

const getOrCreateVisitorId = (): string => {
  try {
    let visitorId = localStorage.getItem("shyogwe_visitor_id");
    if (!visitorId) {
      visitorId = "vis_" + Math.random().toString(36).substring(2, 12) + "_" + Date.now().toString(36);
      localStorage.setItem("shyogwe_visitor_id", visitorId);
    }
    return visitorId;
  } catch {
    return "vis_session_" + Math.random().toString(36).substring(2, 10);
  }
};

export const usePageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Avoid tracking admin panel actions as public visitors
    if (location.pathname.startsWith("/admin")) {
      return;
    }

    const visitorId = getOrCreateVisitorId();

    try {
      fetch(apiUrls.trackVisit(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          visitor_id: visitorId,
          path: location.pathname,
          referrer: document.referrer || null
        })
      }).catch(() => {
        // silent fail - non blocking
      });
    } catch {
      // ignore
    }
  }, [location.pathname]);
};
