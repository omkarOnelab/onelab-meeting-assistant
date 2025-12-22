import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Search,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Link as LinkIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useSelector } from 'react-redux';
import type { RootState } from '../../../redux/store';
import manualMeetingsService, {
  type ManualMeeting,
  type CreateManualMeetingRequest,
  type UpdateManualMeetingRequest,
} from "@/services/manualMeetingsService";
import { message } from "antd";

const Report = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [meetings, setMeetings] = useState<ManualMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMeetings, setTotalMeetings] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const pageSize = 10;

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<ManualMeeting | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Fetch meetings from API
  const fetchMeetings = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const userId = user?.id;
      const response = await manualMeetingsService.listManualMeetings(
        page,
        pageSize,
        userId
      );

      if (response.success && response.data) {
        let filteredResults = response.data.results;

        // Client-side search filtering
        if (appliedSearchTerm) {
          const searchLower = appliedSearchTerm.toLowerCase();
          filteredResults = filteredResults.filter((meeting) =>
            meeting.meeting_title?.toLowerCase().includes(searchLower) ||
            meeting.meet_link?.toLowerCase().includes(searchLower) ||
            meeting.status?.toLowerCase().includes(searchLower)
          );
        }

        setMeetings(filteredResults);
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
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchMeetings(currentPage);
    }
  }, [currentPage, user?.id, appliedSearchTerm]);

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
    setSelectedMeeting(null);
    setIsCreateDialogOpen(true);
  };

  // Handle Edit
  const handleEdit = (meeting: ManualMeeting) => {
    setSelectedMeeting(meeting);
    setFormData({
      was_scheduled_on_calendar: meeting.was_scheduled_on_calendar,
      meet_link: meeting.meet_link,
      meeting_schedule_date: meeting.meeting_schedule_date,
      meeting_start_time: meeting.meeting_start_time,
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

  // Submit Create
  const handleSubmitCreate = async () => {
    if (!formData.meet_link || !formData.meeting_schedule_date || !formData.meeting_start_time) {
      message.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await manualMeetingsService.createManualMeeting(formData);
      if (response.success) {
        message.success("Meeting created successfully");
        setIsCreateDialogOpen(false);
        fetchMeetings(currentPage);
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
      const updateData: UpdateManualMeetingRequest = {
        was_scheduled_on_calendar: formData.was_scheduled_on_calendar,
        meet_link: formData.meet_link,
        meeting_schedule_date: formData.meeting_schedule_date,
        meeting_start_time: formData.meeting_start_time,
        meeting_title: formData.meeting_title,
        comments: formData.comments,
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
        fetchMeetings(currentPage);
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
        fetchMeetings(currentPage);
      } else {
        message.error(response.error || "Failed to delete meeting");
      }
    } catch (err) {
      message.error("Failed to delete meeting");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Search handlers
  const handleApplySearch = () => {
    setAppliedSearchTerm(searchTerm);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setAppliedSearchTerm("");
    setCurrentPage(1);
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
                {appliedSearchTerm && (
                  <span className="ml-2 text-[#078586] font-medium">
                    (filtered by "{appliedSearchTerm}")
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="relative w-80 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#078586] w-4 h-4 z-10" />
                <Input
                  placeholder="Search meetings..."
                  className="pl-10 pr-4 py-2 bg-white/90 backdrop-blur-sm border-2 border-gray-200/60 rounded-lg shadow-md focus:border-[#078586] focus:ring-2 focus:ring-[#078586]/20 transition-all duration-200 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleApplySearch();
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleApplySearch}
                className="bg-[#078586] hover:bg-[#078586]/90 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm"
              >
                Apply
              </Button>
              {appliedSearchTerm && (
                <Button
                  onClick={handleClearSearch}
                  variant="outline"
                  className="border-2 border-gray-200/60 hover:border-[#078586] hover:bg-[#078586]/10 text-[#282F3B] hover:text-[#078586] px-4 py-2 rounded-lg transition-all duration-200 text-sm"
                >
                  Clear
                </Button>
              )}
              {/* Create Button */}
              <Button
                onClick={handleCreate}
                className="bg-[#078586] hover:bg-[#078586]/90 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Meeting
              </Button>
            </div>
          </div>
        </div>

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
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200/60">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#282F3B]">Title</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#282F3B]">Meet Link</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#282F3B]">Schedule Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#282F3B]">Start Time</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#282F3B]">On Calendar</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#282F3B]">Status</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-[#282F3B]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200/60">
                      {meetings.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center">
                            <p className="text-muted-foreground">No meetings found</p>
                          </td>
                        </tr>
                      ) : (
                        meetings.map((meeting) => (
                          <tr
                            key={meeting.id}
                            className="hover:bg-gray-50/50 transition-colors duration-200"
                          >
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-[#282F3B]">
                                {meeting.meeting_title || "Untitled Meeting"}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <LinkIcon className="w-4 h-4 mr-2 text-[#078586]" />
                                <a
                                  href={meeting.meet_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm text-[#078586] hover:underline truncate max-w-xs"
                                >
                                  {meeting.meet_link}
                                </a>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2 text-[#078586]" />
                                <span className="text-sm text-[#282F3B]/70">
                                  {formatDate(meeting.meeting_schedule_date)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-[#078586]" />
                                <span className="text-sm text-[#282F3B]/70">
                                  {formatDateTime(meeting.meeting_start_time)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                meeting.was_scheduled_on_calendar
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {meeting.was_scheduled_on_calendar ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
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
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(meeting)}
                                  className="border-2 border-gray-200/60 hover:border-[#078586] hover:bg-[#078586]/10 text-[#282F3B] hover:text-[#078586] px-3 py-1 rounded-lg transition-all duration-200 text-sm"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(meeting)}
                                  className="border-2 border-red-200/60 hover:border-red-500 hover:bg-red-50 text-red-600 hover:text-red-700 px-3 py-1 rounded-lg transition-all duration-200 text-sm"
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
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
                onChange={(e) => setFormData({ ...formData, meet_link: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meeting_schedule_date">Schedule Date *</Label>
              <Input
                id="meeting_schedule_date"
                type="date"
                value={formData.meeting_schedule_date}
                onChange={(e) => setFormData({ ...formData, meeting_schedule_date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meeting_start_time">Start Time *</Label>
              <Input
                id="meeting_start_time"
                type="datetime-local"
                value={formData.meeting_start_time}
                onChange={(e) => setFormData({ ...formData, meeting_start_time: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="meeting_title">Meeting Title</Label>
              <Input
                id="meeting_title"
                placeholder="Team Standup"
                value={formData.meeting_title}
                onChange={(e) => setFormData({ ...formData, meeting_title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
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
            </div>
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
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
              <Label htmlFor="edit_meeting_title">Meeting Title</Label>
              <Input
                id="edit_meeting_title"
                placeholder="Team Standup"
                value={formData.meeting_title}
                onChange={(e) => setFormData({ ...formData, meeting_title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
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
            </div>
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
              <p className="text-sm text-muted-foreground">
                <strong>Title:</strong> {selectedMeeting.meeting_title || "Untitled Meeting"}
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

