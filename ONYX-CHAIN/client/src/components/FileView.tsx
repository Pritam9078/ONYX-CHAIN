import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "../contexts/WalletContext";
import { useQuery } from "@tanstack/react-query";
import { File } from "@shared/schema";
import FileCard from "./FileCard";

const FileView: React.FC = () => {
  const { walletInfo } = useWallet();
  const walletAddress = walletInfo?.address || "";
  const [searchTerm, setSearchTerm] = useState("");
  const [fileType, setFileType] = useState("all");
  
  // Fetch files
  const { data: files, isLoading } = useQuery<File[]>({
    queryKey: [`/api/files/${walletAddress}`],
    enabled: !!walletAddress,
  });
  
  // Filter files based on search and file type
  const filteredFiles = files?.filter(file => {
    const matchesSearch = file.fileName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = fileType === "all" ? true : 
                       fileType === "images" ? file.fileType.startsWith("image/") :
                       fileType === "documents" ? (file.fileType.includes("pdf") || file.fileType.includes("doc") || file.fileType.includes("text")) :
                       true;
    return matchesSearch && matchesType;
  });
  
  return (
    <section className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="font-['Orbitron'] text-2xl font-bold">My Files</h2>
        
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input 
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#1E1E1E] border border-[#8A2BE2] focus:border-[#00FFFF] rounded-md px-4 py-2 pr-10 text-sm focus:outline-none w-full transition-colors"
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          
          <select 
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            className="bg-[#1E1E1E] border border-[#8A2BE2] text-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-[#00FFFF] w-full md:w-auto transition-colors"
          >
            <option value="all">All Files</option>
            <option value="images">Images</option>
            <option value="documents">Documents</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-[#8A2BE2] rounded-lg overflow-hidden animate-pulse">
              <div className="h-32 bg-[#1E1E1E]"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredFiles && filteredFiles.length > 0 ? (
        <AnimatePresence mode="popLayout">
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            layout
          >
            {filteredFiles.map((file) => (
              <motion.div
                key={file.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <FileCard file={file} variant="full" />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="border border-[#8A2BE2] border-dashed rounded-lg p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8A2BE2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            <line x1="12" y1="11" x2="12" y2="17"></line>
            <line x1="9" y1="14" x2="15" y2="14"></line>
          </svg>
          <h3 className="font-['Orbitron'] text-xl mb-2">No Files Found</h3>
          {searchTerm || fileType !== "all" ? (
            <p className="text-gray-400">No files match your current filters.</p>
          ) : (
            <p className="text-gray-400">You haven't uploaded any files yet.</p>
          )}
        </div>
      )}
    </section>
  );
};

export default FileView;
