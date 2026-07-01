import React, { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Download, Layers, Repeat, X, Image as ImageIcon, Video, Calendar, Clock, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import api from '@/services/api';

interface DownloadRecord {
  id: number;
  download_type: string;
  file_type: string;
  created_at: string;
  participant: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
  photo?: {
    id: number;
    original_name: string;
    file_type: string;
    size: number;
    original_size: number | null;
    url: string;
    status: string;
  };
  video?: {
    id: number;
    original_name: string;
    file_type: string;
    size: number;
    url: string;
  };
}

interface Summary {
  total_downloads: number;
  total_unique: number;
  total_repetitive: number;
  total_bulk: number;
}

export default function DownloadHistorySettings() {
  const { groupId } = useParams<{ groupId: string }>();
  const [data, setData] = useState<DownloadRecord[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total_downloads: 0,
    total_unique: 0,
    total_repetitive: 0,
    total_bulk: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchQuery]);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!groupId) return;
      try {
        setLoading(true);
        const response = await api.get(`/groups/${groupId}/downloads/history`);
        if (response.data?.success) {
          const rawData: DownloadRecord[] = response.data.data || [];
          
          const repetitiveKeys = new Set<string>();
          rawData.forEach(r => {
            if (r.download_type === 'repetitive') {
              const fileId = r.photo?.id ? `photo-${r.photo.id}` : r.video?.id ? `video-${r.video.id}` : null;
              if (fileId && r.participant?.id) {
                repetitiveKeys.add(`${r.participant.id}-${fileId}`);
              }
            }
          });

          const deduplicatedData = rawData.filter(r => {
            if (r.download_type === 'unique') {
              const fileId = r.photo?.id ? `photo-${r.photo.id}` : r.video?.id ? `video-${r.video.id}` : null;
              if (fileId && r.participant?.id && repetitiveKeys.has(`${r.participant.id}-${fileId}`)) {
                return false;
              }
            }
            return true;
          });

          setData(deduplicatedData);
          
          setSummary({
            total_downloads: deduplicatedData.length,
            total_unique: deduplicatedData.filter(r => r.download_type === 'unique').length,
            total_repetitive: deduplicatedData.filter(r => r.download_type === 'repetitive').length,
            total_bulk: deduplicatedData.filter(r => r.download_type === 'bulk').length,
          });
        } else {
          throw new Error('Failed to fetch history');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load download history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [groupId]);

  const filteredData = useMemo(() => {
    let result = [...data];

    if (filterType !== 'all') {
      if (filterType === 'photo' || filterType === 'video') {
        result = result.filter(item => item.file_type.toLowerCase() === filterType);
      } else {
        result = result.filter(item => item.download_type.toLowerCase() === filterType);
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.participant?.name?.toLowerCase().includes(q) ||
          item.participant?.email?.toLowerCase().includes(q) ||
          item.photo?.original_name?.toLowerCase().includes(q) ||
          item.video?.original_name?.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [data, filterType, searchQuery]);

  const formatSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-6xl">
        <div className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-1">Download History</h2>
          <p className="text-muted-foreground text-sm">Overview</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-8">
          <Card className="p-4 flex items-center gap-4 rounded-2xl border-none shadow-sm bg-white">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{summary.total_downloads}</div>
              <div className="text-xs text-muted-foreground font-medium">Total</div>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-4 rounded-2xl border-none shadow-sm bg-white">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 shrink-0">
              <div className="text-[10px] font-black uppercase tracking-wider">NEW</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{summary.total_unique}</div>
              <div className="text-xs text-muted-foreground font-medium">Unique</div>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-4 rounded-2xl border-none shadow-sm bg-white">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 shrink-0">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{summary.total_repetitive}</div>
              <div className="text-xs text-muted-foreground font-medium">Repetitive</div>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-4 rounded-2xl border-none shadow-sm bg-white">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{summary.total_bulk}</div>
              <div className="text-xs text-muted-foreground font-medium">Bulk</div>
            </div>
          </Card>
        </div>

        {/* Search and Filter Row */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search by name, email or file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 rounded-full border-none shadow-sm bg-white text-base focus-visible:ring-1 focus-visible:ring-primary/20"
            />
          </div>
          <div className="w-full sm:w-48 shrink-0">
            <Select
              value={filterType}
              onValueChange={(val) => setFilterType(val)}
            >
              <SelectTrigger className="w-full h-14 rounded-full bg-white border border-input shadow-sm font-medium focus:ring-0 focus:ring-offset-0 focus:outline-none !ring-0 !ring-offset-0 data-[state=open]:border-primary hover:border-border px-5">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Downloads</SelectItem>
                <SelectItem value="unique">Unique</SelectItem>
                <SelectItem value="repetitive">Repetitive</SelectItem>
                <SelectItem value="bulk">Bulk</SelectItem>
                <SelectItem value="photo">Photo</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-2 text-sm text-gray-500 font-medium px-1">
          {filteredData.length} records
        </div>

        {/* Table of Records */}
        <div className="rounded-2xl border border-border/50 overflow-hidden bg-white shadow-sm">
          <Table>
            <TableHeader className="bg-white border-b border-gray-100">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-medium px-6 py-4">Participant</TableHead>
                <TableHead className="font-medium px-6 py-4">Type</TableHead>
                <TableHead className="font-medium px-6 py-4">Format</TableHead>
                <TableHead className="font-medium px-6 py-4 text-right">Date</TableHead>
                <TableHead className="w-[80px] text-center font-medium px-6 py-4">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center px-6">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center px-6">
                    <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                    <span className="text-red-500">{error}</span>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground px-6">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-6 h-6 text-muted-foreground/50" />
                      <p>No downloads found matching your criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((record) => {
                  const date = new Date(record.created_at);
                  const fileObj = record.photo || record.video;
                  
                  let badgeColor = 'bg-gray-100 text-gray-600';
                  if (record.download_type === 'unique') badgeColor = 'bg-emerald-50 text-emerald-600';
                  if (record.download_type === 'repetitive') badgeColor = 'bg-blue-50 text-blue-600';
                  if (record.download_type === 'bulk') badgeColor = 'bg-purple-50 text-purple-600';

                  return (
                    <React.Fragment key={record.id}>
                      <TableRow className="hover:bg-muted/50 group border-b border-border/50">
                        <TableCell className="font-medium px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              {getInitials(record.participant?.name)}
                            </div>
                            <div>
                              <div className="text-sm font-semibold">{record.participant?.name || 'Unknown'}</div>
                              <div className="text-xs text-muted-foreground truncate max-w-[150px]">{record.participant?.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <Badge variant="outline" className={`font-semibold ${
                            record.download_type === 'unique' ? 'text-emerald-500 border-emerald-200 bg-emerald-50' :
                            record.download_type === 'repetitive' ? 'text-blue-500 border-blue-200 bg-blue-50' :
                            'text-amber-500 border-amber-200 bg-amber-50'
                          }`}>
                            {record.download_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            {record.file_type === 'video' ? <Video className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />}
                            <span className="text-xs capitalize">{record.file_type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-6 py-4">
                          <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-xs">
                              {date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center px-6 py-4">
                          <button
                            onClick={() => setExpandedRowId(expandedRowId === record.id ? null : record.id)}
                            className="p-2 hover:bg-muted rounded-full transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye text-muted-foreground"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                          </button>
                        </TableCell>
                      </TableRow>
                      {/* Expandable Row */}
                      {expandedRowId === record.id && fileObj && (
                        <TableRow className="bg-muted/10 border-b border-border/50">
                          <TableCell colSpan={5} className="py-3 px-6">
                            <div className="flex items-center justify-between bg-white/50 p-3 rounded-lg border border-border/50">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border/50">
                                  {fileObj.url ? (
                                    <img src={fileObj.url} alt={fileObj.original_name} className="w-full h-full object-cover" />
                                  ) : (
                                    <FileText className="w-5 h-5 text-muted-foreground" />
                                  )}
                                </div>
                                <div className="text-sm font-medium text-foreground truncate">
                                  {fileObj.original_name}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground font-medium whitespace-nowrap ml-4">
                                {formatSize(fileObj.size)}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Footer Count & Pagination */}
        <div className="mt-5 pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{paginatedData.length}</span> of <span className="font-semibold text-foreground">{filteredData.length}</span> records
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted disabled:opacity-50 transition-colors text-xs font-medium flex items-center gap-1"
              >
                Previous
              </button>
              <span className="text-xs text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || loading}
                className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted disabled:opacity-50 transition-colors text-xs font-medium flex items-center gap-1"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

