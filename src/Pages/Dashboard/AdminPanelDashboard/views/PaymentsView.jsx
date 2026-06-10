import Pagination from "../../../../components/ui/Pagination";
import SearchField from "../../../../components/ui/SearchField";
import FormattedDate from "../../../../Utils/Helpers/FormattedDate";
import useAxiosPublic from "../../../../Utils/Hooks/useAxiosPublic";
import { useRenderPageNumbers } from "../../../../Utils/Helpers/useRenderPageNumbers";
import { Banknote, CreditCard, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import useAuth from "../../../../Utils/Hooks/useAuth";

function PaymentsView({
  payments,
  paymentPage,
  setPaymentPage,
  paymentSearch,
  setPaymentSearch,
  paymentPageSize = 10,
  filteredPayments,
  paginatedPayments,
  refetch,
  sellerPayments,
  sellerPaymentsPage,
  setSellerPaymentsPage,
  sellerPaymentsSearch,
  setSellerPaymentsSearch,
  filteredSellerPayments,
  paginatedSellerPayments,
}) {
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPayments.length / paymentPageSize),
  );
  const sellerPaymentsTotalPages = Math.max(
    1,
    Math.ceil(filteredSellerPayments.length / paymentPageSize),
  );

  const handleApprove = async (id, orderId) => {
    const res = await axiosPublic.patch(`/payments/${id}`, {
      status: "Approved",
      orderId,
    });
    if (res.data.updatedCount > 0) {
      Swal.fire({
        icon: "success",
        title: "Payment Approved Successfully",
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        position: "top",
      });

      return refetch();
    }
  };
  const HandleDelete = async (id) => {
    try {
      Swal.fire({
        icon: "warning",
        title: "Are You Sure?",
        showCancelButton: true, // confirm + cancel button
        confirmButtonColor: "#00C853",
        cancelButtonColor: "#f72c2c",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const res = await axiosPublic.delete(`/payments/delete/${id}`);
          if (res.data.deletedCount > 0) {
            Swal.fire({
              icon: "success",
              title: "Payment Deleted Successfully",
              showConfirmButton: false,
              timer: 1500,
              toast: true,
              position: "top",
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Opps! Try Again",
              showConfirmButton: false,
              timer: 1500,
              toast: true,
              position: "top",
            });
          }
          return refetch();
        } else {
          return;
        }
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: `${error.message}`,
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        position: "top",
      });
    }
  };
  const renderPageNumbers = useRenderPageNumbers(
    paymentPage,
    totalPages,
    setPaymentPage,
  );
  const renderPageNumbersForSellerPayments = useRenderPageNumbers(
    sellerPaymentsPage,
    sellerPaymentsTotalPages,
    setSellerPaymentsPage,
  );

  return (
    <div className="space-y-10">
      <section className="flex flex-wrap   sm:items-center sm:justify-between gap-4 mb-3">
        <div className=" w-full ">
          <SearchField
            placeholder="Search payments..."
            searchValue={paymentSearch}
            searchValueChange={(e) => {
              setPaymentSearch(e.target.value);
              setPaymentPage(1);
            }}
          />
        </div>
        {/* Left: Title (and mobile button if needed) */}
        <div className="flex items-center justify-center w-full md:w-auto order-1">
          <h3 className="font-semibold sm:text-md text-[15px]">
            Payments ({payments.length})
          </h3>
        </div>

        {/* Middle: Search field */}
      </section>
      {paginatedPayments.length ? (
        <>
          <div className="overflow-x-auto bg-white rounded-box">
            <table className="table text-center">
              <thead className="bg-gray-50">
                <tr className="text-black">
                  <th>SL No. </th>
                  <th>Order ID </th>

                  <th>Date</th>

                  <th>Amount</th>
                  <th>Method</th>
                  <th>Number</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map((p, index) => (
                  <tr key={p.id} className="border-b">
                    <td>
                      <span className="font-semibold">
                        {(paymentPage - 1) * paymentPageSize + index + 1}
                      </span>
                    </td>

                    <td>
                      <span className="font-semibold">{p.order_id}</span>
                    </td>
                    <td>
                      <span className="font-semibold">
                        {new Date(p.payment_date).toLocaleDateString("en-CA", {
                          timeZone: "Asia/Dhaka",
                        })}
                      </span>
                    </td>
                    <td>
                      <span className="font-semibold">
                        ৳{p.amount.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td>
                      <span className="font-semibold">{p.payment_method}</span>
                    </td>
                    <td>
                      <span className="font-semibold">
                        {p.phone_number ? p.phone_number : "N/A"}
                      </span>
                    </td>
                    <td>
                      {p.status === "pending" ? (
                        <button
                          onClick={() => handleApprove(p.id, p.order_id)}
                          className="px-3 py-1  rounded bg-[#00C853] hover:bg-[#00B34A] text-white"
                        >
                          Approve
                        </button>
                      ) : (
                        <span className="text-green-400 font-semibold">
                          Approved
                        </span>
                      )}
                    </td>
                    <td>
                      {/* Single Delete */}
                      {user?.role === "admin" ||
                        (user?.role === "super admin" && (
                          <button
                            onClick={() => HandleDelete(p.id)}
                            className={`bg-red-100 hover:bg-[#e92323] text-red-600 rounded px-3 py-2 hover:text-white cursor-pointer disabled:bg-gray-300 disabled:text-gray-500`}
                          >
                            <Trash2 size={20} />
                          </button>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={paymentPage}
              totalPages={totalPages}
              setCurrentPage={setPaymentPage}
              renderPageNumbers={renderPageNumbers}
            />
          )}
        </>
      ) : (
        <div>
          <div className="mt-3 flex flex-col items-center justify-center py-20 text-gray-400 bg-white">
            <span className="font-semibold"> No payment records found</span>
          </div>
        </div>
      )}
      <section className="flex flex-col sm:flex-row   sm:items-center sm:justify-between gap-4 mb-3">
        {/* Left: Title (and mobile button if needed) */}
        <div className="flex items-center justify-center w-full md:w-auto ">
          <h3 className="font-semibold sm:text-md text-[15px]">
            Seller Payments ({sellerPayments.length})
          </h3>
        </div>

        {/* Middle: Search field */}
        <div>
          <div className=" w-full md:flex-1 md:flex md:justify-end">
            <SearchField
              placeholder="Search payments..."
              searchValue={sellerPaymentsSearch}
              searchValueChange={(e) => {
                setSellerPaymentsSearch(e.target.value);
                setSellerPaymentsPage(1);
              }}
            />
          </div>
        </div>
      </section>

      {paginatedSellerPayments.length ? (
        <>
          <div className="overflow-x-auto rounded-box bg-white">
            <table className="table table-sm w-full text-center">
              <thead className=" ">
                <tr className="text-black">
                  <th>SL No.</th>
                  <th>Payment Date</th>
                  <th>Seller Name</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Payment Details</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedSellerPayments.map((payment, index) => (
                  <tr key={payment.id}>
                    <td>
                      <span className="font-semibold">
                        {(sellerPaymentsPage - 1) * paymentPageSize + index + 1}
                      </span>
                    </td>
                    <td>
                      <span className="font-semibold">
                        {new Date(payment.payment_date).toLocaleDateString(
                          "en-GB",
                        )}
                      </span>
                    </td>
                    <td className="flex flex-col">
                      <span className="font-semibold ">
                        {payment.seller_name}
                      </span>
                      <span className="text-sm font-semibold ">
                        ({payment.seller_store_name})
                      </span>
                    </td>
                    <td>
                      <span className=" font-semibold">
                        ৳{Number(payment.amount).toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td>
                      <div className="flex justify-center">
                        <div>
                          <div className="flex items-center gap-1 font-semibold">
                            <span className="font-semibold">
                              {payment.payment_method === "Mobile Banking" ? (
                                <CreditCard className="w-4 h-4 text-teal-500" />
                              ) : (
                                <Banknote className="w-4 h-4 text-amber-500" />
                              )}
                            </span>
                            <span className="font-semibold">
                              {payment.payment_method}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1 text-left">
                            TXN: {payment.transaction_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {payment.payment_method === "Mobile Banking" ? (
                        <div className="bg-teal-50 p-2 rounded-lg border border-teal-200">
                          <span className="font-semibold text-teal-800">
                            Mobile Number:
                          </span>
                          <p className="text-teal-700">
                            {payment.mobile_bank_account_number}
                          </p>
                        </div>
                      ) : (
                        <div className="bg-amber-50 p-2 rounded-lg border border-amber-200">
                          <span className="font-semibold text-amber-800">
                            Bank Name: {payment.bank_name}
                          </span>
                          <p className="text-amber-700 text-xs">
                            A/C Holder: {payment.bank_account_holder_name}
                          </p>
                          <p className="text-amber-700 text-xs">
                            A/C No: {payment.bank_account_number}
                          </p>
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className={`font-semibold ${
                          payment.status === "pending"
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {sellerPayments.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No payment records found
              </div>
            )}
          </div>
          {sellerPaymentsTotalPages > 1 && (
            <Pagination
              currentPage={sellerPaymentsPage}
              totalPages={sellerPaymentsTotalPages}
              setCurrentPage={setSellerPaymentsPage}
              renderPageNumbers={renderPageNumbersForSellerPayments}
            />
          )}
        </>
      ) : (
        <div>
          <div className="mt-3 flex flex-col items-center justify-center py-20 text-gray-400 bg-white">
            <span className="font-semibold"> No payment records found</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentsView;
