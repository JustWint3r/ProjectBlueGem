import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { scanMarket, cleanupItems } from '@/services/steamMarketService';

export async function POST() {
  try {
    await dbConnect();
    
    // Start a scan of the market
    const matchingItems = await scanMarket(10); // Scan 10 pages
    
    // Cleanup old items
    await cleanupItems();
    
    return NextResponse.json({
      success: true,
      itemsFound: matchingItems.length,
      items: matchingItems
    });
  } catch (error) {
    console.error('Error scanning market:', error);
    return NextResponse.json(
      { error: 'Failed to scan market' },
      { status: 500 }
    );
  }
} 