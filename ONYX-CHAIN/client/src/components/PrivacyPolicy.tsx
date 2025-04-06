import React from "react";
import { LegalDocument } from "@/components/ui/legal-document";

export default function PrivacyPolicy() {
  return (
    <LegalDocument title="Privacy Policy">
      <h2 className="text-xl text-[#00FFFF] mt-6 mb-3">1. Introduction</h2>
      <p>
        At OnyxChain, we're committed to protecting your privacy while providing a decentralized storage 
        solution. This Privacy Policy explains how we collect, use, and protect your information when 
        you use our Web3 platform.
      </p>

      <h2 className="text-xl text-[#00FFFF] mt-6 mb-3">2. Information We Collect</h2>
      <h3 className="text-lg text-[#00FFFF] mt-4 mb-2">2.1 Blockchain Information</h3>
      <p>
        Due to the nature of blockchain technology, certain information is publicly visible, including:
      </p>
      <ul className="list-disc pl-6 my-3 space-y-2">
        <li>Wallet addresses connected to our platform</li>
        <li>Transaction hashes and metadata stored on the blockchain</li>
        <li>Smart contract interactions</li>
        <li>File metadata (names, sizes, timestamps, etc.) stored on the blockchain</li>
      </ul>

      <h3 className="text-lg text-[#00FFFF] mt-4 mb-2">2.2 User Profile Information</h3>
      <p>
        When you create or update your profile, we may collect:
      </p>
      <ul className="list-disc pl-6 my-3 space-y-2">
        <li>Display name</li>
        <li>Profile picture</li>
        <li>User preferences</li>
      </ul>

      <h3 className="text-lg text-[#00FFFF] mt-4 mb-2">2.3 Technical Information</h3>
      <p>
        To improve our services, we collect:
      </p>
      <ul className="list-disc pl-6 my-3 space-y-2">
        <li>Device information (type, operating system, etc.)</li>
        <li>Browser type and version</li>
        <li>IP address</li>
        <li>Usage patterns and analytics</li>
      </ul>

      <h2 className="text-xl text-[#00FFFF] mt-6 mb-3">3. How We Use Your Information</h2>
      <p>
        We use your information to:
      </p>
      <ul className="list-disc pl-6 my-3 space-y-2">
        <li>Provide, maintain, and improve our decentralized storage services</li>
        <li>Process transactions and manage your account</li>
        <li>Verify your identity through your connected wallet</li>
        <li>Monitor and analyze usage patterns</li>
        <li>Communicate with you about service updates or important notifications</li>
        <li>Detect and prevent fraud or abuse</li>
      </ul>

      <h2 className="text-xl text-[#00FFFF] mt-6 mb-3">4. Decentralized Storage and IPFS</h2>
      <p>
        When you upload files to OnyxChain:
      </p>
      <ul className="list-disc pl-6 my-3 space-y-2">
        <li>File content is stored on IPFS, a distributed file system</li>
        <li>Files on IPFS are content-addressed and distributed across the network</li>
        <li>Although access is controlled through our smart contracts, the underlying data exists on a decentralized network</li>
        <li>We cannot fully delete files from IPFS once uploaded, but we can revoke access permissions</li>
      </ul>

      <h2 className="text-xl text-[#00FFFF] mt-6 mb-3">5. Wallet Connection Privacy</h2>
      <p>
        Regarding wallet connections:
      </p>
      <ul className="list-disc pl-6 my-3 space-y-2">
        <li>We do not have access to your private keys or recovery phrases</li>
        <li>We only receive the public information your wallet provider shares</li>
        <li>Your wallet address serves as your identity on the platform</li>
        <li>We recommend using privacy-enhancing tools if you wish to maintain separation between your identity and blockchain activities</li>
      </ul>

      <h2 className="text-xl text-[#00FFFF] mt-6 mb-3">6. Information Sharing</h2>
      <p>
        We may share information:
      </p>
      <ul className="list-disc pl-6 my-3 space-y-2">
        <li>With service providers that help us operate our platform</li>
        <li>To comply with legal obligations or valid legal process</li>
        <li>To protect our rights, privacy, safety, or property</li>
        <li>In connection with a merger, acquisition, or sale of assets</li>
      </ul>
      <p>
        We will never sell your personal information to third parties for marketing purposes.
      </p>

      <h2 className="text-xl text-[#00FFFF] mt-6 mb-3">7. Security Measures</h2>
      <p>
        We implement appropriate technical and organizational measures to protect your information, including:
      </p>
      <ul className="list-disc pl-6 my-3 space-y-2">
        <li>Secure, encrypted connections</li>
        <li>Regular security audits of our smart contracts</li>
        <li>Access controls for our systems and databases</li>
        <li>Employee training on security and privacy practices</li>
      </ul>
      <p>
        However, no method of transmission or storage is 100% secure. We cannot guarantee absolute security.
      </p>

      <h2 className="text-xl text-[#00FFFF] mt-6 mb-3">8. Your Rights and Choices</h2>
      <p>
        Depending on your location, you may have rights regarding your personal information, including:
      </p>
      <ul className="list-disc pl-6 my-3 space-y-2">
        <li>Accessing, correcting, or deleting your profile information</li>
        <li>Objecting to or restricting certain processing activities</li>
        <li>Data portability</li>
        <li>Withdrawing consent</li>
      </ul>
      <p>
        Note that blockchain data is immutable, and we cannot remove information that is recorded on-chain.
      </p>

      <h2 className="text-xl text-[#00FFFF] mt-6 mb-3">9. Children's Privacy</h2>
      <p>
        OnyxChain is not intended for children under 18. We do not knowingly collect information from 
        children under 18. If you believe we have collected information from a child under 18, please 
        contact us immediately.
      </p>

      <h2 className="text-xl text-[#00FFFF] mt-6 mb-3">10. Changes to This Privacy Policy</h2>
      <p>
        We may update this Privacy Policy periodically. We will notify users of significant changes 
        through the platform or via the contact information you provide. Your continued use of OnyxChain 
        after such modifications constitutes your acknowledgment of the modified Privacy Policy.
      </p>

      <h2 className="text-xl text-[#00FFFF] mt-6 mb-3">11. Contact Us</h2>
      <p>
        If you have questions about this Privacy Policy or our privacy practices, please contact us at 
        privacy@onyxchain.io or through our community channels.
      </p>
    </LegalDocument>
  );
}