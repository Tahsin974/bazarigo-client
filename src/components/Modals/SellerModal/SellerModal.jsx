import { motion } from "framer-motion";
import {
  X,
  Star,
  MapPin,
  Package,
  Mail,
  Phone,
  User,
  Hash,
  CreditCard,
  Smartphone,
  FileText,
  IdCard,
  Layers,
  Store,
  Venus,
  Mars,
  Cake,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Rating from "react-rating";
import { HashLink } from "react-router-hash-link";

import { CiBank } from "react-icons/ci";
export default function SellerModal({ onClose, seller }) {
  const baseUrl = import.meta.env.VITE_BASEURL;

  const encodedId = btoa(seller.id);
  const formatter = new Intl.NumberFormat("en", {
    notation: "compact",
    compactDisplay: "short",
  });
  const reviews = seller.reviews || [];
  const ratings = (
    reviews.length > 0
      ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
      : 0
  ).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-3xl bg-white rounded shadow overflow-auto max-h-[90vh] relative"
      >
        {/* Close Button */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#FF0055] to-[#FF7B7B] text-white">
          <h2 className="text-xl font-semibold">Seller Info </h2>
          <button
            onClick={onClose}
            className="hover:text-gray-200 transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </header>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center md:gap-6 gap-2 p-6 border-b justify-between">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img
              src={
                seller?.img
                  ? `${baseUrl}${seller.img}`
                  : "https://placehold.co/100x100?text=Seller"
              }
              alt={`${seller.full_name} Logo`}
              className="w-24 h-24 rounded-full object-cover border-4 border-[#FF0055] shadow-md"
            />

            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-800">
                {seller.full_name}
              </h2>

              <div className="flex items-center justify-center md:justify-start gap-1 mt-2">
                <Rating
                  emptySymbol={<Star size={20} className=" text-gray-300" />}
                  fullSymbol={
                    <Star size={20} className="text-[#FFD700] fill-[#FFD700]" />
                  }
                  initialRating={ratings}
                  readonly
                />
                <span className="text-sm text-gray-500 ml-1">
                  ({ratings}/5 • {formatter.format(reviews.length)} reviews)
                </span>
              </div>
            </div>
          </div>
          <HashLink
            to={`/seller-page/${seller.store_name}/store?id=${encodedId}#`}
          >
            <Button className="px-3 py-2 bg-orange-400 hover:bg-orange-500 text-white rounded  cursor-pointer">
              Visit Store
            </Button>
          </HashLink>
        </div>

        {/* Seller Info */}
        <main className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
              <Mail className="text-[#FF0055]" size={20} />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-800">{seller.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
              <Phone className="text-[#FF0055]" size={20} />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-800">
                  {seller?.phone_number ? seller.phone_number : "Not Provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
              <Cake className="text-[#FF0055]" size={20} />
              <div>
                <p className="text-sm text-gray-500">Birthday</p>
                <p className="font-medium text-gray-800">
                  {seller.date_of_birth
                    ? new Date(seller.date_of_birth).toLocaleDateString("en-GB")
                    : "Not Provided"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
              {seller.gender ? (
                seller.gender === "Male" ? (
                  <Mars className="text-[#FF0055]" size={20} />
                ) : (
                  <Venus className="text-[#FF0055]" size={20} />
                )
              ) : (
                <div className="w-5 h-5 rounded-full bg-gray-300" /> // unknown gender icon
              )}
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium text-gray-800">
                  {seller.gender || "Not Specified"}
                </p>
              </div>
            </div>

            <>
              <h4 className="font-semibold text-gray-800 my-3 sm:col-span-2 border-l-4 border-l-[#FF0055] pl-3">
                Business Information
              </h4>
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                <Store className="text-[#FF0055]" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Store Name</p>
                  <p className="font-medium text-gray-800">
                    {seller?.store_name ? seller.store_name : "Not Provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                <Layers className="text-[#FF0055]" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Main Product Category</p>
                  <p className="font-medium text-gray-800">
                    {seller?.product_category
                      ? seller.product_category
                      : "Not Provided"}
                  </p>
                </div>
              </div>
            </>

            <>
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                <IdCard className="text-[#FF0055]" size={20} />

                <div>
                  <p className="text-sm text-gray-500">NID Number</p>
                  <p className="font-medium text-gray-800">
                    {seller?.nid_number ? seller.nid_number : "Not Provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                <FileText className="text-[#FF0055]" size={20} />

                <div>
                  <p className="text-sm text-gray-500">Trade License Number</p>
                  <p className="font-medium text-gray-800">
                    {seller?.trade_license_number
                      ? seller.trade_license_number
                      : "Not Provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm sm:col-span-2">
                <MapPin className="text-[#FF0055]" size={20} />
                <div>
  <p className="text-sm text-gray-500">Business Address</p>
  <p className="font-medium text-gray-800">
    {seller?.business_address ||
    seller?.thana ||
    seller?.district ||
    seller?.division
      ? `${seller.business_address || ""}${
          seller.business_address && seller.thana ? ", " : ""
        }${seller.thana || ""}${
          (seller.business_address || seller.thana) && seller.district
            ? ", "
            : ""
        }${seller.district || ""}${
          (seller.business_address || seller.thana || seller.district) &&
          seller.division
            ? ", "
            : ""
        }${seller.division || ""}`
      : "Not Provided"}
  </p>
</div>
              </div>
              <h4 className="font-semibold text-gray-800 my-3 sm:col-span-2 border-l-4 border-l-[#FF0055] pl-3">
                Payment Information
              </h4>
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                <Smartphone className="text-[#FF0055]" size={20} />

                <div>
                  <p className="text-sm text-gray-500">Mobile Bank Name</p>
                  <p className="font-medium text-gray-800">
                    {seller?.mobile_bank_name
                      ? seller.mobile_bank_name
                      : "Not Provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                <CreditCard className="text-[#FF0055]" size={20} />
                <div>
                  <p className="text-sm text-gray-500">
                    Mobile Banking Account Number
                  </p>
                  <p className="font-medium text-gray-800">
                    {seller?.mobile_bank_account_number
                      ? seller.mobile_bank_account_number
                      : "Not Provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                <CiBank className="text-[#FF0055]" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Bank Name</p>
                  <p className="font-medium text-gray-800">
                    {seller?.bank_name ? seller.bank_name : "Not Provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                <MapPin className="text-[#FF0055]" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Branch Name</p>
                  <p className="font-medium text-gray-800">
                    {seller?.branch_name ? seller.branch_name : "Not Provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                <User className="text-[#FF0055]" size={20} />
                <div>
                  <p className="text-sm text-gray-500">
                    Bank Account Holder Name
                  </p>
                  <p className="font-medium text-gray-800">
                    {seller?.account_holder_name
                      ? seller.account_holder_name
                      : "Not Provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                <CreditCard className="text-[#FF0055]" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Bank Account Number</p>
                  <p className="font-medium text-gray-800">
                    {seller?.account_number
                      ? seller.account_number
                      : "Not Provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                <Hash className="text-[#FF0055]" size={20} />
                <div>
                  <p className="text-sm text-gray-500">
                    Bank Routing Number / IFSC
                  </p>
                  <p className="font-medium text-gray-800">
                    {seller?.routing_number
                      ? seller.routing_number
                      : "Not Provided"}
                  </p>
                </div>
              </div>
              <h4 className="font-semibold text-gray-800 my-3 sm:col-span-2 border-l-4 border-l-[#FF0055] pl-3">
                NID Documents
              </h4>
              <div className="flex flex-col justify-center gap-2 ">
                <span className="font-semibold  text-gray-600 text-center">
                  NID Front:
                </span>
                <img src={`${baseUrl}${seller.nid_front_file}`} alt="" />
              </div>
              <div className="flex flex-col justify-center gap-2 ">
                <span className="font-semibold  text-gray-600 text-center">
                  NID Back:
                </span>
                <img src={`${baseUrl}${seller.nid_back_file}`} alt="" />
              </div>
            </>
          </div>
        </main>

        {/* Action Buttons */}
        <div className="bg-gray-50 p-6 flex  justify-end gap-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-3 py-1 rounded text-white bg-[#f72c2c] hover:bg-[#e92323]"
          >
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
