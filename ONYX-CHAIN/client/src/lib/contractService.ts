import { ethers } from 'ethers';
import { useWallet } from '@/contexts/WalletContext';

// Import the contract ABI
// Note: This will be generated when we compile the contract
const CONTRACT_ABI = [
  // This is a placeholder, we'll replace it with the actual ABI after compilation
  // Functions for file operations
  "function uploadFile(string memory fileName, string memory fileType, uint256 fileSize, string memory ipfsHash, string memory description, bool isPublic) public payable returns (uint256)",
  "function deleteFile(uint256 fileId) public",
  "function shareFile(uint256 fileId, address recipient) public",
  "function revokeAccess(uint256 fileId, address recipient) public",
  "function getFile(uint256 fileId) public view returns (uint256 id, string memory fileName, string memory fileType, uint256 fileSize, string memory ipfsHash, string memory description, address owner, uint256 uploadTimestamp, bool isPublic)",
  "function getMyFiles() public view returns (uint256[] memory)",
  "function getPublicFiles() public view returns (uint256[] memory)",
  "function calculateStorageFee(uint256 fileSize) public view returns (uint256)",
  // Events
  "event FileUploaded(uint256 fileId, string fileName, address owner, string ipfsHash)",
  "event FileDeleted(uint256 fileId, address owner)",
  "event FileShared(uint256 fileId, address owner, address sharedWith)"
];

// Contract address - this will be set after deployment
// For now, using a placeholder. You'll need to replace it with the actual deployed address
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '';

/**
 * Initialize contract with provider and signer
 */
function getContract() {
  // Get the Ethereum provider from the window object
  const provider = new ethers.BrowserProvider(window.ethereum);
  
  // Create a contract instance
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

/**
 * Get a contract instance with a signer (for transactions)
 */
async function getSignedContract() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

/**
 * Upload a file to the blockchain (metadata only, actual file is on IPFS)
 */
export async function uploadFileToBlockchain(
  fileName: string,
  fileType: string,
  fileSize: number,
  ipfsHash: string,
  description: string = "",
  isPublic: boolean = false
): Promise<number> {
  try {
    const contract = await getSignedContract();
    
    // Calculate storage fee
    const storageFee = await contract.calculateStorageFee(fileSize);
    
    // Upload file metadata to blockchain
    const tx = await contract.uploadFile(
      fileName,
      fileType,
      fileSize,
      ipfsHash,
      description,
      isPublic,
      { value: storageFee }
    );
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    // Parse logs for FileUploaded event to get fileId
    const event = receipt.logs
      .filter((log: any) => log.topics[0] === "FileUploaded")
      .map((log: any) => contract.interface.parseLog(log))
      .find(Boolean);
    
    if (!event) {
      throw new Error('File upload transaction succeeded but no FileUploaded event found');
    }
    
    return event.args.fileId;
  } catch (error: any) {
    console.error("Error uploading file to blockchain:", error);
    throw new Error(`Failed to upload file to blockchain: ${error.message}`);
  }
}

/**
 * Get a list of file IDs owned by the current user
 */
export async function getUserFiles(): Promise<number[]> {
  try {
    const contract = await getSignedContract();
    return await contract.getMyFiles();
  } catch (error: any) {
    console.error("Error getting user files:", error);
    throw new Error(`Failed to get user files: ${error.message}`);
  }
}

/**
 * Get metadata for a specific file
 */
export async function getFileDetails(fileId: number): Promise<any> {
  try {
    const contract = await getSignedContract();
    const file = await contract.getFile(fileId);
    
    // Convert from array to object
    return {
      id: file[0],
      fileName: file[1],
      fileType: file[2],
      fileSize: file[3],
      ipfsHash: file[4],
      description: file[5],
      owner: file[6],
      uploadTimestamp: new Date(file[7] * 1000), // Convert from seconds to milliseconds
      isPublic: file[8]
    };
  } catch (error: any) {
    console.error(`Error getting file details for ID ${fileId}:`, error);
    throw new Error(`Failed to get file details: ${error.message}`);
  }
}

/**
 * Delete a file (mark as deleted on the blockchain)
 */
export async function deleteFile(fileId: number): Promise<boolean> {
  try {
    const contract = await getSignedContract();
    const tx = await contract.deleteFile(fileId);
    await tx.wait();
    return true;
  } catch (error: any) {
    console.error(`Error deleting file ID ${fileId}:`, error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Share a file with another user
 */
export async function shareFile(fileId: number, recipientAddress: string): Promise<boolean> {
  try {
    const contract = await getSignedContract();
    const tx = await contract.shareFile(fileId, recipientAddress);
    await tx.wait();
    return true;
  } catch (error: any) {
    console.error(`Error sharing file ID ${fileId}:`, error);
    throw new Error(`Failed to share file: ${error.message}`);
  }
}

/**
 * Revoke access to a shared file
 */
export async function revokeAccess(fileId: number, recipientAddress: string): Promise<boolean> {
  try {
    const contract = await getSignedContract();
    const tx = await contract.revokeAccess(fileId, recipientAddress);
    await tx.wait();
    return true;
  } catch (error: any) {
    console.error(`Error revoking access to file ID ${fileId}:`, error);
    throw new Error(`Failed to revoke access: ${error.message}`);
  }
}

/**
 * Get all public files
 */
export async function getPublicFiles(): Promise<number[]> {
  try {
    const contract = await getContract();
    return await contract.getPublicFiles();
  } catch (error: any) {
    console.error("Error getting public files:", error);
    throw new Error(`Failed to get public files: ${error.message}`);
  }
}

/**
 * Calculate storage fee for a given file size
 */
export async function calculateStorageFee(fileSize: number): Promise<bigint> {
  try {
    const contract = await getContract();
    return await contract.calculateStorageFee(fileSize);
  } catch (error: any) {
    console.error("Error calculating storage fee:", error);
    throw new Error(`Failed to calculate storage fee: ${error.message}`);
  }
}

export default {
  uploadFileToBlockchain,
  getUserFiles,
  getFileDetails,
  deleteFile,
  shareFile,
  revokeAccess,
  getPublicFiles,
  calculateStorageFee
};