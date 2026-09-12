import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Team from "./pages/Team";
import Bishop from "./pages/Bishop";
import Projects from "./pages/Projects";
import Donate from "./pages/Donate";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Services from "./pages/Services";
import Events from "./pages/Events";
import Contact from "./pages/Contact";
import EventDetail from "./pages/EventDetail";
import AdminEvents from "./pages/AdminEvents";
import AdminMembers from "./pages/AdminMembers";
import AdminPages from "./pages/AdminPages";
import AdminAnalytics from "./pages/AdminAnalytics";
import Login from "./pages/Login";
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import TeamManagement from "./pages/admin/TeamManagement";
import ServicesManagement from "./pages/admin/ServicesManagement";
import HeroImagesManagement from "./pages/admin/HeroImagesManagement";
import SchoolsManagement from "./pages/admin/SchoolsManagement";
import PartnersManagement from "./pages/admin/PartnersManagement";
import HealthManagement from "./pages/admin/HealthManagement";
import HealthDetail from "./pages/admin/HealthDetail";
import ProjectsManagement from "./pages/admin/ProjectsManagement";
import ContentManagement from "./pages/admin/ContentManagement";
import SettingsManagement from "./pages/admin/SettingsManagement";

import { router } from "./router";
import { RouterProvider } from "react-router-dom";

const App = () => (
  <ErrorBoundary>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </TooltipProvider>
    </AuthProvider>
  </ErrorBoundary>
);

export default App;
