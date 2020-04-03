import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ErrorInfoService {

  constructor(private snackBar: MatSnackBar) { }

  showInfo(content: string, action?: string) {
    this.snackBar.open(content, action, { duration: 2000, panelClass: ['bg-discord-blue'] });
  }

  showError(content: string, action?: string) {
    this.snackBar.open(content, action, { duration: 2000, panelClass: ['bg-discord-red'] });
  }
}
