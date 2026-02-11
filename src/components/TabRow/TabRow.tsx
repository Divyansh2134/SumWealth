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
    const dropdownRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                </div>

                {/* Add Button Inside Inner to stay within 1200px bounds but positioned absolutely */}
                <div className="add-btn-wrapper" ref={dropdownRef}>
                    <button
                        className={`sticky-add-btn ${isDropdownOpen ? 'active' : ''}`}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        aria-label="Add Calculator"
                    >
                        +
                    </button>
                    {isDropdownOpen && (
                        <div className="asset-dropdown">
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
    );
};
