import { ExtractedInfo } from '@/types/bookmark';

// Universal extraction function - works for all URLs using webpage extraction
export async function extractLinkInfo(url: string): Promise<ExtractedInfo> {
  try {
    // Use the robust webpage extraction for all URLs
    const response = await fetch(`/api/extract-webpage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        title: data.title || new URL(url).hostname,
        thumbnail: data.image || '/api/placeholder/400/300',
        description: data.description
      };
    }
  } catch (error) {
    console.error('Error extracting link info:', error);
  }

  // Fallback
  return {
    title: new URL(url).hostname,
    thumbnail: '/api/placeholder/400/300'
  };
}

// Helper function to get domain name for display
export function getDomainName(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return 'Unknown';
  }
}
