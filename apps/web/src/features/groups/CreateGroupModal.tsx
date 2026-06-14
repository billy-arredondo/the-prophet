import { createGroupSchema } from '@the-prophet/shared';
import { useCreateGroup } from '@/hooks/useGroups';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// NOTE: @hookform/resolvers is a TODO dependency — add to package.json if using this modal.
// For now, inline validation keeps the modal functional without the extra dep.

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CreateGroupModal({ open, onClose }: Props) {
  const createGroup = useCreateGroup();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const description = String(form.get('description') ?? '').trim();

    if (!name) return;

    const parsed = createGroupSchema.safeParse({
      name,
      description,
      tournamentId: 'wc2026',
    });
    if (!parsed.success) return;

    await createGroup.mutateAsync(parsed.data);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Grupo</DialogTitle>
          <DialogDescription>
            Crea un grupo privado para predecir con amigos y familia.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="create-name" className="text-sm font-bold text-(--color-on-surface)">
              Nombre del grupo *
            </label>
            <Input
              id="create-name"
              name="name"
              placeholder="Los García"
              maxLength={60}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="create-desc" className="text-sm font-bold text-(--color-on-surface)">
              Descripción (opcional)
            </label>
            <Input
              id="create-desc"
              name="description"
              placeholder="La familia completa"
              maxLength={280}
            />
          </div>

          <div className="flex gap-3 mt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={createGroup.isPending}>
              {createGroup.isPending ? 'Creando...' : 'Crear Grupo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
