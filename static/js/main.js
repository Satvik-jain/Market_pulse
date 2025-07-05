// static/js/main.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            mirror: false
        });
    }
    
    // Initialize theme
    initTheme();
    
    // Initialize tour elements
    createTourElements();
    
    // Initialize language system
    initLanguageSystem();
    
    // Initialize accessibility features
    initAccessibility();
    
    // Default ticker
    let currentTicker = 'AAPL';
    
    // Load initial data
    loadStockData(currentTicker);
    loadNewsData(currentTicker);
    loadSentimentData(currentTicker);
    
    // Search button click handler
    document.getElementById('search-btn').addEventListener('click', function() {
        performSearch();
    });
    
    // Allow enter key to trigger search
    document.getElementById('ticker-input').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
    
    // Time range buttons
    document.querySelectorAll('.time-range').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.time-range').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update chart with new time range
            const days = parseInt(this.dataset.range);
            updateChartTimeRange(days);
        });
    });
    
    // Chart type toggle
    document.querySelectorAll('.chart-type').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.chart-type').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update chart type
            const chartType = this.dataset.type;
            toggleChartType(chartType);
        });
    });
    
    // News filter
    const newsFilter = document.getElementById('news-filter');
    if (newsFilter) {
        newsFilter.addEventListener('change', function() {
            const sentiment = this.value;
            filterNewsBySentiment(sentiment);
        });
    }
    
    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Company logos hover effect
    const companyLogo = document.getElementById('company-logo');
    if (companyLogo) {
        companyLogo.addEventListener('mouseover', function() {
            this.style.transform = 'scale(1.05)';
            this.style.boxShadow = '0 8px 25px rgba(0, 123, 255, 0.5)';
        });
        
        companyLogo.addEventListener('mouseout', function() {
            this.style.transform = 'scale(1)';
            this.style.boxShadow = '0 4px 15px rgba(0, 123, 255, 0.3)';
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Navbar scroll behavior
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        }
    });
    
    // Initialize story mode
    initStoryMode();
    
    // Initialize parallel mode
    initParallelMode();
    
    // Initialize text-to-speech
    initTextToSpeech();
});

function createTourElements() {
    console.log("Creating tour elements");
    
    // Check if tour overlay exists, if not create it
    if (!document.getElementById('tour-overlay')) {
        console.log("Tour overlay not found, creating it");
        const tourOverlay = document.createElement('div');
        tourOverlay.id = 'tour-overlay';
        tourOverlay.innerHTML = `
            <div class="tour-highlight"></div>
            <div class="tour-tooltip">
                <div class="tour-step-title">Welcome!</div>
                <div class="tour-step-content">Let me guide you through this dashboard.</div>
                <div class="tour-nav">
                    <button class="tour-prev">Previous</button>
                    <div class="tour-progress">
                        <span class="current-step">1</span>/<span class="total-steps">8</span>
                    </div>
                    <button class="tour-next">Next</button>
                </div>
            </div>
        `;
        document.body.appendChild(tourOverlay);
    } else {
        console.log("Tour overlay already exists");
    }
    
    // Check if story-mode container exists, if not create it
    if (!document.querySelector('.story-mode-container')) {
        console.log("Story mode container not found, creating it");
        const storyModeContainer = document.createElement('div');
        storyModeContainer.className = 'story-mode-container';
        storyModeContainer.innerHTML = `
            <div class="story-mode-content">
                <div class="guide-character">
                    <img src="/static/img/guide-character.png" alt="Guide" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzNiODJmNiIgLz48dGV4dCB4PSI1MCIgeT0iNTUiIGZvbnQtc2l6ZT0iMjAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIj5HdWlkZTwvdGV4dD48L3N2Zz4='" />
                </div>
                <div class="guide-message">
                    <h3>Welcome to Market Pulse!</h3>
                    <p>I'm here to help you navigate through this powerful stock analytics dashboard.</p>
                    <div class="guide-actions">
                        <button id="start-tour-btn" class="btn btn-primary">Start Tour</button>
                        <button id="skip-tour-btn" class="btn btn-outline-secondary">Skip</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(storyModeContainer);
    } else {
        console.log("Story mode container already exists");
    }
}

// Add color blindness filters to the DOM
function addColorBlindnessFilters() {
    if (!document.getElementById('colorblind-filters')) {
        const filtersSvg = document.createElement('svg');
        filtersSvg.id = 'colorblind-filters';
        filtersSvg.style.display = 'none';
        
        filtersSvg.innerHTML = `
            <filter id="protanopia-filter">
                <feColorMatrix
                    in="SourceGraphic"
                    type="matrix"
                    values="0.567, 0.433, 0,     0, 0
                            0.558, 0.442, 0,     0, 0
                            0,     0.242, 0.758, 0, 0
                            0,     0,     0,     1, 0"/>
            </filter>
            <filter id="deuteranopia-filter">
                <feColorMatrix
                    in="SourceGraphic"
                    type="matrix"
                    values="0.625, 0.375, 0,   0, 0
                            0.7,   0.3,   0,   0, 0
                            0,     0.3,   0.7, 0, 0
                            0,     0,     0,   1, 0"/>
            </filter>
            <filter id="tritanopia-filter">
                <feColorMatrix
                    in="SourceGraphic"
                    type="matrix"
                    values="0.95, 0.05,  0,     0, 0
                            0,    0.433, 0.567, 0, 0
                            0,    0.475, 0.525, 0, 0
                            0,    0,     0,     1, 0"/>
            </filter>
        `;
        
        document.body.appendChild(filtersSvg);
    }
}

// Function to update theme based on stock performance
function updateThemeBasedOnPerformance(stockData) {
    if (!stockData || stockData.length < 2) return;
    
    // Calculate the overall trend
    const firstPrice = parseFloat(stockData[0].close);
    const lastPrice = parseFloat(stockData[stockData.length - 1].close);
    const percentageChange = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    // Get theme elements
    const root = document.documentElement;
    const themeButton = document.querySelector('.theme-toggle');
    
    // Set theme based on performance
    if (percentageChange > 5) {
        // Strong bull market - green theme
        if (themeButton) themeButton.setAttribute('data-market-theme', 'bull');
        applyMarketTheme('bull');
    } else if (percentageChange < -5) {
        // Bear market - red theme
        if (themeButton) themeButton.setAttribute('data-market-theme', 'bear');
        applyMarketTheme('bear');
    } else {
        // Neutral market - blue theme
        if (themeButton) themeButton.setAttribute('data-market-theme', 'neutral');
        applyMarketTheme('neutral');
    }
}

function applyMarketTheme(marketTheme) {
    const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const root = document.documentElement;
    
    // Set theme colors based on market sentiment
    if (marketTheme === 'bull') {
        root.style.setProperty('--highlight', isDark ? '#10b981' : '#059669');
        const brandSpan = document.querySelector('.navbar-brand span');
        if (brandSpan) brandSpan.style.color = isDark ? '#10b981' : '#059669';
    } else if (marketTheme === 'bear') {
        root.style.setProperty('--highlight', isDark ? '#ef4444' : '#dc2626');
        const brandSpan = document.querySelector('.navbar-brand span');
        if (brandSpan) brandSpan.style.color = isDark ? '#ef4444' : '#dc2626';
    } else {
        root.style.setProperty('--highlight', isDark ? '#3b82f6' : '#2563eb');
        const brandSpan = document.querySelector('.navbar-brand span');
        if (brandSpan) brandSpan.style.color = isDark ? '#3b82f6' : '#2563eb';
    }
    
    // Update logo and theme
    updateLogoForTheme(marketTheme, isDark);
}

function updateLogoForTheme(marketTheme, isDark) {
    const logoIcon = document.querySelector('.logo-icon i');
    if (!logoIcon) return;
    
    // Change logo based on market theme
    if (marketTheme === 'bull') {
        logoIcon.className = 'fas fa-chart-line';
        logoIcon.style.color = isDark ? '#10b981' : '#059669';
    } else if (marketTheme === 'bear') {
        logoIcon.className = 'fas fa-chart-line';
        logoIcon.style.color = isDark ? '#ef4444' : '#dc2626';
    } else {
        logoIcon.className = 'fas fa-chart-line';
        logoIcon.style.color = isDark ? '#3b82f6' : '#2563eb';
    }
}

// Search function
function performSearch() {
    const ticker = document.getElementById('ticker-input').value.trim().toUpperCase();
    if (ticker) {
        // Show loading indicator
        document.querySelectorAll('.loading-overlay').forEach(overlay => {
            overlay.classList.add('active');
        });
        
        // Validate ticker first
        fetch(`/api/validate_ticker?ticker=${ticker}`)
            .then(response => response.json())
            .then(data => {
                if (data.valid) {
                    // Update company logo
                    updateCompanyLogo(ticker);
                    
                    // Load data
                    loadStockData(ticker);
                    loadNewsData(ticker);
                    loadSentimentData(ticker);
                    
                    // Update URL without reloading page
                    const url = new URL(window.location);
                    url.searchParams.set('ticker', ticker);
                    window.history.pushState({}, '', url);
                } else {
                    // Show custom error
                    showTickerError(ticker);
                }
            })
            .catch(() => {
                // Fallback to local validation
                if (['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA'].includes(ticker)) {
                    // Known tickers - proceed
                    updateCompanyLogo(ticker);
                    loadStockData(ticker);
                    loadNewsData(ticker);
                    loadSentimentData(ticker);
                } else {
                    showTickerError(ticker);
                }
            });
    }
}

// Creative error handling for invalid tickers
function showTickerError(ticker) {
    // Hide loading overlays
    document.querySelectorAll('.loading-overlay').forEach(overlay => {
        overlay.classList.remove('active');
    });
    
    // Create an animated error modal
    const errorModal = document.createElement('div');
    errorModal.className = 'ticker-error-modal';
    errorModal.innerHTML = `
        <div class="ticker-error-content">
            <div class="error-animation">
                <i class="fas fa-search"></i>
                <i class="fas fa-times-circle"></i>
            </div>
            <h3>Ticker "${ticker}" Not Found</h3>
            <p>We couldn't find any data for this stock symbol.</p>
            <p>Please try one of our supported tickers:</p>
            <div class="suggested-tickers">
                <span class="suggested-ticker" onclick="useTickerSuggestion('AAPL')">AAPL</span>
                <span class="suggested-ticker" onclick="useTickerSuggestion('MSFT')">MSFT</span>
                <span class="suggested-ticker" onclick="useTickerSuggestion('GOOGL')">GOOGL</span>
                <span class="suggested-ticker" onclick="useTickerSuggestion('AMZN')">AMZN</span>
                <span class="suggested-ticker" onclick="useTickerSuggestion('TSLA')">TSLA</span>
                <span class="suggested-ticker" onclick="useTickerSuggestion('META')">META</span>
            </div>
            <button class="btn btn-primary mt-3" onclick="closeTickerError()">Close</button>
        </div>
    `;
    
    document.body.appendChild(errorModal);
    
    // Animate entrance
    setTimeout(() => {
        errorModal.classList.add('show');
    }, 10);
}

function useTickerSuggestion(ticker) {
    document.getElementById('ticker-input').value = ticker;
    closeTickerError();
    performSearch();
}

function closeTickerError() {
    const modal = document.querySelector('.ticker-error-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    }
}

// Initialize theme based on user preference
function initTheme() {
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme)) {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-bs-theme', 'light');
    }
    
    // Add color blindness filters
    addColorBlindnessFilters();
}

// Toggle between light and dark themes
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update charts with new theme
    if (window.priceChart) {
        updateChartTheme(window.priceChart);
    }
    if (window.sentimentChart) {
        updateChartTheme(window.sentimentChart);
    }
    if (window.candleChart) {
        updateChartTheme(window.candleChart);
    }
    
    console.log("Theme toggled to:", newTheme);
}

// Function to update chart theme
function updateChartTheme(chart) {
    if (!chart || typeof chart.updateOptions !== 'function') return;
    
    const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    
    chart.updateOptions({
        theme: {
            mode: isDark ? 'dark' : 'light'
        },
        tooltip: {
            theme: isDark ? 'dark' : 'light'
        },
        grid: {
            borderColor: isDark ? '#333' : '#e0e0e0'
        },
        xaxis: {
            labels: {
                style: {
                    colors: isDark ? '#ccc' : '#666'
                }
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: isDark ? '#ccc' : '#666'
                }
            }
        }
    });
}

// Load stock data from API
function loadStockData(ticker) {
    console.log("Loading stock data for:", ticker);
    
    // Show loading indicator
    document.querySelectorAll('.loading-overlay').forEach(overlay => {
        overlay.classList.add('active');
    });
    
    fetch(`/api/stock_data?ticker=${ticker}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.length > 0) {
                // Save data globally
                window.stockData = data;
                
                console.log("Stock data loaded successfully:", data.length, "data points");
                
                // Update company info
                updateCompanyInfo(ticker, data[data.length-1]);
                
                // Initialize price chart with a slight delay to ensure DOM is ready
                setTimeout(() => {
                    if (document.getElementById('price-chart')) {
                        console.log("Initializing price chart");
                        initPriceChart(data);
                    } else {
                        console.error("Price chart element not available");
                    }
                }, 100);
                
                // Update theme based on performance - moved inside where data is available
                updateThemeBasedOnPerformance(data);
                
                // Hide loading overlay with a delay to ensure chart is rendered
                setTimeout(() => {
                    document.querySelectorAll('.loading-overlay').forEach(overlay => {
                        overlay.classList.remove('active');
                    });
                }, 500);
            } else {
                console.error("No data available for ticker:", ticker);
                showError(`No data available for ${ticker}`);
                
                // Hide loading overlays
                document.querySelectorAll('.loading-overlay').forEach(overlay => {
                    overlay.classList.remove('active');
                });
            }
        })
        .catch(error => {
            console.error('Error fetching stock data:', error);
            showError('Failed to load stock data. Please try again.');
            
            // Hide loading overlays
            document.querySelectorAll('.loading-overlay').forEach(overlay => {
                overlay.classList.remove('active');
            });
        });
}

