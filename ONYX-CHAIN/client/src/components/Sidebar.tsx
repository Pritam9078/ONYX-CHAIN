import React from "react";
import { motion } from "framer-motion";
import { useWallet } from "../contexts/WalletContext";
import { useQuery } from "@tanstack/react-query";

interface SidebarProps {
  activeSection: "upload" | "files" | "settings" | "analytics";
  onChangeSection: (section: "upload" | "files" | "settings" | "analytics") => void;
  onCloseSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onChangeSection, onCloseSidebar }) => {
  const { walletInfo } = useWallet();
  
  // Get files count for storage stats
  const { data: files } = useQuery({
    queryKey: [`/api/files/${walletInfo?.address || ''}`],
    enabled: !!walletInfo?.address,
  });
  
  const handleSectionClick = (section: "upload" | "files" | "settings" | "analytics") => {
    onChangeSection(section);
    onCloseSidebar();
  };
  
  // Calculate actual storage from file sizes
  const fileCount = Array.isArray(files) ? files.length : 0;
  const totalBytes = Array.isArray(files) 
    ? files.reduce((total, file) => total + (file.fileSize || 0), 0) 
    : 0;
  
  // Convert bytes to GB for display
  const usedStorage = totalBytes / (1024 * 1024 * 1024);
  const totalStorage = 10; // 10 GB total storage
  const usagePercentage = Math.min(100, (usedStorage / totalStorage) * 100);
  
  return (
    <nav className="p-4 h-full flex flex-col">
      <ul className="space-y-2">
        <li>
          <button
            onClick={() => handleSectionClick("upload")}
            className={`w-full flex items-center px-4 py-3 rounded-md transition-all ${
              activeSection === "upload" ? "text-[#00FFFF] bg-[#8A2BE2] bg-opacity-20" : "text-gray-300 hover:bg-[#8A2BE2] hover:bg-opacity-20"
            } group`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 group-hover:text-[#FF00FF]">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span className="font-medium">Upload Files</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => handleSectionClick("files")}
            className={`w-full flex items-center px-4 py-3 rounded-md transition-all ${
              activeSection === "files" ? "text-[#00FFFF] bg-[#8A2BE2] bg-opacity-20" : "text-gray-300 hover:bg-[#8A2BE2] hover:bg-opacity-20"
            } group`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 group-hover:text-[#FF00FF]">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            <span className="font-medium">My Files</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => handleSectionClick("analytics")}
            className={`w-full flex items-center px-4 py-3 rounded-md transition-all ${
              activeSection === "analytics" ? "text-[#00FFFF] bg-[#8A2BE2] bg-opacity-20" : "text-gray-300 hover:bg-[#8A2BE2] hover:bg-opacity-20"
            } group`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 group-hover:text-[#FF00FF]">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
            <span className="font-medium">Analytics</span>
          </button>
        </li>
        <li>
          <button
            onClick={() => handleSectionClick("settings")}
            className={`w-full flex items-center px-4 py-3 rounded-md transition-all ${
              activeSection === "settings" ? "text-[#00FFFF] bg-[#8A2BE2] bg-opacity-20" : "text-gray-300 hover:bg-[#8A2BE2] hover:bg-opacity-20"
            } group`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 group-hover:text-[#FF00FF]">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            <span className="font-medium">Settings</span>
          </button>
        </li>
      </ul>
      
      <div className="h-[1px] w-full my-4 bg-gradient-to-r from-transparent via-[#00FFFF] to-transparent"></div>
      
      <div className="mt-auto px-4">
        <div className="p-4 rounded-md relative overflow-hidden border border-[#8A2BE2]">
          <div className="absolute inset-0 bg-[#1E1E1E] opacity-80"></div>
          <div className="relative z-10">
            <h3 className="font-['Orbitron'] text-sm font-medium mb-2 text-[#00FFFF]">Storage Stats</h3>
            <div className="w-full bg-[#121212] rounded-full h-2 mb-2">
              <motion.div 
                className="bg-gradient-to-r from-[#00FFFF] to-[#FF00FF] h-2 rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${usagePercentage}%` }}
                transition={{ duration: 1, delay: 0.2 }}
              ></motion.div>
            </div>
            <p className="text-xs text-gray-400">{usedStorage.toFixed(1)} GB / {totalStorage} GB used</p>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
