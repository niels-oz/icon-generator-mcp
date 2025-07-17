import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface SearchResult {
  link: string;
  title: string;
  snippet: string;
}

export interface WebSearchConfig {
  apiKey?: string;
  searchEngineId?: string;
  maxResults: number;
  timeout: number;
}

export class WebImageSearchService {
  private config: WebSearchConfig;

  constructor(config?: Partial<WebSearchConfig>) {
    this.config = {
      apiKey: process.env.GOOGLE_SEARCH_API_KEY,
      searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
      maxResults: 3,
      timeout: 10000,
      ...config
    };
  }

  /**
   * Search for simple, SVG-friendly icons
   */
  async searchSimpleIcons(keyword: string): Promise<string[]> {
    try {
      // Build search query
      const query = this.buildSearchQuery(keyword);
      
      // Search for images
      const searchResults = await this.searchImages(query);
      
      // Filter for simple icons
      const filteredResults = this.filterSimpleIcons(searchResults);
      
      // Download images and return local paths
      const downloadPromises = filteredResults.slice(0, this.config.maxResults).map(
        (result, index) => this.downloadImage(result.link, `${keyword}-${index}`)
      );
      
      const downloadedPaths = await Promise.all(downloadPromises);
      
      return downloadedPaths.filter(path => path !== null) as string[];
    } catch (error) {
      throw new Error(`Web search failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build search query optimized for simple icons
   */
  buildSearchQuery(keyword: string): string {
    return `icon ${keyword} svg flat outline -photo -3d -gradient filetype:svg OR filetype:png`;
  }

  /**
   * Search Google Custom Search API for images
   */
  private async searchImages(query: string): Promise<SearchResult[]> {
    if (!this.config.apiKey || !this.config.searchEngineId) {
      throw new Error('Google Search API key and Search Engine ID are required');
    }

    const url = new URL('https://www.googleapis.com/customsearch/v1');
    url.searchParams.set('key', this.config.apiKey);
    url.searchParams.set('cx', this.config.searchEngineId);
    url.searchParams.set('q', query);
    url.searchParams.set('searchType', 'image');
    url.searchParams.set('num', '10'); // Get more results to filter from

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Search API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as { items?: SearchResult[] };
    return data.items || [];
  }

  /**
   * Filter search results for simple, SVG-friendly icons
   */
  filterSimpleIcons(items: SearchResult[]): SearchResult[] {
    return items.filter(item => {
      const url = item.link.toLowerCase();
      const title = item.title.toLowerCase();
      const snippet = item.snippet.toLowerCase();
      
      // Good indicators for simple icons
      const goodSigns = ['svg', 'vector', 'flat', 'simple', 'icon', 'outline'];
      const hasGoodSigns = goodSigns.some(sign => 
        url.includes(sign) || title.includes(sign) || snippet.includes(sign)
      );
      
      // Bad indicators for complex graphics
      const badSigns = ['photo', 'realistic', 'gradient', 'shadow', 'texture', '3d', 'render'];
      const hasBadSigns = badSigns.some(sign => 
        url.includes(sign) || title.includes(sign) || snippet.includes(sign)
      );
      
      // Only allow SVG and PNG formats (exclude JPG for MVP)
      const allowedFormats = ['.svg', '.png'];
      const hasAllowedFormat = allowedFormats.some(format => url.includes(format));
      
      // Exclude JPG/JPEG formats explicitly
      const excludedFormats = ['.jpg', '.jpeg'];
      const hasExcludedFormat = excludedFormats.some(format => url.includes(format));
      
      return hasGoodSigns && !hasBadSigns && hasAllowedFormat && !hasExcludedFormat;
    })
    .sort((a, b) => {
      // Prefer SVG and vector formats
      const aScore = this.getFormatScore(a.link) + this.getContentScore(a.title + ' ' + a.snippet);
      const bScore = this.getFormatScore(b.link) + this.getContentScore(b.title + ' ' + b.snippet);
      return bScore - aScore;
    });
  }

  /**
   * Score image format preference
   */
  private getFormatScore(url: string): number {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('.svg')) return 3;
    if (urlLower.includes('.png')) return 2;
    return 0;
  }

  /**
   * Score content relevance
   */
  private getContentScore(content: string): number {
    const contentLower = content.toLowerCase();
    let score = 0;
    
    if (contentLower.includes('vector')) score += 2;
    if (contentLower.includes('svg')) score += 2;
    if (contentLower.includes('flat')) score += 1;
    if (contentLower.includes('simple')) score += 1;
    if (contentLower.includes('outline')) score += 1;
    
    return score;
  }

  /**
   * Download image to temporary file with original format preserved
   */
  private async downloadImage(url: string, baseName: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn(`Failed to download image from ${url}: ${response.status}`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Detect format from URL
      const format = this.detectFormatFromUrl(url);
      if (!format) {
        console.warn(`Unable to detect format from URL: ${url}`);
        return null;
      }
      
      // Generate temporary file path with correct extension
      const tempDir = os.tmpdir();
      const fileName = `${baseName}-${Date.now()}.${format}`;
      const filePath = path.join(tempDir, fileName);
      
      // Write file
      fs.writeFileSync(filePath, buffer);
      
      return filePath;
    } catch (error) {
      console.warn(`Failed to download image from ${url}:`, error);
      return null;
    }
  }

  /**
   * Detect image format from URL
   */
  private detectFormatFromUrl(url: string): string | null {
    const urlLower = url.toLowerCase();
    
    if (urlLower.includes('.svg')) return 'svg';
    if (urlLower.includes('.png')) return 'png';
    
    // For MVP, only support SVG and PNG
    return null;
  }
}