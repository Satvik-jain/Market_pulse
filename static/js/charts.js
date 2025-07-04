// static/js/charts.js
// Global variables
window.priceChart = null;
window.sentimentChart = null;
window.candleChart = null;
window.stockData = [];
window.chartType = 'line';

// Initialize price chart with ApexCharts
function initPriceChart(stockData) {
    // Store the full dataset globally
    window.stockData = stockData;
    
    const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const textColor = isDark ? '#d1d5db' : '#6c757d';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const tooltipTheme = isDark ? 'dark' : 'light';
    
    // Line chart options
    const options = {
        chart: {
            type: 'area',
            height: 400,
            fontFamily: 'Poppins, sans-serif',
            toolbar: {
                show: true,
                tools: {
                    download: false,
                    selection: true,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: true,
                }
            },
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'smooth',
            width: 2
        },
        series: [{
            name: 'Price',
            data: []  // Will be populated in updateChartTimeRange
        }],
        colors: ['#3b82f6'],
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.2,
                stops: [0, 90, 100]
            }
        },
        grid: {
            borderColor: gridColor,
            strokeDashArray: 4,
        },
        markers: {
            size: 0,
            hover: {
                size: 6,
                sizeOffset: 3
            }
        },
        xaxis: {
            type: 'datetime',
            labels: {
                style: {
                    colors: textColor,
                    fontFamily: 'Poppins, sans-serif',
                }
            },
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: textColor,
                    fontFamily: 'Poppins, sans-serif',
                },
                formatter: function (value) {
                    return '$' + value.toFixed(2);
                }
            }
        },
        tooltip: {
            theme: tooltipTheme,
            x: {
                format: 'MMM dd, yyyy'
            },
            y: {
                formatter: function (value) {
                    return '$' + value.toFixed(2);
                }
            }
        },
        theme: {
            mode: isDark ? 'dark' : 'light'
        }
    };
    
    // Create candle chart options (similar settings but different chart type)
    const candleOptions = {
        ...options,
        chart: {
            ...options.chart,
            type: 'candlestick',
        },
        stroke: {
            width: 1
        },
        series: [{
            data: [] // Will be populated with OHLC data
        }],
        fill: {
            opacity: 1,
        },
        plotOptions: {
            candlestick: {
                colors: {
                    upward: '#10b981',
                    downward: '#ef4444'
                }
            }
        },
        xaxis: {
            ...options.xaxis,
        },
        yaxis: {
            ...options.yaxis,
            tooltip: {
                enabled: true
            }
        }
    };

    // Initialize ApexCharts
    try {
        // If charts already exist, destroy them
        if (window.priceChart) {
            window.priceChart.destroy();
        }
        if (window.candleChart) {
            window.candleChart.destroy();
        }
        
        // Create new charts
        if (typeof ApexCharts !== 'undefined') {
            window.priceChart = new ApexCharts(document.getElementById('price-chart'), options);
            window.priceChart.render();
            
            // Create but don't render candlestick chart yet
            window.candleChart = new ApexCharts(document.getElementById('price-chart'), candleOptions);
        } else {
            // Fallback to basic chart if ApexCharts is not available
            console.error("ApexCharts not loaded, using fallback");
            fallbackChartInit();
        }
        
        console.log("Chart initialized successfully");
    } catch (error) {
        console.error("Error initializing chart:", error);
        fallbackChartInit();
    }
}

// Fallback chart if ApexCharts fails
function fallbackChartInit() {
    const chartElement = document.getElementById('price-chart');
    if (chartElement) {
        chartElement.innerHTML = `
            <div style="height:100%; display:flex; align-items:center; justify-content:center; flex-direction:column;">
                <div style="font-size:24px; margin-bottom:10px;">📈</div>
                <div style="font-weight:bold;">Stock Price Chart</div>
                <div style="color:#6c757d; margin-top:5px;">Loading chart data...</div>
            </div>
        `;
    }
}

// Update chart with selected time range
function updateChartTimeRange(days) {
    if (!window.stockData || window.stockData.length === 0) {
        return;
    }
    
    try {
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - days);
        
        // Filter data for the selected time range
        const filteredData = window.stockData.filter(d => {
            const dataDate = new Date(d.date);
            return dataDate >= startDate;
        });
        
        // Format data based on chart type
        if (window.chartType === 'line' && window.priceChart) {
            // Format data for line chart
            const chartData = filteredData.map(d => ({
                x: new Date(d.date).getTime(),
                y: parseFloat(d.close)
            }));
            
            window.priceChart.updateSeries([{
                data: chartData
            }]);
            
            console.log("Chart updated with filtered data:", filteredData.length, "points");
        } else if (window.chartType === 'candle' && window.candleChart) {
            // Update candlestick data
            updateCandleChartData(days);
        }
    } catch (error) {
        console.error("Error updating chart:", error);
    }
}

