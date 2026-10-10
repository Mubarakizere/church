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
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Gallery from "./pages/Gallery";
import EventsManagement from "./pages/admin/EventsManagement";
import NewsManagement from "./pages/admin/NewsManagement";
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
import GalleryManagement from "./pages/admin/GalleryManagement";
import DocumentsManagement from "./pages/admin/DocumentsManagement";
import SecureDocumentsManagement from "./pages/admin/SecureDocumentsManagement";
import SecureDocumentAnalytics from "./pages/admin/SecureDocumentAnalytics";
import SecureDocumentViewer from "./pages/SecureDocumentViewer";
import ChangePassword from "./pages/admin/ChangePassword";
import UsersManagement from "./pages/admin/UsersManagement";
import Documents from "./pages/Documents";
import ProtectedRoute from "./components/ProtectedRoute";
import RootLayout from "./components/RootLayout";
import ErrorPage from "./pages/ErrorPage";
import ErrorShowcasePage from "./pages/ErrorShowcasePage";

// Create router with future flags enabled
export const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      children: [
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
    { path: "/news", element: <News /> },
    { path: "/news/:slug", element: <NewsDetail /> },
    { path: "/gallery", element: <Gallery /> },
    { path: "/documents", element: <Documents /> },
    { path: "/documents/view/:id", element: <SecureDocumentViewer /> },
    { path: "/contact", element: <Contact /> },
    { path: "/schools", element: <Schools /> },
    { path: "/events/:id", element: <EventDetail /> },
    { path: "/login", element: <Login /> },
    { path: "/admin", element: <Navigate to="/admin/dashboard" replace /> },
    { path: "/admin/login", element: <AdminLogin /> },
    { path: "/admin/dashboard", element: <AdminDashboard /> },
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
    { path: "/admin/events", element: <EventsManagement /> },
    { path: "/admin/news", element: <NewsManagement /> },
    { path: "/admin/gallery", element: <GalleryManagement /> },
    { path: "/admin/documents", element: <DocumentsManagement /> },
    { path: "/admin/secure-documents", element: <SecureDocumentsManagement /> },
    { path: "/admin/secure-documents/:id/analytics", element: <SecureDocumentAnalytics /> },
    { path: "/admin/change-password", element: <ChangePassword /> },
    { path: "/admin/users", element: <UsersManagement /> },
    { path: "/admin/settings", element: <SettingsManagement /> },
    { path: "/admin/members", element: <AdminMembers /> },
    { path: "/admin/pages", element: <AdminPages /> },
    { path: "/admin/analytics", element: <AdminAnalytics /> },
    { path: "/error", element: <ErrorShowcasePage /> },
    { path: "/error/:code", element: <ErrorPage /> },
    { path: "/400", element: <ErrorPage fixedCode="400" /> },
    { path: "/401", element: <ErrorPage fixedCode="401" /> },
    { path: "/403", element: <ErrorPage fixedCode="403" /> },
    { path: "/404", element: <NotFound /> },
    { path: "/408", element: <ErrorPage fixedCode="408" /> },
    { path: "/410", element: <ErrorPage fixedCode="410" /> },
    { path: "/429", element: <ErrorPage fixedCode="429" /> },
    { path: "/500", element: <ErrorPage fixedCode="500" /> },
    { path: "/502", element: <ErrorPage fixedCode="502" /> },
    { path: "/503", element: <ErrorPage fixedCode="503" /> },
    { path: "/504", element: <ErrorPage fixedCode="504" /> },
    { path: "/offline", element: <ErrorPage fixedCode="offline" /> },
    { path: "/maintenance", element: <ErrorPage fixedCode="maintenance" /> },
    { path: "/session-expired", element: <ErrorPage fixedCode="session-expired" /> },
    { path: "*", element: <NotFound /> }
      ]
    }
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