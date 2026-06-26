export type EventType = 'wedding' | 'corporate' | 'birthday' | 'engagement' | 'festival' | 'reunion' | 'babyshower' | 'concert' | 'other';

export interface Group {
  id: string;
  name: string;
  description?: string;
  eventDate?: string;
  location?: string;
  coverImage: string;
  photoCount: number;
  participantCount: number;
  createdAt: string;
  type: "private" | "public";
  eventType?: EventType;
  watermarkEnabled?: boolean;
  ownerId?: string; // Group creator/owner ID
  createdBy?: string; // Group creator/owner ID
  // Monetization fields
  monetization?: {
    enabled: boolean;
    pricePerPhoto: number;
    currency: string;
    clientAlbumSelection: boolean;
    maxSelections: number;
    watermarkText?: string;
  };
}

export interface Photo {
  id: string;
  url: string;
  thumbnail: string;
  liked: boolean;
  date: string;
  tags: string[];
  // Monetization fields
  price?: number;
  isPremium?: boolean;
  isSelectedByClient?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "photo" | "invite" | "payment" | "system";
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: "credit" | "debit";
  status: "completed" | "pending" | "failed";
}

export const mockGroups: Group[] = [
  {
    id: "1",
    name: "Krishna Yash Wedding",
    coverImage:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
    photoCount: 823,
    participantCount: 145,
    createdAt: "2026-04-10",
    type: "private",
    eventType: "wedding",
    watermarkEnabled: true,
    ownerId: "1", // Group creator ID
    createdBy: "1",
    monetization: {
      enabled: true,
      pricePerPhoto: 50,
      currency: "₹",
      clientAlbumSelection: true,
      maxSelections: 100,
      watermarkText: "Krishna Yash Photography",
    },
    viewDownload: {
      allowDownloading: false,
      enableSharing: false,
      enableScreenshots: false,
      downloadQuality: "original",
      bulkDownloads: false,
      viewingPlatform: "both",
    },
  },
  {
    id: "2",
    name: "Corporate Summit 2026",
    coverImage:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
    photoCount: 456,
    participantCount: 89,
    createdAt: "2026-04-08",
    type: "public",
    eventType: "corporate",
    watermarkEnabled: false,
    monetization: {
      enabled: false,
      pricePerPhoto: 0,
      currency: "₹",
      clientAlbumSelection: false,
      maxSelections: 0,
    },
  },
  {
    id: "3",
    name: "Birthday Bash - Priya",
    coverImage:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop",
    photoCount: 234,
    participantCount: 42,
    createdAt: "2026-04-05",
    type: "private",
    eventType: "birthday",
    monetization: {
      enabled: true,
      pricePerPhoto: 30,
      currency: "₹",
      clientAlbumSelection: true,
      maxSelections: 50,
      watermarkText: "Birthday Photography",
    },
  },
  {
    id: "4",
    name: "Tech Meetup Delhi",
    coverImage:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=300&fit=crop",
    photoCount: 178,
    participantCount: 67,
    createdAt: "2026-04-02",
    type: "public",
  },
  {
    id: "5",
    name: "Holi Celebration",
    coverImage:
      "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=400&h=300&fit=crop",
    photoCount: 567,
    participantCount: 200,
    createdAt: "2026-03-25",
    type: "public",
  },
  {
    id: "6",
    name: "Ananya Reception",
    coverImage:
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop",
    photoCount: 912,
    participantCount: 180,
    createdAt: "2026-03-20",
    type: "private",
  },
  {
    id: "7",
    name: "Rahul & Meera Engagement",
    coverImage:
      "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=300&fit=crop",
    photoCount: 345,
    participantCount: 78,
    createdAt: "2026-04-12",
    type: "private",
  },
  {
    id: "8",
    name: "Music Festival Mumbai",
    coverImage:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=300&fit=crop",
    photoCount: 1247,
    participantCount: 320,
    createdAt: "2026-04-01",
    type: "public",
  },
  {
    id: "9",
    name: "Annual School Reunion",
    coverImage:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop",
    photoCount: 289,
    participantCount: 95,
    createdAt: "2026-03-28",
    type: "private",
  },
  {
    id: "10",
    name: "Baby Shower - Sneha",
    coverImage:
      "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=400&h=300&fit=crop",
    photoCount: 156,
    participantCount: 34,
    createdAt: "2026-03-22",
    type: "private",
  },
  {
    id: "11",
    name: "Startup Launch Event",
    coverImage:
      "https://images.unsplash.com/photo-1559223607-a43c990c692c?w=400&h=300&fit=crop",
    photoCount: 423,
    participantCount: 112,
    createdAt: "2026-03-18",
    type: "public",
  },
  {
    id: "12",
    name: "Diwali Party 2026",
    coverImage:
      "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=400&h=300&fit=crop",
    photoCount: 678,
    participantCount: 156,
    createdAt: "2026-03-15",
    type: "public",
  },
];

