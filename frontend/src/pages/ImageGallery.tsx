import React, { useEffect, useState } from 'react';
import { imageAPI, albumAPI } from '../api/client';
import Upload from '../components/Upload';
import toast from 'react-hot-toast';
import RenameModal from '../components/RenameModal';
import AddToAlbumModal from '../components/AddToAlbumModal';

interface Image {
  id: string;
  title: string;
  url: string;
}

interface Album {
  id: string;
  name: string;
}

const ImageGallery: React.FC = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isAddToAlbumModalOpen, setIsAddToAlbumModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<Image | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 8; // Images per page

  const fetchImages = async (page: number, search: string) => {
    try {
      setLoading(true);
      const { data } = await imageAPI.getImages(page, limit, search);
      setImages(data.images);
      setTotalPages(Math.ceil(data.totalImages / limit));
    } catch (err) {
      setError('Failed to fetch images.');
      toast.error('Failed to fetch images.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbums = async () => {
    try {
      const response = await albumAPI.getAlbums();
      setAlbums(response.data);
    } catch (err) {
      toast.error("Failed to fetch albums for modal");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await imageAPI.deleteImage(id);
      toast.success('Image deleted successfully!');
      fetchImages(currentPage, searchTerm);
    } catch (err) {
      toast.error('Failed to delete image.');
    }
  };

  const handleOpenRenameModal = (image: Image) => {
    setSelectedImage(image);
    setIsRenameModalOpen(true);
  };

  const handleOpenAddToAlbumModal = (image: Image) => {
    setSelectedImage(image);
    setIsAddToAlbumModalOpen(true);
  };

  const handleCloseModals = () => {
    setSelectedImage(null);
    setIsRenameModalOpen(false);
    setIsAddToAlbumModalOpen(false);
  };

  const handleRename = async (newTitle: string) => {
    if (!selectedImage) return;

    try {
      await imageAPI.updateImage(selectedImage.id, { title: newTitle });
      toast.success('Image renamed successfully!');
      handleCloseModals();
      fetchImages(currentPage, searchTerm);
    } catch (err) {
      toast.error('Failed to rename image.');
    }
  };

  const handleAddToAlbum = async (albumId: string) => {
    if (!selectedImage) return;

    try {
      await albumAPI.addImageToAlbum(albumId, selectedImage.id);
      toast.success('Image added to album successfully!');
      handleCloseModals();
    } catch (err) {
      toast.error('Failed to add image to album.');
    }
  };

  const handleShare = (id: string) => {
    const url = `${window.location.origin}/public/images/${id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  useEffect(() => {
    fetchImages(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchAlbums();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Image Gallery</h1>
        <div className="w-1/3">
          <input
            type="text"
            placeholder="Search by title..."
            className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="mb-4">
        <Upload onUploadSuccess={() => fetchImages(1, '')} />
      </div>

      {loading && <p>Loading images...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div key={image.id} className="bg-gray-800 rounded-lg overflow-hidden group relative">
            <img src={image.url} alt={image.title} className="w-full h-48 object-cover" />
            <div className="p-2 flex justify-between items-center">
              <p className="text-white truncate">{image.title}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenRenameModal(image)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 5.232z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleOpenAddToAlbumModal(image)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => handleShare(image.id)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-8.316l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.998a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </button>
              </div>
            </div>
            <button
              onClick={() => handleDelete(image.id)}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white font-bold p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          onClick={() => setCurrentPage(p => p - 1)}
          disabled={currentPage === 1}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded disabled:bg-gray-500"
        >
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button
          onClick={() => setCurrentPage(p => p + 1)}
          disabled={currentPage === totalPages}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded disabled:bg-gray-500"
        >
          Next
        </button>
      </div>

      {selectedImage && (
        <RenameModal
          isOpen={isRenameModalOpen}
          onClose={handleCloseModals}
          onRename={handleRename}
          currentTitle={selectedImage.title}
        />
      )}

      {selectedImage && (
        <AddToAlbumModal
          isOpen={isAddToAlbumModalOpen}
          onClose={handleCloseModals}
          onAddToAlbum={handleAddToAlbum}
          albums={albums}
        />
      )}
    </div>
  );
};

export default ImageGallery;