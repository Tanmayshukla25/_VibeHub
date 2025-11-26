// import React, { useState } from "react";
// import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import Register from "./components/UserRegister";
// import Login from "./components/UserLogin";
// import AddDob from "./Pages/AddDob";
// import MailConfirm from "./Pages/MailConfirm";

// import HomePage from "./Pages/HomePage";
// import Explore from "./SideBarComponents/Explore";
// import FrontPage from "./SideBarComponents/FrontPage";
// import ProtectedRoute from "./ProtectedRoute";
// import UserProfile from "./SideBarComponents/UserProfile";
// import { UserContext } from "./UserContext";
// import SearchBar from "./SideBarComponents/searchBar";
// import Followers from "./Connections/Followers";
// import Post from "./Connections/post";
// import Following from "./Connections/following";
// import Notification from "./SideBarComponents/Notification";
// import CreateProfile from "./Pages/CreateProfile";

// const App = () => {

//    const [auth, setAuth] = useState({
//     isAuthenticated: false,
//     user: null,
//   });

//   const router = createBrowserRouter([
//     { path: "/", element: <Login /> },
//     { path: "/register", element: <Register /> },
//     { path: "/dob", element: <AddDob /> },
//     { path: "/mail", element: <MailConfirm /> },
//     { path: "/profile", element: <CreateProfile /> },

//     {
//       path: "/home",
//       element: (
//         <ProtectedRoute>
//           <HomePage />
//         </ProtectedRoute>
//       ),
//       children: [
//         { index: true, element: <FrontPage /> },
//         { path: "/home/explore", element: <Explore /> },
//         { path: "/home/UserProfile", element: <UserProfile /> },
//         { path: "/home/SearchBar", element: <SearchBar/> },
//         { path: "/home/post", element: <Post/> },
//         { path: "/home/following", element: <Following/> },
//         { path: "/home/Followers", element: <Followers/> },
//         { path: "/home/Notification", element: <Notification/> },
//       ],
//     },
//   ]);

//   return (
//     <UserContext.Provider value={{ auth, setAuth, }}>
//       <RouterProvider router={router} />
//     </UserContext.Provider>
//   );
// };

// export default App;

import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Register from "./components/UserRegister";
import Login from "./components/UserLogin";
import AddDob from "./Pages/AddDob";
import MailConfirm from "./Pages/MailConfirm";
import HomePage from "./Pages/HomePage";
import Explore from "./SideBarComponents/Explore";
import FrontPage from "./SideBarComponents/FrontPage";
import ProtectedRoute from "./ProtectedRoute";
import UserProfile from "./SideBarComponents/UserProfile";
import SearchBar from "./SideBarComponents/searchBar";
import Followers from "./Connections/Followers";
import Post from "./Connections/post";
import Following from "./Connections/following";
import Notification from "./SideBarComponents/Notification";
import CreateProfile from "./Pages/CreateProfile";

// ✅ Import the UserProvider
import { UserProvider } from "./UserContext";
import CheckProfile from "./SideBarComponents/CheckProfile";
import ChatRoom from "./SideBarComponents/ChatRoom";
import ChatList from "./SideBarComponents/ChatList";
import MessagesPage from "./SideBarComponents/MessagesPage";
import SinglePostPage from "./SideBarComponents/SinglePostPage";
import ReelsComponent from "./SideBarComponents/ReelsComponent";

const App = () => {
  const router = createBrowserRouter([
    { path: "/", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/dob", element: <AddDob /> },
    { path: "/mail", element: <MailConfirm /> },
    { path: "/profile", element: <CreateProfile /> },

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
        { path: "/home/reels", element: <ReelsComponent/> },
        { path: "/home/UserProfile", element: <UserProfile /> },
        { path: "/home/SearchBar", element: <SearchBar /> },
        { path: "/home/post", element: <Post /> },
        { path: "/home/following", element: <Following /> },
        { path: "/home/following/:id", element: <Following /> },
        { path: "/home/Followers", element: <Followers /> },
        { path: "/home/followers/:id", element: <Followers /> },
        { path: "/home/Notification", element: <Notification /> },
        { path: "/home/CheckProfile/:id", element: <CheckProfile /> },
        { path: "/home/messages", element: <MessagesPage /> },
        { path: "/home/chat/:conversationId", element: <ChatRoom /> },
        { path: "/home/ChatList", element: <ChatList /> },
        { path: "/home/:postId", element: <SinglePostPage /> },
      ],
    },
  ]);

  return (
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  );
};

export default App;
