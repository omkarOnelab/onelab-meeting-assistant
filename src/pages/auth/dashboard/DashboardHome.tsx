import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowUpRight, Loader2, RefreshCw } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { message } from "antd";
import CalendarIntegration from "@/components/auth/dashboard/CalendarIntegration";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";

const DashboardHome = () => {
  const [searchParams] = useSearchParams();
  const { getUserFullName, user } = useAuth();
  const { dashboardData, loading, refreshing, error, refetch } = useDashboard();

  // Check for calendar connection success
  useEffect(() => {
    if (searchParams.get('calendar_connected') === 'true') {
      message.success('Google Calendar connected successfully!');
      // Clean up the URL parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [searchParams]);

  // Use dynamic data from API or fallback to empty data
  const stats = dashboardData?.stats || [
    {
      title: "Total Meetings",
      value: "0",
      change: "0%",
      trend: "stable" as const,
      icon: "Calendar",
      period: "this month"
    },
    {
      title: "Avg Duration",
      value: "0 min",
      change: "0%",
      trend: "stable" as const,
      icon: "Clock",
      period: "this month"
    },
  ];

  const weeklySummary = dashboardData?.weekly_summary || {
    meetings_completed: 0,
    total_hours: "0h",
    action_items_created: 0,
    transcripts_processed: 0
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">
                Welcome back, {getUserFullName() || user?.first_name || 'User'}
              </h1>
              <p className="text-muted-foreground">
                Here's what's happening with your meetings today.
                {refreshing && (
                  <span className="ml-2 text-xs text-blue-600">
                    • Updating data...
                  </span>
                )}
              </p>
            </div>
            <Button
              onClick={refetch}
              disabled={loading || refreshing}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading || refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Google Calendar Integration - Moved to Top */}
        <div className="mb-8">
          <CalendarIntegration />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {loading ? (
            // Loading state
            Array.from({ length: 2 }).map((_, index) => (
              <Card key={index} className="bg-white border-0 shadow-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Loader2 className="h-4 w-4 text-primary animate-spin" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))
          ) : (
            stats.map((stat) => {
              // Map icon names to components
              const getIcon = (iconName: string) => {
                switch (iconName) {
                  case 'Calendar':
                    return Calendar;
                  case 'Clock':
                    return Clock;
                  default:
                    return Calendar;
                }
              };

              const Icon = getIcon(stat.icon);

              return (
                <Card key={stat.title} className="bg-white border-0 shadow-card hover:shadow-card-hover transition-all duration-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-semibold text-foreground mb-1">{stat.value}</div>
                    <div className="flex items-center text-xs">
                      <span className={`inline-flex items-center ${stat.trend === 'up' ? 'text-success' : stat.trend === 'down' ? 'text-warning' : 'text-muted-foreground'
                        }`}>
                        <ArrowUpRight className={`w-3 h-3 mr-1 ${stat.trend === 'down' ? 'rotate-90' : ''
                          }`} />
                        {stat.change}
                      </span>
                      <span className="text-muted-foreground ml-1">from last {stat.period.split(' ')[1]}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Weekly Summary */}
        <div className="max-w-md">
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-0 shadow-card">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-foreground">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  // Loading state for weekly summary
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Meetings completed</span>
                      <span className="font-semibold text-foreground">{weeklySummary.meetings_completed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total hours</span>
                      <span className="font-semibold text-foreground">{weeklySummary.total_hours}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Action items created</span>
                      <span className="font-semibold text-foreground">{weeklySummary.action_items_created}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Transcripts processed</span>
                      <span className="font-semibold text-foreground">{weeklySummary.transcripts_processed}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;