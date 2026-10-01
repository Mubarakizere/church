import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Church,
  ShieldCheck,
  Phone,
  Mail,
  ChevronRight
} from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  showDetails: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    showDetails: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an application error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      showDetails: false
    });
  };

  private toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
          {/* Simple Clean Top Header */}
          <header className="bg-church-navy text-white py-4 px-6 border-b border-slate-800 shadow-sm">
            <div className="container mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center">
                  <Church className="h-5 w-5 text-church-gold" />
                </div>
                <div>
                  <h1 className="font-serif font-bold text-sm sm:text-base leading-tight">
                    Anglican Church of Rwanda
                  </h1>
                  <p className="text-[11px] text-slate-300 font-medium tracking-wide">
                    Shyogwe Diocese • Official Portal
                  </p>
                </div>
              </div>

              <a
                href="/"
                className="text-xs font-semibold text-slate-200 hover:text-church-gold transition-colors flex items-center gap-1"
              >
                <Home className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Portal Home</span>
              </a>
            </div>
          </header>

          {/* Main Error Presentation Card */}
          <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 sm:p-10 text-center">
              {/* Icon badge */}
              <div className="h-16 w-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
                <AlertTriangle className="h-8 w-8 text-church-navy" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-church-gold block mb-1">
                System Notice
              </span>

              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-church-navy mb-3">
                Something Unexpected Occurred
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed mb-6">
                The portal encountered a temporary execution issue. Our technical administrators have been notified.
                Please refresh the page or return to the main homepage.
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                <Button
                  onClick={this.handleReload}
                  className="bg-church-navy hover:bg-church-navy/90 text-white font-semibold text-xs uppercase tracking-wider h-11 px-6 shadow-sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2 text-church-gold" />
                  Reload Page
                </Button>

                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="border-slate-300 hover:border-church-gold hover:text-church-navy text-slate-700 font-semibold text-xs uppercase tracking-wider h-11 px-6 bg-white"
                >
                  <Home className="h-4 w-4 mr-2 text-church-navy" />
                  Return to Home
                </Button>

                <Button
                  variant="ghost"
                  onClick={this.handleReset}
                  className="text-slate-500 hover:text-slate-800 text-xs font-semibold h-11 px-4"
                >
                  Dismiss & Retry
                </Button>
              </div>

              {/* Developer Technical Details Toggle */}
              {this.state.error && (
                <div className="pt-4 border-t border-slate-100 text-left">
                  <button
                    onClick={this.toggleDetails}
                    className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 mx-auto font-medium"
                  >
                    <span>{this.state.showDetails ? "Hide" : "View"} Diagnostic Details</span>
                    <ChevronRight
                      className={`h-3 w-3 transition-transform ${
                        this.state.showDetails ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  {this.state.showDetails && (
                    <div className="mt-3 bg-slate-900 text-slate-200 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-48 border border-slate-800">
                      <p className="text-amber-400 font-bold mb-1">
                        {this.state.error.name}: {this.state.error.message}
                      </p>
                      {this.state.errorInfo?.componentStack && (
                        <pre className="text-[11px] text-slate-400 whitespace-pre-wrap leading-tight">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>

          {/* Simple Clean Bottom Footer */}
          <footer className="py-4 px-6 bg-white border-t border-slate-200 text-center text-xs text-slate-500">
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>Diocesan Secretariat Hotline: +250 788 522 174 • shyogwe@gmail.com</span>
              <span>Anglican Diocese of Shyogwe, Muhanga, Rwanda</span>
            </div>
          </footer>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
