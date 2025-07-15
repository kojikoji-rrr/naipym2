import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {

  transform(value: string): string {
    if (!value) return '';
    
    try {
      // ISO文字列をDateオブジェクトに変換
      const date = new Date(value);
      
      // 日本時間に変換
      const jstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
      
      // YYYY/MM/DD HH:MM:SS形式にフォーマット
      const year = jstDate.getUTCFullYear();
      const month = String(jstDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(jstDate.getUTCDate()).padStart(2, '0');
      const hours = String(jstDate.getUTCHours()).padStart(2, '0');
      const minutes = String(jstDate.getUTCMinutes()).padStart(2, '0');
      const seconds = String(jstDate.getUTCSeconds()).padStart(2, '0');
      
      return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      return value; // エラーの場合は元の値を返す
    }
  }
}