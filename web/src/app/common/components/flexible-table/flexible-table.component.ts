import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';

export interface FlexibleTableData {
  // 表示値
  value:any;
  // tdに設定するクラスとかstyleとかそもそも表示するためのhtml要素(テンプレート)とか
}

@Component({
  selector: 'app-flexible-table',
  imports: [CommonModule],
  templateUrl: './flexible-table.component.html'
})
export class FlexibleTableComponent {
  // 表示データ
  @Input() data: Array<{[key:string]: FlexibleTableData}> = [];
  // ヘッダラベル
  @Input() thLabels: {[key:string]: string} = {}
  // 非表示カラム
  @Input() hideColumn: Array<string> = [];
  // ソート処理
  sortColumn: {[key:string]: boolean} = {}
  // ソートイベント（未設定の場合デフォルト処理）
  @Output() sortEvent = new EventEmitter<{[key:string]: boolean}>();

  // ソート処理
  private onChangeSort(key: string) {
    // ソートキー追加
    if (!this.sortColumn[key]) {
      this.sortColumn[key] = true;
    } else {
      this.sortColumn[key] = !this.sortColumn[key];
    }
    // ソート処理
    if (this.sortEvent.observers.length > 0) {
      // イベント設定済ならイベント発火
      // ※ 呼出元でソート後の結果をdataに再設定する可能性もあるのでソートはしない。
      this.sortEvent.emit(this.sortColumn);
    } else {
      // イベント未設定ならデフォルトのソート処理を実行
      this.defaultSort();
    }
  }

  private defaultSort() {
    // dataに対してsortColumnの優先順でソートを行う（trueなら昇順、falseなら降順）
    this.data.sort((a, b) => {
      for (const key in this.sortColumn) {
        if (this.sortColumn.hasOwnProperty(key)) {
          const order = this.sortColumn[key] ? 1 : -1;
          if (a[key] < b[key]) return -1 * order;
          if (a[key] > b[key]) return 1 * order;
        }
      }
      return 0;
    });
  }
}