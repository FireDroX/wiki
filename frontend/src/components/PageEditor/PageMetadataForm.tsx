import { useState } from 'react'
import { Controller, type Control, type UseFormSetValue, type UseFormWatch } from 'react-hook-form'
import { FolderTree } from 'lucide-react'
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
import { Field, FieldError, FieldGroup, FieldLabel } from '#components/ui/field'
import { Input } from '#components/ui/input'
import { usePageTree } from '#hooks/usePageTree'
import { collectSubtreeIds, findPathToNode, flattenTree } from '#utils/page-tree'
import { slugify } from '#utils/slug'
import type { PageMetadataFormValues } from '#schemas/page-metadata.schema'

interface PageMetadataFormProps {
  control: Control<PageMetadataFormValues>
  setValue: UseFormSetValue<PageMetadataFormValues>
  watch: UseFormWatch<PageMetadataFormValues>
  excludePageId?: string | null
}

export function PageMetadataForm({ control, setValue, watch, excludePageId }: PageMetadataFormProps) {
  const [slugTouched, setSlugTouched] = useState(false)
  const [parentPickerOpen, setParentPickerOpen] = useState(false)
  const { tree } = usePageTree()

  const excludedIds = excludePageId ? collectSubtreeIds(tree, excludePageId) : []
  const parentOptions = flattenTree(tree).filter((node) => !excludedIds.includes(node.id))
  const parentId = watch('parentId')
  const parentPath = parentId ? findPathToNode(tree, (node) => node.id === parentId) : null
  const parentLabel = parentPath ? parentPath.map((node) => node.title).join(' / ') : 'Aucune (racine)'

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
                if (!slugTouched) {
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
            <FieldLabel htmlFor="page-slug">Slug</FieldLabel>
            <Input
              {...field}
              id="page-slug"
              onChange={(event) => {
                setSlugTouched(true)
                field.onChange(event)
              }}
            />
            {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
          </Field>
        )}
      />
      <Controller
        control={control}
        name="visibility"
        render={({ field }) => (
          <Field>
            <FieldLabel>Visibilité</FieldLabel>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={field.value === 'private' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => field.onChange('private')}
              >
                Privée
              </Button>
              <Button
                type="button"
                variant={field.value === 'public' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => field.onChange('public')}
              >
                Publique
              </Button>
            </div>
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
      <CommandDialog open={parentPickerOpen} onOpenChange={setParentPickerOpen} title="Choisir la page parente">
        <Command>
          <CommandInput placeholder="Rechercher une page..." />
          <CommandList>
            <CommandEmpty>Aucune page trouvée.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="Aucune (racine)"
                onSelect={() => {
                  setValue('parentId', null, { shouldValidate: true })
                  setParentPickerOpen(false)
                }}
              >
                Aucune (racine)
              </CommandItem>
              {parentOptions.map((node) => (
                <CommandItem
                  key={node.id}
                  value={node.path}
                  onSelect={() => {
                    setValue('parentId', node.id, { shouldValidate: true })
                    setParentPickerOpen(false)
                  }}
                >
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
