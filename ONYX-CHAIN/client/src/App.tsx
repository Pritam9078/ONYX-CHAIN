import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import { WalletProvider, useWallet } from "./contexts/WalletContext";
import { AnimatePresence } from "framer-motion";
import LoginPage from "./components/LoginPage";
import TermsOfService from "./components/TermsOfService";
import PrivacyPolicy from "./components/PrivacyPolicy";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <AppContent />
        </WalletProvider>
      </QueryClientProvider>
      <Toaster />
    </>
  );
}

// Separate component to avoid circular dependency with WalletProvider
function AppContent() {
  const { connected } = useWallet() || { connected: false };

  return (
    <AnimatePresence mode="wait">
      <Switch>
        {/* Always accessible routes, even when not connected */}
        <Route path="/terms" component={TermsOfService} />
        <Route path="/privacy" component={PrivacyPolicy} />
        
        {/* Protected routes that require wallet connection */}
        {connected ? (
          <Route path="/" component={Home} />
        ) : (
          <Route path="*" component={LoginPage} />
        )}
        
        {/* Fallback to 404 when connected */}
        {connected && <Route component={NotFound} />}
      </Switch>
    </AnimatePresence>
  );
}

export default App;
