// import { NextRequest, NextResponse } from "next/server";
// import puppeteer, { Page } from "puppeteer";

// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);
//   const location = searchParams.get("location") || "houston-tx";
//   const url = `https://www.padsplit.com/rooms-for-rent/${location}`;

//   try {
//     // Launch browser with additional options to avoid detection
//     const browser = await puppeteer.launch({ 
//       headless: true,
//       args: [
//         '--no-sandbox', 
//         '--disable-setuid-sandbox',
//         '--disable-web-security',
//         '--disable-features=IsolateOrigins,site-per-process',
//         '--window-size=1920,1080',
//       ]
//     });
    
//     const page = await browser.newPage();

//     // Set a realistic user agent
//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
//     );

//     // Set extra HTTP headers to appear more like a real browser
//     await page.setExtraHTTPHeaders({
//       'Accept-Language': 'en-US,en;q=0.9',
//       'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
//       'Connection': 'keep-alive',
//       'Upgrade-Insecure-Requests': '1',
//       'Sec-Fetch-Dest': 'document',
//       'Sec-Fetch-Mode': 'navigate',
//       'Sec-Fetch-Site': 'none',
//       'Sec-Fetch-User': '?1',
//       'Cache-Control': 'max-age=0',
//     });

//     // Set viewport to a common desktop size
//     await page.setViewport({ width: 1920, height: 1080 });

//     // Enable JavaScript in the page
//     await page.setJavaScriptEnabled(true);

//     // Navigate to the page with a longer timeout
//     console.log(`Navigating to ${url}`);
//     await page.goto(url, { 
//       waitUntil: "networkidle2", 
//       timeout: 60000 
//     });

//     await new Promise((resolve) => setTimeout(resolve, 5000));

//     // Take a screenshot for debugging
//     await page.screenshot({ path: 'initial-load.png' });
//     console.log("Took initial screenshot");

//     // Scroll to load all listings
//     console.log("Starting auto-scroll");
//     await autoScroll(page);
//     console.log("Finished auto-scroll");

//     // Take another screenshot after scrolling
//     await page.screenshot({ path: 'after-scroll.png' });
//     console.log("Took post-scroll screenshot");

//     // Log the page title for debugging
//     const pageTitle = await page.title();
//     console.log("Page title:", pageTitle);

//     // First attempt: Try to find property cards using various selectors
//     console.log("Attempting to extract property data...");
    
//     // Extract Listings Data using multiple selector strategies
//     const listings = await page.evaluate(() => {
//       // Strategy 1: Look for elements with specific classes or attributes
//       const propertyCards = Array.from(document.querySelectorAll('[class*="property"], [class*="listing"], [class*="card"], [data-test-id*="property"]'));
      
//       // If no property cards found, try to find any container that might have listings
//       const containers = propertyCards.length > 0 ? propertyCards : Array.from(document.querySelectorAll('div[class*="container"], div[class*="grid"], div[class*="list"]'));
      
//       return containers.map(card => {
//         // Extract title using multiple possible selectors
//         let title = "No Title";
//         const titleSelectors = ['h1', 'h2', 'h3', 'h4', '[class*="title"]', '[class*="name"]', '[data-test-id*="title"]'];
//         for (const selector of titleSelectors) {
//           const titleEl = card.querySelector(selector);
//           if (titleEl && titleEl.textContent && titleEl.textContent.trim()) {
//             title = titleEl.textContent.trim();
//             break;
//           }
//         }
        
//         // Extract price using multiple possible selectors and patterns
//         let price = "No Price";
//         const priceSelectors = ['[class*="price"]', '[data-test-id*="price"]', 'span[class*="amount"]', 'div[class*="cost"]'];
//         for (const selector of priceSelectors) {
//           const priceEl = card.querySelector(selector);
//           if (priceEl && priceEl.textContent && priceEl.textContent.trim()) {
//             price = priceEl.textContent.trim();
//             break;
//           }
//         }
        
