import { Card, CardContent } from "@/components/ui/card";
import OrderSummary from "../../components/OrderSummary/OrderSummary";
import SelectField from "../../components/ui/SelectField";
import { useEffect, useState } from "react";
import bKash from "../../assets/payments/bkash.png";
import Rocket from "../../assets/payments/rocket.jpeg";
import Nagad from "../../assets/payments/nagad.png";
import useCart from "../../Utils/Hooks/useCart";
import { HandCoins, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { useLocation } from "react-router";
import useAxiosPublic from "../../Utils/Hooks/useAxiosPublic";
import useAuth from "../../Utils/Hooks/useAuth";
import AddBtn from "../../components/ui/AddBtn";
import Loading from "../../components/Loading/Loading";
import useAddress from "../../Utils/Hooks/useAddress";

export default function CheckOutPage() {
  const axiosPublic = useAxiosPublic();
  const { user, refreshUser, isLoading } = useAuth();
  const { refetch } = useCart();
  const [customerName, setCustomerName] = useState(null);
  const [customerAddress, setCustomerAddress] = useState(null);
  const [customerDistrict, setCustomerDistrict] = useState(
    user?.district || "",
  );
  const [customerThana, setCustomerThana] = useState(user?.thana || "");
  const [customerDivision, setCustomerDivision] = useState(
    user?.division || "",
  );
  const [customerPhone, setCustomerPhone] = useState("");

  const location = useLocation();
  const items =
    location.state && location.state.items ? location.state.items : [];

  const [checkoutItems, setCheckoutItems] = useState(items);

  const baseUrl = import.meta.env.VITE_BASEURL;

  const [provider, setProvider] = useState("");
  const [mobileBankNumber, setMobileBankNumber] = useState("");

  const [isCashOnDelivery, setIsCashOnDelivery] = useState(false);
  const {
    divisions,
    divisionsLoading,
    districts,
    districtsLoading,
    thanas,
    thanasLoading,
  } = useAddress(customerDivision, customerDistrict);
  const handleDivisionChange = (e) => {
    setCustomerDivision(e.target.value);
    setCustomerDistrict(""); // cascade reset
    setCustomerThana("");
  };

  const handleDistrictChange = (e) => {
    setCustomerDistrict(e.target.value);
    setCustomerThana(""); // cascade reset
  };
  const removeItem = async (cartId, productId) => {
    try {
      // 🔹 কনফার্মেশন ডায়ালগ দেখাও
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This product will be removed from your cart.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#00C853",
        cancelButtonColor: "#f72c2c",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      });

      // 🔹 ইউজার কনফার্ম করলে ডিলিট রিকোয়েস্ট পাঠাও
      if (result.isConfirmed) {
        const { data } = await axiosPublic.patch("/carts/remove-product", {
          cartId,
          productId,
        });

        if (data.deletedCount) {
          await Swal.fire({
            title: "Removed!",
            text: "Product has been removed successfully.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            toast: true,
            position: "top",
          });
          refetch();
        }
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error!",
        text: "Something went wrong while removing the product.",
        icon: "error",
        showConfirmButton: false,
        toast: true,
        position: "top",
      });
    }
  };
  function getEstimatedDelivery(orderDateStr, timeStr) {
    const orderDate = new Date(orderDateStr);
    orderDate.setDate(orderDate.getDate() + 3);
    let minDays = 0;
    let maxDays = 0;

    const match = timeStr.match(/(\d+)-(\d+)/);
    if (match) {
      // minDays = parseInt(match[1], 10);
      maxDays = parseInt(match[2], 10);
    } else {
      // যদি শুধু এক দিন থাকে "1 day"
      const singleMatch = timeStr.match(/(\d+)/);
      if (singleMatch) {
        // minDays = parseInt(singleMatch[1], 10);
        maxDays = minDays;
      }
    }

    const minDate = new Date(orderDate);
    minDate.setDate(minDate.getDate() + minDays);

    const maxDate = new Date(orderDate);
    maxDate.setDate(maxDate.getDate() + maxDays);

    const options = { month: "short", day: "numeric" };
    return `${minDate.toLocaleDateString(
      "en-US",
      options,
    )} – ${maxDate.toLocaleDateString("en-US", options)}`;
  }

  const handleSave = async () => {
    try {
      const payload = {
        ...user,
        full_name: customerName || user.name,
        address: customerAddress || user.address,
        division: customerDivision || user.division,
        district: customerDistrict || user.district,
        thana: customerThana || user.thana,
        phone: customerPhone || user.phone,
      };

      const res = await axiosPublic.put(`/users/update/${user.id}`, payload);

      if (res.data.updatedCount > 0) {
        await refreshUser();

        // 🔥 এখানে delivery পুনরায় ক্যালকুলেশন শুরু
        const updatedItems = await Promise.all(
          checkoutItems.map(async (item) => {
            const product = item.productinfo[0];

            const deliveryPayload = {
              sellerId: item.sellerid,
              userId: user.id,
              weight: product.weight,
              orderAmount:
                product.sale_price > 1
                  ? product.sale_price
                  : product.regular_price,
            };

            const deliveryRes = await axiosPublic.get("/deliveries", {
              params: deliveryPayload,
            });

            return {
              ...item,
              deliveries: deliveryRes.data.result[0],
            };
          }),
        );

        setCheckoutItems(updatedItems);

        Swal.fire({
          icon: "success",
          title: "Updated!",
          text: "Address updated.",
          toast: true,
          timer: 1500,
          position: "top",
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: `${error.response?.data?.message}`,
        showConfirmButton: false,
        toast: true,
        position: "top",
        timer: 1500,
      });
    }
  };
  useEffect(() => {
    if (user && Array.isArray(user.payment_methods)) {
      const primaryMethod = user.payment_methods.find((pm) => pm.is_primary);
      if (primaryMethod) {
        setProvider(primaryMethod.provider);
        setCustomerPhone(primaryMethod.account);
      }
    }
  }, [user]);

  return (
    <div className="bg-[#f7f7f8] ">
      {!checkoutItems.length && !isLoading && !user ? (
        <Loading />
      ) : (
        <div className="container mx-auto xl:px-6 lg:px-6  px-2 md:py-10 py-6 ">
          <h1 className="text-3xl font-bold text-gray-600 mb-8">Checkout</h1>
          <div className="flex  lg:flex-row flex-col gap-10">
            <div className="flex-1 space-y-6">
              <Card className="rounded-2xl shadow-md bg-white">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold">Billing Information</h2>
                  <input
                    type="text"
                    placeholder="Full Name"
                    name="name"
                    defaultValue={user?.name || customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF0055]"
                  />
                  <input
                    placeholder="Phone Number"
                    name="number"
                    defaultValue={user?.phone || customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                        e.preventDefault(); // keyboard up/down disable
                      }
                    }}
                    onWheel={(e) => e.target.blur()}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF0055]"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    name="address"
                    defaultValue={user?.address || customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF0055]"
                  />

                  <div className="flex flex-wrap gap-3">
                    {" "}
                    {/* Division */}
                    <div className="w-full">
                      <SelectField
                        selectValue={customerDivision}
                        selectValueChange={handleDivisionChange}
                        isWide={true}
                        required
                      >
                        <option value="" disabled>
                          {divisionsLoading ? "Loading..." : "Select Division"}
                        </option>
                        {divisions.map((div) => (
                          <option key={div} value={div}>
                            {div}
                          </option>
                        ))}
                      </SelectField>
                    </div>
                    {/* District */}
                    <div className="w-full">
                      <SelectField
                        selectValue={customerDistrict}
                        selectValueChange={handleDistrictChange}
                        isWide={true}
                        required
                        disabled={!customerDivision || districtsLoading}
                      >
                        <option value="" disabled>
                          {districtsLoading
                            ? "Loading..."
                            : !customerDivision
                              ? "Select Division first"
                              : "Select District"}
                        </option>
                        {districts.map((dist) => (
                          <option key={dist} value={dist}>
                            {dist}
                          </option>
                        ))}
                      </SelectField>
                    </div>
                    {/* Thana */}
                    <div className="w-full">
                      <SelectField
                        selectValue={customerThana}
                        selectValueChange={(e) =>
                          setCustomerThana(e.target.value)
                        }
                        isWide={true}
                        required
                        disabled={!customerDistrict || thanasLoading}
                      >
                        <option value="" disabled>
                          {thanasLoading
                            ? "Loading..."
                            : !customerDistrict
                              ? "Select District first"
                              : "Select Thana"}
                        </option>
                        {thanas.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </SelectField>
                    </div>
                  </div>

                  <AddBtn btnHandler={handleSave}>Save</AddBtn>
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-md bg-white">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold">Payment Information</h2>
                  <div className="space-y-2">
                    <SelectField
                      selectValue={provider || ""}
                      selectValueChange={(e) => setProvider(e.target.value)}
                      isWide={true}
                    >
                      <option value="">Select Provider</option>
                      <option value="bKash">bKash</option>
                      <option value="Nagad">Nagad</option>
                      <option value="Rocket">Rocket</option>
                    </SelectField>
                    <input
                      placeholder="Account Number (e.g., 017XXXXXXXX)"
                      name="number"
                      defaultValue={mobileBankNumber}
                      onChange={(e) => setMobileBankNumber(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                          e.preventDefault(); // keyboard up/down disable
                        }
                      }}
                      onWheel={(e) => e.target.blur()}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                    />
                    {/* --- bKash Instructions --- */}
                    {provider === "bKash" && (
                      <Card className="rounded-2xl shadow ">
                        <CardContent className="sm:p-6 p-2 space-y-4 ">
                          <div className="bg-pink-50 border border-[#FF0055] text-gray-700 rounded-xl p-4 shadow-sm relative ">
                            <h3 className="font-semibold text-[#FF0055] mb-1">
                              বিকাশে পেমেন্ট করার নিয়ম 💸
                            </h3>
                            <ol className="list-decimal list-inside space-y-1 text-base leading-relaxed">
                              <li>আপনার মোবাইলে বিকাশ অ্যাপটি খুলুন।</li>
                              <li>
                                <strong>“Send Money”</strong> অপশনটি নির্বাচন
                                করুন।
                              </li>
                              <li>
                                আমাদের বিকাশ নম্বর লিখুন:
                                <strong>01741-899559</strong>।
                              </li>
                              <li>
                                মোট টাকার পরিমাণ লিখুন (স্ক্রিনে প্রদর্শিত
                                পরিমাণ অনুযায়ী)।
                              </li>
                              <li>
                                “Reference” ঘরে আপনার অর্ডার নম্বর বা ফোন নম্বর
                                লিখুন।
                              </li>
                              <li>
                                <strong>Confirm</strong> বাটনে চাপ দিন পেমেন্ট
                                সম্পন্ন করতে।
                              </li>
                            </ol>
                            {/* <p className="text-base text-gray-600 mt-2"> পেমেন্ট সম্পন্ন করার পর নিচের  <strong>“পেমেন্ট নিশ্চিত করুন”</strong> বাটনে ক্লিক করুন। </p> */}
                            <figure>
                              <img
                                src={bKash}
                                alt="bKash"
                                className="  h-20 top-2 right-2 absolute md:flex hidden xl:flex lg:hidden"
                              />
                            </figure>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* --- Rocket Instructions --- */}
                    {provider === "Rocket" && (
                      <Card className="rounded-2xl shadow">
                        <CardContent className="sm:p-6 p-2 space-y-4">
                          <div className="bg-purple-50 border border-purple-500 text-gray-700 rounded-xl p-4 shadow-sm relative">
                            <h3 className="font-semibold text-purple-600 mb-1">
                              রকেটে পেমেন্ট করার নিয়ম 🚀
                            </h3>
                            <ol className="list-decimal list-inside space-y-1 text-base leading-relaxed">
                              <li>
                                আপনার মোবাইলে রকেট অ্যাপ বা *322# ডায়াল করুন।
                              </li>
                              <li>
                                <strong>“Send Money”</strong> অপশন নির্বাচন
                                করুন।
                              </li>
                              <li>
                                আমাদের রকেট নম্বর লিখুন:
                                <strong>01741-899559</strong>।
                              </li>
                              <li>
                                টাকার পরিমাণ লিখুন (স্ক্রিনে প্রদর্শিত পরিমাণ
                                অনুযায়ী)।
                              </li>
                              <li>“Reference” ঘরে আপনার অর্ডার নম্বর লিখুন।</li>
                              <li>আপনার পিন দিয়ে পেমেন্ট সম্পন্ন করুন।</li>
                            </ol>
                            {/* <p className="text-sm text-gray-600 mt-2"> পেমেন্ট সম্পন্ন হলে নিচের  <strong>“পেমেন্ট নিশ্চিত করুন”</strong> বাটনে ক্লিক করুন। </p> */}
                            <figure>
                              <img
                                src={Rocket}
                                alt="rocket"
                                className="  h-20 top-2 right-2 absolute md:flex hidden xl:flex lg:hidden"
                              />
                            </figure>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* --- Nagad Instructions --- */}
                    {provider === "Nagad" && (
                      <Card className="rounded-2xl shadow">
                        <CardContent className="sm:p-6 p-2  space-y-4">
                          <div className="bg-yellow-50 border border-yellow-400 text-gray-700 rounded-xl p-4 shadow-sm relative">
                            <h3 className="font-semibold text-yellow-600 mb-1">
                              নগদে পেমেন্ট করার নিয়ম 💰
                            </h3>
                            <ol className="list-decimal list-inside space-y-1 text-base leading-relaxed">
                              <li>
                                আপনার মোবাইলে নগদ অ্যাপ বা *167# ডায়াল করুন।
                              </li>
                              <li>
                                <strong>“Send Money”</strong> অপশন নির্বাচন
                                করুন।
                              </li>
                              <li>
                                আমাদের নগদ নম্বর লিখুন:
                                <strong>01741-899559</strong>।
                              </li>
                              <li>মোট টাকার পরিমাণ লিখুন।</li>
                              <li>“Reference” ঘরে আপনার অর্ডার নম্বর লিখুন।</li>
                              <li>আপনার পিন দিয়ে পেমেন্ট সম্পন্ন করুন।</li>
                            </ol>
                            {/* <p className="text-sm text-gray-600 mt-2"> পেমেন্ট সম্পন্ন হলে নিচের  <strong>“পেমেন্ট নিশ্চিত করুন”</strong> বাটনে ক্লিক করুন। </p> */}
                            <figure>
                              <img
                                src={Nagad}
                                alt="nagad"
                                className="  h-20 top-2 right-2 absolute md:flex hidden xl:flex lg:hidden"
                              />
                            </figure>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-secondary checkbox-xs rounded-sm"
                      onChange={async (e) => {
                        const codChecked = e.target.checked;
                        setIsCashOnDelivery(codChecked);

                        // 🔹 Delivery recalculation যেকোনো COD পরিবর্তনের জন্য
                        const updatedItems = await Promise.all(
                          checkoutItems.map(async (item) => {
                            const product = item.productinfo[0];

                            const deliveryPayload = {
                              sellerId: item.sellerid,
                              userId: user.id,
                              weight: product.weight,
                              orderAmount:
                                product.sale_price > 1
                                  ? product.sale_price
                                  : product.regular_price,
                              isCod: codChecked, // ✅ true বা false উভয়েই পাঠানো হচ্ছে
                            };

                            const deliveryRes = await axiosPublic.get(
                              "/deliveries",
                              {
                                params: deliveryPayload,
                              },
                            );

                            return {
                              ...item,
                              deliveries: deliveryRes.data.result[0],
                            };
                          }),
                        );

                        setCheckoutItems(updatedItems);
                      }}
                      disabled={provider !== ""}
                    />
                    Cash On Delivery
                  </label>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-5 lg:col-span-2">
                {checkoutItems?.map((checkoutItem) => (
                  <div
                    key={checkoutItem.cartid}
                    className="py-5  bg-white rounded-2xl space-y-4"
                  >
                    <div className="border border-[#FF0055] p-5 w-max me-auto rounded-2xl mx-5">
                      <div>
                        <div className="flex flex-col gap-4">
                          {checkoutItem.deliveries.total_delivery_charge ===
                          0 ? (
                            <>
                              <div className="flex gap-2 justify-center">
                                <HandCoins className="text-green-500" />
                                <span className="text-green-500  font-semibold">
                                  Free Delivery
                                </span>
                              </div>
                              <span className="text-gray-800 font-semibold">
                                Estimated Delivery :{" "}
                                {getEstimatedDelivery(
                                  new Date().toLocaleString("en-CA", {
                                    timeZone: "Asia/Dhaka",
                                    hour12: false,
                                  }),
                                  checkoutItem.deliveries.delivery_time,
                                )}
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="flex gap-2 justify-center">
                                <HandCoins className="text-green-500" />
                                <span className="text-gray-800  font-semibold">
                                  Delivery Charge ৳
                                  {
                                    checkoutItem.deliveries
                                      .total_delivery_charge
                                  }
                                </span>
                              </div>
                              <span className="text-gray-800 font-semibold">
                                Estimated Delivery :{" "}
                                {getEstimatedDelivery(
                                  new Date().toLocaleString("en-CA", {
                                    timeZone: "Asia/Dhaka",
                                    hour12: false,
                                  }),
                                  checkoutItem.deliveries.delivery_time,
                                )}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <hr class="border-t border-gray-200" />
                    {!checkoutItems.length ? (
                      <div className="h-screen flex items-center justify-center ">
                        <h1 className="text-3xl text-gray-300">
                          Your Cart Is Empty
                        </h1>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4  px-5">
                        {checkoutItem.productinfo.map((item) => (
                          <motion.div
                            key={item.product_Id}
                            whileHover={{ scale: 1.01 }}
                            className="bg-white shadow-md rounded-2xl md:p-6 p-4 flex md:items-center items-end justify-between "
                          >
                            <div className="flex md:flex-row flex-col items-center  gap-6">
                              <img
                                src={`${baseUrl}${item.product_img}`}
                                alt={item.product_name}
                                className="w-20 h-20 rounded-xl object-cover "
                              />
                              <div>
                                <h3 className="font-semibold text-gray-800 ">
                                  {item.product_name}
                                </h3>
                                <div className="flex items-center gap-2">
                                  <p className="text-[#FF0055] font-bold">
                                    {item.sale_price > 1 ? (
                                      <>
                                        ৳
                                        {item.sale_price.toLocaleString(
                                          "en-IN",
                                        )}
                                      </>
                                    ) : (
                                      <>
                                        ৳
                                        {item.regular_price.toLocaleString(
                                          "en-IN",
                                        )}
                                      </>
                                    )}
                                  </p>
                                  {item.sale_price > 1 && (
                                    <span className="text-gray-400 line-through ">
                                      ৳
                                      {item.regular_price.toLocaleString(
                                        "en-IN",
                                      )}
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                  <p className="text-xs text-gray-500">
                                    Brand: {item?.brand || "No Brand"}
                                  </p>

                                  <div className="flex gap-1.5">
                                    {Object.entries(item.variants)
                                      .filter(
                                        ([key]) =>
                                          ![
                                            "regular_price",
                                            "sale_price",
                                            "stock",
                                            "id",
                                          ].includes(key),
                                      )
                                      .map(([variant, value], index, array) => (
                                        <p
                                          className="text-xs text-gray-500"
                                          key={variant}
                                        >
                                          {variant}: {value}
                                          {index < array.length - 1 && ","}
                                        </p>
                                      ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                removeItem(checkoutItem.cartid, item.product_Id)
                              }
                              className="text-gray-500 hover:text-red-600 cursor-pointer"
                            >
                              <Trash2 size={20} />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <OrderSummary
                isCashOnDelivery={isCashOnDelivery}
                items={checkoutItems}
                mobileBankNumber={mobileBankNumber}
                allowPromo={true}
                refetch={refetch}
                paymentMethod={provider}
                setIsCashOnDelivery={setIsCashOnDelivery}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
