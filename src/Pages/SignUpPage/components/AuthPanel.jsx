import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { User,  Camera } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import useAxiosPublic from "../../../Utils/Hooks/useAxiosPublic";
import DatePicker from "react-datepicker";
import SelectField from "../../../components/ui/SelectField";
import { useNavigate } from "react-router";

import { InputField } from "../../../components/ui/InputField";
import { useLocation } from "react-router";
import Cookies from "js-cookie";
import useAddress from "../../../Utils/Hooks/useAddress";

export default function AuthPanel({ type = "signup", onNavigate = () => {} }) {
  const axiosPublic = useAxiosPublic();
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,

    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
  });
  const navigate = useNavigate();
  const location = useLocation();

  const baseUrl = import.meta.env.VITE_BASEURL;
  const [image, setImage] = useState(null);
  const [gender, setGender] = useState("");
  const [division, setDivision] = useState("");
  const [district, setDistrict] = useState("");
  const [thana, setThana] = useState("");
  const [date, setDate] = useState(null);
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file); // এখন সরাসরি File object রাখছি
  };

  const isSignUp = type === "signup";

  const onSubmit = async (data) => {
    setLoading(true); // start loading
    try {
      if (isSignUp) {
        const formData = new FormData();

        // সাধারণ ফিল্ডগুলো FormData তে append করা
        formData.append("name", data.first_Name + " " + data.last_Name);
        formData.append("user_name", data.user_Name);
        formData.append("email", data.email);
        formData.append("phone", data.phone);
        formData.append("password", data.password);
        formData.append("date_of_birth", formatDate(date));
        formData.append("gender", gender);
        formData.append("address", data.address);
        formData.append("division", division);
        formData.append("district", district);
        formData.append("thana", thana);

        // profile image File object হিসেবে append করা
        if (image) {
          formData.append("profileImg", image);
        }

        const res = await axiosPublic.post("/register", formData, {
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
              from: "sign-up",
              pathName: location?.state?.pathName,
            },
          });
          reset();
          setImage(null);
          setDate(null);

          return;
        }
      } else {
        // Login Step
        const payload = {
          email: data.email,
          password: data.password,
          rememberMe,
        };
        const res = await axiosPublic.post("/login", payload);
        if (res.data?.token) {
          Cookies.set("token", res.data.token, {
            expires: rememberMe ? 30 : null,
            secure: true,
            sameSite: "Strict",
          });

          // Save email for pre-fill
          if (rememberMe) {
            Cookies.set("rememberedEmail", data.email, { expires: 30 });
            Cookies.set("rememberedPass", data.password, { expires: 30 });
          } else {
            Cookies.remove("rememberedEmail");
          }
        }

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
              from: "login",
              pathName: location?.state?.pathName,
            },
          });
          return;
        }
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: `${error.response?.data?.message}`,
        showConfirmButton: false,
        toast: true,
        position: "top",
        timer: 1500,
      });
    } finally {
      setLoading(false); // stop loading
    }
  };


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
  useEffect(() => {
    const email = Cookies.get("rememberedEmail");
    const password = Cookies.get("rememberedPass");

    if (email && password) {
      setRememberMe(true);

      // Pre-fill React Hook Form fields AND trigger validation
      setValue("email", email, { shouldValidate: true, shouldDirty: true });
      setValue("password", password, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [setValue,type]);


  return (
    <section className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-r from-[#FF0055] to-[#FF7B7B] p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-3xl"
      >
        <Card className="rounded-2xl shadow-2xl overflow-hidden">
          <CardContent className="p-8 bg-white">
            <div>
              {!isSignUp ? (
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
                  </div>
                </div>
              ) : (
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
              )}
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
              {isSignUp ? "Create Your Account" : "Welcome Back"}
            </h2>

            <p className="text-center text-gray-500 mb-6">
              <p className="text-center text-gray-500 mb-6">
                {isSignUp
                  ? "Join our community and enjoy exclusive deals."
                  : "Log in to access your account and continue shopping."}
              </p>
            </p>
            <form
              autoComplete="off"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {isSignUp && (
                <div className="flex flex-wrap gap-3">
                  <div className="flex-1">
                    <InputField
                      required
                      {...register("first_Name", {
                        required: "First name is required",
                        pattern: {
                          value: /^[A-Za-z]{2,20}$/,
                          message: "First name must be 2–20 letters only",
                        },
                      })}
                      label="First Name"
                      placeholder="First Name"
                      className={`w-full px-4 py-3 rounded-lg border border-gray-300
                       focus:outline-none focus:ring-2 focus:ring-[#FF0055]`}
                      errors={errors.first_Name}
                      errorsMessage={errors.first_Name?.message}
                    />
                  </div>

                  <div className="flex-1">
                    <InputField
                      required
                      {...register("last_Name", {
                        required: "Last name is required",
                        pattern: {
                          value: /^[A-Za-z]{2,20}$/,
                          message: "Last name must be 2–20 letters only",
                        },
                      })}
                      label="Last Name"
                      placeholder="Last Name"
                      className={`w-full px-4 py-3 rounded-lg border border-gray-300
                       focus:outline-none focus:ring-2 focus:ring-[#FF0055]`}
                      errors={errors.last_Name}
                      errorsMessage={errors.last_Name?.message}
                    />
                  </div>
                </div>
              )}

              <div>
                <InputField
                  required
                  type="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                  label="Email Address"
                  placeholder="Email Address"
                  className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF0055]`}
                  errors={errors.email}
                  errorsMessage={errors.email?.message}
                />
              </div>

              {isSignUp && (
                <div className="flex-1">
                  <InputField
                    required
                    type="number"
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^(?:\+?88)?01[3-9]\d{8}$/, // Bangladesh phone format
                        message: "Enter a valid Bangladeshi phone number",
                      },
                    })}
                    label="Phone Number"
                    placeholder="11-digit Phone Number"
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                        e.preventDefault(); // keyboard up/down disable
                      }
                    }}
                    className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF0055]`}
                    errors={errors.phone}
                    errorsMessage={errors.phone?.message}
                  />
                </div>
              )}

              <div>
                <InputField
                  required
                  type="password"
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
                  className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF0055]`}
                  errors={errors.password}
                  errorsMessage={errors.password?.message}
                />
              </div>

              {isSignUp && (
                <>
                  <div>
                    <InputField
                      required
                      type="password"
                      {...register("confirm_Password", {
                        required: "Confirm Password is required",
                        validate: (value, allValues) =>
                          value === allValues.password ||
                          "Passwords do not match",
                      })}
                      label="Confirm Password"
                      placeholder="Confirm Password"
                      className={`w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF0055]`}
                      errors={errors.confirm_Password}
                      errorsMessage={errors.confirm_Password?.message}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium mb-1">
                      Date Of Birth
                      <span className="text-red-500 ml-1">*</span>
                    </label>
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
                  <div className="grid md:grid-cols-3 gap-3">
                    

                    {/* Address */}
                    <div className="md:col-span-3">
                      <InputField
                        required
                        {...register("address", {
                          required: "Address is required",
                          pattern: {
                            value: /^[A-Za-z0-9\s,.'-]{5,100}$/,
                            message: "Enter a valid address (5–100 characters)",
                          },
                        })}
                        label="Address"
                        placeholder="Enter your address (e.g., House 12, Road 5, Banani)"
                        className={`w-full px-4 py-3 rounded-lg border  border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF0055]`}
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
                </>
              )}

              {!isSignUp && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <input
                      id="rememberMe"
                      type="checkbox"
                      className="checkbox checkbox-secondary checkbox-xs rounded-sm"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <label
                      htmlFor="rememberMe"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Remember Me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/reset")}
                    className="text-sm text-[#FF0055] hover:underline disabled:opacity-50"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-[#00C853] hover:bg-[#00B34A] text-white font-semibold py-3 rounded-lg shadow-lg  disabled:bg-gray-300 disabled:text-gray-500 transition-colors flex justify-center cursor-pointer gap-2"
                disabled={loading || !isValid}
              >
                {loading && (
                  <span className="loading loading-spinner loading-xs"></span>
                )}
                {isSignUp ? "Sign Up" : "Login"}
              </Button>
            </form>
            <div className="flex items-center my-6">
              <hr className="flex-grow border-gray-300" />
              <span className="mx-3 text-gray-400 text-sm">or</span>
              <hr className="flex-grow border-gray-300" />
            </div>
            <div className="space-y-3">
              <a
                href={`${baseUrl}/auth/google?state=${
                  location?.state?.pathName || "/"
                }`}
                role="button"
                className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 hover:bg-gray-50 transition disabled:opacity-50"
              >
                <FcGoogle size={20} />
                <span className="text-gray-700 font-medium">
                  Continue with Google
                </span>
              </a>
            </div>
            <p className="mt-6 text-sm text-center text-gray-500">
              {isSignUp ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => onNavigate("login")}
                    className="text-[#FF0055] font-medium hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    Log In
                  </button>
                </>
              ) : (
                <>
                  Don’t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => onNavigate("signup")}
                    className="text-[#FF0055] font-medium hover:underline disabled:opacity-50 cursor-pointer"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
