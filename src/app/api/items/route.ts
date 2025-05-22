import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Item from '@/models/Item';

export async function GET() {
  try {
    await dbConnect();
    
    // Set a timeout for the query (8 seconds to leave buffer for server processing)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database query timed out')), 8000);
    });
    
    // Create the find query with minimal projection, limit, and lean option for speed
    const queryPromise = Item.find(
      { isAvailable: true },
      { paintSeed: 1, floatValue: 1, price: 1, inspectLink: 1, imageUrl: 1, found: 1 }
    )
      .sort({ found: -1 })
      .limit(25) // Even smaller limit to avoid timeouts
      .lean() // Convert mongoose documents to plain objects for speed
      .exec();
    
    // Race between the timeout and the query
    const items = await Promise.race([queryPromise, timeoutPromise]) as any[];
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 