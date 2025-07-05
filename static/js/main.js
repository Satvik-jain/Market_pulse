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
});


// Add to main.js
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
        document.querySelector('.navbar-brand span').style.color = isDark ? '#10b981' : '#059669';
    } else if (marketTheme === 'bear') {
        root.style.setProperty('--highlight', isDark ? '#ef4444' : '#dc2626');
        document.querySelector('.navbar-brand span').style.color = isDark ? '#ef4444' : '#dc2626';
    } else {
        root.style.setProperty('--highlight', isDark ? '#3b82f6' : '#2563eb');
        document.querySelector('.navbar-brand span').style.color = isDark ? '#3b82f6' : '#2563eb';
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

// Call this function when stock data is loaded
// Add to the end of loadStockData() function:


// Search function
// In main.js
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

// Load stock data from API
// Load stock data from API
function loadStockData(ticker) {
    console.log("Loading stock data for:", ticker);
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
                
                // Update company info
                updateCompanyInfo(ticker, data[data.length-1]);
                
                // Initialize price chart
                initPriceChart(data);
                
                // Set default time range to 90 days
                updateChartTimeRange(90);
                
                // Update theme based on performance - moved inside where data is available
                updateThemeBasedOnPerformance(data);
                
                // Hide loading overlay
                document.querySelectorAll('.loading-overlay').forEach(overlay => {
                    overlay.classList.remove('active');
                });
            } else {
                showError(`No data available for ${ticker}`);
            }
        })
        .catch(error => {
            console.error('Error fetching stock data:', error);
            showError('Failed to load stock data. Please try again.');
        });
}


// Add to main.js
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
    document.querySelector('.language-text').textContent = 
        langCode === 'en' ? 'English' : 
        langCode === 'es' ? 'Español' : 
        langCode === 'fr' ? 'Français' : 
        langCode === 'de' ? 'Deutsch' : 
        langCode === 'zh' ? '中文' : 'English';
    
    // Store language preference
    localStorage.setItem('preferredLanguage', langCode);
}

// Initialize language selectors
document.addEventListener('DOMContentLoaded', function() {
    // Add i18n attributes to elements
    addI18nAttributes();
    
    // Set up language selector
    const languageLinks = document.querySelectorAll('.dropdown-item[data-lang]');
    languageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const langCode = this.getAttribute('data-lang');
            changeLanguage(langCode);
        });
    });
    
    // Load preferred language
    const preferredLanguage = localStorage.getItem('preferredLanguage') || 'en';
    changeLanguage(preferredLanguage);
});

function addI18nAttributes() {
    // Navigation items
    document.querySelectorAll('.nav-link').forEach(el => {
        if (el.textContent.trim() === 'Dashboard') el.setAttribute('data-i18n', 'dashboard');
        if (el.textContent.trim() === 'News') el.setAttribute('data-i18n', 'news');
        if (el.textContent.trim() === 'About') el.setAttribute('data-i18n', 'about');
    });
    
    // Search placeholder
    const searchInput = document.getElementById('ticker-input');
    if (searchInput) {
        searchInput.setAttribute('data-i18n', 'search_placeholder');
    }
    
    // Headers
    document.querySelectorAll('.card-header h5').forEach(el => {
        if (el.textContent.includes('Price History')) el.setAttribute('data-i18n', 'price_history');
        if (el.textContent.includes('Sentiment Analysis')) el.setAttribute('data-i18n', 'sentiment_analysis');
        if (el.textContent.includes('Key Metrics')) el.setAttribute('data-i18n', 'key_metrics');
        if (el.textContent.includes('Latest News')) el.setAttribute('data-i18n', 'latest_news');
    });
    
    // Other elements - add more as needed
    const elementsToTranslate = [
        { selector: '.loading-tip h5', key: 'stock_tip' },
        { selector: '.metric-label:contains("Sector")', key: 'sector' },
        { selector: '.metric-label:contains("Exchange")', key: 'exchange' },
        { selector: '.metric-label:contains("Vol:")', key: 'volume' },
        { selector: '.metric-label:contains("P/E:")', key: 'pe_ratio' },
        { selector: '.metric-label:contains("Mkt Cap:")', key: 'market_cap' },
        { selector: '.metric-title:contains("52W High")', key: 'year_high' },
        { selector: '.metric-title:contains("52W Low")', key: 'year_low' },
        { selector: '.metric-title:contains("Avg Volume")', key: 'avg_volume' },
        { selector: '.metric-title:contains("Dividend")', key: 'dividend' },
        { selector: '.metric-title:contains("Beta")', key: 'beta' },
        { selector: '.metric-title:contains("EPS")', key: 'eps' },
        { selector: '.metric-label:contains("Buzz Score")', key: 'buzz_score' },
        { selector: '.metric-label:contains("Bullish Sentiment")', key: 'bullish_sentiment' },
        { selector: '.metric-label:contains("Sector Average")', key: 'sector_average' }
    ];
    
    elementsToTranslate.forEach(item => {
        const elements = document.querySelectorAll(item.selector);
        elements.forEach(el => {
            el.setAttribute('data-i18n', item.key);
        });
    });
}

