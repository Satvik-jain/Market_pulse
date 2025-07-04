# app.py
from flask import Flask, render_template, request, jsonify
import os
import requests
import json
import datetime
from textblob import TextBlob
import pandas as pd

app = Flask(__name__)

# Cache to minimize API calls
cache = {}
cache_duration = 300  # 5 minutes

# API keys (in a real project, store these securely)
ALPHAVANTAGE_API_KEY = "ORRBTEBWNMRKM9JY"  
NEWS_API_KEY = "86faaf4a4ee8490cade873e97b4721d3"
FINNHUB_API_KEY = "d1k2a31r01ql1h3a7gjgd1k2a31r01ql1h3a7gk0"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/api/stock_data', methods=['GET'])
def get_stock_data():
    ticker = request.args.get('ticker', 'AAPL')
    
    # Check cache first
    cache_key = f"stock_data_{ticker}"
    if cache_key in cache and (datetime.datetime.now() - cache[cache_key]['timestamp']).seconds < cache_duration:
        return jsonify(cache[cache_key]['data'])
    
    # Get stock price data from Alpha Vantage
    url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={ticker}&apikey={ALPHAVANTAGE_API_KEY}"
    response = requests.get(url)
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
    
    # Store in cache
    cache[cache_key] = {
        'timestamp': datetime.datetime.now(),
        'data': processed_data
    }
    
    return jsonify(processed_data)

@app.route('/api/company_news', methods=['GET'])
def get_company_news():
    ticker = request.args.get('ticker', 'AAPL')
    
    # Check cache first
    cache_key = f"news_{ticker}"
    if cache_key in cache and (datetime.datetime.now() - cache[cache_key]['timestamp']).seconds < cache_duration:
        return jsonify(cache[cache_key]['data'])
    
    # Get news data from News API
    company_name = get_company_name(ticker)
    url = f"https://newsapi.org/v2/everything?q={company_name}&apiKey={NEWS_API_KEY}&pageSize=10"
    response = requests.get(url)
    news_data = response.json()
    
    # Process news and analyze sentiment
    articles = []
    if 'articles' in news_data:
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
    
    # Store in cache
    cache[cache_key] = {
        'timestamp': datetime.datetime.now(),
        'data': articles
    }
    
    return jsonify(articles)

@app.route('/api/stock_sentiment', methods=['GET'])
def get_stock_sentiment():
    ticker = request.args.get('ticker', 'AAPL')
    
    # Check cache first
    cache_key = f"sentiment_{ticker}"
    if cache_key in cache and (datetime.datetime.now() - cache[cache_key]['timestamp']).seconds < cache_duration:
        return jsonify(cache[cache_key]['data'])
    
    # Get social sentiment from Finnhub
    url = f"https://finnhub.io/api/v1/news-sentiment?symbol={ticker}&token={FINNHUB_API_KEY}"
    response = requests.get(url)
    sentiment_data = response.json()
    
    # Process sentiment data
    result = {
        'buzz': sentiment_data.get('buzz', {}).get('buzz', 0),
        'sentiment_score': sentiment_data.get('sentiment', {}).get('bullishPercent', 0),
        'sector_sentiment': sentiment_data.get('sectorAverageBullishPercent', 0)
    }
    
    # Store in cache
    cache[cache_key] = {
        'timestamp': datetime.datetime.now(),
        'data': result
    }
    
    return jsonify(result)

def get_company_name(ticker):
    # Map ticker to company name (simplified)
    company_map = {
        'AAPL': 'Apple',
        'MSFT': 'Microsoft',
        'GOOGL': 'Google',
        'AMZN': 'Amazon',
        'META': 'Facebook',
        'TSLA': 'Tesla'
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