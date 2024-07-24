import { ref, reactive, toRefs } from 'vue';
import { z, ZodSchema } from 'zod';

interface FormOptions<T extends Record<string, any>> {
  initialValues: T;
  schema: ZodSchema<T>;
  onSubmit: (values: T) => Promise<void>;
}

export function useForm<T extends Record<string, any>>({ initialValues, schema, onSubmit }: FormOptions<T>) {
  const values = reactive<T>({ ...initialValues });
  const errors = reactive<Record<string, string | undefined>>({});
  const isSubmitting = ref(false);
  const serverError = ref<string | null>(null);

  const handleChange = (field: keyof T, value: any) => {
    if (field === 'price' || field === 'stock') {
      values[field] = Number(value);
    } else {
      values[field] = value;
    }
    errors[field as string] = undefined;
  };

  const validate = () => {
    try {
      schema.parse(values);
      return true;
    } catch (e) {
      const validationErrors = (e as any).errors;
      validationErrors.forEach((error: any) => {
        errors[error.path[0]] = error.message;
      });
      return false;
    }
  };

  const handleSubmit = async () => {
    if (validate()) {
      isSubmitting.value = true;
      serverError.value = null;
      try {
        await onSubmit(values as T);
      } catch (error: any) {
        serverError.value = error.message || 'An error occurred';
      } finally {
        isSubmitting.value = false;
      }
    }
  };

  return {
    ...toRefs(values),
    ...toRefs(errors),
    isSubmitting,
    serverError,
    handleChange,
    handleSubmit,
  };
}
