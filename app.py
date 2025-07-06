# app.py
from flask import Flask, render_template, request, jsonify
import os
import requests
import json
import datetime
import random
from textblob import TextBlob
import pandas as pd
import time
import logging
import re
import yfinance as yf  # Add Yahoo Finance library

app = Flask(__name__)

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Cache to minimize API calls
cache = {}
cache_duration = 300  # 5 minutes
CACHE_CLEANUP_INTERVAL = 3600  # Clean up stale cache entries every hour
last_cleanup = datetime.datetime.now()

# API keys - these are placeholders, but the app will work even if APIs are down
# In production, these should be stored as environment variables
ALPHAVANTAGE_API_KEY = os.environ.get("ALPHAVANTAGE_API_KEY", "ORRBTEBWNMRKM9JY")
NEWS_API_KEY = os.environ.get("NEWS_API_KEY", "86faaf4a4ee8490cade873e97b4721d3")
# Removed Finnhub API key and client

# Define helper functions first
def generate_mock_stock_data(ticker, days=365):
    return
    """
    Generate realistic mock stock data for demo purposes
    
    Args:
        ticker (str): Stock ticker symbol
        days (int): Number of days of historical data to generate
    
    Returns:
        list: List of dictionaries containing stock data
    """
    data = []
    # Use different base prices for different tickers
    base_prices = {
        'AAPL': 159.25,
        'MSFT': 338.47,
        'GOOGL': 137.14,
        'AMZN': 127.74,
        'TSLA': 237.49,
        'META': 313.75
    }

    base_price = base_prices.get(ticker, 100.0)  # Default to 100 for unknown tickers
    volatility = 0.02  # 2% daily volatility
    
    end_date = datetime.datetime.now()
    
    for i in range(days, 0, -1):
        date = end_date - datetime.timedelta(days=i)
        
        # Weekend check - skip weekends
        if date.weekday() >= 5:  # 5 is Saturday, 6 is Sunday
            continue
            
        # Random daily change with some trend
        change_percent = random.normalvariate(0, volatility) + (0.0001 * (days - i))
        
        # Calculate price movement
        if i == days:
            # First day, use base price
            open_price = base_price * (1 - random.normalvariate(0, volatility/2))
            close_price = base_price
        else:
            # Use previous day's close as reference
            print(data)
            prev_close = data[-1]['close']
            open_price = prev_close * (1 + random.normalvariate(0, volatility/3))
            close_price = prev_close * (1 + change_percent)
        
        # Ensure prices don't go negative
        open_price = max(open_price, 0.1)
        close_price = max(close_price, 0.1)
        
        # Calculate high and low with realistic constraints
        high_price = max(open_price, close_price) * (1 + abs(random.normalvariate(0, volatility/2)))
        low_price = min(open_price, close_price) * (1 - abs(random.normalvariate(0, volatility/2)))
        
        # Random volume based on price movement
        volume = int(random.normalvariate(5000000, 2000000) * (1 + 2*abs(change_percent)))
        
        data.append({
            'date': date.strftime('%Y-%m-%d'),
            'open': round(open_price, 2),
            'high': round(high_price, 2),
            'low': round(low_price, 2),
            'close': round(close_price, 2),
            'volume': volume
        })
    
    return data

def generate_mock_news(company_name):
    """
    Generate mock news articles for demo purposes
    
    Args:
        company_name (str): Company name to generate news about
    
    Returns:
        list: List of dictionaries containing news data
    """
    news_templates = [
        "{company} Reports Quarterly Earnings Above Expectations",
        "{company} Announces New Product Line",
        "Analysts Upgrade {company} Stock Rating",
        "{company} Expands Operations to New Markets",
        "{company} CEO Discusses Future Growth Strategy",
        "Investors React to {company}'s Latest Announcement",
        "{company} Partners with Tech Giant for New Initiative",
        "Market Trends: How {company} is Positioned for Growth",
        "{company} Addresses Supply Chain Challenges",
        "Regulatory Changes Could Impact {company}'s Business Model"
    ]
    
    sources = ["Reuters", "Bloomberg", "CNBC", "Wall Street Journal", "Financial Times", 
               "MarketWatch", "Barron's", "Seeking Alpha", "Investor's Business Daily", "The Motley Fool"]
    
    articles = []
    now = datetime.datetime.now()
    
    for i in range(10):
        # Generate random sentiment
        sentiment_value = random.normalvariate(0.2, 0.5)  # Slightly positive bias
        sentiment_label = "positive" if sentiment_value > 0.1 else "negative" if sentiment_value < -0.1 else "neutral"
        
        # Random publication date within last 7 days
        days_ago = random.randint(0, 7)
        hours_ago = random.randint(0, 24)
        pub_date = now - datetime.timedelta(days=days_ago, hours=hours_ago)
        
        title = news_templates[i % len(news_templates)].format(company=company_name)
        source = sources[random.randint(0, len(sources)-1)]
        
        articles.append({
            'title': title,
            'source': source,
            'url': '#',  # Placeholder URL
            'publishedAt': pub_date.isoformat(),
            'sentiment': sentiment_value,
            'sentiment_label': sentiment_label
        })
    
    return articles

