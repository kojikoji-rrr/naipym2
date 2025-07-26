import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    public API_URL = location.hostname === 'localhost' ? 'http://localhost:8080' : 'http://192.168.10.200:8080';
    public API_BASE = 'rest/api';
    public urlResource = {
        ARTIST_MASTER: `${this.API_BASE}/artist/master`,
        ARTIST_DATA_AND_TOTAL: `${this.API_BASE}/artist/data_and_total`,
        ARTIST_DATA: `${this.API_BASE}/artist/data`,
        ARTIST_TYPE: `${this.API_BASE}/artist/mime`,
        TOOL_CURL: `${this.API_BASE}/tools/fetch`,
        TOOL_D_SEARCH_ARTIST: `${this.API_BASE}/tools/d_search_artist`,
        TOOL_D_SEARCH_TAG: `${this.API_BASE}/tools/d_search_tag`,
        TOOL_BACKUP: `${this.API_BASE}/tools/backup`,
        TOOL_DATABASE: `${this.API_BASE}/tools/database`,
        BATCH_BOOKMARKS: `${this.API_BASE}/batch/bookmarks`,
        BATCH_INFO: `${this.API_BASE}/batch/info`,
        BATCH_EXEC: `${this.API_BASE}/batch/exec`,
        FAVORITE: `${this.API_BASE}/favorite`,
    }

    constructor(private http: HttpClient) {}

    public async getArtistMaster(): Promise<any> {
        const url = new URL(this.urlResource.ARTIST_MASTER, this.API_URL);
        return await firstValueFrom(this.http.get(url.toString(), { responseType: 'json' }));
    }

    public searchArtistDataAndTotal(limit: number = 50, page:number, sort:{[key:string]:boolean}, props: any): Observable<any> {
        const url = new URL(this.urlResource.ARTIST_DATA_AND_TOTAL, this.API_URL);
        const body = {limit: limit, page: page, sort: sort, props: props};
        return this.http.post(url.toString(), body);
    }

    public searchArtistData(limit: number = 50, page:number, sort:{[key:string]:boolean}, props: any): Observable<any> {
        const url = new URL(this.urlResource.ARTIST_DATA, this.API_URL);
        const body = {limit: limit, page: page, sort: sort, props: props};
        return this.http.post(url.toString(), body);
    }

    public getImageType(path: string): Observable<any> {
        var url = new URL(`${this.urlResource.ARTIST_TYPE}/${path}`, this.API_URL);
        return this.http.get(url.toString(), { responseType: 'text' });
    }

    public updateFavorite(tagId: number, favorite: boolean | undefined, memo: string | undefined): Observable<any> {
        const url = new URL(this.urlResource.FAVORITE, this.API_URL);
        const body = { tagId: tagId, favorite: favorite, memo: memo };
        return this.http.post(url.toString(), body);
    }

    public fetch(target:string): Observable<any> {
        const url = new URL(this.urlResource.TOOL_CURL, this.API_URL);
        url.searchParams.append('target', target);
        return this.http.get(url.toString());
    }

    public searchDanbooruByArtist(keyword:string, maxPage:string): Observable<any> {
        const url = new URL(this.urlResource.TOOL_D_SEARCH_ARTIST, this.API_URL);
        url.searchParams.append('keyword', keyword);
        url.searchParams.append('max_page', maxPage);
        return this.http.get(url.toString());
    }

    public searchDanbooruByTag(keyword:string, maxPage:string): Observable<any> {
        const url = new URL(this.urlResource.TOOL_D_SEARCH_TAG, this.API_URL);
        url.searchParams.append('keyword', keyword);
        url.searchParams.append('max_page', maxPage);
        return this.http.get(url.toString());
    }

    public getDBBackupList(): Observable<any> {
        const url = new URL(this.urlResource.TOOL_BACKUP, this.API_URL);
        return this.http.get(url.toString());
    }

    public createDBBackup(): Observable<any> {
        const url = new URL(this.urlResource.TOOL_BACKUP, this.API_URL);
        return this.http.post(url.toString(), {});
    }
    
    public deleteDBBackup(filename: string): Observable<any> {
        const url = new URL(`${this.urlResource.TOOL_BACKUP}/${filename}`, this.API_URL);
        return this.http.delete(url.toString());
    }

    public getTablesAndLogs(): Observable<any> {
        const url = new URL(this.urlResource.TOOL_DATABASE, this.API_URL);
        return this.http.get(url.toString());
    }

    public refleshQueryLogs(): Observable<any> {
        const url = new URL(this.urlResource.TOOL_DATABASE, this.API_URL);
        return this.http.delete(url.toString());
    }

    public executeQuery(query:string): Observable<any> {
        const url = new URL(this.urlResource.TOOL_DATABASE, this.API_URL);
        return this.http.post(url.toString(), {query: query});
    }

    public getBookmarkFile(): Observable<any> {
        const url = new URL(this.urlResource.BATCH_BOOKMARKS, this.API_URL);
        return this.http.get(url.toString());
    }

    public uploadBookmarkFile(file:File): Observable<any> {
        const url = new URL(this.urlResource.BATCH_BOOKMARKS, this.API_URL);
        const formData = new FormData();

        formData.append('file', file);
        return this.http.post(url.toString(), formData);  
    }

    public deleteBookmarkFile(filename: string): Observable<any> {
        const url = new URL(`${this.urlResource.BATCH_BOOKMARKS}/${filename}`, this.API_URL);
        return this.http.delete(url.toString());
    }

    public getBatchInfoAll(): Observable<any> {
        const url = new URL(this.urlResource.BATCH_INFO, this.API_URL);
        return this.http.get(url.toString());
    }

    public getBatchInfo(jobId:string, lastline:number=0): Observable<any> {
        const url = new URL(`${this.urlResource.BATCH_INFO}/${jobId}`, this.API_URL);
        url.searchParams.append('lastline', lastline.toString());
        return this.http.get(url.toString());
    }

    public executeBatch(key:string): Observable<any> {
        const url = new URL(this.urlResource.BATCH_EXEC, this.API_URL);
        return this.http.post(url.toString(), {batchname: key});
    }
}