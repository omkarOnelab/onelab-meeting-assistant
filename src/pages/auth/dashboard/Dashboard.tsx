import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/auth/dashboard/AppSidebar";
import DashboardHeader from "@/components/auth/dashboard/DashboardHeader";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-surface flex w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;