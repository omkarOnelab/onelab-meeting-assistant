import { useState } from 'react';
import { Layout } from 'antd';
import { useAuth } from '../hooks/useAuth';
import LeftSidebar from '../components/auth/dashboard/components/LeftSidebar';
import Header from '../components/auth/dashboard/components/Header';
import MainContent from '../components/auth/dashboard/components/MainContent';
import './Dashboard.css';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('meetings');
  const { getUserFullName } = useAuth();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSearch = (value: string) => {
    console.log('Search:', value);
    // Implement search functionality
  };

  const handleUpgrade = () => {
    console.log('Upgrade clicked');
    // Implement upgrade functionality
  };

  const handleCapture = () => {
    console.log('Capture clicked');
    // Implement capture functionality
  };

  return (
    <Layout className="dashboard-layout">
      <LeftSidebar 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
      />
      
      <Layout className="main-content">
        <Header 
          onSearch={handleSearch}
          onUpgrade={handleUpgrade}
          onCapture={handleCapture}
          userName={getUserFullName()}
        />
        
        <MainContent activeTab={activeTab} />
      </Layout>
    </Layout>
  );
};

export default Dashboard;
