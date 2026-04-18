import { motion } from "framer-motion";
import { Camera, X } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { User, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import useAxiosPublic from "../../../Utils/Hooks/useAxiosPublic";
import useUsers from "../../../Utils/Hooks/useUsers";
import useAddress from "../../../Utils/Hooks/useAddress";
import SelectField from "../../ui/SelectField";
import { InputField } from "../../ui/InputField";

export default function AddCustomerModal({ onClose }) {
  const axiosPublic = useAxiosPublic();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" });
  const { refetch } = useUsers();

 
  const [image, setImage] = useState(null);
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [thana, setThana] = useState("");
 const {
     divisions, divisionsLoading,
     districts, districtsLoading,
     thanas,    thanasLoading,
   } = useAddress(division, district);
   const handleDivisionChange = (e) => {
    setDivision(e.target.value);
    setDistrict("");   // cascade reset
    setThana("");
  };

  const handleDistrictChange = (e) => {
    setDistrict(e.target.value);
    setThana("");      // cascade reset
  };
 
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImage(null);
      return;
    }
    setImage(file); // সরাসরি File object সংরক্ষণ
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("profileImg", image); // ফাইল ফিল্ড
      formData.append("name", data.first_Name + " " + data.last_Name);

      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("password", data.password);
      formData.append("address", data.address);
      formData.append("division", division);
      formData.append("district", district);
      formData.append("thana", thana);

      const res = await axiosPublic.post("/create-user", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.createdCount > 0) {
        Swal.fire({
          icon: "success",
          title: "Customer Created Successfully",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top",
        });
        reset();
        setImage(null);
        setDivision("");
        setDistrict("");
        setThana("");
        onClose();
        refetch();
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Something Went Wrong",
        showConfirmButton: false,
        toast: true,
        position: "top",
        timer: 1500,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-3xl bg-white rounded shadow overflow-auto max-h-[90vh] relative"
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#FF0055] to-[#FF7B7B] text-white">
          <h2 className="text-xl font-semibold">Add Customer </h2>
          <button
            onClick={onClose}
            className="hover:text-gray-200 transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </header>
        <main className=" m-5">
          <Card className="rounded-2xl shadow-2xl overflow-hidden">
            <CardContent className="p-8 bg-white">
              <div>
                <div className="flex justify-center mb-6">
                  <div className="relative w-max">
                    {/* মূল User আইকন */}
                    <div className=" w-24 h-24 rounded-full bg-[#FFE5E5] text-[#FF0055] flex items-center justify-center overflow-hidden">
                      {image ? (
                        <img
                          src={URL.createObjectURL(image)}
                          alt="product"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <User size={32} />
                      )}
                    </div>

                    {/* ছোট পেন আইকন */}
                    <div
                      onClick={() => {
                        document.getElementById("image-upload").click();
                      }}
                      className="absolute bottom-0 right-0 bg-white p-1 rounded-full border border-gray-300 cursor-pointer"
                    >
                      <Camera size={12} className="text-[#FF0055]" />
                    </div>
                  </div>
                </div>
                <input
                  id="image-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>

              <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                Create New Customer
              </h2>

              <form
                autoComplete="off"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="flex flex-wrap gap-3">
                  <div className="flex-1">
                    <InputField
                      {...register("first_Name", {
                        required: "First name is required",
                        pattern: {
                          value: /^[A-Za-z]{2,20}$/,
                          message: "First name must be 2–20 letters only",
                        },
                      })}
                      placeholder="First Name"
                      label="First Name"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.first_Name ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-[#FF0055]`}
                       errors={errors.first_Name}
                      errorsMessage={errors.first_Name?.message}
                    />
                    
                  </div>

                  <div className="flex-1">
                    <InputField
                      {...register("last_Name", {
                        required: "Last name is required",
                        pattern: {
                          value: /^[A-Za-z]{2,20}$/,
                          message: "Last name must be 2–20 letters only",
                        },
                      })}
                      placeholder="Last Name"
                      label="Last Name"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.last_Name ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-[#FF0055]`}
                      errors={errors.last_Name}
                      errorsMessage={errors.last_Name?.message}
                    />
                   
                  </div>
                </div>

                <div>
                  <InputField
                  label="Email Address"
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Enter a valid email address",
                      },
                    })}
                    placeholder="Email Address"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-[#FF0055]`}
                    errors={errors.email}
                    errorsMessage={errors.email?.message}
                  />
                  
                </div>
                <div className="flex-1">
                  <InputField
                    type="number"
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^(?:\+?88)?01[3-9]\d{8}$/, // Bangladesh phone format
                        message: "Enter a valid Bangladeshi phone number",
                      },
                    })}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                        e.preventDefault(); // keyboard up/down disable
                      }
                    }}
                    label="Phone Number"
                    placeholder="Phone Number"
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-[#FF0055]`}
                      errors={errors.phone}
                      errorsMessage={errors.phone?.message}
                  />
               
                </div>
                <div>
                  
                    <InputField
                      type={"password"}
                      {...register("password", {
                        required: "Password is required",
                        pattern: {
                          value:
                            /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?])[A-Za-z\d!@#$%^&*()_\-+=<>?]{8,}$/,
                          message:
                            "Password must be at least 8 characters long, include one uppercase letter, one number, and one special character",
                        },
                      })}
                      label="Password"
                      placeholder="Password"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-[#FF0055]`}
                      errors={errors.password}
                      errorsMessage={errors.password?.message}
                    />

                    
                  
                 
                </div>

                <div>
                  
                    <InputField
                      type={"password"}
                      {...register("confirm_Password", {
                        required: "Confirm Password is required",
                        validate: (value, allValues) =>
                          value === allValues.password ||
                          "Passwords do not match",
                      })}
                      label="Confirm Password"
                       errors={errors.confirm_Password}
                      errorsMessage={errors.confirm_Password?.message}
                      placeholder="Confirm Password"
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.confirm_Password
                          ? "border-red-500"
                          : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-[#FF0055]`}
                    />
                    
                
                  
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="w-full">
                    <InputField
                    label="Address"
                      {...register("address", {
                        required: "Address is required",
                        pattern: {
                          value: /^[A-Za-z0-9\s,.'-]{5,100}$/,
                          message: "Enter a valid address (5–100 characters)",
                        },
                      })}
                      placeholder="Enter your business address (e.g., Shop 12, Road 5, Banani)"
                      className={`w-full px-4 py-3 rounded-lg border  ${
                        errors.address ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-[#FF0055]`}
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  {/* Division */}
                                      <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">
                                       Division
                                        
                                      </label>
                                        <SelectField
                          selectValue={division}
                          selectValueChange={handleDivisionChange}
                          isWide={true}
                          required
                        >
                          <option value="" disabled>
                            {divisionsLoading ? "Loading..." : "Select Division"}
                          </option>
                          {divisions.map((div) => (
                            <option key={div} value={div}>{div}</option>
                          ))}
                        </SelectField>
                                      </div>
                                      {/* District */}
                                      <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">
                                       District
                                        
                                      </label>
                                       <SelectField
                          selectValue={district}
                          selectValueChange={handleDistrictChange}
                          isWide={true}
                          required
                          disabled={!division || districtsLoading}
                        >
                          <option value="" disabled>
                            {districtsLoading
                              ? "Loading..."
                              : !division
                              ? "Select Division first"
                              : "Select District"}
                          </option>
                          {districts.map((dist) => (
                            <option key={dist} value={dist}>{dist}</option>
                          ))}
                        </SelectField>
                                      </div>
                                      {/* Thana */}
                                      <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">
                                       Thana
                                        
                                      </label>
                                        <SelectField
                          selectValue={thana}
                          selectValueChange={(e) => setThana(e.target.value)}
                          isWide={true}
                          required
                          disabled={!district || thanasLoading}
                        >
                          <option value="" disabled>
                            {thanasLoading
                              ? "Loading..."
                              : !district
                              ? "Select District first"
                              : "Select Thana"}
                          </option>
                          {thanas.map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </SelectField>
                                      </div>
                </div>

                <Button
                  disabled={!isValid || divisionsLoading || districtsLoading || thanasLoading
                    || !division || !district || !thana
                  }
                  type="submit"
                  className="w-full bg-[#00C853] hover:bg-[#00B34A] text-white font-semibold py-3 rounded-lg shadow-lg  transition-colors flex justify-center cursor-pointer disabled:bg-gray-300 disabled:text-gray-500"
                >
                  Submit
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </motion.div>
    </div>
  );
}
