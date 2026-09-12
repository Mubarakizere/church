import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName: string;
  loading?: boolean;
}

const DeleteModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  itemName, 
  loading = false 
}: DeleteModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            {title}
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please confirm before proceeding.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-2">{message}</p>
          <p className="font-medium text-gray-900">
            Are you sure you want to delete <span className="text-red-600">"{itemName}"</span>?
          </p>
          <p className="text-sm text-red-600 mt-2">
            This action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={onConfirm} 
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteModal;
