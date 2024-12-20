import { Component, createSignal, createEffect, For, onMount, Show } from 'solid-js';
import { Portal } from 'solid-js/web';

interface EarthInfoProps {
  show: boolean;
  onClose: () => void;
}

const CityIcon: Component<{ city: string }> = (props) => {
  const icons: Record<string, string> = {
    'New York': '🗽',
    'London': '🎡',
    'Tokyo': '⛩️',
    'Sydney': '🏛️',
    'Dubai': '🕌',
    'Los Angeles': '🌴',
    'Local Time': '🏠'
  };

  return (
    <span class="text-lg inline-block transform-gpu group-hover:scale-125" style={{ "transition": "transform 200ms ease-out" }}>
      {icons[props.city] || '🌍'}
    </span>
  );
};

export const EarthInfo: Component<EarthInfoProps> = (props) => {
  const [isExpanded, setIsExpanded] = createSignal(true);
  const [timeData, setTimeData] = createSignal<Record<string, string>>({});
  let cardRef: HTMLDivElement;

  // Handle click outside
  onMount(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef && !cardRef.contains(event.target as Node) && isExpanded()) {
        setIsExpanded(false);
        props.onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  });

  // Auto-minimize after 10 seconds
  createEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (props.show && isExpanded()) {
      timer = setTimeout(() => {
        setIsExpanded(false);
        props.onClose();
      }, 10000);
    }
    return () => clearTimeout(timer);
  });

  // Update times every minute
  createEffect(() => {
    const updateTimes = () => {
      const formatOptions = { 
        timeZone: 'America/New_York',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      } as Intl.DateTimeFormatOptions;

      const times: Record<string, string> = {
        'New York': new Date().toLocaleTimeString('en-US', { ...formatOptions, timeZone: 'America/New_York' }) + ' EST',
        'London': new Date().toLocaleTimeString('en-US', { ...formatOptions, timeZone: 'Europe/London' }) + ' GMT',
        'Tokyo': new Date().toLocaleTimeString('en-US', { ...formatOptions, timeZone: 'Asia/Tokyo' }) + ' GMT+9',
        'Sydney': new Date().toLocaleTimeString('en-US', { ...formatOptions, timeZone: 'Australia/Sydney' }) + ' GMT+11',
        'Dubai': new Date().toLocaleTimeString('en-US', { ...formatOptions, timeZone: 'Asia/Dubai' }) + ' GMT+4',
        'Los Angeles': new Date().toLocaleTimeString('en-US', { ...formatOptions, timeZone: 'America/Los_Angeles' }) + ' PST',
        'Local Time': new Date().toLocaleTimeString('en-US', { ...formatOptions }) + ' CST'
      };
      setTimeData(times);
    };

    updateTimes();
    // Update immediately and then set interval for next minute
    const now = new Date();
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    
    // First timeout to sync with minute
    const syncTimeout = setTimeout(() => {
      updateTimes();
      // Then start the interval on the minute
      const interval = setInterval(updateTimes, 60000);
      return () => clearInterval(interval);
    }, msUntilNextMinute);

    return () => clearTimeout(syncTimeout);
  });

  return (
    <Portal>
      <div
        ref={cardRef!}
        class="timezone-panel fixed md:right-8 right-4 md:bottom-24 bottom-20 bg-[rgba(20,20,20,0.66)] backdrop-blur-xl text-white rounded-xl border border-white/10 shadow-2xl transition-all duration-500 ease-in-out select-none cursor-pointer z-50"
        style={{
          'max-height': isExpanded() ? 'min(400px, 70vh)' : '64px',
          width: isExpanded() ? 'min(320px, calc(100vw - 32px))' : 'min(200px, calc(100vw - 32px))',
          overflow: 'hidden'
        }}
        onClick={(e) => {
          if (!isExpanded()) {
            e.stopPropagation();
            setIsExpanded(true);
          }
        }}
      >
        <div class="px-4 md:px-5 py-4 space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"></div>
              <span class="font-medium tracking-wide whitespace-nowrap text-sm md:text-base">
                {isExpanded() ? 'Earth Time Zones' : (
                  <div class="flex items-center gap-2">
                    <span class="text-base md:text-lg">🌍</span>
                    <span>Time Zones</span>
                  </div>
                )}
              </span>
            </div>
            <Show when={isExpanded()}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                  props.onClose();
                }}
                class="text-red-500 hover:text-red-400 transition-colors absolute top-3 right-3 flex items-center justify-center"
                aria-label="Close time zones"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </Show>
          </div>

          <div 
            class="space-y-2 transition-all duration-500"
            style={{
              opacity: isExpanded() ? '1' : '0',
              transform: isExpanded() ? 'translateY(0)' : 'translateY(-8px)'
            }}
          >
            <For each={Object.entries(timeData())}>
              {([city, time]) => (
                <div class="flex items-center justify-between p-1.5 group cursor-default">
                  <div class="flex items-center gap-2">
                    <CityIcon city={city} />
                    <span class="text-xs md:text-sm text-white/80">{city}</span>
                  </div>
                  <span class="font-mono text-xs md:text-sm tabular-nums text-white/80">{time}</span>
                </div>
              )}
            </For>
          </div>
        </div>
      </div>
    </Portal>
  );
}; 