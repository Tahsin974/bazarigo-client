import SelectAllCheckbox from "../../../../components/ui/SelectAllCheckbox";
import DeleteAllBtn from "../../../../components/ui/DeleteAllBtn";
import AddBtn from "../../../../components/ui/AddBtn";
import SearchField from "../../../../components/ui/SearchField";
import Pagination from "../../../../components/ui/Pagination";
import { useRenderPageNumbers } from "../../../../Utils/Helpers/useRenderPageNumbers";
import { Eye, PlusCircle } from "lucide-react";
import Swal from "sweetalert2";
import useAxiosPublic from "../../../../Utils/Hooks/useAxiosPublic";
import useAuth from "../../../../Utils/Hooks/useAuth";
import Loading from "../../../../components/Loading/Loading";

function CustomersView({
  customers,
  selected,
  toggleSelect,
  onAdd,
  allSelected,
  toggleSelectAll,
  customerPage,
  setCustomerPage,
  customerSearch,
  setCustomerSearch,
  customerPageSize = 10,
  paginatedCustomers,
  filteredCustomers,
  openCustomerModal,
  refetch,
}) {
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();
  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / customerPageSize),
  );
  

  const renderPageNumbers = useRenderPageNumbers(
    customerPage,
    totalPages,
    setCustomerPage,
  );
  const handleBulkDelete = async () => {
    if (selected.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No customers selected",
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
        title: "Are you sure you want to delete selected customers?",
        showCancelButton: true,
        confirmButtonColor: "#00C853",
        cancelButtonColor: "#f72c2c",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      });

      if (result.isConfirmed) {
        const res = await axiosPublic.delete("/users/bulk-delete", {
          data: { ids: selected },
        });

        if (res.data.deletedCount > 0) {
          Swal.fire({
            icon: "success",
            title: "Selected Customers removed successfully",
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: "top",
          });
        }

        refetch();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: error.message,
        showConfirmButton: false,
        toast: true,
        position: "top",
        timer: 1500,
      });
    }
  };

  return (
    <div>
      <div className="flex flex-wrap lg:items-center lg:justify-between gap-4 mb-3">
        <div className=" w-full ">
          <SearchField
            placeholder="Search customers..."
            searchValue={customerSearch}
            searchValueChange={(e) => {
              setCustomerSearch(e.target.value);
              setCustomerPage(1);
            }}
          />
        </div>
        {/* Left: Title + small screen button */}
        <div className="flex md:flex-row flex-col  items-center justify-between w-full   gap-4">
          <div className="flex  gap-4 justify-start w-full sm:order-1 order-2 ">
            <h3 className="font-medium sm:text-base text-[14px]">
              Customers ({customers.length.toLocaleString("en-IN")})
            </h3>
          </div>
          {/* Small screen buttons */}
          {user.role !== "moderator" && (
            <div className="ml-2  flex gap-2 justify-end w-full md:order-2 order-1  ">
              <AddBtn btnHandler={onAdd}>
                <PlusCircle /> Customer
              </AddBtn>
              <DeleteAllBtn selected={selected} bulkDelete={handleBulkDelete} />
            </div>
          )}
        </div>
      </div>

      {paginatedCustomers.length === 0 ? (
        <div>
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white">
            <span className="font-semibold">customers not found</span>
          </div>
        </div>
      ) : paginatedCustomers.length === null ? (
        <Loading />
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-box">
            <table className="table text-center">
              {/* head */}
              <thead className="bg-gray-50 ">
                <tr className="text-black">
                  {user.role !== "moderator" && (
                    <th>
                      <SelectAllCheckbox
                        selected={selected}
                        allSelected={allSelected}
                        toggleSelectAll={toggleSelectAll}
                        isShowCounter={false}
                      />
                    </th>
                  )}

                  <th>User Name</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Orders</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((c) => (
                  <tr key={c.id}>
                    {user.role !== "moderator" && (
                      <td>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-secondary checkbox-xs rounded-sm"
                          checked={selected.includes(c.id)}
                          onChange={() => toggleSelect(c.id)}
                        />
                      </td>
                    )}

                    <td>
                      <span className="font-semibold">{c.user_name}</span>
                    </td>
                    <td>
                      <span className="font-semibold">{c.name}</span>
                    </td>
                    <td>
                      <span className="font-semibold">{c.email}</span>
                    </td>
                    <td>
                      <span className="font-semibold">
                        {c.phone ? c.phone : "-"}
                      </span>
                    </td>
                    <td>
                      <span className="font-semibold">
                        {c.orders_count.toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 justify-center">
                        <button
                          onClick={() => openCustomerModal(c)}
                          className=" px-3 py-2 rounded cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-900 "
                        >
                          <Eye size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <Pagination
              currentPage={customerPage}
              totalPages={totalPages}
              setCurrentPage={setCustomerPage}
              renderPageNumbers={renderPageNumbers}
            />
          )}
        </>
      )}
    </div>
  );
}

export default CustomersView;
