import React from "react";
import AllUsers from "../components/AllUsers";

const AllUsersPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
        View All Users
      </h1>
      <AllUsers />
    </div>
  );
};

export default AllUsersPage;
