import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    <div class="modal-backdrop" role="dialog" aria-modal="true" (click)="onBackdropClick()">
      <div class="modal-panel" [class.modal-panel--wide]="wide()" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <h2 class="modal-title">{{ title() }}</h2>
          <button type="button" class="modal-close" aria-label="Cerrar" (click)="closed.emit()">×</button>
        </header>
        <div class="modal-body">
          <ng-content />
        </div>
        <footer class="modal-footer">
          <ng-content select="[modal-actions]" />
        </footer>
      </div>
    </div>
  `,
  styles: `
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1100;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      padding: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
    }

    .modal-panel {
      width: 100%;
      max-height: 92vh;
      overflow: auto;
      background: #1e2334;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px 16px 0 0;
      color: #eef0f6;
      animation: slideUp 0.25s ease;
    }

    @media (min-width: 640px) {
      .modal-backdrop {
        align-items: center;
        padding: 24px;
      }

      .modal-panel {
        max-width: 440px;
        border-radius: 16px;
        max-height: 85vh;
      }

      .modal-panel--wide {
        max-width: 560px;
      }
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 20px 0;
    }

    .modal-title {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 600;
    }

    .modal-close {
      border: none;
      background: transparent;
      color: #8b93b0;
      font-size: 1.75rem;
      line-height: 1;
      cursor: pointer;
      padding: 0 4px;
    }

    .modal-close:hover {
      color: #eef0f6;
    }

    .modal-body {
      padding: 16px 20px;
    }

    .modal-footer {
      padding: 0 20px 20px;
    }

    @keyframes slideUp {
      from {
        transform: translateY(100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `
})
export class ModalComponent {
  readonly title = input.required<string>();
  readonly wide = input(false);
  readonly closeOnBackdrop = input(true);
  readonly closed = output<void>();

  onBackdropClick(): void {
    if (this.closeOnBackdrop()) {
      this.closed.emit();
    }
  }
}
