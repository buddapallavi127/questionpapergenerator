import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileDown, UploadCloud, ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UploadQuestions = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'upload' | 'update'>('upload');

  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const endpoint =
        mode === 'upload'
          ? 'http://localhost:8000/api/questions/upload-xlsx'
          : 'http://localhost:8000/api/questions/update-from-xlsx';

      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      setMessage(result.detail || 'Operation successful!');
    } catch (err) {
      setMessage('Operation failed. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    window.open('http://localhost:8000/api/questions/export-xlsx', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden border border-orange-200">
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 border-b border-orange-100 flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-orange-600 hover:bg-orange-100 p-2 rounded"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h2 className="text-2xl font-bold text-orange-800 flex items-center gap-3">
            <UploadCloud className="h-8 w-8" />
            {mode === 'upload' ? 'Upload New Questions' : 'Update Existing Questions'}
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Mode toggle */}
          <div className="flex items-center gap-4">
            <label className="font-medium text-gray-700">Action:</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'upload' | 'update')}
              className="border border-orange-200 rounded p-1 text-sm"
            >
              <option value="upload">Upload New Questions</option>
              <option value="update">Update Existing Questions</option>
            </select>

            {mode === 'update' && (
              <Button
                onClick={handleDownload}
                className="flex items-center gap-2 text-orange-700 border border-orange-300 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-md"
              >
                <Download className="h-4 w-4" />
                Download Questions
              </Button>
            )}
          </div>

          {/* File input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Excel File (.xlsx)
            </label>
            <Input
              type="file"
              accept=".xlsx"
              onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setMessage('');
              }}
              className="border-orange-200 hover:border-orange-300"
            />
          </div>

          {/* File info */}
          {file && (
            <div className="bg-orange-50 p-3 rounded-md border border-orange-100">
              <div className="flex items-center gap-2 text-orange-700">
                <FileDown className="h-5 w-5" />
                <span className="font-medium">{file.name}</span>
                <span className="text-sm text-orange-600 ml-auto">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!file || isLoading}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md"
          >
            {isLoading
              ? mode === 'upload'
                ? 'Uploading...'
                : 'Updating...'
              : mode === 'upload'
              ? 'Upload Questions'
              : 'Update Questions'}
          </Button>

          {/* Message */}
          {message && (
            <div
              className={`p-3 rounded-md ${
                message.toLowerCase().includes('success')
                  ? 'bg-green-50 text-green-700 border border-green-100'
                  : 'bg-red-50 text-red-700 border border-red-100'
              }`}
            >
              {message}
            </div>
          )}

          {/* Instructions */}
          <div className="pt-4 border-t border-orange-100 text-sm text-gray-600">
            <h3 className="font-medium text-gray-700 mb-2">
              {mode === 'upload' ? 'Upload File Format:' : 'Update File Format:'}
            </h3>

            {mode === 'upload' ? (
              <ul className="list-disc pl-5 space-y-1">
                <li>Must include: <code>text</code>, <code>type</code>, <code>level</code>, <code>subject</code></li>
                <li>Optional: <code>option_a</code>, <code>option_b</code>, <code>option_c</code>, <code>option_d</code>, <code>chapter</code>, <code>topic</code>, <code>class_</code>, <code>language</code></li>
                <li>Supported types: <code>mcq</code>, <code>numerical</code>, <code>subjective</code></li>
                <li>Supported levels: <code>easy</code>, <code>medium</code>, <code>hard</code></li>
              </ul>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Must include:</strong> <code>id</code> column (used to identify the question)</li>
                <li>Include any fields you want to update: <code>text</code>, <code>chapter</code>, <code>option_a</code>, etc.</li>
                <li>Empty cells are ignored and will not overwrite data</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadQuestions;