// Add to main.js
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
    // Check if first-time visitor
    const hasVisited = localStorage.getItem('hasVisitedBefore');
    
    if (!hasVisited) {
        // Show character after a short delay
        setTimeout(() => {
            document.querySelector('.story-mode-container').classList.add('active');
        }, 1500);
        
        // Set up event listeners
        document.getElementById('start-tour-btn').addEventListener('click', startTour);
        document.getElementById('skip-tour-btn').addEventListener('click', skipTour);
    } else {
        // Add help button for returning visitors
        const navbar = document.querySelector('.navbar-nav');
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
            document.querySelector('.story-mode-container').classList.add('active');
        });
    }
    
    // Set up tour navigation
    document.querySelector('.tour-next').addEventListener('click', nextTourStep);
    document.querySelector('.tour-prev').addEventListener('click', prevTourStep);
}

function startTour() {
    document.querySelector('.story-mode-container').classList.remove('active');
    currentTourStep = 0;
    showTourStep(currentTourStep);
    document.getElementById('tour-overlay').classList.add('active');
}

function skipTour() {
    document.querySelector('.story-mode-container').classList.remove('active');
    localStorage.setItem('hasVisitedBefore', 'true');
}

function showTourStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= tourSteps.length) return;
    
    const step = tourSteps[stepIndex];
    const targetElement = document.querySelector(step.element);
    
    if (!targetElement) return;
    
    // Get element position
    const rect = targetElement.getBoundingClientRect();
    const highlight = document.querySelector('.tour-highlight');
    const tooltip = document.querySelector('.tour-tooltip');
    
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
    }
    
    // Keep tooltip within viewport
    tooltipLeft = Math.max(20, Math.min(window.innerWidth - tooltipWidth - 20, tooltipLeft));
    tooltipTop = Math.max(20, Math.min(window.innerHeight + window.scrollY - 200, tooltipTop));
    
    tooltip.style.left = `${tooltipLeft}px`;
    tooltip.style.top = `${tooltipTop}px`;
    
    // Update content
    document.querySelector('.tour-step-title').textContent = step.title;
    document.querySelector('.tour-step-content').textContent = step.content;
    
    // Update progress
    document.querySelector('.current-step').textContent = stepIndex + 1;
    document.querySelector('.total-steps').textContent = tourSteps.length;
    
    // Manage nav buttons
    document.querySelector('.tour-prev').style.visibility = stepIndex === 0 ? 'hidden' : 'visible';
    document.querySelector('.tour-next').textContent = stepIndex === tourSteps.length - 1 ? 'Finish' : 'Next';
    
    // Scroll to element
    window.scrollTo({
        top: Math.max(0, rect.top + window.scrollY - 100),
        behavior: 'smooth'
    });
}

