/**
 * ============================================================================
 * SeaNeB Business Applications Portal — Controller
 * ============================================================================
 *
 * Products are now loaded dynamically from SeaNebAPI (api.js).
 * Falls back to built-in config if backend is unavailable.
 * Includes skeleton loading, toast notifications, search & category filter.
 */

'use strict';

// ============================================================================
// SVG Icon Registry — keyed by product_key / iconSvgKey
// ============================================================================
const ICON_SVG = {
  'jobs': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>`,
  'seaneb': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 9l2-5h14l2 5"/>
    <path d="M21 9v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9"/>
    <path d="M3 9h18"/>
    <path d="M9 22V12h6v10"/>
  </svg>`,
  'auto': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.1 2 11.5 2 12v4c0 .6.4 1 1 1h2"/>
    <circle cx="7" cy="17" r="2"/>
    <path d="M9 17h6"/>
    <circle cx="17" cy="17" r="2"/>
  </svg>`,
  'news': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/>
    <path d="M18 14h-8"/>
    <path d="M15 18h-5"/>
    <path d="M10 6h8v4h-8V6Z"/>
  </svg>`,
  'trip': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.3c.4-.2.6-.6.5-1.1z"/>
  </svg>`,
  'ngo': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>`,
  'tiffin': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/>
    <line x1="10" y1="1" x2="10" y2="4"/>
    <line x1="14" y1="1" x2="14" y2="4"/>
  </svg>`,
  'seaneb-app': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>`,
  'property': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
    <line x1="9" y1="22" x2="9" y2="18"/>
    <line x1="15" y1="22" x2="15" y2="18"/>
    <line x1="8" y1="6" x2="10" y2="6"/>
    <line x1="14" y1="6" x2="16" y2="6"/>
    <line x1="8" y1="10" x2="10" y2="10"/>
    <line x1="14" y1="10" x2="16" y2="10"/>
    <line x1="8" y1="14" x2="10" y2="14"/>
    <line x1="14" y1="14" x2="16" y2="14"/>
  </svg>`,
  'arthyam': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="4" y="2" width="16" height="20" rx="2"/>
    <line x1="8" y1="6" x2="16" y2="6"/>
    <line x1="16" y1="14" x2="16" y2="14.01"/>
    <line x1="12" y1="14" x2="12" y2="14.01"/>
    <line x1="8" y1="14" x2="8" y2="14.01"/>
    <line x1="16" y1="18" x2="16" y2="18.01"/>
    <line x1="12" y1="18" x2="12" y2="18.01"/>
    <line x1="8" y1="18" x2="8" y2="18.01"/>
    <line x1="8" y1="10" x2="8" y2="10.01"/>
    <line x1="12" y1="10" x2="12" y2="10.01"/>
    <line x1="16" y1="10" x2="16" y2="10.01"/>
  </svg>`,
  'default': `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="3"/>
    <path d="M9 9h6M9 12h6M9 15h4"/>
  </svg>`
};

function getProductIcon(product) {
  const key = product.iconSvgKey || product.key || product.id || '';
  return ICON_SVG[key] || ICON_SVG['default'];
}