//         // If no price found using selectors, try to find price pattern in the text
//         if (price === "No Price") {
//           const allText = card.textContent || "";
//           const priceMatch = allText.match(/\$\d+(\.\d{2})?(\/mo|\/month|\/week|\/day)?/);
//           if (priceMatch) {
//             price = priceMatch[0];
//           }
//         }
        
//         // Extract address using multiple possible selectors
//         let address = "No Address";
//         const addressSelectors = ['[class*="address"]', '[class*="location"]', '[data-test-id*="address"]', '[data-test-id*="location"]'];
//         for (const selector of addressSelectors) {
//           const addressEl = card.querySelector(selector);
//           if (addressEl && addressEl.textContent && addressEl.textContent.trim()) {
//             address = addressEl.textContent.trim();
//             break;
//           }
//         }
        
//         // Extract availability info using multiple possible selectors
//         let roomsLeft = "No Info";
//         const availabilitySelectors = ['[class*="available"]', '[class*="rooms-left"]', '[class*="vacancy"]', '[data-test-id*="availability"]'];
//         for (const selector of availabilitySelectors) {
//           const availabilityEl = card.querySelector(selector);
//           if (availabilityEl && availabilityEl.textContent && availabilityEl.textContent.trim()) {
//             roomsLeft = availabilityEl.textContent.trim();
//             break;
//           }
//         }
        
//         // Extract image using multiple possible selectors
//         let image = "No Image";
//         const imageSelectors = ['img', '[class*="image"] img', '[class*="photo"] img', '[data-test-id*="image"] img'];
//         for (const selector of imageSelectors) {
//           const imageEl = card.querySelector(selector);
//           if (imageEl) {
//             // Try different image attributes
//             const possibleSrc = (imageEl as HTMLImageElement).src || 
//                                imageEl.getAttribute('data-src') || 
//                                imageEl.getAttribute('data-lazy-src') ||
//                                imageEl.getAttribute('srcset')?.split(' ')[0];
            
//             if (possibleSrc && !possibleSrc.includes('arrow-left') && !possibleSrc.includes('icon')) {
//               image = possibleSrc;
//               break;
//             }
//           }
//         }
        
//         // If no image found, look for background image in style
//         if (image === "No Image") {
//           const elementsWithBgImage = card.querySelectorAll('[style*="background-image"]');
//           for (const el of Array.from(elementsWithBgImage)) {
//             const style = el.getAttribute('style') || '';
//             const bgMatch = style.match(/url\(['"]?([^'"\)]+)['"]?\)/);
//             if (bgMatch && bgMatch[1]) {
//               image = bgMatch[1];
//               break;
//             }
//           }
//         }
        
//         // Extract link using multiple possible selectors
//         let link = "No Link";
//         const linkSelectors = ['a[href*="/rooms-for-rent/listing/"]', 'a[href*="property"]', 'a[href*="listing"]', 'a'];
//         for (const selector of linkSelectors) {
//           const linkEl = card.querySelector(selector);
//           if (linkEl) {
//             const href = linkEl.getAttribute('href');
//             if (href) {
//               link = href.startsWith('http') ? href : `https://www.padsplit.com${href}`;
//               break;
//             }
//           }
//         }
        
//         return { title, price, address, roomsLeft, image, link };
//       }).filter(item => {
//         // Filter out items that don't have meaningful data
//         return item.title !== "No Title" || 
//                item.price !== "No Price" || 
//                item.address !== "No Address" ||
//                item.image !== "No Image" ||
//                (item.link !== "No Link" && item.link !== "https://www.padsplit.com");
//       });
//     });
    
//     console.log(`Found ${listings.length} listings using primary extraction`);
    
