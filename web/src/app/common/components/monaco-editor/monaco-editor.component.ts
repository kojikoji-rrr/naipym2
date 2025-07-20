import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import * as monaco from 'monaco-editor';
import loader from '@monaco-editor/loader';

@Component({
  selector: 'app-monaco-editor',
  standalone: true,
  template: `<div #editorContainer class="w-full h-full border-0" style="min-width: 0; max-width: 100%; overflow: hidden; position: relative;"></div>`,
  host: {'[style]': '{display: "block", width: "100%", height: "100%", minWidth: "0", overflow: "hidden"}'},
})
export class MonacoEditorComponent implements OnInit, OnDestroy {
  @ViewChild('editorContainer', { static: true }) editorContainer!: ElementRef;
  @Input() value: string = '';
  @Input() language: string = 'sql';
  @Input() theme: string = 'vs';
  @Input() readOnly: boolean = false;
  @Input() fontSize: number = 14;
  @Output() valueChange = new EventEmitter<string>();

  private editor: monaco.editor.IStandaloneCodeEditor | null = null;
  private resizeObserver: ResizeObserver | null = null;

  async ngOnInit() {
    await this.initMonaco();
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.dispose();
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private async initMonaco() {
    try {
      loader.config({ 
        paths: { 
          vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.2/min/vs' 
        } 
      });

      const monacoInstance = await loader.init();
      this.editor = monacoInstance.editor.create(this.editorContainer.nativeElement, {
        value: this.value,
        language: this.language,
        theme: this.theme,
        readOnly: this.readOnly,
        fontSize: this.fontSize,
        lineDecorationsWidth: 1,
        lineNumbersMinChars: 2,
        renderLineHighlight: 'none',
        // automaticLayout: false,
        // scrollBeyondLastLine: false,
        // wordWrap: 'on',
        // minimap: {enabled: false},
        // glyphMargin: false,
        // folding: false,
        // overviewRulerBorder: false,
        // hideCursorInOverviewRuler: true,
        // overviewRulerLanes: 0,
        // scrollbar: {
        //   vertical: 'auto',
        //   horizontal: 'auto',
        //   useShadows: false,
        //   verticalScrollbarSize: 8,
        //   horizontalScrollbarSize: 8
        // }
      });

      // 値変更の監視
      if (this.editor) {
        this.editor.onDidChangeModelContent(() => {
          if (this.editor) {
            const newValue = this.editor.getValue();
            this.valueChange.emit(newValue);
          }
        });
      }

      // ResizeObserverを設定してコンテナのサイズ変更を監視
      this.initResizeObserver();

      // 初期レイアウトを強制実行
      setTimeout(() => {
        if (this.editor) {
          this.editor.layout();
        }
      }, 100);

    } catch (error) {
      console.error('Monaco Editor initialization failed:', error);
    }
  }

  setValue(value: string) {
    if (this.editor && this.editor.getValue() !== value) {
      this.editor.setValue(value);
    }
  }

  getValue(): string {
    return this.editor ? this.editor.getValue() : '';
  }

  private initResizeObserver() {
    if (typeof ResizeObserver !== 'undefined' && this.editorContainer) {
      this.resizeObserver = new ResizeObserver((entries) => {
        // requestAnimationFrameを使用してスムーズなリサイズを実現
        requestAnimationFrame(() => {
          if (this.editor && entries[0]) {
            const { width, height } = entries[0].contentRect;
            this.editor.layout({
              width: Math.max(50, width),
              height: Math.max(50, height)
            });
          }
        });
      });
      
      // エディターコンテナを監視対象に追加
      this.resizeObserver.observe(this.editorContainer.nativeElement);
    }
  }

  // 手動でレイアウトを更新するメソッド
  updateLayout() {
    if (this.editor) {
      // 強制的にコンテナサイズを取得してレイアウト
      const container = this.editorContainer.nativeElement;
      const rect = container.getBoundingClientRect();
      
      this.editor.layout({
        width: Math.max(50, rect.width), // 最小50px
        height: Math.max(50, rect.height) // 最小50px
      });
    }
  }
}