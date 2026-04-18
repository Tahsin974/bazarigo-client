import { X } from "lucide-react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import { useState } from "react";
import useAxiosPublic from "../../../Utils/Hooks/useAxiosPublic";
import SelectField from "../../ui/SelectField";
import { InputField } from "../../ui/InputField";

export default function DeliveryChargeModal({
  onClose,
  refetch,
  charge = null,
}) {
  const axiosPublic = useAxiosPublic();
  const [selectArea, setSelectArea] = useState(charge?.area_type || "");
  const { register, handleSubmit } = useForm({
    defaultValues: charge || {},
  });

  const isEdit = !!charge;

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, area_type: selectArea };
      if (isEdit) {
        const res = await axiosPublic.put(
          `/delivery-zones/${charge.id}`,
          payload,
        );

        if (res.data.updatedCount > 0) {
          Swal.fire({
            icon: "success",
            title: "Delivery Charge Updated Successfully",
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: "top",
          });
          refetch();
          onClose();
        }
      } else {
        const res = await axiosPublic.post("/delivery-zones", payload);

        if (res.data.createdCount > 0) {
          Swal.fire({
            icon: "success",
            title: "Delivery Charge Created Successfully",
            showConfirmButton: false,
            timer: 1500,
            toast: true,
            position: "top",
          });
          refetch();
          onClose();
        }
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: `${err.message}`,
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
          <h2 className="text-xl font-semibold">
            {" "}
            {isEdit ? "Edit" : "Add"} Delivery Charge{" "}
          </h2>
          <button
            onClick={onClose}
            className="hover:text-gray-200 transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-3">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Area Type</label>
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

          <InputField
            label={"Same District"}
            {...register("same_district_charge")}
            placeholder="Same District"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF0055]"
          />

          <InputField
            label={"Cross District"}
            {...register("diff_district_charge")}
            placeholder="Cross District"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF0055]"
          />

          <InputField
            label={"Per KG"}
            {...register("per_kg_charge")}
            placeholder="Per KG"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF0055]"
          />

          <InputField
            label={"COD %"}
            {...register("cod_percentage")}
            placeholder="COD %"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF0055]"
          />
          <InputField
            label={"Delivery Time"}
            {...register("delivery_time")}
            placeholder="Delivery Time"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF0055]"
          />
          <InputField
            label={"Min Delivery Charge"}
            {...register("min_floor_charge")}
            placeholder="Min Delivery Charge"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF0055]"
          />

          <InputField
            label={"Free Delivery Min Amount"}
            {...register("free_delivery_min_amount")}
            placeholder="Free Delivery Min Amount"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF0055]"
          />

          <button className="bg-green-500 text-white px-4 py-2 rounded w-full">
            {isEdit ? "Update" : "Create"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
