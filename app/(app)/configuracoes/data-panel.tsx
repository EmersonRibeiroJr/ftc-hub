export function DataPanel() {
  return (
    <div>
      <h3 className="font-display font-semibold">Dados</h3>
      <p className="mt-1 max-w-xl text-sm text-muted-foreground">
        Os dados do FTC Hub ficam em um banco de dados real (SQLite por padrão, com suporte a PostgreSQL). Para restaurar os dados de exemplo,
        peça a um administrador para rodar <code className="rounded bg-muted px-1.5 py-0.5">npm run db:seed</code> no servidor — isso substitui os dados atuais.
      </p>
    </div>
  );
}
