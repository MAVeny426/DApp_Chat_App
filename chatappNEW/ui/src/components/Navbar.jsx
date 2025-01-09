import React from 'react';
import { Link } from 'react-router-dom'; 

const Navbar = () => {
  return (
  <div className="flex space-x-4">
    <Link to="/" className="text-black no-underline text-lg hover:text-gray-400">Home</Link>
    <Link to="/AllUsersPage" className="text-black no-underline text-lg hover:text-gray-400">All Users</Link>
    {/* <Link to="/create-account" className="text-black no-underline text-lg hover:text-gray-400">Create Account</Link> */}
    <Link to="/chats" className="text-black no-underline text-lg hover:text-gray-400">Chats requests</Link>
    {/* <Link to="/settings" className="text-white no-underline text-lg hover:text-gray-400">Settings</Link> */}
    {/* <Link to="/profile" className="text-white no-underline text-lg hover:text-gray-400">Profile</Link> */}
    {/* <Link to="/friends" className="text-white no-underline text-lg hover:text-gray-400">Friends</Link> */}
    <Link to="/AccountCreate" className="text-black no-underline text-lg hover:text-gray-400">Account Create</Link>
    <Link to="/MakeChat" className="text-black no-underline text-lg hover:text-gray-400">Make Chats</Link>



  </div>
  );
};

export default Navbar;
