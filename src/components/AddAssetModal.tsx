import { useState } from "react";
import "./InvestmentCalculator.css";
import { assets } from "../constans/assets";

interface AddAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (asset: { type: string; name: string }) => void;
}

export default function AddAssetModal({ isOpen, onClose, onAdd }: AddAssetModalProps) {
    const assetTypes = Object.keys(assets);
    const [type, setType] = useState(assetTypes[0]);
    const [name, setName] = useState("");

    if (!isOpen) return null;

    const handleAdd = () => {
        if (name.trim()) {
            onAdd({ type, name });
            setName(""); // Reset name
            onClose();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Add New Asset</h3>

                <div className="modal-field">
                    <label>Asset Type</label>
                    <select value={type} onChange={(e) => setType(e.target.value)}>
                        {assetTypes.map((assetType) => (
                            <option key={assetType} value={assetType}>
                                {assetType}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="modal-field">
                    <label>Asset Name</label>
                    <input
                        type="text"
                        placeholder="e.g., Nifty 50, Bitcoin"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                <div className="modal-actions">
                    <button onClick={onClose} className="cancel-btn">Cancel</button>
                    <button onClick={handleAdd} className="add-btn">Add</button>
                </div>
            </div>
        </div>
    );
}