// Update candlestick chart data
function updateCandleChartData(days) {
    if (!window.stockData || window.stockData.length === 0 || !window.candleChart) {
        return;
    }
    
    try {
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - days);
        
        // Filter data for the selected time range
        const filteredData = window.stockData.filter(d => {
            const dataDate = new Date(d.date);
            return dataDate >= startDate;
        });
        
        // Format data for candlestick chart
        const candleData = filteredData.map(d => ({
            x: new Date(d.date).getTime(),
            y: [
                parseFloat(d.open), 
                parseFloat(d.high), 
                parseFloat(d.low), 
                parseFloat(d.close)
            ]
        }));
        
        window.candleChart.updateSeries([{
            data: candleData
        }]);
        
        console.log("Candle chart updated with filtered data:", filteredData.length, "points");
    } catch (error) {
        console.error("Error updating candle chart:", error);
    }
}

// Toggle between line and candlestick charts
function toggleChartType(type) {
    if (type === window.chartType) return;
    
    try {
        window.chartType = type;
        // Hide current chart
        document.querySelector('.loading-overlay').classList.add('active');
        
        setTimeout(() => {
            if (type === 'line') {
                // Switch to line chart
                if (window.candleChart) window.candleChart.destroy();
                if (window.priceChart) {
                    window.priceChart.render();
                    updateChartTimeRange(parseInt(document.querySelector('.time-range.active').dataset.range || '90'));
                }
            } else {
                // Switch to candlestick chart
                if (window.priceChart) window.priceChart.destroy();
                if (window.candleChart) {
                    window.candleChart.render();
                    updateCandleChartData(parseInt(document.querySelector('.time-range.active').dataset.range || '90'));
                }
            }
            
            // Remove loading overlay
            const overlay = document.querySelector('.loading-overlay');
            if (overlay) overlay.classList.remove('active');
            
            console.log("Chart type changed to:", type);
        }, 300);
    } catch (error) {
        console.error("Error toggling chart type:", error);
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) overlay.classList.remove('active');
    }
}

// Update chart theme based on current theme
function updateChartTheme(chart) {
    if (!chart) return;
    
    try {
        const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        
        const textColor = isDark ? '#d1d5db' : '#6c757d';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        
        chart.updateOptions({
            theme: {
                mode: isDark ? 'dark' : 'light',
            },
            grid: {
                borderColor: gridColor,
            },
            xaxis: {
                labels: {
                    style: {
                        colors: textColor,
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: textColor,
                    }
                }
            },
            tooltip: {
                theme: isDark ? 'dark' : 'light',
            }
        });
        
        console.log("Chart theme updated to:", isDark ? 'dark' : 'light');
    } catch (error) {
        console.error("Error updating chart theme:", error);
    }
}

