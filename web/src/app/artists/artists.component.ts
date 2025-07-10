import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { SideMenuService } from '../common/services/side-menu.service';
import { PageHeaderComponent } from '../common/components/page-header/page-header.component';
import { FlexibleTableDesktopColumn, FlexibleTableDesktopComponent } from '../common/components/flexible-table/table-desktop/flexible-table-desktop.component';
import { ContentSpinnerComponent } from '../common/components/content-spinner/content-spinner.component';
import { ApiService } from '../common/services/api.service';
import { ScrollContainerService } from '../common/services/scroll-container.service';
import { FlexibleModalComponent } from '../common/components/flexible-modal/flexible-modal.component';
import { ActivatedRoute } from '@angular/router';
import { FlexibleTableColumn } from '../common/components/flexible-table/table-base/flexible-table-base.component';
import { FlexibleTableMobileColumn, FlexibleTableMobileComponent } from '../common/components/flexible-table/table-mobile/flexible-table-mobile.component';
import { CellCopy, CellFavorite, CellFlag, CellLabel, CellLink, CellTextarea, CellThumb } from '../common/services/flexible-table.service';

const LOAD_LIMIT = 50;
const SHRESHOLD = 200; // 下端からの距離（px）

export interface ImageModalData {
  mimeType: string,
  url: string
}

@Component({
  selector: 'app-artists',
  imports: [PageHeaderComponent, FlexibleTableDesktopComponent, FlexibleTableMobileComponent, ContentSpinnerComponent, FlexibleModalComponent],
  templateUrl: './artists.component.html'
})
export class ArtistsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sideMenuContent') sideMenuContent!: TemplateRef<any>;
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  @ViewChild('artistTableDesktop') artistTableDesktop!: FlexibleTableDesktopComponent;
  @ViewChild('artistTableMobile') artistTableMobile!: FlexibleTableMobileComponent;
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
  modalImageA?:ImageModalData = undefined;
  modalImageB?:ImageModalData = undefined;
  // 表示データ
  data: Array<{[key:string]: any}> = [];
  // trackByキー
  trackByKeys: Array<string> = [];
  // ヘッダラベル
  labels: {[key:string]: FlexibleTableColumn} = {};
  // スタイル
  desktopStyles: {[key:string]: FlexibleTableDesktopColumn} = {};
  mobileStyles: {[key:string]: FlexibleTableMobileColumn} = {};
  // 非表示カラム
  hideColumns: Array<string> = [];
  // ソート情報
  currentSort: {[key:string]: boolean} = {};
  // メモリスト
  memoList: string[] = [];

  constructor(
    private sideMenuService: SideMenuService,
    private apiService: ApiService,
    private scrollContainerService: ScrollContainerService,
    private route: ActivatedRoute
  ) {
    // 親からのデータ取得
    this.route.data.subscribe(data => {
      this.memoList = data['master'].notelist;
    });

    // 列設定
    this.labels = {
      'favorite'       :CellFavorite('Fav', {onChangeFavorite: (data, component) => this.onChangeFavorite(data.row['tag_id'], undefined, component.value)}),
      'memo'           :CellTextarea('memo', {memoList: this.memoList}, {
        onChangeInput: (data, component) => this.onChangeFavorite(data.row['tag_id'], component.value, undefined),
        updateMemoList: (data, component) => this.memoList = component.args.memoList
      }),
      'domain'         :CellLabel('ドメイン'),
      'url'            :CellLink('URL'),
      'tag'            :CellCopy('タグ'),
      'artist_id'      :CellLabel('絵師ID'),
      'artist_name'    :CellCopy('絵師名'),
      'other_names'    :CellLabel('他名称'),
      'post_count'     :CellLabel('post'),
      'is_banned'      :CellFlag('BAN'),
      'is_deleted'     :CellFlag('DEL'),
      'img_url'        :CellThumb('元画像', {onClickImage:(data) => this.showImageModal(data.row['img_path'], data.row['gen_path'])}),
      'img_name'       :CellLabel('画像名'),
      'dled_at'        :CellLabel('ＤＬ日'),
      'last_dled_at'   :CellLabel('最終ＤＬ'),
      'gen_model'      :CellLabel('生成ﾓﾃﾞﾙ'),
      'gen_url'        :CellThumb('生成画像', {onClickImage: (data) => this.showImageModal(data.row['img_path'], data.row['gen_path'])}),
      'gen_name'       :CellLabel('生成名'),
      'gened_at'       :CellLabel('生成日'),
      'last_gened_at'  :CellLabel('最終生成')
    };
    // style設定
    this.desktopStyles = {
      'favorite'      : {},
      'memo'          : {},
      'domain'        : {},
      'url'           : {},
      'tag'           : {},
      'artist_id'     : {},
      'artist_name'   : {},
      'other_names'   : {},
      'post_count'    : {},
      'is_banned'     : {},
      'is_deleted'    : {},
      'img_url'       : {},
      'img_name'      : {},
      'dled_at'       : {},
      'last_dled_at'  : {},
      'gen_model'     : {},
      'gen_url'       : {},
      'gen_name'      : {},
      'gened_at'      : {},
      'last_gened_at' : {}
    };
    this.mobileStyles = {
      'favorite'      : {width: '40px'},
      'memo'          : {width: '140px'},
      'domain'        : {width: '120px'},
      'url'           : {width: '60px'},
      'tag'           : {width: '120px'},
      'artist_id'     : {},
      'artist_name'   : {width: '120px'},
      'other_names'   : {width: '180px'},
      'post_count'    : {width: '60px'},
      'is_banned'     : {width: '50px'},
      'is_deleted'    : {width: '50px'},
      'img_name'      : {},
      'dled_at'       : {},
      'last_dled_at'  : {},
      'gen_model'     : {},
      'gen_name'      : {},
      'gened_at'      : {},
      'last_gened_at' : {},
      'gen_url'       : {isViewLarge:true},
      'img_url'       : {isViewLarge:true}
    };
    // trackByキー
    this.trackByKeys = ['tag', 'artist_id'];
    // 非表示カラム
    this.hideColumns = ["artist_id", "other_names", "img_name", "dled_at", "last_dled_at", "gen_model", "gen_name", "gened_at", "last_gened_at"];
    // ソート情報
    this.currentSort = {'post_count': false};
  }

  ngOnInit() {
    // サービスのスクロールイベントを購読
    this.scrollContainerService.addScrollListener(this.onScrollContainer, this);
    // ブラウザの戻るボタン対応
    window.addEventListener('popstate', this.onPopState.bind(this));
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
    // イベントリスナーを削除
    window.removeEventListener('popstate', this.onPopState.bind(this));
  }

  // ソート解除処理
  clearSort() {
    this.artistTableDesktop?.clearSort();
    this.artistTableMobile?.clearSort();
  }

  // ソート処理（再検索）
  onChangeSort(sortedColumns:{[key:string]: boolean}) {
    this.currentSort = sortedColumns;
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
            const randomOriginal = originalImages[Math.floor(Math.random() * originalImages.length)];
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
            const randomGenerate = generateImages[Math.floor(Math.random() * generateImages.length)];
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
