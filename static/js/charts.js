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
        // Check if the price-chart element exists
        const priceChartEl = document.getElementById('price-chart');
        if (!priceChartEl) {
            console.error("Price chart element not found");
            return;
        }
        
        // Check if ApexCharts is loaded
        if (typeof ApexCharts === 'undefined') {
            console.error("ApexCharts library not loaded");
            fallbackChartInit();
            return;
        }
        
        // If charts already exist, destroy them
        if (window.priceChart) {
            window.priceChart.destroy();
        }
        if (window.candleChart) {
            window.candleChart.destroy();
        }
        
        // Create new charts
        window.priceChart = new ApexCharts(priceChartEl, options);
        window.priceChart.render();
        
        // Create but don't render candlestick chart yet
        window.candleChart = new ApexCharts(priceChartEl, candleOptions);
        
        // Set initial time range (default to 90 days)
        setTimeout(() => {
            updateChartTimeRange(90);
        }, 100);
        
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
        console.warn("No stock data available for chart update");
        return;
    }
    
    try {
        // Validate days parameter
        if (!days || isNaN(days)) {
            days = 90; // Default to 90 days
        }
        
        const today = new Date();
        const startDate = new Date();
        startDate.setDate(today.getDate() - days);
        
        // Filter data for the selected time range
        const filteredData = window.stockData.filter(d => {
            const dataDate = new Date(d.date);
            return dataDate >= startDate;
        });
        
        if (filteredData.length === 0) {
            console.warn("No data available for selected time range");
            return;
        }
        
        // Format data based on chart type
        if (window.chartType === 'line' && window.priceChart) {
            // Format data for line chart
            const chartData = filteredData.map(d => ({
                x: new Date(d.date).getTime(),
                y: parseFloat(d.close)
            }));
            
            window.priceChart.updateSeries([{
                name: 'Price',
                data: chartData
            }]);
            
            console.log("Chart updated with filtered data:", filteredData.length, "points");
        } else if (window.chartType === 'candle' && window.candleChart) {
            // Update candlestick data
            updateCandleChartData(days);
        }
        
        // Dispatch a custom event for chart updates
        document.dispatchEvent(new CustomEvent('chartUpdated', {
            detail: { days: days, dataPoints: filteredData.length }
        }));
    } catch (error) {
        console.error("Error updating chart:", error);
    }
}

// Update candlestick chart data
function updateCandleChartData(days) {
    if (!window.stockData || window.stockData.length === 0 || !window.candleChart) {
        console.warn("Cannot update candle chart - missing data or chart");
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
        
        if (filteredData.length === 0) {
            console.warn("No data available for selected time range");
            return;
        }
        
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
            name: 'Price',
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
    
    console.log("Toggling chart type to:", type);
    
    try {
        window.chartType = type;
        
        // Get the loading overlay
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) overlay.classList.add('active');
        
        // Get the active time range
        const activeRange = document.querySelector('.time-range.active');
        const timeRange = activeRange ? parseInt(activeRange.dataset.range) : 90;
        
        setTimeout(() => {
            const priceChartEl = document.getElementById('price-chart');
            if (!priceChartEl) {
                console.error("Price chart element not found");
                return;
            }
            
            if (type === 'line') {
                // Switch to line chart
                if (window.candleChart) {
                    try {
                        window.candleChart.destroy();
                    } catch (e) {
                        console.warn("Error destroying candle chart:", e);
                    }
                }
                
                if (window.priceChart) {
                    try {
                        window.priceChart.render();
                        updateChartTimeRange(timeRange);
                    } catch (e) {
                        console.warn("Error rendering price chart:", e);
                        // Re-initialize price chart if rendering fails
                        if (window.stockData && window.stockData.length > 0) {
                            initPriceChart(window.stockData);
                        }
                    }
                }
            } else {
                // Switch to candlestick chart
                if (window.priceChart) {
                    try {
                        window.priceChart.destroy();
                    } catch (e) {
                        console.warn("Error destroying price chart:", e);
                    }
                }
                
                if (window.candleChart) {
                    try {
                        window.candleChart.render();
                        updateCandleChartData(timeRange);
                    } catch (e) {
                        console.warn("Error rendering candle chart:", e);
                        // Handle failed candlestick chart rendering
                        fallbackChartInit();
                    }
                }
            }
            
            // Remove loading overlay
            if (overlay) overlay.classList.remove('active');
        }, 300);
    } catch (error) {
        console.error("Error toggling chart type:", error);
        // Remove loading overlay in case of error
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) overlay.classList.remove('active');
    }
}

