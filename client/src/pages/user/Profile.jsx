// client\src\pages\user\Profile.jsx
import React, { useEffect, useState } from "react";
import { User as UserIcon, CalendarDays, Edit2, ShieldCheck, Settings, Clock, Upload, AlertCircle } from "lucide-react";
import useEcomStore from "../../store/ecom-store.jsx";
import axios from "axios";

const ORANGE = "#F16323";
const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=60";

export default function Profile() {
  const user = useEcomStore((s) => s.user || s.currentUser || s.profile || {});
  const token = useEcomStore((s) => s.token);

  const actionUpdatePicture = useEcomStore((s) => s.actionUpdatePicture);
  const actionSetUser = useEcomStore((s) => s.actionSetUser);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [picture, setPicture] = useState("");
  const [tempFile, setTempFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success", "error"

  useEffect(() => {
    setName(user?.fullname || user?.name || user?.username || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setPicture(user?.picture || user?.avatar || FALLBACK_AVATAR);
  }, [user]);

  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showMessage("Please select an image file", "error");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage("File size must be less than 5MB", "error");
      return;
    }

    setTempFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      setPicture(event.target?.result || "");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
  try {
    setLoading(true);

    // 1) Upload picture (ถ้ามีเลือกไฟล์ใหม่)
    if (tempFile) {
      const response = await axios.post(
        "http://localhost:5000/api/user/profile-picture",
        { pictureUrl: picture },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.ok) {
        const newPic = response.data.picture;
        setPicture(newPic);
        actionUpdatePicture(newPic);   // ✅ สำคัญ: ทำให้ persist อัปเดต
        setTempFile(null);
        showMessage("Profile picture updated successfully!");
      }
    }

    // 2) Update profile fields
    const response2 = await axios.post(
      "http://localhost:5000/api/user/profile",
      { name, email, phone },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response2.data?.ok) {
      const updated = response2.data.user || {};
      // ✅ รวมของเดิม + ของใหม่ (กัน field หาย)
      const merged = { ...(user || {}), ...updated };

      // ✅ ถ้า server ไม่ส่ง picture กลับมา ให้คงค่า picture ปัจจุบันไว้
      if (!merged.picture) merged.picture = picture;

      actionSetUser(merged);
      showMessage("Profile updated successfully!");
    }

    setEditing(false);
  } catch (err) {
    console.error("Error saving profile:", err);
    showMessage(err.response?.data?.message || "Error saving profile", "error");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="w-full">
      {/* Page header */}
      <div className="mb-6 flex items-center gap-4">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg" style={{ background: `${ORANGE}22` }}>
          <UserIcon className="h-6 w-6" style={{ color: ORANGE }} />
        </div>
        <div>
          <div className="text-2xl font-bold" style={{ color: ORANGE }}>Profile</div>
          <div className="text-sm text-black/50">Personal information and account verification</div>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`rounded-[10px] p-4 mb-6 flex items-center gap-3 ${
            messageType === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <AlertCircle
            className="h-5 w-5"
            style={{ color: messageType === "success" ? "#22c55e" : "#ef4444" }}
          />
          <span style={{ color: messageType === "success" ? "#22c55e" : "#ef4444" }}>
            {message}
          </span>
        </div>
      )}

      {/* Top profile summary card */}
      <div className="rounded-[10px] border px-6 py-6 mb-6" style={{ borderColor: ORANGE }}>
        <div className="flex items-center gap-6">
          <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-[#F16323]/10 flex items-center justify-center group">
            <img
              src={picture}
              alt={name}
              className="h-full w-full object-cover"
              onError={(e) => (e.currentTarget.src = FALLBACK_AVATAR)}
            />
            {editing && (
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="h-6 w-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex-1">
            <div className="text-lg font-bold" style={{ color: ORANGE }}>{name || "-"}</div>
            <div className="text-sm mt-1" style={{ color: ORANGE }}>{email || "-"}</div>

            <div className="mt-3 flex items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs" style={{ borderColor: ORANGE, color: ORANGE }}>
                <UserIcon className="h-3 w-3" />
                Student
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs" style={{ borderColor: ORANGE, color: ORANGE }}>
                <CalendarDays className="h-3 w-3" />
                Member since August 2025
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs" style={{ borderColor: ORANGE, color: ORANGE }}>
                KMITL
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex w-full max-w-[760px] items-center justify-start">
        <div className="rounded-full bg-[#F16323] p-1 flex gap-3">
          <button className="rounded-full bg-white text-[#F16323] px-5 py-2 flex items-center gap-2 font-semibold">
            <UserIcon className="h-4 w-4" />
            Personal
          </button>
          <button className="px-5 py-2 text-white flex items-center gap-2 opacity-80">
            <ShieldCheck className="h-4 w-4" />
            Security
          </button>
          <button className="px-5 py-2 text-white flex items-center gap-2 opacity-80">
            <Settings className="h-4 w-4" />
            Setting
          </button>
          <button className="px-5 py-2 text-white flex items-center gap-2 opacity-80">
            <Clock className="h-4 w-4" />
            Activity
          </button>
        </div>
      </div>

      {/* Personal section */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3 text-lg font-semibold" style={{ color: ORANGE }}>
          <UserIcon className="h-5 w-5" />
          Personal
        </div>
      </div>

      <div className="rounded-[10px] border p-6 relative" style={{ borderColor: ORANGE }}>
        {/* Edit button top-right */}
        <div className="absolute right-4 top-4">
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm"
              style={{ borderColor: ORANGE, color: ORANGE }}
            >
              <Edit2 className="h-4 w-4" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setPicture(user?.picture || user?.avatar || FALLBACK_AVATAR);
                  setTempFile(null);
                }}
                disabled={loading}
                className="rounded-full border px-3 py-1 text-sm disabled:opacity-50"
                style={{ borderColor: ORANGE, color: ORANGE }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={loading}
                className="rounded-full bg-[#F16323] px-3 py-1 text-sm text-white disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mb-6 text-base font-semibold" style={{ color: ORANGE }}>
          <UserIcon className="h-5 w-5" />
          Basic Personal
        </div>

        <div className="grid grid-cols-1 gap-4">
          <label className="flex flex-col gap-2 text-sm text-[#F16323]">
            <span className="text-xs">Name - Last Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!editing}
              className="rounded-md border px-3 py-2 text-sm outline-none disabled:opacity-60"
              style={{ borderColor: ORANGE }}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-[#F16323]">
            <span className="text-xs">E-mail</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!editing}
              className="rounded-md border px-3 py-2 text-sm outline-none disabled:opacity-60"
              style={{ borderColor: ORANGE }}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-[#F16323]">
            <span className="text-xs">Number</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={!editing}
              className="rounded-md border px-3 py-2 text-sm outline-none disabled:opacity-60"
              style={{ borderColor: ORANGE }}
            />
          </label>
        </div>
      </div>
    </div>
  );
}