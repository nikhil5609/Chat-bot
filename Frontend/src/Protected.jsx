import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const Protected = () => {
  const isLoggedin = useSelector((state) => state.user?.isLoggedin);
    
  return isLoggedin ? <Navigate to="/" replace /> : <Outlet />;
};

export default Protected;