// Update sentiment chart with visual enhancements
function updateSentimentChart(bullishSentiment, sectorSentiment) {
    try {
        const sentimentChartElement = document.getElementById('sentiment-chart');
        if (!sentimentChartElement) return;
        
        const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        const textColor = isDark ? '#d1d5db' : '#6c757d';
        const tooltipTheme = isDark ? 'dark' : 'light';
        
        const options = {
            chart: {
                type: 'bar',
                height: 200,
                fontFamily: 'Poppins, sans-serif',
                toolbar: {
                    show: false
                },
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800,
                    dynamicAnimation: {
                        enabled: true,
                        speed: 350
                    }
                }
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    borderRadius: 6,
                    columnWidth: '70%',
                    distributed: true,
                    dataLabels: {
                        position: 'top'
                    }
                }
            },
            colors: ['#3b82f6', '#8b5cf6'],
            dataLabels: {
                enabled: true,
                formatter: function(val) {
                    return val + '%';
                },
                offsetX: 30,
                style: {
                    fontSize: '12px',
                    colors: [textColor]
                }
            },
            stroke: {
                width: 0
            },
            grid: {
                show: false
            },
            series: [{
                name: 'Sentiment',
                data: [
                    {
                        x: 'Stock',
                        y: bullishSentiment
                    },
                    {
                        x: 'Sector',
                        y: sectorSentiment
                    }
                ]
            }],
            xaxis: {
                categories: ['Stock Sentiment', 'Sector Average'],
                labels: {
                    style: {
                        colors: textColor,
                        fontFamily: 'Poppins, sans-serif',
                    }
                },
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                }
            },
            yaxis: {
                max: 100,
                labels: {
                    style: {
                        colors: textColor,
                        fontFamily: 'Poppins, sans-serif',
                    }
                }
            },
            tooltip: {
                theme: tooltipTheme,
                y: {
                    formatter: function(value) {
                        return value + '%';
                    }
                }
            },
            legend: {
                show: false
            },
            theme: {
                mode: isDark ? 'dark' : 'light'
            }
        };
        
        // If chart already exists, destroy it
        if (window.sentimentChart) {
            window.sentimentChart.destroy();
        }
        
        // Create new chart
        if (typeof ApexCharts !== 'undefined') {
            window.sentimentChart = new ApexCharts(document.getElementById('sentiment-chart'), options);
            window.sentimentChart.render();
            console.log("Sentiment chart updated with values:", bullishSentiment, sectorSentiment);
        } else {
            // Fallback when ApexCharts is not available
            console.error("ApexCharts not loaded for sentiment chart");
            const sentimentChart = document.getElementById('sentiment-chart');
            if (sentimentChart) {
                sentimentChart.innerHTML = `
                    <div style="text-align:center; padding:20px;">
                        <div style="font-weight:bold; margin-bottom:10px;">Bullish Sentiment: ${bullishSentiment}%</div>
                        <div style="font-weight:bold;">Sector Average: ${sectorSentiment}%</div>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error("Error updating sentiment chart:", error);
    }
}

// Update company info display
function updateCompanyInfo(ticker, latestData) {
    try {
        // Company mapping data
        const companyInfo = {
            'AAPL': {
                name: 'Apple Inc.',
                sector: 'Technology',
                exchange: 'NASDAQ',
                logo: 'fa-apple',
                metrics: {
                    pe: 28.5,
                    marketCap: '2.45T',
                    avgVolume: '29.8M',
                    dividend: '0.92 (0.61%)',
                    beta: '1.28',
                    eps: '$5.28'
                }
            },
            'MSFT': {
                name: 'Microsoft Corporation',
                sector: 'Technology',
                exchange: 'NASDAQ',
                logo: 'fa-microsoft',
                metrics: {
                    pe: 34.7,
                    marketCap: '2.81T',
                    avgVolume: '25.3M',
                    dividend: '2.72 (0.81%)',
                    beta: '0.93',
                    eps: '$9.65'
                }
            },
            'GOOGL': {
                name: 'Alphabet Inc.',
                sector: 'Technology',
                exchange: 'NASDAQ',
                logo: 'fa-google',
                metrics: {
                    pe: 26.4,
                    marketCap: '1.70T',
                    avgVolume: '18.5M',
                    dividend: 'N/A',
                    beta: '1.06',
                    eps: '$5.80'
                }
            },
            'AMZN': {
                name: 'Amazon.com, Inc.',
                sector: 'Consumer Cyclical',
                exchange: 'NASDAQ',
                logo: 'fa-amazon',
                metrics: {
                    pe: 41.8,
                    marketCap: '1.85T',
                    avgVolume: '32.4M',
                    dividend: 'N/A',
                    beta: '1.24',
                    eps: '$2.90'
                }
            },
            'META': {
                name: 'Meta Platforms, Inc.',
                sector: 'Technology',
                exchange: 'NASDAQ',
                logo: 'fa-facebook',
                metrics: {
                    pe: 23.6,
                    marketCap: '1.12T',
                    avgVolume: '15.7M',
                    dividend: 'N/A',
                    beta: '1.42',
                    eps: '$13.62'
                }
            },
            'TSLA': {
                name: 'Tesla, Inc.',
                sector: 'Automotive',
                exchange: 'NASDAQ',
                logo: 'fa-car',
                metrics: {
                    pe: 47.2,
                    marketCap: '862.5B',
                    avgVolume: '42.6M',
                    dividend: 'N/A',
                    beta: '2.01',
                    eps: '$4.30'
                }
            }
        };
        
        // Get company info or use defaults
        const company = companyInfo[ticker] || {
            name: ticker,
            sector: 'Unknown',
            exchange: 'NYSE',
            logo: 'fa-building',
            metrics: {
                pe: 'N/A',
                marketCap: 'N/A',
                avgVolume: 'N/A',
                dividend: 'N/A',
                beta: 'N/A',
                eps: 'N/A'
            }
        };
        
        // Update company name and info
        const companyNameElement = document.getElementById('company-name');
        if (companyNameElement) companyNameElement.textContent = `${company.name} (${ticker})`;
        
        const companySectorElement = document.getElementById('company-sector');
        if (companySectorElement) companySectorElement.textContent = company.sector;
        
        const companyExchangeElement = document.getElementById('company-exchange');
        if (companyExchangeElement) companyExchangeElement.textContent = company.exchange;
        
        // Update company logo
        updateCompanyLogo(ticker);
        
        // Format price
        const price = parseFloat(latestData.close).toFixed(2);
        const stockPriceElement = document.getElementById('stock-price');
        if (stockPriceElement) stockPriceElement.textContent = `$${price}`;
        
        // Calculate change from previous day
        if (window.stockData && window.stockData.length > 1) {
            const previousDayData = window.stockData[window.stockData.length - 2];
            if (previousDayData) {
                const change = parseFloat(latestData.close) - parseFloat(previousDayData.close);
                const percentChange = (change / parseFloat(previousDayData.close)) * 100;
                
                const changeElement = document.getElementById('price-change');
                if (changeElement) {
                    changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${percentChange.toFixed(2)}%)`;
                    
                    if (change >= 0) {
                        changeElement.className = 'change positive';
                    } else {
                        changeElement.className = 'change negative';
                    }
                }
            }
        }
        
        // Update volume
        const volumeElement = document.getElementById('volume');
        if (volumeElement) volumeElement.textContent = formatNumber(latestData.volume);
        
        // Update additional metrics
        const peRatioElement = document.getElementById('pe-ratio');
        if (peRatioElement) peRatioElement.textContent = company.metrics.pe;
        
        const marketCapElement = document.getElementById('market-cap');
        if (marketCapElement) marketCapElement.textContent = company.metrics.marketCap;
        
        const avgVolumeElement = document.getElementById('avg-volume');
        if (avgVolumeElement) avgVolumeElement.textContent = company.metrics.avgVolume;
        
        const dividendElement = document.getElementById('dividend');
        if (dividendElement) dividendElement.textContent = company.metrics.dividend;
        
        const betaElement = document.getElementById('beta');
        if (betaElement) betaElement.textContent = company.metrics.beta;
        
        const epsElement = document.getElementById('eps');
        if (epsElement) epsElement.textContent = company.metrics.eps;
        
        // Calculate year high/low
        if (window.stockData.length > 0) {
            const prices = window.stockData.map(d => parseFloat(d.high));
            const yearHigh = Math.max(...prices).toFixed(2);
            const yearLow = Math.min(...prices).toFixed(2);
            
            const yearHighElement = document.getElementById('year-high');
            if (yearHighElement) yearHighElement.textContent = `$${yearHigh}`;
            
            const yearLowElement = document.getElementById('year-low');
            if (yearLowElement) yearLowElement.textContent = `$${yearLow}`;
        }
        
        console.log("Company info updated for:", ticker);
        
        // Reset animation flags for metrics to allow re-animation
        document.querySelectorAll('.metric-value').forEach(element => {
            element.dataset.animated = "";
        });
        
        // Trigger metrics animation
        setTimeout(animateNumbers, 200);
    } catch (error) {
        console.error("Error updating company info:", error);
    }
}

