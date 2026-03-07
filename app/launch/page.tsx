'use client';

import { useAppStore, LaunchConfig } from '@/lib/store';
import { cn } from '@/lib/utils';

const STEPS = [
  'Select Token',
  'Configure Market',
  'Set Fees',
  'Initial Liquidity',
  'Review',
  'Deploy',
];

export default function LaunchPage() {
  const { launchStep, setLaunchStep, launchConfig, updateLaunchConfig, resetLaunchConfig } = useAppStore();

  const canNext = () => {
    switch (launchStep) {
      case 1: return launchConfig.tokenMint.length > 0;
      case 2: return launchConfig.maxLeverage > 0;
      case 3: return launchConfig.tradingFeeBps > 0;
      case 4: return launchConfig.initialLiquidity > 0;
      case 5: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-[calc(100vh-48px)] flex flex-col items-center px-6 py-12">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-12">
        {STEPS.map((step, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono border transition-colors',
                i + 1 === launchStep
                  ? 'border-white text-white'
                  : i + 1 < launchStep
                  ? 'border-[#00ff88] text-[#00ff88]'
                  : 'border-white/[0.06] text-[#666]'
              )}
            >
              {i + 1 < launchStep ? '✓' : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn('w-8 h-px', i + 1 < launchStep ? 'bg-[#00ff88]' : 'bg-white/[0.06]')} />
            )}
          </div>
        ))}
      </div>

      {/* Step title */}
      <h2 className="text-sm text-[#666] uppercase tracking-wider font-mono mb-2">
        Step {launchStep} of 6
      </h2>
      <h1 className="text-2xl font-mono font-bold mb-8">{STEPS[launchStep - 1]}</h1>

      {/* Step content */}
      <div className="w-full max-w-lg border border-white/[0.06] bg-[#080808] p-8">
        {launchStep === 1 && <StepToken config={launchConfig} update={updateLaunchConfig} />}
        {launchStep === 2 && <StepConfigure config={launchConfig} update={updateLaunchConfig} />}
        {launchStep === 3 && <StepFees config={launchConfig} update={updateLaunchConfig} />}
        {launchStep === 4 && <StepLiquidity config={launchConfig} update={updateLaunchConfig} />}
        {launchStep === 5 && <StepReview config={launchConfig} />}
        {launchStep === 6 && <StepDeploy onReset={resetLaunchConfig} />}
      </div>

      {/* Navigation */}
      {launchStep < 6 && (
        <div className="flex gap-4 mt-8">
          {launchStep > 1 && (
            <button
              onClick={() => setLaunchStep(launchStep - 1)}
              className="px-6 py-2 border border-white/[0.06] text-sm font-mono text-[#666] hover:text-white transition-colors"
            >
              ← Back
            </button>
          )}
          <button
            onClick={() => setLaunchStep(launchStep + 1)}
            disabled={!canNext()}
            className={cn(
              'px-6 py-2 text-sm font-mono transition-colors',
              canNext()
                ? 'bg-white text-black hover:bg-[#e0e0e0]'
                : 'bg-white/[0.06] text-[#666] cursor-not-allowed'
            )}
          >
            {launchStep === 5 ? 'Deploy →' : 'Next →'}
          </button>
        </div>
      )}
    </div>
  );
}

