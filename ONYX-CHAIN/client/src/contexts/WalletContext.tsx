import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export interface WalletInfo {
  address: string;
  chainId: number;
  network: string;
  balance: string;
  walletType: string;
}

interface WalletContextType {
  connected: boolean;
  connecting: boolean;
  walletInfo: WalletInfo | null;
  connectToWallet: () => Promise<void>;
  connectToSpecificWallet: (walletType: string) => Promise<void>;
  disconnectWallet: () => void;
  connectionError: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

// Check if Ethereum is available in the window object
const isEthereumAvailable = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [connected, setConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Check connection status on load
  useEffect(() => {
    const checkConnection = async () => {
      if (!isEthereumAvailable()) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          await updateWalletInfo(provider, accounts[0].address);
          setConnected(true);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    };

    checkConnection();
  }, []);

  // Set up listeners for account and chain changes
  useEffect(() => {
    if (!isEthereumAvailable() || !connected) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected their wallet
        disconnectWallet();
      } else if (connected) {
        // User switched accounts
        const provider = new ethers.BrowserProvider(window.ethereum);
        await updateWalletInfo(provider, accounts[0]);
        toast({
          title: "Account Changed",
          description: `Connected to: ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
        });
      }
    };

    const handleChainChanged = async (chainIdHex: string) => {
      // Chain changed, reload the page to ensure all data is fresh
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      // Clean up listeners
      if (isEthereumAvailable()) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [connected]);

  // Try to create a user if they don't exist yet
  const tryCreateUser = async (address: string) => {
    try {
      // First check if the user already exists
      const checkResponse = await fetch(`/api/users/wallet/${address}`);
      
      // Only create a new user if they don't exist (404 status)
      if (checkResponse.status === 404) {
        // Create a new user with the wallet address
        const newUser = {
          username: `user_${Date.now()}`, // Generate a random username
          password: Math.random().toString(36).slice(-8), // Generate a random password
          walletAddress: address,
          displayName: "",
          profileImage: null,
          preferences: JSON.stringify({
            darkMode: true,
            animations: true,
            notifications: true
          })
        };
        
        await apiRequest("POST", "/api/users", newUser);
        console.log("Created new user for wallet:", address);
      }
    } catch (error) {
      console.error("Error checking/creating user:", error);
      // Don't throw - we want wallet connection to work even if user creation fails
    }
  };

  // Helper to update wallet info
  const updateWalletInfo = async (provider: ethers.BrowserProvider, address: string) => {
    try {
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(address);
      const formattedBalance = ethers.formatEther(balance);
      
      // Determine wallet type
      let walletType = "Unknown";
      if (isEthereumAvailable()) {
        if (window.ethereum.isMetaMask) walletType = "MetaMask";
        else if (window.ethereum.isCoinbaseWallet) walletType = "Coinbase Wallet";
        else if (window.ethereum.isWalletConnect) walletType = "WalletConnect";
        else if (window.ethereum.isTrust) walletType = "Trust Wallet";
        // Add more wallet detections as needed
      }
      
      const newWalletInfo: WalletInfo = {
        address,
        chainId: Number(network.chainId),
        network: network.name,
        balance: formattedBalance,
        walletType
      };
      
      setWalletInfo(newWalletInfo);
      
      // Try to create a user profile for this wallet if it doesn't exist
      await tryCreateUser(address);
    } catch (error) {
      console.error("Error updating wallet info:", error);
      throw error;
    }
  };

  // Connect to any available wallet
  const connectToWallet = async () => {
    if (!isEthereumAvailable()) {
      setConnectionError("No Ethereum wallet detected. Please install MetaMask or another Web3 wallet.");
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "No Ethereum wallet detected. Please install MetaMask or another Web3 wallet.",
      });
      return;
    }

    try {
      setConnecting(true);
      setConnectionError(null);
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        throw new Error("No accounts authorized");
      }
      
      await updateWalletInfo(provider, accounts[0]);
      setConnected(true);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to: ${accounts[0].substring(0, 6)}...${accounts[0].substring(38)}`,
      });
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      
      let errorMessage = "Failed to connect wallet";
      
      // Handle user denied message more gracefully
      if (error.code === 4001 || error.message.includes('denied')) {
        errorMessage = "Connection rejected. Please approve the connection request.";
      }
      
      setConnectionError(errorMessage);
      
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: errorMessage,
      });
    } finally {
      setConnecting(false);
    }
  };

  // Connect to a specific wallet type
  const connectToSpecificWallet = async (walletType: string) => {
    // This is a placeholder for future implementations
    // Different wallet types might require specific connection methods
    return connectToWallet();
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setConnected(false);
    setWalletInfo(null);
    
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  return (
    <WalletContext.Provider
      value={{
        connected,
        connecting,
        walletInfo,
        connectToWallet,
        connectToSpecificWallet,
        disconnectWallet,
        connectionError
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};