// Update company logo based on ticker
function updateCompanyLogo(ticker) {
    try {
        const logoElement = document.getElementById('company-logo');
        if (!logoElement) return;
        
        // Clear existing logo
        logoElement.innerHTML = '';
        
        // Map ticker to logo icon
        const logoMap = {
            'AAPL': 'fa-apple',
            'MSFT': 'fa-microsoft',
            'GOOGL': 'fa-google',
            'AMZN': 'fa-amazon',
            'META': 'fa-facebook',
            'TSLA': 'fa-car',
            'NFLX': 'fa-film',
            'NVDA': 'fa-microchip',
            'PYPL': 'fa-paypal',
            'ADBE': 'fa-file-pdf',
            'INTC': 'fa-microchip'
        };
        
        // Get logo class or default to building icon
        const logoClass = logoMap[ticker] ? `fab ${logoMap[ticker]}` : 'fas fa-chart-line';
        
        // Create icon element
        const icon = document.createElement('i');
        icon.className = logoClass;
        logoElement.appendChild(icon);
        
        // Set background color based on ticker
        const colors = [
            '#007bff', '#6610f2', '#6f42c1', '#e83e8c', '#dc3545', 
            '#fd7e14', '#ffc107', '#28a745', '#20c997', '#17a2b8'
        ];
        
        // Get consistent color for ticker
        const colorIndex = ticker.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length;
        const color1 = colors[colorIndex];
        const color2 = colors[(colorIndex + 3) % colors.length];
        
        logoElement.style.background = `linear-gradient(145deg, ${color1}, ${color2})`;
        console.log("Company logo updated for:", ticker);
    } catch (error) {
        console.error("Error updating company logo:", error);
    }
}

