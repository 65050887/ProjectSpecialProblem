import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import useEcomStore from "../../store/ecom-store";

const ORANGE = "#F16323";

export default function Login({ open = false, onClose }) {
  const navigate = useNavigate();
  const actionLogin = useEcomStore((state) => state.actionLogin);

  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const canSubmit = useMemo(() => {
    return form.email.trim() && form.password.trim();
  }, [form.email, form.password]);

  const handleOnChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const roleRedirect = (role) => {
    navigate("/user");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await actionLogin(form);
      const role = res?.data?.payload?.role;
      toast.success("Welcome back!");
      roleRedirect(role);

      // ปิด popup หลัง login สำเร็จ
      if (onClose) onClose();
    } catch (err) {
      const errMsg = err?.response?.data?.message || "Login failed";
      toast.error(errMsg);
    }
  };

  const handleRegister = () => {
    // ถ้าเป็น popup route: ปิดแล้วไปหน้า register
    if (onClose) onClose();
    navigate("/register");
  };

  const handleClose = () => {
    if (onClose) return onClose();
    navigate("/"); // เผื่อเรียกตรงๆ
  };

  // if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center">
      {/* Backdrop */}
      <button
        aria-label="Close login modal"
        onClick={handleClose}
        className="absolute inset-0 bg-black/20"
      />

      {/* Modal (ตาม Figma/CSS ที่ให้มา) */}
      <div
        className="relative mt-[144px] w-[640px] h-[400px] bg-white border rounded-[20px] shadow-sm"
        style={{ borderColor: ORANGE }}
        role="dialog"
        aria-modal="true"
      >
        {/* Inner Frame 554 (548x340, left 52, top 20) */}
        <div className="absolute left-[52px] top-[20px] w-[548px] h-[340px] flex flex-col items-end gap-1">
          {/* Close icon */}
          <button
            onClick={handleClose}
            className="w-6 h-6 flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-6 h-6" style={{ color: ORANGE }} />
          </button>

          {/* Frame 553 */}
          <div className="w-[548px] h-[305px] flex flex-col items-center gap-10">
            {/* Title */}
            <h2
              className="w-[548px] h-5 flex items-center justify-center text-center font-bold text-[20px] leading-[26px]"
              style={{ color: ORANGE, fontFamily: "LINE Seed Sans" }}
            >
              Login to your account
            </h2>

            {/* Frame 552 */}
            <div className="w-[548px] h-[245px] relative">
              <form onSubmit={handleSubmit} className="w-full h-full">
                {/* Frame 549 */}
                <div className="absolute left-0 top-0 w-[540px] h-[178px] flex flex-col items-start gap-5">
                  {/* Email */}
                  <div className="w-[540px] h-[63px] flex flex-col items-start gap-2">
                    <label
                      className="w-[540px] h-4 flex items-center text-[12px] leading-[19px]"
                      style={{ color: ORANGE, fontFamily: "LINE Seed Sans TH" }}
                    >
                      Email
                    </label>

                    <div
                      className="w-[540px] h-[39px] flex items-center px-[28px] py-1 border bg-white rounded-[20px]"
                      style={{ borderColor: ORANGE }}
                    >
                      <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleOnChange}
                        placeholder="example@gmail.com"
                        className="w-full outline-none bg-transparent text-[14px] leading-[22px]"
                        style={{
                          color: "#4E4E4E",
                          fontFamily: "LINE Seed Sans TH",
                        }}
                      />
                    </div>
                  </div>

                  {/* Password + forget */}
                  <div className="w-[540px] h-[95px] flex flex-col items-end gap-4">
                    <div className="w-[540px] h-[63px] flex flex-col items-start gap-2">
                      <label
                        className="w-[540px] h-4 flex items-center text-[12px] leading-[16px]"
                        style={{ color: ORANGE, fontFamily: "LINE Seed Sans" }}
                      >
                        Password
                      </label>

                      <div
                        className="w-[540px] h-[39px] flex items-center px-[28px] py-1 border bg-white rounded-[20px]"
                        style={{ borderColor: ORANGE }}
                      >
                        <input
                          name="password"
                          type={showPw ? "text" : "password"}
                          value={form.password}
                          onChange={handleOnChange}
                          placeholder="password"
                          className="w-full outline-none bg-transparent text-[14px] leading-[22px]"
                          style={{
                            color: "#4E4E4E",
                            fontFamily: "LINE Seed Sans TH",
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => setShowPw((s) => !s)}
                          className="ml-3 w-5 h-5 flex items-center justify-center"
                          aria-label={showPw ? "Hide password" : "Show password"}
                        >
                          {showPw ? (
                            <EyeOff className="w-5 h-5" style={{ color: ORANGE }} />
                          ) : (
                            <Eye className="w-5 h-5" style={{ color: ORANGE }} />
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="w-[540px] h-4 text-right font-bold text-[12px] leading-[19px]"
                      style={{ color: ORANGE, fontFamily: "LINE Seed Sans TH" }}
                      onClick={() => toast.info("Forgot password coming soon")}
                    >
                      Forget Password ?
                    </button>
                  </div>
                </div>

                {/* Buttons Row (absolute) */}
                <div className="absolute left-0 top-[206px] w-[540px] h-[39px] flex gap-5">
                  {/* Register (left) */}
                  <button
                    type="button"
                    onClick={handleRegister}
                    className="w-[260px] h-[39px] flex items-center justify-center border rounded-[10px]"
                    style={{
                      background: "#FFFFFF",
                      borderColor: "#E65100",
                      fontFamily: "LINE Seed Sans TH",
                      color: "#E65100",
                      fontSize: 14,
                      lineHeight: "22px",
                      fontWeight: 400,
                    }}
                  >
                    Register
                  </button>

                  {/* Login (right) */}
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-[260px] h-[39px] flex items-center justify-center border rounded-[10px disabled:opacity-60 disabled:cursor-not-allowed rounded-md"
                    style={{
                      background: ORANGE,
                      borderColor: ORANGE,
                      fontFamily: "LINE Seed Sans TH",
                      color: "#FFFFFF",
                      fontSize: 14,
                      lineHeight: "22px",
                      fontWeight: 400,
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
    </div>
  );
}