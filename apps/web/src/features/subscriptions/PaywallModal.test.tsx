import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PaywallModal } from './PaywallModal';

describe('PaywallModal Component', () => {
  it('renders modal when isOpen is true with sandbox card prefilled', () => {
    render(
      <PaywallModal
        isOpen={true}
        onClose={vi.fn()}
        onSubscribe={vi.fn()}
      />
    );

    expect(screen.getByTestId('paywall-modal')).toBeInTheDocument();
    expect(screen.getByText('Créditos de Prueba Agotados')).toBeInTheDocument();
    expect(screen.getByTestId('stripe-card-number-input')).toHaveValue('4242 4242 4242 4242');
  });

  it('triggers onSubscribe and onClose upon clicking pay button', async () => {
    const onSubscribe = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <PaywallModal
        isOpen={true}
        onClose={onClose}
        onSubscribe={onSubscribe}
      />
    );

    const payButton = screen.getByTestId('stripe-sandbox-pay-button');
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(onSubscribe).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it('does not render when isOpen is false', () => {
    render(
      <PaywallModal
        isOpen={false}
        onClose={vi.fn()}
        onSubscribe={vi.fn()}
      />
    );

    expect(screen.queryByTestId('paywall-modal')).toBeNull();
  });
});
