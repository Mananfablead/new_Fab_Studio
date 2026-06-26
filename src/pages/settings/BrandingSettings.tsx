import { useState, useEffect, useRef } from 'react';
import { Phone, Mail, Globe, Camera, Upload, Trash2 } from 'lucide-react';
import { useUserFullProfile } from '@/hooks/useUserFullProfile';
import { useDispatch } from 'react-redux';
import { updateUserProfile, fetchUserFullProfile } from '@/store/slices/authSlice';
import { toast } from 'sonner';

export default function BrandingSettings() {
  const { user, loading } = useUserFullProfile();
  const dispatch = useDispatch<any>();

  const [showInGallery, setShowInGallery] = useState(true);
  const [portfolioOnly, setPortfolioOnly] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [youtube, setYoutube] = useState('');
  const [vimeo, setVimeo] = useState('');

  const [logo, setLogo] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation errors
  const [businessPhoneError, setBusinessPhoneError] = useState('');
  const [businessEmailError, setBusinessEmailError] = useState('');

  const validateBusinessPhone = (value: string) => {
    if (!value) return ''; // optional field — only validate if filled
    if (value.length < 10) return 'Phone number must be exactly 10 digits';
    return '';
  };

  const validateBusinessEmail = (value: string) => {
    if (!value) return ''; // optional field — only validate if filled
    const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(value.trim())) return 'Please enter a valid email address';
    return '';
  };

  const handleBusinessPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setBusinessPhone(val);
    setBusinessPhoneError(validateBusinessPhone(val));
  };

  const handleBusinessEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Block spaces anywhere in email
    if (val.includes(' ')) return;
    setBusinessEmail(val);
    setBusinessEmailError(validateBusinessEmail(val));
  };

  // Fetch latest business branding data on mount
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchUserFullProfile(user.id));
    }
  }, [dispatch, user?.id]);

  // Initialize toggle states from user.business data
  useEffect(() => {
    if (user?.business) {
      const b = user.business as any;
      setShowInGallery(b.showBusinessInfo ?? b.show_in_gallery ?? true);
      setBusinessName(b.businessName || b.name || '');
      setBusinessPhone(b.businessPhone || b.phone || '');
      setBusinessEmail(b.businessEmail || b.email || '');
      setWebsite(b.businessWebsite || b.website || '');

      const s = b.socialLinks;
      if (Array.isArray(s)) {
        const getUrl = (platform: string) => s.find((item: any) => item.platform === platform)?.url || '';
        setInstagram(getUrl('instagram'));
        setFacebook(getUrl('facebook'));
        setWhatsapp(getUrl('whatsapp'));
        setYoutube(getUrl('youtube'));
        setVimeo(getUrl('vimeo'));
      } else if (s && typeof s === 'object') {
        setInstagram(s.instagram || '');
        setFacebook(s.facebook || '');
        setWhatsapp(s.whatsapp || b.whatsappNumber || b.whatsapp_number || '');
        setYoutube(s.youtube || '');
        setVimeo(s.vimeo || '');
      }
      setLogo(b.logo || '');
    }
  }, [user?.business]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogo('');
    setLogoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveBranding = async () => {
    if (!user?.id) return;

    // Validate before saving
    const phoneErr = validateBusinessPhone(businessPhone);
    const emailErr = validateBusinessEmail(businessEmail);
    setBusinessPhoneError(phoneErr);
    setBusinessEmailError(emailErr);
    if (phoneErr || emailErr) return;

    try {
      const formData = new FormData();
      // Flattened fields for better backend compatibility
      formData.append('business_name', businessName);
      formData.append('business_phone', businessPhone);
      formData.append('business_email', businessEmail);
      formData.append('business_website', website);
      formData.append('show_in_gallery', String(showInGallery ? 1 : 0));

      // Social links as array
      const links = [
        { platform: 'instagram', url: instagram },
        { platform: 'facebook', url: facebook },
        { platform: 'whatsapp', url: whatsapp },
        { platform: 'youtube', url: youtube },
        { platform: 'vimeo', url: vimeo },
      ].filter(l => l.url);

      links.forEach((link, i) => {
        formData.append(`socialLinks[${i}][platform]`, link.platform);
        formData.append(`socialLinks[${i}][url]`, link.url);
      });

      // Also keep flat fields for backward compatibility if needed
      formData.append('instagram', instagram);
      formData.append('facebook', facebook);
      formData.append('whatsapp', whatsapp);
      formData.append('whatsapp_number', whatsapp);
      formData.append('youtube', youtube);
      formData.append('vimeo', vimeo);

      // Business Branding parameters (CamelCase)
      formData.append('businessName', businessName);
      formData.append('businessPhone', businessPhone);
      formData.append('businessEmail', businessEmail);
      formData.append('businessWebsite', website);
      formData.append('showBusinessInfo', String(showInGallery ? 1 : 0));
      formData.append('whatsappNumber', whatsapp);

      if (logoFile) {
        formData.append('business_logo', logoFile);
        formData.append('logo', logoFile); // Also send as 'logo' for broad compatibility
      }

      await dispatch(updateUserProfile({ userId: user.id, payload: formData })).unwrap();
      toast.success('Business branding updated successfully!');
    } catch (error: any) {
      toast.error(error || 'Failed to save business branding');
    }
  };

  return (
    <div className="space-y-6">
      {/* Business Branding Form */}
      <div className="bg-card rounded-xl border border-border fab-shadow p-6">
        <h2 className="font-heading font-semibold text-xl mb-6">Business Branding</h2>

        <div className="space-y-6">
          {/* Logo Upload Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-muted/30 border border-border/50 mb-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-xl bg-card border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-colors group-hover:border-[hsl(var(--fab-amber))]">
                {logo ? (
                  <img src={logo} alt="Business Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <Camera className="w-8 h-8 text-muted-foreground" />
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[hsl(var(--fab-amber))] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h3 className="text-sm font-semibold mb-1">Business Logo</h3>
              <p className="text-xs text-muted-foreground mb-3">Upload your professional logo. Best size 200x200px (PNG or JPG).</p>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-[hsl(var(--fab-amber))]/10 text-[hsl(var(--fab-amber))] text-xs font-medium hover:bg-[hsl(var(--fab-amber))]/20 transition-colors flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Change Logo
                </button>
                {logo && (
                  <button
                    onClick={handleRemoveLogo}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Business Name with Toggle */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Business Name</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Show in gallery</span>
                <button
                  onClick={() => setShowInGallery(!showInGallery)}
                  className={`w-9 h-5 rounded-full transition-colors relative ${showInGallery ? 'bg-[hsl(var(--fab-amber))]' : 'bg-muted'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-card absolute top-0.5 transition-all ${showInGallery ? 'left-[18px]' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--fab-amber))]"
            />
            <p className="text-xs text-muted-foreground mt-1.5">Note: Enable toggle to display in gallery</p>
          </div>

          {/* Contact Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Business Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={businessPhone}
                  onChange={handleBusinessPhoneChange}
                  type="tel"
                  inputMode="numeric"
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--fab-amber))] ${businessPhoneError ? 'border-red-500 focus:ring-red-400' : 'border-input'}`}
                />
              </div>
              {businessPhoneError && (
                <p className="text-xs text-red-500 mt-1.5">{businessPhoneError}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Business Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={businessEmail}
                  onChange={handleBusinessEmailChange}
                  type="email"
                  placeholder="Enter business email"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--fab-amber))] ${businessEmailError ? 'border-red-500 focus:ring-red-400' : 'border-input'}`}
                />
              </div>
              {businessEmailError && (
                <p className="text-xs text-red-500 mt-1.5">{businessEmailError}</p>
              )}
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="text-sm font-medium mb-2 block">Website</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--fab-amber))]"
              />
            </div>
          </div>

          {/* Social Links Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Instagram Link</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground font-bold text-xs">IG</div>
                <input
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="instagram.com/username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--fab-amber))]"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Facebook Link</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground font-bold text-xs">FB</div>
                <input
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="facebook.com/username"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--fab-amber))]"
                />
              </div>
            </div>
          </div>

          {/* Only for Portfolio Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
            <div>
              <p className="text-sm font-medium">Only for Portfolio</p>
              <p className="text-xs text-muted-foreground">Show this branding only on portfolio pages</p>
            </div>
            <button
              onClick={() => setPortfolioOnly(!portfolioOnly)}
              className={`w-11 h-6 rounded-full transition-colors relative ${portfolioOnly ? 'bg-[hsl(var(--fab-amber))]' : 'bg-muted'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-card absolute top-0.5 transition-all ${portfolioOnly ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Additional Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">WhatsApp Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--fab-amber))]"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Youtube Channel</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground font-bold text-xs">YT</div>
                <input
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="youtube.com/channel"
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--fab-amber))]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Vimeo Link</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground font-bold text-xs">VM</div>
              <input
                value={vimeo}
                onChange={(e) => setVimeo(e.target.value)}
                placeholder="vimeo.com/username"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--fab-amber))]"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveBranding}
            className="w-full sm:w-auto px-8 py-3 rounded-xl fab-gradient text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Branding Preview */}
      <div className="bg-card rounded-xl border border-border fab-shadow p-6">
        <h3 className="font-heading font-semibold text-lg mb-4">Branding Preview</h3>

        <div className="p-6 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border">
          {/* Logo Placeholder */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-white border border-border flex items-center justify-center overflow-hidden p-1.5 shadow-sm">
              {logo ? (
                <img src={logo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Camera className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Album by</p>
              <p className="text-lg font-heading font-bold">{businessName || "Your Business Name"}</p>
            </div>
          </div>

          {/* Social Icons Preview */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
            {instagram && (
              <button className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500 hover:bg-pink-500 hover:text-white transition-colors font-bold text-sm">
                IG
              </button>
            )}
            {facebook && (
              <button className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 hover:bg-blue-500 hover:text-white transition-colors font-bold text-sm">
                FB
              </button>
            )}
            {businessPhone && (
              <button className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-colors">
                <Phone className="w-5 h-5" />
              </button>
            )}
            {businessEmail && (
              <button className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 hover:bg-orange-500 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
