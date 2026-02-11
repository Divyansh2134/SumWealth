import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box, Typography } from '@mui/material';
import type { CalculatorConfig, SIPConfig, StepUpSIPConfig, SWPConfig, LumpsumConfig } from '../../types';
import { calculateSIP, calculateStepUpSIP, calculateLumpsum, calculateSWP, formatCurrency, getYearlyProjection } from '../../utils/financeCalculators';
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

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const activePayload = payload
            .filter((entry: any) => entry.value > 0)
            .sort((a: any, b: any) => b.value - a.value);

        if (activePayload.length === 0) return null;

        return (
            <div className="custom-chart-tooltip">
                <div className="tooltip-title">Year {label}</div>
                <div className="tooltip-items">
                    {activePayload.map((entry: any, index: number) => (
                        <div key={index} className="tooltip-item">
                            <span style={{ color: '#64748b', fontWeight: 500 }}>{entry.name}: </span>
                            <span style={{ color: '#1e293b', fontWeight: 600 }}>{formatCurrency(entry.value)}</span>
                        </div>
                    ))}
                </div>
                <div className="tooltip-footer">
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#64748b' }}>total:</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1e293b' }}>
                        {formatCurrency(activePayload.reduce((acc: number, curr: any) => acc + curr.value, 0))}
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

export const PlanSummaryReport: React.FC<PlanSummaryReportProps> = ({ calculators }) => {
    const reportData = useMemo(() => {
        // Detect global inflation rate if present
        const globalInflationCalc = calculators.find(c => c.type === 'Inflation') as any;
        const globalInflationRate = globalInflationCalc?.rate;

        // 1. Unified Calculation Phase
        const calculatedResults = calculators.map(calc => {
            // Priority: Plan-specific inflation > Global inflation calculator
            const inflation = (calc as any).inflationRate ?? globalInflationRate;

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
                name: calc.name || 'Untitled Plan',
                asset: calc.assetClass || 'General',
                invested: result.totalInvested,
                gained: result.totalInterest,
                years: 'durationYears' in calc ? (calc as any).durationYears : 0,
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
            if ('durationYears' in calc && (calc as any).durationYears > maxDuration) {
                maxDuration = (calc as any).durationYears;
            }
            colorMap[calc.id] = COLORS[idx % COLORS.length];
        });

        const yearlyDataMap = new Map<number, any>();
        for (let y = 1; y <= maxDuration; y++) {
            yearlyDataMap.set(y, { year: y });
        }

        calculators.forEach(calc => {
            const projections = getYearlyProjection(calc);
            projections.forEach(p => {
                const existing = yearlyDataMap.get(p.year) || { year: p.year };
                existing[calc.name || 'Untitled'] = p.value;
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
                                <div className="chart-container-resizable" style={{ height: 'max(400px, 40vh)', minHeight: 300, width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} tick={{ fontSize: 10 }} />
                                            <YAxis
                                                stroke="#64748b"
                                                fontSize={10}
                                                tick={{ fontSize: 10 }}
                                                tickFormatter={(val) => {
                                                    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
                                                    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
                                                    return `₹${val}`;
                                                }}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#fff', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                                formatter={(val: number | string | undefined) => formatCurrency(Number(val) || 0)}
                                            />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                            <Bar dataKey="Invested" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} maxBarSize={60} />
                                            <Bar dataKey="Gained" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* 2. Yearly Growth Chart */}
                            <div className="chart-wrapper">
                                <Typography className="section-title">Portfolio Growth Over Time</Typography>
                                <div className="chart-container-resizable" style={{ height: 'max(350px, 35vh)', minHeight: 300, width: '100%' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={yearlyData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                                            <XAxis dataKey="year" stroke="#64748b" fontSize={10} tick={{ fontSize: 10 }} />
                                            <YAxis
                                                stroke="#64748b"
                                                fontSize={10}
                                                tick={{ fontSize: 10 }}
                                                tickFormatter={(val) => {
                                                    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
                                                    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
                                                    return `₹${val}`;
                                                }}
                                            />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} wrapperStyle={{ outline: 'none', pointerEvents: 'none' }} />
                                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                            {calculators.map((calc) => (
                                                <Bar key={calc.id} dataKey={calc.name || 'Untitled'} stackId="growth" fill={colorMap[calc.id]} maxBarSize={40} />
                                            ))}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* 3. Detailed Table */}
                            <Box sx={{ p: 0 }}>
                                <Typography className="section-title">Plan Breakdown Details</Typography>
                                <TableContainer component={Paper} elevation={0} sx={{
                                    bgcolor: 'transparent',
                                    border: '1px solid #f1f5f9',
                                    borderRadius: '16px',
                                    overflowX: 'auto',
                                    '&::-webkit-scrollbar': { height: '6px' },
                                    '&::-webkit-scrollbar-thumb': { backgroundColor: '#e2e8f0', borderRadius: '10px' }
                                }}>
                                    <Table sx={{ minWidth: { xs: 600, sm: 650 } }}>
                                        <TableHead sx={{ bgcolor: '#f8fafc' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold', color: '#64748b', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Name</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', color: '#64748b', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Asset</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#64748b', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Invested</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 'bold', color: '#64748b', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Years</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#64748b', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Total</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 'bold', color: '#64748b', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>Real Value</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {tableData.map((row) => (
                                                <TableRow key={row.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { bgcolor: '#f8fafc' } }}>
                                                    <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{row.name}</TableCell>
                                                    <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                                        <Box component="span" sx={{ px: 2, py: 0.5, borderRadius: '9999px', fontSize: { xs: '10px', sm: '12px' }, fontWeight: 'semibold', bgcolor: '#eff6ff', color: '#2563eb' }}>
                                                            {row.asset}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{formatCurrency(row.invested)}</TableCell>
                                                    <TableCell align="center" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{row.years}</TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 'bold', color: '#10b981', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{formatCurrency(row.total)}</TableCell>
                                                    <TableCell align="right" sx={{ color: '#3b82f6', fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{formatCurrency(row.realValue)}</TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow sx={{ bgcolor: '#f8fafc', '& td': { fontWeight: '800', borderTop: '2px solid #e2e8f0', fontSize: { xs: '0.75rem', sm: '0.875rem' } } }}>
                                                <TableCell colSpan={2} sx={{ color: '#475569' }}>Total Portfolio</TableCell>
                                                <TableCell align="right" sx={{ color: '#334155' }}>{formatCurrency(totals.invested)}</TableCell>
                                                <TableCell align="center" sx={{ color: '#94a3b8' }}>—</TableCell>
                                                <TableCell align="right" sx={{ color: '#059669' }}>{formatCurrency(totals.total)}</TableCell>
                                                <TableCell align="right" sx={{ color: '#2563eb' }}>{formatCurrency(totals.realValue)}</TableCell>
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
