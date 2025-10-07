import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "../../helpers/axios";
import toast from "react-hot-toast";

const GsmarenaScraperModal = ({ isOpen, onClose }) => {
  const [brandUrl, setBrandUrl] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [deviceLinks, setDeviceLinks] = useState([]);
  const [progress, setProgress] = useState({ total: 0, completed: 0, failed: 0 });
  const [items, setItems] = useState([]); // { url, status: 'queued'|'scraping'|'importing'|'done'|'failed', message }
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPauseCountdown, setAutoPauseCountdown] = useState(0);
  const [isAutoPaused, setIsAutoPaused] = useState(false);

  const isPausedRef = useRef(false);
  const isStoppedRef = useRef(false);
  const requestCountRef = useRef(0);
  const autoPauseTimerRef = useRef(null);
  const resumeTimerRef = useRef(null);

  const token = useMemo(() => window.localStorage.getItem("token"), []);

  useEffect(() => {
    if (!isOpen) {
      setBrandUrl("");
      setIsWorking(false);
      setIsPaused(false);
      setIsAutoPaused(false);
      setDeviceLinks([]);
      setProgress({ total: 0, completed: 0, failed: 0 });
      setItems([]);
      setCurrentIndex(0);
      setAutoPauseCountdown(0);
      isPausedRef.current = false;
      isStoppedRef.current = false;
      requestCountRef.current = 0;
      
      // Clear timers
      if (autoPauseTimerRef.current) clearTimeout(autoPauseTimerRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    }
  }, [isOpen]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autoPauseTimerRef.current) clearTimeout(autoPauseTimerRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const updateItemStatus = (url, status, message = "") => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.url === url);
      if (idx === -1) return prev;
      const copy = [...prev];
      copy[idx] = { ...copy[idx], status, message };
      return copy;
    });
  };

  const handleAutoPause = () => {
    setIsAutoPaused(true);
    isPausedRef.current = true;
    toast.success("Auto-paused after 10 requests. Resuming in 1 minute...");
    
    // Set countdown for 1 minute
    let countdown = 60;
    setAutoPauseCountdown(countdown);
    
    const countdownInterval = setInterval(() => {
      countdown--;
      setAutoPauseCountdown(countdown);
      
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        autoResume();
      }
    }, 1000);
    
    // Store interval reference
    resumeTimerRef.current = countdownInterval;
  };

  const autoResume = () => {
    setIsAutoPaused(false);
    isPausedRef.current = false;
    requestCountRef.current = 0;
    setAutoPauseCountdown(0);
    toast.success("Auto-resuming scraping...");
    
    // Continue processing
    if (deviceLinks.length > 0) {
      processLinksSequentially(deviceLinks, currentIndex);
    }
  };

  const fetchDeviceLinks = async () => {
    try {
      setIsWorking(true);
      setIsPaused(false);
      setIsAutoPaused(false);
      isPausedRef.current = false;
      isStoppedRef.current = false;
      requestCountRef.current = 0;
      setItems([]);
      setDeviceLinks([]);
      setProgress({ total: 0, completed: 0, failed: 0 });
      setCurrentIndex(0);
      setAutoPauseCountdown(0);

      const res = await axios.post(
        "/scraper/gsmarena-device-link-list",
        { url: brandUrl },
        { headers: { "Content-Type": "application/json" } }
      );

      const links = Array.isArray(res.data) ? res.data : [];
      if (links.length === 0) {
        toast.error("No device links found from GSMArena URL.");
        setIsWorking(false);
        return;
      }

      setDeviceLinks(links);
      setProgress({ total: links.length, completed: 0, failed: 0 });
      setItems(links.map((link) => ({ url: link, status: "queued", message: "" })));

      // Start sequential processing
      await processLinksSequentially(links);
    } catch (err) {
      console.error("Failed to fetch device links:", err);
      toast.error("Failed to fetch device links");
      setIsWorking(false);
    }
  };

  const pauseScraping = () => {
    setIsPaused(true);
    isPausedRef.current = true;
    toast.success("Scraping paused. Click Resume to continue.");
  };

  const resumeScraping = async () => {
    if (isPaused && deviceLinks.length > 0) {
      setIsPaused(false);
      isPausedRef.current = false;
      isStoppedRef.current = false;
      toast.success("Resuming scraping...");
      // Continue from where we left off
      await processLinksSequentially(deviceLinks, currentIndex);
    }
  };

  const processLinksSequentially = async (links, startIndex = 0) => {
    for (let i = startIndex; i < links.length; i++) {
      // Stop or pause handling
      if (isStoppedRef.current) {
        setCurrentIndex(i);
        return;
      }
      if (isPausedRef.current) {
        setCurrentIndex(i);
        return;
      }

      const link = links[i];
      setCurrentIndex(i);
      
      try {
        updateItemStatus(link, "scraping", "Scraping device page...");
        const scrapeRes = await axios.post(
          "/scraper/scrape-gsmarena",
          { url: link },
          { headers: { "Content-Type": "application/json" } }
        );

        // Expecting the payload to be compatible with /devicesData
        const payload = scrapeRes.data;

        updateItemStatus(link, "importing", "Importing to server...");
        await axios.post(
          "/devicesData",
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        updateItemStatus(link, "done", "Imported successfully");
        setProgress((prev) => ({ ...prev, completed: prev.completed + 1 }));
        
        // Increment request count and check for auto-pause
        requestCountRef.current++;
        if (requestCountRef.current >= 10) {
          handleAutoPause();
          return; // Exit the loop, will resume automatically after 1 minute
        }
        
      } catch (err) {
        console.error("Import failed for", link, err);
        updateItemStatus(link, "failed", err?.response?.data?.message || "Failed");
        setProgress((prev) => ({ ...prev, failed: prev.failed + 1 }));
        
        // Also count failed requests
        requestCountRef.current++;
        if (requestCountRef.current >= 10) {
          handleAutoPause();
          return;
        }
      }
    }
    
    // All done
    if (!isPausedRef.current && !isStoppedRef.current) {
      setIsWorking(false);
      toast.success("All devices processed successfully!");
    }
  };

  const pending = Math.max(progress.total - (progress.completed + progress.failed), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 w-full max-w-3xl max-h-[85vh] overflow-auto border border-slate-200 dark:border-slate-800">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Data Scraper (GSMArena)</h2>
          <button onClick={() => { isStoppedRef.current = true; onClose(); }} className="px-3 py-1 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200">Close</button>
        </div>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">GSMArena brand page URL</label>
        <input
          type="text"
          value={brandUrl}
          onChange={(e) => setBrandUrl(e.target.value)}
          placeholder="https://www.gsmarena.com/xiaomi-phones-80.php"
          className="w-full h-12 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 mb-3"
        />

        <div className="flex gap-3 mb-4">
          {!isWorking ? (
            <button
              disabled={!brandUrl}
              onClick={fetchDeviceLinks}
              className="flex-1 h-11 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium"
            >
              Start Scraping & Import
            </button>
          ) : (
            <>
              {!isPaused && !isAutoPaused ? (
                <button
                  onClick={pauseScraping}
                  className="flex-1 h-11 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium"
                >
                  ⏸️ Pause Scraping
                </button>
              ) : (
                <button
                  onClick={resumeScraping}
                  disabled={isAutoPaused}
                  className="flex-1 h-11 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium"
                >
                  ▶️ Resume Scraping
                </button>
              )}
              <button
                onClick={() => {
                  isStoppedRef.current = true;
                  setIsWorking(false);
                  setIsPaused(false);
                  setIsAutoPaused(false);
                  isPausedRef.current = false;
                  requestCountRef.current = 0;
                  setAutoPauseCountdown(0);
                  toast("Scraping stopped", { icon: "🛑" });
                }}
                className="flex-1 h-11 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                🛑 Stop Scraping
              </button>
            </>
          )}
        </div>

        {/* Auto-pause countdown display */}
        {isAutoPaused && (
          <div className="mb-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
              <span className="text-orange-500">⏰</span>
              <span>Auto-paused after 10 requests. Resuming in {autoPauseCountdown} seconds...</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-4 gap-3 text-sm mb-4">
          <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">Total: {progress.total}</div>
          <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-200">Done: {progress.completed}</div>
          <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200">Queued: {pending}</div>
          <div className="p-3 rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-900 dark:text-rose-200">Failed: {progress.failed}</div>
        </div>

        {/* Request counter */}
        {isWorking && (
          <div className="mb-4 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="text-center text-blue-800 dark:text-blue-200 text-sm">
              Requests this cycle: {requestCountRef.current}/10
            </div>
          </div>
        )}

        {isWorking && (
          <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              {isPaused || isAutoPaused ? (
                <>
                  <span className="text-amber-500">⏸️</span>
                  <span>Scraping paused at position {currentIndex + 1} of {progress.total}</span>
                  {isAutoPaused && <span className="text-orange-500">(Auto-paused)</span>}
                </>
              ) : (
                <>
                  <span className="text-green-500">🔄</span>
                  <span>Currently processing: {currentIndex + 1} of {progress.total}</span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.url} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="text-xs text-slate-600 dark:text-slate-400 break-all">{it.url}</div>
              <div className="text-sm mt-1">
                <span className={
                  it.status === "done" ? "text-emerald-600" :
                  it.status === "failed" ? "text-rose-600" :
                  it.status === "importing" ? "text-indigo-600" :
                  it.status === "scraping" ? "text-amber-600" : "text-slate-600"
                }>
                  {it.status}
                </span>
                {it.message ? <span className="text-slate-500 dark:text-slate-400"> — {it.message}</span> : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GsmarenaScraperModal;