def analyze_sentiment(text):
    """
    Analyze sentiment of text using TextBlob
    
    Args:
        text (str): Text to analyze
        
    Returns:
        dict: Dictionary with polarity and sentiment label
    """
    # Use TextBlob for sentiment analysis
    analysis = TextBlob(text)
    polarity = analysis.sentiment.polarity
    
    # Determine sentiment label
    if polarity > 0.1:
        label = "positive"
    elif polarity < -0.1:
        label = "negative"
    else:
        label = "neutral"
    
    return {
        'polarity': polarity,
        'label': label
    }

def get_company_name(ticker):
    """
    Get company name from ticker symbol
    
    Args:
        ticker (str): Stock ticker symbol
        
    Returns:
        str: Company name
    """
    # Map ticker to company name
    company_map = {
        'AAPL': 'Apple',
        'MSFT': 'Microsoft',
        'GOOGL': 'Google',
        'AMZN': 'Amazon',
        'META': 'Facebook',
        'TSLA': 'Tesla',
        'NVDA': 'NVIDIA',
        'NFLX': 'Netflix',
        'PYPL': 'PayPal',
        'INTC': 'Intel'
    }
    return company_map.get(ticker, ticker)

def clean_cache():
    """
    Remove expired cache entries to prevent memory bloat
    """
    global last_cleanup
    now = datetime.datetime.now()
    
    # Only run cleanup if enough time has passed since last cleanup
    if (now - last_cleanup).seconds < CACHE_CLEANUP_INTERVAL:
        return
    
    logger.info("Cleaning up expired cache entries")
    expired_keys = []
    
    for key, value in cache.items():
        if (now - value['timestamp']).seconds > cache_duration:
            expired_keys.append(key)
    
    for key in expired_keys:
        del cache[key]
    
    logger.info(f"Removed {len(expired_keys)} expired cache entries")
    last_cleanup = now

def validate_ticker(ticker):
    """
    Validate ticker symbol format
    
    Args:
        ticker (str): Stock ticker symbol
        
    Returns:
        bool: True if valid format, False otherwise
    """
    # Basic validation - tickers are typically 1-5 uppercase letters
    return bool(re.match(r'^[A-Z]{1,5}$', ticker))

