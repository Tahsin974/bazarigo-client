import { X } from "lucide-react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import SelectField from "../../ui/SelectField";
import useAxiosPublic from "../../../Utils/Hooks/useAxiosPublic";
import { useState } from "react";
export default function ZoneEditModal({ onClose, zone = {}, refetch }) {
  const axiosPublic = useAxiosPublic();
  const { register, handleSubmit, reset } = useForm();
  const [selectArea, setSelectArea] = useState(zone?.area_type || "");
  const onSubmit = async (data) => {
    try {
      const payload = { ...data, area_type: selectArea };

      if (zone) {
        const res = await axiosPublic.put(`/postal-zones/${zone.id}`, payload);
        if (res.data.updatedCount > 0) {
          Swal.fire({
            icon: "success",
            title: "Postal Zone Updated Successfully",
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: "top",
          });
          reset();

          onClose();
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
      } else {
        const res = await axiosPublic.post("/postal-zones", payload);
        if (res.data.createdCount > 0) {
          Swal.fire({
            icon: "success",
            title: "Postal Zone Created Successfully",
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: "top",
          });
          reset();

          onClose();
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
      }

      refetch();
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg bg-white rounded shadow overflow-auto max-h-[90vh] relative"
      >
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#FF0055] to-[#FF7B7B] text-white">
          <h2 className="text-xl font-semibold">Edit Zone </h2>
          <button
            onClick={onClose}
            className="hover:text-gray-200 transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </header>
        <main className="m-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 my-5">
            <div className="grid grid-cols-1 gap-2">
              <input
                placeholder="Division"
                {...register("division", {
                  required: "Division is required",
                })}
                defaultValue={zone?.division || null}
                required
                className=" md:w-auto w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#FF0055] focus:ring-2  focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
              />
              <input
                placeholder="District"
                {...register("district", {
                  required: "District is required",
                })}
                defaultValue={zone?.district || null}
                required
                className=" md:w-auto w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#FF0055] focus:ring-2  focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
              />
              <input
                placeholder="Thana"
                {...register("thana", {
                  required: "Thana is required",
                })}
                defaultValue={zone?.thana || null}
                required
                className="md:w-auto w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-[#FF0055] focus:ring-2  focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
              />

              <div>
                <SelectField
                  selectValue={selectArea}
                  selectValueChange={(e) => setSelectArea(e.target.value)}
                  isWide={true}
                >
                  <option value="" disabled>
                    Select Area Type
                  </option>
                  <option value={"City Central"}>City Central</option>
                  <option value={"Sub-Urban"}>Sub-Urban</option>
                  <option value={"Remote Area"}>Remote Area</option>
                </SelectField>
              </div>
            </div>
            <button
              type="submit"
              className="bg-[#00C853] hover:bg-[#00B34A] text-white px-4 py-2 rounded cursor-pointer transition-all hover:scale-105 duration-500"
            >
              Done
            </button>
          </form>
        </main>
      </motion.div>
    </div>
  );
}
