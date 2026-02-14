import axios from "axios";
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, X, ChevronDown, GraduationCap, Check } from "lucide-react";
import { toast } from "react-toastify";

const ORANGE = "#F16323";

export default function Register() {
  const navigate = useNavigate();

  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [agree, setAgree] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "Student",
  });

  const canSubmit = useMemo(() => {
    return (
      form.firstName.trim() &&
      form.lastName.trim() &&
      form.email.trim() &&
      form.password.trim() &&
      form.confirmPassword.trim() &&
      agree
    );
  }, [form, agree]);

  const handleOnChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClose = () => navigate("/");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Password and Confirm Password do not match");
      return;
    }

    try {
      // ✅ ปรับ payload ให้ตรง backend ของหนูได้ ถ้า backend รับไม่ตรง
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        accountType: form.accountType,
      };

      const res = await axios.post("http://localhost:5000/api/register", payload);

      toast.success(res?.data?.message || "Register success!");
      navigate("/login");
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Register failed";
      toast.error(errMsg);
      console.log(err);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-90px)] bg-white">
      {/* ✅ กล่องหลัก: width 628 height 750 top 144 */}
      <div className="absolute left-1/2 -translate-x-1/2 top-[144px] w-[628px] h-[750px]">
        {/* std - regis */}
        <div
          className="relative w-full h-full bg-white border rounded-[20px]"
          style={{ borderColor: ORANGE }}
        >
          {/* padding: 56px 36px 34px 48px */}
          <div className="w-full h-full flex items-start p-[56px_36px_34px_48px]">
            {/* Frame 743 */}
            <div className="relative w-[540px] h-[561px] flex flex-col items-center gap-10">
              {/* Close */}
              <button
                onClick={handleClose}
                className="absolute right-0 top-0 w-6 h-6 flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-6 h-6" style={{ color: ORANGE }} />
              </button>

              {/* Title: 20px */}
              <h1
                className="w-[540px] h-5 flex items-center justify-center text-center font-bold text-[20px] leading-[26px]"
                style={{ color: ORANGE, fontFamily: "LINE Seed Sans" }}
              >
                Register
              </h1>

              {/* Frame 742: ฟอร์มทั้งหมด */}
              <form
                onSubmit={handleSubmit}
                className="w-[540px] h-[501px] flex flex-col items-start gap-4"
              >
                {/* Row: First / Last */}
                <div className="w-[540px] h-[63px] flex items-center gap-5">
                  {/* First */}
                  <div className="w-[260px] h-[63px] flex flex-col items-start gap-2">
                    <label
                      className="w-full h-4 flex items-center text-[12px] leading-[19px]"
                      style={{ color: ORANGE, fontFamily: "LINE Seed Sans TH" }}
                    >
                      Username
                    </label>
                    <div
                      className="w-[260px] h-[39px] flex items-center px-[28px] border rounded-[20px]"
                      style={{ borderColor: ORANGE }}
                    >
                      <input
                        name="firstName"
                        value={form.firstName}
                        onChange={handleOnChange}
                        placeholder="FirstName"
                        className="w-full bg-transparent outline-none text-[14px] leading-[22px]"
                        style={{ color: "#4E4E4E", fontFamily: "LINE Seed Sans TH" }}
                      />
                    </div>
                  </div>

                  {/* Last */}
                  <div className="w-[280px] h-[63px] flex flex-col items-start gap-2">
                    <label
                      className="w-full h-4 flex items-center text-[12px] leading-[19px]"
                      style={{ color: ORANGE, fontFamily: "LINE Seed Sans TH" }}
                    >
                      Username
                    </label>
                    <div
                      className="w-[260px] h-[39px] flex items-center px-[28px] border rounded-[20px]"
                      style={{ borderColor: ORANGE }}
                    >
                      <input
                        name="lastName"
                        value={form.lastName}
                        onChange={handleOnChange}
                        placeholder="Lastname"
                        className="w-full bg-transparent outline-none text-[14px] leading-[22px]"
                        style={{ color: "#4E4E4E", fontFamily: "LINE Seed Sans TH" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="w-[540px] h-[63px] flex flex-col items-start gap-2">
                  <label
                    className="w-full h-4 flex items-center text-[12px] leading-[19px]"
                    style={{ color: ORANGE, fontFamily: "LINE Seed Sans TH" }}
                  >
                    Email
                  </label>
                  <div
                    className="w-[540px] h-[39px] flex items-center px-[28px] border rounded-[20px]"
                    style={{ borderColor: ORANGE }}
                  >
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleOnChange}
                      placeholder="example@gmail.com"
                      className="w-full bg-transparent outline-none text-[14px] leading-[22px]"
                      style={{ color: "#4E4E4E", fontFamily: "LINE Seed Sans TH" }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="w-[540px] h-[63px] flex flex-col items-start gap-2">
                  <label
                    className="w-full h-4 flex items-center text-[12px] leading-[16px]"
                    style={{ color: ORANGE, fontFamily: "LINE Seed Sans" }}
                  >
                    Password
                  </label>
                  <div
                    className="w-[540px] h-[39px] flex items-center px-[28px] border rounded-[20px]"
                    style={{ borderColor: ORANGE }}
                  >
                    <input
                      name="password"
                      type={showPw ? "text" : "password"}
                      value={form.password}
                      onChange={handleOnChange}
                      placeholder="password"
                      className="w-full bg-transparent outline-none text-[14px] leading-[22px]"
                      style={{ color: "#4E4E4E", fontFamily: "LINE Seed Sans TH" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="ml-3 w-5 h-5 flex items-center justify-center"
                      aria-label="Toggle password"
                    >
                      {showPw ? (
                        <EyeOff className="w-5 h-5" style={{ color: ORANGE }} />
                      ) : (
                        <Eye className="w-5 h-5" style={{ color: ORANGE }} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="w-[540px] h-[63px] flex flex-col items-start gap-2">
                  <label
                    className="w-full h-4 flex items-center text-[12px] leading-[16px]"
                    style={{ color: ORANGE, fontFamily: "LINE Seed Sans" }}
                  >
                    Confirm Password
                  </label>
                  <div
                    className="w-[540px] h-[39px] flex items-center px-[28px] border rounded-[20px]"
                    style={{ borderColor: ORANGE }}
                  >
                    <input
                      name="confirmPassword"
                      type={showCpw ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={handleOnChange}
                      placeholder="password confirmation"
                      className="w-full bg-transparent outline-none text-[14px] leading-[22px]"
                      style={{ color: "#4E4E4E", fontFamily: "LINE Seed Sans TH" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCpw((s) => !s)}
                      className="ml-3 w-5 h-5 flex items-center justify-center"
                      aria-label="Toggle confirm password"
                    >
                      {showCpw ? (
                        <EyeOff className="w-5 h-5" style={{ color: ORANGE }} />
                      ) : (
                        <Eye className="w-5 h-5" style={{ color: ORANGE }} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Account Type */}
                <div className="w-[540px] h-[127px] flex flex-col items-start gap-4">
                  <label
                    className="w-full h-4 flex items-center text-[12px] leading-[19px]"
                    style={{ color: ORANGE, fontFamily: "LINE Seed Sans TH" }}
                  >
                    Account Type
                  </label>

                  <div
                    className="w-[540px] h-[39px] flex items-center px-[24px] border rounded-[20px]"
                    style={{ borderColor: ORANGE }}
                  >
                    <div className="flex w-full items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-6 h-6" style={{ color: ORANGE }} />
                        <span
                          className="inline-flex items-center justify-center rounded-[30px] px-3 py-1 text-[12px] leading-[19px]"
                          style={{
                            background: ORANGE,
                            color: "#fff",
                            fontFamily: "LINE Seed Sans TH",
                          }}
                        >
                          {form.accountType}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          name="accountType"
                          value={form.accountType}
                          onChange={handleOnChange}
                          className="appearance-none bg-transparent outline-none text-[12px] font-bold"
                          style={{ color: ORANGE, fontFamily: "LINE Seed Sans TH" }}
                        >
                          <option value="Student">Student</option>
                          <option value="User">User</option>
                        </select>
                        <ChevronDown className="w-6 h-6" style={{ color: ORANGE }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Agree row: top 511 */}
                <div className="w-[540px] flex items-center gap-3 mt-[6px]">
                  <button
                    type="button"
                    onClick={() => setAgree((v) => !v)}
                    className="w-[25px] h-[25px] border rounded-[5px] flex items-center justify-center"
                    style={{ borderColor: ORANGE }}
                    aria-label="Agree"
                  >
                    {agree && <Check className="w-5 h-5" style={{ color: ORANGE }} />}
                  </button>

                  <div
                    className="text-[14px] leading-[22px]"
                    style={{ color: ORANGE, fontFamily: "LINE Seed Sans TH" }}
                  >
                    Agree to the{" "}
                    <button type="button" className="underline">
                      Terms
                    </button>{" "}
                    of Use and{" "}
                    <button type="button" className="underline">
                      Privacy Policy
                    </button>
                  </div>
                </div>

                {/* Buttons: width 420 + 113 height 39 */}
                <div className="w-[541px] h-[39px] flex items-center gap-2 mt-[12px]">
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-[420px] h-[39px] rounded-[5px] border flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{
                      background: ORANGE,
                      borderColor: ORANGE,
                      color: "#fff",
                      fontFamily: "LINE Seed Sans TH",
                      fontSize: 14,
                      lineHeight: "22px",
                      fontWeight: 400,
                    }}
                  >
                    Create account
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="w-[113px] h-[39px] rounded-[5px] border flex items-center justify-center"
                    style={{
                      borderColor: "#E65100",
                      color: "#E65100",
                      fontFamily: "LINE Seed Sans TH",
                      fontSize: 14,
                      lineHeight: "22px",
                      fontWeight: 400,
                      background: "#fff",
                    }}
                  >
                    Login
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* กันชน bottom เผื่อจอเล็ก */}
      <div className="h-[980px]" />
    </div>
  );
}
