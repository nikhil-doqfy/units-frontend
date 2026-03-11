import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { PlayIconsComponent } from '../../icons/play-icons/play-icons.component';
import { PauseIconsComponent } from '../../icons/pause-icons/pause-icons.component';

@Component({
  selector: 'app-audio-player',
  standalone: true,
  imports: [CommonModule, PlayIconsComponent, PauseIconsComponent],
  templateUrl: './audio-player.component.html',
  styleUrl: './audio-player.component.css',
})
export class AudioPlayerComponent {
  @ViewChild('audio') audio!: ElementRef;

  showPlayer = false;
  progress = 0;

  playAudio() {
    this.showPlayer = true;

    setTimeout(() => {
      this.audio.nativeElement.play();
    });
  }

  closePlayer() {
    this.audio.nativeElement.pause();
    this.showPlayer = false;
  }

  updateProgress() {
    const player = this.audio.nativeElement;
    this.progress = (player.currentTime / player.duration) * 100;
  }

  seekAudio(event: any) {
    const player = this.audio.nativeElement;
    player.currentTime = (event.target.value / 100) * player.duration;
  }
}
