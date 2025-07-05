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

// Modify the updateCompanyInfo function in charts.js
function updateCompanyInfo(ticker, latestData) {
    try {
        // Check if data is reasonable before processing
        if (latestData && (latestData.close > 1000000 || isNaN(parseFloat(latestData.close)))) {
            // Unreasonable values detected - show error
            showTickerError(ticker);
            return;
        }
        
        // Rest of your existing function...
    } catch (error) {
        console.error("Error updating company info:", error);
        showTickerError(ticker);
    }
}

// Add this new function to display a nice error message
function showTickerError(ticker) {
    // Update UI to show error state
    const companyNameElement = document.getElementById('company-name');
    if (companyNameElement) companyNameElement.textContent = `Unknown Ticker: ${ticker}`;
    
    // Clear data displays
    document.getElementById('stock-price').textContent = 'N/A';
    document.getElementById('price-change').textContent = 'No data available';
    document.getElementById('price-change').className = 'change';
    
    // Show creative error message in chart area
    const chartElement = document.getElementById('price-chart');
    if (chartElement) {
        chartElement.innerHTML = `
            <div class="ticker-error">
                <div class="error-icon"><i class="fas fa-search"></i></div>
                <h3>Ticker Not Found</h3>
                <p>We couldn't find any data for "${ticker}"</p>
                <div class="suggestions">
                    <p>Try one of these popular tickers:</p>
                    <div class="suggestion-buttons">
                        <button onclick="document.getElementById('ticker-input').value='AAPL';performSearch()">AAPL</button>
                        <button onclick="document.getElementById('ticker-input').value='MSFT';performSearch()">MSFT</button>
                        <button onclick="document.getElementById('ticker-input').value='GOOGL';performSearch()">GOOGL</button>
                        <button onclick="document.getElementById('ticker-input').value='AMZN';performSearch()">AMZN</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Clear news container
    const newsContainer = document.getElementById('news-container');
    if (newsContainer) {
        newsContainer.innerHTML = '<div class="no-news">No news found for this ticker.</div>';
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