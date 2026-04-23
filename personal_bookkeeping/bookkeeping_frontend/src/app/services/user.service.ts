import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private username = signal('Alfred');

  readonly currentUsername = this.username.asReadonly();

  setUsername(name: string): void {
    this.username.set(name || 'Alfred');
  }

  getUsername(): string {
    return this.username();
  }
}
