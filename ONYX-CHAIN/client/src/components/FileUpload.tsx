import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "../contexts/WalletContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { File } from "@shared/schema";
import FileCard from "./FileCard";
import { Progress } from "@/components/ui/progress";

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  size: number;
  type: string;
  status: 'uploading' | 'success' | 'error';
}

const FileUpload: React.FC = () => {
  const { walletInfo } = useWallet();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const walletAddress = walletInfo?.address || "";
  
  // Fetch recent uploads
  const { data: files, isLoading } = useQuery<File[]>({
    queryKey: [`/api/files/${walletAddress}`],
    enabled: !!walletAddress,
  });
  
  // File upload mutation
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
      queryClient.invalidateQueries({ queryKey: [`/api/files/${walletAddress}`] });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      });
    },
  });
  
  const handleFileSelection = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0 || !walletAddress) return;
    
    const maxSize = 100 * 1024 * 1024; // 100MB
    
    // Clear previous uploading files if any
    setUploadingFiles([]);
    
    // Prepare files for upload
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (file.size > maxSize) {
        toast({
          title: "File Too Large",
          description: `${file.name} exceeds the 100MB limit.`,
          variant: "destructive",
        });
        continue;
      }
      
      // Add file to uploading list with 0% progress
      const fileId = crypto.randomUUID();
      const newUploadingFile: UploadingFile = {
        id: fileId,
        name: file.name,
        progress: 0,
        size: file.size,
        type: file.type,
        status: 'uploading'
      };
      
      setUploadingFiles(prev => [...prev, newUploadingFile]);
      
      // Convert to base64 with progress tracking
      const reader = new FileReader();
      
      // Track progress
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadingFiles(prev => 
            prev.map(f => f.id === fileId ? { ...f, progress } : f)
          );
        }
      };
      
      reader.onload = async (event) => {
        if (event.target?.result) {
          const fileData = event.target.result as string;
          
          // Set to 100% before sending to API
          setUploadingFiles(prev => 
            prev.map(f => f.id === fileId ? { ...f, progress: 100 } : f)
          );
          
          try {
            await uploadMutation.mutateAsync({
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              fileData: fileData,
              walletAddress,
            });
            
            // Update status to success
            setUploadingFiles(prev => 
              prev.map(f => f.id === fileId ? { ...f, status: 'success' } : f)
            );
            
            // Remove file from list after a delay
            setTimeout(() => {
              setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
            }, 3000);
            
          } catch (error) {
            // Update status to error
            setUploadingFiles(prev => 
              prev.map(f => f.id === fileId ? { ...f, status: 'error' } : f)
            );
          }
        }
      };
      
      reader.onerror = () => {
        // Update status to error
        setUploadingFiles(prev => 
          prev.map(f => f.id === fileId ? { ...f, status: 'error' } : f)
        );
        
        toast({
          title: "Upload Failed",
          description: `Failed to read ${file.name}`,
          variant: "destructive",
        });
      };
      
      reader.readAsDataURL(file);
    }
  }, [walletAddress, toast, uploadMutation]);
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelection(e.dataTransfer.files);
  }, [handleFileSelection]);
  
  const handleUploadClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);
  
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(e.target.files);
  }, [handleFileSelection]);
  
  // Get recent uploads (last 2)
  const recentUploads = files?.slice(0, 2);
  
  return (
    <section className="max-w-4xl mx-auto">
      <h2 className="font-['Orbitron'] text-2xl font-bold mb-6">Upload Files</h2>
      
      <motion.div 
        className={`rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all border-2 border-dashed ${isDragging ? 'border-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.5)]' : 'border-[#8A2BE2]'}`}
        whileHover={{ scale: 1.01, borderColor: "#00FFFF" }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadClick}
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#8A2BE2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 8px rgba(138, 43, 226, 0.7))" }} className="mb-4">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
        </motion.div>
        <h3 className="font-['Orbitron'] text-xl mb-2">Drop files here or click to browse</h3>
        <p className="text-gray-400 mb-4">Upload any file type. Max size: 100MB</p>
        <motion.button 
          className="bg-[#8A2BE2] text-white px-6 py-2 rounded-md hover:bg-opacity-80 transition-all font-medium"
          whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(138, 43, 226, 0.7)" }}
          whileTap={{ scale: 0.95 }}
        >
          Select Files
        </motion.button>
        <input 
          type="file" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileInputChange}
          multiple 
        />
      </motion.div>
      
      {/* Upload Progress Section */}
      {uploadingFiles.length > 0 && (
        <div className="mt-8">
          <h3 className="font-['Orbitron'] text-xl mb-4">Upload Progress</h3>
          <div className="space-y-4">
            <AnimatePresence>
              {uploadingFiles.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="border border-[#8A2BE2] rounded-lg p-4 bg-[#1E1E1E] shadow-lg"
                >
                  <div className="flex items-center mb-2">
                    <div className="flex-shrink-0">
                      {file.status === 'uploading' ? (
                        <svg className="w-6 h-6 text-[#00FFFF] animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : file.status === 'success' ? (
                        <svg className="w-6 h-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="text-sm font-medium text-white">{file.name}</h4>
                      <p className="text-xs text-gray-400">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type.split('/')[1]}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-medium text-[#00FFFF]">{file.progress}%</p>
                    </div>
                  </div>
                  
                  <Progress
                    className={`h-2 ${
                      file.status === 'error' 
                        ? 'bg-red-500/20' 
                        : file.status === 'success' 
                          ? 'bg-green-500/20'
                          : 'bg-[#121212]'
                    }`}
                    value={file.progress}
                    style={{
                      backgroundImage: 'linear-gradient(rgba(138, 43, 226, 0.2) 1px, transparent 1px)',
                      backgroundSize: '10px 10px',
                    }}
                    indicatorClassName={
                      file.status === 'error' 
                        ? 'bg-red-500' 
                        : file.status === 'success' 
                          ? 'bg-green-500'
                          : 'bg-gradient-to-r from-[#00FFFF] to-[#FF00FF]'
                    }
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
      
      {/* Recent Uploads Section */}
      <div className="mt-8">
        <h3 className="font-['Orbitron'] text-xl mb-4">Recent Uploads</h3>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="border border-[#8A2BE2] rounded-lg p-4 animate-pulse">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#8A2BE2] bg-opacity-20 rounded-md mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : recentUploads && recentUploads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentUploads.map((file) => (
              <FileCard 
                key={file.id} 
                file={file} 
                variant="compact"
              />
            ))}
          </div>
        ) : (
          <div className="border border-[#8A2BE2] border-dashed rounded-lg p-6 text-center text-gray-400">
            <p>No files uploaded yet. Upload your first file above.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FileUpload;
