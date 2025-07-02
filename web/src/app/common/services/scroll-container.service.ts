import { Injectable, ElementRef, OnDestroy } from '@angular/core';
import { Subject, Subscription, fromEvent } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// スクロールイベントハンドラとthisコンテキストのペアの型を定義
type ScrollHandlerWithContext<T> = { handler: (this: T, event: Event) => void; context: T };

@Injectable({
  providedIn: 'root'
})
export class ScrollContainerService implements OnDestroy {
  private scrollContainerElement: HTMLElement | null = null;
  // 各コンポーネントが登録したハンドラと、それに対応する購読を管理するためのMap
  private activeSubscriptions = new Map<ScrollHandlerWithContext<any>, Subscription>();
  private serviceDestroy$ = new Subject<void>();

  constructor() {}

  setScrollContainer(elementRef: ElementRef | null): void {
    this.removeAllListeners();

    if (elementRef) {
      this.scrollContainerElement = elementRef.nativeElement;
    } else {
      this.scrollContainerElement = null;
    }
  }

  getScrollContainerElement(): HTMLElement | null {
    return this.scrollContainerElement;
  }

  /**
   * 指定されたハンドラとコンテキストでスクロールイベントリスナーを登録する
   * @param handler スクロールイベント発生時に呼び出されるコールバック関数
   * @param context ハンドラが呼び出される際の 'this' となるオブジェクト (通常はコンポーネントインスタンス)
   * @returns 購読オブジェクト
   */
  addScrollListener<T>(handler: (this: T, event: Event) => void, context: T): Subscription | null {
    if (!this.scrollContainerElement) {
      console.warn('Scroll container not set. Cannot add scroll listener.');
      return null;
    }

    const boundHandler = handler.bind(context);

    // fromEvent を使用して Observable を作成し、購読
    const subscription = fromEvent(this.scrollContainerElement, 'scroll')
      .pipe(takeUntil(this.serviceDestroy$))
      .subscribe(boundHandler); // bind されたハンドラを購読

    // マップには、元のハンドラとコンテキストのペアをキーとして保存
    // 解除時に元のハンドラとコンテキストで検索できるようにするため
    this.activeSubscriptions.set({ handler, context }, subscription);
    return subscription;
  }

  /**
   * 指定されたハンドラとコンテキストに関連付けられたスクロールイベントリスナーを解除する
   * @param handler 解除したいコールバック関数
   * @param context 解除したいコールバック関数が登録された際の 'this' となったオブジェクト
   */
  removeScrollListener<T>(handler: (this: T, event: Event) => void, context: T): void {
    let foundKey: ScrollHandlerWithContext<any> | undefined;
    // Mapをイテレートして、対応するキーを見つける
    for (const key of this.activeSubscriptions.keys()) {
      if (key.handler === handler && key.context === context) {
        foundKey = key;
        break;
      }
    }

    if (foundKey) {
      const subscription = this.activeSubscriptions.get(foundKey);
      if (subscription) {
        subscription.unsubscribe();
        this.activeSubscriptions.delete(foundKey);
      }
    }
  }

  private removeAllListeners(): void {
    this.activeSubscriptions.forEach(sub => sub.unsubscribe());
    this.activeSubscriptions.clear();
  }

  ngOnDestroy(): void {
    this.removeAllListeners();
    this.serviceDestroy$.next();
    this.serviceDestroy$.complete();
  }
}