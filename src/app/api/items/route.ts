import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Item from '@/models/Item';

export async function GET() {
  try {
    await dbConnect();
    
    // Get all available items, sorted by newest first
    // Using projection to select only needed fields and limiting to 50 items
    const items = await Item.find(
      { isAvailable: true },
      { paintSeed: 1, floatValue: 1, price: 1, inspectLink: 1, imageUrl: 1, found: 1 }
    )
      .sort({ found: -1 })
      .limit(50);
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
} 