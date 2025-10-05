  export const formatTime = (s: number) => {
    // defensively handle invalid numbers
    if (!Number.isFinite(s) || Number.isNaN(s) || s <= 0) return "0:00";
    const hrs = Math.floor(s / 3600);
    const mins = Math.floor((s % 3600) / 60);
    const secs = Math.floor(s % 60);
    const two = (n: number) => n.toString().padStart(2, "0");
    if (hrs > 0) return `${hrs}:${two(mins)}:${two(secs)}`;
    return `${mins}:${two(secs)}`;
  };