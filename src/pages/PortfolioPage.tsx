import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Globe, Mail, Phone,
  Camera, User, ExternalLink,
  ArrowLeft, Loader2, ImageIcon, Copy, Check, Link2
} from 'lucide-react';
import api from '@/services/api';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectUser, selectPortfolioAbout, selectPortfolioPhotos, selectPortfolioServices, selectPortfolioWebsiteUrl, selectPortfolioCoverImage } from '@/store/selectors';
import { fetchPortfolio } from '@/store/slices/portfolioSlice';

interface PortfolioService {
  id?: string | number;
  title: string;
  pricing: string;
  currency: string;
  enabled: boolean;
  iconUrl?: string | null;
}

interface PublicPortfolioData {
  name: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  role?: string;
  about?: string;
  websiteUrl?: string;
  coverImage?: string | null;
  photos?: string[];
  services?: PortfolioService[];
  business?: {
    businessName?: string;
    businessPhone?: string;
    businessEmail?: string;
    businessWebsite?: string;
    logo?: string;
    socialLinks?: {
      instagram?: string;
      facebook?: string;
      twitter?: string;
      youtube?: string;
      whatsapp?: string;
      vimeo?: string;
    };
  };
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹', USD: '$', EUR: '€', GBP: '£', AUD: 'A$',
};

function getImageUrl(url: unknown): string {
  if (url == null) return '';
  const str = typeof url === 'string' ? url : String(url);
  if (!str) return '';
  if (str.startsWith('http') || str.startsWith('data:') || str.startsWith('blob:')) return str;
  if (str.includes('services/storage/')) {
    return str.replace('services/storage/', 'services/public/storage/');
  }
  if (str.startsWith('storage/')) {
    return `https://fabphotopic.fableadtech.in/services/public/${str}`;
  }
  return str;
}

function parseSocialLinks(socialLinks: any): Record<string, string> {
  const result: Record<string, string> = {
    instagram: '',
    facebook: '',
    twitter: '',
    youtube: '',
    whatsapp: '',
    vimeo: '',
  };

  if (!socialLinks) return result;

  if (Array.isArray(socialLinks)) {
    socialLinks.forEach((link: any) => {
      if (link && link.platform && link.url) {
        const platform = link.platform.toLowerCase();
        if (platform === 'twitter' || platform === 'x') {
          result.twitter = link.url;
        } else if (platform in result) {
          result[platform] = link.url;
        }
      }
    });
  } else if (typeof socialLinks === 'object') {
    result.instagram = socialLinks.instagram || socialLinks.instagram_url || '';
    result.facebook = socialLinks.facebook || socialLinks.facebook_url || '';
    result.twitter = socialLinks.twitter || socialLinks.twitter_url || socialLinks.x || '';
    result.youtube = socialLinks.youtube || socialLinks.youtube_url || '';
    result.whatsapp = socialLinks.whatsapp || socialLinks.whatsapp_number || socialLinks.whatsapp_url || '';
    result.vimeo = socialLinks.vimeo || socialLinks.vimeo_url || '';
  }

  return result;
}

function getServiceIconUrl(service: any): string {
  return service?.iconUrl || service?.icon_url || service?.icon || '';
}

function normalizeService(raw: any): PortfolioService {
  return {
    id: raw?.id,
    title: raw?.title ?? raw?.service_type ?? '',
    enabled: raw?.isActive ?? raw?.is_active ?? raw?.enabled ?? false,
    pricing: raw?.price != null ? String(raw.price) : raw?.pricing ?? '',
    currency: raw?.currency ?? 'INR',
    iconUrl: raw?.iconUrl ?? raw?.icon_url ?? raw?.icon ?? null,
  };
}

