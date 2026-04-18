import SelectAllCheckbox from "../../../../components/ui/SelectAllCheckbox";
import DeleteAllBtn from "../../../../components/ui/DeleteAllBtn";
import AddBtn from "../../../../components/ui/AddBtn";
import {
  CircleCheckBig,
  CircleX,
  CreditCard,
  Eye,
  MoreHorizontal,
  PlusCircle,
} from "lucide-react";
import SearchField from "../../../../components/ui/SearchField";
import Pagination from "../../../../components/ui/Pagination";
import { useRenderPageNumbers } from "../../../../Utils/Helpers/useRenderPageNumbers";
import useAxiosPublic from "../../../../Utils/Hooks/useAxiosPublic";
import Swal from "sweetalert2";
import useAuth from "../../../../Utils/Hooks/useAuth";
import Loading from "../../../../components/Loading/Loading";

function SellersView({
  sellers,
  selected,
  toggleSelect,
  onAdd,
  allSelected,
  toggleSelectAll,
  sellerPage,
  setSellerPage,
  sellerSearch,
  setSellerSearch,
  sellerPageSize = 10,
  filteredSellers,
  openSellerModal,
  refetch,
  openPaymentModal,
}) {
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();
  const totalPages = Math.max(
    1,
    Math.ceil(filteredSellers.length / sellerPageSize)
  );
  const handleAccept = async (id) => {
    const res = await axiosPublic.patch(`/sellers/${id}/status`, {
      status: "approved",
    });
    if (res.data.updatedCount > 0) {
      return refetch();
    }
  };
  const handleReject = async (id) => {
    const res = await axiosPublic.patch(`/sellers/${id}/status`, {
      status: "rejected",
    });
    if (res.data.deletedCount > 0) {
      return refetch();
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No Sellers selected",
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        position: "top",
      });
      return;
    }

    try {
      const result = await Swal.fire({
        icon: "warning",
        title: "Are you sure you want to delete selected sellers?",
        showCancelButton: true,
        confirmButtonColor: "#00C853",
        cancelButtonColor: "#f72c2c",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      });

      if (result.isConfirmed) {
        const res = await axiosPublic.delete("/sellers/bulk", {
          data: { ids: selected },
        });

        if (res.data.deletedCount > 0) {
          Swal.fire({
            icon: "success",
            title: "Selected Products deleted successfully",
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: "top",
          });
          return refetch();
        } else {
          console.log("Bulk delete response:", res.data);
          Swal.fire({
            icon: "error",
            title: "Oops! Try again",
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: "top",
          });
        }
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: error.message,
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        position: "top",
      });
    }
  };

  const renderPageNumbers = useRenderPageNumbers(
    sellerPage,
    totalPages,
    setSellerPage
  );

  return (
    <div>
      <div className="flex flex-wrap lg:items-center lg:justify-between gap-4 mb-3">
        <div className=" w-full ">
          <SearchField
            placeholder="Search sellers..."
            searchValue={sellerSearch}
            searchValueChange={(e) => {
              setSellerSearch(e.target.value);
              setSellerPage(1);
            }}
          />
        </div>
        <div className="flex md:flex-row flex-col  items-center justify-between w-full   gap-4">
          <div className="flex  gap-4 justify-start w-full sm:order-1 order-2 ">
            <h3 className="font-medium sm:text-base text-[14px]">
              Sellers ({sellers.length})
            </h3>
          </div>
          {user.role !== "moderator" && (
            <div className="ml-2  flex gap-2 justify-end w-full md:order-2 order-1  ">
              <AddBtn btnHandler={onAdd}>
                <PlusCircle /> Seller
              </AddBtn>
              <DeleteAllBtn selected={selected} bulkDelete={handleBulkDelete} />
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 bg-white p-3 rounded shadow-sm">
        {filteredSellers.length === 0 ? (
          <div>
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white">
              <span className="font-semibold">sellers not found</span>
            </div>
          </div>
        ) : filteredSellers.length === null ? (
          <Loading />
        ) : (
          <div className="overflow-x-auto bg-white rounded-box">
            <table className="table text-center">
              {/* head */}
              <thead className="bg-gray-50 ">
                <tr className="text-black">
                  {user.role !== "moderator" && (
                    <th className="px-4 py-3">
                      <SelectAllCheckbox
                        selected={selected}
                        allSelected={allSelected}
                        toggleSelectAll={toggleSelectAll}
                        isShowCounter={false}
                      />
                    </th>
                  )}

                  <th className="px-4 py-3">Seller ID</th>
                  <th className="px-4 py-3">Seller Name</th>
                  <th className="px-4 py-3">Seller Store Name</th>
                  <th className="px-4 py-3">Seller Email</th>
                  <th className="px-4 py-3"> Phone</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSellers.map((s) => (
                  <tr key={s.id} className="border-t">
                    {user.role !== "moderator" && (
                      <td className="px-4 py-3">
                        {" "}
                        <input
                          type="checkbox"
                          className="checkbox checkbox-secondary checkbox-xs rounded-sm"
                          checked={selected.includes(s.id)}
                          onChange={() => toggleSelect(s.id)}
                        />
                      </td>
                    )}

                    <td className="px-4 py-3">
                      <span className="font-semibold">{s.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">{s.full_name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">{s.store_name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">{s.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold">{s.phone_number}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-center">
                        <button
                          onClick={() => openSellerModal(s)}
                          className="px-3 py-2 rounded cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-900"
                        >
                          <Eye size={20} />
                        </button>
                        {/* Payment Details Modal */}
                        {s.status === "approved" &&
                          user.role !== "moderator" && (
                            <button
                              onClick={() => openPaymentModal(s)}
                              className="px-3 py-2 rounded cursor-pointer bg-blue-100 hover:bg-[#314D9D] text-[#314D9D] hover:text-white"
                            >
                              <CreditCard size={20} />
                            </button>
                          )}

                        {s.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleAccept(s.id)}
                              className="px-3 py-2  rounded bg-green-100 hover:bg-[#00B34A] text-green-600 hover:text-white cursor-pointer"
                            >
                              <CircleCheckBig size={20} />
                            </button>
                            <button
                              onClick={() => handleReject(s.id)}
                              className="px-3 py-2  rounded bg-red-100 hover:bg-[#e92323] text-red-600 hover:text-white cursor-pointer"
                            >
                              <CircleX size={20} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <Pagination
          currentPage={sellerPage}
          totalPages={totalPages}
          setCurrentPage={setSellerPage}
          renderPageNumbers={renderPageNumbers}
        />
      )}
    </div>
  );
}

export default SellersView;
