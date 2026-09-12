import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, redirectTo }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-section flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-church-navy mb-4" />
            <p className="text-center text-muted-foreground">
              Checking authentication...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    const to = redirectTo || '/login';
    return <Navigate to={to} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;