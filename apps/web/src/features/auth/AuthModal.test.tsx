import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthModal } from './AuthModal';

describe('AuthModal Component', () => {
  it('renders login tab by default when opened', () => {
    render(<AuthModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Iniciar Sesión/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/usuario@ejemplo.com/i)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Ej. Juan Pérez/i)).not.toBeInTheDocument();
  });

  it('switches to register tab and shows role selector', () => {
    render(<AuthModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    const registerTab = screen.getByRole('button', { name: /Crear Cuenta/i });
    fireEvent.click(registerTab);

    expect(screen.getByPlaceholderText(/Ej. Juan Pérez/i)).toBeInTheDocument();
    expect(screen.getByText(/Seleccionar Rol/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Profesor/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Estudiante/i })).toBeInTheDocument();
  });

  it('submits registration with role selection', async () => {
    const handleSuccess = vi.fn();
    render(<AuthModal isOpen={true} onClose={vi.fn()} onSuccess={handleSuccess} />);

    fireEvent.click(screen.getByRole('button', { name: /Crear Cuenta/i }));

    fireEvent.change(screen.getByPlaceholderText(/Ej. Juan Pérez/i), {
      target: { value: 'Docente Carlos' },
    });
    fireEvent.change(screen.getByPlaceholderText(/usuario@ejemplo.com/i), {
      target: { value: 'carlos@profesor.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: 'Password123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Profesor/i }));
    fireEvent.click(screen.getByRole('button', { name: /Crear Cuenta y Empezar/i }));

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'carlos@profesor.com',
          role: 'TEACHER',
          isLogin: false,
        })
      );
    });
  });

  it('shows error if password is too short', () => {
    render(<AuthModal isOpen={true} onClose={vi.fn()} onSuccess={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText(/usuario@ejemplo.com/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: '123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Ingresar a la Plataforma/i }));

    expect(screen.getByText(/La contraseña debe tener al menos 8 caracteres/i)).toBeInTheDocument();
  });
});
