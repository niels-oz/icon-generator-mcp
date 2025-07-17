import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { WebImageSearchService } from '../../src/services/web-search';

// Mock the global fetch function
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe('WebImageSearchService', () => {
  let service: WebImageSearchService;

  beforeEach(() => {
    service = new WebImageSearchService({
      apiKey: 'test-api-key',
      searchEngineId: 'test-search-engine-id'
    });
    mockFetch.mockClear();
  });

  describe('searchSimpleIcons', () => {
    it('should search for simple icons with proper query format', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          items: [
            {
              link: 'https://example.com/star-icon.svg',
              title: 'Star Icon SVG',
              snippet: 'Simple star icon svg'
            },
            {
              link: 'https://example.com/star-outline.png', 
              title: 'Star Outline Icon',
              snippet: 'Outlined star icon flat'
            }
          ]
        })
      };

      mockFetch.mockResolvedValueOnce(mockResponse as any);
      
      // Mock the image download calls
      const imageResponse = { ok: true, arrayBuffer: async () => new ArrayBuffer(1024) };
      mockFetch.mockResolvedValue(imageResponse as any);

      const result = await service.searchSimpleIcons('star');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('icon+star+svg+flat+outline+-photo+-3d+-gradient+filetype%3Asvg+OR+filetype%3Apng')
      );
      expect(result).toHaveLength(2);
      expect(result[0]).toMatch(/.*star.*\.(svg|png)$/);
    });

    it('should limit results to 3 items', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          items: Array(10).fill(null).map((_, i) => ({
            link: `https://example.com/icon-${i}.svg`,
            title: `Icon ${i} SVG`,
            snippet: `Simple icon ${i} vector`
          }))
        })
      };

      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await service.searchSimpleIcons('star');

      expect(result).toHaveLength(3);
    });

    it('should handle search API failures gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.searchSimpleIcons('star'))
        .rejects.toThrow('Web search failed: API Error');
    });

    it('should filter out non-icon results', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          items: [
            {
              link: 'https://example.com/photo.jpg',
              title: 'Photo of stars',
              snippet: 'Realistic photo'
            },
            {
              link: 'https://example.com/star-icon.svg',
              title: 'Star Icon SVG',
              snippet: 'Simple star icon vector'
            }
          ]
        })
      };

      mockFetch.mockResolvedValueOnce(mockResponse as any);

      const result = await service.searchSimpleIcons('star');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatch(/star-.*\.(svg|png)$/);
    });

    it('should download images and return local file paths', async () => {
      const mockSearchResponse = {
        ok: true,
        json: async () => ({
          items: [
            {
              link: 'https://example.com/star-icon.svg',
              title: 'Star Icon SVG',
              snippet: 'Simple icon vector'
            }
          ]
        })
      };

      const mockImageResponse = {
        ok: true,
        arrayBuffer: async () => new ArrayBuffer(1024)
      };

      mockFetch
        .mockResolvedValueOnce(mockSearchResponse as any)
        .mockResolvedValueOnce(mockImageResponse as any);

      const result = await service.searchSimpleIcons('star');

      expect(result).toHaveLength(1);
      expect(result[0]).toMatch(/.*\.(svg|png)$/);
    });
  });

  describe('buildSearchQuery', () => {
    it('should build proper search query with file type restrictions', () => {
      const query = service.buildSearchQuery('star');
      
      expect(query).toBe('icon star svg flat outline -photo -3d -gradient filetype:svg OR filetype:png');
    });

    it('should handle multi-word keywords', () => {
      const query = service.buildSearchQuery('shopping cart');
      
      expect(query).toBe('icon shopping cart svg flat outline -photo -3d -gradient filetype:svg OR filetype:png');
    });
  });

  describe('filterSimpleIcons', () => {
    it('should filter out photos, complex graphics, and JPG files', () => {
      const items = [
        { link: 'photo.jpg', title: 'Photo of star', snippet: 'Realistic photo' },
        { link: 'render.png', title: '3D render', snippet: '3D star render' },
        { link: 'icon.svg', title: 'Star icon', snippet: 'Simple icon' },
        { link: 'star.jpeg', title: 'Star JPEG', snippet: 'Star icon jpeg' }
      ];

      const filtered = service.filterSimpleIcons(items);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].title).toBe('Star icon');
    });

    it('should prefer svg and vector formats over png', () => {
      const items = [
        { link: 'icon.png', title: 'PNG Icon', snippet: 'Simple icon' },
        { link: 'vector.svg', title: 'Vector icon', snippet: 'Vector icon' }
      ];

      const filtered = service.filterSimpleIcons(items);

      expect(filtered[0].title).toBe('Vector icon');
    });

    it('should exclude JPG/JPEG files completely', () => {
      const items = [
        { link: 'star.jpg', title: 'Star icon', snippet: 'Simple star icon' },
        { link: 'star.jpeg', title: 'Star icon JPEG', snippet: 'Simple star icon' }
      ];

      const filtered = service.filterSimpleIcons(items);

      expect(filtered).toHaveLength(0);
    });
  });
});