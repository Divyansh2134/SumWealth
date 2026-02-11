import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography } from '@mui/material';
import type { CalculatorConfig, SIPConfig, StepUpSIPConfig, SWPConfig, LumpsumConfig, InflationConfig } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import { calculateSIP, calculateStepUpSIP, calculateLumpsum, calculateSWP, formatCurrency, formatCompactNumber, getYearlyProjection } from '../../utils/financeCalculators';
import type { ProjectionResult } from '../../utils/financeCalculators';
import '../../styles/PlanSummaryReport.css';

interface PlanSummaryReportProps {
    calculators: CalculatorConfig[];
}

interface TableRowData {
    id: string;
    name: string;
    asset: string;
    invested: number;
    years: number;
    total: number;
    realValue: number;
}

const COLORS = [
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#f97316', // Orange
    '#6366f1', // Indigo
];

// Note: To access context in Tooltip, we might need to pass currency as prop or use hook inside if Recharts allows.
// Recharts Tooltip renders as a separate component. Let's make it a proper component.

interface TooltipPayload {
    name: string;
    value: number;
    color: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    const { currency } = useCurrency(); // Should work if inside provider

    if (active && payload && payload.length) {
        const activePayload = payload
            .filter((entry) => entry.value > 0)
            .sort((a, b) => b.value - a.value);

        if (activePayload.length === 0) return null;

        return (
            <div className="custom-chart-tooltip" style={{ 
                backgroundColor: 'var(--card-bg)', 
                border: '1px solid var(--border-color)',
                padding: '12px',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}>
                <div className="tooltip-title" style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '12px' }}>Year {label}</div>
                <div className="tooltip-items">
                    {activePayload.map((entry, index: number) => (
                        <div key={index} className="tooltip-item" style={{ marginBottom: '4px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontWeight: 500, marginRight: '8px' }}>{entry.name}: </span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{formatCurrency(entry.value, currency.code, currency.locale)}</span>
                        </div>
                    ))}
                </div>
                <div className="tooltip-footer" style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)', marginRight: '8px' }}>total:</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {formatCurrency(activePayload.reduce((acc: number, curr) => acc + curr.value, 0), currency.code, currency.locale)}
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

export const PlanSummaryReport: React.FC<PlanSummaryReportProps> = ({ calculators }) => {
    const { currency } = useCurrency(); // Consume context

    const reportData = useMemo(() => {
        // Detect global inflation rate if present
        const globalInflationCalc = calculators.find(c => c.type === 'Inflation') as InflationConfig | undefined;
        const globalInflationRate = globalInflationCalc?.rate;

        // 1. Unified Calculation Phase
        const calculatedResults = calculators.map(calc => {
            // Priority: Plan-specific inflation > Global inflation calculator
            const inflation = 'inflationRate' in calc ? calc.inflationRate : globalInflationRate;

            let result: ProjectionResult;
            switch (calc.type) {
                case 'SIP': {
                    const c = calc as SIPConfig;
                    result = calculateSIP(c.monthlyAmount, c.expectedRatePercent, c.durationYears, inflation);
                    break;
                }
                case 'StepUpSIP': {
                    const c = calc as StepUpSIPConfig;
                    result = calculateStepUpSIP(c.initialMonthlyAmount, c.expectedRatePercent, c.durationYears, c.stepUpPercentage, c.stepUpFrequency, inflation);
                    break;
                }
                case 'SWP': {
                    const c = calc as SWPConfig;
                    result = calculateSWP(c.lumpSumAmount, c.withdrawalAmount, c.frequency, c.expectedRatePercent, c.durationYears, inflation);
                    break;
                }
                case 'Lumpsum': {
                    const c = calc as LumpsumConfig;
                    result = calculateLumpsum(c.lumpSumAmount, c.expectedRatePercent, c.durationYears, inflation);
                    break;
                }
                default:
                    result = { totalInvested: 0, totalInterest: 0, maturityValue: 0 };
            }

            return {
                id: calc.id,
                name: calc.name || `${calc.type} ${calculators.filter(c => c.type === calc.type).indexOf(calc) + 1}`,
                asset: calc.assetClass || 'General',
                invested: result.totalInvested,
                gained: result.totalInterest,
                years: 'durationYears' in calc ? (calc as SIPConfig | StepUpSIPConfig | SWPConfig | LumpsumConfig).durationYears : 0,
                total: result.maturityValue,
                realValue: result.inflationAdjustedValue ?? result.maturityValue
            };
        });

        const chartData = calculatedResults.map(res => ({
            name: res.name,
            Invested: res.invested,
            Gained: res.gained,
            Total: res.total
        }));

        const tableData: TableRowData[] = calculatedResults.map(res => ({
            id: res.id,
            name: res.name,
            asset: res.asset,
            invested: res.invested,
            years: res.years,
            total: res.total,
            realValue: res.realValue
        }));

        let maxDuration = 0;
        const colorMap: Record<string, string> = {};

        calculators.forEach((calc, idx) => {
            if ('durationYears' in calc && calc.durationYears > maxDuration) {
                maxDuration = calc.durationYears;
            }
            colorMap[calc.id] = COLORS[idx % COLORS.length];
        });

        const yearlyDataMap = new Map<number, { year: number } & Record<string, number>>();
        for (let y = 1; y <= maxDuration; y++) {
            yearlyDataMap.set(y, { year: y });
        }

        calculators.forEach(calc => {
            const projections = getYearlyProjection(calc);
            const fallbackName = calc.name || `${calc.type} ${calculators.filter(c => c.type === calc.type).indexOf(calc) + 1}`;
            projections.forEach(p => {
                const existing = yearlyDataMap.get(p.year) || { year: p.year };
                existing[fallbackName] = p.value;
                yearlyDataMap.set(p.year, existing);
            });
        });

        const yearlyData = Array.from(yearlyDataMap.values()).sort((a, b) => a.year - b.year);

        const totals = tableData.reduce((acc, curr) => ({
            invested: acc.invested + curr.invested,
            total: acc.total + curr.total,
            realValue: acc.realValue + curr.realValue
        }), { invested: 0, total: 0, realValue: 0 });

        return { chartData, tableData, yearlyData, maxDuration, colorMap, totals };
    }, [calculators]);

    const { chartData, tableData, yearlyData, colorMap, totals } = reportData;

    return (
        <div className="dashboard-content">
            <div className="plan-summary-container">
                <div className="summary-header">
                    <h2>Asset Allocation Analysis</h2>
                </div>

                <div className="summary-card">
                    <div className="summary-card-content">
                        <div className="summary-section-spacer">

                            {/* 1. Bar Chart Section */}
                            <div className="chart-wrapper">
                                <div className="chart-container-resizable" style={{ height: 'max(400px, 40vh)', minHeight: 300, width: '100%', outline: 'none' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                            <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={10} tick={{ fontSize: 10 }} />
                                            <YAxis
                                                stroke="var(--text-secondary)"
                                                fontSize={10}
                                                tick={{ fontSize: 10 }}
                                                tickFormatter={(val) => formatCompactNumber(val, currency.code, currency.locale)}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ 
                                                    borderRadius: '12px', 
                                                    border: '1px solid var(--border-color)', 
                                                    backgroundColor: 'var(--card-bg)', 
                                                    color: 'var(--text-primary)',
                                                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
                                                    fontSize: '12px' 
                                                }}
                                                labelStyle={{ color: 'var(--text-primary)' }}
                                                wrapperStyle={{ outline: 'none' }}
                                                formatter={(val: number | string | undefined) => formatCurrency(Number(val) || 0, currency.code, currency.locale)}
                                            />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
                                            <Bar dataKey="Invested" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} maxBarSize={60} />
                                            <Bar dataKey="Gained" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* 2. Yearly Growth Chart */}
                            <div className="chart-wrapper">
                                <Typography className="section-title">Portfolio Growth Over Time</Typography>
                                <div className="chart-container-resizable" style={{ height: 'max(350px, 35vh)', minHeight: 300, width: '100%', outline: 'none' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={yearlyData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                            <XAxis dataKey="year" stroke="var(--text-secondary)" fontSize={10} tick={{ fontSize: 10 }} />
                                            <YAxis
                                                stroke="var(--text-secondary)"
                                                fontSize={10}
                                                tick={{ fontSize: 10 }}
                                                tickFormatter={(val) => formatCompactNumber(val, currency.code, currency.locale)}
                                            />
                                            <Tooltip 
                                                content={<CustomTooltip />} 
                                                cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
                                                wrapperStyle={{ outline: 'none' }} 
                                            />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }} />
                                            {calculators.map((calc) => (
                                                <Bar 
                                                    key={calc.id} 
                                                    dataKey={calc.name || `${calc.type} ${calculators.filter(c => c.type === calc.type).indexOf(calc) + 1}`} 
                                                    stackId="growth" 
                                                    fill={colorMap[calc.id]} 
                                                    maxBarSize={40} 
                                                />
                                            ))}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* 3. Detailed Table */}
                            <Box sx={{ p: 0 }}>
                                <Typography className="section-title">Plan Breakdown Details</Typography>
                                <TableContainer component={Paper} elevation={0} sx={{
                                    bgcolor: 'var(--card-bg)',
                                    backgroundImage: 'none',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '16px',
                                    overflowX: 'auto',
                                    '&::-webkit-scrollbar': { height: '6px' },
                                    '&::-webkit-scrollbar-thumb': { backgroundColor: 'var(--border-color)', borderRadius: '10px' }
                                }}>
                                    <Table sx={{ minWidth: { xs: 600, sm: 650 } }}>
                                        <TableHead sx={{ bgcolor: 'var(--bg-secondary)' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold', color: 'var(--text-secondary)', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Name</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: 'var(--text-secondary)', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Asset</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'var(--text-secondary)', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Invested</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 'bold', color: 'var(--text-secondary)', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Years</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'var(--text-secondary)', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Total</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'var(--text-secondary)', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Real Value</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {tableData.map((row) => (
                                                <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: 'var(--bg-secondary)' } }}>
                                                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'var(--text-primary)' }}>{row.name}</TableCell>
                                                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                                        <Box component="span" sx={{ px: 2, py: 0.5, borderRadius: '9999px', fontSize: { xs: '10px', sm: '12px' }, fontWeight: 'semibold', bgcolor: 'rgba(98, 0, 234, 0.1)', color: 'var(--primary-color)' }}>
                                                            {row.asset}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'var(--text-primary)' }}>{formatCurrency(row.invested, currency.code, currency.locale)}</TableCell>
                                                    <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: 'var(--text-primary)' }}>{row.years}</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'var(--success-color)', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{formatCurrency(row.total, currency.code, currency.locale)}</TableCell>
                                                    <TableCell align="right" sx={{ color: 'var(--primary-color)', fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{formatCurrency(row.realValue, currency.code, currency.locale)}</TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow sx={{ bgcolor: 'var(--bg-secondary)', '& td': { fontWeight: '800', borderTop: '2px solid var(--border-color)', fontSize: { xs: '0.75rem', sm: '0.875rem' } } }}>
                                                <TableCell colSpan={2} sx={{ color: 'var(--text-primary)' }}>Total Portfolio</TableCell>
                                                <TableCell align="right" sx={{ color: 'var(--text-primary)' }}>{formatCurrency(totals.invested, currency.code, currency.locale)}</TableCell>
                                                <TableCell align="center" sx={{ color: 'var(--text-secondary)' }}>—</TableCell>
                                                <TableCell align="right" sx={{ color: 'var(--success-color)' }}>{formatCurrency(totals.total, currency.code, currency.locale)}</TableCell>
                                                <TableCell align="right" sx={{ color: 'var(--primary-color)' }}>{formatCurrency(totals.realValue, currency.code, currency.locale)}</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
