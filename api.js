/**
 * ============================================================================
 * Seaneb.app — Client API Service & Integration Module
 * ============================================================================
 *
 * ARCHITECTURE OVERVIEW:
 * ----------------------
 * Backend API  ──▶  ProductService  ──▶  Product Data Model
 *                     │
 *                     ▼
 *           Business Apps Portal Grid / Category Filter
 *
 * This module manages all asynchronous data interactions for Seaneb.app.
 * App product metadata is dynamically loaded from backend APIs.
 * No product data is hardcoded into HTML — any backend change reflects
 * seamlessly across the UI without frontend code edits.
 *
 * CONFIGURATION POINTS:
 * --------------------
 * Update `API_CONFIG.BASE_URL` or inject `window.__SEANEB_API_BASE_URL__` to point
 * to your live staging or production backend services.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    const instance = factory();
    root.SeanebAPI = instance;
    root.SeaNebAPI = instance;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Global API Configuration
   */
  const API_CONFIG = {
    DEV_URL: (typeof window !== 'undefined' && window.__SEANEB_DEV_URL__)
      || 'https://dev.seaneb.com',
    CENTRAL_URL: (typeof window !== 'undefined' && window.__SEANEB_CENTRAL_URL__)
      || 'https://central-api.seaneb.com',
    S3_BASE_URL: (typeof window !== 'undefined' && window.__SEANEB_S3_BASE_URL__)
      || 'https://seaneb-bucket.blr1.digitaloceanspaces.com',

    get BASE_URL() {
      if (typeof window !== 'undefined' && window.__SEANEB_API_BASE_URL__) {
        return window.__SEANEB_API_BASE_URL__;
      }
      return this.DEV_URL;
    },

    ENDPOINTS: {
      PRODUCTS_NINEDOTS: '/api/v1/products/ninedots',
      PRODUCTS: '/api/v1/products',
      SEARCH: '/api/v1/search',
      LOCATIONS: '/api/v1/public/locations',
      CATEGORIES: '/api/v1/public/categories'
    },

    TIMEOUT_MS: 5000,
    ENABLE_FALLBACK_DATA: true,
    FALLBACK_LOGO_URL: 'assets/images/fallback-product.svg'
  };

  /**
   * Resolve relative media paths to absolute S3 bucket URLs
   */
  function resolveMediaUrl(path) {
    if (!path || typeof path !== 'string') return '';
    if (
      path.startsWith('http://') ||
      path.startsWith('https://') ||
      path.startsWith('data:') ||
      path.startsWith('assets/')
    ) {
      return path;
    }
    const cleanPath = path.replace(/^\/+/, '');
    return `${API_CONFIG.S3_BASE_URL}/${cleanPath}`;
  }

  /**
   * Known canonical URLs for ecosystem products
   */
  const CANONICAL_URLS = {
    'seaneb':    'https://seaneb.app/',
    'seaneb-app':'https://seaneb.app/',
    'jobs':      'http://jobs.seaneb.app/',
    'auto':      'https://auto.seaneb.app/',
    'news':      'https://news.seaneb.app/',
    'trip':      'https://trip.seaneb.app/',
    'ngo':       'https://ngo.seaneb.app/',
    'tiffin':    'https://tiffin.seaneb.app/',
    'property':  'https://www.seaneb.org/',
    'arthyam':   'https://www.seaneb.org/'
  };

  /**
   * Category mapping for backend product keys
   */
  const CATEGORY_MAP = {
    'seaneb':    'local-discovery',
    'jobs':      'business-hiring',
    'auto':      'automotive',
    'news':      'media-community',
    'trip':      'travel',
    'ngo':       'media-community',
    'tiffin':    'food-services',
    'seaneb-app':'food-services',
    'property':  'business-hiring',
    'arthyam':   'business-hiring'
  };

  /**
   * Fallback product dataset — 3 core business applications
   * Used when backend API is unavailable
   */
  const DEFAULT_BUSINESS_APPS = [
    {
      product_key: 'seaneb',
      name: 'Seaneb',
      audience: 'Local businesses, shops and consumers',
      description: 'Search your local economy. Discover stores, explore products and connect with local businesses.',
      displayUrl: 'seaneb.app',
      href: 'https://seaneb.app/',
      ctaLabel: 'Open Seaneb',
      status: 'available',
      category: 'local-discovery',
      icon: 'assets/images/seaneb-icon.png',
      logo: 'assets/images/seaneb-logo.png',
      iconSvgKey: 'seaneb'
    },
    {
      product_key: 'jobs',
      name: 'Seaneb Jobs',
      audience: 'Employers, recruiters and job seekers',
      description: 'Manage job openings, discover candidates and simplify recruitment.',
      displayUrl: 'jobs.seaneb.app',
      href: 'http://jobs.seaneb.app/',
      ctaLabel: 'Open Seaneb Jobs',
      status: 'available',
      category: 'business-hiring',
      icon: 'in/product/jobs/favicon/jobs-favicon.webp',
      logo: 'in/product/jobs/logo/jobs-logo.webp',
      badge: 'Active',
      iconSvgKey: 'jobs'
    },
    {
      product_key: 'tiffin',
      name: 'Tiffin Service',
      audience: 'Tiffin providers and meal-service businesses',
      description: 'Manage meal plans, subscriptions and daily tiffin services.',
      displayUrl: 'tiffin.seaneb.app',
      href: 'https://tiffin.seaneb.app/',
      ctaLabel: 'Open Tiffin Service',
      secondaryLabel: 'Mobile app: Seaneb Daily',
      status: 'available',
      category: 'food-services',
      icon: 'in/product/tiffin/favicon/tiffin-favicon.png',
      logo: 'in/product/tiffin/logo/tiffin-logo.png',
      iconSvgKey: 'tiffin'
    }
  ];

  /**
   * HTTP fetch with timeout and standard JSON headers
   */
  async function fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  /**
   * Product API Service
   * Fetches business apps from backend. Falls back to DEFAULT_BUSINESS_APPS.
   */
  const ProductService = {
    async getProducts() {
      const primaryEndpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS_NINEDOTS}`;
      const fallbackEndpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PRODUCTS}`;

      try {
        let data = null;
        try {
          data = await fetchWithTimeout(primaryEndpoint);
        } catch (errPrimary) {
          console.warn(`[Seaneb API] ${primaryEndpoint} unavailable, trying fallback:`, errPrimary.message);
          data = await fetchWithTimeout(fallbackEndpoint);
        }

        const rawList = Array.isArray(data) ? data : (data.products || data.data || []);
        if (!Array.isArray(rawList) || rawList.length === 0) {
          throw new Error('API returned empty product list');
        }

        const allNormalized = this.normalizeProducts(rawList);
        
        // Return exactly 3 products as requested: Seaneb, Seaneb Jobs, Tiffin Service
        const FEATURED_KEYS = ['seaneb', 'jobs', 'tiffin'];
        const featured = FEATURED_KEYS
          .map(k => allNormalized.find(p => p.key === k))
          .filter(Boolean);

        if (featured.length === 3) {
          return featured;
        }
        return allNormalized.slice(0, 3);
      } catch (error) {
        console.warn(`[Seaneb API] Could not fetch products:`, error.message);
        if (API_CONFIG.ENABLE_FALLBACK_DATA) {
          console.info('[Seaneb API] Using built-in business apps configuration.');
          return this.normalizeProducts(DEFAULT_BUSINESS_APPS);
        }
        throw error;
      }
    },

    normalizeProducts(rawList) {
      return (rawList || [])
        .filter(p => {
          // Filter out clearly invalid/test entries
          const key = (p.product_key || p.id || p.name || '').toLowerCase();
          if (!key || key === 'y' || key.length < 2) return false;
          // Skip items with no meaningful name
          const name = p.name || p.product_name || '';
          if (!name || name.length < 2) return false;
          return true;
        })
        .map(p => {
          const key = (p.product_key || p.id || '').toLowerCase();

          let webUrl = p.href || p.web_url || p.url || '';
          if (!webUrl || webUrl.includes('159.65.154.221')) {
            webUrl = CANONICAL_URLS[key] || '#';
          }

          // Merge with local fallback data for richer display
          const localFallback = DEFAULT_BUSINESS_APPS.find(d => d.product_key === key);

          const iconPath = p.icon || p.favicon_url || localFallback?.icon || (key === 'seaneb' ? 'assets/images/seaneb-icon.png' : (key === 'jobs' ? 'assets/images/jobs.svg' : (key === 'tiffin' ? 'assets/images/tiffin.svg' : '')));
          const logoPath = p.logo || p.logo_url || localFallback?.logo || (key === 'seaneb' ? 'assets/images/seaneb-logo.png' : (key === 'jobs' ? 'assets/images/jobs.svg' : (key === 'tiffin' ? 'assets/images/tiffin.svg' : '')));

          // Prefer local metadata for display fields, fallback to API data
          const audience = p.audience || localFallback?.audience || p.tagline || '';
          const description = p.description || localFallback?.description || p.tagline || audience;
          const displayUrl = p.displayUrl || localFallback?.displayUrl || webUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
          const ctaLabel = p.ctaLabel || localFallback?.ctaLabel || `Open ${p.name || 'Product'}`;
          const secondaryLabel = p.secondaryLabel || localFallback?.secondaryLabel || null;
          const category = p.category || localFallback?.category || CATEGORY_MAP[key] || 'business-hiring';
          const status = p.status || localFallback?.status || (p.is_active !== false ? 'available' : 'soon');

          // Normalize product name from API (capitalize first letter of each word)
          let name = p.name || p.product_name || localFallback?.name || 'Product';
          // If local fallback has a nicer name, prefer it
          if (localFallback?.name) name = localFallback.name;

          return {
            id: p.product_id || key || 'product',
            key: key,
            name: name,
            audience: audience,
            description: description || audience,
            displayUrl: displayUrl,
            url: webUrl,
            href: localFallback?.href || webUrl,
            ctaLabel: ctaLabel,
            secondaryLabel: secondaryLabel,
            status: status,
            category: category,
            iconUrl: resolveMediaUrl(iconPath),
            logoUrl: resolveMediaUrl(logoPath),
            iconSvgKey: localFallback?.iconSvgKey || key,
            isActive: p.is_active !== false,
            isVisible: p.is_visible !== false,
            badge: p.badge || null
          };
        })
        // Remove duplicates by key (keep first occurrence)
        .filter((product, index, self) =>
          index === self.findIndex(p => p.key === product.key)
        );
    },

    getFallbackProducts() {
      return this.normalizeProducts(DEFAULT_BUSINESS_APPS);
    }
  };

  /**
   * Brand Logos Service
   */
  const BrandService = {
    async getBrandLogos() {
      return {
        headerLogo: 'assets/images/seaneb-logo.png',
        heroBrandIcon: 'assets/images/seaneb-icon.png',
        heroBrandIconFallback: 'assets/images/seaneb-icon.png'
      };
    }
  };

  /**
   * Search API Service
   */
  const SearchService = {
    async search(query, filters = {}) {
      const params = new URLSearchParams({
        q: query || '',
        ...filters
      });

      const endpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SEARCH}?${params.toString()}`;

      try {
        return await fetchWithTimeout(endpoint);
      } catch (err) {
        console.warn(`[Seaneb API] Search request error:`, err.message);
        return {
          status: 'local',
          query,
          timestamp: new Date().toISOString()
        };
      }
    }
  };

  /**
   * Location API Service
   */
  const LocationService = {
    popularLocations: [
      { id: 'anand', name: 'Anand', state: 'Gujarat', default: true },
      { id: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat' },
      { id: 'vadodara', name: 'Vadodara', state: 'Gujarat' },
      { id: 'surat', name: 'Surat', state: 'Gujarat' },
      { id: 'mumbai', name: 'Mumbai', state: 'Maharashtra' },
      { id: 'pune', name: 'Pune', state: 'Maharashtra' },
      { id: 'bengaluru', name: 'Bengaluru', state: 'Karnataka' },
      { id: 'delhi-ncr', name: 'Delhi NCR', state: 'Delhi' }
    ],

    async getLocations() {
      return this.popularLocations;
    }
  };

  // Public Export
  return {
    CONFIG: API_CONFIG,
    ProductService,
    BrandService,
    SearchService,
    LocationService
  };
});
