import { getDefaultConfig } from 'connectkit';
import { createConfig } from 'wagmi';
import { mainnet, sepolia, goerli } from 'wagmi/chains';

// Define project information
const projectInfo = {
  name: 'OnyxChain',
  description: 'Decentralized storage for the digital frontier',
  // Use current URL dynamically to avoid mismatch warnings
  url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// Define the chains we want to support
const supportedChains = [mainnet, sepolia, goerli] as const;

// Create configuration using ConnectKit's helper
export const wagmiConfig = createConfig(
  getDefaultConfig({
    // Required for WalletConnect even if it's not the primary method
    // Note: ConnectKit can work with MetaMask and other injected wallets
    // even without WalletConnect - focusing on injected wallets like MetaMask
    walletConnectProjectId: 'placeholder', 
    
    // Set metadata for app
    appName: projectInfo.name,
    appDescription: projectInfo.description,
    appUrl: projectInfo.url,
    appIcon: projectInfo.icons[0],
    
    // Configure chains
    chains: supportedChains
  })
);