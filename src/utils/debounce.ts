function debounce(callback: (...args: any[]) => Promise<any>, delay: number) {
  let timeoutId: NodeJS.Timeout | null = null;
  return async function debouncedCallback(...args: any[]) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(async () => {
      await callback(...args);
    }, delay);
  };
}

export { debounce };
