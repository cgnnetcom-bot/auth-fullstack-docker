import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { albumAPI } from '../api/client';
import toast from 'react-hot-toast';
import RenameModal from '../components/RenameModal';

interface Album {
  id: string;
  name: string;
  _count: {
    images: number;
  };
}

const Albums: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const response = await albumAPI.getAlbums();
      setAlbums(response.data);
    } catch (err) {
      setError('Failed to fetch albums.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumName.trim()) {
      toast.error('Album name cannot be empty.');
      return;
    }

    try {
      await albumAPI.createAlbum({ name: newAlbumName });
      toast.success('Album created successfully!');
      setNewAlbumName('');
      fetchAlbums(); // Refetch albums after creation
    } catch (err) {
      toast.error('Failed to create album.');
      console.error(err);
    }
  };

  const handleDeleteAlbum = async (id: string) => {
    try {
      await albumAPI.deleteAlbum(id);
      toast.success('Album deleted successfully!');
      fetchAlbums(); // Refetch albums
    } catch (err) {
      toast.error('Failed to delete album.');
      console.error(err);
    }
  };

  const handleOpenRenameModal = (album: Album) => {
    setSelectedAlbum(album);
    setIsRenameModalOpen(true);
  };

  const handleCloseRenameModal = () => {
    setSelectedAlbum(null);
    setIsRenameModalOpen(false);
  };

  const handleRenameAlbum = async (newName: string) => {
    if (!selectedAlbum) return;

    try {
      await albumAPI.updateAlbum(selectedAlbum.id, { name: newName });
      toast.success('Album renamed successfully!');
      handleCloseRenameModal();
      fetchAlbums(); // Refetch albums
    } catch (err) {
      toast.error('Failed to rename album.');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Albums</h1>

      <div className="mb-8">
        <form onSubmit={handleCreateAlbum} className="flex gap-2">
          <input
            type="text"
            value={newAlbumName}
            onChange={(e) => setNewAlbumName(e.target.value)}
            placeholder="New album name"
            className="bg-gray-700 text-white p-2 rounded flex-grow"
          />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
            Create Album
          </button>
        </form>
      </div>

      {loading && <p>Loading albums...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {albums.map((album) => (
          <div key={album.id} className="bg-gray-800 rounded-lg relative group">
            <Link to={`/albums/${album.id}`} className="block p-4">
              <h2 className="text-xl font-bold truncate">{album.name}</h2>
              <p className="text-gray-400">{album._count.images} images</p>
            </Link>
            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleOpenRenameModal(album); }} className="text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 5.232z" />
                </svg>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); handleDeleteAlbum(album.id); }}
                className="text-red-600 hover:text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedAlbum && (
        <RenameModal 
          isOpen={isRenameModalOpen}
          onClose={handleCloseRenameModal}
          onRename={handleRenameAlbum}
          currentTitle={selectedAlbum.name}
        />
      )}
    </div>
  );
};

export default Albums;