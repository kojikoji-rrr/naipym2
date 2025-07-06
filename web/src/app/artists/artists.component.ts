import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { SideMenuService } from '../common/services/side-menu.service';
import { PageHeaderComponent } from '../common/components/page-header/page-header.component';
import { FlexibleTableColumn, FlexibleTableComponent, InjectedData } from '../common/components/flexible-table/flexible-table.component';
import { ContentSpinnerComponent } from '../common/components/content-spinner/content-spinner.component';
import { ApiService } from '../common/services/api.service';
import { ScrollContainerService } from '../common/services/scroll-container.service';
import { TableCellLinkComponent } from './components/table-cell-link/table-cell-link.component';
import { TableCellCopyComponent } from './components/table-cell-copy/table-cell-copy.component';
import { TableCellThumbComponent } from './components/table-cell-thumb/table-cell-thumb.component';
import { FlexibleModalComponent } from '../common/components/flexible-modal/flexible-modal.component';
import { TableCellFlagComponent } from './components/table-cell-flag/table-cell-flag.component';
import { TableCellFavoriteComponent } from './components/table-cell-favorite/table-cell-favorite.component';
import { TableCellTextareaComponent } from './components/table-cell-textarea/table-cell-textarea.component';

const LOAD_LIMIT = 50;
const SHRESHOLD = 200; // 下端からの距離（px）

export interface ImageModalData {
  mimeType: string,
  url: string
}

