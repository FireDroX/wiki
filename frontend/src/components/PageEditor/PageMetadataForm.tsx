import { useState } from 'react'
import { Controller, type Control, type UseFormSetValue, type UseFormWatch } from 'react-hook-form'
import { FolderTree, Lock, Globe } from 'lucide-react'
import { Button } from '#components/ui/button'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '#components/ui/command'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '#components/ui/field'
import { Input } from '#components/ui/input'
import { usePageTree } from '#hooks/usePageTree'
import { collectSubtreeIds, findPathToNode, flattenTree } from '#utils/page-tree'
import { slugify } from '#utils/slug'
import type { PageMetadataFormValues } from '#schemas/page-metadata.schema'

interface PageMetadataFormProps {
  mode: 'create' | 'edit'
  control: Control<PageMetadataFormValues>
  setValue: UseFormSetValue<PageMetadataFormValues>
  watch: UseFormWatch<PageMetadataFormValues>
  excludePageId?: string | null
  onParentChange?: (newParentId: string | null) => void
}

export function PageMetadataForm({
  mode,
  control,
  setValue,
  watch,
  excludePageId,
  onParentChange,
}: PageMetadataFormProps) {
  const [slugTouched, setSlugTouched] = useState(false)
  const [parentPickerOpen, setParentPickerOpen] = useState(false)
  const { tree } = usePageTree()

  const excludedIds = excludePageId ? collectSubtreeIds(tree, excludePageId) : []
  const parentOptions = flattenTree(tree).filter((node) => !excludedIds.includes(node.id))
  const parentId = watch('parentId')
  const parentPath = parentId ? findPathToNode(tree, (node) => node.id === parentId) : null
  const parentLabel = parentPath ? parentPath.map((node) => node.title).join(' / ') : 'Aucune (racine)'
  const pathPrefix = parentPath ? `/${parentPath.map((node) => node.slug).join('/')}/` : '/'

  function selectParent(nextParentId: string | null) {
    setValue('parentId', nextParentId, { shouldValidate: true })
    setParentPickerOpen(false)
    if (mode === 'edit') {
      onParentChange?.(nextParentId)
    }
  }

  return (
    <FieldGroup>
      <Controller
        control={control}
        name="title"
        render={({ field, fieldState }) => (
          <Field data-invalid={!!fieldState.error}>
            <FieldLabel htmlFor="page-title">Titre</FieldLabel>
            <Input
              {...field}
              id="page-title"
              onChange={(event) => {
                field.onChange(event)
                if (mode === 'create' && !slugTouched) {
                  setValue('slug', slugify(event.target.value), { shouldValidate: true })
                }
              }}
            />
            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
          </Field>
        )}
      />
      <Controller
        control={control}
        name="slug"
        render={({ field, fieldState }) => (
          <Field data-invalid={!!fieldState.error}>
            <FieldLabel htmlFor="page-slug">Chemin</FieldLabel>
            {mode === 'create' ? (
              <div className="flex h-8 items-center gap-1 rounded-lg border border-input bg-transparent px-2.5 has-[input:focus-visible]:border-ring has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/50">
                <span className="shrink-0 text-sm text-muted-foreground">{pathPrefix}</span>
                <input
                  {...field}
                  id="page-slug"
                  className="w-full min-w-0 bg-transparent text-sm outline-none"
                  onChange={(event) => {
                    setSlugTouched(true)
                    field.onChange(event)
                  }}
                />
              </div>
            ) : (
              <p className="truncate text-sm text-muted-foreground">
                {pathPrefix}
                {field.value}
              </p>
            )}
            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            {mode === 'edit' && <FieldDescription>Le chemin ne peut pas être modifié après la création.</FieldDescription>}
          </Field>
        )}
      />
      <Field>
        <FieldLabel>Page parente</FieldLabel>
        <Button
          type="button"
          variant="outline"
          className="justify-start"
          onClick={() => setParentPickerOpen(true)}
        >
          <FolderTree /> {parentLabel}
        </Button>
      </Field>
      <Controller
        control={control}
        name="visibility"
        render={({ field }) =>
          mode === 'create' ? (
            <Field>
              <FieldLabel>Visibilité</FieldLabel>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={field.value === 'private' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => field.onChange('private')}
                >
                  <Lock /> Privée
                </Button>
                <Button
                  type="button"
                  variant={field.value === 'public' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => field.onChange('public')}
                >
                  <Globe /> Publique
                </Button>
              </div>
            </Field>
          ) : (
            <Field>
              <FieldLabel>Visibilité</FieldLabel>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                {field.value === 'private' ? <Lock className="size-4" /> : <Globe className="size-4" />}
                {field.value === 'private' ? 'Privée' : 'Publique'}
              </p>
              <FieldDescription>La visibilité ne peut pas être modifiée après la création.</FieldDescription>
            </Field>
          )
        }
      />
      <CommandDialog open={parentPickerOpen} onOpenChange={setParentPickerOpen} title="Choisir la page parente">
        <Command>
          <CommandInput placeholder="Rechercher une page..." />
          <CommandList>
            <CommandEmpty>Aucune page trouvée.</CommandEmpty>
            <CommandGroup>
              <CommandItem value="Aucune (racine)" onSelect={() => selectParent(null)}>
                Aucune (racine)
              </CommandItem>
              {parentOptions.map((node) => (
                <CommandItem key={node.id} value={node.path} onSelect={() => selectParent(node.id)}>
                  {node.path}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </FieldGroup>
  )
}
