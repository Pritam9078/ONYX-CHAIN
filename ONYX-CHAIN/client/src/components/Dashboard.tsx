import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useWallet } from "../contexts/WalletContext";
import Sidebar from "./Sidebar";
import FileUpload from "./FileUpload";
import FileView from "./FileView";
import SettingsView from "./SettingsView";
import Analytics from "./Analytics";
import { useMediaQuery } from "@/hooks/use-mobile";

type Section = "upload" | "files" | "settings" | "analytics";

const Dashboard: React.FC = () => {
  const { walletInfo, disconnectWallet } = useWallet();
  const [activeSection, setActiveSection] = useState<Section>("upload");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Close sidebar automatically on mobile
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col bg-[#121212] text-white"
      style={{
        backgroundSize: "40px 40px",
        backgroundImage: `
          linear-gradient(to right, rgba(255, 0, 255, 0.05) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0, 255, 255, 0.05) 1px, transparent 1px)
        `
      }}
    >
      {/* Navbar */}
      <header className="bg-[#1E1E1E] border-b border-[#8A2BE2]">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={toggleSidebar}
              className="mr-4 text-[#00FFFF] hover:text-[#FF00FF] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <h1 className="font-['Orbitron'] text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#FF00FF]">
              ONYX<span className="text-white">CHAIN</span>
            </h1>
          </div>
          
          <div className="flex items-center">
            <div className="relative mr-4">
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-[#00FF00]"></span>
              <span 
                className="px-3 py-1 rounded-md text-xs font-mono truncate hover:bg-[#1E1E1E] transition-all cursor-pointer border border-[#8A2BE2]"
                title={walletInfo?.address}
              >
                {walletInfo?.address ? `${walletInfo.address.substring(0, 6)}...${walletInfo.address.substring(walletInfo.address.length - 4)}` : "0x0000...0000"}
              </span>
            </div>
            <button 
              onClick={disconnectWallet}
              className="text-gray-300 hover:text-[#00FFFF] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar/Drawer */}
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className={`${isMobile ? 'absolute z-30' : 'relative'} w-64 bg-[#1E1E1E] border-r border-[#8A2BE2] h-full`}
            >
              <Sidebar 
                activeSection={activeSection} 
                onChangeSection={setActiveSection} 
                onCloseSidebar={() => isMobile && setSidebarOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeSection === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <FileUpload />
              </motion.div>
            )}
            
            {activeSection === "files" && (
              <motion.div
                key="files"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <FileView />
              </motion.div>
            )}
            
            {activeSection === "analytics" && (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Analytics />
              </motion.div>
            )}
            
            {activeSection === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SettingsView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
      
      {/* Footer with Legal Links */}
      <footer className="py-3 px-6 bg-[#1E1E1E] border-t border-[#8A2BE2] text-center text-xs text-gray-500">
        <div className="container mx-auto">
          <p>
            © 2025 OnyxChain | 
            <Link href="/terms" className="ml-2 text-[#00FFFF] hover:text-[#FF00FF] transition-colors">
              Terms of Service
            </Link> | 
            <Link href="/privacy" className="ml-2 text-[#00FFFF] hover:text-[#FF00FF] transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </footer>
    </motion.div>
  );
};

export default Dashboard;
