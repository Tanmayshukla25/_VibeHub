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
       <div className="w-full md:w-[75%] bg-[#FFFBF3] flex-grow min-h-[100vh]">
          <Outlet />
        </div>
      </div>
    </UserContext.Provider>
  );
};

export default HomePage;
