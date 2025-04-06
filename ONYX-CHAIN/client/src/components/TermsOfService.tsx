import React from "react";
import { LegalDocument } from "@/components/ui/legal-document";

export default function TermsOfService() {
  return (
    <LegalDocument title="Terms of Service">
      <h2 className="text-xl text-[#00FFFF] mt-6 mb-3">1. Introduction</h2>
      <p>
        Welcome to OnyxChain ("we," "our," or "us"), a decentralized Web3 storage platform. By accessing 
        or using our services, you agree to be bound by these Terms of Service ("Terms"). Please read 
        these Terms carefully before using OnyxChain.
      </p>

      <h2 className="text-xl text-[#00FFFF] mt-6 mb-3">2. Blockchain Technology & Decentralized Storage</h2>
      <p>
        OnyxChain operates on blockchain technology and decentralized storage protocols including 
        Ethereum and IPFS. By using our services, you acknowledge:
      </p>
      <ul className="list-disc pl-6 my-3 space-y-2">
        <li>Transactions on the blockchain are immutable and cannot be reversed</li>
        <li>Files stored on IPFS are distributed across a decentralized network</li>
        <li>We have limited control over content once it is stored on the decentralized networks</li>
        <li>Your access to content requires your Ethereum wallet credentials</li>
      </ul>

      <h2 className="text-xl text-[#00FFFF] mt-6 mb-3">3. Wallet Connection and Authentication</h2>
      <p>
        OnyxChain uses Web3 wallet connections (such as MetaMask, WalletConnect, etc.) as the primary 
        authentication method. You are responsible for:
      </p>
      <ul className="list-disc pl-6 my-3 space-y-2">
        <li>Maintaining the security of your wallet and private keys</li>
        <li>All activities that occur under your wallet address</li>
        <li>Ensuring you have sufficient gas fees for blockchain transactions</li>
        <li>Understanding the risks associated with connecting your wallet to web applications</li>
      </ul>

      <h2 className="text-xl text-[#00FFFF] mt-6 mb-3">4. File Storage and Content Guidelines</h2>
      <p>
        You agree not to use OnyxChain to store or share:
      </p>
      <ul className="list-disc pl-6 my-3 space-y-2">
        <li>Illegal content or materials that violate any applicable laws</li>
        <li>Content that infringes on intellectual property rights</li>
        <li>Malware, viruses, or harmful code</li>
        <li>Personal data of others without proper consent</li>
        <li>Content that promotes hate speech or discrimination</li>
      </ul>

      <h2 className="text-xl text-[#00FFFF] mt-6 mb-3">5. Smart Contract Interactions</h2>
      <p>
        OnyxChain utilizes smart contracts for metadata storage and access control. You acknowledge:
      </p>
      <ul className="list-disc pl-6 my-3 space-y-2">
        <li>Smart contracts are autonomous and execute exactly as programmed</li>
        <li>We cannot modify or reverse smart contract operations once executed</li>
        <li>Gas fees for smart contract interactions are your responsibility</li>
        <li>Smart contracts may have unintended vulnerabilities despite our security efforts</li>
      </ul>

      <h2 className="text-xl text-[#00FFFF] mt-6 mb-3">6. Service Availability</h2>
      <p>
        Due to the decentralized nature of our platform:
      </p>
      <ul className="list-disc pl-6 my-3 space-y-2">
        <li>Service availability depends on multiple decentralized networks</li>
        <li>We cannot guarantee continuous, uninterrupted access to your files</li>
        <li>Network congestion may affect transaction speed and file retrieval</li>
        <li>We are not responsible for delays caused by blockchain network conditions</li>
      </ul>

      <h2 className="text-xl text-[#00FFFF] mt-6 mb-3">7. Fees and Payments</h2>
      <p>
        Using OnyxChain involves various fees:
      </p>
      <ul className="list-disc pl-6 my-3 space-y-2">
        <li>Blockchain gas fees for transactions and smart contract interactions</li>
        <li>Storage fees for maintaining files on the platform</li>
        <li>Premium service fees for advanced features (if applicable)</li>
        <li>All fees are non-refundable unless required by law</li>
      </ul>

      <h2 className="text-xl text-[#00FFFF] mt-6 mb-3">8. Termination</h2>
      <p>
        We reserve the right to terminate or suspend your access to OnyxChain:
      </p>
      <ul className="list-disc pl-6 my-3 space-y-2">
        <li>If you violate these Terms</li>
        <li>If we suspect fraudulent or abusive activity</li>
        <li>If required by law or regulatory requirements</li>
        <li>For platform maintenance or upgrades that require service interruption</li>
      </ul>

      <h2 className="text-xl text-[#00FFFF] mt-6 mb-3">9. Changes to Terms</h2>
      <p>
        We may update these Terms at any time. Continued use of OnyxChain after changes constitutes 
        acceptance of the modified Terms. We will notify users of significant changes through the platform.
      </p>

      <h2 className="text-xl text-[#00FFFF] mt-6 mb-3">10. Contact Information</h2>
      <p>
        For questions about these Terms, please contact us at support@onyxchain.io or through our 
        community channels.
      </p>
    </LegalDocument>
  );
}