function nextTourStep() {
    currentTourStep++;
    
    if (currentTourStep >= tourSteps.length) {
        // End of tour
        document.getElementById('tour-overlay').classList.remove('active');
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

// Call this in document ready
document.addEventListener('DOMContentLoaded', function() {
    // Other initializations...
    initStoryMode();
});

// In main.js - Add this array of tips
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

// Modify the loading overlay activation
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


// Add to main.js
// Voice navigation system
let recognition = null;
let synthesis = null;
let isListening = false;
let textToSpeechEnabled = false;
let currentFontSize = 1.0;

function initAccessibility() {
    // Setup accessibility panel toggle
    document.getElementById('accessibility-toggle').addEventListener('click', function() {
        const panel = document.getElementById('accessibility-panel');
        panel.classList.toggle('show');
    });
    
    // Voice navigation toggle
    document.getElementById('voice-navigation-toggle').addEventListener('change', function() {
        if (this.checked) {
            startVoiceRecognition();
            showNotification("Voice navigation activated. Try saying 'search Apple' or 'show news'");
        } else {
            stopVoiceRecognition();
            showNotification("Voice navigation deactivated");
        }
    });
    
    // Text-to-speech toggle
    document.getElementById('text-to-speech-toggle').addEventListener('change', function() {
        textToSpeechEnabled = this.checked;
        if (this.checked) {
            synthesis = window.speechSynthesis;
            speak("Text to speech enabled");
        } else {
            if (synthesis) {
                synthesis.cancel();
            }
        }
    });
    
    // Screen reader button
    document.getElementById('screen-reader-btn').addEventListener('click', readPageContent);
    
    // Colorblind mode selector
    document.getElementById('colorblind-mode').addEventListener('change', function() {
        applyColorBlindMode(this.value);
    });
    
    // Text size controls
    document.getElementById('text-smaller').addEventListener('click', function() {
        changeTextSize(-0.1);
    });
    
    document.getElementById('text-reset').addEventListener('click', function() {
        resetTextSize();
    });
    
    document.getElementById('text-larger').addEventListener('click', function() {
        changeTextSize(0.1);
    });
    
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
        if (document.getElementById('voice-navigation-toggle').checked) {
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
            document.querySelector('a[href="#news-section"]').click();
            response = "Showing news section";
        } else if (command.includes('about')) {
            document.querySelector('a[href="/about"]').click();
            response = "Going to About page";
        } else if (command.includes('dashboard') || command.includes('home')) {
            document.querySelector('a[href="/"]').click();
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
            document.querySelector('.time-range[data-range="7"]').click();
            response = "Showing 1 week chart";
        } else if (command.includes('month')) {
            document.querySelector('.time-range[data-range="30"]').click();
            response = "Showing 1 month chart";
        } else if (command.includes('year')) {
            document.querySelector('.time-range[data-range="365"]').click();
            response = "Showing 1 year chart";
        }
    }
    // Help command
    else if (command.includes('help') || command.includes('tour')) {
        document.querySelector('.story-mode-container').classList.add('active');
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
        synthesis.speak(utterance);
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
    const stockName = document.getElementById('company-name').textContent;
    const stockPrice = document.getElementById('stock-price').textContent;
    const priceChange = document.getElementById('price-change').textContent;
    
    // Create text to read
    let textToRead = `You are viewing data for ${stockName}. The current stock price is ${stockPrice}, which is ${priceChange} today.`;
    
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
        const title = newsItems[i].querySelector('.news-title').textContent;
        const source = newsItems[i].querySelector('.news-source').textContent;
        newsText += `${i+1}. From ${source}: ${title}. `;
    }
    
    speak(newsText);
}

function addSpeechToNews() {
    // Add text-to-speech buttons to news items
    document.addEventListener('newsDisplayed', function() {
        const newsItems = document.querySelectorAll('.news-item');
        
        newsItems.forEach((item, index) => {
            // Check if this item already has a speech button
            if (!item.querySelector('.news-speech-btn')) {
                const newsContent = item.querySelector('.news-content');
                const speechBtn = document.createElement('button');
                speechBtn.className = 'news-speech-btn';
                speechBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
                speechBtn.title = 'Read this news item';
                speechBtn.setAttribute('aria-label', 'Read this news item');
                
                speechBtn.addEventListener('click', function() {
                    const title = item.querySelector('.news-title').textContent;
                    const source = item.querySelector('.news-source').textContent;
                    speak(`From ${source}: ${title}`);
                });
                
                item.insertBefore(speechBtn, newsContent);
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
    
    // Add SVG filters for color blindness if they don't exist
    addColorBlindnessFilters();
}

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

// Initialize accessibility features when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Other initializations...
    initAccessibility();
});

// Create and dispatch custom event when news is displayed
function displayNews(newsItems) {
    // Existing news display code...
    
    // Dispatch custom event
    const newsEvent = new CustomEvent('newsDisplayed');
    document.dispatchEvent(newsEvent);
}
// Update CSS for loading overlay

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
        })
        .catch(error => {
            console.error('Error fetching news data:', error);
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
            
            document.getElementById('buzz-score').textContent = buzzScore;
            document.getElementById('bullish-score').textContent = `${bullishScore}%`;
            document.getElementById('sector-score').textContent = `${sectorScore}%`;
            
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
    
    // Initialize and show toast
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 5000
    });
    toast.show();
    
    // Remove from DOM after hidden
    toastElement.addEventListener('hidden.bs.toast', function() {
        document.body.removeChild(toastContainer);
    });
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


// Parallel interaction mode
let parallelChartLeft;
let parallelChartRight;

// Initialize parallel mode
document.getElementById('enable-parallel').addEventListener('click', function() {
    document.getElementById('parallel-mode').classList.add('active');
    initParallelMode();
});

document.getElementById('close-parallel').addEventListener('click', function() {
    document.getElementById('parallel-mode').classList.remove('active');
});

function initParallelMode() {
    // Initialize left side
    document.getElementById('search-left').addEventListener('click', function() {
        const ticker = document.getElementById('ticker-left').value.trim().toUpperCase();
        if (ticker) {
            loadParallelStockData(ticker, 'left');
        }
    });
    
    document.getElementById('ticker-left').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            document.getElementById('search-left').click();
        }
    });
    
    // Initialize right side
    document.getElementById('search-right').addEventListener('click', function() {
        const ticker = document.getElementById('ticker-right').value.trim().toUpperCase();
        if (ticker) {
            loadParallelStockData(ticker, 'right');
        }
    });
    
    document.getElementById('ticker-right').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            document.getElementById('search-right').click();
        }
    });
    
    // Load default tickers
    document.getElementById('ticker-left').value = 'AAPL';
    document.getElementById('ticker-right').value = 'MSFT';
    
    document.getElementById('search-left').click();
    document.getElementById('search-right').click();
}

