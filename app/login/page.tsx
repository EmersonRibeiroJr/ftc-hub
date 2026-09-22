import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { LoginForm } from './login-form';

export const metadata = { title: 'Entrar' };

export default async function LoginPage() {
  if (await getSession()) redirect('/');
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-card">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-primary to-ftc font-display text-lg font-bold text-white" aria-hidden>FT</span>
          <div><h1 className="text-xl font-bold">FTC Hub</h1><p className="text-sm text-muted-foreground">Gestão da sua equipe FIRST Tech Challenge</p></div>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
