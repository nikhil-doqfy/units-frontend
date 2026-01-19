import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-call-voice-summary',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './call-voice-summary.component.html',
  styleUrl: './call-voice-summary.component.css',
})
export class CallVoiceSummaryComponent {
  @Input() audioUrl: string = ''; // default empty
  @Input() summary: string = ''; // default empty

  isPlaying: boolean = false;

  togglePlay(audio: HTMLAudioElement) {
    if (!audio) return;
    if (audio.paused) {
      audio.play();
      this.isPlaying = true;
      audio.onended = () => (this.isPlaying = false);
    } else {
      audio.pause();
      this.isPlaying = false;
    }
  }
}