function loadParallelStockData(ticker, side) {
    fetch(`/api/stock_data?ticker=${ticker}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                updateParallelChart(data, side);
                
                // Get sentiment data
                fetch(`/api/stock_sentiment?ticker=${ticker}`)
                    .then(response => response.json())
                    .then(sentimentData => {
                        updateParallelSentiment(sentimentData, side, ticker);
                    })
                    .catch(error => {
                        console.error(`Error fetching sentiment data for ${side}:`, error);
                    });
            }
        })
        .catch(error => {
            console.error(`Error fetching stock data for ${side}:`, error);
        });
}

function updateParallelChart(data, side) {
    const chartElement = document.getElementById(`chart-${side}`);
    const priceElement = document.getElementById(`price-${side}`);
    const changeElement = document.getElementById(`change-${side}`);
    
    // Calculate price and change
    const latestData = data[data.length - 1];
    const previousData = data[data.length - 2];
    
    const price = parseFloat(latestData.close).toFixed(2);
    priceElement.textContent = `$${price}`;
    
    // Calculate change
    if (previousData) {
        const change = parseFloat(latestData.close) - parseFloat(previousData.close);
        const percentChange = (change / parseFloat(previousData.close) * 100).toFixed(2);
        
        changeElement.textContent = `${change >= 0 ? '+' : ''}${percentChange}%`;
        changeElement.className = `metric-value ${change >= 0 ? 'positive' : 'negative'}`;
    }
    
    // Format chart data - last 30 days
    const chartData = data.slice(-30).map(d => ({
        x: new Date(d.date).getTime(),
        y: parseFloat(d.close)
    }));
    
    const options = {
        chart: {
            type: 'area',
            height: 200,
            toolbar: {
                show: false
            },
            animations: {
                enabled: true
            }
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        series: [{
            name: 'Price',
            data: chartData
        }],
        colors: [side === 'left' ? '#3b82f6' : '#ef4444'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.2,
                stops: [0, 90, 100]
            }
        },
        xaxis: {
            type: 'datetime',
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
                style: {
                    fontFamily: 'Roboto Mono, monospace',
                    fontSize: '10px'
                },
                formatter: function(val) {
                    return '$' + val.toFixed(0);
                }
            }
        },
        grid: {
            show: false
        },
        tooltip: {
            x: {
                format: 'MMM dd'
            }
        },
        dataLabels: {
            enabled: false
        }
    };
    
    if (side === 'left') {
        if (parallelChartLeft) {
            parallelChartLeft.destroy();
        }
        parallelChartLeft = new ApexCharts(chartElement, options);
        parallelChartLeft.render();
    } else {
        if (parallelChartRight) {
            parallelChartRight.destroy();
        }
        parallelChartRight = new ApexCharts(chartElement, options);
        parallelChartRight.render();
    }
}

function updateParallelSentiment(data, side, ticker) {
    const sentimentElement = document.getElementById(`sentiment-${side}`);
    const sentimentScore = Math.round(data.sentiment_score * 100);
    sentimentElement.textContent = `${sentimentScore}%`;
    
    // Update winner section if both sides have data
    const otherSide = side === 'left' ? 'right' : 'left';
    const otherSentimentElement = document.getElementById(`sentiment-${otherSide}`);
    const otherPriceElement = document.getElementById(`price-${otherSide}`);
    const priceElement = document.getElementById(`price-${side}`);
    const changeElement = document.getElementById(`change-${side}`);
    const otherChangeElement = document.getElementById(`change-${otherSide}`);
    
    if (otherSentimentElement.textContent !== '0%' && 
        otherPriceElement.textContent !== '$0.00' && 
        priceElement.textContent !== '$0.00') {
        
        determineWinner();
    }
}

function determineWinner() {
    const leftChange = parseFloat(document.getElementById('change-left').textContent);
    const rightChange = parseFloat(document.getElementById('change-right').textContent);
    const leftSentiment = parseFloat(document.getElementById('sentiment-left').textContent);
    const rightSentiment = parseFloat(document.getElementById('sentiment-right').textContent);
    
    const leftTicker = document.getElementById('ticker-left').value;
    const rightTicker = document.getElementById('ticker-right').value;
    
    let winner;
    let reason;
    
    // Simple scoring system
    const leftScore = leftChange + leftSentiment * 0.5;
    const rightScore = rightChange + rightSentiment * 0.5;
    
    if (leftScore > rightScore) {
        winner = leftTicker;
        reason = leftChange > rightChange ? 
            `Better price performance (+${leftChange}% vs ${rightChange}%)` : 
            `Stronger market sentiment (${leftSentiment}% vs ${rightSentiment}%)`;
    } else if (rightScore > leftScore) {
        winner = rightTicker;
        reason = rightChange > leftChange ? 
            `Better price performance (+${rightChange}% vs ${leftChange}%)` : 
            `Stronger market sentiment (${rightSentiment}% vs ${leftSentiment}%)`;
    } else {
        winner = "Tie";
        reason = "Both stocks are performing equally";
    }
    
    document.getElementById('winner-ticker').textContent = winner;
    document.getElementById('winner-reason').textContent = reason;
    
    // Highlight winner
    document.querySelector('.left-side').classList.remove('winner');
    document.querySelector('.right-side').classList.remove('winner');
    
    if (winner === leftTicker) {
        document.querySelector('.left-side').classList.add('winner');
    } else if (winner === rightTicker) {
        document.querySelector('.right-side').classList.add('winner');
    }
}
// Add to main.js
// Parallel Interaction Mode
let parallelChart1 = null;
let parallelChart2 = null;
let parallelData1 = null;
let parallelData2 = null;
let parallelTimeRange = 30; // Default: 1 month

function initParallelMode() {
    // Set up toggle button
    document.getElementById('parallel-mode-toggle').addEventListener('click', function() {
        document.getElementById('parallel-mode-container').classList.add('active');
        initParallelCharts();
    });
    
    // Close button
    document.getElementById('close-parallel-mode').addEventListener('click', function() {
        document.getElementById('parallel-mode-container').classList.remove('active');
    });
    
    // Search buttons
    document.getElementById('parallel-search-1').addEventListener('click', function() {
        loadParallelStock(1, document.getElementById('parallel-ticker-1').value);
    });
    
    document.getElementById('parallel-search-2').addEventListener('click', function() {
        loadParallelStock(2, document.getElementById('parallel-ticker-2').value);
    });
    
    // Enter key for search
    document.getElementById('parallel-ticker-1').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            loadParallelStock(1, this.value);
        }
    });
    
    document.getElementById('parallel-ticker-2').addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            loadParallelStock(2, this.value);
        }
    });
    
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

function initParallelCharts() {
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
    if (parallelChart1) {
        parallelChart1.destroy();
    }
    
    parallelChart1 = new ApexCharts(
        document.getElementById('parallel-chart-1'),
        {
            ...chartOptions,
            colors: ['#3b82f6'],
            series: [{
                name: 'Stock Price',
                data: []
            }]
        }
    );
    parallelChart1.render();
    
    // Initialize chart 2
    if (parallelChart2) {
        parallelChart2.destroy();
    }
    
    parallelChart2 = new ApexCharts(
        document.getElementById('parallel-chart-2'),
        {
            ...chartOptions,
            colors: ['#ef4444'],
            series: [{
                name: 'Stock Price',
                data: []
            }]
        }
    );
    parallelChart2.render();
}

function loadParallelStock(user, ticker) {
    if (!ticker) return;
    
    ticker = ticker.toUpperCase();
    
    // Show loading state
    document.getElementById(`parallel-chart-${user}`).innerHTML = `
        <div class="parallel-loading">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    `;
    
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
                
                document.getElementById(`parallel-name-${user}`).textContent = `${companyInfo.name} (${ticker})`;
                document.getElementById(`parallel-price-${user}`).textContent = `$${parseFloat(latestData.close).toFixed(2)}`;
                
                // Calculate change
                if (data.length > 1) {
                    const previousData = data[data.length - 2];
                    const change = parseFloat(latestData.close) - parseFloat(previousData.close);
                    const percentChange = (change / parseFloat(previousData.close)) * 100;
                    
                    const changeElement = document.getElementById(`parallel-change-${user}`);
                    changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${percentChange.toFixed(2)}%)`;
                    changeElement.className = change >= 0 ? 'parallel-change positive' : 'parallel-change negative';
                }
            }
            
            // Update charts with the new data
            updateParallelCharts();
        })
        .catch(error => {
            console.error(`Error loading parallel stock ${ticker}:`, error);
            document.getElementById(`parallel-chart-${user}`).innerHTML = `
                <div class="parallel-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Failed to load stock data</p>
                </div>
            `;
        });
}

