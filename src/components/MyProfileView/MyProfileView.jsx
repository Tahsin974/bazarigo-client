import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  ShoppingBag,
  Cake,
  Mars,
  Venus,
  IdCard,
  FileText,
  Smartphone,
  CreditCard,
  Hash,
  Store,
  Layers,
  Asterisk,
} from "lucide-react";
import { motion } from "framer-motion";
import useAuth from "../../Utils/Hooks/useAuth";
import { CiBank } from "react-icons/ci";
export default function MyProfileView({ activeTab }) {
  const baseUrl = import.meta.env.VITE_BASEURL;

  const { user } = useAuth();
  return (
    <div>
      {activeTab === "My Account" && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-3xl mx-auto bg-white rounded shadow "
        >
          {/* Content */}
          <main className="p-6 space-y-6">
            <div className="flex flex-col items-center gap-6">
              {user?.img || user?.profile_img ? (
                <figure>
                  <img
                    className="w-40 h-40 rounded-full"
                    src={`${baseUrl}${user?.img || user?.profile_img}`}
                    alt={user?.name || user.full_name}
                  />
                </figure>
              ) : (
                <div className="w-40 h-40 rounded-full bg-[#FFE5E5] flex items-center justify-center text-[#FF0055] text-3xl font-bold">
                  {(user?.name || user.full_name).charAt(0)}
                </div>
              )}

              <div className="text-center sm:text-left">
                <h3 className="text-2xl font-semibold text-gray-800">
                  {user?.name || user.full_name}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                <Mail className="text-[#FF0055]" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-800">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                <Phone className="text-[#FF0055]" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium text-gray-800">
                    {user?.phone || user?.phone_number
                      ? user.phone || user.phone_number
                      : "Not Provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                <Cake className="text-[#FF0055]" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Birthday</p>
                  <p className="font-medium text-gray-800">
                    {user.date_of_birth
                      ? new Date(user.date_of_birth).toLocaleDateString("en-GB")
                      : "Not Provided"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                {user.gender ? (
                  user.gender === "Male" ? (
                    <Mars className="text-[#FF0055]" size={20} />
                  ) : user.gender === "Female" ? (
                    <Venus className="text-[#FF0055]" size={20} />
                  ) : (
                    <Asterisk className="text-[#FF0055]" size={20} /> // Other gender
                  )
                ) : (
                  <div className="w-5 h-5 rounded-full bg-gray-300" /> // Unknown gender
                )}
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="font-medium text-gray-800">
                    {user.gender || "Not Specified"}
                  </p>
                </div>
              </div>
              {user.role !== "seller" && (
                <>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm sm:col-span-2">
                    <MapPin className="text-[#FF0055]" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium text-gray-800">
                        {user?.address ||
                        user?.thana ||
                        user?.district ||
                        user?.division
                          ? `${user?.address || ""}${
                              user.address && user.thana ? ", " : ""
                            }${user?.thana || ""}${
                              (user.address || user.thana) && user.district
                                ? ", "
                                : ""
                            }${user?.district || ""}${
                              (user.address || user.thana || user.district) &&
                              user.division
                                ? ", "
                                : ""
                            }${user?.division || ""}`
                          : "Not Provided"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm sm:col-span-2">
                      <MapPin className="text-[#FF0055]" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">
                          Business Address
                        </p>
                        <p className="font-medium text-gray-800">
                          {user?.business_address ||
                          user?.thana ||
                          user?.district ||
                          user?.division
                            ? `${user?.business_address || ""}${
                                user.business_address && user.thana ? ", " : ""
                              }${user?.thana || ""}${
                                (user.business_address || user.thana) &&
                                user.district
                                  ? ", "
                                  : ""
                              }${user?.district || ""}${
                                (user.business_address ||
                                  user.thana ||
                                  user.district) &&
                                user.division
                                  ? ", "
                                  : ""
                              }${user?.division || ""}`
                            : "Not Provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {(user.role === "seller" || user.role === "super admin") && (
                <>
                  <h4 className="font-semibold text-gray-800 my-3 sm:col-span-2 border-l-4 border-l-[#FF0055] pl-3">
                    Business Information
                  </h4>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                    <Store className="text-[#FF0055]" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Store Name</p>
                      <p className="font-medium text-gray-800">
                        {user?.store_name ? user.store_name : "Not Provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                    <Layers className="text-[#FF0055]" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">
                        Main Product Category
                      </p>
                      <p className="font-medium text-gray-800">
                        {user?.product_category
                          ? user.product_category
                          : "Not Provided"}
                      </p>
                    </div>
                  </div>
                </>
              )}
              {user.role === "seller" && (
                <>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                    <IdCard className="text-[#FF0055]" size={20} />

                    <div>
                      <p className="text-sm text-gray-500">NID Number</p>
                      <p className="font-medium text-gray-800">
                        {user?.nid_number ? user.nid_number : "Not Provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                    <FileText className="text-[#FF0055]" size={20} />

                    <div>
                      <p className="text-sm text-gray-500">
                        Trade License Number
                      </p>
                      <p className="font-medium text-gray-800">
                        {user?.trade_license_number
                          ? user.trade_license_number
                          : "Not Provided"}
                      </p>
                    </div>
                  </div>

                  {user.role === "seller" && (
                    <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm sm:col-span-2">
                      <MapPin className="text-[#FF0055]" size={20} />
                      <div>
                        <p className="text-sm text-gray-500">
                          Business Address
                        </p>
                        <p className="font-medium text-gray-800">
                          {user?.business_address ||
                          user?.thana ||
                          user?.district ||
                          user?.division
                            ? `${user?.business_address || ""}${
                                user.business_address && user.thana ? ", " : ""
                              }${user?.thana || ""}${
                                (user.business_address || user.thana) &&
                                user.district
                                  ? ", "
                                  : ""
                              }${user?.district || ""}${
                                (user.business_address ||
                                  user.thana ||
                                  user.district) &&
                                user.division
                                  ? ", "
                                  : ""
                              }${user?.division || ""}`
                            : "Not Provided"}
                        </p>
                      </div>
                    </div>
                  )}
                  <h4 className="font-semibold text-gray-800 my-3 sm:col-span-2 border-l-4 border-l-[#FF0055] pl-3">
                    Payment Information
                  </h4>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                    <Smartphone className="text-[#FF0055]" size={20} />

                    <div>
                      <p className="text-sm text-gray-500">Mobile Bank Name</p>
                      <p className="font-medium text-gray-800">
                        {user?.mobile_bank_name
                          ? user.mobile_bank_name
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
                        {user?.mobile_bank_account_number
                          ? user.mobile_bank_account_number
                          : "Not Provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                    <CiBank className="text-[#FF0055]" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Bank Name</p>
                      <p className="font-medium text-gray-800">
                        {user?.bank_name ? user.bank_name : "Not Provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                    <MapPin className="text-[#FF0055]" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">Branch Name</p>
                      <p className="font-medium text-gray-800">
                        {user?.branch_name ? user.branch_name : "Not Provided"}
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
                        {user?.account_holder_name
                          ? user.account_holder_name
                          : "Not Provided"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                    <CreditCard className="text-[#FF0055]" size={20} />
                    <div>
                      <p className="text-sm text-gray-500">
                        Bank Account Number
                      </p>
                      <p className="font-medium text-gray-800">
                        {user?.account_number
                          ? user.account_number
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
                        {user?.routing_number
                          ? user.routing_number
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
                    <img src={`${baseUrl}${user.nid_front_file}`} alt="" />
                  </div>
                  <div className="flex flex-col justify-center gap-2 ">
                    <span className="font-semibold  text-gray-600 text-center">
                      NID Back:
                    </span>
                    <img src={`${baseUrl}${user.nid_back_file}`} alt="" />
                  </div>
                </>
              )}
            </div>
          </main>
        </motion.div>
      )}
    </div>
  );
}
