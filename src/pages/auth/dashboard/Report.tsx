import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter,
  X,
  User,
} from "lucide-react";
import { useSelector } from 'react-redux';
import type { RootState } from '../../../redux/store';
import manualMeetingsService, {
  type ManualMeeting,
  type CreateManualMeetingRequest,
  type UpdateManualMeetingRequest,
  type ManualMeetingFilters,
} from "@/services/manualMeetingsService";
import { message } from "antd";

const Report = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.is_admin || false;
  const [meetings, setMeetings] = useState<ManualMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMeetings, setTotalMeetings] = useState(0);
  const pageSize = 10;
  
  // Filter states - only for visible table fields
  const [filters, setFilters] = useState<ManualMeetingFilters>({
    search_link: "",
    end_date: "",
    was_scheduled_on_calendar: undefined,
  });
  const [appliedFilters, setAppliedFilters] = useState<ManualMeetingFilters>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Ref to prevent duplicate API calls
  const isFetchingRef = useRef(false);
  const lastFetchParamsRef = useRef<{ page: number; userId: number | undefined; filters: ManualMeetingFilters } | null>(null);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<ManualMeeting | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    meet_link?: string;
    meeting_schedule_date?: string;
    meeting_start_time?: string;
  }>({});
  const [commentsText, setCommentsText] = useState<string>("");

  // Form states
  const [formData, setFormData] = useState<CreateManualMeetingRequest>({
    was_scheduled_on_calendar: false,
    meet_link: "",
    meeting_schedule_date: "",
    meeting_start_time: "",
    meeting_title: "",
    comments: {},
    user_id: user?.id || 0,
    status: "scheduled",
  });

  // Fetch meetings from API with server-side filtering
  const fetchMeetings = async (page: number, filtersToApply?: ManualMeetingFilters) => {
    // If admin, don't pass user_id (to get all meetings)
    // If not admin, pass user_id (to get only their meetings)
    const userId = isAdmin ? undefined : user?.id;
    const activeFilters = filtersToApply || appliedFilters;
    
    // Check if we're already fetching with the same parameters
    const fetchParams = { page, userId, filters: activeFilters };
    const filtersKey = JSON.stringify(activeFilters);
    const lastFiltersKey = lastFetchParamsRef.current 
      ? JSON.stringify(lastFetchParamsRef.current.filters) 
      : null;
    
    if (
      isFetchingRef.current ||
      (lastFetchParamsRef.current &&
        lastFetchParamsRef.current.page === fetchParams.page &&
        lastFetchParamsRef.current.userId === fetchParams.userId &&
        lastFiltersKey === filtersKey)
    ) {
      return;
    }

    isFetchingRef.current = true;
    lastFetchParamsRef.current = fetchParams;

    try {
      setLoading(true);
      setError(null);

      // Prepare filters - only include non-empty values
      const cleanFilters: ManualMeetingFilters = {};
      if (activeFilters.search_link?.trim()) {
        cleanFilters.search_link = activeFilters.search_link.trim();
      }
      if (activeFilters.end_date) {
        cleanFilters.end_date = activeFilters.end_date;
      }
      if (activeFilters.was_scheduled_on_calendar !== undefined) {
        cleanFilters.was_scheduled_on_calendar = activeFilters.was_scheduled_on_calendar;
      }
      // Default sorting by meeting start time (newest first)
      cleanFilters.order_by = '-meeting_start_time';

      const response = await manualMeetingsService.listManualMeetings(
        page,
        pageSize,
        userId, // Will be undefined for admin, user_id for non-admin
        cleanFilters
      );

      if (response.success && response.data) {
        setMeetings(response.data.results);
        setTotalMeetings(response.data.count);
        setTotalPages(Math.ceil(response.data.count / pageSize));
      } else {
        setError(response.error || "Failed to fetch meetings");
      }
    } catch (err) {
      console.error('Error fetching meetings:', err);
      setError('Failed to fetch meetings');
    } finally {
      setLoading(false);
      // Only reset fetching flag after a small delay to prevent rapid duplicate calls
      setTimeout(() => {
        isFetchingRef.current = false;
      }, 100);
    }
  };

  // Effect for fetching data (server-side pagination or initial search fetch)
  useEffect(() => {
    if (user?.id) {
      // Use a small delay to prevent duplicate calls from React StrictMode
      const timeoutId = setTimeout(() => {
        fetchMeetings(currentPage, appliedFilters);
      }, 0);

      return () => {
        clearTimeout(timeoutId);
        isFetchingRef.current = false;
      };
    }
  }, [currentPage, user?.id, appliedFilters]);

  // Handle Create
  const handleCreate = () => {
    setFormData({
      was_scheduled_on_calendar: false,
      meet_link: "",
      meeting_schedule_date: "",
      meeting_start_time: "",
      meeting_title: "",
      comments: {},
      user_id: user?.id || 0,
      status: "scheduled",
    });
    setCommentsText("");
    setFormErrors({}); // Clear errors when opening dialog
    setSelectedMeeting(null);
    setIsCreateDialogOpen(true);
  };

  // Handle Edit
  const handleEdit = (meeting: ManualMeeting) => {
    setSelectedMeeting(meeting);
    // Convert comments object to text for editing
    // If comments is an object, try to extract text or stringify it
    let commentsString = "";
    if (meeting.comments) {
      if (typeof meeting.comments === 'string') {
        commentsString = meeting.comments;
      } else if (typeof meeting.comments === 'object') {
        // If it has a 'text' or 'note' key, use that, otherwise stringify
        if ('text' in meeting.comments && typeof meeting.comments.text === 'string') {
          commentsString = meeting.comments.text;
        } else if ('note' in meeting.comments && typeof meeting.comments.note === 'string') {
          commentsString = meeting.comments.note;
        } else {
          // Try to get the first string value
          const firstValue = Object.values(meeting.comments)[0];
          commentsString = typeof firstValue === 'string' ? firstValue : JSON.stringify(meeting.comments);
        }
      }
    }
    setCommentsText(commentsString);
    setFormData({
      was_scheduled_on_calendar: meeting.was_scheduled_on_calendar,
      meet_link: meeting.meet_link,
      meeting_schedule_date: meeting.meeting_schedule_date,
      meeting_start_time: isoToDatetimeLocal(meeting.meeting_start_time),
      meeting_title: meeting.meeting_title || "",
      comments: meeting.comments || {},
      user_id: meeting.created_by || user?.id || 0,
      status: meeting.status || "scheduled",
      calendar_meeting_id: meeting.calendar_meeting_id || null,
    });
    setIsEditDialogOpen(true);
  };

  // Handle Delete
  const handleDelete = (meeting: ManualMeeting) => {
    setSelectedMeeting(meeting);
    setIsDeleteDialogOpen(true);
  };

  // Validate form fields
  const validateForm = (): boolean => {
    const errors: {
      meet_link?: string;
      meeting_schedule_date?: string;
      meeting_start_time?: string;
    } = {};

    if (!formData.meet_link || !formData.meet_link.trim()) {
      errors.meet_link = "Meet Link is required";
    }

    if (!formData.meeting_schedule_date || !formData.meeting_schedule_date.trim()) {
      errors.meeting_schedule_date = "Schedule Date is required";
    }

    if (!formData.meeting_start_time || !formData.meeting_start_time.trim()) {
      errors.meeting_start_time = "Start Time is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Create
  const handleSubmitCreate = async () => {
    // Validate form before submitting
    if (!validateForm()) {
      message.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert comments text to JSON object
      // If user enters plain text, wrap it in a simple object
      let commentsObj: Record<string, any> = {};
      if (commentsText && commentsText.trim()) {
        // Try to parse as JSON first, if it fails, treat as plain text
        try {
          const parsed = JSON.parse(commentsText);
          // If it's already a valid JSON object, use it
          if (typeof parsed === 'object' && parsed !== null) {
            commentsObj = parsed;
          } else {
            // If it's a JSON primitive, wrap it
            commentsObj = { text: parsed };
          }
        } catch (e) {
          // Not valid JSON, treat as plain text and wrap it
          commentsObj = { text: commentsText.trim() };
        }
      }

      // Convert datetime-local to ISO 8601
      const submitData = {
        ...formData,
        meeting_start_time: datetimeLocalToIso(formData.meeting_start_time),
        comments: commentsObj,
      };
      const response = await manualMeetingsService.createManualMeeting(submitData);
      if (response.success) {
        message.success("Meeting created successfully");
        setIsCreateDialogOpen(false);
        setFormErrors({}); // Clear errors on success
        setCommentsText(""); // Clear comments field
        // Reset to first page and refresh table
        setCurrentPage(1);
        lastFetchParamsRef.current = null; // Force refresh
        fetchMeetings(1, appliedFilters);
      } else {
        message.error(response.error || "Failed to create meeting");
      }
    } catch (err) {
      message.error("Failed to create meeting");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Edit
  const handleSubmitEdit = async () => {
    if (!selectedMeeting?.id) return;

    setIsSubmitting(true);
    try {
      // Convert comments text to JSON object
      // If user enters plain text, wrap it in a simple object
      let commentsObj: Record<string, any> = {};
      if (commentsText && commentsText.trim()) {
        // Try to parse as JSON first, if it fails, treat as plain text
        try {
          const parsed = JSON.parse(commentsText);
          // If it's already a valid JSON object, use it
          if (typeof parsed === 'object' && parsed !== null) {
            commentsObj = parsed;
          } else {
            // If it's a JSON primitive, wrap it
            commentsObj = { text: parsed };
          }
        } catch (e) {
          // Not valid JSON, treat as plain text and wrap it
          commentsObj = { text: commentsText.trim() };
        }
      }

      // Convert datetime-local to ISO 8601
      const updateData: UpdateManualMeetingRequest = {
        was_scheduled_on_calendar: formData.was_scheduled_on_calendar,
        meet_link: formData.meet_link,
        meeting_schedule_date: formData.meeting_schedule_date,
        meeting_start_time: datetimeLocalToIso(formData.meeting_start_time),
        meeting_title: formData.meeting_title,
        comments: commentsObj,
        status: formData.status,
        calendar_meeting_id: formData.calendar_meeting_id,
      };

      const response = await manualMeetingsService.updateManualMeeting(
        selectedMeeting.id,
        updateData
      );
      if (response.success) {
        message.success("Meeting updated successfully");
        setIsEditDialogOpen(false);
        setCommentsText(""); // Clear comments field
        // Clear cache and refresh table to show updated data
        lastFetchParamsRef.current = null; // Force refresh by clearing cache
        fetchMeetings(currentPage, appliedFilters);
      } else {
        message.error(response.error || "Failed to update meeting");
      }
    } catch (err) {
      message.error("Failed to update meeting");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Delete
  const handleSubmitDelete = async () => {
    if (!selectedMeeting?.id) return;

    setIsSubmitting(true);
    try {
      const response = await manualMeetingsService.deleteManualMeeting(selectedMeeting.id);
      if (response.success) {
        message.success("Meeting deleted successfully");
        setIsDeleteDialogOpen(false);
        // Clear cache and refresh table to show updated data
        lastFetchParamsRef.current = null; // Force refresh by clearing cache
        fetchMeetings(currentPage, appliedFilters);
      } else {
        message.error(response.error || "Failed to delete meeting");
      }
    } catch (err) {
      message.error("Failed to delete meeting");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter handlers
  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setCurrentPage(1); // Reset to first page when applying filters
    setIsFilterOpen(false);
    // Clear the last fetch params to force a new fetch
    lastFetchParamsRef.current = null;
  };

  const handleClearFilters = () => {
    const emptyFilters: ManualMeetingFilters = {
      search_link: "",
      end_date: "",
      was_scheduled_on_calendar: undefined,
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCurrentPage(1); // Reset to first page when clearing filters
    // Clear the last fetch params to force a new fetch
    lastFetchParamsRef.current = null;
  };

  const hasActiveFilters = () => {
    return !!(
      appliedFilters.search_link?.trim() ||
      appliedFilters.end_date ||
      appliedFilters.was_scheduled_on_calendar !== undefined
    );
  };

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Format datetime for display
  const formatDateTime = (dateTimeString: string) => {
    try {
      return new Date(dateTimeString).toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateTimeString;
    }
  };

  // Format comments for display
  const formatComments = (comments: Record<string, any> | undefined): string => {
    if (!comments || Object.keys(comments).length === 0) {
      return "-";
    }
    
    // If it's a simple object with 'text' key, show that
    if ('text' in comments && typeof comments.text === 'string') {
      return comments.text;
    }
    
    // If it's a simple object with 'note' key, show that
    if ('note' in comments && typeof comments.note === 'string') {
      return comments.note;
    }
    
    // Otherwise, try to get the first string value
    const firstValue = Object.values(comments)[0];
    if (typeof firstValue === 'string') {
      return firstValue;
    }
    
    // If all else fails, stringify the object
    return JSON.stringify(comments);
  };

  // Convert ISO 8601 to datetime-local format (YYYY-MM-DDTHH:mm)
  const isoToDatetimeLocal = (isoString: string): string => {
    try {
      const date = new Date(isoString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch {
      return '';
    }
  };

  // Convert datetime-local format to ISO 8601
  const datetimeLocalToIso = (localString: string): string => {
    if (!localString) return '';
    try {
      // datetime-local gives us "YYYY-MM-DDTHH:mm", we need to convert to ISO 8601
      const date = new Date(localString);
      return date.toISOString();
    } catch {
      return localString;
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="px-8 py-4 bg-white/90 backdrop-blur-sm border-b border-gray-200/60 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Report</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {totalMeetings} manual meetings found
                {hasActiveFilters() && (
                  <span className="ml-2 text-[#078586] font-medium">
                    (filters applied)
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Filter Button */}
              <Button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                variant={hasActiveFilters() ? "default" : "outline"}
                className={`${
                  hasActiveFilters()
                    ? "bg-[#078586] hover:bg-[#078586]/90 text-white"
                    : "border-2 border-gray-200/60 hover:border-[#078586] hover:bg-[#078586]/10 text-[#282F3B] hover:text-[#078586]"
                } px-4 py-2 rounded-lg transition-all duration-200 text-sm flex items-center gap-2`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {hasActiveFilters() && (
                  <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded text-xs">
                    Active
                  </span>
                )}
              </Button>
              {hasActiveFilters() && (
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  className="border-2 border-gray-200/60 hover:border-[#078586] hover:bg-[#078586]/10 text-[#282F3B] hover:text-[#078586] px-4 py-2 rounded-lg transition-all duration-200 text-sm flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              )}
              {/* Create Button */}
              <Button
                onClick={handleCreate}
                className="bg-[#078586] hover:bg-[#078586]/90 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="px-8 py-4 bg-white/90 backdrop-blur-sm border-b border-gray-200/60 shadow-md">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Meet Link Filter */}
                <div className="grid gap-2">
                  <Label htmlFor="filter_meet_link" className="text-sm font-medium">
                    Meet Link
                  </Label>
                  <Input
                    id="filter_meet_link"
                    placeholder="Search in meet link..."
                    className="bg-white border-2 border-gray-200/60 rounded-lg focus:border-[#078586] focus:ring-2 focus:ring-[#078586]/20 transition-all duration-200 text-sm"
                    value={filters.search_link || ""}
                    onChange={(e) => setFilters({ ...filters, search_link: e.target.value })}
                  />
                </div>

                {/* Schedule Date To */}
                <div className="grid gap-2">
                  <Label htmlFor="filter_end_date" className="text-sm font-medium">
                    Schedule Date To
                  </Label>
                  <Input
                    id="filter_end_date"
                    type="date"
                    className="bg-white border-2 border-gray-200/60 rounded-lg focus:border-[#078586] focus:ring-2 focus:ring-[#078586]/20 transition-all duration-200 text-sm"
                    value={filters.end_date || ""}
                    onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                  />
                </div>

                {/* On Calendar Filter */}
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">On Calendar</Label>
                  <select
                    className="flex h-10 w-full rounded-md border-2 border-gray-200/60 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#078586]/20 focus-visible:border-[#078586] transition-all duration-200"
                    value={
                      filters.was_scheduled_on_calendar === undefined
                        ? "all"
                        : filters.was_scheduled_on_calendar
                        ? "true"
                        : "false"
                    }
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        was_scheduled_on_calendar:
                          e.target.value === "all" ? undefined : e.target.value === "true",
                      })
                    }
                  >
                    <option value="all">All</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              {/* Apply/Cancel Buttons */}
              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-200/60">
                <Button
                  onClick={() => {
                    setIsFilterOpen(false);
                    setFilters({ ...appliedFilters });
                  }}
                  variant="outline"
                  className="border-2 border-gray-200/60 hover:border-[#078586] hover:bg-[#078586]/10 text-[#282F3B] hover:text-[#078586] px-4 py-2 rounded-lg transition-all duration-200 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApplyFilters}
                  className="bg-[#078586] hover:bg-[#078586]/90 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center p-12">
            <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200/60">
              <Loader2 className="animate-spin h-12 w-12 text-[#078586] mx-auto mb-6" />
              <p className="text-[#282F3B] text-lg font-medium">Loading meetings...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center p-12">
            <div className="text-center bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200/60">
              <p className="text-red-500 mb-6 text-lg font-medium">{error}</p>
              <Button
                onClick={() => fetchMeetings(currentPage)}
                className="bg-[#078586] hover:bg-[#078586]/90 text-white px-6 py-3 rounded-lg transition-all duration-200"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Meetings Table */}
        {!loading && !error && (
          <>
            <div className="p-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200/60">
                      <tr>
                        {/* <th className="px-6 py-4 text-left text-sm font-semibold text-[#282F3B]">Title</th> */}
                        <th className="px-5 py-3.5 text-left text-sm font-semibold text-[#282F3B] w-[12%]">Name</th>
                        <th className="px-5 py-3.5 text-left text-sm font-semibold text-[#282F3B] w-[20%]">Meet Link</th>
                        <th className="px-5 py-3.5 text-left text-sm font-semibold text-[#282F3B] w-[12%]">Schedule Date</th>
                        <th className="px-5 py-3.5 text-left text-sm font-semibold text-[#282F3B] w-[15%]">Start Time</th>
                        <th className="px-5 py-3.5 text-left text-sm font-semibold text-[#282F3B] w-[10%]">On Calendar</th>
                        <th className="px-5 py-3.5 text-left text-sm font-semibold text-[#282F3B] w-[18%]">Comments</th>
                        {/* <th className="px-6 py-4 text-left text-sm font-semibold text-[#282F3B]">Status</th> */}
                        <th className="px-5 py-3.5 text-center text-sm font-semibold text-[#282F3B] w-[13%]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/60">
                      {meetings.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-12 text-center">
                            <p className="text-muted-foreground">No meetings found</p>
                          </td>
                        </tr>
                      ) : (
                        meetings.map((meeting) => (
                          <tr
                            key={meeting.id}
                            className="hover:bg-gray-50/50 transition-colors duration-200"
                          >
                            {/* <td className="px-6 py-4">
                              <div className="text-sm font-medium text-[#282F3B]">
                                {meeting.meeting_title || "Untitled Meeting"}
                              </div>
                            </td> */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center">
                                <User className="w-4 h-4 mr-2 text-[#078586] flex-shrink-0" />
                                <span className="text-sm font-medium text-[#282F3B] truncate">
                                  {meeting.created_by_user?.full_name || "Unknown User"}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center">
                                <LinkIcon className="w-4 h-4 mr-2 text-[#078586] flex-shrink-0" />
                                <a
                                  href={meeting.meet_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-[#078586] hover:underline truncate block"
                                  title={meeting.meet_link}
                                >
                                  {meeting.meet_link}
                                </a>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-[#078586] flex-shrink-0" />
                                <span className="text-sm text-[#282F3B]/70 truncate">
                                  {formatDate(meeting.meeting_schedule_date)}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-[#078586] flex-shrink-0" />
                                <span className="text-sm text-[#282F3B]/70 truncate">
                                  {formatDateTime(meeting.meeting_start_time)}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                meeting.was_scheduled_on_calendar
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {meeting.was_scheduled_on_calendar ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="text-sm text-[#282F3B]/70">
                                <span className="break-words whitespace-normal">
                                  {formatComments(meeting.comments)}
                                </span>
                              </div>
                            </td>
                            {/* <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                meeting.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : meeting.status === 'in_progress'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : meeting.status === 'scheduled'
                                      ? 'bg-blue-100 text-blue-800'
                                      : meeting.status === 'cancelled'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-800'
                              }`}>
                                {meeting.status || 'pending'}
                              </span>
                            </td> */}
                            <td className="px-5 py-3.5 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(meeting)}
                                  className="border-2 border-gray-200/60 hover:border-[#078586] hover:bg-[#078586]/10 text-[#282F3B] hover:text-[#078586] px-2.5 py-1.5 rounded-lg transition-all duration-200 h-8 w-8 p-0"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(meeting)}
                                  className="border-2 border-red-200/60 hover:border-red-500 hover:bg-red-50 text-red-600 hover:text-red-700 px-2.5 py-1.5 rounded-lg transition-all duration-200 h-8 w-8 p-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-8 py-4 border-t border-gray-200/60 bg-white/90 backdrop-blur-sm shadow-lg">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className="border-2 border-gray-200/60 hover:border-[#078586] hover:bg-[#078586]/10 text-[#282F3B] hover:text-[#078586] px-3 py-2 rounded-lg transition-all duration-200 text-sm"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="border-2 border-gray-200/60 hover:border-[#078586] hover:bg-[#078586]/10 text-[#282F3B] hover:text-[#078586] px-3 py-2 rounded-lg transition-all duration-200 text-sm"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-sm text-[#282F3B]/70 font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 p-0 rounded-lg font-medium transition-all duration-200 text-sm ${
                          currentPage === page
                            ? "bg-[#078586] text-white shadow-lg"
                            : "border-2 border-gray-200/60 hover:border-[#078586] hover:bg-[#078586]/10 text-[#282F3B] hover:text-[#078586]"
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog 
        open={isCreateDialogOpen} 
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) {
            setFormErrors({}); // Clear errors when dialog closes
            setCommentsText(""); // Clear comments when dialog closes
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Manual Meeting</DialogTitle>
            <DialogDescription>
              Create a new manual meeting record. Fill in all required fields.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="was_scheduled_on_calendar">Was Scheduled on Calendar *</Label>
              <RadioGroup
                value={formData.was_scheduled_on_calendar ? "true" : "false"}
                onValueChange={(value) =>
                  setFormData({ ...formData, was_scheduled_on_calendar: value === "true" })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="yes" />
                  <Label htmlFor="yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="no" />
                  <Label htmlFor="no">No</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meet_link">Meet Link *</Label>
              <Input
                id="meet_link"
                placeholder="https://meet.google.com/abc-defg-hij"
                value={formData.meet_link}
                onChange={(e) => {
                  setFormData({ ...formData, meet_link: e.target.value });
                  // Clear error when user starts typing
                  if (formErrors.meet_link) {
                    setFormErrors({ ...formErrors, meet_link: undefined });
                  }
                }}
                className={formErrors.meet_link ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {formErrors.meet_link && (
                <p className="text-sm text-red-500 mt-1">{formErrors.meet_link}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meeting_schedule_date">Schedule Date *</Label>
              <Input
                id="meeting_schedule_date"
                type="date"
                value={formData.meeting_schedule_date}
                onChange={(e) => {
                  setFormData({ ...formData, meeting_schedule_date: e.target.value });
                  // Clear error when user selects a date
                  if (formErrors.meeting_schedule_date) {
                    setFormErrors({ ...formErrors, meeting_schedule_date: undefined });
                  }
                }}
                className={formErrors.meeting_schedule_date ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {formErrors.meeting_schedule_date && (
                <p className="text-sm text-red-500 mt-1">{formErrors.meeting_schedule_date}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meeting_start_time">Start Time *</Label>
              <Input
                id="meeting_start_time"
                type="datetime-local"
                value={formData.meeting_start_time}
                onChange={(e) => {
                  setFormData({ ...formData, meeting_start_time: e.target.value });
                  // Clear error when user selects a time
                  if (formErrors.meeting_start_time) {
                    setFormErrors({ ...formErrors, meeting_start_time: undefined });
                  }
                }}
                className={formErrors.meeting_start_time ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {formErrors.meeting_start_time && (
                <p className="text-sm text-red-500 mt-1">{formErrors.meeting_start_time}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                placeholder="Type"
                value={commentsText}
                onChange={(e) => {
                  setCommentsText(e.target.value);
                }}
                className="min-h-[100px] text-sm"
              />
            </div>
            {/* <div className="grid gap-2">
              <Label htmlFor="meeting_title">Meeting Title</Label>
              <Input
                id="meeting_title"
                placeholder="Team Standup"
                value={formData.meeting_title}
                onChange={(e) => setFormData({ ...formData, meeting_title: e.target.value })}
              />
            </div> */}
            {/* <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div> */}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitCreate}
              disabled={isSubmitting}
              className="bg-[#078586] hover:bg-[#078586]/90 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog 
        open={isEditDialogOpen} 
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setCommentsText(""); // Clear comments when dialog closes
            setFormErrors({}); // Clear errors when dialog closes
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Manual Meeting</DialogTitle>
            <DialogDescription>
              Update the manual meeting record.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_was_scheduled_on_calendar">Was Scheduled on Calendar *</Label>
              <RadioGroup
                value={formData.was_scheduled_on_calendar ? "true" : "false"}
                onValueChange={(value) =>
                  setFormData({ ...formData, was_scheduled_on_calendar: value === "true" })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="edit_yes" />
                  <Label htmlFor="edit_yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="edit_no" />
                  <Label htmlFor="edit_no">No</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_meet_link">Meet Link *</Label>
              <Input
                id="edit_meet_link"
                placeholder="https://meet.google.com/abc-defg-hij"
                value={formData.meet_link}
                onChange={(e) => setFormData({ ...formData, meet_link: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_meeting_schedule_date">Schedule Date *</Label>
              <Input
                id="edit_meeting_schedule_date"
                type="date"
                value={formData.meeting_schedule_date}
                onChange={(e) => setFormData({ ...formData, meeting_schedule_date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_meeting_start_time">Start Time *</Label>
              <Input
                id="edit_meeting_start_time"
                type="datetime-local"
                value={formData.meeting_start_time}
                onChange={(e) => setFormData({ ...formData, meeting_start_time: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_comments">Comments</Label>
              <Textarea
                id="edit_comments"
                placeholder="Type"
                value={commentsText}
                onChange={(e) => {
                  setCommentsText(e.target.value);
                }}
                className="min-h-[100px] text-sm"
              />
            </div>
            {/* <div className="grid gap-2">
              <Label htmlFor="edit_meeting_title">Meeting Title</Label>
              <Input
                id="edit_meeting_title"
                placeholder="Team Standup"
                value={formData.meeting_title}
                onChange={(e) => setFormData({ ...formData, meeting_title: e.target.value })}
              />
            </div> */}
            {/* <div className="grid gap-2">
              <Label htmlFor="edit_status">Status</Label>
              <select
                id="edit_status"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div> */}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitEdit}
              disabled={isSubmitting}
              className="bg-[#078586] hover:bg-[#078586]/90 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Meeting</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this meeting? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedMeeting && (
            <div className="py-4">
              {/* <p className="text-sm text-muted-foreground">
                <strong>Title:</strong> {selectedMeeting.meeting_title || "Untitled Meeting"}
              </p> */}
              <p className="text-sm text-muted-foreground">
                <strong>Meet Link:</strong> {selectedMeeting.meet_link}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Date:</strong> {formatDate(selectedMeeting.meeting_schedule_date)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Report;

