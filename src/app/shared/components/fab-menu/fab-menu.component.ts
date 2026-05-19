import { Component, input, output, signal } from '@angular/core';

export interface FabAction {
  id: string;
  label: string;
  icon: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-fab-menu',
  standalone: true,
  template: `
    <div class="fab-root" [class.fab-root--open]="isOpen()">
      @if (isOpen()) {
        <div class="fab-backdrop" (click)="close()" aria-hidden="true"></div>
      }

      <ul class="fab-actions" role="menu" [attr.aria-hidden]="!isOpen()">
        @for (action of actions(); track action.id) {
          <li role="none">
            <button
              type="button"
              class="fab-action"
              role="menuitem"
              [disabled]="action.disabled"
              [attr.aria-label]="action.label"
              (click)="onAction(action.id)">
              <span class="fab-action__label">{{ action.label }}</span>
              <span class="fab-action__icon" aria-hidden="true">{{ action.icon }}</span>
            </button>
          </li>
        }
      </ul>

      <button
        type="button"
        class="fab-main"
        [attr.aria-expanded]="isOpen()"
        aria-label="Menú de acciones"
        (click)="toggle()">
        <span class="fab-main__icon" [class.fab-main__icon--open]="isOpen()">+</span>
      </button>
    </div>
  `,
  styles: `
    .fab-root {
      position: fixed;
      right: max(16px, env(safe-area-inset-right));
      bottom: max(16px, env(safe-area-inset-bottom));
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
    }

    .fab-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.35);
      z-index: -1;
    }

    .fab-actions {
      list-style: none;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
      opacity: 0;
      pointer-events: none;
      transform: translateY(12px);
      transition: opacity 0.2s, transform 0.2s;
    }

    .fab-root--open .fab-actions {
      opacity: 1;
      pointer-events: auto;
      transform: translateY(0);
    }

    .fab-action {
      display: flex;
      align-items: center;
      gap: 10px;
      border: none;
      cursor: pointer;
      background: #242940;
      color: #eef0f6;
      padding: 10px 14px;
      border-radius: 28px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
      transition: transform 0.15s, background 0.15s;
    }

    .fab-action:hover:not(:disabled) {
      background: #2f3650;
      transform: scale(1.02);
    }

    .fab-action:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .fab-action__icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #4f7cff;
      font-size: 1rem;
    }

    .fab-main {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, #4f7cff, #6b91ff);
      color: #fff;
      cursor: pointer;
      box-shadow: 0 6px 20px rgba(79, 124, 255, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .fab-main:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 24px rgba(79, 124, 255, 0.55);
    }

    .fab-main__icon {
      font-size: 1.75rem;
      line-height: 1;
      transition: transform 0.25s;
    }

    .fab-main__icon--open {
      transform: rotate(45deg);
    }

    @media (min-width: 768px) {
      .fab-root {
        right: 24px;
        bottom: 24px;
      }

      .fab-main {
        width: 60px;
        height: 60px;
      }
    }
  `
})
export class FabMenuComponent {
  readonly actions = input.required<FabAction[]>();
  readonly actionSelected = output<string>();

  readonly isOpen = signal(false);

  toggle(): void {
    this.isOpen.update((open) => !open);
  }

  close(): void {
    this.isOpen.set(false);
  }

  onAction(actionId: string): void {
    this.actionSelected.emit(actionId);
    this.close();
  }
}
