"use client";

type Props = {
  onResume: () => void;
  onDiscard: () => void;
};

/**
 * Resume-or-discard banner.
 *
 * Why a separate component: the banner is a self-contained interaction
 * (two callbacks, fixed copy), and lifting its JSX out of the orchestrator
 * keeps `ApplyForm` reading like a 5-step wizard, not a banner host.
 */
export function DraftBanner({ onResume, onDiscard }: Props) {
  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-ink text-paper px-6 py-4 flex items-center justify-between gap-4">
      <p className="text-[0.95rem] font-sans">
        드래프트가 저장되어 있습니다. 이어서 쓰시겠습니까?
      </p>
      <div className="flex gap-4">
        <button
          onClick={onResume}
          className="text-[0.95rem] font-sans underline underline-offset-4 hover:text-brass transition-colors"
        >
          이어쓰기
        </button>
        <button
          onClick={onDiscard}
          className="text-[0.95rem] font-sans text-paper/70 hover:text-paper transition-colors"
        >
          새로 시작
        </button>
      </div>
    </div>
  );
}
