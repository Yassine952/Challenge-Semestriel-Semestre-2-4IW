import { ref, reactive, toRefs } from 'vue';
import { z, ZodSchema } from 'zod';

interface FormOptions<T extends Record<string, any>> {
  initialValues: T;
  schema: ZodSchema<T>;
  onSubmit: (values: T) => Promise<void>;
  transformers?: Partial<Record<keyof T, (value: any) => any>>; // Fonctions de transformation
}

export function useForm<T extends Record<string, any>>({ 
  initialValues, 
  schema, 
  onSubmit,
  transformers = {} as Partial<Record<keyof T, (value: any) => any>>
}: FormOptions<T>) {
  const values = reactive<T>({ ...initialValues });
  const errors = reactive<Record<string, string | undefined>>({});
  const isSubmitting = ref(false);
  const serverError = ref<string | null>(null);
  
  // AbortController pour annuler les requêtes HTTP
  let abortController: AbortController | null = null;

  const handleChange = (field: keyof T, value: any) => {
    // Appliquer la transformation si elle existe
    let transformedValue = value;
    if (transformers[field]) {
      transformedValue = transformers[field]!(value);
    } else if (field === 'price' || field === 'stock' || field === 'priceMin' || field === 'priceMax') {
      // Conversion sécurisée des nombres avec validation
      const numValue = parseFloat(value);
      transformedValue = isNaN(numValue) ? 0 : numValue;
    }
    
    (values as any)[field] = transformedValue;
    errors[field as string] = undefined;
  };

  const validate = () => {
    // Réinitialiser les erreurs
    Object.keys(errors).forEach(key => {
      errors[key] = undefined;
    });

    try {
      schema.parse(values);
      return true;
    } catch (e) {
      const validationErrors = (e as any).errors;
      validationErrors.forEach((error: any) => {
        const fieldName = error.path[0];
        // Ne garder que la première erreur par champ
        if (!errors[fieldName]) {
          errors[fieldName] = error.message;
        }
      });
      return false;
    }
  };

  const handleSubmit = async () => {
    if (validate()) {
      isSubmitting.value = true;
      serverError.value = null;
      
      // Créer un nouveau AbortController pour cette requête
      abortController = new AbortController();
      
      try {
        await onSubmit(values as T);
      } catch (error: any) {
        // Ne pas afficher l'erreur si la requête a été annulée
        if (error.name !== 'AbortError') {
          serverError.value = error.response?.data?.message || error.message || 'Une erreur est survenue';
        }
      } finally {
        isSubmitting.value = false;
        abortController = null;
      }
    }
  };

  // Fonction pour annuler la requête HTTP en cours
  const cancelRequest = () => {
    if (abortController) {
      abortController.abort();
      isSubmitting.value = false;
      serverError.value = null;
    }
  };

  // Fonction pour réinitialiser le formulaire
  const resetForm = () => {
    Object.keys(initialValues).forEach(key => {
      (values as any)[key] = initialValues[key as keyof T];
    });
    Object.keys(errors).forEach(key => {
      errors[key] = undefined;
    });
    serverError.value = null;
  };

  // Fonction pour définir des valeurs spécifiques
  const setValues = (newValues: Partial<T>) => {
    Object.keys(newValues).forEach(key => {
      if (key in values) {
        (values as any)[key] = newValues[key as keyof T];
      }
    });
  };

  // Fonction pour définir des erreurs spécifiques
  const setErrors = (newErrors: Record<string, string>) => {
    Object.keys(newErrors).forEach(key => {
      errors[key] = newErrors[key];
    });
  };

  return {
    // Valeurs du formulaire
    ...toRefs(values),
    // Erreurs de validation (une par champ)
    ...toRefs(errors),
    // États
    isSubmitting,
    serverError,
    // Fonctions
    handleChange,
    handleSubmit,
    cancelRequest,
    resetForm,
    setValues,
    setErrors,
    validate,
    // AbortController pour usage avancé
    getAbortSignal: () => abortController?.signal
  };
}