// Create necessary tour elements
function createTourElements() {
    // Check if tour overlay exists, if not create it
    if (!document.getElementById('tour-overlay')) {
        const tourOverlay = document.createElement('div');
        tourOverlay.id = 'tour-overlay';
        tourOverlay.innerHTML = `
            <div class="tour-highlight"></div>
            <div class="tour-tooltip">
                <div class="tour-step-title">Welcome!</div>
                <div class="tour-step-content">Let me guide you through this dashboard.</div>
                <div class="tour-nav">
                    <button class="tour-prev">Previous</button>
                    <div class="tour-progress">
                        <span class="current-step">1</span>/<span class="total-steps">8</span>
                    </div>
                    <button class="tour-next">Next</button>
                </div>
            </div>
        `;
        document.body.appendChild(tourOverlay);
    }
    
    // Check if story-mode container exists, if not create it
    if (!document.querySelector('.story-mode-container')) {
        const storyModeContainer = document.createElement('div');
        storyModeContainer.className = 'story-mode-container';
        storyModeContainer.innerHTML = `
            <div class="story-mode-content">
                <div class="guide-character">
                    <img src="/static/img/guide-character.png" alt="Guide" />
                </div>
                <div class="guide-message">
                    <h3>Welcome to Market Pulse!</h3>
                    <p>I'm here to help you navigate through this powerful stock analytics dashboard.</p>
                    <div class="guide-actions">
                        <button id="start-tour-btn" class="btn btn-primary">Start Tour</button>
                        <button id="skip-tour-btn" class="btn btn-outline-secondary">Skip</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(storyModeContainer);
    }
}

// Language system
// Create translation dictionaries
const translations = {
    'en': {
        'dashboard': 'Dashboard',
        'news': 'News',
        'about': 'About',
        'search_placeholder': 'Enter ticker...',
        'price_history': 'Price History',
        'sentiment_analysis': 'Sentiment Analysis',
        'key_metrics': 'Key Metrics',
        'latest_news': 'Latest News & Analysis',
        'stock_tip': 'Stock Tip',
        'sector': 'Sector',
        'exchange': 'Exchange',
        'volume': 'Vol',
        'pe_ratio': 'P/E',
        'market_cap': 'Mkt Cap',
        'year_high': '52W High',
        'year_low': '52W Low',
        'avg_volume': 'Avg Volume',
        'dividend': 'Dividend',
        'beta': 'Beta',
        'eps': 'EPS',
        'buzz_score': 'Buzz Score',
        'bullish_sentiment': 'Bullish Sentiment',
        'sector_average': 'Sector Average'
    },
    'es': {
        'dashboard': 'Panel',
        'news': 'Noticias',
        'about': 'Acerca de',
        'search_placeholder': 'Ingrese símbolo...',
        'price_history': 'Historial de precios',
        'sentiment_analysis': 'Análisis de sentimiento',
        'key_metrics': 'Métricas clave',
        'latest_news': 'Últimas noticias y análisis',
        'stock_tip': 'Consejo bursátil',
        'sector': 'Sector',
        'exchange': 'Bolsa',
        'volume': 'Vol',
        'pe_ratio': 'P/E',
        'market_cap': 'Cap. Mercado',
        'year_high': 'Máx 52S',
        'year_low': 'Mín 52S',
        'avg_volume': 'Vol Promedio',
        'dividend': 'Dividendo',
        'beta': 'Beta',
        'eps': 'BPA',
        'buzz_score': 'Puntuación Buzz',
        'bullish_sentiment': 'Sentimiento alcista',
        'sector_average': 'Promedio del sector'
    },
    // Add other languages as needed
};

// Initialize language system
function initLanguageSystem() {
    // Add data-i18n attributes to elements
    addI18nAttributes();
    
    // Set up language selector dropdown clicks
    document.querySelectorAll('.dropdown-item[data-lang]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const langCode = this.getAttribute('data-lang');
            changeLanguage(langCode);
        });
    });
    
    // Load preferred language
    const preferredLanguage = localStorage.getItem('preferredLanguage') || 'en';
    changeLanguage(preferredLanguage);
}

function addI18nAttributes() {
    // Fixed version of the function to work with vanilla JavaScript
    
    // Navigation items
    document.querySelectorAll('.nav-link').forEach(el => {
        const text = el.textContent.trim();
        if (text === 'Dashboard') el.setAttribute('data-i18n', 'dashboard');
        if (text === 'News') el.setAttribute('data-i18n', 'news');
        if (text === 'About') el.setAttribute('data-i18n', 'about');
    });
    
    // Search placeholder
    const searchInput = document.getElementById('ticker-input');
    if (searchInput) {
        searchInput.setAttribute('data-i18n', 'search_placeholder');
    }
    
    // Headers
    document.querySelectorAll('.card-header h5').forEach(el => {
        const text = el.textContent.trim();
        if (text.includes('Price History')) el.setAttribute('data-i18n', 'price_history');
        if (text.includes('Sentiment Analysis')) el.setAttribute('data-i18n', 'sentiment_analysis');
        if (text.includes('Key Metrics')) el.setAttribute('data-i18n', 'key_metrics');
        if (text.includes('Latest News')) el.setAttribute('data-i18n', 'latest_news');
    });
    
    // Helper function to assign i18n attributes by matching text content
    function assignI18nByText(selector, textMatch, key) {
        document.querySelectorAll(selector).forEach(el => {
            if (el.textContent.trim().includes(textMatch)) {
                el.setAttribute('data-i18n', key);
            }
        });
    }
    
    // Apply to various elements
    assignI18nByText('.loading-tip h5', 'Stock Tip', 'stock_tip');
    assignI18nByText('.metric-label', 'Sector', 'sector');
    assignI18nByText('.metric-label', 'Exchange', 'exchange');
    assignI18nByText('.metric-label', 'Vol:', 'volume');
    assignI18nByText('.metric-label', 'P/E:', 'pe_ratio');
    assignI18nByText('.metric-label', 'Mkt Cap:', 'market_cap');
    assignI18nByText('.metric-title', '52W High', 'year_high');
    assignI18nByText('.metric-title', '52W Low', 'year_low');
    assignI18nByText('.metric-title', 'Avg Volume', 'avg_volume');
    assignI18nByText('.metric-title', 'Dividend', 'dividend');
    assignI18nByText('.metric-title', 'Beta', 'beta');
    assignI18nByText('.metric-title', 'EPS', 'eps');
    assignI18nByText('.metric-label', 'Buzz Score', 'buzz_score');
    assignI18nByText('.metric-label', 'Bullish Sentiment', 'bullish_sentiment');
    assignI18nByText('.metric-label', 'Sector Average', 'sector_average');
}

function changeLanguage(langCode) {
    if (!translations[langCode]) return;
    
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[langCode][key]) {
            if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) {
                el.placeholder = translations[langCode][key];
            } else {
                el.textContent = translations[langCode][key];
            }
        }
    });
    
    // Update selected language in dropdown
    const langText = document.querySelector('.language-text');
    if (langText) {
        langText.textContent = 
            langCode === 'en' ? 'English' : 
            langCode === 'es' ? 'Español' : 
            langCode === 'fr' ? 'Français' : 
            langCode === 'de' ? 'Deutsch' : 
            langCode === 'zh' ? '中文' : 'English';
    }
    
    // Store language preference
    localStorage.setItem('preferredLanguage', langCode);
}

// Tour guide functionality
let currentTourStep = 0;
const tourSteps = [
    {
        title: "Welcome to Market Pulse!",
        content: "I'll show you around our powerful stock analytics dashboard. Click Next to continue.",
        element: ".navbar-brand",
        position: "bottom"
    },
    {
        title: "Search for Stocks",
        content: "Enter a stock symbol like AAPL or MSFT here to view its data.",
        element: ".stock-search",
        position: "bottom"
    },
    {
        title: "Company Overview",
        content: "This section shows the company's basic information and current stock price.",
        element: ".overview-card",
        position: "bottom"
    },
    {
        title: "Price Charts",
        content: "View historical price data with interactive charts. You can change the time period and chart type.",
        element: ".chart-card",
        position: "left"
    },
    {
        title: "Sentiment Analysis",
        content: "See how the market feels about this stock compared to its sector.",
        element: ".sentiment-card",
        position: "right"
    },
    {
        title: "Key Metrics",
        content: "These metrics help you understand the stock's financial health at a glance.",
        element: ".metrics-card",
        position: "right"
    },
    {
        title: "Latest News",
        content: "Stay updated with the latest news about the company, with sentiment indicators.",
        element: ".news-card",
        position: "top"
    },
    {
        title: "That's it!",
        content: "You're ready to explore Market Pulse. Remember, I'm always here if you need help!",
        element: ".theme-toggle",
        position: "bottom"
    }
];

function initStoryMode() {
    console.log("Initializing story mode");
    
    // Ensure tour elements exist first
    createTourElements();
    
    // Check if first-time visitor
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    
    if (!hasVisited) {
        console.log("First-time visitor detected, showing tour prompt");
        // Show character after a short delay
        setTimeout(() => {
            const storyContainer = document.querySelector('.story-mode-container');
            if (storyContainer) {
                storyContainer.classList.add('active');
                console.log("Story mode container activated");
            } else {
                console.error("Story mode container not found");
            }
        }, 1500);
    } else {
        console.log("Returning visitor detected");
        // Add help button for returning visitors
        const navbar = document.querySelector('.navbar-nav');
        if (navbar && !document.getElementById('help-button')) {
            const helpLi = document.createElement('li');
            helpLi.className = 'nav-item';
            helpLi.innerHTML = `
                <a class="nav-link" href="#" id="help-button">
                    <i class="far fa-question-circle"></i> Help
                </a>
            `;
            navbar.appendChild(helpLi);
            
            // Add event listener to help button
            document.getElementById('help-button').addEventListener('click', function(e) {
                e.preventDefault();
                const storyContainer = document.querySelector('.story-mode-container');
                if (storyContainer) {
                    storyContainer.classList.add('active');
                }
            });
        }
    }
    
    // Set up tour button event listeners
    const startTourBtn = document.getElementById('start-tour-btn');
    if (startTourBtn) {
        startTourBtn.addEventListener('click', function() {
            console.log("Start tour button clicked");
            startTour();
        });
    } else {
        console.error("Start tour button not found");
    }
    
    const skipTourBtn = document.getElementById('skip-tour-btn');
    if (skipTourBtn) {
        skipTourBtn.addEventListener('click', function() {
            console.log("Skip tour button clicked");
            skipTour();
        });
    } else {
        console.error("Skip tour button not found");
    }
    
    // Set up tour navigation
    const tourNext = document.querySelector('.tour-next');
    if (tourNext) {
        tourNext.addEventListener('click', function() {
            console.log("Next tour step button clicked");
            nextTourStep();
        });
    } else {
        console.error("Tour next button not found");
    }
    
    const tourPrev = document.querySelector('.tour-prev');
    if (tourPrev) {
        tourPrev.addEventListener('click', function() {
            console.log("Previous tour step button clicked");
            prevTourStep();
        });
    } else {
        console.error("Tour prev button not found");
    }
}

function startTour() {
    console.log("Starting tour");
    
    // Hide story mode container
    const storyContainer = document.querySelector('.story-mode-container');
    if (storyContainer) {
        storyContainer.classList.remove('active');
    }
    
    // Reset to the first step
    currentTourStep = 0;
    
    // Show the first step
    showTourStep(currentTourStep);
    
    // Make tour overlay visible
    const tourOverlay = document.getElementById('tour-overlay');
    if (tourOverlay) {
        tourOverlay.classList.add('active');
        console.log("Tour overlay activated");
    } else {
        console.error("Tour overlay element not found");
        // Try to create it again and then activate
        createTourElements();
        setTimeout(() => {
            const newTourOverlay = document.getElementById('tour-overlay');
            if (newTourOverlay) {
                newTourOverlay.classList.add('active');
            }
        }, 100);
    }
}

function skipTour() {
    const storyContainer = document.querySelector('.story-mode-container');
    if (storyContainer) {
        storyContainer.classList.remove('active');
    }
    localStorage.setItem('hasVisitedBefore', 'true');
}

function showTourStep(stepIndex) {
    console.log("Showing tour step:", stepIndex);
    
    if (stepIndex < 0 || stepIndex >= tourSteps.length) {
        console.warn("Invalid tour step index:", stepIndex);
        return;
    }
    
    const step = tourSteps[stepIndex];
    const targetElement = document.querySelector(step.element);
    
    if (!targetElement) {
        console.error(`Tour target element not found: ${step.element}`);
        
        // Try to wait a bit if it's the first step - element might not be ready yet
        if (stepIndex === 0) {
            setTimeout(() => {
                const retryElement = document.querySelector(step.element);
                if (retryElement) {
                    showTourStep(stepIndex);
                } else {
                    // Skip to next step if element still not found
                    nextTourStep();
                }
            }, 1000);
        } else {
            // Skip to next step if element not found
            nextTourStep();
        }
        return;
    }
    
    // Get tour overlay elements
    const highlight = document.querySelector('.tour-highlight');
    const tooltip = document.querySelector('.tour-tooltip');
    
    if (!highlight || !tooltip) {
        console.error("Tour highlight or tooltip elements missing");
        // Try to recreate tour elements
        createTourElements();
        setTimeout(() => showTourStep(stepIndex), 100);
        return;
    }
    
    // Get element position
    const rect = targetElement.getBoundingClientRect();
    
    // Position highlight
    highlight.style.width = `${rect.width + 20}px`;
    highlight.style.height = `${rect.height + 20}px`;
    highlight.style.left = `${rect.left - 10}px`;
    highlight.style.top = `${rect.top - 10 + window.scrollY}px`;
    
    // Position tooltip
    const tooltipWidth = 300;
    let tooltipLeft, tooltipTop;
    
    switch (step.position) {
        case "top":
            tooltipLeft = rect.left + rect.width/2 - tooltipWidth/2;
            tooltipTop = rect.top - 150 + window.scrollY;
            break;
        case "bottom":
            tooltipLeft = rect.left + rect.width/2 - tooltipWidth/2;
            tooltipTop = rect.bottom + 20 + window.scrollY;
            break;
        case "left":
            tooltipLeft = rect.left - tooltipWidth - 20;
            tooltipTop = rect.top + rect.height/2 - 75 + window.scrollY;
            break;
        case "right":
            tooltipLeft = rect.right + 20;
            tooltipTop = rect.top + rect.height/2 - 75 + window.scrollY;
            break;
        default:
            tooltipLeft = rect.right + 20;
            tooltipTop = rect.top + window.scrollY;
    }
    
    // Keep tooltip within viewport
    tooltipLeft = Math.max(20, Math.min(window.innerWidth - tooltipWidth - 20, tooltipLeft));
    tooltipTop = Math.max(20, Math.min(window.innerHeight + window.scrollY - 200, tooltipTop));
    
    tooltip.style.left = `${tooltipLeft}px`;
    tooltip.style.top = `${tooltipTop}px`;
    
    // Update content
    const titleEl = document.querySelector('.tour-step-title');
    const contentEl = document.querySelector('.tour-step-content');
    
    if (titleEl) titleEl.textContent = step.title;
    if (contentEl) contentEl.textContent = step.content;
    
    // Update progress
    const currentStepEl = document.querySelector('.current-step');
    const totalStepsEl = document.querySelector('.total-steps');
    
    if (currentStepEl) currentStepEl.textContent = stepIndex + 1;
    if (totalStepsEl) totalStepsEl.textContent = tourSteps.length;
    
    // Manage nav buttons
    const prevBtn = document.querySelector('.tour-prev');
    const nextBtn = document.querySelector('.tour-next');
    
    if (prevBtn) prevBtn.style.visibility = stepIndex === 0 ? 'hidden' : 'visible';
    if (nextBtn) nextBtn.textContent = stepIndex === tourSteps.length - 1 ? 'Finish' : 'Next';
    
    // Scroll to element
    window.scrollTo({
        top: Math.max(0, rect.top + window.scrollY - 100),
        behavior: 'smooth'
    });
    
    console.log("Tour step shown successfully:", stepIndex);
}


function nextTourStep() {
    currentTourStep++;
    
    if (currentTourStep >= tourSteps.length) {
        // End of tour
        const tourOverlay = document.getElementById('tour-overlay');
        if (tourOverlay) {
            tourOverlay.classList.remove('active');
        }
        localStorage.setItem('hasVisitedBefore', 'true');
        return;
    }
    
    showTourStep(currentTourStep);
}

function prevTourStep() {
    currentTourStep--;
    if (currentTourStep >= 0) {
        showTourStep(currentTourStep);
    }
}

// Stock tips array
const stockTips = [
    "Dollar-cost averaging can help reduce the impact of volatility on your portfolio.",
    "Consider diversifying across different sectors to spread risk.",
    "Past performance is not indicative of future results.",
    "Long-term investors generally weather market volatility better than short-term traders.",
    "Compound interest has been called the eighth wonder of the world.",
    "The stock market has historically returned about 7% per year on average.",
    "Always do your own research before investing in any stock.",
    "A company's P/E ratio can help determine if it's overvalued or undervalued.",
    "High dividend yields aren't always better - check for dividend sustainability.",
    "Market timing is difficult - even for professionals.",
    "Consider setting stop-loss orders to limit potential losses.",
    "Free cash flow can be a better indicator of financial health than earnings.",
    "Warren Buffett advises to be fearful when others are greedy, and greedy when others are fearful.",
    "The Rule of 72: Divide 72 by the annual interest rate to estimate how many years it takes to double your money.",
];

// Show loading overlay with random tips
function showLoadingOverlay(active = true) {
    const overlays = document.querySelectorAll('.loading-overlay');
    
    overlays.forEach(overlay => {
        if (active) {
            // Show a random stock tip
            const tipElement = overlay.querySelector('#loading-tip-text');
            if (tipElement) {
                const randomTip = stockTips[Math.floor(Math.random() * stockTips.length)];
                tipElement.textContent = randomTip;
            }
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    });
}

// Voice navigation system
let recognition = null;
let synthesis = null;
let isListening = false;
let textToSpeechEnabled = false;
let currentFontSize = 1.0;

function initAccessibility() {
    const accessibilityToggle = document.getElementById('accessibility-toggle');
    if (!accessibilityToggle) return;
    
    // Setup accessibility panel toggle
    accessibilityToggle.addEventListener('click', function() {
        const panel = document.getElementById('accessibility-panel');
        if (panel) panel.classList.toggle('show');
    });
    
    // Voice navigation toggle
    const voiceToggle = document.getElementById('voice-navigation-toggle');
    if (voiceToggle) {
        voiceToggle.addEventListener('change', function() {
            if (this.checked) {
                startVoiceRecognition();
                showNotification("Voice navigation activated. Try saying 'search Apple' or 'show news'");
            } else {
                stopVoiceRecognition();
                showNotification("Voice navigation deactivated");
            }
        });
    }
    
    // Text-to-speech toggle
    const ttsToggle = document.getElementById('text-to-speech-toggle');
    if (ttsToggle) {
        ttsToggle.addEventListener('change', function() {
            textToSpeechEnabled = this.checked;
            if (this.checked) {
                synthesis = window.speechSynthesis;
                speak("Speech Toggle");
            } else {
                if (synthesis) {
                    synthesis.cancel();
                }
            }
        });
    }
    
    // Screen reader button
    const screenReaderBtn = document.getElementById('screen-reader-btn');
    if (screenReaderBtn) {
        screenReaderBtn.addEventListener('click', readPageContent);
    }
    
    // Colorblind mode selector
    const colorblindMode = document.getElementById('colorblind-mode');
    if (colorblindMode) {
        colorblindMode.addEventListener('change', function() {
            applyColorBlindMode(this.value);
        });
    }
    
    // Text size controls
    const textSmaller = document.getElementById('text-smaller');
    if (textSmaller) {
        textSmaller.addEventListener('click', function() {
            changeTextSize(-0.1);
        });
    }
    
    const textReset = document.getElementById('text-reset');
    if (textReset) {
        textReset.addEventListener('click', function() {
            resetTextSize();
        });
    }
    
    const textLarger = document.getElementById('text-larger');
    if (textLarger) {
        textLarger.addEventListener('click', function() {
            changeTextSize(0.1);
        });
    }
    
    // Add speech recognition to news items
    addSpeechToNews();
}

function startVoiceRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        showNotification("Speech recognition is not supported in your browser");
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    
    recognition.onstart = function() {
        isListening = true;
        showListeningIndicator(true);
    };
    
    recognition.onend = function() {
        isListening = false;
        showListeningIndicator(false);
        const voiceToggle = document.getElementById('voice-navigation-toggle');
        if (voiceToggle && voiceToggle.checked) {
            recognition.start();
        }
    };
    
    recognition.onresult = function(event) {
        let final_transcript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
            }
        }
        
        if (final_transcript.trim()) {
            processVoiceCommand(final_transcript.trim());
        }
    };
    
    recognition.onerror = function(event) {
        console.error('Speech recognition error', event.error);
        showNotification("Voice recognition error: " + event.error);
    };
    
    try {
        recognition.start();
    } catch(e) {
        console.error("Error starting speech recognition:", e);
    }
}

function stopVoiceRecognition() {
    if (recognition) {
        recognition.stop();
        isListening = false;
        showListeningIndicator(false);
    }
}

function processVoiceCommand(command) {
    command = command.toLowerCase();
    console.log("Voice command:", command);
    
    let response = "";
    
    // Search commands
    if (command.includes('search') || command.includes('look up') || command.includes('find')) {
        const tickerMatch = command.match(/search (\w+)|look up (\w+)|find (\w+)/i);
        if (tickerMatch) {
            const ticker = tickerMatch[1] || tickerMatch[2] || tickerMatch[3];
            document.getElementById('ticker-input').value = ticker;
            performSearch();
            response = `Searching for ${ticker}`;
        } else {
            response = "Please specify a stock to search for";
        }
    }
    // Navigation commands
    else if (command.includes('go to') || command.includes('show')) {
        if (command.includes('news')) {
            const newsLink = document.querySelector('a[href="#news-section"]');
            if (newsLink) newsLink.click();
            response = "Showing news section";
        } else if (command.includes('about')) {
            const aboutLink = document.querySelector('a[href="/about"]');
            if (aboutLink) aboutLink.click();
            response = "Going to About page";
        } else if (command.includes('dashboard') || command.includes('home')) {
            const homeLink = document.querySelector('a[href="/"]');
            if (homeLink) homeLink.click();
            response = "Going to dashboard";
        } else {
            response = "I'm not sure where you want to navigate to";
        }
    }
    // Theme commands
    else if (command.includes('dark mode') || command.includes('light mode')) {
        toggleTheme();
        response = "Theme changed";
    }
    // Chart commands
    else if (command.includes('chart') || command.includes('graph')) {
        if (command.includes('day') || command.includes('week')) {
            const weekBtn = document.querySelector('.time-range[data-range="7"]');
            if (weekBtn) weekBtn.click();
            response = "Showing 1 week chart";
        } else if (command.includes('month')) {
            const monthBtn = document.querySelector('.time-range[data-range="30"]');
            if (monthBtn) monthBtn.click();
            response = "Showing 1 month chart";
        } else if (command.includes('year')) {
            const yearBtn = document.querySelector('.time-range[data-range="365"]');
            if (yearBtn) yearBtn.click();
            response = "Showing 1 year chart";
        }
    }
    // Help command
    else if (command.includes('help') || command.includes('tour')) {
        const storyContainer = document.querySelector('.story-mode-container');
        if (storyContainer) storyContainer.classList.add('active');
        response = "Help is available. Would you like a tour?";
    }
    // Read news command
    else if (command.includes('read news')) {
        readNews();
        response = "Reading news articles";
    }
    // Unknown command
    else {
        response = "I didn't understand that command";
    }
    
    // Speak response if text-to-speech is enabled
    if (textToSpeechEnabled) {
        speak(response);
    }
    
    showNotification(response);
}

function showListeningIndicator(isActive) {
    let indicator = document.getElementById('voice-indicator');
    
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'voice-indicator';
        indicator.innerHTML = '<i class="fas fa-microphone"></i>';
        document.body.appendChild(indicator);
    }
    
    if (isActive) {
        indicator.classList.add('active');
    } else {
        indicator.classList.remove('active');
    }
}

function speak(text) {
    if (!('speechSynthesis' in window)) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    if (synthesis) {
        synthesis.cancel(); // Cancel any ongoing speech
        synthesis.speak(utterance);
    } else if (window.speechSynthesis) {
        window.speechSynthesis.cancel(); // Fallback if synthesis not set
        window.speechSynthesis.speak(utterance);
    }
}

function readPageContent() {
    if (!('speechSynthesis' in window)) {
        showNotification("Text-to-speech is not supported in your browser");
        return;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Collect important page content
    const stockName = document.getElementById('company-name');
    const stockPrice = document.getElementById('stock-price');
    const priceChange = document.getElementById('price-change');
    
    // Create text to read
    let textToRead = "Reading dashboard information. ";
    
    if (stockName && stockPrice && priceChange) {
        textToRead += `You are viewing data for ${stockName.textContent}. The current stock price is ${stockPrice.textContent}, which is ${priceChange.textContent} today.`;
    } else {
        textToRead += "Stock information is still loading.";
    }
    
    // Add sentiment information if available
    const bullishScore = document.getElementById('bullish-score');
    if (bullishScore) {
        textToRead += ` The market sentiment for this stock is ${bullishScore.textContent} bullish.`;
    }
    
    // Speak the text
    speak(textToRead);
    
    // Show notification
    showNotification("Reading page content...");
}

function readNews() {
    if (!('speechSynthesis' in window)) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Collect news headlines
    const newsItems = document.querySelectorAll('.news-item');
    if (newsItems.length === 0) {
        speak("No news items found");
        return;
    }
    
    let newsText = `Here are the latest news items for this stock. `;
    
    // Get the first 3 news items
    for (let i = 0; i < Math.min(3, newsItems.length); i++) {
        const title = newsItems[i].querySelector('.news-title');
        const source = newsItems[i].querySelector('.news-source');
        if (title && source) {
            newsText += `${i+1}. From ${source.textContent}: ${title.textContent}. `;
        }
    }
    
    speak(newsText);
}

function addSpeechToNews() {
    // Create and listen for custom event
    document.addEventListener('newsDisplayed', function() {
        const newsItems = document.querySelectorAll('.news-item');
        
        newsItems.forEach((item, index) => {
            // Check if this item already has a speech button
            if (!item.querySelector('.news-speech-btn')) {
                const newsContent = item.querySelector('.news-content');
                if (newsContent) {
                    const speechBtn = document.createElement('button');
                    speechBtn.className = 'news-speech-btn';
                    speechBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                    speechBtn.title = 'Read this news item';
                    speechBtn.setAttribute('aria-label', 'Read this news item');
                    
                    speechBtn.addEventListener('click', function() {
                        const title = item.querySelector('.news-title');
                        const source = item.querySelector('.news-source');
                        if (title && source) {
                            speak(`From ${source.textContent}: ${title.textContent}`);
                        }
                    });
                    
                    item.insertBefore(speechBtn, newsContent);
                }
            }
        });
    });
}

function applyColorBlindMode(mode) {
    const root = document.documentElement;
    const isDark = root.getAttribute('data-bs-theme') === 'dark';
    
    // Remove any existing filter
    document.body.style.filter = 'none';
    
    // Set appropriate filter for colorblind mode
    switch (mode) {
        case 'protanopia': // Red-blind
            document.body.style.filter = 'url(#protanopia-filter)';
            root.style.setProperty('--positive', isDark ? '#D4D160' : '#9D9D00');
            root.style.setProperty('--negative', isDark ? '#779ECB' : '#4D7BB7');
            root.style.setProperty('--highlight', isDark ? '#D4D160' : '#9D9D00');
            break;
        case 'deuteranopia': // Green-blind
            document.body.style.filter = 'url(#deuteranopia-filter)';
            root.style.setProperty('--positive', isDark ? '#E0C775' : '#D9BB62');
            root.style.setProperty('--negative', isDark ? '#7692F5' : '#445EBD');
            root.style.setProperty('--highlight', isDark ? '#E0C775' : '#D9BB62');
            break;
        case 'tritanopia': // Blue-blind
            document.body.style.filter = 'url(#tritanopia-filter)';
            root.style.setProperty('--positive', isDark ? '#F08080' : '#E06060');
            root.style.setProperty('--negative', isDark ? '#6ECBB5' : '#40A28A');
            root.style.setProperty('--highlight', isDark ? '#F08080' : '#E06060');
            break;
        case 'achromatopsia': // Full color blindness
            document.body.style.filter = 'grayscale(100%)';
            root.style.setProperty('--positive', isDark ? '#FFFFFF' : '#606060');
            root.style.setProperty('--negative', isDark ? '#505050' : '#A0A0A0');
            root.style.setProperty('--highlight', isDark ? '#FFFFFF' : '#606060');
            break;
        default: // Normal vision
            // Restore default colors
            root.style.setProperty('--positive', isDark ? '#10b981' : '#059669');
            root.style.setProperty('--negative', isDark ? '#ef4444' : '#dc2626');
            root.style.setProperty('--highlight', isDark ? '#3b82f6' : '#2563eb');
    }
}

function changeTextSize(delta) {
    currentFontSize = Math.max(0.8, Math.min(1.5, currentFontSize + delta));
    document.body.style.fontSize = `${currentFontSize}rem`;
}

function resetTextSize() {
    currentFontSize = 1.0;
    document.body.style.fontSize = `${currentFontSize}rem`;
}

function showNotification(message) {
    // Create notification if it doesn't exist
    let notification = document.getElementById('a11y-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'a11y-notification';
        document.body.appendChild(notification);
    }
    
    // Update message and show
    notification.textContent = message;
    notification.classList.add('show');
    
    // Hide after a delay
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Load news data from API
function loadNewsData(ticker) {
    console.log("Loading news data for:", ticker);
    fetch(`/api/company_news?ticker=${ticker}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayNews(data);
            
            // Dispatch custom event
            const newsEvent = new CustomEvent('newsDisplayed');
            document.dispatchEvent(newsEvent);
        })
        .catch(error => {
            console.error('Error fetching news data:', error);
        });
}

