import React from "react";
import { useWallet } from "../contexts/WalletContext";
import LoginPage from "../components/LoginPage";
import Dashboard from "../components/Dashboard";

const Home: React.FC = () => {
  const { connected } = useWallet();
  
  return connected ? <Dashboard /> : <LoginPage />;
};

export default Home;
