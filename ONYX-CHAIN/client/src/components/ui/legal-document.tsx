import React from "react";
import { motion } from "framer-motion";

interface LegalDocumentProps {
  title: string;
  children: React.ReactNode;
}

export function LegalDocument({ title, children }: LegalDocumentProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto p-6 bg-[#111827] border border-[#8A2BE2] rounded-lg shadow-lg my-8"
    >
      <h1 className="text-3xl font-['Orbitron'] text-[#00FFFF] mb-6 border-b border-[#8A2BE2] pb-2">
        {title}
      </h1>
      <div className="prose prose-invert prose-cyan max-w-none">
        {children}
      </div>
      <div className="mt-8 text-sm text-gray-400 border-t border-[#8A2BE2] pt-4">
        <p>Last Updated: {new Date().toLocaleDateString()}</p>
      </div>
    </motion.div>
  );
}