// Update chart theme based on current theme
function updateChartTheme(chart) {
    if (!chart || typeof chart.updateOptions !== 'function') {
        console.warn("Cannot update theme - invalid chart object");
        return;
    }
    
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
        if (!sentimentChartElement) {
            console.warn("Sentiment chart element not found");
            return;
        }
        
        // Check if ApexCharts is loaded
        if (typeof ApexCharts === 'undefined') {
            console.error("ApexCharts library not loaded for sentiment chart");
            fallbackSentimentChart(bullishSentiment, sectorSentiment);
            return;
        }
        
        const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
        const textColor = isDark ? '#d1d5db' : '#6c757d';
        const tooltipTheme = isDark ? 'dark' : 'light';
        
        // Get color based on sentiment value
        const getBullishColor = (value) => {
            if (value > 60) return '#10b981'; // Green for positive
            if (value > 40) return '#3b82f6'; // Blue for neutral
            return '#ef4444'; // Red for negative
        };
        
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
            colors: [getBullishColor(bullishSentiment), '#8b5cf6'],
            dataLabels: {
                enabled: true,
                formatter: function(val) {
                    return val + '%';
                },
                offsetX: 30,
                style: {
                    fontSize: '12px',
                    colors: [isDark ? '#ffffff' : '#000000']
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
        window.sentimentChart = new ApexCharts(sentimentChartElement, options);
        window.sentimentChart.render();
        console.log("Sentiment chart updated with values:", bullishSentiment, sectorSentiment);
    } catch (error) {
        console.error("Error updating sentiment chart:", error);
        fallbackSentimentChart(bullishSentiment, sectorSentiment);
    }
}

// Fallback sentiment chart when ApexCharts fails
function fallbackSentimentChart(bullishSentiment, sectorSentiment) {
    const sentimentChart = document.getElementById('sentiment-chart');
    if (sentimentChart) {
        sentimentChart.innerHTML = `
            <div style="text-align:center; padding:20px;">
                <div style="font-weight:bold; margin-bottom:10px;">Bullish Sentiment: ${bullishSentiment}%</div>
                <div style="font-weight:bold;">Sector Average: ${sectorSentiment}%</div>
                <div style="margin-top:15px;">
                    <div style="height:20px; background:#f0f0f0; border-radius:4px; overflow:hidden; margin-bottom:10px;">
                        <div style="height:100%; width:${bullishSentiment}%; background:#3b82f6; transition:width 0.5s ease;"></div>
                    </div>
                    <div style="height:20px; background:#f0f0f0; border-radius:4px; overflow:hidden;">
                        <div style="height:100%; width:${sectorSentiment}%; background:#8b5cf6; transition:width 0.5s ease;"></div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Modify the updateCompanyInfo function in charts.js
function updateCompanyInfo(ticker, latestData) {
    try {
        // Check if data is reasonable before processing
        if (!latestData || latestData.close === undefined) {
            console.warn("Invalid latest data for ticker:", ticker);
            showTickerError(ticker);
            return;
        }
        
        if (latestData && (latestData.close > 1000000 || isNaN(parseFloat(latestData.close)))) {
            // Unreasonable values detected - show error
            console.warn("Unreasonable price data for ticker:", ticker);
            showTickerError(ticker);
            return;
        }
        
        // Get company information
        const companyName = getCompanyName(ticker);
        const companyNameElement = document.getElementById('company-name');
        if (companyNameElement) companyNameElement.textContent = companyName;
        
        // Update company logo
        updateCompanyLogo(ticker);
        
        // Update current price
        const stockPriceElement = document.getElementById('stock-price');
        if (stockPriceElement) {
            const price = parseFloat(latestData.close).toFixed(2);
            stockPriceElement.textContent = `$${price}`;
        }
        
        // Calculate price change
        if (window.stockData && window.stockData.length > 1) {
            const previousDay = window.stockData[window.stockData.length - 2];
            const currentPrice = parseFloat(latestData.close);
            const previousPrice = parseFloat(previousDay.close);
            const priceChange = currentPrice - previousPrice;
            const percentageChange = (priceChange / previousPrice) * 100;
            
            const priceChangeElement = document.getElementById('price-change');
            if (priceChangeElement) {
                priceChangeElement.textContent = `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} (${priceChange >= 0 ? '+' : ''}${percentageChange.toFixed(2)}%)`;
                priceChangeElement.className = priceChange >= 0 ? 'change positive' : 'change negative';
            }
        }
        
        // Update key metrics based on the ticker
        updateKeyMetrics(ticker, latestData);
        
        console.log("Company info updated for:", ticker);
        
        // Trigger animations for metrics
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('dataLoaded'));
        }, 100);
    } catch (error) {
        console.error("Error updating company info:", error);
        showTickerError(ticker);
    }
}

// Helper function to get company name based on ticker
function getCompanyName(ticker) {
    const companies = {
        'AAPL': 'Apple Inc.',
        'MSFT': 'Microsoft Corporation',
        'GOOGL': 'Alphabet Inc.',
        'AMZN': 'Amazon.com, Inc.',
        'META': 'Meta Platforms, Inc.',
        'TSLA': 'Tesla, Inc.',
        'NFLX': 'Netflix, Inc.',
        'NVDA': 'NVIDIA Corporation',
        'PYPL': 'PayPal Holdings, Inc.',
        'INTC': 'Intel Corporation'
    };
    
    return companies[ticker] || `${ticker} Stock`;
}

// Update key metrics with stock data
function updateKeyMetrics(ticker, latestData) {
    // Sample metrics data - in a real app, you would fetch this from your API
    const metrics = {
        'AAPL': {
            sector: 'Technology',
            exchange: 'NASDAQ',
            pe: '28.5',
            marketCap: '2.5T',
            yearHigh: '$182.94',
            yearLow: '$124.17',
            avgVolume: '64.8M',
            dividend: '0.92%',
            beta: '1.28',
            eps: '$6.15'
        },
        'MSFT': {
            sector: 'Technology',
            exchange: 'NASDAQ',
            pe: '32.1',
            marketCap: '2.3T',
            yearHigh: '$349.67',
            yearLow: '$213.43',
            avgVolume: '26.5M',
            dividend: '0.80%',
            beta: '0.93',
            eps: '$9.58'
        },
        'GOOGL': {
            sector: 'Technology',
            exchange: 'NASDAQ',
            pe: '25.7',
            marketCap: '1.7T',
            yearHigh: '$153.78',
            yearLow: '$83.34',
            avgVolume: '23.7M',
            dividend: '0%',
            beta: '1.06',
            eps: '$5.80'
        },
        'AMZN': {
            sector: 'Consumer Cyclical',
            exchange: 'NASDAQ',
            pe: '41.8',
            marketCap: '1.85T',
            yearHigh: '$147.74',
            yearLow: '$101.15',
            avgVolume: '32.4M',
            dividend: '0%',
            beta: '1.24',
            eps: '$2.90'
        },
        'META': {
            sector: 'Technology',
            exchange: 'NASDAQ',
            pe: '23.6',
            marketCap: '1.12T',
            yearHigh: '$326.20',
            yearLow: '$197.80',
            avgVolume: '15.7M',
            dividend: '0%',
            beta: '1.42',
            eps: '$13.62'
        },
        'TSLA': {
            sector: 'Automotive',
            exchange: 'NASDAQ',
            pe: '47.2',
            marketCap: '862.5B',
            yearHigh: '$299.29',
            yearLow: '$152.31',
            avgVolume: '42.6M',
            dividend: '0%',
            beta: '2.01',
            eps: '$4.30'
        }
    };
    
    // Get metrics for this ticker or use default values
    const stockMetrics = metrics[ticker] || {
        sector: 'Unknown',
        exchange: 'NYSE',
        pe: 'N/A',
        marketCap: 'N/A',
        yearHigh: 'N/A',
        yearLow: 'N/A',
        avgVolume: 'N/A',
        dividend: 'N/A',
        beta: 'N/A',
        eps: 'N/A'
    };
    
    // Update metrics on the page
    document.querySelectorAll('[data-metric]').forEach(element => {
        const metric = element.getAttribute('data-metric');
        if (stockMetrics[metric]) {
            element.textContent = stockMetrics[metric];
        }
    });
    
    // Update volume if available from latest data
    if (latestData.volume) {
        const volumeElement = document.getElementById('volume-metric');
        if (volumeElement) {
            volumeElement.textContent = formatNumber(latestData.volume);
        }
    }
    
    console.log("Key metrics updated for:", ticker);
}

// Add this new function to display a nice error message
function showTickerError(ticker) {
    // Update UI to show error state
    const companyNameElement = document.getElementById('company-name');
    if (companyNameElement) companyNameElement.textContent = `Unknown Ticker: ${ticker}`;
    
    // Clear data displays
    const stockPriceElement = document.getElementById('stock-price');
    if (stockPriceElement) stockPriceElement.textContent = 'N/A';
    
    const priceChangeElement = document.getElementById('price-change');
    if (priceChangeElement) {
        priceChangeElement.textContent = 'No data available';
        priceChangeElement.className = 'change';
    }
    
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
                        <button onclick="useTickerSuggestion('AAPL')">AAPL</button>
                        <button onclick="useTickerSuggestion('MSFT')">MSFT</button>
                        <button onclick="useTickerSuggestion('GOOGL')">GOOGL</button>
                        <button onclick="useTickerSuggestion('AMZN')">AMZN</button>
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
    
    // Clear sentiment chart
    const sentimentChartElement = document.getElementById('sentiment-chart');
    if (sentimentChartElement) {
        sentimentChartElement.innerHTML = `
            <div class="no-sentiment">
                <i class="fas fa-chart-bar"></i>
                <p>No sentiment data available</p>
            </div>
        `;
    }
}

// Helper function for ticker suggestions (used in error messages)
function useTickerSuggestion(ticker) {
    const tickerInput = document.getElementById('ticker-input');
    if (tickerInput) {
        tickerInput.value = ticker;
        // Check if performSearch function exists
        if (typeof performSearch === 'function') {
            performSearch();
        } else {
            console.warn("performSearch function not found");
            // Fallback: try to trigger the search button click
            const searchBtn = document.getElementById('search-btn');
            if (searchBtn) searchBtn.click();
        }
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
        if (!newsContainer) {
            console.warn("News container element not found");
            return;
        }
        
        newsContainer.innerHTML = '';
        
        if (!newsItems || newsItems.length === 0) {
            newsContainer.innerHTML = '<div class="no-news">No recent news found for this stock.</div>';
            return;
        }
        
        // Store all news items globally for filtering
        window.allNewsItems = newsItems;
        
        newsItems.forEach((news, index) => {
            // Handle null or undefined publishedAt
            const newsDate = news.publishedAt ? new Date(news.publishedAt) : new Date();
            
            // Determine sentiment class and icon
            let sentimentClass = 'sentiment-neutral';
            let sentimentIcon = 'fas fa-minus';
            
            // Use sentiment_label if available, otherwise calculate from sentiment value
            if (news.sentiment_label) {
                sentimentClass = `sentiment-${news.sentiment_label}`;
            } else if (news.sentiment !== undefined) {
                if (news.sentiment > 0.1) {
                    sentimentClass = 'sentiment-positive';
                    sentimentIcon = 'fas fa-arrow-up';
                } else if (news.sentiment < -0.1) {
                    sentimentClass = 'sentiment-negative';
                    sentimentIcon = 'fas fa-arrow-down';
                }
            }
            
            // Set icon based on sentiment class
            if (sentimentClass === 'sentiment-positive') {
                sentimentIcon = 'fas fa-arrow-up';
            } else if (sentimentClass === 'sentiment-negative') {
                sentimentIcon = 'fas fa-arrow-down';
            }
            
            // Create news element with animation delay
            const newsElement = document.createElement('div');
            newsElement.className = 'news-item';
            newsElement.dataset.sentiment = news.sentiment_label || 'neutral';
            newsElement.style.animationDelay = `${index * 0.1}s`;
            
            newsElement.innerHTML = `
                <div class="news-sentiment ${sentimentClass}">
                    <i class="${sentimentIcon}"></i>
                </div>
                <div class="news-content">
                    <a href="${news.url || '#'}" target="_blank" class="news-title">${news.title}</a>
                    <div class="news-meta">
                        <div class="news-source">${news.source || 'Unknown Source'}</div>
                        <div class="news-date">${newsDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                    </div>
                </div>
            `;
            
            newsContainer.appendChild(newsElement);
        });
        
        console.log("News displayed:", newsItems.length, "items");
        
        // Dispatch custom event when news is displayed
        document.dispatchEvent(new CustomEvent('newsDisplayed'));
    } catch (error) {
        console.error("Error displaying news:", error);
    }
}

// Filter news by sentiment
function filterNewsBySentiment(sentiment) {
    if (!window.allNewsItems) {
        console.warn("No news items available for filtering");
        return;
    }
    
    try {
        const newsContainer = document.getElementById('news-container');
        if (!newsContainer) {
            console.warn("News container element not found");
            return;
        }
        
        newsContainer.innerHTML = '';
        
        let filteredNews = window.allNewsItems;
        
        // Filter news items by sentiment if not "all"
        if (sentiment !== 'all') {
            filteredNews = window.allNewsItems.filter(news => {
                // Match by sentiment_label or calculated sentiment
                if (news.sentiment_label) {
                    return news.sentiment_label === sentiment;
                } else if (news.sentiment !== undefined) {
                    if (sentiment === 'positive') {
                        return news.sentiment > 0.1;
                    } else if (sentiment === 'negative') {
                        return news.sentiment < -0.1;
                    } else {
                        return news.sentiment >= -0.1 && news.sentiment <= 0.1;
                    }
                }
                return false;
            });
        }
        
        if (filteredNews.length === 0) {
            newsContainer.innerHTML = '<div class="no-news">No news found with this sentiment.</div>';
            return;
        }
        
        // Display filtered news
        filteredNews.forEach((news, index) => {
            const newsDate = news.publishedAt ? new Date(news.publishedAt) : new Date();
            
            // Determine sentiment class and icon
            let sentimentClass = 'sentiment-neutral';
            let sentimentIcon = 'fas fa-minus';
            
            // Use sentiment_label if available, otherwise calculate from sentiment value
            if (news.sentiment_label) {
                sentimentClass = `sentiment-${news.sentiment_label}`;
            } else if (news.sentiment !== undefined) {
                if (news.sentiment > 0.1) {
                    sentimentClass = 'sentiment-positive';
                    sentimentIcon = 'fas fa-arrow-up';
                } else if (news.sentiment < -0.1) {
                    sentimentClass = 'sentiment-negative';
                    sentimentIcon = 'fas fa-arrow-down';
                }
            }
            
            // Set icon based on sentiment class
            if (sentimentClass === 'sentiment-positive') {
                sentimentIcon = 'fas fa-arrow-up';
            } else if (sentimentClass === 'sentiment-negative') {
                sentimentIcon = 'fas fa-arrow-down';
            }
            
            // Create news element with animation delay
            const newsElement = document.createElement('div');
            newsElement.className = 'news-item';
            newsElement.dataset.sentiment = news.sentiment_label || 'neutral';
            newsElement.style.animationDelay = `${index * 0.1}s`;
            
            newsElement.innerHTML = `
                <div class="news-sentiment ${sentimentClass}">
                    <i class="${sentimentIcon}"></i>
                </div>
                <div class="news-content">
                    <a href="${news.url || '#'}" target="_blank" class="news-title">${news.title}</a>
                    <div class="news-meta">
                        <div class="news-source">${news.source || 'Unknown Source'}</div>
                        <div class="news-date">${newsDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                    </div>
                </div>
            `;
            
            newsContainer.appendChild(newsElement);
        });
        
        console.log("News filtered by sentiment:", sentiment);
        
        // Dispatch custom event when news is displayed after filtering
        document.dispatchEvent(new CustomEvent('newsDisplayed'));
    } catch (error) {
        console.error("Error filtering news:", error);
    }
}

// Listen for language changes to update charts
document.addEventListener('languageChanged', function(e) {
    const lang = e.detail.language;
    console.log("Language changed to:", lang, "- updating charts");
    
    // Update chart labels if they exist
    if (window.priceChart) {
        updateChartLabels(window.priceChart, lang);
    }
    
    if (window.candleChart) {
        updateChartLabels(window.candleChart, lang);
    }
    
    if (window.sentimentChart) {
        updateSentimentLabels(window.sentimentChart, lang);
    }
});

// Update chart labels based on language
function updateChartLabels(chart, lang) {
    if (!chart || typeof chart.updateOptions !== 'function') return;
    
    const translations = {
        'en': {
            'price': 'Price',
            'date': 'Date',
            'open': 'Open',
            'high': 'High',
            'low': 'Low',
            'close': 'Close'
        },
        'es': {
            'price': 'Precio',
            'date': 'Fecha',
            'open': 'Apertura',
            'high': 'Máximo',
            'low': 'Mínimo',
            'close': 'Cierre'
        }
        // Add more languages as needed
    };
    
    const t = translations[lang] || translations['en'];
    
    chart.updateOptions({
        series: [{
            name: t.price
        }]
    });
}

// Update sentiment chart labels based on language
function updateSentimentLabels(chart, lang) {
    if (!chart || typeof chart.updateOptions !== 'function') return;
    
    const translations = {
        'en': {
            'sentiment': 'Sentiment',
            'stock': 'Stock',
            'sector': 'Sector Average'
        },
        'es': {
            'sentiment': 'Sentimiento',
            'stock': 'Acción',
            'sector': 'Promedio del Sector'
        }
        // Add more languages as needed
    };
    
    const t = translations[lang] || translations['en'];
    
    chart.updateOptions({
        series: [{
            name: t.sentiment
        }],
        xaxis: {
            categories: [t.stock, t.sector]
        }
    });
}

// Execute on page load to ensure charts are properly initialized
document.addEventListener('DOMContentLoaded', function() {
    // Apply any existing theme immediately to charts
    const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    console.log("Initial theme is:", isDark ? 'dark' : 'light');
    
    // Ensure all charts use the correct theme
    if (window.priceChart) updateChartTheme(window.priceChart);
    if (window.candleChart) updateChartTheme(window.candleChart);
    if (window.sentimentChart) updateChartTheme(window.sentimentChart);
});