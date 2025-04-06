import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';

// Configure IPFS client to use Infura's dedicated gateway
// In production, you should use your own IPFS node or a service like Infura or Pinata
const projectId = import.meta.env.VITE_INFURA_IPFS_PROJECT_ID;
const projectSecret = import.meta.env.VITE_INFURA_IPFS_PROJECT_SECRET;

if (!projectId || !projectSecret) {
  console.error('IPFS credentials not found. Please set VITE_INFURA_IPFS_PROJECT_ID and VITE_INFURA_IPFS_PROJECT_SECRET in your environment variables.');
}

const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const ipfsClient = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

/**
 * Upload a file to IPFS
 * @param file File to upload
 * @returns IPFS content identifier (CID)
 */
export async function uploadToIPFS(file: File): Promise<string> {
  try {
    // Convert file to buffer
    const buffer = await file.arrayBuffer();

    // Upload to IPFS
    const result = await ipfsClient.add(Buffer.from(buffer));

    // Return the content identifier (CID)
    return result.path;
  } catch (error: any) {
    console.error('Error uploading to IPFS:', error);

    // If there are authentication errors, it's likely missing credentials
    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      throw new Error('IPFS authentication failed. Please check your Infura IPFS credentials.');
    }

    throw new Error('Failed to upload to IPFS: ' + error.message);
  }
}

/**
 * Get IPFS gateway URL for a content identifier
 * @param cid IPFS content identifier
 * @returns Full URL to access the content
 */
export function getIPFSGatewayUrl(cid: string): string {
  // You can use different IPFS gateways
  return `https://ipfs.io/ipfs/${cid}`;

  // Alternative gateways:
  // return `https://gateway.ipfs.io/ipfs/${cid}`;
  // return `https://cloudflare-ipfs.com/ipfs/${cid}`;
  // return `https://${projectId}.infura-ipfs.io/ipfs/${cid}`;
}

export default {
  uploadToIPFS,
  getIPFSGatewayUrl
};