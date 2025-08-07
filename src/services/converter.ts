import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { spawn, execSync } from 'child_process';
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
    
    // Create temporary BMP file using cross-platform temp directory
    const tempBmpPath = path.join(os.tmpdir(), `temp-${Date.now()}.bmp`);
    
    try {
      // Convert PNG to BMP using Jimp
      const image = await Jimp.read(pngPath);
      await image.writeAsync(tempBmpPath);
      
      // Execute potrace to convert BMP to SVG with enhanced error handling
      const svgOutput = await this.executePotrace(potracePath, tempBmpPath);
      
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
      const potracePath = execSync('which potrace', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe']
      }).trim();
      if (!potracePath) {
        throw new Error('Potrace not found');
      }
      return potracePath;
    } catch (error) {
      const err = error as any;
      if (err.code === 'ENOENT') {
        throw new Error('Potrace not found in PATH. Please install with: brew install potrace');
      }
      throw new Error(`Failed to locate potrace binary: ${err.message || 'Unknown error'}`);
    }
  }

  /**
   * Execute potrace command with enhanced error handling
   */
  private async executePotrace(potracePath: string, bmpPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const args = ['--svg', '--output=-', bmpPath];
      const process = spawn(potracePath, args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          if (!stdout.trim()) {
            reject(new Error('Potrace produced no output'));
            return;
          }
          resolve(stdout);
        } else {
          const errorMessage = stderr.trim() || `Potrace exited with code ${code}`;
          reject(new Error(`Potrace conversion failed: ${errorMessage}`));
        }
      });

      process.on('error', (error) => {
        reject(new Error(`Failed to execute potrace: ${error.message}`));
      });

      // Set timeout for the process
      const timeout = setTimeout(() => {
        process.kill('SIGTERM');
        reject(new Error('Potrace conversion timed out after 30 seconds'));
      }, 30000);

      process.on('close', () => {
        clearTimeout(timeout);
      });
    });
  }
}