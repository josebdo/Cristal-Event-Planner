import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-accent/30 p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="font-serif text-2xl font-semibold text-foreground">
            Detalles con Amor
          </Link>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">Error de Autenticación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-muted-foreground">
              {params?.error 
                ? `Error: ${params.error}` 
                : "Ocurrió un error durante la autenticación."}
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/login">Volver a Intentar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
