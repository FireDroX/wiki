import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { isAxiosError } from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { FormError } from '#components/FormError'
import { Button } from '#components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '#components/ui/field'
import { Input } from '#components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#components/ui/tabs'
import { useAuth } from '#hooks/useAuth'
import {
  loginSchema,
  registerSchema,
  type LoginFormValues,
  type RegisterFormValues,
} from '#schemas/auth.schema'

function extractErrorMessage(error: unknown): string {
  if (isAxiosError(error) && typeof error.response?.data?.error === 'string') {
    return error.response.data.error
  }
  return 'Une erreur est survenue, veuillez réessayer.'
}

function LoginForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(data: LoginFormValues) {
    setSubmitError(null)
    try {
      await login(data)
      navigate('/', { replace: true })
    } catch (error) {
      setSubmitError(extractErrorMessage(error))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="login-email">Adresse e-mail</FieldLabel>
              <Input {...field} id="login-email" type="email" autoComplete="email" />
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="login-password">Mot de passe</FieldLabel>
              <Input {...field} id="login-password" type="password" autoComplete="current-password" />
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />
        <FormError message={submitError} />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          Se connecter
        </Button>
      </FieldGroup>
    </form>
  )
}

function RegisterForm() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', displayName: '' },
  })

  async function onSubmit(data: RegisterFormValues) {
    setSubmitError(null)
    try {
      await register(data)
      navigate('/', { replace: true })
    } catch (error) {
      setSubmitError(extractErrorMessage(error))
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FieldGroup>
        <Controller
          control={control}
          name="displayName"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="register-display-name">Nom affiché</FieldLabel>
              <Input {...field} id="register-display-name" autoComplete="name" />
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="register-email">Adresse e-mail</FieldLabel>
              <Input {...field} id="register-email" type="email" autoComplete="email" />
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field, fieldState }) => (
            <Field data-invalid={!!fieldState.error}>
              <FieldLabel htmlFor="register-password">Mot de passe</FieldLabel>
              <Input {...field} id="register-password" type="password" autoComplete="new-password" />
              {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
            </Field>
          )}
        />
        <FormError message={submitError} />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          Créer un compte
        </Button>
      </FieldGroup>
    </form>
  )
}

export function Login() {
  const [searchParams] = useSearchParams()
  const defaultTab = searchParams.get('tab') === 'register' ? 'register' : 'login'

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold">OpenWiki</h1>
          <p className="text-sm text-muted-foreground">La base de connaissance de l'équipe</p>
        </div>
        <Tabs defaultValue={defaultTab}>
          <TabsList className="w-full">
            <TabsTrigger value="login">Connexion</TabsTrigger>
            <TabsTrigger value="register">Inscription</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="pt-4">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register" className="pt-4">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
