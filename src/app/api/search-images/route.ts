import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { query, engine = 'google' } = await request.json();

    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    console.log(`Searching ${engine} for: "${query}"`);

    // Use EXACT query - no modifications
    const searchQuery = encodeURIComponent(query);
    
    if (engine === 'google') {
      return await searchGoogleImages(searchQuery, query);
    } else {
      return await searchBingImages(searchQuery, query);
    }

  } catch (error) {
    console.error('Error searching images:', error);
    return NextResponse.json(
      { error: 'Failed to search images' },
      { status: 500 }
    );
  }
}

async function searchGoogleImages(searchQuery: string, originalQuery: string) {
  try {
    // Multiple Google Images approaches
    const approaches = [
      // Standard Google Images
      `https://www.google.com/search?q=${searchQuery}&tbm=isch&safe=off`,
      // Google Images with different parameters
      `https://www.google.com/search?q=${searchQuery}&tbm=isch&safe=off&source=lnms`,
      // Alternative Google Images URL
      `https://images.google.com/search?q=${searchQuery}&safe=off`
    ];
    
    for (let i = 0; i < approaches.length; i++) {
      const googleUrl = approaches[i];
      console.log(`Trying Google approach ${i + 1}: ${googleUrl}`);
      
      try {
        const response = await fetch(googleUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
          }
        });

        console.log(`Google response status: ${response.status}`);
        
        if (response.ok) {
          const html = await response.text();
          console.log(`Google HTML length: ${html.length}`);
          
          // Try multiple regex patterns for Google
          const patterns = [
            /"ou":"([^"]+)"/g,  // Standard pattern
            /"ow":(\d+),"pt":"([^"]+)"/g,  // Alternative pattern
            /\["([^"]*\.(?:jpg|jpeg|png|webp)[^"]*)",\d+,\d+\]/g  // Another pattern
          ];
          
          for (const pattern of patterns) {
            const imageMatches = html.match(pattern);
            
            if (imageMatches && imageMatches.length > 0) {
              console.log(`Found ${imageMatches.length} matches with pattern ${pattern}`);
              
              let imageUrls: string[] = [];
              
              if (pattern === patterns[0]) {
                imageUrls = imageMatches
                  .map(match => match.match(/"ou":"([^"]+)"/)?.[1])
                  .filter(Boolean) as string[];
              } else if (pattern === patterns[1]) {
                imageUrls = imageMatches
                  .map(match => match.match(/"pt":"([^"]+)"/)?.[1])
                  .filter(Boolean) as string[];
              } else {
                imageUrls = imageMatches
                  .map(match => match.match(/\["([^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/)?.[1])
                  .filter(Boolean) as string[];
              }
              
              imageUrls = imageUrls
                .filter(url => url && url.length < 800 && !url.includes('data:image') && url.startsWith('http'))
                .slice(0, 12);

              if (imageUrls.length > 0) {
                console.log(`Successfully extracted ${imageUrls.length} Google images`);
                return NextResponse.json({
                  images: imageUrls.map((url, index) => ({
                    id: index,
                    url: url,
                    thumbnail: url
                  })),
                  searchEngine: 'google',
                  actualQuery: originalQuery,
                  approach: i + 1
                });
              }
            }
          }
        }
      } catch (fetchError) {
        console.error(`Google approach ${i + 1} failed:`, fetchError);
        continue;
      }
    }
    
    console.log('All Google search approaches failed');
    return NextResponse.json({
      images: [],
      error: 'Google search failed - all approaches exhausted',
      searchEngine: 'google',
      actualQuery: originalQuery
    });
    
  } catch (error) {
    console.error('Google search error:', error);
    return NextResponse.json({
      images: [],
      error: `Google search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      searchEngine: 'google',
      actualQuery: originalQuery
    });
  }
}

async function searchBingImages(searchQuery: string, originalQuery: string) {
  try {
    // Bing Images search with Safe Search OFF
    const bingUrl = `https://www.bing.com/images/search?q=${searchQuery}&adlt=off&form=HDRSC2`;
    
    console.log(`Bing URL: ${bingUrl}`);
    
    const response = await fetch(bingUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (response.ok) {
      const html = await response.text();
      
      // Extract image URLs from Bing Images results
      const imageMatches = html.match(/murl&quot;:&quot;([^&]+)&quot;/g);
      
      if (imageMatches && imageMatches.length > 0) {
        const imageUrls = imageMatches
          .slice(0, 16)
          .map(match => match.match(/murl&quot;:&quot;([^&]+)&quot;/)?.[1])
          .filter(Boolean)
          .map(url => decodeURIComponent(url || ''))
          .filter(url => {
            if (!url) return false;
            // Much more lenient filtering
            return url.length < 800 && !url.includes('data:image');
          })
          .slice(0, 12);

        if (imageUrls.length > 0) {
          console.log(`Found ${imageUrls.length} Bing images`);
          return NextResponse.json({
            images: imageUrls.map((url, index) => ({
              id: index,
              url: url,
              thumbnail: url
            })),
            searchEngine: 'bing',
            actualQuery: originalQuery
          });
        }
      }
    }
    
    console.log('Bing search failed or no results');
    throw new Error('Bing search failed');
    
  } catch (error) {
    console.error('Bing search error:', error);
    return NextResponse.json({
      images: [],
      error: `Bing search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      searchEngine: 'bing',
      actualQuery: originalQuery
    });
  }
}
