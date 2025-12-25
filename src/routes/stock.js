import express from 'express';

const router = express.Router();

// Get stock quote from Yahoo Finance
router.get('/quote', async (req, res) => {
  try {
    const { symbol = 'QTZM' } = req.query;
    const upperSymbol = symbol.toUpperCase();

    // Fetch real-time data from Yahoo Finance API
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${upperSymbol}?interval=1d&range=1d`;
    
    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Extract quote data from Yahoo Finance response
    const result = data.chart?.result?.[0];
    if (!result || !result.meta) {
      throw new Error('Invalid response from Yahoo Finance');
    }

    const meta = result.meta;
    const regularMarketPrice = meta.regularMarketPrice || meta.previousClose || 0;
    const previousClose = meta.previousClose || regularMarketPrice;
    const change = regularMarketPrice - previousClose;
    const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

    const quote = {
      symbol: upperSymbol,
      price: parseFloat(regularMarketPrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2))
    };

    res.json(quote);
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    
    // Fallback to previous close if available, or return error
    res.status(500).json({ 
      error: 'Failed to fetch stock quote',
      message: error.message 
    });
  }
});

export default router;