// Format large numbers (e.g., 1,000,000 to 1M)
function formatNumber(num) {
    if (!num) return "N/A";
    
    try {
        num = parseInt(num);
        if (isNaN(num)) return "N/A";
        
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    } catch (error) {
        console.error("Error formatting number:", error);
        return "N/A";
    }
}

// Display news items with enhanced styling
function displayNews(newsItems) {
    try {
        const newsContainer = document.getElementById('news-container');
        if (!newsContainer) return;
        
        newsContainer.innerHTML = '';
        
        if (!newsItems || newsItems.length === 0) {
            newsContainer.innerHTML = '<div class="no-news">No recent news found for this stock.</div>';
            return;
        }
        
        // Store all news items globally for filtering
        window.allNewsItems = newsItems;
        
        newsItems.forEach((news, index) => {
            const newsDate = new Date(news.publishedAt);
            
            // Determine sentiment class and icon
            let sentimentClass = 'sentiment-neutral';
            let sentimentIcon = 'fas fa-minus';
            
            if (news.sentiment > 0.1) {
                sentimentClass = 'sentiment-positive';
                sentimentIcon = 'fas fa-arrow-up';
            } else if (news.sentiment < -0.1) {
                sentimentClass = 'sentiment-negative';
                sentimentIcon = 'fas fa-arrow-down';
            }
            
            // Create news element with animation delay
            const newsElement = document.createElement('div');
            newsElement.className = 'news-item';
            newsElement.dataset.sentiment = news.sentiment_label;
            newsElement.style.animationDelay = `${index * 0.1}s`;
            
            newsElement.innerHTML = `
                <div class="news-sentiment ${sentimentClass}">
                    <i class="${sentimentIcon}"></i>
                </div>
                <div class="news-content">
                    <a href="${news.url}" target="_blank" class="news-title">${news.title}</a>
                    <div class="news-meta">
                        <div class="news-source">${news.source}</div>
                        <div class="news-date">${newsDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                    </div>
                </div>
            `;
            
            newsContainer.appendChild(newsElement);
        });
        
        console.log("News displayed:", newsItems.length, "items");
    } catch (error) {
        console.error("Error displaying news:", error);
    }
}

// Filter news by sentiment
function filterNewsBySentiment(sentiment) {
    if (!window.allNewsItems) return;
    
    try {
        const newsContainer = document.getElementById('news-container');
        if (!newsContainer) return;
        
        newsContainer.innerHTML = '';
        
        let filteredNews = window.allNewsItems;
        
        // Filter news items by sentiment if not "all"
        if (sentiment !== 'all') {
            filteredNews = window.allNewsItems.filter(news => news.sentiment_label === sentiment);
        }
        
        if (filteredNews.length === 0) {
            newsContainer.innerHTML = '<div class="no-news">No news found with this sentiment.</div>';
            return;
        }
        
        // Display filtered news
        filteredNews.forEach((news, index) => {
            const newsDate = new Date(news.publishedAt);
            
            // Determine sentiment class and icon
            let sentimentClass = 'sentiment-neutral';
            let sentimentIcon = 'fas fa-minus';
            
            if (news.sentiment > 0.1) {
                sentimentClass = 'sentiment-positive';
                sentimentIcon = 'fas fa-arrow-up';
            } else if (news.sentiment < -0.1) {
                sentimentClass = 'sentiment-negative';
                sentimentIcon = 'fas fa-arrow-down';
            }
            
            // Create news element with animation delay
            const newsElement = document.createElement('div');
            newsElement.className = 'news-item';
            newsElement.dataset.sentiment = news.sentiment_label;
            newsElement.style.animationDelay = `${index * 0.1}s`;
            
            newsElement.innerHTML = `
                <div class="news-sentiment ${sentimentClass}">
                    <i class="${sentimentIcon}"></i>
                </div>
                <div class="news-content">
                    <a href="${news.url}" target="_blank" class="news-title">${news.title}</a>
                    <div class="news-meta">
                        <div class="news-source">${news.source}</div>
                        <div class="news-date">${newsDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                    </div>
                </div>
            `;
            
            newsContainer.appendChild(newsElement);
        });
        
        console.log("News filtered by sentiment:", sentiment);
    } catch (error) {
        console.error("Error filtering news:", error);
    }
}