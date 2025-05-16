import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { cleanupItems } from '@/services/steamMarketService';

// Vercel Cron Job (runs every 6 hours)
export async function GET() {
  try {
    await dbConnect();
    
    // Default: Mark items that haven't been seen in 24 hours as unavailable
    const hourThreshold = 24;
    
    console.log(`Cleaning up items older than ${hourThreshold} hours...`);
    
    // Run the cleanup
    await cleanupItems(hourThreshold);
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: `Cleanup completed for items not seen in ${hourThreshold} hours`
    });
  } catch (error) {
    console.error('Error in cleanup job:', error);
    return NextResponse.json(
      { error: 'Failed to run cleanup job' },
      { status: 500 }
    );
  }
} 