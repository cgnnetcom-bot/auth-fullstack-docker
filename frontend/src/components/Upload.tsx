import React, { useState } from 'react';
import { imageAPI } from '../api/client';
import toast from 'react-hot-toast';

interface UploadProps {
  onUploadSuccess: () => void;
}

const Upload: React.FC<UploadProps> = ({ onUploadSuccess }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      setFiles(newFiles);

      const newPreviews = newFiles.map(file => {
        const reader = new FileReader();
        return new Promise<string>(resolve => {
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(newPreviews).then(setPreviews);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      toast.error('Please select at least one file to upload.');
      return;
    }

    setLoading(true);
    try {
      await Promise.all(files.map(file => imageAPI.uploadImage(file)));
      toast.success('Images uploaded successfully!');
      setFiles([]);
      setPreviews([]);
      onUploadSuccess(); // Trigger the callback
    } catch (error) {
      toast.error('Failed to upload images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-grow">
          <label htmlFor="file-upload" className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Choose Images
          </label>
          <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/*" multiple />
        </div>
        {previews.length > 0 && (
          <div className="mt-4 sm:mt-0 flex gap-2">
            {previews.map((preview, index) => (
              <img key={index} src={preview} alt={`Preview ${index}`} className="h-20 w-20 object-cover rounded" />
            ))}
          </div>
        )}
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500"
          disabled={files.length === 0 || loading}
        >
          {loading ? `Uploading ${files.length} images...` : 'Upload'}
        </button>
      </form>
    </div>
  );
};

export default Upload;
