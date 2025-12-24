import express from 'express';

const router = express.Router();

// Cache for stock quotes (15 second TTL)
let cache = { data: null, timestamp: 0 };

async function fetchYahooQuote(symbol) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Yahoo Finance API returned ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('Invalid response from Yahoo Finance');
    }

    const result = data.chart.result[0];
    const meta = result.meta;

    const price = meta.regularMarketPrice || meta.previousClose;
    const previousClose = meta.chartPreviousClose || meta.previousClose;
    const change = price - previousClose;
    const changePercent = (change / previousClose) * 100;

    return {
      symbol: meta.symbol,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      previousClose: parseFloat(previousClose.toFixed(2)),
      timestamp: new Date(meta.regularMarketTime * 1000).toISOString()
    };
  } catch (error) {
    console.error('Error fetching Yahoo quote:', error);
    throw error;
  }
}

router.get('/quote', async (req, res) => {
  try {
    const { symbol = 'QTZM' } = req.query;
    const now = Date.now();

    // Return cached data if less than 15 seconds old
    if (cache.data && cache.data.symbol === symbol && (now - cache.timestamp) < 15000) {
      return res.json(cache.data);
    }

    const quote = await fetchYahooQuote(symbol);
    
    // Update cache
    cache = {
      data: quote,
      timestamp: now
    };

    res.json(quote);
  } catch (error) {
    console.error('Stock quote error:', error);
    
    // Return cached data if available, even if expired
    if (cache.data) {
      return res.json({ ...cache.data, stale: true });
    }

    res.status(500).json({ 
      error: 'Failed to fetch stock quote',
      message: error.message 
    });
  }
});

export default router;