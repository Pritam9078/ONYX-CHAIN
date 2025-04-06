import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { File } from "@shared/schema";
import { useWallet } from "../contexts/WalletContext";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { shareFile } from "@/lib/contractService";

interface FileCardProps {
  file: File;
  variant: "compact" | "full";
}

const FileCard: React.FC<FileCardProps> = ({ file, variant }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { walletInfo } = useWallet();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  // Format the file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  };

  // Format the timestamp
  const formatTimestamp = (timestamp: Date): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;

    return format(date, "MMM d, yyyy");
  };

  // Delete file mutation
  const deleteMutation = useMutation({
    mutationFn: async (fileId: number) => {
      const response = await apiRequest("DELETE", `/api/files/${fileId}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "File Deleted",
        description: "The file has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/files/${walletInfo?.address}`] });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete file",
        variant: "destructive",
      });
    },
  });

  // Handle file download
  const handleDownload = () => {
    try {
      // For base64 data, create a download link
      const link = document.createElement("a");
      link.href = file.fileData;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download Started",
        description: "Your file is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the file.",
        variant: "destructive",
      });
    }
  };

  // Handle file delete
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this file?")) {
      deleteMutation.mutate(file.id);
    }
  };

  // Get file icon based on file type
  const getFileIcon = (): string => {
    if (file.fileType.startsWith("image/")) return "file-image";
    if (file.fileType.includes("pdf")) return "file-pdf";
    if (file.fileType.includes("doc")) return "file-text";
    if (file.fileType.includes("zip") || file.fileType.includes("rar")) return "file-archive";
    if (file.fileType.includes("code") || file.fileType.includes("json") || file.fileType.includes("html")) return "file-code";
    return "file";
  };

  // Toggle the menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu if clicked outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      setIsMenuOpen(false);
    };

    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Handle share dialog
  const openShareDialog = () => {
    setIsShareDialogOpen(true);
    setIsMenuOpen(false);
  };

  // Handle share file
  const handleShareFile = async () => {
    if (!recipientAddress || !recipientAddress.startsWith('0x') || recipientAddress.length !== 42) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Ethereum wallet address",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSharing(true);
      const success = await shareFile(file.id, recipientAddress);

      if (success) {
        toast({
          title: "File Shared",
          description: `Successfully shared "${file.fileName}" with ${recipientAddress.substring(0, 6)}...${recipientAddress.substring(38)}`,
        });

        setIsShareDialogOpen(false);
        setRecipientAddress("");
      } else {
        throw new Error("Failed to share file");
      }
    } catch (error) {
      toast({
        title: "Share Failed",
        description: error instanceof Error ? error.message : "Failed to share file",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  // Compact variant (for the upload page)
  if (variant === "compact") {
    return (
      <>
        <motion.div 
          className="rounded-lg p-4 flex items-center relative overflow-hidden transition-all duration-300 border border-[#8A2BE2] hover:border-[#00FFFF] hover:shadow-[0_0_15px_rgba(138,43,226,0.7)]"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex-shrink-0 w-10 h-10 bg-[#8A2BE2] bg-opacity-20 rounded-md flex items-center justify-center mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={file.fileType.startsWith("image/") ? "#00FFFF" : "#FF00FF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {getFileIcon() === "file-image" && (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </>
              )}
              {getFileIcon() === "file-pdf" && (
                <>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <path d="M9 15h6"></path>
                  <path d="M9 11h6"></path>
                </>
              )}
              {getFileIcon() === "file-text" && (
                <>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </>
              )}
              {getFileIcon() === "file-archive" && (
                <>
                  <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v2"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <path d="M10 12v4"></path>
                  <rect x="2" y="12" width="8" height="4" rx="1" ry="1"></rect>
                </>
              )}
              {getFileIcon() === "file-code" && (
                <>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <path d="M10 12l-2 2 2 2"></path>
                  <path d="M14 12l2 2-2 2"></path>
                </>
              )}
              {getFileIcon() === "file" && (
                <>
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </>
              )}
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white truncate">{file.fileName}</h4>
            <p className="text-xs text-gray-400">{formatFileSize(file.fileSize)} • {formatTimestamp(file.uploadTimestamp)}</p>
          </div>
          <div className="relative">
            <button 
              onClick={(e) => { e.stopPropagation(); toggleMenu(); }}
              className="ml-2 text-gray-400 hover:text-[#00FFFF] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-[#1E1E1E] border border-[#8A2BE2] rounded-md shadow-lg z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDownload(); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-[#8A2BE2] hover:bg-opacity-20 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); openShareDialog(); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-[#8A2BE2] hover:bg-opacity-20 transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                  Share
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-[#8A2BE2] hover:bg-opacity-20 transition-colors text-red-400 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Delete
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Share Dialog */}
        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent className="sm:max-w-md bg-[#121212] border border-[#8A2BE2]">
            <DialogHeader>
              <DialogTitle className="text-white font-['Orbitron']">Share File</DialogTitle>
              <DialogDescription>
                Enter the wallet address of the person you want to share this file with.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <div className="bg-[#8A2BE2] bg-opacity-20 p-2 rounded-md">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A2BE2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                </div>
                <div className="flex-1 truncate">
                  <h4 className="text-sm font-medium text-white truncate">{file.fileName}</h4>
                  <p className="text-xs text-gray-400">{formatFileSize(file.fileSize)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="recipient" className="text-sm font-medium text-gray-200">
                  Recipient Wallet Address
                </label>
                <div className="relative">
                  <Input
                    id="recipient"
                    placeholder="0x..."
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    className="pl-10 bg-[#1E1E1E] border-[#8A2BE2] text-white"
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                      <path d="M12 11h4"></path>
                      <path d="M12 16h4"></path>
                      <path d="M8 11h.01"></path>
                      <path d="M8 16h.01"></path>
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-400">
                  The person will need to be a registered user of OnyxChain to access this file.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsShareDialogOpen(false)}
                className="border-[#8A2BE2] hover:bg-[#8A2BE2] hover:bg-opacity-10 text-white"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleShareFile}
                disabled={isSharing || !recipientAddress}
                className="bg-gradient-to-r from-[#8A2BE2] to-[#FF00FF] text-white hover:opacity-90 transition-opacity"
              >
                {isSharing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sharing...
                  </>
                ) : "Share File"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Full variant (for the files page)
  return (
    <>
      <motion.div 
        className="rounded-lg overflow-hidden group border border-[#8A2BE2] hover:border-[#00FFFF] transition-all hover:shadow-[0_0_15px_rgba(138,43,226,0.7)]"
        whileHover={{ scale: 1.03 }}
      >
        <div className="h-32 bg-gradient-to-br from-[#8A2BE2] to-[#FF00FF] bg-opacity-20 flex items-center justify-center">
          {file.fileType.startsWith("image/") ? (
            <img 
              src={file.fileData} 
              alt={file.fileName} 
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%2300FFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                (e.target as HTMLImageElement).className = "h-16 w-16";
              }}
            />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={getFileIcon() === "file-image" ? "#00FFFF" : "#FF00FF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {getFileIcon() === "file-image" && (
                <>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </>
              )}
              {getFileIcon() === "file-pdf" && (
                <>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <path d="M9 15h6"></path>
                  <path d="M9 11h6"></path>
                </>
              )}
              {getFileIcon() === "file-text" && (
                <>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </>
              )}
              {getFileIcon() === "file-archive" && (
                <>
                  <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v2"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <path d="M10 12v4"></path>
                  <rect x="2" y="12" width="8" height="4" rx="1" ry="1"></rect>
                </>
              )}
              {getFileIcon() === "file-code" && (
                <>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <path d="M10 12l-2 2 2 2"></path>
                  <path d="M14 12l2 2-2 2"></path>
                </>
              )}
              {getFileIcon() === "file" && (
                <>
                  <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </>
              )}
            </svg>
          )}
        </div>
        <div className="p-4">
          <h4 className="font-medium truncate">{file.fileName}</h4>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">{formatFileSize(file.fileSize)}</span>
            <span className="text-xs text-gray-400">{formatTimestamp(file.uploadTimestamp)}</span>
          </div>
          <div className="mt-2 p-2 bg-[#1a1a1a] rounded-md">
            <p className="text-xs text-gray-400 mb-2">IPFS Hash:</p>
            {file.ipfsHash ? (
              <div className="flex flex-col gap-2">
                <code className="text-xs bg-black/50 p-2 rounded font-mono text-[#00FFFF]">
                  {file.ipfsHash}
                </code>
                <a 
                  href={`https://ipfs.io/ipfs/${file.ipfsHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#00FFFF] hover:text-[#FF00FF] inline-flex items-center text-sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path>
                    <line x1="16" y1="5" x2="22" y2="5"></line>
                    <line x1="22" y1="5" x2="22" y2="11"></line>
                    <line x1="22" y1="5" x2="16" y2="11"></line>
                  </svg>
                  View on IPFS Gateway
                </a>
              </div>
            ) : (
              <p className="text-red-400 text-xs">Not available</p>
            )}
          </div>
          <div className="flex justify-between mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <motion.button 
              className="text-[#00FFFF] hover:text-white transition-colors"
              onClick={handleDownload}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </motion.button>
            <motion.button 
              className="text-[#00FFFF] hover:text-white transition-colors"
              onClick={openShareDialog}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"></circle>
                <circle cx="6" cy="12" r="3"></circle>
                <circle cx="18" cy="19" r="3"></circle>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
              </svg>
            </motion.button>
            <motion.button 
              className="text-[#00FFFF] hover:text-red-400 transition-colors"
              onClick={handleDelete}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#121212] border border-[#8A2BE2]">
          <DialogHeader>
            <DialogTitle className="text-white font-['Orbitron']">Share File</DialogTitle>
            <DialogDescription>
              Enter the wallet address of the person you want to share this file with.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <div className="bg-[#8A2BE2] bg-opacity-20 p-2 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8A2BE2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
              </div>
              <div className="flex-1 truncate">
                <h4 className="text-sm font-medium text-white truncate">{file.fileName}</h4>
                <p className="text-xs text-gray-400">{formatFileSize(file.fileSize)}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="recipient" className="text-sm font-medium text-gray-200">
                Recipient Wallet Address
              </label>
              <div className="relative">
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="pl-10 bg-[#1E1E1E] border-[#8A2BE2] text-white"
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                    <path d="M12 11h4"></path>
                    <path d="M12 16h4"></path>
                    <path d="M8 11h.01"></path>
                    <path d="M8 16h.01"></path>
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                The person will need to be a registered user of OnyxChain to access this file.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsShareDialogOpen(false)}
              className="border-[#8A2BE2] hover:bg-[#8A2BE2] hover:bg-opacity-10 text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleShareFile}
              disabled={isSharing || !recipientAddress}
              className="bg-gradient-to-r from-[#8A2BE2] to-[#FF00FF] text-white hover:opacity-90 transition-opacity"
            >
              {isSharing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sharing...
                </>
              ) : "Share File"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FileCard;