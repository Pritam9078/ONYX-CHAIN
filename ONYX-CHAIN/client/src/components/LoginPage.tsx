import React from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { useWallet } from "../contexts/WalletContext";
import AnimatedBackground from "./ui/animated-background";
import CyberpunkCard from "./ui/cyberpunk-card";
import CyberpunkButton from "./ui/cyberpunk-button";

const LoginPage: React.FC = () => {
  const wallet = useWallet();
  const connectionError = wallet?.connectionError;
  const connecting = wallet?.connecting || false;
  const connectToWallet = wallet?.connectToWallet;
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-[#121212] overflow-hidden">
      <AnimatedBackground />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-10 z-10"
      >
        <h1 className="font-['Orbitron'] text-4xl md:text-6xl font-bold mb-4 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00FFFF] to-[#FF00FF]">
          ONYX<span className="text-white">CHAIN</span>
        </h1>
        <p className="font-['Inter'] text-lg md:text-xl text-gray-300 max-w-md mx-auto">
          Decentralized storage for the digital frontier
        </p>
        <div className="h-[1px] w-64 md:w-96 mx-auto my-6 bg-gradient-to-r from-transparent via-[#00FFFF] to-transparent"></div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-md z-10"
      >
        <CyberpunkCard 
          variant="accent" 
          className="p-6"
          hoverEffect={false}
        >
          <h2 className="font-['Orbitron'] text-2xl font-semibold mb-6 text-center text-white neon-text-blue">
            Connect Your Wallet
          </h2>
          
          {connectionError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded bg-red-900/30 border border-red-600 text-sm text-red-200"
            >
              {connectionError}
            </motion.div>
          )}
          
          <div className="mb-6">
            <p className="text-gray-300 text-center mb-4">
              Connect securely with your preferred web3 wallet
            </p>
            
            <div className="flex justify-center">
              <CyberpunkButton
                onClick={connectToWallet}
                className="w-full py-3 font-['Orbitron']"
                variant="primary"
                disabled={connecting}
              >
                {connecting ? "Connecting..." : "Connect Wallet"}
              </CyberpunkButton>
            </div>
            
            <div className="mt-4 text-center text-sm text-gray-400">
              <p>Supports multiple wallet types including MetaMask, Coinbase Wallet, and other browser wallets!</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
              <span className="px-3 text-xs text-gray-400">FEATURES</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
            </div>
            
            <ul className="text-sm text-gray-300 space-y-2">
              <li className="flex items-center">
                <span className="text-[#00FFFF] mr-2">✓</span> Connect with any Web3 wallet
              </li>
              <li className="flex items-center">
                <span className="text-[#00FFFF] mr-2">✓</span> Secure, decentralized authentication
              </li>
              <li className="flex items-center">
                <span className="text-[#00FFFF] mr-2">✓</span> Upload and manage files in the cloud
              </li>
              <li className="flex items-center">
                <span className="text-[#00FFFF] mr-2">✓</span> Cryptographically secure storage
              </li>
            </ul>
          </div>
        </CyberpunkCard>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}  
        className="mt-8 text-sm text-gray-500 max-w-md text-center z-10"
      >
        <p>By connecting your wallet, you agree to our <Link href="/terms" className="text-[#00FFFF] hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-[#00FFFF] hover:underline">Privacy Policy</Link></p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
