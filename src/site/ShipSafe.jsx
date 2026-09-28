import { useEffect, useRef, useState } from "react";
import { goTo } from "./hooks";
import { mark } from "./progress";

/*
 * Incident 3 — "Ship it safely". The AI agent's release has three hidden problems.
 * The visitor reviews the diff (click a risky line to fix it), then runs the pipeline:
 * automated security gates catch whatever the review missed.
 */

const FILES = [
    { path: "app/config.py", lines: [
        ["import os"],
        ['DB_HOST = os.environ["DB_HOST"]'],
        ['OPENAI_KEY = "sk-live-9f3c2a7b1e04d5"', "secret", 'OPENAI_KEY = os.environ["OPENAI_KEY"]  # from Azure Key Vault'],
        ["TIMEOUT_S = 30"],
    ] },
    { path: "requirements.txt", lines: [
        ["fastapi==0.115.0"],
        ["langchain==0.0.27", "deps", "langchain==0.3.7  # patched"],
        ["pydantic==2.9.2"],
    ] },
    { path: "infra/storage.tf", lines: [
        ['resource "azurerm_storage_account" "docs" {'],
        ['  name            = "companydocs"'],
        ["  allow_nested_items_to_be_public = true", "iac", "  allow_nested_items_to_be_public = false"],
        ['  min_tls_version = "TLS1_2"'],
        ["}"],
    ] },
];
const ISSUES = {
    secret: ["Hard-coded API key", "Anyone with the code gets the key. Secrets belong in Azure Key Vault."],
    deps: ["Outdated package with known vulnerabilities", "Old versions carry public exploits. Pin patched versions and scan every build."],
    iac: ["Public storage", "The company's documents would be readable from the internet. Private by default, access by role."],
};
const STAGES = [["build", "Build"], ["test", "Unit tests"], ["secret", "Secret scan · gitleaks"], ["deps", "Dependency scan · pip-audit"], ["iac", "IaC scan · Checkov"], ["deploy", "Deploy to Azure"]];

export default function ShipSafe() {
    const [fixed, setFixed] = useState({}), [nope, setNope] = useState(null);
    const [run, setRun] = useState(null), [stage, setStage] = useState(-1), [failAt, setFailAt] = useState(null), [skip, setSkip] = useState(false);
    const byYou = useRef(new Set()), byPipe = useRef(new Set());
    const shipped = stage === STAGES.length && !failAt;
    const done = shipped || skip;

    useEffect(() => { if (shipped) mark("ship", "solved", { score: `${byYou.current.size} found by you, ${byPipe.current.size} by the pipeline` }); else if (skip) mark("ship", "skipped"); }, [shipped, skip]);

    const fix = (id, via) => { (via === "you" ? byYou : byPipe).current.add(id); setFixed(f => ({ ...f, [id]: true })); if (failAt === id) setFailAt(null); };
    const click = (id, key) => { if (run) return; if (id) { if (!fixed[id]) fix(id, "you"); } else { setNope(key); setTimeout(() => setNope(null), 500); } };

    const start = async () => {
        if (run) return;
        setRun(true); setFailAt(null);
        for (let k = 0; k < STAGES.length; k++) {
            setStage(k);
            await new Promise(r => setTimeout(r, 650));
            const id = STAGES[k][0];
            if (ISSUES[id] && !fixed[id]) { setFailAt(id); setRun(false); return; }
        }
        setStage(STAGES.length); setRun(false);
    };

    return (
        <div className="demo-body">
                <div className="inc-kick mono"><span className="inc-clock">Demo 3</span><span>Ship it safely</span><span className="inc-tag">DevSecOps · Azure</span></div>
                <h3 className="pane-title">The agent goes live at 08:00. Its release has 3 hidden problems.</h3>
                <p className="pane-lede sm">Review the code and click any line that looks risky to fix it. Then run the pipeline, and its security gates will catch anything you missed.</p>

                <div className="ss-files">
                    {FILES.map(f => (
                        <div key={f.path} className="ss-file">
                            <span className="ss-path mono">{f.path}</span>
                            <pre>{f.lines.map(([code, id, good], n) => {
                                const key = f.path + n, isFixed = id && fixed[id];
                                return <button key={key} className={`ss-line ${isFixed ? "is-fixed" : ""} ${failAt && failAt === id ? "is-caught" : ""} ${nope === key ? "is-nope" : ""}`} onClick={() => click(id, key)} disabled={!!run || done}>
                                    <span className="ss-ln">{n + 1}</span><code>{isFixed ? good : code}</code>
                                </button>;
                            })}</pre>
                        </div>
                    ))}
                </div>
                {Object.keys(fixed).length > 0 && <ul className="ss-found">{Object.keys(fixed).map(id => <li key={id}><b>✓ {ISSUES[id][0]}</b>{ISSUES[id][1]}{byPipe.current.has(id) && <em className="mono"> · caught by the pipeline</em>}</li>)}</ul>}

                <div className="ss-pipe" aria-live="polite">
                    {STAGES.map(([id, name], k) => <div key={id} className={`ss-stage ${stage > k || shipped ? "is-ok" : stage === k && run ? "is-run" : ""} ${failAt === id ? "is-fail" : ""}`}><i />{name}</div>)}
                </div>
                {failAt && (
                    <div className="bi-ans is-wrong ss-fail">
                        <p className="bi-text">Pipeline stopped: {ISSUES[failAt][0]}.</p>
                        <p className="bi-why">{ISSUES[failAt][1]} The line is marked above. That's why security checks run on every release, not just when someone remembers.</p>
                        <button className="bi-ask" onClick={() => fix(failAt, "pipe")}>Apply the fix</button>
                    </div>
                )}
                {!done && <div className="bi-row"><button className="bi-ask" onClick={start} disabled={!!run || !!failAt}>{run ? "Running…" : stage >= 0 ? "Run again" : "Run the pipeline"}</button><button className="bi-skip mono" onClick={() => setSkip(true)}>Skip — show what this proves</button></div>}

                {done && (
                    <div className="inc-proof">
                        <b>✓ Shipped to production{shipped ? `: ${byYou.current.size} found by you, ${byPipe.current.size} caught by the pipeline` : ""}.</b>
                        <p><span className="mono">In plain words</span>I make sure AI goes live safely: no leaked passwords, no vulnerable parts, no data left open, checked automatically on every release.</p>
                        <p><span className="mono">Under the hood</span>CI/CD on Azure DevOps and GitHub Actions, secrets in Azure Key Vault, dependency and container scanning, Terraform with policy checks (Checkov), least-privilege access and reproducible Docker builds.</p>
                        <div className="dj-proof"><span className="mono">Proof</span><button onClick={() => goTo("work")}>Argus AI · Terraform on Azure Container Apps</button><button onClick={() => goTo("work")}>Digital Twin · CI/CD with GitHub Actions</button></div>
                    </div>
                )}
        </div>
    );
}