// Display news function
function displayNews(newsItems) {
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return;
    
    // Clear existing news
    newsContainer.innerHTML = '';
    
    // Display each news item
    if (newsItems && newsItems.length > 0) {
        newsItems.forEach(item => {
            // Format date
            const pubDate = new Date(item.publishedAt);
            const formattedDate = pubDate.toLocaleDateString() + ' ' + pubDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            // Create sentiment class
            const sentimentClass = item.sentiment_label || 'neutral';
            
            // Create news item element
            const newsItemEl = document.createElement('div');
            newsItemEl.className = `news-item ${sentimentClass}`;
            newsItemEl.innerHTML = `
                <div class="news-header">
                    <span class="news-source">${item.source}</span>
                    <span class="news-date">${formattedDate}</span>
                    <span class="news-sentiment-indicator ${sentimentClass}"></span>
                </div>
                <h3 class="news-title">
                    <a href="${item.url}" target="_blank">${item.title}</a>
                </h3>
                <div class="news-content">
                    <p>${item.description || 'Click to read more...'}</p>
                </div>
            `;
            
            newsContainer.appendChild(newsItemEl);
        });
    } else {
        // No news available
        newsContainer.innerHTML = `
            <div class="no-news">
                <i class="fas fa-newspaper"></i>
                <p>No recent news available for this stock</p>
            </div>
        `;
    }
}

