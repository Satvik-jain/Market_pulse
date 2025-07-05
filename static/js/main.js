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