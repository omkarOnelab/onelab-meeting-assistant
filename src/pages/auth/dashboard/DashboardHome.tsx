import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowUpRight, MessageSquare } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { message } from "antd";
import CalendarIntegration from "@/components/auth/dashboard/CalendarIntegration";
import { useAuth } from "@/hooks/useAuth";

const DashboardHome = () => {
  const [searchParams] = useSearchParams();
  const { getUserFullName, user } = useAuth();

  // Check for calendar connection success
  useEffect(() => {
    if (searchParams.get('calendar_connected') === 'true') {
      message.success('Google Calendar connected successfully!');
      // Clean up the URL parameter
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [searchParams]);

  const stats = [
    {
      title: "Total Meetings",
      value: "24",
      change: "+12%",
      trend: "up",
      icon: Calendar,
      period: "this month"
    },
    {
      title: "Avg Duration",
      value: "42 min",
      change: "-5%",
      trend: "down",
      icon: Clock,
      period: "this month"
    },
  ];

  const recentMeetings = [
    {
      name: "Product Strategy Review Q1 2024",
      participants: 8,
      time: "2 hours ago",
      status: "completed",
      duration: "1h 45m"
    },
    {
      name: "Weekly Team Standup",
      participants: 12,
      time: "1 day ago",
      status: "completed",
      duration: "30m"
    },
    {
      name: "Client Presentation",
      participants: 5,
      time: "2 days ago",
      status: "completed",
      duration: "2h 15m"
    },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Welcome back, {getUserFullName() || user?.first_name || 'User'}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your meetings today.
          </p>
        </div>

        {/* Google Calendar Integration - Moved to Top */}
        <div className="mb-8">
          <CalendarIntegration />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
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
                    <span className={`inline-flex items-center ${stat.trend === 'up' ? 'text-success' : 'text-warning'
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
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Meetings */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-0 shadow-card">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-foreground">Recent Meetings</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/auth/meetings?view=my" className="text-primary hover:text-primary/80">
                      View all
                      <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentMeetings.map((meeting, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-surface rounded-lg hover:bg-surface-hover transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{meeting.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{meeting.participants} participants</span>
                          <span>•</span>
                          <span>{meeting.duration}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="px-2 py-1 bg-success/10 text-success text-xs font-medium rounded-full">
                        {meeting.status}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{meeting.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Weekly Summary */}
          <div>
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-0 shadow-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Meetings completed</span>
                    <span className="font-semibold text-foreground">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total hours</span>
                    <span className="font-semibold text-foreground">12.5h</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Action items created</span>
                    <span className="font-semibold text-foreground">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Transcripts processed</span>
                    <span className="font-semibold text-foreground">12</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;