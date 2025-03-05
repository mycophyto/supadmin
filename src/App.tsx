
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useConfigStore } from "@/store/configStore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { Onboarding } from "./components/Onboarding";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RecordDetail from "./pages/RecordDetail";
import Settings from "./pages/Settings";
import Tables from "./pages/Tables";
import TableView from "./pages/TableView";

const queryClient = new QueryClient();

// Protected route component that checks if Supabase is configured
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isConfigured = useConfigStore.getState().isSupabaseConfigured();
  
  // If not configured, redirect to onboarding
  if (!isConfigured) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          } />
          
          <Route path="/tables" element={
            <ProtectedRoute>
              <Tables />
            </ProtectedRoute>
          } />
          
          <Route path="/tables/:tableName" element={
            <ProtectedRoute>
              <TableView />
            </ProtectedRoute>
          } />
          
          <Route path="/tables/:tableName/:id" element={
            <ProtectedRoute>
              <RecordDetail />
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