//     // If we didn't find good listings, try a more aggressive approach
//     if (listings.length === 0 || listings.every(item => 
//       (item.title === "No Title" && item.price === "No Price") || 
//       item.image.includes('arrow-left')
//     )) {
//       console.log("Primary extraction failed, trying DOM snapshot approach...");
      
//       // Take a full page screenshot for debugging
//       await page.screenshot({ path: 'full-page.png', fullPage: true });
      
//       // Get the full HTML for analysis
//       const html = await page.content();
//       console.log("Page HTML sample:", html.substring(0, 500));
      
//       // Try to extract data from the entire DOM
//       const domSnapshot = await page.evaluate(() => {
//         // Function to extract text that looks like a price
//         const extractPrice = (text: string): string | null => {
//           const priceMatch = text.match(/\$\d+(\.\d{2})?(\/mo|\/month|\/week|\/day)?/);
//           return priceMatch ? priceMatch[0] : null;
//         };
        
//         // Function to check if an element might be a property card
//         interface PropertyCard {
//             title: string;
//             price: string;
//             address: string;
//             roomsLeft: string;
//             image: string;
//             link: string;
//         }

//         const mightBePropertyCard = (el: Element): boolean => {
//             // Check if it has an image
//             const hasImage = el.querySelector('img') !== null;
            
//             // Check if it has a link
//             const hasLink = el.querySelector('a') !== null;
            
//             // Check if it contains price-like text
//             const text = el.textContent || '';
//             const hasPrice = extractPrice(text) !== null;
            
//             // Check if it's reasonably sized (not too small)
//             const rect = el.getBoundingClientRect();
//             const hasSize = rect.width > 200 && rect.height > 200;
            
//             return hasImage && hasLink && (hasPrice || hasSize);
//         };
        
//         // Find all divs that might be property cards
//         const allDivs = Array.from(document.querySelectorAll('div'));
//         const potentialCards = allDivs.filter(mightBePropertyCard);
        
//         return potentialCards.map(card => {
//           // Extract all text from the card
//           const allText = card.textContent || '';
          
//           // Extract title - look for the first heading or first substantial text
//           let title = "No Title";
//           const headings = card.querySelectorAll('h1, h2, h3, h4, h5');
//           if (headings.length > 0) {
//             for (const heading of Array.from(headings)) {
//               const text = heading.textContent?.trim();
//               if (text && text.length > 5) {
//                 title = text;
//                 break;
//               }
//             }
//           }
          
//           // If no heading found, look for any substantial text block
//           if (title === "No Title") {
//             const paragraphs = card.querySelectorAll('p, div');
//             for (const p of Array.from(paragraphs)) {
//               const text = p.textContent?.trim();
//               if (text && text.length > 10 && text.length < 100) {
//                 title = text;
//                 break;
//               }
//             }
//           }
          
//           // Extract price from text
//           const price = extractPrice(allText) || "No Price";
          
//           // Try to find address-like text
//           let address = "No Address";
//           const paragraphs = card.querySelectorAll('p, div, span');
//           for (const p of Array.from(paragraphs)) {
//             const text = p.textContent?.trim();
//             if (text && (
//               text.includes('St') || 
//               text.includes('Ave') || 
//               text.includes('Rd') || 
//               text.includes('Blvd') ||
//               /[A-Z]{2}/.test(text) // State abbreviation
//             )) {
//               address = text;
//               break;
//             }
//           }
          
//           // Try to find availability info
//           let roomsLeft = "No Info";
//           const availabilityTexts = ['room', 'available', 'left', 'vacancy'];
//           for (const p of Array.from(paragraphs)) {
//             const text = p.textContent?.trim().toLowerCase();
//             if (text && availabilityTexts.some(term => text.includes(term))) {
//               roomsLeft = p.textContent?.trim() || "No Info";
//               break;
//             }
//           }
          
//           // Extract image
//           let image = "No Image";
//           const images = card.querySelectorAll('img');
//           for (const img of Array.from(images)) {
//             const src = img.src || img.getAttribute('data-src');
//             if (src && !src.includes('arrow') && !src.includes('icon')) {
//               image = src;
//               break;
//             }
//           }
          
