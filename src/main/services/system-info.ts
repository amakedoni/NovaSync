import { execFile } from 'child_process';
import { platform } from 'os';

interface ActiveWindowInfo {
  title: string;
  processName: string;
}

/**
 * Get the title and process name of the currently active window.
 * Uses execFile (not exec) to avoid shell injection.
 * All commands are hardcoded — no user input is ever interpolated.
 */
export async function getActiveWindow(): Promise<ActiveWindowInfo | null> {
  const os = platform();

  try {
    if (os === 'win32') return await getActiveWindowWindows();
    if (os === 'darwin') return await getActiveWindowMacOS();
    return await getActiveWindowLinux();
  } catch {
    return null;
  }
}

function getActiveWindowWindows(): Promise<ActiveWindowInfo | null> {
  return new Promise((resolve) => {
    const psScript = `
      Get-Process |
        Where-Object { $_.MainWindowTitle -ne '' } |
        Select-Object -First 1 MainWindowTitle, ProcessName |
        ConvertTo-Json
    `;

    execFile(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-Command', psScript],
      { timeout: 3000, windowsHide: true },
      (error, stdout) => {
        if (error) { resolve(null); return; }

        try {
          const data = JSON.parse(stdout.trim());
          resolve({
            title: data.MainWindowTitle || '',
            processName: data.ProcessName || '',
          });
        } catch {
          resolve(null);
        }
      }
    );
  });
}

function getActiveWindowMacOS(): Promise<ActiveWindowInfo | null> {
  return new Promise((resolve) => {
    execFile(
      'osascript',
      ['-e', 'tell application "System Events" to get {title, name} of first application process whose frontmost is true'],
      { timeout: 3000 },
      (error, stdout) => {
        if (error) { resolve(null); return; }

        const parts = stdout.trim().split(', ');
        resolve({
          title: parts[0] || '',
          processName: parts[1] || '',
        });
      }
    );
  });
}

function getActiveWindowLinux(): Promise<ActiveWindowInfo | null> {
  return new Promise((resolve) => {
    execFile(
      'xdotool',
      ['getactivewindow', 'getwindowname'],
      { timeout: 3000 },
      (error, stdout) => {
        if (error) { resolve(null); return; }

        resolve({
          title: stdout.trim(),
          processName: '',
        });
      }
    );
  });
}
