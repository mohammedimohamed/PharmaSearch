import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/layout/Footer';

describe('Footer Sponsorship & Partnership Section', () => {
  it('1. Renders TechWise Advisors sponsorship card with logo and external links in French', () => {
    render(<Footer lang="fr" />);

    // Section title
    expect(screen.getByRole('heading', { level: 3, name: /Nos partenaires/i })).toBeInTheDocument();

    // Sponsor Label & Brand
    expect(screen.getByText('Sponsorisé par')).toBeInTheDocument();
    expect(screen.getAllByText('TechWise Advisors').length).toBeGreaterThanOrEqual(1);

    // Sponsor Logo
    const logoImg = screen.getByAltText(/Logo officiel de TechWise Advisors/i);
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute('src', '/images/techwise-advisors-logo.png');

    // Sponsor website links
    const websiteLinks = screen.getAllByRole('link', { name: /Site officiel/i });
    expect(websiteLinks.length).toBeGreaterThanOrEqual(1);
    for (const link of websiteLinks) {
      expect(link).toHaveAttribute('href', 'https://techwise-dz.com/');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }

    // Sponsor LinkedIn link
    const linkedInLink = screen.getByRole('link', { name: /Page LinkedIn/i });
    expect(linkedInLink).toBeInTheDocument();
    expect(linkedInLink).toHaveAttribute('href', 'https://www.linkedin.com/company/techwiseadvisors');
    expect(linkedInLink).toHaveAttribute('target', '_blank');
    expect(linkedInLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('2. Renders empty sponsorship slot card with call to action', () => {
    render(<Footer lang="fr" />);

    // Open slot title and description
    expect(screen.getByText('Votre organisation ici')).toBeInTheDocument();
    expect(
      screen.getByText(/Soutenez le développement de PharmaSearch et contribuez à améliorer l’accès à l’information pharmaceutique/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Contactez-nous sur LinkedIn pour discuter d’un partenariat.')).toBeInTheDocument();

    // Open slot CTA linking to LinkedIn
    const ctaLink = screen.getByRole('link', { name: /Devenir sponsor/i });
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute('href', 'https://www.linkedin.com/company/techwiseadvisors');
    expect(ctaLink).toHaveAttribute('target', '_blank');
    expect(ctaLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('3. Renders localized Arabic sponsorship content with correct labels', () => {
    render(<Footer lang="ar" />);

    // Arabic Section title
    expect(screen.getByRole('heading', { level: 3, name: /شركاؤنا/i })).toBeInTheDocument();

    // Arabic Sponsor Label
    expect(screen.getByText('برعاية')).toBeInTheDocument();

    // Arabic Open Slot Card
    expect(screen.getByText('مؤسستكم هنا')).toBeInTheDocument();
    expect(screen.getByText(/ساهموا في دعم تطوير PharmaSearch/i)).toBeInTheDocument();
    expect(screen.getByText('تواصلوا معنا عبر LinkedIn لمناقشة فرص الشراكة.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /كن شريكًا راعيًا/i })).toBeInTheDocument();
  });

  it('4. Preserves official Ministry attribution and regulatory disclaimers', () => {
    render(<Footer lang="fr" />);

    // Ministry provenance
    expect(screen.getByText(/Ministère de l'Industrie Pharmaceutique/i)).toBeInTheDocument();
    // Legal disclaimer
    expect(screen.getByText(/ne constitue pas une garantie de disponibilité commerciale en officine/i)).toBeInTheDocument();
  });
});
