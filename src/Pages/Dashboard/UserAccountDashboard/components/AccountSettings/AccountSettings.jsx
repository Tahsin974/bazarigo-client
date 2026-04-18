import DatePicker from "react-datepicker";
import AddBtn from "../../../../../components/ui/AddBtn";
import { InputField } from "../../../../../components/ui/InputField";
import SelectField from "../../../../../components/ui/SelectField";
import { useState } from "react";
import useAuth from "../../../../../Utils/Hooks/useAuth";
import useAxiosPublic from "../../../../../Utils/Hooks/useAxiosPublic";
import Swal from "sweetalert2";
import { Camera, Plus, User } from "lucide-react";
import useAddress from "../../../../../Utils/Hooks/useAddress";

export default function AccountSettings({ activeTab }) {
  const axiosPublic = useAxiosPublic();

  const [profileImg, setProfileImg] = useState(null);

  const { user, refreshUser } = useAuth();
  const [gender, setGender] = useState(user.gender || "");
  const [division, setDivision] = useState(user.division || "");
  const [district, setDistrict] = useState(user.district || "");
  const [thana, setThana] = useState(user.thana || "");
  
  const [date, setDate] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState(null);
 const {
    divisions, divisionsLoading,
    districts, districtsLoading,
    thanas,    thanasLoading,
  } = useAddress(division, district);

  const [payments, setPayments] = useState(() => {
    const userPayment = user.payment_methods;

    // যদি payment_methods খালি বা object থাকে, একটি empty array দিয়ে শুরু
    if (!userPayment || Object.keys(userPayment).length === 0) {
      return [{ provider: "", account: "", is_primary: false }];
    }
    
    

    // যদি array থাকে
    if (Array.isArray(userPayment)) {
      return userPayment.map((pay) => ({
        provider: pay.provider || "",
        account: pay.account || "",
        is_primary: pay.is_primary || false,
      }));
    }

    // Default fallback
    return [{ provider: "", account: "", is_primary: false }];
  });
const handleDivisionChange = (e) => {
    setDivision(e.target.value);
    setDistrict("");   // cascade reset
    setThana("");
  };

  const handleDistrictChange = (e) => {
    setDistrict(e.target.value);
    setThana("");      // cascade reset
  };
  // Add Payment Field
  const addPaymentField = () => {
    setPayments([
      ...payments,
      { provider: "", account: "", is_primary: false },
    ]);
  };

  // Remove Payment Field
  const removePayment = (index) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  // Handle field change
  const handlePaymentChange = (index, field, value) => {
    const updated = [...payments];
    updated[index][field] = value;
    setPayments(updated);
  };

  // Toggle primary payment
  const setPrimaryPayment = (index) => {
    const updated = payments.map((pay, i) => ({
      ...pay,
      is_primary: i === index ? !pay.is_primary : false,
    }));
    setPayments(updated);
  };

  const baseUrl = import.meta.env.VITE_BASEURL;

  const handleProfileImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImg(file);
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const handleUpdate = async (type, updatedData) => {
    try {
      const formData = new FormData();

      // Append normal fields
      for (let key in updatedData) {
        if (updatedData[key] !== undefined && updatedData[key] !== null) {
          if (
            key === "payment_methods" &&
            typeof updatedData[key] === "object"
          ) {
            formData.append(key, JSON.stringify(updatedData[key]));
          } else {
            formData.append(key, updatedData[key]);
          }
        }
      }

      // Append profile image if exists
      if (profileImg) {
        formData.append("profileImg", profileImg);
      }

      // Append date_of_birth separately if needed
      if (date)
        formData.append(
          "date_of_birth",
          date ? formatDate(date) : user.date_of_birth
        );

      const res = await axiosPublic.put(`/users/update/${user.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.updatedCount > 0) {
        Swal.fire({
          icon: "success",
          title: `${type} updated successfully`,
          showConfirmButton: false,
          timer: 1500,
          toast: true,
          position: "top",
        });
        refreshUser();
        return window.location.reload();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: err.response?.data?.message || "Something went wrong!",
        showConfirmButton: false,
        timer: 1500,
        toast: true,
        position: "top",
      });
    }
  };

  return (
    <div>
      {/* Settings */}
      {activeTab === "Settings" && (
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
                          alt="store-preview"
                          className="w-full h-full object-fill rounded-full"
                        />
                      ) : user?.img ? (
                        <img
                          src={
                            user?.img
                              ? `${baseUrl}${user.img}`
                              : URL.createObjectURL(profileImg)
                          }
                          alt="product"
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
                  defaultValue={user.name}
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
                  <label className="block text-sm font-medium mb-1">
                    Gender
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

                <InputField
                  label="Phone Number"
                  placeholder="Phone Number"
                  id="phone_number"
                  defaultValue={user.phone}
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
                <div className="sm:col-span-2 ms-auto">
                  <AddBtn
                    btnHandler={() =>
                      handleUpdate("Personal Information", {
                        full_name: document.getElementById("full_name").value,
                        phone: document.getElementById("phone_number").value,
                        address: document.getElementById("address").value,
                       division: division === "" ? user.division : division,
                       district: district === "" ? user.district : district,
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
              <div className="flex flex-wrap gap-4 mt-2 justify-end">
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
            {/* Payment Information */}

            {/* <section className="bg-white rounded-lg shadow-sm p-4 space-y-4">
              <h3 className="font-semibold text-lg">Payment Information</h3>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Mobile Bank Name
                  </label>
                  <SelectField
                    selectValue={provider}
                    selectValueChange={(e) => setProvider(e.target.value)}
                    isWide={true}
                  >
                    <option value="" disabled>
                      Select Provider
                    </option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="Rocket">Rocket</option>
                  </SelectField>
                </div>

                <InputField
                  label="Mobile Banking Account Number"
                  placeholder="11-digit mobile number"
                  type="tel"
                  id="mobile_bank_account_number"
                  defaultValue={user.phone}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white m-0"
                />
              </div>
              <div className="flex flex-wrap gap-4 mt-2">
                <AddBtn
                  btnHandler={() =>
                    handleUpdate("Payment Information", {
                      mobile_bank_name: provider,
                      mobile_bank_account_number: document.getElementById(
                        "mobile_bank_account_number"
                      ).value,
                    })
                  }
                >
                  Save
                </AddBtn>
              </div>
            </section> */}

            <section className="bg-white rounded-2xl shadow-md p-6 space-y-6 border border-gray-100">
              <h3 className="font-semibold text-lg">Payment Information</h3>

              <div className="space-y-5">
                {payments.map((pay, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-5 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="grid sm:grid-cols-2 gap-5">
                      {/* Provider */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mobile Bank Name
                        </label>
                        <SelectField
                          selectValue={pay.provider}
                          selectValueChange={(e) =>
                            handlePaymentChange(
                              index,
                              "provider",
                              e.target.value
                            )
                          }
                          isWide={true}
                        >
                          <option value="" disabled>
                            Select Provider
                          </option>
                          <option value="bKash">bKash</option>
                          <option value="Nagad">Nagad</option>
                          <option value="Rocket">Rocket</option>
                        </SelectField>
                      </div>

                      {/* Account Number */}
                      <InputField
                        label="Account Number"
                        placeholder="11-digit mobile number"
                        type="tel"
                        defaultValue={pay.account}
                        onChange={(e) =>
                          handlePaymentChange(index, "account", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white m-0"
                      />
                    </div>

                    {/* Primary Checkbox */}
                    <div className="mt-3">
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-[#FF0055] transition">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-secondary checkbox-xs rounded-sm"
                          checked={pay.is_primary}
                          onChange={() => setPrimaryPayment(index)}
                        />
                        <span className="select-none">Make Primary</span>
                      </label>
                    </div>

                    {/* Remove Option */}
                    {payments.length > 1 && pay.provider && (
                      <button
                        type="button"
                        onClick={() => removePayment(index)}
                        className="text-red-500 text-sm font-medium mt-3 hover:text-red-600 transition"
                      >
                        Remove this method
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-4 items-center justify-end">
                {/* Add More Button */}

                <AddBtn btnHandler={addPaymentField}>
                  <Plus size={20} /> Add Payment Method
                </AddBtn>

                {/* Save Button */}

                <AddBtn
                  btnHandler={() => {
                    const filteredPayments = payments.filter(
                      (pay) => pay.provider || pay.account
                    );

                    handleUpdate("Payment Information", {
                      payment_methods: filteredPayments,
                    });
                  }}
                >
                  Save
                </AddBtn>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
