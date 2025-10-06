
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    // If it's a super admin route that's missing, redirect to super admin dashboard
    if (location.pathname.startsWith('/super-admin/')) {
      console.log('Redirecting invalid super admin route to dashboard');
      setTimeout(() => {
        navigate('/super-admin', { replace: true });
      }, 2000);
    }
  }, [location.pathname, navigate]);

  const handleGoBack = () => {
    if (location.pathname.startsWith('/super-admin/')) {
      navigate('/super-admin');
    } else {
      window.history.back();
    }
  };

  const handleGoHome = () => {
    if (location.pathname.startsWith('/super-admin/')) {
      navigate('/super-admin');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            Page Not Found
          </h2>
          <p className="text-gray-500 dark:text-gray-500 mb-8">
            The page you're looking for doesn't exist or has been moved.
            {location.pathname.startsWith('/super-admin/') && (
              <span className="block mt-2 text-blue-600">
                Redirecting to Super Admin Dashboard...
              </span>
            )}
          </p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={handleGoBack}
            variant="outline"
            className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          
          <Button 
            onClick={handleGoHome}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Home className="h-4 w-4 mr-2" />
            {location.pathname.startsWith('/super-admin/') ? 'Return to Dashboard' : 'Return to Home'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
