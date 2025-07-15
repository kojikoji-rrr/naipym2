import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize',
  standalone: true
})
export class FileSizePipe implements PipeTransform {

  transform(value: number): string {
    if (!value || value === 0) return '0 B';
    
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = value;
    let unitIndex = 0;
    
    // 適切な単位まで値を変換
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    // 小数点以下2桁まで表示（整数の場合は小数点なし）
    const formattedSize = size % 1 === 0 ? 
      size.toString() : 
      size.toFixed(2);
    
    return `${formattedSize}${units[unitIndex]}`;
  }
}