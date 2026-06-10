import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import { motion } from "framer-motion";
import ProductImageGallery from "./ProductImageGallery";

export default function ReturnOrderModal({ products, onClose }) {
  return (
    <div>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-3xl bg-white rounded shadow overflow-auto max-h-[90vh] relative"
        >
          <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#FF0055] to-[#FF7B7B] text-white">
            <h2 className="text-xl font-semibold">Return Order Products</h2>

            <button
              onClick={() => {
                onClose();
              }}
              className="hover:text-gray-200 transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
          </header>
          <div className="p-6 space-y-8">
            {products.map((product, index) => (
              <ProductImageGallery key={index} product={product} />
            ))}
          </div>

          {/* Main Image */}

          {/* Thumbnails */}

          {/* Counter */}
        </motion.div>
      </div>
    </div>
  );
}
