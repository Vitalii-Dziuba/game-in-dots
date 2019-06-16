import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { GameService } from '../../shared/game.service';
import { IGameSettings } from '../../shared/game-settings';
import { interval } from 'rxjs';
import { Winner } from '../../shared/winner.enum'
import { IWinner } from '../../shared/winner'
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  @Output() updateWinners = new EventEmitter<boolean>();

  settings: IGameSettings[] = [];
  winner: Winner;
  result: IWinner = {winner: '', date: ''};
  form: FormGroup;

  formSubmitted: boolean = false;
  finished: boolean = false;
  ticks: number = 4;
  table: number[][] = Array(5).fill(Array(5).fill(0));

  gameInterval;
  currentSquare: number[];
  counter: { green: number, red: number, halfSquares: number} =
    { green: 0, red: 0, halfSquares: 0};

  constructor(private gameService: GameService) { }

  ngOnInit() {
    this.form = new FormGroup({
      setting: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required)
    });

    this.gameService.getGameSettings()
      .subscribe((response: IGameSettings[]) => {
      this.settings = Object.keys(response).map(key => (response[key]));
      this.settings[0].name = 'Easy Mode';
      this.settings[1].name = 'Normal Mode';
      this.settings[2].name = 'Hard Mode';
    });
  }

  onSelectSettings() {
    if (!this.form.value.setting) {
      this.form.value.setting = {field: 5};
    }
    this.table = Array.from(Array(this.form.value.setting.field),
      () => Array.from(Array(this.form.value.setting.field), () => 0));

    this.counter.halfSquares = Math.pow(this.form.value.setting.field, 2) / 2;
    this.currentSquare = [this.getRandomInt(this.form.value.setting.field),
        this.getRandomInt(this.form.value.setting.field)];
  }

  play() {
    this.formSubmitted = true;
    this.finished = false;
    this.onSelectSettings();

    if (this.form.valid) {
      this.form.disable();
      this.ticks -= 1;
      const subscription = interval(1000)
        .subscribe(() => {
          this.ticks -= 1

          if (this.ticks < 0) {
            this.ticks = 4;
            this.counter.red = 0;
            this.counter.green = 0;
            this.winner = 0;
            this.startGame();
            subscription.unsubscribe();
          }
        });
    }
  }

  startGame() {
    this.onSquareTick();
    this.gameInterval = interval(this.form.value.setting.delay)
      .subscribe(() => this.onSquareTick());
  }

  onSquareTick() {
    if (this.table[this.currentSquare[0]][this.currentSquare[1]] === 1) { //set red square player missed
      this.table[this.currentSquare[0]][this.currentSquare[1]] = 3;
      this.counter.red += 1;
    }

    if (this.counter.red + this.counter.green !== this.counter.halfSquares * 2) { //not a draw
      while (this.table[this.currentSquare[0]][this.currentSquare[1]] !== 0) {
        this.currentSquare = [this.getRandomInt(this.form.value.setting.field),
          this.getRandomInt(this.form.value.setting.field)];
      }

      if (this.counter.halfSquares < this.counter.green ||
        this.counter.halfSquares < this.counter.red) { //game is finished
        this.gameInterval.unsubscribe();
        this.finished = true;
        this.form.enable();

        if (this.counter.green > this.counter.red) { //winner
          this.winner = Winner.player;
          this.result.winner = this.form.value.name;
        } else {
          this.winner = Winner.computer;
          this.result.winner = 'Computer';
        }
        this.result.date = formatDate(new Date(), 'medium', 'en-US');

        this.gameService.post(this.result)
          .subscribe(() => this.updateWinners.emit(true));

      } else {
        this.table[this.currentSquare[0]][this.currentSquare[1]] = 1;
      }
    } else { //a draw
      this.gameInterval.unsubscribe();
      this.form.enable();
      this.finished = true;
      this.winner = Winner.no;
    }
  }

  onSquareClick(i, j) {
    if (this.table[this.currentSquare[0]][this.currentSquare[1]] === 1) {
      if (this.currentSquare[0] === i && this.currentSquare[1] === j) {
        this.table[this.currentSquare[0]][this.currentSquare[1]] = 2;
        this.counter.green += 1;
      } else {
        this.table[this.currentSquare[0]][this.currentSquare[1]] = 3;
        this.counter.red += 1;
      }
    }
  }

  getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }
}
