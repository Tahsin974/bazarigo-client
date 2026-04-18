import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { HashLink } from "react-router-hash-link";
import Swal from "sweetalert2";
import useAxiosPublic from "../../Utils/Hooks/useAxiosPublic";
import useAuth from "../../Utils/Hooks/useAuth";
import useCart from "../../Utils/Hooks/useCart";

export default function OrderSummary({
  items,
  isCashOnDelivery,
  allowPromo,
  refetch,
  paymentMethod,
  mobileBankNumber,
}) {
  const axiosPublic = useAxiosPublic();
  const [promoCode, setPromoCode] = useState(null);
  const [appliedPromo, setAppliedPromo] = useState({ code: null, discount: 0 });
  const location = useLocation();
  const navigate = useNavigate();

  const { user } = useAuth();
  const { refetch: refetchCarts } = useCart();

  const applyPromo = async () => {
    if (!promoCode) return;

    try {
      const res = await axiosPublic.post("/apply-promo", {
        userId: user.id,
        code: promoCode,
      });

      setAppliedPromo({
        code: promoCode,
        discount: res.data.discount || 0,
      });

      Swal.fire({
        icon: "success",
        title: res.data.message,
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 1500,
      });

      setPromoCode("");
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Something went wrong!",
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  const orderItems = items.flatMap((item) => {
    const productInfo = item.productinfo.map((prod) => {
      const product = {
        ...prod,
        order_status: "Processing",
      };
      return product;
    });

    return {
      ...item,
      productinfo: productInfo,
    };
  });

  const subtotal = items.reduce((cartSum, item) => {
    const itemTotal = item.productinfo.reduce((sum, prod) => {
      const price = prod.sale_price > 0 ? prod.sale_price : prod.regular_price;
      return sum + prod.qty * price;
    }, 0);

    return cartSum + itemTotal;
  }, 0);

  const deliveryPerItem = items.reduce(
    (sum, item) => sum + item.deliveries.total_delivery_charge,
    0,
  );
  // fresh subtotal + delivery
  let baseTotal = subtotal + deliveryPerItem;

  // appliedPromo শুধু টাকার মান (discount)
  let total = appliedPromo.discount
    ? Math.max(0, baseTotal - (baseTotal * appliedPromo.discount) / 100)
    : baseTotal;

  const handleOrderBtn = async () => {
    try {
      const paymentPayload = {
        payment_date: new Date().toLocaleString("en-CA", {
          timeZone: "Asia/Dhaka",
          hour12: false,
        }),
        amount: total,
        payment_method: isCashOnDelivery ? "Cash on Delivery" : paymentMethod,
        payment_status: "pending",
        phoneNumber: isCashOnDelivery ? user?.phone : mobileBankNumber,
      };
      const payload = {
        orderDate: new Date().toLocaleString("en-CA", {
          timeZone: "Asia/Dhaka",
          hour12: false,
        }),
        paymentMethod: isCashOnDelivery ? "Cash on Delivery" : paymentMethod,
        paymentStatus: "pending",
        customerId: user.id,
        customerEmail: user.email,
        customerPhone: mobileBankNumber || user?.phone,
        customerName: user?.name,
        customerAddress:
          [user?.address, user?.thana, user?.district]
            .filter(Boolean)
            .join(", ") + (user?.division ? ` - ${user.division}` : ""),

        orderItems: orderItems,
        subtotal,
        deliveryCharge: deliveryPerItem,
        total,
      };

      const res = await axiosPublic.post(`/orders`, {
        payload,
        paymentPayload,
        promoCode: appliedPromo.code,
        userId: user.id,
      });

      if (res.data.createdCount > 0) {
        Swal.fire({
          icon: "success",
          title: "Order Placed Successfully",
          showConfirmButton: false,
          toast: true,
          position: "top",
          timer: 1500,
        });
      }
      refetchCarts();
      return navigate("/");
    } catch (err) {
      if (err.response) {
        return Swal.fire({
          icon: "error",
          title: `${err.response.data.message}`,
          showConfirmButton: false,
          toast: true,
          position: "top",
          timer: 1500,
        });
      }
      return Swal.fire({
        icon: "error",
        title: "Something went wrong!",
        showConfirmButton: false,
        toast: true,
        position: "top",
        timer: 1500,
      });
    }
  };

  useEffect(() => {
    const fetchAndUpdateDelivery = async () => {
      try {
        await Promise.all(
          items.map(async (item) => {
            // seller এর total weight
            const totalWeight = item.productinfo.reduce(
              (sum, prod) => sum + (parseFloat(prod.weight) || 0),
              0,
            );
            const newSubtotal = item.productinfo.reduce((sum, prod) => {
              const price =
                prod.sale_price && Number(prod.sale_price) > 0
                  ? Number(prod.sale_price)
                  : Number(prod.regular_price);

              return sum + prod.qty * price;
            }, 0);

            // Delivery API call
            const res = await axiosPublic.get("/deliveries", {
              params: {
                sellerId: item.sellerid,
                userId: user.id,
                weight: totalWeight,
                orderAmount: newSubtotal,
                isCod: isCashOnDelivery,
              },
            });

            const deliveries = res.data.result[0] || {};

            // Backend update call
            await axiosPublic.patch("/carts", {
              cartId: item.cartid,
              deliveries,
            });

            return { ...item, deliveries };
          }),
        );

        // যদি state রাখতে চাও
        // setItemsWithDeliveries(updatedItems);
      } catch (err) {
        console.error("Error fetching or updating deliveries:", err);
      }
    };

    fetchAndUpdateDelivery();
    refetch();
  }, [isCashOnDelivery]);

  // Fetch active promo on load
  useEffect(() => {
    const fetchAppliedPromo = async () => {
      try {
        const res = await axiosPublic.get(`/user-promotions/${user.id}/active`);
        if (res.data.promo) {
          setAppliedPromo({
            code: res.data.promo.code,
            discount: res.data.promo.discount,
          });
        }
      } catch (err) {
        console.error("Failed to fetch applied promo:", err);
      }
    };
    fetchAppliedPromo();
  }, []);

  return (
    <>
      <Card className="rounded-2xl shadow bg-white">
        <CardContent className="md:p-6 p-4 space-y-4 sm:text-base text-sm">
          <h2 className="text-xl font-semibold text-gray-800">Order Summary</h2>

          <div className="divide-y">
            <div className="pb-3">
              {items.map((item) => (
                <div key={item.cartid}>
                  {item.productinfo.map((prod) => (
                    <div
                      key={prod.product_Id}
                      className="flex justify-between py-3 text-gray-700"
                    >
                      <h2 className="leading-snug truncate max-w-60">
                        {prod.product_name || "Empty"}{" "}
                        <span className="text-sm text-gray-500">
                          {prod.qty > 1 && <span>(x{prod.qty})</span>}
                        </span>
                      </h2>
                      <h2>
                        ৳
                        {(
                          (prod.sale_price > 0
                            ? prod.sale_price
                            : prod.regular_price) * prod.qty
                        ).toLocaleString("en-IN")}
                      </h2>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600 mt-4">
                <h2>Subtotal</h2>
                <h2>৳{subtotal.toLocaleString("en-IN") || 0}</h2>
              </div>
              <div className="flex justify-between text-gray-600">
                <h2>Delivery Charges</h2>
                <h2>৳ {deliveryPerItem || 0}</h2>
              </div>
            </div>
          </div>

          {isCashOnDelivery && (
            <div className="flex justify-center text-gray-600">
              <h2>Cash On Delivery</h2>
            </div>
          )}

          <div className="flex justify-between font-bold text-gray-800 sm:text-lg text-base border-t pt-4">
            <h2>Total</h2>
            <h2>৳{total.toLocaleString("en-IN") || 0}</h2>
          </div>
          {allowPromo && (
            <div className="mt-4">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap gap-2">
                  <input
                    type="text"
                    placeholder="Promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-4 py-2 border rounded-lg focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none w-full sm:w-auto"
                  />
                  <Button
                    disabled={!items?.length || !promoCode}
                    onClick={applyPromo}
                    className="bg-[#00C853] text-white px-4 py-2 rounded-md hover:bg-[#00B34A] transition cursor-pointer disabled:bg-gray-300 disabled:text-gray-500"
                  >
                    Apply
                  </Button>
                </div>
                {appliedPromo.code && appliedPromo.is_used && (
                  <p className="text-green-600 mt-1">
                    Promo code applied: {appliedPromo.discount}% off
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!location.pathname.includes("cart") ? (
        <Button
          disabled={
            !items?.length ||
            !user?.name ||
            !user?.address ||
            !user?.district ||
            !user?.thana ||
            !user?.division ||
            !user?.phone ||
            (!isCashOnDelivery && !mobileBankNumber && paymentMethod === "")
          }
          onClick={handleOrderBtn}
          className="w-full mt-6 bg-[#00C853] text-white py-3 rounded-full hover:bg-[#00B34A] transition disabled:bg-gray-300 disabled:text-gray-500"
        >
          Place Order
        </Button>
      ) : (
        <HashLink to={"/checkout#"} state={{ items: items }}>
          <Button
            disabled={!items?.length}
            className="w-full mt-6 bg-[#00C853] text-white py-3 rounded-full hover:bg-[#00B34A] transition disabled:bg-gray-300 disabled:text-gray-500 "
          >
            Proceed Checkout
          </Button>
        </HashLink>
      )}
    </>
  );
}
