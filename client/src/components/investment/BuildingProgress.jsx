import React, { useState } from "react";
import { PlayCircle, Image as ImageIcon, X } from "lucide-react";

const getYoutubeEmbedUrl = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[2].length === 11) ? match[2] : null;
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
};

const VideoModal = ({ url, onClose }) => {
  const embedUrl = getYoutubeEmbedUrl(url);
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-black w-full max-w-4xl aspect-video rounded-2xl overflow-hidden relative shadow-2xl">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors"
        >
          <X size={20} />
        </button>
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Progress Video"
        ></iframe>
      </div>
    </div>
  );
};

const BuildingProgress = ({ videoUrl, images = [] }) => {
  const [showVideo, setShowVideo] = useState(false);

  if (!videoUrl && (!images || images.length === 0)) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      {showVideo && <VideoModal url={videoUrl} onClose={() => setShowVideo(false)} />}
      
      {videoUrl && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3 flex items-center gap-1.5">
            <PlayCircle size={14} /> Progress Video
          </h4>
          <button
            onClick={() => setShowVideo(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-sm font-semibold rounded-xl transition-colors"
          >
            <PlayCircle size={16} /> Watch Construction Update
          </button>
        </div>
      )}

      {images && images.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-3 flex items-center gap-1.5">
            <ImageIcon size={14} /> Progress Gallery
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((src, i) => (
              <a
                key={i}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 block"
              >
                <img
                  src={src}
                  alt={`Progress ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingProgress;
