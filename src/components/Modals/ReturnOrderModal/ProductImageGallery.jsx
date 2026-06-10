import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useRef, useState } from "react";

export default function ProductImageGallery({ product }) {
  const images = product.returnImages || [];
  const [active, setActive] = useState(0);
  const baseUrl = import.meta.env.VITE_BASEURL;
  const videoRef = useRef();
  const [isPaused, setIsPaused] = useState(true);

  if (!images.length) return null;

  if (!images.length) return null;

  // file type detect
  const isVideo = (src) =>
    src.endsWith(".mp4") || src.endsWith(".webm") || src.endsWith(".ogg");

  return (
    <div>
      {" "}
      <div className="border rounded-lg p-4">
        {/* Info */}
        <h3 className="font-semibold text-lg">{product.product_name}</h3>
        <p>
          <span className="text-sm text-gray-600 my-2 font-semibold">
            Reason: {product.returnReason}
          </span>
        </p>
        <p>
          <span className="text-sm text-gray-600 mb-2 font-semibold">
            Seller: {product.seller_store_name}
          </span>
        </p>
        <div className="flex justify-start items-center mb-2">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize text-green-600 bg-green-100 border-green-300 `}
          >
            Status: {product.order_status}
          </span>
        </div>

        {/* Main Viewer */}
        <div className="relative bg-black rounded-lg overflow-hidden h-[280px] flex items-center justify-center">
          {isVideo(images[active]) ? (
            <div className="relative flex-1 flex items-center justify-center">
              <div className="relative group w-full h-[240px] sm:h-[300px] md:h-[350px] lg:h-[400px] flex items-center justify-center bg-gray-100 rounded-2xl overflow-hidden">
                <video
                  ref={videoRef}
                  src={`${baseUrl}${images[active]}`}
                  className="w-full h-full object-fill rounded-2xl transition-transform duration-300 group-hover:scale-105"
                  controlsList="nodownload noremoteplayback"
                  disablePictureInPicture
                  onEnded={() => setIsPaused(true)}
                />

                <button
                  onClick={() => {
                    if (videoRef.current.paused) {
                      videoRef.current.play();
                      setIsPaused(false);
                    } else {
                      videoRef.current.pause();
                      setIsPaused(true);
                    }
                  }}
                  className="absolute inset-0 m-auto flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:bg-gray-500/60 text-gray-200 p-3 rounded-full shadow-md transition duration-200 ease-in-out w-16 h-16"
                >
                  {isPaused ? <Play size={20} /> : <Pause size={20} />}
                </button>
              </div>
            </div>
          ) : (
            <img
              src={`${baseUrl}${images[active]}`}
              className="w-full h-full max-w-full max-h-full object-fill transition-all duration-300"
            />
          )}

          {images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setActive(active === 0 ? images.length - 1 : active - 1)
                }
                className="absolute left-2 bg-black/50 text-white p-2 rounded-full"
              >
                <ChevronLeft />
              </button>

              <button
                onClick={() =>
                  setActive(active === images.length - 1 ? 0 : active + 1)
                }
                className="absolute right-2 bg-black/50 text-white p-2 rounded-full"
              >
                <ChevronRight />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {images.map((src, i) => (
            <div
              key={i}
              onClick={() => setActive(i)}
              className={`cursor-pointer border rounded ${
                i === active ? "border-[#FF0055]" : "border-gray-300"
              }`}
            >
              {isVideo(src) ? (
                <video
                  src={`${baseUrl}${src}`}
                  className="w-20 h-20 object-cover rounded"
                />
              ) : (
                <img
                  src={`${baseUrl}${src}`}
                  className="w-20 h-20 object-cover rounded"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
