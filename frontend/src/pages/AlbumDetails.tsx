import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { albumAPI } from '../api/client';
import { toast } from 'react-toastify';

interface Image {
  id: string;
  title: string;
  url: string;
}

interface Album {
  id: string;
  name: string;
  images: Image[];
}

const AlbumDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlbum = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await albumAPI.getAlbum(id);
      setAlbum(response.data);
    } catch (err) {
      setError('Failed to fetch album details.');
      toast.error('Failed to fetch album details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbum();
  }, [id]);

  const handleRemoveFromAlbum = async (imageId: string) => {
    if (!id) return;
    try {
      await albumAPI.removeImageFromAlbum(id, imageId);
      toast.success('Image removed from album!');
      fetchAlbum(); // Refetch to update the UI
    } catch (err) {
      toast.error('Failed to remove image from album.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!album) {
    return <div>Album not found.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{album.name}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {album.images.map((image) => (
          <div key={image.id} className="group relative">
            <img src={image.url} alt={image.title} className="w-full h-48 object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <p className="text-white text-lg font-bold">{image.title}</p>
            </div>
            <button
              onClick={() => handleRemoveFromAlbum(image.id)}
              className="absolute top-2 right-2 bg-yellow-600 hover:bg-yellow-700 text-white font-bold p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlbumDetails;
