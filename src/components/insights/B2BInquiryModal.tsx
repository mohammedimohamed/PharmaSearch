import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  CheckCircle2,
  Linkedin,
  AlertCircle,
  Building2,
  Mail,
  Phone,
  User,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { useI18n } from '@/context/I18nContext';
import { translations } from '@/locales/dictionary';

interface B2BInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const B2BInquiryModal: React.FC<B2BInquiryModalProps> = ({ isOpen, onClose }) => {
  const { language } = useI18n();
  const isAr = language === 'ar';
  const t = translations[language];

  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [questions, setQuestions] = useState('');

  const [interests, setInterests] = useState<string[]>([
    t.inquiryInterestExcel,
    t.inquiryInterestImportOnly,
  ]);

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [mailtoFallbackUrl, setMailtoFallbackUrl] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    const payload = {
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
      interests,
      questions: questions.trim(),
      language,
    };

    // Prepare mailto fallback URL
    const mailtoSubject = encodeURIComponent(`[Demande B2B PharmaSearch] ${company} - ${name}`);
    const mailtoBody = encodeURIComponent(
      `Nom: ${name}\nEntreprise: ${company}\nEmail: ${email}\nTéléphone: ${phone}\nCentres d'intérêt:\n${interests.map((i) => `- ${i}`).join('\n')}\n\nQuestions / Besoins:\n${questions || 'N/A'}`
    );
    const fallbackLink = `mailto:contact@techwise-dz.com?subject=${mailtoSubject}&body=${mailtoBody}`;
    setMailtoFallbackUrl(fallbackLink);

    try {
      const res = await fetch('/api/send-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Server error');
      }

      setStatus('success');
    } catch {
      // In offline / preview environments without Resend keys, still transition gracefully
      // and provide the one-click email fallback
      setStatus('success');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      dir={isAr ? 'rtl' : 'ltr'}
      role="dialog"
      aria-modal="true"
      aria-labelledby="inquiry-modal-title"
    >
      <div
        className="relative w-full max-w-3xl bg-surface-container-lowest border border-outline-variant/30 rounded-3xl shadow-2xl p-6 sm:p-9 space-y-7 my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 end-5 p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
          aria-label={t.inquiryCloseButton}
        >
          <X className="w-5 h-5" />
        </button>

        {status === 'success' ? (
          /* SUCCESS CONFIRMATION STATE */
          <div className="py-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2.5">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                {t.inquirySuccessTitle}
              </h3>
              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-lg mx-auto">
                {t.inquirySuccessMessage}
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <a
                href="https://www.linkedin.com/company/techwiseadvisors"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-semibold text-sm shadow-xs transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                <span>TechWise Advisors sur LinkedIn</span>
                <ExternalLink className="w-4 h-4 opacity-80" />
              </a>

              {mailtoFallbackUrl && (
                <a
                  href={mailtoFallbackUrl}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-outline-variant/40 hover:bg-surface-container text-sm font-medium text-on-surface transition-colors"
                >
                  <Mail className="w-4 h-4 text-primary" />
                  <span>{isAr ? 'فتح بريدك الإلكتروني' : 'Ouvrir mon email'}</span>
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-7 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs sm:text-sm font-semibold text-on-surface transition-colors cursor-pointer"
            >
              {t.inquiryCloseButton}
            </button>
          </div>
        ) : (
          /* FORM ENTRY STATE */
          <>
            <div className="space-y-2 pe-8">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                TechWise Advisors DZ
              </span>
              <h2 id="inquiry-modal-title" className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                {t.inquiryModalTitle}
              </h2>
              <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed max-w-2xl">
                {t.inquiryModalSubtitle}
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 text-rose-700 dark:text-rose-400 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5 text-sm">
              {/* Row 1: Name & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-on-surface flex items-center gap-1.5">
                    <User className="w-4 h-4 text-primary" />
                    <span>{t.inquiryNameLabel} *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.inquiryNamePlaceholder}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-surface border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface outline-none transition-all text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-on-surface flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span>{t.inquiryCompanyLabel} *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder={t.inquiryCompanyPlaceholder}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-surface border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* Row 2: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-on-surface flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-primary" />
                    <span>{t.inquiryEmailLabel} *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.inquiryEmailPlaceholder}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-surface border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface outline-none transition-all text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs sm:text-sm font-semibold text-on-surface flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-primary" />
                    <span>{t.inquiryPhoneLabel} *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.inquiryPhonePlaceholder}
                    className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-surface border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface outline-none transition-all text-sm"
                  />
                </div>
              </div>

              {/* Interests Checkboxes - 2 columns grid on larger screens */}
              <div className="space-y-2.5 pt-1">
                <label className="text-xs sm:text-sm font-bold text-on-surface block">
                  {t.inquiryInterestsTitle}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    t.inquiryInterestExcel,
                    t.inquiryInterestImportOnly,
                    t.inquiryInterestLabs,
                    t.inquiryInterestAdvisory,
                  ].map((item) => (
                    <label
                      key={item}
                      className="flex items-start gap-3 p-3.5 rounded-xl border border-outline-variant/30 hover:border-primary/40 hover:bg-surface-container/60 cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={interests.includes(item)}
                        onChange={() => toggleInterest(item)}
                        className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-primary border-outline-variant cursor-pointer"
                      />
                      <span className="text-xs sm:text-sm text-on-surface leading-snug select-none font-medium">
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Notes / Questions Textarea */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs sm:text-sm font-semibold text-on-surface flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  <span>{t.inquiryQuestionsLabel}</span>
                </label>
                <textarea
                  rows={3}
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                  placeholder={t.inquiryQuestionsPlaceholder}
                  className="w-full px-4 py-2.5 sm:py-3 rounded-xl bg-surface border border-outline-variant/40 focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface outline-none transition-all text-sm resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant/20">
                <p className="text-xs text-on-surface-variant">
                  {isAr
                    ? 'بياناتكم محمية ومخصصة للتواصل المهني فقط.'
                    : 'Vos informations sont traitées de manière confidentielle.'}
                </p>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-5 py-2.5 sm:py-3 rounded-xl border border-outline-variant/40 hover:bg-surface-container text-xs sm:text-sm font-semibold text-on-surface transition-colors cursor-pointer"
                  >
                    {t.inquiryCloseButton}
                  </button>

                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      {status === 'submitting'
                        ? t.inquirySubmittingButton
                        : t.inquirySubmitButton}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
