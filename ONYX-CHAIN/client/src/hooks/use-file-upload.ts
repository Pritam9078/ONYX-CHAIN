import { useState, useCallback } from "react";
import { useWallet } from "../contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface UseFileUploadOptions {
  maxSizeInBytes?: number;
  allowedTypes?: string[];
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const { maxSizeInBytes = 100 * 1024 * 1024, allowedTypes } = options;
  const { walletInfo } = useWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  
  const uploadMutation = useMutation({
    mutationFn: async (file: { fileName: string; fileType: string; fileSize: number; fileData: string; walletAddress: string }) => {
      const response = await apiRequest("POST", "/api/files", file);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload Success",
        description: "Your file has been uploaded successfully.",
      });
      if (walletInfo?.address) {
        queryClient.invalidateQueries({ queryKey: [`/api/files/${walletInfo.address}`] });
      }
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    },
  });
  
  const uploadFile = useCallback(
    async (file: File): Promise<boolean> => {
      if (!walletInfo?.address) {
        toast({
          title: "Authentication Required",
          description: "Please connect your wallet to upload files.",
          variant: "destructive",
        });
        return false;
      }
      
      if (file.size > maxSizeInBytes) {
        toast({
          title: "File Too Large",
          description: `Maximum file size is ${maxSizeInBytes / (1024 * 1024)}MB.`,
          variant: "destructive",
        });
        return false;
      }
      
      if (allowedTypes && !allowedTypes.includes(file.type)) {
        toast({
          title: "Unsupported File Type",
          description: "This file type is not supported.",
          variant: "destructive",
        });
        return false;
      }
      
      setIsUploading(true);
      
      try {
        // Upload to IPFS first
        const ipfsHash = await uploadToIPFS(file);
        
        // Convert to base64
        const base64Promise = new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (event.target?.result) {
              resolve(event.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        });
        
        const fileData = await base64Promise;
        
        // Upload to contract first
        const fileId = await uploadFileToBlockchain(
          file.name,
          file.type,
          file.size,
          ipfsHash,
          "",  // description
          false // isPublic
        );

        // Then save to server
        await uploadMutation.mutateAsync({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileData: fileData,
          ipfsHash: ipfsHash,
          walletAddress: walletInfo.address,
          fileId: fileId
        });
        
        return true;
      } catch (error) {
        console.error("Error uploading file:", error);
        return false;
      } finally {
        setIsUploading(false);
      }
    },
    [walletInfo, maxSizeInBytes, allowedTypes, toast, uploadMutation]
  );
  
  const uploadFiles = useCallback(
    async (files: FileList | File[]): Promise<boolean> => {
      if (!walletInfo?.address) {
        toast({
          title: "Authentication Required",
          description: "Please connect your wallet to upload files.",
          variant: "destructive",
        });
        return false;
      }
      
      setIsUploading(true);
      
      try {
        const promises: Promise<boolean>[] = [];
        
        for (let i = 0; i < files.length; i++) {
          promises.push(uploadFile(files[i]));
        }
        
        const results = await Promise.all(promises);
        return results.some(result => result);
      } catch (error) {
        console.error("Error uploading files:", error);
        return false;
      } finally {
        setIsUploading(false);
      }
    },
    [walletInfo, uploadFile, toast]
  );
  
  return {
    uploadFile,
    uploadFiles,
    isUploading,
  };
}
