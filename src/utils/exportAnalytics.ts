import { format } from 'date-fns';

export interface AnalyticsExportData {
  summary: {
    totalPhotos: number;
    totalGroups: number;
    totalParticipants: number;
    totalViews: number;
  };
  uploadTrend: {
    period: string;
    labels: string[];
    data: number[];
    totalUploads: number;
    avgPerPeriod: number;
    growth: string;
  };
  groupStats: {
    name: string;
    photos: number;
    participants: number;
    views: number;
  }[];
  uploadDistribution: {
    groupName: string;
    photos: number;
    percentage: string;
  }[];
}

/** Escape a CSV cell value (wrap in quotes if it contains comma/quote/newline) */
function escapeCell(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/** Convert a 2D array of values into a CSV string */
function toCSV(rows: (string | number)[][]): string {
  return rows.map(row => row.map(escapeCell).join(',')).join('\n');
}

/** Trigger a CSV file download in the browser */
function downloadCSV(content: string, fileName: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportAnalyticsToCSV(analyticsData: AnalyticsExportData): void {
  const generatedOn = format(new Date(), 'PPpp');
  const fileName = `analytics-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;

  const rows: (string | number)[][] = [];

  // ── Section 1: Report Header ──────────────────────────────────────────────
  rows.push(['Analytics Report']);
  rows.push(['Generated on', generatedOn]);
  rows.push([]);

  // ── Section 2: Summary ────────────────────────────────────────────────────
  rows.push(['=== SUMMARY ===']);
  rows.push(['Metric', 'Value']);
  rows.push(['Total Photos', analyticsData.summary.totalPhotos]);
  rows.push(['Total Groups', analyticsData.summary.totalGroups]);
  rows.push(['Participants', analyticsData.summary.totalParticipants]);
  rows.push(['Total Views', analyticsData.summary.totalViews]);
  rows.push([]);

  // ── Section 3: Upload Trend ───────────────────────────────────────────────
  rows.push(['=== UPLOAD TREND ===']);
  rows.push(['Period', analyticsData.uploadTrend.period]);
  rows.push(['Total Uploads', analyticsData.uploadTrend.totalUploads]);
  rows.push([`Average per ${analyticsData.uploadTrend.period}`, analyticsData.uploadTrend.avgPerPeriod.toFixed(1)]);
  rows.push(['Growth', analyticsData.uploadTrend.growth]);
  rows.push([]);
  rows.push(['Label', 'Uploads']);
  analyticsData.uploadTrend.labels.forEach((label, i) => {
    rows.push([label, analyticsData.uploadTrend.data[i]]);
  });
  rows.push([]);

  // ── Section 4: Group-wise Stats ───────────────────────────────────────────
  rows.push(['=== GROUP-WISE STATS ===']);
  rows.push(['Group Name', 'Photos', 'Participants', 'Views']);
  analyticsData.groupStats.forEach(g => {
    rows.push([g.name, g.photos, g.participants, g.views]);
  });
  rows.push([]);

  // ── Section 5: Upload Distribution ───────────────────────────────────────
  rows.push(['=== UPLOAD DISTRIBUTION ===']);
  rows.push(['Group Name', 'Photos', 'Percentage']);
  analyticsData.uploadDistribution.forEach(d => {
    rows.push([d.groupName, d.photos, `${d.percentage}%`]);
  });
  rows.push([]);
  rows.push(['Total Photos', analyticsData.summary.totalPhotos, '']);

  downloadCSV(toCSV(rows), fileName);
}
