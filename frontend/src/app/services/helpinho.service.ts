

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, mergeMap } from 'rxjs';
import { Auth } from 'aws-amplify';

export interface Helpinho {
  id: string;
  userId: string;
  title: string;
  description: string;
  goal: number;
  receivedAmount: number;
  category: string;
  deadline: string;
  createdAt: string;
  photo: string;
  isUrgent: boolean;
  creator: {
    name: string;
    photo: string;
    email: string;
  };
  donors: Donor[];
  donorsCount: number;
}
export interface Donor {
  id: string;
  name: string;
  photo: string;
  email: string;
  donationAmount: string;
}

@Injectable({
  providedIn: 'root',
})
export class HelpinhoService {
  // private apiUrl = 'http://localhost:3000/dev';
  private apiUrl = 'https://3bnoonhun1.execute-api.sa-east-1.amazonaws.com/dev';
  userId: string | undefined;

  constructor(private http: HttpClient) {
    this.getUserId().then((id) => {
      this.userId = id;
    });}

  async getUserId(): Promise<string> {
    const user = await Auth.currentAuthenticatedUser();
    return user.attributes.sub;
  }

  getHelpinhos(data : {
    limit: number,
    lastEvaluatedKey?: string | null,
    searchTerm?: string,
    filters?: any,
    sort?: string,
    donorsLimit?: number
  }): Observable<any> {

    const { limit, lastEvaluatedKey, searchTerm, filters, sort, donorsLimit} = data

    let params = new HttpParams().set('limit', limit.toString());

    if (donorsLimit) {
      params = params.set('donorsLimit', donorsLimit);
    }
    if (lastEvaluatedKey) {
      params = params.set('lastEvaluatedKey', lastEvaluatedKey);
    }
    if (searchTerm && searchTerm.trim() !== '') {
      params = params.set('search', searchTerm);
    }

    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }

    if (sort) {
      params = params.set('sort', sort);
    }

    return this.http.get<any>(`${this.apiUrl}/helpinhos`, { params });
  }

  getHelpinhosWithFilters(filters: any): Observable<any> {
    let params = new HttpParams();

    if (filters.category) {
      params = params.set('category', filters.category);
    }
    if (filters.goalMin) {
      params = params.set('goalMin', filters.goalMin);
    }
    if (filters.goalMax) {
      params = params.set('goalMax', filters.goalMax);
    }
    if (filters.deadline) {
      params = params.set('deadline', filters.deadline);
    }
    if (filters.sortOrder) {
      params = params.set('sort', filters.sortOrder);
    }
    if (filters.title) {
      params = params.set('search', filters.title);
    }
    if (filters.limit) {
      params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<any>(`${this.apiUrl}/helpinhos`, { params });
  }

  createHelpinho(helpinhoData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/helpinhos`, helpinhoData);
  }

  updateHelpinho(helpinhoData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/helpinhos/${helpinhoData.id}`, helpinhoData);
  }

  deleteHelpinho(helpinhoId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/helpinhos/${helpinhoId}`);
  }

  getHelpinhoById(helpinhoId: string): Observable<Helpinho> {
    return this.http.get<Helpinho>(`${this.apiUrl}/helpinhos/${helpinhoId}`);
  }

  getUserStatistics(userId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${userId}/statistics`);
  }

  followHelpinho(helpinhoId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/helpinhos/${helpinhoId}/follow`, {});
  }

  unfollowHelpinho(helpinhoId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/helpinhos/${helpinhoId}/unfollow`, {});
  }

  getCreatedHelpinhos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${this.userId}/helpinhos`);
  }

  getFollowedHelpinhos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${this.userId}/followed-helpinhos`);
  }

  donateToHelpinho(helpinhoId: string, amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/helps`, { helpinhoId, amount });
  }

  uploadUserPhoto(data: { photoBase64: string }): Promise<any> {
    return this.http.post<any>(`${this.apiUrl}/users/uploadPhoto`, data).toPromise();
  }
}
