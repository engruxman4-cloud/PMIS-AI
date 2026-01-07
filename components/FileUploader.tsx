import React, { useRef } from 'react';
import { Upload, FileCheck, FileWarning, X } from 'lucide-react';
import { ProjectFile, FileType } from '../types';

interface FileUploaderProps {
  label: string;
  acceptTypes: FileType[];
  onUpload: (file: File, type: FileType) => void;
  currentFile?: ProjectFile;
  onRemove: () => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ 
  label, 
  acceptTypes, 
  onUpload, 
  currentFile, 
  onRemove 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Defaulting to the first accepted type for simplicity in this demo
      onUpload(file, acceptTypes[0]);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3 transition-colors">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
        {currentFile && (
          <span className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full flex items-center gap-1 border border-green-100 dark:border-green-800">
            <FileCheck size={12} /> Uploaded
          </span>
        )}
      </div>

      {!currentFile ? (
        <div 
          onClick={handleClick}
          className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
        >
          <Upload className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 mb-2" size={24} />
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            Click to upload <br/>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{acceptTypes.join(', ')}</span>
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
            accept=".pdf,.xlsx,.csv,.docx"
          />
        </div>
      ) : (
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 p-3 rounded-md border border-slate-200 dark:border-slate-600">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded text-blue-600 dark:text-blue-400">
              <FileCheck size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{currentFile.name}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {(currentFile.size / 1024).toFixed(1)} KB • {currentFile.uploadDate.toLocaleDateString()}
              </span>
            </div>
          </div>
          <button 
            onClick={onRemove}
            className="text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  );
};