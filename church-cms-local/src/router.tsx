import { createBrowserRouter, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Team from "./pages/Team";
import Bishop from "./pages/Bishop";
import Projects from "./pages/Projects";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import Donate from "./pages/Donate";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Services from "./pages/Services";
import Events from "./pages/Events";
import Contact from "./pages/Contact";
import Schools from "./pages/Schools";
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
import ProjectsOverview from "./pages/admin/ProjectsOverview";
import ContentManagement from "./pages/admin/ContentManagement";
import SettingsManagement from "./pages/admin/SettingsManagement";
import TestDashboard from "./pages/admin/TestDashboard";
import TestTeamManagement from "./pages/admin/TestTeamManagement";
import ProtectedRoute from "./components/ProtectedRoute";

// Create router with future flags enabled
export const router = createBrowserRouter(
  [
    { path: "/", element: <Index /> },
    { path: "/team", element: <Team /> },
    { path: "/bishop", element: <Bishop /> },
    { path: "/projects", element: <Projects /> },
    { path: "/projects/:category", element: <ProjectDetailPage /> },
    { path: "/programs", element: <Navigate to="/projects" replace /> },
    { path: "/programs/:slug", element: <Projects /> },
    { path: "/donate", element: <Donate /> },
    { path: "/dashboard", element: <Dashboard /> },
    { path: "/about", element: <About /> },
    { path: "/services", element: <Services /> },
    { path: "/events", element: <Events /> },
    { path: "/contact", element: <Contact /> },
    { path: "/schools", element: <Schools /> },
    { path: "/events/:id", element: <EventDetail /> },
    { path: "/login", element: <Login /> },
    { path: "/admin", element: <Navigate to="/admin/dashboard" replace /> },
    { path: "/admin/login", element: <AdminLogin /> },
    { path: "/admin/dashboard", element: <AdminDashboard /> },
    { path: "/admin/test", element: <TestDashboard /> },
    { path: "/admin/test-team", element: <TestTeamManagement /> },
    { path: "/admin/team", element: <TeamManagement /> },
    { path: "/admin/services", element: <ServicesManagement /> },
    { path: "/admin/hero-images", element: <HeroImagesManagement /> },
    { path: "/admin/schools", element: <SchoolsManagement /> },
    { path: "/admin/partners", element: <PartnersManagement /> },
    { path: "/admin/health", element: <HealthManagement /> },
    { path: "/admin/health/:id", element: <HealthDetail /> },
    { path: "/admin/projects", element: <ProjectsOverview /> },
    { path: "/admin/programs", element: <ProjectsManagement /> },
    { path: "/admin/content", element: <ContentManagement /> },
    { path: "/admin/events", element: <AdminEvents /> },
    { path: "/admin/settings", element: <SettingsManagement /> },
    { path: "/admin/members", element: <AdminMembers /> },
    { path: "/admin/pages", element: <AdminPages /> },
    { path: "/admin/analytics", element: <AdminAnalytics /> },
    { path: "*", element: <NotFound /> }
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    },
    // Suppress development warnings
    basename: import.meta.env.DEV ? undefined : '/'
  }
);