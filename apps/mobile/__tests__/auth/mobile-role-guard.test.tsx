import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MobileRoleGuard } from '../../src/auth/MobileRoleGuard';
import { MobileUser } from '../../src/types/mobile';
import { Text } from 'react-native';

describe('MobileRoleGuard (Strict Teacher/Admin Mobile Access)', () => {
  it('blocks STUDENT role with explicit restricted access message', () => {
    const studentUser: MobileUser = {
      id: 'student-uuid',
      email: 'student@edtech.com',
      fullName: 'Carlos Estudiante',
      role: 'STUDENT',
    };

    render(
      <MobileRoleGuard user={studentUser}>
        <Text testID="teacher-protected-content">Panel Confidencial del Docente</Text>
      </MobileRoleGuard>
    );

    // Debe mostrar la vista restringida
    expect(screen.getByTestId('mobile-role-restricted-view')).toBeInTheDocument();
    expect(screen.getByText('Acceso Exclusivo Docente')).toBeInTheDocument();
    expect(
      screen.getByText(/Esta aplicación móvil está diseñada exclusivamente para profesores/i)
    ).toBeInTheDocument();

    // NO debe renderizar el contenido protegido
    expect(screen.queryByTestId('teacher-protected-content')).toBeNull();
  });

  it('allows access to TEACHER role', () => {
    const teacherUser: MobileUser = {
      id: 'teacher-uuid',
      email: 'teacher@edtech.com',
      fullName: 'Prof. Roberto Gómez',
      role: 'TEACHER',
    };

    render(
      <MobileRoleGuard user={teacherUser}>
        <Text testID="teacher-protected-content">Panel Confidencial del Docente</Text>
      </MobileRoleGuard>
    );

    expect(screen.getByTestId('teacher-protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-role-restricted-view')).toBeNull();
  });

  it('allows access to ADMIN role', () => {
    const adminUser: MobileUser = {
      id: 'admin-uuid',
      email: 'admin@edtech.com',
      fullName: 'Administrador General',
      role: 'ADMIN',
    };

    render(
      <MobileRoleGuard user={adminUser}>
        <Text testID="admin-protected-content">Panel Administrativo</Text>
      </MobileRoleGuard>
    );

    expect(screen.getByTestId('admin-protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-role-restricted-view')).toBeNull();
  });
});
