import { useState } from "react";

const JOB_TYPES = ["OPEN_URL", "START_TIMER", "PLAY_AUDIO", "OS_SHUTDOWN", "TAKE_SCREENSHOT"];
const INPUT_CONFIG = {
  OPEN_URL: { label: "Target URL", placeholder: "https://github.com" },
  START_TIMER: { label: "Duration (seconds)", placeholder: "300" },
  PLAY_AUDIO: { label: "File Path", placeholder: "/media/alert.mp3" },
  OS_SHUTDOWN: { label: "Delay (seconds)", placeholder: "60" },
  TAKE_SCREENSHOT: { label: "Save Path (.png)", placeholder: "/home/arpit/Desktop/capture.png" },
};

const JobForm = ({ onSchedule }) => {
  const [jobType, setJobType] = useState("OPEN_URL");
  const [target, setTarget] = useState("");
  const [priority, setPriority] = useState(2);
  const [delay, setDelay] = useState(0);

  const isNumericInput = jobType === "START_TIMER";
  const config = INPUT_CONFIG[jobType];
  const showTargetInput = jobType !== "OS_SHUTDOWN";

const buildPayload = () => {
    const delaySeconds = parseInt(delay) || 0;
    switch (jobType) {
      case "TAKE_SCREENSHOT": return JSON.stringify({ save_path: target });
      case "OPEN_URL": {
        // Automatically add https:// if the user forgot it
        let safeUrl = target.trim();
        if (!safeUrl.startsWith("http://") && !safeUrl.startsWith("https://")) {
          safeUrl = "https://" + safeUrl;
        }
        return JSON.stringify({ url: safeUrl });
      }
      case "START_TIMER": return JSON.stringify({ duration_seconds: parseInt(target) });
      case "PLAY_AUDIO": return JSON.stringify({ file_path: target });
      case "OS_SHUTDOWN": return JSON.stringify({ force: true, delay_seconds: delaySeconds });
    }
  };

const handleSubmit = (e) => {
    e.preventDefault();
    if (showTargetInput && !target.trim()) return;
    const delaySeconds = parseInt(delay) || 0;
    
    const newJob = { type: jobType, payload: buildPayload(), priority: parseInt(priority), delaySeconds };
    onSchedule(newJob);
    
    setTarget("");
    setDelay(0);
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-500" />
      <form
        onSubmit={handleSubmit}
        className="relative rounded-xl border border-border bg-card p-6 space-y-5"
      >
        <h2 className="text-lg font-semibold text-foreground">Schedule New Job</h2>

        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">Job Type</label>
          <select
            value={jobType}
            onChange={(e) => { setJobType(e.target.value); setTarget(""); }}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          >
            {JOB_TYPES.map((t) => (
              <option key={t} value={t}>{t.replace("_", " ")}</option>
            ))}
          </select>
        </div>

        {showTargetInput && (
          <div className="space-y-1.5">
            <label className="text-sm text-muted-foreground">{config.label}</label>
            <input
              type={isNumericInput ? "number" : "text"}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder={config.placeholder}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
              min={isNumericInput ? 0 : undefined}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          >
            <option value={1}>High</option>
            <option value={2}>Medium</option>
            <option value={3}>Low</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm text-muted-foreground">Execute After (seconds)</label>
          <input
            type="number"
            value={delay}
            onChange={(e) => setDelay(e.target.value)}
            placeholder="0 (immediately)"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            min={0}
          />
        </div>

        <button
          type="submit"
          className="w-full cursor-pointer rounded-lg bg-primary py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 hover:shadow-lg hover:shadow-primary/20"
        >
          Schedule Task
        </button>
      </form>
    </div>
  );
};

export default JobForm;
