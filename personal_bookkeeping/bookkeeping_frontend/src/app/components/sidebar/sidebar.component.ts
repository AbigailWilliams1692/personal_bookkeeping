import { Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

export type TabId = 'add-record' | 'view-records' | 'statistics' | 'settings';

interface NavItem {
  id: TabId;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  private userService = inject(UserService);

  activeTab = input<TabId>('add-record');
  tabChange = output<TabId>();

  username = this.userService.currentUsername;

  navItems: NavItem[] = [
    { id: 'add-record', icon: 'fa-plus-circle', label: '添加新纪录' },
    { id: 'view-records', icon: 'fa-list', label: '查看所有记录' },
    { id: 'statistics', icon: 'fa-chart-pie', label: '统计分析' },
    { id: 'settings', icon: 'fa-cog', label: '设置' }
  ];

  onTabClick(tabId: TabId): void {
    this.tabChange.emit(tabId);
  }

  onUsernameChange(value: string): void {
    this.userService.setUsername(value);
  }
}
