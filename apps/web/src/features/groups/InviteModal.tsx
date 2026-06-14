import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

interface Props {
  open: boolean;
  onClose: () => void;
  groupName: string;
  inviteCode: string;
}

export function InviteModal({ open, onClose, groupName, inviteCode }: Props) {
  const [copied, setCopied] = useState(false);

  const inviteLink = `${window.location.origin}/join?code=${inviteCode}`;

  function handleCopy() {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invitar a {groupName}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 mt-2">
          {/* QR Code */}
          <div className="p-4 bg-white rounded-xl shadow-sm border border-(--color-surface-container)">
            <QRCodeSVG value={inviteLink} size={180} level="M" />
          </div>

          {/* Invite code */}
          <div className="w-full bg-(--color-surface-container-low) rounded-xl p-4 border border-(--color-outline-variant)/30">
            <p className="text-xs font-bold text-(--color-on-surface-variant) mb-2 uppercase tracking-wider">
              Código de invitación
            </p>
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xl tracking-widest text-(--color-primary)">
                {inviteCode}
              </span>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg hover:bg-(--color-surface-container) transition-colors text-(--color-stadium-green-light)"
                aria-label="Copiar código"
              >
                <MaterialIcon icon={copied ? 'check' : 'content_copy'} />
              </button>
            </div>
          </div>

          {/* Share link */}
          <button
            onClick={handleCopy}
            className="w-full h-12 bg-(--color-stadium-green-light) text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-(--color-stadium-green-dark) transition-all"
          >
            <MaterialIcon icon={copied ? 'check' : 'share'} />
            {copied ? '¡Copiado!' : 'Copiar enlace de invitación'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