# Now define the mock data using the helper functions
MOCK_DATA = {
    'AAPL': {
        'company_name': 'Apple Inc.',
        'sector': 'Technology',
        'exchange': 'NASDAQ',
        'price': 159.25,
        'change': 2.67,
        'change_percent': 1.67,
        'volume': 57834200,
        'market_cap': '2.45T',
        'pe_ratio': 28.5,
        'dividend': '0.92 (0.61%)',
        'beta': 1.28,
        'eps': 5.28,
        'year_high': 182.94,
        'year_low': 124.17,
        'avg_volume': '29.8M',
        'stock_data': generate_mock_stock_data('AAPL', days=365),
        'news': generate_mock_news('Apple'),
        'sentiment': {
            'buzz': 0.89,
            'sentiment_score': 0.65,
            'sector_sentiment': 0.58
        }
    },
    'MSFT': {
        'company_name': 'Microsoft Corporation',
        'sector': 'Technology',
        'exchange': 'NASDAQ',
        'price': 338.47,
        'change': 0.83,
        'change_percent': 0.25,
        'volume': 22135600,
        'market_cap': '2.81T',
        'pe_ratio': 34.7,
        'dividend': '2.72 (0.81%)',
        'beta': 0.93,
        'eps': 9.65,
        'year_high': 366.78,
        'year_low': 275.89,
        'avg_volume': '25.3M',
        'stock_data': generate_mock_stock_data('MSFT', days=365),
        'news': generate_mock_news('Microsoft'),
        'sentiment': {
            'buzz': 0.76,
            'sentiment_score': 0.72,
            'sector_sentiment': 0.58
        }
    },
    'GOOGL': {
        'company_name': 'Alphabet Inc.',
        'sector': 'Technology',
        'exchange': 'NASDAQ',
        'price': 137.14,
        'change': -1.23,
        'change_percent': -0.89,
        'volume': 18756300,
        'market_cap': '1.70T',
        'pe_ratio': 26.4,
        'dividend': 'N/A',
        'beta': 1.06,
        'eps': 5.80,
        'year_high': 142.56,
        'year_low': 102.21,
        'avg_volume': '18.5M',
        'stock_data': generate_mock_stock_data('GOOGL', days=365),
        'news': generate_mock_news('Google'),
        'sentiment': {
            'buzz': 0.82,
            'sentiment_score': 0.53,
            'sector_sentiment': 0.58
        }
    },
    'AMZN': {
        'company_name': 'Amazon.com, Inc.',
        'sector': 'Consumer Cyclical',
        'exchange': 'NASDAQ',
        'price': 127.74,
        'change': 3.35,
        'change_percent': 2.62,
        'volume': 32458900,
        'market_cap': '1.85T',
        'pe_ratio': 41.8,
        'dividend': 'N/A',
        'beta': 1.24,
        'eps': 2.90,
        'year_high': 147.74,
        'year_low': 101.15,
        'avg_volume': '32.4M',
        'stock_data': generate_mock_stock_data('AMZN', days=365),
        'news': generate_mock_news('Amazon'),
        'sentiment': {
            'buzz': 0.91,
            'sentiment_score': 0.67,
            'sector_sentiment': 0.58
        }
    },
    'TSLA': {
        'company_name': 'Tesla, Inc.',
        'sector': 'Automotive',
        'exchange': 'NASDAQ',
        'price': 237.49,
        'change': -5.66,
        'change_percent': -2.33,
        'volume': 42684200,
        'market_cap': '862.5B',
        'pe_ratio': 47.2,
        'dividend': 'N/A',
        'beta': 2.01,
        'eps': 4.30,
        'year_high': 299.29,
        'year_low': 152.31,
        'avg_volume': '42.6M',
        'stock_data': generate_mock_stock_data('TSLA', days=365),
        'news': generate_mock_news('Tesla'),
        'sentiment': {
            'buzz': 0.95,
            'sentiment_score': 0.48,
            'sector_sentiment': 0.58
        }
    },
    'META': {
        'company_name': 'Meta Platforms, Inc.',
        'sector': 'Technology',
        'exchange': 'NASDAQ',
        'price': 313.75,
        'change': 4.62,
        'change_percent': 1.49,
        'volume': 15783200,
        'market_cap': '1.12T',
        'pe_ratio': 23.6,
        'dividend': 'N/A',
        'beta': 1.42,
        'eps': 13.62,
        'year_high': 326.20,
        'year_low': 197.80,
        'avg_volume': '15.7M',
        'stock_data': generate_mock_stock_data('META', days=365),
        'news': generate_mock_news('Meta Facebook'),
        'sentiment': {
            'buzz': 0.88,
            'sentiment_score': 0.59,
            'sector_sentiment': 0.58
        }
    }
}

@app.route('/')
def index():
    """Render the main dashboard page"""
    return render_template('index.html')

@app.route('/about')
def about():
    """Render the about page"""
    return render_template('about.html')

