import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild, HostListener, ElementRef } from '@angular/core';
import { SideMenuService } from '../common/services/side-menu.service';
import { PageHeaderComponent } from '../common/components/page-header/page-header.component';
import { FlexibleTableColumn, FlexibleTableComponent } from '../common/components/flexible-table/flexible-table.component';
import { ContentSpinnerComponent } from '../common/components/content-spinner/content-spinner.component';
import { ApiService } from '../common/services/api.service';
import { ScrollContainerService } from '../common/services/scroll-container.service';
import { TableCellLinkComponent } from './components/table-cell-link/table-cell-link.component';
import { TableCellCopyComponent } from './components/table-cell-copy/table-cell-copy.component';
import { TableCellThumbComponent } from './components/table-cell-thumb/table-cell-thumb.component';

const LOAD_LIMIT = 50;
const SHRESHOLD = 200; // 下端からの距離（px）

@Component({
  selector: 'app-artists',
  imports: [PageHeaderComponent, FlexibleTableComponent, ContentSpinnerComponent],
  templateUrl: './artists.component.html'
})
export class ArtistsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sideMenuContent') sideMenuContent!: TemplateRef<any>;
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  @ViewChild('artistTable') artistTable!: FlexibleTableComponent;
  // 表示データ
  data: Array<{[key:string]: any}> = [];
  // ヘッダラベル
  thLabels: {[key:string]: FlexibleTableColumn} = {
    'domain'         :{label:'ドメイン', colClass:"text-xs",  rowClass:"text-xs", rowStyle:undefined, rowComponent:undefined },
    'tag'            :{label:'タグ',     colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:TableCellCopyComponent },
    'artist_id'      :{label:'絵師ID',   colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:undefined},
    'artist_name'    :{label:'絵師名',   colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:TableCellCopyComponent },
    'other_names'    :{label:'他名称',   colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:undefined },
    'post_count'     :{label:'ポスト数', colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:undefined },
    'is_banned'      :{label:'BAN',     colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:undefined },
    'is_deleted'     :{label:'DEL',     colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:undefined },
    'url'            :{label:'postURL', colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:TableCellLinkComponent },
    'img_path'       :{label:'元画像',   colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:TableCellThumbComponent },
    'img_name'       :{label:'画像名',   colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:undefined },
    'dled_at'        :{label:'ＤＬ日',   colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:undefined },
    'last_dled_at'   :{label:'最終ＤＬ', colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:undefined },
    'gen_model'      :{label:'生成ﾓﾃﾞﾙ', colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:undefined },
    'gen_path'       :{label:'生成画像', colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:TableCellThumbComponent },
    'gen_name'       :{label:'生成名',   colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:undefined },
    'gened_at'       :{label:'生成日',   colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:undefined },
    'last_gened_at'  :{label:'最終生成', colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:undefined }
  }
  // trackByキー
  trackByKeys: Array<string> = ['tag', 'artist_id'];
  // 非表示カラム
  hideColumns: Array<string> = ["artist_id", "other_names", "img_name", "dled_at", "last_dled_at", "gen_model", "gen_name", "gened_at", "last_gened_at"];
  // 総件数
  total:number = 0;
  // 読込済みページ数
  cumulTotal:number = 0;
  // ステータス（初期化/差分取得/完了）
  status: 'load' | 'add' | 'complete' = 'complete';
  // 現在のページ番号
  currentPage: number = 0;
  // 現在のソート情報
  sortColumn: {[key:string]: boolean} = {};
 
  constructor(
    private sideMenuService: SideMenuService,
    private apiService: ApiService,
    private scrollContainerService: ScrollContainerService
  ) {}

  ngOnInit() {
    // サービスのスクロールイベントを購読
    this.scrollContainerService.addScrollListener(this.onScrollContainer, this);
  }

  async ngAfterViewInit(): Promise<void> {
    // ビューの初期化後にテンプレートをサービスにセットする
    this.sideMenuService.setContent(this.sideMenuContent);
    // 初回ロード
    this.search();
  }

  ngOnDestroy(): void {
    this.sideMenuService.clearContent();
    this.scrollContainerService.removeScrollListener(this.onScrollContainer, this);
  }

  // ソート処理（再検索）
  onChangeSort(event: {sortColumn: {[key:string]: boolean}, data: Array<{[key:string]: any}>}) {
    this.sortColumn = event.sortColumn;
    this.search();
  }

  // 検索処理
  async search(isAdd:boolean = false) {
    if (this.status !== 'complete')
      return;
    
    this.status = isAdd ? 'add' : 'load';
    if (!isAdd) {
      this.data = [];
      this.total = 0;
      this.cumulTotal = 0;
      this.currentPage = 0;
    }

    try {
      if (!isAdd) {
        const response = await this.apiService.searchArtistDataAndTotal(LOAD_LIMIT, 0, this.sortColumn).toPromise();
        this.total = response.total;
        this.push_data(response.result);
        this.cumulTotal = this.data.length;
      } else {
        const response = await this.apiService.searchArtistData(LOAD_LIMIT, LOAD_LIMIT*this.currentPage, this.sortColumn).toPromise();
        this.push_data(response);
        this.cumulTotal = this.data.length;
      }
    } catch (error) {
      console.error('API error:', error);

    } finally {
      this.status = 'complete';
    }
  }

  push_data(response: Array<{ [key: string]: any }>): void {
    const processedData = response.map(item => {
      const processedItem = { ...item };
      
      // domainの処理（カンマを改行に変換）
      if (item['domain']) {
        processedItem['domain'] = item['domain'].replace(/,/g, '<br>');
      }
      
      // original_imageの処理
      if (item['original_image'] && item['original_image'] !== '[{}]') {
        try {
          // Windowsパスの\をエスケープして正しいJSONにする
          const fixedOriginalJson = item['original_image'].replace(/\\/g, '\\\\');
          const originalImages = JSON.parse(fixedOriginalJson);
          if (Array.isArray(originalImages) && originalImages.length > 0) {
            const randomOriginal = originalImages[Math.floor(Math.random() * originalImages.length)];
            processedItem['url'] = randomOriginal['url'];
            processedItem['img_path'] = randomOriginal['filepath'];
            processedItem['img_name'] = randomOriginal['filename'];
            processedItem['dled_at'] = randomOriginal['dled_at'];
          }
        } catch (e) {
          console.warn('original_image parse error:', e);
          console.warn('original_image content:', item['original_image']);
        }
      }
      
      // generate_imageの処理
      if (item['generate_image'] && item['generate_image'] !== '[{}]') {
        try {
          // Windowsパスの\をエスケープして正しいJSONにする
          const fixedGenerateJson = item['generate_image'].replace(/\\/g, '\\\\');
          const generateImages = JSON.parse(fixedGenerateJson);
          if (Array.isArray(generateImages) && generateImages.length > 0) {
            const randomGenerate = generateImages[Math.floor(Math.random() * generateImages.length)];
            processedItem['gen_model'] = randomGenerate['model'];
            processedItem['gen_path'] = randomGenerate['filepath'];
            processedItem['gen_name'] = randomGenerate['filename'];
            processedItem['gened_at'] = randomGenerate['gened_at'];
          }
        } catch (e) {
          console.warn('generate_image parse error:', e);
          console.warn('generate_image content:', item['generate_image']);
        }
      }
      
      return processedItem;
    });
    
    this.data.push(...processedData);
  }

  // スクロールイベント
  onScrollContainer() {
    const element = this.scrollContainerService.getScrollContainerElement();
    if (this.status !== 'complete' || !element) return;

    const position = element.scrollTop + element.clientHeight;
    const height = element.scrollHeight;

    if (position >= height - SHRESHOLD) {
      if (this.cumulTotal < this.total) {
        this.currentPage++;
        this.search(true);
      }
    }
  }
}
