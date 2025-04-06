// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title OnyxChainStorage
 * @dev A decentralized file storage system built on Ethereum.
 * The contract stores file metadata on the blockchain with file content stored on IPFS.
 */
contract OnyxChainStorage is Ownable, ReentrancyGuard {
    // Storage cost in wei per byte
    uint256 public storageFeePerByte = 1000; // Initial fee: 1000 wei per byte

    // File counter
    uint256 private fileIdCounter = 0;

    // Struct to store file metadata
    struct File {
        uint256 id;
        string fileName;
        string fileType;
        uint256 fileSize;
        string ipfsHash;
        string description;
        address owner;
        uint256 uploadTimestamp;
        bool isPublic;
        bool isDeleted;
        mapping(address => bool) sharedWith;
    }

    // Mapping of fileId to File
    mapping(uint256 => File) private files;
    
    // Mapping of user addresses to their file IDs
    mapping(address => uint256[]) private userFiles;
    
    // Array of public file IDs
    uint256[] private publicFiles;

    // Events
    event FileUploaded(uint256 indexed fileId, string fileName, address indexed owner, string ipfsHash);
    event FileDeleted(uint256 indexed fileId, address indexed owner);
    event FileShared(uint256 indexed fileId, address indexed owner, address indexed sharedWith);
    event AccessRevoked(uint256 indexed fileId, address indexed owner, address indexed revokedFrom);
    event StorageFeeUpdated(uint256 oldFee, uint256 newFee);
    event EtherWithdrawn(address indexed owner, uint256 amount);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Uploads a new file metadata to the blockchain
     * @param fileName Name of the file
     * @param fileType MIME type of the file
     * @param fileSize Size of the file in bytes
     * @param ipfsHash IPFS hash pointing to the file content
     * @param description Optional description of the file
     * @param isPublic Whether the file is publicly accessible
     * @return The ID of the newly created file
     */
    function uploadFile(
        string memory fileName,
        string memory fileType,
        uint256 fileSize,
        string memory ipfsHash,
        string memory description,
        bool isPublic
    ) public payable nonReentrant returns (uint256) {
        // Calculate storage fee
        uint256 storageFee = calculateStorageFee(fileSize);
        
        // Ensure enough Ether was sent
        require(msg.value >= storageFee, "Insufficient Ether sent to cover storage fees");
        
        // Create new file ID
        uint256 fileId = fileIdCounter;
        fileIdCounter++;
        
        // Create file entry
        File storage newFile = files[fileId];
        newFile.id = fileId;
        newFile.fileName = fileName;
        newFile.fileType = fileType;
        newFile.fileSize = fileSize;
        newFile.ipfsHash = ipfsHash;
        newFile.description = description;
        newFile.owner = msg.sender;
        newFile.uploadTimestamp = block.timestamp;
        newFile.isPublic = isPublic;
        newFile.isDeleted = false;
        
        // Add file to user's files
        userFiles[msg.sender].push(fileId);
        
        // Add to public files if applicable
        if (isPublic) {
            publicFiles.push(fileId);
        }
        
        // Emit event
        emit FileUploaded(fileId, fileName, msg.sender, ipfsHash);
        
        // Return excess payment if any
        if (msg.value > storageFee) {
            payable(msg.sender).transfer(msg.value - storageFee);
        }
        
        return fileId;
    }

    /**
     * @dev Deletes a file (marks as deleted)
     * @param fileId The ID of the file to delete
     */
    function deleteFile(uint256 fileId) public {
        // Ensure file exists and user is the owner
        require(fileId < fileIdCounter, "File does not exist");
        require(files[fileId].owner == msg.sender, "Only the owner can delete this file");
        require(!files[fileId].isDeleted, "File already deleted");
        
        // Mark file as deleted
        files[fileId].isDeleted = true;
        
        // Remove from public files if applicable
        if (files[fileId].isPublic) {
            for (uint i = 0; i < publicFiles.length; i++) {
                if (publicFiles[i] == fileId) {
                    // Replace with the last element and reduce array length
                    publicFiles[i] = publicFiles[publicFiles.length - 1];
                    publicFiles.pop();
                    break;
                }
            }
        }
        
        // Emit event
        emit FileDeleted(fileId, msg.sender);
    }

    /**
     * @dev Shares a file with another user
     * @param fileId The ID of the file to share
     * @param recipient The address to share the file with
     */
    function shareFile(uint256 fileId, address recipient) public {
        // Ensure file exists and user is the owner
        require(fileId < fileIdCounter, "File does not exist");
        require(files[fileId].owner == msg.sender, "Only the owner can share this file");
        require(!files[fileId].isDeleted, "Cannot share a deleted file");
        require(recipient != address(0), "Invalid recipient address");
        require(recipient != msg.sender, "Cannot share with yourself");
        
        // Share the file
        files[fileId].sharedWith[recipient] = true;
        
        // Emit event
        emit FileShared(fileId, msg.sender, recipient);
    }

    /**
     * @dev Revokes access to a shared file
     * @param fileId The ID of the file
     * @param recipient The address to revoke access from
     */
    function revokeAccess(uint256 fileId, address recipient) public {
        // Ensure file exists and user is the owner
        require(fileId < fileIdCounter, "File does not exist");
        require(files[fileId].owner == msg.sender, "Only the owner can revoke access");
        require(!files[fileId].isDeleted, "Cannot modify a deleted file");
        
        // Revoke access
        files[fileId].sharedWith[recipient] = false;
        
        // Emit event
        emit AccessRevoked(fileId, msg.sender, recipient);
    }

    /**
     * @dev Gets all files owned by the caller
     * @return Array of file IDs
     */
    function getMyFiles() public view returns (uint256[] memory) {
        uint256[] memory myFiles = userFiles[msg.sender];
        uint256 activeCount = 0;
        
        // Count active (non-deleted) files
        for (uint i = 0; i < myFiles.length; i++) {
            if (!files[myFiles[i]].isDeleted) {
                activeCount++;
            }
        }
        
        // Create array of active files
        uint256[] memory activeFiles = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint i = 0; i < myFiles.length; i++) {
            if (!files[myFiles[i]].isDeleted) {
                activeFiles[index] = myFiles[i];
                index++;
            }
        }
        
        return activeFiles;
    }

    /**
     * @dev Gets metadata for a specific file
     * @param fileId The ID of the file
     * @return File metadata (id, fileName, fileType, fileSize, ipfsHash, description, owner, uploadTimestamp, isPublic)
     */
    function getFile(uint256 fileId) public view returns (
        uint256 id,
        string memory fileName,
        string memory fileType,
        uint256 fileSize,
        string memory ipfsHash,
        string memory description,
        address owner,
        uint256 uploadTimestamp,
        bool isPublic
    ) {
        // Ensure file exists
        require(fileId < fileIdCounter, "File does not exist");
        
        File storage file = files[fileId];
        
        // Ensure file is not deleted
        require(!file.isDeleted, "File has been deleted");
        
        // Check access permissions
        require(
            file.owner == msg.sender || 
            file.isPublic || 
            file.sharedWith[msg.sender],
            "You do not have permission to access this file"
        );
        
        return (
            file.id,
            file.fileName,
            file.fileType,
            file.fileSize,
            file.ipfsHash,
            file.description,
            file.owner,
            file.uploadTimestamp,
            file.isPublic
        );
    }

    /**
     * @dev Gets all public files
     * @return Array of public file IDs
     */
    function getPublicFiles() public view returns (uint256[] memory) {
        return publicFiles;
    }

    /**
     * @dev Checks if a user has access to a file
     * @param fileId The ID of the file
     * @param user The address to check
     * @return True if the user has access
     */
    function hasFileAccess(uint256 fileId, address user) public view returns (bool) {
        // Ensure file exists and is not deleted
        require(fileId < fileIdCounter, "File does not exist");
        require(!files[fileId].isDeleted, "File has been deleted");
        
        File storage file = files[fileId];
        
        return (file.owner == user || file.isPublic || file.sharedWith[user]);
    }

    /**
     * @dev Calculates storage fee for a given file size
     * @param fileSize Size of the file in bytes
     * @return Storage fee in wei
     */
    function calculateStorageFee(uint256 fileSize) public view returns (uint256) {
        return fileSize * storageFeePerByte;
    }

    /**
     * @dev Updates the storage fee
     * @param newFeePerByte New fee per byte in wei
     */
    function updateStorageFee(uint256 newFeePerByte) public onlyOwner {
        uint256 oldFee = storageFeePerByte;
        storageFeePerByte = newFeePerByte;
        emit StorageFeeUpdated(oldFee, newFeePerByte);
    }

    /**
     * @dev Withdraws Ether from the contract to the owner
     */
    function withdrawFunds() public onlyOwner nonReentrant {
        uint256 amount = address(this).balance;
        require(amount > 0, "No funds available to withdraw");
        
        payable(owner()).transfer(amount);
        emit EtherWithdrawn(owner(), amount);
    }

    /**
     * @dev Gets the current contract balance
     * @return Contract balance in wei
     */
    function getContractBalance() public view onlyOwner returns (uint256) {
        return address(this).balance;
    }
}