@app.route('/api/stock_data', methods=['GET'])
def get_stock_data():
    """API endpoint to get stock price history data"""
    # Clean cache periodically
    clean_cache()
    
    # Get and validate ticker
    ticker = request.args.get('ticker', 'AAPL').upper()
    if not validate_ticker(ticker):
        return jsonify({
            'error': 'Invalid ticker symbol format'
        }), 400
    
    # Check cache first
    cache_key = f"stock_data_{ticker}"
    if cache_key in cache and (datetime.datetime.now() - cache[cache_key]['timestamp']).seconds < cache_duration:
        logger.info(f"Returning cached data for {ticker}")
        return jsonify(cache[cache_key]['data'])
    
    try:
        # Try to get data from Yahoo Finance
        logger.info(f"Fetching stock data for {ticker} from Yahoo Finance")
        
        # Get historical data using yfinance
        stock = yf.Ticker(ticker)
        hist = stock.history(period="1y")  # Get data for 1 year
        # print(hist)
        if not hist.empty:
            # Process the data for charting
            processed_data = []
            for date, row in hist.iterrows():
                processed_data.append({
                    'date': date.strftime('%Y-%m-%d'),
                    'open': round(float(row['Open']), 2),
                    'high': round(float(row['High']), 2),
                    'low': round(float(row['Low']), 2),
                    'close': round(float(row['Close']), 2),
                    'volume': int(row['Volume'])
                })
                # print(processed_data[0])
        else:
            # If no data from Yahoo Finance, try Alpha Vantage as backup
            logger.info(f"No data from Yahoo Finance for {ticker}, trying Alpha Vantage")
            url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={ticker}&apikey={ALPHAVANTAGE_API_KEY}"
            response = requests.get(url, timeout=5)
            stock_data = response.json()
            print(stock_data)
            # Process the data for charting
            processed_data = []
            if 'Time Series (Daily)' in stock_data:
                time_series = stock_data['Time Series (Daily)']
                for date, values in time_series.items():
                    processed_data.append({
                        'date': date,
                        'open': float(values['1. open']),
                        'high': float(values['2. high']),
                        'low': float(values['3. low']),
                        'close': float(values['4. close']),
                        'volume': int(values['5. volume'])
                    })
                
                # Sort by date
                processed_data.sort(key=lambda x: x['date'])
            else:
                # If API call fails or no data, use mock data
                raise Exception("No data from APIs")
            
    except Exception as e:
        logger.warning(f"Error fetching stock data: {e}, falling back to mock data")
        # Fallback to mock data
        if ticker in MOCK_DATA:
            processed_data = MOCK_DATA[ticker]['stock_data']
        else:
            # Generate random data for unknown tickers
            processed_data = generate_mock_stock_data(ticker)
    
    # Store in cache
    cache[cache_key] = {
        'timestamp': datetime.datetime.now(),
        'data': processed_data
    }
    
    return jsonify(processed_data)

@app.route('/api/company_news', methods=['GET'])
def get_company_news():
    """API endpoint to get company news and sentiment analysis"""
    # Clean cache periodically
    clean_cache()
    
    # Get and validate ticker
    ticker = request.args.get('ticker', 'AAPL').upper()
    if not validate_ticker(ticker):
        return jsonify({
            'error': 'Invalid ticker symbol format'
        }), 400
    
    # Check cache first
    cache_key = f"news_{ticker}"
    if cache_key in cache and (datetime.datetime.now() - cache[cache_key]['timestamp']).seconds < cache_duration:
        logger.info(f"Returning cached news for {ticker}")
        return jsonify(cache[cache_key]['data'])
    
    try:
        # Try to get news from Yahoo Finance first
        logger.info(f"Fetching news for {ticker} from Yahoo Finance")
        stock = yf.Ticker(ticker)
        news_data = stock.news
        
        # Process news and analyze sentiment
        articles = []
        if news_data and len(news_data) > 0:
            for article in news_data[:10]:  # Limit to 10 articles
                # Skip articles with missing data
                if not article.get('title'):
                    continue
                
                sentiment = analyze_sentiment(article['title'])
                articles.append({
                    'title': article['title'],
                    'source': article.get('publisher', 'Yahoo Finance'),
                    'url': article.get('link', '#'),
                    'publishedAt': datetime.datetime.fromtimestamp(article.get('providerPublishTime', time.time())).isoformat(),
                    'sentiment': sentiment['polarity'],
                    'sentiment_label': sentiment['label']
                })
        
        # If no articles from Yahoo Finance, try News API
        if not articles:
            company_name = get_company_name(ticker)
            logger.info(f"No news from Yahoo Finance for {ticker}, trying News API")
            url = f"https://newsapi.org/v2/everything?q={company_name}&apiKey={NEWS_API_KEY}&pageSize=10"
            response = requests.get(url, timeout=5)
            news_data = response.json()
            
            if 'articles' in news_data and len(news_data['articles']) > 0:
                for article in news_data['articles'][:10]:  # Limit to 10 articles
                    # Skip articles with missing data
                    if not article.get('title') or not article.get('source'):
                        continue
                    
                    sentiment = analyze_sentiment(article['title'] + " " + (article.get('description') or ""))
                    articles.append({
                        'title': article['title'],
                        'source': article['source']['name'],
                        'url': article['url'],
                        'publishedAt': article['publishedAt'],
                        'sentiment': sentiment['polarity'],
                        'sentiment_label': sentiment['label']
                    })
        
        if not articles:
            # If API calls return no usable articles
            raise Exception("No usable news data from APIs")
            
    except Exception as e:
        logger.warning(f"Error fetching news: {e}, falling back to mock data")
        # Fallback to mock data
        if ticker in MOCK_DATA:
            articles = MOCK_DATA[ticker]['news']
        else:
            company_name = get_company_name(ticker)
            articles = generate_mock_news(company_name)
    
    # Store in cache
    cache[cache_key] = {
        'timestamp': datetime.datetime.now(),
        'data': articles
    }
    
    return jsonify(articles)

