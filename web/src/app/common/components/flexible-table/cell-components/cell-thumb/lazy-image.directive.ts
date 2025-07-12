import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appLazyImage]',
  standalone: true
})
export class LazyImageDirective implements OnInit, OnDestroy {
  @Input() appLazyImage!: string;
  @Input() placeholderSrc?: string;

  private observer?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLImageElement>) {}

  ngOnInit() {
    // プレースホルダー画像を設定
    if (this.placeholderSrc) {
      this.el.nativeElement.src = this.placeholderSrc;
    }

    // IntersectionObserverを作成
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage();
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private loadImage() {
    if (this.appLazyImage) {
      this.el.nativeElement.src = this.appLazyImage;
      this.observer?.unobserve(this.el.nativeElement);
    }
  }
}