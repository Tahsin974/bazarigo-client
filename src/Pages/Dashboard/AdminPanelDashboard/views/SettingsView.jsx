import { useState } from "react";
import AddBtn from "../../../../components/ui/AddBtn";
import SelectField from "../../../../components/ui/SelectField";

import Swal from "sweetalert2";
import { InputField } from "../../../../components/ui/InputField";
import { useForm } from "react-hook-form";
import { FileUploadField } from "../../../../components/ui/FileUploadField";
import { Camera, SquarePen, Store, Trash2, User, X } from "lucide-react";
import useBanners from "../../../../Utils/Hooks/useBanners";
import useAxiosPublic from "../../../../Utils/Hooks/useAxiosPublic";
import useAuth from "../../../../Utils/Hooks/useAuth";
import DatePicker from "react-datepicker";
import Loading from "../../../../components/Loading/Loading";
import useAddress from "../../../../Utils/Hooks/useAddress";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "../../../../Utils/Hooks/useAxiosSecure";
import DeliveryChargeModal from "../../../../components/Modals/DeliveryChargeModal/DeliveryChargeModal";

function SettingsView({ setShowAddUserModal, admins, refetchAdmins }) {
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();
  const [image, setImage] = useState(null);
  const [profileImg, setProfileImg] = useState(null);
  const [storeImg, setStoreImg] = useState(null);
  const [mainProductCategory, setMainProductCategory] = useState(
    user.product_category || "",
  );

  const [gender, setGender] = useState(user.gender || "");
  const [division, setDivision] = useState(user.division || "");
  const [district, setDistrict] = useState(user.district || "");
  const [thana, setThana] = useState(user.thana || "");
  const [date, setDate] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
  const { banners, refetch } = useBanners();
  const [openModal, setOpenModal] = useState(false);
  const [activeCharge, setActiveCharge] = useState(null);
  const baseUrl = import.meta.env.VITE_BASEURL;
  const {
    divisions,
    divisionsLoading,
    districts,
    districtsLoading,
    thanas,
    thanasLoading,
  } = useAddress(division, district);
  const categoryOptions = [
    { value: "All Categories", label: "All Categories" },
    { value: "Electronics", label: "Electronics" },
    { value: "Fashion", label: "Fashion" },
    { value: "Health & Beauty", label: "Health & Beauty" },
    { value: "Home & Living", label: "Home & Living" },
    { value: "Grocery & Food", label: "Grocery & Food" },
    { value: "Sports & Outdoors", label: "Sports & Outdoors" },
    { value: "Toys & Kids", label: "Toys & Kids" },
    { value: "Pet Supplies", label: "Pet Supplies" },
  ];

  const toggleActive = async (admin) => {
    try {
      const res = await axiosPublic.patch(`/admins/${admin.id}`, {
        is_active: !admin.is_active,
      });
      if (res.data.updatedCount > 0) {
        Swal.fire({
          icon: "success",
          title: `Admin Is ${!admin.is_active ? "Active" : "Inactive"} Now`,
          showConfirmButton: false,
          toast: true,
          position: "top",
          timer: 1500,
        });
        refetchAdmins();
      } else {
        Swal.fire({
          icon: "error",
          title: `Try Again!`,
          showConfirmButton: false,
          toast: true,
          position: "top",
          timer: 1500,
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: `${error.message}`,
        showConfirmButton: false,
        toast: true,
        position: "top",
        timer: 1500,
      });
    }
  };
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();

  const { data: charges = [], refetch: fetchCharges } = useQuery({
    queryKey: ["delivery-zones"],
    queryFn: async () => {
      const res = await axiosSecure.get("/delivery-zones");
      return res.data.zones;
    },
  });
  const handleDivisionChange = (e) => {
    setDivision(e.target.value);
    setDistrict(""); // cascade reset
    setThana("");
  };

  const handleDistrictChange = (e) => {
    setDistrict(e.target.value);
    setThana(""); // cascade reset
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ mode: "onChange" });
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("link", data.link);
      formData.append("image", image);

      const res = await axiosPublic.post("/banner", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.createdCount > 0) {
        Swal.fire({
          icon: "success",
          title: `Banner has added successfully`,
          timer: 1500,
          toast: true,
          showConfirmButton: false,
          position: "top",
        });
        reset();
        setImage(null);
        refetch();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: `${error.message}`,
        showConfirmButton: false,
        toast: true,
        position: "top",
        timer: 1500,
      });
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await axiosPublic.delete(`/delivery-zones/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["delivery-zones"]);

      Swal.fire({
        icon: "success",
        title: "Deleted Successfully",
        toast: true,
        timer: 1500,
        position: "top",
        showConfirmButton: false,
      });
    },
  });

  const handleDelete = async (id) => {
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
        await axiosPublic.delete(`/banner/${id}`);

        Swal.fire({
          icon: "success",
          title: "Deleted successfully",
          showConfirmButton: false,
          timer: 1500,
          toast: true,
          position: "top",
        });
        refetch();
      }
    });
  };

  const handleDeleteZone = async (id) => {
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
        deleteMutation.mutate(id);
      }
    });
  };

  const handleRemoveAdmins = async (id) => {
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
        await axiosPublic.delete(`/admins/${id}`);

        Swal.fire({
          icon: "success",
          title: "Deleted successfully",
          showConfirmButton: false,
          timer: 1500,
          toast: true,
          position: "top",
        });
        refetchAdmins();
      }
    });
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImg(file); // direct file object
  };

  const handleStoreLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStoreImg(file);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const handleUpdate = async (type, updatedData) => {
    try {
      const { new_password, old_password, ...safedata } = updatedData;

      const formData = new FormData();

      // normal values append
      for (let key in safedata) {
        formData.append(key, safedata[key]);
      }

      // password update
      if (old_password && new_password) {
        formData.append("old_password", old_password);
        formData.append("new_password", new_password);
      }

      // profile image
      if (profileImg) {
        formData.append("profileImg", profileImg); // <-- file object
      }

      // store image
      if (storeImg) {
        formData.append("storeImg", storeImg); // <-- file object
      }

      // other user data
      formData.append(
        "date_of_birth",
        date ? formatDate(date) : user.date_of_birth,
      );

      const res = await axiosPublic.put(`/admins/update/${user.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.updatedCount > 0) {
        Swal.fire({
          icon: "success",
          title: `${type} updated successfully`,
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top",
        });
        refetchAdmins();
        return window.location.reload();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: err.response?.data?.message || "Something went wrong!",
        timer: 1500,
        toast: true,
        position: "top",
      });
    }
  };

  const handleUpdateStatus = async (e, id) => {
    const newRole = e.target.value;
    try {
      const res = await axiosPublic.patch(`/admins/role/${id}`, {
        role: newRole,
      });
      if (res.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Role updated successfully",
          showConfirmButton: false,
          timer: 1500,
          toast: true,
          position: "top",
        });
        refetchAdmins();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: err.response?.data?.message || "Failed to update role",
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        position: "top",
      });
    }
  };

  return (
    <>
      <div className="space-y-12 ">
        {/* Personal Information*/}

        <section className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          <h3 className="font-semibold text-lg">Personal Information</h3>
          <div>
            <div className="flex justify-center mb-6">
              <div className="relative w-max">
                {/* মূল User আইকন */}
                <div className=" w-24 h-24 rounded-full bg-[#FFE5E5] text-[#FF0055] flex items-center justify-center overflow-hidden">
                  {profileImg ? (
                    <img
                      src={URL.createObjectURL(profileImg)}
                      alt="preview"
                      className="w-full h-full object-fill rounded-full"
                    />
                  ) : user?.profile_img ? (
                    <img
                      src={`${baseUrl}${user.profile_img}`}
                      alt="profile"
                      className="w-full h-full object-fill rounded-full"
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
              onChange={handleProfileImageUpload}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <InputField
              label="Full Name"
              placeholder="Full Name"
              id="full_name"
              defaultValue={user.full_name}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white m-0"
            />

            <div className="flex flex-col">
              <label className="text-sm mb-1">Date Of Birth</label>
              <DatePicker
                selected={date || user.date_of_birth}
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
              <label className="block text-sm font-medium mb-1">Gender</label>
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

            <InputField
              label="Phone Number"
              placeholder="Phone Number"
              id="phone_number"
              defaultValue={user.phone_number}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white m-0"
            />

            <InputField
              label="Address"
              placeholder="Address"
              id="address"
              defaultValue={user.address}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white m-0"
            />

            {/* Division */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Division</label>
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
                  <option key={div} value={div}>
                    {div}
                  </option>
                ))}
              </SelectField>
            </div>
            {/* District */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">District</label>
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
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </SelectField>
            </div>
            {/* Thana */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Thana</label>
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
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </SelectField>
            </div>
            <div className="ms-auto sm:col-span-2">
              <AddBtn
                btnHandler={() =>
                  handleUpdate("Personal Information", {
                    full_name: document.getElementById("full_name").value,
                    phone_number: document.getElementById("phone_number").value,
                    address: document.getElementById("address").value,
                    district: district === "" ? user.district : district,
                    division: division === "" ? user.division : division,
                    thana: thana === "" ? user.thana : thana,
                    gender: gender === "" ? user.gender : gender,
                  })
                }
              >
                Save
              </AddBtn>
            </div>
          </div>
        </section>
        {/* Team Management */}
        {user.role !== "moderator" && (
          <section className="bg-white rounded-xl shadow-md p-6 border border-gray-100 space-y-6">
            {/* Header */}
            <div className="flex  items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800 tracking-wide">
                Team Management
              </h3>

              <AddBtn btnHandler={() => setShowAddUserModal(true)}>
                Add Member
              </AddBtn>
            </div>

            {/* Admin Users */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                Admins
              </h4>

              <ul className="space-y-3 text-sm">
                {!admins.admins?.length ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    admins not found
                  </div>
                ) : (
                  admins.admins
                    ?.sort((a, b) => {
                      if (a.role === "super admin") return -1;
                      if (b.role === "super admin") return 1;
                      return 0;
                    })
                    .map((admin) => (
                      <li
                        key={admin.id}
                        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between 
                     bg-white p-3 rounded-md shadow-sm border border-gray-100"
                      >
                        {/* Left info */}
                        <div className="flex flex-col gap-1">
                          <p className="font-medium text-gray-800 break-all">
                            {admin.email}
                          </p>
                          <span className="text-xs text-gray-500 capitalize">
                            Role: {admin.role}
                          </span>
                        </div>

                        {/* Right actions */}
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                          <span className="w-fit px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md font-medium capitalize">
                            {admin.role}
                          </span>

                          {!(
                            user.role !== "super admin" &&
                            admin.role === "super admin"
                          ) && (
                            <select
                              value={admin.role}
                              onChange={(e) => handleUpdateStatus(e, admin.id)}
                              className="w-full sm:w-auto bg-white border border-gray-300 text-gray-900 
                           hover:border-gray-400 rounded px-2 py-1 text-sm
                           focus:ring-2 focus:ring-[#FF0055] focus:border-[#FF0055]"
                              disabled={
                                admin.role === "super admin" &&
                                user.role !== "super admin"
                              }
                            >
                              <option value="super admin">Super Admin</option>
                              <option value="admin">Admin</option>
                              <option value="moderator">Moderator</option>
                            </select>
                          )}

                          {/* Delete / Action buttons */}
                          {admin.role === "super admin" &&
                          user.role !== "super admin" ? (
                            <div className="relative inline-block group">
                              <button
                                disabled
                                className="px-3 py-2 rounded bg-gray-200 cursor-not-allowed"
                              >
                                <Trash2 size={20} />
                              </button>
                              <span
                                className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 
                             text-xs bg-black text-white rounded opacity-0 
                             group-hover:opacity-100 transition whitespace-nowrap"
                              >
                                Not allowed
                              </span>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => toggleActive(admin)}
                                className={`px-3 py-2 rounded text-sm ${
                                  !admin.is_active
                                    ? "bg-[#00C853] hover:bg-[#00B34A] text-white"
                                    : "bg-[#f72c2c] hover:bg-[#e92323] text-white"
                                }`}
                              >
                                {!admin.is_active ? "Active" : "Inactive"}
                              </button>
                              <button
                                onClick={() => handleRemoveAdmins(admin.id)}
                                className="px-3 py-2 rounded bg-red-100 text-red-600 
                             hover:bg-[#e92323] hover:text-white"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          )}
                        </div>
                      </li>
                    ))
                )}
              </ul>
            </div>

            {/* Moderator Users */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00C853]"></span>
                Moderators
              </h4>

              {!admins?.moderators?.length ? (
                <div className="flex flex-col items-center justify-center py-20">
                  moderators not found
                </div>
              ) : (
                <ul className="space-y-3 text-sm">
                  {admins.moderators.map((moderator) => (
                    <li
                      key={moderator.id}
                      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between
                 bg-white p-3 rounded-md shadow-sm border border-gray-100"
                    >
                      {/* Left info */}
                      <div className="flex flex-col gap-1">
                        <p className="font-medium text-gray-800 break-all">
                          {moderator.email}
                        </p>
                        <span className="text-xs text-gray-500 capitalize">
                          Role: {moderator.role}
                        </span>
                      </div>

                      {/* Right actions */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <span className="w-fit px-2 py-1 text-xs bg-green-100 text-green-600 rounded-md font-medium capitalize">
                          {moderator.role}
                        </span>

                        {(user.role === "admin" ||
                          user.role === "super admin") && (
                          <select
                            value={moderator.role}
                            onChange={(e) =>
                              handleUpdateStatus(e, moderator.id)
                            }
                            className="w-full sm:w-auto bg-white border border-gray-300 text-gray-900
                       hover:border-gray-400 rounded px-2 py-1 text-sm
                       focus:ring-2 focus:ring-[#FF0055] focus:border-[#FF0055]"
                          >
                            <option value="admin">Admin</option>
                            <option value="moderator">Moderator</option>
                          </select>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleActive(moderator)}
                            className={`px-3 py-2 rounded text-sm ${
                              !moderator.is_active
                                ? "bg-[#00C853] hover:bg-[#00B34A] text-white"
                                : "bg-[#f72c2c] hover:bg-[#e92323] text-white"
                            }`}
                          >
                            {!moderator.is_active ? "Active" : "Inactive"}
                          </button>

                          <button
                            onClick={() => handleRemoveAdmins(moderator.id)}
                            className="px-3 py-2 rounded bg-red-100 text-red-600
                       hover:bg-[#e92323] hover:text-white"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {/* Account Information */}

        <section className="bg-white rounded-lg shadow-sm p-4 space-y-4">
          <h3 className="font-semibold text-lg">Account Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <InputField
              label="Email"
              placeholder="Email"
              type="email"
              id="email"
              defaultValue={user.email}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white m-0"
            />
            <InputField
              label="Old Password"
              placeholder="Old Password"
              type="password"
              defaultValue={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white m-0"
            />
            <InputField
              label="New Password"
              placeholder="New Password"
              type="password"
              disabled={password.length === 0}
              defaultValue={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white disabled:bg-gray-100 m-0"
            />
            <InputField
              label="Confirm Password"
              placeholder="Confirm Password"
              type="password"
              disabled={password.length === 0}
              defaultValue={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white disabled:bg-gray-100 m-0"
            />
          </div>
          <div className="flex flex-wrap gap-4 mt-2 sm:col-span-2 justify-end">
            <AddBtn
              btnHandler={() =>
                handleUpdate("Account Information", {
                  email: document.getElementById("email").value,
                })
              }
            >
              Save
            </AddBtn>
            {newPassword?.length && confirmPassword === newPassword && (
              <AddBtn
                btnHandler={() =>
                  handleUpdate("New Password Set ", {
                    old_password: password,
                    new_password: newPassword,
                  })
                }
              >
                Set New Password
              </AddBtn>
            )}
          </div>
        </section>

        {/* Business Information */}

        {user.role === "super admin" && (
          <section className="bg-white rounded-lg shadow-sm p-4 space-y-4">
            <h3 className="font-semibold text-lg">Business Information</h3>
            <div>
              <div className="flex justify-center mb-6">
                <div className="relative w-max">
                  {/* মূল User আইকন */}
                  <div className=" w-24 h-24 rounded-full bg-[#FFE5E5] text-[#FF0055] flex items-center justify-center overflow-hidden">
                    {storeImg ? (
                      <img
                        src={URL.createObjectURL(storeImg)}
                        alt="preview"
                        className="w-full h-full object-fill rounded-full"
                      />
                    ) : user?.store_img ? (
                      <img
                        src={`${baseUrl}${user?.store_img}`}
                        alt="store"
                        className="w-full h-full object-fill rounded-full"
                      />
                    ) : (
                      <Store size={32} />
                    )}
                  </div>

                  {/* ছোট পেন আইকন */}
                  <div
                    onClick={() => {
                      document.getElementById("store-logo-upload").click();
                    }}
                    className="absolute bottom-0 right-0 bg-white p-1 rounded-full border border-gray-300 cursor-pointer"
                  >
                    <Camera size={12} className="text-[#FF0055]" />
                  </div>
                </div>
              </div>
              <input
                id="store-logo-upload"
                name="file-upload"
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleStoreLogoUpload}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <InputField
                label="Store Name"
                id={"store_name"}
                placeholder="Store Name"
                defaultValue={user.store_name}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white m-0"
              />
              <div>
                <label className="block text-sm font-medium mb-1">
                  Main Product Category
                </label>
                <SelectField
                  selectValue={mainProductCategory}
                  selectValueChange={(e) =>
                    setMainProductCategory(e.target.value)
                  }
                  isWide={true}
                  required
                >
                  <option value="" disabled>
                    Select
                  </option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.value}>{cat.label}</option>
                  ))}
                </SelectField>
              </div>
              <div className="sm:col-span-2 ms-auto">
                <AddBtn
                  btnHandler={() =>
                    handleUpdate("Business Information", {
                      store_name: document.getElementById("store_name").value,
                      product_category:
                        mainProductCategory === ""
                          ? user?.product_category
                          : mainProductCategory,
                    })
                  }
                >
                  Save
                </AddBtn>
              </div>
            </div>
          </section>
        )}
        {/* Delivery Charge Settings */}
        <section className="bg-white rounded-lg shadow-sm p-4 space-y-4 mt-10">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Delivery Charge Settings</h3>

            <AddBtn
              btnHandler={() => {
                setActiveCharge(null);
                setOpenModal(true);
              }}
            >
              Add Charge
            </AddBtn>
          </div>

          {charges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <p className="text-lg font-semibold">No Delivery Charges Found</p>
              <p className="text-sm">
                Please add a delivery charge to start configuration
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-box shadow-sm ">
              <table className="table  text-center">
                <thead className="text-black">
                  <tr>
                    <th>Area</th>
                    <th>Same District</th>
                    <th>Cross District</th>
                    <th>Per KG</th>
                    <th>COD %</th>
                    <th>Free Delivery</th>
                    <th>Delivery Time</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {charges.map((c) => (
                    <tr key={c.id}>
                      <td className="font-semibold">{c.area_type}</td>
                      <td>{c.same_district_charge}</td>
                      <td>{c.diff_district_charge}</td>
                      <td>{c.per_kg_charge}</td>
                      <td>{c.cod_percentage}%</td>
                      <td>
                        {c.free_delivery_min_amount.toLocaleString("en-IN")}
                      </td>
                      <td>{c.delivery_time}</td>

                      <td className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setOpenModal(true);
                            setActiveCharge(c);
                          }}
                          className="px-3 py-2 bg-orange-100 text-[#E6612A] hover:bg-orange-400 hover:text-white rounded cursor-pointer"
                        >
                          <SquarePen size={20} />
                        </button>

                        <button
                          onClick={() => handleDeleteZone(c.id)}
                          className="bg-red-100 hover:bg-[#e92323] text-red-600 rounded px-3 py-2 hover:text-white cursor-pointer disabled:bg-gray-300 disabled:text-gray-500"
                        >
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="space-y-3 bg-white rounded-lg shadow-sm p-4">
          <h3 className="font-semibold text-lg">Hero Section Settings</h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FileUploadField
              label="Banner"
              image={image}
              setImage={setImage}
              PRIMARY_COLOR={"#FF0055"}
            />
            <InputField
              {...register("link", { require: true })}
              className={`w-full px-4 py-3 rounded-lg border  focus:outline-none focus:ring-2 focus:ring-[#FF0055]`}
              label={"Link"}
              required
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                  e.preventDefault(); // keyboard up/down disable
                }
              }}
              onWheel={(e) => e.target.blur()}
              errors={errors.link}
              errorsMessage={errors.link?.message}
              type="url"
              placeholder="Enter Link"
            />
            <div className="flex justify-end">
              <AddBtn
                type="submit"
                className="bg-[#00C853] hover:bg-[#00B34A] text-white px-6 py-2 rounded-lg  transition"
              >
                Upload
              </AddBtn>
            </div>
          </form>
          <div className="grid sm:grid-cols-2  gap-4 mt-6">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className="relative rounded-lg overflow-hidden shadow h-40"
              >
                <img
                  src={`${baseUrl}${banner.image}`}
                  alt="banner"
                  className="w-full h-full  object-fill"
                />

                <button
                  onClick={() => handleDelete(banner.id)}
                  className="absolute top-2 right-2 bg-[#f72c2c] text-white p-1 rounded-full hover:bg-[#e92323] transition"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
      {openModal && (
        <DeliveryChargeModal
          onClose={() => {
            setOpenModal(false);
            setActiveCharge(null);
          }}
          refetch={fetchCharges}
          charge={activeCharge}
        />
      )}
    </>
  );
}

export default SettingsView;
