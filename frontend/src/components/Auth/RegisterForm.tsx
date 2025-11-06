import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../UI/Button';
import { Input } from '../UI/Input';
import type { RegisterFormData } from '../../types';

export const RegisterForm: React.FC = () => {
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();
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
        label="Имя пользователя"
        {...register('username', {
          required: 'Имя пользователя обязательно',
          minLength: {
            value: 3,
            message: 'Имя пользователя должно быть не менее 3 символов',
          },
          maxLength: {
            value: 30,
            message: 'Имя пользователя должно быть не более 30 символов',
          },
          pattern: {
            value: /^[a-zA-Z0-9]+$/,
            message: 'Имя пользователя может содержать только буквы и цифры',
          },
        })}
        error={errors.username?.message}
      />

      <Input
        label="Email"
        type="email"
        {...register('email', {
          required: 'Email обязателен',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Некорректный email',
          },
        })}
        error={errors.email?.message}
      />

      <Input
        label="Пароль"
        type="password"
        {...register('password', {
          required: 'Пароль обязателен',
          minLength: {
            value: 6,
            message: 'Пароль должен быть не менее 6 символов',
          },
        })}
        error={errors.password?.message}
      />

      <Input
        label="Подтвердите пароль"
        type="password"
        {...register('confirmPassword', {
          required: 'Подтверждение пароля обязательно',
          validate: (value) =>
            value === password || 'Пароли не совпадают',
        })}
        error={errors.confirmPassword?.message}
      />

      <Button type="submit" isLoading={isLoading} className="w-full">
        Зарегистрироваться
      </Button>
    </form>
  );
};

