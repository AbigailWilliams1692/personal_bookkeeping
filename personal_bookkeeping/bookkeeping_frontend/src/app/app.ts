import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent, TabId } from './components/sidebar/sidebar.component';
import { AddRecordComponent } from './components/add-record/add-record.component';
import { ViewRecordsComponent } from './components/view-records/view-records.component';
import { StatisticsComponent } from './components/statistics/statistics.component';
import { SettingsComponent } from './components/settings/settings.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    AddRecordComponent,
    ViewRecordsComponent,
    StatisticsComponent,
    SettingsComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('个人财务记账App');
  protected activeTab = signal<TabId>('add-record');

  onTabChange(tabId: TabId): void {
    this.activeTab.set(tabId);
  }
}
