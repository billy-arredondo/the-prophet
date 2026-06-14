import { useState } from 'react';
import { joinGroupSchema } from '@the-prophet/shared';
import { useJoinGroup } from '@/hooks/useGroups';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function JoinGroupModal({ open, onClose }: Props) {
  const [error, setError] = useState('');
  const joinGroup = useJoinGroup();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = new FormData(e.currentTarget);
    const inviteCode = String(form.get('code') ?? '').trim().toUpperCase();

    const parsed = joinGroupSchema.safeParse({ inviteCode });
    if (!parsed.success) {
      setError('El código debe tener entre 4 y 16 caracteres.');
      return;
    }

    try {
      await joinGroup.mutateAsync(parsed.data);
      onClose();
    } catch {
      setError('Código inválido o ya eres miembro de este grupo.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unirse a un Grupo</DialogTitle>
          <DialogDescription>
            Ingresa el código de invitación que te compartieron.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="join-code" className="text-sm font-bold text-(--color-on-surface)">
              Código de invitación *
            </label>
            <Input
              id="join-code"
              name="code"
              placeholder="GARCIA26"
              maxLength={16}
              required
              className="font-mono tracking-widest uppercase"
            />
            {error && (
              <p className="text-xs text-(--color-score-red) font-medium">{error}</p>
            )}
          </div>

          <div className="flex gap-3 mt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={joinGroup.isPending}>
              {joinGroup.isPending ? 'Uniéndome...' : 'Unirse'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
