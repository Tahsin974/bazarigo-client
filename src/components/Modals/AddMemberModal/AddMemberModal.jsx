import { motion } from "framer-motion";
import { Camera, User, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import useAxiosPublic from "../../../Utils/Hooks/useAxiosPublic";
import AddBtn from "../../ui/AddBtn";
import SelectField from "../../ui/SelectField";
import { InputField } from "../../ui/InputField";
import { useState } from "react";
import DatePicker from "react-datepicker";
import useAddress from "../../../Utils/Hooks/useAddress";

export default function AddMemberModal({ onClose, refetch }) {
  const permissionOptions = [
    "Manage Users",
    "Manage Products",
    "View Orders",
    "Send Notifications",
    "Manage Promotions",
    "Update Settings",
  ];
  const axiosPublic = useAxiosPublic();
  const [profileImage, setProfileImage] = useState(null);
  const [gender, setGender] = useState("");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [thana, setThana] = useState("");

  const [date, setDate] = useState(null);
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
  const defaultPermissions = permissionOptions.reduce((acc, perm) => {
    acc[perm] = false;
    return acc;
  }, {});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      permissions: defaultPermissions,
    },
  });

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setProfileImage(file); // File object সরাসরি সংরক্ষণ
  };

  const onSubmit = async (data) => {
    if (!profileImage) {
      Swal.fire({
        icon: "error",
        title: "Please select an image",
        toast: true,
        position: "top",
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("profile_img", profileImage); // Multer field name
      formData.append("full_name", data.full_name);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("password", data.password);
      formData.append("role", data.role || "admin");
      formData.append("gender", gender);
      formData.append("date_of_birth", date ? date.toISOString() : "");
      formData.append("address", data.address || "");
      formData.append("division", division);
      formData.append("district", district);
      formData.append("thana", thana);
      formData.append("permissions", JSON.stringify(data.permissions || {}));

      const res = await axiosPublic.post("/admins", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 201) {
        Swal.fire({
          icon: "success",
          title: "User added successfully",
          toast: true,
          position: "top",
          showConfirmButton: false,
          timer: 1500,
        });
        reset();
        setProfileImage(null);
        setGender("");
        setDate(null);
        onClose();
        return refetch();
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Something Went Wrong",
        toast: true,
        position: "top",
        showConfirmButton: false,
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
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#FF0055] to-[#FF7B7B] text-white">
          <h2 className="text-xl font-semibold">Add New Member </h2>
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
                      {profileImage ? (
                        <img
                          src={URL.createObjectURL(profileImage)}
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
                        document.getElementById("profile-upload").click();
                      }}
                      className="absolute bottom-0 right-0 bg-white p-1 rounded-full border border-gray-300 cursor-pointer"
                    >
                      <Camera size={12} className="text-[#FF0055]" />
                    </div>
                  </div>
                </div>
                <input
                  id="profile-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                Add New Member
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <InputField
                  {...register("full_name", { required: "Name is required" })}
                  className="  w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                  label="Name"
                  placeholder="Name"
                  type="text"
                  required
                  errors={errors.full_name}
                />
                <InputField
                  {...register("email", { required: "Email is required" })}
                  className="  w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                  label="Email"
                  placeholder="Email"
                  type="email"
                  required
                  errors={errors.email}
                />
                <InputField
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
                  onWheel={(e) => e.target.blur()}
                  placeholder="Phone Number"
                  className="  w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                  label="Phone Number"
                  type="tel"
                  required
                  errors={errors.phone}
                />
                <InputField
                  {...register("password", {
                    required: "Password is required",
                    pattern: {
                      value:
                        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?])[A-Za-z\d!@#$%^&*()_\-+=<>?]{8,}$/,
                      message:
                        "Password must be at least 8 characters long, include one uppercase letter, one number, and one special character",
                    },
                  })}
                  className="  w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                  label="Password"
                  placeholder="Password"
                  type="password"
                  required
                  errors={errors.password}
                  errorsMessage={errors.password?.message}
                />
                <div className="flex flex-wrap gap-3">
                  <div className="w-full">
                    <InputField
                      {...register("address", {
                        required: "Address is required",
                        pattern: {
                          value: /^[A-Za-z0-9\s,.'-]{5,100}$/,
                          message: "Enter a valid address (5–100 characters)",
                        },
                      })}
                      placeholder="Address"
                      label="Address"
                      className={`w-full px-4 py-3 rounded-lg border errors.address border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF0055]`}
                      errors={errors.address}
                      errorsMessage={errors.address?.message}
                    />
                  </div>

                   {/* Division */}
                                      <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">
                                       Division
                                        <span className="text-red-500 ml-1">*</span>
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
                                        <span className="text-red-500 ml-1">*</span>
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
                                        <span className="text-red-500 ml-1">*</span>
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
                <div className="flex flex-col">
                  <label className="text-sm mb-1">Date Of Birth</label>
                  <DatePicker
                    selected={date}
                    onChange={setDate}
                    dateFormat="dd/MM/yyyy"
                    yearDropdownItemNumber={40}
                    scrollableYearDropdown
                    showYearDropdown
                    showMonthDropdown
                    placeholderText={"Select Birth Date"}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white m-0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Gender
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <SelectField
                    selectValue={gender}
                    selectValueChange={(e) => setGender(e.target.value)}
                    isWide={true}
                    required
                  >
                    <option value="" disabled>
                      Select Gender
                    </option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Others">Others</option>
                  </SelectField>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <SelectField
                    {...register("role", { required: true })}
                    isWide={true}
                  >
                    <option value="super admin">Super Admin</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                  </SelectField>
                </div>
                <div className="md:col-span-2  pt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Permissions
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {permissionOptions.map((perm) => (
                      <label
                        key={perm}
                        className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-[#FF0055] transition"
                      >
                        <input
                          type="checkbox"
                          {...register(`permissions.${perm}`)}
                          className="checkbox checkbox-secondary checkbox-xs rounded-sm"
                        />
                        <span className="select-none">{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <AddBtn
                  type="submit"
                  className="bg-[#00C853] hover:bg-[#00B34A] text-white px-6 py-2 rounded-lg"
                >
                  Submit
                </AddBtn>
              </form>
            </CardContent>
          </Card>
        </main>
      </motion.div>
    </div>
  );
}