function updateParallelCharts() {
    // Update chart 1
    if (parallelData1 && parallelChart1) {
        updateParallelChart(parallelChart1, parallelData1, 1);
    }
    
    // Update chart 2
    if (parallelData2 && parallelChart2) {
        updateParallelChart(parallelChart2, parallelData2, 2);
    }
    
    // Compare performance if both stocks are loaded
    compareStocks();
}

function updateParallelChart(chart, stockData, user) {
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

// Initialize parallel mode when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Other initializations...
    initParallelMode();
});

// Text to speech functionality
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
                const ticker = document.getElementById('company-name').textContent;
                const price = document.getElementById('stock-price').textContent;
                const change = document.getElementById('price-change').textContent;
                textToRead += `Current price for ${ticker} is ${price}, ${change}.`;
            } else if (cardTitle.includes('Sentiment')) {
                const bullish = document.getElementById('bullish-score').textContent;
                const sector = document.getElementById('sector-score').textContent;
                textToRead += `Bullish sentiment is ${bullish}, compared to sector average of ${sector}.`;
            } else if (cardTitle.includes('News')) {
                const newsItems = document.querySelectorAll('.news-item');
                if (newsItems.length > 0) {
                    textToRead += `Here are the top ${Math.min(3, newsItems.length)} news headlines. `;
                    for (let i = 0; i < Math.min(3, newsItems.length); i++) {
                        const title = newsItems[i].querySelector('.news-title').textContent;
                        const source = newsItems[i].querySelector('.news-source').textContent;
                        textToRead += `${title}. From ${source}. `;
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

// Read news aloud function
function readNewsAloud(newsItem) {
    const title = newsItem.querySelector('.news-title').textContent;
    const source = newsItem.querySelector('.news-source').textContent;
    const text = `${title}. From ${source}.`;
    speak(text);
}

// Initialize TTS
document.addEventListener('DOMContentLoaded', function() {
    initTextToSpeech();
});