@app.route('/api/validate_ticker', methods=['GET'])
def validate_ticker_endpoint():
    """API endpoint to validate if a ticker symbol exists"""
    ticker = request.args.get('ticker', '').upper()
    
    if not ticker:
        return jsonify({'valid': False, 'ticker': ticker}), 400
    
    if not validate_ticker(ticker):
        return jsonify({'valid': False, 'ticker': ticker}), 400
    
    # Check if it's in our known tickers or try to validate via Yahoo Finance
    valid_tickers = set(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'NFLX', 'PYPL', 'INTC'])
    is_valid = ticker in valid_tickers
    
    if not is_valid:
        try:
            # Try to get a real quote using yfinance
            logger.info(f"Validating ticker {ticker} with Yahoo Finance")
            stock = yf.Ticker(ticker)
            info = stock.info
            
            # If we can get info, the ticker is valid
            is_valid = 'symbol' in info
        except Exception as e:
            logger.warning(f"Error validating ticker {ticker}: {e}")
            is_valid = False
    
    return jsonify({
        'valid': is_valid,
        'ticker': ticker
    })

@app.route('/api/stock_sentiment', methods=['GET'])
def get_stock_sentiment():
    """API endpoint to get stock sentiment analysis using Yahoo Finance"""
    # Clean cache periodically
    clean_cache()
    
    # Get and validate ticker
    ticker = request.args.get('ticker', 'AAPL').upper()
    if not validate_ticker(ticker):
        return jsonify({
            'error': 'Invalid ticker symbol format'
        }), 400
    
    # Check cache first
    cache_key = f"sentiment_{ticker}"
    if cache_key in cache and (datetime.datetime.now() - cache[cache_key]['timestamp']).seconds < cache_duration:
        logger.info(f"Returning cached sentiment for {ticker}")
        return jsonify(cache[cache_key]['data'])
    
    try:
        # Use yfinance to get news and calculate sentiment
        logger.info(f"Fetching news and calculating sentiment for {ticker} using Yahoo Finance")
        
        # Get stock info and news
        stock = yf.Ticker(ticker)
        news_items = stock.news
        
        if news_items and len(news_items) > 0:
            # Calculate sentiment scores from news titles
            sentiments = []
            for item in news_items:
                title = item.get('title', '')
                if title:
                    sentiment = analyze_sentiment(title)
                    sentiments.append(sentiment['polarity'])
            
            # Calculate sentiment metrics
            if sentiments:
                avg_sentiment = sum(sentiments) / len(sentiments)
                # Normalize to a 0-1 scale (from -1 to 1)
                normalized_sentiment = (avg_sentiment + 1) / 2
                
                # Calculate buzz based on number of news items (normalized to 0-1)
                buzz = min(1.0, len(news_items) / 20)  # Normalize, max at 20 news items
                
                result = {
                    'buzz': round(buzz, 2),
                    'sentiment_score': round(normalized_sentiment, 2),
                    'sector_sentiment': 0.5  # Default value as sector data isn't readily available
                }
            else:
                raise Exception("No sentiment could be calculated from news")
        else:
            raise Exception("No news data available")
            
    except Exception as e:
        logger.warning(f"Error fetching sentiment: {e}, falling back to mock data")
        # Fallback to mock data
        if ticker in MOCK_DATA:
            result = MOCK_DATA[ticker]['sentiment']
        else:
            # Generate random sentiment for unknown tickers
            result = {
                'buzz': round(random.uniform(0.6, 0.95), 2),
                'sentiment_score': round(random.uniform(0.4, 0.7), 2),
                'sector_sentiment': 0.58  # Constant sector average
            }
    
    # Store in cache
    cache[cache_key] = {
        'timestamp': datetime.datetime.now(),
        'data': result
    }
    
    return jsonify(result)


