import axios from 'axios';
import puppeteer from 'puppeteer';
import Item from '../models/Item';
import { IItem } from '../models/Item';

// Target paint seeds we're looking for
const TARGET_PAINT_SEEDS = [16, 48, 66, 67, 96, 111, 117, 159, 259, 263, 273, 297, 308, 321, 324, 341, 347, 370, 426, 461, 482, 517, 530, 567, 587, 674, 695, 723, 764, 772, 781, 790, 792, 843, 880, 885, 904, 948, 990];

// Steam Market URL for Desert Eagle | Heat Treated (Minimal Wear)
const STEAM_MARKET_URL = 'https://steamcommunity.com/market/listings/730/Desert%20Eagle%20%7C%20Heat%20Treated%20(Minimal%20Wear)';

// Function to extract float value and paint seed from inspect link
async function getItemDetails(inspectLink: string): Promise<{ floatValue: number; paintSeed: number } | null> {
  try {
    // Launch browser in headless mode
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Navigate to a CS2 float checker service (example)
    await page.goto(`https://csfloat.com/?url=${encodeURIComponent(inspectLink)}`);
    
    // Wait for the information to load
    await page.waitForSelector('.float-value', { timeout: 10000 });
    
    // Extract the float value and paint seed
    const floatValue = await page.$eval('.float-value', (el) => parseFloat(el.textContent || '0'));
    const paintSeed = await page.$eval('.paint-seed', (el) => parseInt(el.textContent || '0', 10));
    
    await browser.close();
    
    return { floatValue, paintSeed };
  } catch (error) {
    console.error('Error getting item details:', error);
    return null;
  }
}

// Function to check if a listing has one of our target paint seeds
async function checkListing(inspectLink: string, price: string, imageUrl: string): Promise<IItem | null> {
  const itemDetails = await getItemDetails(inspectLink);
  
  if (!itemDetails) return null;
  
  const { floatValue, paintSeed } = itemDetails;
  
  // Check if the paint seed is in our target list
  if (TARGET_PAINT_SEEDS.includes(paintSeed)) {
    return {
      paintSeed,
      floatValue,
      price,
      inspectLink,
      imageUrl,
      found: new Date(),
      lastSeen: new Date(),
      isAvailable: true,
    } as IItem;
  }
  
  return null;
}

// Function to scrape a single page of listings
async function scrapePage(pageNumber: number): Promise<IItem[]> {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // Navigate to the Steam Market page with page number
    await page.goto(`${STEAM_MARKET_URL}#p${pageNumber}_popular_desc`);
    
    // Wait for listings to load
    await page.waitForSelector('.market_listing_row', { timeout: 10000 });
    
    // Extract listings
    const listings = await page.$$eval('.market_listing_row', (rows) => {
      return rows.map((row) => {
        const priceElement = row.querySelector('.market_listing_price');
        const imageElement = row.querySelector('.market_listing_item_img') as HTMLImageElement;
        const inspectButton = row.querySelector('.item_market_action_button') as HTMLAnchorElement;
        
        // Extract the price
        const price = priceElement ? priceElement.textContent?.trim() || '' : '';
        
        // Extract the image URL
        const imageUrl = imageElement ? imageElement.src || '' : '';
        
        // Extract the inspect link
        const inspectLink = inspectButton ? inspectButton.href || '' : '';
        
        return { price, imageUrl, inspectLink };
      });
    });
    
    await browser.close();
    
    // Check each listing for target paint seeds
    const matchingItems: IItem[] = [];
    for (const listing of listings) {
      if (listing.inspectLink) {
        const item = await checkListing(listing.inspectLink, listing.price, listing.imageUrl);
        if (item) {
          matchingItems.push(item);
        }
      }
    }
    
    return matchingItems;
  } catch (error) {
    console.error(`Error scraping page ${pageNumber}:`, error);
    return [];
  }
}

// Main function to scan the market
export async function scanMarket(maxPages: number = 10): Promise<IItem[]> {
  const allMatchingItems: IItem[] = [];
  
  for (let pageNumber = 1; pageNumber <= maxPages; pageNumber++) {
    console.log(`Scanning page ${pageNumber}...`);
    const pageItems = await scrapePage(pageNumber);
    
    if (pageItems.length > 0) {
      allMatchingItems.push(...pageItems);
      
      // Save items to the database
      for (const item of pageItems) {
        try {
          // Try to find an existing item with the same paint seed and float value
          const existingItem = await Item.findOne({
            paintSeed: item.paintSeed,
            floatValue: item.floatValue,
          });
          
          if (existingItem) {
            // Update the existing item
            existingItem.price = item.price;
            existingItem.lastSeen = new Date();
            existingItem.isAvailable = true;
            await existingItem.save();
          } else {
            // Create a new item
            await Item.create(item);
          }
        } catch (error) {
          console.error('Error saving item to database:', error);
        }
      }
    }
  }
  
  return allMatchingItems;
}

// Function to mark items as unavailable if they haven't been seen recently
export async function cleanupItems(hourThreshold: number = 24): Promise<void> {
  const thresholdDate = new Date();
  thresholdDate.setHours(thresholdDate.getHours() - hourThreshold);
  
  try {
    await Item.updateMany(
      { lastSeen: { $lt: thresholdDate } },
      { isAvailable: false }
    );
  } catch (error) {
    console.error('Error updating unavailable items:', error);
  }
}

export default {
  scanMarket,
  cleanupItems,
  TARGET_PAINT_SEEDS
}; 