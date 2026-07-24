import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface PublicPageSection {
  id: string;

  title: string;

  content: string;
}

export interface PublicPage {
  title: string;

  effectiveDate: string;

  sections: PublicPageSection[];
}

@Injectable({
  providedIn: 'root',
})
export class PublicPagesService {
  constructor() {}

  getHelpCards() {
    return [
      {
        icon: 'bi-person-circle',
        title: 'Account Support',
        description:
          'Need help with login, signup, password reset, or account settings.',
        action: 'Browse articles',
      },
      {
        icon: 'bi-building',
        title: 'Property Management',
        description:
          'Get assistance managing properties, units, tenants, and leases.',
        action: 'Browse articles',
      },
      {
        icon: 'bi-headset',
        title: 'Contact Support',
        description: 'Email us or connect with our support team.',
        action: 'Start chat',
      },
    ];
  }

  getFAQs() {
    return [
      {
        question: 'How do I add a new property?',
        answer: 'You can add a property from the Property Management section.',
      },
      {
        question: 'How do I manage units?',
        answer: 'Open the property details and manage units from there.',
      },
      {
        question: 'How can I reset my password?',
        answer: 'Use the forgot password option available on the login page.',
      },
    ];
  }

  getTermsCondition(): Observable<PublicPage> {
    const termsData: PublicPage = {
      title: 'Terms & Conditions',

      effectiveDate: 'July 2026',

      sections: [
        {
          id: 'acceptance',
          title: '1. Acceptance of Terms',
          content:
            'By accessing or using the Units Property Management platform, you agree to comply with these Terms and Conditions.',
        },

        {
          id: 'service',
          title: '2. Description of Service',
          content:
            'Units provides property management solutions that help owners, managers, and tenants manage properties, units, payments, and related activities.',
        },

        {
          id: 'account',
          title: '3. User Account',
          content:
            'Users are responsible for maintaining accurate account information and keeping their login credentials secure.',
        },

        {
          id: 'usage',
          title: '4. Acceptable Use',
          content:
            'Users must use the platform responsibly and must not misuse or attempt unauthorized access.',
        },

        {
          id: 'contact',
          title: '5. Contact',
          content:
            'For any questions regarding these Terms and Conditions, please contact our support team.',
        },

        {
          id: 'privacy',
          title: '6. Privacy and Data Protection',
          content:
            'We respect user privacy and implement appropriate measures to protect personal information collected through the platform.',
        },

        {
          id: 'security',
          title: '7. Data Security',
          content:
            'We use reasonable security practices to protect user data from unauthorized access, modification, disclosure, or misuse.',
        },

        {
          id: 'payment',
          title: '8. Payments and Billing',
          content:
            'Users agree to provide accurate billing information and complete payments according to the applicable subscription or service terms.',
        },

        {
          id: 'termination',
          title: '9. Termination of Account',
          content:
            'We reserve the right to suspend or terminate accounts that violate these terms or misuse the platform.',
        },

        {
          id: 'liability',
          title: '10. Limitation of Liability',
          content:
            'Units shall not be responsible for indirect damages, losses, or interruptions resulting from the use of the platform.',
        },
      ],
    };

    return of(termsData);
  }

  getPrivacyContent(): Observable<PublicPage> {
    const privacyData: PublicPage = {
      title: 'Privacy Policy',

      effectiveDate: 'July 2026',

      sections: [
        {
          id: 'collect',
          title: '1. Information We Collect',
          content:
            'We collect information required to  The collected information is used to manage accounts, provide services.',
        },

        {
          id: 'use',
          title: '2. How We Use Data',
          content:
            'The collected information is used to manage accounts, provide requested services, improve platform functionality, communicate updates, and maintain a secure user experience.',
        },

        {
          id: 'security',
          title: '3. Data Security',
          content:
            'We implement appropriate security measures to protect personal information from unauthorized access or disclosure.',
        },

        {
          id: 'sharing',
          title: '4. Data Sharing',
          content:
            'We do not sell personal information. Data may only be shared when required to provide services or comply with legal requirements.',
        },

        {
          id: 'privacy-contact',
          title: '5. Contact',
          content:
            'If you have questions regarding this Privacy Policy, please contact our support team.',
        },

        {
          id: 'cookies',
          title: '6. Cookies and Tracking Technologies',
          content:
            'We may use cookies and similar technologies to improve user experience, analyze platform usage, and provide better services.',
        },

        {
          id: 'third-party',
          title: '7. Third Party Services',
          content:
            'Our platform may integrate with third-party services. These services may have their own privacy policies and data handling practices.',
        },

        {
          id: 'user-rights',
          title: '8. User Rights',
          content:
            'Users may request access, correction, or deletion of their personal information according to applicable laws and regulations.',
        },

        {
          id: 'data-retention',
          title: '9. Data Retention',
          content:
            'We retain personal information only for as long as necessary to provide services and fulfill legal obligationsWe retain personal information only for as long as necessary to provide services and fulfill legal obligations',
        },

        {
          id: 'policy-changes',
          title: '10. Changes to Privacy Policy',
          content:
            'We may update this Privacy Policy from time to time. Users will be notified about significant changes to the policy.',
        },
      ],
    };

    return of(privacyData);
  }
}
