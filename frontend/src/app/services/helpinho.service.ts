

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, mergeMap } from 'rxjs';
import { Auth } from 'aws-amplify';

export interface Helpinho {
  id: string;
  userId: string;
  photo: string;
  title: string;
  description: string;
  goal: number;
  creatorName: string;
  creatorEmail: any;
  creatorPhoto: any;
  category: string;
  deadline: string;
  createdAt: string;
  receivedAmount: number;
  donors: any
}

@Injectable({
  providedIn: 'root',
})
export class HelpinhoService {
  private apiUrl = 'http://localhost:3000/dev';
  // private apiUrl = 'https://3bnoonhun1.execute-api.sa-east-1.amazonaws.com/dev';
  userId: string | undefined;

  constructor(private http: HttpClient) {
    this.getUserId().then((id) => {
      this.userId = id;
    });}

  async getUserId(): Promise<string> {
    const user = await Auth.currentAuthenticatedUser();
    return user.attributes.sub;
  }

  getHelpinhos(
    limit: number,
    lastEvaluatedKey?: string | null,
    searchTerm?: string,
    filters?: any,
    sort?: string
  ): Observable<any> {
    let params = new HttpParams().set('limit', limit.toString());

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

    return this.http.get<any>(`${this.apiUrl}/helpinhos`, { params });
  }

  createHelpinho(helpinhoData: any): Observable<any> {
    if (helpinhoData.imageFile) {
      return this.convertImageToBase64(helpinhoData.imageFile).pipe(
        mergeMap((base64Image: string) => {
          helpinhoData.photoBase64 = base64Image;

          console.log("Imagem convertida para Base64:", base64Image);

          return this.http.post<any>(`${this.apiUrl}/helpinhos`, helpinhoData);
        })
      );
    } else {
      console.log("Sem arquivo de imagem, enviando dados:", helpinhoData);
      return this.http.post<any>(`${this.apiUrl}/helpinhos`, helpinhoData);
    }
  }
  updateHelpinho(helpinhoData: any): Observable<any> {
    if (helpinhoData.imageFile) {
      return this.convertImageToBase64(helpinhoData.imageFile).pipe(
        mergeMap((base64Image: string) => {
          helpinhoData.photoBase64 = base64Image;

          console.log("Imagem convertida para Base64:", base64Image);

          return this.http.put<any>(`${this.apiUrl}/helpinhos/${helpinhoData.id}`, helpinhoData);
        })
      );
    } else {
      console.log("Sem arquivo de imagem, enviando dados:", helpinhoData);
      return this.http.put<any>(`${this.apiUrl}/helpinhos/${helpinhoData.id}`, helpinhoData);
    }
  }

  private convertImageToBase64(imageFile: File): Observable<string> {
    return new Observable((observer) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        observer.next(base64String);
        observer.complete();
      };
      reader.onerror = (error) => {
        observer.error(error);
      };
      reader.readAsDataURL(imageFile);
    });
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
}
