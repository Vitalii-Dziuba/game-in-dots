import { Component, OnInit, Input } from '@angular/core';
import { GameService } from '../../shared/game.service';
import { ILeader } from '../../shared/leader';

@Component({
  selector: 'app-leader-board',
  templateUrl: './leader-board.component.html',
  styleUrls: ['./leader-board.component.scss']
})
export class LeaderBoardComponent implements OnInit {
  @Input() updateWinners;
  leaders: ILeader[] = [];

  constructor(private gameService: GameService) { }

  ngOnInit() {
    this.setWinners();
  }

  ngOnChanges(changes) {
    this.setWinners();
  }

  setWinners() {
    this.gameService.getWinners()
      .subscribe((response: ILeader[])  => {
        this.leaders = response.reverse();
      });
  }

}
