// client/src/routes/AppRoutes.jsx
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// ✅ Public Layout
import Layout from "../layouts/Layout";
import Home from "../pages/Home";
import Search from "../pages/Search";
import Compare from "../pages/Compare";
import DormDetail from "../pages/DormDetail";

// auth
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// ✅ User Layout
import LayoutUser from "../layouts/LayoutUser";
import HomeUser from "../pages/user/HomeUser";
import SearchUser from "../pages/user/SearchUser";
import CompareUser from "../pages/user/CompareUser";
import DashboardUser from "../pages/user/DashboardUser";
import Profile from "../pages/user/Profile";
import FavoritesUser from "../pages/user/FavoritesUser";
import DormDetailUser from "../pages/user/DormDetailUser";

function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-10">
      <div className="text-center">
        <div className="text-3xl font-extrabold text-[#F16323]">404</div>
        <div className="mt-2 text-black/60">Page not found</div>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  // ===== PUBLIC =====
  {
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/search", element: <Search /> },
      { path: "/compare", element: <Compare /> },

      // ✅ เพิ่ม route DormDetail สำหรับ public (แก้ 404)
      { path: "/dorm/:dormId", element: <DormDetail /> },

      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },

      { path: "*", element: <NotFound /> },
    ],
  },

  // ===== USER =====
  {
    path: "/user",
    element: <LayoutUser />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <HomeUser /> },          // /user
      { path: "dashboard", element: <DashboardUser /> },
      { path: "search", element: <SearchUser /> },     // /user/search
      { path: "compare", element: <CompareUser /> },   // /user/compare
      { path: "profile", element: <Profile /> },       // /user/profile
      { path: "favorites", element: <FavoritesUser /> }, // ✅ แก้ตรงนี้
      { path: "dorm/:dormId", element: <DormDetailUser /> },

      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
