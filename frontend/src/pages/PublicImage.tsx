import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { imageAPI } from '../api/client';

interface Image {
  id: string;
  title: string;
  url: string;
}

const PublicImage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [image, setImage] = useState<Image | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await imageAPI.getImage(id); // This function does not exist yet
        setImage(response.data);
      } catch (err) {
        setError('Failed to fetch image.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!image) {
    return <div>Image not found.</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">{image.title}</h1>
      <img src={image.url} alt={image.title} className="max-w-full max-h-screen" />
    </div>
  );
};

export default PublicImage;