// ============================================================================
// Safe HTML Escaping
// ============================================================================
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ============================================================================
// DOM Controller
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {

  // State
  const state = {
    activeCategory: 'all',
    searchQuery: '',
    allProducts: [],
    isLoading: true
  };

  // DOM refs
  const header = document.getElementById('site-header');
  const productsGrid = document.getElementById('products-grid');
  const emptyState = document.getElementById('empty-state');
  const searchInput = document.getElementById('app-search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const categoryChips = document.querySelectorAll('.category-chip');
  const resultsCountText = document.getElementById('results-count-text');
  const resetFilterBtn = document.getElementById('reset-filter-btn');
  const exploreAppsBtn = document.getElementById('explore-apps-btn');
  const toastEl = document.getElementById('toast-notification');
  const toastMsgEl = document.getElementById('toast-message');

  // ==========================================================================
  // Toast Notification Utility
  // ==========================================================================
  let toastTimeout = null;
  function showToast(message, duration = 3000) {
    if (!toastEl || !toastMsgEl) return;
    toastMsgEl.textContent = message;
    toastEl.classList.add('is-visible');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toastEl.classList.remove('is-visible'), duration);
  }

  // ==========================================================================
  // Skeleton Loader
  // ==========================================================================
  function showSkeletonLoading(count = 3) {
    if (!productsGrid) return;
    const skeletons = Array.from({ length: count }, () => `
      <div class="product-card product-card--skeleton" aria-hidden="true">
        <div class="card-header-row">
          <div class="skeleton-icon-box"></div>
          <div class="skeleton-badge"></div>
        </div>
        <div class="card-body">
          <div class="skeleton-title"></div>
          <div class="skeleton-line skeleton-line--sm"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line skeleton-line--short"></div>
        </div>
        <div class="card-footer">
          <div class="skeleton-cta"></div>
        </div>
      </div>
    `).join('');
    productsGrid.innerHTML = skeletons;
    if (resultsCountText) resultsCountText.textContent = 'Loading business applications…';
  }

  // ==========================================================================
  // Render Product Cards
  // ==========================================================================
  function renderProducts(productsToRender) {
    if (!productsGrid) return;

    if (productsToRender.length === 0) {
      productsGrid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'flex';
      if (resultsCountText) resultsCountText.textContent = 'No applications found matching your criteria';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    const total = state.allProducts.length;
    if (resultsCountText) {
      if (productsToRender.length === total) {
        resultsCountText.textContent = `Showing all ${total} business applications`;
      } else {
        resultsCountText.textContent = `Showing ${productsToRender.length} of ${total} business applications`;
      }
    }

    productsGrid.innerHTML = productsToRender.map(product => {
      const iconSvg = getProductIcon(product);

      const secondaryHtml = product.secondaryLabel ? `
        <div class="product-meta-note">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
            <line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
          <span>${escapeHtml(product.secondaryLabel)}</span>
        </div>
      ` : '';

      const badgeHtml = product.status === 'official-info' ? `
        <span class="card-status-badge card-status-badge--info">Info</span>
      ` : `
        <span class="card-status-badge card-status-badge--live">
          <span class="badge-live-dot"></span>Live
        </span>
      `;

      // Use logo image if available from API, else fall back to SVG icon
      const hasRealIcon = product.iconUrl && product.iconUrl.startsWith('http');
      const iconHtml = hasRealIcon
        ? `<img src="${escapeHtml(product.iconUrl)}" alt="${escapeHtml(product.name)} icon" class="tile-icon-img" width="28" height="28" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
           <span class="icon-svg-fallback" style="display:none">${iconSvg}</span>`
        : iconSvg;

      return `
        <article
          class="product-card"
          id="product-card-${escapeHtml(product.id)}"
          data-id="${escapeHtml(product.id)}"
          data-category="${escapeHtml(product.category)}"
          tabindex="0"
          role="link"
          aria-label="${escapeHtml(product.name)}: ${escapeHtml(product.ctaLabel)}"
        >
          <!-- Top Row: Icon & Domain Badge -->
          <div class="card-header-row">
            <div class="card-icon-container" aria-hidden="true">
              ${iconHtml}
            </div>
            <div class="card-header-right">
              ${badgeHtml}
              <span class="card-domain-badge" title="${escapeHtml(product.displayUrl)}">
                ${escapeHtml(product.displayUrl)}
              </span>
            </div>
          </div>

          <!-- Card Body -->
          <div class="card-body">
            <h3 class="product-name">${escapeHtml(product.name)}</h3>
            <p class="product-audience">${escapeHtml(product.audience || product.description)}</p>
            <p class="product-description">${escapeHtml(product.description)}</p>
            ${secondaryHtml}
          </div>

          <!-- Card Footer CTA -->
          <div class="card-footer">
            <a
              href="${escapeHtml(product.href || product.url || '#')}"
              class="card-cta-btn"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="${escapeHtml(product.ctaLabel)} for ${escapeHtml(product.name)}"
            >
              <span>${escapeHtml(product.ctaLabel)}</span>
              <svg class="card-cta-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
          </div>
        </article>
      `;
    }).join('');

    // Card interaction
    attachCardInteractions();
  }

  // ==========================================================================
  // Card Click & Keyboard Navigation
  // ==========================================================================
  function attachCardInteractions() {
    if (!productsGrid) return;
    const cards = productsGrid.querySelectorAll('.product-card');

    cards.forEach(card => {
      const link = card.querySelector('.card-cta-btn');
      if (!link) return;
      const destination = link.getAttribute('href');

      card.addEventListener('click', (e) => {
        if (e.target.closest('a')) return;
        const productId = card.getAttribute('data-id');
        const product = state.allProducts.find(p => p.id === productId);
        if (product) showToast(`Opening ${product.name}…`);
        window.open(destination, '_blank', 'noopener,noreferrer');
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          window.open(destination, '_blank', 'noopener,noreferrer');
        }
      });
    });
  }

  // ==========================================================================
  // Filter & Search Engine
  // ==========================================================================
  function filterProducts() {
    const query = state.searchQuery.trim().toLowerCase();
    const activeCat = state.activeCategory;

    const filtered = state.allProducts.filter(item => {
      const catMatch = activeCat === 'all' || item.category === activeCat;
      const textCorpus = `${item.name} ${item.description} ${item.audience} ${item.displayUrl}`.toLowerCase();
      const queryMatch = query === '' || textCorpus.includes(query);
      return catMatch && queryMatch;
    });

    renderProducts(filtered);
  }

  // ==========================================================================
  // Load Products from API (with skeleton + toast feedback)
  // ==========================================================================
  async function loadProducts() {
    showSkeletonLoading(3);

    try {
      const products = await SeaNebAPI.ProductService.getProducts();
      state.allProducts = products;
      state.isLoading = false;
      renderProducts(products);
      showToast(`${products.length} business apps loaded`);
    } catch (err) {
      console.error('[SeaNeb App] Failed to load products:', err);
      state.isLoading = false;
      if (productsGrid) {
        productsGrid.innerHTML = `
          <div class="api-error-state">
            <div class="error-icon-wrap" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p class="error-title">Unable to load applications</p>
            <p class="error-text">Please check your connection and try again.</p>
            <button id="retry-load-btn" class="btn btn-secondary" style="margin-top:16px">
              Retry
            </button>
          </div>
        `;
        const retryBtn = document.getElementById('retry-load-btn');
        if (retryBtn) retryBtn.addEventListener('click', loadProducts);
      }
    }
  }

  // ==========================================================================
  // Category Filter Chips
  // ==========================================================================
  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      categoryChips.forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-selected', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-selected', 'true');
      state.activeCategory = chip.getAttribute('data-category') || 'all';
      filterProducts();
    });
  });

  // ==========================================================================
  // Search Input & Clear
  // ==========================================================================
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      if (searchClearBtn) {
        searchClearBtn.hidden = state.searchQuery.length === 0;
      }
      filterProducts();
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      state.searchQuery = '';
      searchClearBtn.hidden = true;
      filterProducts();
    });
  }

  // ==========================================================================
  // Reset Filter Button (empty state)
  // ==========================================================================
  if (resetFilterBtn) {
    resetFilterBtn.addEventListener('click', () => {
      state.searchQuery = '';
      state.activeCategory = 'all';
      if (searchInput) {
        searchInput.value = '';
        if (searchClearBtn) searchClearBtn.hidden = true;
      }
      categoryChips.forEach(c => {
        const isAll = c.getAttribute('data-category') === 'all';
        c.classList.toggle('active', isAll);
        c.setAttribute('aria-selected', isAll ? 'true' : 'false');
      });
      filterProducts();
    });
  }

  // ==========================================================================
  // Hero CTA Smooth Scroll
  // ==========================================================================
  if (exploreAppsBtn) {
    exploreAppsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('apps-section');
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // ==========================================================================
  // Sticky Header Shadow
  // ==========================================================================
  window.addEventListener('scroll', () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // ==========================================================================
  // Initial Boot — Load Products via API
  // ==========================================================================
  loadProducts();
});
