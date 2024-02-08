import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

/**
 * Service to make HTTP calls
 */
export class HttpService {
  constructor(private httpClient: HttpClient) {}

  /**
   * @returns embed configuration
   */
  getEmbedConfig(endpoint: string): Observable<any> {
    return this.httpClient.get<any>(endpoint);
  }
}
