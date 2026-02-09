import { useState } from "react";
import "./InvestmentCalculator.css";
import AddAssetModal from "./AddAssetModal";
import { assets } from "../constans/assets";

interface AssetData {
    id: number;
    type: keyof typeof assets;
    name: string;
    investmentType: "SIP" | "Lumpsum";
    amount: string;
    expectedReturn: string;
    timePeriod: string;
    stepUpRate: string;
    currencyRate: string;
    inflationRate: string;
}

// Helper to format camelCase to Title Case
const formatAssetName = (name: string) => {
    return name.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
};

interface SliderInputProps {
    label: string;
    value: string | number;
    onChange: (val: string) => void;
    min?: number;
    max?: number;
    unit?: string;
}

const SliderInput = ({ label, value, onChange, min = 0, max = 100, unit = "%" }: SliderInputProps) => {
    const val = value === "" ? 0 : Number(value);
    const progress = ((val - min) / (max - min)) * 100;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        // Prevent negative values
        if (newVal === "" || Number(newVal) >= 0) {
            onChange(newVal);
        }
    };

    return (
        <div className="slider-input-group">
            <div className="slider-header">
                <label>{label}</label>
                <div className="input-wrapper">
                    <input
                        type="number"
                        value={value}
                        onChange={handleInputChange}
                        className="number-input"
                        min="0"
                    />
                    <span className="unit">{unit}</span>
                </div>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                value={val}
                onChange={(e) => onChange(e.target.value)}
                className="slider-range"
                style={{ backgroundSize: `${progress}% 100%` }}
            />
        </div>
    );
};

export default function InvestmentCalculator() {
    // Consolidated State: Array of AssetData objects
    const [assetsList, setAssetsList] = useState<AssetData[]>([
        {
            id: 1,
            type: "mutualFund",
            name: "My MF",
            investmentType: "SIP",
            amount: "5000",
            expectedReturn: "12",
            timePeriod: "10",
            stepUpRate: "10",
            currencyRate: "0",
            inflationRate: "6"
        }
    ]);
    const [activeAssetId, setActiveAssetId] = useState<number>(1);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Derived state for the active asset
    const activeAssetIndex = assetsList.findIndex(a => a.id === activeAssetId);
    const activeAsset = assetsList[activeAssetIndex];
    const activeConfig = (activeAsset ? assets[activeAsset.type] : assets.mutualFund) as {
        principalAmount?: boolean;
        expectedReturnRate?: boolean;
        timePeriodYears?: boolean;
        stepUpRate?: boolean;
        currencyBoostRate?: boolean;
        inflationRate?: boolean;
    };

    // Handler to update fields for the active asset
    const updateActiveAsset = (field: keyof AssetData, value: string) => {
        const updatedAssets = [...assetsList];
        updatedAssets[activeAssetIndex] = {
            ...updatedAssets[activeAssetIndex],
            [field]: value
        };
        setAssetsList(updatedAssets);
    };

    const handleAddAsset = (newAsset: { type: string; name: string }) => {
        const id = assetsList.length + 1;
        // Create new asset with default values
        const asset: AssetData = {
            id,
            type: newAsset.type as keyof typeof assets,
            name: newAsset.name,
            investmentType: "SIP",
            amount: "5000",
            expectedReturn: "12",
            timePeriod: "10",
            stepUpRate: "0",
            currencyRate: "0",
            inflationRate: "0"
        };
        setAssetsList([...assetsList, asset]);
        setActiveAssetId(id);
    };

    const handleCalculate = () => {
        console.log("Calculated Assets Data:", assetsList);
    };

    if (!activeAsset) return null; // Safety check

    return (
        <div className="calculator">
            {/* Header: Dynamic Asset List */}
            <div className="header-list">
                <div className="asset-scroll">
                    {assetsList.map((asset) => (
                        <button
                            key={asset.id}
                            className={`asset-pill ${activeAssetId === asset.id ? "active" : ""}`}
                            onClick={() => setActiveAssetId(asset.id)}
                        >
                            <span className="asset-name">{asset.name}</span>
                            <span className="asset-type-badge">{formatAssetName(asset.type)}</span>
                        </button>
                    ))}
                    <button className="add-asset-btn" onClick={() => setIsModalOpen(true)}>
                        +
                    </button>
                </div>
            </div>

            <hr />

            {/* Investment Type */}
            <div className="investment-type">
                {(["SIP", "Lumpsum"] as const).map((type) => (
                    <button
                        key={type}
                        className={`pill ${activeAsset.investmentType === type ? "active" : ""}`}
                        onClick={() => updateActiveAsset("investmentType", type)}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Form Fields */}
            <div className="form">
                {/* Principal Amount */}
                {activeConfig.principalAmount && (
                    <SliderInput
                        label={activeAsset.investmentType === "SIP" ? "Monthly Investment" : "Total Investment"}
                        value={activeAsset.amount}
                        onChange={(v: string) => updateActiveAsset("amount", v)}
                        min={500}
                        max={1000000}
                        unit="₹"
                    />
                )}

                {/* Expected Return */}
                {activeConfig.expectedReturnRate && (
                    <SliderInput
                        label="Expected Return (p.a)"
                        value={activeAsset.expectedReturn}
                        onChange={(v: string) => updateActiveAsset("expectedReturn", v)}
                        min={1}
                        max={30}
                    />
                )}

                {/* Time Period */}
                {activeConfig.timePeriodYears && (
                    <SliderInput
                        label="Time Period"
                        value={activeAsset.timePeriod}
                        onChange={(v: string) => updateActiveAsset("timePeriod", v)}
                        min={1}
                        max={50}
                        unit="Yr"
                    />
                )}

                {/* Step Up - Only for SIP */}
                {activeAsset.investmentType === "SIP" && activeConfig.stepUpRate && (
                    <SliderInput
                        label="Step Up"
                        value={activeAsset.stepUpRate}
                        onChange={(v: string) => updateActiveAsset("stepUpRate", v)}
                        min={0}
                        max={50}
                    />
                )}

                {/* Currency Boost */}
                {activeConfig.currencyBoostRate && (
                    <SliderInput
                        label="Currency Depreciation"
                        value={activeAsset.currencyRate}
                        onChange={(v: string) => updateActiveAsset("currencyRate", v)}
                        min={0}
                        max={20}
                    />
                )}

                {/* Inflation Drag */}
                {activeConfig.inflationRate && (
                    <SliderInput
                        label="Inflation Rate"
                        value={activeAsset.inflationRate}
                        onChange={(v: string) => updateActiveAsset("inflationRate", v)}
                        min={0}
                        max={20}
                    />
                )}
            </div>

            <div className="action-area">
                <button className="calculate-btn" onClick={handleCalculate}>
                    Calculate
                </button>
            </div>

            <AddAssetModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddAsset}
            />
        </div>
    );
}
