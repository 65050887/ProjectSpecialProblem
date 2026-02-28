// client/src/pages/auth/Login.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import useEcomStore from "../../store/ecom-store.jsx";
import { useTranslation } from "react-i18next";

const ORANGE = "#F16323";

export default function Login({ open = false, onClose }) {
  const navigate = useNavigate();
  const { t } = useTranslation(["auth", "common"]);
  const actionLogin = useEcomStore((state) => state.actionLogin);

  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const canSubmit = useMemo(() => {
    return form.email.trim() && form.password.trim();
  }, [form.email, form.password]);

  const handleOnChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const roleRedirect = () => {
    navigate("/user");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await actionLogin(form);
      const role = res?.data?.payload?.role;
      toast.success(t("welcomeBack", { ns: "auth" }));
      roleRedirect(role);

      if (onClose) onClose();
    } catch (err) {
      const errMsg = err?.response?.data?.message || t("loginFailed", { ns: "auth" });
      toast.error(errMsg);
    }
  };

  const handleRegister = () => {
    if (onClose) onClose();
    navigate("/register");
  };

  const handleClose = () => {
    if (onClose) return onClose();
    navigate("/");
  };

  // if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-start justify-center">
      <button
        aria-label={t("common:actions.close")}
        onClick={handleClose}
        className="absolute inset-0 bg-black/20"
      />

      <div
        className="relative mt-[144px] w-[640px] h-[400px] bg-white border rounded-[20px] shadow-sm"
        style={{ borderColor: ORANGE }}
        role="dialog"
        aria-modal="true"
      >
        <div className="absolute left-[52px] top-[20px] w-[548px] h-[340px] flex flex-col items-end gap-1">
          <button
            onClick={handleClose}
            className="w-6 h-6 flex items-center justify-center"
            aria-label={t("common:actions.close")}
          >
            <X className="w-6 h-6" style={{ color: ORANGE }} />
          </button>

          <div className="w-[548px] h-[305px] flex flex-col items-center gap-10">
            <h2
              className="w-[548px] h-5 flex items-center justify-center text-center font-bold text-[20px] leading-[26px]"
              style={{ color: ORANGE, fontFamily: "LINE Seed Sans" }}
            >
              {t("loginTitle", { ns: "auth" })}
            </h2>

            <div className="w-[548px] h-[245px] relative">
              <form onSubmit={handleSubmit} className="w-full h-full">
                <div className="absolute left-0 top-0 w-[540px] h-[178px] flex flex-col items-start gap-5">
                  <div className="w-[540px] h-[63px] flex flex-col items-start gap-2">
                    <label
                      className="w-[540px] h-4 flex items-center text-[12px] leading-[19px]"
                      style={{ color: ORANGE, fontFamily: "LINE Seed Sans TH" }}
                    >
                      {t("email", { ns: "auth" })}
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
                        placeholder={t("emailPlaceholder", { ns: "auth" })}
                        className="w-full outline-none bg-transparent text-[14px] leading-[22px]"
                        style={{
                          color: "#4E4E4E",
                          fontFamily: "LINE Seed Sans TH",
                        }}
                      />
                    </div>
                  </div>

                  <div className="w-[540px] h-[95px] flex flex-col items-end gap-4">
                    <div className="w-[540px] h-[63px] flex flex-col items-start gap-2">
                      <label
                        className="w-[540px] h-4 flex items-center text-[12px] leading-[16px]"
                        style={{ color: ORANGE, fontFamily: "LINE Seed Sans" }}
                      >
                        {t("password", { ns: "auth" })}
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
                          placeholder={t("passwordPlaceholder", { ns: "auth" })}
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
                          aria-label={
                            showPw
                              ? t("hidePassword", { ns: "auth" })
                              : t("showPassword", { ns: "auth" })
                          }
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
                      onClick={() => toast.info(t("forgotPasswordSoon", { ns: "auth" }))}
                    >
                      {t("forgotPassword", { ns: "auth" })}
                    </button>
                  </div>
                </div>

                <div className="absolute left-0 top-[206px] w-[540px] h-[39px] flex gap-5">
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
                    {t("register", { ns: "auth" })}
                  </button>

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
                    {t("login", { ns: "auth" })}
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