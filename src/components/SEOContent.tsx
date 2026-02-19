import React, { useState } from 'react';
import '../styles/SEOContent.css';

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: 'What is a SIP calculator?',
        answer: 'A SIP calculator shows you how much your monthly investments could grow over time. You put in how much you want to invest each month, pick a time period and expected return rate, and it gives you an estimate of the final amount. Pretty straightforward — but most calculators stop there. Income Planner lets you go further by combining multiple SIPs and other plans together.'
    },
    {
        question: 'How is this different from other SIP calculators?',
        answer: 'Most SIP calculators handle one plan at a time. So if you have a monthly SIP in equity and another in debt, you\'d have to calculate them separately and add things up yourself. Here, you just add all your plans — SIP, Step-Up SIP, SWP, Lumpsum — to one basket and see the combined picture. It saves time and gives you a much clearer view.'
    },
    {
        question: 'Can I plan SIP and SWP together?',
        answer: 'Yes. That\'s actually one of the main reasons this tool exists. You can add a SIP for the years you\'re building up your money, and an SWP for the years when you want to withdraw from it. This way, you can see the full cycle — accumulation and withdrawal — in one place.'
    },
    {
        question: 'What is a Step-Up SIP?',
        answer: 'It\'s when you increase your SIP amount by a certain percentage every year. Say you start with 5,000 a month and step it up by 10% every year — next year it becomes 5,500, then 6,050, and so on. Most people\'s income goes up over time, so this is a realistic way to plan.'
    },
    {
        question: 'Is this tool free?',
        answer: 'Yes, it\'s completely free. No sign-up, no ads, no hidden stuff. Just open the site and start using it.'
    },
    {
        question: 'How can I use SWP for monthly income after retirement?',
        answer: 'If you have a mutual fund corpus and want regular income from it, add an SWP plan here. Enter your total corpus, the monthly amount you want to withdraw, and the expected return rate. The calculator shows how long your money will last. You can also combine it with a SIP to see how much you need to save before you retire.'
    },
    {
        question: 'Can I plan for my child\'s education or a specific goal?',
        answer: 'Yes. Just add a SIP or Step-Up SIP with the time period that matches your goal — say 15 years for a child\'s college fund. Set the monthly amount and expected return, and the tool shows you the projected corpus. If the number isn\'t enough, adjust the amount or time and try again. It\'s meant for exactly this kind of planning.'
    },
    {
        question: 'Does Income Planner account for inflation?',
        answer: 'Yes. When you calculate your plans, the results include both the nominal value and an inflation-adjusted view. This shows you what your money will actually be worth in today\'s terms, so you\'re not fooled by a big number that doesn\'t account for rising prices.'
    }
];

const steps = [
    {
        number: '1',
        title: 'Add your first plan',
        description: 'Click the + button and pick an asset type — Mutual Fund, Stock, Gold, or others. A default SIP plan gets created for you right away.'
    },
    {
        number: '2',
        title: 'Set your numbers',
        description: 'Change the monthly amount, time period, and expected return rate. You can also switch the plan type to Step-Up SIP, SWP, or Lumpsum.'
    },
    {
        number: '3',
        title: 'Add more plans',
        description: 'Click + again to add another plan. Mix and match — SIP, SWP, Step-Up, Lumpsum. Add as many as you need.'
    },
    {
        number: '4',
        title: 'See combined results',
        description: 'Press "Calculate All Plans" at the bottom. You\'ll see total invested, total returns, a year-by-year growth chart, and an inflation-adjusted view.'
    }
];

export const SEOContent: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section id="seo-content" className="seo-content" aria-label="About Income Planner">
            <div className="seo-content-inner">
                <div className="seo-about">
                    <h2 className="seo-heading">What is Income Planner?</h2>
                    <p className="seo-text">
                        Income Planner is a free calculator that lets you combine different types of investment plans — SIP, Step-Up SIP, SWP, and Lumpsum — into one basket. Instead of calculating each one separately and adding up the numbers yourself, you add them all here and get a combined projection.
                    </p>
                    <p className="seo-text">
                        It works for mutual funds, stocks, gold, or any asset class you want to plan for. You pick the type, set your numbers, and the tool does the rest.
                    </p>
                </div>

                <div className="seo-features">
                    <h2 className="seo-heading">What can you do here?</h2>
                    <ul className="seo-feature-list">
                        <li><strong>SIP Calculator</strong> — Enter a monthly amount, time period, and expected return. See how much it grows.</li>
                        <li><strong>Step-Up SIP</strong> — Same as SIP, but your monthly amount increases every year by a percentage you choose.</li>
                        <li><strong>SWP Calculator</strong> — Plan regular withdrawals from a lump sum. See how long the money lasts.</li>
                        <li><strong>Lumpsum</strong> — Put in a one-time investment and see the compounding over time.</li>
                        <li><strong>Combine everything</strong> — Add as many plans as you want. Get one combined result showing total invested, total returns, and year-by-year growth.</li>
                    </ul>
                </div>

                <div id="how-to-use" className="seo-how-to">
                    <h2 className="seo-heading">How to use Income Planner</h2>
                    <p className="seo-text">It takes about 2 minutes. Here's how:</p>
                    <ol className="how-to-steps">
                        {steps.map((step, index) => (
                            <li key={index} className="how-to-step">
                                <span className="step-number">{step.number}</span>
                                <div className="step-content">
                                    <h3 className="step-title">{step.title}</h3>
                                    <p className="step-description">{step.description}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>

                <div id="common-questions" className="seo-faq">
                    <h2 className="seo-heading">Common Questions</h2>
                    <div className="faq-list" role="list">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className={`faq-item ${openIndex === index ? 'faq-open' : ''}`}
                                role="listitem"
                            >
                                <button
                                    className="faq-question"
                                    onClick={() => toggleFAQ(index)}
                                    aria-expanded={openIndex === index}
                                    aria-controls={`faq-answer-${index}`}
                                >
                                    <span>{faq.question}</span>
                                    <span className="faq-icon" aria-hidden="true">{openIndex === index ? '−' : '+'}</span>
                                </button>
                                {openIndex === index && (
                                    <div id={`faq-answer-${index}`} className="faq-answer" role="region" aria-labelledby={`faq-question-${index}`}>
                                        <p>{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

