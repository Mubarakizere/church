import { LucideIcon } from "lucide-react";

export type ErrorStatusCode =
  | "400"
  | "401"
  | "403"
  | "404"
  | "408"
  | "410"
  | "429"
  | "500"
  | "502"
  | "503"
  | "504"
  | "offline"
  | "maintenance"
  | "session-expired";

export type ErrorCategory = "client" | "server" | "network" | "maintenance";

export interface ErrorAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "outline" | "secondary" | "ghost";
  icon?: LucideIcon;
}

export interface ErrorDetailsConfig {
  code: string;
  statusCodeNum?: number;
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  pastoralQuote?: {
    verse: string;
    reference: string;
  };
  category: ErrorCategory;
  themeColor: "navy" | "gold" | "red" | "amber" | "indigo" | "emerald" | "rose";
  icon: LucideIcon;
  suggestedActions: ErrorAction[];
  troubleshootingTips: string[];
  diagnosticContext?: string;
}
