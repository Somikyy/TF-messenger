import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { useI18n } from '../../i18n/context';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import type { RegisterFormData } from '../../types';

export const RegisterForm: React.FC = () => {
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();
  const { t } = useI18n();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData & { confirmPassword: string }>({
    mode: 'onSubmit', // Показывать ошибки только при отправке формы
    reValidateMode: 'onBlur', // Перепроверять при потере фокуса
    shouldUnregister: false,
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    try {
      await registerUser(data.username, data.email, data.password);
    } catch (error) {
      // Ошибка обрабатывается в store
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <Input
        label={t('username')}
        {...register('username', {
          required: t('usernameRequired'),
          minLength: {
            value: 3,
            message: t('usernameMinLength'),
          },
          maxLength: {
            value: 30,
            message: t('usernameMaxLength'),
          },
          pattern: {
            value: /^[a-zA-Z0-9]+$/,
            message: t('usernamePattern'),
          },
        })}
        error={errors.username?.message}
      />

      <Input
        label={t('email')}
        type="email"
        {...register('email', {
          required: t('emailRequired'),
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: t('emailInvalid'),
          },
        })}
        error={errors.email?.message}
      />

      <Input
        label={t('password')}
        type="password"
        {...register('password', {
          required: t('passwordRequired'),
          minLength: {
            value: 6,
            message: t('passwordMinLength'),
          },
        })}
        error={errors.password?.message}
      />

      <Input
        label={t('confirmPassword')}
        type="password"
        {...register('confirmPassword', {
          required: t('confirmPasswordRequired'),
          validate: (value) =>
            value === password || t('passwordsDoNotMatch'),
        })}
        error={errors.confirmPassword?.message}
      />

      <Button type="submit" isLoading={isLoading} className="w-full">
        {t('register')}
      </Button>
    </form>
  );
};