function StepToken({ config, update }: { config: LaunchConfig; update: (p: Partial<LaunchConfig>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-[10px] text-[#666] uppercase tracking-wider">Token Mint Address</label>
        <input
          type="text"
          value={config.tokenMint}
          onChange={(e) => update({ tokenMint: e.target.value })}
          placeholder="Paste SPL token mint address..."
          className="w-full mt-1 bg-black border border-white/[0.06] px-4 py-3 text-sm font-mono text-white outline-none focus:border-white/20"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] text-[#666] uppercase tracking-wider">Token Name</label>
          <input
            type="text"
            value={config.tokenName}
            onChange={(e) => update({ tokenName: e.target.value })}
            placeholder="e.g. Solana"
            className="w-full mt-1 bg-black border border-white/[0.06] px-4 py-3 text-sm font-mono text-white outline-none focus:border-white/20"
          />
        </div>
        <div>
          <label className="text-[10px] text-[#666] uppercase tracking-wider">Symbol</label>
          <input
            type="text"
            value={config.tokenSymbol}
            onChange={(e) => update({ tokenSymbol: e.target.value })}
            placeholder="e.g. SOL"
            className="w-full mt-1 bg-black border border-white/[0.06] px-4 py-3 text-sm font-mono text-white outline-none focus:border-white/20"
          />
        </div>
      </div>
      <p className="text-[11px] text-[#666]">
        Any SPL token on Solana can have a perpetual futures market. Paste the mint address or search by name.
      </p>
    </div>
  );
}

function StepConfigure({ config, update }: { config: LaunchConfig; update: (p: Partial<LaunchConfig>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between">
          <label className="text-[10px] text-[#666] uppercase tracking-wider">Max Leverage</label>
          <span className="text-sm font-mono text-white">{config.maxLeverage}x</span>
        </div>
        <input
          type="range"
          min={1}
          max={50}
          value={config.maxLeverage}
          onChange={(e) => update({ maxLeverage: parseInt(e.target.value) })}
          className="mt-2"
        />
        <div className="flex justify-between text-[10px] text-[#666] font-mono mt-1">
          <span>1x</span>
          <span>50x</span>
        </div>
      </div>
      <div>
        <label className="text-[10px] text-[#666] uppercase tracking-wider">Initial Margin (%)</label>
        <input
          type="number"
          value={config.initialMargin}
          onChange={(e) => update({ initialMargin: parseFloat(e.target.value) || 0 })}
          className="w-full mt-1 bg-black border border-white/[0.06] px-4 py-3 text-sm font-mono text-white outline-none focus:border-white/20"
        />
      </div>
      <div>
        <label className="text-[10px] text-[#666] uppercase tracking-wider">Maintenance Margin (%)</label>
        <input
          type="number"
          value={config.maintenanceMargin}
          onChange={(e) => update({ maintenanceMargin: parseFloat(e.target.value) || 0 })}
          className="w-full mt-1 bg-black border border-white/[0.06] px-4 py-3 text-sm font-mono text-white outline-none focus:border-white/20"
        />
      </div>
    </div>
  );
}

function StepFees({ config, update }: { config: LaunchConfig; update: (p: Partial<LaunchConfig>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-[10px] text-[#666] uppercase tracking-wider">Trading Fee (bps)</label>
        <input
          type="number"
          value={config.tradingFeeBps}
          onChange={(e) => update({ tradingFeeBps: parseInt(e.target.value) || 0 })}
          className="w-full mt-1 bg-black border border-white/[0.06] px-4 py-3 text-sm font-mono text-white outline-none focus:border-white/20"
        />
        <p className="text-[10px] text-[#666] mt-1">1 bps = 0.01%. Typical: 5-30 bps</p>
      </div>
      <div>
        <label className="text-[10px] text-[#666] uppercase tracking-wider">Liquidation Fee (bps)</label>
        <input
          type="number"
          value={config.liquidationFeeBps}
          onChange={(e) => update({ liquidationFeeBps: parseInt(e.target.value) || 0 })}
          className="w-full mt-1 bg-black border border-white/[0.06] px-4 py-3 text-sm font-mono text-white outline-none focus:border-white/20"
        />
        <p className="text-[10px] text-[#666] mt-1">Fee charged on liquidation events. Typical: 50-100 bps</p>
      </div>
    </div>
  );
}

function StepLiquidity({ config, update }: { config: LaunchConfig; update: (p: Partial<LaunchConfig>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-[10px] text-[#666] uppercase tracking-wider">Initial Liquidity (USDC)</label>
        <input
          type="number"
          value={config.initialLiquidity || ''}
          onChange={(e) => update({ initialLiquidity: parseFloat(e.target.value) || 0 })}
          placeholder="1000"
          className="w-full mt-1 bg-black border border-white/[0.06] px-4 py-3 text-sm font-mono text-white outline-none focus:border-white/20"
        />
        <p className="text-[10px] text-[#666] mt-1">Amount of USDC to seed the liquidity pool</p>
      </div>
      <div>
        <div className="flex justify-between">
          <label className="text-[10px] text-[#666] uppercase tracking-wider">LP Spread (%)</label>
          <span className="text-sm font-mono text-white">{config.lpSpread}%</span>
        </div>
        <input
          type="range"
          min={0.1}
          max={5}
          step={0.1}
          value={config.lpSpread}
          onChange={(e) => update({ lpSpread: parseFloat(e.target.value) })}
          className="mt-2"
        />
      </div>
    </div>
  );
}

function StepReview({ config }: { config: LaunchConfig }) {
  const rows = [
    ['Token', `${config.tokenSymbol} (${config.tokenName})`],
    ['Mint', config.tokenMint.slice(0, 16) + '...'],
    ['Max Leverage', `${config.maxLeverage}x`],
    ['Initial Margin', `${config.initialMargin}%`],
    ['Maintenance Margin', `${config.maintenanceMargin}%`],
    ['Trading Fee', `${config.tradingFeeBps} bps`],
    ['Liquidation Fee', `${config.liquidationFeeBps} bps`],
    ['Initial Liquidity', `${config.initialLiquidity} USDC`],
    ['LP Spread', `${config.lpSpread}%`],
  ];

  return (
    <div className="space-y-3">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between py-2 border-b border-white/[0.04]">
          <span className="text-[11px] text-[#666]">{label}</span>
          <span className="text-sm font-mono text-white">{value}</span>
        </div>
      ))}
    </div>
  );
}

function StepDeploy({ onReset }: { onReset: () => void }) {
  return (
    <div className="text-center py-8 space-y-4">
      <div className="text-4xl">🚀</div>
      <h3 className="text-lg font-mono font-bold text-[#00ff88]">Market Deployed!</h3>
      <p className="text-sm text-[#666]">
        Your perpetual futures market is now live on Solana devnet.
      </p>
      <p className="text-xs text-[#666] font-mono">
        Transaction: 5xKp...3mNq
      </p>
      <div className="flex gap-4 justify-center mt-6">
        <button
          onClick={onReset}
          className="px-6 py-2 border border-white/[0.06] text-sm font-mono text-[#666] hover:text-white transition-colors"
        >
          Launch Another
        </button>
        <a
          href="/markets"
          className="px-6 py-2 bg-white text-black text-sm font-mono hover:bg-[#e0e0e0] transition-colors"
        >
          View Markets →
        </a>
      </div>
    </div>
  );
}
