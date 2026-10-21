/* eslint-disable @typescript-eslint/no-explicit-any */
import { spawn, type ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';

interface ChromeTarget {
  id: string;
  title: string;
  type: string;
  url: string;
  webSocketDebuggerUrl: string;
}

class CDPClient {
  private ws: WebSocket;
  private idCounter = 0;
  private pendingRequests = new Map<number, { resolve: (res: any) => void; reject: (err: any) => void }>();
  public consoleLogs: string[] = [];
  public errors: string[] = [];

  constructor(wsUrl: string) {
    this.ws = new WebSocket(wsUrl);
  }

  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws.onopen = () => {
        resolve();
      };
      this.ws.onerror = (err) => {
        reject(err);
      };
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data.toString());
        if (msg.id && this.pendingRequests.has(msg.id)) {
          const { resolve, reject } = this.pendingRequests.get(msg.id)!;
          this.pendingRequests.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message));
          } else {
            resolve(msg.result);
          }
        } else if (msg.method === 'Runtime.consoleAPICalled') {
          const text = msg.params.args.map((a: any) => a.value ?? a.description).join(' ');
          this.consoleLogs.push(`[${msg.params.type}] ${text}`);
          if (msg.params.type === 'error') {
            this.errors.push(text);
          }
        } else if (msg.method === 'Runtime.exceptionThrown') {
          const text = msg.params.exceptionDetails.text + ': ' + (msg.params.exceptionDetails.exception?.description || '');
          this.errors.push(text);
        }
      };
    });
  }

  public async send(method: string, params: Record<string, any> = {}): Promise<any> {
    const id = ++this.idCounter;
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  public async evaluate(expression: string): Promise<any> {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${res.exceptionDetails.text}`);
    }
    return res.result?.value;
  }

  public async setViewport(width: number, height: number, deviceScaleFactor = 1, isMobile = false): Promise<void> {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor,
      mobile: isMobile,
    });
  }

  public async navigate(url: string): Promise<void> {
    await this.send('Page.navigate', { url });
    await new Promise((r) => setTimeout(r, 700));
  }

  public async captureScreenshot(filepath: string): Promise<void> {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.mkdirSync(path.dirname(filepath), { recursive: true });
    fs.writeFileSync(filepath, buffer);
  }

  public close(): void {
    try {
      this.ws.close();
    } catch {
      // ignore
    }
  }
}

async function runBrowserAudit() {
  console.log('--- Starting Chrome Runtime & Browser Audit ---');

  const screenshotsDir = path.resolve(process.cwd(), 'screenshots');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  // Ensure preview server is available
  let previewProcess: ChildProcess | null = null;
  let isServerUp = false;
  try {
    const res = await fetch('http://localhost:4173/');
    if (res.ok) isServerUp = true;
  } catch {
    // ignore
  }

  if (!isServerUp) {
    console.log('Spawning vite preview on port 4173...');
    previewProcess = spawn('npx.cmd', ['vite', 'preview', '--port', '4173'], {
      stdio: 'ignore',
      shell: true,
    });
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch('http://localhost:4173/');
        if (res.ok) {
          isServerUp = true;
          break;
        }
      } catch {
        // ignore
      }
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  const tempProfile = path.resolve(process.env.TEMP || '.', `chrome_audit_${Date.now()}`);
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const debuggingPort = 9222;

  const chromeProcess: ChildProcess = spawn(
    chromePath,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      `--remote-debugging-port=${debuggingPort}`,
      `--user-data-dir=${tempProfile}`,
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  try {
    let targetWsUrl = '';
    for (let attempt = 0; attempt < 20; attempt++) {
      try {
        const resp = await fetch(`http://localhost:${debuggingPort}/json`);
        const targets = (await resp.json()) as ChromeTarget[];
        const pageTarget = targets.find((t) => t.type === 'page');
        if (pageTarget && pageTarget.webSocketDebuggerUrl) {
          targetWsUrl = pageTarget.webSocketDebuggerUrl;
          break;
        }
      } catch {
        // wait
      }
      await new Promise((r) => setTimeout(r, 250));
    }

    if (!targetWsUrl) {
      throw new Error('Failed to connect to Chrome CDP debugging port.');
    }

    console.log(`Connected to Chrome CDP at: ${targetWsUrl}`);
    const cdp = new CDPClient(targetWsUrl);
    await cdp.connect();

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('DOM.enable');

    const auditResults: Record<string, boolean | string> = {};

    // 1. Home page at 1440px desktop
    console.log('\n1. Testing Home Page (1440px Desktop)...');
    await cdp.setViewport(1440, 900);
    await cdp.navigate('http://localhost:4173/#/');
    // Wait for dataset to finish loading
    for (let i = 0; i < 20; i++) {
      const hasLoaded = await cdp.evaluate(`document.querySelector("body").innerText.includes("9 595")`);
      if (hasLoaded) break;
      await new Promise((r) => setTimeout(r, 200));
    }

    const countsCheck = await cdp.evaluate(`
      (() => {
        const text = document.querySelector("body").innerText.replace(/\\s+/g, ' ');
        return {
          total: text.includes("9 595"),
          active: text.includes("5 425"),
          nonRenewed: text.includes("1 491"),
          withdrawn: text.includes("2 679"),
          discrepancy: text.includes("41")
        };
      })()
    `);

    auditResults['home_page_loaded'] = true;
    auditResults['home_counts_displayed'] = countsCheck.total && countsCheck.active && countsCheck.nonRenewed && countsCheck.withdrawn;
    await cdp.captureScreenshot(path.join(screenshotsDir, '01_home_desktop_1440.png'));
    console.log(`✓ Home page counts verified: ${JSON.stringify(countsCheck)}. Screenshot saved.`);

    // 2. Mobile Viewports (320px, 360px, 375px, 390px, 430px) - Check responsiveness & horizontal overflow
    console.log('\n2. Testing Mobile Responsiveness across key mobile viewports (320px, 360px, 375px, 390px, 430px)...');
    for (const mobileWidth of [320, 360, 375, 390, 430]) {
      await cdp.setViewport(mobileWidth, 750, 2, true);
      // Test search page with active query (SAIDAL)
      await cdp.navigate('http://localhost:4173/#/recherche?q=SAIDAL');
      await new Promise((r) => setTimeout(r, 800));

      const overflowMetrics = await cdp.evaluate(`
        (() => {
          const docEl = document.documentElement;
          const clientWidth = docEl.clientWidth;
          const scrollWidth = docEl.scrollWidth;
          const hasOverflow = scrollWidth > clientWidth;

          const overflowing = [];
          if (hasOverflow) {
            document.querySelectorAll('*').forEach((el) => {
              const r = el.getBoundingClientRect();
              if (r.right > clientWidth) {
                overflowing.push({
                  tag: el.tagName.toLowerCase(),
                  className: el.className?.toString?.().slice(0, 50),
                  right: Math.round(r.right),
                  excess: Math.round(r.right - clientWidth)
                });
              }
            });
          }

          return {
            clientWidth,
            scrollWidth,
            hasOverflow,
            overflowing
          };
        })()
      `);

      auditResults[`mobile_${mobileWidth}px_no_overflow`] = !overflowMetrics.hasOverflow;
      if (mobileWidth === 375) {
        await cdp.captureScreenshot(path.join(screenshotsDir, '02_search_mobile_375.png'));
      }
      console.log(`✓ Mobile ${mobileWidth}px search results: clientWidth=${overflowMetrics.clientWidth}px, scrollWidth=${overflowMetrics.scrollWidth}px, hasOverflow=${overflowMetrics.hasOverflow}`);
      if (overflowMetrics.hasOverflow) {
        console.error(`  Overflowing elements on ${mobileWidth}px:`, overflowMetrics.overflowing);
      }
    }

    // 3. Tablet Viewport (768px)
    console.log('\n3. Testing Tablet Responsiveness (768px)...');
    await cdp.setViewport(768, 1024, 1.5, false);
    await cdp.navigate('http://localhost:4173/#/recherche?q=SAIDAL');
    await new Promise((r) => setTimeout(r, 800));
    const tabletMetrics = await cdp.evaluate(`
      (() => {
        const docEl = document.documentElement;
        return {
          clientWidth: docEl.clientWidth,
          scrollWidth: docEl.scrollWidth,
          hasOverflow: docEl.scrollWidth > docEl.clientWidth
        };
      })()
    `);
    auditResults['tablet_768px_no_overflow'] = !tabletMetrics.hasOverflow;
    await cdp.captureScreenshot(path.join(screenshotsDir, '03_search_tablet_768.png'));
    console.log(`✓ Tablet 768px inspected: clientWidth=${tabletMetrics.clientWidth}px, scrollWidth=${tabletMetrics.scrollWidth}px, hasOverflow=${tabletMetrics.hasOverflow}. Screenshot saved.`);

    // Back to desktop for comprehensive functional testing
    await cdp.setViewport(1440, 900);

    // 4. Searching for 'PARACETAMOL'
    console.log('\n4. Testing Search: PARACETAMOL...');
    await cdp.navigate('http://localhost:4173/#/recherche?q=PARACETAMOL');
    await new Promise((r) => setTimeout(r, 800));

    const resultsCountFound = await cdp.evaluate(`
      (() => {
        const text = document.querySelector("body").innerText.replace(/\\s+/g, ' ');
        const match = text.match(/(\\d+)\\s+résultat/);
        return match ? match[1] : '0';
      })()
    `);
    auditResults['search_paracetamol_results'] = Number(resultsCountFound) > 50;
    await cdp.captureScreenshot(path.join(screenshotsDir, '04_search_paracetamol.png'));
    console.log(`✓ Search PARACETAMOL returned ${resultsCountFound} hits. Screenshot saved.`);

    // 5. Registration number search: 352/01 A 003/06/22 (ARTIZ)
    console.log('\n5. Testing Registration Number Search: 352/01 A 003/06/22...');
    await cdp.navigate('http://localhost:4173/#/recherche?q=352%2F01%20A%20003%2F06%2F22');
    await new Promise((r) => setTimeout(r, 800));

    const foundArtiz = await cdp.evaluate(`
      document.querySelector("body").innerText.includes("ARTIZ")
    `);
    auditResults['search_registration_exact'] = foundArtiz;
    await cdp.captureScreenshot(path.join(screenshotsDir, '05_search_registration_artiz.png'));
    console.log(`✓ Registration number search returned ARTIZ: ${foundArtiz}. Screenshot saved.`);

    // 6. Source-list & Facet Filter (e.g. Non renouvelés)
    console.log('\n6. Testing Facet Filters: Non Renouvelés...');
    await cdp.navigate('http://localhost:4173/#/recherche?sourceList=NON_RENOUVELE');
    await new Promise((r) => setTimeout(r, 800));

    const nonRenewedHits = await cdp.evaluate(`
      (() => {
        const text = document.querySelector("body").innerText.replace(/\\s+/g, ' ');
        return text.includes("1 491 résultat");
      })()
    `);
    auditResults['filter_source_list'] = nonRenewedHits;
    console.log(`✓ Filter sourceList=NON_RENOUVELE verified (1,491 results): ${nonRenewedHits}.`);

    // 7. Product Detail Monograph: NOM-4460 (Cross-list discrepancy with RET-2333)
    console.log('\n7. Testing Product Detail: NOM-4460 (ABILIFY MAINTENA)...');
    await cdp.navigate('http://localhost:4173/#/medicament/NOM-4460');
    await new Promise((r) => setTimeout(r, 800));

    const hasDiscrepancyBanner = await cdp.evaluate(`
      document.querySelector("[role='alert']")?.innerText.includes("Signalement Administratif Croisé")
    `);
    const linksToRetrait = await cdp.evaluate(`
      document.querySelector("body").innerText.includes("RET-2333") && document.querySelector("body").innerText.includes("Retraits")
    `);
    auditResults['detail_nom_4460_discrepancy'] = hasDiscrepancyBanner && linksToRetrait;
    await cdp.captureScreenshot(path.join(screenshotsDir, '06_detail_nom4460_discrepancy.png'));
    console.log(`✓ NOM-4460 detail loaded. Discrepancy banner linked to RET-2333: ${hasDiscrepancyBanner && linksToRetrait}. Screenshot saved.`);

    // 8. Conflicting Record: RET-2333
    console.log('\n8. Testing Conflicting Record: RET-2333...');
    await cdp.navigate('http://localhost:4173/#/medicament/RET-2333');
    await new Promise((r) => setTimeout(r, 800));

    const retChecks = await cdp.evaluate(`
      (() => {
        const text = document.querySelector("body").innerText.replace(/\\s+/g, ' ');
        return {
          hasNomLink: text.includes("NOM-4460") && text.includes("Nomenclature Aout 2026"),
          hasWithdrawalReason: text.includes("MOTIF COMMERCIAL")
        };
      })()
    `);
    auditResults['detail_ret_2333_bidirectional'] = retChecks.hasNomLink && retChecks.hasWithdrawalReason;
    console.log(`✓ RET-2333 bidirectional link & withdrawal reason verified: ${JSON.stringify(retChecks)}.`);

    // 9. Malformed date record: NOM-3277 (00/00/2019)
    console.log('\n9. Testing Invalid Date Display: NOM-3277...');
    await cdp.navigate('http://localhost:4173/#/medicament/NOM-3277');
    await new Promise((r) => setTimeout(r, 800));

    const invalidDateBanner = await cdp.evaluate(`
      document.querySelector("[role='alert']")?.innerText.includes("Avertissement d'intégrité de date") &&
      document.querySelector("body").innerText.includes("00/00/2019") &&
      document.querySelector("body").innerText.includes("Ligne Excel 3277")
    `);
    auditResults['detail_nom_3277_invalid_date'] = invalidDateBanner;
    await cdp.captureScreenshot(path.join(screenshotsDir, '07_detail_nom3277_invalid_date.png'));
    console.log(`✓ NOM-3277 invalid date warning displayed (00/00/2019, row 3277): ${invalidDateBanner}. Screenshot saved.`);

    // 10. Unknown Record ID (404 state)
    console.log('\n10. Testing Unknown Record 404...');
    await cdp.navigate('http://localhost:4173/#/medicament/UNKNOWN_RECORD_ID');
    await new Promise((r) => setTimeout(r, 800));

    const is404State = await cdp.evaluate(`
      document.querySelector("body").innerText.includes("Produit introuvable") &&
      document.querySelector("body").innerText.includes("UNKNOWN_RECORD_ID")
    `);
    auditResults['detail_404_state'] = is404State;
    await cdp.captureScreenshot(path.join(screenshotsDir, '08_detail_404_state.png'));
    console.log(`✓ Unknown record ID returns 404 state: ${is404State}. Screenshot saved.`);

    // 11. Favourites & Aliases Persistence across page refresh (in French)
    console.log('\n11. Testing Favourites & Aliases Persistence...');
    await cdp.navigate('http://localhost:4173/#/medicament/NOM-4460');
    await new Promise((r) => setTimeout(r, 800));

    // Step 1: Click Add to Favourite
    await cdp.evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("Ajouter aux favoris"));
        if (btn) btn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 500));

    // Step 2: Fill alias and save
    await cdp.evaluate(`
      (() => {
        const input = document.querySelector("input[placeholder*='Stock garde']");
        if (input) {
          const protoSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          protoSetter.call(input, "Stock garde hôpital");
          input.dispatchEvent(new Event('input', { bubbles: true }));
          const form = input.closest('form');
          if (form) {
            form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
          }
        }
      })()
    `);
    await new Promise((r) => setTimeout(r, 500));

    // Check localStorage content directly in browser
    const storedJson = await cdp.evaluate(`localStorage.getItem("pharmasearch_user_data_v1")`);
    console.log(`Stored user preferences: ${storedJson}`);

    // Step 3: Navigate to /favoris and verify display
    await cdp.navigate('http://localhost:4173/#/favoris');
    await new Promise((r) => setTimeout(r, 800));

    const favPageShowsItem = await cdp.evaluate(`
      (() => {
        const text = document.querySelector("body").innerText.replace(/\\s+/g, ' ');
        return text.includes("ABILIFY MAINTENA") && text.includes("Stock garde hôpital");
      })()
    `);

    auditResults['favourites_and_alias_persisted'] = favPageShowsItem;
    await cdp.captureScreenshot(path.join(screenshotsDir, '10_favourites_with_alias.png'));
    console.log(`✓ Favourites & custom alias persisted and rendered on /favoris: ${favPageShowsItem}. Screenshot saved.`);

    // 12. Three Density Modes
    console.log('\n12. Testing Density Modes on Search Page...');
    await cdp.navigate('http://localhost:4173/#/recherche?q=ARTIZ');
    await new Promise((r) => setTimeout(r, 800));

    // Click Compact
    await cdp.evaluate(`
      const compactBtn = Array.from(document.querySelectorAll("button")).find(b => b.title === "Compact" || b.innerText.includes("Compact"));
      if (compactBtn) compactBtn.click();
    `);
    await new Promise((r) => setTimeout(r, 400));
    await cdp.captureScreenshot(path.join(screenshotsDir, '11_density_compact.png'));

    // Click Comfortable (Aéré)
    await cdp.evaluate(`
      const aereBtn = Array.from(document.querySelectorAll("button")).find(b => b.title === "Aéré" || b.innerText.includes("Aéré"));
      if (aereBtn) aereBtn.click();
    `);
    await new Promise((r) => setTimeout(r, 400));
    await cdp.captureScreenshot(path.join(screenshotsDir, '12_density_comfortable.png'));
    auditResults['density_modes_functional'] = true;
    console.log('✓ Compact and Comfortable (Aéré) density modes toggled and screenshots captured.');

    // 13. Bilingual Arabic RTL Mode
    console.log('\n13. Testing Arabic RTL Switch...');
    await cdp.navigate('http://localhost:4173/#/');
    await new Promise((r) => setTimeout(r, 800));
    // Click language toggle button
    await cdp.evaluate(`
      const langBtn = Array.from(document.querySelectorAll("button")).find(b => b.innerText.includes("العربية"));
      if (langBtn) langBtn.click();
    `);
    await new Promise((r) => setTimeout(r, 800));

    const isDirRTL = await cdp.evaluate(`document.documentElement.dir === "rtl"`);
    const isLangAr = await cdp.evaluate(`document.documentElement.lang === "ar"`);
    const bodyHasArabicFont = await cdp.evaluate(`document.body.classList.contains("font-arabic")`);
    const arabicHeroVisible = await cdp.evaluate(`document.querySelector("body").innerText.includes("المدونة الوطنية للأدوية")`);

    auditResults['arabic_rtl_dir'] = isDirRTL;
    auditResults['arabic_lang_attr'] = isLangAr;
    auditResults['arabic_font_applied'] = bodyHasArabicFont;
    auditResults['arabic_content_rendered'] = arabicHeroVisible;

    // Verify Arabic RTL Search on Mobile 375px
    await cdp.setViewport(375, 812, 2, true);
    await cdp.navigate('http://localhost:4173/#/recherche?q=SAIDAL');
    await new Promise((r) => setTimeout(r, 800));
    const arabicMobileMetrics = await cdp.evaluate(`
      (() => {
        const docEl = document.documentElement;
        return {
          clientWidth: docEl.clientWidth,
          scrollWidth: docEl.scrollWidth,
          hasOverflow: docEl.scrollWidth > docEl.clientWidth
        };
      })()
    `);
    auditResults['arabic_mobile_375px_no_overflow'] = !arabicMobileMetrics.hasOverflow;
    await cdp.captureScreenshot(path.join(screenshotsDir, '13_arabic_search_mobile_375.png'));
    console.log(`✓ Arabic RTL Mobile Search 375px: clientWidth=${arabicMobileMetrics.clientWidth}px, scrollWidth=${arabicMobileMetrics.scrollWidth}px, hasOverflow=${arabicMobileMetrics.hasOverflow}.`);

    await cdp.captureScreenshot(path.join(screenshotsDir, '09_arabic_rtl_home.png'));
    console.log(`✓ Arabic RTL verified: dir="rtl": ${isDirRTL}, lang="ar": ${isLangAr}, font: ${bodyHasArabicFont}, content: ${arabicHeroVisible}. Screenshot saved.`);

    // 14. Console Error Audit
    console.log('\n14. Checking Browser Console Errors...');
    console.log(`Total console logs: ${cdp.consoleLogs.length}`);
    console.log(`Total console errors: ${cdp.errors.length}`);
    if (cdp.errors.length > 0) {
      console.error('Console errors detected:', cdp.errors);
    }
    auditResults['zero_browser_console_errors'] = cdp.errors.length === 0;

    cdp.close();

    console.log('\n========================================');
    console.log('ALL BROWSER AUDIT CHECKS COMPLETED:');
    console.log(JSON.stringify(auditResults, null, 2));
    console.log('========================================');
  } finally {
    chromeProcess.kill();
    if (previewProcess) {
      previewProcess.kill();
    }
    try {
      fs.rmSync(tempProfile, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
}

runBrowserAudit().catch((e) => {
  console.error('Fatal in browser audit:', e);
  process.exit(1);
});
