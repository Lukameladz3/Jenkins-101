# Jenkins-101: Playwright tests in Jenkins

A small Playwright test project, set up to run in a Jenkins **Pipeline** job.

```
tests/
  playwright-dev.spec.ts   # checks playwright.dev (title, navigation)
  todo.spec.ts             # adds and completes items in the TodoMVC demo app
playwright.config.ts       # reporters: console + JUnit XML (for Jenkins) + HTML
Jenkinsfile                # runs on any agent that has Node.js (Linux or Windows)
Jenkinsfile.docker         # runs inside the official Playwright Docker image
```

---

## 1. Run the tests locally (optional)

```bash
npm ci
npx playwright install chromium
npx playwright test          # run headless
npx playwright test --headed # watch the browser
npx playwright show-report   # open the HTML report
```

---

## 2. Prepare Jenkins

### 2.1 Plugins
Open **Manage Jenkins → Plugins → Available plugins** and check that these are installed. All except Docker Pipeline come with the "suggested plugins" setup.

| Plugin | Why |
|---|---|
| Pipeline | Runs the `Jenkinsfile` |
| Git | Checks out the repo |
| JUnit | Shows the **Test Result** page and trend graph |
| Docker Pipeline | Only needed if you use `Jenkinsfile.docker` |

### 2.2 Pick one option

**Option A: plain agent (`Jenkinsfile`)**
- Install **Node.js 18 or newer** on the machine that runs Jenkins (or on the agent). Check it with `node --version`.
- Restart Jenkins after installing Node so it sees the new `PATH`.
- **Windows:** nothing else is needed.
- **Linux:** Playwright needs some system libraries. If Jenkins runs as root, the pipeline installs them for you. If it doesn't (the usual case), run this once on the agent as an admin:
  ```bash
  sudo npx playwright install-deps chromium
  ```

**Option B: Docker (`Jenkinsfile.docker`)**, the most reliable choice on Linux
- The agent must be Linux with Docker installed, and the `jenkins` user must be able to run `docker` (`sudo usermod -aG docker jenkins`, then restart Jenkins).
- Install the **Docker Pipeline** plugin.
- You don't need to install Node or browsers. The image `mcr.microsoft.com/playwright:v1.65.1-noble` already has them.

> If Jenkins itself runs in a Docker container on Windows/Mac (e.g. `jenkins/jenkins` image), Option B usually won't work without extra setup (Docker-in-Docker). Use Option A and install Node inside that container, or use a separate agent.

---

## 3. Create the Pipeline job

1. Jenkins dashboard → **New Item**.
2. Name it (e.g. `playwright-tests`), select **Pipeline**, click **OK**.
3. Optional, under **Triggers**: tick **Poll SCM** with schedule `H/5 * * * *` to check for new commits every 5 minutes.
4. Scroll to the **Pipeline** section:
   - **Definition:** `Pipeline script from SCM`
   - **SCM:** `Git`
   - **Repository URL:** `https://github.com/Lukameladz3/Jenkins-101.git`
   - **Credentials:** `- none -` (the repo is public)
   - **Branch Specifier:** `*/main`
   - **Script Path:** `Jenkinsfile` for Option A, or `Jenkinsfile.docker` for Option B
5. Click **Save**.

---

## 4. Run it

1. Open the job and click **Build Now**.
2. Click the build number, then **Console Output**, to watch the run. You should see the stages *Install dependencies → Install browsers → Run tests* and finally `4 passed`.
3. When the build finishes:
   - **Test Result** on the build page shows each test as passed or failed. The job page gets a trend graph after a couple of builds.
   - **Build Artifacts** has `playwright-report/index.html`. Download the `playwright-report` folder and open `index.html` in a browser for the full report, with screenshots and videos of failed tests.

The first build is slower because it downloads npm packages and Chromium (or the Docker image). Later builds reuse them.

### Seeing a failure
To check that failures show up, change a `toHaveTitle(/Playwright/)` assertion to `toHaveTitle(/Nope/)`, then push and rebuild. The build turns red, and **Test Result** shows the failing test with its error message.

---

## 5. Troubleshooting

| Symptom | Fix |
|---|---|
| `'node' is not recognized` / `node: not found` | Node isn't on the PATH of the Jenkins service. Install it and restart Jenkins, or install the **NodeJS** plugin and add `tools { nodejs 'node20' }` to the pipeline. |
| `Host system is missing dependencies to run browsers` | Linux only. Run `sudo npx playwright install-deps chromium` once on the agent, or use Option B. |
| `npm ci` fails: "package-lock.json not found" | Commit `package-lock.json`. |
| `docker: not found` / `permission denied ... docker.sock` | Install Docker on the agent and add the `jenkins` user to the `docker` group. |
| `Invalid agent type "docker"` | Install the **Docker Pipeline** plugin. |
| Tests time out | The agent can't reach the internet (proxy or firewall). The tests open `playwright.dev` and `demo.playwright.dev`. |
| Executable doesn't exist (Docker) | The image tag in `Jenkinsfile.docker` must match the `@playwright/test` version in `package.json`. |

### Upgrading Playwright
```bash
npm install -D @playwright/test@<new-version>
```
Then update the image tag in `Jenkinsfile.docker` to `v<new-version>-noble`.
