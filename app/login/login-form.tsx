'use client';
import { useFormState, useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginAction } from '@/lib/auth-actions';

function Submit() {
  const { pending } = useFormStatus();
  return <Button type="submit" className="h-10 w-full" disabled={pending}>{pending ? 'Entrando…' : 'Entrar'}</Button>;
}

export function LoginForm() {
  const [state, action] = useFormState(loginAction, undefined);
  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1.5"><Label htmlFor="email">E-mail</Label><Input id="email" name="email" type="email" autoComplete="username" required className="h-10" /></div>
      <div className="space-y-1.5"><Label htmlFor="password">Senha</Label><Input id="password" name="password" type="password" autoComplete="current-password" required className="h-10" /></div>
      {state?.error && <p role="alert" className="text-sm text-ftc">{state.error}</p>}
      <Submit />
    </form>
  );
}
