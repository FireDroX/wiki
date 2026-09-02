import { z } from 'zod'

const SLUG_REGEX = /^[a-z0-9-]+$/
const SLUG_MAX_LENGTH = 255
const TITLE_MAX_LENGTH = 255

export const pageMetadataSchema = z.object({
  title: z
    .string()
    .min(1, 'Le titre est requis')
    .max(TITLE_MAX_LENGTH, `Le titre ne peut pas dépasser ${TITLE_MAX_LENGTH} caractères`),
  slug: z
    .string()
    .min(1, 'Le slug est requis')
    .max(SLUG_MAX_LENGTH, `Le slug ne peut pas dépasser ${SLUG_MAX_LENGTH} caractères`)
    .regex(SLUG_REGEX, 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'),
  visibility: z.enum(['public', 'private']),
  parentId: z.string().nullable(),
})

export type PageMetadataFormValues = z.infer<typeof pageMetadataSchema>
