import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {IWinner } from './winner';


@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private http: HttpClient) { }

  baseUrl: string = 'https://starnavi-frontend-test-task.herokuapp.com/';

  getGameSettings() {
    return this.http.get(this.baseUrl + 'game-settings');
  }

  getWinners() {
    return this.http.get(this.baseUrl + 'winners');
  }

  post(winner: IWinner) {
  	return this.http.post(this.baseUrl + 'winners', winner);
  }
}
