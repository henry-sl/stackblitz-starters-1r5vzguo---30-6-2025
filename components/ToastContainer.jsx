// components/ToastContainer.jsx
// This component manages the container for all toast notifications
// It positions toasts in the top-right corner of the screen

import Toast from './Toast';
import { useToast } from '../hooks/useToast';

export default function ToastContainer() {
  // Get toast state and functions from the useToast hook
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* Render each toast notification */}
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}