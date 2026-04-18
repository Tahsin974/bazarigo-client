import { useForm } from "react-hook-form";
import AccountDetails from "./AccountDetails";
import BusinessDetails from "./BusinessDetails";
import PaymentDetails from "./PaymentDetails";
import PersonalInformation from "./PersonalInformation";
import Swal from "sweetalert2";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import useAxiosPublic from "../../Utils/Hooks/useAxiosPublic";
import { useNavigate } from "react-router";

export default function SellerRegistrationForm({
  PRIMARY_COLOR,
  refetch,
  creator = "user",
}) {
  const axiosPublic = useAxiosPublic();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({ mode: "onChange" });
  const navigate = useNavigate();
  const [nidFrontImg, setNidFrontImg] = useState(null);
  const [nidBackImg, setNidBackImg] = useState(null);
  const [date, setDate] = useState(null);
  const [gender, setGender] = useState("");
   const [division, setDivision] = useState("");
    const [district, setDistrict] = useState("");
    const [thana, setThana] = useState("");
  const [mainProductCategory, setMainProductCategory] = useState("");
  const [mobileBankName, setMobileBankName] = useState("");
  const [isAcceptTerms, setIsAcceptTerms] = useState(false);
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();

      // Append normal fields
      for (let key in data) {
        formData.append(key, data[key]);
      }

      // Append files
      if (nidFrontImg) formData.append("nidFrontImg", nidFrontImg);
      if (nidBackImg) formData.append("nidBackImg", nidBackImg);

      // Other custom fields
      if (date) formData.append("date_of_birth", formatDate(date));
      if (gender) formData.append("gender", gender);
      if (division) formData.append("division", division);
      if (district) formData.append("district", district);
      if (thana) formData.append("thana", thana);

      if (mainProductCategory)
        formData.append("product_category", mainProductCategory);
      if (mobileBankName) formData.append("mobile_bank_name", mobileBankName);

      if (creator === "admin") {
        const res = await axiosPublic.post("/create-sellers", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.data?.createdCount > 0) {
          Swal.fire({
            icon: "success",
            title: "Seller Created Successful!",
            toast: true,
            position: "top",
            timer: 1500,
            showConfirmButton: false,
          });

          reset();
          setNidBackImg(null);
          setNidFrontImg(null);
          setGender("");
          setDivision("");
          setDistrict("");
          setThana("");
           setMainProductCategory("");
          setMobileBankName("");
          setIsAcceptTerms(false);
          setDate(null);
          refetch();
          window.location.reload();
          return;
        }
      } else {
        const res = await axiosPublic.post("/sellers", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.data?.otp_required) {
          Swal.fire({
            icon: "info",
            title: "OTP sent to your email!",
            toast: true,
            position: "top",
            timer: 1500,
            showConfirmButton: false,
          });
          navigate("/verify-otp", {
            replace: true,
            state: {
              email: data.email,
              from: "seller-register",
              pathName: location?.state?.pathName,
            },
          });
          reset();
          setNidBackImg(null);
          setNidFrontImg(null);
          setGender("");
          setDivision("");
          setDistrict("");
          setThana("");
           setMainProductCategory("");
          setMobileBankName("");
          setIsAcceptTerms(false);
          setDate(null);
          refetch();
          return;
        }
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: error.response?.data?.message || "Something went wrong!",
        timer: 1500,
        toast: true,
        position: "top",
        showConfirmButton: false,
      });
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* --- Account Details --- */}
        <AccountDetails
          PRIMARY_COLOR={PRIMARY_COLOR}
          register={register}
          errors={errors}
        />

        {/* --- Personal Information --- */}
        <PersonalInformation
          PRIMARY_COLOR={PRIMARY_COLOR}
          register={register}
          errors={errors}
          date={date}
          setDate={setDate}
          gender={gender}
          setGender={setGender}
        />
        {/* --- Store, Business Details & Documents --- */}
        <BusinessDetails
          PRIMARY_COLOR={PRIMARY_COLOR}
          register={register}
          errors={errors}
          setNidFrontImg={setNidFrontImg}
          nidFrontImg={nidFrontImg}
          nidBackImg={nidBackImg}
          setNidBackImg={setNidBackImg}
          setMainProductCategory={setMainProductCategory}
          mainProductCategory={mainProductCategory}
          division={division}
          setDivision={setDivision}
          district={district}
          setDistrict={setDistrict}
          thana={thana}
          setThana={setThana}
        />

        {/* --- Payment Details --- */}
        <PaymentDetails
          PRIMARY_COLOR={PRIMARY_COLOR}
          register={register}
          errors={errors}
          mobileBankName={mobileBankName}
          setMobileBankName={setMobileBankName}
        />

        {/* --- Terms and Conditions --- */}
        <div className="pt-4">
          <div className="flex items-start">
            <input
              id="acceptTerms"
              name="acceptTerms"
              type="checkbox"
              className="checkbox checkbox-secondary checkbox-xs rounded-sm"
              checked={isAcceptTerms}
              onChange={() => setIsAcceptTerms(!isAcceptTerms)}
            />
            <label
              htmlFor="acceptTerms"
              className="ml-2 block text-sm text-gray-900 cursor-pointer select-none"
            >
              I have carefully read and accept all the{" "}
              <a
                href="/seller-terms-conditions#"
                className="font-medium hover:underline"
                style={{ color: PRIMARY_COLOR }}
              >
                Terms and Conditions
              </a>
              .
            </label>
          </div>
        </div>

        {/* --- Submit Button and Message --- */}
        <div className="pt-6">
          {!(isValid && isAcceptTerms) ? (
            <Button
              disabled
              type="submit"
              className="w-full bg-gray-300 text-gray-500 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold  "
            >
              {creator === "admin" ? "Submit" : "Complete Registration"}
            </Button>
          ) : (
            <Button
              type="submit"
              className={`w-full bg-[#00C853] hover:bg-[#00B34A] text-white flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-lg text-lg font-bold  cursor-pointer`}
            >
              {creator === "admin" ? "Submit" : "Complete Registration"}
            </Button>
          )}
        </div>

        {/* --- Status Message --- */}
      </form>
    </div>
  );
}
