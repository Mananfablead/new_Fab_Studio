import React, { useState, useMemo } from 'react';
import { Search, AlertCircle, FileText, Calendar, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Data
const MOCK_HISTORY = Array.from({ length: 45 }).map((_, i) => {
  const types = ['unique', 'repetitive', 'Bulk'];
  const fileTypes = ['photo', 'video'];
  
  const type = types[Math.floor(Math.random() * types.length)];
  const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
  const date = new Date(Date.now() - Math.random() * 10000000000).toISOString();
  
  return {
    id: `dl_${i}`,
    participant_name: `User ${Math.floor(Math.random() * 100)}`,
    participant_email: `user${i}@example.com`,
    media_id: type === 'Bulk' ? 'Multiple' : `media_${Math.floor(Math.random() * 1000)}`,
    file_type: type === 'Bulk' ? 'archive' : fileType,
    download_type: type,
    created_at: date,
  };
});

export default function DownloadHistorySettings() {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and Search Logic
  const filteredData = useMemo(() => {
    let data = [...MOCK_HISTORY];

    if (filterType !== 'all') {
      data = data.filter((item) => item.download_type.toLowerCase() === filterType.toLowerCase());
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (item) =>
          item.participant_name.toLowerCase().includes(q) ||
          item.participant_email.toLowerCase().includes(q) ||
          item.media_id.toLowerCase().includes(q)
      );
    }

    // Sort by date desc
    return data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [filterType, searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'unique':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'repetitive':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'bulk':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-6xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-heading font-bold mb-2">Download History</h2>
          <p className="text-muted-foreground text-sm">
            Monitor and track all media downloads within this group.
          </p>
        </div>
      </div>

      <Card className="p-4 md:p-6 border-border/50 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by participant or media ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 bg-muted/50 border-border/50 focus-visible:ring-primary/20"
            />
          </div>
          <div className="w-full sm:w-48 flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
            <Select
              value={filterType}
              onValueChange={(val) => {
                setFilterType(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full bg-muted/50 border-border/50">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Downloads</SelectItem>
                <SelectItem value="unique">Unique</SelectItem>
                <SelectItem value="repetitive">Repetitive</SelectItem>
                <SelectItem value="bulk">Bulk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-medium">Participant</TableHead>
                <TableHead className="font-medium">Media ID</TableHead>
                <TableHead className="font-medium">Type</TableHead>
                <TableHead className="font-medium">Format</TableHead>
                <TableHead className="font-medium text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <TableRow
                    key={item.id}
                    className="group border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm text-foreground">
                          {item.participant_name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.participant_email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono text-muted-foreground">
                        {item.media_id}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getBadgeColor(item.download_type)}>
                        {item.download_type.charAt(0).toUpperCase() + item.download_type.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="text-xs capitalize">{item.file_type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-xs">
                          {new Date(item.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-6 h-6 text-muted-foreground/50" />
                      <p>No downloads found matching your criteria.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/50">
            <span className="text-xs text-muted-foreground hidden sm:block">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 text-xs"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  // Show current page, first, last, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 p-0 text-xs ${
                          currentPage === page ? 'bg-primary text-primary-foreground' : ''
                        }`}
                      >
                        {page}
                      </Button>
                    );
                  }
                  // Show ellipsis
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="text-muted-foreground text-xs px-1">...</span>;
                  }
                  return null;
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="h-8 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
      </div>
    </div>
  );
}
