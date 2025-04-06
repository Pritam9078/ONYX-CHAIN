import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useWallet } from "../contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "@shared/schema";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CyberGlitch } from "./ui/cyber-glitch";

const ProfileSettings: React.FC = () => {
  const { walletInfo } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [displayName, setDisplayName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Get user profile data
  const {
    data: user,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [`/api/users/wallet/${walletInfo?.address}`],
    enabled: !!walletInfo?.address,
  });
  
  // Create user profile mutation
  const createProfileMutation = useMutation({
    mutationFn: async () => {
      if (!walletInfo?.address) {
        throw new Error("No wallet address available");
      }
      
      const newUser = {
        username: `user_${Date.now()}`, // Generate a random username
        password: Math.random().toString(36).slice(-8), // Generate a random password
        walletAddress: walletInfo.address,
        displayName: "",
        profileImage: null
      };
      
      const response = await apiRequest(
        "POST",
        `/api/users`,
        newUser
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Created",
        description: "Your profile has been created successfully",
      });
      refetch(); // Refetch the user data after creating the profile
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create profile",
        variant: "destructive",
      });
    },
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: { displayName: string; profileImage: string | null }) => {
      if (!walletInfo?.address) {
        throw new Error("No wallet address available");
      }
      
      const response = await apiRequest(
        "PATCH",
        `/api/users/profile/${walletInfo.address}`,
        profileData
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/users/wallet/${walletInfo?.address}`] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    },
  });
  
  // Load initial data from user
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setProfileImage(user.profileImage || null);
    }
  }, [user]);
  
  // Handle profile image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size and type
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Profile image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    // Read the file as base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setProfileImage(base64);
      setIsUploading(false);
    };
    
    reader.onerror = () => {
      toast({
        title: "Upload Failed",
        description: "Failed to read the image file",
        variant: "destructive",
      });
      setIsUploading(false);
    };
    
    reader.readAsDataURL(file);
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateProfileMutation.mutate({
      displayName,
      profileImage,
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-pulse h-64 w-full bg-[#8A2BE2] bg-opacity-20 rounded-lg"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 bg-purple-900 bg-opacity-20 rounded-lg border border-[#8A2BE2]">
        <h3 className="text-xl font-['Orbitron'] text-[#00FFFF] mb-4">No Profile Found</h3>
        <p className="text-gray-300 mb-6">
          You don't have a profile yet. Create one now to customize your experience on OnyxChain.
        </p>
        
        <div className="flex justify-center">
          <Button
            onClick={() => createProfileMutation.mutate()}
            className="bg-gradient-to-r from-[#8A2BE2] to-[#FF00FF] text-white hover:opacity-90 transition-opacity"
            disabled={createProfileMutation.isPending}
          >
            {createProfileMutation.isPending ? "Creating..." : "Create Profile"}
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <section className="py-6 px-4">
      <div className="mb-8">
        <CyberGlitch className="text-3xl font-['Orbitron'] mb-6 inline-block">
          Profile Settings
        </CyberGlitch>
        <p className="text-gray-400">
          Customize your identity on the blockchain. Add a display name and profile image 
          to make your presence unique in the OnyxChain ecosystem.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Image Section */}
        <div className="col-span-1">
          <div className="bg-gradient-to-br from-[#121212] to-[#1E1E1E] p-6 rounded-lg border border-[#8A2BE2] hover:shadow-[0_0_15px_rgba(138,43,226,0.3)] transition-all">
            <h3 className="font-['Orbitron'] text-xl mb-4">Profile Image</h3>
            
            <div className="flex flex-col items-center">
              <div className="relative mb-6 group">
                <Avatar className="h-32 w-32 border-4 border-[#8A2BE2] bg-black">
                  {profileImage ? (
                    <AvatarImage src={profileImage} alt="Profile" />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-[#8A2BE2] to-[#FF00FF] text-white text-3xl">
                      {walletInfo?.address ? walletInfo.address.substring(2, 4).toUpperCase() : 'OC'}
                    </AvatarFallback>
                  )}
                </Avatar>
                
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00FFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                  </svg>
                </motion.div>
              </div>
              
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              
              <Button
                variant="outline"
                className="border-[#00FFFF] hover:bg-[#00FFFF] hover:bg-opacity-10 text-[#00FFFF] w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Change Image"}
              </Button>
              
              {profileImage && (
                <Button
                  variant="link"
                  className="text-red-400 hover:text-red-300 mt-2"
                  onClick={() => setProfileImage(null)}
                >
                  Remove Image
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Profile Form Section */}
        <div className="col-span-1 md:col-span-2">
          <form 
            onSubmit={handleSubmit}
            className="bg-gradient-to-br from-[#121212] to-[#1E1E1E] p-6 rounded-lg border border-[#8A2BE2] hover:shadow-[0_0_15px_rgba(138,43,226,0.3)] transition-all h-full"
          >
            <h3 className="font-['Orbitron'] text-xl mb-6">Account Information</h3>
            
            <div className="mb-6">
              <label htmlFor="walletAddress" className="block text-gray-300 mb-2">
                Wallet Address
              </label>
              <Input
                id="walletAddress"
                value={walletInfo?.address || ""}
                readOnly
                className="bg-[#121212] border-[#8A2BE2] text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">
                This is your unique identifier on the blockchain.
              </p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="displayName" className="block text-gray-300 mb-2">
                Display Name
              </label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                className="bg-[#1E1E1E] border-[#8A2BE2] focus:border-[#00FFFF] text-white"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be displayed instead of your wallet address.
              </p>
            </div>
            
            <div className="flex justify-end mt-8">
              <Button
                type="submit"
                className="bg-gradient-to-r from-[#8A2BE2] to-[#FF00FF] text-white hover:opacity-90 transition-opacity"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ProfileSettings;