// Function to filter news by sentiment
function filterNewsBySentiment(sentiment) {
    const newsItems = document.querySelectorAll('.news-item');
    
    newsItems.forEach(item => {
        if (sentiment === 'all') {
            item.style.display = 'block';
        } else {
            if (item.classList.contains(sentiment)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        }
    });
}

// Load sentiment data from API
function loadSentimentData(ticker) {
    console.log("Loading sentiment data for:", ticker);
    fetch(`/api/stock_sentiment?ticker=${ticker}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Update sentiment metrics
            const buzzScore = Math.round(data.buzz * 100);
            const bullishScore = Math.round(data.sentiment_score * 100);
            const sectorScore = Math.round(data.sector_sentiment * 100);
            
            const buzzScoreEl = document.getElementById('buzz-score');
            if (buzzScoreEl) buzzScoreEl.textContent = buzzScore;
            
            const bullishScoreEl = document.getElementById('bullish-score');
            if (bullishScoreEl) bullishScoreEl.textContent = `${bullishScore}%`;
            
            const sectorScoreEl = document.getElementById('sector-score');
            if (sectorScoreEl) sectorScoreEl.textContent = `${sectorScore}%`;
            
            // Update progress bars
            const buzzBar = document.getElementById('buzz-score-bar');
            const bullishBar = document.getElementById('bullish-score-bar');
            const sectorBar = document.getElementById('sector-score-bar');
            
            if (buzzBar) buzzBar.style.width = `${buzzScore}%`;
            if (bullishBar) bullishBar.style.width = `${bullishScore}%`;
            if (sectorBar) sectorBar.style.width = `${sectorScore}%`;
            
            // Update sentiment chart
            updateSentimentChart(bullishScore, sectorScore);
        })
        .catch(error => {
            console.error('Error fetching sentiment data:', error);
        });
}

// Update sentiment chart
function updateSentimentChart(bullishScore, sectorScore) {
    // Check if ApexCharts is available
    if (typeof ApexCharts === 'undefined') {
        console.error("ApexCharts is not loaded");
        return;
    }
    
    const chartEl = document.getElementById('sentiment-chart');
    if (!chartEl) return;
    
    // If chart already exists, destroy it first
    if (window.sentimentChart) {
        window.sentimentChart.destroy();
    }
    
    const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    
    const options = {
        series: [{
            name: 'Bullish',
            data: [bullishScore]
        }, {
            name: 'Sector Avg',
            data: [sectorScore]
        }],
        chart: {
            type: 'bar',
            height: 180,
            toolbar: {
                show: false
            },
            background: 'transparent',
            theme: {
                mode: isDark ? 'dark' : 'light'
            }
        },
        plotOptions: {
            bar: {
                horizontal: true,
                dataLabels: {
                    position: 'top',
                },
                barHeight: '80%',
                distributed: true
            },
        },
        colors: [
            bullishScore > 60 ? '#10b981' : 
            bullishScore > 40 ? '#3b82f6' : '#ef4444',
            '#6b7280'
        ],
        dataLabels: {
            enabled: true,
            formatter: function (val) {
                return val + "%";
            },
            offsetX: 20,
            style: {
                fontSize: '12px',
                colors: [isDark ? '#fff' : '#000']
            }
        },
        tooltip: {
            theme: isDark ? 'dark' : 'light',
        },
        xaxis: {
            categories: ['Sentiment'],
            max: 100,
            labels: {
                show: false
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            }
        },
        yaxis: {
            labels: {
                show: false
            }
        },
        grid: {
            show: false
        },
        legend: {
            position: 'top',
            horizontalAlign: 'left',
            labels: {
                colors: isDark ? '#fff' : '#000'
            }
        },
        title: {
            text: 'Market Sentiment',
            align: 'center',
            style: {
                fontSize: '14px',
                color: isDark ? '#ccc' : '#333'
            }
        }
    };
    
    try {
        window.sentimentChart = new ApexCharts(chartEl, options);
        window.sentimentChart.render();
    } catch (e) {
        console.error("Error rendering sentiment chart:", e);
    }
}

// Function to show error messages
function showError(message) {
    // Create toast notification
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toastContainer.style.zIndex = 11;
    
    const toastElement = document.createElement('div');
    toastElement.className = 'toast align-items-center text-bg-danger border-0';
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');
    
    toastElement.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-exclamation-circle me-2"></i> ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    toastContainer.appendChild(toastElement);
    document.body.appendChild(toastContainer);
    
    // Initialize and show toast if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 5000
        });
        toast.show();
        
        // Remove from DOM after hidden
        toastElement.addEventListener('hidden.bs.toast', function() {
            document.body.removeChild(toastContainer);
        });
    } else {
        // Fallback if Bootstrap is not available
        toastElement.style.display = 'block';
        setTimeout(() => {
            document.body.removeChild(toastContainer);
        }, 5000);
    }
}

// Add animated numbers effect to metrics
function animateNumbers() {
    document.querySelectorAll('.metric-value').forEach(element => {
        if (!element.dataset.animated) {
            const targetValue = element.textContent;
            
            // Skip if it doesn't contain numbers
            if (!/\d/.test(targetValue)) return;
            
            // Mark as animated to prevent re-animation
            element.dataset.animated = true;
            
            // Save original text for later
            element.dataset.target = targetValue;
            
            // Start from zero or a smaller value
            if (targetValue.includes('$')) {
                element.textContent = '$0';
            } else if (targetValue.includes('%')) {
                element.textContent = '0%';
            } else if (!isNaN(parseInt(targetValue))) {
                element.textContent = '0';
            }
            
            // Add class for animation
            element.classList.add('animating');
        }
    });
    
    // Animate each number
    document.querySelectorAll('.metric-value.animating').forEach(element => {
        const targetValue = element.dataset.target;
        
        // Extract number and format
        let number = 0;
        let prefix = '';
        let suffix = '';
        
        if (targetValue.includes('$')) {
            prefix = '$';
            number = parseFloat(targetValue.replace(/[$,]/g, ''));
        } else if (targetValue.includes('%')) {
            suffix = '%';
            number = parseFloat(targetValue);
        } else if (targetValue.includes('M')) {
            suffix = 'M';
            number = parseFloat(targetValue);
        } else if (targetValue.includes('B')) {
            suffix = 'B';
            number = parseFloat(targetValue);
        } else if (targetValue.includes('T')) {
            suffix = 'T';
            number = parseFloat(targetValue);
        } else {
            number = parseFloat(targetValue);
        }
        
        // Skip if NaN
        if (isNaN(number)) {
            element.textContent = targetValue;
            element.classList.remove('animating');
            return;
        }
        
        // Animate to target value
        let startValue = 0;
        let duration = 1500;
        let startTime = null;
        
        function animate(timestamp) {
            if (!startTime) startTime = timestamp;
            let progress = Math.min((timestamp - startTime) / duration, 1);
            let currentValue = startValue + progress * (number - startValue);
            
            // Format value based on prefix/suffix
            if (suffix === 'M' || suffix === 'B' || suffix === 'T') {
                element.textContent = prefix + currentValue.toFixed(1) + suffix;
            } else if (number % 1 === 0) {
                element.textContent = prefix + Math.floor(currentValue) + suffix;
            } else {
                element.textContent = prefix + currentValue.toFixed(2) + suffix;
            }
            
            if (progress < 1) {
                window.requestAnimationFrame(animate);
            } else {
                element.textContent = targetValue;
                element.classList.remove('animating');
            }
        }
        
        window.requestAnimationFrame(animate);
    });
}

// Run animation when data is loaded
document.addEventListener('dataLoaded', function() {
    setTimeout(animateNumbers, 500);
});

// Trigger initial animation
setTimeout(function() {
    // Create and dispatch custom event
    const event = new CustomEvent('dataLoaded');
    document.dispatchEvent(event);
}, 1000);

// Parallel mode
let parallelChartLeft = null;
let parallelChartRight = null;
let parallelData1 = null;
let parallelData2 = null;
let parallelTimeRange = 30; // Default: 1 month

function initParallelMode() {
    // Set up toggle button for parallel mode
    const parallelModeToggle = document.getElementById('parallel-mode-toggle');
    if (parallelModeToggle) {
        parallelModeToggle.addEventListener('click', function() {
            const container = document.getElementById('parallel-mode-container');
            if (container) {
                container.classList.add('active');
                initParallelCharts();
            }
        });
    }
    
    // Close button for parallel mode
    const closeParallelBtn = document.getElementById('close-parallel-mode');
    if (closeParallelBtn) {
        closeParallelBtn.addEventListener('click', function() {
            const container = document.getElementById('parallel-mode-container');
            if (container) {
                container.classList.remove('active');
            }
        });
    }
    
    // Search buttons
    const parallelSearch1 = document.getElementById('parallel-search-1');
    if (parallelSearch1) {
        parallelSearch1.addEventListener('click', function() {
            const ticker = document.getElementById('parallel-ticker-1').value;
            if (ticker) {
                loadParallelStock(1, ticker);
            }
        });
    }
    
    const parallelSearch2 = document.getElementById('parallel-search-2');
    if (parallelSearch2) {
        parallelSearch2.addEventListener('click', function() {
            const ticker = document.getElementById('parallel-ticker-2').value;
            if (ticker) {
                loadParallelStock(2, ticker);
            }
        });
    }
    
    // Enter key for search
    const parallelTicker1 = document.getElementById('parallel-ticker-1');
    if (parallelTicker1) {
        parallelTicker1.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                loadParallelStock(1, this.value);
            }
        });
    }
    
    const parallelTicker2 = document.getElementById('parallel-ticker-2');
    if (parallelTicker2) {
        parallelTicker2.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                loadParallelStock(2, this.value);
            }
        });
    }
    
    // Time period buttons
    document.querySelectorAll('.parallel-time').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.parallel-time').forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update time range and refresh charts
            parallelTimeRange = parseInt(this.dataset.range);
            updateParallelCharts();
        });
    });
}

// Initialize parallel charts
function initParallelCharts() {
    if (typeof ApexCharts === 'undefined') {
        console.error("ApexCharts is not loaded");
        return;
    }
    
    const chartOptions = {
        chart: {
            height: 300,
            type: 'line',
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800
            },
            toolbar: {
                show: false
            }
        },
        stroke: {
            width: 3,
            curve: 'smooth'
        },
        markers: {
            size: 0
        },
        tooltip: {
            theme: document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'dark' : 'light',
            x: {
                format: 'MMM dd, yyyy'
            },
            y: {
                formatter: function(value) {
                    return '$' + value.toFixed(2);
                }
            }
        },
        xaxis: {
            type: 'datetime'
        },
        yaxis: {
            labels: {
                formatter: function(value) {
                    return '$' + value.toFixed(0);
                }
            }
        }
    };
    
    // Initialize chart 1
    const chart1El = document.getElementById('parallel-chart-1');
    if (chart1El) {
        if (parallelChartLeft) {
            parallelChartLeft.destroy();
        }
        
        parallelChartLeft = new ApexCharts(
            chart1El,
            {
                ...chartOptions,
                colors: ['#3b82f6'],
                series: [{
                    name: 'Stock Price',
                    data: []
                }]
            }
        );
        parallelChartLeft.render();
    }
    
    // Initialize chart 2
    const chart2El = document.getElementById('parallel-chart-2');
    if (chart2El) {
        if (parallelChartRight) {
            parallelChartRight.destroy();
        }
        
        parallelChartRight = new ApexCharts(
            chart2El,
            {
                ...chartOptions,
                colors: ['#ef4444'],
                series: [{
                    name: 'Stock Price',
                    data: []
                }]
            }
        );
        parallelChartRight.render();
    }
}

// Load parallel stock data
function loadParallelStock(user, ticker) {
    if (!ticker) return;
    
    ticker = ticker.toUpperCase();
    
    // Show loading state
    const chartEl = document.getElementById(`parallel-chart-${user}`);
    if (chartEl) {
        chartEl.innerHTML = `
            <div class="parallel-loading">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
    }
    
    fetch(`/api/stock_data?ticker=${ticker}`)
        .then(response => response.json())
        .then(data => {
            if (user === 1) {
                parallelData1 = {
                    ticker: ticker,
                    data: data
                };
            } else {
                parallelData2 = {
                    ticker: ticker,
                    data: data
                };
            }
            
            // Get company info
            const companyInfo = getCompanyInfo(ticker);
            
            // Update stock info
            if (data.length > 0) {
                const latestData = data[data.length - 1];
                
                const nameEl = document.getElementById(`parallel-name-${user}`);
                if (nameEl) {
                    nameEl.textContent = `${companyInfo.name} (${ticker})`;
                }
                
                const priceEl = document.getElementById(`parallel-price-${user}`);
                if (priceEl) {
                    priceEl.textContent = `$${parseFloat(latestData.close).toFixed(2)}`;
                }
                
                // Calculate change
                if (data.length > 1) {
                    const previousData = data[data.length - 2];
                    const change = parseFloat(latestData.close) - parseFloat(previousData.close);
                    const percentChange = (change / parseFloat(previousData.close)) * 100;
                    
                    const changeElement = document.getElementById(`parallel-change-${user}`);
                    if (changeElement) {
                        changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${percentChange.toFixed(2)}%)`;
                        changeElement.className = change >= 0 ? 'parallel-change positive' : 'parallel-change negative';
                    }
                }
            }
            
            // Update charts with the new data
            updateParallelCharts();
        })
        .catch(error => {
            console.error(`Error loading parallel stock ${ticker}:`, error);
            const chartEl = document.getElementById(`parallel-chart-${user}`);
            if (chartEl) {
                chartEl.innerHTML = `
                    <div class="parallel-error">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Failed to load stock data</p>
                    </div>
                `;
            }
        });
}

// Update parallel charts
function updateParallelCharts() {
    // Update chart 1
    if (parallelData1 && parallelChartLeft) {
        updateParallelChart(parallelChartLeft, parallelData1, 1);
    }
    
    // Update chart 2
    if (parallelData2 && parallelChartRight) {
        updateParallelChart(parallelChartRight, parallelData2, 2);
    }
    
    // Compare performance if both stocks are loaded
    compareStocks();
}

// Update parallel chart
function updateParallelChart(chart, stockData, user) {
    if (!chart || !stockData || !stockData.data) return;
    
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - parallelTimeRange);
    
    // Filter data based on time range
    const filteredData = stockData.data.filter(d => {
        const dataDate = new Date(d.date);
        return dataDate >= startDate;
    });
    
    // Format for chart
    const chartData = filteredData.map(d => ({
        x: new Date(d.date).getTime(),
        y: parseFloat(d.close)
    }));
    
    // Update chart
    chart.updateSeries([{
        name: stockData.ticker,
        data: chartData
    }]);
}

// Compare stocks
function compareStocks() {
    if (!parallelData1 || !parallelData2) return;
    
    // Get first and last data points within the selected time range
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - parallelTimeRange);
    
    const filteredData1 = parallelData1.data.filter(d => {
        const dataDate = new Date(d.date);
        return dataDate >= startDate;
    });
    
    const filteredData2 = parallelData2.data.filter(d => {
        const dataDate = new Date(d.date);
        return dataDate >= startDate;
    });
    
    if (filteredData1.length < 2 || filteredData2.length < 2) return;
    
    // Calculate percentage change for both stocks
    const stock1Start = parseFloat(filteredData1[0].close);
    const stock1End = parseFloat(filteredData1[filteredData1.length - 1].close);
    const stock1Change = ((stock1End - stock1Start) / stock1Start) * 100;
    
    const stock2Start = parseFloat(filteredData2[0].close);
    const stock2End = parseFloat(filteredData2[filteredData2.length - 1].close);
    const stock2Change = ((stock2End - stock2Start) / stock2Start) * 100;
    
    // Determine winner
    const winnerElement = document.getElementById('parallel-winner');
    if (winnerElement) {
        if (stock1Change > stock2Change) {
            winnerElement.textContent = `${parallelData1.ticker} (+${stock1Change.toFixed(2)}%)`;
            winnerElement.className = 'winner-badge user1-winner';
        } else if (stock2Change > stock1Change) {
            winnerElement.textContent = `${parallelData2.ticker} (+${stock2Change.toFixed(2)}%)`;
            winnerElement.className = 'winner-badge user2-winner';
        } else {
            winnerElement.textContent = 'Tie';
            winnerElement.className = 'winner-badge tie';
        }
    }
}

// Get company info
function getCompanyInfo(ticker) {
    // Company mapping data
    const companyInfo = {
        'AAPL': {
            name: 'Apple Inc.',
            sector: 'Technology',
            exchange: 'NASDAQ'
        },
        'MSFT': {
            name: 'Microsoft Corporation',
            sector: 'Technology',
            exchange: 'NASDAQ'
        },
        'GOOGL': {
            name: 'Alphabet Inc.',
            sector: 'Technology',
            exchange: 'NASDAQ'
        },
        'AMZN': {
            name: 'Amazon.com, Inc.',
            sector: 'Consumer Cyclical',
            exchange: 'NASDAQ'
        },
        'META': {
            name: 'Meta Platforms, Inc.',
            sector: 'Technology',
            exchange: 'NASDAQ'
        },
        'TSLA': {
            name: 'Tesla, Inc.',
            sector: 'Automotive',
            exchange: 'NASDAQ'
        }
    };
    
    // Return company info or default
    return companyInfo[ticker] || {
        name: ticker,
        sector: 'Unknown',
        exchange: 'NYSE'
    };
}

// Initialize text-to-speech
function initTextToSpeech() {
    // Add TTS buttons to chart sections
    document.querySelectorAll('.card-header').forEach(header => {
        const ttsBtn = document.createElement('button');
        ttsBtn.className = 'btn-tts';
        ttsBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        ttsBtn.addEventListener('click', function() {
            const cardBody = header.nextElementSibling;
            const cardTitle = header.textContent.trim();
            let textToRead = `${cardTitle}. `;
            
            // Get appropriate content based on section
            if (cardTitle.includes('Price History')) {
                const ticker = document.getElementById('company-name');
                const price = document.getElementById('stock-price');
                const change = document.getElementById('price-change');
                if (ticker && price && change) {
                    textToRead += `Current price for ${ticker.textContent} is ${price.textContent}, ${change.textContent}.`;
                }
            } else if (cardTitle.includes('Sentiment')) {
                const bullish = document.getElementById('bullish-score');
                const sector = document.getElementById('sector-score');
                if (bullish && sector) {
                    textToRead += `Bullish sentiment is ${bullish.textContent}, compared to sector average of ${sector.textContent}.`;
                }
            } else if (cardTitle.includes('News')) {
                const newsItems = document.querySelectorAll('.news-item');
                if (newsItems.length > 0) {
                    textToRead += `Here are the top ${Math.min(3, newsItems.length)} news headlines. `;
                    for (let i = 0; i < Math.min(3, newsItems.length); i++) {
                        const title = newsItems[i].querySelector('.news-title');
                        const source = newsItems[i].querySelector('.news-source');
                        if (title && source) {
                            textToRead += `${title.textContent}. From ${source.textContent}. `;
                        }
                    }
                } else {
                    textToRead += "No recent news found.";
                }
            }
            
            speak(textToRead);
        });
        
        header.appendChild(ttsBtn);
    });
}

// Functions to be defined elsewhere
// These functions are referenced but not defined in the provided code
// Add empty implementations to prevent errors

function updateCompanyLogo(ticker) {
    console.log(`Updating company logo for ${ticker}`);
    // Implementation would go here
}

function updateCompanyInfo(ticker, data) {
    console.log(`Updating company info for ${ticker}`);
    // Implementation would go here
}

function initPriceChart(data) {
    console.log("Initializing price chart");
    // Implementation would go here
}

function updateChartTimeRange(days) {
    console.log(`Updating chart time range to ${days} days`);
    // Implementation would go here
}

function toggleChartType(type) {
    console.log(`Toggling chart type to ${type}`);
    // Implementation would go here
}