import React, { useCallback, useState } from 'react';
import { Upload, File, AlertCircle, CheckCircle } from 'lucide-react';
import { parseResume } from '../utils/resumeParser';

interface ResumeUploadProps {
  onResumeUploaded: (resumeData: any) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onResumeUploaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setSuccess(false);
    setIsProcessing(true);

    try {
      if (!file.type.includes('pdf') && !file.type.includes('word')) {
        throw new Error('Please upload a PDF or DOCX file.');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB.');
      }

      const resumeData = await parseResume(file);
      setSuccess(true);
      onResumeUploaded(resumeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process resume.');
    } finally {
      setIsProcessing(false);
    }
  }, [onResumeUploaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <div className="max-w-md mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : success
            ? 'border-green-500 bg-green-50'
            : error
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
      >
        <div className="flex flex-col items-center space-y-4">
          {isProcessing ? (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          ) : success ? (
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          ) : error ? (
            <div className="bg-red-100 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          ) : (
            <div className="bg-blue-100 p-3 rounded-full">
              {isDragging ? <File className="h-6 w-6 text-blue-600" /> : <Upload className="h-6 w-6 text-blue-600" />}
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-800">
              {isProcessing
                ? 'Processing Resume...'
                : success
                ? 'Resume Uploaded Successfully!'
                : error
                ? 'Upload Failed'
                : 'Upload Your Resume'
              }
            </h3>
            
            {!isProcessing && !success && (
              <p className="text-sm text-gray-600">
                Drag and drop your resume here, or click to browse
              </p>
            )}
            
            {error && (
              <p className="text-sm text-red-600 bg-red-50 p-2 rounded border">
                {error}
              </p>
            )}
          </div>

          {!isProcessing && !success && (
            <div>
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={handleFileSelect}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium"
              >
                Choose File
              </label>
            </div>
          )}

          <div className="text-xs text-gray-500">
            Supported formats: PDF, DOCX • Max size: 10MB
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;