import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Register from "./components/UserRegister";
import Login from "./components/UserLogin";
import AddDob from "./Pages/AddDob";
import MailConfirm from "./Pages/MailConfirm";
import CreateProfile from "./Pages/CreateProfile ";
import HomePage from "./Pages/HomePage";
import Explore from "./SideBarComponents/Explore";
import FrontPage from "./SideBarComponents/FrontPage";
import ProtectedRoute from "./ProtectedRoute";

const router = createBrowserRouter([
  { path: "/", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/dob", element: <AddDob /> },
  { path: "/mail", element: <MailConfirm /> },
  { path: "profile", element: <CreateProfile /> },

  {
    path: "/home",
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <FrontPage /> },
      { path: "/home/explore", element: <Explore /> },
    ],
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
