import { useEffect, useState } from 'react';
import { categoriesService } from '../services/categories.service';
import { safeArray } from '../lib/helpers';
export const useCategories = (type) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        categoriesService
            .getByType(type)
            .then(res => setCategories(safeArray(res.data)))
            .catch(() => setCategories([]))
            .finally(() => setLoading(false));
    }, [type]);
    return { categories, loading };
};
