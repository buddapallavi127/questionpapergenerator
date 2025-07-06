import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileDown, UploadCloud, ArrowLeft } from 'lucide-react';
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

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      const endpoint =
        mode === 'upload'
          ? 'http://localhost:8000/api/questions/upload-json'
          : 'http://localhost:8000/api/questions/update-from-json';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData),
      });

      const result = await res.json();
      setMessage(result.detail || 'Operation successful!');
    } catch (err) {
      setMessage('Operation failed. Please check your JSON format and try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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
            {mode === 'upload' ? 'Upload New Questions (JSON)' : 'Update Questions (JSON)'}
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
          </div>

          {/* File input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              JSON File (.json)
            </label>
            <Input
              type="file"
              accept=".json"
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
              {mode === 'upload' ? 'Upload JSON Format:' : 'Update JSON Format:'}
            </h3>
            <pre className="bg-orange-50 p-3 rounded border border-orange-100 text-xs overflow-auto">
{`[
  {
    "text": "What is 2 + 2?",
    "type": "mcq",
    "level": "easy",
    "subject": "Math",
    "option_a": "3",
    "option_b": "4",
    "option_c": "5",
    "option_d": "6"
  }
]`}
            </pre>
            {mode === 'update' && (
              <p className="mt-2 text-xs text-gray-500">
                Include an <code>id</code> field to identify the question to update.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadQuestions;