//           // If no direct image found, check for background images
//           if (image === "No Image") {
//             const elementsWithStyle = card.querySelectorAll('[style*="background"]');
//             for (const el of Array.from(elementsWithStyle)) {
//               const style = el.getAttribute('style') || '';
//               const match = style.match(/url\(['"]?([^'"\)]+)['"]?\)/);
//               if (match && match[1]) {
//                 image = match[1];
//                 break;
//               }
//             }
//           }
          
//           // Extract link
//           let link = "No Link";
//           const links = card.querySelectorAll('a');
//           for (const a of Array.from(links)) {
//             const href = a.getAttribute('href');
//             if (href && (href.includes('/listing/') || href.includes('/rooms-for-rent/'))) {
//               link = href.startsWith('http') ? href : `https://www.padsplit.com${href}`;
//               break;
//             }
//           }
          
//           return { title, price, address, roomsLeft, image, link };
//         }).filter(item => {
//           // Filter out items that don't have meaningful data
//           return (item.title !== "No Title" || item.price !== "No Price") && 
//                  item.link !== "No Link" &&
//                  !item.image.includes('arrow-left');
//         });
//       });
      
//       console.log(`Found ${domSnapshot.length} listings using DOM snapshot approach`);
      
//       if (domSnapshot.length > 0) {
//         await browser.close();
//         return NextResponse.json({ success: true, data: domSnapshot });
//       }
      
//       // If we still don't have results, try one more approach: intercept network requests
//       console.log("DOM snapshot approach failed, trying network interception...");
      
//       // Create a new page for network interception
//       const interceptPage = await browser.newPage();
      
//       // Store JSON responses
//     let jsonData: { url: string; data: any }[] = [];
      
//       // Listen for all network responses
//       interceptPage.on('response', async (response) => {
//         const url = response.url();
//         const contentType = response.headers()['content-type'] || '';
        
//         // Check if this is a JSON API response that might contain listing data
//         if (contentType.includes('application/json') && 
//             (url.includes('api') || url.includes('listing') || url.includes('property'))) {
//           try {
//             const data = await response.json();
//             console.log("Intercepted JSON response from:", url);
//             jsonData.push({ url, data });
//           } catch (e) {
//             // Not valid JSON or couldn't be parsed
//           }
//         }
//       });
      
//       // Navigate to the page again
//       await interceptPage.setUserAgent(
//         "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
//       );
//       await interceptPage.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
      
//       // Scroll to trigger all network requests
//       await autoScroll(interceptPage);
      
//       // Wait a bit for any final requests
//       await new Promise((resolve) => setTimeout(resolve, 5000));
      
//       console.log(`Intercepted ${jsonData.length} JSON responses`);
      
//       // Process the intercepted JSON data to extract property information
//       if (jsonData.length > 0) {
//         // Try to find property data in the intercepted JSON
//         interface PropertyCard {
//             title: string;
//             price: string;
//             address: string;
//             roomsLeft: string;
//             image: string;
//             link: string;
//         }
//         const extractedProperties: PropertyCard[] = [];
        
//         for (const { url, data } of jsonData) {
//           console.log("Processing JSON from:", url);
          
//           // Function to recursively search for property-like objects in the JSON
//         interface PropertyCard {
//             title: string;
//             price: string;
//             address: string;
//             roomsLeft: string;
//             image: string;
//             link: string;
//         }

//         interface JsonData {
//             [key: string]: any;
//         }

//         const findProperties = (obj: JsonData, path: string = ''): void => {
//             if (!obj) return;

//             // If it's an array, process each item
//             if (Array.isArray(obj)) {
//                 obj.forEach((item, index) => findProperties(item, `${path}[${index}]`));
//                 return;
//             }

