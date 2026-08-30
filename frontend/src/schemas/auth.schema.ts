import { z } from 'zod'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8
const DISPLAY_NAME_MIN_LENGTH = 2
const DISPLAY_NAME_MAX_LENGTH = 100

export const loginSchema = z.object({
  email: z.string().regex(EMAIL_REGEX, 'Adresse e-mail invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

export const registerSchema = z.object({
  email: z.string().regex(EMAIL_REGEX, 'Adresse e-mail invalide'),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`),
  displayName: z
    .string()
    .min(DISPLAY_NAME_MIN_LENGTH, `Le nom doit contenir au moins ${DISPLAY_NAME_MIN_LENGTH} caractères`)
    .max(DISPLAY_NAME_MAX_LENGTH, `Le nom ne peut pas dépasser ${DISPLAY_NAME_MAX_LENGTH} caractères`),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
