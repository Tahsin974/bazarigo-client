import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import Rating from "react-rating";
import { HashLink } from "react-router-hash-link";

export default function ProductCard({ product: item, viewMode }) {
  const baseUrl = import.meta.env.VITE_BASEURL;
  const getImages = (images) => {
    return images.filter((img) => {
      const lower = img.toLowerCase();
      return !(
        lower.endsWith(".mp4") ||
        lower.endsWith(".webm") ||
        lower.endsWith(".mov")
      );
    });
  };
  return (
    <HashLink to={`/product/${btoa(item.id)}#`}>
      <Card
        className={`rounded-2xl md:shadow shadow-md hover:shadow-lg transition h-full bg-white ${
          viewMode === "list" ? "flex items-center" : ""
        }`}
      >
        <div
          className={`relative ${
            viewMode === "list" &&
            "h-48 flex-shrink-0 overflow-hidden rounded-lg"
          }`}
        >
          {item.thumbnail || (item.images && item.images[0]) ? (
            <figure
              className={`  ${
                viewMode === "list" ? "h-full w-48 " : "aspect-[1/1] "
              }`}
            >
              <img
                src={`${baseUrl}${item.thumbnail ? item.thumbnail : getImages(item.images)[0]}`}
                alt=""
                className={`  h-full w-full object-fill rounded-t-2xl transition-transform duration-300 group-hover:scale-105`}
              />
            </figure>
          ) : (
            <div
              className={`${
                viewMode === "list" ? "h-full w-48" : "w-full h-55 sm:h-60 "
              }  flex items-center justify-center text-gray-400  object-fill rounded-t-2xl transition-transform duration-300 group-hover:scale-105`}
            >
              No Image
            </div>
          )}

          <div className={` ${viewMode === "list" && "hidden"}`}>
            {item.islimitedstock && (
              <span
                className={`absolute ${
                  item.isbestseller && item.isnew
                    ? "bottom-3 right-3"
                    : item.isnew
                      ? "top-3 right-3 "
                      : "top-3 left-3"
                }  bg-[#FF0055] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg  animate-pulse`}
              >
                Limited Stock
              </span>
            )}

            {item.isnew && (
              <span className="absolute top-3 left-3 bg-[#FF0055] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg  animate-pulse">
                New
              </span>
            )}
            {item.isbestseller && (
              <span
                className={`absolute  ${
                  item.islimitedstock && item.isnew
                    ? "top-3 left-3"
                    : item.isnew
                      ? "top-3 right-3 "
                      : item.islimitedstock
                        ? "top-3 right-3"
                        : "top-3 left-3"
                }  text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg  animate-gradient`}
                style={{
                  background:
                    "linear-gradient(90deg, #FFD700 0%, #FFFACD 100%)",
                  color: "#8B8000",
                  boxShadow: "0 2px 8px rgba(255, 215, 0, 0.3)",
                }}
              >
                Best Seller
              </span>
            )}
          </div>
        </div>
        <CardContent
          className={`p-4 ${
            viewMode === "list" ? "flex gap-4 items-center" : ""
          }`}
        >
          <div
            className={
              viewMode === "grid" ? "mt-2 space-y-1.5" : "flex-1 space-y-1.5"
            }
          >
            {/* Image → Title : 8px */}
            <h2
              className={`mt-2  text-gray-800   ${
                viewMode === "grid" ? "leading-snug truncate" : ""
              }`}
            >
              {item.product_name}
            </h2>

            {/* Title → Price : 6px */}
            <div
              className={`flex ${
                viewMode === "list" ? "flex-col items-start" : "items-center"
              } justify-between gap-1.5 mt-1`}
            >
              <div className="flex items-center gap-2 font-bold">
                <span className="text-[#FF0055] font-bold">
                  ৳
                  {item.sale_price > 1
                    ? item.sale_price.toLocaleString("en-IN")
                    : item.regular_price.toLocaleString("en-IN")}
                </span>

                {item.sale_price > 1 && (
                  <span className="text-gray-400 line-through  font-bold">
                    ৳{item.regular_price.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* list badges only */}
                <div
                  className={`${viewMode === "list" ? "flex gap-2" : "hidden"}`}
                >
                  {item.islimitedstock && (
                    <span className="bg-[#FF0055] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Limited
                    </span>
                  )}
                  {item.isnew && (
                    <span className="bg-[#FF0055] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      New
                    </span>
                  )}
                  {item.isbestseller && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full animate-gradient"
                      style={{
                        background:
                          "linear-gradient(90deg, #FFD700 0%, #FFFACD 100%)",
                        color: "#8B8000",
                      }}
                    >
                      Best
                    </span>
                  )}
                </div>

                {item.discount > 0 && (
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="bg-[#FF0055] text-white text-sm font-bold px-2 py-0.5  rounded-full whitespace-nowrap"
                  >
                    {item.discount}% OFF
                  </motion.span>
                )}
              </div>
            </div>

            {/* Price → Reviews : 8px */}

            <div className="flex items-center gap-3 mt-2">
              <Rating
                emptySymbol={<Star size={18} className="text-gray-300" />}
                fullSymbol={
                  <Star size={18} className="text-[#FFD700] fill-[#FFD700]" />
                }
                initialRating={
                  Number(item.rating) > 0
                    ? item.rating
                    : item.reviews && item.reviews.length > 0
                      ? item.reviews.reduce((a, r) => a + r.rating, 0) /
                        item.reviews.length
                      : 0
                }
                readonly
              />
              {item.sold !== undefined && (
                <span className="text-gray-500 text-sm flex items-center gap-1 whitespace-nowrap mb-0.5 font-bold">
                  • <span>{item.sold.toLocaleString()}</span> <span>Sold</span>
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </HashLink>
  );
}