export const mockPhotos: Photo[] = Array.from({ length: 24 }, (_, i) => {
  const isPortrait = i % 3 === 1;
  const isSquare = i % 3 === 2;
  const width = isPortrait ? 400 : (isSquare ? 500 : 600);
  const height = isPortrait ? 600 : (isSquare ? 500 : 400);
  return {
    id: String(i + 1),
    url: `https://images.unsplash.com/photo-${1500000000000 + i * 1000}?w=${width}&h=${height}&fit=crop`,
    thumbnail: `https://images.unsplash.com/photo-${1500000000000 + i * 1000}?w=${width/2}&h=${height/2}&fit=crop`,
    liked: i % 3 === 0,
    date: '2026-04-14',
    tags: i % 2 === 0 ? ['highlight'] : [],
  };
});

const photoUrls = [
  { url: 'https://images.unsplash.com/photo-1519741497674-611481863552', w: 600, h: 400 },
  { url: 'https://images.unsplash.com/photo-1606216794079-73f85bbd57d5', w: 600, h: 400 },
  { url: 'https://images.unsplash.com/photo-1529634597503-139d3726fed5', w: 500, h: 500 },
  { url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc', w: 600, h: 400 },
  { url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6', w: 500, h: 600 },
  { url: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff', w: 500, h: 500 },
  { url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a', w: 600, h: 400 },
  { url: 'https://images.unsplash.com/photo-1460978812857-470ed1c77af0', w: 400, h: 600 },
  { url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486', w: 500, h: 500 },
  { url: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92', w: 600, h: 400 },
  { url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed', w: 400, h: 600 },
  { url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b', w: 500, h: 500 },
];

export const galleryPhotos: Photo[] = photoUrls.map((item, i) => ({
  id: String(i + 1),
  url: `${item.url}?w=${item.w}&h=${item.h}&fit=crop`,
  thumbnail: `${item.url}?w=${item.w/2}&h=${item.h/2}&fit=crop`,
  liked: [0, 1, 2, 3, 5, 6, 7, 8].includes(i), // Random liked photos - 11 out of 12
  date: i < 6 ? '2026-04-14' : '2026-04-13',
  tags: i % 4 === 0 ? ['highlight'] : [],
}));

export const mockNotifications: Notification[] = [
  { id: '1', title: 'New Photos Added', message: '45 new photos added to Krishna Yash Wedding', time: '2 min ago', read: false, type: 'photo' },
  { id: '2', title: 'Group Invite', message: 'You\'ve been invited to "Diwali Party 2026"', time: '1 hour ago', read: false, type: 'invite' },
  { id: '3', title: 'Payment Received', message: '₹500 credits added to your wallet', time: '3 hours ago', read: true, type: 'payment' },
  { id: '4', title: 'Download Complete', message: 'Your album download is ready', time: '1 day ago', read: true, type: 'system' },
];

export const mockTransactions: Transaction[] = [
  { id: '1', description: 'Premium Plan - Monthly', amount: -999, date: '2026-04-01', type: 'debit', status: 'completed' },
  { id: '2', description: 'Wallet Top-up', amount: 500, date: '2026-03-28', type: 'credit', status: 'completed' },
  { id: '3', description: 'Extra Storage - 10GB', amount: -199, date: '2026-03-15', type: 'debit', status: 'completed' },
  { id: '4', description: 'Wallet Top-up', amount: 1000, date: '2026-03-10', type: 'credit', status: 'completed' },
  { id: '5', description: 'Refund - Duplicate Payment', amount: 999, date: '2026-03-05', type: 'credit', status: 'pending' },
];
