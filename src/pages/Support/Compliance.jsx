import React, { useState } from 'react';
import { ScrollText, ShieldAlert, Gavel, UserCheck, Cookie, FileCheck, Scale, ExternalLink } from 'lucide-react';

const SECTIONS = [
    { 
        id: 'tos', 
        title: 'Terms of Service', 
        icon: ScrollText,
        content: `
            <h3>1. General Provisions</h3>
            <p>Welcome to Aurelian Trading Platform. By accessing or using our services, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.</p>
            <p>These terms govern your use of the Aurelian platform, including our website, mobile applications, APIs, and any other related services (collectively, the "Services").</p>
            
            <h3>2. Eligibility</h3>
            <p>To be eligible to use the Aurelian Services, you must be at least 18 years old and have the capacity to form a binding contract according to the laws of your jurisdiction. You represent and warrant that you have not previously been suspended or removed from our Services.</p>
            
            <h3>3. Use of Services</h3>
            <p>Aurelian provides a platform for the trading of digital assets and derivatives. All trading involves substantial risk. You agree to be solely responsible for all your trading decisions and any losses resulting therefrom.</p>
            <p>You agree not to engage in any prohibited activities, including but not limited to market manipulation, wash trading, front-running, or illegal transactions.</p>
            
            <h3>4. Account Security</h3>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify Aurelian immediately of any unauthorized use of your account or any other breach of security.</p>
        `
    },
    { 
        id: 'privacy', 
        title: 'Privacy Policy', 
        icon: UserCheck,
        content: `
            <h3>1. Information Collection</h3>
            <p>Aurelian collects your personal information to provide our services and ensure compliance with legal requirements. This includes information you provide directly, such as your email, name, and identity verification documents, as well as information collected automatically during your use of our Services, such as IP addresses, device data, and trading activity.</p>
            
            <h3>2. Use of Information</h3>
            <p>Your information is used to: Verify your identity, Process your transactions, Provide customer support, Maintain security and prevent fraud, and comply with applicable laws and regulations.</p>
            
            <h3>3. Data Sharing</h3>
            <p>Aurelian does not sell your personal data. We may share your data with: Regulatory authorities as required by law, Third-party service providers (e.g., identity verification services), and Affiliates for business operations.</p>
        `
    },
    { 
        id: 'aml', 
        title: 'AML & KYC Policy', 
        icon: ShieldAlert,
        content: `
            <h3>1. Anti-Money Laundering (AML)</h3>
            <p>Aurelian maintains a strict AML policy to prevent our services from being used for money laundering, terrorist financing, and other illegal activities. We implement rigorous internal controls and reporting procedures.</p>
            
            <h3>2. Identity Verification (KYC)</h3>
            <p>Know Your Customer (KYC) procedures are mandatory. We require all users to complete identity verification by providing government-issued ID and proof of residence. Enhanced Due Diligence (EDD) may be required for high-volume accounts or institutional clients.</p>
            
            <h3>3. Transaction Monitoring</h3>
            <p>We monitor all transactions for suspicious activity. Any transactions flagged for high risk may be frozen or reported to appropriate regulatory bodies without notice to the user.</p>
        `
    },
    { 
        id: 'risk', 
        title: 'Risk Disclosure', 
        icon: Gavel,
        content: `
            <h3>1. Highly Volatile Assets</h3>
            <p>Trading in digital assets carries a extremely high level of risk. Prices can fluctuate significantly in very short periods. You should only trade with funds you can afford to lose.</p>
            
            <h3>2. Leverage Risks</h3>
            <p>Derivatives and margin trading significantly amplify both potential profits and potential losses. Using high leverage can lead to the total loss of your collateral instantly (liquidation).</p>
            
            <h3>3. No Investment Advice</h3>
            <p>The content provided on the Aurelian platform does not constitute investment advice. Aurelian does not represent or warrant the accuracy, completeness, or reliability of any information provided.</p>
        `
    }
];

const Compliance = () => {
    const [activeSection, setActiveSection] = useState(SECTIONS[0]);

    return (
        <div className="min-h-screen bg-background-main text-text-main pt-24 pb-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Sidebar Navigation */}
                    <div className="lg:w-1/4">
                        <div className="sticky top-24 space-y-2">
                            <h2 className="text-sm font-bold tracking-tight text-gray-500 mb-6 px-4">Legal Framework</h2>
                            {SECTIONS.map((section) => (
                                <button 
                                    key={section.id}
                                    onClick={() => setActiveSection(section)}
                                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all border
                                        ${activeSection.id === section.id 
                                            ? 'bg-primary/20 border-primary/50 text-primary shadow-glow shadow-primary/10' 
                                            : 'bg-white/50 dark:bg-surface-main border-transparent hover:border-white/10 dark:hover:border-white/10'}`}
                                >
                                    <section.icon size={20} />
                                    <span className={`font-bold text-sm ${activeSection.id === section.id ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                                        {section.title}
                                    </span>
                                </button>
                            ))}
                            
                            <div className="pt-8 p-6 text-xs text-gray-500 bg-gray-50 dark:bg-surface-dark rounded-3xl border border-dashed border-gray-200 dark:border-white/10 mt-8">
                                <Scale className="mb-2 text-primary" size={20} />
                                <p className="leading-relaxed">
                                    Last Updated: March 20, 2026. <br /> 
                                    Aurelian TD is a division of Golden Shield Global Ltd.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:w-3/4">
                        <div className="bg-white dark:bg-surface-main rounded-[40px] border border-gray-100 dark:border-white/5 p-8 md:p-16 shadow-2xl dark:shadow-none animate-fade-in">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                                    <activeSection.icon size={32} />
                                </div>
                                <h1 className="text-3xl md:text-5xl font-display font-bold text-gray-900 dark:text-white">
                                    {activeSection.title}
                                </h1>
                            </div>
                            
                            <div 
                                className="prose prose-sm md:prose-base dark:prose-invert max-w-none 
                                           prose-headings:font-display prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                                           prose-p:text-gray-500 prose-p:leading-loose 
                                           prose-h3:text-gray-900 dark:prose-h3:text-gray-200 prose-h3:mt-10"
                                dangerouslySetInnerHTML={{ __html: activeSection.content }}
                            />
                            
                            <div className="mt-16 pt-8 border-t border-gray-50 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                                <span className="text-xs text-gray-500 italic">Document ID: LEG-AU-{activeSection.id.toUpperCase()}-2026-V4.2</span>
                                <button className="flex items-center gap-2 text-xs font-bold text-primary tracking-tight hover:underline group">
                                    Download PDF Copy
                                    <ExternalLink size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Compliance;
