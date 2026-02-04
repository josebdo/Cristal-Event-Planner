import { CategoryForm } from "@/components/admin/category-form"

export default function NewCategoryPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Nueva Categoría
        </h1>
        <p className="mt-1 text-muted-foreground">
          Crea una nueva categoría para tus productos
        </p>
      </div>

      <CategoryForm />
    </div>
  )
}
