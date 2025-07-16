import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import Jimp from 'jimp';

export class ConversionService {
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  
  async convertPNGToSVG(pngPath: string): Promise<string> {
    // Validate file exists
    if (!fs.existsSync(pngPath)) {
      throw new Error(`File not found: ${pngPath}`);
    }

    // Check file size
    const stats = fs.statSync(pngPath);
    if (stats.size > this.MAX_FILE_SIZE) {
      throw new Error(`File too large: ${pngPath}. Maximum size is ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    // Validate PNG format using Jimp
    try {
      const image = await Jimp.read(pngPath);
      if (!image) {
        throw new Error('Invalid PNG format');
      }
    } catch (error) {
      throw new Error(`Invalid PNG format: ${pngPath}`);
    }

    // Find potrace binary
    const potracePath = this.findPotraceBinary();
    
    // Create temporary BMP file
    const tempBmpPath = path.join('/tmp', `temp-${Date.now()}.bmp`);
    
    try {
      // Convert PNG to BMP using Jimp
      const image = await Jimp.read(pngPath);
      await image.writeAsync(tempBmpPath);
      
      // Execute potrace to convert BMP to SVG
      const svgOutput = execSync(`${potracePath} -s "${tempBmpPath}" -o -`, { 
        encoding: 'utf8',
        timeout: 30000 // 30 second timeout
      });
      
      // Clean up temporary file
      if (fs.existsSync(tempBmpPath)) {
        fs.unlinkSync(tempBmpPath);
      }
      
      return svgOutput;
    } catch (error) {
      // Clean up temporary file on error
      if (fs.existsSync(tempBmpPath)) {
        fs.unlinkSync(tempBmpPath);
      }
      throw new Error(`Potrace conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  findPotraceBinary(): string {
    try {
      const potracePath = execSync('which potrace', { encoding: 'utf8' }).trim();
      if (!potracePath) {
        throw new Error('Potrace not found');
      }
      return potracePath;
    } catch (error) {
      throw new Error('Potrace not found in PATH. Please install with: brew install potrace');
    }
  }
}