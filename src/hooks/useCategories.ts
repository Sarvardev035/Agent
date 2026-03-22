import { useEffect, useState } from 'react'
import { categoriesService } from '../services/categories.service'
import { safeArray } from '../lib/helpers'

export interface Category {
  id: string
  name: string
  type: 'EXPENSE' | 'INCOME'
}

export const useCategories = (type: 'EXPENSE' | 'INCOME') => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    categoriesService
      .getByType(type)
      .then(res => setCategories(safeArray<Category>(res.data)))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }, [type])

  return { categories, loading }
}