@Component({
  selector: 'app-artists',
  imports: [PageHeaderComponent, FlexibleTableComponent, ContentSpinnerComponent, FlexibleModalComponent],
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
    // 'favorite'       :{label:'Fav',     colClass:"text-xs",  rowClass:"text-xs", rowStyle:{"max-width":"50px"},  rowComponent:TableCellFavoriteComponent, handler: { [TableCellFavoriteComponent.onChangeFavorite]: (data, component) => this.onChangeFavorite(data.row['tag_id'], undefined, component.value) }, mobile: { minWidth: '50px' }},
    // 'memo'           :{label:'memo',    colClass:"text-xs",  rowClass:"text-xs", rowStyle:{"max-width":"100px"}, rowComponent:TableCellTextareaComponent, handler: { [TableCellTextareaComponent.onChangeInput]: (data, component) => this.onChangeFavorite(data.row['tag_id'], component.value, undefined) }, mobile: { minWidth: '40px' }},
    'domain'         :{label:'ドメイン', colClass:"text-xs",  rowClass:"text-xs", rowStyle:{"max-width":"120px"}, rowComponent:undefined, mobile: { minWidth: '40px' }},
    'tag'            :{label:'タグ',     colClass:"text-xs", rowClass:"text-xs", rowStyle:{"max-width":"160px"}, rowComponent:TableCellCopyComponent, mobile: { minWidth: '120px', flex: '1' }},
    'artist_id'      :{label:'絵師ID',   colClass:"text-xs", rowClass:"text-xs", rowStyle:{"max-width":"160px"}, rowComponent:undefined},
    'artist_name'    :{label:'絵師名',   colClass:"text-xs", rowClass:"text-xs", rowStyle:{"max-width":"160px"}, rowComponent:TableCellCopyComponent, mobile: { minWidth: '120px', flex: '1' }},
    'other_names'    :{label:'他名称',   colClass:"text-xs", rowClass:"text-xs", rowStyle:{"max-width":"200px"}, rowComponent:undefined },
    'post_count'     :{label:'post',    colClass:"text-xs", rowClass:"text-xs text-center", rowStyle:{"width":"50px"}, rowComponent:undefined, mobile: { isSmall: true, minWidth: '50px' }},
    'is_banned'      :{label:'BAN',     colClass:"text-xs", rowClass:"text-xs", rowStyle:{"width":"50px"}, rowComponent:TableCellFlagComponent, mobile: { isSmall: true, minWidth: '40px' }},
    'is_deleted'     :{label:'DEL',     colClass:"text-xs", rowClass:"text-xs", rowStyle:{"width":"50px"}, rowComponent:TableCellFlagComponent, mobile: { isSmall: true, minWidth: '40px' }},
    'url'            :{label:'URL',     colClass:"text-xs", rowClass:"text-xs text-center", rowStyle:{"width":"60px"}, rowComponent:TableCellLinkComponent, mobile: { isSmall: true, minWidth: '50px' }},
    'img_url'        :{label:'元画像',   colClass:"text-xs", rowClass:"text-xs", rowStyle:{"width":"20%"}, rowComponent:TableCellThumbComponent, handler: { [TableCellThumbComponent.onClickImage]: (data) => this.showImageModal(data.row['img_path'], data.row['gen_path']) }, mobile: { isImage: true, emptyText: '画像なし' }},
    'img_name'       :{label:'画像名',   colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:undefined },
    'dled_at'        :{label:'ＤＬ日',   colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:undefined },
    'last_dled_at'   :{label:'最終ＤＬ', colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:undefined },
    'gen_model'      :{label:'生成ﾓﾃﾞﾙ', colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:undefined },
    'gen_url'        :{label:'生成画像', colClass:"text-xs", rowClass:"text-xs", rowStyle:{"width":"20%"}, rowComponent:TableCellThumbComponent, handler: { [TableCellThumbComponent.onClickImage]: (data) => this.showImageModal(data.row['img_path'], data.row['gen_path']) }, mobile: { isImage: true, emptyText: '生成画像なし' }},
    'gen_name'       :{label:'生成名',   colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:undefined },
    'gened_at'       :{label:'生成日',   colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:undefined },
    'last_gened_at'  :{label:'最終生成', colClass:"text-xs", rowClass:"text-xs", rowStyle:undefined, rowComponent:undefined }
  }
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
  // モーダル展開制御
  isOpenImageModal: boolean = false;
  // サンプルモード
  isSample: boolean = false;
  // モーダル画像情報
  modalImageA?:ImageModalData;
  modalImageB?:ImageModalData;
  // ソート情報
  currentSort: {[key:string]: boolean} = {'post_count': false};
  
  constructor(
    private sideMenuService: SideMenuService,
    private apiService: ApiService,
    private scrollContainerService: ScrollContainerService
  ) {}

  ngOnInit() {
    // サービスのスクロールイベントを購読
    this.scrollContainerService.addScrollListener(this.onScrollContainer, this);
    // ブラウザの戻るボタン対応
    window.addEventListener('popstate', this.onPopState.bind(this));
  }

  async ngAfterViewInit(): Promise<void> {
    // ビューの初期化後にテンプレートをサービスにセットする
    this.sideMenuService.setContent(this.sideMenuContent);
    // ソート初期化
    this.artistTable.setSort(this.currentSort);
    // 初回ロード
    this.search();
  }

  ngOnDestroy(): void {
    this.sideMenuService.clearContent();
    this.scrollContainerService.removeScrollListener(this.onScrollContainer, this);
    // イベントリスナーを削除
    window.removeEventListener('popstate', this.onPopState.bind(this));
  }

  // ソート処理（再検索）
  onChangeSort(event: {data: Array<{[key:string]: any}>, sort: {[key:string]:boolean}}) {
    this.currentSort = {...event.sort};
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
        const response = await this.apiService.searchArtistDataAndTotal(LOAD_LIMIT, 0, this.currentSort).toPromise();
        this.total = response.total;
        this.push_data(response.result);
        this.cumulTotal = this.data.length;
      } else {
        const response = await this.apiService.searchArtistData(LOAD_LIMIT, LOAD_LIMIT*this.currentPage, this.currentSort).toPromise();
        this.push_data(response);
        this.cumulTotal = this.data.length;
      }

    } catch (error) {
      console.error('API error:', error);

    } finally {
      this.status = 'complete';
    }
  }

  // 取得データを加工してテーブルにセット
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
            // const randomOriginal = originalImages[Math.floor(Math.random() * originalImages.length)];
            const randomOriginal = originalImages[0];
            processedItem['url'] = randomOriginal['url'];
            processedItem['img_path'] = randomOriginal['filepath'];
            processedItem['img_name'] = randomOriginal['filename'];
            processedItem['dled_at'] = randomOriginal['dled_at'];
            processedItem['img_url'] = this.getImageUrl(processedItem['img_path'], true);
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
            // const randomGenerate = generateImages[Math.floor(Math.random() * generateImages.length)];
            const randomGenerate = generateImages[0];
            processedItem['gen_model'] = randomGenerate['model'];
            processedItem['gen_path'] = randomGenerate['filepath'];
            processedItem['gen_name'] = randomGenerate['filename'];
            processedItem['gened_at'] = randomGenerate['gened_at'];
            processedItem['gen_url'] = this.getImageUrl(processedItem['gen_path'], true);
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

  // 画像クリック処理
  showImageModal(img_path:string, gen_path:string) {
    this.apiService.getImageType(this.isSample ? "sample" : img_path).subscribe((typeA: string) => {
      if (typeA != 'none') {
        this.modalImageA = {
          mimeType: typeA,
          url: this.getImageUrl(img_path, false)
        }
      }
    });
    this.apiService.getImageType(this.isSample ? "sample" : gen_path).subscribe((typeB: string) => {
      if (typeB != 'none') {
        this.modalImageB = {
          mimeType: typeB,
          url: this.getImageUrl(gen_path, false)
        }
      }
    });

    // モーダル表示前に履歴に状態を追加
    history.pushState({ modal: true }, '', '');
    this.isOpenImageModal = true;
  }

  // モーダルを閉じる処理
  closeImageModal() {
    this.modalImageA = undefined;
    this.modalImageB = undefined;
    this.isOpenImageModal = false;
  }

  // ブラウザの戻るボタン処理
  onPopState(event: PopStateEvent) {
    if (this.isOpenImageModal) {
      this.closeImageModal();
      // 履歴の状態を調整
      if (event.state?.modal) {
        history.back();
      }
    }
  }

  // Favorite切り替え処理
  onChangeFavorite(tagId:string, memo?:string, favorite?:boolean) {
    console.log(`changed ${tagId}: Memo=${memo}, favorite=${favorite}`);
  }

  // 画像URLの生成
  getImageUrl(path:string | null, isThumbs: boolean) {
    if (path) {
      var image = this.isSample ? "sample" : path;
      var endline = isThumbs ? `thumbs/${image}` : image;
      return new URL(`${this.apiService.API_BASE}/artist/${endline}`, this.apiService.API_URL).toString();
    } else {
      return '';
    }
  }
}
