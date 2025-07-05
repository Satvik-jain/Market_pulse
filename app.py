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

app = Flask(__name__)

# Cache to minimize API calls
cache = {}
cache_duration = 300  # 5 minutes

# API keys - these are placeholders, but the app will work even if APIs are down

ALPHAVANTAGE_API_KEY = "ORRBTEBWNMRKM9JY"  
NEWS_API_KEY = "86faaf4a4ee8490cade873e97b4721d3"
FINNHUB_API_KEY = "d1k2a31r01ql1h3a7gjgd1k2a31r01ql1h3a7gk0"

# Define helper functions first
def generate_mock_stock_data(ticker, days=365):
    """Generate realistic mock stock data for demo purposes"""
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
    """Generate mock news articles for demo purposes"""
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
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/api/stock_data', methods=['GET'])
def get_stock_data():
    ticker = request.args.get('ticker', 'AAPL').upper()
    
    # Check cache first
    cache_key = f"stock_data_{ticker}"
    if cache_key in cache and (datetime.datetime.now() - cache[cache_key]['timestamp']).seconds < cache_duration:
        return jsonify(cache[cache_key]['data'])
    
    try:
        # Try to get real data from Alpha Vantage
        url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={ticker}&apikey={ALPHAVANTAGE_API_KEY}"
        response = requests.get(url, timeout=5)
        stock_data = response.json()
        
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
            raise Exception("No data from API")
            
    except Exception as e:
        print(f"Error fetching stock data: {e}")
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
    ticker = request.args.get('ticker', 'AAPL').upper()
    
    # Check cache first
    cache_key = f"news_{ticker}"
    if cache_key in cache and (datetime.datetime.now() - cache[cache_key]['timestamp']).seconds < cache_duration:
        return jsonify(cache[cache_key]['data'])
    
    try:
        # Try to get real data from News API
        company_name = get_company_name(ticker)
        url = f"https://newsapi.org/v2/everything?q={company_name}&apiKey={NEWS_API_KEY}&pageSize=10"
        response = requests.get(url, timeout=5)
        news_data = response.json()
        
        # Process news and analyze sentiment
        articles = []
        if 'articles' in news_data and len(news_data['articles']) > 0:
            for article in news_data['articles'][:10]:  # Limit to 10 articles
                sentiment = analyze_sentiment(article['title'] + " " + (article['description'] or ""))
                articles.append({
                    'title': article['title'],
                    'source': article['source']['name'],
                    'url': article['url'],
                    'publishedAt': article['publishedAt'],
                    'sentiment': sentiment['polarity'],
                    'sentiment_label': sentiment['label']
                })
        else:
            # If API call fails or no data, use mock data
            raise Exception("No news data from API")
            
    except Exception as e:
        print(f"Error fetching news: {e}")
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

@app.route('/api/stock_sentiment', methods=['GET'])
def get_stock_sentiment():
    ticker = request.args.get('ticker', 'AAPL').upper()
    
    # Check cache first
    cache_key = f"sentiment_{ticker}"
    if cache_key in cache and (datetime.datetime.now() - cache[cache_key]['timestamp']).seconds < cache_duration:
        return jsonify(cache[cache_key]['data'])
    
    try:
        # Try to get real data from Finnhub
        url = f"https://finnhub.io/api/v1/news-sentiment?symbol={ticker}&token={FINNHUB_API_KEY}"
        response = requests.get(url, timeout=5)
        sentiment_data = response.json()
        
        # Process sentiment data
        if 'sentiment' in sentiment_data:
            result = {
                'buzz': sentiment_data.get('buzz', {}).get('buzz', 0),
                'sentiment_score': sentiment_data.get('sentiment', {}).get('bullishPercent', 0),
                'sector_sentiment': sentiment_data.get('sectorAverageBullishPercent', 0)
            }
        else:
            # If API call fails or no data, use mock data
            raise Exception("No sentiment data from API")
            
    except Exception as e:
        print(f"Error fetching sentiment: {e}")
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

def get_company_name(ticker):
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

def analyze_sentiment(text):
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

if __name__ == '__main__':
    app.run(debug=True)