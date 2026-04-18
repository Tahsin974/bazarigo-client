import { motion } from "framer-motion";
import SelectField from "../../../../components/ui/SelectField";
import { useState } from "react";
import useAxiosPublic from "../../../../Utils/Hooks/useAxiosPublic";
import Swal from "sweetalert2";
import AddBtn from "../../../../components/ui/AddBtn";
import { InputField } from "../../../../components/ui/InputField";
import { Camera, Store, User } from "lucide-react";
import useAuth from "../../../../Utils/Hooks/useAuth";
import DatePicker from "react-datepicker";
import { FileUploadField } from "../../../../components/ui/FileUploadField";
import useAddress from "../../../../Utils/Hooks/useAddress";

export default function SettingsView({ active }) {
  const axiosPublic = useAxiosPublic();
  const { user, refreshUser } = useAuth();
  const [profileImg, setProfileImg] = useState(null);
  const [storeImg, setStoreImg] = useState(null);
  const [nidFrontImg, setNidFrontImg] = useState(null);
  const [nidBackImg, setNidBackImg] = useState(null);
  const [provider, setProvider] = useState(user.mobile_bank_name);
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
  const {
      divisions, divisionsLoading,
      districts, districtsLoading,
      thanas,    thanasLoading,
    } = useAddress(division, district);

  const baseUrl = import.meta.env.VITE_BASEURL;
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

  const handleProfileImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImg(file);
  };
  const handleStoreLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStoreImg(file);
  };
