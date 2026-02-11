import React, { useRef } from 'react';
import type { CalculatorConfig } from '../../types';
import '../../styles/TabRow.css';

import { ASSET_CLASSES } from '../../constants/assets';

interface TabRowProps {
    calculators: CalculatorConfig[];
    activeTabId: string | null;
    isDraft: boolean;
    draftType?: string;
    onTabClick: (id: string) => void;
    onDeleteClick: (id: string, e: React.MouseEvent) => void;
    onAddClick: (assetClass?: string) => void;
}

export const TabRow: React.FC<TabRowProps> = ({
    calculators,
    activeTabId,
    isDraft,
    draftType,
    onTabClick,
    onDeleteClick,
    onAddClick
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [dropdownPos, setDropdownPos] = React.useState<{ top: number, left: number } | null>(null);
    
    const dropdownRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Toggle dropdown and calculate position
    const toggleDropdown = () => {
        if (isDropdownOpen) {
            setIsDropdownOpen(false);
            setDropdownPos(null);
        } else {
            if (dropdownRef.current) {
                const rect = dropdownRef.current.getBoundingClientRect();
                // Position below the button, aligned to right edge of button
                // We use fixed positioning to escape clipping from overflow:hidden parents
                setDropdownPos({
                    top: rect.bottom + 8, // 8px gap
                    left: rect.right - 200 // Width of dropdown is 200px (defined in CSS, moving to inline style)
                });
            }
            setIsDropdownOpen(true);
        }
    };

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if click is outside dropdown AND outside the toggle button
            // The dropdown is now rendered in a separate portal-like div (fixed pos), checking ref might be tricky
            // actually, we can check if target is within dropdownRef (the button wrapper)
            // But wait, the dropdown itself is NOT inside dropdownRef in the DOM structure if we use Portal?
            // Here we render it 'inside' the JSX but with fixed position.
            // React event bubbling might still work, but DOM containment check needs care.
            
            // If the dropdown is rendered *inside* the div but fixed, it IS a child in DOM.
            // So dropdownRef.current.contains(target) should work IF the dropdown is inside that div.
            
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        const updatePos = () => {
             if (isDropdownOpen && dropdownRef.current) {
                const rect = dropdownRef.current.getBoundingClientRect();
                setDropdownPos({
                    top: rect.bottom + 8,
                    left: rect.right - 200
                });
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', updatePos, true);
        window.addEventListener('resize', updatePos);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', updatePos, true);
            window.removeEventListener('resize', updatePos);
        };
    }, [isDropdownOpen]);

    return (
        <div className="tab-row-container">
            <div className="tab-row-inner">
                <div className="tab-scroll-area" ref={scrollContainerRef}>
                    {calculators.map(calc => (
                        <button
                            key={calc.id}
                            className={`tab-item ${activeTabId === calc.id ? 'active' : ''}`}
                            onClick={() => onTabClick(calc.id)}
                        >
                            {calc.name || `${calc.type} ${calculators.indexOf(calc) + 1}`}
                            {activeTabId === calc.id && (
                                <span
                                    className="tab-remove"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteClick(calc.id, e);
                                    }}
                                >
                                    ×
                                </span>
                            )}
                        </button>
                    ))}

                    {isDraft && (
                        <button className="tab-item active draft-tab">
                            New {draftType} (Draft)
                        </button>
                    )}

                    {/* Add Button Inside Scroll Area to be sticky within it */}
                    <div className="add-btn-wrapper" ref={dropdownRef}>
                        <button
                            className={`sticky-add-btn ${isDropdownOpen ? 'active' : ''}`}
                            onClick={toggleDropdown}
                            aria-label="Add Calculator"
                        >
                            +
                        </button>
                        {isDropdownOpen && dropdownPos && (
                            <div 
                                className="asset-dropdown"
                                style={{
                                    position: 'fixed',
                                    top: dropdownPos.top,
                                    left: dropdownPos.left,
                                    marginTop: 0, // Override CSS margin
                                    width: '200px'
                                }}
                            >
                                {ASSET_CLASSES.map(asset => (
                                    <button
                                        key={asset.id}
                                        className="asset-dropdown-item"
                                        onClick={() => {
                                            onAddClick(asset.id);
                                            setIsDropdownOpen(false);
                                        }}
                                    >
                                        <span className="asset-dropdown-name">{asset.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
