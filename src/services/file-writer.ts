import * as fs from 'fs';
import * as path from 'path';

export interface SaveResult {
  success: boolean;
  outputPath?: string;
  error?: string;
}

export class FileWriterService {
  /**
   * Sanitize filename to remove invalid filesystem characters
   */
  sanitizeFilename(filename: string): string {
    // Replace invalid characters with dash
    let sanitized = filename.replace(/[<>:"|*?/\\'/]/g, '-');
    
    // Replace multiple consecutive dashes with single dash
    sanitized = sanitized.replace(/-+/g, '-');
    
    // Replace spaces with dashes
    sanitized = sanitized.replace(/\s+/g, '-');
    
    // Remove leading/trailing dashes
    sanitized = sanitized.replace(/^-+|-+$/g, '');
    
    // If filename is empty or only invalid chars, use fallback
    if (!sanitized || sanitized.length === 0) {
      sanitized = 'generated-icon';
    }
    
    return sanitized;
  }

  /**
   * Generate output path based on filename and reference PNG location
   */
  generateOutputPath(filename: string, referencePngPath: string): string {
    const sanitizedFilename = this.sanitizeFilename(filename);
    const referenceDir = path.dirname(referencePngPath);
    
    // Ensure .svg extension
    const finalFilename = sanitizedFilename.endsWith('.svg') 
      ? sanitizedFilename 
      : `${sanitizedFilename}.svg`;
    
    return path.join(referenceDir, finalFilename);
  }

  /**
   * Resolve filename conflicts by appending index numbers
   */
  resolveNameConflicts(filePath: string): string {
    if (!fs.existsSync(filePath)) {
      return filePath;
    }

    const dir = path.dirname(filePath);
    const ext = path.extname(filePath);
    const baseName = path.basename(filePath, ext);

    let counter = 2;
    let resolvedPath: string;

    do {
      resolvedPath = path.join(dir, `${baseName}-${counter}${ext}`);
      counter++;
    } while (fs.existsSync(resolvedPath));

    return resolvedPath;
  }

  /**
   * Validate that reference path exists
   */
  validateReferencePath(referencePath: string): boolean {
    return fs.existsSync(referencePath);
  }

  /**
   * Extract directory from reference path
   */
  extractDirectory(referencePath: string): string {
    return path.dirname(referencePath);
  }

  /**
   * Check if directory is writable
   */
  private checkDirectoryWritable(dirPath: string): void {
    try {
      fs.accessSync(dirPath, fs.constants.W_OK);
    } catch (error) {
      throw new Error(`Cannot write to directory: ${dirPath}`);
    }
  }

  /**
   * Write SVG content to file
   */
  async saveGeneratedSVG(outputPath: string, svgContent: string): Promise<void> {
    const dir = path.dirname(outputPath);
    
    // Check directory write permissions
    this.checkDirectoryWritable(dir);
    
    try {
      fs.writeFileSync(outputPath, svgContent, 'utf8');
    } catch (error) {
      throw new Error(`Failed to write SVG file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Complete workflow: generate path, resolve conflicts, and save file
   */
  async saveGeneratedIcon(
    suggestedFilename: string,
    referencePngPath: string,
    svgContent: string
  ): Promise<SaveResult> {
    try {
      // Validate reference path exists
      if (!this.validateReferencePath(referencePngPath)) {
        return {
          success: false,
          error: `Reference PNG file not found: ${referencePngPath}`
        };
      }

      // Generate output path
      const outputPath = this.generateOutputPath(suggestedFilename, referencePngPath);
      
      // Resolve any naming conflicts
      const resolvedPath = this.resolveNameConflicts(outputPath);
      
      // Save the file
      await this.saveGeneratedSVG(resolvedPath, svgContent);
      
      return {
        success: true,
        outputPath: resolvedPath
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during file save'
      };
    }
  }
}