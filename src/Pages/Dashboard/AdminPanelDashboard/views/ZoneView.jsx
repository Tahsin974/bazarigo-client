import { useMemo, useState } from "react";
import { PlusCircle, SquarePen, Trash2 } from "lucide-react";
import AddBtn from "../../../../components/ui/AddBtn";
import DeleteAllBtn from "../../../../components/ui/DeleteAllBtn";
import Pagination from "../../../../components/ui/Pagination";

import SearchField from "../../../../components/ui/SearchField";
import Swal from "sweetalert2";
import SelectAllCheckbox from "../../../../components/ui/SelectAllCheckbox";
import useAxiosPublic from "../../../../Utils/Hooks/useAxiosPublic";
import { useRenderPageNumbers } from "../../../../Utils/Helpers/useRenderPageNumbers";
import ZoneEditModal from "../../../../components/Modals/ZoneEditModal/ZoneEditModal";
import useAuth from "../../../../Utils/Hooks/useAuth";

export default function ZoneView({
  setPostalZoneSearch,
  postalZoneSearch,
  postalZonePage,
  setPostalZonePage,
  postalZonePageSize,
  coverageAreas,
  refetch,
  selected,
  allSelected,
  toggleSelectAll,
  toggleSelect,
}) {
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();
  const [openZoneModal, setOpenZoneModal] = useState(false);
  const [activeZone, setActiveZone] = useState(null);
  

  const handleEdit = (zone) => {
    setOpenZoneModal(true);
    setActiveZone(zone);
  };
  const handleAdd = () => {
    setOpenZoneModal(true);
    setActiveZone(null);
  };
  const HandleDeleteArea = async (id) => {
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
          const res = await axiosPublic.delete(`/postal-zones/${id}`);
          if (res.data.deletedCount > 0) {
            Swal.fire({
              icon: "success",
              title: "Postal Zone Deleted Successfully",
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
          refetch();
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
  const handleBulkDelete = async () => {
    if (selected.length === 0) {
      Swal.fire({
        icon: "info",
        title: "No zones selected",
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
        title: "Are you sure you want to delete selected zones?",
        showCancelButton: true,
        confirmButtonColor: "#00C853",
        cancelButtonColor: "#f72c2c",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
      });

      if (result.isConfirmed) {
        const res = await axiosPublic.delete("/postal-zones/bulk-delete", {
          data: { ids: selected },
        });

        if (res.data.deletedCount > 0) {
          Swal.fire({
            icon: "success",
            title: "Selected zones deleted successfully",
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: "top",
          });
          return window.location.reload();
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops! Try again",
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
        timer: 1500,
        toast: true,
        position: "top",
      });
    }
  };

  const filteredPostalZones = useMemo(() => {
    let data = [...coverageAreas];
    if (postalZoneSearch) {
      const q = postalZoneSearch.toLowerCase();
      data = data.filter(
        (p) =>
          (p.division || "").toLowerCase().includes(q) ||
          (p.district || "").toLowerCase().includes(q) ||
          (p.thana || "").toLowerCase().includes(q)
      );
    }

    return data;
  }, [coverageAreas, postalZoneSearch]);

  const paginatedPostalZones = filteredPostalZones.slice(
    (postalZonePage - 1) * postalZonePageSize,
    postalZonePage * postalZonePageSize
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPostalZones.length / postalZonePageSize)
  );
  const renderPageNumbers = useRenderPageNumbers(
    postalZonePage,
    totalPages,
    setPostalZonePage
  );

  return (
    <>
      <div className="space-y-10">
        <div className="flex flex-wrap lg:items-center lg:justify-between gap-4 mb-3">
          <div className="w-full  ">
            <SearchField
              placeholder="Search zones..."
              searchValue={postalZoneSearch}
              searchValueChange={(e) => {
                setPostalZoneSearch(e.target.value);
                setPostalZonePage(1);
              }}
            />
          </div>

          <div className="flex md:flex-row flex-col  items-center justify-between w-full   gap-4">
            <div className="flex  gap-4 justify-start w-full sm:order-1 order-2 ">
              <h3 className="font-medium sm:text-base text-[14px]">
                Zones{" "}
                {coverageAreas?.length ? <>({coverageAreas.length})</> : ""}
              </h3>
            </div>
            {/* Small screen buttons */}
            {user.role !== "moderator" && (
              <div className="ml-2  flex gap-2 justify-end w-full md:order-2 order-1  ">
                <AddBtn btnHandler={handleAdd}>
                  <PlusCircle /> Area
                </AddBtn>
                <DeleteAllBtn
                  selected={selected}
                  bulkDelete={handleBulkDelete}
                />
              </div>
            )}
          </div>
        </div>
        {!paginatedPostalZones.length ? (
          <div>
            <div className="mt-3 flex flex-col items-center justify-center py-20 text-gray-400 bg-white">
              <span className="font-semibold"> No Areas found</span>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto bg-white rounded-box shadow-sm">
              <table className="table  text-center">
                <thead>
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

                    <th>Division</th>
                    <th>District</th>
                    <th>Upazila/Thana</th>
                    
                    <th>Area Type</th>
                    {user.role !== "moderator" && <th>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {paginatedPostalZones.map((postalZone) => (
                    <tr key={postalZone.id} className="border-t">
                      {user.role !== "moderator" && (
                        <td>
                          <input
                            type="checkbox"
                            className="checkbox checkbox-secondary checkbox-xs rounded-sm"
                            checked={selected.includes(postalZone.id)}
                            onChange={() => toggleSelect(postalZone.id)}
                          />
                        </td>
                      )}

                      <td>
                        <span className="font-semibold">
                          {postalZone.division}
                        </span>
                      </td>
                      <td>
                        <span className="font-semibold">
                          {postalZone.district}
                        </span>
                      </td>
                      <td>
                        <span className="font-semibold">
                          {postalZone.thana}
                        </span>
                      </td>
                      
                      <td>
                        {postalZone.area_type==="Remote Area" ? (
                          <span className="text-red-500 font-semibold">
                           {postalZone.area_type}
                          </span>
                        ) :postalZone.area_type==="Sub-Urban" ? (
                          <span className="text-yellow-500 font-semibold">
                           {postalZone.area_type}
                          </span>
                        ) : (
                          <span className="text-green-500 font-semibold">
                           {postalZone.area_type}
                          </span>
                        )}
                      </td>
                      {user.role !== "moderator" && (
                        <td>
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => handleEdit(postalZone)}
                              className="px-3 py-2 bg-orange-100 text-[#E6612A] hover:bg-orange-400 hover:text-white rounded cursor-pointer"
                            >
                              <SquarePen size={20} />
                            </button>

                            <button
                              onClick={() => HandleDeleteArea(postalZone.id)}
                              className="bg-red-100 hover:bg-[#e92323] text-red-600 rounded px-3 py-2 hover:text-white"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className=" flex items-center justify-center">
              {totalPages > 1 && (
                <Pagination
                  currentPage={postalZonePage}
                  totalPages={totalPages}
                  setCurrentPage={setPostalZonePage}
                  renderPageNumbers={renderPageNumbers}
                />
              )}
            </div>
          </>
        )}
      </div>
      {openZoneModal && (
        <ZoneEditModal
          onClose={() => setOpenZoneModal(false)}
          refetch={refetch}
          zone={activeZone}
        
        />
      )}
    </>
  );
}
