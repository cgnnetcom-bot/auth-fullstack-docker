import React, { useState } from 'react';

interface Album {
  id: string;
  name: string;
}

interface AddToAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToAlbum: (albumId: string) => void;
  albums: Album[];
}

const AddToAlbumModal: React.FC<AddToAlbumModalProps> = ({ isOpen, onClose, onAddToAlbum, albums }) => {
  const [selectedAlbum, setSelectedAlbum] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAlbum) {
      onAddToAlbum(selectedAlbum);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl">
        <h2 className="text-xl font-bold mb-4">Add to Album</h2>
        <form onSubmit={handleSubmit}>
          <select
            value={selectedAlbum}
            onChange={(e) => setSelectedAlbum(e.target.value)}
            className="bg-gray-700 text-white w-full p-2 rounded mb-4"
          >
            <option value="" disabled>Select an album</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.name}
              </option>
            ))}
          </select>
          <div className="flex justify-end gap-4">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded" disabled={!selectedAlbum}>
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddToAlbumModal;