const handleDivisionChange = (e) => {
    setDivision(e.target.value);
    setDistrict("");   // cascade reset
    setThana("");
  };

  const handleDistrictChange = (e) => {
    setDistrict(e.target.value);
    setThana("");      // cascade reset
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

      // Append normal fields
      for (let key in safedata) {
        formData.append(key, safedata[key]);
      }

      // Append passwords if exists
      if (old_password && new_password) {
        formData.append("old_password", old_password);
        formData.append("new_password", new_password);
      }

      // Append images/files if exists
      if (profileImg) formData.append("profileImg", profileImg);
      if (storeImg) formData.append("storeImg", storeImg);
      if (nidFrontImg) formData.append("nidFrontImg", nidFrontImg);
      if (nidBackImg) formData.append("nidBackImg", nidBackImg);

      // Append DOB separately if needed
      formData.append(
        "date_of_birth",
        date ? formatDate(date) : user.date_of_birth,
      );

      const res = await axiosPublic.put(
        `/sellers/update/${user.id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      if (res.data.updatedCount > 0) {
        Swal.fire({
          icon: "success",
          title: `${type} updated successfully`,
          timer: 1500,
          toast: true,
          showConfirmButton: false,
          position: "top",
        });
        refreshUser();
        window.location.reload();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: err.response?.data?.message || "Something went wrong!",
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: "top",
      });
    }
  };

  return (
    <div>
      {active === "Settings" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
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
                      ) : user?.img ? (
                        <img
                          src={`${baseUrl}${user.img}`}
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
                  defaultValue={user.phone_number}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white m-0"
                />
                <div className="sm:col-span-2 ms-auto">
                  <AddBtn
                    btnHandler={() =>
                      handleUpdate("Personal Information", {
                        full_name: document.getElementById("full_name").value,
                        phone_number:
                          document.getElementById("phone_number").value,
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

            {/* Business Information */}

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
                          alt="store-preview"
                          className="w-full h-full object-fill rounded-full"
                        />
                      ) : user?.store_img ? (
                        <img
                          src={`${baseUrl}${user.store_img}`}
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
                  placeholder="Your Store Name"
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

                <InputField
                  label="Business Address"
                  placeholder="Enter your business address"
                  id="businessAddress"
                  defaultValue={user.business_address}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white m-0"
                />

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
                <InputField
                  label="NID Number"
                  placeholder="NID Number"
                  type="number"
                  id="nidNumber"
                  defaultValue={user.nid_number}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                      e.preventDefault(); // keyboard up/down disable
                    }
                  }}
                  onWheel={(e) => e.target.blur()}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white m-0"
                />
                <InputField
                  label="Trade License Number"
                  placeholder="Enter Trade License Number"
                  id="tradeLicenseNumber"
                  defaultValue={user.trade_license_number}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white m-0"
                />
                <div className="mt-6 sm:col-span-2">
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    National ID (NID) Upload
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <FileUploadField
                      label="NID - Front Side"
                      image={user.nid_front_file || nidFrontImg}
                      setImage={setNidFrontImg}
                      PRIMARY_COLOR={"#FF0055"}
                    />
                    <FileUploadField
                      label="NID - Back Side"
                      image={user.nid_back_file || nidBackImg}
                      setImage={setNidBackImg}
                      PRIMARY_COLOR={"#FF0055"}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 ms-auto">
                  <AddBtn
                    btnHandler={() =>
                      handleUpdate("Business Information", {
                        store_name: document.getElementById("store_name").value,
                        product_category:
                          mainProductCategory === ""
                            ? user.product_category
                            : mainProductCategory,
                        business_address:
                          document.getElementById("businessAddress").value,
                       division: division === "" ? user.division : division,
                       district: district === "" ? user.district : district,
                       thana: thana === "" ? user.thana : thana,
                        nid_number: document.getElementById("nidNumber").value,
                        trade_license_number:
                          document.getElementById("tradeLicenseNumber").value,
                      })
                    }
                  >
                    Save
                  </AddBtn>
                </div>
              </div>
            </section>

            {/* Payment Information */}

            <section className="bg-white rounded-lg shadow-sm p-4 space-y-4">
              <h3 className="font-semibold text-lg">Payment Information</h3>

              <h3 className="text-lg font-medium text-gray-600 mt-6 mb-2">
                Mobile Banking
              </h3>
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
                  defaultValue={user.mobile_bank_account_number}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white m-0"
                />
              </div>
              <h3 className="text-lg font-medium text-gray-600 mt-6 mb-2">
                Traditional Bank Account
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <InputField
                  id="bankName"
                  className={`w-full px-4 py-3 rounded-lg border  focus:outline-none focus:ring-2 focus:ring-[#FF0055]`}
                  label={"Bank Name"}
                  defaultValue={user.bank_name}
                  type="text"
                  placeholder="e.g., Sonali Bank, Dutch-Bangla Bank"
                />
                <InputField
                  id="branchName"
                  className={`w-full px-4 py-3 rounded-lg border  focus:outline-none focus:ring-2 focus:ring-[#FF0055]`}
                  label="Branch Name"
                  defaultValue={user.branch_name}
                  type="text"
                  placeholder="e.g., Motijheel Branch"
                />
                <InputField
                  id="accountNumber"
                  className={`w-full px-4 py-3 rounded-lg border  focus:outline-none focus:ring-2 focus:ring-[#FF0055]`}
                  label="Bank Account Number"
                  defaultValue={user.account_number}
                  type="text"
                  placeholder="e.g., 1234567890"
                />

                <InputField
                  id="accountHolderName"
                  className={`w-full px-4 py-3 rounded-lg border  focus:outline-none focus:ring-2 focus:ring-[#FF0055]`}
                  label="Bank Account Holder Name"
                  defaultValue={user.account_holder_name}
                  type="text"
                  placeholder="e.g., Rahim Ghosh"
                />

                <InputField
                  id="routingNumber"
                  className={`w-full px-4 py-3 rounded-lg border  focus:outline-none focus:ring-2 focus:ring-[#FF0055]`}
                  label="Bank Routing Number / IFSC"
                  defaultValue={user.routing_number}
                  type="text"
                  placeholder="e.g., 021000021 or DBBLBDDH"
                />
              </div>
              <div className="flex flex-wrap gap-4 mt-2">
                <AddBtn
                  btnHandler={() =>
                    handleUpdate("Payment Information", {
                      mobile_bank_name: provider || user.mobile_bank_name,
                      mobile_bank_account_number: document.getElementById(
                        "mobile_bank_account_number",
                      ).value,
                      bank_name: document.getElementById("bankName").value,
                      branch_name: document.getElementById("branchName").value,
                      account_number:
                        document.getElementById("accountNumber").value,
                      account_holder_name:
                        document.getElementById("accountHolderName").value,
                      routing_number:
                        document.getElementById("routingNumber").value,
                    })
                  }
                >
                  Save
                </AddBtn>
              </div>
            </section>
          </div>
        </motion.div>
      )}
    </div>
  );
}
