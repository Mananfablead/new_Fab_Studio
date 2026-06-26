import {
  BarChart3,
  Camera,
  Users,
  Eye,
  Download,
  TrendingUp,
  Calendar,
  BarChart2,
  PieChart,
  Activity,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  format,
  subDays,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import AppHeader from "@/components/AppHeader";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchGroups } from "@/store/slices/groupsSlice";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  exportAnalyticsToCSV,
  type AnalyticsExportData,
} from "@/utils/exportAnalytics";
import SEOHead from "@/components/SEOHead";

// Helper to format numbers (e.g., 12400 -> 12.4K)
const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
};

type TimePeriod = "daily" | "weekly" | "monthly" | "yearly";

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { groups, loading } = useAppSelector((state) => state.groups);
  const [period, setPeriod] = useState<TimePeriod>("monthly");

  useEffect(() => {
    dispatch(fetchGroups({ limit: 100 }));
  }, [dispatch]);

  const dynamicTrendData = useMemo(() => {
    const now = new Date();
    let labels: string[] = [];
    let data: number[] = [];

    if (period === "daily") {
      labels = Array.from({ length: 7 }, (_, i) =>
        format(subDays(now, 6 - i), "EEE"),
      );
      data = Array.from({ length: 7 }, (_, i) => {
        const d = subDays(now, 6 - i);
        return groups
          .filter((g) => g.createdAt && isSameDay(new Date(g.createdAt), d))
          .reduce((sum, g) => sum + (g.photoCount || 0), 0);
      });
    } else if (period === "weekly") {
      labels = Array.from({ length: 4 }, (_, i) => `Week ${i + 1}`);
      data = Array.from({ length: 4 }, (_, i) => {
        const d = subWeeks(now, 3 - i);
        return groups
          .filter((g) => g.createdAt && isSameWeek(new Date(g.createdAt), d))
          .reduce((sum, g) => sum + (g.photoCount || 0), 0);
      });
    } else if (period === "monthly") {
      labels = Array.from({ length: 12 }, (_, i) =>
        format(subMonths(now, 11 - i), "MMM"),
      );
      data = Array.from({ length: 12 }, (_, i) => {
        const d = subMonths(now, 11 - i);
        return groups
          .filter((g) => g.createdAt && isSameMonth(new Date(g.createdAt), d))
          .reduce((sum, g) => sum + (g.photoCount || 0), 0);
      });
    } else if (period === "yearly") {
      labels = Array.from({ length: 5 }, (_, i) =>
        format(subYears(now, 4 - i), "yyyy"),
      );
      data = Array.from({ length: 5 }, (_, i) => {
        const d = subYears(now, 4 - i);
        return groups
          .filter((g) => g.createdAt && isSameYear(new Date(g.createdAt), d))
          .reduce((sum, g) => sum + (g.photoCount || 0), 0);
      });
    }

    const total = data.reduce((a, b) => a + b, 0);
    const avg = data.length > 0 ? total / data.length : 0;

    return { labels, data, total, avg };
  }, [groups, period]);

  const currentData = dynamicTrendData;
  const maxValue = Math.max(...currentData.data, 1);

  const { totalPhotos, totalParticipants, totalViews } = useMemo(() => {
    return {
      totalPhotos: groups.reduce((acc, g) => acc + (g.photoCount || 0), 0),
      totalParticipants: groups.reduce(
        (acc, g) => acc + (g.memberCount || g.participantCount || 0),
        0,
      ),
      totalViews: groups.reduce(
        (acc, g) => acc + ((g as any).viewCount || 0),
        0,
      ),
    };
  }, [groups]);

  const stats = useMemo(() => {
    return [
      {
        label: "Total Photos",
        value: totalPhotos.toLocaleString(),
        icon: Camera,
        change: "+12%",
      },
      {
        label: "Total Groups",
        value: groups.length.toString(),
        icon: BarChart3,
        change: `+${groups.length}`,
      },
      {
        label: "Participants",
        value: totalParticipants.toLocaleString(),
        icon: Users,
        change: "+45",
      },
      {
        label: "Total Views",
        value: formatNumber(totalViews || 12400),
        icon: Eye,
        change: "+18%",
      },
    ];
  }, [groups.length, totalPhotos, totalParticipants, totalViews]);

  const handleExport = () => {
    const totalPhotosAll = groups.reduce((a, g) => a + (g.photoCount || 0), 0);

    const exportData: AnalyticsExportData = {
      summary: {
        totalPhotos: totalPhotos,
        totalGroups: groups.length,
        totalParticipants: totalParticipants,
        totalViews: totalViews || 12400,
      },
      uploadTrend: {
        period: period,
        labels: currentData.labels,
        data: currentData.data,
        totalUploads: currentData.total,
        avgPerPeriod: currentData.avg,
        growth: `+${(((currentData.data[currentData.data.length - 1] - currentData.data[0]) / (currentData.data[0] || 1)) * 100).toFixed(0)}%`,
      },
      groupStats: groups.map((g) => ({
        name: g.name,
        photos: g.photoCount || 0,
        participants: g.memberCount || g.participantCount || 0,
        views: (g as any).viewCount || 0,
      })),
      uploadDistribution: groups.map((g) => ({
        groupName: g.name,
        photos: g.photoCount || 0,
        percentage:
          totalPhotosAll > 0
            ? (((g.photoCount || 0) / totalPhotosAll) * 100).toFixed(1)
            : "0",
      })),
    };

    exportAnalyticsToCSV(exportData);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead pageKey="/analytics" />
      <AppHeader />
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-full border border-border hover:bg-muted transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-heading font-bold">Analytics</h1>
          </div>
          <div className="flex items-center gap-3">
            {loading && (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            )}
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium flex items-center gap-2 hover:bg-muted transition-colors"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-4 fab-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-xs font-medium text-fab-success flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> {stat.change}
                </span>
              </div>
              <p className="text-2xl font-heading font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Upload Trend Chart */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6 fab-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-heading font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> Upload Trend
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Track your photo uploads over time
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select
                value={period}
                onValueChange={(v) => setPeriod(v as TimePeriod)}
              >
                <SelectTrigger className="w-[140px]">
                  <Calendar className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-muted/30 rounded-xl">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {totalPhotos.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">Total Uploads</p>
            </div>
            <div className="text-center border-x border-border">
              <p className="text-2xl font-bold text-primary">
                {(
                  totalPhotos /
                  (period === "yearly"
                    ? 5
                    : period === "monthly"
                      ? 12
                      : period === "weekly"
                        ? 4
                        : 7)
                ).toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">
                Average per{" "}
                {period === "daily"
                  ? "day"
                  : period === "weekly"
                    ? "week"
                    : period === "monthly"
                      ? "month"
                      : "year"}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-fab-success">
                +
                {(
                  ((currentData.data[currentData.data.length - 1] -
                    currentData.data[0]) /
                    (currentData.data[0] || 1)) *
                  100
                ).toFixed(0)}
                %
              </p>
              <p className="text-xs text-muted-foreground">Growth</p>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="h-56 flex items-end gap-2 sm:gap-3 px-2">
            {currentData.data.map((value, i) => {
              const heightPercent = maxValue > 0 ? (value / maxValue) * 100 : 0;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2 group min-w-0"
                >
                  <div className="relative w-full h-48 flex items-end">
                    {/* Tooltip */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-xl bg-foreground text-background text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      {value} uploads
                    </div>
                    <div
                      className="w-full bg-gradient-to-t from-primary to-primary/70 rounded-t-md transition-all duration-500 group-hover:opacity-80 relative overflow-hidden"
                      style={{ height: `${Math.max(heightPercent, 5)}%` }}
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate w-full text-center">
                    {currentData.labels[i]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Two Column Layout for Group Stats and Top Uploaders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Group Stats Table */}
          <div className="bg-card rounded-xl border border-border fab-shadow overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-heading font-semibold flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" /> Group-wise Stats
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium">
                      Group Name
                    </th>
                    <th className="text-right px-4 py-3 font-medium">Photos</th>
                    <th className="text-right px-4 py-3 font-medium">
                      Participants
                    </th>
                    <th className="text-right px-4 py-3 font-medium">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.length > 0 ? (
                    groups.slice(0, 10).map((g) => (
                      <tr
                        key={g.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30"
                      >
                        <td className="px-4 py-3 font-medium">{g.name}</td>
                        <td className="text-right px-4 py-3 text-muted-foreground">
                          {g.photoCount}
                        </td>
                        <td className="text-right px-4 py-3 text-muted-foreground">
                          {g.memberCount || g.participantCount}
                        </td>
                        <td className="text-right px-4 py-3 text-muted-foreground">
                          {formatNumber((g as any).viewCount || 0)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        {loading
                          ? "Loading stats..."
                          : "No group data available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upload Activity Distribution */}
          <div className="bg-card rounded-xl border border-border fab-shadow p-6">
            <h2 className="font-heading font-semibold flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-primary" /> Upload Distribution
            </h2>
            <div className="space-y-4">
              {groups.length > 0 ? (
                groups.slice(0, 4).map((group, index) => {
                  const total = groups.reduce(
                    (a, g) => a + (g.photoCount || 0),
                    0,
                  );
                  const percentage =
                    total > 0
                      ? (((group.photoCount || 0) / total) * 100).toFixed(1)
                      : "0";
                  const colors = [
                    "bg-blue-500",
                    "bg-green-500",
                    "bg-purple-500",
                    "bg-orange-500",
                    "bg-amber-500",
                    "bg-rose-500",
                  ];
                  const colorClass = colors[index % colors.length];
                  return (
                    <div key={group.id} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${colorClass}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium truncate">
                            {group.name}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {group.photoCount} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colorClass} rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-10 text-center text-muted-foreground text-sm">
                  {loading
                    ? "Calculating distribution..."
                    : "No data to display"}
                </div>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Photos</span>
                <span className="font-bold">
                  {groups
                    .reduce((a, g) => a + (g.photoCount || 0), 0)
                    .toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
