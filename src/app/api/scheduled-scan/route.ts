import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { scanMarket } from '@/services/steamMarketService';
import Item from '@/models/Item';

// Vercel Cron Job (runs every 5 minutes)
export async function GET() {
  try {
    await dbConnect();
    
    // Get the max pages to scan from env or use default
    const maxPages = parseInt(process.env.MAX_PAGES_TO_SCAN || '10', 10);
    
    console.log(`Starting scheduled market scan of ${maxPages} pages...`);
    
    // Scan the market
    const matchingItems = await scanMarket(maxPages);
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      itemsFound: matchingItems.length
    });
  } catch (error) {
    console.error('Error in scheduled scan:', error);
    return NextResponse.json(
      { error: 'Failed to run scheduled scan' },
      { status: 500 }
    );
  }
} 