export default function PortfolioPage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state (used when viewing own portfolio)
  const currentUser = useAppSelector(selectUser);
  const reduxAbout = useAppSelector(selectPortfolioAbout);
  const reduxPhotos = useAppSelector(selectPortfolioPhotos);
  const reduxServices = useAppSelector(selectPortfolioServices);
  const reduxWebsiteUrl = useAppSelector(selectPortfolioWebsiteUrl);
  const reduxCoverImage = useAppSelector(selectPortfolioCoverImage);

  const [portfolioData, setPortfolioData] = useState<PublicPortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isOwnPortfolio = currentUser?.id && String(currentUser.id) === String(userId);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadPortfolio = async () => {
      setLoading(true);

      // If viewing own portfolio, also dispatch Redux fetch to stay in sync
      if (isOwnPortfolio) {
        try {
          await dispatch(fetchPortfolio()).unwrap();
        } catch (err) {
          console.warn('dispatch(fetchPortfolio()) failed', err);
        }
      }

      let fetchedPortfolio: any = null;

      // 1. Fetch public portfolio details (cover, photos, services, user, socialLinks)
      try {
        const { data } = await api.get(`/v2/portfolio/public/${userId}`);
        fetchedPortfolio = data?.data || data;
      } catch (err) {
        console.warn('Portfolio GET failed', err);
      }

      // Build consolidated display data
      const mergedData: PublicPortfolioData = {
        name: '',
        photos: [],
        services: [],
      };

      // Merge and override with portfolio response
      if (fetchedPortfolio) {
        const d = fetchedPortfolio;
        const u = d.user || d.portfolio?.user || {};

        const firstName = u.firstName || u.first_name || u.name?.split(' ')[0] || '';
        const lastName = u.lastName || u.last_name || u.name?.split(' ').slice(1).join(' ') || '';

        mergedData.name = d.portfolio?.name || d.name || u.name || `${firstName} ${lastName}`.trim() || '';
        mergedData.firstName = firstName;
        mergedData.lastName = lastName;
        mergedData.avatar = u.avatar || u.avatar_url || d.avatar || '';
        mergedData.email = u.email || d.email || '';
        mergedData.phone = d.portfolio?.phone || d.phone || u.phone || '';
        mergedData.role = u.role || d.role || '';

        mergedData.about = d.portfolio?.about || d.about || '';
        mergedData.websiteUrl = d.portfolio?.website_url || d.portfolio?.websiteUrl || d.website_url || '';
        mergedData.coverImage = d.portfolio?.coverImage || d.portfolio?.cover_image || d.coverImage || d.cover_image || null;
        
        const rawPhotos = d.portfolio?.photos || d.photos || [];
        mergedData.photos = Array.isArray(rawPhotos)
          ? rawPhotos.map((ph: any) => ph?.imageUrl ?? ph?.image_url ?? ph).filter(Boolean)
          : [];

        const rawServices = d.portfolio?.services || d.services || [];
        mergedData.services = Array.isArray(rawServices)
          ? rawServices.map((svc: any) => normalizeService(svc))
          : [];

        const b = u.business || d.business;
        const sLinks = d.portfolio?.socialLinks || d.socialLinks || b?.socialLinks;
        mergedData.business = {
          businessName: b?.businessName || b?.business_name || b?.name || '',
          businessPhone: b?.businessPhone || b?.business_phone || b?.phone || '',
          businessEmail: b?.businessEmail || b?.business_email || b?.email || '',
          businessWebsite: b?.businessWebsite || b?.business_website || b?.website || '',
          logo: b?.logo || b?.logo_url || b?.business_logo || '',
          socialLinks: parseSocialLinks(sLinks),
        };
      }

      // Base fallback if everything fails
      if (!fetchedPortfolio) {
        mergedData.name = `Photographer #${userId}`;
      }

      setPortfolioData(mergedData);
      setLoading(false);
    };

    loadPortfolio();
  }, [userId, isOwnPortfolio, dispatch]);

  // Build display data — own portfolio merges Redux and fetched portfolio/profile data
  const displayData: PublicPortfolioData = useMemo(() => {
    const rawBusiness = isOwnPortfolio
      ? (currentUser?.business || portfolioData?.business)
      : portfolioData?.business;

    let parsedBusiness: any = undefined;
    if (rawBusiness) {
      parsedBusiness = {
        businessName: rawBusiness.businessName || rawBusiness.business_name || rawBusiness.name || '',
        businessPhone: rawBusiness.businessPhone || rawBusiness.business_phone || rawBusiness.phone || '',
        businessEmail: rawBusiness.businessEmail || rawBusiness.business_email || rawBusiness.email || '',
        businessWebsite: rawBusiness.businessWebsite || rawBusiness.business_website || rawBusiness.website || '',
        logo: rawBusiness.logo || rawBusiness.logo_url || rawBusiness.business_logo || '',
        socialLinks: parseSocialLinks(rawBusiness.socialLinks),
      };
    }

    if (isOwnPortfolio) {
      return {
        name: currentUser?.name || portfolioData?.name || `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim(),
        firstName: currentUser?.firstName || portfolioData?.firstName,
        lastName: currentUser?.lastName || portfolioData?.lastName,
        avatar: currentUser?.avatar || portfolioData?.avatar,
        email: currentUser?.email || portfolioData?.email,
        phone: currentUser?.phone || portfolioData?.phone,
        role: currentUser?.role || portfolioData?.role,
        about: reduxAbout || portfolioData?.about,
        websiteUrl: reduxWebsiteUrl || portfolioData?.websiteUrl,
        coverImage: reduxCoverImage || portfolioData?.coverImage,
        photos: reduxPhotos?.length ? reduxPhotos : (portfolioData?.photos || []),
        services: reduxServices?.length ? reduxServices : (portfolioData?.services || []),
        business: parsedBusiness,
      };
    }
    return portfolioData
      ? { ...portfolioData, business: parsedBusiness }
      : { name: '', photos: [], services: [] };
  }, [isOwnPortfolio, currentUser, reduxAbout, reduxWebsiteUrl, reduxCoverImage, reduxPhotos, reduxServices, portfolioData]);

  const activeServices = (displayData.services || []).filter(s => s.enabled);
  const photos = displayData.photos || [];
  const business = displayData.business;
  const displayName = displayData.name || 'Photographer';
  const portfolioUrl = `${window.location.origin}/portfolio/${userId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(portfolioUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50/20 text-slate-700">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[hsl(var(--fab-amber))]" />
          <p className="text-sm font-semibold tracking-wide text-slate-500 animate-pulse">Loading creative workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/40 text-slate-800 pb-24 font-sans selection:bg-[hsl(var(--fab-amber))] selection:text-white">
      {/* Hero Cover Banner */}
      <div className="h-56 md:h-80 w-full relative overflow-hidden bg-slate-100 border-b border-slate-200/60 shadow-sm">
        {displayData.coverImage ? (
          <img
            src={getImageUrl(displayData.coverImage)}
            alt="Cover banner"
            className="w-full h-full object-cover brightness-95 transition-all duration-700 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-[hsl(var(--fab-amber))] via-orange-400 to-amber-200 relative">
            <div className="absolute inset-0 bg-white/10" />
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 relative z-10">
        {/* Overlapping profile card */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-20 md:-mt-24 mb-10 text-center md:text-left">
          {/* Avatar wrapper */}
          <div className="relative group shrink-0">
            <div className="w-36 h-36 md:w-44 md:h-44 rounded-3xl overflow-hidden border-[6px] border-white bg-white shadow-xl relative transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-[0_20px_50px_rgba(245,158,11,0.15)]">
              {displayData.avatar ? (
                <img
                  src={getImageUrl(displayData.avatar)}
                  alt={displayName}
                  className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-amber-50">
                  <span className="text-4xl font-black text-[hsl(var(--fab-amber))]/60 uppercase tracking-widest">
                    {displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'P'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="flex-1 md:pb-4 min-w-0">
            {business?.logo && (
              <img src={getImageUrl(business.logo)} alt="Logo" className="h-10 mb-3 mx-auto md:mx-0 object-contain" />
            )}
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-2 flex items-center justify-center md:justify-start gap-3"
              style={{ textShadow: '0 2px 12px rgba(255, 255, 255, 1), 0 1px 3px rgba(255, 255, 255, 1)' }}>
              {displayName}
            </h1>
            {business?.businessName && (
              <p className="text-[hsl(var(--fab-amber))] font-extrabold text-lg md:text-xl tracking-wide mb-2"
                style={{ textShadow: '0 2px 10px rgba(255, 255, 255, 1), 0 1px 2px rgba(255, 255, 255, 1)' }}>
                {business.businessName}
              </p>
            )}
            <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-widest bg-white border border-slate-200/60 rounded-full px-3.5 py-1 inline-flex items-center gap-1.5 shadow-sm">
              <Camera className="w-3.5 h-3.5 text-[hsl(var(--fab-amber))]" />
              {displayData.role === 'photographer' ? 'Photographer' : displayData.role || 'Visual Creator'}
            </p>
          </div>
        </div>

        {/* About & Contact Details Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-[32px] p-6 md:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 space-y-6">
          {displayData.about && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">About Me</h3>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed font-normal whitespace-pre-wrap">{displayData.about}</p>
            </div>
          )}

          {/* Badges / Contact Grid */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
            {(business?.businessEmail || displayData.email) && (
              <a href={`mailto:${business?.businessEmail || displayData.email}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50/20 border border-amber-100 hover:border-amber-200 text-xs md:text-sm font-semibold transition-all text-slate-700 hover:text-slate-900 shadow-sm">
                <Mail className="w-4 h-4 text-[hsl(var(--fab-amber))] shrink-0" />
                {business?.businessEmail || displayData.email}
              </a>
            )}
            {(business?.businessPhone || displayData.phone) && (
              <a href={`tel:${business?.businessPhone || displayData.phone}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50/20 border border-amber-100 hover:border-amber-200 text-xs md:text-sm font-semibold transition-all text-slate-700 hover:text-slate-900 shadow-sm">
                <Phone className="w-4 h-4 text-[hsl(var(--fab-amber))] shrink-0" />
                {business?.businessPhone || displayData.phone}
              </a>
            )}
            {(business?.businessWebsite || displayData.websiteUrl) && (
              <a href={business?.businessWebsite || displayData.websiteUrl}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50/20 border border-amber-100 hover:border-amber-200 text-xs md:text-sm font-semibold transition-all text-slate-700 hover:text-slate-900 shadow-sm">
                <Globe className="w-4 h-4 text-[hsl(var(--fab-amber))] shrink-0" />
                <span>Website</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60 ml-0.5" />
              </a>
            )}
          </div>

          {/* Social Icons inside glass card */}
          {business?.socialLinks && Object.values(business.socialLinks).some(Boolean) && (
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-4 border-t border-slate-100">
              {(() => {
                const getSocialLinkUrl = (platform: string, value: string): string => {
                  if (!value) return '';
                  if (value.startsWith('http://') || value.startsWith('https://')) {
                    return value;
                  }
                  if (platform === 'instagram') return `https://instagram.com/${value}`;
                  if (platform === 'facebook') return `https://facebook.com/${value}`;
                  if (platform === 'twitter') return `https://twitter.com/${value}`;
                  if (platform === 'youtube') return `https://youtube.com/@${value}`;
                  if (platform === 'whatsapp') {
                    const cleanNum = value.replace(/[^0-9]/g, '');
                    return `https://wa.me/${cleanNum}`;
                  }
                  if (platform === 'vimeo') return `https://vimeo.com/${value}`;
                  return value;
                };

                return (
                  <>
                    {business.socialLinks.instagram && (
                      <a href={getSocialLinkUrl('instagram', business.socialLinks.instagram)} target="_blank" rel="noopener noreferrer"
                        className="p-3 rounded-2xl bg-amber-50/50 hover:bg-amber-100/80 border border-amber-100/60 hover:border-amber-300 text-[hsl(var(--fab-amber))] hover:text-orange-600 transition-all shadow-sm flex items-center justify-center"
                        title="Instagram">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                      </a>
                    )}
                    {business.socialLinks.facebook && (
                      <a href={getSocialLinkUrl('facebook', business.socialLinks.facebook)} target="_blank" rel="noopener noreferrer"
                        className="p-3 rounded-2xl bg-amber-50/50 hover:bg-amber-100/80 border border-amber-100/60 hover:border-amber-300 text-[hsl(var(--fab-amber))] hover:text-orange-600 transition-all shadow-sm flex items-center justify-center"
                        title="Facebook">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                        </svg>
                      </a>
                    )}
                    {business.socialLinks.twitter && (
                      <a href={getSocialLinkUrl('twitter', business.socialLinks.twitter)} target="_blank" rel="noopener noreferrer"
                        className="p-3 rounded-2xl bg-amber-50/50 hover:bg-amber-100/80 border border-amber-100/60 hover:border-amber-300 text-[hsl(var(--fab-amber))] hover:text-orange-600 transition-all shadow-sm flex items-center justify-center"
                        title="Twitter">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                        </svg>
                      </a>
                    )}
                    {business.socialLinks.youtube && (
                      <a href={getSocialLinkUrl('youtube', business.socialLinks.youtube)} target="_blank" rel="noopener noreferrer"
                        className="p-3 rounded-2xl bg-amber-50/50 hover:bg-amber-100/80 border border-amber-100/60 hover:border-amber-300 text-[hsl(var(--fab-amber))] hover:text-orange-600 transition-all shadow-sm flex items-center justify-center"
                        title="YouTube">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                        </svg>
                      </a>
                    )}
                    {business.socialLinks.vimeo && (
                      <a href={getSocialLinkUrl('vimeo', business.socialLinks.vimeo)} target="_blank" rel="noopener noreferrer"
                        className="p-3 rounded-2xl bg-amber-50/50 hover:bg-amber-100/80 border border-amber-100/60 hover:border-amber-300 text-[hsl(var(--fab-amber))] hover:text-orange-600 transition-all shadow-sm flex items-center justify-center"
                        title="Vimeo">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.396 7.42c-.08 1.93-1.43 4.58-4.047 7.94-2.709 3.5-5.023 5.25-6.94 5.25-1.187 0-2.194-1.1-3.022-3.3l-1.638-6.02c-.624-2.288-1.29-3.432-1.998-3.432-.147 0-.662.315-1.547.94l-.927-1.17c1.056-.926 2.1-1.852 3.129-2.778 1.417-1.22 2.47-1.87 3.167-1.95 1.637-.18 2.647.95 3.022 3.41.4 2.61.67 4.23.81 4.88.42 1.92.89 2.87 1.41 2.87.39 0 1.002-.6 1.838-1.81.81-1.187 1.246-2.09 1.3-2.71.12-1.41-.37-2.11-1.47-2.11-.53 0-1.076.13-1.636.37 1.09-3.56 3.18-5.32 6.27-5.26 2.29.04 3.39 1.54 3.31 4.49z" />
                        </svg>
                      </a>
                    )}
                    {business.socialLinks.whatsapp && (
                      <a href={getSocialLinkUrl('whatsapp', business.socialLinks.whatsapp)} target="_blank" rel="noopener noreferrer"
                        className="p-3 rounded-2xl bg-emerald-50/10 hover:bg-emerald-100/20 border border-emerald-100/20 hover:border-emerald-300 text-emerald-600 transition-all shadow-sm flex items-center justify-center"
                        title="WhatsApp">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                        </svg>
                      </a>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>

        {/* Share link (own portfolio) */}
        {/* {isOwnPortfolio && (
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 bg-amber-50/20 border border-amber-100/60 rounded-2xl px-4 py-3 shadow-md">
            <div className="flex items-center gap-2 text-[hsl(var(--fab-amber))] shrink-0">
              <Link2 className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Your Portfolio Link:</span>
            </div>
            <span className="text-xs text-slate-500 flex-1 truncate font-mono">{portfolioUrl}</span>
            <button onClick={handleCopyLink}
              className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl bg-[hsl(var(--fab-amber))] hover:opacity-90 text-white text-xs font-bold transition-all shrink-0 shadow-md">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        )} */}

        {/* Sections Grid */}
        <div className="mt-16 space-y-16">
          {/* Services Section */}
          {activeServices.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-slate-800 flex items-center gap-3">
                <span className="w-1.5 h-6 rounded-full bg-[hsl(var(--fab-amber))] shadow-[0_0_10px_rgba(245,158,11,0.2)]" />
                Services & Packages
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeServices.map((service, i) => {
                  const symbol = CURRENCY_SYMBOLS[service.currency] || service.currency || '₹';
                  return (
                    <div
                      key={service.id ?? i}
                      className="group relative bg-white hover:bg-amber-50/10 border border-slate-200/60 hover:border-amber-250/60 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[hsl(var(--fab-amber))]/5 rounded-full blur-2xl group-hover:bg-[hsl(var(--fab-amber))]/10 transition-colors" />
                      <div className="flex items-center gap-4 mb-4">
                        {getServiceIconUrl(service) ? (
                          <img src={getImageUrl(getServiceIconUrl(service))} alt="" className="w-12 h-12 rounded-2xl object-cover border border-slate-100" />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--fab-amber))]/10 border border-[hsl(var(--fab-amber))]/20 flex items-center justify-center text-[hsl(var(--fab-amber))] shrink-0">
                            <Camera className="w-5 h-5" />
                          </div>
                        )}
                        <h3 className="font-extrabold text-slate-800 text-sm md:text-base group-hover:text-[hsl(var(--fab-amber))] transition-colors leading-snug">{service.title}</h3>
                      </div>
                      {service.pricing && (
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-baseline gap-1">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase mr-1.5 tracking-wider">Starting at</span>
                          <span className="text-2xl font-black text-[hsl(var(--fab-amber))] tracking-tight">
                            {symbol}{Number(service.pricing).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Showcase Portfolio Showcase Grid */}
          {photos.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-slate-800 flex items-center gap-3">
                <span className="w-1.5 h-6 rounded-full bg-[hsl(var(--fab-amber))] shadow-[0_0_10px_rgba(245,158,11,0.2)]" />
                Showcase Portfolio
              </h2>
              <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                {photos.map((photo, i) => (
                  <div
                    key={i}
                    className="break-inside-avoid relative rounded-[24px] overflow-hidden cursor-pointer group bg-white border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300"
                    onClick={() => setLightboxPhoto(getImageUrl(photo))}
                  >
                    <img
                      src={getImageUrl(photo)}
                      alt={`Portfolio ${i + 1}`}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={e => { (e.target as HTMLImageElement).parentElement!.style.display = 'none'; }}
                    />
                    {/* Overlay with subtle blur and zoom icon */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                      <div className="w-10 h-10 rounded-full bg-[hsl(var(--fab-amber))]/80 border border-white/20 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-300">
                        <ImageIcon className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {activeServices.length === 0 && photos.length === 0 && (
            <div className="text-center py-20 bg-amber-50/5 border-2 border-dashed border-slate-200 rounded-[32px] p-6">
              <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <ImageIcon className="w-10 h-10 text-slate-300 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">Portfolio Coming Soon</h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
                {isOwnPortfolio
                  ? 'Add premium services and showcase photos in Portfolio Settings to populate this workspace.'
                  : 'This creator hasn\'t added portfolio showcases yet.'}
              </p>
              {isOwnPortfolio && (
                <button onClick={() => navigate('/settings/portfolio')}
                  className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[hsl(var(--fab-amber))] hover:opacity-95 text-white text-sm font-bold transition-all shadow-md">
                  Go to Portfolio Settings
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-400 pt-16 mt-16 border-t border-slate-200/60">
          <span>Powered by </span>
          <a href="/landing" className="text-[hsl(var(--fab-amber))] font-extrabold hover:underline">Fablead Studio</a>
        </footer>
      </div>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 transition-opacity duration-300"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            onClick={() => setLightboxPhoto(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all text-sm shrink-0 shadow-lg"
          >
            ✕
          </button>
          <div className="relative max-w-full max-h-[90vh] overflow-hidden rounded-[24px] border border-slate-800 shadow-2xl">
            <img
              src={lightboxPhoto}
              alt="Portfolio photo"
              className="max-w-full max-h-[90vh] object-contain rounded-[24px]"
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
