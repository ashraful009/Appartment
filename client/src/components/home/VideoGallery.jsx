import React, { useState } from "react";
import { Play, X } from "lucide-react";

const VIDEOS = [
  { id: 1, title: "Project Video 1", url: "https://www.youtube.com/watch?v=GIhXmEur4a0" },
  { id: 2, title: "Project Video 2", url: "" },
  { id: 3, title: "Project Video 3", url: "" },
];

function getYouTubeVideoId(url) {
  if (!url) return "";
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes("youtu.be")) {
      return parsedUrl.pathname.replace("/", "");
    }
    if (parsedUrl.pathname.includes("/embed/")) {
      return parsedUrl.pathname.split("/embed/")[1];
    }
    return parsedUrl.searchParams.get("v") || "";
  } catch {
    return "";
  }
}

const VideoGallery = () => {
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);

  const activeVideoId = activeVideoUrl ? getYouTubeVideoId(activeVideoUrl) : "";
  const embedUrl = activeVideoId ? `https://www.youtube.com/embed/${activeVideoId}?autoplay=1` : "";

  return (
    <section className="w-[min(1600px,calc(100%-4rem))] mx-auto mb-16 p-8 lg:p-12 bg-white border border-[rgba(37,99,235,0.12)] rounded-[32px] shadow-[0_20px_45px_rgba(15,23,42,0.12)]" id="project-video">
      <div className="text-center mb-10">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#dbeafe] text-[#2563eb] text-xs font-bold uppercase tracking-wider mb-3">
          Project Video
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#1e3a8a]">
          Project video gallery
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {VIDEOS.map((video) => {
          const videoId = getYouTubeVideoId(video.url);
          const thumbBg = videoId
            ? `url("https://img.youtube.com/vi/${videoId}/hqdefault.jpg")`
            : "linear-gradient(135deg, #1e3a8a, #3b82f6)";

          return (
            <article key={video.id} className="group">
              <button
                onClick={() => setActiveVideoUrl(video.url)}
                type="button"
                className="w-full text-left bg-transparent border-0 cursor-pointer p-0 block"
              >
                <div
                  className="relative w-full aspect-video rounded-[20px] overflow-hidden bg-cover bg-center border border-[rgba(37,99,235,0.16)] shadow-md transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl flex items-center justify-center"
                  style={{ backgroundImage: thumbBg }}
                >
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors" />
                  <div className="relative z-10 w-14 h-14 rounded-full bg-white/90 text-[#2563eb] flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#2563eb] group-hover:text-white transition-all duration-300">
                    <Play size={24} className="ml-1" />
                  </div>
                </div>
                <span className="block mt-3 text-base font-bold text-[#1e3a8a] group-hover:text-[#2563eb] transition-colors">
                  {video.title}
                </span>
              </button>
            </article>
          );
        })}
      </div>

      {activeVideoUrl !== null && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="fixed inset-0" onClick={() => setActiveVideoUrl(null)} />
          <div className="relative z-10 w-full max-w-4xl bg-black rounded-[24px] overflow-hidden shadow-2xl p-2 sm:p-4">
            <button
              onClick={() => setActiveVideoUrl(null)}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors"
              type="button"
            >
              <X size={20} />
            </button>
            <div className="w-full aspect-video rounded-xl overflow-hidden flex items-center justify-center bg-gray-900 text-white text-center">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  title="Project video"
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <p className="text-gray-400 font-medium">
                  Please add a YouTube link to this video card.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default VideoGallery;
