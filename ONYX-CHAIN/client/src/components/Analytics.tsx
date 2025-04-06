import React from "react";
import { motion } from "framer-motion";
import { useWallet } from "../contexts/WalletContext";
import { useQuery } from "@tanstack/react-query";
import { File } from "@shared/schema";
import { CyberpunkCard } from "./ui/cyberpunk-card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from "recharts";

const Analytics: React.FC = () => {
  const { walletInfo } = useWallet();
  const walletAddress = walletInfo?.address || "";
  
  // Fetch all files for analysis
  const { data: files, isLoading } = useQuery<File[]>({
    queryKey: [`/api/files/${walletAddress}`],
    enabled: !!walletAddress,
  });
  
  // Prepare file type data for charts
  const fileTypeData = React.useMemo(() => {
    if (!files || files.length === 0) return [];
    
    const typeCount: Record<string, number> = {};
    
    files.forEach((file) => {
      // Extract the general type (image, document, video, etc.)
      let generalType = "other";
      if (file.fileType.startsWith("image/")) generalType = "image";
      else if (file.fileType.includes("pdf") || file.fileType.includes("doc") || file.fileType.includes("text")) generalType = "document";
      else if (file.fileType.startsWith("video/")) generalType = "video";
      else if (file.fileType.startsWith("audio/")) generalType = "audio";
      
      typeCount[generalType] = (typeCount[generalType] || 0) + 1;
    });
    
    return Object.entries(typeCount).map(([name, value]) => ({ name, value }));
  }, [files]);
  
  // Prepare file size data
  const fileSizeData = React.useMemo(() => {
    if (!files || files.length === 0) return [];
    
    // Group files by size ranges (in MB)
    const sizeRanges = [
      { range: "0-1MB", min: 0, max: 1 * 1024 * 1024 },
      { range: "1-5MB", min: 1 * 1024 * 1024, max: 5 * 1024 * 1024 },
      { range: "5-10MB", min: 5 * 1024 * 1024, max: 10 * 1024 * 1024 },
      { range: "10-50MB", min: 10 * 1024 * 1024, max: 50 * 1024 * 1024 },
      { range: "50MB+", min: 50 * 1024 * 1024, max: Infinity }
    ];
    
    const sizeDistribution = sizeRanges.map(range => ({
      name: range.range,
      value: files.filter(file => file.fileSize >= range.min && file.fileSize < range.max).length
    }));
    
    return sizeDistribution;
  }, [files]);
  
  // Prepare upload timeline data
  const uploadTimelineData = React.useMemo(() => {
    if (!files || files.length === 0) return [];
    
    // Group uploads by date
    const dateMap: Record<string, number> = {};
    
    files.forEach(file => {
      const date = new Date(file.uploadTimestamp);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
      dateMap[dateString] = (dateMap[dateString] || 0) + 1;
    });
    
    // Convert to array and sort by date
    return Object.entries(dateMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7); // Last 7 days
  }, [files]);
  
  // Calculate total storage used
  const totalStorageUsed = React.useMemo(() => {
    if (!files || files.length === 0) return 0;
    return files.reduce((total, file) => total + file.fileSize, 0);
  }, [files]);
  
  // Helper function to format bytes
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Colors for charts
  const COLORS = ['#00FFFF', '#FF00FF', '#8A2BE2', '#FF4500', '#32CD32'];
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1E1E1E] p-2 border border-[#8A2BE2] rounded shadow-lg">
          <p className="font-medium">{`${label}`}</p>
          <p className="text-[#00FFFF]">{`Count: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <section className="max-w-5xl mx-auto">
      <h2 className="font-['Orbitron'] text-2xl font-bold mb-6">Storage Analytics</h2>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#1E1E1E] border border-[#8A2BE2] rounded-lg p-6 h-32 animate-pulse">
              <div className="h-5 bg-gray-700 rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <CyberpunkCard className="p-6" glow>
            <h3 className="text-gray-400 mb-2">Total Files</h3>
            <p className="text-3xl font-bold text-[#00FFFF]">{files?.length || 0}</p>
          </CyberpunkCard>
          
          <CyberpunkCard className="p-6" glow>
            <h3 className="text-gray-400 mb-2">Storage Used</h3>
            <p className="text-3xl font-bold text-[#FF00FF]">{formatBytes(totalStorageUsed)}</p>
          </CyberpunkCard>
          
          <CyberpunkCard className="p-6" glow>
            <h3 className="text-gray-400 mb-2">Avg. File Size</h3>
            <p className="text-3xl font-bold text-[#8A2BE2]">
              {files && files.length > 0 ? formatBytes(totalStorageUsed / files.length) : '0 Bytes'}
            </p>
          </CyberpunkCard>
          
          <CyberpunkCard className="p-6" glow>
            <h3 className="text-gray-400 mb-2">Latest Upload</h3>
            <p className="text-2xl font-bold text-[#00FFFF]">
              {files && files.length > 0 
                ? new Date(Math.max(...files.map(f => new Date(f.uploadTimestamp).getTime()))).toLocaleDateString() 
                : 'No uploads'}
            </p>
          </CyberpunkCard>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <CyberpunkCard className="p-6" glow>
          <h3 className="font-['Orbitron'] text-lg font-semibold mb-4">File Type Distribution</h3>
          {fileTypeData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fileTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {fileTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 border border-dashed border-[#8A2BE2] rounded">
              <p className="text-gray-400">No data available</p>
            </div>
          )}
        </CyberpunkCard>
        
        <CyberpunkCard className="p-6" glow>
          <h3 className="font-['Orbitron'] text-lg font-semibold mb-4">File Size Distribution</h3>
          {fileSizeData.length > 0 && fileSizeData.some(item => item.value > 0) ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fileSizeData}>
                  <XAxis dataKey="name" tick={{ fill: "#FFFFFF" }} />
                  <YAxis tick={{ fill: "#FFFFFF" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#00FFFF" radius={[4, 4, 0, 0]}>
                    {fileSizeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 border border-dashed border-[#8A2BE2] rounded">
              <p className="text-gray-400">No data available</p>
            </div>
          )}
        </CyberpunkCard>
      </div>
      
      <CyberpunkCard className="p-6 mb-8" glow>
        <h3 className="font-['Orbitron'] text-lg font-semibold mb-4">Upload Timeline</h3>
        {uploadTimelineData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={uploadTimelineData}>
                <XAxis dataKey="date" tick={{ fill: "#FFFFFF" }} />
                <YAxis tick={{ fill: "#FFFFFF" }} />
                <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#FF00FF" 
                  strokeWidth={2}
                  activeDot={{ r: 8, fill: "#FF00FF", stroke: "#FFFFFF" }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-72 border border-dashed border-[#8A2BE2] rounded">
            <p className="text-gray-400">Upload history not available</p>
          </div>
        )}
      </CyberpunkCard>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CyberpunkCard className="p-6" glow>
          <h3 className="font-['Orbitron'] text-lg font-semibold mb-4">Blockchain Stats</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-gray-400 mb-1">Network</h4>
              <p className="text-lg font-medium text-[#00FFFF]">{walletInfo?.network || 'Not connected'}</p>
            </div>
            <div>
              <h4 className="text-gray-400 mb-1">Chain ID</h4>
              <p className="text-lg font-medium text-[#FF00FF]">{walletInfo?.chainId || 'Unknown'}</p>
            </div>
            <div>
              <h4 className="text-gray-400 mb-1">Wallet Type</h4>
              <p className="text-lg font-medium text-[#8A2BE2]">{walletInfo?.walletType || 'Not detected'}</p>
            </div>
          </div>
        </CyberpunkCard>
        
        <CyberpunkCard className="p-6" glow>
          <h3 className="font-['Orbitron'] text-lg font-semibold mb-4">IPFS Storage</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-gray-400 mb-1">Files on IPFS</h4>
              <p className="text-lg font-medium text-[#00FFFF]">{files?.length || 0}</p>
            </div>
            <div>
              <h4 className="text-gray-400 mb-1">Total IPFS Storage</h4>
              <p className="text-lg font-medium text-[#FF00FF]">{formatBytes(totalStorageUsed)}</p>
            </div>
            <div>
              <h4 className="text-gray-400 mb-1">Connection Status</h4>
              <p className="text-lg font-medium text-[#32CD32]">
                <span className="inline-block h-3 w-3 rounded-full bg-[#32CD32] mr-2"></span>
                Connected
              </p>
            </div>
          </div>
        </CyberpunkCard>
      </div>
    </section>
  );
};

export default Analytics;