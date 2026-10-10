import React, { Component, ErrorInfo, ReactNode } from "react";
import ErrorLandingLayout from "./ErrorLandingLayout";
import { ERROR_PAGES_DATA } from "@/config/errorPagesData";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an application error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <ErrorLandingLayout
          errorCode="500"
          errorConfig={ERROR_PAGES_DATA["500"]}
          customError={this.state.error}
          customComponentStack={this.state.errorInfo?.componentStack}
          requestedUrl={typeof window !== "undefined" ? window.location.pathname : "/"}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
