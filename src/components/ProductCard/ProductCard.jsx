import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import Rating from "react-rating";
import { HashLink } from "react-router-hash-link";

export default function ProductCard({ item, fromFlashSale = false }) {
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
    <>
      <HashLink
        to={`/product/${btoa(item.id)}#`}
        state={fromFlashSale ? { fromFlashSale: true } : {}}
      >
        <Card className="rounded-2xl md:shadow shadow-md  bg-white overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300 flex flex-col h-full ">
          <div className="relative">
            {item.thumbnail || (item.images && item.images[0]) ? (
              <figure className=" aspect-[1/1] ">
                <img
                  src={`${baseUrl}${item.thumbnail ? item.thumbnail : getImages(item.images)[0]}`}
                  alt=""
                  className="w-full h-full object-fill rounded-t-2xl transition-transform duration-300 group-hover:scale-105"
                />
              </figure>
            ) : (
              <div className="w-full  flex items-center justify-center text-gray-400 h-65 sm:h-56 object-cover rounded-t-2xl transition-transform duration-300 group-hover:scale-105">
                No Image
              </div>
            )}

            {item.istrending && (
              <span
                style={{
                  fontWeight: "bold",

                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
                className={`absolute ${
                  item.isbestseller && item.isnew && item.islimitedstock
                    ? "bottom-3 left-3"
                    : item.isnew
                      ? "top-3 right-3 "
                      : item.isbestseller
                        ? "top-3 left-3"
                        : item.islimitedstock
                          ? "top-3 right-3"
                          : "top-3 left-3"
                }  bg-[#FF0055] text-white text-xs font-bold px-3 py-1 rounded-full    animate-pulse`}
              >
                Trending
              </span>
            )}
            {item.islimitedstock && (
              <span
                style={{
                  fontWeight: "bold",

                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
                className={`absolute ${
                  item.isbestseller && item.isnew
                    ? "bottom-3 right-3"
                    : item.isnew
                      ? "top-3 right-3 "
                      : "top-3 left-3"
                }  bg-[#FF0055] text-white text-xs font-bold px-3 py-1 rounded-full    animate-pulse`}
              >
                Limited Stock
              </span>
            )}
            {item.isnew && (
              <span
                className="absolute top-3 left-3 bg-[#FF0055] text-white text-xs font-bold px-3 py-1 rounded-full   animate-pulse"
                style={{
                  fontWeight: "bold",

                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                New
              </span>
            )}

            {item.isbestseller && (
              <span
                className={`absolute  top-3 right-3 text-white text-xs font-bold px-3 py-1 rounded-full animate-gradient`}
                style={{
                  background: "linear-gradient(45deg, #E6C200, #E6B200)",
                  fontWeight: "bold",

                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
              >
                Best Seller
              </span>
            )}
          </div>
          <CardContent className="px-5 py-3 flex flex-col flex-1">
            {/* Image → Title : 8px */}
            <h2 className="mt-2  text-gray-800 leading-snug truncate">
              {item.product_name}
            </h2>

            {/* Title → Price : 6px */}
            <div className="flex items-center justify-between gap-2 mt-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[#FF0055] font-bold">
                  {item.sale_price > 1
                    ? `৳${item.sale_price.toLocaleString("en-IN")}`
                    : `৳${item.regular_price.toLocaleString("en-IN")}`}
                </span>

                {item.sale_price > 1 && (
                  <span className="text-gray-400 line-through  font-bold">
                    ৳{item.regular_price.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {item.discount > 0 && (
  <span className="bg-[#FF0055] text-white text-sm font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
    {item.discount}% OFF
  </span>
)}
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
          </CardContent>
        </Card>
      </HashLink>
    </>
  );
}
