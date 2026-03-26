import React, { useState } from 'react';
import { Search, ChevronDown, Book, Shield, Wallet, BarChart3, HelpCircle, ArrowRight } from 'lucide-react';

const CATEGORIES = [
    { id: 'getting-started', title: 'Getting Started', icon: Book, count: 12 },
    { id: 'security', title: 'Account Security', icon: Shield, count: 8 },
    { id: 'deposits', title: 'Deposits/Withdrawals', icon: Wallet, count: 15 },
    { id: 'trading', title: 'Trading & Fees', icon: BarChart3, count: 20 },
    { id: 'other', title: 'General Inquiries', icon: HelpCircle, count: 10 }
];

const FAQS = [
    {
        category: 'getting-started',
        question: 'How do I create an account on Aurelian?',
        answer: 'To create an account, click the "JOIN" button in the top right corner. You will need to provide your email address and create a strong password. After registering, verify your email and complete your identity verification (KYC) to start trading.'
    },
    {
        category: 'getting-started',
        question: 'What is Identity Verification (KYC)?',
        answer: 'KYC (Know Your Customer) is a mandatory process for all institutional-grade platforms to prevent fraud, money laundering, and illegal activities. You will need to upload a government-issued ID and a proof of address.'
    },
    {
        category: 'security',
        question: 'How do I enable 2FA?',
        answer: 'Navigate to Security Center in your Profile menu. Select "Two-Factor Authentication" and follow the instructions to link your Google Authenticator or choice of TOTP app.'
    },
    {
        category: 'security',
        question: 'What should I do if my account is compromised?',
        answer: 'Immediately use the "Emergency Lock" feature in the Security Center or contact our 24/7 support. We will temporarily freeze your assets to prevent unauthorized withdrawals.'
    },
    {
        category: 'trading',
        question: 'What are the trading fees on Aurelian?',
        answer: 'Aurelian uses a tiered maker-taker fee structure. VIP members receive significant discounts. Standard maker fees start at 0.02% and taker fees at 0.04% for futures trading.'
    },
    {
        category: 'trading',
        question: 'What is leverage trading?',
        answer: 'Leverage allows you to trade with more funds than you actually have. For example, 10x leverage means a $1,000 position only requires $100 of collateral. Please note leverage significantly increases risk.'
    },
    {
        category: 'deposits',
        question: 'How long do crypto deposits take?',
        answer: 'Deposit times depend on network confirmations. Typically, BTC requires 3 confirmations (~30-60 mins), while USDT (TRC20) and ETH require 12-20 confirmations (~5-10 mins).'
    },
    {
        category: 'deposits',
        question: 'What are the withdrawal limits?',
        answer: 'Withdrawal limits depend on your verification level. Unverified accounts have a 0 BTC daily limit. Level 1 Verified accounts can withdraw up to 2 BTC daily, and Institutional VIPs have custom unlimited limits.'
    }
];

const HelpCenter = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [openIndex, setOpenIndex] = useState(null);

    const filteredFaqs = FAQS.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory ? faq.category === selectedCategory : true;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-background-main text-text-main pt-24 pb-32">
            <div className="max-w-5xl mx-auto px-4 sm:px-6">
                
                {/* Header Section */}
                <div className="text-center mb-16 animate-fade-in">
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-gray-900 dark:text-white mb-6">
                        How can we <span className="text-primary">help you?</span>
                    </h1>
                    <div className="relative max-w-2xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search for articles, guides, and FAQs..." 
                            className="w-full bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all shadow-xl dark:shadow-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
                    {CATEGORIES.map((cat) => (
                        <button 
                            key={cat.id}
                            onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                            className={`p-6 rounded-2xl flex flex-col items-center text-center transition-all border group
                                ${selectedCategory === cat.id 
                                    ? 'bg-primary border-primary shadow-glow shadow-primary/20' 
                                    : 'bg-white dark:bg-surface-main border-gray-100 dark:border-white/5 hover:border-primary/50'}`}
                        >
                            <cat.icon className={`mb-3 ${selectedCategory === cat.id ? 'text-black' : 'text-primary group-hover:scale-110 transition-transform'}`} size={24} />
                            <span className={`text-xs font-bold tracking-tight ${selectedCategory === cat.id ? 'text-black' : 'text-gray-900 dark:text-white'}`}>
                                {cat.title}
                            </span>
                            <span className={`text-[10px] mt-1 ${selectedCategory === cat.id ? 'text-black/60' : 'text-gray-500'}`}>
                                {cat.count} Articles
                            </span>
                        </button>
                    ))}
                </div>

                {/* FAQ List */}
                <div className="bg-white dark:bg-surface-main rounded-3xl border border-gray-100 dark:border-white/5 p-4 md:p-8 shadow-2xl dark:shadow-none">
                    <h2 className="text-xl font-bold mb-8 px-2">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {filteredFaqs.length > 0 ? filteredFaqs.map((faq, idx) => (
                            <div key={idx} className="border-b border-gray-50 dark:border-white/5 last:border-none pb-4">
                                <button 
                                    className="w-full flex items-center justify-between py-4 text-left group"
                                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                >
                                    <span className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors pr-8">
                                        {faq.question}
                                    </span>
                                    <ChevronDown size={20} className={`text-gray-400 transition-transform ${openIndex === idx ? 'rotate-180' : ''}`} />
                                </button>
                                {openIndex === idx && (
                                    <div className="py-2 text-sm text-gray-500 leading-relaxed animate-fade-in">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="py-12 text-center text-gray-500">
                                No results found for your search. Try different keywords.
                            </div>
                        )}
                    </div>
                </div>

                {/* Support CTA */}
                <div className="mt-16 bg-gradient-brand-to-dark p-[1px] rounded-3xl">
                    <div className="bg-white dark:bg-[#05080F] rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
                            <p className="text-gray-500">Our team of institutional-grade support agents is available 24/7.</p>
                        </div>
                        <button className="btn-gold px-10 py-4 flex items-center gap-2 group">
                            Contact Support
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default HelpCenter;
