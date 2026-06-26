import {
  Play,
  BookOpen,
  GraduationCap,
  Clock,
  User,
  Download,
  Share2,
  MoreVertical,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SEOHead from "@/components/SEOHead";

const videos = [
  {
    title: "How to Create a Group",
    duration: "3:45",
    category: "Beginner",
    thumbnail:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=225&fit=crop",
    instructor: "Rahul Sharma",
  },
  {
    title: "Uploading Photos in Bulk",
    duration: "5:12",
    category: "Beginner",
    thumbnail:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&h=225&fit=crop",
    instructor: "Priya Singh",
  },
  {
    title: "Sharing Albums via QR Code",
    duration: "2:30",
    category: "Beginner",
    thumbnail:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop",
    instructor: "Amit Kumar",
  },
  {
    title: "AI Face Matching Setup",
    duration: "4:18",
    category: "Advanced",
    thumbnail:
      "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=400&h=225&fit=crop",
    instructor: "Rahul Sharma",
  },
  {
    title: "Business Branding & Watermarks",
    duration: "6:45",
    category: "Business",
    thumbnail:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=225&fit=crop",
    instructor: "Neha Gupta",
  },
  {
    title: "Analytics & Reports",
    duration: "3:50",
    category: "Advanced",
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
    instructor: "Priya Singh",
  },
];

const guides = [
  {
    title: "Getting Started Guide",
    desc: "Complete walkthrough for new users",
    category: "Beginner",
  },
  {
    title: "Photographer Workflow",
    desc: "Best practices for event photographers",
    category: "Advanced",
  },
  {
    title: "Business Setup Guide",
    desc: "Branding, team, and portfolio setup",
    category: "Business",
  },
];

export default function TutorialsPage() {
  const navigate = useNavigate();
  const [hoveredVideo, setHoveredVideo] = useState<string | null>(null);

  const handlePlay = (title: string) => {
    console.log("Playing:", title);
    // Add video play logic here
  };

  const handleDownload = (title: string) => {
    console.log("Downloading:", title);
    // Add download logic here
  };

  const handleShare = (title: string) => {
    console.log("Sharing:", title);
    // Add share logic here
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead pageKey="/tutorials" />
      <AppHeader />
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="p-2 rounded-full border border-border hover:bg-muted transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-heading font-bold">Tutorials</h1>
        </div>

        {/* Videos */}
        <div className="mb-8">
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <Play className="w-5 h-5" /> Video Tutorials
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map((v) => (
              <div
                key={v.title}
                className="bg-card rounded-xl border border-border fab-shadow overflow-hidden group cursor-pointer hover:-translate-y-1 transition-all"
                onMouseEnter={() => setHoveredVideo(v.title)}
                onMouseLeave={() => setHoveredVideo(null)}
              >
                {/* Thumbnail */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                    <button
                      onClick={() => handlePlay(v.title)}
                      className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg hover:bg-white"
                    >
                      <Play
                        className="w-6 h-6 text-primary ml-1"
                        fill="currentColor"
                      />
                    </button>
                  </div>
                  {/* Duration Badge */}
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/70 text-white text-xs font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {v.duration}
                  </div>
                  {/* Action Buttons - Show on hover */}
                  <div
                    className={`absolute bottom-2 right-2 flex items-center gap-1 transition-opacity duration-200 ${hoveredVideo === v.title ? "opacity-100" : "opacity-0"}`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(v.title);
                      }}
                      className="p-2 rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(v.title);
                      }}
                      className="p-2 rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-2">
                        {v.title}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        {v.instructor}
                      </div>
                    </div>
                    {/* Mobile Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1.5 rounded-xl hover:bg-muted shrink-0 lg:hidden">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePlay(v.title)}>
                          <Play className="w-4 h-4 mr-2" /> Play
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownload(v.title)}
                        >
                          <Download className="w-4 h-4 mr-2" /> Download
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(v.title)}>
                          <Share2 className="w-4 h-4 mr-2" /> Share
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-medium">
                      {v.category}
                    </span>
                    {/* Desktop Action Buttons */}
                    <div className="hidden lg:flex items-center gap-1">
                      <button
                        onClick={() => handleDownload(v.title)}
                        className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShare(v.title)}
                        className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Share"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Guides */}
        <div>
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Step-by-Step Guides
          </h2>
          <div className="space-y-3">
            {guides.map((g) => (
              <div
                key={g.title}
                className="bg-card rounded-xl border border-border p-4 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer fab-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{g.title}</p>
                    <p className="text-xs text-muted-foreground">{g.desc}</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-medium">
                  {g.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
