// static/js/main.js
document.addEventListener('DOMContentLoaded', function() {
    // Default ticker
    let currentTicker = 'AAPL';
    
    // Load initial data
    loadStockData(currentTicker);
    loadNewsData(currentTicker);
    loadSentimentData(currentTicker);
    
    // Search button click handler
    document.getElementById('search-btn').addEventListener('click', function() {
        const ticker = document.getElementById('ticker-input').value.trim().toUpperCase();
        if (ticker) {
            currentTicker = ticker;
            loadStockData(currentTicker);
            loadNewsData(currentTicker);
            loadSentimentData(currentTicker);
        }
    });
    
    // Allow enter key to trigger search
    document.getElementById('ticker-input').addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            document.getElementById('search-btn').click();
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
});

function loadStockData(ticker) {
    fetch(`/api/stock_data?ticker=${ticker}`)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                // Update company header info
                updateCompanyInfo(ticker, data[data.length-1]);
                
                // Initialize price chart
                initPriceChart(data);
                
                // Set default time range to 90 days
                updateChartTimeRange(90);
            } else {
                showError(`No data available for ${ticker}`);
            }
        })
        .catch(error => {
            console.error('Error fetching stock data:', error);
            showError('Failed to load stock data. Please try again.');
        });
}

function updateCompanyInfo(ticker, latestData) {
    const companyNames = {
        'AAPL': 'Apple Inc.',
        'MSFT': 'Microsoft Corporation',
        'GOOGL': 'Alphabet Inc.',
        'AMZN': 'Amazon.com, Inc.',
        'META': 'Meta Platforms, Inc.',
        'TSLA': 'Tesla, Inc.'
    };
    
    const companyName = companyNames[ticker] || ticker;
    document.getElementById('company-name').textContent = `${companyName} (${ticker})`;
    
    // Format price
    const price = latestData.close.toFixed(2);
    document.getElementById('stock-price').textContent = `$${price}`;
    
    // Calculate change from previous day (assuming data is sorted by date)
    const previousDayData = window.stockData[window.stockData.length - 2];
    if (previousDayData) {
        const change = latestData.close - previousDayData.close;
        const percentChange = (change / previousDayData.close) * 100;
        
        const changeElement = document.getElementById('price-change');
        changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${percentChange.toFixed(2)}%)`;
        
        if (change >= 0) {
            changeElement.className = 'h5 text-success';
        } else {
            changeElement.className = 'h5 text-danger';
        }
    }
}

function loadNewsData(ticker) {
    fetch(`/api/company_news?ticker=${ticker}`)
        .then(response => response.json())
        .then(data => {
            displayNews(data);
        })
        .catch(error => {
            console.error('Error fetching news data:', error);
        });
}

function displayNews(newsItems) {
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = '';
    
    if (newsItems.length === 0) {
        newsContainer.innerHTML = '<p>No recent news found.</p>';
        return;
    }
    
    newsItems.forEach(news => {
        const newsDate = new Date(news.publishedAt);
        
        const sentimentClass = news.sentiment > 0.1 ? 'sentiment-positive' : 
                              news.sentiment < -0.1 ? 'sentiment-negative' : 'sentiment-neutral';
                              
        const sentimentIcon = news.sentiment > 0.1 ? '↑' : 
                             news.sentiment < -0.1 ? '↓' : '→';
        
        const newsElement = document.createElement('div');
        newsElement.className = 'news-item';
        newsElement.innerHTML = `
            <div class="news-title">
                <a href="${news.url}" target="_blank">${news.title}</a>
                <span class="${sentimentClass}"> ${sentimentIcon}</span>
            </div>
            <div class="d-flex justify-content-between">
                <div class="news-source">${news.source}</div>
                <div class="news-date">${newsDate.toLocaleDateString()}</div>
            </div>
        `;
        
        newsContainer.appendChild(newsElement);
    });
}

function loadSentimentData(ticker) {
    fetch(`/api/stock_sentiment?ticker=${ticker}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('buzz-score').textContent = Math.round(data.buzz * 100);
            document.getElementById('bullish-score').textContent = `${Math.round(data.sentiment_score * 100)}%`;
            document.getElementById('sector-score').textContent = `${Math.round(data.sector_sentiment * 100)}%`;
            
            // Update sentiment chart
            updateSentimentChart(data.sentiment_score, data.sector_sentiment);
        })
        .catch(error => {
            console.error('Error fetching sentiment data:', error);
        });
}

function showError(message) {
    alert(message);
}