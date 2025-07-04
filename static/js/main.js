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

// Search function
function performSearch() {
    const ticker = document.getElementById('ticker-input').value.trim().toUpperCase();
    if (ticker) {
        // Show loading indicators
        document.querySelectorAll('.loading-overlay').forEach(overlay => {
            overlay.classList.add('active');
        });
        
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