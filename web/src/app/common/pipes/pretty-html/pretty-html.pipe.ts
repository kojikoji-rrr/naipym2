import { Pipe, PipeTransform } from '@angular/core';
import * as prettier from 'prettier/standalone';
import * as prettierPluginHtml from 'prettier/plugins/html';
import { Observable, from, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Pipe({
  name: 'prettyHtml',
  standalone: true
})
export class PrettyHtmlPipe implements PipeTransform {
  private cache = new Map<string, string>();

  transform(value: string): Observable<string> {
    if (!value) {
      return of('');
    }

    // キャッシュから確認
    if (this.cache.has(value)) {
      return of(this.cache.get(value)!);
    }

    // 非同期でPrettierを実行
    return from(
      prettier.format(value, {
        parser: 'html',
        plugins: [prettierPluginHtml],
        htmlWhitespaceSensitivity: 'css',
      })
    ).pipe(
      catchError((e) => {
        console.error('Could not format HTML', e);
        return of(value); // エラー時は元の文字列を返す
      })
    );
  }
}