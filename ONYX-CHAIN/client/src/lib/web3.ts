import { ethers } from "ethers";
import { apiRequest } from "./queryClient";

// Types
export interface EthereumWindow extends Window {
  ethereum?: any;
}

export interface WalletInfo {
  address: string;
  network: string;
  balance: string;
  chainId: number;
  walletType: string;
}

declare const window: EthereumWindow;

// Check if any Web3 provider is available
export const isWeb3Available = (): boolean => {
  return !!window.ethereum;
};

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return window.ethereum && window.ethereum.isMetaMask ? true : false;
};

// Get wallet provider type
export const getWalletType = (): string => {
  if (!window.ethereum) return "none";
  if (window.ethereum.isMetaMask) return "metamask";
  if (window.ethereum.isCoinbaseWallet) return "coinbase";
  if (window.ethereum.isWalletConnect) return "walletconnect";
  return "unknown";
};

// Get friendly wallet name
export const getWalletName = (type: string): string => {
  switch (type) {
    case "metamask": return "MetaMask";
    case "coinbase": return "Coinbase Wallet";
    case "walletconnect": return "WalletConnect";
    default: return "Unknown Wallet";
  }
};

// Debug wallet info - useful for development
export const debugWalletInfo = (): void => {
  console.log("Ethereum object:", window.ethereum);
  console.log("Web3 available:", isWeb3Available());
  console.log("Wallet type:", getWalletType());
  
  if (window.ethereum) {
    console.log("Provider properties:", Object.keys(window.ethereum));
    if (window.ethereum._state) {
      console.log("Provider state:", window.ethereum._state);
    }
  }
};

// Request account access
export const connectWallet = async (): Promise<WalletInfo | null> => {
  try {
    // Debug wallet information
    debugWalletInfo();
    
    if (!isWeb3Available()) {
      throw new Error("No Web3 provider detected. Please install MetaMask or another wallet extension.");
    }
    
    // Request account access
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    // Get network information
    const network = await provider.getNetwork();
    const networkName = network.name || `Chain ${Number(network.chainId)}`;
    const chainId = Number(network.chainId);
    
    // Get balance
    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);
    
    // Get wallet type
    const walletType = getWalletType();
    
    // Register user with the backend
    try {
      await apiRequest("POST", "/api/users", {
        username: address,
        password: "",
        walletAddress: address,
      });
    } catch (error) {
      console.error("Failed to register user:", error);
      // Continue even if registration fails - user might already exist
    }
    
    return {
      address,
      network: networkName,
      balance: balanceInEth,
      chainId,
      walletType,
    };
  } catch (error) {
    console.error("Error connecting wallet:", error);
    if (error instanceof Error) {
      throw error; // Re-throw to let UI handle specific error message
    }
    throw new Error("Failed to connect wallet");
  }
};

// Get current connected accounts
export const getConnectedAccounts = async (): Promise<string[]> => {
  try {
    if (!isWeb3Available()) {
      return [];
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_accounts", []);
    return accounts;
  } catch (error) {
    console.error("Error getting connected accounts:", error);
    return [];
  }
};

// Sign a message to verify wallet ownership
export const signMessage = async (message: string): Promise<string | null> => {
  try {
    if (!isWeb3Available()) {
      throw new Error("No Web3 provider detected");
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signature = await signer.signMessage(message);
    
    return signature;
  } catch (error) {
    console.error("Error signing message:", error);
    return null;
  }
};

// Listen for account changes
export const setupAccountsChangedListener = (callback: (accounts: string[]) => void): void => {
  if (!isWeb3Available()) {
    return;
  }
  
  window.ethereum.on("accountsChanged", callback);
};

// Listen for chain changes
export const setupChainChangedListener = (callback: (chainId: string) => void): void => {
  if (!isWeb3Available()) {
    return;
  }
  
  window.ethereum.on("chainChanged", callback);
};

// Clean up listeners
export const removeAllListeners = (): void => {
  if (!isWeb3Available()) {
    return;
  }
  
  window.ethereum.removeAllListeners("accountsChanged");
  window.ethereum.removeAllListeners("chainChanged");
};
