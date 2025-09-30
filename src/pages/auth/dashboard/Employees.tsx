import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter, 
  RefreshCw, 
  User, 
  Mail, 
  Calendar,
  Shield,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import axios from "axios";
import { useSelector } from 'react-redux';
import type { RootState } from '../../../redux/store';

// API Response Types
interface Employee {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  sign_up_type: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    count: number;
    page: number;
    page_size: number;
    total_pages: number;
    ordering: string;
    results: Employee[];
  };
}

const Employees = () => {
  const { token } = useSelector((state: RootState) => state.auth);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [pageSize] = useState(10);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [signUpTypeFilter, setSignUpTypeFilter] = useState('');
  const [adminFilter, setAdminFilter] = useState('');
  const [ordering, setOrdering] = useState('-created_at');
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(false);

  // Fetch employees from API
  const fetchEmployees = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if user is authenticated
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('page_size', pageSize.toString());
      params.append('ordering', ordering);
      
      // Add search query
      if (searchQuery.trim()) {
        params.append('q', searchQuery.trim());
      }
      
      // Add filters
      if (signUpTypeFilter) {
        params.append('sign_up_type', signUpTypeFilter);
      }
      
      if (adminFilter) {
        params.append('is_admin', adminFilter);
      }
      
      const response = await axios.get<ApiResponse>(
        `${import.meta.env.VITE_PUBLIC_AUTH_URL}/user/admin/users/?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (response.data.success) {
        setEmployees(response.data.data.results);
        setCurrentPage(response.data.data.page);
        setTotalPages(response.data.data.total_pages);
        setTotalEmployees(response.data.data.count);
      } else {
        setError('Failed to fetch employees');
      }
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      
      // Handle authentication errors
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. You do not have permission to view employees.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch employees');
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchEmployees(1);
    setAppliedFilters(true);
  };

  // Handle filter changes
  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchEmployees(1);
    setAppliedFilters(true);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setSignUpTypeFilter('');
    setAdminFilter('');
    setOrdering('-created_at');
    setCurrentPage(1);
    setAppliedFilters(false);
    fetchEmployees(1);
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchEmployees(page);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get sign up type badge color
  const getSignUpTypeColor = (type: string) => {
    switch (type) {
      case 'google':
        return 'bg-blue-100 text-blue-700';
      case 'email':
        return 'bg-green-100 text-green-700';
      case 'microsoft':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200/60">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#078586]/20 border-t-[#078586] mx-auto mb-6"></div>
          <p className="text-[#282F3B] text-lg font-medium">Loading employees...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="max-w-full mx-auto px-8 py-6">
        {/* Header */}
        <div className="mb-8 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200/60">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-semibold text-[#282F3B] mb-2">
                Employee Management
              </h1>
              <p className="text-[#282F3B]/70">
                Manage and view all employees in your organization.
                {loading && (
                  <span className="ml-2 text-xs text-[#078586]">
                    • Updating data...
                  </span>
                )}
              </p>
            </div>
            <Button
              onClick={() => fetchEmployees(currentPage)}
              disabled={loading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-6 bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-200/60">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#282F3B]/50 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 border-[#282F3B]/20 focus:border-[#078586]"
                />
              </div>
            </div>
            
            {/* Filter Toggle */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filters
              {appliedFilters && (
                <span className="w-2 h-2 bg-[#078586] rounded-full"></span>
              )}
            </Button>
            
            {/* Search Button */}
            <Button
              onClick={handleSearch}
              className="bg-[#078586] hover:bg-[#078586]/90 text-white"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sign Up Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-[#282F3B] mb-2">
                    Sign Up Type
                  </label>
                  <select
                    value={signUpTypeFilter}
                    onChange={(e) => setSignUpTypeFilter(e.target.value)}
                    className="w-full p-2 border border-[#282F3B]/20 rounded-lg focus:border-[#078586] focus:outline-none"
                  >
                    <option value="">All Types</option>
                    <option value="google">Google</option>
                    <option value="email">Email</option>
                    <option value="microsoft">Microsoft</option>
                  </select>
                </div>

                {/* Admin Filter */}
                <div>
                  <label className="block text-sm font-medium text-[#282F3B] mb-2">
                    Admin Status
                  </label>
                  <select
                    value={adminFilter}
                    onChange={(e) => setAdminFilter(e.target.value)}
                    className="w-full p-2 border border-[#282F3B]/20 rounded-lg focus:border-[#078586] focus:outline-none"
                  >
                    <option value="">All Users</option>
                    <option value="true">Admins Only</option>
                    <option value="false">Non-Admins Only</option>
                  </select>
                </div>

                {/* Ordering */}
                <div>
                  <label className="block text-sm font-medium text-[#282F3B] mb-2">
                    Sort By
                  </label>
                  <select
                    value={ordering}
                    onChange={(e) => setOrdering(e.target.value)}
                    className="w-full p-2 border border-[#282F3B]/20 rounded-lg focus:border-[#078586] focus:outline-none"
                  >
                    <option value="-created_at">Newest First</option>
                    <option value="created_at">Oldest First</option>
                    <option value="email">Email A-Z</option>
                    <option value="-email">Email Z-A</option>
                    <option value="first_name">Name A-Z</option>
                    <option value="-first_name">Name Z-A</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={handleFilterChange}
                  className="bg-[#078586] hover:bg-[#078586]/90 text-white"
                >
                  Apply Filters
                </Button>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Employees Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden">
          <div className="p-6 border-b border-gray-200/60">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-[#282F3B]">
                Employees ({totalEmployees})
              </h2>
              <div className="text-sm text-[#282F3B]/70">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200/60">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#282F3B]">Employee</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#282F3B]">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#282F3B]">Sign Up Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#282F3B]">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#282F3B]">Created</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-[#282F3B]">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/60">
                {loading ? (
                  // Loading state
                  Array.from({ length: pageSize }).map((_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse mr-4"></div>
                          <div>
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : employees.length > 0 ? (
                  employees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-gray-50/50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-[#078586]/10 to-[#078586]/5 rounded-full flex items-center justify-center mr-4">
                            <User className="w-5 h-5 text-[#078586]" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[#282F3B]">
                              {employee.first_name} {employee.last_name}
                            </div>
                            <div className="text-xs text-[#282F3B]/60">
                              ID: {employee.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-[#078586]" />
                          <span className="text-sm text-[#282F3B]/70">
                            {employee.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSignUpTypeColor(employee.sign_up_type)}`}>
                          {employee.sign_up_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {employee.is_admin ? (
                            <>
                              <ShieldCheck className="w-4 h-4 mr-2 text-green-600" />
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Admin
                              </span>
                            </>
                          ) : (
                            <>
                              <Shield className="w-4 h-4 mr-2 text-gray-500" />
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                User
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-[#078586]" />
                          <span className="text-sm text-[#282F3B]/70">
                            {formatDate(employee.created_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-[#282F3B]/70">
                          {formatDate(employee.updated_at)}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-center">
                        <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-[#282F3B]/70 text-lg">No employees found</p>
                        <p className="text-[#282F3B]/50 text-sm mt-2">
                          Try adjusting your search or filter criteria
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200/60 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-[#282F3B]/70">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalEmployees)} of {totalEmployees} employees
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      if (pageNum > totalPages) return null;
                      
                      return (
                        <Button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          disabled={loading}
                          variant={pageNum === currentPage ? "default" : "outline"}
                          size="sm"
                          className={pageNum === currentPage ? "bg-[#078586] hover:bg-[#078586]/90 text-white" : ""}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading}
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Employees;
