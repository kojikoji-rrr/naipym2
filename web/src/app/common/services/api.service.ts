import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
    private API_URL = location.hostname === 'localhost' ? 'http://localhost:8080' : 'http://192.168.10.200:8080';
    private API_BASE = '/rest/api';

    public urlResource = {
        ARTIST_DATA_AND_TOTAL: `${this.API_BASE}/artist/data_and_total`,
        ARTIST_DATA: `${this.API_BASE}/artist/data`,
        ARTIST_IMAGE: `${this.API_BASE}/artist/image`
    }

    constructor(private http: HttpClient) {}

    public searchArtistDataAndTotal(limit:number=50, offset:number=0, sort:{[key:string]: boolean}={}): Observable<any> {
        var url = new URL(this.urlResource.ARTIST_DATA_AND_TOTAL, this.API_URL);
        url.searchParams.append('limit', limit.toString());
        url.searchParams.append('offset', offset.toString());
        url.searchParams.append('sort', JSON.stringify(sort));
        return this.http.get(url.toString(), { responseType: 'json' })
    }

    public searchArtistData(limit:number=50, offset:number=0, sort:{[key:string]: boolean}={}): Observable<any> {
        var url = new URL(this.urlResource.ARTIST_DATA, this.API_URL);
        url.searchParams.append('limit', limit.toString());
        url.searchParams.append('offset', offset.toString());
        url.searchParams.append('sort', JSON.stringify(sort));
        return this.http.get(url.toString(), { responseType: 'json' })
    }

    public getArtistThumbnail(path:string, is_sample:boolean): Observable<any> {
        var url = new URL(this.urlResource.ARTIST_IMAGE, this.API_URL);
        url.searchParams.append('path', path);
        url.searchParams.append('is_sample', is_sample.toString());
        url.searchParams.append('is_thumbnail', "true");
        return this.http.get(url.toString(), { responseType: 'json' })
    }

    public getArtistImage(path:string, is_sample:boolean): Observable<any> {
        var url = new URL(this.urlResource.ARTIST_IMAGE, this.API_URL);
        url.searchParams.append('path', path);
        url.searchParams.append('is_sample', is_sample.toString());
        url.searchParams.append('is_thumbnail', "false");
        return this.http.get(url.toString(), { responseType: 'json' })
    }
}