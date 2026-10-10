import {
  AlertTriangle,
  ShieldAlert,
  Lock,
  FileQuestion,
  Clock,
  Archive,
  Gauge,
  ServerCrash,
  Radio,
  Wrench,
  WifiOff,
  RefreshCw,
  Home,
  LogIn,
  Mail,
  Phone,
  FileText,
  Search,
  KeyRound,
  ShieldCheck,
  Compass,
  ArrowLeft
} from "lucide-react";
import { ErrorDetailsConfig, ErrorStatusCode } from "@/types/error";

export const ERROR_PAGES_DATA: Record<ErrorStatusCode, ErrorDetailsConfig> = {
  "400": {
    code: "400",
    statusCodeNum: 400,
    badge: "HTTP 400 • Bad Request",
    title: "Invalid Request Syntax",
    subtitle: "The diocesan server could not interpret your request parameters.",
    description:
      "The server received a malformed query, corrupted payload, or an invalid format from your browser. Please review the link parameters or return to the main portal.",
    pastoralQuote: {
      verse: "Let your speech always be gracious, seasoned with salt, so that you may know how you ought to answer each person.",
      reference: "Colossians 4:6"
    },
    category: "client",
    themeColor: "amber",
    icon: AlertTriangle,
    suggestedActions: [
      { label: "Return to Homepage", href: "/", variant: "primary", icon: Home },
      { label: "Diocesan Documents", href: "/documents", variant: "outline", icon: FileText },
      { label: "Contact Registry", href: "/contact", variant: "ghost", icon: Mail }
    ],
    troubleshootingTips: [
      "Check the address bar for accidental typos, trailing symbols, or unsupported characters.",
      "Clear your browser cookies and cached data for this portal session.",
      "If you submitted a form, ensure all required fields are correctly completed."
    ],
    diagnosticContext: "HTTP 400: The request was syntactically malformed or parameters were rejected by server input validation rules."
  },

  "401": {
    code: "401",
    statusCodeNum: 401,
    badge: "HTTP 401 • Authentication Required",
    title: "Episcopal Access Required",
    subtitle: "You must be signed in with authorized diocesan credentials to proceed.",
    description:
      "This section contains administrative records, clergy registries, or secured diocesan instruments that require an active clergy or staff session.",
    pastoralQuote: {
      verse: "Open to me the gates of righteousness, that I may enter through them and give thanks to the Lord.",
      reference: "Psalm 118:19"
    },
    category: "client",
    themeColor: "indigo",
    icon: KeyRound,
    suggestedActions: [
      { label: "Sign In to Portal", href: "/admin/login", variant: "primary", icon: LogIn },
      { label: "Return to Homepage", href: "/", variant: "outline", icon: Home },
      { label: "Request Clearance", href: "/contact", variant: "ghost", icon: Mail }
    ],
    troubleshootingTips: [
      "If you already possess diocesan login credentials, log in with your official clergy/staff account.",
      "Ensure your browser session has not timed out due to prolonged inactivity.",
      "Contact the Shyogwe IT Secretariat if your account needs to be provisioned or re-activated."
    ],
    diagnosticContext: "HTTP 401: Unauthorized. The request lacks valid authentication credentials for the target diocesan resource."
  },

  "403": {
    code: "403",
    statusCodeNum: 403,
    badge: "HTTP 403 • Access Forbidden",
    title: "Restricted Diocesan Area",
    subtitle: "Your current profile does not have sufficient permission to view this resource.",
    description:
      "Access to this synod document, diocesan archive, or administrative panel is restricted to ordained bishops, archdeacons, or authorized departmental directors.",
    pastoralQuote: {
      verse: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.",
      reference: "Proverbs 3:5-6"
    },
    category: "client",
    themeColor: "red",
    icon: Lock,
    suggestedActions: [
      { label: "Return to Homepage", href: "/", variant: "primary", icon: Home },
      { label: "Browse Public News", href: "/news", variant: "outline", icon: FileText },
      { label: "Contact Diocesan Office", href: "/contact", variant: "ghost", icon: Phone }
    ],
    troubleshootingTips: [
      "Ensure you are logged into the account with administrative privileges.",
      "For clearance escalation or Synod policy access, consult the Diocesan Executive Secretary.",
      "If you believe this restriction is in error, verify your assigned diocese permissions."
    ],
    diagnosticContext: "HTTP 403: Forbidden. The server understood the request but refuses to authorize it due to role-based access control."
  },

  "404": {
    code: "404",
    statusCodeNum: 404,
    badge: "HTTP 404 • Resource Not Found",
    title: "Page Not Found in Diocesan Archives",
    subtitle: "The diocesan resource you are looking for may have been relocated or removed.",
    description:
      "We could not locate the requested page, parish notice, or published document at this URL. The resource may have been updated, archived, or the link typed incorrectly.",
    pastoralQuote: {
      verse: "Your word is a lamp to my feet and a light to my path.",
      reference: "Psalm 119:105"
    },
    category: "client",
    themeColor: "navy",
    icon: FileQuestion,
    suggestedActions: [
      { label: "Return to Homepage", href: "/", variant: "primary", icon: Home },
      { label: "Browse Official Documents", href: "/documents", variant: "outline", icon: FileText },
      { label: "Explore Diocesan Projects", href: "/projects", variant: "ghost", icon: Compass }
    ],
    troubleshootingTips: [
      "Check the address URL spelling, slashes, or file extensions.",
      "Use our primary navigation menu above to locate current programs, events, and schools.",
      "Search our published archive or reach out to the communications secretariat."
    ],
    diagnosticContext: "HTTP 404: Not Found. No matching route or resource identified on Shyogwe Diocese web server."
  },

  "408": {
    code: "408",
    statusCodeNum: 408,
    badge: "HTTP 408 • Request Timeout",
    title: "Network Connection Timed Out",
    subtitle: "The diocesan server waited too long for your device to transmit the request.",
    description:
      "Your network connection may be slow or intermittent, causing the server to terminate the connection before the entire request was received. This frequently happens on low-bandwidth rural connections.",
    pastoralQuote: {
      verse: "Wait for the Lord; be strong, and let your heart take courage; wait for the Lord!",
      reference: "Psalm 27:14"
    },
    category: "client",
    themeColor: "amber",
    icon: Clock,
    suggestedActions: [
      { label: "Retry Request", onClick: () => window.location.reload(), variant: "primary", icon: RefreshCw },
      { label: "Return to Homepage", href: "/", variant: "outline", icon: Home },
      { label: "Diocesan Directory", href: "/contact", variant: "ghost", icon: Phone }
    ],
    troubleshootingTips: [
      "Check your cellular data or Wi-Fi signal strength and re-attempt the connection.",
      "If uploading photos or document files, compress them to reduce transfer time.",
      "Disable high-latency VPN or proxy servers if currently enabled."
    ],
    diagnosticContext: "HTTP 408: The server timed out waiting for the request stream from the client."
  },

  "410": {
    code: "410",
    statusCodeNum: 410,
    badge: "HTTP 410 • Permanently Retired",
    title: "Diocesan Resource Retired",
    subtitle: "This historical publication or announcement has concluded its archival lifecycle.",
    description:
      "The specific announcement, job tender, conference registration, or notice has been permanently retired by the Diocesan Communications Office and is no longer available.",
    pastoralQuote: {
      verse: "For everything there is a season, and a time for every matter under heaven.",
      reference: "Ecclesiastes 3:1"
    },
    category: "client",
    themeColor: "navy",
    icon: Archive,
    suggestedActions: [
      { label: "Current Diocesan News", href: "/news", variant: "primary", icon: FileText },
      { label: "Upcoming Events", href: "/events", variant: "outline", icon: Compass },
      { label: "Return to Homepage", href: "/", variant: "ghost", icon: Home }
    ],
    troubleshootingTips: [
      "If you were seeking an expired job posting or synod announcement, check our latest News section.",
      "For historic synod records and pastoral letters, visit the Documents & Publications archive.",
      "Inquire directly with the Diocesan Registry for physical archival copies."
    ],
    diagnosticContext: "HTTP 410: The resource requested has been explicitly and permanently removed from the diocesan portal."
  },

  "429": {
    code: "429",
    statusCodeNum: 429,
    badge: "HTTP 429 • Rate Limit Exceeded",
    title: "Security Cooldown Active",
    subtitle: "Too many requests received from your IP address in a short period.",
    description:
      "To preserve service stability and safeguard the diocesan portal from automated traffic surges, your connection has been temporarily throttled. Please wait a few seconds before continuing.",
    pastoralQuote: {
      verse: "Be still, and know that I am God. I will be exalted among the nations, I will be exalted in the earth!",
      reference: "Psalm 46:10"
    },
    category: "client",
    themeColor: "red",
    icon: Gauge,
    suggestedActions: [
      { label: "Refresh After Cooldown", onClick: () => window.location.reload(), variant: "primary", icon: RefreshCw },
      { label: "Return to Homepage", href: "/", variant: "outline", icon: Home },
      { label: "Contact Support", href: "/contact", variant: "ghost", icon: Mail }
    ],
    troubleshootingTips: [
      "Avoid rapidly refreshing pages or submitting bulk automated requests.",
      "Close any background browser tabs that might be aggressively polling the portal.",
      "Your access will automatically restore once the security cooldown window elapses."
    ],
    diagnosticContext: "HTTP 429: Rate limit threshold exceeded. Client IP placed in temporary sliding-window cooldown."
  },

  "500": {
    code: "500",
    statusCodeNum: 500,
    badge: "HTTP 500 • Server Error",
    title: "Internal System Interruption",
    subtitle: "The diocesan server encountered an unexpected situation and could not fulfill your request.",
    description:
      "A technical anomaly occurred during code execution or database retrieval. Our diocesan systems team has received an automated alert and is investigating the incident.",
    pastoralQuote: {
      verse: "God is our refuge and strength, a very present help in trouble.",
      reference: "Psalm 46:1"
    },
    category: "server",
    themeColor: "red",
    icon: ServerCrash,
    suggestedActions: [
      { label: "Reload Page", onClick: () => window.location.reload(), variant: "primary", icon: RefreshCw },
      { label: "Return to Homepage", href: "/", variant: "outline", icon: Home },
      { label: "Report Incident to IT", href: "/contact", variant: "ghost", icon: Mail }
    ],
    troubleshootingTips: [
      "Try refreshing the page in a few moments; intermittent backend syncs resolve quickly.",
      "If this error persists, note the incident reference code provided below for IT support.",
      "Public sections such as Diocesan Schools and Bishop's Address remain available."
    ],
    diagnosticContext: "HTTP 500: Internal server malfunction. Unhandled backend runtime exception or database connectivity interruption."
  },

  "502": {
    code: "502",
    statusCodeNum: 502,
    badge: "HTTP 502 • Bad Gateway",
    title: "Gateway Communication Fault",
    subtitle: "The edge server received an invalid or null response from the upstream application.",
    description:
      "The web proxy serving EAR Shyogwe could not establish a healthy handshake with the application backend. This is usually temporary while services restart or deploy updates.",
    pastoralQuote: {
      verse: "The Lord is near to all who call on him, to all who call on him in truth.",
      reference: "Psalm 145:18"
    },
    category: "server",
    themeColor: "amber",
    icon: Radio,
    suggestedActions: [
      { label: "Retry Gateway Handshake", onClick: () => window.location.reload(), variant: "primary", icon: RefreshCw },
      { label: "Return to Homepage", href: "/", variant: "outline", icon: Home },
      { label: "Check System Status", href: "/contact", variant: "ghost", icon: Mail }
    ],
    troubleshootingTips: [
      "Wait 10 to 30 seconds and refresh the page while upstream workers finish cycling.",
      "Clear your browser DNS cache or try accessing through an alternative network.",
      "Hostinger web server proxy is operational; awaiting PHP backend response socket."
    ],
    diagnosticContext: "HTTP 502: Bad Gateway. Edge reverse proxy received an invalid response from upstream application server."
  },

  "503": {
    code: "503",
    statusCodeNum: 503,
    badge: "HTTP 503 • Service Unavailable",
    title: "Diocesan System Maintenance",
    subtitle: "The portal is temporarily offline for scheduled upgrades or infrastructure maintenance.",
    description:
      "The Anglican Diocese of Shyogwe technical team is currently performing scheduled database maintenance and security upgrades to enhance portal resilience and data safety.",
    pastoralQuote: {
      verse: "Unless the Lord builds the house, those who build it labor in vain.",
      reference: "Psalm 127:1"
    },
    category: "maintenance",
    themeColor: "navy",
    icon: Wrench,
    suggestedActions: [
      { label: "Check System Status", onClick: () => window.location.reload(), variant: "primary", icon: RefreshCw },
      { label: "Secretariat Emergency Line", href: "tel:+250788522174", variant: "outline", icon: Phone },
      { label: "Email Communications", href: "mailto:shyogwe@gmail.com", variant: "ghost", icon: Mail }
    ],
    troubleshootingTips: [
      "Scheduled maintenance usually concludes within 15 to 45 minutes.",
      "Pastoral emergency calls may be directed to the Diocesan Secretariat in Muhanga.",
      "The portal will automatically come back online once database migration completes."
    ],
    diagnosticContext: "HTTP 503: Service Unavailable. Scheduled maintenance mode enabled. Web daemon operating in maintenance buffer."
  },

  "504": {
    code: "504",
    statusCodeNum: 504,
    badge: "HTTP 504 • Gateway Timeout",
    title: "Upstream Response Timeout",
    subtitle: "The diocesan gateway timed out waiting for the database or application to reply.",
    description:
      "A complex diocesan report, document compilation, or heavy database transaction took longer than the maximum allotted server threshold. The process was stopped to avoid overloading.",
    pastoralQuote: {
      verse: "He gives strength to the weary and increases the power of the weak.",
      reference: "Isaiah 40:29"
    },
    category: "server",
    themeColor: "amber",
    icon: Clock,
    suggestedActions: [
      { label: "Retry Request", onClick: () => window.location.reload(), variant: "primary", icon: RefreshCw },
      { label: "Return to Homepage", href: "/", variant: "outline", icon: Home },
      { label: "Diocesan Registry", href: "/contact", variant: "ghost", icon: Mail }
    ],
    troubleshootingTips: [
      "Try requesting a narrower date range or smaller document batch size.",
      "Backend database queries may be running heavy synchronizations during peak hours.",
      "If the issue persists, our technical team will automatically optimize query execution."
    ],
    diagnosticContext: "HTTP 504: Gateway Timeout. Edge proxy timed out waiting for backend PHP-FPM / MySQL response socket."
  },

  "offline": {
    code: "Offline",
    badge: "Network Alert • Connection Lost",
    title: "You Are Currently Offline",
    subtitle: "No active internet connection was detected on your computer or mobile device.",
    description:
      "The diocesan portal requires an active internet connection to retrieve sermons, news, events, and document archives. Please check your Wi-Fi, Ethernet, or mobile cellular data.",
    pastoralQuote: {
      verse: "The Lord will keep your going out and your coming in from this time forth and forevermore.",
      reference: "Psalm 121:8"
    },
    category: "network",
    themeColor: "navy",
    icon: WifiOff,
    suggestedActions: [
      { label: "Check & Reconnect", onClick: () => window.location.reload(), variant: "primary", icon: RefreshCw },
      { label: "Return to Homepage", href: "/", variant: "outline", icon: Home }
    ],
    troubleshootingTips: [
      "Ensure Airplane Mode is switched off on your device.",
      "Verify that your Wi-Fi router is connected or that cellular data is enabled.",
      "As soon as your connection is re-established, this page will detect it automatically!"
    ],
    diagnosticContext: "Navigator offline state: navigator.onLine is false or connection ping failed."
  },

  "maintenance": {
    code: "503",
    statusCodeNum: 503,
    badge: "Scheduled Maintenance • System Upgrade",
    title: "Scheduled Diocesan Maintenance",
    subtitle: "Upgrading the official Anglican Diocese of Shyogwe digital portal.",
    description:
      "We are carrying out essential maintenance and performance enhancements to better serve our parishes, schools, and health centers. Service will resume shortly.",
    pastoralQuote: {
      verse: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.",
      reference: "Jeremiah 29:11"
    },
    category: "maintenance",
    themeColor: "navy",
    icon: Wrench,
    suggestedActions: [
      { label: "Refresh Status", onClick: () => window.location.reload(), variant: "primary", icon: RefreshCw },
      { label: "Emergency Hotline", href: "tel:+250788522174", variant: "outline", icon: Phone },
      { label: "Diocesan Secretariat", href: "mailto:shyogwe@gmail.com", variant: "ghost", icon: Mail }
    ],
    troubleshootingTips: [
      "Expected restoration time: Under 30 minutes from maintenance start.",
      "Critical communications and pastoral inquiries remain open via our headquarters telephone.",
      "No data will be affected during this scheduled maintenance routine."
    ],
    diagnosticContext: "Scheduled maintenance in progress across Anglican Diocese of Shyogwe portal services."
  },

  "session-expired": {
    code: "419",
    statusCodeNum: 419,
    badge: "Security Notice • Session Expired",
    title: "Authentication Session Timed Out",
    subtitle: "Your secure diocesan administrative session has expired due to inactivity.",
    description:
      "To safeguard diocesan sensitive documents, member records, and administrative controls, secure sessions are automatically closed after a period of idle time. Please log in again to resume your work.",
    pastoralQuote: {
      verse: "The name of the Lord is a strong tower; the righteous man runs into it and is safe.",
      reference: "Proverbs 18:10"
    },
    category: "client",
    themeColor: "indigo",
    icon: Lock,
    suggestedActions: [
      { label: "Log In Again", href: "/admin/login", variant: "primary", icon: LogIn },
      { label: "Return to Homepage", href: "/", variant: "outline", icon: Home },
      { label: "Contact Registry", href: "/contact", variant: "ghost", icon: Mail }
    ],
    troubleshootingTips: [
      "Click 'Log In Again' to authenticate with your username and password.",
      "Any pending unsaved draft changes may be recovered from local browser cache if enabled.",
      "Remember to log out manually when using public or shared computers."
    ],
    diagnosticContext: "HTTP 419 / CSRF Token Expired: Secure session token invalid or lifetime elapsed."
  }
};
