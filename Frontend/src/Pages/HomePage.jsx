import React, { useState } from "react";
import LeftSideBar from "../components/LeftSideBar";
import { Outlet } from "react-router-dom";
import { UserContext } from "../UserContext";

const HomePage = () => {
  const [auth, setAuth] = useState(null);

  return (
    <UserContext.Provider value={{ auth, setAuth }}>
      <div className="flex flex-col md:flex-row ">
        <div className="w-full md:w-[15%] min-w-[250px] ">
          <LeftSideBar />
        </div>
        <div className="w-full bg-gradient-to-bl from-[#ffe4e6] h-[100vh] to-[#ccfbf1] md:w-[75%] flex-grow">
          <Outlet />
        </div>
      </div>
    </UserContext.Provider>
  );
};

export default HomePage;
