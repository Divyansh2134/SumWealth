import React, { useState, useRef, useEffect } from 'react';
import { useCalculator } from '../../context/CalculatorContext';
import type { CalculatorType, CalculatorConfig, SIPConfig, StepUpSIPConfig, SWPConfig, LumpsumConfig, InflationConfig, CurrencyConfig } from '../../types';
import { SIPForm } from './forms/SIPForm';
import { StepUpSIPForm } from './forms/StepUpSIPForm';
import { SWPForm } from './forms/SWPForm';
import { LumpsumForm } from './forms/LumpsumForm';
import { InflationForm } from './forms/InflationForm';
import { CurrencyForm } from './forms/CurrencyForm';
import { v4 as uuidv4 } from 'uuid';
import { useTheme } from '../../context/ThemeContext';
import '../../styles/TabbedCalculatorView.css';

export const TabbedCalculatorView: React.FC = () => {
  const { calculators, dispatch } = useCalculator();
  const { theme, toggleTheme } = useTheme();
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Draft Mode State
  const [isChoosingType, setIsChoosingType] = useState(false);
  const [draftConfig, setDraftConfig] = useState<Partial<CalculatorConfig> | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // If no calculators and no draft, show placeholder (handled in render)
  // If calculators exist and no active tab and no draft, select first
  // Scroll detection for mobile header
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const lastScrollY = useRef(0);



  useEffect(() => {
    // Auto-select first tab if none active
    if (calculators.length > 0 && !activeTabId && !draftConfig && !isChoosingType) {
        const timer = setTimeout(() => {
             setActiveTabId(calculators[0].id);
        }, 0);
        return () => clearTimeout(timer);
    }
  }, [calculators, activeTabId, draftConfig, isChoosingType]);

  useEffect(() => {
      const handleScroll = () => {
          const currentScrollY = window.scrollY;
          
          if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
              setIsHeaderCollapsed(true);
          } else {
              setIsHeaderCollapsed(false);
          }
          lastScrollY.current = currentScrollY;
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const startDraft = (type: CalculatorType) => {
    const newConfig: Partial<CalculatorConfig> = {
      id: uuidv4(), // Temp ID
      createdAt: new Date().toISOString(),
      name: '', 
      type: type,
      ...getDefaultsForType(type)
    };
    setDraftConfig(newConfig);
    setActiveTabId(null); // Deselect active tab to show draft
    setIsChoosingType(false);
  };

  const getDefaultsForType = (type: CalculatorType): Partial<CalculatorConfig> => {
      switch(type) {
          case 'SIP': return { monthlyAmount: 5000, durationYears: 10, expectedRatePercent: 12 };
          case 'StepUpSIP': return { initialMonthlyAmount: 5000, durationYears: 10, expectedRatePercent: 12, stepUpPercentage: 10, stepUpFrequency: 'annually' };
          case 'SWP': return { lumpSumAmount: 500000, withdrawalAmount: 5000, frequency: 'monthly', durationYears: 10 };
          case 'Lumpsum': return { lumpSumAmount: 100000, durationYears: 10, expectedRatePercent: 12 };
          case 'Inflation': return { rate: 6 };
          case 'Currency': return { rate: 0 };
          default: return {};
      }
  };

  const handleSaveDraft = (data: Partial<CalculatorConfig>) => {
      if (!draftConfig) return;
      const finalConfig = { ...draftConfig, ...data } as CalculatorConfig;
      dispatch({ type: 'ADD_CALCULATOR', payload: finalConfig });
      setDraftConfig(null);
      setActiveTabId(finalConfig.id);
      
      // Scroll to end
      setTimeout(() => {
          if (scrollContainerRef.current) {
              scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
          }
      }, 100);
  };

  const handleUpdate = (config: CalculatorConfig) => {
    dispatch({ type: 'UPDATE_CALCULATOR', payload: config });
  };

  // Delete Modal State
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Stop tab selection
    setDeleteConfirmationId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmationId) {
        dispatch({ type: 'DELETE_CALCULATOR', payload: deleteConfirmationId });
        if (activeTabId === deleteConfirmationId) {
            setActiveTabId(null);
        }
        setDeleteConfirmationId(null);
    }
  };

  const handleCalculateAll = () => {
    console.log('--- PLAN SUMMARY ---');
    console.log('Calculators:', JSON.stringify(calculators, null, 2));
    alert('Plan JSON exported to console!');
  };

  const activeCalculator = calculators.find(c => c.id === activeTabId);
  const configToShow = draftConfig || activeCalculator;
  const isDraft = !!draftConfig;

  return (
    <div className="dashboard-container">
      {/* Tabs & Sticky Add Button Container */}
      <div className={`tabs-header-wrapper ${isHeaderCollapsed ? 'mobile-collapsed' : ''}`}>
        <div className="tabs-header">
            <div className="app-branding">
                <span className="app-logo-text">SumWealth</span>
            </div>

            <div className="tabs-middle-section">
                <div className="tabs-scroll-area" ref={scrollContainerRef}>
                    {calculators.map(calc => (
                        <button
                            key={calc.id}
                            className={`tab-item ${activeTabId === calc.id ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTabId(calc.id);
                                setDraftConfig(null);
                                setIsChoosingType(false);
                            }}
                        >
                            {calc.name || `${calc.type} ${calculators.indexOf(calc) + 1}`}
                             {activeTabId === calc.id && (
                                <span 
                                    className="tab-remove"
                                    onClick={(e) => {
                                        handleDeleteClick(calc.id, e);
                                    }}
                                >
                                    ×
                                </span>
                            )}
                        </button>
                    ))}
                    {isDraft && (
                        <button className="tab-item active draft-tab">
                            New {draftConfig?.type} (Draft)
                        </button>
                    )}

                    {/* Mobile-Only Add Button (Flows with tabs) */}
                    <div className="sticky-add-wrapper mobile-add-wrapper">
                        <button 
                            className={`sticky-add-btn ${isChoosingType ? 'active' : ''}`}
                            onClick={() => setIsChoosingType(!isChoosingType)}
                            aria-label="Add Calculator"
                        >
                            +
                        </button>
                        
                        {isChoosingType && (
                            <div className="type-selector-dropdown">
                                {['SIP', 'StepUpSIP', 'SWP', 'Lumpsum', 'Inflation', 'Currency'].map((type) => (
                                    <button key={type} onClick={() => startDraft(type as CalculatorType)}>{type}</button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Desktop-Only Add Button (Sticky on right, outside scroll) */}
                <div className="sticky-add-wrapper desktop-add-wrapper">
                    <button 
                        className={`sticky-add-btn ${isChoosingType ? 'active' : ''}`}
                        onClick={() => setIsChoosingType(!isChoosingType)}
                        aria-label="Add Calculator"
                    >
                        +
                    </button>
                    
                    {isChoosingType && (
                        <div className="type-selector-dropdown">
                            {['SIP', 'StepUpSIP', 'SWP', 'Lumpsum', 'Inflation', 'Currency'].map((type) => (
                                <button key={type} onClick={() => startDraft(type as CalculatorType)}>{type}</button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            <div className="header-actions">
                <button className="icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>

                <div className="hamburger-wrapper" style={{ position: 'relative' }}>
                    <button 
                        className="icon-btn hamburger-btn" 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        ☰
                    </button>
                    {isMenuOpen && (
                        <div className="menu-dropdown">
                            <button onClick={() => alert('Profile Clicked')}>Profile</button>
                            <button onClick={() => alert('Settings Clicked')}>Settings</button>
                            <button onClick={() => alert('Help Clicked')}>Help</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-content">
          {configToShow ? (
              <div className="calculator-config-panel">
                 <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <h3>{configToShow.type}</h3>
                     <div className="panel-name-input-wrapper" style={{ flex: 1, marginLeft: '2rem' }}>
                        <input 
                            type="text" 
                            className="header-name-input" 
                            placeholder="Name your calculator..."
                            value={configToShow.name || ''}
                            onChange={(e) => {
                                const newName = e.target.value;
                                if (isDraft) {
                                    setDraftConfig({ ...draftConfig, name: newName });
                                } else {
                                    handleUpdate({ ...configToShow as CalculatorConfig, name: newName });
                                }
                            }}
                        />
                     </div>
                 </div>

                  {configToShow.type === 'SIP' && (
                      <SIPForm 
                        initialData={configToShow as SIPConfig} 
                        onSubmit={(data) => isDraft ? handleSaveDraft(data) : handleUpdate({ ...configToShow as SIPConfig, ...data })} 
                        onCancel={() => { if(isDraft) setDraftConfig(null); }} 
                        isInline={!isDraft} 
                      />
                  )}
                  {configToShow.type === 'StepUpSIP' && (
                      <StepUpSIPForm 
                        initialData={configToShow as StepUpSIPConfig} 
                        onSubmit={(data) => isDraft ? handleSaveDraft(data) : handleUpdate({ ...configToShow as StepUpSIPConfig, ...data })} 
                        onCancel={() => { if(isDraft) setDraftConfig(null); }} 
                        isInline={!isDraft} 
                      />
                  )}
                  {configToShow.type === 'SWP' && (
                      <SWPForm 
                        initialData={configToShow as SWPConfig} 
                        onSubmit={(data) => isDraft ? handleSaveDraft(data) : handleUpdate({ ...configToShow as SWPConfig, ...data })} 
                        onCancel={() => { if(isDraft) setDraftConfig(null); }} 
                        isInline={!isDraft} 
                      />
                  )}
                  {configToShow.type === 'Lumpsum' && (
                      <LumpsumForm 
                        initialData={configToShow as LumpsumConfig} 
                        onSubmit={(data) => isDraft ? handleSaveDraft(data) : handleUpdate({ ...configToShow as LumpsumConfig, ...data })} 
                        onCancel={() => { if(isDraft) setDraftConfig(null); }} 
                        isInline={!isDraft} 
                      />
                  )}
                  {configToShow.type === 'Inflation' && (
                      <InflationForm 
                        initialData={configToShow as InflationConfig} 
                        onSubmit={(data) => isDraft ? handleSaveDraft(data) : handleUpdate({ ...configToShow as InflationConfig, ...data })} 
                        onCancel={() => { if(isDraft) setDraftConfig(null); }} 
                        isInline={!isDraft} 
                      />
                  )}
                  {configToShow.type === 'Currency' && (
                      <CurrencyForm 
                        initialData={configToShow as CurrencyConfig} 
                        onSubmit={(data) => isDraft ? handleSaveDraft(data) : handleUpdate({ ...configToShow as CurrencyConfig, ...data })} 
                        onCancel={() => { if(isDraft) setDraftConfig(null); }} 
                        isInline={!isDraft} 
                      />
                  )}
              </div>
          ) : (
              <div className="dashboard-placeholder">
                  <h3>Start Your Plan</h3>
                  <p>Click the <strong>+</strong> button to add an investment calculator.</p>
              </div>
          )}
      </div>

      {/* Viewfinder / Summary Area */}
      {calculators.length > 0 && (
          <div className="viewfinder-section">
              <div className="viewfinder-header">
                  <h3>Plan Summary</h3>
              </div>
              <div className="viewfinder-grid">
                  {calculators.map(calc => (
                      <div key={calc.id} className={`mini-card ${activeTabId === calc.id ? 'highlighted' : ''}`} onClick={() => { setActiveTabId(calc.id); setDraftConfig(null); }}>
                          <div className="mini-card-header">
                              <span className="mini-card-type">{calc.type}</span>
                              <button className="mini-delete" onClick={(e) => handleDeleteClick(calc.id, e)}>×</button>
                          </div>
                          {calc.name && <div className="mini-card-name">{calc.name}</div>}
                          <div className="mini-card-details">
                               {calc.type === 'SIP' && (
                                   <>
                                    <div>₹{calc.monthlyAmount}/mo</div>
                                    <div className="mini-sub">{calc.durationYears} yrs @ {calc.expectedRatePercent}%</div>
                                   </>
                               )}
                               {calc.type === 'StepUpSIP' && (
                                   <>
                                    <div>₹{calc.initialMonthlyAmount}/mo</div>
                                    <div className="mini-sub">Step {calc.stepUpPercentage}% ({calc.stepUpFrequency})</div>
                                   </>
                               )}
                               {calc.type === 'SWP' && (
                                   <>
                                    <div>Yield ₹{calc.withdrawalAmount}/{calc.frequency.charAt(0)}</div>
                                    <div className="mini-sub">from ₹{calc.lumpSumAmount}</div>
                                   </>
                               )}
                               {calc.type === 'Lumpsum' && (
                                   <>
                                    <div>₹{calc.lumpSumAmount}</div>
                                    <div className="mini-sub">{calc.durationYears} yrs @ {calc.expectedRatePercent}%</div>
                                   </>
                               )}
                               {calc.type === 'Inflation' && (
                                   <>
                                    <div>{calc.rate}%</div>
                                    <div className="mini-sub">Inflation Rate</div>
                                   </>
                               )}
                               {calc.type === 'Currency' && (
                                   <>
                                    <div>{calc.rate > 0 ? '+' : ''}{calc.rate}%</div>
                                    <div className="mini-sub">Currency Effect</div>
                                   </>
                               )}
                          </div>
                      </div>
                  ))}
              </div>

              {/* Footer moved out to be visible on mobile even if viewfinder is hidden */}
          </div>
      )}

      {/* Calculate All Button - Visible always if calculators exist */}
      {calculators.length > 0 && (
        <div className="action-footer-section">
            <button className="btn btn-primary calculate-all-btn" onClick={handleCalculateAll}>
                Calculate All Plans
            </button>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirmationId && (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Delete Calculator?</h3>
                <p>Are you sure you want to remove this calculator from your plan? This action cannot be undone.</p>
                <div className="modal-actions">
                    <button className="btn btn-secondary" onClick={() => setDeleteConfirmationId(null)}>Cancel</button>
                    <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
