import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent {
  // tslint:disable-next-line: no-output-on-prefix
  @Output() onSearchEvent = new EventEmitter<string>();
  @Input() placeHolder: string;
  text = '';
  onSearch(): void {
    this.onSearchEvent.emit(this.text);
  }
}
