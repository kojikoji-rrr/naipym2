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
        FAVORITE: `${this.API_BASE}/artist/favorite`
    }

    constructor(private http: HttpClient) { }

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
}