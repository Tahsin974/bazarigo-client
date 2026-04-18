import { useState } from "react";
import Pagination from "../../../../../components/ui/Pagination";

import { Store, UserMinus } from "lucide-react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import useAxiosPublic from "../../../../../Utils/Hooks/useAxiosPublic";
import { useRenderPageNumbers } from "../../../../../Utils/Helpers/useRenderPageNumbers";

export default function Overview({
  orders,
  cart,
  unreadCount,
  activeTab,
  cartTotal,
  followingLists = [],
  refetch,
}) {
  const axiosPublic = useAxiosPublic();

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(followingLists.length / 6));
  const navigate = useNavigate();
  const renderPageNumbers = useRenderPageNumbers(
    currentPage,
    totalPages,
    setCurrentPage,
  );
  const paginatedFollowingLists = followingLists.slice(
    (currentPage - 1) * 6,
    currentPage * 6,
  );

  const handleUnFollow = async (userId, sellerId) => {
    try {
      const res = await axiosPublic.post("/following", {
        userId,
        sellerId,
      });

      if (res.data.deletedCount > 0) {
        Swal.fire({
          icon: "success",
          title: "Seller Removed From Following List",
          toast: true,
          position: "top",
          showConfirmButton: false,
          timer: 1500,
        });
        return refetch();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: err.response?.data?.message || "Something went wrong",
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  };
  return (
    <div>
      {activeTab === "Overview" && (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow">
              <h4 className="font-semibold">Orders Summary</h4>
              <p className="text-sm text-gray-500">
                You have {orders?.length} recent orders
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow">
              <h4 className="font-semibold">Active Cart</h4>
              <p className="text-sm text-gray-500">
                {cart.length} items — ৳{cartTotal}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow">
              <h4 className="font-semibold">Notifications</h4>
              <p className="text-sm text-gray-500">{unreadCount} unread</p>
            </div>
          </div>

          {followingLists.length === 0 ? (
            <div className="bg-white p-4 rounded-box shadow-sm my-4">
              <h3 className="text-lg font-semibold mb-3 text-black">
                Following
              </h3>
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                You are not following any sellers yet
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white p-4 rounded-box shadow-sm my-4">
                <h3 className="text-lg font-semibold mb-3 text-black">
                  Following
                </h3>

                <div className="overflow-x-auto">
                  <table className="table text-center">
                    {/* head */}
                    <thead className="text-black">
                      <tr>
                        <th>SL</th>
                        <th>Store Name</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedFollowingLists.map((f, idx) => (
                        <tr key={idx} className="border-t">
                          <td>
                            <span className="font-semibold">{idx + 1}</span>
                          </td>
                          <td>
                            <span className="font-semibold">
                              {f.seller_store_name}
                            </span>
                          </td>

                          <td>
                            <div className="flex items-center gap-2 justify-center">
                              <button
                                onClick={() =>
                                  handleUnFollow(f.user_id, f.seller_id)
                                }
                                className="btn btn-xs bg-[#f72c2c] border-none shadow-none text-white flex items-center gap-1"
                              >
                                <UserMinus size={14} />
                                Unfollow
                              </button>

                              <button
                                onClick={() =>
                                  navigate(
                                    `/seller-page/${
                                      f.seller_store_name
                                    }/store?id=${btoa(f.seller_id)}#`,
                                  )
                                }
                                className="btn btn-xs bg-orange-400
                                border-none shadow-none
                                hover:bg-orange-500  text-white flex items-center gap-1"
                              >
                                <Store size={14} />
                                Visit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className=" flex items-center justify-center">
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                    renderPageNumbers={renderPageNumbers}
                  />
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