//             // If it's an object, check if it looks like a property listing
//             if (typeof obj === 'object') {
//                 // Check if this object has property-like fields
//                 const hasTitle = obj.title || obj.name || obj.propertyName;
//                 const hasPrice = obj.price || obj.cost || obj.rate;
//                 const hasAddress = obj.address || obj.location;
//                 const hasImage = obj.image || obj.photo || obj.thumbnail || obj.imageUrl;
//                 const hasLink = obj.link || obj.url || obj.href;

//                 // If it has some property-like fields, extract the data
//                 if (hasTitle || hasPrice || hasAddress || hasImage || hasLink) {
//                     const property: PropertyCard = {
//                         title: (obj.title || obj.name || obj.propertyName || "No Title").toString(),
//                         price: (obj.price || obj.cost || obj.rate || "No Price").toString(),
//                         address: (obj.address || obj.location || "No Address").toString(),
//                         roomsLeft: (obj.availability || obj.roomsLeft || obj.vacancy || "No Info").toString(),
//                         image: (obj.image || obj.photo || obj.thumbnail || obj.imageUrl || "No Image").toString(),
//                         link: (obj.link || obj.url || obj.href || "No Link").toString()
//                     };

//                     // Make sure the link is absolute
//                     if (property.link !== "No Link" && !property.link.startsWith('http')) {
//                         property.link = `https://www.padsplit.com${property.link}`;
//                     }

//                     extractedProperties.push(property);
//                 }

//                 // Continue searching in nested objects
//                 Object.keys(obj).forEach(key => {
//                     findProperties(obj[key], `${path}.${key}`);
//                 });
//             }
//         };
          
//           findProperties(data);
//         }
        
//         console.log(`Extracted ${extractedProperties.length} properties from JSON data`);
        
//         if (extractedProperties.length > 0) {
//           await browser.close();
//           return NextResponse.json({ 
//             success: true, 
//             data: extractedProperties.filter(p => 
//               p.title !== "No Title" || 
//               p.price !== "No Price" || 
//               p.image !== "No Image"
//             )
//           });
//         }
//       }
//     }

//     await browser.close();
    
//     // Return whatever listings we found, even if incomplete
//     return NextResponse.json({ 
//       success: true, 
//       data: listings.length > 0 ? listings : [{ 
//         title: "No listings found", 
//         price: "N/A", 
//         address: "Try a different location", 
//         roomsLeft: "N/A", 
//         image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80", 
//         link: "https://www.padsplit.com" 
//       }]
//     });
//   } catch (error: any) {
//     console.error("Scraping error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         message: "Failed to scrape data",
//         error: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }

// // Function to scroll page for lazy-loaded content
// async function autoScroll(page: Page) {
//   await page.evaluate(async () => {
//     await new Promise<void>((resolve) => {
//       let totalHeight = 0;
//       let distance = 300;
//       let scrolls = 0;
//       const maxScrolls = 30; // Limit scrolling to prevent infinite loops
      
//       const timer = setInterval(() => {
//         // Randomize scroll distance slightly to appear more human-like
//         const randomDistance = distance + Math.floor(Math.random() * 100) - 50;
//         window.scrollBy(0, randomDistance);
//         totalHeight += randomDistance;
//         scrolls++;
        
//         // Add random pauses occasionally
//         if (Math.random() < 0.3) {
//           // 30% chance of a longer pause
//           const randomPause = Math.floor(Math.random() * 1000) + 500;
//           setTimeout(() => {}, randomPause);
//         }

//         // Stop if we've reached the bottom or scrolled enough times
//         if (totalHeight >= document.body.scrollHeight - window.innerHeight || scrolls >= maxScrolls) {
//           clearInterval(timer);
//           resolve();
//         }
//       }, 800); // Slower scrolling to give content time to load
//     });
//   });
  
//   await new Promise((resolve) => setTimeout(resolve, 5000));
// }