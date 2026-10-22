import logoPng from "../../assets/logo.png";

interface ContriFlowLogoProps {
  className?: string;
  imgClassName?: string;
  showText?: boolean;
  textClassName?: string;
}

export function ContriFlowLogo({
  className = "w-7 h-7",
  imgClassName = "",
  showText = false,
  textClassName = "text-base font-semibold tracking-tight text-foreground",
}: ContriFlowLogoProps) {
  return (
    <div className="inline-flex items-center gap-2.5">
      <div
        className={`relative overflow-hidden rounded-md border border-border/60 bg-muted/20 shrink-0 flex items-center justify-center ${className}`}
      >
        <img
          src={logoPng}
          alt="ContriFlow"
          className={`w-full h-full object-cover select-none ${imgClassName}`}
        />
      </div>
      {showText && <span className={textClassName}>ContriFlow</span>}
    </div>
  );
}

export function ContriFlowIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <img
      src={logoPng}
      alt="ContriFlow Icon"
      className={`${className} object-cover rounded-md select-none shrink-0`}
    />
  );
}

export default ContriFlowLogo;
