import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Item from '@/models/Item';

export async function GET() {
  try {
    await dbConnect();
    
    // Get all available items, sorted by newest first
    const items = await Item.find({ isAvailable: true })
      .sort({ found: -1 })
      .limit(100);
    
    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
} 