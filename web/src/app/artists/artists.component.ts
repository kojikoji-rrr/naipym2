import { AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild, ElementRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { FormsModule } from '@angular/forms';
import { SpinnerComponent } from '../common/components/spinner/spinner.component';
import { LabelOneContentComponent } from "../common/components/label-one-content/label-one-content.component";
import { ContentsSectionComponent } from "../common/components/sidemenu-items/contents-section/contents-section.component";
import { SidemenuCheckboxComponent } from "../common/components/sidemenu-items/checkbox/checkbox.component";
import { SidemenuRadiosComponent } from "../common/components/sidemenu-items/radios/radios.component";

const LOAD_LIMIT = 50;
const THRESHOLD = 0;

export interface ImageModalData {
  mimeType: string,
  url: string
}

export class SearchFormProps {
  // キーワード：メモ
  keywordByMemo:boolean = true;
  // キーワード：他名称
  keywordByOtherName:boolean = true;
  // キーワード：タグ
  keywordByTagName:boolean = true;
  // キーワード：絵師名
  keywordByArtistName:boolean = true;
  // キーワード：モデル名
  keywordByModelName:boolean = false;
  // キーワード：絵師ID
  keywordByArtistID:boolean = false;
  // 検索条件
  keywordOption:number = 0;
  // 検索キーワード
  keyword:string = "";
  // favorite
  favorite?:boolean = undefined;
  // ドメイン
  domain:string[] = [];
  // BAN
  isBanned?:boolean = undefined;
  // DEL
  isDeleted?:boolean = undefined;
  // DL済
  isDled?:boolean = undefined;
  // 生成済
  isGened?:boolean = undefined;
  // 投稿数
  postCountMin:number = 0;
  postCountMax:number = 99999;
}

@Component({
  selector: 'app-artists',
  imports: [CommonModule, PageHeaderComponent, FlexibleTableDesktopComponent, FlexibleTableMobileComponent, SpinnerComponent, ContentSpinnerComponent, FlexibleModalComponent, FormsModule, ContentsSectionComponent, LabelOneContentComponent, SidemenuCheckboxComponent, SidemenuRadiosComponent],
  templateUrl: './artists.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArtistsComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly window = window;  
  @ViewChild('sideMenuContent') sideMenuContent!: TemplateRef<any>;
  @ViewChild('scrollContainer', { static: false }) scrollContainer!: ElementRef;
  @ViewChild('artistTableDesktop') artistTableDesktop!: FlexibleTableDesktopComponent;
  @ViewChild('artistTableMobile') artistTableMobile!: FlexibleTableMobileComponent;
  // モーダル展開制御
  isOpenImageModal: boolean = false;
  // サンプルモード
  isSample: boolean = true;
  // ステータス（初期化/差分取得/完了）
  status: 'load' | 'add' | 'complete' = 'complete';
  // モーダル画像情報
  modalImageA?:ImageModalData = undefined;
  modalImageB?:ImageModalData = undefined;
  // 総件数
  total:number = 0;
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
  // メモリスト
  memoList: string[] = [];
  // 検索フォーム
  props:SearchFormProps = new SearchFormProps();
  // 読込済みページ数
  cumulTotal:number = 0;
  // 現在のページ番号
  page: number = 0;
  // ソート情報
  sort: {[key:string]: boolean} = {};

  constructor(
    private sideMenuService: SideMenuService,
    private apiService: ApiService,
    private scrollContainerService: ScrollContainerService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
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
      'tag_id'         :CellLabel('ID'),
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
      'memo'          : {width: '120px'},
      'domain'        : {width: '80px'},
      'url'           : {width: '60px'},
      'tag'           : {isViewMiddle:true},
      'artist_id'     : {},
      'artist_name'   : {isViewMiddle:true},
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
      'gen_url'       : {isViewBottom:true},
      'img_url'       : {isViewBottom:true}
    };
    // trackByキー
    this.trackByKeys = ['tag', 'tag_id', 'artist_id'];
    // 非表示カラム
    this.hideColumns = ["tag_id", "artist_id", "other_names", "img_name", "dled_at", "last_dled_at", "gen_model", "gen_name", "gened_at", "last_gened_at"];
    // ソート情報
    this.sort = {'post_count': false};
  }

  ngOnInit() {
    // サービスのスクロールイベントを購読
    this.scrollContainerService.addScrollListener(this.onScrollContainer, this);
    // ブラウザの戻るボタン対応
    window.addEventListener('popstate', this.onPopState.bind(this));
  }

  ngAfterViewInit() {
    this.sideMenuService.setContent(this.sideMenuContent);
    // 次のマイクロタスクで検索実行（スピナー表示を確実にする）
    this.search();
  }

  ngOnDestroy(): void {
    this.sideMenuService.clearContent();
    this.scrollContainerService.removeScrollListener(this.onScrollContainer, this);
    window.removeEventListener('popstate', this.onPopState.bind(this));
  }

  search(isAdd: boolean = false) {
    if (this.status !== 'complete')
      return;

    if (isAdd) {
      this.status = 'add';
      this.cdr.markForCheck();
    } else {
      this.status = 'load';
      this.cdr.detectChanges();
    }

    Promise.resolve().then(async ()=>{
      try {
        if (!isAdd) {
          this.data = [];
          this.total = 0;
          this.cumulTotal = 0;
          this.page = 0;
          const response = await this.apiService.searchArtistDataAndTotal(LOAD_LIMIT, this.page, this.sort, this.props).toPromise();
          this.total = response.total;
          this.transformData(response.result).forEach(item => this.data.push(item));
          this.cdr.markForCheck();

        } else {
          const response = await this.apiService.searchArtistData(LOAD_LIMIT, this.page, this.sort, this.props).toPromise();
          this.transformData(response).forEach(item => this.data.push(item));
        }
        
        this.cumulTotal = this.data.length;

      } catch (error) {
        console.error('API error:', error);

      } finally {
        this.status = 'complete';
        this.cdr.detectChanges();
      }
    });
  }

  // 取得データを加工
  transformData(response:[{[key:string]:any}]) {
    return response.map((item, index) => {
      const processedItem = { ...item };
      
      // 事前計算済みIDを追加（trackBy最適化用）
      processedItem['_cachedId'] = `${item['tag']}_${item['artist_id']}_${this.data.length + index}`;
      
      // domainの処理（カンマで分割し、それぞれを最初のピリオドより前の文字列だけ抜き出し、<br>で連結）
      if (item['domain']) {
        processedItem['domain'] = item['domain']
          .split(',')
          .map((domain: string) => domain.trim().split('.')[0])
          .join('<br>');
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

  // ソートクリア
  onClearSort() {
    this.artistTableDesktop?.clearSort(false);
    this.artistTableMobile?.clearSort(false);
    this.sort = {};
    this.search();
  }

  // ソート切り替え
  onChangeSort(sortedColumns: {[key:string]: boolean}) {
    this.sort = sortedColumns;
    this.search();
  }

  // Favorite切り替え処理
  onChangeFavorite(tagId:number, memo?:string, favorite?:boolean) {
    this.apiService.updateFavorite(tagId, favorite, memo).subscribe(res => {}, err => {console.error('APIでエラーが発生しました:', err)});
  }

  // スクロールイベント
  onScrollContainer() {
    const element = this.scrollContainerService.getScrollContainerElement();
    if (this.status !== 'complete' || !element) return;

    const position = element.scrollTop + element.clientHeight;
    const height = element.scrollHeight;

    if (position >= height - THRESHOLD) {
      if (this.cumulTotal < this.total) {
        this.page++;
        this.search(true);
      }
    }
  }

  // 検索：ドメイン切り替え
  onChangeSearchDomain(event:Event) {
    const target = event.target as HTMLInputElement;

    if (target.checked) {
      if (!this.props.domain.includes(target.value)) {
        this.props.domain.push(target.value);
      }
    } else {
      var index = this.props.domain.indexOf(target.value, 0);
      if (index > -1) {
        this.props.domain.splice(index, 1);
      }
    }
  }

  // 検索：クリア
  onClearSearchForm() {
    this.props = new SearchFormProps();
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
      this.cdr.detectChanges(); // 非同期処理内でChange Detection
    });
    this.apiService.getImageType(this.isSample ? "sample" : gen_path).subscribe((typeB: string) => {
      if (typeB != 'none') {
        this.modalImageB = {
          mimeType: typeB,
          url: this.getImageUrl(gen_path, false)
        }
      }
      this.cdr.detectChanges(); // 非同期処理内でChange Detection
    });

    // モーダル表示前に履歴に状態を追加
    history.pushState({ modal: true }, '', '');
    this.isOpenImageModal = true;
    this.cdr.detectChanges();
  }

  // モーダルを閉じる処理
  closeImageModal() {
    this.modalImageA = undefined;
    this.modalImageB = undefined;
    this.isOpenImageModal = false;
    this.cdr.detectChanges();
  }

  // サンプル表示トグル
  toggleSampleImage() {
    this.isSample = !this.isSample;
    
    // データのURLを更新
    this.data.forEach((data) => {
      data['gen_url'] = this.getImageUrl(data['gen_path'], true);
      data['img_url'] = this.getImageUrl(data['img_path'], true);
    });
    // Injectorキャッシュをクリア（動的コンポーネントの更新を強制）
    this.artistTableDesktop?.clearInjectorCache?.();
    this.artistTableMobile?.clearInjectorCache?.();
    this.cdr.detectChanges();
  }

  // カラム表示切替
  toggleColumnVisibility(columnKey: string) {
    const index = this.hideColumns.indexOf(columnKey);
    if (index > -1) {
      this.hideColumns.splice(index, 1);
    } else {
      this.hideColumns.push(columnKey);
    }
    this.cdr.detectChanges();
  }

  // 非表示切替可能なカラム一覧
  getHideableColumns(): string[] {
    return Object.keys(this.labels);
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
