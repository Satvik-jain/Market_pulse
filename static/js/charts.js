// static/js/charts.js
let priceChart;
let sentimentChart;
window.stockData = [];

function initPriceChart(stockData) {
    // Store the full dataset globally
    window.stockData = stockData;
    
    const ctx = document.getElementById('price-chart').getContext('2d');
    
    // If chart already exists, destroy it
    if (priceChart) {
        priceChart.destroy();
    }
    
    // Create new chart
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Stock Price',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 5,
                pointHitRadius: 30,
                data: [] // Will be populated in updateChartTimeRange
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price ($)'
                    },
                    beginAtZero: false
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return `Price: $${context.parsed.y.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
}

function updateChartTimeRange(days) {
    if (!window.stockData || window.stockData.length === 0) {
        return;
    }
    
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);
    
    // Filter data for the selected time range
    const filteredData = window.stockData.filter(d => {
        const dataDate = new Date(d.date);
        return dataDate >= startDate;
    });
    
    // Format data for Chart.js
    const chartData = filteredData.map(d => ({
        x: new Date(d.date),
        y: d.close
    }));
    
    // Update chart
    priceChart.data.datasets[0].data = chartData;
    priceChart.update();
}

function updateSentimentChart(bullishSentiment, sectorSentiment) {
    const ctx = document.getElementById('sentiment-chart').getContext('2d');
    
    // If chart already exists, destroy it
    if (sentimentChart) {
        sentimentChart.destroy();
    }
    
    // Convert to percentages
    const bullishPercentage = Math.round(bullishSentiment * 100);
    const sectorPercentage = Math.round(sectorSentiment * 100);
    
    sentimentChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Stock Sentiment', 'Sector Average'],
            datasets: [{
                label: 'Bullish Sentiment (%)',
                backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
                borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
                borderWidth: 1,
                data: [bullishPercentage, sectorPercentage]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Percentage (%)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y}%`;
                        }
                    }
                }
            }
        }
    });
}