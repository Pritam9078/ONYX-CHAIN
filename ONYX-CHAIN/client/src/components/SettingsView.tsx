import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "../contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import ProfileSettings from "./ProfileSettings";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UserPreferences {
  darkMode: boolean;
  animations: boolean;
  notifications: boolean;
}

const SettingsView: React.FC = () => {
  const { walletInfo, disconnectWallet } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'danger'>('profile');
  const [darkMode, setDarkMode] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [notifications, setNotifications] = useState(true);
  
  // Fetch user data
  const { data: userData } = useQuery({
    queryKey: ['/api/users/wallet', walletInfo?.address],
    enabled: !!walletInfo?.address,
  });
  
  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: UserPreferences) => {
      return apiRequest('PATCH', `/api/users/preferences/${walletInfo?.address}`, preferences);
    },
    onSuccess: () => {
      // Invalidate user data
      queryClient.invalidateQueries({ queryKey: ['/api/users/wallet', walletInfo?.address] });
      toast({
        title: "Preferences Updated",
        description: "Your preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Failed to Save",
        description: "Could not update your preferences. Please try again.",
      });
    }
  });
  
  // Parse preferences from user data when it changes
  useEffect(() => {
    if (userData) {
      try {
        const preferences = userData.preferences 
          ? JSON.parse(userData.preferences)
          : { darkMode: true, animations: true, notifications: true };
          
        setDarkMode(preferences.darkMode);
        setAnimations(preferences.animations);
        setNotifications(preferences.notifications);
      } catch (error) {
        console.error("Error parsing preferences:", error);
      }
    }
  }, [userData]);
  
  // Handle preference changes
  const handleDarkModeChange = (checked: boolean) => {
    setDarkMode(checked);
    updatePreferencesMutation.mutate({ darkMode: checked, animations, notifications });
  };
  
  const handleAnimationsChange = (checked: boolean) => {
    setAnimations(checked);
    updatePreferencesMutation.mutate({ darkMode, animations: checked, notifications });
  };
  
  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked);
    updatePreferencesMutation.mutate({ darkMode, animations, notifications: checked });
  };
  
  const handleClearAllData = () => {
    if (confirm("Are you sure you want to clear all your data? This cannot be undone.")) {
      toast({
        title: "Data Cleared",
        description: "All your data has been cleared successfully.",
      });
    }
  };
  
  const handleResetAccount = () => {
    if (confirm("Are you sure you want to reset your account? This cannot be undone.")) {
      // Reset preferences to defaults
      updatePreferencesMutation.mutate({ 
        darkMode: true, 
        animations: true, 
        notifications: true 
      });
      
      toast({
        title: "Account Reset",
        description: "Your account has been reset successfully.",
      });
    }
  };
  
  return (
    <section className="max-w-4xl mx-auto">
      <h2 className="font-['Orbitron'] text-2xl font-bold mb-6">Settings</h2>
      
      {/* Settings Tabs */}
      <div className="flex mb-6 border-b border-[#8A2BE2]">
        <button
          className={`px-4 py-2 mr-2 font-['Orbitron'] font-medium transition-all ${
            activeTab === 'profile' 
              ? 'border-b-2 border-[#00FFFF] text-[#00FFFF]' 
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`px-4 py-2 mr-2 font-['Orbitron'] font-medium transition-all ${
            activeTab === 'preferences' 
              ? 'border-b-2 border-[#00FFFF] text-[#00FFFF]' 
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('preferences')}
        >
          Preferences
        </button>
        <button
          className={`px-4 py-2 font-['Orbitron'] font-medium transition-all ${
            activeTab === 'danger' 
              ? 'border-b-2 border-[#FF3333] text-[#FF3333]' 
              : 'text-gray-400 hover:text-white'
          }`}
          onClick={() => setActiveTab('danger')}
        >
          Danger Zone
        </button>
      </div>
      
      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ProfileSettings />
            
            <motion.div 
              className="rounded-lg p-6 mt-6 border border-[#8A2BE2]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <h3 className="font-['Orbitron'] text-xl mb-4">Wallet Connection</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img src="https://cdn.worldvectorlogo.com/logos/metamask.svg" alt="MetaMask" className="w-6 h-6 mr-3" />
                  <div>
                    <div className="font-medium">{walletInfo?.walletType || "MetaMask"}</div>
                    <div className="text-sm text-gray-400">Connected</div>
                  </div>
                </div>
                <motion.button 
                  className="text-red-400 hover:text-white transition-colors"
                  onClick={disconnectWallet}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1">
                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                    <line x1="12" y1="2" x2="12" y2="12"></line>
                  </svg>
                  Disconnect
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {activeTab === 'preferences' && (
          <motion.div
            key="preferences"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="rounded-lg p-6 mb-6 border border-[#8A2BE2]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-['Orbitron'] text-xl mb-4">Appearance & Behavior</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Dark Mode</h4>
                    <p className="text-sm text-gray-400">Switch between light and dark themes</p>
                  </div>
                  <Switch 
                    checked={darkMode}
                    onCheckedChange={handleDarkModeChange}
                    className="data-[state=checked]:bg-[#00FFFF]"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Animated Effects</h4>
                    <p className="text-sm text-gray-400">Enable UI animations and effects</p>
                  </div>
                  <Switch 
                    checked={animations}
                    onCheckedChange={handleAnimationsChange}
                    className="data-[state=checked]:bg-[#00FFFF]"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notifications</h4>
                    <p className="text-sm text-gray-400">Receive alerts about activity</p>
                  </div>
                  <Switch 
                    checked={notifications}
                    onCheckedChange={handleNotificationsChange}
                    className="data-[state=checked]:bg-[#00FFFF]"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {activeTab === 'danger' && (
          <motion.div
            key="danger"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="rounded-lg p-6 border border-red-500"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-['Orbitron'] text-xl mb-4 text-red-400">Danger Zone</h3>
              
              <div className="space-y-4">
                <motion.button 
                  className="bg-[#1E1E1E] border border-red-400 hover:bg-red-400 hover:bg-opacity-20 rounded-md p-3 w-full text-left flex justify-between items-center transition-all"
                  onClick={handleClearAllData}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div>
                    <h4 className="font-medium">Clear All Data</h4>
                    <p className="text-sm text-gray-400">Remove all your uploaded files</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </motion.button>
                
                <motion.button 
                  className="bg-[#1E1E1E] border border-red-400 hover:bg-red-400 hover:bg-opacity-20 rounded-md p-3 w-full text-left flex justify-between items-center transition-all"
                  onClick={handleResetAccount}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div>
                    <h4 className="font-medium">Reset Account</h4>
                    <p className="text-sm text-gray-400">Reset all your account settings</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF3333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"></path>
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default SettingsView;
