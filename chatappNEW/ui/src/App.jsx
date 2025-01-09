import React from 'react';
import { createBrowserRouter, createRoutesFromElements, RouterProvider, Route, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import AccountCreate from './pages/AccountCreate';
import AllUsersPage from './pages/AllUsersPage';
import Chats from './pages/Chats';
import MakeChat from './pages/MakeChat';


const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* A common layout with Navbar */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          {/* <Route path="/create-account" element={<CreateAccount />} /> */}
          <Route path="/AccountCreate" element={<AccountCreate/>} />
          <Route path="/AllUsersPage" element={<AllUsersPage />} />
          <Route path="/Chats" element={<Chats />} />
          <Route path='/MakeChat' element={<MakeChat/>} />
        </Route>
      </>
    )
  );

  return <RouterProvider router={router} />;
};

// Layout component to wrap Navbar with routes
const Layout = () => (
  <div>
    <Navbar />
    {/* This will render the nested route component */}
    <Outlet />
  </div>
);

export default App;
