import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/common/StatusBadge';

describe('StatusBadge Component', () => {
  it('renders "Actif" with green styling for NOMENCLATURE_ACTIVE in French', () => {
    render(<StatusBadge sourceList="NOMENCLATURE_ACTIVE" lang="fr" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Actif');
    expect(badge).toHaveClass('bg-[#DCFCE7]');
    expect(badge).toHaveClass('text-[#15803D]');
    expect(badge).toHaveClass('border-[#86EFAC]');
  });

  it('renders "نشط" for NOMENCLATURE_ACTIVE in Arabic', () => {
    render(<StatusBadge sourceList="NOMENCLATURE_ACTIVE" lang="ar" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('نشط');
    expect(badge).toHaveClass('bg-[#DCFCE7]');
  });

  it('renders "Non renouvelé" with amber styling for NON_RENOUVELE in French', () => {
    render(<StatusBadge sourceList="NON_RENOUVELE" lang="fr" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Non renouvelé');
    expect(badge).toHaveClass('bg-[#FEF3C7]');
    expect(badge).toHaveClass('text-[#B45309]');
    expect(badge).toHaveClass('border-[#FCD34D]');
  });

  it('renders "غير مجدد" for NON_RENOUVELE in Arabic', () => {
    render(<StatusBadge sourceList="NON_RENOUVELE" lang="ar" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('غير مجدد');
  });

  it('renders "Retiré" with red styling for RETRAIT in French', () => {
    render(<StatusBadge sourceList="RETRAIT" lang="fr" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('Retiré');
    expect(badge).toHaveClass('bg-[#FEE2E2]');
    expect(badge).toHaveClass('text-[#B91C1C]');
    expect(badge).toHaveClass('border-[#FCA5A5]');
  });

  it('renders "مسحوب" for RETRAIT in Arabic', () => {
    render(<StatusBadge sourceList="RETRAIT" lang="ar" />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveTextContent('مسحوب');
  });
});