@app.route('/api/stock_metrics', methods=['GET'])
def get_stock_metrics():
    """API endpoint to get stock key metrics"""
    # Clean cache periodically
    clean_cache()
    
    # Get and validate ticker
    ticker = request.args.get('ticker', 'AAPL').upper()
    if not validate_ticker(ticker):
        return jsonify({
            'error': 'Invalid ticker symbol format'
        }), 400
    
    # Check cache first
    cache_key = f"metrics_{ticker}"
    if cache_key in cache and (datetime.datetime.now() - cache[cache_key]['timestamp']).seconds < cache_duration:
        logger.info(f"Returning cached metrics for {ticker}")
        return jsonify(cache[cache_key]['data'])
    
    try:
        # Use yfinance to get stock metrics
        logger.info(f"Fetching metrics for {ticker} using Yahoo Finance")
        
        # Get stock info
        stock = yf.Ticker(ticker)
        info = stock.info
        
        # Extract key metrics
        metrics = {
            'sector': info.get('sector', 'N/A'),
            'exchange': info.get('exchange', 'N/A'),
            'pe': str(round(info.get('trailingPE', 0), 2)) if info.get('trailingPE') else 'N/A',
            'marketCap': format_market_cap(info.get('marketCap', 0)),
            'yearHigh': f"${info.get('fiftyTwoWeekHigh', 0):.2f}",
            'yearLow': f"${info.get('fiftyTwoWeekLow', 0):.2f}",
            'avgVolume': format_volume(info.get('averageVolume', 0)),
            'dividend': format_dividend(info.get('dividendRate', 0), info.get('dividendYield', 0)),
            'beta': str(round(info.get('beta', 0), 2)),
            'eps': f"${info.get('trailingEps', 0):.2f}" if info.get('trailingEps') else 'N/A'
        }
        
    except Exception as e:
        logger.warning(f"Error fetching metrics: {e}, falling back to mock data")
        # Fallback to mock data
        if ticker in MOCK_DATA:
            mock_data = MOCK_DATA[ticker]
            metrics = {
                'sector': mock_data.get('sector', 'N/A'),
                'exchange': mock_data.get('exchange', 'N/A'),
                'pe': str(mock_data.get('pe_ratio', 'N/A')),
                'marketCap': mock_data.get('market_cap', 'N/A'),
                'yearHigh': f"${mock_data.get('year_high', 0):.2f}",
                'yearLow': f"${mock_data.get('year_low', 0):.2f}",
                'avgVolume': mock_data.get('avg_volume', 'N/A'),
                'dividend': mock_data.get('dividend', 'N/A'),
                'beta': str(mock_data.get('beta', 'N/A')),
                'eps': f"${mock_data.get('eps', 0):.2f}" if mock_data.get('eps') else 'N/A'
            }
        else:
            # Default values for unknown tickers
            metrics = {
                'sector': 'Unknown',
                'exchange': 'NYSE',
                'pe': 'N/A',
                'marketCap': 'N/A',
                'yearHigh': 'N/A',
                'yearLow': 'N/A',
                'avgVolume': 'N/A',
                'dividend': 'N/A',
                'beta': 'N/A',
                'eps': 'N/A'
            }
    
    # Store in cache
    cache[cache_key] = {
        'timestamp': datetime.datetime.now(),
        'data': metrics
    }
    
    return jsonify(metrics)


# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Resource not found'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    def format_market_cap(market_cap):
        """Format market cap value into human-readable format"""
        if not market_cap:
            return 'N/A'
        
        if market_cap >= 1_000_000_000_000:  # Trillion
            return f"{market_cap / 1_000_000_000_000:.2f}T"
        elif market_cap >= 1_000_000_000:  # Billion
            return f"{market_cap / 1_000_000_000:.2f}B"
        elif market_cap >= 1_000_000:  # Million
            return f"{market_cap / 1_000_000:.2f}M"
        else:
            return f"{market_cap:.2f}"

    def format_volume(volume):
        """Format volume into human-readable format"""
        if not volume:
            return 'N/A'
        
        if volume >= 1_000_000_000:  # Billion
            return f"{volume / 1_000_000_000:.1f}B"
        elif volume >= 1_000_000:  # Million
            return f"{volume / 1_000_000:.1f}M"
        elif volume >= 1_000:  # Thousand
            return f"{volume / 1_000:.1f}K"
        else:
            return str(volume)

    def format_dividend(rate, yield_val):
        """Format dividend information"""
        if not rate:
            return 'N/A'
        
        if yield_val:
            return f"{rate:.2f} ({yield_val*100:.2f}%)"
        else:
            return f"{rate:.2f}"

    # Use environment variable PORT if available
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)